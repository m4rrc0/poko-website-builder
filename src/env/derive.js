import { transformLanguage } from "../utils/languages.js";
import {
  mapStyleStringsToClassDef,
  compileStyleContexts,
  transformFontStacksContexts,
  transformWidthsContext,
  transformBrandColors,
  transformPalette,
  transformTypeScales,
} from "../utils/transformStyles.js";

// Every value here derives from CMS-editable data (`_data/globalSettings.yaml`,
// `_data/brand.yaml`) — the same computation runs at build time (env.config.js)
// and in the browser CMS preview (cms-config/preview/browser-env.js), so previews can
// hydrate live values straight from the Sveltia data store.
export function deriveEnv({
  globalSettings = {},
  brandConfig = {},
  statusesToUnrender = ["inactive", "draft"],
} = {}) {
  const selectedCollections = globalSettings?.collections || [];

  const allLanguages =
    globalSettings?.languages?.map(transformLanguage) || [];
  const initialCmsSetup = !allLanguages?.length;
  const languages = allLanguages.filter(
    (lang) => !statusesToUnrender.includes(lang.status),
  );
  const defaultLanguage = allLanguages.find((lang) => lang.isWebsiteDefault);
  const defaultLangCode = defaultLanguage?.code || "en";
  const unrenderedLanguages = allLanguages
    .filter((lang) => statusesToUnrender.includes(lang.status))
    .map((lang) => lang.code);

  const inlineAllStyles =
    typeof brandConfig?.inlineAllStyles === "boolean"
      ? brandConfig?.inlineAllStyles
      : false;

  const brandWidthsContexts = (brandConfig?.widthsContexts || []).map(
    transformWidthsContext,
  );
  const brandWidthsContextsStyles = mapStyleStringsToClassDef(
    brandWidthsContexts,
    ".widths-",
  );

  const brandFontStacksContexts = transformFontStacksContexts(
    brandConfig?.fontStacksContexts,
    brandConfig?.customFontsImport,
  );
  const brandFontStacksContextsStyles = mapStyleStringsToClassDef(
    brandFontStacksContexts,
    ".fonts-",
  );

  const brandTypeScales = transformTypeScales(brandConfig?.typeScales);
  const brandTypeScalesStyles = mapStyleStringsToClassDef(
    brandTypeScales,
    ".type-scale-",
  );

  const brandColors = transformBrandColors(brandConfig?.colors);
  const brandColorsStyles = brandColors
    .map((color) => color.stylesString)
    .join("");

  const brandPalettes = (brandConfig?.palettes || []).map(transformPalette);
  const brandPalettesStyles = mapStyleStringsToClassDef(
    brandPalettes,
    ".palette-",
  );

  const brandStyleContexts = compileStyleContexts(brandConfig?.styleContexts, {
    widthsContext: brandWidthsContexts,
    fontStacksContext: brandFontStacksContexts,
    typeScale: brandTypeScales,
    palette: brandPalettes,
  });
  const brandStyleContextsStyles = mapStyleStringsToClassDef(
    brandStyleContexts,
    ".ctx-",
    0,
  );

  const brandRootStyles = [
    ":root{",
    brandWidthsContexts?.[0]?.stylesString || "",
    brandFontStacksContexts?.[0]?.stylesString || "",
    brandTypeScales?.[0]?.stylesString || "",
    brandColorsStyles || "",
    brandPalettes?.[0]?.stylesString || "",
    "}",
  ].join("");

  const brandStyles = [
    brandRootStyles || "",
    brandStyleContextsStyles || "",
    brandWidthsContextsStyles || "",
    brandFontStacksContextsStyles || "",
    brandTypeScalesStyles || "",
    brandPalettesStyles || "",
  ].join("\n");

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
    brandStyleContexts,
    brandStyleContextsStyles,
    brandRootStyles,
    brandStyles,
    SITE_NAME,
  };
}
