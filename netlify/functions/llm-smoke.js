'use strict';
// VECTOR · LLM smoke test endpoint
// DELETABLE once Features 4-7 are all shipped and verified.
//
// Usage (GET — fixed verification prompts):
//   GET /.netlify/functions/llm-smoke                → non-streaming round-trip
//   GET /.netlify/functions/llm-smoke?mode=stream    → streaming round-trip (chunks collected)
//   GET /.netlify/functions/llm-smoke?mode=generate  → explicit non-streaming
//   GET /.netlify/functions/llm-smoke?timeout_ms=1   → forced timeout (verification step 3)
//
// Usage (POST — custom prompts for blind quality test):
//   POST /.netlify/functions/llm-smoke
//   Content-Type: application/json
//   Body: { "system": "...", "user": "...", "mode": "generate" (default), "timeout_ms": N (optional) }
//   — mode: only 'generate' is supported on POST (streaming not needed for quality test)
//   — Missing or non-string system/user → 400 { ok: false, error: { code: 'INVALID_REQUEST', ... } }
//   — Malformed JSON body → 400 same shape
//
// Returns JSON: { ok, mode, model, text, chunks? } on success
//               { ok: false, error: { code, message, retriable, status } } on failure

const { generate, generateStreaming, MODEL } = require('./_lib/llm');

const SMOKE_SYSTEM = 'You are a concise study-science assistant.';
const SMOKE_MESSAGES = [
  { role: 'user', parts: [{ text: 'In two sentences, explain why spaced repetition works for memory.' }] },
];

exports.handler = async (event) => {
  // ── POST — custom prompts ───────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    return _handlePost(event);
  }

  // ── GET — fixed verification prompts ───────────────────────────────────────
  const params = event.queryStringParameters ?? {};
  const mode = params.mode ?? 'generate';
  const timeoutMs = params.timeout_ms ? parseInt(params.timeout_ms, 10) : null;

  // Optional forced timeout for verification step 3:
  // ?timeout_ms=1 passes a pre-aborted signal to confirm error shape
  const signal = timeoutMs != null
    ? AbortSignal.timeout(timeoutMs)
    : undefined;

  // ── Streaming mode ──────────────────────────────────────────────────────────
  if (mode === 'stream') {
    try {
      const stream = await generateStreaming({
        system: SMOKE_SYSTEM,
        messages: SMOKE_MESSAGES,
        signal,
      });

      const reader = stream.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          mode: 'stream',
          model: MODEL,
          text: chunks.join(''),
          chunks: chunks.length,
        }),
      };
    } catch (err) {
      return _errorResponse(err);
    }
  }

  // ── Non-streaming mode (default) ────────────────────────────────────────────
  try {
    const text = await generate({
      system: SMOKE_SYSTEM,
      messages: SMOKE_MESSAGES,
      signal,
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, mode: 'generate', model: MODEL, text }),
    };
  } catch (err) {
    return _errorResponse(err);
  }
};

// ── POST handler ──────────────────────────────────────────────────────────────
async function _handlePost(event) {
  // Parse body
  let body;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return _errorResponse({ code: 'INVALID_REQUEST', message: 'Request body is not valid JSON', retriable: false, status: 400 });
  }

  const { system, user, mode = 'generate', timeout_ms } = body;

  // Validate required fields
  if (typeof system !== 'string' || !system.trim()) {
    return _errorResponse({ code: 'INVALID_REQUEST', message: 'Missing or non-string field: system', retriable: false, status: 400 });
  }
  if (typeof user !== 'string' || !user.trim()) {
    return _errorResponse({ code: 'INVALID_REQUEST', message: 'Missing or non-string field: user', retriable: false, status: 400 });
  }

  const messages = [{ role: 'user', parts: [{ text: user }] }];
  const timeoutMs = typeof timeout_ms === 'number' ? timeout_ms : null;
  const signal = timeoutMs != null ? AbortSignal.timeout(timeoutMs) : undefined;

  try {
    const text = await generate({ system, messages, signal });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, mode: 'generate', model: MODEL, text }),
    };
  } catch (err) {
    return _errorResponse(err);
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function _errorResponse(err) {
  const status = err.status ?? 500;
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: false, error: err }),
  };
}
