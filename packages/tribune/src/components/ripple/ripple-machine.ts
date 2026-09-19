export type RipplePhase = "DELAY" | "ACTIVE" | "EXITING";

export type RippleData = {
  id: string;
  phase: RipplePhase;
  size: number;
  x: number;
  y: number;
};

export type RippleAction =
  | { type: "ADD_RIPPLE"; ripple: RippleData }
  | { type: "PROMOTE_RIPPLE"; id: string }
  | { type: "RELEASE_RIPPLE"; id: string }
  | { type: "REMOVE_RIPPLE"; id: string };

export function rippleReducer(
  state: RippleData[],
  action: RippleAction
): RippleData[] {
  switch (action.type) {
    case "ADD_RIPPLE":
      return [...state, action.ripple];

    case "PROMOTE_RIPPLE":
      return state.map((ripple) =>
        ripple.id === action.id ? { ...ripple, phase: "ACTIVE" } : ripple
      );

    case "RELEASE_RIPPLE":
      return state.reduce<RippleData[]>((acc, ripple) => {
        // if not mine, ignore
        if (action.id !== ripple.id) {
          acc.push(ripple);
          return acc;
        }
        // if mine and delayd, drop
        if (ripple.phase === "DELAY") {
          return acc;
        }
        // if mine andn active, exit
        if (ripple.phase === "ACTIVE") {
          acc.push({ ...ripple, phase: "EXITING" });
          return acc;
        }

        acc.push(ripple);
        return acc;
      }, []);

    case "REMOVE_RIPPLE":
      return state.filter((ripple) => ripple.id !== action.id);
    default:
      return state;
  }
}

export function createRipple(
  x: number,
  y: number,
  bounds: DOMRect
): RippleData {
  return {
    id: crypto.randomUUID(),
    phase: "DELAY",
    size: Math.hypot(bounds.width, bounds.height) * 2,
    x,
    y,
  };
}
