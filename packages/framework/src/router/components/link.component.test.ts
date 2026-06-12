import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { destroyInjector, provide } from '../../di';
import { type SignalState, signal } from '../../reactivity';
import { Router } from '../router';
import { LinkComponent } from './link.component';

describe('LinkComponent', () => {
  let routerMock: Partial<Router>;
  let pathSignal: SignalState<string>;

  beforeEach(() => {
    // Mock Router
    pathSignal = signal('/');
    routerMock = {
      getHref: vi.fn<(path: string) => string>((path) => `#${path}`),
      navigate: vi.fn<(path: string, params?: Record<string, string>) => Promise<void>>(),
      path: pathSignal,
    };

    // Mock Injector
    provide(Router, () => routerMock);

    // Register custom element if not already registered
    if (!customElements.get('router-link')) {
      customElements.define('router-link', LinkComponent, { extends: 'a' });
    }
  });

  afterEach(() => {
    destroyInjector();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('should create', () => {
    const element = document.createElement('a', { is: 'router-link' });
    expect(element).toBeInstanceOf(LinkComponent);
  });

  test('should update href when route attribute changes', () => {
    const element = document.createElement('a', { is: 'router-link' });
    document.body.appendChild(element);

    element.setAttribute('route', '/test');

    expect(routerMock.getHref).toHaveBeenCalledWith('/test');
    expect(element.getAttribute('href')).toBe('#/test');
  });

  test('should navigate on click', () => {
    const element = document.createElement('a', { is: 'router-link' });
    document.body.appendChild(element);
    element.setAttribute('route', '/test');

    const event = new MouseEvent('click', { cancelable: true, bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    element.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith('/test');
  });

  test('should update active class when path changes', async () => {
    const element = document.createElement('a', { is: 'router-link' });
    document.body.appendChild(element);
    element.setAttribute('route', '/active');

    // Initial state (path is '/')
    expect(element.classList.contains('active')).toBe(false);

    // Change path to match route
    pathSignal.set('/active');
    // Wait for microtask (Watcher uses microtask)
    await new Promise((r) => setTimeout(r, 0));
    expect(element.classList.contains('active')).toBe(true);

    // Change path to something else
    pathSignal.set('/other');
    await new Promise((r) => setTimeout(r, 0));
    expect(element.classList.contains('active')).toBe(false);
  });

  test('should use custom active class', async () => {
    const element = document.createElement('a', { is: 'router-link' });
    element.setAttribute('activeClass', 'custom-active');
    document.body.appendChild(element);
    element.setAttribute('route', '/active');

    pathSignal.set('/active');
    await new Promise((r) => setTimeout(r, 0));
    expect(element.classList.contains('custom-active')).toBe(true);
    expect(element.classList.contains('active')).toBe(false);
  });

  test('should call disposer on disconnect', () => {
    const element = document.createElement('a', {
      is: 'router-link',
    } as any) as LinkComponent;
    document.body.appendChild(element);
    const disposerOrig = (element as any).disposer;
    const spy = vi.fn<() => void>(disposerOrig);
    (element as any).disposer = spy;

    document.body.removeChild(element);
    expect(spy).toHaveBeenCalled();
  });
});
