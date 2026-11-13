import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { CommitParser } from 'conventional-commits-parser';

const input = readFileSync(0, 'utf8');
if (!input.trim()) {
  throw new Error('No input received via stdin');
}

const parser = new CommitParser({
  headerPattern: /^(\w*)(?:\((.*)\))?(!?): (.*)$/,
  headerCorrespondence: ['type', 'scope', 'breaking', 'subject'],
});
const parsed = parser.parse(input);
const breaking =
  parsed.breaking === '!' || parsed.notes.some((note) => note.title === 'BREAKING CHANGE' || note.title === 'BREAKING-CHANGE');
const bump = breaking ? 'major' : parsed.type === 'feat' ? 'minor' : 'patch';

execFileSync('pnpm', ['version', bump, '--no-commit-hooks', '--no-git-tag-version'], { stdio: 'inherit' });
