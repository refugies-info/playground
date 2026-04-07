import { BoutonFiltre } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

/**
 * Filtre à sélection unique — Popover Radix avec liste d'options radio.
 *
 * Actif → fond bleu France, label remplacé, croix pour effacer.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1308-4566
 */
const meta: Meta<typeof BoutonFiltre> = {
  component: BoutonFiltre,
  title: "Primitives/BoutonFiltre",
  tags: ["autodocs"],
  args: {
    label: "Conformité",
    options: [
      { label: "En cours", value: "pending" },
      { label: "Conforme", value: "compliant" },
      { label: "Non conforme", value: "non_compliant" },
      { label: "Erreur", value: "error" },
    ],
    value: "",
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** État par défaut — aucune sélection, affiche le label + chevron */
export const Inactif: Story = {
  args: { value: "" },
};

/** Une option sélectionnée — fond bleu, label remplacé, icône croix */
export const Actif: Story = {
  args: { value: "compliant" },
};

/** Sélectionne et désélectionne une option en live */
export const Interactif: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <BoutonFiltre {...args} value={value} onChange={setValue} />;
  },
};

/** Les 4 filtres de la page Fiches côte à côte — gap 16px comme dans le Figma */
export const BarreFiltres: Story = {
  render: () => {
    const [auteur, setAuteur] = useState("");
    const [visibilite, setVisibilite] = useState("");
    const [traitement, setTraitement] = useState("");
    const [conformite, setConformite] = useState("");

    return (
      <div className="flex flex-wrap items-center gap-4">
        <BoutonFiltre
          label="Auteur·ice"
          options={[
            { label: "Alice", value: "alice@example.com" },
            { label: "Claudia", value: "claudia@example.com" },
            { label: "Xavier", value: "xavier@example.com" },
          ]}
          value={auteur}
          onChange={setAuteur}
        />
        <BoutonFiltre
          label="Statut de publication"
          options={[
            { label: "Publié", value: "published" },
            { label: "Archivé", value: "archived" },
          ]}
          value={visibilite}
          onChange={setVisibilite}
        />
        <BoutonFiltre
          label="État de traitement"
          options={[
            { label: "Brouillon", value: "draft" },
            { label: "À traiter", value: "to_process" },
          ]}
          value={traitement}
          onChange={setTraitement}
        />
        <BoutonFiltre
          label="Conformité"
          options={[
            { label: "En cours", value: "pending" },
            { label: "Conforme", value: "compliant" },
            { label: "Non conforme", value: "non_compliant" },
            { label: "Erreur", value: "error" },
          ]}
          value={conformite}
          onChange={setConformite}
        />
      </div>
    );
  },
};
