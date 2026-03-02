# 📋 Documentation Guidelines for LLMs

**IMPORTANT**: Read this before creating ANY documentation file.

---

## ⚡ Quick Rules

1. **Long-term value first** — Only create docs for lasting value, NOT current tasks
2. **Always ask permission** — Never create docs without user approval
3. **Respect folder structure** — Use `/documentation` folder ONLY
4. **No root files** — No `.md` files at project root (except `README.md`)
5. **Follow decision tree** — Use the flowchart below to find the right folder

---

## 🎯 Decision Tree: Where Does Documentation Go?

```
Is this documentation long-term valuable?
(Will it be useful in 6 months? Is it reusable?)
├─ NO → Don't create documentation
│       (Use chat notes, code comments, or temporary files)
└─ YES → What type of documentation?
         ├─ "How do I...?" → guides/
         ├─ "How does this work?" → architecture/
         ├─ "What can I call?" → reference/
         ├─ "What's the process?" → workflows/
         ├─ "What went wrong?" → troubleshooting/
         ├─ "What's this called?" → reference/
         ├─ "Frontend/component stuff?" → frontend/
         ├─ "Database/Supabase stuff?" → database/
         ├─ "AI/Letta stuff?" → ai/
         └─ "LLM guidelines/meta?" → internal/
```

---

## 📂 Folder Structure

```
documentation/
├── guides/                    # How-to guides (setup, deployment, development)
├── architecture/              # System design & technical decisions
├── frontend/                  # Next.js, Tailwind, shadcn/ui, components
├── database/                  # Supabase, PostgreSQL, migrations, RLS
├── ai/                        # Letta Cloud, custom tools, agents
├── reference/                 # Quick lookup (commands, env vars, glossary)
├── internal/                  # LLM guidelines, implementation notes
├── workflows/                 # Feature-specific processes
├── troubleshooting/           # Common issues & solutions
└── roadmaps/                  # Project roadmaps & timelines
```

---

## ✅ Checklist: Before Creating Any Documentation

- [ ] Is this long-term valuable? (Will it be useful in 6 months?)
- [ ] Have I asked the user for permission?
- [ ] Did the user say "yes"?
- [ ] Have I identified the correct folder using the decision tree?
- [ ] Does similar documentation already exist?
- [ ] Is the filename in `kebab-case.md`?
- [ ] Is the folder structure correct?
- [ ] Will I update the relevant README.md?
- [ ] Are all links valid?
- [ ] Is the content clear and concise?

---

## 📝 How to Ask for Permission

**Template:**
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

---

## ❌ What NOT to Do

- ❌ Create `.md` files at project root
- ❌ Create `.md` files at `/documentation` root
- ❌ Create a `/docs` folder (deleted by design)
- ❌ Create docs for current tasks or one-time fixes
- ❌ Create docs without asking permission
- ❌ Use `CamelCase.md` or `snake_case.md` (use `kebab-case.md`)
- ❌ Forget to update the relevant README.md
- ❌ Create scattered `.md` files in random locations

---

## ✅ What TO Do

- ✅ Ask permission first
- ✅ Use `/documentation` folder only
- ✅ Follow the decision tree
- ✅ Use `kebab-case.md` for filenames
- ✅ Update the relevant README.md
- ✅ Link to related documentation
- ✅ Keep content clear and concise
- ✅ Think long-term (6+ months of value)

---

## 📚 Examples

### ✅ YES - Create Documentation

- "How to set up local development" → `guides/local-development.md`
- "Component architecture strategy" → `frontend/component-strategy.md`
- "Supabase seed data setup" → `database/seed-data.md`
- "Letta custom tools guide" → `ai/tool-development.md`
- "Environment variables reference" → `reference/environment-variables.md`
- "LLM documentation guidelines" → `internal/documentation-strategy.md`

### ❌ NO - Don't Create Documentation

- "Fixed bug in LoginForm today" → Use code comments
- "Notes from sprint planning" → Use chat/notes
- "Temporary workaround for build issue" → Use code comments
- "Quick test of feature X" → Use chat/notes
- "Current work in progress" → Use chat/notes

---

## 🔗 Related Documentation

- **Full Guidelines**: [documentation/internal/documentation-strategy.md](./documentation/internal/documentation-strategy.md)
- **Documentation Index**: [documentation/README.md](./documentation/README.md)
- **Project README**: [README.md](./README.md)

---

## 💡 Remember

**Before you create a `.md` file, ask yourself:**

> "Will someone (or an LLM) find this useful in 6 months?"

If YES → Ask permission and create it in the right folder.
If NO → Don't create it.

---

## 🚀 Quick Start for LLMs

1. Read this file
2. Use the decision tree to find the right folder
3. Ask the user for permission
4. Create the file in the correct location
5. Update the relevant README.md
6. Verify all links work

**That's it!** 
