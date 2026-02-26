export default async function (data, customData) {
  // console.log("page-nav.11ty.js", data, customData);
  const partialSc = this.partial;
  const lang = data.lang;
  const navData = data[lang]?.nav;
  // customNav est dans globalSettings (pas dans la page), donc data.globalSettings.customNav
  const customNav = data.globalSettings?.customNav;
  const selectedPageNav = data.pageNav; // selected nav on pages
  const pageNav = navData
    ? selectedPageNav && navData[selectedPageNav]
      ? navData[selectedPageNav]
      : customNav && navData[customNav]
        ? navData[customNav]
        : Object.values(navData)[0]
    : null;

  // TODO: Normalize nav data
  // output semantic HTML by default but allow defining a custom partial
  // Inspiration: https://picocss.com/docs/nav
  // Also embed a {% css %} partial so themes can override styles without touching semantics

  // Résout un linkTo brut (YAML) en objet nav normalisé — appelé récursivement sur les subItems
  const resolveNavItem = (linkTo) => {
    // subItems : conteneur de sous-items, pas de collection associée
    if (linkTo.type === "subItems") {
      const subItems = (linkTo.subItems || [])
        .filter((sub) => sub?.linkTo)
        .map((sub) => resolveNavItem(sub.linkTo));
      return {
        type: linkTo.type,
        label: linkTo.label || "—",
        url: null,
        imageSrc: null,
        hasImage: false,
        hasSubItems: subItems.length > 0,
        subItems,
      };
    }

    // url : lien simple, pas de collection, pas de sous-items
    if (!linkTo.type || linkTo.type === "url") {
      const imageSrc = linkTo.image?.src || null;
      const rawLabel = linkTo.label || (linkTo.url ? linkTo.url : "—");
      return {
        type: linkTo.type,
        slug: linkTo.slug,
        label: rawLabel,
        url: linkTo.url,
        imageSrc,
        hasImage: !!imageSrc,
        hasSubItems: false,
        subItems: [],
      };
    }

    // type de collection (pages, articles, projects…) : on résout depuis Eleventy
    // Note: pour les fichiers index.md, page.fileSlug est "" (vide), pas "index"
    // On compare donc aussi le dernier segment du filePathStem
    const page = data.collections[linkTo.type]?.find((p) => {
      const stemSlug = p.page.filePathStem.split("/").at(-1);
      return p.page.fileSlug === linkTo.slug || stemSlug === linkTo.slug;
    });
    const imageSrc = linkTo.image?.src || null;
    const rawLabel = linkTo.label || page?.data.title || linkTo.slug || "";
    return {
      type: linkTo.type,
      slug: page?.page.fileSlug ?? linkTo.slug,
      label: rawLabel,
      // Résoudre l'URL dans la langue courante via templateTranslations
      // (sinon on tomberait toujours sur la version FR à la racine)
      url:
        page?.data.templateTranslations?.find((t) => t.lang === lang)?.url ??
        page?.page.url ??
        linkTo.url,
      // image: linkTo.image override > image de la page cible
      imageSrc,
      hasImage: !!imageSrc,
      hasSubItems: false,
      subItems: [],
    };
  };

  const nav2 = pageNav?.map(({ items }) => {
    return {
      groups: items.map((item) => resolveNavItem(item.linkTo)),
    };
  });

  return pageNav
    ? await partialSc.call({ ...data }, "_page-nav", { ...data, nav: nav2 })
    : await partialSc.call({ ...data }, "_main-nav", { ...data, nav: nav2 });
}
