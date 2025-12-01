# Task Checklist: View Document List

## Phase 1: Setup

- [x] T001 Initialize feature documentation directory structure in specs/004-view-rco-list
- [x] T002 Install dependencies: @tanstack/react-table, react-day-picker, date-fns --filter @refugies/ui
- [x] T003 Create shared types for Document, Status, State in packages/shared/src/types/document.ts
- [x] T004 Create mock data generator utilities in apps/frontend/src/lib/mock/documents.ts

## Phase 2: Foundational

- [x] T005 Create mock API route handler at apps/frontend/src/app/api/documents/route.ts
- [x] T006 Implement generic DataTable component in packages/ui/src/primitives/data-table/data-table.tsx (and export)
- [x] T007 Implement DataTablePagination component in packages/ui/src/primitives/data-table/data-table-pagination.tsx (and export)
- [x] T008 Implement DataTableColumnHeader component in packages/ui/src/primitives/data-table/data-table-column-header.tsx (and export)

## Phase 3: User Story 1 - View Document List (P1)

- [x] T009 [US1] Create Document columns definition in apps/frontend/src/app/documents/columns.tsx
- [x] T010 [US1] Create Document List page layout in apps/frontend/src/app/documents/page.tsx
- [x] T011 [US1] Integrate mock API fetching in Document List page
- [x] T012 [US1] Add "Consult" action button to row actions in columns.tsx
- [x] T013 [US1] Implement empty state display in DataTable component

## Phase 4: User Story 2 - Filter and Sort Document List (P1)

- [x] T014 [US2] Implement DataTableToolbar component in packages/ui/src/primitives/data-table/data-table-toolbar.tsx (and export)
- [x] T015 [US2] Implement FacetedFilter component in packages/ui/src/primitives/data-table/data-table-faceted-filter.tsx (and export)
- [x] T016 [US2] Implement DateRangePicker component in packages/ui/src/forms/date-range-picker.tsx (and export)
- [x] T017 [US2] Connect filter state to URL search params in apps/frontend/src/app/documents/page.tsx
- [x] T018 [US2] Update mock API to handle sorting and filtering parameters
- [x] T019 [US2] Add "Clear Filters" functionality to toolbar (using DataTableToolbar)

## Phase 5: Polish

- [x] T020 Verify accessibility of data table and filters (keyboard nav, aria labels)
- [x] T021 Ensure responsive design for mobile views (horizontal scroll for table)
- [x] T022 Add loading skeletons for table rows during data fetch

## Dependencies

- US1 blocks US2 (List must exist before filtering)
- Setup & Foundational blocks all US phases

## Implementation Strategy

Start with Setup and Foundational tasks to get the mock data and basic table components in place. Then proceed to US1 to render the list. Finally, layer on the complexity of US2 (filtering/sorting) which requires both UI components and API logic updates.
