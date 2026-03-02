-- Seed letta_reports

INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$17b304fe-f3dd-417c-bd47-949d8d07192c$seed$, $seed$2026-02-16 12:11:21.392649+00$seed$, $seed$2026-02-16 12:11:21.392649$seed$, $seed$ingestion$seed$, $seed$---
compliant: false
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-02_201901059923_00437877.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-16T12:11:21.306Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche refusée ❌

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `12` (Min. Éducation) + `19` (Min. Intérieur) | ✅ Accepté |
| 3. Public visé | `81022` (Public immigré) | ✅ Accepté |
| 4. Type dispositif | **OEPRE** | ❌ **Refusé** |
| 5. Durée | — | Non évalué |
| 6. Volume horaire | — | Non évalué |

### Motif de refus

**OEPRE (Ouvrir l'école aux parents pour la réussite des enfants)** est explicitement exclu du périmètre éditorial Réfugiés.info.

> Référence: `ressources_conformité_éditoriale/jurisprudence.md` — Étape 4, Type de dispositif : OEPRE → Refusé

Ce dispositif, bien que pertinent pour les primo-arrivants, est géré par l'Éducation nationale et bénéficie déjà d'une visibilité institutionnelle. Il ne fait pas partie des dispositifs publiés sur RI.

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Nouveau dispositif 🆗 (`duplicate: false`)

Aucun dispositif OEPRE n'est actuellement publié sur Réfugiés.info (conformément à la politique éditoriale d'exclusion de ce type de dispositif).

| Axe | Donnée source | Correspondance RI | Résultat |
|-----|---------------|-------------------|----------|
| 📍 Localisation | 33 - Gironde | — | Pas de match |
| 🏢 Structure | Collège Aliénor d'Aquitaine | — | Pas de match |
| 📝 Contenu | OEPRE | — | Pas de match |

---

**Conclusion:** Cette fiche ne doit pas être traitée car le dispositif OEPRE est hors périmètre éditorial RI.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-16T12:11:21.306Z"}, "compliant": false, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-02_201901059923_00437877.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$9aa94d11-6b40-4504-ba99-38e951e652a4$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$0524aca8-acec-4fe2-b1a4-77d231bf39dc$seed$, $seed$2026-02-16 12:17:53.642263+00$seed$, $seed$2026-02-16 12:17:53.642263$seed$, $seed$ingestion$seed$, $seed$---
compliant: true
duplicate: true
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-01_GE245976_GE2030516.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-16T12:17:53.544Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81021`, `81022`, `81023`, `81042` | ✅ Accepté |
| 4. Type dispositif | Formation Alphabétisation / ASL BOP 104 | ✅ Accepté |
| 5. Durée | 289 jours (15/09/2025 → 30/06/2026) | ✅ Accepté |
| 6. Volume horaire | `null` (non renseigné) | ⚠️ Warning |

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Doublon ⛔ (`duplicate: true`)

| Axe | Fiche actuelle | Fiche existante (session précédente) |
|-----|----------------|--------------------------------------|
| 📍 Localisation | Mulhouse (68) | ✅ Identique |
| 🏢 Structure | CDAFAL 68 | ✅ Identique |
| 📝 Contenu | Alpha A1.1 **Groupe 2** | Alpha A1.1 **Groupe 1** (`01_GE2030520`) |

### Justification

Cette fiche est un **doublon interne** de la fiche `01_GE2030520` (Alphabétisation A1.1 - Groupe 1) :
- Même structure (CDAFAL 68)
- Même niveau (A1.1 Alphabétisation)
- Même période (15/09/2025 → 30/06/2026)
- Même lieu (Mulhouse)
- Seule différence : numéro de groupe (Groupe 2 vs Groupe 1)

**Action recommandée :** ❌ Ne pas publier cette fiche séparément. Le découpage par "groupe" relève de l'organisation interne de l'organisme et n'apporte pas de valeur ajoutée pour l'utilisateur RI.

### 📊 Récapitulatif lot CDAFAL 68

| ID | Niveau | Statut recommandé |
|----|--------|-------------------|
| `01_GE2030520` | Alpha A1.1 Groupe 1 | ✅ À publier |
| `01_GE2030516` | Alpha A1.1 **Groupe 2** | ❌ **Doublon – Ne pas publier** |
| `01_GE2030524` | FLE A1 | ✅ À publier |
| `01_GE2030528` | FLE A2 | ✅ À publier |

**Recommandation finale :** Fusionner les 3 niveaux distincts (Alpha A1.1 + FLE A1 + FLE A2) en **une seule fiche multi-parcours CDAFAL 68**.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-16T12:17:53.544Z"}, "compliant": true, "duplicate": true, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-01_GE245976_GE2030516.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$d020a9f2-07e9-41d5-b9f4-ebaff6db5e10$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$28d6a306-1ec7-4525-be4c-fb4622b63ab3$seed$, $seed$2026-02-16 12:20:28.261304+00$seed$, $seed$2026-02-16 12:20:28.261304$seed$, $seed$ingestion$seed$, $seed$---
compliant: false
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-01_GE471359_GE2021586.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-16T12:20:28.168Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche refusée ❌

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023`, `81042` | ✅ Accepté |
| 4. Type dispositif | **OEPRE** | ❌ **Refusé** |

### ❌ Motif de refus

**Programme OEPRE hors périmètre RI** — Refus systématique selon jurisprudence éditoriale.

<hr id="doublons">

## 2. Détection de Doublons

**Non applicable** — Fiche non conforme.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-16T12:20:28.168Z"}, "compliant": false, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-01_GE471359_GE2021586.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$09689ca9-1653-4ce7-8532-fe8cbf7f1b99$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$5bab18f3-260c-4d99-8dee-09cf3f0c3c3f$seed$, $seed$2026-02-16 16:09:51.243417+00$seed$, $seed$2026-02-16 16:09:51.243417$seed$, $seed$editorial$seed$, $seed$---
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-16T16:09:51.021Z'
---

# Apprendre à lire et écrire en français

*(Formation pour débutants à Mulhouse)*

Cette formation vous aide à apprendre les bases du français : lire, écrire et parler. Elle est faite pour les personnes qui ne savent pas encore lire ou écrire, ou qui commencent à apprendre.

## Pourquoi c'est intéressant ?

:::toggle{title="**Savoir se présenter**"}
Vous apprenez à dire et écrire votre nom, votre prénom et à parler de votre famille.
Exemple : remplir un formulaire à la mairie ou chez le médecin.
:::

:::toggle{title="**Apprendre à lire**"}
Vous apprenez à reconnaître les lettres et les sons du français.
Exemple : lire une affiche, un courrier simple ou le nom d'une rue.
:::

:::toggle{title="**Apprendre à écrire**"}
Vous apprenez à écrire des mots simples et à remplir des documents du quotidien.
Exemple : écrire votre adresse sur une enveloppe.
:::

:::good-to-know
Vous pouvez commencer la formation à tout moment de l'année. Les groupes sont petits (12 personnes maximum).
:::

## Comment faire ?

**Conditions pour participer :**
- Pas de niveau de français demandé
- Un test simple au début pour connaître votre niveau

:::important
Vous devez passer un test de positionnement avant de commencer la formation.
:::

**Pour s'inscrire :**

1. Aller sur le site internet : https://formation.cdafal68.eu/
2. Ou venir sur place le mercredi matin entre 9h et 12h
3. Ou téléphoner au 03 89 42 85 20

### Lieu de la formation

- **CDAFAL 68** - 100 Avenue de Colmar, 68200 Mulhouse
- Téléphone : 07 87 06 90 17
- Mail : cdafal68.asl@hotmail.fr

### Autres informations

Niveau de français : débutant complet (alphabétisation), formation en présentiel, inscription possible toute l'année, formation gratuite (financée par l'État)

### Pour aller plus loin

- Site du CDAFAL 68 : http://cdafal68.eu/
- Inscription en ligne : https://formation.cdafal68.eu/

### Journal des Avertissements

| Type de problème | Champ ou élément | Niveau de risque | Détail / justification | Suggestion de correction |
|------------------|------------------|------------------|------------------------|--------------------------|
| Donnée manquante | Volume horaire | moyen | Pas d'information sur le nombre d'heures total ou par semaine | Contacter la structure pour préciser |
| Donnée manquante | Jours et horaires | mineur | Les jours de cours ne sont pas précisés (seuls les horaires d'inscription sont mentionnés) | Ajouter les jours de formation |
| Donnée incomplète | Durée indicative | faible | Période longue (sept. 2025 - juin 2026) mais durée réelle de participation non précisée | Clarifier la durée moyenne du parcours |

### Lexique

**Alphabétisation** : Formation pour apprendre à lire et écrire quand on ne connaît pas encore les lettres.

**Test de positionnement** : Petit test au début pour savoir votre niveau et vous mettre dans le bon groupe.

**BOP 104** : Programme de l'État français qui finance des cours de français gratuits pour les personnes étrangères.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-16T16:09:51.021Z"}}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$d020a9f2-07e9-41d5-b9f4-ebaff6db5e10$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$4722af8f-e543-4a6d-8e01-f0a342cfec2d$seed$, $seed$2026-02-19 03:54:41.876961+00$seed$, $seed$2026-02-19 03:54:41.876961$seed$, $seed$ingestion$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-19T03:54:41.776Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `2` (Conseil régional) | ✅ Accepté |
| 3. Public visé | `80006` → **Rattrapage sémantique** | ✅ Accepté |
| 4. Type dispositif | Formation FLE | ✅ Accepté |
| 5. Durée | 78 jours (11/02/2026 → 30/04/2026) | ✅ Accepté |
| 6. Volume horaire | 321 heures | ✅ Accepté |

### Détail Étape 3 (Rattrapage sémantique)
- Code `80006` non reconnu, mais analyse contextuelle positive :
  - `info-public-vise` : « tout public **allophone** »
  - `description` : « citoyen **allophone** », « Français Langue Étrangère »
- Le terme « allophone » désigne explicitement les personnes ne parlant pas français comme langue maternelle → public FLE/immigré ciblé.

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Nouveau 🆗 (`duplicate: false`)

| Axe | Fiche DI | Résultat recherche |
|-----|----------|-------------------|
| 📍 Localisation | 41 - Loir-et-Cher (Blois) | Aucune fiche RI à Blois |
| 🏢 Structure | AFPA | Pas de fiche AFPA FLE en Centre-Val de Loire |
| 📝 Contenu | FLE Progresser en français | Pas de correspondance |

**→ Nouveau dispositif** – Éligible au pipeline de rédaction.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-19T03:54:41.776Z"}, "compliant": true, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$f411d731-ba70-42d7-85da-e05dc79f951b$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$e4047d92-c441-45dd-b7c8-6ad214790f02$seed$, $seed$2026-02-19 03:59:04.469328+00$seed$, $seed$2026-02-19 03:59:04.469328$seed$, $seed$ingestion$seed$, $seed$---
compliant: false
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-10_2590061F_377967S.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-19T03:59:04.384Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche refusée ❌

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant), `81042` (réfugié) | ✅ Accepté |
| 4. Type dispositif | **OEPRE** | ❌ **Refusé** |
| 5. Durée | ~517 jours (01/09/2025 → 31/01/2027) | ✅ Accepté |
| 6. Volume horaire | 80h | ✅ Accepté |

### Motif de refus

