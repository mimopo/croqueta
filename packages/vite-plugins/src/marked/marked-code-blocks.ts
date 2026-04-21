import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { join } from 'node:path';

import type { MarkedExtension, Tokens } from 'marked';
import { format } from 'oxfmt';
import { codeToHtml } from 'shiki';

interface PluginOptions {
  theme: string;
}

const oxfmtConfig = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../.oxfmtrc.json'), 'utf-8'));

async function convertCodeBlockSimple(token: Tokens.Code | Tokens.Generic, theme: string): Promise<string> {
  const html = await codeToHtml(token.text, { lang: token.lang || 'text', theme });
  return `
      <croqueta-code-group>
        <div slot="${token.lang}">${html}</div>
      </croqueta-code-group>
    `;
}

async function convertCodeBlock(token: Tokens.Code | Tokens.Generic, theme: string): Promise<string> {
  if (token.lang !== 'typescript' && token.lang !== 'ts') {
    // Regular highlighting for non-TS blocks
    return convertCodeBlockSimple(token, theme);
  }

  try {
    // Strip types natively and format with oxfmt
    const jsCode = await format('example.js', stripTypeScriptTypes(token.text).trim(), oxfmtConfig);
    if (jsCode.errors.length > 0) {
      throw new Error('Failed to strip types');
    }
    // Highlight both versions
    const tsHtml = await codeToHtml(token.text, { lang: 'ts', theme });
    const jsHtml = await codeToHtml(jsCode.code, { lang: 'js', theme });
    // Return the Tabbed UI structure
    return `
      <croqueta-code-group>
        <div slot="ts">${tsHtml}</div>
        <div slot="js">${jsHtml}</div>
      </croqueta-code-group>
    `;
  } catch {
    // Fallback if type stripping fails (e.g., non-erasable syntax like Enums)
    return convertCodeBlockSimple(token, theme);
  }
}

/**
 * Marked extension to convert markdown code blocks to HTML with TS/JS tabs. Internal usage only.
 * @param options - Configuration options for the extension
 * @returns A Marked extension
 */
export const markedCodeBlocks = (options: PluginOptions): MarkedExtension => {
  return {
    async: true,
    async walkTokens(token) {
      if (token.type === 'code' && token.lang !== 'mermaid') {
        const html = await convertCodeBlock(token, options.theme);
        Object.assign(token, {
          type: 'html',
          block: true,
          text: `${html}\n`,
        });
      }
    },
  };
};
