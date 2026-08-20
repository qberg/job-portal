"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import "./button.css";
import { mergeProps } from "@base-ui/react";
import { Ripple } from "../ripple/ripple";
import { useRipple } from "../ripple/use-ripple";

const buttonVariants = cva("tbn-button", {
  defaultVariants: {
    fullWidth: false,
    intent: "primary",
    isIconOnly: false,
    size: "md",
    variant: "filled",
  },
  variants: {
    fullWidth: {
      true: "tbn-button--full-width",
    },
    intent: {
      destructive: "tbn-button--destructive",
      neutral: "tbn-button--neutral",
      primary: "tbn-button--primary",
      secondary: "tbn-button--secondary",
      "soft-destructive": "tbn-button--soft-destructive",
      success: "tbn-button--success",
      warning: "tbn-button--warning",
    },
    isIconOnly: {
      true: "tbn-button--icon",
    },
    size: {
      lg: "tbn-button--lg",
      md: "tbn-button--md",
      sm: "tbn-button--sm",
      xs: "tbn-button--xs",
    },
    variant: {
      filled: "",
      ghost: "tbn-button--ghost",
      outlined: "tbn-button--outlined",
      surface: "tbn-button--surface",
    },
  },
});

interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  disableRipple?: boolean;
}

export function Button({
  intent,
  variant,
  size,
  disabled,
  disableRipple = false,
  isIconOnly,
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  const { ripples, handlers, removeRipple } = useRipple({
    disabled: disabled || disableRipple,
  });

  return (
    <ButtonPrimitive
      className={cn(
        buttonVariants({ fullWidth, intent, isIconOnly, size, variant }),
        className
      )}
      data-slot="button"
      // disabled is destructured from props; forward explicitly so base-ui emits native `disabled` + `data-disabled`
      disabled={disabled}
      {...mergeProps(props, handlers)}
    >
      <span className="tbn-button__content">{children}</span>
      {!(disableRipple || disabled) && (
        <Ripple onClear={removeRipple} ripples={ripples} />
      )}
    </ButtonPrimitive>
  );
}
