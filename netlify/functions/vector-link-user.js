'use strict';

const { requireAuth }        = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { ingest }             = require('./_lib/sdkClient');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED' } });
  }

  try {
    const { userId } = await requireAuth(event);

    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch { /* handled below */ }

    const { senecaLinkToken } = body;
    if (!senecaLinkToken || !UUID_RE.test(senecaLinkToken)) {
      return json(400, {
        error: {
          code: 'VALIDATION',
          message: 'Valid senecaLinkToken (UUID) required',
        },
      });
    }

    const result = await ingest.linkUser({
      senecaLinkToken,
      limbUserId: userId,
    });

    return json(200, {
      ok: true,
      senecaUserId: result.senecaUserId,
      linkedAt:     result.linkedAt,
    });

  } catch (err) {
    return mapErrorToResponse(err);
  }
};
