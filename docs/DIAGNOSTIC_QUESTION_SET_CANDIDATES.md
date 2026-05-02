# Diagnostic Question Set Candidates

**Status: LOCKED — Feature 3 shipped 2026-05-02. Authoritative set in `diagnostic/QUESTION_SET.js`.**

**Revision:** v5 — Three SPR swaps applied (Kevin-approved 2026-04-30). eoi_t_043 adjudicated as correct by Kevin. Set is locked.

### SPR swap summary (v4 -> v5)

| Row | Original ID | Replacement ID | Reason |
|-----|------------|----------------|--------|
| 13  | `alg_e_010` | `alg_e_005` | Simpler linear-equation word problem; cleaner as diagnostic easy-Math entry |
| 17  | `alg_h_001` | `alg_h_007` | Source item had broken equation data (missing expression in question_text) |
| 23  | `mt02-m1-22` | `mt03-m1-22` | Same trig-ratio question, clean data copy from different test module |

---

## Discovery Findings (Pre-Selection Gates)

Two schema gaps carried forward from v1. Unchanged.

### Gap 1 — No calculator-split column in `questions` table

The source DanielLab JS files contain a `calcAgnostic` field, but it was not mapped to a column during seeding. No `calc_allowed` or `calc_agnostic` field exists in the Supabase `questions` table.

**Recommendation for v0.1:** label all Math as "Math" with no calculator split. Flag for a future migration.

### Gap 2 — Geometry and PSDA have no easy-difficulty questions

No `geo_e_*` or `psda_e_*` IDs exist in the DB. Both domains are medium/hard only.

| Domain | Rows | Easy | Medium | Hard |
|---|---|---|---|---|
| algebra | 80 | ✅ (8 rows) | ✅ | ✅ |
| advanced_math | 66 | ✅ (8 rows) | ✅ | ✅ |
| geometry | 21 | ❌ none | ✅ | ✅ |
| psda | 21 | ❌ none | ✅ | ✅ |

All easy-math diagnostic slots must come from algebra and advanced_math.

---

## Distribution Summary (30 candidates — v2)

| Dimension | Breakdown |
|---|---|
| Section | RW: 12 · Math: 18 |
| Difficulty | Easy: 8 · Medium: 12 · Hard: 10 |
| RW domains | craft_structure: 4 · info_ideas: 4 · sec: 2 · eoi: 2 |
| Math domains | algebra: 5 · advanced_math: 4 · geometry: 5 · psda: 4 |
| RW question types (8 distinct) | cs_main_purpose(1) · cs_cross_text(3) · ii_central_ideas(1) · ii_coe_q(3) · sec_form_structure(1) · sec_boundaries(1) · eoi_synthesis(1) · eoi_transition(1) |
| Math question types (11 distinct) | linear_eq · linear_func_interp · factor_polynomial · linear_equation(2) · sum_of_solutions · exponent_rules · quad_eq · discriminant_count · polynomial_factor · geometry(3) · trigonometry · probability · ratio_percent · statistics(2) |
| Max single-type share | RW: 25% (3/12) · Math: 17% (3/18) — both ≤ 40% ✓ |
| Estimated dense-vocab RW items (density ≥ 3) | ≥ 4 (rows 2, 3, 4, 8) |

---

## Candidate Table

> **`vocab_density_kevin_rating`** column is blank. Please rate 1–5 after reviewing actual passage text:
> 1 = plain conversational · 2 = moderate vocabulary · 3 = academic register · 4 = dense discipline-specific · 5 = graduate-level abstraction

