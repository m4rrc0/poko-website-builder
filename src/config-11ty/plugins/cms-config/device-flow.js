/**
 * Device-flow sign-in for Sveltia CMS — see template/functions/README.md.
 *
 * Drives GitHub's OAuth Device Authorization Grant: shows a code, the user
 * approves at github.com/login/device, and on success this writes Sveltia's
 * stored user (`sveltia-cms.user` localStorage) and reloads — the CMS then
 * resumes signed in, as it does for tokens left over from Netlify/Decap.
 *
 * The OAuth app's client ID is public (build-time config, window.__POKO_CMS_AUTH__);
 * no secret exists anywhere, so this flow needs no callback URL and no
 * allowlist. Disabled silently when no client ID is configured or a user is
 * already signed in.
 */
(() => {
  const STORAGE_KEY = "sveltia-cms.user";
  const DISMISS_KEY = "poko-cms-auth.dismissed";
  const { clientId, relayUrl = "/cms-auth", scope = "repo user" } =
    window.__POKO_CMS_AUTH__ ?? {};

  if (!clientId || localStorage.getItem(STORAGE_KEY)) return;
  if (sessionStorage.getItem(DISMISS_KEY)) return;

  const post = (path, body) =>
    fetch(`${relayUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  const el = document.createElement("div");
  el.style.cssText = [
    "position:fixed",
    "bottom:1rem",
    "inset-inline:0",
    "margin-inline:auto",
    "max-width:26rem",
    "padding:1rem 1.25rem",
    "background:#fff",
    "color:#111",
    "border:1px solid #ccc",
    "border-radius:8px",
    "box-shadow:0 4px 20px rgb(0 0 0 / 0.15)",
    "font:14px/1.5 system-ui,sans-serif",
    "z-index:2147483647",
  ].join(";");

  const render = (html) => (el.innerHTML = html);
  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    el.remove();
  };

  const idleHTML = `
    <strong>Sign in to the CMS</strong>
    <p style="margin:.5rem 0">Approve access on GitHub — no app setup needed on this site.</p>
    <button id="poko-auth-start" style="padding:.4rem .9rem;cursor:pointer">Sign in with GitHub</button>
    <button id="poko-auth-close" style="margin-inline-start:.5rem;background:none;border:none;cursor:pointer">✕</button>
  `;

  const waitingHTML = ({ userCode, verificationUri }) => `
    <strong>Approve this code on GitHub</strong>
    <p style="margin:.5rem 0">
      Open <a href="${verificationUri}" target="_blank" rel="noopener">${verificationUri}</a>
      and enter:
    </p>
    <p style="margin:.5rem 0;font:700 1.4rem/1 ui-monospace,monospace;letter-spacing:.15em">${userCode}</p>
    <p id="poko-auth-status" style="margin:.5rem 0;opacity:.7">Waiting for approval…</p>
    <button id="poko-auth-close" style="background:none;border:none;cursor:pointer">Cancel</button>
  `;

  const errorHTML = (message) => `
    <strong>Sign-in failed</strong>
    <p style="margin:.5rem 0">${message}</p>
    <button id="poko-auth-start" style="padding:.4rem .9rem;cursor:pointer">Try again</button>
    <button id="poko-auth-close" style="margin-inline-start:.5rem;background:none;border:none;cursor:pointer">✕</button>
  `;

  const wireClose = () =>
    el.querySelector("#poko-auth-close")?.addEventListener("click", dismiss);
  const wireStart = () =>
    el.querySelector("#poko-auth-start")?.addEventListener("click", start);

  const persistAndReload = async (token) => {
    const profile = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => (r.ok ? r.json() : {}));
    // Mirror the shape Sveltia persists after a normal sign-in
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        backendName: "github",
        token,
        id: profile.id,
        name: profile.name ?? profile.login,
        login: profile.login,
        email: profile.email,
        avatarURL: profile.avatar_url,
        profileURL: profile.html_url,
      }),
    );
    location.reload();
  };

  async function start() {
    let ticket;
    try {
      ticket = await post("/device/code", { client_id: clientId, scope });
    } catch {
      render(errorHTML("Could not reach the auth relay."));
      wireStart();
      wireClose();
      return;
    }
    if (ticket.error || !ticket.device_code) {
      render(errorHTML(ticket.error_description ?? "GitHub refused the request."));
      wireStart();
      wireClose();
      return;
    }

    render(
      waitingHTML({
        userCode: ticket.user_code,
        verificationUri: ticket.verification_uri,
      }),
    );
    wireClose();

    const status = el.querySelector("#poko-auth-status");
    let interval = (ticket.interval ?? 5) * 1000;
    const deadline = Date.now() + (ticket.expires_in ?? 900) * 1000;
    const { device_code } = ticket;

    const poll = async () => {
      if (!el.isConnected) return;
      if (Date.now() > deadline) {
        render(errorHTML("The code expired."));
        wireStart();
        wireClose();
        return;
      }
      let result;
      try {
        result = await post("/device/token", {
          client_id: clientId,
          device_code,
        });
      } catch {
        setTimeout(poll, interval);
        return;
      }
      if (result.access_token) {
        status.textContent = "Approved — signing you in…";
        persistAndReload(result.access_token);
        return;
      }
      if (result.error === "slow_down") interval += 5000;
      else if (result.error === "access_denied") {
        render(errorHTML("Authorization was declined on GitHub."));
        wireStart();
        wireClose();
        return;
      } else if (result.error === "expired_token") {
        render(errorHTML("The code expired."));
        wireStart();
        wireClose();
        return;
      }
      // "authorization_pending" (or a transient error): keep polling
      setTimeout(poll, interval);
    };
    setTimeout(poll, interval);
  }

  const mount = () => {
    render(idleHTML);
    wireStart();
    wireClose();
    document.body.appendChild(el);
  };
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", mount)
    : mount();
})();
