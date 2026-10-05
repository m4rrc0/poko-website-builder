# private-embed

GDPR-friendly third-party embeds for Eleventy — a `{% embed %}` shortcode
that dispatches on the URL's host to a per-provider *lite* facade
(`<lite-youtube>`, `<lite-vimeo>`), plus an optional bare-URL output
transform.

## The problem it solves

A plain `youtube.com/embed` iframe sets tracking cookies and sends the
visitor's IP to Google the moment the page renders — consent required.
`youtube-nocookie.com` removes the cookies but still transmits the IP on
load, writes to `localStorage`, and reports watch telemetry once playing.
Any facade that points `background-image` at `i.ytimg.com` — including
`lite-youtube-embed` itself — still leaks the IP *before* the user decided
anything.

This plugin renders a **fully local facade**: the poster is resolved and
downloaded **at build time**, optimized through the same `eleventy-img`
pipeline as regular images, layered over a tiny base64 LQIP — the same
two-layer technique as the `{% image %}` shortcode. On page load there are
**zero third-party requests**: no cookies, no storage writes, no IP leak, so
no cookie banner is needed. On click, the lite component swaps in the real
iframe — the click is the user's informed action (the "2-Klick-Lösung"
widely used by German sites such as heise), which the disclaimer line on the
poster makes explicit.

## Usage

### The `{% embed %}` shortcode (primary UX)

```njk
{% embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" %}
{% embed url="https://youtu.be/jNQXAC9IVRw", class="my-class flow-space-xl" %}
{% embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s" %}
{% embed url="https://vimeo.com/76979871" %}
```

Recognized arguments (all optional but `url`; the shape is a plain options
object so new attrs can be added without breaking the signature):

