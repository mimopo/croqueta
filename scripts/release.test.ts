import { execFileSync, spawnSync } from 'node:child_process';
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
  writeFileSync(join(directory, 'sleep'), '#!/usr/bin/env bash\nexit 0\n', { mode: 0o755 });
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
    output: () => readFileSync(output, 'utf8'),
    calls: () => JSON.parse(readFileSync(callsFile, 'utf8')) as string[][],
    merge: () => spawnSync('bash', ['scripts/merge-pr.sh'], { cwd: root, env, encoding: 'utf8' }),
  };
}

afterEach(() => {
  for (const directory of fixtures.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('retries a stale base while protecting the published head and avoiding local checkout', () => {
  const f = fixture([
    { stdout: '12' },
    { status: 1, stderr: 'GraphQL: Base branch was modified. Review and try the merge again. (mergePullRequest)' },
    { stdout: 'Merged' },
    { stdout: mergeSha },
  ]);
  const result = f.merge();
  expect(result.status).toBe(0);
  const expected = [
    'pr',
    'merge',
    '12',
    '--repo',
    'mimopo/croqueta',
    '--squash',
    '--delete-branch',
    '--match-head-commit',
    execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  ];
  expect(f.calls().slice(1, 3)).toEqual([expected, expected]);
  expect(f.output()).toBe(`sha=${mergeSha}\n`);
});

test.each(['Head branch was modified', 'Pull request is not mergeable', 'Resource not accessible by integration'])(
  'does not retry an unsafe or permanent merge failure: %s',
  (message) => {
    const f = fixture([{ stdout: '12' }, { status: 1, stderr: message }]);
    expect(f.merge().status).not.toBe(0);
    expect(f.calls()).toHaveLength(2);
    expect(f.output()).toBe('');
  }
);

test('limits stale-base retries and never emits a release target on failure', () => {
  const f = fixture([{ stdout: '12' }, ...Array.from({ length: 5 }, () => ({ status: 1, stderr: 'Base branch was modified' }))]);
  expect(f.merge().status).not.toBe(0);
  expect(f.calls()).toHaveLength(6);
  expect(f.output()).toBe('');
});

test('waits for the confirmed merge SHA after GitHub accepts the merge', () => {
  const f = fixture([{ stdout: '12' }, {}, {}, { stdout: mergeSha }]);
  expect(f.merge().status).toBe(0);
  expect(f.output()).toBe(`sha=${mergeSha}\n`);
});

test('does not release when merge success only queued the pull request', () => {
  const f = fixture([{ stdout: '12' }, {}, ...Array.from({ length: 5 }, () => ({}))]);
  expect(f.merge().status).not.toBe(0);
  expect(f.output()).toBe('');
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

test('release requires a confirmed target and propagates GitHub CLI failures', () => {
  const f = fixture([{ status: 1, stderr: 'Release creation failed' }]);
  const withoutTarget = spawnSync(process.execPath, ['scripts/release.ts'], { cwd: root, env: f.env });
  expect(withoutTarget.status).not.toBe(0);
  expect(f.calls()).toHaveLength(0);
  const failure = spawnSync(process.execPath, ['scripts/release.ts', mergeSha], { cwd: root, env: f.env });
  expect(failure.status).not.toBe(0);
  expect(f.calls()).toHaveLength(1);
});
