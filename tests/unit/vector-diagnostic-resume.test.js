'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const USER_ID = 'user-uuid-vdr-0000-000000000001';

function makeEvent({ method = 'POST', jwt = 'valid.jwt.token' } = {}) {
  return {
    httpMethod: method,
    headers: jwt ? { authorization: `Bearer ${jwt}` } : {},
    body: JSON.stringify({}),
  };
}

/**
 * staleSessionRef: if provided, vector_question_attempts GET returns [{session_ref}];
 *                 if null/undefined, returns [] (no prior attempts recorded).
 */
function loadHandler({ bridgeRow = null, fetchFail = false, deleteSpy = null, patchSpy = null, staleSessionRef = null } = {}) {
  global.fetch = async (url, opts) => {
    if (fetchFail) return { ok: false, status: 500, text: async () => 'err' };
    const method = opts?.method || 'GET';

    // Auth
    if (!url.includes('supabase')) {
      return { ok: true, status: 200, json: async () => ({ id: USER_ID, email: 'x@x.com' }), text: async () => '' };
    }

    if (url.includes('vector_question_attempts') && method === 'DELETE') {
      deleteSpy?.();
      return { ok: true, status: 204, json: async () => null, text: async () => '' };
    }
    if (url.includes('vector_question_attempts')) {
      // Server-side session_ref lookup
      const rows = staleSessionRef ? [{ session_ref: staleSessionRef }] : [];
      return { ok: true, status: 200, json: async () => rows, text: async () => '' };
    }
    if (url.includes('seneca_limb_bridges') && method === 'PATCH') {
      patchSpy?.();
      return { ok: true, status: 204, json: async () => null, text: async () => '' };
    }
    if (url.includes('seneca_limb_bridges')) {
      return {
        ok: true, status: 200,
        json: async () => bridgeRow ? [bridgeRow] : [],
        text: async () => '',
      };
    }
    // Supabase auth endpoint
    return { ok: true, status: 200, json: async () => ({ id: USER_ID, email: 'x@x.com' }), text: async () => '' };
  };

  process.env.SUPABASE_URL         = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY    = 'test-anon-key';
  process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

  for (const key of Object.keys(require.cache)) {
    if (key.includes('vector-diagnostic-resume') || key.includes('_lib/')) delete require.cache[key];
  }
  return require('../../netlify/functions/vector-diagnostic-resume');
}

const NOW          = new Date().toISOString();
const EIGHT_DAYS_AGO = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
const TWO_DAYS_AGO   = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const COMPLETED_AT   = '2026-05-01T10:00:00Z';

describe('vector-diagnostic-resume', () => {

  it('returns { startedAt: null } when bridge has no started_at', async () => {
    const mod = loadHandler({ bridgeRow: { diagnostic_started_at: null, diagnostic_completed_at: null } });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.startedAt, null);
  });

  it('returns 403 DIAGNOSTIC_ALREADY_COMPLETED when completed', async () => {
    const mod = loadHandler({ bridgeRow: { diagnostic_started_at: NOW, diagnostic_completed_at: COMPLETED_AT } });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 403);
    const body = JSON.parse(res.body);
    assert.equal(body.error.code, 'DIAGNOSTIC_ALREADY_COMPLETED');
    assert.equal(body.error.completedAt, COMPLETED_AT);
  });

  it('returns startedAt when in-progress and within 7-day window', async () => {
    const mod = loadHandler({ bridgeRow: { diagnostic_started_at: TWO_DAYS_AGO, diagnostic_completed_at: null } });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.startedAt, TWO_DAYS_AGO);
    assert.equal(body.staleResetCompleted, undefined);
  });

  it('returns staleResetCompleted when >7 days old and resets bridge', async () => {
    let patchCalled = false;
    const mod = loadHandler({
      bridgeRow: { diagnostic_started_at: EIGHT_DAYS_AGO, diagnostic_completed_at: null },
      staleSessionRef: 'sess-stale-001',
      patchSpy: () => { patchCalled = true; },
    });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.staleResetCompleted, true);
    assert.ok(body.message);
    assert.ok(patchCalled, 'bridge PATCH should have been called');
  });

  it('stale session: server looks up session_ref and triggers DELETE on vector_question_attempts', async () => {
    let deleteCalled = false;
    const mod = loadHandler({
      bridgeRow: { diagnostic_started_at: EIGHT_DAYS_AGO, diagnostic_completed_at: null },
      staleSessionRef: 'sess-del-001',
      deleteSpy: () => { deleteCalled = true; },
    });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 200);
    assert.ok(deleteCalled, 'DELETE should have been called when session_ref found server-side');
  });

  it('stale with no prior attempts: no DELETE, still resets bridge', async () => {
    let deleteCalled = false;
    let patchCalled  = false;
    const mod = loadHandler({
      bridgeRow: { diagnostic_started_at: EIGHT_DAYS_AGO, diagnostic_completed_at: null },
      // staleSessionRef omitted → vector_question_attempts GET returns []
      deleteSpy: () => { deleteCalled = true; },
      patchSpy:  () => { patchCalled  = true; },
    });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 200);
    assert.equal(deleteCalled, false, 'DELETE should NOT be called when no prior attempts exist');
    assert.ok(patchCalled, 'bridge PATCH should still be called');
  });

  it('idempotency: second call after reset (started_at is null) returns startedAt:null without DB writes', async () => {
    let dbWriteCalled = false;
    const mod = loadHandler({
      // Bridge already reset — diagnostic_started_at is NULL
      bridgeRow: { diagnostic_started_at: null, diagnostic_completed_at: null },
      deleteSpy: () => { dbWriteCalled = true; },
      patchSpy:  () => { dbWriteCalled = true; },
    });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.startedAt, null);
    assert.equal(dbWriteCalled, false, 'No DB writes on second call when already reset');
  });

  it('returns 404 NO_BRIDGE when no bridge row exists', async () => {
    const mod = loadHandler({ bridgeRow: null });
    const res = await mod.handler(makeEvent());
    assert.equal(res.statusCode, 404);
    assert.equal(JSON.parse(res.body).error.code, 'NO_BRIDGE');
  });

  it('returns 405 for non-POST', async () => {
    const mod = loadHandler({ bridgeRow: { diagnostic_started_at: null, diagnostic_completed_at: null } });
    const res = await mod.handler(makeEvent({ method: 'GET' }));
    assert.equal(res.statusCode, 405);
  });

});
