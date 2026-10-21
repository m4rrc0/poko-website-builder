/**
 * Poko prefs seeder — the "dev interface layer" for Sveltia settings
 * (SPEC-deploy-hook). Runs as a synchronous head script BEFORE the lazy
 * CMS boot (`__POKO_BOOT_CMS__`): Sveltia snapshots
 * `localStorage['sveltia-cms.prefs']` once at init, so anything we want
 * live must be merged here first.
 *
 * v1 provisions the deploy hook: a deterministic per-site URL plus a
 * server-minted per-device key. The key never ships in the bundle — the
 * browser registers a stable, non-secret `device_id` with poko via the
 * session-authed bind endpoint, and poko returns a fresh `pdk_` key
 * (Web-Push subscription shape: client-held capability, server-bound
 * identity). Bind rotates on call, so we only bind when needed.
 *
 * Registry rules (`window.__POKO_CMS_PREFS__`, emitted at build):
 *   {key, value, when:"empty"|"managed"|"sync", match, valueFrom}
 * - empty:   write only if the pref is absent
 * - managed: write if absent OR the current value ends with `match`
 *            (i.e. ours) — deliberate foreign hooks are preserved
 * - sync:    rewrite every boot; `valueFrom:"deployKey"` resolves the
 *            stored key into `Bearer {key}` — keeps the header mirroring
 *            local state and repairs Sveltia wiping it on URL edits
 */
(() => {
  const auth = window.__POKO_CMS_AUTH__ ?? {};
  const registry = window.__POKO_CMS_PREFS__ ?? [];
  const { deployBindUrl, deployUrl, pokoSiteId, branch = "main" } = auth;
  if (!auth.gitless || !deployBindUrl || !deployUrl || !pokoSiteId) return;

  const PREFS = "sveltia-cms.prefs";
  const LS = {
    deviceId: "poko-cms.device-id",
    deployKey: "poko-cms.deploy-key",
    boundAt: "poko-cms.deploy-bound-at",
  };
  const STALE_MS = 24 * 3600 * 1000;
  const RELOADED = "poko-cms.reloaded";

  const get = (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const set = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };
  const readPrefs = () => {
    try {
      return JSON.parse(get(PREFS)) || {};
    } catch {
      return {};
    }
  };

  // A device id is an identifier, not a secret — safe to keep forever.
  let deviceId = get(LS.deviceId);
  if (!deviceId) {
    deviceId =
      crypto.randomUUID?.() ??
      `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    set(LS.deviceId, deviceId);
  }

  const resolve = (rule) => {
    if (rule.valueFrom === "deployKey") {
      const k = get(LS.deployKey);
      return k ? `Bearer ${k}` : null;
    }
    return rule.value ?? null;
  };

  // Returns whether deployHookAuthHeader ended up written — the
  // first-bind reload decision reads it.
  const applyRegistry = () => {
    const prefs = readPrefs();
    let headerWritten = Boolean(prefs.deployHookAuthHeader);
    let changed = false;
    for (const rule of registry) {
      const want = resolve(rule);
      if (want == null) continue;
      const cur = prefs[rule.key];
      const write =
        rule.when === "always" ||
        (rule.when === "sync" && cur !== want) ||
        (rule.when === "managed" &&
          cur !== want &&
          (!cur || (rule.match && String(cur).endsWith(rule.match)))) ||
        (rule.when === "empty" && !cur);
      if (write) {
        prefs[rule.key] = want;
        changed = true;
        if (rule.key === "deployHookAuthHeader") headerWritten = true;
      }
    }
    if (changed) {
      try {
        localStorage.setItem(PREFS, JSON.stringify(prefs));
      } catch {}
    }
    return headerWritten;
  };

  const headerAtBoot = applyRegistry();

  const storedToken = () => {
    try {
      return JSON.parse(get("sveltia-cms.user"))?.token;
    } catch {
      return null;
    }
  };

  const deviceLabel = () => {
    const ua = navigator.userAgent;
    const m = ua.match(/(Edg|Firefox|Chrome|Safari|OPR)\/[\d.]+/);
    return (m ? m[0] : "browser").replace(/\/[\d.]+$/, "");
  };

  let binding = null;
  const bind = async (token) => {
    if (binding) return binding;
    binding = (async () => {
      const res = await fetch(deployBindUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify({
          poko_id: pokoSiteId,
          device_id: deviceId,
          device_label: deviceLabel(),
          branch,
        }),
      });
      if (!res.ok) throw new Error(`bind ${res.status}`);
      const { key } = await res.json();
      if (!key) throw new Error("bind: no key");
      set(LS.deployKey, key);
      set(LS.boundAt, String(Date.now()));
      applyRegistry();
      // A successful FIRST bind means Sveltia booted without the header
      // (post-boot prefs writes never reach its in-memory snapshot) —
      // reload once so Publish Changes carries auth from the start.
      // The sessionStorage flag alone prevents loops: if the session
      // write truly failed, the next boot just shows login again.
      if (!headerAtBoot) {
        try {
          if (!sessionStorage.getItem(RELOADED)) {
            sessionStorage.setItem(RELOADED, "1");
            location.reload();
          }
        } catch {}
      }
      return key;
    })().finally(() => {
      binding = null;
    });
    return binding;
  };

  const maybeBind = () => {
    const token = storedToken();
    if (!token) return;
    const boundAt = Number(get(LS.boundAt) || 0);
    if (!get(LS.deployKey) || Date.now() - boundAt > STALE_MS) {
      bind(token).catch(() => {});
    }
  };

  maybeBind();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") maybeBind();
  });

  // The auth-success payload (fresh token) doubles as the bind trigger —
  // origin pinned to poko's, source must be the popup window.
  let pokoOrigin;
  try {
    pokoOrigin = new URL(deployBindUrl).origin;
  } catch {
    return; // misconfigured env emitted a non-URL — stay inert
  }
  addEventListener("message", (ev) => {
    if (ev.origin !== pokoOrigin || !ev.source || ev.source === window) return;
    if (typeof ev.data !== "string") return;
    const m = ev.data.match(/^authorization:\w+:(?:success|error):(.*)$/s);
    if (!m) return;
    try {
      const payload = JSON.parse(m[1]);
      if (payload?.token) bind(payload.token).catch(() => {});
    } catch {}
  });

  // Self-heal: a deploy 401 (rotated/revoked key elsewhere) rebinds and
  // rewrites the stored header — next session publishes cleanly. The
  // in-memory header stays stale this session; Sveltia's error surfacing
  // tells the user to retry.
  const origFetch = window.fetch;
  window.fetch = (...args) => {
    const p = origFetch.apply(window, args);
    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
      const method = args[1]?.method ?? "GET";
      if (url === deployUrl && method.toUpperCase() === "POST") {
        p.then((res) => {
          if (res.status === 401) {
            const t = storedToken();
            if (t) bind(t).catch(() => {});
          }
        }).catch(() => {});
      }
    } catch {}
    return p;
  };
})();
