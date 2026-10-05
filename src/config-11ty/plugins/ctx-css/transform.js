// ctx.css compilation — pure data -> CSS text, shared between the Node build
// (env.config.js -> deriveEnv) and the CMS preview (browser-env.js).
//
// Emitted model (see README.md):
//   :root{ tokens + widths + font stacks + type scale + spaces + borders
//          + first palette's bindings/intents }
//   :where(:root, body, [class*="palette"]){ first color profile's intents }
//   .ctx-*/.widths-*/.fonts-*/.type-scale-*  context classes
//   .palette-{name}   palette bindings (L2) + legacy flat intents
//   .profile-{name}   extra color profiles (only when > 1 configured)
import { flattenObject } from "../../../utils/objects.js";
import {
  compileStyleContexts,
  mapStyleStringsToClassDef,
  transformBrandColors,
  transformFontStacksContexts,
  transformTypeScales,
} from "../../../utils/transformStyles.js";
import {
  BORDER_VAR_PREFIX,
  COLOR_ROLES,
  SPACE_VAR_PREFIX,
} from "./defaults.js";

const ROLE_SET = new Set(COLOR_ROLES);

// A bare identifier is a color token name -> `var(--name)`; anything else
// (hex, var(), rgb(), color-mix(), calc(), keywords…) passes through verbatim
// so `select-other` style fields can carry relative color syntax.
const CSS_COLOR_KEYWORDS = new Set([
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
]);
const isTokenName = (v) =>
  typeof v === "string" &&
  /^[a-zA-Z][\w-]*$/.test(v) &&
  !CSS_COLOR_KEYWORDS.has(v.toLowerCase());
const colorValue = (v) => (isTokenName(v) ? `var(--${v})` : v);

// --width-{key} per widths-context key. `max` also sets `--width-page`: in the
// ctx.css foundation `--width-body`/`--width-max`/`--width-section` all alias
// `--width-page`, so the CMS "Max Width" field is really the page cap.
export function transformWidthsContext(widthsContext) {
  const { name, ...vars } = widthsContext || {};
  let stylesString = Object.entries(vars)
    .map(([key, value]) => `--width-${key}:${value};`)
    .join("");
  if (vars.max && !vars.page) stylesString += `--width-page:${vars.max};`;
  return { name, vars, stylesString };
}

// Palette keys split into two emission paths:
//   - the four roles + `extras` names -> `--color-{key}-palette` (L2 bindings,
//     read by slot variants and by color profiles)
//   - every other key -> `--color-{key}` (L4 intents, legacy flat palettes)
// `extras: [{name, color}]` declares custom palette-level colors (selectable
// in color profiles). `name`/`profile`/`extras`/`advanced` are meta keys.
const PALETTE_META_KEYS = new Set(["name", "extras"]);
export function transformPalette(palette) {
  const { name, extras, ...rest } = palette || {};
  const flat = flattenObject(rest);
  const extrasMap = {};
  for (const e of Array.isArray(extras) ? extras : []) {
    if (e?.name && e?.color) extrasMap[e.name] = e.color;
  }

  const stylesString = [
    ...Object.entries(flat)
      .filter(([key, value]) => !PALETTE_META_KEYS.has(key) && value)
      .map(([key, value]) =>
        ROLE_SET.has(key)
          ? `--color-${key}-palette:${colorValue(value)};`
          : `--color-${key}:${colorValue(value)};`,
      ),
    ...Object.entries(extrasMap).map(
      ([key, value]) => `--color-${key}-palette:${colorValue(value)};`,
    ),
  ].join("");

  return { name, vars: flat, extras: extrasMap, stylesString };
}

// Profile leaf values resolve to:
//   role name (read|neutral|pop|tone) -> var(--color-{role})      (the slot —
//     variants permute slots, so intents follow permutations)
//   palette extras name              -> var(--color-{name}-palette)
//   any other bare identifier        -> var(--{name})             (color token)
//   anything else                    -> emitted verbatim (raw CSS values)
const profileValue = (value, extrasNames) => {
  if (ROLE_SET.has(value)) return `var(--color-${value})`;
  if (extrasNames.has(value)) return `var(--color-${value}-palette)`;
  return colorValue(value);
};

