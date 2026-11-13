/**
 * Create the GitHub release for the current package.json version at a confirmed merge commit.
 *
 * Usage (from the repository root):
 *   node scripts/release.ts <merged_commit_sha>
 *   vp run gh-release <merged_commit_sha>
 *
 * Requires authenticated gh with permission to create releases in this repository.
 * The release workflow supplies the SHA exported by Merge PR. GitHub creates the tag
 * at that commit and generates release notes; the version is read from package.json.
 */
import { execFileSync } from 'node:child_process';

import pkg from '../package.json' with { type: 'json' };

const target = process.argv[2];
if (!target) {
  throw new Error('Expected the merged commit SHA as the release target');
}

// Pass explicit arguments so neither the version nor target depends on shell expansion or the default branch.
execFileSync('gh', ['release', 'create', pkg.version, '--target', target, '--generate-notes'], { stdio: 'inherit' });