**OEPRE (Ouvrir l'École aux Parents pour la Réussite des Enfants)** est explicitement exclu du périmètre éditorial Réfugiés.info.

> Référence : `compétence_conformité_éditoriale_di` → Étape 4 : Type de dispositif → OEPRE = ❌ Refusé

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Nouveau dispositif 🆗 (`duplicate: false`)

Aucun dispositif OEPRE n'est publié sur Réfugiés.info (conformément à la politique éditoriale).

---

⚠️ **Pipeline interrompu** — Fiche non-conforme, phases 2 et 3 non exécutées.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-19T03:59:04.384Z"}, "compliant": false, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-10_2590061F_377967S.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$0a930a51-906a-4710-9bb9-d96c045c022d$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$ac1b4715-589f-40fc-a3b4-4783d3ed236d$seed$, $seed$2026-02-19 04:10:35.215371+00$seed$, $seed$2026-02-19 04:10:35.215371$seed$, $seed$ingestion$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_25105315F_763179S.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-19T04:10:35.126Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (Min. Intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant) | ✅ Accepté |
| 4. Type dispositif | FLE vers l'emploi (droit commun) | ✅ Accepté |
| 5. Durée | 730 jours (01/01/2025 → 31/12/2026) | ✅ Accepté |
| 6. Volume horaire | 4-12h/semaine × ~2 ans ≫ 20h | ✅ Accepté |

**Note :** Le champ `nombre-heures-total` est vide, mais `duree-indicative` indique "4 à 12h hebdomadaire" sur 2 ans, ce qui dépasse largement le seuil de 20 heures.

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Nouveau dispositif 🆗 (`duplicate: false`)

| Axe | Fiche DI | Base RI | Correspondance |
|-----|----------|---------|----------------|
| 📍 Localisation | Bourges (18 - Cher) | — | Aucun dispositif FLE trouvé dans ce département |
| 🏢 Structure | Association le relais | — | Structure non présente |
| 📝 Contenu | FLE vers l'emploi | — | Pas d'équivalent |

---

**✅ Fiche éligible** — Peut poursuivre vers Phase 2 (rédaction) et Phase 3 (métadonnées).
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-19T04:10:35.126Z"}, "compliant": true, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_25105315F_763179S.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$18fc7d09-52ec-4b16-b732-2e5e5d37f0a1$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$cf9be80e-91fd-4bd8-98e4-988e4e25af57$seed$, $seed$2026-02-19 04:21:38.134002+00$seed$, $seed$2026-02-19 04:21:38.134002$seed$, $seed$ingestion$seed$, $seed$---
compliant: false
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000178863_SE_0001116947.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-19T04:21:38.056Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche refusée ❌

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `12` (Min. Éducation), `19` (Min. Intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant) | ✅ Accepté |
| 4. Type dispositif | **OEPRE** | ❌ **Refusé** |
| 5. Durée | — | ⏸️ Non évalué |
| 6. Volume horaire | — | ⏸️ Non évalué |

### Motif de refus

**OEPRE** est explicitement exclu du périmètre éditorial Réfugiés.info.

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Nouveau dispositif 🆗 (sans incidence — fiche non conforme)
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-19T04:21:38.056Z"}, "compliant": false, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000178863_SE_0001116947.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$a1ca9718-325e-45fe-bc4c-3d2cdff29a1a$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$f496fc58-0575-4e60-913a-4e198871b54f$seed$, $seed$2026-02-19 04:21:48.519687+00$seed$, $seed$2026-02-19 04:21:48.519687$seed$, $seed$ingestion$seed$, $seed$---
compliant: false
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000178861_SE_0001116944.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-19T04:21:48.434Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche refusée ❌

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `12` (Min. Éducation), `19` (Min. Intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant) | ✅ Accepté |
| 4. Type dispositif | **OEPRE** | ❌ **Refusé** |
| 5. Durée | — | ⏸️ Non évalué |
| 6. Volume horaire | — | ⏸️ Non évalué |

### Motif de refus

**OEPRE** est explicitement exclu du périmètre éditorial Réfugiés.info.

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Nouveau dispositif 🆗 (sans incidence — fiche non conforme)
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-19T04:21:48.434Z"}, "compliant": false, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000178861_SE_0001116944.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$f4def384-fdce-44cd-840e-3fa936a02fc7$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$5b41cb39-9893-43ef-9ff8-ff6071cafd2f$seed$, $seed$2026-02-19 15:41:53.792033+00$seed$, $seed$2026-02-19 15:41:53.792033$seed$, $seed$editorial$seed$, $seed$---
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-19T15:41:53.069Z'
---

# Apprendre le français pour travailler

*(cours de français adaptés à votre niveau, pour la vie quotidienne et le travail)*

Cette formation vous aide à parler, comprendre et écrire en français. Vous apprenez aussi le vocabulaire du travail et les habitudes des entreprises en France.

:::good-to-know
Vous pouvez commencer à tout moment de l'année. Les cours sont en groupe, selon votre niveau : débutant, intermédiaire ou avancé.
:::

## Pourquoi c'est intéressant ?

:::toggle{title="Avantage 1 : Progresser à l'oral et à l'écrit"}
Vous apprenez à parler français dans la vie de tous les jours : faire des courses, aller chez le médecin, parler avec l'école de vos enfants.
Vous apprenez aussi à lire et écrire des documents simples.
:::

:::toggle{title="Avantage 2 : Préparer votre projet professionnel"}
Vous découvrez le vocabulaire du travail en France.
Par exemple : comment parler à un employeur, comprendre une offre d'emploi, ou remplir un formulaire.
:::

:::toggle{title="Avantage 3 : Comprendre le monde du travail en France"}
Vous apprenez comment fonctionnent les entreprises en France : les horaires, les règles, les relations avec les collègues.
:::

## Comment faire ?

:::toggle{title="Étape 1 : Contacter l'association"}
Appelez le **02 48 65 67 03** ou envoyez un mail à **contact@lerelais18.fr**.
:::

:::toggle{title="Étape 2 : Passer un entretien de positionnement"}
Vous rencontrez un formateur. Il évalue votre niveau de français pour vous orienter vers le bon groupe.
:::

:::toggle{title="Étape 3 : Commencer les cours"}
Vous intégrez un groupe (débutant, intermédiaire ou avancé) et vous commencez la formation.

:::important
Les cours ont lieu en présentiel à Bourges :
**1 Allée Napoléon III, 18000 Bourges**
:::
:::

### Autres informations

- **Durée** : 4 à 12 heures par semaine
- **Prix** : Gratuit
- **Départements concernés** : Cher (18), Eure-et-Loir (28), Indre (36), Indre-et-Loire (37), Loir-et-Cher (41), Loiret (45)
- **Public** : Personnes primo-arrivantes

### Pour aller plus loin

- Fiche source : [InterCarif-Oref](https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_25105315F_763179S.html)

### Journal des Avertissements

| Type de problème | Champ ou élément | Niveau de risque | Détail / justification | Suggestion de correction |
|------------------|------------------|------------------|------------------------|--------------------------|
| Donnée manquante | Contenu de la formation | moyen | "Non renseigné" dans la fiche source | Contacter l'association pour obtenir le programme détaillé |
| Donnée manquante | Volume horaire total | faible | Seule la fourchette hebdomadaire est indiquée (4-12h) | Préciser la durée totale de la formation si disponible |
| Donnée manquante | Niveaux de français visés | faible | Pas de mention des niveaux CECRL (A1, A2, B1…) | Demander les niveaux d'entrée et de sortie précis |

### Lexique

**Entretien de positionnement** : Rendez-vous avec un formateur pour évaluer votre niveau de français avant de commencer les cours.

**Primo-arrivant** : Personne arrivée récemment en France et qui a signé le Contrat d'Intégration Républicaine (CIR) avec l'Office Français de l'Immigration et de l'Intégration (OFII).
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-19T15:41:53.069Z"}}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, NULL, $seed$18fc7d09-52ec-4b16-b732-2e5e5d37f0a1$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$28e73be8-bc94-47a1-aa18-5190d1932f01$seed$, $seed$2026-02-24 13:40:51.963959+00$seed$, $seed$2026-02-24 13:40:51.963959$seed$, $seed$ingestion$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-24T13:40:51.693Z'
---
```

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `2` (Conseil régional) | ✅ Accepté |
| 3. Public visé | Code `80006` (hors liste) → **Rattrapage sémantique** : "public allophone", "appropriation de la langue française insuffisante", "citoyen allophone de plus de 16 ans" | ✅ Accepté |
| 4. Type dispositif | Formation FLE - Droit commun utile aux réfugiés | ✅ Accepté |
| 5. Durée | 78 jours (11/02/2026 → 30/04/2026) | ✅ Accepté |
| 6. Volume horaire | 321h (`nombre-heures-total`) | ✅ Accepté |

**Note rattrapage sémantique (Étape 3):** Le code `80006` n'est pas dans la liste des codes acceptés. Cependant, l'analyse du JSON complet révèle un ciblage clair du public RI :
- `info-public-vise` : "tout public allophone dont l'appropriation de la langue française est insuffisante"
- `description` : "citoyen allophone de plus de 16 ans"
- `conditions_acces` : "personnes dont l'appropriation de la langue française est insuffisante"

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** `duplicate: false` 🆗 NOUVEAU

| Axe | Cible (DI) | Référence (RI existant) | Résultat |
|-----|------------|-------------------------|----------|
| 📍 Localisation | 41 - Loir-et-Cher, Blois | Aucune correspondance AFPA | ❌ Non-match |
| 🏢 Structure | AFPA (Agence pour la formation professionnelle des adultes) | Aucun dispositif AFPA dans le 41 | ❌ Non-match |
| 📝 Contenu | FLE / Progresser en français | — | — |

**Justification:** Aucun dispositif AFPA n'existe actuellement dans le département 41 sur Réfugiés.info. Les formations FLE existantes dans ce département sont portées par d'autres structures (Centre social Vendôme, Secours Catholique de Blois). Ce dispositif est donc un **nouveau** contenu à intégrer.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-24T13:40:51.693Z"}, "compliant": true, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$```yaml
---
compliant: true
duplicate: false
carif_oref_url: https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html
---
```

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `2` (Conseil régional) | ✅ Accepté |
| 3. Public visé | Code `80006` (hors liste) → **Rattrapage sémantique** : "public allophone", "appropriation de la langue française insuffisante", "citoyen allophone de plus de 16 ans" | ✅ Accepté |
| 4. Type dispositif | Formation FLE - Droit commun utile aux réfugiés | ✅ Accepté |
| 5. Durée | 78 jours (11/02/2026 → 30/04/2026) | ✅ Accepté |
| 6. Volume horaire | 321h (`nombre-heures-total`) | ✅ Accepté |

**Note rattrapage sémantique (Étape 3):** Le code `80006` n'est pas dans la liste des codes acceptés. Cependant, l'analyse du JSON complet révèle un ciblage clair du public RI :
- `info-public-vise` : "tout public allophone dont l'appropriation de la langue française est insuffisante"
- `description` : "citoyen allophone de plus de 16 ans"
- `conditions_acces` : "personnes dont l'appropriation de la langue française est insuffisante"

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** `duplicate: false` 🆗 NOUVEAU

| Axe | Cible (DI) | Référence (RI existant) | Résultat |
|-----|------------|-------------------------|----------|
| 📍 Localisation | 41 - Loir-et-Cher, Blois | Aucune correspondance AFPA | ❌ Non-match |
| 🏢 Structure | AFPA (Agence pour la formation professionnelle des adultes) | Aucun dispositif AFPA dans le 41 | ❌ Non-match |
| 📝 Contenu | FLE / Progresser en français | — | — |

**Justification:** Aucun dispositif AFPA n'existe actuellement dans le département 41 sur Réfugiés.info. Les formations FLE existantes dans ce département sont portées par d'autres structures (Centre social Vendôme, Secours Catholique de Blois). Ce dispositif est donc un **nouveau** contenu à intégrer.$seed$, $seed$f411d731-ba70-42d7-85da-e05dc79f951b$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$f4591a59-210d-4fb3-91cf-e6c854b25e62$seed$, $seed$2026-02-24 13:41:38.120824+00$seed$, $seed$2026-02-24 13:41:38.120824$seed$, $seed$metadata$seed$, $seed$---
metadata_ri:
  mainSponsor: Agence pour la formation professionnelle des adultes
  needs:
    - 613721a409c5190dfa70d057
    - 613721a409c5190dfa70d058
    - 613721a409c5190dfa70d056
  secondaryThemes:
    - 63286a015d31b2c0cad9960e
  theme: 63286a015d31b2c0cad9960a
  titreInformatif: 'FLE : Progresser en français'
  titreMarque: AFPA
  abstract: Apprendre le français pour trouver un travail
  location:
    - 18 - Cher
    - 28 - Eure-et-Loir
    - 36 - Indre
    - 37 - Indre-et-Loire
    - 41 - Loir-et-Cher
    - 45 - Loiret
  frenchLevel:
    - alpha
    - A1
    - A2
  age:
    - type: moreThan
      ages:
        - 16
  price:
    - values:
        - gratuit
      details: ''
  publicStatus:
    - asile
    - refugie
    - subsidiaire
    - temporaire
    - apatride
    - french
  public: null
  conditions: null
  commitment:
    - amountDetails: exactly
      hours:
        - 321
      timeUnit: hours
  frequency: null
  timeSlots: null
  periode:
    - debut:
        $date: '2026-02-11T00:00:00.000Z'
      fin:
        $date: '2026-04-30T23:59:59.999Z'
  map:
    - title: AFPA de Blois
      address: '13 Rue Robert Nau, 41000 Blois'
      city: Blois
      lat: 47.612388
      lng: 1.332562
      description: ''
      email: via.info@viaformation.fr
      phone: '+33243756585'
provenance:
  - key: mainSponsor
    label: Structure
    value: Agence pour la formation professionnelle des adultes
    status: valid
    source:
      - structure.nom
  - key: titreInformatif
    label: Titre informatif
    value: 'FLE : Progresser en français'
    status: valid
    source:
      - nom
  - key: titreMarque
    label: Titre marque
    value: AFPA
    status: valid
    source:
      - extra.action.session.adresse-inscription.adresse.denomination
  - key: abstract
    label: En bref
    value: Apprendre le français pour trouver un travail
    status: valid
    source:
      - description
  - key: theme
    label: Thème
    value: Apprendre le français
    status: valid
    source:
      - thematiques
  - key: secondaryThemes
    label: Thèmes secondaires
    value: Trouver un travail
    status: valid
    source:
      - description
  - key: needs
    label: Besoins
    value: >-
      Prendre des cours, Apprendre le français pour le travail, Se préparer :
      CV, entretien...
    status: valid
    source:
      - description
  - key: location
    label: Départements
    value: '18, 28, 36, 37, 41, 45 (Centre-Val de Loire)'
    status: valid
    source:
      - zone_eligibilite
  - key: frenchLevel
    label: Niveau de français
    value: 'alpha, A1, A2'
    status: valid
    source:
      - description
      - conditions_acces
  - key: age
    label: Âge
    value: Plus de 16 ans
    status: valid
    source:
      - conditions_acces
  - key: price
    label: Prix
    value: Gratuit
    status: valid
    source:
      - extra.action.conventionnement
      - extra.action.organisme-financeur.code-financeur
  - key: publicStatus
    label: Public visé
    value: Tous les publics
    status: valid
    source:
      - 'extra.action.organisme-financeur.extras.extra (code-public-vise: 80006)'
  - key: public
    label: Public
    value: ''
    status: missing
    source: []
  - key: commitment
    label: Durée totale
    value: 321 heures
    status: valid
    source:
      - extra.action.nombre-heures-total
  - key: frequency
    label: Fréquence
    value: ''
    status: missing
    source: []
  - key: timeSlots
    label: Jours de présence
    value: ''
    status: missing
    source: []
  - key: periode
    label: Session
    value: 11/02/2026 - 30/04/2026
    status: valid
    source:
      - extra.action.session.periode.debut
      - extra.action.session.periode.fin
  - key: conditions
    label: Conditions
    value: ''
    status: missing
    source: []
  - key: map
    label: Zone d'action
    value: 'AFPA de Blois, 13 Rue Robert Nau, 41000 Blois'
    status: valid
    source:
      - adresse
      - commune
      - latitude
      - longitude
      - courriel
      - telephone
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-24T13:41:37.993Z'
---

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | AFPA | extra.action.session.adresse-inscription.adresse.denomination |
| Structure | Agence pour la formation professionnelle des adultes | structure.nom |
| Logo | | |
| En bref | Apprendre le français pour trouver un travail | description |
| Thèmes | Apprendre le français, Trouver un travail | thematiques, description |
| Besoins | Prendre des cours, Apprendre le français pour le travail, Se préparer : CV, entretien... | description |
| Public visé | Tous les publics (allophones) | extra...code-public-vise (80006) |
| Public | | |
| Fréquence | | |
| Niveau de français | alpha, A1, A2 | description, conditions_acces |
| Âge | Plus de 16 ans | conditions_acces |
| Prix | Gratuit | conventionnement (1), code-financeur (2) |
| Durée totale | 321 heures | extra.action.nombre-heures-total |
| Session | 11/02/2026 - 30/04/2026 | extra.action.session.periode |
| Jours de présence | | |
| Départements | 18 - Cher, 28 - Eure-et-Loir, 36 - Indre, 37 - Indre-et-Loire, 41 - Loir-et-Cher, 45 - Loiret | zone_eligibilite |
| Conditions | | |
| Zone d'action | AFPA de Blois, 13 Rue Robert Nau, 41000 Blois | adresse, commune, latitude, longitude |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Logo | Donnée manquante | Chercher sur le site AFPA |
| Public | Pas de public spécifique détecté (family, women, youths, etc.) | Laisser vide |
| Fréquence | Pas de volume horaire hebdomadaire indiqué | Calculer : 321h / 11 semaines ≈ 29h/semaine |
| Jours de présence | Non précisé dans la fiche | Contacter l'organisme |
| Conditions | Aucune condition spécifique détectée (titre séjour, CIR, etc.) | Laisser vide |
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-24T13:41:37.993Z"}, "provenance": [{"key": "mainSponsor", "label": "Structure", "value": "Agence pour la formation professionnelle des adultes", "source": ["structure.nom"], "status": "valid"}, {"key": "titreInformatif", "label": "Titre informatif", "value": "FLE : Progresser en français", "source": ["nom"], "status": "valid"}, {"key": "titreMarque", "label": "Titre marque", "value": "AFPA", "source": ["extra.action.session.adresse-inscription.adresse.denomination"], "status": "valid"}, {"key": "abstract", "label": "En bref", "value": "Apprendre le français pour trouver un travail", "source": ["description"], "status": "valid"}, {"key": "theme", "label": "Thème", "value": "Apprendre le français", "source": ["thematiques"], "status": "valid"}, {"key": "secondaryThemes", "label": "Thèmes secondaires", "value": "Trouver un travail", "source": ["description"], "status": "valid"}, {"key": "needs", "label": "Besoins", "value": "Prendre des cours, Apprendre le français pour le travail, Se préparer : CV, entretien...", "source": ["description"], "status": "valid"}, {"key": "location", "label": "Départements", "value": "18, 28, 36, 37, 41, 45 (Centre-Val de Loire)", "source": ["zone_eligibilite"], "status": "valid"}, {"key": "frenchLevel", "label": "Niveau de français", "value": "alpha, A1, A2", "source": ["description", "conditions_acces"], "status": "valid"}, {"key": "age", "label": "Âge", "value": "Plus de 16 ans", "source": ["conditions_acces"], "status": "valid"}, {"key": "price", "label": "Prix", "value": "Gratuit", "source": ["extra.action.conventionnement", "extra.action.organisme-financeur.code-financeur"], "status": "valid"}, {"key": "publicStatus", "label": "Public visé", "value": "Tous les publics", "source": ["extra.action.organisme-financeur.extras.extra (code-public-vise: 80006)"], "status": "valid"}, {"key": "public", "label": "Public", "value": "", "source": [], "status": "missing"}, {"key": "commitment", "label": "Durée totale", "value": "321 heures", "source": ["extra.action.nombre-heures-total"], "status": "valid"}, {"key": "frequency", "label": "Fréquence", "value": "", "source": [], "status": "missing"}, {"key": "timeSlots", "label": "Jours de présence", "value": "", "source": [], "status": "missing"}, {"key": "periode", "label": "Session", "value": "11/02/2026 - 30/04/2026", "source": ["extra.action.session.periode.debut", "extra.action.session.periode.fin"], "status": "valid"}, {"key": "conditions", "label": "Conditions", "value": "", "source": [], "status": "missing"}, {"key": "map", "label": "Zone d'action", "value": "AFPA de Blois, 13 Rue Robert Nau, 41000 Blois", "source": ["adresse", "commune", "latitude", "longitude", "courriel", "telephone"], "status": "valid"}], "metadata_ri": {"age": [{"ages": [16], "type": "moreThan"}], "map": [{"lat": 47.612388, "lng": 1.332562, "city": "Blois", "email": "via.info@viaformation.fr", "phone": "+33243756585", "title": "AFPA de Blois", "address": "13 Rue Robert Nau, 41000 Blois", "description": ""}], "needs": ["613721a409c5190dfa70d057", "613721a409c5190dfa70d058", "613721a409c5190dfa70d056"], "price": [{"values": ["gratuit"], "details": ""}], "theme": "63286a015d31b2c0cad9960a", "public": null, "periode": [{"fin": {"$date": "2026-04-30T23:59:59.999Z"}, "debut": {"$date": "2026-02-11T00:00:00.000Z"}}], "abstract": "Apprendre le français pour trouver un travail", "location": ["18 - Cher", "28 - Eure-et-Loir", "36 - Indre", "37 - Indre-et-Loire", "41 - Loir-et-Cher", "45 - Loiret"], "frequency": null, "timeSlots": null, "commitment": [{"hours": [321], "timeUnit": "hours", "amountDetails": "exactly"}], "conditions": null, "frenchLevel": ["alpha", "A1", "A2"], "mainSponsor": "Agence pour la formation professionnelle des adultes", "titreMarque": "AFPA", "publicStatus": ["asile", "refugie", "subsidiaire", "temporaire", "apatride", "french"], "secondaryThemes": ["63286a015d31b2c0cad9960e"], "titreInformatif": "FLE : Progresser en français"}}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$```yaml
---
metadata_ri:
  mainSponsor: "Agence pour la formation professionnelle des adultes"
  needs: ["613721a409c5190dfa70d057", "613721a409c5190dfa70d058", "613721a409c5190dfa70d056"]
  secondaryThemes: ["63286a015d31b2c0cad9960e"]
  theme: "63286a015d31b2c0cad9960a"
  titreInformatif: "FLE : Progresser en français"
  titreMarque: "AFPA"
  abstract: "Apprendre le français pour trouver un travail"
  location: ["18 - Cher", "28 - Eure-et-Loir", "36 - Indre", "37 - Indre-et-Loire", "41 - Loir-et-Cher", "45 - Loiret"]
  frenchLevel: ["alpha", "A1", "A2"]
  age:
    - type: "moreThan"
      ages: [16]
  price:
    - values: ["gratuit"]
      details: ""
  publicStatus: ["asile", "refugie", "subsidiaire", "temporaire", "apatride", "french"]
  public: null
  conditions: null
  commitment:
    - amountDetails: "exactly"
      hours: [321]
      timeUnit: "hours"
  frequency: null
  timeSlots: null
  periode:
    - debut:
        $date: "2026-02-11T00:00:00.000Z"
      fin:
        $date: "2026-04-30T23:59:59.999Z"
  map:
    - title: "AFPA de Blois"
      address: "13 Rue Robert Nau, 41000 Blois"
      city: "Blois"
      lat: 47.612388
      lng: 1.332562
      description: ""
      email: "via.info@viaformation.fr"
      phone: "+33243756585"
provenance:
  - key: "mainSponsor"
    label: "Structure"
    value: "Agence pour la formation professionnelle des adultes"
    status: "valid"
    source: ["structure.nom"]
  - key: "titreInformatif"
    label: "Titre informatif"
    value: "FLE : Progresser en français"
    status: "valid"
    source: ["nom"]
  - key: "titreMarque"
    label: "Titre marque"
    value: "AFPA"
    status: "valid"
    source: ["extra.action.session.adresse-inscription.adresse.denomination"]
  - key: "abstract"
    label: "En bref"
    value: "Apprendre le français pour trouver un travail"
    status: "valid"
    source: ["description"]
  - key: "theme"
    label: "Thème"
    value: "Apprendre le français"
    status: "valid"
    source: ["thematiques"]
  - key: "secondaryThemes"
    label: "Thèmes secondaires"
    value: "Trouver un travail"
    status: "valid"
    source: ["description"]
  - key: "needs"
    label: "Besoins"
    value: "Prendre des cours, Apprendre le français pour le travail, Se préparer : CV, entretien..."
    status: "valid"
    source: ["description"]
  - key: "location"
    label: "Départements"
    value: "18, 28, 36, 37, 41, 45 (Centre-Val de Loire)"
    status: "valid"
    source: ["zone_eligibilite"]
  - key: "frenchLevel"
    label: "Niveau de français"
    value: "alpha, A1, A2"
    status: "valid"
    source: ["description", "conditions_acces"]
  - key: "age"
    label: "Âge"
    value: "Plus de 16 ans"
    status: "valid"
    source: ["conditions_acces"]
  - key: "price"
    label: "Prix"
    value: "Gratuit"
    status: "valid"
    source: ["extra.action.conventionnement", "extra.action.organisme-financeur.code-financeur"]
  - key: "publicStatus"
    label: "Public visé"
    value: "Tous les publics"
    status: "valid"
    source: ["extra.action.organisme-financeur.extras.extra (code-public-vise: 80006)"]
  - key: "public"
    label: "Public"
    value: ""
    status: "missing"
    source: []
  - key: "commitment"
    label: "Durée totale"
    value: "321 heures"
    status: "valid"
    source: ["extra.action.nombre-heures-total"]
  - key: "frequency"
    label: "Fréquence"
    value: ""
    status: "missing"
    source: []
  - key: "timeSlots"
    label: "Jours de présence"
    value: ""
    status: "missing"
    source: []
  - key: "periode"
    label: "Session"
    value: "11/02/2026 - 30/04/2026"
    status: "valid"
    source: ["extra.action.session.periode.debut", "extra.action.session.periode.fin"]
  - key: "conditions"
    label: "Conditions"
    value: ""
    status: "missing"
    source: []
  - key: "map"
    label: "Zone d'action"
    value: "AFPA de Blois, 13 Rue Robert Nau, 41000 Blois"
    status: "valid"
    source: ["adresse", "commune", "latitude", "longitude", "courriel", "telephone"]
---

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | AFPA | extra.action.session.adresse-inscription.adresse.denomination |
| Structure | Agence pour la formation professionnelle des adultes | structure.nom |
| Logo | | |
| En bref | Apprendre le français pour trouver un travail | description |
| Thèmes | Apprendre le français, Trouver un travail | thematiques, description |
| Besoins | Prendre des cours, Apprendre le français pour le travail, Se préparer : CV, entretien... | description |
| Public visé | Tous les publics (allophones) | extra...code-public-vise (80006) |
| Public | | |
| Fréquence | | |
| Niveau de français | alpha, A1, A2 | description, conditions_acces |
| Âge | Plus de 16 ans | conditions_acces |
| Prix | Gratuit | conventionnement (1), code-financeur (2) |
| Durée totale | 321 heures | extra.action.nombre-heures-total |
| Session | 11/02/2026 - 30/04/2026 | extra.action.session.periode |
| Jours de présence | | |
| Départements | 18 - Cher, 28 - Eure-et-Loir, 36 - Indre, 37 - Indre-et-Loire, 41 - Loir-et-Cher, 45 - Loiret | zone_eligibilite |
| Conditions | | |
| Zone d'action | AFPA de Blois, 13 Rue Robert Nau, 41000 Blois | adresse, commune, latitude, longitude |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Logo | Donnée manquante | Chercher sur le site AFPA |
| Public | Pas de public spécifique détecté (family, women, youths, etc.) | Laisser vide |
| Fréquence | Pas de volume horaire hebdomadaire indiqué | Calculer : 321h / 11 semaines ≈ 29h/semaine |
| Jours de présence | Non précisé dans la fiche | Contacter l'organisme |
| Conditions | Aucune condition spécifique détectée (titre séjour, CIR, etc.) | Laisser vide |$seed$, $seed$f411d731-ba70-42d7-85da-e05dc79f951b$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$0a01d5c1-1481-4294-bb4c-9c6fe4c2663b$seed$, $seed$2026-02-24 13:46:17.170869+00$seed$, $seed$2026-02-24 13:46:17.170869$seed$, $seed$editorial$seed$, $seed$---
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-24T13:46:16.952Z'
---

# Apprendre le français pour trouver un travail

*Une formation gratuite pour progresser en français et préparer votre projet professionnel*

Cette formation vous aide à parler, lire et écrire en français. Vous apprenez le vocabulaire utile pour le travail. Vous préparez aussi votre CV et vos entretiens d'embauche. La formation dure environ 3 mois (321 heures).

:::good-to-know
La formation est gratuite. Elle est financée par la Région Centre-Val de Loire.
:::

## Pourquoi c'est intéressant ?

:::toggle{title="Progresser en français pour le travail"}
Vous apprenez à parler, lire et écrire en français. Les cours sont adaptés au monde du travail.

Exemple : vous apprenez les mots pour parler avec un employeur ou comprendre un contrat de travail.
:::

:::toggle{title="Préparer votre recherche d'emploi"}
Vous apprenez à faire un CV et une lettre de motivation. Vous vous entraînez aussi aux entretiens d'embauche.

Exemple : vous créez votre CV avec l'aide d'un formateur, puis vous faites un entretien "pour s'entraîner".
:::

:::toggle{title="Découvrir la vie en France"}
Vous découvrez les règles de la vie quotidienne et du travail en France.

Exemple : vous apprenez comment fonctionne une entreprise, quels sont vos droits en tant que salarié.
:::

:::toggle{title="Développer vos compétences personnelles"}
Vous travaillez sur vos "soft skills" : la confiance en vous, le travail en équipe, l'autonomie.

Exemple : vous participez à un projet de groupe avec les autres personnes de la formation.
:::

## Comment faire ?

:::toggle{title="Étape 1 : Vérifier que vous pouvez participer"}
Cette formation est pour vous si :
- Vous avez plus de 16 ans
- Vous n'êtes plus à l'école
- Vous habitez en région Centre-Val de Loire (départements 18, 28, 36, 37, 41 ou 45)
- Vous cherchez un travail
- Vous êtes motivé pour apprendre le français
:::

:::toggle{title="Étape 2 : Contacter le centre de formation"}
Vous pouvez :
- Téléphoner au 02 43 75 65 85
- Envoyer un mail à via.info@viaformation.fr

:::important
Les inscriptions sont ouvertes du 15 janvier au 10 février 2026.
:::
:::

:::toggle{title="Étape 3 : Passer un test de niveau"}
Au début de la formation, vous passez un test. Ce test permet de connaître votre niveau en français. Ensuite, les formateurs préparent un programme adapté pour vous.
:::

### Autres informations

- **Lieu** : AFPA de Blois, 13 Rue Robert Nau, 41000 Blois
- **Dates** : du 11 février 2026 au 30 avril 2026
- **Durée totale** : 321 heures (environ 3 mois)
- **Horaires** : en journée, du lundi au vendredi
- **Public** : personnes de plus de 16 ans qui cherchent un travail

### Pour aller plus loin

- Site de l'AFPA : [www.afpa.fr](https://www.afpa.fr)
- Fiche Carif-Oref : [Voir la fiche complète](https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html)

### Journal des Avertissements

| Type de problème | Champ ou élément | Niveau de risque | Détail / justification | Suggestion de correction |
|------------------|------------------|------------------|------------------------|--------------------------|
| Donnée manquante | Niveau de français requis | mineur | Pas de niveau CECRL précisé dans la fiche source | Demander à l'organisme le niveau d'entrée (A1, A2 ?) |
| Donnée manquante | Jours et horaires précis | mineur | "En présentiel" mais pas d'horaires détaillés | Vérifier auprès de l'AFPA les créneaux exacts |
| Contenu tronqué | info-public-vise | faible | Texte coupé dans la source ("[...]") | Texte suffisant pour comprendre le public cible |
| Reformulation | "soft skills" | faible | Terme anglais conservé car couramment utilisé | Terme expliqué dans le contexte |

### Lexique

**Allophone** : Personne qui parle une autre langue que le français à la maison.

**CV** : Curriculum Vitae. C'est un document qui présente votre parcours : études, expériences de travail, compétences.

**Lettre de motivation** : Lettre que vous envoyez avec votre CV pour expliquer pourquoi vous voulez ce travail.

**Soft skills** : Compétences personnelles comme la communication, le travail en équipe, l'organisation.

**AFPA** : Agence nationale pour la Formation Professionnelle des Adultes. C'est un organisme public qui propose des formations pour les adultes.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-24T13:46:16.952Z"}}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$---
---

# Apprendre le français pour trouver un travail

*Une formation gratuite pour progresser en français et préparer votre projet professionnel*

Cette formation vous aide à parler, lire et écrire en français. Vous apprenez le vocabulaire utile pour le travail. Vous préparez aussi votre CV et vos entretiens d'embauche. La formation dure environ 3 mois (321 heures).

:::good-to-know
La formation est gratuite. Elle est financée par la Région Centre-Val de Loire.
:::

## Pourquoi c'est intéressant ?

:::toggle{title="Progresser en français pour le travail"}
Vous apprenez à parler, lire et écrire en français. Les cours sont adaptés au monde du travail.

Exemple : vous apprenez les mots pour parler avec un employeur ou comprendre un contrat de travail.
:::

:::toggle{title="Préparer votre recherche d'emploi"}
Vous apprenez à faire un CV et une lettre de motivation. Vous vous entraînez aussi aux entretiens d'embauche.

Exemple : vous créez votre CV avec l'aide d'un formateur, puis vous faites un entretien "pour s'entraîner".
:::

:::toggle{title="Découvrir la vie en France"}
Vous découvrez les règles de la vie quotidienne et du travail en France.

Exemple : vous apprenez comment fonctionne une entreprise, quels sont vos droits en tant que salarié.
:::

:::toggle{title="Développer vos compétences personnelles"}
Vous travaillez sur vos "soft skills" : la confiance en vous, le travail en équipe, l'autonomie.

Exemple : vous participez à un projet de groupe avec les autres personnes de la formation.
:::

## Comment faire ?

:::toggle{title="Étape 1 : Vérifier que vous pouvez participer"}
Cette formation est pour vous si :
- Vous avez plus de 16 ans
- Vous n'êtes plus à l'école
- Vous habitez en région Centre-Val de Loire (départements 18, 28, 36, 37, 41 ou 45)
- Vous cherchez un travail
- Vous êtes motivé pour apprendre le français
:::

:::toggle{title="Étape 2 : Contacter le centre de formation"}
Vous pouvez :
- Téléphoner au 02 43 75 65 85
- Envoyer un mail à via.info@viaformation.fr

:::important
Les inscriptions sont ouvertes du 15 janvier au 10 février 2026.
:::
:::

:::toggle{title="Étape 3 : Passer un test de niveau"}
Au début de la formation, vous passez un test. Ce test permet de connaître votre niveau en français. Ensuite, les formateurs préparent un programme adapté pour vous.
:::

### Autres informations

- **Lieu** : AFPA de Blois, 13 Rue Robert Nau, 41000 Blois
- **Dates** : du 11 février 2026 au 30 avril 2026
- **Durée totale** : 321 heures (environ 3 mois)
- **Horaires** : en journée, du lundi au vendredi
- **Public** : personnes de plus de 16 ans qui cherchent un travail

### Pour aller plus loin

- Site de l'AFPA : [www.afpa.fr](https://www.afpa.fr)
- Fiche Carif-Oref : [Voir la fiche complète](https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html)

### Journal des Avertissements

| Type de problème | Champ ou élément | Niveau de risque | Détail / justification | Suggestion de correction |
|------------------|------------------|------------------|------------------------|--------------------------|
| Donnée manquante | Niveau de français requis | mineur | Pas de niveau CECRL précisé dans la fiche source | Demander à l'organisme le niveau d'entrée (A1, A2 ?) |
| Donnée manquante | Jours et horaires précis | mineur | "En présentiel" mais pas d'horaires détaillés | Vérifier auprès de l'AFPA les créneaux exacts |
| Contenu tronqué | info-public-vise | faible | Texte coupé dans la source ("[...]") | Texte suffisant pour comprendre le public cible |
| Reformulation | "soft skills" | faible | Terme anglais conservé car couramment utilisé | Terme expliqué dans le contexte |

### Lexique

**Allophone** : Personne qui parle une autre langue que le français à la maison.

**CV** : Curriculum Vitae. C'est un document qui présente votre parcours : études, expériences de travail, compétences.

**Lettre de motivation** : Lettre que vous envoyez avec votre CV pour expliquer pourquoi vous voulez ce travail.

**Soft skills** : Compétences personnelles comme la communication, le travail en équipe, l'organisation.

**AFPA** : Agence nationale pour la Formation Professionnelle des Adultes. C'est un organisme public qui propose des formations pour les adultes.$seed$, $seed$f411d731-ba70-42d7-85da-e05dc79f951b$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$615aa598-44ca-43a6-9e8c-d173b3b241f3$seed$, $seed$2026-02-25 15:58:20.967585+00$seed$, $seed$2026-02-25 15:58:20.967585$seed$, $seed$metadata$seed$, $seed$---
metadata_ri:
  mainSponsor: Association animation centre social
  needs:
    - 613721a409c5190dfa70d057
    - 613721a409c5190dfa70d058
    - 613721a409c5190dfa70d079
    - 613721a409c5190dfa70d066
  secondaryThemes:
    - 63286a015d31b2c0cad9960e
    - 63286a015d31b2c0cad9960b
  theme: 63286a015d31b2c0cad9960a
  titreInformatif: >-
    Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers
    sociolinguistiques et Compétences Pro
  titreMarque: Association animation centre social
  abstract: Apprendre le français pour être autonome
  location:
    - 75 - Paris
    - 77 - Seine-et-Marne
    - 78 - Yvelines
    - 91 - Essonne
    - 92 - Hauts-de-Seine
    - 93 - Seine-Saint-Denis
    - 94 - Val-de-Marne
    - 95 - Val-d'Oise
  frenchLevel:
    - alpha
    - A1
    - A2
  age: null
  price:
    - values:
        - gratuit
      details: ''
  publicStatus:
    - asile
    - refugie
    - subsidiaire
    - temporaire
    - apatride
  public: null
  conditions: null
  commitment:
    - amountDetails: exactly
      hours:
        - 120
      timeUnit: hours
  frequency:
    - amountDetails: exactly
      hours:
        - 4
      timeUnit: hours
      frequencyUnit: week
  timeSlots: null
  periode:
    - debut:
        $date: '2025-09-29T00:00:00.000Z'
      fin:
        $date: '2026-06-26T23:59:59.999Z'
  map:
    - title: Association animation centre social
      address: '3 Rue de l''Orme au Charron, 77340'
      city: Pontault-Combault
      lat: 48.800217
      lng: 2.609679
      description: ''
      email: cscpontault@gmail.com
      phone: 0160285101
provenance:
  - key: mainSponsor
    label: Structure
    value: Association animation centre social
    status: valid
    source:
      - structure.nom
  - key: titreInformatif
    label: Titre informatif
    value: >-
      Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers
      sociolinguistiques et Compétences Pro
    status: valid
    source:
      - nom
  - key: titreMarque
    label: Titre marque
    value: Association animation centre social
    status: valid
    source:
      - structure.nom
  - key: abstract
    label: En bref
    value: Apprendre le français pour être autonome
    status: valid
    source:
      - description
  - key: theme
    label: Thème
    value: Apprendre le français
    status: valid
    source:
      - description
      - thematiques
  - key: secondaryThemes
    label: Thèmes secondaires
    value: 'Trouver un travail, Faire mes papiers'
    status: valid
    source:
      - description
  - key: needs
    label: Besoins
    value: >-
      Prendre des cours, Apprendre le français pour le travail, Apprendre à
      utiliser un ordinateur, Avoir de l'aide pour mes démarches
    status: valid
    source:
      - description
  - key: publicStatus
    label: Public visé
    value: Personnes en situation d'exil
    status: valid
    source:
      - publics
      - extra.code-public-vise
  - key: public
    label: Public
    value: ''
    status: missing
    source: []
  - key: frenchLevel
    label: Niveau de français
    value: 'Alphabétisation, A1, A2'
    status: valid
    source:
      - description
      - extra.code-niveau-entree
  - key: age
    label: Âge
    value: ''
    status: missing
    source: []
  - key: price
    label: Prix
    value: Gratuit
    status: valid
    source:
      - extra.action.frais-restants
  - key: commitment
    label: Durée totale
    value: 120 heures
    status: valid
    source:
      - extra.action.nombre-heures-total
  - key: frequency
    label: Fréquence
    value: 4h/semaine
    status: valid
    source:
      - volume_horaire_hebdomadaire
  - key: periode
    label: Session
    value: 29/09/2025 - 26/06/2026
    status: valid
    source:
      - extra.action.session.periode.debut
      - extra.action.session.periode.fin
  - key: timeSlots
    label: Jours de présence
    value: ''
    status: missing
    source: []
  - key: location
    label: Départements
    value: '75, 77, 78, 91, 92, 93, 94, 95'
    status: valid
    source:
      - zone_eligibilite
  - key: conditions
    label: Conditions
    value: ''
    status: valid
    source:
      - conditions_acces
  - key: map
    label: Zone d'action
    value: Pontault-Combault
    status: valid
    source:
      - adresse
      - commune
      - latitude
      - longitude
      - courriel
      - telephone
  - key: logo
    label: Logo
    value: ''
    status: missing
    source: []
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-25T15:58:20.826Z'
---

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | Association animation centre social | structure.nom |
| Structure | Association animation centre social | structure.nom |
| Logo | | |
| En bref | Apprendre le français pour être autonome | description |
| Thèmes | Apprendre le français | description, thematiques |
| Besoins | Prendre des cours, Apprendre le français pour le travail, Apprendre à utiliser un ordinateur, Avoir de l'aide pour mes démarches | description |
| Public visé | Personnes en situation d'exil (primo-arrivants, réfugiés) | publics, extra.code-public-vise |
| Public | | |
| Fréquence | 4h/semaine | volume_horaire_hebdomadaire |
| Niveau de français | Alphabétisation, A1, A2 | description, extra.code-niveau-entree |
| Âge | | |
| Prix | Gratuit | extra.action.frais-restants |
| Durée totale | 120 heures | extra.action.nombre-heures-total |
| Session | 29/09/2025 - 26/06/2026 | extra.action.session.periode |
| Jours de présence | | |
| Départements | 75, 77, 78, 91, 92, 93, 94, 95 (Île-de-France) | zone_eligibilite |
| Conditions | Aucune condition spécifique | conditions_acces |
| Zone d'action | 3 Rue de l'Orme au Charron, 77340 Pontault-Combault | adresse, commune, latitude, longitude |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Logo | Donnée manquante | Chercher sur le site du Centre social et culturel |
| Public | Pas de public spécifique (famille, femmes, jeunes, etc.) | Laisser vide - dispositif ouvert à tous |
| Âge | Non spécifié dans la fiche | Confirmer avec la structure si restriction d'âge |
| Jours de présence | Créneaux non précisés | Contacter la structure pour horaires exacts |
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-25T15:58:20.826Z"}, "provenance": [{"key": "mainSponsor", "label": "Structure", "value": "Association animation centre social", "source": ["structure.nom"], "status": "valid"}, {"key": "titreInformatif", "label": "Titre informatif", "value": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers sociolinguistiques et Compétences Pro", "source": ["nom"], "status": "valid"}, {"key": "titreMarque", "label": "Titre marque", "value": "Association animation centre social", "source": ["structure.nom"], "status": "valid"}, {"key": "abstract", "label": "En bref", "value": "Apprendre le français pour être autonome", "source": ["description"], "status": "valid"}, {"key": "theme", "label": "Thème", "value": "Apprendre le français", "source": ["description", "thematiques"], "status": "valid"}, {"key": "secondaryThemes", "label": "Thèmes secondaires", "value": "Trouver un travail, Faire mes papiers", "source": ["description"], "status": "valid"}, {"key": "needs", "label": "Besoins", "value": "Prendre des cours, Apprendre le français pour le travail, Apprendre à utiliser un ordinateur, Avoir de l'aide pour mes démarches", "source": ["description"], "status": "valid"}, {"key": "publicStatus", "label": "Public visé", "value": "Personnes en situation d'exil", "source": ["publics", "extra.code-public-vise"], "status": "valid"}, {"key": "public", "label": "Public", "value": "", "source": [], "status": "missing"}, {"key": "frenchLevel", "label": "Niveau de français", "value": "Alphabétisation, A1, A2", "source": ["description", "extra.code-niveau-entree"], "status": "valid"}, {"key": "age", "label": "Âge", "value": "", "source": [], "status": "missing"}, {"key": "price", "label": "Prix", "value": "Gratuit", "source": ["extra.action.frais-restants"], "status": "valid"}, {"key": "commitment", "label": "Durée totale", "value": "120 heures", "source": ["extra.action.nombre-heures-total"], "status": "valid"}, {"key": "frequency", "label": "Fréquence", "value": "4h/semaine", "source": ["volume_horaire_hebdomadaire"], "status": "valid"}, {"key": "periode", "label": "Session", "value": "29/09/2025 - 26/06/2026", "source": ["extra.action.session.periode.debut", "extra.action.session.periode.fin"], "status": "valid"}, {"key": "timeSlots", "label": "Jours de présence", "value": "", "source": [], "status": "missing"}, {"key": "location", "label": "Départements", "value": "75, 77, 78, 91, 92, 93, 94, 95", "source": ["zone_eligibilite"], "status": "valid"}, {"key": "conditions", "label": "Conditions", "value": "", "source": ["conditions_acces"], "status": "valid"}, {"key": "map", "label": "Zone d'action", "value": "Pontault-Combault", "source": ["adresse", "commune", "latitude", "longitude", "courriel", "telephone"], "status": "valid"}, {"key": "logo", "label": "Logo", "value": "", "source": [], "status": "missing"}], "metadata_ri": {"age": null, "map": [{"lat": 48.800217, "lng": 2.609679, "city": "Pontault-Combault", "email": "cscpontault@gmail.com", "phone": "0160285101", "title": "Association animation centre social", "address": "3 Rue de l'Orme au Charron, 77340", "description": ""}], "needs": ["613721a409c5190dfa70d057", "613721a409c5190dfa70d058", "613721a409c5190dfa70d079", "613721a409c5190dfa70d066"], "price": [{"values": ["gratuit"], "details": ""}], "theme": "63286a015d31b2c0cad9960a", "public": null, "periode": [{"fin": {"$date": "2026-06-26T23:59:59.999Z"}, "debut": {"$date": "2025-09-29T00:00:00.000Z"}}], "abstract": "Apprendre le français pour être autonome", "location": ["75 - Paris", "77 - Seine-et-Marne", "78 - Yvelines", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise"], "frequency": [{"hours": [4], "timeUnit": "hours", "amountDetails": "exactly", "frequencyUnit": "week"}], "timeSlots": null, "commitment": [{"hours": [120], "timeUnit": "hours", "amountDetails": "exactly"}], "conditions": null, "frenchLevel": ["alpha", "A1", "A2"], "mainSponsor": "Association animation centre social", "titreMarque": "Association animation centre social", "publicStatus": ["asile", "refugie", "subsidiaire", "temporaire", "apatride"], "secondaryThemes": ["63286a015d31b2c0cad9960e", "63286a015d31b2c0cad9960b"], "titreInformatif": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers sociolinguistiques et Compétences Pro"}}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$---
metadata_ri:
  mainSponsor: "Association animation centre social"
  needs: ["613721a409c5190dfa70d057", "613721a409c5190dfa70d058", "613721a409c5190dfa70d079", "613721a409c5190dfa70d066"]
  secondaryThemes: ["63286a015d31b2c0cad9960e", "63286a015d31b2c0cad9960b"]
  theme: "63286a015d31b2c0cad9960a"
  titreInformatif: "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers sociolinguistiques et Compétences Pro"
  titreMarque: "Association animation centre social"
  abstract: "Apprendre le français pour être autonome"
  location: ["75 - Paris", "77 - Seine-et-Marne", "78 - Yvelines", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise"]
  frenchLevel: ["alpha", "A1", "A2"]
  age: null
  price:
    - values: ["gratuit"]
      details: ""
  publicStatus: ["asile", "refugie", "subsidiaire", "temporaire", "apatride"]
  public: null
  conditions: null
  commitment:
    - amountDetails: "exactly"
      hours: [120]
      timeUnit: "hours"
  frequency:
    - amountDetails: "exactly"
      hours: [4]
      timeUnit: "hours"
      frequencyUnit: "week"
  timeSlots: null
  periode:
    - debut:
        $date: "2025-09-29T00:00:00.000Z"
      fin:
        $date: "2026-06-26T23:59:59.999Z"
  map:
    - title: "Association animation centre social"
      address: "3 Rue de l'Orme au Charron, 77340"
      city: "Pontault-Combault"
      lat: 48.800217
      lng: 2.609679
      description: ""
      email: "cscpontault@gmail.com"
      phone: "0160285101"
provenance:
  - key: "mainSponsor"
    label: "Structure"
    value: "Association animation centre social"
    status: "valid"
    source: ["structure.nom"]
  - key: "titreInformatif"
    label: "Titre informatif"
    value: "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers sociolinguistiques et Compétences Pro"
    status: "valid"
    source: ["nom"]
  - key: "titreMarque"
    label: "Titre marque"
    value: "Association animation centre social"
    status: "valid"
    source: ["structure.nom"]
  - key: "abstract"
    label: "En bref"
    value: "Apprendre le français pour être autonome"
    status: "valid"
    source: ["description"]
  - key: "theme"
    label: "Thème"
    value: "Apprendre le français"
    status: "valid"
    source: ["description", "thematiques"]
  - key: "secondaryThemes"
    label: "Thèmes secondaires"
    value: "Trouver un travail, Faire mes papiers"
    status: "valid"
    source: ["description"]
  - key: "needs"
    label: "Besoins"
    value: "Prendre des cours, Apprendre le français pour le travail, Apprendre à utiliser un ordinateur, Avoir de l'aide pour mes démarches"
    status: "valid"
    source: ["description"]
  - key: "publicStatus"
    label: "Public visé"
    value: "Personnes en situation d'exil"
    status: "valid"
    source: ["publics", "extra.code-public-vise"]
  - key: "public"
    label: "Public"
    value: ""
    status: "missing"
    source: []
  - key: "frenchLevel"
    label: "Niveau de français"
    value: "Alphabétisation, A1, A2"
    status: "valid"
    source: ["description", "extra.code-niveau-entree"]
  - key: "age"
    label: "Âge"
    value: ""
    status: "missing"
    source: []
  - key: "price"
    label: "Prix"
    value: "Gratuit"
    status: "valid"
    source: ["extra.action.frais-restants"]
  - key: "commitment"
    label: "Durée totale"
    value: "120 heures"
    status: "valid"
    source: ["extra.action.nombre-heures-total"]
  - key: "frequency"
    label: "Fréquence"
    value: "4h/semaine"
    status: "valid"
    source: ["volume_horaire_hebdomadaire"]
  - key: "periode"
    label: "Session"
    value: "29/09/2025 - 26/06/2026"
    status: "valid"
    source: ["extra.action.session.periode.debut", "extra.action.session.periode.fin"]
  - key: "timeSlots"
    label: "Jours de présence"
    value: ""
    status: "missing"
    source: []
  - key: "location"
    label: "Départements"
    value: "75, 77, 78, 91, 92, 93, 94, 95"
    status: "valid"
    source: ["zone_eligibilite"]
  - key: "conditions"
    label: "Conditions"
    value: ""
    status: "valid"
    source: ["conditions_acces"]
  - key: "map"
    label: "Zone d'action"
    value: "Pontault-Combault"
    status: "valid"
    source: ["adresse", "commune", "latitude", "longitude", "courriel", "telephone"]
  - key: "logo"
    label: "Logo"
    value: ""
    status: "missing"
    source: []
---

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | Association animation centre social | structure.nom |
| Structure | Association animation centre social | structure.nom |
| Logo | | |
| En bref | Apprendre le français pour être autonome | description |
| Thèmes | Apprendre le français | description, thematiques |
| Besoins | Prendre des cours, Apprendre le français pour le travail, Apprendre à utiliser un ordinateur, Avoir de l'aide pour mes démarches | description |
| Public visé | Personnes en situation d'exil (primo-arrivants, réfugiés) | publics, extra.code-public-vise |
| Public | | |
| Fréquence | 4h/semaine | volume_horaire_hebdomadaire |
| Niveau de français | Alphabétisation, A1, A2 | description, extra.code-niveau-entree |
| Âge | | |
| Prix | Gratuit | extra.action.frais-restants |
| Durée totale | 120 heures | extra.action.nombre-heures-total |
| Session | 29/09/2025 - 26/06/2026 | extra.action.session.periode |
| Jours de présence | | |
| Départements | 75, 77, 78, 91, 92, 93, 94, 95 (Île-de-France) | zone_eligibilite |
| Conditions | Aucune condition spécifique | conditions_acces |
| Zone d'action | 3 Rue de l'Orme au Charron, 77340 Pontault-Combault | adresse, commune, latitude, longitude |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Logo | Donnée manquante | Chercher sur le site du Centre social et culturel |
| Public | Pas de public spécifique (famille, femmes, jeunes, etc.) | Laisser vide - dispositif ouvert à tous |
| Âge | Non spécifié dans la fiche | Confirmer avec la structure si restriction d'âge |
| Jours de présence | Créneaux non précisés | Contacter la structure pour horaires exacts |$seed$, $seed$3aa0a9ec-32ce-4f18-9d65-b2816cd6cffa$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$506e7e33-ce03-4ba0-9e38-c2929497a1f8$seed$, $seed$2026-02-26 02:36:59.957773+00$seed$, $seed$2026-02-26 02:36:59.957773$seed$, $seed$metadata$seed$, $seed$---
metadata_ri:
  mainSponsor: Institut de formation et de développement
  needs:
    - 613721a409c5190dfa70d057
    - 613721a409c5190dfa70d05e
    - 613721a409c5190dfa70d058
  secondaryThemes:
    - 63286a015d31b2c0cad9960e
  theme: 63286a015d31b2c0cad9960a
  titreInformatif: >-
    Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers
    linguistiques du soir
  titreMarque: Institut de formation et de développement
  abstract: Cours de français le soir pour primo-arrivants
  location:
    - 75 - Paris
    - 77 - Seine-et-Marne
    - 78 - Yvelines
    - 91 - Essonne
    - 92 - Hauts-de-Seine
    - 93 - Seine-Saint-Denis
    - 94 - Val-de-Marne
    - 95 - Val-d'Oise
  frenchLevel:
    - A1
    - A2
    - B1
  age: null
  price:
    - values:
        - '0'
      details: ''
  publicStatus:
    - refugie
    - asile
    - subsidiaire
    - temporaire
    - apatride
  public:
    - women
    - family
  conditions:
    - school
  commitment:
    - amountDetails: exactly
      hours:
        - 320
      timeUnit: hours
  frequency:
    - amountDetails: exactly
      hours:
        - 4
      timeUnit: hours
      frequencyUnit: week
  timeSlots: null
  periode:
    - debut:
        $date: '2026-11-05T00:00:00.000Z'
      fin:
        $date: '2026-12-31T23:59:59.999Z'
  map:
    - title: Ifdev
      address: '44 Boulevard Georges Clemenceau, 78200 Mantes-la-Jolie'
      city: Mantes-la-Jolie
      lat: 48.99789
      lng: 1.687963
      description: ''
      email: a.atigui@ifdev.org
      phone: '+33130946383'
provenance:
  - key: mainSponsor
    label: Structure
    value: Institut de formation et de développement
    status: valid
    source:
      - structure.nom
  - key: titreInformatif
    label: Titre informatif
    value: >-
      Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers
      linguistiques du soir
    status: valid
    source:
      - nom
  - key: titreMarque
    label: Titre marque
    value: Institut de formation et de développement
    status: valid
    source:
      - structure.nom
  - key: abstract
    label: En bref
    value: Cours de français le soir pour primo-arrivants
    status: valid
    source:
      - description
      - nom
  - key: theme
    label: Thème principal
    value: Apprendre le français
    status: valid
    source:
      - thematiques
      - description
  - key: secondaryThemes
    label: Thèmes secondaires
    value: Trouver un travail
    status: valid
    source:
      - description
  - key: needs
    label: Besoins
    value: >-
      Prendre des cours, Passer un diplôme officiel, Apprendre le français pour
      le travail
    status: valid
    source:
      - description
      - thematiques
  - key: publicStatus
    label: Public visé
    value: Personnes en situation d'exil
    status: valid
    source:
      - publics
      - extra.action.organisme-financeur.extras.extra.code-public-vise
  - key: public
    label: Public
    value: 'Femmes, Famille'
    status: valid
    source:
      - publics_precisions
      - extra.action.info-public-vise
  - key: frenchLevel
    label: Niveau de français
    value: 'A1, A2, B1'
    status: valid
    source:
      - description
      - conditions_acces
  - key: age
    label: Âge
    value: ''
    status: missing
    source: []
  - key: price
    label: Prix
    value: Gratuit
    status: valid
    source:
      - extra.action.frais-restants
  - key: commitment
    label: Durée totale
    value: 320 heures
    status: valid
    source:
      - extra.action.nombre-heures-total
  - key: frequency
    label: Fréquence
    value: 4h/semaine
    status: valid
    source:
      - volume_horaire_hebdomadaire
  - key: timeSlots
    label: Jours de présence
    value: ''
    status: missing
    source: []
  - key: periode
    label: Session
    value: 05/11/2026 - 31/12/2026
    status: valid
    source:
      - extra.action.session.periode.debut
      - extra.action.session.periode.fin
  - key: location
    label: Départements
    value: 'Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)'
    status: valid
    source:
      - zone_eligibilite
  - key: conditions
    label: Conditions
    value: Niveau d'études (A1.1/A1 requis)
    status: valid
    source:
      - conditions_acces
  - key: map
    label: Zone d'action
    value: Mantes-la-Jolie
    status: valid
    source:
      - adresse
      - commune
      - latitude
      - longitude
      - courriel
      - telephone
  - key: logo
    label: Logo
    value: ''
    status: missing
    source: []
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-26T02:36:59.812Z'
---

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | Institut de formation et de développement | structure.nom |
| Structure | Institut de formation et de développement | structure.nom |
| Logo | | |
| En bref | Cours de français le soir pour primo-arrivants | description, nom |
| Thèmes | Apprendre le français, Trouver un travail | thematiques, description |
| Besoins | Prendre des cours, Passer un diplôme officiel, Apprendre le français pour le travail | description |
| Public visé | Personnes en situation d'exil (réfugiés, primo-arrivants) | publics, code-public-vise |
| Public | Femmes, Famille | publics_precisions, info-public-vise |
| Fréquence | 4h/semaine | volume_horaire_hebdomadaire |
| Niveau de français | A1, A2, B1 | description, conditions_acces |
| Âge | | |
| Prix | Gratuit | frais-restants |
| Durée totale | 320 heures | nombre-heures-total |
| Session | 05/11/2026 - 31/12/2026 | session.periode |
| Jours de présence | | |
| Départements | 75, 77, 78, 91, 92, 93, 94, 95 (Île-de-France) | zone_eligibilite |
| Conditions | Niveau d'études (niveau A1.1/A1 requis en oral et écrit) | conditions_acces |
| Zone d'action | 44 Boulevard Georges Clemenceau, 78200 Mantes-la-Jolie | adresse, commune, latitude, longitude |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Logo | Donnée manquante | Chercher sur le site ifdevformations.fr |
| Jours de présence | Non spécifiés (uniquement "ateliers du soir") | Contacter la structure pour préciser les jours |
| Âge | Aucune condition d'âge mentionnée | À confirmer avec la structure |
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-26T02:36:59.812Z"}, "provenance": [{"key": "mainSponsor", "label": "Structure", "value": "Institut de formation et de développement", "source": ["structure.nom"], "status": "valid"}, {"key": "titreInformatif", "label": "Titre informatif", "value": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir", "source": ["nom"], "status": "valid"}, {"key": "titreMarque", "label": "Titre marque", "value": "Institut de formation et de développement", "source": ["structure.nom"], "status": "valid"}, {"key": "abstract", "label": "En bref", "value": "Cours de français le soir pour primo-arrivants", "source": ["description", "nom"], "status": "valid"}, {"key": "theme", "label": "Thème principal", "value": "Apprendre le français", "source": ["thematiques", "description"], "status": "valid"}, {"key": "secondaryThemes", "label": "Thèmes secondaires", "value": "Trouver un travail", "source": ["description"], "status": "valid"}, {"key": "needs", "label": "Besoins", "value": "Prendre des cours, Passer un diplôme officiel, Apprendre le français pour le travail", "source": ["description", "thematiques"], "status": "valid"}, {"key": "publicStatus", "label": "Public visé", "value": "Personnes en situation d'exil", "source": ["publics", "extra.action.organisme-financeur.extras.extra.code-public-vise"], "status": "valid"}, {"key": "public", "label": "Public", "value": "Femmes, Famille", "source": ["publics_precisions", "extra.action.info-public-vise"], "status": "valid"}, {"key": "frenchLevel", "label": "Niveau de français", "value": "A1, A2, B1", "source": ["description", "conditions_acces"], "status": "valid"}, {"key": "age", "label": "Âge", "value": "", "source": [], "status": "missing"}, {"key": "price", "label": "Prix", "value": "Gratuit", "source": ["extra.action.frais-restants"], "status": "valid"}, {"key": "commitment", "label": "Durée totale", "value": "320 heures", "source": ["extra.action.nombre-heures-total"], "status": "valid"}, {"key": "frequency", "label": "Fréquence", "value": "4h/semaine", "source": ["volume_horaire_hebdomadaire"], "status": "valid"}, {"key": "timeSlots", "label": "Jours de présence", "value": "", "source": [], "status": "missing"}, {"key": "periode", "label": "Session", "value": "05/11/2026 - 31/12/2026", "source": ["extra.action.session.periode.debut", "extra.action.session.periode.fin"], "status": "valid"}, {"key": "location", "label": "Départements", "value": "Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)", "source": ["zone_eligibilite"], "status": "valid"}, {"key": "conditions", "label": "Conditions", "value": "Niveau d'études (A1.1/A1 requis)", "source": ["conditions_acces"], "status": "valid"}, {"key": "map", "label": "Zone d'action", "value": "Mantes-la-Jolie", "source": ["adresse", "commune", "latitude", "longitude", "courriel", "telephone"], "status": "valid"}, {"key": "logo", "label": "Logo", "value": "", "source": [], "status": "missing"}], "metadata_ri": {"age": null, "map": [{"lat": 48.99789, "lng": 1.687963, "city": "Mantes-la-Jolie", "email": "a.atigui@ifdev.org", "phone": "+33130946383", "title": "Ifdev", "address": "44 Boulevard Georges Clemenceau, 78200 Mantes-la-Jolie", "description": ""}], "needs": ["613721a409c5190dfa70d057", "613721a409c5190dfa70d05e", "613721a409c5190dfa70d058"], "price": [{"values": ["0"], "details": ""}], "theme": "63286a015d31b2c0cad9960a", "public": ["women", "family"], "periode": [{"fin": {"$date": "2026-12-31T23:59:59.999Z"}, "debut": {"$date": "2026-11-05T00:00:00.000Z"}}], "abstract": "Cours de français le soir pour primo-arrivants", "location": ["75 - Paris", "77 - Seine-et-Marne", "78 - Yvelines", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise"], "frequency": [{"hours": [4], "timeUnit": "hours", "amountDetails": "exactly", "frequencyUnit": "week"}], "timeSlots": null, "commitment": [{"hours": [320], "timeUnit": "hours", "amountDetails": "exactly"}], "conditions": ["school"], "frenchLevel": ["A1", "A2", "B1"], "mainSponsor": "Institut de formation et de développement", "titreMarque": "Institut de formation et de développement", "publicStatus": ["refugie", "asile", "subsidiaire", "temporaire", "apatride"], "secondaryThemes": ["63286a015d31b2c0cad9960e"], "titreInformatif": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir"}}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$---
metadata_ri:
  mainSponsor: "Institut de formation et de développement"
  needs: ["613721a409c5190dfa70d057", "613721a409c5190dfa70d05e", "613721a409c5190dfa70d058"]
  secondaryThemes: ["63286a015d31b2c0cad9960e"]
  theme: "63286a015d31b2c0cad9960a"
  titreInformatif: "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir"
  titreMarque: "Institut de formation et de développement"
  abstract: "Cours de français le soir pour primo-arrivants"
  location: ["75 - Paris", "77 - Seine-et-Marne", "78 - Yvelines", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise"]
  frenchLevel: ["A1", "A2", "B1"]
  age: null
  price:
    - values: ["0"]
      details: ""
  publicStatus: ["refugie", "asile", "subsidiaire", "temporaire", "apatride"]
  public: ["women", "family"]
  conditions: ["school"]
  commitment:
    - amountDetails: "exactly"
      hours: [320]
      timeUnit: "hours"
  frequency:
    - amountDetails: "exactly"
      hours: [4]
      timeUnit: "hours"
      frequencyUnit: "week"
  timeSlots: null
  periode:
    - debut:
        $date: "2026-11-05T00:00:00.000Z"
      fin:
        $date: "2026-12-31T23:59:59.999Z"
  map:
    - title: "Ifdev"
      address: "44 Boulevard Georges Clemenceau, 78200 Mantes-la-Jolie"
      city: "Mantes-la-Jolie"
      lat: 48.99789
      lng: 1.687963
      description: ""
      email: "a.atigui@ifdev.org"
      phone: "+33130946383"
provenance:
  - key: "mainSponsor"
    label: "Structure"
    value: "Institut de formation et de développement"
    status: "valid"
    source: ["structure.nom"]
  - key: "titreInformatif"
    label: "Titre informatif"
    value: "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir"
    status: "valid"
    source: ["nom"]
  - key: "titreMarque"
    label: "Titre marque"
    value: "Institut de formation et de développement"
    status: "valid"
    source: ["structure.nom"]
  - key: "abstract"
    label: "En bref"
    value: "Cours de français le soir pour primo-arrivants"
    status: "valid"
    source: ["description", "nom"]
  - key: "theme"
    label: "Thème principal"
    value: "Apprendre le français"
    status: "valid"
    source: ["thematiques", "description"]
  - key: "secondaryThemes"
    label: "Thèmes secondaires"
    value: "Trouver un travail"
    status: "valid"
    source: ["description"]
  - key: "needs"
    label: "Besoins"
    value: "Prendre des cours, Passer un diplôme officiel, Apprendre le français pour le travail"
    status: "valid"
    source: ["description", "thematiques"]
  - key: "publicStatus"
    label: "Public visé"
    value: "Personnes en situation d'exil"
    status: "valid"
    source: ["publics", "extra.action.organisme-financeur.extras.extra.code-public-vise"]
  - key: "public"
    label: "Public"
    value: "Femmes, Famille"
    status: "valid"
    source: ["publics_precisions", "extra.action.info-public-vise"]
  - key: "frenchLevel"
    label: "Niveau de français"
    value: "A1, A2, B1"
    status: "valid"
    source: ["description", "conditions_acces"]
  - key: "age"
    label: "Âge"
    value: ""
    status: "missing"
    source: []
  - key: "price"
    label: "Prix"
    value: "Gratuit"
    status: "valid"
    source: ["extra.action.frais-restants"]
  - key: "commitment"
    label: "Durée totale"
    value: "320 heures"
    status: "valid"
    source: ["extra.action.nombre-heures-total"]
  - key: "frequency"
    label: "Fréquence"
    value: "4h/semaine"
    status: "valid"
    source: ["volume_horaire_hebdomadaire"]
  - key: "timeSlots"
    label: "Jours de présence"
    value: ""
    status: "missing"
    source: []
  - key: "periode"
    label: "Session"
    value: "05/11/2026 - 31/12/2026"
    status: "valid"
    source: ["extra.action.session.periode.debut", "extra.action.session.periode.fin"]
  - key: "location"
    label: "Départements"
    value: "Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)"
    status: "valid"
    source: ["zone_eligibilite"]
  - key: "conditions"
    label: "Conditions"
    value: "Niveau d'études (A1.1/A1 requis)"
    status: "valid"
    source: ["conditions_acces"]
  - key: "map"
    label: "Zone d'action"
    value: "Mantes-la-Jolie"
    status: "valid"
    source: ["adresse", "commune", "latitude", "longitude", "courriel", "telephone"]
  - key: "logo"
    label: "Logo"
    value: ""
    status: "missing"
    source: []
---

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | Institut de formation et de développement | structure.nom |
| Structure | Institut de formation et de développement | structure.nom |
| Logo | | |
| En bref | Cours de français le soir pour primo-arrivants | description, nom |
| Thèmes | Apprendre le français, Trouver un travail | thematiques, description |
| Besoins | Prendre des cours, Passer un diplôme officiel, Apprendre le français pour le travail | description |
| Public visé | Personnes en situation d'exil (réfugiés, primo-arrivants) | publics, code-public-vise |
| Public | Femmes, Famille | publics_precisions, info-public-vise |
| Fréquence | 4h/semaine | volume_horaire_hebdomadaire |
| Niveau de français | A1, A2, B1 | description, conditions_acces |
| Âge | | |
| Prix | Gratuit | frais-restants |
| Durée totale | 320 heures | nombre-heures-total |
| Session | 05/11/2026 - 31/12/2026 | session.periode |
| Jours de présence | | |
| Départements | 75, 77, 78, 91, 92, 93, 94, 95 (Île-de-France) | zone_eligibilite |
| Conditions | Niveau d'études (niveau A1.1/A1 requis en oral et écrit) | conditions_acces |
| Zone d'action | 44 Boulevard Georges Clemenceau, 78200 Mantes-la-Jolie | adresse, commune, latitude, longitude |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Logo | Donnée manquante | Chercher sur le site ifdevformations.fr |
| Jours de présence | Non spécifiés (uniquement "ateliers du soir") | Contacter la structure pour préciser les jours |
| Âge | Aucune condition d'âge mentionnée | À confirmer avec la structure |$seed$, $seed$e173e735-552e-46a6-9b4b-a56521d43ce0$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$b8611875-ecd7-4141-a08e-020f0846f998$seed$, $seed$2026-02-25 15:52:49.160481+00$seed$, $seed$2026-02-25 15:52:49.160481$seed$, $seed$ingestion$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242984_SE_0001611012.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-25T15:52:49.065Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant), `81042` (réfugié) | ✅ Accepté |
| 4. Type dispositif | ASL complémentaire CIR – Formation de droit commun utile aux réfugiés | ✅ Accepté |
| 5. Durée | 271 jours (29/09/2025 → 26/06/2026) | ✅ Accepté |
| 6. Volume horaire | 120h | ✅ Accepté |

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** `duplicate: false` 🆗 — Nouveau dispositif

### Analyse comparative

| Axe | Fiche DI | Dispositifs existants |
|-----|----------|----------------------|
| 📍 Localisation | **77 - Seine-et-Marne** (Pontault-Combault) | Aucun dispositif ASL trouvé à Pontault-Combault |
| 🏢 Structure | **Association animation centre social** | Structure non référencée dans la base |
| 📝 Contenu | ASL complémentaires CIR + Compétences Pro | Dispositifs ASL similaires dans d'autres départements (10 - Aube, 42 - Loire) mais pas en 77 |

### Justification
Aucun dispositif existant ne correspond à cette combinaison :
- La structure "Association animation centre social" n'apparaît pas dans la base RI
- Aucun dispositif ASL n'est référencé pour Pontault-Combault (77)
- Les dispositifs similaires (ASL Pôle Social Le Corbusier, Centre Alpha Choisy) couvrent d'autres territoires

**→ Cette fiche peut être créée comme nouveau dispositif.**
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-25T15:52:49.065Z"}, "compliant": true, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242984_SE_0001611012.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242984_SE_0001611012.html
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant), `81042` (réfugié) | ✅ Accepté |
| 4. Type dispositif | ASL complémentaire CIR – Formation de droit commun utile aux réfugiés | ✅ Accepté |
| 5. Durée | 271 jours (29/09/2025 → 26/06/2026) | ✅ Accepté |
| 6. Volume horaire | 120h | ✅ Accepté |

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** `duplicate: false` 🆗 — Nouveau dispositif

