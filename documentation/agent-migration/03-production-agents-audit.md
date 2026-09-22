# Production agents audit

> **Section §3.5 — actual state of the agents observed via the Letta API on 18/09/2026.**

---

### 3.5 Actual state of the agents in production (API audit of 18/09/2026)

Audit carried out via the Letta API with `PLAYGROUND_LETTA_API_KEY`, default project `97c52a94-4e58-4226-9ac3-b000d1dcba78`. The IDs provided by Luis are confirmed; the list contained more agents than the 15/06/2026 inventory.

#### Active agents and obsolete entries

| Agent | ID | Model | Prompt | Last run | Status |
|---|---|---|---|---|---|
| **Agathe** | `agent-bd542fe1-…c9af` | `anthropic/claude-sonnet-4-6` | 4 164 chars | 17/09 16:39 | ✅ Active |
| Agathe-dev | `agent-8165c57b-…1168` | `letta/auto-chat` | identical | 07/09 | Experimental |
| traducteur_ar_v2 | `agent-9b1e38aa-…ce86` | `letta/auto` | 9 301 chars | 17/09 16:12 | ✅ Active |
| traducteur_en | `agent-d70a6911-…986a` | `letta/auto` | 9 301 chars | 17/09 16:12 | ✅ Active |
| traducteur_fa | `agent-09f186f2-…26` | `letta/auto` | 9 301 chars | 17/09 16:12 | ✅ Active |
| traducteur_ps | `agent-42fb380d-…6a7` | `letta/auto` | 9 301 chars | 17/09 16:13 | ✅ Active |
| traducteur_ti | `agent-f59e9249-…735` | `letta/auto` | **12 522 chars** | 17/09 16:15 | ⚠️ See anomaly |
| traducteur_ru | `agent-4d7f539b-…c9f7` | `letta/auto` | 1 707 chars | 17/09 16:12 | ⚠️ Old prompt |
| traducteur_uk | `agent-add8dcc9-…b59` | `letta/auto` | 1 707 chars | 17/09 16:12 | ⚠️ Old prompt |
| traducteur_ar | `agent-c19d4b57-…24b` | `anthropic/claude-haiku-4-5` | 1 707 chars | **16/06** |  **Replaced by `_v2`** |
| traducteur_ti | `agent-00b19760-…f7b` | `anthropic/claude-sonnet-4-6` | 9 301 chars | 02/06 | ❌ **Duplicate name, inactive** |
| traducteur_uk_dev | `agent-2015ce50-…567` | `letta/auto` | 1 707 chars | 07/09 | Experimental |
| Code Review | `agent-97d0fefa-…911` | `letta/auto` | 12 522 chars | 18/09 06:33 | Out of RI scope |
| Review-letta | `agent-38e3ff6d-…4bb` | `letta/auto` | 13 963 chars | never | Out of RI scope |

Three drifts are now **resolved**:

1. **`ar` → `ar_v2`**: the `ar` agent has not run since 16/06 and `traducteur_ar_v2` has taken over. The code nevertheless still points to `agent-9b1e38aa` under the `ar` key — this is correct, but the name `_v2` exists nowhere in the code.
2. **`ti`, two agents sharing a name**: `traducteur_ti` (`f59e9249`, active) and `traducteur_ti` (`00b19760`, inactive). The code references the second one — **so the wrong one**. That was the August suspicion: now proven.
3. **`en` and `fa` do have an agent**: the inventory of 15/06 stated "no dedicated agent". That was false — both exist, run (`letta/auto`), and are correctly referenced in the code. **No language key is orphaned.**

#### Anomaly: `traducteur_ti` runs a code-review prompt

The prompt of `traducteur_ti` (`agent-f59e9249`, 12 522 chars) is **byte-for-byte identical** to that of the "Code Review" agent (`agent-97d0fefa`). It contains **no** mention of translation, language or document.

This is the accidental copy of a code-review prompt into a translation agent.

> ✅ **Impact revised on 18/09/2026**: after cloning the agent's memory, the translation
> turns out to be driven by a **dedicated and correct skill**. See "The `traducteur_ti`
> anomaly does not affect translations" below. The defect remains to be fixed, without urgency.

#### Where the knowledge actually lives

Correcting a hasty reading: the `/v1/agents` list returns `blocks: []` for all of them, but **the runtime representation does contain them**. The real `system_message` of `traducteur_en` is **14 462 characters**, against 9 301 for `agent.system` at creation time: **+5 161 characters compiled from memory**.

