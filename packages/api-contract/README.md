# @jp/api-contract

Contract-first oRPC API contract shared by `apps/api` (server) and `apps/web-admin` (client).
Defines `appContract` with `ping` (public) and `me` (authed) routes using `@orpc/contract` + valibot.
Pure types — no runtime logic, no handlers, no database access.
