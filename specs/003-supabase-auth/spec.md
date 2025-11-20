# Feature Specification: Supabase Authentication & Authorization

**Feature Branch**: `003-supabase-auth`  
**Created**: 2025-11-20  
**Status**: Draft  
**Constitution Version**: v1.4.1  
**Input**: User description: "Implement the auth feature with Supabase"

## Clarifications

### Session 2025-11-20

- **Q: What is the scope of auth implementation for POC?**
  - **A**: POC focuses on Supabase Auth integration with role-based access control (RBAC) for three roles: editor, reviewer, admin. Multi-factor authentication (MFA) and social login deferred to MVP. Rationale: Enables core editorial workflow validation with minimal complexity.

- **Q: Should we implement auth in the frontend, backend, or both?**
  - **A**: Both. Frontend handles login/logout UI and session management via Supabase client. Backend (Letta agents) uses service role key for privileged operations. Supabase RLS (Row-Level Security) enforces authorization at database level. Rationale: Aligns with Constitution principle of human-in-the-loop and security-first design.

- **Q: What is the minimum viable auth flow for POC?**
  - **A**: Email/password authentication plus Google OAuth. Users can sign up/login via email or Google. Email verification required for email/password flow. JWT tokens stored in secure cookies. Rationale: Email/password provides control and testing flexibility; Google OAuth adds convenience and reduces signup friction for real users.

- **Q: Should we include Google OAuth in POC or defer to MVP?**
  - **A**: Include in POC. Google OAuth is low-effort (Supabase native support) and high-value (reduces signup friction). Implementation is straightforward: add Google provider config, add "Sign in with Google" button, Supabase handles token exchange. Rationale: Enables real user testing with minimal overhead.

- **Q: What is the current state of the Supabase project and database?**
  - **A**: Supabase project is initialized with connection tested, but no database schema created yet. This feature includes: (1) Design and create database schema (User, AuthSession, AuditLog, OAuthProvider tables), (2) Set up local Supabase dev environment with migrations, (3) Create migration files for all schema changes, (4) Implement RLS policies. Rationale: Database setup is prerequisite for auth implementation; local dev environment enables team iteration without affecting production.

- **Q: Should email verification be mandatory before first login or optional with warning?**
  - **A**: Optional with warning (Option B). Users can log in immediately after signup, but see persistent warning to verify email. Rationale: Reduces friction for real user testing while encouraging email verification. Users can still access system if they lose verification email.

- **Q: How should the system handle token refresh when a user is actively using the app?**
  - **A**: Automatic silent refresh (Option A). Supabase client automatically refreshes token before expiration in the background. User never sees login page during active session. If refresh fails, redirect to login on next request. Rationale: Best UX - keeps users logged in without interruption during active sessions.

- **Q: When an admin creates a new user, how should the user set their password?**
  - **A**: Temporary password + reset on first login (Option A). Admin sets temporary password, sends invitation email with login link. User logs in with temporary password, then must reset it immediately. Rationale: Secure and standard practice - ensures user has unique password, prevents password sharing.

- **Q: When should the system check for role changes - on every API request or only on page reload?**
  - **A**: On every API request (Option A). System validates user's current role on each API call. Role changes take effect immediately. Rationale: Most secure approach - prevents privilege escalation if role is downgraded while user is active.

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Database Engineer Sets Up Local Supabase & Migrations (Priority: P1)

As a database engineer, I need to set up a local Supabase development environment with migrations so that the team can develop and test auth features locally without affecting production.

**Why this priority**: Database setup is foundational for all auth implementation. Without local dev environment and migrations, the team cannot iterate safely or collaborate on schema changes.

**Independent Test**: Can be fully tested by verifying local Supabase runs, migrations execute successfully, schema is created correctly, and RLS policies are applied.

**Acceptance Scenarios**:

1. **Given** I clone the repository, **When** I run `supabase start`, **Then** local Supabase instance starts with all migrations applied
2. **Given** local Supabase is running, **When** I check the database schema, **Then** all tables (User, AuthSession, AuditLog, OAuthProvider) exist with correct columns
3. **Given** I create a new schema change, **When** I create a migration file, **Then** the migration can be applied to both local and production environments
4. **Given** migrations are applied, **When** I check RLS policies, **Then** all policies are active and enforcing role-based access
5. **Given** I run `supabase db reset`, **When** the command completes, **Then** database is reset to initial state with all migrations reapplied

