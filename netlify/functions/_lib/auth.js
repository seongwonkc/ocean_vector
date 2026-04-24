'use strict';

const SUPABASE_URL = process.env.SUPABASE_URL;

/**
 * Validates the Bearer JWT from the Authorization header against
 * Supabase's /auth/v1/user endpoint. Returns { userId, email } on
 * success. Throws a structured error (with .statusCode + .code) on
 * failure so mapErrorToResponse can handle it uniformly.
 */
async function requireAuth(event) {
  const authHeader = event.headers['authorization'] ||
                     event.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or invalid Authorization header');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  const jwt = authHeader.slice(7);
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error('SUPABASE_ANON_KEY not set');

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey },
  });

  if (!res.ok) {
    const err = new Error('Invalid session');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  const user = await res.json();
  if (!user?.id) {
    const err = new Error('Session missing user ID');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  return { userId: user.id, email: user.email };
}

module.exports = { requireAuth };
