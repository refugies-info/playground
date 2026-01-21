export function cleanEditorialContent(markdown: string): {
  content: string;
  title?: string;
} {
  if (!markdown) return { content: "" };

  const lines = markdown.split("\n");
  const cleanedLines: string[] = [];
  let inWarningSection = false;
  let titleRemoved = false;
  let extractedTitle: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of "Journal des Avertissements"
    if (
      line.trim().startsWith("# ") &&
      line.toLowerCase().includes("journal des avertissements")
    ) {
      inWarningSection = true;
      continue;
    }

    // If we are in the warning section, we skip everything until we hit the next H1
    if (inWarningSection) {
      if (line.trim().startsWith("# ")) {
        // We found the next H1, so the warning section is over
        inWarningSection = false;
        // Proceed to process this line (it might be the title we need to remove)
      } else {
        // Still in warning section, skip
        continue;
      }
    }

    // Identify and remove the first H1 if not yet removed
    // This assumes the main content starts with an H1 which is the title
    if (!titleRemoved && line.trim().startsWith("# ")) {
      // Extract title text (remove "# " and clean up)
      extractedTitle = line.replace(/^#\s+/, "").trim();
      titleRemoved = true;
      continue;
    }

    cleanedLines.push(line);
  }

  return {
    content: cleanedLines.join("\n").trim(),
    title: extractedTitle,
  };
}
