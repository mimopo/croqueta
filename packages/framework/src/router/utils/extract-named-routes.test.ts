import { describe, expect, test } from 'vitest';

import type { Route } from '../types';
import { extractNamedRoutes } from './extract-named-routes';

describe('extractNamedRoutes', () => {
  test('should return an empty object when given an empty array', () => {
    const routes: Route[] = [];
    expect(extractNamedRoutes(routes)).toEqual({});
  });

  test('should extract named routes from a flat array', () => {
    const routes: Route[] = [{ path: '/', name: 'home' }, { path: '/about', name: 'about' }, { path: '/contact' }];
    const expected = {
      home: '/',
      about: '/about',
    };
    expect(extractNamedRoutes(routes)).toEqual(expected);
  });

  test('should extract named routes from nested children and prefix paths', () => {
    const routes: Route[] = [
      { path: '/', name: 'home' },
      {
        path: '/users',
        children: [{ path: '', name: 'usersIndex' }, { path: '/:id', name: 'usersShow' }, { path: '/:id/edit' }],
      },
    ];
    const expected = {
      home: '/',
      usersIndex: '/users',
      usersShow: '/users/:id',
    };
    expect(extractNamedRoutes(routes)).toEqual(expected);
  });

  test('should handle multiple levels of nesting', () => {
    const routes: Route[] = [
      {
        path: '/app',
        children: [
          { path: '/dashboard', name: 'dashboard' },
          {
            path: '/settings',
            children: [
              { path: '/profile', name: 'settingsProfile' },
              { path: '/account', name: 'settingsAccount' },
            ],
          },
        ],
      },
    ];
    const expected = {
      dashboard: '/app/dashboard',
      settingsProfile: '/app/settings/profile',
      settingsAccount: '/app/settings/account',
    };
    expect(extractNamedRoutes(routes)).toEqual(expected);
  });

  test('should throw an error for a duplicated route name in a flat array', () => {
    const routes: Route[] = [
      { path: '/', name: 'home' },
      { path: '/home-again', name: 'home' },
    ];
    expect(() => extractNamedRoutes(routes)).toThrow('duplicated route name "home"\n/\n/home-again');
  });

  test('should throw an error for a duplicated route name between parent and child', () => {
    const routes: Route[] = [
      { path: '/', name: 'home' },
      {
        path: '/home',
        children: [{ path: '/dashboard', name: 'home' }],
      },
    ];
    expect(() => extractNamedRoutes(routes)).toThrow('duplicated route name "home"\n/\n/home/dashboard');
  });
});
