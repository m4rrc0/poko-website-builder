// Shared markdown-it configuration used by both the Eleventy md library
// (eleventy.config.js) and the CMS preview renderer (cms-config/preview-md.js).
// Keep in sync with the real pipeline — the preview imports this module so the
// two can never drift.

// `::: tag` containers rendered as their semantic element
export const mdSemanticContainerTags = [
  "section",
  "aside",
  "article",
  "footer",
  "header",
  "nav",
  "main",
  "ul",
  "ol",
  "div",
  "p",
  "hgroup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
];

// `::: name` containers rendered as `<div class="name">` (markdown-it-container default)
export const mdPlainContainerNames = [
  "box",
  "flow",
  "grid-fluid",
  "cluster",
  "switcher",
  "cover",
  "fixed-fluid",
  "prose",
];

export function mditRenderContainerTag(tagName, tokens, idx, options, env, Renderer) {
  tokens[idx].tag = tagName;
  return Renderer.renderToken(tokens, idx, options);
}

export function mRCTOptions(tagName) {
  return {
    render: function (tokens, idx, options, env, Renderer) {
      return mditRenderContainerTag(
        tagName,
        tokens,
        idx,
        options,
        env,
        Renderer,
      );
    },
  };
}
