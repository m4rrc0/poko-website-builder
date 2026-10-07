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

  let pollTimer = null;
  const render = (nodes) => el.replaceChildren(...nodes);
  const dismiss = () => {
    clearTimeout(pollTimer);
    sessionStorage.setItem(DISMISS_KEY, "1");
    el.remove();
  };

  // --- tiny DOM builders (relay-supplied strings only ever land in text nodes)
  const p = (cssText, ...children) => {
    const node = document.createElement("p");
    node.style.cssText = cssText;
    node.append(...children);
    return node;
  };
  const strong = (text) => {
    const node = document.createElement("strong");
    node.textContent = text;
    return node;
  };
  const button = (id, label, cssText) => {
    const node = document.createElement("button");
    node.id = id;
    node.style.cssText = cssText;
    node.textContent = label;
    return node;
  };
  const closeButton = () =>
    button(
      "poko-auth-close",
      "✕",
      "margin-inline-start:.5rem;background:none;border:none;cursor:pointer",
    );

  /** Only a real github.com page may be linked — anything else renders as text. */
  const safeGithubUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "github.com"
        ? url.href
        : null;
    } catch {
      return null;
    }
  };

  const idleView = () => [
    strong("Sign in to the CMS"),
    p(
      "margin:.5rem 0",
      "Approve access on GitHub — no app setup needed on this site.",
    ),
    button(
      "poko-auth-start",
      "Sign in with GitHub",
      "padding:.4rem .9rem;cursor:pointer",
    ),
    closeButton(),
  ];

  const waitingView = ({ userCode, verificationUri }) => {
    const link = document.createElement("a");
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = verificationUri;
    const href = safeGithubUrl(verificationUri);
    if (href) link.href = href;
    const status = p("margin:.5rem 0;opacity:.7", "Waiting for approval…");
    status.id = "poko-auth-status";
    return [
      strong("Approve this code on GitHub"),
      p("margin:.5rem 0", "Open ", link, " and enter:"),
      p(
        "margin:.5rem 0;font:700 1.4rem/1 ui-monospace,monospace;letter-spacing:.15em",
        userCode,
      ),
      status,
      button(
        "poko-auth-close",
        "Cancel",
        "background:none;border:none;cursor:pointer",
      ),
    ];
  };

  const errorView = (message) => [
    strong("Sign-in failed"),
    p("margin:.5rem 0", message),
    button("poko-auth-start", "Try again", "padding:.4rem .9rem;cursor:pointer"),
    closeButton(),
  ];

  const wireClose = () =>
    el.querySelector("#poko-auth-close")?.addEventListener("click", dismiss);
  const wireStart = () =>
    el.querySelector("#poko-auth-start")?.addEventListener("click", start);

  const showError = (message, retry = start) => {
    render(errorView(message));
    el.querySelector("#poko-auth-start")?.addEventListener("click", retry);
    wireClose();
  };

  const persistAndReload = async (token) => {
    const response = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`profile ${response.status}`);
    const profile = await response.json();
    if (!profile?.id || !profile.login) throw new Error("invalid profile");
    if (!el.isConnected) return;
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

  /** The token already works — a profile failure retries only the profile fetch. */
  const finish = async (token) => {
    try {
      await persistAndReload(token);
    } catch {
      showError(
        "GitHub approved, but loading your profile failed — try again.",
        () => finish(token),
      );
    }
  };

  async function start() {
    let ticket;
    try {
      ticket = await post("/device/code", { client_id: clientId, scope });
    } catch {
      showError("Could not reach the auth relay.");
      return;
    }
    if (ticket.error || !ticket.device_code) {
      showError(ticket.error_description ?? "GitHub refused the request.");
      return;
    }

    render(
      waitingView({
        userCode: ticket.user_code,
        verificationUri: ticket.verification_uri,
      }),
    );
    wireClose();

    const status = el.querySelector("#poko-auth-status");
    let interval = (ticket.interval ?? 5) * 1000;
    const deadline = Date.now() + (ticket.expires_in ?? 900) * 1000;
    const { device_code } = ticket;
    const schedulePoll = (ms) => (pollTimer = setTimeout(poll, ms));

    const poll = async () => {
      if (!el.isConnected) return;
      if (Date.now() > deadline) {
        showError("The code expired.");
        return;
      }
      let result;
      try {
        result = await post("/device/token", {
          client_id: clientId,
          device_code,
        });
      } catch {
        schedulePoll(interval);
        return;
      }
      // The user may have cancelled while the request was in flight
      if (!el.isConnected) return;
      if (result.access_token) {
        status.textContent = "Approved — signing you in…";
        finish(result.access_token);
        return;
      }
      if (result.error === "slow_down") interval += 5000;
      else if (result.error === "access_denied") {
        showError("Authorization was declined on GitHub.");
        return;
      } else if (result.error === "expired_token") {
        showError("The code expired.");
        return;
      }
      // "authorization_pending" (or a transient error): keep polling
      schedulePoll(interval);
    };
    schedulePoll(interval);
  }

  const mount = () => {
    render(idleView());
    wireStart();
    wireClose();
    document.body.appendChild(el);
  };
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", mount)
    : mount();
})();
