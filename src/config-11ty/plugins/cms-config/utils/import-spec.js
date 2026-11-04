import path from "node:path";

/**
 * ESM import specifier for `file` from a module in `fromDir`: `./`-prefixed
 * POSIX-style relative path, or the absolute path unchanged when no relative
 * path exists (Windows, different drives) — bare relative paths would be
 * resolved as package names.
 */
export const importSpec = (fromDir, file, p = path) => {
  const rel = p.relative(fromDir, p.resolve(file));
  return p.isAbsolute(rel) ? rel : "./" + rel.split(p.sep).join("/");
};
