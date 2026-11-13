import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';

const repository = process.env.GH_REPO;
const output = process.env.GITHUB_OUTPUT;
if (!repository || !output) {
  throw new Error('GH_REPO and GITHUB_OUTPUT must be set');
}

const prNumber = execFileSync('gh', ['pr', 'view', '--json', 'number', '--jq', '.number'], { encoding: 'utf8' }).trim();
const publishedHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    // --repo keeps --delete-branch from checking out the local base branch.
    const result = execFileSync(
      'gh',
      ['pr', 'merge', prNumber, '--repo', repository, '--squash', '--delete-branch', '--match-head-commit', publishedHead],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    console.log(result.trim());
    break;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('Base branch was modified') || attempt === 5) {
      throw error;
    }
    console.error(message);
    console.log(`GitHub is recalculating the base branch; retrying merge (${attempt}/5)...`);
    await setTimeout(5000);
  }
}

let mergeSha = '';
for (let attempt = 1; attempt <= 5; attempt++) {
  mergeSha = execFileSync(
    'gh',
    [
      'pr',
      'view',
      prNumber,
      '--repo',
      repository,
      '--json',
      'state,mergeCommit',
      '--jq',
      'if .state == "MERGED" then .mergeCommit.oid // empty else empty end',
    ],
    { encoding: 'utf8' }
  ).trim();
  if (mergeSha) break;
  if (attempt < 5) await setTimeout(5000);
}

if (!mergeSha) {
  throw new Error('The pull request has no confirmed merge commit; refusing to create a release.');
}
appendFileSync(output, `sha=${mergeSha}\n`);