### Analyse comparative

| Axe | Fiche DI | Dispositifs existants |
|-----|----------|----------------------|
| 📍 Localisation | **77 - Seine-et-Marne** (Pontault-Combault) | Aucun dispositif ASL trouvé à Pontault-Combault |
| 🏢 Structure | **Association animation centre social** | Structure non référencée dans la base |
| 📝 Contenu | ASL complémentaires CIR + Compétences Pro | Dispositifs ASL similaires dans d'autres départements (10 - Aube, 42 - Loire) mais pas en 77 |

### Justification
Aucun dispositif existant ne correspond à cette combinaison :
- La structure "Association animation centre social" n'apparaît pas dans la base RI
- Aucun dispositif ASL n'est référencé pour Pontault-Combault (77)
- Les dispositifs similaires (ASL Pôle Social Le Corbusier, Centre Alpha Choisy) couvrent d'autres territoires

**→ Cette fiche peut être créée comme nouveau dispositif.**$seed$, $seed$3aa0a9ec-32ce-4f18-9d65-b2816cd6cffa$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$4582902b-94cd-425c-80ae-408334cf49bb$seed$, $seed$2026-02-26 02:25:06.030145+00$seed$, $seed$2026-02-26 02:25:06.030145$seed$, $seed$ingestion$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000241678_SE_0001597312.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-26T02:25:05.893Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant), `81042` (réfugié) | ✅ Accepté |
| 4. Type dispositif | ASL complémentaires du CIR - Droit commun utile aux réfugiés, pas de restriction nationalité | ✅ Accepté |
| 5. Durée | 57 jours (05/11/2026 → 31/12/2026) | ✅ Accepté |
| 6. Volume horaire | 320 heures | ✅ Accepté |

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** `duplicate: false` 🆗 NOUVEAU

