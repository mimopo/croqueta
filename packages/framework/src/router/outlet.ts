import type { Destroy } from '../di';

/**
 * Manages the hierarchy of router outlets in the application.
 * It keeps track of nested outlets to ensure correct component rendering order.
 */
export class Outlet implements Destroy {
  private stack: HTMLElement[] = [];

  /**
   * Registers a new router outlet element.
   * @param element The outlet element to register.
   * @returns The depth index of the registered outlet.
   */
  public register(element: HTMLElement) {
    // const parent = this.stack[this.stack.length - 1];
    // if (parent && !parent.contains(element)) {
    //   throw new Error('Duplicated router');
    // }
    this.stack.push(element);
    return this.stack.length - 1;
  }

  /**
   * Unregisters a router outlet element and all its children.
   * @param element The outlet element to unregister.
   */
  public unregister(element: HTMLElement) {
    const index = this.stack.indexOf(element);
    this.stack = this.stack.slice(0, index);
  }

  /**
   * Cleans up the outlet stack.
   */
  public destroy(): void {
    this.stack = [];
  }
}
