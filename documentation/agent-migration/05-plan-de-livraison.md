# Plan de livraison — phases et PR

> **Section §6 — sept phases (0 à 6), 21 PR planifiées et critères de sortie.**

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
- **Intégrer l'outil officiel de sauvegarde d'agents Cloud** (skill `backing-up-cloud-agents` du guide Letta v1→v2, [§3.4-b](02-etat-des-lieux.md#s34)) plutôt que d'écrire un exporteur maison.
- **Sonder les routes historiques** encore utilisées par le code (détection en continu, [§10.5](07-retrait-v1-et-sauvegarde.md#s105)).

**Critères d'acceptation**
- [ ] **Statut d'obsolescence écrite dans le document lui-même** : en-tête de dépréciation, remplacement indiqué, procédure de récupération de l'inventaire vers le nouveau foyer. Ne pas laisser un plan obsolète comme source d'autorité par défaut.
- [ ] **Balisage des ressources gelées** : marquer sur chaque ressource Letta Cloud (blocs mémoire, agents) sa date de dernière synchronisation avec le dépôt et sa nature figée, ainsi que **la procédure de récupération en cas de fermeture de l'API**. C'est le livrable immédiat le plus utile.
- [ ] **Export de sauvegarde réalisé pour chaque agent de production** via l'outil officiel, agents en pause, dossiers privés hors dépôt ([§10.4](07-retrait-v1-et-sauvegarde.md#s104)).
- [ ] **Sonde de conversion exécutée sur un agent non critique** ([§3.4-h](02-etat-des-lieux.md#s34)) : les blocs de mémoire sont-ils lisibles dans l'export, et la mémoire de l'agent est-elle accessible en Git ?
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

**Dépendances :** aucune. **Bloque PR-09** ([§3.4-d](02-etat-des-lieux.md#s34)).

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
- [ ] Dans la lignée de la [§5.3](01-decision.md#s53) : l'interface accepte **une mémoire homologue v1 en lecture seule** et la désigne comme telle, de sorte que le nouvel agent sache identifier son prédécesseur en langage naturel.

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
- [ ] **Pour la [§5.3](01-decision.md#s53)** : la correspondance entre une conversation d'une génération et son agent est persistée ; en cas d'ambiguïté (plusieurs agents, ou agent introuvable), la reprise est **bloquée explicitement**, jamais résolue par supposition.
- [ ] **L'identité de l'agent propriétaire de la conversation est relue depuis la conversation elle-même** (`agent_id`), jamais déduite du résumé ou du nom.
- [ ] **La résolution de la conversation précède le démarrage du workflow** : une reprise impossible doit échouer avant que du travail soit lancé.
- [ ] L'UI peut afficher l'origine d'une reprise **quand la signalisation produit est retenue** ([§5.3](01-decision.md#s53)), sans que le mécanisme dépende de cette décision.
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

**Dépendances :** PR-03 à PR-08, **PR-01 (bloquant) et PR-11 (bloquant)**. La connaissance doit être matérialisée côté Git avant qu'un adaptateur SDK ne lise une mémoire : l'API historique et le SDK écrivent dans deux magasins différents ([§3.4-d](02-etat-des-lieux.md#s34)). Sans PR-01 ni PR-11, l'agent SDK démarre **sans instructions** et produit des sorties dégradées de façon silencieuse.

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
- Récupération contrôlée des consignes et ressources faisant autorité, selon la voie arbitrée en PR-01 (documents originaux / sauvegarde d'agent / copier-coller — [§3.4-h](02-etat-des-lieux.md#s34)).
- Skills audit, rédaction, métadonnées, traduction, avec leurs références.
- Distribution via mémoire agent et/ou dépôts de mémoire partagée.
- Manifeste de release et procédure de restauration.
- Isolation de la connaissance v1 et des évaluations.

**Critères d'acceptation**
- [ ] Un corpus vide ou incomplet fait **échouer** la validation (le validateur actuel ne détecte pas un corpus vide).
- [ ] Les brouillons historiques ne sont pas présentés comme des exports de production.
- [ ] Chaque skill est effectivement accessible dans une session SDK réelle.
- [ ] **Le contenu fourni répond à l'interface déclarée en PR-04** : chaque parcours reçoit bien la connaissance qu'il attend.
- [ ] **Format `system/<label>.md` respecté** pour les ressources issues de blocs legacy, avec frontmatter `description` ([§3.4-h](02-etat-des-lieux.md#s34)).
- [ ] **Les deux générations de mémoire coexistantes sont supportées** ([§3.5](03-audit-agents-production.md)) : `skills/<nom>/SKILL.md` (agathe, ar_v2, en, fa, ps, ti) et consignes en `system/*.md` seul (`ru`, `uk`).
- [ ] **Le pointeur vers l'homologue vit dans la mémoire, pas dans le code.** Un fichier de mémoire du nouvel agent référence la mémoire homologue v1 et lui donne un nom d'usage (« ton prédécesseur v1 »). But : un **changement de règle ne nécessite aucune modification de code ni redéploiement de skill**. Corollaire : la politique de reprise est gouvernée par des données, donc soumise au même contrôle éditorial que le reste de la connaissance.
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
- [ ] **Reprise d'une conversation d'une génération précédente** ([§5.3](01-decision.md#s53)) : l'historique est lu sans être réécrit, une nouvelle conversation est ouverte par l'agent courant, et la reprise reste **exceptionnelle**. L'attachement en masse d'une mémoire homologue est un signe de sur-attachement à corriger, pas un comportement à valider.
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
