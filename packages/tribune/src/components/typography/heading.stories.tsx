import type { Meta, StoryObj } from "@storybook/react";
import { Fragment } from "react";
import { Heading } from "./heading";

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

const ALL_SIZES = [
  "display-1",
  "display-2",
  "display-3",
  "heading-1",
  "heading-2",
  "heading-3",
  "heading-4",
  "heading-5",
  "heading-6",
] as const;

const ALL_FAMILIES = ["sans", "serif"] as const;

const meta = {
  args: {
    as: "h2",
    children: "The quick brown fox",
    size: "heading-2",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Semantic HTML element to render.",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
    family: {
      control: "inline-radio",
      description:
        "Font family. `sans` (Public Sans, default — inherits the document) or `serif` (PT Serif, 700 only).",
      options: ALL_FAMILIES,
    },
    render: {
      control: false,
      description:
        "Base UI render prop for polymorphism (e.g., `<Heading render={<a />} />`).",
    },
    size: {
      control: "select",
      description: "Visual size token. Independent of the `as` element.",
      options: ALL_SIZES,
    },
    weight: {
      control: "select",
      description: "Font weight. Maps to 100 (thin) through 900 (black).",
      options: ALL_WEIGHTS,
    },
  },
  component: Heading,
  parameters: {
    docs: {
      description: {
        component:
          "Polymorphic heading primitive powered by Base UI `useRender`. Decouples visual size from semantic HTML element — any `size` can render as any `h1`–`h6` tag.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Heading",
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Use the Controls panel to explore all size and element combinations.
 */
export const Playground: Story = {};

/**
 * Display sizes are intended for hero sections and marketing copy — not
 * body content. Use sparingly.
 */
export const DisplayScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Three display sizes for large-format headings. Typically used in hero sections.",
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-6">
      {(["display-1", "display-2", "display-3"] as const).map((size) => (
        <div className="flex items-baseline gap-4" key={size}>
          <span className="w-24 shrink-0 font-mono text-gray-400 text-xs">
            {size}
          </span>
          <Heading as="h1" size={size}>
            The quick brown fox
          </Heading>
        </div>
      ))}
    </div>
  ),
};

/**
 * All six heading sizes mapped to their semantic default elements. Sizes are
 * independent of the element — `heading-1` can render as any `h1`–`h6`.
 */
export const HeadingScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Six heading sizes for page and section structure. Visual size is decoupled from the semantic element.",
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {(
        [
          ["heading-1", "h1"],
          ["heading-2", "h2"],
          ["heading-3", "h3"],
          ["heading-4", "h4"],
          ["heading-5", "h5"],
          ["heading-6", "h6"],
        ] as const
      ).map(([size, tag]) => (
        <div className="flex items-baseline gap-4" key={size}>
          <span className="w-24 shrink-0 font-mono text-gray-400 text-xs">
            {size}
          </span>
          <Heading as={tag} size={size}>
            The quick brown fox
          </Heading>
        </div>
      ))}
    </div>
  ),
};

/**
 * All nine weight steps from thin (100) to black (900) at `heading-4` size.
 */
export const FontWeights: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All weight tokens from `thin` (100) to `black` (900). Requires a variable font — Public Sans Variable is the default.",
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
          <Heading size="heading-4" weight={weight}>
            The quick brown fox
          </Heading>
        </div>
      ))}
    </div>
  ),
};

/**
 * Two families: `sans` (Public Sans, the document default) and `serif`
 * (PT Serif, 700 only). Compared across the heading scale at `bold` weight so
 * the serif column renders its real 700 face.
 */
export const FontFamilies: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`sans` inherits `var(--font-sans)` from the document (no class emitted); `serif` overrides to `var(--font-serif)`. Serif ships only 700 — shown at `weight="bold"` to avoid fallback.',
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="grid grid-cols-[6rem_1fr_1fr] items-baseline gap-x-4 gap-y-4">
      <span className="font-mono text-gray-400 text-xs">size</span>
      <span className="font-mono text-gray-400 text-xs">sans</span>
      <span className="font-mono text-gray-400 text-xs">serif</span>
      {(["heading-2", "heading-4", "heading-6"] as const).map((size) => (
        <Fragment key={size}>
          <span className="font-mono text-gray-400 text-xs">{size}</span>
          <Heading family="sans" size={size} weight="bold">
            The quick brown fox
          </Heading>
          <Heading family="serif" size={size} weight="bold">
            The quick brown fox
          </Heading>
        </Fragment>
      ))}
    </div>
  ),
};

/**
 * The same `heading-2` visual size rendered as every valid heading element.
 * Demonstrates that size and semantic element are fully independent.
 */
export const PolymorphicElement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Same visual size (`heading-2`), different semantic elements. Use the `as` prop to satisfy document outline requirements without changing appearance.",
      },
    },
    layout: "padded",
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((tag) => (
        <div className="flex items-baseline gap-4" key={tag}>
          <span className="w-12 shrink-0 font-mono text-gray-400 text-xs">
            {tag}
          </span>
          <Heading as={tag} size="heading-2">
            The quick brown fox
          </Heading>
        </div>
      ))}
    </div>
  ),
};
