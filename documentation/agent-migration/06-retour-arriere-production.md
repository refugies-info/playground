# Procédure de retour arrière en production

> **Section §7 — cas A à D, objectifs d'exploitation et limites du dispositif.**

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
| Bascule complète vers le SDK | **avant la fermeture annoncée par Letta** — voir [§10](07-retrait-v1-et-sauvegarde.md) |

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
