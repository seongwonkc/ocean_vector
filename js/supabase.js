'use strict';
// ── VECTOR · Supabase shared layer ───────────────────────────────────────────
// Single Supabase client for the entire app.
// Every page loads this file; nothing else should call supabase.createClient().

const _SUPABASE_URL = 'https://havatrfyuqqbidleplcf.supabase.co';
const _SUPABASE_KEY = 'sb_publishable_3v9CidUkG8p1tD_rWVcD-Q_CkZtoKAw';

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

  // ── Students table ─────────────────────────────────────────────────────────

  async getStudentProfile(userId) {
    const { data, error } = await _sb
      .from('students')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  /**
   * Upsert full assessment results to students table.
   * @param {string} userId
   * @param {object} payload - full S object fields
   */
  async saveAssessmentResults(userId, payload) {
    const { error } = await _sb
      .from('students')
      .upsert({
        id:                   userId,
        student_name:         payload.studentName        ?? null,
        profile_code:         payload.profileCode        ?? null,
        current_score:        payload.currentScore       ?? null,
        target_score:         payload.targetScore        ?? null,
        test_date:            payload.testDate           ?? null,
        weekly_hours:         payload.weeklyStudyHours   ?? null,
        rw_score:             payload.rwScore            ?? null,
        math_score:           payload.mathScore          ?? null,
        total_score:          payload.totalScore         ?? null,
        profile_N:            payload.oceanScores?.N     ?? null,
        profile_C:            payload.oceanScores?.C     ?? null,
        profile_O:            payload.oceanScores?.O     ?? null,
        profile_E:            payload.oceanScores?.E     ?? null,
        profile_A:            payload.oceanScores?.A     ?? null,
        assessment_completed: true,
      }, { onConflict: 'id' });
    if (error) console.error('[VectorDB] saveAssessmentResults error:', error);
    return { error };
  },

};