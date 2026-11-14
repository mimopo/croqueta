# Framework comparison benchmark

Four small projects implement the same product catalog. Their dependencies and lockfiles stay inside their own folders; the repository's main package manifest, pnpm workspace and lockfile are not used to install app dependencies.

The [shared catalog specification](./spec.md) defines behavior and expected results. All apps use the same deterministic product generator, utilities, stylesheet, browser hook and static server.

## Stacks under comparison

| App | Framework and routing | Global favorites state | Build and language |
|---|---|---|---|
| Croqueta | Current repository source, via Vite alias; Croqueta Router | Croqueta Store from the repository source | Vite 8.3.8, TypeScript 6.0.3 |
| Vue | Vue 3.5.45, Vue Router 5.5.1 | Pinia 4.1.0 | Vite 8.3.8, TypeScript 6.0.3 |
| Angular | Angular 22.2.6, Angular Router | NgRx Store 22.0.1 | Angular CLI/build 22.2.7, TypeScript 6.0.3 |
| React | React 19.3.1, React Router 8.5.1 | Redux Toolkit 2.14.0 + React Redux 9.3.1 | Vite 8.3.8, TypeScript 6.0.3 |

Angular has built-in signals for reactive component state, but this benchmark uses NgRx Store for the **shared global** favorites state. NgRx is an external dependency and its bytes count toward the Angular stack. Croqueta resolves `@mimopo/croqueta` directly to `packages/framework/src/index.ts`; each build therefore uses the repository's current source without copying or publishing it. Its `signal-polyfill` runtime dependency is installed in the isolated app.

Forms use native HTML and the same shared validation function in all four apps. This keeps form rules equal while comparing routers and global state solutions. No CSS/component library or network API is included.

## Requirements and installation

- Node.js 24 or newer.
- npm.
- Playwright Chromium for the browser runner.

If Chromium is already installed on the machine, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path instead of downloading Playwright's bundled browser.

Install the runner's dependencies once:

```sh
cd benchmarks/framework-comparison
npm ci
npx playwright install chromium
```

Install and build each app independently. Each folder has its own `package-lock.json`:

```sh
cd apps/croqueta && npm ci && npm run build
cd ../vue && npm ci && npm run build
cd ../angular && npm ci && npm run build
cd ../react && npm ci && npm run build
```

Croqueta's Vite alias reads the live files under `packages/framework/src` every time it starts or builds. You do not need to publish Croqueta or copy its source to test repository changes. The app's own lockfile pins Vite, TypeScript and `signal-polyfill`; the repository lockfile is not modified.

## Run a production build

Build each app using the command above, then start its static preview server from that app directory:

```sh
npm run preview
```

The shared server serves compressed Brotli/gzip assets, disables caching for repeatable cold loads, and falls back to `index.html` for client-side routes. Run one app at a time on `http://127.0.0.1:4173`.

## Measure assets

From the repository root, pass built output directories. Every JavaScript and CSS file is reported separately as raw, gzip and Brotli bytes:

```sh
node benchmarks/framework-comparison/measure-assets.mjs \
  benchmarks/framework-comparison/apps/croqueta/dist \
  benchmarks/framework-comparison/apps/vue/dist \
  benchmarks/framework-comparison/apps/angular/dist/angular/browser \
  benchmarks/framework-comparison/apps/react/dist
```

This reports **all emitted JS/CSS**, not only the initial route bundle. Use browser transfer measurements for initial and scenario downloads.

## Measure browser behavior

From the repository root with one app's preview server running:

```sh
node benchmarks/framework-comparison/browser.mjs \
  --url http://127.0.0.1:4173 \
  --name croqueta \
  --iterations 10 \
  --scenario search-10000 \
  --scenario filter-1000 \
  --output benchmarks/framework-comparison/results/croqueta.json
```

Run each scenario set for each app on the same machine and browser; do not run apps concurrently. The runner records navigation timing, LCP when available, actual compressed resource transfers, optional interaction results and page errors.

Summarize a run with median and p75:

```sh
node benchmarks/framework-comparison/summarize.mjs \
  benchmarks/framework-comparison/results/croqueta.json \
  benchmarks/framework-comparison/results/croqueta-summary.json
```

## Shared hook and scenarios

Each application imports the common browser hook, exposes `window.__frameworkComparison.ready()` and implements `runScenario(name)`. The hook prepares the named dataset, resets state and performs the same user interaction through the UI. It measures from immediately before the action until the expected DOM result is present. It throws if an assertion fails; the runner writes the raw JSON and exits non-zero when a requested scenario fails, a page errors, or a response is unsuccessful.

Scenario names and expected values are listed in [spec.md](./spec.md): search at 100/1,000/10,000 records, filter, sort, paginate, favorites navigation and invalid/valid form submission. Keep the raw JSON results with the comparison record. Include exact versions, app commit, browser and Node versions, OS/CPU, production build, cache/network policy, dataset and run date.
