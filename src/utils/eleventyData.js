export function cleanupExpensiveData(circularData) {
  // console.log({ circularData });
  const {
    brand,
    brandStyles,
    brandConfig,
    ctxData,
    ctxBrandCss,
    ctxCssEmitMode,
    CtxCssInline,
    htmlExternalCtxCssTag,
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
