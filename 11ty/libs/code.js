import { getHighlighter } from "shiki";

// https://www.hoeser.dev/blog/2023-02-07-eleventy-shiki-simple/

export const codePlugin = (eleventyConfig, options) => {
  // empty call to notify 11ty that we use this feature
  // eslint-disable-next-line no-empty-function
  eleventyConfig.amendLibrary("md", () => {});
  
  eleventyConfig.on("eleventy.before", async () => {
    const highlighter = await getHighlighter(options.highlighterConfig);
    eleventyConfig.amendLibrary("md", mdLib =>
      mdLib.set({
        highlight: (code, lang) => {
          if (lang === "mermaid") {
            return `<pre class="mermaid">${code}</pre>`;
          } else {
            return highlighter.codeToHtml(code, { lang, theme: options.theme });
          }
        },
      }),
    );
  });
};