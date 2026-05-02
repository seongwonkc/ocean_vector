# DanielLabSAT Rendering & Content Infrastructure Inventory

**Purpose:** Pre-task inventory for Feature 3. Documents what DanielLab does to render SAT questions
correctly so Feature 3 can specify exactly what needs to be ported into ocean_vector.

**Status: AWAITING KEVIN REVIEW — discovery only, no code changes made.**

**Inventory date:** 2026-04-30
**DanielLabSAT last commit:** `cc2f6a5` — "rebasing to D" — 2026-04-25 — branch `main`

---

## Summary

| Category | Count |
|---|---|
| Total infrastructure items inventoried | 14 |
| COPY-PASTE | 6 |
| ADAPT | 4 |
| REFERENCE-ONLY | 3 |
| SKIP | 1 |

**Total estimated port effort:** ~5–7 hours (small-to-medium sprint task).
The largest single item is the question renderer adapter (medium, ~3 hr).
Everything else is trivial or small.

**Critical finding:** The Supabase `passage` field is a collapsed version of DanielLab's three
separate display fields (`passage`, `katex`, `graph`). Math question "diagrams" landed in
`passage` as LaTeX text descriptions (e.g. `Right triangle $ABC$...`). The `graph` SVG data
was **not seeded** — there is no graph column in the questions table. Ocean_vector's renderer
needs to treat the `passage` field as potentially containing `$...$` LaTeX notation and pass
it through KaTeX. The KaTeX setup itself is a 3-tag CDN lift from DanielLab — trivial to port.

---

## Discovery Findings (Hard Gate)

### Gate 1 — Repo location and git status

Repo exists at `D:\GitHub\daniellabsat\daniellabsat` (one level of nesting — outer folder is
`daniellabsat`, inner is the actual repo root). Readable.

| Field | Value |
|---|---|
| Last commit hash | `cc2f6a5e1dc73425461ef4f33c3bb4f514fbf891` |
| Last commit date | 2026-04-25 17:44:42 +0900 |
| Last commit message | "rebasing to D" |
| Active branch | `main` |
| Remote origin | `https://github.com/seongwonkc/daniellabsat.git` |

### Gate 2 — Deployment status

**DanielLab is a deployed product.** Hosted on Netlify. `netlify.toml` present at repo root:

```toml
[build]
  publish = "."
  command = "echo \"const CONFIG = { SUPABASE_URL: '$SUPABASE_URL', SUPABASE_KEY: '$SUPABASE_KEY', ADMIN_PIN: '$ADMIN_PIN' };\" > config.js"
```

No build toolchain — Netlify writes `config.js` from environment variables at deploy time, then
publishes the directory as-is. Plain HTML deployment.

### Gate 3 — Relationship to ocean_vector

No shared deploy scripts, no symlinked files, no shared JS modules. The relationship is:

1. **Content seeding:** DanielLab JS data files (`data/data-*.js`, `data/mock-tests/data-mt*.js`)
   were the source for seeding the Supabase `questions` table consumed by seneca_ai / ocean_vector.
2. **Documentation references:** `ocean_vector/docs/*.md` files reference DanielLab by name as
   the source content library.
3. **Field mapping gap:** DanielLab data objects have separate `passage`, `katex`, and `graph`
   fields. During seeding, `katex` content was written to the Supabase `passage` column for math
   questions. The `graph` SVG field was not seeded (no column exists in the questions table).

---

## Section 1: Repository Structure Overview

### Depth-2 tree (abbreviated)

