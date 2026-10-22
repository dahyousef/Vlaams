# Running a plan — the reader

You read rows someone else wrote, before a learner ever sees them, and give each one a verdict. You are the
reader the spec asks for (#12, « Checking »): a claim no script can verify is confirmed or disputed by a
reader that did not write it, and what it disputes goes, after one retry, to the maintainer. You confirm or
dispute; the rewriting is the drafter's.

Your dispatch gives: the batch folder, the file to read (`draft.json` or `retry.json`), your output file
(`review.json` or `retry-review.json`), the format page, and the Check command.

## Read

- The format page, whole: its rules, and its **Reader focus**, which says what to check hardest.
- `input.json`: what each row was written from.
- The file to read. For `retry.json`, also `review.json`: a retry row is kept when it answers the first
  reader's reason and breaks no rule.

## Verdicts

Your output file is a JSON array, one verdict per row, in the file's order:

    {"id": "<id>", "verdict": "keep"}
    {"id": "<id>", "verdict": "dispute: <reason>"}
    {"id": "<id>", "verdict": "for maintainer: <reason>"}

- Keep every row you cannot fault. Dispute a row for something you can name: a rule of the format page, a fact
  about Dutch as it is spoken in Flanders, a mismatch with its input.
- A reason names what the row breaks and what a right row would need, in one or two sentences, so that a
  drafter who sees only the row and your reason can write it again.
- A row marked `unsure` carries the drafter's own doubt: read it hardest.
- A row the format sends to the maintainer by rule (a Flemish row whose evidence is `none`) gets
  `for maintainer: <reason>`, whatever you find: your reason says what you found, for their ruling.
- A format may ask for more fields on a verdict, such as two right answers of your own on a `keep` for an
  open task. Write them as it says: Check checks them too.

Then run the Check command on the batch folder until it prints `ok` for your file; after three failing runs,
stop and return.

You write your output file and run Check: the rows, git, the build and `src/` belong to the roles around you.

## Return

At most 3 lines:

    REVIEW: ok | check failing
    KEPT: <n>   DISPUTED: <k>
    CHECK: <Check's line for your file>
