# Documentation Strategy for LLMs

Guidelines for creating and maintaining documentation in Content Playground.

---

## Core Principles

### 1. Long-Term Value First

**Rule**: Create `.md` documentation files **ONLY** when they have long-term value.

**What qualifies**:
- ✅ Architectural decisions that will persist
- ✅ Setup guides used repeatedly
- ✅ Reference materials (commands, variables, glossary)
- ✅ Feature workflows and processes
- ✅ Troubleshooting guides for common issues
- ✅ Best practices and patterns

**What does NOT qualify**:
- ❌ Current work reports or status updates
- ❌ Documents focused on a small current task
- ❌ Temporary notes or scratch pads
- ❌ One-time setup instructions
- ❌ Task-specific debugging notes
- ❌ Meeting notes or discussions

**Examples**:

| ✅ YES | ❌ NO |
|--------|-------|
| "How to set up Supabase locally" | "Fixed bug in LoginForm today" |
| "Environment variables reference" | "Notes from sprint planning" |
| "Component architecture strategy" | "Temporary workaround for build issue" |
| "Deployment checklist" | "Quick test of feature X" |
| "Troubleshooting Supabase issues" | "Debugging session notes" |
| "Tech stack rationale" | "Current work in progress" |

---

## Permission-First Workflow

### 2. Always Ask Before Creating

**Rule**: **ALWAYS** ask for permission before creating a new documentation file.

**When to ask**:
- Before creating any new `.md` file
- Before moving/reorganizing existing docs
- Before updating the documentation structure
- Before adding new categories or folders

**How to ask**:

```
I recommend creating documentation for [topic] because:
- [reason 1: long-term value]
- [reason 2: reusability]
- [reason 3: team benefit]

Should I create:
- File: documentation/[category]/[filename].md
- Purpose: [clear description]
- Content: [brief outline]

Proceed? (yes/no)
```

**User responses**:
- **"yes"** → Create the file
- **"no"** → Don't create it, suggest alternatives
- **"modify"** → Ask for clarification on what to change
- **"later"** → Note it as deferred, don't create now

---

## Folder Structure Rules

### 3. Strict Folder Structure Compliance

**Rule**: **ALWAYS** use the `@[documentation]` folder and respect its structure **STRICTLY**.

**Prohibited**:
- ❌ `.md` files at project root (`/README.md` is exception)
- ❌ `.md` files at documentation root (`/documentation/README.md` is exception)
- ❌ Random `.md` files scattered in directories
- ❌ Creating new top-level folders without permission

**Required Structure**:

```
documentation/
├── README.md                          # ONLY exception at root
├── guides/                            # How-to guides
│   ├── local-development.md
│   ├── supabase-setup.md
│   ├── deployment.md
│   └── [new-guide].md
├── architecture/                      # System design & decisions
│   ├── monorepo-structure.md
│   ├── tech-stack.md
│   ├── database-schema.md
│   ├── authentication.md
│   └── [new-architecture].md
├── api/                               # API reference
│   ├── supabase-client.md
│   ├── custom-tools.md
│   ├── endpoints.md
│   └── [new-api].md
├── workflows/                         # Feature workflows
│   ├── editorial-workflow.md
│   ├── quality-gating.md
│   ├── metadata-mapping.md
│   └── [new-workflow].md
├── troubleshooting/                   # Common issues & solutions
│   ├── supabase-issues.md
│   ├── component-issues.md
│   ├── build-issues.md
│   └── [new-issue].md
├── reference/                         # Quick reference
│   ├── environment-variables.md
│   ├── commands.md
│   ├── glossary.md
│   └── [new-reference].md
└── roadmaps/                          # Project roadmaps
    └── roadmap-mvp.md
```

**Folder Purposes**:

| Folder | Purpose | Examples |
|--------|---------|----------|
| `guides/` | Step-by-step how-to guides | Setup, deployment, configuration |
| `architecture/` | System design & decisions | Tech stack, database schema, auth flow |
| `api/` | Technical API reference | Supabase client, custom tools, endpoints |
| `workflows/` | Feature-specific processes | Editorial workflow, quality gating |
| `troubleshooting/` | Common issues & solutions | Build errors, database issues, component bugs |
| `reference/` | Quick lookup materials | Commands, variables, glossary, terminology |
| `roadmaps/` | Project roadmaps & timelines | MVP roadmap, feature roadmaps |

---

## Decision Tree: Where Does Documentation Go?

Use this flowchart to determine the correct folder:

