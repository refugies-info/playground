# État des lieux du dépôt

> **Sections §3.1 à §3.4 — surface d'intégration, risques de retour arrière déjà présents dans le code, et ce que le guide officiel Letta change dans ce plan.**

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
| Date de fermeture de l'API historique | **Confirmée comme imminente, sans date ferme** (Luis, 17/09/2026) — conditionne la durée du pont v1. Voir [§10](07-v1-removal-and-backup.md). |
| Agents réellement utilisés en production (IDs, langues, modèles) | ✅ **Résolu** — voir [§3.5](03-production-agents-audit.md) |
| Schéma réellement déployé vs migrations | Le comportement des triggers et contraintes doit être constaté |
| Quels parcours IA sont réellement actifs en production | Le fan-out est désactivé dans le code : à confirmer côté exploitation |
| Consommateurs réels de la route SSE | Décide entre correction et retrait |
| Sources faisant autorité pour la connaissance éditoriale | Le corpus du dépôt est incomplet ; les brouillons locaux n'ont pas valeur de référence — **état réel des ressources établi en [§3.5](03-production-agents-audit.md)** |
| Limites d'exécution Vercel pour des tours de 1 à 3 minutes | Détermine la faisabilité (`maxDuration`, régions, cold start) |

---

> **Mise à jour du 18/09/2026 — apports du guide officiel `letta-ai/agent-v1-to-v2-migration-guide`.** Le plan ci-dessous a été revu sur quatre points structurants, détaillés en **[§3.4](#s34)** :
> 1. **Certaines fonctionnalités** de la surface historique **sont déjà coupées en production** (pas seulement gelées) ;
> 2. il existe un **outillage officiel de sauvegarde des agents Cloud** qui fait de la préservation des ressources une opération déléguée, pas un travail artisanal ;
> 3. le chemin de secours v1 **ne peut plus accueillir de nouveaux agents**, ce qui change la [§9-A](01-decision.md#s9) ;
> 4. un ordre de migration obligatoire apparaît entre le transport et la mémoire.

<a id="s34"></a>

### 3.4 Ce que le guide officiel Letta change dans ce plan

Source : <https://github.com/letta-ai/agent-v1-to-v2-migration-guide> (dernier commit `61693d0`, 14/09/2026), examiné le 18/09/2026.

**a) Certaines API historiques sont déjà désactivées, pas seulement gelées.**
Le guide documente explicitement que l'endpoint `folders` retourne **HTTP 400 depuis le 17 juillet 2026** (`This API route is deprecated and no longer supported on the Letta API`).

✅ **Vérifié sur notre code** : aucune utilisation de `folders` / `filesystem` / `files` / `exportFile` dans `packages`, `apps` ou `scripts`. **Impact nul sur Playground.**
➡️ Le retrait letta Cloud est donc **incrémental**, pas un « big bang » : certains chemins tombent avant d'autres. La [§10](07-v1-removal-and-backup.md) devrait viser une **détection en continu** de ces bascules, pas une date unique.

**b) Un outillage officiel de sauvegarde d'agents Cloud existe — et il est testé.**
Le dépôt fournit une skill `backing-up-cloud-agents` avec un script (`cloud-agent.ts`) qui exporte les réglages d'un agent, ses messages de contexte et **l'historique Git complet de sa mémoire** vers un dossier privé, puis sait **recréer un agent neuf** à partir de ce backup.

- Export : `GET /v1/agents/{id}` + `GET /v1/messages/{id}` + accès Git authentifié sur `/v1/git/{agent-id}/state.git`.
- Restauration : `POST /v1/agents` (corps allowlisté, `initial_message_sequence` vide) puis clone/push Git et `POST /v1/agents/{id}/recompile`.
- Garde-fous documentés : refus d'écraser un dossier existant, jamais de `git push --force`, **aucun retry automatique** d'une création potentiellement aboutie, ID imprimé avant toute étape pouvant échouer.
- Couverture et exclusions explicitées (`references/format.md`) : secrets, outils, connexions, dépôts partagés, schedules, mémoire archival et **historique de messages** ne sont **pas** restaurés.

