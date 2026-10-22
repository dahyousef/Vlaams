# Running a plan — one session, two lanes

For a run whose `run.md` says `Mode: one session`. One run controller drives the whole plan, and a drafting
lane runs beside the code lane. Where this file and `run-controller.md` differ, this file wins. The maintainer
chose this on 2026-10-22 for phase 3 alone, as a trial, and decides at its end, from the trial report below,
whether it stays.

You keep a chief of staff's stance (after `mattpocock/skills@5beb35b`, `skills/in-progress/chief-of-staff`,
not installed): every piece of work is delegated, the ledger is your only memory, and the maintainer gets
decisions to make and one-line news, never material to read.

## What you read

`run-controller.md`'s list, plus the **Batches** table of `<WS>/progress.md` and the `Fan-out:` lines of
`run.md`. A batch controller's return is one line; the batch's files are its agents' to read.

## The two lanes

- **The code lane** is `run-controller.md`'s loop: one task at a time, through task controllers. It alone
  builds, commits and pushes. Its loop passes over `fan-out` tasks.
- **The drafting lane** runs `fan-out` tasks: rows of content written in batches by drafters and confirmed by
  readers, inside `<WS>/drafts/<kind>/` only. Up to six batch controllers run at once, beside the code lane.

The lanes meet twice. A fan-out task starts once the code-lane tasks it waits for are `done`. Its rows reach
`src/` through its merge task, a `mechanical` code-lane task: when the code lane reaches that task and the
kind still has a batch that is not `accepted` or `ruled`, the code lane holds there while drafting goes on,
and dispatches the merge task as soon as the last batch of the kind settles.

## Starting a fan-out task

Between two code-lane tasks (a return written, the next not yet dispatched), take each `fan-out` row still
`pending` whose `Fan-out:` line's `after` tasks are all `done`:

1. Set its Status row to `in progress`.
2. Run its `Split:` command in the run's worktree. Split reads `src/` at a committed HEAD, hence the moment.
   It prints one line per batch, `<batch> <rows>`; on a kind that already has batches it writes nothing and
   prints them again.
3. Add one Batches row per line, state `pending`, path `<WS>/drafts/<kind>/<batch>/`.

The fan-out row becomes `done` when every batch of its kind is `accepted` or `ruled`.

## Running batches

Whenever fewer than six batch controllers are in flight and a Batches row is `pending`, dispatch the first
one as a background subagent on `sonnet`, description `batch <kind>/<batch>`, and set its row to `drafting`.
The prompt:

    You are the batch controller for batch <kind>/<batch> of the plan run in <worktree>. Read
    docs/agents/plan-runs/batch-controller.md and follow it. Run file: <WS>/run.md.
    Batch: <WS>/drafts/<kind>/<batch>/. Format: <WS>/drafts/<kind>/format.md. Check: <its Check command>.
    [Rulings: <id> keep; <id> drop; <id> change: <the maintainer's words> — after the maintainer rules.]
    [Confirmed: <ids> — after the maintainer accepts the changed rows.]

The return is one line, `BATCH <kind>/<batch>: <state> — kept <n>, for maintainer <k>`, followed for
`to confirm` by one line per changed row. Write state, kept and for-maintainer into the batch's row, then:

- `accepted` or `ruled`: nothing more.
- `for maintainer`: tell the maintainer, with the path of the batch's `disputes.md`. Their answer, per row,
  is keep, drop, or a change in their own words. Add one Rulings line for the batch, then dispatch its batch
  controller again with `Rulings:`.
- `to confirm`: show the maintainer the changed rows, as returned. On their yes, dispatch again with
  `Confirmed:`; on another change, with `Rulings:`.
- `failed`: tell the maintainer, with the reason. The batch waits for their word.

The ledger has one writer, you, plus each task controller's log entry. When an edit of `progress.md` fails
because the file changed, read it again and redo the edit: a task controller has just appended its entry.

## Telling the maintainer

One line per event, with a path for the detail, in place of the loop's paragraph:

    Task 2 (#75) done — abc1234, tests pass.
    Batch explanations/04 accepted — 40 rows kept.
    Batch explanations/07 for you — 3 rows: <WS>/drafts/explanations/07/disputes.md
    Task 5 needs a ruling: <the question>

When they ask where things stand, one line:

    Code: task 4 of 9 in progress. Drafting: 5 of 12 batches accepted, 4 drafting. Waiting for you: 1 dispute.

An idea that would make the run easier (a script, a check, a change to this kit) goes to them the same way,
as a proposed task. It becomes a task, with a brief and a Status row, on their word.

## Stopping, and starting again

- The session has no dispatch limit. It ends at the plan's end, at the maintainer's word, or at a limit stop.
- When `run-controller.md` says to stop the run (a `sitting` task, `needs design`, a `failed` task): dispatch
  nothing new, wait for the batch controllers in flight and write their rows, then launch what the loop
  launches and stop. One run controller at a time: the next one is the session that sitting launches.
- After a cut-off, the next session starts as `run-controller.md` says (six minutes' wait, the command, the
  start prompt) and adds its own `Sitting:` line. It dispatches the batches left `drafting` again: their
  batch controllers carry on from the files.
- After a compaction, the hook's reminder covers this file too: re-read it with `run-controller.md`.

## Names for the measures

Every dispatch's description starts with what it serves: `task <N>`, `batch <kind>/<batch>`, `closing` or
`measure`. Task and batch controllers name their own dispatches the same way, so the measure groups every
transcript by them.

## Measuring, and the trial report

The measures of `run-controller.md` (after the third code-lane task, and at the end) go to a `haiku` agent,
description `measure`: "Read docs/agents/plan-runs/one-session.md, section « Measuring, and the trial
report », and measure the run in <WS>/run.md. Report to <WS>/tmp/measure-<n>.md." It returns at most 10
lines. At the plan's end, after the closing review, its report is the trial report, `<WS>/trial-report.md`:
give the maintainer its path with the run's final report, and ask whether one session stays.

For the measuring agent:

1. Run `node "$HOME/.claude/tools/measure-session/usage.js" "<transcript without .jsonl>" "<WS>/tmp/usage-<k>.json"`
   on the transcript of each `Sitting:` line of `run.md`.
2. Group its rows by the first words of their labels. A row whose label names no task, batch, `closing` or
   `measure` counts with its parent: its `.meta.json`, beside its transcript, gives the `parentAgentId`. The
   session's own row is the run controller's, reported apart: it cannot be split by task.
3. Write, phase 3 beside phase 2:
   - **tokens**, weighted: the total, per code-lane task, the average per class, per batch and per kind, and
     the run controller's own row;
   - **hours**: from the first `Sitting:` line to the branch's last commit (`git log -1 --format=%ci`);
   - **compactions**: the `"subtype":"compact_boundary"` lines in each sitting's own `.jsonl`;
   - **slips**: from the ledger's Log, fix rounds, verifier fails and `failed` tasks; `failed` batches from
     the batch controllers' returns, in the Batches table; from `run.md`, each sitting after the first (a
     cut-off or a stop);
   - **disputes**: rows disputed once, rows sent to the maintainer, and their rulings (keep, drop, change).
4. Phase 2, for the comparison: 1.57M weighted per task, measured during its run on 2026-10-19; its hours
   from the commits of PR #44 (`git log --format=%ci 6adfd27^1..6adfd27^2`); its compactions from the
   transcripts in the folder under `%USERPROFILE%\.claude\projects\` whose name ends in
   `vlaams-phase-2--claude-worktrees-phase-2`. A figure you cannot measure, in either phase, is written
   « not measured ».
