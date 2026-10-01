import Image from "@11ty/eleventy-img";
import deepmerge from "deepmerge";
import { imageTransformOptions } from "../../plugins/imageTransform.js";
import { isManifestSource, recordImageStats } from "../../image-manifest.js";
import { prepareImageArgs } from "./image.args.js";
import { WORKING_DIR } from "../../../../env.config.js";

export async function image(args) {
  // Shared with the CMS preview stub (preview-njk.js) — the pure arg→attrs
  // computation lives in ./image.args.js so they can't diverge.
  const { srcRaw, width, widths, fallback, wrapperTag, imgAttributes, opts } =
    prepareImageArgs(args);

  const options = deepmerge.all(
    [
      imageTransformOptions,
      {
        returnType: "html",
        ...(widths && { widths }),
        htmlOptions: {
          imgAttributes,
          ...(fallback && { fallback }),
        },
      },
      opts,
    ],
    { arrayMerge: (destinationArray, sourceArray, options) => sourceArray },
  );

  if (!srcRaw) {
    return "<div>Please provide an image source</div>";
  }
  const src = srcRaw.startsWith("/")
    ? `${WORKING_DIR}/${srcRaw}`.replace(/\/+/g, "/")
    : srcRaw;
  let html = await Image(src, options);
  // CMS preview manifest — key by the CMS-facing path (`/_images/…`).
  if (isManifestSource(srcRaw)) {
    try {
      recordImageStats(srcRaw, Image.statsSync(src, options));
    } catch (e) {
      console.warn(`[image-manifest] stats failed for ${srcRaw}:`, e?.message);
    }
  }
  // if (!html) {
  //   console.error({ error, src, options, page: this.page.fileSlug });
  // }
  html = width
    ? html.replace(`${width}w`, "1x").replace(`${width * 2}w`, "2x")
    : html;

  // return `<p>${html}</p>`;
  return wrapperTag && html ? `<${wrapperTag}>${html}</${wrapperTag}>` : html;
}
