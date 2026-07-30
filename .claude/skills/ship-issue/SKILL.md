---
name: ship-issue
description: Execute one tracker issue end to end as vertical tracer-bullet slices. Verify the issue against real code first, build riskiest-first with a live checkpoint per slice, delegate heavy or mechanical work to subagents then audit the whole diff, review the finished diff with a fresh-context adversarial subagent before shipping, ship with granular commits plus an honest AC status. Use when the user says "pick up #N", "grab issue", "build F8", "ship this ticket", or works an issue or PRD slice to completion. Composes with mentor-build when the user wants to hand-write the code.
hooks:
  PreToolUse:
    - matcher: Bash
      hooks:
        - type: command
          command: /home/qberg/projects/minsky/apm/.claude/skills/ship-issue/scripts/guard.sh
---

# ship-issue

Spine for taking a tracker issue from ready-for-dev to closed, in this repo's idioms. Claude already knows how to code and can read the codebase; this skill encodes only the non-obvious process decisions that keep a build honest and shippable. These are defaults, not rails. Adapt to the issue.

Argument: an issue number, or the user names the issue. If absent, ask which one.

This is an orchestration spine, not a single-purpose skill: it spans verify, build, review, and ship. That breadth is deliberate, but it composes leaf skills (`mentor-build`, `run`, `verify`) rather than absorbing them. If one phase grows its own deep procedure, extract it to its own skill and reference it by name here; do not thicken this file.

## Prime directive: code is truth, prose is intent

The issue and its parent PRD went stale the moment they were written. Verify every load-bearing claim against the live codebase before trusting it. Half of a "to build" list may already exist; a named file may have moved; a gap may already be closed. Surface deltas to the user before planning. (memory: plans-are-prose)

## The seven phases

### 1. Orient
- Load the issue with `gh issue view <n> --json number,title,state,body,labels,comments` (parse with jq/python), NOT the plain `gh issue view <n> --comments`: the plain form renders markdown through a pager that emits NOTHING under a non-TTY harness (you get empty output and assume the issue is blank). The `--json` form is TTY-independent. Later comments override the body. Read the parent PRD for intent, not scope.
- Check every "Blocked by". If a blocker is open, STOP and report; do not start.
- `git log --oneline` the relevant dirs to see what landed since the issue was written.
- Capture the GATE BASELINE before touching code: run `scripts/baseline.sh capture` (snapshots typecheck / lint / test PASS|FAIL to `.git/`, never committed) and note what ALREADY fails. The close bar is "no NEW red", never "all green". A brownfield repo is usually partly red on purpose (empty-input tsconfigs, unrelated stale tests, env-gated integration tests, an uninstalled linter). Without the baseline you cannot separate inherited red from yours, and you will waste time proving it at close.
- Verify the issue's key assumptions against source. For an unfamiliar or tangled domain, build the mental model FIRST: have a subagent produce one self-contained HTML explainer (C4 L1 to L3 plus one runtime sequence diagram). Doc HTML stays uncommitted. (memory: never-commit-doc-htmls)

### 2. Plan, vertical and riskiest-first
- Cut the work into vertical tracer-bullet slices by demoable behavior, never by layer. See `references/slicing.md`.
- Slice A is a walking skeleton: the thinnest path through every layer that yields observable behavior and burns down the biggest integration unknown FIRST (often: does the transport or seam even work end to end). Later slices thicken (resilience, reconciliation, tests).
- Name deferrals explicitly AND justify each as principal you cannot pay yet (missing infra, an unbuilt dependency, a human-gated migration), never as "out of this issue's scope". We own every issue, so deferring to a later ticket is paying interest with no principal reduction: the work returns to us, now with integration drift on top. A deferral needs a real blocker; it is a debt entry, not a scope boundary. (memory: solo-owner-deferral-economics)
- Respect design gates: no styled UI without a Figma spec. (memory: ui-design-first)
- Decompose each slice into bite-sized steps that each end on a readable signal (gate, test, or live run) within 2 to 5 minutes; keep every step vertical, riskiest signal first. See `references/slicing.md`.
- The plan is EXACT: real paths, real commands, expected signals, no "add validation"/"TODO"/"similar to slice A" placeholders. Self-review it once (AC coverage, placeholder scan, name/type consistency) before writing code.
- Get the slice plan approved before code. Refine the design as code reveals a cleaner shape; surface every deviation with its reason.

