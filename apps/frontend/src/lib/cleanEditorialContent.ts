export function cleanEditorialContent(markdown: string): {
  content: string;
  title?: string;
} {
  if (!markdown) return { content: "" };

  const lines = markdown.split("\n");

  // Pass 1: Identify Warning Section Range
  let warningStart = -1;
  let warningEnd = -1; // Exclusive

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.trim().startsWith("# ") &&
      line.toLowerCase().includes("journal des avertissements")
    ) {
      warningStart = i;
      // Find end
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().startsWith("# ")) {
          warningEnd = j;
          break;
        }
      }
      if (warningEnd === -1) warningEnd = lines.length;
      break; // Only remove one warning section (the first one found)
    }
  }

  // Pass 2: Filter and Extract Title
  const cleanedLines: string[] = [];
  let extractedTitle: string | undefined;
  let titleFound = false;

  for (let i = 0; i < lines.length; i++) {
    // Skip warning section
    if (warningStart !== -1 && i >= warningStart && i < warningEnd) {
      continue;
    }

    // Check for Title (First H1 outside warning)
    // This assumes the main content starts with an H1 which is the title
    if (!titleFound && lines[i].trim().startsWith("# ")) {
      extractedTitle = lines[i].replace(/^#\s+/, "").trim();
      titleFound = true;
      continue; // Remove title from content
    }

    cleanedLines.push(lines[i]);
  }

  return {
    content: cleanedLines.join("\n").trim(),
    title: extractedTitle,
  };
}
