import { visit } from "unist-util-visit";
import { h } from "hastscript";
import { headingRank } from "hast-util-heading-rank";
import { toText } from "hast-util-to-text";

// Stolen and simplified from
// https://github.com/JS-DevTools/rehype-toc/blob/master/src/create-toc.ts

export default function rehypeToc() {
  const matchHeadings = [
    { tagName: "h1" },
    { tagName: "h2" },
    { tagName: "h3" },
    { tagName: "h4" },
    { tagName: "h5" },
    { tagName: "h6" },
  ];
  const createListItem = heading => {
    return h("li", [
      h("a", { href: `#${heading.properties.id || ""}` }, [
        toText(heading.children[0]),
      ]),
    ]);
  };
  return (tree) => {
    let levels = [];
    let currentLevel = { depth: 0, headingNumber: 0, list: undefined };
    visit(tree, matchHeadings, heading => {
      const headingNumber = headingRank(heading);
      if (headingNumber > currentLevel.headingNumber) {
        // This is a higher heading number, so start a new level
        const depth = currentLevel.depth + 1;
        const level = {
          depth,
          headingNumber,
          list: h("ol", [createListItem(heading)]),
        };
        // Add the new list to the previous level's list
        if (currentLevel.list) {
          const lastItem = currentLevel.list.children.slice(-1)[0];
          lastItem.children.push(level.list);
        }

        levels.push(level);
        currentLevel = level;
      } else {
        if (headingNumber < currentLevel.headingNumber) {
          // This is a lower heading number, so we need to go up to a previous level
          for (const i = levels.length - 2; i >= 0; i--) {
            const level = levels[i];
            if (level.headingNumber === headingNumber) {
              // We found the previous level that matches this heading
              levels = levels.slice(0, i + 1);
              currentLevel = level;
              break;
            }
          }

          // If headings are in an incorrect order, then we may need to adjust the headingNumber
          currentLevel.headingNumber = Math.min(currentLevel.headingNumber, headingNumber);
        }

        // This heading is the same level as the previous heading,
        // so just add another <li> to the same <ol>
        currentLevel.list.children.push(createListItem(heading));
      }
    });

    tree.children.unshift(
      h("nav", { class: "toc" }, [
        h("h1", "Contents"),
        levels.length === 0 ? h("ol") : levels[0].list,
      ]));
  };
}