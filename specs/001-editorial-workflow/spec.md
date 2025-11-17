# Feature Specification: AI-Powered Editorial Workflow (Content Playground)

**Feature Branch**: `001-editorial-workflow`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "AI-assisted editorial workflow with human-in-the-loop process for content publication pipeline for Refugies.info"

## Project Context

This feature implements a complete AI-assisted editorial workflow system for Refugies.info, enabling content managers and editors to efficiently process, classify, rewrite, and publish content with AI assistance while maintaining full human oversight and control.

The system includes a **data ingestion pipeline** that normalizes heterogeneous upstream sources (starting with RCO during POC, expandable to DI and others) into relational structures, followed by a linear four-stage editorial pipeline: **Import → Sort → Rewrite → Metadata Mapping → Export**, with human validation at each critical decision point.

### Development Phases

- **POC Phase** (Sprints 1-2, 1 month): Validate full workflow with real editorial team members. Focus on learning and iteration. Skip automated tests and minimize AI documentation. Use Supabase free tier, Letta Cloud, manual Vercel deployment. Implement Supabase Auth by step 2 for multi-user testing.

- **MVP Phase** (Post-POC): Add full RBAC, CI/CD pipeline, observability, and UI polish based on POC learnings. Still no comprehensive testing or detailed documentation.

- **V1 Phase** (Post-MVP, production-ready): Add comprehensive test suites, detailed AI agent documentation, production-grade monitoring, and performance optimization.

### Tech Stack

- **Frontend**: Next.js (App Router) with Tailwind CSS v4, Radix UI primitives, and shadcn/ui components
- **Backend**: Letta Cloud with custom tools wrapping Supabase Client (direct SQL queries, no ORM)
- **Database**: Supabase with direct SQL queries via Supabase Client
- **Monorepo**: Turborepo with /apps (frontend, backend) and /packages (shared, supabase-client, database)
- **Authentication**: Supabase Auth with role-based access control (editor, reviewer, admin)
- **Deployment**: Vercel (frontend), Letta Cloud (orchestration), Supabase (database/auth)

### Data Ingestion Architecture

The system MUST include a data ingestion pipeline that transforms heterogeneous upstream sources into normalized relational structures:

- **POC Phase**: Deliver end-to-end ingestion job for RCO source (extract, validate, normalize, load into Supabase with provenance tracking)
- **Multi-source readiness**: Design ingestion contracts so DI and future sources plug in without rewriting downstream logic
- **Provenance tracking**: Every record MUST persist `source_system`, `source_record_id`, and ingestion timestamps for audit trail and AI context
- **Idempotent operations**: Ingestion jobs MUST support incremental updates and deduplication; retries produce no duplicate rows
- **Error surfacing**: Validation errors MUST be logged with actionable metrics so editors know when a source failed to import
- **Schema flexibility**: Supabase schema remains relational yet flexible (lookup tables/JSON columns only when necessary); each entity maps back to raw source structures

### Multi-Language & Versioning Database Schema (POC Foundation)

Even though translation implementation is deferred to MVP2, the database schema MUST be designed during POC to support multi-language content and revision versioning:

- **Language tracking**: All content tables MUST include `language_code` column (default: 'fr' for French source)
- **Translation lineage**: All content tables MUST include `source_revision_id` column (references `content_revisions.id` for tracking which source revision a translation is based on)
- **Revision language tracking**: `content_revisions` table MUST include `language_code` column to track which language each revision belongs to
- **Revision source tracking**: `content_revisions` table MUST include `source_revision_id` column (NULL for source language revisions, set for translation revisions)
- **Uniqueness constraint**: Composite unique constraint on `(content_id, language_code, revision_number)` to prevent duplicate revisions per language
- **Query performance**: Indexes on `(language_code, created_at)` for efficient language-specific queries
- **Schema documentation**: Database schema documentation MUST explain translation lineage concept (source revisions → translation revisions)
- **POC constraint**: POC MUST use `language_code = 'fr'` exclusively; no translation UI or workflows during POC/MVP1

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Ingest and Import Data from RCO and Config Sources (Priority: P0) 🎯 POC Foundation

