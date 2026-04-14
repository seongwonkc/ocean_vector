-- VECTOR Assessment Platform — Supabase Table Setup
-- Run this in Supabase > SQL Editor before deploying

-- ── Drop existing table if re-creating from scratch ──
-- DROP TABLE IF EXISTS vector_sessions;

CREATE TABLE vector_sessions (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  student_id            text,
  session_date          timestamptz DEFAULT now(),
  test_date             text,
  current_score         text,
  target_score          text,
  weekly_study_hours    text,

  personality_responses jsonb,
  rw_module1_responses  jsonb,
  rw_module1_score      integer,
  module2_type          text,
  rw_module2_responses  jsonb,
  rw_module2_score      integer,
  math_responses        jsonb,
  math_score            integer,

  behavioral_data       jsonb,
  ocean_scores          jsonb,
  profile_code          text,
  profile_label         text
);

-- ── Row-level security ──
-- Allow anonymous inserts (students completing assessment)
ALTER TABLE vector_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert"
  ON vector_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Block anon reads — only the service role / consultant (via anon key with no RLS bypass)
-- Since consultant.html also uses the anon key, we allow SELECT for anon too.
-- If you want stricter security, use a separate server function for the consultant view.
CREATE POLICY "Allow anon select"
  ON vector_sessions FOR SELECT
  TO anon
  USING (true);

-- ── Index for faster sidebar loading ──
CREATE INDEX IF NOT EXISTS idx_vector_sessions_date ON vector_sessions (session_date DESC);
