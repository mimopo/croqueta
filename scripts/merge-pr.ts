/**
 * Merge the current release pull request and export its confirmed merge commit for release creation.
 *
 * Usage: node scripts/merge-pr.ts
 * Run from the repository root on the release branch after publishing packages and
 * committing/pushing the version bump. Requires authenticated gh, GH_REPO in owner/name
 * format, and GITHUB_OUTPUT pointing to the GitHub Actions step-output file.
 *
 * Pins the merge to the published local HEAD, retries transient base-branch changes,
 * and deletes the merged branch without changing the local checkout. Writes
 * sha=<merge_commit> to GITHUB_OUTPUT only after GitHub confirms the PR is merged.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';

const repository = process.env.GH_REPO;
const output = process.env.GITHUB_OUTPUT;
if (!repository || !output) {
  throw new Error('GH_REPO and GITHUB_OUTPUT must be set');
}

const prNumber = execFileSync('gh', ['pr', 'view', '--json', 'number', '--jq', '.number'], { encoding: 'utf8' }).trim();
// Keep this commit fixed across retries: a newer PR head has not been published by this run.
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

// A successful merge command may only enqueue a PR; release creation needs the actual merge commit.
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
// Appending preserves any other outputs already written by this GitHub Actions step.
appendFileSync(output, `sha=${mergeSha}\n`);
