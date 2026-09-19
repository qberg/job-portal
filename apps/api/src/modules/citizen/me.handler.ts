import { citizenAuthed } from "../../kernel/orpc/builder";

// ── CITIZEN ME ──────────────────────────────────────────────────────────────
// Self-scoped citizen identity probe.
// `citizenAuthed` resolves the isolated citizen session and injects
// `citizen.id`, if this handler runs, the citizen is authenticated.
// ─────────────────────────────────────────────────────────────────────────────

export const citizenMeHandler = citizenAuthed.citizenMe.handler(
  ({ context }) => ({ id: context.citizen.id })
);
