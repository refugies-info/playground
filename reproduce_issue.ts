import { markdownToBlocks } from "./apps/frontend/src/lib/markdown-parser";

const sampleMarkdown = `
# Hello World

This is a paragraph with a [link](https://example.com).

- List item 1
- List item 2 with [link](https://test.com)
`;

async function test() {
  try {
    console.log("Testing markdownToBlocks...");
    const blocks = await markdownToBlocks(sampleMarkdown);
    console.log("Success!", JSON.stringify(blocks, null, 2));
  } catch (error) {
    console.error("FAILED:", error);
  }
}

test();
