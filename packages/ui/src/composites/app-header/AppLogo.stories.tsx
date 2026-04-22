import { AppLogo } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Avec href → rendu en <a>. Sans href → rendu en <div>.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8332
 */
const meta: Meta<typeof AppLogo> = {
  component: AppLogo,
  title: "Composites/AppLogo",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8332",
    },
  },
  argTypes: {
    title: { control: "text" },
    href: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const LogoImage = () => (
  <img src="/logo-ri.svg" alt="Logo" className="h-12 w-12" />
);

/** Logo statique sans lien — rendu en <div> */
export const Defaut: Story = {
  args: {
    image: <LogoImage />,
    title: "BOMO",
  },
};

/** Logo avec href → rendu en <a>, cliquable */
export const AvecLien: Story = {
  name: "Avec lien",
  args: {
    image: <LogoImage />,
    title: "BOMO",
    href: "/",
  },
};
