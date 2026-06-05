#!/usr/bin/env bash
# Push this plugin to a NEW, empty GitHub repo.
# Usage: ./push-to-github.sh <git-remote-url> [branch]
# Example: ./push-to-github.sh https://github.com/colaberry/designer-skills.git main
set -euo pipefail

REPO_URL="${1:?Usage: ./push-to-github.sh <git-remote-url> [branch]}"
BRANCH="${2:-main}"

if [ -d .git ]; then
  echo "A .git folder already exists here. If you meant to add this to an EXISTING repo,"
  echo "use Option 2 in USAGE.md instead. Aborting to avoid clobbering history."
  exit 1
fi

git init -q
git add .
git commit -q -m "Add colaberry-frontend-revamp Claude Code plugin"
git branch -M "$BRANCH"
git remote add origin "$REPO_URL"
echo "Pushing to $REPO_URL ($BRANCH)…"
git push -u origin "$BRANCH"
echo "Done. View it at: ${REPO_URL%.git}"
