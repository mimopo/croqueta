/**
 * Select and apply the repository's next semantic version from a Conventional Commit title or message.
 *
 * Usage (from the repository root):
 *   printf 'fix(core): repair release\n' | node scripts/bump.ts
 *
 * Reads the message from stdin. Breaking changes select major, features select minor,
 * and other changes select patch. Runs pnpm version to update package.json without
 * creating a Git commit or tag. Used by the release workflow's Version bump step.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { CommitParser } from 'conventional-commits-parser';

const input = readFileSync(0, 'utf8');
if (!input.trim()) {
  throw new Error('No input received via stdin');
}

// Capture the optional ! marker separately so breaking headers work with or without a scope.
const parser = new CommitParser({
  headerPattern: /^(\w*)(?:\((.*)\))?(!?): (.*)$/,
  headerCorrespondence: ['type', 'scope', 'breaking', 'subject'],
});
const parsed = parser.parse(input);
// Breaking changes take priority over the commit type, including breaking-change footers.
const breaking =
  parsed.breaking === '!' || parsed.notes.some((note) => note.title === 'BREAKING CHANGE' || note.title === 'BREAKING-CHANGE');
const bump = breaking ? 'major' : parsed.type === 'feat' ? 'minor' : 'patch';

execFileSync('pnpm', ['version', bump, '--no-commit-hooks', '--no-git-tag-version'], { stdio: 'inherit' });
