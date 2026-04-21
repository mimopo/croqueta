import { Component, html, registerComponent } from '../../components';
import { inject } from '../../di';
import { computed, signal } from '../../reactivity';
import type { PartialRequired } from '../../types';
import { Outlet } from '../outlet';
import { Router } from '../router';
import type { ActivatedRoute } from '../types';

type ActivatedComponent = PartialRequired<ActivatedRoute, 'component'>;

/**
 * A component that serves as the main outlet for the application's router.
 * It renders the component associated with the current active route.
 *
 * This component dynamically renders the content managed by the `RouterService`.
 * The `RouterService` is responsible for listening to path changes and updating the 'router'
 * portal with the appropriate component's view.
 *
 * @example
 * ```html
 * <croqueta-router></croqueta-router>
 * ```
 */
export class RouterComponent extends Component {
  public static tag = 'croqueta-router';

  private router = inject(Router);
  private outlet = inject(Outlet);
  private activatedComponent = signal<ActivatedComponent | undefined>(undefined);

  public override connectedCallback(): void {
    const level = this.outlet.register(this);
    super.connectedCallback();
    this.effect(() => {
      const active = this.router.activatedRoutes.get();
      const found = active.filter((a) => !!a.component).at(level) as ActivatedComponent | undefined;
      this.activatedComponent.set(found);
    });
  }

  public override disconnectedCallback(): void {
    this.outlet.unregister(this);
    super.disconnectedCallback();
  }

  protected render(): Node {
    const node = computed<Node>(() => {
      const activated = this.activatedComponent.get();
      if (activated?.component) {
        registerComponent(activated.component);
        const el = document.createElement(activated.component.tag);
        if (activated.params) {
          Object.assign(el, activated.params);
        }
        if (activated.data) {
          Object.assign(el, activated.data);
        }
        return el;
      }
      return document.createTextNode('');
    });
    return html`${node}`;
  }
}
