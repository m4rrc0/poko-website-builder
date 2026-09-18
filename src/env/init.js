import assert from "node:assert";
import { execFileSync } from "node:child_process";

function git(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).replace(/\s+$/, "");
  } catch (error) {
    return "";
  }
}

/**
 * Infers the git information the engine needs and validates the resolved
 * environment. It must run *before* anything imports `env.config.js`, which is
 * why it lives in its own module: importing `env.config.js` has no side effect
 * of its own, all shelling out and validation happens here.
 *
 * @returns {Promise<typeof import("../../env.config.js")>} the resolved env module
 */
export async function initPokoEnv({
  cwd = process.cwd(),
  env = process.env,
} = {}) {
  const knowsRepo = Boolean(
    env.REPO || env.GITHUB_REPOSITORY || env.REPOSITORY_URL || env.GIT_REMOTES,
  );
  if (!knowsRepo) {
    const remotes = git(["remote", "-v"], cwd);
    if (remotes) env.GIT_REMOTES = remotes;
  }

  const knowsBranch = Boolean(
    env.BRANCH ||
      env.CF_PAGES_BRANCH ||
      env.VERCEL_GIT_COMMIT_REF ||
      env.GIT_BRANCH,
  );
  if (!knowsBranch) {
    const branch =
      git(["symbolic-ref", "--short", "HEAD"], cwd) ||
      git(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
    env.BRANCH = branch || env.PROD_BRANCH || "main";
    if (!branch) {
      console.warn(
        `INFO: No git branch detected, falling back to BRANCH="${env.BRANCH}"`,
      );
    }
  }

  const envConfig = await import("../../env.config.js");

  assert(envConfig.BRANCH, "[env] BRANCH is required");
  // assert(CMS_AUTH_URL, "[env] CMS_AUTH_URL is required"); // Not required anymore with github personal token
  assert(envConfig.BASE_URL, "[env] BASE_URL is required");

  return envConfig;
}

export default initPokoEnv;
