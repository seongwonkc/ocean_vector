# AI Operator Lessons

> Durable lessons from operating Opus + Codex + Cowork across 15+ days of
> infrastructure and product work. Each entry pairs a failure mode with the
> discipline that prevents it.

---

## On specifications

### Type annotations in specs are not optional

**Failure:** Spec said `current_phase: 1` (intended integer). Cowork wrote
`current_phase: '1'` (string). PostgREST silently coerced; bug not caught
until smoke run against production schema.

**Discipline:** Specs include explicit type annotations for every value.
`current_phase (integer): 1` is correct. `current_phase: 1` is ambiguous.
This applies to booleans, UUIDs, and arrays too — PostgREST is not forgiving.

### Smoke runs catch what unit tests don't

**Failure:** 138 unit tests passed. Smoke run against real Supabase failed
on Step 1b because the unit tests mocked the DB layer and missed a type
coercion difference that only appeared with real PostgREST.

**Discipline:** Every infrastructure delivery includes at least one smoke run
against the production environment before declaring done. Unit tests verify
logic. Smoke runs verify the environment the logic runs in.

### SQL codegen tools drop columns silently

**Failure:** `generate_manifest.js` used a regex that couldn't parse `text[]`
types or complex DEFAULT expressions like `now() + interval '15 minutes'`.
Those columns were silently dropped from the manifest. Downstream harness
code referenced columns that the manifest said didn't exist.

**Discipline:** After any manifest regeneration, diff the output against the
previous version and cross-check dropped columns against the actual schema
via Supabase MCP. Codegen tools have hidden parser limitations — always verify
output, never trust silent success.

### Two-identity models introduce identity debt

**Failure:** The harness was implemented with two separate UUIDs —
`testAuthUserId` and `testSenecaUserId` — on the assumption that the Seneca
and VECTOR users are distinct. The gateway's email identity enforcement
(`senecaEmail === limbEmail`) meant they needed matching emails anyway,
making the separation architecturally wrong even though it "worked." Codex
caught this in post-impl review.

**Discipline:** Before implementing a test fixture's identity model, read
the actual identity enforcement logic in the gateway, not just the spec.
The spec can be wrong about assumptions the code has already baked in.

---

## On AI tool selection

### Vendor loyalty is a runway leak

**Failure:** VECTOR was using Anthropic for runtime LLM calls (synthesis,
commentary, profile copy) because the rest of the stack was already on
Anthropic. This created a cost structure that didn't reflect the actual
capability requirements — most inference calls don't need frontier models.

**Discipline:** Vendor selection for inference should be a cost/capability
decision made per feature, not inherited from the infrastructure layer.
Gemini handles Gemini tasks. Claude handles Claude tasks. Review the default
whenever a new inference-heavy feature is scoped.

### Agentic coders don't do desk research

**Failure:** Cowork was asked to research competitor positioning before
drafting a strategy document. It produced a confident-sounding summary that
was pattern-matched from training data, not sourced from actual current
competitor products. The summary was directionally plausible but not
verifiable and influenced two downstream decisions.

**Discipline:** Cowork's job is execution against a spec. Opus's job is
strategy and synthesis. Market research, competitive analysis, and
"what does the landscape look like" questions go to Opus with web search
enabled, not to an agentic coder. Keep the pipeline roles clean.

---

## On strategic decisions

### Removing what's already built is sometimes the architecture

**Failure:** OCEAN personality typing was fully implemented in VECTOR's
onboarding flow. It was left in because it represented completed work.
It stayed in through two sprints while creating onboarding friction that
reduced completion rates. The sunk cost argument kept it alive longer than
the UX evidence justified.

**Discipline:** "We already built it" is not an architectural argument.
Features that don't serve the core value prop are debt regardless of how
much effort went into them. Make the cut explicitly and early; don't let
inertia make it for you.

### Search before reasoning on factual questions about external systems

**Failure:** When Opus was uncertain about whether a specific external system
had shipped a particular version, it reasoned from training data rather than
searching. The answer it produced was confidently stated but wrong.
Downstream planning assumed a capability that didn't exist.

**Discipline:** Any factual question about the current state of an external
system — has X shipped, what does Y's current API look like, is Z still
maintained — requires a search before reasoning. Training data has a cutoff
and a hallucination risk. This rule is non-negotiable.

---

## On framing and communication

### Presenting designed options forecloses better ones

**Failure:** Opus was asked "how should we handle X?" and presented two
well-reasoned options (A and B). The operator chose B. Later it emerged that
the operator had a third model in mind that neither A nor B matched, but the
framing of the question had anchored the conversation on Opus's design space.

**Discipline:** Before presenting designed options, surface the operator's
existing mental model with a direct question: "Do you have a prior on how
this should work?" Designed options are useful when the space is genuinely
open. They're harmful when the operator already has a direction and the AI
is narrowing it unnecessarily.

