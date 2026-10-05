# youtube-facade

GDPR-friendly YouTube embeds for Eleventy — a drop-in replacement for
`eleventy-plugin-youtube-embed`'s `lite` mode that removes the last remaining
third-party contact at page load: the remote `i.ytimg.com` poster.

## The problem it solves

A plain `youtube.com/embed` iframe sets tracking cookies and sends the
visitor's IP to Google the moment the page renders — consent required.
`youtube-nocookie.com` removes the cookies but still transmits the IP on
load (iframe + fonts + attestation), writes to `localStorage`, and reports
watch telemetry once playing. Any facade that points `background-image` at
`i.ytimg.com` — including `lite-youtube-embed` — still leaks the IP too,
*before* the user has decided anything.

This plugin renders a **fully local facade**: the poster is probed and
downloaded **at build time**, optimized through the same `eleventy-img`
pipeline as regular images, layered over a tiny base64 LQIP — the same
two-layer technique as the `{% image %}` shortcode. On page load there are
**zero third-party requests**: no cookies, no storage writes, no IP leak, so
no cookie banner is needed. On click, `lite-youtube` swaps in a
`youtube-nocookie.com` iframe — the click is the user's informed action
(the "2-Klick-Lösung" widely used by German sites such as heise), which the
disclaimer line on the poster makes explicit.

## What it emits

For each bare YouTube URL in a page (markdown renders them as `<p>link</p>`):

```html
<style>/* vendored lite-yt-embed.css + facade rules — once per page */</style>
<script>/* vendored lite-yt-embed.js — once per page */</script>
<div id="dQw4w9WgXcQ" class="youtube-embed">
  <lite-youtube videoid="dQw4w9WgXcQ" playlabel="Play"
    title="Rick Astley - Never Gonna Give You Up" params="rel=0"
    style="background-image:url('/assets/images/yt-dQw4w9WgXcQ-1280w.webp'),url('data:image/webp;base64,…');background-size:cover,cover;…">
    <div class="lyt-playbtn lty-playbtn"></div>
    <p class="yt-embed-disclaimer">Playing this video loads content from YouTube…</p>
  </lite-youtube>
</div>
```

- `title` comes from YouTube's oEmbed endpoint, fetched server-side at build
  time when `titleOptions.download` is on (the browser never calls it).
- The poster background has two layers: the optimized local file, then the
  tiny inline base64 shown while it loads — built with the same helpers as
  the image shortcode (`tinyDataUri` + `bgCssFor` in
  `src/config-11ty/shortcodes/components/image.js`).
- `lite-youtube` always gets a `background-image`: with it unset the
  component fetches `i.ytimg.com` itself at runtime, which would re-open the
  leak. If every fetch fails the facade still emits a local dark tile.
- Supported URL forms: `youtube.com/watch?v=`, `/embed/`, `/shorts/`,
  `/live/`, `youtu.be/` (protocol optional, inside `<p>` with or without an
  `<a>` wrapper — the upstream pattern, extended).
- Playlists are **not** supported by lite embeds (same as upstream): the
  URL stays a plain link and a build warning is logged.

## Options

Defaults shown; all keys optional (`deepmerge`, arrays replace).

```js
eleventyConfig.addPlugin(youtubeFacade, {
  embedClass: "youtube-embed",          // wrapper <div> class

  // player params forwarded to <lite-youtube params="…">
  noCookie: true,                        // youtube-nocookie host (always)
  recommendSelfOnly: false,              // -> rel=0
  modestBranding: false,                 // -> modestbranding=1
  startTime: null,                       // -> start=<sec> (URL ?t= wins)
  params: "",                            // appended verbatim, e.g. "loop=1"

  // facade title bar / iframe a11y title
  title: "Embedded YouTube video",
  titleOptions: { download: false, cacheDuration: "5m" },

  playLabel: "Play",                     // string or { <lang>: "…", default: "…" }
  disclaimer: {                          // string | locale map | false
    default: "Playing this video loads content from YouTube (Google) and sends data about you to Google.",
    fr: "La lecture de cette vidéo charge du contenu YouTube (Google) et transmet des données vous concernant à Google.",
  },

  langForPage: null,                     // (page) => "fr" override; default
                                         // detects via project's languages

  poster: {
    qualities: ["maxresdefault", "hq720", "sddefault", "hqdefault",
                "mqdefault", "default"], // ordered cascade, first hit wins
    format: "jpg",                       // source dir vi/ ("webp" -> vi_webp/)
    timeoutMs: 8000,                     // per-candidate HEAD probe
    cacheDuration: "30d",                // eleventy-fetch cache for the source
    imageOptions: {                      // merged over imageTransformOptions
      widths: ["auto"],
      formats: ["webp", "auto"],         // first listed = bg layer format
    },
    position: "center",                  // CSS for every bg layer
    size: "cover",
  },

  lite: {                                // vendored runtime, once per page
    css: { enabled: true, inline: true, path: "<cdn css url>" },
    js:  { enabled: true, inline: true, path: "<cdn js url>" },
    jsApi: false,                        // `js-api` attr (YT iframe API)
    responsive: false,                   // lite-youtube{max-width:100%}
  },
});
```

## Poster cascade

`i.ytimg.com/vi/<id>/<quality>.jpg` answers **HTTP 404** (with a 120×90
placeholder body) for sizes a video doesn't have — e.g. a 2005-era 240p
upload has no `maxresdefault`. Each candidate is HEAD-probed top-down and
the first hit wins; the whole result is memoized per video per build, and
the download is cached by `eleventy-fetch` for `cacheDuration`.

| file | size | aspect | availability |
|---|---|---|---|
| `maxresdefault` | 1280×720 | 16:9 | HD uploads only |
| `hq720` | 1280×720 | 16:9 | most HD uploads |
| `sddefault` | 640×480 | 4:3 | most |
| `hqdefault` | 480×360 | 4:3 | **always** |
| `mqdefault` | 320×180 | 16:9 | always |
| `default` | 120×90 | 4:3 | always |

The winner is passed through `Image(remoteUrl, imageTransformOptions +
poster.imageOptions)` — same pipeline, output dir and URL path as every
other image (`/assets/images/yt-<id>-<w>w.<fmt>`), so it ships optimized
webp (+auto) with the LQIP layer on top.

## i18n

`playLabel` and `disclaimer` accept a string or `{ <lang>: text, default:
fallback }`. The page lang is resolved from `filePathStem` with the same
`defaultPrefixRegex` rule as `eleventyComputed.lang` (override with
`langForPage`). A `false`/`""` disclaimer emits no overlay element.

## CMS preview

The facade is decorative inside the Sveltia preview (`lite-youtube` markup
isn't upgraded there) — the shipped CSS adds
`.cms-preview lite-youtube { cursor: not-allowed }` so the editor sees the
poster is not clickable. Preview sanitization may still strip custom
elements entirely, in which case the raw URL/link shows — acceptable: the
site build is what emits the facade.

## Privacy notes

- **Load**: zero third-party requests, zero cookies, zero storage writes.
- **Click/hover**: the component preconnects to Google on hover and loads
  `youtube-nocookie.com` + `googlevideo.com` + stats endpoints on play —
  no cookies are ever set on the nocookie domain, but IP + watch telemetry
  still reach Google after the click (hence the disclaimer).
- Keep the disclaimer text linked to a privacy policy mention of YouTube
  embeds in the site's privacy page.
