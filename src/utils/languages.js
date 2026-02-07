// import { BUILD_LEVEL } from "../../env.config.js";
import { shortList as langCodesList } from "./langCodesList.js";

export const transformLanguage = (lang, index, languages) => {
  // const regex =
  //   BUILD_LEVEL === "production" ? /^published/ : /^published|draft/;
  const regexStatus = /^published|draft/; // Just assume the user will set that up properly...
  const filteredLanguages = languages.filter((lang) =>
    regexStatus.test(lang.status),
  );
  const cmsDefault = inferCmsDefault(filteredLanguages);
  const websiteDefault = inferWebsiteDefault(filteredLanguages);
  const customPrefix = lang.customUrlPrefix?.prefix;
  let noPrefixLangIndex = filteredLanguages.findIndex(
    (lang) =>
      lang.customUrlPrefix?.prefix === "" || lang.customUrlPrefix === "",
  );
  noPrefixLangIndex =
    noPrefixLangIndex === -1 && index === 0 && !lang.keepUrlPrefix
      ? 0
      : noPrefixLangIndex;
  const prefix = noPrefixLangIndex === index ? "" : customPrefix || lang.code;

  return {
    ...lang,
    name:
      lang.name ||
      langCodesList.find((l) => l.code === lang.code)?.name ||
      lang.code,
    defaultPrefixRegex: new RegExp(`^\/*${lang.code}\/`),
    customPrefix,
    prefix,
    isCmsDefault: lang.code === cmsDefault.code,
    isWebsiteDefault: lang.code === websiteDefault.code,
  };
};

// Note: the first match is the right one. Fallback to first of list
const inferCmsDefault = (languages) => {
  return languages.find((lang) => lang.isCmsDefault) || languages[0];
};
const inferWebsiteDefault = (languages) => {
  return languages.find((lang) => lang.isWebsiteDefault) || languages[0];
};
