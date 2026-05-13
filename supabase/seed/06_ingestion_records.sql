-- Seed ingestion_records — scénarios crafted à partir de données DI réelles (RI-1243)
--
-- Format markdown : frontmatter YAML avec champs scalaires simples uniquement
--   (pas de blocs >- multi-lignes qui cassent le parseur)
--   Le contenu narratif est dans le corps après ---.
--
-- UUIDs stables :
--   bb000001-... carif-oref--01_GE2021586      v1  compliant
--   bb000002-... carif-oref--01_GE2030516      v1  non_compliant
--   bb000003-... carif-oref--07_763179S        v1  compliant
--   bb000004-... carif-oref--07_776575S        v1  compliant
--   bb000005-... carif-oref--14_SE_0001116947  v1  compliant  (ancienne version)
--   bb000006-... carif-oref--14_SE_0001116947  v2  NULL       (MAJ DI — scénario clé RI-1243)
--   bb000007-... carif-oref--14_SE_0001597312  v1  compliant  (editorial_record pointe ici)
--   bb000008-... carif-oref--14_SE_0001597312  v2  NULL       (workflow pointe ici)
--   bb000009-... carif-oref--10_377967S        v1  compliant
--   bb000010-... carif-oref--10_377967S        v2  compliant  (audit Letta effectué)

ALTER TABLE ingestion_records DISABLE TRIGGER on_new_ingestion_record;
ALTER TABLE ingestion_records DISABLE TRIGGER tr_ingestion_records_version;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 1 : OEPRE Petite-Rosselle — v1 / conforme / jamais édité
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000001-0000-0000-0000-000000000000',
  'aa000001-0000-0000-0000-000000000000',
  '0d379ef4-1624-4b0d-8eef-08b41e4b0b3a',
  1, 'DI', 'compliant',
  $md$---
id: carif-oref--01_GE2021586
nom: "[S1] Ouvrir l'école aux parents — OEPRE Petite-Rosselle"
type: formation
source: carif-oref
date_maj: 2026-01-14
commune: Petite-Rosselle
code_postal: "57540"
conditions_acces: Etre primo-arrivants, immigres ou etrangers hors Union europeenne.
---

# [S1] Ouvrir l'école aux parents — OEPRE Petite-Rosselle

**Scénario 1 · v1 · compliant** — Service DI en version initiale, jamais édité. Cas nominal d'une fiche "À traiter".

### Objectif de la formation

- Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.
- Attestation de suivi.
- Validation possible selon le cas (DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :
- l'acquisition du français (comprendre, parler, lire et écrire) ;
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.

## Conditions d'accès

Etre primo-arrivants, immigres ou etrangers hors Union europeenne.$md$,
  $meta${"id": "carif-oref--01_GE2021586", "nom": "[S1] Ouvrir l'école aux parents — OEPRE Petite-Rosselle", "type": "formation", "commune": "Petite-Rosselle", "code_postal": "57540", "extra": {"action": {"session": [{"periode": {"fin": "20270131", "debut": "20250901"}}], "modalites-entrees-sorties": "1"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 2 : ASL Mulhouse — v1 / non conforme
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000002-0000-0000-0000-000000000000',
  'aa000002-0000-0000-0000-000000000000',
  '3b6ad197-2478-418d-88b3-2eaf36807e55',
  1, 'DI', 'non_compliant',
  $md$---
id: carif-oref--01_GE2030516
nom: "[S2] Atelier sociolinguistique ASL — Mulhouse"
type: formation
source: carif-oref
date_maj: 2026-01-20
commune: Mulhouse
code_postal: "68200"
conditions_acces: Pas de prerequis.
---

# [S2] Atelier sociolinguistique ASL — Mulhouse

**Scénario 2 · v1 · non_compliant** — Service refusé par Letta (description trop courte). Fiche archivée automatiquement.

### Objectif de la formation

Se présenter et présenter sa famille. Discriminer les sons des voyelles et des consonnes. Remplir un formulaire simple.

### Contenu de la formation

- Acquisition de la lecture.
- Production orale, activités d'expression.
- Production écrite.
- Réception écrite.

## Conditions d'accès

Pas de prerequis.$md$,
  $meta${"id": "carif-oref--01_GE2030516", "nom": "[S2] Atelier sociolinguistique ASL — Mulhouse", "type": "formation", "commune": "Mulhouse", "code_postal": "68200", "extra": {"action": {"session": [{"periode": {"fin": "20260630", "debut": "20250915"}}], "modalites-entrees-sorties": "1"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 3 : FLE Bourges — v1 / conforme / brouillon en cours
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000003-0000-0000-0000-000000000000',
  'aa000003-0000-0000-0000-000000000000',
  '53685853-af44-41d0-8193-212b172bdac7',
  1, 'DI', 'compliant',
  $md$---
id: carif-oref--07_763179S
nom: "[S3] Du FLE à l'emploi — Bourges"
type: formation
source: carif-oref
date_maj: 2026-01-15
commune: Bourges
code_postal: "18000"
conditions_acces: Demandeurs d'emploi, personnes en insertion.
---

# [S3] Du FLE à l'emploi — Bourges

**Scénario 3 · v1 · compliant** — Fiche en cours d'édition (brouillon). L'éditeur a commencé à travailler dessus.

### Objectif de la formation

Favoriser l'insertion professionnelle durable des primo-arrivants via un parcours immersif et progressif ancré dans la réalité du marché local de l'emploi.

### Contenu de la formation

- Se découvrir et comprendre le monde professionnel.
- Explorer et rencontrer (visites d'entreprises).
- Construire son projet et se préparer.

## Conditions d'accès

Demandeurs d'emploi, personnes en insertion.$md$,
  $meta${"id": "carif-oref--07_763179S", "nom": "[S3] Du FLE à l'emploi — Bourges", "type": "formation", "commune": "Bourges", "code_postal": "18000", "extra": {"action": {"session": [{"periode": {"fin": "20260630", "debut": "20250101"}}], "modalites-entrees-sorties": "0"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 4 : FLE Blois — v1 / conforme / publié
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000004-0000-0000-0000-000000000000',
  'aa000004-0000-0000-0000-000000000000',
  '75dcf5dd-ec18-4149-b2bf-aed755fd2f92',
  1, 'DI', 'compliant',
  $md$---
id: carif-oref--07_776575S
nom: "[S4] FLE : Progresser en français — Blois"
type: formation
source: carif-oref
date_maj: 2026-01-28
commune: Blois
code_postal: "41000"
conditions_acces: Tout public.
---

# [S4] FLE : Progresser en français — Blois

**Scénario 4 · v1 · compliant** — Fiche publiée sur Réfugiés.info. Représente le flux complet de publication.

### Objectif de la formation

Progresser en français à l'oral et à l'écrit pour s'intégrer dans la vie quotidienne et professionnelle.

### Contenu de la formation

Cours adaptés à votre niveau, en présentiel, à dates fixes. Modules : expression orale, compréhension écrite, grammaire.

## Conditions d'accès

Tout public.$md$,
  $meta${"id": "carif-oref--07_776575S", "nom": "[S4] FLE : Progresser en français — Blois", "type": "formation", "commune": "Blois", "code_postal": "41000", "extra": {"action": {"session": [{"periode": {"fin": "20261231", "debut": "20260211"}}], "modalites-entrees-sorties": "0"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 5a : OEPRE Les Mureaux — v1 / conforme (ancienne version)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000005-0000-0000-0000-000000000000',
  'aa000005-0000-0000-0000-000000000000',
  'dd000001-0000-0000-0000-000000000000',
  1, 'DI', 'compliant',
  $md$---
id: carif-oref--14_SE_0001116947
nom: "[S5a] OEPRE Les Mureaux — v1"
type: formation
source: carif-oref
date_maj: 2025-09-01
commune: Les Mureaux
code_postal: "78130"
conditions_acces: Etre primo-arrivants, immigres ou etrangers hors Union europeenne.
---

# [S5a] OEPRE Les Mureaux — v1

**Scénario 5a · v1 · compliant** — Version initiale. Le workflow a été re-pointé vers la v2 lors de la MAJ DI.

### Objectif de la formation

Favoriser l'intégration des parents d'élèves primo-arrivants en les impliquant dans la scolarité de leurs enfants.

### Contenu de la formation

- Acquisition du français (oral et écrit).
- Connaissance des valeurs de la République.
- Connaissance du fonctionnement de l'école française.

## Conditions d'accès

Etre primo-arrivants, immigres ou etrangers hors Union europeenne.$md$,
  $meta${"id": "carif-oref--14_SE_0001116947", "nom": "[S5a] OEPRE Les Mureaux — v1", "type": "formation", "commune": "Les Mureaux", "code_postal": "78130", "extra": {"action": {"session": [{"periode": {"fin": "20260630", "debut": "20250901"}}], "modalites-entrees-sorties": "1"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 5b : OEPRE Les Mureaux — v2 / NULL (scénario clé RI-1243)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000006-0000-0000-0000-000000000000',
  'aa000006-0000-0000-0000-000000000000',
  'dd000001-0000-0000-0000-000000000000',
  2, 'DI', NULL,
  $md$---
id: carif-oref--14_SE_0001116947
nom: "[S5b] OEPRE Les Mureaux — v2 (NULL)"
type: formation
source: carif-oref
date_maj: 2026-04-15
commune: Les Mureaux
code_postal: "78130"
conditions_acces: Etre primo-arrivants, immigres ou etrangers hors Union europeenne.
---

# [S5b] OEPRE Les Mureaux — v2 (NULL)

**Scénario 5b · v2 · NULL** — MAJ DI arrivée, compliance_status = NULL. Sans le fix RI-1243, cette fiche est invisible sur /documents pendant 12h+.

### Objectif de la formation

Favoriser l'intégration des parents d'élèves primo-arrivants en les impliquant dans la scolarité de leurs enfants.

### Contenu de la formation

- Acquisition du français (oral et écrit).
- Connaissance des valeurs de la République.
- Connaissance du fonctionnement de l'école française.

## Conditions d'accès

Etre primo-arrivants, immigres ou etrangers hors Union europeenne.$md$,
  $meta${"id": "carif-oref--14_SE_0001116947", "nom": "[S5b] OEPRE Les Mureaux — v2 (NULL)", "type": "formation", "commune": "Les Mureaux", "code_postal": "78130", "extra": {"action": {"session": [{"periode": {"fin": "20271231", "debut": "20261015"}}], "modalites-entrees-sorties": "1"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 6a : ASL Mantes-la-Jolie — v1 / conforme (editorial_record pointe ici)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000007-0000-0000-0000-000000000000',
  'aa000007-0000-0000-0000-000000000000',
  '9941211d-d843-4d04-8dee-b9a3fbf48203',
  1, 'DI', 'compliant',
  $md$---
id: carif-oref--14_SE_0001597312
nom: "[S6a] ASL Mantes-la-Jolie — v1"
type: formation
source: carif-oref
date_maj: 2026-01-22
commune: Mantes-la-Jolie
code_postal: "78200"
conditions_acces: Aucun.
---

# [S6a] ASL Mantes-la-Jolie — v1

**Scénario 6a · v1 · compliant** — Version initiale avec travail éditorial démarré. L'editorial_record pointe encore sur cette v1 (obsolescence).

### Objectif de la formation

Développer les compétences linguistiques pour une meilleure intégration et autonomie dans la société française.

### Contenu de la formation

Ateliers sociolinguistiques hebdomadaires : expression orale, compréhension écrite, activités culturelles.

## Conditions d'accès

Aucun.$md$,
  $meta${"id": "carif-oref--14_SE_0001597312", "nom": "[S6a] ASL Mantes-la-Jolie — v1", "type": "formation", "commune": "Mantes-la-Jolie", "code_postal": "78200", "extra": {"action": {"session": [{"periode": {"fin": "20271231", "debut": "20251115"}}], "modalites-entrees-sorties": "1"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 6b : ASL Mantes-la-Jolie — v2 / NULL (editorial_record sur v1 = obsolète)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000008-0000-0000-0000-000000000000',
  'aa000008-0000-0000-0000-000000000000',
  '9941211d-d843-4d04-8dee-b9a3fbf48203',
  2, 'DI', NULL,
  $md$---
id: carif-oref--14_SE_0001597312
nom: "[S6b] ASL Mantes-la-Jolie — v2 (NULL)"
type: formation
source: carif-oref
date_maj: 2026-05-05
commune: Mantes-la-Jolie
code_postal: "78200"
conditions_acces: Aucun.
---

# [S6b] ASL Mantes-la-Jolie — v2 (NULL)

**Scénario 6b · v2 · NULL** — MAJ DI : workflow re-pointé sur v2 mais editorial_record reste sur v1. Fiche invisible + travail éditorial obsolète.

### Objectif de la formation

Développer les compétences linguistiques pour une meilleure intégration et autonomie dans la société française.

### Contenu de la formation

Ateliers sociolinguistiques hebdomadaires : expression orale, compréhension écrite, activités culturelles.

## Conditions d'accès

Aucun.$md$,
  $meta${"id": "carif-oref--14_SE_0001597312", "nom": "[S6b] ASL Mantes-la-Jolie — v2 (NULL)", "type": "formation", "commune": "Mantes-la-Jolie", "code_postal": "78200", "extra": {"action": {"session": [{"periode": {"fin": "20271231", "debut": "20261105"}}], "modalites-entrees-sorties": "1"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 7a : OEPRE Nevers — v1 / conforme (ancienne version)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000009-0000-0000-0000-000000000000',
  'aa000009-0000-0000-0000-000000000000',
  'b73f7be6-5183-4a9d-baa8-68b1647ed746',
  1, 'DI', 'compliant',
  $md$---
id: carif-oref--10_377967S
nom: "[S7a] OEPRE Nevers — v1"
type: formation
source: carif-oref
date_maj: 2025-09-01
commune: Nevers
code_postal: "58000"
conditions_acces: Aucun.
---

# [S7a] OEPRE Nevers — v1

**Scénario 7a · v1 · compliant** — Version initiale. Le workflow a été re-pointé vers la v2 après MAJ DI.

### Objectif de la formation

Favoriser l'intégration des parents d'élèves primo-arrivants en les impliquant dans la scolarité de leurs enfants.

### Contenu de la formation

Les formations portent sur trois axes :
- l'acquisition du français (comprendre, parler, lire et écrire) ;
- la connaissance des valeurs de la République ;
- la connaissance du fonctionnement de l'école française.

## Conditions d'accès

Aucun.$md$,
  $meta${"id": "carif-oref--10_377967S", "nom": "[S7a] OEPRE Nevers — v1", "type": "formation", "commune": "Nevers", "code_postal": "58000", "extra": {"action": {"session": [{"periode": {"fin": "20260630", "debut": "20250901"}}], "modalites-entrees-sorties": "1"}}}$meta$
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scénario 7b : OEPRE Nevers — v2 / compliant (état nominal après RI-1243)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO ingestion_records ("id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status", "markdown", "metadata")
VALUES (
  'bb000010-0000-0000-0000-000000000000',
  'aa000010-0000-0000-0000-000000000000',
  'b73f7be6-5183-4a9d-baa8-68b1647ed746',
  2, 'DI', 'compliant',
  $md$---
id: carif-oref--10_377967S
nom: "[S7b] OEPRE Nevers — v2 (compliant)"
type: formation
source: carif-oref
date_maj: 2026-03-10
commune: Nevers
code_postal: "58000"
conditions_acces: Aucun.
---

# [S7b] OEPRE Nevers — v2 (compliant)

**Scénario 7b · v2 · compliant** — MAJ DI + audit Letta effectué. compliance_status = compliant. État nominal après RI-1243 : fiche visible normalement.

### Objectif de la formation

Favoriser l'intégration des parents d'élèves primo-arrivants en les impliquant dans la scolarité de leurs enfants.

### Contenu de la formation

Les formations portent sur trois axes :
- l'acquisition du français (comprendre, parler, lire et écrire) ;
- la connaissance des valeurs de la République ;
- la connaissance du fonctionnement de l'école française.

## Conditions d'accès

Aucun.$md$,
  $meta${"id": "carif-oref--10_377967S", "nom": "[S7b] OEPRE Nevers — v2 (compliant)", "type": "formation", "commune": "Nevers", "code_postal": "58000", "extra": {"action": {"session": [{"periode": {"fin": "20270630", "debut": "20260901"}}], "modalites-entrees-sorties": "1"}}}$meta$
) ON CONFLICT DO NOTHING;

ALTER TABLE ingestion_records ENABLE TRIGGER on_new_ingestion_record;
ALTER TABLE ingestion_records ENABLE TRIGGER tr_ingestion_records_version;
