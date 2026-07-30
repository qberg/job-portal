# Process: Shape Up, agent-era tempo

We run [Shape Up](https://basecamp.com/shapeup) adapted for a small team where
agents do much of the typing, juniors drive the agents, and one senior
(qberg) shapes, bets, and reviews. The original book uses 6-week cycles; we
compress to 2 weeks because build throughput is no longer the constraint —
**review bandwidth is**. Everything else survives intact.

## Cadence

| Phase | Length | What happens |
| --- | --- | --- |
| Cycle | 2 weeks | Teams build bet projects. No interruptions, no new scope. |
| Cooldown | 2–3 days | Bug fixes, debt, QA polish, free exploration. Betting table meets. |

Appetites: **small batch = 1–2 days**, **big batch = 2 weeks**. An appetite is
a budget, not an estimate: we start with the number and design a solution that
fits it — never the reverse.

## Roles

- **Shaping** (qberg, before the betting table): closed-door design work at
  the right altitude — breadboards and fat-marker sketches, not wireframes.
  Output is a pitch with exactly five ingredients: **Problem, Appetite,
  Solution, Rabbit holes, No-gos**. Juniors can propose raw ideas any time;
  shaping them is senior work.
- **Betting** (qberg, during cooldown, ≤1 hour): choose pitches for the next
  cycle. There is **no backlog** — a pitch not bet on dies; if it matters, it
  comes back. Nothing rides along "since we're in there anyway".
- **Building** (juniors + agents): you get a **project, not a task list**. You
  discover the tasks, keep your own lists, and own the outcome end to end.

## Building rules

1. **Integrate one vertical slice first.** Pick the riskiest, most novel piece
   and make it work end to end in the first days. Backend-only or UI-only
   progress is not progress.
2. **Report position, not activity**: is each piece *uphill* (still figuring
   out the approach) or *downhill* (execution remains)? Say so on the issue.
   "90% done" is banned vocabulary; uphill/downhill is the honest signal.
3. **Scope hammering**: mark to-dos `must` or `~nice`. When time presses, cut
   `~nice` without asking. Cutting scope is not lowering quality — it makes
   the product better at fewer things.
4. **Done means deployed** within the cycle, QA'd, with acceptance criteria
   verified in the deployed environment.

## Circuit breaker

Projects do **not** get extensions by default. If a bet misses its appetite,
the work stops and the diagnosis is that the *shaping* was wrong — it goes
back for reshaping and a future bet. Since qberg shapes, a tripped breaker is
qberg's miss, not the builder's; there is no blame attached to reporting one
early. Raising "this won't fit the appetite" in week 1 is far better than
discovering it in week 2.

## Bugs, debt, QA

- The vast majority of bugs can wait for cooldown. A bug interrupts the cycle
  only if it is a **crisis**: data loss, security exposure, a legally/
  politically sensitive error, or the primary flow broken for real users.
- QA is guided exploration late in the cycle (edge cases, accessibility, ta
  overflow, low-end device pass). QA findings are `~nice` by default; the
  builder triages them.
- Debt is paid in cooldowns. If it stops fitting in cooldowns, that's a pitch.

## WIP law

Never more work in flight than the reviewer can review deeply — one project
per builder per cycle. Merged-but-unreviewed does not exist here; the gates
make that mechanical.

## Interaction with the tracker

- Pitch → PRD via `/to-prd` (pitch format), sliced into issues via
  `/to-issues`. Issues carry acceptance criteria and appetite.
- The cycle's bets live in a GitHub milestone named after the cycle
  (e.g. `C1 2026-08`). Anything not in the milestone is not this cycle's work.
