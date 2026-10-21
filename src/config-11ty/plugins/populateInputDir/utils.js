import fglob from "fast-glob";
import fs from "fs/promises";
import chalk from "chalk";
import { log } from "../../../utils/log/logger.js";

// Function to print a tree-like structure of paths with color-coded status
export const printDiffTree = (
  paths,
  originalPaths,
  sourcesMap = {},
  skippedMap = {},
  inputDir,
) => {
  // Combine all paths including skipped ones for complete visualization
  const allPaths = [...new Set([...paths, ...Object.keys(skippedMap)])];
  // Sort paths to ensure directories come before their contents
  const sortedPaths = allPaths.sort();

  // Build tree structure with metadata
  const tree = {};
  sortedPaths.forEach((path) => {
    const parts = path.split("/");
    let current = tree;
    let currentPath = "";

    parts.forEach((part, i) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!current[part]) {
        const isOriginal = originalPaths.some(
          (p) => p.replace(`${inputDir}/`, "") === currentPath,
        );
        const isSkipped = skippedMap[currentPath] !== undefined;

        current[part] = {
          __meta: {
            isOriginal,
            isSkipped,
            source: sourcesMap[currentPath] || null,
            skippedSource: skippedMap[currentPath] || null,
          },
          __children: {},
        };
      }
      current = current[part].__children;
    });
  });

  // Generate tree output with diff coloring
  const renderTree = (node, prefix = "", isLast = true, path = "") => {
    const entries = Object.entries(node);
    if (entries.length === 0) return "";

    let result = "";
    entries.forEach(([key, value], index) => {
      if (key === "__meta" || key === "__children") return;

      const isLastItem = index === entries.length - 1;
      const currentPath = path ? `${path}/${key}` : key;
      const meta = value.__meta || {};
      const children = value.__children || {};
      const isEmpty = Object.keys(children).length === 0;

      // Use different symbols and colors for files and directories
      const hasChildren = !isEmpty;
      const symbol = hasChildren ? "↘" : "•";

      // Color based on whether it's original, added, or skipped
      const isOriginal = meta.isOriginal;
      const isSkipped = meta.isSkipped;
      const isBothAddedAndSkipped = meta.source && meta.skippedSource;

      const sourceInfo = meta.source
        ? ` ${chalk.blue(`(from ${meta.source})`)}`
        : "";
      const skippedInfo = meta.skippedSource
        ? ` ${chalk.red(`[would be from ${meta.skippedSource}]`)}`
        : "";

      let colorPrefix;

      if (isOriginal) {
        // Check if this original file is also skipped from some sources
        if (meta.skippedSource) {
          colorPrefix = chalk.yellow.bgBlack;
          result += `${prefix}${colorPrefix(`${symbol} ${key}${hasChildren ? "/" : ""}`)}${skippedInfo}
`;
        } else {
          colorPrefix = chalk.gray;
          result += `${prefix}${colorPrefix(`${symbol} ${key}${hasChildren ? "/" : ""}`)}
`;
        }
      } else if (isBothAddedAndSkipped) {
        // For paths that are both added and skipped, show them in blue with both sources
        colorPrefix = chalk.blueBright.bgBlack.bold;
        result += `${prefix}${colorPrefix(`${symbol} ${key}${hasChildren ? "/" : ""}`)}${sourceInfo}${skippedInfo}
`;
      } else if (isSkipped) {
        // For paths that are only skipped, show them in yellow with skipped source
        colorPrefix = chalk.yellow.bgBlack;
        result += `${prefix}${colorPrefix(`${symbol} ${key}${hasChildren ? "/" : ""}`)}${skippedInfo}
`;
      } else {
        // For paths that are only added, show them in blue with source
        colorPrefix = chalk.blueBright.bgBlack.bold;
        result += `${prefix}${colorPrefix(`${symbol} ${key}${hasChildren ? "/" : ""}`)}${sourceInfo}
`;
      }

      if (hasChildren) {
        const newPrefix = prefix + (isLastItem ? "  " : "| ");
        result += renderTree(children, newPrefix, isLastItem, currentPath);
      }
    });

    return result;
  };

  return `
${renderTree(tree)}`;
};

export const loadFiles = async (globParam) => {
  // Read all files in the content directory using glob
  // TODO: check this is working as expected with fast-glob
  const filePaths = await fglob(globParam);

  // Filter out directories and only keep files
  const filePromises = filePaths.map(async (filePath) => {
    try {
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        // Read the content of each file
        const content = await fs.readFile(filePath, "utf8");
        return {
          path: filePath,
          content,
        };
      }
      return null;
    } catch (error) {
      log.error(
        "populate",
        "populate.file.error",
        `Error reading file ${filePath}: ${error.message}`,
      );
      return null;
    }
  });

  // Wait for all file reading promises to resolve
  const files = (await Promise.all(filePromises)).filter(Boolean);

  return files;
};
