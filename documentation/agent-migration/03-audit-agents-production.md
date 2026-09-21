# Audit des agents en production

> **Section §3.5 — état réel des agents constaté via l'API Letta le 18/09/2026.**

---

### 3.5 État réel des agents en production (audit API du 18/09/2026)

Audit réalisé via l'API Letta avec `PLAYGROUND_LETTA_API_KEY`, projet par défaut `97c52a94-4e58-4226-9ac3-b000d1dcba78`. Les IDs fournis par Luis sont confirmés ; la liste contenait plus d'agents que l'inventaire du 15/06/2026.

#### Agents actifs et éléments périmés

| Agent | ID | Modèle | Prompt | Dernier run | Statut |
|---|---|---|---|---|---|
| **Agathe** | `agent-bd542fe1-…c9af` | `anthropic/claude-sonnet-4-6` | 4 164 c. | 17/09 16:39 | ✅ Actif |
| Agathe-dev | `agent-8165c57b-…1168` | `letta/auto-chat` | identique | 07/09 | Expérimental |
| traducteur_ar_v2 | `agent-9b1e38aa-…ce86` | `letta/auto` | 9 301 c. | 17/09 16:12 | ✅ Actif |
| traducteur_en | `agent-d70a6911-…986a` | `letta/auto` | 9 301 c. | 17/09 16:12 | ✅ Actif |
| traducteur_fa | `agent-09f186f2-…26` | `letta/auto` | 9 301 c. | 17/09 16:12 | ✅ Actif |
| traducteur_ps | `agent-42fb380d-…6a7` | `letta/auto` | 9 301 c. | 17/09 16:13 | ✅ Actif |
| traducteur_ti | `agent-f59e9249-…735` | `letta/auto` | **12 522 c.** | 17/09 16:15 | ⚠️ Voir anomalie |
| traducteur_ru | `agent-4d7f539b-…c9f7` | `letta/auto` | 1 707 c. | 17/09 16:12 | ⚠️ Ancien prompt |
| traducteur_uk | `agent-add8dcc9-…b59` | `letta/auto` | 1 707 c. | 17/09 16:12 | ⚠️ Ancien prompt |
| traducteur_ar | `agent-c19d4b57-…24b` | `anthropic/claude-haiku-4-5` | 1 707 c. | **16/06** |  **Remplacé par `_v2`** |
| traducteur_ti | `agent-00b19760-…f7b` | `anthropic/claude-sonnet-4-6` | 9 301 c. | 02/06 | ❌ **Doublon de nom, inactif** |
| traducteur_uk_dev | `agent-2015ce50-…567` | `letta/auto` | 1 707 c. | 07/09 | Expérimental |
| Code Review | `agent-97d0fefa-…911` | `letta/auto` | 12 522 c. | 18/09 06:33 | Hors périmètre RI |
| Review-letta | `agent-38e3ff6d-…4bb` | `letta/auto` | 13 963 c. | jamais | Hors périmètre RI |

Trois drifts sont désormais **résolus** :

1. **`ar` → `ar_v2`** : l'agent `ar` n'a plus tourné depuis le 16/06 et `traducteur_ar_v2` a pris le relais. Le code pointe pourtant toujours vers `agent-9b1e38aa` sous la clé `ar` — c'est correct, mais le nom `_v2` n'existe nulle part dans le code.
2. **`ti`, deux agents homonymes** : `traducteur_ti` (`f59e9249`, actif) et `traducteur_ti` (`00b19760`, inactif). Le code référence le second — **donc le mauvais**. C'était le soupçon d'août : maintenant prouvé.
3. **`en` et `fa` ont bien un agent** : l'inventaire du 15/06 indiquait « pas d'agent dédié ». C'était faux — les deux existent, tournent (`letta/auto`), et sont correctement référencés dans le code. **Aucune clé de langue n'est orpheline.**

#### Anomalie : `traducteur_ti` applique un prompt de revue de code

Le prompt de `traducteur_ti` (`agent-f59e9249`, 12 522 c.) est **octet pour octet identique** à celui de l'agent « Code Review » (`agent-97d0fefa`). Il ne contient **aucune** mention de traduction, de langue ou de document.

C'est la copie accidentelle d'un prompt de revue de code dans un agent de traduction.

> ✅ **Impact révisé le 18/09/2026** : après clonage de la mémoire de l'agent, la traduction
> s'avère pilotée par une **skill dédiée et correcte**. Voir « L'anomalie `traducteur_ti`
> n'affecte pas les traductions » ci-dessous. Le défaut reste à corriger, sans urgence.

#### Où vit réellement la connaissance

Correction d'une lecture hâtive : la liste `/v1/agents` renvoie `blocks: []` pour tous, mais **la représentation runtime en contient**. Le `system_message` réel de `traducteur_en` fait **14 462 caractères** contre 9 301 pour `agent.system` au moment de la création : **+5 161 caractères compilés depuis la mémoire**.

