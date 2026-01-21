import { markdownToBlocks } from "./parser";
import { blocksToDirectiveMarkdown } from "./serializer";

// Test nested toggle markdown
const markdown = `
:::toggle{title="Outer Toggle"}

:::toggle{title="Inner Toggle"}

Inner content

:::

:::
`;

async function run() {
  try {
    console.log("=== INPUT MARKDOWN ===");
    console.log(markdown);

    // Parse
    const blocks = await markdownToBlocks(markdown);
    console.log("\n=== PARSED BLOCKS ===");
    console.log(JSON.stringify(blocks, null, 2));

    // Check nested structure
    const outerToggle = blocks.find((b) => b.type === "toggleListItem");
    if (outerToggle) {
      console.log("\n=== OUTER TOGGLE CHILDREN ===");
      console.log(JSON.stringify(outerToggle.children, null, 2));

      const innerToggle = outerToggle.children?.find(
        (c: any) => c.type === "toggleListItem",
      );
      if (innerToggle) {
        console.log("\n✅ Inner toggle IS nested inside outer toggle");
      } else {
        console.log("\n❌ Inner toggle NOT found in outer toggle children");
      }
    }

    // Serialize back
    const serialized = blocksToDirectiveMarkdown(blocks);
    console.log("\n=== SERIALIZED MARKDOWN ===");
    console.log(serialized);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
