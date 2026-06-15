import fs from "node:fs";
import path from "node:path";
import { logger } from "@playground/shared-types";
import matter from "gray-matter";

/**
 * Validate the `agent-knowledge` corpus.
 *
 * Walks `documentation/agent-migration/agent-knowledge/` and checks that every
 * content file has valid frontmatter per the rules in `SCHEMA.md`.
 *
 * Severity:
 * - **fail** (exit 1): schema violations, missing required fields
 * - **warn** (logged but not blocking): broken relative links, missing
 *   `last-reviewed` on old files, skills with no examples
 *
 * Files exempted from frontmatter validation (they are documentation
 * ABOUT the corpus, not content IN the corpus):
 *   - README.md, SCHEMA.md, CHANGELOG.md, index.qmd
 *   - <folder>/README.md (folder README files)
 *   - .gitkeep (no content)
 */

const CORPUS_ROOT = path.join(
  process.cwd(),
  "documentation/agent-migration/agent-knowledge",
);

const EXEMPT_FILES = new Set([
  "README.md",
  "SCHEMA.md",
  "CHANGELOG.md",
  "index.qmd",
]);

const FOLDER_READMES_EXEMPT = true; // any README.md inside a subfolder

type Severity = "fail" | "warn";
type Issue = { severity: Severity; file: string; message: string };

function isFolderReadme(relPath: string): boolean {
  const segments = relPath.split(path.sep);
  return segments[segments.length - 1] === "README.md" && segments.length > 1;
}

function walkCorpus(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkCorpus(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

function validateSkillFrontmatter(
  file: string,
  relPath: string,
  data: Record<string, unknown>,
  issues: Issue[],
) {
  // For SKILL.md: name + description required, name must match folder
  if (!data.name) {
    issues.push({
      severity: "fail",
      file: relPath,
      message: "SKILL.md: missing required frontmatter `name`",
    });
  } else if (typeof data.name !== "string") {
    issues.push({
      severity: "fail",
      file: relPath,
      message: "SKILL.md: `name` must be a string",
    });
  } else {
    // Check name matches the parent folder
    const parentDir = path.basename(path.dirname(file));
    if (data.name !== parentDir) {
      issues.push({
        severity: "fail",
        file: relPath,
        message: `SKILL.md: \`name\` ("${data.name}") does not match parent folder name ("${parentDir}")`,
      });
    }
    // Check kebab-case
    if (!/^[a-z][a-z0-9-]*$/.test(data.name)) {
      issues.push({
        severity: "fail",
        file: relPath,
        message: `SKILL.md: \`name\` ("${data.name}") must be kebab-case (lowercase, digits, hyphens)`,
      });
    }
  }

  if (!data.description) {
    issues.push({
      severity: "fail",
      file: relPath,
      message: "SKILL.md: missing required frontmatter `description`",
    });
  } else if (
    typeof data.description === "string" &&
    data.description.length > 200
  ) {
    issues.push({
      severity: "warn",
      file: relPath,
      message: `SKILL.md: \`description\` is ${data.description.length} chars (recommend < 200)`,
    });
  }
}

function validateGenericFrontmatter(
  _file: string,
  relPath: string,
  data: Record<string, unknown>,
  issues: Issue[],
) {
  // For all corpus content files: description required, audience required
  if (!data.description) {
    issues.push({
      severity: "fail",
      file: relPath,
      message: "missing required frontmatter `description`",
    });
  } else if (
    typeof data.description === "string" &&
    data.description.length > 200
  ) {
    issues.push({
      severity: "warn",
      file: relPath,
      message: `\`description\` is ${data.description.length} chars (recommend < 200)`,
    });
  }

  if (!data.audience) {
    issues.push({
      severity: "fail",
      file: relPath,
      message:
        "missing required frontmatter `audience` (use `agent`, `human`, or `both`)",
    });
  }
}

function checkBrokenLinks(
  file: string,
  relPath: string,
  content: string,
  issues: Issue[],
) {
  // Find all relative links of the form [text](path) or [text](./path)
  // Skip http(s)://, mailto:, and #anchor-only
  const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const m of content.matchAll(linkRe)) {
    const href = m[1].trim();
    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("#") ||
      (href.startsWith("../") === false && !href.startsWith("./"))
    ) {
      continue;
    }
    // Strip the #anchor if present
    const [targetPath] = href.split("#");
    if (!targetPath) continue;
    const target = path.resolve(path.dirname(file), targetPath);
    if (!fs.existsSync(target)) {
      issues.push({
        severity: "warn",
        file: relPath,
        message: `broken link: \`${href}\` (target does not exist: \`${path.relative(process.cwd(), target)}\`)`,
      });
    }
  }
}

function main() {
  if (!fs.existsSync(CORPUS_ROOT)) {
    logger.error(`❌ Corpus root not found: ${CORPUS_ROOT}`);
    process.exit(1);
  }

  const files = walkCorpus(CORPUS_ROOT);
  const issues: Issue[] = [];

  for (const file of files) {
    const relPath = path.relative(process.cwd(), file);
    const baseName = path.basename(file);

    // Exempt documentation-about-the-corpus files
    if (EXEMPT_FILES.has(baseName)) continue;
    if (FOLDER_READMES_EXEMPT && isFolderReadme(relPath)) continue;

    const raw = fs.readFileSync(file, "utf-8");
    const parsed = matter(raw);
    const data = parsed.data as Record<string, unknown>;

    // Is this a SKILL.md? Apply skill-specific rules
    if (baseName === "SKILL.md") {
      validateSkillFrontmatter(file, relPath, data, issues);
    } else {
      validateGenericFrontmatter(file, relPath, data, issues);
    }

    // Check for broken relative links (warn only)
    checkBrokenLinks(file, relPath, parsed.content, issues);
  }

  // Skills without examples (warn only)
  const skillsDir = path.join(CORPUS_ROOT, "skills");
  if (fs.existsSync(skillsDir)) {
    for (const skill of fs.readdirSync(skillsDir)) {
      const skillPath = path.join(skillsDir, skill);
      if (!fs.statSync(skillPath).isDirectory()) continue;
      const hasExamples = fs.existsSync(path.join(skillPath, "examples"));
      const hasReferences = fs.existsSync(path.join(skillPath, "references"));
      if (!hasExamples && !hasReferences) {
        issues.push({
          severity: "warn",
          file: path.relative(process.cwd(), skillPath),
          message: `skill "${skill}" has no examples/ or references/ subfolder`,
        });
      }
    }
  }

  // Report
  const fails = issues.filter((i) => i.severity === "fail");
  const warns = issues.filter((i) => i.severity === "warn");

  if (warns.length > 0) {
    logger.warn(`⚠️  ${warns.length} warning(s):`);
    for (const w of warns) logger.warn(`  - ${w.file}: ${w.message}`);
  }

  if (fails.length === 0) {
    logger.info(
      `✅ Corpus validated (${files.length} files checked, ${warns.length} warnings).`,
    );
    process.exit(0);
  }

  logger.error(`❌ ${fails.length} error(s) in corpus frontmatter:`);
  for (const f of fails) logger.error(`  - ${f.file}: ${f.message}`);
  process.exit(1);
}

main();
