# Architecture FSM (Finite State Machine)

**Date**: 2026-02-26
**Statut**: Proposition

---

## 🎯 Objectif

Centraliser la gestion des états et les règles de transition pour :
- **Frontend** : UI state, transitions visuelles, validation utilisateur
- **Backend** : Workflows, triggers DB, validation métier
- **Synchronisation** : Règles uniques partagées entre les deux couches

---

## 📚 Recommandations de Structure

### 1. Architecture Proposée

```
packages/
├── fsm/                          # NOUVEAU PACKAGE CENTRALISÉ
│   ├── src/
│   │   ├── machines/             # Définitions des machines à états
│   │   │   ├── document-machine.ts
│   │   │   ├── translation-machine.ts
│   │   │   └── ingestion-machine.ts
│   │   ├── guards/               # Règles de transition (partagées)
│   │   │   ├── can-publish.ts
│   │   │   ├── can-archive.ts
│   │   │   └── can-toggle.ts
│   │   ├── actions/              # Actions FSM (side effects)
│   │   │   ├── update-status.ts
│   │   │   └── notify-stakeholders.ts
│   │   ├── context/              # Context FSM (données associées)
│   │   │   └── types.ts
│   │   └── index.ts              # Export public
│   ├── package.json
│   └── tsconfig.json
│
├── workflows/                    # BACKEND (utilise @playground/fsm)
│   └── src/
│       └── steps/
│           └── editorial/
│               └── toggle-status.ts  # Import guards depuis fsm
│
└── frontend/                     # FRONTEND (utilise @playground/fsm)
    └── src/
        └── components/
            └── document-editor/
                └── DocumentContext.tsx  # Import machine depuis fsm
```

### 2. Librairies Recommandées

#### **XState v5** (Recommandé)

**Pourquoi XState ?**
- ✅ **Type-safe** : TypeScript first-class
- ✅ **Isomorphe** : Fonctionne front ET back (Node.js)
- ✅ **Visualisation** : Outils de debug graphiques
- ✅ **Acteurs** : Modèle moderne (v5) pour workflows complexes
- ✅ **Persistence** : État sérialisable pour DB
- ✅ **Testing** : Facile à tester unitairement

**Alternatives considérées :**
- **Robot3** : Plus léger, mais moins d'outillage
- **Zustand** : State management, pas FSM dédiée
- **Custom** : Trop de code à maintenir

**Installation :**
```bash
pnpm add xstate --filter @playground/fsm
pnpm add @xstate/react --filter @playground/frontend  # Pour React hooks
```

---

## 📊 Inventaire des États Existants

### 1. Workflow Principal (Document)

#### **Compliance Status** (`workflows.compliance_status`)
```
┌─────────┐
│  NULL   │
└────┬────┘
     │ (audit)
     ▼
┌─────────┐
│ pending │
└────┬────┘
     │ (classification IA)
     ├──────────┬──────────┐
     ▼          ▼          ▼
┌──────────┐ ┌────────────┐ ┌───────┐
│compliant │ │non_compliant│ │ error │
└────┬─────┘ └──────┬─────┘ └───────┘
     │              │
     │  (toggle)    │ (toggle)
     └──────────────┘
```

**Valeurs autorisées** : `NULL`, `'pending'`, `'compliant'`, `'non_compliant'`, `'error'`

**Transitions actuelles** :
- `NULL → pending` : Création workflow (trigger DB)
- `pending → compliant | non_compliant | error` : Audit DI ou Classifier IA
- `compliant ↔ non_compliant` : Toggle manuel (éditeur)

**Fichiers concernés** :
- `packages/workflows/src/steps/editorial/toggle-status.ts:35-54`
- `packages/workflows/src/steps/ingestion/audit-di-step.ts:301-307`

---

#### **Work Status** (`editorial_records.work_status`)
```
┌────────────┐
│    NULL    │
└─────┬──────┘
      │ (ingestion terminée)
      ▼
┌────────────┐
│ to_process │
└─────┬──────┘
      │ (première sauvegarde)
      ▼
┌────────┐
│  draft │
└────┬───┘
     │ (publish/archive)
     ▼
┌────────┐
│  NULL  │
└────────┘
```

**Valeurs autorisées** : `NULL`, `'to_process'`, `'draft'`

**Transitions actuelles** :
- `NULL → to_process` : Trigger DB `handle_new_editorial_record`
- `to_process → draft` : Première sauvegarde (`saveDocument`)
- `draft → NULL` : Publication ou archivage

