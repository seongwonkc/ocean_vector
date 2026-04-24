'use strict';

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/**
 * Maps SDK errors and auth errors to HTTP responses.
 * SDK errors have a .code property (from SenecaError).
 * Auth errors have both .code and .statusCode set by requireAuth.
 */
function mapErrorToResponse(err) {
  // Auth errors: explicit statusCode + code set in requireAuth
  if (err.statusCode && err.code) {
    return json(err.statusCode, {
      error: { code: err.code, message: err.message },
    });
  }

  const code = err.code;

  if (code === 'IDENTITY_MISMATCH') {
    return json(403, {
      error: {
        code: 'IDENTITY_MISMATCH',
        message:
          'Your Seneca account is registered to a different email than ' +
          'your VECTOR account. Please sign into the matching Seneca ' +
          'account, or contact support.',
      },
    });
  }

  if (code === 'BRIDGE_EXISTS') {
    return json(409, {
      error: {
        code: 'BRIDGE_EXISTS',
        message:
          'This VECTOR account is already linked to a different Seneca ' +
          'account. Contact support to resolve.',
      },
    });
  }

  if (code === 'NOT_FOUND') {
    return json(412, {
      error: {
        code: 'NOT_FOUND',
        message: 'Please link your Seneca account first.',
      },
    });
  }

  if (
    code === 'TOKEN_EXPIRED' ||
    code === 'TOKEN_SPENT' ||
    code === 'UNAUTHORIZED'
  ) {
    return json(400, {
      error: {
        code,
        message: 'This link has expired or been used. Please try again.',
      },
    });
  }

  if (code === 'VALIDATION') {
    return json(400, {
      error: { code: 'VALIDATION', message: err.message },
    });
  }

  if (code === 'RATE_LIMITED') {
    return json(429, {
      error: { code: 'RATE_LIMITED', message: 'Too many requests.' },
    });
  }

  // Unknown error — log server-side, don't leak internals
  console.error('[vector] unmapped error:', err);
  return json(500, {
    error: { code: 'INTERNAL', message: 'Unexpected error.' },
  });
}

module.exports = { json, mapErrorToResponse };