As a system operator, I want to ingest data from automated API streams (RCO) and config file-based manual sources into a unified normalized relational structure with full provenance tracking, so that the editorial workflow has clean, trustworthy input data during POC validation.

**Why this priority**: This is the foundational prerequisite for the entire system. Without normalized, deduplicated data with clear provenance from POC sources, all downstream AI workflows and editorial processes are unreliable. This story must be completed first during POC.

**Independent Test**: Can be fully tested by: (1) running the RCO ingestion job automatically and verifying records are extracted, validated, normalized with provenance; (2) loading data source configurations from YAML/JSON config files and verifying all items appear in browsable list; (3) verifying both sources produce idempotent results with no duplicates on retry.

**Acceptance Scenarios**:

1. **Given** I have raw data from an automated source (RCO API stream), **When** the ingestion job is triggered automatically (polling, CRON, or webhook), **Then** all valid records are extracted, normalized, and loaded into Supabase with provenance metadata (source_system="rco", source_record_id, timestamp)
2. **Given** I have data source configurations in YAML/JSON config files, **When** the ingestion system reads the config files, **Then** all configured sources are loaded, validated, normalized, and loaded into Supabase with provenance metadata (source_system="config_file", source_record_id = config source ID + record ID)
3. **Given** I have ingested data from any POC source, **When** I navigate to the content browser, **Then** I see a unified list of all items with filtering and search, and I can trace each record back to its original source via `source_system` and `source_record_id` fields
4. **Given** the ingestion encounters validation errors, **When** the job completes, **Then** error logs are generated with specific field-level issues and actionable remediation steps
5. **Given** I re-run ingestion with the same source data, **When** the job completes, **Then** no duplicate rows are created (idempotent operation)

---

### User Story 1 - AI-Assisted Quality Gating & Flagging (Priority: P1) 🎯 POC

As an editor, I want AI to automatically assess data quality and completeness of ingested content, flag items as "accepted" or "rejected", and show me the reasoning behind each decision, so that I can quickly identify which content is ready for editorial workflow and which needs source remediation.

**Why this priority**: This story introduces AI-driven quality gating that prevents low-quality data from wasting editorial effort. It builds on the ingestion foundation (P0) and acts as a filter before editorial work begins. Editors gain visibility into AI reasoning and can override flags.

**Independent Test**: Can be tested by ingesting content with varying quality levels, triggering AI quality assessment, verifying that items are flagged as "accepted" or "rejected" with reasoning, and confirming that editors can review and manually re-flag items.

**Acceptance Scenarios**:

1. **Given** I have ingested content items from RCO, **When** the Letta classifier agent automatically analyzes them, **Then** each item is flagged as "accepted" (sufficient quality to proceed) or "rejected" (insufficient quality, needs source remediation)
2. **Given** AI has flagged a content item, **When** I review the flag, **Then** I can see the AI's reasoning and justification for the accept/reject decision
3. **Given** I disagree with an AI flag, **When** I manually review the item and re-flag it with my own justification, **Then** my flag override is saved with my editor attribution and timestamp
4. **Given** I have flagged content, **When** I filter by flag status (accepted/rejected), **Then** I see only items matching my filter criteria and can bulk-review items by status

---

### User Story 2 - AI-Assisted Content Rewriting (Priority: P2) 🎯 POC

As an editor, I want to request AI-generated rewrites of content in plain language, review the suggestions side-by-side with the original, and approve or modify them, so that I can produce clear, accessible content faster.

**Why this priority**: This is the core value proposition of AI assistance but depends on having quality-gated content (P2). It delivers the most time savings and validates the editorial workflow end-to-end during POC.

**Independent Test**: Can be tested by selecting accepted-flagged content items, requesting a rewrite, and verifying that the AI generates a plain-language version that can be reviewed, edited, and approved independently of other workflow stages.

**Acceptance Scenarios**:

