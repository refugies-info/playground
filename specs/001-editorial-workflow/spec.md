# Feature Specification: AI-Powered Editorial Workflow (Content Playground)

**Feature Branch**: `001-editorial-workflow`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "AI-assisted editorial workflow with human-in-the-loop process for content publication pipeline for Refugies.info"

## Project Context

This feature implements a complete AI-assisted editorial workflow system for Refugies.info, enabling content managers and editors to efficiently process, classify, rewrite, and publish content with AI assistance while maintaining full human oversight and control.

The system follows a linear four-stage pipeline: **Import → Sort → Rewrite → Export**, with human validation at each critical decision point.

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

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import and Browse Content (Priority: P1) 🎯 MVP

As a content manager, I want to import content files (JSON, CSV, or manual upload) and browse them in a structured interface, so that the editorial team has organized inputs to work with.

**Why this priority**: This is the foundation of the entire workflow. Without the ability to import and view content, no other workflow stages can function. This story delivers immediate value by replacing manual content organization.

**Independent Test**: Can be fully tested by uploading a sample JSON/CSV file and verifying that all content items appear in a browsable list view with their metadata (title, source, import date). Delivers value even without AI features.

**Acceptance Scenarios**:

1. **Given** I am a content manager on the import page, **When** I upload a valid JSON file containing 10 content items, **Then** all 10 items appear in the content list with their titles and metadata visible
2. **Given** I have imported content items, **When** I navigate to the content browser, **Then** I see a list of all imported items with filtering and search capabilities
3. **Given** I upload a malformed JSON file, **When** the system validates the file, **Then** I receive a clear error message indicating which fields are invalid
4. **Given** I am viewing the content list, **When** I click on a content item, **Then** I see the full content details including all metadata fields

---

### User Story 2 - AI-Assisted Content Classification (Priority: P2)

As an editor, I want AI to automatically classify, score quality, and tag imported content items, so that I can quickly identify high-priority content that needs review.

**Why this priority**: This story introduces AI assistance and significantly reduces manual triage work. It builds on the import foundation (P1) and enables editors to focus their time on the most important content first.

**Independent Test**: Can be tested by importing unclassified content, triggering AI classification, and verifying that each item receives tags, quality scores, and category assignments. Editors can manually review and adjust AI suggestions.

**Acceptance Scenarios**:

1. **Given** I have imported unclassified content items, **When** I trigger AI classification for a batch of items, **Then** each item receives suggested tags, a quality score (0-100), and a category assignment
2. **Given** AI has classified a content item, **When** I review the classification, **Then** I can see the AI's reasoning and confidence level for each tag and category
3. **Given** I disagree with an AI classification, **When** I manually edit the tags or category, **Then** my changes override the AI suggestion and are saved with my editor attribution
4. **Given** I have classified content, **When** I filter by quality score or category, **Then** I see only items matching my filter criteria

---

### User Story 3 - AI-Assisted Content Rewriting (Priority: P3)

As an editor, I want to request AI-generated rewrites of content in plain language, review the suggestions side-by-side with the original, and approve or modify them, so that I can produce clear, accessible content faster.

**Why this priority**: This is the core value proposition of AI assistance but depends on having classified content (P2). It delivers the most time savings but is not required for a minimal viable workflow.

**Independent Test**: Can be tested by selecting a classified content item, requesting a rewrite, and verifying that the AI generates a plain-language version that can be reviewed, edited, and approved independently of other workflow stages.

**Acceptance Scenarios**:

1. **Given** I am viewing a classified content item, **When** I click "Request AI Rewrite", **Then** the AI generates a plain-language version displayed side-by-side with the original
2. **Given** I am reviewing an AI-generated rewrite, **When** I make inline edits to the suggested text, **Then** my changes are saved as a new draft version with my editor attribution
3. **Given** I have reviewed and edited a rewrite, **When** I click "Approve Rewrite", **Then** the content status changes to "Approved" and is ready for export
4. **Given** I am unsatisfied with an AI rewrite, **When** I click "Reject and Request New Rewrite", **Then** the AI generates an alternative version using different phrasing

---

### User Story 4 - Map and Validate Document Metadata (Priority: P4)

As an editor, I want to validate and map document metadata (pricing, dates, public status, related structures) before publishing, so that content is correctly contextualized for publication and integration with Refugies.info systems.

**Why this priority**: Metadata validation is a mandatory pre-publication step per human-in-the-loop principle. It ensures content is properly structured for downstream publishing systems.

**Independent Test**: Can be tested by selecting approved content items, validating metadata fields, and verifying that export is blocked if metadata is incomplete.

**Acceptance Scenarios**:

1. **Given** I have approved content items, **When** I navigate to the metadata mapping interface, **Then** I see all required metadata fields with current values (or empty if not set)
2. **Given** I am mapping metadata, **When** I update metadata fields, **Then** my changes are saved with my editor attribution and timestamp
3. **Given** I have incomplete metadata, **When** I attempt to export, **Then** the system blocks export and shows which metadata fields are required
4. **Given** I have completed metadata mapping, **When** I mark metadata as validated, **Then** the content is ready for export

