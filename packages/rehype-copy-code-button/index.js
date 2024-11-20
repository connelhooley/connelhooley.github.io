import { visitParents } from "unist-util-visit-parents";
import { matches } from "hast-util-select";
import { h } from "hastscript";

export default function rehypeCopyCodeButton() {
  return (tree) => {
    const matchCode = (node) => {
      return matches("code.hljs", node);
    };
    visitParents(tree, matchCode, (_, ancestors) => {
      if (ancestors.length < 2) return;
      const elementToTransform = ancestors.at(-2);
      const elementToWrap = ancestors.at(-1);
      const indexToUpdate = elementToTransform.children.indexOf(elementToWrap);
      const elementWrapper = h("div", { class: "copy-code-wrapper", "data-copy-code": "" }, [
        elementToWrap,
      ]);
      elementToTransform.children[indexToUpdate] = elementWrapper;
    });
  };
}
