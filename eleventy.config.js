import path from "node:path";
import { fileURLToPath } from "node:url";
// -------- Plugins
import directoryOutputPlugin from "@11ty/eleventy-plugin-directory-output";
import { RenderPlugin, IdAttributePlugin, I18nPlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginWebc from "@11ty/eleventy-plugin-webc";
// import pluginMarkdoc from "@m4rrc0/eleventy-plugin-markdoc";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { imageTransformOptions } from "./src/config-11ty/plugins/imageTransform.js";
import populateInputDir from "./src/config-11ty/plugins/populateInputDir/index.js";
import yamlData from "./src/config-11ty/plugins/yamlData/index.js";
import cmsConfig from "./src/config-11ty/plugins/cms-config/index.js";
import autoCollections from "./src/config-11ty/plugins/auto-collections/index.js";
// import keystaticPassthroughFiles from './src/config-11ty/plugins/keystaticPassthroughFiles/index.js';
// -------- Plugins Markdown
import markdownItAttrs from "markdown-it-attrs";
// -------- Env Variables
import {
  WORKING_DIR,
  WORKING_DIR_ABSOLUTE,
  CONTENT_DIR,
  PARTIALS_DIR,
  LAYOUTS_DIR,
  OUTPUT_DIR,
  FILES_OUTPUT_DIR,
  GLOBAL_PARTIALS_PREFIX,
  BASE_URL,
  PROD_URL,
} from "./env.config.js";
// import * as markdocTags from "./src/config-markdoc/tags/index.js";
// import * as markdocNodes from "./src/config-markdoc/nodes/index.js";
import eleventyComputed from "./src/data/eleventyComputed.js";
// import Markdoc from "@markdoc/markdoc";

// Eleventy Config
import {
  toISOString,
  formatDate,
  dateToSlug,
  toLocaleString,
  slugifyPath,
  filterCollection,
  join,
  first,
  last,
  randomFilter,
  ogImageSrc,
  emailLink,
} from "./src/config-11ty/filters/index.js";
// import { ogImageSelected } from "./src/config-11ty/shortcodes/index.js";
import obfuscateEmail from "./src/utils/emailObfuscate.js";

// TODOS:
// - Look at persisting images in cache between builds: https://github.com/11ty/eleventy-img/issues/285

/**
 * @typedef { import("@11ty/eleventy").UserConfig } UserConfig
 */
export const config = {
  dir: {
    // input: "src/templates",
    input: WORKING_DIR, // this is probably '_content'
    // input: WORKING_DIR_ABSOLUTE,
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
  eleventyConfig.addWatchTarget("./src/config-markdoc/**/*", {
    resetConfig: true,
  }); // NOTE: watching works but changes does not properly rerender...
  // eleventyConfig.setUseGitIgnore(false);

  // --------------------- Plugins Markdown
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(markdownItAttrs));

  // --------------------- Plugins Early
  eleventyConfig.addPlugin(directoryOutputPlugin);
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(IdAttributePlugin, {
    selector: "h1,h2,h3,h4,h5,h6,.id-attr", // default: "h1,h2,h3,h4,h5,h6"
  });
  eleventyConfig.addPlugin(I18nPlugin, {
    defaultLanguage: "en", // Required // TODO: from globalSettings
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
  });
  // --------------------- Populate files and default content
  // Populate Default Content: Copy `src/content-static/` to `dist`
  eleventyConfig.addPassthroughCopy({ "src/content-static": "/" });
  // Copy User's files: `src/content-static/` to `dist`
  eleventyConfig.addPassthroughCopy({ [`${WORKING_DIR}/_files`]: "/" });
  eleventyConfig.addPassthroughCopy({ [`${WORKING_DIR}/*.css`]: "/" });
  // Populate Default Content with virtual templates
  await eleventyConfig.addPlugin(populateInputDir, {
    // logLevel: 'debug',
    sources: ["src/content"],
  });
  // Copy files (Keystatic)
  // Retrieve public files from the _files directory
  // eleventyConfig.addPlugin(keystaticPassthroughFiles)

  // --------------------- Layouts
  eleventyConfig.addLayoutAlias("base", "base.html");

  // --------------------- Global Data
  eleventyConfig.addGlobalData("baseUrl", BASE_URL);
  eleventyConfig.addGlobalData("prodUrl", PROD_URL);
  eleventyConfig.addGlobalData("layout", "base");
  // eleventyConfig.addGlobalData("globalSettings", globalSettings);
  // Computed Data
  eleventyConfig.addGlobalData("eleventyComputed", eleventyComputed);

  // --------------------- Filters
  // Slug
  eleventyConfig.addFilter("slugifyPath", (input) =>
    slugifyPath(input, eleventyConfig)
  );
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
  eleventyConfig.addFilter("og", ogImageSrc);
  // Email
  eleventyConfig.addFilter("emailLink", emailLink);

  // --------------------- Shortcodes
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

  // --------------------- Plugins Late
  // const userMarkdocTags = await import(
  //   `./${WORKING_DIR}/_config/tags/index.js`
  // );
  // const userMarkdocNodes = await import(
  //   `./${WORKING_DIR}/_config/nodes/index.js`
  // );

  // await eleventyConfig.addPlugin(pluginMarkdoc, {
  //   deferTags: ["ReferencesManual", "For"],
  //   usePartials: [
  //     {
  //       cwd: "src/config-markdoc/partials",
  //       patterns: ["**/*.mdoc"],
  //       ...(GLOBAL_PARTIALS_PREFIX && { pathPrefix: GLOBAL_PARTIALS_PREFIX }),
  //       // pathPrefix: "global", // Files will appear as "global/filename.mdoc"
  //       // debug: true,
  //     },
  //     {
  //       cwd: path.join(config.dir.input, config.dir.includes),
  //       patterns: ["**/*.{mdoc,md,html,webc}"],
  //       // pathPrefix: "partials", // Files will appear as "partials/filename.mdoc"
  //       // debug: true,
  //     },
  //   ],
  //   transform: {
  //     tags: { ...markdocTags, ...userMarkdocTags },
  //     // TODO: Try providing a custom img node for eleventy-img to avoid needing the transform?
  //     nodes: { ...markdocNodes, ...userMarkdocNodes },
  //   },
  //   // debug: true,
  // });
}
