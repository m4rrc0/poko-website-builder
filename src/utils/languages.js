// import { BUILD_LEVEL } from "../../env.config.js";
import { shortList as langCodesList } from "./langCodesList.js";

// Languages eligible for URL-prefix stripping and default flags. This is a
// fixed list on purpose: `isWebsiteDefault`/`isCmsDefault` flags are baked
// into the language objects and must not flip between dev/prod (the
// mode-dependent `statusesToUnrender` filter is applied later, in derive.js).
const RENDERABLE_STATUS = /^(published|draft)$/;

// `customUrlPrefix` accepts a bare string or a `{ prefix }` object.
const customUrlPrefixOf = (lang) =>
  typeof lang?.customUrlPrefix === "string"
    ? lang.customUrlPrefix
    : lang?.customUrlPrefix?.prefix;

export const transformLanguage = (lang, _index, languages) => {
  const renderableLanguages = languages.filter((l) =>
    RENDERABLE_STATUS.test(l.status),
  );
  const cmsDefault = inferCmsDefault(renderableLanguages);
  const websiteDefault = inferWebsiteDefault(renderableLanguages);
  const customPrefix = customUrlPrefixOf(lang);
  // Exactly one language drops its URL prefix: an explicit empty
  // `customUrlPrefix` wins; otherwise the website default — the first
  // renderable language, or the one carrying the legacy `isWebsiteDefault`
  // flag — unless it keeps its prefix (`keepUrlPrefix` or a custom one).
  const noPrefixLang =
    renderableLanguages.find((l) => customUrlPrefixOf(l) === "") ||
    (!websiteDefault?.keepUrlPrefix &&
    customUrlPrefixOf(websiteDefault) === undefined
      ? websiteDefault
      : undefined);
  const prefix = lang === noPrefixLang ? "" : customPrefix || lang.code;

  return {
    ...lang,
    name:
      lang.name ||
      langCodesList.find((l) => l.code === lang.code)?.name ||
      lang.code,
    defaultPrefixRegex: new RegExp(`^\/*${lang.code}\/`),
    customPrefix,
    prefix,
    isCmsDefault: lang.code === cmsDefault?.code,
    isWebsiteDefault: lang.code === websiteDefault?.code,
  };
};

// Language inference from a template's filePathStem. The stem always keeps
// the `{code}` directory even when the public URL prefix is stripped, so it
// identifies the language unambiguously — unlike `page.url`, whose first
// segment is an arbitrary slug on unprefixed pages (see the I18nPlugin
// `page.lang` override in eleventy.config.js).
export const languageFromFilePathStem = (filePathStem, languages) =>
  languages?.find((lang) => lang?.defaultPrefixRegex?.test(filePathStem));

export const langCodeForPage = (
  { filePathStem, lang } = {},
  languages,
  fallbackCode,
) =>
  languageFromFilePathStem(filePathStem, languages)?.code ||
  lang ||
  fallbackCode;

// Note: the first match is the right one. Fallback to first of list
const inferCmsDefault = (languages) => {
  return languages.find((lang) => lang.isCmsDefault) || languages[0];
};
const inferWebsiteDefault = (languages) => {
  return languages.find((lang) => lang.isWebsiteDefault) || languages[0];
};
