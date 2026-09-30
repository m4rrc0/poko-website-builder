// Catalog of selectable utility classes backing the CMS "Utility Classes"
// picker (`utilitiesField`) inside `sectionWrapper`. Classes are grouped by
// intent; every group maps onto one CMS field inside the `utilities` object
// and every selected value emits one or more class names appended to the
// section element's `class` attribute.
//
// Group shape:
//   {
//     name,          // key inside `utilities` (e.g. utilities.spacing)
//     label,         // field label
//     hint?,         // field hint
//     classPrefix?,  // emitted class = classPrefix + value (palette-*)
//     field?,        // widget override (e.g. relation); default is a
//                    // multi-select built from `options`
//     options,       // selectable values; for `classPrefix` groups these are
//                    // the unprefixed values, for plain selects the literal
//                    // class names
//     moreOptions?,  // documented extras NOT offered — move entries into
//                    // `options` to enable them later
//   }
//
// Sources for `moreOptions`/documented families (kept exhaustive so adding
// one back is a copy-paste):
//  - UnoCSS rules in `plugin-eleventy-unocss/rules/` and hand-written CTX CSS
//    in `src/styles/ctx/`. Parameterized families enumerate the token names
//    the rules resolve (`--py-*`, `--px-*`, `--p-*`, `--flow-*`,
//    `--radius-*`, `--width-*`).
//  - Brand-generated classes from `env.config.js`: `palette-{name}` (palette
//    relation), `ctx-{name}`, `widths-{name}`, `fonts-{name}`,
//    `type-scale-{name}` (emitted by `mapStyleStringsToClassDef` — the
//    `*{name}` context classes only exist when > 1 entry is configured).
//  - `general` holds common presetWind4 utilities. NOTE: numeric Tailwind
//    spacing (`p-4`, `mx-2`, …) is intentionally absent — the CTX atom rules
//    `(p|py|…)-(name)` and `(m|my|…)-(name)` match those tokens first and
//    resolve them against `--p-*`/`--py-*` vars, so they do NOT mean
//    Tailwind spacing here.
import {
  brandPalettes,
  brandWidthsContexts,
  brandFontStacksContexts,
  brandTypeScales,
  brandStyleContexts,
} from "../../../../env.config.js";

const humanize = (value) =>
  value
    .replace(/[:]/g, " ")
    .replace(/-+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const opt = (value, label) => ({
  value,
  label: `${label || humanize(value)} (${value})`,
});
const opts = (values) => values.map((v) => opt(v));
// Short label, no `(value)` suffix — for groups where the class name is
// redundant once the value is humanized (e.g. `palette--bg-pop` -> "Pop Bg").
const namedOpts = (pairs) => pairs.map(([value, label]) => ({ value, label }));
// Bare label = the class token itself (e.g. `clickable`) — groups where any
// suffix would just repeat.
const bareOpts = (values) => values.map((v) => ({ value: v, label: v }));

// Token names resolved by the parameterized atom rules (see ctx-atoms.js /
// src/styles/ctx/33_spaces.css). Referenced by `moreOptions` docs only.
const pyNames = [
  "body",
  "section",
  "prose",
  "card",
  "page",
  "featured",
  "area",
  "token",
  "button",
];
const pxNames = [
  "body",
  "section",
  "prose",
  "card",
  "page",
  "featured",
  "token",
  "button",
];
const flowNames = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "media",
  "prose",
  "section",
  "area",
];
const radiusNames = [
  "body",
  "card",
  "featured",
  "prose",
  "round",
  "section",
  "token",
];
const widthNames = [
  "bleed",
  "body",
  "cap",
  "card",
  "column",
  "column-min",
  "featured",
  "footer",
  "inset",
  "max",
  "media",
  "nav",
  "outset",
  "page",
  "prose",
  "screen",
  "section",
  "tile",
  "token",
  "typography",
  "wrap",
];

// Currently configured palette names — option *values* of the palette
// relation (`palettes.*.name` in `stylesConfig/brand`); the emitted class is
// `palette-{name}` via the group's `classPrefix`.
const paletteNames = (brandPalettes || []).map((p) => p.name).filter(Boolean);

// Style-context classes (`.ctx-*` always emitted; `.widths-*`/`.fonts-*`/
// `.type-scale-*` only when more than one entry exists). Documented under
// the `styleContext` group — not offered yet.
const styleContextClasses = [
  ...(brandStyleContexts || []).map((c) => `ctx-${c.name}`),
  ...(brandWidthsContexts?.length > 1
    ? brandWidthsContexts.map((c) => `widths-${c.name}`)
    : []),
  ...(brandFontStacksContexts?.length > 1
    ? brandFontStacksContexts.map((c) => `fonts-${c.name}`)
    : []),
  ...(brandTypeScales?.length > 1
    ? brandTypeScales.map((c) => `type-scale-${c.name}`)
    : []),
];

