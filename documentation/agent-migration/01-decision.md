# Décision et périmètre

> **Sections §1, §2, §5 et §9 — de la synthèse exécutive aux décisions à trancher.**

---

<a id="s1"></a>

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
| A | **Isolation du chemin de secours.** Les conversations d'un même agent partagent sa mémoire : modifier l'agent utilisé par v1 pendant les essais SDK peut dégrader le secours. **Contrainte ajoutée ([§3.4-c](02-current-state.md#s34))** : le chemin historique ne permet plus de **créer** d'agent de remplacement — l'isolation ne peut donc pas être obtenue en recréant des agents côté v1. | Sauvegarder la mémoire des agents v1 **existants** (outil officiel, [§10.4](07-v1-removal-and-backup.md#s104)) et ne pas la modifier pendant la qualification ; utiliser des **agents récents** pour les essais SDK. |
| B | **Gel fonctionnel.** Les évolutions parallèles (retrieval/qmd, regroupement des traducteurs, réactivation du fan-out DI) augmentent fortement le nombre de causes possibles d'une régression. | Les **différer** en projets distincts, sauf dépendance bloquante démontrée. |
| C | **Fenêtre de secours.** Aucune date ferme publiée, mais **fermeture confirmée comme imminente par Luis (17/09/2026)**. | Préserver le chemin v1 à chaque étape, **sans planifier de période de confort**. Traiter la bascule complète comme **datée par l'extérieur** ; voir [§10](07-v1-removal-and-backup.md). |

---

<a id="s2"></a>

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

<a id="s5"></a>

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
8. **Les générations d'agents sont distinguées.** Une conversation appartient à une génération ; elle est lue, jamais réécrite par une autre ([§5.3](#s53)).
9. **Les identifiants sont distingués.** ID d'opération métier, ID Vercel Workflow, ID de conversation, éventuels IDs de runs Letta : ce ne sont pas des synonymes. Les IDs Letta servent au diagnostic, pas à l'identité métier.

<a id="s53"></a>

### 5.3 Transition entre générations d'agents

Décidé avec Luis le 18/09/2026. Concerne la reprise des conversations appartenant à un agent
historique par un agent de la nouvelle génération.

**Périmètre, volontairement étroit.** Le cas est **rare** : fiches encore en cours de
rédaction ou de publication au moment de la bascule, et campagnes annuelles de mise à jour
ciblées. Ce n'est pas un mécanisme de continuité générale.

#### Ce qui n'est pas retenu

Un **proxy applicatif** — où le nouvel agent relaierait les requêtes vers son homologue v1 —
a été évalué puis écarté. Trois raisons relevant du code du SDK (`0.8.3`), pas d'une
préférence :

1. **Le SDK résout l'agent depuis la conversation**, il ne le reçoit pas :
   `resumeSession("conv-xxx")` fait `agentId = conversation.agent_id`. Le SDK parle donc
   toujours au propriétaire de la conversation, jamais au nouveau agent.
2. **`agentId` est ignoré** dès que l'identifiant est un `conv-xxx` : il n'existe aucun moyen
   supporté de faire traiter une conversation par un autre agent.
3. **Aucun point d'extension** documenté pour intercepter la création de conversation.
   Un proxy exigerait de patcher `CloudEnvironmentSession` — non supporté, cassant à chaque
   montée de version du SDK.

S'y ajoutent le doublement du coût par conversation relayée et le risque d'ambiguïté
d'autorisation : avec quelle identité le relais écrit-il ?

#### Architecture retenue

```text
Conversation historique (appartient à l'agent v1)
        │
        │ 1. lecture directe de l'historique
        ▼
Orchestrateur applicatif (Vercel Workflow)
        │
        ├── 2. mémoire v1 attachée en LECTURE au nouvel agent
        │      repositories.attach(v1Repo, { permissions: "read" })
        │
        ── 3. nouvelle conversation ouverte par le NOUVEL agent
               (jamais un fil partagé entre deux identités)
```

**Trois mécanismes natifs, aucune couche applicative de relais :**

| Besoin | Mécanisme |
|---|---|
| Le nouvel agent connaît son prédécesseur et ce qu'il savait | **Mémoire partagée en lecture** : `client.repositories.attach(agentId, repositoryId, { permissions: "read" })` |
| Il peut demander un complément ponctuel | **Sous-agent** authentifié par le runtime (`parent_agent_id`, `is_subagent`) |
| La conversation appartient à l'ancien agent | Lecture de l'historique, puis **nouvelle conversation** ouverte par le nouvel agent — les deux identités ne partagent jamais un fil |

#### Contraintes que la reprise doit respecter

1. **L'ancien historique est lu, jamais réécrit.** Un message émis par le nouvel agent dans une conversation v1 serait attribué à l'ancienne génération.
2. **La validation humaine reste acquise.** Une reprise ne réécrit ni un contenu déjà validé ni une surcharge de métadonnées (invariant 5).
3. **La reprise est explicite.** L'utilisateur doit pouvoir la distinguer d'une génération ordinaire. **La forme exacte de cette signalisation est à statuer avec l'équipe produit** : le mécanisme est transparent, l'affichage ne l'est pas nécessairement.
4. **La mémoire v1 est en lecture seule.** Le nouvel agent ne doit pas pouvoir modifier l'histoire qu'il consulte — sinon la source de comparaison disparaît (invariant 3).
5. **Coût et latence documentés.** Attacher une mémoire et lire un historique a un coût en tokens ; à mesurer avant généralisation.

#### Question ouverte — portée de la signalisation

Le mécanisme doit être **transparent pour l'utilisateur** dans son fonctionnement, mais il reste à décider :
**où et comment signaler qu'une fiche repose sur une conversation de la génération précédente ?**

Pistes à soumettre à l'équipe produit :
- une mention discrète sur la fiche concernée ;
- un indicateur dans l'historique des générations ;
- aucune signalisation, la reprise étant considérée comme un détail d'implémentation.

**À statuer par l'équipe produit.** Cette décision conditionne PR-06 (modèle de données de la correspondance entre générations) et l'affichage de PR-16.

#### Note — sous-agents et mémoire partagée sont plus larges que ce cas

Ces deux mécanismes ne sont pas propres à la transition : ils constituent la façon standard
de faire coopérer des agents chez Letta. Ce qui est décidé ici, c'est **de les utiliser pour
la transition plutôt qu'un proxy**, pas de les cantonner à elle.

---

<a id="s9"></a>

## 9. Décisions à confirmer

### Bloquantes pour figer le backlog

| # | Décision | Recommandation |
|---|---|---|
| A | **Isolation des agents de secours** — utiliser des agents dédiés au SDK, ou partager les agents v1 ? **Ne peut plus être résolu en créant des agents côté v1** ([§3.4-c](02-current-state.md#s34)). | Sauvegarder la mémoire des agents v1 existants ; agents récents pour les essais SDK. |
| B | **Gel fonctionnel** — qmd/retrieval, regroupement des traducteurs, réactivation du fan-out | Différer en projets distincts. |
| C | **Fenêtre de secours v1** — durée et disponibilité | **Contrainte externe, pas un choix du projet** : la fermeture est imminente et sans date ferme. Le chemin v1 doit être préservé à chaque étape, mais **aucune période de confort ne peut être planifiée**. Voir [§10](07-v1-removal-and-backup.md). |
| D | **Backend SDK** — `cloud` avec sandbox géré, `cloud` + `computer`, ou `remote` (App Server) | À trancher sur les résultats de PR-03 : latence, coût, sécurité, et localisation de l'exécution des outils. |
| E | **Topologie des traducteurs** — conserver la configuration actuelle ou consolider | Conserver à l'identique pendant la migration ; toute consolidation est un projet distinct. |

### Reportées (à documenter, pas à trancher maintenant)

- Pertinence d'un index documentaire type qmd pour la connaissance éditoriale.
- Évolution du service de recherche de doublons (source actuelle vs cible).
- Réactivation du fan-out d'ingestion DI, sur la base de mesures.
- Nettoyage des ressources Letta Cloud historiques.
