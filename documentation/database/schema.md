# Database Schema Documentation

This document describes the current database schema for the Content Playground, specifically consolidated around the ingestion and editorial workflow.

## Overview

The database is structured to support a 3-step processing workflow:
1.  **Raw RCO Data**: Storing the original XML from the source.
2.  **Ingestion**: Processing raw data into Markdown and generating initial reports.
3.  **Editorial**: Storing the refined content ready for publication.

It also tracks the flow execution through:
-   **Content Flows**: Tracks the lifecycle and status of a piece of content.
-   **Vercel Workflows**: Links the content flow to the Vercel Workflow engine execution execution.

## Entity Relationship Diagram

```mermaid
erDiagram
    rco_records ||--o| workflows : "initiates"
    rco_records ||--o{ ingestion_records : "has processed"
    
    letta_reports ||--o{ ingestion_records : "validates (compliance/duplicates)"
    letta_reports ||--o{ editorial_records : "validates (content/metadata)"
    letta_reports ||--o{ translation_records : "validates (content/metadata)"

    ingestion_records ||--o{ editorial_records : "source for"
    ingestion_records ||--o| workflows : "context for"

    editorial_records ||--o{ translation_records : "is source for"
    editorial_records ||--o| workflows : "context for"
    
    translation_records ||--o| workflows : "context for"

    workflows ||--o{ publication_records : "triggers"
    workflows ||--o{ letta_reports : "generates"

    rco_records {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text training_offer_id
        text training_action_id
        timestamp source_created_at
        timestamp source_updated_at
        text source_raw "Original XML"
        jsonb metadata "Extracted metadata"
    }

    ingestion_records {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text markdown "Generated Markdown"
        jsonb metadata "Frontmatter + Extra"
        uuid rco_record_id FK "Link to Raw Source"
        uuid compliance_report_id FK "Link to Compliance Report"
        uuid duplicates_report_id FK "Link to Duplicates Report"
    }

    editorial_records {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        uuid ingestion_record_id FK "Link to Ingestion Source"
        text markdown "Edited Content"
        jsonb metadata "Edited Metadata"
        uuid content_report_id FK "Link to Content Quality Report"
        uuid metadata_report_id FK "Link to Metadata Quality Report"
    }

    translation_records {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        uuid editorial_record_id FK "Link to Source"
        text language "ISO Code (e.g. es)"
        text status "draft | published"
        text markdown "Translated Content"
        jsonb metadata "Translated Metadata"
        uuid content_report_id FK "Link to Content Quality Report"
        uuid metadata_report_id FK "Link to Metadata Quality Report"
        uuid workflow_id FK "Link to Parent Workflow"
    }

    publication_records {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text status "pending | success | error"
        text target "platform name"
        text remote_id "ID on external platform"
        jsonb payload "Publication data"
        uuid published_by FK "auth.uid()"
        uuid workflow_id FK
    }

    letta_reports {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text report_type
        text markdown
        jsonb metadata
        text agent_id
        text status
        text raw_response
        uuid workflow_id FK
    }

    workflows {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text status "pending | in_progress | completed"
        text progress "raw | ingestion | editorial | published"
        uuid ingestion_record_id FK
        uuid editorial_record_id FK
        uuid rco_record_id FK
        text conversation_id "Chat session ID"
        text vercel_hook_token
        text vercel_workflow_id
    }
```

## Table Definitions

### `rco_records`
Stores the raw data received from the RCO (Reseau Carif-Oref) XML feed. This table acts as the immutable source of truth for incoming data.

### `ingestion_records`
Represents the result of the initial processing of an `rco_record`. It contains the converted Markdown and links to automated quality reports (`letta_reports`) generated during ingestion.

-   **Foreign Keys**:
    -   `rco_record_id`: References `rco_records(id)`.
    -   `compliance_report_id`: References `letta_reports(id)`.
    -   `duplicates_report_id`: References `letta_reports(id)`.

### `editorial_records`
Stores the user-refined or "Golden" copy of the content. This is the version intended for final publication or export.

-   **Foreign Keys**:
    -   `ingestion_record_id`: References `ingestion_records(id)`.
    -   `content_report_id`: References `letta_reports(id)`.
    -   `metadata_report_id`: References `letta_reports(id)`.

### `translation_records`
Stores the translated version of an `editorial_record`. It follows the same schema as the editorial record to ensure consistency.

-   **Foreign Keys**:
    -   `editorial_record_id`: References `editorial_records(id)`.
    -   `content_report_id`: References `letta_reports(id)`.
    -   `metadata_report_id`: References `letta_reports(id)`.
    -   `workflow_id`: References `workflows(id)`.

### `publication_records`
Tracks the history of publications to various platforms. Linked to the workflow that triggered the publication.

-   **Foreign Keys**:
    -   `workflow_id`: References `workflows(id)`.
    -   `published_by`: References `auth.users(id)`.

### `letta_reports`
A consolidated table for storing all types of analysis reports generated by agents or system checks.

-   **Columns**:
    -   `report_type`: Classifies the report (e.g., 'compliance', 'duplicates').
    -   `markdown`: The human-readable body of the report.
    -   `metadata`: Structured data/metrics associated with the report.
    -   `agent_id`: The ID of the Letta agent that generated the report.
    -   `status`: Report completion status ('complete' or 'incomplete').
    -   `raw_response`: Raw agent response text when status is incomplete, for debugging.

### `workflows`
The central nervous system of the application. Tracks the entire lifecycle of a content piece, from raw RCO data to publication. It consolidates the previous `content_flows` and `vercel_workflows` concepts.

-   **Columns**:
    -   `status`: High-level status (pending, in_progress, completed).
    -   `progress`: Granular stage (raw, ingestion, editorial, etc.).
    -   `conversation_id`: ID of the chat session associated with this workflow.
    -   `vercel_workflow_id`: ID of the external Vercel Workflow run.
    -   `vercel_hook_token`: Token for secure webhooks.

-   **Foreign Keys**:
    -   `rco_record_id`: References `rco_records(id)`.
    -   `ingestion_record_id`: References `ingestion_records(id)`.
    -   `editorial_record_id`: References `editorial_records(id)`.
