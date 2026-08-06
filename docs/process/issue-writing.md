# Writing issues for the team

Every task issue in this repo follows one template:
`.github/ISSUE_TEMPLATE/task.md`. This guide explains how to fill it in.
The audience is teammates whose first language is not English. Clear, simple
English is a requirement, not a style choice. This guide is part of the
company workflow — copy it to every new product repo.

## The template

| Section | What it holds |
| --- | --- |
| **Goal** | One sentence. What must exist when the work is finished. |
| **Why** | One or two sentences. The reason this work matters. |
| **Steps** | Numbered list. One action per step. Exact paths and commands. |
| **Done means** | Checkboxes. Each one can be verified, not felt. |
| **Check your work** | Exact commands to run, and the output that means PASS. |
| **Do NOT** | The boundary. Things that look helpful but are out of scope. |

Every section is mandatory. An issue missing "Do NOT" or "Check your work"
is not ready to assign.

## Language rules

1. **Short sentences.** Target 15 words or fewer. One idea per sentence.
2. **Present tense, active voice.** "Copy the folder", not "the folder should
   be copied".
3. **No idioms, no phrasal verbs, no sarcasm.** Write "start", not "kick
   off". Write "remove", not "rip out".
4. **Commands are exact and copy-pasteable.** Always in code blocks. Never
   describe a command in prose when you can show it.
5. **File paths in backticks**, always relative to the repo root.
6. **Consistent words.** Use the term from `CONTEXT.md`. Do not switch
   between "component" and "widget" for the same thing.
7. **Define a new word the first time you use it**, or link to `CONTEXT.md`.
8. **Reference implementations by path.** If a working example exists in a
   sibling repo, give its exact path. "Look at how petition-management does
   it" is not a reference; `petition-management/apps/storybook/.storybook/main.ts`
   is.
9. **"Done means" items must be checkable by a command or a screenshot.**
   "Works correctly" is not checkable. "`pnpm storybook` opens on port 6006"
   is.
10. **"Do NOT" is a kindness, not distrust.** It saves the assignee from
    guessing where the task ends.

## Sizing

One issue = one PR = one bounded outcome. If the Steps list needs more than
about 10 steps, split the issue. Follow the vertical-slice rule: an issue
should end in something runnable and verifiable, never in an unused layer.
