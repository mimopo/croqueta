import type { PluginOption, ResolvedConfig } from 'vite';

import { copyPackage } from './utils/copy-package.ts';
import { Logger } from './utils/logger.ts';

interface CopyPackagePluginOptions {
  source?: string;
  destination?: string;
  override?: Record<string, unknown>;
}

/**
 * A Vite plugin to copy the package.json file to the output directory. Internal usage only.
 * @param config - Configuration options for the plugin.
 * @returns A Vite plugin.
 */
export function copyPackagePlugin(settings?: CopyPackagePluginOptions): PluginOption {
  let config: ResolvedConfig;
  let logger: Logger;

  return {
    name: 'mimopo-copy-package-json',
    apply: 'build',
    configResolved(_config) {
      config = _config;
      logger = new Logger({ logger: _config.logger, prefix: 'copy-package' });
    },
    writeBundle() {
      const source = settings?.source ?? 'package.json';
      const outDir = config.build.outDir;
      const destination = settings?.destination ?? `${outDir}/package.json`;
      try {
        copyPackage(source, destination, settings?.override);
        logger.info(`copied ${source} -> ${destination}`);
      } catch (error) {
        logger.error('failed to copy package.json', error);
      }
    },
  };
}
