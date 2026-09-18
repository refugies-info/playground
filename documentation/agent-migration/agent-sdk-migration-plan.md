# Migration du Content Playground vers Letta Agent SDK

**Plan de mise en œuvre avec retour arrière sécurisé — Projet Tech (TEC)**

| | |
|---|---|
| **Dépôt** | `refugies-info/playground` |
| **Révision analysée** | `main` @ `112228bf4d3bc107d94937f91a7906480822b146` |
| **Date d'analyse** | 17 septembre 2026 |
| **Auteur** | Jasmine (agent Letta Code), pour Luis Arias |
| **Statut** | Proposition à valider — intégrant la contrainte de calendrier §10 — aucun fichier applicatif ni ticket Linear n'a été modifié |
| **Objet** | Remplacer les appels applicatifs à l'ancienne API Letta par `@letta-ai/letta-agent-sdk`, avec possibilité de retour arrière en production |

> ⚠️ **Nature de ce document**
> C'est une analyse **statique** du dépôt et une lecture de la documentation officielle. Aucun test n'a été exécuté, aucun environnement staging ou production n'a été interrogé, aucune base n'a été requêtée, et aucune ressource de l'organisation Letta n'a été inspectée.
> Les faits de code ci-dessous sont vérifiés par lecture ; les écarts entre le schéma déclaré et le schéma réellement déployé, le comportement réel des agents, et les limites de la plateforme doivent encore l'être.

---

> ⚠️ **Contrainte de calendrier (Luis, 17/09/2026)**
> Il n'existe **pas de date ferme** pour la fermeture de l'API historique, mais elle est **imminente**.
> Le projet ne maîtrise donc **ni la durée ni la date** de son filet de sécurité. Les phases qui
> dépendent d'un calendrier élastique sont reclassées en criticité dans la **§10**.

---

## 1. Résumé exécutif et recommandation

**Recommandation : migration progressive et réversible, pas un remplacement direct.**

Le changement de SDK est, en soi, la partie la **plus circonscrite** du chantier : la surface d'appel est concentrée dans `packages/agents`, et l'orchestration durable est déjà assurée par Vercel Workflow, indépendamment de Letta.

Le vrai enjeu est ailleurs : **pouvoir interrompre, expliquer et restaurer une opération sans perdre le travail éditorial**. Le code actuel présente plusieurs effets irréversibles (écrasement de traductions, effacement de surcharges humaines, sélection automatique de rapports, effets externes RI/Airtable) qu'un retour arrière applicatif ne corrige pas.

### Principes de livraison

1. **Coexistence temporaire.** Les deux implémentations vivent côte à côte ; chaque opération utilise **une seule** implémentation, choisie au démarrage et conservée pendant toutes ses reprises.
2. **Une opération métier identifiée.** Une demande intentionnelle possède un identifiant stable, réutilisé par ses retries.
3. **Séparation stricte.** *Router à nouveau* ≠ *restaurer des données* ≠ *réconcilier des effets externes*. Aucun bouton global ne doit prétendre tout annuler.
4. **Rien d'irréversible sans preuve.** Pas de suppression d'agents, de mémoire ou de ressource Cloud dans le cadre de cette migration.

### Trois arbitrages à confirmer avant de figer le backlog

Ces points ne peuvent pas être tranchés par la lecture du code seul. Je formule une recommandation pour chacun.

| # | Question | Recommandation |
|---|---|---|
| A | **Isolation du chemin de secours.** Les conversations d'un même agent partagent sa mémoire : modifier l'agent utilisé par v1 pendant les essais SDK peut dégrader le secours. **Contrainte ajoutée (§3.4-c)** : le chemin historique ne permet plus de **créer** d'agent de remplacement — l'isolation ne peut donc pas être obtenue en recréant des agents côté v1. | Sauvegarder la mémoire des agents v1 **existants** (outil officiel, §10.4) et ne pas la modifier pendant la qualification ; utiliser des **agents récents** pour les essais SDK. |
| B | **Gel fonctionnel.** Les évolutions parallèles (retrieval/qmd, regroupement des traducteurs, réactivation du fan-out DI) augmentent fortement le nombre de causes possibles d'une régression. | Les **différer** en projets distincts, sauf dépendance bloquante démontrée. |
| C | **Fenêtre de secours.** Aucune date ferme publiée, mais **fermeture confirmée comme imminente par Luis (17/09/2026)**. | Préserver le chemin v1 à chaque étape, **sans planifier de période de confort**. Traiter la bascule complète comme **datée par l'extérieur** ; voir §10. |

---

## 2. Périmètre

### Dans le périmètre

- Introduire une frontière applicative dans `packages/agents` pour ne plus dépendre directement de la surface historique.
- Implémenter un adaptateur Letta Agent SDK derrière cette frontière.
- Sécuriser les écritures (reports, traductions, métadonnées), la concurrence et la reprise.
- Mettre en place un routage réversible et un mode dégradé.
- Migrer les parcours actifs un par un : audit, métadonnées, réécriture, traductions.
- Qualifier la parité en staging et encadrer la bascule progressive.

### Hors périmètre (sauf blocage démontré)

- Déploiement d'un worker Cloud Run ou d'un App Server auto-hébergé.
- Inférence locale / agents de développement locaux.
- Adoption obligatoire de qmd ou d'un autre moteur d'indexation.
- Regroupement des traducteurs en un agent multilingue unique.
- Réactivation automatique du fan-out d'ingestion DI.
- Refonte de la publication vers Réfugiés.info.
- Nettoyage définitif des agents / mémoires / ressources Letta Cloud.

> Ces sujets peuvent devenir des projets distincts. Les empiler dans la même migration rendrait impossible l'identification de la cause d'une régression.

### Note sur le plan précédent

Le plan porté par la PR #321 (et l'ancien projet Linear « Migration agent IA — Letta Code SDK et qmd ») est **obsolète** et n'est pas repris ici. Ses arbitrages ne sont pas considérés comme acquis. L'inventaire historique reste néanmoins utile comme **source de contexte** (recensement des agents, des ressources et des points de fragilité), pas comme spécification.

---

## 3. État des lieux vérifié

### 3.1 Surface d'intégration

| Constat | Référence |
|---|---|
| Dépendance déclarée dans un seul paquet | `packages/agents/package.json` — `@letta-ai/letta-client: 1.10.2` |
| Fabrique de client à double mode (`LETTA_BASE_URL` / `LETTA_ENVIRONMENT` → mode local ; sinon cloud avec clé + project ID) | `packages/agents/src/clients.ts` |
| Parcours actifs : audit, rédaction, métadonnées (multi-tâches), traduction | `packages/agents/src/{ingestion,simplification,metadata}.ts`, `packages/workflows/src/steps/translation/generate-translation.ts` |
| Appel principal : `conversations.messages.create()` avec consommation manuelle du flux et **concaténation** des fragments | `packages/agents/src/agents.ts`, `simplification.ts`, plusieurs steps de workflow |
| Récupération d'usage via l'ancien `runs.usage.retrieve()` (cast `as any`) | `packages/agents/src/simplification.ts` |
| Les steps de workflow importent `APIError` du client **sans déclarer la dépendance** (résolution par hoisting) | `packages/workflows/src/steps/ingestion/{di-single-record-steps,audit-di-step,metadata-di-step}.ts` |
| La durabilité (reprise, retry, état) vient de **Vercel Workflow**, pas de Letta | `packages/workflows/src/...`, `editorial_records.active_run_id` |
| Recherche de conversation par balayage de noms sur une liste plafonnée à 100 | `packages/agents/src/agents.ts` |
| Le fan-out IA de l'ingestion DI est **commenté** | `packages/workflows/src/pipelines/ingestion/di-ingestion.ts` |
| `prompts.ts` ne contient que les chaînes `/audit`, `/redaction`, `/metadata`, `/translate` | `packages/agents/src/prompts.ts` |
| Le corpus documentaire présent sur `main` est une **structure largement vide** | `documentation/agent-migration/agent-knowledge/` |
| Configuration de traduction : 7 clés de langue, modèles mixtes, IDs à réconcilier | `packages/shared/src/constants/languages.ts` |

> **Point d'attention** : les constantes de `prompts.ts` ne sont **pas** un export de la connaissance éditoriale. Le plan précédent les assimilait parfois à un contenu quasi complet : ce n'est pas le cas. La connaissance doit être retrouvée, vérifiée et versionnée (PR-11).

### 3.2 Risques de retour arrière déjà présents dans le code

Ces risques **préexistent** à la migration. Ils doivent être traités avant toute bascule, sinon le retour arrière sera inefficace.

**a) Métadonnées — effacement de surcharges humaines**
Une régénération réussie vide `editorial_records.metadata` pour faire du rapport IA la nouvelle base. Revenir à l'ancien SDK **ne restaure pas** ces valeurs.
*Référence : `packages/workflows/src/steps/ingestion/metadata-di-step.ts`.*

**b) Traductions — écrasement direct**
La génération écrit directement `translation_records.markdown`, sans historisation. Il faut une version restaurable **avant** bascule.
*Référence : `packages/workflows/src/steps/translation/generate-translation.ts`.*

**c) Rapports — sélection automatique**
Un trigger sélectionne les **derniers rapports complets** lors d'une sauvegarde éditoriale. Un rapport SDK écarté pourrait donc être réactivé plus tard, à l'occasion d'une sauvegarde sans rapport avec l'incident.
*Référence : `supabase/migrations/20260119155552_add_letta_reports_workflow_id_and_trigger.sql`.*

