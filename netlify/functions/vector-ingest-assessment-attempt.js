'use strict';

const { requireAuth } = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { ingest } = require('./_lib/sdkClient');
const { translateQuestionAttempts } = require('./_lib/translator');
const { SUPABASE_URL, makeSupabaseHeaders } = require('./_lib/supabase');

const BATCH_SIZE = 10;  // SDK gateway limit per observe call

/**
 * Gate: reject attempts once the diagnostic is completed.
 * We read the bridge directly here rather than calling vector-check-diagnostic-status
 * to avoid an extra round-trip HTTP hop inside a Netlify function.
 */
async function getDiagnosticCompletedAt(userId) {
  const url = `${SUPABASE_URL}/rest/v1/seneca_limb_bridges` +
    `?seneca_user_id=eq.${encodeURIComponent(userId)}&limb_name=eq.vector` +
    `&select=diagnostic_completed_at&limit=1`;
  const res = await fetch(url, { headers: makeSupabaseHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`bridge_read_failed: ${res.status} ${text}`);
  }
  const rows = await res.json();
  if (!rows || rows.length === 0) return null;
  return rows[0].diagnostic_completed_at || null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED' } });
  }
  try {
    const { userId } = await requireAuth(event);
    const body = JSON.parse(event.body || '{}');
    const { attempts, sessionRef } = body;
    if (!sessionRef) {
      return json(400, {
        error: { code: 'VALIDATION', message: 'sessionRef required' },
      });
    }

    // Diagnostic gate: reject writes once the diagnostic is marked complete
    const completedAt = await getDiagnosticCompletedAt(userId);
    if (completedAt) {
      return json(403, {
        error: {
          code: 'DIAGNOSTIC_ALREADY_COMPLETED',
          message: 'Diagnostic already completed; no further attempts accepted.',
          completedAt,
        },
      });
    }

    const observations = translateQuestionAttempts(attempts, { sessionRef });

    // Batch in chunks of BATCH_SIZE
    let totalProcessed = 0;
    const batchResults = [];
    for (let i = 0; i < observations.length; i += BATCH_SIZE) {
      const batch = observations.slice(i, i + BATCH_SIZE);
      const result = await ingest.observe({
        limbUserId: userId,
        observations: batch,
        // skipSynthesis: diagnostic attempts bypass seneca_memory synthesis
        // until synthesizeObservation.js is OBSERVABILITY_DISCIPLINE-compliant
        // (V0.2 backlog, target: Feature 4).
        skipSynthesis: true,
      });
      batchResults.push(result);
      totalProcessed += batch.length;
    }
    return json(200, {
      ok: true,
      attemptsProcessed: totalProcessed,
      batchCount: batchResults.length,
    });
  } catch (err) {
    return mapErrorToResponse(err);
  }
};
