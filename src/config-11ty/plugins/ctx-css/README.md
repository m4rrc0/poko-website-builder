# ctx-css

Style tokens → generated CSS for the ctx.css pipeline.

`ctx-css` reads the brand/style configuration from a project's `_data`,
normalizes it against defaults, compiles it into CSS custom properties +
context classes, and delivers it to the page (inline, as a file, or via a
stylesheet import). It is the single home for everything the ctx.css
methodology needs that the hand-written `src/styles/ctx/*.css` engine files
deliberately leave to project config: **tokens, palettes, color profiles,
widths, font stacks, type scales, spaces and borders**.

## File map

| File           | Runtime | Role |
| -------------- | ------- | ---- |
| `load.js`      | Node    | Reads `_data/brand/*.yaml` + legacy `_data/brand.yaml`, merged per key (files win). |
| `resolve.js`   | Pure    | Normalizes the merged object → `ctxData`. Fallback chain per section: **`_data/brand/*.yaml` → `_data/brand.yaml` → defaults**. Shared with the CMS preview (`browser-env.js` → `deriveEnv`). |
| `transform.js` | Pure    | Compiles `ctxData` → CSS text + per-section pieces. Shared the same way. |
| `emit.js`      | Node    | Minification/file output helpers. |
| `defaults.js`  | Pure    | Default values + element enums — also imported by the CMS schema. |
| `index.js`     | Node    | Plugin registration: global data, `ctxCss` shortcode, emission. |

## Configuration

Register in `eleventy.config.js`:

```js
import ctxCss from "./src/config-11ty/plugins/ctx-css/index.js";

eleventyConfig.addPlugin(ctxCss, {
  // dataDir: WORKING_DIR_ABSOLUTE, // directory holding `_data/`
  // emit: undefined,               // "inline" | "file" | "import" — default:
                                 // inline when `inlineAllStyles`, else "file"
  // filename: "ctx-brand.css",     // emit: "file" output (assets/styles/)
  // importPath: "_styles/_ctx.css",// emit: "import" target inside dataDir
  // minify: MINIFY,
});
```

## Data model — `_data/brand/*.yaml`

Brand config splits `brand.yaml` into per-section files under `_data/brand/`.
**Each file wraps its content under a key** (required: the CMS `file:` entries
and the `relation` fields' `value_field` paths need a keyed root — Sveltia's
`root: true` bare lists are rejected for that reason):

```yaml
# _data/brand/colors.yaml
colors:
  - name: black
    value: "#000001"
```

| File                 | Wraps | Content |
| -------------------- | ----- | ------- |
| `settings.yaml`      | object | `ctxCssImport`, `inlineAllStyles`, `styleContexts` |
| `colors.yaml`        | `colors:` | `[{name, value}]` — raw color tokens → `--{name}` |
| `palettes.yaml`      | `palettes:` | `[{name, read, neutral, pop, tone, extras?}]` |
| `colorProfiles.yaml` | `colorProfiles:` | `[{name, <intent keys>}]` |
| `spaces.yaml`        | object | `widthsContexts`, `px`, `py`, `gap`, `flow`, `offsets` |
| `borders.yaml`       | object | `radius`, `thick`, `borderStyle` |
| `typeScales.yaml`    | `typeScales:` | fluid type scale definitions |
| `fontStacks.yaml`    | `fontStacks:` | font stack contexts |
| `customFonts.yaml`   | `customFonts:` | custom font imports |

Resolution is **per section**: `_data/brand/<file>` → legacy `brand.yaml` key →
built-in default. A project can migrate one section at a time — e.g. only
`colors.yaml` + `palettes.yaml` exist while `typeScales` stays in `brand.yaml`.

Spacing/border maps (`spaces.*`, `borders.*`) merge **per element key** over
the defaults — set only the elements you override. Emit names are
`--px-{el}`, `--py-{el}`, `--gap-{el}`, `--flow-{el}`, `--offset-{el}`,
`--radius-{el}`, `--thick-{el}`, `--border-style-{el}` for the element enums in
`defaults.js` (mirroring `src/styles/ctx/18_foundation.css`).

## Color model

Four layers (see `src/styles/ctx/34_colors.css` + `AGENTS.md`):

1. **Tokens** — `colors[]` → `--{name}`.
2. **Palette bindings** — palette role keys (`read`, `neutral`, `pop`, `tone`)
   → `--color-{role}-palette`; palette `extras: [{name, color}]` →
   `--color-{name}-palette` (custom named palette colors).
3. **Slots** — `--color-{role}`: the active permutation. The identity reset and
   `palette--*` variants ship in `34_colors.css` (engine CSS, not generated).
4. **Intents** — `--color-{key}`: semantic vars consumed by element CSS.

Palettes emit on `.palette-{name}` (class list emitted only when > 1 palette;
the first also lands on `:root`). **Legacy flat palettes** keep working: any
non-role key emits `--color-{key}` intents directly (as before); role names
always emit `-palette` bindings.

