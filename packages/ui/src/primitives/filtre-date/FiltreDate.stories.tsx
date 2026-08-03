import { FiltreDate, type FiltreDateValue } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

/**
 * Filtre de date composite de la liste des fiches : type de date + condition
 * + pickerdate. La condition pilote le nombre de champs date affichés.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=4800-27044
 */
const meta: Meta<typeof FiltreDate> = {
  component: FiltreDate,
  title: "Primitives/FiltreDate",
  tags: ["autodocs"],
  args: {
    typeOptions: [
      { label: "Début de session", value: "session_start" },
      { label: "Fin de session", value: "session_end" },
      { label: "Import", value: "import" },
      { label: "Arbitrage", value: "arbitration" },
      { label: "Archivage", value: "archive" },
      { label: "Publication", value: "publication" },
    ],
    conditionOptions: [
      { label: "À partir de", value: "from" },
      { label: "Jusqu'à", value: "until" },
      { label: "Entre", value: "between" },
    ],
    defaultCondition: "until",
    rangeCondition: "between",
    upperBoundConditions: ["until"],
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const EMPTY: FiltreDateValue = {
  type: "",
  condition: "",
  from: "",
  to: "",
};

/** État initial — les deux dropdowns affichent leur nom, un seul champ date */
export const Defaut: Story = {
  args: { value: EMPTY },
};

/** Type et condition sélectionnés — dropdowns en bleu, date renseignée */
export const Actif: Story = {
  args: {
    value: {
      type: "publication",
      condition: "until",
      from: "",
      to: "2026-09-30",
    },
  },
};

/** Condition "Entre" — deux champs date dans un seul pickerdate */
export const Intervalle: Story = {
  args: {
    value: {
      type: "session_start",
      condition: "between",
      from: "2026-07-01",
      to: "2026-09-30",
    },
  },
};

/** Condition "Entre", après le 1er des 2 clics — la borne haute reste à saisir */
export const IntervallePartiel: Story = {
  args: {
    value: {
      type: "session_start",
      condition: "between",
      from: "2026-07-01",
      to: "",
    },
  },
};

/**
 * Interactif — changer la condition réinitialise les dates, changer le type
 * les conserve.
 */
export const Interactif: Story = {
  render: (args) => {
    const [value, setValue] = useState<FiltreDateValue>(EMPTY);
    return <FiltreDate {...args} value={value} onChange={setValue} />;
  },
};
