import { describe, expect, it } from "vitest";
import { markdownToBlocks } from "./parser";

describe("Markdown Parser", () => {
  it("should parse flat directives correctly", async () => {
    const input = `:::toggle{title="Simple"}\nContent\n:::`;
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("toggleListItem");
    // biome-ignore lint/suspicious/noExplicitAny: Test assertion requires content array access
    expect((blocks[0].content as any)[0].text).toBe("Simple");
  });

  // --- Standard Blocks ---
  it("should parse headings correctly", async () => {
    const input = "# H1\n## H2\n### H3";
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(3);
    expect(blocks[0].type).toBe("heading");
    expect(blocks[0].props).toEqual({ level: 1 });
    expect(blocks[1].props).toEqual({ level: 2 });
    expect(blocks[2].props).toEqual({ level: 3 });
  });

  it("should parse standard paragraphs", async () => {
    const input = "Just some text.";
    const blocks = await markdownToBlocks(input);
    expect(blocks[0].type).toBe("paragraph");
    // biome-ignore lint/suspicious/noExplicitAny: Test assertion requires content array access
    expect((blocks[0].content as any)[0].text).toBe("Just some text.");
  });

  // --- Lists ---
  it("should parse various list types", async () => {
    const input = `
- Bullet 1
1. Number 1
- [ ] Task 1
- [x] Task 2
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks[0].type).toBe("bulletListItem");
    expect(blocks[1].type).toBe("numberedListItem");
    expect(blocks[2].type).toBe("checkListItem");
    expect(blocks[2].props).toEqual({ checked: false });
    expect(blocks[3].type).toBe("checkListItem");
    expect(blocks[3].props).toEqual({ checked: true });
  });

  // --- Inline Formatting ---
  it("should parse inline formatting", async () => {
    const input = "Bold **text** and *italic* and [link](url)";
    const blocks = await markdownToBlocks(input);
    // biome-ignore lint/suspicious/noExplicitAny: Test needs to inspect inline content structure
    const content = blocks[0].content as any[];

    expect(content.find((c) => c.text === "text").styles).toHaveProperty(
      "bold",
      true,
    );
    expect(content.find((c) => c.text === "italic").styles).toHaveProperty(
      "italic",
      true,
    );
    expect(content.find((c) => c.type === "link").href).toBe("url");
  });

  // --- Custom Callouts ---
  it("should parse custom callouts", async () => {
    const input = `
:::important
Warning content
:::
:::good-to-know
Info content
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks[0].type).toBe("callout");
    expect(blocks[0].props).toEqual({ variant: "important" });
    expect(blocks[1].type).toBe("callout");
    expect(blocks[1].props).toEqual({ variant: "goodToKnow" });
  });

  // --- Cleanup Logic ---
  it("should clean up stray fences", async () => {
    const input = `
Content
:::
More Content
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    // Should remove the lines that are just ":::"
    expect(blocks).toHaveLength(1);
    // biome-ignore lint/suspicious/noExplicitAny: Test assertion requires content array access
    expect((blocks[0].content as any)[0].text).toBe("Content\nMore Content");
  });

  // --- Hardcore Nesting ---
  it("should parse hardcore nested structure", async () => {
    const input = `
:::toggle{title="Root"}
:::toggle{title="Child"}
:::important
Deep warning
:::
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    // Root
    expect(blocks[0].type).toBe("toggleListItem");
    // Child
    // biome-ignore lint/style/noNonNullAssertion: Test assertion
    const child = blocks[0].children![0];
    expect(child.type).toBe("toggleListItem");
    // biome-ignore lint/suspicious/noExplicitAny: Test assertion requires content array access
    expect((child.content as any)[0].text).toBe("Child");
    // Deep Important
    // biome-ignore lint/style/noNonNullAssertion: Test assertion
    const deep = child.children![0];
    expect(deep.type).toBe("callout");
    expect(deep.props).toEqual({ variant: "important" });
  });
});