**d) Annulation**
L'annulation d'un workflow Vercel ne déclenche pas explicitement l'arrêt côté Letta. L'absence de confirmation d'arrêt ne vaut pas preuve d'arrêt.

**e) Effets externes**
Publication RI, affectation de traducteur et envoi Airtable ne sont pas compensés par un rollback applicatif. Un succès distant suivi d'un échec local peut conduire à un doublon si l'on rejoue.

**f) Route SSE métadonnées**
`apps/frontend/src/app/api/agents/metadata/stream/route.ts` :
- remplace le contenu accumulé par le **dernier fragment** (perte du contenu précédent) ;
- ne présente pas de contrôle d'autorisation métier dans son handler, alors qu'elle utilise la clé service ;
- peut envoyer `[DONE]` malgré un échec de déclenchement de la persistance.

Cette route doit être **sécurisée ou retirée** indépendamment du choix de SDK. C'est une correction de sécurité à part entière.

### 3.3 Points à vérifier avant de planifier fermement

| À vérifier | Pourquoi |
|---|---|
| Date de fermeture de l'API historique | **Confirmée comme imminente, sans date ferme** (Luis, 17/09/2026) — conditionne la durée du pont v1. Voir §10. |
| Agents réellement utilisés en production (IDs, langues, modèles) | ✅ **Résolu** — voir §3.5 |
| Schéma réellement déployé vs migrations | Le comportement des triggers et contraintes doit être constaté |
| Quels parcours IA sont réellement actifs en production | Le fan-out est désactivé dans le code : à confirmer côté exploitation |
| Consommateurs réels de la route SSE | Décide entre correction et retrait |
| Sources faisant autorité pour la connaissance éditoriale | Le corpus du dépôt est incomplet ; les brouillons locaux n'ont pas valeur de référence — **état réel des ressources établi en §3.5** |
| Limites d'exécution Vercel pour des tours de 1 à 3 minutes | Détermine la faisabilité (`maxDuration`, régions, cold start) |

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

C'est la copie accidentelle d'un prompt de revue de code dans un agent de traduction — probablement lors d'une opération de copie entre agents. Les traductions tigrinya sont donc produites avec un prompt inadapté.

> ⚠️ **À vérifier avant toute migration** : cet agent a-t-il produit des traductions en production ? Si oui, il faut déterminer l'impact éditorial. Le prompt inadapté n'empêche pas nécessairement la traduction (la commande `/translate` et le document arrivent par message utilisateur, cf. ci-dessous), mais il change le comportement attendu.

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

#### Les « ressources fichier gelées » ne sont plus accessibles

Testé le 18/09/2026 — les routes correspondantes renvoient **404** :

```
GET /v1/files                                   → 404
GET /v1/folders                                 → 404   (HTTP 400 documenté depuis le 17/07)
GET /v1/sources                                 → 404
GET /v1/agents/{id}/blocks                      → 404
GET /v1/agents/{id}/sources                     → 404
GET /v1/agents/{id}/folders                     → 404
GET /v1/agents/{id}/files                       → 404
GET /v1/agents/{id}/export                      → 404
```

Tous les agents ont `blocks: []`, `sources: []`, `tools: []`, `secrets: []`. Le gèle documenté au 15/06/2026 s'est donc transformé en **retrait effectif**.

#### Ce qui est récupérable sans accès aux fichiers

Inventaire des blocs orphelins : 199 blocs, **47 contenus distincts**, dont **23 artefacts de connaissance RI** (≈ 86 000 caractères) :

| Artefact | Taille | Copies |
|---|---|---|
| MISSION (rédaction en langage clair) | 7 817 c. | **32** |
| OUTPUT_FORMAT / format de sortie | 2 720 c. | **39** |
| Analyse de 30 formations LHEO | 16 025 c. | 2 |
| Rapport de dédoublonnage LHEO | 6 542 c. | 2 |
| `compliance_guidelines` (3 variantes) | ~5 700 c. | 6+2 |
| `<doublons>` (détection de doublons) | 5 772 c. | 8 |
| `règles_rédaction_langage_clair` | 4 461 c. | 2 |
| Compétences : routeur, conformité, doublons, transformation | 1 577–2 417 c. | 2 chacune |
| Personas : Edwige (2), Margot | 506–837 c. | 2 chacune |
| Contexte d'équipe RI | 1 468 c. | 4 |
| Version DRAFT de blocs optimisés | 5 022 c. | 2 |

**Ces blocs sont orphelins** : ils appartiennent à `project-pZvdCSjhJ7Fgmi66gqgy`, où **aucun agent ne vit**. Les agents de production n'ont jamais eu de bloc `metadata_schema`, `compliance` ou `doublons` attaché.

#### Confrontation dépôt ↔ production

Deux fichiers du dépôt ressemblent à ces artefacts, mais ce sont **des brouillons** :

| Fichier | Marqueur | Similarité avec le bloc orphelin |
|---|---|---|
| `packages/agents/prompts/compliance.md` | `### Prompt V1 (draft)` en ligne 22 + wrapper `<base_instructions>` | **93,1 %** après retrait du wrapper et du marqueur |
| `packages/agents/prompts/duplicates.md` | Wrapper `<base_instructions>` | **98,0 %** après retrait du wrapper |

Le seul écart du `compliance.md` est une ligne de pied de page boilerplate (`Base instructions complete.`). Le contenu est donc **largement récupérable depuis le dépôt** — ce que la leçon `corpus-migration-staleness-checks` prescrivait précisément de vérifier avant de traiter un fichier marqué `draft` comme export de production.

#### Ce qui reste hors de portée

| Élément | Statut |
|---|---|
| Ressources « File » historiquement poussées | ❌ **Inaccessibles** (404) — à confirmer avec Letta |
| Contenu exact des 5 012 blocs si d'autres existent | ⚠️ Le endpoint `/v1/blocks` est paginé ; 199 ont été récupérés. À paginer complètement |
| Mémoire des agents de production au-delà du `system_message` | ⚠️ Les blocs compilés sont visibles, mais leur **valeur source** ne l'est pas toujours |
| Git/MemFS des agents |  Aucun endpoint accessible avec cette clé |

**Verdict** : la connaissance éditoriale est **récupérable à ≈ 90 %** — via le dépôt (brouillons quasi identiques) et via l'API des messages (blocs compilés). Le risque « perte définitive » identifié en §10.4 est donc **nettement réduit**, mais il subsiste sur les ressources File historiques, désormais inaccessibles.

> ⚠️ **Ceci ne dispense pas de la sauvegarde.** Une connaissance reconstituée depuis un brouillon `draft` n'est pas une connaissance validée. La voie A de §3.4-h (documents originaux) reste la cible, la voie B devient **immédiatement praticable** puisque les sources sont accessibles.

> **Mise à jour du 18/09/2026 — apports du guide officiel `letta-ai/agent-v1-to-v2-migration-guide`.** Le plan ci-dessous a été revu sur quatre points structurants, détaillés en **§3.4** :
> 1. **Certaines fonctionnalités** de la surface historique **sont déjà coupées en production** (pas seulement gelées) ;
> 2. il existe un **outillage officiel de sauvegarde des agents Cloud** qui fait de la préservation des ressources une opération déléguée, pas un travail artisanal ;
> 3. le chemin de secours v1 **ne peut plus accueillir de nouveaux agents**, ce qui change la §9-A ;
> 4. un ordre de migration obligatoire apparaît entre le transport et la mémoire.

### 3.4 Ce que le guide officiel Letta change dans ce plan

Source : <https://github.com/letta-ai/agent-v1-to-v2-migration-guide> (dernier commit `61693d0`, 14/09/2026), examiné le 18/09/2026.

**a) Certaines API historiques sont déjà désactivées, pas seulement gelées.**
Le guide documente explicitement que l'endpoint `folders` retourne **HTTP 400 depuis le 17 juillet 2026** (`This API route is deprecated and no longer supported on the Letta API`).

✅ **Vérifié sur notre code** : aucune utilisation de `folders` / `filesystem` / `files` / `exportFile` dans `packages`, `apps` ou `scripts`. **Impact nul sur Playground.**
➡️ Le retrait letta Cloud est donc **incrémental**, pas un « big bang » : certains chemins tombent avant d'autres. La §10 devrait viser une **détection en continu** de ces bascules, pas une date unique.

**b) Un outillage officiel de sauvegarde d'agents Cloud existe — et il est testé.**
Le dépôt fournit une skill `backing-up-cloud-agents` avec un script (`cloud-agent.ts`) qui exporte les réglages d'un agent, ses messages de contexte et **l'historique Git complet de sa mémoire** vers un dossier privé, puis sait **recréer un agent neuf** à partir de ce backup.

- Export : `GET /v1/agents/{id}` + `GET /v1/messages/{id}` + accès Git authentifié sur `/v1/git/{agent-id}/state.git`.
- Restauration : `POST /v1/agents` (corps allowlisté, `initial_message_sequence` vide) puis clone/push Git et `POST /v1/agents/{id}/recompile`.
- Garde-fous documentés : refus d'écraser un dossier existant, jamais de `git push --force`, **aucun retry automatique** d'une création potentiellement aboutie, ID imprimé avant toute étape pouvant échouer.
- Couverture et exclusions explicitées (`references/format.md`) : secrets, outils, connexions, dépôts partagés, schedules, mémoire archival et **historique de messages** ne sont **pas** restaurés.

