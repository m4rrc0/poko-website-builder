export default async function (data) {
  const partialSc = this.partial;
  const lang = data.lang;
  const navData = data[lang]?.nav;
  // customNav est dans globalSettings (pas dans la page), donc data.globalSettings.customNav
  const customNav = data.globalSettings?.customNav;
  const pageNav = navData
    ? customNav && navData[customNav]
      ? navData[customNav]
      : Object.values(navData)[0]
    : null;

  // TODO: Normalize nav data
  // output semantic HTML by default but allow defining a custom partial
  // Inspiration: https://picocss.com/docs/nav
  // Also embed a {% css %} partial so themes can override styles without touching semantics

  // Résout un linkTo brut (YAML) en objet nav normalisé — appelé récursivement sur les subItems
  const resolveNavItem = (linkTo) => {
    // url / label : pas de collection associée, on retourne tel quel
    if (!linkTo.type || linkTo.type === "url" || linkTo.type === "label") {
      const subItems = (linkTo.subItems || [])
        .filter((sub) => sub?.linkTo)
        .map((sub) => resolveNavItem(sub.linkTo));
      const imageSrc = linkTo.image?.src || null;
      const rawLabel =
        linkTo.label ||
        (linkTo.type === "url" && linkTo.url
          ? new URL(linkTo.url).hostname
          : "—");
      return {
        type: linkTo.type,
        slug: linkTo.slug,
        label: rawLabel,
        url: linkTo.url,
        imageSrc,
        imageAlt: linkTo.image?.alt || rawLabel,
        imageTitle: linkTo.image?.title,
        imageWidth: linkTo.image?.width,
        imageAspectRatio: linkTo.image?.aspectRatio,
        imageLoading: linkTo.image?.loading,
        imageAttrs: linkTo.image?.imgAttrs,
        hasImage: !!imageSrc,
        hasSubItems: subItems.length > 0,
        subItems,
      };
    }

    // type de collection (pages, articles, projects…) : on résout depuis Eleventy
    // Note: pour les fichiers index.md, page.fileSlug est "" (vide), pas "index"
    // On compare donc aussi le dernier segment du filePathStem
    const page = data.collections[linkTo.type]?.find((p) => {
      const stemSlug = p.page.filePathStem.split("/").at(-1);
      return p.page.fileSlug === linkTo.slug || stemSlug === linkTo.slug;
    });
    const subItems = (linkTo.subItems || [])
      .filter((sub) => sub?.linkTo)
      .map((sub) => resolveNavItem(sub.linkTo));
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
      imageAlt: linkTo.image?.alt || rawLabel,
      imageTitle: linkTo.image?.title,
      imageWidth: linkTo.image?.width,
      imageAspectRatio: linkTo.image?.aspectRatio,
      imageLoading: linkTo.image?.loading,
      imageAttrs: linkTo.image?.imgAttrs,
      hasImage: !!imageSrc,
      hasSubItems: subItems.length > 0,
      subItems,
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
