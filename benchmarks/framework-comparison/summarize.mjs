#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg) {
  console.error('Usage: node summarize.mjs <browser-result.json> [summary.json]');
  process.exit(2);
}

const inputPath = resolve(inputArg);
const report = JSON.parse(await readFile(inputPath, 'utf8'));
const runs = report.iterations ?? [];

function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function summarize(values) {
  const numbers = values.filter((value) => typeof value === 'number' && Number.isFinite(value));
  return {
    samples: numbers.length,
    median: percentile(numbers, 0.5),
    p75: percentile(numbers, 0.75),
  };
}

const navigationKeys = [
  'domContentLoadedMs',
  'loadMs',
  'responseStartMs',
  'lcpMs',
  'documentTransferBytes',
  'resourceTransferBytes',
  'encodedResourceBytes',
  'jsTransferBytes',
  'cssTransferBytes',
  'heapUsedBytes',
];
const navigation = Object.fromEntries(navigationKeys.map((key) => [
  key,
  summarize(runs.map((run) => run.navigation?.[key])),
]));

const scenarioNames = [...new Set(runs.flatMap((run) => Object.keys(run.scenarios ?? {})))];
const scenarios = Object.fromEntries(scenarioNames.map((name) => [
  name,
  summarize(runs.map((run) => run.scenarios?.[name]?.durationMs)),
]));

const summary = {
  name: report.name,
  source: inputArg,
  browser: report.browser,
  viewport: report.viewport,
  iterationCount: runs.length,
  navigation,
  scenarios,
  pageErrorCount: runs.reduce((sum, run) => sum + (run.pageErrors?.length ?? 0), 0),
};
const outputPath = outputArg ? resolve(outputArg) : null;
const json = JSON.stringify(summary, null, 2) + '\n';
if (outputPath) {
  await import('node:fs/promises').then(({ mkdir }) => mkdir(dirname(outputPath), { recursive: true }));
  await writeFile(outputPath, json);
}
console.log(json);
