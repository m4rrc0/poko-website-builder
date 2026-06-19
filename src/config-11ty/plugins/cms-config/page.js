export class CmsPage {
  data() {
    return {
      layout: null,
      eleventyExcludeFromCollections: true,
      permalink: "/admin/index.html",
      lang: "en",
    };
  }
  async render(data) {
    console.log({
      env: data.env.CMS_IMPORT,
      globalSettings: data.globalSettings,
    });
    const sveltiaScriptSrc =
      data.env.CMS_IMPORT === "cdn"
        ? "https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"
        : "/assets/js/sveltia-cms.js";

    // TODO: not sure it is useful anymore ??
    const currentCollections = JSON.stringify(data.globalSettings.collections);

    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Admin Panel | poko</title>
    
    <script src=${sveltiaScriptSrc}></script>
    <script>
      const currentCollections = JSON.parse('${currentCollections || "[]"}')
      </script>
      <link href="config.json" type="application/json" rel="cms-config-url" />
      <script type="module">
        import * as defaultEditorComponents from "./defaultEditorComponents.js";
        const decNames = Object.keys(defaultEditorComponents)
        console.log(decNames, defaultEditorComponents);
        decNames.forEach(name => {
          CMS.registerEditorComponent(defaultEditorComponents[name]);
        })
      </script>
      <script type="module">
        import * as userEditorComponents from "./userEditorComponents.js";
        const uecNames = Object.keys(userEditorComponents)
        console.log(uecNames, userEditorComponents);
        uecNames.forEach(name => {
          CMS.registerEditorComponent(userEditorComponents[name]);
        })
      </script>
  </head>
  <body>


  </body>
</html>    
`;
  }
}
