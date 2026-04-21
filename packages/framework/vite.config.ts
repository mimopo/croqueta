import { readFileSync } from 'node:fs';

import { assetsPlugin, copyPackagePlugin } from '@mimopo/vite-plugins';
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vitest/config';

import { viteBaseConfig } from '../../vite.base-config';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const exports: Record<string, { types: string; default: string }> = {};
const entry: Record<string, string> = {};
for (const key in packageJson.exports) {
  if (key === '.') {
    exports[key] = {
      types: './index.d.ts',
      default: './index.mjs',
    };
    entry['index'] = packageJson.exports[key];
  } else {
    exports[key] = {
      types: packageJson.exports[key].replace('./src/', './').replace('.ts', '.d.ts'),
      default: packageJson.exports[key].replace('./src/', './').replace('.ts', '.mjs'),
    };
    entry[key.replace('./', '')] = packageJson.exports[key];
  }
}

export default defineConfig({
  ...viteBaseConfig,
  plugins: [
    dts({
      bundleTypes: true,
      tsconfigPath: './tsconfig.json',
      compilerOptions: {
        rootDir: './src',
      },
    }),
    copyPackagePlugin({
      override: {
        module: './index.mjs',
        typings: './index.d.ts',
        exports,
      },
    }),
    assetsPlugin({
      files: ['README.md'],
    }),
  ],
  build: {
    emptyOutDir: true,
    outDir: '../../dist/framework',
    lib: {
      entry,
      formats: ['es'],
    },
    rolldownOptions: {
      external: [],
      output: {
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name].mjs',
        assetFileNames: '[name].[ext]',
        sourcemapPathTransform: (relativeSourcePath) => {
          return relativeSourcePath.replace(/^.*src\//, 'mimopo/croqueta/');
        },
      },
    },
    target: 'baseline-widely-available',
    sourcemap: true,
    minify: 'oxc',
  },
});
