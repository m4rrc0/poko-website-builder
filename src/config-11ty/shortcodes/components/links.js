// import obfuscateEmail from "../../utils/emailObfuscate.js";
import { locale_url } from "../../filters/i18n.js";

export function link(unnamedAttrOrObj, optionalAttrsObj) {
  const {
    __keywords,
    url,
    text,
    lang,
    prop,
    collection,
    isEmail: isEmailPass,
    isFile: isFilePass,
    isExternal: isExternalPass,
    isInternal: isInternalPass,
    ...attrs
  } = optionalAttrsObj || unnamedAttrOrObj;
  const urlRef = typeof unnamedAttrOrObj === "string" ? unnamedAttrOrObj : url;
  // Boolean checks
  const isEmail =
    isEmailPass ||
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(urlRef);
  const isFile = isFilePass || urlRef.startsWith("file:");
  const isExternal =
    isExternalPass || urlRef.startsWith("http") || urlRef.startsWith("www.");
  const isInternal = isInternalPass || (!isEmail && !isExternal && !isFile);

  // could be one of:
  // - [ ] translationKey
  // - [ ] page url
  // - [ ] external url
  // - [ ] email
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

// TODO: Email, tel, files, external, ...
