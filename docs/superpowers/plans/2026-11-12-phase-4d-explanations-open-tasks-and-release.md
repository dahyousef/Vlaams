# Phase 4d — Explanations, open tasks and the release — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/run-controller.md`, Mode: one session
> (`one-session.md`). A run controller hands one code-lane task at a time to a task controller, runs the drafting
> lane's fan-out tasks beside it, and runs gates 12 and 13; do not use a skill's controller loop. Implementers read
> `docs/agents/plan-runs/run-notes.md` before their brief; where the notes and a command here differ, the notes win.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** the last of phase 4's four plans, and its release. Plan 4c landed the 22 new units' Flemish forms without
their written wrong options and their 110 phrases without notes (D29, D30); this plan writes them, so that
`DECOY_BUDGET` and `NOTE_BUDGET` return to their strict 0. It gives an open task (« réponse libre ») to three phrases
of each new unit, 66 picked while writing this plan (D33), and to the 13 rules of `grammar.a1c.js`, through the kit
like every other row (D32). Every row is drafted in the kit's drafting lane and read by a reader that did not write
it. TESTING.md goes back to two exceptions, and a wording for #12 is proposed to the maintainer. A learner pass plays
the built course in Edge (gate 12); then gate 13 asks the maintainer whether to open the release, the pull request
from `phase-4` into `main`. The maintainer merges it; the learner's check follows (D9, D15).

**Architecture:** the content attaches where units 1–12's does. Notes, `also` lists and written wrong options go to
`src/content/notes.js`, `also.js` and `decoys.js` through the `explanations-be` and `explanations` kinds, which
exist (`tools/content/lib/explain.js`); task 2 holds `explanations-be`'s Split to the Flemish items owed something
(no decoys, or no note) and packs `explanations`' batches into whole units. Phrases' open tasks go to
`src/content/open.phrases.js` through the `open` kind, which exists; task 3 gives it D33's 66 phrases and holds its
Split to phrases without a task. Rules' open tasks have no kind today: `src/content/open.js` is written by hand. Task 4
makes it a table written by the `open` kind's Merge, keyed by rule id, its nine tasks re-serialized unchanged, and
gives the kind the 13 rules. Then three fan-outs and their merges (tasks 5–10), the docs (11), the learner pass (12)
and the release (13). Nothing in `src/core/` or `src/ui/` changes; task 4 marks an open task's answer box Dutch, one
line of `src/ex/index.js`.

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`; no bundler, no runtime dependency.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`), the tools' suites in `test/tools/`.
- The content kit, `tools/content/`: Split, Check, Merge over one module per kind; Wiktionary's Belgian senses pinned
  in `tools/content/lib/cache.js` and read from `.cache/kaikki/belgian.tsv`.
- The learner pass, `tools/learner-pass/`, through `playwright-core`, in Edge on this desktop
  (`LEARNER_PASS_CHANNEL=msedge`).
- `gh` for tickets and pull requests.

**Spec:**
- GitHub issue #12, « New vocabulary every day, English by default, and content to B1 »: « Content strategy », « The
  content factory is run, never deployed », « Checking », and the budgets' « Three exceptions » (l. 162), the third of
  which this plan removes.
- The phase 4 design sitting's decisions (`decisions-2026-10-25.md`: D9, D15, « Phase 4's plans »: « 4d —
  explanations, written wrong options, open tasks; then the release and the learner's check »).
- The maintainer's decisions D9–D33, stated below.
- `GLOSSARY.md`; ADR 0005 (amended); ADR 0006 (no task touches a reset, `base` or sync).
- The tickets, sub-issues of #12: `{T-kit}` (task 1), `{T-be}` (tasks 2, 5, 6), `{T-notes}` (tasks 7, 8),
  `{T-open}` (tasks 3, 4, 9, 10). Tasks 11, 12 and 13 carry #12 itself.

## The maintainer's decisions

D9–D20 were taken at the phase 4 design sitting and for plan 4a (25–31 October 2026), D21–D24 for plan 4b
(3 November 2026), D25–D30 for plan 4c (7 and 8 November 2026), and D31–D33 for this plan, on 12 November 2026, each
« Yes » to the recommendation.

| D | Answer | Task |
|---|---|---|
| D9 | One tranche finishing A1; one deployment and the learner's check close phase 4, after plan 4d. | 13 |
| D10 | Themed units after the current 12; the unit list approved at a gate (22 units, n 13–34). | — |
| D11 | The Node content kit stays the factory (ADR 0005 amended). | 2–10 |
| D14 | Source, then skip; generate only for the words the maintainer names. The 17 words of units 13–34 still without a sentence wait. | — |
| D15 | Read whole: new Flemish forms, sentences written for the course, ruled rows. The rest sampled (`tools/content/lib/reading.js` samples 1 in 10, at least 10 per kind). | 5, 7, 9, 12 |
| D16 | Phase 4 is several small plans, each one session with its drafting lane; content plans one after another. | set-up |
| D19 | What can be tested before drafting is tested first: each kind's Split runs on the real course and the real files in its own task, and its counts go in the ledger. | 2, 3, 4 |
| D24 | `AHEAD_BUDGET` may rise a second time, to 136 (plan 4b). D26 keeps it. | — |
| D26 | `AHEAD_BUDGET` stays 136, pinned both ways. | 6, 8, 10 |
| D28 | Plan 4c's run controller ruled on the maintainer's behalf and answered its gate. For this plan the question was asked again after it was written, with the same answer (« Set-up decisions »). | — |
| D29 | Flemish forms landed in 4c without their written decoys; `DECOY_BUDGET` is pinned both ways at the count of items with a Flemish form and no decoys; plan 4d's `explanations-be` Merge lowers it to 0. | 6 |
| D30 | The new phrases landed in 4c without their notes; `NOTE_BUDGET` is pinned both ways at the count of items with no explanation in both languages; plan 4d's `explanations` Merge writes the notes and lowers it to 0. | 6, 8 |
| D31 | Plan 4d, one session (D16): the kit (explanations-be held to the items without decoys; open extended to units 13–34, three phrases a unit, and to the 13 new rules; the run's push allowed), FAN and Merge explanations-be (`DECOY_BUDGET` → 0), FAN and Merge explanations (`NOTE_BUDGET` → 0), FAN and Merge open, the docs (#12 back to two exceptions, a wording for the maintainer), a gate in Edge with the reading page, the release PR `phase-4` → `main` (the maintainer merges; then the learner's check). #130 runs beside it as a separate code-only fix. | 1–13 |
| D32 | The 13 new rules' open tasks go through the kit (drafter, two readers, Check, Merge), as every other row: `src/content/open.js` becomes the kit's seventh Merge-written table and CLAUDE.md's list says so; its nine hand-written tasks stay. | 4, 9, 10 |
| D33 | This sitting picks 3 of each new unit's 5 phrases (a frame that holds for any learner, no token), 66 in all; the plan names them and the `open` kind's `PHRASES` takes them after the first 36. No extra gate. | 3 |

## How far to trust this plan

Every task was written by an Opus agent that proved it on a throwaway copy, in five chains (task 1; tasks 2, 5 and 6;
7 and 8; 3, 4, 9 and 10; 11, 12 and 13). Each of the 13 briefs was then read by one Opus checker that had not written
it, with both lenses: it applied the brief as an implementer, on a CRLF clone with every earlier task applied, and
read it as a reviewer. The 13 checkers found 19 blocking faults and 51 minor ones. Four fixers, one after another,
fixed them in this text and proved each step again on one CRLF copy of `dcb0d82`'s tree with every task in run order
(the fix copy that the tasks' « The proof » name: one base commit, `8d12190`, whose tree is `dcb0d82`'s). A Sonnet
re-check of each fixer's work found no blocking fault and 25 minor ones, all fixed but one: in task 3, two comments
that the brief leaves to its implementer differ in wording from the proof's. The whole plan was then replayed once,
from this text, in run order, on a fresh CRLF clone of `dcb0d82`, every row going through Check and Merge: this is
« the plan's replay » that the tasks name. It ran 12 tasks of 13; gate 13 did not run (below). The suite ended
`TOUTE LA SUITE EST PASSÉE` on the commit of each code-lane task: 1 (44 min 40 s), 2 (43 min 43 s), 3 (44 min 22 s),
4 (49 min 9 s), 6 (53 min 58 s), 8 (47 min 54 s), 10 (47 min 13 s) and 11 (45 min 13 s). Gate 12's Show ran word for
word in Edge: 556 s, no `PROBLEM:` line, its four closing lines, `RULES 22`, `TAPPABLE PER SCREEN (299)`, every row
of the three kinds taken on the reading page, and `16572 contrôles, CONTENU CONFORME` with « sans leurres » 0,
« explications » 0 and the « séquence » budget at 136. The replay fixed this text in 14 places, none changing a
decision: a crash (task 3's test wrote into a folder it had not made); what a transcriber had to choose (task 2's
comment sentence, the rows of task 3's second lot, three details of task 4's step 1, task 6's comment given as three
lines); task 2's step 4, one paragraph until then, now six bullets that pin the fixers' proved code; CLAUDE.md's
re-wrap stopped where the file's own lines start; a Review Focus line that named a test which does not exist; line
hints; the counts of tasks 6 and 8, moved by a real Check (below); task 11's two diffstats, each given its base; a
stale line pointer in task 12; « the fix loop », now named where it is defined; and task 13's counts, now with the
run's own commit (9 commits, `115`). It also set the counts of tasks 10 and 12 against the replay's real rows, and
held three findings: two asked for what the text already met, and the third (F10) asked to reword task 2's reason for
a straight apostrophe in a decoy, which keeps the wording of every other apostrophe check in the kit. An Opus
self-review then fixed 6 more places, none changing a decision: the « Why » of tasks 11 and 8 now say which tasks
edit « Encore ouvert » and what call 10 still lets differ after task 8; `<SP>` and the folder of the writers' notes
and the checks, used but defined nowhere, are defined below; and two placeholders are filled, this section and « The
expected size ».

The maintainer accepted two points after the plan was written. Gate 13 was not replayed: the replay's set-up pushes
to a branch named `main` of a local bare repository, and this machine's shell guard refuses every push to `main` to
an agent, so nothing ran. Its Show was proved by its fixer and by its re-check, on local bare repositories in states
A to G; a real `gh pr ready`, `gh pr view` and `gh pr create` ran nowhere. The replay did write the release PR's body
from task 13's template, the two slots it could not fill left visible (no `gh` in the replay; the suite on the last
commit still running). And F10 keeps its wording: a change of that wording belongs to every apostrophe check of the
kit at once, outside this plan.

**Where the proofs are.** `<SP>` in the tasks is the writing session's scratchpad,
`%USERPROFILE%\AppData\Local\Temp\claude\b5c73559d4db8763\2a87199a-4540-4134-9d72-ede6f72558bd\scratchpad`, which
holds `proofs\O-main`, `proofs\B-be-aside\sim-all.js` and `proofs\O-main-aside\fill-open.js`. `<SP2>` is the fixing
session's scratchpad,
`%USERPROFILE%\AppData\Local\Temp\claude\fedf1dcf346ae79c\5ad6091c-77e8-4ce1-90ed-e6c7f65c8e80\scratchpad`, which
holds the fix copy `fixZ` and the rest the tasks cite: `fixZ-ws-8`, `fixZ-ws-10`, `tools\fill-notes.js`,
`checks\chk-12-rws`, `f4-sim` and `f4-gate13`. The writers' notes (`notes-K.md`, `notes-B.md` and the others) are in
`%USERPROFILE%\Desktop\Projects\Vlaams\.superpowers\sdd\phase-4-design\plan-4d\parts\`, the checkers' reports
(`checks/task-1.md` and the others) in `…\plan-4d\checks\`, and the replay's `proof-log.md` in `…\plan-4d\`.
`.superpowers/` is gitignored: these files are on the maintainer's machine only.

**Line hints.** A line number in this text was measured on its writer's copy or the fix copy; a transcription's own
comments and wrapping move it. The replay found every place: most hints held to the line; task 4's were off by 1 to 6
lines (F8), and task 8's three in `TESTING.md` were not found by line (task 6 edits that paragraph); one pointer was
wrong (F15, now gone). Find each place by its text; the number says where to look.

**Task 2's Check, as given and as the replay wrote it (F3).** Step 4 now pins the fixers' proved code in six bullets.
The replay, which read that step when it was one paragraph, wrote it otherwise in five places, and all five give the
same answers on today's course. The fifth is the lookup that refuses an `also` equal to a decoy: the replay's tries
the plain and the article-less form of each `also` form and of its filled form, on every row; the pinned code tries
only the row's own `key()` of each (without the article for a word, as written for a phrase). After tasks 2, 6, 8 and
10 (at the last: 100 sources, 212 keys, 47 `also` forms), no `also` form was found as a decoy by either lookup. The
two can part only on a new row, which no proof has had: a phrase's `also` form that begins with an article and whose
form without it is a decoy's key. The replay's lookup finds it; the pinned one does not.

**Why the proofs' counts moved (F9).** The writers' simulation (`<SP>\proofs\B-be-aside\sim-all.js`) wrote the
tables without Check, so it kept `de huisarts`'s `also` « de huisdokter », a Flemish form in `be.js`. Check refuses a
row that keeps it, so Merge 6 removes it, and the counts of tasks 6 and 8 are now the replay's.

What the checks found that the writers' own proofs had not, all fixed in this text:
- **Totals measured on chains missing earlier tasks.** Each writer measured on its own chain's patches, so the totals
  of tasks 3, 4, 6, 8 and 10 lacked the other chains' tasks (task 3's fanout 720, not 715; content 105 too high at
  tasks 6 and 8). The fixers re-measured every total on one copy with every task in run order.
- **Rows Check passed and the suite refused.** A bare « u », « hoe lang » in two words, an `also` equal to a decoy,
  and an open task's bare Dutch judged against `F.dutch` (996 words) where `test/lang.js` uses 1566: each would have
  passed its batch and failed the suite after Merge, with no drafter left to fix it. Check now refuses each (tasks 2
  to 4), task 8 re-runs Check after Merge 6, and task 10 re-runs it on all five open batches.
- **An answer typed with no language.** An open task's model can be a sentence of the course; typed into the open
  screen's textarea, which had no `lang`, it failed `test/lang.js`. Task 4 gives the textarea `NL.gloss.attr('nl')`.
- **A launch line PowerShell 5.1 mangles.** Task 1's prompt, in double quotes, reached `claude` with `` `f `` turned
  into a form feed. The prompt is now in single quotes.
- **A pinned count with no route.** Gate 12's Ask pinned `réponse libre   124 tâches`, though task 10 may drop rows:
  a false red. It now asks for `<45 + t>`, `t` the `taken` of `## open`'s count line.
- **Gate 13 as first written.** Its steps never ran (the run controller reads only the `Gate:` line, and the
  exception to read « Then » covered gate 12 alone); once the run's PR merged, Show printed `PHASE-4 MOVED`; the
  fetch had no ruling, and without it Show read a stale ref; and the PR body would have published local paths that
  hold the account name. A header line now gives gate 13 the exception, Show accepts « phase-4 holds this tree »,
  call 11 rules on the fetch, and the body names no path.
- **Tests that asserted the live course.** Task 4's tests read the real open Split, so the run's own Merge of 79 rows
  would have turned them red on every later task, and `fanout.js` crashed on a missing rule row. They now set the
  open tables to a fixture (found by the sitting in verifying chain O).

What the replay's figures are not: of its 193 rows, 26 were written by hand (7 of 34 for `explanations-be`, 12 of 80
for `explanations`, 7 of 79 for `open`) and 167 by script, every one passing Check. Its counts (`16572 contrôles`,
124 open tasks) therefore say nothing of the run's; the run takes what prints.

What no check here can see: whether a note, a decoy or an open task is right, in Dutch and for a French speaker. That
is the readers' job, and the maintainer's reading list's (D15): gate 12's reading page shows whole the rows D15 reads
whole (in the replay, the 13 rule tasks and one note) and 10 sampled in each kind.

## Set-up decisions

- **Branches.** Phase 4 integrates on `phase-4`. This plan's own commit is on `phase-4d-plan`, cut from
  `origin/phase-4` at `dcb0d82` (plan 4c's merge, PR #143); the set-up creates the run's branch `phase-4d` from
  `phase-4d-plan`'s tip, so that `Base:` is the plan's commit. The run works in the worktree
  `.claude\worktrees\phase-4d` of the clone at `%USERPROFILE%\Desktop\Projects\Vlaams` (`run-notes.md`), pushes with
  `git push origin HEAD:phase-4d`, and opens a draft pull request from `phase-4d` into `phase-4`. Gate 13 then asks
  for the release, the pull request from `phase-4` into `main`, which can only be opened once the maintainer has
  merged `phase-4d` into `phase-4` (task 13).
- **Mode: one session** (D16, D31): 13 tasks, three of them fan-out, two gates.
- **The run's sitting is launched with task 1's launch line,** `<branch>` = `phase-4d`, so that the run's own pushes
  (`git push origin HEAD:phase-4d`) are allowed from its first task. The sitting is launched by the set-up, before
  task 1 lands: the set-up copies the line from task 1's brief, not from `run-controller.md` at `Base:`. That line
  runs `claude` from PATH (npm, `%APPDATA%\npm`): `$env:USERPROFILE\.local\bin\claude.exe` no longer exists on this
  desktop (task 1).
- **Who rules, and gate 12:** answered after the plan was written: the run controller, on the maintainer's behalf, as
  D28 (a row still disputed after its second reader; gate 12's faults fixed in the run, except one needing a decision
  no document holds). Gate 12's run controller reads that gate's « Then » in the plan: an exception to
  run-controller.md's « Never read a diff, a report, a brief or source code ». Gate 13's run controller reads that
  gate's Notes and « Then » in the plan as well, under the same exception. Before running its Show it dispatches one
  task controller (`sonnet`, description `task 13`) to write `<WS>/tmp/release-pr.md` from the template in task 13.
  The gate's row stays `in progress` from the yes until `gh pr create` has printed the release pull request's link.
- **Gate 13 is the maintainer's alone,** whoever rules the rest: opening a pull request into `main` waits for the
  maintainer's yes, and merging it is the maintainer's own act (CLAUDE.md, « Ask me first »). The run controller never
  answers it, and a « go on » given for the run is not that yes.
- **Tickets.** Four sub-issues of #12, filed on the maintainer's word after the plan is approved: `{T-kit}`, `{T-be}`,
  `{T-notes}`, `{T-open}`; the placeholders are replaced in the plan and the briefs at set-up.
- **External data.** Both explanations kinds' Split reads `.cache/kaikki/belgian.tsv` (`kaikki.belgian`, which throws
  when the file is missing). The set-up runs
  `node tools/content/fetch.js . kaikki --from <the main checkout's .superpowers/sdd/phase-4-design/kaikki-2026-11-01>`
  (plan 4a's pinned file) and `node tools/content/kaikki.js .` in the run worktree before task 2. This plan reads no
  Tatoeba file.
- **The learner pass** needs its package (`npm ci --ignore-scripts` in `tools/learner-pass/`) and Edge, which this
  desktop has.
- **The set-up writes D31–D33, and the answers given after the plan, as the ledger's first Rulings lines.**

## Global Constraints

Code:
- `const`, or `let` where it changes; never `var`; no optional chaining (`test/smoke.js`). Arrows for short helpers
  and callbacks, `function` declarations for longer named functions. Existing code is not converted.
- Comments and test messages match the file: French in `src/` and `test/`; English in `tools/content/`'s printed
  lines and in `docs/agents/`.
- Every fix leaves a test that fails on the old code. A refactor's check is the suite staying green; a task says
  which of its steps are refactors.
- A new source file goes in `build.sh`'s `SRC` and in `test/smoke.js`'s file list; a new test file in
  `test/run-all.sh`. This plan expects neither: a task that finds it needs one says so in its return.

Interface text and stored data:
- This plan adds no interface text. Storage keys and the field names inside stored records keep their spelling.
- Item ids are positions (`<unit>:w<i>`, `<unit>:p<i>`), pinned in `test/data/ids.tsv`; rule ids are `g-…`. No id
  changes.

Content and its tables:
- From task 4 on, `src/content/open.js` is written by the `open` kind's Merge, as `open.phrases.js` is: no hand edit,
  as for the six tables, `lexicon.a1c.js`, `grammar.a1c.js`, `phrases.a1c.js` and `scenarios.a1c.js`. Task 4's
  re-serialization of its nine tasks is the last change made to it by hand, and changes no value.
- Units 1–12's notes, decoys and open tasks are not touched: every Split of this plan cuts only rows owed something,
  plus the ids a task names.
- Notes and open tasks carry no `{naam}`, `{stad}` or `{bedrijf}` token and no default name. Every Dutch token is a
  form OpenTaal knows or `test/data/flemish.tsv` lists with a reason. A note's French and English each stay in their
  own language (`test/lang.js` 6d) and within `NOTE_MAX`.
- A written wrong option is never an answer the course accepts for its item (its Dutch, its Flemish form, an `also`
  form, an accepted spelling).

Behaviour:
- `NL.srs.compose()` alone decides what a session contains; no task touches it.
- Progress is reported as counts, never percentages.

Budgets and the build:
- `test/content.js`'s pinned budgets move only as a task says: `DECOY_BUDGET` 34 → 0 in task 6, `NOTE_BUDGET` 110 → 80
  in task 6 and 80 → 0 in task 8; at 0 each returns to its strict form of before plan 4c (`=== 0`, « (exigé : 0) »)
  in the commit that brings it there. `AHEAD_BUDGET` stays 136 (D26), `HOLLOW_BUDGET` stays 3.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with it.

Public repository:
- No personal data in a tracked file; the person is « the maintainer ».

## Review Focus

1. **A written wrong option the course accepts.**
   - Condition: a drafted decoy equal, once normalized, to the item's Dutch, its Flemish form, an `also` form or a
     spelling the typing accepts; or a decoy equal to the other; or an `also` equal to another item's decoy (task 2's
     `checkAlso`, run again by task 8 after Merge 6).
   - Expected: the kind's Check refuses it in its batch (`explanations-be`'s for a decoy), with the line
     `test/content.js` or `test/typed.js` would print, rather than the suite failing at Merge. An `also` against a
     decoy of the same Split is seen only by `test/content.js` after Merge 6 (task 5's Format, task 6's step 5).
   - Test: task 2 (the guards a decoy or an `also` can trip, listed against the suite, in `test/tools/fanout.js`);
     task 8's Step 1 for an `also` against task 6's decoys.
2. **A Split that cuts merged rows again.**
   - Condition: `explanations-be` on the course of `dcb0d82`, where 88 of the 122 Flemish items owe nothing (a note,
     and decoys when `vlaams`); `open` on its 36 merged phrases.
   - Expected: `explanations-be` cuts 34 rows (`vlaams` with no decoys, or no note); `open` cuts only the phrases and
     rules without a task; a named id is still cut.
   - Test: tasks 2 and 3.
3. **An open task whose model misses its own need, or a rule task that repeats a drill.**
   - Condition: a drafted `model` that does not match the row's `need` patterns; a rule task whose model is one of
     the rule's drills or its example.
   - Expected: Check refuses it, naming the need or the drill; a reader's two `right` answers are graded by the rubric.
   - Test: tasks 3 and 4.
4. **The nine hand-written rule tasks changed by their re-serialization.**
   - Condition: `open.js` rewritten as a table keyed by rule id.
   - Expected: each of the nine tasks is deep-equal to the hand-written one (`RegExp`s by source and flags), and every
     reader of `NL.content.openTasks` sees what it saw.
   - Test: task 4's step 5 proof, run once against `git show HEAD:src/content/open.js`; the committed checks pin the
     keys, the bytes and the readers.
5. **A budget moved out of order.**
   - Condition: Merge explanations before Merge explanations-be; a budget left loose at 0.
   - Expected: `NOTE_BUDGET` 110 → 80 → 0 and `DECOY_BUDGET` 34 → 0, each pinned both ways; at 0, the strict form.
   - Test: tasks 6 and 8, and the run order.

## Run order

```
1. The kit: the run's push allowed — mechanical — {T-kit} — waits none
2. The explanations Splits: explanations-be held to the rows owed something; explanations packed — mechanical — {T-be} — waits none
3. The open kind: 66 phrases of units 13–34 — mechanical — {T-open} — waits none
4. The open kind: the 13 rules, and open.js a Merge-written table — mechanical — {T-open} — waits 3
5. FAN explanations-be — fan-out — {T-be} — waits 2
6. Merge explanations-be — mechanical — {T-be} — waits 5
7. FAN explanations — fan-out — {T-notes} — waits 2
8. Merge explanations — mechanical — {T-notes} — waits 7, 6
9. FAN open — fan-out — {T-open} — waits 3, 4
10. Merge open — mechanical — {T-open} — waits 9
11. Docs: TESTING.md's two exceptions; a wording for #12 — mechanical — #12 — waits 6, 8, 10
12. GATE: the learner pass in Edge, and the reading page — gate — #12 — waits 6, 8, 10, 11
13. GATE: the release, phase-4 into main — gate — #12 — waits 12
```

The code lane runs 1, 2, 3, 4 in plan order, then holds at 6 until FAN explanations-be is `done`. FAN explanations-be
and FAN explanations start once task 2 is done, FAN open once task 4 is, beside the code lane. Merge 6 runs before
Merge 8, whichever fan-out finishes first: the NOTE budget's steps are pinned in that order. Task 8 runs explanations'
Check again after Merge 6, against task 6's decoys. No task between a fan-out's `Drafting after` and its merge edits
the rows its Split cuts: task 6 writes the notes of Flemish items only, which `explanations` never cuts, and no task
writes a `meaning`. Two merges never run at once: the code lane is one task at a time.

