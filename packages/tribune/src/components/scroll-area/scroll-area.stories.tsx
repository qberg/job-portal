import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor, within } from "@storybook/test";
import { ScrollArea } from "./scroll-area";

const meta = {
  component: ScrollArea,
  parameters: { layout: "centered" },
  title: "Components/ScrollArea",
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// A fixed box smaller than its content → forces vertical overflow.
function TallContent() {
  return (
    <div style={{ height: 1000, width: 240 }}>
      {Array.from({ length: 40 }, (_, i) => {
        const rowId = `row-${i}`;
        return <p key={rowId}>Row {i}</p>;
      })}
    </div>
  );
}

export const Overflowing: Story = {
  args: {
    children: <TallContent />,
    className: "h-40 w-64",
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="scroll-area"]'
    );
    const viewport = canvasElement.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );

    await within(canvasElement).findByText("Row 0");

    expect(root, "Root carries data-slot and caller className").not.toBeNull();
    expect(root).toHaveClass("h-40", "w-64");
    expect(viewport, "Viewport is the scroll container").not.toBeNull();

    if (!viewport) {
      throw new Error("Viewport is missing");
    }

    // ResizeObserver settles after first frame → wait for measured overflow.
    await waitFor(() => {
      expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    });

    // The viewport, not the Root, owns the scroll position.
    viewport.scrollTop = 150;
    expect(viewport.scrollTop).toBe(150);

    // keepMounted → bar is in the DOM even when idle (stable layout + testable).
    const scrollbar = canvasElement.querySelector(
      '[data-slot="scroll-area-scrollbar"]'
    );
    expect(scrollbar, "vertical scrollbar stays mounted").not.toBeNull();
  },
};
