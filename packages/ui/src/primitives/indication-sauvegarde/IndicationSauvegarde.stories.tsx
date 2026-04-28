import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IndicationSauvegarde } from "./IndicationSauvegarde";

/**
 * IndicationSauvegarde — Indicateur d'état de sauvegarde cliquable.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1361-7769
 *
 * - `saved`   → dot vert  + "Enregistré"
 * - `saving`  → spinner  + "En cours..."
 * - `unsaved` → dot orange + "À enregistrer" (cliquable)
 * - `error`   → dot rouge + "Erreur" (cliquable → réessai)
 */
const meta: Meta<typeof IndicationSauvegarde> = {
  title: "Primitives/IndicationSauvegarde",
  component: IndicationSauvegarde,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** État sauvegardé — dot vert, non interactif */
export const Enregistre: Story = {
  args: {
    status: "saved",
  },
};

/** Sauvegarde en cours — spinner animé, non interactif */
export const EnCours: Story = {
  args: {
    status: "saving",
  },
};

/** Modifications non enregistrées — dot orange, cliquable */
export const AEnregistrer: Story = {
  args: {
    status: "unsaved",
    onSave: () => alert("Sauvegarde déclenchée !"),
  },
};

/** Erreur d'enregistrement — dot rouge, cliquable pour réessayer */
export const Erreur: Story = {
  args: {
    status: "error",
    onSave: () => alert("Réessai déclenché !"),
  },
};

/**
 * Story interactive — simule le cycle complet unsaved → saving → saved/error.
 * Cliquer sur "À enregistrer" déclenche une sauvegarde fictive de 1,5s.
 * Boutons pour simuler succès ou échec.
 */
export const CycleComplet: Story = {
  name: "Cycle complet (interactif)",
  render: () => {
    const [status, setStatus] = useState<
      "saved" | "saving" | "unsaved" | "error"
    >("unsaved");

    const handleSave = (succeed = true) => {
      setStatus("saving");
      setTimeout(() => setStatus(succeed ? "saved" : "error"), 1500);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <IndicationSauvegarde status={status} onSave={() => handleSave(true)} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatus("unsaved")}
            className="text-xs text-gray-400 underline"
          >
            Remettre à « À enregistrer »
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="text-xs text-red-400 underline"
          >
            Simuler une erreur
          </button>
        </div>
      </div>
    );
  },
};

/** Les 4 états côte à côte pour comparaison visuelle */
export const TousLesEtats: Story = {
  name: "Tous les états",
  render: () => (
    <div className="flex items-center gap-8 p-4 bg-white border rounded">
      <IndicationSauvegarde status="saved" />
      <IndicationSauvegarde status="saving" />
      <IndicationSauvegarde status="unsaved" onSave={() => {}} />
      <IndicationSauvegarde status="error" onSave={() => {}} />
    </div>
  ),
};
