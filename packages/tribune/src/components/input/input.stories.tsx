import { Field } from "@base-ui/react/field";
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

// >       internally. For explicit composition see Components/InputGroup stories.

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
    disabled: false,
    fullWidth: false,
    placeholder: "Placeholder text",
    size: "md",
    variant: "primary",
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description:
        "Disables interaction. Sets data-disabled, applies muted bg.",
    },
    fullWidth: {
      control: "boolean",
      description: "Expands the input to fill its container.",
    },
    size: {
      control: "radio",
      description:
        "Physical dimensions. xl is a borderless title/display size (heading-4).",
      options: ["sm", "md", "lg", "xl"],
    },
    variant: {
      control: "select",
      description: "Visual variant of the input.",
      options: ["primary", "inline", "ghost"],
    },
  },
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "A styled Base UI Input primitive. Three variants: primary (bordered), inline (Notion-style, invisible at rest), ghost (zero chrome). Integrates with Base UI Field for validation state.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Input",
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    placeholder: "Type something...",
  },
};

/** All three variants side by side: primary → inline → ghost. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col gap-4">
      {(["primary", "inline", "ghost"] as const).map((variant) => (
        <div className="flex flex-col gap-1" key={variant}>
          <Input placeholder="Enter a value..." variant={variant} />
          <span className="font-mono text-gray-400 text-xs">
            variant="{variant}"
          </span>
        </div>
      ))}
    </div>
  ),
};

/** Physical scaling across sm / md / lg / xl (xl = borderless title size). */
export const Sizes: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col items-start gap-6">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div className="flex w-full flex-col gap-1" key={size}>
          <Input placeholder="Enter a value..." size={size} />
          <span className="font-mono text-gray-400 text-xs">size="{size}"</span>
        </div>
      ))}
    </div>
  ),
};

/** All interactive states: default, focused, disabled, readOnly, invalid (via Field.Root). */
export const States: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Input placeholder="Default" />
        <span className="font-mono text-gray-400 text-xs">default</span>
      </div>

      <div className="flex flex-col gap-1">
        <Input autoFocus placeholder="Focused (autoFocus)" />
        <span className="font-mono text-gray-400 text-xs">focused</span>
      </div>

      <div className="flex flex-col gap-1">
        <Input disabled placeholder="Disabled" />
        <span className="font-mono text-gray-400 text-xs">disabled</span>
      </div>

      <div className="flex flex-col gap-1">
        <Input defaultValue="Read-only value" readOnly />
        <span className="font-mono text-gray-400 text-xs">readOnly</span>
      </div>

      <div className="flex flex-col gap-1">
        <Field.Root invalid>
          <Input placeholder="Invalid field" />
        </Field.Root>
        <span className="font-mono text-gray-400 text-xs">
          invalid (via Field.Root)
        </span>
      </div>
    </div>
  ),
};

/** Title/display input — ghost + size=xl: borderless, flush, heading-4 (e.g. Petitioner Name). */
export const TitleInput: Story = {
  render: () => (
    <div className="w-[480px]">
      <Input
        fullWidth
        placeholder="Enter your name"
        size="xl"
        variant="ghost"
      />
    </div>
  ),
};

/** fullWidth expands the input to fill its container. */
export const FullWidth: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-4 rounded-lg border border-gray-200 border-dashed p-4">
      <Input fullWidth placeholder="Full width input" />
      <span className="font-mono text-gray-400 text-xs">fullWidth=true</span>
    </div>
  ),
};

/** Native input types passed through to the underlying <input> element. */
export const Types: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col gap-4">
      {(
        [
          { placeholder: "Text input", type: "text" },
          { placeholder: "email@example.com", type: "email" },
          { placeholder: "Password", type: "password" },
          { placeholder: "0", type: "number" },
          { placeholder: "Search...", type: "search" },
          { placeholder: "https://", type: "url" },
        ] as const
      ).map(({ type, placeholder }) => (
        <div className="flex flex-col gap-1" key={type}>
          <Input placeholder={placeholder} type={type} />
          <span className="font-mono text-gray-400 text-xs">type="{type}"</span>
        </div>
      ))}
    </div>
  ),
};

/** Inline variant walkthrough: invisible at rest, hover reveals bg, focus reveals border. */
export const InlineVariantStates: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Input placeholder="Inline at rest (invisible)" variant="inline" />
        <span className="font-mono text-gray-400 text-xs">rest</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input autoFocus placeholder="Inline focused" variant="inline" />
        <span className="font-mono text-gray-400 text-xs">focused</span>
      </div>
      <div className="flex flex-col gap-1">
        <Input disabled placeholder="Inline disabled" variant="inline" />
        <span className="font-mono text-gray-400 text-xs">disabled</span>
      </div>
    </div>
  ),
};

/** prefix prop expands to InputGroup shell; shell owns border/ring, inner input is bare. */
export const WithPrefix: Story = {
  render: (args) => (
    <div className="flex w-[380px] flex-col gap-4">
      <Input {...args} placeholder="you@example.com" prefix={<MailIcon />} />
      <Input {...args} placeholder="Search…" prefix={<SearchIcon />} />
    </div>
  ),
};

/** Suffix affix — keyboard shortcut hint rendered inside the box on the right. */
export const WithSuffix: Story = {
  render: (args) => (
    <Input
      {...args}
      placeholder="Search…"
      suffix={
        <kbd className="rounded border border-neutral-200 bg-neutral-100 px-1.5 text-neutral-500 text-xs">
          ⌘K
        </kbd>
      }
    />
  ),
};

/** Both prefix and suffix present simultaneously. */
export const WithPrefixAndSuffix: Story = {
  render: (args) => (
    <Input
      {...args}
      placeholder="Search…"
      prefix={<SearchIcon />}
      suffix={
        <kbd className="rounded border border-neutral-200 bg-neutral-100 px-1.5 text-neutral-500 text-xs">
          ⌘K
        </kbd>
      }
    />
  ),
};

/** InputGroup shell scales across sm / md / lg; font + height track the size token. */
export const AffixSizes: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div className="flex flex-col gap-1" key={size}>
          <Input
            placeholder={`Size: ${size}`}
            prefix={<MailIcon />}
            size={size}
          />
          <span className="font-mono text-gray-400 text-xs">size="{size}"</span>
        </div>
      ))}
    </div>
  ),
};

/** Invalid red border propagates to the InputGroup shell via :has([data-invalid]). */
export const AffixInvalidState: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col gap-2">
      <Field.Root invalid>
        <Input placeholder="Invalid with prefix" prefix={<MailIcon />} />
      </Field.Root>
      <span className="font-mono text-gray-400 text-xs">
        invalid via Field.Root — wrapper picks up :has([data-invalid])
      </span>
    </div>
  ),
};