**Fichiers concernés** :
- `packages/workflows/src/steps/editorial/save-document.ts:87-88`
- `packages/workflows/src/steps/publication/publish-document.ts:199`
- `packages/workflows/src/steps/publication/archive-document.ts:159`

---

#### **Online Status** (`editorial_records.online_status`)
```
┌─────────────┐
│    NULL     │
└──────┬──────┘
       │ (publish)
       ▼
┌───────────┐       (archive)
│ published │──────────────────┐
└─────┬─────┘                  │
      │                        ▼
      │ (archive)        ┌──────────┐
      └─────────────────►│ archived │
                          └────┬─────┘
                               │ (re-publish)
                               ▼
                          ┌───────────┐
                          │ published │
                          └───────────┘
```

**Valeurs autorisées** : `NULL`, `'published'`, `'archived'`

**Note** : TypeScript définit aussi `'unpublished'` mais pas utilisé en DB.

**Transitions actuelles** :
- `NULL → published` : Publication (`publishDocument`)
- `published → archived` : Archivage (`archiveDocument`)
- `archived → published` : Re-publication
- `non_compliant → archived` : Auto-archive (toggle status)

**Fichiers concernés** :
- `packages/workflows/src/steps/publication/publish-document.ts:199`
- `packages/workflows/src/steps/publication/archive-document.ts:159`
- `packages/workflows/src/steps/editorial/toggle-status.ts:88-89`

---

### 2. Workflow de Traduction

#### **Translation Work Status** (`translation_records.work_status`)
```
┌────────────┐
│ to_process │
└─────┬──────┘
      │ (generate translation)
      ▼
┌─────────┐
│ pending │
└────┬────┘
     ├──────────┬──────────┐
     ▼          ▼          ▼
┌───────────┐ ┌─────┐ ┌───────┐
│to_process │ │error│ │ draft │
└───────────┘ └─────┘ └───────┘
```

**Valeurs autorisées** : `'to_process'`, `'pending'`, `'error'`, `'draft'`

**Transitions actuelles** :
- `to_process → pending` : Génération démarrée
- `pending → to_process | error | draft` : Fin de génération

**Fichiers concernés** :
- `packages/workflows/src/pipelines/generate-translation.ts:72,86,98`
- `packages/workflows/src/steps/translation/update-status.ts:16-17`

---

### 3. Publication Records

#### **Publication Status** (`publication_records.status`)
```
┌──────────┐
│ published│
└────┬─────┘
     │ (archive)
     ▼
┌──────────┐
│ archived │
└────┬─────┘
     │ (error)
     ▼
┌────────┐
│ failed │
└────────┘
```

**Valeurs autorisées** : `'published'`, `'archived'`, `'failed'`

---

### 4. Ingestion Runs

#### **Ingestion Status** (`ingestion_runs.status`)
- État non documenté dans les migrations
- Géré par `DIClient` et workflows d'ingestion

---

## 🤔 Comparaison des Approches

### 4 Options Analysées

#### 1. **XState v5** (Librairie complète)

**Approche** : Librairie mature avec support complet des statecharts.

```typescript
import { setup, assign } from 'xstate';

export const documentMachine = setup({
  types: {
    context: {} as DocumentContext,
    events: {} as DocumentEvent,
  },
  guards: {
    canPublish: ({ context }) => {
      return context.complianceStatus === 'compliant' &&
             context.workStatus === 'draft';
    },
  },
  actions: {
    publishDocument: assign({
      onlineStatus: () => 'published',
      workStatus: () => null,
    }),
  },
}).createMachine({
  id: 'document',
  initial: 'pending',
  states: {
    pending: {
      on: {
        AUDIT_COMPLETE: {
          target: 'classified',
          actions: ['setComplianceStatus'],
        },
      },
    },
    editing: {
      on: {
        PUBLISH: {
          guard: 'canPublish',
          target: 'published',
          actions: ['publishDocument'],
        },
      },
    },
    published: {
      on: {
        ARCHIVE: 'archived',
      },
    },
  },
});
```

**Avantages** :
- ✅ Visualisation graphique (Stately)
- ✅ Type-safe complet
- ✅ Devtools avancés
- ✅ Support statecharts (nested, parallel states)

**Inconvénients** :
- ❌ Verbeux (~100 lignes pour une machine simple)
- ❌ Courbe d'apprentissage élevée
- ❌ Concepts abstraits (setup, assign, guards)

---

#### 2. **MobX** (Réactivité automatique)

