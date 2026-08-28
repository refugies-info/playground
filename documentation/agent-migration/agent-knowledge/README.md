# Corpus `agent-knowledge` — sources de l'agent IA Letta Code

> **Statut** : scaffold (PR-02 / RI-1259, 15 juin 2026). Le contenu sera rempli par les PR suivants.

## À quoi ça sert

Ce corpus est la **source de vérité locale et versionnée** de tout ce que l'agent IA Letta Code consomme à l'exécution : prompts, skills, références, exemples. Il remplace les **ressources figées** de Letta Cloud (cf. inventaire : « les ressources Letta Cloud sont gelées depuis la dépréciation des File resources »).

**Pourquoi local et versionné** :

1. Letta Cloud a déprécié la mise à jour des "File" resources. Les agents de prod reposent sur des ressources uploadées **avant** cette dépréciation et ne seront **plus jamais mises à jour** côté Letta Cloud. Tout changement de prompt, de skill ou de référence doit passer par git.
2. La migration cible le SDK Letta Code + le runtime `qmd`. Le runtime lira ce corpus à froid au démarrage, puis au chaud sur changement de fichier.
3. Le format d'entrée de la prod est désormais le **markdown (frontmatter YAML + corps)** issu de l'API Data Inclusion. Le corpus doit être aligné sur ce format.

## Structure

```
agent-knowledge/
├── README.md            ← ce fichier
├── SCHEMA.md            ← Schéma de frontmatter obligatoire pour chaque type de fichier
├── CHANGELOG.md         ← Une ligne par modification matérielle du corpus
├── corpus.config.yaml   ← Métadonnées qmd (nom, version, owner)
│
├── prompts/             ← Prompts Letta Cloud exportés (PR-03 / RI-1260)
│                         — pas de skill, juste des instructions pures
│
├── skills/              ← Compétences invocables par l'agent (1 dossier par skill)
│   ├── audit/           ← PR-09 / RI-1264 — audit conformité + détection doublons
│   ├── redaction/       ← PR-10 / RI-1265 — réécriture éditoriale
│   ├── metadata/        ← PR-11 / RI-1266 — mapping métadonnées
│   └── translate/       ← PR-13 / RI-1268 — traduction multilingue (ar/uk/ru/ps/ti)
│
├── references/          ← Docs de référence statiques que l'agent peut consulter
│                         — schéma DI, codes langues, etc.
│
├── examples/            ← Paires input/output worked (few-shot) consommées par les skills
│
└── index.qmd            ← Index qmd (construit en PR-05 / RI-1262, stub ici)
```

## Conventions

Voir [SCHEMA.md](./SCHEMA.md) pour le détail du frontmatter obligatoire par type de fichier.

**Règles d'or** :

1. **Un dossier par skill** — pas de fichiers `SKILL.md` à la racine de `skills/`. Le nom du dossier = nom du skill.
2. **Pas de duplication** — si une info existe déjà dans `packages/agents/prompts/`, `packages/shared/`, etc., on **référence** (lien relatif), on ne copie pas.
3. **Tous les chemins internes sont relatifs au repo** — le corpus marche offline (qmd, agent, grep).
4. **Chaque modification matérielle ajoute une ligne dans [CHANGELOG.md](./CHANGELOG.md)**.
5. **Pas de secrets, pas de données personnelles** dans le corpus. C'est une source d'instructions, pas de données.

## Comment c'est consommé

