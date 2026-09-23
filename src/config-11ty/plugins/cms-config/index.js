import { build as bunBuild } from "bun";
import { MINIFY } from "../../../../env.config.js";
import { CmsConfig } from "./config.js";
import { CmsPage } from "./page.js";
import { getActiveCollections, getActiveEditorComponents } from "./config.js";
import { enginePath, dependencyEnginePath } from "../../../utils/paths.js";

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
      [dependencyEnginePath("@sveltia/cms", "dist/sveltia-cms.js")]:
        "assets/js/sveltia-cms.js",
      [dependencyEnginePath("@sveltia/cms", "dist/sveltia-cms.mjs")]:
        "assets/js/sveltia-cms.mjs",
    });
  } else if (CMS_IMPORT.startsWith("../../")) {
    eleventyConfig.addPassthroughCopy({
      [CMS_IMPORT + "sveltia-cms.js"]: "assets/js/sveltia-cms.js",
      [CMS_IMPORT + "sveltia-cms.mjs"]: "assets/js/sveltia-cms.mjs",
    });
  } else if (CMS_IMPORT === "local") {
    eleventyConfig.addPassthroughCopy({
      [enginePath("assets/js/sveltia-cms.js")]: "assets/js/sveltia-cms.js",
      [enginePath("assets/js/sveltia-cms.mjs")]: "assets/js/sveltia-cms.mjs",
    });
  }

  eleventyConfig.addPassthroughCopy({
    [enginePath(
      "src/config-11ty/plugins/cms-config/defaultEditorComponents.js",
    )]: "admin/defaultEditorComponents.js",
    [enginePath("src/config-11ty/plugins/cms-config/preview-runtime.js")]:
      "admin/preview-runtime.js",
    [enginePath("src/config-11ty/plugins/cms-config/previewTemplates.js")]:
      "admin/previewTemplates.js",
  });

  const previewRendererEntryPath = `${import.meta.dirname}/preview-renderer.entry.js`;
  let previewRendererCode;
  try {
    const { outputs } = await bunBuild({
      entrypoints: [previewRendererEntryPath],
      target: "browser",
      format: "esm",
      minify: MINIFY,
    });
    previewRendererCode = await outputs[0].text();
  } catch (e) {
    console.error(e);
    throw e;
  }

  eleventyConfig.addTemplate(
    "admin/preview-renderer.11ty.js",
    {
      data: () => ({
        permalink: "/admin/preview-renderer.js",
        eleventyExcludeFromCollections: true,
        layout: null,
      }),
      render: () => previewRendererCode,
    },
    {},
  );

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
