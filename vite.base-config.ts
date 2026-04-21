import { type ViteUserConfig } from 'vitest/config';

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
