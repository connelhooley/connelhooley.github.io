import { renderMermaid } from "@mermaid-js/mermaid-cli";
import puppeteer from "puppeteer";

export const mermaidPlugin = (eleventyConfig, options) => {
  let browser;
  eleventyConfig.on("eleventy.before", async () => {
    if (!browser) {
      browser = await puppeteer.launch({headless: "new"});
    };
  });
  eleventyConfig.on("eleventy.after", async () => {
    if (browser) {
      browser.close();
      browser = undefined;
    }
  });

  eleventyConfig.htmlTransformer.addPosthtmlPlugin("html", () => {
    return async (tree) => {
      const transformTag = async (node) => {
        let content;
        if (Array.isArray(node.content)) {
          content = node.content.join("");
        } else {
          content = node.content;
        }
        const { data } = await renderMermaid(browser, content, "svg", {
          mermaidConfig: options.mermaidConfig,
        });
        const htmlString = data.toString();
        node.tag = false;
        node.content = tree.parser(htmlString);
      };  
      const promises = [];
      tree.match({ tag: "pre", attrs: { class: "mermaid" } }, node => {
        promises.push(transformTag(node));
        return node;
      });  
      await Promise.all(promises);
      return tree;
    };
  });
};