# Feature 1: Strip Questionnaire-Based Onboarding

> PR notes for VECTOR Feature 1. Records the inventory, decisions, and migration confirmation for the record.

**Date:** 2026-04-29
**Constitution rule enforced:** Rule 11 — "Seneca observes; it does not ask."

---

## What was removed

### Deleted files (6)

| File | What it was |
|------|-------------|
| `quiz.html` | Big Five / OCEAN questionnaire page |
| `dashboard.html` | Post-questionnaire results + trait bar dashboard |
| `consultant.html` | OCEAN-derived "consultant style" report page |
| `results.html` | Questionnaire completion results |
| `js/scoring.js` | Mixed file: OCEAN scoring + SAT scoring. Removed in full; SAT scoring to be rebuilt from ground up in Feature 3. |
| `js/data.js` | Mixed file: PERSONALITY_PAIRS + SAT question bank. Removed in full; rebuilt in Feature 3. |

### Stripped from existing files

| File | Change |
|------|--------|
| `assessment.html` | Replaced 200+ line OCEAN questionnaire shell with 87-line minimal auth placeholder. Zero OCEAN references. Feature 3 fills content. |
| `js/app.js` | `_routeAuthedUser()` simplified — no longer checks `assessment_completed` or routes to `dashboard.html`. All authed users go to `/assessment.html` until Feature 6 (/profile) and Feature 3 (/welcome) add branches. |
| `js/supabase.js` | Removed `saveAssessmentResults()` — wrote `profile_code`, `profile_N/C/O/E/A`, and 9 other questionnaire fields to `students` table. |
| `seneca-callback.html` | Two `window.location.replace('/dashboard.html')` → `/assessment.html`. |

---

## Schema migration

**File:** `seneca_ai/sql/2026-04-29_questionnaire_defaults_to_null.sql`

**What it does:** `ALTER TABLE seneca_users` — DROP DEFAULT on 15 columns:
- openness, conscientiousness, extraversion, agreeableness, neuroticism
- openness_confidence, conscientiousness_confidence, extraversion_confidence, agreeableness_confidence, neuroticism_confidence
- fluid_reasoning, processing_speed, working_memory, need_for_cognition, test_anxiety_tolerance

**Why PATH (b) (DROP DEFAULT, not DROP COLUMN):**
All 4 LIVE read sites for OCEAN columns in ocean_vector (scoring.js generateReport, dashboard.html trait bars, consultant.html report, results.html) were deleted in this same ticket. The remaining read sites in seneca_ai (seneca.mjs, seneca-sdk-gateway.js handleGetUserModel, buildUserExport.js, seneca-baseline-refresh.js) are already null-safe — they read the columns but don't fail on NULL values. Dropping DEFAULTs gives new users honest NULLs without requiring code changes to any seneca_ai read path today. Column DROP is deferred to V02 after ≥4 weeks stable (V02_BACKLOG #23).

**Kevin to apply manually to production Supabase** via the SQL editor at https://supabase.com/dashboard/project/havatrfyuqqbidleplcf/sql/new.

---

## Questionnaire write surface inventory (pre-Feature 1)

Produced as pre-task discovery artifact: `docs/QUESTIONNAIRE_ONBOARDING_INVENTORY.md`.

Summary of findings:

**3 write surfaces (all removed in this ticket):**
1. `assessment.html` inline script → `VectorDB.saveAssessmentResults()` → `students.profile_N/C/O/E/A + profile_code`
2. `js/supabase.js:saveAssessmentResults()` — the write method itself
3. `js/scoring.js:generateReport()` — produced `profileCode` consumed by surface 1

**9 read sites classified:**
- LIVE (4): scoring.js generateReport, dashboard.html trait bars, consultant.html report, results.html — all deleted in this ticket
- VESTIGIAL (5): seneca.mjs, seneca-sdk-gateway.js handleGetUserModel, buildUserExport.js, seneca-baseline-refresh.js — already null-safe, no changes needed

**12 columns confirmed never written by any UI:** fluid_reasoning, processing_speed, working_memory, need_for_cognition, test_anxiety_tolerance, and the 5 _confidence variants — these had DEFAULT 3 / DEFAULT 0.3 but no write path in ocean_vector.

---

## Null-safety confirmation

All seneca_ai read sites for the 15 questionnaire columns were verified null-safe before this ticket ran. No seneca_ai code changes required.

The `students` table (VECTOR's Supabase table) retains `profile_N/C/O/E/A` and `profile_code` columns with no default — those were already nullable with no default set. No migration needed on that table.

---

## V02 deferred items added

Three entries appended to `seneca_ai/V02_BACKLOG.md`:
- **#22:** Strip questionnaire onboarding from `seneca_ai/onboarding.html` (consumer Seneca app — companion ticket)
- **#23:** Drop questionnaire columns from `seneca_users` after ≥4 weeks stable + #22 shipped
- **#24:** Resolve `students` vs `vector_students` table redundancy

---

## Docs updated

- `seneca_ai/PROJECT_MANIFEST.json` — `seneca_users` schema: 15 questionnaire columns updated to reflect DEFAULT removed; ocean_vector html_entry_points and client_js_modules updated to remove retired files
- `ocean_vector/docs/SITE_MAP.md` — last_updated bumped; note that OCEAN-era pages were never in the map

---

## vector-link-user.js and translator.js — confirmed clean, no edit required

Both files were read and verified against acceptance criterion 12.

**`netlify/functions/vector-link-user.js`** (45 lines): Sends exactly two fields to `ingest.linkUser` — `senecaLinkToken` and `limbUserId`. No questionnaire fields at any point. No edit required.

**`netlify/functions/_lib/translator.js`** (113 lines): Defines `KNOWN_ATTEMPT_FIELDS` and `KNOWN_SESSION_FIELDS` — neither set contains any OCEAN or questionnaire field. `translateQuestionAttempts` and `translateAssessmentSession` map to SAT-session data only. No edit required.

Criterion 12 is met by absence: neither file ever sent questionnaire fields.

---

## Pre-SQL-apply gate: Codex post-impl review required

Per the PROCESS_LESSONS.md pipeline, Codex post-impl review is required before applying the migration to production. This is Kevin's step, not Cowork's. Do not apply the SQL to `havatrfyuqqbidleplcf` until Codex has signed off on:
- The migration file (`2026-04-29_questionnaire_defaults_to_null.sql`)
- The rollback block
- The null-safety claims for seneca_ai read sites

---

## Verification results

| Check | Result |
|-------|--------|
| `rg -i "ocean\|dashboard\.html\|quiz\.html\|consultant\.html\|results\.html\|saveAssessment\|profile_code\|profile_[ncoea]"` in ocean_vector `*.html *.js` | 0 matches |
| `node --check js/app.js` | OK |
| `node --check js/supabase.js` | OK |
| `npm test` (ocean_vector) | 68/68 pass, 0 fail |

---

## Routing after Feature 1

```
Authed user hits any protected page
  → VectorApp.requireAuth() (js/app.js)
  → success: stays on current page (assessment.html)
  → failure: redirect to /

Authed user hits / (index.html)
  → VectorApp.redirectIfAuthed()
  → _routeAuthedUser() → /assessment.html  [interim until Feature 6 + Feature 3]

Seneca link callback (seneca-callback.html)
  → success: redirect to /assessment.html  [was /dashboard.html]
  → error: "Go to dashboard" button → /assessment.html  [was /dashboard.html]
```
