import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import type { PluginOption, ResolvedConfig } from 'vite';

import { Logger } from './utils/logger.ts';

interface AssetsPluginOptions {
  files: (string | { input: string; output: string })[];
  output?: string;
}

/**
 * A Vite plugin to copy assets to the output directory. Internal usage only.
 * @param config - Configuration options for the plugin.
 * @returns A Vite plugin.
 */
export function assetsPlugin(settings: AssetsPluginOptions): PluginOption {
  let config: ResolvedConfig;
  let logger: Logger;
  return {
    name: 'mimopo-copy-assets',
    configResolved(_config) {
      config = _config;
      logger = new Logger({ logger: _config.logger, prefix: 'assets' });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (!url) {
          next();
          return;
        }
        const normalizedUrl = url.replace(config.base, '/');
        for (const file of settings.files) {
          const input = typeof file === 'string' ? file : file.input;
          const output = typeof file === 'string' ? file : file.output;
          const formattedOutput = output.startsWith('/') ? output : '/' + output;
          if (normalizedUrl === formattedOutput) {
            const sourceFile = resolve(config.root, input);
            if (existsSync(sourceFile)) {
              logger.info(`${normalizedUrl} -> ${sourceFile}`);
              const content = readFileSync(sourceFile);
              res.end(content);
              return;
            }
          }
        }
        next();
      });
    },
    async writeBundle() {
      const outDir = join(config.build.outDir, settings.output ?? '');
      const sourceDir = config.root;
      for (const file of settings.files) {
        const input = typeof file === 'string' ? file : file.input;
        const output = typeof file === 'string' ? file : file.output;
        const sourceFile = join(sourceDir, input);
        if (!existsSync(sourceFile)) {
          logger.warn(`not found: ${sourceFile}`);
          continue;
        }
        const destFile = resolve(outDir, output);
        const destDir = dirname(destFile);
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyFileSync(sourceFile, destFile);
        logger.info(`${sourceFile} -> ${destFile}`);
      }
    },
  };
}
