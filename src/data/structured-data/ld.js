export default async function (data) {
  if (!data.ldWebSite || !data.ldWebPage) return;

  // We combine the following
  // - Organization or Person that is the mainEntity of the WebSite (relation from globalSettings)
  // - WebSite
  // - WebPage + more specific types (e.g. Article, Event, ...)
  // - Relations to other templates (e.g. Author, ...)

  // TODO: find Org or Person referenced in globalSettings
  // TODO: find relations to other templates

  //TODO: if ldWebPage is not a creativeWork, remove ldWebSite
  const ld = {
    "@context": "https://schema.org",
    "@graph": [data.ldWebSite, ...data.ldWebPage],
  };

  return ld;
}