### Analyse comparative

| Axe | Critère | Résultat |
|-----|---------|----------|
| 📍 Localisation | 78 - Yvelines (Mantes-la-Jolie) | Aucune fiche ASL/CIR existante dans ce département pour cette structure |
| 🏢 Structure | Institut de formation et de développement (Ifdev) | Non référencé dans la base |
| 📝 Contenu | ASL complémentaires du CIR - Ateliers linguistiques du soir | Pas d'équivalent trouvé |

**Justification:** La recherche sémantique a identifié plusieurs fiches ASL dans d'autres départements (39, 50, 76...) mais aucune correspondance pour Ifdev dans les Yvelines. Ce dispositif est nouveau pour Réfugiés.info.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-26T02:25:05.893Z"}, "compliant": true, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000241678_SE_0001597312.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$Je lance l'audit de conformité éditoriale DI et la détection de doublons en parallèle.---
compliant: true
duplicate: false
carif_oref_url: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000241678_SE_0001597312.html
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant), `81042` (réfugié) | ✅ Accepté |
| 4. Type dispositif | ASL complémentaires du CIR - Droit commun utile aux réfugiés, pas de restriction nationalité | ✅ Accepté |
| 5. Durée | 57 jours (05/11/2026 → 31/12/2026) | ✅ Accepté |
| 6. Volume horaire | 320 heures | ✅ Accepté |

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** `duplicate: false` 🆗 NOUVEAU

