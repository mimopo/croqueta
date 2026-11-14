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
| Client-side routing | Included: Croqueta Router | Optional: Vue Router | Included: Angular Router | Optional: choose and name a router |
| Shared state | Included: Croqueta State | Optional: store solution | Optional: Signals or store library | Optional: Context or a store library |
| Forms and validation | To verify | To verify chosen setup | Included forms APIs; validation strategy to document | To verify chosen setup |
| Lazy loading | Included: router supports lazy loading | To verify chosen setup | Included in router/toolchain | To verify chosen setup |
| SSR / static generation | To verify | Available in ecosystem; name setup | Supported by Angular toolchain | Depends on chosen framework/toolchain |
| Web Components interoperability | Native Custom Elements | To verify | To verify | To verify |
| Build tooling | Vite-based repo; app setup to document | Name and pin | Angular CLI | Name and pin |
| Testing | Vitest in this repository | Name and pin | Name and pin | Name and pin |
| Bundle and browser performance | Measure with shared benchmark | Measure with shared benchmark | Measure with shared benchmark | Measure with shared benchmark |

Croqueta entries reflect this repository's README and examples. Mark a capability **Included** only when it is part of the core or documented official tooling; a third-party package belongs under **Optional**. Replace each “To verify” with an audited answer or “not provided” before treating the table as complete.

## Benchmark application

Build the same small product catalog for each stack, with identical behavior, visual output, data, CSS, assets and acceptance criteria:

- List, detail, search, category filter, sort and pagination.
- A form with required fields, validation, success and error states.
- Deterministic local datasets of 100, 1,000 and 10,000 records.
- The same browser, viewport and production build conditions.

The shared application contract is documented in [`spec.md`](https://github.com/mimopo/croqueta/blob/main/benchmarks/framework-comparison/spec.md); all four implementations should use the same product fixture from [`products.mjs`](https://github.com/mimopo/croqueta/blob/main/benchmarks/framework-comparison/products.mjs). The companion harness in [`benchmarks/framework-comparison`](https://github.com/mimopo/croqueta/tree/main/benchmarks/framework-comparison) measures browser resource transfers and navigation timing, captures LCP when available, and can call a shared hook for interaction scenarios. The asset tool reports raw, gzip and Brotli sizes per built JS/CSS file. These tools are infrastructure only; measured results should be added after equivalent applications exist.

## Fair measurement rules

1. Pin framework, runtime, build-tool and benchmark-tool versions. Record commit, lockfile, OS, CPU, browser version and run date.
2. Use production builds. State cache policy and separate cold from warm navigation.
3. Keep non-framework dependencies and behavior equivalent. Publish each implementation's dependency list.
4. Run at least 10 independent page loads per stack; report median and p75 and retain raw JSON.
5. Report initial browser transfers separately from all emitted build files and from assets loaded during scenarios. Never call all output chunks the initial bundle.
6. Use identical interactions and datasets. Report time-to-update separately from page load.
7. Explain missing or non-equivalent features; do not generalize from one app.

See the companion benchmark README for installation, the shared hook and commands. This first phase prepares the protocol and tools; the next phase will implement the app in each framework and publish measurements.
