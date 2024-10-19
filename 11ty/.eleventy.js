import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyWebcPlugin from "@11ty/eleventy-plugin-webc";
import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";

import { codePlugin } from "./libs/code.js";
import { mermaidPlugin } from "./libs/mermaid.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default (eleventyConfig) => {
	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
	eleventyConfig.addPlugin(eleventyWebcPlugin, {
		components: "src/_includes/components/**/*.webc",
	});
	eleventyConfig.addPlugin(codePlugin, {
		highlighterConfig: {
			themes: ["dark-plus"],
      langs: ["csharp"],
		},
		theme: "dark-plus",
	});
	eleventyConfig.addPlugin(mermaidPlugin, {
		mermaidConfig: {
			theme: "base",
			themeVariables: {
				primaryColor: "#BB2528",
				primaryTextColor: "#fff",
				primaryBorderColor: "#7C0000",
				lineColor: "#F8B229",
				secondaryColor: "#006100",
				tertiaryColor: "#fff",
			}
		},
	});
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		extensions: "html",
		formats: ["png"],
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
		urlPath: "/assets/",
	});

	return {
		htmlTemplateEngine: "webc",
		dir: {
      input: "src",
    },
	};
};
