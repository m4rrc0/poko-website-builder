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
    
    <link href="config.json" type="application/json" rel="cms-config-url" />
    <script eleventy:ignore>
      window.__POKO_CMS_AUTH__ = ${JSON.stringify({
        clientId: data.env.POKO_GITHUB_CLIENT_ID,
        relayUrl: data.env.CMS_AUTH_RELAY_URL,
        scope: data.env.CMS_AUTH_SCOPE,
      })};
      // Lazy CMS boot — device-flow.js injects the Sveltia bundle only once
      // sign-in state requires it; registration modules await __POKO_CMS_READY__.
      window.__POKO_CMS_READY__ = new Promise((resolve, reject) => {
        let booted = false;
        window.__POKO_BOOT_CMS__ = () => {
          if (booted) return;
          booted = true;
          const s = document.createElement("script");
          s.src = ${JSON.stringify(sveltiaScriptSrc)};
          s.onload = resolve;
          s.onerror = () =>
            reject(new Error("Failed to load the CMS bundle: " + s.src));
          document.head.append(s);
        };
      });
    </script>
    <script src="/admin/device-flow.js" eleventy:ignore></script>
    <script eleventy:ignore>
      </script>
      <script type="module" eleventy:ignore>
        await window.__POKO_CMS_READY__;
        ${JSON.stringify(previewStyleUrls)}.forEach((url) => CMS.registerPreviewStyle(url));
      </script>
      ` +
      (data.env.initialCmsSetup
        ? ""
        : `
      <script type="module" eleventy:ignore>
        import * as defaultEditorComponents from "./defaultEditorComponents.js";
        import { defaultComponentPreview } from "./preview-runtime.js";
        await window.__POKO_CMS_READY__;
        const decNames = Object.keys(defaultEditorComponents)
        decNames.forEach(name => {
          // Sveltia requires a toPreview fn; default renders toBlock output
          // through the app pipeline. A component's own toPreview wins.
          const component = defaultEditorComponents[name];
          CMS.registerEditorComponent({
            toPreview: defaultComponentPreview(component),
            ...component,
          });
        })
      </script>
      <script type="module" eleventy:ignore>
        import * as defaultFieldTypes from "./defaultFieldTypes.js";
        await window.__POKO_CMS_READY__;
        const dftNames = Object.keys(defaultFieldTypes)
        console.log(dftNames, defaultFieldTypes);
        dftNames.forEach(name => {
          const { name: fieldTypeName, control, preview, schema } = defaultFieldTypes[name];
          CMS.registerWidget(fieldTypeName, control, preview, schema);
        })
      </script>
      ` +
          (data.env.hasUserFieldTypes
            ? `
      <script type="module" eleventy:ignore>
        import * as userFieldTypes from "./userFieldTypes.js";
        await window.__POKO_CMS_READY__;
        const uftNames = Object.keys(userFieldTypes)
        console.log(uftNames, userFieldTypes);
        uftNames.forEach(name => {
          const { name: fieldTypeName, control, preview, schema } = userFieldTypes[name];
          CMS.registerWidget(fieldTypeName, control, preview, schema);
        })
      </script>
      `
            : "") +
          (data.env.hasUserEditorComponents
            ? `
      <script type="module" eleventy:ignore>
        import * as userEditorComponents from "./userEditorComponents.js";
        import { defaultComponentPreview } from "./preview-runtime.js";
        await window.__POKO_CMS_READY__;
        const uecNames = Object.keys(userEditorComponents)
        uecNames.forEach(name => {
          const component = userEditorComponents[name];
          CMS.registerEditorComponent({
            toPreview: defaultComponentPreview(component),
            ...component,
          });
        })
      </script>
      `
            : "") +
          `
      <script type="module" eleventy:ignore>
        import { registerPreviewTemplates } from "./previewTemplates.js";
        await window.__POKO_CMS_READY__;
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
