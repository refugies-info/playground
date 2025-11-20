# Implementation Tasks: Supabase Authentication & Authorization

**Feature**: Supabase Authentication & Authorization (003-supabase-auth)  
**Branch**: `003-supabase-auth`  
**Date**: 2025-11-20  
**Team**: Jeremie (full stack: database + frontend)  
**Phase**: POC (Manual testing, no automated tests per Constitution v1.4.1)

---

## Overview

This document contains all implementation tasks organized by user story and phase. Each task is independently testable and includes specific file paths. Tasks are organized to enable parallel execution where possible.

**Total Tasks**: 88  
**Phases**: 8 (Setup → Foundational → US0 → US1 → US3 → US2 → US4 → Polish)

---

## Dependencies & Execution Strategy

### User Story Completion Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US0: Database Setup) ← BLOCKING for all other stories
    ├→ Phase 4 (US1: Email/Password Auth) [P] Can run parallel with US3
    ├→ Phase 5 (US3: Google OAuth) [P] Can run parallel with US1
    ├→ Phase 6 (US2: Reviewer Access) [P] Depends on US1 + US3
    └→ Phase 7 (US4: Admin Management) [P] Depends on US1 + US3
    ↓
Phase 8 (Polish & Cross-Cutting)
```

### Parallel Execution Examples

**After US0 completes**:
- Jeremie can start US1 (email/password frontend) while Luis continues with US3 (Google OAuth backend)
- Both US1 and US3 are independent and can be developed in parallel
- US2 and US4 depend on both US1 and US3 completing

**Recommended MVP Scope**:
- Phase 1: Setup (all tasks)
- Phase 2: Foundational (all tasks)
- Phase 3: US0 Database Setup (all tasks)
- Phase 4: US1 Email/Password Auth (all tasks)
- **STOP HERE FOR MVP** – Validate email/password flow with 2-3 users before proceeding to Google OAuth and admin features

---

## Phase 1: Setup & Project Initialization

**Goal**: Initialize project structure, install dependencies, configure Supabase CLI

**Independent Test**: Verify project structure exists, pnpm installs without errors, Supabase CLI is available

### Setup Tasks

- [ ] T001 Initialize Supabase project and test connection (verify `.supabase/config.toml` exists and connection works)
- [ ] T002 Install Supabase CLI locally (`brew install supabase` on macOS, verify `supabase --version` works)
- [ ] T003 Create `/migrations` directory in project root for SQL migration files
- [ ] T004 Create `.supabase/config.toml` with local Supabase configuration (database URL, auth settings)
- [ ] T005 Create `.supabase/seed.sql` with optional seed data for local development (test users, roles)
- [ ] T006 Add Supabase environment variables to `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [ ] T007 Create `.env.example` with template for required environment variables
- [ ] T008 Update `.gitignore` to exclude `.supabase/` and `.env.local` files
- [ ] T009 Create `README.md` in `/specs/003-supabase-auth/` with setup instructions and architecture overview

---

## Phase 2: Foundational Infrastructure

**Goal**: Set up shared types, Supabase client, and auth utilities

**Independent Test**: Verify shared types compile, Supabase client initializes, auth utilities are available

### Shared Types & Constants

- [ ] T010 [P] Create `/packages/shared/src/types/auth.ts` with TypeScript interfaces:
  - `User` (id, email, role, created_at, updated_at, is_active)
  - `AuthSession` (id, user_id, token, expires_at, created_at)
  - `OAuthProvider` (id, user_id, provider, provider_user_id, provider_email, created_at, updated_at)
  - `AuthError` (code, message)

- [ ] T011 [P] Create `/packages/shared/src/types/audit.ts` with TypeScript interfaces:
  - `AuditLog` (id, user_id, action, status, details, created_at)
  - `AuditAction` enum (email_signup, email_login, google_login, logout, password_reset, account_link, account_unlink, role_change)
  - `AuditStatus` enum (success, failure)

