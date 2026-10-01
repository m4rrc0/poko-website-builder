// Browser-side "Eleventy lite" renderer: a real Nunjucks environment bundled
// into the CMS preview so `{% shortcodes %}`, `{{ expressions }}` and project
// `.njk` partials render like the site pipeline instead of printing literally.
//
// Sources ship as a generated module (preview-njk-sources.generated.js, written
// by cms-config/index.js at build time) and are served through MapLoader.
//
// v2 note — precompilation: `nunjucks.precompile()` could compile the static
// `.njk` partials at build time, enabling `nunjucks-slim.js` (~8KB gz vs ~20KB
// full). NOT a win for correctness: previewed *content* is typed live in the
// CMS and can never be precompiled, so the full build is required anyway.
// Precompilation also does not make async extensions synchronous — our paired
// shortcodes must stay CallExtensionAsync either way. Revisit only if preview
// bundle size or per-keystroke compile time becomes a problem.

import nunjucks from "nunjucks";
import slugify from "@sindresorhus/slugify";
import {
  getPreviewMd,
  resolveIcon,
  previewSrcset,
  previewImageStats,
} from "./preview-md.js";
import { prepareImageArgs } from "../../../shortcodes/components/image.args.js";
import { adminEntryUrl } from "../utils/admin-url.js";
import njkSources from "./generated/preview-njk-sources.generated.js";
import {
  link,
  button,
  linkPaired,
  buttonPaired,
} from "../../../shortcodes/components/links.js";
import { embed } from "../../../shortcodes/components/embed.js";
import { gallery } from "../../../shortcodes/components/gallery.js";
import { newLine, htmlLineBreak } from "../../../shortcodes/newLine.js";
import { locale_url, locale_links, tagLabel } from "../../../filters/i18n.js";
import { emailLink, email } from "../../../filters/email.js";
import { htmlAttrs, htmlImgAttrs, ioAttr } from "../../../filters/html.js";
import {
  filterCollection,
  join,
  first,
  last,
  randomFilter,
  sortCollection,
  asc,
  desc,
} from "../../../filters/array.js";
import {
  toISOString,
  formatDate,
  dateToSlug,
  toLocaleString,
  formatDateLocalized,
} from "../../../filters/dates.js";
import { slugifyPath } from "../../../filters/slugify.js";
import EleventyNavigation from "@11ty/eleventy-navigation/eleventy-navigation.js";
// Shortcode names + handler bodies shared with the build-time
// partialShortcodes plugin — the preview registers the same tags against
// its own partial/renderContent implementations.
import {
  sectionPartialNames,
  otherPartialNames,
  makePartialHandlers,
} from "../../partialShortcodes/handlers.js";

// ---------------------------------------------------------------------------
// Partial source resolution — mirrors partials/index.js retrievePartial():
// sources are keyed "<lang>/<file>" for language dirs, "<file>" otherwise,
// first-write-wins across the dir priority order (project > theme > engine).
const PARTIAL_EXTS = ["", ".njk", ".md", ".11ty.js"];

function resolvePartialKey(name, lang) {
  const candidates = [];
  for (const base of lang ? [`${lang}/${name}`, name] : [name]) {
    for (const ext of PARTIAL_EXTS) candidates.push(base + ext);
  }
  return candidates.find((key) => njkSources[key] != null) || null;
}

class MapLoader extends nunjucks.Loader {
  getSource(name) {
    const src = njkSources[name];
    return src == null ? null : { src, path: name, noCache: false };
  }
}

// Shortcode fns run with `this` = Eleventy's normalized context:
// { ctx: <data cascade>, env, ...cascade props }. We add the preview helpers
// on top so `this.partial`/`this.renderContent` work at any depth.
const makeShim = (context, helpers) => {
  const ctx = context?.ctx ?? context ?? {};
  // `env` must come after the ctx spread: the cascade carries a global *data*
  // `env` (env.config.js values), but `this.env` in shortcodes is the engine
  // Environment (filters like `this.env.filters.safe` depend on it) — same
  // override order as Eleventy's normalized shortcode context.
  return { ctx, ...ctx, ...helpers, env: context?.env ?? helpers.env };
};

