import { inject, provide } from '../di';
import { StoreDevTools } from './store-dev-tools';
import type { ReduxDevtoolsOptions } from './types';

/**
 * Initializes the redux store dev tools
 * @param options
 */
export function provideStoreDevTools(options?: ReduxDevtoolsOptions) {
  provide(StoreDevTools, () => new StoreDevTools(options));
  inject(StoreDevTools);
}
