import { beforeEach, describe, expect, test } from 'vitest';

import { Outlet } from './outlet';

describe('Outlet', () => {
  let outlet: Outlet;

  beforeEach(() => {
    outlet = new Outlet();
  });

  test('should register an element and return its index', () => {
    const element = document.createElement('div');
    const index = outlet.register(element);
    expect(index).toBe(0);
  });

  test('should increment index for subsequent registrations', () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');

    expect(outlet.register(element1)).toBe(0);
    expect(outlet.register(element2)).toBe(1);
  });

  test('should unregister an element and remove it from the stack', () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');

    outlet.register(element1);
    outlet.register(element2);

    outlet.unregister(element1);

    // After unregistering element1 (index 0), the stack should be empty because slice(0, 0) returns []
    // Re-registering should start at index 0
    const element3 = document.createElement('div');
    expect(outlet.register(element3)).toBe(0);
  });

  test('should unregister an element and keep previous elements', () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    const element3 = document.createElement('div');

    outlet.register(element1);
    outlet.register(element2);
    outlet.register(element3);

    // Unregister element2 (index 1). Stack should be slice(0, 1) -> [element1]
    outlet.unregister(element2);

    // Next register should be at index 1
    const element4 = document.createElement('div');
    expect(outlet.register(element4)).toBe(1);
  });

  test('should clear the stack on destroy', () => {
    const element = document.createElement('div');
    outlet.register(element);

    outlet.destroy();

    const newElement = document.createElement('div');
    expect(outlet.register(newElement)).toBe(0);
  });
});
