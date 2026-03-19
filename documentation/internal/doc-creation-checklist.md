# Documentation Creation Checklist

**Use this checklist EVERY TIME before creating a documentation file.**

---

## 🎯 Step 1: Is This Long-Term Valuable?

- [ ] Will this documentation be useful in 6+ months?
- [ ] Is this reusable by multiple people/projects?
- [ ] Is this a pattern or best practice (not a one-time fix)?
- [ ] Would future developers/LLMs benefit from this?

**If NO to any of these** → Don't create documentation. Use code comments, chat notes, or temporary files instead.

**If YES to all** → Continue to Step 2.

---

## 🗂️ Step 2: Identify the Correct Folder

Use the decision tree:

```
What type of documentation is this?

"How do I...?" (procedural)
└─ guides/
   Examples: setup, deployment, development workflow

"How does this work?" (conceptual)
└─ architecture/
   Examples: tech stack, system design, monorepo structure

"Frontend/components?" (UI-specific)
└─ frontend/
   Examples: component strategy, styling guide, component patterns

"Database/Supabase?" (database-specific)
└─ database/
   Examples: migrations, RLS policies, seed data, query patterns

"AI/Letta?" (AI-specific)
└─ ai/
   Examples: Letta integration, custom tools, agent workflows

"What can I call?" (reference)
└─ reference/
   Examples: commands, environment variables, glossary

"What's the process?" (workflow)
└─ workflows/
   Examples: editorial workflow, quality gating, metadata mapping

"What went wrong?" (troubleshooting)
└─ troubleshooting/
   Examples: common errors, solutions, debugging tips

"When will this happen?" (roadmap)
└─ roadmaps/
   Examples: project timeline, feature roadmap, milestones

"LLM guidelines?" (meta)
└─ internal/
   Examples: documentation strategy, implementation notes
```

- [ ] I've identified the correct folder
- [ ] The folder exists (check `/documentation/`)
- [ ] Similar documentation doesn't already exist in this folder

**If you can't find the right folder** → Ask the user which folder to use.

---

## 📝 Step 3: Ask for Permission

**Template to use:**

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

- [ ] I've asked the user for permission
- [ ] The user said "yes"

**If the user says "no"** → Don't create the file. Respect their decision.

---

## 📄 Step 4: Prepare the File

- [ ] Filename is in `kebab-case.md` (lowercase with hyphens)
- [ ] File path is correct: `documentation/[category]/[filename].md`
- [ ] Content is clear and concise
- [ ] Content includes examples where helpful
- [ ] Content links to related documentation
- [ ] All links are valid

**Examples of correct filenames:**
- ✅ `component-strategy.md`
- ✅ `local-development.md`
- ❌ `ComponentStrategy.md` (wrong: CamelCase)
- ❌ `component_strategy.md` (wrong: snake_case)

---

## 🔗 Step 5: Update Documentation Index

- [ ] I've updated the relevant folder's `README.md`
- [ ] I've added an entry with title and description
- [ ] The link points to the correct file
- [ ] I've updated `/documentation/README.md` if needed
- [ ] All links are valid

**Example entry:**
```markdown
- **[Component Strategy](./component-strategy.md)** — Component architecture and organization
```

---

## ✅ Step 6: Final Verification

- [ ] File is in the correct folder
- [ ] Filename is in `kebab-case.md`
- [ ] Content is clear and well-organized
- [ ] All links work
- [ ] Relevant README.md files are updated
- [ ] No `.md` files at project root (except `README.md`)
- [ ] No scattered `.md` files in random locations

---

## 🚫 Common Mistakes to Avoid

- ❌ Creating docs without asking permission
- ❌ Creating docs for current tasks (not long-term valuable)
- ❌ Using `CamelCase.md` or `snake_case.md` filenames
- ❌ Forgetting to update README.md files
- ❌ Creating `.md` files at project root
- ❌ Creating a `/docs` folder (use `/documentation` instead)
- ❌ Putting docs in the wrong folder
- ❌ Creating broken links

---

## 📋 Quick Checklist (TL;DR)

Before creating a `.md` file:

- [ ] Long-term valuable? (6+ months)
- [ ] Asked permission? User said yes?
- [ ] Correct folder identified?
- [ ] Filename in `kebab-case.md`?
- [ ] Will update relevant README.md?
- [ ] All links valid?

If YES to all → Create the file.
If NO to any → Don't create it.

---

## 🔗 Related Documentation

- [DOCUMENTATION_GUIDELINES.md](../../DOCUMENTATION_GUIDELINES.md) — Quick reference at project root
- [documentation-strategy.md](./documentation-strategy.md) — Full guidelines
- [documentation/README.md](../README.md) — Documentation index

---

## 💡 Remember

**The Golden Rule:**

> Before creating a `.md` file, ask yourself:
> "Will someone find this useful in 6 months?"

If YES → Ask permission and create it.
If NO → Don't create it.

That's it! 🎉
