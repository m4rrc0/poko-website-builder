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

// normalisation du chemin du footer selon le préfixe du footer 
const normalizeFooterPartial = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // If author provided an explicit partial path/name, keep as-is.
  if (
    trimmed.includes("/") ||
    trimmed.startsWith("_") ||
    /\.(md|njk|11ty\.js)$/i.test(trimmed)
  ) {
    return trimmed;
  }

  // Otherwise treat the value as a footer slug coming from the `footers` CMS collection.
  return `footer/${trimmed}`;
};

// sauter le préfixe de la langue si présent pour aller chercher le vrai nom de la collection
const getCollectionNameFromPage = (data) => {
  const stem = data?.page?.filePathStem;
  if (typeof stem !== "string" || !stem) return null;
  const parts = stem.split("/").filter(Boolean);
  if (!parts.length) return null;

  // In some setups, filePathStem may be prefixed by locale (e.g. /fr/pages/...)
  if (data?.lang && parts[0] === data.lang && parts[1]) return parts[1];
  return parts[0];
};


// Détermine quel footer afficher en fonction du contexte de la page. Si aucun footer configuré n'est trouvé ou valide, retourne le footer par défaut.

export default async function (data) {
  const partialSc = this.partial;
  const pageFooter = data.pageFooter;
  const globalSettings = data.globalSettings || {};
  const collectionName = getCollectionNameFromPage(data);

  const collectionFooter =
    collectionName && Array.isArray(globalSettings.collectionFooters)
      ? globalSettings.collectionFooters.find(
          (item) =>
            item &&
            item.collection === collectionName &&
            typeof item.footer === "string" &&
            item.footer.trim(),
        )?.footer
      : null;

  const selectedFooter = normalizeFooterPartial(
    pageFooter || collectionFooter || globalSettings.pageFooter,
  );

  let footerContent = null;
  if (selectedFooter) {
    try {
      footerContent = await partialSc(selectedFooter, { ...data });
    } catch {
      footerContent = null;
    }
  }
  if (!footerContent) {
    footerContent = await partialSc("_page-footer", { ...data });
  }

  if (footerContent && !hasTopLevelFooter(footerContent)) {
    footerContent = `<footer>${footerContent}</footer>`;
  }

  return footerContent;
}
