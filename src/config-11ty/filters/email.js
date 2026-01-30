import obfuscateEmail from "../../utils/emailObfuscate.js";

// Produce obfuscated email link
// Signature should be: {{ "email@url.com" | emailLink({ text: "Link text", subject: "Subject", body: "Body", cc: "CC", bcc: "BCC", class: "my-class"}) }}
// Or: {{ "email@url.com" | emailLink("Link text") }}
export function emailLink(email, rawParams) {
  const params =
    typeof rawParams === "string" ? { text: rawParams } : rawParams || {};
  let { text, subject, body, cc, bcc, ...attrs } = params;
  const { element } = obfuscateEmail(email, {
    text,
    subject,
    body,
    cc,
    bcc,
    ...attrs,
  });

  return this.env.filters.safe(element);
}

export function email(...attrs) {
  return emailLink(...attrs);
}
