'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const USER_ID = 'user-uuid-0001-0000-000000000001';

function makeSessionBody(overrides = {}) {
  return {
    session: {
      sessionRef:       'sess-uuid-0001',
      startedAt:        '2026-04-24T10:00:00.000Z',
      endedAt:          '2026-04-24T11:30:00.000Z',
      durationMinutes:  90,
      engagementScore:  0.85,
      topics:           ['rw1', 'math'],
      performanceDelta: 30,
      context:          'vector_assessment',
      ...overrides,
    },
  };
}

function makeEvent({ method = 'POST', jwt = 'valid.jwt.token', body = null } = {}) {
  return {
    httpMethod: method,
    headers: jwt ? { authorization: `Bearer ${jwt}` } : {},
    body: body !== null ? JSON.stringify(body) : JSON.stringify(makeSessionBody()),
  };
}

function loadHandler({ fetchResponse = null, sdkSessionMock = null } = {}) {
  global.fetch = async () => ({
    ok:     fetchResponse ? fetchResponse.ok !== false : true,
    status: fetchResponse ? (fetchResponse.status ?? 200) : 200,
    json:   async () => fetchResponse ? (fetchResponse.body ?? { id: USER_ID, email: 'test@test.com' }) : { id: USER_ID, email: 'test@test.com' },
    text:   async () => '',
  });

  process.env.SUPABASE_URL               = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY          = 'test-anon-key';
  process.env.LIMB_KEY_VECTOR            = 'test-limb-key';
  process.env.SENECA_SDK_GATEWAY_URL     = 'https://test-gateway.netlify.app/.netlify/functions/seneca-sdk-gateway';

  for (const key of Object.keys(require.cache)) {
    if (
      key.includes('vector-ingest-assessment-session') ||
      key.includes('_lib/auth') ||
      key.includes('_lib/errors') ||
      key.includes('_lib/translator')
    ) {
      delete require.cache[key];
    }
  }

  const sdkClientPath = require.resolve(
    '../../netlify/functions/_lib/sdkClient'
  );
  require.cache[sdkClientPath] = {
    id: sdkClientPath,
    filename: sdkClientPath,
    loaded: true,
    exports: {
      ingest: {
        sessionSignal: sdkSessionMock || (async ({ limbUserId, session }) => ({
          ok: true,
          sessionId: 'sdk-session-id-001',
        })),
      },
      query: {},
    },
  };

  return require('../../netlify/functions/vector-ingest-assessment-session');
}

describe('vector-ingest-assessment-session', () => {
  it('happy path: valid JWT + valid session → 200 with sessionId', async () => {
    const handler = loadHandler();
    const res = await handler.handler(makeEvent());
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 200);
    assert.equal(body.ok, true);
    assert.equal(body.sessionId, 'sdk-session-id-001');
  });

  it('missing session in body → 400 VALIDATION', async () => {
    const handler = loadHandler();
    const res = await handler.handler(makeEvent({ body: {} }));
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION');
  });

  it('session is not an object → 400 VALIDATION', async () => {
    const handler = loadHandler();
    const res = await handler.handler(makeEvent({ body: { session: 'bad' } }));
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION');
  });

  it('translator throws VALIDATION (missing required field) → 400', async () => {
    const handler = loadHandler();
    const badSession = makeSessionBody();
    delete badSession.session.sessionRef;
    const res = await handler.handler(makeEvent({ body: badSession }));
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION');
  });

  it('SDK throws NOT_FOUND → 412', async () => {
    const err = new Error('no bridge');
    err.code = 'NOT_FOUND';
    const handler = loadHandler({
      sdkSessionMock: async () => { throw err; },
    });
    const res = await handler.handler(makeEvent());
    assert.equal(res.statusCode, 412);
  });

  it('SDK throws unexpected error → 500', async () => {
    const handler = loadHandler({
      sdkSessionMock: async () => { throw new Error('unknown failure'); },
    });
    const res = await handler.handler(makeEvent());
    assert.equal(res.statusCode, 500);
  });

  it('non-POST method → 405', async () => {
    const handler = loadHandler();
    const res = await handler.handler(makeEvent({ method: 'GET' }));
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 405);
    assert.equal(body.error.code, 'METHOD_NOT_ALLOWED');
  });
});
