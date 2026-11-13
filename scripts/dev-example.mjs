import { fileURLToPath } from 'node:url';

// StackBlitz cannot load the native Vite+ CLI; the core supports WebContainers via WASM.
// oxlint-disable-next-line vite-plus/prefer-vite-plus-imports
import { createServer } from 'vite';

const example = process.argv[2];
if (example !== 'router' && example !== 'state') {
  throw new Error('Expected an example name: router or state');
}

const server = await createServer({
  root: fileURLToPath(new URL(`../examples/${example}/`, import.meta.url)),
  configFile: false,
  server: { host: true },
});

await server.listen();
server.printUrls();
server.bindCLIShortcuts({ print: true });
