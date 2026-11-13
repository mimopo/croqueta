/**
 * Verify the release merge's retry policy, published-head protection, and merge-SHA output.
 *
 * Usage: pnpm exec vp test run scripts/merge-pr.test.ts
 * Mocks GitHub CLI commands, output-file writes, and retry delays to exercise transient
 * failures, permanent failures, and delayed merge confirmation without touching GitHub.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';

import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn<typeof execFileSync>() }));
vi.mock('node:fs', () => ({ appendFileSync: vi.fn<typeof appendFileSync>() }));
vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn<typeof setTimeout>() }));

const head = 'b'.repeat(40);
const mergeSha = 'a'.repeat(40);
const command = vi.mocked(execFileSync);

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  vi.stubEnv('GH_REPO', 'mimopo/croqueta');
  vi.stubEnv('GITHUB_OUTPUT', '/tmp/croqueta-merge-output');
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  command.mockReturnValueOnce('12\n').mockReturnValueOnce(`${head}\n`);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

test('retries the stale base without changing the published head or local checkout', async () => {
  command
    .mockImplementationOnce(() => {
      throw new Error('Base branch was modified');
    })
    .mockReturnValueOnce('Merged')
    .mockReturnValueOnce(`${mergeSha}\n`);
  await import('./merge-pr.ts');
  const expected = ['pr', 'merge', '12', '--repo', 'mimopo/croqueta', '--squash', '--delete-branch', '--match-head-commit', head];
  expect(command.mock.calls.slice(2, 4).map((call) => call[1])).toEqual([expected, expected]);
  expect(setTimeout).toHaveBeenCalledExactlyOnceWith(5000);
  expect(appendFileSync).toHaveBeenCalledExactlyOnceWith('/tmp/croqueta-merge-output', `sha=${mergeSha}\n`);
});

test.each(['Head branch was modified', 'Pull request is not mergeable', 'Resource not accessible by integration'])(
  'does not retry a permanent failure: %s',
  async (message) => {
    command.mockImplementationOnce(() => {
      throw new Error(message);
    });
    await expect(import('./merge-pr.ts')).rejects.toThrow(message);
    expect(command).toHaveBeenCalledTimes(3);
    expect(setTimeout).not.toHaveBeenCalled();
    expect(appendFileSync).not.toHaveBeenCalled();
  }
);

test('stops after five stale-base failures', async () => {
  command.mockImplementation(() => {
    throw new Error('Base branch was modified');
  });
  await expect(import('./merge-pr.ts')).rejects.toThrow('Base branch was modified');
  expect(command).toHaveBeenCalledTimes(7);
  expect(setTimeout).toHaveBeenCalledTimes(4);
  expect(appendFileSync).not.toHaveBeenCalled();
});

test('waits for GitHub to report the confirmed merge SHA', async () => {
  command.mockReturnValueOnce('Merged').mockReturnValueOnce('').mockReturnValueOnce(mergeSha);
  await import('./merge-pr.ts');
  expect(setTimeout).toHaveBeenCalledExactlyOnceWith(5000);
  expect(appendFileSync).toHaveBeenCalledExactlyOnceWith('/tmp/croqueta-merge-output', `sha=${mergeSha}\n`);
});

test('refuses to produce a release target for a queued or unconfirmed merge', async () => {
  command.mockReturnValueOnce('Queued').mockReturnValue('');
  await expect(import('./merge-pr.ts')).rejects.toThrow('no confirmed merge commit');
  expect(setTimeout).toHaveBeenCalledTimes(4);
  expect(appendFileSync).not.toHaveBeenCalled();
});

test.each(['GH_REPO', 'GITHUB_OUTPUT'])('requires %s before executing commands', async (name) => {
  vi.stubEnv(name, '');
  await expect(import('./merge-pr.ts')).rejects.toThrow('must be set');
  expect(command).not.toHaveBeenCalled();
});
