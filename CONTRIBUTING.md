# Contributing

This is a monorepo based on Vite+ for Croqueta Framework development.

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

- Install the [Vite+ global CLI](https://viteplus.dev/guide/global-cli#install) and open a new terminal.
- Run `vp env install` from the repository root to install the pinned Node.js and pnpm versions.
- Install dependencies using `vp install`.

> [!TIP]
> Vite+ reads Node.js from `.node-version` and uses pnpm as declared in `package.json#packageManager`. Package operations go through `vp`; pnpm remains the underlying package manager.

## Common Tasks

- Install dependencies: `vp install`
- Add a dependency to a package: `vp add --filter ./packages/framework <package>`
- Add a development dependency at the workspace root: `vp add -D -w <package>`
- Remove a dependency: `vp remove --filter ./packages/framework <package>`
- Check formatting, lint and types: `vp check`
- Format code: `vp fmt`
- Run tests: `vp run test`
- Build the project: `vp run build`
- Start development server: `vp run --filter ./project/path dev`

`vp run test` and `vp run build` execute the root scripts across the workspace. Built-in `vp test` and `vp build` run the tool directly and do not execute those scripts.

The root scripts use Vite Task to orchestrate workspace packages. The framework build uses `vp pack` to produce its JavaScript bundles and TypeScript declarations. Builds enable task caching with `vp run -r --cache build`, including TypeScript checks and generated files. Tests run without task caching. To cache a single package build, use `vp run --cache --filter ./packages/docs build`. The task cache is local; the dependency cache configured in GitHub Actions does not persist task results between workflow runs.

The root `examples-router` and `examples-state` scripts also work in StackBlitz. In WebContainers, they first install dependencies with the pinned pnpm version because the preinstalled pnpm does not support workspace catalogs. `.stackblitzrc` disables the incompatible automatic installation. The scripts start the installed Vite core directly, without loading the native Vite+ CLI or the shared test configuration. StackBlitz links select an example with `startScript=examples-router` or `startScript=examples-state` and select the editor file with `file=examples/<example>/src/main.ts`.

## Code Style

- The repository uses [Vite+](https://viteplus.dev/) with pnpm for development, builds, tests, linting and formatting.
- All the code must be formatted using Oxfmt through `vp fmt`.
- All the code must pass the Oxlint checks through `vp lint`.
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

### Merge and release from the command line

With [GitHub CLI](https://cli.github.com/) installed and authenticated, run the release workflow from the pull request's branch:

```bash
pr_branch=$(gh pr view --json headRefName --jq '.headRefName') &&
gh workflow run release.yml --ref "$pr_branch" &&
gh run watch --exit-status
```

`gh pr view` selects the pull request associated with your current branch. To select a specific pull request, use `gh pr view <pr_number>` in the first command instead.

Alternatively, specify the branch explicitly:

```bash
gh workflow run release.yml --ref "<branch_name>" && gh run watch --exit-status
```

When prompted by `gh run watch`, select the release workflow execution you just started. `--exit-status` returns a non-zero exit code if that execution fails.

The workflow validates the project, bumps its version, builds and publishes the packages, merges the pull request, creates the GitHub release, and deploys the documentation.

### Commit messages

- You don't need to use a specific convention for commit messages. However, all of them will be squashed into a single commit using the pull request title.

## Documentation

- Use [GitHub Flavored Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) to document the project.
- Navigation between markdown files must be relative so it works locally, on GitHub and on the published site.
- Avoid using HTML tags.
- Documentation site is compiled using a custom [Vite](https://vitejs.dev/) plugin and published on [GitHub Pages](https://pages.github.com/).
- Diagrams must be created using [draw.io](https://www.drawio.com/) and stored as `.drawio.svg` files.
- Run the documentation site locally with `vp run --filter ./packages/docs dev`.
