import { transformLanguage } from "../utils/languages.js";
import { resolveBrand } from "../config-11ty/plugins/ctx-css/resolve.js";
import { compileCtxCss } from "../config-11ty/plugins/ctx-css/transform.js";

// Every value here derives from CMS-editable data (`_data/globalSettings.yaml`,
// `_data/brand.yaml` + `_data/brand/*.yaml`) — the same computation runs at
// build time (env.config.js) and in the browser CMS preview
// (cms-config/preview/browser-env.js), so previews can hydrate live values
// straight from the Sveltia data store.
export function deriveEnv({
  globalSettings = {},
  brandConfig = {},
  statusesToUnrender = ["inactive", "draft"],
} = {}) {
  const selectedCollections = globalSettings?.collections || [];

  const allLanguages = globalSettings?.languages?.map(transformLanguage) || [];
  const initialCmsSetup = !allLanguages?.length;
  const languages = allLanguages.filter(
    (lang) => !statusesToUnrender.includes(lang.status),
  );
  // Prefer a rendered language: a `draft`/`inactive` website default must not
  // leak into `defaultLangCode`, which is the fallback lang for every page.
  const defaultLanguage =
    languages.find((lang) => lang.isWebsiteDefault) ||
    languages[0] ||
    allLanguages.find((lang) => lang.isWebsiteDefault);
  const defaultLangCode = defaultLanguage?.code || "en";
  const unrenderedLanguages = allLanguages
    .filter((lang) => statusesToUnrender.includes(lang.status))
    .map((lang) => lang.code);

  // Brand/style data: `_data/brand/*.yaml` -> `_data/brand.yaml` -> defaults,
  // resolved and compiled by the ctx-css plugin.
  const ctxData = resolveBrand(brandConfig);
  const compiled = compileCtxCss(ctxData);

  const inlineAllStyles = ctxData.settings.inlineAllStyles;

  const brandWidthsContexts = compiled.widthsContexts;
  const brandWidthsContextsStyles = compiled.widthsContextsStyles;
  const brandFontStacksContexts = compiled.fontStacksContexts;
  const brandFontStacksContextsStyles = compiled.fontStacksContextsStyles;
  const brandTypeScales = compiled.typeScales;
  const brandTypeScalesStyles = compiled.typeScalesStyles;
  const brandColors = compiled.colors;
  const brandColorsStyles = compiled.colorsStyles;
  const brandPalettes = compiled.palettes;
  const brandPalettesStyles = compiled.palettesStyles;
  const brandColorProfiles = compiled.colorProfiles;
  const brandColorProfilesStyles = compiled.colorProfilesStyles;
  const brandStyleContexts = compiled.styleContexts;
  const brandStyleContextsStyles = compiled.styleContextsStyles;

  const brandRootStyles = compiled.rootStyles;
  const ctxCssText = compiled.cssText;
  // Legacy name: the full generated block (kept for the CMS preview overlay
  // and any template still referencing it). ctxCssText is the new name.
  const brandStyles = ctxCssText;

  const SITE_NAME =
    globalSettings?.metadata?.siteName || globalSettings?.siteName || "";

  return {
    selectedCollections,
    allLanguages,
    initialCmsSetup,
    languages,
    defaultLanguage,
    defaultLangCode,
    unrenderedLanguages,
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
  };
}
