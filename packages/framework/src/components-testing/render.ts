/**
 * Renders a node to the document body.
 * @param node The node to render.
 * @returns The rendered node.
 */
export function render<T extends Node>(node: T): T {
  document.body.replaceChildren(node);
  return node;
}
