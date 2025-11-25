-- Migration: Create audit logging triggers
-- Date: 2025-11-20
-- Description: Create triggers to automatically log authentication events to audit_logs table

-- ============================================================================
-- Helper function to log auth events
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_auth_event(
  p_user_id UUID,
  p_action TEXT,
  p_status TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, status, details)
  VALUES (p_user_id, p_action, p_status, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Trigger: Log login events when session is created
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_log_login()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_auth_event(
    NEW.user_id,
    'email_login',
    'success',
    jsonb_build_object(
      'session_id', NEW.id,
      'expires_at', NEW.expires_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_login ON public.auth_sessions;
CREATE TRIGGER trigger_log_login
  AFTER INSERT ON public.auth_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_login();

-- ============================================================================
-- Trigger: Log logout events when session is deleted
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_log_logout()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_auth_event(
    OLD.user_id,
    'logout',
    'success',
    jsonb_build_object(
      'session_id', OLD.id,
      'duration_seconds', EXTRACT(EPOCH FROM (now() - OLD.created_at))
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_logout ON public.auth_sessions;
CREATE TRIGGER trigger_log_logout
  AFTER DELETE ON public.auth_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_logout();

-- ============================================================================
-- Trigger: Log role changes when user role is updated
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM public.log_auth_event(
      NEW.id,
      'role_change',
      'success',
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_role_change ON public.users;
CREATE TRIGGER trigger_log_role_change
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_role_change();