---

### User Story 1 - Editor Signs Up and Logs In (Priority: P1)

As an editor, I need to sign up with my email and password, verify my email, and log in to the editorial dashboard so that I can access content editing features.

**Why this priority**: Core authentication flow is foundational for all editorial features. Without login, no user can access the system.

**Independent Test**: Can be fully tested by verifying signup form accepts email/password, verification email is sent, login succeeds with correct credentials, and dashboard is accessible after login.

**Acceptance Scenarios**:

1. **Given** I am on the signup page, **When** I enter a valid email and password, **Then** my account is created and a verification email is sent
2. **Given** I receive a verification email, **When** I click the verification link, **Then** my email is marked as verified
3. **Given** my email is verified, **When** I log in with correct credentials, **Then** I am redirected to the dashboard
4. **Given** I am logged in, **When** I navigate to any protected page, **Then** I remain authenticated
5. **Given** I am logged in, **When** I click logout, **Then** my session is cleared and I am redirected to login page

---

### User Story 2 - Reviewer Reviews Content with Elevated Permissions (Priority: P1)

As a reviewer, I need to log in with my reviewer credentials and access content that editors have submitted for review so that I can approve or reject edits.

**Why this priority**: Reviewer role is essential for the editorial workflow. Without reviewer access, content cannot progress through approval stages.

**Independent Test**: Can be fully tested by verifying reviewer login succeeds, reviewer can view submitted content that editors cannot see, and reviewer can perform review actions (approve/reject).

**Acceptance Scenarios**:

1. **Given** I am a reviewer, **When** I log in, **Then** I see only content submitted for review (not all drafts)
2. **Given** I am viewing submitted content, **When** I click "Approve", **Then** the content status changes and editors are notified
3. **Given** I am viewing submitted content, **When** I click "Reject", **Then** the content is returned to editor with feedback
4. **Given** I am a reviewer, **When** I try to edit content directly, **Then** I am denied access (read-only for reviewers)

---

### User Story 3 - Editor Signs In with Google (Priority: P1)

As an editor, I need to sign in with my Google account so that I can quickly access the editorial dashboard without managing another password.

**Why this priority**: Google OAuth reduces signup friction and enables faster onboarding. Equally important as email/password for real user testing.

**Independent Test**: Can be fully tested by verifying Google OAuth redirect flow works, user is created/linked in system, and dashboard is accessible after Google login.

**Acceptance Scenarios**:

1. **Given** I am on the login page, **When** I click "Sign in with Google", **Then** I am redirected to Google's OAuth consent screen
2. **Given** I authorize the application, **When** Google redirects back to the app, **Then** I am automatically logged in and redirected to the dashboard
3. **Given** I have previously signed in with Google, **When** I click "Sign in with Google" again, **Then** I am logged in without re-authorizing
4. **Given** I sign in with Google, **When** I check my profile, **Then** my email and name are populated from my Google account
5. **Given** I have both email/password and Google accounts linked, **When** I log in via either method, **Then** I access the same account and see my content

---

### User Story 4 - Admin Manages Users and Roles (Priority: P2)

As an admin, I need to create users, assign roles (editor, reviewer, admin), and manage permissions so that the editorial team can be onboarded and access controlled appropriately.

**Why this priority**: Admin features enable team management but are not blocking for initial POC validation. Can be tested with manual user creation initially.

**Independent Test**: Can be fully tested by verifying admin can create users, assign roles, and that role-based access control is enforced at the database level.

**Acceptance Scenarios**:

1. **Given** I am an admin, **When** I navigate to the user management page, **Then** I see a list of all users and their roles
2. **Given** I am an admin, **When** I create a new user and assign the "editor" role, **Then** the user receives an invitation email with temporary password and login link (per clarification Q3)
3. **Given** I am an admin, **When** I change a user's role from "editor" to "reviewer", **Then** their permissions are updated immediately
4. **Given** I am an admin, **When** I deactivate a user, **Then** they can no longer log in

---

### Edge Cases

- What happens if a user tries to log in with an unverified email? System MUST allow login and display persistent warning to verify email (per clarification Q1).
- What if a user forgets their password? System MUST provide a password reset flow via email.
- What if a session token expires? System MUST refresh the token automatically or redirect to login.
- What if a user's role is changed while they are logged in? System MUST validate user's current role on every API request (per clarification Q4). Role changes take effect immediately on next API call.

