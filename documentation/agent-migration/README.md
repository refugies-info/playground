# Migration agent IA — Letta Agent SDK

Ce dossier documente la migration de l'agent IA éditorial de l'API Letta historique (`@letta-ai/letta-client`) vers **`@letta-ai/letta-agent-sdk`**, avec une trajectoire de livraison réversible.

> ⚠️ **Source de vérité actuelle** : les huit documents numérotés ci-dessous (plan du 17 septembre 2026, complété par l'audit du 18 septembre). Le plan était initialement un document unique (`agent-sdk-migration-plan.md`, supprimé) découpé ici par intention et par durée de vie, pour la revue.
> La planification antérieure du 15 juin 2026 supposait qmd + un runtime Letta Code et un worker GCP ; elle n'a pas été implémentée et est **obsolète**. Le corpus `agent-knowledge/` sur `main` est un squelette vide, pas une migration aboutie.
> Le projet Linear « Migration agent IA — Letta Code SDK et qmd » et ses 50 tickets ont été archivés le 17/09/2026. Le nouveau découpage des tickets vit dans [`08-linear-et-annexe.md`](./08-linear-et-annexe.md).

## Comment lire ce dossier

| Ordre | Document | Sections | Ce qu'on y trouve |
| ----- | -------- | -------- | ----------------- |
| 1 | [`01-decision.md`](./01-decision.md) | §1, §2, §5, §9 | **Ce qu'il faut décider** : synthèse exécutive, périmètre, architecture cible, arbitrages ouverts |
| 2 | [`02-etat-des-lieux.md`](./02-etat-des-lieux.md) | §3.1 – §3.4 | **Ce qui est constaté** dans le dépôt, et ce que le guide officiel Letta change dans ce plan |
| 3 | [`03-audit-agents-production.md`](./03-audit-agents-production.md) | §3.5 | **L'état réel de la production** : audit API du 18/09/2026 (agents, mémoire, ressources) |
| 4 | [`04-changements-agent-sdk.md`](./04-changements-agent-sdk.md) | §4 | **Ce que change le SDK**, par rapport aux plans antérieurs |
| 5 | [`05-plan-de-livraison.md`](./05-plan-de-livraison.md) | §6 | **Ce qui s'exécute** : sept phases (0 à 6), 21 PR, critères de sortie |
| 6 | [`06-retour-arriere-production.md`](./06-retour-arriere-production.md) | §7 | **Le filet de sécurité** : procédure de retour arrière, cas A à D |
| 7 | [`07-retrait-v1-et-sauvegarde.md`](./07-retrait-v1-et-sauvegarde.md) | §10 | **Ce qui se répète** : contrainte de calendrier, sauvegarde des ressources, détection des coupures |
| 8 | [`08-linear-et-annexe.md`](./08-linear-et-annexe.md) | §8, §11 | **Le pilotage** : jalons, gabarit d'issue, chemin critique, sources et limites |

La numérotation d'origine est conservée : une référence « §6.2 » reste valable dans le nouveau découpage.

### Où a atterri chaque renvoi

| Renvoi d'origine | Destination |
| ---------------- | ----------- |
| §1, §2 | [`01-decision.md#s1`](./01-decision.md#s1), [`01-decision.md#s2`](./01-decision.md#s2) |
| §3.1 – §3.3 | [`02-etat-des-lieux.md`](./02-etat-des-lieux.md) |
| §3.4 (et §3.4-a … §3.4-h) | [`02-etat-des-lieux.md#s34`](./02-etat-des-lieux.md#s34) |
| §3.5 | [`03-audit-agents-production.md`](./03-audit-agents-production.md) |
| §4 | [`04-changements-agent-sdk.md`](./04-changements-agent-sdk.md) |
| §5, §5.3 | [`01-decision.md#s5`](./01-decision.md#s5), [`01-decision.md#s53`](./01-decision.md#s53) |
| §6 | [`05-plan-de-livraison.md`](./05-plan-de-livraison.md) |
| §7 | [`06-retour-arriere-production.md`](./06-retour-arriere-production.md) |
| §8 | [`08-linear-et-annexe.md#s8`](./08-linear-et-annexe.md#s8) |
| §9, §9-A | [`01-decision.md#s9`](./01-decision.md#s9) |
| §10, §10.2, §10.4, §10.5 | [`07-retrait-v1-et-sauvegarde.md`](./07-retrait-v1-et-sauvegarde.md) |
| §11 | [`08-linear-et-annexe.md#s11`](./08-linear-et-annexe.md#s11) |

## Contrainte de calendrier (Luis, 17 septembre 2026)

Il n'existe **pas de date ferme** pour la fermeture de l'API historique, mais elle est **imminente**. La voie historique est donc un pont de durée inconnue, pas un repli confortable. L'archivage des ressources faisant autorité (blocs mémoire, prompts, personas) est la **première priorité**, avant tout travail sur le transport.

## Deux implémentations d'agent coexistent (15 juin 2026)

1. **Agent Letta historique (production, à l'origine de la migration)** — package `@playground/agents` consommant `@letta-ai/letta-client@1.10.2`. Il alimente les workflows d'ingestion, d'éditorial et de traduction du frontend Next.js. Il consomme du **markdown + frontmatter YAML** issu de l'API Data Inclusion.
2. **Squelette d'agent RCO XML (`.agents/`, `.commands/`, `.skills/`)** — archivé du dépôt le 15 juin 2026 (voir annexe C de l'inventaire). RCO n'est pas une source de production active ; les helpers `packages/rco/src/` sont conservés pour une réactivation future éventuelle.

L'annexe C de l'inventaire donne le détail ; l'audit du 18/09/2026 (§3.5) a depuis précisé quelles de ces ressources existent réellement côté production.

## Contraintes clés

1. **Les ressources Letta historiques sont figées.** Letta a déprécié la mise à jour des ressources « File » ; les agents de production reposent sur des ressources téléversées avant cette dépréciation et ne seront plus jamais mises à jour. C'est le principal moteur du passage à un paramétrage versionné localement.
2. **Le format d'entrée actuel est le markdown (frontmatter YAML + corps de texte)** issu de l'API Data Inclusion.
3. **`search_ri_duplicate_dispositifs` n'est pas un outil autonome.** C'est un client d'une API ad hoc du dépôt karfur qui renvoie des candidats doublons, que le LLM analyse ensuite. Tout remplacement doit être justifié par une incompatibilité démontrée — ne pas supposer l'existence d'une table Supabase `dispositifs`.
4. **Les quatre chaînes `/audit`, `/redaction`, `/metadata`, `/translate` de `packages/agents/src/prompts.ts` ne sont pas un export de la connaissance éditoriale.** Les instructions et références réelles restent à récupérer et à vérifier.

## Décision de périmètre (15 juin 2026, toujours valide)

- Le travail de migration est exécuté depuis `playground` (branche `main`), pas depuis `karfur`.
- Le format d'entrée de production est **markdown + frontmatter** (cohérent avec la table Supabase `editorial_records`). Le XML RCO est hors périmètre.

## Documents historiques

| Fichier | Date | Contenu |
| ------- | ---- | ------- |
| [`letta-cloud-inventory.md`](./letta-cloud-inventory.md) | 2026-06-15 | Inventaire historique du dispositif Letta Cloud, utilisé comme contexte et point de départ du travail d'archivage. Son mapping de migration est obsolète. |
| [`agent-knowledge/`](./agent-knowledge/) | 2026-06-15 | Squelette de corpus (vide) issu du plan qmd abandonné. |
