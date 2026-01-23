// import { loadConfig } from "@unocss/config";
import { createGenerator } from "@unocss/core";
import unoConfig from "./uno.config.js";

// TODO: Minify CSS on prod

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  // Load configuration or use preset-uno if no config
  // const config = await loadConfig();
  // const generator = await createGenerator(config.config);
  const generator = await createGenerator(unoConfig);

  eleventyConfig.addTransform("UnoCSS", async function (content) {
    if (/admin\/index.html/.test(this.page.outputPath)) {
      return content;
    }

    if ((this.page.outputPath || "").endsWith(".html")) {
      let css = "";
      try {
        const generated = await generator.generate(content);
        css = generated.css;
      } catch (error) {
        console.error("UnoCSS error:\n", error);
        throw error;
      }
      // console.log(`UnoCSS generated:\n${css}`);
      const contents = content.replace(
        "<style>",
        `<style>
/* UnoCSS */
${css}
/* End UnoCSS */
`,
      );
      return contents;
    }

    // If not an HTML output, return content as-is
    return content;
  });
}
