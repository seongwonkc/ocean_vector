# Feature 2: Gemini Flash Client + Streaming Utility

**Date:** 2026-04-29
**Status:** Code complete. Pending: GEMINI_API_KEY set in Netlify env, Codex pre-impl + post-impl review, blind quality test.

---

## What was built

Two new files, no schema changes, no SDK contract changes, no seneca_ai changes.

| File | Purpose |
|------|---------|
| `netlify/functions/_lib/llm.js` | Core LLM utility — `generate()`, `generateStreaming()`, error normalization, AbortSignal, timeout |
| `netlify/functions/llm-smoke.js` | Smoke test endpoint — deletable post Features 4-7 |

`@google/genai` added to `package.json` dependencies (v1.50.1).

---

## Env var setup

### GEMINI_API_KEY
- **Where:** Netlify UI → ocean_vector site → Environment variables → Add variable
- **Value:** API key from [Google AI Studio](https://aistudio.google.com/apikey)
- **Scope:** Server-side only. Must NOT appear in `config.js` or any client-side file.
- **How provisioned:** Free tier (Google AI Studio project). Kevin provisions manually — key not committed to repo.
- **ANTHROPIC_API_KEY:** Remains set in env, unused by ocean_vector. Documented here as the historical fallback decision. Do not remove.

---

## Model constant

**Location:** `netlify/functions/_lib/llm.js`, line 28:
```js
const MODEL = 'gemini-2.5-flash';
```

Change the model in one place only. Features 4-7 must not hardcode model names — they import `MODEL` from `llm.js` if they need to log or display it.

**Why `gemini-2.5-flash` (not `gemini-3-flash-preview`):** Two hard constraints:
1. **Free-tier requirement** — MVP runs on Google AI Studio free tier. `gemini-3-flash-preview` is paid-tier only.
2. **Google ToS** — preview/experimental models are classified as not-for-production. `gemini-2.5-flash` is GA and free-tier eligible.

`gemini-2.5-flash` is Google's current stable Flash model with thinking support. No instability risk, no billing surprise.

**Thinking budget note:** `gemini-2.5-flash` supports `thinkingConfig`. For latency-sensitive Features 4-7, callers can add `config.thinkingConfig: { thinkingBudget: 0 }` to disable thinking if first-token latency becomes a problem. Not set now — default behavior kept until pilot data shows it's needed.

---

## Error shape contract

All errors thrown by `generate()` and `generateStreaming()` are normalized to this shape. Features 4-7 should catch on `code`, not on HTTP status.

```js
{
  code: 'RATE_LIMITED'        // HTTP 429
       | 'TIMEOUT'            // AbortError or HTTP 408
       | 'LLM_UPSTREAM_ERROR' // HTTP 5xx
       | 'LLM_ERROR'          // all other HTTP errors from the SDK
       | 'MISSING_API_KEY'    // GEMINI_API_KEY not set at call time
       | 'MALFORMED_RESPONSE' // SDK returned empty or missing response.text
       | 'UNKNOWN_CONFIG_KEY',// caller passed a key not in ALLOWED_CONFIG_KEYS
  message: string,
  retriable: boolean,         // true for RATE_LIMITED and LLM_UPSTREAM_ERROR only
  status: number | null,      // HTTP status code; null for non-HTTP errors
}
```

Raw `ApiError` from `@google/genai` is never surfaced outside `llm.js`.

---

## Abort semantics

`generate()` and `generateStreaming()` both accept an optional `AbortSignal`.

- **Timeout:** A 30s internal timeout is applied on every call via `AbortSignal.timeout(30_000)`. Override by passing a shorter signal.
- **Caller signal:** Pass via `signal` param (e.g. from `event.headers['connection']` close listener in a Netlify function, or `AbortController` for test).
- **Combined:** `AbortSignal.any([callerSignal, timeoutSignal])` — whichever fires first wins. Requires Node 20.3+ — satisfied by `engines.node: "20.x"`.
- **SDK propagation (Fix 1):** `abortSignal: combined` is now passed inside `config` to `generateContent` / `generateContentStream`. The `@google/genai` v1.50.1 SDK reads it from `params.config.abortSignal` and forwards it to the underlying HTTP fetch.
- **Client-side caveat (from SDK docs):** *"AbortSignal is a client-only operation. Using it to cancel an operation will not cancel the request in the service. You will still be charged usage for any applicable operations."* Abort stops the local promise chain and terminates the streaming loop; it does not guarantee the upstream inference stops immediately.
- **Non-streaming:** `Promise.race()` against the combined signal plus `abortSignal` in config — belt and suspenders.
- **Streaming:** Signal checked on each chunk iteration in the `ReadableStream` start method, in addition to `abortSignal` in config.

---

## How Features 4-7 should call llm.js

```js
const { generate, generateStreaming } = require('./_lib/llm');

// Non-streaming — e.g. session synthesis, profile patterns
const text = await generate({
  system: 'You are a study coach...',
  messages: [
    { role: 'user', parts: [{ text: '...' }] },
  ],
  maxOutputTokens: 512,           // optional, defaults to 1024
  signal: myAbortSignal,          // optional
  config: { temperature: 0.3 },   // optional — see ALLOWED_CONFIG_KEYS below
});

// Streaming — e.g. per-question commentary, why-this-question
const stream = await generateStreaming({
  system: 'You are a concise SAT tutor...',
  messages: [...],
  config: { thinkingConfig: { thinkingBudget: 0 } }, // disable thinking for latency
});
// Stream to SSE client:
const reader = stream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  res.write(`data: ${value}\n\n`);
}
```

`messages` format: standard Gemini `Content[]` — `[{ role: 'user'|'model', parts: [{ text: '...' }] }]`. Multi-turn: alternate user/model roles.

### ALLOWED_CONFIG_KEYS

Caller config is validated against an allowlist. Passing an unknown key throws `{ code: 'UNKNOWN_CONFIG_KEY' }` immediately — loud failure, not silent drop.

```
candidateCount    frequencyPenalty  logprobs          presencePenalty
responseLogprobs  responseMimeType  responseModalities responseSchema
safetySettings    seed              stopSequences      temperature
thinkingConfig    toolConfig        tools              topK
topP
```

**Override rules — these three keys are controlled by `llm.js` and cannot be set via `config`:**
- `systemInstruction` — always set from the `system` param
- `maxOutputTokens` — always set from the `maxOutputTokens` param (default 1024)
- `abortSignal` — always set to the combined caller+timeout signal

---

## Smoke endpoint

**URL:** `/.netlify/functions/llm-smoke`

| Query param | Effect |
|-------------|--------|
| `mode=generate` (default) | Non-streaming round-trip |
| `mode=stream` | Streaming round-trip (chunks collected, returned as JSON) |
| `timeout_ms=1` | Forced 1ms timeout — verifies AbortError error shape |

**Deletable** once Features 4, 5, 6, 7 are all shipped and verified.

---

## Quota sanity check

### Rate limits
Actual per-project limits must be viewed in AI Studio: https://aistudio.google.com/rate-limit

The rate limit page does not publish static RPM/RPD/TPM numbers — they are dynamically rendered per project and tier. Check your project's limits before pilot launch.

### Pilot capacity estimate
| Parameter | Conservative | Peak |
|-----------|-------------|------|
| Students | 3 | 30 |
| Sessions/student/day | 1 | 2 |
| LLM calls/session | 6 | 6 |
| **RPD** | **18** | **360** |
| Peak RPM (calls burst at session start) | ~2 | ~10 |

The 6 calls/session estimate covers: session synthesis + per-question commentary (×4 questions avg) + why-this-question summary.

**Action required before pilot:** Verify your project's free-tier RPD cap covers the 360 RPD peak estimate. If your project shows <500 RPD, add a paid billing method to upgrade to Tier 1 before onboarding >10 students.

---

## Discovery output (AC 1 gate)

| Check | Result |
|-------|--------|
| Anthropic grep in ocean_vector | 0 matches — greenfield confirmed |
| Existing LLM calls (user-triggered runtime) | None |
| Background/scheduled jobs using LLM | None (seneca-baseline-refresh.js is in seneca_ai, not ocean_vector) |
| `_lib` convention confirmed | `netlify/functions/_lib/` — new file follows pattern |
| Env var pattern | Direct `process.env.*` — no config helper |
| Node version | `20.x` — satisfies `@google/genai` requirement of `>=20.0.0` |

---

## Pending before ship

1. **GEMINI_API_KEY** set in Netlify UI for ocean_vector site (Kevin)
2. **Codex pre-impl review** — validate: streaming chunk completeness, AbortSignal upstream propagation, error shape consistency, `maxOutputTokens` field name, `systemInstruction` placement (REQUIRED per spec)
3. **Smoke test round-trips** — non-streaming + streaming (verification steps 1-2)
4. **Forced timeout test** — `?timeout_ms=1` → confirm `{ code: 'TIMEOUT', retriable: false }` (step 3)
5. **Quota check** — verify project limits in AI Studio cover pilot estimate (step 5)
6. **Blind quality test** — Kevin runs 5 prompts through `generate()` smoke endpoint vs Haiku (step 6)
7. **Codex post-impl review** (step 7)
