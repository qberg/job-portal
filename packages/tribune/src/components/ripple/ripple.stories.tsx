import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";
import { Ripple } from "./ripple";
import { useRipple } from "./use-ripple";

type RippleHarnessProps = {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  disabled?: boolean;
  opacity?: number;
};

function RippleHarness({
  color,
  opacity,
  disabled = false,
  className = "w-48 h-12 rounded-lg",
  children = "Click or tap me",
}: RippleHarnessProps) {
  const { ripples, handlers, removeRipple } = useRipple({ disabled });

  return (
    <button
      className={`relative flex select-none items-center justify-center border border-tbn-border-default bg-tbn-bg-surface font-medium text-tbn-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className}`}
      type="button"
      {...handlers}
    >
      {children}
      <Ripple
        onClear={removeRipple}
        ripples={ripples}
        {...(color !== undefined && { color })}
        {...(opacity !== undefined && { opacity })}
      />
    </button>
  );
}

const meta = {
  argTypes: {
    color: { control: "color", description: "The color of the ripple" },
    disabled: { control: "boolean" },
    opacity: { control: { max: 1, min: 0.05, step: 0.05, type: "range" } },
  },
  component: RippleHarness,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Primitives/Ripple",
} satisfies Meta<typeof RippleHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
export const Playground: Story = {
  args: {
    disabled: false,
    opacity: 0.15,
  },
};

export const ShapesAndSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      {/* Perfect Circle (Icon Button) */}
      <RippleHarness className="h-16 w-16 rounded-full">
        <svg
          aria-labelledby="plus-icon-title"
          fill="none"
          height="24"
          role="img"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
        >
          {/* Biome a11y fix */}
          <title id="plus-icon-title">Add item</title>
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </RippleHarness>

      {/* Standard Button */}
      <RippleHarness className="h-10 w-32 rounded-md">Standard</RippleHarness>

      {/* Extreme Pill */}
      <RippleHarness className="h-14 w-64 rounded-full">
        Super Pill
      </RippleHarness>
    </div>
  ),
};

export const LargeSurface: Story = {
  render: () => (
    <RippleHarness className="h-48 w-80 flex-col items-start justify-end rounded-2xl bg-linear-to-br from-tbn-bg-surface to-tbn-bg-surface-hover p-6">
      <span className="font-bold text-lg">Interactive Card</span>
      <span className="text-sm opacity-70">
        Click anywhere to test the hypotenuse fill
      </span>
    </RippleHarness>
  ),
};

export const KeyboardAccessibility: Story = {
  render: () => (
    <RippleHarness className="h-16 w-64 rounded-lg border-2 border-blue-500">
      Focus me & press Space
    </RippleHarness>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div className="flex gap-4">
      <RippleHarness
        className="h-10 w-32 rounded-lg"
        color="oklch(0.6 0.2 25)"
        opacity={0.2}
      >
        Destructive
      </RippleHarness>
      <RippleHarness
        className="h-10 w-32 rounded-lg"
        color="oklch(0.5 0.15 150)"
        opacity={0.2}
      >
        Success
      </RippleHarness>
      <RippleHarness
        className="h-10 w-32 rounded-lg"
        color="oklch(0.376 0.1197 267.1)"
        opacity={0.2}
      >
        Brand
      </RippleHarness>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <RippleHarness className="h-10 w-32 rounded-lg" disabled>
        Disabled
      </RippleHarness>
    </div>
  ),
};
