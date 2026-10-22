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

1. it writes its hand-back, the new task's id, class, ticket and position (and, for a `fan-out` task, its
   `Fan-out:` line for `run.md`), to `<WS>/tmp/design-<task>.md`;
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
- gives step 1 a red check for every site step 3 changes, refactors aside (`CLAUDE.md`);
- names under `Promises:` every ticket its text says will be filed.

## The fan-out form

A `fan-out` task writes content rows in parallel batches, outside git, in a run with `Mode: one session`
(`one-session.md`). Three scripts carry it, each written and tested by a code-lane task its `Drafting after:`
names. Its merge task is a `mechanical` brief in the form above, with `Merges: <kind>` under its Ticket line;
its steps run Merge, the build and the tests, and commit.

    # Task <id>: <name>
    Class: fan-out
    Ticket: #<n> | none
    Kind: <kind: its folder under <WS>/drafts/>
    Drafting after: <the task ids done first: the scripts, and every task that changes the rows Split cuts>
    Split: <command>
    Check: <command, on a batch folder>
    Merged by: task <id>
    Why: <the decision this implements, one paragraph; the ruling or ADR it rests on>

    ## Format
    <one example row, as JSON; then the writing rules, one per line>

    ## Reader focus
    <what the reader checks hardest: what no script can check>

The task's `Fan-out:` line in `run.md` copies its Kind, Drafting after, Split, Check and Merged by. Its Format
and Reader focus sections become `<WS>/drafts/<kind>/format.md`, word for word.

The scripts' contract, which their tasks' tests check:

- **Split** `<repo> <kind folder>` cuts the source into batches, `<kind folder>/<batch>/input.json`, each one
  unit of the source (a lesson, a theme) or about 40 rows. Every row is self-contained, carrying what a
  drafter needs to write it, with an `id` stable from run to run and a `stamp` of the source it was cut from.
  It prints one line per batch, `<batch> <rows>`. On a kind folder that already has batches, it writes nothing
  and prints their lines.
- **Check** `<batch folder>` checks every file the folder holds, by `batch-controller.md`'s table: a draft has
  one row per input row, same ids and stamps, in the format's fields, `unsure` allowed; a retry or a change
  has one row per id it answers, and no other; a review has one verdict per row it reads, `keep` or
  `dispute: <reason>`; `rulings.json` has one entry per section of `disputes.md`. It prints
  `ok <file> <n> rows` (for a review, `ok <file> <n> keep, <k> dispute`), or `fail <file> <id>: <why>` lines
  and exits 1.
- **Merge** `<repo> <kind folder>` takes, for each row, the draft row `review.json` keeps, else the retry row
  `retry-review.json` keeps, else what `rulings.json` rules: the retry row for keep, the `change.json` row for
  a confirmed change, nothing for drop. It refuses, listing them, rows with none of these and rows whose stamp
  no longer matches their source. It writes the format's fields only, into its kind's files under
  `src/content/`.

Before a fan-out brief is approved, whoever wrote it:

- writes its example row by its own rules;
- puts every rule a script can test into Check's task, and every other one under Reader focus;
- checks that no task between its `Drafting after:` and its merge task edits the rows Split cuts: Merge
  refuses them as stale.

## Task classes in a plan

Every task of a plan carries its class under its title: `Class: engine`, `Class: mechanical` or, in a
one-session run, `Class: fan-out`.

- `engine`: changes to how a session is composed or scheduled, to stored records, to reset, migration or
  sync.
- `mechanical`: everything else — screens and text, content, docs, tests alone, build.
- `fan-out`: content rows written in batches by drafters and confirmed by readers (« The fan-out form »).

The class sets the models (`task-controller.md`; `batch-controller.md` for `fan-out`). A plan's header says it
runs with `docs/agents/plan-runs/run-controller.md`, not with a skill's controller loop.

A code-lane task carries at most about six items; a fan-out task is sized by its batches. A ticket with more
is split over several tasks: phase 2's follow-ups put eleven in one task, which cost 1.16M tokens and 58
implementer calls.
