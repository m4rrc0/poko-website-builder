import { posterStyleFromRemote } from "./poster.js";
import youtube from "./providers/youtube.js";
import vimeo from "./providers/vimeo.js";

export const providers = [youtube, vimeo];

const escAttr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// value: string | { <lang>: text, default: fallback } | false
const localize = (value, lang) => {
  if (value === false || value == null || value === "") return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.default ?? "";
};

/**
 * Resolve a URL to its provider + parsed data.
 * @returns {{provider:object, data:object}|null}
 */
export function dispatch(url) {
  for (const provider of providers) {
    const data = provider.parseUrl(url);
    if (data) return { provider, data };
  }
  return null;
}

// Once-per-page asset registration — shared between shortcode and transform
// paths. module-level: a page needs the runtime once however many embeds it
// carries, whichever route produced them.
const pushedAssets = new Set();

function ensureAssets(ctx, pageUrl, provider) {
  if (!pageUrl) return "";
  let inline = "";
  const bundles = ctx.getBundles();

  // Facade css — shared rules, pushed once per page for ALL providers.
  const cssKey = `${pageUrl}|facade-css`;
  if (!pushedAssets.has(cssKey)) {
    pushedAssets.add(cssKey);
    if (bundles?.css) {
      bundles.css.addToPage(pageUrl, ctx.assets.facadeCss);
    } else {
      inline += `<style>${ctx.assets.facadeCss}</style>\n`;
    }
  }

  // Provider runtime css/js — once per page per provider.
  const pKey = `${pageUrl}|${provider.name}`;
  if (pushedAssets.has(pKey)) return inline;
  pushedAssets.add(pKey);
  const assets = ctx.assets.providers[provider.name];
  if (bundles?.css || bundles?.js) {
    if (assets?.css && bundles?.css) bundles.css.addToPage(pageUrl, assets.css);
    if (assets?.js && bundles?.js) {
      bundles.js.addToPage(pageUrl, assets.js, "defer");
    }
  } else {
    if (assets?.css) inline += `<style>${assets.css}</style>\n`;
    if (assets?.js) inline += `<script>${assets.js}</script>\n`;
  }
  return inline;
}

/**
 * Render one embed facade for a URL the dispatch resolved.
 * @param {{provider:object, data:object}} hit dispatch() result
 * @param {object} args shortcode attrs (url, class, id, title, start, params,
 *   attrs — unknown keys are tolerated for future attrs)
 * @param {object} ctx { config, getBundles, assets, page, lang }
 * @returns {Promise<string>} html
 */
export async function renderEmbed(hit, args, ctx) {
  const { provider, data } = hit;
  const { config, lang } = ctx;
  const provCfg = config.providers[provider.name] || {};

  const remote = await provider.posterRemote(data, config);
  const poster = await posterStyleFromRemote(
    remote,
    `${provider.filePrefix}-${data.id}`,
    config.poster,
  );

  const title =
    args.title ||
    (await provider.title?.(data, config)) ||
    localize(provCfg.title, lang) ||
    "Embedded video";
  const playLabel = localize(
    args.playLabel ?? provCfg.playLabel,
    lang,
  );
  const disclaimer = localize(config.disclaimer, lang).replace(
    /\{service\}/g,
    provCfg.service || provider.name,
  );

  const elementAttrs = [
    ...provider.attrs(data, args, config),
    ...(playLabel ? [`playlabel="${escAttr(playLabel)}"`] : []),
    `title="${escAttr(title)}"`,
    args.attrs, // raw passthrough — escape hatch for future attrs
  ]
    .filter(Boolean)
    .join(" ");

  const classes = [
    config.embedClass,
    `${provider.name}-embed`,
    args.class,
  ]
    .filter(Boolean)
    .join(" ");

  const assetsPrefix = ensureAssets(ctx, ctx.page?.url, provider);
  return (
    assetsPrefix +
    `<div${args.id ? ` id="${escAttr(args.id)}"` : ""} class="${escAttr(classes)}">` +
    `<${provider.element} ${elementAttrs} style="${poster.style}">` +
    `<div class="${provider.playBtnClass}"></div>` +
    (disclaimer
      ? `<p class="embed-disclaimer">${escAttr(disclaimer)}</p>`
      : "") +
    `</${provider.element}></div>\n`
  );
}

// Nunjucks shortcode args arrive as ({…}) for all-named calls or
// ("positional", {…}) for mixed — normalize both to a plain object.
export function normalizeEmbedArgs(a, b) {
  if (typeof a === "string") {
    const { __keywords, ...kw } = b || {};
    return { ...kw, url: a };
  }
  if (a && typeof a === "object") {
    const { __keywords, ...rest } = a;
    return rest;
  }
  return {};
}
