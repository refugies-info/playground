"use client";

import { logger } from "@playground/shared-types";
import { cn } from "@playground/ui";
import {
  RiCodeSSlashLine,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiFileTextLine,
  RiHammerLine,
  RiPencilLine,
} from "@playground/ui/icons";
import {
  Icon,
  IconToggle,
  type IconToggleOption,
} from "@playground/ui/primitives";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDocumentActions } from "../actions/DocumentActionsContext";
import { useDocument } from "../DocumentContext";

interface EditorNavigationProps {
  from?: string;
}

/** Options du toggle éditeur visuel / markdown brut */
const EDITOR_MODE_OPTIONS: IconToggleOption<"visual" | "raw">[] = [
  { value: "visual", icon: RiPencilLine, label: "Éditeur visuel" },
  { value: "raw", icon: RiCodeSSlashLine, label: "Markdown brut" },
];

/** Style commun d'un item de menu */
const menuItemBase =
  "flex items-center gap-2 w-full px-3 py-1 rounded-[2px] text-sm font-medium transition-colors cursor-pointer select-none";

/**
 * EditorNavigation — Sidebar gauche de l'écran d'édition de document.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1415-7009
 */
export function EditorNavigation({ from }: EditorNavigationProps) {
  const { document, isRawMarkdownMode, setIsRawMarkdownMode } = useDocument();
  const { archiveDocument, isArchiving } = useDocumentActions();
  const pathname = usePathname();
  const router = useRouter();
  const fromSuffix = from ? `?from=${encodeURIComponent(from)}` : "";

  if (!document) return null;

  const baseUrl = `/documents/${document.id}`;
  const isFicheActive = pathname === baseUrl;
  const isMetadataActive = pathname === `${baseUrl}/metadata`;
  const isComplianceActive = pathname === `${baseUrl}/compliance`;

  const isCompliant = document.complianceStatus === "compliant";
  const isNonCompliant = document.complianceStatus === "non_compliant";
  const canArchive =
    !!document.publicationRemoteId && document.onlineStatus !== "archived";

  const handleArchive = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir archiver ce document ? Il ne sera plus visible publiquement.",
      )
    ) {
      return;
    }
    // On attend que le channel soit SUBSCRIBED avant de lancer le workflow.
    // .subscribe() est async (WebSocket) — lancer archiveDocument() immédiatement
    // après crée une race condition si l'INSERT arrive avant l'établissement.
    const supabase = createClient();
    const startedAt = new Date().toISOString();
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    let fallbackTimeout: ReturnType<typeof setTimeout>;
    // biome-ignore lint/suspicious/noExplicitAny: channel assigned in Promise below
    let channel: any;

    const cleanup = () => {
      supabase.removeChannel(channel);
      fallbackInterval && clearInterval(fallbackInterval);
      clearTimeout(fallbackTimeout);
    };

    const handleRefresh = () => {
      cleanup();
      router.refresh();
    };

    await new Promise<void>((resolve) => {
      channel = supabase // eslint-disable-line prefer-const
        .channel(`archive-${document.id}-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "publication_records",
            filter: `workflow_id=eq.${document.id}`,
          },
          (payload) => {
            logger.info(
              { record: payload.new, workflowId: document.id },
              "Realtime INSERT received (archive)",
            );
            if (payload.new.status === "archived") handleRefresh();
          },
        )
        .subscribe((status, err) => {
          logger.info(
            { status, workflowId: document.id },
            "Realtime channel status (archive)",
          );
          if (err)
            logger.error(
              { err, workflowId: document.id },
              "Realtime channel error (archive)",
            );
          if (status === "SUBSCRIBED") resolve();
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") resolve();
        });
    });

    // Polling de secours toutes les 3s — le Realtime est non fiable
    // pour les inserts faits par le backend Vercel (RLS + service role).
    fallbackTimeout = setTimeout(() => {
      fallbackInterval = setInterval(async () => {
        const { data } = await supabase
          .from("publication_records")
          .select("status")
          .eq("workflow_id", document.id)
          .eq("status", "archived")
          .gte("created_at", startedAt)
          .maybeSingle();
        if (data) handleRefresh();
      }, 3_000);
    }, 3_000);

    const result = await archiveDocument();
    if (!result.success) cleanup();
  };

  return (
    <div className="absolute left-0 top-0 h-full z-10 flex flex-col bg-white py-12 px-10 shadow-[2px_0px_6px_0px_rgba(0,0,18,0.16)]">
      {/* Menu principal */}
      <nav className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 w-48">
          {/* Contenu */}
          <Link href={`${baseUrl}${fromSuffix}`}>
            <span
              className={cn(
                menuItemBase,
                isFicheActive
                  ? "bg-[var(--background-alt-blue-france)] text-[var(--blue-france-sun-113-625-hover)]"
                  : "text-[var(--text-mention-grey)]",
              )}
            >
              <Icon icon={RiFileTextLine} size="sm" />
              Contenu
            </span>
          </Link>

          {/* Métadonnées */}
          <Link href={`${baseUrl}/metadata${fromSuffix}`}>
            <span
              className={cn(
                menuItemBase,
                isMetadataActive
                  ? "bg-[var(--background-alt-blue-france)] text-[var(--blue-france-sun-113-625-hover)]"
                  : "text-[var(--text-mention-grey)]",
              )}
            >
              <Icon icon={RiDatabase2Line} size="sm" />
              Métadonnées
            </span>
          </Link>

          {/* Arbitrage + badge conformité à l'intérieur */}
          <Link href={`${baseUrl}/compliance${fromSuffix}`}>
            <span
              className={cn(
                menuItemBase,
                isComplianceActive
                  ? "bg-[var(--background-alt-blue-france)] text-[var(--blue-france-sun-113-625-hover)]"
                  : "text-[var(--text-mention-grey)]",
              )}
            >
              <Icon icon={RiHammerLine} size="sm" />
              <span className="flex-1">Arbitrage</span>
              {isCompliant && (
                <span className="flex items-center justify-center size-5 shrink-0 rounded-xs bg-[var(--background-contrast-info)]">
                  <span className="size-2 rounded-full bg-[var(--text-default-info)]" />
                </span>
              )}
              {isNonCompliant && (
                <span className="flex items-center justify-center size-5 shrink-0 rounded-xs bg-[var(--background-contrast-warning)]">
                  <span className="size-2 rounded-full bg-[var(--text-default-warning)]" />
                </span>
              )}
            </span>
          </Link>
        </div>

        {/* Archiver — visible uniquement si publié, avec transition */}
        <div
          className={cn(
            "w-48 transition-all duration-300 ease-in-out overflow-hidden",
            canArchive
              ? "max-h-12 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none",
          )}
        >
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving || !canArchive}
            className={cn(
              menuItemBase,
              "text-[var(--text-default-error)] disabled:opacity-50",
            )}
          >
            <Icon icon={RiDeleteBinLine} size="sm" />
            {isArchiving ? "Archivage..." : "Archiver"}
          </button>
        </div>
      </nav>

      {/* Toggle éditeur — gap 56px sous le menu (Figma) */}
      <div className="mt-14">
        <IconToggle
          options={EDITOR_MODE_OPTIONS}
          value={isRawMarkdownMode ? "raw" : "visual"}
          onChange={(mode) => setIsRawMarkdownMode(mode === "raw")}
        />
      </div>
    </div>
  );
}