export function transformColorProfile(profile, extrasNames = new Set()) {
  const { name, ...rest } = profile || {};
  const flat = flattenObject(rest);
  const stylesString = Object.entries(flat)
    .filter(([, value]) => value)
    .map(
      ([key, value]) => `--color-${key}:${profileValue(value, extrasNames)};`,
    )
    .join("");
  return { name, stylesString };
}

// {px|py|gap|flow|offsets: {element: value}} -> `--{family}-{element}:value;`
const sectionVarsString = (prefixMap, sections) =>
  Object.entries(prefixMap)
    .map(([family, prefix]) =>
      Object.entries(sections?.[family] || {})
        .filter(([, value]) => value !== "" && value != null)
        .map(([el, value]) => `${prefix}${el}:${value};`)
        .join(""),
    )
    .join("");

export function compileCtxCss(data = {}) {
  const widthsContexts = (
    data.widthsContexts ??
    data.spaces?.widthsContexts ??
    []
  ).map(transformWidthsContext);
  const fontStacksContexts = transformFontStacksContexts(
    data.fontStacksContexts,
    data.customFontsImport,
  );
  const typeScales = transformTypeScales(data.typeScales);
  const colors = transformBrandColors(data.colors);
  const palettes = (data.palettes || []).map(transformPalette);
  const extrasNames = new Set(
    palettes.flatMap((p) => Object.keys(p.extras || {})),
  );
  const colorProfiles = (data.colorProfiles || []).map((p) =>
    transformColorProfile(p, extrasNames),
  );
  const styleContexts = compileStyleContexts(data.settings?.styleContexts, {
    widthsContext: widthsContexts,
    fontStacksContext: fontStacksContexts,
    typeScale: typeScales,
    palette: palettes,
    colorProfile: colorProfiles,
  });

  const colorsStyles = colors.map((c) => c.stylesString).join("");
  const spacesStyles = sectionVarsString(SPACE_VAR_PREFIX, data.spaces);
  const bordersStyles = sectionVarsString(BORDER_VAR_PREFIX, data.borders);

  const widthsContextsStyles = mapStyleStringsToClassDef(
    widthsContexts,
    ".widths-",
  );
  const fontStacksContextsStyles = mapStyleStringsToClassDef(
    fontStacksContexts,
    ".fonts-",
  );
  const typeScalesStyles = mapStyleStringsToClassDef(
    typeScales,
    ".type-scale-",
  );
  const palettesStyles = mapStyleStringsToClassDef(palettes, ".palette-");
  const colorProfilesStyles = mapStyleStringsToClassDef(
    colorProfiles,
    ".profile-",
  );
  const styleContextsStyles = mapStyleStringsToClassDef(
    styleContexts,
    ".ctx-",
    0,
  );

  const rootStyles = [
    ":root{",
    widthsContexts?.[0]?.stylesString || "",
    fontStacksContexts?.[0]?.stylesString || "",
    typeScales?.[0]?.stylesString || "",
    colorsStyles,
    spacesStyles,
    bordersStyles,
    palettes?.[0]?.stylesString || "",
    "}",
  ].join("");

  // The first color profile is the default intent map — re-declared on every
  // palette-carrying element so intents resolve in that element's own palette
  // context (same contract as the identity slot reset in 34_colors.css).
  const defaultProfileStyles = colorProfiles[0]?.stylesString
    ? `:where(:root, body, [class*="palette"]){${colorProfiles[0].stylesString}}`
    : "";

  const cssText = [
    rootStyles,
    defaultProfileStyles,
    styleContextsStyles,
    widthsContextsStyles,
    fontStacksContextsStyles,
    typeScalesStyles,
    palettesStyles,
    colorProfilesStyles,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    widthsContexts,
    fontStacksContexts,
    typeScales,
    colors,
    palettes,
    colorProfiles,
    styleContexts,
    widthsContextsStyles,
    fontStacksContextsStyles,
    typeScalesStyles,
    palettesStyles,
    colorProfilesStyles,
    styleContextsStyles,
    colorsStyles,
    spacesStyles,
    bordersStyles,
    rootStyles,
    defaultProfileStyles,
    cssText,
  };
}
