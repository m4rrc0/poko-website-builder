import fs from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

// Root of the published package. Every engine-owned file (templates, themes,
// styles, static assets) must be resolved against it so the engine keeps
// working when installed inside a consumer's `node_modules`.
export const PACKAGE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export function packagePath(...segments) {
  return resolve(PACKAGE_ROOT, ...segments);
}

export function toPosix(path) {
  return path.split("\\").join("/");
}

// Eleventy resolves passthrough copies, watch targets and rendered files
// against the project root, so engine paths are expressed relatively to the
// consumer's working directory whenever the package lives inside it — which is
// the case for both a regular install and the engine repository itself.
function localize(absolutePath) {
  const relativePath = relative(process.cwd(), absolutePath);
  if (!relativePath || relativePath.startsWith("..") || isAbsolute(relativePath))
    return toPosix(absolutePath);
  return toPosix(relativePath);
}

export function enginePath(...segments) {
  return localize(packagePath(...segments));
}

function readPackageName(dir) {
  try {
    return JSON.parse(fs.readFileSync(join(dir, "package.json"), "utf-8")).name;
  } catch (error) {
    return null;
  }
}

function packageDirFromEntry(entry, name) {
  let dir = dirname(entry);
  while (true) {
    if (readPackageName(dir) === name) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function packageDirFromNodeModules(name) {
  let dir = PACKAGE_ROOT;
  while (true) {
    const candidate = join(dir, "node_modules", name);
    if (fs.existsSync(join(candidate, "package.json"))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const packageDirCache = new Map();

/**
 * Absolute directory of an installed dependency, whatever the install layout
 * (flat `node_modules`, nested install, pnpm store).
 * Dependencies are resolved instead of assuming a `node_modules/` sibling of
 * the current working directory.
 */
export function resolvePackageDir(name) {
  if (packageDirCache.has(name)) return packageDirCache.get(name);

  let dir = null;
  try {
    dir = dirname(require.resolve(`${name}/package.json`));
  } catch (error) {
    try {
      dir = packageDirFromEntry(require.resolve(name), name);
    } catch (error2) {
      dir = null;
    }
  }
  dir ||= packageDirFromNodeModules(name);

  packageDirCache.set(name, dir);
  return dir;
}

export function dependencyPath(name, ...segments) {
  const dir = resolvePackageDir(name);
  return dir ? resolve(dir, ...segments) : null;
}

export function dependencyEnginePath(name, ...segments) {
  const path = dependencyPath(name, ...segments);
  return path ? localize(path) : null;
}
