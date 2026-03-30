/**
 * Storybook Preview Configuration
 *
 * This file configures how stories are rendered in the Storybook canvas.
 * It runs before each story and can provide global decorators, parameters, or tags.
 */

import type { Preview } from "@storybook/react";
import "./globals.css";

const preview: Preview = {
  parameters: {
    // Center stories in the canvas by default
    layout: "centered",

    // Available background colors for the Backgrounds toolbar addon
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1a1a1a" },
      ],
    },
  },

  // Enable auto-generated documentation for all stories
  // Generates Docs page from component prop types (TypeScript) and JSDoc comments
  tags: ["autodocs"],
};

export default preview;
