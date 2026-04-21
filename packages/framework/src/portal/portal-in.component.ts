import { WebComponent, html } from '../components';
import { inject } from '../di';
import { PortalService } from './portal.service';

/**
 * A component that acts as a rendering source for a portal.
 *
 * It captures all its child nodes and registers them in the `PortalService` under the provided `key`. This allows for rendering
 * the content of this component into the location of a `PortalOutComponent` anywhere in the application.
 */
export class PortalInComponent extends WebComponent {
  public static tag = 'croqueta-portal-in';
  public static observedAttributes = ['key'];

  /** Input property for the portal identifier. */
  private keySignal = this.attributeInput<string | null>({ name: 'key', initialValue: null, fromString: (v) => v });
  private service = inject(PortalService);

  constructor() {
    super({ shadow: 'none' });
  }

  override connectedCallback(): void {
    let prevKey: string | null = null;
    const nodes = [...this.childNodes];
    this.effect(() => {
      const key = this.keySignal.get();
      if (prevKey && prevKey !== key) {
        this.service.remove(prevKey);
      }
      if (key && prevKey !== key && nodes.length) {
        const node = document.createDocumentFragment();
        node.append(...nodes);
        this.service.update(key, node);
      }
      prevKey = key;
    });
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    const key = this.keySignal.get();
    if (key) {
      this.service.remove(key);
    }
    super.disconnectedCallback();
  }

  protected render() {
    return html``;
  }
}
