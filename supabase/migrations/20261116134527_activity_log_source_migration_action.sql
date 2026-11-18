-- RI-1690: journal entry when a fiche switches source (e.g. DI → RCO).
-- Own migration: a new enum value cannot be used in the transaction that adds it.
alter type public.activity_log_action add value 'source_migration' after 'update';
