import { calculateTypeScale, calculateClamps } from "utopia-core";
import { flattenObject } from "./objects.js";

// prettier-ignore
export const nativeFontStacks = {
  "system-ui": "system-ui, sans-serif",
  "transitional": "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif",
  "old-style": "'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif",
  "humanist": "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
  "geometric-humanist": "Avenir, Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif",
  "classical-humanist": "Optima, Candara, 'Noto Sans', source-sans-pro, sans-serif",
  "neo-grotesque": "Inter, Roboto, 'Helvetica Neue', 'Arial Nova', 'Nimbus Sans', Arial, sans-serif",
  "monospace-slab-serif": "'Nimbus Mono PS', 'Courier New', monospace",
  "monospace-code": "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
  "industrial": "Bahnschrift, 'DIN Alternate', 'Franklin Gothic Medium', 'Nimbus Sans Narrow', sans-serif-condensed, sans-serif",
  "rounded-sans": "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', 'Arial Rounded MT Bold', Calibri, source-sans-pro, sans-serif",
  "slab-serif": "Rockwell, 'Rockwell Nova', 'Roboto Slab', 'DejaVu Serif', 'Sitka Small', serif",
  "antique": "Superclarendon, 'Bookman Old Style', 'URW Bookman', 'URW Bookman L', 'Georgia Pro', Georgia, serif",
  "didone": "Didot, 'Bodoni MT', 'Noto Serif Display', 'URW Palladio L', P052, Sylfaen, serif",
  "handwritten": "'Segoe Print', 'Bradley Hand', Chilanka, TSCu_Comic, casual, cursive",
}

export function mapStyleStringsToClassDef(arr, classPrefix, l = 1) {
  return arr.length > l
    ? arr
        .map((item) => `${classPrefix}${item.name}{${item.stylesString}}`)
        .join("\n")
    : "";
}

function compileStyleContext(styleContext, contextMap) {
  const stylesString = Object.entries(styleContext)
    .map(([key, name]) => {
      const mapEntry = contextMap[key];
      if (!Array.isArray(mapEntry)) return "";
      const str = mapEntry.find((entry) => entry.name === name)?.stylesString;
      return str;
    })
    .join("");

  return {
    ...styleContext,
    stylesString,
  };
}

export function compileStyleContexts(styleContexts, contextMap) {
  return (styleContexts || []).map((styleContext) =>
    compileStyleContext(styleContext, contextMap),
  );
}

export function transformBaseFontStack(name, stackDef, customFontsImport) {
  const { native, custom } = stackDef || {};
  const customFontName = customFontsImport?.find((font) => font.name === custom)
    ?.source?.name;

  // TODO: implement custom font here as well
  const stylesString =
    custom || (native && nativeFontStacks[native])
      ? [
          `--font-stack-${name}:`,
          customFontName ? `${customFontName}, ` : "",
          native && nativeFontStacks[native] ? nativeFontStacks[native] : "",
          ";",
        ].join("")
      : "";

  return {
    name,
    native,
    custom,
    stylesString,
  };
}

export function transformFontStacksContext(baseFontStacks, customFontsImport) {
  const { name, body, heading, code } = baseFontStacks || {};
  const vars = {
    body: body && transformBaseFontStack("body", body, customFontsImport),
    heading:
      heading && transformBaseFontStack("heading", heading, customFontsImport),
    code: code && transformBaseFontStack("code", code, customFontsImport),
  };
  const stylesString = Object.values(vars)
    .map((value) => value.stylesString)
    .join("");

  return {
    name,
    vars,
    stylesString,
  };
}

export function transformFontStacksContexts(
  fontStacksContexts,
  customFontsImport,
) {
  return (fontStacksContexts || []).map((fontStacksContext) =>
    transformFontStacksContext(fontStacksContext, customFontsImport),
  );
}

export function transformWidthsContext(widthsContext) {
  const { name, ...vars } = widthsContext || {};
  const stylesString = Object.entries(vars)
    .map(([key, value]) => `--width-${key}:${value};`)
    .join("");
  return {
    name,
    vars,
    stylesString,
  };
}

export function transformBrandColors(colors) {
  let brandColors = Array.isArray(colors) ? colors : [];
  brandColors = brandColors.map((color) => ({
    ...color,
    stylesString: `--${color.name}:${color.value};`,
  }));

  return brandColors;
}

export function transformPalette(palette) {
  // Color attributions data is sometimes nested for CMS clarity but can be flattened
  const { name, ...baseVarsAndNested } = palette || {};
  let unifiedPalette = flattenObject(baseVarsAndNested);

  // Remove keys with falsy values
  Object.keys(unifiedPalette).forEach((key) => {
    if (!unifiedPalette[key]) {
      delete unifiedPalette[key];
    }
  });
  const stylesString = Object.entries(unifiedPalette)
    .map(([key, value]) => `--color-${key}:var(--${value});`)
    .join("");

  return {
    name,
    vars: unifiedPalette,
    stylesString,
  };
}

export function transformTypeScale(typeScaleDef) {
  const vars = {
    minWidth: typeScaleDef?.minWidth || 360,
    maxWidth: typeScaleDef?.maxWidth || 1240,
    minFontSize: typeScaleDef?.minFontSize || 16,
    maxFontSize: typeScaleDef?.maxFontSize || 20,
    minTypeScale: typeScaleDef?.minTypeScale || 1.2,
    maxTypeScale: typeScaleDef?.maxTypeScale || 1.25,
    positiveSteps: typeScaleDef?.advanced?.positiveSteps || 9,
    negativeSteps: typeScaleDef?.advanced?.negativeSteps || 2,
    relativeTo: typeScaleDef?.advanced?.relativeTo || "viewport-width",
    labelStyle: typeScaleDef?.advanced?.labelStyle || "utopia",
    prefix: typeScaleDef?.advanced?.prefix || "step",
  };

  const typeScale = calculateTypeScale(vars);

  // Custom Clamps based on original steps
  const pairs = typeScaleDef?.customSteps?.map((step) => {
    const minFontSize = typeScale.find(
      (item) => item.label === step.startStep,
    )?.minFontSize;
    const maxFontSize = typeScale.find(
      (item) => item.label === step.endStep,
    )?.maxFontSize;

    return [minFontSize, maxFontSize];
  });
  const clamps = pairs?.length
    ? calculateClamps({
        minWidth: vars.minWidth,
        maxWidth: vars.maxWidth,
        pairs,
      }).map((clamp, i) => ({
        ...clamp,
        label: `${typeScaleDef?.customSteps[i].startStep}-${typeScaleDef?.customSteps[i].endStep}`,
      }))
    : [];

  // Turn clamp steps into CSS variables
  const stylesString = [...typeScale, ...clamps]
    .map(({ label, clamp }) => `--${vars.prefix}-${label}:${clamp};`)
    .join("");

  return {
    name: typeScaleDef?.name,
    vars,
    typeScale,
    stylesString,
  };
}

export function transformTypeScales(typeScales) {
  return (typeScales || []).map(transformTypeScale);
}
