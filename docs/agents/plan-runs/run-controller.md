# Running a plan — the run controller

You are the run controller: the top session of a plan run. You hand out tasks, you ask the maintainer for
rulings, and you stay small. This file is the whole of your job.

## What you read, and nothing else

- This file.
- `<WS>/run.md`: where the run works, its branch, its push command, its ticket per task, and the `Sitting:` lines
  you append to it.
- The **Status** table and the **Rulings** of `<WS>/progress.md` — not its log.
- `git log -1 --oneline` in the run's worktree.
- If `run.md` says `Mode: one session`: `one-session.md`. It adds a drafting lane and changes the sittings,
  the news and the measures; where it differs from this file, it wins.

Never read a diff, a report, a brief or source code: task controllers do. A return that is not enough to act
on is a reason to ask the maintainer, not to read the code. Read no agent or session listings: act only on your
task controllers' notices.

## The loop

1. In a normal sitting, take the first `fallback` task, in plan order, if there is one: it was committed
   unpushed, and now gets its review and its push. Otherwise (and always in a fallback sitting) take the first
   task, in plan order, whose state is not `done`, `fallback` or `replaced by <id>`.
1b. A task whose class is `sitting` is not dispatched to a task controller. Set its Status row to
   `in progress`, launch a session with the brief prompt (see « Launching a sitting », model `opus`), and stop
   the run.
2. Set its Status row to `in progress`. A row already `in progress` is a stopped task: dispatch it as usual; the
   task controller recovers.
3. Dispatch one task controller (a background subagent) with the prompt below. Model by the task's class:
   `sonnet` for `mechanical`, `opus` for `engine`.
