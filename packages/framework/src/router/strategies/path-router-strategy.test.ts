import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PathRouterStrategy } from './path-router-strategy';

describe('PathRouterStrategy', () => {
  let strategy: PathRouterStrategy;

  beforeEach(() => {
    window.history.pushState({}, '', '/');
    strategy = new PathRouterStrategy();
  });

  afterEach(() => {
    window.location.href = '';
    strategy.destroy();
  });

  test('should initialize with current path', () => {
    expect(strategy.path.get()).toBe('/');
  });

  test('should initialize with existing path', () => {
    window.history.pushState({}, '', '/initial');
    const newStrategy = new PathRouterStrategy();
    expect(newStrategy.path.get()).toBe('/initial');
    newStrategy.destroy();
  });

  test('should update path when popstate occurs', () => {
    window.history.pushState({}, '', '/new-path');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(strategy.path.get()).toBe('/new-path');
  });

  test('should navigate by pushing state and emitting path', async () => {
    const pushStateSpy = vi.spyOn(history, 'pushState');
    await strategy.navigate('/navigated');
    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/navigated');
    expect(strategy.path.get()).toBe('/navigated');
  });

  test('should format href correctly', () => {
    expect(strategy.getHref('/home')).toBe('/home');
  });

  test('should remove listener on destroy', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    strategy.destroy();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
  });
});
