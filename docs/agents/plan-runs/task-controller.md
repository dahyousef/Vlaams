# Running a plan — the task controller

You run one task of a plan, from brief to pushed commit, and hand back at most 10 lines. You start with an
empty context and end with the task. Your dispatch gives: the task number N, the run file, the brief, the
class, the ticket, and perhaps a ruling or the words "fallback sitting".

You follow `superpowers:subagent-driven-development`'s per-task steps as written here. Its controller loop
is not yours.

## Read

- `<WS>/run.md`, `<WS>/global-constraints.md`, your brief.
- Your task's row in the Status table of `<WS>/progress.md`, and your task's entries in its log. Not the
  rest of the log, and not other briefs.

## If the log already has an entry for your task

A sitting stopped in the middle of it.

- If an entry says `done` or `fallback` with a commit that `git branch --contains <commit>` shows on the
  branch: return that state and commit at once. Do not redo the task.
- Otherwise run `git status --short`. If there is uncommitted work, and it matches the brief, and the brief's
  own test file passes: carry on from step 3 with that work. If not, run
  `git stash push -m "task <N> interrupted"` and start from step 1. You never discard work. You are the only
  role allowed `git stash`, and only here.

## The roles you dispatch

Give each one its model explicitly, and tell it: its final message is at most 10 lines; everything longer
goes to the report file you name.

| Role | Model | Its instructions |
|---|---|---|
| Implementer | `sonnet` | `docs/agents/plan-runs/run-notes.md`, then the brief |
| Verifier | `haiku` | `docs/agents/plan-runs/verifier.md` |
| Reviewer | `sonnet` for `mechanical`, `opus` for `engine` | `docs/agents/plan-runs/reviewer.md` |
| Re-reviewer | `haiku` for `mechanical`, `sonnet` for `engine` | `reviewer.md`, section Re-review |

Dispatch nothing else, and nothing below these four.

## The steps

1. Note the base: `git rev-parse HEAD`.
2. Dispatch the implementer: "Read docs/agents/plan-runs/run-notes.md, then your brief <path>. Run file:
   <WS>/run.md. Ticket: <…>. [Ruling: …] Report to <WS>/reports/task-<N>-impl.md." On `BLOCKED` or
   `NEEDS_RULING` with a question the brief does not answer: return `needs ruling` with that question.
3. Dispatch the verifier with the commit hash. On `fail`: a fix round (step 6) with the failing lines.
4. Write the review diff — with a `.sh` file in `<WS>/tmp/`, run with `sh`:

       git log --format='%h %s%n%b' BASE..HEAD > "<WS>/reviews/task-<N>.diff"
       git diff --stat BASE..HEAD >> "<WS>/reviews/task-<N>.diff"
       git diff -U10 BASE..HEAD -- . ':(exclude)index.html' ':(exclude)artifact.html' >> "<WS>/reviews/task-<N>.diff"

5. Dispatch the reviewer with the brief, the diff file, the verifier's line and the report path
   `<WS>/reports/task-<N>-review.md`.
   - `REVIEW: Approved`: step 7.
   - `Needs fixes` with `DESIGN: no`: a fix round.
   - `DESIGN: yes`: return `needs design` with the reviewer's one-line reason.
6. A fix round — at most two for the task in all; a third need returns `needs ruling` with "two fix rounds
   were not enough" and the report path. Dispatch the implementer again: "Fix the Critical and Important
   issues in <report>. One new commit; never amend." Then the verifier, if code changed. Then the
   re-reviewer, with the fix diff (written as in step 4, from the commit before the fix) and the previous
   report.
7. Unless this is a fallback sitting or `run.md` says `Push: none`: run `run.md`'s push command. If the
   ticket is not `none`, write a comment file and run `gh issue comment <n> --body-file "<file>"`: the
   commit, the verifier line, the review verdict. In a fallback sitting: no push; your state is `fallback`.
8. Append your entry to the log of `<WS>/progress.md`, in the form `ledger-template.md` gives. Do not edit
   the Status table.
9. Return, at most 10 lines:

       STATE: done | fallback | needs ruling | needs design | failed
       TASK: <N>   COMMIT: <hash or none>
       VERIFIER: <the verifier's line>
       REVIEW: <Approved | Needs fixes> (<critical>/<important>/<minor>) <report path>
       QUESTION: <for needs ruling or needs design: the question, at most 3 lines>
       OPEN: <one line, or none>

## Never

- Decide a ruling, or design. A fix that changes behaviour the brief or an ADR states, or that needs a
  decision the brief lacks, is `needs design`.
- Read a diff or a full report yourself: the returns carry what you decide on.
- Push anywhere but `run.md`'s command; touch `main`; edit the plan, the spec, `GLOSSARY.md` or `docs/adr/`.
