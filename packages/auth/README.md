# @jp/auth

Better Auth instance (email+password, admin plugin) over `@jp/database`.
Call `initAuth(config)` once at kernel boot; use `getAuth()` in handlers.
ABAC ward-scoping via `createCan` — see ADR 0011.
