# Running a plan — design sittings, briefs and task classes

## When

A task controller returned `needs design`, or a new mechanism is needed before a plan can be written.
Choosing between options a brief already sets out is a ruling, not a design.

## The sitting

A new session on Opus, with the maintainer. Paste:

    Design sitting. Question: <the question>. Context: the log entry of task <N> in <WS>/progress.md,
    the report <path>, and these files: <paths>. Read docs/agents/plan-runs/design-sitting.md. Work with
    me to a decision; you may measure with a throwaway prototype outside the repository. Write no product
    code. The output is one brief in the form below, saved to <WS>/briefs/task-<id>.md.

The sitting ends when the maintainer approves the brief. The run controller then adds a Status row for it,
with the brief's class, and the run continues.

## The brief form

    # Task <id>: <name>
    Class: engine | mechanical
    Ticket: #<n> | none
    Why: <the decision this implements, one paragraph; the ruling or ADR it rests on>
    Files:
    - Create or Modify: <exact paths>
    - Test: <exact path>
    Steps, each with its exact code or command and its expected output:
    1. Write the failing test (exact code).
    2. Run: node test/<file>.js .   Expected: FAIL <how>.
    3. Implement (exact code).
    4. Run: node test/<file>.js .   Expected: <the passing lines>.
    5. Commit: git add <paths>; git commit -m "<subject>"
    Done when: <the lines that must print>

## Task classes in a plan

Every task of a plan carries `Class: engine` or `Class: mechanical` under its title.

- `engine`: changes to how a session is composed or scheduled, to stored records, to reset, migration or
  sync.
- `mechanical`: everything else — screens and text, content, docs, tests alone, build.

The class sets the models (`task-controller.md`). A plan's header says it runs with
`docs/agents/plan-runs/run-controller.md`, not with a skill's controller loop.
