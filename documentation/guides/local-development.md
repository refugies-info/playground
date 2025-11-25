# Local Development Setup

Get the Content Playground running on your machine for development.

---

## Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **pnpm** 8+ (install with `npm install -g pnpm`)
- **Git** (for cloning the repository)
- **Docker** (for Supabase local development)

---

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/refugies-info/content-playground.git
cd content-playground
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local configuration (see [Environment Variables](../reference/environment-variables.md)).

### 4. Start Supabase Locally

```bash
pnpm supabase:start
```

This starts the local Supabase instance. You'll see output with:
- API URL (usually `http://localhost:54321`)
- Anon key
- Service role key

Save these for your `.env.local` file.

### 5. Run the Development Server

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

---

## Development Workflow

### Running Commands

```bash
# Start all services
pnpm dev

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build
```

### Working with Supabase

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

### Monorepo Structure

The project uses **Turborepo** for monorepo management:

```
/apps/frontend        # Next.js frontend application
/packages/ui          # Design system components (@refugies/ui)
/packages/shared      # Shared types and utilities
```

Run tasks in specific workspaces:

```bash
# Run dev in frontend only
pnpm --filter @refugies/frontend dev

# Run type-check in all packages
pnpm type-check
```

---

## Debugging

### Frontend Debugging

1. Open `http://localhost:3000` in your browser
2. Open DevTools (F12)
3. Check Console for errors
4. Use React DevTools extension for component inspection

### Supabase Debugging

1. Access Supabase Studio at `http://localhost:54323`
2. View database tables, RLS policies, and logs
3. Test queries directly in the SQL editor

### TypeScript Errors

```bash
# Check for TypeScript errors
pnpm type-check

# Fix formatting issues
pnpm format
```

---

## Common Issues

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 54321 (Supabase)
lsof -ti:54321 | xargs kill -9
```

**Dependencies not installing?**
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
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

## Next Steps

- Read [Component Architecture](../../docs/COMPONENT_QUICK_REFERENCE.md) for adding UI components
- Check [Supabase Setup](./supabase-setup.md) for database configuration
- See [Common Commands](../reference/commands.md) for more CLI commands
- Review [Environment Variables](../reference/environment-variables.md) for configuration options

---

## Getting Help

- Check [Troubleshooting](../troubleshooting/) for common issues
- Review [Glossary](../reference/glossary.md) for terminology
- See project [README.md](../../README.md) for overview
