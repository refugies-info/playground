import { Conformite, type ConformiteValue } from "@playground/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "UI/Conformite",
  component: Conformite,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1264-5919",
    },
  },
  tags: ["autodocs"],
  args: {
    value: "conforme",
  },
  argTypes: {
    value: {
      control: "inline-radio",
      options: ["conforme", "non-conforme"] satisfies ConformiteValue[],
    },
  },
} satisfies Meta<typeof Conformite>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LesDeux: Story = {
  name: "Les deux variants",
  render: () => (
    <div className="flex items-center gap-3">
      <Conformite value="conforme" />
      <Conformite value="non-conforme" />
    </div>
  ),
};

export const Conforme: Story = {
  name: "Conforme",
  args: { value: "conforme" },
};

export const NonConforme: Story = {
  name: "Non conforme",
  args: { value: "non-conforme" },
};

export const Reference: Story = {
  name: "Référence",
  render: () => (
    <table className="border-collapse text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b">
          <th className="pb-2 pr-8 font-medium">Value</th>
          <th className="pb-2 pr-8 font-medium">Rendu</th>
          <th className="pb-2 font-medium">Prop</th>
        </tr>
      </thead>
      <tbody>
        {(["conforme", "non-conforme"] satisfies ConformiteValue[]).map(
          (value) => (
            <tr key={value} className="border-b border-gray-100">
              <td className="py-2 pr-8 text-gray-600">{value}</td>
              <td className="py-2 pr-8">
                <Conformite value={value} />
              </td>
              <td className="py-2 font-mono text-xs text-gray-400">
                value="{value}"
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  ),
};
