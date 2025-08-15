// TODO: Populate UnoCSS rules from ctx.css layouts and utilities

export default [
  // Box utility
  [
    /^box$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.box)`,
        "--padding-box": "var(--padding, calc(var(--gap, 1em) / 2))",
        "--border-width-box": "var(--border-width, var(--size-border, 1px))",
        display: "block",
        padding: "var(--padding-box)",
        border: "var(--border-width-box) solid",
      };
    },
  ],
  [
    /box[\s\S]*no-border/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.box.no-border)`,
        border: "none",
        outline: "var(--border-width-box) solid transparent",
        "outline-offset": "calc(var(--border-width-box) * -1)",
      };
    },
  ],
];
