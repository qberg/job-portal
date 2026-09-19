import { phoneNumberClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Same-origin (ADR-0044): no baseURL; next.config rewrites /api/citizen-auth to
// apps/api so the pm-citizen cookie stays first-party. basePath per ADR-0025.
export const citizenAuthClient = createAuthClient({
  basePath: "/api/citizen-auth",
  plugins: [phoneNumberClient()],
});
