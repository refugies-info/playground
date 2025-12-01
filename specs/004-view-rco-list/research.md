# Phase 0: Research

**Feature**: View Document List
**Status**: Complete

## 1. Technology Choices

### Data Table Library
**Decision**: `@tanstack/react-table`
**Rationale**: Industry standard, headless (works perfectly with Shadcn/UI), highly customizable for sorting/filtering.
**Dependencies**: `pnpm add @tanstack/react-table --filter frontend`

### Date Picker
**Decision**: `react-day-picker` (via Shadcn `Calendar` + `Popover`)
**Rationale**: Standard Shadcn pattern. Needs `date-fns` for manipulation.
**Dependencies**: `pnpm add react-day-picker date-fns --filter frontend`

### Mock Data Generation
**Decision**: Custom generator functions (lightweight)
**Rationale**: No need for heavy libraries like `faker` for 50-100 items. We can use `Array.from` with simple random selection from predefined arrays (titles, statuses) to generate deterministic-looking mock data.

## 2. Implementation Patterns

### Data Fetching (Mock)
**Pattern**: Next.js Route Handler (`/api/documents`) with artificial delay.
**Rationale**: Simulates real network conditions (loading states) better than direct function calls.

### Filter State Management
**Pattern**: URL Search Params
**Rationale**: Allows sharing links with active filters. User can bookmark "To Process" items.
**Hooks**: `useSearchParams`, `useRouter`, `usePathname`.