1. **Given** I am viewing an accepted-flagged content item, **When** I click "Request AI Rewrite", **Then** the AI generates a plain-language version displayed side-by-side with the original
2. **Given** I am reviewing an AI-generated rewrite, **When** I make inline edits to the suggested text, **Then** my changes are saved as a new draft version with my editor attribution
3. **Given** I have reviewed and edited a rewrite, **When** I click "Approve Rewrite", **Then** the content status changes to "Approved" and is ready for metadata mapping
4. **Given** I am unsatisfied with an AI rewrite, **When** I click "Reject and Request New Rewrite", **Then** the AI generates an alternative version using different phrasing

---

### User Story 3 - Map and Validate Document Metadata (Priority: P3) 🎯 POC

As an editor, I want to validate and map document metadata (pricing, dates, public status, related structures) before publishing, so that content is correctly contextualized for publication and integration with Refugies.info systems.

**Why this priority**: Metadata validation is a mandatory pre-publication step per human-in-the-loop principle. It ensures content is properly structured for downstream publishing systems.

**Independent Test**: Can be tested by selecting approved content items, validating metadata fields, and verifying that export is blocked if metadata is incomplete.

**Acceptance Scenarios**:

1. **Given** I have approved content items, **When** I navigate to the metadata mapping interface, **Then** I see all required metadata fields with current values (or empty if not set)
2. **Given** I am mapping metadata, **When** I update metadata fields, **Then** my changes are saved with my editor attribution and timestamp
3. **Given** I have incomplete metadata, **When** I attempt to export, **Then** the system blocks export and shows which metadata fields are required
4. **Given** I have completed metadata mapping, **When** I mark metadata as validated, **Then** the content is ready for export

---

### User Story 4 - Validate and Export Approved Content (Priority: P4) 🎯 POC

As a reviewer, I want to validate approved content meets quality standards and export it to the publication database, so that finalized content can be integrated into the Refugies.info publishing workflow.

**Why this priority**: This completes the end-to-end POC workflow and validates that content can move from editorial approval through to publication. It demonstrates the full value of the system.

**Independent Test**: Can be tested by selecting approved content items, running validation checks, and verifying that valid items are exported to Supabase with all metadata and audit trail information intact.

**Acceptance Scenarios**:

1. **Given** I have metadata-validated content items, **When** I select them for export, **Then** the system validates each item has required fields (title, body, category, tags, metadata)
2. **Given** content passes validation, **When** I trigger export, **Then** each item is written to the publication database with full audit trail (original source, AI modifications, human approvals, flag decisions)
3. **Given** content fails validation, **When** I review the validation report, **Then** I see specific error messages for each missing or invalid field
4. **Given** I have exported content, **When** I view the export history, **Then** I see a log of all exported items with timestamps and editor attribution

---

### User Story 5 - Track Workflow Progress and Analytics (Priority: P5) 🎯 POC

As a team lead, I want to view dashboard analytics showing content volume at each workflow stage and editor productivity metrics, so that I can measure workflow efficiency and identify bottlenecks.

**Why this priority**: This provides operational visibility during POC validation and helps the team understand workflow performance with real editorial team members.

**Independent Test**: Can be tested by processing content through all POC workflow stages and verifying that the dashboard displays accurate counts, completion rates, and time-to-completion metrics.

**Acceptance Scenarios**:

1. **Given** content is distributed across POC workflow stages, **When** I view the workflow dashboard, **Then** I see item counts for each stage (Ingested, Quality-Gated, Imported, Rewritten, Metadata-Validated, Approved, Exported)

---

### User Story 6 - AI-Assisted Iterative Refinement via Chatbot Discussion (Priority: P6) 🎯 POC

As an editor, I want to discuss content rewrites with an AI chatbot, request alternative suggestions, and iteratively refine the output through conversation, so that I can achieve the exact tone and clarity I need without manual rewriting.

**Why this priority**: This enhances the rewrite workflow by enabling conversational refinement. Instead of binary accept/reject, editors can request specific adjustments (tone, length, terminology) and get AI suggestions in real-time.

**Independent Test**: Can be tested by selecting a content item, requesting a rewrite, then engaging in a multi-turn conversation with the AI agent to request alternative phrasings, tone adjustments, or specific terminology changes, and verifying that suggestions are generated and tracked.

**Acceptance Scenarios**:

