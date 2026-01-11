import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heading } from "../../components/typography/heading";

const meta = {
  title: "Typography/Heading",
  component: Heading,
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This is a default heading",
    as: "h1",
    color: "secondary",
    align: "left",
    weight: "medium",
  },

  argTypes: {
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
    },
    weight: {
      control: "select",
      options: ["bold", "semibold", "medium", "regular"],
    },
  },
};