## Requirements *(mandatory)*

### Functional Requirements

#### Database Setup & Migrations

- **FR-001-DB**: System MUST support local Supabase development environment with `supabase start` command
- **FR-002-DB**: System MUST create and manage database schema via SQL migrations in `/migrations` directory
- **FR-003-DB**: System MUST support `supabase db reset` to reset local database to initial state
- **FR-004-DB**: System MUST create User table with columns: id (UUID), email (string), role (enum), created_at, updated_at, is_active
- **FR-005-DB**: System MUST create AuthSession table with columns: id (UUID), user_id (FK), token (string), expires_at, created_at
- **FR-006-DB**: System MUST create AuditLog table with columns: id (UUID), user_id (FK), action (string), status (enum), details (JSON), created_at
- **FR-007-DB**: System MUST create OAuthProvider table with columns: id (UUID), user_id (FK), provider (enum), provider_user_id, provider_email, created_at, updated_at
- **FR-008-DB**: System MUST implement RLS policies for User table (users can only read/update their own row; admins can read all)
- **FR-009-DB**: System MUST implement RLS policies for AuthSession table (users can only access their own sessions)
- **FR-010-DB**: System MUST implement RLS policies for AuditLog table (users can read logs for their own actions; admins can read all)
- **FR-011-DB**: System MUST implement RLS policies for OAuthProvider table (users can only access their own OAuth providers)
- **FR-012-DB**: System MUST support migration versioning (each migration has timestamp and sequential number)
- **FR-013-DB**: System MUST allow migrations to be applied to both local and production Supabase environments

#### Email/Password Authentication

- **FR-001**: System MUST support email/password signup with email verification
- **FR-002**: System MUST support email/password login with JWT token generation
- **FR-003**: System MUST support logout with session clearing
- **FR-004**: System MUST support password reset via email link
- **FR-005**: System MUST store user credentials securely using Supabase Auth (bcrypt hashing, no plaintext storage)
- **FR-006**: System MUST validate email format and password strength (minimum 8 characters, at least one uppercase, one number)

#### Google OAuth Authentication

- **FR-007**: System MUST support Google OAuth 2.0 login via Supabase Auth
- **FR-008**: System MUST handle Google OAuth redirect flow (authorization → token exchange → user creation/linking)
- **FR-009**: System MUST link Google OAuth accounts to existing email/password accounts if email matches
- **FR-010**: System MUST populate user profile (email, name) from Google account on first login
- **FR-011**: System MUST support account unlinking (user can disconnect Google from their account)
- **FR-012**: System MUST handle Google OAuth errors gracefully (invalid credentials, network errors, consent denied)

#### Authorization & Role-Based Access Control (RBAC)

- **FR-013**: System MUST support three roles: editor, reviewer, admin
- **FR-014**: System MUST enforce role-based access control at the database level using Supabase RLS policies
- **FR-015**: System MUST allow editors to create, edit, and submit content for review
- **FR-016**: System MUST allow reviewers to view submitted content and approve/reject edits
- **FR-017**: System MUST allow admins to create users, assign roles, and manage permissions
- **FR-018**: System MUST prevent unauthorized access to protected endpoints and data

#### Session Management

- **FR-019**: System MUST store JWT tokens in secure HTTP-only cookies
- **FR-020**: System MUST refresh expired tokens automatically in the background before expiration (per clarification Q2); if refresh fails, redirect to login on next request
- **FR-021**: System MUST validate tokens on every API request
- **FR-022**: System MUST clear session data on logout

#### Frontend Integration

- **FR-023**: Frontend MUST display login/signup forms with email and password fields
- **FR-024**: Frontend MUST display "Sign in with Google" button on login/signup pages
- **FR-025**: Frontend MUST display user profile with logout option and account linking status
- **FR-026**: Frontend MUST redirect unauthenticated users to login page
- **FR-027**: Frontend MUST display role-specific UI elements (e.g., "Approve" button only for reviewers)
- **FR-028**: Frontend MUST display account linking options (connect/disconnect Google from email account)

#### Backend Integration

- **FR-029**: Backend (Letta agents) MUST use service role key for privileged database operations
- **FR-030**: Backend MUST respect RLS policies when querying user-specific data
- **FR-031**: Backend MUST log all authentication and authorization events for audit trail
- **FR-032**: Backend MUST handle both email/password and Google OAuth authenticated requests

