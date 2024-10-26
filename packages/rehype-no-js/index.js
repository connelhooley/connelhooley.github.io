import { h } from "hastscript";
import { visit, EXIT } from "unist-util-visit";

export default function rehypeNoJs() {
  return (tree) => {
    visit(tree, { tagName: "body" }, body => {
      body.properties ??= {};
      body.properties.className ??= [];
      body.properties.className.push("no-js");
      body.children.unshift(h("script", "document.body.classList.remove('no-js');"));
      return EXIT;
    });
  };
}
