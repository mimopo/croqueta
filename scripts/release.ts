import { execFileSync } from 'node:child_process';

import pkg from '../package.json' with { type: 'json' };

const target = process.argv[2];
if (!target) {
  throw new Error('Expected the merged commit SHA as the release target');
}

execFileSync('gh', ['release', 'create', pkg.version, '--target', target, '--generate-notes'], { stdio: 'inherit' });
