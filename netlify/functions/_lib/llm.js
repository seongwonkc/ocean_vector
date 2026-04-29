'use strict';
// VECTOR · LLM utility
// Thin wrapper around @google/genai for Features 4-7.
// All LLM calls in ocean_vector go through this module.
// seneca_ai stays on Claude — this is a VECTOR-only utility.
//
// Contract for callers (Features 4, 5, 6, 7):
//   const { generate, generateStreaming, ALLOWED_CONFIG_KEYS } = require('./_lib/llm');
//
//   // Non-streaming
//   const text = await generate({ system, messages, maxOutputTokens, signal, config });
//
//   // Streaming — returns ReadableStream<string> of plain text chunks
//   const stream = await generateStreaming({ system, messages, maxOutputTokens, signal, config });
//
//   // Error shape (thrown by both):
//   // { code: 'RATE_LIMITED'|'TIMEOUT'|'LLM_UPSTREAM_ERROR'|'LLM_ERROR'
//   //       | 'MISSING_API_KEY'|'MALFORMED_RESPONSE'|'UNKNOWN_CONFIG_KEY',
//   //   message: string, retriable: boolean, status: number|null }

const { GoogleGenAI } = require('@google/genai');

// ── Constants ─────────────────────────────────────────────────────────────────
// Change the model in one place only. Features 4-7 must not hardcode model names.
const MODEL = 'gemini-2.5-flash';
const DEFAULT_MAX_OUTPUT_TOKENS = 1024;
const DEFAULT_TIMEOUT_MS = 30_000; // 30 s — overridable per call via signal

// Allowlist of GenerateContentConfig keys callers may pass via the config param.
// Keys controlled by llm.js (systemInstruction, maxOutputTokens, abortSignal)
// are intentionally excluded — they cannot be overridden by callers.
const ALLOWED_CONFIG_KEYS = new Set([
  'temperature', 'topP', 'topK',
  'responseMimeType', 'responseSchema', 'responseModalities',
  'thinkingConfig', 'candidateCount', 'stopSequences',
  'frequencyPenalty', 'presencePenalty', 'seed',
  'safetySettings', 'tools', 'toolConfig',
  'responseLogprobs', 'logprobs',
]);

// ── Lazy client singleton ─────────────────────────────────────────────────────
// Instantiated on first call, not at module load.
// Missing key throws a normalized error at call time, not a cold-start crash.
let _ai = null;
function _getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw _makeError('MISSING_API_KEY', 'GEMINI_API_KEY env var is not set', false, null);
  }
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}

// ── Error helpers ─────────────────────────────────────────────────────────────
function _makeError(code, message, retriable, status) {
  return { code, message, retriable, status };
}

// Produces the consistent error shape Features 4-7 should catch.
// Never throw a raw ApiError out of this module.
function _normalizeError(err) {
  const status = err.status ?? 500;
  let code;
  if (status === 429)                                    code = 'RATE_LIMITED';
  else if (err.name === 'AbortError' || status === 408)  code = 'TIMEOUT';
  else if (status >= 500)                                code = 'LLM_UPSTREAM_ERROR';
  else                                                   code = 'LLM_ERROR';
  return {
    code,
    message: err.message ?? 'Unknown LLM error',
    retriable: status === 429 || status >= 500,
    status,
  };
}

function _isNormalized(err) {
  return err && err.code && err.message && 'retriable' in err;
}

// ── Config validation ─────────────────────────────────────────────────────────
function _validateCallerConfig(config) {
  for (const key of Object.keys(config)) {
    if (!ALLOWED_CONFIG_KEYS.has(key)) {
      throw _makeError(
        'UNKNOWN_CONFIG_KEY',
        `Unrecognized config key: "${key}". Allowed keys: ${[...ALLOWED_CONFIG_KEYS].sort().join(', ')}`,
        false,
        null,
      );
    }
  }
}

// ── Abort / timeout helpers ───────────────────────────────────────────────────
// AbortSignal.any() requires Node 20.3+ — satisfied by engines.node: "20.x".
function _combinedSignal(callerSignal, timeoutMs) {
  const timeout = AbortSignal.timeout(timeoutMs);
  return callerSignal ? AbortSignal.any([callerSignal, timeout]) : timeout;
}

