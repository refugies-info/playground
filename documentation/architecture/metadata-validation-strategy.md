# ADR: Metadata Validation Strategy (3 Layers)

> **Status**: Accepted — Layer 1 implemented, Layers 2–3 deferred.
> **Date**: 2026-02-19

## Context

The metadata pipeline ingests AI-generated metadata (YAML frontmatter from a Letta agent), stores it, presents it to human editors, and eventually publishes it to refugies.info where it must conform to a Typegoose `Dispositif` model.

The AI output is **close** to the target format but not exact (e.g. `location` as array vs string, `null` vs empty array, `price.values` as strings vs numbers). Strict validation at ingestion caused data loss: the parser returned `status: "incomplete"` and `content: ""`, making the report useless.

## Decision

Validate metadata at **three layers** with increasing strictness:

### Layer 1 — Ingestion (implemented)
- **Schema**: `z.object({ metadata_ri: z.record(z.unknown()) }).passthrough()`
- **Behavior**: Accept any YAML that has a `metadata_ri` object. Store everything.
- **File**: `packages/agents/src/schemas.ts` → `MetadataMetadataSchema`

### Layer 2 — Publication (future)
- **Schema**: Strict, calqued on Typegoose `Metadatas` / `Poi` / `DispositifContent`
- **Behavior**: Block publication if metadata is invalid. Return clear error to UI.
- **File**: `packages/agents/src/publication-schemas.ts` (to create)
- **Integration point**: `refugies-info.ts` adapter `buildPayload()`

### Layer 3 — Editor (future)
- **Schema**: Same as Layer 2, used in `safeParse` mode
- **Behavior**: Show ✅/⚠️/❌ per field, let human edit before publication
- **File**: `MetadataView.tsx` (to update)

## Key Principle

> The closer to the AI, the more tolerant. The closer to publication, the more strict.

```
AI → [passthrough] → letta_reports → [advisory] → editor → [strict gate] → refugies.info
```