️ **Conséquence pour §10.4** : la sauvegarde des ressources n'est plus un travail artisanal à concevoir, c'est une **opération déléguée à l'outil officiel**, à exécuter avant la fermeture. Un workflow CI (`cloud-agent-backup.yml`) et des tests sont fournis, ce qui en fait un artefact maintenable.

**c) Le chemin de secours v1 ne peut plus accueillir de nouveaux agents.**
La restauration **crée un nouvel agent Cloud** — ce qui est précisément le sens de « v1 → v2 ». Si les routes historiques se ferment, **le rollback ne peut pas créer un agent v1 de remplacement**.

➡️ **La §9-A change de nature.** « Partager les agents v1 ou en créer des dédiés » n'est plus un arbitrage d'isolation : **créer un agent côté ancien chemin est un cul-de-sac**. Les essais SDK doivent donc utiliser des agents récents, et la préservation du v1 doit porter sur des **agents existants** dont la mémoire est sauvegardée, pas sur une capacité de recréation.

**d) Ordre obligatoire : transport d'abord, mémoire ensuite.**
Le guide insiste : l'API v1 et le SDK écrivent dans **deux magasins de mémoire différents** (blocs classiques côté v1, Git/MemFS côté SDK). La conversion de blocs legacy vers des fichiers `system/<label>.md` est un outil **distinct** (skill `migrating-v1-postgres-agents`), réservé à l'ancien serveur Python et à son backend local.

➡️ **Le SDK ne peut donc pas lire la mémoire des agents historiques.** Tant que le transport v1 reste actif, il lit des blocs ; dès qu'il bascule sur le SDK, il lit un dépôt Git. Migrer le transport avant d'avoir **matérialisé la connaissance** côté Git produirait des agents SDK **sans instructions**, c'est-à-dire des générations silencieusement dégradées.

➡️ Conséquence de séquencement, cohérente avec la §10.2 : dans la vague **V2**, PR-01 (matérialisation de la connaissance) **bloque** PR-09.

**e) Le SDK évolue vite — épingler et revalider.**
L'exemple officiel du guide épingle `@letta-ai/letta-agent-sdk@0.2.6`, alors que le registre npm publiait `0.8.11` le 16/09/2026 (et `0.8.3` le 01/09, seule version satisfaisant notre délai de maturité). Les API du SDK ont donc bougé entre les deux. La revalidation de la version retenue prévue dans PR-03 reste **obligatoire** : les extraits du guide sont indicatifs, pas normatifs pour notre version.

**f) Précautions opérationnelles de l'outil de sauvegarde.**
D'après sa documentation, un export **n'est pas une transaction** :

- il faut **mettre l'agent en pause** (arrêter les tours, les éditions de mémoire et les activités planifiées) — le script détecte les changements entre ses lectures mais **ne peut pas prendre un instantané atomique** ;
- le dossier de sortie doit être **privé et hors dépôt** : les messages et la mémoire peuvent contenir des secrets écrits par des personnes ou des agents ;
- l'export ne lit que **le chat principal** (`agent.message_ids`), pas toutes les conversations ;
- un échec de restauration **peut laisser un agent partiel derrière lui**, jamais supprimé automatiquement.

**g) Compétence à acquérir.**
La skill officielle est structurée `SKILL.md` + `references/` + `scripts/`, donc directement installable et auditables. Elle doit être intégrée à la vague **V1** plutôt que réécrite.

**h) La conversion des ressources legacy vers du markdown n'est pas couverte par les outils officiels.**

C'est la **limite la plus importante** du guide pour notre cas. Le guide fournit deux voies de migration, et aucune ne traite notre situation :

| Voie officielle | Source | Sortie | Nous concerne ? |
|---|---|---|---|
| `backing-up-cloud-agents` | Agent Cloud récent (mémoire **Git**) | Agent neuf + mémoire Git intacte | Partiellement : nos agents v1 ont une mémoire en **blocs**, pas en Git |
| `migrating-v1-postgres-agents` | Base **PostgreSQL** du serveur Python retiré | Backend local + fichiers `system/<label>.md` | Non : nous n'avons pas accès à cette base |

La skill `migrating-v1-postgres-agents` **contient bien la logique de conversion qui nous manque** — blocs → `system/<label>.md` avec frontmatter `description` — mais elle **lit directement les tables PostgreSQL** du serveur historique. Elle n'accepte ni fichier intermédiaire ni export JSON en entrée.

**Elle confirme cependant le standard de sortie à viser**, ce qui est précieux : un bloc legacy devient un fichier markdown

```markdown
---
description: "<description du bloc>"
---

<valeur du bloc>
```

placé sous `system/` (les labels déjà préfixés par `system/` sont conservés), et l'ensemble forme un **dépôt Git avec un commit d'import**. C'est exactement le format auquel un agent SDK s'attend pour lire ses instructions.

#### Trois voies d'obtention possibles

| Voie | Principe | Avantages | Risques |
|---|---|---|---|
| **A — Depuis les documents originaux** | Reconstituer consignes et références à partir des sources éditoriales, hors Letta | Source de vérité indépendante de la plateforme ; pas de dépendance à une API en fin de vie ; relecture éditoriale naturelle ; aucun code de conversion à maintenir | **Nécessite de vérifier l'écart** entre le document d'origine et ce qui a réellement été injecté dans les agents. Un écart silencieux produirait des agents « conformes au document » mais différents de la production |
| **B — Depuis une sauvegarde d'agent** | Exporter l'état de l'agent, puis convertir blocs → markdown | **Fidèle à ce qui tourne réellement** ; outillage d'export déjà fourni ; traçable | La conversion blocs → markdown **n'est pas fournie** : petit script à écrire (~50 lignes, le format cible est documenté ci-dessus). **À vérifier avant de s'y fier** : la structure exacte des blocs renvoyée par l'API d'export, et l'accessibilité de la mémoire d'un agent v1 en Git |
| **C — Copier-coller depuis l'ADE** | Lecture manuelle dans l'interface Letta, recopie dans des fichiers | Fonctionne toujours, indépendamment de toute API | Erreur de transcription non détectable ; aucun diff possible ; non répétable ; **perd la traçabilité** |

> **Recommandation : A comme cible, B comme filet immédiat.**
> La voie A est la plus propre à terme, mais elle demande une **vérification d'écart** qui prend du temps — temps que l'imminence de la fermeture ne garantit pas. La voie B est rapide et fidèle. Les combiner donne le meilleur des deux : **B pour sauver maintenant**, **A pour reconstruire proprement ensuite**, avec une comparaison entre les deux comme contrôle qualité.
> La voie C ne doit servir que de **dernier recours**, si A et B échouent toutes les deux.

#### Action immédiate recommandée

Avant de choisir définitivement, une **sonde à faible coût** sur un seul agent non critique :

1. exporter l'agent avec l'outil officiel ;
2. inspecter `agent.json` : les blocs de mémoire sont-ils présents et lisibles ?
3. vérifier si la mémoire de l'agent est accessible en Git sur `/v1/git/{agent-id}/state.git` ;
4. si les blocs sont exploitables, écrire la conversion minimale et **comparer le résultat** au contenu attendu côté éditorial.

Le résultat de cette sonde détermine la voie pour l'ensemble des agents, et **conditionne PR-01** (§10.4). Elle doit être traitée avant tout travail sur le transport (§3.4-d).

> ️ **Point d'attention sur l'ordre.** Cette conversion alimente `PR-01`, qui **bloque `PR-09`**. Autrement dit : sans conversion des ressources, l'adaptateur SDK ne peut pas produire d'agents correctement instruits. La conversion n'est donc pas une tâche documentaire annexe, c'est un **prérequis technique**.

---

## 4. Ce que change réellement Letta Agent SDK

> Lecture de la documentation officielle au 17 septembre 2026 : <https://docs.letta.com/agent-sdk>.

### 4.1 Le runtime est un choix d'architecture, pas un acquis

Le SDK est une **interface** vers un runtime agent. Le backend détermine où vivent l'état et l'exécution :

| Objectif | Configuration SDK | Environnement d'exécution | État de l'agent |
|---|---|---|---|
| Agent et exécution entièrement gérés | `backend: "cloud"` | Sandbox gérée | Letta Cloud |
| Agent hébergé, exécution sur une machine que vous contrôlez | `backend: "cloud"` + `computer` | Machine sélectionnée | Letta Cloud |
| État et exécution entièrement locaux | `backend: "local"` | Machine courante | Machine courante |
| Runtime que vous opérez | `backend: "remote"` | Machine App Server | Selon le backend App Server |

**Conséquence à évaluer explicitement (arbitrage A/D) :** avec `backend: "cloud"`, l'exécution des outils se fait dans un environnement géré. Les **outils clients et les serveurs MCP s'exécutent, eux, dans le processus Node du SDK** — un serveur MCP stdio voit donc le système de fichiers de l'hôte, pas le sandbox géré.

### 4.2 Agent, conversation et session sont trois identités distinctes

- **Agent** : identité et mémoire durables.
- **Conversation** : fil de travail persistant (`conv-xxx`).
- **Session** : connexion active permettant `send()` puis `stream()`.

`createAgent()` crée aussi la conversation par défaut. `createSession(agentId)` ouvre une **nouvelle** conversation ; `resumeSession(id)` accepte un `agent-xxx` (conversation par défaut) ou un `conv-xxx`.

> **Piège :** reprendre systématiquement l'ID d'agent revient à utiliser la conversation **par défaut** — ce n'est pas le bon mécanisme pour isoler les fiches. Le code actuel persiste déjà des IDs de conversation (`workflows.conversation_id`) : c'est la bonne approche, à généraliser.

