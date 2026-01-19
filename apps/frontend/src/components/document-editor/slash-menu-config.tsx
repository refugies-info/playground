"use client";

import { type BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import {
  type DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";

/**
 * Filter function for slash menu items.
 * This is the central place to configure which items appear in the slash menu.
 *
 * return true to keep the item, false to remove it.
 */
// List of items to filter out from the slash menu (by key)
const EXCLUDED_KEYS = [
  "image",
  "video",
  "audio",
  "file",
  "toggle_heading",
  "toggle_heading_2",
  "toggle_heading_3",
  "emoji",
];

/**
 * Filter function for slash menu items.
 * This is the central place to configure which items appear in the slash menu.
 *
 * return true to keep the item, false to remove it.
 */
function shouldShowItem(item: DefaultReactSuggestionItem): boolean {
  // biome-ignore lint/suspicious/noExplicitAny: key is present in runtime but missing in type definition
  const itemKey = (item as any).key;
  return !EXCLUDED_KEYS.includes(itemKey);
}

/**
 * Custom function to get filtered slash menu items.
 * Used by the SuggestionMenuController in EditionView.tsx.
 */
export const getCustomSlashMenuItems = async (
  editor: BlockNoteEditor,
  query: string,
): Promise<DefaultReactSuggestionItem[]> => {
  // 1. Get default items
  const defaultItems = getDefaultReactSlashMenuItems(editor);

  // For debugging: log the default items to inspect their structure and keys
  // biome-ignore lint/suspicious/noConsole: debugging
  console.log("Default Slash Menu Items:", defaultItems);

  // 2. Apply our custom filter (global visibility)
  const filteredItems = defaultItems.filter(shouldShowItem);

  // 3. Apply BlockNote's standard search filtering based on user input
  return filterSuggestionItems(filteredItems, query);
};
