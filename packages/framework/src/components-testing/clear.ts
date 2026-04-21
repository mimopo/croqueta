import { destroyAllInjectors } from '../di';

/**
 * A testing utility to clean up the global state between tests.
 * It removes all elements from the document body and destroys all registered
 * services in the dependency injector.
 *
 * This is typically used in an `afterEach` block to ensure test isolation.
 *
 * @example
 * describe('MyComponent', () => {
 *   afterEach(() => {
 *     clear();
 *   });
 *
 *   test('should do something', () => {
 *     // ... test logic that renders components or uses services
 *   });
 * });
 */
export function clear() {
  document.head.replaceChildren();
  document.body.replaceChildren();
  destroyAllInjectors();
}
