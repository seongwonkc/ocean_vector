'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const USER_ID = 'user-uuid-0001-0000-000000000001';
const SESSION_REF = 'sess-uuid-0001-0000-000000000001';

function makeAttempt(overrides = {}) {
  return {
    questionId:        'rw1_001',
    isCorrect:         true,
    timeSpentSeconds:  45,
    wasFlagged:        false,
    numberOfChanges:   0,
    positionInSession: 1,
    skippedFirstTime:  false,
    ...overrides,
  };
}

function makeAttempts(count) {
  return Array.from({ length: count }, (_, i) =>
    makeAttempt({ questionId: `q_${String(i+1).padStart(3,'0')}`, positionInSession: i + 1 })
  );
}

function makeEvent({ method = 'POST', jwt = 'valid.jwt.token', body = null } = {}) {
  return {
    httpMethod: method,
    headers: jwt ? { authorization: `Bearer ${jwt}` } : {},
    body: body !== null ? JSON.stringify(body) : JSON.stringify({
      attempts: [makeAttempt()],
      sessionRef: SESSION_REF,
    }),
  };
}

function loadHandler({ fetchResponse = null, sdkObserveMock = null } = {}) {
  // URL-aware fetch mock:
  //  - bridge queries → [] (no diagnostic completion)
  //  - auth / everything else → controlled by fetchResponse
  global.fetch = async (url) => {
    if (url.includes('seneca_limb_bridges')) {
      return { ok: true, status: 200, json: async () => [], text: async () => '[]' };
    }
    return {
      ok:     fetchResponse ? fetchResponse.ok !== false : true,
      status: fetchResponse ? (fetchResponse.status ?? 200) : 200,
      json:   async () => fetchResponse ? (fetchResponse.body ?? { id: USER_ID, email: 'test@test.com' }) : { id: USER_ID, email: 'test@test.com' },
      text:   async () => '',
    };
  };

  process.env.SUPABASE_URL               = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY          = 'test-anon-key';
  process.env.SUPABASE_SERVICE_KEY       = 'test-service-key';
  process.env.LIMB_KEY_VECTOR            = 'test-limb-key';
  process.env.SENECA_SDK_GATEWAY_URL     = 'https://test-gateway.netlify.app/.netlify/functions/seneca-sdk-gateway';

  for (const key of Object.keys(require.cache)) {
    if (
      key.includes('vector-ingest-assessment-attempt') ||
      key.includes('_lib/auth') ||
      key.includes('_lib/errors') ||
      key.includes('_lib/supabase') ||
      key.includes('_lib/translator')
    ) {
      delete require.cache[key];
    }
  }

  const sdkClientPath = require.resolve(
    '../../netlify/functions/_lib/sdkClient'
  );
  const observeCalls = [];
  require.cache[sdkClientPath] = {
    id: sdkClientPath,
    filename: sdkClientPath,
    loaded: true,
    exports: {
      ingest: {
        observe: sdkObserveMock || (async ({ limbUserId, observations }) => {
          observeCalls.push({ limbUserId, count: observations.length });
          return { ok: true };
        }),
      },
      query: {},
    },
  };

  const handler = require('../../netlify/functions/vector-ingest-assessment-attempt');
  return { handler, observeCalls };
}

describe('vector-ingest-assessment-attempt', () => {
  it('happy path: valid JWT + valid attempts → 200 with attemptsProcessed', async () => {
    const { handler } = loadHandler();
    const res = await handler.handler(makeEvent());
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 200);
    assert.equal(body.ok, true);
    assert.equal(body.attemptsProcessed, 1);
    assert.equal(body.batchCount, 1);
  });

  it('batches correctly: 15 attempts → 2 SDK calls (10 + 5)', async () => {
    const calls = [];
    const { handler } = loadHandler({
      sdkObserveMock: async ({ observations }) => {
        calls.push(observations.length);
        return { ok: true };
      },
    });
    const event = makeEvent({
      body: { attempts: makeAttempts(15), sessionRef: SESSION_REF },
    });
    const res = await handler.handler(event);
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 200);
    assert.equal(body.attemptsProcessed, 15);
    assert.equal(body.batchCount, 2);
    assert.deepEqual(calls, [10, 5]);
  });

  it('missing sessionRef in body → 400 VALIDATION', async () => {
    const { handler } = loadHandler();
    const event = makeEvent({ body: { attempts: [makeAttempt()] } }); // no sessionRef
    const res = await handler.handler(event);
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION');
  });

  it('translator throws VALIDATION (bad attempt) → 400', async () => {
    const { handler } = loadHandler();
    const badAttempt = makeAttempt();
    delete badAttempt.questionId; // will fail translator validation
    const event = makeEvent({ body: { attempts: [badAttempt], sessionRef: SESSION_REF } });
    const res = await handler.handler(event);
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 400);
    assert.equal(body.error.code, 'VALIDATION');
  });

  it('SDK throws NOT_FOUND (no bridge) → 412', async () => {
    const err = new Error('no bridge');
    err.code = 'NOT_FOUND';
    const { handler } = loadHandler({
      sdkObserveMock: async () => { throw err; },
    });
    const res = await handler.handler(makeEvent());
    assert.equal(res.statusCode, 412);
  });

  it('SDK throws unexpected error → 500', async () => {
    const { handler } = loadHandler({
      sdkObserveMock: async () => { throw new Error('database exploded'); },
    });
    const res = await handler.handler(makeEvent());
    assert.equal(res.statusCode, 500);
  });

  it('non-POST method → 405', async () => {
    const { handler } = loadHandler();
    const res = await handler.handler(makeEvent({ method: 'GET' }));
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 405);
    assert.equal(body.error.code, 'METHOD_NOT_ALLOWED');
  });

  it('missing JWT → 401', async () => {
    const { handler } = loadHandler({
      fetchResponse: { ok: false, status: 401, body: {} },
    });
    const res = await handler.handler(makeEvent());
    assert.ok(res.statusCode >= 400);
  });

  it('returns 403 DIAGNOSTIC_ALREADY_COMPLETED when bridge shows completed', async () => {
    // Override global fetch to return a completed bridge row
    const COMPLETED_AT = '2026-05-01T10:00:00.000Z';
    global.fetch = async (url) => {
      if (url.includes('seneca_limb_bridges')) {
        return {
          ok: true, status: 200,
          json: async () => [{ diagnostic_completed_at: COMPLETED_AT }],
          text: async () => '',
        };
      }
      return {
        ok: true, status: 200,
        json: async () => ({ id: USER_ID, email: 'test@test.com' }),
        text: async () => '',
      };
    };
    // Re-require with the new fetch in place (loadHandler replaces global.fetch,
    // so call loadHandler first then swap the bridge response out)
    const { handler } = loadHandler();
    // Patch global.fetch after loadHandler sets it up, before the actual call
    global.fetch = async (url) => {
      if (url.includes('seneca_limb_bridges')) {
        return {
          ok: true, status: 200,
          json: async () => [{ diagnostic_completed_at: COMPLETED_AT }],
          text: async () => '',
        };
      }
      return {
        ok: true, status: 200,
        json: async () => ({ id: USER_ID, email: 'test@test.com' }),
        text: async () => '',
      };
    };
    const res = await handler.handler(makeEvent());
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 403);
    assert.equal(body.error.code, 'DIAGNOSTIC_ALREADY_COMPLETED');
    assert.equal(body.error.completedAt, COMPLETED_AT);
  });
});
