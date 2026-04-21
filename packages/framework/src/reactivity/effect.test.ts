import { describe, expect, test, vi } from 'vitest';

import { effect } from './effect';
import { signal } from './signal';

describe('effect', () => {
  test('should run immediately', () => {
    const spy = vi.fn();
    effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should run when dependency changes', async () => {
    const s = signal(1);
    const spy = vi.fn(() => {
      s.get();
    });
    effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    s.set(2);
    // effect uses queueMicrotask
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('should call cleanup before re-run', async () => {
    const s = signal(1);
    const cleanup = vi.fn();
    const spy = vi.fn(() => {
      s.get();
      return cleanup;
    });

    effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    s.set(2);
    await Promise.resolve();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('should call cleanup on disposal', () => {
    const cleanup = vi.fn();
    const dispose = effect(() => {
      return cleanup;
    });

    expect(cleanup).not.toHaveBeenCalled();
    dispose();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test('should not run after disposal', async () => {
    const s = signal(1);
    const spy = vi.fn(() => {
      s.get();
    });
    const dispose = effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    dispose();
    s.set(2);
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should handle multiple dependencies', async () => {
    const s1 = signal(1);
    const s2 = signal(10);
    const spy = vi.fn(() => {
      void (s1.get() + s2.get());
    });

    effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    s1.set(2);
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(2);

    s2.set(20);
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(3);
  });

  test('should NOT create memory leaks (unwatching test)', async () => {
    const s = signal(1);
    let count = 0;
    const dispose = effect(() => {
      s.get();
      count++;
    });

    expect(count).toBe(1);

    s.set(2);
    await Promise.resolve();
    expect(count).toBe(2);

    dispose();

    s.set(3);
    await Promise.resolve();
    // If it still watched, count would be 3
    expect(count).toBe(2);
  });

  test('should handle errors in callback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    effect(() => {
      throw new Error('Test error');
    });
    expect(consoleSpy).toHaveBeenCalledWith('Effect error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('should support async effects (no cleanup)', async () => {
    const s = signal(1);
    let value = 0;
    effect(async () => {
      const v = s.get();
      await Promise.resolve();
      value = v;
    });

    expect(value).toBe(0); // initial run is async
    await Promise.resolve();
    await Promise.resolve(); // wait for the effect's internal promise
    expect(value).toBe(1);

    s.set(2);
    await Promise.resolve(); // wait for microtask queue
    await Promise.resolve(); // wait for async effect
    expect(value).toBe(2);
  });

  test('should NOT re-run if disposed after being scheduled', async () => {
    const s = signal(1);
    let count = 0;
    const dispose = effect(() => {
      s.get();
      count++;
    });

    expect(count).toBe(1);

    s.set(2);
    // Now it's scheduled but hasn't run yet.
    dispose();

    await Promise.resolve();
    // If it leaks/re-runs, count would be 2.
    expect(count).toBe(1);
  });
});
