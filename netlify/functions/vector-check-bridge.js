'use strict';

const { requireAuth }              = require('./_lib/auth');
const { mapErrorToResponse, json } = require('./_lib/errors');
const { query }                    = require('./_lib/sdkClient');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: { code: 'METHOD_NOT_ALLOWED' } });
  }

  try {
    const { userId } = await requireAuth(event);

    try {
      await query.getUserModel({ limbUserId: userId });
      return json(200, { hasBridge: true });
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return json(200, { hasBridge: false });
      }
      throw err;
    }

  } catch (err) {
    return mapErrorToResponse(err);
  }
};