const promisify = (run) =>
  function (...args) {
    const cb = args.pop();
    Promise.resolve(run.apply(this, args)).then(
      (v) => cb(null, v == null ? v : new nunjucks.runtime.SafeString("" + v)),
      (e) => {
        console.warn("[cms preview]", e);
        cb(null, "");
      },
    );
  };

function singleTag(name, runFn) {
  return {
    tags: [name],
    parse(parser, nodes) {
      const tok = parser.nextToken();
      const args = parser.parseSignature(true, true);
      // Nunjucks bug with non-paired custom tags (mozilla/nunjucks#158)
      if (args.children.length === 0)
        args.addChild(new nodes.Literal(0, 0, ""));
      parser.advanceAfterBlockEnd(tok.value);
      return new nodes.CallExtensionAsync(this, "run", args);
    },
    run: promisify(async function (context, ...argArray) {
      return runFn.call(makeShim(context, this._helpers), ...argArray);
    }),
  };
}

function pairedTag(name, runFn) {
  return {
    tags: [name],
    parse(parser, nodes) {
      const tok = parser.nextToken();
      const args = parser.parseSignature(true, true);
      parser.advanceAfterBlockEnd(tok.value);
      const body = parser.parseUntilBlocks("end" + name);
      parser.advanceAfterBlockEnd();
      return new nodes.CallExtensionAsync(this, "run", args, [body]);
    },
    run(...args) {
      const cb = args.pop();
      const body = args.pop();
      body((e, content) => {
        if (e) return cb(e);
        Promise.resolve(
          runFn.call(
            makeShim(args[0], this._helpers),
            content,
            ...args.slice(1),
          ),
        ).then(
          (v) =>
            cb(null, v == null ? v : new nunjucks.runtime.SafeString("" + v)),
          (err) => {
            console.warn("[cms preview]", err);
            cb(null, "");
          },
        );
      });
    },
  };
}

// Build-time-only features: resolve to safe stand-ins, never throw.
// `{% image %}` — same arg→attrs computation as the build shortcode
// (image.args.js): aspect-ratio-*/object-[*] classes, sizes, loading… land in
// the markup so runtime UnoCSS sees them. src stays the CMS storage path —
// the runtime's post-insert media pass resolves it to a usable url; srcset is
// still set eagerly from the manifest so the markup is self-contained.
const imageStub = function (args = {}) {
  const { srcRaw, wrapperTag, imgAttributes, width } = prepareImageArgs(
    typeof args === "string" ? { src: args } : args,
  );
  if (!srcRaw) return "";
  const attrs = {
    src: srcRaw,
    width,
    ...imgAttributes,
    loading: "lazy",
    decoding: "async",
    fetchpriority: "low",
    srcset: imgAttributes.srcset || previewSrcset(srcRaw) || undefined,
  };
  const img = `<img ${Object.entries(attrs)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) =>
      v === true ? k : `${k}="${String(v).replace(/"/g, "&quot;")}"`,
    )
    .join(" ")}>`;
  return wrapperTag ? `<${wrapperTag}>${img}</${wrapperTag}>` : img;
};
const emptyStubWarned = new Set();
// Once-per-session warn for nav nodes rendered without title/key (see the
// `| eleventyNavigation` filter) — resets are unnecessary: if the warn ever
// fires we WANT the console to keep the record of a broken nav render.
let navKeysWarned = false;
const emptyStub = (what) => {
  if (!emptyStubWarned.has(what)) {
    emptyStubWarned.add(what);
    console.warn(`[cms preview] "${what}" is not supported in preview`);
  }
  return "";
};
// {% icon "tablerOutline:name", width=.., class=.. %} — real SVGs come from
// the runtime resolver (bundled build map → lazy unpkg fetch → re-render).
// Until then, a placeholder carrying the same classes so .icon* rules apply.
const iconStub = function (iconId, attrs = {}) {
  const [lib = "", name = ""] = String(iconId || "").split(":");
  // __keywords leaks in from nunjucks kwargs (`{% icon "a:b", width=1 %}`)
  const { width, height, size, class: cls, __keywords, ...rest } = attrs || {};
  const dim = size || width;
  const dims = [
    (dim || width) && `width="${dim || width}"`,
    (dim || height) && `height="${dim || height}"`,
  ]
    .filter(Boolean)
    .join(" ");
  const extra = Object.entries(rest)
    .filter(([, v]) => v)
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(" ");
  const svg = resolveIcon(`${lib}:${name}`);
  if (svg) {
    // Collapse ALL whitespace like the build's icon transform does
    // (`svg.replace(/\s+/g," ")`): upstream files put newlines between attrs,
    // which breaks downstream markdown/sanitize handling.
    const flat = svg.replace(/\s+/g, " ").trim();
    // Same outer attrs the build's class() fn would produce; keep upstream
    // viewBox/fill/stroke, our class/dims/extra win.
    return flat.replace(/<svg\b[^>]*>/, (tag) => {
      const kept = tag
        .replace(/\s+(class|width|height)="[^"]*"/g, "")
        .replace(/>$/, "");
      return `${kept} class="icon icon-${lib} icon-${name} ${cls || ""}" ${dims} ${extra}>`;
    });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="icon-stub icon icon-${lib} icon-${name} ${cls || ""}" ${dims} ${extra}><path d="M240-340h480L480-740 240-340Zm141-80 99-164 98 164H381Zm-57 308.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM480-160q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Zm0-320Z"/></svg>`;
};

