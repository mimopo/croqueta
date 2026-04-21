import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { html, registerComponent } from '../components';
import { clear, enableShadowDom, render, waitForAsync } from '../components-testing';
import { inject } from '../di';
import { signal } from '../reactivity';
import { PortalInComponent } from './portal-in.component';
import { PortalService } from './portal.service';

describe('PortalInComponent', () => {
  let service: PortalService;

  beforeEach(() => {
    enableShadowDom();
    registerComponent(PortalInComponent);
    service = inject(PortalService);
  });

  afterEach(() => {
    clear();
    vi.restoreAllMocks();
  });

  test('should register children nodes correctly in PortalService', async () => {
    const key = 'test-portal';
    render(html`<croqueta-portal-in key="${key}">Portal Content</croqueta-portal-in>`);
    const portalNode = service.get(key).get();
    expect(portalNode).toBeDefined();
    expect(portalNode).toHaveTextContent('Portal Content');
  });

  test('should remove content from service on disconnect', async () => {
    const key = 'test-portal-remove';
    render(html` <croqueta-portal-in key="${key}">Content</croqueta-portal-in> `);
    expect(service.get(key).get()).toBeDefined();
    document.querySelector('croqueta-portal-in')?.remove();
    expect(service.get(key).get()).toBeUndefined();
  });

  test('should update service when key changes', async () => {
    const key1 = 'test-portal-1';
    const key2 = 'test-portal-2';
    const key = signal(key1);
    render(html`<croqueta-portal-in key="${key}">Content</croqueta-portal-in>`);
    expect(service.get(key1).get()).toBeDefined();
    expect(service.get(key2).get()).toBeUndefined();
    key.set(key2);
    await waitForAsync();
    expect(service.get(key1).get()).toBeUndefined();
    expect(service.get(key2).get()).toBeDefined();
  });

  test('should not print anything', async () => {
    render(html`<croqueta-portal-in key="key">Content</croqueta-portal-in>`);
    expect(document.body).not.toHaveTextContent('Content');
  });
});
