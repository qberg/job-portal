import { appContract } from "@jp/api-contract";
import { getCitizenAuth } from "@jp/auth/init-citizen";
import { implement, ORPCError } from "@orpc/server";
import { citizenActorExists } from "../actor";
import type { InitialContext } from "./context";
import { toORPCError } from "./errors";

export const os = implement(appContract).$context<InitialContext>();

const withLifecycle = os.use(async ({ context, path, next }) => {
  const procedure = path.join(".");

  context.log.debug({ procedure }, `RPC CALL | ${procedure}`);

  try {
    return await next();
  } catch (error) {
    if (error instanceof ORPCError) {
      context.log.warn(
        { code: error.code, procedure },
        `RPC REJECTED | ${procedure}`
      );
      throw error;
    }

    context.log.error(
      { err: error, procedure },
      `RPC FATAL FAULT | ${procedure}`
    );

    throw toORPCError(error, context.requestId);
  }
});

export const pub = withLifecycle;

// Detection-time invalidation: whoever finds the invariant broken repairs the cache.
// Failing to revoke must never mask the 401 — the session is dead either way.
async function revokeGhostSession(
  revoke: () => Promise<unknown>,
  log: InitialContext["log"]
): Promise<void> {
  await revoke().catch((error: unknown) => {
    log.warn({ err: error }, "[AUTH] GHOST SESSION REVOKE FAILED");
  });
}

// isolated citizen-auth instance (ADR-0025) — a staff cookie structurally cannot reach here
const citizenAuthedMiddleware = pub.use(async ({ context, next }) => {
  const { request } = context;
  const { headers } = request;
  const sessionData = await getCitizenAuth().api.getSession({ headers });

  if (!(sessionData?.session && sessionData?.user)) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const { user, session } = sessionData;

  if (!(await citizenActorExists(user.id))) {
    context.log.warn(
      { citizenId: user.id },
      "[CITIZEN-AUTH] GHOST SESSION // NO citizen_user ROW"
    );
    await revokeGhostSession(
      () =>
        getCitizenAuth().api.revokeSession({
          body: { token: session.token },
          headers,
        }),
      context.log
    );
    throw new ORPCError("UNAUTHORIZED");
  }

  context.log.info(
    { citizenId: user.id },
    "[CITIZEN-AUTH] CONTEXT BUILT // SESSION ACKNOWLEDGED"
  );

  return next({
    context: {
      citizen: { id: user.id },
      session: { id: session.id },
    },
  });
});

export const citizenAuthed = citizenAuthedMiddleware;
