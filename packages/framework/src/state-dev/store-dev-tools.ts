import { inject } from '../di';
import { effect } from '../reactivity';
import { Store, initAction, jumpAction } from '../state';
import { logger } from '../utils';
import type { DevToolsInstance, DevToolsMessage, ReduxDevtoolsExtension, ReduxDevtoolsOptions } from './types';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolsExtension;
  }
}

/**
 * Integrates the application's `Store` with the Redux DevTools browser extension.
 * This allows for time-travel debugging and action/state inspection.
 * It automatically subscribes to store updates and sends them to the extension,
 * and listens for messages from the extension (like time-travel jumps) to update the store.
 */
export class StoreDevTools {
  /** The instance of the Redux DevTools extension, if available. */
  private devTools?: DevToolsInstance;
  /** The application's central store instance, retrieved via the Injector. */
  private store = inject(Store);
  /** The function to call to unsubscribe from store updates. */
  private disposer?: () => void;

  private logger = logger('store-dev-tools');

  constructor(options?: ReduxDevtoolsOptions) {
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
      this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(options);
      this.devTools?.subscribe((m) => this.handleDevToolsMessage(m));
      // Subscribe to store updates to send them to the DevTools.
      this.disposer = effect(() => {
        const { action, state } = this.store.updates.get();
        if (action.type === initAction.type) {
          this.devTools?.init(state);
        } else if (action.type !== jumpAction.type) {
          this.devTools?.send(action, state);
        }
      });
    } else {
      this.logger.log('Redux DevTools not found. Installation instructions at https://github.com/reduxjs/redux-devtools/');
    }
  }

  /**
   * Disconnects from the Redux DevTools extension and cleans up subscriptions.
   * This should be called when the application is destroyed.
   */
  public destroy() {
    window.__REDUX_DEVTOOLS_EXTENSION__?.disconnect();
    this.disposer?.();
  }

  /**
   * Handles messages received from the Redux DevTools extension, such as time-travel actions.
   * @param message - The message from the DevTools extension.
   */
  private handleDevToolsMessage(message: DevToolsMessage) {
    if (message.type !== 'DISPATCH') {
      return;
    }
    if (message.payload.type === 'JUMP_TO_STATE' || message.payload.type === 'JUMP_TO_ACTION') {
      this.store.jumpToState(JSON.parse(message.state));
    }
  }
}