/**
 * Grouped option catalog. Groups with neither `field` nor non-empty
 * `options` are documentation-only — the field builder skips them.
 *
 * Consumed twice: server-side to build `utilitiesField` for
 * `admin/config.json` (via `section-primitives.js`), and client-side where it
 * is serialized into `/admin/env.js` for `defaultEditorComponents.js`.
 */
export const utilityClassGroups = [
  {
    name: "palette",
    label: "Palette",
    hint: "Applies .palette-{name}. Palettes are configured in Styles Config > Brand > Color Palettes.",
    classPrefix: "palette-",
    field: {
      widget: "relation",
      collection: "stylesConfig",
      file: "brand",
      value_field: "palettes.*.name",
      display_fields: ["palettes.*.name"],
      search_fields: ["palettes.*.name"],
      multiple: false,
      required: false,
      i18n: "duplicate",
    },
    // Values are palette *names* (the relation stores `name`, not the class).
    // Also used to route `palette-{name}` tokens back into this group when
    // parsing an existing class attribute in the inline editor.
    options: paletteNames.map((n) => opt(n, `Palette ${n}`)),
  },
  {
    name: "variant",
    label: "Palette Variant",
    hint: "Palette slot permutations — remix the active palette (see AGENTS.md 'Absolute permutation model').",
    options: namedOpts([
      ["palette--read", "Read"],
      ["palette--pop", "Pop"],
      ["palette--tone", "Tone"],
      ["palette--contrast", "Contrast"],
      ["palette--pop-contrast", "Pop Contrast"],
      ["palette--tone-contrast", "Tone Contrast"],
      ["palette--bg-pop", "Pop Bg"],
      ["palette--bg-tone", "Tone Bg"],
    ]),
    moreOptions: [
      "palette--default",
      "palette--reset",
      "palette--accent",
      "palette--alt",
      "palette--contrast-pop",
      "palette--contrast-tone",
      "palette--light",
      "palette--dark",
      // Positional permutations: `palette--{r|n|p|t|0}×4` (e.g.
      // `palette--nrpt`), generated by the dynamic rule in ctx-colors.js.
    ],
  },
  {
    name: "spacing",
    label: "Spacing",
    options: opts([
      "breathe",
      "no-padding",
      "px-restore",
      "squash",
      "p-card",
      "mx-auto",
    ]),
    moreOptions: [
      "no-flow",
      "reset-w",
      "reset-down-w",
      "m-card",
      ...pyNames.map((n) => `breathe-${n}`),
      ...pyNames.map((n) => `squash-${n}`),
      ...pyNames.map((n) => `py-${n}`),
      ...pxNames.map((n) => `px-${n}`),
      ...pyNames.map((n) => `my-${n}`),
      ...pxNames.map((n) => `mx-${n}`),
      ...flowNames.map((n) => `flow-${n}`),
      // Also available: p-/pb-/pi-/pbs-/pbe-/pis-/pie-{py|px names},
      // m-/mb-/mi-/mbs-/mbe-/mis-/mie-{py|px names}, space:{value}
    ],
  },
  {
    name: "width",
    label: "Width",
    multiple: false,
    options: namedOpts([
      ["width-prose", "Prose"],
      ["width-featured", "Featured"],
      ["width-body", "Body"],
      ["width-outset", "Outset"],
      ["width-section", "Section"],
    ]),
    moreOptions: [
      ...widthNames
        .filter(
          (n) => !["prose", "featured", "body", "outset", "section"].includes(n),
        )
        .map((n) => `width-${n}`),
      "full-bleed",
      ...widthNames.map((n) => `full-bleed-${n}`),
      "full-bleed-before",
      "full-bleed-after",
      "aspect-ratio-1",
      "aspect-ratio-1.5",
      "aspect-ratio-2",
    ],
  },
  {
    name: "typography",
    label: "Text & Typography",
    options: namedOpts([
      ["text-left", "Left"],
      ["text-center", "Center"],
      ["text-right", "Right"],
      ["font-bold", "Bold"],
      ["italic", "Italic"],
      ["uppercase", "Uppercase"],
      ["capitalize", "Capitalize"],
      ["whitespace-nowrap", "Whitespace Nowrap"],
      ["text-balance", "Balanced"],
      ["text-pretty", "Pretty"],
      ["text-wrap", "Wrap"],
    ]),
    moreOptions: [
      "text",
      "lowercase",
      "sub",
      "super",
      "icon",
      "with-icon",
      "external-link-icons",
      "truncate",
      "truncate-lines",
      "truncate-lines-overflow",
      "text-justify",
      "font-medium",
      "font-semibold",
      "not-italic",
      "normal-case",
      "underline",
      "no-underline",
      "line-through",
    ],
  },
  {
    name: "borders",
    label: "Borders & Radius",
    options: opts([
      "border",
      "radius",
      "radius-card",
      "radius-featured",
      "radius-prose",
      "radius-section",
      "radius-token",
      "radius-round",
    ]),
    moreOptions: [
      "radius-body",
      // Positioned variants also exist: radius-{t|r|b|l|tl|tr|bl|br|
      // top|right|bottom|left|top-left|…}-{radius name} — e.g. radius-top-card.
      // border-{name} resolves var(--thick-{name}) — no --thick-* tokens are
      // defined by default, so only bare `border` is offered for now.
    ],
  },
  {
    name: "misc",
    label: "Miscellaneous",
    options: bareOpts(["bleed-bg", "breakout-clickable", "clickable"]),
    moreOptions: [
      "background-overlay",
      "background-shadow",
      "scroll-shadows-horizontal",
      "scroll-shadows-radial-v",
      "scroll-shadows-radial-h",
      "skew-border-before",
      "skew-border-after",
    ],
  },
  {
    name: "general",
    label: "General Purpose",
    options: opts([
      "flex",
      "flex-row",
      "flex-col",
      "flex-wrap",
      "items-start",
      "items-center",
      "items-end",
      "items-baseline",
      "justify-start",
      "justify-center",
      "justify-end",
      "justify-between",
      "justify-around",
      "justify-evenly",
      "grid",
      "block",
      "inline-block",
      "inline",
      "hidden",
      "invisible",
      "visible",
      "relative",
      "absolute",
      "sticky",
      "overflow-hidden",
      "overflow-x-auto",
      "overflow-y-auto",
      "w-full",
      "h-full",
      "min-h-screen",
      "sr-only",
      "pointer-events-none",
      "select-none",
      "grayscale",
    ]),
    moreOptions: [
      // Wind4 utilities are nearly unlimited; add common ones as needed
      // (gap-*, order-*, z-*, opacity-*, col-* …). Avoid numeric p-*/m-*
      // spacing — shadowed by the CTX atom rules (see module header).
    ],
  },
  // ---- Documented-only groups (no active options yet) ---------------------
  {
    name: "layout",
    label: "Layout Primitives",
    options: [],
    moreOptions: [
      "box",
      "no-border",
      "flow",
      "recursive",
      "horizontal",
      "split-after-me",
      "stop",
      "center",
      "intrinsic",
      "cluster",
      "with-sidebar",
      "switcher",
      "cover",
      "grid-fluid",
      "frame",
      "reel",
      "no-bar",
      "overflowing",
      "imposter",
      "fixed",
      "container",
      "pile",
      "faux-masonry",
      // Parameterized: limit-{n}, split-after-{n}, container:{name},
      // space:{value}, vt-name-{name}
    ],
  },
  {
    name: "styleContext",
    label: "Style Contexts",
    options: [],
    moreOptions: [
      // `.ctx-{name}`, `.widths-{name}`, `.fonts-{name}`,
      // `.type-scale-{name}` — currently configured:
      ...styleContextClasses,
    ],
  },
];

