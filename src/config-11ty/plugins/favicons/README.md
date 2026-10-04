# eleventy favicons plugin

One image in → the current minimal favicon set out. Drop a source image in the
CMS (or point the plugin at any yaml data file) and the build emits:

| Output | From | Notes |
| ------ | ---- | ----- |
| `favicon.ico` | any source | stacked `icoSizes` (16/32/48 default); rasterizes SVG via sharp density scaling |
| `favicon.svg` | SVG sources only | **verbatim copy** — an SVG authored with an embedded `@media (prefers-color-scheme: dark)` style block keeps working untouched. Never fabricated from raster. |
| `apple-touch-icon.png` | raster/SVG | 180×180, icon contained in a centered 140×140 area with background padding |
| `icon-192.png`, `icon-512.png` | raster/SVG | web-manifest icons |
| `icon-mask-512.png` | raster/SVG | `purpose: "maskable"`; extra padding so the icon stays inside the 409px safe-zone circle |
| `manifest.webmanifest` | manifest fields | emitted only when `name`/`short_name` + at least one icon exist |
| dark variants (`favicon-dark.*`, `icon-dark-*.png`) | `dark:` sources | emitted only when dark sources are uploaded; wired via `media="(prefers-color-scheme: dark)"` links |

## Rules

- **Never upscales.** A slot is skipped (with a warning) when no provided source
  reaches its size — a 400px source yields `icon-192.png` but not `icon-512.png`.
  SVG sources qualify for every slot.
- **Non-square sources are centered and letterboxed** onto a square canvas
  (`fit: contain`, transparent by default, configured bg for apple/maskable).
- **Source priority per slot**: the slot's own override → other overrides
  nearest above the target size → `touchIcon` → `favicon`. Dark slots only
  consume `dark:` sources; light slots never consume dark ones.
- All output is written directly into the output dir (root or `iconsSubdir`) —
  no Eleventy passthrough involved, no same-build copy race. PNG emission goes
  through eleventy-img so unchanged sources are skipped by its content cache.
  `favicon.ico` internals use dry-run buffers — no stray PNGs on disk.

## Usage

```js
// eleventy.config.js
import faviconsPlugin from "./src/config-11ty/plugins/favicons/index.js";

eleventyConfig.addPlugin(faviconsPlugin, {
  inputDir: WORKING_DIR_ABSOLUTE,   // content root for CMS-style paths
  outputDir: OUTPUT_DIR_ABSOLUTE,   // site output root
  manifestData: { name: SITE_NAME } // defaults merged under the yaml values
});
```

```njk
{# in your <head> partial — emits all <link>/<meta> tags, or nothing #}
{% favicons %}
```

## Data file (`_data/webmanifest.yaml` by default)

```yaml
favicon: /_files/icons/logo.svg      # main icon — SVG or raster
touchIcon: /_files/icons/icon.png    # main raster (≥512×512 recommended)

manifest:                            # web-app manifest fields
  name: My Site
  short_name: Site
  description: …
  display: standalone                # standalone | fullscreen | minimal-ui | browser
  start_url: /                       # defaults to the path prefix
  theme_color: "#ffffff"
  background_color: "#ffffff"        # also feeds apple/maskable padding bg
  lang: en
  dir: ltr

sources:                             # optional per-slot overrides
  iconSvg: /_files/icons/mark.svg
  apple180: /_files/icons/apple.png
  icon192: /_files/icons/icon-192.png
  icon512: /_files/icons/icon-512.png
  maskable512: /_files/icons/maskable.png

dark:                                # optional dark-theme variants
  favicon: /_files/icons/logo-dark.svg
  touchIcon: /_files/icons/icon-dark.png
  theme_color: "#000000"             # adds a dark theme-color <meta>
  sources: { icon192: /_files/icons/icon-dark-192.png, icon512: /_files/icons/icon-dark-512.png }
```

## Options

| Option | Default | Purpose |
| ------ | ------- | ------- |
| `dataFile` | `_data/webmanifest.yaml` | yaml file holding the fields above |
| `inputDir` | `eleventyConfig.dir.input` | content root for CMS-style `/_files/…` paths; absolute fs paths also accepted |
| `outputDir` | `eleventyConfig.dir.output` | where generated files are written |
| `urlPrefix` | `eleventyConfig.pathPrefix` | URL prefix baked into links + manifest srcs (GitHub Pages project sites, etc.) |
| `iconsSubdir` | `""` | subdirectory under `outputDir` for `icon-*.png` (auto-fetch files always stay at root) |
| `manifestUrl` | `/manifest.webmanifest` | output path + link href for the manifest |
| `manifestData` | `{}` | manifest field defaults, overridden by the yaml |
| `emitMaskable` | `true` | emit the maskable 512 slot |
| `icoSizes` | `[16, 32, 48]` | PNG sizes stacked inside `favicon.ico` |
| `appleIconPadding` | `20` | px of background padding inside the 180px apple tile |
| `appleIconBg` | `manifest.background_color` → white | padding background |
| `maskablePadding` | `51` | px padding inside the 512px maskable tile (≈ safe zone) |
| `maskableBg` | `manifest.background_color` → transparent | padding background |
| `shortcodeName` | `"favicons"` | the shortcode name used in templates |

## Generated markup example

```html
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#ffffff">
```

Explicit `sizes` on the ICO link (never `any`) keeps Chrome preferring the SVG;
the manifest is omitted entirely when `name`/`short_name` aren't provided.

## Dependencies

`@11ty/eleventy-img`, `sharp`, `js-yaml`, `png-to-ico`.
