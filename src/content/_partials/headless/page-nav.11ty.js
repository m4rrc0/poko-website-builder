export default async function (data) {
  const partialSc = this.partial;
  const pageNav = data.pageNav;
  // TODO: Normalize nav data
  // output semantic HTML by default but allow defining a custom partial
  // Inspiration: https://picocss.com/docs/nav
  // Also embed a {% css %} partial so themes can override styles without touching semantics

  return pageNav
    ? await partialSc.call({ ...data }, pageNav, { ...data })
    : await partialSc.call({ ...data }, "_page-nav", { ...data });
}
