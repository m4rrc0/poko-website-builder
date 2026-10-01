// Build-time icon manifest for the CMS preview: records which icons the real
// build actually inlined (eleventy-plugin-icons calls `icon.class(name,
// source)` per use) so the browser preview can ship the exact same svg markup
// for used icons. Icons chosen later in the CMS (never rendered at build)
// fall back to a lazily-fetched unpkg url derived from the same package dirs.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const usedIcons = new Set(); // "source:name"
let iconDirs = new Map(); // source name → svg dir

export const recordIconUse = (source, name) => {
  if (source && name) usedIcons.add(`${source}:${name}`);
};

// iconSources from eleventy.config.js: [{ name, path }, …]
export const setIconSources = (sources) => {
  iconDirs = new Map((sources ?? []).map((s) => [s.name, s.path]));
};

// Package root = first dir above the icons dir holding a package.json
// (icon dirs sit at <pkg>/icons[/variant]); unpkg base = pkg@ver/<rel dir>.
import { existsSync, readFileSync } from "node:fs";
const findPkg = (dir) => {
  let cur = dir;
  while (cur !== path.dirname(cur)) {
    const pkgPath = path.join(cur, "package.json");
    if (existsSync(pkgPath)) {
      const json = JSON.parse(readFileSync(pkgPath, "utf-8"));
      return { path: pkgPath, name: json.name, version: json.version };
    }
    cur = path.dirname(cur);
  }
  return null;
};

// Emits `preview-icons.generated.js`: default export { "source:name": svg },
// `iconUrlBases` { source: unpkgBase } for the lazy fallback.
export const writeIconsModule = async (modulePath) => {
  const map = {};
  const bases = {};
  for (const key of usedIcons) {
    const [source, name] = key.split(":");
    const dir = iconDirs.get(source);
    if (!dir) continue;
    const svg = await readFile(path.join(dir, `${name}.svg`), "utf-8").catch(
      () => null,
    );
    if (svg) map[key] = svg.replace(/\s+/g, " ");
  }
  for (const [source, dir] of iconDirs) {
    const pkg = findPkg(dir);
    if (pkg?.name && pkg?.version) {
      bases[source] = `https://unpkg.com/${pkg.name}@${pkg.version}/${path
        .relative(path.dirname(pkg.path), dir)
        .split(path.sep)
        .join("/")}`;
    }
  }
  const code =
    `export default ${JSON.stringify(map)};\n` +
    `export const iconUrlBases = ${JSON.stringify(bases)};\n`;
  const existing = await readFile(modulePath, "utf-8").catch(() => null);
  // Write-if-different: the file is bundled (setup phase), so new icons land
  // in the NEXT build — same converging-watch pattern as njk sources.
  if (existing !== code) await writeFile(modulePath, code);
};

// First build needs the file present for the bundle import to resolve.
export const ensureIconsModule = async (modulePath) => {
  const exists = await readFile(modulePath, "utf-8").catch(() => null);
  if (exists == null) {
    await writeFile(
      modulePath,
      "export default {};\nexport const iconUrlBases = {};\n",
    );
  }
};
