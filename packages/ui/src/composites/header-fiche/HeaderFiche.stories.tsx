import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RiArrowDownSLine, RiArrowLeftSLine, RiEyeLine } from "../../icons";
import { Avatar } from "../../primitives/avatar";
import { Badge } from "../../primitives/badge/Badge";
import { Button } from "../../primitives/button/Button";
import { Conformite } from "../../primitives/conformite/Conformite";
import { IndicationSauvegarde } from "../../primitives/indication-sauvegarde/IndicationSauvegarde";
import { Tag } from "../../primitives/tag/Tag";
import {
  PublishPanel,
  type PublishPanelResult,
} from "../publish-panel/PublishPanel";
import { HeaderFiche } from "./HeaderFiche";

/**
 * HeaderFiche — Barre de navigation de l'éditeur de fiche.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1739-8632
 *
 * Layout : grid 1fr/auto/1fr, px-6 py-6, titre centré mathématiquement.
 * Les stories reproduisent fidèlement le contenu réel de HeaderFicheConnected.
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
// Helpers — reproduisent les slots réels de HeaderFicheConnected
// ---------------------------------------------------------------------------

/** Bouton retour : icône seule, pas de texte */
const BoutonRetour = () => (
  <Button variant="quatrieme" size="sm" className="px-2" aria-label="Retour">
    <RiArrowLeftSLine className="w-4 h-4" />
  </Button>
);

/**
 * Slot RIGHT : Prévisualiser + PublishPanel interactif.
 * Simule le flow complet : confirmation → loading 1.5s → succès.
 */
const SlotActions = () => {
  const [triggerTranslations, setTriggerTranslations] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<PublishPanelResult | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleConfirm = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setResult({
        type: "success",
        publishedUrl:
          "https://refugies.info/dispositif/6507c1a2b3f4e5d6c7a8b9c0",
      });
    }, 1500);
  };

  const handleReset = () => {
    setResult(null);
    setHasCopied(false);
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="tertiaire" size="sm" className="gap-2">
        Prévisualiser
        <RiEyeLine className="w-4 h-4" />
      </Button>
      <PublishPanel
        trigger={
          <Button
            variant="primaire"
            size="sm"
            className="gap-2"
            disabled={isPublishing}
          >
            Publier
            <RiArrowDownSLine className="w-4 h-4" />
          </Button>
        }
        isPublishing={isPublishing}
        result={result}
        onReset={handleReset}
        triggerTranslations={triggerTranslations}
        onToggleTranslations={setTriggerTranslations}
        onConfirm={handleConfirm}
        hasCopied={hasCopied}
        onCopy={() => {
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 2000);
        }}
        onOpenLink={() =>
          window.open(
            "https://refugies.info/dispositif/6507c1a2b3f4e5d6c7a8b9c0",
            "_blank",
          )
        }
        onRetry={() => {
          handleReset();
          handleConfirm();
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Stories — un statut par story (DocumentStatus = 1 seul badge)
// ---------------------------------------------------------------------------

/** Fiche brouillon — en cours de rédaction */
export const Brouillon: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <IndicationSauvegarde status="unsaved" onSave={() => {}} />
        <Tag status="en-cours" />
        <Avatar email="alice@refugies.info" className="size-6" />
      </>
    ),
    center: "Formation langue française — Alliance Française de Paris",
    right: <SlotActions />,
  },
};

/** Fiche publiée */
export const Publiee: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <IndicationSauvegarde status="saved" />
        <Tag status="publie" />
        <Avatar email="alice@refugies.info" className="size-6" />
      </>
    ),
    center: "Formation langue française — Alliance Française de Paris",
    right: <SlotActions />,
  },
};

/** Fiche archivée */
export const Archivee: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <Tag status="archive" />
        <Avatar email="xavier@refugies.info" className="size-6" />
      </>
    ),
    center: "Aide juridique — Mission locale",
    right: <SlotActions />,
  },
};

/** Fiche non conforme */
export const NonConforme: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <Conformite value="non-conforme" />
        <Avatar email="xavier@refugies.info" className="size-6" />
      </>
    ),
    center: "Aide juridique — Mission locale",
    right: <SlotActions />,
  },
};

/** Arbitrage en cours */
export const ArbitrageEnCours: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <Badge variant="neutral">En cours d&apos;arbitrage</Badge>
        <Avatar email="claudia@refugies.info" className="size-6" />
      </>
    ),
    center: "Hébergement d'urgence — Croix-Rouge française",
    right: <SlotActions />,
  },
};

/** Titre long — vérifie le truncate */
export const TitreLong: Story = {
  args: {
    left: (
      <>
        <BoutonRetour />
        <IndicationSauvegarde status="saved" />
        <Tag status="en-cours" />
        <Avatar email="alice@refugies.info" className="size-6" />
      </>
    ),
    center:
      "Actions socio-linguistiques complémentaires du CIR (ASL) - Cours municipaux de français visée A1 — Alliance Française de Paris",
    right: <SlotActions />,
  },
};
