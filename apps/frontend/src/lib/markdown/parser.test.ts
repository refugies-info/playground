import { expect, test } from "vitest";
import { markdownToBlocks } from "@/lib/markdown";

test("indented text is not a code block", async () => {
  const md =
    "Objectifs\n\n    Réaliser un diagnostic\n\n    Expérimenter\n\n```\nreal code\n```";
  const blocks = await markdownToBlocks(md);
  expect(blocks.filter((b) => b.type === "codeBlock")).toHaveLength(1);
  expect(blocks[1].type).toBe("paragraph");
});
