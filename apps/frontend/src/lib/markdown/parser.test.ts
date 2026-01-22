// @vitest-environment jsdom
import { BlockNoteEditor } from "@blocknote/core";
import { describe, expect, it } from "vitest";
import { customSchema } from "../../components/document-editor/blocks/custom-schema";
import { markdownToBlocks } from "./parser";

describe("markdownToBlocks", () => {
  it("should parse standard nested toggles (no indent)", async () => {
    const input = `
:::toggle{title="Outer Toggle"}

:::good-to-know
This is a good to know block
:::

:::toggle{title="Inner Toggle"}

Inner nested content
:::

:::
`.trim();

    const blocks = await markdownToBlocks(input);

    expect(blocks).toHaveLength(1);
    const outer = blocks[0];
    expect(outer.type).toBe("toggleListItem");
    // @ts-expect-error
    expect(outer.content[0].text).toBe("Outer Toggle");

    // Check children
    expect(outer.children).toHaveLength(2);

    // Child 1: Callout (Good To Know)
    const gtk = outer.children![0];
    expect(gtk.type).toBe("callout");
    // @ts-expect-error
    expect(gtk.props.variant).toBe("goodToKnow");

    // Child 2: Inner Toggle
    const inner = outer.children![1];
    expect(inner.type).toBe("toggleListItem");
    // @ts-expect-error
    expect(inner.content[0].text).toBe("Inner Toggle");

    // Check inner content nesting
    expect(inner.children).toHaveLength(1);
    expect(inner.children![0].type).toBe("paragraph");
    // @ts-expect-error
    expect(inner.children![0].content[0].text).toBe("Inner nested content");
  });

  it("should parse simple flat lists", async () => {
    const input = `
- Item 1
- Item 2
    `.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("bulletListItem");
    expect(blocks[1].type).toBe("bulletListItem");
  });

  it("should handle complex mixed content", async () => {
    const input = `
# Title

:::toggle{title="My Toggle"}
- List inside toggle
- Another item

:::important
Important inside toggle
:::
:::
    `.trim();

    const blocks = await markdownToBlocks(input);

    expect(blocks[0].type).toBe("heading");

    const toggle = blocks[1];
    expect(toggle.type).toBe("toggleListItem");
    expect(toggle.children).toHaveLength(3); // List, List, Important
    expect(toggle.children![0].type).toBe("bulletListItem");
    expect(toggle.children![2].type).toBe("callout");
    // @ts-expect-error
    expect(toggle.children![2].props.variant).toBe("important");
  });

  it("should be robust against malformed markdown", async () => {
    const input = `
:::toggle{title="Unclosed Toggle"}
This toggle has no closing fence
    `.trim();

    // Should not crash, just parse as best as it can (likely flat or contained)
    const blocks = await markdownToBlocks(input);
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0].type).toBe("toggleListItem");
  });

  it("should handle stray closing fences gracefully", async () => {
    // A stray fence shouldn't crash the parser
    const input = `
Some content

:::

More content
    `.trim();

    const blocks = await markdownToBlocks(input);
    // The parser logic removes stray ":::" paragraphs
    expect(blocks).toHaveLength(2);
    // @ts-expect-error
    expect(blocks[0].content[0].text).toBe("Some content");
    // @ts-expect-error
    expect(blocks[1].content[0].text).toBe("More content");
  });

  it("should produce blocks valid for BlockNoteEditor", async () => {
    const input = `
# Hello BlockNote

:::toggle{title="Verification"}
- Checking if this loads
- Into the editor
:::
    `.trim();

    const blocks = await markdownToBlocks(input);

    // Try to instantiate an editor with these blocks
    // This verifies schema compliance and prevents runtime crashes
    expect(() => {
      BlockNoteEditor.create({
        schema: customSchema,
        initialContent: blocks,
      });
    }).not.toThrow();
  });
});
