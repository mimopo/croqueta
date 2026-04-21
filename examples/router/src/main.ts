import { PathRouterStrategy, StylesService, css, inject, provideRouter, registerComponent } from '@mimopo/croqueta';

import { AppComponent } from './app.component';
import { DataComponent } from './components/data.component';
import { ExampleComponent } from './components/example.component';
import { NestedComponent } from './components/nested.component';
import { NotFoundComponent } from './components/not-found.component';

import normalize from 'normalize.css?inline';

// CSS tagged template literal allows you to have css synthax highlighting in your IDE
const globalStyles = css`
  p {
    margin: 0 0 1rem 0;
  }
  pre {
    background-color: var(--background-accent-color);
    color: var(--color);
    padding: 1rem;
  }
  a {
    color: var(--link-color);
  }
`;

// Global styles are applied to all the components
inject(StylesService).addGlobalStyles(normalize, globalStyles);

// Provide the router configuration with different examples
provideRouter({
  // Define the router strategy
  strategy: new PathRouterStrategy(),
  // Define the routes
  routes: [
    // Basic route
    {
      path: '/',
      component: ExampleComponent,
    },
    // Route with params and data resolution
    {
      path: '/data/:id',
      component: DataComponent,
      data: {
        message: (params) => `Welcome user #${params.id}!`,
      },
    },
    // Route with title
    {
      path: '/title/:id',
      component: ExampleComponent,
      title: (params) => `Router Example - Welcome user #${params.id}!`,
    },
    // Component lazy load
    {
      path: '/lazy-component',
      loadComponent: () => import('./components/lazy.component').then((m) => m.LazyComponent),
    },
    // Access and leave guards
    {
      path: '/guarded',
      accessGuard: [() => confirm('do you want to go there?')],
      leaveGuard: [() => confirm('do you want to leave?')],
      component: ExampleComponent,
    },
    // Named route
    {
      path: '/named/route',
      name: 'named',
      component: ExampleComponent,
    },
    // Nested routes
    {
      path: '/nested',
      component: NestedComponent,
      children: [
        {
          path: '/component',
          component: ExampleComponent,
        },
      ],
    },
    // Lazy load routes
    {
      path: '/lazy-routes',
      loadChildren: () => import('./lazy.routes').then((m) => m.routes),
    },
    // Redirect function
    {
      path: '/redirect/:id',
      redirect: ({ id }) => `/data/${id}`,
    },
    // Redirect loop detection
    {
      path: '/loop',
      redirect: () => '/loop',
    },
    // Wildcard for not found routes
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
});

// Register the main component
registerComponent(AppComponent);