**Approche** : State management réactif avec classes observables.

```typescript
import { makeAutoObservable, computed, action } from 'mobx';

export class DocumentStore {
  // State
  state: 'pending' | 'classified' | 'editing' | 'published' | 'archived' = 'pending';

  context = {
    complianceStatus: null as 'compliant' | 'non_compliant' | null,
    workStatus: null as 'to_process' | 'draft' | null,
    onlineStatus: null as 'published' | 'archived' | null,
  };

  constructor() {
    makeAutoObservable(this);
  }

  // Guards (computed)
  @computed
  get canPublish(): boolean {
    return (
      this.context.complianceStatus === 'compliant' &&
      this.context.workStatus === 'draft'
    );
  }

  // Transitions (actions)
  @action
  publish() {
    if (!this.canPublish) {
      throw new Error('Cannot publish: conditions not met');
    }

    this.state = 'published';
    this.context.onlineStatus = 'published';
    this.context.workStatus = null;  // Cascade automatique
  }
}
```

**Usage Frontend** :
```typescript
import { observer } from 'mobx-react-lite';

export const PublishButton = observer(() => {
  const store = useDocument();

  return (
    <Button
      disabled={!store.canPublish}
      onClick={() => store.publish()}
    >
      Publier
    </Button>
  );
});
```

**Persistence automatique** :
```typescript
import { reaction } from 'mobx';

// Auto-persist en DB
reaction(
  () => this.context.onlineStatus,
  async (status) => {
    await supabase
      .from('editorial_records')
      .update({ online_status: status })
      .eq('workflow_id', this.context.workflowId);
  }
);
```

**Avantages** :
- ✅ Réactivité automatique (UI se met à jour seule)
- ✅ Code lisible et pragmatique
- ✅ Persistence DB triviale avec `reaction()`
- ✅ Devtools excellents
- ✅ Communauté large

**Inconvénients** :
- ❌ Pas une vraie FSM (pas de validation stricte)
- ❌ Nécessite discipline pour respecter les règles

---

#### 3. **Robot3** (Minimaliste)

**Approche** : Librairie ultra-légère, API fonctionnelle.

```typescript
import { createMachine, state, transition, guard, reduce } from 'robot3';

const documentMachine = createMachine({
  pending: state(
    transition('AUDIT_COMPLETE', 'classified',
      reduce((ctx, ev) => ({ ...ctx, complianceStatus: ev.compliance }))
    )
  ),
  editing: state(
    transition('PUBLISH', 'published',
      guard((ctx) => ctx.complianceStatus === 'compliant' && ctx.workStatus === 'draft'),
      reduce((ctx) => ({ ...ctx, onlineStatus: 'published', workStatus: null }))
    )
  ),
  published: state(),
});
```

**Avantages** :
- ✅ Ultra concis (~30 lignes)
- ✅ API fonctionnelle intuitive
- ✅ < 1KB gzipped
- ✅ Zero boilerplate

**Inconvénients** :
- ❌ Pas d'outils de visualisation
- ❌ Communauté petite
- ❌ Moins de features avancées

---

#### 4. **Custom FSM** (Sans librairie)

**Approche** : Implémenter soi-même avec objets et fonctions.

