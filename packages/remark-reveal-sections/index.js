import { visit } from "unist-util-visit";

export default function remarkRevealSections() {
  return (tree) => {
    visit(tree, "thematicBreak", (node) => {
      node.type = "html"
      node.value = "</section><section>";
    });
    visit(tree, "root", (node) => {
      const opening = {
        type: "html",
        value: "<section>",
      };
      const closing = {
        type: "html",
        value: "</section>",
      };
      node.children = [opening, ...node.children, closing];
    });
  };
}