export function createNjkEnv({ lang = "", helpers }) {
  // `lang` may be a getter so a singleton env tracks the entry being edited
  const langOf = typeof lang === "function" ? lang : () => lang;
  const loader = new MapLoader();
  const env = new nunjucks.Environment(loader, {
    throwOnUndefined: false, // 11ty parity: default nunjucks env options
  });
  const renderRich = (src, ctx) => renderRichContent(env, src, ctx);

  // helpers: { partial, renderTemplate, renderContent, filterCollection,
  //            sortCollection } bound to the renderer ctx
  const allHelpers = {
    env,
    renderContent: (src, _formats, data) =>
      renderRich(src, { ...helpers.cascade(), ...data }),
    ...helpers,
  };

  const attachHelpers = (ext) => {
    ext._helpers = allHelpers;
    return ext;
  };
  const addSingle = (name, fn) =>
    env.addExtension(`preview_${name}`, attachHelpers(singleTag(name, fn)));
  const addPaired = (name, fn) =>
    env.addExtension(`preview_${name}`, attachHelpers(pairedTag(name, fn)));

  // ---- partial dispatch (`{% partial "x" %}`, `{% htmlPartial %}`, …)
  // Ext priority like the real plugin: an existing `name.11ty.js` (bundled JS
  // partials map) beats `name.njk`/`name.md` in any dir.
  const renderPartial = async function (
    filenameRaw,
    dataManual = {},
    engineOverride,
  ) {
    const filename = Array.isArray(filenameRaw) ? filenameRaw[0] : filenameRaw;
    // `{% partial foo + ".md" %}` with `foo` unset produces "undefined.md" —
    // treat empty/coerced-undefined names as a no-op rather than a miss
    if (
      typeof filename !== "string" ||
      !filename ||
      /^undefined\b/.test(filename)
    )
      return "";
    const cascade = this.ctx ?? dataManual?.__cascade ?? {};
    const data = { ...cascade, ...dataManual, __cascade: cascade };
    const bare = filename.replace(/\.(njk|md|11ty\.js)$/, "");
    if (helpers.hasJsPartial?.(bare)) return helpers.partial(bare, data);
    let html;
    try {
      html = await renderNjkPartial(
        env,
        filename,
        data,
        this.lang || langOf(),
        engineOverride,
      );
    } catch (e) {
      console.warn(`[cms preview] partial "${filename}" render failed`, e);
      return "";
    }
    if (html != null) return html;
    if (!/\./.test(filename)) return helpers.partial(filename, data);
    console.warn(`[cms preview] partial "${filename}" not found`);
    return "";
  };

  for (const alias of ["partial", "component", "htmlPartial"]) {
    addSingle(alias, renderPartial);
  }
  for (const alias of [
    "partialWrapper",
    "componentWrapper",
    "htmlPartialWrapper",
  ]) {
    addPaired(alias, async function (content, filename, dataManual) {
      return renderPartial.call(this, filename, { content, ...dataManual });
    });
  }

  // ---- section & layout partial shortcodes (handlers shared with the
  // build plugin — see partialShortcodes/handlers.js)
  const { named, collection, sections } = makePartialHandlers({
    renderPartial,
    renderContent: allHelpers.renderContent,
  });
  for (const name of [...sectionPartialNames, ...otherPartialNames]) {
    addPaired(name, named(name));
  }
  addPaired("collection", collection);

  // `{% section %}` — mirrors the deferred plugin in eleventy.config.js:
  // multi-arg deprecated form dispatches to partial(), single object arg
  // resolves `_sections/${type}` (or advanced.sectionSlug).
  addSingle("section", async function (...args) {
    if (args.length > 1) {
      return renderPartial.call(this, args[0], args[1] || {});
    }
    if (args.length !== 1 || typeof args[0] !== "object") {
      console.warn(`[cms preview] section called with invalid arguments`);
      return "";
    }
    const { type, vars, blocks, advanced } = args[0] || {};
    const { sectionSlug, vars: advancedVars } = advanced || {};
    const filename =
      (sectionSlug || `_sections/${type || "catch-error"}`) + ".njk";
    const html = await renderPartial.call(this, filename, {
      blocks,
      ...vars,
      ...advancedVars,
    });
    if (html || filename.endsWith("catch-error.njk")) return html;
    // Real pipeline renders `_sections/catch-error.njk` when the partial fails
    return renderPartial.call(this, "_sections/catch-error.njk", { type });
  });

  // RenderPlugin parity: `{% renderFile "x.njk", data, "njk,md" %}` routes to
  // the same partial resolution; paired renderTemplate/renderContent render
  // their body through the rich pipeline.
  addSingle("renderFile", async function (file, dataManual, engineOverride) {
    return renderPartial.call(this, file, dataManual || {}, engineOverride);
  });
  addPaired("renderTemplate", async function (content) {
    return renderRich(content, this.ctx ?? {});
  });
  addPaired("renderContent", async function (content) {
    return renderRich(content, this.ctx ?? {});
  });

  addPaired("sections", sections);

  // ---- component shortcodes (real implementations)
  // Internal links resolve to CMS entry urls (see previewTemplates). When
  // `link()` can't resolve (e.g. collections not loaded yet on first render),
  // synthesize the admin entry url from the args — it doesn't need collection
  // data.
  const previewLink = (fn, paired) =>
    async function (first, ...rest) {
      const [content, args] = paired ? [first, rest] : [null, [first, ...rest]];
      const html = await (paired
        ? fn.call(this, content, ...args)
        : fn.call(this, ...args));
      if (html) return html;
      const merged = args.find((a) => a && typeof a === "object") || {};
      const urlRef = typeof args[0] === "string" ? args[0] : merged.url;
      const type = merged.type || merged.linkType;
      const isInternal =
        type !== "external" && type !== "email" && type !== "file";
      if (!isInternal || !urlRef) return html;
      const slug = String(urlRef)
        .replace(/^\/+|\/+$/g, "")
        .split("/")
        .pop();
      const coll = merged.collection || "pages";
      // Same passthrough attrs as the real link() — minus the consumed keys.
      const {
        __keywords: _k,
        url: _u,
        text,
        content: _c,
        lang: _l,
        prop: _p,
        collection: _col,
        type: _t,
        linkType: _lt,
        anchor: _a, // admin editor urls are #-routed; can't carry fragments
        subject: _s,
        body: _b,
        cc: _cc,
        bcc: _bb,
        preload,
        newTab,
        ...attrs
      } = merged;
      const attrStr = Object.entries({
        ...attrs,
        target: attrs.target || (newTab ? "_blank" : undefined),
        ...(preload === false || preload === "false"
          ? { "data-no-instant": true }
          : {}),
        ...(preload === true || preload === "true"
          ? { "data-instant": true }
          : {}),
      })
        .filter(([, v]) => v)
        .map(([k, v]) =>
          v === true ? k : `${k}="${String(v).replace(/"/g, "&quot;")}"`,
        )
        .join(" ");
      // Label parity with the real fn's `pageData.name` fallback — items are
      // computed (B7) so `title`/`name` are populated.
      const item = (this?.collections?.[coll] ?? []).find(
        (i) => i.page?.fileSlug === slug || i.data?.page?.fileSlug === slug,
      );
      const label =
        content ||
        text ||
        merged.content ||
        item?.data?.title ||
        item?.data?.name ||
        urlRef;
      return `<a href="${adminEntryUrl(coll, slug)}" ${attrStr}>${label}</a>`;
    };
  addPaired("link", previewLink(linkPaired, true));
  addPaired("button", previewLink(buttonPaired, true));
  addSingle("linkSimple", previewLink(link, false));
  addSingle("buttonSimple", previewLink(button, false));
  addSingle("embed", embed);
  addSingle("gallery", gallery);
  addSingle("n", newLine);
  addSingle("br", htmlLineBreak);

  // ---- build-time-only shortcodes → stubs
  addSingle("image", imageStub);
  addSingle("icon", iconStub);
  addSingle("fetchFile", () => emptyStub("fetchFile"));
  addSingle("getBundle", () => emptyStub("getBundle"));
  addSingle("getBundleFileUrl", () => emptyStub("getBundleFileUrl"));
  addPaired("css", async (content) => `<style>${content}</style>`);
  addPaired("js", async () => "");

  // ---- filters
  // Shortcode-style `this`: { ctx: <live cascade>, ...cascade, env }. `env`
  // comes last: the cascade's data `env` must not shadow the Environment —
  // e.g. emailLink calls `this.env.filters.safe`.
  const boundThis = () => {
    const c = helpers.cascade();
    return { ctx: c, ...c, env };
  };
  const bind =
    (fn) =>
    (v, ...a) =>
      fn.call(boundThis(), v, ...a);
  for (const [name, fn] of Object.entries({
    locale_url,
    locale_links,
    tagLabel,
    emailLink,
    email,
    htmlAttrs,
    htmlImgAttrs,
    ioAttr,
    io: ioAttr,
    slugify,
    slugifyPath: (input) => slugifyPath(input, { getFilter: () => slugify }),
    toIsoString: toISOString, // build registers it under this casing
    toISOString,
    formatDate,
    dateToSlug,
    toLocaleString,
    formatDateLocalized,
    filterCollection: helpers.filterCollection,
    sortCollection,
    join,
    first,
    last,
    randomFilter,
    asc,
    desc,
    eleventyNavigation: (collection, activeKey, options) => {
      const entries = EleventyNavigation.findNavigationEntries(
        collection,
        activeKey,
        options,
      );
      // Nav titles/keys come from eleventyComputed in the real build — a node
      // with neither means the item never saw computed data (or the author
      // didn't set it). Empty <a> text is a silent nav break: warn loudly.
      const blank = entries.filter((e) => !e.title && !e.key).length;
      if (blank && !navKeysWarned) {
        navKeysWarned = true;
        console.warn(
          `[cms preview] ${blank} nav ${blank === 1 ? "entry" : "entries"} missing title/key — item data lacks computed eleventyNavigation`,
        );
      }
      return entries;
    },
  })) {
    env.addFilter(name, typeof fn === "function" ? bind(fn) : fn);
  }

  // async filters
  const addAsyncFilter = (name, fn) =>
    env.addFilter(
      name,
      (v, ...a) => {
        const cb = a.pop();
        Promise.resolve(fn.call(boundThis(), v, ...a)).then(
          (r) => cb(null, r),
          (e) => {
            console.warn("[cms preview]", e);
            cb(null, "");
          },
        );
      },
      true,
    );
  addAsyncFilter("renderContent", (src, _formats, data) =>
    renderRich(src, { ...helpers.cascade(), ...data }),
  );
  // Parity with customRenderers' renderMd: the field content goes through the
  // full "njk,md" pipeline (shortcodes resolve) and returns SafeString —
  // without it, `{{ footer | md }}` prints {% link %} literally and the
  // surrounding markup gets autoescaped.
  addAsyncFilter("md", async function (src, data) {
    const html = await renderRich(src, {
      ...helpers.cascade(),
      ...(this?.ctx ?? {}),
      ...data,
    });
    return env.filters.safe(html);
  });
  addAsyncFilter("partialExists", async (name) =>
    Boolean(resolvePartialKey(name, langOf())),
  );
  addAsyncFilter("partialFallback", async (rawNames) => {
    const names = Array.isArray(rawNames)
      ? rawNames
      : String(rawNames || "")
          .split(",")
          .map((f) => f.trim());
    return names.find((n) => resolvePartialKey(n, langOf())) || "";
  });
  // `| image(src, opts)` — eleventy-img stats shape without sharp: manifest
  // variants for published sources (real urls+widths); else a shim pointing
  // each format at the source path so `.webp[0].url`-style reads work — the
  // post-insert media pass resolves it like any other media attr.
  env.addFilter("image", (src, opts = {}) => {
    const stats = previewImageStats(src);
    if (stats) return stats;
    if (!src) return {};
    const width = Number(opts?.width) || Number(opts?.widths?.[0]) || undefined;
    const variant = { url: src, ...(width ? { width } : {}) };
    return { webp: [variant], jpeg: [variant] };
  });
  // fs filters → identity stubs
  for (const name of ["ogImage", "imgStats", "glob"]) {
    env.addFilter(name, (v) => v ?? "");
  }

  // Sync with the build's nunjucks env: env.js ships the names of every
  // filter registered via addFilter/addAsyncFilter (njkFilterNames). Anything
  // we haven't implemented above becomes a passthrough stub so templates
  // degrade instead of throwing "filter not found".
  for (const name of stubFilterNames) {
    if (!(name in env.filters)) env.addFilter(name, (v) => v ?? "");
  }

  return env;
}

