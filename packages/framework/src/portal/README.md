# Portal

Portals provide a way to render children into a DOM node that exists outside the hierarchy of the parent component. This is commonly used for UI elements that need to "break out" of their container, such as modals, dialogs, extensible toolbars...

## How it works

The Portal system consists of three main parts:

1.  **`croqueta-portal-in`**: A component that "sends" its children to a portal.
2.  **`croqueta-portal-out`**: A component that "receives" and renders the content from a portal.
3.  **`PortalService`**: A registry that manages the connection between `in` and `out` components using unique keys.

## Components

### `<croqueta-portal-in>`

This component captures all its child nodes and registers them in the `PortalService` under the provided `key`.

| Attribute | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `key`     | `string` | The unique identifier for the portal. |

> [!IMPORTANT]
> Children of `<croqueta-portal-in>` are physically **moved** in the DOM to the destination `<croqueta-portal-out>`.

### `<croqueta-portal-out>`

This component acts as a placeholder that renders the content associated with its `key`.

| Attribute | Type     | Description                                           |
| :-------- | :------- | :---------------------------------------------------- |
| `key`     | `string` | The identifier that matches a `<croqueta-portal-in>`. |

## Examples

### Declarative Usage

You can use portals directly in your attributes by placing the `in` and `out` components wherever you need them.

```html
<!-- Inside a deeply nested component -->
<croqueta-portal-in key="my-portal">
  <div class="modal">
    <h2>I'm in a Portal!</h2>
    <p>I was defined deep in the tree, but I render elsewhere.</p>
  </div>
</croqueta-portal-in>

<!-- At the root level of your app or in index.html -->
<div id="portal-container">
  <croqueta-portal-out key="my-portal"></croqueta-portal-out>
</div>
```

### Programmatic Usage

You can also interact with portals directly via the `PortalService`. This is useful for dynamically creating portal content from logic.

```typescript
import { PortalService, inject, html } from '@mimopo/croqueta';

class MyService {
  private portal = inject(PortalService);

  showNotification(message: string) {
    this.portal.update('notifications', html`<div class="toast">${message}</div>`);
  }

  clear() {
    this.portal.remove('notifications');
  }
}
```

## Considerations & Limitations

### Node Movement

Because the DOM nodes are physically moved, any direct references you hold to those nodes will still point to the same objects, but their `parentElement` will change. If you are using third-party libraries that rely on a specific DOM structure, be aware of this move.

### Styling and Shadow DOM

Portals are rendered in the Light DOM (`shadow: 'none'`). However, if the content originates from a component using Shadow DOM, it might lose its styles when moved to a `<croqueta-portal-out>` located outside that shadow root.

- **Global Styles**: Styles added via `StylesService.addGlobalStyles()` will apply normally.
- **Scoped Styles**: Component-specific styles will NOT apply to portal content unless that content is itself a component with its own styles.

### Multiple Providers (`in`)

If multiple `<croqueta-portal-in>` components share the same `key`, the one that was most recently connected or updated will take precedence. The previous content will be replaced.

### Multiple Consumers (`out`)

If multiple `<croqueta-portal-out>` components share the same `key`, they will "compete" for the same DOM nodes. Since a DOM node can only have one parent, the last component to receive the update will effectively "steal" the content from the others.

> [!TIP]
> Always aim for a 1-to-1 mapping between keys to ensure predictable rendering.

### Key Collisions

Always use descriptive and unique keys for your portals (e.g., `prefix-feature-modal`) to avoid accidental overwrites from different parts of your application.
