'use strict';
// VECTOR · App shell
// Auth guards and routing. Every page loads this after supabase.js.

window.VectorApp = {

  currentUser: null,

  async getSession() {
    return VectorDB.getSession();
  },

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
    // Interim routing: all authenticated users go to /assessment.html.
    // Feature 6 (/profile) and Feature 3 (/welcome) will add branches here
    // once those routes ship. dashboard.html retired in Feature 1.
    window.location.replace('/assessment.html');
  },

  // Shows the Seneca link banner on protected pages when bridge is missing.
  // Only runs when window.VECTOR_USE_SDK === true (feature flag).
  // Dismissed state persists for the session via sessionStorage.
  async checkBridgeOnProtectedPage() {
    if (!window.VECTOR_USE_SDK) return;
    if (sessionStorage.getItem('vector_link_banner_dismissed')) return;

    const hasBridge = await VectorLinkFlow.checkBridgeStatus();
    if (hasBridge === false) {
      const banner = document.getElementById('seneca-link-banner');
      if (banner) banner.style.display = 'flex';
    }
  },

};
