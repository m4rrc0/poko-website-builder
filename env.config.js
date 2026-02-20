import assert from "node:assert";
import "dotenv/config";
import { resolve, join, relative } from "path";
import fs from "node:fs";
import { $ } from "bun";
import yaml from "js-yaml";
import { transformLanguage } from "./src/utils/languages.js";
import {
  mapStyleStringsToClassDef,
  compileStyleContexts,
  transformFontStacksContexts,
  transformWidthsContext,
  transformBrandColors,
  transformPalette,
  transformTypeScales,
} from "./src/utils/transformStyles.js";

const processEnv = typeof process !== "undefined" ? process.env : {};

// GENERAL
export const DEBUG = processEnv.DEBUG === "false" ? false : true;
export const NODE_ENV = processEnv.NODE_ENV || "production";
export const ELEVENTY_RUN_MODE = processEnv.ELEVENTY_RUN_MODE;
// Can be "cdn", "npm", "<relative-path>", local // Default should be npm
export const CMS_IMPORT = processEnv.CMS_IMPORT || "local";

// DIRECTORIES
// Output directory
export const OUTPUT_DIR = processEnv.OUTPUT_DIR || "dist";
export const OUTPUT_DIR_ABSOLUTE =
  processEnv.OUTPUT_DIR_ABSOLUTE || resolve(".", OUTPUT_DIR);
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
export const GITHUB_PAGES_BUILD =
  processEnv.GITHUB_PAGES === "true" || processEnv.GITHUB_ACTIONS === "true";
export const NETLIFY_BUILD = Boolean(
  processEnv.NETLIFY || processEnv.NETLIFY_DEPLOYMENT_ID,
);
export const CLOUDFLARE_BUILD = Boolean(
  processEnv.CF_PAGES || processEnv.CLOUDFLARE_ACCOUNT_ID,
);
export const VERCEL_BUILD = Boolean(processEnv.VERCEL_DEPLOYMENT_ID);
export const LOCAL_BUILD = Boolean(
  !NETLIFY_BUILD && !CLOUDFLARE_BUILD && !VERCEL_BUILD,
);

// Cache directory
export const CACHE_DIR =
  processEnv.CACHE_DIR ||
  (CLOUDFLARE_BUILD && ".bun/install/cache") ||
  ".cache";

// GITHUB Pages REPO inferrence
export const GITHUB_GIT_REPO_OWNER = processEnv.GITHUB_REPOSITORY_OWNER;
export const GITHUB_GIT_REPO_NAME =
  processEnv.GITHUB_REPOSITORY?.split("/")?.pop();
export const GITHUB_GIT_REPO = processEnv.GITHUB_REPOSITORY;
// NETLIFY REPO inferrence
export const REPOSITORY_URL = processEnv.REPOSITORY_URL;

const REPO_EARLY = processEnv.REPO || GITHUB_GIT_REPO || REPOSITORY_URL;

const GIT_REMOTES = REPO_EARLY
  ? ""
  : processEnv.GIT_REMOTES ||
    (await $`cd ${WORKING_DIR_ABSOLUTE}/../ && git remote -v`)
      .text()
      .replace(/\n$/, "");
const GITHUB_REPO_INFERRED = GIT_REMOTES
  ? GIT_REMOTES?.split("\n")
      ?.find((remote) => remote.includes("github.com"))
      ?.split(/@github.com(\/|:)/)
      ?.pop()
      ?.split(/\.git\s|\s/)?.[0]
  : "";

// VERCEL REPO inferrence
export const VERCEL_GIT_REPO_OWNER =
  processEnv.VERCEL_GIT_REPO_OWNER || processEnv.VERCEL_GIT_REPO_OWNER;
export const VERCEL_GIT_REPO_SLUG =
  processEnv.VERCEL_GIT_REPO_SLUG || processEnv.VERCEL_GIT_REPO_SLUG;

// NETLIFY REPO inferrence
const repoUrlParts = REPOSITORY_URL?.split(":")?.pop()?.split("/");
export const NETLIFY_REPO_NAME = repoUrlParts?.pop();
export const NETLIFY_REPO_OWNER = repoUrlParts?.pop();
export const NETLIFY_REPO =
  NETLIFY_REPO_OWNER &&
  NETLIFY_REPO_NAME &&
  `${NETLIFY_REPO_OWNER}/${NETLIFY_REPO_NAME}`;

// CLOUDFLARE REPO inferrence
// NOTE: Doesn't look like Cloudflare export these env variables...?
// So we need to infer from GIT_REMOTES and GITHUB_REPO_INFERRED

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
  REPO_EARLY ||
  (REPO_OWNER && REPO_NAME && `${REPO_OWNER}/${REPO_NAME}`) ||
  GITHUB_REPO_INFERRED;

export const WEBSITE_PATH_PREFIX = GITHUB_PAGES_BUILD ? `/${REPO_NAME}/` : "";

