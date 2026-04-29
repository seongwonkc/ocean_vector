# Questionnaire Onboarding Inventory

> Generated: 2026-04-29  
> Scope: ocean_vector + seneca_ai repos  
> Purpose: Decision artifact for Kevin before questionnaire removal begins.  
> All claims backed by file path and line reference. No guesses.

---

## Section 1: Surface Inventory

Every UI surface that solicits questionnaire input today.

---

### Surface 1A — seneca_ai/onboarding.html  
**Route:** `/onboarding`  
**File:** `seneca_ai/onboarding.html`

**Flow structure** (`SURVEY_VIEWS` constant, line 58):  
`context → bigfive → howlearn → interests → freeform → done_survey`

**Question count visible to user: ~17 across 5 screens**

| Screen | Questions | Source |
|--------|-----------|--------|
| context | 2 (age_range + life_context multi-select) | onboarding.html lines 191–203 |
| bigfive | 10 IPIP forced-choice pairs | `IPIP_META` lines 33–46; question text in `i18n/en.js` lines 204–215 |
| howlearn | 4 multiple-choice (driver, stuck, depth, ending) | `i18n/en.js` lines 197–201 |
| interests | multi-select (interest tags) | onboarding.html lines 268–279 |
| freeform | 3 short-answer (dormant, curious, gap) | `i18n/en.js` lines 173–180 |

**Write path:**  
`onboarding.html` `saveSurvey()` (line 523) → `SenecaAuth.client.from('seneca_users').update(patch).eq('id', user.id)` (line 550)  
Direct Supabase client write. No Netlify function intermediary.

**Columns written to `seneca_users`:**

| Column | Source field | Notes |
|--------|-------------|-------|
| `openness` | `bf.O` from `computeBigFive()` | Hardcoded confidence 0.3 |
| `conscientiousness` | `bf.C` | Hardcoded confidence 0.3 |
| `extraversion` | `bf.E` | Hardcoded confidence 0.3 |
| `agreeableness` | `bf.A` | Hardcoded confidence 0.3 |
| `neuroticism` | `bf.N` | Hardcoded confidence 0.3 |
| `openness_confidence` | 0.3 (hardcoded) | |
| `conscientiousness_confidence` | 0.3 (hardcoded) | |
| `extraversion_confidence` | 0.3 (hardcoded) | |
| `agreeableness_confidence` | 0.3 (hardcoded) | |
| `neuroticism_confidence` | 0.3 (hardcoded) | |
| `motivation_type` | `S.learn.driver` | howlearn screen |
| `completion_style` | `S.learn.depth` | howlearn screen |
| `recovery_strategy` | `S.learn.stuck` | howlearn screen |
| `session_ending` | `S.learn.ending` | howlearn screen |
| `interests` | `S.interests` (Set → Object) | interests screen |
| `dormant_interest` | `S.dormant` | freeform screen |
| `curiosity_anchor` | `S.curious` | freeform screen |
| `learning_gap` | `S.gap` | freeform screen |
| `age_range` | `S.age_range` | context screen |
| `life_context` | `S.life_context` | context screen |

**Client modules involved:** `seneca-auth.js` (SenecaAuth), inline JS in onboarding.html

**Columns in scope but NEVER written by any surface:**  
`fluid_reasoning`, `processing_speed`, `working_memory`, `need_for_cognition`, `test_anxiety_tolerance`,  
`preferred_format`, `preferred_depth`, `content_discovery`, `optimal_time`, `engagement_frequency`,  
`primary_why`, `success_signal`  
These columns exist in the schema with `default: 3` (numeric) or `default: null` (text) but no UI surface writes them. They are legacy / forward-declared columns that were never wired up.

---

### Surface 1B — ocean_vector/assessment.html (personality view)  
**Route:** `/assessment`  
**File:** `ocean_vector/assessment.html`

**Flow structure** (`VIEW_IDX` constant, line 309):  
`intake → personality → rw1 → rw2 → math → done`

**Question count visible to user: 10 forced-choice pairs**  
`PERSONALITY_PAIRS` defined in `ocean_vector/js/data.js` lines 7–28  
(pairs probe O vs C, C vs N, N vs E, N vs A, C vs A, C vs E, O vs E, O vs A, O vs N traits)

**Write paths (two):**

