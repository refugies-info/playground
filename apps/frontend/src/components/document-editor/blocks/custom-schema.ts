import { BlockNoteSchema } from "@blocknote/core";
import { CalloutBlock } from "./callout-block";

/**
 * Custom BlockNote Schema Definition
 *
 * This schema defines custom blocks that map to Markdown Directives (:::directive).
 * The pipeline works as follows:
 * 1. Deserialization: markdown/parser.ts transforms `:::important` -> `callout` block (variant: important).
 * 2. Editing: The block is rendered using the React component defined in the spec.
 * 3. Serialization: markdown/serializer.ts transforms `callout` block -> `:::important`.
 *
 * Current Custom Blocks:
 * - Callout (:::important, :::good-to-know)
 *
 * Note: Toggle (:::toggle) is handled natively via `toggleListItem` but still uses the directive syntax.
 *
 * Note: Custom block specs must be called as functions to get the actual BlockSpec
 */
export const customSchema = BlockNoteSchema.create().extend({
  blockSpecs: {
    callout: CalloutBlock(),
  },
});

// Export the editor type for use in other components
export type CustomEditor = typeof customSchema.BlockNoteEditor;
export type CustomBlock = typeof customSchema.Block;
