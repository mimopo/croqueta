# Contributing

This is a monorepo based on NPM Workspaces for Croqueta Framework development.

## Structure

- `packages/framework`: _Croqueta_ Framework source code
- `packages/cli`: _Croqueta CLI_ source code
- `packages/docs`: Documentation site source code
- `packages/vite-plugins`: Internal Vite plugins
- `examples/`: Examples of how to use the framework

### Framework

Entry points:

- `src/dev.ts`: Devtools entry point (@mimopo/croqueta/dev)
- `src/index.ts`: Main entry point (@mimopo/croqueta)
- `src/testing.ts`: Testing utils entry point (@mimopo/croqueta/testing)

Source code:

- `src/components/`: Components
- `src/components-testing/`: Component testing utils
- `src/di/`: Dependency Injection
- `src/portal/`: Portal feature
- `src/reactivity/`: Signals implementation based on TC39 Signals proposal
- `src/router/`: Router feature
- `src/router-testing/`: Router testing utils
- `src/state/`: State management
- `src/state-dev/`: State management devtools
- `src/state-testing/`: State management testing tools
- `src/types/`: General types
- `src/utils/`: Utility functions

### CLI

Entry points:

- `src/index.ts`: Main entry point
- `src/plopfile.ts`: Configuration file for plop

Source code:

- `src/templates/`: Handlebars templates for code scaffolding
- `src/utils/`: Utility functions

## Local Environment Setup

- Install Node and PNPM versions indicated on the project's [package.json](./package.json) file.
- Install dependencies using `pnpm install`.

> [!TIP]
> The project comes already configured for [Volta](https://volta.sh/) version manager, which automatically uses the correct Node and PNPM versions for you.

## Common Tasks

- Install dependencies: `pnpm install`
- Run tests: `pnpm test`
- Build the project: `pnpm build`
- Start development server: `pnpm start -C ./project/path`

## Code Style

- All the code must be formatted using [oxfmt](https://www.npmjs.com/package/oxfmt).
- All the code must pass the [oxlint](https://www.npmjs.com/package/oxlint) checks.
- Use strong typing whenever possible.
- Always write unit tests for any contribution.
- Document public API with [TSDoc](https://tsdoc.org/) comments, including classes, interfaces, methods and public fields.

> [!TIP]
> The project is already configured for VSCode so it will automatically format and lint code.

## Branching Strategy

This project follows [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow).

- Any contribution should be done via pull request.
- Pull request titles must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification always indicating the scope.
- All checks must pass before the pull request can be merged.
- Pull request must be merged by running the [release](.github/workflows/release.yml) workflow.

### Commit messages

- You don't need to use a specific convention for commit messages. However, all of them will be squashed into a single commit using the pull request title.

## Documentation

- Use [GitHub Flavored Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) to document the project.
- Navigation between markdown files must be relative so it works locally, on GitHub and on the published site.
- Avoid using HTML tags.
- Documentation site is compiled using a custom [Vite](https://vitejs.dev/) plugin and published on [GitHub Pages](https://pages.github.com/).
- Diagrams must be created using [draw.io](https://www.drawio.com/) and stored as `.drawio.svg` files.
- Run the documentation site locally with `pnpm start -C ./packages/docs`.
