# ADR-0015 — Public sign-in: multi-method with verified account linking

**Status:** Proposed

**Date:** 2026-08-06

> Reference ADR numbers cited below (0017, 0025, 0064) point at the
> `petition-management` repo's `docs/adr/`, not this repo's numbering.

## Context

The public portal serves ~1M residents, Tamil-first, on low-end Android over
spotty networks. The Figma auth flow (docs/figma, pp. 2–5 desktop / 1–5
mobile) shows a combined phone-or-email input, Google sign-in, a magic-link
option, and a post-OTP "Who are you?" role-selection screen.

The reference repo (`petition-management`) paid for exactly one public
method: phone OTP via better-auth's `phoneNumber` plugin (its ADR-0025), with
per-phone throttling and Valkey sessions (its ADR-0064). It has no account
linking — the `phoneNumber` plugin assigns phone-born users a fake internal
email, so a later Google sign-in with a real email can never auto-link and
would silently create a second user.

Research findings that shaped this decision (2026-08-06 session, live
sources):

- Notion/Slack/Linear anchor accounts on a verified email; every method is
  just a credential proving that email; auto-link fires only on verified
  match. Airbnb's no-merge model ("choose one and deactivate the other") is
  its documented top support pain.
- Auto-linking on unverified email is an account-takeover class (nOAuth,
  SpoofedMe; better-auth itself had CVE-2026-53516).
- No researched Indian job platform (Apna, WorkIndia, Naukri, Indeed,
  LinkedIn) asks "seeker or employer?" at sign-up; the split is a place
  (separate portal/app) or an entitlement layered on one identity (Indeed).
- Magic links break on low-end Android: the link opens in an in-app browser
  distinct from the requesting session. Codes have no such trap.
- WebOTP auto-fill works only on Chrome-for-Android — exactly this audience;
  `autocomplete="one-time-code"` is the universal fallback.
- India-specific: DLT-registered SMS templates must match
  character-for-character or carriers silently drop them.

## Decision

| Part | Commitment |
| --- | --- |
| Methods | Three: phone → SMS code, email → email code (better-auth `emailOTP`), Google one-tap. No magic link, no passwords for the public portal. |
| Input | One combined phone-or-email field; a custom auth endpoint inspects the value and branches to the right plugin flow (sanctioned better-auth extension; nothing built-in does this). |
| Code UX | Every method resolves to the same "type the 6-digit code" screen: single `<input inputmode="numeric" autocomplete="one-time-code">` styled as six boxes (not six inputs), WebOTP where available. Phone input: silent `+91`, no country picker, lenient client regex, strict E.164 server-side. |
| Linking — verified auto-link | Email-born and Google-born accounts auto-link when the incoming verified email matches (`trustedProviders: ["google"]`). |
| Linking — account claim | Phone-born accounts can never auto-link (fake internal email). When Google/email sign-in would create a *new* account, offer a skippable claim step: verify phone by code, attach the new method to the existing account. Also available from settings. Requires `allowDifferentEmails: true`, which is safe **only** because linking is always user-initiated from an authenticated session — implicit linking across differing emails stays off. |
| Sessions | 90-day rolling for public users; fresh code re-verification for sensitive actions (change phone, delete account). Valkey-backed, per reference ADR-0064 pattern. |
| Delivery | SMS only, DLT-registered template, resend after 60s with escalating backoff; sends and verify-attempts rate-limited separately (expired code ≠ wrong code). No missed-call/WhatsApp channel until delivery-failure data demands one. |
| Employer entry | No role selection at sign-in — the Figma "Who are you?" screen is removed. "Employer" is an entitlement unlocked on the same account (Indeed pattern); its screens are a pending design item. |
| Staff auth | Unchanged from the reference: isolated instance, email+password, admin plugin, ABAC (reference ADR-0017). |

## Consequences

Easier: one mental model for users (identifier → 6-digit code); one person =
one account in every path except a skipped claim step — and that remains
recoverable from settings, unlike Airbnb's dead end. Employer capability can
ship later without touching sign-in.

Harder / accepted costs: the combined-input endpoint and the claim flow are
wholly our code — the reference has no precedent, we are first. Two OTP
channels (SMS + email) mean two templates to maintain, and the DLT template
is a QA artifact, not just copy. `allowDifferentEmails: true` is a standing
sharp edge: any future code path that links without an authenticated
user-initiated action reopens the hijack class — the claim/linking flows
belong in `commands/` with tests asserting session ownership. Deferred: the
claim step's skip rate needs measuring before deciding whether it should
become mandatory.

## Alternatives considered

- **Phone OTP only (reference as-is)** — cheapest, proven; lost because the
  employer entitlement and white-collar users need email/Google.
- **Magic link alongside email code** — same inbox, zero added reach,
  session-mismatch trap on Android; may return later as a link inside the
  code email.
- **No linking (Airbnb model)** — cheapest build; duplicate accounts with no
  merge path is a documented support disaster.
- **Role selection at sign-in (Figma p5)** — contradicts every researched
  platform and the design's own "no seeker-or-employer questions" copy; the
  employer branch led to screens that don't exist.
- **PIN for return visits (DigiLocker/UMANG)** — native-app pattern; a
  long-lived rolling session is the web equivalent with zero extra UX.
