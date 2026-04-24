'use strict';

const { requireAuth } = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { ingest } = require('./_lib/sdkClient');
const { translateAssessmentSession } = require('./_lib/translator');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED' } });
  }
  try {
    const { userId } = await requireAuth(event);
    const body = JSON.parse(event.body || '{}');
    const { session } = body;
    if (!session || typeof session !== 'object') {
      return json(400, {
        error: { code: 'VALIDATION', message: 'session object required' },
      });
    }
    const translated = translateAssessmentSession(session, {});
    const result = await ingest.sessionSignal({
      limbUserId: userId,
      session: translated,
    });
    return json(200, {
      ok: true,
      sessionId: result.sessionId,
    });
  } catch (err) {
    return mapErrorToResponse(err);
  }
};
