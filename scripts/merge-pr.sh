#!/usr/bin/env bash
set -euo pipefail

: "${GH_REPO:?GH_REPO must identify the release repository}"
: "${GITHUB_OUTPUT:?GITHUB_OUTPUT must be set}"

pr_number=$(gh pr view --json number --jq '.number')
published_head=$(git rev-parse HEAD)

for attempt in 1 2 3 4 5; do
  # --repo keeps --delete-branch from checking out the local base branch.
  if merge_output=$(gh pr merge "$pr_number" --repo "$GH_REPO" --squash \
    --delete-branch --match-head-commit "$published_head" 2>&1); then
    echo "$merge_output"
    break
  fi

  echo "$merge_output" >&2
  if [[ "$merge_output" != *"Base branch was modified"* || "$attempt" == 5 ]]; then
    exit 1
  fi

  echo "GitHub is recalculating the base branch; retrying merge ($attempt/5)..."
  sleep 5
done

for attempt in 1 2 3 4 5; do
  merge_sha=$(gh pr view "$pr_number" --repo "$GH_REPO" --json state,mergeCommit \
    --jq 'if .state == "MERGED" then .mergeCommit.oid // empty else empty end')
  if [[ -n "$merge_sha" ]]; then
    echo "sha=$merge_sha" >> "$GITHUB_OUTPUT"
    exit 0
  fi

  if [[ "$attempt" != 5 ]]; then
    sleep 5
  fi
done

echo "The pull request has no confirmed merge commit; refusing to create a release." >&2
exit 1