### 4.3 Une coupure réseau ne signifie pas que la génération n'a pas eu lieu

Garanties et non-garanties documentées :

- Les événements manqués pendant une déconnexion **ne sont pas rejoués**. La reprise passe par `listMessages()` ou `bootstrapState()`.
- Une session dont la connexion s'est fermée **ne peut pas être réutilisée** : il faut `resumeSession(conversationId)`.
- **« Si une connexion échoue après que `send()` a réussi, ne pas réessayer aveuglément »** — le message peut déjà avoir atteint le runtime.
- Le seul retry automatique recommandé est l'expiration de sandbox **avant** envoi (`CloudManagedSandboxExpiredError`), avec un nouveau `resumeSession` puis un unique essai supplémentaire.

**Conséquence :** le Playground doit gérer explicitement un état « **résultat incertain** ». Le SDK ne garantit pas une exécution métier exactement une fois.

### 4.4 Le résultat terminal ne doit pas être concaténé une seconde fois

Le flux émet des fragments `assistant` (et `reasoning`), puis un événement terminal `result` contenant le texte final complet, `success`, `stopReason`, `durationMs` et `runIds`.

Contrat recommandé :

- fragments → **affichage progressif** ;
- `result` réussi → **contenu candidat** à l'activation ;
- validation métier obligatoire avant activation ;
- **jamais** de concaténation du texte terminal aux fragments déjà assemblés ;
- aucun succès métier déduit de la seule fermeture du flux.

> Le module de parsing existant (`packages/agents/src/parser.ts`) sait réparer un frontmatter dont le `---` de fermeture manque. C'est un acquis à préserver, mais il persiste `parsed.data` et non la sortie assainie du schéma : à corriger (PR-12).

### 4.5 Permissions : un levier de sécurité utilisable côté serveur

- `permissionMode` : `standard` | `acceptEdits` | `unrestricted` | `strict`.
- `allowedTools` : filtre de **disponibilité** — si fourni, il doit lister **tous** les outils voulus (clients, MCP, intégrés).
- `canUseTool` : décision par appel d'outil (autoriser / refuser / modifier l'entrée).

> **Attention opérationnelle :** un agent serveur ne doit pas rester bloqué sur une approbation interactive. En traitement non interactif, utiliser un mode et une liste d'outils explicites, avec une politique par défaut restrictive.

### 4.6 Idempotence des messages

`send()` accepte un `otid` fourni par l'appelant, qui se retrouve sur le message persisté : c'est le mécanisme prévu pour corréler un envoi applicatif avec le message du runtime.

### 4.7 Mémoire : versionnée ≠ comportement reproductible

- La mémoire d'un agent vit dans un dépôt git appartenant à l'agent ; MemFS le projette sur la machine de travail.
- Les fichiers sous `system/` sont **dans le prompt système à chaque tour**.
- Les conversations d'un même agent **partagent** sa mémoire.

**Conséquence (arbitrage A) :** modifier l'agent utilisé par v1 pendant la qualification peut dégrader le secours **sans aucun changement de code**. Une release de connaissance doit être identifiée, contrôlée et restaurable, et les agents d'évaluation isolés de la production.

### 4.8 Deux corrections importantes par rapport aux plans antérieurs

**a) Dépendance transitive au client historique**
Le paquet `@letta-ai/letta-agent-sdk` publié **dépend lui-même de `@letta-ai/letta-client`**. Le critère de fin ne peut donc pas être « zéro occurrence dans le lockfile ».

✅ Bon critère : *aucun import ni appel applicatif direct à l'ancienne surface ; les dépendances internes du SDK sont suivies comme dépendances transitives.*

**b) Version et délai de publication**
Au moment de l'analyse (17/09/2026), sur le registre npm :

- dernière version publiée : `0.8.11` (16 septembre — **trop récente** pour la politique interne de maturité de 7 jours) ;
- version la plus récente satisfaisant déjà le délai : **`0.8.3`** (1er septembre).

À revérifier au démarrage effectif de la phase 0. **Les fonctionnalités décrites dans la documentation courante doivent être testées contre la version réellement retenue** — pas seulement lues. Aucune exception automatique à la politique de maturité.

---

## 5. Architecture cible recommandée

```text
Interface Playground (éditeur, actions serveur, routes API)
                          │
                          ▼
                 Vercel Workflow (durabilité)
                          │
              Opération métier persistée
              ├─ identifiant de demande (stable)
              ├─ source + version
              ├─ révision cible attendue
              ├─ runtime retenu (v1 | agent-sdk)
              ├─ agent + conversation
              ─ release de connaissance
                          │
                          ▼
             Frontière applicative (packages/agents)
                  ├─ adaptateur v1 (historique)
                  └─ adaptateur Agent SDK
                          │
                          ▼
             Résultat candidat + validation déterministe
                          │
                          ▼
             Commit métier transactionnel  ──▶  Supabase / progression UI
```

### 5.1 Données proposées

> Les noms ci-dessous sont des **propositions de nouvelles structures**, pas des éléments existants. Réutiliser les rapports et journaux actuels lorsque c'est possible, plutôt que créer un système parallèle complet.

- **`ai_operations`** — demande, tentatives, runtime, état, références source/cible, résultat, informations de reprise et de restauration.
- **`letta_conversations`** — correspondance entre usage métier, runtime, agent et conversation.

Champs minimaux suggérés pour `ai_operations` : `purpose_key`, `runtime`, `agent_id`, `conversation_id`, `source_id`, `source_version`, `target_revision_expected`, `intent_id`, `attempt`, `state`, `knowledge_release`, `sdk_version`, `uncertain_since`, `superseded_by`.

### 5.2 Invariants obligatoires

1. **Une demande intentionnelle possède un ID stable** ; ses retries le réutilisent. Une **régénération volontaire** du même contenu crée une nouvelle demande — une clé limitée à « source + version » l'interdirait.
2. **Le runtime est persisté.** Un changement de configuration ne fait pas basculer silencieusement une tentative en cours.
3. **L'agent et la release de connaissance sont persistés.** Un retry ne doit pas résoudre un nouvel ID d'agent après modification de configuration.
4. **Une tentative périmée ne peut plus écrire** — contenu, statut, affectation, handler d'erreur, envoi externe.
5. **Une modification humaine concurrente est protégée.** Comparaison de la révision attendue avant commit ou restauration ; en cas de divergence, **conflit explicite**, jamais d'écrasement.
6. **Les migrations SQL restent additives** pendant la coexistence.
7. **Les évaluations n'écrivent pas de rapport activable en production.**
8. **Les identifiants sont distingués.** ID d'opération métier, ID Vercel Workflow, ID de conversation, éventuels IDs de runs Letta : ce ne sont pas des synonymes. Les IDs Letta servent au diagnostic, pas à l'identité métier.

---

## 6. Découpage en phases et PR

> Les références **PR-01 … PR-21** sont des **repères de planification**. Ce ne sont ni des numéros GitHub ni des tickets TEC existants. Chaque ligne devient une issue Tech.
> Les bascules et périodes d'observation deviennent des issues d'exploitation séparées : elles ne nécessitent pas artificiellement une PR.

### Phase 0 — Établir les faits et prouver la faisabilité

#### PR-01 — `docs(agent-migration): actualiser le périmètre et les faits de migration`

**Contenu**
- Réconcilier code, configuration déployée, agents du dashboard, langues et modèles.
- Documenter la fenêtre de support de l'API historique et le mode dégradé.
- Identifier les sources éditoriales faisant autorité.
- Séparer explicitement : décisions validées / hypothèses / questions de faisabilité.
- **Intégrer l'outil officiel de sauvegarde d'agents Cloud** (skill `backing-up-cloud-agents` du guide Letta v1→v2, §3.4-b) plutôt que d'écrire un exporteur maison.
- **Sonder les routes historiques** encore utilisées par le code (détection en continu, §10.5).

**Critères d'acceptation**
- [ ] **Statut d'obsolescence écrite dans le document lui-même** : en-tête de dépréciation, remplacement indiqué, procédure de récupération de l'inventaire vers le nouveau foyer. Ne pas laisser un plan obsolète comme source d'autorité par défaut.
- [ ] **Balisage des ressources gelées** : marquer sur chaque ressource Letta Cloud (blocs mémoire, agents) sa date de dernière synchronisation avec le dépôt et sa nature figée, ainsi que **la procédure de récupération en cas de fermeture de l'API**. C'est le livrable immédiat le plus utile.
- [ ] **Export de sauvegarde réalisé pour chaque agent de production** via l'outil officiel, agents en pause, dossiers privés hors dépôt (§10.4).
- [ ] **Sonde de conversion exécutée sur un agent non critique** (§3.4-h) : les blocs de mémoire sont-ils lisibles dans l'export, et la mémoire de l'agent est-elle accessible en Git ?
- [ ] **Voie de conversion arbitrée** (A documents originaux / B sauvegarde / C copier-coller) et **justifiée par écrit**. La logique officielle de conversion blocs → `system/<label>.md` est documentée, mais elle lit PostgreSQL : si elle n'est pas réutilisable, notre propre conversion doit être écrite.
- [ ] **Ressources des agents v1 converties en markdown** au format `system/<label>.md` avec frontmatter `description`, dans un dépôt Git versionné.
- [ ] **Écart documenté** entre les ressources converties et les documents d'origine, autrement dit : l'écart entre ce qui a réellement tourné en production et la source éditoriale de référence.
- [ ] **Relecture éditoriale** des ressources converties effectuée par un référent.
- [ ] **Restauration prouvée** dans un agent neuf, avec les exclusions connues (messages, secrets, outils, connexions, dépôts partagés, schedules, mémoire archival) listées pour PR-20.
- [ ] **Route `folders` confirmée morte** et absence d'usage dans le code (déjà vérifié le 18/09 : aucun usage).
- [ ] **Sonde des routes historiques** en place, avec alerte avant impact production.
- [ ] Matrice complète des parcours : actifs, dormants, à retirer.
- [ ] IDs d'agents, langues et modèles réconciliés avec la configuration réellement déployée.
- [ ] Sources de connaissance identifiées et statut de chacune explicité.
- [ ] Aucun changement d'agent de production.