1. **Given** I have an AI-generated rewrite, **When** I request a specific adjustment (e.g., "make it more formal" or "simplify the terminology"), **Then** the AI generates an alternative version addressing my feedback
2. **Given** I am in a rewrite refinement conversation, **When** I request multiple iterations, **Then** each iteration is tracked as a separate version with my request and the AI's response
3. **Given** I have refined a rewrite through multiple iterations, **When** I select the best version, **Then** that version is marked as approved and ready for metadata mapping
4. **Given** I am unsatisfied with all AI suggestions, **When** I request manual editing mode, **Then** I can edit the content directly without further AI involvement

---

### User Story 7 - Manage Content Publication States (Priority: P7) 🎯 POC

As an editor, I want to manage the publication state of content items (draft, published, archived), so that I can control when content becomes visible and manage the lifecycle of published items.

**Why this priority**: This enables editors to save work-in-progress content as drafts, publish finalized content, and archive outdated content. It provides full content lifecycle management beyond the linear workflow.

**Independent Test**: Can be tested by creating a content item, saving it as draft, publishing it, and then archiving it, verifying that state transitions are tracked and that published/archived items are visible in appropriate views.

**Acceptance Scenarios**:

1. **Given** I am editing a content item, **When** I click "Save as Draft", **Then** the content is saved with state="draft" and is not visible to end users
2. **Given** I have a draft content item with complete metadata, **When** I click "Publish", **Then** the content state changes to "published" and is exported to the publication database
3. **Given** I have published content, **When** I click "Archive", **Then** the content state changes to "archived" and is hidden from the active content list but remains in history
4. **Given** I am viewing the content list, **When** I filter by state (draft/published/archived), **Then** I see only items matching the selected state
5. **Given** I have archived content, **When** I click "Restore", **Then** the content state changes back to "published" and is visible again

---

### Edge Cases

- **Invalid config files**: System MUST validate config file format and provide specific error messages without crashing. Invalid configs are rejected with clear field-level error indicators.
- **Empty or malformed import files (MVP)**: File upload and web form validation deferred to MVP phase. During POC, only config file-based sources are supported.
- **AI service unavailable**: System MUST retry failed Letta operations automatically with exponential backoff (up to 3 retries). If all retries fail, editors can manually retry or complete the task manually (fallback to manual workflow).
- **Concurrent editing conflicts**: System MUST use pessimistic locking - first editor locks the item; other editors must wait or are blocked from editing until the lock is released.
- **Large batch operations**: System MUST support batch operations of 100-500 items during POC. Operations are queued and processed in batches with progress indicators. Limit can be increased in MVP based on learnings.
- **Partial workflow completion**: System MUST allow export of any content with minimum required fields, regardless of workflow stage completion. Content can be imported and sorted without rewrite, then exported.
- **Data retention and deletion**: System MUST retain all draft versions and rejected AI suggestions indefinitely for audit trail, recovery, and analytics purposes. No automatic deletion of transient data.

## Requirements *(mandatory)*

### Functional Requirements

#### Data Ingestion & Import Stage (Sprint 1, POC Foundation)

##### Automated Source Ingestion (API Streams)

- **FR-001**: System MUST include an end-to-end ingestion pipeline that automatically extracts data from RCO API stream, validates fields, normalizes records into Supabase tables, and logs provenance
- **FR-002**: System MUST trigger ingestion automatically when new RCO data is detected (polling, CRON, or webhook, TBD)
- **FR-003**: System MUST support idempotent ingestion jobs—retrying the same source data produces no duplicate rows

##### Manual Source Ingestion (Config Files - POC)

- **FR-004**: System MUST load data source configurations from YAML/JSON config files (e.g., `/config/sources.yaml`)
- **FR-005**: System MUST parse config files to extract source connection parameters, field mappings, and validation rules
- **FR-006**: System MUST validate config file format and source definitions; reject invalid configs with specific error messages

##### Unified Ingestion & Normalization