export const PROD_BRANCH = processEnv.PROD_BRANCH || "main";
// BRANCH inferrence
// NOTE: Netlify uses BRANCH
// TODO: Verify Vercel! My understanding is it is VERCEL_GIT_COMMIT_REF
export const BRANCH =
  processEnv.BRANCH ||
  processEnv.CF_PAGES_BRANCH ||
  processEnv.VERCEL_GIT_COMMIT_REF ||
  processEnv.GIT_BRANCH ||
  (await $`cd ${WORKING_DIR_ABSOLUTE}/../ && git symbolic-ref --short HEAD`)
    .text()
    .replace(/\n$/, "");

function getGithubPagesUrl(repo) {
  // repo = "owner/repo"
  if (!repo) return null;

  const [owner, name] = repo.split("/");

  // User/Org site: <owner>.github.io
  if (name === `${owner}.github.io`) {
    return `https://${owner}.github.io`;
  }

  // Project site: <owner>.github.io/<repo>
  return `https://${owner}.github.io/${name}`;
}
const GITHUB_DEFAULT_URL = getGithubPagesUrl(REPO_EARLY);

// TODO: Verify compat with supported hosts
const HOST_SUBDOMAIN = BRANCH && BRANCH.replaceAll("/", "-");
const HOST_PREVIEW_URL =
  processEnv.HOST_PREVIEW_URL ||
  processEnv.CF_PAGES_URL ||
  (processEnv.VERCEL_BRANCH_URL && `https://${processEnv.VERCEL_BRANCH_URL}`) ||
  processEnv.DEPLOY_URL || // Netlify
  GITHUB_DEFAULT_URL; // GitHub Pages
const HOST_BRANCH_URL =
  processEnv.HOST_BRANCH_URL ||
  (processEnv.CF_PAGES_URL &&
    processEnv.CF_PAGES_URL.replace(
      /https:\/\/[a-z\d]+\./,
      `https://${HOST_SUBDOMAIN}.`,
    )) ||
  (processEnv.VERCEL_BRANCH_URL && `https://${processEnv.VERCEL_BRANCH_URL}`) ||
  processEnv.DEPLOY_PRIME_URL || // Netlify
  HOST_PREVIEW_URL;

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

// Statuses can be: undefined, "published", "draft", "noindex", "private", "inactive"
export const statusesToUnrender =
  BUILD_LEVEL === "production" ? ["inactive", "draft"] : ["inactive"];

// CMS
export const CMS_AUTH_URL = processEnv.CMS_AUTH_URL;
export const CMS_REPO = processEnv.CMS_REPO || REPO;
export const CMS_BACKEND = processEnv.CMS_BACKEND || "github";
export const CMS_BRANCH = processEnv.CMS_BRANCH || BRANCH;

// Fallback hosting service for local dev
export const PREFERRED_HOSTING = processEnv.PREFERRED_HOSTING || "node";

// User Config from CMS
// Read file in ${WORKING_DIR_ABSOLUTE}/_data/globalSettings.yaml
const globalSettingsPath = `${WORKING_DIR_ABSOLUTE}/_data/globalSettings.yaml`;
const brandConfigPath = `${WORKING_DIR_ABSOLUTE}/_data/brand.yaml`;
let globalSettings = {};
let brandConfig = {};
try {
  const globalSettingsYaml = fs.readFileSync(globalSettingsPath, "utf-8");
  globalSettings = yaml.load(globalSettingsYaml);
} catch (error) {
  console.error("Error reading globalSettings.yaml:", error);
}
try {
  const brandConfigYaml = fs.readFileSync(brandConfigPath, "utf-8");
  brandConfig = yaml.load(brandConfigYaml);
} catch (error) {
  console.warn("WARN: brandConfig.yaml not found");
  brandConfig = {
    ctxCssImport: { filename: "_ctx.css" },
    widthsContexts: [],
    fontStacksContexts: [],
    typeScales: [],
    colors: [],
    palettes: [],
  };
}
export { globalSettings, brandConfig };

export const userCmsConfig = async function () {
  let userCmsConfigTemp = {
    collections: [],
    singletons: [],
  };
  try {
    const uc = await import(`${WORKING_DIR_ABSOLUTE}/_config/index.js`);

    userCmsConfigTemp = {
      ...userCmsConfigTemp,
      ...uc,
    };
  } catch (error) {
    console.warn(
      `WARN: Could not import user config from "${WORKING_DIR_ABSOLUTE}/_config/index.js"`,
    );
  }
  return userCmsConfigTemp;
};

// export const userCmsConfig = userCmsConfigTemp;

// More specific useful global settings
export const selectedCollections = globalSettings?.collections || [];

export const allLanguages =
  globalSettings?.languages?.map(transformLanguage) || [];

export const languages = allLanguages.filter(
  (lang) => !statusesToUnrender.includes(lang.status),
);
export const defaultLanguage = allLanguages.find(
  (lang) => lang.isWebsiteDefault,
);
export const defaultLangCode = defaultLanguage?.code || "en";
export const unrenderedLanguages = allLanguages
  .filter((lang) => statusesToUnrender.includes(lang.status))
  .map((lang) => lang.code);

