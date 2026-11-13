/**
 * Verify semantic-version selection and error handling for the version-bump script.
 *
 * Usage: pnpm exec vp test run scripts/bump.test.ts
 * Tests the real Conventional Commit parser while mocking stdin and the pnpm command,
 * so patch/minor/major decisions can be checked without changing the project version.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { beforeEach, expect, test, vi } from 'vite-plus/test';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn<typeof execFileSync>() }));
vi.mock('node:fs', () => ({ readFileSync: vi.fn<typeof readFileSync>() }));

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

test.each([
  ['fix(core): repair release', 'patch'],
  ['chore(docs): update contributing guide', 'patch'],
  ['feat(core): add a signal helper', 'minor'],
  ['feat(core)!: change the public API', 'major'],
  ['fix!: remove a public API', 'major'],
  ['fix(core): change API\n\nBREAKING CHANGE: incompatible signature', 'major'],
  ['feat(core): change API\n\nBREAKING-CHANGE: incompatible signature', 'major'],
])('selects the correct bump for %s', async (input, bump) => {
  vi.mocked(readFileSync).mockReturnValue(input);
  await import('./bump.ts');
  expect(readFileSync).toHaveBeenCalledExactlyOnceWith(0, 'utf8');
  expect(execFileSync).toHaveBeenCalledExactlyOnceWith('pnpm', ['version', bump, '--no-commit-hooks', '--no-git-tag-version'], {
    stdio: 'inherit',
  });
});

test.each(['', '  \n'])('refuses empty input without changing the version', async (input) => {
  vi.mocked(readFileSync).mockReturnValue(input);
  await expect(import('./bump.ts')).rejects.toThrow('No input received');
  expect(execFileSync).not.toHaveBeenCalled();
});

test('propagates a failed version bump', async () => {
  vi.mocked(readFileSync).mockReturnValue('fix(core): repair release');
  vi.mocked(execFileSync).mockImplementation(() => {
    throw new Error('pnpm version failed');
  });
  await expect(import('./bump.ts')).rejects.toThrow('pnpm version failed');
});
