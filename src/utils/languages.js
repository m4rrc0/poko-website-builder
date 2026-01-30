// import { BUILD_LEVEL } from "../../env.config.js";

export const transformLanguage = (lang, index, languages) => {
  const cmsDefault = inferCmsDefault(languages);
  const websiteDefault = inferWebsiteDefault(languages);

  return {
    ...lang,
    defaultPrefixRegex: new RegExp(`^\/*${lang.code}\/`),
    customPrefix: lang.customUrlPrefix?.prefix,
    prefix: lang.customUrlPrefix?.prefix || lang.code,
    isCmsDefault: lang.code === cmsDefault.code,
    isWebsiteDefault: lang.code === websiteDefault.code,
  };
};

// Note: the first match is the right one. Fallback to first of list
const inferCmsDefault = (languages) => {
  return (
    languages
      .filter((lang) => /^published|draft/.test(lang.status))
      .find((lang) => lang.isCmsDefault) || languages[0]
  );
};
const inferWebsiteDefault = (languages) => {
  // const regex =
  //   BUILD_LEVEL === "production" ? /^published/ : /^published|draft/;
  const regex = /^published|draft/; // Just assume the user will set that up properly...
  return (
    languages
      .filter((lang) => regex.test(lang.status))
      .find((lang) => lang.isWebsiteDefault) || languages[0]
  );
};
