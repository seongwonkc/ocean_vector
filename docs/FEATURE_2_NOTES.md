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
const MODEL = 'gemini-3-flash-preview';
```

Change the model in one place only. Features 4-7 must not hardcode model names — they import `MODEL` from `llm.js` if they need to log or display it.

**Why `gemini-3-flash-preview` over `gemini-2.5-flash`:** Google's current recommended default for general text tasks. Preview/experimental status noted — if instability is observed in pilot, drop back to `gemini-2.5-flash` (stable) by changing the single constant.

**Thinking budget note:** `gemini-3-flash-preview` has thinking ON at HIGH by default. For latency-sensitive Features 4-7, callers can add `config.thinkingConfig: { thinkingLevel: 'LOW' }` to `_ai.models.generateContent()` calls inside `llm.js` if first-token latency becomes a problem. Not changed now — default behavior kept until pilot data shows it's needed.

---

## Error shape contract

All errors thrown by `generate()` and `generateStreaming()` are normalized to this shape. Features 4-7 should catch on `code`, not on HTTP status.

```js
{
  code: 'RATE_LIMITED'       // HTTP 429
       | 'TIMEOUT'           // AbortError or HTTP 408
       | 'LLM_UPSTREAM_ERROR'// HTTP 5xx
       | 'LLM_ERROR',        // everything else
  message: string,
  retriable: boolean,        // true for RATE_LIMITED and LLM_UPSTREAM_ERROR
  status: number,            // HTTP status code
}
```

Raw `ApiError` from `@google/genai` is never surfaced outside `llm.js`.

---

## Abort semantics

`generate()` and `generateStreaming()` both accept an optional `AbortSignal`.

- **Timeout:** A 30s internal timeout is applied on every call via `AbortSignal.timeout(30_000)`. Override by passing a shorter signal.
- **Caller signal:** Pass via `signal` param (e.g. from `event.headers['connection']` close listener in a Netlify function, or `AbortController` for test).
- **Combined:** `AbortSignal.any([callerSignal, timeoutSignal])` — whichever fires first wins. Requires Node 20.3+ — satisfied by `engines.node: "20.x"`.
- **Non-streaming:** `Promise.race()` against the combined signal. The upstream Gemini HTTP request may not be cancelled at the network level — Codex pre-impl must validate whether `@google/genai` v1.50.1 propagates the AbortSignal to the underlying fetch. If not, the local promise rejects but the upstream request completes. For pilot scale this is acceptable; fix before production load.
- **Streaming:** Signal checked on each chunk iteration in the `ReadableStream` start method. Same upstream caveat applies.

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
  maxOutputTokens: 512,          // optional, defaults to 1024
  signal: myAbortSignal,         // optional
});

// Streaming — e.g. per-question commentary, why-this-question
const stream = await generateStreaming({
  system: 'You are a concise SAT tutor...',
  messages: [...],
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
