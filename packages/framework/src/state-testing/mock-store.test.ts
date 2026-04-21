import { beforeEach, describe, expect, test } from 'vitest';

import { createFeatureSelector } from '../state';
import { MockStore } from './mock-store';

describe('MockStore', () => {
  const store = new MockStore();

  beforeEach(() => {
    store.clearOverride();
  });

  test('Should override selectors', () => {
    interface ExampleState {
      foo: string;
    }
    const original = createFeatureSelector<ExampleState>('key');
    const mock: ExampleState = {
      foo: 'bar',
    };
    store.overrideSelector(original, mock);
    expect(store.select(original).get()).toEqual(mock);
  });
});
