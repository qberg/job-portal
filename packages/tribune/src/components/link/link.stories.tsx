import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./link";

const meta = {
  args: {
    children: "Submit Another Petition",
    href: "#",
    tone: "neutral",
    underline: "hover",
    withArrow: false,
  },
  argTypes: {
    tone: {
      control: "radio",
      description:
        "Text + underline color. brand = red CTA-link, neutral = body link " +
        "(hover→brand), inverse = on-dark.",
      options: ["brand", "neutral", "inverse"],
    },
    underline: {
      control: "radio",
      description:
        "hover = animated left→right wipe reveal. always = static full line. " +
        "none = no underline.",
      options: ["hover", "always", "none"],
    },
    withArrow: {
      control: "boolean",
      description: "Trailing ↗ glyph that fades + slides in on hover.",
    },
  },
  component: Link,
  parameters: {
    docs: {
      description: {
        component:
          "Text link primitive. 3 tones (brand / neutral / inverse) × 3 underline " +
          "behaviors (hover wipe / always / none) × optional ↗ arrow. Inherits " +
          "surrounding font-size (em-relative underline + arrow). Polymorphic via " +
          "the `render` slot (next/link, TanStack Link); defaults to <a>. " +
          "Hover/focus are CSS pseudo-states — no disabled (links don't disable).",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Link",
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Figma case: citizen success screen "Submit Another Petition" ────────────
export const SubmitAnotherPetition: Story = {
  args: { tone: "neutral", underline: "always", withArrow: false },
};

export const HoverWipe: Story = {
  args: { children: "Resend code", tone: "neutral", underline: "hover" },
};

export const Brand: Story = {
  args: { children: "Go to Dashboard", tone: "brand", underline: "hover" },
};

export const WithArrow: Story = {
  args: {
    children: "Go to Dashboard",
    tone: "brand",
    underline: "hover",
    withArrow: true,
  },
};

export const NoUnderline: Story = {
  args: { children: "Edit", tone: "neutral", underline: "none" },
};

// ── Inverse tone — rendered on a dark surface to read the on-dark color. ────
export const Inverse: Story = {
  args: { children: "Privacy Policy", tone: "inverse", underline: "always" },
  decorators: [
    (StoryFn) => (
      <div style={{ background: "var(--color-brand-700)", padding: "2rem" }}>
        <StoryFn />
      </div>
    ),
  ],
};

// ── Em-relative: link adopts the surrounding font-size. ─────────────────────
export const InheritsFontSize: Story = {
  args: { tone: "brand", underline: "hover", withArrow: true },
  render: (args) => (
    <p style={{ fontSize: "1.5rem" }}>
      <Link {...args}>Track Petition</Link>
    </p>
  ),
};
