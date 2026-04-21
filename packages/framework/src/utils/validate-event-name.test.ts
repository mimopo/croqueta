import { describe, expect, test } from 'vitest';

import { validateEventName } from './validate-event-name';

describe('validateEventName', () => {
  test('should not throw for valid kebab-case names', () => {
    expect(() => validateEventName('my-event')).not.toThrow();
    expect(() => validateEventName('event')).not.toThrow();
    expect(() => validateEventName('my-event-123')).not.toThrow();
  });

  test('should not throw for names with underscores if valid', () => {
    expect(() => validateEventName('my_event')).not.toThrow();
  });

  test('should throw for empty name', () => {
    expect(() => validateEventName('')).toThrow('[Framework Error]: Event name cannot be empty.');
  });

  test('should throw for names starting with "on"', () => {
    expect(() => validateEventName('onclick')).toThrow(/Custom event names should not start with "on"/);
    expect(() => validateEventName('on-change')).toThrow(/Custom event names should not start with "on"/);
  });

  test('should throw for uppercase names', () => {
    expect(() => validateEventName('myEvent')).toThrow(/Custom event names must be lowercase/);
    expect(() => validateEventName('My-Event')).toThrow(/Custom event names must be lowercase/);
  });

  test('should throw for names starting with numbers', () => {
    expect(() => validateEventName('1event')).toThrow(/Custom event names must be lowercase, start with a letter/);
  });

  test('should throw for names with spaces or special characters', () => {
    expect(() => validateEventName('my event')).toThrow(/Custom event names must be lowercase/);
    expect(() => validateEventName('my.event')).toThrow(/Custom event names must be lowercase/);
    expect(() => validateEventName('my$event')).toThrow(/Custom event names must be lowercase/);
  });
});