```
Is this documentation long-term valuable?
├─ NO → Don't create a .md file (use chat/notes instead)
└─ YES → What type of documentation?
         ├─ "How do I...?" → guides/
         ├─ "How does this work?" → architecture/
         ├─ "What can I call?" → api/
         ├─ "What's the process?" → workflows/
         ├─ "What went wrong?" → troubleshooting/
         ├─ "What's this called?" → reference/
         └─ "When will this happen?" → roadmaps/
```

---

## Documentation Lifecycle

### 4. Creating Documentation

**Before creating**:
1. ✅ Ask user for permission
2. ✅ Confirm the topic has long-term value
3. ✅ Identify the correct folder using the decision tree
4. ✅ Check if similar documentation already exists
5. ✅ Plan the content outline

**When creating**:
1. ✅ Use the correct folder structure
2. ✅ Follow the naming convention: `kebab-case.md`
3. ✅ Include a clear title and overview
4. ✅ Add table of contents for long docs
5. ✅ Include examples where helpful
6. ✅ Link to related documentation
7. ✅ Add references and external links

**After creating**:
1. ✅ Update `documentation/README.md` with new entry
2. ✅ Verify all links work
3. ✅ Check folder structure is maintained
4. ✅ Confirm it's discoverable

### 5. Updating Documentation

**When to update**:
- ✅ Information becomes outdated
- ✅ New features or changes require updates
- ✅ Clarification is needed
- ✅ Examples need improvement

**How to update**:
1. ✅ Identify the correct file
2. ✅ Make targeted updates
3. ✅ Update related documentation if needed
4. ✅ Update `documentation/README.md` if structure changes

**When NOT to update**:
- ❌ Don't add temporary notes
- ❌ Don't add current work status
- ❌ Don't add task-specific information
- ❌ Don't clutter with one-time fixes

### 6. Deleting Documentation

**When to delete**:
- ✅ Documentation is completely outdated
- ✅ Information is moved to another file
- ✅ Topic is no longer relevant

**How to delete**:
1. ✅ Ask user for permission
2. ✅ Update `documentation/README.md`
3. ✅ Update any cross-references
4. ✅ Delete the file

---

## Naming Conventions

### 7. File Naming

**Format**: `kebab-case.md` (lowercase with hyphens)

**Examples**:
- ✅ `local-development.md`
- ✅ `supabase-setup.md`
- ✅ `environment-variables.md`
- ✅ `component-architecture.md`
- ❌ `LocalDevelopment.md`
- ❌ `local_development.md`
- ❌ `Local Development.md`

**Folder naming**: `lowercase` (no hyphens)

**Examples**:
- ✅ `guides/`
- ✅ `architecture/`
- ✅ `troubleshooting/`
- ❌ `Guides/`
- ❌ `guide-folder/`

---

## Content Guidelines

### 8. Documentation Content

**Structure**:
```markdown
# Title

Brief description of what this doc covers.

---

## Overview

What is this about? Why does it matter?

---

## Section 1

Content...

---

## Section 2

Content...

---

## References

- [Link 1](url)
- [Link 2](url)
```

**Best practices**:
- ✅ Start with a clear title
- ✅ Include overview/purpose
- ✅ Use headers to organize content
- ✅ Add examples where helpful
- ✅ Include troubleshooting section if relevant
- ✅ Link to related documentation
- ✅ Add references and external links
- ✅ Keep language clear and concise

**Avoid**:
- ❌ Current work status or progress
- ❌ Personal notes or thoughts
- ❌ Temporary workarounds
- ❌ One-time debugging sessions
- ❌ Overly long sections (break into multiple files)
- ❌ Outdated information without updates

---

## Integration with Other Documentation

### 9. Coordinate with Component Documentation

**Component docs** (`/docs/`):
- `COMPONENT_STRATEGY.md` — Comprehensive guide
- `COMPONENT_QUICK_REFERENCE.md` — Quick start
- `COMPONENT_STRATEGY_IMPLEMENTATION.md` — What was done

**Project docs** (`/documentation/`):
- Reference component docs from guides
- Link to component strategy in relevant sections
- Keep component docs in `/docs` (closer to code)
- Keep project docs in `/documentation` (project-level)

**Example link**:
```markdown
For component architecture details, see [Component Strategy](../../docs/COMPONENT_STRATEGY.md).
```

---

## Common Scenarios

### 10. Scenario-Based Decisions

**Scenario 1: "I fixed a bug in the LoginForm"**
- ❌ Don't create documentation
- ✅ Update component code comments if needed
- ✅ If it's a pattern others should know, ask about troubleshooting guide

