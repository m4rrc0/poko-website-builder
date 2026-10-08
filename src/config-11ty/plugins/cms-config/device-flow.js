/**
 * Device-flow sign-in for Sveltia CMS — see template/functions/README.md.
 *
 * Drives GitHub's OAuth Device Authorization Grant: shows a code, the user
 * approves at github.com/login/device, and on success this writes Sveltia's
 * stored user (`sveltia-cms.user` localStorage) and boots the CMS — it inits
 * already signed in, as it does for tokens left over from Netlify/Decap.
 *
 * The OAuth app's client ID is public (build-time config, window.__POKO_CMS_AUTH__);
 * no secret exists anywhere, so this flow needs no callback URL and no
 * allowlist. The CMS bundle is not loaded until needed (lazy __POKO_BOOT_CMS__):
 * while signed out a full-screen prompt is all that runs. Dismissal is not
 * persisted: the prompt returns on the next load while still signed out.
 */
(() => {
  const STORAGE_KEY = "sveltia-cms.user";
  const {
    clientId,
    relayUrl = "/admin/cms-auth",
    scope = "repo user",
  } = window.__POKO_CMS_AUTH__ ?? {};

  // Sveltia leaves `sveltia-cms.user = {}` behind on logout or a failed
  // sign-in — truthy, but not a session. Only a stored token counts.
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {}

  // Signed in (or the shim disabled): the CMS boots right away.
  if (!clientId || storedUser?.token) {
    window.__POKO_BOOT_CMS__?.();
    return;
  }

  const post = (path, body) =>
    fetch(`${relayUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  // Opaque full-viewport layer — only the quick sign-in is visible until
  // success or dismissal; the CMS keeps loading behind it.
  // light-dark() + color-scheme follow the OS preference (no toggle).
  const overlay = document.createElement("div");
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "padding:1rem",
    "color-scheme:light dark",
    "background:light-dark(#f6f8fa,#141417)",
    "color:light-dark(#111,#eee)",
    "font:14px/1.5 system-ui,sans-serif",
    "z-index:2147483647",
  ].join(";");

  const el = document.createElement("div");
  el.style.cssText = [
    "max-width:24rem",
    "padding:1.25rem 1.5rem",
    "background:light-dark(#fff,#1e1e22)",
    "border:1px solid light-dark(#ddd,#3a3a40)",
    "border-radius:10px",
    "box-shadow:0 8px 30px light-dark(rgb(0 0 0 / 0.12),rgb(0 0 0 / 0.5))",
  ].join(";");
  overlay.appendChild(el);

  let pollTimer = null;
  const render = (nodes) => el.replaceChildren(...nodes);
  const dismiss = () => {
    clearTimeout(pollTimer);
    window.__POKO_BOOT_CMS__?.();
    overlay.remove();
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
  const dismissButton = () =>
    button(
      "poko-auth-close",
      "Dismiss quick sign-in",
      "margin-inline-start:.5rem;background:none;border:none;cursor:pointer;text-decoration:underline;vertical-align:center;",
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
    strong("GitHub Quick sign-in"),
    p("margin:.5rem 0 1rem", "Approve access on GitHub — no app setup needed."),
    button(
      "poko-auth-start",
      "Sign in with GitHub",
      "padding:.45rem 1rem;cursor:pointer",
    ),
    dismissButton(),
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

    const code = document.createElement("span");
    code.style.cssText =
      "font:700 1.4rem/1 ui-monospace,monospace;letter-spacing:.15em";
    code.textContent = userCode;
    const copy = button(
      "poko-auth-copy",
      "Copy",
      "padding:.3rem .7rem;cursor:pointer;font-size:.85em",
    );
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(userCode);
        copy.textContent = "Copied";
      } catch {}
    });

    return [
      strong("Approve this code on GitHub"),
      p("margin:.5rem 0", "Open ", link, " and enter:"),
      p(
        "margin:.5rem 0;display:flex;align-items:center;gap:.75rem",
        code,
        copy,
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
    button(
      "poko-auth-start",
      "Try again",
      "padding:.4rem .9rem;cursor:pointer",
    ),
    dismissButton(),
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

  const persistAndBoot = async (token) => {
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
    // The CMS was never booted while signed out — injecting it now picks the
    // stored user up at init, no reload needed. Fall back to reload if the
    // bundle stalls (it resumes signed in on the next load either way).
    window.__POKO_BOOT_CMS__?.();
    const timeout = new Promise((r) => setTimeout(() => r("timeout"), 30000));
    const ready = window.__POKO_CMS_READY__ ?? Promise.resolve();
    try {
      if ((await Promise.race([ready, timeout])) === "timeout")
        location.reload();
      else overlay.remove();
    } catch {
      showError("The CMS bundle failed to load — reload to retry.", () =>
        location.reload(),
      );
    }
  };

  /** The token already works — a profile failure retries only the profile fetch. */
  const finish = async (token) => {
    try {
      await persistAndBoot(token);
    } catch {
      showError(
        "GitHub approved, but loading your profile failed — try again.",
        () => finish(token),
      );
    }
  };

  async function start() {
    const startButton = el.querySelector("#poko-auth-start");
    if (!startButton || startButton.disabled) return;
    startButton.disabled = true;

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
    // Runs as a sync head script while the (deferred) CMS bundle still loads —
    // body doesn't exist yet; a fixed overlay works as a child of <html> too.
    (document.body ?? document.documentElement).appendChild(overlay);
  };
  mount();
})();
