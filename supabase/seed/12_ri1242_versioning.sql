-- RI-1242 targeted fixtures: DI active/latest versioning scenarios.
--
-- These rows are intentionally small and deterministic so local development can
-- validate the business rules without importing a full staging dump:
-- 1. first import: active = latest v1;
-- 2. update without editorial work: active follows latest v2;
-- 3. update with editorial work: active stays v1, latest becomes v2;
-- 4. pending update with reports: pending v2 already has audit + metadata.

INSERT INTO public.ingestion_runs (
  id,
  created_at,
  completed_at,
  type,
  status,
  total_fetched,
  total_inserted,
  total_updated,
  total_unchanged,
  total_errors,
  options,
  error_details,
  source
)
VALUES
  (
    '12420000-0000-4000-8000-000000000001',
    '2026-05-25 08:00:00+00',
    '2026-05-25 08:00:10+00',
    'services',
    'completed',
    4,
    4,
    0,
    0,
    0,
    '{}'::jsonb,
    NULL,
    'di'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.di_structures (
  id,
  created_at,
  updated_at,
  raw_data,
  data,
  content_hash,
  version,
  ingestion_run_id
)
VALUES (
  '12420000-0000-4000-8000-000000000010',
  '2026-05-25 08:00:00+00',
  '2026-05-25 08:00:00',
  '{"id":"carif-oref--ri1242-structure","nom":"Structure RI-1242"}',
  '{
    "id": "carif-oref--ri1242-structure",
    "nom": "Structure RI-1242",
    "commune": "Paris",
    "score_qualite": 0.95
  }'::jsonb,
  'ri1242-structure-hash',
  1,
  '12420000-0000-4000-8000-000000000001'
)
ON CONFLICT DO NOTHING;

