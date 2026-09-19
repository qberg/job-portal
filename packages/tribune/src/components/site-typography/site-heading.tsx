import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../lib/utils";
import "./site-typography.css";
import { weightClass } from "./weight";

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type SiteHeadingSize =
  | "bg-text-1"
  | "bg-text-2"
  | "bg-text-3"
  | "title-1"
  | "title-2"
  | "title-3"
  | "title-4"
  | "title-5"
  | "title-6";

export type SiteHeadingVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "inverse"
  | "destructive"
  | "accent"
  | "accent-yellow"
  | "wash-brand"
  | "wash-neutral"
  | "wash-ink"
  | "wash-inverse";

const siteHeadingVariants = cva("tbn-site-heading", {
  defaultVariants: {
    size: "title-2",
    variant: "accent",
    weight: "normal",
  },
  variants: {
    size: {
      "bg-text-1": "tbn-type--bg-text-1",
      "bg-text-2": "tbn-type--bg-text-2",
      "bg-text-3": "tbn-type--bg-text-3",
      "title-1": "tbn-type--title-1",
      "title-2": "tbn-type--title-2",
      "title-3": "tbn-type--title-3",
      "title-4": "tbn-type--title-4",
      "title-5": "tbn-type--title-5",
      "title-6": "tbn-type--title-6",
    },
    variant: {
      accent: "tbn-type--accent",
      "accent-yellow": "tbn-type--accent-yellow",
      destructive: "tbn-type--destructive",
      inverse: "tbn-type--inverse",
      primary: "tbn-type--primary",
      secondary: "tbn-type--secondary",
      tertiary: "tbn-type--tertiary",
      "wash-brand": "tbn-type--wash-brand",
      "wash-ink": "tbn-type--wash-ink",
      "wash-inverse": "tbn-type--wash-inverse",
      "wash-neutral": "tbn-type--wash-neutral",
    },
    weight: weightClass,
  },
});

export type SiteHeadingProps = React.ComponentPropsWithRef<"h2"> &
  VariantProps<typeof siteHeadingVariants> &
  Pick<useRender.ComponentProps<"h2">, "render"> & {
    as?: HeadingElement;
  };

export function SiteHeading({
  as = "h2",
  size,
  variant,
  weight,
  render,
  className,
  ...props
}: SiteHeadingProps) {
  return useRender({
    defaultTagName: as,
    props: {
      ...props,
      className: cn(siteHeadingVariants({ size, variant, weight }), className),
    },
    render,
  });
}
