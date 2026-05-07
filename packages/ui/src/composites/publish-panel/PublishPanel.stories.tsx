import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RiSendPlaneLine } from "../../icons";
import { Button } from "../../primitives/button/Button";
import { PublishPanel } from "./PublishPanel";

/**
 * PublishPanel — Popover de confirmation + résultat de publication.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=2115-11219
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
    defaultOpen: true,
    triggerTranslations: true,
    onToggleTranslations: () => {},
    isUrgent: false,
    onToggleUrgent: () => {},
    onConfirm: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Phase 1 — Confirmation
// ---------------------------------------------------------------------------

/**
 * Interactif — coche/décoche la checkbox pour voir le toggle Urgent
 * apparaître/disparaître avec sa transition.
 */
export const Confirmation: Story = {
  name: "Confirmation — interactif",
  render: (args) => {
    const [triggerTranslations, setTriggerTranslations] = useState(true);
    const [isUrgent, setIsUrgent] = useState(false);
    return (
      <PublishPanel
        {...args}
        triggerTranslations={triggerTranslations}
        onToggleTranslations={(v) => {
          setTriggerTranslations(v);
          if (!v) setIsUrgent(false);
        }}
        isUrgent={isUrgent}
        onToggleUrgent={setIsUrgent}
      />
    );
  },
  parameters: { controls: { disable: true } },
};

/** Urgent activé — checkbox ON + interrupteur ON */
export const ConfirmationUrgent: Story = {
  name: "Confirmation — Urgent activé",
  args: { isUrgent: true },
};

/** Sans traductions — checkbox décochée, toggle masqué */
export const ConfirmationSansTraductions: Story = {
  name: "Confirmation — Sans traductions",
  args: { triggerTranslations: false },
};

/** Loading — bouton Publier en attente */
export const Loading: Story = {
  name: "Confirmation — Loading",
  args: { isPublishing: true },
};

// ---------------------------------------------------------------------------
// Phase 2 & 3 — Résultat
// ---------------------------------------------------------------------------

/** Publication réussie — URL copiable */
export const Succes: Story = {
  name: "Succès",
  args: {
    result: {
      type: "success",
      publishedUrl: "https://refugies.info/dispositif/6507c1a2b3f4e5d6c7a8b9c0",
    },
    onOpenLink: () => {},
  },
};

/** Échec — message d'erreur + Réessayer */
export const Erreur: Story = {
  args: {
    result: {
      type: "error",
      error:
        "Le serveur de publication est injoignable. Vérifiez votre connexion ou réessayez dans quelques instants.",
    },
    onRetry: () => {},
  },
};
