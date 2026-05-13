-- Seed editorial_records — scénarios crafted (RI-1243)
--
-- Schéma UUID stable :
--   ee000001-... svc-03 — brouillon en cours d''édition
--   ee000002-... svc-04 — publié sur Réfugiés.info
--   ee000003-... svc-06 — brouillon sur v1 (obsolète — workflow pointe sur v2)

ALTER TABLE editorial_records DISABLE TRIGGER on_new_editorial_record;
ALTER TABLE editorial_records DISABLE TRIGGER on_editorial_record_link_reports;

-- Scénario 3 : brouillon en cours d''édition
INSERT INTO editorial_records (
  "id", "ingestion_record_id",
  "work_status", "online_status",
  "markdown", "metadata",
  "author_id"
) VALUES (
  'ee000001-0000-0000-0000-000000000000',
  'bb000003-0000-0000-0000-000000000000',
  'draft', NULL,
  E'# Formation test — brouillon éditeur

*(Réécrit par l''équipe éditoriale)*

Cette formation vous aide à progresser en français à l''oral et à l''écrit.

## Pourquoi c''est intéressant ?

Cours adaptés à votre niveau, en présentiel, 3h par semaine.

## Comment s''inscrire ?

Contactez directement l''organisme par téléphone.',
  '{"themes": ["Apprendre le français"]}',
  'b1bb04e3-c07b-4e22-a7eb-fea7db0a2b1c' -- jeremie@refugies.info
) ON CONFLICT DO NOTHING;

-- Scénario 4 : publié sur Réfugiés.info
INSERT INTO editorial_records (
  "id", "ingestion_record_id",
  "work_status", "online_status",
  "markdown", "metadata",
  "author_id"
) VALUES (
  'ee000002-0000-0000-0000-000000000000',
  'bb000004-0000-0000-0000-000000000000',
  'draft', 'published',
  '# Formation test — publiée

*(Contenu validé et publié sur Réfugiés.info)*

Cette formation vous aide à trouver un emploi grâce au français professionnel.

## Pourquoi c''est intéressant ?

Modules pratiques : CV, lettre de motivation, entretien d''embauche.

## Comment s''inscrire ?

Envoyez un email à l''organisme de formation.',
  '{"themes": ["Trouver un emploi"]}',
  'd6378d34-3386-41bf-9698-98a8ffea6871' -- alice@refugies.info
) ON CONFLICT DO NOTHING;

-- Scénario 6 : brouillon sur v1 — obsolète car le workflow pointe désormais sur v2
-- L''ingestion_record_id pointe sur bb000007 (v1) alors que le workflow est sur bb000008 (v2)
INSERT INTO editorial_records (
  "id", "ingestion_record_id",
  "work_status", "online_status",
  "markdown", "metadata",
  "author_id"
) VALUES (
  'ee000003-0000-0000-0000-000000000000',
  'bb000007-0000-0000-0000-000000000000',
  'draft', NULL,
  '# Formation test — brouillon sur v1 (obsolète)

*(L''éditeur a commencé ce brouillon sur la v1, mais une v2 est arrivée depuis)*

Ateliers sociolinguistiques hebdomadaires pour les réfugiés.',
  '{}',
  '67a533de-ab5c-4508-bad6-83500c23331a' -- editor@refugies.info
) ON CONFLICT DO NOTHING;

ALTER TABLE editorial_records ENABLE TRIGGER on_new_editorial_record;
ALTER TABLE editorial_records ENABLE TRIGGER on_editorial_record_link_reports;
