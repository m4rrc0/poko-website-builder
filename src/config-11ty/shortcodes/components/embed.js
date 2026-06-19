// TODO: currently rely on eleventy-plugin-youtube-embed but should be more flexible
export function embed(url, attr) {
  // const { tag = "div", __keywords, ...attrs } = attr || {};

  return `<p>${url}</p>`;
}