4. Wait for its completion notice. Its return is at most 10 lines, in the form `task-controller.md` gives.
5. Write the return into the task's Status row: state, commit, verifier line, review verdict.
6. Tell the maintainer in one short paragraph.
7. By state:
   - `done` or `fallback`: the next task. (A fallback review returns `done`.)
   - `needs ruling`: ask the maintainer the question as given. Add a line to **Rulings** (date, commit, task,
     question, answer, in the ledger's form). Dispatch the same task again with the ruling in its prompt. Whenever you dispatch a task
     for which Rulings has a line, put that line's answer in the prompt.
   - `needs design`: launch a design sitting (see « Launching a sitting », with `design-sitting.md`'s
     prompt), tell the maintainer its name, and stop the run. The task waits for that sitting; its brief comes
     back as a new task with its own Status row.
   - `failed`: stop the run and tell the maintainer, with the report paths from the return.

The dispatch prompt:

    You are the task controller for task <N> of the plan run in <worktree>. Read
    docs/agents/plan-runs/task-controller.md and follow it. Run file: <WS>/run.md.
    Brief: <WS>/briefs/task-<N>.md. Class: <class>. Ticket: <#n or none>.
    [Ruling: <the maintainer's answer> — whenever Rulings has a line for this task.]
    [This is a fallback sitting. — only in a fallback sitting.]
    [This is a fallback review. — only for a task whose state is `fallback`, in a normal sitting.]

## Sittings

- A sitting is one session. At its start, before the first dispatch, append one line to `<WS>/run.md`:
  `Sitting: <date and time> — <its transcript path>`, the path the session-start hook printed
  (`This session's transcript: …`), copied. Before writing the line, check that a file exists at that path. If
  there is none, write `Sitting: <date and time> — no transcript on disk at <path>`; if the hook printed no line,
  write `Sitting: <date and time> — transcript unknown (no hook line)`. A sitting that is cut off is then recorded too.
  The sitting ends at the maintainer's word, at a limit stop, or at the first task
  boundary after its tenth dispatch. Every dispatch counts, a task sent again after a ruling or a crash
  included: each one adds its return to this session's context, which is what the limit bounds. Then launch the next sitting (see « Launching a sitting »)
  with the start prompt, tell the maintainer the new session's name, and stop. You never ask the maintainer to
  paste anything.
- A launched session starts in the run's worktree, so the background-session guard does not move it.
- Never continue a run with `--resume` or `--continue`: a resumed run rewrites its whole context into the
  cache. A new sitting starts from the files.
- After a compaction or a resume, a hook reminds you to re-read this file and the ledger's Status table,
  Batches table and Rulings. Do it before the next dispatch.

## Launching a sitting

A sitting, a design sitting and a `sitting`-class task are each launched as a Remote Control session, from
the run's worktree, with this command (PowerShell):

    & "$env:USERPROFILE\.local\bin\claude.exe" --bg --remote-control "<name>" -n "<name>" --model opus --settings '{\"env\":{\"CLAUDE_CODE_AUTO_COMPACT_WINDOW\":\"200000\"}}' -- "<prompt>"

- `<name>` takes the form `Vlaams phase <n> — <what it is> <k>`.
- `<prompt>` is the start prompt (below), a design sitting's prompt, or « Read `<WS>/briefs/task-<N>.md` and
  follow it. Run file: `<WS>/run.md`. ».
- The quotes inside `--settings` are escaped because Windows PowerShell 5.1 drops unescaped ones from an
  argument it passes to a program: `'{"env":…}'` arrives as `{env:{CLAUDE_CODE_AUTO_COMPACT_WINDOW:200000}}`,
  which is not JSON.
- The launch prints `backgrounded · <id> · <name>`. Right after it, open a window attached to the new session,
  so the maintainer can follow it on the desktop:

      Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', '& "$env:USERPROFILE\.local\bin\claude.exe" attach <id>'

« The command » means both: the launch, then its window.

## After the last task

Dispatch the closing review (`closing-review.md`) on `opus`, naming the run file and its `Base:` commit. If
its `FIXES` line names a brief, add a Status row `closing` (`mechanical`, ticket `none`) and run it through
the loop like any task. Then measure, and write the run's final report for the maintainer, with the closing's
`TICKETS`. The full review of the branch is the maintainer's, against the remote: `git fetch origin`, then
`/code-review origin/main`. A local `main` that lags puts main's own commits in the diff.

## Measuring

After the third task is `done`, and at the end of the run, run

    node "$HOME/.claude/tools/measure-session/usage.js" "<transcript path without .jsonl>" "<WS>/tmp/usage.json"

on the transcript of each sitting named by the `Sitting:` lines of `run.md`, this one included, not the log. A
sitting whose line says no transcript or unknown is reported as « not measured », never guessed. Report the
weighted total per task, and the average per task for `engine` and for `mechanical` tasks apart, beside it. If
the average after three tasks is above 1.32M (60% of phase 1's 2.2M per task), stop and tell the maintainer
before going on.

## The skill this replaces

`superpowers:subagent-driven-development`'s controller loop does not apply to you: it is what grew phase 1's
controller to 871k tokens. Task controllers follow its per-task steps as `task-controller.md` writes them.
The maintainer's instructions take precedence over the skill.

## For the maintainer: setting up and starting a run

Once per plan, in the run's worktree, create `<WS>` = `.superpowers/sdd/<plan name>/` (git-ignored) with:

- `run.md`, from the block below;
- `progress.md`, from `ledger-template.md` with its title filled in, one Status row per plan task with its
  class and ticket;
- `global-constraints.md`: the plan's Global Constraints and Review Focus, word for word;
- `briefs/task-<N>.md`: each task's full text from the plan, checked as `design-sitting.md` says before a
  brief is approved;
- for each `fan-out` task, `drafts/<kind>/format.md`: its brief's Format and Reader focus sections, word for
  word;
- empty folders `reports/`, `reviews/`, `tmp/`.

`run.md`:

    # Run — <plan file>
    Worktree: <absolute path>
    Branch: <branch>
    Base: <the commit the run starts from: git rev-parse HEAD before task 1>
    Push: git push origin HEAD:<branch>        (or: none)
    Workspace (<WS>): <absolute path>
    Tickets: task 1 → #<n>, task 2 → #<n>     (or: none)
    Plan: <path>
    Mode: one session        (only for a one-session run, one-session.md; leave the line out for sittings)
    Fan-out: task <id> — kind <kind> — after <ids> — Split: <command> — Check: <command> — merged by task <id>
                             (one line per fan-out task)
    Sittings: (the run controller appends one `Sitting:` line per sitting below)

The first sitting is launched with the command, from the run's worktree, by whichever Claude session the
maintainer is talking to. The maintainer never starts a sitting by hand, and never pastes a prompt.

After a cut-off, wait six minutes first: closing a session's window does not stop a suite its verifier started,
and `sh test/run-all.sh` runs on for up to six minutes, rewriting `<WS>/tmp/suite.txt` and the build outputs.
Then that session launches the next sitting with the command. The start prompt is:

    Run the plan in <WS>/run.md. Read docs/agents/plan-runs/run-controller.md, then the Status table of
    <WS>/progress.md, and continue from the first task that is not done (the loop above puts `fallback` tasks first).

A fallback sitting, when Claude's limit is reached and OmniRoute is set up with a profile, is the one sitting
that does not use the command: start it with `omniroute launch --profile <name>` and give it the same prompt
followed by `This is a fallback sitting.`
