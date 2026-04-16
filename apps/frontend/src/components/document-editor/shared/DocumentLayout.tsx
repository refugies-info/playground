"use client";

import { cn } from "@playground/ui";
import { PapaIA } from "@playground/ui/primitives";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DocumentActionsProvider } from "../actions";
import { useAssistant } from "../assistant/useAssistant";
import { DocumentProvider } from "../DocumentContext";
import { MetadataProvider } from "../metadata/MetadataContext";
import { EditorNavigation } from "./EditorNavigation";
import { HeaderFiche } from "./HeaderFiche";

/** Read `from` query param once on mount — persists across tab navigation since layout doesn't remount */
function useFromParam() {
  const [from, setFrom] = useState("");
  useEffect(() => {
    const fromParam = new URLSearchParams(window.location.search).get("from");
    if (fromParam) setFrom(fromParam);
  }, []);
  return from;
}

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

function PapaIAFab() {
  const { toggle, isProcessing } = useAssistant();
  return (
    <div
      className={cn(
        "absolute bottom-8 right-8 z-20",
        isProcessing && "animate-pulse",
      )}
    >
      <PapaIA
        variant={isProcessing ? "loading" : "default"}
        onClick={toggle}
        aria-label={
          isProcessing ? "Annuler la génération" : "Améliorer avec l'IA"
        }
      />
    </div>
  );
}

export function DocumentLayout(props: DocumentLayoutProps) {
  const { initialData, children } = props;
  const from = useFromParam();

  return (
    <DocumentProvider initialData={initialData}>
      <MetadataProvider>
        <DocumentActionsProvider>
          <DebugPanel />
          <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100">
            {/* Top Toolbar */}
            <HeaderFiche />

            {/* Main Content Area */}
            <div className="relative flex-1 overflow-hidden">
              {/* Nav — absolute left, overlay */}
              <EditorNavigation from={from} />

              {/* Content — pleine largeur */}
              {children}

              {/* PapaIA FAB */}
              <PapaIAFab />
            </div>
          </div>
        </DocumentActionsProvider>
      </MetadataProvider>
    </DocumentProvider>
  );
}
