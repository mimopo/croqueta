import { type ViteUserConfig } from 'vite-plus';

export const viteBaseConfig: ViteUserConfig = {
  test: {
    setupFiles: [`${import.meta.dirname}/vitest.setup.ts`],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    environment: 'jsdom',
    sequence: {
      shuffle: true,
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: `${import.meta.dirname}/coverage`,
    },
  },
};
