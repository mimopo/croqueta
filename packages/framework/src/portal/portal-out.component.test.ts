import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { html } from '../components';
import { inject } from '../di';
import { clear, renderComponent, waitForAsync } from '../testing';
import { PortalOutComponent } from './portal-out.component';
import { PortalService } from './portal.service';

describe('PortalOutComponent', () => {
  let component: PortalOutComponent;
  let service: PortalService;
  const portalKey = 'test-key';

  beforeEach(() => {
    service = inject(PortalService);
    component = renderComponent(PortalOutComponent, { inputs: { key: portalKey } });
  });

  afterEach(() => {
    clear();
    vi.restoreAllMocks();
  });

  test('should render nothing when no content is provided', () => {
    expect(component).toHaveTextContent('');
  });

  test('should not render anything when the key is not provided', async () => {
    component = renderComponent(PortalOutComponent);
    expect(component).toHaveTextContent('');
  });

  test('should render the Node provided by the service', async () => {
    service.update(portalKey, html` <span>Portal Content</span> `);
    await waitForAsync();
    expect(component).toHaveTextContent('Portal Content');
  });

  test('should read the key from a regular attribute', async () => {
    component = renderComponent(PortalOutComponent, { attrs: { key: portalKey } });
    service.update(portalKey, html` <span>Portal Content</span> `);
    await waitForAsync();
    expect(component).toHaveTextContent('Portal Content');
  });

  test('should update the view when the service emits a new Node', async () => {
    service.update(portalKey, html` <div>initial</div> `);
    await waitForAsync();
    expect(component).toHaveTextContent('initial');
    service.update(portalKey, html` <div>updated</div> `);
    await waitForAsync();
    expect(component).toHaveTextContent('updated');
  });
});
