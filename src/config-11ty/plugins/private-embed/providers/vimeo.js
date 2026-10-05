import Fetch from "@11ty/eleventy-fetch";

// ---- URL parsing -----------------------------------------------------------
// vimeo.com/<id> and player.vimeo.com/video/<id> (numeric ids).
const VIMEO_RE = /(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/;

function parseUrl(url) {
  const id = url.match(VIMEO_RE)?.[1];
  return id ? { id } : null;
}

// ---- api lookup ------------------------------------------------------------
// vimeo's api/v2 endpoint returns metadata incl. thumbnail + title in ONE
// call — the same endpoint the lite-vimeo component hits at runtime (our
// vendored copy skips it when the poster is preset). Build-time + cached.
const apiCache = new Map();
async function apiData(id, config) {
  const key = id;
  if (!apiCache.has(key)) {
    apiCache.set(
      key,
      (async () => {
        try {
          const json = await Fetch(`https://vimeo.com/api/v2/video/${id}.json`, {
            duration: config.poster.cacheDuration,
            type: "json",
          });
          return json?.[0] || null;
        } catch {
          return null;
        }
      })(),
    );
  }
  return apiCache.get(key);
}

// `thumbnail_large` carries a `-d_<w>x<h>` size suffix the endpoint resizes
// on demand — ask for 1280x720 so the optimized webp stays crisp wide.
async function posterRemote(data, config) {
  const api = await apiData(data.id, config);
  if (!api?.thumbnail_large) return null;
  return api.thumbnail_large.replace(/-d_[\dx]+$/i, "-d_1280x720");
}

async function title(data, config) {
  if (!config.providers.vimeo?.titleOptions?.download) return null;
  const api = await apiData(data.id, config);
  return api?.title || null;
}

// ---- element attrs ---------------------------------------------------------
// `params` is appended to the player.vimeo.com iframe query by the vendored
// component — `dnt=1` (Vimeo's Do-Not-Track flag) is the privacy default.
function attrs(data, args, config) {
  const a = [`videoid="${data.id}"`];
  const params = [
    config.providers.vimeo.params,
    args.params,
    args.start ? `t=${parseInt(args.start)}s` : null,
  ]
    .filter(Boolean)
    .join("&");
  if (params) a.push(`params="${params}"`);
  return a;
}

export default {
  name: "vimeo",
  element: "lite-vimeo",
  filePrefix: "vm",
  playBtnClass: "ltv-playbtn",
  activatedClass: "ltv-activated",
  bareUrlPattern:
    /<p>(?=(\s*))\1(?:<a [^>]*?>)??(?=(\s*))\2(?:https?:\/\/)??((?:w{3}\.)??(?:player\.)?vimeo\.com\/(?:video\/)??(\d+)(?:[^\s<>]*))(?=(\s*))\5(?:<\/a>)??(?=(\s*))\6<\/p>/g,
  parseUrl,
  posterRemote,
  title,
  attrs,
  // Runtime is vendored (patched lite-vimeo-embed@0.3.0) — CSS ships inside
  // the js file itself, so there is no css asset to register.
  assets: { jsVendorFile: "providers/lite-vimeo.js" },
};
