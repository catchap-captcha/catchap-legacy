/* =========================================================================
   api.js — thin fetch wrapper around the CAPTCHA backend.
   The ONLY place that knows the server URL. Everything else talks to the API
   through this object, never directly.
   ========================================================================= */

const CaptchaAPI = (() => {
  // Backend base URL. Override by defining window.CAPTCHA_API_BASE before this
  // script loads (handy when the API isn't on localhost:8000).
  const BASE = window.CAPTCHA_API_BASE || 'http://localhost:8000';

  async function postJSON(path, body) {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
    return res.json();
  }

  return {
    base: BASE,

    /** POST /api/captcha/challenge -> { challenge_id, animal, objects, start_direction, expires_in } */
    createChallenge() {
      return postJSON('/api/captcha/challenge');
    },

    /**
     * URL of the OPAQUE target-pose image for a challenge.
     * The client shows these pixels but never learns the direction index —
     * that's how the answer stays server-side (resource-token pattern).
     */
    targetImageURL(challengeId) {
      return `${BASE}/api/captcha/${encodeURIComponent(challengeId)}/target`;
    },

    /** POST /api/captcha/verify -> { success, captcha_token? , message? } */
    verify(challengeId, selectedObject, selectedDirection) {
      return postJSON('/api/captcha/verify', {
        challenge_id: challengeId,
        selected_object: selectedObject,
        selected_direction: selectedDirection,
      });
    },

    /** POST /api/auth/login -> { success, captcha_required, failed_attempts, message } */
    login(account, password, captchaToken) {
      return postJSON('/api/auth/login', {
        account,
        password,
        captcha_token: captchaToken || null,
      });
    },
  };
})();

window.CaptchaAPI = CaptchaAPI;
