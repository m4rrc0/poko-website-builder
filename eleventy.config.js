import path from "node:path";
import fs from "node:fs";
import yaml from "js-yaml";
import fglob from "fast-glob";
// import { fileURLToPath } from "node:url";
// import Nunjucks from "nunjucks";
import { transform as lightningTransform } from "lightningcss";

// -------- Plugins External
import directoryOutputPlugin from "@11ty/eleventy-plugin-directory-output";
import {
  RenderPlugin,
  IdAttributePlugin,
  I18nPlugin,
  HtmlBasePlugin,
} from "@11ty/eleventy";
import Fetch from "@11ty/eleventy-fetch";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginWebc from "@11ty/eleventy-plugin-webc";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import pluginRobotsTxt from "eleventy-plugin-robotstxt";
import pluginSitemap from "@quasibit/eleventy-plugin-sitemap";
import pluginIcons from "eleventy-plugin-icons";
import pluginCodeblocks from "@code-blocks/eleventy-plugin";
import pluginCodeBlocksCharts from "@code-blocks/charts";

// -------- Plugins Internal
import { imageTransformOptions } from "./src/config-11ty/plugins/imageTransform.js";
import yamlData from "./src/config-11ty/plugins/yamlData/index.js";
import cmsConfigPlugin from "./src/config-11ty/plugins/cms-config/index.js";
import autoCollections from "./src/config-11ty/plugins/auto-collections/index.js";
import htmlClassesTransform from "./src/config-11ty/plugins/html-classes-transform/index.js";
import populateInputDir from "./src/config-11ty/plugins/populateInputDir/index.js";
import partialsPlugin from "./src/config-11ty/plugins/partials/index.js";
import partialShortcodesPlugin from "./src/config-11ty/plugins/partialShortcodes/index.js";
import buildExternalCSS from "./src/config-11ty/plugins/buildExternalCSS/index.js";
import ctxCss from "./src/config-11ty/plugins/ctxCss/index.js";
import pluginUnoCSS from "./src/config-11ty/plugins/plugin-eleventy-unocss/index.js";
import customRenderersPlugin from "./src/config-11ty/plugins/customRenderers/index.js";
// import keystaticPassthroughFiles from './src/config-11ty/plugins/keystaticPassthroughFiles/index.js';
// -------- Plugins Markdown
import markdownItContainer from "markdown-it-container";
// import { container as markdownItContainer } from "@mdit/plugin-container"
import markdownItMark from "markdown-it-mark";
import markdownItLinkAttributes from "markdown-it-link-attributes";
import markdownItAttrs from "markdown-it-attrs";
import markdownItBracketedSpans from "markdown-it-bracketed-spans";
// -------- Env Variables
import * as env from "./env.config.js";
import {
  DEBUG,
  CMS_IMPORT,
  ELEVENTY_RUN_MODE,
  BUILD_LEVEL,
  MINIFY,
  WORKING_DIR,
  WORKING_DIR_ABSOLUTE,
  CONTENT_DIR,
  // SRC_DIR_FROM_WORKING_DIR,
  PARTIALS_DIR,
  LAYOUTS_DIR,
  OUTPUT_DIR,
  FILES_OUTPUT_DIR,
  BASE_URL,
  PROD_URL,
  WEBSITE_PATH_PREFIX,
  POKO_THEME,
  statusesToUnrender,
  allLanguages,
  languages,
  defaultLanguage,
  defaultLangCode,
  unrenderedLanguages,
  brandConfig,
  inlineAllStyles,
  brandStyles,
  fontPreloadTags,
  userCmsConfig,
} from "./env.config.js";
import { getSelectedCollections } from "./src/config-11ty/plugins/cms-config/index.js";
import eleventyComputed from "./src/data/eleventyComputed.js";

// Eleventy Config
import {
  glob as globFilter,
  toISOString,
  formatDate,
  dateToSlug,
  toLocaleString,
  slugifyPath,
  locale_url,
  locale_links,
  filterCollection,
  join,
  first,
  last,
  randomFilter,
  sortCollection,
  asc,
  desc,
  ogImageSrc,
  image as imageFilter,
  emailLink,
  email,
  htmlAttrs,
  htmlImgAttrs,
} from "./src/config-11ty/filters/index.js";
import {
  newLine,
  fetchFile as fetchFileShortcode,
  link as linkShortcode,
  button as buttonShortcode,
  image,
  gallery,
  wrapper,
} from "./src/config-11ty/shortcodes/index.js";
// import { ogImageSelected } from "./src/config-11ty/shortcodes/index.js";

