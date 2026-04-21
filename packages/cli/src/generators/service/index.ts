import type { NodePlopAPI, PlopGeneratorConfig } from 'plop';

import { create } from '../../utils/create.ts';

export default function (plop: NodePlopAPI): Partial<PlopGeneratorConfig> {
  return create(plop, {
    description: 'create a service',
    prompts: [],
    files: [
      {
        type: 'add',
        path: '{{pathCase name}}.service.ts',
        templateFile: 'generators/service/service.ts.hbs',
      },
    ],
    tests: [
      {
        type: 'add',
        path: '{{pathCase name}}.service.test.ts',
        templateFile: 'generators/service/service.test.ts.hbs',
      },
    ],
  });
}
