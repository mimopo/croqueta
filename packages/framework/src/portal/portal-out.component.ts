import { WebComponent, html } from '../components';
import { inject } from '../di';
import { PortalService } from './portal.service';

/**
 * A component that acts as a rendering target for a portal.
 *
 * It subscribes to the `PortalService` with a specific key and renders the `Node` associated with that key. This allows for rendering
 * content from anywhere in the application into the location of this component.
 */
export class PortalOutComponent extends WebComponent {
  /** The custom element tag name for this component. */
  public static tag = 'croqueta-portal-out';
  public static observedAttributes = ['key'];

  /** Input property for the portal identifier. */
  private keySignal = this.attributeInput<string | null>({ name: 'key', initialValue: null, fromString: (v) => v });

  /** An instance of the PortalService, retrieved from the dependency injector. */
  private service = inject(PortalService);

  constructor() {
    super({ shadow: 'none' });
  }

  public connectedCallback() {
    this.effect(() => {
      const key = this.keySignal.get();
      const node = key ? this.service.get(key).get() : undefined;
      if (node) {
        this.root.replaceChildren(node);
      } else {
        this.root.replaceChildren();
      }
    });
    super.connectedCallback();
  }

  /**
   * Renders the Node received from the PortalService. If no Node is
   * registered for the key, it renders a default fallback text.
   * @returns The DocumentFragment to be rendered.
   */
  protected render(): Node {
    return html``;
  }
}
