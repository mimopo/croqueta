# Croqueta CLI

The official command-line tool for the _Croqueta Framework_. Scaffold applications, components, and services with ease.

_Croqueta CLI_ is designed to streamline your development workflow by providing powerful scaffolding tools and automated file generation, ensuring your project follows best practices from day one.

> [!NOTE]
> _Croqueta CLI_ is a work in progress. The API is not stable and may change in future versions.

## 🚀 Quick Start

No installation required! Run it directly using `npx`:

```bash
npx @mimopo/croqueta-cli
```

## 📦 Installation

If you prefer to have it available locally in your project or globally:

### Local (Recommended)

Add it as a development dependency:

```bash
npm install -D @mimopo/croqueta-cli
```

Then run it via `npx`:

```bash
npx croqueta
```

### Global

```bash
npm install -g @mimopo/croqueta-cli
```

## ⚙️ Usage

Croqueta CLI provides a sleek interactive interface to guide you through code generation.

### Commands

| Feature              | Command              |
| :------------------- | :------------------- |
| **Interactive Mode** | `croqueta`           |
| **Help**             | `croqueta --help`    |
| **Version**          | `croqueta --version` |

### Generators

You can bypass the interactive prompts by passing the generator name and arguments directly:

```bash
# Example: Create a new application
croqueta example my-new-app

# Example: Create a component
croqueta component my-button
```

## 🤖 AI Interop

Unlock the power of AI agents with _Croqueta CLI_. It provides built-in support for generating [agent skills](https://agentskills.io/), allowing your AI agents to interact seamlessly with the Croqueta ecosystem.

```bash
croqueta ai-agent-skills
```

This will generate the necessary skill definitions to make your AI agent a Croqueta expert.

## 📄 License

Croqueta CLI is open-source software licensed under the [MIT License](https://github.com/mimopo/croqueta/blob/main/LICENSE.md).

## 🙇 Special Thanks

This project is built on top of the amazing [Plop](https://plopjs.com/) project.
