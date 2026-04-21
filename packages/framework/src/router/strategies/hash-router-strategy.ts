import { signal } from '../../reactivity';
import type { RouterStrategy } from './router-strategy.interface';

/**
 * A routing strategy that uses the URL hash (`#`) for client-side navigation.
 * This strategy listens for `hashchange` events to react to URL changes.
 *
 * @example
 * ```ts
 * const hashStrategy = new HashRouterStrategy();
 * ```
 */
export class HashRouterStrategy implements RouterStrategy {
  /**
   * A Signal that holds the current URL path (the part after the '#') whenever it changes.
   * It is initialized with the root path `/`.
   */
  public path = signal('/');

  /**
   * Initializes the strategy by setting up a listener for the `hashchange` event
   * and performing an initial hash check to set the initial path.
   */
  constructor() {
    window.addEventListener('hashchange', this.onHashChange);
    this.onHashChange();
  }

  /**
   * Cleans up resources by removing the `hashchange` event listener.
   */
  public destroy(): void {
    window.removeEventListener('hashchange', this.onHashChange);
  }

  /**
   * Navigates to a new path by setting `window.location.hash`.
   * This action will trigger a `hashchange` event, which is then handled by `onHashChange`.
   * @param path The new path to navigate to (e.g., '/home').
   */
  public async navigate(path: string): Promise<void> {
    window.location.hash = path;
  }

  /**
   * Generates a URL-friendly href string for a given application path.
   * For this strategy, it prepends a `#` to the path.
   * @param path The application path.
   * @returns The formatted href string (e.g., '#/home').
   */
  public getHref(path: string): string {
    return `#${path}`;
  }

  private onHashChange = (): void => {
    const path = window.location.hash.slice(1);
    if (!path) {
      window.location.hash = '/';
      return;
    }
    if (this.path.get() !== path) {
      this.path.set(path);
    }
  };
}
