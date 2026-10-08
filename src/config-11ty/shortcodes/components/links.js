// import obfuscateEmail from "../../utils/emailObfuscate.js";
import he from "he";
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

function stringifyAttributesObject(attrs) {
  return Object.entries(attrs)
    .filter(([, value]) => value)
    .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
    .join(" ");
}

export async function link(unnamedAttrOrObj, optionalAttrsObj) {
  const newTabLinkTypes = this.ctx?.globalSettings?.newTabLinkTypes || [];
  const externalLinksRel = this.ctx?.globalSettings?.externalLinksRel || [];

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
    newTab,
    // download, // Field added but can be treated as other raw attrs
    // Fields not implemented in UI. Should we?
    target,
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

  // const attrs = {
  //   ...attrsRaw,
  //   target: target || (newTab && "_blank") || (newTabLinkTypes.includes("internal") && "_blank");
  //   // ...(newTab ? { target: attrsRaw?.target || "_blank" } : {}),
  // };

  // const attrsStr = Object.entries(attrs)
  //   .filter(([, value]) => value)
  //   .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
  //   .join(" ");

  function inferTarget(linkType) {
    return (
      target ||
      (newTab && "_blank") ||
      (newTabLinkTypes.includes(linkType) && "_blank")
    );
  }

  if (isInternal) {
    const pageData = locale_url.call(
      this,
      urlRef,
      lang,
      prop || "all",
      collection,
    );

    if (typeof pageData === "undefined") {
      console.warn(`[link] Page not found: ${urlRef}`);
    }

    const attrsStr = stringifyAttributesObject({
      ...attrs,
      target: inferTarget("internal"),
    });
    const anchorStr = anchor ? `#${slugify(anchor)}` : "";
    // Lookup miss (unresolved/missing translation): still render the anchor
    // with the raw url so the content is not swallowed silently.
    const hrefFallback = `/${collection}/${urlRef}/`
      .replace(/\/+/g, "/")
      .replace(/^\/(pages|undefined)\//, "/");
    const href = pageData?.url || hrefFallback;
    const label =
      htmlContent || he.escape(pageData?.name || pageData?.url || urlRef);
    return `<a href="${he.escape(href)}${anchorStr}" ${attrsStr} ${instantAttrStr}>${label}</a>`;
  }

  if (isExternal) {
    const attrsStr = stringifyAttributesObject({
      ...attrs,
      target: inferTarget("external"),
      rel: attrs.rel || externalLinksRel.join(" ") || null,
    });
    return `<a href="${he.escape(urlRef)}" ${attrsStr} ${instantAttrStr}>${htmlContent || he.escape(urlRef)}</a>`;
  }

  if (isEmail) {
    const attrsStr = stringifyAttributesObject({
      ...attrs,
      target: inferTarget("email"),
    });
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
    const attrsStr = stringifyAttributesObject({
      ...attrs,
      target: inferTarget("file"),
    });
    return `<a href="${he.escape(urlRef)}" ${attrsStr} ${instantAttrStr}>${htmlContent || he.escape(urlRef)}</a>`;
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
