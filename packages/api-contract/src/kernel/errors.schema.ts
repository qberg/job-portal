import {
  array,
  type InferOutput,
  object,
  optional,
  record,
  string,
  unknown,
} from "valibot";

/**
 * HTTP 401
 */
export const UnauthorizedErrorDataSchema = object({
  reason: optional(string()),
});
export type UnauthorizedErrorData = InferOutput<
  typeof UnauthorizedErrorDataSchema
>;

/**
 * HTTP 403
 */
export const ForbiddenErrorDataSchema = object({
  reason: string(), // e.g. "MISSING_PERMISSION"
  requiredPermissions: array(string()), // e.g. ["petition:read:own"]
});
export type ForbiddenErrorData = InferOutput<typeof ForbiddenErrorDataSchema>;

/**
 * HTTP 404
 */
export const NotFoundErrorDataSchema = object({
  id: string(),
  resource: string(),
});
export type NotFoundErrorData = InferOutput<typeof NotFoundErrorDataSchema>;

/**
 * HTTP 409 — domain-level conflict
 */
export const DomainErrorDataSchema = object({
  code: string(), // e.g. "PETITION_ALREADY_SUBMITTED"
  details: optional(record(string(), unknown())),
  message: string(),
});
export type DomainErrorData = InferOutput<typeof DomainErrorDataSchema>;

/**
 * HTTP 422 — input validation failure
 */
export const ValidationErrorDataSchema = object({
  fields: array(
    object({
      message: string(),
      path: string(),
    })
  ),
});
export type ValidationErrorData = InferOutput<typeof ValidationErrorDataSchema>;

/**
 * HTTP 500
 */
export const InternalErrorDataSchema = object({
  message: string(), // "An unexpected system error occurred."
  traceId: string(), // correlate with otel
});
export type InternalErrorData = InferOutput<typeof InternalErrorDataSchema>;

/**
 * HTTP 501 — recognized input the server does not yet compute
 */
export const NotImplementedErrorDataSchema = object({
  feature: string(), // e.g. "granularity"
});
export type NotImplementedErrorData = InferOutput<
  typeof NotImplementedErrorDataSchema
>;