-- Services are inserted with stable Data Inclusion IDs. The di_services trigger
-- keeps versions coherent when the same di_id appears more than once.
INSERT INTO public.di_services (
  id,
  created_at,
  updated_at,
  raw_data,
  data,
  content_hash,
  version,
  ingestion_run_id
)
VALUES
  (
    '12420000-0000-4000-8000-000000000101',
    '2026-05-25 08:01:00+00',
    '2026-05-25 08:01:00',
    '{"id":"carif-oref--ri1242-first-import","nom":"RI-1242 - premier import"}',
    '{
      "id": "carif-oref--ri1242-first-import",
      "structure_id": "carif-oref--ri1242-structure",
      "nom": "RI-1242 - premier import",
      "type": "formation",
      "commune": "Paris",
      "score_qualite": 0.95,
      "extra": {"action": {"session": [{"periode": {"debut": "20260601", "fin": "20260731"}}], "modalites-entrees-sorties": "1"}}
    }'::jsonb,
    'ri1242-first-import-v1',
    1,
    '12420000-0000-4000-8000-000000000001'
  ),
  (
    '12420000-0000-4000-8000-000000000201',
    '2026-05-25 08:02:00+00',
    '2026-05-25 08:02:00',
    '{"id":"carif-oref--ri1242-auto-update","nom":"RI-1242 - auto update v1"}',
    '{
      "id": "carif-oref--ri1242-auto-update",
      "structure_id": "carif-oref--ri1242-structure",
      "nom": "RI-1242 - auto update v1",
      "type": "formation",
      "commune": "Lyon",
      "score_qualite": 0.9,
      "extra": {"action": {"session": [{"periode": {"debut": "20260601", "fin": "20260731"}}], "modalites-entrees-sorties": "0"}}
    }'::jsonb,
    'ri1242-auto-update-v1',
    1,
    '12420000-0000-4000-8000-000000000001'
  ),
  (
    '12420000-0000-4000-8000-000000000202',
    '2026-05-25 08:03:00+00',
    '2026-05-25 08:03:00',
    '{"id":"carif-oref--ri1242-auto-update","nom":"RI-1242 - auto update v2"}',
    '{
      "id": "carif-oref--ri1242-auto-update",
      "structure_id": "carif-oref--ri1242-structure",
      "nom": "RI-1242 - auto update v2",
      "type": "formation",
      "commune": "Lyon",
      "score_qualite": 0.93,
      "extra": {"action": {"session": [{"periode": {"debut": "20260801", "fin": "20260930"}}], "modalites-entrees-sorties": "0"}}
    }'::jsonb,
    'ri1242-auto-update-v2',
    2,
    '12420000-0000-4000-8000-000000000001'
  ),
  (
    '12420000-0000-4000-8000-000000000301',
    '2026-05-25 08:04:00+00',
    '2026-05-25 08:04:00',
    '{"id":"carif-oref--ri1242-pending-update","nom":"RI-1242 - pending v1"}',
    '{
      "id": "carif-oref--ri1242-pending-update",
      "structure_id": "carif-oref--ri1242-structure",
      "nom": "RI-1242 - pending v1",
      "type": "formation",
      "commune": "Marseille",
      "score_qualite": 0.88,
      "extra": {"action": {"session": [{"periode": {"debut": "20260601", "fin": "20260731"}}], "modalites-entrees-sorties": "1"}}
    }'::jsonb,
    'ri1242-pending-update-v1',
    1,
    '12420000-0000-4000-8000-000000000001'
  ),
  (
    '12420000-0000-4000-8000-000000000302',
    '2026-05-25 08:05:00+00',
    '2026-05-25 08:05:00',
    '{"id":"carif-oref--ri1242-pending-update","nom":"RI-1242 - pending v2"}',
    '{
      "id": "carif-oref--ri1242-pending-update",
      "structure_id": "carif-oref--ri1242-structure",
      "nom": "RI-1242 - pending v2",
      "type": "formation",
      "commune": "Marseille",
      "score_qualite": 0.91,
      "extra": {"action": {"session": [{"periode": {"debut": "20260801", "fin": "20260930"}}], "modalites-entrees-sorties": "1"}}
    }'::jsonb,
    'ri1242-pending-update-v2',
    2,
    '12420000-0000-4000-8000-000000000001'
  ),
  (
    '12420000-0000-4000-8000-000000000401',
    '2026-05-25 08:06:00+00',
    '2026-05-25 08:06:00',
    '{"id":"carif-oref--ri1242-pending-unaudited","nom":"RI-1242 - pending unaudited v1"}',
    '{
      "id": "carif-oref--ri1242-pending-unaudited",
      "structure_id": "carif-oref--ri1242-structure",
      "nom": "RI-1242 - pending unaudited v1",
      "type": "formation",
      "commune": "Nantes",
      "score_qualite": 0.86,
      "extra": {"action": {"session": [{"periode": {"debut": "20260601", "fin": "20260731"}}], "modalites-entrees-sorties": "1"}}
    }'::jsonb,
    'ri1242-pending-unaudited-v1',
    1,
    '12420000-0000-4000-8000-000000000001'
  ),
  (
    '12420000-0000-4000-8000-000000000402',
    '2026-05-25 08:07:00+00',
    '2026-05-25 08:07:00',
    '{"id":"carif-oref--ri1242-pending-unaudited","nom":"RI-1242 - pending unaudited v2"}',
    '{
      "id": "carif-oref--ri1242-pending-unaudited",
      "structure_id": "carif-oref--ri1242-structure",
      "nom": "RI-1242 - pending unaudited v2",
      "type": "formation",
      "commune": "Nantes",
      "score_qualite": 0.89,
      "extra": {"action": {"session": [{"periode": {"debut": "20260801", "fin": "20260930"}}], "modalites-entrees-sorties": "1"}}
    }'::jsonb,
    'ri1242-pending-unaudited-v2',
    2,
    '12420000-0000-4000-8000-000000000001'
  )
ON CONFLICT DO NOTHING;