*Path 1 — Primary (all users, IS_DEV=false):*  
`assessment.html` completion → `VectorDB.saveAssessmentResults()` (`js/supabase.js` lines 107–133)  
→ Supabase `students` table upsert (direct browser anon-key write)

Columns written to `students`:

| Column | Source |
|--------|--------|
| `profile_code` | `S.profileCode` from `assignProfile(oceanScores)` (scoring.js line 38) |
| `profile_O` | `S.oceanScores.O` |
| `profile_C` | `S.oceanScores.C` |
| `profile_N` | `S.oceanScores.N` |
| `profile_E` | `S.oceanScores.E` |
| `profile_A` | `S.oceanScores.A` |

*Path 2 — IS_DEV path (dev/testing only):*  
`assessment.html` lines 720–733 → `saveSession()` from `js/scoring.js`  
→ Supabase `vector_sessions` table (direct browser write)  
Columns: `personality_responses`, `ocean_scores`, `profile_code`

**Compute chain for both paths:**  
`PERSONALITY_PAIRS` (data.js line 7) → user responses → `computeOceanScores()` (scoring.js line 7)  
→ `assignProfile()` (scoring.js line 38) → `profileCode` string (e.g. `'OCN'`, `'ocn'`, `'Ocn'`)

**Client modules involved:** `js/data.js` (PERSONALITY_PAIRS, TRAIT_MAX), `js/scoring.js` (computeOceanScores, assignProfile), `js/supabase.js` (VectorDB.saveAssessmentResults)

---

### Surface 1C — ocean_vector/quiz.html (standalone quiz flow)  
**Route:** `/quiz.html`  
**File:** `ocean_vector/quiz.html`

**Question count:** Uses same `PERSONALITY_PAIRS` from `data.js` — 10 pairs (confirmed by `quiz.html` loading `data.js` and `scoring.js`)

**Write path:**  
`quiz.html` → `localStorage.setItem('vector_quiz', JSON.stringify({profileCode, scores}))` (results.html line 498 confirms this is the read-back format)  
Does NOT write to Supabase directly.  
The `results.html` page reads from this localStorage key.

**Columns written:** None to DB. profileCode + raw O/C/N/E/A counts in localStorage only.

**Client modules involved:** `js/data.js`, `js/scoring.js`

---

## Section 2: Read-Site Classification

Every code path that reads any in-scope questionnaire column. Classified LIVE / VESTIGIAL / UNCERTAIN.

---

### Read Site 2A — ocean_vector/js/scoring.js — `generateReport()` — **LIVE**
**File:** `ocean_vector/js/scoring.js`  
**Function:** `generateReport(sessionData)` — line 233 through end of file  
**Columns read:** `oceanScores.O/C/N/E/A`, `profileCode` (passed as parameters; originate from questionnaire responses)

**What it does with them:**
- Section 1 "Your OCEAN Profile" — renders all 5 trait bars via `renderTrait()` (line 312), displays profile label and tagline from `PROFILES[profileCode]`
- Section 3 "Where Personality Meets Performance" — trait classifications feed narrative copy; `buildOceanModifier(domainKey, oceanScores)` (line ~491) injects profile-specific prescription modifiers into Section 5
- Section 4 "Your Learning Blueprint" — `profile.sessionStructure`, `profile.feedbackStyle`, `profile.practiceFormat`, `profile.pressureManagement` all keyed by `profileCode`
- Section 5 "Priority Targets" — `buildOceanModifier()` checks N_high, O_high, C_low, C_high, O_low to inject profile-specific drill prescriptions

**Classification: LIVE**  
OCEAN scores and profileCode materially control the content of 4 of 5 report sections. A user with default-3 scores receives 'ocn' profileCode → rendered as if they have measured moderate-O, moderate-C, low-N — wrong but confident-looking output.

---

### Read Site 2B — ocean_vector/dashboard.html — OCEAN trait bars — **LIVE**
**File:** `ocean_vector/dashboard.html`  
**Lines:** 322, 330–414  
**Columns read:** `profile_code` (line 322), `profile_O`, `profile_C`, `profile_N`, `profile_E`, `profile_A` (line 334 via `profile['profile_' + t]`)  
**Source:** `VectorDB.getStudentProfile()` → `supabase.js` lines 105–113 → `students.select('*')`