### Success Criteria

- **SC-001**: Local Supabase environment works: `supabase start` launches successfully, all migrations apply, `supabase db reset` works
- **SC-002**: Database schema is complete: User, AuthSession, AuditLog, OAuthProvider tables exist with correct columns and foreign keys
- **SC-003**: RLS policies are enforced: users can only access their own data; admins can access all data; policies prevent unauthorized access
- **SC-004**: All five user stories (DB setup, email/password signup/login, Google OAuth login, reviewer access, admin management) are independently testable and pass manual testing
- **SC-005**: Email/password authentication flow works end-to-end: signup → verification → login → dashboard access
- **SC-006**: Google OAuth flow works end-to-end: click button → Google consent → redirect → dashboard access
- **SC-007**: Account linking works: user can sign up with email, then link Google account; both methods access same account
- **SC-008**: Role-based access control is enforced: editors cannot access reviewer-only content, reviewers cannot edit content
- **SC-009**: Session management is secure: tokens are stored in HTTP-only cookies, expired tokens are handled gracefully
- **SC-010**: All authentication events are logged with user ID, action (email_signup, email_login, google_login, account_link), timestamp, and outcome
- **SC-011**: Password reset flow works end-to-end: user requests reset → email is sent → link is valid for 24 hours → password is updated
- **SC-012**: Admin can create users and assign roles; role changes are reflected immediately in the system

## Key Entities

### User

- **id** (UUID): Unique identifier (from Supabase Auth)
- **email** (string): User email address (unique)
- **role** (enum): One of [editor, reviewer, admin]
- **created_at** (timestamp): Account creation time
- **updated_at** (timestamp): Last profile update
- **is_active** (boolean): Whether user can log in

### AuthSession

- **id** (UUID): Unique identifier
- **user_id** (UUID): Reference to User
- **token** (string): JWT token
- **expires_at** (timestamp): Token expiration time
- **created_at** (timestamp): Session creation time

### AuditLog

- **id** (UUID): Unique identifier
- **user_id** (UUID): Reference to User
- **action** (string): Authentication action (email_signup, email_login, google_login, logout, password_reset, account_link, account_unlink, role_change)
- **status** (enum): One of [success, failure]
- **details** (JSON): Additional context (IP address, user agent, error message, auth_provider)
- **created_at** (timestamp): Event timestamp

### OAuthProvider

- **id** (UUID): Unique identifier
- **user_id** (UUID): Reference to User
- **provider** (enum): One of [google]
- **provider_user_id** (string): User ID from OAuth provider
- **provider_email** (string): Email from OAuth provider
- **created_at** (timestamp): Account linking time
- **updated_at** (timestamp): Last update time

## Assumptions

- Supabase project is already provisioned and connection tested (no schema created yet)
- Supabase CLI is installed locally (`supabase` command available)
- `/migrations` directory exists in project root for storing SQL migration files
- Email service (Supabase Auth's built-in email provider) will be configured for sending verification and password reset emails
- Google OAuth credentials (Client ID and Secret) will be obtained from Google Cloud Console before Phase 5
- Frontend and backend are deployed to environments where HTTP-only cookies can be set
- Users have access to email for verification and password reset flows
- Google OAuth redirect URIs will be configured in both Google Cloud Console and Supabase before Phase 2
- Team members can run local Supabase with `supabase start` and `supabase db reset` commands

## Dependencies

- **Supabase CLI**: Local development environment, migration management, database reset
- **Supabase Auth**: Email/password authentication, Google OAuth 2.0, JWT token generation, email verification
- **Supabase RLS**: Row-level security policies for role-based access control
- **SQL/PostgreSQL**: Migration files for schema creation and RLS policies
- **Google Cloud Console**: OAuth 2.0 credentials and redirect URI configuration
- **Frontend**: Next.js, Supabase client library (`@supabase/supabase-js`)
- **Backend**: Letta agents with Supabase service role integration

## Out of Scope (Deferred to MVP/V1)

- Multi-factor authentication (MFA)
- Additional social login providers (GitHub, Microsoft, etc.)
- SAML/LDAP integration
- Single sign-on (SSO)
- User profile customization (avatar, display name, etc.)
- Advanced audit logging with compliance reporting
- Rate limiting on login attempts
- IP-based access control
- Account recovery via phone/SMS
