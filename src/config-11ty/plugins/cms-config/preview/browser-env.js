// Browser stand-in for `env.config.js`, bundled into the CMS preview renderer.
// The bundler (esbuild/Bun) redirects every `env.config.js` import here, so
// shared modules — eleventyComputed, mapInputPathToUrl, structured-data —
// run unmodified.
//
// Values that the Node module reads from CMS-editable files
// (`_data/globalSettings.yaml`, `_data/brand.yaml`) are recomputed here from
// the live Sveltia data store via `hydratePreviewEnv()` — same derivation as
// the build, from `src/env/derive.js`. Pure build constants (paths, urls,
// git/deploy context) arrive serialized from `/admin/env.js`.
//
// IMPORTANT: exports are `let` bindings hydrated at runtime — never read them
// at module top level, only inside functions.

import { deriveEnv } from "../../../../env/derive.js";

// ---- build-time constants (hydrated once from serialized env.js) ----
export let CONTENT_DIR = "_content";
export let WORKING_DIR = "_content";
export let WORKING_DIR_ABSOLUTE = "";
export let OUTPUT_DIR = "dist";
export let PARTIALS_DIR = "_partials";
export let LAYOUTS_DIR = "_layouts";
export let USER_DIR = "_user-content";
export let BASE_URL = "";
export let PROD_URL = "";
export let DISPLAY_URL = "";
export let WEBSITE_PATH_PREFIX = "";
export let COLLECTIONS = {};
export let statusesToUnrender = ["inactive", "draft"];
export let DEBUG = false;
export let NODE_ENV = "production";
export let NAV_DEPTH_MAX = 4;

// Build/git/deploy constants — meaningless in the preview but imported by
// shared modules. Stubbed so a missing export fails loud at bundle time.
export let BRANCH = "";
export let BUILD_LEVEL = "draft";
export let CACHE_DIR = "";
export let CLOUDFLARE_BUILD = false;
export let CMS_AUTH_URL = "";
export let CMS_BACKEND = "";
export let CMS_BRANCH = "";
export let CMS_IMPORT = "";
export let CMS_REPO = "";
export let CONTENT_PATH_PREFIX = "";
export let DEPLOYMENT_TARGET = "";
export let ELEVENTY_RUN_MODE = "build";
export let FILES_LIBRARY_OUTPUT_DIR = "";
export let FILES_OUTPUT_DIR = "";
export let GITHUB_GIT_REPO = "";
export let GITHUB_GIT_REPO_NAME = "";
export let GITHUB_GIT_REPO_OWNER = "";
export let GITHUB_PAGES_BUILD = false;
export let GITHUB_PAGES_DEPLOY = false;
export let IMAGE_CACHE_DIR = "";
export let IMAGES_OUTPUT_DIR = "";
export let LOCAL_BUILD = false;
export let MINIFY = false;
export let NETLIFY_BUILD = false;
export let NETLIFY_REPO = "";
export let NETLIFY_REPO_NAME = "";
export let NETLIFY_REPO_OWNER = "";
export let OUTPUT_DIR_ABSOLUTE = "";
export let POKO_THEME = "default";
export let PREFERRED_HOSTING = "";
export let PROD_BRANCH = "main";
export let REPO = "";
export let REPO_NAME = "";
export let REPO_OWNER = "";
export let REPOSITORY_URL = "";
export let SRC_DIR_ABSOLUTE = "";
export let SRC_DIR_FROM_WORKING_DIR = "";
export let VERCEL_BUILD = false;
export let VERCEL_GIT_REPO_OWNER = "";
export let VERCEL_GIT_REPO_SLUG = "";
export let fontPreloadTags = "";
export const fontPreloadTagsReady = Promise.resolve("");
export let hasUserEditorComponents = false;
export let userCmsConfig = {};
export let userHtmlClasses = "";

// Setter registry — module bindings can't be assigned by computed name.
const envBindings = {
  CONTENT_DIR: (v) => (CONTENT_DIR = v),
  WORKING_DIR: (v) => (WORKING_DIR = v),
  OUTPUT_DIR: (v) => (OUTPUT_DIR = v),
  PARTIALS_DIR: (v) => (PARTIALS_DIR = v),
  LAYOUTS_DIR: (v) => (LAYOUTS_DIR = v),
  USER_DIR: (v) => (USER_DIR = v),
  BASE_URL: (v) => (BASE_URL = v),
  PROD_URL: (v) => (PROD_URL = v),
  DISPLAY_URL: (v) => (DISPLAY_URL = v),
  WEBSITE_PATH_PREFIX: (v) => (WEBSITE_PATH_PREFIX = v),
  COLLECTIONS: (v) => (COLLECTIONS = v),
  statusesToUnrender: (v) => (statusesToUnrender = v),
  DEBUG: (v) => (DEBUG = v),
  NAV_DEPTH_MAX: (v) => (NAV_DEPTH_MAX = v),
  POKO_THEME: (v) => (POKO_THEME = v),
};

// ---- CMS-store derived values (hydrated per refresh) ----
export let globalSettings = {};
export let brandConfig = {};
export let selectedCollections = [];
export let allLanguages = [];
export let languages = [];
export let defaultLanguage;
export let defaultLangCode = "en";
export let unrenderedLanguages = [];
export let initialCmsSetup = true;
export let inlineAllStyles = false;
export let SITE_NAME = "";
export let brandWidthsContexts = [];
export let brandWidthsContextsStyles = "";
export let brandFontStacksContexts = [];
export let brandFontStacksContextsStyles = "";
export let brandTypeScales = [];
export let brandTypeScalesStyles = "";
export let brandColors = [];
export let brandColorsStyles = "";
export let brandPalettes = [];
export let brandPalettesStyles = "";
export let brandColorProfiles = [];
export let brandColorProfilesStyles = "";
export let brandStyleContexts = [];
export let brandStyleContextsStyles = "";
export let brandRootStyles = "";
export let brandStyles = "";
export let ctxData = null;
export let ctxCssText = "";

/**
 * Hydrate the env bindings. `constants` comes from the serialized
 * `/admin/env.js` module (build-time values); `globalSettings`/`brandConfig`
 * come from the CMS data store so previews reflect the values being edited.
 */
export function hydratePreviewEnv({
  constants = {},
  globalSettings: gs,
  brandConfig: bc,
} = {}) {
  // Assign every provided constant onto the matching binding; unknown keys are
  // ignored, missing keys keep their default.
  for (const [key, value] of Object.entries(constants)) {
    if (key in envBindings) envBindings[key](value);
  }
  WORKING_DIR_ABSOLUTE = WORKING_DIR;

  if (gs) globalSettings = gs;
  if (bc) brandConfig = bc;

  const derived = deriveEnv({
    globalSettings,
    brandConfig,
    statusesToUnrender,
  });
  ({
    selectedCollections,
    allLanguages,
    languages,
    defaultLanguage,
    defaultLangCode,
    unrenderedLanguages,
    initialCmsSetup,
    inlineAllStyles,
    brandWidthsContexts,
    brandWidthsContextsStyles,
    brandFontStacksContexts,
    brandFontStacksContextsStyles,
    brandTypeScales,
    brandTypeScalesStyles,
    brandColors,
    brandColorsStyles,
    brandPalettes,
    brandPalettesStyles,
    brandColorProfiles,
    brandColorProfilesStyles,
    brandStyleContexts,
    brandStyleContextsStyles,
    brandRootStyles,
    brandStyles,
    ctxData,
    ctxCssText,
    SITE_NAME,
  } = derived);
}