### 3. Build, file by file, gated
- One logical unit at a time. After EACH file run the package-scoped typecheck plus lint. A change is not done until it passes: `pnpm turbo run typecheck --filter=@apm/<pkg>`.
- Contract first. A new endpoint touches TWO registries (the contract router AND the handler map); wire both as one atomic pair or the second is silently forgotten.
- Verify before you call. An unfamiliar external API (drizzle, valibot, oRPC, better-auth, BullMQ, tanstack) gets checked against its installed `node_modules` `.d.ts` or `context7` before use, never written from memory. `typecheck` catches an invented NAME and a crude arg-type mismatch; it green-lights a plausible-but-wrong call that still satisfies the types (wrong overload, wrong default, wrong runtime semantics), and that ships clean then breaks live. One lookup beats a confident hallucination.
- To let the user hand-write for learning, invoke the `mentor-build` skill; otherwise write it yourself. Either way, review each unit before the next.
- Watch the repo's edit hazards (see Gotchas).

### 4. Checkpoint, verify live per slice
- End each slice by running the real app and observing the behavior, not just green tests. See `references/verification.md`.
- Put the riskiest unknown in the EARLIEST checkpoint (a synthetic stub can prove transport before real infra is wired).
- Separate ENV failures (no DB, Valkey, browser) from LOGIC failures before concluding anything.

### 5. Delegate, then audit
- Push heavy or mechanical work (test suites, explainers, bulk edits, read-only sweeps) to subagents with EXACT targets plus the verification commands they must run.
- A subagent gets NO interactive approval: in the background it cannot prompt, so any tool not pre-allowed in settings is auto-denied. If the deliverable is a FILE (an explainer, a generated module), either run that agent in the FOREGROUND or have it RETURN the content for the main thread to Write. Confirm a "file written" claim by listing the path; do not assume it landed.
- After ANY subagent: audit the WHOLE git diff, not its named files. Green gates miss a disabled guard, an auth bypass, an `if (false)`, a temp log. Verify any "clean" or "reverted" claim with an actual `git diff`. (memory: audit-agent-full-diff)

### 6. Review, fresh-context and adversarial
- Once the implementation is gate-green (typecheck + lint + tests pass, live checkpoint observed) but BEFORE ship, hand the diff to a FRESH-CONTEXT reviewer subagent on the strongest model (opus). Fresh context is the point: the builder is blind to its own assumptions, so a reviewer that re-derives from source catches what the author cannot see. The main thread reviewing its own work is theatre.
- Run it in the FOREGROUND (`run_in_background: false`) so you can triage findings before shipping. Read-only: the reviewer reports, it does not edit.
- Brief it EXACTLY (a vague brief gets a vague review): the issue's intent; the precise file list (new files + which HUNKS are this issue's when the tree carries concurrent drift, so it ignores the rest); the rule sources to enforce (root + package `CLAUDE.md`, the relevant ADRs, and the sibling EXEMPLAR the code mirrors so it can flag drift); and the surrounding code it must study to judge correctness (the kernel/shared helpers, the schema/constraints). Tell it to verify every external-API claim against installed `.d.ts`, not memory, and to separate CONFIRMED bugs (failure traced) from PLAUSIBLE concerns.
- Demand four lanes, in priority order: (1) correctness bugs with a concrete failure scenario (inputs -> wrong result); (2) rule/layering violations with the cite; (3) anti-idiomatic drift vs the exemplar; (4) architecture improvements that leave the codebase MORE elegant than found. HARD CONSTRAINT on lane 4: if something is an industry-solved pattern, the reviewer NAMES the pattern and recommends it over any bespoke reinvention.
- Then TRIAGE, do not obey. Audit each finding against source yourself; a fresh reviewer also hallucinates. Fix correctness bugs and rule violations. For elegance refactors, weigh against `solo-owner-deferral-economics` (build-it-right-now favours doing them now, even across an already-shipped sibling file) but say why when you skip one. If a fix touches already-shipped code, RE-RUN the gates and RE-VERIFY live (phase 4) before ship. Record the review outcome in the close notes.

