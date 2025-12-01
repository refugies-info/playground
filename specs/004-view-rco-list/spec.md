# Feature Specification: View RCO List

**Feature Branch**: `004-view-rco-list`
**Created**: 2025-11-28
**Status**: Draft
**Input**: User description: "En tant que rédacteur, je peux consulter la liste des fiches RCO. Besoin: Pour que l'équipe édito manipule les fiches RCO, celles-ci doivent être centralisées au même endroit dans une interface. Fonctionnalité: Mise en place d'un tableau avec une barre de tri/filtres. Tableau: Colonnes (Titre, Date, Statut, État), Bouton consulter, Pagination. Filtres: Statut, État, Période. Comportement: Tri par date d'ajout. IMPORTANT: Mock JSON temporaire."

## Clarifications

### Session 2025-11-28
- Q: What should the "Consult" button do since the detail view doesn't exist yet? → A: Link to a placeholder route (e.g., `/documents/[id]`) with a simple "Work in Progress" message.
- Q: What is the default page size for pagination? → A: 20 items per page.
- Q: What UI component should be used for the Period filter? → A: Date Range Picker (Start & End Date).
- Q: How many mock items should be generated for testing? → A: 50-100 mock items.
- **Clarification (User)**: Routing updated to use generic `/documents` path instead of provider-specific `/rco` to support future data providers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Document List (Priority: P1)

As an editor, I want to view a centralized list of all documents so that I can see what content needs to be processed.

**Why this priority**: This is the entry point for the editorial workflow. Without this list, editors cannot access or manage content items.

**Independent Test**: Navigate to the document list page and verify the table renders with the correct columns and mock data.

**Acceptance Scenarios**:

1. **Given** I am on the document list page, **When** the page loads, **Then** I see a table with columns: Title, Date Added, Status, and State.
2. **Given** there are more items than the page limit, **When** I view the table, **Then** I see pagination controls.
3. **Given** the list is loaded, **When** I look at the order, **Then** items are sorted by Date Added (newest first) by default.
4. **Given** I am viewing a row, **When** I click the "Consult" button, **Then** I am navigated to the detail view (or placeholder).

---

### User Story 2 - Filter and Sort Document List (Priority: P1)

As an editor, I want to filter and sort the list of documents so that I can focus on specific items (e.g., items to treat, specific dates).

**Why this priority**: Essential for workflow efficiency when dealing with many items.

**Independent Test**: Apply various filters (Status, State, Date) and verify the list updates to show only matching items.

**Acceptance Scenarios**:

1. **Given** I am on the document list page, **When** I select "To Process" in the State filter, **Then** the table shows only items with that state.
2. **Given** I have active filters, **When** I click "Clear Filters", **Then** all filters are reset and the full list is shown.
3. **Given** I am on the document list page, **When** I select a date range in the Period filter, **Then** the table shows only items added within that range.

## Edge Cases

- **Empty List**: What happens if there are no documents at all? (System should show a friendly empty state message).
- **No Search Results**: What happens if filters result in zero matches? (System should show "No items found" and a way to clear filters).
- **API Failure**: What happens if the mock API fails to load? (System should show an error message and a retry button).
- **Invalid Page**: What happens if user navigates to a non-existent page? (System should redirect to the first page or show 404).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a table of documents.
- **FR-002**: The table MUST include columns for: Title (Titre), Date Added (Date d'ajout), Status (Statut: Accepté/Refusé), and State (État: Brouillon/À traiter/Archivé/Publié).
- **FR-003**: System MUST provide pagination for the list (default 20 items per page).
- **FR-004**: Each row MUST include a "Consult" (Consulter) button/action that navigates to a placeholder route `/documents/[id]`.
- **FR-005**: System MUST allow filtering by Status (Accepté, Refusé).
- **FR-006**: System MUST allow filtering by State (Brouillon, À traiter, Archivé, Publié).
- **FR-007**: System MUST allow filtering by Period (Date Added range) using a Date Range Picker (Start & End Date).
- **FR-008**: System MUST sort items by Date Added by default (descending).
- **FR-009**: System MUST provide a "Clear Filters" (Supprimer les filtres) button to reset all active filters.
- **FR-010**: System MUST serve data from a temporary Mock JSON API endpoint (frontend/api) to simulate the database (generating 50-100 mock items).

### Key Entities *(include if feature involves data)*

- **Document (Mock)**: Represents a content item with properties: id, title, date_added, status (accepted/rejected), state (draft/to_process/archived/published).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Editor can successfully view the list of documents populated from the mock API.
- **SC-002**: Editor can filter the list by Status, State, and Period and see correct results.
- **SC-003**: Editor can reset all filters with a single click.
- **SC-004**: Pagination correctly limits the number of items displayed per page.
