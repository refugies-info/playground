---
description: Validate documentation structure and find rogue .md files
---

# Validate Documentation Structure

This workflow checks for documentation violations and rogue `.md` files.

---

## Step 1: Scan for Rogue Documentation Files

Check for `.md` files outside the `/documentation` folder:

```bash
find /Users/jeremie/refugies.info/content-playground -type f -name "*.md" \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.turbo/*" \
  ! -path "*/.windsurf/*" \
  ! -path "*/.kilocode/*" \
  ! -path "*/.specify/*" \
  ! -path "*/documentation/*" \
  ! -path "*/specs/*" \
  ! -path "*/apps/frontend/*" \
  ! -name "README.md" \
  -print
```

**Expected output**: Empty (no rogue files found)

**If files are found**: These are rogue documentation files that should be moved to `/documentation` or deleted.

---

## Step 2: Verify Documentation Folder Structure

Check that all required folders exist:

```bash
ls -la /Users/jeremie/refugies.info/content-playground/documentation/
```

**Expected folders**:
- ✅ guides/
- ✅ architecture/
- ✅ frontend/
- ✅ database/
- ✅ ai/
- ✅ reference/
- ✅ internal/
- ✅ workflows/
- ✅ troubleshooting/
- ✅ roadmaps/

---

## Step 3: Check for Missing README Files

Verify each folder has a README.md:

```bash
for dir in guides architecture frontend database ai reference internal workflows troubleshooting roadmaps; do
  if [ ! -f "/Users/jeremie/refugies.info/content-playground/documentation/$dir/README.md" ]; then
    echo "❌ Missing: documentation/$dir/README.md"
  else
    echo "✅ Found: documentation/$dir/README.md"
  fi
done
```

**Expected output**: All folders have README.md files

---

## Step 4: Verify No Files at Documentation Root

Check for `.md` files directly in `/documentation`:

```bash
find /Users/jeremie/refugies.info/content-playground/documentation -maxdepth 1 -type f -name "*.md" -print
```

**Expected output**: Only `README.md` (the main index)

---

## Step 5: Check for Broken Links in Documentation

Scan for broken markdown links:

```bash
grep -r "\[.*\](.*\.md)" /Users/jeremie/refugies.info/content-playground/documentation/ \
  | grep -v "coming soon" \
  | head -20
```

**What to check**:
- Links should point to existing files
- Links should use relative paths
- Links should not be broken

---

## Step 6: Verify Filename Conventions

Check for files NOT in `kebab-case.md`:

```bash
find /Users/jeremie/refugies.info/content-playground/documentation -type f -name "*.md" \
  | grep -E "[A-Z]|_" \
  | grep -v "README.md"
```

**Expected output**: Empty (all files in kebab-case)

**If files are found**: These should be renamed to kebab-case.

---

## Step 7: Summary Report

Run this to get a complete documentation health check:

```bash
echo "=== DOCUMENTATION VALIDATION REPORT ==="
echo ""
echo "1. Rogue files (should be empty):"
find /Users/jeremie/refugies.info/content-playground -type f -name "*.md" \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.turbo/*" \
  ! -path "*/.windsurf/*" \
  ! -path "*/.kilocode/*" \
  ! -path "*/.specify/*" \
  ! -path "*/documentation/*" \
  ! -path "*/specs/*" \
  ! -path "*/apps/frontend/*" \
  ! -name "README.md" \
  | wc -l
echo ""
echo "2. Total documentation files:"
find /Users/jeremie/refugies.info/content-playground/documentation -type f -name "*.md" | wc -l
echo ""
echo "3. Folders with README.md:"
find /Users/jeremie/refugies.info/content-playground/documentation -maxdepth 2 -name "README.md" | wc -l
echo ""
echo "4. Files NOT in kebab-case:"
find /Users/jeremie/refugies.info/content-playground/documentation -type f -name "*.md" \
  | grep -E "[A-Z]|_" \
  | grep -v "README.md" | wc -l
```

---

## ✅ Validation Checklist

- [ ] No rogue `.md` files outside `/documentation`
- [ ] All required folders exist
- [ ] Each folder has a README.md
- [ ] No `.md` files at `/documentation` root (except README.md)
- [ ] All filenames in `kebab-case.md`
- [ ] All links are valid
- [ ] Documentation index is up to date

---

## 🚀 How to Use This Workflow

1. Run the steps above to check documentation structure
2. Fix any violations found
3. Report results to the team
4. Update documentation as needed

---

## 📚 Related Documentation

- [DOCUMENTATION_GUIDELINES.md](../../DOCUMENTATION_GUIDELINES.md)
- [documentation-strategy.md](../../documentation/internal/documentation-strategy.md)
- [doc-creation-checklist.md](../../documentation/internal/doc-creation-checklist.md)
