import type { Route } from '../types';

export function extractNamedRoutes(routes: Route[], prefix = '', namedRoutes: Record<string, string> = {}): Record<string, string> {
  for (const route of routes) {
    const path = prefix + route.path;
    if (route.name) {
      if (namedRoutes[route.name]) {
        throw new Error(`duplicated route name "${route.name}"\n${namedRoutes[route.name]}\n${path}`);
      } else {
        namedRoutes[route.name] = path;
      }
    }
    if (route.children) {
      namedRoutes = { ...namedRoutes, ...extractNamedRoutes(route.children, path, namedRoutes) };
    }
  }
  return namedRoutes;
}
