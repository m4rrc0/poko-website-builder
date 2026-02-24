import { USER_DIR, languages, SITE_NAME } from "../../env.config.js";
// Was usefull when parents were declared in references
// import temp from './temp.js';
import mapInputPathToUrl from "../utils/mapInputPathToUrl.js";

const defaultLang = languages.find((lang) => lang.isWebsiteDefault)?.code;

export default {
  // ...temp,
  language: (data) => {
    // Display collection names only
    const filePathStem = data.page.filePathStem;
    const language = languages.find((lang) =>
      lang.defaultPrefixRegex.test(filePathStem),
    );

    return language;
  },
  lang: (data) => {
    // TODO: We should be able to rely on data.languages computed above but it seems unreliable...
    const filePathStem = data.page.filePathStem;
    const language = languages.find((lang) =>
      lang.defaultPrefixRegex.test(filePathStem),
    );

    return language?.code || data.lang || defaultLang;
  },
  layout: (data) => {
    return data?.pageLayout || data?.layout;
  },
  templateTranslations: (data) => {
    const { translationKey, localizationKey } = data;
    const allCollectionItems = data.collections.all;
    const collectionItems = allCollectionItems
      .filter((collectionItem) => {
        return (
          (collectionItem.data.translationKey &&
            collectionItem.data.translationKey === translationKey) ||
          (collectionItem.data.localizationKey &&
            collectionItem.data.localizationKey === localizationKey)
        );
      })
      .map((collectionItem) => {
        const {
          brand,
          brandStyles,
          brandConfig,
          fontServices,
          eleventyComputed,
          externalStylesInline,
          eleventy,
          pkg,
          collections,
          ...data
        } = { ...collectionItem.data };
        const page = { ...collectionItem.page };

        // delete data.brandStyles;
        // delete data.eleventyComputed;
        // delete data.externalStylesInline;
        // delete data.eleventy;
        // delete data.pkg;
        // delete data.collections;

        return {
          data,
          page,

          // isCurrent: collectionItem.data.lang === data.lang,
          // isDefault: collectionItem.data.lang === defaultLang,
          isCurrentLang: collectionItem.data.lang === data.lang,
          isDefaultLang: collectionItem.data.lang === defaultLang,

          fileSlug: collectionItem.page.fileSlug,
          filePathStem: collectionItem.page.filePathStem,
          translationKey: collectionItem.data.translationKey,
          localizationKey: collectionItem.data.localizationKey,
          lang: collectionItem.data.lang,
          url: collectionItem.page.url,
          name: collectionItem.data.name,
          title: collectionItem.data.title,
          pagePreview: collectionItem.data.pagePreview,
        };
      });

    const orderedCollectionItems = languages
      .map((lang) => {
        return collectionItems.find((colItem) => colItem.lang === lang.code);
      })
      .filter(Boolean);

    return orderedCollectionItems;
  },
  h1Content: (data) => {
    const { rawInput } = data.page;

    if (!rawInput || typeof rawInput !== "string") return "";

    // Try to match h1 tag content - works for HTML and some template formats
    const h1Match = rawInput.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) return h1Match[1].trim();

    // Try to match markdown # heading
    const mdMatch = rawInput.match(/^\s*#\s+(.+?)\s*$/m);
    if (mdMatch && mdMatch[1]) return mdMatch[1].trim();

    return "";
  },
  title: (data) => data.title || data.name || data.h1Content,
  permalink: (data) => {
    if (data.generatePage === "previewOnly") {
      return false;
    }
    if (typeof data.permalink === "boolean" && !data.permalink) {
      return false;
    }
    if (typeof data.permalink === "string" && data.permalink !== "") {
      // NOTE: Can come from a directory data file with embedded permalink
      return data.permalink;
    }

    const url = mapInputPathToUrl(data.page.filePathStem);
    const permalink = url.permalink;

    // TODO: understand why permalinks fail when I reference this
    // const parentsPath = (data.parentSlugs || []).join('/');
    // return `${data.parentSlug ? `${data.parentSlug}/` : ''}${filePathStem}.${data.page.outputFileExtension}`

    return `${permalink}.${data.page.outputFileExtension}`;
  },
  eleventyNavigation: (data) => {
    if (!data.eleventyNavigation) {
      return false;
    }
    return {
      key: data.page.fileSlug, // TODO: Should we use localizationKey here?
      title: data.eleventyNavigation?.title || data.title,
      parent: data.eleventyNavigation?.parent,
      order: data.eleventyNavigation?.order,
    };
  },
  // eleventyNavigation: {
  //     // add: (data) => data.eleventyNavigation?.add || false,
  //     key: (data) => data.page.fileSlug,
  //     title: (data) => data.eleventyNavigation?.title || data.name || "test",
  // },
  // eleventyNavigation: (data) => data.eleventyNavigation?.add ? data.eleventyNavigation : undefined,
  metadata: (data) => {
    const gMeta = data.globalSettings?.metadata || {};
    // const siteName = data.globalSettings?.siteName || gMeta.siteName || "";
    const siteName = SITE_NAME;
    const titleCascade = data.metadata?.title || data.title || null;
    return {
      title: [titleCascade, siteName].filter(Boolean).join(" | "),
      description: (data.metadata?.description || gMeta.description) ?? "",
      image: (data.metadata?.image || gMeta.image) ?? "",
    };
  },
  pagePreview: (data) => {
    const title = data.preview?.title || data.title || null;
    const description =
      data.preview?.description || data.metadata?.description || null;
    const image = data.preview?.image || data.metadata?.image || null;
    return {
      title,
      description,
      image,
    };
  },
  // Just to make them easier to find in the data object
  date: (data) => data.date || data.page?.date,
  url: (data) => data.url || data.page?.url,

  pageFooter: (data) => {    
    // Priorise le footer sélectionné sur la collection, puis par défaut dans settings
    const raw = data.pageFooter || data.globalSettings?.pageFooter || "";
    const key =
      typeof raw === "string"
        ? raw
            .trim()
            .replace(/\.(md|njk|11ty\.js|liquid|html)$/i, "")
            .split("/")
            .filter(Boolean)
            .pop()
        : "";

    // If no footer is defined, keep it empty so templates can fallback cleanly.
    return key ? `${data.lang}/footer/${key}` : "";
  },
};
