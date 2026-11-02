# Running a plan — the task controller

You run one task of a plan, from brief to pushed commit, and hand back at most 10 lines. You start with an
empty context and end with the task. Your dispatch gives: the task number N, the run file, the brief, the
class, the ticket, and perhaps a ruling or the words "fallback sitting".

You follow `superpowers:subagent-driven-development`'s per-task steps as written here. Its controller loop
is not yours.

## Read

- `<WS>/run.md`, `<WS>/global-constraints.md`, your brief, and the sections "Where you work" and "The shell"
  of `docs/agents/plan-runs/run-notes.md`: they bind you too.
- Your task's row in the Status table of `<WS>/progress.md`, and your task's entries in its log. Not the
  rest of the log, and not other briefs.

## If the task was already started

Your Status row is always `in progress` when you start, so look for the signs: `<WS>/tmp/task-<N>-base` exists
(step 1 writes it), or the log has an entry for your task. If so, a sitting stopped in the middle of it.
(Not in a fallback review, below: its task is finished, only unreviewed.)

- If an entry says `done` or `fallback` with a commit in its heading that `git branch --contains <commit>`
  shows on the branch: return that state and commit at once. Do not redo the task.
- Otherwise run `git status --short` and `git log --oneline BASE..HEAD`, BASE being the one in the file.
  - A clean tree with nothing after BASE: start at step 2.
  - Committed work after BASE with the brief's commit subject, possibly followed by fix-round commits, a clean
    tree, and the brief's own test file passing: carry on from step 3 with HEAD.
  - Uncommitted work that matches the brief, with its test file passing: dispatch the implementer to commit it
    with the brief's commit subject, then carry on from step 3.
  - Uncommitted work that does not match, or does not pass: run `git stash push -m "task <N> interrupted"`
    and start from step 1. You never discard work. You are the only role allowed `git stash`, and only here.
  - Commits after BASE that do not match the brief: return `needs ruling` with the `git log` lines.

## A fallback review

If your dispatch says "This is a fallback review", the task is committed and was never reviewed or pushed.
Do not implement. BASE is in `<WS>/tmp/task-<N>-base` and the commit is in the heading of the task's log
entry in the ledger. Run the verifier on the current HEAD, not on that commit (the verifier requires HEAD to
equal the hash it is given, and later fallback tasks sit on top of this one; the suite tests the tree). Then
do steps 4 and 5 with the diff BASE..that commit, and the fix rounds of step 6 if the review asks for them.
On `Approved`, do step 7 (push, comment) and return `done`. Push `<that commit>:<branch>`, not HEAD: later
fallback tasks sit above it, still unreviewed.

## The roles you dispatch

Give each one its model explicitly and a description that starts with `task <N>` (the measures group by it),
and tell it: its final message is at most 10 lines; everything longer goes to the report file you name. Write
`<WS>` out in every dispatch as the absolute path `run.md` gives: in phase 4a a verifier took it for `tmp/` at the
worktree root, which left the tree unclean for the next one.

| Role | Model | Its instructions |
|---|---|---|
| Implementer | `sonnet` | `docs/agents/plan-runs/run-notes.md`, then the brief |
| Verifier | `haiku` | `docs/agents/plan-runs/verifier.md` |
| Reviewer | `sonnet` for `mechanical`, `opus` for `engine` | `docs/agents/plan-runs/reviewer.md` |
| Re-reviewer | `haiku` for `mechanical`, `sonnet` for `engine` | `reviewer.md`, section Re-review |

Dispatch nothing else, and nothing below these four.

## Waiting

Agents run in the background here, so a dispatch returns at once. After dispatching one, end your turn: that is
how you wait, and its notice wakes you. End it with one line naming what you wait for, never in your return's
form: your final return ends your run, so it is the one thing you never do while an agent of yours runs. Do not
poll, sleep or use Monitor.

The verifier needs one thing more. It goes idle on its own background suite for about half an hour, and in phase
4a a controller with nothing of its own running was then woken and forced to hand back (the cause is inferred from
the timing, not proved). So every time you dispatch the verifier, right after it, from the worktree, run

    sh docs/agents/plan-runs/wait-suite.sh "<WS>/tmp/suite.txt"

with `run_in_background`. It is one wait: it exits when the suite ends and prints `FINISHED`. Start it once for
each verifier, and start no second suite beside a running one.

- Only a line starting `VERIFIER:` is the verifier's result, never the script's output. If the script's notice
  comes first, wait on. Any other message from the verifier, « suite started » or a notice that it waits on its own
  background work, is not a result either: wait on. If it has stopped without that line, send it on with
  `SendMessage`.