/**
 * The "Utility Classes" object field: one field per group — a multi-select
 * built from `options`, or the group's own `field` definition (e.g. the
 * palette `relation`). Values are stored under `sectionWrapper.utilities` as
 * `{ <groupName>: [value, …] }` — flattened by `classListFromUtilities`.
 */
export const utilitiesField = {
  name: "utilities",
  label: "Utility Classes",
  hint: "Pick utility classes by group — merged into the element's class attribute. Use the Class Names field for anything not listed.",
  widget: "object",
  required: true,
  collapsed: true,
  i18n: "duplicate",
  summary: "TODO: list classes as they will be added",
  fields: utilityClassGroups
    .filter((group) => group.field || group.options?.length)
    .map((group) => ({
      name: group.name,
      label: group.label,
      required: false,
      i18n: "duplicate",
      ...(group.hint ? { hint: group.hint } : {}),
      ...(group.field || {
        widget: "select",
        multiple: group.multiple ?? true,
        options: group.options,
      }),
      // Groups below this many options render as checkboxes/radios rather
      // than a searchable dropdown.
      dropdown_threshold: 20,
    })),
};

/**
 * Flatten a `utilities` object (`{ group: [value, …] }`, `{ group: "value" }`,
 * or a plain array of class names) into a deduped, space-joined class
 * string. A group's `classPrefix` is prepended to each value unless the
 * value already carries it; unknown keys pass their values through
 * unchanged, so hand-authored YAML stays permissive.
 */
export const classListFromUtilities = (
  utilities,
  groups = utilityClassGroups,
) => {
  if (!utilities || typeof utilities !== "object") return "";
  const prefixByGroup = new Map(
    groups.map((g) => [g.name, g.classPrefix || ""]),
  );
  const tokens = Object.entries(utilities).flatMap(([key, value]) => {
    const prefix = prefixByGroup.get(key) ?? "";
    return (Array.isArray(value) ? value : [value])
      .filter((v) => typeof v === "string" && v.trim())
      .map((v) => (v.startsWith(prefix) ? v : prefix + v));
  });
  return [...new Set(tokens)].join(" ");
};
