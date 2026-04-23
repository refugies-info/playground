import type { Meta, StoryObj } from "@storybook/react";
import { RiArrowLeftSLine, RiEyeLine, RiSendPlaneLine } from "../../icons";
import { Avatar } from "../../primitives/avatar";
import { Badge } from "../../primitives/badge/Badge";
import { Button } from "../../primitives/button/Button";
import { Conformite } from "../../primitives/conformite/Conformite";
import { Tag } from "../../primitives/tag/Tag";
import { HeaderFiche } from "./HeaderFiche";

/**
 * HeaderFiche — Barre de navigation de l'éditeur de fiche.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1739-8632
 *
 * Composite avec 3 slots (left / center / right).
 * Les stories mockent le contenu réel tel qu'il apparaît dans l'éditeur.
 */
const meta: Meta<typeof HeaderFiche> = {
  title: "Composites/HeaderFiche",
  component: HeaderFiche,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Helpers de mock — reproduisent fidèlement les slots réels du frontend
// ---------------------------------------------------------------------------

const BoutonRetour = () => (
  <Button variant="quatrieme" size="sm" className="gap-1.5 px-2">
    <RiArrowLeftSLine className="w-4 h-4" />
    <span className="text-xs">Retour</span>
  </Button>
);

const SlotPreviewPublier = () => (
  <>
    <Button variant="tertiaire" size="sm" className="gap-2">
      <RiEyeLine className="w-4 h-4" />
      Prévisualiser
    </Button>
    <Button variant="primaire" size="sm" className="gap-2">
      <RiSendPlaneLine className="w-4 h-4" />
      Publier
    </Button>
  </>
);

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Fiche brouillon — conforme, non publiée */
export const Brouillon: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        {/* IndicationSauvegarde — placeholder jusqu'à l'étape 2 */}
        <span className="text-xs font-medium text-[#666]">À enregistrer</span>
        <Conformite value="conforme" />
        <Tag status="en-cours" />
        <Avatar email="alice@refugies.info" />
      </>
    ),
    center: "Formation langue française — Alliance Française de Paris",
    right: <SlotPreviewPublier />,
  },
};

/** Fiche publiée */
export const Publiee: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <span className="text-xs font-medium text-[#18753c]">Enregistré</span>
        <Conformite value="conforme" />
        <Tag status="publie" />
        <Avatar email="alice@refugies.info" />
      </>
    ),
    center: "Formation langue française — Alliance Française de Paris",
    right: <SlotPreviewPublier />,
  },
};

/** Fiche non conforme — archivée */
export const NonConforme: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <span className="text-xs font-medium text-[#666]">Enregistré</span>
        <Conformite value="non-conforme" />
        <Tag status="archive" />
        <Avatar email="xavier@refugies.info" />
      </>
    ),
    center: "Aide juridique — Mission locale",
    right: <SlotPreviewPublier />,
  },
};

/** Arbitrage en cours */
export const ArbitrageEnCours: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <span className="text-xs font-medium text-[#666]">En cours...</span>
        <Badge variant="neutral">En cours d&apos;arbitrage</Badge>
        <Avatar email="claudia@refugies.info" />
      </>
    ),
    center: "Hébergement d'urgence — Croix-Rouge française",
    right: <SlotPreviewPublier />,
  },
};

/** Slots vides — vérifie que le layout tient sans contenu */
export const Vide: Story = {
  args: {},
};
