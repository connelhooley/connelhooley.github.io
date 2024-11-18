import { visit } from "unist-util-visit";

export default function remarkRevealSections() {
  return (tree) => {
    visit(tree, "root", (node) => {
      const opening = {
        type: "html",
        value: `<div class="reveal"><div class="slides"><section>`,
      };
      const closing = {
        type: "html",
        value: "</section></div></div>",
      };
      var a = [opening, ...node.children, closing]
      node.children = a;
    });
    visit(tree, "thematicBreak", (node) => {
      node.type = "html"
      node.value = "</section><section>";
    });
    console.log("finished");
  };
}
