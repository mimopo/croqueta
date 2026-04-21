import type { Action, ActionFn } from './types';

/**
 * Creates a strongly-typed action creator function.
 * An action creator is a function that returns an action object.
 * This helper ensures that the action type is consistent and the payload is correctly typed.
 *
 * @template P The type of the payload for the action.
 * @template A The string literal type for the action's `type` property.
 * @param type A string that uniquely identifies the action.
 * @returns An action creator function that takes a payload of type `P`
 * and returns an action object of type `{ type: A; payload: P; }`.
 *
 * @example
 * // Define an action to add a number
 * const add = createAction<number>('ADD');
 *
 * // Dispatch the action
 * store.dispatch(add(5)); // Action will be { type: 'ADD', payload: 5 }
 *
 * // Define an action with no payload
 * const increment = createAction<void>('INCREMENT');
 * store.dispatch(increment()); // Action will be { type: 'INCREMENT', payload: undefined }
 */
export function createAction<P, A extends string = string>(type: A): ActionFn<A, P> {
  return (payload: P) => {
    return {
      type,
      payload,
    };
  };
}

/** Special action dispatched during the Store initialization */
export const initAction: Action<string, void> = {
  type: '__INIT__',
  payload: undefined,
};
/** Special action dispatched on state jump made by the Redux Dev Tools extension */
export const jumpAction: Action<string, void> = {
  type: '__JUMP__',
  payload: undefined,
};
/** Special action dispatched when a feature is registered */
export const featureInitAction: Action<string, void> = {
  type: '__FEATURE_INIT__',
  payload: undefined,
};
