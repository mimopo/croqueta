import type { RouteMatch, RouteParams } from '../types';

export function matchRoute(routePath: string, currentPath: string): RouteMatch {
  if (routePath === '**') {
    return { params: {}, match: true, remaining: '' };
  }
  const params: RouteParams = {};
  const routeSegments = routePath.split('/').filter(Boolean);
  const currentSegments = currentPath.split('/').filter(Boolean);
  if (routeSegments.length > currentSegments.length) {
    return { params: {}, match: false, remaining: '' };
  }
  const remaining = currentSegments.slice(routeSegments.length).join('/');
  const match = routeSegments.every((segment, i) => {
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = currentSegments[i];
      return true;
    }
    return segment === currentSegments[i];
  });
  return { params, match, remaining: remaining ? `/${remaining}` : remaining };
}
