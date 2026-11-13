#!/usr/bin/env node
// Deploy a built site to Cloudflare Pages via poko-console's token model.
// /begin exchanges the opaque, site-pinned DEPLOY_TOKEN for a short-lived,
// project-scoped CF Direct Upload JWT; wrangler's `pages project upload`
// pushes assets repo->CF directly under that JWT; /finalize creates the
// deployment server-side and returns the URL. No account-scoped credential
// ever enters the repo.
// Contract: poko-cloud docs/SPEC-hosting-providers.md §Containment,
// docs/decisions/0008-deploy-credential-containment.md.
//
//   POST $DEPLOY_API_BASE/begin      {project}                  -> {jwt}
//   CF_PAGES_UPLOAD_JWT=jwt wrangler pages project upload <dist> --output-manifest-path <m>
//   POST $DEPLOY_API_BASE/finalize   {project, manifest, branch} -> {url}
//
// Ships inside the poko-website-builder package; deploy.yml invokes it via
// the package bin surface (node_modules/.bin/poko — the declared `bin`
// contract, so engine-internal layout stays free to move):
//   poko deploy-cloudflare [dist-dir]
// Env in: DEPLOY_API_BASE, DEPLOY_TOKEN, DEPLOY_PROJECT, DEPLOY_BRANCH.
// Writes `url` + `deployment-url` to $GITHUB_OUTPUT for parity with
// pages-action/wrangler-action. Never prints DEPLOY_TOKEN or the vended JWT.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFile, cp, mkdtemp, readdir, readFile, stat } from "node:fs/promises";
import { existsSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RETRIES = 3;
const FETCH_TIMEOUT_MS = 30_000;

function fail(message) {
  console.error(`deploy-cloudflare: ${message}`);
  process.exit(1);
}

function env(name) {
  const value = process.env[name];
  if (!value) fail(`${name} is not set`);
  return value;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function post(url, body, { bearer, headers = {}, tries = RETRIES } = {}) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          "content-type": "application/json",
          ...headers,
          ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (attempt < tries) {
        console.error(`POST ${url} network error (${error.message}) — retry ${attempt}/${tries}`);
        await sleep(1000 * attempt);
        continue;
      }
      fail(`POST ${url} failed: ${error.message}`);
    }
    if (res.ok) return res;
    const text = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < tries) {
      console.error(`POST ${url} -> ${res.status} — retry ${attempt}/${tries}`);
      await sleep(1000 * attempt);
      continue;
    }
    fail(`POST ${url} -> ${res.status}: ${text.slice(0, 2000)}`);
  }
}

