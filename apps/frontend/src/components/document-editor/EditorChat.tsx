"use client";

import React from "react";

export function EditorChat() {
  return (
    <div className="flex flex-col h-full border-l bg-white w-80">
      <div className="p-3 border-b font-semibold text-sm">IA Chat</div>
      <div className="flex-1 p-4 text-gray-500 text-sm">
        Chat placeholder content...
      </div>
      <div className="p-3 border-t">
        <input
          type="text"
          placeholder="Ask AI..."
          className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled
        />
      </div>
    </div>
  );
}