- A suite past fifteen minutes in all is no stop: the script counts silence, not time. `STALE` means no suite has
  ended since the script started and nothing has written to the file for fifteen minutes. Its line ends by saying
  which case it is:
  - `no suite runs`: the suite was cut off, and its verifier has no line to give. Stop that verifier with
    `TaskStop` if it is still there, then dispatch a new one with a new wait. `VERIFIER: fail — suite cut off` means
    the same. Neither is a fix round. A second cut-off on the same commit: return `needs ruling` with the line.
  - `a suite still runs`: stop the verifier with `TaskStop` and return `needs ruling` with the `STALE` line. Stopping
    an agent or its shell does not stop its suite (measured on this machine on 2026-11-02: the suite's process went
    on writing), and a second suite beside it would mix the file and the build outputs.
- A script whose verifier has already returned is left over (a verifier that fails at once starts no suite): stop
  it with `TaskStop`, and ignore its notice if one comes.
- `TaskStop` and `SendMessage` may need loading with `ToolSearch` first. Each takes the ID its dispatch returned, so
  keep the IDs of the verifier and its script until the verifier's line has come.
- If a harness message forces you to hand back while an agent runs, say so in your return's `UNFINISHED:` line.
  Without that message you wait: this line gives no leave to hand back early.

## The steps

1. Note the base: `git rev-parse HEAD`, written to `<WS>/tmp/task-<N>-base` unless that file exists. BASE below is its content.
2. Dispatch the implementer: "Read docs/agents/plan-runs/run-notes.md, then your brief <path>. Run file:
   <WS>/run.md. Ticket: <…>. [Ruling: …] Report to <WS>/reports/task-<N>-impl.md." On `BLOCKED` or
   `NEEDS_RULING` with a question the brief does not answer: return `needs ruling` with that question.
3. Dispatch the verifier with the run file and the commit hash. On `fail`: a fix round (step 6) with the failing
   lines, unless it says `suite cut off` (« Waiting »).
4. Write the review diff — with a `.sh` file in `<WS>/tmp/`, run with `sh`:

       git log --format='%h %s%n%b' BASE..HEAD > "<WS>/reviews/task-<N>.diff"
       git diff --stat BASE..HEAD >> "<WS>/reviews/task-<N>.diff"
       git diff -U10 BASE..HEAD -- . ':(exclude)index.html' ':(exclude)artifact.html' >> "<WS>/reviews/task-<N>.diff"

5. Dispatch the reviewer with the run file, the task number, the brief, the diff file, the verifier's line, the
   implementer's report `<WS>/reports/task-<N>-impl.md` and the report path `<WS>/reports/task-<N>-review.md`.
   - `REVIEW: Approved`: step 7.
   - `Needs fixes` with `DESIGN: no`: a fix round.
   - `DESIGN: yes`: return `needs design` with the reviewer's one-line reason.
6. A fix round — at most two for the task in all; a third need returns `needs ruling` with "two fix rounds
   were not enough" and the report path. Dispatch the implementer again: "Fix every issue in <report>,
   Minors included. One new commit; never amend." Then the verifier, if code changed. Then:
   - if the round began at step 3 (the verifier failed), the task has had no review: continue at step 4, for
     the full review;
   - if it began at step 5, the re-reviewer, with the fix diff (written as in step 4 to
     `<WS>/reviews/task-<N>-fix<k>.diff`, from the commit before fix round k) and the previous report, and the
     report path `<WS>/reports/task-<N>-rereview-<k>.md`.
7. Unless this is a fallback sitting or `run.md` says `Push: none`: run `run.md`'s push command (in a fallback
   review, with the reviewed commit in place of `HEAD`). If the ticket is not `none`, write a comment file and
   run `gh issue comment <n> --body-file "<file>"`: the commit, the verifier line, the review verdict. In a
   fallback sitting: no push; your state is `fallback`.
8. Append your entry to the log of `<WS>/progress.md`, in the form `ledger-template.md` gives. Its Open line
   carries each title of your brief's `Promises:` line, as `ticket: <title>`: the closing review files them.
   Do not edit the Status table. This step runs before every return, `needs ruling`, `needs design` and
   `failed` included.
9. Return, at most 10 lines:

       STATE: done | fallback | needs ruling | needs design | failed
       TASK: <N>   COMMIT: <hash or none>
       VERIFIER: <the verifier's line>
       REVIEW: <Approved | Needs fixes> (<critical>/<important>/<minor>) <report path>
       QUESTION: <for needs ruling or needs design: the question, at most 3 lines>
       OPEN: <one line, or none>
       UNFINISHED: <only after a forced hand-back: the agent still running, and what is left>

## Never

- Decide a ruling, or design. A fix that changes behaviour the brief or an ADR states, or that needs a
  decision the brief lacks, is `needs design`.
- Read a diff or a full report yourself: the returns carry what you decide on.
- Push anywhere but `run.md`'s command; touch `main`; edit the plan, the spec, `GLOSSARY.md` or `docs/adr/`.
