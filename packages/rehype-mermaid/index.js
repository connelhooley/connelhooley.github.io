import { visitParents } from "unist-util-visit-parents";
import { matches } from "hast-util-select";
import { toString } from "hast-util-to-string";
import { fromHtml } from "hast-util-from-html";

import { renderMermaid } from "@mermaid-js/mermaid-cli";
import puppeteer from "puppeteer";

let browser;

export async function mermaidStart() {
  browser = await puppeteer.launch({
    headless: "new",
    ignoreDefaultArgs: ['--disable-extensions'],
    executablePath: "/usr/bin/google-chrome",
  });
}

export function mermaidStop() {
  browser.close();
}

export default function rehypeMermaid() {
  const matchCode = (node) => {
    return matches("code.language-mermaid", node);
  };
  return async (tree) => {
    const matchedCodes = [];
    visitParents(tree, matchCode, (code, ancestors) => {
      if (ancestors.length < 2) return;
      const mermaidSource = toString(code);
      const elementToReplace = ancestors.at(-1);
      const elementToTransform = ancestors.at(-2);
      const updateTree = (mermaidParsed) => {
        const indexToUpdate = elementToTransform.children.indexOf(elementToReplace);
        elementToTransform.children[indexToUpdate] = fromHtml(mermaidParsed);
      };
      matchedCodes.push({ mermaidSource, updateTree });
    });
    await Promise.all(matchedCodes.map(async ({mermaidSource, updateTree}) => {
      const { data } = await renderMermaid(browser, mermaidSource, "svg", {
        mermaidConfig: {
          theme: "base",
          themeVariables: {            
            primaryColor: "#f8bb15",
            primaryTextColor: "#000",
            primaryBorderColor: "#000",
            lineColor: "#f8bb15",
            textColor: "#000",
          },
        },
      });
      const mermaidParsed = data.toString();
      updateTree(mermaidParsed);
    }));
  };
}