### Analyse comparative

| Axe | Critère | Résultat |
|-----|---------|----------|
| 📍 Localisation | 78 - Yvelines (Mantes-la-Jolie) | Aucune fiche ASL/CIR existante dans ce département pour cette structure |
| 🏢 Structure | Institut de formation et de développement (Ifdev) | Non référencé dans la base |
| 📝 Contenu | ASL complémentaires du CIR - Ateliers linguistiques du soir | Pas d'équivalent trouvé |

**Justification:** La recherche sémantique a identifié plusieurs fiches ASL dans d'autres départements (39, 50, 76...) mais aucune correspondance pour Ifdev dans les Yvelines. Ce dispositif est nouveau pour Réfugiés.info.$seed$, $seed$e173e735-552e-46a6-9b4b-a56521d43ce0$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$d8f1ef1e-fc58-4ed0-a4ea-a4b245a758ae$seed$, $seed$2026-02-26 02:32:52.268107+00$seed$, $seed$2026-02-26 02:32:52.268107$seed$, $seed$ingestion$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242613_SE_0001608026.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-02-26T02:32:52.154Z'
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant), `81042` (réfugié) + "demandeurs d'asile" | ✅ Accepté |
| 4. Type dispositif | Formation ASL complémentaire CIR - Droit commun, pas de restriction nationalité | ✅ Accepté |
| 5. Durée | 304 jours (01/10/2025 → 31/07/2026) | ✅ Accepté |
| 6. Volume horaire | 110 heures | ✅ Accepté |

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** `duplicate: false` 🆗 NOUVEAU

