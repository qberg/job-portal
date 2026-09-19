import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "./container";

// fullscreen layout: makes the max-width cap, centering, and gutter observable; centered would collapse the frame

const Placeholder = ({ label }: { label: string }) => (
  <div className="rounded-md border border-blue-400 border-dashed bg-blue-50 p-6 text-center">
    <p className="font-mono font-semibold text-blue-700 text-sm">{label}</p>
    <p className="mt-1 text-blue-500 text-xs">
      The blue box is the Container's content edge. Surrounding whitespace is
      the centering margin; the green rail (when present) is the gutter padding.
    </p>
  </div>
);

const GutterRail = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-green-100 [&>[data-slot=container]]:bg-green-200">
    {children}
  </div>
);

const meta = {
  args: {
    gutter: true,
    size: "content",
  },
  argTypes: {
    gutter: {
      control: "boolean",
      description:
        "Responsive inline padding off the --spacing scale (6 → 10 at lg).",
    },
    size: {
      control: "radio",
      description:
        "Max-width cap. narrow=348px, content=720px, wide=1540px, full=no cap (100%).",
      options: ["narrow", "content", "wide", "full"],
    },
  },
  component: Container,
  parameters: {
    docs: {
      description: {
        component:
          "Page-frame layout primitive. Centers content, caps max-width, and applies " +
          "an optional responsive inline gutter. narrow=348px / content=720px / wide=1540px / full=no cap. " +
          "The single source for portal page framing.",
      },
    },
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  title: "Components/Container",
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <GutterRail>
      <Container {...args}>
        <Placeholder label="Interactive Playground" />
      </Container>
    </GutterRail>
  ),
};

/** Narrow single-column cap at 348px for auth / form screens (sign-in). */
export const Narrow: Story = {
  args: { size: "narrow" },
  render: (args) => (
    <GutterRail>
      <Container {...args}>
        <Placeholder label='size="narrow" — max-width 348px' />
      </Container>
    </GutterRail>
  ),
};

/** Default size. Capped at 720px, centered in the viewport. */
export const Content: Story = {
  args: { size: "content" },
  render: (args) => (
    <GutterRail>
      <Container {...args}>
        <Placeholder label='size="content" — max-width 720px' />
      </Container>
    </GutterRail>
  ),
};

/** Wider cap at 1540px for dense, table-heavy pages. */
export const Wide: Story = {
  args: { size: "wide" },
  render: (args) => (
    <GutterRail>
      <Container {...args}>
        <Placeholder label='size="wide" — max-width 1540px' />
      </Container>
    </GutterRail>
  ),
};

/** No max-width. Stretches to 100% of the available width. */
export const Full: Story = {
  args: { size: "full" },
  render: (args) => (
    <GutterRail>
      <Container {...args}>
        <Placeholder label='size="full" — no max-width cap' />
      </Container>
    </GutterRail>
  ),
};

/** gutter=true (green inline padding rail) vs gutter=false (flush); both size="full". */
export const Gutter: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="px-2 py-1 font-mono text-gray-400 text-xs">
          gutter={"{true}"}
        </p>
        <GutterRail>
          <Container gutter={true} size="full">
            <Placeholder label="gutter=true — responsive inline padding" />
          </Container>
        </GutterRail>
      </div>
      <div>
        <p className="px-2 py-1 font-mono text-gray-400 text-xs">
          gutter={"{false}"}
        </p>
        <GutterRail>
          <Container gutter={false} size="full">
            <Placeholder label="gutter=false — content flush to edge" />
          </Container>
        </GutterRail>
      </div>
    </div>
  ),
};
