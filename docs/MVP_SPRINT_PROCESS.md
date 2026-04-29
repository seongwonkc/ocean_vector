# VECTOR MVP Sprint Process

## Sprint window

- **Start date:** 2026-04-28
- **Target end date:** 2026-05-11 (2-week MVP)
- **Goal:** 7 user-facing features shipped, 3–30 real students using VECTOR with Seneca integration.

## Three-AI pipeline (modified for product work)

- **Opus** drafts strategy, acceptance criteria, prompt design.
- **Codex pre-impl review:** SKIP for pure UI work. REQUIRED for anything touching `seneca_memory` writes, SDK boundary, or auth.
- **Codex post-impl review:** REQUIRED for anything touching data integrity. OPTIONAL for UI polish.
- **Cowork** executes implementation against acceptance criteria.
- **Kevin** is the operator and architectural checkpoint.

## Acceptance criteria upfront

Every feature has a one-sentence "thin version" acceptance criterion written BEFORE implementation starts. Cowork builds against the thin version. If Cowork notices the thin version is incomplete or unclear, surface to Kevin before adding scope.

## MVP feature backlog (7 features)

Kevin will fill in thin acceptance criteria for each before implementation begins.

1. Strip OCEAN from VECTOR onboarding
2. Migrate VECTOR runtime LLM calls from Anthropic to Gemini
3. Diagnostic flow (30-question first session)
4. Session-end Seneca synthesis
5. Per-question Seneca commentary
6. Profile.html (3-section: patterns / trajectory / open questions)
7. "Why this question?" labels on question recommendations

Optional stretch goals if the 7 ship early:

8. Mind meld for SAT (thin: static topic list with confidence per topic)
9. Trajectory visualization (thin: single chart, score over sessions)
10. Cross-session memory references in commentary

## Day 4 cutline

If at end of Day 4 the sprint is behind schedule, cut features in this order:

1. Mind meld — highest effort, lowest leverage for week 1 UX
2. Trajectory visualization
3. "Why this question?" labels

**Never cut:** profile.html, per-question commentary, session synthesis. These are the visible-Seneca differentiators.

## Prompt iteration discipline

For Gemini-generated content (synthesis, commentary, profile copy):

- Cap at 3 prompt iteration passes per feature in week 1.
- Lock the prompt, move on. Iterate post-pilot when there's real student data signal.
- Quality benchmark: test prompts against Kevin's own answer patterns first. If Seneca's output on Kevin isn't insightful, the prompt isn't tuned.

## Onboarding before "done"

Day 6 of week 1: onboard real students even if 2 features are still in progress. The remaining features can ship Day 8–10. Real users on a 5/7 product is more valuable than 7/7 with no users.

## What's deliberately out of scope

- CI/CD beyond Netlify auto-deploy
- Latency baselines
- Multi-tenant architecture
- White-label DanielLab integration (separate track)
- Korean voice tuning beyond what's already in `seneca_ai`
- Mobile-specific UX optimization
- Stranger-acquisition polish (deferred to week 2)

## Linked docs

- `/seneca_ai/docs/PROCESS_LESSONS.md` — durable AI-pipeline lessons
- `/seneca_ai/docs/OPERATIONS.md` — production runbook
- `/ocean_vector/docs/AI_OPERATOR_LESSONS.md` — once written, generalized wisdom from sprint experience
