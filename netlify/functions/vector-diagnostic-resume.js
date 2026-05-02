'use strict';

const { requireAuth }              = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { SUPABASE_URL, makeSupabaseHeaders } = require('./_lib/supabase');

// 7-day window: covers a busy weekend without losing student progress.
// Tighter windows (e.g. 72hr) would discard partial progress for students
// who start Friday and return Monday.
const STALE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * POST /vector-diagnostic-resume
 *
 * Called by assessment.html on load, after bootstrap, before serving content.
 * All state is read and derived server-side — no client-supplied session
 * identifiers are accepted or trusted.
 *
 * States:
 *   completed           → 403 DIAGNOSTIC_ALREADY_COMPLETED
 *   stale (> 7 days)    → server-side DELETE (attempts) + PATCH (bridge reset) → 200 staleResetCompleted
 *   in-progress / fresh → 200 { startedAt, completedAt: null }
 *
 * Idempotency: a second concurrent call sees diagnostic_started_at IS NULL
 *   (already reset by the first call) and returns the "never started" 200
 *   response with no DB work. No error, no duplicate writes.
 *
 * Stale cleanup failure: if the DELETE or PATCH step returns a non-2xx
 *   response, the function returns 500 rather than falsely reporting success.
 *   The caller (assessment.html) must not proceed on a failed cleanup.
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED' } });
  }
  try {
    const { userId } = await requireAuth(event);

    // ── Read bridge ───────────────────────────────────────────────────────────
    const bridgeUrl = `${SUPABASE_URL}/rest/v1/seneca_limb_bridges` +
      `?seneca_user_id=eq.${encodeURIComponent(userId)}&limb_name=eq.vector` +
      `&select=diagnostic_started_at,diagnostic_completed_at&limit=1`;
    const bridgeRes = await fetch(bridgeUrl, { headers: makeSupabaseHeaders() });
    if (!bridgeRes.ok) {
      const text = await bridgeRes.text();
      throw new Error(`bridge_read_failed: ${bridgeRes.status} ${text}`);
    }
    const bridgeRows = await bridgeRes.json();
    if (!bridgeRows || bridgeRows.length === 0) {
      return json(404, { error: { code: 'NO_BRIDGE', message: 'No bridge row found; bootstrap required.' } });
    }

    const { diagnostic_started_at, diagnostic_completed_at } = bridgeRows[0];

    // ── Completed ─────────────────────────────────────────────────────────────
    if (diagnostic_completed_at) {
      return json(403, {
        error: {
          code: 'DIAGNOSTIC_ALREADY_COMPLETED',
          message: 'Diagnostic already completed.',
          completedAt: diagnostic_completed_at,
        },
      });
    }

    // ── Never started (or already reset — second-call idempotent path) ────────
    if (!diagnostic_started_at) {
      return json(200, { startedAt: null, completedAt: null });
    }

    // ── Stale window check ────────────────────────────────────────────────────
    const ageMs = Date.now() - new Date(diagnostic_started_at).getTime();
    if (ageMs <= STALE_MS) {
      // Within the window: return current state for client resume calculation
      return json(200, { startedAt: diagnostic_started_at, completedAt: null });
    }

    // ── Stale: server-authoritative cleanup ───────────────────────────────────
    // Look up the active session_ref from the most recent attempt row.
    // Do NOT accept session_ref from the client — all cleanup is server-driven.
    const attemptsUrl = `${SUPABASE_URL}/rest/v1/vector_question_attempts` +
      `?seneca_user_id=eq.${encodeURIComponent(userId)}&session_ref=not.is.null` +
      `&select=session_ref&order=created_at.desc&limit=1`;
    const attemptsRes = await fetch(attemptsUrl, { headers: makeSupabaseHeaders() });
    if (!attemptsRes.ok) {
      const text = await attemptsRes.text();
      throw new Error(`attempts_lookup_failed: ${attemptsRes.status} ${text}`);
    }
    const attemptRows = await attemptsRes.json();
    const staleSessionRef = (attemptRows && attemptRows[0] && attemptRows[0].session_ref) || null;

    // DELETE stale attempts scoped by user + session_ref.
    // If no prior attempts were written (e.g. diagnostic started but page
    // closed before any question was answered), skip — nothing to delete.
    if (staleSessionRef) {
      const delUrl = `${SUPABASE_URL}/rest/v1/vector_question_attempts` +
        `?seneca_user_id=eq.${encodeURIComponent(userId)}` +
        `&session_ref=eq.${encodeURIComponent(staleSessionRef)}`;
      const delRes = await fetch(delUrl, { method: 'DELETE', headers: makeSupabaseHeaders() });
      if (!delRes.ok) {
        const text = await delRes.text();
        return json(500, {
          error: {
            code: 'STALE_CLEANUP_FAILED',
            message: `Failed to delete stale attempts: ${delRes.status} ${text}`,
          },
        });
      }
    }

    // Reset bridge diagnostic_started_at to NULL.
    // Idempotent: PATCH to NULL when already NULL is a no-op in Postgres.
    const patchUrl = `${SUPABASE_URL}/rest/v1/seneca_limb_bridges` +
      `?seneca_user_id=eq.${encodeURIComponent(userId)}&limb_name=eq.vector`;
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { ...makeSupabaseHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ diagnostic_started_at: null }),
    });
    if (!patchRes.ok) {
      const text = await patchRes.text();
      return json(500, {
        error: {
          code: 'STALE_CLEANUP_FAILED',
          message: `Failed to reset bridge: ${patchRes.status} ${text}`,
        },
      });
    }

    return json(200, {
      staleResetCompleted: true,
      message: 'Your previous diagnostic session expired and has been reset. You can start a new diagnostic.',
    });

  } catch (err) {
    return mapErrorToResponse(err);
  }
};
