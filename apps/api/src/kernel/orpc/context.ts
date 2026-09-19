import { getDb } from "@jp/database/init";
import type { Database } from "@jp/database/types";
import { createLogger, type Logger } from "@jp/logger";
import type { Context as HonoContext } from "hono";
import { nanoid } from "nanoid";

export type InitialContext = {
  readonly requestId: string;
  readonly db: Database;
  readonly request: Request;
  readonly log: Logger;
};

export type AuthenticatedContext = InitialContext & {
  readonly user: {
    readonly id: string;
    readonly email: string;
    // readonly role: RoleName | null;
  };
  readonly session: { readonly id: string };
  // createCan returns a (permission, target?) => boolean evaluator
  //   readonly can: ReturnType<typeof createCan>;
  readonly permissions: readonly string[];
};

// Citizen audience: structurally distinct from staff (no email/ABAC `can`). `id`
// is the self-scoping key — downstream procedures filter `where citizen_id = id`.
export type CitizenAuthenticatedContext = InitialContext & {
  readonly citizen: { readonly id: string };
  readonly session: { readonly id: string };
};

export function createContext(c: HonoContext): InitialContext {
  const requestId = nanoid();
  return {
    db: getDb(),
    log: createLogger({ path: c.req.path, requestId }),
    request: c.req.raw,
    requestId,
  };
}