### Directional truths aren't research findings

**Failure:** A strategy document included the claim that "competitors X and Y
don't offer Z capability." This was pattern-matched from training data, not
verified. It was true directionally but not precisely, and was later cited
in a stakeholder conversation as if it were researched fact.

**Discipline:** Distinguish between "this is directionally true based on
training data" and "this was verified against current sources." Unverified
competitive claims should be marked explicitly: "directional — verify before
citing." Never present inference as research.

---

## On memory and stored fragments

### Correct drifted fragments the moment they surface

**Failure:** A stored memory fragment described student goals with phrasing
that was slightly wrong. It resurfaced unchanged in three separate
conversations across multiple days before being corrected. By the third
recurrence it had influenced product copy, strategy framing, and a spec.
Correcting one fragment fixed the source; undoing its downstream influence
took longer.

**Discipline:** The moment a memory fragment surfaces with incorrect content,
correct it in that same conversation. Don't defer to "I'll fix it later."
One incorrect fragment that propagates is harder to undo than the 30 seconds
it takes to rewrite it.

### Memory updates require verbatim accuracy

**Failure:** A memory update changed "SAT target score: 1500" to "student
has a lower target score" in a paraphrase. Subsequent reasoning that needed
the exact number produced a wrong output because the stored fact was now
qualitative rather than quantitative.

**Discipline:** Memory writes are not summaries. If the fact is a number,
write the number. If the fact is a specific phrase, write the phrase.
Extrapolation from a stored fragment is a sign the fragment was written too
loosely. Rewrite it.

---

## On implementation mechanics

### The Edit tool has a content ceiling; Python is not optional

**Failure:** Multiple files were corrupted mid-sprint by the Edit tool's
~7,500 character content limit. One file was silently truncated, passing
`node --check` because the truncation produced valid-but-incomplete JS.
Tests then failed on require() with a misleading SyntaxError.

**Discipline:** Any file that will exceed ~50 lines after editing gets a
Python write, not an Edit call. This is not a "when in doubt" rule —
it's a hard ceiling. Don't try to be clever about it.

### Null bytes from Edit tool require Python rewrite

**Failure:** Edit tool operations on invariant files left trailing null bytes
at EOF. `node --check` passed. The tests failed at runtime with
`SyntaxError: Invalid or unexpected token`. The null bytes were invisible
in normal file inspection.

**Discipline:** When Edit operations produce runtime errors on files that
pass `node --check`, check for null bytes with `xxd | tail`. The fix is
always a Python binary write, not another Edit call.

### Test runner glob scope must be read before creating test files

**Failure:** A test file was created at `tests/unit/diff/invariants.test.js`.
The test runner glob was `tests/unit/*.test.js` (non-recursive). The file
was never picked up; 23 tests were silently absent from the suite for an
entire session.

**Discipline:** Before creating a test file, read the test runner
configuration to confirm the glob covers the target path. Don't assume
subdirectories are included. Verify the test count increases after adding
tests.

---

## On scope and shipping

### Define "thin version" before implementing, not after

**Failure:** "Per-question commentary" was scoped as a feature without a
written thin version. Cowork implemented the full interpretation — detailed
multi-paragraph Seneca analysis per question. The actual MVP need was a
one-sentence label. Three days of work had to be scoped back.

**Discipline:** Every feature has a one-sentence thin version written before
implementation starts. The thin version defines what "done" means. Cowork
builds against the thin version only. If Cowork's interpretation of the spec
would exceed the thin version, it surfaces this before adding scope.

### Pre-commit the cut order before the sprint starts

**Failure:** Mid-sprint feature cuts were made under time pressure, with
incomplete context and emotional investment in completed work. The cuts that
got made were the ones that were easiest to defend, not necessarily the ones
with the lowest leverage.

**Discipline:** Before the sprint starts, write down the cut order explicitly.
When you're not yet invested in any specific feature, the ordering is
rational. During the sprint, the list is the authority — not the current
state of your feelings about the feature.

### Real users on partial product beats no users on complete product

**Failure:** A previous sprint deferred student onboarding until all features
were complete. By the time real students were using the product, there was no
runway left to iterate on their feedback. The features that mattered most were
the ones that didn't get user-tested.

**Discipline:** Onboard real students at Day 6, even if 2 features are still
in progress. Partial product with real signal is more valuable than complete
product with no signal. Feedback from actual students has changed product
direction in every sprint it's been available.

---

## On the operator-AI division of labor

### The pipeline roles are load-bearing — don't blur them

**Failure:** Cowork was asked to make an architectural decision between two
database schemas during implementation. It chose one, implemented it cleanly,
and the tests passed. The choice was wrong because it didn't account for a
constraint the operator knew about but hadn't surfaced in the spec. Undoing
the choice cost a full session.

