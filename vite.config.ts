import { defineConfig } from 'vite-plus';

import oxlintConfig1 from './.oxlintrc.ts';

export default defineConfig({
  fmt: {
    ignorePatterns: ['**/.git', '**/node_modules', '**/dist', '*.hbs', '**/package-lock.json'],
    trailingComma: 'es5',
    tabWidth: 2,
    semi: true,
    singleQuote: true,
    printWidth: 140,
    sortImports: {},
  },
  lint: {
    extends: [oxlintConfig1],
    ignorePatterns: oxlintConfig1.ignorePatterns,
    options: {
      typeCheck: true,
    },
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
  },
});