**Dépendances :** aucune. **Bloque PR-09** (§3.4-d).

#### PR-02 — `test(agents): établir les références de non-régression`

**Contenu**
- Corpus représentatif et anonymisé : audit, métadonnées, rédaction, traductions.
- Cas limites : frontmatter invalide, `---` manquant, directives imbriquées, doublons, contenus longs, RTL / langues complexes.
- Fixtures de transport et assertions sur les contrats métier actuels.

**Critères d'acceptation**
- [ ] Baseline enregistrée **avant** tout changement de comportement.
- [ ] Comparaison sur données structurées, décisions métier et qualité éditoriale — pas sur une égalité textuelle brute.
- [ ] Toute langue réellement activée est couverte.
- [ ] Les défauts connus sont listés et distingués des comportements à préserver.

**Dépendances :** PR-01.

#### PR-03 — `test(agents): valider le SDK dans le runtime Vercel`

**Contenu**
- Version SDK épinglée et compatible avec la politique de maturité.
- Essai isolé, avec agents d'évaluation dédiés.
- Build Next.js et exécution d'une **étape Vercel Workflow réelle**.
- Mesure du démarrage sandbox, durée des tours, limites d'exécution.
- Tests de coupure après envoi, reprise, annulation, permissions, remontée d'usage.

**Critères d'acceptation**
- [ ] Preuve de compatibilité de la version choisie (pas seulement lecture des types).
- [ ] Vérification qu'un contenu de **skill** est réellement accessible dans le sandbox — c'est-à-dire que le mécanisme de chargement fonctionne, indépendamment de notre contenu, qui arrive en PR-11.
- [ ] Aucun appel payant ni effet métier déclenché depuis les routes de production.
- [ ] Décision écrite **go / no-go**.

**Dépendances :** PR-01 ; PR-02 pour des essais représentatifs.

**🚦 Porte de sortie :** si Vercel ne convient pas, revenir à une décision d'architecture. **Ne pas introduire implicitement un worker GCP** : c'est un projet distinct.

---

### Phase 1 — Construire les protections communes et le retour arrière

#### PR-04 — `refactor(agents): isoler les appels v1 derrière un contrat applicatif`

**Contenu**
- Centraliser appels, événements, erreurs et résultats dans `packages/agents`.
- Retirer la dépendance des workflows aux classes d'erreur propres au client historique.
- Ne conserver que l'implémentation v1 active.

**Critères d'acceptation**
- [ ] Comportement métier inchangé ; baseline PR-02 conservée.
- [ ] Aucun objet client/session transporté dans les arguments persistés d'un workflow.
- [ ] Les types d'API-first permettent un bundling compatible Vercel.
- [ ] **Interface de fourniture de connaissance définie** : chaque parcours déclare quel contenu d'instruction il attend (nom de skill, fichier de mémoire, ou identifiant de dépôt), sans présumer du SDK. L'implémentation de l'adaptateur est fournie en PR-11.

**Dépendances :** PR-02. Peut avancer en parallèle du spike.

#### PR-05 — `feat(agents): ajouter le routage contrôlé et l'arrêt des générations`

**Contenu**
- Sélection serveur par parcours ; granularité **par langue** pour les traductions.
- Contrôles proposés : `v1`, `agent-sdk`, `paused`.
- Configuration dynamique authentifiée, auditée, à priorité déterministe.
- Le mode `paused` bloque les nouvelles générations mais conserve les fonctions éditoriales sûres.

**Critères d'acceptation**
- [ ] v1 reste le défaut.
- [ ] Le SDK ne peut pas être activé avant que son adaptateur existe.
- [ ] Un changement de routage est vérifiable **sans supposer** qu'une modification d'environnement Vercel est instantanée.
- [ ] Si la configuration est illisible, aucune activation SDK implicite (comportement conservateur).
- [ ] Arrêt d'urgence testé.

**Dépendances :** PR-04.

#### PR-06 — `feat(workflows): persister les opérations et les conversations`

**Contenu**
- Migrations additives pour les opérations et les correspondances de conversations.
- Unicité et lookup sur `(purpose_key, runtime, agent_id)`.
- Conservation des références éditoriales existantes.
- Acquisition atomique d'une opération, contrôle de concurrence, protection contre les tentatives périmées (lease / fencing).

**Critères d'acceptation**
- [ ] Deux requêtes identiques ne créent pas deux opérations actives.
- [ ] Une régénération volontaire reste possible sur la même source.
- [ ] Les retries conservent runtime, agent et identité de demande.
- [ ] Les workflows antérieurs, sans nouveaux champs, restent interprétables comme v1.
- [ ] RLS, droits et migrations testés ; `supabase db reset` vérifié.

**Dépendances :** PR-04, PR-05, conclusions de PR-03.

#### PR-07 — `fix(workflows): sécuriser les écritures et préserver les versions précédentes`

**Contenu**
- Séparer **résultat généré** et **activation métier**.
- Sauvegarder les valeurs remplacées : traductions, surcharges de métadonnées, liens, statuts.
- Commit atomique avec vérification de la version source **et** de la révision cible.
- Rendre les sélections automatiques de rapports compatibles avec la quarantaine et la restauration.

**Critères d'acceptation**
- [ ] Un rapport écarté n'est pas réactivé par une sauvegarde ultérieure.
- [ ] Une modification humaine concurrente n'est jamais écrasée.
- [ ] Une panne entre génération et persistance ne provoque pas automatiquement une nouvelle génération.
- [ ] Une tentative obsolète ne peut modifier ni contenu ni statut.
- [ ] Restauration sélective démontrée sur une traduction et sur des surcharges de métadonnées.

**Dépendances :** PR-06.

#### PR-08 — `fix(workflows): fiabiliser annulation et reprise des opérations`

**Contenu**
- Séparer explicitement : annulation applicative, annulation Vercel, annulation du transport.
- États opérables : **envoi incertain**, annulation demandée, réconciliation nécessaire.
- Traiter les sentinelles `generating` / `pending` abandonnées.
- Réconciliation liée à l'opération, plutôt qu'à une fenêtre temporelle.

**Critères d'acceptation**
- [ ] Une réponse tardive après annulation ne devient pas active.
- [ ] L'absence de confirmation d'arrêt distant ne vaut pas preuve d'arrêt.
- [ ] Aucune relance aveugle après un envoi incertain.
- [ ] Les générations bloquées sont visibles et récupérables par l'exploitation.
- [ ] Le fencing protège les données **même si** la génération distante continue.

**Dépendances :** PR-06, PR-07.

---

### Phase 2 — Ajouter le SDK et la connaissance nécessaire

#### PR-09 — `feat(agents): implémenter l'adaptateur Letta Agent SDK`

**Contenu**
- `LettaAgentClient` (backend à trancher en PR-03).
- Création / reprise des conversations selon les correspondances persistées.
- `send()` + consommation **complète** de `stream()`, résultat terminal, nettoyage des sessions.
- Erreurs typées, politique de retry bornée, reprise documentée.
- Liste d'outils explicite et politique de permission.
- `otid` pour la corrélation des envois.
- **Fourniture effective de la connaissance** déclarée par l'interface de PR-04, à partir du contenu produit en PR-11.

**Critères d'acceptation**
- [ ] SDK désactivé par défaut.
- [ ] Aucun doublon fragments + résultat terminal.
- [ ] Un terminal en échec ne produit jamais de résultat métier réussi.
- [ ] Sessions fermées sur succès, erreur et annulation (`await using`).
- [ ] Aucun outil d'écriture métier ni secret de base exposé au modèle.
- [ ] Aucune approbation interactive susceptible de bloquer indéfiniment un traitement serveur.
- [ ] `resumeSession` après fermeture inattendue couvert par un test.
- [ ] **Une session SDK réelle voit les instructions du parcours** — vérifié par un test, pas par lecture de configuration. Sans cette assertion, un adaptateur peut être « vert » tout en produisant des agents non instruits.

**Dépendances :** PR-03 à PR-08, **PR-01 (bloquant) et PR-11 (bloquant)**. La connaissance doit être matérialisée côté Git avant qu'un adaptateur SDK ne lise une mémoire : l'API historique et le SDK écrivent dans deux magasins différents (§3.4-d). Sans PR-01 ni PR-11, l'agent SDK démarre **sans instructions** et produit des sorties dégradées de façon silencieuse.

#### PR-10 — `feat(agents): tracer les exécutions et leur consommation`

**Contenu**
- Corrélation opération ↔ workflow Vercel ↔ conversation ↔ runs Letta.
- Métriques par runtime / parcours / langue : succès, latence, retries, temps sandbox, résultats incertains.
- Traçabilité : version SDK, modèle observé, release de connaissance.

