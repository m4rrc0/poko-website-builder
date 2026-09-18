import { PROD_URL, SITE_NAME } from "../../../env.config.js";
import { getId } from "./utils.js";

export default function () {
  return {
    "@type": "WebSite",
    "@id": getId(),
    url: PROD_URL,
    name: SITE_NAME,
  };
}
