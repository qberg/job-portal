# ADR-0001 — All external providers sit behind ports-and-adapters

**Status:** Accepted

**Date:** 2026-06-13

## Context

The system depends on several swappable external services — resume parsing /
OCR, job-matching and ranking LLM capabilities, outbound notification transport
(email/SMS), and likely others (storage, job-board syndication feeds). For a
long-lived system with a no-rewrite mandate, we must be able to experiment with
and replace any provider without disturbing domain logic.

## Decision

Every external provider is accessed through a domain-owned interface (a "port")
implemented by a provider-specific adapter package in the monorepo. Domain and
application code depend only on the port; provider SDK types never leak across
the boundary. Each capability (e.g. `ResumeParsing`, `JobMatching`,
`NotificationTransport`) gets its own narrow port so providers can be mixed
per-capability and swapped independently.

## Consequences

Some upfront interface-design cost and a thin mapping layer per adapter.
Accepted deliberately as the price of provider independence.

## Alternatives considered

- **Direct SDK calls from domain/application code.** Rejected: welds business
  logic to a specific vendor, makes testing require live provider calls, and
  makes a provider swap a rewrite instead of a new adapter.
- **One generic "external services" facade for all providers.** Rejected: a
  single broad interface can't be narrow per-capability, so it either grows an
  unbounded surface or under-fits providers that don't match its shape.
