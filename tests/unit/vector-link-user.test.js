'use strict';

/**
 * Tests for vector-link-user.js.
 * Mocks: global.fetch (for auth.js JWT validation), _lib/sdkClient
 * (for ingest.linkUser). No real network calls.
 */

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const VALID_UUID  = '419a3206-eae5-4a7a-8e07-f7c50318754c';
const USER_ID     = 'user-uuid-0001-0000-000000000001';
const USER_EMAIL  = 'alice@example.com';
const SENECA_UUID = 'seneca-000-0000-0000-000000000001';

function makeEvent({ method = 'POST', token = VALID_UUID, jwt = 'valid.jwt.token' } = {}) {
  return {
    httpMethod: method,
    headers: jwt ? { authorization: `Bearer ${jwt}` } : {},
    body: JSON.stringify({ senecaLinkToken: token }),
  };
}

/**
 * Load a fresh handler with controlled mocks.
 * fetchResponse controls Supabase /auth/v1/user reply.
 * sdkMock controls what ingest.linkUser returns/throws.
 */
function loadHandler({ fetchResponse, sdkMock }) {
  // Mock global fetch for auth.js
  global.fetch = async () => ({
    ok:     fetchResponse.ok !== false,
    status: fetchResponse.status ?? 200,
    json:   async () => fetchResponse.body ?? {},
    text:   async () => '',
  });

  process.env.SUPABASE_URL      = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.LIMB_KEY_VECTOR   = 'test-limb-key';
  process.env.SENECA_SDK_GATEWAY_URL = 'https://test-gateway.netlify.app/.netlify/functions/seneca-sdk-gateway';

  // Bust cache for handler + its deps (but NOT sdkClient — we replace it below)
  for (const key of Object.keys(require.cache)) {
    if (
      key.includes('vector-link-user') ||
      key.includes('_lib/auth') ||
      key.includes('_lib/errors')
    ) {
      delete require.cache[key];
    }
  }

  // Inject mock sdkClient directly into require cache
  const sdkClientPath = require.resolve(
    '../../netlify/functions/_lib/sdkClient',
  );
  require.cache[sdkClientPath] = {
    id: sdkClientPath,
    filename: sdkClientPath,
    loaded: true,
    exports: { ingest: { linkUser: sdkMock } },
  };

  return require('../../netlify/functions/vector-link-user').handler;
}

const authOk = { ok: true, body: { id: USER_ID, email: USER_EMAIL } };

describe('vector-link-user', () => {

  it('returns 200 with senecaUserId and linkedAt on success', async () => {
    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => ({ senecaUserId: SENECA_UUID, linkedAt: '2026-04-24T00:00:00Z' }),
    });

    const result = await handler(makeEvent());
    assert.equal(result.statusCode, 200);
    const body = JSON.parse(result.body);
    assert.equal(body.ok, true);
    assert.equal(body.senecaUserId, SENECA_UUID);
    assert.ok(body.linkedAt);
  });

  it('returns 401 when Authorization header is missing', async () => {
    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => { throw new Error('should not be called'); },
    });

    const result = await handler(makeEvent({ jwt: null }));
    assert.equal(result.statusCode, 401);
    assert.equal(JSON.parse(result.body).error.code, 'UNAUTHORIZED');
  });

  it('returns 401 when JWT is rejected by Supabase', async () => {
    const handler = loadHandler({
      fetchResponse: { ok: false, status: 401, body: {} },
      sdkMock: async () => { throw new Error('should not be called'); },
    });

    const result = await handler(makeEvent());
    assert.equal(result.statusCode, 401);
    assert.equal(JSON.parse(result.body).error.code, 'UNAUTHORIZED');
  });

  it('returns 400 when senecaLinkToken is missing from body', async () => {
    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => { throw new Error('should not be called'); },
    });

    const result = await handler(makeEvent({ token: '' }));
    assert.equal(result.statusCode, 400);
    assert.equal(JSON.parse(result.body).error.code, 'VALIDATION');
  });

  it('returns 400 when senecaLinkToken is not a UUID', async () => {
    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => { throw new Error('should not be called'); },
    });

    const result = await handler(makeEvent({ token: 'not-a-uuid' }));
    assert.equal(result.statusCode, 400);
    assert.equal(JSON.parse(result.body).error.code, 'VALIDATION');
  });

  it('returns 403 IDENTITY_MISMATCH when SDK throws IdentityMismatchError', async () => {
    const err = new Error('identity mismatch');
    err.code = 'IDENTITY_MISMATCH';

    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => { throw err; },
    });

    const result = await handler(makeEvent());
    assert.equal(result.statusCode, 403);
    assert.equal(JSON.parse(result.body).error.code, 'IDENTITY_MISMATCH');
  });

  it('returns 409 BRIDGE_EXISTS when SDK throws ConflictError', async () => {
    const err = new Error('bridge conflict');
    err.code = 'BRIDGE_EXISTS';

    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => { throw err; },
    });

    const result = await handler(makeEvent());
    assert.equal(result.statusCode, 409);
    assert.equal(JSON.parse(result.body).error.code, 'BRIDGE_EXISTS');
  });

  it('returns 500 INTERNAL on unexpected SDK error', async () => {
    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => { throw new Error('something exploded'); },
    });

    const result = await handler(makeEvent());
    assert.equal(result.statusCode, 500);
    assert.equal(JSON.parse(result.body).error.code, 'INTERNAL');
  });

});