```
daniellabsat/
├── daniellab_practice.html       # Practice mode — primary question renderer
├── daniellab_mocktest.html       # Full mock test — adaptive module sequencer
├── daniellab_student.html        # Student dashboard
├── daniellab_dashboard.html      # Admin dashboard
├── daniellab_intake.html         # Student intake / registration
├── daniellab_login.html          # Login
├── daniellab_admin_login.html    # Admin login
├── index.html                    # Landing / redirect
├── styles-bluebook.css           # All student-facing styles (~470 lines)
├── netlify.toml                  # Netlify deploy config
├── config.js / config.example.js # Runtime Supabase config
├── CATO_PRODUCT_DEFINITION.md    # Product spec
└── data/
    ├── data-craft-structure.js   # RW Craft & Structure (60 q)
    ├── data-cs2.js … data-cs7.js # Additional CS batches
    ├── data-info-ideas.js        # RW Info & Ideas
    ├── data-ii2.js … data-ii7.js # Additional II batches
    ├── data-sec.js … data-sec3.js# RW Std English Conv
    ├── data-eoi.js … data-eoi4.js# RW Expression of Ideas
    ├── data.daniellab.math.js    # Algebra + Advanced Math practice bank
    ├── data.daniellab.rw.js      # Consolidated RW practice bank
    ├── build_math_bank.py        # Python script that generates SVG graphs
    ├── fix_dollar_signs.py       # Python script for LaTeX cleanup
    ├── alg_run_1.json … alg_run_8.json   # Source JSON for algebra bank
    ├── adv_run_9.json … adv_run_16.json   # Source JSON for advanced math bank
    └── mock-tests/
        ├── data-mt01-math.js     # Mock test 1 math modules
        ├── data-mt01-rw.js       # Mock test 1 RW modules
        ├── data-mt02-math.js
        ├── data-mt02-rw.js
        ├── data-mt03-math.js
        └── data-mt03-rw.js
```

### File counts by extension

| Extension | Count | Notes |
|---|---|---|
| `.js` | ~31 | All data files; no separate logic JS modules |
| `.json` | 16 | Algebra/advanced math source data |
| `.html` | 8 | All application pages |
| `.css` | 1 | `styles-bluebook.css` — all student styles |
| `.md` | 1 | `CATO_PRODUCT_DEFINITION.md` |
| `.toml` | 1 | `netlify.toml` |
| `.py` | 2 | Build/utility scripts |

### Build system

**None.** Plain HTML. No Vite, no Next.js, no Webpack, no npm. All logic is inline JavaScript
inside the HTML files. Data is loaded via `<script src="data/...">` tags. Netlify's build step
only writes `config.js`.

### Dependencies

**No package.json.** Runtime CDN dependencies only:

| Library | Version | Source |
|---|---|---|
| KaTeX | 0.16.9 | `cdn.jsdelivr.net/npm/katex@0.16.9` |
| Supabase JS | (unversioned in some pages) | `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` |
| Desmos Scientific | (iframed) | `https://www.desmos.com/scientific` |
| DM Sans (font) | — | Google Fonts |

---

## Section 2: Math Rendering Infrastructure

### Library

**KaTeX 0.16.9** (not MathJax). Loaded from jsDelivr CDN. No local copy.

### Files where it is loaded

Both `daniellab_practice.html` and `daniellab_mocktest.html`. Identical 3-tag setup in `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous" />
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" crossorigin="anonymous"
  onload="document.dispatchEvent(new Event('katexReady'))"></script>
```

The `defer` attribute means scripts load asynchronously; the `onload` on auto-render fires a
custom `katexReady` DOM event when the auto-render module is ready.

### Files where it is invoked

Both HTML files. The wrapper function pattern is identical:

```js
window.katexLoaded = false;
document.addEventListener('katexReady', () => { window.katexLoaded = true; renderKatex(); });

function renderKatex() {
  if (!window.katexLoaded || typeof renderMathInElement !== 'function') return;
  renderMathInElement(document.getElementById('app'), {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$',  right: '$',  display: false },
      { left: '\\(', right: '\\)', display: false },  // practice.html only
      { left: '\\[', right: '\\]', display: true  },  // practice.html only
    ],
    throwOnError: false,
  });
}
```

`renderKatex()` is called after every `render()` call (i.e., after every DOM swap). The guard
on `window.katexLoaded` prevents errors if the question renders before the CDN script loads.

**Delimiter difference between files:**
- `daniellab_practice.html`: 4 delimiters — `$$`, `$`, `\(`, `\[`
- `daniellab_mocktest.html`: 2 delimiters — `$$`, `$` only

The Supabase `questions` table uses only `$...$` and `$$...$$` notation. The `\(...\)` and
`\[...\]` delimiters are not needed for ocean_vector's purposes.

### Wrapper and CSS override

```css
/* In styles-bluebook.css */
.katex { font-size: 1em !important; color: var(--text); }
```

DanielLab uses `katex-content` as a CSS class flag on the parent element whenever `q.katex`
is non-null — this doesn't add behavior, it's a hook for potential CSS scoping:

