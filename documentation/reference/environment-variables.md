# Environment Variables Reference

Complete reference for all environment variables used in Content Playground.

---

## Overview

Environment variables are configuration values that change between environments (development, staging, production). They're stored in `.env.local` (development) and configured in deployment platforms (Vercel, Supabase).

---

## Supabase Configuration

### `NEXT_PUBLIC_SUPABASE_URL`

- **Type**: String (URL)
- **Required**: Yes
- **Example**: `https://your-project.supabase.co`
- **Description**: The URL of your Supabase project
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Type**: String (API Key)
- **Required**: Yes
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Description**: Anonymous key for client-side Supabase access
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys (anon)
- **Security**: Public (safe to expose in frontend code)

### `SUPABASE_SERVICE_ROLE_KEY`

- **Type**: String (API Key)
- **Required**: Yes (backend only)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Description**: Service role key for server-side Supabase access
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys (service_role)
- **Security**: Secret (never expose in frontend code)

---

## Letta Configuration

### `LETTA_API_KEY`

- **Type**: String (API Key)
- **Required**: Yes
- **Example**: `letta_key_abc123...`
- **Description**: API key for Letta Cloud authentication
- **Where to find**: Letta Cloud Dashboard → Settings → API Keys
- **Security**: Secret (never expose publicly)

### `LETTA_AGENT_ID`

- **Type**: String (Agent ID)
- **Required**: Yes
- **Example**: `agent_123abc...`
- **Description**: ID of the Letta agent to use
- **Where to find**: Letta Cloud Dashboard → Agents → [Your Agent] → ID
- **Security**: Can be public

### `LETTA_BASE_URL`

- **Type**: String (URL)
- **Required**: No
- **Default**: `https://api.letta.com`
- **Example**: `https://api.letta.com`
- **Description**: Base URL for Letta API (for self-hosted instances)

---

## Application Configuration

### `NEXT_PUBLIC_APP_URL`

- **Type**: String (URL)
- **Required**: Yes
- **Example**: `http://localhost:3000` (dev), `https://your-domain.com` (prod)
- **Description**: The public URL of the application
- **Usage**: Used for redirects, links in emails, OAuth callbacks

### `NODE_ENV`

- **Type**: String (Enum)
- **Required**: Yes
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Description**: Current environment
- **Usage**: Determines logging level, error handling, optimization

### `NEXT_PUBLIC_LOG_LEVEL`

- **Type**: String (Enum)
- **Required**: No
- **Values**: `debug`, `info`, `warn`, `error`
- **Default**: `info` (production), `debug` (development)
- **Description**: Minimum log level to display

---

## Database Configuration

### `DATABASE_URL`

- **Type**: String (Connection String)
- **Required**: No (Supabase handles this)
- **Example**: `postgresql://user:password@localhost:5432/postgres`
- **Description**: Direct PostgreSQL connection string (for migrations)
- **Usage**: Used by Supabase CLI for local development

---

## Authentication Configuration

### `NEXTAUTH_SECRET`

- **Type**: String (Random)
- **Required**: No (unless using NextAuth)
- **Example**: Generate with `openssl rand -base64 32`
- **Description**: Secret key for NextAuth session encryption
- **Security**: Secret (never expose publicly)

### `NEXTAUTH_URL`

- **Type**: String (URL)
- **Required**: No (unless using NextAuth)
- **Example**: `http://localhost:3000` (dev), `https://your-domain.com` (prod)
- **Description**: URL where NextAuth is deployed

---

## OAuth Configuration (Optional)

### `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

- **Type**: String (Client ID)
- **Required**: No (only if using Google OAuth)
- **Example**: `123456789-abc123def456.apps.googleusercontent.com`
- **Description**: Google OAuth client ID
- **Where to find**: Google Cloud Console → OAuth 2.0 Client IDs
- **Security**: Public (safe to expose in frontend code)

### `GOOGLE_CLIENT_SECRET`

- **Type**: String (Client Secret)
- **Required**: No (only if using Google OAuth)
- **Example**: `GOCSPX-abc123def456...`
- **Description**: Google OAuth client secret
- **Where to find**: Google Cloud Console → OAuth 2.0 Client IDs
- **Security**: Secret (never expose publicly)

---

## Email Configuration (Optional)

### `SMTP_HOST`

- **Type**: String (Hostname)
- **Required**: No (only if using custom SMTP)
- **Example**: `smtp.gmail.com`
- **Description**: SMTP server hostname

### `SMTP_PORT`

- **Type**: Number
- **Required**: No
- **Example**: `587` (TLS), `465` (SSL)
- **Description**: SMTP server port

### `SMTP_USER`

- **Type**: String (Email)
- **Required**: No
- **Example**: `noreply@example.com`
- **Description**: SMTP authentication username

### `SMTP_PASSWORD`

- **Type**: String (Password)
- **Required**: No
- **Description**: SMTP authentication password
- **Security**: Secret (never expose publicly)

---

## Development Configuration

### `DEBUG`

- **Type**: String (Pattern)
- **Required**: No
- **Example**: `app:*`, `supabase:*`
- **Description**: Debug logging pattern (uses debug module)

### `SKIP_ENV_VALIDATION`

- **Type**: Boolean
- **Required**: No
- **Default**: `false`
- **Description**: Skip environment variable validation (development only)

---

## Setup Instructions

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in required variables:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Letta
   LETTA_API_KEY=your-letta-api-key
   LETTA_AGENT_ID=your-agent-id

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. Start development server:
   ```bash
   pnpm dev
   ```

### Production Deployment

1. In Vercel Dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add all required variables
   - Set scope to **Production**

2. In Supabase Dashboard:
   - Go to **Settings** → **API**
   - Copy production URL and keys
   - Add to Vercel environment variables

3. Deploy:
   ```bash
   git push origin main
   ```

---

## Validation

The application validates environment variables on startup. If required variables are missing, you'll see an error:

```
Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
```

To skip validation (development only):
```bash
SKIP_ENV_VALIDATION=true pnpm dev
```

---

## Security Best Practices

- **Never commit** `.env.local` to Git
- **Never expose** secret keys in frontend code
- **Use `NEXT_PUBLIC_` prefix** only for public variables
- **Rotate keys** periodically
- **Use different keys** for each environment
- **Store secrets** in secure vaults (Vercel, AWS Secrets Manager, etc.)

---

## Troubleshooting

**"Missing required environment variable"**
- Check `.env.local` file exists
- Verify variable names are spelled correctly
- Ensure values are not empty

**"Invalid Supabase URL"**
- Check URL format: `https://your-project.supabase.co`
- Verify project exists in Supabase Dashboard

**"Authentication failed"**
- Check API keys are correct
- Verify keys haven't been rotated
- Check keys are for correct environment

---

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api)
- [Letta API Documentation](https://docs.letta.com/api)
