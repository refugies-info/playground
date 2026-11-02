import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { logger } from "@playground/shared-types";

/**
 * Checks that every relative link in the tracked markdown files points to an
 * existing file or folder. External links (http:, mailto:, …) and anchors are
 * not checked.
 */

const MARKDOWN_LINK = /\]\(([^)\s]+)\)/g;
const EXTERNAL_LINK = /^[a-z][a-z0-9+.-]*:/i;

function stripCode(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

function findBrokenLinks(
  file: string,
  markdown: string,
  exists: (target: string) => boolean,
): string[] {
  const broken: string[] = [];
  for (const [, link] of stripCode(markdown).matchAll(MARKDOWN_LINK)) {
    const target = link.split("#")[0];
    if (!target || EXTERNAL_LINK.test(target)) continue;
    const resolved = path.normalize(
      path.join(path.dirname(file), decodeURIComponent(target)),
    );
    if (!exists(resolved)) broken.push(link);
  }
  return broken;
}

function main() {
  const files = execFileSync("git", ["ls-files", "*.md"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);

  let brokenCount = 0;
  for (const file of files) {
    const broken = findBrokenLinks(
      file,
      fs.readFileSync(file, "utf8"),
      fs.existsSync,
    );
    for (const link of broken) {
      logger.error(`❌ ${file} → ${link}`);
    }
    brokenCount += broken.length;
  }

  if (brokenCount > 0) {
    logger.error(`${brokenCount} broken relative link(s).`);
    process.exit(1);
  }
  logger.info(`✅ ${files.length} markdown files, no broken relative link.`);
}

main();
