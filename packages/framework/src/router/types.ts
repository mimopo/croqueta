import type { ComponentConstructor } from '../components';
import type { MaybePromise } from '../types';
import type { RouterStrategy } from './strategies/router-strategy.interface';

/**
 * Key-value pairs of route parameters.
 */
export type RouteParams = Record<string, string>;

/**
 * Function that resolves data for a route.
 * @template T The type of the resolved data.
 * @param params The route parameters.
 * @returns A promise that resolves to the data.
 */
export type ResolverFn<T = unknown> = (params: RouteParams) => MaybePromise<T>;

/**
 * Function that determines the path to redirect to.
 * @param params The route parameters.
 * @returns A promise that resolves to the new path.
 */
export type RedirectFn = (params: RouteParams) => MaybePromise<string>;

/**
 * Function that guards access to or from a route.
 * @param params The route parameters.
 * @returns A promise that resolves to true if access is allowed, false otherwise.
 */
export type GuardFn = (params: RouteParams) => MaybePromise<boolean>;

/**
 * Represents a route configuration.
 */
export interface Route {
  /** The path for the route. */
  path: string;
  /** The component to render for this route. */
  component?: ComponentConstructor;
  /** Lazy loads the component for this route. */
  loadComponent?: (params: RouteParams) => Promise<ComponentConstructor>;
  /** Child routes. */
  children?: Route[];
  /** Lazy loads child routes. */
  loadChildren?: (params: RouteParams) => Promise<Route[]>;
  /** Data resolvers for the route. */
  data?: Record<string, ResolverFn>;
  /** Redirect function for the route. */
  redirect?: RedirectFn;
  /** Guards to run before entering the route. */
  accessGuard?: GuardFn[];
  /** Guards to run before leaving the route. */
  leaveGuard?: GuardFn[];
  /** Function to resolve the page title. */
  title?: (params: RouteParams) => MaybePromise<string>;
  /** Unique name for the route. */
  name?: string;
}

/**
 * Represents a route that is currently active.
 */
export interface ActivatedRoute {
  /** The full path of the activated route. */
  path: string;
  /** The parameters extracted from the route. */
  params: RouteParams;
  /** The component associated with the route. */
  component?: ComponentConstructor;
  /** The resolved data for the route. */
  data?: Record<string, unknown>;
  /** Guards to run when leaving this route. */
  leaveGuard: GuardFn[];
}

/**
 * Options for configuring the router.
 */
export interface RouterOptions {
  /** The routing strategy to use (e.g., Hash or Path). */
  strategy: RouterStrategy;
  /** The initial route configuration. */
  routes: Route[];
}

/**
 * Result of matching a path against a route.
 */
export interface RouteMatch {
  /** The extracted parameters. */
  params: RouteParams;
  /** Whether the path matched the route. */
  match: boolean;
  /** The remaining part of the path after matching. */
  remaining: string;
}