**Critères d'acceptation**
- [ ] Aucun raisonnement interne, secret ou document complet dans les logs ordinaires.
- [ ] Usage inconnu représenté par `null`, **jamais** par zéro.
- [ ] `token_cost` reste identifié comme **comptage de tokens**, pas comme montant monétaire.
- [ ] Aucun besoin métier ne dépend d'un retour aux anciennes API pour obtenir une métrique facultative.

**Dépendances :** PR-06, PR-09.

#### PR-11 — `feat(agents): versionner et distribuer la connaissance éditoriale`

**Contenu**
- Récupération contrôlée des consignes et ressources faisant autorité, selon la voie arbitrée en PR-01 (documents originaux / sauvegarde d'agent / copier-coller — §3.4-h).
- Skills audit, rédaction, métadonnées, traduction, avec leurs références.
- Distribution via mémoire agent et/ou dépôts de mémoire partagée.
- Manifeste de release et procédure de restauration.
- Isolation de la connaissance v1 et des évaluations.

**Critères d'acceptation**
- [ ] Un corpus vide ou incomplet fait **échouer** la validation (le validateur actuel ne détecte pas un corpus vide).
- [ ] Les brouillons historiques ne sont pas présentés comme des exports de production.
- [ ] Chaque skill est effectivement accessible dans une session SDK réelle.
- [ ] **Le contenu fourni répond à l'interface déclarée en PR-04** : chaque parcours reçoit bien la connaissance qu'il attend.
- [ ] **Format `system/<label>.md` respecté** pour les ressources issues de blocs legacy, avec frontmatter `description` (§3.4-h).
- [ ] Connaissance normative en lecture seule pour les agents lorsque c'est possible.
- [ ] Aucune modification de l'agent de secours sans procédure réversible vérifiée.
- [ ] Dérive du dashboard contrôlée pendant la bascule (gel ou détection explicite).

**Dépendances :** PR-01 (**bloquant** : la conversion des ressources en est le livrable), PR-03, PR-04 (l'interface de fourniture doit exister avant le contenu). Peut avancer en parallèle de la phase 1.

#### PR-12 — `feat(agents): rendre la validation des métadonnées déterministe`

**Contenu**
- Transformer le protocole de validation agent en skill.
- **Conserver une validation applicative obligatoire**, indépendante du bon vouloir de l'agent.
- Sérialiser les données **assainies** par le schéma.
- Préparer le retrait du script Python d'enregistrement (après la fenêtre de secours).

**Critères d'acceptation**
- [ ] L'oubli du skill par l'agent ne permet pas d'activer des métadonnées invalides.
- [ ] Les transformations du schéma sont présentes dans le résultat persisté.
- [ ] Une sortie invalide laisse les surcharges humaines et les liens précédents intacts.
- [ ] Le chemin v1 reste disponible pendant la fenêtre de secours.

**Dépendances :** PR-07, PR-09, PR-11.

---

### Phase 3 — Migrer les parcours, sans les activer globalement

#### PR-13 — `feat(agents): migrer l'audit éditorial vers le SDK`

**Contenu**
- Audit forcé, chemins single-record et batch identifiés.
- Contrat conformité + détection de doublons conservé.
- Accès limité aux candidats doublons nécessaires.

**Critères d'acceptation**
- [ ] `compliant=true` **et** `duplicate=false` restent nécessaires au statut conforme.
- [ ] Parité sur le corpus de référence.
- [ ] Aucune dépendance à une table Supabase `dispositifs` supposée exister.
- [ ] Le service de recherche actuel est conservé, ou remplacé uniquement si son incompatibilité est démontrée.
- [ ] Fan-out automatique toujours désactivé.

**Dépendances :** PR-09 à PR-11 + protections de la phase 1.

#### PR-14 — `feat(agents): migrer la génération de métadonnées vers le SDK`

**Contenu**
- Métadonnées forcées et autres chemins conservés.
- Publication via le commit transactionnel.
- Respect de la distinction source active / source en attente.

**Critères d'acceptation**
- [ ] Une génération ne se rattache jamais à la mauvaise version d'ingestion.
- [ ] Un échec laisse le rapport précédent utilisable.
- [ ] Toute suppression prévue de surcharges humaines est **historisée et restaurable**.
- [ ] Comparaison v1 / SDK validée.

**Dépendances :** PR-12.

#### PR-15 — `feat(agents): migrer la réécriture éditoriale vers le SDK`

**Contenu**
- Conserver le parcours POST → workflow → consultation du résultat.
- Remplacer le transport et raccorder annulation / réconciliation.
- Préserver la reprise de l'interface après rechargement.

**Critères d'acceptation**
- [ ] Deux demandes concurrentes ne s'annulent pas mutuellement sans règle explicite.
- [ ] La consultation d'un résultat est autorisée via **son opération exacte**.
- [ ] Aucun rattachement à un rapport voisin par approximation temporelle.
- [ ] L'éditeur conserve la décision d'appliquer la proposition.

**Dépendances :** PR-09, PR-10, PR-11 + phase 1.

#### PR-16 — `feat(agents): migrer les traductions sans modifier leur topologie`

**Contenu**
- Conserver les agents / langues réellement configurés.
- Basculer **indépendamment chaque langue**.
- Protéger texte, statut et affectation contre les résultats périmés.
- Garder les règles de régénération récemment corrigées sur `main`.

**Critères d'acceptation**
- [ ] Matrice complète des langues activées + comportement explicite des langues non configurées.
- [ ] Liens, directives et structure Markdown préservés.
- [ ] Validation éditoriale par langue.
- [ ] Contenu précédent restaurable sans écraser une correction humaine ultérieure.
- [ ] Une ancienne tentative ne peut changer le statut, réaffecter un traducteur, ni déclencher un nouvel envoi Airtable.
- [ ] Effets externes incertains réconciliables — sans promettre un « exactly once » non démontré.

**Dépendances :** PR-09 à PR-11, PR-07, PR-08.

#### PR-17 — `fix(api): sécuriser et adapter le flux SSE des métadonnées`

**Contenu**
- Vérifier les consommateurs réels de la route.
- Si conservée : authentification, autorisation de la fiche, transport commun, accumulation correcte, persistance fiable.
- Si inutilisée : retrait contrôlé plutôt que migration inutile.

**Critères d'acceptation**
- [ ] Un utilisateur non autorisé ne peut ni lancer ni lire une génération.
- [ ] Affichage progressif conservé si la route reste exposée.
- [ ] Le contenu persisté est **complet**.
- [ ] La fin du transport ne masque pas une erreur de persistance.
- [ ] Déconnexion et résultat tardif couverts par les tests.

**Dépendances :** PR-14. **La correction d'autorisation peut être extraite immédiatement** si la route est exposée en production.

#### PR-18 — `refactor(scripts): adapter les outils d'exploitation au contrat commun`

**Contenu**
- Migrer `force-metadata-reports` vers les mêmes protections.
- Rendre les scripts d'exploitation compatibles avec routage, pause et identité d'opération.
- Inventorier les suppressions différées (agents locaux, Docker/Ollama, anciens scripts, configuration morte).

**Critères d'acceptation**
- [ ] Aucun script ne contourne les contrôles de concurrence ou de retour arrière.
- [ ] Les essais d'exploitation n'effectuent aucune écriture surprise.
- [ ] Les ressources encore nécessaires au secours v1 ne sont pas supprimées prématurément.

**Dépendances :** PR-14 + phase 1.

---

### Phase 4 — Qualification et préparation de la bascule

#### PR-19 — `test(agents): qualifier parité, charge et reprise après panne`

**Contenu**
- Comparaisons v1 / SDK en staging, sur des entrées figées.
- Isolation **SQL et mémoire agent**.
- Tests de charge graduels.
- Injection de pannes : coupure après envoi, crash avant commit, résultat tardif, annulation, édition humaine concurrente.

**Critères d'acceptation**
- [ ] Aucune publication RI ni écriture Airtable réelle depuis le banc de comparaison.
- [ ] Aucun mélange de conversations, de fiches ou de langues.
- [ ] Aucun écrasement de travail humain.
- [ ] Aucun résultat incertain accepté comme succès.
- [ ] Rapport qualité / latence / consommation avec décision **go / no-go**.

**Dépendances :** parcours à activer, PR-10.

#### PR-20 — `feat(ops): finaliser les procédures de bascule et de restauration`

**Contenu**
- Procédures opérables : pause, diagnostic, réconciliation, restauration.
- Artefact applicatif dual-runtime de secours identifié.
- Vérification de compatibilité des **workflows déjà démarrés** avec les nouveaux déploiements.
- Documentation des responsabilités et des accès.

**Critères d'acceptation**
- [ ] Exercice de retour arrière staging exécuté de bout en bout.
- [ ] Restauration d'une traduction **et** de surcharges de métadonnées démontrée.
- [ ] Une sauvegarde éditoriale après restauration ne réactive pas un rapport mis en quarantaine.
- [ ] Une modification humaine concurrente est conservée.
- [ ] Reprise d'un workflow **antérieur au déploiement** vérifiée.
- [ ] Parcours manuel utilisable si v1 et SDK sont indisponibles.

**Dépendances :** PR-19.

---

### Phase 5 — Bascule opérationnelle progressive

> Issues d'**exploitation**, pas nécessairement de nouvelles PR.

**OPS-01 — Pilote interne.** Utilisateurs et fiches identifiés ; un seul runtime par demande ; priorité aux générations explicitement déclenchées ; aucun fan-out automatique.

**OPS-02 — Extension par parcours et par langue.** Ordre proposé : audit forcé → métadonnées forcées → réécriture → traductions (langue par langue). Chaque extension exige un bilan du palier précédent. Le routage reste réversible **indépendamment** pour chaque parcours.

**OPS-03 — Observation et acceptation.** Seuils proposés, **à valider avant le pilote** :

| Indicateur | Condition proposée |
|---|---|
| Intégrité | Zéro écrasement humain, zéro mélange de fiche/langue, zéro activation de résultat périmé |
| Validation | Aucun résultat invalide activé |
| Incidents | Aucun envoi incertain non traité au-delà du délai convenu |
| Fiabilité | Taux d'échec ≤ baseline + 2 points, avec volumes et dénominateurs publiés |
| Retries | Mesurés **par opération** ; limite définie avant le pilote |
| Latence | p95 sous le SLO métier, avec marge par rapport aux limites Vercel |
| Coût | Budget par opération incluant les sandboxes ; absence de donnée explicitée |
| Observation | Deux semaines stables **et** volumes minimaux atteints |

Volumes indicatifs de départ : 30 audits, 30 générations de métadonnées, 20 réécritures, 5 traductions par langue activée.

> Ces volumes sont des critères **opérationnels**, pas une preuve statistique. Si l'activité est insuffisante, **prolonger l'observation** plutôt que déclarer le succès parce que deux semaines se sont écoulées.

---

### Phase 6 — Retrait contrôlé du chemin historique

#### PR-21 — `refactor(agents): retirer les appels applicatifs à l'API historique`

**Contenu**
- Supprimer l'adaptateur v1 et sa dépendance directe lorsqu'elle est inutile.
- Retirer scripts, configuration locale et entrées mortes.
- Mettre à jour documentation, configuration et contrats d'exploitation.

**Critères d'acceptation**
- [ ] Aucun appel applicatif direct à la surface historique.
- [ ] Les dépendances transitives légitimes du SDK ne sont **pas** supprimées artificiellement.
- [ ] Aucun workflow actif ne dépend encore du chemin retiré.
- [ ] Le retour vers une release SDK connue et le mode manuel restent disponibles.
- [ ] Accord explicite de clôture de la fenêtre v1.

**Dépendances :** OPS-03 accepté.

> **À traiter séparément :** la suppression des anciens agents, mémoires et ressources Cloud. Ce nettoyage potentiellement irréversible nécessite inventaire, sauvegarde et autorisation explicite ; il ne doit pas être un effet secondaire de la PR de code.

---

## 7. Procédure de retour arrière en production

### Cas A — Régression limitée à un parcours SDK

1. **Suspendre** les nouvelles opérations du parcours concerné.
2. Lister les opérations en cours et les effets déjà produits.
3. Annuler ou laisser terminer selon l'état de chacune.
4. **Révoquer leur droit d'écriture** si elles sont remplacées ou mises en quarantaine.
5. Sélectionner v1 pour les **nouvelles** opérations.
6. Vérifier une génération témoin et son résultat métier.
7. Réouvrir progressivement.

> **Ne jamais changer le runtime au milieu d'une opération existante.**

### Cas B — Contenu incorrect déjà enregistré

1. Identifier les résultats affectés par opération / release de connaissance.
2. Empêcher leur sélection automatique.
3. Comparer la révision actuelle avec celle attendue.
4. Restaurer contenu, surcharges et liens précédents **uniquement en l'absence d'édition humaine ultérieure**.
5. En cas de conflit : proposer une restauration manuelle, ne jamais écraser.
6. Vérifier qu'une sauvegarde ultérieure ne réactive pas le mauvais rapport.

> Pas de restauration globale de base pour un incident de génération isolé.

### Cas C — Publication ou effet externe déjà effectué

- **Ne pas rejouer automatiquement** une publication.
- Vérifier l'état réel côté RI / Airtable et les reçus locaux.
- Corriger explicitement l'effet externe.
- Conserver la trace de l'opération et de la compensation.

> Une transaction Supabase ne peut pas annuler un webhook déjà accepté.

### Cas D — Le chemin v1 n'est plus disponible

> ️ **Ce cas n'est plus un scénario de bord : c'est le scénario attendu.**
> Luis a confirmé le 17/09/2026 qu'il n'existe pas de date ferme de fermeture de l'API,
> mais que celle-ci est **imminente**. Le secours v1 est donc un **pont dont la durée est
> inconnue et imposée de l'extérieur**, pas une option que le projet contrôle.

- Suspendre la génération IA.
- Préserver lecture, édition et validation **manuelles**.
- Autoriser la publication de contenus validés si elle ne dépend pas du traitement défaillant.
- Conserver les demandes à traiter.
- Restaurer une release SDK / une connaissance précédemment validée si cela résout l'incident.

> Le plan garantit une **continuité éditoriale dégradée** ; il ne peut pas garantir la continuité automatique de l'IA si les deux chemins Letta sont indisponibles.

### Objectifs d'exploitation proposés

| Objectif | Cible provisoire |
|---|---|
| Suspendre les générations et changer leur routage | **≤ 5 minutes** |
| Établir la liste des opérations incertaines et décider | **≤ 30 minutes** |
| Restauration de données | Délai selon périmètre, **sans sacrifice des corrections humaines** |
| Bascule complète vers le SDK | **avant la fermeture annoncée par Letta** — voir §10 |

> Ces objectifs ne deviennent des engagements qu'après l'exercice staging de PR-20.

### Ce que le rollback ne couvre pas

| Effet | Annulé par un rollback applicatif ? |
|---|---|
| Webhook de publication RI déjà accepté | ❌ |
| Envoi Airtable déjà effectué | ❌ |
| Affectation de traducteur déjà écrite | ❌ |
| Traduction déjà écrasée (sans snapshot) | ❌ |
| Surcharges de métadonnées déjà effacées | ❌ |
| Mémoire Letta déjà modifiée | ❌ |
| Rapports déjà créés | ⚠️ partiellement (quarantaine nécessaire) |
| Workflows Vercel en cours | ⚠️ annulation requise, vérification nécessaire |

---

## 8. Organisation du projet Linear

### Jalons

1. **Faisabilité confirmée** — PR-01 à PR-03.
2. **Retour arrière et intégrité disponibles** — PR-04 à PR-08.
3. **SDK et connaissance prêts** — PR-09 à PR-12.
4. **Parcours migrés, désactivés par défaut** — PR-13 à PR-18.
5. **Qualification acceptée** — PR-19 et PR-20.
6. **Bascule et observation** — OPS-01 à OPS-03.
7. **Retrait du chemin historique** — PR-21 + clôture.

### Gabarit d'issue TEC

- **Problème et objectif**
- **Périmètre / hors périmètre**
- **Parcours utilisateur affecté**
- **Changements prévus**
- **Dépendances bloquantes**
- **Critères d'acceptation** (cases à cocher)
- **Tests et preuves attendues**
- **Impact données / sécurité / i18n / RGAA**
- **Procédure de retour arrière**
- **Responsable et validation requise**

### Chemin critique

```text
Inventaire + baseline + faisabilité
                 ↓
Contrat v1 + routage + opérations + écritures sûres
                 ↓
SDK + connaissance + validation
                 ↓
Migration des parcours
                 ↓
Qualification + exercice de rollback
                 ↓
Pilote → extension → observation
                 ↓
Retrait du chemin historique
```

Le corpus, la baseline et le spike peuvent avancer **en parallèle**. Les parcours peuvent être répartis une fois les contrats communs stabilisés.

### Convention de branches et de titres

- Branches : `luis/tec-<n>-<slug>` — le préfixe TEC permet le lien automatique lorsque l'intégration GitHub couvre le bon dépôt.
- Titres de PR : format Conventional Commits, par exemple `feat(agents): implémenter l'adaptateur Letta Agent SDK (TEC-XX)`.
- Chaque PR référence son issue.

---

## 9. Décisions à confirmer

### Bloquantes pour figer le backlog

| # | Décision | Recommandation |
|---|---|---|
| A | **Isolation des agents de secours** — utiliser des agents dédiés au SDK, ou partager les agents v1 ? **Ne peut plus être résolu en créant des agents côté v1** (§3.4-c). | Sauvegarder la mémoire des agents v1 existants ; agents récents pour les essais SDK. |
| B | **Gel fonctionnel** — qmd/retrieval, regroupement des traducteurs, réactivation du fan-out | Différer en projets distincts. |
| C | **Fenêtre de secours v1** — durée et disponibilité | **Contrainte externe, pas un choix du projet** : la fermeture est imminente et sans date ferme. Le chemin v1 doit être préservé à chaque étape, mais **aucune période de confort ne peut être planifiée**. Voir §10. |
| D | **Backend SDK** — `cloud` avec sandbox géré, `cloud` + `computer`, ou `remote` (App Server) | À trancher sur les résultats de PR-03 : latence, coût, sécurité, et localisation de l'exécution des outils. |
| E | **Topologie des traducteurs** — conserver la configuration actuelle ou consolider | Conserver à l'identique pendant la migration ; toute consolidation est un projet distinct. |

### Reportées (à documenter, pas à trancher maintenant)

- Pertinence d'un index documentaire type qmd pour la connaissance éditoriale.
- Évolution du service de recherche de doublons (source actuelle vs cible).
- Réactivation du fan-out d'ingestion DI, sur la base de mesures.
- Nettoyage des ressources Letta Cloud historiques.

---

## 10. Contrainte de calendrier — retrait progressif et imminence de l'API historique

> **Fait** : Luis a indiqué le 17/09/2026 qu'il n'y a **pas de date ferme**, mais que la fermeture de l'API historique est **pour bientôt**.
> **Conséquence** : toute phase conditionnée à « deux semaines de production stables » n'est plus planifiable en l'état. Ce n'est pas une défaillance du plan : c'est une **contrainte externe** à absorber.

### 10.1 Escalade des risques

| Risque | Sans échéance connue | Avec fermeture imminente |
|---|---|---|
| Secours utilisé pendant une indisponibilité de l'API | Acceptable | **Rupture de production** |
| Validation de parité retardée | Coût d'opportunité | Risque de bascule précipitée |
| Purge des ressources Cloud reportée | Dette technique | **Perte définitive possible** |
| Migration partielle et durable (deux runtimes) | Acceptable | Zone de risque permanente |

### 10.2 Ce qui change concrètement

**a) PR-01 devient la priorité immédiate.**
La récupération et le balisage des ressources faisant autorité (blocs mémoire, consignes, personas, inventaire) ne relèvent plus de la documentation : ce sont des **sauvegardes avant fermeture**. Si l'API ferme avant que le contenu réel des agents de production soit extrait et vérifié, ce contenu est **définitivement perdu**.

**b) Le séquencement « quatre phases avant une seule écriture » est trop lent si la fermeture est très proche.**
Répartition recommandée :

