import fs from "node:fs";
import path from "node:path";
import { logger } from "@playground/shared-types";

/**
 * Validate Documentation Structure
 *
 * This script checks for rogue .md files outside allowed locations.
 * Allowed locations:
 * - README.md (project root)
 * - DOCUMENTATION_GUIDELINES.md (project root)
 * - documentation/** (all subdirectories)
 * - specs/** (all subdirectories)
 * - .windsurf/** (all subdirectories)
 * - .kilocode/** (all subdirectories)
 * - .specify/** (all subdirectories)
 */

// Locations are defined below

const ALLOWED_PATTERNS = [
  "AGENTS.md",
  "README.md",
  "DOCUMENTATION_GUIDELINES.md",
  "documentation/**/*.md",
  "specs/**/*.md",
  ".windsurf/**/*.md",
  ".kilocode/**/*.md",
  ".specify/**/*.md",
  "apps/**/README.md",
  "packages/**/README.md",
];

const IGNORED_DIRS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".git",
];

function isAllowed(filePath: string) {
  const relativePath = path.relative(process.cwd(), filePath);

  // Check exact matches
  if (ALLOWED_PATTERNS.includes(relativePath)) {
    return true;
  }

  // Check glob patterns
  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.includes("**")) {
      const dir = pattern.split("/")[0];
      if (relativePath.startsWith(`${dir}/`)) {
        return true;
      }
    }
  }

  return false;
}

function findMdFiles(dir: string, files: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(process.cwd(), fullPath);

    // Skip ignored directories
    if (IGNORED_DIRS.some((ignored) => relativePath.startsWith(ignored))) {
      continue;
    }

    if (entry.isDirectory()) {
      findMdFiles(fullPath, files);
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  const mdFiles = findMdFiles(process.cwd());
  const rogueFiles = mdFiles.filter((file) => !isAllowed(file));

  if (rogueFiles.length === 0) {
    logger.info("✅ No rogue .md files found!");
    process.exit(0);
  }

  logger.error("❌ Rogue .md files detected (not in allowed locations):");

  rogueFiles.forEach((file) => {
    const relativePath = path.relative(process.cwd(), file);
    logger.error(`  ❌ ${relativePath}`);
  });

  logger.error("Allowed locations:");
  ALLOWED_PATTERNS.forEach((pattern) => {
    logger.error(`  ✅ ${pattern}`);
  });

  logger.error("See DOCUMENTATION_GUIDELINES.md for more information.");

  process.exit(1);
}

main();