- [ ] T012 [P] Create `/packages/shared/src/constants/roles.ts` with role definitions:
  - `ROLES` constant: { EDITOR: 'editor', REVIEWER: 'reviewer', ADMIN: 'admin' }
  - `ROLE_PERMISSIONS` mapping (which actions each role can perform)

- [ ] T013 [P] Create `/packages/shared/src/index.ts` to export all types and constants

### Supabase Client & Auth Utilities

- [ ] T014 Create `/apps/frontend/src/lib/supabase.ts` with Supabase client initialization:
  - Initialize with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Configure cookie options: `httpOnly: true`, `secure: true`, `sameSite: 'lax'`
  - Export client instance for use in frontend

- [ ] T015 Create `/apps/frontend/src/lib/auth.ts` with auth utility functions:
  - `signUp(email, password)` – calls Supabase Auth signup
  - `signIn(email, password)` – calls Supabase Auth login
  - `signOut()` – clears session and logs out
  - `getCurrentUser()` – returns current authenticated user
  - `isAuthenticated()` – returns boolean
  - `getUserRole()` – returns user's role (editor, reviewer, admin)

- [ ] T016 Create `/apps/frontend/src/middleware.ts` for route protection:
  - Middleware to check authentication on protected routes
  - Redirect unauthenticated users to `/login`
  - Attach user info to request for use in pages

---

## Phase 3: US0 – Database Engineer Sets Up Local Supabase & Migrations

**Goal**: Create database schema, RLS policies, and enable local development

**Independent Test**: 
- `supabase start` launches successfully
- All tables exist with correct columns
- RLS policies are active and enforcing
- `supabase db reset` works correctly

### Database Schema Migrations

- [ ] T017 [US0] Create `/migrations/001_create_auth_tables.sql`:
  - Create `public.users` table (id UUID PK, email TEXT UNIQUE, role TEXT, created_at, updated_at, is_active BOOLEAN)
  - Create `public.auth_sessions` table (id UUID PK, user_id FK, token TEXT, expires_at, created_at)
  - Create `public.audit_logs` table (id UUID PK, user_id FK, action TEXT, status TEXT, details JSONB, created_at)
  - Create `public.oauth_providers` table (id UUID PK, user_id FK, provider TEXT, provider_user_id TEXT, provider_email TEXT, created_at, updated_at)
  - Add foreign key constraints with ON DELETE CASCADE
  - Create indexes on frequently queried columns (user_id, email, created_at)

- [ ] T018 [US0] Create `/migrations/002_create_rls_policies.sql`:
  - Enable RLS on all tables
  - **User table policies**:
    - Users can SELECT/UPDATE their own row
    - Admins can SELECT all rows
  - **AuthSession table policies**:
    - Users can SELECT/DELETE their own sessions
  - **AuditLog table policies**:
    - Users can SELECT logs where user_id = auth.uid()
    - Admins can SELECT all logs
  - **OAuthProvider table policies**:
    - Users can SELECT/DELETE their own OAuth providers

- [ ] T019 [US0] Create `/migrations/003_create_audit_triggers.sql`:
  - Create trigger to log auth events to `audit_logs` table
  - Trigger fires on INSERT to `auth_sessions` (log login events)
  - Trigger fires on DELETE from `auth_sessions` (log logout events)
  - Store action, status, and details (IP, user agent, etc.)

### Local Supabase Setup

- [ ] T020 [US0] Configure local Supabase with `supabase init`:
  - Initialize Supabase project in repo root
  - Verify `.supabase/config.toml` is created with correct settings
  - Set database password and JWT secret

- [ ] T021 [US0] Test local Supabase startup:
  - Run `supabase start` and verify all services start (PostgreSQL, Auth, Realtime, Storage)
  - Verify migrations apply automatically
  - Verify schema is created correctly
  - Run `supabase db reset` and verify database resets to initial state

