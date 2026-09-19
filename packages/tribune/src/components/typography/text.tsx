import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";
import "./typography.css";

type TextElement = "p" | "span" | "div" | "strong" | "em" | "li" | "blockquote";

export type TextSize =
  | "label-1"
  | "label-2"
  | "label-3"
  | "label-4"
  | "caption-1"
  | "caption-2";

export type TextVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "inverse"
  | "destructive"
  | "accent";

export type { TypographyWeight as TextWeight } from "./typography.types";

const textVariants = cva("tbn-text", {
  defaultVariants: { family: "sans", size: "label-2", variant: "primary" },
  variants: {
    // sans omitted: inherits html's var(--font-sans); only serif overrides
    family: { sans: "", serif: "tbn-text--serif" },
    size: {
      "caption-1": "tbn-text--caption-1",
      "caption-2": "tbn-text--caption-2",
      "label-1": "tbn-text--label-1",
      "label-2": "tbn-text--label-2",
      "label-3": "tbn-text--label-3",
      "label-4": "tbn-text--label-4",
    },
    variant: {
      accent: "tbn-text--accent",
      destructive: "tbn-text--destructive",
      inverse: "tbn-text--inverse",
      primary: "tbn-text--primary",
      secondary: "tbn-text--secondary",
      tertiary: "tbn-text--tertiary",
    },
    weight: {
      black: "tbn-text--black",
      bold: "tbn-text--bold",
      extrabold: "tbn-text--extrabold",
      extralight: "tbn-text--extralight",
      light: "tbn-text--light",
      medium: "tbn-text--medium",
      normal: "tbn-text--normal",
      semibold: "tbn-text--semibold",
      thin: "tbn-text--thin",
    },
  },
});

export type TextProps = React.ComponentPropsWithRef<"span"> &
  VariantProps<typeof textVariants> & {
    as?: TextElement;
    render?:
      | React.ReactElement
      | ((props: React.HTMLAttributes<HTMLElement>) => React.ReactElement);
  };

export function Text({
  as = "span",
  size,
  variant,
  weight,
  family,
  render,
  className,
  ...props
}: TextProps) {
  return useRender({
    defaultTagName: as,
    props: {
      ...props,
      className: cn(textVariants({ family, size, variant, weight }), className),
    },
    render,
  });
}
