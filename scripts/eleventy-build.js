import Eleventy from "@11ty/eleventy";
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
  OUTPUT_DIR_ABSOLUTE,
  FILES_OUTPUT_DIR,
  BASE_URL,
  PROD_URL,
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
} from "../env.config.js";

const src = WORKING_DIR_ABSOLUTE
const dist = OUTPUT_DIR_ABSOLUTE;
const configPath = "eleventy.config.js";

console.log({ src, dist });

let elev = new Eleventy(src, dist, {
  // --quiet
	// quietMode: true,

	// --config
	configPath,

	runMode: "serve", // Does not work...

	// config: function (eleventyConfig) {
	// 	// Do some custom Configuration API stuff
	// 	// Works great with eleventyConfig.addGlobalData
	// 	console.log(eleventyConfig)
	// 	// console.log(eleventyConfig.getConcurrency())
	// 	eleventyConfig.setFreezeReservedData(false);
	// 	// eleventyConfig.setRunMode(ELEVENTY_RUN_MODE)
	// 	// eleventyConfig.setRunMode("serve")
	// },
});

await elev.write();
