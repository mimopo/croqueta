import { provide } from '../di';
import { LinkComponent, Router, type RouterOptions } from '../router';
import { TestRouterStrategy } from './test-router-strategy';

/**
 * Initializes router service and declares the router link component
 * @param options
 */
export function provideRouter(options: Omit<RouterOptions, 'strategy'>) {
  provide(Router, () => new Router({ ...options, strategy: new TestRouterStrategy() }));
  customElements.define('router-link', LinkComponent, { extends: 'a' });
}
