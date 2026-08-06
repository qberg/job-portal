import type * as React from "react";

export type IconProps = {
  size?: number;
  className?: string | undefined;
} & Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height">;