> **Source** : David Khourshid, créateur de XState, explique dans son article ["You don't need a library for state machines"](https://dev.to/davidkpiano/you-don-t-need-a-library-for-state-machines-k7h) qu'on peut implémenter une FSM simple avec juste des objets et une fonction de transition.

**Implémentation basée sur l'article** :

```typescript
// packages/fsm/src/machines/document-machine.ts

// 1. Définir la machine (configuration objet)
const documentMachine = {
  initial: 'pending',
  states: {
    pending: {
      on: {
        AUDIT_COMPLETE: {
          target: 'classified',
          actions: [{ type: 'setComplianceStatus' }],
        },
      },
    },
    editing: {
      on: {
        PUBLISH: {
          target: 'published',
          guard: 'canPublish',
          actions: [
            { type: 'setOnlineStatus', value: 'published' },
            { type: 'clearWorkStatus' },
          ],
        },
      },
    },
    published: {
      on: {
        ARCHIVE: 'archived',
      },
    },
  },
};

// 2. Fonction de transition (reducer)
function transition(state, event, machine = documentMachine) {
  const currentStateNode = machine.states[state.value];

  // Chercher la transition pour cet événement
  const nextStateNode = currentStateNode.on?.[event.type];

  if (!nextStateNode) {
    // Événement non géré → rester dans l'état actuel
    return state;
  }

  // Vérifier le guard si présent
  if (nextStateNode.guard) {
    const guardFn = guards[nextStateNode.guard];
    if (!guardFn(state.context, event)) {
      return state;  // Guard échoue → pas de transition
    }
  }

  // Exécuter les actions
  const newContext = { ...state.context };
  nextStateNode.actions?.forEach(action => {
    if (action.type === 'setOnlineStatus') {
      newContext.onlineStatus = action.value;
    }
    if (action.type === 'clearWorkStatus') {
      newContext.workStatus = null;
    }
  });

  return {
    value: nextStateNode.target || state.value,
    context: newContext,
  };
}

// 3. Définir les guards
const guards = {
  canPublish: (ctx) => {
    return ctx.complianceStatus === 'compliant' && ctx.workStatus === 'draft';
  },
};

// 4. Usage
let state = {
  value: 'editing',
  context: {
    complianceStatus: 'compliant',
    workStatus: 'draft',
    onlineStatus: null,
  },
};

state = transition(state, { type: 'PUBLISH' });
// → { value: 'published', context: { onlineStatus: 'published', workStatus: null } }
```

**Avantages** :
- ✅ Zero dépendance
- ✅ Complètement transparent
- ✅ Facile à déboguer
- ✅ 100% TypeScript

**Inconvénients** :
- ❌ Pas d'outils externes
- ❌ À maintenir soi-même
- ❌ Pas de visualisation

---

### 📊 Tableau Synthétique

| Critère | XState | MobX | Robot3 | Custom |
|---------|--------|------|--------|--------|
| **Lignes de code** | ~100 | ~50 | ~30 | ~50 |
| **Courbe apprentissage** | Élevée | Faible | Faible | Très faible |
| **Réactivité UI** | Manuelle | Automatique | Manuelle | Manuelle |
| **Persistence DB** | Complexe | Triviale (`reaction()`) | Complexe | Complexe |
| **TypeScript** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Devtools** | Excellent | Excellent | Aucun | Aucun |
| **Visualisation** | Stately | Aucune | Aucune | Aucune |
| **Communauté** | Moyenne | Large | Petite | Aucune |
| **Zero dépendance** | ❌ | ❌ | ❌ | ✅ |
| **Statecharts** | ✅ | ❌ | ❌ | ❌ |

---

### 🎯 Recommandation pour Content Playground

**MobX** est la meilleure option car :

1. **Pragmatique** : Persistence DB triviale avec `reaction()`
2. **Réactif** : UI se met à jour automatiquement
3. **Lisible** : Code clair, pas de concepts abstraits
4. **Type-safe** : Excellent support TypeScript
5. **Débuggable** : Devtools excellents

**Pourquoi pas les autres ?**
- **XState** : Overkill pour ce projet, trop verbeux
- **Robot3** : Manque d'outils et de communauté
- **Custom** : Bien pour apprendre, mais maintenance supplémentaire

**Architecture recommandée** :

```
packages/
├── fsm/
│   ├── src/
│   │   ├── stores/
│   │   │   ├── document-store.ts    # MobX store
│   │   │   └── translation-store.ts
│   │   ├── guards/
│   │   │   └── rules.ts             # Règles partagées
│   │   └── index.ts
│   └── package.json
│
├── workflows/                        # Backend utilise les guards
│   └── src/steps/
│       └── editorial/
│           └── toggle-status.ts
│
└── frontend/                         # Frontend utilise les stores
    └── src/components/
        └── document-editor/
            └── DocumentContext.tsx
```

---

## 🔧 Plan de Refactoring

### Phase 1 : Création du Package FSM

#### 1.1 Structure de Base

```typescript
// packages/fsm/src/machines/document-machine.ts
import { setup, assign } from 'xstate';

export type DocumentContext = {
  workflowId: string;
  complianceStatus: ComplianceStatus | null;
  workStatus: WorkStatus | null;
  onlineStatus: OnlineStatus | null;
  editorialRecordId: string | null;
};

export type DocumentEvent =
  | { type: 'AUDIT_COMPLETE'; compliance: 'compliant' | 'non_compliant' | 'error' }
  | { type: 'SAVE'; hasEditorialRecord: boolean }
  | { type: 'PUBLISH' }
  | { type: 'ARCHIVE' }
  | { type: 'TOGGLE_COMPLIANCE' };

export const documentMachine = setup({
  types: {
    context: {} as DocumentContext,
    events: {} as DocumentEvent,
  },
  guards: {
    canPublish: ({ context }) => {
      return context.complianceStatus === 'compliant' &&
             context.workStatus === 'draft';
    },
    canArchive: ({ context }) => {
      return context.onlineStatus === 'published';
    },
    canToggle: ({ context }) => {
      return context.complianceStatus !== null &&
             context.complianceStatus !== 'pending';
    },
  },
  actions: {
    setComplianceStatus: assign({
      complianceStatus: (_, event) => {
        if (event.type === 'AUDIT_COMPLETE') return event.compliance;
        if (event.type === 'TOGGLE_COMPLIANCE') {
          return _.context.complianceStatus === 'compliant'
            ? 'non_compliant'
            : 'compliant';
        }
        return _.context.complianceStatus;
      },
    }),
    setWorkStatus: assign({
      workStatus: (_, event) => {
        if (event.type === 'SAVE') return 'draft';
        if (event.type === 'PUBLISH' || event.type === 'ARCHIVE') return null;
        return _.context.workStatus;
      },
    }),
    setOnlineStatus: assign({
      onlineStatus: (_, event) => {
        if (event.type === 'PUBLISH') return 'published';
        if (event.type === 'ARCHIVE') return 'archived';
        return _.context.onlineStatus;
      },
    }),
  },
}).createMachine({
  id: 'document',
  initial: 'pending',
  states: {
    pending: {
      on: {
        AUDIT_COMPLETE: {
          target: 'classified',
          actions: ['setComplianceStatus'],
        },
      },
    },
    classified: {
      on: {
        TOGGLE_COMPLIANCE: {
          guard: 'canToggle',
          actions: ['setComplianceStatus'],
        },
        SAVE: {
          target: 'editing',
          actions: ['setWorkStatus'],
        },
      },
    },
    editing: {
      on: {
        PUBLISH: {
          guard: 'canPublish',
          target: 'published',
          actions: ['setWorkStatus', 'setOnlineStatus'],
        },
      },
    },
    published: {
      on: {
        ARCHIVE: {
          guard: 'canArchive',
          target: 'archived',
          actions: ['setWorkStatus', 'setOnlineStatus'],
        },
      },
    },
    archived: {
      on: {
        PUBLISH: {
          target: 'published',
          actions: ['setOnlineStatus'],
        },
      },
    },
  },
});
```

#### 1.2 Guards Partagés

```typescript
// packages/fsm/src/guards/can-publish.ts
import type { DocumentContext } from '../machines/document-machine';

export const canPublish = (context: DocumentContext): boolean => {
  // Règles métier centralisées
  return (
    context.complianceStatus === 'compliant' &&
    context.workStatus === 'draft' &&
    context.editorialRecordId !== null
  );
};

// Utilisable côté BACKEND
export const canPublishBackend = async (
  workflowId: string,
  supabase: SupabaseClient
): Promise<boolean> => {
  const { data } = await supabase
    .from('workflows_enriched')
    .select('compliance_status, work_status, editorial_record_id')
    .eq('id', workflowId)
    .single();

  return canPublish(data);
};

// Utilisable côté FRONTEND
export const useCanPublish = (document: Document) => {
  return canPublish({
    complianceStatus: document.complianceStatus,
    workStatus: document.workStatus,
    editorialRecordId: document.editorialRecordId,
  });
};
```

---

### Phase 2 : Migration Backend

#### 2.1 Refactor `toggle-status.ts`

**Avant** :
```typescript
// packages/workflows/src/steps/editorial/toggle-status.ts
// TODO: move to state machine logic
if (workflow.compliance_status === 'compliant') {
  newStatus = 'non_compliant';
} else if (workflow.compliance_status === 'non_compliant') {
  newStatus = 'compliant';
}
```

**Après** :
```typescript
// packages/workflows/src/steps/editorial/toggle-status.ts
import { documentMachine } from '@playground/fsm';

const snapshot = documentMachine.resolveState({
  value: workflow.compliance_status === 'compliant' ? 'classified' : 'non_compliant',
  context: {
    complianceStatus: workflow.compliance_status,
    // ...
  },
});

const { actions } = snapshot.can({ type: 'TOGGLE_COMPLIANCE' });

if (!actions.length) {
  throw new Error('Transition TOGGLE_COMPLIANCE not allowed');
}

// Exécuter la transition
const newState = documentMachine.transition(snapshot, { type: 'TOGGLE_COMPLIANCE' });
```

#### 2.2 Refactor `publish-document.ts`

**Avant** :
```typescript
// packages/workflows/src/steps/publication/publish-document.ts
// TODO: move to state machine logic
if (workflow.compliance_status !== 'compliant') {
  throw new Error('Cannot publish non-compliant document');
}
```

**Après** :
```typescript
import { canPublishBackend } from '@playground/fsm/guards/can-publish';

if (!(await canPublishBackend(workflow.id, supabase))) {
  throw new Error('Transition PUBLISH not allowed');
}
```

---

### Phase 3 : Migration Frontend

#### 3.1 Intégration React

```typescript
// apps/frontend/src/components/document-editor/DocumentContext.tsx
import { useMachine } from '@xstate/react';
import { documentMachine } from '@playground/fsm';

export function DocumentProvider({ children, initialDocument }) {
  const [state, send] = useMachine(documentMachine, {
    context: {
      workflowId: initialDocument.id,
      complianceStatus: initialDocument.complianceStatus,
      workStatus: initialDocument.workStatus,
      onlineStatus: initialDocument.onlineStatus,
      editorialRecordId: initialDocument.editorialRecordId,
    },
  });

  const canPublish = state.can({ type: 'PUBLISH' });
  const canArchive = state.can({ type: 'ARCHIVE' });

  return (
    <DocumentContext.Provider value={{ state, send, canPublish, canArchive }}>
      {children}
    </DocumentContext.Provider>
  );
}
```

#### 3.2 UI Conditionnelle

```tsx
// apps/frontend/src/components/document-editor/PublishButton.tsx
import { useDocument } from './DocumentContext';

export function PublishButton() {
  const { canPublish, send } = useDocument();

  return (
    <Button
      disabled={!canPublish}
      onClick={() => send({ type: 'PUBLISH' })}
    >
      Publier
    </Button>
  );
}
```

---

### Phase 4 : Synchronisation DB

#### 4.1 Triggers DB → FSM

**Problème** : Les triggers DB changent l'état sans passer par la FSM.

**Solution** : Utiliser Supabase Realtime pour synchroniser :

```typescript
// apps/frontend/src/hooks/useDocumentSync.ts
import { useEffect } from 'react';
import { supabase } from '@playground/supabase';

export function useDocumentSync(documentId: string, send: (event: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`document:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'editorial_records',
          filter: `workflow_id=eq.${documentId}`,
        },
        (payload) => {
          // Synchroniser l'état FSM avec la DB
          send({
            type: 'SYNC',
            workStatus: payload.new.work_status,
            onlineStatus: payload.new.online_status,
          });
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [documentId, send]);
}
```

#### 4.2 FSM → DB

```typescript
// packages/fsm/src/actions/persist-to-db.ts
import { assign } from 'xstate';