## How this plan keeps cost down

Plan 4c's run cost 1.18M weighted tokens per code-lane task (its `tmp/measure-2.md`), under the kit's line of 1.32M,
with the levers this plan keeps:
- **Check catches what the suite would:** a bad row fails in its batch, where its drafter fixes it, not at Merge.
- **Real data before drafting** (D19): every Split, count and Format row in the briefs was run on the course of
  `dcb0d82`, on a throwaway copy.
- **Splits held to the rows owed something** (tasks 2, 3, 4): today they would cut 122, 80 and 36 rows; `explanations-be`
  would redraft 88 merged items, and `open` its 36 merged tasks.
- **Fewer, fuller batches:** `explanations`' 80 rows packed into whole units up to 40 a batch, where today's Split
  makes one batch per unit (22, of one to five rows; plan 4b paid 1.11M a batch for one or two rows).
- **Merge tasks are scripted**: Merge, build, the named suites and the counts; no design in them.
- **The expected size**: 10 batches (2 `explanations-be`, 3 `explanations`, 5 `open`, cutting 34, 80 and 79 rows in
  the replay), 8 code-lane tasks (1, 2, 3, 4, 6, 8, 10, 11), 3 fan-outs and 2 gates. About 24M weighted, an estimate,
  not a measure: 8 code tasks at 1.18M, plan 4c's measure (9.4M; its estimate used plan 4a's 1.41M), and 10 batches
  at plan 4a's 1.46M per `explanations` batch (14.6M). The `open` kind was measured once, in phase 3: its two batches
  of 18 rows cost 4.63M (1.94M and 2.69M), about 2.3M a batch, which for these 5 would add about 4.3M, about 28M in
  all. Plan 4a's `explanations` batches held 27.5 rows (605 in 22); these hold 17 (`explanations-be`, 34 in 2), about
  27 (`explanations`, 80 in 3) and about 16 (`open`, 79 in 5). The fan-outs' control and the gates are not counted.
  In time: the full suite took 43 to 54 minutes on the replay's machine (CLAUDE.md says three to six), so the code
  lane's suites alone, at least one per task, take about 6 to 7 hours there; gate 12's Show took 556 s.
- **The measure after task 3**, as run-controller.md « Measuring » says, is compared with 1.32M per code task. Above
  it, the run controller tells the maintainer the figures (a push notification) and carries on, as in plan 4c: the
  maintainer said on 2026-10-19 that token cost is not a reason to stop.

## The run file's lines

(The two `Gate:` lines carry task 12's and task 13's Show and Ask word for word. The readers' model is the
maintainer's answer given after the plan: `sonnet` for tasks 5 and 7, as their `Fan-out:` lines say, and the kit's
default, `opus`, for task 9, whose line names none.)

```
Mode: one session
Fan-out: task 5 — kind explanations-be — after 2 — Split: node tools/content/split.js . "<WS>/drafts/explanations-be" — Check: node tools/content/check.js "<WS>/drafts/explanations-be/<batch>" — merged by task 6 — reader model: sonnet
Fan-out: task 7 — kind explanations — after 2 — Split: node tools/content/split.js . "<WS>/drafts/explanations" — Check: node tools/content/check.js "<WS>/drafts/explanations/<batch>" — merged by task 8 — reader model: sonnet
Fan-out: task 9 — kind open — after 3, 4 — Split: node tools/content/split.js . "<WS>/drafts/open" — Check: node tools/content/check.js "<WS>/drafts/open/<batch>" — merged by task 10
Gate: task 12 — after 6, 8, 10, 11 — show: export LEARNER_PASS_CHANNEL=msedge; echo "## build"; sh build.sh 2>&1; git status --short index.html artifact.html 2>&1; echo "## days"; node tools/learner-pass/days.js . 2>&1; echo "## corners"; node tools/learner-pass/corners.js . 2>&1; echo "## sweep"; node tools/learner-pass/sweep.js . 2>&1; echo "## rules"; node tools/learner-pass/rules.js . 2>&1; echo "## reading"; node tools/content/reading.js . "<WS>" 2>&1; echo "## budgets"; node test/content.js . 2>&1 | grep -E "^  (sans leurres|explications|réponse libre|séquence|sourcées|phrases|ids) |contrôles|FAIL|CRASH" — ask: « Does `## build` of <WS>/tmp/gate-12.md hold one `built …` line and nothing under it? Is there a `PROBLEM:` line in `## days`, `## corners`, `## sweep` or `## rules`, or a line starting `fail ` under `## reading`? Does `## days` end with `THE STUDY DAYS PLAY THROUGH`, `## corners` with `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`, `## sweep` with `EVERY TAP DOES SOMETHING` and `## rules` with `EVERY RULE SHEET OPENS`? Does `## corners` hold 10 `CONVERSATION <id>` blocks, each ending `finished after`, and does `## rules` open with `RULES 22 (`? Under `## reading`, are three kinds listed (`## explanations`, `## explanations-be`, `## open`), and does each kind's count line, `<n> rows: <t> taken, <d> dropped.`, match that kind's rows in the ledger's Batches table: `<n>` the sum of their `Rows`, `<t>` the sum of their `Kept`, `<d>` = `<n>` − `<t>`? Does `## budgets` hold `sans leurres    0 élément(s)`, `explications    0 / `, `réponse libre   <45 + t> tâches, <45 + t> exemples qui cochent tout`, where `<t>` is the `taken` of `## open`'s count line (124 when nothing is dropped), and `séquence        136 / `, and end with a line `<n> contrôles, CONTENU CONFORME`? » The run controller answers it, on the maintainer's behalf (D28), as task 12's « Then » says. — answer to: Rulings
Gate: task 13 — after 12 — show: git fetch origin main phase-4 2>&1; echo "## refs"; git rev-parse HEAD origin/phase-4d origin/phase-4 origin/main; if git diff --quiet HEAD origin/phase-4; then echo "phase-4d is merged: phase-4 holds this tree"; elif git merge-base --is-ancestor origin/phase-4 HEAD; then echo "phase-4 is in HEAD"; else echo "PHASE-4 MOVED: origin/phase-4 is neither in HEAD nor this tree"; fi; git merge-base --is-ancestor origin/main origin/phase-4 && echo "main is in phase-4" || echo "MAIN MOVED: origin/phase-4 does not hold origin/main"; git status --short; echo "## phase 4's merges"; git log --oneline --first-parent origin/main..dcb0d82; echo "## this plan's commits"; git log --oneline dcb0d82..HEAD; echo "## counts"; git rev-list --count origin/main..HEAD; git diff --stat origin/main...HEAD | tail -1; echo "## outside the content"; git diff --stat=100 origin/main...HEAD -- src/core src/ui src/ex build.sh styles.css; echo "## body"; cat "<WS>/tmp/release-pr.md" — ask: « For you, not the run controller: open the release PR? » Yes means: the run controller marks this run's pull request (`phase-4d` into `phase-4`) ready unless it is already merged, tells you with a push notification, waits for your word that it is merged, then opens the pull request from `phase-4` into `main` with `## body` as its description. You merge it; that deploys to production. No means nothing is opened and the run's pull request stays a draft. Read first, outside the repo: `<WS>/tmp/gate-12.md` (gate 12's reading list and sample; `<WS>/tmp/gate-12-closing.md` too if gate 12 ran again) and `<WS>/tmp/spec-12.md` (a wording for #12, to apply by hand). — answer to: Rulings
Learner pass: gate 12 plays the branch's last commit. If a gate fix changes src/ after the gate's show, run that show again into <WS>/tmp/gate-12-closing.md before gate 13, answer it as the gate's ask says, and give the maintainer both paths. Show needs tools/learner-pass/node_modules (npm ci --ignore-scripts there, in the set-up) and Edge; without them gate 12 stops, as task 12's « Then » says in its first branch.
```

## Calls made while writing, for the maintainer

1. **`explanations-be` is held to the rows owed something (task 2):** a Flemish item that is `vlaams` with no decoys,
   or has no note, plus the ids a fan-out names. Measured on `dcb0d82`: 34 rows, all in units 13–34 (4 words with a
   note and no decoys, 30 phrases with neither). Held this way rather than to « units 13–34 », the rule stays right
   if a later Flemish form lands in units 1–12.
2. **`explanations`' batches pack whole units up to 40 rows (task 2):** 80 rows in 22 batches would pay a batch's
   fixed cost 22 times.
3. **The 13 rules' tasks and the 66 phrases' are one kind, `open` (tasks 3, 4):** the Check, the readers' `right`
   answers and the rubric are the same; a second kind would add a fan-out and a merge.
4. **`open.js` becomes a table keyed by rule id (task 4, D32):** the kit's tables are its only Merge path. Its nine
   hand-written tasks are re-serialized unchanged, proved deep-equal, and every reader of `NL.content.openTasks` is
   listed and proved.
5. **Merge explanations-be runs before Merge explanations (tasks 6, 8):** the NOTE budget then steps 110 → 80 → 0,
   each step pinned both ways, and each Merge's commit says what it lowered.
6. **The release is a gate the maintainer answers, never delegated (task 13):** opening a pull request into `main` is
   the maintainer's yes, and merging it the maintainer's own act. The release can only follow the merge of this run's
   pull request into `phase-4`, so gate 13 asks once, for both: on yes, the run controller marks the run's pull
   request ready unless it is already merged, tells the maintainer (a push notification) and waits for the
   maintainer's word that it is merged; it then fetches (call 11), checks that `phase-4` holds `main` and this tree
   (`git diff --stat HEAD origin/phase-4` prints nothing) and opens the release.
7. **The 13 rule tasks are read whole (task 4):** the `open` kind's `readWhole` returns `'rule task'` for a rule row,
   as `grammar` and `scenarios` return `'course-written'`: a rule task is written for the course, not drawn from a
   source. The 66 phrase tasks are sampled (`reading.js`).
8. **`claude` from PATH (task 1):** the launch line and `test/hooks.js`'s pin move from
   `$env:USERPROFILE\.local\bin\claude.exe`, which no longer exists, to `claude` installed by npm.
9. **A fallback review's `<commit>:<branch>` push stays with the classifier (task 1):** allowing it would take a
   wildcard; if it is refused, the task controller returns `needs ruling`.
10. **`TESTING.md` goes back to its exact text of before plan 4c, with no history sentence (task 6 takes the decoy
   half out of 4c's text while `NOTE_BUDGET` still stands; task 8 gives the exact text but for the two lines of
   « Encore ouvert »; task 11 the two places below):** « two exceptions » and no `DECOY_BUDGET` or `NOTE_BUDGET`
   clause (D31). The history is in the plans and the commits; TESTING.md says how the app is tested now. Two places
   differ, both task 11's: the two lines of « Encore ouvert », whose counts moved and are true now (« 1158
   éléments », « 17 mots sur 912 ») and which name the merges of plans 4c and 4d, the first gaining the open tasks;
   and l. 278–279, which name the rows the maintainer reads whole (D15, call 7) and gain the 13 rule tasks and each
   new « on dit aussi » form.
11. **Gate 13 fetches (task 13):** its Show, and its « Then » once the run's pull request is merged, run
   `git fetch origin main phase-4`. A fetch writes only the clone's remote-tracking refs `origin/main` and
   `origin/phase-4`. It touches no branch, no file in the worktree and nothing on GitHub. Without it, `origin/phase-4`
   stays at `dcb0d82` after the maintainer's merge, `git diff --stat HEAD origin/phase-4` lists the whole plan, and
   the release is never opened. A `main` moved on GitHub would also go unseen. No other task fetches.

Left out of this plan, for the maintainer:
- **#130** (a merged word can't change once its workspace is gone): a separate code-only fix, beside this plan.
- **The 17 words of units 13–34 without an example sentence** (D14): they wait until the maintainer names them.
- **Units 13–34's `null` Flemish answers** are not stored (plan 4c, « Left out »): the `flemish` kind is not run here.
- **Applying the #12 wording:** task 11 writes it to `<WS>/tmp/spec-12.md`; the spec records decisions, so the
  maintainer applies it.
- **Tickets' labels**: all four carry `needs-triage`.

## The run

### Task 1: The kit: the run's push allowed

Class: mechanical
Ticket: {T-kit}
Promises: none
Why: In plan 4c the auto-mode classifier refused two task controllers' `git push origin HEAD:phase-4c`; auto mode
drops the maintainer's broad shell allow rules, but narrow exact rules stay in effect, for subagents too
(`notes-K.md`, « Cause » and « What the fix rests on »). So the launch's `--settings`, which a background session
keeps across restarts, carries `Bash(git push origin HEAD:<branch>)` and `PowerShell(git push origin HEAD:<branch>)`.
The launch also takes `claude` from the PATH: `~\.local\bin\claude.exe` no longer exists here (header, Call 8).
Files:
- Modify: `docs/agents/plan-runs/run-controller.md`, « Launching a sitting »: the line `:81`, the launch line (`:83`), the bullets
  under it (`:85-90`) and the window line (`:94`)
- Modify: `docs/agents/plan-runs/task-controller.md`, step 7 (`:131-134`)
- Test: `test/hooks.js`: its header comment (`:5`), the comment at `:55`, the pin at `:60-61`, and a block after the
  line `ok(/^\*\.sh text eol=lf$/m.test(…), '.gitattributes garde les scripts en LF');` (`:107`)
Interfaces:
- Consumes: the `run.md` template's line `    Push: git push origin HEAD:<branch>        (or: none)` in
  `run-controller.md` (`:144`). The test builds the expected rules from it.
- Produces: the launch command every later sitting uses, `<branch>` filled in from `run.md`'s `Branch:`.

**The proof.** The fix copy `<SP2>\fixZ` (CRLF clone, base `8d12190`), commit `cd7ccf4` « task 1 (fixed) », patch
`%USERPROFILE%\Desktop\Projects\Vlaams\.superpowers\sdd\phase-4-design\plan-4d\parts\patches\task-1.fixed.patch`:
steps 1, 3 and 4 applied from this text; steps 2 and 5 measured there. The PS 5.1 and shim measurements are in
`notes-K.md`; the single-quoted prompt's in `checks/task-1.md`.

- [ ] **Step 1: Write the failing checks.** In `test/hooks.js`, after the `.gitattributes` line, insert:

```js

// La commande Push de run.md part sans le classifieur du mode auto, qui a refusé deux poussées en plan 4c : le
// lancement d'une séance l'autorise, elle seule, dans --settings, que la session garde quand le superviseur la
// redémarre. PowerShell 5.1 passe ce JSON au programme à sa façon : on refait son passage, calé sur des cas mesurés.
function ps51Argv(args) {
  // PowerShell 5.1 n'entoure un argument de guillemets que s'il y trouve un blanc après un nombre pair de « " »,
  // échappés compris. Le programme relit la ligne selon les règles de Microsoft C : \" est littéral, " bascule.
  const line = args.map(a => {
    let n = 0;
    for (const c of a) { if (c === '"') n++; else if (/\s/.test(c) && n % 2 === 0) return '"' + a + '"'; }
    return a;
  }).join(' ');
  const out = [];
  let cur = '', inArg = false, inQ = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\\') {
      let k = 0;
      while (line[i] === '\\') { k++; i++; }
      if (line[i] === '"') { cur += '\\'.repeat(k >> 1); if (k % 2) cur += '"'; else inQ = !inQ; } else { cur += '\\'.repeat(k); i--; }
      inArg = true;
    } else if (line[i] === '"') { inQ = !inQ; inArg = true; }
    else if (/\s/.test(line[i]) && !inQ) { if (inArg) out.push(cur); cur = ''; inArg = false; }
    else { cur += line[i]; inArg = true; }
  }
  if (inArg) out.push(cur);
  return out;
}
const passed = s => JSON.stringify(ps51Argv([s]));
ok(ps51Argv([String.raw`{\"env\":{\"CLAUDE_CODE_AUTO_COMPACT_WINDOW\":\"200000\"},\"permissions\":{\"allow\":[\"Bash(git push origin HEAD:phase-test)\",\"PowerShell(git push origin HEAD:phase-test)\"]}}`]).length === 7, 'PowerShell 5.1 (mesuré) : un JSON échappé dont seules les chaînes ont des blancs arrive en sept morceaux');
ok(passed('{"permissions":{"allow":["Bash(git push origin HEAD:phase-test)"]}}') === JSON.stringify(['{permissions:{allow:[Bash(git push origin HEAD:phase-test)]}}']), 'PowerShell 5.1 (mesuré) : des guillemets non échappés se perdent');
ok(passed(String.raw`{\"env\": {\"CLAUDE_CODE_AUTO_COMPACT_WINDOW\":\"200000\"}, \"permissions\": {\"allow\":[\"Bash(git push origin HEAD:phase-test)\",\"PowerShell(git push origin HEAD:phase-test)\"]}}`) === JSON.stringify(['{"env": {"CLAUDE_CODE_AUTO_COMPACT_WINDOW":"200000"}, "permissions": {"allow":["Bash(git push origin HEAD:phase-test)","PowerShell(git push origin HEAD:phase-test)"]}}']), 'PowerShell 5.1 (mesuré) : un blanc après un nombre pair de guillemets fait passer le JSON entier');
// claude est claude.ps1 de npm (mesuré) : PowerShell garde pour lui un « -- » nu passé à un script ; « '--' » passe.
const psWords = s => (s.match(/'(?:[^']|'')*'|"[^"]*"|[^\s'"]+/g) || []).filter(w => w !== '--').map(w => w[0] === "'" ? w.slice(1, -1).replace(/''/g, "'") : w[0] === '"' ? w.slice(1, -1) : w);
const viaShim = s => JSON.stringify(ps51Argv(psWords(s).slice(1)));
ok(viaShim(String.raw`claude --model opus --settings '{\"env\": {}}' -- "-x prompt"`) === JSON.stringify(['--model', 'opus', '--settings', '{"env": {}}', '-x prompt']), 'PowerShell 5.1 (mesuré) : claude.ps1 ne passe pas un « -- » nu');
ok(viaShim(String.raw`claude --model opus --settings '{\"env\": {}}' '--' "-x prompt"`) === JSON.stringify(['--model', 'opus', '--settings', '{"env": {}}', '--', '-x prompt']), 'PowerShell 5.1 (mesuré) : claude.ps1 passe « \'--\' »');
const launchArgv = ps51Argv(psWords((rc.match(/^ {4}claude --bg .*$/m) || [''])[0]).slice(1));
ok(launchArgv.length > 2 && launchArgv[launchArgv.length - 2] === '--' && launchArgv[launchArgv.length - 1] === '<prompt>', 'le lancement passe « -- » à claude.exe, juste avant la consigne');
ok(/^ {4}claude --bg .* '--' '<prompt>'$/m.test(rc), 'la consigne du lancement est entre apostrophes : PowerShell ne touche ni à « $ » ni aux accents graves');
const atSettings = launchArgv.indexOf('--settings');
let launchSettings = null;
try { launchSettings = JSON.parse(launchArgv[atSettings + 1]); } catch (e) { launchSettings = null; }
ok(atSettings > 0 && launchArgv.lastIndexOf('--settings') === atSettings && launchSettings, 'le --settings du lancement arrive en un seul JSON, tel que PowerShell 5.1 le passe');
ok(launchSettings && Object.keys(launchSettings).join() === 'env,permissions' && JSON.stringify(launchSettings.env) === '{"CLAUDE_CODE_AUTO_COMPACT_WINDOW":"200000"}', 'le --settings du lancement porte env et permissions, rien d\'autre');
const runPush = (rc.match(/^\s*Push: (git push origin HEAD:<branch>)\s/m) || [])[1];
ok(runPush && launchSettings && JSON.stringify(launchSettings.permissions) === JSON.stringify({ allow: ['Bash(' + runPush + ')', 'PowerShell(' + runPush + ')'] }), 'le lancement autorise la commande Push de run.md, elle seule, pour Bash et PowerShell');
ok(!launchArgv.some(a => /^--(permission-mode|dangerously-skip-permissions|allow-dangerously-skip-permissions|allowedTools|allowed-tools|disallowedTools)$/.test(a)), 'le lancement ne change ni le mode ni d\'autres règles');
ok(/run `run\.md`'s push command, from the worktree, alone and word for word: no `cd` before it, no pipe or redirection after it/.test(tc) && /If it is refused anyway, return `needs ruling` with the refusal line/.test(tc) && /so the classifier judges it; if it refuses, return `needs ruling` the\s+same way/.test(tc), 'task-controller.md lance la commande Push seule et telle quelle, et va en question si elle est refusée, en relecture de repli aussi');
```

  Replace the two lines of the pin (`const launches = rc.split('$env:USERPROFILE').slice(1);` and the `ok(` after it) with:

```js
// Le claude.exe de ~\.local\bin n'existe plus sur ce poste : claude vient de npm, par le PATH.
ok(!rc.includes('.local\\bin') && /^ {4}claude --bg /m.test(rc) && rc.includes("'-Command', 'claude attach <id>'"), 'run-controller.md prend claude dans le PATH, au lancement et dans la fenêtre');
```

  In the comment above the kit loop, replace `: la commande ne trouve plus claude.exe.` with
  `: la commande copiée ne marche plus.` In the header comment, replace
  `et sa commande de lancement nomme claude.exe en entier. Le kit dit` with
  `et sa commande de lancement prend claude dans le PATH ; son` + newline +
  `   --settings arrive entier par PowerShell 5.1 et n'autorise que la commande Push de run.md. Le kit dit`.

- [ ] **Step 2: Run `node test/hooks.js .` and see it fail.** Measured after step 1 alone, among the output:
  `  FAIL: run-controller.md prend claude dans le PATH, au lancement et dans la fenêtre`,
  `  FAIL: le lancement passe « -- » à claude.exe, juste avant la consigne`,
  `  FAIL: la consigne du lancement est entre apostrophes : PowerShell ne touche ni à « $ » ni aux accents graves`,
  `  FAIL: le --settings du lancement arrive en un seul JSON, tel que PowerShell 5.1 le passe`,
  `  FAIL: le --settings du lancement porte env et permissions, rien d'autre`,
  `  FAIL: le lancement autorise la commande Push de run.md, elle seule, pour Bash et PowerShell`,
  `  FAIL: task-controller.md lance la commande Push seule et telle quelle, et va en question si elle est refusée, en relecture de repli aussi`,
  and the last line `7 CHECK(S) FAILED`.

- [ ] **Step 3: Rewrite the launch in `run-controller.md`.** Replace the line
  `the run's worktree, with this command (PowerShell):` with:

```
the run's worktree, with this command, through the PowerShell tool (never Bash: there the `\"` stay and
`--settings` is not JSON):
```

  Replace the launch line under « Launching a sitting » (four spaces of indent) with:

```
    claude --bg --remote-control "<name>" -n "<name>" --model opus --settings '{\"env\": {\"CLAUDE_CODE_AUTO_COMPACT_WINDOW\":\"200000\"}, \"permissions\": {\"allow\":[\"Bash(git push origin HEAD:<branch>)\",\"PowerShell(git push origin HEAD:<branch>)\"]}}' '--' '<prompt>'
```

  Before the `<name>` bullet, insert:

```
- `claude` is the one npm installs, in `%APPDATA%\npm`. Windows PowerShell 5.1 runs it as `claude.ps1`, which
  hands its arguments to `claude.exe` unchanged, except a bare `--`: PowerShell keeps that one for itself. The
  quoted `'--'` reaches `claude.exe`.
```

  After the `<prompt>` bullet (it ends `Run file: `<WS>/run.md`. ».`), insert:

```
  It is single-quoted: in double quotes PowerShell expands `$` and reads a backtick as an escape (the start
  prompt's `` `fallback` `` arrives as a form feed and `allback`). A `'` inside it is written `''`, and a `"`
  is written `\"` (PowerShell 5.1 drops a bare one and splits the argument at the next blank).
- `<branch>` is `run.md`'s `Branch:`. The two rules let this session and every agent it dispatches run
  `run.md`'s `Push:` command without the auto-mode classifier, which refused two task controllers' pushes in
  plan 4c. A rule without `*` matches that one command: a push to another branch or remote, or with `--force`,
  still goes to the classifier, and the git guard hook still blocks force pushes and `main`. A sitting with no
  `run.md` yet leaves `<branch>` as written, and the rules match nothing.
- The rules sit in `--settings` because a background session keeps that flag when the supervisor restarts it;
  the documentation does not list `--allowedTools` among the flags it keeps.
```

  In the next bullet, replace its last line, `  which is not JSON.`, with:

```
  which is not JSON. The space after `\"env\":` matters too: PowerShell 5.1 counts escaped quotes as quotes, and
  wraps the argument in quotes only if a space follows an even number of them. Without that space, the program
  receives the JSON cut into seven pieces at the spaces inside the rules. `test/hooks.js` passes this line
  through PowerShell 5.1's rules and parses what arrives.
```

  Replace the window line (six spaces of indent) with:

```
      Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', 'claude attach <id>'
```

- [ ] **Step 4: Rewrite step 7 of `task-controller.md`.** Replace the whole step, its four lines from `7. Unless` to
  `your state is `fallback`.`, with:

```
7. Unless this is a fallback sitting or `run.md` says `Push: none`: run `run.md`'s push command, from the worktree,
   alone and word for word: no `cd` before it, no pipe or redirection after it. The sitting's launch allows that
   exact command, so no classifier judges it (`run-controller.md`, « Launching a sitting »); in plan 4c the
   classifier refused two pushes written another way. If it is refused anyway, return `needs ruling` with the
   refusal line; never push another way. In a fallback review, push the reviewed commit in place of `HEAD`: no
   rule allows that command in advance, so the classifier judges it; if it refuses, return `needs ruling` the
   same way. If the ticket is not `none`, write a comment file and run `gh issue comment <n> --body-file
   "<file>"`: the commit, the verifier line, the review verdict. In a fallback sitting: no push; your state is
   `fallback`.
```

- [ ] **Step 5: Run `node test/hooks.js .` and see it pass.** Measured: the last line `ALL CHECKS PASSED`, with no
  `FAIL:` line.

- [ ] **Step 6: Commit.** `git add docs/agents/plan-runs/run-controller.md docs/agents/plan-runs/task-controller.md test/hooks.js`,
  then `git commit -m "docs(plan-runs): the run's push is allowed by an exact rule at launch, and claude comes from PATH ({T-kit})"`.

Done when: `node test/hooks.js .` prints `ALL CHECKS PASSED`.

### Task 2: The explanations Splits: explanations-be held to the rows owed something; explanations packed

Class: mechanical
Ticket: {T-be}
Promises: none
Why: `split('be')` cuts every Flemish item of the course, 122 rows, though only 34 owe anything: the 34 that
« Comment le dit-on ici ? » asks with no decoys written (`test/content.js` « sans leurres », `DECOY_BUDGET` 34), the 30
of them with no note among them (« explications »). `split('rest')` cuts one batch per unit, 22 batches of 1 to 5 rows;
4b measured 1.11M tokens for a batch of 1–2 rows, so they are packed into whole units up to `MAX` 40. The kind's Check
also gains what the suite would refuse of the 34 rows' decoys and notes (brief « The cost lever »).
Files:
- Modify: `tools/content/lib/explain.js`: the header comment (`:6-11`), the `require`s (`:34-35`), after
  `const LANGS = …` (`:43`) and `const vlaams = …` (`:51`), `split(part)` (`:102-116`), `tools(ctx)` and its comment
  (`:118-129`), `checkNote`'s per-language loop (after the `uses … words outside quotes` line, `:165`), `bareIn`
  (`:182`), `checkAlso` (after the `is not Dutch that OpenTaal` line, `:210`), `checkDecoys`'s `d.forEach`
  (`:240-244`), `module.exports` (`:271`)
- Modify: `test/lib/text.js`: the usage comment and `module.exports` (`:4`, `:62`)
- Modify: `test/content.js`: the `require('./lib/text')` line (`:14`) and the « kunde » block (`:504-520`)
- Test: `test/tools/fanout.js`, the explanations block (`:1368-1590`)
Interfaces:
- Consumes: what Notes and Step 4 name, from `test/lib/prose.js` (`has`), `test/lib/quoted.js`, `test/lib/dutch.js`
  and `tools/content/kinds/examples.js` (`bareOf(C, repo).bare`: a `Map` word → where the prose writes it bare).
- Produces: `X.owes(src, NL)` → boolean, exported beside `kind`, `flemish`, `chunks`; `citesKunde(s)`, `wrongKunde(s)`
  exported by `test/lib/text.js`. Batch names: explanations-be `be-words`, `be-phrases` (or `-1`, `-2` past 40 rows);
  explanations `notes`, or `notes-1`, `notes-2`, … — task 7's Split and Check lines use these.
Notes:
- `owes = (src, NL) => (NL.srs.supports(src, 'vlaams') && !src.decoys) || !noted(src)`, with
  `noted = src => !!src.note && has(src.note.fr) && has(src.note.en)`: exactly what `test/content.js` counts. It uses
  `supports()` and not the file's `vlaams()` (which also asks `RUNGS`): content.js's count uses `supports()` alone, and
  both give the same 34 on today's course.
- Split's named ids (#106) still reach both kinds: the kind returns owed rows plus `ctx.ids`, and the kit keeps the named
  ones. `split('rest')` cuts `!noted(s)`, not `!s.note`: a note in one language only is owed too.
- Check's accepted answers widen from the sources to every element the page builds (`allItems()`: patterns, tokens
  filled), as `test/content.js` compares decoys; a decoy's keys add its `fill()` form.
- New guards, each with its suite source: « kunde » in a note (`test/content.js`; the helper moves to
  `test/lib/text.js`); « hoe lang » in a note, decoy or `also` (`test/content.js`, #128); a decoy or `also` word that
  would become course Dutch that `test/lang.js` 6d.3 (`QUOTE_OK`) or 6d.4 (bare in both languages) would refuse; a bare
  one-letter word in a note (6d.4 exempts only `SHARED_OK`: a bare « u » is refused); an `also` that is another
  element's decoy (`test/content.js` refuses a decoy the course accepts). Not in the suite: a straight apostrophe in a
  decoy (the answer writes « ’ ») or a note (`notes.js` writes « ’ » only).
- Check does not see a `QUOTE_OK` or `SHARED_OK` word that a rewritten note stops using (lang.js 6d.3 « plus cité »,
  6d.4 « de trop »). Today's 4 noted owed rows hold none but `a`, `s`; Merge's suite run catches the rest.
- Check does not see an `also` equal to a decoy written by another row of the same or an earlier unmerged batch:
  Merge's `node test/content.js .` refuses it (task 5's Format says so; task 8's step 1 runs Check again after Merge 6).
- The fixture gains three owed sources: « Ik ben Nederlands aan het leren. » loses its note, jij loses its decoys,
  « de brievenbus » keeps a French note only. The end-to-end Split, which kept two sources that owed nothing before,
  now names them.

**The proof.** Fix copy `<SP2>\fixZ` (CRLF clone, base `8d12190`, task 1 at `cd7ccf4`), commit `6850445` « task 2
(fixed) »; patch
`%USERPROFILE%\Desktop\Projects\Vlaams\.superpowers\sdd\phase-4-design\plan-4d\parts\patches\task-2.fixed.patch`.
Step 2's lines from `node test/tools/fanout.js .` with step 1 applied at `cd7ccf4` (`explain.js` before this task);
steps 5–6 measured on the copy's course and the real `.cache` (junction).

- [ ] **Step 1: Write the failing tests** in `test/tools/fanout.js`'s explanations block.
  - After `notesFixed[HUIS] = null;` add `notesFixed[LEREN] = null;` and
    `notesFixed[C.byId('thuis:w11').nl] = { fr: 'Une note d’essai.' };`. After the `table.update(… 'notes.js' …)` line,
    add `const JIJ = C.byId('ikengij:w1').nl, decoysFixed = {}; decoysFixed[JIJ] = null;` and
    `table.update(path.join(EX, 'src', 'content', 'decoys.js'), decoysFixed);`. The comment above ends, in place of
    `sauf « het gemeentehuis », dont la note est ôtée.`: `sauf « het gemeentehuis » et « Ik ben Nederlands aan
    het leren. », dont la note est ôtée, et « de brievenbus », qui ne garde que sa note française ; jij perd ses
    leurres.`
  - Replace the three be-Split checks (from `const perKind` to `'les mots et les phrases de explanations-be, chacun une fois');`)
    and the rest-Split checks (`const want` to `'un seul lot, d\'une ligne …');`, and the expected lines of the RD2
    Split; keep `const RD2 = …`) with:

```js
const ids = (dir, b) => (fs.existsSync(path.join(dir, b, 'input.json')) ? JSON.parse(text(path.join(dir, b, 'input.json'))).map(r => r.id) : null);
same(beSplit, { code: 0, lines: ['be-words 1', 'be-phrases 1'] }, 'Split de explanations-be ne coupe que les sources qui doivent leurs leurres ou leur note');
same([ids(BED, 'be-words'), ids(BED, 'be-phrases')], [['ikengij:w1'], ['overleven:p0']], 'jij, ses leurres ; « Ik ben Nederlands aan het leren. », sa note');
const BEN = path.join(EX, 'nommes', 'explanations-be');
same(runEx('split.js', [EX, BEN, 'overleven:w0', 'overleven:w7', 'ikengij:w1', 'overleven:p0']), { code: 0, lines: ['be-words 3', 'be-phrases 1'] },
  'nommée, une source de explanations-be qui ne doit rien est coupée aussi (#106)');
