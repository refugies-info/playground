import { describe, expect, it } from "vitest";
import { countMarkdownWords, countWords } from "./word-counter";

describe("countWords", () => {
  it("should count words in a simple string", () => {
    expect(countWords("hello world")).toBe(2);
  });

  it("should return 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("should return 0 for undefined", () => {
    expect(countWords(undefined)).toBe(0);
  });

  it("should handle multiple spaces", () => {
    expect(countWords("hello   world   foo")).toBe(3);
  });

  it("should strip HTML tags before counting", () => {
    expect(countWords("<p>hello <strong>world</strong></p>")).toBe(2);
  });

  it("should handle strings with only whitespace", () => {
    expect(countWords("   ")).toBe(0);
  });

  it("should count French text with accents", () => {
    expect(countWords("Apprendre le français pour entrer à l'université")).toBe(
      7,
    );
  });
});

describe("countMarkdownWords", () => {
  it("should count words in plain markdown", () => {
    expect(countMarkdownWords("Hello world")).toBe(2);
  });

  it("should return 0 for empty string", () => {
    expect(countMarkdownWords("")).toBe(0);
  });

  it("should return 0 for undefined", () => {
    expect(countMarkdownWords(undefined)).toBe(0);
  });

  it("should strip YAML frontmatter", () => {
    const md = `---
title: Test
date: 2026-01-01
---

Hello world`;
    expect(countMarkdownWords(md)).toBe(2);
  });

  it("should strip heading markers", () => {
    const md = `# Title

## Subtitle

Some content here`;
    expect(countMarkdownWords(md)).toBe(5);
  });

  it("should strip bold and italic markers", () => {
    expect(countMarkdownWords("**bold** and *italic* text")).toBe(4);
  });

  it("should strip links but keep text", () => {
    expect(
      countMarkdownWords("Click [here](https://example.com) for info"),
    ).toBe(4);
  });

  it("should strip images but keep alt text", () => {
    expect(
      countMarkdownWords("See ![photo description](https://img.jpg) below"),
    ).toBe(4);
  });

  it("should strip inline code", () => {
    expect(countMarkdownWords("Use `npm install` command")).toBe(4);
  });

  it("should strip code blocks", () => {
    const md = `Some text before

\`\`\`javascript
const x = 1;
\`\`\`

Some text after`;
    expect(countMarkdownWords(md)).toBe(6);
  });

  it("should strip blockquotes", () => {
    expect(countMarkdownWords("> This is a quote")).toBe(4);
  });

  it("should strip list markers (unordered)", () => {
    const md = `- Item one
- Item two
- Item three`;
    expect(countMarkdownWords(md)).toBe(6);
  });

  it("should strip list markers (ordered)", () => {
    const md = `1. First item
2. Second item
3. Third item`;
    expect(countMarkdownWords(md)).toBe(6);
  });

  it("should handle a realistic RCO fiche", () => {
    const md = `---
title: Cours de français
source: RCO
---

# Cours de français langue d'intégration

## Objectifs

L'objectif du cours est d'apporter de l'aide dans les processus de socialisation.

## Contenu

Proposition de cours de niveau A1, A2, B1.`;

    const count = countMarkdownWords(md);
    // Title: 5 words, Objectifs: 1, description: 14, Contenu: 1, last line: 8
    expect(count).toBeGreaterThan(20);
  });

  it("should handle strikethrough", () => {
    expect(countMarkdownWords("This is ~~deleted~~ text")).toBe(4);
  });

  it("should strip horizontal rules", () => {
    const md = `Above

---

Below`;
    expect(countMarkdownWords(md)).toBe(2);
  });
});
