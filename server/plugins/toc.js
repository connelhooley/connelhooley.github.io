import { visit } from "unist-util-visit";

const tags = [ "h1", "h2", "h3" ];
const matchNode = node => tags.includes(node.tag) && !(node.props?.className?.includes("sr-only") ?? false);
const getNodeId = node => node.props.id;
const getNodeText = node => {
  let text = "";
  visit(node, "text", node => {
    text += node.value;
  });
  return text;
};
const getNodeDepth = node => tags.indexOf(node.tag) + 1;
export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook("content:file:afterParse", file => {
    if (file._extension = "md" && file._path.startsWith("/blog")) {
      const toc = [];
      visit(file.body, matchNode, (node) => {
        toc.push({
          id: getNodeId(node),
          text: getNodeText(node),
          depth: getNodeDepth(node),
        });
      });
      file.toc = toc;
    }
    return file;
  });
});