### Analyse

| Axe | Fiche DI | Base RI | Correspondance |
|-----|----------|---------|----------------|
| 📍 Localisation | 93 - Seine-Saint-Denis (Saint-Denis) + IDF (75-95) | Plusieurs fiches IDF | ⚠️ Zone commune |
| 🏢 Structure | **Association pour l'insertion des jeunes (APIJ)** | Aucune structure APIJ trouvée | ❌ Pas de match |
| 📝 Contenu | ASL CIR - Parcours linguistique professionnel A1.1 | Fiches FLE/ASL similaires mais structures différentes | ❌ Pas de match exact |

### Justification

Aucun dispositif existant ne correspond à cette combinaison :
- **Structure APIJ** non référencée dans la base RI
- Bien que des formations similaires (ASL, FLE professionnel) existent en Île-de-France, elles sont portées par d'autres structures (Atellanes, FISPE, Le Picoulet, etc.)

**→ Cette fiche peut être créée comme nouveau dispositif.**
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-02-26T02:32:52.154Z"}, "compliant": true, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242613_SE_0001608026.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$Je lance l'audit de cette fiche DI (conformité éditoriale + détection doublons).---
compliant: true
duplicate: false
carif_oref_url: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242613_SE_0001608026.html
---

# Rapport de traitement DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant), `81042` (réfugié) + "demandeurs d'asile" | ✅ Accepté |
| 4. Type dispositif | Formation ASL complémentaire CIR - Droit commun, pas de restriction nationalité | ✅ Accepté |
| 5. Durée | 304 jours (01/10/2025 → 31/07/2026) | ✅ Accepté |
| 6. Volume horaire | 110 heures | ✅ Accepté |

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** `duplicate: false` 🆗 NOUVEAU

