import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";
import {
  DomainErrorDataSchema,
  ForbiddenErrorDataSchema,
  InternalErrorDataSchema,
  NotFoundErrorDataSchema,
  NotImplementedErrorDataSchema,
  UnauthorizedErrorDataSchema,
  ValidationErrorDataSchema,
} from "./errors.schema";

describe("Error schemas", () => {
  describe("UnauthorizedErrorDataSchema", () => {
    it("accepts a valid payload", () => {
      const result = safeParse(UnauthorizedErrorDataSchema, {
        reason: "SESSION_EXPIRED",
      });

      expect(result.success).toBe(true);
    });

    it("accepts a payload without reason", () => {
      const result = safeParse(UnauthorizedErrorDataSchema, {});

      expect(result.success).toBe(true);
    });

    it("rejects a non-string reason", () => {
      const result = safeParse(UnauthorizedErrorDataSchema, {
        reason: 123,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("ForbiddenErrorDataSchema", () => {
    it("accepts a valid payload", () => {
      const result = safeParse(ForbiddenErrorDataSchema, {
        reason: "MISSING_PERMISSION",
        requiredPermissions: ["application:read:own"],
      });

      expect(result.success).toBe(true);
    });

    it("accepts multiple required permissions", () => {
      const result = safeParse(ForbiddenErrorDataSchema, {
        reason: "MISSING_PERMISSIONS",
        requiredPermissions: ["application:read:own", "application:update:own"],
      });

      expect(result.success).toBe(true);
    });

    it("rejects a payload without requiredPermissions", () => {
      const result = safeParse(ForbiddenErrorDataSchema, {
        reason: "MISSING_PERMISSION",
      });

      expect(result.success).toBe(false);
    });

    it("rejects non-string permissions", () => {
      const result = safeParse(ForbiddenErrorDataSchema, {
        reason: "MISSING_PERMISSION",
        requiredPermissions: [123],
      });

      expect(result.success).toBe(false);
    });
    it("rejects empty payload", () => {
      const result = safeParse(ForbiddenErrorDataSchema, {});

      expect(result.success).toBe(false);
    });
  });

  describe("NotFoundErrorDataSchema", () => {
    it("accepts a valid payload", () => {
      const result = safeParse(NotFoundErrorDataSchema, {
        id: "citizen-123",
        resource: "Citizen",
      });

      expect(result.success).toBe(true);
    });

    it("rejects a payload with missing resource field", () => {
      const result = safeParse(NotFoundErrorDataSchema, {
        id: "citizen-123",
      });

      expect(result.success).toBe(false);
    });

    it("rejects a payload with missing id field", () => {
      const result = safeParse(NotFoundErrorDataSchema, {
        resource: "Citizen",
      });

      expect(result.success).toBe(false);
    });

    it("rejects empty payload", () => {
      const result = safeParse(NotFoundErrorDataSchema, {});

      expect(result.success).toBe(false);
    });

    it("rejects non-string id", () => {
      const result = safeParse(NotFoundErrorDataSchema, {
        id: 123,
        resource: "Citizen",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("DomainErrorDataSchema", () => {
    it("accepts a valid payload", () => {
      const result = safeParse(DomainErrorDataSchema, {
        code: "APPLICATION_ALREADY_SUBMITTED",
        details: {
          applicantId: "application-123",
        },
        message: "Petition has already been submitted.",
      });

      expect(result.success).toBe(true);
    });

    it("accepts a payload without optional details", () => {
      const result = safeParse(DomainErrorDataSchema, {
        code: "APPLICATION_ALREADY_SUBMITTED",
        message: "Application has already been submitted.",
      });

      expect(result.success).toBe(true);
    });

    it("rejects a payload without code", () => {
      const result = safeParse(DomainErrorDataSchema, {
        message: "Application has already been submitted.",
      });

      expect(result.success).toBe(false);
    });

    it("rejects a payload without message", () => {
      const result = safeParse(DomainErrorDataSchema, {
        code: "APPLICATION_ALREADY_SUBMITTED",
      });

      expect(result.success).toBe(false);
    });

    it("rejects a non-string message", () => {
      const result = safeParse(DomainErrorDataSchema, {
        code: "APPLICATION_ALREADY_SUBMITTED",
        message: 123,
      });

      expect(result.success).toBe(false);
    });

    it("rejects an empty payload", () => {
      const result = safeParse(DomainErrorDataSchema, {});

      expect(result.success).toBe(false);
    });
  });

  describe("ValidationErrorDataSchema", () => {
    it("accepts a valid payload", () => {
      const result = safeParse(ValidationErrorDataSchema, {
        fields: [
          {
            message: "Email is required.",
            path: "email",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("accepts multiple validation errors", () => {
      const result = safeParse(ValidationErrorDataSchema, {
        fields: [
          {
            message: "Email is required.",
            path: "email",
          },
          {
            message: "Name is required.",
            path: "name",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("rejects a field with missing message", () => {
      const result = safeParse(ValidationErrorDataSchema, {
        fields: [
          {
            path: "email",
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it("rejects a field with missing path", () => {
      const result = safeParse(ValidationErrorDataSchema, {
        fields: [
          {
            message: "email is required",
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it("rejects an empty field", () => {
      const result = safeParse(ValidationErrorDataSchema, {
        fields: [{}],
      });

      expect(result.success).toBe(false);
    });

    it("rejects a field with non-string path", () => {
      const result = safeParse(ValidationErrorDataSchema, {
        fields: [
          {
            message: "Email is required.",
            path: 123,
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it("rejects a field with non-string message", () => {
      const result = safeParse(ValidationErrorDataSchema, {
        fields: [
          {
            message: 123,
            path: "email",
          },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe("InternalErrorDataSchema", () => {
    it("accepts a valid payload", () => {
      const result = safeParse(InternalErrorDataSchema, {
        message: "An unexpected system error occurred.",
        traceId: "abc123",
      });

      expect(result.success).toBe(true);
    });

    it("rejects a payload without traceId", () => {
      const result = safeParse(InternalErrorDataSchema, {
        message: "An unexpected system error occurred.",
      });

      expect(result.success).toBe(false);
    });

    it("rejects a payload without message", () => {
      const result = safeParse(InternalErrorDataSchema, {
        traceId: "abc123",
      });

      expect(result.success).toBe(false);
    });

    it("rejects an empty payload", () => {
      const result = safeParse(InternalErrorDataSchema, {});

      expect(result.success).toBe(false);
    });

    it("rejects a non-string traceId", () => {
      const result = safeParse(InternalErrorDataSchema, {
        message: "An unexpected system error occurred.",
        traceId: 123,
      });

      expect(result.success).toBe(false);
    });

    it("rejects a non-string message", () => {
      const result = safeParse(InternalErrorDataSchema, {
        message: 123,
        traceId: "abc123",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("NotImplementedErrorDataSchema", () => {
    it("accepts a valid payload", () => {
      const result = safeParse(NotImplementedErrorDataSchema, {
        feature: "granularity",
      });

      expect(result.success).toBe(true);
    });

    it("rejects a payload without feature", () => {
      const result = safeParse(NotImplementedErrorDataSchema, {});

      expect(result.success).toBe(false);
    });

    it("rejects a non-string feature", () => {
      const result = safeParse(NotImplementedErrorDataSchema, {
        feature: 123,
      });

      expect(result.success).toBe(false);
    });
  });
});