| Vague | Contenu | Justification |
|---|---|---|
| **V1 — Sauvegarde et conversion** | PR-01 (inventaire, export officiel, **conversion en markdown**) | Irréversible si manquée : au-delà de la fermeture, la connaissance legacy n'est plus récupérable |
| **V2 — Minimum viable sécurisé** | PR-04, PR-05, PR-11, PR-09 — **PR-01 bloque PR-09**, **PR-04 déclare l'interface**, **PR-11 fournit le contenu** | Secours contrôlé + adaptateur SDK capable de lire la connaissance convertie |
| **V3 — Sécurité des données** | PR-06, PR-07, PR-08 | Peut suivre la bascule du transport **si et seulement si** l'activation reste manuelle, à faible volume, sur des fiches contrôlées |
| **V4 — Qualité et généralisation** | PR-02, PR-03, PR-10 … PR-21 | Peut continuer après la bascule |

**c) « Continuité de l'IA » et « continuité éditoriale » sont deux objectifs distincts.**
Si la fermeture survient plus tôt que prévu :

- ✅ Publication, édition, validation et traduction **manuelles** continuent.
- ❌ Audit, métadonnées, réécriture et traduction **automatiques** s'arrêtent.
- ✅ Rien n'est perdu si les données sont saines et restaurables.

