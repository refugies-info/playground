import { describe, expect, it } from "vitest";
import { markdownToBlocks } from "@/lib/markdown/parser";
import { blocksToDirectiveMarkdown } from "@/lib/markdown/serializer";

describe("Markdown Serializer (Round-trip & Directives)", () => {
  it("should serialize flat nested toggles correctly (no indentation)", async () => {
    const input = `
:::toggle{title="Outer"}
:::toggle{title="Inner"}
Content
:::
:::
`.trim();

    const blocks = await markdownToBlocks(input);
    const serialized = blocksToDirectiveMarkdown(blocks);

    // Expect standard 3-colon fences
    expect(serialized).toContain(':::toggle{title="Outer"}');
    expect(serialized).toContain(':::toggle{title="Inner"}');
    // Expect NO indentation for inner toggle
    expect(serialized).not.toMatch(/^\s+:::toggle/m);
    // Expect clean output without escapes
    expect(serialized).not.toContain("\\:::");
  });

  it("should handle custom components (good-to-know)", async () => {
    const input = `
:::good-to-know
Info content
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    const serialized = blocksToDirectiveMarkdown(blocks);
    expect(serialized).toContain(":::good-to-know");
    expect(serialized).toContain("Info content");
  });

  it("should handle complex mixed content", async () => {
    const input = `

:::toggle{title="Section"}
* List item
* Another item

:::important
Warning
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    const serialized = blocksToDirectiveMarkdown(blocks);

    expect(serialized).toContain(":::toggle");
    expect(serialized).toContain(":::important");
    expect(serialized).toMatch(/- List item/);
  });

  it("should handle deep nesting (3+ levels)", async () => {
    const input = `
:::toggle{title="Level 1"}
:::toggle{title="Level 2"}
:::toggle{title="Level 3"}
Deep content
:::
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    const serialized = blocksToDirectiveMarkdown(blocks);

    expect(serialized).toContain(':::toggle{title="Level 1"}');
    expect(serialized).toContain(':::toggle{title="Level 2"}');
    expect(serialized).toContain(':::toggle{title="Level 3"}');
    expect(serialized).toContain("Deep content");
    // Ensure nesting order is preserved (simplified check)
    expect(serialized.indexOf("Level 1")).toBeLessThan(
      serialized.indexOf("Level 2"),
    );
  });

  it("should preserve formatting inside directives", async () => {
    const input = `
:::toggle{title="Format **Bold**"}
Content with *italic* and **bold**.
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    const serialized = blocksToDirectiveMarkdown(blocks);

    expect(serialized).toContain(':::toggle{title="Format **Bold**"}');
    expect(serialized).toContain("Content with *italic* and **bold**.");
  });

  it("should handle lists inside directives", async () => {
    const input = `
:::toggle{title="Lists"}
1. Ordered item
2. Another item
   * Nested unordered
   * Another nested
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    const serialized = blocksToDirectiveMarkdown(blocks);

    expect(serialized).toContain("1. Ordered item");
    expect(serialized).toContain("- Nested unordered"); // remark defaults to -
  });

  it("should handle edge cases (empty body, quotes)", async () => {
    const input = `
:::toggle{title='With "Quotes"'}
:::

:::toggle{title="Empty"}
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    const serialized = blocksToDirectiveMarkdown(blocks);

    expect(serialized).toContain(":::toggle{title='With \"Quotes\"'}");
    expect(serialized).toContain(':::toggle{title="Empty"}');
    expect(serialized).toContain(':::toggle{title="Empty"}');
  });

  it("should handle HARDCORE nested mixed content", async () => {
    const input = `
:::toggle{title="Root"}
Some root text.

:::toggle{title="Level 1"}
* List item
* Another item

:::good-to-know
Useful info inside toggle.
:::

:::toggle{title="Level 2"}
Deepest content.
:::important
Critical warning deep down.
:::
:::
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    const serialized = blocksToDirectiveMarkdown(blocks);

    expect(serialized).toContain(':::toggle{title="Root"}');
    expect(serialized).toContain(':::toggle{title="Level 1"}');
    expect(serialized).toContain(":::good-to-know");
    expect(serialized).toContain(':::toggle{title="Level 2"}');
    expect(serialized).toContain(":::important");
    // Ensure structure (rough check of order)
    const rootIndex = serialized.indexOf(':::toggle{title="Root"}');
    const level1Index = serialized.indexOf(':::toggle{title="Level 1"}');
    const deepIndex = serialized.indexOf(':::toggle{title="Level 2"}');

    expect(rootIndex).toBeLessThan(level1Index);
    expect(level1Index).toBeLessThan(deepIndex);
  });
});
