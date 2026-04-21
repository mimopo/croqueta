import type { Actions, Selector, StoreFeatureConfig, StoreFeatureConfigWithSelectors } from './types';

/**
 * Creates a strongly-typed feature configuration object.
 * This helper allows for automatic inference of action and selector types,
 * eliminating the need for explicit `typeof` in variable declarations.
 *
 * @template S The type of the state for this feature.
 * @template A The type of the action creator dictionary.
 * @template Selectors The type of the selector dictionary.
 * @param config The feature configuration object.
 * @returns The same configuration object with inferred types.
 */
export function createFeature<S extends object, A extends Actions>(config: StoreFeatureConfig<S, A>): StoreFeatureConfig<S, A>;
export function createFeature<S extends object, A extends Actions, Selectors extends Record<string, Selector<unknown>>>(
  config: StoreFeatureConfigWithSelectors<S, A, Selectors>
): StoreFeatureConfigWithSelectors<S, A, Selectors>;
export function createFeature(config: any): any {
  return config;
}
