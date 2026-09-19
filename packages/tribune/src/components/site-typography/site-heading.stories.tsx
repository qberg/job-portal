import type { Decorator, Meta, StoryObj } from "@storybook/react";
import "../../styles/fonts/fonts-public.css";
import "../../styles/tokens/marketing-public.css";
import "../../styles/tokens/typography-public.css";
import { SiteHeading } from "./site-heading";

const withSurface: Decorator = (Story) => (
  <div data-surface="public">
    <Story />
  </div>
);

const ALL_SIZES = [
  "bg-text-1",
  "bg-text-2",
  "bg-text-3",
  "title-1",
  "title-2",
  "title-3",
  "title-4",
  "title-5",
  "title-6",
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

const ALL_VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "destructive",
  "accent",
  "wash-brand",
  "wash-neutral",
  "wash-ink",
  "wash-inverse",
] as const;

const meta = {
  args: {
    as: "h2",
    children: "Villivakkam",
    size: "title-2",
    variant: "primary",
  },
  argTypes: {
    as: { control: "select", options: ["h1", "h2", "h3", "h4", "h5", "h6"] },
    render: { control: false },
    size: { control: "select", options: ALL_SIZES },
    variant: { control: "select", options: ALL_VARIANTS },
    weight: { control: "select", options: ALL_WEIGHTS },
  },
  component: SiteHeading,
  decorators: [withSurface],
  parameters: {
    docs: {
      description: {
        component:
          "Editorial headings for the public site (ADR 0027). Font is owned by the role — bg-text→Sagite, title→Sheftira (both →Ila Sundaram under :lang(ta)). Fluid 390→1280; proportional zoom ≥1280 via the marketing root scale.",
      },
    },
    layout: "padded",
  },
  tags: ["autodocs"],
  title: "Public/SiteHeading",
} satisfies Meta<typeof SiteHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Title scale (Sheftira). Resize the viewport to watch the fluid interpolation. */
export const TitleScale: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(
        [
          "title-1",
          "title-2",
          "title-3",
          "title-4",
          "title-5",
          "title-6",
        ] as const
      ).map((size) => (
        <div className="flex items-baseline gap-4" key={size}>
          <span className="w-24 shrink-0 font-mono text-gray-400 text-xs">
            {size}
          </span>
          <SiteHeading as="h1" size={size}>
            Villivakkam
          </SiteHeading>
        </div>
      ))}
    </div>
  ),
};

/** Decorative oversized Sagite watermark — render as a non-semantic element. */
export const BackgroundText: Story = {
  render: () => (
    <div className="flex flex-col gap-2 overflow-hidden">
      {(["bg-text-1", "bg-text-2", "bg-text-3"] as const).map((size) => (
        <SiteHeading
          aria-hidden
          as="h2"
          key={size}
          render={<div />}
          size={size}
        >
          Villivakkam
        </SiteHeading>
      ))}
    </div>
  ),
};

/** Color variants on title-3. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {ALL_VARIANTS.map((variant) => (
        <SiteHeading as="h3" key={variant} size="title-3" variant={variant}>
          {variant} — Villivakkam
        </SiteHeading>
      ))}
    </div>
  ),
};