### Color profiles

A color profile is the intent map (`--color-text`, `--color-bg`, …) that used
to live per-palette or hand-written in project CSS. The first profile emits on

```css
:where(:root, body, [class*="palette"]) { --color-{key}: … }
```

so intents re-resolve in every element's own palette context. Extra profiles
emit `.profile-{name}` — but only when **≥ 2 profiles** are configured (same
"first is default" convention as the other contexts). The intended use: define
one global profile, switch `.palette-*` per section, apply `.profile-*` only
for exceptions — per-palette overrides can still ride in project CSS.

Profile leaf values resolve in order:

1. `read|neutral|pop|tone` → `var(--color-{role})` (the **slot**, so
   `palette--*` permutations apply),
2. a palette `extras` name → `var(--color-{name}-palette)`,
3. any other bare identifier → `var(--{name})` (a color token),
4. anything else → verbatim — the CMS `select-other` fields accept raw CSS
   (e.g. `rgb(from var(--color-read) r g b / 0.5)`, `var(--black)`).

## Generated output

`:root` block, in order: widths context #0 → font stacks #0 → type scale #0 →
color tokens → spaces → borders → palette #0. Then the default profile map,
then the context classes `.ctx-*` (always) / `.widths-*` / `.fonts-*` /
`.type-scale-*` (when > 1), `.palette-*`, `.profile-*`.

## Delivery modes

| Mode      | `{% ctxCss %}` emits | Mechanism |
| --------- | -------------------- | --------- |
| `inline`  | `<style>`            | default when `inlineAllStyles` — the head partial injects `ctxBrandCss` inside the shared inline `<style>` between ctx.css and the UnoCSS block. |
| `file`    | `<link>`             | writes `assets/styles/ctx-brand.css` (a virtual template). |
| `import`  | `<!-- -->`           | writes `${dataDir}/_styles/_ctx.css`; reference it with `@import "_ctx.css";` in any project `_styles/*.css` — bundled+minified by `buildExternalCSS`. |

`ctxCssImport` (`settings.yaml` or legacy `brand.yaml`) gates the engine
`ctx.css` link/inline independently.

## Takeover action plan

ctx-css progressively absorbs style data→CSS responsibilities scattered across
the codebase. Tracked here — each step keeps the old path working until the project
data has a documented migration.

- [x] `load.js` + `resolve.js` — `_data/brand/*.yaml` + `brand.yaml` + defaults
      merged per key (`deriveEnv` delegates here).
- [x] `transform.js` — replaces `src/utils/transformStyles.js` for brand
      styles (spaces/borders/profiles added; palette role-exact match;
      `max` → `--width-page` bridge).
- [x] Emission — `ctxBrandCss` global data + `{% ctxCss %}` shortcode; brand
      block removed from the UnoCSS preflight.
- [x] CMS split — `stylesConfig` file collection split into per-section files.
- [ ] **Preview parity polish** — `previewData` glob merge now replaces arrays
      (was concat); verify relation options inside new file entries render.
- [ ] `ctxCssImport` filename option (legacy object form
      `{filename: "_ctx.css"}`) — currently only the boolean is supported.
- [ ] Retire: `src/config-11ty/plugins/ctxCss/` (dead stub),
      `src/utils/transformStyles.js` brand helpers (kept meanwhile for
      font/type-scale shared code), `brandStyles`/`brandRootStyles` env
      exports (aliases of `ctxCssText`), the commented profile block in
      `34_colors.css`.
- [ ] `.profile-*`/`palette-*` picker hardening once the relation-keyed object
      field (below) exists.

## Future directions (documented, not implemented)

### Dark color scheme counterparts in palettes

Optional `dark` counterpart per palette color role — e.g. `read`, `read-dark`
→ `--color-read-palette` + `--color-read-dark-palette` (or a nested
`dark: {read, neutral, pop, tone}` block). Together with a
`prefers-color-scheme` (and/or `.dark` class) switch, the pipeline can emit
the dark profile automatically and ship a theme switcher. Open points to
settle: whether dark values are a second role map per palette or a second
palette auto-derived; how profiles reference dark counterparts
(`--color-*-dark` parallel vars vs re-emission under a media query); naming.

### Relation-keyed object CMS field

A custom field widget: an **object whose keys come from a relation** (values
of another list field), plus an optional **fallback key list** when the
related list is empty/null. Use cases:

- Palette colors: keys = `colors[].name` (or palette slot names), so palettes
  can carry custom keys without overloading the UX — the reason `extras` is a
  simple list for now.
- Possibly the semantic element maps (`body, section, prose, featured, card,
  token, area, button`) in `spaces.yaml`/`borders.yaml`, where the key set
  could come from the element registry instead of hardcoded object fields.

### Utilities

- `--{role}-dark` vars, `.profile-*` and `.palette-*` in the section utility
  picker (`.profile-*` already registered), `styleContexts` usefulness review.
