import assert from "node:assert";
import "dotenv/config";
import { resolve, join, relative } from "path";
import fs from "node:fs";
import yaml from "js-yaml";
import { transformLanguage } from "./src/utils/languages.js";

const processEnv = typeof process !== "undefined" ? process.env : {};

// GENERAL
export const DEBUG = processEnv.DEBUG === "false" ? false : true;
export const NODE_ENV = processEnv.NODE_ENV || "production";
export const ELEVENTY_RUN_MODE = processEnv.ELEVENTY_RUN_MODE;
// Can be "cdn", "npm", "<relative-path>"
export const CMS_IMPORT = processEnv.CMS_IMPORT || "npm";

// DIRECTORIES
// Output directory
export const OUTPUT_DIR = processEnv.OUTPUT_DIR || "dist";
// Cache directory
export const CACHE_DIR = processEnv.CACHE_DIR || ".cache";
// Files output directory
export const FILES_OUTPUT_DIR = processEnv.FILES_OUTPUT_DIR || "assets/files";
export const FILES_LIBRARY_OUTPUT_DIR =
  processEnv.FILES_LIBRARY_OUTPUT_DIR || `${FILES_OUTPUT_DIR}/library`;

// CONTENT_PATH_PREFIX
export const CONTENT_PATH_PREFIX = processEnv.CONTENT_PATH_PREFIX || "";
// CONTENT_DIR
export const CONTENT_DIR = processEnv.CONTENT_DIR || "_content";
export const PARTIALS_DIR = processEnv.PARTIALS_DIR || "_partials";
export const LAYOUTS_DIR = processEnv.LAYOUTS_DIR || "_layouts";
// WORKING_DIR merges relative paths from CONTENT_PATH_PREFIX and CONTENT_DIR
export const WORKING_DIR =
  processEnv.WORKING_DIR || join(CONTENT_PATH_PREFIX, CONTENT_DIR);

// WORKING_DIR_ABSOLUTE properly concatenate CONTENT_PATH_PREFIX and CONTENT_DIR
export const WORKING_DIR_ABSOLUTE =
  processEnv.WORKING_DIR_ABSOLUTE ||
  (CONTENT_DIR && resolve(CONTENT_PATH_PREFIX, CONTENT_DIR));

export const SRC_DIR_ABSOLUTE = resolve(__dirname, "src");
export const SRC_DIR_FROM_WORKING_DIR = WORKING_DIR_ABSOLUTE
  ? relative(WORKING_DIR_ABSOLUTE, SRC_DIR_ABSOLUTE)
  : null;

// POKO_THEME
export const POKO_THEME = processEnv.POKO_THEME || "default";
// USER_DIR
export const USER_DIR = processEnv.USER_DIR || `_user-content`;

// Detect the current hosting provider used
export const GITHUB_PAGES_BUILD = processEnv.GITHUB_PAGES === "true";
export const NETLIFY_BUILD = Boolean(
  processEnv.NETLIFY || processEnv.NETLIFY_DEPLOYMENT_ID
);
export const CLOUDFLARE_BUILD = Boolean(
  processEnv.CF_PAGES || processEnv.CLOUDFLARE_ACCOUNT_ID
);
export const VERCEL_BUILD = Boolean(processEnv.VERCEL_DEPLOYMENT_ID);
export const LOCAL_BUILD = Boolean(
  !NETLIFY_BUILD && !CLOUDFLARE_BUILD && !VERCEL_BUILD
);

// @github.com:m4rrc0/poko-website-builder.git
const GITHUB_REPO_INFERRED = processEnv.GIT_REMOTES?.split("\n")
  ?.find((remote) => remote.includes("github.com"))
  ?.split(":")
  ?.pop()
  ?.split(".")?.[0];

// GITHUB Pages REPO inferrence
export const GITHUB_GIT_REPO_OWNER = processEnv.GITHUB_REPOSITORY_OWNER;
export const GITHUB_GIT_REPO_NAME =
  processEnv.GITHUB_REPOSITORY?.split("/")?.pop();
export const GITHUB_GIT_REPO = processEnv.GITHUB_REPOSITORY;

// VERCEL REPO inferrence
export const VERCEL_GIT_REPO_OWNER =
  processEnv.VERCEL_GIT_REPO_OWNER || processEnv.VERCEL_GIT_REPO_OWNER;
export const VERCEL_GIT_REPO_SLUG =
  processEnv.VERCEL_GIT_REPO_SLUG || processEnv.VERCEL_GIT_REPO_SLUG;

