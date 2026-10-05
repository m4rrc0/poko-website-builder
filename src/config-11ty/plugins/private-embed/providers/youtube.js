import Fetch from "@11ty/eleventy-fetch";
import { probeFirstOk } from "../poster.js";

// ---- URL parsing -----------------------------------------------------------
// watch?v=, /embed/, /shorts/, /live/, youtu.be/<id>; ?t= and ?start= become
// the player `start` param. Playlists are parseable but unsupported by the
// lite facade — the caller leaves them as links.
const YT_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9-_]{11})/;

function parseUrl(url) {
  const playlist = /playlist\?list=/.test(url);
  const id = url.match(YT_RE)?.[1];
  if (!id) return playlist ? { playlist: true } : null;
  // `t=` accepts `42`, `42s`, `1m30s`, `1h2m3s`; `start=` is plain seconds.
  let start = null;
  const t = url.match(/[?&]t=([\dhms]+)/)?.[1] || url.match(/[?&]start=(\d+)/)?.[1];
  if (t) {
    const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
    if (m) {
      start =
        (parseInt(m[1] || 0) * 3600) +
        (parseInt(m[2] || 0) * 60) +
        parseInt(m[3] || 0);
    }
  }
  return { playlist, id, start };
}

// ---- poster ----------------------------------------------------------------
// Ordered quality cascade: i.ytimg.com 404s (with a 120x90 placeholder body)
// for sizes a video lacks — 2005-era 240p uploads have no maxres/sd.
async function posterRemote(data, config) {
  const yt = config.providers.youtube;
  const dir = yt.format === "webp" ? "vi_webp" : "vi";
  const candidates = yt.qualities.map(
    (q) => `https://i.ytimg.com/${dir}/${data.id}/${q}.${yt.format}`,
  );
  return probeFirstOk(candidates, config.poster.timeoutMs);
}

// ---- title -----------------------------------------------------------------
// oEmbed, fetched server-side at build time so the browser never calls it.
async function title(data, config) {
  const { titleOptions } = config.providers.youtube;
  if (!titleOptions?.download) return null;
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${data.id}&format=json`;
  try {
    const json = await Fetch(url, {
      duration: titleOptions.cacheDuration,
      type: "json",
    });
    return json?.title || null;
  } catch {
    return null;
  }
}

// ---- element attrs ---------------------------------------------------------
// `params` forwarded to the youtube-nocookie iframe by the lite component.
function paramsString(data, args, config) {
  const p = config.providers.youtube;
  const parts = [];
  const params = args.params || p.params;
  if (params) parts.push(params);
  if (p.recommendSelfOnly) parts.push("rel=0");
  if (p.modestBranding) parts.push("modestbranding=1");
  const start = args.start ?? data.start ?? p.startTime;
  if (start) parts.push(`start=${parseInt(start)}`);
  return parts.join("&");
}

function attrs(data, args, config) {
  const a = [];
  a.push(`videoid="${data.id}"`);
  const params = paramsString(data, args, config);
  if (params) a.push(`params="${params}"`);
  if (config.providers.youtube.lite.jsApi) a.push(`js-api`);
  return a;
}

const playBtnClass = "lyt-playbtn lty-playbtn";
const activatedClass = "lyt-activated";

export default {
  name: "youtube",
  element: "lite-youtube",
  filePrefix: "yt",
  playBtnClass,
  activatedClass,
  // Bare-url detection for the optional transform — youtube ids are 11 chars;
  // playlists are captured too (bail to a link downstream, same as upstream).
  bareUrlPattern:
    /<p>(?=(\s*))\1(?:<a [^>]*?>)??(?=(\s*))\2(?:https?:\/\/)??((?:w{3}\.)??(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|live\/|playlist\?list=)??([A-Za-z0-9-_]{11})(?:[^\s<>]*))(?=(\s*))\5(?:<\/a>)??(?=(\s*))\6<\/p>/g,
  parseUrl,
  posterRemote,
  title,
  attrs,
  assets: {
    cssFiles: ["lite-yt-embed.css"],
    jsFiles: ["lite-yt-embed.js"],
    packageName: "lite-youtube-embed",
    packageDir: "src",
  },
};