```html
<div class="${q.katex ? 'katex-content' : ''}">...</div>
```

### Configuration summary

| Setting | Value | Reason |
|---|---|---|
| Version | 0.16.9 | CDN-pinned; stable release |
| `throwOnError` | `false` | Silent fallback if LaTeX parse fails |
| Delimiters needed for VECTOR | `$...$` (inline), `$$...$$` (display) | All Supabase content uses these two only |
| Render target | `document.getElementById('app')` | Whole app div re-rendered on each question |
| Re-render trigger | After every `app.innerHTML = ...` swap | Required because KaTeX doesn't observe DOM changes |

---

## Section 3: Diagram & Visual Content Infrastructure

### Two diagram types exist in DanielLab

**Type 1 — `katex` field (LaTeX text descriptions):**

These are text strings containing `$...$` notation that describe a geometric figure or display
an equation in a "Figure / Data" panel above the question stem. Examples:

```
'Right triangle $ABC$ with a $90^{\circ}$ angle at $A$ and a $64^{\circ}$ angle at $C$.'
'Circle with center $Q$. Arc $AB$ has central angle $60^{\circ}$ and arc length 4 inches.'
'The scatterplot shows points with a strong negative correlation: as $x$ increases...'
```

These are NOT images. They are human-readable text that happens to contain inline math.
KaTeX renders the `$...$` portions; the surrounding prose renders as normal text.

**Type 2 — `graph` field (inline SVG):**

Some algebra questions with linear function graphs have a `graph` field containing a complete
`<svg>` element (~800 chars of inline markup) generated by `data/build_math_bank.py`. These
are proper coordinate plane visualizations with gridlines, axes, plotted lines, and labeled
points. Example (truncated): `<svg viewBox="0 0 280 220" xmlns="...">...</svg>`

### Storage location

Both fields live **inside the question data object** — in DanielLab's JS data files, and
presumably would need to be separate columns in Supabase if ported. Currently:

| Field | In DanielLab data | In Supabase questions table |
|---|---|---|
| `katex` | Separate field on question object | **Merged into `passage` column during seeding** |
| `graph` | Separate field on question object | **Not seeded — no column exists** |

This means ocean_vector's renderer must treat `passage` as potentially containing LaTeX and pass
it through KaTeX. There is no `graph` SVG data available from Supabase — the two questions in
the diagnostic candidate set that use `graph` SVGs (`alg_m_001`, `alg_m_010`) were already
excluded from the candidate set for this reason.

### Rendering helpers

No sanitization. Both fields are injected via template literal `innerHTML`:

```js
// katex field → "Figure / Data" panel
passageHtml = `<div class="bb-panel-tag">Figure / Data</div>
  <div class="bb-passage katex-content">${q.katex}</div>`;

// graph field → "Figure" panel
passageHtml = `<div class="bb-panel-tag">Figure</div>
  <div style="padding:8px 0;">${q.graph}</div>`;
```

Priority: `passage/dualText/table` check first → `graph` if no passage → `katex` if no graph.

### Diagram content in the diagnostic candidate set

For the 30 questions in `DIAGNOSTIC_QUESTION_SET_CANDIDATES.md`:
- #22 `mt01-m1-08`: `passage = "Right triangle $ABC$ with a $90^{\circ}$ angle at $A$ and a $64^{\circ}$ angle at $C$."` — LaTeX text, no SVG
- #23 `mt02-m1-22`: `passage = "Right triangle $ABC$ with angle $B = 90^{\circ}$, angle $C = 30^{\circ}$, and hypotenuse $AC = 124$."` — LaTeX text, no SVG

Both are fully handled by KaTeX. No SVG generation needed.

---

## Section 4: Question Display Layer

### Primary files

Both `daniellab_practice.html` and `daniellab_mocktest.html` contain the full rendering
pipeline inline. No external JS modules. Logic is ~850 lines per file including state,
rendering, event binding, and Supabase write-back.

### Data shape in

DanielLab question objects use these fields:

