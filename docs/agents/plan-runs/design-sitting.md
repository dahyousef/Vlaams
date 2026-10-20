# Running a plan — design sittings, briefs and task classes

## When

A task controller returned `needs design`, or a new mechanism is needed before a plan can be written.
Choosing between options a brief already sets out is a ruling, not a design.

## The sitting

A new session on Opus, with the maintainer, launched with the command of `run-controller.md` (« Launching a
sitting ») by the run controller or by the Claude session the maintainer is talking to. Its prompt:

    Design sitting. Question: <the question>. Context: the log entry of task <N> in <WS>/progress.md,
    the report <path>, and these files: <paths>. Read docs/agents/plan-runs/design-sitting.md. Work with
    me to a decision; you may measure with a throwaway prototype outside the repository. Write no product
    code. The output is one brief in the form below, saved to <WS>/briefs/task-<id>.md.

The sitting ends when the maintainer approves the brief, in three steps:

1. it writes its hand-back, the new task's id, class, ticket and position, to `<WS>/tmp/design-<task>.md`;
2. it launches the next run sitting with the command and the start prompt of `run-controller.md`;
3. it stops.

The run controller adds the Status row and the `run.md` entry from the hand-back, and never reads the brief. The position follows dependencies, not the end of the queue: before the run continues, the sitting
reads every later task that touches the same code and adjusts their briefs for whatever the new task would
break. The original task's `needs design` row becomes `replaced by <new id>`: the next sitting neither redoes
it nor waits on it.

## The brief form

    # Task <id>: <name>
    Class: engine | mechanical
    Ticket: #<n> | none
    Promises: <each ticket this task leaves to be filed: its title> | none
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

The implementer transcribes a brief's code and insertion points word for word, so they are the code that
ships. Before a brief is approved, whoever wrote it:

- reads its code as `reviewer.md` Part 2 reads a diff, smells included;
- checks each insertion point against the file as it now stands;
- gives step 1 a red check for every site step 3 changes;
- names under `Promises:` every ticket its text says will be filed.

## Task classes in a plan

Every task of a plan carries `Class: engine` or `Class: mechanical` under its title.

- `engine`: changes to how a session is composed or scheduled, to stored records, to reset, migration or
  sync.
- `mechanical`: everything else — screens and text, content, docs, tests alone, build.

The class sets the models (`task-controller.md`). A plan's header says it runs with
`docs/agents/plan-runs/run-controller.md`, not with a skill's controller loop.

A task carries at most about six items. A ticket with more is split over several tasks: phase 2's follow-ups
put eleven in one task, which cost 1.16M tokens and 58 implementer calls.
