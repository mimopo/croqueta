import type { ComponentConstructor } from '../components';
import type { Destroy } from '../di';
import { effect, signal } from '../reactivity';
import { logger } from '../utils';
import type { RouterStrategy } from './strategies/router-strategy.interface';
import type { ActivatedRoute, GuardFn, Route, RouteParams, RouterOptions } from './types';
import { extractNamedRoutes } from './utils/extract-named-routes';
import { matchRoute } from './utils/match-route';
import { resolveData } from './utils/resolve-data';

/**
 * Manages routing for the application. It resolves paths to components,
 * handles navigation, and integrates with a routing strategy (e.g., hash or path).
 * This service listens for path changes and dynamically renders the appropriate
 * component into the main router outlet.
 */
export class Router implements Destroy {
  public activatedRoutes = signal<ActivatedRoute[]>([]);
  private strategy: RouterStrategy;
  private redirects = new Set<string>();
  private logger = logger('router');
  private readonly maxRedirections = 10;
  private namedRoutes: Record<string, string> = {};
  private activatedRoute: ActivatedRoute[] = [];
  private disposer: () => void;

  /**
   * Returns the Signal from the current routing strategy that holds the URL path.
   */
  get path() {
    return this.strategy.path;
  }

  private get activePath() {
    return this.activatedRoute.length ? this.activatedRoute[this.activatedRoute.length - 1].path : '';
  }

  constructor(options: RouterOptions) {
    const strategy = options.strategy;
    this.strategy = strategy;
    this.disposer = effect(async () => {
      await this.resolve(options.routes, strategy.path.get());
      this.activatedRoutes.set([...this.activatedRoute]);
    });

    try {
      this.namedRoutes = extractNamedRoutes(options.routes);
      this.logger.debug('named routes registered', this.namedRoutes);
    } catch (e) {
      this.logger.error('error on named routes', e);
      this.destroy();
      throw e;
    }
  }

  /**
   * @inheritdoc
   */
  public destroy(): void {
    this.strategy.destroy();
    this.disposer();
  }

  /**
   * Programmatically navigates to a new path.
   * @param path The path to navigate to (e.g., '/users/123').
   * @param params Optional parameters to replace in the path.
   */
  public async navigate(path: string, params: Record<string, string> = {}): Promise<void> {
    for (let i = this.activatedRoute.length - 1; i >= 0; i--) {
      const route = this.activatedRoute[i];
      const canNavigate = await this.executeGuards(route.leaveGuard, route.params);
      if (!canNavigate) {
        this.logger.debug('forbidden navigation, can not leave route', route.path);
        return;
      }
    }
    const url = this.parseUrl(path, params);
    return this.strategy.navigate(url);
  }

  /**
   * Generates a URL-friendly href string for a given application path,
   * based on the current routing strategy.
   * @param path The application path.
   * @param params Optional parameters to replace in the path.
   * @returns The formatted href string (e.g., '#/home' or '/home').
   */
  public getHref(path: string, params: Record<string, string> = {}): string {
    const url = this.parseUrl(path, params);
    return this.strategy.getHref(url);
  }

  /**
   * Gets the path associated with a named route.
   * @param routeName The name of the route.
   * @param params Optional parameters to replace in the path.
   * @returns The path string if found, otherwise undefined.
   */
  public getRoutePath(routeName: string, params: Record<string, string> = {}): string | undefined {
    const path = this.namedRoutes[routeName];
    if (path === undefined) {
      this.logger.error('route name not found', routeName);
      return;
    }
    return this.parseUrl(path, params);
  }

  /**
   * Parses a path and replaces parameters with provided values.
   * @param path The path string (e.g., '/user/:id').
   * @param params A record of parameter names and values.
   * @returns The parsed URL string.
   */
  public parseUrl(path: string, params: Record<string, string> = {}): string {
    let url = path;
    if (!path.startsWith('/')) {
      url = new URL(path, `http://dummy${this.activePath}`).pathname;
    }
    for (const key in params) {
      const regex = new RegExp(`:${key}(?=\\/|$)`, 'g');
      url = url.replace(regex, params[key]);
    }
    return url;
  }

  private async resolve(routes: Route[], path: string, deep = 0, fullPath = ''): Promise<void> {
    for (const route of routes) {
      const { params, match, remaining } = matchRoute(route.path, path);
      if (!match) {
        continue;
      }
      const children = route.loadChildren ? await route.loadChildren(params) : route.children;
      if (children || !remaining) {
        fullPath += remaining.length ? path.substring(0, path.length - remaining.length) : path;
        const leaveGuard = route.leaveGuard ? [...route.leaveGuard] : [];
        if (route.title) {
          const restoreTitle = document.title;
          leaveGuard.push(async () => {
            document.title = restoreTitle;
            return true;
          });
        }
        this.activatedRoute[deep] = {
          params,
          path: fullPath,
          data: await resolveData(route, params),
          component: (await this.execute(route, params, path)) ?? undefined,
          leaveGuard,
        };
        this.logger.debug(`route match for path ${path} -> ${route.path}`, route);
        if (children) {
          deep += 1;
          return this.resolve(children, remaining || '/', deep, fullPath);
        }
        return;
      }
    }
    this.redirects.clear();
    this.logger.warn(`no route found for path: ${path}`);
  }

  private async execute(route: Route, params: RouteParams, path: string): Promise<ComponentConstructor | void> {
    // Redirect loop detection
    if (this.redirects.has(path) || this.redirects.size > 10) {
      return this.raiseMaxRedirectionError(path);
    }
    this.redirects.add(path);
    // Guards
    if (route.accessGuard) {
      const canNavigate = await this.executeGuards(route.accessGuard, params);
      if (!canNavigate) {
        this.logger.debug('forbidden navigation, can not access route', route);
        return this.goBack();
      }
    }
    // Redirect
    if (route.redirect) {
      this.logger.debug('redirect on route', route);
      const redirectPath = await route.redirect(params);
      if (this.redirects.has(redirectPath)) {
        return this.raiseMaxRedirectionError(redirectPath);
      }
      await this.strategy.navigate(redirectPath);
      return;
    }
    this.redirects.clear();
    // Component
    if (route.component || route.loadComponent) {
      const component = route.component ?? (await route.loadComponent?.(params));
      if (!component) {
        this.logger.error('component not found on route', route);
        return;
      }
      if (route.title) {
        try {
          document.title = await route.title(params);
        } catch (e) {
          this.logger.error('error setting title', e);
        }
      }
      return component;
    }
    // Error
    if (!route.children && !route.loadChildren) {
      this.logger.error(`wrong configuration on route`, route);
    }
    return;
  }

  private async executeGuards(guards: GuardFn[], params: RouteParams): Promise<boolean> {
    for (const [index, guard] of guards.entries()) {
      try {
        if (!(await guard(params))) {
          this.logger.debug(`guard #${index} denied navigation`);
          return false;
        }
      } catch (e) {
        this.logger.error(`guard #${index} crashed navigation`, e);
        return false;
      }
    }
    return true;
  }

  private async raiseMaxRedirectionError(path: string) {
    const redirectLoop = [...this.redirects, path].join(' -> \n');
    const isMax = this.redirects.size > this.maxRedirections;
    const message = isMax ? `max redirections reached ${this.maxRedirections}` : 'redirect loop detected';
    this.logger.error(`${message}\n${redirectLoop}`);
    return this.goBack();
  }

  private async goBack() {
    this.redirects.clear();
    if (this.activePath) {
      this.logger.debug('going back to', this.activePath);
      return this.strategy.navigate(this.activePath);
    }
    this.logger.warn('no route to go back');
  }
}