```js
{
  id:           'mt01-m1-08',           // question identifier
  num:          8,                       // position number
  domain:       'geometry',             // content domain
  type:         'geometry',             // question subtype
  // RW only:
  passage:      'string | null',        // passage text (RW)
  dualText:     'string | null',        // Text 2 for cross-text questions
  notes:        'array | null',         // bullet notes for EOI synthesis
  noteTask:     'string | null',        // task description for EOI synthesis
  underline:    'string | null',        // underlined phrase for function questions
  table:        'string | null',        // pipe-delimited text OR raw HTML table
  // Math only:
  katex:        'string | null',        // LaTeX equation / figure description
  graph:        'string | null',        // inline SVG markup
  // Both:
  question:     'string',               // stem text (practice data)
  text:         'string',               // stem text (mock-test data) — same field, different key
  choices:      { A, B, C, D },        // MCQ answer choices (may contain $...$)
  answer:       'A'|'B'|'C'|'D',       // correct answer
  isSPR:        false,                  // student-produced response flag
  sprAnswer:    'string | null',        // SPR correct answer string
  sprAnswerNum: 'number | null',        // SPR correct answer as float (for tolerance check)
  explanation:  'string',               // post-answer explanation (may contain $...$)
  calcAgnostic: true|false,             // whether calculator is needed (not seeded to Supabase)
}
```

**Supabase `questions` table field mapping:**

| Supabase column | DanielLab source | Notes |
|---|---|---|
| `question_text` | `q.question` or `q.text` | Renderer must handle both |
| `passage` | `q.passage` (RW) or `q.katex` (Math) | Collapsed during seeding |
| `answer_a` … `answer_d` | `q.choices.A` … `q.choices.D` | Split into 4 columns |
| `correct_answer` | `q.answer` | |
| `question_type` | `q.type` | |
| `domain` | `q.domain` | |
| `difficulty` | `q.difficulty` | Always NULL for math rows |
| — | `q.graph` | **Not seeded** |
| — | `q.isSPR` | **Not seeded** (SPR questions excluded from DB) |
| — | `q.calcAgnostic` | **Not seeded** |

### Rendering pipeline

```
render()
  → htmlQuestion()                      // builds HTML string
      → determine layout (RW vs Math)   // isMath flag based on domain
      → build passageHtml               // passage/dualText/notes/table/katex/graph
      → build answerHtml                // MCQ choices or SPR input
      → build explanationHtml           // shown after answer submitted
      → build navHtml                   // prev/next/finish buttons + dots strip
  → app.innerHTML = result              // full DOM replacement
  → renderKatex()                       // post-render KaTeX pass
  → bindEvents()                        // re-attach click handlers
  → window.scrollTo(0, 0)
```

### Layout components

**RW questions — `.bb-question-layout` (2-column split-pane):**
- Left panel (`.bb-left-panel`): passage, dual-text, notes, or data table
- Divider line (`.bb-divider-line`): 1px vertical rule
- Right panel (`.bb-right-panel`): question number, type badge, stem, answer choices, nav

**Math questions — `.bb-math-layout` (single column, max-width 820px):**
- Optional "Figure / Data" panel above stem (if `katex` or `graph` present)
- Stem card (`.bb-math-stem`)
- Answer choices or SPR input
- Calculator button (toggles Desmos iframe)

### Shared sub-components

| Component | What it renders | Key function/code |
|---|---|---|
| Passage display | Plain text, optionally with `<u>` underline | Template literal in `htmlQuestion()` |
| Dual-text display | Two `.bb-text-block` divs with "Text 1"/"Text 2" labels | Conditional on `q.dualText` |
| Notes display (EOI) | `.bb-notes-box` with `<ul>` bullets + task line | Conditional on `q.notes` |
| Answer choices (MCQ) | `.bb-choices` > `.bb-choice` buttons, A–D | `htmlQuestion()` answer loop |
| SPR input | Text input + check button with fuzzy-float matching | `q.isSPR` branch |
| Data table | `parseTextTable()` → `<table class="bb-data-table">` | Handles both pipe-text and raw HTML |
| Explanation | Correct/incorrect verdict + explanation text | Shown after `S.responses[q.id]` set |
| Dots navigator | Numbered circle buttons for direct question jump | `.bb-dots-strip` above nav row |

### `parseTextTable()` function

Parses pipe-delimited plain text into a styled HTML table. First row → `<thead>`, remaining
rows → `<tbody>`. Skips lines that are pure separators (`---`, `|---|`). Falls back to plain
paragraph if fewer than 2 rows detected.