| # | question_id | subject | difficulty | question_type | stem_len_chars | passage_len_chars | one_line_summary | variance_dimension_covered | vocab_density_kevin_rating |
|---|---|---|---|---|---|---|---|---|---|
| 1 | cs_c_029 | RW – Craft & Structure | medium | cs_main_purpose | 54 | 602 | Single text: identify main purpose (medium) | Mid-length passage; moderate complexity; CS baseline | |
| 2 | cs_c_207 | RW – Craft & Structure | hard | cs_cross_text | 75 | 1035 | Rawls vs. Nozick — political philosophy disagreement | Long dual-text; political philosophy; hard; ~density 5 | |
| 3 | cs_c_209 | RW – Craft & Structure | hard | cs_cross_text | 101 | 1053 | Dehaene vs. Tononi — competing consciousness theories | Neuroscience register; hard dual-text; ~density 4–5; different domain from #2 | |
| 4 | cs_c_146 | RW – Craft & Structure | medium | cs_cross_text | 96 | 1010 | Dawkins/Sperber — meme concept challenged by epidemiology of representations | Evolutionary biology + cultural theory; medium dual-text; ~density 4 | |
| 5 | ii_c_001 | RW – Info & Ideas | easy | ii_central_ideas | 100 | 519 | Bioluminescence ocean vs. land — central ideas | Science content; easy; correctly labeled ii_central_ideas (see Revision Note E) | |
| 6 | ii_c_192 | RW – Info & Ideas | easy | ii_coe_q | 80 | 370 | Soil pH / tomato plant growth — data claim from table | Short passage + table; quantitative CoE; low vocab load | |
| 7 | ii_c_031 | RW – Info & Ideas | hard | ii_coe_q | 76 | 962 | Long quantitative passage — data-to-claim support | Longest II passage (962 chars); hard CoE; data-dense | |
| 8 | ii_c_025 | RW – Info & Ideas | medium | ii_coe_q | 76 | 864 | Wolf reintroduction in Yellowstone — ecology + data table | Ecology scientific register; medium CoE; ~density 3; new addition | |
| 9 | sec_f_001 | RW – Std English Conv | easy | sec_form_structure | 91 | 193 | Form & structure — short passage | Shortest-passage SEC; grammar baseline; density 1 | |
| 10 | sec_b_018 | RW – Std English Conv | hard | sec_boundaries | 91 | 243 | Sentence boundary — hard variant | Same question form as #9; difficulty step-up; tests error discrimination | |
| 11 | eoi_s_001 | RW – Expression of Ideas | easy | eoi_synthesis | 95 | 665 | Synthesis from notes — easy | Notes-format passage (unique format); easy synthesis | |
| 12 | eoi_t_043 | RW – Expression of Ideas | hard | eoi_transition | 65 | 631 | Logical transition — hard | Structural reasoning; hard transition; mid-length passage | |
| 13 | alg_e_010 | Math – Algebra | easy | linear_eq | 116 | 0 | Word problem: flat fee + per-unit rate → solve for count | Applied context; word-problem linear equation; easy | |
| 14 | alg_e_009 | Math – Algebra | easy | linear_func_interp | 180 | 0 | P(d) = 200 + 40d bacteria growth — interpret slope/intercept | Longest easy stem; function interpretation; applied | |
| 15 | alg_m_007 | Math – Algebra | medium | factor_polynomial | 56 | 0 | Factor 14x³ − 21x² — equivalent expression | Short stem; pure symbolic manipulation; no context | |
| 16 | mt03-m1-01 | Math – Algebra | medium | linear_equation | 80 | 0 | y-intercept of graphed linear function | Graph reading; medium complexity | |
| 17 | alg_h_001 | Math – Algebra | hard | sum_of_solutions | 55 | 23 | Sum of solutions to equation — expression form | Short stem; non-routine algebraic insight; hard | |
| 18 | adv_e_003 | Math – Advanced Math | easy | exponent_rules | 50 | 0 | x⁵ · x³ — identify equivalent expression | Shortest math stem; pure rule recall | |
| 19 | adv_e_005 | Math – Advanced Math | easy | quad_eq | 45 | 20 | Solve quadratic equation — easy | Short stem + context; standard quad solve | |
| 20 | adv_m_005 | Math – Advanced Math | medium | discriminant_count | 62 | 20 | Count distinct real solutions using discriminant | Conceptual; discriminant reasoning; medium | |
| 21 | adv_h_001 | Math – Advanced Math | hard | polynomial_factor | 176 | 0 | Factor 4x² + bx + 10 into (hx+k)(x+j) — find b | Long stem; multi-step symbolic; hard polynomial | |
| 22 | mt01-m1-08 | Math – Geometry | medium | geometry | 45 | 0 | Angle measure B in triangle (diagram) | Short stem; diagram-dependent; angle reasoning | |
| 23 | mt02-m1-22 | Math – Geometry | medium | trigonometry | 59 | 0 | tan A in right triangle (diagram) | Trig ratio; diagram-dependent; medium | |
| 24 | mt03-m1-03 | Math – Geometry | medium | geometry | 184 | 0 | Scale factor applied to square → find new area | Long stem; spatial + proportional reasoning; medium | |
| 25 | mt01-m2h-11 | Math – Geometry | hard | geometry | 77 | 0 | Circle through (4, 2) — find radius r from equation | Coordinate geometry; requires circle equation knowledge | |
| 26 | mt03-m2h-06 | Math – Geometry | hard | geometry | 163 | 0 | Two circles: N (r=6mm), M (area=121π) — find combined area | **SWAP** (see Note A): multi-step circle area; requires A=πr² and back-calculation | |
| 27 | mt03-m1-02 | Math – PSDA | medium | probability | 182 | 51 | Rock classification table — P(igneous) from total of 70 | **SWAP** (see Note B): probability; distractor traps use wrong denominator (38, 60, 22) | |
| 28 | mt01-m1-22 | Math – PSDA | medium | ratio_percent | 149 | 0 | Percent chain: a is 80% greater than b; c is 60% less than a; find c/b | **SWAP** (see Note G): two compounding traps — "80% greater" ≠ ×0.8; "60% less" ≠ ×0.6; no diagram; answer 0.72 | |
| 29 | mt02-m1-07 | Math – PSDA | medium | statistics | 361 | 0 | 40-employee survey — inference and generalizability | Longest math stem; statistical reasoning; real-world context | |
| 30 | mt01-m2h-13 | Math – PSDA | hard | statistics | 134 | 0 | Min score for target mean — multi-step reverse calculation | Sum 5 scores → set up (445+x)/6 ≥ 90 → x ≥ 95; confirmed hard | |

