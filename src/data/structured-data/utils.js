import { PROD_URL, SITE_NAME, COLLECTIONS } from "../../../env.config.js";

export function getId(templateData) {
  // If no data, we suppose we are referrencing the website itself
  if (!templateData) return `${PROD_URL}/#/schema/WebSite/1`;
  // Infer ldName and slug from templateData
  const { collectionDir, page } = templateData;
  const ldName = COLLECTIONS[collectionDir].ldName;
  const slug = page.fileSlug;
  const schemaId = `${PROD_URL}/#/schema/${ldName}/${slug}`;
  // console.log({ ldName, slug, schemaId });
  return schemaId;
}
