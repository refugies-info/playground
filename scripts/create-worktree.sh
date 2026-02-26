#!/usr/bin/env bash
# Creates a git worktree with env files, shared resources, and deps installed.
# Delegates to the bare-repo-worktrees skill script for the heavy lifting.
#
# Usage:
#   pnpm worktree luis/ri-XXXX-description
#   # or directly:
#   bash scripts/create-worktree.sh luis/ri-XXXX-description
set -euo pipefail

SKILL_SCRIPT="$HOME/.letta/skills/bare-repo-worktrees/scripts/new-worktree.sh"
BRANCH_NAME="${1:?Usage: create-worktree.sh <branch-name>}"

if [[ ! -f "$SKILL_SCRIPT" ]]; then
  echo "Error: bare-repo-worktrees skill not installed at $SKILL_SCRIPT" >&2
  echo "Install it via Letta Code: /skill bare-repo-worktrees" >&2
  exit 1
fi

# Navigate to workspace root (bare repo root containing .git pointer file)
WORKSPACE="$(cd "$(git rev-parse --git-common-dir)/.." && pwd)"
cd "$WORKSPACE"

# Delegate to skill — creates worktree, symlinks .envs/, installs deps
bash "$SKILL_SCRIPT" "$BRANCH_NAME" main
