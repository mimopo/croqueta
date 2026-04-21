import { describe, expect, test, vi } from 'vitest';

import { memoize } from './memoize';

describe('memoize', () => {
  test('should return the result of the function on the first call', () => {
    const memoizedFn = memoize((a: number, b: number) => a + b);
    expect(memoizedFn(1, 2)).toBe(3);
  });

  test('should return the cached result on subsequent calls with the same arguments', () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoizedFn = memoize(fn);

    memoizedFn(1, 2);
    memoizedFn(1, 2);
    const result = memoizedFn(1, 2);

    expect(result).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should re-execute when arguments are different', () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoizedFn = memoize(fn);

    expect(memoizedFn(1, 2)).toBe(3);
    expect(memoizedFn(2, 3)).toBe(5);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('should handle functions with no arguments', () => {
    const fn = vi.fn(() => Math.random());
    const memoizedFn = memoize(fn);

    const result1 = memoizedFn();
    const result2 = memoizedFn();

    expect(result1).toBe(result2);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should differentiate between similar but not identical object arguments', () => {
    const fn = vi.fn((obj: { a: number }) => obj.a);
    const memoizedFn = memoize(fn);

    const obj1 = { a: 1 };
    const obj2 = { a: 1 };

    memoizedFn(obj1);
    memoizedFn(obj2);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('should return cached result for the same object reference', () => {
    const fn = vi.fn((obj: { a: number }) => obj.a);
    const memoizedFn = memoize(fn);

    const obj1 = { a: 1 };

    memoizedFn(obj1);
    memoizedFn(obj1);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
