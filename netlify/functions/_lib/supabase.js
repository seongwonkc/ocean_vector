'use strict';

// ocean_vector/netlify/functions/_lib/supabase.js
//
// Per-repo helper. ocean_vector and seneca_ai are separate Netlify
// deployments — they cannot share runtime modules. The
// makeSupabaseHeaders implementation in seneca_ai/netlify/functions/
// _sdk/supabase.js is intentionally distinct, not a drift candidate.

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error('SUPABASE_URL not set');

function makeSupabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_KEY not set');
  return {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

module.exports = { SUPABASE_URL, makeSupabaseHeaders };