if (DEBUG) {
  console.log("---------ENV-----------\n", env, "\n---------/ENV---------");
}

// TODOS:
// - Look at persisting images in cache between builds: https://github.com/11ty/eleventy-img/issues/285

function shouldNotRender(data) {
  if (data.page.filePathStem.startsWith("/_")) {
    return true;
  }
  for (const lang of unrenderedLanguages) {
    if (data.page.filePathStem.startsWith(`/${lang}`)) {
      return true;
    }
  }
  if (data.status && statusesToUnrender.includes(data.status)) {
    return true;
  }
  return false;
}

function mditRenderContainerTag(tagName, tokens, idx, options, env, Renderer) {
  tokens[idx].tag = tagName;
  return Renderer.renderToken(tokens, idx, options);
}
function mRCTOptions(tagName) {
  return {
    render: function (tokens, idx, options, env, Renderer) {
      return mditRenderContainerTag(
        tagName,
        tokens,
        idx,
        options,
        env,
        Renderer,
      );
    },
  };
}

const iconSources = [
  {
    name: "simple",
    path: "node_modules/simple-icons/icons",
    default: true,
  },
  {
    name: "tabler",
    path: "node_modules/@tabler/icons/icons/outline",
  },
  {
    name: "tablerOutline",
    path: "node_modules/@tabler/icons/icons/outline",
  },
  {
    name: "tablerFilled",
    path: "node_modules/@tabler/icons/icons/filled",
  },
];

const simple = fglob.globSync("node_modules/simple-icons/icons/*.svg");
const tablerOutline = fglob.globSync(
  "node_modules/@tabler/icons/icons/outline/*.svg",
);
const tablerFilled = fglob.globSync(
  "node_modules/@tabler/icons/icons/filled/*.svg",
);

const iconLists = {
  simple: simple.map((filePath) =>
    filePath.split("/").pop().replace(".svg", ""),
  ),
  tablerOutline: tablerOutline.map((filePath) =>
    filePath.split("/").pop().replace(".svg", ""),
  ),
  tablerFilled: tablerFilled.map((filePath) =>
    filePath.split("/").pop().replace(".svg", ""),
  ),
};

/**
 * @typedef { import("@11ty/eleventy").UserConfig } UserConfig
 */
