'use strict';

/**
 * vector-bootstrap-user.js
 *
 * Bootstrap runs idempotently on first authenticated VECTOR action.
 * Ensures seneca_users row exists (with email from auth), then upserts
 * seneca_limb_bridges row keyed by (seneca_user_id, limb_name='vector').
 *
 * Required for direct-VECTOR-signup users who didn't go through the
 * Seneca link flow. Safe to call on every session start — both writes
 * are ON CONFLICT ... DO UPDATE and cost one round-trip each.
 *
 * Sequence: auth → bootstrap (this function) → vector-check-diagnostic-status
 *
 * Input:  Authorization header (JWT validated server-side via requireAuth)
 * Output: { bootstrapped: true, userId: string }
 * Errors: AUTH_INCOMPLETE (401) | BOOTSTRAP_FAILED (500) | UNAUTHORIZED (401)
 */

const { requireAuth }                      = require('./_lib/auth.js');
const { json, mapErrorToResponse }         = require('./_lib/errors.js');
const { SUPABASE_URL, makeSupabaseHeaders } = require('./_lib/supabase.js');

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'POST required.' } });
  }

  let userId, email;
  try {
    ({ userId, email } = await requireAuth(event));
  } catch (err) {
    return mapErrorToResponse(err);
  }

  // Defensive null-guard: requireAuth currently returns email reliably,
  // but auth flows can change. Fail explicitly rather than hitting the
  // NOT NULL constraint on seneca_users.email with an opaque DB error.
  if (!email) {
    return json(401, {
      error: {
        code: 'AUTH_INCOMPLETE',
        message: 'Authenticated session missing email; bootstrap cannot proceed.',
      },
    });
  }

  // ── Upsert seneca_users ────────────────────────────────────────────────────
  // ON CONFLICT (id) DO UPDATE SET email keeps it current if user changes email.
  // Uses direct fetch + ?on_conflict= URL query param pattern — supabasePost
  // helper only accepts a Prefer header value, not URL query params.
  // (See queueBaselineRefresh in seneca-sdk-gateway.js for the same pattern.)
  const usersRes = await fetch(
    `${SUPABASE_URL}/rest/v1/seneca_users?on_conflict=id`,
    {
      method: 'POST',
      headers: { ...makeSupabaseHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: userId, email }),
    }
  );
  if (!usersRes.ok) {
    const errText = await usersRes.text();
    console.error('[bootstrap] seneca_users upsert failed:', usersRes.status, errText);
    return json(500, {
      error: { code: 'BOOTSTRAP_FAILED', message: `seneca_users upsert failed: ${errText}` },
    });
  }

  // ── Upsert seneca_limb_bridges ─────────────────────────────────────────────
  // ON CONFLICT (seneca_user_id, limb_name) DO UPDATE reactivates any inactive
  // row and refreshes limb_user_id + linked_at.
  // Conflict target uses uq_bridges_user_limb (added in Feature 3 migration).
  // limb_user_id = userId: for direct-VECTOR-signup users, the Supabase auth
  // identity IS the limb identity — no separate limb account exists.
  const bridgesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/seneca_limb_bridges?on_conflict=seneca_user_id,limb_name`,
    {
      method: 'POST',
      headers: { ...makeSupabaseHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        seneca_user_id: userId,
        limb_name:      'vector',
        limb_user_id:   userId,
        is_active:      true,
        linked_at:      new Date().toISOString(),
      }),
    }
  );
  if (!bridgesRes.ok) {
    const errText = await bridgesRes.text();
    console.error('[bootstrap] seneca_limb_bridges upsert failed:', bridgesRes.status, errText);
    return json(500, {
      error: { code: 'BOOTSTRAP_FAILED', message: `seneca_limb_bridges upsert failed: ${errText}` },
    });
  }

  return json(200, { bootstrapped: true, userId });
};
