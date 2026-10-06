// Shared facade rules — always emitted with the first embed of a page
// (into the "css" bundle when bundle managers are wired, else inline).
export const facadeCss = `lite-youtube .embed-disclaimer,lite-vimeo .embed-disclaimer{position:absolute;left:0;right:0;bottom:0;margin:0;padding:.45em .8em;font:500 1rem/1.35 system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.8);pointer-events:none;text-align:center;text-wrap:balance}
lite-youtube.lyt-activated .embed-disclaimer,lite-vimeo.ltv-activated .embed-disclaimer{display:none}
.cms-preview lite-youtube,.cms-preview lite-vimeo{cursor:not-allowed}`;

export const defaults = {
  // Optional output transform: bare provider URLs in <p> become facades.
  // Set false to rely on the {% embed %} shortcode only (the manual path),
  // or register it yourself via the `attachUrlTransform` named export.
  transform: true,

  // Wrapper <div> class — emitted as `${embedClass} ${provider}-embed`.
  embedClass: "embed",

  // (page) => "fr" override; default detects lang from filePathStem like
  // eleventyComputed.lang does.
  langForPage: null,

  // `{service}` interpolates the provider's display name ("YouTube (Google)",
  // "Vimeo"). String | { <lang>: text, default: fallback } | false to disable.
  disclaimer: {
    default:
      "Playing this video loads content from {service} and sends data about you to them.",
    fr: "La lecture de cette vidéo charge du contenu {service} et transmet des données vous concernant.",
  },

  // Shared poster pipeline (eleventy-img — same options as regular images).
  poster: {
    timeoutMs: 8000, // per remote availability probe
    cacheDuration: "30d", // eleventy-fetch cache for the source download
    imageOptions: { widths: ["auto"], formats: ["webp", "auto"] },
    position: "center", // CSS background-position for every bg layer
    size: "cover",
  },

  providers: {
    youtube: {
      service: "YouTube (Google)",
      playLabel: "Play",
      title: "Embedded YouTube video",
      titleOptions: { download: false, cacheDuration: "5m" },
      // Ordered poster cascade — first i.ytimg.com size that HEAD-200s wins.
      qualities: [
        "maxresdefault",
        "hq720",
        "sddefault",
        "hqdefault",
        "mqdefault",
        "default",
      ],
      format: "jpg", // source dir vi/ ("webp" -> vi_webp/)
      // player params forwarded to the youtube-nocookie iframe
      recommendSelfOnly: false, // -> rel=0
      modestBranding: false, // -> modestbranding=1
      startTime: null, // -> start=<sec> (URL ?t= wins, then arg)
      params: "",
      lite: { css: { enabled: true }, js: { enabled: true }, jsApi: false },
    },
    vimeo: {
      service: "Vimeo",
      playLabel: "Play video",
      title: "Embedded Vimeo video",
      titleOptions: { download: false },
      // Appended to the player.vimeo.com iframe URL — dnt=1 is Vimeo's
      // Do-Not-Track flag.
      params: "dnt=1",
    },
  },
};
