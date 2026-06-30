"use client";

import {
  RiCodeSSlashLine,
  RiFileTextLine,
  RiPencilLine,
} from "@playground/ui/icons";
import { BoutonMenu, SegmentedControl } from "@playground/ui/primitives";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "./TranslationContext";

const EDITOR_MODES = [
  { value: "visual" as const, icon: RiPencilLine, label: "Visuel" },
  { value: "raw" as const, icon: RiCodeSSlashLine, label: "Markdown" },
];

export function TranslationSidebar() {
  const { translation, isRawMarkdownMode, setIsRawMarkdownMode } =
    useTranslation();
  const pathname = usePathname();

  if (!translation) return null;

  const baseUrl = `/translations/${translation.id}`;
  const isContentActive = pathname === baseUrl;

  return (
    <div className="sticky top-20 self-start h-[calc(100vh-5rem)] flex-shrink-0 w-63 flex flex-col py-12 px-10">
      <div className="flex flex-col gap-14">
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
        </nav>

        {isContentActive && (
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
    </div>
  );
}
