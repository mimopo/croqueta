# Components

In _Croqueta_, components are the building blocks of your application. They are based on standard [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) but enhanced with a reactive system powered by signals and a template system.

## Creating a Component

To create a component, you must extend the `Component` base class, define a static `tag` property, and implement the `render` method.

```typescript
import { Component, html } from '@mimopo/croqueta';

export class MyComponent extends Component {
  static tag = 'my-component';

  protected render() {
    return html`<h1>Hello World</h1>`;
  }
}
```

- **tag**: The name of the custom element (it must be a [valid custom element name](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)).
- **render()**: This method must return a `Node`. Using the `html` tagged template literal is the recommended way to create complex templates.

## Registering a component

Before using a component you need to [register it](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#registering_a_custom_element). The recommended way is to use the helper function `registerComponent`, it registers the custom element if it's not registered yet.

The recommended approach when nesting components is to register the child components in the parent component's constructor:

```typescript
import { Component, html, registerComponent } from '@mimopo/croqueta';

class MyComponent extends Component {
  static tag = 'my-component';

  constructor() {
    super();
    registerComponent(MyChildComponent);
  }

  protected render(): Node {
    return html`<my-child-component></my-child-component>`;
  }
}
```

## Template Syntax

The `html` tagged template literal allows you to build reactive templates with ease. By passing a signal to the template, the value printed will be updated automatically when the signal changes.

### Data Binding

- **Text Binding**: Interpolate values or signals directly.
  ```javascript
  html`<div>Count: ${this.count}</div>`;
  ```
- **Property Binding**: Use `[]` to bind to an element property.
  ```javascript
  html`<button [disabled]="${this.isDisabled}">Submit</button>`;
  ```
- **Attribute Binding**: Standard attributes can also be reactive.
  ```javascript
  html`<div class="${this.theme}"></div>`;
  ```
- **Event Binding**: Use `()` to listen to DOM or custom events.
  ```javascript
  html`<button (click)="${() => this.increment()}">Add</button>`;
  ```
- **Two-way Data Binding**: Use `[()]` for two-way synchronization between a property and a signal.
  ```javascript
  html`<input [(value)]="${this.username}" />`;
  ```

### List Rendering

Use the `repeat` function for efficient list rendering. It requires a signal-like array, a key extraction function, and a template function. It will handle updates by only updating the nodes that have changed.

```typescript
import { Component, html, repeat, signal } from '@mimopo/croqueta';

interface Item {
  id: number;
  name: string;
}

export class MyComponent extends Component {
  static tag = 'my-component';

  private _items = signal<Item[]>([{ id: 1, name: 'Item 1' }]);

  protected render() {
    return html`
      <button (click)="${() => this.addItem()}">Add</button>
      <ul>
        ${repeat(
          this._items,
          (item) => item.id,
          (item) =>
            html`<li>
              ${item.name}
              <button (click)="${() => this.removeItem(item.id)}">Remove</button>
            </li>`
        )}
      </ul>
    `;
  }

  private addItem() {
    this._items.set([
      ...this._items.get(),
      {
        id: this._items.get().length + 1,
        name: 'Item ' + (this._items.get().length + 1),
      },
    ]);
  }

  private removeItem(id: number) {
    this._items.set(this._items.get().filter((item) => item.id !== id));
  }
}
```

## Encapsulation (Shadow DOM)

By default, components use a **closed shadow DOM**. You can configure this in the constructor using `ComponentOptions`.

```javascript
constructor() {
  super({ shadow: 'open' }); // 'open' | 'closed' | 'none'
}
```

- **none**: Renders directly in the light DOM (no encapsulation).
- **open**: Renders inside an open Shadow Root.
- **closed**: Renders inside a closed Shadow Root.

## Styling

Styles are defined using the static `styles` property. Styles are automatically scoped if the component uses Shadow DOM, prefixed by the component tag name if not using Shadow DOM.

```typescript
import { Component, html } from '@mimopo/croqueta';

export class MyComponent extends Component {
  static tag = 'my-component';
  static styles = `
    h1 { color: blue; }
  `;

  protected render() {
    return html`<h1>Hello World</h1>`;
  }
}
```

### Global styles

You can add styles globally by using the `addGlobalStyles` method of the `StylesService`. All the components will receive the same styles:

```javascript
import { inject, StylesService } from '@mimopo/croqueta';
inject(StylesService).addGlobalStyles(`.hidden { display: none; }`);
```

## Lifecycle

Components uses the standard [Custom Elements lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks). There are no custom lifecycle callbacks in purpose, but you can use the standard ones depending on what you need to do:

> [!IMPORTANT]
> If you override them, **always call the super method** to ensure the framework's internal logic (like effects cleanup or rendering) works correctly.

- If you need to run logic before rendering, override `connectedCallback` and add your logic before calling `super.connectedCallback()`.
- If you need to run logic after rendering, override `attributeChangedCallback` and add your logic after calling `super.attributeChangedCallback()`.
- If you need to run teardown logic, override `disconnectedCallback` and add your logic before calling `super.disconnectedCallback()`.

```javascript
connectedCallback() {
  // your custom logic before rendering
  super.connectedCallback();
  // your custom logic after rendering
}

disconnectedCallback() {
  super.disconnectedCallback();
  // your custom logic on disconnect
}
```

## Reactivity

Croqueta uses **Signals** for reactivity (the signals implementation follows the [TC39 Signals proposal](https://github.com/tc39/proposal-signals)). When a signal used in a template, the UI updates automatically by updating only the changed nodes.

### Signals

Import `signal` to create reactive state.

```typescript
import { Component, html, signal } from '@mimopo/croqueta';

export class MyCounter extends Component {
  static tag = 'my-counter';
  private _count = signal<number>(0);

  protected render() {
    return html`Current count is: ${this._count}`;
  }
}
```

### Computed Signals

If you need to get values based on a signal value, use `computed()`.

```typescript
import { Component, html, signal, computed } from '@mimopo/croqueta';

interface User {
  name: string;
  surname: string;
}

export class MyGreeter extends Component {
  static tag = 'my-greeter';

  private _user = signal<User>({
    name: 'John',
    surname: 'Doe',
  });

  private _fullName = computed<string>(() => `${this._user.get().name} ${this._user.get().surname}`);

  protected render() {
    return html`Current count is: ${this._fullName}`;
  }
}
```

Further information about signals can be found in the [Reactivity](../reactivity/) section.

### Effects

Use `this.effect()` to run side effects that react to signal changes. The framework automatically cleans up these effects when the component is disconnected.

```typescript
import { Component, html, signal } from '@mimopo/croqueta';

export class MyCounter extends Component {
  static tag = 'my-counter';

  private _count = signal<number>(0);

  constructor() {
    super();
    this.effect(() => {
      console.log('Count changed to:', this._count.get());
    });
  }

  protected render() {
    return html`Current count is: ${this._count}`;
  }
}
```

## Communication

### Inputs

Use `this.input()` to define reactive properties that can be set from the outside. It will return a signal and create a property getter/setter with the provided name meant to be used from outside. You can keep the signal private.

> [!IMPORTANT]
> Remember the signal and the property must have different names, if you forget it the framework will throw an error.

> [!TIP]
> Choose a convention you can stick to it, for example keep the signal [private](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements) by prefixing it with `#` or adding a prefix like `_`.

```typescript
import { Component, html } from '@mimopo/croqueta';

export class MyGreeter extends Component {
  static tag = 'my-greeter';
  private _user = this.input<string>('user', '');

  protected render() {
    return html`Hello ${this._user}`;
  }
}
```

### Outputs

Use `this.output()` to emit custom events to parent components. You can keep the emitter private.

```typescript
import { Component, html } from '@mimopo/croqueta';

export class MyButton extends Component {
  static tag = 'my-button';
  private _clicked = this.output<void>('clicked');

  protected render() {
    return html`<button (click)="${() => this._clicked.emit()}">Click me</button>`;
  }
}
```

### Two-way binding (input + output)

Use `this.inputOutput()` to create a property that is both an input and emits an `[name]-change` event when updated. The framework template system will handle the two-way binding automatically. You can keep the signal private.

If you call the regular `set` method, the signal will be updated but the parent component will not be notified. If you call the `emit` method, the signal will be updated and the parent component will be notified.

```typescript
import { Component, html } from '@mimopo/croqueta';

class MyInput extends Component {
  static tag = 'my-input';
  private _value = this.inputOutput<string>('value', '');

  protected render() {
    return html`<input type="text" id="input" [value]="${this._value}" (keyup)="${(e: any) => this._value.emit(e.target.value)}" />`;
  }
}
```

## Exporting as a Web Component

If you want to use your component as a standard web component (e.g., in a vanilla JS app or another framework), extend `WebComponent` instead. This class provides utilities for mapping HTML attributes to signals and how to convert them from string to the desired type and vice versa.

If you need to handle inputs, use `attributeInput` and add the attribute to `observedAttributes`.

```typescript
import { WebComponent, html, computed } from '@mimopo/croqueta';

export class MyGreeter extends WebComponent {
  static tag = 'my-greeter';
  private _user = this.attributeInput({
    name: 'user',
    initialValue: { name: 'John' },
    fromString: (v) => JSON.parse(v),
    toString: (v) => JSON.stringify(v),
  });

  protected render() {
    const name = computed(() => this._user.get().name);
    return html`Hello ${name}`;
  }
}
```

If you need two-way data binding, use `attributeInputOutput` and add the attribute to `observedAttributes`.

```typescript
import { WebComponent, html } from '@mimopo/croqueta';

export class MyCounter extends WebComponent {
  static tag = 'my-counter';
  static observedAttributes = ['count'];

  private _count = this.attributeInputOutput({
    name: 'count',
    initialValue: 0,
    fromString: (v) => Number(v),
    toString: (v) => String(v),
  });

  protected render() {
    return html`
      <p>Current count is ${this._count}</p>
      <button (click)="${() => this._count.set(this._count.get() + 1)}">Increment</button>
    `;
  }
}
```
