import { globSync } from 'node:fs';

import { assetsPlugin, docsPlugin } from '@mimopo/vite-plugins';
import { defineConfig } from 'vite';

import { viteBaseConfig } from '../../vite.base-config';

const rootDir = '../../';
const markdownFiles = [`${rootDir}README.md`, ...globSync('../framework/**/*.md'), ...globSync('../cli/**/*.md')];

export default defineConfig({
  ...viteBaseConfig,
  base: '/croqueta',
  plugins: [
    docsPlugin({ layout: 'layout.html', theme: 'github-dark', repository: 'mimopo/croqueta', nav: 'nav.json' }),
    assetsPlugin({ files: [{ input: '../../croqueta.webp', output: 'docs/croqueta.webp' }] }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true, // https://github.com/picocss/pico/issues/717
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',
    outDir: '../../dist/docs',
    emptyOutDir: true,
    rolldownOptions: {
      input: [...markdownFiles, 'index.html'],
    },
  },
});
