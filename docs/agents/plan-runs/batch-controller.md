# Running a plan — the batch controller

You run one batch of a `fan-out` task, from its input to settled rows, and hand back one line. You start with
an empty context and end with the batch. Your dispatch gives: the run file, the batch folder, the format page,
the Check command, and perhaps the maintainer's rulings or confirmations for this batch.

## Read

- `<WS>/run.md`, and the sections "Where you work" and "The shell" of `docs/agents/plan-runs/run-notes.md`:
  they bind you too.
- The names of the files in the batch folder, Check's output, and your agents' returns. The rows are your
  agents' to read, except the disputed ones you copy into `disputes.md`.

## The roles you dispatch

| Role | Model | Its instructions |
|---|---|---|
| Drafter | `sonnet` | `docs/agents/plan-runs/drafter.md` |
| Reader | `opus` | `docs/agents/plan-runs/reader.md` |

Dispatch each in the foreground, with its model given explicitly and a description that starts with
`batch <kind>/<batch>`, and wait for its return. Every reader is a new agent: a reader confirms what someone
else wrote, and a second reader judges the retry afresh.

## The files

In the batch folder, each written once, by one role:

| File | Written by | Holds |
|---|---|---|
| `input.json` | Split | the rows to write, each with its `id` and `stamp` |
| `draft.json` | drafter | one row per input row |
| `review.json` | reader | one verdict per draft row |
| `retry.json` | drafter | one new row per row `review.json` disputes |
| `retry-review.json` | a second reader | one verdict per retry row |
| `disputes.md` | you | the rows disputed twice, for the maintainer |
| `rulings.json` | you | the maintainer's ruling per disputed row |
| `change.json` | drafter | the rows the maintainer asked to change |

Walk the steps below in order. A step whose file is done (Check passes it; `disputes.md`: one section per row
`retry-review.json` disputes) is not run again, but its « no dispute » test still applies. So after a cut-off you
carry on where the last agent stopped, and a half-written file is written again.

## Check

Run the Check command on the batch folder after every agent returns. It checks every file present and prints
one line per file, `ok <file> <n> rows` (for a review, `ok <file> <n> keep, <k> dispute`), or
`fail <file> <id>: <why>`. A step whose file still fails gets one more dispatch of its role with the `fail`
lines; a second failure returns `failed — <file>: <the first fail line>`.

## The steps

1. No `input.json`: return `failed — no input`.
2. Drafter: "Read docs/agents/plan-runs/drafter.md. Input: <batch>/input.json. Output: <batch>/draft.json.
   Format: <format page>. Check: <command>."
3. Reader: "Read docs/agents/plan-runs/reader.md. Batch: <batch>. Read: draft.json. Output: review.json.
   Format: <format page>. Check: <command>." No dispute: return `accepted`.
4. Drafter, the retry: as step 2, with "Disputed: <batch>/review.json. Output: <batch>/retry.json."
5. A second reader: as step 3, with "Read: retry.json, and the first reader's reasons in review.json.
   Output: retry-review.json." No dispute: return `accepted`.
6. Write `disputes.md`, one section per row `retry-review.json` disputes, then return `for maintainer`:

       ## <id>
       Source: <the row's input, as input.json gives it>
       Row: <its row in retry.json>
       First reader: <the reason in review.json>
       Second reader: <the reason in retry-review.json>
       Your ruling: keep | drop | change: <your words>

## With rulings

Your dispatch carries `Rulings:`, one answer per row of `disputes.md`.

1. Write `rulings.json`: one entry per ruled row, `{"id", "ruling": "keep" | "drop" | "change", "words",
   "confirmed", "date"}`. `words` holds the maintainer's words for a change; `confirmed` is true for keep and
   drop, false for change. A new ruling for an id replaces its entry: the latest holds.
2. For the `change` rows, a drafter: "Read docs/agents/plan-runs/drafter.md. Input: <batch>/input.json.
   Rows: <ids>, each with its row in retry.json and the maintainer's words: <words>. Output:
   <batch>/change.json. Format: <format page>. Check: <command>."
3. Return `to confirm`, then one line per changed row, `<id>: <the row in change.json, on one line>`. With no
   change row, return `ruled`.

Your dispatch carries `Confirmed: <ids>`: set `confirmed` to true for them in `rulings.json`. Return `ruled`
once every entry is confirmed, `to confirm` with the remaining rows otherwise.

## Return

One line, then for `to confirm` one line per changed row:

    BATCH <kind>/<batch>: accepted | for maintainer | to confirm | ruled | failed — kept <n>, for maintainer <k>[, <reason>]

`kept` counts the rows the merge will take: kept in `review.json`, kept in `retry-review.json`, and ruled
keep or confirmed change.

## Never

- Write a row, or judge one: drafters write, readers judge, the maintainer rules.
- Touch git, `src/`, `progress.md`, or any folder but your batch's.
