import { Signal } from './abstraction';
import type { SignalState } from './types';

/**
 * Creates a reactive signal.
 * @param initialValue The initial value of the signal.
 * @returns A signal.
 */
export function signal<T>(initialValue: T): SignalState<T> {
  return new Signal.State(initialValue);
}
