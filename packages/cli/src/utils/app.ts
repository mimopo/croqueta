import pkg from '../../package.json' with { type: 'json' };
import { bold, gray, green } from './format.ts';

export const version: string = pkg.version;

export const isDev: boolean = version === '0.0.0-dev';

export const welcome = `
${green('┌──────────────────────────────────────┐')}
${green('│')} ${bold('CROQUETA CLI')} ${gray(version.padStart(23, ' '))} ${green('│')}
${green('│')} Hot and tasty frontend framework     ${green('│')}
${green('└──────────────────────────────────────┘')}
`;
