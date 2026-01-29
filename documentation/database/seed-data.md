# Seed Users Setup Guide

This document describes how to set up test users in the local Supabase development environment using the automated seeding script.

## Overview

We use an automated TypeScript script to seed users with their appropriate roles and language metadata directly into Supabase Auth.

- **Admin/Editor users**: Core team accounts.
- **Translator users**: One user per supported language (English, Arabic, Spanish, etc.).

## 🚀 Recommended Workflow

Instead of manual creation, use the provided script which handles everything (Auth + Metadata).

### 1. Configure Password
Define the default password in your `.env` file:
```bash
SEED_USER_PASSWORD="your-secure-password"
```
*If not set, the script will generate a secure random password and display it in the console.*

### 2. Run the Seed Script
```bash
npx tsx scripts/seed-users.ts
```

This script will:
- Create or update users for all roles (`admin`, `editor`, `translator`).
- For translators, it automatically creates one account per language defined in `LANGUAGES` constants.
- Sets the correct `user_metadata` (role and language) required for RLS policies.

## 👥 Test Accounts

After running the script, you can test the following accounts:

| Role | Email | Language |
| :--- | :--- | :--- |
| **Admin** | `luis@refugies.info` | - |
| **Editor** | `editor@refugies.info` | - |
| **Translator** | `translator.en@refugies.info` | English (en) |
| **Translator** | `translator.es@refugies.info` | Spanish (es) |

## 🔒 Security & RLS

The database uses **Row-Level Security**. Permissions are strictly enforced based on the role and language assigned during seeding:
- **Translators** can only see/edit translations matching their assigned language.
- **Admins/Editors** have full visibility across all languages.

---
*Note: This script is automatically called when you run a full `supabase db reset` via our dev workflows.*
