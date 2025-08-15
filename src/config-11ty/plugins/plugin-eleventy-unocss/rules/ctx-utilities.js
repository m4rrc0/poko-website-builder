export default [
  // Background overlay utility
  [
    /^background-overlay$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.background-overlay)`,
        "box-shadow": "inset 0 0 0 9999px var(--color-bg)",
      };
    },
  ],

  // Truncate utility
  [
    /^truncate$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.truncate)`,
        "max-width": "100%",
        "white-space": "nowrap",
        overflow: "hidden",
        "text-overflow": "ellipsis",
      };
    },
  ],

  // Truncate lines utility
  [
    /^truncate-lines$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.truncate-lines)`,
        overflow: "hidden",
        display: "-webkit-box",
        "-webkit-line-clamp": "var(--lines, 3)",
        "-webkit-box-orient": "vertical",
      };
    },
  ],

  // Truncate lines overflow utility
  [
    /^truncate-lines-overflow$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.truncate-lines-overflow)`,
          "--lines": "3",
          position: "relative",
          "max-height": "calc(var(--lh, 1.2em) * var(--lines, 3))",
          overflow: "hidden",
          "padding-right": "1rem",
        },
        {
          [symbols.selector]: () => `:where(.truncate-lines-overflow)::before`,
          position: "absolute",
          content: "'...'",
          "inset-block-end": "0",
          "inset-inline-end": "0",
        },
        {
          [symbols.selector]: () => `:where(.truncate-lines-overflow)::after`,
          content: "''",
          position: "absolute",
          "inset-inline-end": "0",
          width: "1rem",
          height: "1rem",
          background: "white",
        },
      ];
    },
  ],

  // Breakout clickable utility
  [
    /^breakout-clickable$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.breakout-clickable)`,
          position: "relative",
          "box-shadow": "var(--shadow-breakout-clickable)",
        },
        {
          [symbols.selector]: () => `:where(.breakout-clickable) .clickable::after`,
          content: "''",
          display: "block",
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
        },
        {
          [symbols.selector]: () => `:where(.breakout-clickable) a:only-of-type::after`,
          content: "''",
          display: "block",
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
        },
        {
          [symbols.selector]: () => `:where(.breakout-clickable):hover`,
          "box-shadow": "var(--shadow-breakout-clickable-hover)",
          transform: "var(--transform-breakout-clickable-hover)",
        },
        {
          [symbols.selector]: () => `:where(.breakout-clickable):focus-within`,
          "box-shadow": "var(--shadow-breakout-clickable-hover)",
          transform: "var(--transform-breakout-clickable-hover)",
        },
        {
          [symbols.selector]: () => `:where(.breakout-clickable) .clickable:focus`,
          outline: "none",
        },
        {
          [symbols.selector]: () => `:where(.breakout-clickable) a:only-of-type:focus`,
          outline: "none",
        },
        {
          [symbols.selector]: () => `:where(.breakout-clickable) .clickable:focus::after`,
          outline: "1px solid var(--color-outline--focus, currentColor)",
          "outline-offset": "calc(var(--focus-offset, 1rem) / 2 * -1)",
        },
        {
          [symbols.selector]: () => `:where(.breakout-clickable) a:only-of-type:focus::after`,
          outline: "1px solid var(--color-outline--focus, currentColor)",
          "outline-offset": "calc(var(--focus-offset, 1rem) / 2 * -1)",
        },
      ];
    },
  ],

  // Full bleed utility
  [
    /^full-bleed$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.full-bleed)`,
        width: "min(99.99vw, var(--full-bleed-max-width, 99.99vw))",
        "margin-left": "calc(50% - min(99.99vw, var(--full-bleed-max-width, 99.99vw)) / 2)",
      };
    },
  ],

  // Full bleed before utility
  [
    /^full-bleed-before$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.full-bleed-before)`,
          position: "relative",
        },
        {
          [symbols.selector]: () => `:where(.full-bleed-before)::before`,
          width: "min(99.99vw, var(--full-bleed-max-width, 99.99vw))",
          "margin-left": "calc(50% - min(99.99vw, var(--full-bleed-max-width, 99.99vw)) / 2)",
          position: "absolute",
          content: "''",
          display: "block",
          background: "inherit",
          inset: "0",
          "z-index": "-1",
        },
      ];
    },
  ],

  // Full bleed after utility
  [
    /^full-bleed-after$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.full-bleed-after)`,
          position: "relative",
        },
        {
          [symbols.selector]: () => `:where(.full-bleed-after)::after`,
          width: "min(99.99vw, var(--full-bleed-max-width, 99.99vw))",
          "margin-left": "calc(50% - min(99.99vw, var(--full-bleed-max-width, 99.99vw)) / 2)",
          position: "absolute",
          content: "''",
          display: "block",
          background: "inherit",
          inset: "0",
          "z-index": "-1",
        },
      ];
    },
  ],

  // Skew border before utility
  [
    /^skew-border-before$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.skew-border-before)`,
          position: "relative",
          "z-index": "0",
        },
        {
          [symbols.selector]: () => `:where(.skew-border-before)::before`,
          background: "inherit",
          content: "''",
          display: "block",
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          height: "100%",
          "z-index": "-1",
          transform: "skewY(var(--skew-before, -1deg))",
          "transform-origin": "var(--skew-before-origin, top left)",
        },
      ];
    },
  ],

  // Skew border after utility
  [
    /^skew-border-after$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.skew-border-after)`,
          position: "relative",
          "z-index": "0",
        },
        {
          [symbols.selector]: () => `:where(.skew-border-after)::after`,
          background: "inherit",
          content: "''",
          display: "block",
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          height: "100%",
          "z-index": "-1",
          transform: "skewY(var(--skew-after, 1deg))",
          "transform-origin": "var(--skew-after-origin, bottom left)",
        },
      ];
    },
  ],

  // External link icons utility
  [
    /^external-link-icons$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.external-link-icons) a[target='_blank']::after`,
          content: "''",
          "background-color": "var(--icon-primary)",
          display: "inline-flex",
          height: "10px",
          "margin-left": "4px",
          "mask-image": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z'/%3E%3Cpath fill-rule='evenodd' d='M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z'/%3E%3C/svg%3E")`,
          "mask-size": "cover",
          width: "10px",
        },
        {
          [symbols.selector]: () => `:where(a.external)::after`,
          content: "''",
          "background-color": "var(--icon-primary)",
          display: "inline-flex",
          height: "10px",
          "margin-left": "4px",
          "mask-image": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z'/%3E%3Cpath fill-rule='evenodd' d='M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z'/%3E%3C/svg%3E")`,
          "mask-size": "cover",
          width: "10px",
        },
      ];
    },
  ],

  // Scroll shadows horizontal utility
  [
    /^scroll-shadows-horizontal$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.scroll-shadows-horizontal)`,
        "background-image": 
          "linear-gradient(to right, white, white), " +
          "linear-gradient(to right, white, white), " +
          "linear-gradient(to right, rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0)), " +
          "linear-gradient(to left, rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0))",
        "background-position": "left center, right center, left center, right center",
        "background-repeat": "no-repeat",
        "background-color": "white",
        "background-size": "20px 100%, 20px 100%, 10px 100%, 10px 100%",
        "background-attachment": "local, local, scroll, scroll",
      };
    },
  ],

  // Scroll shadows radial vertical utility
  [
    /^scroll-shadows-radial-v$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.scroll-shadows-radial-v)`,
        overflow: "auto",
        background:
          "linear-gradient(white 30%, rgba(255, 255, 255, 0)) center top, " +
          "linear-gradient(rgba(255, 255, 255, 0), white 70%) center bottom, " +
          "radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)) center top, " +
          "radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)) center bottom",
        "background-repeat": "no-repeat",
        "background-size": "100% 40px, 100% 40px, 100% 14px, 100% 14px",
        "background-attachment": "local, local, scroll, scroll",
      };
    },
  ],

  // Scroll shadows radial horizontal utility
  [
    /^scroll-shadows-radial-h$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.scroll-shadows-radial-h)`,
        "--_opacity-clr": "rgba(0, 0, 0, 0.2)",
        background:
          "linear-gradient(white 30%, rgba(255, 255, 255, 0)) left center, " +
          "linear-gradient(rgba(255, 255, 255, 0), white 70%) right center, " +
          "radial-gradient(farthest-side at 0 50%, var(--_opacity-clr), rgba(0, 0, 0, 0)) left center, " +
          "radial-gradient(farthest-side at 100% 50%, var(--_opacity-clr), rgba(0, 0, 0, 0)) right center",
        "background-repeat": "no-repeat",
        "background-color": "white",
        "background-size": "2rem 100%, 2rem 100%, 1rem 100%, 1rem 100%",
        "background-attachment": "local, local, scroll, scroll",
      };
    },
  ],
];