---

## Passage Content Excerpts (new additions for vocab rating context)

**#3 cs_c_209** (Dehaene/Tononi, neuroscience):
> "Neuroscientist Stanislas Dehaene proposed the Global Workspace Theory of consciousness: consciousness arises when neural signals are broadcast widely across the brain through a 'global workspace'..."

**#4 cs_c_146** (Dawkins/Sperber, cultural evolution):
> "Evolutionary biologist Richard Dawkins proposed the concept of the 'meme' in The Selfish Gene (1976) as a cultural analog to the gene: a unit of cultural transmission that replicates across minds..."

**#8 ii_c_025** (wolf reintroduction, ecology):
> "Ecologists hypothesized that reintroducing wolves to Yellowstone National Park would suppress elk populations, which had been overgrazing riparian vegetation. Data collected over fifteen years following reintroduction..."

---

## Revision Notes

### Item A — Re-tiered #26: trivial rectangle area (mt01-m2h-07) → replaced

**Verification:** confirmed content is `12 × 6 = 72` (SPR, no answer choices). Zero conceptual difficulty, placed in hard module 2 tier by seeding artifact. Not diagnostic.

**Action:** dropped. Replaced with `mt03-m2h-06` (combined area of two circles where one area is given as 121π and you derive the other via A=πr²). Multi-step, requires formula knowledge. Still in hard tier; Kevin should confirm this is meaningfully harder during review.

### Item B — Re-tiered #27: trivial unit conversion (mt03-m1-18) → replaced

**Verification:** confirmed content is `47 × 100 = 4700` with conversion factor explicitly given (SPR). Single arithmetic step; no reasoning required. Not appropriate for a medium-difficulty slot.

**Action:** dropped. Replaced with `mt03-m1-02` (probability from a 3-class rock table with n=70; distractors use wrong denominators 38, 60, 22 instead of total 70 — tests whether students read the full table). Solid medium question.

### Item C — Swapped 3 low-density RW items for dense-vocab items