export const persistToDb = (supabase: SupabaseClient) => ({
  persistWorkStatus: async ({ context }) => {
    await supabase
      .from('editorial_records')
      .update({ work_status: context.workStatus })
      .eq('workflow_id', context.workflowId);
  },
  persistOnlineStatus: async ({ context }) => {
    await supabase
      .from('editorial_records')
      .update({ online_status: context.onlineStatus })
      .eq('workflow_id', context.workflowId);
  },
});
```

---

## 🔄 Gestion des Transitions Atomiques

### Le Problème

Certaines transitions déclenchent automatiquement d'autres changements d'état :
- **PUBLISH** → `online_status = 'published'` ET `work_status = null`
- **ARCHIVE** → `online_status = 'archived'` ET `work_status = null`
- **TOGGLE non_compliant** → `compliance_status = 'non_compliant'` ET `online_status = 'archived'`

### Solution 1 : Actions Atomiques (Recommandée)

XState permet de définir **plusieurs actions dans une seule transition** :

```typescript
// packages/fsm/src/machines/document-machine.ts
export const documentMachine = setup({
  actions: {
    // Action 1 : Changer online_status
    setOnlineStatusToPublished: assign({
      onlineStatus: () => 'published',
    }),

    // Action 2 : Reset work_status
    clearWorkStatus: assign({
      workStatus: () => null,
    }),

    // Action 3 : Changer online_status + work_status (atomique)
    publishDocument: assign({
      onlineStatus: () => 'published',
      workStatus: () => null,  // ← Automatique !
    }),

    archiveDocument: assign({
      onlineStatus: () => 'archived',
      workStatus: () => null,  // ← Automatique !
    }),
  },
}).createMachine({
  states: {
    editing: {
      on: {
        PUBLISH: {
          guard: 'canPublish',
          target: 'published',
          actions: ['publishDocument'],  // ← Une seule action qui fait tout
        },
      },
    },
    published: {
      on: {
        ARCHIVE: {
          guard: 'canArchive',
          target: 'archived',
          actions: ['archiveDocument'],  // ← Une seule action qui fait tout
        },
      },
    },
  },
});
```

**Avantages** :
- ✅ Atomique : les deux changements se font ensemble
- ✅ Impossible d'avoir un état incohérent
- ✅ Testable unitairement
- ✅ Lisible : une action = une intention métier

---

### Solution 2 : Actions Composées

Pour des transitions plus complexes, on peut composer plusieurs actions :

```typescript
export const documentMachine = setup({
  actions: {
    setOnlineStatusToPublished: assign({
      onlineStatus: () => 'published',
    }),
    clearWorkStatus: assign({
      workStatus: () => null,
    }),
  },
}).createMachine({
  states: {
    editing: {
      on: {
        PUBLISH: {
          guard: 'canPublish',
          target: 'published',
          actions: [
            'setOnlineStatusToPublished',  // Action 1
            'clearWorkStatus',             // Action 2
            // Action 3, 4, 5... si besoin
          ],
        },
      },
    },
  },
});
```

**Avantages** :
- ✅ Actions réutilisables individuellement
- ✅ Ordre d'exécution garanti
- ✅ Debug plus facile (chaque action est loggée)

---

### Solution 3 : Transitions en Cascade (Cas Avancés)

Pour des workflows complexes avec plusieurs étapes :

```typescript
export const documentMachine = setup({
  actions: {
    archiveTranslations: async ({ context }) => {
      // Cascade : archiver toutes les traductions
      await supabase
        .from('translation_records')
        .update({ online_status: 'archived' })
        .eq('workflow_id', context.workflowId);
    },
  },
}).createMachine({
  states: {
    published: {
      on: {
        ARCHIVE: {
          target: 'archiving',  // ← État intermédiaire
          actions: ['archiveDocument'],
        },
      },
    },
    archiving: {
      // État transitoire pour les opérations async
      invoke: {
        src: 'archiveTranslations',
        onDone: 'archived',
        onError: 'error',
      },
    },
    archived: {
      // État final
    },
  },
});
```

**Quand utiliser** :
- Opérations asynchrones (API calls, DB updates)
- Workflows multi-étapes
- Rollback possible si erreur

---

### Exemple Complet : Toggle Compliance

```typescript
// packages/fsm/src/machines/document-machine.ts
export const documentMachine = setup({
  actions: {
    toggleComplianceStatus: assign({
      complianceStatus: ({ context }) =>
        context.complianceStatus === 'compliant' ? 'non_compliant' : 'compliant',
    }),

    // Si on passe à non_compliant → auto-archive
    autoArchiveIfNonCompliant: assign({
      onlineStatus: ({ context }) => {
        if (context.complianceStatus === 'non_compliant') {
          return 'archived';  // ← Automatique !
        }
        return context.onlineStatus;  // Sinon, on ne change pas
      },
    }),
  },
}).createMachine({
  states: {
    classified: {
      on: {
        TOGGLE_COMPLIANCE: {
          guard: 'canToggle',
          actions: [
            'toggleComplianceStatus',
            'autoArchiveIfNonCompliant',  // ← Cascade automatique
          ],
          // Reste dans le même état (transition interne)
        },
      },
    },
  },
});
```

**Résultat** :
- `compliant → non_compliant` → `online_status` passe à `'archived'`
- `non_compliant → compliant` → `online_status` inchangé

---

### Règles de Gestion Centralisées

Toutes les règles de cascade sont définies **une seule fois** dans la machine :

| Transition | Effet en Cascade | Règle |
|------------|------------------|-------|
| `PUBLISH` | `work_status → null` | Toujours |
| `ARCHIVE` | `work_status → null` | Toujours |
| `TOGGLE → non_compliant` | `online_status → archived` | Si non_compliant |
| `ARCHIVE document` | `translation_records → archived` | Cascade DB |
| `RE-PUBLISH` | `work_status → null` | Toujours |

**Code centralisé** :

```typescript
// packages/fsm/src/rules/cascade-rules.ts
export const cascadeRules = {
  onPublish: {
    workStatus: null,  // Toujours
  },
  onArchive: {
    workStatus: null,  // Toujours
  },
  onNonCompliant: {
    onlineStatus: 'archived',  // Automatique
  },
} as const;
```

---

### Tests des Transitions Atomiques

```typescript
// packages/fsm/src/machines/document-machine.test.ts
import { createActor } from 'xstate';
import { documentMachine } from './document-machine';

