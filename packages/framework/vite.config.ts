import { readFileSync } from 'node:fs';

import { copyPackage } from '@mimopo/vite-plugins';
import { defineConfig } from 'vite-plus';

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
  pack: {
    entry,
    outDir: '../../dist/framework',
    clean: true,
    format: ['esm'],
    platform: 'browser',
    target: 'baseline-widely-available',
    dts: true,
    sourcemap: true,
    minify: true,
    outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
    deps: {
      alwaysBundle: ['signal-polyfill'],
      onlyBundle: ['signal-polyfill'],
      dts: { neverBundle: ['signal-polyfill'] },
    },
    copy: ['README.md'],
    hooks: {
      'build:done': ({ options }) => {
        copyPackage('package.json', `${options.outDir}/package.json`, {
          private: false,
          module: './index.mjs',
          typings: './index.d.ts',
          exports,
        });
      },
    },
    outputOptions: {
      sourcemapPathTransform: (relativeSourcePath) => relativeSourcePath.replace(/^.*src\//, 'mimopo/croqueta/'),
    },
  },
});
