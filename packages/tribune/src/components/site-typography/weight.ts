export type { TypographyWeight } from "../typography/typography.types";

import type { TypographyWeight } from "../typography/typography.types";

/* Weight → Tailwind utility. Serif (PT Serif) renders true only at 400/700. */
export const weightClass: Record<TypographyWeight, string> = {
  black: "font-black",
  bold: "font-bold",
  extrabold: "font-extrabold",
  extralight: "font-extralight",
  light: "font-light",
  medium: "font-medium",
  normal: "font-normal",
  semibold: "font-semibold",
  thin: "font-thin",
};
