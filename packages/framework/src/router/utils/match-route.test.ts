import { describe, expect, test } from 'vitest';

import { matchRoute } from './match-route';

describe('matchRoute', () => {
  test('should return a full match for identical paths', () => {
    const result = matchRoute('home', 'home');
    expect(result.match).toBe(true);
    expect(result.remaining).toBe('');
    expect(result.params).toEqual({});
  });

  test('should return a partial match when the route is a prefix of the current path', () => {
    const result = matchRoute('/users', '/users/123');
    expect(result.match).toBe(true);
    expect(result.remaining).toBe('/123');
    expect(result.params).toEqual({});
  });

  test('should extract parameters for a full match', () => {
    const result = matchRoute('/users/:id', '/users/123');
    expect(result.match).toBe(true);
    expect(result.remaining).toBe('');
    expect(result.params).toEqual({ id: '123' });
  });

  test('should return a full match for a wildcard route', () => {
    const result = matchRoute('**', '/anything');
    expect(result.match).toBe(true);
    expect(result.remaining).toBe('');
    expect(result.params).toEqual({});
  });

  test('should return no match when routePath is longer than currentPath', () => {
    const result = matchRoute('/users/123', '/users');
    expect(result.match).toBe(false);
    expect(result.remaining).toBe('');
    expect(result.params).toEqual({});
  });

  test('should return no match for different paths', () => {
    const result = matchRoute('/about', '/contact');
    expect(result.match).toBe(false);
    expect(result.remaining).toBe('');
    expect(result.params).toEqual({});
  });
});
