import { dirname, resolve } from 'node:path';

import type { MarkedExtension } from 'marked';

interface PluginOptions {
  repository: string;
  currentUrl: string;
}

/**
 * Marked extension to convert links ending with ?github to github links. Internal usage only.
 * @param options - Configuration options for the extension
 * @returns A Marked extension
 */
export const markedLinks = ({ currentUrl, repository }: PluginOptions): MarkedExtension => {
  return {
    walkTokens(token) {
      if (token.type === 'link' && token.href.startsWith('.') && token.href.endsWith('?github')) {
        const dir = dirname(`/${repository}/blob/main/${currentUrl}`);
        token.href = 'https://github.com' + resolve(dir, token.href.slice(0, -7));
      }
    },
  };
};