The structure is therefore:

| Location | Content | Retrievable? |
|---|---|---|
| `agent.system` | Base prompt + scaffolding (`base_instructions`, memory, file) | ✅ `GET /v1/agents/{id}` |
| Blocks compiled at runtime | `human`, `persona`, `project`, skills index | ✅ via `GET /v1/agents/{id}/messages` (`system_message`) |
| Orphan blocks | 199 blocks in `project-pZvdCSjhJ7Fgmi66gqgy` — **no agent lives there** | ✅ `GET /v1/blocks` |
| Translation instruction | **In the agent's memory**, not in `prompts.ts` | ✅ via the `system_message` |
| `metadata_schema` | **Not found** via `/v1/blocks` | ❌ Only exists in the repo (`metadata-schema-spec.ts`, 4 483 chars) |

**Important consequence for PR-11**: the `packages/agents/src/prompts.ts` file in the repository contains only the four `/<command>` strings. The *real* knowledge lives in the agents' memory, and it is **readable via the messages API**. That is the source to extract — not the constants file.

#### ✅ The agents' memory is accessible in Git — a major discovery

The official migration guide documents direct Git access to the agents' memory
(`https://api.letta.com/v1/git/{agent-id}/state.git`). **Tested and working on 18/09/2026
with the key provided by Luis: the eight production agents could be cloned.**

This is the source that was missing: **the memory actually in context**, and not
repository drafts or orphan blocks.

```bash
git clone --single-branch --branch main --no-tags \
  "https://api.letta.com/v1/git/agent-{id}/state.git" ./{agent}
```

| Agent | Agent ID | Commits | Files | Size | Last modified |
|---|---|---|---|---|---|
| `agathe` | `bd542fe1` | 14 | 20 | 60.8 KB | 2026-08-18 |
| `ti` | `f59e9249` | 9 | 7 | 33.8 KB | 2026-06-17 |
| `uk` | `add8dcc9` | 2 | 2 | 16.4 KB | 2026-06-02 |
| `ar_v2` | `9b1e38aa` | 6 | 5 | 15.2 KB | 2026-06-16 |
| `en` | `d70a6911` | 8 | 7 | 15.0 KB | 2026-06-16 |
| `ps` | `42fb380d` | 8 | 5 | 13.8 KB | 2026-06-16 |
| `fa` | `09f186f2` | 7 | 5 | 13.3 KB | 2026-06-16 |
| `ru` | `4d7f539b` | 2 | 2 | 4.6 KB | 2026-06-02 |

**Total ≈ 176 KB of domain knowledge**, with the full Git history.

