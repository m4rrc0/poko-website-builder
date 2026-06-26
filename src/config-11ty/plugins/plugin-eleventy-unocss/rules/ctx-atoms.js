const resolveNamedValue = (name, varPrefix) =>
  name.startsWith("-")
    ? `var(-${name})`
    : /\d/.test(name)
      ? name
      : `var(${varPrefix}${name})`;

export default [
  // Define CSS variables on the fly with CSS-like syntax
  [
    /^v--([a-zA-Z0-9-]+):(.+)$/,
    ([, varName, value]) => {
      // If value starts with --, it's a CSS variable reference
      const cssValue = value.startsWith("--") ? `var(${value})` : value;
      return { [`--${varName}`]: cssValue };
    },
  ],
  // Aspect ratio utility
  [
    /^aspect-ratio-(\d+(?:\.\d+)?)$/,
    ([, d]) => ({ "aspect-ratio": d, "object-fit": "var(--fit, cover)" }),
  ],
  // Width utility
  // E.g. width-prose, width-body, width-card, width-300px, ...
  [
    /^width-([a-zA-Z0-9\-]+)$/,
    ([, name], { symbols }) => ({
      [symbols.selector]: () => `:where(.width-${name})`,
      "max-inline-size": resolveNamedValue(name, "--width-"),
      "margin-inline": "auto",
    }),
  ],
  // Padding utility — all logical axes + aliases
  // p-*, py-*/pb-*, px-*/pi-*, pbs-*, pbe-*, pis-*, pie-*
  [
    /^(p|py|pb|px|pi|pbs|pbe|pis|pie)-([a-zA-Z0-9]+)$/,
    ([, prefix, name], { symbols }) => {
      const propMap = {
        p: ["padding", "--p-"],
        py: ["padding-block", "--py-"],
        pb: ["padding-block", "--py-"],
        px: ["padding-inline", "--px-"],
        pi: ["padding-inline", "--px-"],
        pbs: ["padding-block-start", "--py-"],
        pbe: ["padding-block-end", "--py-"],
        pis: ["padding-inline-start", "--px-"],
        pie: ["padding-inline-end", "--px-"],
      };
      const [prop, varPrefix] = propMap[prefix];
      const value = /\d/.test(name) ? name : `var(${varPrefix}${name})`;
      return {
        [symbols.selector]: () => `:where(.${prefix}-${name})`,
        [prop]: value,
      };
    },
  ],
  // Vertical margin utility
  // E.g. my-prose, my-body, my-card, my-1rem, ...
  [
    /^my-([a-zA-Z0-9\-]+)$/,
    ([, name], { symbols }) => ({
      [symbols.selector]: () => `:where(.my-${name})`,
      "margin-block": resolveNamedValue(name, "--py-"),
    }),
  ],
  [
    /^breathe$/,
    ([], { symbols }) => ({
      [symbols.selector]: () => `:where(.breathe)`,
      "margin-block": `var(--py)`,
    }),
  ],
  [
    /^breathe-([a-zA-Z0-9\-]+)$/,
    ([, name], { symbols }) => ({
      [symbols.selector]: () => `:where(.breathe-${name})`,
      "margin-block": resolveNamedValue(name, "--py-"),
    }),
  ],
  [
    /^flow-([a-zA-Z0-9\-]+)$/,
    ([, name], { symbols }) => ({
      [symbols.selector]: () => `:where(.flow-${name})`,
      "margin-block-start": resolveNamedValue(name, "--flow-"),
    }),
  ],
  // Negative Vertical margin utility
  // E.g. my-prose, my-body, my-card, squash-2rem, ...
  [
    /^squash-([a-zA-Z0-9]+)$/,
    ([, name], { symbols }) => ({
      [symbols.selector]: () => `:where(.squash-${name})`,
      isolation: "isolate",
      "margin-block": /\d/.test(name)
        ? `calc(-0.5 * ${name})`
        : `calc(-0.5 * var(--py-${name}))`,
    }),
  ],
  // Border radius utility
  // E.g. radius-prose, radius-body, radius-card, radius-8px, ...
  [
    /^radius$/,
    ([], { symbols }) => ({
      [symbols.selector]: (selector) => `:where(${selector})`,
      "border-radius": "var(--radius)",
      overflow: "hidden",
    }),
  ],
  [
    /^radius-([a-zA-Z0-9\-]+)$/,
    ([, name], { symbols }) => ({
      [symbols.selector]: (selector) => `:where(${selector})`,
      "border-radius": resolveNamedValue(name, "--radius-"),
      overflow: "hidden",
    }),
  ],
  // Positioned border radius utility
  // E.g. radius-top-card, radius-tr-card, radius-tl-card, radius-r-card, radius-tr-8px, ...
  [
    /^radius-([a-zA-Z]+)-([a-zA-Z0-9]+)$/,
    ([, position, name], { symbols }) => {
      const positionMap = {
        t: ["top-left", "top-right"],
        r: ["top-right", "bottom-right"],
        b: ["bottom-left", "bottom-right"],
        l: ["top-left", "bottom-left"],
        tl: ["top-left"],
        tr: ["top-right"],
        bl: ["bottom-left"],
        br: ["bottom-right"],
        top: ["top-left", "top-right"],
        right: ["top-right", "bottom-right"],
        bottom: ["bottom-left", "bottom-right"],
        left: ["top-left", "bottom-left"],
        "top-left": ["top-left"],
        "top-right": ["top-right"],
        "bottom-left": ["bottom-left"],
        "bottom-right": ["bottom-right"],
      };

      const positions = positionMap[position];
      const cssProperties = {};
      const value = /\d/.test(name) ? name : `var(--radius-${name})`;

      positions.forEach((pos) => {
        cssProperties[`border-${pos}-radius`] = value;
      });

      return {
        [symbols.selector]: (selector) => `:where(${selector})`,
        ...cssProperties,
        overflow: "hidden",
      };
    },
  ],
  // Border width utility
  // E.g. border-prose, border-body, border-card, border-8px, ...
  [
    /^border$/,
    ([], { symbols }) => ({
      [symbols.selector]: (selector) => `:where(${selector})`,
      "border-width": "var(--thickness)",
    }),
  ],
  [
    /^border-([a-zA-Z0-9\-]+)$/,
    ([, name], { symbols }) => ({
      [symbols.selector]: (selector) => `:where(${selector})`,
      "border-width": resolveNamedValue(name, "--thick-"),
    }),
  ],
  // Positioned border width utility
  // E.g. border-top-card, border-tr-card, border-tl-card, border-r-card, border-tr-8px, ...
  [
    /^border-([a-zA-Z]+)-([a-zA-Z0-9]+)$/,
    ([, position, name], { symbols }) => {
      const positionMap = {
        t: ["top"],
        r: ["right"],
        b: ["bottom"],
        l: ["left"],
        tl: ["top", "left"],
        tr: ["top", "right"],
        bl: ["bottom", "left"],
        br: ["bottom", "right"],
        top: ["top"],
        right: ["right"],
        bottom: ["bottom"],
        left: ["left"],
        "top-left": ["top", "left"],
        "top-right": ["top", "right"],
        "bottom-left": ["bottom", "left"],
        "bottom-right": ["bottom", "right"],
      };

      const positions = positionMap[position];
      const cssProperties = {};
      const value = /\d/.test(name) ? name : `var(--thick-${name})`;

      positions.forEach((pos) => {
        cssProperties[`border-${pos}-width`] = value;
      });

      return {
        [symbols.selector]: (selector) => `:where(${selector})`,
        ...cssProperties,
      };
    },
  ],
];
