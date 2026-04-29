# VECTOR Tier 1 Acceptance Criteria

> Thin-version definitions for each of the 7 MVP features.
> Cowork builds against the thin version. If a thin definition is unclear or
> seems incomplete, surface to Kevin before adding scope.
>
> Last updated: 2026-04-28

---

## 1. Strip OCEAN from VECTOR onboarding

**Thin version:** OCEAN questionnaire and all related UI is removed from the
new-user signup flow. Existing OCEAN columns in `seneca_users` remain inert
(not removed) for backward compatibility.

**Out of scope:**
- Removing OCEAN columns from the schema
- Backfilling existing users
- Migration of any historical OCEAN data
- Replacing OCEAN with another assessment

**Done when:**
- A new user can sign up without seeing any personality questions
- The signup flow goes directly from email/password → optional target test
  selection → first study session
- No code paths reference OCEAN scores in ranking, recommendation, or
  display logic for new users
- Kevin tests with a fresh email; signup completes in under 90 seconds

---

## 2. Migrate VECTOR runtime LLM calls from Anthropic to Gemini

**Thin version:** All runtime LLM calls in oceanvector (any user-triggered
Gemini-callable surface) use Gemini Flash via Google's API. Anthropic API
calls in oceanvector runtime code are removed.

**Out of scope:**
- Migration of seneca_ai dev tooling (Codex, Cowork, Opus chats stay on Claude)
- Migration of nightly extraction jobs in seneca_ai (separate decision)
- Multi-vendor abstraction layer (single-vendor-Gemini for v0.1; abstraction
  is V02 backlog)
- Gemini Pro for any task; Flash only for v0.1

**Done when:**
- A 30-question diagnostic completes end-to-end with all LLM calls hitting
  Gemini, zero Anthropic calls in oceanvector logs
- Per-question commentary, session synthesis, and any other runtime LLM
  outputs work without errors
- GEMINI_API_KEY is set in oceanvector Netlify env vars
- Old ANTHROPIC_API_KEY is documented as removable (but not yet removed —
  leave for fallback)
- Kevin runs blind comparison: 5 sample outputs from Gemini Flash vs Claude
  Haiku on his own answer patterns. Quality gap is acceptable (not
  significantly worse).

---

## 3. Diagnostic flow (30-question first session)

**Thin version:** A new user's first study session is a 30-question
diagnostic. Questions are selected to span difficulty, type, and vocabulary
density. Student answers, system records, no mid-flight commentary.
Diagnostic is free and one-time per account.

**Out of scope:**
- Adaptive difficulty during the diagnostic (pre-selected sequence is fine)
- Pause/resume mid-diagnostic
- Skip-question functionality (must answer to proceed; or "I don't know" as
  an explicit option)
- Multiple subject diagnostics (single diagnostic for whatever the user
  selected as target test in signup)

**Done when:**
- Question selector pulls 30 questions from DanielLab content library with
  deliberate variance: at least 3 difficulty levels represented, at least
  3 question types, vocabulary density variance (some long-syntax / dense-
  vocab questions, some shorter)
- Student progresses through 30 questions, each answer recorded in seneca
  via SDK
