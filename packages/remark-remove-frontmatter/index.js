import { remove } from "unist-util-remove";

export default function remarkRevealSections() {
  return (tree) => {
    remove(tree, "yaml");
  };
}
