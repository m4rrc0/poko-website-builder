import Image from "@11ty/eleventy-img";
import deepmerge from "deepmerge";
import { imageTransformOptions } from "../imageTransform.js";
import { bgCssFor, tinyDataUri } from "../../shortcodes/components/image.js";

// Always set *some* `background-image` on <lite-youtube>: with it unset the
// component fetches i.ytimg.com itself at runtime — the IP leak we exist to
// prevent. This 16x9 dark webp is the last-resort layer when no fetch works.
const FALLBACK_TINY =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoQAAkABABoJaQAA3AA/vDUoAA=";

// First quality whose HEAD request succeeds wins — i.ytimg.com answers 404
// (with a tiny placeholder body) for sizes a video doesn't have, so the
// status line alone is a reliable availability check. Sequential + memoized
// per (id, format, qualities): the common case costs a single request.
const probeCache = new Map();
const headOk = async (url, timeoutMs) => {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch {
    return false;
  }
};

const pickPosterFile = (stats) => {
  // Prefer the first declared format (webp when present), else the last
  // emitted file of whichever format came last.
  const formats = Object.keys(stats || {});
  if (!formats.length) return null;
  const list = stats[formats[0]]?.length ? stats[formats[0]] : stats[formats.at(-1)];
  return list?.at(-1) || null;
};

/**
 * Resolve a video's poster: probe i.ytimg.com candidates top-down, download
 * the winner through the same eleventy-img pipeline as regular images and
 * compose the two-layer LQIP background ([optimized file, tiny base64]).
 * @returns {Promise<{style:string, url:string|null, quality:string|null}>}
 */
export async function resolvePoster(id, poster) {
  const {
    qualities,
    format,
    timeoutMs,
    cacheDuration,
    imageOptions,
    position,
    size,
  } = poster;
  const dir = format === "webp" ? "vi_webp" : "vi";
  const cacheKey = `${id}|${dir}|${qualities.join(",")}`;
  if (!probeCache.has(cacheKey)) {
    probeCache.set(
      cacheKey,
      (async () => {
        // 1. Probe candidates — first hit wins.
        let hit = null;
        for (const q of qualities) {
          const url = `https://i.ytimg.com/${dir}/${id}/${q}.${format}`;
          if (await headOk(url, timeoutMs)) {
            hit = { quality: q, url };
            break;
          }
        }
        // 2. Optimize the winner through the regular image pipeline
        //    (remote URL src is fetched + cached by eleventy-img).
        if (hit) {
          try {
            const stats = await Image(
              hit.url,
              deepmerge.all(
                [
                  imageTransformOptions,
                  imageOptions,
                  {
                    filenameFormat: (_hash, src, w, fmt) =>
                      `yt-${id}-${w}w.${fmt}`,
                    cacheOptions: { duration: cacheDuration },
                  },
                ],
                // Ordered lists (widths, formats) must replace, not concat.
                { arrayMerge: (_d, s) => s },
              ),
            );
            const file = pickPosterFile(stats);
            if (file) {
              const tiny = await tinyDataUri(file.outputPath).catch(() => null);
              return {
                style: bgCssFor(
                  [file.url, tiny || FALLBACK_TINY],
                  position,
                  size,
                ),
                url: file.url,
                quality: hit.quality,
              };
            }
          } catch (e) {
            console.warn(
              `[youtube-facade] poster pipeline failed for ${id}:`,
              e?.message,
            );
          }
        }
        if (!hit) {
          console.warn(
            `[youtube-facade] no i.ytimg.com thumbnail reachable for ${id}; using placeholder`,
          );
        }
        // Still a local-only facade: dark tile + play button + disclaimer.
        return {
          style: bgCssFor([FALLBACK_TINY], position, size),
          url: null,
          quality: hit?.quality || null,
        };
      })(),
    );
  }
  return probeCache.get(cacheKey);
}