```js
function parseTextTable(text) {
  const lines = text.trim().split('\n').filter(l => l.trim() && !l.match(/^[-|:\s]+$/));
  if (lines.length < 2) return `<p style="font-size:14px;">${text}</p>`;
  const rows = lines.map(l => l.split('|').map(c => c.trim()).filter(c => c !== ''));
  const [header, ...body] = rows;
  return `<table class="bb-data-table">
    <thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${body.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}
```

---

## Section 5: Other Content-Relevant Infrastructure

### Sanitization / XSS handling

**None.** All question content is injected directly via `innerHTML` template literals. No
DOMPurify, no `textContent` escaping, no sanitization pass. This is acceptable for DanielLab
because all content is curated internal data. For ocean_vector, the same assumption holds
(Supabase content is admin-seeded, not user-generated). No change needed on port.

If ocean_vector ever exposes user-supplied content in the question display path, DOMPurify
would need to be added at that point.

### Accessibility

**None.** DanielLab has no ARIA labels, no `role` attributes, no `tabindex`, and no keyboard
navigation support. `.bb-choice` buttons are `<button>` elements (inherently keyboard-focusable)
but there is no explicit keyboard-nav or `aria-checked` pattern.

This is a known gap in DanielLab, not something to port. Ocean_vector can address this
independently when/if accessibility becomes a priority.

### Mobile rendering

`styles-bluebook.css` has one breakpoint at `max-width: 768px`:

```css
@media (max-width: 768px) {
  .bb-question-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1px auto;
    height: auto;
    overflow: visible;
  }
  .bb-left-panel  { max-height: 45vh; overflow-y: auto; }
  .bb-divider-line { height: 1px; width: auto; }
  .bb-right-panel { overflow-y: visible; min-height: 55vh; }
  .bb-math-layout { padding: 20px 16px; }
}
```

On mobile, the 2-column RW layout stacks vertically. Left panel gets `max-height: 45vh` with
scroll. Math layout reduces padding. This is complete and functional; port as-is.

### State management

**Practice mode** (`S` in `daniellab_practice.html`):

```js
const S = {
  view: 'picker' | 'quiz' | 'results',
  domain: string,
  questions: [],
  qIndex: number,
  responses: {},       // { questionId: 'A'|'B'|'C'|'D'|string }
  selected: {},        // current selection before confirm
  flags: {},           // flagged for review
  highlights: {},      // text highlight ranges
  responseTimes: {},   // { questionId: seconds }
  studentRatings: {},  // post-answer difficulty rating
  sessionId: crypto.randomUUID(),
  elapsedSeconds: 0,
  elapsedInterval: null,
};
```

**Mock test mode** (`S` in `daniellab_mocktest.html`): more complex — tracks 4 module
response buckets (rw1/rw2/math1/math2), countdown timer, adaptive module routing.

**Question-display-only state** (safe to lift as-is):
`qIndex`, `responses`, `selected`, `flags`, `responseTimes`, `highlights`

**Coupled to DanielLab session model** (needs re-design for VECTOR):
`domain`, `view` state machine, `studentRatings` Supabase write-back, `sessionId`,
mock test adaptive routing (rw1Score → module selection for rw2/math2)

### Text highlighter

A custom selection-based highlighter (yellow/green) in `daniellab_practice.html`.
`initHighlighter()` attaches to toolbar buttons; on selection, wraps the selected text range
in `<mark>` elements with inline background color. Stored in `S.highlights` as DOM range
metadata. Not present in mocktest.html in the same form.

Not needed for the VECTOR diagnostic flow (30-question linear assessment). Can be added
post-pilot if desired.

### Calculator

Desmos Scientific Calculator embedded as an `<iframe>` in a fixed bottom-right panel:

```html
<iframe src="https://www.desmos.com/scientific" class="bb-calc-iframe" title="Calculator"></iframe>
```

Toggled by a `🖩 Calculator` button shown only for math questions. The iframe is always in the
DOM (display:none when hidden) to avoid reload delay on toggle.

---

## Section 6: Port Recommendations

### Item 1 — KaTeX CDN tags (3 lines in `<head>`)

**Strategy: COPY-PASTE**
**Effort: Trivial (<5 min)**

Add verbatim to `assessment.html` `<head>`. No adaptation needed.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous" />
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" crossorigin="anonymous"
  onload="document.dispatchEvent(new Event('katexReady'))"></script>
```

