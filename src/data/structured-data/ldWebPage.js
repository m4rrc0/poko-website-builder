import { COLLECTIONS, BASE_URL, DEBUG } from "../../../env.config.js";
import { getId } from "./utils.js";

export async function ldWebPage(data) {
  const imgStats = this.imgStats;
  if (
    !data ||
    Object.keys(data).length === 0 ||
    data.eleventyExcludeFromCollections
  )
    return "";

  const metadata = data.metadata ?? {};

  const asImageObject = async (img) => {
    if (!img) return undefined;
    // img.src starts with "/" but imageFilter does `${WORKING_DIR}/${input}`
    // → remove the initial slash to avoid double slash
    const src = (img.src ?? img).replace(/^\//, "");
    const stats = await imgStats(src);
    // Object.values().flat().find() → first format available (webp, jpeg, etc.)
    return stats?.url
      ? {
          "@type": "ImageObject",
          url: `${BASE_URL}${stats.url}`,
          caption: img.alt,
          width: stats?.width,
          height: stats?.height,
        }
      : undefined;
  };

  // TODO: check address pour etre sur que ce n'est pas vide
  const asPostalAddress = (addr) => {
    if (!addr) return undefined;

    // Fetch all values (ex: ["Paris", undefined, "", "75000"])
    // and check if there is at least one that exists (truthy) and is not an empty string.
    const hasRealValues = Object.values(addr).some(
      (val) => val && val.trim?.() !== "",
    );

    return hasRealValues ? { "@type": "PostalAddress", ...addr } : undefined;
  };

  const asPlace = (loc) => {
    if (!loc) return undefined;

    const address = asPostalAddress(loc.address);
    const hasName = loc.name?.trim?.() !== "" && !!loc.name;

    if (!address && !hasName) return undefined;

    return {
      "@type": "Place",
      ...(hasName ? { name: loc.name } : {}),
      ...(address ? { address } : {}),
    };
  };

  const asOffer = (offer) => {
    // TODO: faire un meilleur check pour plus de certitude
    // YAML stores each offer under a nested "offer" key -> we flatten it
    if (!offer || typeof offer !== "object" || Object.keys(offer).length === 0)
      return undefined;
    return {
      "@type": "Offer",
      ...offer,
    };
  };

  const resolveSlug = (collectionItems, slug) =>
    Array.from(collectionItems || []).find(
      (item) => (item.page?.fileSlug || item.fileSlug) === slug,
    );

  // Resolve a list of slugs to full objects (Yoast-like but expanded)
  const resolvePeople = async (slugsRaw) => {
    if (!slugsRaw) return undefined;
    const slugs = Array.isArray(slugsRaw) ? slugsRaw : [slugsRaw];

    const refs = await Promise.all(
      slugs
        .filter((slug) => slug && slug.trim?.() !== "")
        .map(async (slug) => {
          let item = resolveSlug(data.collections?.people, slug);

          // Fallback: search in all items if specific collection is empty
          if (!item) {
            item = resolveSlug(data.collections?.all, slug);
          }

          if (item) {
            const m = item.data?.metadata || {};
            const res = {
              "@type": item.data?.ldType || "Person",
              "@id": getId(item.data),
              name: item.data?.name || item.data?.title || slug,
            };
            if (item.data?.page?.metadata?.description)
              res.description = item.data?.page?.metadata?.description;
            if (item.page?.url) res.url = `${BASE_URL}${item.page.url}`;
            if (m.image) {
              const imgObj = await asImageObject(m.image);
              if (imgObj) res.image = imgObj;
            }
            if (m.jobTitle) res.jobTitle = m.jobTitle;
            return res;
          }

          // Predictive fallback to at least have the @id even if collection not ready
          return {
            "@type": "Person",
            "@id": getId({ ldType: "Person", page: { fileSlug: slug } }),
            name: slug,
          };
        }),
    );

    const filtered = refs.filter(Boolean);
    if (filtered.length === 0) return undefined;
    return filtered.length === 1 ? filtered[0] : filtered;
  };

  // ──────────────────────────────────────────────────

  // TODO: faire un check pour filtrer les undefined
  const validLinks = Array.isArray(metadata?.links)
    ? metadata.links
        .map((item) => item?.url)
        .filter((url) => url && url.trim?.() !== "")
    : [];

  const jsonLd = {
    ...metadata,
    ...(validLinks.length > 0 ? { sameAs: validLinks } : {}),
    location: asPlace(metadata.location),
    address: asPostalAddress(metadata.address),
    author: await resolvePeople(metadata.author),
    performer: await resolvePeople(metadata.performer),
    organizer: await resolvePeople(metadata.organizer),
    image: await asImageObject(metadata.image),
  };

  // Relations -> @id references (synchronous, Yoast pattern)

  if (metadata.offers) {
    const offers = Array.isArray(metadata.offers)
      ? metadata.offers.map(asOffer).filter(Boolean)
      : asOffer(metadata.offers);
    if (offers && (!Array.isArray(offers) || offers.length > 0)) {
      jsonLd.offers = offers;
    }
  }

  // Articles: datePublished, dateModified
  if (metadata.datePublished) jsonLd.datePublished = metadata.datePublished;
  if (metadata.dateUpdated) jsonLd.dateUpdated = metadata.dateUpdated;

  // FAQs: mainEntity -> Question[] + acceptedAnswer
  if (Array.isArray(metadata.faq) && metadata.faq.length > 0) {
    const validFaqs = metadata.faq
      .filter((item) => item.question?.trim?.() && item.answer?.trim?.())
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }));
    if (validFaqs.length > 0) {
      jsonLd.mainEntity = validFaqs;
    }
  }

  // Remove raw keys copied by ...metadata that have been replaced
  // or that are not valid Schema.org fields
  delete jsonLd.links;
  delete jsonLd.title; // Schema.org uses "name", not "title"
  delete jsonLd.faq; // replaced by "mainEntity" (processed)

  // Nettoyage complet (récursif) pour enlever les propriétés et objets devenus vides
  const deepClean = (obj) => {
    if (Array.isArray(obj)) {
      for (let i = obj.length - 1; i >= 0; i--) {
        obj[i] = deepClean(obj[i]);
        if (obj[i] === undefined) obj.splice(i, 1);
      }
      return obj.length > 0 ? obj : undefined;
    } else if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        obj[key] = deepClean(obj[key]);
        if (obj[key] === undefined) delete obj[key];
      }
      return Object.keys(obj).length > 0 ? obj : undefined;
    }
    // Retire les strings vides, null ou undefined
    if (obj === undefined || obj === null || obj === "") return undefined;
    return obj;
  };

  deepClean(jsonLd);

  const url = data.page?.url || "";
  const pageUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const pageName = data.name ?? metadata.title ?? "";

  const WebPage = {
    "@type": "WebPage",
    "@id": pageUrl, // WebPage is an exception: use the url and keep the ID for the more precise type
    url: pageUrl,
    name: pageName,
    ...(data.metadata?.description
      ? { description: data.metadata?.description }
      : {}),
    isPartOf: {
      "@id": data.ldWebSite?.["@id"],
    },
    ...(data.metadata?.image
      ? { image: await asImageObject(data.metadata.image) }
      : {}),
  };

  const CollectionItem = {
    "@type": data.ldType,
    "@id": getId(data),
    name: pageName,
    ...(data.metadata?.image
      ? { image: await asImageObject(data.metadata.image) }
      : {}),
    isPartOf: {
      "@id": pageUrl,
    },
    mainEntityOfPage: {
      "@id": pageUrl,
    },
    ...jsonLd,
  };
  // TODO: if webpage classic, don't display the second
  // if it's not a creativeWork, don't display the first
  return [WebPage, CollectionItem];
}