La structure est donc :

| Emplacement | Contenu | Récupérable ? |
|---|---|---|
| `agent.system` | Prompt de base + scaffolding (`base_instructions`, mémoire, fichier) | ✅ `GET /v1/agents/{id}` |
| Blocs compilés au runtime | `human`, `persona`, `project`, index de skills | ✅ via `GET /v1/agents/{id}/messages` (`system_message`) |
| Blocs orphelins | 199 blocs dans `project-pZvdCSjhJ7Fgmi66gqgy` — **aucun agent n'y vit** | ✅ `GET /v1/blocks` |
| Consigne de traduction | **Dans la mémoire de l'agent**, pas dans `prompts.ts` | ✅ via le `system_message` |
| `metadata_schema` | **Introuvable** via `/v1/blocks` | ❌ N'existe que dans le repo (`metadata-schema-spec.ts`, 4 483 c.) |

**Conséquence importante pour PR-11** : le dépôt `packages/agents/src/prompts.ts` ne contient que les quatre chaînes `/<commande>`. La *vraie* connaissance vit dans la mémoire des agents, et elle est **lisible via l'API des messages**. C'est la source à extraire — pas le fichier de constantes.

#### ✅ La mémoire des agents est accessible en Git — découverte majeure

Le guide officiel de migration documente un accès Git direct à la mémoire des agents
(`https://api.letta.com/v1/git/{agent-id}/state.git`). **Testé et fonctionnel le 18/09/2026
avec la clé fournie par Luis : les huit agents de production ont pu être clonés.**

C'est la source qui manquait : **la mémoire réellement en contexte**, et non des
brouillons du dépôt ni des blocs orphelins.

```bash
git clone --single-branch --branch main --no-tags \
  "https://api.letta.com/v1/git/agent-{id}/state.git" ./{agent}
```

| Agent | Agent ID | Commits | Fichiers | Taille | Dernière modif. |
|---|---|---|---|---|---|
| `agathe` | `bd542fe1` | 14 | 20 | 60,8 Ko | 2026-08-18 |
| `ti` | `f59e9249` | 9 | 7 | 33,8 Ko | 2026-06-17 |
| `uk` | `add8dcc9` | 2 | 2 | 16,4 Ko | 2026-06-02 |
| `ar_v2` | `9b1e38aa` | 6 | 5 | 15,2 Ko | 2026-06-16 |
| `en` | `d70a6911` | 8 | 7 | 15,0 Ko | 2026-06-16 |
| `ps` | `42fb380d` | 8 | 5 | 13,8 Ko | 2026-06-16 |
| `fa` | `09f186f2` | 7 | 5 | 13,3 Ko | 2026-06-16 |
| `ru` | `4d7f539b` | 2 | 2 | 4,6 Ko | 2026-06-02 |

**Total ≈ 176 Ko de connaissance métier**, avec l'historique Git complet.

