import { describe, expect, test } from 'vitest';

import { computed } from './computed';
import { signal } from './signal';

describe('signal', () => {
  test('signal should hold and update value', () => {
    const s = signal(1);
    expect(s.get()).toBe(1);
    s.set(2);
    expect(s.get()).toBe(2);
  });

  test('computed should update when signal changes', () => {
    const s = signal(2);
    const c = computed(() => s.get() * 2);
    expect(c.get()).toBe(4);
    s.set(3);
    expect(c.get()).toBe(6);
  });
});
