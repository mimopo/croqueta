import { Component, Router, RouterComponent, html, inject, registerComponent } from '@mimopo/croqueta';

import css from './app.component.css?inline';

export class AppComponent extends Component {
  public static tag = 'app-root';
  public static styles = css;

  private router = inject(Router);

  public override connectedCallback(): void {
    registerComponent(RouterComponent);
    super.connectedCallback();
  }

  protected render(): Node {
    const namedRoute = this.router.getRoutePath('named');
    return html`
      <div class="container-fluid">
        <img src="https://github.com/mimopo/croqueta/raw/main/croqueta.webp" alt="Croqueta" class="logo" width="30" height="49" />
        <header>
          <h1>Router Example</h1>
        </header>
        <aside>
          <nav>
            <ul>
              <li><a is="router-link" route="/">home</a></li>
              <li><a is="router-link" route="/data/1">resolve data</a></li>
              <li><a is="router-link" route="/title/1">set title</a></li>
              <li><a is="router-link" route="/guarded">guarded</a></li>
              <li><a is="router-link" route="${namedRoute}">named</a></li>
              <li><a is="router-link" route="/nested/component">nested</a></li>
              <li><a is="router-link" route="/lazy-component">lazy load component</a></li>
              <li><a is="router-link" route="/lazy-routes">lazy load routes</a></li>
              <li><a is="router-link" route="/redirect/1">redirect</a></li>
              <li><a is="router-link" route="/loop">redirect loop</a></li>
              <li><a is="router-link" route="/not-found">not found</a></li>
            </ul>
          </nav>
        </aside>
        <main>
          <croqueta-router></croqueta-router>
        </main>
      </div>
    `;
  }
}
