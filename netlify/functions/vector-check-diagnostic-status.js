'use strict';

const { requireAuth } = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { SUPABASE_URL, makeSupabaseHeaders } = require('./_lib/supabase');

/**
 * GET /vector-check-diagnostic-status
 *
 * Returns the diagnostic completion state for the authenticated user.
 * Called by app.js on auth landing to branch routing:
 *   - completed: true  → send to /assessment.html (review mode) or skip to /synthesis.html
 *   - completed: false → send to /welcome.html (first-time) or /assessment.html (resume)
 *
 * Response shape:
 *   200: { startedAt: string|null, completedAt: null }   — not yet completed
 *   403: { error: { code: 'DIAGNOSTIC_ALREADY_COMPLETED', completedAt } }
 *
 * Error codes:
 *   NO_BRIDGE (404) — user has no bridge row; caller should run vector-bootstrap-user first
 *   UNAUTHORIZED (401)
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED' } });
  }
  try {
    const { userId } = await requireAuth(event);

    const url = `${SUPABASE_URL}/rest/v1/seneca_limb_bridges` +
      `?seneca_user_id=eq.${encodeURIComponent(userId)}&limb_name=eq.vector` +
      `&select=diagnostic_started_at,diagnostic_completed_at&limit=1`;
    const res = await fetch(url, { headers: makeSupabaseHeaders() });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`bridge_read_failed: ${res.status} ${text}`);
    }
    const rows = await res.json();
    if (!rows || rows.length === 0) {
      return json(404, { error: { code: 'NO_BRIDGE', message: 'No bridge row found; bootstrap required.' } });
    }

    const { diagnostic_started_at, diagnostic_completed_at } = rows[0];

    // Completed: return 403 so response shape is consistent with other
    // completed-diagnostic surfaces (ingest attempt, question fetch, resume).
    if (diagnostic_completed_at) {
      return json(403, {
        error: {
          code: 'DIAGNOSTIC_ALREADY_COMPLETED',
          message: 'Diagnostic already completed.',
          completedAt: diagnostic_completed_at,
        },
      });
    }

    return json(200, {
      startedAt:   diagnostic_started_at   || null,
      completedAt: diagnostic_completed_at || null,
    });
  } catch (err) {
    return mapErrorToResponse(err);
  }
};
