"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";
import "./link.css";

const linkVariants = cva("tbn-link", {
  defaultVariants: {
    tone: "neutral",
    underline: "hover",
  },
  variants: {
    tone: {
      brand: "tbn-link--brand",
      inverse: "tbn-link--inverse",
      neutral: "tbn-link--neutral",
    },
    underline: {
      always: "tbn-link--underline-always",
      hover: "tbn-link--underline-hover",
      none: "",
    },
  },
});

export type LinkProps = React.ComponentPropsWithRef<"a"> &
  VariantProps<typeof linkVariants> &
  Pick<useRender.ComponentProps<"a">, "render"> & {
    // Trailing ↗ glyph, fades + slides in on hover. Pure JSX gate (styled via
    // .tbn-link__arrow) — not a cva axis, which would mint an unstyled class.
    withArrow?: boolean;
  };

// Diagonal ↗ — em-sized + currentColor so it tracks the link's tone and font-size.
function ArrowGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="tbn-link__arrow"
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function Link({
  tone,
  underline,
  withArrow,
  render,
  className,
  children,
  ...props
}: LinkProps) {
  return useRender({
    defaultTagName: "a",
    props: {
      ...props,
      children: (
        <>
          {children}
          {!!withArrow && <ArrowGlyph />}
        </>
      ),
      className: cn(linkVariants({ tone, underline }), className),
    },
    render,
  });
}
