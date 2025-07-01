import he from "he";

// Best techniques from: https://spencermortensen.com/articles/email-obfuscation/
export function inner(email) {
  if (!email) {
    return "";
  }
  return email
    .split("")
    .reverse()
    .join("")
    .replace(".", ">b/<.oof>b<.")
    .split("")
    .reverse()
    .join("");
}

export function href(email, subject, body, cc, bcc) {
  if (!email) {
    return "";
  }
  const queryParams = { subject, body, cc, bcc };
  const queryStringArr = Object.entries(queryParams).reduce(
    (accu, [key, val]) => [
      ...accu,
      ...(val ? [`${key}=${encodeURIComponent(val)}`] : []),
    ],
    []
  );
  const queryString = queryStringArr.join("&");

  return (
    he.encode("mai", { encodeEverything: true }) +
    "lto" +
    he.encode(":" + email, { encodeEverything: true }) +
    (queryString ? "?" + queryString : "")
  );
}

export default function obfuscateEmail(
  email,
  { subject, body, cc, bcc, text, ...attrs } = {}
) {
  const hrefVal = href(email, subject, body, cc, bcc);
  const innerVal = typeof text === "string" && text ? text : inner(email);
  const attrsStr = Object.entries(attrs)
    .reduce((accu, [key, val]) => [...accu, `${key}="${val}"`], [])
    .join(" ");

  return {
    inner: innerVal,
    href: hrefVal,
    element: `<a href="${hrefVal}" target="_blank" ${attrsStr}>${innerVal}</a>`,
  };
}
