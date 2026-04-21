import { beforeEach, describe, expect, test } from 'vitest';

import { html } from '../components';
import { PortalService } from './portal.service';

describe('PortalService', () => {
  let service: PortalService;
  const mockNode1 = html`<div data-id="portal-1"></div>`;
  const mockNode2 = html`<span data-id="portal-2"></span>`;
  const mockNode3 = html`<div data-id="portal-1-updated"></div>`;

  beforeEach(() => {
    service = new PortalService();
  });

  test('should be created', () => {
    expect(service).toBeTruthy();
  });

  test('should register a new portal and return it via signal', () => {
    const portalKey = 'test-portal';
    const signal = service.get(portalKey);

    // Initially, it should be undefined
    expect(signal.get()).toBeUndefined();

    service.update(portalKey, mockNode1);

    expect(signal.get()).toBe(mockNode1);
  });

  test('should update an existing portal with a new Node', () => {
    const portalKey = 'test-portal';
    const signal = service.get(portalKey);

    service.update(portalKey, mockNode1);
    expect(signal.get()).toBe(mockNode1);

    service.update(portalKey, mockNode3);
    expect(signal.get()).toBe(mockNode3);
  });

  test('should remove a registered portal and return undefined', () => {
    const portalKey = 'test-portal';
    const signal = service.get(portalKey);

    service.update(portalKey, mockNode1);
    expect(signal.get()).toBe(mockNode1);

    service.remove(portalKey);
    expect(signal.get()).toBeUndefined();
  });

  test('should do nothing if the key does not exist', () => {
    const portalKey = 'test-portal';
    service.update(portalKey, mockNode1);

    // Unregistering a non-existent key should not affect existing ones
    service.remove('non-existent-key');

    expect(service.get(portalKey).get()).toBe(mockNode1);
  });

  test('should return a signal that returns the correct Node for a key', () => {
    const portalKey1 = 'portal1';
    const portalKey2 = 'portal2';

    service.update(portalKey1, mockNode1);
    service.update(portalKey2, mockNode2);

    expect(service.get(portalKey1).get()).toBe(mockNode1);
    expect(service.get(portalKey2).get()).toBe(mockNode2);
  });

  test('should remove references to the portals when destroyed', () => {
    const portalKey = 'test-portal';
    service.update(portalKey, mockNode1);
    service.destroy();
    expect(service.get(portalKey).get()).toBeUndefined();
  });
});
