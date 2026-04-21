import { Signal } from './abstraction';
import type { SignalComputed } from './types';

/**
 * Creates a computed signal.
 * @param fn The function to compute.
 * @returns A computed signal.
 */
export function computed<T>(fn: () => T): SignalComputed<T> {
  return new Signal.Computed(fn);
}
