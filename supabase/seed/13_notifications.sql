-- Seed notifications (RI-1415)
--
-- Couvre les 5 types, les 3 regroupements temporels, les 3 onglets et un
-- événement sans auteur (PapaIA). Dates relatives à `now()` pour que le seed
-- reste valide quel que soit le jour où on le rejoue.
--
-- ⚠️ L'éventail est volontairement plus large qu'en production : chaque événement
-- va à tous les profils sauf son auteur, pour que n'importe quel compte de test
-- voie les 5 types. Les vraies règles vivent dans `dispatchNotifications`.

-- ---------------------------------------------------------------------------
-- Les événements
-- ---------------------------------------------------------------------------

insert into activity_logs (id, action, activity, author_id, target_profile_id, workflow_id, created_at)
values
  -- Aujourd'hui
  ('c1000000-0000-4000-8000-000000000001', 'publication', '{"language": "fr"}'::jsonb,
   '9605264d-dd1d-423a-80da-49bae335a41b', null, 'ef7a8315-f3e6-4274-bd31-11af28ce12b3', now() - interval '2 hours'),
  ('c1000000-0000-4000-8000-000000000002', 'note',
   '{"note": "Attention, la date de session est incohérente avec la fiche RCO — à vérifier avant publication."}'::jsonb,
   '7cd263de-3991-4c49-86dc-d37fcfb371ea', null, '18fc7d09-52ec-4b16-b732-2e5e5d37f0a1', now() - interval '5 hours'),
  ('c1000000-0000-4000-8000-000000000003', 'assignment', '{}'::jsonb,
   'b1bb04e3-c07b-4e22-a7eb-fea7db0a2b1c', '7cd263de-3991-4c49-86dc-d37fcfb371ea',
   '0a930a51-906a-4710-9bb9-d96c045c022d', now() - interval '30 minutes'),

  -- 7 derniers jours
  ('c1000000-0000-4000-8000-000000000004', 'update_compliance', '{"complianceStatus": "non_compliant"}'::jsonb,
   null, null, 'e173e735-552e-46a6-9b4b-a56521d43ce0', now() - interval '2 days'),
  ('c1000000-0000-4000-8000-000000000005', 'archive', '{}'::jsonb,
   '9ab52a92-e96f-4912-bf41-fad212ddae44', null, '3aa0a9ec-32ce-4f18-9d65-b2816cd6cffa', now() - interval '3 days'),
  ('c1000000-0000-4000-8000-000000000006', 'publication', '{"language": "en"}'::jsonb,
   'f9fff286-ed64-43f4-b624-d17a86d4d6d0', null, '18fc7d09-52ec-4b16-b732-2e5e5d37f0a1', now() - interval '5 days'),

  -- Plus anciennes
  ('c1000000-0000-4000-8000-000000000007', 'update', '{}'::jsonb,
   null, null, 'ef7a8315-f3e6-4274-bd31-11af28ce12b3', now() - interval '12 days'),
  ('c1000000-0000-4000-8000-000000000008', 'note',
   '{"note": "Reformulation du paragraphe sur les conditions d''accès, le langage clair a été appliqué."}'::jsonb,
   '67a533de-ab5c-4508-bad6-83500c23331a', null, 'e173e735-552e-46a6-9b4b-a56521d43ce0', now() - interval '20 days'),
  ('c1000000-0000-4000-8000-000000000009', 'archive', '{}'::jsonb,
   '9605264d-dd1d-423a-80da-49bae335a41b', null, '0a930a51-906a-4710-9bb9-d96c045c022d', now() - interval '45 days')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Les notifications
-- ---------------------------------------------------------------------------
-- `created_at` est repris de l'événement : la colonne est dénormalisée pour que
-- le tri antéchronologique par destinataire tienne dans un index local.
-- `on conflict do nothing` s'appuie sur la contrainte d'unicité
-- (activity_log_id, recipient_id) : le seed est rejouable.

-- Non lues → pastille orange dans le menu, point bleu dans la liste.
insert into notifications (recipient_id, activity_log_id, read_at, archived_at, created_at)
select p.id, l.id, null, null, l.created_at
from activity_logs l
cross join profiles p
where l.id in (
  'c1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000006'
)
  and p.id is distinct from l.author_id
on conflict do nothing;

-- Lues → aucun marqueur. Lues une heure après l'événement.
insert into notifications (recipient_id, activity_log_id, read_at, archived_at, created_at)
select p.id, l.id, l.created_at + interval '1 hour', null, l.created_at
from activity_logs l
cross join profiles p
where l.id in (
  'c1000000-0000-4000-8000-000000000004',
  'c1000000-0000-4000-8000-000000000005',
  'c1000000-0000-4000-8000-000000000007',
  'c1000000-0000-4000-8000-000000000008'
)
  and p.id is distinct from l.author_id
on conflict do nothing;

-- Archivée → sort de la liste, reste dans l'onglet « Archivées ». Laissée non lue
-- volontairement : les deux états sont indépendants.
insert into notifications (recipient_id, activity_log_id, read_at, archived_at, created_at)
select p.id, l.id, null, now() - interval '40 days', l.created_at
from activity_logs l
cross join profiles p
where l.id = 'c1000000-0000-4000-8000-000000000009'
  and p.id is distinct from l.author_id
on conflict do nothing;