**What it does with them:**  
Renders animated OCEAN trait bar display (lines 330–414) showing O/C/N/E/A as colored fill bars with `high`/`moderate`/`low` labels. Displayed on the student dashboard as a persistent UI element.

**Classification: LIVE**  
Trait bars are directly user-visible in the dashboard. A student with default-3 `profile_O/C/N/E/A` would see moderate bars across all traits — false signal, not absence of signal.

---

### Read Site 2C — ocean_vector/consultant.html — consultant report — **LIVE**
**File:** `ocean_vector/consultant.html`  
**Lines:** 152 (`profile_code`), 178 (`personality_responses`), 187–188 (`ocean_scores`, `profile_code`)  
**Columns read:** `profile_code`, `personality_responses`, `ocean_scores` — from `vector_sessions` table rows  
**Write source:** `saveSession()` in scoring.js writes these to `vector_sessions` (IS_DEV path, Surface 1B Path 2)

**What it does with them:**  
Lines 171–194: re-hydrates session data from DB row, passes `oceanScores` and `profileCode` to `generateReport()` (same function as Read Site 2A). Entire consultant report — the product Kevin uses with students — is generated from this.

**Classification: LIVE**  
The consultant report is the primary deliverable of the DanielLab workflow. Without valid OCEAN scores the report either renders with fake-moderate-trait content (default 3) or requires explicit null-guard fallback.

---

### Read Site 2D — ocean_vector/results.html — profile results page — **LIVE**
**File:** `ocean_vector/results.html`  
**Lines:** 382–386, 498–511  
**Columns read:** `profileCode` and `scores` (O/C/N/E/A counts) — from `localStorage.getItem('vector_quiz')` (line 498); set by quiz.html flow  
**Fallback:** `RESULTS_COPY[profileCode] || RESULTS_COPY['ocn']` (line 384)

**What it does with them:**  
Renders profile-specific results page: headline, body copy, SAT pattern paragraph, profile badge — all keyed by `profileCode`. If `profileCode` is missing, falls back to `'ocn'` copy.

**Classification: LIVE**  
Results page renders meaningfully different content per profile. The `'ocn'` fallback is not a null state — it is specific copy written for the ocn profile that will display as if it describes the user.

---

### Read Site 2E — seneca_ai/netlify/functions/seneca.mjs — LLM prompt context — **VESTIGIAL** (questionnaire columns not read)
**File:** `seneca_ai/netlify/functions/seneca.mjs`  
**Lines:** 38, 50  
**Columns accessed:** `baseline_directive` only — via `select=baseline_directive` on `seneca_users`  

**What it does with them:**  
`baseline_directive` (Haiku-generated from behavioral `seneca_memory` rows, not from questionnaire) is injected into the LLM system prompt via `fetchMemoryContext()`.

**Classification: VESTIGIAL** (for questionnaire columns)  
None of the in-scope questionnaire columns (openness, neuroticism, motivation_type, etc.) are in the SELECT clause or used in the prompt. `baseline_directive` is behaviorally derived, not questionnaire-derived. The PERSONA_BLOCK phrase "Adapt silently. Never name the trait you are accommodating." (line 152) refers to behavioral memory observations, not Big Five scores.

---

### Read Site 2F — seneca_ai/netlify/functions/seneca-sdk-gateway.js — `handleGetUserModel()` — **VESTIGIAL** (questionnaire columns not read)
**File:** `seneca_ai/netlify/functions/seneca-sdk-gateway.js`  
**Lines:** 417–421  
**Columns accessed:** `current_phase, agt_orientation, agt_confidence, total_sessions, language` — explicit SELECT

**Classification: VESTIGIAL** (for questionnaire columns)  
Questionnaire trait columns are explicitly absent from the SELECT list. The function returns `agtOrientation`, `agtConfidence`, `language`, `totalSessions`, `phase`, `baselineDirective`, and `activeMemories` — none sourced from Big Five or cognitive/preference columns.

---

### Read Site 2G — seneca_ai/netlify/functions/_sdk/buildUserExport.js — Rule 8 export — **VESTIGIAL**
**File:** `seneca_ai/netlify/functions/_sdk/buildUserExport.js`  
**Columns accessed:** All `seneca_users` columns (in SOURCE_TABLES list; full row fetch)  
**Purpose:** Constructs user data export payload for download

