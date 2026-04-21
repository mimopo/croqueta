import { EOL } from 'node:os';

import type { NodePlopAPI } from 'plop';

import { getGenerators } from './generators/index.ts';
import { welcome } from './utils/app.ts';

export default async function (plop: NodePlopAPI) {
  plop.setWelcomeMessage(`${welcome}${EOL}`);
  plop.setHelper('pathCase', (text: string) => {
    const kebabCase = plop.getHelper('kebabCase');
    const path = text.split('/');
    const componentName = kebabCase(path.pop());
    return [...path, componentName].join('/');
  });
  plop.setHelper('className', (text: string) => {
    const pascalCase = plop.getHelper('pascalCase');
    return pascalCase(text.split('/').pop());
  });
  plop.setHelper('fileName', (text: string) => {
    const kebabCase = plop.getHelper('kebabCase');
    return kebabCase(text.split('/').pop());
  });
  for (const { name, generator } of getGenerators(plop)) {
    plop.setGenerator(name, generator);
  }
}
