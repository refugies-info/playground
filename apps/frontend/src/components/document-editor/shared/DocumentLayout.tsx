"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DocumentActionsProvider } from "../actions";
import { AssistantPanel } from "../assistant/AssistantPanel";
import { DocumentProvider } from "../DocumentContext";
import { MetadataProvider } from "../metadata/MetadataContext";
import { EditorNavigation } from "./EditorNavigation";
import { TopBar } from "./TopBar";

// Disable SSR for DebugPanel to avoid hydration mismatch from Radix UI random IDs
const DebugPanel = dynamic(
  () => import("./DebugPanel").then((mod) => mod.DebugPanel),
  {
    ssr: false,
  },
);

interface DocumentLayoutProps {
  documentId: string;
  // biome-ignore lint/suspicious/noExplicitAny: Generic initial data
  initialData?: any; // Replace with proper type
  children: React.ReactNode;
}

export function DocumentLayout(props: DocumentLayoutProps) {
  const { initialData, children } = props;

  // Read `from` once on mount — persists across tab navigation since layout doesn't remount
  const [from, setFrom] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get("from");
    if (fromParam) setFrom(fromParam);
  }, []);

  return (
    <DocumentProvider initialData={initialData}>
      <MetadataProvider>
        <DocumentActionsProvider>
          <DebugPanel />
          <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100">
            {/* Top Toolbar */}
            <TopBar from={from} />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar */}
              <EditorNavigation from={from} />

              {/* Center Editor / Content */}
              {children}

              {/* Right Chat */}
              <AssistantPanel />
            </div>
          </div>
        </DocumentActionsProvider>
      </MetadataProvider>
    </DocumentProvider>
  );
}
