import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
import { Field } from "../field/field";
import { Input } from "../input/input";
import { InputGroup } from "./input-group";

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

const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const meta = {
  args: {
    children: null,
  },
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Visual shell for input fields. InputGroup owns border/bg/radius/focus-ring. Inner Input is always bare — one component, one responsibility. Compose explicitly or use Input's sugar props (prefix/suffix) for common cases.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/InputGroup",
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Canonical explicit form — InputGroup owns the shell, Input owns the field.
 * This is what Input's prefix/suffix sugar expands to internally.
 */
export const ExplicitComposition: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <InputGroup variant="primary">
        <InputGroup.Prefix>
          <MailIcon />
        </InputGroup.Prefix>
        <Input placeholder="you@example.com" />
      </InputGroup>

      <InputGroup variant="primary">
        <InputGroup.Prefix>
          <SearchIcon />
        </InputGroup.Prefix>
        <Input placeholder="Search…" />
        <InputGroup.Suffix>
          <kbd className="rounded border border-neutral-200 bg-neutral-100 px-1.5 text-neutral-500 text-xs">
            ⌘K
          </kbd>
        </InputGroup.Suffix>
      </InputGroup>
    </div>
  ),
};

/**
 * Both rows render identically — sugar is a convenience collapse, not a
 * different code path.
 */
export const SugarVsExplicit: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-gray-400 text-xs">
          sugar (Input prefix prop)
        </span>
        <Input placeholder="you@example.com" prefix={<MailIcon />} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-mono text-gray-400 text-xs">
          explicit (InputGroup composition)
        </span>
        <InputGroup variant="primary">
          <InputGroup.Prefix>
            <MailIcon />
          </InputGroup.Prefix>
          <Input placeholder="you@example.com" />
        </InputGroup>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div className="flex flex-col gap-1" key={size}>
          <InputGroup size={size} variant="primary">
            <InputGroup.Prefix>
              <MailIcon />
            </InputGroup.Prefix>
            <Input placeholder="Placeholder" />
          </InputGroup>
          <span className="font-mono text-gray-400 text-xs">size="{size}"</span>
        </div>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      {(["primary", "inline", "ghost"] as const).map((variant) => (
        <div className="flex flex-col gap-1" key={variant}>
          <InputGroup variant={variant}>
            <InputGroup.Prefix>
              <MailIcon />
            </InputGroup.Prefix>
            <Input placeholder="Enter a value…" />
          </InputGroup>
          <span className="font-mono text-gray-400 text-xs">
            variant="{variant}"
          </span>
        </div>
      ))}
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-[480px] rounded-lg border border-gray-200 border-dashed p-4">
      <InputGroup fullWidth variant="primary">
        <InputGroup.Prefix>
          <SearchIcon />
        </InputGroup.Prefix>
        <Input placeholder="Full-width search…" />
      </InputGroup>
    </div>
  ),
};

/**
 * Suffix may contain interactive elements — no aria-hidden, stays in tab order.
 */
export const InteractiveSuffix: Story = {
  render: () => {
    const [value, setValue] = useState("");

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      },
      []
    );

    const handleClear = useCallback(() => {
      setValue("");
    }, []);

    return (
      <div className="flex w-80 flex-col gap-4">
        <InputGroup fullWidth variant="primary">
          <InputGroup.Prefix>
            <SearchIcon />
          </InputGroup.Prefix>
          <Input
            onChange={handleChange}
            placeholder="Type to search…"
            value={value}
          />
          {!!value && (
            <InputGroup.Suffix>
              <button
                aria-label="Clear"
                className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300 text-neutral-600 text-xs hover:bg-neutral-400"
                onClick={handleClear}
                type="button"
              >
                ✕
              </button>
            </InputGroup.Suffix>
          )}
        </InputGroup>
        <span className="font-mono text-gray-400 text-xs">
          suffix renders clear button when value present
        </span>
      </div>
    );
  },
};

const preventSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault();
};

/**
 * Error styling propagates from Field.Root invalid → data-invalid on inner
 * input → :has([data-invalid]) on InputGroup shell.
 */
export const InvalidState: Story = {
  render: () => (
    <form className="w-80" onSubmit={preventSubmit}>
      <div className="flex flex-col gap-4">
        <Field name="email">
          <Field.Label>Email</Field.Label>
          <InputGroup fullWidth variant="primary">
            <InputGroup.Prefix>
              <MailIcon />
            </InputGroup.Prefix>
            <Input placeholder="you@example.com" required type="email" />
          </InputGroup>
          <Field.Error match="valueMissing">Email is required.</Field.Error>
          <Field.Error match="typeMismatch">
            Enter a valid email address.
          </Field.Error>
        </Field>

        <button
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
          type="submit"
        >
          Submit to trigger error
        </button>
      </div>
    </form>
  ),
};