### 7. Ship
- Do NOT commit. The user owns staging + commits on this shared branch (memory: user-owns-commits). Hand back the grouped, gate-green tree and tell them exactly what to stage, calling out unrelated pre-existing drift to leave out (triage with `scripts/classify-drift.sh`). Never create or switch branches. No em-dashes in repo files.
- Close the issue with an HONEST AC status against the gate BASELINE: run `scripts/baseline.sh compare` (flags any gate that was PASS at capture and is now FAIL) so "no NEW red" is mechanical, not remembered. Tick what is proven, mark partial what is written-but-unrun, label pre-existing/inherited red as not-yours (cite it), name the follow-ups.
- **Always end with a RUNBOOK** (every session, even a one-slice fix): copy-pasteable steps the user runs to see what THIS session built working, and to report back any error. It is the hand-off contract, not a nicety. Cover the exact commands that were NOT proven headlessly (usually the human-gated path: a browser flow, an OTP/login, a UI click) plus the read-back that confirms the effect landed. State prerequisites (which daemons must be up, which ports), the precise success signal at each step, and where a dev secret surfaces (e.g. dev OTP in the api console). Verify live yourself whatever you can (spec present, unauth rejected, integration test green, a CLI read seam) and mark those PROVEN so the user only runs the residue. Format in `references/verification.md`.
- Persist hard-won, non-obvious gotchas to project memory; reference existing memories rather than restating.

## Gotchas (this repo, this workflow)
- Biome strip-hook fires PER edit: an import added in a separate Edit from its first usage is deleted before the usage lands. Write the usage first, the import LAST. (memory: biome-hook-strips-imports)
- A hook rewrites em-dashes to `::` on file touch. Do not write em-dashes; if you see `parent::survives`, that is the artifact, reword it.
- pnpm age-gate blocks installs on packages younger than ~7.78 days, and a workspace-dep add still triggers a full resolve that can trip on unrelated transitive drift.
- Lockfile entanglement: when the working tree has unrelated drift, leave `pnpm-lock.yaml` out of the issue's commits; the user commits it separately.
- `drizzle-kit generate` emits a DESTRUCTIVE drop/recreate for an enum VALUE rename (column to text, DROP TYPE, recreate, USING cast that errors on every existing row holding an old label). Read the generated SQL: hand-write `ALTER TYPE ... RENAME VALUE` instead, keep drizzle's snapshot, re-run generate to confirm "No schema changes". (memory: drizzle-enum-value-rename)
- A rename / grep-clean sweep needs BOTH a compiler pass AND a grep with optional-separator + camelCase coverage. `foo[-_. ]?bar` catches `foo-bar` / `foo_bar` / `foo bar` but a separatorless `fooBar` symbol slips it; typecheck (TS2724 "did you mean") is the backstop that catches what the regex missed. Neither alone is sufficient. Run both with `scripts/rename-sweep.sh <old> <new>`.
- Subagents report green: a passing typecheck says nothing about a disabled guard. Read the diff.
- More repo gotchas live in `MEMORY.md`; recall before building.

## References
- `references/slicing.md` : vertical tracer-bullet rules, when horizontal is acceptable
- `references/verification.md` : per-slice live-checkpoint patterns
- `references/shipping.md` : exclude-drift, close-honest handback recipe

## Scripts
- `scripts/baseline.sh capture|compare` : snapshot inherited gate red at phase 1, diff for NEW red at close
- `scripts/rename-sweep.sh <old> <new>` : separator-agnostic grep + TS2724 compiler backstop for a rename
- `scripts/classify-drift.sh` : tag the working tree CODE vs DRIFT? before staging
- `scripts/guard.sh` : PreToolUse:Bash hook (wired in frontmatter) that blocks `git add -A/.` and branch creation for the session
