# Framework comparison benchmark

This directory contains the first version of a common measurement harness for Croqueta, Vue, Angular and React. It does not include framework implementations or claim results yet.

## Requirements

- Node.js 24 or newer.
- npm.
- Playwright Chromium.

Install the isolated harness dependencies and browser:

```sh
cd benchmarks/framework-comparison
npm install
npx playwright install chromium
```

## Measure built assets

From the repository root, pass one or more build output directories. Every JavaScript and CSS file is reported separately as raw, gzip and Brotli bytes:

```sh
node benchmarks/framework-comparison/measure-assets.mjs dist/croqueta dist/vue dist/angular dist/react
```

The output is JSON on stdout. This is **all emitted JS/CSS**, not the initial route bundle. Use browser transfer measurements for initial and scenario downloads.

## Measure a running application

Start each production app locally, then run from the repository root:

```sh
node benchmarks/framework-comparison/browser.mjs \
  --url http://127.0.0.1:4173 \
  --name croqueta \
  --iterations 10 \
  --output benchmarks/framework-comparison/results/croqueta.json
```

Repeat for each stack on the same machine and browser; do not run stacks concurrently. The runner records navigation timing, LCP (when emitted), browser resource transfer sizes and optional interaction scenarios.

## Shared hook contract

Each implementation may expose this before the page is considered ready:

```js
window.__frameworkComparison = {
  async ready() {},
  async runScenario(name) {
    // Perform the same deterministic interaction and return duration in ms.
    return { durationMs: 12.3 };
  }
};
```

The runner calls `ready()`, then invokes `runScenario` for each `--scenario <name>`. Missing hooks are recorded as unavailable and do not fail page-load measurement.

## Scenarios to implement

1. `search-100`, `search-1000`, `search-10000`: search by a fixed query and wait until matching rows render.
2. `filter-1000`: apply a category filter.
3. `sort-1000`: sort by a fixed field.
4. `paginate-1000`: move to the next page.
5. `form-validation`: submit an invalid form and confirm the same feedback.

Each scenario resets state before timing, starts timing immediately before the action and ends after the expected DOM result is visible. Use identical records and markup density.

## Results

Keep raw result files with the comparison documentation. Include framework and tool versions, app commit, browser version, machine, dataset, build mode, cache policy and run date. Report median and p75 across independent runs. Browser transfer size is network transfer when the server exposes it; the asset tool gives reproducible compressed file sizes. Do not compare one stack's full chunk output to another stack's initial route download.
