'use strict';

/**
 * Tests for vector-check-bridge.js.
 * Mocks global.fetch for auth.js, injects mock sdkClient.
 */

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const USER_ID = 'user-uuid-0002-0000-000000000002';

function makeEvent({ method = 'GET', jwt = 'valid.jwt.token' } = {}) {
  return {
    httpMethod: method,
    headers: jwt ? { authorization: `Bearer ${jwt}` } : {},
    body: '',
  };
}

function loadHandler({ fetchResponse, sdkMock }) {
  global.fetch = async () => ({
    ok:     fetchResponse.ok !== false,
    status: fetchResponse.status ?? 200,
    json:   async () => fetchResponse.body ?? {},
    text:   async () => '',
  });

  process.env.SUPABASE_URL           = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY      = 'test-anon-key';
  process.env.LIMB_KEY_VECTOR        = 'test-limb-key';
  process.env.SENECA_SDK_GATEWAY_URL = 'https://test-gateway.netlify.app/.netlify/functions/seneca-sdk-gateway';

  for (const key of Object.keys(require.cache)) {
    if (
      key.includes('vector-check-bridge') ||
      key.includes('_lib/auth') ||
      key.includes('_lib/errors')
    ) {
      delete require.cache[key];
    }
  }

  const sdkClientPath = require.resolve(
    '../../netlify/functions/_lib/sdkClient',
  );
  require.cache[sdkClientPath] = {
    id: sdkClientPath,
    filename: sdkClientPath,
    loaded: true,
    exports: { query: { getUserModel: sdkMock } },
  };

  return require('../../netlify/functions/vector-check-bridge').handler;
}

const authOk = { ok: true, body: { id: USER_ID, email: 'alice@example.com' } };

describe('vector-check-bridge', () => {

  it('returns 200 { hasBridge: true } when SDK returns a user model', async () => {
    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => ({
        senecaUserId: 'seneca-1',
        phase: 1,
        agtOrientation: 0,
        agtConfidence: 0,
        baselineDirective: null,
        totalSessions: 0,
        language: 'en',
        activeMemories: [],
      }),
    });

    const result = await handler(makeEvent());
    assert.equal(result.statusCode, 200);
    assert.equal(JSON.parse(result.body).hasBridge, true);
  });

  it('returns 200 { hasBridge: false } when SDK throws NOT_FOUND', async () => {
    const err = new Error('no bridge');
    err.code = 'NOT_FOUND';

    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => { throw err; },
    });

    const result = await handler(makeEvent());
    assert.equal(result.statusCode, 200);
    assert.equal(JSON.parse(result.body).hasBridge, false);
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

  it('returns 500 INTERNAL on unexpected SDK error', async () => {
    const handler = loadHandler({
      fetchResponse: authOk,
      sdkMock: async () => { throw new Error('network blew up'); },
    });

    const result = await handler(makeEvent());
    assert.equal(result.statusCode, 500);
    assert.equal(JSON.parse(result.body).error.code, 'INTERNAL');
  });

});
