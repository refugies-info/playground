import { Input } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { Search, X } from "lucide-react";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    error: { control: "text" },
    helperText: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Defaut: Story = {
  name: "Défaut",
  args: {
    placeholder: "Saisir un texte…",
  },
};

/** Label affiché au-dessus du champ */
export const AvecLabel: Story = {
  name: "Avec label",
  args: {
    label: "Adresse e-mail",
    type: "email",
    placeholder: "prenom@exemple.fr",
  },
};

/** Message d'aide gris affiché sous le champ */
export const AvecAide: Story = {
  name: "Avec texte d'aide",
  args: {
    label: "Nom d'utilisateur",
    placeholder: "Saisir un nom…",
    helperText: "Ce nom sera visible par les autres membres",
  },
};

/** Bordure rouge + message d'erreur sous le champ */
export const AvecErreur: Story = {
  name: "Avec erreur",
  args: {
    label: "E-mail",
    type: "email",
    placeholder: "prenom@exemple.fr",
    error: "Veuillez saisir une adresse e-mail valide",
  },
};

/** Champ non éditable — curseur not-allowed */
export const Desactive: Story = {
  name: "Désactivé",
  args: {
    label: "Champ désactivé",
    placeholder: "Non modifiable",
    disabled: true,
  },
};

/** Icône décorative avant la saisie */
export const AvecIconeGauche: Story = {
  name: "Avec icône gauche",
  args: {
    placeholder: "Rechercher…",
    leftIcon: <Search className="h-4 w-4 text-gray-400" />,
  },
};

/** Icône action après la saisie */
export const AvecIconeDroite: Story = {
  name: "Avec icône droite",
  args: {
    placeholder: "Rechercher…",
    rightIcon: <X className="h-4 w-4 text-gray-400 cursor-pointer" />,
  },
};

/** Icônes gauche et droite combinées */
export const AvecDeuxIcones: Story = {
  name: "Avec icônes gauche et droite",
  args: {
    placeholder: "Rechercher…",
    leftIcon: <Search className="h-4 w-4 text-gray-400" />,
    rightIcon: <X className="h-4 w-4 text-gray-400 cursor-pointer" />,
  },
};
