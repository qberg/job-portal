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
