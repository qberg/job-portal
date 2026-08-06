import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-1",
        "text-display-2",
        "text-display-3",
        "text-heading-1",
        "text-heading-2",
        "text-heading-3",
        "text-heading-4",
        "text-heading-5",
        "text-heading-6",
        "text-label-1",
        "text-label-2",
        "text-label-3",
        "text-label-4",
        "text-caption-1",
        "text-caption-2",
      ],
    },
  },
});

/** Merge Tailwind classes, resolving conflicts (custom font-size group aware). */
export function cn(...inputs: ClassValue[]): string {
  return customTwMerge(clsx(inputs));
}
