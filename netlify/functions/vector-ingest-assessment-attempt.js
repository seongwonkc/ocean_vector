'use strict';

const { requireAuth } = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { ingest } = require('./_lib/sdkClient');
const { translateQuestionAttempts } = require('./_lib/translator');

const BATCH_SIZE = 10;  // SDK gateway limit per observe call

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
    const observations = translateQuestionAttempts(
      attempts,
      { sessionRef }
    );
    // Batch in chunks of BATCH_SIZE
    let totalProcessed = 0;
    const batchResults = [];
    for (let i = 0; i < observations.length; i += BATCH_SIZE) {
      const batch = observations.slice(i, i + BATCH_SIZE);
      const result = await ingest.observe({
        limbUserId: userId,
        observations: batch,
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