C'est la **seule** garantie tenable. Elle doit être explicitement acceptée par l'équipe éditoriale, pas seulement par l'équipe technique.

**d) Déclencheur d'escalade.**
Dès que Letta annonce une date — **ou** si aucun calendrier n'est fourni sous deux semaines — passer en mode « sortie rapide » : alléger la qualification lourde (PR-19) au profit d'un pilote manuel étroit sur une seule fiche, avec retour arrière immédiat.

### 10.3 Ce qu'il ne faut **pas** faire sous pression

| Tentation | Pourquoi c'est dangereux |
|---|---|
| Basculer les traductions automatiques en même temps que l'audit | Écrase `translation_records.markdown` — irréversible sans snapshot |
| Activer la régénération de métadonnées sans snapshot des surcharges | Efface les corrections humaines — non réversible par rollback |
| Activer le fan-out d'ingestion | Multiplie les générations avant que la sécurité soit en place |
| Supprimer scripts et ressources v1 pour « nettoyer » | Retire le seul chemin de secours restant |
| Migrer l'automatisation complète en une seule PR | Rend impossible l'attribution d'une régression |

### 10.4 Plan de sauvegarde des ressources (à faire **avant** tout autre travail)

1. Inventorier les agents de production : IDs, modèles, dates de dernière synchronisation.
2. **Acquérir l'outil officiel** `backing-up-cloud-agents` (skill du guide Letta v1→v2, §3.4-b) plutôt que d'écrire un exporteur maison.
3. **Mettre chaque agent en pause** avant l'export : arrêter les tours, les éditions de mémoire et les activités planifiées, puis attendre la fin des pushs de mémoire en attente (l'outil n'est pas transactionnel).
4. Exporter vers un dossier **privé, hors dépôt et hors checkout de mémoire partagée** : messages, métadonnées et mémoire peuvent contenir des secrets.
5. Extraire le contenu réel des blocs mémoire / consignes / personas, avec sa provenance exacte.
6. Marquer chaque ressource : contenu du dépôt / dérivé / figé / obsolète.
7. **Restaurer l'export dans un agent neuf** pour prouver que la restauration fonctionne — ne pas se contenter d'un export non testé.
8. Conserver l'agent original et le backup jusqu'à validation de l'agent restauré.
9. **Convertir les ressources en markdown** au format attendu par le SDK : `system/<label>.md` avec frontmatter `description` (§3.4-h). C'est l'étape qui rend la connaissance **lisible par les nouveaux agents** — sans elle, la sauvegarde préserve un contenu inexploitable.
10. **Sonder la faisabilité de la conversion** sur un agent non critique avant de traiter l'ensemble (§3.4-h).
11. Faire relire le contenu extrait par les référents éditoriaux : un export non vérifié reste un export non fiable.

> ️ **Ce que l'outil ne restaure pas** (documenté par le guide) : les messages, les secrets, les outils, les connexions, les dépôts de mémoire partagée, les schedules et la mémoire archival. Ces éléments doivent être reconfigureés manuellement — à intégrer à la procédure de PR-20.

> **Sans cette sauvegarde, la migration peut réussir techniquement et perdre la connaissance métier.** C'est le risque principal du projet dans ce contexte de calendrier.

> ️ **Une sauvegarde n'est pas une migration.** Exporter l'état d'un agent protège le contenu, mais ne le rend pas exploitable par un agent SDK : l'API historique et le SDK lisent **deux magasins de mémoire différents** (blocs vs Git). La conversion vers `system/<label>.md` est donc une étape à part entière, pas un détail de l'export.

### 10.5 Détection en continu des coupures d'API

Puisque le retrait est **incrémental** (une route historiquement documentée est déjà en HTTP 400 depuis le 17/07/2026, §3.4-a) et non un basculement unique :

1. Ajouter une **sonde** qui vérifie périodiquement que les routes historiques encore utilisées par le code répondent.
2. Alerter l'équipe dès qu'une route passe en erreur **avant** que la production ne la rencontre.
3. Reclasser immédiatement la vague correspondante en urgence.
4. Documenter les routes déjà mortes pour éviter de les re-découvrir en incident.

C'est la protection la plus utile contre l'absence de date ferme : on ne peut pas planifier la fermeture, mais on peut **la détecter en avance**.

---

## 11. Annexe — Sources et limites de l'analyse

### Sources officielles consultées (17/09/2026)

- Guide officiel de migration v1 → v2 (dépôt Letta) — <https://github.com/letta-ai/agent-v1-to-v2-migration-guide> (examiné le 18/09/2026, commit `61693d0`)
  - Migration dossiers → dépôts — `filesystem/README.md`, `filesystem/v1_example.ts`, `filesystem/v2_example.ts`
  - Sauvegarde et restauration d'agents Cloud — `.agents/skills/backing-up-cloud-agents/SKILL.md` + `references/format.md`
  - Migration d'agents PostgreSQL → backend local — `.agents/skills/migrating-v1-postgres-agents/SKILL.md` + `references/format.md`

- Vue d'ensemble de l'Agent SDK — <https://docs.letta.com/agent-sdk/index.md>
- Déploiement, sandboxes et récupération après expiration — <https://docs.letta.com/agent-sdk/deployment/index.md>
- Sessions, tours et durabilité — <https://docs.letta.com/agent-sdk/sessions/index.md>
- Envoi de messages, événements, identité des messages — <https://docs.letta.com/agent-sdk/messages/index.md>
- Référence SDK (client, session, options) — <https://docs.letta.com/agent-sdk/reference/index.md>
- Permissions — <https://docs.letta.com/agent-sdk/permissions/index.md>
- MCP et outils clients (exécution et cycle de vie) — <https://docs.letta.com/agent-sdk/mcp/index.md>
- Mémoire, MemFS et dreaming — <https://docs.letta.com/agent-sdk/memory/index.md>
- Dépôts de mémoire partagée — <https://docs.letta.com/agent-sdk/repositories/index.md>

### Vérifications effectuées

- Lecture du code à la révision `112228bf` : `packages/agents`, `packages/workflows`, `apps/frontend/src/app/api`, `packages/shared/src/constants`, `supabase/migrations`.
- Consultation des métadonnées publiées du paquet `@letta-ai/letta-agent-sdk` sur le registre npm (dernière version, dépendances, contrainte Node).
- Lecture de la documentation officielle listée ci-dessus.

### Ce qui n'a pas été fait

- Aucun test, build ou lint exécuté.
- Aucun environnement staging ou production interrogé.
- Aucune base de données (Supabase, MongoDB) requêtée.
- Aucune ressource Letta Cloud inspectée (agents, mémoires, outils, conversations).
- Aucune vérification des limites réelles d'exécution Vercel.
- Aucune confirmation extérieure de la politique de support de l'API historique.

**Conséquence :** les recommandations de séquencement et de sécurité sont solides sur la base du code lu ; les décisions D (backend) et C (fenêtre de secours) dépendent de vérifications externes qui restent à conduire en phase 0.

---

 Generated with [Letta Code](https://letta.com)