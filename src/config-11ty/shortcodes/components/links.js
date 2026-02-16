// import obfuscateEmail from "../../utils/emailObfuscate.js";
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

export function link(unnamedAttrOrObj, optionalAttrsObj) {
  const {
    __keywords,
    url,
    text,
    lang,
    prop,
    collection,
    linkType,
    // Email fields
    subject,
    body,
    cc,
    bcc,
    // TODO: implement the following?
    // download,
    // target,
    // rel,
    // hreflang,
    ...attrs
  } = optionalAttrsObj || unnamedAttrOrObj;
  const urlRef = typeof unnamedAttrOrObj === "string" ? unnamedAttrOrObj : url;
  // Boolean checks
  const isEmail =
    linkType === "email" ||
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(urlRef);
  const isFile = linkType === "file" || isFileUrl(urlRef);
  const isExternal =
    linkType === "external" ||
    urlRef.startsWith("http") ||
    urlRef.startsWith("www.");
  const isInternal =
    linkType === "internal" || (!isEmail && !isExternal && !isFile);

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
      return `<a href="${pageData.url}" ${attrsStr}>${text || pageData.name || pageData.url}</a>`;
    }
  }

  if (isExternal) {
    const attrsStr = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    return `<a href="${urlRef}" ${attrsStr}>${text || urlRef}</a>`;
  }

  if (isEmail) {
    return emailLink.call(this, urlRef, {
      text,
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

    return `<a href="${urlRef}" ${attrsStr}>${text || urlRef}</a>`;
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
