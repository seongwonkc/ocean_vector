'use strict';

// Seneca and VECTOR share the same Supabase project
// (havatrfyuqqbidleplcf.supabase.co), so the admin API lookups on
// senecaUserId and limbUserId resolve to the same auth.users table.
// This is the foundation of "Seneca account = VECTOR account" and why
// the identity enforcement at gateway.handleLinkUser works.

if (!process.env.LIMB_KEY_VECTOR) {
  throw new Error('LIMB_KEY_VECTOR not set');
}
if (!process.env.SENECA_SDK_GATEWAY_URL) {
  throw new Error('SENECA_SDK_GATEWAY_URL not set');
}

// Bridge naming: ocean_vector uses LIMB_KEY_VECTOR (matches seneca_ai
// gateway's naming). The SDK reads SENECA_LIMB_KEY. Normalize here.
process.env.SENECA_LIMB_KEY  = process.env.LIMB_KEY_VECTOR;
process.env.SENECA_LIMB_NAME = 'vector';

const { ingest, query } = require('@seneca/sdk');

module.exports = { ingest, query };