/* Le genre explanations ne coupe que les sources sans note dans les deux langues (deux ici), et celles que Split nomme. */
// …unnoted and its check unchanged…
same(runEx('split.js', [EX, RD]), { code: 0, lines: ['notes 2'] }, 'Split de explanations coupe des lots notes d\'unités entières, des seules sources sans note');
same(ids(RD, 'notes'), ['thuis:w11', 'thuis:w12'], 'une note dans une seule langue est due : Split la coupe aussi');
same(runEx('split.js', [EX, RD2, 'overleven:w2', 'thuis:w12']), { code: 0, lines: ['notes 2'] }, 'nommée, une source qui a sa note est coupée aussi (#106)');
```

  The block's comment replaces the old one above `const unnoted`; the two `unnoted` lines stay between the two
  replaced ranges.
  - `HALLO_IN`, `JA_IN` and `rule()` read `rowIn(BEN, …)` in place of `rowIn(BED, …)` (hallo and ja are only cut when named).
  - After `'un mot nu dans une seule langue passe : 6d.4 ne le voit pas');`:

```js
const kunde = r => r.filter(x => /^note\.(fr|en) quotes « kunde »/.test(x));
same([kunde(why('À l’oral, « kunde » remplace « kunt u ».', 'Spoken, “kunde” replaces “kunt u”.')),
  kunde(why('« Kunde » est « kunt ge » contracté, pas « kunt u ».', '“Kunde” is “kunt ge” run together, not “kunt u”.'))],
[['fr', 'en'].map(l => 'note.' + l + ' quotes « kunde » beside a « u » and not « kunt ge »: « kunde » is « kunt ge » run together, not « kunt u »'), []],
'une note qui cite « kunde » et « kunt u » cite aussi « kunt ge », comme test/content.js le veut');
/* La note : « hoe lang » (#128), l'apostrophe droite, un mot d'une lettre nu (6d.4, hors SHARED_OK). */
const hoe = r => r.filter(x => /hoe lang/.test(x)), HOE = ' writes « hoe lang »: the course writes the duration « hoelang » (#128)';
same(hoe(why('« Hoe laat » demande l’heure, « hoe lang » la durée.', '“Hoe laat” asks the time, “hoe lang” the duration.')),
  ['note.fr' + HOE, 'note.en' + HOE], 'une note n\'écrit pas « hoe lang »');
same(why('Le « hè » final cherche l\'accord, comme « toch ».', GOOD[1]), ['note.fr writes a straight apostrophe « \' »: write « ’ », as notes.js does'],
  'une note écrit l\'apostrophe typographique');
same(why('En Flandre, « ge » remplace u.', 'In Flanders, “ge” replaces u.').filter(x => /Dutch of the course/.test(x)),
  ['« u » is Dutch of the course, outside quotes in fr and in en: quote it, or say it another way'], 'un mot d\'une lettre nu se cite aussi');
```

  - After `'une réponse de trois lettres a ses fautes : …');`:

```js
const HEET = NLE.content.fill(CE.byId('ikengij:p0').nl), six = r => r.filter(x => /test\/lang\.js 6d/.test(x));
same(rule('overleven:p0', { decoys: [HEET, DECOYS['overleven:p0'][1]] }).filter(x => /accepts/.test(x)),
  ['decoy « ' + HEET + ' » is an answer the course accepts, for ikengij:p0'], 'un leurre n\'est pas la réponse d\'un élément aux jetons remplis');
same(rule('overleven:w0', { decoys: ['he\'y', 'hai'] }).filter(x => /apostrophe/.test(x)),
  ['decoy « he\'y » writes the typographic apostrophe « ’ », as the answer does: « ’t », « da’s »'], 'un leurre écrit l\'apostrophe typographique');
same([six(rule('overleven:w0', { decoys: ['slank', 'hai'] })), six(rule('thuis:w12', { also: ['conversation'] }))], [
  ['decoy « slank »: « slank » would become Dutch of the course, and test/lang.js 6d.3 then refuses its QUOTE_OK exception (test/lib/quoted.js)'],
  ['also « conversation »: « conversation » would become Dutch of the course, and units[0].blurb writes it bare in French and in English (test/lang.js 6d.4)']
], 'un leurre ou un « on dit aussi » ne fait pas du néerlandais du cours un mot que test/lang.js refuserait alors');
/* « hoe lang » ; un « on dit aussi » qui est le leurre d'un autre élément ; un leurre à jeton, lu rempli (g-present). */
const DUUR = 'Hoe lang ben ik aan het leren, hè.', HEI = NLE.content.byDutch.decoys[HALLO][0];
same([hoe(rule('overleven:p0', { decoys: [DUUR, DECOYS['overleven:p0'][1]] })), hoe(rule('overleven:p0', { also: [DUUR] }))],
  [['decoy « ' + DUUR + ' »' + HOE], ['also « ' + DUUR + ' »' + HOE]], 'ni un leurre ni un « on dit aussi » n\'écrit « hoe lang »');
same(rule('overleven:w7', { also: [HEI] }).filter(x => /decoy of/.test(x)),
  ['also « ' + HEI + ' » is a decoy of overleven:w0 in decoys.js: the suite refuses a decoy the course accepts'], 'un « on dit aussi » n\'est le leurre d\'aucun élément');
same(rule('overleven:p0', { decoys: ['Ik werk bij {bedrijf}.', DECOYS['overleven:p0'][1]] }).filter(x => /accepts/.test(x)),
  ['decoy « Ik werk bij {bedrijf}. » is an answer the course accepts, for ikengij:p4, g-present'], 'un leurre écrit avec un jeton se lit rempli, comme la page le montre');
```

  - The end-to-end Split becomes `runEx('split.js', [EX, E2E, 'overleven:w0', 'overleven:p0'])`, same lines
    `['be-words 1', 'be-phrases 1']`, message `'Split de explanations-be, nommées, coupe les deux sources gardées'`.
  - Before the block's `console.log`, with `hallo = CE.byId('overleven:w0')`, `ja = CE.byId('overleven:w7')`:
    `same([X.owes(hallo, NLE), X.owes({…hallo, decoys: undefined}, NLE), X.owes({…hallo, note: { fr: hallo.note.fr }}, NLE), X.owes({…ja, decoys: undefined}, NLE)], [false, true, true, false], 'une source doit ses leurres quand l\'exercice la pose sans eux, et sa note quand elle ne se lit pas dans les deux langues')`
    (`Object.assign({}, …)`, no spread in this file's style). The `console.log` becomes
    `'  explanations   ' + beSplit.lines.length + ' + 1 lots, ' + (be.filter(s => X.owes(s, NLE)).length) + ' + ' + ids(RD, 'notes').length + ' lignes dues sur ' + be.length + ' + ' + rest.length + ' ; la note et ses citations, les « on dit aussi », les leurres ; Merge'`.

- [ ] **Step 2: Run `node test/tools/fanout.js .` and see it fail.** Measured, exit 1, 16 `FAIL:` lines, among them
  `FAIL: Split de explanations-be ne coupe que les sources qui doivent leurs leurres ou leur note : {"code":0,"lines":["be-words 40","be-phrases-1 40","be-phrases-2 8"]}, attendu {"code":0,"lines":["be-words 1","be-phrases 1"]}`;
  `FAIL: Split de explanations coupe des lots notes d'unités entières, des seules sources sans note : {"code":0,"lines":["thuis 1"]}, attendu {"code":0,"lines":["notes 2"]}`;
  the guard tests fail with `[]` / `[[],[]]`, the token decoy without `, g-present`; then
  `CRASH TypeError: X.owes is not a function`.

