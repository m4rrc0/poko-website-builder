/**
 * prefs.js logic — jsdom-free harness. The script is a self-executing
 * IIFE driven by globals; we stub window/localStorage/fetch and run it
 * in a vm context. Kept narrow: registry semantics + bind bookkeeping,
 * not DOM behavior.
 *
 * Run: node --test src/config-11ty/plugins/cms-config/prefs.test.js
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "prefs.js"), "utf-8");

const PREF = "sveltia-cms.prefs";
const K = {
  deviceId: "poko-cms.device-id",
  deployKey: "poko-cms.deploy-key",
  boundAt: "poko-cms.deploy-bound-at",
};

function harness({
  auth = {},
  registry,
  seedPrefs = {},
  user = null,
  extraStore = {},
} = {}) {
  const store = { [PREF]: JSON.stringify(seedPrefs), ...extraStore };
  if (user) store["sveltia-cms.user"] = JSON.stringify(user);
  const h = {
    store,
    fetches: [],
    listeners: {},
    _session: {},
    reloaded: false,
  };
  const ctx = {
    console,
    location: { reload: () => (h.reloaded = true) },
    sessionStorage: {
      getItem: (k) => h._session[k] ?? null,
      setItem: (k, v) => (h._session[k] = v),
    },
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => (store[k] = String(v)),
      removeItem: (k) => delete store[k],
    },
    navigator: { userAgent: "Mozilla/5.0 Chrome/124.0" },
    crypto: { randomUUID: () => "dev-fixed-uuid" },
    document: { addEventListener: () => {}, visibilityState: "visible" },
    addEventListener: (t, fn) => (h.listeners[t] = fn),
    fetch: (url, opts) => {
      h.fetches.push({ url, opts });
      const fail = h.fail401?.includes(url);
      return Promise.resolve({
        ok: !fail,
        status: fail ? 401 : 200,
        json: () => Promise.resolve({ key: "pdk_fresh" }),
      });
    },
    URL,
  };
  ctx.window = {
    __POKO_CMS_AUTH__: {
      gitless: true,
      deployBindUrl: "https://poko.example/cms/deploy/bind",
      deployUrl: "https://poko.example/cms/deploy/pid-1",
      pokoSiteId: "pid-1",
      branch: "preview-x",
      ...auth,
    },
    __POKO_CMS_PREFS__: registry ?? [
      {
        key: "deployHookURL",
        value: "https://poko.example/cms/deploy/pid-1",
        when: "managed",
        match: "/deploy/pid-1",
      },
      { key: "deployHookAuthHeader", valueFrom: "deployKey", when: "sync" },
    ],
    fetch: ctx.fetch,
  };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  h.ctxWindow = ctx.window;
  return h;
}

const prefs = (h) => JSON.parse(h.store[PREF]);
const flush = async (n = 5) => {
  for (let i = 0; i < n; i++) await new Promise((r) => setImmediate(r));
};

test("boot seeds the managed URL, header absent without a key", () => {
  const h = harness();
  assert.equal(prefs(h).deployHookURL, "https://poko.example/cms/deploy/pid-1");
  assert.equal(prefs(h).deployHookAuthHeader, undefined);
  assert.equal(h.store[K.deviceId], "dev-fixed-uuid");
});

test("stored key writes the Bearer header at boot", () => {
  const h = harness({
    extraStore: {
      [K.deployKey]: "pdk_stored",
      [K.boundAt]: String(Date.now()),
    },
  });
  assert.equal(prefs(h).deployHookAuthHeader, "Bearer pdk_stored");
});

test("managed rule preserves a foreign deploy hook", () => {
  const h = harness({
    seedPrefs: { deployHookURL: "https://hooks.example.com/user-own-hook" },
  });
  assert.equal(
    prefs(h).deployHookURL,
    "https://hooks.example.com/user-own-hook",
  );
});

test("managed rule rewrites a stale poko hook (host migration)", () => {
  const h = harness({
    seedPrefs: { deployHookURL: "https://old-poko.example/cms/deploy/pid-1" },
  });
  assert.equal(prefs(h).deployHookURL, "https://poko.example/cms/deploy/pid-1");
});

test("auth-success message binds with the payload token", async () => {
  const h = harness();
  h.listeners.message({
    origin: "https://poko.example",
    source: { popup: true },
    data: 'authorization:github:success:{"token":"tok-live"}',
  });
  await flush();
  assert.equal(h.fetches.length, 1);
  assert.equal(h.fetches[0].opts.headers.Authorization, "token tok-live");
  const body = JSON.parse(h.fetches[0].opts.body);
  assert.equal(body.poko_id, "pid-1");
  assert.equal(body.device_id, "dev-fixed-uuid");
  assert.equal(body.branch, "preview-x");
  assert.equal(h.store[K.deployKey], "pdk_fresh");
  // First bind → reload so the header lands in Sveltia's live prefs.
  assert.equal(h.reloaded, true);
  assert.equal(prefs(h).deployHookAuthHeader, "Bearer pdk_fresh");
});

test("foreign message origins are ignored", async () => {
  const h = harness();
  h.listeners.message({
    origin: "https://evil.example",
    source: { popup: true },
    data: 'authorization:github:success:{"token":"tok"}',
  });
  await flush();
  assert.equal(h.fetches.length, 0);
});

test("no gitless → no-op", () => {
  const h = harness({
    auth: {
      gitless: false,
      deployBindUrl: undefined,
      deployUrl: undefined,
      pokoSiteId: undefined,
    },
  });
  assert.equal(prefs(h).deployHookURL, undefined);
});

test("authed boot with a fresh key does not rebind", async () => {
  const h = harness({
    user: { token: "tok-1" },
    extraStore: {
      [K.deployKey]: "pdk_cur",
      [K.boundAt]: String(Date.now()),
    },
  });
  await flush();
  assert.equal(h.fetches.length, 0);
});

test("authed boot with a stale marker rebinds", async () => {
  const h = harness({
    user: { token: "tok-1" },
    extraStore: {
      [K.deployKey]: "pdk_old",
      [K.boundAt]: String(Date.now() - 48 * 3600 * 1000),
    },
  });
  await flush();
  assert.equal(h.fetches.length, 1);
  assert.equal(h.store[K.deployKey], "pdk_fresh");
});

test("deploy 401 observed by the fetch-wrap triggers a rebind", async () => {
  const h = harness({
    user: { token: "tok-1" },
    extraStore: {
      [K.deployKey]: "pdk_stale",
      [K.boundAt]: String(Date.now()), // fresh marker — no boot rebind
    },
  });
  await flush();
  assert.equal(h.fetches.length, 0, "fresh key → no bind");
  // Sveltia's publish calls the wrapped fetch — force a 401 on the
  // deploy URL only (the rebind itself must still succeed).
  h.fail401 = ["https://poko.example/cms/deploy/pid-1"];
  const wrapped = h.ctxWindow.fetch;
  await wrapped("https://poko.example/cms/deploy/pid-1", { method: "POST" });
  await flush();
  const binds = h.fetches.filter((f) => f.url.includes("/deploy/bind"));
  assert.equal(binds.length, 1, "401 on the deploy URL must rebind");
  assert.equal(h.store[K.deployKey], "pdk_fresh");
  assert.equal(prefs(h).deployHookAuthHeader, "Bearer pdk_fresh");
});
