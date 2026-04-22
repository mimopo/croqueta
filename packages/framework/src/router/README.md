# Router

The Croqueta Router is a powerful, lightweight client-side router designed for building Single Page Applications (SPAs). It supports nested routes, route parameters, guards, resolvers, lazy loading, and different routing strategies.

## Getting Started

To use the router, you need to configure it during your application initialization using the `provideRouter` function, passing an array of `Route` objects and the routing strategy.

```typescript
import { provideRouter, HashRouterStrategy, type Route } from '@mimopo/croqueta';
import { HomeComponent } from './home.component';
import { AboutComponent } from './about.component';

const routes: Route[] = [
  { path: '/', component: HomeComponent },
  { path: '/about', component: AboutComponent },
];

provideRouter({
  strategy: new HashRouterStrategy(),
  routes: routes,
});
```

### Routing Strategies

Croqueta supports two main routing strategies:

- **`HashRouterStrategy`**: Uses the URL hash (e.g., `#/home`) for navigation. It doesn't require server-side configuration.
- **`PathRouterStrategy`**: Uses the HTML5 History API (e.g., `/home`). Requires your server to be configured to serve the main `index.html` for all requested paths.

### Defining Routes

The most simple route definition is a `path` and a `component`.

```typescript
const routes: Route[] = [{ path: '/', component: HomeComponent }];
```

### The Router Outlet

The `<croqueta-router>` component acts as a placeholder where the router renders the component belonging to the active route.

```typescript
import { Component, html, RouterComponent, registerComponent } from '@mimopo/croqueta';

class AppRoot extends Component {
  static tag = 'app-root';

  constructor() {
    super();
    registerComponent(RouterComponent);
  }

  protected render() {
    return html`<croqueta-router></croqueta-router>`;
  }
}
```

## Navigation

### Using `router-link`

For declarative navigation, use a standard anchor (`<a>`) tag with the `is="router-link"` attribute. This component automatically handles click events to prevent full page reloads and applies an `active` class when its route matches the current path.

```html
<a is="router-link" route="/home" activeClass="nav-selected">Home</a>
```

### Programmatic Navigation

To navigate programmatically, inject the `Router` service and use its `navigate` method.

```javascript
import { inject, Router } from '@mimopo/croqueta';

const router = inject(Router);
await router.navigate('/dashboard');
```

## Parameters

You can add parameters to the routes by using a segment prefixed with a colon. The parameter will be available on the loaded component as a property, so you can track it as an input:

```typescript
const routes: Route[] = [
  {
    // The parameter will be assigned to the 'id' property of the component
    path: '/data/:id',
    component: ExampleComponent,
  },
];
```

To obtain the parameters in your component you just need to define them as inputs and the router will automatically assign the value to the property.

```typescript
class ExampleComponent extends Component {
  private _id = this.input('id', '');
  // ...
}
```

> [!NOTE]
> Parameters are always strings, if you need to convert them to another type use data resolvers.

### Navigate with parameters

To navigate to a parameterized route you need to provide the parameter value:

```javascript
import { inject, Router } from '@mimopo/croqueta';

const router = inject(Router);
await router.navigate('/data/:id', { id: 1 });
```

Or using the `router-link` component:

```typescript
class ExampleComponent extends Component {
  // ...
  protected render() {
    const path = computed(() => {
      return this.router.getRoutePath('/data/:id', { id: this._id.get() });
    });
    return html`<a is="router-link" [route]="${path}">Navigate</a>`;
  }
}
```

## Data resolvers

Data resolvers allow you to obtain data before the component is rendered. You just need to add a `data` object, where each key represents the property mapped to the component and each value is a function that returns the data.

