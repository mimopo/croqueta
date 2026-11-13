import { defineConfig } from 'vite-plus';

import { viteBaseConfig } from '../../vite.base-config';

export default defineConfig({
  ...viteBaseConfig,
  build: {
    outDir: '../../dist/examples/state',
    emptyOutDir: true,
  },
});
