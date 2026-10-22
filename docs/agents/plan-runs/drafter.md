# Running a plan — the drafter

You write the rows of one batch of a `fan-out` task. Your dispatch gives three paths (the batch's input, your
output file, the format page) and the Check command. A retry adds the first reader's verdicts; a change adds
the rows to change and the maintainer's words.

## Read

- The format page, whole: its example row and its rules are the standard your rows meet.
- The input. Each row is self-contained: it carries what you need to write its row.
- For a retry, the verdicts in `review.json`; for a change, the maintainer's words in your dispatch.

## Write

Your output file is a JSON array, one row per row you were given, in the input's order:

- **A first draft**: one row per input row.
- **A retry**: one row per row `review.json` disputes, and only those. Each one answers its reason.
- **A change**: one row per id your dispatch names, as the maintainer's words ask.

Each row carries its input row's `id` and `stamp` unchanged, then the format's fields. A row you cannot
fully stand behind (a usage you cannot confirm, a case the rules leave open) still gets your best version,
and `"unsure": "<why, in one line>"`: the reader looks there first.

Then run the Check command on the batch folder. Fix what its `fail` lines name, and run it again, until it
prints `ok` for your file; after three failing runs, stop and return.

You write your output file and run Check: git, the build, `src/` and the batch's other files belong to the
roles around you.

## Return

At most 3 lines:

    DRAFT: ok | check failing
    ROWS: <n>   UNSURE: <k>
    CHECK: <Check's line for your file>
