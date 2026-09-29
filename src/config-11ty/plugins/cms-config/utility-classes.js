// Catalog of selectable utility classes backing the CMS "Utility Classes"
// picker (`utilitiesField`) inside `sectionWrapper`. Classes are grouped so
// authors can discover the design system by intent; every option `value` is
// a literal class name appended to the section element's `class` attribute.
//
// Sources:
//  - The static groups below mirror the UnoCSS rules in
//    `plugin-eleventy-unocss/rules/` and the hand-written CTX CSS in
//    `src/styles/ctx/`. Parameterized families (p-*, breathe-*, width-*, …)
//    enumerate the token names those rules resolve (`--py-*`, `--px-*`,
//    `--p-*`, `--flow-*`, `--radius-*`, `--width-*`).
//  - Brand-generated classes (`palette-*`, `ctx-*`, `widths-*`, `fonts-*`,
//    `type-scale-*`) come from `env.config.js`, matching the class names
//    `mapStyleStringsToClassDef` emits (`> 1` entries are required for
//    per-name classes, except `ctx-*` which is always emitted).
//  - `tailwind` is a curated set of common presetWind4 utilities — not an
//    exhaustive list; anything missing can be typed into the free-text
//    `class` field, which is merged with the picked utilities at render.
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
const namedOpts = (entries) => entries.map(([v, l]) => opt(v, l));

// Token names resolved by the parameterized atom rules (see ctx-atoms.js /
// src/styles/ctx/33_spaces.css).
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

// ---- Brand-generated groups (dynamic, per project) -------------------------

const paletteNameOptions = (brandPalettes?.length || 0) > 1
  ? brandPalettes.map((p) => opt(`palette-${p.name}`, `Palette ${p.name}`))
  : [];

const styleContextOptions = [
  ...(brandStyleContexts || []).map((c) =>
    opt(`ctx-${c.name}`, `Context ${c.name}`),
  ),
  ...(brandWidthsContexts?.length > 1
    ? brandWidthsContexts.map((c) =>
        opt(`widths-${c.name}`, `Widths ${c.name}`),
      )
    : []),
  ...(brandFontStacksContexts?.length > 1
    ? brandFontStacksContexts.map((c) =>
        opt(`fonts-${c.name}`, `Fonts ${c.name}`),
      )
    : []),
  ...(brandTypeScales?.length > 1
    ? brandTypeScales.map((c) =>
        opt(`type-scale-${c.name}`, `Type scale ${c.name}`),
      )
    : []),
];

/**
 * Grouped option catalog: `[{ name, label, options: [{ value, label }] }]`.
 * Consumed twice: server-side to build `utilitiesField` for `admin/config.json`
 * (via `section-primitives.js`), and client-side where it is serialized into
 * `/admin/env.js` for `defaultEditorComponents.js`.
 */
