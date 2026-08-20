import { ScrollArea as Primitive } from "@base-ui/react/scroll-area";
import type React from "react";
import { cn } from "../../lib/utils";
import "./scroll-area.css";

type ScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
  fade?: boolean;
  // Exposes the scrolling viewport element — needed to drive a virtualizer.
  viewportRef?: React.Ref<HTMLDivElement> | undefined;
};

export function ScrollArea({
  children,
  className,
  fade = true,
  viewportRef,
}: ScrollAreaProps) {
  return (
    <Primitive.Root
      className={cn("tbn-scroll-area", className)}
      data-slot="scroll-area"
    >
      <Primitive.Viewport
        className={cn(
          "tbn-scroll-area__viewport",
          fade && "tbn-scroll-area__viewport--fade"
        )}
        data-slot="scroll-area-viewport"
        ref={viewportRef}
      >
        <Primitive.Content
          className="tbn-scroll-area__content"
          data-slot="scroll-area-content"
        >
          {children}
        </Primitive.Content>
      </Primitive.Viewport>

      <Primitive.Scrollbar
        className="tbn-scroll-area__scrollbar"
        data-slot="scroll-area-scrollbar"
        keepMounted
        orientation="vertical"
      >
        <Primitive.Thumb
          className="tbn-scroll-area__thumb"
          data-slot="scroll-area-thumb"
        />
      </Primitive.Scrollbar>

      <Primitive.Corner
        className="tbn-scroll-area__corner"
        data-slot="scroll-area-corner"
      />
    </Primitive.Root>
  );
}
