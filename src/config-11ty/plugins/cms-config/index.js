import fglob from "fast-glob";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import yaml from "js-yaml";
import deepmerge from "deepmerge";
import {
  MINIFY,
  PARTIALS_DIR,
  POKO_THEME,
  WORKING_DIR,
  COLLECTIONS,
  USER_DIR,
  PROD_URL,
  DISPLAY_URL,
  BASE_URL,
  OUTPUT_DIR,
  WEBSITE_PATH_PREFIX,
  statusesToUnrender,
  DEBUG,
  LAYOUTS_DIR,
} from "../../../../env.config.js";
import { CmsConfig } from "./config.js";
import { CmsPage } from "./page.js";
import {
  pagesCollection,
  getActiveCollections,
  getActiveEditorComponents,
} from "./config.js";
import { enginePath, dependencyEnginePath } from "../../../utils/paths.js";
import { buildJs } from "../../../utils/runtime.js";
import { writeImageManifest } from "../../image-manifest.js";
import { ensureIconsModule, writeIconsModule } from "../../icon-manifest.js";
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
    [enginePath(
      "src/config-11ty/plugins/cms-config/preview/preview-runtime.js",
    )]: "admin/preview-runtime.js",
    [enginePath(
      "src/config-11ty/plugins/cms-config/preview/previewTemplates.js",
    )]: "admin/previewTemplates.js",
    [enginePath("src/config-11ty/plugins/cms-config/utils/admin-url.js")]:
      "admin/admin-url.js",
  });

  // Bundle project/theme/engine .njk/.md partial sources for the CMS preview's
  // browser Nunjucks env. Mirrors partials/index.js resolution priority:
  // project lang dirs > project shared > theme > engine (first-write-wins).
  const njkSources = {};
  const njkSourceDirs = [
    {
      pattern: `${WORKING_DIR}/*/${PARTIALS_DIR}/**/*.{njk,md}`,
      langDirs: true,
    },
    { pattern: `${WORKING_DIR}/${PARTIALS_DIR}/**/*.{njk,md}` },
    {
      pattern: enginePath(
        `src/themes/${POKO_THEME}/${PARTIALS_DIR}/**/*.{njk,md}`,
      ),
    },
    { pattern: enginePath(`src/content/${PARTIALS_DIR}/**/*.{njk,md}`) },
  ];
  for (const { pattern, langDirs } of njkSourceDirs) {
    for (const file of await fglob(pattern)) {
      const [dir, rel] = file.split(`/${PARTIALS_DIR}/`);
      const key = langDirs ? `${dir.split("/").pop()}/${rel}` : rel;
      if (!(key in njkSources)) njkSources[key] = await readFile(file, "utf-8");
    }
  }
  // Write-if-different: the file lives under a `resetConfig` watch target, so
  // an unconditional write would loop plugin re-run → write → reset forever.
  // JSON.stringify does not escape U+2028/9, which break JS string literals —
  // a partial containing either would kill the whole preview bundle.
  const generatedDir = `${import.meta.dirname}/preview/generated`;
  const njkSourcesPath = `${generatedDir}/preview-njk-sources.generated.js`;
  const njkSourcesCode = `export default ${JSON.stringify(njkSources)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")};\n`;
  const existingNjkSources = await readFile(njkSourcesPath, "utf-8").catch(
    () => null,
  );
  if (existingNjkSources !== njkSourcesCode) {
    await writeFile(njkSourcesPath, njkSourcesCode);
  }

  // Same priority order for `.11ty.js` partials: they ship as real bundled
  // code — a generated import map, never a hand-maintained list.
  const jsPartialFiles = {};
  const jsPartialDirs = [
    {
      pattern: `${WORKING_DIR}/*/${PARTIALS_DIR}/**/*.11ty.js`,
      langDirs: true,
    },
    { pattern: `${WORKING_DIR}/${PARTIALS_DIR}/**/*.11ty.js` },
    {
      pattern: enginePath(
        `src/themes/${POKO_THEME}/${PARTIALS_DIR}/**/*.11ty.js`,
      ),
    },
    { pattern: enginePath(`src/content/${PARTIALS_DIR}/**/*.11ty.js`) },
  ];
  for (const { pattern, langDirs } of jsPartialDirs) {
    for (const file of await fglob(pattern)) {
      const [dir, rel] = file.split(`/${PARTIALS_DIR}/`);
      const key = (langDirs ? `${dir.split("/").pop()}/${rel}` : rel).replace(
        /\.11ty\.js$/,
        "",
      );
      if (!(key in jsPartialFiles)) jsPartialFiles[key] = file;
    }
  }
  const jsPartialsCode =
    Object.entries(jsPartialFiles)
      .map(
        ([key, file], i) =>
          `import p${i} from ${JSON.stringify(
            path.relative(generatedDir, path.resolve(file)),
          )};`,
      )
      .join("\n") +
    `\nexport default {\n${Object.entries(jsPartialFiles)
      .map(([key], i) => `  ${JSON.stringify(key)}: p${i},`)
      .join("\n")}\n};\n`;
  const jsPartialsPath = `${generatedDir}/preview-partials.generated.js`;
  const existingJsPartials = await readFile(jsPartialsPath, "utf-8").catch(
    () => null,
  );
  if (existingJsPartials !== jsPartialsCode) {
    await writeFile(jsPartialsPath, jsPartialsCode);
  }

  // `_data` cascade for the preview: yaml/json parsed at build time, keyed by
  // path segments below `_data/` — matching the shape Eleventy exposes
  // (`data.en.nav.foo` for `_data/en/nav/foo.yaml`). Engine data first so the
  // project can override. CMS-store values are merged over this at runtime.
  let previewData = {};
  for (const dir of [enginePath("src/content/_data"), `${WORKING_DIR}/_data`]) {
    for (const file of await fglob(`${dir}/**/*.{yml,yaml,json}`)) {
      const segs = file
        .split(`/_data/`)[1]
        .replace(/\.(ya?ml|json)$/, "")
        .split("/");
      let node = {};
      let cur = node;
      for (let i = 0; i < segs.length - 1; i++) cur = cur[segs[i]] = {};
      cur[segs[segs.length - 1]] = yaml.load(await readFile(file, "utf-8"));
      previewData = deepmerge(previewData, node);
    }
  }
  const previewDataPath = `${generatedDir}/preview-data.generated.js`;
  const previewDataCode = `export default ${JSON.stringify(previewData)
    .replace(/\\u2028/g, "\\\\u2028")
    .replace(/\\u2029/g, "\\\\u2029")};\n`;
  const existingPreviewData = await readFile(previewDataPath, "utf-8").catch(
    () => null,
  );
  if (existingPreviewData !== previewDataCode) {
    await writeFile(previewDataPath, previewDataCode);
  }

  // Project `_config/htmlClasses.js` (optional) — drives the build's
  // htmlClassesTransform; the preview applies it to the preview root element.
  const htmlClassesFile = path.resolve(`${WORKING_DIR}/_config/htmlClasses.js`);
  const userConfigCode = (await fglob(htmlClassesFile)).length
    ? `export { default as htmlClasses } from ${JSON.stringify(
        `./${path.relative(generatedDir, htmlClassesFile)}`,
      )};\n`
    : `export const htmlClasses = {};\n`;
  const userConfigPath = `${generatedDir}/preview-userconfig.generated.js`;
  const existingUserConfig = await readFile(userConfigPath, "utf-8").catch(
    () => null,
  );
  if (existingUserConfig !== userConfigCode) {
    await writeFile(userConfigPath, userConfigCode);
  }

  // Icon map is written at eleventy.after (uses are recorded while pages
  // render); the bundle imports it at setup — ensure it exists so a fresh
  // checkout/first build resolves. Converges via the resetConfig watch loop.
  await ensureIconsModule(`${generatedDir}/preview-icons.generated.js`);

  // Layout templates for the preview — same resolution priority as partials
  // (project > theme > engine), minus lang dirs (layouts aren't localized).
  // Two maps like partials: njk/md/html sources by filename, .11ty.js as
  // bundled imports. Basenames collide on ext (`base.html` vs `base.njk`) —
  // keep the ext in the key; resolution order lives in the renderer.
  const layoutSources = {};
  const jsLayoutFiles = {};
  for (const dir of [
    `${WORKING_DIR}/${LAYOUTS_DIR}`,
    enginePath(`src/themes/${POKO_THEME}/${LAYOUTS_DIR}`),
    enginePath(`src/content/${LAYOUTS_DIR}`),
  ]) {
    for (const file of await fglob(`${dir}/**/*.{njk,md,html,11ty.js}`)) {
      const key = path.basename(file);
      if (key.endsWith(".11ty.js")) {
        if (!(key in jsLayoutFiles)) jsLayoutFiles[key] = file;
      } else if (!(key in layoutSources)) {
        layoutSources[key] = await readFile(file, "utf-8");
      }
    }
  }
  const jsLayoutsCode =
    Object.entries(jsLayoutFiles)
      .map(
        ([key, file], i) =>
          `import l${i} from ${JSON.stringify(
            path.relative(generatedDir, path.resolve(file)),
          )};`,
      )
      .join("\n") +
    `\nexport const jsLayouts = {\n${Object.keys(jsLayoutFiles)
      .map((key, i) => `  ${JSON.stringify(key)}: l${i},`)
      .join("\n")}\n};\n`;
  const layoutsCode =
    `export const layoutSources = ${JSON.stringify(layoutSources)
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029")};\n` + jsLayoutsCode;
  const layoutsPath = `${generatedDir}/preview-layouts.generated.js`;
  const existingLayouts = await readFile(layoutsPath, "utf-8").catch(
    () => null,
  );
  if (existingLayouts !== layoutsCode) {
    await writeFile(layoutsPath, layoutsCode);
  }

  // Shared modules import `env.config.js` (dotenv/fs) — redirect to the
  // browser shim hydrated from the CMS store.
  const browserEnvAlias = {
    name: "browser-env",
    setup(build) {
      build.onResolve({ filter: /(^|\/)env\.config\.js$/ }, () => ({
        path: path.join(import.meta.dirname, "preview/browser-env.js"),
      }));
    },
  };

  const previewRendererEntryPath = `${import.meta.dirname}/preview/preview-renderer.entry.js`;
  const [{ content: previewRendererCode }] = await buildJs({
    entrypoints: [previewRendererEntryPath],
    minify: MINIFY,
    plugins: [browserEnvAlias],
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

      // Collections whose every locale dir file (`<lang>/<coll>/<coll>.yaml`)
      // sets `generatePage: previewOnly` produce no pages — gate them out of
      // custom preview registration so Sveltia's default preview shows.
      const previewOnlyCollections = (
        await Promise.all(
          [pagesCollection, ...activeCollections]
            .filter((c) => c.folder)
            .map(async (c) => {
              const files = await fglob(
                `${WORKING_DIR}/*/${c.name}/${c.name}.yaml`,
              );
              if (!files.length) return null;
              const flags = await Promise.all(
                files.map((f) =>
                  readFile(f, "utf-8").then(
                    (t) => yaml.load(t)?.generatePage === "previewOnly",
                    () => false,
                  ),
                ),
              );
              return flags.every(Boolean) ? c.name : null;
            }),
        )
      ).filter(Boolean);

      // Build-time constants for the browser env shim (`browser-env.js`).
      // CMS-derived values (globalSettings, brandConfig, languages…) are NOT
      // here — they get recomputed live from the Sveltia data store.
      const previewEnvConstants = {
        CONTENT_DIR,
        WORKING_DIR,
        PARTIALS_DIR,
        LAYOUTS_DIR,
        USER_DIR,
        POKO_THEME,
        BASE_URL,
        PROD_URL,
        DISPLAY_URL,
        WEBSITE_PATH_PREFIX,
        COLLECTIONS,
        statusesToUnrender,
        DEBUG,
      };

      return `
  export const env = ${JSON.stringify(envVars)};
  export const previewEnvConstants = ${JSON.stringify(previewEnvConstants)};
  export const pagesCollection = ${JSON.stringify(pagesCollection)};
  export const activeCollections = ${JSON.stringify(activeCollections)};
  export const editorComponents = ${JSON.stringify(editorComponents)};
  export const activeCollectionNames = ${JSON.stringify(activeCollectionNames)};
  export const iconLists = ${JSON.stringify(iconLists)};
  export const globalSettings = ${JSON.stringify(data.globalSettings || {})};
  export const metadata = ${JSON.stringify(
    // metadata on real pages is the eleventyComputed merge of
    // globalSettings.metadata and the page's own frontmatter — the global
    // part is the right baseline for previews.
    data.metadata || data.globalSettings?.metadata || {},
  )};
  export const languages = ${JSON.stringify(data.languages || [])};
  export const baseUrl = ${JSON.stringify(data.baseUrl || "")};
  export const basePath = ${JSON.stringify(BASE_URL ? new URL(BASE_URL).pathname : "/")};
  export const prodUrl = ${JSON.stringify(data.prodUrl || "")};
  export const displayUrl = ${JSON.stringify(DISPLAY_URL)};
  export const pathPrefix = ${JSON.stringify(WEBSITE_PATH_PREFIX)};
  export const statusesToUnrender = ${JSON.stringify(statusesToUnrender)};
  export const defaultLanguage = ${JSON.stringify(data.defaultLanguage || "")};
  export const defaultLangCode = ${JSON.stringify(data.defaultLangCode || "")};
  export const brandConfig = ${JSON.stringify(data.brandConfig || {})};
  export const year = ${JSON.stringify(new Date().getFullYear())};
  // Every filter name registered on the eleventy config (universal filters),
  // shipped so the browser nunjucks env can stub the ones it doesn't implement.
  export const njkFilterNames = ${JSON.stringify(Object.keys(eleventyConfig.universal?.filters || {}).sort())};
  export const previewOnlyCollections = ${JSON.stringify(previewOnlyCollections)};
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
    enginePath(`src/themes/${POKO_THEME}/**/*.{11ty.js,njk,md}`),
    enginePath("src/config-11ty/plugins/partialShortcodes/**/*.js"),
    enginePath("src/config-11ty/plugins/plugin-eleventy-unocss/rules/*.js"),
    `${import.meta.dirname}/{preview/preview-runtime,preview/previewTemplates,section-primitives}.js`,
    `${WORKING_DIR}/**/*.{11ty.js,njk,md}`,
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

  // resetConfig: these sources feed build-time artifacts (the generated
  // njkSources module and the bundled preview renderer); without it a rebuild
  // leaves the CMS preview assets stale until a manual restart.
  eleventyConfig.addWatchTarget(enginePath("src/content/_partials/"), {
    resetConfig: true,
  });
  eleventyConfig.addWatchTarget(
    enginePath("src/config-11ty/plugins/partialShortcodes/"),
    { resetConfig: true },
  );
  eleventyConfig.addWatchTarget(enginePath(`src/themes/${POKO_THEME}/`), {
    resetConfig: true,
  });
  // Project partials feed njkSources; other working-dir content already
  // triggers normal rebuilds without a config reset.
  eleventyConfig.addWatchTarget(`./${WORKING_DIR}/**/${PARTIALS_DIR}/`, {
    resetConfig: true,
  });
  eleventyConfig.addWatchTarget(`./${WORKING_DIR}/_config/`, {
    resetConfig: true,
  });
  eleventyConfig.addWatchTarget(`./${WORKING_DIR}/_data/`, {
    resetConfig: true,
  });

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
        // Replaces the build's io-elements transform: elements whose `io`
        // filter input was undefined get `data-io-undefined` — hidden.
        return `${css}\n[data-io-undefined]{display:none !important}\n`;
      },
    },
    {},
  );

  eleventyConfig.addTemplate("admin/config.11ty.js", CmsConfig, {});
  eleventyConfig.addTemplate("admin/index.11ty.js", CmsPage, {});

  // CMS preview: published-image manifest (`/_images/…` → `/assets/images/…`).
  // Entries are recorded by the image shortcode/filters during the build —
  // this only writes the collected map next to the admin bundle.
  // NOTE: we do this here to have a chance to add from the transform plugin even if it does not work currently
  eleventyConfig.on("eleventy.after", () =>
    writeImageManifest(`${OUTPUT_DIR}/admin`),
  );

  // Bundled icon map for the preview: svg markup of every icon the real
  // build rendered (recorded via plugin-icons `icon.class` callback).
  eleventyConfig.on("eleventy.after", () =>
    writeIconsModule(`${generatedDir}/preview-icons.generated.js`),
  );
}
