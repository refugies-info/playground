"use client";

import { cn } from "@playground/ui";
import {
  RiCheckLine,
  RiCloseLine,
  RiCodeSSlashLine,
  RiDatabaseLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiHammerLine,
  RiNewspaperLine,
  RiPencilLine,
} from "@playground/ui/icons";
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
} from "@playground/ui/overlays";
import {
  BoutonMenu,
  Button,
  IndicationConformite,
  SegmentedControl,
} from "@playground/ui/primitives";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDocumentActions } from "../actions";
import { useDocument } from "../DocumentContext";
import { useMetadata } from "../metadata/MetadataContext";

/**
 * EditorNavigation — Menu latéral de navigation de la fiche.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1415-7009
 *
 * Structure :
 *   - Items de navigation : Contenu, Métadonnées, Arbitrage (+ badge conformité)
 *   - Bouton Archiver (variant error)
 *   - SegmentedControl : Visuel / Markdown
 *   - (futur) Compteur de tokens
 */
interface EditorNavigationProps {
  from?: string;
}

const EDITOR_MODES = [
  { value: "visual" as const, icon: RiPencilLine, label: "Visuel" },
  { value: "raw" as const, icon: RiCodeSSlashLine, label: "Markdown" },
];

export function EditorNavigation({ from }: EditorNavigationProps) {
  const { document, isRawMarkdownMode, setIsRawMarkdownMode } = useDocument();
  const { hasMetadataErrors } = useMetadata();
  const { archiveDocument, isArchiving } = useDocumentActions();
  const pathname = usePathname();
  const router = useRouter();
  const fromSuffix = from ? `?from=${encodeURIComponent(from)}` : "";

  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!document) return null;

  const baseUrl = `/documents/${document.id}`;
  const isFicheActive = pathname === baseUrl;
  const isMetadataActive = pathname === `${baseUrl}/metadata`;
  const isActivityLogActive = pathname === `${baseUrl}/activity-logs`;
  const isComplianceActive = pathname === `${baseUrl}/compliance`;

  const isPublished = document.onlineStatus === "published";
  const canArchive = document.onlineStatus !== "archived";
  const archiveConfirmationMessage = isPublished
    ? "Êtes-vous sûr de vouloir archiver cette fiche ? Elle ne sera plus visible sur le site par les usagers."
    : "Êtes-vous sûr de vouloir archiver cette fiche ? Elle sera marquée comme archivée sans jamais avoir été publiée.";

  const handleArchive = async () => {
    setArchiveError(null);
    const result = await archiveDocument();
    if (result.success) {
      router.refresh();
    } else {
      setArchiveError(result.error || "Échec de l'archivage");
    }
  };

  return (
    <div className="sticky top-20 self-start h-[calc(100vh-5rem)] flex-shrink-0 w-65 flex flex-col justify-between py-12 px-10">
      {/* Partie supérieure — gap 56px (Figma) */}
      <div className="flex flex-col gap-14">
        {/* Contenu — gap 24px (Figma) */}
        <div className="flex flex-col gap-6">
          {/* Items de navigation — gap 8px (Figma) */}
          <nav
            className="flex flex-col gap-2"
            aria-label="Navigation de la fiche"
          >
            <Link href={`${baseUrl}${fromSuffix}`} className="w-full">
              <BoutonMenu
                icon={RiFileTextLine}
                label="Contenu"
                active={isFicheActive}
                className="w-full"
              />
            </Link>

            <Link href={`${baseUrl}/metadata${fromSuffix}`} className="w-full">
              <BoutonMenu
                icon={RiDatabaseLine}
                label="Métadonnées"
                active={isMetadataActive}
                className={cn("w-full", hasMetadataErrors && "relative")}
              />
            </Link>

            <Link
              href={`${baseUrl}/activity-logs${fromSuffix}`}
              className="w-full"
            >
              <BoutonMenu
                icon={RiNewspaperLine}
                label="Journal d'activités"
                active={isActivityLogActive}
                className={cn("w-full", hasMetadataErrors && "relative")}
              />
            </Link>

            <Link
              href={`${baseUrl}/compliance${fromSuffix}`}
              className="w-full"
            >
              <BoutonMenu
                icon={RiHammerLine}
                label="Arbitrage"
                active={isComplianceActive}
                className="w-full"
                suffix={
                  document.complianceStatus ? (
                    <IndicationConformite
                      value={
                        document.complianceStatus === "compliant"
                          ? "conforme"
                          : "non-conforme"
                      }
                    />
                  ) : undefined
                }
              />
            </Link>
          </nav>

          {/* Archiver — toujours dans le DOM pour permettre la transition CSS. */}
          <div
            className={cn(
              "flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out",
              canArchive
                ? "max-h-20 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none",
            )}
          >
            <Popover open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <PopoverAnchor asChild>
                <BoutonMenu
                  icon={RiDeleteBinLine}
                  label="Archiver"
                  variant="error"
                  disabled={isArchiving}
                  onClick={() => setIsConfirmOpen(true)}
                  className="w-full"
                />
              </PopoverAnchor>
              <PopoverContent
                side="right"
                className="w-[388px] flex flex-col gap-7"
              >
                <p className="text-base leading-6 text-[var(--text-default-grey,#3a3a3a)]">
                  {archiveConfirmationMessage}
                </p>
                <div className="flex justify-end items-center gap-4">
                  <PopoverClose asChild>
                    <Button
                      variant="tertiaire"
                      rightIcon={RiCloseLine}
                      disabled={isArchiving}
                    >
                      Annuler
                    </Button>
                  </PopoverClose>
                  <Button
                    variant="primaire"
                    rightIcon={RiCheckLine}
                    isLoading={isArchiving}
                    onClick={async () => {
                      await handleArchive();
                      setIsConfirmOpen(false);
                    }}
                  >
                    Archiver
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {archiveError && (
              <p className="text-xs text-[var(--text-default-error)] px-3">
                {archiveError}
              </p>
            )}
          </div>
        </div>

        {/* Toggle markdown — SegmentedControl : uniquement sur l'onglet Contenu */}
        {isFicheActive && (
          <div className="px-2">
            <SegmentedControl
              options={EDITOR_MODES}
              value={isRawMarkdownMode ? "raw" : "visual"}
              onChange={(v) => setIsRawMarkdownMode(v === "raw")}
              aria-label="Mode d'édition"
            />
          </div>
        )}
      </div>

      {/* (futur) Compteur de tokens */}
    </div>
  );
}
