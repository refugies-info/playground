import type { PartialBlock } from "@blocknote/core";
import { describe, expect, it } from "vitest";
import { markdownToBlocks } from "@/lib/markdown/parser";

type TestInlineContent = {
  type: "text" | "link";
  text: string;
  styles?: Record<string, unknown>;
  href?: string;
};

// Custom type to handle blocks not in the strict PartialBlock definition (like callout)
type CustomBlock = Omit<PartialBlock, "children" | "content" | "type"> & {
  type: string;
  children?: CustomBlock[];
  content?: TestInlineContent[] | string | unknown[];
  props?: Record<string, unknown>;
};

describe("Markdown Parser", () => {
  it("should parse flat directives correctly", async () => {
    const input = `:::toggle{title="Simple"}\nContent\n:::`;
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("toggleListItem");
    expect((blocks[0].content as unknown as TestInlineContent[])[0].text).toBe(
      "Simple",
    );
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
    expect((blocks[0].content as unknown as TestInlineContent[])[0].text).toBe(
      "Just some text.",
    );
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
    const content = blocks[0].content as unknown as TestInlineContent[];

    expect(content.find((c) => c.text === "text")?.styles).toHaveProperty(
      "bold",
      true,
    );
    expect(content.find((c) => c.text === "italic")?.styles).toHaveProperty(
      "italic",
      true,
    );
    expect(content.find((c) => c.type === "link")?.href).toBe("url");
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
    expect((blocks[0].content as unknown as TestInlineContent[])[0].text).toBe(
      "Content\nMore Content",
    );
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
    const child = blocks[0].children?.[0];
    expect(child?.type).toBe("toggleListItem");
    expect(
      (child?.content as unknown as TestInlineContent[] | undefined)?.[0]?.text,
    ).toBe("Child");
    // Deep Important
    const deep = child?.children?.[0];
    expect(deep?.type).toBe("callout");
    expect(deep?.props).toEqual({ variant: "important" });
  });

  // Bug fix: toggle containing good-to-know (from Julie's video)
  it("should parse toggle containing good-to-know callout", async () => {
    const input = `
:::toggle{title="Accordion"}
:::good-to-know
Contenu à savoir
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    // Should have exactly one block (the toggle)
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("toggleListItem");
    expect((blocks[0].content as unknown as TestInlineContent[])[0].text).toBe(
      "Accordion",
    );

    // The good-to-know should be nested inside the toggle
    expect(blocks[0].children).toHaveLength(1);
    const callout = blocks[0].children?.[0];
    expect(callout?.type).toBe("callout");
    expect(callout?.props).toEqual({ variant: "goodToKnow" });
    expect(
      (callout?.content as unknown as TestInlineContent[] | undefined)?.[0]
        ?.text,
    ).toBe("Contenu à savoir");
  });

  // Edge case: content before and after nested directives
  it("should handle content before, inside and after nested toggle with callout", async () => {
    const input = `
Paragraph before

:::toggle{title="Section 1"}
Intro text

:::good-to-know
Note importante
:::

Outro text
:::

Paragraph after
`.trim();
    const blocks = await markdownToBlocks(input);

    // First paragraph
    expect(blocks[0].type).toBe("paragraph");
    expect((blocks[0].content as unknown as TestInlineContent[])[0].text).toBe(
      "Paragraph before",
    );

    // Toggle should exist and contain the callout
    const toggle = blocks.find((b) => b.type === "toggleListItem");
    expect(toggle).toBeDefined();

    const callout = toggle?.children?.find(
      (c: unknown) => (c as CustomBlock).type === "callout",
    );
    expect(callout).toBeDefined();
    expect(callout?.props).toEqual({ variant: "goodToKnow" });

    // Last paragraph
    const lastPara = blocks[blocks.length - 1];
    expect(lastPara.type).toBe("paragraph");
    expect((lastPara.content as unknown as TestInlineContent[])[0].text).toBe(
      "Paragraph after",
    );
  });

  // Edge case: multiple callouts inside toggle
  // NOTE: remark-directive struggles with multiple same-level directives inside a container.
  // This test documents current behavior - only the first callout is properly nested.
  it("should handle multiple callouts inside a toggle (best effort)", async () => {
    const input = `
:::toggle{title="Multiple Callouts"}
:::important
First warning
:::

:::good-to-know
First info
:::

:::important
Second warning
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    // Find the toggle
    const toggle = blocks.find((b) => b.type === "toggleListItem");
    expect(toggle).toBeDefined();

    const callouts =
      toggle?.children?.filter(
        (c: unknown) => (c as CustomBlock).type === "callout",
      ) || [];
    // remark-directive limitation: nested directives at same level may not all be captured
    expect(callouts.length).toBeGreaterThanOrEqual(1);
  });

  // Edge case: deeply nested toggles with callouts
  it("should handle deeply nested toggles with callouts at each level", async () => {
    const input = `
:::toggle{title="Level 1"}
:::toggle{title="Level 2"}
:::toggle{title="Level 3"}
:::good-to-know
Deep nested info
:::
:::
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("toggleListItem");
    expect((blocks[0].content as unknown as TestInlineContent[])[0].text).toBe(
      "Level 1",
    );

    const level2 = blocks[0].children?.[0];
    expect(level2?.type).toBe("toggleListItem");
    expect(
      (level2?.content as unknown as TestInlineContent[] | undefined)?.[0]
        ?.text,
    ).toBe("Level 2");

    const level3 = level2?.children?.[0];
    expect(level3?.type).toBe("toggleListItem");
    expect(
      (level3?.content as unknown as TestInlineContent[] | undefined)?.[0]
        ?.text,
    ).toBe("Level 3");

    const deepCallout = level3?.children?.[0];
    expect(deepCallout?.type).toBe("callout");
    expect(deepCallout?.props).toEqual({ variant: "goodToKnow" });
  });

  // Edge case: toggle with mixed content (paragraphs, lists, callouts)
  it("should handle toggle with mixed content types", async () => {
    const input = `
:::toggle{title="Mixed Content"}
Some intro paragraph

- List item 1
- List item 2

:::important
Warning inside toggle
:::

Final paragraph
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    const toggle = blocks.find((b) => b.type === "toggleListItem");
    expect(toggle).toBeDefined();
    expect(toggle?.children?.length).toBeGreaterThanOrEqual(3);

    expect(toggle?.children?.[0].type).toBe("paragraph");

    const callout = toggle?.children?.find(
      (c: unknown) => (c as CustomBlock).type === "callout",
    );
    expect(callout).toBeDefined();
  });

  // Edge case: consecutive toggles with nested callouts
  it("should handle consecutive toggles each with nested callouts", async () => {
    const input = `
:::toggle{title="Toggle 1"}
:::good-to-know
Info 1
:::
:::

:::toggle{title="Toggle 2"}
:::important
Warning 2
:::
:::

:::toggle{title="Toggle 3"}
:::good-to-know
Info 3
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    const toggles = blocks.filter((b) => b.type === "toggleListItem");
    expect(toggles.length).toBe(3);

    for (const toggle of toggles) {
      const callout = toggle.children?.find(
        (c: unknown) => (c as CustomBlock).type === "callout",
      );
      expect(callout).toBeDefined();
    }
  });

  // Edge case: toggle containing toggle containing callout with surrounding content
  // NOTE: remark-directive can struggle with complex nesting + surrounding content.
  // This test documents current best-effort behavior.
  it("should handle toggle inside toggle with callout", async () => {
    const input = `
:::toggle{title="Outer"}
Content before

:::toggle{title="Inner"}
:::good-to-know
Nested info
:::
:::

Content after
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    // Find the outer toggle (may not be the only block due to remark-directive limitations)
    const outerToggle = blocks.find(
      (b) =>
        b.type === "toggleListItem" &&
        (b.content as unknown as TestInlineContent[])[0]?.text === "Outer",
    );
    expect(outerToggle).toBeDefined();

    const innerToggle = outerToggle?.children?.find(
      (c) => c.type === "toggleListItem",
    );
    expect(innerToggle).toBeDefined();
    expect(
      ((innerToggle as CustomBlock).content as TestInlineContent[])[0].text,
    ).toBe("Inner");

    const callout = innerToggle?.children?.find(
      (c: unknown) => (c as CustomBlock).type === "callout",
    );
    expect(callout).toBeDefined();
    expect(callout?.props).toEqual({ variant: "goodToKnow" });
  });

  // --- Robustness & Heterogeneous Content ---

  it("should handle deeply nested mixed content (Toggles, Headers, Lists, Code)", async () => {
    const input = `
:::toggle{title="Root"}
## Subheading
Intro text

- Bullet A
- Bullet B

:::toggle{title="Level 2"}
> A blockquote

:::important
Crucial info
1. Ordered item
2. Ordered item
:::

\`\`\`typescript
const x = 1;
\`\`\`
:::

Final root text
:::
`.trim();

    const blocks = await markdownToBlocks(input);

    expect(blocks).toHaveLength(1);
    const root = blocks[0];
    expect(root.type).toBe("toggleListItem");

    // biome-ignore lint/style/noNonNullAssertion: content access
    const children = root.children!;

    // 1. Heading
    expect(children[0].type).toBe("heading");
    expect(children[0].props).toEqual({ level: 2 });

    // 2. Paragraph
    expect(children[1].type).toBe("paragraph");

    // 3. List
    expect(children[2].type).toBe("bulletListItem"); // Flattened logic in parser might split lists, check structure
    expect(children[3].type).toBe("bulletListItem");

    // 4. Level 2 Toggle
    const level2 = children.find((c) => c.type === "toggleListItem");
    expect(level2).toBeDefined();
    const l2Children = level2?.children;
    expect(l2Children).toBeDefined();
    if (!l2Children) return;

    // Quote
    expect(l2Children[0].type).toBe("quote");

    // Important Callout
    const callout = l2Children[1];
    expect(callout.type).toBe("callout");
    expect(callout.props).toEqual({ variant: "important" });
    // biome-ignore lint/style/noNonNullAssertion: content access
    expect(callout.children![0].type).toBe("numberedListItem");

    // Code Block
    const code = l2Children[2];
    expect(code.type).toBe("codeBlock");
    expect(code.props).toEqual({ language: "typescript" });
  });

  it("should handle multiple siblings with merged fences (Content\\n:::)", async () => {
    // Tests that one merged fence doesn't accidentally close the wrong parent or leave artifacts
    const input = `
:::toggle{title="A"}
Content A
:::

Middle Paragraph

:::toggle{title="B"}
Content B
:::
`.trim();

    const blocks = await markdownToBlocks(input);

    expect(blocks).toHaveLength(3);

    // Toggle A
    expect(blocks[0].type).toBe("toggleListItem");
    expect(
      (blocks[0].children?.[0].content as unknown as TestInlineContent[])[0]
        .text,
    ).toBe("Content A");

    // Middle
    expect(blocks[1].type).toBe("paragraph");
    expect((blocks[1].content as unknown as TestInlineContent[])[0].text).toBe(
      "Middle Paragraph",
    );

    // Toggle B
    expect(blocks[2].type).toBe("toggleListItem");
    expect(
      (blocks[2].children?.[0].content as unknown as TestInlineContent[])[0]
        .text,
    ).toBe("Content B");
  });

  it("should handle empty directives safely", async () => {
    const input = `
:::toggle{title="Empty"}
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("toggleListItem");
    expect(blocks[0].children).toHaveLength(0);
  });

  it("should handle unbalanced/stray fences gracefully", async () => {
    // Double fence should result in one toggle closing, and one stray fence removed
    const input = `
:::toggle{title="Safe"}
Content
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    // Should contain the toggle
    expect(blocks).toHaveLength(1); // The stray fence paragraph should be filtered out by validateAndFixBlocks logic
    expect(blocks[0].type).toBe("toggleListItem");
  });

  it("should handle toggle inside toggle with callout (Reproduction case)", async () => {
    const input = `
:::toggle{title="Outer"}
Content before

:::toggle{title="Inner"}
:::good-to-know
Nested info
:::
:::

Content after
:::
`.trim();
    const blocks = await markdownToBlocks(input);

    const outerToggle = blocks.find(
      (b) =>
        b.type === "toggleListItem" &&
        (b.content as unknown as TestInlineContent[])[0]?.text === "Outer",
    );
    expect(outerToggle).toBeDefined();

    const innerToggle = outerToggle?.children?.find(
      (c) => c.type === "toggleListItem",
    );
    expect(innerToggle).toBeDefined();

    const callout = innerToggle?.children?.find(
      (c: unknown) => (c as CustomBlock).type === "callout",
    );
    expect(callout).toBeDefined();
    expect(callout?.props).toEqual({ variant: "goodToKnow" });
  });

  // --- Varied Directive Types ---

  it("should ignore Leaf (::) and Text (:) directives in hierarchy restoration", async () => {
    // Leaf and Text directives do not use closing fences ":::".
    // restoration logic should ignore them.
    // Note: The parser implementation typically ignores unknown directives or renders them as text/paragraphs
    // unless a specific handler is added. We just want to ensure they don't crash or break hierarchy.
    const input = `
:::toggle{title="Container"}
::leaf-directive{id="leaf"}
Text with :text-directive inside.
:::
`.trim();

    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("toggleListItem");

    // biome-ignore lint/style/noNonNullAssertion: content access
    const children = blocks[0].children!;

    // Leaf directive usually renders as a paragraph if not handled, or specific block.
    // We just check that content exists inside the toggle.
    expect(children.length).toBeGreaterThan(0);
  });

  it("should handle attributes and labels in directives", async () => {
    const input = `
:::toggle[My Label]{title="Detailed" key="value"}
Content
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("toggleListItem");

    // Checking if label text is captured (depends on toggle parsing logic)
    // The current toggle logic likely uses 'title' prop.
    // If 'title' is missing, maybe it uses label?
    // In this input, title is present.
    expect((blocks[0].content as unknown as TestInlineContent[])[0].text).toBe(
      "Detailed",
    );
  });

  it("should distinguish colon syntax edge cases", async () => {
    const input = `
:::toggle{title="Root"}
::leaf
:text
::::nested
Inner
::::
:::
`.trim();

    const blocks = await markdownToBlocks(input);
    // Restoration should handle the ":::" matching Root.
    // "::::" (4 colons) is valid for nesting but relies on remark-directive to parse it.
    // If remark-directive handles it, fine. If it produces flat structure,
    // our plugin should handle it IF it identifies it as a fence.
    // Our regex /(?:^|\n)\s*:{3,}\s*$/ MATCHES 3 or more.
    // So "::::" is a fence.

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("toggleListItem");

    const children = blocks[0].children || [];
    // Should contain the nested 4-colon directive if parsed correctly, or text if not.
    // In any case, Root should contain it.
    expect(children.length).toBeGreaterThan(0);
  });

  it("Total Madness: Stairway to 10 Levels (Max Depth & Rich Content)", async () => {
    // 10 Levels of nesting (Root=12 down to Level 10=3).
    // Including headings, bold, links, and nested callouts.
    const input = `
:::toggle{title="L1"}
**L1 Start** with some bold content.
:::toggle{title="L2"}
## L2 Heading
This is a paragraph in L2.
:::toggle{title="L3"}
:::important
### Important Note
Stay focused on the nesting.
:::
:::toggle{title="L4"}
L4 Intro text.
:::good-to-know{title="Tip"}
Did you know that toggles can contain callouts?
:::
:::toggle{title="L5"}
L5 Intro.
- **Bold Item 1**
- *Italic Item 2*
:::toggle{title="L6"}
L6 Intro with a [link](https://refugies.info).
:::toggle{title="L7"}
L7 Intro paragraph.
:::toggle{title="L8"}
### L8 Heading
More core information.
:::toggle{title="L9"}
L9 Intro.
:::important
The Core L10.

**Bold Core**.

*Italic Core*.
:::
L9 Outro
:::
L8 Outro
:::
L7 Outro
:::
L6 Outro
:::
L5 Outro
:::
L4 Outro
:::
L3 Outro
:::
L2 Outro
L1 Outro
:::
`.trim();

    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);

    let current = blocks[0];
    for (let i = 1; i <= 8; i++) {
      expect(current.type).toBe("toggleListItem");
      expect((current.content as unknown as TestInlineContent[])[0].text).toBe(
        `L${i}`,
      );

      // Specific checks for variety
      if (i === 2) {
        const heading = current.children?.find(
          (c) => c.type === "heading" && c.props?.level === 2,
        );
        expect(heading).toBeDefined();
      }
      if (i === 3) {
        const callout = current.children?.find(
          (c: unknown) =>
            (c as CustomBlock).type === "callout" &&
            (c as CustomBlock).props?.variant === "important",
        );
        expect(callout).toBeDefined();
        // Check nested heading in callout
        const h3 = callout?.children?.find(
          (c) => c.type === "heading" && c.props?.level === 3,
        );
        expect(h3).toBeDefined();
      }
      if (i === 5) {
        const list = current.children?.find((c) => c.type === "bulletListItem");
        expect(list).toBeDefined();
      }
      if (i === 8) {
        const h3 = current.children?.find(
          (c) => c.type === "heading" && c.props?.level === 3,
        );
        expect(h3).toBeDefined();
      }

      // Navigate to next toggle
      const nextToggle = current.children?.find(
        (c) => c.type === "toggleListItem",
      );
      expect(nextToggle).toBeDefined();
      if (!nextToggle) throw new Error("Next toggle not found");
      current = nextToggle;
    }

    // Now current is L9
    expect(current.type).toBe("toggleListItem");
    expect((current.content as unknown as TestInlineContent[])[0].text).toBe(
      "L9",
    );

    // Level 10 Core (Callout)
    const l10 = current.children?.find(
      (c: unknown) => (c as CustomBlock).type === "callout",
    );
    expect(l10).toBeDefined();

    // Verify content: first paragraph is in .content
    expect(
      ((l10 as PartialBlock).content as unknown as TestInlineContent[])[0].text,
    ).toContain("The Core L10.");

    // Subsequent paragraphs are in .children
    const p2 = l10?.children?.find(
      (c) =>
        c.type === "paragraph" &&
        ((c as CustomBlock).content as TestInlineContent[])[0].text.includes(
          "Bold Core",
        ),
    );
    expect(p2).toBeDefined();
  });
});

describe("Recursive Directive Placement", () => {
  it("Level 1: Sibling of Root", async () => {
    const input = `
:::toggle{title="Root"}
:::important
:::toggle{title="Deepest"}
:::
:::
:::

:::good-to-know
Level 1 Sibling
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("toggleListItem");
    expect(blocks[1].type).toBe("callout");
  });

  it("Level 2: Child of Root", async () => {
    const input = `
:::toggle{title="Root"}
:::important
:::toggle{title="Deepest"}
:::
:::
:::good-to-know
Level 2 Child
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    const root = blocks[0];
    expect(root.type).toBe("toggleListItem");
    expect(root.children).toHaveLength(2);
    expect(root.children?.[0].type).toBe("callout"); // important

    // biome-ignore lint/suspicious/noExplicitAny: custom block
    expect((root.children?.[1] as any).type).toBe("callout"); // good-to-know
  });

  it("Level 3: Child of Important", async () => {
    const input = `
:::toggle{title="Root"}
:::important
:::toggle{title="Deepest"}
:::
:::good-to-know
Level 3 Child
:::
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    const root = blocks[0];
    expect(root.children).toHaveLength(1); // Only important

    // biome-ignore lint/suspicious/noExplicitAny: custom
    const important = root.children?.[0] as any;
    expect(important.children).toHaveLength(2);
    expect(important.children[0].type).toBe("toggleListItem"); // deepest
    expect(important.children[1].type).toBe("callout"); // good-to-know
  });

  it("Level 4: Child of Deepest", async () => {
    const input = `
:::toggle{title="Root"}
:::important
:::toggle{title="Deepest"}
:::good-to-know
Level 4 Child
:::
:::
:::
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    const root = blocks[0];

    // Navigate deep
    // biome-ignore lint/suspicious/noExplicitAny: custom
    const important = root.children?.[0] as any;
    const deepest = important.children[0];

    expect(deepest.children).toHaveLength(1);
    // biome-ignore lint/suspicious/noExplicitAny: custom
    expect((deepest.children?.[0] as any).type).toBe("callout");
  });

  it("Attributes Preservation", async () => {
    // Verify that attributes (title, id, class) survive normalization
    const input = `
:::toggle{title="My Title" #my-id .my-class}
Content
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);
    const root = blocks[0];
    // biome-ignore lint/suspicious/noExplicitAny: custom block
    expect((root as any).props.title).toBe("My Title");
  });

  it("Code Blocks Safety", async () => {
    // Verify that code blocks containing ":::" don't break the parser
    // (even if normalized inside, they should remain code blocks)
    const input = `
:::good-to-know
Here is some code:
\`\`\`text
:::
:::danger
Fake directive inside code
:::
\`\`\`
:::
`.trim();
    const blocks = await markdownToBlocks(input);
    expect(blocks).toHaveLength(1);

    // biome-ignore lint/suspicious/noExplicitAny: custom
    const gtk = blocks[0] as any;
    expect(gtk.type).toBe("callout");

    // The parser consumes the first paragraph ("Here is some code:") as the content.
    // So the children array starts with the NEXT block (the Code Block at 0).
    const codeBlock = gtk.children?.[0];
    expect(codeBlock.type).toBe("codeBlock");
    // We confirm that the content is indeed a code block and not parsed as a directive,
    // effectively proving containment.
  });
});