// ----------- Brand styles computations
// TODO: REFACTOR HERE
export const inlineAllStyles =
  typeof brandConfig?.inlineAllStyles === "boolean"
    ? brandConfig?.inlineAllStyles
    : false;

// Widths contexts
export const brandWidthsContexts = (brandConfig?.widthsContexts || []).map(
  transformWidthsContext,
);
export const brandWidthsContextsStyles = mapStyleStringsToClassDef(
  brandWidthsContexts,
  ".widths-",
);

// Font stacks contexts
export const brandFontStacksContexts = transformFontStacksContexts(
  brandConfig?.fontStacksContexts,
  brandConfig?.customFontsImport,
);
export const brandFontStacksContextsStyles = mapStyleStringsToClassDef(
  brandFontStacksContexts,
  ".font-stacks-",
);

// Type Scale
export const brandTypeScales = transformTypeScales(brandConfig?.typeScales);
export const brandTypeScalesStyles = mapStyleStringsToClassDef(
  brandTypeScales,
  ".type-scale-",
);

// Colors
export const brandColors = transformBrandColors(brandConfig?.colors);
export const brandColorsStyles = brandColors
  .map((color) => color.stylesString)
  .join("");

// Palettes
export const brandPalettes = (brandConfig?.palettes || []).map(
  transformPalette,
);
export const brandPalettesStyles = mapStyleStringsToClassDef(
  brandPalettes,
  ".palette-",
);

// Style Contexts
export const brandStyleContexts = compileStyleContexts(
  brandConfig?.styleContexts,
  {
    widthsContext: brandWidthsContexts,
    fontStacksContext: brandFontStacksContexts,
    typeScale: brandTypeScales,
    palette: brandPalettes,
  },
);
export const brandStyleContextsStyles = mapStyleStringsToClassDef(
  brandStyleContexts,
  ".ctx-",
  0,
);

// Styles to be injected
export const brandRootStyles = [
  ":root{",
  brandWidthsContexts?.[0]?.stylesString || "",
  brandFontStacksContexts?.[0]?.stylesString || "",
  brandTypeScales?.[0]?.stylesString || "",
  brandColorsStyles || "",
  brandPalettes?.[0]?.stylesString || "",
  "}",
].join("");

export const brandStyles = [
  brandRootStyles || "",
  brandStyleContextsStyles || "", // Comes before more precise styles
  brandWidthsContextsStyles || "",
  brandFontStacksContextsStyles || "",
  brandTypeScalesStyles || "",
  brandPalettesStyles || "",
].join("\n");

const unoCssConfig =
  await import("./src/config-11ty/plugins/plugin-eleventy-unocss/uno.config.js");
export const fontPreloadTags = unoCssConfig.fontPreloadTags;

// TODO: Import ctx.css
// Once ctx.css is a proper library, we can import layers individually from node_modules
// Then chose if we want to inline styles in the head or import them as external styles

// URLs
// TODO: This is prone to forgetting to define the base url
// TODO: Could be public and defined in config
// PROD_URL is the full URL of the 'deployed' site
export const PROD_URL =
  (processEnv.PROD_URL || globalSettings?.productionUrl)?.replace(/\/+$/, "") ||
  (processEnv.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${processEnv.VERCEL_PROJECT_PRODUCTION_URL}`);
// BASE_URL is the full URL of the 'being deployed' site
// TODO: Try and find the best ways to infer BASE_URL so we can only define a CANONICAL_URL / PROD_URL
// TODO: If we have a decent way to infer this, we can fall back to PROD_URL
export const BASE_URL = (
  processEnv.BASE_URL ||
  (BRANCH === PROD_BRANCH ? PROD_URL : "") ||
  HOST_BRANCH_URL ||
  // Probably not that bad to fall back to production url
  // TODO: Verify that it is not that bad to fall back to prod url
  PROD_URL ||
  "http://localhost:8080"
)?.replace(/\/+$/, "");
// DISPLAY_URL is for the CMS button to the deployed site (prefer current deploy against production)
export const DISPLAY_URL =
  processEnv.DISPLAY_URL?.replace(/\/+$/, "") || BASE_URL || PROD_URL;

export const SITE_NAME =
  processEnv.SITE_NAME ||
  globalSettings?.metadata?.siteName ||
  globalSettings?.siteName ||
  "";

if (DEBUG) {
  console.log({ processEnv });
  console.log({
    GIT_REMOTES: processEnv.GIT_REMOTES,
    GITHUB_REPO_INFERRED,
    REPO,
  });
}

assert(BRANCH, "[env] BRANCH is required");
// assert(CMS_AUTH_URL, "[env] CMS_AUTH_URL is required"); // Not required anymore with github personal token
assert(BASE_URL, "[env] BASE_URL is required");
