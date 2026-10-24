# Ledger template

Copy everything below the line into `<WS>/progress.md` when setting up a run, with one Status row per plan
task. The run controller edits only the Status table, the Batches table and the Rulings. Task controllers only
append to the Log. A plan with no `fan-out` task leaves out the Batches section.

---

# Ledger — <plan file>

## Status

| Task | Class | Ticket | State | Commit | Verifier | Review |
|---|---|---|---|---|---|---|
| 1 | mechanical | #<n> | pending | | | |

Class: `engine`, `mechanical`, `fan-out` (drafted in batches, `one-session.md`), `gate` (a question the run
controller puts to the maintainer itself, `one-session.md`) or `sitting` (a `sitting` task is launched as a
session of its own, and stops the run).

States: `pending`, `in progress`, `done`, `fallback`, `needs ruling`, `needs design`, `failed`, `replaced by <id>`.

## Batches

| Kind | Batch | Rows | State | Kept | For maintainer | Path |
|---|---|---|---|---|---|---|

One row per line a `fan-out` task's Split printed. States: `pending`, `drafting`, `accepted`,
`for maintainer`, `to confirm`, `ruled`, `failed`.

## Rulings

<!-- one line each: date — commit (git log -1 at the ruling) — task or batch — question — answer.
     A ruling that changes an earlier one is a new line; the earlier line ends with « (replaced by <date>) ». -->

## Log

<!-- Append only, newest last: one entry per task boundary, in this form.

### Task <N> — <state> — <commit or none> — <YYYY-MM-DD HH:MM UTC>
- Scope and decisions: <what was built; rulings applied>
- State and next: <state>; next is task <N+1>
- Files and tree: <files changed>; git status --short: <clean, or the list>
- Tests: <command> → <result line>; verifier: <line>
- Review: <verdict> (<c>/<i>/<m>), <report path>; fix rounds: <0-2>
- Open: <each title of the brief's `Promises:` line, as `ticket: <title>`; questions, risks, approvals
  still needed; or none>
-->