- [ ] **Step 3: Move the « kunde » guard to `test/lib/text.js`.** `citesKunde(s)`: a « » or “ ” quote of `s` says
  `kunde` as a word; `wrongKunde(s)`: `citesKunde(s)`, a quote with `hasU`, and no quote saying `kunt ge` (the bodies of
  `test/content.js`'s local `cited`, `says`, `wrongKunde`, moved). `test/content.js` imports both, drops its locals, and
  its loop's test becomes `!citesKunde(s)`. Document both in the usage comment.

- [ ] **Step 4: `tools/content/lib/explain.js`.** `noted`, `owes` after `vlaams`, as Notes; in `split`,
  `named = new Set(ctx.ids || [])` and `rows(test)` = `mine` filtered by `test(s) || named.has(s.id)`, mapped by
  `rowOf`; be returns `chunks('be-' + k + 's', cut.filter(r => r.kind === k))` for word, phrase; rest returns
  `chunks('notes', rows(s => !noted(s)))`. After `LANGS`, `HOE_LANG = /\bhoe\s+lang\b/i`.
  - In `tools`: `owners` maps each form `NL.ex.accepted(s)` gives, for `s` in
    `C.sources.concat(NL.content.allItems())`, to its ids, each id once per form; `bare: bareOf(C, ctx.repo)`; and
    `decoyed`, for each source of `C.sources` with `Array.isArray(s.decoys)` (the written decoys, as test/content.js
    reads them), maps each decoy `d` and `fill(d)`, keyed `norm(x)` and `norm(bare(x))`, to its source ids.
  - `newDutch(what, f, T)`, `what` the reason's whole prefix (`'also « ' + f + ' »'`, `'decoy « ' + x + ' »'`): the
    « hoe lang » reason, then one reason per distinct `courseWords(f)` word not in `T.dutch`: the 6d.3 one if
    `QUOTE_OK[w]`, else the 6d.4 one if `T.bare.bare.has(w)`, else none.
  - `checkNote` pushes on `wrongKunde(s)`, `HOE_LANG`, `/'/`; `bareIn` filters `!SHARED_OK[w]`.
  - `checkAlso`: `newDutch(…)`, and the decoy reason, naming the first id other than the row's, when `T.decoyed` maps
    its key or its `fill()` key to such an id.
  - `checkDecoys`: `newDutch(…)`, keys `[x, fill(x)]` normed and bared, the apostrophe on `/'/`.
  - All reasons as Step 1 words them. Header comment: `X.owes` and the batch names.

- [ ] **Step 5: Run the suites, one at a time.** `node test/tools/fanout.js .`: exit 0, no `FAIL:`, the lines
  `  explanations   2 + 1 lots, 2 + 2 lignes dues sur 88 + 333 ; la note et ses citations, les « on dit aussi », les leurres ; Merge`
  and `723 contrôles, KIT CONFORME`. `node test/content.js .`: exit 0, unchanged
  `  sans leurres    34 élément(s) de « Comment le dit-on ici ? » (budget 34)`,
  `  explications    110 / 1158 élément(s) sans explication dans les deux langues (budget 110)`,
  `16047 contrôles, CONTENU CONFORME`.

- [ ] **Step 6: The real Splits** (D19), into a fresh `<scratch>`:
  `node tools/content/split.js . "<scratch>/explanations-be"` prints `be-words 4`, `be-phrases 30` (exit 0): words
  `vragen:w11 vragen:w18 stad:w2 spoed:w7`, all 34 in units 13–34. `node tools/content/split.js . "<scratch>/explanations"`
  prints `notes-1 37`, `notes-2 39`, `notes-3 4` (80 rows, 22 units, whole units each).

- [ ] **Step 7: Commit.** `git add tools/content/lib/explain.js test/lib/text.js test/content.js test/tools/fanout.js`,
  then `git commit -m "fix(content): explanations-be Split held to the rows owed something, explanations packed in whole-unit batches; Check refuses what the suite would of a decoy, an also or a note ({T-be})"`.

Done when: Step 5's two runs print their lines, Step 6's Splits print theirs, and `git show --stat HEAD` names exactly
those four files.

### Task 3: The open kind: 66 phrases of units 13–34

Class: mechanical
Ticket: {T-open}
Promises: none
Why: D33 gives units 13–34 three open tasks a unit, 66 phrases, and the `open` kind's `PHRASES` takes them after the
first 36. Today's Split cuts every phrase of `PHRASES`, so FAN open would redraft the 36 tasks already merged
(Review Focus 2). Split is held to the phrases without a task, plus the ids a fan-out names, as `flemish` and
`explanations-be` are; its two fixed batches become batches of six whole units, so the 66 fall in four. Check gains
what `test/content.js` and `test/lang.js` 6d would raise only after Merge.
Files:
- Modify: `tools/content/kinds/open.js`: the requires (`:14-20`), `PHRASES` (last line `:37`), `batchOf` (`:40`),
  `facts` (`:51`), `quoteRule` (`:84`), `check` (`:105`; `/* Les guillemets. */` `:160`), `split` (`:199-215`)
- Test: `test/tools/fanout.js`, the block `/* ==================== le genre open */`: `beforeWords(OP);` (`:1181`), the
  Split check under `/* Split : 36 phrases, … */` (`:1187-1188`), the check `'chaque phrase de PHRASES une fois, …'`
  (`:1192`), `const why = (patch, id) => {` (`:1216`), the `same` list's « pistolets » entry, its last
  (`:1254-1255`), the last `has` check (`:1262`)
Interfaces:
- Consumes: `s.open` on a source (`course.js`, from `NL.content.TABLES`' field `open`, table `open.phrases`, which
  `test/content.js`' « réponse libre » counts); `ctx.ids` from `kit.split`; `bareOf(C, repo)` of
  `tools/content/kinds/examples.js` (`{ dutch: dutchWords(NL), bare: Map word → where }`); `QUOTE_OK`, `SHARED_OK`
  (`test/lib/quoted.js`); `courseWords` (`test/lib/dutch.js`); `ctx.kindDir`, from `kit.check` and `kit.merge`.
- Produces: `PHRASES` of 102 ids (the 36, then D33's 66 in course order); batches `units-<lo+1>-<min(lo+6, units)>`;
  task 4 adds its `rules` batch after these.
Notes:
- `PHRASES` gains, after `'weekend:p7'` (add a comma to that line), D33's block word for word:

```
  'vragen:p2', 'vragen:p3', 'vragen:p4',
  'kunnen:p0', 'kunnen:p1', 'kunnen:p4',
  'doen:p0', 'doen:p3', 'doen:p4',
  'mensen:p0', 'mensen:p1', 'mensen:p2',
  'hoeveel:p0', 'hoeveel:p3', 'hoeveel:p4',
  'waar:p0', 'waar:p3', 'waar:p4',
  'landen:p0', 'landen:p1', 'landen:p4',
  'eten:p0', 'eten:p1', 'eten:p2',
  'cafe:p1', 'cafe:p3', 'cafe:p4',
  'kleren:p0', 'kleren:p1', 'kleren:p2',
  'wonen:p0', 'wonen:p2', 'wonen:p3',
  'kalender:p0', 'kalender:p1', 'kalender:p2',
  'stad:p0', 'stad:p2', 'stad:p3',
  'vrijetijd:p0', 'vrijetijd:p1', 'vrijetijd:p3',
  'gevoel:p0', 'gevoel:p1', 'gevoel:p3',
  'beschrijven:p0', 'beschrijven:p1', 'beschrijven:p4',
  'school:p0', 'school:p1', 'school:p3',
  'afspraak:p1', 'afspraak:p2', 'afspraak:p4',
  'team:p0', 'team:p3', 'team:p4',
  'reis:p1', 'reis:p3', 'reis:p4',
  'natuur:p0', 'natuur:p1', 'natuur:p3',
  'spoed:p2', 'spoed:p3', 'spoed:p4'
```

- The token check (`holds a token`) and the lost-id check (`is no phrase of the course`) stay over all of `PHRASES`,
  task or not: a merged phrase whose Dutch changes is still caught.
- The test drops `beforeWords(OP)`, which empties the `*.a1c.js` tables and makes the 66 « no phrase of the
  course ». It resets the copy's `open.phrases.js` to the 36 tasks of units 1–12 instead, so its counts stay put as
  Merge takes the 66 (task 10).
- **Guards a phrase row can trip**, all in `check`: the rubric on the model and each miss, `pair`, 2–4 needs, quotes
  (`quoteRule`), tokens, names, spelling, `sequence.ahead`. New: « hoe lang » in any field (`test/content.js`); a word
  bare in fr and en that is Dutch anywhere in the course or in another row's model (6d.4); a model word new to the
  course that is in `QUOTE_OK` (6d.3) or written bare by the course (6d.4). A later row's model that makes an
  earlier row's bare word Dutch is caught when Check runs again on every batch before Merge (task 10). A task that
  repeats another's ask is the reader's (task 9).

**The proof.** On the fix copy `<SP2>\fixZ` after `task 2 (fixed)` (fanout `723 contrôles, KIT CONFORME`), steps 1–4
were applied from this text and committed as `3242e6b` `task 3 (fixed)`, exported as
`parts/patches/task-3.fixed.patch`; the red, the green and the real Split are measured there. The seventeen checks
added: the 102, the held Split, its ids, the named Split, the thirteen Check reasons. Each of eight mutations of
step 3's `open.js` turns exactly one of them red: the retry dropped or read first, `SHARED_OK` ignored, « hoe lang »
unread in `ask`, `model`, the `en` of `what`, `miss` or `rx`. The reset was proved red on `<SP>\proofs\O-main`
(66 rows filled, no reset: a crash).

- [ ] **Step 1: Write the failing checks.** In the open block of `test/tools/fanout.js`, delete `beforeWords(OP);`,
  and end the block's opening comment with « Le cours est entier : les 66 phrases des unités 13 à 34 sont dans
  PHRASES. ». Replace `const K = kit.loadKind(OP, 'open'), CO = course(OP), U = CO.NL.util;` with `K`, then
  `C0 = course(OP)` and `table.update(path.join(OP, 'src', 'content', 'open.phrases.js'), drop)`, where `drop` maps the
  Dutch (`C0.byId(id).nl`) of each of `K.PHRASES.slice(36)` to `null`, then `CO = course(OP), U = CO.NL.util`, and
  `rowsOf(dir, b)`: the batch's `input.json`, or `[]` when Split did not write it (a FAIL line, not a crash). A French
  comment says why: the counts must not move with the rows Merge has taken into the real course.

  Replace the comment `/* Split : 36 phrases, …` and the `same(runOp('split.js', [OP, KD]), …)` line under it with:

```js
    /* Split tient les phrases sans tâche : les 66 des unités 13 à 34, six unités par lot. */
    same(K.PHRASES.length, 102, 'PHRASES tient 102 phrases, trois par unité');
    const HELD = path.join(OP, 'held', 'open');
    same(runOp('split.js', [OP, HELD]), { code: 0, lines: ['units-13-18 18', 'units-19-24 18', 'units-25-30 18', 'units-31-34 12'] },
      'Split ne coupe que les phrases sans tâche, en lots de six unités entières');
    same([].concat(...['units-13-18', 'units-19-24', 'units-25-30', 'units-31-34'].map(b => rowsOf(HELD, b))).map(r => r.id),
      K.PHRASES.slice(36), 'les 66, dans l\'ordre du cours');
    same(runOp('split.js', [OP, path.join(OP, 'named', 'open'), 'bakker:p1', 'vragen:p2']), { code: 0, lines: ['units-1-6 1', 'units-13-18 1'] },
      'une phrase nommée se coupe, qu\'elle ait sa tâche ou non');
    /* Les 36 premières, nommées : deux lots de six unités. */
    same(runOp('split.js', [OP, KD].concat(K.PHRASES.slice(0, 36))), { code: 0, lines: ['units-1-6 18', 'units-7-12 18'] }, 'Split coupe les 36 phrases nommées en deux lots de six unités');
```

  and change `same(all.map(r => r.id), K.PHRASES, 'chaque phrase de PHRASES une fois, …')` to
  `same(all.map(r => r.id), K.PHRASES.slice(0, 36), 'chaque phrase nommée une fois, dans l\'ordre du cours');`.

  `why` takes a third argument, the context: `const why = (patch, id, c) => {` … `K.check(r, rowOf(id || 'bakker:p1'), c || ctx)`.
  After the « pistolets » entry of the `same` list, add (French messages; each want is the line Check must print):

```js
      [r => { r.ask.fr = 'Commence par « Mag ik », et parle de tennis.'; r.ask.en = 'Start with “Mag ik”, and talk about tennis.'; },
        ['ask: « tennis » is Dutch the course has, written bare in fr and in en: quote it, or reword'], 'le néerlandais du cours est tout le cours (dutchWords), pas ses seules unités'],
      [r => { r.model = 'Mag ik 4 pistolets, alstublieft?'; r.need[1].any.push('4'); }, [], 'un chiffre n\'est pas du néerlandais : le 4 du min reste nu'],
      [r => { r.need[1].any.push('hoe lang'); }, ['need 2 writes « hoe lang »: the course writes the duration « hoelang » (#128), and test/content.js refuses it'], '« hoe lang » en deux mots, nulle part dans la tâche'],
      [r => { r.model = 'Mag ik twee pistolets met jam?'; }, ['the model: « jam » would become Dutch of the course, and test/lang.js 6d.3 then refuses its QUOTE_OK exception (test/lib/quoted.js)'], 'l\'exemple n\'ajoute au cours aucun mot de QUOTE_OK'],
      [r => { r.model = 'Mag ik twee pistolets voor de club?'; }, ['the model: « club » would become Dutch of the course, and patterns[2].explain writes it bare in French and in English (test/lang.js 6d.4)'], 'ni un mot que le cours écrit nu en français et en anglais']
```

  and after them one entry for each other field Check reads for « hoe lang », each want the « hoe lang » entry's
  line on the prefix named after its patch: `r.ask.en += ' Say hoe lang.'` (`ask`),
  `r.need[1].what.en = 'says hoe lang'` and `r.need[1].miss = 'Mag ik hoe lang pistolets?'` (`need 2`),
  `r.need[0].rx += '|hoe lang'` (`need 1`); and the « tennis » patch on « ticket », want `[]`: a word of `SHARED_OK`
  stays bare, as `test/lang.js` excuses it.

  After the list, `SIB = path.join(OP, 'sib', 'open')`, its folder `lot` made by
  `fs.mkdirSync(path.join(SIB, 'lot'), { recursive: true })` (`put` writes a file but makes no folder), and
  `lot/draft.json` holding
  `[{ id: 'bakker:p1', model: 'Ik speel golf.' }, { id: 'vrijetijd:p1', model: 'Ik kan golf spelen.' }]` (the row's own
  id is skipped), and, with `GOLF` the « tennis » patch on « golf », one check
  `same([why(GOLF), why(GOLF, null, Object.assign({ kindDir: SIB }, ctx))], [[], ['ask: « golf » is in the model of vrijetijd:p1, which Merge makes Dutch of the course: written bare in fr and in en, quote it, or reword']], 'Check : un mot de l\'exemple d\'une autre ligne se cite comme le néerlandais du cours')`.
  Then `SIB2 = path.join(OP, 'sib2', 'open')`, its `lot` made the same way, its `lot/draft.json`
  `[{ id: 'vrijetijd:p1', model: 'Ik kan golf spelen.' }]` and its `lot/retry.json`
  `[{ id: 'vrijetijd:p1', model: 'Ik kan squash spelen.' }]`; with `SQUASH` the « tennis » patch on « squash »,
  `RETRY = Object.assign({ kindDir: SIB2 }, ctx)` and the check
  `same([why(GOLF, null, RETRY), why(SQUASH, null, RETRY)], [[], [<the golf line on « squash »>]], …)`: the retry
  replaces the draft, as Merge takes it. After the last `has`, one more, a `has` because that model also uses
  « lang » ahead of unit 12, its line the `model` one in full:
  `has(r => { r.model = 'Mag ik hoe lang drie pistolets?'; }, 'model writes « hoe lang »: …', …)`.

- [ ] **Step 2: Run `node test/tools/fanout.js .` and see it fail.** Measured, among the output:

```
  FAIL: PHRASES tient 102 phrases, trois par unité : 36, attendu 102
  FAIL: Split ne coupe que les phrases sans tâche, en lots de six unités entières : {"code":0,"lines":["units-1-6 18","units-7-12 18"]}, attendu {"code":0,"lines":["units-13-18 18","units-19-24 18","units-25-30 18","units-31-34 12"]}
  FAIL: une phrase nommée se coupe, qu'elle ait sa tâche ou non : {"code":1,"lines":["fail open vragen:p2: not a row the kind's split cuts"]}, attendu {"code":0,"lines":["units-1-6 1","units-13-18 1"]}
740 contrôles, 16 ÉCHEC(S)
```

  and one `FAIL: Check : <message> : …` for each of the thirteen new checks: tennis, the five « hoe lang » entries,
  jam and club each `[], attendu [<its line>]`; golf and the retry `[[],[]], attendu [[],[<its line>]]`; the digit
  and « ticket » each `[<its line>], attendu []`, the old filter refusing them:
  `"need 3 what: « 4 » is Dutch the course has, written bare in fr and in en: quote it, or reword"`,
  `"ask: « ticket » is Dutch the course has, written bare in fr and in en: quote it, or reword"`; and the model's
  « hoe lang », `has` printing the reasons it found:
  `["the model uses « lang », which unit 12 (weekend) teaches, after this phrase's unit 4"]`.
  No crash: the batches Split did not write read as `[]`.

- [ ] **Step 3: Extend `PHRASES`, hold Split, add the guards.** In `tools/content/kinds/open.js`:
  - `PHRASES` gains the block in Notes.
  - `batchOf` becomes `const batchOf = (ui, n) => { const lo = 6 * Math.floor(ui / 6); return 'units-' + (lo + 1) + '-' + Math.min(lo + 6, n); };`,
    its comment: six whole units a batch, the last one stopping at the course's last unit (`units-31-34`).
  - `split(C, ctx)`: `named = new Set((ctx && ctx.ids) || [])`; `mine`, the sources whose id is in `PHRASES`, all
    token-checked; `mine.filter(s => !s.open || named.has(s.id))` cut into `batchOf(ui, C.RAW.units.length)`, fields
    unchanged; the lost-id check on `mine`'s ids; the batches met, in course order. Its comment says so.
  - Require `courseWords` beside `tokenFreeWords`, `{ QUOTE_OK, SHARED_OK }`, `{ bareOf }` from `./examples`, `fs`,
    `path`. `facts` drops its `dutch` set for `B: bareOf(C, repo)` (`B.dutch`: 1566 words on the real course).
  - `otherModels(kindDir, self)`: a Map id → model from the `draft.json`, then `retry.json`, of each folder of
    `kindDir`, the row itself skipped, each file read in try/catch as `grammar.js` `otherRows` reads, so a row's
    retry replaces its draft; empty without `kindDir`, or when the folder does not exist.
  - In `check`, before the quotes: « hoe lang » (`/\bhoe\s+lang\b/i`) over `ask` (fr, en), `model`, and each need
    (`what`, `miss`, `rx`, `any`), one line per field (prefixes `ask`, `model`, `need <n>`; a field's strings read
    together); then each word of `U.uniq(courseWords(row.model))` not in
    `B.dutch`: in `QUOTE_OK`, the 6d.3 line, else in `B.bare`, the 6d.4 line naming `B.bare.get(w)`.
  - `quoteRule`'s `dutch` becomes a Map word → owner: `B.dutch` and `courseWords(row.model)` as `''`, then each word
    of `otherModels(ctx.kindDir, row.id)` not yet in it, as its id. Its filter drops `w !== 'a'` for
    `!SHARED_OK[w]`; the message for an owner is the golf line. `courseWords` drops numbers: a digit is no Dutch.

- [ ] **Step 4: Run it green, then the real Split.** `node test/tools/fanout.js .` ends `740 contrôles, KIT CONFORME`,
  and its open line stays `  genre open     36 phrases en 2 lots, 36 tâches écrites, rx en expression régulière`.
  Then `node tools/content/split.js . "<WS>/drafts/t3/open"` (a fresh folder, not left in the commit) prints,
  measured on the copy's real course:

```
units-13-18 18
units-19-24 18
units-25-30 18
units-31-34 12
```

  The batches hold, in order, vragen kunnen doen mensen hoeveel waar | landen eten cafe kleren wonen kalender | stad
  vrijetijd gevoel beschrijven school afspraak | team reis natuur spoed: 66 rows.

- [ ] **Step 5: Commit.** `git add tools/content/kinds/open.js test/tools/fanout.js`, message
  `feat(content): the open kind takes D33's 66 phrases of units 13–34, its Split held to the phrases without a task, in batches of six whole units ({T-open})`,
  body « PHRASES takes D33's 66 phrases after the first 36. Split cuts only the phrases without a task, plus the ids
  named, in batches of six whole units. Check refuses what test/content.js and test/lang.js 6d would refuse after
  Merge. »

Done when: `node test/tools/fanout.js .` ends `KIT CONFORME`, the real Split prints the four lines of step 4, and the
commit holds the two files only.

### Task 4: The open kind: the 13 rules, and open.js a Merge-written table

Class: mechanical
Ticket: {T-open}
Promises: none
Why: The 13 rules of `grammar.a1c.js` have no open task; theirs join the phrases' in the kind `open` (the same
Check, readers and Merge). `src/content/open.js` is written by hand, and the kit's tables are its only Merge path,
so it becomes a table keyed by rule id (D32), its nine tasks unchanged, which the app still reads as
`NL.content.openTasks`. The open answer box declares Dutch.
Files (line numbers at the author's task 3 commit; a transcription's own comments and wrapping move them by up to 6
lines, so find each place by the name or text beside it):
- Modify: `tools/content/kinds/open.js`:
  - the header comment (`:1-3`), `RULES` and `sourceOf` after `PHRASES` (`:31`, before `batchOf`, `:69`)
  - `check` (`:146`, `ui` at `:148`, the phrase-itself reason at `:179`, the sequence message at `:191`)
  - `merge` (`:243-254`), `split` (`:256-277`), `readWhole` after it, and `module.exports` (`:279-286`)
- Modify: `src/content/open.js`, rewritten whole as a table file (129 lines → 21).
- Modify: `src/content/index.js`, three lines after `NL.content = NL.content || {};` (`:5`). The reader at `:95`
  (`NL.content.openTasks || {})[g.id]`) stays as it is and moves to `:98`.
- Modify: `src/ex/index.js`, the textarea of `R.open.view` (`:678`).
- Modify: `CLAUDE.md`, the tables paragraph (`- Six tables under \`src/content/\` …`). `index.html` and `artifact.html`
  are rebuilt by `sh build.sh`.
- Test: `test/tools/fanout.js`, the block `/* ==… le genre open */` (`:1174`):
  - the reset (`const CO = course(OP), …`, `:1189`), the held Split (`:1198`), the named Split (`:1202`)
  - before the comment `/* Le verdict : un keep porte deux bonnes réponses …` (`:1327`)
  - `MERGED` (`:1380`), after the check on `RIGHT[1]` (`:1395`), and the `console.log` line (`:1396`)
- Test: `test/lang.js`, `langAttrCheck` (`:550`), after its last check (`:564`, `ok(frFound.length === 0, …)`).
Interfaces:
- Consumes: `C.RAW.patterns`; `byDutch.open`; `facts(C).taught` and `index`; `kit.loadKind`'s `sourceOf` and
  `readWhole` hooks (header Call 7: `'rule task'` for a rule row); `table.js` `serialize` and `load`; `NL.gloss.attr`.
- Produces: `RULES` and a batch `rules` after the four phrase batches, which task 9 drafts and task 10 merges;
  `tables: ['open.phrases','open']`, Merge printing a third line `ok open.js S set, R removed`;
  `NL.content.openTasks === NL.content.byDutch.open`.
Notes:
- **The table file.** The kind rewrites `src/content/open.js` (it holds no logic). It starts with a head comment of
  exactly 9 lines in French, then:
  - the line `NL.content.byDutch = NL.content.byDutch || {};` (table.js' MARKER)
  - `NL.content.byDutch['open'] = {`, then the nine keys sorted: `g-bezit g-dehet g-gegij g-getallen g-halfuur
    g-perfect-intro g-present g-scheidbaar g-v2`
  - one task a line: `table.serialize`'s `literal`, a RegExp written as `String(rx)`

  The build loads open.js after the other tables and before index.js, so `NL.content` already exists.
- **The answer box.** At rung 6 the open exercise shows the answer inside its textarea (`answer.right()` types the
  model). lang.js 6 flags a run whose whole text is course Dutch and whose lang is not `nl`, so a model equal to any
  course `nl` was a FAIL that Check cannot see. The textarea gets `NL.gloss.attr('nl')`; its fr/en placeholder then
  sits under `lang="nl-BE"`, which no check reads.
- **A rule row** keys table `open` by its `nl`, the rule id, as the `words` kind does. Its stamp gains a function
  field (`null` for a phrase), so every phrase stamp changes once; no committed row holds a stamp, and the 36 merged
  tasks are keyed by Dutch.
- **Check** is the phrases' Check (with task 3's guards), plus two rule reasons:
  - `the model is the rule's example: a task asks for an answer of the learner's own`
  - `the model is one of the rule's drills, « <drill> »: a task asks for an answer of the learner's own`
- **content.js's count drops by 105** (16047 → 15942). Its « hoe lang » check is one `ok()` per source line of every
  `src/content/*.js` file: open.js loses 108 lines and index.js gains 3. Its output lines are otherwise identical.

**The proof.** On `<SP2>\fixZ`, at task 3's commit, steps 1–6 as written here, every output below measured there;
committed with step 7's nine files and exported as `parts/patches/task-4.fixed.patch`.

- [ ] **Step 1: Write the failing checks.** In the open block of `test/tools/fanout.js`:
  - The held Split expects one more line, `'rules 13'`, after `'units-31-34 12'`. Its label becomes
    `'Split ne coupe que les phrases et les règles sans tâche : six unités entières par lot de phrases, puis les règles'`.
  - Extend task 3's reset, so the copy's `open.js` keeps only the nine hand tasks. Before the reset's
    `const CO = course(OP), …` line, add the line below; its comment names both tables (« open.phrases.js ne garde
    que les tâches des 36 phrases des unités 1 à 12, open.js que les neuf règles écrites à la main »), and
    `dropR = {}` joins `drop = {}`:

```js
    if (K.RULES) { K.RULES.forEach(id => { dropR[id] = null; }); table.update(path.join(OP, 'src', 'content', 'open.js'), dropR); }
```

  - After the named-Split check, add:
    - `same(K.RULES, [the 13 ids], …)`
    - `RL = rowsOf(HELD, 'rules')`, and its ids equal `K.RULES`
    - `erRow = RL.find(r => r.id === 'g-er-is') || { vocab: [] }`: a missing row is a FAIL line, not a crash
    - `g-er-is`'s row with `vocab: null` deep-equals
      `{id, stamp: kit.stamp(K, K.sourceOf(CO,'g-er-is'), CO.NL), copies: [], unit: 'waar', title, rule, example:{nl,fr,en}, explain, drills:[{nl,fr,en}], vocab: null}`,
      read from `CO.RAW.patterns`, its keys in that order (`same` compares the JSON)
    - its `vocab` equals `waar:p0`'s, from `rowsOf(HELD, 'units-13-18')`, `|| { vocab: null }`
    - the stamp differs with one drill fewer, and with another example
    - `const NR = path.join(OP, 'named-rule', 'open')`; `runOp('split.js', [OP, NR, 'g-er-is'])` gives
      `{code:0, lines:['rules 1']}`
    - a named `g-v2` gives `{code:1, lines:['fail open g-v2: not a row the kind\'s split cuts']}`
  - Then `OPENJS = path.join(OP,'src','content','open.js')`, `NINE = table.load(OPENJS)`, and check:
    - its keys are the nine sorted
    - with `REAL = path.join(ROOT, 'src', 'content', 'open.js')`, `table.serialize(table.load(REAL)) === text(REAL)`:
      the real course's file round-trips to its bytes (the copy's has just been rewritten by the reset)
    - `CO.NL.content.openTasks === CO.NL.content.byDutch.open`
    - `g-v2`'s item `.open` is `openTasks['g-v2']`, its `need[0].rx` a RegExp
  - Before the verdict comment, add a rule task `ER` for `g-er-is`, with `stamp: erRow.stamp`:
    - ask fr `Dis ce qu'il y a dans ta rue. Commence par « Er is » ou « Er zijn ».`, en
      `Say what your street has. Start with “Er is” or “Er zijn”.`
    - need 1 `{what: starts with “er is” or “er zijn”, rx: '^\\s*er\\s+(is|zijn)\\b', miss: 'In mijn straat is een bakker.'}`
    - need 2 `{what: at least 5 words, min: 5, miss: 'Er is een bakker.'}`
    - model `Er is een bakker in mijn straat.`

    Then `whyRule(patch) = K.check(patched copy, erRow, ctx)`, with these expected results:
    - unpatched: `[]`
    - model = the rule's example: the example reason
    - model `Er zijn geen mensen meer op kantoor.` (a drill): the drill reason, naming it
    - model `Er is een ambulance in mijn straat.`:
      `the model uses « ambulance », which unit 34 (spoed) teaches, after this rule's unit 18`
    - `[K.readWhole(ER, erRow, K.sourceOf(CO, 'g-er-is')), K.readWhole(BAKKER, rowOf('bakker:p1'), pain)]` gives
      `['rule task', '']`: the third argument is the row's source, as `tools/content/lib/reading.js` passes it
  - `MERGED` gains a third line, `'ok open.js 0 set, 0 removed'`.
  - After the `RIGHT[1]` check, merge the rule in `NR`. In `NRB = path.join(NR,'rules')`, put `draft.json` `[ER]` and
    `review.json` `[{id:'g-er-is', verdict:'keep', right: RRIGHT}]`, where `RRIGHT = ['Er zijn twee winkels in mijn
    straat.', 'Er is een huis met een tuin in mijn straat.']`. Expected:
    - check.js: `['ok input.json 1 rows', 'ok draft.json 1 rows', 'ok review.json 1 keep, 0 dispute']`
    - merge.js `[OP, NR]`: `['ok open 1 taken, 0 dropped', 'ok open.phrases.js 0 set, 0 removed', 'ok open.js 1 set, 0 removed']`
    - `TEN = table.load(OPENJS).entries` holds the nine keys plus `g-er-is`, sorted, and the nine are unchanged by
      `table.literal`
    - a fresh `course(OP)` puts `g-er-is`'s task on its item (`=== openTasks['g-er-is']`, rx a RegExp)
    - the rubric gives `[2, 2]` for the model and `RRIGHT[0]`
  - The console line ends `' ; ' + RL.length + ' règles, ' + (Object.keys(TEN).length - 9) + ' tâche écrite dans open.js'`.

  In `test/lang.js`, after the last check of `langAttrCheck`, plant the answer box at its verdict:

```js
  /* La réponse que l'apprenant tape à une tâche ouverte est du néerlandais : sa zone de saisie le déclare.
     Plantée : au verdict, la réponse tapée est une phrase du cours, comme l'exemple qu'answer.right() tape. */
  const it = B.NL.content.allItems().find(x => x.open), E = B.NL.ex.get('open');
  const typed = langAttrFind(B, (b, visit) => visit('plant open', E.view(E.build(it), { input: it.nl }, 'verdict')));
  ok(typed.size === 0, '6 : néerlandais sans lang="nl" : ' + Array.from(typed.keys()).join(', ') + ' (vue sessie/6/open/verdict, plantée)');
```

- [ ] **Step 2: Run `node test/tools/fanout.js .` and see it fail.** Measured, among the output:

```
  FAIL: Split ne coupe que les phrases et les règles sans tâche : six unités entières par lot de phrases, puis les règles : {"code":0,"lines":["units-13-18 18","units-19-24 18","units-25-30 18","units-31-34 12"]}, attendu {"code":0,"lines":["units-13-18 18","units-19-24 18","units-25-30 18","units-31-34 12","rules 13"]}
  FAIL: RULES tient les 13 règles, dans l'ordre du cours : undefined, attendu [...]
  FAIL: les 13 règles, dans l'ordre du cours : [], attendu undefined
CRASH TypeError: Cannot read properties of undefined (reading 'nl')
```

  The crash is the kind's missing `sourceOf` (step 3), not a missing row. `node test/lang.js .` ends
  `25561 contrôles, 1 ÉCHEC(S)`, exit 1, its one FAIL `6 : néerlandais sans lang="nl" : fr « Mag ik het in het
  Nederlands proberen? » (fr), en « Mag ik het in het Nederlands proberen? » (en-GB) (vue sessie/6/open/verdict,
  plantée)`.

- [ ] **Step 3: The kind.** In `tools/content/kinds/open.js`:
  - The header gains a sentence on the rules: RULES, open.js under the rule id (the nine of units 1–12 have theirs),
    what a rule row carries, and Check's refusal of a model that is the rule's example or one of its drills.
  - After `PHRASES`, `RULES` (in this order) and `sourceOf(C, id)`:

```js
const RULES = ['g-niet-geen', 'g-bijzin', 'g-vraag', 'g-twee-werkwoorden', 'g-perfect-zijn', 'g-was-had', 'g-deelwoord',
  'g-hem-haar', 'g-er-is', 'g-meervoud', 'g-gebiedend', 'g-verkleinwoord', 'g-om-op-in'];
```

    `sourceOf` returns `C.byId(id)` for an id not in `RULES`, `undefined` for a rule with no pattern, and otherwise
    the rule's pattern as a source: `{id, nl: id, fr: title.fr, en: title.en, unit, title, rule, example: {nl, fr, en},
    explain, drills: [{nl, fr, en}], copies: []}`.
  - `check`: the two rule reasons of the Notes (the example one when `U.norm(row.model) ===
    U.norm(input.example.nl)`, one per drill equal to the model); the phrase-itself reason only when `!input.drills`;
    the sequence message says `after this ' + thing + '\'s unit '`, with `thing = input.drills ? 'rule' : 'phrase'`.
  - `merge(row, input)` builds the same task as before and returns `{ open: task }` for a `RULES` id, else
    `{ 'open.phrases': task }`.
  - `split`, after the lost-phrase check: a `rules` batch of the RULES ids that have no task in `byDutch.open` or
    are named, each `{id, unit, title, rule, example, explain, drills, vocab: F.taught[index of its unit]}`, appended
    only when non-empty; an id with no pattern throws `<ids> is no rule of the course`.
  - `const readWhole = (row, input) => (input && input.drills ? 'rule task' : '');` (header Calls 3, 4 and 7).
  - Exports:

```js
  stamp: ['meaning', src => (src.drills ? { rule: src.rule, example: src.example, drills: src.drills.map(d => d.nl) } : null)],
  tables: ['open.phrases', 'open'],
  split, check, checkVerdict, merge, sourceOf, readWhole,
  PHRASES, RULES
```

- [ ] **Step 4: Run it again: the next red.** Measured:
  `CRASH Error: …\open\src\content\open.js: no « NL.content.byDutch = NL.content.byDutch || {}; » line`, thrown by
  step 1's reset of open.js. open.js is not a table yet.

- [ ] **Step 5: open.js a table; index.js points at it; the answer box.**
  - Rewrite `src/content/open.js` by script: run the hand file in `vm`, then `table.serialize({ head, eol: '\n',
    name: 'open', entries: NL.content.openTasks })`. `head` is a comment of exactly 9 lines (content.js counts one
    check per source line), in French: the tasks of the grammar rules, one a rule under its id; ask, need and miss,
    model; what test/content.js checks; the app reads it as `NL.content.openTasks`, through index.js; the open
    kind's Merge rewrites the file.
  - Prove it deep-equal against `git show HEAD:src/content/open.js`: `9 tasks deep-equal, 12 RegExps by source and
    flags`. Find the RegExps with `Object.prototype.toString.call(v) === '[object RegExp]'`: those of the `vm` realm
    fail `instanceof RegExp`, and `assert.deepStrictEqual` passes them as plain objects, so a count of 0 proves
    nothing.
  - In `src/content/index.js`, after `NL.content = NL.content || {};`:

```js
/* The tasks of the grammar rules are the open kind's table src/content/open.js, keyed by
   rule id; the app reads them as NL.content.openTasks, the same object. */
