import type { Meta, StoryObj } from "@storybook/react";
import { RiSendPlaneLine } from "../../icons";
import { Button } from "../../primitives/button/Button";
import { PublishPanel } from "./PublishPanel";

/**
 * PublishPanel — Popover de confirmation + résultat de publication.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1824-25605
 *
 * 3 phases avec transition animée (fade + slide) :
 *   1. Confirmation → description + checkbox + Annuler/Publier
 *   2. Succès       → "La fiche a bien été publiée" + URL copiable + Voir la fiche
 *   3. Erreur       → message d'erreur + Fermer/Réessayer
 */
const meta: Meta<typeof PublishPanel> = {
  title: "Composites/PublishPanel",
  component: PublishPanel,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    trigger: (
      <Button variant="primaire" size="sm" className="gap-2">
        <RiSendPlaneLine className="w-4 h-4" />
        Publier
      </Button>
    ),
    triggerTranslations: true,
    onToggleTranslations: () => {},
    onConfirm: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Phase 1 — Confirmation (état initial) */
export const Confirmation: Story = {
  args: {
    defaultOpen: true,
  },
};

/** Phase 1b — Loading (attente réponse API + Realtime) */
export const Loading: Story = {
  name: "Loading (isPublishing)",
  args: {
    defaultOpen: true,
    isPublishing: true,
  },
};

/** Phase 2 — Succès */
export const Succes: Story = {
  name: "Succès",
  args: {
    defaultOpen: true,
    result: {
      type: "success",
      publishedUrl: "https://refugies.info/dispositif/6507c1a2b3f4e5d6c7a8b9c0",
    },
    onOpenLink: () => {},
  },
};

/** Phase 3 — Erreur */
export const Erreur: Story = {
  args: {
    defaultOpen: true,
    result: {
      type: "error",
      error:
        "Le serveur de publication est injoignable. Vérifiez votre connexion ou réessayez dans quelques instants.",
    },
    onRetry: () => {},
  },
};
