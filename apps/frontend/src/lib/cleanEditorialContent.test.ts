import assert from "node:assert";
import { test } from "node:test";
import { cleanEditorialContent } from "./cleanEditorialContent";

const warningSection = `# ⚠️ Journal des Avertissements

| Type de problème | Champ ou élément | Niveau de risque |
| ---------------- | ---------------- | ---------------- |
| Donnée vague     | Rythme           | moyen            |
`;

const mainContent = `# Apprendre le français

Ce dispositif propose des cours...

## Nom de l'action
Cours de français
`;

test("removes warning section and main title", () => {
  const input = `${warningSection}\n${mainContent}`;
  const expectedContent = `Ce dispositif propose des cours...

## Nom de l'action
Cours de français`;

  const { content, title } = cleanEditorialContent(input);
  assert.strictEqual(content, expectedContent);
  assert.strictEqual(title, "Apprendre le français");
});

test("removes main title when no warning section exists", () => {
  const input = mainContent;
  const expectedContent = `Ce dispositif propose des cours...

## Nom de l'action
Cours de français`;

  const { content, title } = cleanEditorialContent(input);
  assert.strictEqual(content, expectedContent);
  assert.strictEqual(title, "Apprendre le français");
});

test("handles case insensitive warning header", () => {
  const input = `# journal des avertissements\n\nSome warning text\n\n${mainContent}`;
  const expectedContent = `Ce dispositif propose des cours...

## Nom de l'action
Cours de français`;

  const { content, title } = cleanEditorialContent(input);
  assert.strictEqual(content, expectedContent);
  assert.strictEqual(title, "Apprendre le français");
});

test("returns empty string and undefined title for empty input", () => {
  const { content, title } = cleanEditorialContent("");
  assert.strictEqual(content, "");
  assert.strictEqual(title, undefined);
});

test("returns undefined title if no H1 found", () => {
  const input = "Just some text\n\n## Subheader";
  const { content, title } = cleanEditorialContent(input);
  assert.strictEqual(content, input);
  assert.strictEqual(title, undefined);
});

test("correctly cleans when warning section is at the end", () => {
  const input = `${mainContent}\n${warningSection}`;
  const expectedContent = `Ce dispositif propose des cours...

## Nom de l'action
Cours de français`;

  const { content, title } = cleanEditorialContent(input);
  assert.strictEqual(content, expectedContent);
  assert.strictEqual(title, "Apprendre le français");
});

test("correctly cleans when warning section is in the middle", () => {
  const input = `# Real Title
Intro content

${warningSection}

# Next Section
Outro content`;

  const expectedContent = `Intro content

# Next Section
Outro content`;

  const { content, title } = cleanEditorialContent(input);
  assert.strictEqual(content, expectedContent);
  assert.strictEqual(title, "Real Title");
});
