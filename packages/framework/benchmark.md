# Framework comparison

This page starts a reproducible comparison of Croqueta, Vue, Angular and React. The matrix is a working inventory, not a ranking: confirm every cell against the exact versions and stack used before publishing conclusions.

## How to read the matrix

- **Included**: documented in framework core or official toolchain.
- **Optional**: available through a companion package or ecosystem choice; name that choice in the benchmark.
- **To verify**: not yet audited or implemented in this comparison. It does not mean unsupported.

React is a UI library, so its benchmark row must name the router, build tool, form solution and other packages used. Compare complete, pinned application stacks as well as framework cores.

| Capability | Croqueta | Vue | Angular | React |
|---|---|---|---|---|
| Component model | Included: native Custom Elements and `Component` | Included: component-based templates | Included: components | Included: function components |
| Reactive state | Included: signals | Included: reactivity system | Included: Signals | Included: state/hooks; broader model depends on stack |
| Dependency injection | Included | Optional / ecosystem choice | Included | Optional / ecosystem choice |
| Client-side routing | Included: Croqueta Router | Official Vue Router; used in app | Included: Angular Router | External React Router; used in app |
| Shared state | Included: Croqueta Store | Pinia (external; selected for app) | NgRx Store (external; selected for app); Angular Signals remain available for local state | Redux Toolkit + React Redux (external; selected for app) |
| Forms and validation | No form package; shared native HTML validation in benchmark | No form package; shared native HTML validation in benchmark | Angular has Forms APIs; shared native HTML validation used in benchmark | No form package; shared native HTML validation in benchmark |
| Lazy loading | Included: router supports lazy loading | Supported by Vue Router | Supported by Angular Router | Supported by React Router |
| SSR / static generation | Not part of this client-rendered benchmark; audit separately | Not part of this client-rendered benchmark; audit separately | Not part of this client-rendered benchmark; audit separately | Not part of this client-rendered benchmark; audit separately |
| Web Components interoperability | Native Custom Elements | To verify | To verify | To verify |
| Build tooling | Vite 8.3.8; source aliased to `packages/framework/src` | Vite 8.3.8 | Angular CLI/build 22.2.7 | Vite 8.3.8 |
| Testing | Vitest in repository; common Playwright runner | Common Playwright runner | Common Playwright runner | Common Playwright runner |
| Bundle and browser performance | Measure with shared benchmark | Measure with shared benchmark | Measure with shared benchmark | Measure with shared benchmark |

Croqueta entries reflect this repository's README and examples. The selected app stack uses Vue Router and Pinia for Vue, Angular Router and NgRx Store for Angular, and React Router plus Redux Toolkit/React Redux for React. Those packages are reported separately from each framework's core and included in stack-level size measurements. Angular provides built-in signals for local reactive state; NgRx Store is the selected external global store. Replace each “To verify” with an audited answer or “not provided” before treating the table as complete.

## Benchmark application

Build the same small product catalog for each stack, with identical behavior, visual output, data, CSS, assets and acceptance criteria:

- List, detail, search, category filter, sort and pagination.
- A form with required fields, validation, success and error states.
- Deterministic local datasets of 100, 1,000 and 10,000 records.
- The same browser, viewport and production build conditions.

The shared application contract is documented in [`spec.md`](https://github.com/mimopo/croqueta/blob/main/benchmarks/framework-comparison/spec.md); the four implementations live in [`apps/`](https://github.com/mimopo/croqueta/tree/main/benchmarks/framework-comparison/apps). The Croqueta app aliases the local framework source so repository changes are used directly. All apps share the product fixture, utilities, styles, runner and static server. The harness measures browser resource transfers and navigation timing, captures LCP when available, and runs the same interaction scenarios. The asset tool reports raw, gzip and Brotli sizes per built JS/CSS file. Results should be recorded only after the apps are built with their committed lockfiles.

## Fair measurement rules

1. Pin framework, runtime, build-tool and benchmark-tool versions. Record commit, lockfile, OS, CPU, browser version and run date.
2. Use production builds. State cache policy and separate cold from warm navigation.
3. Keep non-framework dependencies and behavior equivalent. Publish each implementation's dependency list.
4. Run at least 10 independent page loads per stack; report median and p75 and retain raw JSON.
5. Report initial browser transfers separately from all emitted build files and from assets loaded during scenarios. Never call all output chunks the initial bundle.
6. Use identical interactions and datasets. Report time-to-update separately from page load.
7. Explain missing or non-equivalent features; do not generalize from one app.

See the companion benchmark README for installation, the shared hook and commands. This first phase prepares the protocol and tools; the next phase will implement the app in each framework and publish measurements.
