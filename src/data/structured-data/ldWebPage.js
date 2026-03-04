import { COLLECTIONS, BASE_URL } from "env.config";
import { getId } from "./utils";

export default async function (data) {
  const imgStats = this.imgStats;
  // console.log(data);
  if (
    !data ||
    Object.keys(data).length === 0 ||
    data.eleventyExcludeFromCollections
  )
    return;

  const metadata = data.metadata ?? {};

  const asImageObject = async (img) => {
    if (!img) return undefined;
    // img.src commence par "/" mais imageFilter fait `${WORKING_DIR}/${input}`
    // → on retire le slash initial pour éviter le double slash
    const src = (img.src ?? img).replace(/^\//, "");
    const stats = await imgStats(src);
    // Object.values().flat().find() → premier format dispo (webp, jpeg, etc.)
    return {
      "@type": "ImageObject",
      url: stats?.url ? `${BASE_URL}${stats.url}` : undefined,
      caption: img.alt,
      width: stats?.width,
      height: stats?.height,
    };
  };

  const asPostalAddress = (addr) =>
    addr ? { "@type": "PostalAddress", ...addr } : undefined;

  const asPlace = (loc) =>
    loc
      ? {
          "@type": "Place",
          name: loc.name,
          address: asPostalAddress(loc.address),
        }
      : undefined;

  const asOffer = (item) => {
    // Le YAML stocke chaque offer sous une clé "offer" imbriquée → on l'aplatit
    const offer = item?.offer ?? item;
    if (!offer) return undefined;
    return {
      "@type": "Offer",
      ...offer,
      ...(offer.availability && {
        availability: `https://schema.org/${offer.availability}`,
      }),
    };
  };

  // Résoudre un slug → item Eleventy
  const resolveSlug = (collectionItems, slug) =>
    collectionItems?.find((item) => item.page.fileSlug === slug);

  // Résoudre une liste de slugs → références @id (pattern Yoast)
  const resolvePeople = (slugsRaw) => {
    if (!slugsRaw) return undefined;
    const slugs = Array.isArray(slugsRaw) ? slugsRaw : [slugsRaw];
    const refs = slugs.map((slug) => {
      const item = resolveSlug(data.collections?.people, slug);
      if (item) return { "@id": getId(item.data) };
      return { name: slug }; // fallback si la page person n'existe pas
    });
    return refs.length === 1 ? refs[0] : refs;
  };

  // ──────────────────────────────────────────────────

  const jsonLd = {
    ...metadata,
    ...(Array.isArray(metadata?.links) &&
      metadata.links.length > 0 && {
        sameAs: metadata.links
          .map((item) => item?.link?.url ?? item?.url)
          .filter(Boolean),
      }),
  };

  if (metadata.location) jsonLd.location = asPlace(metadata.location);
  if (metadata.address) jsonLd.address = asPostalAddress(metadata.address);

  // Relations → références @id (synchrones, pattern Yoast)
  if (metadata.author) jsonLd.author = resolvePeople(metadata.author);
  if (metadata.performers)
    jsonLd.performer = resolvePeople(metadata.performers);
  if (metadata.organizers)
    jsonLd.organizer = resolvePeople(metadata.organizers);

  if (metadata.eventStatus)
    jsonLd.eventStatus = `https://schema.org/${metadata.eventStatus}`;

  if (metadata.offers)
    jsonLd.offers = Array.isArray(metadata.offers)
      ? metadata.offers.map(asOffer)
      : asOffer(metadata.offers);

  if (metadata.image) jsonLd.image = await asImageObject(metadata.image);

  // FAQs: mainEntity → Question[] + acceptedAnswer
  if (Array.isArray(metadata.faq) && metadata.faq.length > 0) {
    jsonLd.mainEntity = metadata.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }));
  }

  // Supprimer les clés brutes copiées par ...metadata qui ont été remplacées
  // ou qui ne sont pas des champs Schema.org valides
  delete jsonLd.links;
  delete jsonLd.title; // Schema.org utilise "name", pas "title"
  delete jsonLd.performers; // remplacé par "performer" (traité)
  delete jsonLd.organizers; // remplacé par "organizer" (traité)
  delete jsonLd.faq; // remplacé par "mainEntity" (traité)
  // "image" brut (objet {src, alt}) → on le supprime, l'image sera traitée si besoin
  // Si vous voulez garder l'image, utilisez asImageObject qui génère un ImageObject complet
  delete jsonLd.image;

  for (const key in jsonLd) {
    if (!jsonLd[key]) delete jsonLd[key];
  }

  const WebPage = {
    "@type": "WebPage",
    "@id": data.url, // WebPage is an exception: use the url and keep the ID for the more precise type
    url: data.url,
    name: data.title,
    description: data.metadata?.description,
    image: data.metadata?.image,
    isPartOf: {
      "@id": data.ldWebSite?.["@id"],
    },
  };

  const collectionDir = data.collectionDir;
  const schemaType =
    COLLECTIONS[collectionDir]?.ldName ?? collectionDir ?? "WebPage";

  const CollectionItem = {
    "@type": schemaType,
    "@id": getId(data),
    name: data.title ?? metadata.title,
    headline: data.title ?? metadata.title,
    isPartOf: {
      "@id": data.url,
    },
    mainEntityOfPage: {
      "@id": data.url,
    },
    ...jsonLd,

    // author, performer, organizer, eventStatus, offers, location
    // → déjà présents via ...jsonLd (calculés ci-dessus)
  };
  return [WebPage, CollectionItem];
}
