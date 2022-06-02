const visit = require("unist-util-visit");
const { parse } = require("node-html-parser");

module.exports = ({ markdownAST }, {
  wrapperClass = "code-copy-wrapper",
  buttonClass = "code-copy-button",
}) => {
  visit(markdownAST, "html", node => {
    const html = parse(node.value);
    if (html?.firstChild?.classNames?.includes("gatsby-highlight")) {
      node.value = `
        <div class="${wrapperClass}">
          <button class="${buttonClass}" onClick="_codeToClipboard(event);">Copy</button>${node.value}
        </div>`;
    }
  });
  return markdownAST;
};