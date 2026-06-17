import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RiCheckLine, RiCloseLine } from "../icons";
import { Button } from "../primitives/button/Button";
import {
  Dialog,
  DialogAction,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

/**
 * Dialog — Modale bloquante basée sur Radix UI.
 *
 * **Anatomie** :
 * - `DialogContent` — wrapper (overlay + panel), largeur fixe 520px
 * - `DialogTitle` — titre (`text-2xl font-bold`)
 * - `DialogDescription` — texte secondaire
 * - `DialogAction` — rangée de boutons (`justify-end gap-4`)
 *
 * **Conventions** :
 * - Fermeture via `onOpenChange` pour centraliser le comportement
 * - Bloquer Escape et clic extérieur via `onEscapeKeyDown` / `onPointerDownOutside`
 *   quand la modale est obligatoire (ex : verrouillage d'édition)
 */
const meta: Meta<typeof DialogContent> = {
  title: "Overlays/Dialog",
  component: DialogContent,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultStory() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primaire" size="md">
          Ouvrir la modale
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Titre de la modale</DialogTitle>
        <DialogDescription>
          Description ou message d'information à destination de l'utilisateur.
        </DialogDescription>
        <DialogAction>
          <Button variant="secondaire" size="md" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button variant="primaire" size="md" onClick={() => setOpen(false)}>
            Confirmer
          </Button>
        </DialogAction>
      </DialogContent>
    </Dialog>
  );
}

/** Dialog standard avec trigger, titre, description et deux actions. */
export const Default: Story = {
  render: () => <DefaultStory />,
};

function EditLockStory() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="secondaire" size="sm" onClick={() => setOpen(true)}>
        Simuler le verrouillage
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) setOpen(false);
        }}
      >
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogAction>
            <Button
              variant="quatrieme"
              size="sm"
              className="text-[var(--text-action-high-blue-france)]"
              onClick={() => setOpen(false)}
            >
              <span>Fermer</span>
              <RiCloseLine className="h-4 w-4" />
            </Button>
          </DialogAction>
          <DialogTitle>Cette fiche est déjà en cours d'édition</DialogTitle>
          <DialogDescription>
            Jean Dupont modifie cette fiche actuellement, vous n'en avez pas le
            contrôle. Cliquez sur Reprendre pour récupérer la main.
          </DialogDescription>
          <DialogDescription>
            Attention, cela annulera les modifications de Jean Dupont.
          </DialogDescription>
          <DialogAction className="pt-8 pb-4 pr-4 pl-4">
            <Button
              variant="secondaire"
              size="md"
              rightIcon={RiCloseLine}
              onClick={() => setOpen(false)}
            >
              Quitter
            </Button>
            <Button
              variant="primaire"
              size="md"
              rightIcon={RiCheckLine}
              onClick={() => setOpen(false)}
            >
              Reprendre
            </Button>
          </DialogAction>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * EditLock — Modale de verrouillage d'édition.
 *
 * Affichée quand une fiche est déjà éditée par quelqu'un d'autre.
 * - Bouton Fermer en haut à droite (`DialogAction` + `variant="quatrieme"`)
 * - Bouton Reprendre pour forcer la prise de main
 * - Escape et clic extérieur bloqués (modale obligatoire)
 */
export const EditLock: Story = {
  render: () => <EditLockStory />,
};
