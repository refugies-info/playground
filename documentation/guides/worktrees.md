# Working with Git Worktrees

This repository uses a **bare repo + worktree** setup to support parallel development — multiple branches can be checked out simultaneously, each in its own directory, without interfering with each other.

---

## Repository Layout

```
playground/
├── .bare/              # Git data (bare clone — not a working directory)
├── .git                # Pointer file → .bare (makes standard git tools work)
├── .worktrees/         # Feature worktrees (hidden, managed by worktrunk)
│   ├── feat-my-feature/
│   └── fix-some-bug/
└── main/               # Main branch — source of truth for shared files
```

`main/` is a regular checkout of the `main` branch. **Never commit work directly to it** — it's a stable reference point. Create a worktree for every piece of work.

---

## Prerequisites

Install [worktrunk](https://worktrunk.dev) — a CLI that makes worktrees as easy as branches:

```bash
brew install worktrunk && wt config shell install
```

Shell integration is required for `wt switch` to change directories automatically.

---

## Initial Clone

```bash
# 1. Create the workspace directory
mkdir ~/projects/playground && cd ~/projects/playground

# 2. Bare clone
git clone --bare --single-branch git@github.com:refugies-info/playground.git .bare

# 3. Create the .git pointer file
echo "gitdir: ./.bare" > .git

# 4. Configure fetch for all remote branches
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"

# 5. Portable paths (workspace can be moved without breaking)
git config worktree.useRelativePaths true

# 6. Fetch all remote branches
git fetch --all

# 7. Create the main worktree
git worktree add main main
git -C main branch --set-upstream-to=origin/main main

# 8. Copy your .env files into main/ (source of truth)
cp /path/to/.env main/.env
cp /path/to/apps/frontend/.env main/apps/frontend/.env  # monorepo

# 9. Install dependencies
cd main && pnpm install
```

Then configure worktrunk to place new worktrees in `.worktrees/`:

```toml
# ~/.config/worktrunk/config.toml
[projects."github.com/refugies-info/playground"]
worktree-path = "../.worktrees/{{ branch | sanitize }}"
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
