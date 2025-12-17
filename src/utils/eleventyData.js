export function cleanupExpensiveData(circularData) {
  // console.log({ circularData });
  const {
    brand,
    brandStyles,
    brandConfig,
    fontServices,
    eleventyComputed,
    externalStylesInline,
    eleventy,
    pkg,
    collections,
    ...data
  } = circularData;

  return data;
}
