import { COLLECTIONS, userCmsConfig } from "../../../../env.config.js";

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

  // Merge built-in collection definitions with user-defined ones from
  // `_config/index.js`. Dedupe by `name`: built-ins are iterated first,
  // so a user collection that reuses a built-in name is skipped (the
  // built-in's auto-collection definition wins, which avoids users
  // accidentally clobbering core collections by spreading `...articles`
  // etc. into a redefinition).
  const userConfig = await userCmsConfig();
  const seen = new Set();
  const allCollectionDefs = [];
  for (const col of [
    ...Object.values(COLLECTIONS),
    ...(userConfig?.collections || []),
  ]) {
    if (!col?.name || seen.has(col.name)) continue;
    seen.add(col.name);
    allCollectionDefs.push(col);
  }

  for (const col of allCollectionDefs) {
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
