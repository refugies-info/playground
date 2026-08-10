import { ImageUpload } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * ImageUpload — Champ d'upload d'image réutilisable (avatar, documents/RCO).
 *
 * Validation client (type + taille) avant l'appel `onUpload`. `onUpload` doit
 * téléverser le fichier et renvoyer l'URL stockée.
 */
const meta: Meta<typeof ImageUpload> = {
  title: "Primitives/ImageUpload",
  component: ImageUpload,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    // Resolves after a short delay to a placeholder image.
    onUpload: async (file: File) =>
      new Promise((resolve) =>
        setTimeout(() => resolve(URL.createObjectURL(file)), 800),
      ),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Cercle vide (avatar par défaut). */
export const CercleVide: Story = {
  args: { shape: "circle" },
};

/** Cercle avec image existante. */
export const CercleAvecValeur: Story = {
  args: {
    shape: "circle",
    value: "https://res.cloudinary.com/demo/image/upload/w_200/sample.jpg",
  },
};

/** Rectangle vide — état « pas encore de logo » de la maquette. */
export const Rectangle: Story = {
  args: { shape: "rect" },
};

/**
 * Rectangle avec logo. `onDelete` étant fourni, le survol découvre la corbeille
 * rouge : c'est l'état utilisé par la métadonnée « Logo » d'une fiche.
 */
export const SquareWithDeletableLogo: Story = {
  args: {
    shape: "rect",
    label: "Logo",
    value: "https://res.cloudinary.com/demo/image/upload/w_200/sample.jpg",
    onDelete: () => {},
  },
};

/**
 * Sans `onDelete`, le survol propose le remplacement plutôt que la suppression —
 * sinon aucune action ne resterait possible sur une image déjà déposée.
 */
export const SquareWithoutDeletableLogo: Story = {
  args: {
    shape: "rect",
    label: "Logo",
    value: "https://res.cloudinary.com/demo/image/upload/w_200/sample.jpg",
  },
};

/** Désactivé. */
export const Desactive: Story = {
  args: { shape: "circle", disabled: true },
};

/** Rejet immédiat : upload qui échoue. */
export const UploadEchoue: Story = {
  args: {
    shape: "circle",
    onUpload: async () => {
      throw new Error("fail");
    },
  },
};
