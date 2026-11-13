/**
 * Verify example selection, WebContainer dependency installation, and development-server startup.
 *
 * Usage: pnpm exec vp test run scripts/dev-example.test.ts
 * Mocks Vite and child processes so tests can check installation order and failures
 * without downloading dependencies or opening a server. Restores process arguments
 * and WebContainer detection after each test.
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import type { InlineConfig } from 'vite-plus';
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test';

import pkg from '../package.json' with { type: 'json' };

const mocks = vi.hoisted(() => {
  const server = {
    listen: vi.fn<() => Promise<void>>(),
    printUrls: vi.fn<() => void>(),
    bindCLIShortcuts: vi.fn<(options: { print: boolean }) => void>(),
  };
  return { server, createServer: vi.fn<(config: InlineConfig) => Promise<typeof server>>() };
});
vi.mock('node:child_process', () => ({ execFileSync: vi.fn<typeof execFileSync>() }));
vi.mock('vite', () => ({ createServer: mocks.createServer }));

const originalArgv = process.argv;
const webcontainerDescriptor = Object.getOwnPropertyDescriptor(process.versions, 'webcontainer');

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  process.argv = ['node', 'scripts/dev-example.ts', 'router'];
  delete process.versions.webcontainer;
  mocks.createServer.mockResolvedValue(mocks.server);
  mocks.server.listen.mockResolvedValue(undefined);
});

afterEach(() => {
  process.argv = originalArgv;
  if (webcontainerDescriptor) Object.defineProperty(process.versions, 'webcontainer', webcontainerDescriptor);
  else delete process.versions.webcontainer;
});

test.each(['router', 'state'])('starts %s with the core and no test configuration', async (example) => {
  process.argv[2] = example;
  await import('./dev-example.ts');
  expect(execFileSync).not.toHaveBeenCalled();
  expect(mocks.createServer).toHaveBeenCalledExactlyOnceWith({
    root: fileURLToPath(new URL(`../examples/${example}/`, import.meta.url)),
    configFile: false,
    server: { host: true },
  });
  expect(mocks.server.listen).toHaveBeenCalledOnce();
  expect(mocks.server.printUrls).toHaveBeenCalledOnce();
  expect(mocks.server.bindCLIShortcuts).toHaveBeenCalledExactlyOnceWith({ print: true });
});

test('installs with the pinned pnpm before starting the WebContainer server', async () => {
  Object.defineProperty(process.versions, 'webcontainer', { value: 'test', configurable: true });
  await import('./dev-example.ts');
  expect(execFileSync).toHaveBeenCalledExactlyOnceWith('npx', ['--yes', pkg.packageManager, 'install', '--frozen-lockfile'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    stdio: 'inherit',
  });
  expect(vi.mocked(execFileSync).mock.invocationCallOrder[0]).toBeLessThan(mocks.createServer.mock.invocationCallOrder[0]);
});

test('does not start the server if dependency installation fails', async () => {
  Object.defineProperty(process.versions, 'webcontainer', { value: 'test', configurable: true });
  vi.mocked(execFileSync).mockImplementation(() => {
    throw new Error('Installation failed');
  });
  await expect(import('./dev-example.ts')).rejects.toThrow('Installation failed');
  expect(mocks.createServer).not.toHaveBeenCalled();
});

test.each([undefined, 'unknown'])('rejects an unsupported example: %s', async (example) => {
  process.argv = ['node', 'scripts/dev-example.ts', ...(example ? [example] : [])];
  await expect(import('./dev-example.ts')).rejects.toThrow('Expected an example name');
  expect(execFileSync).not.toHaveBeenCalled();
  expect(mocks.createServer).not.toHaveBeenCalled();
});

test('propagates a server startup failure', async () => {
  mocks.server.listen.mockRejectedValue(new Error('Port unavailable'));
  await expect(import('./dev-example.ts')).rejects.toThrow('Port unavailable');
  expect(mocks.server.printUrls).not.toHaveBeenCalled();
});
