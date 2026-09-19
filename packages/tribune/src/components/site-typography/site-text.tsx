import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";
import "./site-typography.css";
import { weightClass } from "./weight";

type TextElement = "p" | "span" | "div" | "strong" | "em" | "li" | "blockquote";

export type SiteTextSize = "ui-1" | "ui-2" | "ui-3" | "caption-1";

export type SiteTextVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "inverse"
  | "destructive"
  | "accent"
  | "accent-yellow";

const siteTextVariants = cva("tbn-site-text", {
  defaultVariants: {
    size: "ui-2",
    variant: "primary",
    weight: "normal",
  },
  variants: {
    size: {
      "caption-1": "tbn-type--caption-1",
      "ui-1": "tbn-type--ui-1",
      "ui-2": "tbn-type--ui-2",
      "ui-3": "tbn-type--ui-3",
    },
    variant: {
      accent: "tbn-type--accent",
      "accent-yellow": "tbn-type--accent-yellow",
      destructive: "tbn-type--destructive",
      inverse: "tbn-type--inverse",
      primary: "tbn-type--primary",
      secondary: "tbn-type--secondary",
      tertiary: "tbn-type--tertiary",
    },
    weight: weightClass,
  },
});

export type SiteTextProps = React.ComponentPropsWithRef<"span"> &
  VariantProps<typeof siteTextVariants> &
  Pick<useRender.ComponentProps<"span">, "render"> & {
    as?: TextElement;
  };

export function SiteText({
  as = "span",
  size,
  variant,
  weight,
  render,
  className,
  ...props
}: SiteTextProps) {
  return useRender({
    defaultTagName: as,
    props: {
      ...props,
      className: cn(siteTextVariants({ size, variant, weight }), className),
    },
    render,
  });
}
