import type { MarkedExtension, Tokens } from 'marked';

/**
 * Marked extension to convert markdown alerts to HTML. Internal usage only.
 * @returns A Marked extension
 */
export const markedAlerts = (): MarkedExtension => {
  return {
    renderer: {
      blockquote(token: Tokens.Blockquote) {
        const quote = token.text;
        const match = quote.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](\n)?/);
        if (match) {
          const type = match[1].toLowerCase();
          const content = this.parser.parse(token.tokens).replace(match[0], '');
          return `
          <blockquote class="blockquote-${type}">
            <div class="blockquote-title">${match[1]}</div>
              ${content}
          </blockquote>
          `;
        }
        return `<blockquote>${this.parser.parse(token.tokens)}</blockquote>`;
      },
    },
  };
};
