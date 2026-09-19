// A `redirect` search param is attacker-controlled input (open-redirect surface) —
// only a same-origin, single-leading-slash path is trusted; anything else falls back.
const SAFE_REDIRECT = /^\/(?!\/)/;

export function safeRedirectTarget(
  raw: string | null | undefined,
  fallback: string
): string {
  if (raw && SAFE_REDIRECT.test(raw)) {
    return raw;
  }
  return fallback;
}