// Races a promise against an AbortSignal.
// When the signal fires, rejects with a normalized TIMEOUT error shape.
function _raceAbort(promise, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(_makeError('TIMEOUT', 'Request timed out', false, 408));
      return;
    }
    const onAbort = () => {
      reject(_makeError('TIMEOUT', 'Request timed out', false, 408));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (v) => { signal.removeEventListener('abort', onAbort); resolve(v); },
      (e) => { signal.removeEventListener('abort', onAbort); reject(e); },
    );
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Non-streaming text generation.
 *
 * @param {object}      params
 * @param {string}      params.system            System instruction delivered via config.systemInstruction
 * @param {Array}       params.messages          Gemini Content[] — [{ role: 'user', parts: [{ text }] }, ...]
 * @param {number}      [params.maxOutputTokens] Defaults to 1024
 * @param {AbortSignal} [params.signal]          Caller-supplied abort signal (e.g. request disconnect)
 * @param {object}      [params.config={}]       Optional Gemini GenerateContentConfig fields.
 *                                               Only keys in ALLOWED_CONFIG_KEYS are permitted.
 *                                               systemInstruction, maxOutputTokens, and abortSignal
 *                                               are always set by llm.js and CANNOT be overridden via config.
 * @returns {Promise<string>} Full response text
 * @throws {{ code, message, retriable, status }}
 */
async function generate({
  system,
  messages,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  signal,
  config = {},
} = {}) {
  _validateCallerConfig(config);
  const ai = _getClient();
  const combined = _combinedSignal(signal, DEFAULT_TIMEOUT_MS);
  try {
    const response = await _raceAbort(
      ai.models.generateContent({
        model: MODEL,
        contents: messages,
        config: {
          ...config,
          // These always override caller-supplied config:
          systemInstruction: system,
          maxOutputTokens,
          abortSignal: combined,
        },
      }),
      combined,
    );
    const text = response.text;
    if (!text) {
      throw _makeError('MALFORMED_RESPONSE', 'Gemini returned empty or missing response text', false, 200);
    }
    return text;
  } catch (err) {
    if (_isNormalized(err)) throw err;
    throw _normalizeError(err);
  }
}

/**
 * Streaming text generation.
 * Returns a ReadableStream of plain text string chunks (NOT raw Gemini chunks).
 * Gemini's internal chunk format is normalized — callers receive bare strings.
 *
 * Usage in a Netlify function:
 *   const stream = await generateStreaming({ system, messages });
 *   // Pipe to SSE response, or collect with reader.read() loop.
 *
 * @param {object}      params
 * @param {string}      params.system
 * @param {Array}       params.messages
 * @param {number}      [params.maxOutputTokens]
 * @param {AbortSignal} [params.signal]
 * @param {object}      [params.config={}]       Optional Gemini GenerateContentConfig fields.
 *                                               Only keys in ALLOWED_CONFIG_KEYS are permitted.
 *                                               systemInstruction, maxOutputTokens, and abortSignal
 *                                               are always set by llm.js and CANNOT be overridden via config.
 * @returns {Promise<ReadableStream<string>>}
 * @throws {{ code, message, retriable, status }}
 */
async function generateStreaming({
  system,
  messages,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  signal,
  config = {},
} = {}) {
  _validateCallerConfig(config);
  const ai = _getClient();
  const combined = _combinedSignal(signal, DEFAULT_TIMEOUT_MS);

  // Initiate the request. If this throws (auth, network, quota), normalize now.
  let geminiStream;
  try {
    geminiStream = await _raceAbort(
      ai.models.generateContentStream({
        model: MODEL,
        contents: messages,
        config: {
          ...config,
          // These always override caller-supplied config:
          systemInstruction: system,
          maxOutputTokens,
          abortSignal: combined,
        },
      }),
      combined,
    );
  } catch (err) {
    if (_isNormalized(err)) throw err;
    throw _normalizeError(err);
  }

  // Wrap the async-iterable Gemini stream in a standard ReadableStream.
  // Chunk normalization: extract chunk.text, drop empty/undefined chunks.
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of geminiStream) {
          if (combined.aborted) {
            controller.error(_makeError('TIMEOUT', 'Stream aborted', false, 408));
            return;
          }
          const text = chunk.text;
          if (text) controller.enqueue(text);
        }
        controller.close();
      } catch (err) {
        controller.error(_isNormalized(err) ? err : _normalizeError(err));
      }
    },
  });
}

module.exports = {
  generate,
  generateStreaming,
  MODEL,
  DEFAULT_MAX_OUTPUT_TOKENS,
  DEFAULT_TIMEOUT_MS,
  ALLOWED_CONFIG_KEYS,
};
