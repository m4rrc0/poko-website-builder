import path from "node:path";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { URL } from "node:url";
import Fetch from "@11ty/eleventy-fetch";
import { OUTPUT_DIR } from "../../../env.config.js";

/**
 * Sanitize filename by removing dangerous characters and ensuring it has an extension
 */
function sanitizeFilename(filename, contentType = "") {
  // Remove dangerous characters and limit length
  let clean = filename.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 100);

  // If no extension, try to infer from content-type
  if (!path.extname(clean) && contentType) {
    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "image/avif": ".avif",
      "image/x-icon": ".ico",
      "text/css": ".css",
      "text/javascript": ".js",
      "application/javascript": ".js",
      "application/json": ".json",
      "application/pdf": ".pdf",
      "text/plain": ".txt",
      "font/woff2": ".woff2",
      "font/woff": ".woff",
      "font/otf": ".otf",
      "application/font-sfnt": ".otf", // Alternative for OTF/TTF
      "font/ttf": ".ttf",
      "application/vnd.ms-fontobject": ".eot",
    };
    const ext = extensions[contentType.toLowerCase()];
    if (ext) clean += ext;
  }

  return clean || "file.bin";
}

/**
 * Parse Content-Disposition header to extract server-suggested filename
 */
function parseContentDisposition(contentDisposition) {
  if (!contentDisposition) return null;

  // Handle different formats:
  // attachment; filename="file.pdf"
  // attachment; filename*=UTF-8''file%20name.pdf
  // inline; filename="file.pdf"

  const filenameMatch = contentDisposition.match(
    /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i
  );
  if (filenameMatch) {
    // Decode URL-encoded filenames if needed
    try {
      return decodeURIComponent(filenameMatch[1]);
    } catch {
      return filenameMatch[1];
    }
  }

  return null;
}

/**
 * Extract filename from URL, handling query parameters and edge cases
 */
function extractFilename(urlString) {
  try {
    const urlObj = new URL(urlString);
    const pathname = urlObj.pathname;
    const filename = pathname.split("/").pop();

    // If filename is empty or just a slash, create a hash-based name
    if (!filename || filename === "/") {
      const hash = createHash("md5")
        .update(urlString)
        .digest("hex")
        .substring(0, 8);
      return `file_${hash}`;
    }

    return filename;
  } catch {
    // If URL parsing fails, use a hash of the URL
    const hash = createHash("md5")
      .update(urlString)
      .digest("hex")
      .substring(0, 8);
    return `file_${hash}`;
  }
}

export async function fetchFile(options) {
  try {
    const url = options?.url || options;
    if (typeof url !== "string" || !url.trim()) {
      throw new Error("options.url must be a non-empty string");
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL format: ${url}`);
    }

    const outputDir = options?.outputDir || "assets/files";

    // Ensure output directory path is safe (prevent path traversal)
    const normalizedOutputDir = path
      .normalize(outputDir)
      .replace(/^(\.\.[\/\\])+/, "");

    // Fetch the file first to get headers including Content-Disposition
    const response = await Fetch(url, {
      duration: options?.duration || "1d",
      type: "buffer",
      returnType: "response",
      fetchOptions: {
        ...options?.fetchOptions,
        headers: {
          "User-Agent": "Eleventy-Fetch/1.0",
          // "user-agent":
          //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
          ...options?.fetchOptions?.headers,
        },
      },
    });

    if (response.status !== 200) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} for ${url}`
      );
    }

    const fileBuffer = response.body;
    const contentType = response.headers["content-type"] || "";
    const contentDisposition = response.headers["content-disposition"];

    // Extract filename with priority: options.filename > Content-Disposition > URL
    let rawFilename;
    if (options?.filename) {
      rawFilename = options.filename;
    } else {
      const serverFilename = parseContentDisposition(contentDisposition);
      rawFilename = serverFilename || extractFilename(url);
    }

    // Sanitize filename with content-type information
    const sanitizedFilename = sanitizeFilename(rawFilename, contentType);
    const localFilePath =
      "/" + path.join(normalizedOutputDir, sanitizedFilename);
    const fullOutputPath = path.join(OUTPUT_DIR, localFilePath);

    // Check if file already exists to avoid unnecessary downloads
    try {
      await fs.access(fullOutputPath);
      if (!options?.forceDownload) {
        return localFilePath; // File exists, return existing path
      }
    } catch {
      // File doesn't exist, continue with download
    }

    // Create full output directory path
    const fullOutputDir = path.join(OUTPUT_DIR, normalizedOutputDir);

    // Ensure output directory exists
    await fs.mkdir(fullOutputDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(fullOutputPath, fileBuffer);

    return localFilePath;
  } catch (error) {
    throw new Error(
      `Failed to fetch file from ${options?.url || options}: ${error.message}`
    );
  }
}