- [ ] T022 [US0] Create `.supabase/seed.sql` with test data:
  - Insert test users (editor, reviewer, admin roles)
  - Insert test OAuth provider records
  - Insert test audit log entries
  - Verify seed data loads on `supabase db reset`

- [ ] T023 [US0] Document database setup in `/specs/003-supabase-auth/quickstart.md`:
  - Step-by-step guide for developers to set up local Supabase
  - Commands: `supabase start`, `supabase db reset`, `supabase link`
  - How to create new migrations
  - How to test RLS policies locally

---

## Phase 4: US1 – Editor Signs Up and Logs In (Email/Password Auth)

**Goal**: Implement email/password signup, email verification, login, and logout flows

**Independent Test**:
- Signup form accepts email/password and creates account
- Verification email is sent
- User can verify email and log in
- Dashboard is accessible after login
- Logout clears session

### Frontend Components

- [ ] T024 [P] [US1] Create `/apps/frontend/src/components/auth/LoginForm.tsx`:
  - Form with email and password fields
  - Submit button to call `signIn(email, password)`
  - Error message display for failed login
  - Link to password reset page
  - Link to signup page

- [ ] T025 [P] [US1] Create `/apps/frontend/src/components/auth/SignupForm.tsx`:
  - Form with email and password fields
  - Password strength validation (8+ chars, uppercase, number)
  - Submit button to call `signUp(email, password)`
  - Error message display for failed signup
  - Success message: "Verification email sent"
  - Link to login page

- [ ] T026 [P] [US1] Create `/apps/frontend/src/components/auth/PasswordResetForm.tsx`:
  - Form with email field
  - Submit button to call `resetPassword(email)`
  - Success message: "Reset link sent to email"
  - Link back to login

- [ ] T027 [P] [US1] Create `/apps/frontend/src/components/ui/Button.tsx` (shadcn/ui):
  - Reusable button component with variants (primary, secondary, danger)
  - Loading state with spinner
  - Disabled state

- [ ] T028 [P] [US1] Create `/apps/frontend/src/components/ui/Input.tsx` (shadcn/ui):
  - Reusable input component with label, error message, placeholder
  - Support for email, password, text types

- [ ] T029 [P] [US1] Create `/apps/frontend/src/components/ui/Card.tsx` (shadcn/ui):
  - Reusable card component for forms and content

### Frontend Pages

- [ ] T030 [US1] Create `/apps/frontend/src/app/(auth)/login/page.tsx`:
  - Display LoginForm component
  - Redirect to dashboard if already authenticated
  - Tailwind CSS styling with shadcn/ui components

- [ ] T031 [US1] Create `/apps/frontend/src/app/(auth)/signup/page.tsx`:
  - Display SignupForm component
  - Redirect to dashboard if already authenticated
  - Tailwind CSS styling

- [ ] T032 [US1] Create `/apps/frontend/src/app/(auth)/password-reset/page.tsx`:
  - Display PasswordResetForm component
  - Handle reset token from URL query parameter
  - Allow user to enter new password

- [ ] T033 [US1] Create `/apps/frontend/src/app/(auth)/callback/page.tsx`:
  - Handle OAuth and email verification callbacks
  - Extract token from URL
  - Verify email or complete OAuth flow
  - Redirect to dashboard on success

- [ ] T034 [US1] Create `/apps/frontend/src/app/dashboard/page.tsx`:
  - Protected page (requires authentication)
  - Display welcome message with user email
  - Display logout button
  - Display user role (editor, reviewer, admin)

### Backend Integration

- [ ] T035 [US1] Configure Supabase Auth settings:
  - Enable email/password authentication
  - Configure email provider (SMTP or Supabase default)
  - Set email verification required
  - Set password reset link validity to 24 hours
  - Configure JWT expiration (1 hour) and refresh token validity (7 days)

