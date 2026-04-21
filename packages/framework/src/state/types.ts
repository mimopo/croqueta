import type { Effect } from './store';

/**
 * A function that takes the current state and a payload, and returns a new state.
 * @template S The type of the state.
 * @template P The type of the payload.
 * @param state The current state.
 * @param payload The action payload.
 * @returns The new state.
 */
export type Reducer<S, P> = (state: S, payload: P) => S;
/**
 * Represents a standard action object with a type and a payload.
 * @template A The string literal type for the action's type.
 * @template P The type of the payload.
 */
export type Action<A extends string, P> = { type: A; payload: P };
/**
 * Represents any possible action
 */
export type AnyAction = Action<string, any>;
/**
 * An action creator function that takes a payload and returns a typed action object.
 * @template A The string literal type for the action's type.
 * @template P The type of the payload.
 */
export type ActionFn<A extends string, P> = (payload: P) => Action<A, P>;
/**
 * A dictionary of action creator functions for a feature.
 * The keys are the names of the actions.
 */
export type Actions = Record<string, ActionFn<string, any>>;
/**
 * A mapped type that creates a dictionary of reducer functions from a dictionary of action creators.
 * It ensures that each reducer function corresponds to an action and has a correctly typed payload.
 * @template S The type of the state slice this reducer operates on.
 * @template T The type of the `Actions` object for the feature.
 */
export type Reducers<S, T> = {
  [K in keyof T]: T[K] extends ActionFn<any, infer P> ? Reducer<S, P> : never;
};
/**
 * A function that takes the global application state and returns a slice or derived piece of that state.
 * @template T The type of the returned state slice.
 * @param state The global state object.
 * @returns A slice or derived value from the state.
 */
export type Selector<T> = (state: Record<string, any>) => T;

/**
 * The configuration object for registering a new feature slice in the store.
 * @template S The type of the feature's state.
 * @template A The type of the feature's actions object.
 */
export interface StoreFeatureConfig<S extends object, A extends Actions> {
  key: string;
  initialState: S;
  actions: A;
  reducers: Reducers<S, A>;
  effects?: Effect[];
}

export interface StoreFeatureConfigWithSelectors<
  S extends object,
  A extends Actions,
  Selectors extends Record<string, Selector<unknown>> = Record<string, Selector<unknown>>,
> extends StoreFeatureConfig<S, A> {
  selectors: Selectors;
}