describe('Document Machine - Cascade Transitions', () => {
  it('should clear work_status when publishing', () => {
    const actor = createActor(documentMachine, {
      input: {
        workStatus: 'draft',
        onlineStatus: null,
        complianceStatus: 'compliant',
      },
    });

    actor.start();
    actor.send({ type: 'PUBLISH' });

    expect(actor.getSnapshot().context.workStatus).toBe(null);
    expect(actor.getSnapshot().context.onlineStatus).toBe('published');
  });

  it('should auto-archive when toggling to non_compliant', () => {
    const actor = createActor(documentMachine, {
      input: {
        complianceStatus: 'compliant',
        onlineStatus: 'published',
      },
    });

    actor.start();
    actor.send({ type: 'TOGGLE_COMPLIANCE' });

    expect(actor.getSnapshot().context.complianceStatus).toBe('non_compliant');
    expect(actor.getSnapshot().context.onlineStatus).toBe('archived');
  });
});
```

---

## 📋 Checklist de Migration

### Backend
- [ ] Créer package `@playground/fsm`
- [ ] Définir `documentMachine` (compliance, work, online)
- [ ] Définir `translationMachine`
- [ ] Créer guards partagés (`canPublish`, `canArchive`, `canToggle`)
- [ ] Refactor `toggle-status.ts`
- [ ] Refactor `publish-document.ts`
- [ ] Refactor `archive-document.ts`
- [ ] Refactor `save-document.ts`
- [ ] Ajouter tests unitaires FSM
- [ ] Valider que les triggers DB sont compatibles

### Frontend
- [ ] Installer `@xstate/react`
- [ ] Intégrer FSM dans `DocumentContext`
- [ ] Intégrer FSM dans `TranslationContext`
- [ ] Refactor `PublishButton` (utiliser `canPublish`)
- [ ] Refactor `ArchiveButton` (utiliser `canArchive`)
- [ ] Ajouter synchronisation Realtime
- [ ] Tester UI avec transitions FSM

### Base de Données
- [ ] Documenter les triggers existants
- [ ] Identifier les conflits potentiels
- [ ] Planifier migration progressive

---

## 🎨 Visualisation

XState fournit des outils de visualisation :

```bash
# Installer l'inspecteur
pnpm add @xstate/inspect --filter @playground/fsm