---

### User Story 5 - Validate and Export Approved Content (Priority: P5)

As a reviewer, I want to validate approved content meets quality standards and export it to the publication database, so that finalized content can be integrated into the Refugies.info publishing workflow.

**Why this priority**: This completes the end-to-end workflow but is only valuable after content has been imported, classified, and rewritten. It can be simulated with manual database updates during POC.

**Independent Test**: Can be tested by selecting approved content items, running validation checks, and verifying that valid items are exported to Supabase with all metadata and audit trail information intact.

**Acceptance Scenarios**:

1. **Given** I have approved content items, **When** I select them for export, **Then** the system validates each item has required fields (title, body, category, tags)
2. **Given** content passes validation, **When** I trigger export, **Then** each item is written to the publication database with full audit trail (original source, AI modifications, human approvals)
3. **Given** content fails validation, **When** I review the validation report, **Then** I see specific error messages for each missing or invalid field
4. **Given** I have exported content, **When** I view the export history, **Then** I see a log of all exported items with timestamps and editor attribution

---

### User Story 6 - Track Workflow Progress and Analytics (Priority: P6)

As a team lead, I want to view dashboard analytics showing content volume at each workflow stage and editor productivity metrics, so that I can measure workflow efficiency and identify bottlenecks.

**Why this priority**: This provides operational visibility but is not required for the core workflow to function. It can be added after POC validation with real users.

**Independent Test**: Can be tested by processing content through all workflow stages and verifying that the dashboard displays accurate counts, completion rates, and time-to-completion metrics.

**Acceptance Scenarios**:

1. **Given** content is distributed across workflow stages, **When** I view the workflow dashboard, **Then** I see item counts for each stage (Imported, Classified, Rewritten, Metadata-Validated, Approved, Exported)

---

### Edge Cases

- **Empty or malformed import files**: System MUST validate and provide specific error messages without crashing. Invalid files are rejected with clear field-level error indicators.
- **AI service unavailable**: System MUST retry failed Letta operations automatically with exponential backoff (up to 3 retries). If all retries fail, editors can manually retry or complete the task manually (fallback to manual workflow).
- **Concurrent editing conflicts**: System MUST use pessimistic locking - first editor locks the item; other editors must wait or are blocked from editing until the lock is released.
- **Large batch operations**: System MUST support batch operations of 100-500 items during POC. Operations are queued and processed in batches with progress indicators. Limit can be increased in MVP based on learnings.
- **Partial workflow completion**: System MUST allow export of any content with minimum required fields, regardless of workflow stage completion. Content can be imported and sorted without rewrite, then exported.
- **Data retention and deletion**: System MUST retain all draft versions and rejected AI suggestions indefinitely for audit trail, recovery, and analytics purposes. No automatic deletion of transient data.

## Requirements *(mandatory)*

### Functional Requirements

#### Import Stage (Sprint 1)

- **FR-001**: System MUST accept content uploads in JSON and CSV formats with configurable field mappings
- **FR-002**: System MUST validate uploaded files against a defined schema and reject invalid files with specific error messages
- **FR-003**: System MUST store imported content in Supabase with metadata (source file, import timestamp, importing user)
- **FR-004**: System MUST display imported content in a browsable list view with search and filter capabilities
- **FR-005**: System MUST allow manual content entry through a web form as an alternative to file upload

#### Sort/Classification Stage (Sprint 1)

- **FR-006**: System MUST invoke Letta classifier agent to analyze content and generate suggested tags, categories, and quality scores
- **FR-007**: System MUST display AI classification suggestions alongside original content for human review
- **FR-008**: System MUST allow editors to accept, modify, or reject AI classification suggestions
- **FR-009**: System MUST track classification status (Unclassified, AI-Suggested, Human-Validated) for each content item
- **FR-010**: System MUST log all classification actions with editor attribution and timestamps

#### Rewrite Stage (Sprint 2)

- **FR-011**: System MUST invoke Letta rewrite agent to generate plain-language versions of content
- **FR-012**: System MUST display original and AI-rewritten content side-by-side for comparison
- **FR-013**: System MUST allow editors to make inline edits to AI-generated rewrites
- **FR-014**: System MUST support multiple rewrite iterations (reject and request alternative version)
- **FR-015**: System MUST track rewrite status (Original, AI-Draft, Edited, Approved, Rejected) for each content item

#### Export Stage (Sprint 2)

- **FR-016**: System MUST validate content items have required fields before allowing export
- **FR-017**: System MUST write approved content to Supabase publication tables with full audit trail
- **FR-018**: System MUST include metadata in exports: original source, AI modifications applied, human approvals, version history
- **FR-019**: System MUST prevent duplicate exports of the same content version
- **FR-020**: System MUST provide export history log showing all exported items with timestamps

#### Human-in-the-Loop Requirements (All Stages)