export const config = {
  dir: {
    // input: "src/templates",
    input: WORKING_DIR, // this is probably '_content'
    // input: WORKING_DIR_ABSOLUTE,
    // TODO: I'd love to do this
    // includes: [PARTIALS_DIR, `${SRC_DIR_FROM_WORKING_DIR}/content/_partials`],
    includes: PARTIALS_DIR, // this is probably '_partials'
    layouts: LAYOUTS_DIR, // this is probably '_layouts'
    // data: "../src/data", // Directory for global data files. Default: "_data"
    // data: "/src/data", // Directory for global data files. Default: "_data"
    // output: "public",
    output: OUTPUT_DIR,
  },
  templateFormats: ["md", "njk", "html", "11ty.js"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
  // htmlTemplateEngine: "mdoc",
  pathPrefix: WEBSITE_PATH_PREFIX,
};

export default async function (eleventyConfig) {
  // --------------------- Base Config
  eleventyConfig.setQuietMode(true);

  eleventyConfig.setWatchThrottleWaitTime(500); // in milliseconds

  eleventyConfig.addWatchTarget("./src/config-11ty/**/*", {
    resetConfig: true,
  });
  eleventyConfig.addWatchTarget("./src/styles/**/*.css", {
    resetConfig: true,
  });
  // eleventyConfig.addWatchTarget("./src/**/*");
  eleventyConfig.addWatchTarget("./env.config.js", { resetConfig: true });
  eleventyConfig.addWatchTarget("./eleventy.config.js", { resetConfig: true });
  eleventyConfig.addWatchTarget(`${WORKING_DIR}/**/*.css`, {
    resetConfig: true,
  });
  // eleventyConfig.addWatchTarget(`${WORKING_DIR}/**/*`, { resetConfig: true });
  // eleventyConfig.watchIgnores.add(`${WORKING_DIR}/_styles/_ctx.css`);
  // eleventyConfig.setUseGitIgnore(false);

  // --------------------- Custom Nunjucks setup
  // TODO: Does this work as expected?
  // NOTE: This is a workaround because virtual templates does not work for includes

  // let nunjucksEnvironment = new Nunjucks.Environment(
  //   [
  //     new Nunjucks.FileSystemLoader(`${WORKING_DIR}/${PARTIALS_DIR}`),
  //     new Nunjucks.FileSystemLoader(`src/content/_partials`),
  //   ],
  //   {
  //     dev: true,
  //     watch: ELEVENTY_RUN_MODE !== "build",
  //   }
  // );
  // eleventyConfig.setLibrary("njk", nunjucksEnvironment);

  // --------------------- Eleventy Events
  // eleventyConfig.on(
  //   "eleventy.before",
  //   async (/*{ directories,`src/styles/ctx/index.css` runMode, outputMode, dir, ...arg }*/) => {
  //     // 1. Read data in '_content/_data/brand.yaml'
  //     let brandConfig = {};
  //     const brandConfigPath = `${WORKING_DIR_ABSOLUTE}/_data/brand.yaml`;
  //     try {
  //       const brandConfigYaml = fs.readFileSync(brandConfigPath, "utf-8");
  //       brandConfig = yaml.load(brandConfigYaml);
  //     } catch (error) {
  //       console.warn("WARN: brandConfig.yaml not found");
  //     }
  //     // 2. If "copy ctx.css" toggle is true, copy the ctx.css file to '_content/styles' directory with the defined name
  //     const ctxOutputFilename = brandConfig?.ctxCssImport?.filename;
  //     const toggleCopyCtxCss = typeof ctxOutputFilename === "string";
  //     const ctxOutputPath = `${WORKING_DIR_ABSOLUTE}/_styles/${
  //       ctxOutputFilename || "ctx.css"
  //     }`;
  //     const ctxInputPath = `src/styles/ctx.css`;
  //     if (toggleCopyCtxCss) {
  //       // Make sure the destination folder exists
  //       const destDir = path.dirname(ctxOutputPath);
  //       if (!fs.existsSync(destDir)) {
  //         fs.mkdirSync(destDir, { recursive: true });
  //       }
  //       fs.copyFileSync(ctxInputPath, ctxOutputPath);
  //     } else {
  //       // 3. If "copy ctx.css" toggle is false, delete the ctx.css file from '_content/styles' directory
  //       try {
  //         fs.unlinkSync(ctxOutputPath);
  //       } catch (error) {
  //         console.warn(
  //           "Trying to delete ctx.css but it doesn't seem to exist. If you named the file differently, please remove it manually from the CMS or file system.",
  //         );
  //       }
  //     }
  //   },
  // );

  // --------------------- Preprocessors
  eleventyConfig.addPreprocessor("Publication Status", "*", (data, content) => {
    if (shouldNotRender(data)) {
      return false;
    }
  });

  // --------------------- Plugins Markdown
  eleventyConfig.amendLibrary(
    "md",
    (mdLib) =>
      mdLib
        // https://github.com/markdown-it/markdown-it-container
        // .use(markdownItContainer, "@", {
        //   render: function (tokens, idx) {
        //     const token = tokens[idx];
        //     const attrsStr =
        //       token.attrs
        //         ?.map(([name, value]) => `${name}="${value}"`)
        //         ?.join(" ") || "";
        //     const tagMatch = token.info
        //       .trim()
        //       .match(/^@\s*([a-zA-Z0-9]+)\s*(.*)$/);
        //     const tag = tagMatch ? tagMatch[1] : "div";

        //     console.log({ token, idx, tag, attrsStr });

        //     return token.nesting === 1 ? `<${tag} ${attrsStr}>` : `</${tag}>`;
        //   },
        // })
        // Use it like this:
        // ::: section
        // :::
        .use(markdownItContainer, "section", mRCTOptions("section"))
        .use(markdownItContainer, "aside", mRCTOptions("aside"))
        .use(markdownItContainer, "article", mRCTOptions("article"))
        .use(markdownItContainer, "footer", mRCTOptions("footer"))
        .use(markdownItContainer, "header", mRCTOptions("header"))
        .use(markdownItContainer, "nav", mRCTOptions("nav"))
        .use(markdownItContainer, "main", mRCTOptions("main"))
        .use(markdownItContainer, "ul", mRCTOptions("ul"))
        .use(markdownItContainer, "ol", mRCTOptions("ol"))
        .use(markdownItContainer, "div", mRCTOptions("div"))
        .use(markdownItContainer, "p", mRCTOptions("p"))
        .use(markdownItContainer, "hgroup", mRCTOptions("hgroup"))
        .use(markdownItContainer, "h1", mRCTOptions("h1"))
        .use(markdownItContainer, "h2", mRCTOptions("h2"))
        .use(markdownItContainer, "h3", mRCTOptions("h3"))
        .use(markdownItContainer, "h4", mRCTOptions("h4"))
        .use(markdownItContainer, "h5", mRCTOptions("h5"))
        .use(markdownItContainer, "h6", mRCTOptions("h6"))
        .use(markdownItContainer, "box")
        .use(markdownItContainer, "flow")
        .use(markdownItContainer, "grid-fluid")
        .use(markdownItContainer, "cluster")
        .use(markdownItContainer, "switcher")
        .use(markdownItContainer, "cover")
        .use(markdownItContainer, "fixed-fluid")
        .use(markdownItContainer, "prose")

        // .use(markdownItContainer, {
        //   name: "@",
        //   // render: function (tokens, idx) {
        //   //   const token = tokens[idx];
        //   //   const attrsStr =
        //   //     token.attrs
        //   //       ?.map(([name, value]) => `${name}="${value}"`)
        //   //       ?.join(" ") || "";
        //   //   const tagMatch = token.info
        //   //     .trim()
        //   //     .match(/^@\s*([a-zA-Z0-9]+)\s*(.*)$/);
        //   //   const tag = tagMatch ? tagMatch[1] : "div";

        //   //   return token.nesting === 1 ? `<${tag} ${attrsStr}>` : `</${tag}>`;
        //   // },
        //   openRender: (tokens, idx, _options) => {
        //     const token = tokens[idx];
        //     const attrsStr =
        //       token.attrs
        //         ?.map(([name, value]) => `${name}="${value}"`)
        //         ?.join(" ") || "";
        //     const tagMatch = token.info
        //       .trim()
        //       .match(/^@\s*([a-zA-Z0-9]+)\s*(.*)$/);
        //     const tag = tagMatch ? tagMatch[1] : "div";

        //     console.log({ token, tag, attrsStr, _options });

        //     return `<${tag} ${attrsStr}>`;
        //   },
        //   closeRender: (tokens, idx, _options) => {
        //     const tagMatch = tokens[idx].info
        //       .trim()
        //       .match(/^@\s*([a-zA-Z0-9]+)\s*(.*)$/);
        //     const tag = tagMatch ? tagMatch[1] : "div";

        //     console.log({ token: tokens[idx], tag, _options });

        //     return `</${tag}>`;
        //   },
        // })
        // .use(markdownItContainer, { name: "block" })
        // .use(markdownItContainer, { name: "flow" })
        // .use(markdownItContainer, { name: "grid-fluid" })
        // .use(markdownItContainer, { name: "cluster" })
        // .use(markdownItContainer, { name: "switcher" })

        .use(markdownItMark) // https://github.com/markdown-it/markdown-it-mark
        .use(markdownItLinkAttributes) // https://github.com/crookedneighbor/markdown-it-link-attributes
        .use(markdownItAttrs) // https://github.com/arve0/markdown-it-attrs
        .use(markdownItBracketedSpans), // https://github.com/mb21/markdown-it-bracketed-spans
  );

  // --------------------- Bundles
  eleventyConfig.addBundle("html");

  // --------------------- Global Data
  eleventyConfig.addGlobalData("env", { ...env });
  eleventyConfig.addGlobalData("fontServices", async () => {
    const fontsource = await Fetch("https://api.fontsource.org/v1/fonts", {
      duration: "10d",
      type: "json",
    });
    return {
      fontsource: { fonts: fontsource },
    };
  });
  eleventyConfig.addGlobalData("iconLists", iconLists);
  eleventyConfig.addGlobalData("baseUrl", BASE_URL);
  eleventyConfig.addGlobalData("prodUrl", PROD_URL);
  eleventyConfig.addGlobalData("layout", "base");
  eleventyConfig.addGlobalData("year", new Date().getFullYear());
  // eleventyConfig.addGlobalData("globalSettings", globalSettings);
  eleventyConfig.addGlobalData("languages", languages);
  eleventyConfig.addGlobalData("defaultLanguage", defaultLanguage);
  eleventyConfig.addGlobalData("defaultLangCode", defaultLangCode);
  eleventyConfig.addGlobalData("brandConfig", brandConfig);
  eleventyConfig.addGlobalData("inlineAllStyles", inlineAllStyles);
  eleventyConfig.addGlobalData("brandStyles", brandStyles);
  eleventyConfig.addGlobalData("fontPreloadTags", fontPreloadTags);
  // Computed Data
  eleventyConfig.addGlobalData("eleventyComputed", eleventyComputed);

  // --------------------- Collections
  eleventyConfig.addCollection("sitemap", function (collectionApi) {
    return collectionApi.getAll().map((item, index, all) => {
      const links =
        languages.length < 2
          ? undefined
          : all
              .filter((template) => {
                return (
                  (template.data.translationKey &&
                    template.data.translationKey ===
                      item.data.translationKey) ||
                  (template.data.localizationKey &&
                    template.data.localizationKey === item.data.localizationKey)
                );
              })
              .map((i) => {
                return {
                  url: i.page.url,
                  lang: i.data.lang,
                };
              });

      return {
        url: item.url,
        date: item.date,
        data: {
          ...item.data,
          sitemap: {
            ...item.data.sitemap,
            links,
          },
        },
      };
    });
  });

  // --------------------- Plugins Early
  eleventyConfig.addPlugin(directoryOutputPlugin);
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(IdAttributePlugin, {
    selector: "h1,h2,h3,h4,h5,h6,.id", // default: "h1,h2,h3,h4,h5,h6"
  });
  eleventyConfig.addPlugin(I18nPlugin, {
    defaultLanguage: defaultLangCode, // Required
    // Rename the default universal filter names
    filters: {
      // transform a URL with the current page’s locale code
      url: "locale_url_original",

      // find the other localized content for a specific input file
      links: "locale_links_original",
    },
  });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, imageTransformOptions);
  eleventyConfig.addPlugin(yamlData);
  eleventyConfig.addPlugin(cmsConfigPlugin);
  eleventyConfig.addPlugin(autoCollections);
  // TODO: reinstate this if 11ty Transform proves to be stable
  eleventyConfig.addPlugin(pluginWebc, {
    components: [
      "npm:@11ty/eleventy-img/*.webc",
      "src/components/**/*.webc",
      `${WORKING_DIR}/_components/**/*.webc`,
    ],
    useTransform: true,
    bundlePluginOptions: {
      transforms: [
        async function (content) {
          let { type, page } = this;

          if (type === "css") {
            let { code, map } = lightningTransform({
              // filename: 'style.css',
              code: Buffer.from(content),
              minify: MINIFY,
              // sourceMap: true
            });

            return code;
          }
          return content;
        },
      ],
    },
  });
  console.log({ BUILD_LEVEL, BASE_URL });
  /** @type {import("eleventy-plugin-robotstxt/typedefs.js").EleventyPluginRobotsTxtOptions} */
  const eleventyPluginRobotsTxtOptions =
    BUILD_LEVEL === "production"
      ? {
          frontMatterOverrides: { layout: null },
          sitemapURL: `${BASE_URL}/sitemap.xml`,
          // Rely on on-page 'noindex' tags so we make sure crawling is allowed
          rules: new Map([
            ["*", [{ allow: "/" }, { disallow: "/admin/config.json" }]],
          ]),
        }
      : {
          frontMatterOverrides: { layout: null },
          sitemapURL: `${BASE_URL}/sitemap.xml`,
          // shouldBlockAIRobots: true,
          rules: new Map([["*", [{ disallow: "/" }]]]),
        };
  eleventyConfig.addPlugin(pluginRobotsTxt, eleventyPluginRobotsTxtOptions);
  // NOTE: We only want 'published' pages in the sitemap
  eleventyConfig.addPlugin(pluginSitemap, {
    sitemap: {
      hostname: BASE_URL,
    },
  });
  eleventyConfig.addPlugin(pluginIcons, {
    sources: iconSources,
    icon: {
      class: (name, source) => `icon icon-${source} icon-${name}`,
    },
  });

  eleventyConfig.addPlugin(pluginCodeblocks([pluginCodeBlocksCharts]));

  // await eleventyConfig.addPlugin(ctxCss);
  await eleventyConfig.addPlugin(buildExternalCSS);
  await eleventyConfig.addPlugin(pluginUnoCSS);
  // TODO: import those classes from a data file
  eleventyConfig.addPlugin(htmlClassesTransform, {
    classes: {
      // <selector>: "<class>",
      // html: "imported-html-class",
      // body: "imported-body-class",
    },
  });

  // --------------------- Populate files and default content
  eleventyConfig.addPassthroughCopy({
    // Copy User's editorComponents.js to be used in the CMS
    [`${WORKING_DIR}/_config/editorComponents.js`]:
      "admin/userEditorComponents.js",
    // Populate Default Content: Copy `src/content-static/` to `dist`
    "src/content-static": "/",
    // Copy User's files: `src/content-static/` to `dist`
    [`${WORKING_DIR}/_files`]: "/assets/files/",
    [`${WORKING_DIR}/_files/_redirects`]: "_redirects",
    [`${WORKING_DIR}/_files/_headers`]: "_headers",
    // All CSS files to assets
    [`${WORKING_DIR}/*.css`]: "/assets/styles/",
  });
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

  eleventyConfig.addTemplate(
    "env.11ty.js",
    async function (data) {
      const userCmsConfigImport = await userCmsConfig();
      const allSelectedCollections = getSelectedCollections();
      const allCollections = [
        ...allSelectedCollections,
        ...(userCmsConfigImport?.collections || []),
      ];
      const allCollectionNames = allCollections?.collections?.map(
        ({ name }) => name,
      );

      const envVars = { CONTENT_DIR };

      return `
export const env = ${JSON.stringify(envVars)};
export const allCollections = ${JSON.stringify(allCollections)};
export const allCollectionNames = ${JSON.stringify(allCollectionNames)};
export const iconLists = ${JSON.stringify(iconLists)};
`;
    },
    {
      permalink: "/admin/env.js",
      eleventyExcludeFromCollections: true,
      layout: null,
    },
  );

  // Populate Default Content with virtual templates
  await eleventyConfig.addPlugin(populateInputDir, {
    // logLevel: 'debug',
    sources: [
      // TODO: Make this selectable from the CMS
      `src/themes/${POKO_THEME}`,
      "src/content",
    ],
  });
  // Partials expand on the renderFile shortcode
  await eleventyConfig.addPlugin(partialsPlugin, {
    defaultExt: ["11ty.js", "njk", "md"],
    dirs: [
      path.join(WORKING_DIR, PARTIALS_DIR),
      path.join(`src/themes/${POKO_THEME}/_partials`),
      path.join("src/content/_partials"),
    ],
    shortcodeAliases: [
      "partial",
      "htmlPartial",
      "component",
      // "section"
    ],
    pairedShortcodeAliases: [
      "partialWrapper",
      "htmlPartialWrapper",
      "componentWrapper",
    ],
  });
  await eleventyConfig.addPlugin(partialShortcodesPlugin);

  // Copy files (Keystatic)
  // Retrieve public files from the _files directory
  // eleventyConfig.addPlugin(keystaticPassthroughFiles)

  // --------------------- Layouts
  eleventyConfig.addLayoutAlias("base", "base.html");

  // --------------------- Filters
  // Slug
  eleventyConfig.addFilter("slugifyPath", (input) =>
    slugifyPath(input, eleventyConfig),
  );
  // Files
  eleventyConfig.addAsyncFilter("glob", globFilter);
  // I18n
  eleventyConfig.addFilter("locale_url", locale_url);
  eleventyConfig.addFilter("link", locale_url); // Alias for locale_url
  eleventyConfig.addFilter("locale_links", locale_links);
  // Date
  eleventyConfig.addFilter("toIsoString", toISOString);
  eleventyConfig.addFilter("formatDate", formatDate);
  eleventyConfig.addFilter("dateToSlug", dateToSlug);
  eleventyConfig.addFilter("toLocaleString", toLocaleString);
  // Array
  eleventyConfig.addFilter("filterCollection", filterCollection);
  eleventyConfig.addFilter("join", join);
  eleventyConfig.addFilter("first", first);
  eleventyConfig.addFilter("last", last);
  eleventyConfig.addFilter("randomFilter", randomFilter);
  eleventyConfig.addFilter("sortCollection", sortCollection);
  eleventyConfig.addFilter("asc", asc);
  eleventyConfig.addFilter("desc", desc);
  // Images
  eleventyConfig.addAsyncFilter("ogImage", ogImageSrc);
  eleventyConfig.addAsyncFilter("image", imageFilter);
  // Email
  eleventyConfig.addFilter("emailLink", emailLink);
  eleventyConfig.addFilter("email", email);
  // HTML helpers
  eleventyConfig.addFilter("htmlAttrs", htmlAttrs);
  eleventyConfig.addFilter("htmlImgAttrs", htmlImgAttrs);

  // --------------------- Shortcodes
  // eleventyConfig.addAsyncShortcode("partial", partialShortcode);
  // eleventyConfig.addShortcode("section", function (...rest) {
  //   console.log(rest);
  //   return "SECTIONS";
  // });
  // await eleventyConfig.addAsyncShortcode("links", links);
  eleventyConfig.addShortcode("n", newLine);
  await eleventyConfig.addNunjucksAsyncShortcode(
    "fetchFile",
    fetchFileShortcode,
  );
  eleventyConfig.addShortcode("link", linkShortcode);
  eleventyConfig.addShortcode("button", buttonShortcode);
  eleventyConfig.addShortcode("image", image);
  eleventyConfig.addShortcode("gallery", gallery);
  eleventyConfig.addPairedShortcode("wrapper", wrapper);
  // eleventyConfig.addPairedShortcode("calloutShortcode", calloutShortcode);
  // eleventyConfig.addShortcode("ogImageSelected", ogImageSelected);
  // eleventyConfig.addShortcode(
  //   "emailLink",
  //   function emailLink(email, subject, body, cc, bcc) {
  //     // Use it like so: {{ "hello@mookai.be" | emailLink("Subject", "Body", "CC", "BCC") }}
  //     const { element } = obfuscateEmail(email, subject, body, cc, bcc);
  //     // return element;
  //     //   return this.env.filters.safe(element);
  //     console.log(this);
  //     return element;
  //   }
  // );

  // --------------------- Bundles (late to override WebC Plugin)
  // eleventyConfig.addPlugin(function (eleventyConfig) {
  //   eleventyConfig.addBundle("css", {
  //     // File extension used for bundle file output, defaults to bundle name
  //     outputFileExtension: "css",
  //     // Name of shortcode for use in templates, defaults to bundle name
  //     shortcodeName: "css",
  //     // shortcodeName: false, // disable this feature.
  //     // Any <style> tags in the HTML should be included in this bundle -> https://www.11ty.dev/docs/plugins/bundle/#bundling-html-node-content
  //     bundleHtmlContentFromSelector: "style",
  //   });
  // });

  // Deferred Config
  await eleventyConfig.addPlugin(customRenderersPlugin);
  await eleventyConfig.addPlugin(partialShortcodesPlugin);

  await eleventyConfig.addPlugin(async function (eleventyConf) {
    eleventyConf.versionCheck(">=3.0.0-alpha.1");
    // const { dir } = eleventyConf;

    // const safeFilter = this.env.filters.safe;
    const partialShortcodeFn = eleventyConfig.nunjucks.asyncShortcodes.partial;

    await eleventyConf.addShortcode("section", async function (...args) {
      // Old Section implementation mirroring Partial
      if (args.length > 1) {
        const partialFileName = args[0];
        const data = args[1] || {};
        console.warn(
          `DEPRECATED: Section (calling "${partialFileName}") is using the old syntax.`,
        );

        return await partialShortcodeFn
          .call(this, partialFileName, data)
          .catch((e) => {
            console.error(e);
            return "";
          });
      }
      if (args.length !== 1 || typeof args[0] !== "object") {
        console.error(
          `Section shortcode called with invalid arguments: ${args}`,
        );
        return "";
      }

      // {% section type="grid", vars={}, blocks=[], advanced={ sectionSlug="", vars={}} %}
      const { type, vars, blocks, advanced } = args?.[0] || {};
      const { sectionSlug, vars: advancedVars } = advanced || {};
      let partialFileName =
        (sectionSlug ? sectionSlug : `_sections/${type || "catch-error"}`) +
        ".njk";

      return await partialShortcodeFn
        .call(this, partialFileName, { blocks, ...vars, ...advancedVars })
        .catch((e) => {
          console.error(e);
          return "<< SECTION ERROR >>";
        });
    });
  });
}