NL.content.openTasks = (NL.content.byDutch || {}).open || {};
```

  - In `src/ex/index.js`, `'<textarea class="textin open-box" rows="3" spellcheck="false" ' +` becomes
    `'<textarea class="textin open-box"' + NL.gloss.attr('nl') + ' rows="3" spellcheck="false" ' +`.
  - `CLAUDE.md`, the tables paragraph (each anchor wraps across one line break in CLAUDE.md; after the edit, re-wrap
    it to its current width down to its sentence ending `design-sitting.md`).`, keeping the lines after that one as
    they are; the diff is then 15 insertions, 13 deletions):
    - `Six tables` becomes `Seven tables`
    - `` `open.phrases.js` (`open`) `` becomes `` `open.phrases.js` and `open.js` (`open`) ``
    - after « Each is keyed by an item's Dutch as its first listing writes it, tokens unfilled », add « , except
      `open.js`: the tasks of the grammar rules, keyed by rule id (`g-v2`), which the app reads as
      `NL.content.openTasks` »
    - « writes a seventh file whole » becomes « writes another file whole »

- [ ] **Step 6: Green, build, the readers, the real Split.**
  - `node test/tools/fanout.js .` ends `762 contrôles, KIT CONFORME` (task 3's run gives 740; 22 checks added), its
    open line
    `  genre open     36 phrases en 2 lots, 36 tâches écrites, rx en expression régulière ; 13 règles, 1 tâche écrite dans open.js`.
  - `sh build.sh` prints `built (local only) index.html …, artifact.html …`.
  - Then:
    - `node test/content.js .` gives `15942 contrôles, CONTENU CONFORME`
    - `node test/lang.js .` gives `25561 contrôles, LANGUE CONFORME`
    - `node test/typed.js .` gives `42968 contrôles, 0 en échec`
    - `node test/smoke.js .` ends `ALL CHECKS PASSED`
  - Then `node tools/content/split.js . "<WS>/drafts/t4/open"` (a fresh folder, not left in the commit) prints:

```
units-13-18 18
units-19-24 18
units-25-30 18
units-31-34 12
rules 13
```

  The rules batch holds the 13 in course order, each with 5 drills.

- [ ] **Step 7: Commit.** `git add tools/content/kinds/open.js src/content/open.js src/content/index.js src/ex/index.js
  index.html artifact.html test/tools/fanout.js test/lang.js CLAUDE.md`. Message: `feat(content): the open kind cuts
  the 13 grammar rules, and src/content/open.js becomes its Merge-written table ({T-open})`. Body: « The kind cuts a
  rules batch after the phrase batches: the 13 grammar rules of units 13-34, read whole at review.
  src/content/open.js becomes the kind's table, keyed by rule id, its nine tasks unchanged; the app reads it as
  NL.content.openTasks through index.js. The answer box of an open task declares Dutch. »

Done when:
- `node test/tools/fanout.js .` ends `762 contrôles, KIT CONFORME`.
- content, lang, typed and smoke are green with the counts of step 6.
- The real Split prints the five lines of step 6.
- The commit holds the nine files only.

### Task 5: FAN explanations-be

Class: fan-out
Ticket: {T-be}
Kind: explanations-be
Drafting after: 2
Split: node tools/content/split.js . "<WS>/drafts/explanations-be"
Check: node tools/content/check.js "<WS>/drafts/explanations-be/<batch>"
Merged by: task 6
Why: the 34 Flemish items of units 13–34 that « Comment le dit-on ici ? » asks have no written decoys
(`DECOY_BUDGET` 34, D29), and 30 of them, all phrases, have no note either (30 of `NOTE_BUDGET`'s 110). Without
decoys the exercise draws its wrong options at random and the right one is guessed. This fan-out writes two decoys
on each row and a note on each, so that task 6 brings `DECOY_BUDGET` back to its strict 0 and `NOTE_BUDGET` to 80.

Split, measured on the copy `fixZ` after task 2 (commit `6850445`), on the real course and `.cache`:

```
be-words 4
be-phrases 30
```

34 rows, two batches, every one `vlaams: true`, all in units 13–34. The 4 words (`vragen:w11`, `vragen:w18`,
`stad:w2`, `spoed:w7`) have a note and no decoys; the 30 phrases have neither. No row of units 1–12 is cut.

## Format

One row per input row, in `draft.json`, in the input's order:

```json
{"id": "kunnen:p1", "stamp": "3a4c18d2",
 "note": {"fr": "À l’oral, « het » devient « ’t » et « niet » devient « nie ».",
          "en": "In speech, “het” becomes “’t” and “niet” becomes “nie”."},
 "also": [], "decoys": ["Ik wil nie ’t vergeten.", "Ik wilt ’t nie vergeten."]}
```

This row, `vragen:p0` and `vragen:w11` passed Check on the copy (`ok draft.json 2 rows`, `ok draft.json 1 rows`). Every refusal named below was measured on probe batches
written outside `drafts/`.

- `id` and `stamp` are copied from the input row, unchanged.
- `note` says what the meaning does not: here, how the Flemish form (`be`, `right`) differs from the Dutch (`nl`),
  or when and to whom it is said. Each side at most 160 characters and 2 sentences, no space at either end.
- A phrase's input has `note: null`: write one. A word's input holds its note: keep it when it is true and teaches
  something, or rewrite it to name the Flemish form; never repeat the meaning (Check refuses that).
- fr in French, en in English, the same note. No French word outside quotes in en, no English word in fr.
- Quotes hold Dutch only, « » in fr and “ ” in en, and both sides quote the same Dutch. Every quote mark has its
  pair, no quote inside a quote, no empty quote. A translation goes in parentheses. Every quoted word is one OpenTaal or `test/data/flemish.tsv` knows, or one of the row's own forms
  (`nl`, `be`, `also`).
- A word of the course left bare in both sides (outside quotes) is refused: quote it. « niet devient nie » fails;
  « « niet » devient « nie » » passes. A one-letter word too: « « ge » remplace u » fails; quote « u » (a few
  words French and English share, as « contact » or « film », are excused).
- The typographic apostrophe « ’ » everywhere (`’t`, `l’oral`): Check refuses « ' » in a note and in a decoy. No
  straight quote `"`, no `<`, no newline.
- Never « hoe lang » in two words, in a note, an `also` or a decoy: Check refuses it, as `test/content.js` (#128)
  does; a duration is « hoelang ».
- The same digits and `{…}` tokens on both sides. No name: `{naam}`, `{stad}`, `{bedrijf}`, never their defaults.
- « kunde » is « kunt ge » run together, never beside « u »: Check refuses a note that quotes « kunde » with « u ».
- `also`: the item's whole « on dit aussi » list. Merge writes it in place of the input's `also`, and `[]` removes
  the entry. Keep the input's forms, add one a Fleming says that the input lacks, `[]` when there are none. One
  Dutch form per entry, not the Dutch itself, not the Flemish form of `be.js`, a noun with its article, spelled as
  OpenTaal knows it, no form twice, no word that would become Dutch of the course that `test/lang.js` 6d.3/6d.4
  then refuses (as for decoys), not the Dutch of another item of another sense, and not a decoy of another item in
  `decoys.js` (the suite refuses a decoy the course accepts). A new `also` is read whole by the readers.
  - One input cannot keep its form: `spoed:w7` (`de huisarts`) holds `de huisdokter`, which is also its Flemish
    form in `be.js`. Check refuses it, so the row writes `[]`, Merge removes that entry (task 6 step 2 counts it),
    and `de huisdokter` stays accepted through `be.js`. No other input of this task or of task 7 has an `also`.
- `decoys`: exactly two wrong answers, each a text on one line with no space at either end, to « Comment le dit-on
  ici ? »: slips a learner could make that no Fleming
  says (a wrong conjugation, a word order, a vowel or ending misheard). Check refuses, with the reason in the line:
  - the two decoys being one answer once normalized (`'t` against `’t` counts as the same);
  - a decoy the course accepts for any item, this one or another, tokens filled as the page shows them (its Dutch,
    its Flemish form, an `also`, an accepted spelling): « Wie doet dat? » and « Wie doet da » both fail for
    `vragen:p0`;
  - a straight apostrophe `'`: the options are shown side by side and it would mark the decoy;
  - a word that would become Dutch of the course, the `test/lang.js` 6d.3/6d.4 guards;
  - an end other than the answer's: `right` ends with `?`, so does each decoy;
  - a length outside the answer's, give or take 40 % or two letters, whichever is more;
  - a decoy further from `nl` than `right` is, by more than 0.15 (or one letter of the longer, at most six).
  - Check does not see an `also` that another row of the batch adds: a decoy equal to it passes here and fails
    `test/content.js` after Merge. Never use as a decoy a form you add as an `also` elsewhere.
- A Check failure names the field and the reason. Fix the row and run Check again until the batch reads `ok`.
- `siblings` (same sense, other items) must agree with the note: do not call a form wrong that a sibling teaches.
- `labelled` is the dictionary's labels for the Flemish form, when it has some; a note that contradicts them goes
  in `unsure`.
- `"unsure": "<why, on one line>"` on a row you are not sure of (a decoy a Fleming might say after all, a note
  you cannot source); the readers look there first. A verdict in `review.json` carries `id` and `verdict` only.

## Reader focus

Unsure rows first. Then, for every row:
- Is the note true of Flanders today, and does it teach beyond the meaning? A note that only restates the
  meaning, or calls a living Flemish form wrong, is `fix`.
- Are fr and en the same note, each in its own language, quoting the same Dutch?
- Are the two decoys plausible slips of a French-speaking learner, and is neither said by any Fleming? A decoy that
  is real speech somewhere in Flanders (« vergete », « da’s », « wadde ») is `fix`: the learner would be marked
  wrong for a right answer.
- Do the decoys look like the answer (length, ending, register), so that the right option is not guessed by
  elimination?
- A word's kept note: still right once the decoys sit beside it?
- A new `also`: read whole; is it said in Flanders, and is it the same sense?
- Siblings agree; `labelled` agrees.

### Task 6: Merge explanations-be

Class: mechanical
Ticket: {T-be}
Merges: explanations-be (task 5)
Promises: none
Why: task 5's rows give the 34 Flemish items of units 13–34 that « Comment le dit-on ici ? » asks their two written
decoys, and the 30 phrases among them their note. Merged, `test/content.js`'s « sans leurres » count is 0 and its
temporary budget goes away (`DECOY_BUDGET` back to the strict `=== 0` of before plan 4c, D29), and « explications »
falls from 110 to 80, the 80 that task 8 writes (`NOTE_BUDGET` 80, pinned both ways, D30; header call 5: Merge 6 runs
before Merge 8).
Files:
- Merge writes: `src/content/decoys.js` (34 entries set), `src/content/notes.js` (34 set: the 30 new phrase notes and
  the 4 words' notes, kept or rewritten), `src/content/also.js` (`de huisarts`'s entry removed, task 5's Format;
  plus a row's new `also`, none expected)
- Build writes: `index.html`, `artifact.html`
- Modify: `test/content.js`: the DECOY block's comment, `const DECOY_BUDGET = 34;` and its three lines (`ok`, `ok`,
  `console.log`), after `const undecoyed = …`; the NOTE block's comment end and `const NOTE_BUDGET = 110;`
- Modify: `TESTING.md`: the « troisième exception » sentence (`:220-224`), the clause on `DECOY_BUDGET` and
  `NOTE_BUDGET` after it (`:226-228`), and the « Encore ouvert » content line (`:317`)
Interfaces:
- Consumes: the accepted rows of `<WS>/drafts/explanations-be/{be-words,be-phrases}` (task 5's `draft.json` and
  `review.json`), Merge as `node tools/content/merge.js . "<WS>/drafts/explanations-be"`.
- Produces: `NOTE_BUDGET = 80` and the strict DECOY check, which task 8 reads: task 8 lowers `NOTE_BUDGET` 80 → 0 and
  returns the NOTE block to its strict form in the same commit. No new export.
Notes:
- Merge runs once. It writes every accepted row of both batches in one call. The stamp covers `be`, `meaning`, `note`,
  `also` (`explain.js` `STAMP`), so a second Merge refuses as `stale` every row whose note it changed (`explain.js`
  comment at `STAMP`; `kit.js` merge: `fail <batch> <id>: stale, stamped … at Split, the source now stamps …`), and
  nothing is written. A row fixed after Merge is a new Split and fan-out, not a rerun.
- What the old budgets say once the rows are in, before the edit, is the red: content.js's ≥ side refuses the gain
  (« baisser DECOY_BUDGET à 0 », « baisser NOTE_BUDGET à 80 »). The edit is the green.
- `DECOY_BUDGET` disappears rather than being set to 0: the header (« pinned budgets ») wants each budget at 0 back in
  its form of before plan 4c, `ok(undecoyed.length === 0, …)` and « (exigé : 0) », as commits `d5f716d` (which added
  the budget) and `feca4c0` show in the worktree. `NOTE_BUDGET` stays a budget at 80, pinned both ways, until task 8.
- `task-6.fixed.patch` carries `test/content.js` and `TESTING.md` only. The tables and the build come from the run's
  own Merge (34 rows); the proof's 3 hand rows are not in it (they would conflict with the run's rows and with the
  generated html). On a copy with the patch and no merged rows, `node test/content.js .` fails (34 against 0, 110
  against 80; measured `15941 contrôles, 2 ÉCHEC(S)`).
- Commit message: `feat(content): Merge explanations-be: written decoys for the 34 Flemish items of « Comment le dit-on
  ici ? » that had none, and notes for the 30 Flemish phrases that had none; DECOY_BUDGET back to its strict 0,
  NOTE_BUDGET pinned at 80 ({T-be})`, no trailer. The commit holds the three tables, both html and the two files.

**The proof.** Fix copy `<SP2>\fixZ` (CRLF clone, base `8d12190`, task 4 at `04d7d4c`), commit `685d07b` « task 6
(fixed) »; patch `%USERPROFILE%\Desktop\Projects\Vlaams\.superpowers\sdd\phase-4-design\plan-4d\parts\patches\task-6.fixed.patch`. Every line below is measured there in run order. Hand rows
(3, from the named Split `vragen:w11 vragen:p0 kunnen:p1`, written as a drafter would, through Check and an
all-`keep` `review.json`; their JSON and Check lines are in `notes-B.md`): Merge, build, one row per count, both sides
of each budget; simulation (`<SP>\proofs\B-be-aside\sim-all.js` on the full Split, then build): the final 0, 80 and
`CONTENU CONFORME`; arithmetic: the 34-row Merge lines, as no run of 34 real rows exists before task 5.

- [ ] **Step 1: Keep the before numbers.** `node test/content.js .` on the branch after task 5's rows are accepted and
  before Merge: exit 0, `  sans leurres    34 élément(s) de « Comment le dit-on ici ? » (budget 34)`,
  `  explications    110 / 1158 élément(s) sans explication dans les deux langues (budget 110)`,
  `15942 contrôles, CONTENU CONFORME` (measured after task 4).

- [ ] **Step 2: Merge.** `node tools/content/merge.js . "<WS>/drafts/explanations-be"`. Expected:
  `ok explanations-be 34 taken, 0 dropped`, `ok notes.js 34 set, 0 removed`, `ok also.js 0 set, 1 removed`
  (`de huisarts`'s `de huisdokter`, which `be.js` already gives; one more `set` per new `also` the readers kept),
  `ok decoys.js 34 set, 0 removed`. Measured in the plan's replay, with 34 written rows: those four lines. Measured
  with the 3 hand rows (no `spoed:w7` among them): `ok explanations-be 3 taken, 0 dropped`,
  `ok notes.js 3 set, 0 removed`, `ok also.js 0 set, 0 removed`, `ok decoys.js 3 set, 0 removed`. A `fail … stale`
  or `fail … unsettled` line writes nothing: stop, `needs ruling`. A `dropped` above 0 is a row the readers dropped:
  its item keeps no decoys, and step 5's strict 0 fails on it; stop, `needs ruling`.

- [ ] **Step 3: Build, then see the old budgets refuse the gain.** `sh build.sh`: exit 0, last line `built (local
  only) index.html (<n> bytes), artifact.html (<n> bytes)` (the sizes depend on the merged rows). `node
  test/content.js .`: exit 1 with `  FAIL: seulement 0 élément(s) sans leurres écrits : baisser DECOY_BUDGET à 0 pour
  verrouiller le gain` and `  FAIL: seulement 80 élément(s) sans explication : baisser NOTE_BUDGET à 80 pour
  verrouiller le gain` (arithmetic from the measured hand-row lines, which read `… seulement 31 … à 31 …`,
  `… seulement 108 … à 108 …`, `  leurres         69 élément(s) avec leurs leurres, 0 faute(s)`,
  `15947 contrôles, 2 ÉCHEC(S)`; measured in the plan's replay, with 34 written rows: those two lines and
  `16007 contrôles, 2 ÉCHEC(S)`).

- [ ] **Step 4: `test/content.js`.**
  - The DECOY block: the comment ends at « …que le genre explanations-be écrit dans src/content/decoys.js. */ » (its
    last three lines, on 4c's forms and `DECOY_BUDGET`, go); `const DECOY_BUDGET = 34;` goes; the three lines after
    `const undecoyed = …` become:
```js
  ok(undecoyed.length === 0, undecoyed.length + ' élément(s) de « Comment le dit-on ici ? » sans leurres écrits : ' + undecoyed.slice(0, 6).join(', '));
  console.log('  sans leurres    ' + undecoyed.length + ' élément(s) de « Comment le dit-on ici ? » (exigé : 0)');
```
  - The NOTE block: the comment's last two lines become these three (`/` marks a break): « NOTE_BUDGET les compte,
    épinglé dans les deux sens comme AHEAD_BUDGET. Le Merge explanations-be du plan 4d / a écrit celles des phrases
    flamandes (110 → 80) ; le Merge explanations du plan 4d, qui écrit les autres, / le ramène à 0 dans le même
    commit (D30). */ », and `const NOTE_BUDGET = 80;`. Its two `ok` lines and its `console.log` are unchanged.

- [ ] **Step 5: Run `node test/content.js .` and see it pass.** Exit 0, with
  `  sans leurres    0 élément(s) de « Comment le dit-on ici ? » (exigé : 0)`,
  `  explications    80 / 1158 élément(s) sans explication dans les deux langues (budget 80)`,
  `  leurres         100 élément(s) avec leurs leurres, 0 faute(s)`, and `CONTENU CONFORME`. Measured in the plan's
  replay: those three lines, `  tables          be 123, open.phrases 36, notes 1056, decoys 100, also 41 ; be,
  note, also hors du lexique` (42 before Merge, less `de huisarts`'s) and `16006 contrôles, CONTENU CONFORME`; a new
  `also` adds to « also 41 » and to the check count, and the real rows' total is their own. The new budgets refuse
  31 and 108 (hand rows; `15946 contrôles, 2 ÉCHEC(S)`) and 79 (the simulation, which kept `de huisarts`'s `also`,
  plus one note; `16006 contrôles, 1 ÉCHEC(S)`).
  A line `FAIL: … leurre(s) fautif(s) : <id> : « … » est une réponse que le cours accepte` is an `also` of task 5
  equal to a decoy of task 5 (Check does not see it, its Format says so): stop, `needs ruling`; Merge has written
  and cannot run again.

- [ ] **Step 6: Run `node test/lang.js .`.** Exit 0, no `FAIL`, last line `25565 contrôles, LANGUE CONFORME`
  (measured with the 3 hand rows merged and built; about 9 min). The real rows add their notes' and decoys' prose to
  its checks, so the total moves (`25621` in the plan's replay); the verdict line is the test.

- [ ] **Step 7: Run `node test/typed.js .`.** Exit 0, last line `42968 contrôles, 0 en échec` (measured the same way,
  about 1 min; `42966` in the plan's replay, whose rows removed `de huisarts`'s `also`: the total moves with the
  rows, the verdict line is the test). Among its lines, `  vlaams         « Is da alles? » et ses deux leurres
  écrits, rien d’autre`.

- [ ] **Step 8: `TESTING.md`** (header call 10: no history sentence; task 8 puts the paragraph back to its text of
  before plan 4c).
  - The « troisième exception » sentence keeps only the notes: « Une troisième exception, temporaire, vient du plan
    4c : les phrases des unités 13 à 34 y arrivent avant leurs notes, si bien que `NOTE_BUDGET`, ci-dessous, est monté
    de 0 ; le plan 4d écrit ces notes et le ramène à 0 avant la mise en ligne (#12). », and « à deux exceptions
    près » becomes « à une exception près ».
  - The clause: « — sauf, jusqu'au plan 4d, les phrases des unités 13 à 34, que `NOTE_BUDGET` compte, épinglé dans
    les deux sens —, et ».
  - The « Encore ouvert » content line ends « …et leurs formes flamandes (Merge flemish du plan 4c), avec leurs
    leurres écrits (Merge explanations-be du plan 4d). »
  - No suite reads `TESTING.md` or a `_BUDGET` name outside `test/content.js` (grep of `test/`, measured). TESTING.md
    then names `NOTE_BUDGET` on three lines (the sentence, the clause, « Encore ouvert ») and `DECOY_BUDGET` on none:
    task 8's step 9 removes all three and puts the paragraph back to its text of before plan 4c; task 11 changes
    « Encore ouvert » and l. 278–279 (the rows read whole).

- [ ] **Step 9: Commit.** `git add src/content/decoys.js src/content/notes.js src/content/also.js index.html
  artifact.html test/content.js TESTING.md`, then the commit message of Notes. `git show --stat HEAD`: the seven files
  (`also.js` among them: Merge removed `de huisarts`'s entry). Measured on the fix copy for the two hand-edited files
  (`685d07b`):
  `TESTING.md | 13 ++++++-------`, `test/content.js | 18 +++++++-----------`, `2 files changed, 13 insertions(+),
  18 deletions(-)` (as the patch wraps it; another wrapping changes this count, not the check).

Done when: Merge printed `ok explanations-be 34 taken, 0 dropped` and `ok decoys.js 34 set, 0 removed` (step 2);
`sh build.sh` exits 0; `node test/content.js .` exits 0 with `sans leurres    0 élément(s) de « Comment le dit-on
ici ? » (exigé : 0)`, `explications    80 / 1158 élément(s) sans explication dans les deux langues (budget 80)` and
`CONTENU CONFORME`; `node test/lang.js .` and `node test/typed.js .` exit 0 with no `FAIL`; `grep -c DECOY_BUDGET
test/content.js TESTING.md` prints `0` for each; the commit holds the seven files of step 9, with no trailer.
`node test/tools/fanout.js .` is not touched by this task (`762 contrôles, KIT CONFORME` at `685d07b`, as after
task 4).

### Task 7: FAN explanations

Class: fan-out
Ticket: {T-notes}
Kind: explanations
Drafting after: 2
Split: node tools/content/split.js . "<WS>/drafts/explanations"
Check: node tools/content/check.js "<WS>/drafts/explanations/<batch>"
Merged by: task 8
Why: the 80 phrases of units 13–34 taken from Tatoeba by plan 4c that are not Flemish items have no note (80 of
`NOTE_BUDGET`'s 110; task 6 writes the other 30, D30). Without a note, the learner is not told what the Dutch does
that French or English does not. This fan-out writes a note in French and
in English on each row, and the « on dit aussi » forms where there are some, so that task 8 brings `NOTE_BUDGET`
back to its strict 0.

Split, measured on the copy `fixZ` after task 2 (commit `6850445`), on the real course and `.cache`:

```
notes-1 37
notes-2 39
notes-3 4
```

80 rows, 22 units, whole units in each batch: `notes-1` 11 units (`vragen` … `wonen`), `notes-2` 10 (`kalender` …
`natuur`), `notes-3` 1 (`spoed`). Every row is a phrase with `vlaams: false`, `be: null`, `note: null`, `also: []`,
`labelled: null`, and no `{…}` token in its Dutch. One row has a sibling: `hoeveel:p2` « Nog een keer? », sibling
« nog eens » (Flemish « nog is »). Two are formal: `kleren:p0` and `reis:p4` say « uw », and their English meaning
ends `(formal)`. Task 6 writes Flemish items only, which this Split never cuts: the merges write disjoint rows.

## Format

One row per input row, in `draft.json`, in the input's order. Copy `id` and `stamp` unchanged, then give `note`
and `also`; no other field but `unsure`.

```json
{"id": "spoed:p1", "stamp": "682b8519",
 "note": {"fr": "« Gebroken » est le participe passé de « breken » : le verbe change de voyelle.",
          "en": "“Gebroken” is the past participle of “breken”: the verb changes its vowel."},
 "also": ["Wie heeft dat gebroken?"]}
```

This row, with notes for the other three `spoed` rows, passed Check on the copy (`ok draft.json 4 rows`; with an
all-keep review, `ok review.json 4 keep, 0 dispute`).

- `note` says what `meaning` does not: the word order (verb last, inversion), a separable verb, a past participle,
  an article or a plural a French speaker would guess wrong, a preposition that differs (« bij » for chez, « voor »
  after « allergisch »), the register (« u », « uw » on `kleren:p0` and `reis:p4`).
- These items have no Flemish form in `be.js`: a note invents none (`hoeveel:p2` may name its sibling's
  « nog eens » and « nog is »).
- `note` is `{"fr": …, "en": …}`, the same note in each language, each side one line, at most 160 characters and 2
  sentences, no space at either end. No `<`, no newline, no straight double quote; the apostrophe is « ’ »
  (Check refuses « ' »).
- Never « hoe lang » in two words, in a note or an `also`, even as a quoted error: Check refuses it, as
  `test/content.js` (#128) does; a duration is « hoelang ».
- Quotes hold Dutch only: « … » in `fr`, “ … ” in `en`, never the other language's marks, every mark paired, no
  quote inside a quote, no empty quote, and both sides quote the same Dutch. A translation goes in parentheses, unquoted. Every quoted
  word is one OpenTaal or `test/data/flemish.tsv` knows, or one of the row's own forms (`nl`, `also`).
- A word of the course that both sides leave bare (outside quotes) is refused, a one-letter word too (« u »):
  quote it.
- Outside quotes, no French function word in `en` (le, et, est, …), no English one in `fr` (the, and, is, …).
- The same digits and `{…}` tokens on both sides; a default name (Tom, Gent, Novatech) is written `{naam}`, `{stad}`,
  `{bedrijf}`. « kunde » is « kunt ge » run together, never quoted beside « u ».
- `also`: `[]` unless another Dutch form is right for this phrase in this sense, which the typed exercise should
  then accept. One form per entry (no `/`, no `;`), spelled as OpenTaal or `flemish.tsv` knows it, not the Dutch
  itself, not twice, not a word that would become course Dutch that `test/lang.js` 6d.3 or 6d.4 refuses, and not
  the Dutch of another item of another sense (a sibling's is allowed). Not this item's Flemish form of `be.js` (no
  row of this kind has one), and a sibling's or another item's is no `also` either: Check accepts it, the readers
  dispute it. An `also` is not one of the decoys (`decoys.js`, or task 5's after Merge 6): `test/content.js`
  refuses a decoy the course accepts. Check reads `decoys.js`; task 8 runs it again after Merge 6. A new `also` is
  read whole by the readers.
- `"unsure": "<why, on one line>"` on a row you doubt; the readers read it first. A verdict in `review.json` carries
  `id` and `verdict` only (`keep`, `dispute: …`).
- Fix each failing row and run Check again until the batch reads `ok`.

Every refusal Check makes on these rows, quoted from runs on the copy (probe batches outside `drafts/`, built from
`notes-3`'s input and `reis:p4`) or, marked †, from `explain.js` where no row of this kind could trip it:

| Row fault | Line (after `fail draft.json <id>: `) |
|---|---|
| a field the kind lacks | `unknown field decoys` |
| `also` left out | `missing field also` |
| stamp changed | `stamp 00000000, input has 7e888b43` |
| `note` not two trimmed texts | `note is { "fr": …, "en": … }, each a text with no space at either end` |
| over 160 characters | `note.fr is 173 characters: at most 160` |
| `<`, newline, `"` | `note.en holds <, a newline or a straight quote "` |
| a straight apostrophe | `note.fr writes a straight apostrophe « ' »: write « ’ », …` |
| « hoe lang » | `note.fr writes « hoe lang »: …` (and `also « … » writes « hoe lang »: …`) |
| other language's quote marks | `note.en quotes with “ ” only` (`note.fr quotes with « » only`) |
| unpaired, nested, empty quote | `note.en has a quote mark without its pair, …` |
| three sentences | `note.fr has 3 sentences: at most 2` |
| a default name | `note.fr names « Tom »: write {naam}` |
| the meaning again | `note.fr only repeats the meaning` |
| the other language's words | `note.fr uses English words outside quotes: « is », « the »` (`note.en`: French) |
| « kunde » beside « u » | `note.fr quotes « kunde » beside a « u » and not « kunt ge »: « kunde » is « kunt ge » run together, not « kunt u »` |
| digits or tokens differ | `note.fr and note.en hold different digits or {…} tokens` |
| different Dutch quoted | `note.fr and note.en quote different Dutch: only en « nodig hebben »; only fr ` |
| a quoted word not Dutch | `« besoin » is quoted, but « besoin » is not Dutch that …` |
| course Dutch bare in both | `« voor », « melk » is Dutch of the course, outside quotes in fr and in en: …` (`« u »` too) |
| `also` not a list of lines | `also is a list of Dutch forms, [] for none, …` |
| two forms in one | `also « Ik was bij de tandarts / dokter. » holds more than one form: …` |
| the same form twice | `also lists « Ik ben allergisch aan melk. » twice` |
| the Dutch itself | `also « Wie heeft dit gebroken? » is the Dutch itself` |
| a Flemish form of `be.js` † | `also « … » is a Flemish form in be.js` |
| a form OpenTaal lacks | `also « Wie heeft dit gebroke? »: « gebroke » is not Dutch that …` |
| new course Dutch, 6d.3 | `also « Ik was bij de jam. »: « jam » would become Dutch of the course, and test/lang.js 6d.3 then refuses its QUOTE_OK exception (test/lib/quoted.js)` |
| new course Dutch, 6d.4 † | `also « … »: « <w> » would become Dutch of the course, and <where> writes it bare in French and in English (test/lang.js 6d.4)` |
| another item's Dutch | `also « Ze heeft hulp nodig. » is the Dutch of spoed:p3, which is not of the same sense: …` |
| a decoy of `decoys.js` | `also « Dat’s goed, merci. » is a decoy of overleven:p11 in decoys.js: …` |
| `unsure` on two lines, or empty | `unsure is a reason on one line with no space at either end` |

A row with a kit fault (field, stamp) gets only the kit's lines.

## Reader focus

Unsure rows first. Then, for every row:
- Does the note teach beyond `meaning`? A paraphrase of the meaning passes Check: dispute it.
- Is the grammar right? A wrong order, participle, article or preposition teaches the error to every learner.
- Does the quoted Dutch hold up: grammatical, and used as the note says?
- No invented Flemish (« in Flanders one says … »), except `hoeveel:p2`'s sibling.
- Are `fr` and `en` the same note, each natural in its own language, quoting the same Dutch?
- A new `also`: is it right for this phrase in this sense? A new `also` that is a Flemish form (a sibling's,
  another item's): dispute it.
- `kleren:p0` and `reis:p4`: the note keeps the formal register the meaning names.

### Task 8: Merge explanations

Class: mechanical
Ticket: {T-notes}
Merges: explanations (task 7)
Promises: none
Why: task 7's rows give the 80 phrases of units 13–34 that are not Flemish items their note in French and in
English. Merged after task 6's, `test/content.js`'s « explications » count is 0, and its last temporary budget goes
away: `NOTE_BUDGET` 80 → 0, back to the strict `=== 0` of before plan 4c, in the same commit (D30; header « pinned
budgets »). With it, `TESTING.md` loses the third exception and the `NOTE_BUDGET` clause: the budget paragraph is
again word for word its text of before plan 4c (D31's « back to two exceptions »; header call 10: after this task the
two lines of « Encore ouvert » are its only difference; task 11 adds the second place, l. 278–279).
Files:
- Merge writes: `src/content/notes.js` (80 entries set), `src/content/also.js` (one entry per row with a new `also`)
- Build writes: `index.html`, `artifact.html`
- Modify: `test/content.js`: the NOTE block's comment end, `const NOTE_BUDGET = 80;`, its two `ok` lines and its
  `console.log`
- Modify: `TESTING.md`: the « troisième exception » sentence (`:220-223`) and the `NOTE_BUDGET` clause (`:225-227`) of
  the budget paragraph, and the « Encore ouvert » content line (`:316`)
Interfaces:
- Consumes: the accepted rows of `<WS>/drafts/explanations/{notes-1,notes-2,notes-3}` (task 7's `draft.json` and
  `review.json`), Merge as `node tools/content/merge.js . "<WS>/drafts/explanations"`; task 6's `NOTE_BUDGET = 80`.
- Produces: the strict NOTE check. No new export.
Notes:
- Merge 6 runs before Merge 8 (header call 5): on a branch without task 6's 30 phrase notes, the strict 0 of step 6
  fails on them, whatever task 7 wrote. Step 1 runs explanations' Check again after Merge 6, so an `also` equal to one
  of task 6's decoys is refused before Merge 8 writes it.
- Merge runs once. The stamp covers `be`, `meaning`, `note`, `also` (`explain.js` `STAMP`), so a second Merge refuses
  as `stale` every row it noted, and writes nothing. A row fixed after Merge is a new Split and fan-out.
- The red is the old budget's ≥ side: once the rows are in, `NOTE_BUDGET 80` refuses the gain (« baisser NOTE_BUDGET
  à 0 »). The edit is the green. `NOTE_BUDGET` disappears rather than being set to 0, as `DECOY_BUDGET` did in task 6:
  the strict block is the one `git show feca4c0^:test/content.js` prints (measured: identical).
- `task-8.fixed.patch` carries `test/content.js` and `TESTING.md` only. The tables and the build come from the run's
  own Merge (80 rows); the proof's 4 hand rows are not in it. With the patch and no merged rows, `node test/content.js
  .` fails (34 and 110 against 0; measured `15940 contrôles, 2 ÉCHEC(S)`).
- Commit message: `feat(content): Merge explanations: notes for the 80 phrases of units 13–34 that had none;
  NOTE_BUDGET back to its strict 0 ({T-notes})`, no trailer. The commit holds `notes.js`, `also.js` if Merge set
  one, both html and the two files.

**The proof.** Fix copy `<SP2>\fixZ` (CRLF clone, base `8d12190`, task 6 at `685d07b`), commit `e944be6` « task 8
(fixed) »; patch
`%USERPROFILE%\Desktop\Projects\Vlaams\.superpowers\sdd\phase-4-design\plan-4d\parts\patches\task-8.fixed.patch`.
Every line below is measured there in run order. Task 6's Merge is stood in for by
`<SP>\proofs\B-be-aside\sim-all.js` on the full explanations-be Split (`34 decoys, 30 notes`, then build), which
gives step 2's state but for one `also`: it keeps `de huisarts`'s, which task 6's rows remove (task 5's Format), so
its `also` counts run one above the run's, and its totals differ. Each step below also gives the plan's replay, which
ran task 6's real Merge. Step 1: draft rows on all 80 (task 7's Split `notes-1 37`, `notes-2 39`, `notes-3 4`); its
red is an `also` equal to task 6's decoy « Wie doen da? » (vragen:p0), in a batch outside `drafts/`. Merge and the
per-row steps are measured with 4 hand rows: a named Split `node tools/content/split.js .
"<SP2>\fixZ-ws-8\hand\explanations" spoed:p0 spoed:p1 spoed:p3 spoed:p4` printed `notes-3 4`, with task 7's example
rows as `draft.json` and an all-`keep` `review.json`. The final 0 is measured with a placeholder note on the other 76
(`<SP2>\tools\fill-notes.js` on the full Split, the 4 ids skipped, `80 rows, 76 filled`, then build), and is
arithmetic: 80 − 4 − 76 = 0.

The hand rows (stamps from the Split):

```json
{"id": "spoed:p0", "stamp": "b9b2d832",
 "note": {"fr": "Après « allergisch », on met « voor », jamais « aan ».",
          "en": "After “allergisch” comes “voor”, never “aan”."}, "also": []}
{"id": "spoed:p1", "stamp": "682b8519",
 "note": {"fr": "« Gebroken » est le participe passé de « breken » : le verbe change de voyelle.",
          "en": "“Gebroken” is the past participle of “breken”: the verb changes its vowel."},
 "also": ["Wie heeft dat gebroken?"]}
{"id": "spoed:p3", "stamp": "7e888b43",
 "note": {"fr": "Avoir besoin de se dit « nodig hebben », et « nodig » se place en fin de phrase.",
          "en": "To need is “nodig hebben”, and “nodig” goes at the end of the sentence."}, "also": []}
{"id": "spoed:p4", "stamp": "6cef9803",
 "note": {"fr": "Chez quelqu’un se dit « bij » : « bij de tandarts », « bij de dokter ».",
          "en": "At someone’s place is “bij”: “bij de tandarts”, “bij de dokter”."}, "also": []}
```

Check: `ok input.json 4 rows`, `ok draft.json 4 rows`, `ok review.json 4 keep, 0 dispute` (exit 0). So: draft rows
on all 80, step 1; hand rows, Merge, build, one row per count (80 → 76, also 42 → 43; 41 → 42 in the plan's
replay) and the old budget's refusal; placeholder fill, the final 0, the strict check's refusals, lang and typed;
arithmetic, the 80-row Merge lines and the real rows' own totals; the plan's replay, steps 2 to 8 with 80 written
rows.

- [ ] **Step 1: Check the explanations batches again after Merge 6.** Merge 6 wrote task 5's decoys into
  `src/content/decoys.js`, which FAN explanations' Check did not see (task 2's `decoyed` reads `decoys.js`).
  `node tools/content/check.js "<WS>/drafts/explanations/notes-1"`, then `notes-2` and `notes-3`: each exit 0, with
  the `ok` lines FAN explanations printed. A line `fail draft.json <id>: also « … » is a decoy of <id> in decoys.js:
  the suite refuses a decoy the course accepts` (exit 1): stop, `needs ruling`; nothing is merged yet. Measured:
  `ok input.json 37 rows`, `ok draft.json 37 rows`, `ok review.json 37 keep, 0 dispute` (then 39 and 4), each exit 0;
  the probe, before Merge 6 `ok draft.json 4 rows`, after it `fail draft.json spoed:p1: also « Wie doen da? » is a
  decoy of vragen:p0 in decoys.js: the suite refuses a decoy the course accepts`, exit 1.

- [ ] **Step 2: Keep the before numbers.** `node test/content.js .` after Merge 6 and before Merge 8: exit 0, with
  `  explications    80 / 1158 élément(s) sans explication dans les deux langues (budget 80)`,
  `  tables          be 123, open.phrases 36, notes 1056, decoys 100, also 41 ; …` and
  `16006 contrôles, CONTENU CONFORME` (measured in the plan's replay; the stand-in gives `also 42` and `16005`; the
  run's real Merge 6 gives its own total).

- [ ] **Step 3: Merge.** `node tools/content/merge.js . "<WS>/drafts/explanations"`. Expected:
  `ok explanations 80 taken, 0 dropped`, `ok notes.js 80 set, 0 removed`, `ok also.js <n> set, 0 removed` (<n> the
  rows with a kept `also`). Measured in the plan's replay, with 80 written rows: those lines, `<n>` 1 (`spoed:p1`).
  Measured with the 4 hand rows: `ok explanations 4 taken, 0 dropped`,
  `ok notes.js 4 set, 0 removed`, `ok also.js 1 set, 0 removed`. A `fail … stale` or `fail … unsettled` line writes
  nothing: stop, `needs ruling`. A `dropped` above 0 leaves a phrase without a note, and step 6's strict 0 fails on
  it: stop, `needs ruling`.

- [ ] **Step 4: Build, then see the old budget refuse the gain.** `sh build.sh`: exit 0, last line `built (local only)
  index.html (<n> bytes), artifact.html (<n> bytes)` (the sizes depend on the merged rows). `node test/content.js .`:
  exit 1 with `  FAIL: seulement 0 élément(s) sans explication : baisser NOTE_BUDGET à 0 pour verrouiller le gain`
  (measured in the plan's replay: that line, `tables … notes 1136, decoys 100, also 42`,
  `16087 contrôles, 1 ÉCHEC(S)`; on the stand-in, with the full fill: `16086 contrôles, 1 ÉCHEC(S)`; with the hand
  rows alone: `  FAIL: seulement 76 élément(s) sans explication : baisser NOTE_BUDGET à 76 pour verrouiller le gain`,
  `  explications    76 / 1158 … (budget 80)`, `tables … notes 1060, decoys 100, also 43`,
  `16010 contrôles, 1 ÉCHEC(S)`).

- [ ] **Step 5: `test/content.js`.** The NOTE block, from its comment's « et explanations écrivent celles des mots et
  des phrases dans src/content/notes.js. » to its `console.log`, becomes:
```js
     et explanations écrivent celles des mots et des phrases dans src/content/notes.js. */
  const bilingual = x => !!x && has(x.fr) && has(x.en);
  const unexplained = items.filter(x => !bilingual(NL.ex.explanation(x))).map(x => x.id);
  ok(unexplained.length === 0, unexplained.length + ' élément(s) sans explication en français et en anglais : ' + unexplained.slice(0, 6).join(', '));
  console.log('  explications    ' + unexplained.length + ' / ' + items.length + ' élément(s) sans explication dans les deux langues (exigé : 0)');
```
  The comment's last sentences (« Les phrases prises dans Tatoeba … (D30). ») and `const NOTE_BUDGET = 80;` go;
  the two `ok` lines become the one above; the `console.log` ends « (exigé : 0) ».

- [ ] **Step 6: Run `node test/content.js .` and see it pass.** Exit 0, with
  `  explications    0 / 1158 élément(s) sans explication dans les deux langues (exigé : 0)` and `CONTENU CONFORME`.
  Measured in the plan's replay: that line, `tables … notes 1136, decoys 100, also 42` and
  `16086 contrôles, CONTENU CONFORME` (on the stand-in with the placeholder fill, `also 43` and `16085`); the real
  rows' total is their own (each `also` adds checks). The strict check
  refuses a shortfall, measured twice: with the 4 hand rows only, `  FAIL: 76 élément(s) sans explication en français
  et en anglais : vragen:p3, kunnen:p3, kunnen:p4, doen:p1, doen:p3, doen:p4`, `16009 contrôles, 1 ÉCHEC(S)`; with
  all 80 but `vragen:p3` (left out of the fill, `80 rows, 75 filled`), `  FAIL: 1 élément(s) sans explication en
  français et en anglais : vragen:p3`, `  explications    1 / 1158 … (exigé : 0)`, `16084 contrôles, 1 ÉCHEC(S)`.

- [ ] **Step 7: Run `node test/lang.js .`.** Exit 0, no `FAIL`, last line `25781 contrôles, LANGUE CONFORME` (measured with the 4 hand rows and the placeholder fill merged and built; about 9 min). The real notes add
  their prose to its checks, so the total moves; the verdict line is the test.

- [ ] **Step 8: Run `node test/typed.js .`** (an `also` was set). Exit 0, last line `42968 contrôles, 0 en échec`
  (measured in the plan's replay, about 1 min; `42970` on the stand-in, which kept `de huisarts`'s `also`; the
  verdict line is the test). The hand rows set one `also` (`spoed:p1`), as the replay's rows did.

- [ ] **Step 9: `TESTING.md`.**
  - The budget paragraph: the sentence « Une troisième exception, temporaire, vient du plan 4c : … le plan 4d écrit
    ces notes et le ramène à 0 avant la mise en ligne (#12). » goes; « n'en ont plus, à une exception près : »
    becomes « n'en ont plus : »; the text from the space before « — sauf, jusqu'au plan 4d » to « deux sens —, »
    becomes « , », so the line reads « … la règle d'un motif), et ». The two lines are wrapped as before plan 4c:
    `… l'ont révélé. Les leurres, les explications et les`, then
    `` guillemets n'en ont plus : `content.js` exige que chaque élément de « Comment le ``. The paragraph then reads
    as `git show feca4c0^:TESTING.md` prints it (measured: `diff` empty).
  - « Encore ouvert »: « dont les explications attendent le plan 4d (`NOTE_BUDGET` dans `test/content.js`), et leurs »
    becomes « avec leurs explications (Merge explanations-be et Merge explanations du plan 4d), et leurs ».
  - Then `grep -c "NOTE_BUDGET\|DECOY_BUDGET" TESTING.md` prints `0`, and `git diff feca4c0^ -- TESTING.md` is one hunk,
    the two « Encore ouvert » lines (pre-4c lines 312–313), which task 11 keeps, as it adds a second hunk at
    l. 278–279 (measured). No suite reads `TESTING.md`.

- [ ] **Step 10: Commit.** `git add src/content/notes.js src/content/also.js index.html artifact.html test/content.js
  TESTING.md`, then the commit message of Notes. `git show --stat HEAD`: the six files (five if Merge set no
  `also`). Measured on the fix copy for the
  two hand-edited files (`e944be6`): `TESTING.md | 12 ++++--------`, `test/content.js | 12
  +++---------`, `2 files changed, 7 insertions(+), 17 deletions(-)` (as the patch wraps it; another wrapping changes this count, not the
  check).

Done when: Step 1 printed only `ok` lines, each batch exit 0; Merge printed `ok explanations 80 taken, 0 dropped` and
`ok notes.js 80 set, 0 removed`; `sh build.sh` exits 0; `node test/content.js .` exits 0 with `  explications    0 /
1158 élément(s) sans explication dans les deux langues (exigé : 0)` and `CONTENU CONFORME`; `node test/lang.js .`
and `node test/typed.js .` exit 0 with no `FAIL`; `grep -c "NOTE_BUDGET\|DECOY_BUDGET" TESTING.md` prints `0`;
`git show --stat HEAD` names `notes.js`, `also.js` (if Merge set one), `index.html`, `artifact.html`,
`test/content.js` and `TESTING.md`, with no trailer. `node test/tools/fanout.js .` is not touched by this task
(`762 contrôles, KIT CONFORME` at `e944be6`, as after task 6).

### Task 9: FAN open

Class: fan-out
Ticket: {T-open}
Kind: open
Drafting after: 3, 4
Split: node tools/content/split.js . "<WS>/drafts/open"
Check: node tools/content/check.js "<WS>/drafts/open/<batch>"
Merged by: task 10
Why: the 66 phrases of units 13–34 that D33 picked, three a unit, have no open task (« réponse libre »), and
neither have the 13 grammar rules of those units: the course stops asking for an answer of the learner's own after
unit 12. This fan-out writes one task on each row, so that task 10 takes « réponse libre » from 45 tasks to 124.

Split, measured at task 4's commit on the real course and `.cache`:

```
units-13-18 18
units-19-24 18
units-25-30 18
units-31-34 12
rules 13
```

79 rows, five batches. The four `units-…` batches hold the 66 phrases, each with `id`, `stamp`, `nl`, `unit`,
`meaning` and `vocab` (the words the course has taught up to its unit). `rules` holds the 13 rules, each with `id`,
`stamp`, `unit`, `title`, `rule`, `example`, `explain`, five `drills` and `vocab` up to the rule's unit. No row of
units 1–12 is cut.

## Format

One row per input row, in `draft.json`, in the input's order. A phrase row:

```json
{"id": "vragen:p2", "stamp": "3dad158c",
 "ask": {"fr": "Au guichet de la gare, il y a un nouvel appareil pour les tickets. Demande à l’employé comment il fonctionne, et comment on paie.",
         "en": "At the station counter there is a new ticket machine. Ask the clerk how it works, and how you pay."},
 "need": [{"what": {"fr": "demande comment", "en": "asks how"}, "any": ["hoe"], "miss": "Kan ik met geld betalen voor een ticket?"},
          {"what": {"fr": "parle du paiement", "en": "talks about paying"}, "any": ["betalen", "betaal", "kaart", "geld", "kost", "kosten"], "miss": "Hoe werkt dat, alstublieft?"},
          {"what": {"fr": "au moins 4 mots", "en": "at least 4 words"}, "min": 4, "miss": "Hoe betalen?"}],
 "model": "Hoe werkt dat? Moet ik met geld betalen?"}
```

A rule row has the same fields:

```json
{"id": "g-er-is", "stamp": "f7603bdf",
 "ask": {"fr": "Dis ce qu’il y a dans ta rue. Commence par « Er is » ou « Er zijn ».", "en": "Say what your street has. Start with “Er is” or “Er zijn”."},
 "need": [{"what": {"fr": "commence par « er is » ou « er zijn »", "en": "starts with “er is” or “er zijn”"}, "rx": "^\\s*er\\s+(is|zijn)\\b", "miss": "In mijn straat is een bakker."},
          {"what": {"fr": "au moins 5 mots", "en": "at least 5 words"}, "min": 5, "miss": "Er is een bakker."}],
 "model": "Er is een bakker in mijn straat."}
```

Each row passed Check at task 4's commit, alone in a batch with a keep (`ok draft.json 1 rows`,
`ok review.json 1 keep, 0 dispute`). Use them, or write your own.

- `id` and `stamp` are copied from the input row, unchanged. `"unsure": "<why, on one line>"` is optional.
- The task does not ask for the phrase itself, nor for the rule's example or one of its drills: Check refuses a
  model equal to any of them. A phrase task is a situation the phrase answers; the learner's answer may use the
  phrase's frame (« Hoe werkt … ? ») with words of their own.
- A rule task is built on the rule: its needs check what the rule teaches (here, « er is » / « er zijn »), not a
  word of the topic. Its model is a new sentence, in `vocab` up to the rule's unit.
- `ask` is `{fr, en}`, one line each, the same task in both. It says what the answer must contain, never the
  wording. `ask` and every `what` hold the same digits in fr and in en.
- `need` holds 2 to 4 needs, each `{what, rx | any | min, miss}`. The `what`s of a task differ from each other in
  fr and in en.
  - `rx` is the source of a regular expression, a JSON string with its backslashes doubled; Merge adds flag `i`.
  - `any` lists whole words or runs of words: no inflection is implied (list `betalen` and `betaal`), accents are
    not folded, digits are listed as digits (the reader's to catch; Check does not test it).
  - `min` is a whole number from 3 to 12, on exactly one need, and its `what` names that number in fr and in en.
  - `miss` is an answer that fails its own need and meets every other: Check runs it through the session's
    rubric (`NL.ex.rubric`).
- `model` meets every need, has at least 3 words, uses only words taught by the row's unit (Check names any word
  a later unit teaches). Every word of the model is Dutch that OpenTaal or flemish.tsv knows. Merge makes it
  Dutch of the course, so it adds no word of `QUOTE_OK` (`test/lib/quoted.js`) and no word the course writes bare
  in fr and in en: Check refuses both. It is how a Brabant colleague says it (the reader's to catch; Check does
  not test it).
- Quotes: « » in fr, “ ” in en, the same Dutch on both sides in the same order, holding only Dutch the course has
  taught by the row's unit, or numbers. A translation goes in parentheses (the reader's to catch; Check does not
  test it). A word written bare in fr and in en must not be Dutch anywhere in the course, nor in another row's
  model: `tennis`, `tv` and `online` are course Dutch. Quote it, or reword.
- Never « hoe lang » in two words, anywhere in a row (ask, what, model, miss, rx, any): `test/content.js` refuses it,
  and so does Check; a duration is « hoelang ».
- No `{ }` token and no name of the learner, of their town or of their company: a task is the same for every
  learner. Check refuses a token and the course's default names (`Tom`, `Gent`, `Novatech`); any other such name is
  the reader's to catch. A place the situation needs is no such name: « Ik neem de trein naar Brussel ».
- The weakest picks (`kunnen:p4`, `waar:p4`, `hoeveel:p4`, `natuur:p1`): if no natural situation fits, write the
  best you can and say why in `unsure`.
- `review.json`: one verdict per row. `keep` carries `right`, two right answers of the reader's own, each at least
  3 words, different from each other and from the model; Check refuses a keep whose right answer misses a need.
  Any other verdict is `dispute: <reason>` and carries no `right`.
- A Check failure names the field and the reason. Fix the row and run Check again until the batch reads `ok`.

## Reader focus

The 13 rule tasks are read whole (`readWhole` returns `'rule task'` for each); the phrase tasks are sampled, 1 in
10 and at least 10 (D15). Unsure rows first. Then:

- Write your two answers from the `ask` alone, before reading the needs. If Check refuses one, do not rewrite it:
  that is a wrong rejection, and the row is `dispute`.
- A wrong rejection is the worst fault. Try ge, je and u; another word order; a synonym the course teaches; digits
  against a number word; « één »; a polite word added. A need that rejects any of them is `dispute`.
- A need checks only what the ask asks. A need on a word the ask never named is `dispute`.
- Can a learner answer at this unit, with `vocab`? Does the ask give the answer away word for word?
- Flemish register: the model is what a Brabant colleague says. Each `miss` is a real learner's mistake, not a
  random string. fr and en say the same task.
- A rule task that repeats one of its drills or its example, or whose needs never touch the rule, is `dispute`
  (Review focus 3). A task repeating another task's ask is the reader's to catch, rule or phrase.
- Shared frames: six picks share their frame with a task of units 1–12 (`landen:p0` « Spreekt u Frans? »,
  `wonen:p3` « Ik moet naar het containerpark. », `doen:p3` « Kan ik met de kaart betalen? », `mensen:p1` and
  `reis:p4` « Mag ik twee pistolets? », `doen:p0` « Ik neem de trein naar Brussel. »); `school:p3` and `natuur:p1`
  share « Waar is mijn … ? » with `thuis:p2`'s « Waar is het gemeentehuis? ». Each new task asks something its
  twin does not.
- Answer-built picks (`vragen:p4`, `mensen:p2`, `hoeveel:p3`, `landen:p0`, `eten:p0`, `stad:p3`, `gevoel:p1`,
  `afspraak:p1`, `reis:p3`): the phrase is an answer, so the ask is the question it answers, not a request to
  repeat it.
- The weakest picks (`kunnen:p4`, `waar:p4`, `hoeveel:p4`, `natuur:p1`): the batch reader reads each in full,
  and keeps it only if its ask is natural.
- An `any` that lists a number word and not its digits is `dispute`.
- A task that names a person, the learner's town or an employer is `dispute`; a place the situation needs
  (« Brussel », « Aalst ») is not.
- A phrase with a third person (`vragen:p4`, `spoed:p3`; `mensen:p1` with « u » for « hem »): the task needs no
  « hij » or « ze ».
- No task makes the learner claim something untrue about themselves: ask for a choice (« dis si … »), not a fact.

### Task 10: Merge open

Class: mechanical
Ticket: {T-open}
Merges: open (task 9)
Promises: none
Why: task 9's rows give the 66 phrases of units 13–34 that D33 picked their open task (« réponse libre », served at
rung 6), and the 13 grammar rules of those units theirs (served on the rule at rungs 4 and 6). Merged, the course
asks for an answer of the learner's own up to unit 34, and `test/content.js` counts 124 open tasks instead of 45.
Files:
- Merge writes: `src/content/open.phrases.js` (66 entries set, under each phrase's Dutch) and `src/content/open.js`
  (13 set, under each rule id)
- Build writes: `index.html`, `artifact.html`
- Modify, only if `test/lang.js` names it (step 5): `test/lib/quoted.js`, `QUOTE_OK` or `SHARED_OK`
Interfaces:
- Consumes: the accepted rows of `<WS>/drafts/open/{units-13-18,units-19-24,units-25-30,units-31-34,rules}` (task
  9's `draft.json` and `review.json`), merged as `node tools/content/merge.js . "<WS>/drafts/open"`; task 4's
  `merge(row, input)`, which sends a rule row to `open.js` and a phrase row to `open.phrases.js`.
- Produces: 22 rule tasks in `NL.content.openTasks` (9 + 13), which `src/content/index.js` (`:98`) sets on each
  rule as `g.open`; 102 phrase tasks in `open.phrases.js` (36 + 66), set on each phrase as `it.open`. No new export.
Notes:
- Merge runs once, writing every accepted row of the five batches in one call. The stamp covers a phrase's meaning
  and a rule's `rule`, `example` and drills' Dutch (task 4), so a source edited since Split makes Merge refuse the
  row as `stale`, and nothing is written. A row fixed after Merge is a new Split and fan-out, not a rerun.
- No budget pins the count: « réponse libre » is printed, not pinned (`test/content.js`, `openItems`, `:166-182`), so
  nothing in `test/` is edited unless lang trips (step 5). No document states the count (grep of `TESTING.md`,
  `README.md`, `CLAUDE.md`, measured). 124 = 45 + 79; each dropped row lowers it by one; gate 12's Ask
  reads `45 + t`, `t` the `taken` of `## open`'s count line.
- Each merged row moves `test/content.js` by a fixed amount: « tâches » + 1, « exemples qui cochent tout » + 1,
  « besoins manqués un à un » + its needs, and the check count + 2 + 2 × its needs (one check that the model meets
  every need, two per need for its miss, and one « hoe lang » check for the table line it adds).
- `test/lang.js` reads every new `ask` and `what` (6d). Check already refused what 6d refuses in one row; what it
  cannot see is a `QUOTE_OK` or `SHARED_OK` exception the new Dutch makes stale, which is fixed here, as in plan 4c
  task 12 step 8.
- `task-10.fixed.patch` is the proof's commit: its two tables hold the 4 hand rows below, not the run's 79. In the run,
  the tables and the html come from task 9's rows; nothing else in the patch is needed.
- Commit message: `feat(content): Merge open: an open task for the 66 phrases of units 13 to 34 that D33 picked, and
  for the 13 grammar rules of those units, in open.phrases.js and open.js ({T-open})`, no trailer.

**The proof.** Fix copy `<SP2>\fixZ` (CRLF clone, base `8d12190`; task 8 (fixed) at `e944be6`), commit `c950443`
« task 10 (fixed) »; patch
`%USERPROFILE%\Desktop\Projects\Vlaams\.superpowers\sdd\phase-4-design\plan-4d\parts\patches\task-10.fixed.patch`;
workspace `<SP2>\fixZ-ws-10` (every output in `out/`). In run order, task 6's run is stood in by
`<SP>\proofs\B-be-aside\sim-all.js` and task 8's by `<SP2>\tools\fill-notes.js`, each followed by `sh build.sh`.
Merge, build and the per-row amounts are measured with 4 hand rows, written as a drafter would, from a named Split
`node tools/content/split.js . "<…>/hand/open" vragen:p2 kunnen:p0 g-er-is g-niet-geen`, which printed
`units-13-18 2` and `rules 2`. The rows are `vragen:p2` and `g-er-is` as in task 9's Format, and:

```json
{"id": "kunnen:p0", "stamp": "c42948a9",
 "ask": {"fr": "Tu invites un ami à manger chez toi samedi. Dis-le-lui, et demande à quelle heure il peut venir.",
         "en": "You invite a friend to eat at your place on Saturday. Tell him, and ask what time he can come."},
 "need": [{"what": {"fr": "nomme le jour", "en": "names the day"}, "any": ["zaterdag"], "miss": "Kom je bij ons eten? Hoe laat kan je komen?"},
          {"what": {"fr": "demande l’heure", "en": "asks the time"}, "rx": "\\b(hoe\\s*laat|wanneer|welk\\s+uur|hoeveel\\s+uur)\\b", "miss": "Kom je zaterdag bij ons eten?"},
          {"what": {"fr": "au moins 6 mots", "en": "at least 6 words"}, "min": 6, "miss": "Zaterdag eten? Hoe laat?"}],
 "model": "Kom je zaterdag bij ons eten? Hoe laat kan je komen?"}
{"id": "g-niet-geen", "stamp": "c648fdbe",
 "ask": {"fr": "Un collègue te pose des questions sur ton week-end. Dis une chose que tu n’as pas (avec « geen ») et une chose que tu ne fais pas (avec « niet »).",
         "en": "A colleague asks about your weekend. Say one thing you do not have (with “geen”) and one thing you do not do (with “niet”)."},
 "need": [{"what": {"fr": "dit « geen »", "en": "says “geen”"}, "any": ["geen"], "miss": "Ik werk zaterdag niet en ik heb een fiets."},
          {"what": {"fr": "dit « niet »", "en": "says “niet”"}, "any": ["niet"], "miss": "Ik heb geen fiets en geen auto."},
          {"what": {"fr": "au moins 6 mots", "en": "at least 6 words"}, "min": 6, "miss": "Geen fiets, niet werken."}],
 "model": "Ik heb geen fiets en ik werk zaterdag niet."}
```

Each with an all-`keep` `review.json` (two right answers per row). Check: `ok input.json 2 rows`,
`ok draft.json 2 rows`, `ok review.json 2 keep, 0 dispute`, in both batches.

The hand rows prove Merge's lines, where a row lands (one set line in `open.js` per rule row, in `open.phrases.js` per
phrase row), the build, the per-row amounts (4 rows, 11 needs: 45 → 49 tasks, 136 → 147 needs, 16084 → 16114
checks), lang, typed, `node test/tools/fanout.js .` (`762 contrôles`, whose only FAILs are the stand-ins' two
`table.js` lines on `notes.js` and `decoys.js`) and `node test/smoke.js .` (`ALL CHECKS PASSED`). The 79-row Merge
lines are arithmetic. The commit was made after `git checkout -q -- src/content index.html artifact.html` and a
Merge of the hand rows alone, so it holds those rows and their build, never a stand-in row; at `c950443` fanout reads
`762 contrôles, KIT CONFORME`.

**All 79 marked as merged.** After the hand rows, `<SP>\proofs\O-main-aside\fill-open.js` stands in for the rest of
this Merge: run from the copy's root with a Split folder, it writes one placeholder task (two needs) per row, a phrase
under its Dutch in `open.phrases.js`, a rule under its id in `open.js`, and prints its count. Split, run again with
no ids, printed `units-13-18 16`, `units-19-24 18`, `units-25-30 18`, `units-31-34 12`, `rules 11`; the fill printed
`75 rows filled: open.phrases.js 64 set, open.js 11 set`; after `sh build.sh`, `node test/content.js .` gave
`  réponse libre   124 tâches, 124 exemples qui cochent tout, 297 besoins manqués un à un` and
`16564 contrôles, CONTENU CONFORME` (16084 + 2 × 79 + 2 × 161: 11 needs in the hand rows, 150 in the fill), and
fanout `762 contrôles` with only the same two stand-in lines.

- [ ] **Step 1: Keep the before numbers.** `node test/content.js .` on the branch after task 9's rows are accepted
  and before Merge: exit 0, `  réponse libre   45 tâches, 45 exemples qui cochent tout, 136 besoins manqués un à un`,
  `<S> contrôles, CONTENU CONFORME`; keep `S` for step 4 (16086 in the plan's replay, after the real rows of tasks 6
  and 8; 16084 on the fix copy, after their stand-ins).

- [ ] **Step 2: Check again, then Merge.** Once all five batches are drafted, run
  `node tools/content/check.js "<WS>/drafts/open/<batch>"` again on each of them, and Merge only when all five read
  `ok`: Check reads the other rows' models from the `draft.json` and `retry.json` files present when it runs, so a
  model drafted later in another batch can make a row's bare fr/en word course Dutch (`ask: « <w> » is in the model
  of <id>, which Merge makes Dutch of the course …`). Measured in `<SP2>\fixZ-ws-10\golf\open`: `vrijetijd:p3` (ask
  « Un collègue t’invite au golf samedi… ») alone in batch `p3` read `ok draft.json 1 rows`, exit 0; with
  `vrijetijd:p1` (model « Ik kan golf spelen. ») drafted in batch `p1` beside it, the same Check read `fail draft.json
  vrijetijd:p3: ask: « golf » is in the model of vrijetijd:p1, which Merge makes Dutch of the course: written bare in
  fr and in en, quote it, or reword`, exit 1. A `fail` on re-check names a row of task 9: stop, `needs ruling` (the
  row goes back to its drafter; do not edit a row here). Then `node tools/content/merge.js . "<WS>/drafts/open"`.
  Expected (arithmetic):
  `ok open 79 taken, 0 dropped`, `ok open.phrases.js 66 set, 0 removed`, `ok open.js 13 set, 0 removed`, in that
  order. Measured with the 4 hand rows: `ok open 4 taken, 0 dropped`, `ok open.phrases.js 2 set, 0 removed`,
  `ok open.js 2 set, 0 removed`. A `fail … stale` or `fail … unsettled` line writes nothing: stop, `needs ruling`. A
  `dropped` above 0 is a row the readers disputed: its phrase or rule keeps no task; say so in the return (the count
  in step 4 falls by one per dropped row).

- [ ] **Step 3: Build.** `sh build.sh`: exit 0, last line `built (local only) index.html (<n> bytes), artifact.html
  (<n> bytes)` (the sizes depend on the merged rows of tasks 6, 8 and 9).

- [ ] **Step 4: Run `node test/content.js .`.** Exit 0, with
  `  réponse libre   <45 + t> tâches, <45 + t> exemples qui cochent tout, <136 + N> besoins manqués un à un` and
  `<S + 2t + 2N> contrôles, CONTENU CONFORME`, with `t` the `taken` of step 2's `ok open <t> taken` line (79 when
  none is dropped), `N` the needs the taken rows hold, and `S` step 1's count. In the plan's replay, S = 16086,
  t = 79 and N = 164 (20 needs in its 7 hand rows, 2 in each of its 72 stand-ins) gave
  `  réponse libre   124 tâches, 124 exemples qui cochent tout, 300 besoins manqués un à un` and
  `16572 contrôles, CONTENU CONFORME`; on the fix copy, S = 16084 and the full fill's N = 161 gave 16564. Measured
  on the fix copy with the hand rows:
  `  réponse libre   49 tâches, 49 exemples qui cochent tout, 147 besoins manqués un à un`,
  `16114 contrôles, CONTENU CONFORME`. A FAIL here on a model, a miss, an `en`, or a `src/content/open*.js:<n> écrit
  « hoe lang »` line is a row Check let through: stop and report the line.

- [ ] **Step 5: Run `node test/lang.js .`.** Exit 0, no `FAIL`, last line `<n> contrôles, LANGUE CONFORME` (about 5
  minutes). In the plan's replay: `25781 contrôles, LANGUE CONFORME` before Merge and `26267 contrôles, LANGUE
  CONFORME` after it, its 79 rows merged and built, with no `FAIL` and no `6d` line; on the fix copy, `25781` before
  Merge (the stand-ins of tasks 6 and 8) and `25811` with the 4 hand rows; `test/lib/quoted.js` unchanged in both.
  Two `6d` guards can trip on the new Dutch; each one’s fix is in `test/lib/quoted.js`, and nowhere else:
  - `6d : « <w> » est du néerlandais du cours, son exception est de trop` (with `6d : « <w> » n’est plus cité nulle
    part, son exception est de trop` for the same word): delete `<w>`'s line from `QUOTE_OK`.
  - `6d : <where> [<w>] : du néerlandais du cours, écrit pareil en français et en anglais hors de nl-BE — …`: when
    `<w>` is the same word in French and in English there, add `<w>: '<ce qu’il est>, le même en français et en
    anglais, dans <where, in French>'` as the last entry of `SHARED_OK`, in the form of its other entries, with a
    comma after the entry before it; when it is Dutch left bare, stop and report the line.
  - Any other FAIL: stop and report it. Then run `node test/lang.js .` again: exit 0.

- [ ] **Step 6: Run `node test/typed.js .`.** Exit 0, last line `<n> contrôles, 0 en échec`, `<n>` being the count
  `typed.js` gave at task 8's step 8 (`42968` in the plan's replay, where task 6's rows removed one `also` and task
  8's set one; on the fix copy, whose task 6 stand-in kept `de huisarts`'s `also`, `42970` with task 8's hand rows,
  which set one, and `42968` on the stand-ins, which set none), unmoved by Merge 10's rows (measured on the
  stand-ins: `42968 contrôles, 0 en échec` before Merge and with the 4 hand rows, about 1 minute). It grades
  open answers through the rubric and edits `NL.content.openTasks[id].need[i]` in place
  (`:522`): the rule tasks are the same object as the `open.js` table (task 4), so the new ones are read the same way.

- [ ] **Step 7: Commit.** `git add src/content/open.phrases.js src/content/open.js index.html artifact.html`, plus
  `test/lib/quoted.js` if step 5 changed it, then the commit message of Notes. `git show --stat HEAD` lists those
  files. Measured on the fix copy (`c950443`, hand rows): the four files, `4 files changed, 12 insertions(+)`; in
  the plan's replay, its 79 rows: the four files, `237 insertions(+)`.

Done when: Merge printed its three `ok` lines with 0 dropped (or the dropped rows are reported); `sh build.sh`,
`node test/content.js .` (« réponse libre » `<45 + t>` tâches, `<45 + t>` exemples, with `t` the `taken` of step 2's
`ok open <t> taken` line), `node test/lang.js .` and
`node test/typed.js .` exit 0; the commit holds the two tables and both html files (and `quoted.js` if step 5 needed
it), with no trailer.

### Task 11: Docs: TESTING.md's two exceptions; a wording for #12

Class: mechanical
Ticket: #12
Promises: none
Why: tasks 6 and 8 already put `TESTING.md`'s budget paragraph back to its text of before plan 4c, « deux
exceptions » and no `DECOY_BUDGET` or `NOTE_BUDGET` clause (D31; header call 10). What is left: the content line of
« Encore ouvert », which tasks 6 and 8 edit but Merge open (task 10) does not, so it lacks the open tasks; the rows
the maintainer reads whole (D15), which this plan adds to (the 13 rule tasks, call 7; each new « on dit aussi » form,
tasks 5 and 7); and the issue: #12's « Three exceptions » (l. 162) still names phase 4c's third, temporary one,
which this plan removes. The spec records decisions, so the run proposes a wording to the maintainer and never
edits the issue.
Files:
- Modify: `TESTING.md`: the first line of « Encore ouvert » (the content line), one sentence added at its end;
  l. 278–279, the rows the maintainer reads whole
- Write, outside the repo: `<WS>/tmp/spec-12.md`, the proposed wording for #12
Interfaces:
- Consumes: `TESTING.md` as tasks 6 and 8 leave it; `git show feca4c0^:TESTING.md` (its text before plan 4c); the
  open tasks Merge open wrote at task 10 (`src/content/open.phrases.js`, `src/content/open.js`).
- Produces: nothing a later task reads in the repo. Gate 13's ask gives the maintainer `<WS>/tmp/spec-12.md`; the
  release's PR body names no local path.
Notes:
- **Header call 10.** `TESTING.md` is the exact text of before plan 4c, with no history sentence, except in two
  places, both this task's. The two lines of « Encore ouvert », whose counts moved and are true now: « 1158
  éléments » (`test/content.js` prints `0 / 1158 élément(s) sans explication`), « 17 mots sur 912 ». Put back as
  they were (« 1048 éléments », « 80 mots sur 912 », « et pas encore leurs phrases »), they would be false; they
  stay, and the first gains the open tasks. And l. 278–279, which name the rows the maintainer reads whole and gain
  the 13 rule tasks and each new « on dit aussi » form. Measured: before this task, `git diff feca4c0^ --
  TESTING.md` is one hunk `@@ -309,5 +309,5 @@`, 2+/2−; after it, two hunks, 7+/4−.
- The rest of `TESTING.md` is as before plan 4c. The budget paragraph's « de 129 à 136 » is `AHEAD_BUDGET = 136`
  (`test/content.js`); « 3 échelons n'ont aucun exercice possible » is `HOLLOW_BUDGET = 3`, and `test/content.js`
  passes at both values after task 10 (measured on the stand-in state). The open tasks' counts are printed, never
  pinned, and no document states them (task 10's notes; grep of `README.md`, `CLAUDE.md`).
- A repo-wide grep finds no stale mention: `git grep -n -I -E "troisième exception|third exception|three
  exceptions|NOTE_BUDGET|DECOY_BUDGET|jusqu'au plan 4d" -- ':!docs/superpowers' ':!index.html' ':!artifact.html'`
  prints nothing (measured). The plans under `docs/superpowers/` are history, and stay.
- **The #12 wording.** The second exception's count is the one the code holds, 136, in place of the replay's 130; the
  third is removed whole, with no sentence in its place, as `TESTING.md` has none. The file offers the one-sentence
  trace as an option and recommends against it. It never goes to GitHub: issue #12 is read only (`gh issue view 12
  --repo dahyousef/Vlaams`), and applying the wording is the maintainer's (header « Left out »).
- No suite reads `TESTING.md`, so this task has no red. Its check is the `diff` and the greps.
- `task-11.fixed.patch` is the whole commit (`TESTING.md` only). It applies on any tree where task 8 is in: the
  stand-ins for the run's Merges do not touch `TESTING.md`.
- Commit message: `docs(test): TESTING.md names the open tasks of units 13 to 34 and the rows read whole (#12)`,
  with the body below, no trailer.

```
The budgets paragraph is back to its text of before plan 4c, two
exceptions (tasks 6 and 8). Two places still differ from that text.
The two lines of « Encore ouvert », whose counts moved: 1158 items,
17 words without an example sentence, and now the open tasks that
Merge open wrote for three phrases a unit and the thirteen rules.
And the rows the maintainer reads whole, which now name the rule
tasks and the new « on dit aussi » forms.
```

**The proof.** Copy `<SP2>\fixZ` (CRLF clone, branch `fix`): base `8d12190`, tasks 1, 2, 3, 4, 6, 8 and 10 fixed
(`c950443` last), task 11 at `f19c27b`; patch `%USERPROFILE%\Desktop\Projects\Vlaams\.superpowers\sdd\phase-4-design\plan-4d\parts\patches\task-11.fixed.patch`. The text before plan 4c
came from the worktree (`git show feca4c0^:TESTING.md`; the copy lacks `feca4c0`), CR stripped, and was diffed in a
scratch repo against the copy's `TESTING.md` at `c950443` (step 1) and at `f19c27b` (step 3). Step 2's anchors
occur once each and keep CRLF; step 3's greps print `0`, `1` and nothing; step 5's stat is the commit's. The
stand-in state of task 12's proof gives `1158 éléments` and the 13 `g-` ids as keys of `open.js`.

- [ ] **Step 1: See where `TESTING.md` stands against its text before plan 4c.** `git diff --stat feca4c0^ --
  TESTING.md` prints `1 file changed, 2 insertions(+), 2 deletions(-)`, and `git diff feca4c0^ -- TESTING.md` shows one
  hunk, `@@ -309,5 +309,5 @@`, the two lines of « Encore ouvert » (measured). Anything else in the hunk list is a
  merge task's `TESTING.md` step left undone: stop and return `needs ruling`, naming the hunk.

- [ ] **Step 2: Two edits.** At the end of the first line of « Encore ouvert », « avec leurs leurres écrits (Merge
  explanations-be du plan 4d). » becomes:

  « avec leurs leurres écrits (Merge explanations-be du plan 4d) ; trois de ces phrases par unité et chacune des
  treize règles ont leur réponse libre (Merge open du plan 4d). »

  Each of the 13 rules of `grammar.a1c.js` has its task in `open.js` after task 10 (every `id: 'g-…'` of the file is
  a key of `open.js`), and the 66 phrases are three for each of the 22 units (D33).

  Then l. 278–279 (the anchor starts at the end of l. 277, which keeps its text; « / » is a line break; the anchor
  occurs once), « Et aucun contrôle ne dit si la règle / d'une fiche est vraie ni si une conversation sonne flamand :
  ce sont les 17 lignes / du genre `grammar` et du genre `scenarios` que le mainteneur lit entières. » becomes:

  « Et aucun contrôle ne dit si la règle / d'une fiche est vraie, si une conversation sonne flamand, si la réponse
  libre d'une / règle la fait employer, ni si une nouvelle forme « on dit aussi » se dit en Flandre : / ce sont les
  17 lignes du genre `grammar` et du genre `scenarios`, les 13 tâches de / règle du genre `open` et chaque nouvelle
  forme « on dit aussi » que le mainteneur / lit entières. »

  Keep the file's line ends (CRLF in a CRLF clone).

- [ ] **Step 3: Check.** `git diff --stat feca4c0^ -- TESTING.md` prints `1 file changed, 7 insertions(+), 4
  deletions(-)`, and `git diff feca4c0^ -- TESTING.md` shows two hunks, `@@ -275,8 +275,11 @@` and `@@ -309,5 +312,5
  @@`. `grep -c "NOTE_BUDGET\|DECOY_BUDGET\|troisième exception" TESTING.md` prints `0`, `grep -c "deux exceptions"
  TESTING.md` prints `1`, and the `git grep` of Notes prints nothing (all measured).

- [ ] **Step 4: Write `<WS>/tmp/spec-12.md`.** `mkdir -p "<WS>/tmp"`, then the file, word for word:

  ````markdown
  # A wording for #12: the budgets' « Three exceptions » back to two

  For the maintainer to apply by hand to issue #12, « Checking », the paragraph that starts
  « Where a budget replaces a demand for zero » (l. 162 when plan 4d was written). The spec records
  decisions, so the run proposes and never edits it. This file never goes to GitHub.

  Why: plan 4d wrote the written wrong options and the notes that phase 4c's third exception waited for.
  `test/content.js` demands zero again for « sans leurres » and « explications » (it checks
  `undecoyed.length === 0` and `unexplained.length === 0`, printed « (exigé : 0) »; `DECOY_BUDGET` and
  `NOTE_BUDGET` are gone), so the third exception no longer holds. The second exception's count is the one
  the code holds (`AHEAD_BUDGET = 136` in `test/content.js`; TESTING.md says « de 129 à 136 »), in place of
  the replay's 130.

  ## The paragraph, as proposed

  **Where a budget replaces a demand for zero**, because existing content breaks the rule today, the budget
  is stated and may only ever decrease. Two exceptions. The first: the budget of example sentences that
  borrow from a later unit rose once, from 61 to 129, with units 13 to 34. No sentence changed: they already
  used words the course taught nowhere, and those units revealed it by teaching them. A second, with phase
  4b’s grammar rules: from 129 to 136, the count their merge measured. No sentence changed: a rule now
  teaches, at a later unit, a form an earlier sentence already used.

  ## What changes, against the issue's text

  - « Three exceptions. » becomes « Two exceptions. »
  - « from 129 to the count their merge measures (130 in the replay) » becomes « from 129 to 136, the count
    their merge measured ».
  - The third exception (« A third, with phase 4c, and temporary: … so no learner meets them. ») is removed
    whole, with no sentence in its place, as TESTING.md has none.

  If you would rather keep a trace, one sentence can close the paragraph instead: « Phase 4c had a third,
  temporary one, for the written wrong options and the notes of units 13 to 34; plan 4d wrote them and
  brought both checks back to zero before the release. » The recommendation is the paragraph above, without it.
  ````

  Before writing it, read l. 162 of the issue (`gh issue view 12 --repo dahyousef/Vlaams --json body -q .body`, read
  only). If its text no longer reads « Three exceptions » with « (130 in the replay) » and the « A third, with phase
  4c » sentence, adapt « What changes » to the text found and say so in the task's report. When the plan's author
  read it after the replay (which runs no `gh`), l. 162 held all three, so « What changes » stood as written.

- [ ] **Step 5: Commit.** `git add TESTING.md`, then the commit message of Notes. `git show --stat HEAD`: `TESTING.md |
  9 ++++++---`, `1 file changed, 6 insertions(+), 3 deletions(-)` (the commit against its parent; step 3's 7 and 4
  count against `feca4c0^`; measured at `f19c27b`).

Done when: step 3's four checks print what they say, `<WS>/tmp/spec-12.md` holds step 4's text, and `git show --stat
HEAD` names `TESTING.md` alone. Nothing is on GitHub.

### Task 12: GATE: the learner pass in Edge, and the reading page
Class: gate
Ticket: #12
After: 6, 8, 10, 11
Show: export LEARNER_PASS_CHANNEL=msedge; echo "## build"; sh build.sh 2>&1; git status --short index.html artifact.html 2>&1; echo "## days"; node tools/learner-pass/days.js . 2>&1; echo "## corners"; node tools/learner-pass/corners.js . 2>&1; echo "## sweep"; node tools/learner-pass/sweep.js . 2>&1; echo "## rules"; node tools/learner-pass/rules.js . 2>&1; echo "## reading"; node tools/content/reading.js . "<WS>" 2>&1; echo "## budgets"; node test/content.js . 2>&1 | grep -E "^  (sans leurres|explications|réponse libre|séquence|sourcées|phrases|ids) |contrôles|FAIL|CRASH"
Ask: « Does `## build` of <WS>/tmp/gate-12.md hold one `built …` line and nothing under it? Is there a `PROBLEM:` line in `## days`, `## corners`, `## sweep` or `## rules`, or a line starting `fail ` under `## reading`? Does `## days` end with `THE STUDY DAYS PLAY THROUGH`, `## corners` with `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`, `## sweep` with `EVERY TAP DOES SOMETHING` and `## rules` with `EVERY RULE SHEET OPENS`? Does `## corners` hold 10 `CONVERSATION <id>` blocks, each ending `finished after`, and does `## rules` open with `RULES 22 (`? Under `## reading`, are three kinds listed (`## explanations`, `## explanations-be`, `## open`), and does each kind's count line, `<n> rows: <t> taken, <d> dropped.`, match that kind's rows in the ledger's Batches table: `<n>` the sum of their `Rows`, `<t>` the sum of their `Kept`, `<d>` = `<n>` − `<t>`? Does `## budgets` hold `sans leurres    0 élément(s)`, `explications    0 / `, `réponse libre   <45 + t> tâches, <45 + t> exemples qui cochent tout`, where `<t>` is the `taken` of `## open`'s count line (124 when nothing is dropped), and `séquence        136 / `, and end with a line `<n> contrôles, CONTENU CONFORME`? » The run controller answers it, on the maintainer's behalf (D28), as task 12's « Then » says.
Answer to: Rulings

Why: on 25 October 2026 the maintainer asked for a hands-on learner pass in a real browser before every learner's
check. Plans 4a, 4b and 4c each ended with one, answered by their run controller (D19, D23, D28), and the header asks
the same (« Who rules, and gate 12 »); this is the last before the release (D9), whose pull request quotes its lines.
`## build` rebuilds first: task 10 committed both outputs and task 11 touches `TESTING.md` alone, so a file `git
status` lists means a task left them stale. The four scripts play `index.html` in Edge dressed as an iPhone
(`tools/learner-pass/README.md`), one `PROBLEM:` line per fault, the closing line last; screenshots go to the ignored
`tools/learner-pass/shots/`. No day they play deals an `open` card: `test/content.js` grades every new row (each model
meets every need, each `miss` misses its need alone). `reading.js` is the maintainer's reading list (D15): per kind a
count line, every row read whole (`rule task`, `new also`, ruled) and 1 in 10 of the others. It runs each batch's
Check again (nothing keeps a Check result), so a `fail` line means a kind
changed after its Merge; the count lines must match the Batches table, so the list is the rows that reached `src/`.
The `grep` keeps the eight budget lines, every `FAIL:` line and a `CRASH` line.

Notes:
- **No `## unsentenced`:** `--unsentenced` reads kind `examples`, which this `<WS>` never cuts (`fail examples -: never
  split: run Split first`, exit 1); the 17 words that wait (D14) are `TESTING.md`'s « 17 mots sur 912 ».
- Show needs `tools/learner-pass/node_modules` (the set-up's `npm ci --ignore-scripts` there) and Edge; without them
  the run stops (« Then », first branch). `<WS>` is the absolute path `run.md` gives.
- **What moves with the real rows.** Fixed: what the Ask pins, `explications    0 / 1158`, `séquence        136 /
  1518`, `ids             1154 / 1154`. Moving: the byte counts; the `DAY` lines, cards and days played (from the
  clock); the turns; the sweep's `<n>`; the three count lines (about 34, 80 and 79 rows; `open`'s 13 rule tasks read
  whole); `réponse libre`'s `45 + t`; « besoins manqués », `136 + N` (`N` the needs of the taken open rows); the
  total, `S + 2t + 2N` (`S` task 10 step 1's count, then 2 per taken open row and 2 per need: 16086 + 158 + 328 =
  16572 in the plan's replay; 16084 + 158 + 322 = 16564 on the fix copy's stand-ins).

**The proof.** `<SP2>\f4-sim`: `<SP2>\fixZ` (base `8d12190`, tasks 1, 2, 3, 4, 6, 8, 10 and 11 fixed, `7cf5ad3` last)
with the stand-in commit `038b38a` for the three Merges and playwright-core 1.55.0. Show, whole, one line, in Edge,
`<WS>` a copy of `<SP2>\checks\chk-12-rws` (settled batches of the three kinds; the stand-ins write no rows): 566 s,
`git status --short` empty after; no `PROBLEM:` or `fail ` line, the four closing lines, days 0, 1, 2, 3, 5 with no
`open` card, 10 blocks and 23 `finished after`, `TAPPABLE PER SCREEN (299)`, `RULES 22 (27 chips …)` and 22
`RULE … rows 3 width 390 ok`; and:
```
built (local only) index.html (1096290 bytes), artifact.html (1095676 bytes)
## explanations
4 rows: 4 taken, 0 dropped. Listed: 0 ruled, 1 read whole, 3 sampled of 3 others.
## explanations-be
3 rows: 3 taken, 0 dropped. Listed: 0 ruled, 0 read whole, 3 sampled of 3 others.
## open
4 rows: 4 taken, 0 dropped. Listed: 0 ruled, 2 read whole, 2 sampled of 2 others.
  sans leurres    0 élément(s) de « Comment le dit-on ici ? » (exigé : 0)
  explications    0 / 1158 élément(s) sans explication dans les deux langues (exigé : 0)
  réponse libre   124 tâches, 124 exemples qui cochent tout, 297 besoins manqués un à un
  séquence        136 / 1518 phrases empruntent en avant (budget 136)
  sourcées        1104 phrase(s) sur 695 mot(s), 1016 de Tatoeba créditée(s)
  phrases         110 phrase(s) de Tatoeba dans les unités, 110 créditée(s)
  ids             1154 / 1154 à leur place
16564 contrôles, CONTENU CONFORME
```
The count lines are the workspace copy's. With `open.js` and `open.phrases.js` back to `001a339`'s: `45 tâches, 45
exemples …, 136 besoins …`, `16084 contrôles` (S); t = 79 and N = 161 give 297 and 16564. Without `node_modules`,
`rules.js` exits 1 at once: `Error: Cannot find module 'playwright-core'`, no `PROBLEM:` line. Since this proof
the chain was rebuilt from task 3 (`f19c27b` last); it differs from `7cf5ad3` in `test/tools/fanout.js` alone,
which Show does not run.

Then: a Rulings line for the gate (its question, the answer, « (on the maintainer's behalf) »), and the gate `done`,
except in the first branch:
- **Show cannot start:** `Cannot find module 'playwright-core'`, or Playwright's error naming the `msedge` channel,
  under a script's heading. The set-up is incomplete, not a fault: no subagent, no Rulings line. The run stops, the
  run controller sends the maintainer the error lines (push notification), and the gate stays `in progress`.
- **Every answer as the Ask wants, `réponse libre` holding `45 + t`.** The answer is « nothing ». The Rulings line
  copies the three count lines and the four budget lines, and says that the rows read whole (the 13 rule tasks, every
  `new also`) and the sample stay on the maintainer's reading list (D15): `<WS>/tmp/gate-12.md`'s `## reading`, whose
  path the final report and gate 13's ask give. No script says whether a note is true or a model answer natural.
- **`## build` lists a file.** One task controller (`sonnet`, description `task 12`) commits the two rebuilt files
  alone (`git add index.html artifact.html`), no red test (the build is the check), verified as the fix loop's step 3
  (below); the Rulings line names it; Show again into `<WS>/tmp/gate-12-closing.md`.
- **A script with no closing line, or a missing block** (fewer than 10 `CONVERSATION` blocks, one without `finished
  after`, no `RULES 22 (`); a crash prints only its error. A fault to confirm, as a `PROBLEM:` line, with its last
  lines.
- **A `fail ` line under `## reading`, a count line off its Batches rows, or `réponse libre` other than `45 + t` with
  no `FAIL:` line** (kind `open`). The kind's workspace changed after its Merge; the Rulings line names kind, batch and
  line. By the fix loop (below: step 2's row route, then steps 3 and 4), an implementer on `sonnet` runs `node
  tools/content/merge.js . "<WS>/drafts/<kind>"` in the run's worktree, then `test/content.js`, `test/typed.js`,
  `test/lang.js` and `test/tools/fanout.js`, each alone, and `sh build.sh`, and commits what Merge changed and both
  outputs; Show again into `<WS>/tmp/gate-12-closing.md`. If Merge changes nothing, the Batches row is wrong: no
  commit, and the Rulings line quotes Merge's `ok` line.
- **`## budgets` without its four lines, with `<k> ÉCHEC(S)`, or with no `contrôles` line.** The tree moved after task
  10's verifier. Routed as a `fail` line by the `FAIL:` line's kind: `sans leurres écrits` → task 6
  (`explanations-be`); `sans explication en français et en anglais` → task 8 (`explanations`), task 6 for Flemish ids;
  an open task's line or `HOLLOW_BUDGET` → task 10 (`open`). Anything else (`AHEAD_BUDGET`, `ids`, the credits,
  `CRASH`): no merge here writes it, a fault to confirm, quoted.
- **`PROBLEM:` lines and faults (D28): the fix loop.** One background subagent (`sonnet`, description `task 12`)
  confirms each by hand as `tools/learner-pass/README.md` (« Reading a fault ») says, in at most 10 lines: `harness`
  or `app` and why.
  A `harness` verdict goes in the Rulings line with its reason. An `app` fault is fixed in this run, one at a time:
  1. A test that fails on the old code, first (`CLAUDE.md`), its line quoted; for a fault only a browser sees,
     `test/tools/learner-pass.js` when it is a judge, else the one script's `PROBLEM:` line on the old code.
  2. The fix by the file's owner. A row in place in `<WS>/drafts/<kind>/<batch>/draft.json`, never in the table, then
     `node tools/content/check.js "<WS>/drafts/<kind>/<batch>"` and the kind's Merge again (Check does not re-check a
     reader's `keep`: the Rulings line names the row and its edit). Code in `src/` or `tools/learner-pass/` by an
     implementer on `sonnet`.
  3. `sh build.sh`; the test files the fix touches or names, each alone, green; the one script again, alone: its
     closing line, no `PROBLEM:`. Verified and reviewed as any task (`task-controller.md`), then committed with what
     Merge changed and both outputs.
  4. Show again whole into `<WS>/tmp/gate-12-closing.md` (the run file's `Learner pass:` line), then `-closing-2.md`,
     each answered the same way, until one prints no `PROBLEM:` or `fail ` line and every closing line. A fault that
     survives its second fix needs a decision.
  The Rulings line lists each fault, its verdict and the commit that fixed it.
- **A decision no document holds** (a note whose claim is in doubt, a model answer wrong in a way the rubric cannot
  see, a change to `src/core/` or `src/ui/`, which this plan never changes): not guessed. The run controller writes the
  question in the Rulings line, tells the maintainer with a push notification and carries on: the gate is `done`, the
  fault named in the Rulings line, the final report and when gate 13 is shown.

### Task 13: GATE: the release, phase-4 into main
Class: gate
Ticket: #12
After: 12
Show: git fetch origin main phase-4 2>&1; echo "## refs"; git rev-parse HEAD origin/phase-4d origin/phase-4 origin/main; if git diff --quiet HEAD origin/phase-4; then echo "phase-4d is merged: phase-4 holds this tree"; elif git merge-base --is-ancestor origin/phase-4 HEAD; then echo "phase-4 is in HEAD"; else echo "PHASE-4 MOVED: origin/phase-4 is neither in HEAD nor this tree"; fi; git merge-base --is-ancestor origin/main origin/phase-4 && echo "main is in phase-4" || echo "MAIN MOVED: origin/phase-4 does not hold origin/main"; git status --short; echo "## phase 4's merges"; git log --oneline --first-parent origin/main..dcb0d82; echo "## this plan's commits"; git log --oneline dcb0d82..HEAD; echo "## counts"; git rev-list --count origin/main..HEAD; git diff --stat origin/main...HEAD | tail -1; echo "## outside the content"; git diff --stat=100 origin/main...HEAD -- src/core src/ui src/ex build.sh styles.css; echo "## body"; cat "<WS>/tmp/release-pr.md"
Ask: « For you, not the run controller: open the release PR? » Yes means: the run controller marks this run's pull request (`phase-4d` into `phase-4`) ready unless it is already merged, tells you with a push notification, waits for your word that it is merged, then opens the pull request from `phase-4` into `main` with `## body` as its description. You merge it; that deploys to production. No means nothing is opened and the run's pull request stays a draft. Read first, outside the repo: `<WS>/tmp/gate-12.md` (gate 12's reading list and sample; `<WS>/tmp/gate-12-closing.md` too if gate 12 ran again) and `<WS>/tmp/spec-12.md` (a wording for #12, to apply by hand).
Answer to: Rulings

Why: phase 4 ends with one release (D9, D15). Opening a pull request into `main` is the maintainer's yes and merging
it their own act (CLAUDE.md, « Ask me first »; header « Gate 13 is the maintainer's alone »). It can only follow the
merge of this run's pull request into `phase-4`, so the gate asks once, for both (header call 6).

Notes:
- **Never delegated.** The run controller never answers this gate: D28 does not reach it, and a « go on » given for
  the run is not this yes. Under the header's exception it reads these Notes and « Then », shows
  `<WS>/tmp/gate-13.md` with a push notification and waits. The row stays `in progress` until `gh pr create` prints
  the release pull request's link.
- **The body.** Before Show, one task controller (`sonnet`, description `task 13`) writes `<WS>/tmp/release-pr.md`
  from the template below, each `<…>` filled word for word: from the slot's command, from the ledger for the suite's
  line, from `<WS>/tmp/gate-12.md` (`gate-12-closing.md` if gate 12 ran again) for the rest. It commits, pushes and
  opens nothing, and returns the path and any slot left unfilled, which the run controller names with the Show.
- **What Show reads.** The range is `origin/main..HEAD`, `HEAD` the run's pushed tip; `dcb0d82`, plan 4c's merge,
  splits phase 4's five merges (fixed) from this plan's commits (moving), before the merge and after it. The tree is
  tested first: tested second, a fast-forward would read `phase-4 is in HEAD`. Three-dot diffs leave out what reached
  `main` meanwhile. The fetch (header call 11) writes only `origin/main` and `origin/phase-4`. Outside the content,
  this plan changes one line of `src/ex/index.js` (task 4).
- **No attribution and no local path** in the body, the title or any commit: the repo is public.

The template, word for word (the `<…>` slots aside):

````markdown
## Summary

Phase 4, plans 4a to 4d, into `main`: the course from 12 units to 34, and what each new item needs to be taught.
Plans: `docs/superpowers/plans/` (phase 4a, 4b, 4c, 4d). The learner's check follows this merge (D9).

```diff
 the course
   units 1 to 12
+  units 13 to 34: their words, notes and « on dit aussi » forms          # 4a, #131
+  13 grammar rules, 4 conversations                                      # 4b, #137
+  example sentences, 5 Tatoeba phrases a unit, Flemish forms             # 4c, #143
+  the written wrong options and notes those rows lacked, and an open     # 4d, <#N from gh pr view phase-4d --repo dahyousef/Vlaams --json number -q .number>
+  task for 3 phrases a unit and for each of the 13 rules
```

Outside the content, the app changes in a few places:

```diff
 src/core/srs.js     a session has 30 base places and one more review place per 40 items due, eleven at  # #131
                     most (ADR 0007); a refill counts only the places it frees
 src/core/sync.js    a pull over several pages orders them, so no row falls between two pages            # #131
 src/core/speech.js  what a voice heard is respaced as the target writes it                              # #132
 src/core/gloss.js   a bracket in a meaning leaves the cognate and recall options alone                  # #131
 src/ex/index.js     a capitalised gap gives its capital to the wrong options                            # #132
                     an open task's answer box is marked Dutch                                           # 4d
 src/ui/             the Path opens at the current unit and counts its units; a search draws             # #131
                     at most 60 rows; the summary keeps only the spoken exercises never served
 src/core/fr.js      the Path's title takes the unit count; a search cut at 60 rows says how many more   # #131
 src/core/en.js      the same two texts in English                                                       # #131
 styles.css          the Path scrolls the current unit card into view with a margin above it             # #131
 build.sh            lists the four new content files                                                    # #131
```

`TESTING.md`'s budgets are back to two exceptions. A wording for #12's « Checking » paragraph, to apply by hand, was
proposed to the maintainer with the run.

## Evidence

**The built course plays in a real browser, and the content checks hold.** The learner pass in Edge, on the built
page at <git log -1 --format=%h -- src/>:

- **Before:** `main` at #121, 12 units: none of these rows.
- **After:** no `PROBLEM:` line in any section, no `fail ` line in the reading list.

```text
## build     <gate 12's `built …` line>
## days      THE STUDY DAYS PLAY THROUGH
## corners   10 CONVERSATION blocks, each ending "finished after N spoken turn(s)"
             LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH
## sweep     <gate 12's `TAPPABLE PER SCREEN (<n>)`, without what follows it>, EVERY TAP DOES SOMETHING
## rules     RULES 22 (27 chips on the leerpad; the course lists 22 rules on 27 unit cards)
             EVERY RULE SHEET OPENS
## reading   <gate 12's three count lines under `## reading`, one per kind>
## budgets   <gate 12's eight lines under `## budgets`, as printed>
```

The whole suite on the run's last commit: <the verifier's last line, from the ledger>.

The rows to read whole under D15 (the 13 rule tasks, every new « on dit aussi » form) and the sample were listed for
the maintainer at gate 12, outside the repo.

## Merge Danger

**Door:** one-way for learners, two-way for the code

From the deploy on, learners meet units 13 to 34 and their records for the new items sync to Supabase; a revert
takes the content away, not those records. No storage key, stored field or schema changes.

**Blast Radius:** Production

`main` deploys to Vercel. Session sizes change for every learner (ADR 0007): a backlog of reviews now gets up to
eleven more places.
````

**The proof.** The real clone, read only, no fetch, `origin/phase-4` as `HEAD`: `origin/main` `2a86861` (« Merge
pull request #121 »), `origin/phase-4` `dcb0d82`, both checks hold; merges #143 `dcb0d82`, #137 `7e90be1`, #133
`4d10aa1`, #132 `247a30a`, #131 `f2d9ef9`; `106` commits, `95 files changed, 24794 insertions(+), 628 deletions(-)`,
outside the content `14 files changed, 193 insertions(+), 54 deletions(-)`; no storage key, `displayLang`,
`resetAt`, `ENGINE_EPOCH`, `localStorage`, `indexedDB` or `.from(` in the `src/core src/ui` diff. The template's
lines are the subjects of `3b41a37`, `5eb4ac9`, `ab700c3`, `95d8b6a`, `525ff77`, `6ef726d`, `dfb11b8`, `8a36e34` and
`904692e` (ADR 0007: `d0c6c03`). Then local bare repos only (`<SP2>\f4-gate13`; `work` holds the eight fixed commits
on `dcb0d82`), in seven states. Unmerged: `phase-4 is in HEAD`. Merge commit, squash, rebase, fast-forward:
`phase-4d is merged: …`, then `main is in phase-4` and an empty stat. A commit after the merge: `PHASE-4 MOVED: …`,
and the stat lists it. `main` moved: `MAIN MOVED: …`, in Show and after the yes. Every state: 5 merges, 8 commits,
`114`, `98 files changed, 25345 insertions(+), 1104 deletions(-)`, outside `14 files changed, 194 insertions(+), 55
deletions(-)` (these move with the real rows). The run's branch also holds the plan's own commit: 9 commits, `115`
and 99 files, as in the plan's replay, where a stand-in took its place. Merged but not fetched, the stat listed
the plan's 17 files; fetched, nothing. With `main` moved, two-dot counted 99 files, three-dot 98. The body was not
rendered on GitHub.

Then:
- **Show prints `PHASE-4 MOVED` or `MAIN MOVED`, `## refs`' first two hashes differ, or `git status --short` lists a
  file.** Not asked: the range would hold commits gate 12 never played, or the tip is not what was pushed. The run
  controller sends the maintainer the lines (push notification) and the row stays `in progress`; what to bring in,
  and whether gate 12 runs again, is the maintainer's decision.
- **Yes.** A Rulings line: « For you, not the run controller: open the release PR? » — « yes » (the maintainer). If
  Show printed `phase-4 is in HEAD`, the run controller runs `gh pr ready phase-4d --repo dahyousef/Vlaams`, tells
  the maintainer with a push notification that `phase-4d` into `phase-4` waits for their merge (its link), and waits
  for the maintainer's word that it is merged; if Show printed `phase-4d is merged`, it goes straight to the checks.
  `gh pr view phase-4d --repo dahyousef/Vlaams --json state -q .state` must print `MERGED` (if not, it tells the
  maintainer and waits again); then `git fetch origin main phase-4`; `git merge-base --is-ancestor origin/main
  origin/phase-4` must hold and `git diff --stat HEAD origin/phase-4` print nothing. Then `gh pr create --repo
  dahyousef/Vlaams --base main --head phase-4 --title "Phase 4: units 13 to 34, and what each new item needs"
  --body-file "<WS>/tmp/release-pr.md"`, a push notification with its link, and the row `done`. The run controller
  never merges and never pushes to `main`.
- **After yes, `git merge-base --is-ancestor origin/main origin/phase-4` fails, or `git diff --stat HEAD
  origin/phase-4` lists files.** Something besides this run reached `main` or `phase-4` between the gate and the
  merge. Nothing is opened: the maintainer gets the line or the stat (push notification), and the row stays `in
  progress`.
- **No, or a change.** The Rulings line copies the answer word for word; nothing is opened, the run's pull request
  stays a draft. A change to the body: the task controller rewrites `<WS>/tmp/release-pr.md`, and Show runs again into
  `<WS>/tmp/gate-13-2.md`, asked the same way. Anything else the answer asks for is a new instruction, outside this
  plan.
