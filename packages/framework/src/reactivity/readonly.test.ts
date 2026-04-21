import { describe, expect, test } from 'vitest';

import { readonly } from './readonly';
import { signal } from './signal';

describe('readonly', () => {
  test('should return the current value of the signal', () => {
    const s = signal(1);
    const r = readonly(s);
    expect(r.get()).toBe(1);
  });

  test('should update when the original signal changes', () => {
    const s = signal(1);
    const r = readonly(s);
    expect(r.get()).toBe(1);
    s.set(2);
    expect(r.get()).toBe(2);
  });

  test('should not have a set method', () => {
    const s = signal(1);
    const r = readonly(s);
    expect((r as any).set).toBeUndefined();
  });
});
