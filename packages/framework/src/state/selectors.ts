import type { Selector } from './types';

/**
 * Creates a memoized selector function to retrieve a top-level feature state
 * from the global state object. This is the primary way to select a specific
 * slice of the state tree.
 *
 * @template T The type of the feature state.
 * @param key The key of the feature state in the global state object.
 * @returns A memoized selector function that takes the global state and returns
 * the feature state of type `T`.
 *
 * @example
 * const selectCounterState = createFeatureSelector<{ count: number }>('counter');
 * const state = { counter: { count: 5 } };
 * const counterState = selectCounterState(state); // returns { count: 5 }
 */
export function createFeatureSelector<T extends object>(key: string): Selector<T> {
  return (state: Record<string, any>) => state[key];
}

/**
 * Creates a memoized selector that computes a derived value from other selectors.
 * The projector function is only re-evaluated if the input values from the
 * selectors have changed, making it efficient for complex state derivations.
 * @param selector1 A sequence of selector functions.
 * @param projector A function that takes the results of the selectors and computes the derived state.
 */
export function createSelector<S1, Result>(selector1: Selector<S1>, projector: (s1: S1) => Result): Selector<Result>;
export function createSelector<S1, S2, Result>(
  selector1: Selector<S1>,
  selector2: Selector<S2>,
  projector: (s1: S1, s2: S2) => Result
): Selector<Result>;
export function createSelector<S1, S2, S3, Result>(
  selector1: Selector<S1>,
  selector2: Selector<S2>,
  selector3: Selector<S3>,
  projector: (s1: S1, s2: S2, s3: S3) => Result
): Selector<Result>;
/**
 * Creates a memoized selector that computes a derived value from an arbitrary
 * number of other selectors.
 *
 * @param args A sequence of selector functions, followed by a projector function.
 * @returns A new memoized selector that returns the derived state.
 *
 * @example
 * const selectCount = createSelector(selectCounterState, state => state.count);
 */
export function createSelector(...args: any[]): Selector<any> {
  const selectors = args.slice(0, args.length - 1);
  const projector = args[args.length - 1];
  return (state: any) => {
    const inputs = selectors.map((selector) => selector(state));
    return projector(...inputs);
  };
}