- [ ] T036 [US1] Create API route `/apps/frontend/src/app/api/auth/logout/route.ts`:
  - Handle logout requests
  - Clear session cookie
  - Return success response

- [ ] T037 [US1] Create API route `/apps/frontend/src/app/api/auth/user/route.ts`:
  - Return current authenticated user info
  - Include user ID, email, role
  - Require authentication

### Manual Testing

- [ ] T038 [US1] Test signup flow:
  - Create account with valid email/password
  - Verify verification email is sent
  - Click verification link
  - Verify email is marked as verified
  - Log in with verified email

- [ ] T039 [US1] Test login flow:
  - Log in with correct credentials
  - Verify redirect to dashboard
  - Verify user info displayed correctly
  - Verify session persists on page reload

- [ ] T040 [US1] Test logout flow:
  - Log in to dashboard
  - Click logout button
  - Verify redirect to login page
  - Verify session is cleared

- [ ] T041 [US1] Test password reset flow:
  - Request password reset with email
  - Verify reset email is sent
  - Click reset link
  - Enter new password
  - Log in with new password

- [ ] T042 [US1] Test edge cases:
  - Attempt signup with existing email (error)
  - Attempt signup with weak password (error)
  - Attempt login with unverified email (allow with warning)
  - Attempt login with wrong password (error)

---

## Phase 5: US3 – Editor Signs In with Google (Google OAuth)

**Goal**: Implement Google OAuth 2.0 integration with account linking

**Independent Test**:
- Google OAuth redirect flow works
- User is created/linked in system
- Dashboard is accessible after Google login
- Account linking works (email + Google on same account)

### Google OAuth Setup

- [ ] T043 [US3] Create Google OAuth credentials:
  - Create project in Google Cloud Console
  - Create OAuth 2.0 credentials (Client ID, Client Secret)
  - Add redirect URIs: `http://localhost:3000/auth/callback`, `https://[production-url]/auth/callback`
  - Document credentials in `.env.local`

- [ ] T044 [US3] Configure Supabase Auth for Google OAuth:
  - Enable Google provider in Supabase Auth settings
  - Add Client ID and Client Secret
  - Verify redirect URIs are configured

### Frontend Components

- [ ] T045 [P] [US3] Create `/apps/frontend/src/components/auth/GoogleButton.tsx`:
  - Button with Google logo
  - Click handler to call `signInWithOAuth('google')`
  - Loading state during redirect
  - Error message display

- [ ] T046 [P] [US3] Create `/apps/frontend/src/components/auth/AccountLinking.tsx`:
  - Display current linked accounts (email, Google)
  - Button to link Google account
  - Button to unlink Google account
  - Confirmation dialog before unlinking

- [ ] T047 [P] [US3] Update `/apps/frontend/src/components/auth/LoginForm.tsx`:
  - Add GoogleButton component below email/password form
  - Add divider ("OR")

- [ ] T048 [P] [US3] Update `/apps/frontend/src/components/auth/SignupForm.tsx`:
  - Add GoogleButton component below email/password form
  - Add divider ("OR")

### Frontend Pages

- [ ] T049 [US3] Create `/apps/frontend/src/app/(auth)/account-linking/page.tsx`:
  - Display AccountLinking component
  - Allow users to manage linked accounts
  - Require authentication

- [ ] T050 [US3] Update `/apps/frontend/src/app/dashboard/page.tsx`:
  - Add link to account linking page
  - Display linked accounts (email, Google)

### Backend Integration

- [ ] T051 [US3] Create API route `/apps/frontend/src/app/api/auth/oauth/callback/route.ts`:
  - Handle OAuth callback from Supabase
  - Extract user info from OAuth provider
  - Link to existing account if email matches
  - Create new account if email doesn't exist
  - Return success response

- [ ] T052 [US3] Create API route `/apps/frontend/src/app/api/auth/link-oauth/route.ts`:
  - Link OAuth provider to existing account
  - Require authentication
  - Verify email matches before linking

