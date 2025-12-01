# Quickstart: View Document List

## Prerequisites

- Node.js 18+
- pnpm 8+

## Setup

1. **Install Dependencies**:
   ```bash
   pnpm add @tanstack/react-table react-day-picker date-fns --filter frontend
   ```

2. **Run Dev Server**:
   ```bash
   pnpm dev
   ```

3. **Access Feature**:
   - Navigate to `http://localhost:3000/documents`
   - You should see the Mock Document List.

## Mock API

- **Endpoint**: `GET /api/documents`
- **Query Params**:
  - `page`: Page number (default 1)
  - `limit`: Items per page (default 20)
  - `status`: Filter by status
  - `state`: Filter by state
  - `from`: Start date (ISO)
  - `to`: End date (ISO)
