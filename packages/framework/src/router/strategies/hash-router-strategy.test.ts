import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { HashRouterStrategy } from './hash-router-strategy';

describe('HashRouterStrategy', () => {
  let strategy: HashRouterStrategy;

  beforeEach(() => {
    window.location.hash = '';
    strategy = new HashRouterStrategy();
  });

  afterEach(() => {
    strategy.destroy();
    window.location.hash = '';
  });

  test('should initialize with default path /', () => {
    expect(strategy.path.get()).toBe('/');
  });

  test('should initialize with current hash path', () => {
    window.location.hash = '#/test';
    const newStrategy = new HashRouterStrategy();
    expect(newStrategy.path.get()).toBe('/test');
    newStrategy.destroy();
  });

  test('should update path when hash changes', () => {
    window.location.hash = '#/new-path';
    // Manually trigger the hashchange event
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(strategy.path.get()).toBe('/new-path');
  });

  test('should navigate by setting hash', async () => {
    await strategy.navigate('/navigated');
    expect(window.location.hash).toBe('#/navigated');
  });

  test('should format href correctly', () => {
    expect(strategy.getHref('/home')).toBe('#/home');
  });

  test('should default to / if hash is empty on change', () => {
    window.location.hash = '';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(window.location.hash).toBe('#/');
  });

  test('should remove listener on destroy', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    strategy.destroy();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });
});
