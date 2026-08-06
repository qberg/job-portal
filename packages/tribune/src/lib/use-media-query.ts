import { useCallback, useSyncExternalStore } from "react";

// External-store subscription (matchMedia),never useState+effect (repo rule).
// SSR snapshot is `false`: server renders the mobile/base branch, client
// corrects on hydrate.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
