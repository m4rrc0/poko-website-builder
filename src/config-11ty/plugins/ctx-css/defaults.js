// Default token values + element enums for the ctx.css generated layer.
// Pure data, no imports — safe to share between the Node build, the CMS
// preview bundle, and the CMS schema definition.
//
// The spacing/border values mirror `src/styles/ctx/18_foundation.css`, which
// ships the same fallbacks: emitting them here keeps the generated `:root`
// block self-contained and identical to today when a project defines nothing.

// The four color roles every palette binds.
export const COLOR_ROLES = ["read", "neutral", "pop", "tone"];

export const DEFAULT_COLORS = [
  { name: "black", value: "#000001" },
  { name: "white", value: "#ffffff" },
];

// Role-shaped default: a working two-color palette.
export const DEFAULT_PALETTES = [
  { name: "main", read: "black", neutral: "white", pop: "black", tone: "black" },
];

// Intent -> slot mapping for the default color profile.
// Emitted on `:where(:root, body, [class*="palette"])` so intent vars resolve
// in each element's own palette context (see src/styles/ctx/34_colors.css).
export const DEFAULT_COLOR_PROFILES = [
  {
    name: "main",
    text: "read",
    bg: "neutral",
    a: { "text__a--hover": "pop" },
  },
];

export const DEFAULT_WIDTHS_CONTEXTS = [
  { name: "main", max: "80rem", prose: "50rem" },
];

export const DEFAULT_FONT_STACKS_CONTEXTS = [
  {
    name: "main",
    body: { native: "system-ui" },
    heading: { native: "system-ui" },
    code: { native: "monospace-code" },
  },
];

export const DEFAULT_TYPE_SCALES = [
  {
    name: "main",
    minFontSize: 18,
    maxFontSize: 20,
    minTypeScale: 1.2,
    maxTypeScale: 1.25,
  },
];

export const DEFAULT_SETTINGS = {
  ctxCssImport: true,
  inlineAllStyles: false,
  styleContexts: [{ name: "main" }],
};

// ---- Element enums ---------------------------------------------------------
// The named elements spacing/border tokens attach to. The CMS schema and the
// generated `--{family}-{element}` variables both read from these lists, so a
// change here propagates everywhere.
export const PX_ELEMENTS = [
  "page",
  "body",
  "section",
  "prose",
  "featured",
  "card",
  "token",
  "button",
];
export const PY_ELEMENTS = [
  "page",
  "body",
  "section",
  "area",
  "prose",
  "featured",
  "card",
  "token",
  "button",
];
export const GAP_ELEMENTS = [
  "page",
  "body",
  "section",
  "prose",
  "featured",
  "card",
  "token",
];
export const FLOW_ELEMENTS = [
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
export const OFFSET_ELEMENTS = ["list", "blockquote"];

export const RADIUS_ELEMENTS = [
  "round",
  "body",
  "section",
  "prose",
  "featured",
  "card",
  "token",
];
export const THICK_ELEMENTS = [
  "body",
  "section",
  "prose",
  "featured",
  "card",
  "token",
];
export const BORDER_STYLE_ELEMENTS = [
  "page",
  "body",
  "section",
  "prose",
  "featured",
  "card",
  "token",
];

// Default values per element — same values `18_foundation.css` sets today.
export const DEFAULT_SPACES = {
  px: {
    page: "var(--step--2, 0.8rem)",
    body: "var(--px-page)",
    section: "var(--step--1, 1rem)",
    prose: "var(--step--1, 1rem)",
    featured: "var(--step--1, 1rem)",
    card: "var(--step--1, 1rem)",
    token: "var(--step--1, 1rem)",
    button: "var(--step--1, 1rem)",
  },
  py: {
    page: "var(--step-2, 0.8rem)",
    body: "var(--py-page)",
    section: "var(--step-4, 3rem)",
    area: "var(--step-1)",
    prose: "var(--step--1, 1rem)",
    featured: "var(--step--1, 1rem)",
    card: "var(--step--1, 1rem)",
    token: "var(--step--1, 1rem)",
    button: "var(--step--1, 1rem)",
  },
  gap: {
    page: "var(--step-0, 1.25rem)",
    body: "var(--gap-page)",
    section: "var(--step-0, 1.25rem)",
    prose: "var(--step--1, 1rem)",
    featured: "var(--step--1, 1rem)",
    card: "var(--step--1, 1rem)",
    token: "var(--step--1, 1rem)",
  },
  flow: {
    p: "1em",
    h1: "0.67em",
    h2: "0.83em",
    h3: "1em",
    h4: "1.33em",
    h5: "1.67em",
    h6: "2.33em",
    hr: "1em",
    media: "1em",
    prose: "var(--step-1)",
    section: "var(--step-2)",
    area: "var(--step-3)",
  },
  offsets: {
    list: "2rem",
    blockquote: "1rem",
  },
};

export const DEFAULT_BORDERS = {
  radius: {
    round: "1e5px",
    body: "0",
    section: "0",
    prose: "0",
    featured: "0",
    card: "0",
    token: "0",
  },
  thick: {
    body: "0px",
    section: "0px",
    prose: "0px",
    featured: "0px",
    card: "0px",
    token: "0px",
  },
  borderStyle: {
    page: "solid",
    body: "solid",
    section: "solid",
    prose: "solid",
    featured: "solid",
    card: "solid",
    token: "solid",
  },
};

// --{family}-{element} variable name prefix per section.
export const SPACE_VAR_PREFIX = {
  px: "--px-",
  py: "--py-",
  gap: "--gap-",
  flow: "--flow-",
  offsets: "--offset-",
};
export const BORDER_VAR_PREFIX = {
  radius: "--radius-",
  thick: "--thick-",
  borderStyle: "--border-style-",
};