- [ ] T053 [US3] Create API route `/apps/frontend/src/app/api/auth/unlink-oauth/route.ts`:
  - Unlink OAuth provider from account
  - Require authentication
  - Prevent unlinking if no other auth method exists

### Manual Testing

- [ ] T054 [US3] Test Google OAuth signup:
  - Click "Sign in with Google" on signup page
  - Authorize application in Google consent screen
  - Verify user is created in system
  - Verify redirect to dashboard
  - Verify user info populated from Google account

- [ ] T055 [US3] Test Google OAuth login:
  - Click "Sign in with Google" on login page
  - Authorize application
  - Verify redirect to dashboard
  - Verify session is created

- [ ] T056 [US3] Test account linking:
  - Sign up with email/password
  - Go to account linking page
  - Click "Link Google Account"
  - Authorize with same Google account
  - Verify Google account is linked
  - Log out and log in with Google
  - Verify same account is accessed

- [ ] T057 [US3] Test account unlinking:
  - Link Google account (from previous test)
  - Click "Unlink Google Account"
  - Confirm unlinking
  - Verify Google account is unlinked
  - Verify email/password login still works

---

## Phase 6: US2 – Reviewer Reviews Content with Elevated Permissions

**Goal**: Implement role-based access control for reviewer role

**Independent Test**:
- Reviewer can log in
- Reviewer can view submitted content (not all drafts)
- Reviewer cannot edit content (read-only)
- Editor cannot access reviewer-only content

### Frontend Components

- [ ] T058 [P] [US2] Create `/apps/frontend/src/components/auth/RoleGuard.tsx`:
  - Component to guard routes by role
  - Accept `requiredRoles` prop (array of allowed roles)
  - Redirect to unauthorized page if user role not in allowed list

- [ ] T059 [P] [US2] Create `/apps/frontend/src/app/unauthorized/page.tsx`:
  - Display message: "You do not have permission to access this page"
  - Link back to dashboard

### Frontend Pages

- [ ] T060 [US2] Create `/apps/frontend/src/app/dashboard/review/page.tsx`:
  - Protected page (requires reviewer or admin role)
  - Display list of content submitted for review
  - Display content title, editor name, submission date
  - Display approve/reject buttons (UI only, no backend yet)
  - Implement RoleGuard to restrict access

### Backend Integration

- [ ] T061 [US2] Create API route `/apps/frontend/src/app/api/content/submitted/route.ts`:
  - Return list of content submitted for review
  - Filter by status = 'submitted_for_review'
  - Require reviewer or admin role
  - Include content ID, title, editor info, submission date

- [ ] T062 [US2] Create API route `/apps/frontend/src/app/api/content/[id]/approve/route.ts`:
  - Approve submitted content
  - Update content status to 'approved'
  - Log audit event
  - Require reviewer or admin role

- [ ] T063 [US2] Create API route `/apps/frontend/src/app/api/content/[id]/reject/route.ts`:
  - Reject submitted content
  - Update content status to 'rejected'
  - Log audit event
  - Require reviewer or admin role

### Manual Testing

- [ ] T064 [US2] Test reviewer access:
  - Create reviewer user in database
  - Log in as reviewer
  - Verify access to review page
  - Verify list of submitted content displayed

- [ ] T065 [US2] Test editor access restriction:
  - Create editor user in database
  - Log in as editor
  - Attempt to access review page
  - Verify redirect to unauthorized page

---

## Phase 7: US4 – Admin Manages Users and Roles

**Goal**: Implement admin user management interface

**Independent Test**:
- Admin can view list of users
- Admin can create new users
- Admin can change user roles
- Admin can deactivate users
- Non-admins cannot access admin pages

### Frontend Components

