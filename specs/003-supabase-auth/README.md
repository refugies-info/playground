# Supabase Authentication & Authorization

**Feature Branch**: `003-supabase-auth`  
**Status**: MVP Implementation in Progress  
**Phase**: 1 of 8 (Setup) ✅

## Overview

This feature implements Supabase authentication and authorization for the Content Playground editorial workflow. It includes:

- Local Supabase development environment with migrations
- Database schema (User, AuthSession, AuditLog, OAuthProvider tables)
- RLS policies for role-based access control
- Email/password authentication with email verification
- Google OAuth 2.0 integration (Phase 5)
- Session management with secure JWT tokens
- Comprehensive audit logging

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Supabase CLI (v2.58.5+)
- macOS/Linux/WSL

### Setup Local Supabase

```bash
# 1. Install Supabase CLI (if not already installed)
brew install supabase

# 2. Start local Supabase instance
supabase start

# 3. Verify it's running
supabase status
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Local Development Values**:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
```

Get the actual keys by running:
```bash
supabase status
```

### Database Setup

```bash
# Create migrations (already in /migrations directory)
# Apply migrations to local database
supabase db push

# Reset database to initial state
supabase db reset

# View database schema
supabase db pull
```

## Architecture

### Project Structure

```
/apps/frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth pages (login, signup, etc.)
│   │   └── dashboard/       # Protected dashboard
│   ├── components/
│   │   ├── auth/            # Auth components
│   │   └── ui/              # shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   └── auth.ts          # Auth utilities
│   └── middleware.ts        # Route protection

/packages/shared/
├── src/
│   ├── types/
│   │   ├── auth.ts          # Auth types
│   │   └── audit.ts         # Audit types
│   └── constants/
│       └── roles.ts         # Role definitions

/migrations/
├── 001_create_auth_tables.sql
├── 002_create_rls_policies.sql
└── 003_create_audit_triggers.sql

/.supabase/
├── config.toml              # Local Supabase config
└── seed.sql                 # Test data
```

### Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Authorization**: Supabase RLS policies
- **Monorepo**: Turborepo + pnpm

## Implementation Phases

### Phase 1: Setup ✅ (CURRENT)
- [x] Install Supabase CLI
- [x] Initialize Supabase project
- [x] Create configuration files
- [x] Set up environment variables

### Phase 2: Foundational (Next)
- [ ] Create shared types (User, AuthSession, OAuthProvider, AuditLog)
- [ ] Initialize Supabase client
- [ ] Create auth utilities

### Phase 3: Database Setup
- [ ] Create migration files
- [ ] Implement RLS policies
- [ ] Test local Supabase startup

### Phase 4: Email/Password Auth
- [ ] Create frontend components (LoginForm, SignupForm, etc.)
- [ ] Create frontend pages (login, signup, dashboard)
- [ ] Create backend APIs
- [ ] Manual testing

### Phase 5+: Post-MVP
- Google OAuth integration
- Reviewer access control
- Admin user management
- Polish & documentation

## Key Entities

### User
- `id` (UUID): Unique identifier
- `email` (string): User email (unique)
- `role` (enum): editor, reviewer, admin
- `created_at`, `updated_at` (timestamp)
- `is_active` (boolean)

### AuthSession
- `id` (UUID)
- `user_id` (FK to User)
- `token` (JWT)
- `expires_at` (timestamp)

### AuditLog
- `id` (UUID)
- `user_id` (FK to User)
- `action` (string): email_signup, email_login, google_login, etc.
- `status` (enum): success, failure
- `details` (JSON): IP, user agent, error message, etc.

### OAuthProvider
- `id` (UUID)
- `user_id` (FK to User)
- `provider` (enum): google
- `provider_user_id` (string)
- `provider_email` (string)

## Testing

### Manual Testing Checklist

**Email/Password Auth**:
- [ ] Signup with valid email/password
- [ ] Verify email verification link
- [ ] Login with correct credentials
- [ ] Logout clears session
- [ ] Password reset flow works
- [ ] Unverified email login shows warning

**Database**:
- [ ] `supabase start` launches successfully
- [ ] All tables created with correct columns
- [ ] RLS policies enforced
- [ ] `supabase db reset` works

## Troubleshooting

### Supabase won't start

```bash
# Check if port 54321 is in use
lsof -i :54321

# Kill existing process if needed
kill -9 <PID>

# Try starting again
supabase start
```

### Database connection issues

```bash
# Check Supabase status
supabase status

# Reset database
supabase db reset

# Check logs
supabase logs --follow
```

### Environment variables not loading

- Ensure `.env.local` exists in project root
- Restart dev server after changing `.env.local`
- Check that keys are correct from `supabase status`

## Documentation

- **Specification**: [spec.md](spec.md)
- **Implementation Plan**: [plan.md](plan.md)
- **Research & Decisions**: [research.md](research.md)
- **Tasks**: [tasks.md](tasks.md)
- **Quality Checklist**: [checklists/requirements.md](checklists/requirements.md)

## Next Steps

1. ✅ Phase 1 (Setup) complete
2. → Start Phase 2 (Foundational) - Create shared types and Supabase client
3. → Phase 3 (Database) - Create migrations and test local setup
4. → Phase 4 (Email/Password) - Implement auth flows
5. → MVP Validation with 2-3 real users

## Support

For questions or issues, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Feature specification: [spec.md](spec.md)
