// Brand data resolution — pure, shared between the Node build
// (`env.config.js` → `deriveEnv`) and the CMS preview (`browser-env.js`).
//
// Precedence per section (first defined wins):
//   1. `_data/brand/<section>.yaml`  — the new dedicated files
//   2. `_data/brand.yaml`            — the legacy single file (its keys sit at
//                                      the root of the merged brand object)
//   3. defaults.js                   — sound built-in values
//
// File shape convention: every section file wraps its content under a key
// (`colors.yaml` -> `colors: [...]`, `spaces.yaml` -> `{widthsContexts, px, …}`,
// `settings.yaml` -> `{ctxCssImport, inlineAllStyles, styleContexts}`). Files
// land in the brand object by basename, so `data.brand.colors` is the file
// content itself — list sections unwrap one level.
import {
  DEFAULT_BORDERS,
  DEFAULT_COLORS,
  DEFAULT_COLOR_PROFILES,
  DEFAULT_FONT_STACKS_CONTEXTS,
  DEFAULT_PALETTES,
  DEFAULT_SETTINGS,
  DEFAULT_SPACES,
  DEFAULT_TYPE_SCALES,
  DEFAULT_WIDTHS_CONTEXTS,
} from "./defaults.js";

const obj = (v) =>
  v && typeof v === "object" && !Array.isArray(v) ? v : null;
const bool = (v, d) => (typeof v === "boolean" ? v : d);

// `<file>.yaml` holds `{<innerKey>: [...]}` or a bare list; `raw[legacyKey]`
// is the same list written in the legacy `_data/brand.yaml`.
const sectionList = (raw, fileKey, innerKey, legacyKey, dflt) => {
  const fileVal = raw?.[fileKey];
  const v = Array.isArray(fileVal) ? fileVal : obj(fileVal)?.[innerKey];
  return v ?? raw?.[legacyKey] ?? dflt;
};

// Merge helper for object subsections: per-key over the defaults so a project
// only needs to set the elements it overrides. Empty-string overrides are
// ignored — the CMS materializes untouched leaves as "" and they must not
// defeat the defaults.
const mergeSection = (defaults, overrides) => ({
  ...defaults,
  ...Object.fromEntries(
    Object.entries(obj(overrides) || {}).filter(
      ([, v]) => v !== "" && v != null,
    ),
  ),
});

export function resolveBrand(raw = {}) {
  const b = raw || {};
  const settingsFile = obj(b.settings) || {};
  const spacesFile = obj(b.spaces) || {};
  const bordersFile = obj(b.borders) || {};

  const settings = {
    ctxCssImport: bool(
      settingsFile.ctxCssImport ?? b.ctxCssImport,
      DEFAULT_SETTINGS.ctxCssImport,
    ),
    inlineAllStyles: bool(
      settingsFile.inlineAllStyles ?? b.inlineAllStyles,
      DEFAULT_SETTINGS.inlineAllStyles,
    ),
    styleContexts:
      settingsFile.styleContexts ??
      b.styleContexts ??
      DEFAULT_SETTINGS.styleContexts,
  };

  return {
    settings,
    colors: sectionList(b, "colors", "colors", "colors", DEFAULT_COLORS),
    palettes: sectionList(b, "palettes", "palettes", "palettes", DEFAULT_PALETTES),
    colorProfiles: sectionList(
      b,
      "colorProfiles",
      "colorProfiles",
      "colorProfiles",
      DEFAULT_COLOR_PROFILES,
    ),
    spaces: {
      widthsContexts:
        spacesFile.widthsContexts ?? b.widthsContexts ?? DEFAULT_WIDTHS_CONTEXTS,
      px: mergeSection(DEFAULT_SPACES.px, spacesFile.px),
      py: mergeSection(DEFAULT_SPACES.py, spacesFile.py),
      gap: mergeSection(DEFAULT_SPACES.gap, spacesFile.gap),
      flow: mergeSection(DEFAULT_SPACES.flow, spacesFile.flow),
      offsets: mergeSection(DEFAULT_SPACES.offsets, spacesFile.offsets),
    },
    borders: {
      radius: mergeSection(DEFAULT_BORDERS.radius, bordersFile.radius),
      thick: mergeSection(DEFAULT_BORDERS.thick, bordersFile.thick),
      borderStyle: mergeSection(
        DEFAULT_BORDERS.borderStyle,
        bordersFile.borderStyle,
      ),
    },
    typeScales: sectionList(b, "typeScales", "typeScales", "typeScales", DEFAULT_TYPE_SCALES),
    fontStacksContexts: sectionList(
      b,
      "fontStacks",
      "fontStacks",
      "fontStacksContexts",
      DEFAULT_FONT_STACKS_CONTEXTS,
    ),
    customFontsImport: sectionList(
      b,
      "customFonts",
      "customFonts",
      "customFontsImport",
      [],
    ),
    // The merged raw object, kept for consumers that still read ad-hoc keys.
    raw: b,
  };
}
