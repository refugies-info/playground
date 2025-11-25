# Seed Users Setup Guide

This document describes how to set up test users in the local Supabase development environment.

## Overview

The seed setup creates two types of users:
- **5 Bootstrap Admin users** created via migration (luis, jeremie, margot, nour, julie)
- **3 Editor users** created via seed data (alice, claudia, xavier)

**Security Note**: No plaintext passwords are stored in version control. Passwords must be set manually via Supabase Studio.

## Bootstrap Admin Users

These users are created automatically by the migration `20251120_001_create_initial_admins.sql`:

| Email | Role | Password |
|-------|------|----------|
| luis@refugies.info | Admin | Set manually in Supabase Studio |
| jeremie@refugies.info | Admin | Set manually in Supabase Studio |
| margot@refugies.info | Admin | Set manually in Supabase Studio |
| nour@refugies.info | Admin | Set manually in Supabase Studio |
| julie@refugies.info | Admin | Set manually in Supabase Studio |

## Editor Users

These users are created via `supabase/seed.sql`:

| Email | Role | Password |
|-------|------|----------|
| alice@refugies.info | Editor | Set manually in Supabase Studio |
| claudia@refugies.info | Editor | Set manually in Supabase Studio |
| xavier@refugies.info | Editor | Set manually in Supabase Studio |

## Setup Instructions

### Step 1: Start Local Supabase

```bash
supabase start
```

This will:
- Start the local Supabase instance
- Apply all migrations (including user table creation and initial admin creation)
- Seed the database with user records from `supabase/seed.sql`

### Step 2: Set Passwords in Supabase Studio

Open Supabase Studio in your browser:

```
http://127.0.0.1:54323
```

Set passwords for the bootstrap admin users:

1. Go to **Authentication** → **Users**
2. Click on **luis@refugies.info**
3. Click **Reset Password** → Set a secure password
4. Repeat for **jeremie@refugies.info**

### Step 3: Test Login

Visit the frontend application and test login with:
- Email: `luis@refugies.info`
- Password: (the password you just set)

### Step 4: Create Additional Users (Optional)

Luis or Jeremie can now create additional admin/editor users via the admin panel:

1. Log in as luis@refugies.info
2. Go to **User Management**
3. Click **Create User**
4. Enter email and role
5. User receives invitation email with password reset link

## Database Seeding

The database users are created automatically when you run `supabase start` via the `supabase/seed.sql` file.

The seed file creates:
- User records with email, role, and timestamps
- Audit log entries for each user creation

## Auth User Creation

Auth users (with passwords) are created separately in Supabase Studio or via the Supabase Auth API.

This is necessary because:
1. **Passwords are hashed** by Supabase Auth and cannot be stored directly in the database
2. **Auth users are managed by Supabase Auth service**, not the public.users table
3. **The public.users table** stores user metadata (email, role, timestamps)

### Creating Auth Users in Supabase Studio

1. Open http://127.0.0.1:54323
2. Go to **Authentication** → **Users**
3. Click **Create User** (top right)
4. Enter email and password
5. Click **Create User**

The auth user will be automatically linked to the database user by email address.

## Resetting Everything

To reset the database and start fresh:

```bash
# Stop Supabase
supabase stop

# Reset the database (removes all data and re-runs migrations)
supabase db reset

# Start again
supabase start
```

After resetting, recreate auth users in Supabase Studio:
1. Open http://127.0.0.1:54323
2. Go to **Authentication** → **Users**
3. Click **Create User** for each test user
4. Enter email and password

## Troubleshooting

### Users in database but not in Auth

If you see users in the `public.users` table but cannot log in, the auth users weren't created in Supabase Auth.

**Solution**: Create auth users manually in Supabase Studio:
1. Open http://127.0.0.1:54323
2. Go to **Authentication** → **Users**
3. Click **Create User** for each test user
4. Enter email and password
5. Click **Create User**

### Cannot connect to Supabase

Make sure Supabase is running:

```bash
supabase status
```

If not running, start it:

```bash
supabase start
```

## Next Steps

After seeding, you can:
1. Test the login flow with different user roles
2. Verify role-based access control (admins see admin panel, editors don't)
3. Test user management features (create new users, change roles, deactivate)
4. Validate audit logging (check audit_logs table for login events)

## Notes

- Passwords are stored securely in Supabase Auth (bcrypt hashed)
- User metadata (email, role) is stored in the public.users table
- All auth events are logged in the audit_logs table
- Users are marked as `is_active = true` by default (can log in)