```typescript
const routes: Route[] = [
  {
    // The parameter will be assigned to the 'id' property of the component
    path: '/data/:id',
    component: ExampleComponent,
    data: {
      message: ({ id }) => `Welcome user #${id}!`,
    },
  },
];
```

> [!TIP]
> If the resolver functions returns a `Promise`, the router will wait for it to resolve before rendering the component. All the promises are resolved in parallel.

> [!IMPORTANT]
> If a parameter and a data resolver has the same name, the data resolver will overwrite the parameter.

## Page title

The `title` function allows you to set the title of the page for the current route, when the user leaves the route the title will be restored to the previous one. It's a function that receives the URL parameters and returns a string.

```typescript
const routes: Route[] = [
  {
    path: '/title/:id',
    component: ExampleComponent,
    title: ({ id }) => `Welcome user #${id}!`,
  },
];
```

> [!TIP]
> If the function returns a `Promise`, the router will wait for it to resolve before rendering the component.

## Named routes

Named routes allows you to navigate by name instead of path, centralizing the route definition. This is particularly useful when your application routes grow a lot. You can use the `name` property to assign a name to a route.

```typescript
const routes: Route[] = [
  {
    path: '/named/route',
    name: 'namedRoute',
    component: ExampleComponent,
  },
];
```

Then you will be able to use the name on any navigation method instead of the path:

```javascript
const router = inject(Router);
router.navigate('namedRoute');
```

```typescript
class ExampleComponent extends Component {
  // ...
  protected render() {
    return html`<a is="router-link" route="namedRoute">Navigate</a>`;
  }
}
```

## Nested routes

You can have nested routes by adding a `children` property to a route. The children routes will be rendered in a `<croqueta-router>` component within the parent component.

```typescript
const routes: Route[] = [
  {
    path: '/parent',
    // This component must have a <croqueta-router> element
    component: ParentComponent,
    children: [
      {
        path: '/child',
        // This component must be printed inside the parent <croqueta-router>
        component: ChildComponent,
      },
    ],
  },
];
```

> [!IMPORTANT]
> If several nested routes have the same resolved data keys, the last one will overwrite the previous ones.

## Redirects

You can redirect to another route directly from the route definition by using the `redirect` function. It takes the route parameters and returns the new path.

```typescript
const routes: Route[] = [
  {
    path: '/redirect/:id',
    redirect: ({ id }) => `/data/${id}`,
  },
];
```

> [!TIP]
> If the function returns a `Promise`, the router will wait for it to resolve before redirecting.

## Wildcard routes

To capture any route that doesn't match any of the defined routes, you can use the wildcard route at the end of the routes array. It's just a regular route with a special path `**`.

```typescript
const routes: Route[] = [
  {
    path: '**',
    component: NotFoundComponent,
  },
];
```

## Route Guards

Guards allow you to control navigation based on custom logic (e.g., authentication). You can add as many guard functions as you need, they will be executed sequentially. If any guard returns `false`, navigation is aborted.

- **`accessGuard`**: Checked before entering a route. Useful for access control.
- **`leaveGuard`**: Checked before navigating away from a route. Useful for preventing users from losing unsaved changes.

```typescript
const routes: Route[] = [
  {
    path: '/secure/:userId/:formId',
    component: SecureComponent,
    accessGuard: [({ userId }) => isUserLoggedIn(userId)],
    leaveGuard: [({ formId }) => hasUnsavedChanges(formId)],
  },
];
```

## Lazy loading

To make your SPA initial load as fast as possible you can use lazy loading. It will start to load content once the route is matched.

### Components

Use the `loadComponent` function to [dynamically import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) a component:

```typescript
const routes: Route[] = [
  {
    path: '/lazy',
    loadComponent: () => import('./lazy.component').then((m) => m.LazyComponent),
  },
];
```

### Routes

Use `loadChildren` to dynamically import an array of routes. Once loaded, the routes will behave exactly like the static nested routes.

```typescript
const routes: Route[] = [
  {
    path: '/lazy',
    loadChildren: () => import('./lazy.routes').then((m) => m.routes),
  },
];
```

```typescript
// lazy.routes
export const routes: Route[] = [
  {
    path: '/',
    component: LazyComponent,
  },
  {
    path: '/other',
    component: OtherLazyComponent,
  },
];
```

> [!WARNING]
> If you lazy load named routes, you will not be able to navigate to them using the name until they are loaded.

## Examples

For a complete working example of the router in action, check out the [Router Example Application](../../../../examples/router?github).

You can open it directly with
[StackBlitz ⚡️](https://stackblitz.com/github/mimopo/croqueta/tree/main/examples/router?file=src/main.ts)
