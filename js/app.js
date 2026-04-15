'use strict';
// ── VECTOR · App shell ────────────────────────────────────────────────────────
// Auth guards and routing. Every page loads this after supabase.js.
// Pages call VectorApp.requireAuth() or VectorApp.redirectIfAuthed() on init.

window.VectorApp = {

  /** Populated by requireAuth / redirectIfAuthed. Use this instead of
   *  querying the session again inside page logic. */
  currentUser: null,

  // ── Guards ─────────────────────────────────────────────────────────────────

  /**
   * Call at the top of every protected page (assessment, dashboard, etc.).
   * If no session exists, sends the user back to '/' and returns null.
   * If a session exists, sets VectorApp.currentUser and returns the user object.
   */
  async requireAuth() {
    const session = await VectorDB.getSession();
    if (!session) {
      window.location.replace('/');
      return null;
    }
    this.currentUser = session.user;
    return session.user;
  },

  /**
   * Call on the landing page (index.html) only.
   * If the user is already signed in, routes them to the right place.
   * Returns true if a redirect was triggered, false if the user is a guest.
   */
  async redirectIfAuthed() {
    const session = await VectorDB.getSession();
    if (!session) return false;
    this.currentUser = session.user;
    await this._routeAuthedUser(session.user.id);
    return true;
  },

  // ── Internal routing ───────────────────────────────────────────────────────

  /**
   * Checks the student's profile and sends them to the right page.
   * Assessment complete  → dashboard.html
   * Assessment pending   → assessment.html
   */
  async _routeAuthedUser(userId) {
    const { data } = await VectorDB.getStudentProfile(userId);
    if (data?.assessment_completed) {
      window.location.replace('/dashboard.html');
    } else {
      window.location.replace('/assessment.html');
    }
  },

};
