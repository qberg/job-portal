import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import "./input-group.css";

const inputGroupVariants = cva("tbn-input-group", {
  defaultVariants: {
    fullWidth: false,
    size: "md",
    variant: "primary",
  },
  variants: {
    fullWidth: {
      true: "tbn-input-group--full-width",
    },
    size: {
      lg: "tbn-input-group--lg",
      md: "tbn-input-group--md",
      sm: "tbn-input-group--sm",
    },
    variant: {
      ghost: "tbn-input-group--ghost",
      inline: "tbn-input-group--inline",
      primary: "tbn-input-group--primary",
    },
  },
});

type InputGroupProps = VariantProps<typeof inputGroupVariants> & {
  children: React.ReactNode;
  className?: string | undefined;
};

function InputGroupRoot({
  variant,
  size,
  fullWidth,
  className,
  children,
}: InputGroupProps) {
  return (
    <div
      className={cn(
        inputGroupVariants({ fullWidth, size, variant }),
        className
      )}
      data-slot="input-group"
    >
      {children}
    </div>
  );
}

type InputGroupPrefixProps = {
  children: React.ReactNode;
  className?: string;
};

// prefix is always decorative; pointer-events:none in CSS passes clicks through to the inner input
function InputGroupPrefix({ children, className }: InputGroupPrefixProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("tbn-input-group__prefix", className)}
    >
      {children}
    </span>
  );
}

type InputGroupSuffixProps = {
  children: React.ReactNode;
  className?: string;
};

// no aria-hidden — suffix may contain interactive elements (clear btn, visibility toggle, spinner)
function InputGroupSuffix({ children, className }: InputGroupSuffixProps) {
  return (
    <span className={cn("tbn-input-group__suffix", className)}>{children}</span>
  );
}

export const InputGroup = Object.assign(InputGroupRoot, {
  Prefix: InputGroupPrefix,
  Suffix: InputGroupSuffix,
});

export type { InputGroupPrefixProps, InputGroupProps, InputGroupSuffixProps };
export { inputGroupVariants };
