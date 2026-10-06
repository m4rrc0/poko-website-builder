import Image from "@11ty/eleventy-img";
import deepmerge from "deepmerge";
import { imageTransformOptions } from "../imageTransform.js";
import { bgCssFor, tinyDataUri } from "../../shortcodes/components/image.js";

// Always set *some* `background-image` on the facade element: lite-youtube
// and (patched) lite-vimeo self-fetch their provider's thumbnail at runtime
// when it is unset — the IP leak this plugin exists to prevent. This 16x9
// dark webp is the last-resort layer when no build-time fetch works.
export const FALLBACK_TINY =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoQAAkABABoJaQAA3AA/vDUoAA=";

// i.ytimg.com answers 404 (with a tiny placeholder body) for sizes a video
// doesn't have, so a HEAD status line alone is a reliable availability check.
export const headOk = async (url, timeoutMs = 8000) => {
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

// First candidate whose HEAD request succeeds wins — sequential + memoized
// per candidate list: the common case costs a single request per video.
const probeCache = new Map();
export async function probeFirstOk(candidates, timeoutMs = 8000) {
  const cacheKey = candidates.join("|");
  if (!probeCache.has(cacheKey)) {
    probeCache.set(
      cacheKey,
      (async () => {
        for (const url of candidates) {
          if (await headOk(url, timeoutMs)) return url;
        }
        return null;
      })(),
    );
  }
  return probeCache.get(cacheKey);
}

const pickPosterFile = (stats) => {
  // Prefer the first declared format (webp when present), else the last
  // emitted file of whichever format came last.
  const formats = Object.keys(stats || {});
  if (!formats.length) return null;
  const list = stats[formats[0]]?.length
    ? stats[formats[0]]
    : stats[formats.at(-1)];
  return list?.at(-1) || null;
};

// One optimized poster per remote url — memoized: several embeds of the
// same video on a page (or repeated pages) cost one pipeline run.
const styleCache = new Map();

/**
 * Download a remote poster through the same eleventy-img pipeline as regular
 * images and compose the two-layer LQIP background ([optimized file, tiny
 * base64]) that the facade element always carries.
 * @param {string|null} remoteUrl resolved poster candidate (provider-supplied)
 * @param {string} key filename cache key, e.g. `yt-dQw4w9WgXcQ` / `vm-76979871`
 * @param {object} poster `poster` option group (cacheDuration, imageOptions…)
 * @returns {Promise<{style:string, url:string|null}>}
 */
export async function posterStyleFromRemote(remoteUrl, key, poster) {
  const { cacheDuration, imageOptions, position, size } = poster;
  const cacheKey = `${key}|${remoteUrl}`;
  if (!styleCache.has(cacheKey)) {
    styleCache.set(
      cacheKey,
      (async () => {
        if (remoteUrl) {
          try {
            const stats = await Image(
              remoteUrl,
              deepmerge.all(
                [
                  imageTransformOptions,
                  imageOptions,
                  {
                    filenameFormat: (_hash, src, w, fmt) =>
                      `${key}-${w}w.${fmt}`,
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
              };
            }
          } catch (e) {
            console.warn(
              `[private-embed] poster pipeline failed for ${key}:`,
              e?.message,
            );
          }
        }
        // Still a local-only facade: dark tile + play button + disclaimer.
        return { style: bgCssFor([FALLBACK_TINY], position, size), url: null };
      })(),
    );
  }
  return styleCache.get(cacheKey);
}
