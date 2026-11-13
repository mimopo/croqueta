import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import pkg from '../package.json' with { type: 'json' };

const example = process.argv[2];
if (example !== 'router' && example !== 'state') {
  throw new Error('Expected an example name: router or state');
}

const root = new URL('../', import.meta.url);
if (process.versions.webcontainer) {
  // StackBlitz ships pnpm 8, which cannot resolve the workspace catalogs.
  execFileSync('npx', ['--yes', pkg.packageManager, 'install', '--frozen-lockfile'], {
    cwd: fileURLToPath(root),
    stdio: 'inherit',
  });
}

// Avoid the native Vite+ CLI and use the core's WebContainer WASM fallback.
// oxlint-disable-next-line vite-plus/prefer-vite-plus-imports
const { createServer } = await import('vite');
const server = await createServer({
  root: fileURLToPath(new URL(`../examples/${example}/`, import.meta.url)),
  configFile: false,
  server: { host: true },
});

await server.listen();
server.printUrls();
server.bindCLIShortcuts({ print: true });
