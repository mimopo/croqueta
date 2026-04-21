import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { MarkedExtension } from 'marked';

interface PluginOptions {
  currentFile: string;
}

/**
 * Marked extension to convert links ending with ?github to github links. Internal usage only.
 * @param options - Configuration options for the extension
 * @returns A Marked extension
 */
export const markedDrawio = ({ currentFile }: PluginOptions): MarkedExtension => {
  return {
    renderer: {
      image(token) {
        const isDrawio = token.href.endsWith('.drawio.svg');
        if (isDrawio) {
          try {
            const filePath = resolve(dirname(currentFile) + '/' + token.href);
            let svgContent = readFileSync(filePath, 'utf-8');
            // Strip the draw.io metadata that contains the source code
            svgContent = svgContent.replace(/\scontent="[^"]*"/g, '');
            // Clean up any other non-visual metadata headers
            svgContent = svgContent.replace(/<\?xml.*\?>/g, '');
            svgContent = svgContent.replace(/<!DOCTYPE.*?>/g, '');
            // Wrapper with class to add styles
            return `<p class="diagram" title="${token.text}">${svgContent}</p>`;
          } catch (err: unknown) {
            console.warn(`[Croqueta CLI] Could not inline diagram: ${token.href}`, err);
          }
        }
        return `<img src="${token.href}" alt="${token.text}">`; // Fallback
      },
    },
  };
};
