import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

import { Marked } from 'marked';
import type { PluginOption, ResolvedConfig } from 'vite';

import { markedAlerts } from './marked/marked-alerts.ts';
import { markedCodeBlocks } from './marked/marked-code-blocks.ts';
import { markedDrawio } from './marked/marked-drawio.ts';
import { markedLinks } from './marked/marked-link.ts';
import { Logger } from './utils/logger.ts';
import { readJsonFile } from './utils/read-json-file.ts';

const ROOT = resolve(import.meta.dirname, '../../../');
const VERSION = readJsonFile<{ version: string }>(resolve(ROOT, 'package.json')).version;
const OUTPUT_PREFIX = 'docs/';

interface DocsPluginOptions {
  layout: string;
  theme: string;
  repository: string;
  nav: string;
}

const transformUrl = (url: string) => {
  let u = url.split('?')[0] || '/';
  if (u.startsWith('/')) {
    u = u.slice(1);
  }
  if (u.endsWith('.html')) {
    return u;
  }
  if (u.endsWith('/')) {
    u = u.slice(0, -1);
  }
  return u + '/index.html';
};

/**
 * A Vite plugin to generate documentation from markdown files. Internal usage only.
 * @param options - Configuration options for the plugin.
 * @returns A Vite plugin.
 */
export function docsPlugin(options: DocsPluginOptions): PluginOption {
  let layout = readFileSync(options.layout, 'utf-8');
  let nav = readJsonFile<{ label: string; path: string }[]>(options.nav);
  const markdownFiles: Record<string, { outputFile: string; inputFile: string }> = {};
  let config: ResolvedConfig;
  let logger: Logger;

  const addMarkdownFile = (id: string) => {
    const relativePath = relative(ROOT, id);
    const outputFile = OUTPUT_PREFIX + relativePath.replace(/\.md$/, '.html').replace('README.html', 'index.html');
    if (!markdownFiles[outputFile]) {
      markdownFiles[outputFile] = { outputFile, inputFile: resolve(config.root, id) };
    }
    return outputFile;
  };

  const render = async (outputName: string) => {
    const entry = markdownFiles[outputName];
    if (!entry) return null;
    const marked = new Marked(
      markedAlerts(),
      markedCodeBlocks({
        theme: options.theme,
      }),
      markedLinks({
        currentUrl: entry.outputFile.slice(OUTPUT_PREFIX.length),
        repository: options.repository,
      }),
      markedDrawio({
        currentFile: entry.inputFile,
      })
    );
    const raw = readFileSync(entry.inputFile, 'utf-8');
    const html = await marked.parse(raw);
    const title = raw.match(/# (.*)/)?.[1] || 'Croqueta';
    const dir = dirname(outputName);
    const logoUrl = relative(dir, 'docs/croqueta.webp');

    return layout
      .replaceAll('{{version}}', VERSION)
      .replaceAll('{{title}}', title)
      .replaceAll('{{content}}', html)
      .replaceAll('{{baseUrl}}', config.base)
      .replaceAll('{{logoUrl}}', logoUrl)
      .replaceAll(
        '{{nav}}',
        `<ul>${nav
          .map((e) => {
            const active = e.path === dirname(outputName) ? 'aria-current="page"' : '';
            return `<li>
              <a href="${config.base}${e.path}" ${active}>
                ${e.label}
              </a>
            </li>`;
          })
          .join('')}
        </ul>`
      );
  };

  return {
    name: 'mimopo-markdown',
    enforce: 'pre',
    configResolved(_config) {
      config = _config;
      logger = new Logger({ logger: _config.logger, prefix: 'docs' });
      const input = _config.build.rolldownOptions.input;
      let files: string[] = [];
      if (Array.isArray(input)) {
        files = input;
      } else if (typeof input === 'object') {
        files = Object.values(input);
      } else if (typeof input === 'string') {
        files = [input];
      }
      files.forEach((file) => {
        if (file.endsWith('.md')) {
          addMarkdownFile(file);
        }
      });
    },
    resolveId(id) {
      if (id.endsWith('.md')) {
        return addMarkdownFile(id);
      }
      return null;
    },
    handleHotUpdate({ file, server }) {
      if (file === options.layout) {
        layout = readFileSync(options.layout, 'utf-8');
      }
      if (file === options.nav) {
        nav = readJsonFile(options.nav);
      }
      if (file.endsWith('.md') || file === options.layout || file === options.nav) {
        logger.pageReload(file);
        server.hot.send({
          type: 'full-reload',
          path: '*',
        });
      }
    },
    async load(id) {
      return render(id);
    },
    configureServer(server) {
      server.watcher.add(Object.values(markdownFiles).map((e) => e.inputFile));
      server.watcher.add(options.layout);
      server.watcher.add(options.nav);
      server.middlewares.use((req, res, next) => {
        if (req.url === config.base.slice(0, -1)) {
          res.statusCode = 301;
          res.setHeader('Location', config.base);
          res.end();
          return;
        }

        if (req.url === undefined) return next();
        const url = transformUrl(req.url.slice(config.base.length - 1));
        if (!markdownFiles[url]) {
          return next();
        }
        logger.info(`${req.url} -> ${markdownFiles[url].inputFile}`);
        render(url)
          .then((html) => {
            if (!html) {
              throw new Error('No html found');
            }
            return server.transformIndexHtml(url, html);
          })
          .then((html) => {
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
          })
          .catch((error) => {
            logger.error(`${req.url} error processing file`, error);
            next();
          });
      });
    },
  };
}
