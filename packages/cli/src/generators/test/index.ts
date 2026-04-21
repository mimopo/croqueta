import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { type NodePlopAPI, type PlopGeneratorConfig } from 'plop';

export default function (plop: NodePlopAPI): Partial<PlopGeneratorConfig> {
  return {
    description: 'generate a test file for an existing component or service',
    prompts: [
      {
        type: 'input',
        name: 'file',
        message: 'file to be tested',
        validate: (value: string) => {
          if (!value) return 'file is required';
          const filePath = resolve(process.cwd(), value);
          if (!existsSync(filePath)) return `file not found: ${value}`;
          return true;
        },
      },
    ],
    actions: (data) => {
      if (!data?.file) {
        throw new Error('file is required');
      }
      const filePath = resolve(process.cwd(), data.file);
      const content = readFileSync(filePath, 'utf-8');

      const isComponent = filePath.endsWith('.component.ts') || content.includes('extends Component');
      const isService = filePath.endsWith('.service.ts') || content.includes('implements Destroy');

      if (!isComponent && !isService) {
        throw new Error('Could not detect if it is a component or a service.');
      }

      const destBase = plop.getDestBasePath();
      const relativePath = relative(destBase, filePath);

      // Remove extension and common suffixes to get the "logical name"
      // e.g. packages/core/src/components/button/button.component.ts -> packages/core/src/components/button/button
      // e.g. packages/core/src/services/auth.service.ts -> packages/core/src/services/auth
      let name = relativePath
        .replace(/\.component\.ts$/, '')
        .replace(/\.service\.ts$/, '')
        .replace(/\.ts$/, '')
        .replace(/\.ts$/, '');

      if (isComponent) {
        return [
          {
            type: 'add',
            path: '{{pathCase name}}.component.test.ts',
            templateFile: 'generators/component/component.test.ts.hbs',
            data: { name },
          },
        ];
      } else {
        return [
          {
            type: 'add',
            path: '{{pathCase name}}.service.test.ts',
            templateFile: 'generators/service/service.test.ts.hbs',
            data: { name },
          },
        ];
      }
    },
  };
}
