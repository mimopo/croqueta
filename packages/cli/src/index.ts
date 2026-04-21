#!/usr/bin/env node
import minimist from 'minimist';
import { Plop, run } from 'plop';

import { version, welcome } from './utils/app.ts';
import { bold, gray } from './utils/format.ts';

const args = process.argv.slice(2);
const argv = minimist(args);

Plop.on('run', () => console.log('run'));
Plop.prepare(
  {
    cwd: argv.cwd,
    configPath: `${import.meta.dirname}/plopfile.${import.meta.filename.endsWith('.ts') ? 'ts' : 'mjs'}`,
    preload: argv.preload || [],
    completion: argv.completion,
  },
  // https://plopjs.com/documentation/#setting-the-base-destination-path-for-the-wrapper
  (env1) => {
    Plop.execute(env1, async (env2) => {
      // HELP
      if (argv.help || argv.h) {
        console.log(`${welcome}
${bold('Usage:')}
  $ croqueta                 ${gray('Select from a list of available generators')}
  $ croqueta <name>          ${gray('Run a generator registered under that name')}
  $ croqueta <name> [input]  ${gray('Run the generator with input data to bypass prompts')}

${bold('Options:')}
  -h, --help             ${gray('Show this help display')}
  -v, --version          ${gray('Print current version')}
`);
        process.exit(0);
      }
      // VERSION
      if (argv.version || argv.v) {
        console.log(version);
        process.exit(0);
      }
      // PLOP
      await run({ ...env2, dest: process.cwd() } as any, undefined, true);
    });
  }
);
