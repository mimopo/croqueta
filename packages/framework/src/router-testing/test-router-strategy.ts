import { signal } from '../reactivity';
import type { RouterStrategy } from '../router';

/**
 * A router strategy implementation for testing purposes.
 * It uses a Signal to track the current path in memory
 * without interacting with the browser's URL or history.
 */
export class TestRouterStrategy implements RouterStrategy {
  /**
   * Signal that holds the current path.
   * Initialized with root path '/'.
   */
  public path = signal('/');

  /**
   * Cleans up the strategy.
   */
  public destroy(): void {}

  /**
   * Simulates navigation to a new path.
   * @param path - The path to navigate to.
   */
  public async navigate(path: string): Promise<void> {
    this.path.set(path);
  }

  /**
   * Generates a href for the given path.
   * @param path - The path to generate the href for.
   * @returns The formatted href string (prefixed with #).
   */
  public getHref(path: string): string {
    return '#' + path;
  }
}
