import { beforeEach, describe, expect, test, vi } from 'vitest';

import { waitForAsync } from '../components-testing';
import { effect } from '../reactivity';
import { createAction } from './actions';
import { createFeatureSelector, createSelector } from './selectors';
import { Store } from './store';
import { type Reducers, type Selector, type StoreFeatureConfig } from './types';

describe('Store', () => {
  interface TestState {
    count: number;
    message: string;
  }

  const initialState: TestState = {
    count: 0,
    message: 'initial',
  };

  const actions = {
    increment: createAction<void>('increment'),
    add: createAction<number>('add'),
    setMessage: createAction<string>('setMessage'),
  };

  let store: Store;
  let featureSelector: Selector<TestState>;

  beforeEach(() => {
    const reducers: Reducers<TestState, typeof actions> = {
      increment: (state) => {
        return { ...state, count: state.count + 1 };
      },
      add: (state, payload) => ({ ...state, count: state.count + payload }),
      setMessage: (state, payload) => ({ ...state, message: payload }),
    };

    const testFeature: StoreFeatureConfig<TestState, typeof actions> = {
      key: 'test',
      initialState,
      actions,
      reducers,
    };

    store = new Store();
    store.registerFeature(testFeature);
    featureSelector = createFeatureSelector(testFeature.key);
  });

  test('should be created', () => {
    expect(store).toBeInstanceOf(Store);
  });

  test('should register a feature and set initial state', () => {
    const state = store.select(featureSelector);
    expect(state.get()).toEqual(initialState);
  });

  test('should dispatch an action and update the state', () => {
    store.dispatch(actions.increment());
    const selector = createSelector(featureSelector, (s) => s.count);

    const count = store.select(selector);
    expect(count.get()).toEqual(1);

    store.dispatch(actions.add(5));
    expect(count.get()).toBe(6);
  });

  test('should select a slice of state and emit only when it changes', async () => {
    const messageSelector = createSelector(featureSelector, (state: TestState) => state.message);
    const message = store.select(messageSelector);

    const spy = vi.fn<(msg: string) => void>();
    effect(() => spy(message.get()));
    await waitForAsync();

    // Initial emission
    expect(spy).toHaveBeenCalledWith('initial');
    expect(spy).toHaveBeenCalledTimes(1);

    // Dispatch an action that doesn't change the message
    store.dispatch(actions.increment());
    await waitForAsync();
    expect(spy).toHaveBeenCalledTimes(1); // Should not emit again

    // Dispatch an action that changes the message
    store.dispatch(actions.setMessage('new message'));
    await waitForAsync();
    expect(spy).toHaveBeenCalledWith('new message');
    expect(spy).toHaveBeenCalledTimes(2);

    // Dispatch another action that doesn't change the message
    store.dispatch(actions.add(10));
    await waitForAsync();
    expect(spy).toHaveBeenCalledTimes(2); // Should not emit again
  });

  test('should handle dispatching actions with payloads', () => {
    const messageSelector = createSelector(featureSelector, (state: TestState) => state.message);
    store.dispatch(actions.setMessage('vitest'));
    const message = store.select(messageSelector);
    expect(message.get()).toBe('vitest');
  });

  test('should handle multiple features and combine selectors', async () => {
    // 1. Define a second feature for authentication state
    interface AuthState {
      user: string | null;
      loggedIn: boolean;
    }

    const authInitialState: AuthState = {
      user: null,
      loggedIn: false,
    };

    const authActions = {
      login: createAction<string>('login'),
      logout: createAction<void>('logout'),
    };

    const authReducers: Reducers<AuthState, typeof authActions> = {
      login: (state, payload) => ({ ...state, user: payload, loggedIn: true }),
      logout: (state) => ({ ...state, user: null, loggedIn: false }),
    };

    const authFeature: StoreFeatureConfig<AuthState, typeof authActions> = {
      key: 'auth',
      initialState: authInitialState,
      actions: authActions,
      reducers: authReducers,
    };

    // 2. Register the second feature
    store.registerFeature(authFeature);

    // 3. Create selectors for both features
    const authFeatureSelector = createFeatureSelector<AuthState>('auth');
    const selectCount = createSelector(featureSelector, (s) => s.count);
    const selectUser = createSelector(authFeatureSelector, (s) => s.user);

    // 4. Create a selector that combines data from both features
    const selectViewModel = createSelector(selectCount, selectUser, (count, user) => `User: ${user || 'Guest'}, Count: ${count}`);

    const spy = vi.fn<(vm: string) => void>();
    effect(() => spy(store.select(selectViewModel).get()));
    await waitForAsync();

    // 5. Dispatch actions and assert the combined state
    expect(spy).toHaveBeenCalledWith('User: Guest, Count: 0');
    store.dispatch(actions.add(10));
    await waitForAsync();
    expect(spy).toHaveBeenCalledWith('User: Guest, Count: 10');
    store.dispatch(authActions.login('Miguel'));
    await waitForAsync();
    expect(spy).toHaveBeenCalledWith('User: Miguel, Count: 10');
    store.dispatch(authActions.logout());
    await waitForAsync();
    expect(spy).toHaveBeenCalledWith('User: Guest, Count: 10');
    expect(spy).toHaveBeenCalledTimes(4);
  });
});