- [ ] T066 [P] [US4] Create `/apps/frontend/src/components/admin/UserTable.tsx`:
  - Display table of users (ID, email, role, created_at, is_active)
  - Include action buttons (edit, deactivate)
  - Sortable columns
  - Pagination

- [ ] T067 [P] [US4] Create `/apps/frontend/src/components/admin/CreateUserForm.tsx`:
  - Form to create new user
  - Fields: email, role (dropdown), send invitation email (checkbox)
  - Submit button
  - Error/success messages

- [ ] T068 [P] [US4] Create `/apps/frontend/src/components/admin/EditUserForm.tsx`:
  - Form to edit user
  - Fields: email (read-only), role (dropdown), is_active (toggle)
  - Submit button
  - Error/success messages

### Frontend Pages

- [ ] T069 [US4] Create `/apps/frontend/src/app/admin/users/page.tsx`:
  - Protected page (requires admin role)
  - Display UserTable component
  - Display "Create User" button
  - Implement RoleGuard to restrict access

- [ ] T070 [US4] Create `/apps/frontend/src/app/admin/users/[id]/edit/page.tsx`:
  - Protected page (requires admin role)
  - Display EditUserForm component
  - Load user data from API
  - Handle form submission

### Backend Integration

- [ ] T071 [US4] Create API route `/apps/frontend/src/app/api/admin/users/route.ts`:
  - GET: Return list of all users
  - POST: Create new user
  - Require admin role

- [ ] T072 [US4] Create API route `/apps/frontend/src/app/api/admin/users/[id]/route.ts`:
  - GET: Return user by ID
  - PUT: Update user (role, is_active)
  - DELETE: Delete user
  - Require admin role

- [ ] T073 [US4] Create API route `/apps/frontend/src/app/api/admin/users/[id]/send-invitation/route.ts`:
  - Send invitation email to user
  - Include password reset link
  - Require admin role

### Manual Testing

- [ ] T074 [US4] Test admin access:
  - Create admin user in database
  - Log in as admin
  - Verify access to admin users page
  - Verify user list displayed

- [ ] T075 [US4] Test create user:
  - Click "Create User" button
  - Enter email and select role
  - Submit form
  - Verify user is created in database
  - Verify invitation email is sent

- [ ] T076 [US4] Test edit user:
  - Click edit button on user
  - Change role from editor to reviewer
  - Submit form
  - Verify role is updated in database
  - Verify user's permissions change on next login

- [ ] T077 [US4] Test deactivate user:
  - Click deactivate button on user
  - Confirm deactivation
  - Verify user cannot log in
  - Verify is_active is set to false in database

- [ ] T078 [US4] Test non-admin access restriction:
  - Log in as editor
  - Attempt to access admin users page
  - Verify redirect to unauthorized page

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Add audit logging, error handling, and documentation

### Audit Logging

- [ ] T079 Log all authentication events to `audit_logs` table:
  - email_signup: When user signs up with email
  - email_login: When user logs in with email
  - google_login: When user logs in with Google
  - logout: When user logs out
  - password_reset: When user resets password
  - account_link: When user links OAuth account
  - account_unlink: When user unlinks OAuth account
  - role_change: When admin changes user role
  - Implement in auth utilities and API routes

- [ ] T080 Create audit log viewer page (admin only):
  - Display audit logs in table format
  - Filter by user, action, date range
  - Export audit logs to CSV
  - Require admin role

### Error Handling & Edge Cases

- [ ] T081 Handle unverified email login:
  - Allow login but display warning: "Please verify your email"
  - Link to resend verification email

- [ ] T082 Handle session expiration:
  - Detect expired token
  - Automatically refresh token if possible
  - Redirect to login if refresh fails
  - Display message: "Your session has expired. Please log in again."

- [ ] T083 Handle role changes during session:
  - On next API request, check if user's role has changed
  - If role changed, update session
  - Enforce new permissions on next action

- [ ] T084 Handle OAuth errors:
  - Display error message if OAuth fails
  - Allow user to retry or use email/password instead
  - Log error to audit trail

