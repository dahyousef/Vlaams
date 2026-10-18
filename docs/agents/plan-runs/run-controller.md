# Running a plan — the run controller

You are the run controller: the top session of a plan run. You hand out tasks, you ask the maintainer for
rulings, and you stay small. This file is the whole of your job.

## What you read, and nothing else

- This file.
- `<WS>/run.md`: where the run works, its branch, its push command, its ticket per task.
- The **Status** table and the **Rulings** of `<WS>/progress.md` — not its log.
- `git log -1 --oneline` in the run's worktree.

Never read a diff, a report, a brief or source code: task controllers do. A return that is not enough to act
on is a reason to ask the maintainer, not to read the code.

## The loop

1. In a normal sitting, take the first `fallback` task, in plan order, if there is one: it was committed
   unpushed, and now gets its review and its push. Otherwise (and always in a fallback sitting) take the first
   task, in plan order, whose state is not `done` or `fallback`.
2. Set its Status row to `in progress`.
3. Dispatch one task controller (a background subagent) with the prompt below. Model by the task's class:
   `sonnet` for `mechanical`, `opus` for `engine`.
4. Wait for its completion notice. Its return is at most 10 lines, in the form `task-controller.md` gives.
5. Write the return into the task's Status row: state, commit, verifier line, review verdict.
6. Tell the maintainer in one short paragraph.
7. By state:
   - `done` or `fallback`: the next task. (A fallback review returns `done`.)
   - `needs ruling`: ask the maintainer the question as given. Add a line to **Rulings** (date, task,
     question, answer). Dispatch the same task again with the ruling in its prompt.
   - `needs design`: stop the run. The task waits for a design sitting (`design-sitting.md`); its brief
     comes back as a new task with its own Status row.
   - `failed`: stop the run and tell the maintainer, with the report paths from the return.

The dispatch prompt:

    You are the task controller for task <N> of the plan run in <worktree>. Read
    docs/agents/plan-runs/task-controller.md and follow it. Run file: <WS>/run.md.
    Brief: <WS>/briefs/task-<N>.md. Class: <class>. Ticket: <#n or none>.
    [Ruling: <the maintainer's answer> — only when re-dispatching after a ruling.]
    [This is a fallback sitting. — only in a fallback sitting.]
    [This is a fallback review. — only for a task whose state is `fallback`, in a normal sitting.]

## Sittings

- A sitting is one session. It ends at the maintainer's word, at a limit stop, or at the first task
  boundary after you have dispatched 10 tasks in it. Then append `Sitting ended after task <N>.` to the log
  and tell the maintainer to start the next sitting with the start prompt below, in a new session.
- Never continue a run with `--resume` or `--continue`: a resumed run rewrites its whole context into the
  cache. A new sitting starts from the files.
- After a compaction or a resume, a hook reminds you to re-read this file and the Status table. Do it before
  the next dispatch.

## After the last task

Dispatch the closing review (`closing-review.md`) on `opus`. Then measure, and write the run's final report
for the maintainer. The full review of the branch is the maintainer's (`/code-review main`).

## Measuring

After the third task is `done`, and at the end of the run, run

    node "$HOME/.claude/tools/measure-session/usage.js" "<transcript path without .jsonl>" "<WS>/tmp/usage.json"

on this sitting's transcript — the newest `.jsonl` in `$HOME/.claude/projects/<this worktree's project
folder>/` — and on the earlier sittings named in the log. Report the weighted total per task. If the average
after three tasks is above 1.32M (60% of phase 1's 2.2M per task), stop and tell the maintainer before going
on.

## The skill this replaces

`superpowers:subagent-driven-development`'s controller loop does not apply to you: it is what grew phase 1's
controller to 871k tokens. Task controllers follow its per-task steps as `task-controller.md` writes them.
The maintainer's instructions take precedence over the skill.

## For the maintainer: setting up and starting a run

Once per plan, in the run's worktree, create `<WS>` = `.superpowers/sdd/<plan name>/` (git-ignored) with:

- `run.md`, from the block below;
- `progress.md`, from `ledger-template.md`, one Status row per plan task with its class and ticket;
- `global-constraints.md`: the plan's Global Constraints and Review Focus, word for word;
- `briefs/task-<N>.md`: each task's full text from the plan;
- empty folders `reports/`, `reviews/`, `tmp/`.

`run.md`:

    # Run — <plan file>
    Worktree: <absolute path>
    Branch: <branch>
    Push: git push origin HEAD:<branch>        (or: none)
    Workspace (<WS>): <absolute path>
    Tickets: task 1 → #<n>, task 2 → #<n>     (or: none)
    Plan: <path>

Starting a sitting — in PowerShell, in the worktree:

    $env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = '200000'; claude

then paste:

    Run the plan in <WS>/run.md. Read docs/agents/plan-runs/run-controller.md, then the Status table of
    <WS>/progress.md, and continue from the first task that is not done (the loop above puts `fallback` tasks first).

A fallback sitting, when Claude's limit is reached and OmniRoute is set up with a profile: start it with
`omniroute launch --profile <name>` and paste the same prompt followed by `This is a fallback sitting.`
