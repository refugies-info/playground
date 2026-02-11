---
description: Recommended MCP servers to enhance agent capabilities in this project.
---

## Recommended MCP Servers

To improve efficiency and accuracy when working on the Content Playground, the following MCP servers are recommended:

### 1. Supabase / Postgres MCP
**Purpose**: Direct schema inspection and data querying.
**Value**: Verify migration results, check RLS policies, and inspect record transitions (ingestion -> edito -> publication) without leaving the context.

### 2. GitHub / Git MCP
**Purpose**: PR management and advanced history analysis.
**Value**: Automate PR creation, analyze complex merge histories, and keep track of feature branch relationships more effectively.

### 3. Markdown / Documentation MCP
**Purpose**: Documentation validation and management.
**Value**: Ensure all documentation in `/documentation` follows the kebab-case convention, has valid internal links, and remains synchronized with code changes.

### 4. Vercel / Workflow MCP
**Purpose**: Workflow debugging and monitoring.
**Value**: If available, to inspect Vercel Workflow runs and statuses directly, aiding in debugging the asynchronous pipelines.
