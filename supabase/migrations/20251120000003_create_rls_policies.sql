-- Migration: Create Row-Level Security (RLS) policies
-- Date: 2025-11-20
-- Description: Enable RLS on all auth tables and define role-based access policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_providers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Users table policies
-- ============================================================================

-- Policy: Users can SELECT their own row
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can SELECT all rows
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can UPDATE their own row
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can UPDATE any user
CREATE POLICY "Admins can update any user"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- AuthSession table policies
-- ============================================================================

-- Policy: Users can SELECT their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.auth_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can SELECT all sessions
CREATE POLICY "Admins can view all sessions"
  ON public.auth_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can DELETE their own sessions
CREATE POLICY "Users can delete their own sessions"
  ON public.auth_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can DELETE any session
CREATE POLICY "Admins can delete any session"
  ON public.auth_sessions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- AuditLog table policies
-- ============================================================================

-- Policy: Users can SELECT logs for their own actions
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can SELECT all logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- OAuthProvider table policies
-- ============================================================================

-- Policy: Users can SELECT their own OAuth providers
CREATE POLICY "Users can view their own OAuth providers"
  ON public.oauth_providers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can SELECT all OAuth providers
CREATE POLICY "Admins can view all OAuth providers"
  ON public.oauth_providers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can DELETE their own OAuth providers
CREATE POLICY "Users can delete their own OAuth providers"
  ON public.oauth_providers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can DELETE any OAuth provider
CREATE POLICY "Admins can delete any OAuth provider"
  ON public.oauth_providers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
