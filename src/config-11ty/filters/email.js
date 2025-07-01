import obfuscateEmail from "../../utils/emailObfuscate.js";

// Produce obfuscated email link
export function emailLink(email, params = {}) {
  const { text, subject, body, cc, bcc, ...attrs } = params;
  // Use it like so: {{ "hello@mookai.be" | emailLink("Subject", "Body", "CC", "BCC") }}
  console.log({ email, text, subject, body, cc, bcc, attrs });
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
