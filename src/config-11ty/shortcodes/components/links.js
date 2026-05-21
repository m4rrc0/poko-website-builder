// import obfuscateEmail from "../../utils/emailObfuscate.js";
import slugify from "@sindresorhus/slugify";
import { locale_url } from "../../filters/i18n.js";
import { emailLink } from "../../filters/email.js";

function isFileUrl(urlString) {
  try {
    // Use a dummy base for relative URLs
    const url = new URL(urlString, "http://x");
    const pathname = url.pathname;

    if (pathname.endsWith("/")) return false;

    return /\.\w{2,5}$/i.test(pathname);
  } catch {
    return false;
  }
}

export async function link(unnamedAttrOrObj, optionalAttrsObj) {
  const {
    __keywords,
    url,
    text,
    content,
    lang,
    prop,
    collection,
    type: typeTemp,
    linkType,
    anchor,
    // Email fields
    subject,
    body,
    cc,
    bcc,
    preload,
    // TODO: implement the following?
    // download,
    // target,
    // rel,
    // hreflang,
    ...attrs
  } = optionalAttrsObj || unnamedAttrOrObj;
  const type = typeTemp || linkType;
  let instantAttrStr =
    preload === false || preload === "false" ? "data-no-instant" : "";
  instantAttrStr =
    instantAttrStr ||
    (preload === true || preload === "true" ? "data-instant" : "");

  const htmlContent = content || text;

  const urlRef = typeof unnamedAttrOrObj === "string" ? unnamedAttrOrObj : url;
  // Boolean checks
  const isEmail =
    type === "email" ||
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(urlRef);
  const isFile = type === "file" || isFileUrl(urlRef);
  const isExternal =
    type === "external" ||
    (urlRef || "").startsWith("http") ||
    (urlRef || "").startsWith("www.");
  const isInternal =
    type === "internal" || (!isEmail && !isExternal && !isFile);

  // could be one of:
  // - [ ] translationKey
  // - [ ] page url
  // - [ ] external url
  // - [ ] email
  // - [ ] file url
  //
  // pageRef | locale_url(lang, propName, collectionName)

  if (isInternal) {
    const pageData = locale_url.call(
      this,
      urlRef,
      lang,
      prop || "all",
      collection,
    );
    const attrsStr = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    if (typeof pageData === "object") {
      const anchorStr = anchor ? `#${slugify(anchor)}` : "";
      return `<a href="${pageData.url}${anchorStr}" ${attrsStr} ${instantAttrStr}>${htmlContent || pageData.name || pageData.url}</a>`;
    }
  }

  if (isExternal) {
    const attrsStr = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    return `<a href="${urlRef}" ${attrsStr} ${instantAttrStr}>${htmlContent || urlRef}</a>`;
  }

  if (isEmail) {
    return emailLink.call(this, urlRef, {
      text: htmlContent,
      subject,
      body,
      cc,
      bcc,
      ...attrs,
    });
  }

  if (isFile) {
    const attrsStr = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    return `<a href="${urlRef}" ${attrsStr} ${instantAttrStr}>${htmlContent || urlRef}</a>`;
  }

  return "";
}

function normalizeAttributes(unnamedAttrOrObj, optionalAttrsObj) {
  return typeof unnamedAttrOrObj === "string"
    ? {
        ...optionalAttrsObj,
        url: optionalAttrsObj?.url || unnamedAttrOrObj,
      }
    : unnamedAttrOrObj;
}

export function button(unnamedAttrOrObj, optionalAttrsObj) {
  return link.call(this, {
    ...normalizeAttributes(unnamedAttrOrObj, optionalAttrsObj),
    class: `button ${unnamedAttrOrObj?.class || optionalAttrsObj?.class || ""}`,
  });
}

export async function linkPaired(
  contentRaw,
  unnamedAttrOrObj,
  optionalAttrsObj,
) {
  const content = (contentRaw || "").replace(/\n\n+/g, "<br>");
  // const content = contentRaw;
  return link.call(this, {
    ...normalizeAttributes(unnamedAttrOrObj, optionalAttrsObj),
    content,
  });
}

export async function buttonPaired(
  contentRaw,
  unnamedAttrOrObj,
  optionalAttrsObj,
) {
  const content = (contentRaw || "").replace(/\n\n+/g, "<br>");
  // const content = contentRaw;
  return link.call(this, {
    ...normalizeAttributes(unnamedAttrOrObj, optionalAttrsObj),
    content,
    class: `button ${unnamedAttrOrObj?.class || optionalAttrsObj?.class || ""}`,
  });
}
