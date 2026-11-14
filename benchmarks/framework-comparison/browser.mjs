#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

function readArgs(args) {
  const parsed = { iterations: 10, scenarios: [] };
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (key === '--scenario') parsed.scenarios.push(args[++i]);
    else if (key.startsWith('--')) parsed[key.slice(2)] = args[++i];
  }
  return parsed;
}

const options = readArgs(process.argv.slice(2));
if (!options.url || !options.name || !options.output) {
  console.error('Usage: node browser.mjs --url <url> --name <stack> --output <file> [--iterations 10] [--scenario <name>]');
  process.exit(2);
}
options.iterations = Number(options.iterations);
if (!Number.isInteger(options.iterations) || options.iterations < 1) {
  console.error('--iterations must be a positive integer');
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const runs = [];
try {
  for (let index = 0; index < options.iterations; index += 1) {
    const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.addInitScript(() => {
      window.__comparisonLcp = null;
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length) window.__comparisonLcp = entries.at(-1).startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // LCP is unavailable in this browser; record null.
      }
    });
    const response = await page.goto(options.url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      await window.__frameworkComparison?.ready?.();
    });

    const navigation = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      const scripts = resources.filter((item) => /\\.m?js(?:\\?|$)/i.test(item.name));
      const styles = resources.filter((item) => /\\.css(?:\\?|$)/i.test(item.name));
      return {
        domContentLoadedMs: nav?.domContentLoadedEventEnd ?? null,
        loadMs: nav?.loadEventEnd ?? null,
        responseStartMs: nav?.responseStart ?? null,
        lcpMs: window.__comparisonLcp,
        documentTransferBytes: nav?.transferSize ?? null,
        resourceTransferBytes: resources.reduce((sum, item) => sum + (item.transferSize || 0), 0),
        encodedResourceBytes: resources.reduce((sum, item) => sum + (item.encodedBodySize || 0), 0),
        resourceCount: resources.length,
        jsTransferBytes: scripts.reduce((sum, item) => sum + (item.transferSize || 0), 0),
        cssTransferBytes: styles.reduce((sum, item) => sum + (item.transferSize || 0), 0),
        heapUsedBytes: performance.memory?.usedJSHeapSize ?? null,
      };
    });

    const scenarios = {};
    for (const name of options.scenarios) {
      scenarios[name] = await page.evaluate(async (scenarioName) => {
        const api = window.__frameworkComparison;
        if (typeof api?.runScenario !== 'function') return { available: false };
        try {
          const result = await api.runScenario(scenarioName);
          return { available: true, ...result };
        } catch (error) {
          return { available: true, error: String(error) };
        }
      }, name);
    }

    runs.push({
      iteration: index + 1,
      status: response?.status() ?? null,
      navigation,
      scenarios,
      pageErrors,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const result = {
  name: options.name,
  url: options.url,
  capturedAt: new Date().toISOString(),
  browser: 'Playwright Chromium',
  viewport: { width: 1365, height: 768 },
  iterations: runs,
};
const output = resolve(options.output);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(result, null, 2) + '\\n');
console.log('Wrote', output);
