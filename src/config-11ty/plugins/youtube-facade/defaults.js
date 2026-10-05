/**
 * Default options for the youtube-facade plugin.
 *
 * Facade model: the page emits a static poster (self-hosted, see poster.js)
 * plus a privacy disclaimer; nothing reaches YouTube on page load. On click,
 * `lite-youtube` builds the real `youtube-nocookie.com` iframe — the click is
 * the user's informed action ("2-Klick-Lösung"), so no cookie banner is needed.
 */
export const defaults = {
  // Class on the wrapper <div> around <lite-youtube>.
  embedClass: "youtube-embed",

  // Optional page→lang resolver for localized strings. Receives the
  // Eleventy page object; defaults to the project's languages detection.
  langForPage: null,

  // Iframe player parameters.
  // - `youtube-nocookie.com` is always used (the regular host is never emitted).
  // - recommendSelfOnly -> rel=0, modestBranding -> modestbranding=1,
  //   startTime -> start=<sec> (URL ?t=/&start= wins when present).
  // - `params` is appended verbatim for anything else (e.g. "loop=1").
  noCookie: true,
  recommendSelfOnly: false,
  modestBranding: false,
  startTime: null,
  params: "",

  // Title on the facade (also used for the iframe/play-label a11y text).
  // titleOptions.download fetches the real video title via YouTube oEmbed at
  // build time (eleventy-fetch cached); falls back to `title` on failure.
  title: "Embedded YouTube video",
  titleOptions: {
    download: false,
    cacheDuration: "5m",
  },

  // aria/play label on the facade button. String or per-locale map
  // { en: "…", default: "…" } resolved against the page's lang.
  playLabel: "Play",

  // Short privacy notice rendered over the poster. String, per-locale map
  // { <lang>: "…", default: "…" }, or false/"" to disable. Resolved per page.
  disclaimer: {
    default:
      "Playing this video loads content from YouTube (Google) and sends data about you to Google.",
    fr: "La lecture de cette vidéo charge du contenu YouTube (Google) et transmet des données vous concernant à Google.",
  },

  // Poster (facade background) resolution + optimization.
  poster: {
    // Ordered thumbnail candidates tried against i.ytimg.com at build time
    // (HEAD probe, first hit wins). i.ytimg returns HTTP 404 with a 1 KB
    // placeholder body for missing sizes — status is enough, no body needed.
    //  maxresdefault 1280x720 | hq720 1280x720 | sddefault 640x480 |
    //  hqdefault 480x360 (always exists) | mqdefault 320x180 | default 120x90
    qualities: [
      "maxresdefault",
      "hq720",
      "sddefault",
      "hqdefault",
      "mqdefault",
      "default",
    ],
    // "jpg" (vi/) or "webp" (vi_webp/) for the source candidates. The emitted
    // file still goes through the image pipeline's own `formats` afterwards.
    format: "jpg",
    // Per-candidate HEAD timeout.
    timeoutMs: 8000,
    // eleventy-fetch cache for the downloaded winner + processed variants.
    cacheDuration: "30d",
    // eleventy-img options merged over the project's imageTransformOptions —
    // same pipeline as regular images. Defaults below emit one optimized
    // variant at the source's natural width.
    imageOptions: {
      widths: ["auto"],
      // The bg-image URL prefers the first listed format (webp when present).
      formats: ["webp", "auto"],
    },
    // CSS applied to every background layer (object-fit/-position equivalents).
    position: "center",
    size: "cover",
  },

  // Vendored lite-youtube-embed assets inlined once per page that has embeds
  // (upstream defaults — self-hosted, no CDN). `path` only used when
  // inline:false to link an external copy instead.
  lite: {
    css: {
      enabled: true,
      inline: true,
      path: "https://cdn.jsdelivr.net/gh/paulirish/lite-youtube-embed@0.3.3/src/lite-yt-embed.min.css",
    },
    js: {
      enabled: true,
      inline: true,
      path: "https://cdn.jsdelivr.net/gh/paulirish/lite-youtube-embed@0.3.3/src/lite-yt-embed.min.js",
    },
    // `js-api` attribute on <lite-youtube> (uses the YT iframe API on click —
    // only needed if controlling the player from page JS).
    jsApi: false,
    // Adds `.embedClass lite-youtube{max-width:100%}` (component is 720px max).
    responsive: false,
  },
};

// Facade-specific rules appended after the vendored lite-yt-embed css in the
// same inline <style> (emitted once per page, before the first embed).
// `.cms-preview` only exists inside the Sveltia preview iframe — there the
// facade is decorative (no component upgrade), so the cursor says so.
export const facadeCss = `
lite-youtube .yt-embed-disclaimer{position:absolute;left:0;right:0;bottom:0;margin:0;padding:.45em .8em;font:500 .8rem/1.35 system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.62);pointer-events:none}
lite-youtube.lyt-activated .yt-embed-disclaimer{display:none}
.cms-preview lite-youtube{cursor:not-allowed}
`;
