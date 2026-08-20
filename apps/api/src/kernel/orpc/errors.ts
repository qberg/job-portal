import type {
  DomainErrorData,
  ForbiddenErrorData,
  InternalErrorData,
  NotFoundErrorData,
  NotImplementedErrorData,
  UnauthorizedErrorData,
} from "@jp/api-contract/errors";
import { ORPCError } from "@orpc/server";

// Translate domain/infra errors into typed oRPC errors (shapes from api-contract/errors).
export function unauthorized(data?: UnauthorizedErrorData) {
  return new ORPCError("UNAUTHORIZED", {
    data: data ?? {},
    message: "Authentication required.",
  });
}

export function forbidden(data: ForbiddenErrorData) {
  return new ORPCError("FORBIDDEN", {
    data,
    message: "You do not have permission to perform this action.",
  });
}

export function notFound(data: NotFoundErrorData) {
  return new ORPCError("NOT_FOUND", {
    data,
    message: `${data.resource} not found.`,
  });
}

// Boundary primitive: lift an absent (or out-of-scope) read to a leak-safe 404.
// Centralizes null -> NotFound so handlers stay declarative, with no ad-hoc throws.
export function requireFound<T>(
  value: T | null,
  resource: string,
  id: string
): T {
  if (value === null) {
    throw notFound({ id, resource });
  }
  return value;
}

export function domainConflict(data: DomainErrorData) {
  return new ORPCError("CONFLICT", {
    data,
    message: data.message,
  });
}

export function internalError(data: InternalErrorData) {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    data,
    message: data.message,
  });
}

export function notImplemented(data: NotImplementedErrorData) {
  return new ORPCError("NOT_IMPLEMENTED", {
    data,
    message: `The "${data.feature}" feature is not implemented yet.`,
  });
}

// A @pm/filter decode/validate failure -- untrusted client AST, never a 500.
export function badFilter(reason: string) {
  return new ORPCError("BAD_REQUEST", {
    data: { reason },
    message: `Invalid filter: ${reason}`,
  });
}

// Meili down/unreachable/timed-out -- a typed 503, never the generic 500.
export function searchUnavailable() {
  return new ORPCError("SERVICE_UNAVAILABLE", {
    message: "search unavailable",
  });
}

// Re-throw known ORPCErrors; wrap unknown as INTERNAL_SERVER_ERROR (withLifecycle).
export function toORPCError(error: unknown, requestId: string) {
  if (error instanceof ORPCError) {
    return error;
  }

  return internalError({
    message: "An unexpected system error occurred.",
    traceId: requestId,
  });
}
