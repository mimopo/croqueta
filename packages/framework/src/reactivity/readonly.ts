import { computed } from './computed';
import type { SignalComputed, SignalState } from './types';

/**
 * Creates a readonly signal.
 * @param signal The signal to create a readonly version of.
 * @returns A readonly signal.
 */
export function readonly<T>(signal: SignalState<T>): SignalComputed<T> {
  return computed(() => signal.get());
}
