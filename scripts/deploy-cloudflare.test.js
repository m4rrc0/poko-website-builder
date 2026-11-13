/**
 * Console-deploy artifact collection tests — the vend path forwards what
 * `wrangler pages project upload` excludes: functions bundles, routes,
 * _headers/_redirects. Runs the real pinned `wrangler pages functions
 * build`, so it is slower than a unit test.
 * Run: node --test scripts/deploy-cloudflare.test.js
 */
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectArtifacts } from "./deploy-cloudflare.mjs";

const FN = `export function onRequest(ctx) { return new Response("ok"); }`;
const LIB = `export const ANSWER = 42;`;
const ROUTER_FN = `import { ANSWER } from "../_lib/answer.js";\nexport function onRequest() { return new Response(String(ANSWER)); }`;

let root;
const t = async (name, fn) =>
  test(name, async (tctx) => {
    await mkdir(root, { recursive: true });
    process.env.DEPLOY_FUNCTIONS_EXCLUDE = "";
    const dirs = {
      site: join(root, "site"),
      dist: join(root, "dist"),
      tmp: join(root, "tmp"),
    };
    for (const d of Object.values(dirs)) await mkdir(d, { recursive: true });
    await fn(dirs, tctx);
  });

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "poko-deploy-test-"));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const fnFile = async (site, rel, src = FN) => {
  const p = join(site, "functions", rel);
  await mkdir(join(p, ".."), { recursive: true });
  await writeFile(p, src);
};

describe("collectArtifacts", () => {
  t("compiles functions and forwards Pages config files", async ({ site, dist, tmp }) => {
    await fnFile(site, "admin/cms-auth/[[route]].js");
    await writeFile(join(dist, "_headers"), "/*\n  X-Foo: bar\n");
    await writeFile(join(dist, "_redirects"), "/old /new 301\n");

    const out = await collectArtifacts(dist, tmp, site);
    assert.match(out.worker_js, /onRequest|fetch/);
    assert.match(out.routes_json, /admin\/cms-auth/);
    assert.ok(out.fbr_config.includes("admin/cms-auth"));
    assert.equal(out.headers, "/*\n  X-Foo: bar\n");
    assert.equal(out.redirects, "/old /new 301\n");
  });

  t("dist/_routes.json wins over generated routes", async ({ site, dist, tmp }) => {
    await fnFile(site, "api/[[route]].js");
    await writeFile(join(dist, "_routes.json"), `{"version":1,"include":["/api/*"],"exclude":[]}`);

    const out = await collectArtifacts(dist, tmp, site);
    assert.equal(out.routes_json, `{"version":1,"include":["/api/*"],"exclude":[]}`);
  });

  t("full exclude falls back to static", async ({ site, dist, tmp }) => {
    await fnFile(site, "admin/cms-auth/[[route]].js");
    process.env.DEPLOY_FUNCTIONS_EXCLUDE = "admin/cms-auth";

    const out = await collectArtifacts(dist, tmp, site);
    assert.equal(out.worker_js, "");
    assert.equal(out.fbr_config, "");
  });

  t("partial exclude keeps remaining routes + shared imports", async ({ site, dist, tmp }) => {
    await fnFile(site, "admin/cms-auth/[[route]].js");
    await fnFile(site, "api/router.js", ROUTER_FN);
    await fnFile(site, "_lib/answer.js", LIB);
    process.env.DEPLOY_FUNCTIONS_EXCLUDE = "admin";

    const out = await collectArtifacts(dist, tmp, site);
    assert.match(out.worker_js, /42|ANSWER|onRequest/);
    assert.match(out.routes_json, /\/api/);
    assert.doesNotMatch(out.routes_json, /cms-auth/);
  });

  t("static site: config files still forwarded", async ({ site, dist, tmp }) => {
    await writeFile(join(dist, "_headers"), "/*\n  X-A: b\n");

    const out = await collectArtifacts(dist, tmp, site);
    assert.equal(out.worker_js, "");
    assert.equal(out.routes_json, "");
    assert.equal(out.fbr_config, "");
    assert.equal(out.headers, "/*\n  X-A: b\n");
  });

  t("dist/_worker.js advanced mode wins over functions/", async ({ site, dist, tmp }) => {
    await fnFile(site, "admin/cms-auth/[[route]].js");
    await writeFile(join(dist, "_worker.js"), `export default { fetch() { return new Response("w"); } }`);

    const out = await collectArtifacts(dist, tmp, site);
    assert.equal(out.worker_js, `export default { fetch() { return new Response("w"); } }`);
    assert.equal(out.fbr_config, "");
  });

  t("functions dir with no routable files deploys static-only", async ({ site, dist, tmp }) => {
    await mkdir(join(site, "functions"), { recursive: true });
    await writeFile(join(site, "functions", "README.txt"), "not a function");

    const out = await collectArtifacts(dist, tmp, site);
    assert.equal(out.worker_js, "");
  });
});
