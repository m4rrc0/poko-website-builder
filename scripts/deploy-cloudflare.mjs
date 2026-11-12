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
import { appendFile, mkdtemp, readFile, stat } from "node:fs/promises";
import { existsSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
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

// The package root and the site root that contains it. When invoked as a
// dependency (…/<site>/node_modules/poko-website-builder/scripts/x.mjs) the
// site root is the node_modules parent; when invoked in-repo it's the repo
// root itself.
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot =
  basename(dirname(packageRoot)) === "node_modules"
    ? dirname(dirname(packageRoot))
    : packageRoot;

// The console path uploads only static assets. Pages Functions are never
// bundled — `wrangler pages project upload` silently excludes functions/,
// _worker.js and _routes.json — so a site relying on them would deploy
// "successfully" while losing the feature. Fail loudly instead.
function assertNoPagesFunctions(dist) {
  const offenders = [
    join(dist, "_worker.js"),
    join(dist, "_routes.json"),
    join(siteRoot, "functions"),
  ].filter((p) => existsSync(p));
  if (offenders.length) {
    fail(
      `Pages Functions detected (${offenders.join(", ")}) — the console ` +
        `deploy path ships static assets only. Deploy via the direct path ` +
        `(unset DEPLOY_API_BASE) instead.`,
    );
  }
}

export async function main(distArg) {
  const dist = distArg || "dist";
  const apiBase = env("DEPLOY_API_BASE").replace(/\/+$/, "");
  const token = env("DEPLOY_TOKEN");
  const project = env("DEPLOY_PROJECT");
  const branch =
    process.env.DEPLOY_BRANCH || process.env.GITHUB_REF_NAME || "main";
  const version = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf-8"),
  ).version;

  await stat(dist).catch(() => fail(`output directory not found: ${dist}`));
  assertNoPagesFunctions(dist);

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
  const tmp = await mkdtemp(join(tmpdir(), "poko-deploy-"));
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
      cwd: packageRoot,
      env: { ...process.env, CF_PAGES_UPLOAD_JWT: jwt },
      stdio: "inherit",
    },
  );
  if (run.error) fail(`could not run wrangler: ${run.error.message}`);
  if (run.status !== 0) fail(`wrangler pages project upload exited ${run.status}`);
  const manifestRaw = await readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestRaw);

  // 3. Finalize through poko-console — the deployment-create call (the only
  //    Pages-Write need) happens server-side; returns the deployed URL.
  //    Idempotency-Key lets the server dedup a retried finalize.
  const idempotencyKey = createHash("sha256").update(manifestRaw).digest("hex");
  const finRes = await post(
    `${apiBase}/finalize`,
    { project, manifest, branch },
    {
      bearer: token,
      headers: {
        "x-poko-deploy-version": version,
        "idempotency-key": idempotencyKey,
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