**Scenario 2: "We should document how to set up authentication"**
- ✅ Ask user: "Should I create `documentation/guides/authentication-setup.md`?"
- ✅ If yes, create comprehensive guide
- ✅ Update `documentation/README.md`

**Scenario 3: "I'm debugging a Supabase connection issue"**
- ❌ Don't create documentation for this session
- ✅ If it's a common issue, ask: "Should I add this to troubleshooting?"
- ✅ If yes, create `documentation/troubleshooting/supabase-connection-issues.md`

**Scenario 4: "We need to document the new API endpoint"**
- ✅ Ask user: "Should I create `documentation/api/[endpoint-name].md`?"
- ✅ If yes, create comprehensive API reference
- ✅ Update `documentation/README.md`

**Scenario 5: "I'm working on a feature and need to track progress"**
- ❌ Don't create documentation
- ✅ Use chat/notes for current work
- ✅ After feature is complete, ask about creating workflow documentation

---

## Checklist for LLMs

### 11. Before Creating Any Documentation

- [ ] Is this long-term valuable? (Not a current task or one-time fix)
- [ ] Have I asked the user for permission?
- [ ] Did the user say "yes"?
- [ ] Have I identified the correct folder using the decision tree?
- [ ] Does similar documentation already exist?
- [ ] Is the filename in `kebab-case.md`?
- [ ] Is the folder structure correct?
- [ ] Will I update `documentation/README.md`?
- [ ] Are all links valid?
- [ ] Is the content clear and concise?

### 12. Before Updating Documentation

- [ ] Is this update necessary and valuable?
- [ ] Am I updating the correct file?
- [ ] Will I update related documentation?
- [ ] Will I update `documentation/README.md` if structure changes?
- [ ] Are all links still valid?

### 13. Before Deleting Documentation

- [ ] Have I asked the user for permission?
- [ ] Did the user say "yes"?
- [ ] Will I update `documentation/README.md`?
- [ ] Will I update cross-references?

---

## Examples

### Example 1: Creating a New Guide

**User request**: "We need documentation for setting up the development environment"

**LLM response**:
```
I recommend creating a development setup guide because:
- It's referenced repeatedly by new developers
- It reduces onboarding time
- It's a long-term resource

Should I create:
- File: documentation/guides/development-setup.md
- Purpose: Step-by-step guide for local development
- Content: Prerequisites, installation, verification, troubleshooting

Proceed? (yes/no)
```

**If user says "yes"**:
1. Create `documentation/guides/development-setup.md`
2. Update `documentation/README.md` with new entry
3. Verify all links work

### Example 2: Documenting a Bug Fix

**User request**: "I fixed the authentication timeout issue"

**LLM response**:
```
This is a specific bug fix, not long-term documentation.

However, if this is a common issue others might encounter, I could:
- Add it to documentation/troubleshooting/authentication-issues.md
- Create a troubleshooting guide for this specific problem

Should I create/update troubleshooting documentation? (yes/no)
```

**If user says "yes"**:
1. Create or update troubleshooting file
2. Update `documentation/README.md`

**If user says "no"**:
1. Don't create documentation
2. Update code comments if helpful

### Example 3: Updating Existing Documentation

**User request**: "The deployment process changed"

**LLM response**:
```
I'll update documentation/guides/deployment.md with the new process.

This will affect:
- Deployment guide (main update)
- README.md (if structure changes)
- Any related guides

Proceed? (yes/no)
```

**If user says "yes"**:
1. Update `documentation/guides/deployment.md`
2. Update related files if needed
3. Update `documentation/README.md` if structure changes

---

## Summary for LLMs

**Remember**:

1. **Long-term value first** — Only create docs for lasting value
2. **Ask permission** — Always ask before creating/deleting docs
3. **Strict structure** — Use `@[documentation]` folder and respect structure
4. **Decision tree** — Use the flowchart to find the right folder
5. **Update README** — Always update `documentation/README.md` when structure changes
6. **No root files** — No `.md` files at project root or documentation root
7. **Naming** — Use `kebab-case.md` for files, `lowercase` for folders
8. **Long-term thinking** — Ask: "Will this be useful in 6 months?"
9. **Link everything** — Cross-reference related documentation
10. **Coordinate** — Keep component docs in `/docs`, project docs in `/documentation`

---

## References

- [Documentation Folder Structure](../documentation/README.md)
- [Component Strategy](./COMPONENT_STRATEGY.md)
- [Project README](../README.md)
