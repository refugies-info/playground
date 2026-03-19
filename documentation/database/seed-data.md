# Seed Data Setup Guide

This document describes the seed data in the local Supabase development environment.

## Overview

Seed data is automatically loaded when running `supabase start` or `supabase db reset`. The seed files are located in `supabase/seed/` and are configured in `supabase/config.toml`.

## User Seeding

Users are seeded via `supabase/seed/00_auth_users.sql` which creates:

- **Admin/Editor users**: Core team accounts
- **Translator users**: One user per supported language

The seed file:
- Inserts records directly into `auth.users` with bcrypt password hashes
- Creates corresponding `auth.identities` entries
- The `on_auth_user_created` trigger automatically creates `profiles` records

### Passwords

All seed users use the same password. For local development, this is a dummy password suitable for testing only.

**⚠️ Security Note**: Never use production password hashes in seed files. Always use dummy passwords for development.

## Adding New Users

To add a new seed user:

1. Add a new INSERT statement to `supabase/seed/00_auth_users.sql`
2. Generate a bcrypt hash for the password: `openssl rand -base64 12`
3. Run `supabase db reset` to apply changes

## Production Users

For production, users are invited via email using Supabase's built-in authentication system. The `on_auth_user_created` trigger automatically creates their profile when they accept the invitation.
