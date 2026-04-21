import type { Destroy } from '../di';
import { type SignalComputed, computed, effect, signal } from '../reactivity';
import type { MaybePromise } from '../types';
import { featureInitAction, initAction, jumpAction } from './actions';
import type { AnyAction, Reducers, Selector, StoreFeatureConfig } from './types';

/**
 * A side effect that can return an action to dispatch or nothing.
 */
export type Effect = (store: Store) => MaybePromise<void | AnyAction>;

/**
 * A simple state management container inspired by Redux.
 * It manages a single state tree and allows state updates through dispatched actions
 * and reducers. It supports feature-based state registration and state selection
 * with observables.
 */
export class Store implements Destroy {
  /** A signal that holds the last action dispatched to the store. */
  public actions = signal<AnyAction>(initAction);
  /** A signal that holds the last action and the resulting state. */
  public updates = signal<{ action: AnyAction; state: any }>({ action: initAction, state: {} });
  /** The internal signal that holds the current state of the application. */
  private state = signal<Record<string, any>>({});
  /** A map to store reducer functions for each registered feature. */
  private reducers = new Map<string, Reducers<any, any>>();
  /** A map to associate action types with their corresponding feature key. */
  private actionToFeatureKey = new Map<string, string>();
  /** A list of disposers for the registered effects. */
  private disposers: (() => void)[] = [];

  /**
   * Destroy hook
   */
  public destroy(): void {
    for (const disposer of this.disposers) {
      disposer();
    }
  }

  /**
   * Registers a new state feature (slice) in the store.
   * @param feature - The configuration object for the feature, including its key, initial state, actions, and reducers.
   * @throws {Error} if a feature with the same key is already registered.
   * @throws {Error} if an action key does not match its action type.
   */
  public registerFeature(feature: StoreFeatureConfig<any, any>): void {
    // register reducers
    if (this.reducers.has(feature.key)) {
      throw new Error(`Feature ${feature.key} already registered`);
    }
    this.reducers.set(feature.key, feature.reducers);
    // register actions
    for (const actionKey in feature.actions) {
      const actionType = feature.actions[actionKey]({}).type;
      if (actionKey !== actionType) {
        throw new Error(`Action key and type mismatch, key: ${actionKey} - type: ${actionType}`);
      }
      this.actionToFeatureKey.set(actionType, feature.key);
    }
    const currentState = this.state.get();
    // register effects
    if (feature.effects) {
      for (const featureEffect of feature.effects) {
        this.registerEffect(featureEffect);
      }
    }
    // emit feature init action
    this.emit(featureInitAction, { ...currentState, [feature.key]: feature.initialState });
  }

  /**
   * Creates a Computed Signal to select a slice or derived piece of state.
   * @template R The type of the selected state.
   * @param selector - A function that takes the global state and returns a slice of it.
   * @returns A Computed Signal of the selected state.
   */
  public select<R>(selector: Selector<R>): SignalComputed<R> {
    return computed(() => selector(this.state.get()));
  }

  /**
   * Dispatches an action to be processed by the corresponding reducer, updating the state.
   * If no feature or reducer is found for the action type, the action is ignored.
   * @param action - The action to dispatch.
   */
  public dispatch(action: AnyAction) {
    const featureKey = this.actionToFeatureKey.get(action.type);
    if (!featureKey) return;
    const featureReducers = this.reducers.get(featureKey);
    const reducer = featureReducers?.[action.type];
    if (!reducer) return;
    const currentState = this.state.get();
    const currentFeatureState = currentState[featureKey];
    const newState = {
      ...currentState,
      [featureKey]: reducer(currentFeatureState, action.payload),
    };
    this.emit(action, newState);
  }

  /**
   * Registers an effect to be executed. The effect receives the store instance and should return an observable of actions.
   * @param effect - The effect to register.
   */
  public registerEffect(effectFn: Effect): void {
    this.disposers.push(
      effect(async () => {
        const action = await effectFn(this);
        if (action) {
          this.dispatch(action);
        }
      })
    );
  }

  /**
   * Directly sets the store's state to a given value.
   * This is primarily used for time-travel debugging with Redux DevTools.
   * @param state - The new state object.
   */
  public jumpToState(state: Record<string, any>): void {
    this.emit(jumpAction, state);
  }

  /**
   * Emits a new state and the action that caused it to the internal observables.
   * @param action - The action that was dispatched.
   * @param state - The new state after the action was processed.
   */
  private emit(action: AnyAction, state: any): void {
    this.state.set(state);
    this.actions.set(action);
    this.updates.set({
      action,
      state,
    });
  }
}