// NETLIFY REPO inferrence
export const REPOSITORY_URL = processEnv.REPOSITORY_URL;
const repoUrlParts = REPOSITORY_URL?.split(":")?.pop()?.split("/");
export const NETLIFY_REPO_NAME = repoUrlParts?.pop();
export const NETLIFY_REPO_OWNER = repoUrlParts?.pop();
export const NETLIFY_REPO =
  NETLIFY_REPO_OWNER &&
  NETLIFY_REPO_NAME &&
  `${NETLIFY_REPO_OWNER}/${NETLIFY_REPO_NAME}`;

// CLOUDFLARE REPO inferrence
// NOTE: Doesn't look like Cloudflare export these env variables...?

// REPO inferrence
export const REPO_OWNER =
  processEnv.REPO_OWNER ||
  GITHUB_GIT_REPO_OWNER ||
  VERCEL_GIT_REPO_OWNER ||
  NETLIFY_REPO_OWNER;
export const REPO_NAME =
  processEnv.REPO_NAME ||
  GITHUB_GIT_REPO_NAME ||
  VERCEL_GIT_REPO_SLUG ||
  NETLIFY_REPO_NAME;
export const REPO =
  processEnv.REPO ||
  GITHUB_GIT_REPO ||
  REPOSITORY_URL ||
  (REPO_OWNER && REPO_NAME && `${REPO_OWNER}/${REPO_NAME}`) ||
  GITHUB_REPO_INFERRED;

export const PROD_BRANCH = processEnv.PROD_BRANCH || "main";
// BRANCH inferrence
// NOTE: Netlify uses BRANCH
// TODO: Verify Vercel! My understanding is it is VERCEL_GIT_COMMIT_REF
export const BRANCH =
  processEnv.BRANCH ||
  processEnv.CF_PAGES_BRANCH ||
  processEnv.VERCEL_GIT_COMMIT_REF ||
  processEnv.GIT_BRANCH;

// TODO: Better way to identify live deploy
// BUILD_LEVEL: all, active, draft, production
export const BUILD_LEVEL =
  processEnv.BUILD_LEVEL ||
  (BRANCH === PROD_BRANCH && ELEVENTY_RUN_MODE === "build" && "production") ||
  (BRANCH && PROD_BRANCH && ELEVENTY_RUN_MODE === "build" && "draft") ||
  "production"; // Better safe than sorry
export const MINIFY =
  processEnv.MINIFY === "false"
    ? false
    : BUILD_LEVEL === "production" || BUILD_LEVEL === "draft";

// CMS
export const CMS_AUTH_URL = processEnv.CMS_AUTH_URL;
export const CMS_REPO = processEnv.CMS_REPO || REPO;
export const CMS_BACKEND = processEnv.CMS_BACKEND || "github";
export const CMS_BRANCH = processEnv.CMS_BRANCH || BRANCH;

// Fallback hosting service for local dev
export const PREFERRED_HOSTING = processEnv.PREFERRED_HOSTING || "node";

assert(BRANCH, "[env] BRANCH is required");
// assert(CMS_AUTH_URL, "[env] CMS_AUTH_URL is required"); // Not required anymore with github personal token
// TODO: reinstate this !
// assert(BASE_URL, "[env] BASE_URL is required");

// User Config from CMS
// Read file in ${WORKING_DIR_ABSOLUTE}/_data/globalSettings.yaml
const globalSettingsPath = `${WORKING_DIR_ABSOLUTE}/_data/globalSettings.yaml`;
let globalSettings = {};
try {
  const globalSettingsYaml = fs.readFileSync(globalSettingsPath, "utf-8");
  globalSettings = yaml.load(globalSettingsYaml);
} catch (error) {
  console.error("Error reading globalSettings.yaml:", error);
}
export { globalSettings };
export const collections = globalSettings?.collections || [];
export const languages =
  globalSettings?.languages?.map(transformLanguage) || [];

// URLs
// TODO: This is prone to forgetting to define the base url
// TODO: Could be public and defined in config
// PROD_URL is the full URL of the 'deployed' site
export const PROD_URL = (
  processEnv.PROD_URL || globalSettings?.productionUrl
)?.replace(/\/+$/, "");
// BASE_URL is the full URL of the 'being deployed' site
// TODO: Try and find the best ways to infer BASE_URL so we can only define a CANONICAL_URL / PROD_URL
// TODO: If we have a decent way to infer this, we can fall back to PROD_URL
export const BASE_URL = processEnv.BASE_URL?.replace(/\/+$/, "");
// DISPLAY_URL is for the CMS button to the deployed site (prefer current deploy against production)
export const DISPLAY_URL =
  processEnv.DISPLAY_URL?.replace(/\/+$/, "") || BASE_URL || PROD_URL;

if (DEBUG) {
  console.log({ processEnv });
  console.log({
    GIT_REMOTES: processEnv.GIT_REMOTES,
    GITHUB_REPO_INFERRED,
    REPO,
  });
}
