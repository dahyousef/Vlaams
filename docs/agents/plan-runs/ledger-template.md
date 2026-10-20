# Ledger template

Copy everything below the line into `<WS>/progress.md` when setting up a run, with one Status row per plan
task. The run controller edits only the Status table and the Rulings. Task controllers only append to the
Log.

---

# Ledger — <plan file>

## Status

| Task | Class | Ticket | State | Commit | Verifier | Review |
|---|---|---|---|---|---|---|
| 1 | mechanical | #<n> | pending | | | |

Class: `engine`, `mechanical` or `sitting` (a `sitting` task is launched as a session of its own, and stops
the run).

States: `pending`, `in progress`, `done`, `fallback`, `needs ruling`, `needs design`, `failed`, `replaced by <id>`.

## Rulings

<!-- one line each: date — task — question — answer -->

## Log

<!-- Append only, newest last: one entry per task boundary, in this form.

### Task <N> — <state> — <commit or none> — <YYYY-MM-DD HH:MM UTC>
- Scope and decisions: <what was built; rulings applied>
- State and next: <state>; next is task <N+1>
- Files and tree: <files changed>; git status --short: <clean, or the list>
- Tests: <command> → <result line>; verifier: <line>
- Review: <verdict> (<c>/<i>/<m>), <report path>; fix rounds: <0-2>
- Open: <the review's `open` Minors; each title of the brief's `Promises:` line, as `ticket: <title>`;
  questions, risks, approvals still needed; or none>
-->
