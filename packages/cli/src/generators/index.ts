import type { NodePlopAPI } from 'plop';

import { isDev } from '../utils/app.ts';
import aiAgentSkills from './ai-agent-skills/index.ts';
import component from './component/index.ts';
import example from './example/index.ts';
import service from './service/index.ts';
import test from './test/index.ts';

export function getGenerators(plop: NodePlopAPI) {
  const generators = [
    { name: 'ai-agent-skills', generator: aiAgentSkills(plop) },
    { name: 'component', generator: component(plop) },
    { name: 'service', generator: service(plop) },
    { name: 'test', generator: test(plop) },
  ];
  if (isDev) {
    generators.push({ name: 'example', generator: example(plop) });
  }
  return generators;
}