### Analyse

| Axe | Fiche DI | Base RI | Correspondance |
|-----|----------|---------|----------------|
| 📍 Localisation | 93 - Seine-Saint-Denis (Saint-Denis) + IDF (75-95) | Plusieurs fiches IDF | ⚠️ Zone commune |
| 🏢 Structure | **Association pour l'insertion des jeunes (APIJ)** | Aucune structure APIJ trouvée | ❌ Pas de match |
| 📝 Contenu | ASL CIR - Parcours linguistique professionnel A1.1 | Fiches FLE/ASL similaires mais structures différentes | ❌ Pas de match exact |

### Justification

Aucun dispositif existant ne correspond à cette combinaison :
- **Structure APIJ** non référencée dans la base RI
- Bien que des formations similaires (ASL, FLE professionnel) existent en Île-de-France, elles sont portées par d'autres structures (Atellanes, FISPE, Le Picoulet, etc.)

**→ Cette fiche peut être créée comme nouveau dispositif.**$seed$, $seed$26c0e650-0e85-4819-b64b-013f8a972dad$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$b86d4059-934c-471a-b89e-cb29c46db8cc$seed$, $seed$2026-03-02 13:30:48.933122+00$seed$, $seed$2026-03-02 13:30:48.933122$seed$, $seed$metadata$seed$, $seed$---
metadata_ri:
  mainSponsor: Association pour l'insertion des jeunes
  needs:
    - 613721a409c5190dfa70d057
    - 613721a409c5190dfa70d058
    - 613721a409c5190dfa70d056
    - 613721a409c5190dfa70d079
  secondaryThemes:
    - 63286a015d31b2c0cad9960e
  theme: 63286a015d31b2c0cad9960a
  titreInformatif: >-
    Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO :
    Parcours Linguistique à visée professionnelle généraliste
  titreMarque: Association pour l'insertion des jeunes
  abstract: Apprendre le français pour trouver un travail
  location:
    - 75 - Paris
    - 77 - Seine-et-Marne
    - 78 - Yvelines
    - 91 - Essonne
    - 92 - Hauts-de-Seine
    - 93 - Seine-Saint-Denis
    - 94 - Val-de-Marne
    - 95 - Val-d'Oise
  frenchLevel:
    - A1
  age: null
  price:
    - values:
        - gratuit
      details: ''
  publicStatus:
    - asile
    - refugie
    - subsidiaire
    - temporaire
    - apatride
  public: null
  conditions:
    - school
  commitment:
    - amountDetails: exactly
      hours:
        - 110
      timeUnit: hours
  frequency: null
  timeSlots: null
  periode:
    - debut:
        $date: '2025-10-01T00:00:00.000Z'
      fin:
        $date: '2026-07-31T23:59:59.999Z'
  map:
    - title: Association pour l'insertion des jeunes
      address: '5 Place Youri Gagarine, 93200 Saint-Denis'
      city: Saint-Denis
      lat: 48.931921
      lng: 2.382025
      description: ''
      email: sophiedanne.apij@gmail.com
      phone: 0695925301
