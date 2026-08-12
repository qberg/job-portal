# Job Portal

Job portal for the Villivakkam assembly constituency. This glossary is the
canonical language of the project; when a word here and a word in
conversation disagree, this file wins or gets amended — never silently
ignored.

## Language

### Design system

**Tribune**:
The company design system: one shared name, token vocabulary, and authoring
law across all Minsky products. Each product owns an independent fork of the
code.
_Avoid_: UI kit, component library, design library

**Seed**:
The first, mechanism-only version of tribune in a new product — tokens,
typography, fonts, icon pipeline, authoring law. Contains zero components.
_Avoid_: bootstrap, initial setup

**Adoption**:
Bringing one component from another product's tribune into this one,
together with its stories, reviewed against the authoring law. Happens only
when a real screen needs the component.
_Avoid_: copy, port, migration

### Authentication

**Seeker**:
A resident signed in to the public portal to find work. The default public
user; every public account starts as a seeker.
_Avoid_: candidate, job seeker (two words), applicant (reserved for someone
who has applied to a specific job)

**Employer**:
A public account with the employer section unlocked. The same account as a
seeker's — an added capability, never a separate identity or a choice made
at sign-in.
_Avoid_: recruiter, company account, hirer

**Sign-in code**:
The 6-digit code a person receives (by SMS to a phone, or by email) and
types to prove they own that phone number or address. The single
verification mechanism across all sign-in methods.
_Avoid_: magic link, password, PIN

**Account claim**:
Connecting a sign-in method (e.g. Google) to a person's existing account by
verifying their phone number, instead of creating a duplicate account.
_Avoid_: merge, account recovery

**Onboarding**:
The five-step profile wizard between a person's first sign-in and reaching
home. Distinct from authentication: it collects who they are, not proof of
who they are.
_Avoid_: profile setup, registration
