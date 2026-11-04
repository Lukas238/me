---
layout: base
title: Login
permalink: /login/
sitemap: false
---

<div class="owner-login">
  <button type="button" id="login-passkey" class="owner-login__passkey">Use fingerprint / passkey</button>

  <form id="login-form" autocomplete="on">
    <input type="text" id="login-user" name="username" placeholder="User" autocomplete="username" required>
    <input type="password" id="login-pass" name="password" placeholder="Password" autocomplete="current-password" required>
    <button type="submit">Log in</button>
  </form>

  <p id="login-status" role="status"></p>
  <pre id="login-setup" hidden></pre>
</div>

<script src="https://unpkg.com/axios@1.6.7/dist/axios.min.js"></script>
<script>
  (function () {
    const workerUrl = 'https://wishlist-sync.dassolucas.workers.dev/';
    const TOKEN_KEY = 'wishlistAdminToken';
    const statusEl = document.getElementById('login-status');
    const enc = new TextEncoder();

    const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    function done(token) {
      localStorage.setItem(TOKEN_KEY, token);
      location.href = '/wishlist/';
    }

    async function passkeyLogin() {
      statusEl.textContent = '';
      try {
        const { data } = await axios.get(workerUrl + 'admin/challenge');
        const assertion = await navigator.credentials.get({ publicKey: {
          challenge: enc.encode(data.challenge),
          rpId: location.hostname,
          userVerification: 'required'
        } });
        const res = await axios.post(workerUrl + 'admin/login', {
          challenge: data.challenge,
          credentialId: b64u(assertion.rawId),
          clientDataJSON: b64u(assertion.response.clientDataJSON),
          authenticatorData: b64u(assertion.response.authenticatorData),
          signature: b64u(assertion.response.signature)
        });
        done(res.data.token);
      } catch (e) {
        statusEl.textContent = 'Passkey login failed.';
      }
    }

    document.getElementById('login-passkey').addEventListener('click', passkeyLogin);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = '';
      try {
        const res = await axios.post(workerUrl + 'admin/password', {
          username: document.getElementById('login-user').value,
          password: document.getElementById('login-pass').value
        });
        done(res.data.token);
      } catch (err) {
        statusEl.textContent = 'Wrong user or password.';
      }
    });

    // /login/#setup creates a passkey and prints the JSON to paste into wrangler.toml (PASSKEYS)
    if (location.hash === '#setup') {
      const out = document.getElementById('login-setup');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Create passkey';
      btn.addEventListener('click', async () => {
        try {
          const cred = await navigator.credentials.create({ publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            rp: { id: location.hostname, name: 'Wishlist' },
            user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'owner', displayName: 'Owner' },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
            authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'required' }
          } });
          out.textContent = JSON.stringify([{ id: b64u(cred.rawId), publicKey: b64u(cred.response.getPublicKey()) }]);
          out.hidden = false;
        } catch (err) {
          statusEl.textContent = 'Passkey creation failed.';
        }
      });
      statusEl.after(btn);
    }
  })();
</script>
