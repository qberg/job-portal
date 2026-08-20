import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { InputGroup } from "../input-group/input-group";
import "./input.css";

const inputVariants = cva("tbn-input", {
  defaultVariants: {
    fullWidth: false,
    size: "md",
    variant: "primary",
  },
  variants: {
    fullWidth: {
      true: "tbn-input--full-width",
    },
    size: {
      lg: "tbn-input--lg",
      md: "tbn-input--md",
      sm: "tbn-input--sm",
      xl: "tbn-input--xl",
    },
    variant: {
      ghost: "tbn-input--ghost",
      inline: "tbn-input--inline",
      primary: "tbn-input--primary",
    },
  },
});

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix"
> & {
  variant?: "primary" | "inline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

export function Input({
  variant,
  size,
  fullWidth,
  className,
  prefix,
  suffix,
  ...props
}: InputProps) {
  if (prefix !== undefined || suffix !== undefined) {
    return (
      <InputGroup
        fullWidth={fullWidth}
        // xl is a bare title-input size; an affixed xl degrades to lg
        size={size === "xl" ? "lg" : size}
        variant={variant}
        // exactOptionalPropertyTypes rejects explicit `undefined` on className?: string
        {...(className === undefined ? {} : { className })}
      >
        {prefix !== undefined && (
          <InputGroup.Prefix>{prefix}</InputGroup.Prefix>
        )}
        <InputPrimitive className="tbn-input" data-slot="input" {...props} />
        {suffix !== undefined && (
          <InputGroup.Suffix>{suffix}</InputGroup.Suffix>
        )}
      </InputGroup>
    );
  }

  return (
    <InputPrimitive
      className={cn(inputVariants({ fullWidth, size, variant }), className)}
      data-slot="input"
      {...props}
    />
  );
}

export type { InputProps };