️ **Conséquence pour [§10.4](07-v1-removal-and-backup.md#s104)** : la sauvegarde des ressources n'est plus un travail artisanal à concevoir, c'est une **opération déléguée à l'outil officiel**, à exécuter avant la fermeture. Un workflow CI (`cloud-agent-backup.yml`) et des tests sont fournis, ce qui en fait un artefact maintenable.

**c) Le chemin de secours v1 ne peut plus accueillir de nouveaux agents.**
La restauration **crée un nouvel agent Cloud** — ce qui est précisément le sens de « v1 → v2 ». Si les routes historiques se ferment, **le rollback ne peut pas créer un agent v1 de remplacement**.

➡️ **La [§9-A](01-decision.md#s9) change de nature.** « Partager les agents v1 ou en créer des dédiés » n'est plus un arbitrage d'isolation : **créer un agent côté ancien chemin est un cul-de-sac**. Les essais SDK doivent donc utiliser des agents récents, et la préservation du v1 doit porter sur des **agents existants** dont la mémoire est sauvegardée, pas sur une capacité de recréation.

**d) Ordre obligatoire : transport d'abord, mémoire ensuite.**
Le guide insiste : l'API v1 et le SDK écrivent dans **deux magasins de mémoire différents** (blocs classiques côté v1, Git/MemFS côté SDK). La conversion de blocs legacy vers des fichiers `system/<label>.md` est un outil **distinct** (skill `migrating-v1-postgres-agents`), réservé à l'ancien serveur Python et à son backend local.

➡️ **Le SDK ne peut donc pas lire la mémoire des agents historiques.** Tant que le transport v1 reste actif, il lit des blocs ; dès qu'il bascule sur le SDK, il lit un dépôt Git. Migrer le transport avant d'avoir **matérialisé la connaissance** côté Git produirait des agents SDK **sans instructions**, c'est-à-dire des générations silencieusement dégradées.

➡️ Conséquence de séquencement, cohérente avec la [§10.2](07-v1-removal-and-backup.md#s102) : dans la vague **V2**, PR-01 (matérialisation de la connaissance) **bloque** PR-09.

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

> ✅ **Mise à jour du 18/09/2026** : la voie B est **déjà réalisée** — l'accès Git de [§3.5](03-production-agents-audit.md) a permis d'exporter l'intégralité de la mémoire des agents. Le choix se réduit à *unifier ou conserver* les deux formats existants.

> **Recommandation initiale (conservée pour l'historique) : A comme cible, B comme filet immédiat.**
> La voie A est la plus propre à terme, mais elle demande une **vérification d'écart** qui prend du temps — temps que l'imminence de la fermeture ne garantit pas. La voie B est rapide et fidèle. Les combiner donne le meilleur des deux : **B pour sauver maintenant**, **A pour reconstruire proprement ensuite**, avec une comparaison entre les deux comme contrôle qualité.
> La voie C ne doit servir que de **dernier recours**, si A et B échouent toutes les deux.

#### Action immédiate recommandée

Avant de choisir définitivement, une **sonde à faible coût** sur un seul agent non critique :

1. exporter l'agent avec l'outil officiel ;
2. inspecter `agent.json` : les blocs de mémoire sont-ils présents et lisibles ?
3. vérifier si la mémoire de l'agent est accessible en Git sur `/v1/git/{agent-id}/state.git` ;
4. si les blocs sont exploitables, écrire la conversion minimale et **comparer le résultat** au contenu attendu côté éditorial.

Le résultat de cette sonde détermine la voie pour l'ensemble des agents, et **conditionne PR-01** ([§10.4](07-v1-removal-and-backup.md#s104)). Elle doit être traitée avant tout travail sur le transport ([§3.4-d](#s34)).

> ️ **Point d'attention sur l'ordre.** Cette conversion alimente `PR-01`, qui **bloque `PR-09`**. Autrement dit : sans conversion des ressources, l'adaptateur SDK ne peut pas produire d'agents correctement instruits. La conversion n'est donc pas une tâche documentaire annexe, c'est un **prérequis technique**.
