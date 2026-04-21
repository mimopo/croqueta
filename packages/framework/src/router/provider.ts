import { provide } from '../di';
import { LinkComponent } from './components/link.component';
import { Router } from './router';
import type { RouterOptions } from './types';

/**
 * Initializes router service and declares the router link component for testing purposes
 * @param options
 */
export function provideRouter(options: RouterOptions) {
  provide(Router, () => new Router(options));
  customElements.define('router-link', LinkComponent, { extends: 'a' });
}