- Result of the diagnostic is gating: synthesis screen (feature #4) is
  triggered automatically on completion
- Student cannot retake the diagnostic on the same account
- Diagnostic completes in 30-60 minutes for a typical student

---

## 4. Session-end Seneca synthesis

**Thin version:** At the end of any study session (diagnostic or otherwise),
Seneca generates a 2-3 paragraph synthesis specific to today's session.
Single Gemini Flash call. Specific-but-tentative register: names what was
noticed, distinguishes hypotheses, expresses honest uncertainty.

**Out of scope:**
- Cross-session memory references in the synthesis ("compared to last week...")
- Audio/voice synthesis
- Translation/Korean version (English-only for MVP)
- Synthesis based on any data source other than this session's observations

**Done when:**
- Synthesis renders within 5 seconds of session end
- Synthesis references at least one specific behavior observed in this
  session (not generic)
- Synthesis names at least one hypothesis or open question (not pure summary)
- Synthesis avoids overclaiming ("based on this hour" framing acceptable;
  "you are a [type of] learner" framing not acceptable)
- Kevin tests against his own session data: synthesis feels insightful, not
  template
- Prompt is locked after 3 iteration passes; further tuning deferred to
  post-pilot

**Reference register example (this is the target tone):**
> "You spent 2.4x longer than average on questions involving long noun
> phrases — like the inference questions in passage 2. You got most of them
> right, but slowed way down. Worth watching whether this is a vocab issue
> or a reading-comprehension issue. I'll know more after a few more
> sessions."

---

## 5. Per-question Seneca commentary

**Thin version:** After a student answers any question (including diagnostic
questions), the result screen displays 1-2 sentences of Seneca commentary
specific to this question + this student's recent observation history.
Single Gemini Flash call.

**Out of scope:**
- Cross-session memory references ("this is similar to question X from last
  week")
- References to specific past observations by date
- Multi-paragraph commentary
- Audio/voice commentary
- Translation between English/Korean (English-only for MVP)
- Commentary that delays question progression (must render fast)

**Done when:**
- Result screen renders commentary text within 3 seconds of answer
  submission
- Commentary references at least one specific aspect of THIS question
  (timing, type, vocabulary density, or interaction pattern)
- Commentary references at least one observation from seneca_memory if any
  exist; if not, frames as observation-in-progress
- Commentary doesn't say "you got it right/wrong" (that's already on the
  screen visually)
- Kevin tests against 5 of his own answer patterns: output feels specific
  not generic
- Prompt is locked after 3 iteration passes

---

## 6. Profile.html (3 sections)

**Thin version:** Authenticated home route ('/') renders profile.html. Three
sections: "What Seneca has noticed" (recent observations), "Trajectory"
(simple session-over-session view), "Open questions" (uncertain
observations).

**Out of scope:**
- Interactive trajectory charts (use simple list/text rendering for v0.1)
- Mind meld topic graph
- Confidence-based weighting beyond a threshold filter
- Per-section detail expansion / drill-down
- Editing or contesting observations from this screen (defer to v0.2 — but
  display the "this doesn't sound like me" button as a non-functional
  placeholder so the affordance exists)

**Done when:**
- Authenticated home renders the three sections in order
- "What Seneca has noticed" pulls from seneca_memory observations with
  confidence > 0.5, displays up to 7 in plain language
- "Trajectory" shows a simple chronological list of completed sessions with
  one-line summary per session
- "Open questions" pulls from seneca_memory observations with confidence
  0.3-0.5, framed as gentle prompts
- Loading state for first-time users (zero data) shows a "Take the
  diagnostic to start" CTA
- Page renders in under 2 seconds for a user with up to 50 memory rows
- Kevin views his own profile: feels like Seneca actually knows something
  about him, not generic placeholders

---

## 7. "Why this question?" labels

**Thin version:** When VECTOR queues a practice question (post-diagnostic),
a small label above or below the question explains why it was selected. One
sentence, drawing from seneca_memory observations.

**Out of scope:**
- The full recommendation engine (use existing question selection logic for
  v0.1; just surface a "why" label that explains the selection)
- Interactive "show me a different question" override
- Cross-session memory references in the label
- Korean translation

**Done when:**
- Every non-diagnostic practice question has a "Why this question?" label
  visible to the student
- Label is generated server-side once per question selection (cached, not
  regenerated on render)
- Label references at least one specific observation or pattern from
  seneca_memory if relevant data exists
- If no relevant observation exists, label shows a neutral default
  ("Building your baseline.")
- Label is 1 sentence, max 20 words
- Kevin reviews 10 labels in his own usage: at least 7/10 feel specific and
  non-generic

---

## Day 4 cutline

If at end of Day 4 (Friday May 1) the sprint is behind schedule, cut features
in this order:
1. **Feature 7** ("why this question") — highest cut priority, lowest
   leverage for week 1 user experience
2. **Feature 6** trajectory section — keep features 1-2 sections of profile
   if needed, drop trajectory rendering
3. **Stretch goals** (mind meld, full trajectory viz, cross-session memory)
   never enter scope unless 1-7 are 100% done

**Never cut:** Features 1, 2, 3, 4, 5. These are the visible-Seneca
differentiators. Without them, VECTOR is indistinguishable from any other AI
study app.

---

## Prompt iteration discipline

For features 4, 5, and 7 (LLM-generated content):

- Cap at 3 prompt iteration passes per feature in week 1
- Lock prompt after pass 3, move on
- Quality benchmark: prompt outputs against Kevin's own answer patterns first
- If Seneca's output on Kevin isn't insightful, the prompt isn't tuned — but
  iteration cap still applies
- Further tuning is post-pilot work, informed by real student data

---

## Definition of week-1 done

End of Friday May 4:

- Features 1, 2, 3, 4 fully shipped at thin-version acceptance
- Feature 5 shipped at thin-version acceptance OR clearly in progress with
  Day 5-7 finish line
- Features 6, 7 in progress (full thin-version acceptance is week 2)
- Kevin has onboarded 3-5 of his own students by Day 7

End of Friday May 11:

- All 7 features shipped at thin-version acceptance
- 10-30 total students using VECTOR (mix of Kevin's own + strangers)
- Real behavioral data accumulating in seneca_memory
- Profile.html demonstrably useful (Kevin and JW review)
- Sprint retrospective documented in oceanvector/docs/SPRINT_RETROSPECTIVE.md