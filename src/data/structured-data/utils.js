import { PROD_URL, SITE_NAME } from "../../../env.config.js";

export function getId(templateData) {
  // If no data, we suppose we are referrencing the website itself
  if (!templateData) return `${PROD_URL}/#/schema/WebSite/1`;
  // Infer ldType and slug from templateData
  const { ldType, page } = templateData;
  const slug = page.fileSlug;
  const schemaId = `${PROD_URL}/#/schema/${ldType}/${slug}`;
  // console.log({ ldType, slug, schemaId });
  return schemaId;
}
