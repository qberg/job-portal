import type { Meta, StoryObj } from "@storybook/react";
import { Fragment } from "react";
import { Text } from "./text";

const ALL_SIZES = [
  "label-1",
  "label-2",
  "label-3",
  "label-4",
  "caption-1",
  "caption-2",
] as const;

const ALL_VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "inverse",
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

const ALL_FAMILIES = ["sans", "serif"] as const;

const meta = {
  args: {
    as: "span",
    children: "The quick brown fox jumps over the lazy dog",
    size: "label-2",
    variant: "primary",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Semantic HTML element to render.",
      options: ["span", "p", "div", "strong", "em", "li", "blockquote"],
    },
    family: {
      control: "inline-radio",
      description:
        "Font family. `sans` (Public Sans, default — inherits the document) or `serif` (PT Serif, 700 only — reserved for the constituency label).",
      options: ALL_FAMILIES,
    },
    render: {
      control: false,
      description:
        "Base UI render prop for polymorphism (e.g., `<Text render={<a />} />`).",
    },
    size: {
      control: "select",
      description:
        "Size token. `label-*` for body/UI text, `caption-*` for supplementary copy.",
      options: ALL_SIZES,
    },
    variant: {
      control: "select",
      description: "Semantic color role. Maps to design token surface colors.",
      options: ALL_VARIANTS,
    },
    weight: {
      control: "select",
      description: "Font weight. Maps to 100 (thin) through 900 (black).",
      options: ALL_WEIGHTS,
    },
  },
  component: Text,
  parameters: {
    docs: {
      description: {
        component:
          "Polymorphic text primitive for body copy, labels, and captions. Combines a size scale (label/caption) with semantic color variants. Renders any inline or block element via the `as` prop.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Text",
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Use the Controls panel to explore all size, variant, and element combinations.
 */
export const Playground: Story = {};

/**
 * All six size tokens in descending order. `label-*` sizes are for UI text
 * and body copy; `caption-*` sizes for metadata and supporting information.
 */
export const SizeScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Six size tokens: four label sizes for UI text and two caption sizes for supplementary copy.",
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {ALL_SIZES.map((size) => (
        <div className="flex items-baseline gap-4" key={size}>
          <span className="w-20 shrink-0 font-mono text-gray-400 text-xs">
            {size}
          </span>
          <Text size={size}>The quick brown fox jumps over the lazy dog</Text>
        </div>
      ))}
    </div>
  ),
};

/**
 * Color variants excluding `inverse` (requires a dark surface — see
 * the Inverse story). All use `label-2` size for direct comparison.
 */
export const ColorVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Semantic color roles mapped to design token surfaces. `inverse` is shown separately because it requires a dark background.",
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {(
        ["primary", "secondary", "tertiary", "destructive", "accent"] as const
      ).map((variant) => (
        <div className="flex items-baseline gap-4" key={variant}>
          <span className="w-20 shrink-0 font-mono text-gray-400 text-xs">
            {variant}
          </span>
          <Text size="label-2" variant={variant}>
            The quick brown fox jumps over the lazy dog
          </Text>
        </div>
      ))}
    </div>
  ),
};

/**
 * `inverse` maps to `--tbn-text-inverse` (typically white). A dark surface
 * decorator is applied here so the text is visible.
 */
export const Inverse: Story = {
  decorators: [
    (Story) => (
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: "var(--tbn-bg-inverted, #1a1a1a)" }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "The `inverse` variant uses `--tbn-text-inverse` (white). Only legible on dark surfaces — use in dark panels, banners, or over image overlays.",
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {ALL_SIZES.map((size) => (
        <div className="flex items-baseline gap-4" key={size}>
          <span
            className="w-20 shrink-0 font-mono text-xs"
            style={{ color: "var(--tbn-text-inverse, #fff)", opacity: 0.5 }}
          >
            {size}
          </span>
          <Text size={size} variant="inverse">
            The quick brown fox jumps over the lazy dog
          </Text>
        </div>
      ))}
    </div>
  ),
};

/**
 * All nine weight steps from thin (100) to black (900).
 */
export const FontWeights: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All weight tokens from `thin` (100) to `black` (900). Requires a variable font — Public Sans Variable is the default. Serif (`family="serif"`) ships only 700, so non-700 weights fall back when combined with serif.',
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {ALL_WEIGHTS.map((weight) => (
        <div className="flex items-baseline gap-4" key={weight}>
          <span className="w-24 shrink-0 font-mono text-gray-400 text-xs">
            {weight}
          </span>
          <Text size="label-2" weight={weight}>
            The quick brown fox jumps over the lazy dog
          </Text>
        </div>
      ))}
    </div>
  ),
};

/**
 * Two families: `sans` (Public Sans, the document default) and `serif`
 * (PT Serif). Serif is intentionally narrow in scope — see the Constituency
 * Label story for its single sanctioned use.
 */
export const FontFamilies: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`sans` inherits `var(--font-sans)` from the document (no class emitted); `serif` overrides to `var(--font-serif)`. Shown across the label sizes for direct comparison.",
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="grid grid-cols-[6rem_1fr_1fr] items-baseline gap-x-4 gap-y-4">
      <span className="font-mono text-gray-400 text-xs">size</span>
      <span className="font-mono text-gray-400 text-xs">sans</span>
      <span className="font-mono text-gray-400 text-xs">serif</span>
      {ALL_SIZES.map((size) => (
        <Fragment key={size}>
          <span className="font-mono text-gray-400 text-xs">{size}</span>
          <Text family="sans" size={size}>
            The quick brown fox
          </Text>
          <Text family="serif" size={size}>
            The quick brown fox
          </Text>
        </Fragment>
      ))}
    </div>
  ),
};

/**
 * The sole sanctioned use of `serif`: the sidebar-footer constituency label.
 * PT Serif ships only the 700 face, so this is always `weight="bold"`.
 */
export const ConstituencyLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Real-world usage. The constituency name renders in PT Serif 700 (`family="serif" weight="bold"`) — the only place serif appears in the product. Anything else stays sans.',
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex max-w-xs flex-col gap-1 rounded-lg border border-gray-200 p-4">
      <Text family="serif" size="label-1" weight="bold">
        Villivakkam
      </Text>
      <Text family="serif" size="label-3" variant="secondary" weight="bold">
        Assembly Constituency
      </Text>
    </div>
  ),
};

/**
 * Same visual style rendered across all supported HTML elements. Demonstrates
 * that `as` controls only the rendered tag — not the appearance.
 */
export const SemanticElements: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All valid `as` values at `label-2` size. The semantic element is independent of the visual style.",
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {(
        [
          ["span", "Inline text (default)"],
          ["p", "Paragraph"],
          ["div", "Block container"],
          ["strong", "Strong importance"],
          ["em", "Emphasis"],
          ["li", "List item"],
          ["blockquote", "Block quotation"],
        ] as const
      ).map(([tag, label]) => (
        <div className="flex items-baseline gap-4" key={tag}>
          <span className="w-24 shrink-0 font-mono text-gray-400 text-xs">
            {tag}
          </span>
          <Text as={tag} size="label-2">
            {label}
          </Text>
        </div>
      ))}
    </div>
  ),
};
