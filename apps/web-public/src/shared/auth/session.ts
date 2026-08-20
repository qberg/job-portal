import { ORPCError, safe } from "@orpc/client";
import { cache } from "react";
import { citizenApi } from "../api/orpc.server";

export type CitizenSession = { id: string };

// cache() dedupes per-request — multiple nav slots (auth button, petitions link) share one call.
export const resolveCitizenSession = cache(
  async (): Promise<CitizenSession | null> => {
    const [error, citizen] = await safe(citizenApi.citizenMe());
    if (!error) {
      return citizen;
    }
    if (error instanceof ORPCError && error.code === "UNAUTHORIZED") {
      return null;
    }
    console.error("citizenMe RPC failed:", error);
    throw error;
  }
);
