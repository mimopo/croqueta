# Croqueta

<p align="center">
  <img src="./croqueta.webp" alt="Logo" width="73" height="120"/>
</p>

## Hot and Tasty Frontend Framework

_Croqueta_ is a lightweight JavaScript framework for building modern web applications using native web components and fine-grained reactivity.

> [!NOTE]
> _Croqueta_ is a work in progress. The API is not stable and may change in future versions.

## 🎯 Why Croqueta?

Probably the world doesn't need another JavaScript framework, but I just wanted to create one to explore the depths of the web platform and learn more about how frontend frameworks work under the hood. The journey it's being fun and I've learned a lot, so I decided to share it. Maybe you'll find it useful too.

## 🏛️ Principles

- **Standard Based**: Components are built on top of [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components) and the rendering system is written as a [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- **Future-Proof**: Reactivity is achieved by using the [TC39 Signals Polyfill](https://github.com/proposal-signals/signal-polyfill). When browsers adopt the standard, _Croqueta_ will run natively without the polyfill weight.
- **Architectural Scalability**: While it includes most of the features needed in a production-grade application, you can just take what you need. It's designed to be modular and interoporable.
- **Lightweight**: Designed to be lightweight and fast, a whole framework under 15kb gzipped.
- **Zero-Build option**: Use it directly from a [CDN](https://unpkg.com/@mimopo/croqueta/index.mjs) or install the [NPM package](https://www.npmjs.com/package/@mimopo/croqueta) on your project.
- **Typed**: The framework is written in TypeScript and provides type definitions for all its APIs.

## ✨ Features

- 📦 [Components](./packages/framework/src/components/): Build reactive components, handle inputs, outputs, and lifecycle with minimal boilerplate.
- ⚛️ [Reactivity](./packages/framework/src/reactivity/): Track changes and update only the necessary parts of the DOM thanks to signals. Transform data with computed signals and do side effects easily.
- 💉 [Dependency Injection](./packages/framework/src/di/): Inject services and replace them with mocks during testing.
- 🚦 [Router](./packages/framework/src/router/): Create your SPA with differnt router strategies, lazy loading, guards, resolvers and more.
- 🔄 [State Management](./packages/framework/src/state/): Redux-pattern state management powered by signals and [Redux DevTools compatible](./packages/framework/src/state-dev?github).
- 🌀 [Portals](./packages/framework/src/portal/): Render components in different parts of the DOM.

## 📦 Installation

Drop a script tag with the CDN link in your HTML file:

```html
<script script type="importmap">
  {
    "imports": {
      "@mimopo/croqueta": "https://unpkg.com/@mimopo/croqueta/index.mjs",
      "@mimopo/croqueta/dev": "https://unpkg.com/@mimopo/croqueta/dev.mjs",
      "signal-polyfill": "https://unpkg.com/signal-polyfill/dist/index.js"
    }
  }
</script>
```

Or install as NPM package on your project:

```bash
npm install @mimopo/croqueta
```

> [!NOTE]
> Don't forget to use `type="module"` on your script tag when using the CDN version!

## 🚀 Quick Start

Creating a reactive component is simple and boilerplate-free.

```typescript
import { Component, html, registerComponent, signal } from '@mimopo/croqueta';

class MyCounter extends Component {
  static tag = 'my-counter';

  private count = signal(0);

  protected render() {
    return html`
      <div class="counter">
        <p>Current Count: ${this.count}</p>
        <button (click)="${() => this.count.set(this.count.get() + 1)}">Increment</button>
      </div>
    `;
  }
}

registerComponent(MyCounter);
```

Then load the component in your HTML:

```html
<my-counter></my-counter>
```

## `>_` CLI Tool

[_Croqueta CLI_](./packages/cli) is a command-line tool for scaffolding and managing Croqueta applications. It includes generators for components, services, tests, applications and more.

```bash
npx @mimopo/croqueta-cli
```

### 🤖 AI-Ready

If you are using AI, you can help your agent to understand _Croqueta framework_ and interact with _Croqueta CLI_ by running the following _Croqueta CLI_ command to install [agent skills](https://agentskills.io) on your `.agent/skills` folder:

```bash
npx @mimopo/croqueta-cli ai-agent-skills
```

## 📖 Examples

Check out our functional examples in the repository or open them directly on StackBlitz:

| Example                            | StackBlitz                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [Router](./examples/router?github) | [Open in StackBlitz ⚡️](https://stackblitz.com/github/mimopo/croqueta/tree/main/examples/router?file=src/main.ts) |
| [State](./examples/state?github)   | [Open in StackBlitz ⚡️](https://stackblitz.com/github/mimopo/croqueta/tree/main/examples/state?file=src/main.ts)  |

## 🤝 Contributing

This is a low-level framework built to explore the depths of the Web Platform. Feel free to open issues or PRs if you want to dive into the internals!

Check [CONTRIBUTING.md](./CONTRIBUTING.md?github) for more information.

## 🗒️ Changelog

- [Changelog](https://github.com/mimopo/croqueta/releases)

## ⚖️ License

Croqueta is licensed under the [MIT license](./LICENSE.md)
