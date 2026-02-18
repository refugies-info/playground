"use client";

import { SourcePane } from "./SourcePane";
import { TranslationProvider } from "./TranslationContext";
import { TranslationEditorPane } from "./TranslationEditorPane";
import { TranslationSidebar } from "./TranslationSidebar";
import { TranslationTopBar } from "./TranslationTopBar";

// import { Toaster } from "sonner";

interface TranslationLayoutProps {
  // biome-ignore lint/suspicious/noExplicitAny: generic data prop
  initialData: any; // Type matches TranslationData
}

export function TranslationLayout({ initialData }: TranslationLayoutProps) {
  return (
    <TranslationProvider initialData={initialData}>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-white">
        <TranslationTopBar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Actions */}
          <TranslationSidebar />
          {/* Center Pane: Source */}
          <SourcePane />
          {/* Right Pane: Translation */}
          <div className="w-px bg-gray-200" /> {/* Divider */}
          <TranslationEditorPane />
        </div>
      </div>
      {/* <Toaster position="bottom-right" /> */}
    </TranslationProvider>
  );
}
