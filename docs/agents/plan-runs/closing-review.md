# Running a plan — the closing review

At the end of a run, before the maintainer's own review of the branch (`/code-review main`), one lead
reviewer (`opus`) checks what per-task reviews cannot see. It is not a second full review.

## The lead

Your dispatch names the run file and the run's base commit.

1. Read the log of `<WS>/progress.md`: every task's verdict and open points.
2. Write `<WS>/reviews/closing.diff` with a `.sh` file in `<WS>/tmp/`: `git diff --stat BASE..HEAD`, then
   `git diff -U5 BASE..HEAD -- . ':(exclude)index.html' ':(exclude)artifact.html'`. Do not read it whole.
3. Dispatch at most four area reviewers (`sonnet`), one for each area the diff's stat touches:
   - engine: `src/core/srs.js` and the code that calls it;
   - screens: `src/ui/`, `src/core/fr.js`, `src/core/en.js`, `src/core/gloss.js`, `src/core/lang.js`;
   - storage and sync: `src/core/state.js`, `src/core/sync.js`;
   - tests: `test/`.
   Each gets the area's paths, the diff file, `reviewer.md`'s Part 2 and Calibration, the checklist below,
   and a report path `<WS>/reports/closing-<area>.md`. Its final message, at most 10 lines: issue counts and
   the checklist items it found broken. Dispatch each one in the foreground and wait for its return; never end
   your turn while one runs.
4. Read the area reviewers' final messages and the Issues of their reports. Read the diff only around a
   Critical or Important item.
5. Check the checklist against the diff's stat and the areas' answers.
6. Leave nothing open. Each of these becomes a fix or a ticket, Minors included, and a finding that still
   holds is never closed by a reason alone: your findings and the area reviewers', the log's Open lines, and
   every ticket the plan promises to file.
   - A fix stays in files the run changed and needs no decision the plan lacks. Write all of them as one
     brief, `<WS>/briefs/task-closing.md`, in `design-sitting.md`'s form, class `mechanical`, a red check for
     each, refactors aside (`CLAUDE.md`).
   - A ticket is filed with `gh issue create --parent <the spec issue CLAUDE.md names> --label needs-triage`
     (`docs/agents/issue-tracker.md`): one subject per ticket, at most about six items.

## The checklist

- Storage keys keep their spelling: `vlaams-onderweg`, `vlaams/fallback`, `vlaams/outbox`, `vlaams/owner`,
  `vlaams/errors`, `vlaams/noaccount`.
- Stored record field names are unchanged: `stage`, `due`, `interval`, `ease`, `reps`, `lapses`, `said`,
  `retired`, `base`.
- `NL.srs.compose()` is still the only place a session's content is decided.
- Both interface tables have the same keys, and every text with a French version has an English one:
  `test/lang.js` checks it; confirm it ran in the verifier lines of the log.
- `index.html` and `artifact.html` are committed and match their sources.
- `resetAt` only grows; `ENGINE_EPOCH` is unchanged unless the plan says otherwise; reset and sync still agree
  with ADR 0006.
- Every task in the log has a verifier pass and an Approved review.
- Every ticket the plan promises is filed.

## Your report and your final message

Write the full report to `<WS>/reports/closing.md`. Your final message, at most 10 lines:

    CLOSING: clean | issues
    ISSUES: <critical>/<important>/<minor>
    CHECKLIST: <items broken, or none>
    FIXES: <WS>/briefs/task-closing.md | none
    TICKETS: #<n>, … | none
    REPORT: <WS>/reports/closing.md
