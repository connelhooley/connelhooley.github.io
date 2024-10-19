import { visitParents } from "unist-util-visit-parents";
import { matches } from "hast-util-select";
import { toString } from "hast-util-to-string";

export default function rehypeMermaid() {
  const matchCode = (node) => {
    return matches("code.language-mermaid", node);
  };
  return (tree) => {
    visitParents(tree, matchCode, (code, ancestors) => {
      const mermaidSource = toString(code);
      const parent = ancestors.at(-1);
      // TODO Render diagram
    });
  };
}