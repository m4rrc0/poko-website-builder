import { join } from "node:path";
import Markdoc from "@markdoc/markdoc";
import { FILES_LIBRARY_OUTPUT_DIR } from "../../../env.config.js";
import mapInputPathToUrl from "../../utils/mapInputPathToUrl.js";
import { removeUndefinedProps } from "../../utils/objects.js";

function transformLink(discriminant, value) {
  switch (discriminant) {
    case 'internal':
      return transformInternalLink(value);
    case 'external':
      return transformExternalLink(value);
    case 'file':
      return transformFileLink(value);
    case 'email':
      return transformEmailLink(value);
    case 'phone':
      return transformPhoneLink(value);
    default:
      return {};
  }
}

function transformInternalLink(value) {
  // TODO: Auto detect hreflang
  const {
    link: {
      discriminant: collectionName,
      value: slug
    } = {},
    target,
    rel,
    class: className,
  } = value || {}
  
  const filePathStem = join(collectionName, slug);
  const url = mapInputPathToUrl(filePathStem);
  const href = url.href;


  return { href, target, rel, class: 'link internal' + (className ? ' ' + className : '') }
}

function transformExternalLink(value) {
  const {
    url,
    target,
    hreflang,
    rel,
    class: className,
  } = value || {}
  
  return { href: url, target, hreflang, rel, class: 'link external' + (className ? ' ' + className : '') }
}

function transformFileLink(value) {
  let {
    file: {
      discriminant,
      value: href, // for 'local' and 'external', href is correct
    },
    target,
    download,
    hreflang,
    rel,
    class: className,
  } = value || {}

  // Because otherwise, false is turned into a string and becomes the file name with download turned on
  download = download === false ? undefined : download;
  
  switch (discriminant) {
    case 'filesLibrary':
      href = `/${FILES_LIBRARY_OUTPUT_DIR}/${href}`;
      className = 'link file internal library' + (className ? ' ' + className : '')
      break;
    case 'local':
      className = 'link file internal local' + (className ? ' ' + className : '')
      break;
    case 'external':
      className = 'link file external' + (className ? ' ' + className : '')
      break;
    default:
      href = '';
  }
  
  return { href, target, hreflang, rel, download, class: className }
}

function transformEmailLink(value) {
  let {
    email,
    subject: subjectUnescaped,
    cc,
    bcc,
    body: bodyUnescaped,
    target,
    hreflang,
    rel,
    class: className,
  } = value || {}

  // Custom encoding for mailto parameters
  // We need to manually handle special characters for email clients
  const encodeMailtoParam = (str) => {
    if (!str) return '';
    return str
      .replace(/\r?\n/g, '%0D%0A') // Replace newlines with CRLF sequence
      .replace(/[\s]/g, ' ')      // Preserve spaces as spaces
      .replace(/[\(\)\[\]\<\>"'\,\;\:\@\&\=\+\$\#\*\!\^\~\`\|\{\}]/g, 
        match => encodeURIComponent(match)); // Encode other special chars
  };

  const subject = encodeMailtoParam(subjectUnescaped);
  const body = encodeMailtoParam(bodyUnescaped);
  
  // Build query string manually to avoid URLSearchParams encoding
  const params = [];
  if (subject) params.push(`subject=${subject}`);
  if (cc) params.push(`cc=${cc}`);
  if (bcc) params.push(`bcc=${bcc}`);
  if (body) params.push(`body=${body}`);
  
  const queryString = params.join('&');
  
  return { href: `mailto:${email}?${queryString}`, target, hreflang, rel, class: 'link email' + (className ? ' ' + className : '') }
}

function transformPhoneLink(value) {
  let {
    phone,
    target,
    hreflang,
    rel,
    class: className,
  } = value || {}
  
  const href = phone ? `tel:${phone}` : phone
  
  return { href, target, hreflang, rel, class: 'link phone' + (className ? ' ' + className : '') }
}

export const Link = {
  inline: true,
  selfClosing: false,
    // render: 'link-c',
    // attributes: {
    //     type: {
    //         type: Object,
    //     },
    //   discriminant: {
    //     type: String
    //   }
    // },
    transform: (node, config) => {
        // const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);
        const type = node.attributes.type.discriminant;
        const value = node.attributes.type.value;
        const rawProps = transformLink(type, value);
        // Remove undefined properties from props
        const props = removeUndefinedProps(rawProps);
        
        return new Markdoc.Tag("a", props, children);
      }
}