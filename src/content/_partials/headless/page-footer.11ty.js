// njk logic that was in place
//
// {% if '_footer.njk' | partialExists %}
//   {% partial '_footer.njk' %}
// {% elif '_footer.md' | partialExists %}
//   <footer>{% partial '_footer.md' %}</footer>
// {% else %}
//   {% partial '_footer' %}
// {% endif %}

const hasTopLevelFooter = (html) => {
  const noComments = html.replace(/<!--[\s\S]*?-->/g, "");
  const tagPattern = /<\/?([a-z][a-z0-9-]*)[^>]*\/?>/gi;
  let depth = 0;
  let match;
  const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
  ]);
  while ((match = tagPattern.exec(noComments)) !== null) {
    const [fullMatch, tagName] = match;
    const tag = tagName.toLowerCase();
    const isClosing = fullMatch.startsWith("</");
    const isSelfClosing = fullMatch.endsWith("/>") || voidElements.has(tag);
    if (isClosing) {
      depth = Math.max(0, depth - 1);
    } else if (tag === "footer" && depth === 0) {
      return true;
    } else if (!isSelfClosing) {
      depth++;
    }
  }
  return false;
};

export default async function (data) {
  const partialSc = this.partial;
  const pageFooter = data.pageFooter;

  let footerContent = pageFooter
    ? await partialSc.call({ ...data }, pageFooter, { ...data })
    : await partialSc.call({ ...data }, "_page-footer", { ...data });

  if (footerContent && !hasTopLevelFooter(footerContent)) {
    footerContent = `<footer>${footerContent}</footer>`;
  }

  return footerContent;
}