**Dropped:**
- `cs_c_072` (easy, cs_main_purpose) — redundant with #2 (cs_c_029, same type)
- `sec_b_001` (easy, sec_boundaries) — lowest-density SEC; sec_f_001 (#9) covers SEC easy already
- `eoi_t_001` (easy, eoi_transition) — lowest-density EOI; eoi_s_001 (#11) covers EOI easy; eoi_t_043 (#12) covers EOI transition already

**Added:**
- `cs_c_209` (hard, cs_cross_text) — Dehaene vs. Tononi on consciousness; neuroscience register; clearly different content domain from Rawls/Nozick (#2)
- `cs_c_146` (medium, cs_cross_text) — Dawkins/Sperber on cultural meme theory; evolutionary biology + cognitive science
- `ii_c_025` (medium, ii_coe_q) — wolf reintroduction ecology study with data table; scientific academic register

Result: RW now has 4 items estimated at vocab_density ≥ 3, covering philosophy, neuroscience, evolutionary biology, and ecology. No two dense-vocab items share a content domain.

**Side effect:** craft_structure grows to 4 items; sec and eoi each drop to 2 items. Still ≥2 per domain and total stays 12.

### Item D — Corrected label error on #28 (mt03-m1-07)

**Verification:** stem says "What is the **mean** score?" — prior candidate file said "mode from 10-student quiz score list." Confirmed mean calculation: Σ = 10+14+22+6+24+26+14+8+8+8 = 140; 140/10 = 14. Answer C correct.

**Action:** corrected one_line_summary from "Mode from 10-student quiz score list" to "Mean score from 10-student quiz list." No question swap needed.

### Item E — Verified taxonomy of #5 (ii_c_001, bioluminescence)

**Verification:** the stem asks "what **distinguishes** bioluminescence in the ocean from bioluminescence on land?" — the correct answer is that ocean bioluminescence is far more common (76% of marine organisms vs. fireflies as the terrestrial example). This is the main claim of the passage, not a supporting detail or CoE inquiry. `ii_central_ideas` label is accurate. No change.

### Item G — Replaced #28: mean-from-list (mt03-m1-07) → percent chain (mt01-m1-22)

**QA finding (Kevin + GPT):** `mt03-m1-07` ("What is the mean score?" for 10 values summing to 140) is routine arithmetic — sum and divide, no traps, no multi-step reasoning. Confirmed easy content in a medium module slot.

**Discovery pool surfaced (medium PSDA not already in v2 set):**

| question_id | type | why medium |
|---|---|---|
| `mt01-m1-22` | ratio_percent | Two-step percent chain with two independent traps: "80% greater than b" → must multiply by 1.8, not 0.8; "60% less than a" → must multiply by 0.4, not 0.6. Distractors (0.32, 1.08, 4.50) cover every likely error path. |
| `mt01-m1-19` | statistics | Two datasets shifted by 1 unit — correct answer is "same SD." Tests conceptual knowledge that SD measures spread, not location. A data table is provided (no diagram). |
| `mt02-m1-20` | ratio_percent | Three-planet percent chain (Earth → Jupiter → Neptune → r%). Multi-step and hard to set up, but stem is 243 chars, too close to #29's long-stem variance. |

**Pick: `mt01-m1-22`.** Strongest signal of genuine medium difficulty: two compounding vocabulary traps in a clean 149-char stem, no diagram dependency, multi-step without being long, and adds type variety (ratio_percent) not previously covered in PSDA. Runner-up `mt01-m1-19` is also excellent — flag it as a backup if Kevin finds the percent chain too computation-heavy for the diagnostic opener.

**Distribution impact:** 12 medium / 8 easy / 10 hard — unchanged. Math question type count increases from 10 to 11 distinct types (ratio_percent added; statistics drops from 3 to 2).

### Item F — V0.2 backlog: math taxonomy granularity

The 4 geometry questions in the set (rows 22–26) are all labeled `question_type: geometry`. This is too coarse for Seneca's downstream skill-observation model (a student struggling with circle-equation coordinate geometry should not be conflated with a student struggling with angle-in-triangle reasoning).

**Backlog item for V0.2:** Add a `skill_tag` or `subtype` column to the `questions` table for math rows. Proposed subtypes for geometry: `triangle_angle`, `coordinate_circle`, `scale_factor`, `parallel_lines_angle`, `trig_ratio`, `volume_surface_area`. Apply retroactively to all 21 geometry rows during a one-time seeding pass. Out of scope for this sprint.

### V0.2 Backlog Item 1 — Retag mt03-m1-01 question type

`mt03-m1-01` is currently tagged `question_type: linear_equation`. The stem asks for the y-intercept of a graphed linear function — that is function interpretation (reading a graph), not solving an equation. Correct tag is `linear_function_interpretation`.

**Action:** update `question_type` for `mt03-m1-01` during v0.2 taxonomy cleanup pass. Affects skill-observation routing downstream.

### V0.2 Backlog Item 2 — Post-pilot difficulty watch: cs_c_146

`cs_c_146` is stored as `difficulty: medium` (Dawkins/Sperber meme theory dual-text; 1,010-char passage; vocab density ~4). Passage length, dual-text format, and technical register (evolutionary biology + cognitive science) are more consistent with hard-tier RW items in this set. The medium label may be a seeding artifact or a genuine borderline case.

**Action:** track per-student accuracy on `cs_c_146` in pilot. If accuracy falls in the ≤40% range (typical hard-item range) rather than 50–65% (medium), retag to hard in the next taxonomy pass.

### Item H — v4 Final QA Verification: outcomes and lock status

Three verifications run 2026-04-30. Status: **NOT YET LOCKED — two items require Kevin adjudication before Feature 3 implementation begins.**

**Verification 1 — sec_b_018 (hard SEC): PASS**

The item discriminates between sentences where a proper name is logically essential to identifying the referent (restrictive — no commas) versus where it is supplementary information (non-restrictive — commas required). Here the name "Le Corbusier" is the only viable referent; it is not logically separable from "the architect." A student must apply a genuine boundary rule, not a surface pattern. Hard tier is earned. No change to set.

**Verification 2 — eoi_t_043 (hard EOI transition): UNCERTAIN — Kevin adjudication required**

Stored correct answer is **A ("For instance,")**, but the sentence following the blank is: *"a country's rank on economic output and its rank on human development are not always correlated."* That sentence is a generalization / concluding claim — not a specific example. "For instance" canonically introduces a specific example. "Ultimately" (B) or "That is" (C) are more defensible logical connectors for a summary/generalization.

**Action required:** Kevin must review the full item (Supabase `questions` table, `question_id = eoi_t_043`) and adjudicate. If the stored answer is wrong, this item must be corrected or dropped before Feature 3 ships.

**Verification 3 — math diagram rendering for #22 and #23: BROKEN — blocking for Feature 3**

The "diagrams" for `mt01-m1-08` (#22) and `mt02-m1-22` (#23) are not image files. They are LaTeX text descriptions stored in the `passage` field:
- `mt01-m1-08`: `Right triangle $ABC$ with a $90^{\circ}$ angle at $A$ and a $64^{\circ}$ angle at $C$.`
- `mt02-m1-22`: `Right triangle $ABC$ with angle $B = 90^{\circ}$, angle $C = 30^{\circ}$, and hypotenuse $AC = 124$.`

`assessment.html` (Feature-1 shell) loads no KaTeX or MathJax. Scripts present: `supabase-js@2`, `config.js`, `js/supabase.js`, `js/app.js`, `js/linkFlow.js`. The `$...$` delimiters will render as raw dollar-sign text in the browser — the right-triangle descriptions will be unreadable.

**Action required before Feature 3 ships:** Add KaTeX to the frontend. This is a one-line `<link>` + one-line `<script>` in the HTML head, plus one `renderMathInElement` call in the assessment JS. Strongly preferred over swapping #22/#23, since `$...$` notation is used across the majority of math rows in the 1,250-row DB and will be needed regardless.

---

## Notes for Kevin

- All 30 rows are `active = true` as of 2026-04-30.
- No SVG-graph questions (alg_m_001, alg_m_010) are included.
- `vocab_density_kevin_rating`: 1 = plain · 2 = moderate · 3 = academic · 4 = dense discipline-specific · 5 = graduate-level. Target is ≥ 4 items rated 3+, spread across different content domains.
- Row 26 (`mt03-m2h-06`): content is two-circle combined area. If you feel this is still insufficiently hard, a suggested alternative is `mt03-m2h-18` (circle equation in the xy-plane, requires standard form knowledge) or `mt03-m2h-22` (triangle similarity reasoning).
- Row 29 (`mt02-m1-07`): stem_len 361 is an outlier (long scenario setup). Flag if you want to tighten time estimates for the diagnostic.
- Rows 22–23 (#22 `mt01-m1-08`, #23 `mt02-m1-22`): passages are LaTeX text descriptions of right triangles (e.g. `Right triangle $ABC$ with a $90^{\circ}$ angle at $A$...`) — NOT image files. **`assessment.html` has no KaTeX or MathJax loaded.** The `$...$` notation will render as raw dollar-sign text. Feature 3 must add KaTeX before shipping, or #22/#23 must be swapped for diagram-free geometry questions. See Revision Note H.
