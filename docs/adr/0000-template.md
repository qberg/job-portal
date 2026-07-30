# ADR-NNNN — <short, decision-shaped title>

**Status:** Proposed | Accepted | Superseded by ADR-NNNN | Deprecated

**Date:** YYYY-MM-DD

## Context

What forces are in play — technical, business, or organizational constraints — that
make this decision necessary now? Name the problem, the constraints, and any prior
ADRs this one refines, supersedes, or builds on. Keep it factual: this section
should read the same whether or not the decision below was ultimately accepted.

## Decision

The change we're making, stated as an active commitment ("We will…" / "Adopt…"),
not a menu of options. Be concrete: name the technology, the package, the
boundary, the rule. If the decision has several parts, use a short list or table
rather than prose paragraphs.

## Consequences

What becomes easier or harder as a result. Include the honest costs — new
operational surface, coupling accepted, debt deliberately deferred — not just the
benefits. If this decision imposes a rule that must be mechanically enforced
(lint, dependency-cruiser, CI gate), say where.

## Alternatives considered

What else was on the table and why it lost. One line each is enough; the goal is
to keep a future reader from re-litigating an option already ruled out, and to
preserve *why* — not just *what*.

---

Notes on using this template:

- One ADR = one architecturally significant decision. If you're describing two
  independent decisions, split the file.
- Number sequentially from the last ADR in `docs/adr/README.md`; never reuse or
  backfill a number.
- Every architecturally significant decision gets an ADR **before or with** the
  PR that implements it — not written up after the fact from memory.
- Status starts at `Proposed` if written before implementation, or `Accepted` if
  written alongside a landed PR. Update it in place (with a dated note) when a
  later ADR supersedes or amends this one — don't silently edit history.
