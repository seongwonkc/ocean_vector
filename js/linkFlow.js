'use strict';

(function () {
  const SENECA_LINK_URL = 'https://seneca-ai.netlify.app/link.html';
  const CALLBACK_URL = (window.location.hostname === 'oceanvector.netlify.app')
    ? 'https://oceanvector.netlify.app/seneca-callback'
    : 'https://day13-cutover--oceanvector.netlify.app/seneca-callback';

  function initiateLinkFlow() {
    const url = new URL(SENECA_LINK_URL);
    url.searchParams.set('limb', 'vector');
    url.searchParams.set('callback', CALLBACK_URL);
    window.location.href = url.toString();
  }

  async function checkBridgeStatus() {
    const cached = sessionStorage.getItem('vector_bridge_status');
    if (cached !== null) return cached === 'true';

    const session = await VectorApp.getSession();
    if (!session) return null;

    const res = await fetch('/.netlify/functions/vector-check-bridge', {
      method: 'GET',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return null;

    const body = await res.json();
    sessionStorage.setItem('vector_bridge_status', String(body.hasBridge));
    return body.hasBridge;
  }

  window.VectorLinkFlow = { initiateLinkFlow, checkBridgeStatus };
}());
