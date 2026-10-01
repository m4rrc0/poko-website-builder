// Build-time image manifest for the CMS preview: records the real
// eleventy-img stats emitted during the build so the browser preview can map
// a CMS source path (`/_images/x.webp`) to a PUBLISHED url
// (`/assets/images/<hash>-<w>.webp`) — no image processing in the browser.
// Only call-site `Image()` invocations are recorded (the transform plugin's
// internal calls are unreachable), which keeps every manifest entry truthful:
// a listed url is a file actually emitted by this build. Unlisted sources
// fall back to CMS blob/data urls at preview time.
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const MEDIA_DIR_RE = /(?:^|[\\/])((?:_images|_files|_assets|_media)[\\/].*)$/;

const manifest = new Map();

// Any input form (cms public path `/_images/x`, fs path `_content/_images/x`,
// `./_images/x`) normalizes to the CMS-facing `/…` path — the shape stored in
// entry fields and seen by the preview resolver.
const manifestKey = (input) => {
  const m = String(input ?? "").match(MEDIA_DIR_RE);
  return m ? `/${m[1].replace(/\\/g, "/")}` : null;
};

export const isManifestSource = (input) =>
  !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(String(input ?? "")) &&
  manifestKey(input) !== null;

// Call after every eleventy-img `Image(src, opts)` returns stats.
// `input` = the src the call site was given; `stats` = the stats object
// ({ webp: [{url, width, …}], jpeg: […], … }).
export const recordImageStats = (input, stats) => {
  const key = manifestKey(input);
  if (!key || !stats || typeof stats !== "object") return;
  const entry = manifest.get(key) ?? {};
  for (const [format, variants] of Object.entries(stats)) {
    if (!Array.isArray(variants)) continue; // skip `eleventyImage`, etc.
    const urls = variants
      .filter((v) => v?.url)
      .map(({ url, width }) => ({ url, width }));
    if (!urls.length) continue;
    // Union-merge: the same source is often Image()'d at several call sites
    // with different width sets — every listed url is a real emitted file.
    const merged = new Map((entry[format] ?? []).map((v) => [v.url, v]));
    for (const v of urls) merged.set(v.url, v);
    entry[format] = [...merged.values()].sort((a, b) => a.width - b.width);
  }
  if (Object.keys(entry).length) manifest.set(key, entry);
};

// Written next to the admin bundle: `${OUTPUT_DIR}/admin/image-manifest.json`
export const writeImageManifest = async (adminOutputDir) => {
  await mkdir(adminOutputDir, { recursive: true });
  await writeFile(
    path.join(adminOutputDir, "image-manifest.json"),
    JSON.stringify(Object.fromEntries(manifest)),
  );
};
