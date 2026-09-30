// Single source of truth for CMS entry urls used in previews.
// Shared by previewTemplates.js (item data) and preview-njk.js (bundled
// link-shortcode fallback) so a synthesized url and a resolved one are always
// identical — no flicker on first render.
export const adminEntryUrl = (collectionName, slug) =>
  `/admin/#/collections/${collectionName}/entries/${collectionName}/${slug}`;
