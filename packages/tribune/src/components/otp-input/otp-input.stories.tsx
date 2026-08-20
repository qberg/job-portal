import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { useState } from "react";
import { OtpInput } from "./otp-input";

const meta = {
  component: OtpInput,
  parameters: {
    docs: {
      description: {
        component:
          "Segmented one-time-code input (Figma p3 'Enter OTP'). Wraps base-ui " +
          "OTPField — numeric, auto-advance, paste-distribute, full keyboard nav. " +
          "Boxes reuse the --tbn-field-* family: grey focus glow, dark border when " +
          "filled, red border when invalid.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/OtpInput",
} satisfies Meta<typeof OtpInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { length: 6 },
};

export const PartiallyFilled: Story = {
  args: { defaultValue: "013", length: 6 },
};

export const Complete: Story = {
  args: { defaultValue: "013579", length: 6 },
};

export const Disabled: Story = {
  args: { defaultValue: "013", disabled: true, length: 6 },
};

export const Invalid: Story = {
  args: { defaultValue: "013579", invalid: true, length: 6 },
};

export const AutoFocus: Story = {
  args: { autoFocus: true, length: 6 },
};

export const Controlled: Story = {
  args: { length: 6 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const digits = "013579";
    const inputs = canvas.getAllByRole("textbox");

    inputs[0]?.focus();
    for (const digit of digits) {
      const active = document.activeElement as HTMLElement;
      Promise.all([userEvent.type(active, digit)]);
    }

    await waitFor(() => {
      for (const [index, digit] of [...digits].entries()) {
        expect(inputs[index]).toHaveValue(digit);
      }
    });
    await waitFor(() =>
      expect(canvas.getByTestId("status")).toHaveTextContent("complete: 013579")
    );
  },
  render: () => {
    const [value, setValue] = useState("");
    const [done, setDone] = useState<string | null>(null);
    return (
      <div className="flex flex-col items-center gap-3">
        <OtpInput
          aria-label="Verification code"
          length={6}
          onChange={setValue}
          onComplete={setDone}
          value={value}
        />
        <p className="text-label-3 text-tbn-text-tertiary" data-testid="status">
          value: <code>{value || "—"}</code>
          {done ? ` · complete: ${done}` : ""}
        </p>
      </div>
    );
  },
};
