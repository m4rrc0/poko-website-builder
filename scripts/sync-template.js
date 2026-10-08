// Syncs template/package.json and its lockfiles to the latest PUBLISHED
// release (npm `latest` dist-tag — always stable). Runs in the `version`
// npm hook so the result lands in the release commit, and standalone via
// `npm run sync-template`. Pins the published version rather than the
// in-flight one because a lockfile's integrity hash only exists after
// publish — the template therefore trails one release behind.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  }).status ?? 1;

const view = spawnSync("npm", ["view", "poko-website-builder", "version"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
  shell: process.platform === "win32",
});
if (view.status !== 0) process.exit(1);
const version = view.stdout.trim();

const templatePath = "template/package.json";
const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
template.dependencies["poko-website-builder"] = `^${version}`;
fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n");

if (
  run("npm", ["install", "--package-lock-only", "--prefer-online"], {
    cwd: "template",
  }) !== 0 ||
  run("bun", ["install", "--lockfile-only"], { cwd: "template" }) !== 0
) {
  process.exit(1);
}
