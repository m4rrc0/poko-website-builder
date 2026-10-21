// prettier-ignore
const allValidHtmlAttributes = ["accept", "action", "alt", "aria-*", "async", "autocomplete", "autofocus", "autoplay", "capture", "checked", "cite", "class", "cols", "colspan", "content", "contenteditable", "controls", "controlslist", "coords", "crossorigin", "data-*", "datetime", "decoding", "default", "defer", "dir", "dirname", "disabled", "download", "draggable", "enctype", "enterkeyhint", "for", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "headers", "height", "hidden", "high", "href", "hreflang", "http-equiv", "id", "ismap", "inputmode", "integrity", "interactions", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nomodule", "novalidate", "nonce", "open", "optimum", "pattern", "placeholder", "playsinline", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "reversed", "rows", "rowspan", "sandbox", "scope", "scoped", "selected", "shape", "size", "sizes", "slot", "span", "spellcheck", "src", "srcdoc", "srclang", "srcset", "start", "step", "summary", "tabindex", "target", "title", "translate", "type", "usemap", "value", "width", "wrap"];

import { log } from "../../utils/log/logger.js";

const allValidHtmlAttributesRegex = new RegExp(
  `^(${allValidHtmlAttributes.join("|")})$`,
);

export function htmlAttrs(rawAttrsObj = {}, overwriteObj = {}) {
  const pageUrl = this?.page?.url;
  let rejectedAttrs = {};
  const { rawAttrs, ...attrsObj } = { ...rawAttrsObj, ...overwriteObj };

  for (const key of Object.keys(attrsObj)) {
    if (!allValidHtmlAttributesRegex.test(key)) {
      rejectedAttrs[key] = attrsObj[key];
      delete attrsObj[key];
    }
  }

  if (Object.keys(rejectedAttrs).length > 0) {
    log.warn("html", "attrs.rejected", `page "${pageUrl}"`, rejectedAttrs);
  }

  const mainString = Object.entries(attrsObj)
    .map(([key, value]) => {
      if (value === true) {
        return `${key}`;
      }
      // Filter out keys that are not valid HTML attributes or 'data-*' attributes
      return value ? `${key}="${value}"` : ``;
    })
    .join(" ");

  return this.env.filters.safe(`${mainString} ${rawAttrs || ""}`);
}

export function htmlImgAttrs(rawAttrsObj = {}, overwriteObj = {}) {
  const attrObj = { ...rawAttrsObj, ...overwriteObj };

  // Transform the necessary attributes
  attrObj.src = attrObj.src || "";
  attrObj.alt = attrObj.alt || "";

  if (attrObj.aspectRatio) {
    attrObj.class =
      (attrObj.class || "") + ` aspect-ratio-${attrObj.aspectRatio}`;
  }
  delete attrObj.aspectRatio;

  return htmlAttrs.call(this, attrObj);
}

export function ioAttr(val) {
  if (typeof val === "undefined") {
    return "data-io-undefined";
  }
  return "";
}
