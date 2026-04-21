import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { type Commit, CommitParser } from 'conventional-commits-parser';

const parser = new CommitParser({
  headerPattern: /^(\w*)(?:\((.*)\))?(!?): (.*)$/,
  headerCorrespondence: ['type', 'scope', 'breaking', 'subject'],
});

function getBump() {
  const input = readFileSync(0, 'utf8');

  if (!input.trim()) {
    throw new Error('No input received via stdin');
  }

  const parsed: Commit & { breaking?: boolean } = parser.parse(input);

  let bump: 'major' | 'minor' | 'patch' = 'patch';

  const hasBreakingNote = parsed.notes.some((note) => note.title === 'BREAKING CHANGE' || note.title === 'BREAKING-CHANGE');
  const hasBreakingExclamation = parsed.breaking;

  if (hasBreakingNote || hasBreakingExclamation) {
    bump = 'major';
  } else if (parsed.type === 'feat') {
    bump = 'minor';
  }

  return bump;
}

try {
  const bump = getBump();
  execSync(`npm version ${bump} --no-commit-hooks --no-git-tag-version`, { stdio: 'inherit' });
} catch (e) {
  console.error(e);
  process.exit(1);
}
