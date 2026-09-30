// markdown-it instance matching the site's real md library (see
// eleventy.config.js "Plugins Markdown"): same options, same plugins.
import MarkdownIt from "markdown-it";
import markdownItContainer from "markdown-it-container";
import markdownItMark from "markdown-it-mark";
import markdownItLinkAttributes from "markdown-it-link-attributes";
import markdownItAttrs from "markdown-it-attrs";
import markdownItBracketedSpans from "markdown-it-bracketed-spans";
import {
  mdSemanticContainerTags,
  mdPlainContainerNames,
  mRCTOptions,
} from "../../../markdown-containers.js";

let md;

// Asset resolver injected by preview-runtime: maps a markdown/shortcode image
// src to Sveltia's asset (blob: url for unsaved/dropped files, public url
// otherwise). Identity by default so the bundle is usable standalone.
// let assetResolver = (src) => null;
let assetResolver = (src) => src;
export const setAssetResolver = (fn) => {
  assetResolver = typeof fn === "function" ? fn : (src) => src;
};
export const resolveAsset = (src) => assetResolver(src);

// Same injection, for srcset variants: the runtime provides manifest-derived
// `<url> <w>w` candidates for published images; "" when none.
let srcsetProvider = () => "";
export const setSrcsetProvider = (fn) => {
  srcsetProvider = typeof fn === "function" ? fn : () => "";
};
export const previewSrcset = (src) => srcsetProvider(src);

// Same injection, for the `| image(src, opts)` filter: the runtime provides
// the build manifest's real stats ({webp: [{url, width}…], jpeg: […]});
// null for unpublished sources.
let statsProvider = () => null;
export const setStatsProvider = (fn) => {
  statsProvider = typeof fn === "function" ? fn : () => null;
};
export const previewImageStats = (src) => statsProvider(src);

// Same injection, for `{% icon %}`: the runtime resolves "lib:name" to real
// svg markup (bundled build map, else lazy unpkg fetch → re-render); null
// while unresolved so the stub keeps its placeholder.
let iconResolver = () => null;
export const setIconResolver = (fn) => {
  iconResolver = typeof fn === "function" ? fn : () => null;
};
export const resolveIcon = (key) => iconResolver(key);

// Media-folder paths (`/_images/…`, `/_files/…`, content- or media-relative
// forms). These are CMS storage conventions — the site NEVER serves them;
// the only valid url is the blob: from the CMS asset store. Anything else
// site-relative (`/assets/…` etc.) may be served by the dev server and is
// left alone by the resolver.
const MEDIA_PATH_RE = /(^|\/)_(images|files|assets|media)\//;
// Whole-string path check: content strings (markdown bodies, fields holding
// `{% image %}` markup) can CONTAIN media paths — only bare paths count as
// asset references. Anything with whitespace/quotes/template braces is
// content, not a path.
const PATH_RE = /^[^\s'"<>{}]+$/;
export const isMediaPath = (v) =>
  typeof v === "string" && PATH_RE.test(v) && MEDIA_PATH_RE.test(v);

export const resolveSrcset = (v) =>
  String(v ?? "")
    .split(",")
    .map((part) => {
      const [url, ...descriptor] = part.trim().split(/\s+/);
      return [resolveAsset(url), ...descriptor].join(" ");
    })
    .join(", ");

// Literal `<img src>`/`<a href>` in markdown/njk source bypass the image
// rule — html tokens render verbatim. Rewrite asset attrs inside them at
// render time (scoped string rewrite on the token, not a DOM pass).
const HTML_ATTR_RE = /\b(src|srcset|poster|href)=(["'])([^"']*)\2/g;
const rewriteHtmlAttrs = (content) =>
  String(content ?? "").replace(HTML_ATTR_RE, (match, attr, quote, val) => {
    if (attr === "href" && !isMediaPath(val)) return match;
    const resolved = attr === "srcset" ? resolveSrcset(val) : resolveAsset(val);
    return `${attr}=${quote}${resolved}${quote}`;
  });
const wrapHtmlTokenRule = (md, name) => {
  const base =
    md.renderer.rules[name] ?? ((tokens, idx) => tokens[idx].content);
  md.renderer.rules[name] = (tokens, idx, options, env, self) => {
    const original = tokens[idx].content;
    tokens[idx].content = rewriteHtmlAttrs(original);
    const out = base(tokens, idx, options, env, self);
    tokens[idx].content = original;
    return out;
  };
};

export function getPreviewMd() {
  if (md) return md;
  md = new MarkdownIt({ html: true, linkify: false }).set({ breaks: true });
  for (const tag of mdSemanticContainerTags) {
    md.use(markdownItContainer, tag, mRCTOptions(tag));
  }
  for (const name of mdPlainContainerNames) {
    md.use(markdownItContainer, name);
  }
  md.use(markdownItMark)
    .use(markdownItLinkAttributes)
    .use(markdownItAttrs)
    .use(markdownItBracketedSpans);
  // Resolve ![img](src) through the CMS asset store (blob: for dropped files)
  const defaultImage =
    md.renderer.rules.image ||
    ((tokens, idx, options, env, self) =>
      self.renderToken(tokens, idx, options));
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const src = tokens[idx].attrGet("src");
    if (src) tokens[idx].attrSet("src", assetResolver(src));
    return defaultImage(tokens, idx, options, env, self);
  };
  wrapHtmlTokenRule(md, "html_block");
  wrapHtmlTokenRule(md, "html_inline");
  return md;
}
