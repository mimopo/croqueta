import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { type ComponentConstructor } from '../components';
import { waitForAsync } from '../components-testing';
import { signal } from '../reactivity';
import { Logger } from '../utils';
import { Router } from './router';
import type { RouterStrategy } from './strategies/router-strategy.interface';
import type { RouterOptions } from './types';

// Mock Component
const HomeComponent: ComponentConstructor = class {} as any;
const AboutComponent: ComponentConstructor = class {} as any;
const UserComponent: ComponentConstructor = class {} as any;
const NotFoundComponent: ComponentConstructor = class {} as any;
const PostComponent: ComponentConstructor = class {} as any;
const LazyComponent: ComponentConstructor = class {} as any;
const ParentComponent: ComponentConstructor = class {} as any;
const NestedComponent: ComponentConstructor = class {} as any;

// Mock RouterStrategy
class MockRouterStrategy implements RouterStrategy {
  path = signal('/');
  async navigate(path: string): Promise<void> {
    this.path.set(path);
  }
  getHref(path: string): string {
    return '#' + path;
  }
  destroy = vi.fn();
}

describe('Router', () => {
  let router: Router;
  let strategy: MockRouterStrategy;
  const loadChildrenFn = vi.fn(async () => [{ path: '/:id', component: PostComponent }]);
  const redirectFn = vi.fn(async () => '/about');
  const loadComponentFn = vi.fn(async () => LazyComponent);
  const accessGuardFn = vi.fn(async () => false);
  const leaveGuardFn = vi.fn(async () => false);
  const titleFn = vi.fn(async ({ title }) => `Test Title: ${title || ''}`);

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(document, 'title', 'set');

    strategy = new MockRouterStrategy();

    const options: RouterOptions = {
      routes: [
        { path: '/', component: HomeComponent, name: 'home' },
        { path: '/about', component: AboutComponent, name: 'about' },
        { path: '/user/:id', component: UserComponent, name: 'user' },
        { path: '/redirect/:id', redirect: redirectFn },
        { path: '/loop', redirect: redirectFn },
        {
          path: '/posts/:tag',
          loadChildren: loadChildrenFn,
        },
        {
          path: '/nested',
          component: ParentComponent,
          children: [{ path: '/:id', component: NestedComponent }],
        },
        {
          path: '/lazy/:id',
          loadComponent: loadComponentFn,
        },
        {
          path: '/guarded/:id',
          component: HomeComponent,
          accessGuard: [accessGuardFn],
        },
        {
          path: '/leave-guarded/:id',
          component: HomeComponent,
          leaveGuard: [leaveGuardFn],
        },
        {
          path: '/title/:title',
          component: HomeComponent,
          title: titleFn,
        },
        { path: '**', component: NotFoundComponent },
      ],
      strategy,
    };
    router = new Router(options);
  });

  afterEach(() => {
    router.destroy();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    document.title = '';
  });

  describe('lifecycle', () => {
    test('should be created', () => {
      expect(router).toBeInstanceOf(Router);
    });

    test('should destroy the strategy when destroyed', () => {
      router.destroy();
      expect(strategy.destroy).toHaveBeenCalledOnce();
    });
  });

  describe('named routes', () => {
    test('should extract named routes on creation', () => {
      expect(router.getRoutePath('home')).toBe('/');
    });
    test('should return undefined for a non-existent named route', () => {
      const route = router.getRoutePath('non-existent');
      expect(route).toBeUndefined();
    });
    test('should throw an error on duplicated route name', () => {
      strategy = new MockRouterStrategy();
      expect(() => {
        // oxlint-disable-next-line no-new
        new Router({
          routes: [
            { path: '/', component: HomeComponent, name: 'home' },
            { path: '/duplicated', component: HomeComponent, name: 'home' },
          ],
          strategy,
        });
      }).toThrowError(/^(duplicated route name)/);
      expect(strategy.destroy).toHaveBeenCalledOnce();
    });
  });

  describe('parseUrl', () => {
    beforeEach(async () => {
      strategy.path.set('/user/123');
      await new Promise((r) => setTimeout(r, 0)); // wait for path to be processed
    });

    test('should handle absolute paths', () => {
      expect(router.parseUrl('/foo/bar')).toBe('/foo/bar');
    });

    test('should handle relative paths', async () => {
      expect(router.parseUrl('456')).toBe('/user/456');
    });

    test('should handle relative paths with ../', async () => {
      expect(router.parseUrl('../list')).toBe('/list');
    });

    test('should handle relative paths with ./', async () => {
      expect(router.parseUrl('./456')).toBe('/user/456');
    });

    test('should parse a url with params', () => {
      const url = router.parseUrl('/user/:id', { id: '123' });
      expect(url).toBe('/user/123');
    });
  });

  describe('getHref', () => {
    test('should parse the url and call the strategy', () => {
      const spy = vi.spyOn(router, 'parseUrl');
      const spyStrategy = vi.spyOn(strategy, 'getHref');
      const result = router.getHref('/user/:id', { id: '123' });
      expect(spy).toHaveBeenCalledExactlyOnceWith('/user/:id', {
        id: '123',
      });
      expect(spyStrategy).toHaveBeenCalledExactlyOnceWith('/user/123');
      expect(result).toBe('#/user/123');
    });
  });

  describe('getRoutePath', () => {
    test('should obtain the path for the given route name', () => {
      expect(router.getRoutePath('about')).toBe('/about');
    });
    test('should obtain the path for the given route name with parameters', () => {
      expect(router.getRoutePath('user', { id: '1' })).toBe('/user/1');
    });
    test('should return undefined if the route name doesnt exist', () => {
      expect(router.getRoutePath('unknown')).toBe(undefined);
    });
  });

  describe('navigate', () => {
    test('should navigate to a path', async () => {
      await router.navigate('/about');
      expect(strategy.path.get()).toBe('/about');
    });

    test('should navigate to a path with parameters', async () => {
      await router.navigate('/user/:id', { id: '1' });
      expect(strategy.path.get()).toBe('/user/1');
    });
  });

  describe('resolution', () => {
    test('should resolve a simple path', async () => {
      await router.navigate('/about');
      await waitForAsync();
      const activatedRoute = router.activatedRoutes.get();
      expect(activatedRoute.length).toBe(1);
      expect(activatedRoute[0].component).toBe(AboutComponent);
    });
    test('should resolve a routes with parameters', async () => {
      await router.navigate('/user/:id', { id: '1' });
      await waitForAsync();
      const activatedRoute = router.activatedRoutes.get();
      expect(activatedRoute.length).toBe(1);
      expect(activatedRoute[0].component).toBe(UserComponent);
      expect(activatedRoute[0].params).toEqual({ id: '1' });
    });
    test('should handle not found routes when ** route is provided', async () => {
      await router.navigate('/unknown');
      await waitForAsync();
      const activatedRoute = router.activatedRoutes.get();
      expect(activatedRoute.length).toBe(1);
      expect(activatedRoute[0].component).toBe(NotFoundComponent);
    });
    test('should resolve nested routes', async () => {
      await router.navigate('/nested/:id', { id: '2' });
      await waitForAsync();
      const activatedRoute = router.activatedRoutes.get();
      expect(activatedRoute.length).toBe(2);
      expect(activatedRoute[0].component).toBe(ParentComponent);
      expect(activatedRoute[0].params).toEqual({});
      expect(activatedRoute[1].component).toBe(NestedComponent);
      expect(activatedRoute[1].params).toEqual({ id: '2' });
    });
    test('should resolve nested routes with lazy loading', async () => {
      await router.navigate('/posts/:tag/:id', { tag: 'test', id: '3' });
      await waitForAsync();
      const activatedRoute = router.activatedRoutes.get();
      expect(activatedRoute.length).toBe(2);
      expect(activatedRoute[0].component).toBe(undefined);
      expect(activatedRoute[1].component).toBe(PostComponent);
      expect(activatedRoute[1].params).toEqual({ id: '3' });
    });
    test('should pass route parameters to the loadChildren function', async () => {
      await router.navigate('/posts/:tag/:id', { tag: 'test', id: '3' });
      await waitForAsync();
      expect(loadChildrenFn).toHaveBeenCalledExactlyOnceWith({ tag: 'test' });
    });
    test('should lazy load components', async () => {
      await router.navigate('/lazy/1');
      await waitForAsync();
      const activatedRoute = router.activatedRoutes.get();
      expect(activatedRoute.length).toBe(1);
      expect(activatedRoute[0].component).toBe(LazyComponent);
    });
    test('should pass route parameters to the loadComponent function', async () => {
      await router.navigate('/lazy/2');
      await waitForAsync();
      expect(loadComponentFn).toHaveBeenCalledExactlyOnceWith({ id: '2' });
    });
  });

  describe('redirects', () => {
    test('should handle redirects', async () => {
      await router.navigate('/redirect/1');
      await waitForAsync();
      expect(strategy.path.get()).toBe('/about');
    });
    test('should pass route parameters to the redirect function', async () => {
      await router.navigate('/redirect/1');
      await waitForAsync();
      expect(redirectFn).toHaveBeenCalledExactlyOnceWith({ id: '1' });
    });
    test('should detect redirect loops and block the navigation', async () => {
      redirectFn.mockImplementationOnce(async () => '/loop');
      await router.navigate('/loop');
      await waitForAsync();
      expect(redirectFn).toHaveBeenCalledTimes(1);
      expect(strategy.path.get()).toBe('/');
    });
  });

  describe('access guards', () => {
    test('should pass route parameters to the route guard function', async () => {
      await router.navigate('/guarded/1');
      await waitForAsync();
      expect(accessGuardFn).toHaveBeenCalledExactlyOnceWith({ id: '1' });
    });
    test('should resolve if the guard returns true', async () => {
      accessGuardFn.mockImplementationOnce(async () => true);
      await router.navigate('/guarded/1');
      await waitForAsync();
      expect(strategy.path.get()).toBe('/guarded/1');
    });
    test('should cancel navigation if the guard returns false', async () => {
      await router.navigate('/guarded/1');
      await waitForAsync();
      expect(strategy.path.get()).toBe('/');
    });
    test('should cancel navigation if the guard rejects', async () => {
      accessGuardFn.mockImplementationOnce(async () => {
        throw new Error();
      });
      await router.navigate('/guarded/1');
      await waitForAsync();
      expect(strategy.path.get()).toBe('/');
    });
  });
  describe('leave guards', () => {
    beforeEach(async () => {
      await router.navigate('/leave-guarded/2');
      await waitForAsync();
    });
    test('should pass route parameters to the route guard function', async () => {
      await router.navigate('/');
      await waitForAsync();
      expect(leaveGuardFn).toHaveBeenCalledExactlyOnceWith({ id: '2' });
    });
    test('should resolve if the guard returns true', async () => {
      leaveGuardFn.mockImplementationOnce(async () => true);
      await router.navigate('/');
      await waitForAsync();
      expect(strategy.path.get()).toBe('/');
    });
    test('should cancel navigation if the guard returns false', async () => {
      await router.navigate('/');
      await waitForAsync();
      expect(strategy.path.get()).toBe('/leave-guarded/2');
    });
    test('should cancel navigation if the guard rejects', async () => {
      leaveGuardFn.mockImplementationOnce(async () => {
        throw new Error();
      });
      await router.navigate('/');
      await waitForAsync();
      expect(strategy.path.get()).toBe('/leave-guarded/2');
    });
  });

  describe('title', () => {
    test('should set document title', async () => {
      await router.navigate('/title/example');
      await waitForAsync();
      expect(document.title).toBe('Test Title: example');
    });
    test('should pass the route parameters to the title function', async () => {
      await router.navigate('/title/example');
      await waitForAsync();
      expect(titleFn).toHaveBeenCalledExactlyOnceWith({ title: 'example' });
    });
    test('should not set the document title if the title function rejects', async () => {
      titleFn.mockImplementationOnce(async () => {
        throw new Error();
      });
      await router.navigate('/title/example');
      await waitForAsync();
      expect(document.title).toBe('');
    });
    test('should restore the previous title after leaving a route with title', async () => {
      document.title = 'Initial Title';
      await router.navigate('/title/example');
      await waitForAsync();
      expect(document.title).toBe('Test Title: example');
      await router.navigate('/');
      await waitForAsync();
      expect(document.title).toBe('Initial Title');
    });
  });
});
