# Working with Git Worktrees

This repository uses a **bare repo + worktree** setup to support parallel development — multiple branches can be checked out simultaneously, each in its own directory, without interfering with each other.

---

## Repository Layout

```
playground/
├── .git/           # Bare git data (cloned directly here)
├── .worktrees/     # Feature worktrees (hidden, managed by worktrunk)
│   ├── feat-my-feature/
│   └── fix-some-bug/
└── main/           # Main branch — source of truth for shared files
```

`main/` is a regular checkout of the `main` branch. **Never commit work directly to it** — it's a stable reference point. Create a worktree for every piece of work.

---

## Prerequisites

### 1. Worktrunk

Install [worktrunk](https://worktrunk.dev) — a CLI that makes worktrees as easy as branches:

```bash
# macOS (Homebrew)
brew install worktrunk && wt config shell install

# Linux / Windows / other — see https://worktrunk.dev for installation options
```

Shell integration is required for `wt switch` to change directories automatically.

### 2. Worktrunk user config

Configure worktrunk to place the `main` branch directly at `../main` and all other worktrees in the hidden `.worktrees/` directory:

```toml
# ~/.config/worktrunk/config.toml
[projects."github.com/refugies-info/playground"]
worktree-path = "{% if branch == 'main' %}../main{% else %}../.worktrees/{{ branch | sanitize }}{% endif %}"
```

The conditional ensures `main` lands as a top-level directory (not buried inside `.worktrees/main/`).

Create the file if it doesn't exist: `wt config create` then add the `[projects]` section above.

---

## Initial Clone

```bash
# 1. Create the workspace directory and bare clone into it
git clone --bare --single-branch git@github.com:refugies-info/playground.git playground/.git
cd playground

# 2. Create the main worktree (branch already exists after bare clone)
wt switch main

# 3. Install dependencies
cd main && pnpm install
```

`--single-branch` avoids creating local tracking branches for every remote branch (this repo has many stale remote branches). Remote branches remain fully accessible via `git fetch`.

Then set up your `.env` files:

```bash
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env
# Fill in real values
```

---

## Daily Workflow

### Start work on a new branch

```bash
wt switch --create feat/my-feature
```

Worktrunk automatically:
1. Creates the branch and worktree at `.worktrees/feat-my-feature/`
2. Runs `pnpm install` (post-create hook)
3. Copies gitignored files from `main/` — `.env*`, `node_modules/`, `.next/`, `.turbo/` (post-start hook)

No manual dependency installation or `.env` copying needed.

### List all worktrees

```bash
wt list
```

### Switch between worktrees

```bash
wt switch feat/my-feature
wt switch -     # previous worktree (like cd -)
wt switch ^     # main worktree
```

### Clean up after a PR is merged

```bash
wt remove                       # from inside the worktree
wt remove feat/my-feature       # from anywhere
wt step prune                   # remove all merged worktrees at once
```

### Update main

```bash
cd ~/projects/playground/main && git pull
```

---

## How `.env` and `node_modules` Are Shared

When a new worktree is created, `wt step copy-ignored` (configured as a post-start hook in `.config/wt.toml`) copies all gitignored files from `main/` using copy-on-write (reflink) — fast even for large `node_modules/`.

`.config/wt.toml` is a **project-level** config committed to the repo, distinct from your personal `~/.config/worktrunk/config.toml`. Run `wt hook show` to inspect active hooks.

The `.worktreeinclude` file in the repo root controls what gets copied:

```
node_modules/
.next/
.turbo/
.env*
.envrc
```

**Edit `.env` in `main/`** — it's the canonical source. Each new worktree gets a fresh copy on creation.

---

## Why bare repo?

A standard `git clone` gives you one working directory. Switching branches means stashing, switching, losing context. The bare repo pattern gives each branch its own directory — `feat/auth` and `fix/bug` coexist side by side with no interference. This is especially useful when running multiple AI coding agents in parallel on different features simultaneously.
