import { getSelectedCollections } from "../cms-config/index.js";

const selectedCollections = getSelectedCollections();

// Build autoTagNameDico dynamically from selected collections
// Each entry maps collectionName -> collectionName (used for tag matching)
const autoTagNameDico = Object.fromEntries([
  ["pages", "pages"], // always included
  ...selectedCollections.map((col) => [col.name, col.name]),
]);

export const tags = (data) => {
  data.lang;

  const fileMainDir = data.page.filePathStem
    .replace(/^\/+/, "") // Remove leading slashes
    .split("/")[0]; // Get the first directory

  const col = autoTagNameDico[fileMainDir] || fileMainDir;
  const autoTags = [
    fileMainDir,
    col,
    `collection:${fileMainDir}`,
    ...(data.lang
      ? [data.lang, `lang:${data.lang}`, `${data.lang}:${fileMainDir}`]
      : []),
  ];
  // console.log({data})
  const tagsList = [...(data.tags || []), ...autoTags];
  // remove duplicates
  const uniqueTags = [...new Set(tagsList)];

  return uniqueTags;
};

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  for (const [key, value] of Object.entries(autoTagNameDico)) {
    eleventyConfig.addCollection(key, function (collectionsApi) {
      return collectionsApi
        .getAllSorted()
        .reverse()
        .filter(function (item) {
          const tags = item.data.tags || [];
          // Match main directory which might be after the lang code
          // Key should be the first or second segment of the path
          // const keyRegex = new RegExp(`^/*(${key})`);
          // const keyMatch = keyRegex.test(item.page.filePathStem);

          //   const fileMainDir = item.page.filePathStem
          //     .replace(/^\/+/, "") // Remove leading slashes
          //     .split("/")[0]; // Get the first directory
          // return fileMainDir === key || tags.includes(key);

          const fileDirs = item.page.filePathStem
            .replace(/^\/+/, "") // Remove leading slashes
            .split("/") // Get the first directory
            .filter(Boolean)
            .slice(0, 2);
          const keyMatch = fileDirs.includes(key);

          //   console.log({ fileDirs, keyMatch, key, tags });

          return keyMatch || tags.includes(key);
        });
    });
    // eleventyConfig.addCollection(value, function (collectionsApi) {
    //   return collectionsApi
    //     .getAllSorted()
    //     .reverse()
    //     .filter(function (item) {
    //       const tags = item.data.tags || [];
    //       const fileMainDir = item.page.filePathStem
    //         .replace(/^\/+/, "") // Remove leading slashes
    //         .split("/")[0]; // Get the first directory

    //       return fileMainDir === value || tags.includes(value);
    //     });
    // });
  }
}
