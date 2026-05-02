'use strict';

const { requireAuth } = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { SUPABASE_URL, makeSupabaseHeaders } = require('./_lib/supabase');

/**
 * POST /vector-start-diagnostic
 *
 * Stamps diagnostic_started_at on the user's seneca_limb_bridges row, but
 * ONLY if it is not already set (idempotent — safe to call on every page load).
 *
 * Called by assessment.html on mount when the status check returns
 * startedAt: null.  If startedAt is already set, the call is still safe —
 * the server-side guard prevents an overwrite.
 *
 * Response:
 *   { started: true, startedAt: string }   — row just stamped
 *   { started: false, startedAt: string }  — already started, no change
 *
 * Error codes:
 *   NO_BRIDGE (404)
 *   UNAUTHORIZED (401)
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED' } });
  }
  try {
    const { userId } = await requireAuth(event);

    // Read current state first
    const readUrl = `${SUPABASE_URL}/rest/v1/seneca_limb_bridges` +
      `?seneca_user_id=eq.${encodeURIComponent(userId)}&limb_name=eq.vector` +
      `&select=diagnostic_started_at&limit=1`;
    const readRes = await fetch(readUrl, { headers: makeSupabaseHeaders() });
    if (!readRes.ok) {
      const text = await readRes.text();
      throw new Error(`bridge_read_failed: ${readRes.status} ${text}`);
    }
    const rows = await readRes.json();
    if (!rows || rows.length === 0) {
      return json(404, { error: { code: 'NO_BRIDGE', message: 'No bridge row found; bootstrap required.' } });
    }

    const existing = rows[0].diagnostic_started_at;
    if (existing) {
      // Already started — idempotent no-op
      return json(200, { started: false, startedAt: existing });
    }

    // Stamp the timestamp
    const patchUrl = `${SUPABASE_URL}/rest/v1/seneca_limb_bridges` +
      `?seneca_user_id=eq.${encodeURIComponent(userId)}&limb_name=eq.vector`;
    const now = new Date().toISOString();
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        ...makeSupabaseHeaders(),
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ diagnostic_started_at: now }),
    });
    if (!patchRes.ok) {
      const text = await patchRes.text();
      throw new Error(`bridge_patch_failed: ${patchRes.status} ${text}`);
    }

    return json(200, { started: true, startedAt: now });
  } catch (err) {
    return mapErrorToResponse(err);
  }
};
