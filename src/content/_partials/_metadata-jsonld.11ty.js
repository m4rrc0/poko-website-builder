// This file calls ld.js via the computed `data.ld` object
// All the construction logic is handled by src/data/structured-data/ld.js
export default function (data) {
  const ldData = data.ld;

  // If no JSON-LD data, return nothing
  if (!ldData) return "";

  // Inject the final block
  return `<script type="application/ld+json">
${JSON.stringify(ldData, null, 2)}
</script>`;
}

// import { COLLECTIONS, BASE_URL } from "env.config";

// export default async function (data) {
//   const { metadata = {} } = data;
//   const imgStats = this.imgStats;

//   // collectionDir is calculated by eleventyComputed.js
//   // ex: /fr/events/my-event -> "events"
//   const collectionName = data.collectionDir;
//   const schemaType =
//     COLLECTIONS[collectionName]?.ldType ?? collectionName ?? "WebPage";

//   // ─── Helpers ──────────────────────────────────────────────────────────────

//   const asImageObject = async (img) => {
//     if (!img) return undefined;
//     // img.src starts with "/" but imageFilter does `${WORKING_DIR}/${input}`
//     // -> we remove the initial slash to avoid a double slash
//     const src = (img.src ?? img).replace(/^\//, "");
//     const stats = await imgStats(src);
//     // Object.values().flat().find() -> first available format (webp, jpeg, etc.)
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
//     // YAML stores each offer under a nested "offer" key -> we flatten it
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

//   // Resolve a relation slug -> Eleventy item (via .page.fileSlug)
//   const resolveSlug = (collectionItems, slug) =>
//     collectionItems?.find((item) => item.page.fileSlug === slug);

//   // Resolve a list of slugs -> Schema.org Person[]
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

//   // ─── Common properties ──────────────────────────────────────────────────

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

//   // ─── Specific properties ───────────────────────────────────────────────

//   // Articles: author, datePublished, dateModified
//   if (metadata.author) jsonLd.author = await resolvePeople(metadata.author);
//   if (metadata.datePublished) jsonLd.datePublished = metadata.datePublished;
//   if (metadata.dateModified) jsonLd.dateModified = metadata.dateModified;

//   // Services: slogan
//   if (metadata.slogan) jsonLd.slogan = metadata.slogan;

//   // People: jobTitle, sameAs (from links[].link.url)
//   if (metadata.jobTitle) jsonLd.jobTitle = metadata.jobTitle;
//   if (Array.isArray(metadata.links) && metadata.links.length > 0) {
//     // not possible to display "name" of "link"
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

//   // FAQs: mainEntity -> Question[] + acceptedAnswer
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

//   // ─── Cleaning undefined values ──────────────────────────────────────────────

//   const clean = Object.fromEntries(
//     Object.entries(jsonLd).filter(([, v]) => v !== undefined),
//   );

//   return `<script type="application/ld+json">
// ${JSON.stringify(clean, null, 2)}
// </script>`;
// }
