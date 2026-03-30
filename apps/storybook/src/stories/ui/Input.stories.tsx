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
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
    label: {
      control: "text",
    },
    error: {
      control: "text",
    },
    helperText: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Email Address",
    type: "email",
    placeholder: "name@example.com",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Username",
    placeholder: "Enter your username",
    helperText: "This will be your display name",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "name@example.com",
    error: "Please enter a valid email address",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "Cannot edit",
    disabled: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: "Search...",
    leftIcon: <Search className="h-4 w-4 text-gray-400" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: "Search...",
    rightIcon: <X className="h-4 w-4 text-gray-400 cursor-pointer" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: "Search...",
    leftIcon: <Search className="h-4 w-4 text-gray-400" />,
    rightIcon: <X className="h-4 w-4 text-gray-400 cursor-pointer" />,
  },
};
