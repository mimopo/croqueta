import type { Type } from '../types';

/**
 * Injector will call to this method on its desruction on services implementing this interface.
 * Useful for teardown logic.
 */
export interface Destroy {
  /**
   * Teardown hook
   */
  destroy(): void;
}

/**
 * Injection token is a unique identifier for a dependency.
 */
export interface InjectionToken<T> {
  /** An string used to identify the dependency */
  readonly id: string;
  /** The type of the dependency */
  readonly _type: T;
}

/**
 * The class to be instantiated or a function that returns an instance
 */
export type InjectionFactory<T> = Type<T> | (() => T);

/**
 * The class to be instantiated or an injection token that identifies the dependency
 */
export type InjectionKey<T> = InjectionToken<T> | Type<T>;
