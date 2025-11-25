# Common Commands Reference

Quick reference for frequently used commands in Content Playground development.

---

## Development

### Start Development Server

```bash
# Start all services (frontend + Supabase)
pnpm dev

# Start frontend only
pnpm --filter @refugies/frontend dev

# Start with specific port
PORT=3001 pnpm dev
```

### Type Checking

```bash
# Check TypeScript errors
pnpm type-check

# Watch mode (continuous checking)
pnpm type-check --watch
```

### Linting & Formatting

```bash
# Run ESLint
pnpm lint

# Fix linting errors
pnpm lint --fix

# Format code with Prettier
pnpm format

# Check formatting without changes
pnpm format --check
```

---

## Building

### Build for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @refugies/frontend build

# Build with analysis
pnpm build --analyze
```

### View Build Output

```bash
# Check bundle size
pnpm build --analyze

# View output directory
ls -la apps/frontend/.next
```

---

## Supabase

### Local Development

```bash
# Start local Supabase
pnpm supabase:start

# Stop local Supabase
pnpm supabase:stop

# Reset database to initial state
pnpm supabase:reset

# View Supabase logs
pnpm supabase:logs

# Access Supabase Studio (web UI)
# Available at http://localhost:54323 after starting
```

### Database Migrations

```bash
# Create new migration
pnpm supabase migration new <migration_name>

# Apply migrations
pnpm supabase:migrate

# Rollback migrations
pnpm supabase migration down
```

### Database Queries

```bash
# Connect to local database
psql postgresql://postgres:postgres@localhost:5432/postgres

# Connect to production database
psql <PRODUCTION_DATABASE_URL>
```

---

## Monorepo Management

### Workspace Commands

```bash
# List all workspaces
pnpm ls -r --depth=0

# Run command in specific workspace
pnpm --filter @refugies/frontend <command>

# Run command in all workspaces
pnpm -r <command>
```

### Dependency Management

```bash
# Add dependency to workspace
pnpm add <package> --filter @refugies/frontend

# Add dev dependency
pnpm add -D <package> --filter @refugies/frontend

# Remove dependency
pnpm remove <package> --filter @refugies/frontend

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

### Cache Management

```bash
# Clear Turborepo cache
pnpm turbo:clean

# Clear pnpm cache
pnpm store prune

# Rebuild everything
pnpm clean && pnpm install && pnpm build
```

---

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests for specific file
pnpm test <filename>

# Run tests with coverage
pnpm test --coverage
```

### E2E Tests

```bash
# Run Playwright tests
pnpm test:e2e

# Run specific test
pnpm test:e2e <test-file>

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Debug tests
pnpm test:e2e --debug
```

---

## Git & Version Control

### Branching

```bash
# Create new branch
git checkout -b feature/my-feature

# Switch branch
git checkout <branch-name>

# Delete branch
git branch -d <branch-name>

# List branches
git branch -a
```

### Commits

```bash
# Stage changes
git add .

# Commit changes
git commit -m "feat: add new feature"

# Amend last commit
git commit --amend

# View commit history
git log --oneline
```

### Pushing & Pulling

```bash
# Push to remote
git push origin <branch-name>

# Pull from remote
git pull origin <branch-name>

# Fetch updates
git fetch origin
```

---

## Deployment

### Vercel

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment status
vercel ls

# View logs
vercel logs --prod

# Rollback deployment
vercel rollback
```

### Environment Variables

```bash
# List environment variables
vercel env ls

# Add environment variable
vercel env add <NAME>

# Remove environment variable
vercel env rm <NAME>
```

---

## Debugging

### Frontend Debugging

```bash
# Start with debug logging
DEBUG=app:* pnpm dev

# View browser console
# Open DevTools: F12 or Cmd+Option+I

# View React DevTools
# Install React DevTools browser extension
```

### Database Debugging

```bash
# View Supabase logs
pnpm supabase:logs

# Query database directly
psql postgresql://postgres:postgres@localhost:5432/postgres

# View RLS policies
SELECT * FROM information_schema.role_table_grants;
```

### API Debugging

```bash
# Test API endpoint
curl http://localhost:3000/api/endpoint

# With POST data
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# View request headers
curl -i http://localhost:3000/api/endpoint
```

---

## Cleanup & Maintenance

### Clean Build

```bash
# Remove all build artifacts
pnpm clean

# Remove node_modules
rm -rf node_modules

# Reinstall dependencies
pnpm install

# Rebuild everything
pnpm build
```

### Database Cleanup

```bash
# Reset local database
pnpm supabase:reset

# Clear all data
pnpm supabase:reset --force

# Reseed database
pnpm supabase:seed
```

### Cache Cleanup

```bash
# Clear Next.js cache
rm -rf apps/frontend/.next

# Clear pnpm cache
pnpm store prune

# Clear Turborepo cache
pnpm turbo:clean
```

---

## Useful Aliases

Add to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# Development
alias dev="pnpm dev"
alias build="pnpm build"
alias lint="pnpm lint"
alias format="pnpm format"

# Supabase
alias sb-start="pnpm supabase:start"
alias sb-stop="pnpm supabase:stop"
alias sb-reset="pnpm supabase:reset"
alias sb-logs="pnpm supabase:logs"

# Git
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push"
alias gl="git log --oneline"
```

---

## Troubleshooting

**Port already in use?**
```bash
# Find process on port 3000
lsof -ti:3000

# Kill process
lsof -ti:3000 | xargs kill -9
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Build failing?**
```bash
# Clean build
pnpm clean
pnpm install
pnpm build

# Check for TypeScript errors
pnpm type-check
```

**Supabase won't start?**
```bash
# Check Docker is running
docker ps

# Reset Supabase
pnpm supabase:reset

# View logs
pnpm supabase:logs
```

---

## References

- [pnpm Documentation](https://pnpm.io/cli)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js CLI](https://nextjs.org/docs/app/api-reference/next-cli)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Git Documentation](https://git-scm.com/doc)
