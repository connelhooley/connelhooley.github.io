import { visit } from "unist-util-visit";
import { headingRank } from "hast-util-heading-rank";
import { toText } from "hast-util-to-text";

export default function rehypeInferTocMeta() {
  const matchHeadings = [
    { tagName: "h1" },
    { tagName: "h2" },
    { tagName: "h3" },
    { tagName: "h4" },
    { tagName: "h5" },
    { tagName: "h6" },
  ];
  return (tree, file) => {
    file.data ??= {};
    file.data.meta ??= {};
    if (file.data?.matter?.toc === false) {
      file.data.meta.toc = false;
      return;
    }
    const result = [];
    const levels = [{ children: result }];
    visit(tree, matchHeadings, heading => {
      const item = {
        id: heading.properties.id || "",
        rank: headingRank(heading),
        text: toText(heading.children[0]),
      };
      // Taken from https://stackoverflow.com/a/47969412/310098
      const depth = item.rank - 1;
      levels[depth].children = levels[depth].children || [];
      levels[depth].children.push(levels[depth + 1] = item);
    });
    file.data.meta.toc = result;
  };
}
