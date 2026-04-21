import { cleanup, registerEffect } from './effect';
import type { RepeatResult, SignalLike } from './types';

/**
 * @param itemsSignal - The reactive array
 * @param keyFn - Extracts a unique key (e.g., (item) => item.id)
 * @param templateFn - Returns an html`` template for each item
 */
export function repeat<T>(itemsSignal: SignalLike<T[]>, keyFn: (item: T) => unknown, templateFn: (item: T) => Node): RepeatResult<T> {
  return {
    type: 'repeat',
    itemsSignal,
    keyFn,
    templateFn,
    // Store for the persistent DOM nodes mapped by key
    cache: new Map<unknown, { nodes: Node[]; item: T }>(),
  };
}

export function repeater(val: RepeatResult<unknown>, anchor: Node) {
  const { itemsSignal, keyFn, templateFn, cache } = val;

  registerEffect(anchor, () => {
    const items = itemsSignal.get();
    const parent = anchor.parentNode;
    if (!parent) return;

    // 1. Cleanup: Remove nodes no longer in the list
    const currentKeys = new Set<unknown>();
    for (const item of items) {
      currentKeys.add(keyFn(item));
    }

    for (const [key, cached] of cache.entries()) {
      if (!currentKeys.has(key)) {
        cached.nodes.forEach((n: Node) => {
          cleanup(n);
          (n as ChildNode).remove();
        });
        cache.delete(key);
      }
    }

    // 2. Reconciliation loop in reverse order to use insertBefore relative to anchor
    let nextNode = anchor;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const key = keyFn(item);

      let cached = cache.get(key);
      if (!cached) {
        // Create new DOM nodes if not in cache
        const content = templateFn(item);
        // Track the actual DOM nodes
        cached = { nodes: Array.from(content.childNodes), item };
        cache.set(key, cached);
      }

      // 2. DOM Placement
      // We move nodes into the correct position relative to the nextNode (initially the anchor)
      for (let j = cached.nodes.length - 1; j >= 0; j--) {
        const n = cached.nodes[j];
        if (n.nextSibling !== nextNode) {
          parent.insertBefore(n, nextNode);
        }
        nextNode = n;
      }
    }
  });
}