### Documentation & Testing Guide

- [ ] T085 Create `/specs/003-supabase-auth/TESTING.md`:
  - Manual testing guide for all user stories
  - Step-by-step instructions for each test scenario
  - Expected results for each test
  - Screenshots/GIFs of happy path flows

- [ ] T086 Create `/specs/003-supabase-auth/ARCHITECTURE.md`:
  - System architecture overview
  - Data flow diagrams (signup, login, OAuth)
  - RLS policy enforcement explanation
  - Security considerations

- [ ] T087 Update `/specs/003-supabase-auth/quickstart.md`:
  - Add troubleshooting section
  - Add common errors and solutions
  - Add performance tuning tips

- [ ] T088 Create `.env.example` with all required environment variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - GOOGLE_OAUTH_CLIENT_ID
  - GOOGLE_OAUTH_CLIENT_SECRET

### Code Quality & Cleanup

- [ ] T089 Add TypeScript strict mode to `tsconfig.json`
- [ ] T090 Add ESLint configuration for code quality
- [ ] T091 Add Prettier configuration for code formatting
- [ ] T092 Add `.gitignore` entries for sensitive files (.env.local, .supabase/)
- [ ] T093 Review all code for security issues (no hardcoded secrets, proper error handling)

---

## Summary

### Task Statistics

| Phase | Name | Task Count | Parallelizable |
|-------|------|-----------|-----------------|
| 1 | Setup | 9 | 0 |
| 2 | Foundational | 7 | 5 |
| 3 | US0 (Database) | 7 | 1 |
| 4 | US1 (Email/Password) | 19 | 9 |
| 5 | US3 (Google OAuth) | 11 | 5 |
| 6 | US2 (Reviewer) | 10 | 2 |
| 7 | US4 (Admin) | 10 | 3 |
| 8 | Polish | 15 | 2 |
| **TOTAL** | | **88** | **27** |

### MVP Scope (Recommended)

Complete these phases to validate email/password auth flow:

1. ✅ Phase 1: Setup (all 9 tasks)
2. ✅ Phase 2: Foundational (all 7 tasks)
3. ✅ Phase 3: US0 Database Setup (all 7 tasks)
4. ✅ Phase 4: US1 Email/Password Auth (all 19 tasks)
5. 🧪 Manual testing with 2-3 users
6. 📊 Gather feedback and validate assumptions

**Estimated MVP Timeline**: 3-4 days (Luis: 2 days for DB + backend, Jeremie: 2-3 days for frontend)

### Post-MVP Phases

After MVP validation:

5. Phase 5: US3 Google OAuth (11 tasks, ~1-2 days)
6. Phase 6: US2 Reviewer Access (10 tasks, ~1 day)
7. Phase 7: US4 Admin Management (10 tasks, ~1-2 days)
8. Phase 8: Polish (15 tasks, ~1 day)

---

## Execution Notes

- **Luis (Backend/Database)**: Focus on T001-T023 (database setup), then T035-T036, T044, T051-T053, T061-T063, T071-T073, T079
- **Jeremie (Frontend)**: Focus on T010-T016 (shared types + client), then T024-T034, T037-T042, T045-T050, T054-T057, T058-T060, T064-T065, T066-T070, T074-T078, T079-T093
- **Parallel**: After US0 completes, Jeremie can work on US1 while Luis prepares US3 backend
- **Testing**: Manual testing only (no automated tests per Constitution v1.4.1)
- **Deployment**: Manual Vercel deployment (no CI/CD for POC)

---

## Next Steps

1. Review this tasks.md with team
2. Assign tasks to Luis and Jeremie
3. Start Phase 1 (Setup) immediately
4. Track progress in GitHub issues or project board
5. After Phase 4 completes, conduct manual testing with real users
6. Gather feedback and decide on post-MVP scope
