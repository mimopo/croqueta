import type { Destroy } from '../di';
import { type SignalComputed, computed, signal } from '../reactivity';

/**
 * Manages a collection of "portals". A portal is a mechanism to render a content
 * at a different location in the DOM tree. This service acts as a centralized,
 * reactive registry for these portal elements.
 */
export class PortalService implements Destroy {
  /**
   * A Signal that holds the current state of all registered portals
   * as a key-value map, where the key is the portal's unique identifier and
   * the value is the Node to be rendered.
   */
  private portals = signal<Record<string, Node>>({});

  /** @inheritdoc */
  public destroy() {
    this.portals.set({});
  }

  /**
   * Registers or updates a Node for a given portal key.
   * @param key A unique string identifier for the portal.
   * @param node The Node to be associated with the portal key.
   */
  public update(key: string, node: Node) {
    this.portals.set({
      ...this.portals.get(),
      [key]: node,
    });
  }

  /**
   * Removes a portal from the registry.
   * @param key The unique string identifier of the portal to unregister.
   */
  public remove(key: string) {
    const portals = { ...this.portals.get() };
    if (portals[key]) {
      delete portals[key];
      this.portals.set(portals);
    }
  }

  /**
   * Retrieves a Signal that emits the Node for a specific portal key
   * whenever it changes.
   * @param key The unique string identifier of the portal to observe.
   * @returns A Signal that returns the Node or `undefined` if the key is not registered.
   */
  public get(key: string): SignalComputed<Node | undefined> {
    return computed(() => this.portals.get()[key]);
  }
}
