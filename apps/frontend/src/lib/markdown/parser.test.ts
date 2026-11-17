import { expect, test } from "vitest";
import { markdownToBlocks } from "@/lib/markdown";

test("indented text is not a code block", async () => {
  const md =
    "Objectifs\n\n    Réaliser un diagnostic\n\n    Expérimenter\n\n```\nreal code\n```";
  const blocks = await markdownToBlocks(md);
  expect(blocks.filter((b) => b.type === "codeBlock")).toHaveLength(1);
  expect(blocks[1].type).toBe("paragraph");
});

test("hard breaks become line breaks instead of gluing lines together", async () => {
  const [paragraph] = await markdownToBlocks(
    "Accéder à l'emploi  \nUtiliser l'informatique",
  );
  expect(paragraph.content).toEqual([
    { type: "text", text: "Accéder à l'emploi", styles: {} },
    { type: "text", text: "\n", styles: {} },
    { type: "text", text: "Utiliser l'informatique", styles: {} },
  ]);
});