- **FR-007**: System MUST persist `source_system`, `source_record_id`, and ingestion timestamp for every ingested record (from any source type) to maintain audit trail and enable source traceability
- **FR-008**: System MUST normalize all ingested data (from RCO API streams and config file sources during POC) into a unified relational structure in Supabase
- **FR-009**: System MUST design ingestion contracts so additional sources (DI, future providers, new file formats) can plug in without rewriting downstream logic
- **FR-010**: System MUST surface ingestion errors and metrics to editors so they know when a source failed to import
- **FR-011**: System MUST display all ingested content in a unified browsable list view with search and filter capabilities, regardless of source type

#### Quality Gating & Flagging Stage (Sprint 1, POC)

- **FR-012**: System MUST invoke Letta classifier agent to automatically analyze newly ingested content items and assess data quality/completeness
- **FR-013**: System MUST flag each content item as "accepted" (sufficient quality to proceed to editorial workflow) or "rejected" (insufficient quality, needs source remediation)
- **FR-014**: System MUST store AI reasoning/justification for each flag decision and make it visible to editors
- **FR-015**: System MUST allow editors to review AI flags, see the reasoning, and manually override flags with their own justification and timestamp
- **FR-016**: System MUST track flag status (AI-Flagged, Human-Reviewed, Human-Overridden) for each content item and log all flag actions with editor attribution
- **FR-017**: System MUST provide filtering by flag status (accepted/rejected) so editors can bulk-review items by quality gate status

#### Rewrite Stage (Sprint 2, POC)

- **FR-018**: System MUST invoke Letta rewrite agent to generate plain-language versions of accepted-flagged content
- **FR-019**: System MUST display original and AI-rewritten content side-by-side for comparison
- **FR-020**: System MUST allow editors to make inline edits to AI-generated rewrites
- **FR-021**: System MUST support multiple rewrite iterations (reject and request alternative version)
- **FR-022**: System MUST track rewrite status (Original, AI-Draft, Edited, Approved, Rejected) for each content item

#### AI-Assisted Iterative Refinement via Chatbot (Sprint 2, POC)

- **FR-023**: System MUST enable editors to request specific rewrite adjustments via conversational interface (e.g., "make it more formal", "simplify terminology")
- **FR-024**: System MUST invoke Letta rewrite agent to generate alternative versions based on editor feedback
- **FR-025**: System MUST track all refinement iterations as separate versions with editor request and AI response
- **FR-026**: System MUST allow editors to select the best version from refinement iterations and mark it as approved
- **FR-027**: System MUST provide fallback to manual editing mode if editors are unsatisfied with all AI suggestions

#### Content Publication State Management (Sprint 2, POC)

- **FR-028**: System MUST support content publication states: draft, published, archived
- **FR-029**: System MUST allow editors to save content as draft (not visible to end users)
- **FR-030**: System MUST allow editors to publish draft content (exported to publication database and visible)
- **FR-031**: System MUST allow editors to archive published content (hidden from active list but retained in history)
- **FR-032**: System MUST allow editors to restore archived content back to published state
- **FR-033**: System MUST provide filtering by publication state (draft/published/archived) in content list
- **FR-034**: System MUST track state transitions with timestamp and editor attribution

#### Metadata Mapping Stage (Sprint 2, POC)

- **FR-035**: System MUST provide metadata mapping interface for editors to validate and map document metadata before export
- **FR-036**: System MUST track which metadata fields were validated/mapped by which editor and when
- **FR-037**: System MUST block export if required metadata fields are incomplete or unmapped
- **FR-038**: System MUST support configurable metadata schema to accommodate different content types

#### Export Stage (Sprint 2, POC)

- **FR-039**: System MUST validate content items have required fields before allowing export
- **FR-040**: System MUST write approved content to Supabase publication tables with full audit trail
- **FR-041**: System MUST include metadata in exports: original source, AI modifications applied, human approvals, flag decisions, version history
- **FR-042**: System MUST prevent duplicate exports of the same content version
- **FR-043**: System MUST provide export history log showing all exported items with timestamps

#### Dashboard Analytics (Sprint 2, POC)

