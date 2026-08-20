import type React from "react";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { createRipple, rippleReducer } from "./ripple-machine";

export type UseRippleOptions = {
  disabled?: boolean;
  minimumPressDuration?: number;
};

export function useRipple({
  disabled = false,
  minimumPressDuration = 80,
}: UseRippleOptions) {
  const [ripples, dispatch] = useReducer(rippleReducer, []);

  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // maps browser pointerId to our internal ripple ID
  const activePointers = useRef(new Map<number | string, string>());

  const spawnRipple = useCallback(
    (x: number, y: number, bounds: DOMRect, pointerId?: number | string) => {
      if (disabled) {
        return;
      }

      const ripple = createRipple(x, y, bounds);

      if (pointerId !== undefined) {
        activePointers.current.set(pointerId, ripple.id);
      }

      dispatch({ ripple, type: "ADD_RIPPLE" });

      const timeoutId = setTimeout(() => {
        dispatch({ id: ripple.id, type: "PROMOTE_RIPPLE" });
        timers.current.delete(ripple.id);
      }, minimumPressDuration);

      timers.current.set(ripple.id, timeoutId);
    },
    [disabled, minimumPressDuration]
  );

  const releasePointer = useCallback((pointerId: number | string) => {
    const rippleId = activePointers.current.get(pointerId);
    if (!rippleId) {
      return;
    }

    const timer = timers.current.get(rippleId);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(rippleId);
    }

    dispatch({ id: rippleId, type: "RELEASE_RIPPLE" });

    activePointers.current.delete(pointerId);
  }, []);

  const removeRipple = useCallback((id: string) => {
    dispatch({ id, type: "REMOVE_RIPPLE" });
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();

      spawnRipple(
        event.clientX - bounds.left,
        event.clientY - bounds.top,
        bounds,
        event.pointerId
      );
    },
    [disabled, spawnRipple]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => releasePointer(e.pointerId),
    [releasePointer]
  );

  const onPointerLeave = useCallback(
    (e: React.PointerEvent) => releasePointer(e.pointerId),
    [releasePointer]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => releasePointer(e.pointerId),
    [releasePointer]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (disabled || event.repeat) {
        return;
      }

      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      spawnRipple(bounds.width / 2, bounds.height / 2, bounds, "keyboard");
    },
    [disabled, spawnRipple]
  );

  const onKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        releasePointer("keyboard");
      }
    },
    [releasePointer]
  );

  const onBlur = useCallback(() => {
    // Tab away while holding Space would leave the ripple stuck forever
    releasePointer("keyboard");
  }, [releasePointer]);

  const onClick = useCallback(() => {
    // screen reader / keyboard fallback; pointer flows already handled via onPointerDown
  }, []);

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) {
        clearTimeout(timer);
      }
      timers.current.clear();
      activePointers.current.clear();
    },
    []
  );

  return {
    handlers: {
      onBlur,
      onClick,
      onKeyDown,
      onKeyUp,
      onPointerCancel,
      onPointerDown,
      onPointerLeave,
      onPointerUp,
    },
    removeRipple,
    ripples,
  };
}
