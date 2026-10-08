// Runs in the `postpublish` npm lifecycle hook: regenerates the template
// lockfiles against the just-published version, then commits and pushes
// them as a follow-up commit. Can't run earlier — the lock's integrity
// hash depends on the released tarball, so the version must exist in the
// registry first. Idempotent: re-run manually with `npm run postpublish`.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  }).status ?? 1;

const version = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
// The template tracks stable releases only.
if (version.includes("-")) process.exit(0);

// The npm CDN can take minutes to serve a just-published version. Poll the
// registry until it shows up before resolving the lockfiles.
const deadline = Date.now() + 10 * 60_000;
let visible = false;
while (Date.now() < deadline) {
  if (
    run("npm", ["view", `poko-website-builder@${version}`, "version"], {
      stdio: "ignore",
    }) === 0
  ) {
    visible = true;
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 15_000));
}
if (!visible) {
  console.error(
    `poko-website-builder@${version} still not in the registry after 10min.\n` +
      "The publish itself succeeded — re-run `npm run postpublish` later to finish syncing the template lockfiles.",
  );
  process.exit(1);
}

if (
  run("npm", ["install", "--package-lock-only", "--prefer-online"], {
    cwd: "template",
  }) !== 0 ||
  run("bun", ["install", "--lockfile-only"], { cwd: "template" }) !== 0
) {
  process.exit(1);
}

run("git", ["add", "template/package-lock.json", "template/bun.lock"]);
// Skip the commit when the lockfiles are unchanged (e.g. re-run after a
// failed push) — `git diff --cached --quiet` exits non-zero on a diff.
if (run("git", ["diff", "--cached", "--quiet"], { stdio: "ignore" }) !== 0) {
  if (run("git", ["commit", "-m", "chore(template): sync lockfiles"]) !== 0) {
    process.exit(1);
  }
}
process.exit(run("git", ["push"]));
