# Deployment Guide

Deploy the Content Playground to production environments.

---

## Overview

The Content Playground uses a multi-service deployment architecture:

- **Frontend**: Vercel (Next.js)
- **Database & Auth**: Supabase
- **AI Orchestration**: Letta Cloud

---

## Prerequisites

- Vercel account and project created
- Supabase project (production instance)
- Letta Cloud account with API key
- GitHub repository connected to Vercel

---

## Environment Setup

### Production Environment Variables

Create `.env.production` with:

```bash
# Supabase (production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Letta Cloud
LETTA_API_KEY=your-letta-api-key
LETTA_AGENT_ID=your-agent-id

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Seeding (Optional but recommended for initial setup)
SEED_USER_PASSWORD=your-secure-production-password
```

See [Environment Variables](../reference/environment-variables.md) for complete reference.

---

## Frontend Deployment (Vercel)

### 1. Connect Repository

```bash
# If not already connected
vercel link
```

### 2. Configure Build Settings

In Vercel dashboard:

1. Go to **Settings** → **Build & Development Settings**
2. Set **Framework Preset** to `Next.js`
3. Set **Build Command** to `pnpm build`
4. Set **Output Directory** to `.next`
5. Set **Install Command** to `pnpm install`

### 3. Add Environment Variables

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add all production variables from `.env.production`
3. Set scope to **Production**

### 4. Deploy

```bash
# Deploy to production
vercel --prod

# Or push to main branch (if auto-deploy enabled)
git push origin main
```

### 5. Verify Deployment

```bash
# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## Database Deployment (Supabase)

### 1. Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Select your organization
4. Configure:
   - **Name**: content-playground-prod
   - **Database Password**: Strong password
   - **Region**: Choose closest to users
5. Click **Create new project**

### 2. Run Migrations

```bash
# Set production database URL
export SUPABASE_DB_URL="postgresql://postgres:password@host:5432/postgres"

# Run migrations
pnpm supabase:migrate
```

### 3. Configure RLS Policies

1. Go to Supabase Dashboard → **SQL Editor**
2. Run RLS policy scripts (see [Database Schema](../architecture/database-schema.md))
3. Verify policies are applied

### 4. Set Up Authentication

1. Go to **Authentication** → **Providers**
2. Enable Email/Password
3. Configure Google OAuth (if using):
   - Add OAuth credentials
   - Set redirect URLs
4. Go to **Email Templates** and customize if needed

---

## Letta Cloud Deployment

### 1. Create Agent

1. Go to [Letta Cloud Dashboard](https://app.letta.com)
2. Create new agent with production configuration
3. Configure custom tools for Supabase access
4. Test agent with sample data

### 2. Deploy Agent

```bash
# Deploy agent to Letta Cloud
letta deploy --agent-id your-agent-id --env production
```

### 3. Configure Webhooks

1. In Letta Cloud, set webhook URL to:
   ```
   https://your-domain.com/api/webhooks/letta
   ```
2. Enable event types needed for your workflow

---

## Database Backups

### Automatic Backups

Supabase provides automatic daily backups. To access:

1. Go to Supabase Dashboard → **Backups**
2. View backup history
3. Restore from backup if needed

### Manual Backup

```bash
# Export database
pg_dump postgresql://user:password@host:5432/db > backup.sql

# Store backup securely
```

---

## Monitoring & Logs

### Frontend Logs (Vercel)

```bash
# View deployment logs
vercel logs --prod

# Stream live logs
vercel logs --prod --follow
```

### Database Logs (Supabase)

1. Go to Supabase Dashboard → **Logs**
2. Filter by:
   - Database queries
   - Authentication events
   - API requests

### Application Monitoring

1. Set up error tracking (Sentry, LogRocket, etc.)
2. Monitor performance metrics
3. Set up alerts for critical errors

---

## Rollback Procedures

### Frontend Rollback (Vercel)

```bash
# View deployment history
vercel ls

# Rollback to previous deployment
vercel rollback
```

### Database Rollback (Supabase)

1. Go to **Backups**
2. Select backup to restore
3. Click **Restore**
4. Verify data integrity

---

## Security Checklist

- [ ] All environment variables set in production
- [ ] Database backups configured
- [ ] RLS policies enabled and tested
- [ ] CORS configured correctly
- [ ] API rate limiting enabled
- [ ] SSL/TLS certificates valid
- [ ] Secrets not exposed in code
- [ ] Authentication configured
- [ ] Error messages don't leak sensitive info

---

## Performance Optimization

### Frontend

```bash
# Analyze bundle size
pnpm build --analyze

# Check performance metrics
pnpm lighthouse
```

### Database

1. Add indexes on frequently queried columns
2. Optimize RLS policies
3. Monitor query performance in Supabase logs

### Caching

1. Configure CDN caching in Vercel
2. Set appropriate cache headers
3. Use Supabase edge functions for caching

---

## Troubleshooting

**Deployment fails?**
- Check build logs in Vercel
- Verify environment variables are set
- Ensure all dependencies are installed

**Database connection error?**
- Verify connection string in environment
- Check database is running
- Verify network access/firewall rules

**Authentication not working?**
- Check Supabase Auth configuration
- Verify redirect URLs
- Check OAuth credentials

---

## Next Steps

- Set up [monitoring and alerts](../architecture/authentication.md)
- Configure [custom domain](https://vercel.com/docs/concepts/projects/domains)
- Set up [CI/CD pipeline](../reference/commands.md)
- Review [security best practices](../troubleshooting/)

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Letta Documentation](https://docs.letta.com)
