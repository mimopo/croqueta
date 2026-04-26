import { globSync } from 'node:fs';
import { builtinModules } from 'node:module';

import { assetsPlugin, copyPackagePlugin } from '@mimopo/vite-plugins';
import { defineConfig } from 'vitest/config';

import { viteBaseConfig } from '../../vite.base-config';
import pkg from './package.json';

const hbsFiles = globSync('src/generators/**/*.hbs').map((file) => ({
  input: file,
  output: file.replace('src/', ''),
}));

export default defineConfig({
  ...viteBaseConfig,
  plugins: [
    copyPackagePlugin({
      override: {
        private: false,
        module: './index.mjs',
        typings: './index.d.ts',
        exports: {
          '.': './index.mjs',
        },
        bin: {
          cocreta: './index.mjs',
          croqueta: './index.mjs',
        },
        engines: {
          node: '>= 24.0.0',
        },
      },
    }),
    assetsPlugin({
      files: ['README.md', ...hbsFiles],
    }),
    {
      name: 'fix-json-imports',
      renderChunk(code) {
        return code.replace(/import\s+(.*?)\s+from\s+(['"]\.\/package\.json['"])/g, 'import $1 from $2 with { type: "json" }');
      },
    },
  ],
  build: {
    emptyOutDir: true,
    outDir: '../../dist/cli',
    lib: {
      entry: {
        index: './src/index.ts',
        plopfile: './src/plopfile.ts',
      },
      fileName: '[name]',
      formats: ['es'],
    },
    rolldownOptions: {
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`), ...Object.keys(pkg.dependencies || {}), /package\.json$/],
      output: {
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name].mjs',
        assetFileNames: '[name].[ext]',
        paths: (id: string) => {
          if (id.endsWith('package.json')) return './package.json';
          return id;
        },
        banner: `
          import { createRequire as __createRequire } from 'node:module';
          const require = __createRequire(import.meta.url);
          const __dirname = import.meta.dirname;
          const __filename = import.meta.filename;
        `,
      },
    },
    target: 'node24',
    minify: 'oxc',
  },
});
