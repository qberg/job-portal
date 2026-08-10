import { oc } from "@orpc/contract";

// Flat keys (CLAUDE.md): audience = which base procedure (citizenAuthed), NOT a
// `citizen.*` router branch. `citizenMe` is the citizen-audience probe.
export const appContract = oc.router({});

export type AppContract = typeof appContract;
