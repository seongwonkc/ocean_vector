# VECTOR Feature 3 — Diagnostic Flow Notes

**Shipped:** 2026-05-02
**Scope:** 30-question SAT diagnostic, full data pipeline (attempts + session signal), Bluebook-style UI

---

## Architecture decisions

### skipSynthesis flag (temporary bypass)

Diagnostic attempts write to `vector_question_attempts` but do NOT create `seneca_memory` rows. This is controlled by the `skipSynthesis: true` flag passed through the full stack:

```
assessment.html
  → vector-ingest-assessment-attempt.js  (passes skipSynthesis: true)
  → SDK observe()                        (forwards in request body)
  → gateway handleObserve()              (skips memoryRows.push + seneca_memory POST)
```

**Why:** `synthesizeObservation.js` is not yet OBSERVABILITY_DISCIPLINE-compliant. Diagnostic attempts would generate overclaim language ("student is weak at X") based on a single data point. The bypass avoids poisoning `seneca_memory` before the synthesis prompt is properly calibrated.

**V0.2 target (Feature 4):** Re-enable synthesis for diagnostic attempts after `synthesizeObservation.js` is updated with the OBSERVABILITY_DISCIPLINE prompt spec.

### Diagnostic completion gate (server-side)

`vector-ingest-assessment-attempt.js` reads `diagnostic_completed_at` from `seneca_limb_bridges` before accepting attempts. If the diagnostic is already complete, it returns HTTP 403 with `DIAGNOSTIC_ALREADY_COMPLETED`.

The completion stamp (`diagnostic_completed_at`) is written by `gateway handleSessionSignal()` when it receives a session with `completedFullSession: true` AND `sectionsCompleted` includes `'diagnostic'`. This is the authoritative server-side gate; client-side checks in `assessment.html` are advisory.

### Bootstrap sequence

Every auth landing on index.html now follows:
1. `vector-bootstrap-user` (POST, idempotent) — upsert `seneca_users` + `seneca_limb_bridges`
2. `vector-check-diagnostic-status` (GET) — read `diagnostic_started_at` / `diagnostic_completed_at`
3. Branch: `startedAt === null && !completed` → `/welcome.html`; otherwise → `/assessment.html`

`assessment.html` re-runs the status check on load and handles all post-start states (resume, stale, completed) internally.

### Cross-repo helper duplication

`ocean_vector/netlify/functions/_lib/supabase.js` and `seneca_ai/netlify/functions/_sdk/supabase.js` are intentionally separate files with near-identical logic. The two repos deploy to separate Netlify sites and cannot share runtime modules. Any future divergence between them is intentional, not drift.

### 7-day stale window

If `diagnostic_started_at` is older than 7 days and `diagnostic_completed_at` is null, `assessment.html` renders a stale-state error instead of resuming. The user must contact support to reset. This prevents stale diagnostic data from influencing the Seneca model.

---

## synthesis.html contract

`synthesis.html` is a placeholder for Feature 4. The `?session_ref=` query parameter **must be preserved** in any redirect chain that leads to this page — it is the primary handle for the post-diagnostic insight fetch.

Future: Feature 4 will call a new function (e.g. `vector-get-diagnostic-insights`) with the session_ref to render domain-level performance breakdown.

---

## Question set

30 questions (12 RW, 18 Math). Final locked set in `diagnostic/QUESTION_SET.js`.

Three SPR swaps applied before lock (all Kevin-approved 2026-04-30):
- `alg_e_010` → `alg_e_005`: cleaner easy linear-equation word problem
- `alg_h_001` → `alg_h_007`: source item had broken equation data
- `mt02-m1-22` → `mt03-m1-22`: same trig question, cleaner data copy

Full candidate analysis and adjudication history: `docs/DIAGNOSTIC_QUESTION_SET_CANDIDATES.md`

---

## Schema changes (2026-05-02_diagnostic_flow.sql)

```sql
-- New constraint (idempotent guard)
ALTER TABLE seneca_limb_bridges ADD CONSTRAINT uq_bridges_user_limb
  UNIQUE (seneca_user_id, limb_name);

-- New columns on seneca_limb_bridges
ALTER TABLE seneca_limb_bridges
  ADD COLUMN IF NOT EXISTS diagnostic_started_at  timestamptz NULL,
  ADD COLUMN IF NOT EXISTS diagnostic_completed_at timestamptz NULL;

-- New columns on vector_question_attempts
ALTER TABLE vector_question_attempts
  ADD COLUMN IF NOT EXISTS time_to_first_action_seconds int4 NULL,
  ADD COLUMN IF NOT EXISTS answered_by_idk bool NULL DEFAULT false;
```

Migration is in `seneca_ai/sql/2026-05-02_diagnostic_flow.sql`. Apply manually to Supabase — do NOT apply before committing this arc.

---

## SDK changes (version 0.0.1 → 0.1.0)

- `QuestionData`: added optional `timeToFirstActionSeconds` and `answeredByIdk` fields
- `ObserveParams`: added optional `skipSynthesis` flag
- `validateQuestionData`: validates optional fields when present
- `observe()`: forwards `skipSynthesis` in gateway request body when defined
- `package.json`: version bumped to 0.1.0
- dist rebuilt (both ESM and CJS)

---

## Round-1 acceptance criteria mapping

Maps all 21 round-1 ACs verbatim to their implementing file/function/test.
Gaps are surfaced explicitly; no AC is omitted or fabricated.

