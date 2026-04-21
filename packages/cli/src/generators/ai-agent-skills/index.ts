import type { NodePlopAPI, PlopGeneratorConfig } from 'plop';

import { isDev, version } from '../../utils/app.ts';

export default function (plop: NodePlopAPI): Partial<PlopGeneratorConfig> {
  const description = 'Create AI agent skill files (see https://agentskills.io/ for more information)';
  return {
    description,
    prompts: [
      {
        type: 'confirm',
        name: 'update',
        message: 'update existing files when existing',
        default: false,
      },
    ],
    actions: (answers) => {
      return plop
        .getGeneratorList()
        .filter((generator) => generator.description !== description)
        .map(({ name }) => {
          const generator = plop.getGenerator(name);
          return {
            type: 'add',
            path: `.agent/skills/croqueta-${name}/SKILL.md`,
            templateFile: 'generators/ai-agent-skills/skill.md.hbs',
            data: {
              ...generator,
              version,
              isDev,
            },
            force: answers?.update ?? false,
          };
        });
    },
  };
}
