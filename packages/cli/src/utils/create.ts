import { existsSync } from 'node:fs';
import { EOL } from 'node:os';
import { resolve } from 'node:path';

import { type AddActionConfig, type NodePlopAPI, type PlopGeneratorConfig } from 'plop';

import { green, red, yellow } from './format.ts';

interface AddConfig {
  description: string;
  prompts: any[];
  files: AddActionConfig[];
  tests?: AddActionConfig[];
}

function dryRun(plop: NodePlopAPI, actions: AddActionConfig[], answers: any) {
  console.log(yellow('Dry run, no operations were performed!'));
  let error = false;
  actions.forEach((action) => {
    const path = resolve(plop.getDestBasePath(), plop.renderString(action.path, answers));
    try {
      if (existsSync(path)) {
        throw new Error(`File already exists`);
      }
      console.log(green('✔'), green('++'), path);
    } catch (e: any) {
      error = true;
      console.log(e);
      console.log(red('✖'), green('++'), `${e.message ?? e} ${EOL} -> ${path}`);
    }
  });
  if (error) {
    process.exit(1);
  }
  return [];
}

export function create(plop: NodePlopAPI, config: AddConfig): Partial<PlopGeneratorConfig> {
  const testPrompt = config.tests?.length ? [{ type: 'confirm', name: 'tests', message: 'generate tests or not', default: true }] : [];
  return {
    description: config.description,
    prompts: [
      { type: 'input', name: 'name', message: 'name', validate: (value) => value.trim() !== '' },
      ...config.prompts,
      ...testPrompt,
      {
        type: 'confirm',
        name: 'dry-run',
        message: 'dry run, when true no files will be created',
        default: true,
      },
    ],
    actions: (answers) => {
      const actions: AddActionConfig[] = [...config.files];
      if (config.tests && answers?.tests) {
        actions.push(...config.tests);
      }
      if (answers?.['dry-run']) {
        return dryRun(plop, actions, answers);
      }
      return actions;
    },
  };
}
