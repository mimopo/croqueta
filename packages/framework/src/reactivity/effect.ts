import { Signal } from './abstraction';
import type { EffectCallback, EffectCleanup } from './types';

/**
 * Creates a reactive effect that automatically re-runs when its dependencies change.
 * @param callback The function to run.
 * @returns A function to dispose the effect.
 */
export function effect(callback: EffectCallback): EffectCleanup {
  let cleanup: EffectCleanup | void;
  let scheduled = false;
  let disposed = false;

  // We use a Computed to automatically track dependencies
  const computedSignal = new Signal.Computed(() => {
    try {
      return callback();
    } catch (e) {
      console.error('Effect error:', e);
    }
  });

  const watcher = new Signal.subtle.Watcher(() => {
    if (scheduled) return;
    scheduled = true;

    queueMicrotask(() => {
      if (disposed) return;
      scheduled = false;
      if (typeof cleanup === 'function') {
        cleanup();
      }

      const result = computedSignal.get();
      if (typeof result === 'function') {
        cleanup = result;
      }

      watcher.watch(computedSignal);
    });
  });

  // Initial execution
  const result = computedSignal.get();
  if (typeof result === 'function') {
    cleanup = result;
  }

  watcher.watch(computedSignal);

  return () => {
    disposed = true;
    if (typeof cleanup === 'function') {
      cleanup();
    }
    watcher.unwatch(computedSignal);
  };
}
