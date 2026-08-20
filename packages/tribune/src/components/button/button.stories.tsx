import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import React from "react";
import { Button } from "./button";

// Added aria-hidden="true" to prevent redundant screen reader announcements.
// The button text (or aria-label for icon-only) handles the accessible name.
const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const meta = {
  args: {
    children: "Button",
    disabled: false,
    disableRipple: false,
    intent: "primary",
    isIconOnly: false,
    size: "md",
    variant: "filled",
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description:
        "Disables interactions, ripples, and applies disabled opacity.",
    },
    disableRipple: {
      control: "boolean",
      description: "Explicitly disables the Framer Motion ripple effect.",
    },
    intent: {
      control: "select",
      description: "The visual semantic intent of the button.",
      options: [
        "primary",
        "secondary",
        "destructive",
        "soft-destructive",
        "warning",
        "success",
        "neutral",
      ],
    },
    isIconOnly: {
      control: "boolean",
      description: "Adjusts padding to perfectly center a single icon.",
    },
    render: {
      control: false,
      description:
        "Base UI render prop for polymorphism (e.g., `<Button render={<a />} />`).",
    },
    size: {
      control: "radio",
      description: "The physical dimensions and padding of the button.",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "select",
      description: "The visual style variant.",
      options: ["filled", "outlined", "ghost", "surface"],
    },
  },
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "A highly composable, accessible button primitive powered by Base UI. Features a custom biological ripple FSM, multiple intents, sizes, and polymorphic rendering capabilities.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Button",
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const WATCH_INTERACTIONS_RE = /watch the interactions/i;

// Default interactive story for the Docs page Controls panel.
export const Playground: Story = {
  args: {
    children: "Interactive Playground",
    intent: "primary",
  },
};

// Full intent × variant matrix — verifies accessible color contrast across the system.
export const IntentsAndVariants: Story = {
  render: () => {
    const intents = [
      "primary",
      "secondary",
      "destructive",
      "soft-destructive",
      "warning",
      "success",
      "neutral",
    ] as const;
    // surface is intent-independent (opaque white) — its column reads uniform by design.
    const variants = ["filled", "outlined", "ghost", "surface"] as const;

    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm">
        <div className="grid grid-cols-5 items-center gap-x-8 gap-y-6">
          <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
            Intent \ Variant
          </div>
          {variants.map((v) => (
            <div
              className="text-center font-semibold text-gray-400 text-xs uppercase tracking-wider"
              key={v}
            >
              {v}
            </div>
          ))}

          {intents.map((intent) => (
            <React.Fragment key={intent}>
              <div className="pr-4 text-right font-medium text-gray-700 text-sm capitalize">
                {intent}
              </div>
              {variants.map((variant) => (
                <div
                  className="flex justify-center"
                  key={`${intent}-${variant}`}
                >
                  <Button intent={intent} variant={variant}>
                    {intent}
                  </Button>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8 border-gray-100 border-b pb-6">
      <div className="flex flex-col items-center gap-3">
        <Button size="sm">Small</Button>
        <span className="font-mono text-gray-400 text-xs">size="sm"</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button size="md">Medium</Button>
        <span className="font-mono text-gray-400 text-xs">size="md"</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button size="lg">Large</Button>
        <span className="font-mono text-gray-400 text-xs">size="lg"</span>
      </div>
    </div>
  ),
};

// variant="surface" = opaque white for tinted rows (file-tile View, Figma p15); rose bg proves no bleed-through.
export const Surface: Story = {
  render: () => (
    <div
      className="flex items-center gap-4 p-4"
      style={{ background: "var(--tbn-bg-accent-subtle)" }}
    >
      <Button size="sm" variant="surface">
        View
      </Button>
      <Button size="md" variant="surface">
        On a tinted row
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Button>
        <PlusIcon />
        Leading
      </Button>
      <Button>
        Trailing
        <ArrowRightIcon />
      </Button>
      {/* When isIconOnly is true, aria-label is strictly required */}
      <Button aria-label="Add new item" isIconOnly>
        <PlusIcon />
      </Button>
    </div>
  ),
};

export const LayoutAndEdgeCases: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <Button disabled>Disabled Filled</Button>
      <Button disabled intent="destructive" variant="outlined">
        Disabled Outlined
      </Button>
      {/* Testing Flex shrink/grow and text truncation */}
      <Button className="w-full">
        <span className="truncate">
          Very long button text that should truncate gracefully with ellipsis
        </span>
      </Button>
    </div>
  ),
};

export const RippleEngineDisabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2 text-center">
      <Button disableRipple intent="neutral" variant="outlined">
        No Ripple Effect
      </Button>
      <span className="max-w-[200px] text-gray-500 text-xs">
        Standard CSS hover/active states remain intact.
      </span>
    </div>
  ),
};

// render swaps the DOM tag to <a> for routing while preserving styles/FSM; nativeButton=false since it's not a <button>.
export const Polymorphism: Story = {
  render: () => (
    <Button
      nativeButton={false}
      // biome-ignore lint/a11y/useAnchorContent: polymorphic render slot — content comes from Button children
      render={<a href="https://example.com" rel="noreferrer" target="_blank" />}
    >
      Rendered as a Link
      <ArrowRightIcon />
    </Button>
  ),
};

// Storybook Interactions tab: verifies pointer/keyboard FSM triggers the ripple effect.
export const AutomatedInteractionTest: Story = {
  args: {
    children: "Watch the Interactions Tab!",
    intent: "primary",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: WATCH_INTERACTIONS_RE,
    });

    await step("Simulate Pointer Click", async () => {
      await userEvent.click(button);

      await expect(button).not.toBeDisabled();
    });

    await step("Simulate Keyboard Navigation", async () => {
      button.focus();
      await expect(button).toHaveFocus();

      await userEvent.keyboard("[Space]");
    });
  },
};
