-- Seed publication_records — scénarios crafted (RI-1243)
--
-- Un seul enregistrement : scénario 4 (service publié sur Réfugiés.info staging)
--   ff000001-... svc-04 publié

INSERT INTO publication_records (
  "id", "workflow_id", "editorial_record_id",
  "target", "remote_id", "status", "mode",
  "published_by", "author_id",
  "payload"
) VALUES (
  'ff000001-0000-0000-0000-000000000000',
  'cc000004-0000-0000-0000-000000000000',
  'ee000002-0000-0000-0000-000000000000',
  'https://staging.refugies.info',
  '699319f5bf030a64b65230e8',
  'published',
  'publish',
  NULL,
  NULL,
  '{"email": "admin@example.com", "dispositif": {"origin": "RCO", "translations": {"fr": {"content": {"titreInformatif": "Formation test — publiée", "titreMarque": "Formation test", "abstract": "Formation pour l''insertion professionnelle.", "markdown": "# Formation test — publiée"}}}}}'
) ON CONFLICT DO NOTHING;