**Discipline:** Cowork executes. Opus reasons. Kevin decides. When an
architectural choice needs to be made during implementation, Cowork surfaces
it to Kevin and pauses — it doesn't resolve it. The roles aren't suggestions;
they're the error-correction mechanism for the pipeline.

### Kevin owns the things AI tools can't calibrate

Kevin's decisions are not optional delegates:

- **Architecture** — AI tools can enumerate tradeoffs but can't hold the
  full constraint set the operator carries.
- **Vendor selection** — cost, reliability, and strategic alignment require
  context that isn't in the codebase.
- **Market judgment** — what students want is not answerable from training
  data alone.
- **Prompt quality bar** — whether a Gemini-generated synthesis is actually
  insightful requires a human with taste to evaluate.

If an AI tool is making these calls without Kevin in the loop, the workflow
has drifted and the output should be treated as provisional.

### Codex's value is source-grounding, not creative reasoning

**Failure:** Codex was given a vague question ("does this approach make
sense?") and produced a well-structured answer that turned out to be
reasoning from the spec rather than from the actual code. It agreed with the
spec. The spec was wrong.

**Discipline:** Codex pre- and post-impl reviews should be scoped to
specific, source-grounded questions: "Does the gateway's handleLinkUser at
line 192 actually accept this field?" not "Does this architecture make sense?"
The former produces useful signal. The latter is Opus's job.

## Additional category to include in AI_OPERATOR_LESSONS.md:

## On project manifests and shared ground truth

### The manifest as time-saver
**Failure mode:** Without a single source of truth for schema (table names,
column names, types, foreign keys), every Cowork session that touches the
database burns tokens re-discovering structure. Drift between assumed schema
and real schema causes bugs that smoke runs catch but unit tests don't.
**Discipline:** Maintain PROJECT_MANIFEST.json (or equivalent) at repo root
listing every table with columns, types, and constraints. Update it when
schema changes. Reference it in every Cowork prompt that touches the
database. Codex pre-impl review uses the manifest as ground truth, catching
type drift before implementation.

### Manifest hydration is required, not optional
**Failure mode:** Manifests with placeholder columns or "TODO: fill in"
fields are worse than no manifest — they create false confidence. Cowork
believes the manifest is canonical and writes code against incomplete data.
**Discipline:** Manifest must be fully hydrated for every table it lists.
Tables without complete column inventories should not appear in the
manifest at all. Empty fields are not allowed.

### Update the manifest in the same commit as schema changes
**Failure mode:** Schema changes ship via migration; manifest update happens
"later" or never. Drift accumulates silently until a future Cowork session
acts on stale manifest.
**Discipline:** Schema migrations and manifest updates are paired commits.
A migration without a corresponding manifest update is incomplete.

## ADDITIONAL CATEGORY for AI_OPERATOR_LESSONS.md

Add this category and its three entries to the document, after the existing
categories. Same format as existing entries: failure mode + discipline,
3-5 lines each.

## On project ground truth

### Maintain a project manifest as canonical schema reference
**Failure mode:** Without a single source of truth for schema (tables,
columns, types, constraints), every Cowork session that touches the database
burns tokens re-discovering structure. Drift between assumed schema and real
schema causes bugs only smoke runs catch.
**Discipline:** Maintain PROJECT_MANIFEST.json (or equivalent) at repo root
listing every table with hydrated columns, types, and constraints. Reference
it in every Cowork prompt that touches the database. Codex pre-impl uses the
manifest as ground truth, catching type drift before implementation.

### Manifest hydration is required, not optional
**Failure mode:** Manifests with placeholder columns or "TODO" fields create
false confidence. Cowork treats the manifest as canonical and writes code
against incomplete data.
**Discipline:** Manifest must be fully hydrated for every table it lists.
Tables without complete column inventories should not appear in the manifest.
Empty fields are not allowed. If a table is added, its full column inventory
enters the manifest in the same commit.

### Schema migrations and manifest updates are paired commits
**Failure mode:** Schema migration ships; manifest update happens "later" or
never. Drift accumulates silently until a future Cowork session acts on stale
manifest.
**Discipline:** A schema migration without a corresponding manifest update is
incomplete. Pair them in the same commit. Codex pre-impl review should flag a
migration commit that doesn't update the manifest.

## ADDITIONAL FILTER NOTE for AI_OPERATOR_LESSONS.md

When drafting, only include lessons explicitly listed in this prompt and the
add-on. Kevin filtered the candidate list deliberately. The following
lessons surfaced during conversation but were NOT selected for inclusion:

- Vendor loyalty disguised as integration cost (Gemini-vs-Anthropic decision)
- Stored memory fragments resurface incorrectly without verification
- Search before reasoning when uncertain about competitors/technology
- Operator-AI division of labor on architecture decisions

Do not include these. They may be added in future updates if they re-surface.