"use client";

import { DocumentProvider } from "./DocumentContext";
import { EditorChat } from "./EditorChat";
import { EditorSidebar } from "./EditorSidebar";
import { EditorToolbar } from "./EditorToolbar";
import { MarkdownEditor } from "./MarkdownEditor";

interface DocumentEditorLayoutProps {
  documentId: string;
  // biome-ignore lint/suspicious/noExplicitAny: Generic initial data
  initialData?: any; // Replace with proper type
}

export function DocumentEditorLayout({
  documentId: _documentId,
  initialData,
}: DocumentEditorLayoutProps) {
  return (
    <DocumentProvider initialData={initialData}>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100">
        {/* Top Toolbar */}
        <EditorToolbar />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <EditorSidebar />

          {/* Center Editor */}
          <MarkdownEditor />

          {/* Right Chat */}
          <EditorChat />
        </div>
      </div>
    </DocumentProvider>
  );
}
