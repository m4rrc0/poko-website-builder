import { isBun } from "../../../utils/runtime.js";

// html-rewriter-wasm runs the same lol-html engine as Bun's HTMLRewriter.
async function loadNodeHTMLRewriter() {
  try {
    const { HTMLRewriter } = await import("html-rewriter-wasm");
    return HTMLRewriter;
  } catch (error) {
    console.error("HTMLRewriter not available without Bun.");
    console.error("Install `html-rewriter-wasm` to enable it under Node.", error);
    throw error;
  }
}

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  const registerHandlers = (rewriter) => {
    for (const [selector, className] of Object.entries(
      pluginOptions?.classes || {},
    )) {
      rewriter.on(selector, {
        element(element) {
          const classAttr = element.getAttribute("class");
          element.setAttribute(
            "class",
            [classAttr, className].filter(Boolean).join(" "),
          );
        },
      });
    }
  };

  if (isBun) {
    const rewriter = new HTMLRewriter();
    registerHandlers(rewriter);

    eleventyConfig.addTransform("htmlClassesTransform", function (content) {
      if ((this.page.outputPath || "").endsWith(".html")) {
        const html = rewriter.transform(content);

        return html;
      }

      // If not an HTML output, return content as-is
      return content;
    });
    return;
  }

  const NodeHTMLRewriter = await loadNodeHTMLRewriter();

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  eleventyConfig.addTransform("htmlClassesTransform", async function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      let html = "";
      const rewriter = new NodeHTMLRewriter((chunk) => {
        html += decoder.decode(chunk, { stream: true });
      });
      registerHandlers(rewriter);
      await rewriter.write(encoder.encode(content));
      await rewriter.end();
      rewriter.free();
      html += decoder.decode();

      return html;
    }

    // If not an HTML output, return content as-is
    return content;
  });
}