-- Ingestion records are inserted in business order so the workflow trigger can
-- exercise the real active/latest transitions.
INSERT INTO public.ingestion_records (
  id,
  created_at,
  updated_at,
  markdown,
  metadata,
  di_service_id,
  di_structure_id,
  origin,
  compliance_status
)
VALUES
  (
    '12420000-0000-4000-8000-000000001101',
    '2026-05-25 08:11:00+00',
    '2026-05-25 08:11:00+00',
    '# RI-1242 - premier import\n\n## Scénario de test\n\nCette fiche représente le cas nominal d’un premier import DI.\n\n- Version active attendue : v1\n- Dernière version disponible : v1\n- Mise à jour en attente : non\n- Label attendu dans l’admin : 1/1\n\nLe rapport d’audit et le rapport metadata sont attachés à cette ingestion v1.',
    '{"id":"carif-oref--ri1242-first-import","title":"RI-1242 - premier import","commune":"Paris","structure_id":"carif-oref--ri1242-structure"}'::jsonb,
    '12420000-0000-4000-8000-000000000101',
    '12420000-0000-4000-8000-000000000010',
    'DI',
    'compliant'
  ),
  (
    '12420000-0000-4000-8000-000000001201',
    '2026-05-25 08:12:00+00',
    '2026-05-25 08:12:00+00',
    '# RI-1242 - auto update v1\n\n## Scénario de test\n\nVersion initiale d’une fiche DI sans travail éditorial.\n\nAprès insertion de la v2, cette version ne doit plus être la source active, car sans éditorial le workflow suit automatiquement la dernière version DI.',
    '{"id":"carif-oref--ri1242-auto-update","title":"RI-1242 - auto update v1","commune":"Lyon","structure_id":"carif-oref--ri1242-structure"}'::jsonb,
    '12420000-0000-4000-8000-000000000201',
    '12420000-0000-4000-8000-000000000010',
    'DI',
    'compliant'
  ),
  (
    '12420000-0000-4000-8000-000000001202',
    '2026-05-25 08:13:00+00',
    '2026-05-25 08:13:00+00',
    '# RI-1242 - auto update v2\n\n## Scénario de test\n\nCette fiche représente une mise à jour DI sans éditorial existant.\n\n- Version active attendue : v2\n- Dernière version disponible : v2\n- Mise à jour en attente : non\n- Label attendu dans l’admin : 2/2\n\nComme il n’y a pas d’editorial_record, la dernière ingestion devient directement la source active.',
    '{"id":"carif-oref--ri1242-auto-update","title":"RI-1242 - auto update v2","commune":"Lyon","structure_id":"carif-oref--ri1242-structure"}'::jsonb,
    '12420000-0000-4000-8000-000000000202',
    '12420000-0000-4000-8000-000000000010',
    'DI',
    'compliant'
  ),
  (
    '12420000-0000-4000-8000-000000001301',
    '2026-05-25 08:14:00+00',
    '2026-05-25 08:14:00+00',
    '# RI-1242 - pending v1\n\n## Scénario de test\n\nVersion DI utilisée comme baseline éditoriale.\n\nAprès insertion de la v2, cette version doit rester la source active parce qu’un editorial_record existe.\n\n- Version active attendue : v1\n- Dernière version disponible après update : v2\n- Mise à jour en attente : oui\n- Label attendu dans l’admin : 1/2\n\nLes metadata v1 doivent rester celles de la fiche active.',
    '{"id":"carif-oref--ri1242-pending-update","title":"RI-1242 - pending v1","commune":"Marseille","structure_id":"carif-oref--ri1242-structure"}'::jsonb,
    '12420000-0000-4000-8000-000000000301',
    '12420000-0000-4000-8000-000000000010',
    'DI',
    'compliant'
  )
ON CONFLICT DO NOTHING;

