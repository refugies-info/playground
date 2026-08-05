"use client";

import { useTranslation } from "../TranslationContext";
import { TranslationMetadataTable } from "./TranslationMetadataTable";

/**
 * TranslationMetadataView — Page « Métadonnées » de l'espace de traduction.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=3747-23975
 */
export function TranslationMetadataView() {
  const { translation } = useTranslation();

  if (!translation) {
    return <div className="p-4">Traduction non trouvée</div>;
  }

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="px-10 py-6">
        <h1 className="mb-8 text-[40px] font-bold leading-[48px] text-[var(--text-title-grey)]">
          Métadonnées
        </h1>
        <TranslationMetadataTable />
      </div>
    </div>
  );
}
