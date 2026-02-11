import { USER_DIR, allLanguages } from "../../env.config.js";

const dirsToStrip = [USER_DIR, "pages"];
const langCodes = allLanguages.map((lang) => lang.code);
// const stripRegex = new RegExp(`^\/*(${dirsToStrip.join("|")})\/*`);

// NOTE: Keep lang prefixes but strip undesirable path segments like "pages" or "_user-content"
function stripPathSegment(path, segmentToStrip, allowedPrefixes = []) {
  // Create a regex that matches either:
  // 1. The segment at the beginning of the path
  // 2. The segment after an allowed prefix
  const prefixPattern = allowedPrefixes.length
    ? `(^|^(${allowedPrefixes.join("|")})/)`
    : "(^)";

  const regex = new RegExp(`${prefixPattern}${segmentToStrip}/?`, "i");
  const strippedPath = path.replace(regex, "$1");

  return strippedPath;
}

const languagePrefixesMap = allLanguages
  .map((lang) => {
    if (typeof lang.prefix === "string") {
      return [lang.defaultPrefixRegex, lang.prefix];
    }
  })
  .filter(Boolean);

// for (const lang of globalSettings.allLanguages) {
//   if (lang.customUrlPrefix) {
//     languagePrefixesToMap[lang.code] = lang.customUrlPrefix.prefix;
//   }
// }

export default function mapInputPathToUrl(filePathStem) {
  const unWrapped = filePathStem
    .replace(/^\/+/, "") // remove leading slashes (even multiple)
    .replace(/\/+$/, "") // remove trailing slash
    .replace(/\/index$/, ""); // remove trailing '/index'

  // const formatted = unWrapped.replace(stripRegex, ""); // remove leading unwanted dir names (like 'pages')
  let formatted = unWrapped;
  for (const dir of dirsToStrip) {
    formatted = stripPathSegment(formatted, dir, langCodes);
  }

  let unPrefixed = formatted;
  for (const [regex, prefix] of languagePrefixesMap) {
    if (regex.test(unPrefixed)) {
      unPrefixed = unPrefixed.replace(regex, `/${prefix}/`);
    }
  }

  const url = {};
  url.href = `/${unPrefixed}/`.replace(/\/+/g, "/"); // remove multiple slashes
  // url.pathname = `/${formatted}`.replace(/\/+/g, '/'); // remove multiple slashes
  url.pathname = url.href;
  url.permalink = url.href + "index";

  return url;
}