-- Seed reports for v1 records that are already compliant and ready for display.
INSERT INTO public.letta_reports (
  id,
  created_at,
  updated_at,
  report_type,
  markdown,
  metadata,
  agent_id,
  status,
  raw_response,
  workflow_id
)
VALUES
  (
    '12420000-0000-4000-8000-000000002101',
    '2026-05-25 08:21:00+00',
    '2026-05-25 08:21:00',
    'ingestion',
    '# Audit RI-1242 first import',
    '{"compliant": true, "duplicate": false}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE ingestion_record_id = '12420000-0000-4000-8000-000000001101')
  ),
  (
    '12420000-0000-4000-8000-000000002102',
    '2026-05-25 08:21:10+00',
    '2026-05-25 08:21:10',
    'metadata',
    '# Metadata RI-1242 first import',
    '{"metadata_ri":{"title":"RI-1242 - premier import","location":["75 - Paris"]},"provenance":[]}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE ingestion_record_id = '12420000-0000-4000-8000-000000001101')
  ),
  (
    '12420000-0000-4000-8000-000000002301',
    '2026-05-25 08:23:00+00',
    '2026-05-25 08:23:00',
    'ingestion',
    '# Audit RI-1242 pending v1',
    '{"compliant": true, "duplicate": false}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE ingestion_record_id = '12420000-0000-4000-8000-000000001301')
  ),
  (
    '12420000-0000-4000-8000-000000002302',
    '2026-05-25 08:23:10+00',
    '2026-05-25 08:23:10',
    'metadata',
    '# Metadata RI-1242 pending v1',
    '{"metadata_ri":{"title":"RI-1242 - pending v1","location":["13 - Bouches-du-Rhône"]},"provenance":[]}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE ingestion_record_id = '12420000-0000-4000-8000-000000001301')
  ),
  (
    '12420000-0000-4000-8000-000000002201',
    '2026-05-25 08:22:00+00',
    '2026-05-25 08:22:00',
    'ingestion',
    '# Audit RI-1242 auto update v2\n\nLa version v2 est conforme et devient active car aucun éditorial n’existe.',
    '{"compliant": true, "duplicate": false}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE ingestion_record_id = '12420000-0000-4000-8000-000000001202')
  ),
  (
    '12420000-0000-4000-8000-000000002202',
    '2026-05-25 08:22:10+00',
    '2026-05-25 08:22:10',
    'metadata',
    '# Metadata RI-1242 auto update v2',
    '{"metadata_ri":{"title":"RI-1242 - auto update v2","location":["69 - Rhône"]},"provenance":[]}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE ingestion_record_id = '12420000-0000-4000-8000-000000001202')
  ),
  (
    '12420000-0000-4000-8000-000000002401',
    '2026-05-25 08:26:30+00',
    '2026-05-25 08:26:30',
    'ingestion',
    '# Audit RI-1242 pending unaudited v1\n\nLa source active v1 est conforme. La version v2 reste non auditée et doit être claimable.',
    '{"compliant": true, "duplicate": false}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE ingestion_record_id = '12420000-0000-4000-8000-000000001401')
  ),
  (
    '12420000-0000-4000-8000-000000002402',
    '2026-05-25 08:26:40+00',
    '2026-05-25 08:26:40',
    'metadata',
    '# Metadata RI-1242 pending unaudited v1',
    '{"metadata_ri":{"title":"RI-1242 - pending unaudited v1","location":["44 - Loire-Atlantique"]},"provenance":[]}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE ingestion_record_id = '12420000-0000-4000-8000-000000001401')
  )
ON CONFLICT DO NOTHING;

UPDATE public.ingestion_records
SET ingestion_report_id = '12420000-0000-4000-8000-000000002101',
    metadata_report_id = '12420000-0000-4000-8000-000000002102'
WHERE id = '12420000-0000-4000-8000-000000001101';

UPDATE public.ingestion_records
SET ingestion_report_id = '12420000-0000-4000-8000-000000002301',
    metadata_report_id = '12420000-0000-4000-8000-000000002302'
WHERE id = '12420000-0000-4000-8000-000000001301';

UPDATE public.ingestion_records
SET ingestion_report_id = '12420000-0000-4000-8000-000000002201',
    metadata_report_id = '12420000-0000-4000-8000-000000002202'
WHERE id = '12420000-0000-4000-8000-000000001202';

UPDATE public.ingestion_records
SET ingestion_report_id = '12420000-0000-4000-8000-000000002401',
    metadata_report_id = '12420000-0000-4000-8000-000000002402'
WHERE id = '12420000-0000-4000-8000-000000001401';