- **FR-021**: System MUST require explicit human approval before any AI suggestion is finalized
- **FR-022**: System MUST never auto-publish or auto-export content without human validation
- **FR-023**: System MUST display clear visual indicators distinguishing AI-generated content from human-edited content
- **FR-024**: System MUST allow editors to override any AI suggestion at any workflow stage

#### Audit and Traceability Requirements (All Stages)

- **FR-025**: System MUST log every content state change with action type, actor (human or AI agent), timestamp, and previous/new state
- **FR-026**: System MUST maintain version history for all content items showing evolution from import to export
- **FR-027**: System MUST attribute all actions to specific users or AI agents for accountability
- **FR-028**: System MUST provide audit trail query interface for compliance and debugging

#### Content Revision & Rollback Requirements (All Stages)

- **FR-029**: System MUST create an immutable revision record for every content mutation (AI rewrite, human edit, classification change)
- **FR-030**: System MUST display revision timeline with chronological list of all changes, actor, and timestamp
- **FR-031**: System MUST provide side-by-side diff view comparing any two revisions
- **FR-032**: System MUST allow one-click rollback to any prior version with confirmation dialog
- **FR-033**: Rollback action MUST create a new revision record (preserving full history, not deleting)
- **FR-034**: System MUST make revision data queryable for analytics (e.g., average revisions per content item, acceptance rates)

### Key Entities

- **Content Item**: Represents a single piece of content moving through the workflow. Key attributes: unique ID, title, body text, source metadata, current workflow stage, classification data (tags, category, quality score), rewrite versions, approval status, audit trail.

- **Workflow Stage**: Represents one of the four pipeline stages (Import, Sort, Rewrite, Export). Tracks which stage each content item is currently in and completion status.

- **AI Action Log**: Records every AI agent invocation. Key attributes: action ID, agent type (classifier/rewrite/validator), content item ID, input provided to agent, output generated by agent, timestamp, confidence scores.

- **Editor Action Log**: Records every human edit or approval. Key attributes: action ID, editor user ID, content item ID, action type (classify/edit/approve/reject), changes made, timestamp.

- **Content Version**: Represents a snapshot of content at a specific point in time. Key attributes: version ID, content item ID, version number, content body, metadata, created timestamp, created by (user or agent).

- **Content Revision**: Represents an immutable record of every content mutation. Key attributes: revision ID, content item ID, revision number, action type (rewrite/edit/classification), previous state, new state, change summary, created timestamp, created by (user or agent).

- **Export Record**: Tracks content that has been exported to publication database. Key attributes: export ID, content item ID, exported version ID, export timestamp, exporting user, destination table/system.

- **User/Editor**: Represents a human user of the system. Key attributes: user ID, name, role (content manager/editor/reviewer/team lead), email. Authentication via Supabase Auth with role-based access control (editor, reviewer, admin).

## Clarifications

### Session 2025-11-13

- Q: Metadata schema definition → A: TBD - to be defined and documented soon (pricing, dates, public status, related structures, etc.)
- Q: Concurrent editing conflict resolution → A: Pessimistic locking - First editor locks the item; others must wait or are blocked
- Q: AI service failure recovery → A: Automatic retry with exponential backoff + manual retry option (up to 3 retries; fallback to manual workflow)
- Q: Scalability limits for batch operations → A: 100-500 items per batch during POC; can increase in MVP based on learnings
- Q: Data retention policy for drafts/rejected suggestions → A: Indefinite retention - Keep all drafts and rejected suggestions forever for audit trail and recovery

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Editors can import a 50-item JSON file and see all items in the browsable list within 10 seconds
- **SC-002**: AI classification of a content item completes within 5 seconds and provides at least 3 relevant tags with confidence scores
- **SC-003**: Editors can review and approve/modify an AI classification in under 30 seconds per item (compared to 2+ minutes for manual classification)
- **SC-004**: AI rewrites reduce content reading level by at least 2 grade levels while preserving meaning (measured by readability scores)
- **SC-005**: 90% of AI-generated rewrites are accepted with minor edits or no edits (less than 10% require complete rejection and regeneration)
- **SC-006**: Complete workflow (import → classify → rewrite → export) for a single content item can be completed in under 5 minutes by an experienced editor
- **SC-007**: System maintains complete audit trail with 100% of actions attributed to specific users or AI agents
- **SC-008**: Zero instances of content being published without explicit human approval during POC testing
- **SC-009**: At least 3 editorial team members successfully process 20+ content items each through the full workflow during POC validation
- **SC-010**: Editorial team reports at least 40% time savings on content processing tasks compared to current manual workflow (measured via user survey)
- **SC-011**: Revision timeline displays all changes with actor and timestamp; editors can rollback to any prior version in under 5 seconds
- **SC-012**: 100% of content mutations create immutable revision records with no data loss or history deletion
- **SC-013**: Editors report confidence in experimenting with content knowing they can easily revert mistakes (measured via user survey)