**Classification: VESTIGIAL**  
Export reads all columns to hand back to the user — it is a passthrough. No behavioral decisions, recommendations, or LLM context are derived from the questionnaire values here. The questionnaire columns appear in the exported JSON blob but do not affect system behavior.

---

### Read Site 2H — seneca_ai/netlify/functions/seneca-baseline-refresh.js — baseline generation — **VESTIGIAL** (questionnaire columns not read)
**File:** `seneca_ai/netlify/functions/seneca-baseline-refresh.js`  
**Lines:** 91, 107  
**Columns accessed:** `seneca_memory.id,observation` (line 91), `seneca_baseline_cache.directive,computed_at` (line 107)  
**Write:** `seneca_users.baseline_directive` and `baseline_synthesized_at` only (line 140)

**Classification: VESTIGIAL** (for questionnaire columns)  
Reads only behavioral memory observations to generate the baseline directive. Questionnaire columns are not consulted at any point in the refresh pipeline. The baseline directive is the output of Haiku reasoning over behavioral observations, not a transform of self-reported traits.

---

### Read Site 2I — ocean_vector/js/supabase.js — `getStudentProfile()` — **LIVE** (feeds 2B)
**File:** `ocean_vector/js/supabase.js`  
**Lines:** 105–113  
**Columns accessed:** `students.select('*')` — fetches all columns including `profile_O/C/N/E/A`

**Classification: LIVE**  
Acts as the data layer for dashboard.html (Read Site 2B). Not independently live, but the live classification flows through it — this is where the columns enter the rendering pipeline.

---

### Uncertain Cases for Kevin's Manual Review

None identified with confidence. All read sites have clear file:line references and deterministic control flow. The closest to uncertain is `seneca.mjs` line 152 ("Adapt silently. Never name the trait you are accommodating.") — this reads as trait-awareness in the prompt, but confirmed by source inspection that no questionnaire columns are injected into that prompt. The instruction is static persona text, not dynamically generated from user data.

---

## Section 3: Path Recommendation

**Recommendation: Path (b) — migrate defaults to NULL, force null-safe reads on all LIVE sites.**

**Reasoning:**

Four of the nine read sites are LIVE (2A, 2B, 2C, 2D). All four are in ocean_vector. Three of them (2A, 2B, 2C) render user-visible output driven by questionnaire scores. If defaults stay at 3, every new user post-removal receives fabricated-but-credible OCEAN profile content:

- `O=3, C=3, N=3, E=3, A=3` → `assignProfile()` returns `'ocn'` → student sees the `'ocn'` profile label, tagline, and learning blueprint — content written specifically for that profile, presented as if it describes them
- Dashboard trait bars render at ~30% fill across all five traits — a real-looking but meaningless signal
- Consultant report renders a full Section 1–4 from `PROFILES['ocn']` — no indication to the consultant that this student has no measured data

Default=3 produces silent wrong-but-confident output. Default=NULL forces each read site to explicitly handle the no-data case — a bounds check or guard that can render "your profile is building" or simply skip OCEAN sections. That is the correct engineering behavior.

**Null-safety scope is bounded and entirely within ocean_vector.** The four seneca_ai read sites (2E, 2F, 2G, 2H) do not read questionnaire columns and require no changes. The changes needed:

1. `scoring.js generateReport()` — guard `if (!oceanScores || !profileCode)` before Sections 1, 3, 4, and `buildOceanModifier()` calls in Section 5
2. `dashboard.html` — guard trait bar rendering block (lines 330–414) when `profile_O` through `profile_A` are all null
3. `results.html` — treat null profileCode as "no questionnaire taken" rather than silently falling back to `'ocn'` copy
4. `consultant.html` — hydration guard at line 187 when `ocean_scores` is null

The migration of defaults (ALTER TABLE on `seneca_users` and on `students`) should be applied atomically with the questionnaire UI removal commit — not as a separate pass — so there is no window where new users receive default-3 scores.

**Schema columns that are effectively dead (never written, only defaulted):**  
`fluid_reasoning`, `processing_speed`, `working_memory`, `need_for_cognition`, `test_anxiety_tolerance`, `preferred_format`, `preferred_depth`, `content_discovery`, `optimal_time`, `engagement_frequency`, `primary_why`, `success_signal`  
These can have their defaults changed to NULL as part of the same migration with zero read-site impact — no code reads them.

Kevin decides.
