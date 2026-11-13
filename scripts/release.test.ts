/**
 * Verify native Node/Vite Task execution and the release command's version, target, and failures.
 *
 * Usage: pnpm exec vp test run scripts/release.test.ts
 * Runs the actual script entry points with a temporary fake gh executable on PATH.
 * The fake records command arguments and returns controlled responses; no real PRs
 * are merged or releases published. Temporary fixtures are removed after each test.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, expect, test } from 'vite-plus/test';

import pkg from '../package.json' with { type: 'json' };

type GhResponse = { stdout?: string; stderr?: string; status?: number };

const root = fileURLToPath(new URL('../', import.meta.url));
const mergeSha = 'a'.repeat(40);
const fixtures: string[] = [];

// Put a response-driven fake gh first on PATH so child processes cannot call the real GitHub CLI.
function fixture(responses: GhResponse[]) {
  const directory = mkdtempSync(join(tmpdir(), 'croqueta-release-'));
  fixtures.push(directory);
  const output = join(directory, 'output');
  const callsFile = join(directory, 'calls.json');
  const responsesFile = join(directory, 'responses.json');
  writeFileSync(output, '');
  writeFileSync(callsFile, '[]');
  writeFileSync(responsesFile, JSON.stringify(responses));
  writeFileSync(
    join(directory, 'gh'),
    `#!/usr/bin/env node
const fs = require('node:fs');
const calls = JSON.parse(fs.readFileSync(process.env.RELEASE_TEST_CALLS, 'utf8'));
calls.push(process.argv.slice(2));
fs.writeFileSync(process.env.RELEASE_TEST_CALLS, JSON.stringify(calls));
const responses = JSON.parse(fs.readFileSync(process.env.RELEASE_TEST_RESPONSES, 'utf8'));
const response = responses.shift();
fs.writeFileSync(process.env.RELEASE_TEST_RESPONSES, JSON.stringify(responses));
if (!response) process.exit(99);
process.stdout.write(response.stdout ?? '');
process.stderr.write(response.stderr ?? '');
process.exit(response.status ?? 0);
`,
    { mode: 0o755 }
  );
  const env = {
    ...process.env,
    PATH: `${directory}${delimiter}${process.env.PATH}`,
    GH_REPO: 'mimopo/croqueta',
    GITHUB_OUTPUT: output,
    RELEASE_TEST_CALLS: callsFile,
    RELEASE_TEST_RESPONSES: responsesFile,
  };
  return {
    env,
    calls: () => JSON.parse(readFileSync(callsFile, 'utf8')) as string[][],
  };
}

afterEach(() => {
  for (const directory of fixtures.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('the Vite Task release command uses the package version and exact merge SHA', () => {
  const f = fixture([{}]);
  const result = spawnSync('pnpm', ['exec', 'vp', 'run', 'gh-release', mergeSha], {
    cwd: root,
    env: { ...f.env, npm_package_version: '999.0.0' },
    encoding: 'utf8',
  });
  expect(result.status).toBe(0);
  expect(f.calls()).toEqual([['release', 'create', pkg.version, '--target', mergeSha, '--generate-notes']]);
});

test('native Node executes the TypeScript merge script and exports its confirmed target', () => {
  const f = fixture([{ stdout: '12' }, { stdout: 'Merged' }, { stdout: mergeSha }]);
  const result = spawnSync(process.execPath, ['scripts/merge-pr.ts'], { cwd: root, env: f.env, encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(readFileSync(f.env.GITHUB_OUTPUT, 'utf8')).toBe(`sha=${mergeSha}\n`);
  expect(f.calls()[1]).toContain('--match-head-commit');
});

test('release requires a confirmed target and propagates GitHub CLI failures', () => {
  const f = fixture([{ status: 1, stderr: 'Release creation failed' }]);
  const withoutTarget = spawnSync(process.execPath, ['scripts/release.ts'], { cwd: root, env: f.env });
  expect(withoutTarget.status).not.toBe(0);
  expect(f.calls()).toHaveLength(0);
  const failure = spawnSync(process.execPath, ['scripts/release.ts', mergeSha], { cwd: root, env: f.env });
  expect(failure.status).not.toBe(0);
  expect(f.calls()).toHaveLength(1);
});