- **FR-044**: System MUST display dashboard showing content volume at each POC workflow stage (Ingested, Quality-Gated, Imported, Rewritten, Metadata-Validated, Approved, Exported)
- **FR-045**: System MUST calculate and display editor productivity metrics (items processed per editor, average time per stage, approval rates)
- **FR-046**: System MUST display time-to-completion metrics for content items through each workflow stage

#### Human-in-the-Loop Requirements (POC)

- **FR-047**: System MUST require explicit human approval before any AI suggestion is finalized
- **FR-048**: System MUST never auto-publish or auto-export content without human validation
- **FR-049**: System MUST display clear visual indicators distinguishing AI-generated content from human-edited content
- **FR-050**: System MUST allow editors to override any AI suggestion at any workflow stage

#### Audit and Traceability Requirements (POC)

- **FR-051**: System MUST log every content state change with action type, actor (human or AI agent), timestamp, and previous/new state
- **FR-052**: System MUST maintain version history for all content items showing evolution through POC workflow stages
- **FR-053**: System MUST attribute all actions to specific users or AI agents for accountability
- **FR-054**: System MUST provide audit trail query interface for compliance and debugging

#### Content Revision & Rollback Requirements (POC)

- **FR-055**: System MUST create an immutable revision record for every content mutation (AI rewrite, human edit, flag override)
- **FR-056**: System MUST display revision timeline with chronological list of all changes, actor, and timestamp
- **FR-057**: System MUST provide side-by-side diff view comparing any two revisions
- **FR-058**: System MUST allow one-click rollback to any prior version with confirmation dialog
- **FR-059**: Rollback action MUST create a new revision record (preserving full history, not deleting)
- **FR-060**: System MUST make revision data queryable for analytics (e.g., average revisions per content item, acceptance rates)

### Key Entities

- **Ingestion Record**: Represents a raw data record extracted from an upstream source (RCO, DI, etc.) and normalized into relational structures. Key attributes: unique ID, source_system, source_record_id, ingestion timestamp, raw data snapshot, validation status, error logs if validation failed.

- **Content Item**: Represents a single piece of content moving through the workflow. Key attributes: unique ID, language_code (default: 'fr'), source_revision_id (for translation lineage), title, body text, source metadata (including link to ingestion record), current workflow stage, quality flag status (accepted/rejected), AI flag reasoning, human flag overrides, rewrite versions, approval status, audit trail.

- **Quality Flag**: Represents AI quality assessment decision for an ingested item. Key attributes: flag ID, content item ID, flag status (accepted/rejected), AI reasoning/justification, flag timestamp, flag actor (AI or human), human override justification if applicable.

- **Workflow Stage**: Represents one of the POC pipeline stages (Ingestion, Quality Gating, Import, Rewrite, Metadata Mapping, Export). Tracks which stage each content item is currently in and completion status.

- **AI Action Log**: Records every AI agent invocation. Key attributes: action ID, agent type (classifier/rewrite/validator), content item ID, input provided to agent, output generated by agent, timestamp, confidence scores.

- **Editor Action Log**: Records every human edit or approval. Key attributes: action ID, editor user ID, content item ID, action type (classify/edit/approve/reject), changes made, timestamp.

- **Content Version**: Represents a snapshot of content at a specific point in time. Key attributes: version ID, content item ID, version number, content body, metadata, created timestamp, created by (user or agent).

- **Content Revision**: Represents an immutable record of every content mutation. Key attributes: revision ID, content item ID, language_code (tracks which language this revision belongs to), source_revision_id (NULL for source language, set for translations), revision number, action type (rewrite/edit/classification), previous state, new state, change summary, created timestamp, created by (user or agent).

- **Export Record**: Tracks content that has been exported to publication database. Key attributes: export ID, content item ID, exported version ID, export timestamp, exporting user, destination table/system.

- **User/Editor**: Represents a human user of the system. Key attributes: user ID, name, role (content manager/editor/reviewer/team lead), email. Authentication via Supabase Auth with role-based access control (editor, reviewer, admin).

## Clarifications

### Session 2025-11-13

