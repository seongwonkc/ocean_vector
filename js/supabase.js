'use strict';
// VECTOR · Supabase shared layer
// Single Supabase client for the entire app.
// Every page loads this file; nothing else should call supabase.createClient().

const _SUPABASE_URL = 'https://havatrfyuqqbidleplcf.supabase.co';
const _SUPABASE_KEY = 'sb_publishable_3v9CidUkG8p1tD_rWVcD-Q_CkZtoKAw';

const _sb = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_KEY);

window.VectorDB = {

  // -- Auth ------------------------------------------------------------------

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

  // -- Students table --------------------------------------------------------

  async getStudentProfile(userId) {
    const { data, error } = await _sb
      .from('students')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

};
