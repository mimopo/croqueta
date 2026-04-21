import { Component, Router, RouterComponent, css, html, inject, registerComponent } from '@mimopo/croqueta';

export class AppComponent extends Component {
  public static tag = 'app-root';
  public static styles = css`
    :host {
      display: block;
    }
    :host,
    .container {
      min-height: 100vh;
    }
    .logo,
    .sidebar {
      background-color: var(--background-accent-color);
    }
    .logo,
    .content {
      padding: 1rem;
    }
    .logo {
      grid-area: logo;
      text-align: center;
    }
    .logo img {
      height: 2rem;
    }
    .sidebar {
      grid-area: sidebar;
      padding-bottom: 1rem;
    }
    .sidebar ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .sidebar a {
      padding: 0.5rem 1rem;
      display: block;
      white-space: nowrap;
      text-decoration: none;
      color: var(--color);
    }
    .sidebar a:hover,
    .sidebar a.active {
      color: var(--link-color);
    }
    .content {
      grid-area: content;
    }
    @media (min-width: 640px) {
      .container {
        display: grid;
        grid-template-areas: 'sidebar content';
        grid-template-columns: auto 1fr;
      }
      .content {
        padding-top: 4.5rem;
      }
    }
  `;

  private router = inject(Router);

  public override connectedCallback(): void {
    registerComponent(RouterComponent);
    super.connectedCallback();
  }

  protected render(): Node {
    const namedRoute = this.router.getRoutePath('named');
    return html`
      <div class="container">
        <aside class="sidebar">
          <div class="logo">
            <img src="https://vite.dev/logo.svg" alt="Croqueta" />
          </div>
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
        </aside>
        <main class="content">
          <croqueta-router></croqueta-router>
        </main>
      </div>
    `;
  }
}
