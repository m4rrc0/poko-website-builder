// import { loadConfig } from "@unocss/config";
import { createGenerator } from "@unocss/core";
import unoConfig from "./uno.config.js";

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  // Load configuration or use preset-uno if no config
  // const config = await loadConfig();
  // const generator = await createGenerator(config.config);
  const generator = await createGenerator(unoConfig);

  eleventyConfig.addTransform("UnoCSS", async function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      const { css } = await generator.generate(content);
      // console.log(`UnoCSS generated:\n${css}`);
      const contents = content.replace(
        "</style>",
        `/* UnoCSS */
${css}
</style>`
      );
      return contents;
    }

    // If not an HTML output, return content as-is
    return content;
  });
}
