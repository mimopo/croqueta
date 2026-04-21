import { describe, expect, test, vi } from 'vitest';

import type { Route, RouteParams } from '../types';
import { resolveData } from './resolve-data';

describe('resolveData', () => {
  test('should return an empty object if route has no data property', async () => {
    const route: Route = { path: '/' };
    const params: RouteParams = {};
    const result = await resolveData(route, params);
    expect(result).toEqual({});
  });

  test('should return an empty object if route.data is an empty object', async () => {
    const route: Route = { path: '/', data: {} };
    const params: RouteParams = {};
    const result = await resolveData(route, params);
    expect(result).toEqual({});
  });

  test('should resolve data from the route data functions', async () => {
    const userResolver = vi.fn().mockResolvedValue({ id: 1, name: 'John Doe' });
    const postsResolver = vi.fn().mockResolvedValue([{ id: 101, title: 'Post 1' }]);
    const route: Route = {
      path: '/users/:id',
      data: {
        user: userResolver,
        posts: postsResolver,
      },
    };
    const params: RouteParams = { id: '1' };
    const result = await resolveData(route, params);
    expect(userResolver).toHaveBeenCalledWith(params);
    expect(postsResolver).toHaveBeenCalledWith(params);
    expect(result).toEqual({
      user: { id: 1, name: 'John Doe' },
      posts: [{ id: 101, title: 'Post 1' }],
    });
  });

  test('should throw an error if any data resolver rejects', async () => {
    const failingResolver = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    const route: Route = {
      path: '/error',
      data: {
        data: failingResolver,
      },
    };
    await expect(resolveData(route, {})).rejects.toThrow('Failed to fetch');
  });
});