### Item 2 — `renderKatex()` function + `katexReady` event listener

**Strategy: COPY-PASTE**
**Effort: Trivial (<5 min)**

Lift verbatim from `daniellab_practice.html` lines 155–170. Use 2-delimiter version
(`$$` and `$` only — sufficient for all Supabase content). Call after every DOM update.

### Item 3 — KaTeX CSS override

**Strategy: COPY-PASTE**
**Effort: Trivial (<5 min)**

Add to `ocean_vector/css/styles.css`:
```css
.katex { font-size: 1em !important; color: var(--text, #1a1a1a); }
```

### Item 4 — `styles-bluebook.css` (question layout components)

**Strategy: ADAPT**
**Effort: Small (<1 hr)**

Do not copy the whole file — ocean_vector has its own `css/styles.css` with its own variables
and base styles. Port only the question-display components needed for Feature 3:

Components to port (partial lift, ~150 lines):
`.bb-question-layout`, `.bb-left-panel`, `.bb-divider-line`, `.bb-right-panel`,
`.bb-panel-tag`, `.bb-passage`, `.bb-dual-wrap`, `.bb-text-block`, `.bb-text-label`,
`.bb-notes-box`, `.bb-data-table`, `.bb-math-layout`, `.bb-math-stem`, `.bb-question-stem`,
`.bb-choices`, `.bb-choice`, `.bb-choice-circle`, `.bb-spr-wrap`, `.bb-spr-input`,
`.bb-dots-strip`, `.bb-dot`, `.bb-q-nav`, mobile breakpoint, `.katex` override

Map DanielLab CSS variables to ocean_vector's existing variable names where they differ.

### Item 5 — `parseTextTable()` function

**Strategy: COPY-PASTE**
**Effort: Trivial (<5 min)**

14 lines. Lift verbatim. Needed for data table questions (e.g. soil pH / tomato data, rock
classification table).

### Item 6 — Question renderer / `htmlQuestion()` function

**Strategy: ADAPT**
**Effort: Medium (~3 hr)**

This is the core of Feature 3 — the function that takes a question record and produces DOM.
Cannot be lifted verbatim because:

1. **Field name mismatch:** Supabase uses `question_text`, `answer_a`–`answer_d`,
   `correct_answer`; DanielLab uses `question`/`text`, `choices.A`–`choices.D`, `answer`.
2. **Passage semantics differ:** Supabase `passage` holds what DanielLab split across
   `passage` (RW text), `katex` (math LaTeX), and `graph` (SVG). Ocean_vector's renderer
   needs to check if `passage` contains `$...$` to decide on layout.
3. **Layout trigger:** DanielLab uses `isMath` flag based on domain. Ocean_vector should
   use `section === 'math'` or `domain IN ('algebra', 'advanced_math', 'geometry', 'psda')`.
4. **SPR:** `isSPR` was not seeded to Supabase. Not needed for the v0.1 diagnostic set
   (all 30 candidates are MCQ).
5. **Dual-text:** `dualText` was not seeded as a separate column. RW cross-text questions
   store both texts in `passage` (concatenated with a delimiter — needs investigation).

Recommended approach: write a fresh `renderQuestion(q)` function in ocean_vector that maps
from Supabase column names, re-implementing the layout logic using DanielLab's HTML structure
and CSS classes as the reference.

### Item 7 — Calculator (Desmos iframe + toggle)

**Strategy: COPY-PASTE**
**Effort: Trivial (<15 min)**

Lift the `<div id="calc-panel">` block and `toggleCalc()` function verbatim.
Show the calculator button only when `section === 'math'` (same condition as DanielLab's
`isMath` check). The Desmos iframe is free to embed.

### Item 8 — Answer choice event handling + confirm flow

**Strategy: ADAPT**
**Effort: Small (<1 hr)**

