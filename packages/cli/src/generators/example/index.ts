import { type NodePlopAPI, type PlopGeneratorConfig } from 'plop';

import { create } from '../../utils/create.ts';

export default function (plop: NodePlopAPI): Partial<PlopGeneratorConfig> {
  return create(plop, {
    description: 'generate an example application',
    prompts: [],
    files: [
      {
        type: 'add',
        path: 'examples/{{kebabCase name}}/package.json',
        templateFile: 'generators/example/templates/package.json.hbs',
      },
      {
        type: 'add',
        path: 'examples/{{kebabCase name}}/vite.config.ts',
        templateFile: 'generators/example/templates/vite.config.ts.hbs',
      },
      {
        type: 'add',
        path: 'examples/{{kebabCase name}}/index.html',
        templateFile: 'generators/example/templates/index.html.hbs',
      },
      {
        type: 'add',
        path: 'examples/{{kebabCase name}}/styles.css',
        templateFile: 'generators/example/templates/styles.css.hbs',
      },
      {
        type: 'add',
        path: 'examples/{{kebabCase name}}/tsconfig.json',
        templateFile: 'generators/example/templates/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: 'examples/{{kebabCase name}}/tsconfig.test.json',
        templateFile: 'generators/example/templates/tsconfig.test.json.hbs',
      },
      {
        type: 'add',
        path: 'examples/{{kebabCase name}}/src/app.component.ts',
        templateFile: 'generators/example/templates/app.component.ts.hbs',
      },
      {
        type: 'add',
        path: 'examples/{{kebabCase name}}/src/main.ts',
        templateFile: 'generators/example/templates/main.ts.hbs',
      },
    ],
  });
}
