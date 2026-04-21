import { describe, expect, test } from 'vitest';

import { signal } from './signal';

describe('signal', () => {
  test('signal should hold and update value', () => {
    const s = signal(1);
    expect(s.get()).toBe(1);
    s.set(2);
    expect(s.get()).toBe(2);
  });
});
