'use strict';
// ── VECTOR · Supabase shared layer ───────────────────────────────────────────
// Single Supabase client for the entire app.
// Every page loads this file; nothing else should call supabase.createClient().

const _SUPABASE_URL = 'https://havatrfyuqqbidleplcf.supabase.co';
const _SUPABASE_KEY = 'sb_publishable_3v9CidUkG8p1tD_rWVcD-Q_CkZtoKAw';

// ── Question shape transform ─────────────────────────────────────────────────
// Maps DB question_type codes → VECTOR behavioral type
const _QT_TO_VECTOR = {
  cs_wic: 'vocabulary', cs_ptr: 'structure', cs_bsm: 'structure', cs_csu: 'structure',
  ii_cot: 'inference',  ii_coe: 'inference',  ii_inf: 'inference',
  ii_cen: 'inference',  ii_cid: 'inference',
};
const _DOMAIN_FALLBACK = {
  craft_structure: 'structure', info_ideas: 'inference', sec: 'sec', eoi: 'eoi_transition',
};
function _vectorType(domain, qt) {
  return _QT_TO_VECTOR[qt] || _DOMAIN_FALLBACK[domain] || qt || '';
}
function _toClientShape(row, idx) {
  const isMCQ = row.answer_a != null;
  const q = {
    id:            row.question_id,
    num:           idx + 1,
    domain:        row.domain,
    section:       row.section,
    difficulty:    row.difficulty,
    question_type: row.question_type,
    type:          _vectorType(row.domain, row.question_type),
    source:        row.source,
    test_set:      row.test_set,
    module:        row.module,
    signal:        null,
    highSignal:    false,
    text:          row.question_text,
  };
  if (row.passage) {
    if (row.section === 'math') q.katex = row.passage;
    else q.passage = row.passage;
    if (row.passage_source) q.passage_source = row.passage_source;
  }
  if (isMCQ) {
    q.choices = { A: row.answer_a, B: row.answer_b, C: row.answer_c, D: row.answer_d };
    Object.keys(q.choices).forEach(k => { if (q.choices[k] == null) delete q.choices[k]; });
    q.answer  = row.correct_answer;
    q.isSPR   = false;
  } else {
    q.isSPR      = true;
    q.sprAnswer  = row.correct_answer;
    const parsed = parseFloat(row.correct_answer);
    if (!isNaN(parsed)) q.sprAnswerNum = parsed;
  }
  if (row.explanation) q.explanation = row.explanation;
  return q;
}

const _sb = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_KEY);

window.VectorDB = {

  // ── Auth ───────────────────────────────────────────────────────────────────

  async getSession() {
    const { data: { session } } = await _sb.auth.getSession();
    return session;
  },

  async signInWithGoogle() {
    await _sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    });
  },

  async signOut() {
    await _sb.auth.signOut();
  },

  onAuthStateChange(callback) {
    return _sb.auth.onAuthStateChange(callback);
  },

  // ── Questions table ────────────────────────────────────────────────────────

  async fetchQuestions({ test_set, module, limit = 50 }) {
    const { data, error } = await _sb
      .from('questions')
      .select('question_id,source,test_set,module,section,domain,question_type,difficulty,passage,passage_source,question_text,answer_a,answer_b,answer_c,answer_d,correct_answer,explanation')
      .eq('test_set', test_set)
      .eq('module', module)
      .eq('active', true)
      .order('question_id')
      .limit(limit);
    if (error) {
      console.error('[VectorDB] fetchQuestions error:', error);
      return null;
    }
    return (data || []).map(_toClientShape);
  },

  // ── Students table ─────────────────────────────────────────────────────────

  async getStudentProfile(userId) {
    const { data, error } = await _sb
      .from('students')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

};
