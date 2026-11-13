import { execFileSync } from 'node:child_process';

import pkg from '../package.json' with { type: 'json' };

execFileSync('gh', ['release', 'create', pkg.version, '--generate-notes'], { stdio: 'inherit' });