// The package root — used as cwd for npx so `wrangler` resolves from this
// package's dep tree regardless of the caller's directory. (The site root
// is process.cwd() — see collectArtifacts.)
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// `wrangler pages project upload` silently excludes functions/,
// _worker.js, _routes.json, _headers and _redirects (root-level) — so
// we compile/forward them ourselves as the deployments endpoint's file
// fields, exactly what `wrangler pages deploy` sends (SPEC §Containment
// addendum). Mirrors wrangler's precedence: dist/_worker.js (advanced
// mode) wins over a functions/ directory.
// siteDir defaults to the process cwd — the deploy contract runs this
// script from the site root (same place the dist arg resolves). We do
// NOT derive it from import.meta.url: Node resolves symlinks there, so
// node_modules heuristics fail for symlinked installs (pnpm, npm link,
// workspaces). Injectable for tests.
export async function collectArtifacts(dist, tmp, siteDir = process.cwd()) {
  const read = async (p) => (existsSync(p) ? await readFile(p, "utf-8") : "");
  const out = {
    headers: await read(join(dist, "_headers")),
    redirects: await read(join(dist, "_redirects")),
    routes_json: await read(join(dist, "_routes.json")),
    worker_js: "",
    fbr_config: "",
  };
  const distWorker = join(dist, "_worker.js");
  const functionsDir = join(siteDir, "functions");
  const hasFunctions =
    existsSync(functionsDir) && (await stat(functionsDir)).isDirectory();
  if (existsSync(distWorker)) {
    // Advanced mode: sent raw — v1 does not esbuild-bundle _worker.js
    // (self-contained bundles only, matching the spec's caveat).
    out.worker_js = await readFile(distWorker, "utf-8");
    if (hasFunctions)
      console.warn(
        "deploy-cloudflare: both _worker.js and functions/ present — " +
          "functions/ ignored (wrangler precedence)",
      );
    return out;
  }
  if (!hasFunctions) return out;

  // DEPLOY_FUNCTIONS_EXCLUDE drops route paths BEFORE bundling — the
  // excluded code never enters the worker (console's blocklist strips
  // the routes at finalize too; defence in depth).
  const excludes = (process.env.DEPLOY_FUNCTIONS_EXCLUDE || "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((p) => p.replace(/^\/+|\/+$/g, ""));
  const buildDir = join(tmp, "functions-src");
  await cp(functionsDir, buildDir, {
    recursive: true,
    filter: (src) => {
      const rel = relative(functionsDir, src).split(sep).join("/");
      return !excludes.some((ex) => rel === ex || rel.startsWith(ex + "/"));
    },
  });
  if (!(await dirHasFiles(buildDir))) {
    console.log(
      "deploy-cloudflare: functions/ fully excluded — static deploy",
    );
    return out;
  }

  const wDir = join(tmp, "worker");
  const routesPath = join(tmp, "_routes.json");
  const fbrPath = join(tmp, "fbr.json");
  const run = spawnSync(
    "npx",
    [
      "--no-install",
      "wrangler",
      "pages",
      "functions",
      "build",
      buildDir,
      "--outdir",
      wDir,
      "--output-routes-path",
      routesPath,
      "--output-config-path",
      fbrPath,
    ],
    { cwd: packageRoot, stdio: "inherit", env: process.env },
  );
  if (run.error) fail(`could not run wrangler: ${run.error.message}`);
  // A functions dir with no routable entries yields no index.js —
  // wrangler's FunctionsNoRoutes path; deploy static-only like it does.
  if (run.status !== 0 || !existsSync(join(wDir, "index.js"))) {
    console.warn(
      "deploy-cloudflare: functions build produced no worker — " +
        "deploying static assets only",
    );
    return out;
  }
  out.worker_js = await readFile(join(wDir, "index.js"), "utf-8");
  // Custom dist/_routes.json wins over the generated one (wrangler).
  if (!out.routes_json && existsSync(routesPath))
    out.routes_json = await readFile(routesPath, "utf-8");
  if (existsSync(fbrPath))
    out.fbr_config = await readFile(fbrPath, "utf-8");
  return out;
}

async function dirHasFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (await dirHasFiles(join(dir, entry.name))) return true;
    } else {
      return true;
    }
  }
  return false;
}