| # | AC | Implementation | Test/Manual |
|---|---|---|---|
| 1 | /welcome route exists with locked verbatim copy | `welcome.html` (full file; body copy set in FP3.4) | manual verification only — V0.2 backlog item to add automated test |
| 2 | Post-signup routing (incomplete diagnostic → /welcome; completed → /profile or /assessment) | `js/app.js` `_routeAuthedUser()` | manual verification only — V0.2 backlog item to add automated test |
| 3 | Begin-diagnostic button routes to /assessment?mode=diagnostic | `welcome.html` begin-btn onclick (`/assessment.html?mode=diagnostic`); `assessment.html` `init()` mode guard (redirects to `/welcome.html` if mode ≠ `diagnostic`) | PASS — manual verification |
| 4 | /synthesis route exists as placeholder, parses ?session_ref= | `synthesis.html` (`URLSearchParams`, `params.get('session_ref')`) | manual verification only — V0.2 backlog item to add automated test |
| 5 | KaTeX 0.16.9 loaded via CDN tags in assessment.html <head> | `assessment.html` lines 7, 64, 66 (CDN link + two deferred scripts) | manual verification only — V0.2 backlog item to add automated test |
| 6 | renderKatex() function ported with $$ and $ delimiters, throwOnError: false | `js/renderQuestion.js` `tryRenderKaTeX()` | manual (browser-only) — V0.2 backlog item to add automated test |
| 7 | CSS override .katex { font-size: 1em !important; ... } | `css/styles-bluebook.css` line 715 | manual verification only — V0.2 backlog item to add automated test |
| 8 | Question layout CSS components linked from assessment.html (already in styles-bluebook.css prior to this feature) | `assessment.html` `<link rel="stylesheet" href="css/styles-bluebook.css">` | manual verification only — V0.2 backlog item to add automated test |
| 9 | parseTextTable() ported and used for both RW and Math table passages | `js/renderQuestion.js` `parseTextTable()`, `looksLikeTable()`, `buildPassageHtml()`, `renderMath()` | manual (browser) — V0.2 backlog item to add automated test |
| 10 | renderQuestion(q) handles RW/Math layout, dual-text split, KaTeX render, SPR rejection, graph skip | `js/renderQuestion.js` `buildPassageHtml()`, `buildChoicesHtml()`, `renderStemAndChoices()`, `renderMath()` | manual (browser) — V0.2 backlog item to add automated test |
| 11 | Desmos calculator iframe + toggle button (math questions only) | `assessment.html` `#calc-panel` (Desmos iframe, always in DOM); `#calc-btn` in math nav; `toggleCalc()` function | PASS — manual verification |
| 12 | /assessment?mode=diagnostic loads QUESTION_SET.js, fetches 30 questions in fixed order | `assessment.html` `init()`, `diagnostic/QUESTION_SET.js`, `netlify/functions/vector-fetch-diagnostic-questions.js` — note: `mode` param unused; QUESTION_SET loads unconditionally | manual verification only — V0.2 backlog item to add automated test |
| 13 | renderQuestion() displays each, IDK button affordance | `assessment.html` `renderQuestion()` | manual (browser) — V0.2 backlog item to add automated test |
| 14 | Each answer recorded as vector_question_attempts via handleObserve with new fields (TTFA, IDK, position, changes) | `assessment.html` `onAnswerSelected()`, `onIdk()`, `navigateAway()`; `netlify/functions/vector-ingest-assessment-attempt.js`; `netlify/functions/_lib/translator.js` | `tests/unit/vector-ingest-assessment-attempt.test.js`, `tests/unit/translator.test.js` |
| 15 | NO mid-flight commentary (silent capture only) | `assessment.html` + `netlify/functions/vector-ingest-assessment-attempt.js` (`skipSynthesis: true` throughout stack) | `seneca_ai/tests/unit/handleObserve.skipSynthesis.test.js` |
| 16 | Resume within 7 days at position N+1 | `assessment.html` `init()` (SK_IDX restored from `sessionStorage`); `netlify/functions/vector-diagnostic-resume.js` | `tests/unit/vector-diagnostic-resume.test.js` (server); resume position: manual |
| 17 | Resume disclosure shows start date | `assessment.html` `init()` resume disclosure block — renders `#resume-disclosure` with locale-formatted start date when `resume.startedAt` is set and not stale-reset | PASS — manual verification |
| 18 | Stale beyond 7 days: server-side cleanup + reset + friendly message | `netlify/functions/vector-diagnostic-resume.js`; `assessment.html` `init()` `staleResetCompleted` branch | `tests/unit/vector-diagnostic-resume.test.js` |
| 19 | Submit of question 30: write final attempt, complete session, UPDATE diagnostic_completed_at, route to /synthesis | `assessment.html` `onSubmit()`; `netlify/functions/vector-ingest-assessment-session.js`; `seneca_ai/netlify/functions/seneca-sdk-gateway.js` `handleSessionSignal()` | `tests/unit/vector-ingest-assessment-session.test.js` |
| 20 | Diagnostic is one-time per user (revisits redirect) | `netlify/functions/vector-check-diagnostic-status.js`; `assessment.html` `init()` `DIAGNOSTIC_ALREADY_COMPLETED` branch; `js/app.js` `_routeAuthedUser()` | manual verification only — V0.2 backlog item to add automated test |
| 21 | Server-side gating on diagnostic_completed_at (data-fetch level) | `netlify/functions/vector-fetch-diagnostic-questions.js` (403 `DIAGNOSTIC_ALREADY_COMPLETED` gate before any row is returned) | `tests/unit/vector-fetch-diagnostic-questions.test.js` |
     