export const utilityClassGroups = [
  {
    name: "palette",
    label: "Palette & Colors",
    options: [
      ...paletteNameOptions,
      ...namedOpts([
        ["palette--default", "Default"],
        ["palette--reset", "Reset"],
        ["palette--contrast", "Contrast"],
        ["palette--pop", "Pop"],
        ["palette--accent", "Accent"],
        ["palette--tone", "Tone"],
        ["palette--alt", "Alt"],
        ["palette--bg-pop", "Background Pop"],
        ["palette--bg-tone", "Background Tone"],
        ["palette--pop-contrast", "Pop Contrast"],
        ["palette--tone-contrast", "Tone Contrast"],
        ["palette--contrast-pop", "Contrast Pop"],
        ["palette--contrast-tone", "Contrast Tone"],
        ["palette--read", "Read"],
        ["palette--light", "Light"],
        ["palette--dark", "Dark"],
      ]),
    ],
  },
  {
    name: "styleContext",
    label: "Style Contexts",
    options: styleContextOptions,
  },
  {
    name: "spacing",
    label: "Spacing & Rhythm",
    options: [
      ...namedOpts([
        ["breathe", "Breathe (vertical margin)"],
        ["no-padding", "No padding"],
        ["no-flow", "No flow spacing"],
        ["px-restore", "Restore lateral padding"],
        ["reset-w", "Reset width (self)"],
        ["reset-down-w", "Reset width (descendants)"],
      ]),
      ...opts([
        ...pyNames.map((n) => `breathe-${n}`),
        ...pyNames.map((n) => `squash-${n}`),
        ...pyNames.map((n) => `py-${n}`),
        ...pxNames.map((n) => `px-${n}`),
        "p-card",
        ...pyNames.map((n) => `my-${n}`),
        ...pxNames.map((n) => `mx-${n}`),
        "m-card",
        ...flowNames.map((n) => `flow-${n}`),
      ]),
    ],
  },
  {
    name: "sizing",
    label: "Width, Bleed & Ratio",
    options: [
      ...opts([
        ...widthNames.map((n) => `width-${n}`),
        "full-bleed",
        "full-bleed-page",
        "full-bleed-screen",
        "full-bleed-body",
        "full-bleed-prose",
        "full-bleed-featured",
        "full-bleed-card",
        "full-bleed-section",
        "full-bleed-before",
        "full-bleed-after",
        "bleed-bg",
        "aspect-ratio-1",
        "aspect-ratio-1.5",
        "aspect-ratio-2",
      ]),
    ],
  },
  {
    name: "typography",
    label: "Text & Typography",
    options: [
      ...namedOpts([
        ["text", "Centered text (with Center)"],
        ["lowercase", "Lowercase (with-icon)"],
        ["sub", "Sub icon"],
        ["super", "Super icon"],
        ["icon", "Icon"],
        ["with-icon", "With icon"],
        ["external-link-icons", "External link icons"],
        ["truncate", "Truncate"],
        ["truncate-lines", "Truncate lines"],
        ["truncate-lines-overflow", "Truncate lines (ellipsis)"],
      ]),
      ...opts([
        "text-left",
        "text-center",
        "text-right",
        "text-justify",
        "font-medium",
        "font-semibold",
        "font-bold",
        "italic",
        "not-italic",
        "uppercase",
        "capitalize",
        "normal-case",
        "underline",
        "no-underline",
        "line-through",
        "whitespace-nowrap",
        "text-balance",
        "text-pretty",
      ]),
    ],
  },
  {
    name: "layout",
    label: "Layout Primitives",
    options: [
      ...namedOpts([
        ["box", "Box"],
        ["no-border", "No border (box)"],
        ["flow", "Flow"],
        ["recursive", "Flow recursive"],
        ["horizontal", "Flow horizontal"],
        ["split-after-me", "Flow split after me"],
        ["stop", "Flow stop"],
        ["center", "Center"],
        ["intrinsic", "Center intrinsic"],
        ["cluster", "Cluster"],
        ["with-sidebar", "With sidebar (fixed-fluid)"],
        ["switcher", "Switcher"],
        ["cover", "Cover"],
        ["grid-fluid", "Fluid grid"],
        ["frame", "Frame"],
        ["reel", "Reel"],
        ["no-bar", "Reel no scrollbar"],
        ["overflowing", "Reel overflowing"],
        ["imposter", "Imposter"],
        ["fixed", "Fixed position"],
        ["container", "Container query"],
        ["pile", "Pile"],
        ["faux-masonry", "Faux masonry"],
      ]),
    ],
  },
  {
    name: "effects",
    label: "Borders & Effects",
    options: [
      ...opts([
        "border",
        "radius",
        ...radiusNames.map((n) => `radius-${n}`),
        "background-overlay",
        "background-shadow",
        "breakout-clickable",
        "scroll-shadows-horizontal",
        "scroll-shadows-radial-v",
        "scroll-shadows-radial-h",
        "skew-border-before",
        "skew-border-after",
      ]),
    ],
  },
  {
    name: "tailwind",
    label: "Tailwind Utilities",
    options: [
      ...opts([
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
        "mx-auto",
        "sr-only",
        "pointer-events-none",
        "select-none",
        "grayscale",
      ]),
    ],
  },
].filter((group) => group.options.length > 0);

/**
 * The "Utility Classes" object field: one multi-select per group. Values
 * stored under `sectionWrapper.utilities` (or whichever parent object) as
 * `{ <groupName>: [class, …] }` — flattened by `classListFromUtilities`.
 */
export const utilitiesField = {
  name: "utilities",
  label: "Utility Classes",
  hint: "Pick utility classes by group — merged into the element's class attribute. Use the Class Names field for anything not listed.",
  widget: "object",
  required: false,
  collapsed: false,
  i18n: "duplicate",
  fields: utilityClassGroups.map((group) => ({
    name: group.name,
    label: group.label,
    widget: "select",
    multiple: true,
    required: false,
    options: group.options,
  })),
};

/**
 * Flatten a `utilities` object (`{ group: [class, …] }` or
 * `{ group: "class" }`) into a deduped, space-joined class string.
 */
export const classListFromUtilities = (utilities) => {
  if (!utilities || typeof utilities !== "object") return "";
  const tokens = Object.values(utilities)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((v) => typeof v === "string" && v.trim());
  return [...new Set(tokens)].join(" ");
};
