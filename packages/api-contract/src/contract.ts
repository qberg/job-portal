import { oc } from "@orpc/contract";
import { citizenMeContract } from "./modules/citizen/contracts/me.contract";

// Flat keys (CLAUDE.md): audience = which base procedure (citizenAuthed), NOT a
// `citizen.*` router branch. `citizenMe` is the citizen-audience probe.
export const appContract = oc.router({
  citizenMe: citizenMeContract,
});

export type AppContract = typeof appContract;
