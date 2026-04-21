import { type NodePlopAPI, type PlopGeneratorConfig } from 'plop';

import { create } from '../../utils/create.ts';

export default function (plop: NodePlopAPI): Partial<PlopGeneratorConfig> {
  return create(plop, {
    description: 'create a component',
    prompts: [
      {
        type: 'input',
        name: 'prefix',
        message: 'component tag prefix',
        default: 'app',
        validate: (value: string) => /^[a-zA-Z]/.test(value.charAt(0)),
      },
    ],
    files: [
      {
        type: 'add',
        path: '{{pathCase name}}.component.ts',
        templateFile: 'generators/component/component.ts.hbs',
      },
    ],
    tests: [
      {
        type: 'add',
        path: '{{pathCase name}}.component.test.ts',
        templateFile: 'generators/component/component.test.ts.hbs',
      },
    ],
  });
}
