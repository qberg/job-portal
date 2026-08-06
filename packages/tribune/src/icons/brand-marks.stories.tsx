import type { Meta, StoryObj } from "@storybook/react";
import { FacebookMark } from "./brand/facebook";
import { FacebookMonoMark } from "./brand/facebook-mono";
import { InstagramMark } from "./brand/instagram";
import { InstagramMonoMark } from "./brand/instagram-mono";
import { WhatsappMark } from "./brand/whatsapp";
import { WhatsappMonoMark } from "./brand/whatsapp-mono";
import { XMark } from "./brand/x";
import { XMonoMark } from "./brand/x-mono";
import { YoutubeMark } from "./brand/youtube";
import { YoutubeMonoMark } from "./brand/youtube-mono";
import type { IconProps } from "./icon-props";

// Declaration order is the canonical platform order (ADR-0062): the ribbon, the
// follow grid and the icon strip all render marks in exactly this sequence.
const MARKS = [
  { Color: FacebookMark, Mono: FacebookMonoMark, name: "facebook" },
  { Color: InstagramMark, Mono: InstagramMonoMark, name: "instagram" },
  { Color: XMark, Mono: XMonoMark, name: "x" },
  { Color: WhatsappMark, Mono: WhatsappMonoMark, name: "whatsapp" },
  { Color: YoutubeMark, Mono: YoutubeMonoMark, name: "youtube" },
];

function BrandMarks(_props: IconProps) {
  return null;
}

const meta = {
  args: { size: 40 },
  argTypes: {
    size: {
      control: { max: 96, min: 16, step: 4, type: "range" },
      description: "Mark dimensions in px (width = height).",
    },
  },
  component: BrandMarks,
  parameters: {
    docs: {
      description: {
        component:
          "Hand-authored social brand marks, kept out of `icons/generated/` because `pnpm gen:icons` wipes that directory and rewrites every fill to `currentColor` — which would destroy a brand palette. Both variants are fixed-palette: `Mark` is the brand colour, `MonoMark` is a #686868 badge. Neither responds to `text-*`.",
      },
    },
    layout: "padded",
  },
  tags: ["autodocs"],
  title: "Icons/Brand Marks",
} satisfies Meta<typeof BrandMarks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      {[
        { label: "color", pick: (m: (typeof MARKS)[number]) => m.Color },
        { label: "mono", pick: (m: (typeof MARKS)[number]) => m.Mono },
      ].map(({ label, pick }) => (
        <div className="flex flex-col gap-3" key={label}>
          <span className="font-mono text-gray-400 text-xs">{label}</span>
          <div className="flex items-center gap-6">
            {MARKS.map((mark) => {
              const Component = pick(mark);
              return (
                <div
                  className="flex flex-col items-center gap-2"
                  key={mark.name}
                >
                  <Component size={args.size ?? 40} />
                  <span className="font-mono text-gray-400 text-xs">
                    {mark.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Duplicated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Two owners render the same platform in one section, so gradient-backed marks appear twice per page. Duplicate SVG `id`s resolve to the first definition — identical here, so both instances paint the same. This story is the regression guard: every pair below must look alike.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-6">
      {MARKS.flatMap(({ name, Color }) => [
        <Color key={`${name}-a`} size={40} />,
        <Color key={`${name}-b`} size={40} />,
      ])}
    </div>
  ),
};
