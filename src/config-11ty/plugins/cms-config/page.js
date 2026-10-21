import { readFile } from "node:fs/promises";
import { dependencyPath } from "../../../utils/paths.js";

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

    // Dev tokens only exist for `eleventy --serve` localhost sessions —
    // never embed them in a build artifact, they'd be public HTML.
    const devServe = data.env.ELEVENTY_RUN_MODE === "serve";

    // Contract sentinel: the installed @sveltia/cms version (npm mode)
    // is compared against POKO_SVELTIA_CONTRACT in the banner below —
    // CDN imports are unpinned and always report a mismatch.
    let sveltiaVersion = "";
    if (data.env.CMS_IMPORT !== "cdn") {
      try {
        const pkg = JSON.parse(
          await readFile(
            dependencyPath("@sveltia/cms", "package.json"),
            "utf-8",
          ),
        );
        sveltiaVersion = pkg.version;
      } catch {}
    }

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
        // Gitless (poko relay) mode: CMS_API_ROOT set → Sveltia's own
        // popup handshake; device-flow overlay must not interfere.
        gitless: !!data.env.CMS_API_ROOT,
        devToken: devServe ? data.env.POKO_CMS_DEV_TOKEN : undefined,
        devRefresh: devServe ? data.env.POKO_CMS_DEV_REFRESH : undefined,
        disableDeviceFlow: !!data.env.DISABLE_DEVICE_FLOW,
        sveltiaContract: data.env.POKO_SVELTIA_CONTRACT,
        sveltiaVersion,
        // Deploy hook (SPEC-deploy-hook): prefs.js binds a per-device
        // key here; the URLs derive from CMS_AUTH_URL so poko host moves
        // propagate through rebuilds. branch is the config backend's
        // branch — a preview-deploy admin publishes its own branch.
        ...(data.env.CMS_API_ROOT && {
          deployBindUrl: `${data.env.CMS_AUTH_URL}/deploy/bind`,
          deployUrl: `${data.env.CMS_AUTH_URL}/deploy/${data.env.POKO_SITE_ID}`,
          pokoSiteId: data.env.POKO_SITE_ID,
          branch: data.env.CMS_BRANCH || "main",
        }),
      })};
      // Declarative prefs registry for prefs.js — extension point for
      // future auto-provisioned Sveltia settings (incl. server-synced
      // session config). Empty when the site isn't poko-relay managed.
      window.__POKO_CMS_PREFS__ = ${JSON.stringify(
        data.env.CMS_API_ROOT && data.env.CMS_AUTH_URL && data.env.POKO_SITE_ID
          ? [
              {
                key: "deployHookURL",
                value: `${data.env.CMS_AUTH_URL}/deploy/${data.env.POKO_SITE_ID}`,
                when: "managed",
                match: `/deploy/${data.env.POKO_SITE_ID}`,
              },
              {
                key: "deployHookAuthHeader",
                valueFrom: "deployKey",
                when: "sync",
              },
            ]
          : [],
      )};
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
      // Contract drift warning — loud, not blocking. Sveltia evolves
      // fast; a mismatched build vs. POKO_SVELTIA_CONTRACT means the
      // relay handshake/API shapes should be re-verified.
      {
        const { gitless, sveltiaVersion, sveltiaContract } =
          window.__POKO_CMS_AUTH__;
        if (gitless && sveltiaContract && sveltiaVersion !== sveltiaContract) {
          const msg =
            "poko: Sveltia " +
            (sveltiaVersion || "unpinned CDN") +
            " is untested against relay contract " +
            sveltiaContract +
            " — auth may break";
          console.error(msg);
          addEventListener("DOMContentLoaded", () => {
            const b = document.createElement("div");
            b.style.cssText =
              "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;" +
              "background:#b91c1c;color:#fff;font:13px/1.4 system-ui;" +
              "padding:.5rem 1rem;text-align:center";
            b.textContent = msg;
            document.body.append(b);
          });
        }
      }
    </script>
    <script src="/admin/prefs.js" eleventy:ignore></script>
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
