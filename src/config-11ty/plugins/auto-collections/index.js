import { COLLECTIONS } from "../../../../env.config.js";

// export const tags = (data) => {
//   data.lang;

//   const fileMainDir = data.page.filePathStem
//     .replace(/^\/+/, "") // Remove leading slashes
//     .split("/")[0]; // Get the first directory

//   const col = autoTagNameDico[fileMainDir] || fileMainDir;
//   const autoTags = [
//     fileMainDir,
//     col,
//     `collection:${fileMainDir}`,
//     ...(data.lang
//       ? [data.lang, `lang:${data.lang}`, `${data.lang}:${fileMainDir}`]
//       : []),
//   ];
//   // console.log({data})
//   const tagsList = [...(data.tags || []), ...autoTags];
//   // remove duplicates
//   const uniqueTags = [...new Set(tagsList)];

//   return uniqueTags;
// };

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  for (const [key, col] of Object.entries(COLLECTIONS)) {
    eleventyConfig.addCollection(col.name, function (collectionsApi) {
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
            .slice(1, 2);
          const keyMatch = fileDirs[0] === col.name;

          // console.log({ fileDirs, keyMatch, col, tags });

          return keyMatch || tags.includes(col.name);
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
