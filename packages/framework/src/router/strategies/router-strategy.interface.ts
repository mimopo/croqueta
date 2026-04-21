import type { Destroy } from '../../di';
import type { SignalState } from '../../reactivity';

/**
 * Defines the contract for a router strategy.
 * A router strategy is responsible for handling the specifics of how URLs are managed
 * and how navigation is triggered (e.g., using hash fragments or the History API).
 */
export interface RouterStrategy extends Destroy {
  /**
   * A Signal that holds the current URL path whenever it changes.
   * Components and services can observe this to react to route changes.
   */
  path: SignalState<string>;
  /**
   * Programmatically navigates to a new path.
   * @param path The path to navigate to.
   * @returns A promise that resolves when the navigation is complete.
   */
  navigate(path: string): Promise<void>;
  /**
   * Generates a URL-friendly href string for a given application path.
   * The format of the href depends on the routing strategy (e.g., `#/path` for hash-based).
   * @param path The application path.
   * @returns The formatted href string.
   */
  getHref(path: string): string;
}
