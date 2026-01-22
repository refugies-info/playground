# Testing Guide

This guide explains how tests work in the Content Playground monorepo and how to run and write them.

---

## 🛠 Testing Stack

- **Testing Framework**: [Vitest](https://vitest.dev/) (fast, Vite-native testing framework).
- **Monorepo Runner**: [Turborepo](https://turbo.build/) (orchestrates tests across all packages).
- **Environment**: [jsdom](https://github.com/jsdom/jsdom) (simulates browser environment for BlockNote integration tests).

---

## 🚀 Running Tests

### 1. Global (Monorepo)
To run all tests across the entire monorepo:

```bash
pnpm test
```
*Note: This utilizes Turborepo to run tests in parallel and cache successful results.*

### 2. Manual (Package Level)
To run tests for a specific package (e.g., `frontend`):

```bash
cd apps/frontend
pnpm test
```

### 3. CI Mode (Single Run)
If you just want to run the tests once without starting the watcher:

```bash
pnpm test --run
```

---

## 📝 Writing Tests

### Location
Test files should follow the `[filename].test.ts` naming convention and be located next to the file they are testing.

Example: `apps/frontend/src/lib/markdown/parser.test.ts`

### Structure
We use a standard `describe` / `it` / `expect` structure.

```typescript
import { describe, it, expect } from "vitest";
import { myFunc } from "./my-func";

describe("myFunc", () => {
  it("should do something", () => {
    expect(myFunc()).toBe(true);
  });
});
```

---

## 🩺 Markdown Parser Tests

The `apps/frontend/src/lib/markdown/parser.test.ts` file is a critical part of our content pipeline verification. It ensures that:

1.  **Hierarchy Restoration**: Nested blocks (like `:::toggle`) are correctly transformed from flat Markdown into hierarchical BlockNote structures.
2.  **Robustness**: The parser handles malformed Markdown (missing closing fences, stray colons) without crashing.
3.  **Schema Compliance**: Parsed blocks are validated against the actual `BlockNoteEditor` schema to guarantee they won't cause runtime errors in the UI.

To test specifically the parser:
```bash
pnpm --filter @playground/frontend test -- -t markdownToBlocks
```

---

## 💡 Best Practices

- **Keep it fast**: Prefer unit tests over complex integration tests where possible.
- **Use jsdom sparingly**: Only use `// @vitest-environment jsdom` at the top of files that actually require browser APIs (like BlockNote tests).
- **Verify Schema**: When parsing data for the editor, always incorporate a test case that instantiates a `BlockNoteEditor` to verify the block structure remains valid.
