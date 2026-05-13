-- Seed workflows — scénarios crafted (RI-1243)
--
-- Schéma UUID stable :
--   cc000001-... svc-01 → bb000001 (pas d''editorial_record)
--   cc000002-... svc-02 → bb000002 (pas d''editorial_record)
--   cc000003-... svc-03 → bb000003 (editorial_record ee000001, brouillon)
--   cc000004-... svc-04 → bb000004 (editorial_record ee000002, publié)
--   cc000005-... svc-05 → bb000006 v2 (pas d''editorial_record — scénario clé RI-1243)
--   cc000006-... svc-06 → bb000008 v2 (editorial_record ee000003 sur v1 = obsolète)
--
-- editorial_record_id laissé NULL ici, backfillé dans 99_backfill_fks.sql

INSERT INTO workflows ("id", "ingestion_record_id", "editorial_record_id")
VALUES ('cc000001-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO workflows ("id", "ingestion_record_id", "editorial_record_id")
VALUES ('cc000002-0000-0000-0000-000000000000', 'bb000002-0000-0000-0000-000000000000', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO workflows ("id", "ingestion_record_id", "editorial_record_id")
VALUES ('cc000003-0000-0000-0000-000000000000', 'bb000003-0000-0000-0000-000000000000', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO workflows ("id", "ingestion_record_id", "editorial_record_id")
VALUES ('cc000004-0000-0000-0000-000000000000', 'bb000004-0000-0000-0000-000000000000', NULL)
ON CONFLICT DO NOTHING;

-- Scénario clé RI-1243 : workflow pointe sur la v2 (bb000006), pas d''editorial_record
-- → l''éditeur doit voir la v2 dans le BOMO
INSERT INTO workflows ("id", "ingestion_record_id", "editorial_record_id")
VALUES ('cc000005-0000-0000-0000-000000000000', 'bb000006-0000-0000-0000-000000000000', NULL)
ON CONFLICT DO NOTHING;

-- Scénario 6 : workflow pointe sur la v2 (bb000008)
-- mais editorial_record (ee000003) pointe encore sur la v1 (bb000007) → obsolescence
INSERT INTO workflows ("id", "ingestion_record_id", "editorial_record_id")
VALUES ('cc000006-0000-0000-0000-000000000000', 'bb000008-0000-0000-0000-000000000000', NULL)
ON CONFLICT DO NOTHING;

-- Scénario 7 : workflow pointe sur la v2 (bb000010), compliance 'compliant' sur la v2
-- → état nominal après RI-1243 : Letta a réévalué la v2, fiche visible normalement
INSERT INTO workflows ("id", "ingestion_record_id", "editorial_record_id")
VALUES ('cc000007-0000-0000-0000-000000000000', 'bb000010-0000-0000-0000-000000000000', NULL)
ON CONFLICT DO NOTHING;
