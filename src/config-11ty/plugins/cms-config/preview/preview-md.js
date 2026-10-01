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

// Asset resolver injected by preview-runtime: maps a CMS storage path
// (`/_images/…`) to a usable url (published manifest url, else CMS blob/data).
// Drives `resolveSrcset` below — the runtime's post-insert media pass calls
// the resolver directly for plain attrs. Identity default keeps the bundle
// usable standalone.
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
  // No attr rewriting here: `![img]` and literal-html `src`/`href` emit CMS
  // media paths verbatim — the runtime's post-insert media pass resolves
  // them uniformly (plus manifest srcset backfill on <img>).
  return md;
}