const stubFilterNames = new Set();

export function registerPreviewFilterStubs(names) {
  for (const name of names || []) stubFilterNames.add(name);
}

// Render a .njk/.md partial source by name. Returns null when not found so
// callers can fall back to the JS partials map. `engineOverride` mirrors the
// partial shortcode's third arg ("njk", "md", "njk,md"): default is njk for
// .njk sources and njk→md for .md sources.
export async function renderNjkPartial(
  env,
  filename,
  data,
  lang = "",
  engineOverride,
) {
  const key = resolvePartialKey(filename, lang);
  if (!key || !/\.(njk|md)$/.test(key)) return null;
  let engines = engineOverride?.split(",").map((s) => s.trim());
  if (!engines?.length) engines = key.endsWith(".md") ? ["njk", "md"] : ["njk"];
  let out = njkSources[key];
  for (const engine of engines) {
    if (engine === "njk") out = await renderNjkString(env, out, data);
    else if (engine === "md") out = getPreviewMd().render(String(out ?? ""));
  }
  return key.endsWith(".md") || engines.includes("md")
    ? out
    : cleanMdString(out);
}

export function renderNjkString(env, src, ctx) {
  return new Promise((resolve, reject) =>
    env.renderString(String(src ?? ""), ctx, (e, r) =>
      e ? reject(e) : resolve(r ?? ""),
    ),
  );
}

// Full "njk,md" pipeline for content strings. On a njk parse error (e.g. an
// unfinished `{%` tag while typing), fall back to rendering the raw source as
// markdown so the pane degrades instead of blanking.
export async function renderRichContent(env, src, ctx) {
  let html;
  try {
    html = await renderNjkString(env, src, ctx);
  } catch (e) {
    console.warn("[cms preview] njk render failed, showing raw markdown", e);
    html = src;
  }
  return getPreviewMd().render(String(html ?? ""));
}

// Mirrors partials/index.js cleanMdString: collapse indentation/blank lines on
// non-md partial output so it can sit inside markdown contexts.
export function cleanMdString(str) {
  return String(str ?? "")
    .replace(/^\s+/gm, "")
    .replace(/\n+/g, "\n");
}
