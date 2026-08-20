import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useCallback, useState } from "react";
import { Input } from "../input/input";
import { Field } from "./field";

const MailIcon = () => (
  <svg
    aria-hidden="true"
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
    <rect height="16" rx="2" width="20" x="2" y="4" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const meta = {
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "Semantic field wrapper built on @base-ui/react/field. Auto-wires label↔input a11y (id, aria-labelledby, aria-describedby, data-invalid) with zero manual wiring. Field.Error supports HTML5 ValidityState matching (string/object) and external error state (children-only).",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Field",
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div className="w-80">
      <Field name="email">
        <Field.Label>Email</Field.Label>
        <Input
          fullWidth
          placeholder="you@example.com"
          prefix={<MailIcon />}
          required
        />
        <Field.Description>We'll never share your email.</Field.Description>
        <Field.Error match="valueMissing">Email is required.</Field.Error>
        <Field.Error match="typeMismatch">
          Enter a valid email address.
        </Field.Error>
      </Field>
    </div>
  ),
};

/** Field.Label `required` appends a red asterisk (aria-hidden); validity is the input's `required`. */
export const RequiredLabel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <Field name="name">
        <Field.Label required>Petitioner Name</Field.Label>
        <Input fullWidth placeholder="Enter your name" required />
      </Field>
      <Field name="mobile">
        <Field.Label required>Mobile Number</Field.Label>
        <Input fullWidth placeholder="9876543210" prefix="+91" required />
        <Field.Description>
          Used for status updates over WhatsApp.
        </Field.Description>
      </Field>
    </div>
  ),
};

/** Field.Label `optional` appends a muted "(optional)" suffix; input does not require a value. */
export const Optional: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <Field name="name">
        <Field.Label optional>Petitioner Name</Field.Label>
        <Input fullWidth placeholder="Enter your name" />
      </Field>
      <Field name="mobile">
        <Field.Label optional>Mobile Number</Field.Label>
        <Input fullWidth placeholder="9876543210" prefix="+91" />
        <Field.Description>
          Used for status updates over WhatsApp.
        </Field.Description>
      </Field>
    </div>
  ),
};

const preventSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault();
};

/** Field.Error `match` shows only when the HTML5 ValidityState key is true; submit empty to trigger. */
export const WithNativeValidation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByLabelText("Email");

    expect(emailInput).not.toHaveAttribute("aria-invalid", "true");

    await userEvent.type(emailInput, "a");
    await userEvent.clear(emailInput);
    await userEvent.keyboard("{Enter}");

    const error = await canvas.findByText("Email is required.");
    expect(error).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput.getAttribute("aria-describedby")).toContain(error.id);
  },
  render: () => (
    <form className="w-80" noValidate={false} onSubmit={preventSubmit}>
      <div className="flex flex-col gap-4">
        <Field name="email">
          <Field.Label>Email</Field.Label>
          <Input
            fullWidth
            placeholder="you@example.com"
            required
            type="email"
          />
          <Field.Error match="valueMissing">Email is required.</Field.Error>
          <Field.Error match="typeMismatch">
            Enter a valid email address.
          </Field.Error>
        </Field>

        <Field name="username">
          <Field.Label>Username</Field.Label>
          <Input
            fullWidth
            minLength={3}
            placeholder="At least 3 chars"
            required
          />
          <Field.Error match="valueMissing">Username is required.</Field.Error>
          <Field.Error match="tooShort">
            At least 3 characters required.
          </Field.Error>
        </Field>

        <button
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
          type="submit"
        >
          Submit to trigger errors
        </button>
      </div>
    </form>
  ),
};

/** `match` as an object — one BaseField.Error per key from a single Field.Error call. */
export const WithObjectMatch: Story = {
  render: () => (
    <form className="w-80" onSubmit={preventSubmit}>
      <div className="flex flex-col gap-4">
        <Field name="password">
          <Field.Label>Password</Field.Label>
          <Input
            fullWidth
            minLength={8}
            placeholder="Min 8 characters"
            required
            type="password"
          />
          <Field.Error
            match={{
              tooShort: "At least 8 characters required.",
              valueMissing: "Password is required.",
            }}
          />
        </Field>

        <button
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
          type="submit"
        >
          Submit
        </button>
      </div>
    </form>
  ),
};

/** Children-only Field.Error — external state owns visibility; renders <p role="alert"> for SR. */
export const WithServerError: Story = {
  render: () => {
    const [serverError, setServerError] = useState<string | null>(null);

    const handleServerError = useCallback(() => {
      setServerError("This email is already registered.");
    }, []);

    const handleClearServerError = useCallback(() => {
      setServerError(null);
    }, []);

    return (
      <div className="flex w-80 flex-col gap-4">
        <Field invalid={!!serverError} name="email">
          <Field.Label>Email</Field.Label>
          <Input fullWidth placeholder="you@example.com" />
          <Field.Error>{serverError}</Field.Error>
        </Field>

        <div className="flex gap-2">
          <button
            className="rounded bg-red-600 px-3 py-1.5 text-sm text-white"
            onClick={handleServerError}
            type="button"
          >
            Trigger server error
          </button>
          <button
            className="rounded border border-neutral-200 px-3 py-1.5 text-sm"
            onClick={handleClearServerError}
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
    );
  },
};

export const WithDescription: Story = {
  render: () => (
    <div className="w-80">
      <Field name="handle">
        <Field.Label>Username</Field.Label>
        <Input fullWidth placeholder="your_handle" />
        <Field.Description>
          Visible on your public profile. Cannot be changed after 30 days.
        </Field.Description>
      </Field>
    </div>
  ),
};

/** Field is variant-agnostic — wraps any Input variant without coupling. */
export const AllInputVariants: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      {(["primary", "inline", "ghost"] as const).map((variant) => (
        <Field key={variant} name={variant}>
          <Field.Label>Label ({variant})</Field.Label>
          <Input fullWidth placeholder="Placeholder" variant={variant} />
          <Field.Description>Helper text below the input.</Field.Description>
        </Field>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <Field disabled name="email">
        <Field.Label>Email (disabled)</Field.Label>
        <Input fullWidth placeholder="you@example.com" />
        <Field.Description>This field is disabled.</Field.Description>
      </Field>
    </div>
  ),
};
