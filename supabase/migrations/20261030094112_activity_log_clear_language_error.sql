-- A failed plain-language rewrite shows in the activity log, with its report
-- (model, tokens, impact) so the Letta conversation stays reachable.
alter type public.activity_log_action add value 'clear_language_error' after 'clear_language';
