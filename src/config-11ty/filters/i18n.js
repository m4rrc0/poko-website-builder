import { languages } from "../../../env.config.js";
import { getNestedValue } from "../../utils/objects.js";

// remove any lang prefix if present and leading/trailing slashes
function stripUrl(input, langPrefixRegex, collectionNamesRegex) {
  if (typeof input !== "string") {
    return input;
  }
  return input
    .replace(langPrefixRegex, "")
    .replace(collectionNamesRegex, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function lookupTemplateTranslations(
  inputOptional,
  templates,
  collectionName = "all",
) {
  const input = inputOptional || this.page.url;
  // Avoid going through all templates if we have the right data available in ctx
  if (input === this.ctx.translationKey || input === this.ctx.page.url) {
    return this.ctx.templateTranslations;
  }

  // TODO: Make this more robust
  // Removing lang prefix and collection name from input makes collision more probable

  const langPrefixes = (this.ctx?.languages || languages).map(
    (lang) => lang.prefix,
  );
  const langPrefixRegex = new RegExp(`^\/*(${langPrefixes.join("|")})\/`);
  const collectionNames = Object.keys(this.ctx.collections);
  const collectionNamesRegex = new RegExp(
    `^\/*(${collectionNames.join("|")})\/`,
  );
  const cleanedInput = stripUrl(input, langPrefixRegex, collectionNamesRegex);

  const allTemplates =
    templates ||
    this.ctx.collections?.[collectionName] ||
    this.ctx.collections.all ||
    [];

  // Find matching template in any language
  const template = allTemplates.find((templ) => {
    // Match translationKey first
    if (templ.data.translationKey === cleanedInput) {
      return true;
    }
    // Then match url
    const cleanedTemplateUrl = stripUrl(
      templ.page.url,
      langPrefixRegex,
      collectionNamesRegex,
    );

    if (cleanedTemplateUrl === cleanedInput) {
      return true;
    }

    // TODO: Matching filePathStem after that might be more robust?

    return false;
  });
  // Retrieve the right translation and its URL
  const templateTranslations = template?.data?.templateTranslations;

  return templateTranslations;
}

// input can be a url (with or without lang prefix) or ideally a translationKey
// lang is optional and overwrites the current page's lang
// Default signature should be: {{ pageRef | locale_url(lang, propName, collectionName) }}
// But we can ommit `lang` if we only want to pass `propName`: {{ pageRef | locale_url(propName) }}
export function locale_url(...args) {
  // const originalFilter = this.env.getFilter("locale_url_original");
  const input = args[0];
  const langOverride =
    (args[1] && languages.find((lang) => lang.code === args[1])?.code) ||
    undefined;
  const propName =
    args[2] || (typeof langOverride === "undefined" && args[1]) || "url";
  const collectionName = args[3] || "all";

  try {
    const lang = langOverride || this.page.lang;
    const templateTranslations = lookupTemplateTranslations.call(
      this,
      input,
      undefined,
      collectionName,
    );

    const translationMatch = templateTranslations?.find((translation) => {
      return translation.lang === lang;
    });

    if (translationMatch) {
      translationMatch.html = `<a href="${translationMatch.url}">${translationMatch.title}</a>`;
    }

    if (propName === "all") {
      return translationMatch;
    }

    const propMatch = getNestedValue(translationMatch, propName);

    return propMatch;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// inclusionOption can be "all", "others", "self" or a lang code
export function locale_links(input, inclusionOption = "others") {
  const templateTranslations = lookupTemplateTranslations.call(this, input);

  if (inclusionOption === "all") {
    return templateTranslations;
  } else if (inclusionOption === "others") {
    return templateTranslations.filter((translation) => {
      return translation.lang !== this.page.lang;
    });
  } else if (inclusionOption === "self") {
    return templateTranslations.filter((translation) => {
      return translation.lang === this.page.lang;
    });
  } else if (
    typeof inclusionOption === "string" &&
    inclusionOption.length === 2
  ) {
    return templateTranslations.filter((translation) => {
      return translation.lang === inclusionOption;
    });
  }

  return templateTranslations;
}
