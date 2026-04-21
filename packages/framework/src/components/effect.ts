import { type EffectCallback, type EffectCleanup, effect } from '../reactivity';

const nodeEffects = new WeakMap<Node, Set<EffectCleanup>>();

/**
 * Registers an effect to be cleaned up when the given node is removed.
 */
export function registerEffect(node: Node, effectFn: EffectCallback) {
  let set = nodeEffects.get(node);
  if (!set) {
    set = new Set();
    nodeEffects.set(node, set);
  }
  set.add(effect(effectFn));
}

/**
 * Recursively cleans up effects associated with a node and its children.
 * Call this when a node is removed from the DOM.
 */
export function cleanup(node: Node) {
  const set = nodeEffects.get(node);
  if (set) {
    set.forEach((dispose) => dispose());
    nodeEffects.delete(node);
  }

  // Cleanup children recursively
  if (node instanceof Element || node instanceof DocumentFragment) {
    node.childNodes.forEach((child) => cleanup(child));
  }
}
