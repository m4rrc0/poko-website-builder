import buildLd from "../../data/structured-data/ldWebPage.js";

export default async function (data) {
  // Appelle ldWebPage avec le contexte Eleventy (this) pour accéder aux filtres
  // (this.imgStats, etc.) et avec les données de la page
  const ldArray = await buildLd.call(this, data);

  // Si pas de données (page exclue, etc.), on ne génère rien
  if (!ldArray) return "";

  // Pour chaque objet JSON-LD, on nettoie les undefined et on génère un <script>
  const scripts = ldArray.filter(Boolean).map((obj) => {
    const clean = Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined),
    );
    return `<script type="application/ld+json">
${JSON.stringify(clean, null, 2)}
</script>`;
  });

  return scripts.join("\n");
}

// import { COLLECTIONS, BASE_URL } from "env.config";

// export default async function (data) {
//   const { metadata = {} } = data;
//   const imgStats = this.imgStats;

//   // collectionDir est calculé par eleventyComputed.js
//   // ex: /fr/events/mon-event → "events"
//   const collectionName = data.collectionDir;
//   const schemaType =
//     COLLECTIONS[collectionName]?.ldName ?? collectionName ?? "WebPage";

//   // ─── Helpers ──────────────────────────────────────────────────────────────

//   const asImageObject = async (img) => {
//     if (!img) return undefined;
//     // img.src commence par "/" mais imageFilter fait `${WORKING_DIR}/${input}`
//     // → on retire le slash initial pour éviter le double slash
//     const src = (img.src ?? img).replace(/^\//, "");
//     const stats = await imgStats(src);
//     // Object.values().flat().find() → premier format dispo (webp, jpeg, etc.)
//     return {
//       "@type": "ImageObject",
//       url: stats?.url ? `${BASE_URL}${stats.url}` : undefined,
//       caption: img.alt,
//       width: stats?.width,
//       height: stats?.height,
//     };
//   };

//   const asPostalAddress = (addr) =>
//     addr ? { "@type": "PostalAddress", ...addr } : undefined;

//   const asPlace = (loc) =>
//     loc
//       ? {
//           "@type": "Place",
//           name: loc.name,
//           address: asPostalAddress(loc.address),
//         }
//       : undefined;

//   const asOffer = (item) => {
//     // Le YAML stocke chaque offer sous une clé "offer" imbriquée → on l'aplatit
//     const offer = item?.offer ?? item;
//     if (!offer) return undefined;
//     return {
//       "@type": "Offer",
//       ...offer,
//       ...(offer.availability && {
//         availability: `https://schema.org/${offer.availability}`,
//       }),
//     };
//   };

//   // Résoudre un slug de relation → item Eleventy (via .page.fileSlug)
//   const resolveSlug = (collectionItems, slug) =>
//     collectionItems?.find((item) => item.page.fileSlug === slug);

//   // Résoudre une liste de slugs → Person[] Schema.org
//   const resolvePeople = async (slugsRaw) => {
//     if (!slugsRaw) return undefined;
//     const slugs = Array.isArray(slugsRaw) ? slugsRaw : [slugsRaw];
//     return Promise.all(
//       slugs.map(async (slug) => {
//         const item = resolveSlug(data.collections.people, slug);
//         if (!item) return { "@type": "Person", name: slug };
//         const m = item.data.metadata ?? {};
//         return {
//           "@type": "Person",
//           name: item.data.name,
//           ...(m.jobTitle && { jobTitle: m.jobTitle }),
//           ...(m.image && { image: await asImageObject(m.image) }),
//           ...(item.page.url && { url: item.page.url }),
//         };
//       }),
//     );
//   };

//   // ─── Propriétés communes ──────────────────────────────────────────────────

//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": schemaType,
//     name: metadata.title,
//     description: metadata.description,
//     image: metadata.image ? await asImageObject(metadata.image) : undefined,
//     location: metadata.location ? asPlace(metadata.location) : undefined,
//     address: metadata.address ? asPostalAddress(metadata.address) : undefined,
//     offers: Array.isArray(metadata.offers)
//       ? metadata.offers.map(asOffer)
//       : metadata.offers
//         ? asOffer(metadata.offers)
//         : undefined,
//   };

//   // ─── Propriétés spécifiques ───────────────────────────────────────────────

//   // Articles: author, datePublished, dateModified
//   if (metadata.author) jsonLd.author = await resolvePeople(metadata.author);
//   if (metadata.datePublished) jsonLd.datePublished = metadata.datePublished;
//   if (metadata.dateModified) jsonLd.dateModified = metadata.dateModified;

//   // Services: slogan
//   if (metadata.slogan) jsonLd.slogan = metadata.slogan;

//   // People: jobTitle, sameAs (depuis links[].link.url)
//   if (metadata.jobTitle) jsonLd.jobTitle = metadata.jobTitle;
//   if (Array.isArray(metadata.links) && metadata.links.length > 0) {
//     // pas possible d'afficher "name" de "link"
//     jsonLd.sameAs = metadata.links
//       .map((item) => item?.link?.url ?? item?.url)
//       .filter(Boolean);
//   }

//   // Organizations: email, telephone
//   if (metadata.email) jsonLd.email = metadata.email;
//   if (metadata.telephone) jsonLd.telephone = metadata.telephone;

//   // Events: startDate, endDate, eventStatus, performer, organizer
//   if (metadata.startDate) jsonLd.startDate = metadata.startDate;
//   if (metadata.endDate) jsonLd.endDate = metadata.endDate;
//   if (metadata.eventStatus)
//     jsonLd.eventStatus = `https://schema.org/${metadata.eventStatus}`;
//   if (metadata.performers)
//     jsonLd.performer = await resolvePeople(metadata.performers);
//   if (metadata.organizers) {
//     const slugs = Array.isArray(metadata.organizers)
//       ? metadata.organizers
//       : [metadata.organizers];
//     jsonLd.organizer = await Promise.all(
//       slugs.map(async (slug) => {
//         const item =
//           resolveSlug(data.collections.organizations, slug) ??
//           resolveSlug(data.collections.people, slug);
//         if (!item) return { "@type": "Organization", name: slug };
//         const m = item.data.metadata ?? {};
//         const type =
//           item.data.collectionDir === "people" ? "Person" : "Organization";
//         return {
//           "@type": type,
//           name: item.data.name,
//           ...(m.email && { email: m.email }),
//           ...(m.telephone && { telephone: m.telephone }),
//           ...(m.image && { image: await asImageObject(m.image) }),
//           ...(item.page.url && { url: item.page.url }),
//         };
//       }),
//     );
//   }

//   // FAQs: mainEntity → Question[] + acceptedAnswer
//   if (Array.isArray(metadata.faq) && metadata.faq.length > 0) {
//     jsonLd.mainEntity = metadata.faq.map((item) => ({
//       "@type": "Question",
//       name: item.question,
//       acceptedAnswer: {
//         "@type": "Answer",
//         text: item.answer,
//       },
//     }));
//   }

//   // ─── Nettoyage des undefined ──────────────────────────────────────────────

//   const clean = Object.fromEntries(
//     Object.entries(jsonLd).filter(([, v]) => v !== undefined),
//   );

//   return `<script type="application/ld+json">
// ${JSON.stringify(clean, null, 2)}
// </script>`;
// }
