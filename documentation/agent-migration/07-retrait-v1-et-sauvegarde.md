# Retrait de la v1 et sauvegarde des ressources

> **Section §10 — imminence de la fermeture, plan de sauvegarde et détection continue des coupures d'API.**

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
| Reprise de conversations v1 ([§5.3](01-decision.md#s53)) | Acceptable | ⚠️ À garder **exceptionnelle** : sur-attacher la mémoire homologue revient à payer indéfiniment la compatibilité descendante |

<a id="s102"></a>

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

<a id="s104"></a>

### 10.4 Plan de sauvegarde des ressources (à faire **avant** tout autre travail)

1. Inventorier les agents de production : IDs, modèles, dates de dernière synchronisation.
2. **Acquérir l'outil officiel** `backing-up-cloud-agents` (skill du guide Letta v1→v2, [§3.4-b](02-etat-des-lieux.md#s34)) plutôt que d'écrire un exporteur maison.
3. **Mettre chaque agent en pause** avant l'export : arrêter les tours, les éditions de mémoire et les activités planifiées, puis attendre la fin des pushs de mémoire en attente (l'outil n'est pas transactionnel).
4. Exporter vers un dossier **privé, hors dépôt et hors checkout de mémoire partagée** : messages, métadonnées et mémoire peuvent contenir des secrets.
5. Extraire le contenu réel des blocs mémoire / consignes / personas, avec sa provenance exacte.
6. Marquer chaque ressource : contenu du dépôt / dérivé / figé / obsolète.
7. **Restaurer l'export dans un agent neuf** pour prouver que la restauration fonctionne — ne pas se contenter d'un export non testé.
8. Conserver l'agent original et le backup jusqu'à validation de l'agent restauré.
9. **Convertir les ressources en markdown** au format attendu par le SDK : `system/<label>.md` avec frontmatter `description` ([§3.4-h](02-etat-des-lieux.md#s34)). C'est l'étape qui rend la connaissance **lisible par les nouveaux agents** — sans elle, la sauvegarde préserve un contenu inexploitable.
10. **Sonder la faisabilité de la conversion** sur un agent non critique avant de traiter l'ensemble ([§3.4-h](02-etat-des-lieux.md#s34)).
11. Faire relire le contenu extrait par les référents éditoriaux : un export non vérifié reste un export non fiable.

> ️ **Ce que l'outil ne restaure pas** (documenté par le guide) : les messages, les secrets, les outils, les connexions, les dépôts de mémoire partagée, les schedules et la mémoire archival. Ces éléments doivent être reconfigureés manuellement — à intégrer à la procédure de PR-20.

> **Sans cette sauvegarde, la migration aurait pu réussir techniquement et perdre la connaissance métier.** C'était le risque principal du projet — il est traité depuis le 18/09/2026 (ci-dessous).

> ✅ **Sauvegarde effectuée le 18/09/2026** ([§3.5](03-audit-agents-production.md)) : les huit agents de production ont été
> clonés depuis `https://api.letta.com/v1/git/{agent-id}/state.git`, soit ≈ 176 Ko de
> connaissance métier avec historique Git. **Le risque de perte définitive est levé.**

> ⚠️ **Mais une sauvegarde n'est pas une migration.** La mémoire est déjà au format
> Git/MemFS, donc directement exploitable par un agent SDK. Le travail restant est
> d'**unifier les deux formats** qui coexistent en production — `skills/` pour six agents,
> `system/` seul pour `ru` et `uk`. C'est une décision de conception, plus une course
> contre la fermeture.

<a id="s105"></a>

### 10.5 Détection en continu des coupures d'API

Puisque le retrait est **incrémental** (une route historiquement documentée est déjà en HTTP 400 depuis le 17/07/2026, [§3.4-a](02-etat-des-lieux.md#s34)) et non un basculement unique :

1. Ajouter une **sonde** qui vérifie périodiquement que les routes historiques encore utilisées par le code répondent.
2. Alerter l'équipe dès qu'une route passe en erreur **avant** que la production ne la rencontre.
3. Reclasser immédiatement la vague correspondante en urgence.
4. Documenter les routes déjà mortes pour éviter de les re-découvrir en incident.

C'est la protection la plus utile contre l'absence de date ferme : on ne peut pas planifier la fermeture, mais on peut **la détecter en avance**.
