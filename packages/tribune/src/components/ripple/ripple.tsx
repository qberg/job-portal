import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import type { RippleData } from "./ripple-machine";

type RippleProps = {
  color?: string;
  onClear: (id: string) => void;
  opacity?: number;
  ripples: RippleData[];
};

type RippleItemProps = {
  color: string;
  onClear: (id: string) => void;
  opacity: number;
  ripple: RippleData;
};

function RippleItem({ color, onClear, opacity, ripple }: RippleItemProps) {
  const handleAnimationComplete = useCallback(() => {
    if (ripple.phase === "EXITING") {
      onClear(ripple.id);
    }
  }, [onClear, ripple.id, ripple.phase]);

  return (
    <motion.span
      animate={{
        opacity: ripple.phase === "ACTIVE" ? opacity : 0,
        scale: 1,
      }}
      initial={{ opacity: 0, scale: 0 }}
      onAnimationComplete={handleAnimationComplete}
      style={{
        background: color,
        borderRadius: "50%",
        height: ripple.size,
        left: ripple.x,
        pointerEvents: "none",
        position: "absolute",
        top: ripple.y,
        translate: "-50% -50%",
        width: ripple.size,
      }}
      transition={{
        opacity: { duration: 0.2, ease: "easeOut" },
        scale: { damping: 35, stiffness: 250, type: "spring" },
      }}
    />
  );
}
/**
 * Accesibility notes
 * aria-hidden='true'   - ripple is purely decorative
 * forced-colors:hidden - respects Windows High Contrast Mode
 */

export function Ripple({
  ripples,
  onClear,
  color = "currentColor",
  opacity = 0.15,
}: RippleProps) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 block overflow-hidden bg-transparent [border-radius:inherit] forced-colors:hidden"
    >
      <AnimatePresence>
        {ripples
          .filter((r) => r.phase !== "DELAY")
          .map((ripple) => (
            <RippleItem
              color={color}
              key={ripple.id}
              onClear={onClear}
              opacity={opacity}
              ripple={ripple}
            />
          ))}
      </AnimatePresence>
    </span>
  );
}
