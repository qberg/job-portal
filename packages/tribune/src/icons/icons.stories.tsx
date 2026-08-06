import type { Meta, StoryObj } from "@storybook/react";
import { type ChangeEvent, useCallback, useState } from "react";
import { iconGallery } from "./generated/icon-metadata";
import type { IconProps } from "./icon-props";

function IconGallery(_props: IconProps) {
  return null;
}

const meta = {
  args: {
    className: "",
    size: 20,
  },
  argTypes: {
    className: {
      control: "text",
      description: "Tailwind or custom class — use `text-*` to change color.",
    },
    size: {
      control: { max: 64, min: 12, step: 4, type: "range" },
      description: "Icon dimensions in px (width = height).",
    },
  },
  component: IconGallery,
  parameters: {
    docs: {
      description: {
        component:
          "Auto-generated icon set from Figma SVG sources. All icons share `IconProps`: `size` (number, default 20), `className`, and any `SVGAttributes`. New icons appear here automatically when codegen runs.",
      },
    },
    layout: "padded",
  },
  tags: ["autodocs"],
  title: "Icons/Gallery",
} satisfies Meta<typeof IconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: (args) => (
    <div className="grid grid-cols-6 gap-4 sm:grid-cols-8 md:grid-cols-10">
      {iconGallery.map(({ name, Component }) => (
        <div
          className="group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-gray-100"
          key={name}
          title={name}
        >
          <Component className={args.className ?? ""} size={args.size ?? 20} />
          <span className="max-w-full truncate font-mono text-gray-400 text-xs">
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: "Icons scale linearly — no separate size variants needed.",
      },
    },
  },
  render: () => {
    // biome-ignore lint: script output
    const { Component } = iconGallery[0]!;
    return (
      <div className="flex items-end gap-6">
        {[12, 16, 20, 24, 32, 40, 48].map((size) => (
          <div className="flex flex-col items-center gap-2" key={size}>
            <Component size={size} />
            <span className="font-mono text-gray-400 text-xs">{size}</span>
          </div>
        ))}
      </div>
    );
  },
};

export const Colors: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Color is driven by `currentColor` — set it with a `text-*` class or parent `color` CSS.",
      },
    },
  },
  render: () => {
    // biome-ignore lint: script output
    const { Component } = iconGallery[0]!;
    const swatches = [
      { cls: "", label: "default" },
      { cls: "text-gray-400", label: "muted" },
      { cls: "text-blue-600", label: "brand" },
      { cls: "text-red-500", label: "destructive" },
      { cls: "text-green-500", label: "success" },
      { cls: "text-amber-500", label: "warning" },
    ];
    return (
      <div className="flex items-center gap-6">
        {swatches.map(({ label, cls }) => (
          <div className="flex flex-col items-center gap-2" key={label}>
            <Component className={cls} size={24} />
            <span className="font-mono text-gray-400 text-xs">{label}</span>
          </div>
        ))}
      </div>
    );
  },
};

export const Search: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Live filter by icon name.",
      },
    },
  },
  render: () => {
    const [query, setQuery] = useState("");
    const onQueryChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
      []
    );
    const filtered = iconGallery.filter(({ name }) =>
      name.includes(query.toLowerCase())
    );
    return (
      <div className="flex flex-col gap-4">
        <input
          className="w-64 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={onQueryChange}
          placeholder="filter by name..."
          type="text"
          value={query}
        />
        <div className="grid grid-cols-6 gap-4 sm:grid-cols-8">
          {filtered.map(({ name, Component }) => (
            <div
              className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-gray-100"
              key={name}
            >
              <Component size={20} />
              <span className="max-w-full truncate font-mono text-gray-400 text-xs">
                {name}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full font-mono text-gray-400 text-sm">
              No icons match "{query}"
            </p>
          )}
        </div>
      </div>
    );
  },
};
