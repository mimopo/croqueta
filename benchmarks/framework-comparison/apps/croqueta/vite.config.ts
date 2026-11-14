import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
const frameworkEntry = fileURLToPath(new URL('../../../../packages/framework/src/index.ts', import.meta.url));
const signalPolyfill = require.resolve('signal-polyfill');

export default defineConfig({
  resolve: {
    alias: [
      { find: '@mimopo/croqueta', replacement: frameworkEntry },
      { find: 'signal-polyfill', replacement: signalPolyfill },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
