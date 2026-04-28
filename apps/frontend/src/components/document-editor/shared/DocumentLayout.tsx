"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DocumentActionsProvider } from "../actions";
import { AssistantPanel } from "../assistant/AssistantPanel";
import { DocumentProvider } from "../DocumentContext";
import { MetadataProvider } from "../metadata/MetadataContext";
import { EditorNavigation } from "./EditorNavigation";
import { HeaderFicheConnected } from "./HeaderFicheConnected";

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
  /** Email de l'utilisateur connecté — pour l'avatar dans le header */
  userEmail?: string | null;
}

export function DocumentLayout(props: DocumentLayoutProps) {
  const { initialData, children, userEmail } = props;

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
          {/* Editor Area — fond blanc + arrondis fournis par le layout parent (main) */}
          <div className="flex flex-col flex-1 h-full overflow-hidden">
            {/* Header fiche — remplace TopBar */}
            <HeaderFicheConnected from={from} userEmail={userEmail} />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Editor Navigation */}
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