# Lancer le visualiseur
npx xstate-visualize
```

**Exemple de diagramme généré** :
```
https://stately.ai/registry/editor/xxxxx
```

---

## 📚 Ressources

- [XState v5 Documentation](https://xstate.js.org/docs/)
- [XState + React](https://xstate.js.org/docs/packages/xstate-react/)
- [State Machines Best Practices](https://kentcdodds.com/blog/finite-state-machines-with-react)
- [XState Catalog](https://xstate-catalogue.com/) - Exemples de patterns

---

## 🚀 Prochaines Étapes

1. **Valider l'approche** avec Luis
2. **Créer un POC** sur un workflow simple (toggle compliance)
3. **Mesurer l'impact** sur les performances
4. **Étendre progressivement** aux autres workflows
5. **Former l'équipe** sur XState

---

## ⚠️ Risques et Mitigations

| Risque | Mitigation |
|--------|------------|
| Courbe d'apprentissage XState | Commencer par un POC simple |
| Conflits avec triggers DB | Documenter, tester, synchroniser via Realtime |
| Performance (sérialisation) | Benchmarks, lazy loading des machines |
| Duplication temporaire | Migration progressive, feature flags |

---

## 💡 Notes Additionnelles

### Pourquoi centraliser ?

**Problèmes actuels** :
- TODO comments dans 3+ fichiers indiquant le besoin
- Logique dupliquée entre front et back
- Difficile à tester exhaustivement
- Pas de visualisation des états possibles

**Bénéfices attendus** :
- ✅ Règles métier centralisées
- ✅ Tests unitaires exhaustifs
- ✅ Documentation visuelle (diagrammes)
- ✅ Type-safe (TypeScript)
- ✅ Débogage facilité (time-travel debugging)

### Impact sur les Triggers DB

Les triggers DB automatiques restent nécessaires pour :
- Création initiale (`handle_new_rco_record`)
- Propagation automatique (`handle_new_editorial_record`)

Mais les transitions métier doivent passer par la FSM pour garantir la cohérence.

---

**Fin du document**
