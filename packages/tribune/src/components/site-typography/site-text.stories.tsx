import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { Fragment } from "react";
import "../../styles/fonts/fonts-public.css";
import "../../styles/tokens/typography-public.css";
import { SiteText } from "./site-text";

const withSurface: Decorator = (Story) => (
  <div data-surface="public">
    <Story />
  </div>
);

const ALL_SIZES = ["ui-1", "ui-2", "ui-3", "caption-1"] as const;

const ALL_VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "destructive",
  "accent",
] as const;

const ALL_WEIGHTS = [
  "thin",
  "extralight",
  "light",
  "normal",
  "medium",
  "semibold",
  "bold",
  "extrabold",
  "black",
] as const;

const SAMPLE =
  "Villivakkam Assembly Constituency grievance and governance platform.";

const meta = {
  args: { children: SAMPLE, size: "ui-2", variant: "primary" },
  argTypes: {
    as: { control: "select", options: ["p", "span", "div", "strong", "li"] },
    render: { control: false },
    size: { control: "select", options: ALL_SIZES },
    variant: { control: "select", options: ALL_VARIANTS },
    weight: { control: "select", options: ALL_WEIGHTS },
  },
  component: SiteText,
  decorators: [withSurface],
  parameters: {
    docs: {
      description: {
        component:
          "Editorial body + UI text for the public site (ADR 0027). Font is owned by the role — ui/caption→Inter Display (→Ila Sundaram under :lang(ta)). No consumer-chosen family axis.",
      },
    },
    layout: "padded",
  },
  tags: ["autodocs"],
  title: "Public/SiteText",
} satisfies Meta<typeof SiteText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** All body sizes (Inter Display). */
export const SizeScale: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      {ALL_SIZES.map((size) => (
        <div className="flex items-baseline gap-4" key={size}>
          <span className="w-24 shrink-0 font-mono text-gray-400 text-xs">
            {size}
          </span>
          <SiteText as="p" size={size}>
            {SAMPLE}
          </SiteText>
        </div>
      ))}
    </div>
  ),
};

/** Color variants on ui-1. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {ALL_VARIANTS.map((variant) => (
        <SiteText as="p" key={variant} size="ui-1" variant={variant}>
          {variant} — {SAMPLE}
        </SiteText>
      ))}
    </div>
  ),
};

/** ui-2 (Inter Display) across all weights. */
export const Weights: Story = {
  render: () => (
    <div className="grid grid-cols-[6rem_1fr] items-baseline gap-x-4 gap-y-3">
      {ALL_WEIGHTS.map((weight) => (
        <Fragment key={weight}>
          <span className="font-mono text-gray-400 text-xs">{weight}</span>
          <SiteText size="ui-2" weight={weight}>
            {SAMPLE}
          </SiteText>
        </Fragment>
      ))}
    </div>
  ),
};
