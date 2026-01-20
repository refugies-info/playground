import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { GoodToKnow } from "./good-to-know-block";
import { Important } from "./important-block";

/**
 * Custom BlockNote Schema Definition
 *
 * This schema defines custom blocks that map to Markdown Directives (:::directive).
 * The pipeline works as follows:
 * 1. Deserialization: markdown/parser.ts transforms `:::important` -> `important` block.
 * 2. Editing: The block is rendered using the React component defined in the spec.
 * 3. Serialization: markdown/serializer.ts transforms `important` block -> `:::important`.
 *
 * Current Custom Blocks:
 * - Important (:::important)
 * - GoodToKnow (:::good-to-know)
 *
 * Note: Toggle (:::toggle) is handled natively via `toggleListItem` but still uses the directive syntax.
 *
 * Note: Custom block specs must be called as functions to get the actual BlockSpec
 */
export const customSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    important: Important(),
    goodToKnow: GoodToKnow(), // schema key uses camelCase
  },
});

// Export the editor type for use in other components
export type CustomEditor = typeof customSchema.BlockNoteEditor;
export type CustomBlock = typeof customSchema.Block;
