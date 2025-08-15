// TODO: WIP: Check ctx.css layouts are properly implemented

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

  // Flow utility - basic
  [
    /^flow$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.flow)`,
          display: "flex",
          "flex-direction": "column",
          "justify-content": "flex-start",
        },
        {
          [symbols.selector]: () => `:where(.flow:not(.horizontal)) > *`,
          "margin-block": "0",
        },
        {
          [symbols.selector]: () => `:where(.flow:not(.horizontal)) > * + *`,
          "margin-block-start": "var(--flow-space, 1em)",
        },
        {
          [symbols.selector]: () => `:where(.flow:not(.horizontal):only-child)`,
          "block-size": "100%",
        },
      ];
    },
  ],

  // Flow recursive modifier
  [
    /flow[\s\S]*recursive/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () =>
            `:where(.flow.recursive:not(.horizontal)) *`,
          "margin-block": "0",
        },
        {
          [symbols.selector]: () =>
            `:where(.flow.recursive:not(.horizontal)) * + *`,
          "margin-block-start": "var(--flow-space, 1em)",
        },
      ];
    },
  ],

  // Flow horizontal modifier
  [
    /flow[\s\S]*horizontal/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.flow.horizontal)`,
          "flex-direction": "row",
          "align-items": "center",
        },
        {
          [symbols.selector]: () => `:where(.flow.horizontal) > *`,
          "margin-inline": "0",
        },
        {
          [symbols.selector]: () => `:where(.flow.horizontal) > * + *`,
          "margin-inline-start": "var(--gap-stack)",
        },
        {
          [symbols.selector]: () => `:where(.flow.horizontal:only-child)`,
          "inline-size": "100%",
        },
      ];
    },
  ],

  // Flow horizontal recursive modifier
  [
    /flow[\s\S]*horizontal[\s\S]*recursive/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.flow.horizontal.recursive) *`,
          "margin-inline": "0",
        },
        {
          [symbols.selector]: () => `:where(.flow.horizontal.recursive) * + *`,
          "margin-inline-start": "var(--gap-stack)",
        },
      ];
    },
  ],

  // Flow split-after-me modifier
  [
    /flow[\s\S]*split-after-me/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () =>
            `:where(.flow:not(.horizontal)) > .split-after-me`,
          "margin-block-end": "auto",
        },
        {
          [symbols.selector]: () =>
            `:where(.flow.horizontal) > .split-after-me`,
          "margin-inline-end": "auto",
        },
      ];
    },
  ],

  // Flow split-after-[1-5] modifiers
  [
    /flow[\s\S]*split-after-(\d+)/,
    (match, { symbols }) => {
      const num = match[1];
      return [
        {
          [symbols.selector]: () =>
            `:where(.flow:not(.horizontal).split-after-${num}) > :nth-child(${num})`,
          "margin-block-end": "auto",
        },
        {
          [symbols.selector]: () =>
            `:where(.flow.horizontal.split-after-${num}) > :nth-child(${num})`,
          "margin-inline-end": "auto",
        },
      ];
    },
  ],

  // Flow stop modifier (for recursive)
  [
    /flow[\s\S]*recursive[\s\S]*stop/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () =>
            `:where(.flow:not(.horizontal).recursive.stop) * + *`,
          "margin-block-start": "0",
        },
        {
          [symbols.selector]: () =>
            `:where(.flow.horizontal.recursive.stop) * + *`,
          "margin-inline-start": "0",
        },
      ];
    },
  ],

  // Center utility - basic
  [
    /^center$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.center)`,
        "--gutters-center": "var(--padding, calc(var(--gap, 1em) / 2))",
        display: "block",
        "box-sizing": "content-box",
        "margin-inline": "auto",
        "max-inline-size":
          "var(--max-width, var(--width-max, var(--measure, 60ch)))",
        "padding-inline": "var(--gutters-center)",
      };
    },
  ],

  // Center text modifier
  [
    /center[\s\S]*text/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.center.text)`,
        "text-align": "center",
      };
    },
  ],

  // Center intrinsic modifier
  [
    /center[\s\S]*intrinsic/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.center.intrinsic)`,
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
      };
    },
  ],

  // Cluster utility
  [
    /^cluster$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.cluster)`,
        "--gap-cluster": "var(--gap, 1em)",
        "--justify-cluster": "flex-start",
        "--align-cluster": "center",
        display: "flex",
        "flex-wrap": "wrap",
        gap: "var(--gap-cluster)",
        "justify-content": "var(--justify-cluster)",
        "align-items": "var(--align-cluster)",
      };
    },
  ],

  // With Sidebar utility - basic
  [
    /^with-sidebar$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.with-sidebar)`,
          "--gap-sidebar": "var(--gap, 1em)",
          display: "flex",
          "flex-wrap": "wrap",
          gap: "var(--gap-sidebar)",
        },
      ];
    },
  ],

  // With Sidebar not right modifier
  [
    /^with-sidebar(?!.*right)/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () =>
            `:where(.with-sidebar:not(.right)) > :first-child`,
          "flex-basis": "var(--width-sidebar)",
          "flex-grow": "1",
        },
        {
          [symbols.selector]: () =>
            `:where(.with-sidebar:not(.right)) > :last-child`,
          "flex-basis": "0",
          "flex-grow": "999",
          "min-inline-size": "var(--content-min, 50%)",
        },
      ];
    },
  ],

  // With Sidebar right modifier
  [
    /^with-sidebar[\s\S]*right/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.with-sidebar.right) > :last-child`,
          "flex-basis": "var(--width-sidebar)",
          "flex-grow": "1",
        },
        {
          [symbols.selector]: () =>
            `:where(.with-sidebar.right) > :first-child`,
          "flex-basis": "0",
          "flex-grow": "999",
          "min-inline-size": "var(--content-min, 50%)",
        },
      ];
    },
  ],

  // Switcher utility - basic
  [
    /^switcher$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.switcher)`,
          "--gap-switcher": "var(--gap, 1em)",
          display: "flex",
          "flex-wrap": "wrap",
          gap: "var(--gap-switcher)",
        },
        {
          [symbols.selector]: () => `:where(.switcher) > *`,
          "flex-grow": "var(--grow-switcher, 1)",
          "flex-basis": "calc((var(--width-wrap, 30rem) - 100%) * 999)",
        },
      ];
    },
  ],

  // Switcher limit modifiers
  [
    /switcher[\s\S]*limit-(\d+)/,
    (match, { symbols }) => {
      const num = match[1];
      const nextNum = parseInt(num) + 1;
      return {
        [symbols.selector]: () =>
          `:where(.switcher.limit-${num}) > :nth-last-child(n+${nextNum}), :where(.switcher.limit-${num}) > :nth-last-child(n+${nextNum}) ~ *`,
        "flex-basis": "100%",
      };
    },
  ],

  // Cover utility - basic
  [
    /^cover$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.cover)`,
          "--gap-cover": "var(--gap, 1em)",
          display: "flex",
          "flex-direction": "column",
          "min-block-size": "var(--min-height-cover, 100vh)",
          padding: "var(--gap-cover)",
        },
        {
          [symbols.selector]: () => `:where(.cover) > *`,
          "margin-block": "var(--gap-cover)",
        },
        {
          [symbols.selector]: () =>
            `:where(.cover) > :first-child:not(.centered)`,
          "margin-block-start": "0",
        },
        {
          [symbols.selector]: () =>
            `:where(.cover) > :last-child:not(.centered)`,
          "margin-block-end": "0",
        },
        {
          [symbols.selector]: () => `:where(.cover) > .centered`,
          "margin-block": "auto",
        },
      ];
    },
  ],

  // Cover no-padding modifier
  [
    /cover[\s\S]*no-padding/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.cover.no-padding)`,
        padding: "0",
      };
    },
  ],

  // Grid-auto utility
  [
    /^grid-auto$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.grid-auto)`,
          "--gap-grid": "var(--gap, 1em)",
          display: "grid",
          "grid-gap": "var(--gap-grid)",
          "grid-template-columns":
            "repeat(auto-fit, minmax(min(var(--width-column-min, 10rem), 100%), 1fr))",
        },
        {
          [symbols.selector]: () => `:where(.grid-auto) > *`,
          "max-inline-size": "var(--width-column-max, none)",
        },
      ];
    },
  ],

  // Frame utility
  [
    /^frame$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.frame)`,
          "--n": "16",
          "--d": "9",
          "aspect-ratio": "var(--aspect-ratio, var(--n) / var(--d))",
          overflow: "hidden",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        },
        {
          [symbols.selector]: () => `:where(.frame) > .frame-inner`,
          "inline-size": "100%",
          "block-size": "100%",
          "object-fit": "var(--object-fit-frame, cover)",
        },
      ];
    },
  ],

  // Reel utility - basic
  [
    /^reel$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.reel)`,
          "--gap-reel": "var(--gap, 1em)",
          display: "flex",
          "block-size": "var(--height, auto)",
          "overflow-x": "auto",
          "overflow-y": "hidden",
          "scrollbar-color":
            "var(--color-thumb, currentColor) var(--color-track, transparent)",
        },
        {
          [symbols.selector]: () => `:where(.reel) > *`,
          flex: "0 0 var(--item-width, auto)",
        },
        {
          [symbols.selector]: () => `:where(.reel) > img`,
          "block-size": "100%",
          "flex-basis": "auto",
          width: "auto",
        },
        {
          [symbols.selector]: () => `:where(.reel) > * + *`,
          "margin-inline-start": "var(--gap-reel)",
        },
        {
          [symbols.selector]: () => `:where(.reel)::-webkit-scrollbar`,
          "block-size": "1rem",
        },
        {
          [symbols.selector]: () => `:where(.reel)::-webkit-scrollbar-track`,
          "background-color": "var(--color-track, transparent)",
        },
        {
          [symbols.selector]: () => `:where(.reel)::-webkit-scrollbar-thumb`,
          "background-color": "var(--color-track, transparent)",
          "background-image":
            "linear-gradient(var(--color-track, transparent) 0, var(--color-track, transparent) 0.25rem, var(--color-thumb, currentColor) 0.25rem, var(--color-thumb, currentColor) 0.75rem, var(--color-track, transparent) 0.75rem)",
        },
      ];
    },
  ],

  // Reel no-bar modifier
  [
    /reel[\s\S]*no-bar/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.reel.no-bar)`,
          "scrollbar-width": "none",
        },
        {
          [symbols.selector]: () => `:where(.reel.no-bar)::-webkit-scrollbar`,
          display: "none",
        },
      ];
    },
  ],

  // Reel overflowing modifier
  [
    /reel[\s\S]*overflowing/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.reel.overflowing:not(.no-bar))`,
        "padding-block-end": "var(--gap-reel)",
      };
    },
  ],

  // Reel no-js modifier
  [
    /reel[\s\S]*no-js/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.reel.no-js:not(.no-bar))`,
        "padding-block-end": "var(--gap-reel)",
      };
    },
  ],

  // Imposter utility - basic
  [
    /^imposter$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.imposter)`,
          display: "block",
          position: "var(--position-imposter, absolute)",
          "inset-block-start": "50%",
          "inset-inline-start": "50%",
          transform: "translate(-50%, -50%)",
        },
      ];
    },
  ],

  // Imposter utility - NOT breakout modifier
  [
    /^imposter(?!.*breakout)/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.imposter:not(.breakout))`,
          "--margin-imposter": "0px",
          overflow: "auto",
          "max-inline-size": "calc(100% - (var(--margin-imposter) * 2))",
          "max-block-size": "calc(100% - (var(--margin-imposter) * 2))",
        },
      ];
    },
  ],

  // Imposter fixed modifier
  [
    /imposter[\s\S]*fixed/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.imposter.fixed)`,
        position: "var(--position-imposter, fixed)",
      };
    },
  ],

  // Icon utility - basic
  [
    /^icon$/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.icon)`,
        width: "var(--width-icon, 0.75em)",
        height: "var(--height-icon, 0.75em)",
        "vertical-align": "var(--vertical-align-icon, -0.125em)",
      };
    },
  ],

  // Icon lowercase modifier
  [
    /icon[\s\S]*lowercase/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.icon.lowercase)`,
          width: "var(--width-icon, 1ex)",
          height: "var(--height-icon, 1ex)",
        },
      ];
    },
  ],

  // Icon sub modifier
  [
    /icon[\s\S]*sub/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.icon.sub)`,
          width: "var(--width-icon, 0.25em)",
          height: "var(--height-icon, 0.25em)",
          "vertical-align": "var(--vertical-align-icon, sub)",
        },
      ];
    },
  ],

  // Icon super modifier
  [
    /icon[\s\S]*super/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.icon.super)`,
          width: "var(--width-icon, 0.25em)",
          height: "var(--height-icon, 0.25em)",
          "vertical-align": "var(--vertical-align-icon, super)",
        },
      ];
    },
  ],

  // With-icon utility
  [
    /^with-icon$/,
    (match, { symbols }) => {
      return [
        {
          [symbols.selector]: () => `:where(.with-icon)`,
          display: "inline-flex",
          "align-items": "baseline",
        },
        {
          [symbols.selector]: () => `:where(.with-icon:not(.right)) .icon`,
          "margin-inline-end": "var(--gap-icon, 1ch)",
        },
        {
          [symbols.selector]: () => `:where(.with-icon) .icon:only-child`,
          "margin-inline-end": "0",
          "margin-inline-start": "0",
        },
      ];
    },
  ],

  // With-icon lowercase modifier
  [
    /with-icon[\s\S]*lowercase/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.with-icon.lowercase)`,
        "text-transform": "lowercase",
      };
    },
  ],

  // With-icon right modifier
  [
    /with-icon[\s\S]*right/,
    (match, { symbols }) => {
      return {
        [symbols.selector]: () => `:where(.with-icon.right) .icon`,
        "margin-inline-start": "var(--gap-icon, 1ch)",
      };
    },
  ],
];
