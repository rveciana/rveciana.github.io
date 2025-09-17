import { visit } from "unist-util-visit";

export default function remarkPicture() {
  return function transformer(tree) {
    visit(tree, "image", (node) => {
      // node.url is what you wrote in Markdown: ![](url)
      // node.alt is the alt text

      // Replace the image node with an MDX JSX element node
      node.type = "mdxJsxFlowElement";
      node.name = "MarkdownPicture";
      node.attributes = [
        { type: "mdxJsxAttribute", name: "src", value: node.url },
        { type: "mdxJsxAttribute", name: "alt", value: node.alt || "" },
      ];
      delete node.url;
      delete node.alt;
    });
  };
}
