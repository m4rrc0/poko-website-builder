const paletteKeys = {
  0: "transparent",
  r: "read-palette",
  n: "neutral-palette",
  p: "pop-palette",
  t: "tone-palette",
};

const slotNames = ["--read", "--neutral", "--pop", "--tone"];

/**
 * Dynamic palette permutation rule.
 *
 *   p--<read><neutral><pop><tone>
 *
 * Each character is one of r, n, p, t and selects which *-palette value is
 * written into the corresponding bare slot. Examples:
 *
 *   p--rnpt  identity
 *   p--nrpt  contrast
 *   p--pnrt  pop
 *   p--tnpr  tone
 */
const palettePermutationRule = [
  /^palette--([rnpt0])([rnpt0])([rnpt0])([rnpt0])$/,
  ([, read, neutral, pop, tone], { symbols }) => ({
    [symbols.selector]: (selector) => `:where(${selector})`,
    [slotNames[0]]: `var(--${paletteKeys[read]})`,
    [slotNames[1]]: `var(--${paletteKeys[neutral]})`,
    [slotNames[2]]: `var(--${paletteKeys[pop]})`,
    [slotNames[3]]: `var(--${paletteKeys[tone]})`,
  }),
];

export const colorsRules = [palettePermutationRule];

/**
 * Friendly aliases for the named palette variants.
 * These map the existing .palette--* class names to the p--* permutation rule
 * so authored content keeps working without changing class names.
 */
export const colorsShortcuts = [
  [/^palette--default$/, "p--rnpt"],
  [/^palette--reset$/, "p--rnpt"],
  [/^palette--contrast$/, "p--nrpt"],
  [/^palette--pop$/, "p--pnrt"],
  [/^palette--accent$/, "p--pnrt"],
  [/^palette--tone$/, "p--tnpr"],
  [/^palette--alt$/, "p--tnpr"],
  [/^palette--bg-pop$/, "p--rpnt"],
  [/^palette--bg-tone$/, "p--rtnp"],
  [/^palette--pop-contrast$/, "p--nprt"],
  [/^palette--tone-contrast$/, "p--ntpr"],
];

export default colorsRules;