-- Create editorial baselines before inserting the later pending versions. The
-- editorial trigger links each workflow to its editorial_record.
INSERT INTO public.editorial_records (
  id,
  created_at,
  updated_at,
  ingestion_record_id,
  markdown,
  metadata,
  author_id,
  online_status,
  work_status
)
VALUES
  (
    '12420000-0000-4000-8000-000000003301',
    '2026-05-25 08:24:00+00',
    '2026-05-25 08:24:00+00',
    '12420000-0000-4000-8000-000000001301',
    '# RI-1242 - pending éditorialisé\n\n## Scénario de test visible côté admin\n\nCette fiche éditoriale est volontairement basée sur la source DI v1.\n\nUne version DI v2 existe aussi, mais elle doit rester en mise à jour en attente tant qu’elle n’est pas acceptée explicitement.\n\nComportement attendu :\n\n- le contenu actif affiché dans l’éditeur reste ce contenu éditorial v1 ;\n- le workflow affiche active v1 / latest v2 ;\n- le label de version attendu est 1/2 ;\n- les rapports metadata v2 ne doivent pas remplacer les metadata actives v1.',
    '{"title":"RI-1242 - pending éditorialisé"}'::jsonb,
    'b1bb04e3-c07b-4e22-a7eb-fea7db0a2b1c',
    NULL,
    'draft'
  )
ON CONFLICT DO NOTHING;

