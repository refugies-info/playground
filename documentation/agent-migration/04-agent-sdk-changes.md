# Ce que change réellement Letta Agent SDK

> **Section §4 — lecture de la documentation officielle au 17/09/2026.**

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
