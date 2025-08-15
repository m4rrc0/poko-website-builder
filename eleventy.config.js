import path from "node:path";
// import { fileURLToPath } from "node:url";
// import Nunjucks from "nunjucks";
import { transform as lightningTransform } from "lightningcss";

// -------- Plugins
import directoryOutputPlugin from "@11ty/eleventy-plugin-directory-output";
import { RenderPlugin, IdAttributePlugin, I18nPlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginWebc from "@11ty/eleventy-plugin-webc";
import pluginIcons from "eleventy-plugin-icons";
// import pluginMarkdoc from "@m4rrc0/eleventy-plugin-markdoc";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { imageTransformOptions } from "./src/config-11ty/plugins/imageTransform.js";
import yamlData from "./src/config-11ty/plugins/yamlData/index.js";
import cmsConfig from "./src/config-11ty/plugins/cms-config/index.js";
import autoCollections from "./src/config-11ty/plugins/auto-collections/index.js";
import htmlClassesTransform from "./src/config-11ty/plugins/html-classes-transform/index.js";
import populateInputDir from "./src/config-11ty/plugins/populateInputDir/index.js";
import partialsPlugin from "./src/config-11ty/plugins/partials/index.js";
import buildExternalCSS from "./src/config-11ty/plugins/buildExternalCSS/index.js";
// import keystaticPassthroughFiles from './src/config-11ty/plugins/keystaticPassthroughFiles/index.js';
// -------- Plugins Markdown
import markdownItAttrs from "markdown-it-attrs";
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
  languages,
} from "./env.config.js";
import eleventyComputed from "./src/data/eleventyComputed.js";

// Eleventy Config
import {
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
  ogImageSrc,
  emailLink,
} from "./src/config-11ty/filters/index.js";
import {
  newLine,
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

const defaultLanguage = languages.find((lang) => lang.isWebsiteDefault);
const defaultLangCode = defaultLanguage?.code || "en";

const statusesToUnrender =
  BUILD_LEVEL === "production" ? ["inactive", "draft"] : ["inactive"];
const unrenderedLanguages = languages
  .filter((lang) => statusesToUnrender.includes(lang.status))
  .map((lang) => lang.code);

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
};

export default async function (eleventyConfig) {
  // --------------------- Base Config
  eleventyConfig.setQuietMode(true);
  eleventyConfig.addWatchTarget("./src/config-11ty/**/*", {
    resetConfig: true,
  });
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

  // --------------------- Preprocessors
  eleventyConfig.addPreprocessor("Publication Status", "*", (data, content) => {
    if (shouldNotRender(data)) {
      return false;
    }
  });

  // --------------------- Plugins Markdown
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(markdownItAttrs));

  // --------------------- Bundles
  eleventyConfig.addBundle("html");

  // --------------------- Plugins Early
  eleventyConfig.addPlugin(directoryOutputPlugin);
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
  eleventyConfig.addPlugin(cmsConfig);
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
  eleventyConfig.addPlugin(pluginIcons, {
    sources: [
      {
        name: "simple",
        path: "node_modules/simple-icons/icons",
        default: true,
      },
      {
        name: "tabler",
        path: "node_modules/@tabler/icons/icons",
      },
    ],
  });
  await eleventyConfig.addPlugin(buildExternalCSS);
  // TODO: import those classes from a data file
  eleventyConfig.addPlugin(htmlClassesTransform, {
    classes: {
      // <selector>: "<class>",
      // html: "imported-html-class",
      // body: "imported-body-class",
    },
  });
  // TODO: Try integrating CSS into every html file
  // TODO: Choose method
  // - 11ty Bundler
  // - UnoCSS with [bun-plugin-unocss](https://github.com/stacksjs/bun-plugin-unocss)
  // eleventyConfig.addPlugin(embedPageCss);

  // --------------------- Populate files and default content
  // Populate Default Content: Copy `src/content-static/` to `dist`
  eleventyConfig.addPassthroughCopy({ "src/content-static": "/" });
  // Copy User's files: `src/content-static/` to `dist`
  eleventyConfig.addPassthroughCopy({
    [`${WORKING_DIR}/_files`]: "/assets/files/",
  });
  eleventyConfig.addPassthroughCopy({
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
  } else if (CMS_IMPORT !== "cdn") {
    eleventyConfig.addPassthroughCopy({
      [CMS_IMPORT + "sveltia-cms.js"]: "assets/js/sveltia-cms.js",
      [CMS_IMPORT + "sveltia-cms.mjs"]: "assets/js/sveltia-cms.mjs",
    });
  }
  // Populate Default Content with virtual templates
  await eleventyConfig.addPlugin(populateInputDir, {
    // logLevel: 'debug',
    sources: [
      // TODO: Make this selectable from the CMS
      "src/themes/default",
      "src/content",
    ],
  });
  // Populate Default Content with virtual templates
  await eleventyConfig.addPlugin(partialsPlugin, {
    dirs: [
      path.join(WORKING_DIR, PARTIALS_DIR),
      path.join("src/content/_partials"),
    ],
  });
  // Copy files (Keystatic)
  // Retrieve public files from the _files directory
  // eleventyConfig.addPlugin(keystaticPassthroughFiles)

  // --------------------- Layouts
  eleventyConfig.addLayoutAlias("base", "base.html");

  // --------------------- Global Data
  eleventyConfig.addGlobalData("env", { ...env });
  eleventyConfig.addGlobalData("baseUrl", BASE_URL);
  eleventyConfig.addGlobalData("prodUrl", PROD_URL);
  eleventyConfig.addGlobalData("layout", "base");
  // eleventyConfig.addGlobalData("globalSettings", globalSettings);
  eleventyConfig.addGlobalData("languages", languages);
  eleventyConfig.addGlobalData("defaultLanguage", defaultLanguage);
  eleventyConfig.addGlobalData("defaultLangCode", defaultLangCode);
  // Computed Data
  eleventyConfig.addGlobalData("eleventyComputed", eleventyComputed);

  // --------------------- Filters
  // Slug
  eleventyConfig.addFilter("slugifyPath", (input) =>
    slugifyPath(input, eleventyConfig)
  );
  // I18n
  eleventyConfig.addFilter("locale_url", locale_url);
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
  // Images
  eleventyConfig.addAsyncFilter("ogImage", ogImageSrc);
  // Email
  eleventyConfig.addFilter("emailLink", emailLink);

  // --------------------- Shortcodes
  // eleventyConfig.addAsyncShortcode("partial", partialShortcode);
  eleventyConfig.addShortcode("n", newLine);
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
}