```
┌─────────────────────────────────────────────────────┐
│  Letta Code runtime (PR-23+ / RI-1278)              │
│                                                     │
│  au boot : charge `corpus/skills/*/SKILL.md`        │
│  + `corpus/prompts/*.md`                           │
│  + `corpus/references/*.md`                        │
│                                                     │
│  au warm : qmd ré-indexe le corpus (PR-24+)        │
│                                                     │
│  au runtime : l'agent invoque les skills par        │
│  leur nom (`/audit`, `/redaction`, ...)            │
└─────────────────────────────────────────────────────┘
```

## Validation

`pnpm validate:corpus` (ajouté par ce PR) vérifie :

- Tous les fichiers `.md` du corpus ont un frontmatter conforme au schéma (cf. `SCHEMA.md`)
- Les `SKILL.md` des skills ont `name` + `description` (convention Letta Code)
- Aucun lien relatif cassé (les références à `packages/agents/prompts/*.md` doivent exister)
- Chaque skill a au moins un exemple ou une référence (anti-pattern : skill vide)

Le script **fail** sur erreur de schéma, **warn** sur les liens cassés (pour ne pas casser le CI sur du contenu legacy).

## Plan de remplissage

| PR    | RI       | Contenu ajouté                                                |
|-------|----------|---------------------------------------------------------------|
| 02 ✅ | RI-1259  | Ce scaffold (structure, conventions, validation)               |
| 03    | RI-1260  | Export des 3 prompts Letta Cloud → `corpus/prompts/`          |
| 05    | RI-1262  | Construction de `corpus/index.qmd`                            |
| 09    | RI-1264  | `corpus/skills/audit/SKILL.md` + exemples                     |
| 10    | RI-1265  | `corpus/skills/redaction/SKILL.md` + exemples                 |
| 11    | RI-1266  | `corpus/skills/metadata/SKILL.md` + exemples (réimplémenté)   |
| 13    | RI-1268  | `corpus/skills/translate/SKILL.md` + `examples/{lang}/`       |
| 18    | RI-1274  | Référence au tool `validate_metadata_ri`                      |
| 20    | RI-1276  | Référence au tool `search_ri_duplicate_dispositifs`           |

Voir l'[inventaire Letta Cloud](../letta-cloud-inventory.md) section D pour le plan complet.

## Décisions actées par défaut (PR-02)

Luis, 15 juin 2026 — ces choix sont pris par défaut pour ne pas bloquer le scaffold. À discuter/amender dans un PR de suivi si besoin.

1. **Emplacement** : `documentation/agent-migration/agent-knowledge/` (sous `documentation/`, cohérent avec l'inventaire et les autres assets de migration)
2. **Format des skills** : style Letta Code — un `SKILL.md` par skill, exemples inline ou dans un sous-dossier `examples/`
3. **Sévérité de la validation** : erreurs de frontmatter = fail CI, liens cassés = warn (pour absorber le legacy)
4. **Multilingue (skill `translate`)** : un seul skill `translate/` qui couvre les 5 langues (ar/uk/ru/ps/ti), avec exemples par langue dans `examples/translate/{ar,uk,ru,ps,ti}/`

## Export Letta Cloud (PR-03 / RI-1260) — migration one-shot, terminée

Les fichiers de ce corpus ont été bootstrappés depuis Letta Cloud via deux scripts d'export one-shot, **supprimés dans le commit `770ef93`** (post-PR-03) car la migration est terminée. Le corpus est désormais la source de vérité versionnée — il n'est plus synchronisé depuis Letta Cloud.

**Pourquoi les scripts ont été retirés** :

- L'API `/v1/folders/*` de Letta Cloud est dépréciée serveur-side (retourne 400 sur tous les endpoints)
- Le contournement utilisé (`GET /v1/agents/{agent_id}/export`, porté de [karfur PR #3788](https://github.com/refugies-info/karfur/pull/3788)) était suffisant pour la migration initiale
- Le runtime du playground (PR-04+) se connecte à Agathe via la **Letta Code WS API**, pas via l'API HTTP Letta Cloud utilisée par les scripts
- Les scripts n'ont donc plus de consommateur runtime — ce sont devenus du code mort

**Pour référence historique**, les étapes de la migration initiale (juin 2026) :

- 3 blocs de prompts workspace (`system/metadata_schema`, `system/compétence_conformité_éditoriale_di`, `system/compétence_détection_doublons`) → `prompts/`
- 13 fichiers de corpus (8 langage-clair, 4 metadatas, 2 conformite-editoriale) via l'endpoint agent-level → `{langage-clair,metadatas,conformite-editoriale}/`
- PDF convertis en Markdown côté serveur Letta Cloud, JSON/CSV conservés natifs
- Contacts non publics masqués (emails, téléphones)
- Source `ressources_exemples_redaction` exclue après revue qualité
- Manifeste `_export-manifest.json` (15 KB) pour la traçabilité par fichier (chunks, file_id, source_path, weak_extraction_reasons)
- 1 408 chunks indexés, 0 alerte d'extraction faible, 6 fichiers exclus

**Pour mettre à jour le corpus depuis Letta Cloud** (si besoin futur) : utiliser [karfur PR #3788](https://github.com/refugies-info/karfur/pull/3788) comme référence — le script y est maintenu. Réécrire ensuite manuellement les fichiers modifiés dans ce dossier.

Voir `documentation/agent-migration/letta-cloud-audit-2026-06-15.md` pour l'audit complet de l'API Letta Cloud.
