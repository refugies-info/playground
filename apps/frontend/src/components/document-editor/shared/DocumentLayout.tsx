"use client";

import { cn } from "@playground/ui";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentActionsProvider } from "../actions";
import { DocumentProvider, useDocument } from "../DocumentContext";
import { MetadataProvider } from "../metadata/MetadataContext";
import { AIFloatingButton } from "./AIFloatingButton";
import { ContentProvider, useContentContext } from "./ContentContext";
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

/**
 * Wrapper du contenu central.
 *
 * Onglet Contenu :
 * - Source fermée → pr-64 pour compenser l'asymétrie du sidebar
 * - Source ouverte → pr-0, alignement gauche pour laisser la place
 * - transition-[padding] activée uniquement pendant l'animation source
 *   (via ContentContext.activatePaddingTransition)
 *
 * Autres onglets : pleine largeur, pas de transition.
 */
function CenterContent({
  children,
  isContentTab,
}: {
  children: React.ReactNode;
  isContentTab: boolean;
}) {
  const { isSourceOpen } = useDocument();
  const { isPaddingTransitionActive } = useContentContext();

  return (
    <div
      className={cn(
        "flex-1 flex flex-col min-w-0",
        isPaddingTransitionActive && "transition-[padding] duration-300",
        isContentTab && !isSourceOpen && "pr-64",
      )}
    >
      {children}
    </div>
  );
}

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

  // Read `from` once on mount — persists across tab navigation since layout
  // doesn't remount. useEffect garantit que window n'est lu que côté client
  // (évite hydration mismatch vs lazy init avec typeof window !== "undefined").
  const [from, setFrom] = useState("");
  useEffect(() => {
    const fromParam = new URLSearchParams(window.location.search).get("from");
    if (fromParam) setFrom(fromParam);
  }, []);

  const pathname = usePathname();
  // Source uniquement sur l'onglet Contenu (route exacte /documents/[id])
  const isContentTab = pathname === `/documents/${props.documentId}`;

  return (
    <DocumentProvider initialData={initialData}>
      <MetadataProvider>
        <DocumentActionsProvider>
          <ContentProvider>
            <DebugPanel />
            {/* Editor Area — fond blanc + arrondis fournis par le layout parent (main) */}
            <div className="flex flex-col flex-1">
              {/* Header fiche */}
              <HeaderFicheConnected from={from} userEmail={userEmail} />

              {/* Main Content Area */}
              <div className="flex flex-row flex-1 relative">
                {/* Left Editor Navigation — flex item, prend sa place dans le flux */}
                <EditorNavigation from={from} />

                {/* Center Editor / Content — centré visuellement par rapport au header */}
                <CenterContent isContentTab={isContentTab}>
                  {children}
                </CenterContent>

                {/* Source Panel + Toggle — uniquement sur l'onglet Contenu */}
                {isContentTab && <SourcePanel />}
                {isContentTab && <SourceToggleButton />}

                {/* AI Floating Button — absolute bottom-right */}
                <AIFloatingButton />
              </div>
            </div>
          </ContentProvider>
        </DocumentActionsProvider>
      </MetadataProvider>
    </DocumentProvider>
  );
}
