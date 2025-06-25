import obfuscateEmail from "../../utils/emailObfuscate.js";

// Produce obfuscated email link
export function emailLink(email, subject, body, cc, bcc) {
  // Use it like so: {{ "hello@mookai.be" | emailLink("Subject", "Body", "CC", "BCC") }}
  const { element } = obfuscateEmail(email, subject, body, cc, bcc);

  return this.env.filters.safe(element);
  //   console.log(this);
  //   return element;
}
