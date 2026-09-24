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
    const sveltiaScriptSrc =
      data.env.CMS_IMPORT === "cdn"
        ? "https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"
        : "/assets/js/sveltia-cms.js";

    // TODO: not sure it is useful anymore ??
    const currentCollections = JSON.stringify(
      data?.globalSettings?.collections || [],
    );

    // Same stylesheets as the site's <head> so the CMS preview pane matches the site
    const previewStyleUrls = Array.from(
      `${data.htmlExternalCtxCssTag || ""}\n${data.htmlExternalCssTags || ""}`.matchAll(
        /href="([^"]+)"/g,
      ),
      (m) => m[1],
    );
    // UnoCSS layer (brand preflight + preview utility classes) between ctx and project styles
    const ctxIndex = previewStyleUrls.findIndex((url) =>
      url.endsWith("ctx.css"),
    );
    previewStyleUrls.splice(ctxIndex + 1, 0, "/admin/preview.css");

    return (
      `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Admin Panel | poko</title>
    
    <script src=${sveltiaScriptSrc} eleventy:ignore></script>
    <link href="config.json" type="application/json" rel="cms-config-url" />
    <script eleventy:ignore>
      const currentCollections = JSON.parse('${currentCollections || "[]"}')
      </script>
      <script eleventy:ignore>
        ${JSON.stringify(previewStyleUrls)}.forEach((url) => CMS.registerPreviewStyle(url));
      </script>
      ` +
      (data.env.initialCmsSetup
        ? ""
        : `
      <script type="module" eleventy:ignore>
        import * as defaultEditorComponents from "./defaultEditorComponents.js";
        const decNames = Object.keys(defaultEditorComponents)
        console.log(decNames, defaultEditorComponents);
        decNames.forEach(name => {
          CMS.registerEditorComponent(defaultEditorComponents[name]);
        })
      </script>
      ` +
          (data.env.hasUserEditorComponents
            ? `
      <script type="module" eleventy:ignore>
        import * as userEditorComponents from "./userEditorComponents.js";
        const uecNames = Object.keys(userEditorComponents)
        console.log(uecNames, userEditorComponents);
        uecNames.forEach(name => {
          CMS.registerEditorComponent(userEditorComponents[name]);
        })
      </script>
      `
            : "") +
          `
      <script type="module" eleventy:ignore>
        import { registerPreviewTemplates } from "./previewTemplates.js";
        registerPreviewTemplates(CMS);
      </script>
      `) +
      `
  </head>
  <body>


  </body>
</html>    
`
    );
  }
}
