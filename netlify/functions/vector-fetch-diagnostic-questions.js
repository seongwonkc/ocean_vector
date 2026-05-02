'use strict';

const { requireAuth }         = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { SUPABASE_URL, makeSupabaseHeaders } = require('./_lib/supabase');

/**
 * POST /vector-fetch-diagnostic-questions
 *
 * Serves diagnostic question rows after confirming the user has not
 * completed the diagnostic. The client cannot bypass this gate by
 * querying Supabase directly — all diagnostic content reads go through
 * this function.
 *
 * Body:   { ids: string[] }   — question_ids to fetch, max 30
 *
 * Response 200: { rows: [...raw question rows...] }
 * Response 403: { error: { code: 'DIAGNOSTIC_ALREADY_COMPLETED', completedAt } }
 * Response 400: VALIDATION
 * Response 401: UNAUTHORIZED
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED' } });
  }
  try {
    const { userId } = await requireAuth(event);

    // ── Gate: check diagnostic completion before serving any content ──────────
    const bridgeUrl = `${SUPABASE_URL}/rest/v1/seneca_limb_bridges` +
      `?seneca_user_id=eq.${encodeURIComponent(userId)}&limb_name=eq.vector` +
      `&select=diagnostic_completed_at&limit=1`;
    const bridgeRes = await fetch(bridgeUrl, { headers: makeSupabaseHeaders() });
    if (!bridgeRes.ok) {
      const text = await bridgeRes.text();
      throw new Error(`bridge_read_failed: ${bridgeRes.status} ${text}`);
    }
    const bridgeRows = await bridgeRes.json();
    const completedAt = (bridgeRows && bridgeRows[0] && bridgeRows[0].diagnostic_completed_at) || null;
    if (completedAt) {
      return json(403, {
        error: {
          code: 'DIAGNOSTIC_ALREADY_COMPLETED',
          message: 'Diagnostic already completed; no further content served.',
          completedAt,
        },
      });
    }

    // ── Parse and validate request ────────────────────────────────────────────
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch { /* fall through */ }
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return json(400, { error: { code: 'VALIDATION', message: 'ids must be a non-empty array' } });
    }
    if (ids.length > 30) {
      return json(400, { error: { code: 'VALIDATION', message: 'ids array may not exceed 30 items' } });
    }

    // ── Fetch question rows ───────────────────────────────────────────────────
    const idsParam = '(' + ids.map(encodeURIComponent).join(',') + ')';
    const qUrl = `${SUPABASE_URL}/rest/v1/questions` +
      `?question_id=in.${idsParam}&active=eq.true` +
      `&select=question_id,section,domain,difficulty,question_type,passage,question_text,answer_a,answer_b,answer_c,answer_d,correct_answer`;
    const qRes = await fetch(qUrl, { headers: makeSupabaseHeaders() });
    if (!qRes.ok) {
      const text = await qRes.text();
      throw new Error(`questions_fetch_failed: ${qRes.status} ${text}`);
    }
    const rows = await qRes.json();
    return json(200, { rows: rows || [] });

  } catch (err) {
    return mapErrorToResponse(err);
  }
};
