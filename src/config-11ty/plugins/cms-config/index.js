import { CmsConfig } from "./config.js";
import { CmsPage } from "./page.js";
import { getActiveCollections, getActiveEditorComponents } from "./config.js";

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  const CMS_IMPORT =
    pluginOptions.CMS_IMPORT || process.env.CMS_IMPORT || "cdn";
  const CONTENT_DIR =
    pluginOptions.CONTENT_DIR || process.env.CONTENT_DIR || "_content";
  const iconLists = pluginOptions.iconLists || process.env.iconList || {};

  // Copy Sveltia CMS if not using CDN
  if (CMS_IMPORT === "npm") {
    eleventyConfig.addPassthroughCopy({
      "node_modules/@sveltia/cms/dist/sveltia-cms.js":
        "assets/js/sveltia-cms.js",
      "node_modules/@sveltia/cms/dist/sveltia-cms.mjs":
        "assets/js/sveltia-cms.mjs",
    });
  } else if (CMS_IMPORT.startsWith("../../")) {
    eleventyConfig.addPassthroughCopy({
      [CMS_IMPORT + "sveltia-cms.js"]: "assets/js/sveltia-cms.js",
      [CMS_IMPORT + "sveltia-cms.mjs"]: "assets/js/sveltia-cms.mjs",
    });
  } else if (CMS_IMPORT === "local") {
    eleventyConfig.addPassthroughCopy({
      "assets/js/sveltia-cms.js": "assets/js/sveltia-cms.js",
      "assets/js/sveltia-cms.mjs": "assets/js/sveltia-cms.mjs",
    });
  }

  eleventyConfig.addPassthroughCopy({
    "src/config-11ty/plugins/cms-config/defaultEditorComponents.js":
      "admin/defaultEditorComponents.js",
  });

  eleventyConfig.addTemplate(
    "env.11ty.js",
    async function (data) {
      const activeCollections = await getActiveCollections();
      const editorComponents = getActiveEditorComponents();
      const activeCollectionNames = activeCollections
        .map((c) => c?.name)
        .filter(Boolean);

      const envVars = { CONTENT_DIR };

      return `
  export const env = ${JSON.stringify(envVars)};
  export const activeCollections = ${JSON.stringify(activeCollections)};
  export const editorComponents = ${JSON.stringify(editorComponents)};
  export const activeCollectionNames = ${JSON.stringify(activeCollectionNames)};
  export const iconLists = ${JSON.stringify(iconLists)};
  `;
    },
    {
      permalink: "/admin/env.js",
      eleventyExcludeFromCollections: true,
      layout: null,
    },
  );

  eleventyConfig.addTemplate("admin/config.11ty.js", CmsConfig, {});
  eleventyConfig.addTemplate("admin/index.11ty.js", CmsPage, {});
}
