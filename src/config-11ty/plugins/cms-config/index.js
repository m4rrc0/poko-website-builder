import fglob from "fast-glob";
import { readFile } from "node:fs/promises";
import { MINIFY } from "../../../../env.config.js";
import { CmsConfig } from "./config.js";
import { CmsPage } from "./page.js";
import {
  pagesCollection,
  getActiveCollections,
  getActiveEditorComponents,
} from "./config.js";
import { enginePath, dependencyEnginePath } from "../../../utils/paths.js";
import { buildJs } from "../../../utils/runtime.js";
import { getUnoGenerator } from "../plugin-eleventy-unocss/generator.js";

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
  const [{ content: previewRendererCode }] = await buildJs({
    entrypoints: [previewRendererEntryPath],
    minify: MINIFY,
  });

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
  export const pagesCollection = ${JSON.stringify(pagesCollection)};
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

  // Styles for the CMS preview iframe: the UnoCSS layer that pages get via the
  // .noop-load-uno{} transform, generated once from a corpus of everything the
  // preview can render (the brand preflight ships with every generate() call).
  const previewCssCorpusGlobs = [
    enginePath("src/content/_partials/**/*.{11ty.js,njk,md}"),
    enginePath("src/config-11ty/plugins/partialShortcodes/**/*.js"),
    enginePath("src/config-11ty/plugins/plugin-eleventy-unocss/rules/*.js"),
    `${import.meta.dirname}/{preview-runtime,previewTemplates,section-primitives}.js`,
    `${CONTENT_DIR}/**/*.{11ty.js,njk,md}`,
  ];
  // Tokens only ever produced from CMS data values, never literal in the corpus
  const previewCssSafelist = [
    "palette--default",
    "palette--reset",
    "palette--contrast",
    "palette--pop",
    "palette--accent",
    "palette--tone",
    "palette--alt",
    "palette--bg-pop",
    "palette--bg-tone",
    "palette--pop-contrast",
    "palette--tone-contrast",
  ];

  eleventyConfig.addWatchTarget(enginePath("src/content/_partials/"));
  eleventyConfig.addWatchTarget(
    enginePath("src/config-11ty/plugins/partialShortcodes/"),
  );
  eleventyConfig.addWatchTarget(`./${CONTENT_DIR}/`);

  eleventyConfig.addTemplate(
    "admin/preview-css.11ty.js",
    {
      data: () => ({
        permalink: "/admin/preview.css",
        eleventyExcludeFromCollections: true,
        layout: null,
      }),
      render: async () => {
        const files = await fglob(previewCssCorpusGlobs);
        const contents = await Promise.all(
          files.map((file) => readFile(file, "utf-8")),
        );
        const generator = await getUnoGenerator();
        const { css } = await generator.generate(
          [...contents, ...previewCssSafelist].join("\n"),
        );
        return css;
      },
    },
    {},
  );

  eleventyConfig.addTemplate("admin/config.11ty.js", CmsConfig, {});
  eleventyConfig.addTemplate("admin/index.11ty.js", CmsPage, {});
}