- Q: Metadata schema definition → A: TBD - to be defined and documented soon (pricing, dates, public status, related structures, etc.)
- Q: Concurrent editing conflict resolution → A: Pessimistic locking - First editor locks the item; others must wait or are blocked
- Q: AI service failure recovery → A: Automatic retry with exponential backoff + manual retry option (up to 3 retries; fallback to manual workflow)
- Q: Scalability limits for batch operations → A: 100-500 items per batch during POC; can increase in MVP based on learnings
- Q: Data retention policy for drafts/rejected suggestions → A: Indefinite retention - Keep all drafts and rejected suggestions forever for audit trail and recovery

### Session 2025-11-17

- Q: Data ingestion pipeline scope → A: POC must deliver end-to-end RCO ingestion (extract, validate, normalize, load with provenance). Design for multi-source expansion (DI, others) without rewriting downstream logic. Every record must persist source_system, source_record_id, and ingestion timestamp.
- Q: Data ingestion source management during POC → A: POC uses config files (YAML/JSON) for manual source definitions, not web forms. File uploads and web form-based source management deferred to MVP phase. Config files define source connection parameters, field mappings, and validation rules.
- Q: Multi-language database schema during POC → A: Database schema MUST be designed during POC to support multi-language content (language_code, source_revision_id columns) even though translation implementation is deferred to MVP2. POC uses French (fr) exclusively; no translation UI or workflows. Schema design enables seamless scaling to translation workflows in MVP2 without data migration.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes (POC Focus)

#### Data Ingestion (P0)

- **SC-001**: RCO ingestion pipeline successfully extracts, validates, normalizes, and loads 1000+ records into Supabase with 100% provenance tracking (source_system, source_record_id, timestamp)
- **SC-002**: Ingestion job is idempotent—re-running the same source data produces zero duplicate rows
- **SC-003**: Ingestion validation errors are logged with field-level specificity; editors can identify and remediate issues
- **SC-004**: Ingestion pipeline automatically triggers when new RCO data is detected (polling, CRON, or webhook)

#### Quality Gating & Flagging (P2)

- **SC-005**: AI quality assessment of ingested items completes within 10 seconds per item batch
- **SC-006**: AI flags 80%+ of items correctly as accepted/rejected based on data quality criteria (validated against manual review)
- **SC-007**: Editors can review AI flag reasoning and override flags in under 2 minutes per item
- **SC-008**: System stores and displays AI reasoning for 100% of flag decisions
- **SC-009**: Editors report that AI flag reasoning is clear and actionable (measured via user survey)

#### Content Import & Rewriting (P1, P3)

- **SC-010**: Editors can import a 50-item JSON file and see all items in the browsable list within 10 seconds
- **SC-011**: AI rewrites of accepted-flagged content reduce reading level by at least 2 grade levels while preserving meaning
- **SC-012**: 90% of AI-generated rewrites are accepted with minor edits or no edits (less than 10% require complete rejection)

#### POC Workflow Completion

- **SC-013**: Complete POC workflow (ingest → quality gate → import → rewrite) for a single content item can be completed in under 5 minutes by an experienced editor
- **SC-014**: At least 3 editorial team members successfully process 20+ content items each through the full POC workflow
- **SC-015**: Editorial team reports at least 40% time savings on content processing tasks compared to current manual workflow (measured via user survey)

#### Database Schema Design (POC Foundation)

- **SC-020**: Database schema includes `language_code` column on all content tables with default value 'fr'
- **SC-021**: Database schema includes `source_revision_id` column on content and content_revisions tables for translation lineage tracking
- **SC-022**: Composite unique constraint `(content_id, language_code, revision_number)` prevents duplicate revisions per language
- **SC-023**: Indexes on `(language_code, created_at)` exist for efficient language-specific queries
- **SC-024**: Schema documentation explains translation lineage concept (source revisions → translation revisions) for MVP2 implementation

#### Audit & Revision (Cross-cutting)

- **SC-025**: System maintains complete audit trail with 100% of actions attributed to specific users or AI agents
- **SC-026**: Zero instances of content being processed without explicit human approval during POC testing
- **SC-027**: Revision timeline displays all changes with actor and timestamp; editors can rollback to any prior version in under 5 seconds
- **SC-028**: 100% of content mutations create immutable revision records with no data loss or history deletion