provenance:
  - key: mainSponsor
    label: Structure
    value: Association pour l'insertion des jeunes
    status: valid
    source:
      - structure.nom
  - key: titreInformatif
    label: Titre informatif
    value: Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO
    status: valid
    source:
      - nom
  - key: titreMarque
    label: Titre marque
    value: Association pour l'insertion des jeunes
    status: valid
    source:
      - structure.nom
  - key: abstract
    label: En bref
    value: Apprendre le français pour trouver un travail
    status: valid
    source:
      - description
  - key: theme
    label: Thème
    value: Apprendre le français
    status: valid
    source:
      - description
      - thematiques
  - key: secondaryThemes
    label: Thèmes secondaires
    value: Trouver un travail
    status: valid
    source:
      - description
  - key: needs
    label: Besoins
    value: >-
      Prendre des cours, Apprendre le français pour le travail, Se préparer (CV,
      entretien), Apprendre à utiliser un ordinateur
    status: valid
    source:
      - description
  - key: location
    label: Départements
    value: Île-de-France (8 départements)
    status: valid
    source:
      - zone_eligibilite
  - key: frenchLevel
    label: Niveau de français
    value: A1
    status: valid
    source:
      - conditions_acces
  - key: publicStatus
    label: Public visé
    value: 'Personnes en situation d''exil, demandeurs d''asile'
    status: valid
    source:
      - extra.organisme-financeur.extras.code-public-vise
      - publics
      - publics_precisions
  - key: public
    label: Public
    value: ''
    status: missing
    source: []
  - key: price
    label: Prix
    value: Gratuit
    status: valid
    source:
      - extra.action.frais-restants
  - key: commitment
    label: Durée totale
    value: 110 heures
    status: valid
    source:
      - extra.action.nombre-heures-total
  - key: frequency
    label: Fréquence
    value: ''
    status: missing
    source: []
  - key: timeSlots
    label: Jours de présence
    value: ''
    status: missing
    source: []
  - key: periode
    label: Session
    value: 01/10/2025 - 31/07/2026
    status: valid
    source:
      - extra.action.session.periode.debut
      - extra.action.session.periode.fin
  - key: conditions
    label: Conditions
    value: Niveau d'études (A1.1 oral et écrit requis)
    status: valid
    source:
      - conditions_acces
  - key: age
    label: Âge
    value: ''
    status: missing
    source: []
  - key: logo
    label: Logo
    value: ''
    status: missing
    source: []
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-03-02T13:30:48.813Z'
---

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | Association pour l'insertion des jeunes | structure.nom |
| Structure | Association pour l'insertion des jeunes | structure.nom |
| Logo | | |
| En bref | Apprendre le français pour trouver un travail | description |
| Thèmes | Apprendre le français | description, thematiques |
| Besoins | Prendre des cours, Apprendre le français pour le travail, Se préparer (CV, entretien), Apprendre à utiliser un ordinateur | description |
| Public visé | Personnes en situation d'exil, demandeurs d'asile | code-public-vise, publics, publics_precisions |
| Public | | |
| Fréquence | | |
| Niveau de français | A1 | conditions_acces |
| Âge | | |
| Prix | Gratuit | extra.action.frais-restants |
| Durée totale | 110 heures | extra.action.nombre-heures-total |
| Session | 01/10/2025 - 31/07/2026 | extra.action.session.periode |
| Jours de présence | | |
| Départements | 75, 77, 78, 91, 92, 93, 94, 95 (Île-de-France) | zone_eligibilite |
| Conditions | Niveau d'études (niveau A1.1 oral/écrit requis) | conditions_acces |
| Zone d'action | | |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Logo | Donnée manquante | Chercher sur le site apijasso.org |
| Fréquence | volume_horaire_hebdomadaire absent | Contacter la structure pour préciser |
| Jours de présence | Donnée manquante | Contacter la structure |
| Public | Pas de mention famille/femmes/jeunes/séniors | Vérifier si public spécifique visé |
| Âge | Donnée manquante | Vérifier s'il y a des restrictions d'âge |
```
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-03-02T13:30:48.813Z"}, "provenance": [{"key": "mainSponsor", "label": "Structure", "value": "Association pour l'insertion des jeunes", "source": ["structure.nom"], "status": "valid"}, {"key": "titreInformatif", "label": "Titre informatif", "value": "Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO", "source": ["nom"], "status": "valid"}, {"key": "titreMarque", "label": "Titre marque", "value": "Association pour l'insertion des jeunes", "source": ["structure.nom"], "status": "valid"}, {"key": "abstract", "label": "En bref", "value": "Apprendre le français pour trouver un travail", "source": ["description"], "status": "valid"}, {"key": "theme", "label": "Thème", "value": "Apprendre le français", "source": ["description", "thematiques"], "status": "valid"}, {"key": "secondaryThemes", "label": "Thèmes secondaires", "value": "Trouver un travail", "source": ["description"], "status": "valid"}, {"key": "needs", "label": "Besoins", "value": "Prendre des cours, Apprendre le français pour le travail, Se préparer (CV, entretien), Apprendre à utiliser un ordinateur", "source": ["description"], "status": "valid"}, {"key": "location", "label": "Départements", "value": "Île-de-France (8 départements)", "source": ["zone_eligibilite"], "status": "valid"}, {"key": "frenchLevel", "label": "Niveau de français", "value": "A1", "source": ["conditions_acces"], "status": "valid"}, {"key": "publicStatus", "label": "Public visé", "value": "Personnes en situation d'exil, demandeurs d'asile", "source": ["extra.organisme-financeur.extras.code-public-vise", "publics", "publics_precisions"], "status": "valid"}, {"key": "public", "label": "Public", "value": "", "source": [], "status": "missing"}, {"key": "price", "label": "Prix", "value": "Gratuit", "source": ["extra.action.frais-restants"], "status": "valid"}, {"key": "commitment", "label": "Durée totale", "value": "110 heures", "source": ["extra.action.nombre-heures-total"], "status": "valid"}, {"key": "frequency", "label": "Fréquence", "value": "", "source": [], "status": "missing"}, {"key": "timeSlots", "label": "Jours de présence", "value": "", "source": [], "status": "missing"}, {"key": "periode", "label": "Session", "value": "01/10/2025 - 31/07/2026", "source": ["extra.action.session.periode.debut", "extra.action.session.periode.fin"], "status": "valid"}, {"key": "conditions", "label": "Conditions", "value": "Niveau d'études (A1.1 oral et écrit requis)", "source": ["conditions_acces"], "status": "valid"}, {"key": "age", "label": "Âge", "value": "", "source": [], "status": "missing"}, {"key": "logo", "label": "Logo", "value": "", "source": [], "status": "missing"}], "metadata_ri": {"age": null, "map": [{"lat": 48.931921, "lng": 2.382025, "city": "Saint-Denis", "email": "sophiedanne.apij@gmail.com", "phone": "0695925301", "title": "Association pour l'insertion des jeunes", "address": "5 Place Youri Gagarine, 93200 Saint-Denis", "description": ""}], "needs": ["613721a409c5190dfa70d057", "613721a409c5190dfa70d058", "613721a409c5190dfa70d056", "613721a409c5190dfa70d079"], "price": [{"values": ["gratuit"], "details": ""}], "theme": "63286a015d31b2c0cad9960a", "public": null, "periode": [{"fin": {"$date": "2026-07-31T23:59:59.999Z"}, "debut": {"$date": "2025-10-01T00:00:00.000Z"}}], "abstract": "Apprendre le français pour trouver un travail", "location": ["75 - Paris", "77 - Seine-et-Marne", "78 - Yvelines", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise"], "frequency": null, "timeSlots": null, "commitment": [{"hours": [110], "timeUnit": "hours", "amountDetails": "exactly"}], "conditions": ["school"], "frenchLevel": ["A1"], "mainSponsor": "Association pour l'insertion des jeunes", "titreMarque": "Association pour l'insertion des jeunes", "publicStatus": ["asile", "refugie", "subsidiaire", "temporaire", "apatride"], "secondaryThemes": ["63286a015d31b2c0cad9960e"], "titreInformatif": "Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO : Parcours Linguistique à visée professionnelle généraliste"}}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$```yaml
---
metadata_ri:
  mainSponsor: "Association pour l'insertion des jeunes"
  needs: ["613721a409c5190dfa70d057", "613721a409c5190dfa70d058", "613721a409c5190dfa70d056", "613721a409c5190dfa70d079"]
  secondaryThemes: ["63286a015d31b2c0cad9960e"]
  theme: "63286a015d31b2c0cad9960a"
  titreInformatif: "Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO : Parcours Linguistique à visée professionnelle généraliste"
  titreMarque: "Association pour l'insertion des jeunes"
  abstract: "Apprendre le français pour trouver un travail"
  location: ["75 - Paris", "77 - Seine-et-Marne", "78 - Yvelines", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise"]
  frenchLevel: ["A1"]
  age: null
  price:
    - values: ["gratuit"]
      details: ""
  publicStatus: ["asile", "refugie", "subsidiaire", "temporaire", "apatride"]
  public: null
  conditions: ["school"]
  commitment:
    - amountDetails: "exactly"
      hours: [110]
      timeUnit: "hours"
  frequency: null
  timeSlots: null
  periode:
    - debut:
        $date: "2025-10-01T00:00:00.000Z"
      fin:
        $date: "2026-07-31T23:59:59.999Z"
  map:
    - title: "Association pour l'insertion des jeunes"
      address: "5 Place Youri Gagarine, 93200 Saint-Denis"
      city: "Saint-Denis"
      lat: 48.931921
      lng: 2.382025
      description: ""
      email: "sophiedanne.apij@gmail.com"
      phone: "0695925301"
provenance:
  - key: "mainSponsor"
    label: "Structure"
    value: "Association pour l'insertion des jeunes"
    status: "valid"
    source: ["structure.nom"]
  - key: "titreInformatif"
    label: "Titre informatif"
    value: "Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO"
    status: "valid"
    source: ["nom"]
  - key: "titreMarque"
    label: "Titre marque"
    value: "Association pour l'insertion des jeunes"
    status: "valid"
    source: ["structure.nom"]
  - key: "abstract"
    label: "En bref"
    value: "Apprendre le français pour trouver un travail"
    status: "valid"
    source: ["description"]
  - key: "theme"
    label: "Thème"
    value: "Apprendre le français"
    status: "valid"
    source: ["description", "thematiques"]
  - key: "secondaryThemes"
    label: "Thèmes secondaires"
    value: "Trouver un travail"
    status: "valid"
    source: ["description"]
  - key: "needs"
    label: "Besoins"
    value: "Prendre des cours, Apprendre le français pour le travail, Se préparer (CV, entretien), Apprendre à utiliser un ordinateur"
    status: "valid"
    source: ["description"]
  - key: "location"
    label: "Départements"
    value: "Île-de-France (8 départements)"
    status: "valid"
    source: ["zone_eligibilite"]
  - key: "frenchLevel"
    label: "Niveau de français"
    value: "A1"
    status: "valid"
    source: ["conditions_acces"]
  - key: "publicStatus"
    label: "Public visé"
    value: "Personnes en situation d'exil, demandeurs d'asile"
    status: "valid"
    source: ["extra.organisme-financeur.extras.code-public-vise", "publics", "publics_precisions"]
  - key: "public"
    label: "Public"
    value: ""
    status: "missing"
    source: []
  - key: "price"
    label: "Prix"
    value: "Gratuit"
    status: "valid"
    source: ["extra.action.frais-restants"]
  - key: "commitment"
    label: "Durée totale"
    value: "110 heures"
    status: "valid"
    source: ["extra.action.nombre-heures-total"]
  - key: "frequency"
    label: "Fréquence"
    value: ""
    status: "missing"
    source: []
  - key: "timeSlots"
    label: "Jours de présence"
    value: ""
    status: "missing"
    source: []
  - key: "periode"
    label: "Session"
    value: "01/10/2025 - 31/07/2026"
    status: "valid"
    source: ["extra.action.session.periode.debut", "extra.action.session.periode.fin"]
  - key: "conditions"
    label: "Conditions"
    value: "Niveau d'études (A1.1 oral et écrit requis)"
    status: "valid"
    source: ["conditions_acces"]
  - key: "age"
    label: "Âge"
    value: ""
    status: "missing"
    source: []
  - key: "logo"
    label: "Logo"
    value: ""
    status: "missing"
    source: []
---

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | Association pour l'insertion des jeunes | structure.nom |
| Structure | Association pour l'insertion des jeunes | structure.nom |
| Logo | | |
| En bref | Apprendre le français pour trouver un travail | description |
| Thèmes | Apprendre le français | description, thematiques |
| Besoins | Prendre des cours, Apprendre le français pour le travail, Se préparer (CV, entretien), Apprendre à utiliser un ordinateur | description |
| Public visé | Personnes en situation d'exil, demandeurs d'asile | code-public-vise, publics, publics_precisions |
| Public | | |
| Fréquence | | |
| Niveau de français | A1 | conditions_acces |
| Âge | | |
| Prix | Gratuit | extra.action.frais-restants |
| Durée totale | 110 heures | extra.action.nombre-heures-total |
| Session | 01/10/2025 - 31/07/2026 | extra.action.session.periode |
| Jours de présence | | |
| Départements | 75, 77, 78, 91, 92, 93, 94, 95 (Île-de-France) | zone_eligibilite |
| Conditions | Niveau d'études (niveau A1.1 oral/écrit requis) | conditions_acces |
| Zone d'action | | |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Logo | Donnée manquante | Chercher sur le site apijasso.org |
| Fréquence | volume_horaire_hebdomadaire absent | Contacter la structure pour préciser |
| Jours de présence | Donnée manquante | Contacter la structure |
| Public | Pas de mention famille/femmes/jeunes/séniors | Vérifier si public spécifique visé |
| Âge | Donnée manquante | Vérifier s'il y a des restrictions d'âge |
```$seed$, $seed$26c0e650-0e85-4819-b64b-013f8a972dad$seed$) ON CONFLICT DO NOTHING;
INSERT INTO letta_reports ("id", "created_at", "updated_at", "report_type", "markdown", "metadata", "agent_id", "status", "raw_response", "workflow_id") VALUES ($seed$485bc041-ad80-4f13-adce-e8b5b632975c$seed$, $seed$2026-03-02 13:30:08.403023+00$seed$, $seed$2026-03-02 13:30:08.403023$seed$, $seed$ingestion$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: >-
  https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242613_SE_0001608026.html
letta:
  agent_id: agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af
  processed_at: '2026-03-02T13:30:07.984Z'
---

# Rapport d'audit DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant) + `81042` (réfugié) | ✅ Accepté |
| 4. Type dispositif | Formation ASL complémentaire CIR - Droit commun utile aux réfugiés | ✅ Accepté |
| 5. Durée | 303 jours (01/10/2025 → 31/07/2026) | ✅ Accepté |
| 6. Volume horaire | 110 heures | ✅ Accepté |

**Remarque:** Formation conventionnée BOP 104 (programme régional IDF ASL 2025-2026), financée par le Ministère de l'Intérieur, ciblant explicitement les primo-arrivants et réfugiés (+ demandeurs d'asile selon `info-public-vise`).

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Nouveau dispositif 🆗

### Analyse comparative

| Critère | Fiche candidate | Correspondances trouvées |
|---------|-----------------|--------------------------|
| **Structure** | Association pour l'insertion des jeunes (APIJ) | Aucune fiche APIJ dans la base |
| **Localisation** | 93 - Seine-Saint-Denis + IDF (75, 77, 78, 91, 92, 94, 95) | — |
| **Type** | ASL complémentaires CIR - Parcours linguistique professionnel | — |

### Fiches proches (non-doublons)

| ID | Titre | Structure | Raison de non-doublon |
|----|-------|-----------|----------------------|
| `62e7ce1f95963ed3053e1d67` | Faire une formation en français de niveau A2 ou B1 | FIDE | Structure différente |
| `6818e223d377d621f0d652be` | Apprendre le français et être autonome | Association Accion Artistica | Structure différente, Saint-Denis mais autre organisme |

**Conclusion:** Aucun doublon détecté. La structure APIJ (Association pour l'insertion des jeunes) n'a pas de fiche existante sur Réfugiés.info. Cette fiche peut être créée comme nouveau dispositif.
$seed$, $seed${"letta": {"agent_id": "agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af", "processed_at": "2026-03-02T13:30:07.984Z"}, "compliant": true, "duplicate": false, "carif_oref_url": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242613_SE_0001608026.html"}$seed$, $seed$agent-bd542fe1-c8d9-4f3d-bcbb-cfc2f750c9af$seed$, $seed$complete$seed$, $seed$---
compliant: true
duplicate: false
carif_oref_url: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242613_SE_0001608026.html
---

# Rapport d'audit DI

<hr id="audit">

## 1. Analyse de Conformité Éditoriale

**Décision finale:** Fiche acceptée ✅

| Étape | Donnée trouvée | Décision |
|-------|----------------|----------|
| 1. Conventionnement | `1` (Oui) | ✅ Accepté |
| 2. Financeur | `19` (État - Ministère de l'intérieur) | ✅ Accepté |
| 3. Public visé | `81023` (primo-arrivant) + `81042` (réfugié) | ✅ Accepté |
| 4. Type dispositif | Formation ASL complémentaire CIR - Droit commun utile aux réfugiés | ✅ Accepté |
| 5. Durée | 303 jours (01/10/2025 → 31/07/2026) | ✅ Accepté |
| 6. Volume horaire | 110 heures | ✅ Accepté |

**Remarque:** Formation conventionnée BOP 104 (programme régional IDF ASL 2025-2026), financée par le Ministère de l'Intérieur, ciblant explicitement les primo-arrivants et réfugiés (+ demandeurs d'asile selon `info-public-vise`).

<hr id="doublons">

## 2. Détection de Doublons

**Décision:** Nouveau dispositif 🆗

### Analyse comparative

| Critère | Fiche candidate | Correspondances trouvées |
|---------|-----------------|--------------------------|
| **Structure** | Association pour l'insertion des jeunes (APIJ) | Aucune fiche APIJ dans la base |
| **Localisation** | 93 - Seine-Saint-Denis + IDF (75, 77, 78, 91, 92, 94, 95) | — |
| **Type** | ASL complémentaires CIR - Parcours linguistique professionnel | — |

### Fiches proches (non-doublons)

| ID | Titre | Structure | Raison de non-doublon |
|----|-------|-----------|----------------------|
| `62e7ce1f95963ed3053e1d67` | Faire une formation en français de niveau A2 ou B1 | FIDE | Structure différente |
| `6818e223d377d621f0d652be` | Apprendre le français et être autonome | Association Accion Artistica | Structure différente, Saint-Denis mais autre organisme |

**Conclusion:** Aucun doublon détecté. La structure APIJ (Association pour l'insertion des jeunes) n'a pas de fiche existante sur Réfugiés.info. Cette fiche peut être créée comme nouveau dispositif.$seed$, $seed$26c0e650-0e85-4819-b64b-013f8a972dad$seed$) ON CONFLICT DO NOTHING;