| arg | where it lands |
|---|---|
| `url` | required — provider dispatched on host (`youtube.com`/`youtu.be`, `vimeo.com`/`player.vimeo.com`) |
| `class` | merged onto the wrapper `<div class="embed {provider}-embed …">` — utility classes and free classes alike |
| `id` | `id` on the wrapper div |
| `title` | overrides the build-time video title (facade title bar + iframe a11y title) |
| `playLabel` | play button label — string or `{ <lang>: …, default: … }` |
| `start` | seconds — player `start=`/`t=` (the URL's own `?t=` wins over this arg, which wins over the `startTime` option) |
| `params` | appended to the iframe query |
| `attrs` | raw string appended inside the `<lite-*>` tag — escape hatch for future attributes |

The CMS "Embed" editor component (`embedShortcode` in
`defaultEditorComponents.js`) writes exactly this shape; its utility-class
picker merges chosen utility tokens into `class` when serializing.

### Optional bare-URL transform

With `transform: true` (default), provider URLs standing alone in a `<p>`
— what markdown makes of a pasted link — are rewritten to facades:

```js
eleventyConfig.addPlugin(privateEmbed, { transform: true });
```

Set `transform: false` to rely on `{% embed %}` only, or register it
manually anywhere in the config:

```js
import privateEmbed, { attachUrlTransform } from "./plugins/private-embed/index.js";
eleventyConfig.addPlugin(privateEmbed, { transform: false });
attachUrlTransform(eleventyConfig); // optional same-options object
```

The transform matches `watch?v=`, `/embed/`, `/shorts/`, `/live/`,
`youtu.be/`, `vimeo.com/<id>` and `player.vimeo.com/video/<id>` (protocol and
`<a>` wrapper optional). Playlists are **not** supported by lite facades
(same as upstream): the URL stays a plain link and a build warning is logged.

## What it emits

```html
<div class="embed youtube-embed my-class">
  <lite-youtube videoid="dQw4w9WgXcQ" playlabel="Play"
    title="Rick Astley - Never Gonna Give You Up" params="start=42"
    style="background-image:url('/assets/images/yt-dQw4w9WgXcQ-1280w.webp'),url('data:image/webp;base64,…');background-size:cover,cover;…">
    <div class="lyt-playbtn lty-playbtn"></div>
    <p class="embed-disclaimer">Playing this video loads content from YouTube…</p>
  </lite-youtube>
</div>
```

- `title` comes from the provider (YouTube oEmbed / Vimeo `api/v2`), fetched
  **server-side at build time** when `titleOptions.download` is on.
- The poster background has two layers: the optimized local file, then the
  tiny inline base64 shown while it loads — built with the same helpers as
  the image shortcode (`tinyDataUri` + `bgCssFor` in
  `src/config-11ty/shortcodes/components/image.js`).
- The lite element always gets a `background-image`: with it unset both
  runtimes fetch their provider's thumbnail at runtime, re-opening the leak.
  If every fetch fails the facade still emits a local dark tile.
- Multiple embeds on one page share a single poster pipeline run per video.

## Once-per-page assets via the bundle plugin

Runtime css/js is pushed into the page's `css`/`js` bundles
(`getBundleManagers().addToPage`) — the same mechanism the image shortcode
uses for LQIP preloads:

- shared facade rules (disclaimer overlay, `.cms-preview` cursor) → `css`
  bundle, inline head `<style>` — once per page for all providers;
- provider css (lite-yt) → `css` bundle — once per provider per page;
- provider js → `js` bundle `defer` bucket → the external
  `assets/js/*-defer.js` file — once per provider per page.

If no bundle managers are wired (e.g. a minimal config), the plugin falls
back to emitting `<style>`/`<script>` once before the first embed of the
page — same once-per-page guarantee either way.

## Providers

| | youtube | vimeo |
|---|---|---|
| element | `<lite-youtube>` | `<lite-vimeo>` |
| runtime | `lite-youtube-embed` npm pkg | vendored `providers/lite-vimeo.js` — `lite-vimeo-embed@0.3.0` with two patches: the runtime `vimeo.com/api/v2` thumbnail fetch only fires when no `background-image` is preset (same contract as lite-yt), and a `params` attr is appended to the iframe URL |
| poster source | `i.ytimg.com` ordered cascade `maxresdefault → hq720 → sddefault → hqdefault → mqdefault → default` (HEAD-probed; first 200 wins — 404s carry a 120×90 placeholder body so status alone is the check) | `vimeo.com/api/v2/video/<id>.json` → `thumbnail_large` resized `-d_1280x720` (one cached call also yields the title) |
| iframe | `youtube-nocookie.com/embed` (always) | `player.vimeo.com/video` + `dnt=1` by default |

Adding a provider = one file in `providers/` exporting
`{ name, element, filePrefix, playBtnClass, activatedClass, bareUrlPattern,
parseUrl, posterRemote, title, attrs, assets }` — the emit/bundle/poster
machinery is shared. Unknown hosts stay plain links with a build warning.

## Options

Defaults shown; all keys optional (`deepmerge`, arrays replace).

```js
eleventyConfig.addPlugin(privateEmbed, {
  transform: true,               // optional bare-URL transform
  embedClass: "embed",           // -> "embed youtube-embed" / "embed vimeo-embed"
  langForPage: null,             // (page) => "fr" override

  disclaimer: {                  // string | {lang: text, default: …} | false
    default: "Playing this video loads content from {service} and sends data about you to them.",
    fr: "La lecture de cette vidéo charge du contenu {service} et transmet des données vous concernant.",
  },

  poster: {                      // shared eleventy-img pipeline
    timeoutMs: 8000,
    cacheDuration: "30d",
    imageOptions: { widths: ["auto"], formats: ["webp", "auto"] },
    position: "center",
    size: "cover",
  },

  providers: {
    youtube: {
      service: "YouTube (Google)",
      playLabel: "Play",
      title: "Embedded YouTube video",
      titleOptions: { download: false, cacheDuration: "5m" },
      qualities: ["maxresdefault", "hq720", "sddefault", "hqdefault",
                  "mqdefault", "default"],
      format: "jpg",
      recommendSelfOnly: false,  // rel=0
      modestBranding: false,     // modestbranding=1
      startTime: null,
      params: "",
      lite: { css: { enabled: true }, js: { enabled: true }, jsApi: false },
    },
    vimeo: {
      service: "Vimeo",
      playLabel: "Play video",
      title: "Embedded Vimeo video",
      titleOptions: { download: false },
      params: "dnt=1",
    },
  },
});
```

## i18n

`playLabel` and `disclaimer` accept a string or `{ <lang>: text, default:
fallback }` map; `{service}` in the disclaimer interpolates the provider's
display name. Page lang resolves from `filePathStem` via the same
`defaultPrefixRegex` rule as `eleventyComputed.lang` (override with
`langForPage`).

## CMS

- `{% embed %}` is an editor component (`embedShortcode`, auto-listed in
  every richtext field) — fields: url, title, advanced (utility-class
  picker, class, id, start, params, raw attrs).
- Preview renders a facade-shaped placeholder (no network work); the facade
  css also ships `.cms-preview lite-youtube, .cms-preview lite-vimeo {
  cursor: not-allowed }` for real-element previews.

## Privacy notes

- **Load**: zero third-party requests, zero cookies, zero storage writes.
- **Click/hover**: the lite runtimes preconnect on hover and load
  `youtube-nocookie.com` / `player.vimeo.com` + telemetry on play — no
  cookies on the nocookie domain, and `dnt=1` opts out of Vimeo tracking,
  but IP + watch data still reach the provider after the click (hence the
  disclaimer, which is what makes the click count as consent).
- Keep the disclaimer text linked to a privacy-policy mention of video
  embeds on the site's privacy page.