> **The "permanent loss" risk identified in [§10.4](07-v1-removal-and-backup.md#s104) is therefore lifted**: the knowledge has
> been exported and versioned. The plan can now treat the conversion as a
> quality task, no longer as a race against shutdown.

#### ️ Two generations of memory coexist in production

| Generation | Agents | Format |
|---|---|---|
| **Letta Code** (with skills) | `agathe`, `ar_v2`, `en`, `fa`, `ps`, `ti` | `skills/<name>/SKILL.md` + `references/` + `system/persona.md` + `system/human.md` |
| **Inherited** (without skills) | `ru`, `uk` | instructions in `system/*.md` only |

Direct consequence for PR-11: **both formats must be supported**. `ru` and `uk`
carry their instructions in `system/` (hence in context on every turn), the others in a
loadable skill. Unification is desirable, but it changes the loading
behavior: to be treated as a decision, not as a cosmetic normalization.

#### ✅ `metadata_schema` is retrievable — my previous conclusion was wrong

`agathe/system/metadata_schema.md` (4 904 characters) **exists in the agent's memory**.
The block appeared in no API listing, but it lives in the Git repository.

Same finding for all of Agathe's skills:

| File | Size |
|---|---|
| `compétence_métadonnées_di.md` | 10 724 chars |
| `compétence_conformité_éditoriale_di.md` | 6 839 chars |
| `règles_rédaction_langage_clair.md` | 6 448 chars |
| `format_sortie_transformation.md` | 5 242 chars |
| `compétence_routeur.md` | 5 189 chars |
| `metadata_schema.md` | 4 993 chars |
| `compétence_transformation_langage_clair.md` | 4 842 chars |
| `compétence_détection_doublons.md` | 4 390 chars |
| `format_sortie_metadonnées.md` | 2 806 chars |
| `mémoire_vive_lexique.md` | 2 507 chars |
| `contexte_équipe.md`, `format_sortie_global.md`, `project-*.md`, `trajama_agent.md`, `traduction.md`, `persona.md`, `human.md` | 258–1 685 chars |

⚠️ **Agathe's Git history is dated and attributed**, which makes it possible to trace every rule:

```
fb6c5c6 2026-08-18 Ajout de la règle modalitesEntreesSorties à l'Étape 5 (Julie)
488085d 2026-08-05 Renforcer la règle zéro texte avant frontmatter
c286beb 2026-06-25 fix: FLE toujours suffisant comme signal de rattrapage sémantique
d9bff6b 2026-06-16 Renforcement de la règle location (départements hors IDF)
```

A `metadata-schema-spec.ts` in the repository (4 483 chars) is a **parent, not an equivalent**:
only 47% similarity. The production version is authoritative.

#### ✅ The `traducteur_ti` anomaly does not affect translations

Revised conclusion. `traducteur_ti` carries **two** mechanisms:

1. an unsuitable system prompt (a copy of a code-review prompt);
2. **a complete and correct skill**: `skills/translating-fr-tigrinya/SKILL.md`
   (33.8 KB including its `references/pipeline.md`) — charter, FR→Tigrinya glossary,
   a 7-step QA pipeline, plus `system/skills/translate-fr-tigrinya.md` in context.

**Translation is therefore driven by a dedicated skill.** The unsuitable prompt is a
cleanliness defect, not an identified cause of degradation. It remains to be fixed, without
urgency.

#### 🔍 Another configuration problem: `ru` and `uk` have no skill

`ru` and `uk` are active (last run on 17/09) but their instructions live only in
`system/`. No skill is loadable. That is consistent with their generation, but it
means that **all their knowledge is in context on every turn** — higher token
cost and no possible lazy loading.

#### The resource routes, for their part, remain inaccessible

Tested on 18/09/2026 with the refreshed key (global scope according to Luis) — **404s confirmed**:

```
GET /v1/files                → 404     GET /v1/agents/{id}/blocks   → 404
GET /v1/folders              → 404     GET /v1/agents/{id}/sources  → 404
GET /v1/sources              → 404     GET /v1/agents/{id}/files    → 404
GET /v1/organizations        → 404     GET /v1/agents/{id}/export   → 404
GET /v1/identities           → 404
```

Luis confirms that **`platform.letta.com` has been switched to read-only**, that the display of
blocks there is deprecated and that **the "File" resources are no longer available in
the interface**. This is consistent: these routes have been removed, not merely frozen.

#### Orphan blocks: a secondary heritage

199 blocks in `project-pZvdCSjhJ7Fgmi66gqgy` (47 distinct contents, 23 RI artefacts,
≈ 86 000 characters). **No agent lives there** — they are therefore **not** the source of the
production knowledge. They remain useful as **editorial history** (LHEO analysis,
deduplication reports, Margot/Edwige personas, team context), to be kept but without
authoritative status.

Two repository files match them at 93.1% (`prompts/compliance.md`) and 98.0%
(`prompts/duplicates.md`) after removing the `<base_instructions>` wrapper and the
`### Prompt V1 (draft)` marker. The `corpus-migration-staleness-checks` lesson applies: these are
drafts, not to be confused with the served versions.

#### What remains out of reach

| Element | Status |
|---|---|
| Historical "File" resources | ❌ Removed from the API **and** from the interface |
| Memory blocks attached to the agents | ❌ No agent has any — everything lives in `system/` and `skills/` |
| Other conversations of an agent | ⚠️ Cloning only takes `main` by default |
| Knowledge of the inactive agents (`ar`, `ti` namesakes) | ️ Their repositories have not been cloned — to do if a history is deemed useful |

**Revised verdict**: the editorial knowledge is **fully backed up**, including
`metadata_schema`. The Git access has turned a risk of loss into a simple formatting
task.

> ⚠️ **This does not dispense with the backup.** Knowledge rebuilt from a `draft` record is not validated knowledge. Path A of [§3.4-h](02-current-state.md#s34) (original documents) remains the target, path B becomes **immediately practicable** now that the sources are accessible.
