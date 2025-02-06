import { visit } from "unist-util-visit";
import { matches } from "hast-util-select";

export default function rehypeFootnotesHeading() {
  const matchHeading = (node) => {
    return matches("h2#footnote-label", node);
  };
  return (tree) => {
    visit(tree, matchHeading, heading => {
      heading.tagName = "h1";
    });
  };
}
