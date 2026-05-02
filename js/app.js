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
    // Feature 3 routing: bootstrap -> check diagnostic status -> branch.
    // Not started  -> /welcome.html (first-time landing)
    // Started / completed -> /assessment.html (resume or completed state)
    try {
      const session = await VectorDB.getSession();
      const token   = session && session.access_token;
      const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

      // Bootstrap is idempotent -- safe to call on every auth landing.
      await fetch('/.netlify/functions/vector-bootstrap-user', { method: 'POST', headers }).catch(() => {});

      const statusRes = await fetch('/.netlify/functions/vector-check-diagnostic-status', { headers });
      const status    = statusRes.ok ? await statusRes.json() : null;

      if (status && !status.error && !status.startedAt && !status.completed) {
        // Never started -- send to welcome page
        window.location.replace('/welcome.html');
      } else {
        // Started (resume) or completed -- assessment.html handles both states
        window.location.replace('/assessment.html');
      }
    } catch (e) {
      // Fallback: send to assessment.html which re-checks on load
      window.location.replace('/assessment.html');
    }
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
