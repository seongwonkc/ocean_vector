'use strict';
// VECTOR · App shell
// Auth guards and routing. Every page loads this after supabase.js.

window.VectorApp = {

  currentUser: null,

  async requireAuth() {
    const session = await VectorDB.getSession();
    if (!session) {
      window.location.replace('/');
      return null;
    }
    this.currentUser = session.user;
    return session.user;
  },

  async redirectIfAuthed() {
    const session = await VectorDB.getSession();
    if (!session) return false;
    this.currentUser = session.user;
    await this._routeAuthedUser(session.user.id);
    return true;
  },

  async _routeAuthedUser(userId) {
    const { data } = await VectorDB.getStudentProfile(userId);
    if (data?.assessment_completed) {
      window.location.replace('/dashboard.html');
    } else {
      window.location.replace('/assessment.html');
    }
  },

};