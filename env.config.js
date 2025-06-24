import assert from "node:assert";
import "dotenv/config";
import { resolve, join } from "path";

const processEnv = typeof process !== "undefined" ? process.env : {};

console.log({ processEnv });

// GENERAL
export const NODE_ENV = processEnv.NODE_ENV || "production";
export const ELEVENTY_RUN_MODE = processEnv.ELEVENTY_RUN_MODE;

// DIRECTORIES
// Output directory
export const OUTPUT_DIR = processEnv.OUTPUT_DIR || "dist";
// Cache directory
export const CACHE_DIR = processEnv.CACHE_DIR || "node_modules/.astro";
// Files output directory
export const FILES_OUTPUT_DIR = processEnv.FILES_OUTPUT_DIR || "assets/files";
export const FILES_LIBRARY_OUTPUT_DIR =
  processEnv.FILES_LIBRARY_OUTPUT_DIR || `${FILES_OUTPUT_DIR}/library`;
export const GLOBAL_PARTIALS_PREFIX =
  typeof processEnv.GLOBAL_PARTIALS_PREFIX === "string"
    ? processEnv.GLOBAL_PARTIALS_PREFIX
    : "global";

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

// POKO_THEME
export const POKO_THEME = processEnv.POKO_THEME || "default";
// USER_DIR
export const USER_DIR = processEnv.USER_DIR || `_user-content`;

// Detect the current hosting provider used
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
  processEnv.REPO_OWNER || VERCEL_GIT_REPO_OWNER || NETLIFY_REPO_OWNER;
export const REPO_NAME =
  processEnv.REPO_NAME || VERCEL_GIT_REPO_SLUG || NETLIFY_REPO_NAME;
export const REPO =
  processEnv.REPO || (REPO_OWNER && REPO_NAME && `${REPO_OWNER}/${REPO_NAME}`);

// PROD URL
// TODO: This is prone to forgetting to define the base url
export const BASE_URL = processEnv.BASE_URL?.replace(/\/$/, "");
export const PROD_URL = processEnv.PROD_URL;
export const DISPLAY_URL = processEnv.DISPLAY_URL;

// CMS
export const CMS_AUTH_URL = processEnv.CMS_AUTH_URL;
export const CMS_REPO = processEnv.CMS_REPO;
export const CMS_BACKEND = processEnv.CMS_BACKEND || "github";
export const CMS_BRANCH = processEnv.CMS_BRANCH || "main";

// Fallback hosting service for local dev
export const PREFERRED_HOSTING = processEnv.PREFERRED_HOSTING || "node";

assert(CMS_AUTH_URL, "[env] CMS_AUTH_URL is required");

export default {
  NETLIFY_BUILD,
  CLOUDFLARE_BUILD,
  VERCEL_BUILD,
  LOCAL_BUILD,
  VERCEL_GIT_REPO_OWNER,
  VERCEL_GIT_REPO_SLUG,
  REPOSITORY_URL,
  NETLIFY_REPO_NAME,
  NETLIFY_REPO_OWNER,
  NETLIFY_REPO,
  REPO_OWNER,
  REPO_NAME,
  REPO,
  PREFERRED_HOSTING,
  WORKING_DIR,
};
