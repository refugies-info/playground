# Organisation Linear et annexe

> **Sections §8 et §11 — jalons, gabarit d'issue TEC, chemin critique, sources et limites de l'analyse.**

---

<a id="s8"></a>

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

<a id="s11"></a>

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
