---
trigger: always_on
---

This is the source code for the Croqueta Framework. This guide is intended to be used by AI agents to understand the codebase and generate
code that is consistent with the existing code.

# Overview

This is a monorepo-based custom Web Component framework built from scratch.

- **Architecture:** Custom Reactive Web Components (Standard `HTMLElement` extension).
- **Philosophy:** Zero-dependency, high-performance ESM, "Bleeding edge" tooling.

# Environment

- Use `npm` for package management
- Use `npx` for executing node tools
- Use `vitest` to run tests (it uses `jsdom`)
- Use `oxlint` and `oxfmt` for linting and formatting after modifications
- Use `npm run build -w <package>` to build a package
- Use `npm run start -w <package>` to run dev server

# Structure

- `packages/framework`: framework source code
- `packages/cli`: CLI source code
- `packages/docs`: Documentation
- `packages/vite-plugins`: Internal Vite plugins
- `examples`: Example projects

# Coding Standards

- TypeScript strict mode and erasable syntax only
- Strict typing. Avoid `any` at all costs
- Kebab-case for custom element tags, PascalCase for Class names
- Use `interface` for public APIs, `type` for unions/internals
- Use `.service.ts` extension and implement the `Destroy` interface for services
- Use `.component.ts` extension and extend the `Component` class for components
- Use TSDoc syntax to document the public API, including classes, interfaces, methods and public members
- Vitest for testing, `.test.ts` suffix for test files, use `test` keyword insted of `it`
- Vite 8 and Rolldown are the build tools. Do not suggest Webpack or Rollup-specific configurations
- When writing CLI logic, never use `__dirname`. Always use `import.meta.dirname` to ensure ESM compatibility
