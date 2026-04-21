import { signal } from '../../reactivity';
import type { RouterStrategy } from './router-strategy.interface';

/**
 * A routing strategy that uses the browser's History API (`pushState`) for clean, path-based URLs.
 * This strategy listens for `popstate` events to handle browser back/forward navigation.
 *
 * @example
 * ```ts
 * const pathStrategy = new PathRouterStrategy();
 * ```
 */
export class PathRouterStrategy implements RouterStrategy {
  /**
   * A Signal that holds the current URL path whenever it changes.
   * It is initialized with the current path at the time of instantiation.
   */
  public path = signal('/');

  /**
   * Initializes the strategy by setting up a listener for the `popstate` event
   * and performing an initial state check to get the current path.
   */
  constructor() {
    window.addEventListener('popstate', this.onPopState);
    void this.onPopState();
  }

  /**
   * Cleans up resources by removing the `popstate` event listener.
   */
  public destroy(): void {
    window.removeEventListener('popstate', this.onPopState);
  }

  /**
   * Navigates to a new path using `history.pushState`.
   * Since `pushState` does not trigger a `popstate` event, it manually calls `onPopState`
   * to ensure the application state is updated.
   * @param path The new path to navigate to (e.g., '/products/123').
   */
  public async navigate(path: string): Promise<void> {
    history.pushState({}, '', path);
    return this.onPopState(); // pushState doesn't trigger popstate, so we call it manually
  }

  /**
   * Generates a URL-friendly href string for a given application path.
   * For this strategy, it's simply the path itself.
   * @param path The application path.
   * @returns The same path, as no special formatting is needed.
   */
  public getHref(path: string): string {
    return path;
  }

  private onPopState = async (): Promise<void> => {
    const path = window.location.pathname;
    if (!path) {
      await this.navigate('/');
      return;
    }
    if (this.path.get() !== path) {
      this.path.set(path);
    }
  };
}
