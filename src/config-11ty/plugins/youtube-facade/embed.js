import downloadAndCache from "@11ty/eleventy-fetch";
import { resolvePoster } from "./poster.js";

const escAttr = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Localized option values: plain string applies everywhere; a map resolves
// `map[lang] ?? map.default ?? ""`. `false` disables the feature entirely.
const localize = (value, lang) => {
  if (value == null || value === false) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.default ?? "";
};

/**
 * Get the video title from YouTube's oEmbed API at build time
 * (server-side fetch — no client exposure), with the configured default
 * as fallback. Same contract as eleventy-plugin-youtube-embed.
 */
async function getYouTubeTitleViaOembed(id, options) {
  const cacheDuration = options.titleOptions.cacheDuration;
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
  try {
    const { title } = await downloadAndCache(url, {
      duration: cacheDuration,
      type: "json",
    });
    return title;
  } catch (error) {
    console.info(
      `[youtube-facade] couldn't fetch video title for ${id}, falling back —`,
      error?.message,
    );
    return options.title;
  }
}

// URL params forwarded to <lite-youtube params="…"> — the component appends
// autoplay=1&playsinline=1 on activation, so autoplay isn't needed here.
function paramsString(options, urlParams) {
  const params = [];
  if (options.recommendSelfOnly) params.push("rel=0");
  if (options.modestBranding) params.push("modestbranding=1");
  const start = urlParams.start ?? urlParams.t ?? options.startTime;
  if (start) params.push(`start=${parseInt(start)}`);
  if (options.params) params.push(options.params);
  return params.join("&amp;");
}

/**
 * Facade HTML for one matched YouTube URL.
 * @param {RegExpMatchArray} match
 * @param {object} options  merged plugin options
 * @param {number} index    embed index on the page (assets ship on first)
 * @param {string} lang     page lang for localized strings
 * @param {string} assets   lite css/js tags to emit once ("" when index > 0)
 */
export async function liteEmbed(match, options, index, lang, assets) {
  const [, , , __url, id] = match;
  const url = `https://${__url}`.replace(/&amp;/g, "&");

  // Facade supports single videos only — playlists fall back to a plain
  // link, same contract as the upstream plugin.
  const { list } = __urlParams(url);
  if (!id || list) {
    console.error(`[youtube-facade] playlists unsupported, left as link: ${url}`);
    return match[0];
  }

  const urlParams = __urlParams(url);
  const params = paramsString(options, urlParams);

  const title = options.titleOptions.download
    ? await getYouTubeTitleViaOembed(id, options)
    : null;
  const titleAttr =
    title && title !== options.title ? ` title="${escAttr(title)}"` : "";

  const { style } = await resolvePoster(id, options.poster);

  const playLabel = escAttr(localize(options.playLabel, lang) || "Play");
  const disclaimer = localize(options.disclaimer, lang);
  const disclaimerHtml = disclaimer
    ? `<p class="yt-embed-disclaimer">${escAttr(disclaimer)}</p>`
    : "";

  return (
    (index === 0 ? assets : "") +
    `<div id="${escAttr(id)}" class="${escAttr(options.embedClass)}">` +
    `<lite-youtube videoid="${escAttr(id)}" playlabel="${playLabel}"` +
    `${titleAttr}${params ? ` params="${params}"` : ""}` +
    `${options.lite.jsApi ? " js-api" : ""} style="${style}">` +
    `<div class="lyt-playbtn lty-playbtn"></div>` +
    disclaimerHtml +
    `</lite-youtube></div>`
  );
}

// Query params of the matched URL (v, list, start, t…). youtu.be IDs come
// from the regex capture group, not from here.
function __urlParams(url) {
  try {
    const u = new URL(url);
    const out = Object.fromEntries(u.searchParams.entries());
    const dotBe = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (dotBe) out.v = dotBe[1];
    return out;
  } catch {
    return {};
  }
}
