"use client";

import {
  RiCheckLine,
  RiCloseLine,
  RiDatabaseLine,
  RiDeleteBinLine,
  RiFileTextLine,
} from "@playground/ui/icons";
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
} from "@playground/ui/overlays";
import { BoutonMenu, Button } from "@playground/ui/primitives";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "./TranslationContext";

export function TranslationSidebar() {
  const { translation } = useTranslation();
  const pathname = usePathname();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!translation) return null;

  const baseUrl = `/translations/${translation.id}`;
  const isContentActive = pathname === baseUrl;
  const isMetadataActive = pathname === `${baseUrl}/metadata`;

  const canArchive = translation.onlineStatus !== "archived";

  return (
    <div className="sticky top-20 self-start h-[calc(100vh-5rem)] flex-shrink-0 w-63 flex flex-col py-12 px-10">
      <div className="flex flex-col gap-14">
        <div className="flex flex-col gap-6">
          <nav
            className="flex flex-col gap-2"
            aria-label="Navigation de la traduction"
          >
            <Link href={baseUrl} className="w-full">
              <BoutonMenu
                icon={RiFileTextLine}
                label="Contenu"
                active={isContentActive}
                className="w-full"
              />
            </Link>

            <Link href={`${baseUrl}/metadata`} className="w-full">
              <BoutonMenu
                icon={RiDatabaseLine}
                label="Métadonnées"
                active={isMetadataActive}
                className="w-full"
              />
            </Link>
          </nav>

          {canArchive && (
            <Popover open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <PopoverAnchor asChild>
                <BoutonMenu
                  icon={RiDeleteBinLine}
                  label="Archiver"
                  variant="error"
                  onClick={() => setIsConfirmOpen(true)}
                  className="w-full"
                />
              </PopoverAnchor>
              <PopoverContent
                side="right"
                className="w-[388px] flex flex-col gap-7"
              >
                <p className="text-base leading-6 text-[var(--text-default-grey,#3a3a3a)]">
                  Êtes-vous sûr de vouloir archiver cette traduction ?
                </p>
                <div className="flex justify-end items-center gap-4">
                  <PopoverClose asChild>
                    <Button variant="tertiaire" rightIcon={RiCloseLine}>
                      Annuler
                    </Button>
                  </PopoverClose>
                  <Button
                    variant="primaire"
                    rightIcon={RiCheckLine}
                    onClick={() => {
                      setIsConfirmOpen(false);
                    }}
                  >
                    Archiver
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}