-- Insert the newer pending version after editorial work exists: the trigger must
-- update latest_ingestion_record_id but keep ingestion_record_id on v1.
INSERT INTO public.ingestion_records (
  id,
  created_at,
  updated_at,
  markdown,
  metadata,
  di_service_id,
  di_structure_id,
  origin,
  compliance_status
)
VALUES
  (
    '12420000-0000-4000-8000-000000001302',
    '2026-05-25 08:25:00+00',
    '2026-05-25 08:25:00+00',
    '# RI-1242 - pending v2\n\n## Scénario de test\n\nNouvelle version DI pour une fiche déjà éditorialisée.\n\nCette version est conforme et possède ses propres rapports audit + metadata, mais elle ne doit pas devenir active automatiquement.\n\n- Version active attendue sur le workflow : v1\n- Dernière version disponible : v2\n- Mise à jour en attente : oui\n- Label attendu dans l’admin : 1/2\n\nCe contenu doit être visible uniquement comme source latest/pending, pas comme contenu éditorial actif.',
    '{"id":"carif-oref--ri1242-pending-update","title":"RI-1242 - pending v2","commune":"Marseille","structure_id":"carif-oref--ri1242-structure"}'::jsonb,
    '12420000-0000-4000-8000-000000000302',
    '12420000-0000-4000-8000-000000000010',
    'DI',
    'compliant'
  ),
  (
    '12420000-0000-4000-8000-000000001401',
    '2026-05-25 08:26:00+00',
    '2026-05-25 08:26:00+00',
    '# RI-1242 - pending unaudited v1\n\n## Scénario de test\n\nBaseline éditoriale v1 pour tester le claim d’une mise à jour DI non auditée.\n\nAprès insertion de la v2 non auditée, cette v1 doit rester active et la v2 doit être claimable par le workflow d’audit.',
    '{"id":"carif-oref--ri1242-pending-unaudited","title":"RI-1242 - pending unaudited v1","commune":"Nantes","structure_id":"carif-oref--ri1242-structure"}'::jsonb,
    '12420000-0000-4000-8000-000000000401',
    '12420000-0000-4000-8000-000000000010',
    'DI',
    'compliant'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.editorial_records (
  id,
  created_at,
  updated_at,
  ingestion_record_id,
  markdown,
  metadata,
  author_id,
  online_status,
  work_status
)
VALUES (
  '12420000-0000-4000-8000-000000003401',
  '2026-05-25 08:27:00+00',
  '2026-05-25 08:27:00+00',
  '12420000-0000-4000-8000-000000001401',
  '# RI-1242 - pending unaudited éditorialisé\n\n## Scénario de test visible côté admin\n\nCette fiche éditoriale est basée sur la source DI v1.\n\nUne version DI v2 existe, mais elle n’a pas encore de rapport d’audit ni de rapport metadata.\n\nComportement attendu :\n\n- le workflow affiche active v1 / latest v2 ;\n- le label de version attendu est 1/2 ;\n- la v2 doit être retournée par claim_di_audit_targets ;\n- is_pending_update doit valoir true dans le résultat de claim.',
  '{"title":"RI-1242 - pending unaudited éditorialisé"}'::jsonb,
  'b1bb04e3-c07b-4e22-a7eb-fea7db0a2b1c',
  NULL,
  'draft'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.ingestion_records (
  id,
  created_at,
  updated_at,
  markdown,
  metadata,
  di_service_id,
  di_structure_id,
  origin,
  compliance_status
)
VALUES (
  '12420000-0000-4000-8000-000000001402',
  '2026-05-25 08:28:00+00',
  '2026-05-25 08:28:00+00',
  '# RI-1242 - pending unaudited v2\n\n## Scénario de test\n\nNouvelle version DI non auditée pour une fiche déjà éditorialisée.\n\nCette version doit rester en pending update et être récupérée par le batch d’audit DI.\n\n- Version active attendue sur le workflow : v1\n- Dernière version disponible : v2\n- Audit attendu : à générer\n- Metadata attendue : à générer seulement si l’audit conclut compliant\n- claim_di_audit_targets doit retourner is_pending_update = true.',
  '{"id":"carif-oref--ri1242-pending-unaudited","title":"RI-1242 - pending unaudited v2","commune":"Nantes","structure_id":"carif-oref--ri1242-structure"}'::jsonb,
  '12420000-0000-4000-8000-000000000402',
  '12420000-0000-4000-8000-000000000010',
  'DI',
  NULL
)
ON CONFLICT DO NOTHING;

-- Reports for the already-audited pending v2. These must attach to the pending
-- ingestion record, not to the editorial baseline.
INSERT INTO public.letta_reports (
  id,
  created_at,
  updated_at,
  report_type,
  markdown,
  metadata,
  agent_id,
  status,
  raw_response,
  workflow_id
)
VALUES
  (
    '12420000-0000-4000-8000-000000002303',
    '2026-05-25 08:29:00+00',
    '2026-05-25 08:29:00',
    'ingestion',
    '# Audit RI-1242 pending v2',
    '{"compliant": true, "duplicate": false}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE latest_ingestion_record_id = '12420000-0000-4000-8000-000000001302')
  ),
  (
    '12420000-0000-4000-8000-000000002304',
    '2026-05-25 08:29:10+00',
    '2026-05-25 08:29:10',
    'metadata',
    '# Metadata RI-1242 pending v2',
    '{"metadata_ri":{"title":"RI-1242 - pending v2","location":["13 - Bouches-du-Rhône"]},"provenance":[]}'::jsonb,
    'seed-ri1242',
    'complete',
    NULL,
    (SELECT id FROM public.workflows WHERE latest_ingestion_record_id = '12420000-0000-4000-8000-000000001302')
  )
ON CONFLICT DO NOTHING;

UPDATE public.ingestion_records
SET ingestion_report_id = '12420000-0000-4000-8000-000000002303',
    metadata_report_id = '12420000-0000-4000-8000-000000002304'
WHERE id = '12420000-0000-4000-8000-000000001302';

-- Keep scenario descriptions fresh when this seed is re-run on an existing local
-- database. The inserts above are ON CONFLICT DO NOTHING to avoid disturbing FK
-- relationships, so markdown updates are applied explicitly here.
UPDATE public.ingestion_records
SET markdown = $ri1242$# RI-1242 - premier import

## Scénario de test

Cette fiche représente le cas nominal d’un premier import DI.

- Version active attendue : v1
- Dernière version disponible : v1
- Mise à jour en attente : non
- Label attendu dans l’admin : 1/1

Le rapport d’audit et le rapport metadata sont attachés à cette ingestion v1.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000001101';

UPDATE public.ingestion_records
SET markdown = $ri1242$# RI-1242 - auto update v1

## Scénario de test

Version initiale d’une fiche DI sans travail éditorial.

Après insertion de la v2, cette version ne doit plus être la source active, car sans éditorial le workflow suit automatiquement la dernière version DI.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000001201';

UPDATE public.ingestion_records
SET markdown = $ri1242$# RI-1242 - auto update v2

## Scénario de test

Cette fiche représente une mise à jour DI sans éditorial existant.

- Version active attendue : v2
- Dernière version disponible : v2
- Mise à jour en attente : non
- Label attendu dans l’admin : 2/2

Comme il n’y a pas d’editorial_record, la dernière ingestion devient directement la source active.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000001202';

UPDATE public.ingestion_records
SET markdown = $ri1242$# RI-1242 - pending v1

## Scénario de test

Version DI utilisée comme baseline éditoriale.

Après insertion de la v2, cette version doit rester la source active parce qu’un editorial_record existe.

- Version active attendue : v1
- Dernière version disponible après update : v2
- Mise à jour en attente : oui
- Label attendu dans l’admin : 1/2

Les metadata v1 doivent rester celles de la fiche active.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000001301';

UPDATE public.ingestion_records
SET markdown = $ri1242$# RI-1242 - pending v2

## Scénario de test

Nouvelle version DI pour une fiche déjà éditorialisée.

Cette version est conforme et possède ses propres rapports audit + metadata, mais elle ne doit pas devenir active automatiquement.

- Version active attendue sur le workflow : v1
- Dernière version disponible : v2
- Mise à jour en attente : oui
- Label attendu dans l’admin : 1/2

Ce contenu doit être visible uniquement comme source latest/pending, pas comme contenu éditorial actif.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000001302';

UPDATE public.ingestion_records
SET markdown = $ri1242$# RI-1242 - pending unaudited v1

## Scénario de test

Baseline éditoriale v1 pour tester le claim d’une mise à jour DI non auditée.

Après insertion de la v2 non auditée, cette v1 doit rester active et la v2 doit être claimable par le workflow d’audit.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000001401';

UPDATE public.ingestion_records
SET markdown = $ri1242$# RI-1242 - pending unaudited v2

## Scénario de test

Nouvelle version DI non auditée pour une fiche déjà éditorialisée.

Cette version doit rester en pending update et être récupérée par le batch d’audit DI.

- Version active attendue sur le workflow : v1
- Dernière version disponible : v2
- Audit attendu : à générer
- Metadata attendue : à générer seulement si l’audit conclut compliant
- claim_di_audit_targets doit retourner is_pending_update = true.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000001402';

UPDATE public.editorial_records
SET markdown = $ri1242$# RI-1242 - pending éditorialisé

## Scénario de test visible côté admin

Cette fiche éditoriale est volontairement basée sur la source DI v1.

Une version DI v2 existe aussi, mais elle doit rester en mise à jour en attente tant qu’elle n’est pas acceptée explicitement.

Comportement attendu :

- le contenu actif affiché dans l’éditeur reste ce contenu éditorial v1 ;
- le workflow affiche active v1 / latest v2 ;
- le label de version attendu est 1/2 ;
- les rapports metadata v2 ne doivent pas remplacer les metadata actives v1.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000003301';

ALTER TABLE public.editorial_records DISABLE TRIGGER on_editorial_record_link_reports;

UPDATE public.editorial_records
SET metadata_report_id = '12420000-0000-4000-8000-000000002302'
WHERE id = '12420000-0000-4000-8000-000000003301';

UPDATE public.editorial_records
SET markdown = $ri1242$# RI-1242 - pending unaudited éditorialisé

## Scénario de test visible côté admin

Cette fiche éditoriale est basée sur la source DI v1.

Une version DI v2 existe, mais elle n’a pas encore de rapport d’audit ni de rapport metadata.

Comportement attendu :

- le workflow affiche active v1 / latest v2 ;
- le label de version attendu est 1/2 ;
- la v2 doit être retournée par claim_di_audit_targets ;
- is_pending_update doit valoir true dans le résultat de claim.$ri1242$
WHERE id = '12420000-0000-4000-8000-000000003401';

UPDATE public.editorial_records
SET metadata_report_id = '12420000-0000-4000-8000-000000002402'
WHERE id = '12420000-0000-4000-8000-000000003401';

ALTER TABLE public.editorial_records ENABLE TRIGGER on_editorial_record_link_reports;
