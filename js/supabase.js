'use strict';
// ── VECTOR · Supabase shared layer ───────────────────────────────────────────
// Single Supabase client for the entire app.
// Every page loads this file; nothing else should call supabase.createClient().

const _SUPABASE_URL = 'https://havatrfyuqqbidleplcf.supabase.co';
const _SUPABASE_KEY = 'sb_publishable_3v9CidUkG8p1tD_rWVcD-Q_CkZtoKAw';

const _sb = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_KEY);

window.VectorDB = {

  // ── Auth ───────────────────────────────────────────────────────────────────

  /** Returns the current Supabase session, or null. */
  async getSession() {
    const { data: { session } } = await _sb.auth.getSession();
    return session;
  },

  /** Kicks off Google OAuth. User lands back on '/' after Google redirects. */
  async signInWithGoogle() {
    await _sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    });
  },

  async signOut() {
    await _sb.auth.signOut();
  },

  /** Subscribe to auth state changes across any page. */
  onAuthStateChange(callback) {
    return _sb.auth.onAuthStateChange(callback);
  },

  // ── Students table ─────────────────────────────────────────────────────────

  /** Fetch a student's full profile row. */
  async getStudentProfile(userId) {
    const { data, error } = await _sb
      .from('students')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  /**
   * Upsert OCEAN scores and mark assessment complete.
   * @param {string} userId  - Supabase user id
   * @param {object} payload - must contain { oceanScores: { N, C, O, E, A } }
   */
  async saveAssessmentResults(userId, payload) {
    const { error } = await _sb
      .from('students')
      .upsert({
        id:                   userId,
        profile_N:            payload.oceanScores?.N ?? null,
        profile_C:            payload.oceanScores?.C ?? null,
        profile_O:            payload.oceanScores?.O ?? null,
        profile_E:            payload.oceanScores?.E ?? null,
        profile_A:            payload.oceanScores?.A ?? null,
        assessment_completed: true,
      }, { onConflict: 'id' });
    if (error) console.error('[VectorDB] saveAssessmentResults error:', error);
    return { error };
  },

};
