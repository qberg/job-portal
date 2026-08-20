import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";
import "./typography.css";
import type { TypographyWeight } from "./typography.types";

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type HeadingSize =
  | "display-1"
  | "display-2"
  | "display-3"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "heading-4"
  | "heading-5"
  | "heading-6";

export type HeadingVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "inverse"
  | "destructive"
  | "accent";

const headingVariants = cva("tbn-heading", {
  defaultVariants: { family: "sans", size: "heading-2", variant: "primary" },
  variants: {
    // sans omitted: inherits html's var(--font-sans); only serif overrides
    family: { sans: "", serif: "tbn-heading--serif" },
    size: {
      "display-1": "tbn-heading--display-1",
      "display-2": "tbn-heading--display-2",
      "display-3": "tbn-heading--display-3",
      "heading-1": "tbn-heading--heading-1",
      "heading-2": "tbn-heading--heading-2",
      "heading-3": "tbn-heading--heading-3",
      "heading-4": "tbn-heading--heading-4",
      "heading-5": "tbn-heading--heading-5",
      "heading-6": "tbn-heading--heading-6",
    },
    variant: {
      accent: "tbn-heading--accent",
      destructive: "tbn-heading--destructive",
      inverse: "tbn-heading--inverse",
      primary: "tbn-heading--primary",
      secondary: "tbn-heading--secondary",
      tertiary: "tbn-heading--tertiary",
    },
    weight: {
      black: "tbn-heading--black",
      bold: "tbn-heading--bold",
      extrabold: "tbn-heading--extrabold",
      extralight: "tbn-heading--extralight",
      light: "tbn-heading--light",
      medium: "tbn-heading--medium",
      normal: "tbn-heading--normal",
      semibold: "tbn-heading--semibold",
      thin: "tbn-heading--thin",
    },
  },
});

export type HeadingProps = React.ComponentPropsWithRef<"h2"> &
  VariantProps<typeof headingVariants> &
  Pick<useRender.ComponentProps<"h2">, "render"> & {
    as?: HeadingElement;
    weight?: TypographyWeight;
  };

export function Heading({
  as = "h2",
  size,
  variant,
  weight,
  family,
  render,
  className,
  ...props
}: HeadingProps) {
  return useRender({
    defaultTagName: as,
    props: {
      ...props,
      className: cn(
        headingVariants({ family, size, variant, weight }),
        className
      ),
    },
    render,
  });
}
