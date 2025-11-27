# Research: Supabase Authentication & Authorization

**Feature**: Supabase Authentication & Authorization (003-supabase-auth)  
**Date**: 2025-11-20  
**Phase**: Phase 0 (Research & Clarification)

## Overview

This document consolidates research findings and best practices for implementing authentication and authorization in the Content Playground using Supabase. All clarifications from the feature spec are resolved with concrete recommendations.

---

## Research Findings

### 1. Supabase Auth Architecture

**Decision**: Use Supabase Auth (built-in) for email/password and Google OAuth 2.0

**Rationale**:
- Supabase Auth is production-ready and handles JWT token generation, email verification, password reset, and OAuth flows out-of-the-box
- Reduces implementation complexity vs. custom auth
- Integrates seamlessly with Supabase RLS for authorization
- Supports both email/password and OAuth providers natively

**Alternatives Considered**:
- Custom JWT implementation: Rejected (higher complexity, more security risk, less maintainable)
- Auth0/Okta: Rejected (adds external dependency, unnecessary for POC)
- Firebase Auth: Rejected (vendor lock-in, less control over data)

**Implementation Approach**:
- Enable Supabase Auth in project settings
- Configure email provider (Supabase's built-in SMTP or custom)
- Configure Google OAuth provider (requires Google Cloud Console credentials)
- Use Supabase Client (`@supabase/supabase-js`) in frontend for auth operations
- Store JWT tokens in secure HTTP-only cookies (not localStorage)

---

### 2. Local Supabase Development Environment

**Decision**: Use Supabase CLI for local development with migrations

**Rationale**:
- Supabase CLI enables local PostgreSQL instance with Auth, RLS, and all features
- Migrations enable team collaboration and version control of schema changes
- `supabase start` and `supabase db reset` provide consistent dev environment
- Migrations can be applied to both local and production environments

**Alternatives Considered**:
- Docker Compose: Rejected (more complex setup, Supabase CLI is simpler)
- Cloud-only development: Rejected (slower iteration, requires internet, harder to test RLS)
- Manual SQL scripts: Rejected (not version-controlled, harder to track changes)

**Implementation Approach**:
- Install Supabase CLI locally (`brew install supabase` on macOS)
- Initialize local Supabase with `supabase init`
- Create migration files in `/migrations` directory for schema changes
- Use `supabase start` to launch local instance
- Use `supabase db reset` to reset to initial state
- Use `supabase link` to connect to production project for migrations

---

### 3. Role-Based Access Control (RBAC) with RLS

**Decision**: Implement RBAC using Supabase RLS policies at database level

**Rationale**:
- RLS policies enforce authorization at the database level (most secure)
- Prevents accidental data leaks from frontend/backend bugs
- Three roles (editor, reviewer, admin) cover editorial workflow needs
- RLS policies are version-controlled in migrations

**Alternatives Considered**:
- Application-level authorization only: Rejected (less secure, easier to bypass)
- JWT claims-based RBAC: Rejected (still need RLS for data protection)

**Implementation Approach**:
- Add `role` column to User table (enum: editor, reviewer, admin)
- Create RLS policies for each table:
  - **User table**: Users can read/update own row; admins can read all
  - **AuthSession table**: Users can access own sessions only
  - **AuditLog table**: Users can read own actions; admins can read all
  - **OAuthProvider table**: Users can access own OAuth providers only
- Enable RLS on all tables
- Test policies with different roles

---

### 4. Email/Password Authentication Flow

**Decision**: Email/password with mandatory email verification

**Rationale**:
- Email verification ensures users have valid email addresses
- Reduces spam and invalid accounts
- Supabase Auth handles verification email sending automatically
- Verification link valid for 24 hours (standard practice)

**Alternatives Considered**:
- No email verification: Rejected (allows spam, invalid emails)
- SMS verification: Rejected (adds cost, not needed for POC)

**Implementation Approach**:
- Use Supabase Auth's `signUp()` method with email and password
- Supabase automatically sends verification email
- User clicks link in email to verify
- After verification, user can log in
- Password strength: minimum 8 characters, at least one uppercase, one number (Supabase default)

---

### 5. Google OAuth 2.0 Integration

**Decision**: Use Supabase Auth's native Google OAuth provider

**Rationale**:
- Supabase Auth handles OAuth redirect flow automatically
- Reduces signup friction for users
- Account linking enables users to sign up with email, then add Google later
- Low implementation effort (just add button + configure provider)

**Alternatives Considered**:
- Custom OAuth implementation: Rejected (complex, error-prone)
- Other providers (GitHub, Microsoft): Deferred to MVP (low priority for POC)

**Implementation Approach**:
- Create OAuth app in Google Cloud Console (get Client ID and Secret)
- Configure Google provider in Supabase Auth settings
- Add redirect URI to both Google Console and Supabase
- Use Supabase Auth's `signInWithOAuth()` method in frontend
- Handle OAuth callback in `/callback` route
- Link Google account to existing email account if email matches

---

### 6. Session Management & Token Storage

**Decision**: JWT tokens in secure HTTP-only cookies

**Rationale**:
- HTTP-only cookies prevent XSS attacks (JavaScript cannot access)
- Secure flag ensures cookies only sent over HTTPS
- Supabase Client handles cookie management automatically
- Tokens refresh automatically before expiration

**Alternatives Considered**:
- localStorage: Rejected (vulnerable to XSS attacks)
- sessionStorage: Rejected (same XSS vulnerability)
- Custom token management: Rejected (Supabase Client handles it)

**Implementation Approach**:
- Supabase Client automatically stores JWT in HTTP-only cookie
- Configure cookie options: `httpOnly: true`, `secure: true`, `sameSite: 'lax'`
- Token expiration: 1 hour (default), refresh token valid for 7 days
- Supabase Client automatically refreshes token before expiration
- On logout, clear session and delete cookie

---

### 7. Audit Logging

**Decision**: AuditLog table tracks all auth events

**Rationale**:
- Audit trail required for compliance and debugging
- Tracks who did what and when
- Enables investigation of security incidents
- Supports analytics and user behavior analysis

**Alternatives Considered**:
- No audit logging: Rejected (no compliance, hard to debug)
- Application-level logging only: Rejected (incomplete, can be bypassed)

**Implementation Approach**:
- Create AuditLog table with: id, user_id, action, status, details, created_at
- Log all auth events: email_signup, email_login, google_login, logout, password_reset, account_link, account_unlink, role_change
- Store action status: success or failure
- Store additional details in JSON: IP address, user agent, error message, auth provider
- Use database triggers or application code to log events

---

### 8. Account Linking (Email + Google)

**Decision**: Support account linking with email matching

**Rationale**:
- Users can sign up with email, then add Google later
- Reduces friction (users don't need to remember which method they used)
- Email matching ensures linking is intentional (not accidental)
- Improves user experience

**Alternatives Considered**:
- No linking: Rejected (users confused if they use different methods)
- Automatic linking without confirmation: Rejected (security risk)

**Implementation Approach**:
- When user signs in with Google, check if email exists in User table
- If email exists, offer to link accounts (require confirmation)
- If email doesn't exist, create new user
- Store OAuth provider info in OAuthProvider table
- Support unlinking (user can disconnect Google from account)

---

### 9. Password Reset Flow

**Decision**: Email-based password reset with 24-hour link validity

**Rationale**:
- Email-based reset is standard practice
- 24-hour validity balances security and usability
- Supabase Auth handles reset email sending automatically
- User must click link to reset password

**Alternatives Considered**:
- SMS reset: Rejected (adds cost, not needed for POC)
- Security questions: Rejected (less secure, more complex)

**Implementation Approach**:
- User enters email on password reset page
- Supabase Auth sends reset email with link
- Link valid for 24 hours
- User clicks link, enters new password
- Password updated in Supabase Auth
- User can log in with new password

---

### 10. Frontend Framework & UI Components

**Decision**: Next.js 14+ with Tailwind CSS v4 and shadcn/ui

**Rationale**:
- Next.js provides server-side rendering, API routes, and built-in optimization
- Tailwind CSS v4 provides utility-first styling without config file
- shadcn/ui provides accessible components built on Radix UI primitives
- All three are production-ready and widely used

**Alternatives Considered**:
- React + custom styling: Rejected (more boilerplate, less accessible)
- Vue/Svelte: Rejected (team expertise in React/Next.js)

**Implementation Approach**:
- Create auth pages in `/app/(auth)/` directory (Next.js app router)
- Use shadcn/ui components for forms, buttons, dialogs
- Use Tailwind CSS for styling
- Create reusable auth components: LoginForm, SignupForm, GoogleButton, AccountLinking
- Use Next.js middleware for route protection

---

### 11. Database Schema Design

**Decision**: Four tables (User, AuthSession, AuditLog, OAuthProvider) with foreign keys and RLS

**Rationale**:
- User table stores user info and role
- AuthSession table tracks active sessions
- AuditLog table tracks all auth events
- OAuthProvider table tracks OAuth account links
- Foreign keys ensure referential integrity
- RLS policies enforce authorization

**Alternatives Considered**:
- Single table: Rejected (poor separation of concerns)
- No foreign keys: Rejected (data integrity issues)

**Implementation Approach**:
- Create tables in migration files (SQL)
- Add foreign keys with ON DELETE CASCADE
- Create indexes on frequently queried columns (user_id, email, created_at)
- Create RLS policies for each table
- Test policies with different roles

---

## Best Practices Applied

### Security
- ✅ HTTP-only cookies for token storage (prevents XSS)
- ✅ RLS policies at database level (defense in depth)
- ✅ Email verification for email/password signup
- ✅ Password strength validation (8+ chars, uppercase, number)
- ✅ Audit logging for all auth events
- ✅ Secure OAuth redirect flow

### Performance
- ✅ JWT tokens with automatic refresh (no extra DB queries)
- ✅ Indexes on frequently queried columns
- ✅ HTTP-only cookies (no JavaScript overhead)
- ✅ Supabase Auth handles scaling (no custom auth server)

### Maintainability
- ✅ Migrations for schema version control
- ✅ Shared types in `/packages/shared` (DRY)
- ✅ Reusable auth components (LoginForm, SignupForm, etc.)
- ✅ Clear separation: frontend UI, Supabase Auth, database schema

### User Experience
- ✅ Email verification (ensures valid emails)
- ✅ Password reset flow (users can recover accounts)
- ✅ Google OAuth (reduces signup friction)
- ✅ Account linking (users can use multiple methods)

---

## Resolved Clarifications

| Clarification | Resolution | Source |
|---------------|-----------|--------|
| Supabase project state | Initialized with connection tested; no schema yet | User input |
| Local dev setup | Supabase CLI with migrations in `/migrations` | Research |
| Auth methods | Email/password + Google OAuth | Spec |
| Token storage | HTTP-only cookies (secure) | Research |
| RBAC implementation | RLS policies at database level | Research |
| Account linking | Email matching with confirmation | Research |
| Audit logging | AuditLog table with all auth events | Spec |
| Password reset | Email-based, 24-hour link validity | Research |
| Frontend framework | Next.js 14+ with Tailwind CSS v4 + shadcn/ui | Constitution |

---

## Next Steps

1. **Phase 1 (Design)**: Create data-model.md with entity definitions and database schema
2. **Phase 1 (Design)**: Create API contracts for auth endpoints
3. **Phase 1 (Design)**: Create quickstart.md for developer setup
4. **Phase 2 (Tasks)**: Generate tasks.md with implementation breakdown by user story
5. **Implementation**: Execute tasks in order (DB setup → email/password → Google OAuth → RBAC → admin features)

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Authentication Best Practices](https://nextjs.org/docs/app/building-your-application/authentication)