> **Le risque « perte définitive » identifié en [§10.4](07-retrait-v1-et-sauvegarde.md#s104) est donc levé** : la connaissance a
> été exportée et versionnée. Le plan peut désormais traiter la conversion comme un
> travail de qualité, plus comme une course contre la fermeture.

#### ️ Deux générations de mémoire coexistent dans la production

| Génération | Agents | Format |
|---|---|---|
| **Letta Code** (avec skills) | `agathe`, `ar_v2`, `en`, `fa`, `ps`, `ti` | `skills/<nom>/SKILL.md` + `references/` + `system/persona.md` + `system/human.md` |
| **Héritée** (sans skills) | `ru`, `uk` | consignes en `system/*.md` uniquement |

Conséquence directe pour PR-11 : **les deux formats doivent être supportés**. `ru` et `uk`
portent leurs consignes dans `system/` (donc en contexte à chaque tour), les autres dans un
skill chargeable. Une unification est souhaitable, mais elle change le comportement de
chargement : à traiter comme une décision, pas comme une normalisation cosmétique.

#### ✅ `metadata_schema` est récupérable — ma conclusion précédente était fausse

`agathe/system/metadata_schema.md` (4 904 caractères) **existe dans la mémoire de l'agent**.
Le bloc n'apparaissait dans aucun listing d'API, mais il vit dans le dépôt Git.

Même constat pour l'ensemble des compétences d'Agathe :

| Fichier | Taille |
|---|---|
| `compétence_métadonnées_di.md` | 10 724 c. |
| `compétence_conformité_éditoriale_di.md` | 6 839 c. |
| `règles_rédaction_langage_clair.md` | 6 448 c. |
| `format_sortie_transformation.md` | 5 242 c. |
| `compétence_routeur.md` | 5 189 c. |
| `metadata_schema.md` | 4 993 c. |
| `compétence_transformation_langage_clair.md` | 4 842 c. |
| `compétence_détection_doublons.md` | 4 390 c. |
| `format_sortie_metadonnées.md` | 2 806 c. |
| `mémoire_vive_lexique.md` | 2 507 c. |
| `contexte_équipe.md`, `format_sortie_global.md`, `project-*.md`, `trajama_agent.md`, `traduction.md`, `persona.md`, `human.md` | 258–1 685 c. |

⚠️ **L'historique Git d'Agathe est daté et attribué**, ce qui permet de tracer chaque règle :

```
fb6c5c6 2026-08-18 Ajout de la règle modalitesEntreesSorties à l'Étape 5 (Julie)
488085d 2026-08-05 Renforcer la règle zéro texte avant frontmatter
c286beb 2026-06-25 fix: FLE toujours suffisant comme signal de rattrapage sémantique
d9bff6b 2026-06-16 Renforcement de la règle location (départements hors IDF)
```

Un `metadata-schema-spec.ts` dans le dépôt (4 483 c.) est un **parent, pas un équivalent** :
similarité de 47 % seulement. La version de production fait autorité.

#### ✅ L'anomalie `traducteur_ti` n'affecte pas les traductions

Conclusion révisée. `traducteur_ti` porte **deux** mécanismes :

1. un prompt système inadapté (copie d'un prompt de revue de code) ;
2. **une skill complète et correcte** : `skills/translating-fr-tigrinya/SKILL.md`
   (33,8 Ko avec son `references/pipeline.md`) — charte, glossaire FR→Tigrinya,
   pipeline de QA en 7 étapes, plus `system/skills/translate-fr-tigrinya.md` en contexte.

**La traduction est donc bien pilotée par une skill dédiée.** Le prompt inadapté est un
défaut de propreté, pas une cause de dégradation identifiée. Il reste à corriger, sans
urgence.

#### 🔍 Autre problème de configuration : `ru` et `uk` n'ont aucune skill

`ru` et `uk` sont actifs (dernier run le 17/09) mais leurs consignes vivent uniquement en
`system/`. Aucune skill n'est chargeable. C'est cohérent avec leur génération, mais cela
signifie que **toute leur connaissance est en contexte à chaque tour** — coût en tokens plus
élevé et aucun chargement paresseux possible.

#### Les routes de ressources restent, elles, inaccessibles

Testé le 18/09/2026 avec la clé rafraîchie (portée globale selon Luis) — **404 confirmés** :

```
GET /v1/files                → 404     GET /v1/agents/{id}/blocks   → 404
GET /v1/folders              → 404     GET /v1/agents/{id}/sources  → 404
GET /v1/sources              → 404     GET /v1/agents/{id}/files    → 404
GET /v1/organizations        → 404     GET /v1/agents/{id}/export   → 404
GET /v1/identities           → 404
```

Luis confirme que **`platform.letta.com` est passé en lecture seule**, que l'affichage des
blocs y est déprécié et que **les ressources « File » ne sont plus disponibles dans
l'interface**. C'est cohérent : ces routes sont retirées, pas seulement gelées.

#### Les blocs orphelins : un patrimoine secondaire

199 blocs dans `project-pZvdCSjhJ7Fgmi66gqgy` (47 contenus distincts, 23 artefacts RI,
≈ 86 000 caractères). **Aucun agent n'y vit** — ils ne sont donc **pas** la source de la
connaissance de production. Ils restent utiles comme **historique éditorial** (analyse LHEO,
rapports de dédoublonnage, personas Margot/Edwige, contexte d'équipe), à conserver mais sans
statut d'autorité.

Deux fichiers du dépôt y correspondent à 93,1 % (`prompts/compliance.md`) et 98,0 %
(`prompts/duplicates.md`) après retrait du wrapper `<base_instructions>` et du marqueur
`### Prompt V1 (draft)`. La leçon `corpus-migration-staleness-checks` s'applique : ce sont
des brouillons, à ne pas confondre avec les versions servies.

#### Ce qui reste hors de portée

| Élément | Statut |
|---|---|
| Ressources « File » historiques | ❌ Retirées de l'API **et** de l'interface |
| Blocs mémoire attachés aux agents | ❌ Aucun agent n'en a — tout vit dans `system/` et `skills/` |
| Autres conversations d'un agent | ⚠️ Le clonage ne prend que `main` par défaut |
| Connaissance des agents inactifs (`ar`, `ti` homonyme) | ️ Leurs dépôts n'ont pas été clonés — à faire si un historique est jugé utile |

**Verdict révisé** : la connaissance éditoriale est **intégralement sauvegardée**, y compris
`metadata_schema`. L'accès Git a transformé un risque de perte en un simple travail de mise
en forme.

> ⚠️ **Ceci ne dispense pas de la sauvegarde.** Une connaissance reconstituée depuis un brouillon `draft` n'est pas une connaissance validée. La voie A de [§3.4-h](02-etat-des-lieux.md#s34) (documents originaux) reste la cible, la voie B devient **immédiatement praticable** puisque les sources sont accessibles.
