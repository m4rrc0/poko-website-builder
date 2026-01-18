export default [
  // Aspect ratio utility
  [/^aspect-ratio-(\d+(?:\.\d+)?)$/, ([, d]) => ({ "aspect-ratio": d })],
  [
    /^width-prose$/,
    ([, d]) => ({
      "max-inline-size": "var(--width-prose)",
      "margin-inline": "auto",
    }),
  ],
  [
    /^width-max$/,
    ([, d]) => ({
      "max-inline-size": "var(--width-max)",
      "margin-inline": "auto",
    }),
  ],
];
