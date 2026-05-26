import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Component, StylesService, html } from '../../components';
import { clear, waitForAsync } from '../../components-testing';
import { inject, provide } from '../../di';
import { type SignalState, signal } from '../../reactivity';
import { renderComponent } from '../../testing';
import { Outlet } from '../outlet';
import { Router } from '../router';
import type { ActivatedRoute } from '../types';
import { RouterComponent } from './router.component';

describe('RouterComponent', () => {
  let outlet: Outlet;
  let activatedRoutesSignal: SignalState<ActivatedRoute[]>;

  beforeEach(() => {
    activatedRoutesSignal = signal<ActivatedRoute[]>([]);
    provide(Router, () => ({
      activatedRoutes: activatedRoutesSignal,
    }));
    provide(Outlet, () => {
      return {
        register: vi.fn<(el: HTMLElement) => number>().mockReturnValue(0),
        unregister: vi.fn<(el: HTMLElement) => void>(),
      } as Partial<Outlet>;
    });
    provide(StylesService, () => {
      return {
        applyStyles: vi.fn<(root: ShadowRoot | HTMLElement, settings: { styles?: string | string[]; tag: string }) => void>(),
      } as Partial<StylesService>;
    });
    outlet = inject(Outlet);
    document.body.innerHTML = '';
  });

  afterEach(() => {
    clear();
    vi.restoreAllMocks();
  });

  test('should register with outlet on connect and unregister on disconnect', () => {
    const element = renderComponent(RouterComponent);
    expect(outlet.register).toHaveBeenCalledWith(element);
    element.remove();
    expect(outlet.unregister).toHaveBeenCalledWith(element);
  });

  test('should render nothing when no route is activated', async () => {
    const element = renderComponent(RouterComponent);
    await waitForAsync();
    expect(element).toHaveTextContent('');
  });

  test('should render the component for the current level', async () => {
    class TestPage extends Component {
      static tag = 'test-page';
      protected render(): Node {
        return html` <span>test page</span> `;
      }
    }
    const element = renderComponent(RouterComponent);
    activatedRoutesSignal.set([{ component: TestPage, path: '/test', params: {}, data: { foo: 'bar' } } as any]);
    await waitForAsync();
    expect(element).toHaveTextContent('test page');
  });

  test('should render nested components at the correct level', async () => {
    // Return level 1 for the second router
    vi.spyOn(outlet, 'register').mockReturnValue(1);

    class ChildPage extends Component {
      static tag = 'child-page';
      protected render(): Node {
        return html` <span>child page</span> `;
      }
    }

    const element = renderComponent(RouterComponent);
    activatedRoutesSignal.set([
      { component: class Parent {}, path: '/parent' } as any,
      { component: ChildPage, path: '/parent/child' } as any,
    ]);

    await waitForAsync();
    expect(element).toHaveTextContent('child page');
  });
});