DanielLab's click-to-select + confirm-button pattern is solid UX and should be preserved.
Adaptation needed: field names in the confirm/response logic, and ocean_vector's diagnostic
needs to track answer state and send results to Supabase (DanielLab uses a different schema
for result write-back: `question_results` table, not the same as VECTOR's).

### Item 9 — Results and scoring logic

**Strategy: REFERENCE-ONLY**
**Effort: N/A (ocean_vector implements its own)**

DanielLab's results screen is tightly coupled to its domain/module model and its own
`question_results` Supabase table. Ocean_vector needs a fundamentally different results flow
(30-item diagnostic → score by section/difficulty → Seneca skill observation input).
Use DanielLab's results screen as a UX reference only.

### Item 10 — SPR (student-produced response) handling

**Strategy: REFERENCE-ONLY**
**Effort: N/A (not needed for v0.1)**

SPR questions are not in the 30-item diagnostic candidate set. All 30 candidates are MCQ.
If SPR is added post-pilot, DanielLab's `isSPR` logic (text input + float tolerance check +
π/pi normalization) is a complete reference implementation.

### Item 11 — Text highlighter (`initHighlighter()`)

**Strategy: SKIP**
**Effort: N/A**

Not needed for a 30-question linear diagnostic. Adds meaningful JS complexity for marginal
UX benefit at this stage. Revisit post-pilot.

### Item 12 — `styles-bluebook.css` base variables and reset

**Strategy: SKIP**
**Effort: N/A**

Ocean_vector has its own CSS variables and reset in `css/styles.css`. Do not import or copy
DanielLab's base variables — they partially overlap and importing both would cause conflicts.
Only the question-layout components (Item 4) need to be ported.

### Item 13 — DM Sans font import

**Strategy: COPY-PASTE**
**Effort: Trivial (<5 min)**

If ocean_vector does not already load DM Sans: add the Google Fonts import to
`css/styles.css` or `assessment.html` `<head>`. This ensures the diagnostic matches the
DanielLab visual language students may recognize.

### Item 14 — Mobile responsive breakpoints (question layout)

**Strategy: COPY-PASTE** (part of Item 4)
**Effort: Included in Item 4 estimate**

The `@media (max-width: 768px)` block for `.bb-question-layout` stacking is complete and
correct. Port it as part of the CSS adaptation (Item 4).

---

## Port Recommendation Summary

| # | Item | Strategy | Effort |
|---|---|---|---|
| 1 | KaTeX CDN tags (3 lines) | COPY-PASTE | Trivial |
| 2 | `renderKatex()` function | COPY-PASTE | Trivial |
| 3 | KaTeX CSS override | COPY-PASTE | Trivial |
| 4 | Question layout CSS (~150 lines) | ADAPT | Small |
| 5 | `parseTextTable()` function | COPY-PASTE | Trivial |
| 6 | Question renderer `htmlQuestion()` | ADAPT | Medium |
| 7 | Calculator (Desmos + toggle) | COPY-PASTE | Trivial |
| 8 | Answer event handling + confirm flow | ADAPT | Small |
| 9 | Results and scoring | REFERENCE-ONLY | N/A |
| 10 | SPR handling | REFERENCE-ONLY | N/A (not v0.1) |
| 11 | Text highlighter | SKIP | N/A |
| 12 | Base CSS variables/reset | SKIP | N/A |
| 13 | DM Sans font | COPY-PASTE | Trivial |
| 14 | Mobile breakpoints | COPY-PASTE (in #4) | Included |

**Total estimated effort: ~5–7 hours.**
- COPY-PASTE items: ~30 min combined
- ADAPT items 4+8: ~1.5 hr combined
- ADAPT item 6 (renderer): ~3 hr
- REFERENCE-ONLY / SKIP: no coding effort

---

## Open Questions for Kevin

1. **Dual-text (cross-text) question format in Supabase:** DanielLab stores Text 1 in
   `passage` and Text 2 in `dualText`. The Supabase seeding merged these somehow. Do the
   3 cross-text questions in the diagnostic set (#2 cs_c_207, #3 cs_c_209, #4 cs_c_146)
   have their dual-text content intact in the `passage` column, or was Text 2 dropped?
   This needs a quick SQL check before the renderer is written.

2. **SPR not seeded — confirm exclusion is intentional:** The `isSPR` flag and `sprAnswer`
   fields were not seeded to Supabase. Since all 30 diagnostic candidates are MCQ, this is
   not a blocker for v0.1. Confirm this is intentional and note for v0.2.

3. **DM Sans — already loaded in ocean_vector?** Check `css/styles.css` — if it's already
   imported, skip Item 13.
