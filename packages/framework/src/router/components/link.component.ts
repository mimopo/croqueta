import { inject } from '../../di';
import { effect } from '../../reactivity';
import { Router } from '../router';

/**
 * A custom anchor element (`<a>`) that integrates with the framework's `RouterService`.
 * It provides client-side navigation without full page reloads.
 *
 * This component is defined as a customized built-in element, so it should be used
 * with an `is="router-link"` attribute on an anchor tag.
 *
 * @example
 * ```html
 * <a is="router-link" route="/home" activeClass="nav-active">Home</a>
 * ```
 */
export class LinkComponent extends HTMLAnchorElement {
  /**
   * An array of attribute names to observe for changes.
   * When the `route` attribute changes, `attributeChangedCallback` is invoked.
   */
  public static observedAttributes = ['route'];

  private router = inject(Router);
  private disposer?: () => void;
  private route = '';

  /**
   * A lifecycle callback that is invoked when one of the component's observed attributes changes.
   * It updates the link's `href` and internal state when the `route` attribute is modified.
   * @param name The name of the attribute that changed.
   * @param _oldValue The previous value of the attribute.
   * @param newValue The new value of the attribute.
   */
  public attributeChangedCallback(name: string, _oldValue: string | undefined, newValue: string) {
    if (name === 'route') {
      this.route = newValue;
      this.href = this.router.getHref(newValue);
    }
  }

  /**
   * A lifecycle callback that is invoked each time the component is appended into a document-connected element.
   * It sets up a 'click' event listener for navigation and subscribes to path changes to update its active state.
   */
  public connectedCallback() {
    this.addEventListener('click', this.navigate);
    this.disposer = effect(() => {
      this.updateClass(this.router.path.get());
    });
  }

  /**
   * A lifecycle callback that is invoked each time the component is disconnected from the document's DOM.
   * It cleans up the event listener and the subscription to prevent memory leaks.
   */
  public disconnectedCallback() {
    this.removeEventListener('click', this.navigate);
    this.disposer?.();
  }

  private navigate = async (e: Event) => {
    e.preventDefault();
    return this.router.navigate(this.route);
  };

  private updateClass(path: string) {
    const activeClass = this.getAttribute('activeClass') ?? 'active';
    if (path === this.route) {
      this.classList.add(activeClass);
    } else {
      this.classList.remove(activeClass);
    }
  }
}
