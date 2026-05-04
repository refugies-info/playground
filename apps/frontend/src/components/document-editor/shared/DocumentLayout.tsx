"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DocumentActionsProvider } from "../actions";
import { DocumentProvider } from "../DocumentContext";
import { MetadataProvider } from "../metadata/MetadataContext";
import { AIFloatingButton } from "./AIFloatingButton";
import { EditorNavigation } from "./EditorNavigation";
import { HeaderFicheConnected } from "./HeaderFicheConnected";
import { SourcePanel } from "./SourcePanel";
import { SourceToggleButton } from "./SourceToggleButton";

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
            {/* Header fiche */}
            <HeaderFicheConnected from={from} userEmail={userEmail} />

            {/* Main Content Area */}
            <div className="flex flex-row flex-1 relative overflow-hidden">
              {/* Left Editor Navigation — flex item, prend sa place dans le flux */}
              <EditorNavigation from={from} />

              {/* Center Editor / Content — flex-1 flex-col pour propager la hauteur à EditionView */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {children}
              </div>

              {/* Source Panel — en flux à droite, pousse le contenu vers la gauche */}
              <SourcePanel />

              {/* Source Toggle Button — absolute top-right, figé dans le content row */}
              <SourceToggleButton />

              {/* AI Floating Button — absolute bottom-right */}
              <AIFloatingButton />
            </div>
          </div>
        </DocumentActionsProvider>
      </MetadataProvider>
    </DocumentProvider>
  );
}