export async function main(distArg) {
  // Absolute — wrangler spawns with cwd=packageRoot (for npx resolution),
  // so a relative arg would resolve against the package dir, not the site.
  const dist = resolve(distArg || "dist");
  const apiBase = env("DEPLOY_API_BASE").replace(/\/+$/, "");
  const token = env("DEPLOY_TOKEN");
  const project = env("DEPLOY_PROJECT");
  const branch =
    process.env.DEPLOY_BRANCH || process.env.GITHUB_REF_NAME || "main";
  const version = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf-8"),
  ).version;

  await stat(dist).catch(() => fail(`output directory not found: ${dist}`));
  const tmp = await mkdtemp(join(tmpdir(), "poko-deploy-"));
  const artifacts = await collectArtifacts(dist, tmp);

  // 1. Vend the short-lived project JWT — immediately before asset ops;
  //    the TTL is short and it is never cached across runs.
  console.log(`deploy-cloudflare: vending upload token for "${project}"`);
  const beginRes = await post(`${apiBase}/begin`, { project }, {
    bearer: token,
    headers: { "x-poko-deploy-version": version },
  });
  const { jwt } = await beginRes.json().catch(() => ({}));
  if (!jwt) fail("begin response did not include a jwt");
  // GitHub masks DEPLOY_TOKEN (a registered secret) but not the vended JWT —
  // register it so no later log line (incl. wrangler stderr) can leak it.
  console.log(`::add-mask::${jwt}`);

  // 2. Asset upload: wrangler owns hashing, size-aware batching and retries.
  //    CF_PAGES_UPLOAD_JWT scopes it to this project's asset ops — no
  //    account credential needed. --no-install pins the repo's devDep
  //    version (fails loudly rather than fetching an unpinned one).
  const manifestPath = join(tmp, "manifest.json");
  const run = spawnSync(
    "npx",
    [
      "--no-install",
      "wrangler",
      "pages",
      "project",
      "upload",
      dist,
      "--output-manifest-path",
      manifestPath,
    ],
    {
      // Resolve node_modules beside this package — dist/ may live in a
      // different directory than the dep tree (split deploy job).
      // CLOUDFLARE_API_TOKEN=$JWT is deliberate: wrangler 4.x routes every
      // cfetch call through requireLoggedIn() — which demands *some* local
      // credential — even though the upload calls already carry the JWT as
      // an explicit Authorization header (addAuthorizationHeader never
      // overrides it). Without this the vend path dies with "Not logged in"
      // before issuing a single request. The JWT is never sent as an API
      // token; the gate is purely local.
      cwd: packageRoot,
      env: {
        ...process.env,
        CF_PAGES_UPLOAD_JWT: jwt,
        CLOUDFLARE_API_TOKEN: jwt,
      },
      stdio: "inherit",
    },
  );
  if (run.error) fail(`could not run wrangler: ${run.error.message}`);
  if (run.status !== 0) fail(`wrangler pages project upload exited ${run.status}`);
  const manifestRaw = await readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestRaw);

  // 3. Finalize through poko-console — the deployment-create call (the only
  //    Pages-Write need) happens server-side; returns the deployed URL.
  //    Idempotency-Key lets the server dedup a retried finalize — it must
  //    cover the whole payload, not just the manifest.
  const idem = createHash("sha256").update(manifestRaw);
  const finBody = { project, manifest, branch };
  for (const [field, value] of [
    ["worker_js", artifacts.worker_js],
    ["routes_json", artifacts.routes_json],
    ["fbr_config", artifacts.fbr_config],
    ["headers", artifacts.headers],
    ["redirects", artifacts.redirects],
    ["compat_date", process.env.DEPLOY_COMPAT_DATE || ""],
    [
      "compat_flags",
      (process.env.DEPLOY_COMPAT_FLAGS || "").split(",").map((s) => s.trim()).filter(Boolean),
    ],
  ]) {
    if (value && (!Array.isArray(value) || value.length)) {
      finBody[field] = value;
      idem.update(typeof value === "string" ? value : JSON.stringify(value));
    }
  }
  const finRes = await post(
    `${apiBase}/finalize`,
    finBody,
    {
      bearer: token,
      headers: {
        "x-poko-deploy-version": version,
        "idempotency-key": idem.digest("hex"),
      },
    },
  );
  const fin = await finRes.json().catch(() => ({}));
  const url =
    fin.url || fin.deployment_url || fin.deploymentUrl || fin.deployment?.url || "";
  console.log(`deploy-cloudflare: deployed ${url || JSON.stringify(fin)}`);

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `deployment-url=${url}\nurl=${url}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY && url) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `🚀 Deployed: ${url}\n`);
  }
}

// `node_modules/.bin/poko` is a symlink into the package, so compare real
// paths — same trick as scripts/cli.js.
function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  main(process.argv[2]).catch((error) => fail(error.stack || String(error)));
}
