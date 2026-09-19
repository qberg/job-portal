import { ScrollArea } from "@jp/tribune/components/scroll-area";
import type { ReactNode, Ref } from "react";

// Page-owned scroll region (ADR-0030): faded ScrollArea filling the locked column.
// `fade={false}` when the page's own sticky masthead owns the top edge (dashboard).
export function PageScroll({
  children,
  viewportRef,
  fade = true,
}: {
  children: ReactNode;
  viewportRef?: Ref<HTMLDivElement>;
  fade?: boolean;
}) {
  return (
    <ScrollArea
      className="min-h-0 flex-1"
      fade={fade}
      viewportRef={viewportRef}
    >
      {children}
    </ScrollArea>
  );
}
