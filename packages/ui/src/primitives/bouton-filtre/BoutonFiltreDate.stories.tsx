import { BoutonFiltreDate } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

/**
 * Input date stylisé comme un BoutonFiltre (pill).
 * Inactif → ouvre le date picker natif via showPicker().
 * Actif   → affiche la date formatée + icône croix pour clear.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1264-7549
 */
const meta: Meta<typeof BoutonFiltreDate> = {
  component: BoutonFiltreDate,
  title: "Primitives/BoutonFiltreDate",
  tags: ["autodocs"],
  args: {
    label: "jj/mm/aaaa",
    value: "",
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** État par défaut — aucune date sélectionnée, icône calendrier */
export const Inactif: Story = {
  args: { value: "" },
};

/** Une date sélectionnée — fond bleu, date formatée dd/mm/yyyy, icône croix */
export const Actif: Story = {
  args: { value: "2026-03-15" },
};

/** Interactif — ouvre le date picker et affiche la date sélectionnée */
/** Ouvre le date picker natif et affiche la date formatée */
export const Interactif: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <BoutonFiltreDate {...args} value={value} onChange={setValue} />;
  },
};

/** Groupe date de session tel qu'il apparaît dans la barre Fiches */
/** Groupe "Date de session — De … à …" tel qu'il apparaît dans la barre Fiches */
export const GroupeDateSession: Story = {
  render: () => {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#3A3A3A]">
          Date de session
        </span>
        <BoutonFiltreDate value={dateFrom} onChange={setDateFrom} />
        <span className="text-sm text-[#3A3A3A]">à</span>
        <BoutonFiltreDate value={dateTo} onChange={setDateTo} />
      </div>
    );
  },
};
