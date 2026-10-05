import fglob from "fast-glob";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
  ctxCssText,
} from "../../../../env.config.js";
import { CmsConfig } from "./config.js";
import { CmsPage } from "./page.js";
import {
  pagesCollection,
  getActiveCollections,
  getActiveEditorComponents,
  stylesConfigCollection,
} from "./config.js";
import { utilityClassGroups } from "./utility-classes.js";
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
      // Sveltia lazily imports dist/chunks/react-dom.js (resolved relative
      // to the bundle URL) to mount custom React field types — it must be
      // served alongside the bundle or it falls back to the CDN.
      [dependencyEnginePath("@sveltia/cms", "dist/chunks")]: "assets/js/chunks",
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
    [enginePath("src/config-11ty/plugins/cms-config/defaultFieldTypes.js")]:
      "admin/defaultFieldTypes.js",
    [enginePath(
      "src/config-11ty/plugins/cms-config/preview/preview-runtime.js",
    )]: "admin/preview-runtime.js",
    [enginePath(
      "src/config-11ty/plugins/cms-config/preview/previewTemplates.js",
    )]: "admin/previewTemplates.js",
    [enginePath(
      "src/config-11ty/plugins/cms-config/preview/preview-styles-config.js",
    )]: "admin/preview-styles-config.js",
    [enginePath("src/config-11ty/plugins/cms-config/utils/admin-url.js")]:
      "admin/admin-url.js",
  });

  // ---- generated preview modules -------------------------------------------
  // Everything below lands in preview/generated/ and feeds the renderer
  // bundle. The files sit under `resetConfig` watch targets, so writes are
  // write-if-different — an unconditional write would loop plugin re-run →
  // write → reset forever.
  const generatedDir = `${import.meta.dirname}/preview/generated`;
  await mkdir(generatedDir, { recursive: true });
  const writeIfChanged = async (filePath, code) => {
    const existing = await readFile(filePath, "utf-8").catch(() => null);
    if (existing !== code) await writeFile(filePath, code);
  };
  // JSON.stringify does not escape U+2028/9, which terminate JS string
  // literals — a source containing either would kill the whole bundle.
  const jsSafeJson = (value) =>
    JSON.stringify(value)
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029");
  // First-write-wins collect over dir specs in priority order (earlier specs
  // win duplicate keys) — mirrors partials/index.js retrievePartial().
  const collectFirstWins = async (specs, load) => {
    const out = {};
    for (const { pattern, keyOf } of specs) {
      for (const file of await fglob(pattern)) {
        const k = keyOf(file);
        if (!(k in out)) out[k] = await load(file);
      }
    }
    return out;
  };
  // Partial keys: "<lang>/<file>" for project lang dirs, "<file>" otherwise —
  // the runtime resolver tries `lang/name` before shared `name`.
  const partialKeyOf = (langDirs) => (file) => {
    const [dir, rel] = file.split(`/${PARTIALS_DIR}/`);
    return langDirs ? `${dir.split("/").pop()}/${rel}` : rel;
  };
  // Dir specs in resolution priority: project lang > project > theme > engine.
  const partialSpecs = (glob, mapKey = (k) => k) =>
    [
      `${WORKING_DIR}/*/${PARTIALS_DIR}/${glob}`,
      `${WORKING_DIR}/${PARTIALS_DIR}/${glob}`,
      enginePath(`src/themes/${POKO_THEME}/${PARTIALS_DIR}/${glob}`),
      enginePath(`src/content/${PARTIALS_DIR}/${glob}`),
    ].map((pattern, i) => ({
      pattern,
      keyOf: (file) => mapKey(partialKeyOf(i === 0)(file)),
    }));
  // {key → file} → a generated module importing each file and exporting the
  // map — partials/layouts ship as real bundled code, never hand-listed.
  const importMapCode = (files, exportName) =>
    Object.values(files)
      .map(
        (file, i) =>
          `import s${i} from ${JSON.stringify(
            path.relative(generatedDir, path.resolve(file)),
          )};`,
      )
      .join("\n") +
    `\nexport ${exportName ? `const ${exportName} =` : "default"} {\n` +
    Object.keys(files)
      .map((key, i) => `  ${JSON.stringify(key)}: s${i},`)
      .join("\n") +
    "\n};\n";

  // Raw .njk/.md partial sources for the preview's browser Nunjucks env.
  const njkSources = await collectFirstWins(
    partialSpecs("**/*.{njk,md}"),
    (f) => readFile(f, "utf-8"),
  );
  await writeIfChanged(
    `${generatedDir}/preview-njk-sources.generated.js`,
    `export default ${jsSafeJson(njkSources)};\n`,
  );

  // `.11ty.js` partials: generated import map, keyed without the extension.
  const jsPartialFiles = await collectFirstWins(
    partialSpecs("**/*.11ty.js", (k) => k.replace(/\.11ty\.js$/, "")),
    (f) => f,
  );
  await writeIfChanged(
    `${generatedDir}/preview-partials.generated.js`,
    importMapCode(jsPartialFiles),
  );

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
      // Arrays replace (matching Eleventy's data cascade) — the deepmerge
      // default concatenates them, which would double lists across files.
      previewData = deepmerge(previewData, node, {
        arrayMerge: (_destination, source) => source,
      });
    }
  }
  await writeIfChanged(
    `${generatedDir}/preview-data.generated.js`,
    `export default ${jsSafeJson(previewData)};\n`,
  );

  // Project `_config/htmlClasses.js` (optional) — drives the build's
  // htmlClassesTransform; the preview applies it to the preview root element.
  const htmlClassesFile = path.resolve(`${WORKING_DIR}/_config/htmlClasses.js`);
  await writeIfChanged(
    `${generatedDir}/preview-userconfig.generated.js`,
    (await fglob(htmlClassesFile)).length
      ? `export { default as htmlClasses } from ${JSON.stringify(
          `./${path.relative(generatedDir, htmlClassesFile)}`,
        )};\n`
      : `export const htmlClasses = {};\n`,
  );

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
  await writeIfChanged(
    `${generatedDir}/preview-layouts.generated.js`,
    `export const layoutSources = ${jsSafeJson(layoutSources)};\n` +
      importMapCode(jsLayoutFiles, "jsLayouts"),
  );

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

      // File names of the stylesConfig file collection — Sveltia keys file
      // previews by file name, so the kitchen-sink preview registers per name.
      const stylesConfigFiles = stylesConfigCollection(
        (data.fontServices?.fontsource?.fonts || []).map(
          ({ family: value }) => ({ value, label: value }),
        ),
      ).files.map((f) => f.name);

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
  export const stylesConfigFiles = ${JSON.stringify(stylesConfigFiles)};
  export const utilityClassGroups = ${JSON.stringify(utilityClassGroups)};
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
        // The brand block no longer rides the UnoCSS preflight — prepend the
        // ctx-css generated styles so the static preview stylesheet keeps
        // parity with the site's <head> ordering (ctx brand → uno).
        // Replaces the build's io-elements transform: elements whose `io`
        // filter input was undefined get `data-io-undefined` — hidden.
        return `${ctxCssText}\n${css}\n[data-io-undefined]{display:none !important}\n`;
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
