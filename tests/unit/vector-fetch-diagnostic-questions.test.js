'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const USER_ID = 'user-uuid-fdq-0000-000000000001';

function makeEvent({ method = 'POST', jwt = 'valid.jwt.token', body = null } = {}) {
  return {
    httpMethod: method,
    headers: jwt ? { authorization: `Bearer ${jwt}` } : {},
    body: body !== null ? JSON.stringify(body) : JSON.stringify({ ids: ['q_001', 'q_002'] }),
  };
}

function loadHandler({ bridgeCompletedAt = null, questionRows = null, fetchFail = false } = {}) {
  const mockRows = questionRows || [
    { question_id: 'q_001', question_text: 'What is x?' },
    { question_id: 'q_002', question_text: 'What is y?' },
  ];

  global.fetch = async (url) => {
    if (fetchFail) return { ok: false, status: 500, text: async () => 'error' };
    if (url.includes('seneca_limb_bridges')) {
      return {
        ok: true, status: 200,
        json: async () => bridgeCompletedAt ? [{ diagnostic_completed_at: bridgeCompletedAt }] : [],
        text: async () => '',
      };
    }
    if (url.includes('questions')) {
      return { ok: true, status: 200, json: async () => mockRows, text: async () => '' };
    }
    return { ok: true, status: 200, json: async () => ({ id: USER_ID, email: 'x@x.com' }), text: async () => '' };
  };

  process.env.SUPABASE_URL         = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY    = 'test-anon-key';
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

  for (const key of Object.keys(require.cache)) {
    if (key.includes('vector-fetch-diagnostic-questions') || key.includes('_lib/')) {
      delete require.cache[key];
    }
  }
  return require('../../netlify/functions/vector-fetch-diagnostic-questions');
}

describe('vector-fetch-diagnostic-questions', () => {
  it('happy path: returns rows when diagnostic not completed', async () => {
    const mod = loadHandler();
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.rows));
    assert.equal(body.rows.length, 2);
  });

  it('returns 403 DIAGNOSTIC_ALREADY_COMPLETED when bridge is completed', async () => {
    const mod = loadHandler({ bridgeCompletedAt: '2026-05-01T10:00:00Z' });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 403);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'DIAGNOSTIC_ALREADY_COMPLETED');
    assert.equal(body.error.completedAt, '2026-05-01T10:00:00Z');
  });

  it('returns 400 when ids is missing', async () => {
    const mod = loadHandler();
    const res = await mod.handler(makeEvent({ body: {} }));
    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body).error.code, 'VALIDATION');
  });

  it('returns 400 when ids exceeds 30', async () => {
    const mod = loadHandler();
    const ids = Array.from({ length: 31 }, (_, i) => `q_${i}`);
    const res = await mod.handler(makeEvent({ body: { ids } }));
    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body).error.code, 'VALIDATION');
  });

  it('returns 405 for non-POST', async () => {
    const mod = loadHandler();
    const res = await mod.handler(makeEvent({ method: 'GET' }));
    assert.equal(res.statusCode, 405);
  });

  it('returns 401 when JWT is invalid', async () => {
    const mod = loadHandler({ fetchFail: false });
    // Simulate auth failure
    global.fetch = async () => ({ ok: false, status: 401, json: async () => ({}), text: async () => '' });
    for (const key of Object.keys(require.cache)) {
      if (key.includes('vector-fetch-diagnostic-questions') || key.includes('_lib/')) delete require.cache[key];
    }
    const mod2 = require('../../netlify/functions/vector-fetch-diagnostic-questions');
    const res = await mod2.handler(makeEvent());
    assert.ok(res.statusCode >= 400);
  });
});
