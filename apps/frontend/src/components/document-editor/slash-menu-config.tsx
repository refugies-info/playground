"use client";

import { filterSuggestionItems } from "@blocknote/core/extensions";
import {
  type DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { AlertTriangle, Info } from "lucide-react";

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
 * Custom blocks to add to the slash menu
 */
const getCustomBlockItems = (
  // biome-ignore lint/suspicious/noExplicitAny: Editor type is complex with custom schema
  editor: any,
): DefaultReactSuggestionItem[] => [
  {
    title: "Important",
    subtext: "Alerte ou point d'attention",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      const insertedBlocks = editor.insertBlocks(
        [
          {
            type: "important",
            props: {},
            content: [],
          },
        ],
        currentBlock,
        "after",
      );
      if (insertedBlocks && insertedBlocks.length > 0) {
        editor.setTextCursorPosition(insertedBlocks[0], "end");
      }
    },
    aliases: ["important", "alert", "attention", "warning", "rouge"],
    group: "Blocs spéciaux",
    icon: <AlertTriangle size={18} />,
  },
  {
    title: "Bon à savoir",
    subtext: "Information ou note utile",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      const insertedBlocks = editor.insertBlocks(
        [
          {
            type: "goodToKnow",
            props: {},
            content: [],
          },
        ],
        currentBlock,
        "after",
      );
      if (insertedBlocks && insertedBlocks.length > 0) {
        editor.setTextCursorPosition(insertedBlocks[0], "end");
      }
    },
    aliases: [
      "info",
      "savoir",
      "bon",
      "bon à savoir",
      "bleu",
      "note",
      "good-to-know",
    ],
    group: "Blocs spéciaux",
    icon: <Info size={18} />,
  },
];

/**
 * Custom function to get filtered slash menu items.
 * Used by the SuggestionMenuController in EditionView.tsx.
 */
export const getCustomSlashMenuItems = async (
  // biome-ignore lint/suspicious/noExplicitAny: Editor type is complex with custom schema
  editor: any,
  query: string,
): Promise<DefaultReactSuggestionItem[]> => {
  // 1. Get default items
  const defaultItems = getDefaultReactSlashMenuItems(editor);

  // 2. Apply our custom filter (global visibility)
  const filteredItems = defaultItems.filter(shouldShowItem);

  // 3. Add custom block items
  const customItems = getCustomBlockItems(editor);
  const allItems = [...filteredItems, ...customItems];

  // 4. Apply BlockNote's standard search filtering based on user input
  return filterSuggestionItems(allItems, query);
};
