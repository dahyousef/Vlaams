# Phase 4c — Sentences, phrases and Flemish forms — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/run-controller.md`, Mode: one session
> (`one-session.md`). A run controller hands one code-lane task at a time to a task controller, runs the drafting
> lane's fan-out tasks beside it, and runs gate 13; do not use a skill's controller loop. Implementers read
> `docs/agents/plan-runs/run-notes.md` before their brief; where the notes and a command here differ, the notes win.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** the third of phase 4's four plans. The 22 new units (13–34) get what units 1–12 have and they lack: an
example sentence or two for each word, taken from Tatoeba, with the missing translation written by the drafter when
Tatoeba has only one (D17); five phrases per unit, from Tatoeba; a generated sentence for each of the 63 words
Tatoeba cannot serve (D25); and the Flemish form of every word and phrase. Tatoeba is re-pinned to the files of
7 November 2026 first. Every row is drafted in the kit's drafting lane and read by a reader that did not write it;
the rows D15 names go on the maintainer's reading list for phase 4's check. The suite is green at the plan's end, and
a learner pass plays the built course in Edge. No explanations, no written wrong options, no open tasks, no release:
plan 4d, and one release and the learner's check close the phase after it (D9).

**Architecture:** the content attaches where units 1–12's does. Sentences go to `src/content/sourced.js` through the
`examples` and `examples-gen` kinds, which exist; task 2 re-pins Tatoeba and lets `examples` keep a sentence with one
translation (D17). Phrases need a new `phrases` kind (task 3) and a new table, `src/content/phrases.a1c.js`, written
whole by its Merge and pushing each phrase into its unit at load, as `grammar.a1c.js` does for rules:
`lexicon.a1c.js` has no re-Merge path. Phrases are held to the words their unit has taught, so they teach nothing new
and `AHEAD_BUDGET` cannot move. Flemish forms go to `src/content/be.js` through the `flemish` kind, whose Split task 4
holds to units 13–34. Then four fan-outs and their merges (tasks 5–12) and gate 13 in Edge. Nothing in `src/core/`
or `src/ui/` changes.

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`; no bundler, no runtime dependency.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`), the tools' suites in `test/tools/`.
- The content kit, `tools/content/`: Split, Check, Merge over one module per kind; Tatoeba's files pinned in
  `tools/content/lib/cache.js` and read from `.cache/`.
- The learner pass, `tools/learner-pass/`, through `playwright-core`, in Edge on this desktop
  (`LEARNER_PASS_CHANNEL=msedge`).
- `gh` for tickets.

**Spec:**
- GitHub issue #12, « New vocabulary every day, English by default, and content to B1 »: « Content strategy », « The
  content factory is run, never deployed », and « Checking ».
- The phase 4 design sitting's decisions (`decisions-2026-10-25.md`: D14, D15, D17, « Phase 4's plans »: « 4c —
  sentences (D17: one translation kept, the other written) for words and ~5 phrases a unit, the generation gate
  (D14), Flemish forms »), and its answer of 28 October 2026 to « phrases for the new units? »: « Add them ».
- The maintainer's decisions D9–D30, stated below. The unit list of plan 4a (`UNITS` in `tools/content/kinds/words.js`).
- `GLOSSARY.md`; ADR 0005 (amended); `ATTRIBUTION.md`.
- The tickets, sub-issues of #12: `#138` (task 1), `#139` (task 2), `#140` (tasks 5, 6, 9, 10),
  `#141` (tasks 3, 7, 8), `#142` (tasks 4, 11, 12). Gate 13 carries none.

## The maintainer's decisions

D9–D20 were taken at the phase 4 design sitting and for plan 4a (25–31 October 2026), D21–D24 for plan 4b
(3 November 2026), D25–D28 for this plan, on 7 November 2026, and D29–D30 on 8 November 2026, each « Yes » to the recommendation.

| D | Answer | Task |
|---|---|---|
| D9 | One tranche finishing A1; one deployment and the learner's check close phase 4, after plan 4d. | — |
| D10 | Themed units after the current 12; the unit list approved at a gate (22 units, n 13–34). | 3, 4 |
| D11 | The Node content kit stays the factory (ADR 0005 amended). | 2–12 |
| D14 | Source, then skip; generate only for the words the maintainer names. | 5, 9 |
| D15 | Read whole: new Flemish forms, sentences written for the course, ruled rows. The rest: 1 in 20, at least 10 per kind (`tools/content/lib/reading.js` samples 1 in 10, which covers it: plan 4a's call 10). D17 adds every written translation. | 2, 3, 5, 7, 9, 11 |
| D16 | Phase 4 is several small plans, each one session with its drafting lane; content plans one after another. | set-up |
| D17 | A Tatoeba sentence with one translation is kept; the drafter writes the other, and each written translation is read whole. Ranking: both translations first, then English only, then French only. | 2, 3, 5, 7 |
| D19 | What can be tested before drafting is tested first: each kind's Split runs on the real course and the real files in its own task, and its counts go in the ledger. | 2, 3, 4 |
| D24 | `AHEAD_BUDGET` may rise a second time, to 136 (plan 4b); « Plan 4c may lower it. » D26 keeps it. | 6 |
| D25 | Generated sentences for the 63 words with no Tatoeba candidate on the files of 7 November (59 of units 13–34; goeiedag, dank u wel, u, amai of units 1–12), listed in task 9's `named.txt`. A word with a candidate that fits none of its sentences waits (D14). | 9 |
| D26 | `AHEAD_BUDGET` stays 136, pinned both ways; task 6 corrects the comment in `test/content.js` that forecasts 4c lowering it. Units 1–12's sentences are not touched. | 6 |
| D27 | Readers on Sonnet for examples, phrases and flemish (`reader model: sonnet` on their `Fan-out:` lines); readers on Opus, the kit's default, for generated sentences. | 5, 7, 9, 11 |
| D28 | This plan's run controller rules on the maintainer's behalf (a row still disputed after its second reader) and answers gate 13; every fault the gate confirms is fixed in the run, except one needing a decision no document holds; the rows D15 names stay on the maintainer's reading list. Mode: one session. | 5, 7, 9, 11, 13 |
| D29 | Flemish forms land in 4c without their written decoys (plan 4d's): task 12 pins `DECOY_BUDGET` in `test/content.js` both ways, as `AHEAD_BUDGET` is, at the count of items with a Flemish form and no decoys after Merge flemish; plan 4d's `explanations-be` Merge lowers it to 0. 4c does not ship, so no learner meets the random options in between. #12 names this rise and D30's as its third exception to « may only ever decrease », temporary (the maintainer, 2026-11-09). | 12, 13 |
| D30 | The new phrases land in 4c without their notes (plan 4d's): task 8 pins `NOTE_BUDGET` in `test/content.js` both ways, as D29 pins `DECOY_BUDGET`, at the count of items with no explanation in both languages after Merge phrases; the printed line shows the budget; plan 4d's `explanations` Merge writes the notes and lowers it to 0. #12 names it with D29's (the third exception). | 8, 13 |

## How far to trust this plan

Every task was written by an agent that proved it on a throwaway copy. Each of the 13 briefs was then read by two
checkers that had not written it: one applied it as an implementer, on a CRLF clone with every earlier task applied;
one read it as a reviewer. The 26 checkers found 12 blocking faults and 95 minor ones. Fixers fixed them in this
text, in run order, and proved each step again on a CRLF clone. A re-check of each fixer's work found 1 more blocking
fault and 14 minor ones, all fixed. The whole plan was then replayed once, from this text, in run order, on a fresh
CRLF clone of `7e90be1`: 13 tasks of 13. The suite ended `TOUTE LA SUITE EST PASSÉE` on the commit of each code-lane
task: 1 (18 min 6 s), 2 (17 min 57 s), 3 (18 min 10 s), 4 (18 min 13 s), 6 (18 min 42 s), 8 (22 min 53 s), 10
(25 min 31 s) and 12 (22 min 51 s). Gate 13's Show ran word for word in Edge: 535 s, no `PROBLEM:` line, its four
closing lines, `RULES 22`, 299 taps on 16 screens, every row of the four kinds taken on the reading page, and
`9107 contrôles, CONTENU CONFORME` with the budgets at 8, 110 and 136. The replay fixed this text in 11 places, none
changing a decision: build sizes and counts set to what it measured, with their state named; three anchors that sat
on words a task leaves to its implementer; task 3's test now reads the copy's credit file, not the repository's; task
4's note on « sans leurres » counts only the items given a form. An Opus self-review then fixed 10
more places, none changing a decision: four words an implementer could not place (two workspace files, an
outline, the replay's word « chain »); a file named wrongly; task 4's missing blank lines; « the closing task » named
as plan 4b's measure names it; D15's « 1 in 20 » quoted as D15 says it; `pack`'s body cut to the rule it follows,
proved on a clone (the kit's test green, and red with `<` for `<=`); and task 10's fix for a wrong generated
sentence, now put in place by an implementer as gate 13's fix loop says, not by the run controller. It raised one
point that is a decision: D29 and D30 raise two budgets from 0, where #12 said such a budget « may only ever
decrease » and named two other exceptions. The maintainer ruled on 2026-11-09: #12 now names both as a third
exception, temporary, which plan 4d returns to 0 before the release.

What the checks found that the writers' own proofs had not, all fixed in this text:
- **A batch that could never pass.** No sentence for « u » could pass Check: the gap rule took no word of one letter.
  So `overleven-kalender` would have failed forever, and task 10 would have merged none of the 63 sentences. Task 2's
  gap rule now takes « u ».
- **A fixture that kept the run's pins.** Task 8's fanout block copied `test/data/ids.tsv` with the run's
  `vragen:p0`–`p4` in it, so step 6 could never turn green in the run. Step 6 now takes those lines out of the copy.
- **A gate question its answerer could not read.** Gate 13 compared each count with the Merge lines in task entries
  the run controller never reads. It now compares them with the Batches table, which the run controller reads.
- **6d fixes sent to the wrong file.** Task 12 sent them to `test/lang.js`; `QUOTE_OK` and `SHARED_OK` now live in
  `test/lib/quoted.js`, and `QUOTE_BUDGET` is gone.
- **A time limit with no rerun.** Task 1's `DÉLAI DÉPASSÉ` line reached no one. The verifier now quotes it, so its
  controller reruns it once.
- **Units 1–12 touched without saying so.** Task 5's Split cuts four words of `overleven` again; the header's Global
  Constraints now name them.

What the replay's figures are not: its fan-out rows were laid out by hand. In examples, 7 rows were real and 543 were
skips. Its counts (543 words with no example sentence, 8 Flemish forms) therefore say nothing of the run's. Every count
a Merge prints is a placeholder or is labelled as the proof's, and the run takes what prints.

What no check here can see: whether a drafter's choice of sentence and its written translation are right. That is
the readers' job, and the maintainer's reading list's (D15, D17): gate 13 shows every written translation whole.

## Set-up decisions

- **Branches.** Phase 4 integrates on `phase-4`. This plan's own commit is on `phase-4c-plan`, cut from
  `origin/phase-4` at `7e90be1`; the set-up creates the run's branch `phase-4c` from `phase-4c-plan`'s tip, so that
  `Base:` is the plan's commit. The run works in the worktree `.claude\worktrees\phase-4c` of the clone at
  `%USERPROFILE%\Desktop\Projects\Vlaams` (`run-notes.md`), pushes with `git push origin HEAD:phase-4c`, and ends in a
  draft pull request from `phase-4c` into `phase-4`, never into `main`.
- **Mode: one session** (D16, D28): 13 tasks, four of them fan-out, one gate.
- **Who rules, and gate 13:** the run controller, on the maintainer's behalf (D28). Gate 13's run controller reads
  that gate's « Then » in the plan: an exception to run-controller.md's « Never read a diff, a report, a brief or
  source code ».
- **Tickets.** Five sub-issues of #12, filed on the maintainer's word on 9 November 2026: #138 (kit), #139
  (Tatoeba), #140 (sentences), #141 (phrases), #142 (Flemish forms); #140 blocked by #139,
  #141 by #139 and #140, #142 by #141.
- **External data.** Tatoeba's six files of 7 November 2026 are kept, decompressed, in the main checkout's
  git-ignored `.superpowers/sdd/phase-4-design/tatoeba-2026-11-07/` (`<TD>` below); Tatoeba rewrites its files
  weekly, so the run never downloads them. Task 2 pins them; from task 2 on, the set-up's
  `node tools/content/fetch.js . tatoeba --from <TD>` fills the run worktree's `.cache/`, and
  `node tools/content/tatoeba.js .` writes the extract every Split of examples and phrases reads. The flemish kind's
  Check verifies `wiktionary:<lemma>` evidence against `.cache/kaikki/belgian.tsv`: the set-up also runs
  `node tools/content/fetch.js . kaikki --from <the main checkout's .superpowers/sdd/phase-4-design/kaikki-2026-11-01>`
  (plan 4a's pinned file) and `node tools/content/kaikki.js .` before task 11's drafters start (they look lemmas up in
  `belgian.tsv`; its Check verifies against it).
- **The learner pass** needs its package (`npm ci --ignore-scripts` in `tools/learner-pass/`) and Edge, which this
  desktop has.
- **D25's list.** The set-up writes `<WS>/drafts/examples-gen/named.txt` beside that kind's `format.md`: the 63 lines
  of task 9's fenced block, verbatim (one word a line, articles kept), before task 9's Split runs. No gate writes it
  in this plan: D25 is the answer.
- **The set-up writes D25–D30 as the ledger's first Rulings lines.**

## Global Constraints

Code:
- `const`, or `let` where it changes; never `var`; no optional chaining (`test/smoke.js`). Arrows for short helpers
  and callbacks, `function` declarations for longer named functions. Existing code is not converted.
- Comments and test messages match the file: French in `src/` and `test/`; English in `tools/content/`'s printed
  lines and in `docs/agents/`.
- Every fix leaves a test that fails on the old code. A refactor's check is the suite staying green; a task says
  which of its steps are refactors.
- A new source file goes in `build.sh`'s `SRC` and in `test/smoke.js`'s file list; a new test file in
  `test/run-all.sh`.

Interface text and stored data:
- This plan adds no interface text. Storage keys and the field names inside stored records keep their spelling.
- Item ids are positions (`<unit>:w<i>`, `<unit>:p<i>`), pinned in `test/data/ids.tsv`: ids are appended, never
  renumbered. The 110 phrase ids are `<unit>:p0` to `<unit>:p4` of each new unit.

Content and its tables:
- From this plan on, `src/content/phrases.a1c.js` and `docs/attribution/tatoeba-phrases.tsv` are written by the
  `phrases` kind's Merge: no hand edit, as for the six tables, `lexicon.a1c.js`, `grammar.a1c.js` and
  `scenarios.a1c.js`.
- Units 1–12's words, phrases and hand-written sentences are not touched, except the four words D25 names, which
  gain a generated sentence, and the four words of `overleven` that task 5's Split cuts again (dag, tot ziens, sorry,
  natuurlijk: skipped in October, with Tatoeba candidates on the files of 7 November), which may gain a sourced
  sentence.
- Sourced and generated sentences and phrases carry no `{naam}`, `{stad}` or `{bedrijf}` token and no default name.
  Every Dutch token is a form OpenTaal knows or `test/data/flemish.tsv` lists with a reason.
- English meanings follow the course's rules: `u`/`uw` with « you » carries « (formal) » or « (informal, Flemish
  u) »; a French verb's English starts with « to »; no two items share an English meaning without a shared French
  sense.
- Tatoeba's files come from `<TD>`, never from a fresh download in the run.

Behaviour:
- `NL.srs.compose()` alone decides what a session contains; no task touches it.
- Progress is reported as counts, never percentages.

Budgets and the build:
- `test/content.js`'s pinned budgets move only as a task says: `AHEAD_BUDGET` stays 136 (D26), `HOLLOW_BUDGET`
  stays as it is; task 8 pins `NOTE_BUDGET` (phrases without their notes until plan 4d, D30) and task 12 pins
  `DECOY_BUDGET` (Flemish forms without their decoys until plan 4d, D29), each both ways at the count its Merge leaves.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with it.

Public repository:
- No personal data in a tracked file; the person is « the maintainer ».

## Review Focus

1. **A sentence whose written translation drifts from its Dutch.**
   - Condition: a Tatoeba sentence with English only; the drafter writes French that says more, or less, than the
     Dutch (a tense, a negation, a « tu » for a « u »).
   - Expected: the row is marked to read whole (`written translation`), its reader confirms the French against the
     Dutch, and it appears on the reading page under its kind.
   - Test: task 2 (examples' Check and `readWhole` in `test/tools/fanout.js`); task 3 for phrases.
2. **A phrase that teaches a word ahead of its unit, or repeats an item.**
   - Condition: a drafted phrase holding a token first taught at a later unit; a phrase whose Dutch is an item's or a
     drill's.
   - Expected: the `phrases` kind's Check refuses it, naming the token and the unit, or the item; `AHEAD_BUDGET`
     stays 136.
   - Test: task 3, the kind's Check tests in `test/tools/fanout.js`.
3. **A phrase meaning that clashes with an item's.**
   - Condition: a drafted phrase whose English equals an existing item's English with no French sense in common, or
     a « you » without its tag.
   - Expected: Check refuses it in its batch, with the line the suite would print, rather than `test/content.js`
     failing at Merge.
   - Test: task 3.
4. **A Flemish batch that cuts units 1–12 again.**
   - Condition: the `flemish` kind's Split on a course where units 1–12 have items with no `be` (267 words and 65
     phrases today: a null answer is not stored).
   - Expected: Split cuts only units 13–34, whole units per batch, at most 80 rows a batch.
   - Test: task 4.
5. **A credit line lost or doubled.**
   - Condition: a sentence with one translation, whose written side has no Tatoeba author; a phrase taken from a
     sentence a word's example already uses.
   - Expected: `tatoeba.tsv` writes `-` in the written language's two columns and names the language in `adapted`;
     each phrase has one line in `tatoeba-phrases.tsv`, and `test/content.js` checks both files both ways.
   - Tests: tasks 2 and 3.

## Run order

```
1. The kit: the verifier's line in a file; a time limit on fanout.js — mechanical — #138 — waits none
2. Tatoeba re-pinned to 7 November; a sentence with one translation — mechanical — #139 — waits none
3. The phrases kind, and an empty phrases.a1c.js — mechanical — #141 — waits 2
4. The Flemish Split held to units 13–34 — mechanical — #142 — waits none
5. FAN examples — fan-out — #140 — waits 2
6. Merge examples — mechanical — #140 — waits 5
7. FAN phrases — fan-out — #141 — waits 3, 6
8. Merge phrases — mechanical — #141 — waits 7
9. FAN examples-gen — fan-out — #140 — waits 6
10. Merge examples-gen — mechanical — #140 — waits 9
11. FAN flemish — fan-out — #142 — waits 4, 8
12. Merge flemish — mechanical — #142 — waits 11
13. GATE: the learner pass in Edge, and the reading page — gate — none — waits 6, 8, 10, 12
```

The code lane runs 1, 2, 3, 4 in plan order, then holds at 6 until FAN examples is `done`. FAN examples starts once
task 2 is done, beside the code lane. FAN phrases starts after 3 and 6 (its Check refuses a phrase that repeats a
drill, so the drills must be merged), FAN examples-gen after 6 (its Split takes the words still without a sentence),
FAN flemish after 4 and 8 (its batches include the new phrases). The code lane holds at 8, 10 and 12 until their
fan-outs are `done`. Two merges never run at once: the code lane is one task at a time.

## How this plan keeps cost down

Plan 4b's run cost 2.45M weighted tokens per code task, against the kit's line of 1.32M. Most of it went on faults
found at Merge or after, each fixed through new rounds (task 4a 8.0M, task 5 4.6M, the closing task 3.9M), and
reading the brief cost 0.87M a task on average. This plan cuts both:
- **Check catches what the suite would** (call 7): a bad row fails in its batch, where its drafter fixes it, not at
  Merge.
- **Real data before drafting** (D19): every Split, count and Format row in the briefs was run on the course and the
  files of 7 November, on a throwaway copy.
- **A short plan**: the briefs carry decisions, not code; this plan is about 227 KB, against plan 4b's 347 KB.
- **Merge tasks are scripted**: Merge, build, the named suites and the counts; no design in them.
- **Fewer, fuller batches** (call 6), and Sonnet readers for examples, phrases and flemish (D27).
- **Task 1**: the verifier writes its result to a file and `fanout.js` stops at a time limit, so no controller reads
  a suite log to find a result and no check hangs.
- **The expected size**: 30 batches (13 examples, 4 phrases, 2 examples-gen, 11 flemish) and 8 code tasks; about
  70–90M weighted and 15–20 hours of run, an estimate from plan 4a's 91.8M (22 words batches at 0.93M, 22
  explanations batches at 1.46M, 8 code tasks at 1.41M), not a measure.
- **The measure after task 3**, as run-controller.md « Measuring » says, is compared with 1.32M per code task. Above
  it, the run controller tells the maintainer the figures (a push notification) and carries on, in place of the kit's
  « stop … before going on » (call 8).

## The run file's lines

```
Mode: one session
Fan-out: task 5 — kind examples — after 2 — Split: node tools/content/split.js . "<WS>/drafts/examples" — Check: node tools/content/check.js "<WS>/drafts/examples/<batch>" — merged by task 6 — reader model: sonnet
Fan-out: task 7 — kind phrases — after 3, 6 — Split: node tools/content/split.js . "<WS>/drafts/phrases" — Check: node tools/content/check.js "<WS>/drafts/phrases/<batch>" — merged by task 8 — reader model: sonnet
Fan-out: task 9 — kind examples-gen — after 6 — Split: node tools/content/split.js . "<WS>/drafts/examples-gen" — Check: node tools/content/check.js "<WS>/drafts/examples-gen/<batch>" — merged by task 10
Fan-out: task 11 — kind flemish — after 4, 8 — Split: node tools/content/split.js . "<WS>/drafts/flemish" — Check: node tools/content/check.js "<WS>/drafts/flemish/<batch>" — merged by task 12 — reader model: sonnet
Gate: task 13 — after 6, 8, 10, 12 — show: export LEARNER_PASS_CHANNEL=msedge; echo "## build"; sh build.sh 2>&1; git status --short index.html artifact.html 2>&1; echo "## days"; node tools/learner-pass/days.js . 2>&1; echo "## corners"; node tools/learner-pass/corners.js . 2>&1; echo "## sweep"; node tools/learner-pass/sweep.js . 2>&1; echo "## rules"; node tools/learner-pass/rules.js . 2>&1; echo "## reading"; node tools/content/reading.js . "<WS>" 2>&1; echo "## unsentenced"; node tools/content/reading.js . "<WS>" --unsentenced 2>&1; echo "## budgets"; node test/content.js . 2>&1 | grep -E "^  (sans leurres|explications|séquence|sourcées|phrases|ids) |contrôles|FAIL|CRASH" — ask: « Does `## build` of <WS>/tmp/gate-13.md hold one `built …` line and nothing under it? Is there a `PROBLEM:` line in `## days`, `## corners`, `## sweep` or `## rules`, or a line starting `fail ` under `## reading` or `## unsentenced`? Does `## days` end with `THE STUDY DAYS PLAY THROUGH`, `## corners` with `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`, `## sweep` with `EVERY TAP DOES SOMETHING` and `## rules` with `EVERY RULE SHEET OPENS`? Does `## corners` hold 10 `CONVERSATION <id>` blocks, each ending `finished after`, and does `## rules` open with `RULES 22 (`? Under `## reading`, are four kinds listed (`## examples`, `## examples-gen`, `## flemish`, `## phrases`), and does each kind's count line, `<n> rows: <t> taken, <d> dropped.`, match that kind's rows in the ledger's Batches table: `<n>` the sum of their `Rows`, `<t>` the sum of their `Kept`, `<d>` = `<n>` − `<t>`? Does `## budgets` end with a line `<n> contrôles, CONTENU CONFORME`? » The run controller answers it, on the maintainer's behalf (D28), as task 13's « Then » in the plan says. — answer to: Rulings
Learner pass: gate 13 plays the branch's last commit. If a gate fix changes src/ after the gate's show, run that show again into <WS>/tmp/gate-13-closing.md before the final report, answer it as the gate's ask says, and give the maintainer both paths.
```

## Calls made while writing, for the maintainer

1. **Phrases come from their own kind and their own file (task 3).** `lexicon.a1c.js` is written whole by the
   `words` kind and has no re-Merge path; a second writer of it would undo the first. `phrases.a1c.js` pushes each
   phrase into its unit at load, as `grammar.a1c.js` does for rules, and throws if the unit is missing. Its credits
   get their own file, `docs/attribution/tatoeba-phrases.tsv`, so no Merge rewrites another kind's file.
2. **Phrases teach nothing new (task 3).** Every token of a phrase is taught at or before its unit. A phrase then
   changes nothing in what each unit teaches, and `AHEAD_BUDGET` cannot move. Measured on the files of 7 November:
   each new unit still has from 29 (team) to 636 (vragen) candidates with both translations, so five per unit,
   exactly, is always possible.
3. **D17's ranking puts the translation class first (task 2).** Before « je », the native speaker, the tile count
   and the id: the fewer written translations, the shorter the maintainer's reading list. Phrases rank
   the same way (task 3): the class first, then the unit's words used, so every unit but team (29) offers 40
   candidates with both translations, where words-first left 32 English-only ones in mensen's 40.
4. **Phrases are drafted after examples are merged (task 7).** So Check can refuse a phrase that repeats a drill.
5. **The Flemish Split is held to units 13–34 (task 4)** rather than storing null answers for units 1–12: storing
   them would mean writing 332 entries into `be.js` that no row backs.
6. **Batch sizes.** Examples keep 40 rows a batch (phase 3's size); flemish packs whole units up to 80 rows (11 batches of the 715 rows, where 64 would make 18); phrases
   6 units a batch. Fewer, fuller batches carry less fixed overhead per row (plan 4b: 1.11M weighted tokens a batch
   for one or two rows).
7. **Each kind's Check mirrors the suite's guards its rows can trip (tasks 2, 3, 4).** A bad row fails in its batch,
   where a drafter fixes it, rather than at Merge, where plan 4b's faults cost new rounds (task 4a 8.0M, task 5
   4.6M weighted).
8. **Over the cost line, the run reports and carries on.** The kit's « Measuring » stops a run whose average after
   three tasks is above 1.32M; this plan's run controller tells the maintainer and goes on (« How this plan keeps cost
   down »), as the maintainer said on 2026-10-19 that token cost is not a reason to stop.

Left out of this plan, for the maintainer:
- **Explanations, written wrong options, open tasks** (for the 13 rules and the new phrases), **the release**: plan 4d.
- **Units 1–12's 136 borrowing sentences** (D26): unchanged.
- **Words a drafter skips** although Tatoeba has candidates: they wait (D14); task 13 lists them.
- **Units 13–34's `null` Flemish answers** are not stored: the next unnamed `flemish` Split cuts them again (task 11);
  the plan that runs it stores them or narrows `OWN` first.
- **Tickets' labels**: all five carry `needs-triage`.

## The run

### Task 1: The kit: the verifier's line in a file; a time limit on fanout.js
Class: mechanical
Ticket: #138
Promises: none
Why: Q4 (7 November 2026): both kit fixes, as one task. (1) In plan 4b's run, three of the ten verified code-lane
tasks (7, 7a and the closing task) record in the ledger the controller reading `tmp/suite.txt` itself because the
Haiku verifier stopped without its `VERIFIER:` line. The verifier now opens `<WS>/tmp/verifier.txt` with a line
`verifying <commit>`, then writes its whole return there under a line `verified <commit>`; the task controller reads
that file when the return lacks the line, and takes it only when its first line is `verified` with the commit it gave
(the file outlives each verifier, so an earlier one's, or a cut-off one's, must be told from a result). (2) One
`node test/tools/fanout.js .` of plan 4b hung over 10 minutes « in the mots block's check.js »; the rerun took 34 s;
the cause stays unproven after reading the file (no timeout on its three `spawnSync` sites; the HTTP server closed
after use; the sandbox synchronous; the `node_modules` copy 2.4 s, measured). So the approved time limit alone. A
timer cannot carry it: `spawnSync` blocks the event loop (a 200 ms `setTimeout` fired only after a 1.5 s `spawnSync`
returned, measured), and the hang sat in a `spawnSync`. The file therefore respawns itself as a child under
`spawnSync`'s `timeout`, which kills it from outside: past the limit, one named French line, exit 1. That line holds
no `FAIL`, so the verifier searches for it by name, and the task controller dispatches a new verifier once (the limit
says nothing of the commit). A check of `test/hooks.js` runs the file under a 1 ms limit. The change sits in 15 lines
after the `spawnSync` require, before anything else runs: tasks 2, 3 and 4 add blocks lower in the same file.

Files:
- Modify: `docs/agents/plan-runs/verifier.md` (a paragraph before the steps; step 4's last bullet; « Your final message »)
- Modify: `docs/agents/plan-runs/task-controller.md` (« Waiting », first bullet; « The steps », step 3)
- Modify: `docs/agents/plan-runs/run-notes.md` (« Tests », one bullet)
- Modify: `test/tools/fanout.js` (15 lines after `const { spawnSync } = require('child_process');`)
- Modify: `TESTING.md` (the rows `hooks.js` and `tools/fanout.js`)
- Test: `test/hooks.js` (four checks after the « Write no `VERIFIER:` line » check, then the limit's check; its header comment)

Interfaces:
- Consumes: `test/hooks.js`'s `oneLine(f)`, `tc`, `env`, `ROOT`, `path` and `spawnSync`; `child_process.spawnSync`'s
  `timeout` option, which on this machine (Node 24.22.1, Windows) returns `status: null, signal: 'SIGTERM',
  error.code: 'ETIMEDOUT'` after the limit.
- Produces: the file `<WS>/tmp/verifier.txt` (first the line `verifying <commit>`, then line 1 `verified <commit as the
  dispatch gave it>` and the verifier's final message); in `test/tools/fanout.js` the env `FANOUT_LIMIT` (seconds,
  default 300) and `FANOUT_CHILD` (the respawned child's marker), and the line
  `DÉLAI DÉPASSÉ : test/tools/fanout.js n'a pas fini en <N> s ; à relancer` with exit 1; in `verifier.md` that line
  among the failing lines; in `task-controller.md` the rule that a `fail` whose lines hold `DÉLAI DÉPASSÉ` gets one
  new verifier.

Notes:
- **The limit.** A full run takes about 24 s on the proof copy (622 checks), with the wrapper too; 300 s is twelve
  times that, under the 10 minutes observed, and leaves room for CI. `FANOUT_LIMIT=5` is how the limit is tried by
  hand, and `test/hooks.js` sets `0.001`. A child killed after seconds leaves its `vlaams-fanout-*` folder in the temp
  directory and the hung grandchild, if any; the comment says so. `test/run-all.sh` has `set -e`: exit 1 ends the
  suite there.
- **Prose widths.** The doc paragraphs wrap at the width of their neighbours (about 115 signs); the hooks.js regexes
  read the pages through `oneLine`, so the wrapping is free, but the regexes' `[^.]*` spans forbid a period between
  their two ends: keep the sentences exactly as given.
- **French in `test/`, English in `docs/agents/`**; the env names follow `PACE_DAYS` (English).
- **The proof.** Copy `%USERPROFILE%\AppData\Local\Temp\claude\a7917b01ac072e1a\8bf7ef00-9f92-425a-8160-86aec667d00b\scratchpad\proofs\fixZ`
  (CRLF clone), base `e40965e` (= `7e90be1`), this task its commit `f002703` (`task 1 (fixed)`), exported to
  `parts/patches/task-1.fixed.patch`; each step applied from this text. Step 1: `4 CHECK(S) FAILED`, exit 1, 30.4 s.
  Step 2: `ALL CHECKS PASSED`, exit 0. Step 3: `1 CHECK(S) FAILED`, exit 1, 54.5 s; the `.sh` on the old file 24.3 s,
  `622 contrôles, KIT CONFORME`, `exit=0`, no `DÉLAI` line. Step 4: the `.sh` 5.1 s, `DÉLAI DÉPASSÉ …`, `exit=1`
  (one `vlaams-fanout-*` folder left; the 1 ms cut of `test/hooks.js` leaves none); `node test/tools/fanout.js .` exit 0,
  24.0 s, no `FAIL`; `node test/hooks.js .` `ALL CHECKS PASSED`, 30.4 s. Step 6: the stat below. The full suite was not run.

- [ ] **Step 1: The hooks checks, red.** In `test/hooks.js`, directly after the line
  `ok(/Write no \`VERIFIER:\` line before step 4/.test(oneLine('verifier.md')), 'verifier.md n\'écrit sa ligne qu\'à la fin');`
  insert:
  ```js
  // Le vérificateur laisse son retour dans un fichier avant de le rendre, et son contrôleur le lit là quand le retour n'a
  // pas sa ligne : en plan 4b, trois vérificateurs sur dix ont rendu la main sans elle, et leurs contrôleurs ont lu tmp/suite.txt.
  ok(/with the one line `verifying <commit>`/.test(oneLine('verifier.md')) && /goes first to `<WS>\/tmp\/verifier\.txt`[^.]*`verified <commit>`/.test(oneLine('verifier.md')), 'verifier.md ouvre tmp/verifier.txt sur « verifying », puis y écrit son retour sous le commit vérifié');
  ok(/stopped without that line, read `<WS>\/tmp\/verifier\.txt`[^.]*\. When its first line is `verified <the commit you gave it>`/.test(tc), 'task-controller.md lit tmp/verifier.txt quand le retour n\'a pas sa ligne, et vérifie le commit');
  ok(/`DÉLAI DÉPASSÉ`[^.]*dispatch a new verifier with a new wait, once/.test(tc), 'task-controller.md relance le vérificateur, une fois, quand fanout.js a passé sa limite de temps');
  ok(/Search the file for `FAIL` and for `DÉLAI DÉPASSÉ`/.test(oneLine('verifier.md')), 'verifier.md relève la ligne DÉLAI DÉPASSÉ, que FAIL ne trouve pas');
  ```
  In the header comment, replace the three lines from `   sorties du build avant de vérifier l'arbre. Le texte du kit`
  to `   la fin de la suite. On lance les commandes telles que Claude Code les lance. */` with:
  ```
     sorties du build avant de vérifier l'arbre et laisse son retour dans un fichier que son contrôleur lit. Le texte
     du kit ne porte aucun caractère de contrôle, et sa commande de lancement nomme claude.exe en entier. Le kit dit
     comment un agent en attend un autre, wait-suite.sh attend la fin de la suite, et fanout.js s'arrête à sa limite
     de temps. On lance les commandes telles que Claude Code les lance. */
  ```
  Run `node test/hooks.js .`. Expected, exit 1, ending:
  ```
    FAIL: verifier.md ouvre tmp/verifier.txt sur « verifying », puis y écrit son retour sous le commit vérifié
    FAIL: task-controller.md lit tmp/verifier.txt quand le retour n'a pas sa ligne, et vérifie le commit
    FAIL: task-controller.md relance le vérificateur, une fois, quand fanout.js a passé sa limite de temps
    FAIL: verifier.md relève la ligne DÉLAI DÉPASSÉ, que FAIL ne trouve pas

  4 CHECK(S) FAILED
  ```

- [ ] **Step 2: The pages.** In `verifier.md`, directly before the line `Your dispatch names the run file and the
  commit to verify. In the worktree named in \`<WS>/run.md\`:` insert this paragraph and a blank line:
  ```
  Write `<WS>/tmp/verifier.txt` first, with the one line `verifying <commit>`, the commit as your dispatch gave it
  (Read the file first when it exists: the Write tool refuses to overwrite a file it has not read). It ends an earlier
  verifier's file, so your controller never takes that one for yours.
  ```
  In its step 4, replace the bullet's two lines from `   - Anything else is a fail, a test that crashed included`
  to `     the failing lines.` with:
  ```
     - Anything else is a fail, a test that crashed included (`exit=134` or `139`). Search the file for `FAIL` and for
       `DÉLAI DÉPASSÉ` to find the failing lines: the second is `test/tools/fanout.js`'s time limit, and its line goes in
       your return as it stands, so that your controller reruns you instead of opening a fix round.
  ```
  Replace the line `Your final message, at most 10 lines:` with:
  ```
  Your final message, at most 10 lines, goes first to `<WS>/tmp/verifier.txt`, written with the Write tool over your
  `verifying` line: a first line `verified <commit>`, the commit as your dispatch gave it, then the lines below. Then
  return the same lines. Every return goes through the file, those of steps 1 and 2 included: in plan 4b's run three
  verifiers of ten handed back without their line, and their controllers read the suite's file instead; now they read
  this one.
  ```
  In `task-controller.md`, « Waiting », first bullet, replace `If it has stopped without that line, send it on with`
  and the next line `  \`SendMessage\`.` with:
  ```
  If it has stopped without that line, read
    `<WS>/tmp/verifier.txt`: the verifier writes its return there before sending it. When its first line is
    `verified <the commit you gave it>`, the `VERIFIER:` line under it is the result, as if returned. Otherwise
    (`verifying <commit>`, another commit, or no file) the verifier gave no result: send it on with `SendMessage`.
  ```
  (the first fragment stays on the line that begins `  background work, is not a result either: wait on.`). In step 3
  of « The steps », replace `   lines, unless it says \`suite cut off\` or \`a suite still runs\` (« Waiting »).` with:
  ```
     lines, unless it says `suite cut off` or `a suite still runs` (« Waiting »), or its failing lines hold
     `DÉLAI DÉPASSÉ` (the kit's suite ran past its time limit, which says nothing of the commit): dispatch a new
     verifier with a new wait, once; a second time on the same commit, return `needs ruling` with the line.
  ```
  In `run-notes.md`, « Tests », after the bullet ending `a verifier runs it after your commit.` add:
  ```
  - `DÉLAI DÉPASSÉ` printed by `node test/tools/fanout.js .` is its time limit (300 s), not your change: run it once
    more. A second one on the same tree is your change: stop with `BLOCKED` and the line.
  ```
  Run `node test/hooks.js .`. Expected, exit 0, last line: `ALL CHECKS PASSED`.

- [ ] **Step 3: The limit, red.** In `test/hooks.js`, directly after step 1's four checks, insert:
  ```js
  // La limite de temps de test/tools/fanout.js : relancé sous un délai d'un millième de seconde, il imprime sa ligne et sort en 1.
  const cut = spawnSync(process.execPath, [path.join(ROOT, 'test/tools/fanout.js'), ROOT], { encoding: 'utf8', env: Object.assign({}, env, { FANOUT_LIMIT: '0.001' }) });
  ok(cut.status === 1 && /^DÉLAI DÉPASSÉ : test\/tools\/fanout\.js n'a pas fini en 0\.001 s ; à relancer$/m.test(cut.stdout), 'fanout.js coupe son passage à sa limite de temps et le dit');
  ```
  Run `node test/hooks.js .`. Expected, exit 1, about a minute (the old file runs whole inside the check), ending:
  ```
    FAIL: fanout.js coupe son passage à sa limite de temps et le dit

  1 CHECK(S) FAILED
  ```
  In a `.sh` file under `<WS>/tmp/` (the env prefix needs `sh`), run
  `FANOUT_LIMIT=5 node test/tools/fanout.js .; echo "exit=$?"`. Expected on the unchanged file: about 24 s, last lines
  `622 contrôles, KIT CONFORME` then `exit=0`, and no line starting `DÉLAI`.

- [ ] **Step 4: The limit.** In `test/tools/fanout.js`, directly after `const { spawnSync } = require('child_process');`
  insert:
  ```js
  /* La limite de temps. En plan 4b, un passage est resté plus de dix minutes dans le lot words, dans un check.js que
     spawnSync attendait ; relancé, il a passé en 34 s, et la cause reste inconnue. Un minuteur ne couperait rien :
     spawnSync bloque la boucle d'événements, et aucun minuteur ne tire avant son retour (mesuré sous Node 24 : un
     setTimeout de 200 ms tire après un spawnSync de 1,5 s). Le fichier se relance donc lui-même en enfant, sous le délai
     de spawnSync, qui le tue de l'extérieur : passé le délai, une ligne nommée, sortie 1, et un contrôleur relance la
     commande. Un passage entier prend 24 s sur ce poste (mesuré deux fois, 24,1 s et 24,0 s) ; la limite est 300 s, et
     FANOUT_LIMIT=<secondes> la change, pour l'essayer. Un enfant tué laisse son dossier vlaams-fanout-* dans le dossier
     temporaire, et le check.js qui le bloquait. */
  const LIMIT = Number(process.env.FANOUT_LIMIT) || 300;
  if (!process.env.FANOUT_CHILD) {
    const child = spawnSync(process.execPath, [__filename].concat(process.argv.slice(2)),
      { stdio: 'inherit', timeout: LIMIT * 1000, env: Object.assign({}, process.env, { FANOUT_CHILD: '1' }) });
    if (child.error && child.error.code === 'ETIMEDOUT') console.log('DÉLAI DÉPASSÉ : test/tools/fanout.js n\'a pas fini en ' + LIMIT + ' s ; à relancer');
    process.exit(child.status === null ? 1 : child.status);
  }
  ```
  Run step 3's `.sh` file again. Expected: about 5 s, the file's first blocks, then
  `DÉLAI DÉPASSÉ : test/tools/fanout.js n'a pas fini en 5 s ; à relancer` and `exit=1`.
  Run `node test/tools/fanout.js .`. Expected, exit 0, about 24 s, first line `KIT DE RÉPARTITION`, last line
  `622 contrôles, KIT CONFORME`. Run `node test/hooks.js .`. Expected, exit 0, last line: `ALL CHECKS PASSED`.

- [ ] **Step 5: TESTING.md.** In the `hooks.js` row, replace
  `` `verifier.md` remet les sorties du build avant de vérifier l'arbre,`` with
  `` `verifier.md` remet les sorties du build avant de vérifier l'arbre et laisse son retour dans `tmp/verifier.txt` sous le commit vérifié, que `task-controller.md` lit quand le retour n'a pas sa ligne,``,
  and `` les scripts `.sh` restent en LF`` with `` `tools/fanout.js` coupe son passage à sa limite de temps, les scripts `.sh` restent en LF``.
  In the `tools/fanout.js` row, replace its ending `` puisque Merge ne lit pas l'ancien) |`` with
  `` puisque Merge ne lit pas l'ancien) ; et le fichier se relance en enfant sous une limite de temps (300 s ; `FANOUT_LIMIT=<s>` la change), passée laquelle il imprime `DÉLAI DÉPASSÉ` et sort en 1 |``.

- [ ] **Step 6: Commit.** `git add TESTING.md docs/agents/plan-runs/run-notes.md docs/agents/plan-runs/task-controller.md docs/agents/plan-runs/verifier.md test/hooks.js test/tools/fanout.js`;
  `git commit -m "chore(kit): the verifier's return in tmp/verifier.txt; a time limit on test/tools/fanout.js (#138)"`.
  Expected `git show --stat HEAD`: 6 files changed, 52 insertions(+), 12 deletions(-).

Done when: `node test/hooks.js .` ends `ALL CHECKS PASSED`; `node test/tools/fanout.js .` ends `622 contrôles, KIT CONFORME`
with exit 0; the `.sh` file of step 3 ends `DÉLAI DÉPASSÉ : test/tools/fanout.js n'a pas fini en 5 s ; à relancer` and
`exit=1`; `git status --short` prints nothing.

### Task 2: Tatoeba re-pinned to 7 November; a sentence with one translation
Class: mechanical
Ticket: #139
Promises: none
Why: D17 (a Tatoeba sentence with one translation is kept, the drafter writes the other, each written translation is
read whole: D15), D19 (Split runs on the real files before drafting) and the header's calls 3 and 7. The six pins of
22 October in `tools/content/lib/cache.js` no longer match what Tatoeba serves (step 1). `tools/content/tatoeba.js`
keeps a Dutch sentence only when it links to **both** an English and a French sentence: 36 822 on the files of
7 November, against 162 245 with either (step 2). The rank puts the translation class first, before `je`, the native
speaker, the tiles and the id: the fewer written translations, the shorter the maintainer's reading list (call 3).
**Check mirrors the suite** (call 7). Every guard a sourced sentence can trip is already in Check, `RULES`, Split (a
word with drills is not cut) or Merge's `credit()`: `test/content.js` 1, 2, 3, the sourced block and 6; `test/lang.js`
6d.7. Not read by any suite for a sentence: 6d.3 (`fieldOf` resolves no field for `drills[i].fr`) and `bySense` (items'
meanings only); the `u`/`uw` tag is read on a sentence only when its `en` already carries one (`test/content.js`,
« Toute autre ligne du cours »), which `RULES` refuses. Four guards were missing, and go into `RULES` (so
`examples-gen` gets them too): « hoe lang » (#128), the article before the drilled noun (`test/dehet.js` 2),
`test/lang.js` 6d.4 (plan 4b's task 4a met it only at Merge: `dutchWords` reads every merged `nl`) and the register tag.
The gap rule also takes a one-letter tile of the word itself (« u », « dank u wel », task 9), which `tokens` drops and
the suite's gap check accepts. `examples-gen`'s Check refuses, as task 9's Format and the kit's other kinds do, a
straight quote in `fr` and two sentences in `nl`.

Files:
- Modify: `tools/content/lib/cache.js` (the six `tatoeba/…` pins)
- Modify: `tools/content/tatoeba.js` (`extract`, `load`, `rank`; the header comment)
- Modify: `tools/content/kinds/examples.js` (`check`, `credit`, `readWhole`, `RULES`, a new `bareOf`; the header),
  `tools/content/kinds/examples-gen.js` (`check`; the header)
- Modify: `docs/attribution/tatoeba.tsv` (the header comment only: Merge keeps `#` lines), `ATTRIBUTION.md` (« Tatoeba —
  phrases d'exemple »), `TESTING.md` (the `content.js` and `tools/sources.js` rows), `tools/content/lib/reading.js`
  (`INTRO`: the reading list names the translations it lists whole)
- Test: `test/tools/sources.js`, `test/tools/fanout.js` (the cache, examples and reading blocks), `test/content.js` (the
  credit checks)

Interfaces:
- Consumes: `test/lib/dutch` (`dutchWords`, `courseWords`), `test/lib/quoted` (`QUOTED_FIELDS`, `HTML_FIELDS`, `names`,
  `bareDutch`), `test/lib/tree` (`visitCourse`), `NL.content.fill`; `cache.fetch`'s `from`; `tatoeba.KEYS` order.
- Produces: `cache.PINS` six `tatoeba/…` entries dated `2026-11-07` (table in step 2). `tatoeba.extract` keeps a Dutch
  sentence linked to an English **or** a French sentence; an extract line's eng or fra column may be empty, and `load`
  reads it as `[]` (`ids = s => (s ? s.split(',').map(Number) : [])`); a candidate may have `en: []` or `fr: []`;
  `rank` sorts by `cls(a) - cls(b) || je(a) - je(b) || native || tiles || id` with `cls = c => (c.en.length &&
  c.fr.length ? 0 : c.en.length ? 1 : 2)`. In `examples.js`, a sentence's `enSrc` (`frSrc`) may be `null`. The new
  reasons of `check`, `RULES` and `examples-gen`'s `check`: exactly the strings step 3's assertions expect. `credit()`
  writes `-\t-` for a written side and its language in `adapted` (`en`, `fr`, `en fr`). `readWhole`: `'written
  translation'` when any sentence has a null side, else `'edited translation'` when any has `edited`, else `''`.
  `bareOf(C, repo)` → `{ dutch: Set, bare: Map word → where }`, memoised in `seen()` as `v.bare`.

Notes:
- Comments French in `tools/content/` and `test/`; printed lines and Check reasons English. Nothing under `src/`: no
  build, `index.html` and `artifact.html` unchanged.
- The candidates of units 1–12's four skipped words (dag, tot ziens, sorry, natuurlijk) are cut again: wanted (Global Constraints, « Units 1–12's words »).
- `test/content.js`'s new credit guard reads the real file, which holds no written side yet; it is a guard for the
  Merges of tasks 6 and 10, so its check is planted (the file's `decoyFaults` pattern): three planted rows give exactly 4
  faults. Its red is in `fanout.js` (`credit()` writing `-` and `fr`), not here.
- Task 1 edits `TESTING.md`'s `tools/fanout.js` row; this task does not touch that row.
- **The proof.** Copy `%USERPROFILE%\AppData\Local\Temp\claude\a7917b01ac072e1a\8bf7ef00-9f92-425a-8160-86aec667d00b\scratchpad\proofs\fixZ`
  (CRLF clone; base `e40965e` = worktree `7e90be1`, task 1 `f002703`, this task `c426128`, patch
  `parts/patches/task-2.fixed.patch`, 11 files, +200 −72), every step applied from this text. Every line quoted below
  was printed there, and step 8's counts by `scratchpad/fixZ-tmp/t2-s8-count.js` over the 13 `input.json` files.

- [ ] **Step 1: The pins' red.** In the worktree root, after the set-up's `--from`:
  `node tools/content/fetch.js . tatoeba --from "<TD>"` prints six `fail` lines and exits 1, the first:
  `fail tatoeba/eng_sentences_detailed.tsv: sha256 c9bf156a539d…, pinned 411dc55ab184… on 2026-10-22: the source changed, and the pin is to redo in a task`,
  and the same line for the five other files, each with its new sha prefix (step 2's table) and its old one.
  `.cache/tatoeba/` is left empty.

- [ ] **Step 2: The six pins.** In `test/tools/fanout.js`, cache block, after the line ending
  `'tatoeba désigne ses six fichiers');`:
  ```js
    same(require(path.join(ROOT, 'tools', 'content', 'tatoeba')).KEYS.map(k => cache.PINS[k].date + ' ' + cache.PINS[k].bytes),
      ['2026-11-07 19573559', '2026-11-07 198969137', '2026-11-07 76213829', '2026-11-07 2746200', '2026-11-07 992641', '2026-11-07 2435399'],
      'tatoeba : les six fichiers du 7 novembre 2026, par leur date et leur taille');
  ```
  `node test/tools/fanout.js .` prints
  `FAIL: tatoeba : les six fichiers du 7 novembre 2026, par leur date et leur taille : ["2026-10-22 19557176",…` and ends
  `623 contrôles, 1 ÉCHEC(S)`, exit 1. Then in `tools/content/lib/cache.js`, the six `tatoeba/…` entries of `PINS` keep their `url` (and
  `member`) and take `date: '2026-11-07'` with these `bytes` and `sha256`:

  | key | bytes | sha256 |
  |---|---|---|
  | `tatoeba/eng_sentences_detailed.tsv` | 198969137 | `c9bf156a539da9047818f4dc9544a9da6272f8d3df7ab7bc589622f242a32504` |
  | `tatoeba/fra_sentences_detailed.tsv` | 76213829 | `7c1f4b55ba12f8724f98510e2cfcd2de60c8649973b6384cb965092604e3f7f3` |
  | `tatoeba/nld-eng_links.tsv` | 2746200 | `11cbbb31daa29afd576eba39bc30a16c5beb62f13d5a2504163d695f58f123dc` |
  | `tatoeba/nld-fra_links.tsv` | 992641 | `efb18932e9abd6da10acc9d6d16ed23d7b37d42b864c4b428ce0267502beb81d` |
  | `tatoeba/nld_sentences_detailed.tsv` | 19573559 | `02c745fc5bac63e035961b16f1a38f07f6d26241e558a55248442753dcf46a68` |
  | `tatoeba/user_languages.csv` | 2435399 | `c43d653c044704d726126ae2aba563329a8d1f22fd383e79c983aebec64388f0` |

  Run the step 1 command again: exit 0 and six lines, the first
  `ok tatoeba/eng_sentences_detailed.tsv 198969137 bytes, sha256 c9bf156a539d…`, the last
  `ok tatoeba/user_languages.csv 2435399 bytes, sha256 c43d653c0447…`. Then `node tools/content/tatoeba.js .` (about 3 s)
  prints, on the old `extract`: `ok .cache/tatoeba/extract.tsv 36822 Dutch sentences, 41683 English, 42279 French`;
  after step 4 it prints exactly `ok .cache/tatoeba/extract.tsv 162245 Dutch sentences, 144103 English, 54891 French`
  (run it again then).

- [ ] **Step 3: The tests, red.** In `test/tools/sources.js`, section 2: `extract` returns `{ nld: 24, eng: 25, fra: 22 }`;
  the check on `/^(nld\t(15|23)|eng\t231)\t/` becomes, on `/^(nld\t(15|23)|eng\t231|fra\t236)\t/`,
  `['nld\t15\tann\t1\tDe bakker is er.\t151\t', 'nld\t23\tann\t1\tDe bakker is weg.\t231\t', 'eng\t231\tcy\tThe baker is gone.']`
  (a sentence with one translation is kept, the other column empty; the link to the deleted 236 falls, 23 stays on its
  English); `load`: `T.nld.size` 24 and `T.nld.get(15).fra` is `[]`; the rank of `de bakker` is `[10, 18, 12, 22, 11, 15]`
  (15, English only, last although native with 4 tiles), its `[5]` is
  `{ id: 15, nl: 'De bakker is er.', owner: 'ann', en: [{ id: 151, text: 'The baker is here.', owner: 'cy' }], fr: [], tiles: 4 }`,
  and with `known` the rank is `[18, 12, 22, 11, 15]`; the section's line becomes
  `  tatoeba        24 phrases sur 24 gardées, 2 à une seule traduction, auteurs et langue maternelle lus, classement sur 4 mots`.
  In `test/tools/fanout.js`, examples block: the extract gains `'nld\t107\tanna\t1\tMisschien is het nu waar.\t207\t'`,
  `'nld\t108\tanna\t1\tSpreekt u goed Engels?\t\t308'`, `'eng\t207\tbob\tMaybe it\'s true now.'`,
  `'fra\t308\tdora\tParlez-vous bien anglais ?'`; `engels.candidates` ids are `[101, 102, 106, 108]`, `[3]` is
  `{ id: 108, nl: 'Spreekt u goed Engels?', owner: 'anna', en: [], fr: [{ id: 308, text: 'Parlez-vous bien anglais ?', owner: 'dora' }], tiles: 4 }`;
  then, a new check after the `engels.candidates` one:
  `same(input[0].candidates.map(c => c.id), [104, 107], 'misschien : 107, sans traduction française, est candidate après 104');`.
  After the `edited sans traduction changée` check:
  ```js
    const written = { src: 108, nl: 'Spreekt u goed Engels?', gap: 'Engels', en: 'Do you speak English well?', enSrc: null, fr: 'Parlez-vous bien anglais ?', frSrc: 308 };
    same(why([written]), [], '…');
    same(why([as({ enSrc: null })]), ['sentence 1: enSrc is null, but Tatoeba links 202, 203 to 102: take one'], '…');
    same(why([Object.assign({}, written, { frSrc: null })]), ['sentence 1: enSrc and frSrc are both null: a sentence keeps at least one translation Tatoeba links'], '…');
    same(why([Object.assign({}, written, { edited: 'x' })]), ['sentence 1: edited is for a translation that is not Tatoeba\'s, and the linked one is'], '…');
    same(why([Object.assign({}, written, { fr: 'Vous parlez bien anglais ?', edited: 'a plain question' })]), [], '…');
  ```
  `readWhole` of `[good, written]` and of `[as({ edited: 'x' }), written]` is `'written translation'` both. Before the
  `rien d'une unité ultérieure` check (`Misschien spreekt ze Engels.`):
  ```js
    same(rules({ nl: 'Spreekt u ook Frans?', gap: 'u' }, 'ikengij:w2'), [], 'le trou du mot « u », une seule lettre');
    same(rules({ nl: 'Dank u wel, tot ziens!', gap: 'u' }, 'overleven:w5'), [], 'le trou « u » dans « dank u wel »');
    same(rules({ nl: 'Spreekt u goed Engels?', gap: 'u' }), ['s: gap « u » is not the word, one tile as nl writes it, that the cloze can hide'], 'mais pas une lettre qui n’est pas le mot');
  ```
  After the `les mêmes chiffres` check:
  ```js
    same(rules({ nl: 'Hoe lang is het weekend?', gap: 'weekend' }, 'weekend:w7'), ['s writes « hoe lang »: the course writes the duration « hoelang » (#128)'], '…');
    same(rules({ nl: 'De Engels is goed.', gap: 'Engels' }), ['s: « de engels » contradicts the article « het » of the word (test/dehet.js)'], '…');
    same(K.RULES({ nl: 'De teams zijn hier.', gap: 'teams', en: 'The teams are here.', fr: 'Les équipes sont ici.' }, 's',
      { id: 'bakker:w99', kind: 'word', nl: 'het team', art: 'het', fr: 'l’équipe', en: 'the team', unit: 'bakker' }, CE, EX),
    ['s: « teams » would become Dutch of the course, and sheets[4].title writes it bare in French and in English (test/lang.js 6d.4)'], '…');
    same(rules({ nl: 'Spreekt u goed Engels?', gap: 'Engels', en: 'Do you speak English well? (formal)' }), ['s: en carries a register tag, which is for an item\'s meaning, not for a sentence (test/content.js)'], 'pas d\'étiquette de registre dans une phrase');
  ```
  Merge: `draft[0].sentences` becomes the edited 104 and
  `{ src: 107, nl: 'Misschien is het nu waar.', gap: 'Misschien', en: 'Maybe it\'s true now.', enSrc: 207, fr: 'C\'est peut-être vrai maintenant.', frSrc: null }`;
  `MERGED` ends `'ok tatoeba.tsv 5 rows'`; `held.misschien` holds both sentences, each `{ nl, fr, en, gap, src }`;
  the credit file gains `'misschien\t107\tanna\t207\tbob\t-\t-\tfr'` between the 104 and `sorry` lines; the last credit
  count is `credits.split(eol).length + 5`; the block's line says `sur un extrait de 7 phrases, 2 à une seule traduction`.
  examples-gen, after the line ending `'chaque champ sans blanc autour');`:
  ```js
    same(gwhy(Object.assign({}, gdraft[1].sentence, { fr: "J'ai soif, et toi ?" })), ['sentence: fr writes the typographic apostrophe « ’ » and no straight quote'], 'l’apostrophe typographique en français');
    same(gwhy({ nl: 'Ik heb dorst. Gij ook?', gap: 'dorst', en: 'I am thirsty. You too?', fr: 'J’ai soif. Et toi ?' }), ['sentence: nl is one sentence, not two'], 'une seule phrase');
  ```
  The reading block's `'la liste dit ce qu\'elle tient'` check: its third line's `(a new Flemish form, a generated
  sentence)` becomes `(a new Flemish form, a generated sentence, a written or edited translation)`.
  Run both: `node test/tools/sources.js .` prints `FAIL: extract garde … : {"nld":22,"eng":23,"fra":22}, attendu
  {"nld":24,"eng":25,"fra":22}`, a second `FAIL` on the kept lines (`[]`), then `CRASH TypeError: Cannot read properties
  of undefined (reading 'fra')`. `node test/tools/fanout.js .` prints
  `FAIL: Split coupe un lot des mots qui ont une candidate : {"code":1,"lines":["fail examples -: the kind's split threw: Cannot read properties of undefined (reading 'text')"]}, …`
  then `CRASH Error: ENOENT … input.json` (the old `load` reads an empty column as `[0]`). Both exit 1.

- [ ] **Step 4: `tools/content/tatoeba.js`.** `extract`: keep a `nld` line when `links.eng.has(id) || links.fra.has(id)`;
  read `links[lang].get(s.id) || []` in the `want` loop and in `kept`; filter `s.eng.length || s.fra.length`. `load`:
  `ids` as in Interfaces. `rank`: `cls` as in Interfaces, first in the sort. Header: « traduites en anglais ou en
  français, les deux de préférence (D17) », the ranking sentence, « une colonne vide quand la langue manque », « OU ».
  The comment above `kept` says: « Une traduction effacée depuis le lien n'est pas dans son fichier : le lien tombe, et
  sa langue n'est plus que la colonne vide ; la phrase tombe quand il ne lui reste aucune traduction. »
  `node test/tools/sources.js .` ends `39 contrôles, SOURCES CONFORMES`. `node test/tools/fanout.js .` now runs to its
  end, `640 contrôles, 22 ÉCHEC(S)`, exit 1: every new check of step 3 but the third « u » one fails, and the reading
  list's line.

- [ ] **Step 5: `tools/content/kinds/examples.js` and `examples-gen.js`.** Require `tree`, `{ dutchWords, courseWords }`
  and `{ QUOTED_FIELDS, HTML_FIELDS, names, bareDutch }` from `test/lib/`. Below `extractOf`, `function bareOf(C, repo)`:
  memoised on `seen(C, repo).bare`; `dutch = dutchWords(NL)`, `named = names(NL)`; `tree.visitCourse(NL.content, …)`
  over every object with string `fr` and `en` whose key is in `QUOTED_FIELDS` or `HTML_FIELDS`, calling
  `bareDutch(NL, { has: () => true }, named, key, NL.content.fill(x.fr), NL.content.fill(x.en)).bare` and keeping each word
  not in `dutch` with its first `where`. In `RULES`, after the line `const ts = U.tiles(d.nl), gap = tokens(d.gap);`: the
  « hoe lang » test `/\bhoe\s+lang\b/i` on `d.nl`; the article: when `src.art` and `U.bare(src.nl).toLowerCase()` has no
  space, each token `de`/`het` of `tokens(d.nl)` followed by that noun must equal `src.art.toLowerCase()`; then
  `courseWords(d.nl).filter(w => !dutch.has(w) && bare.has(w))`, each a reason. The gap test's
  `gap.length !== 1 || !own.has(gap[0])` becomes `!(lone || (gap.length === 1 && own.has(gap[0])))`, with, on the line
  before it, `const lone = U.tiles(d.gap).length === 1 && U.tiles(U.bare(src.nl)).map(t => t.toLowerCase()).indexOf(d.gap.toLowerCase()) >= 0;`.
  After the `sig` line, the tag reason when `/\((formal|informal)/.test(d.en)` (`test/content.js`'s own test). In
  `check`, replace the `[['en', 'eng'], ['fr', 'fra']].forEach` loop: `sides`, `written = sides.filter(([l]) =>
  d[l + 'Src'] === null)`; both null → the reason and `return`; a null side with `s[k].length` → the « take one »
  reason; otherwise as today; the `edited` reason's tail as step 3 expects. `credit()`: `adapted` counts a side with no
  linked text (`!en || d.en !== en.text`), and `side = (id, t) => (t ? [id, owner(t.owner)] : ['-', '-'])` builds the
  row. `readWhole` as in Interfaces. Header comment: D17 and D15. In `examples-gen.js` `check`, after the `je` push: the
  quote reason when `/['"]/.test(d.fr)`, the two-sentence reason when `/[.!?…]\s+\S/.test(d.nl)`; its header and the comment
  above `check` name the quote and the one-sentence rules.

- [ ] **Step 6: The credit guard and the docs.** `test/content.js`, after the eight-columns check: `creditFaults(list)`
  returns, per row, `« <row> » : <reason>` for `en : « - », mais un auteur`, `en : « - », et adapted ne la nomme pas`,
  `en : ni « - » ni le numéro d’une phrase de Tatoeba` (the same three for `fr`, columns 5–6), `aucune traduction de
  Tatoeba` (both `-`), `adapted vaut « - », « en », « fr » ou « en fr »`; the planted
  `[['x','1','-','-','-','3','-','-'], ['x','1','-','-','-','-','-','en fr'], ['x','1','-','a','b','3','-','fr en']]` give
  exactly 4 faults (`ok(plantedCredits.length === 4, …)`), and `creditFaults(cells)` is empty, in one check:
  `ok(creditFaults(cells).length === 0, 'docs/attribution/tatoeba.tsv : ' + creditFaults(cells).join(' ; '))`.
  `docs/attribution/tatoeba.tsv` header: after « « en fr ». », « Une traduction que Tatoeba n'a pas et que le cours a écrite (D17) s'écrit « - » dans ses
  deux colonnes, et adapted nomme sa langue. » `ATTRIBUTION.md`: « avec leur traduction anglaise et française, ou l'une
  des deux : l'autre est alors écrite pour le cours (D17) », the `adapted` sentence, « ceux du 7 novembre 2026 », « dans
  l'une des deux langues au moins …, celles traduites dans les deux d'abord ». `TESTING.md`: the `content.js` row after
  « qui ne crédite qu'elles » gains « (une traduction écrite pour le cours y vaut « - » dans ses deux colonnes et sa
  langue dans `adapted`, D17) »; the `tools/sources.js` row says « une traduction, anglaise ou française, suffit, et les
  phrases qui ont les deux passent devant, D17 » and « les vrais fichiers épinglés (ceux du 7 novembre 2026) ne sont pas lus ».
  `tools/content/lib/reading.js`: `INTRO` takes step 3's new parenthetical.

- [ ] **Step 7: Green.** `node test/tools/fanout.js .` ends `640 contrôles, KIT CONFORME` (its examples line:
  `  examples       2 lots sur le cours mesuré ; Split, Check, ses règles, Merge et le crédit sur un extrait de 7 phrases, 2 à une seule traduction ; examples-gen sur 2 mots nommés`);
  `node test/content.js .` ends `7984 contrôles, CONTENU CONFORME` with
  `  sourcées        143 phrase(s) sur 99 mot(s), 118 de Tatoeba créditée(s)` unchanged.

- [ ] **Step 8: Real data (D19).** `node tools/content/split.js . "<WS>/tmp/split-2/examples"` (a scratch folder, not the
  run's `drafts/`) prints exactly, in 2 s:
  ```
  overleven-vragen 32
  kunnen-doen 55
  mensen-hoeveel 55
  waar-landen 41
  eten-cafe 46
  kleren-wonen 55
  kalender-stad 52
  vrijetijd 27
  gevoel 29
  beschrijven-school 50
  afspraak-team 42
  reis-natuur 52
  spoed 14
  ```
  13 batches, 550 rows: 546 of units 13–34 and 4 of units 1–12 (`overleven:w2` dag, `w3` tot ziens, `w6` sorry, `w24`
  natuurlijk). Over the 13 `input.json`: 3 432 candidates, 2 078 with both translations, 1 285 English only, 69 French
  only; 448 rows have a candidate with both, 95 have English only at best, 7 French only at best (the ledger's
  448 / 95 / 7). Write these lines to the ledger's Measures.

- [ ] **Step 9: Commit.** `git add ATTRIBUTION.md TESTING.md docs/attribution/tatoeba.tsv test/content.js test/tools/fanout.js test/tools/sources.js tools/content/kinds/examples-gen.js tools/content/kinds/examples.js tools/content/lib/cache.js tools/content/lib/reading.js tools/content/tatoeba.js`;
  `git commit -m "feat(content): Tatoeba re-pinned to 7 November; a sentence with one translation is kept, the other written (#139)"`.

Done when: `node tools/content/fetch.js . tatoeba --from "<TD>"` prints six `ok` lines; `node tools/content/tatoeba.js .`
prints `ok .cache/tatoeba/extract.tsv 162245 Dutch sentences, 144103 English, 54891 French`; `node test/tools/sources.js .`
ends `39 contrôles, SOURCES CONFORMES` and `node test/tools/fanout.js .` `640 contrôles, KIT CONFORME`, both having failed in step 3;
`node test/content.js .` ends `7984 contrôles, CONTENU CONFORME`; Split printed step 8's 13 lines, 550 rows; `git diff --stat HEAD~1` shows the eleven files
of step 9 and nothing under `src/`.

### Task 3: The phrases kind, and an empty phrases.a1c.js
Class: mechanical
Ticket: #141
Promises: none
Why: the header's calls 1, 2, 3 and 7, D17, D19. `lexicon.a1c.js` is written whole by `words` and has no re-Merge
path, so the 110 phrases of units 13–34 get their own kind and file, `src/content/phrases.a1c.js`, written whole by its
Merge and pushed onto each unit at load (plan 4b's task 1 and `grammar.js` are the model). The strict rule holds
(`sequence.unmet` with an empty own set, `sequence.ahead`, `GRAMMAR`'s tool words excepted), so `AHEAD_BUDGET` does
not move. Credits get their own file, `docs/attribution/tatoeba-phrases.tsv`, which `test/content.js` checks both ways,
so a merged phrase carries its number: `P(nl, g, src)`.
**Check mirrors the suite** (call 7): `test/content.js` 1, 2 (`TILES` 3 to 8), 3 (the strict rule), « hoe lang »
(#128), 4 (an item's Dutch or an example sentence), 5 (ids), 6 (`sig`, `spelling.named`), the u/uw « you » tag,
`bySense` (against the course, the row, and the rows already checked in the same run), `test/lang.js` 6d.4
(`examples.bareOf`); and « ’ » in a written side, which no suite sees (`NL.util.norm` folds it). Not mirrored: the « to »
guard (`G.wordClass` gives a phrase its kind); 6d.3 (`fieldOf` resolves no field for a phrase's `fr`); the explanation
guard (`unexplained.length === 0`) and « sans leurres » (`undecoyed.length === 0`), plan 4d's, whose budgets tasks 8
and 12 pin (D30, D29); another batch's rows, for which `write()` refuses the duplicate Dutch and the shared English.

Files:
- Create: `tools/content/kinds/phrases.js`, `src/content/phrases.a1c.js` (`file([])`), `docs/attribution/tatoeba-phrases.tsv`
- Modify: `tools/content/kinds/examples.js` (export `bareOf`), `tools/content/kinds/words.js` (`HEADER`),
  `src/content/lexicon.a1c.js`, `build.sh`, `test/smoke.js`, `CLAUDE.md`, `ATTRIBUTION.md`, `TESTING.md`,
  `index.html`, `artifact.html`
- Test: `test/tools/fanout.js`, `test/content.js`

Interfaces:
- Consumes: `examples.cut`, `examples.bareOf(C, repo)`, `words.UNITS`, `tatoeba.load`/`JE`, `sequence`, `spelling`,
  `text.oneLine`/`sig`, `dutch.courseWords`, `table.literal`; `kit.loadKind`'s `sourceOf`.
- `phrases.js`: `stamp: [u => u.n, u => u.name.en]`, `fields: ['phrases']`, `optional: ['edited']`, `tables: []`,
  `merge: () => ({})`; `sourceOf(C, id)` → the unit with `{ nl: id, fr, en }` from its names; `split` →
  `examples.cut(groups, PER_BATCH)` over one row per `UNITS` unit with no phrases (else `unit « x » of UNITS is not a
  unit of the course`); a row `{ id, unit, n, name, words, candidates: rank(…).slice(0, MAX) }`, a candidate
  `{ id, nl, owner, en: [{ id, text, owner }], fr, tiles, words }` (the unit's words it writes, in unit order). `rank`
  sorts class (both, en only, fr only), `words.length` desc, `je`, native, tiles, id. `tools(ctx)` → `{ C, NL, order,
  first, S, taken, bare, drafted, extract() }`, memoised on the ctx (one per batch, `kit.js`); `drafted` maps a row id
  to its phrase items, set at the end of each `check`. `rules(nl, ui, tools, at)` and `check(row, input, ctx)`: step 1's
  reasons, in its order. `readWhole`: `written translation` when a side is null, else `edited translation` when
  `edited`, else `''`. `file(units)`: `HEADER`, per unit `  U('<id>', [` / `    P('<nl>', { fr: …, en: … }, <src>),` /
  `  ]);`, then `})();`. `write(taken, ctx)` throws step 1's three, and `<id> « … » is already …: the course moved since
  Split`, `phrases.a1c.js holds the phrases of the unit X, and no taken row writes them: Merge rewrites the file whole`;
  it returns `ok phrases.a1c.js N phrases in M units`, `ok ids.tsv K added`, `ok tatoeba-phrases.tsv N rows`, keeping
  each file's line ends. Credit columns `unit nld nld_owner eng eng_owner fra fra_owner adapted`, a written side
  `-`/`-` with its language in `adapted` (D17). Exports also `MAX 40, PER_BATCH 6, PHRASES 5, TILES {min 3, max 8},
  CREDITS, HEADER`.

Notes:
- French comments in `src/`, `test/` and the kit; English printed lines and reasons.
- `test/content.js` count: the empty file adds 18 (« hoe lang » reads every `src/content/*.js` line), the credit block
  3, the second line of `lexicon.a1c.js`'s header 1. Task 8's Merge adds the file's lines.
- `beforeWords` also empties `phrases.a1c.js` (`beforePhrases`): a fixture with the lexicon emptied would throw at load
  once task 8 merges real phrases.
- **The proof.** Copy `%USERPROFILE%\AppData\Local\Temp\claude\a7917b01ac072e1a\8bf7ef00-9f92-425a-8160-86aec667d00b\scratchpad\proofs\fixZ`
  (CRLF, `core.autocrlf=true`): base `e40965e` (= `7e90be1`), task 1 `f002703`, task 2 `c426128`, this task `98999f7`,
  exported to `parts/patches/task-3.fixed.patch`. Red: step 1 on `c426128`; each assertion the fix added also failed on
  the kind as first written. Every line below was printed there. Not run: the full suite; `test/lang.js` (no course
  text changes).

- [ ] **Step 1: The tests, red.** `test/tools/fanout.js`: after the two lines of `const beforeGrammar = dir => …`,
  `const beforePhrases = dir =>` writes `src/content/phrases.a1c.js` from that copy's `phrases.file([])`; `beforeWords`
  calls it after `beforeGrammar(dir)`; the words block's header list gains `['phrases.a1c.js', …file([])]`. Before
  `  /* ==================================================== le genre scenarios */`, a `phrases` block on the grammar
  block's pattern: copy `PH` (`KIT.concat('docs/attribution')`, `beforePhrases`), `ctxP = { repo: PH, course: () => CP }`,
  and `PH/.cache/tatoeba/extract.tsv` under the pins' header (`nld id owner native nl en fr`):
  ```
  501 anna 1 Wie is dat?  601 701 | 502 '' 0 Wie is dat nu?  602 702 | 503 anna 1 Waarom nu?  603 703
  504 carl 0 wie is dat  601 701  | 505 anna 1 Wanneer is dat?  605 - | 506 anna 1 Wie heeft de muziek?  606 706
  507 anna 1 Hoe gaat het met de familie?  607 707 | 508 anna 1 Wie ben je?  608 708 | 509 anna 1 Hoe lang is dat?  609 709
  510 anna 1 Wat wilt u?  610 710 | 511 anna 1 Hoe is het nu?  - 711 | 512 bob 0 Dat is waar.  612 712
  ```
  Each English (by `bob`) and French (by `dora`, 712 by no one) says its Dutch plainly: 602 `Who is that now?`, 610
  `What do you want?`, 612 `That is true.`, 702 `Qui est-ce maintenant ?`, 712 `C’est vrai.`.
  Assert: SRC holds `src/content/phrases.a1c.js` on the line after `src/content/lexicon.a1c.js`; smoke's list matches
  `/'src\/content\/lexicon\.a1c\.js',\s*'src\/content\/phrases\.a1c\.js'/`; the constants; `CREDITS`; `PH`'s credit file
  holds only its header and no unit 13–34 of `CP` has a phrase (the copy's, not the repository's: task 8's Merge fills
  the repository's, and task 8's `beforePhrases` empties the copy's). Split → `vragen-waar 6`, `landen-kalender 6`, `stad-afspraak 6`,
  `team-spoed 4`; row ids `vragen kunnen doen mensen hoeveel waar`; `vragen`'s keys `id stamp copies unit n name words
  candidates`, `n` 13, `name.en` `Questions and small words`, 30 words, `wie` first, stamp
  `kit.stamp(kind, K.sourceOf(CP, 'vragen'), CP.NL)`; candidates `[502, 501, 504, 512, 510, 508, 505, 511]`; [0] is 502
  (`owner: ''`, tiles 4, `words: ['wie', 'nu', 'dat']`), [6] is 505 (`fr: []`, tiles 3, `words: ['wanneer', 'dat']`);
  the other rows' counts `[1, 0, 0, 0, 0]`. `K.rules(nl, uiV, K.tools(ctxP), 's')`:
  ```
  Wie is dat?                  → (none)
  Waarom nu?                   → s has 2 tiles: 3 to 8
  Wie heeft de muziek?         → s borrows from a later unit: muziek (vrijetijd)
  Wie is dat ginder?           → s uses forms no unit up to « vragen » teaches: ginder
  Wie is dat ginderr?          → (the same for ginderr) | s: « ginderr » not a form OpenTaal or flemish.tsv knows
  Wie is Tom?                  → s uses forms no unit up to « vragen » teaches: tom | s names no one by default and holds no {…} token
  Hoe lang is dat?             → s writes « hoe lang »: the course writes the duration « hoelang » (#128)
  Hoe gaat het met de familie? → s « Hoe gaat het met de familie? » is already the Dutch of familie:p3
  Dat is niet waar.            → s « Dat is niet waar. » is already an example sentence of overleven:w12
  Wat is de date?              → s uses forms no unit up to « vragen » teaches: date | s: « date » would become Dutch of the course, and units[23].blurb writes it bare in French and in English (test/lang.js 6d.4)
  ```
  Check: `take(id, more)` is a candidate's phrase with its first linked texts (`null` for a missing side), `GOOD =
  [take(502), take(501), take(512), take(505, { fr: 'Quand est-ce ?' }), take(510, { en: 'What do you want? (formal)' })]`,
  `edited: 'the learner reads the register of u'` unless said, `pN` changes phrase N:
  ```
  GOOD                     → (none)
  GOOD.slice(0, 4)         → phrases is a list of 5 phrases, not 4
  edited ' x'              → edited is a reason on one line with no space at either end | phrase 5: en « What do you want? (formal) » is not Tatoeba's 610, « What do you want? »: take it as written, or say why in edited, on one line with no space at either end
  no edited                → (that phrase 5 line alone)
  p1 gap: 'nu'             → phrase 1 has the fields src, nl, en, enSrc, fr, frSrc, not src, nl, en, enSrc, fr, frSrc, gap
  p1 en 'two\nlines'       → phrase 1: nl, en and fr are each a string on one line with no space at either end
  p1 src 503               → phrase 1: src 503 is not one of the row's candidates
  p1 nl 'Wie is dat nu ?'  → phrase 1: nl is not Tatoeba's sentence 502, « Wie is dat nu? »: a phrase is taken as Tatoeba writes it
  p1 enSrc null            → phrase 1: enSrc is null, but Tatoeba links 602 to 502: take one
  p4 enSrc null            → phrase 4: enSrc and frSrc are both null: a phrase keeps at least one translation Tatoeba links
  p1 frSrc 701             → phrase 1: frSrc 701 is not a translation Tatoeba links to 502
  p5 take(510)             → phrase 5: nl says « u » and en « you »: en carries « (formal) » (« (informal, Flemish u) » when fr says tu, « (formal) » otherwise), as test/content.js asks | edited is for a translation that is not Tatoeba's, and every linked one is taken as written
  p3 take(504)             → phrase 3 « wie is dat » repeats phrase 2
  p4 en 'When is that at 3?' → phrase 4: en and fr do not hold the same digits
  p4 fr 'C\'est quand ?'   → phrase 4: a written fr takes the apostrophe « ’ », not « ' »
  p4 fr 'Quand vient Tom ?' → phrase 4: en and fr name no one by default and hold no {…} token
  p3 take(511, { en: 'How is the family?' }) → phrase 3: en « How is the family? » shares a sense with familie:p3 « Hoe gaat het met de familie? » (How is the family?), which shares no French sense and no Dutch: give one of them another English, or the French they share
  p3 take(511, { en: 'Who is that now?' })   → (the same, naming vragen:p0 « Wie is dat nu? » (Who is that now?))
  ```
  On one fresh ctx: `vragen` GOOD, `vragen` GOOD again, then a `kunnen` row (the `vragen` input with `id` and `unit`
  `kunnen`) with `p3 take(508, { en: 'That is true.' })` → `[]`, `[]`, and the shared-sense line naming `vragen:p2
  « Dat is waar. » (That is true.)`. `readWhole` three ways. `file()` run with `new Function('NL', code)`: unit `zzz`
  throws `/phrases\.a1c\.js : les phrases de l’unité « zzz »/`; `vragen`'s first phrase is `['phrase', 'Wie is dat nu?',
  'Qui est-ce maintenant ?', 'Who is that now?', 502]`. `write()` throws
  `/^kunnen and vragen both write « Wie is dat nu\? »; .*« Wat wilt u\? »: one phrase, one unit$/` (GOOD in both),
  `/^vragen:p2 « Dat is waar\. » and kunnen:p0 « Wie ben je\? » share the English sense « That is true\. » with no French sense in common: give one of them another English$/`
  (`kunnen`: `[take(508, { en: 'That is true.' })]`) and, with `vragen:p1\tWie is daar?` added to `ids.tsv`,
  `/pins vragen:p1 to « Wie is daar\? », and Merge writes « Wie is dat\? » there/`. End to end on `vragen` alone: Split
  → `vragen-waar 1`; Check → `ok input.json 1 rows`, `ok draft.json 1 rows`, `ok review.json 1 keep, 0 dispute`; Merge →
  `ok phrases 1 taken, 0 dropped`, `ok phrases.a1c.js 5 phrases in 1 units`, `ok ids.tsv 5 added`,
  `ok tatoeba-phrases.tsv 5 rows`; the file holds `  U('vragen', [` and
  `P('Wanneer is dat?', { fr: 'Quand est-ce ?', en: 'When is that?' }, 505)`; the course has `vragen`'s 5 phrases and
  `vragen:p4`'s en `What do you want? (formal)`; `ids.tsv` gained `vragen:p0`–`p4` at the file's line ends; the credit
  file gained `vragen\t502\t-\t602\tbob\t702\tdora\t-`, `vragen\t501\tanna\t601\tbob\t701\tdora\t-`,
  `vragen\t512\tbob\t612\tbob\t712\t-\t-`, `vragen\t505\tanna\t605\tbob\t-\t-\tfr`, `vragen\t510\tanna\t610\tbob\t710\tdora\ten`;
  Merge again → the same with `ok ids.tsv 0 added`, files unchanged; a second Split → `kunnen-landen 6`, `eten-stad 6`,
  `vrijetijd-team 6`, `reis-spoed 3`.
  `test/content.js`, after the line `  console.log('  sourcées        ' + …`: the credit file's first data line is
  `CREDITS`; each row has eight filled columns; `creditFaults` finds nothing; each phrase's `src` is a positive integer;
  `pairFaults(credited, inFile)` names a phrase not credited, a credit with no phrase, and a credit twice, and three
  planted credits (`['x\t1', 'x\t3']` against `['x\t3', 'x\t2', 'x\t3']`) give 3; then the `phrases` line.
  `node test/tools/fanout.js .`: exit 1, after `  source du genre sourceOf, ctx.ids : Split, Check, Merge, lecture`,
  `CRASH Error: Cannot find module '…\flamand\tools\content\kinds\phrases'`. `node test/content.js .`: exit 1,
  `FAIL: docs/attribution/tatoeba-phrases.tsv manque, ou sa première ligne n’est pas « unit nld nld_owner eng eng_owner fra fra_owner adapted »`,
  `7987 contrôles, 1 ÉCHEC(S)`.

- [ ] **Step 2: The kind.** `examples.js` exports `bareOf`; its header's sentence on `examples-gen` (« … reprend d'ici RULES, cut, MAX et stamp ») ends « ; le genre phrases
  (phrases.js), cut et bareOf. ». Write `phrases.js` to Interfaces on `grammar.js`'s shape. `rank` pools `T.byForm` over
  `sequence.forms(w, NL)` (a multi-token word: its first token, then a `run` match), as `tatoeba.rank`; `tools.taken`
  maps `U.norm(nl)` → `{ what, self }`, `self` the unit of a phrase already merged there; the ahead reason names each
  form's unit, `T.order[T.first.get(t)]`.

- [ ] **Step 3: The files and the wiring.** `src/content/phrases.a1c.js` from `file([])`;
  `docs/attribution/tatoeba-phrases.tsv`, these seven lines then `CREDITS`:
  ```
  # Les phrases de src/content/phrases.a1c.js, celles des unités 13 à 34, tirées de Tatoeba (https://tatoeba.org),
  # CC BY 2.0 FR (https://creativecommons.org/licenses/by/2.0/fr/) : une ligne par phrase, son unité, puis le
  # numéro et l’auteur de la phrase néerlandaise, de sa traduction anglaise et de sa traduction française.
  # Un auteur que Tatoeba ne nomme pas s’écrit « - ». adapted dit quelle traduction le cours a changée :
  # « - », « en », « fr » ou « en fr ». Une traduction que Tatoeba n’a pas et que le cours a écrite (D17)
  # s’écrit « - » dans ses deux colonnes, et adapted nomme sa langue. Merge du genre phrases
  # (tools/content/kinds/phrases.js) récrit ce fichier entier ; ATTRIBUTION.md dit pourquoi.
  ```
  `build.sh` and `test/smoke.js`: `src/content/phrases.a1c.js` after `src/content/lexicon.a1c.js`. `sh build.sh` →
  `built (local only) index.html (903413 bytes), artifact.html (902799 bytes)` (measured on tasks 1–2 and steps 1–3 of this task; the size follows the wording of `HEADER`'s comment, which the plan leaves to the implementer).

- [ ] **Step 4: The docs.** `words.js` `HEADER` and `lexicon.a1c.js`, last comment line: `leurs phrases de` /
  `   phrases.a1c.js (qui les range de même, cinq par unité, prises dans Tatoeba). */`. `CLAUDE.md`, after the
  `scenarios` sentence of « Six tables »: « The `phrases` kind's Merge (`tools/content/kinds/phrases.js`) writes
  `src/content/phrases.a1c.js` whole: the five Tatoeba phrases of each unit 13 to 34, which the page pushes onto its unit
  at load; it appends their ids to `test/data/ids.tsv` and rewrites `docs/attribution/tatoeba-phrases.tsv` whole, one
  credit line per phrase. A phrase changes through its unit's row, never by hand. » `ATTRIBUTION.md`, after « n'y figure
  pas. »: « Les phrases des unités 13 à 34 (`src/content/phrases.a1c.js`, leur `src` un numéro) viennent de Tatoeba de
  même, et `docs/attribution/tatoeba-phrases.tsv`, que la fusion du genre `phrases` réécrit en entier, les crédite une à
  une, sous leur unité, dans les mêmes colonnes. » `TESTING.md`, row `content.js`, after « qui donne à son mot le
  texte à trous », where the clause on the sourced phrases ends: « ; les phrases prises dans Tatoeba pour les unités 13 à 34 (`src/content/phrases.a1c.js`, leur `src` un
  numéro) : chacune créditée une fois dans `docs/attribution/tatoeba-phrases.tsv`, sous son unité, qui ne crédite
  qu'elles, dans les mêmes huit colonnes (le contrôle est d'abord essayé sur des crédits plantés) ». Row
  `tools/fanout.js`, after « et son Merge qui récrit `src/content/scenarios.a1c.js` »: « ; `phrases`, dont la source est
  une unité : ses 22 unités en 4 lots, les candidates d'une unité classées (les deux traductions d'abord, D17, puis ses
  mots), les règles d'une candidate (de 3 à 8 tuiles, rien que l'unité n'ait enseigné, l'unité qui l'enseigne nommée,
  l'orthographe, ni nom ni jeton, « hoelang », pas le néerlandais d'un élément ni d'une phrase d'exemple, pas une forme
  qu'une prose écrit nue dans les deux langues), chaque garde de Check (une candidate de la ligne, telle que Tatoeba
  l'écrit, ses traductions liées ou l'une écrite, l'apostrophe « ’ » d'un côté écrit, l'étiquette d'un u glosé you, les
  mêmes chiffres, un anglais qu'un élément ou une autre ligne du lot dit déjà sans sens français commun), le chargement
  de `src/content/phrases.a1c.js` qui lève une erreur nommant l'unité absente, et son Merge de bout en bout, qui refuse
  deux unités au même anglais sans sens français commun, récrit le fichier, ajoute à `test/data/ids.tsv` et récrit
  `docs/attribution/tatoeba-phrases.tsv` », and « les trois fichiers … `scenarios.a1c.js`) » becomes « les quatre
  fichiers qu'un Merge écrit entiers (`lexicon.a1c.js`, `grammar.a1c.js`, `scenarios.a1c.js`, `phrases.a1c.js`) ».
  `sh build.sh` → `built (local only) index.html (903486 bytes), artifact.html (902872 bytes)` (measured as step 3's, on tasks 1–2 and steps 1–4).

- [ ] **Step 5: Green.** `node test/tools/fanout.js .` → `699 contrôles, KIT CONFORME`, with
  `  phrases        22 unités, 4 lots ; les règles d'une candidate, chaque garde de Check, le chargement, Merge de bout en bout, relancée, second Split`;
  `node test/content.js .` → `8006 contrôles, CONTENU CONFORME`, with
  `  phrases         0 phrase(s) de Tatoeba dans les unités, 0 créditée(s)` and `  ids             1044 / 1044 à leur place`;
  `node test/smoke.js .` → `ALL CHECKS PASSED`, `  items           1048  (words 912, phrases 114, patterns 22)`.

- [ ] **Step 6: Real data (D19).** With `.cache/` filled (`fetch.js … --from "<TD>"`: six `ok` lines;
  `node tools/content/tatoeba.js .` → `ok .cache/tatoeba/extract.tsv 162245 Dutch sentences, 144103 English, 54891 French`),
  `node tools/content/split.js . "<WS>/tmp/split-3/phrases"` prints, in 4 s:
  ```
  vragen-waar 6
  landen-kalender 6
  stad-afspraak 6
  team-spoed 4
  ```
  22 rows, 880 candidates (40 per unit): 869 with both translations, 11 English only (all `team`'s), 0 French only.
  Before the cap: 17 131 sentences, 4 671 with both, from team's 117 / 29 to vragen's 2345 / 636 (task 7 lists each
  unit, after task 6's Merge has taken its examples out). Write these lines to the ledger's Measures.

- [ ] **Step 7: Commit.** `git add` the 15 files above (`docs/attribution/tatoeba-phrases.tsv` included);
  `git commit -m "feat(content): the phrases kind, and an empty phrases.a1c.js (#141)"`. `git show --stat HEAD`:
  `15 files changed, 658 insertions(+), 10 deletions(-)` (measured on tasks 1–2; the insertions follow the length of `phrases.js` and the wrapping of the doc sentences, which the plan leaves to the implementer).

Done when: fanout `699 contrôles, KIT CONFORME` and content `8006 contrôles, CONTENU CONFORME`, both red in step 1;
smoke `ALL CHECKS PASSED`; Split printed step 6's four lines; `git status --short` prints nothing.

### Task 4: The Flemish Split held to units 13–34
Class: mechanical
Ticket: #142
Promises: none
Why: Review Focus 4 and the header's call 5. The `flemish` kind's `split(C)` cuts every item of every unit that has
no `be`: on today's course the 605 words of units 13–34 and, again, the 267 words and 65 phrases of units 1–12 that
phase 3 answered null (a null answer is not stored). This task holds the unnamed Split to the 22 units of `UNITS`
(`tools/content/kinds/words.js`) and packs whole units into batches of at most 80 rows (call 6), named as
`examples.cut` names them; `cut` itself aims at equal batches (85 and 90 rows on the real course), so a ten-line
`pack` holds the cap. A named row (`ctx.ids`), `be` or not, is still cut: the kit's contract (`design-sitting.md`,
« The fan-out form »), and how a merged form is redrafted. Check gains the one suite guard a `be` can trip that it
did not mirror, a written wrong option of another item (`test/content.js` « leurres »), and three refusals of rows
the Format (task 11) forbids that no suite check sees: a straight apostrophe (`be.js`'s 89 forms write « ’ » 21
times and « ' » never; `NL.util.norm` folds the two), `none` for a form a rule offers (D28), and a word's Dutch with
another article (`srs.supports` reads « de hoofd » as « het hoofd »). Real data (D19): 10 batches, 605 rows, all
words; the 110 phrases come at task 8.

Files:
- Modify: `tools/content/kinds/flemish.js` (`split`, a new `pack`, `MAX`, `OWN`; Check's four refusals; `pack` exported)
- Modify: `TESTING.md` (the `tools/fanout.js` row, the `flemish` clause)
- Test: `test/tools/fanout.js`, the block « le genre flemish » only (tasks 1–3 touch other blocks)

Interfaces:
- Consumes: `UNITS` (22 `{ id, … }`); the kit's `split(C, ctx)`, `ctx.ids` an array of ids or null; `C.RAW.units`,
  `C.sources`, `C.NL.util.norm` and `bare`; `NL.content.byDutch.decoys` (`{ <Dutch>: [two forms] }`); the kind's
  `offered(s, U)`; in the test, `fanout.js`'s `copyKit`, `runIn`, `table.update`, `text`, `put`, and `C`, the course
  of the copy `TMP`.
- Produces: `pack(groups, max)`, exported: `[{ unit, rows }]` in course order → `[{ batch, rows }]`, whole units, at
  most `max` rows a batch, a larger unit alone; `batch` = the first unit's id, plus `-<last unit>` when it holds
  several. `split(C, ctx)` = `pack(groups, 80)` over `UNITS`' sources with no `be`, plus every named source. Check's
  new reasons, exactly:
  `« <decoy> » is a written wrong option of « <Dutch> » (src/content/decoys.js): the course would then accept it`,
  `be writes the typographic apostrophe « ’ », as rules does: « ’t », « da’s »`,
  `<rule:…> gives be: cite <rule:…>, not none`; « be is the Dutch itself » and « a word's first form is the Flemish
  one » now compare a word without its article.

Notes:
- **Comments in French** in `flemish.js` and the test block; Check's reasons in English, as the kit's.
- **The guards a `be` can trip, and what covers each** (`test/content.js`, `typed.js`, `lang.js`,
  `test/lib/spelling.js`, `test/data/flemish.tsv`): (1) `content.js` 1, every token a form OpenTaal, the default
  names or `flemish.tsv` knows — Check (« is not a form OpenTaal knows, and <evidence> does not account for it »),
  and Merge's `write` adds each accounted form to `flemish.tsv`; (2) « dans flemish.tsv mais plus dans le cours » —
  `write` adds only forms a taken row uses; (3) « tables », a key of `be.js` is an item's Dutch — the kit writes
  under `src.nl`; (4) « leurres » — **not mirrored until this task** (66 entries, two forms each): step 5, with and
  without the article as `NL.ex.accepted`; (5) `engine.js` and `srs.supports`, no « Comment le dit-on ici ? » for a
  word whose first form is its Dutch — Check's « Dutch itself » and « first form », a word compared without its
  article from step 5; (6) `typed.js` « Ici on dit » — Check's comma rule; (7) the tiles and `{…}` tokens — `thin`
  and `slots`; (8) `lang.js` 6, a `be` that is also a French or English word — handled there, as for « merci », not
  a row guard; (9) `lang.js` 6d.3 and 6d.4: a form using a word of `QUOTE_OK`, or a token a prose writes bare in
  French and in English (`SHARED_OK`; both in `test/lib/quoted.js`, and `test/lib/dutch.js` reads `be`), fails at Merge — **not mirrored,
  deliberately**: the row is right, the fix is the exemption table in `test/lib/quoted.js`, which task 12's step 8
  scripts. Not in the suite, so not in Check: a `be` equal to another item's Dutch or `be` (`siblings` shows those).
- **`content.js` « sans leurres » is not a row guard**: every item whose first form differs from its Dutch needs its
  two decoys; Merge flemish (task 12) makes each item it gives a form trip it (a `null` is not stored: at most the 715 rows, 605 words and 110 phrases; 9 in task 12's proof) until plan 4d's
  `explanations-be` writes them.
- **The fixture.** The test's copy `FR` has units 1–12 only (`beforeWords`), so the unnamed Split there cuts nothing
  (the first red), and the Check and Merge tests get their rows from a named Split of 11 ids, one batch,
  `overleven-weekend` (overleven, ikengij, onderweg, werkbasis, dokter, weekend, in course order). A second copy,
  `FS`, keeps the full course with the `be` of every `UNITS` item removed, so the Split is tested on the 22 units
  whatever task 12 merges; its counts come from `C`, not pinned (task 8 adds 110 phrases).
- **The proof.** Copy `%USERPROFILE%\AppData\Local\Temp\claude\a7917b01ac072e1a\8bf7ef00-9f92-425a-8160-86aec667d00b\scratchpad\proofs\fixZ`
  (CRLF, `core.autocrlf=true`): base `e40965e` (the worktree at `7e90be1`), tasks 1–3 fixed (`f002703`, `c426128`,
  `98999f7`); this text applied on top, commit `4ab1b85`, exported to `parts/patches/task-4.fixed.patch`.
  `node test/tools/fanout.js .` ran at steps 1, 3, 4 and 6, each at its step's state, and step 7's Split; counted on
  the copy the 605 words, the 267 words and 65 phrases, the 66 decoy entries and `cut`'s sizes
  `85 80 80 60 65 90 75 70`. The base patch's `TESTING.md` conflict after tasks 1–3 is in `notes-Fa.md`; the run
  applies the text, not the patch. Every expected line below is copied from those runs.

- [ ] **Step 1: The Split's tests, red.** In `test/tools/fanout.js`, block « le genre flemish », replace the six
  lines from `/* Split : un lot par unité, ses mots et ses phrases sans forme flamande. */` to
  `ok(!rowOf('overleven:w0'), 'un mot que be.js tient n\'est pas recoupé');` (inclusive) with:
  ```js
      /* Split, sans id nommé : rien des unités 1 à 12, lues en phase 3 (une réponse null n'est pas stockée), même quand
         le cours n'a qu'elles. Nommées (ctx.ids), leurs lignes se coupent, be ou non, en un lot d'unités entières. */
      same(runFr('split.js', [FR, path.join(FR, 'vide', 'flemish')]), { code: 0, lines: [] }, 'sans id nommé, Split ne recoupe rien des unités 1 à 12');
      const IDS = ['overleven:w0', 'overleven:w2', 'overleven:w12', 'overleven:p3', 'overleven:p9', 'ikengij:p4', 'onderweg:w0', 'werkbasis:p7', 'dokter:w2', 'dokter:p6', 'weekend:p1'];
      const KD = path.join(FR, 'drafts', 'flemish');
      same(runFr('split.js', [FR, KD].concat(IDS)), { code: 0, lines: ['overleven-weekend 11'] },
        'nommées, des lignes des unités 1 à 12 se coupent, en un lot nommé de sa première et de sa dernière unité');
      const B1 = path.join(KD, 'overleven-weekend');
      const rowOf = id => JSON.parse(text(path.join(B1, 'input.json'))).find(r => r.id === id);
      same((rowOf('overleven:w0') || {}).nl, 'hallo', 'nommé, un mot que be.js tient se recoupe');
  ```
  After the line `same(rowOf('overleven:w2').siblings.map(s => s.nl), ['de dag'], …);` and its blank line, insert:
  ```js
      /* Split sur le cours entier, be.js vidé des formes des 22 unités de UNITS (words.js). Les nombres suivent le cours
         (les phrases du plan 4c s'y ajoutent) : rien n'est épinglé. */
      const FS = path.join(TMP, 'flamand-split');
      copyKit(ROOT, FS, ['build.sh', 'src', 'test/lib', 'tools']);
      const OWN = new Set(require(path.join(ROOT, 'tools', 'content', 'kinds', 'words')).UNITS.map(u => u.id));
      const clear = {};
      C.sources.filter(s => OWN.has(s.unit)).forEach(s => { clear[s.nl] = null; });
      table.update(path.join(FS, 'src', 'content', 'be.js'), clear);
      const KS = path.join(FS, 'drafts', 'flemish'), cutS = runIn(FS, 'split.js', [FS, KS]);
      const lots = cutS.lines.map(l => ({ batch: l.split(' ')[0], rows: JSON.parse(text(path.join(KS, l.split(' ')[0], 'input.json'))) }));
      const unitsOf = b => [...new Set(b.rows.map(r => r.unit))], sizes = lots.map(b => b.rows.length);
      same([cutS.code, [].concat(...lots.map(b => b.rows.map(r => r.id)))], [0, C.sources.filter(s => OWN.has(s.unit)).map(s => s.id)],
        'Split coupe exactement les mots et les phrases sans forme des 22 unités de UNITS, dans l\'ordre du cours, et rien des unités 1 à 12');
      same(lots.map(b => b.batch), lots.map(b => { const u = unitsOf(b); return u[0] + (u.length > 1 ? '-' + u[u.length - 1] : ''); }),
        'un lot porte le nom de sa première unité, et de sa dernière quand il en a plusieurs');
      ok(lots.every((b, k) => k === 0 || unitsOf(lots[k - 1]).indexOf(unitsOf(b)[0]) < 0), 'un lot tient des unités entières');
      ok(sizes.every(n => n <= 80), '80 lignes au plus par lot : ' + JSON.stringify(sizes));
      ok(lots.every((b, k) => k === 0 || sizes[k - 1] + b.rows.filter(r => r.unit === unitsOf(b)[0]).length > 80),
        'les lots sont serrés : un lot et la première unité du suivant font plus de 80 lignes : ' + JSON.stringify(sizes));
      ok(lots.length > 1 && lots.length < OWN.size, lots.length + ' lots pour ' + OWN.size + ' unités : des unités entières se groupent');
      /* Une unité de plus de 80 lignes fait un lot à elle seule. */
      const grp = (unit, n) => ({ unit, rows: Array.from({ length: n }, (x, k) => ({ id: unit + ':w' + k, unit })) });
      same(K.pack([grp('a', 40), grp('b', 40), grp('c', 1), grp('d', 90), grp('e', 3)], 80).map(b => b.batch + ' ' + b.rows.length),
        ['a-b 80', 'c 1', 'd 90', 'e 3'], 'pack : des unités entières jusqu\'à 80 lignes, et une unité plus grande seule dans son lot');

  ```
  In the end-to-end part of the block, the two batch folders become the one batch: move the eight lines from
  `const draft = text(path.join(DOKTER, 'draft.json'));` to `put(DOKTER, 'draft.json', draft);` **before**
  `const review = text(path.join(WEEKEND, 'review.json'));` (Check on a batch that already holds `disputes.md`
  and `rulings.json` would add two cascade lines), delete the line
  `const WEEKEND = path.join(KD, 'weekend'), DOKTER = path.join(KD, 'dokter');`, and replace every `WEEKEND` and
  `DOKTER` left in the block with `B1`. Replace the block's last line with:
  ```js
      console.log('  flemish        ' + lots.length + ' lots sur les 22 unités (' + sizes.reduce((n, k) => n + k, 0) + ' lignes), ' + rows + ' lignes nommées ; six règles ; Check, Merge et flemish.tsv');
  ```
  Run `node test/tools/fanout.js .`. Expected, red (the batch folder the named Split should write does not exist, so
  the block then crashes):
  ```
    FAIL: sans id nommé, Split ne recoupe rien des unités 1 à 12 : {"code":0,"lines":["overleven 18","ikengij 29","tijd 45","bakker 26","thuis 28","familie 28","onderweg 29","werkbasis 31","dedag 28","winkel 25","dokter 27","weekend 24"]}, attendu {"code":0,"lines":[]}
    FAIL: nommées, des lignes des unités 1 à 12 se coupent, en un lot nommé de sa première et de sa dernière unité : {"code":1,"lines":["fail flemish overleven:w0: not a row the kind's split cuts"]}, attendu {"code":0,"lines":["overleven-weekend 11"]}
  CRASH Error: ENOENT: no such file or directory, open '…\flamand\drafts\flemish\overleven-weekend\input.json'
  ```

- [ ] **Step 2: The Split.** In `tools/content/kinds/flemish.js`, after `const kaikki = require('../kaikki');` add
  `const { UNITS } = require('./words');`. Replace the comment and the head of `split` (from
  `/* Split : un lot par unité, dans l'ordre du cours ;` to the line `C.RAW.units.forEach(u => {` and the `rows`
  line after it) with:
  ```js
  /* Les unités que Split coupe sans id nommé : les 22 de la phase 4 (words.js). Les unités 1 à 12 ont été lues
     en phase 3, où une réponse null n'est pas stockée (plan 4c, appel 5 des choix de l'auteur). */
  const OWN = new Set(UNITS.map(u => u.id));
  const MAX = 80;

  /* Les lots : des unités entières, dans l'ordre donné, MAX lignes au plus chacun ; une unité de plus
     de MAX lignes fait un lot à elle seule. Un lot porte le nom de sa première unité, et de sa dernière
     quand il en a plusieurs. (examples.cut partage les noms, pas la borne : il vise des lots égaux et
     en dépasse MAX.) */
  function pack(groups, max) { … }

  /* Split : les lignes des unités de OWN que be.js ne tient pas (le null gardé devant une note n'est pas une
     forme), et chaque ligne nommée (ctx.ids), be ou non : ainsi se récrit une forme fondue (design-sitting.md,
     « The fan-out form »). */
  function split(C, ctx) {
    const G = C.NL.gloss, U = C.NL.util, named = new Set((ctx && ctx.ids) || []);
    const groups = [];
    C.RAW.units.forEach(u => {
      const rows = C.sources.filter(s => s.unit === u.id && (named.has(s.id) || (OWN.has(u.id) && !s.be))).map(s => ({
  ```
  `pack`'s body is the comment's rule: in order, a group `{ unit, rows }` joins the last lot while that lot stays at
  `max` rows or fewer, else opens a new one; it returns `{ batch, rows }` per lot, the rows in order (step 1's `pack`
  test and « serrés » pin it).
  The row's fields (`id`, `nl`, `kind`, `unit`, `meaning`, `siblings`, `rules`) do not change. At the end of the
  loop, `batches.push({ batch: u.id, rows });` becomes `if (rows.length) groups.push({ unit: u.id, rows });` and
  `return batches;` becomes `return pack(groups, MAX);`. In `module.exports`, after `outputs` add `pack` (and the
  comma before it).

- [ ] **Step 3: Run `node test/tools/fanout.js .`.** Expected: no `FAIL` line, the block's line
  `  flemish        10 lots sur les 22 unités (605 lignes), 11 lignes nommées ; six règles ; Check, Merge et flemish.tsv`
  and the last line `707 contrôles, KIT CONFORME` (699 after tasks 1–3, and this block's 8). The `flemish` line's
  numbers follow the course: after task 8 the second grows by 110 and the first may change.

- [ ] **Step 4: Check's tests, red.** In the test block, after the `same(why('weekend:p1', …), [ … ], 'chaque
  raison est dite');` statement and before `fs.renameSync(EXTRACT, EXTRACT + '.old');`, insert:
  ```js
      /* Ce que test/content.js (« leurres ») refuserait à Merge : un leurre écrit d'un autre élément, article ou non. */
      same([why('overleven:p9', 'Da duurt een half uren.', 'none'), why('dokter:w2', 'vélo, het hoofd', 'none')],
        [['« Da duurt een half uren. » is a written wrong option of « Dat duurt een half uur. » (src/content/decoys.js): the course would then accept it'],
          ['« de vélo » is a written wrong option of « de fiets » (src/content/decoys.js): the course would then accept it']],
        'une forme de be qui est un leurre d\'un autre élément est refusée, article ou non');
      /* Ce qu'aucun contrôle de la suite ne voit : un mot dont seul l'article change, l'apostrophe droite, none pour la
         forme qu'une règle donne. */
      same([why('dokter:w2', 'de hoofd', 'none'), why('dokter:w2', 'een hoofd, het hoofd', 'none')],
        [['be is the Dutch itself: with nothing Flemish to teach, be is null'], ['a word\'s first form is the Flemish one, and here it is the Dutch itself']],
        'un mot dont seul l\'article change n\'a rien de flamand à apprendre, comme srs.supports le juge');
      same(why('weekend:p1', 'Allez, \'t regent weer.', 'none'), ['be writes the typographic apostrophe « ’ », as rules does: « ’t », « da’s »'],
        'be écrit l\'apostrophe typographique');
      same(why('overleven:p3', PICK['overleven:p3'].be, 'none'), ['rule:da+nie gives be: cite rule:da+nie, not none'],
        'une forme qu\'une règle donne se cite par sa règle, pas par none');
  ```
  Run `node test/tools/fanout.js .`. Expected, red (each `FAIL` line ends with its test's expected value, cut
  here after « attendu »):
  ```
    FAIL: une forme de be qui est un leurre d'un autre élément est refusée, article ou non : [[],[]], attendu …
    FAIL: un mot dont seul l'article change n'a rien de flamand à apprendre, comme srs.supports le juge : [[],[]], attendu …
    FAIL: be écrit l'apostrophe typographique : [], attendu …
    FAIL: une forme qu'une règle donne se cite par sa règle, pas par none : [], attendu …
  711 contrôles, 4 ÉCHEC(S)
  ```

- [ ] **Step 5: The guards.** In `flemish.js`'s `check`, replace the line
  `if (U.norm(be) === U.norm(input.nl)) why.push('be is the Dutch itself: with nothing Flemish to teach, be is null');`
  with:
  ```js
    /* Comme srs.supports le juge : pour un mot, l'article ne compte pas (« de hoofd » pour « het hoofd » n'apprend rien). */
    const same = input.kind === 'word' ? f => U.norm(U.bare(f)) : U.norm;
    if (same(be) === same(input.nl)) why.push('be is the Dutch itself: with nothing Flemish to teach, be is null');
  ```
  In the `forms` branch below it, `U.norm(forms[0]) === U.norm(input.nl)` becomes `same(forms[0]) === same(input.nl)`.
  After the line
  `if (slots(be) !== slots(input.nl)) why.push('be keeps the Dutch\'s {…} tokens: « ' + slots(input.nl) + ' »');`
  insert:
  ```js
    /* Un leurre écrit d'un autre élément (decoys.js) : le cours l'accepterait, test/content.js le refuse à Merge.
       Un mot se tape avec ou sans article (NL.ex.accepted) : les deux se comparent. */
    const decoys = (T.NL.content.byDutch || {}).decoys || {};
    const mine = new Set((input.kind === 'word' ? be.split(',') : [be]).map(f => same(f.trim())));
    Object.keys(decoys).forEach(nl => (decoys[nl] || []).forEach(d => {
      if (mine.has(U.norm(d)) || mine.has(U.norm(U.bare(d)))) why.push('« ' + d + ' » is a written wrong option of « ' + nl + ' » (src/content/decoys.js): the course would then accept it');
    }));
    /* L'apostrophe typographique, comme les règles l'écrivent ; norm confond les deux, aucun contrôle ne la verrait. */
    if (be.indexOf("'") >= 0) why.push('be writes the typographic apostrophe « ’ », as rules does: « ’t », « da’s »');
    /* none dit qu'aucune règle ne donne la forme : celle qu'une règle offre se cite par elle. */
    if (evidence === 'none') {
      const out = offered(input, U), given = Object.keys(out).find(e => out[e] === be);
      if (given) why.push(given + ' gives be: cite ' + given + ', not none');
    }
  ```

- [ ] **Step 6: Run `node test/tools/fanout.js .`.** Expected: the `flemish` line of step 3 and the last line
  `711 contrôles, KIT CONFORME` (step 4's 4 checks more).

- [ ] **Step 7: Real data (D19).** Run `node tools/content/split.js . <WS>/tmp/split-4/flemish` (the folder under
  `<WS>/tmp/` is git-ignored and is not task 11's: task 11 splits again, after task 8, into `<WS>/drafts/flemish`).
  Expected, exactly:
  ```
  vragen-kunnen 55
  doen-mensen 60
  hoeveel-landen 75
  eten-cafe 55
  kleren-wonen 60
  kalender-stad 65
  vrijetijd-gevoel 60
  beschrijven-afspraak 80
  team-natuur 80
  spoed 15
  ```
  10 batches, 605 rows (the words of units 13–34 with no `be`; the phrases come at task 8). Report these lines; the
  ledger's Measures take « task 4 Split: 10 batches, 605 rows ».

- [ ] **Step 8: `TESTING.md`.** In the `tools/fanout.js` row as tasks 1–3 leave it, the `flemish` clause goes in
  after « (`flemish`, » and nothing else in the row changes: replace (it occurs once)
  ``et un Merge de bout en bout (`flemish`, `examples` et `examples-gen`, `open`,`` with
  ``et un Merge de bout en bout (`flemish`, dont le Split se tient aux 22 unités de `UNITS`, en lots d'unités entières de 80 lignes au plus, ne recoupe rien des unités 1 à 12 sans id nommé et recoupe une ligne nommée, `be` ou non, et dont Check refuse une forme qui est un leurre écrit d'un autre élément, l'apostrophe droite, la preuve `none` d'une forme qu'une règle donne et, pour un mot, le néerlandais à l'article près ; `examples` et `examples-gen`, `open`,``.

- [ ] **Step 9: Commit.** `git add TESTING.md test/tools/fanout.js tools/content/kinds/flemish.js`;
  `git commit -m "fix(content): flemish Split held to units 13–34 in whole-unit batches of 80 rows at most; Check refuses a written wrong option, a straight apostrophe, none for a rule's form and a word's Dutch (#142)"`.
  Nothing under `src/` changes: no build, no `index.html`.

Done when: `node test/tools/fanout.js .` prints the `flemish` line of step 3 and ends `711 contrôles, KIT CONFORME`;
step 7 prints the 10 lines exactly; the commit holds the three files and no other.

### Task 5: FAN examples
Class: fan-out
Ticket: #140
Kind: examples
Drafting after: 2
Split: node tools/content/split.js . "<WS>/drafts/examples"
Check: node tools/content/check.js "<WS>/drafts/examples/<batch>"
Merged by: task 6
Reader model: sonnet
Why: D14 (source, then skip), D15 and D17 (a Tatoeba sentence with one translation is kept, the drafter writes the
other, and every written translation is read whole), D19, D27 (readers on Sonnet: the Dutch is Tatoeba's, and the
written sides go to the maintainer's reading list anyway) and D28 (a row still disputed after its second reader is
ruled by the run controller, in the ledger's Rulings). The 605 words of units 13–34 have no example sentence, so no
cloze, no tiles to order and no dictation. Split cuts every word with no hand drills and at least one candidate, in
whole units, about 40 rows a batch (`examples.MAX`, phase 3's size): **550 rows in 13 batches**, 546 of units 13–34
and 4 of units 1–12 (`overleven:w2` dag, `w3` tot ziens, `w6` sorry, `w24` natuurlijk, skipped in October and cut
again: the new pins give them new candidates), the one exception to the header's « not touched » beside D25's four.
The 13 lines Split prints, measured on the fix copy:
```
overleven-vragen 32
kunnen-doen 55
mensen-hoeveel 55
waar-landen 41
eten-cafe 46
kleren-wonen 55
kalender-stad 52
vrijetijd 27
gevoel 29
beschrijven-school 50
afspraak-team 42
reis-natuur 52
spoed 14
```
A sentence two batches both take is not refused (49 of the
146 shared candidates sit in more than one batch). The 63 words with no candidate are D25's (task 9); a word skipped here
**waits** (D14), and task 13 lists it. Check (task 2) mirrors every guard `test/content.js`, `test/dehet.js` and
`test/lang.js` 6d.4 would hold a sourced sentence to, so a bad row fails in its batch, never at Merge (call 7). Tasks 3
and 4 run beside the drafting and move no stamp (meaning, article, count of hand drills). Split and Check read
`.cache/tatoeba/extract.tsv`, which task 2's step 2 wrote in the run's worktree (`fetch.js --from "<TD>"`, then `node tools/content/tatoeba.js .`); if Split
prints `fail examples -: the kind's split threw: .cache/tatoeba/extract.tsv is missing: run node tools/content/tatoeba.js .`,
run those two commands and Split again.

**The proof.** Fix copy `%USERPROFILE%\AppData\Local\Temp\claude\a7917b01ac072e1a\8bf7ef00-9f92-425a-8160-86aec667d00b\scratchpad\proofs\fixZ`
(CRLF; base `e40965e` = worktree `7e90be1`, then tasks 1–4 (fixed), `f002703`, `c426128`, `98999f7`, `4ab1b85`),
`.cache/` from `<TD>`. At `c426128` (task 2) Split printed the 13 lines above into `proofs\fixZ-ws\Xc5`, twice; at
`4ab1b85` (task 4), the same 13 `input.json` byte for byte. The Format's row passed Check (`proofs\fixZ-ws\Xc6`), and every quoted `fail` line was printed on a
variant (`Xc5\tmp\variants.txt`).

## Format

```json
{"id": "spoed:w1", "stamp": "fa26ba88", "sentences": [{"src": 448475, "nl": "We hebben een ambulance nodig.", "gap": "ambulance", "en": "We need an ambulance.", "enSrc": 489487, "fr": "Nous avons besoin d'une ambulance.", "frSrc": 4082}, {"src": 9713981, "nl": "Ik heb een ambulance nodig.", "gap": "ambulance", "en": "I need an ambulance.", "enSrc": 2387475, "fr": "J’ai besoin d’une ambulance.", "frSrc": null}]}
```

- One row per input row, in its order. Copy `id` and `stamp` unchanged, then give `sentences`, and no other field
  except `skip` and `unsure`.
- The input row is `{ id, stamp, copies, nl, unit, art, meaning: { fr, en }, candidates }`; a candidate
  `{ id, nl, owner, en: [{ id, text, owner }], fr: [{ id, text, owner }], tiles }`, where `en` or `fr` may be `[]`
  (D17: Tatoeba links no translation in that language). Candidates come in rank order: those with both translations
  first, then English only, then French only.
- `sentences` holds one or two sentences, the better first. Take two when two good candidates show the word in
  different places or forms. One good sentence is better than two where one is weak.
- A candidate may be offered to more than one row (146 of the 3 281 distinct candidates are): take it for one word only.
  Before Check, `grep -o '"src": *[0-9]*' "<WS>/drafts/examples/<batch>/draft.json" | tr -d ' ' | sort | uniq -d`
  prints nothing; where two rows want the same sentence, the word it shows best keeps it.
- A sentence is `{ src, nl, gap, en, enSrc, fr, frSrc }`:
  - `src` is a candidate's `id`, and `nl` is that candidate's `nl`, character for character: the sentence is taken as
    Tatoeba writes it. `je` stays `je`, and no word is changed. A candidate that would need a change is not taken.
  - `gap` is the one tile the cloze hides: the word as `nl` writes it, with its capital at the start of the sentence.
    For a word with an article, it is the noun without it (« ambulance » for « de ambulance »). For a word of several
    tiles, it is one of them (« beetje » in « een beetje »).
  - `enSrc` is the `id` of one of the candidate's `en` and `en` its `text`; `frSrc` and `fr` the same, from the
    candidate's `fr`. Take the translation that renders the sentence best, in the same register: `u` is « you » and
    « vous », `je` and `jij` are « tu ».
- **A translation Tatoeba lacks is yours to write (D17).** When the candidate's `en` (or `fr`) is `[]`, give
  `"enSrc": null` (`"frSrc": null`) and write `en` (`fr`) yourself: what the Dutch says, no more and no less (its
  tense, its negation, its number, `u` as « vous »/« you », `je` as « tu »), in Belgian French (« septante », « le GSM »)
  or plain English, with the typographic apostrophe « ’ », the same digits as the other side, no name and no `{…}`
  token. Never write a side Tatoeba links: Check refuses it. A written translation puts the row on the maintainer's
  reading list, whole (D15, `readWhole`: `written translation`); so prefer a candidate with both translations, and
  take an English-only or French-only one only when none with both fits the word. A sentence never has both sides
  written.
- Change a linked translation only when none of the linked ones fits. Then `edited` gives the reason, on one line:
  ```json
  {"src": 7799005, "nl": "Ik had hulp nodig.", "gap": "hulp", "en": "I needed help.", "enSrc": 2246023, "fr": "J’avais besoin d’aide.", "frSrc": 2497408, "edited": "fr wrote the passé simple « Il me fallut de l'aide. »: a learner says « j'avais besoin d'aide »"}
  ```
  `frSrc` stays the id of the translation you changed, and the credit file marks it adapted. Reasons: a different
  sense, a register that does not match the Dutch, a mistake, a tense no learner says, digits that `en` and `fr` do
  not share. American spelling is not. `edited` is not for a written side.
- With no sentence to take, give `"sentences": []` and `"skip": "<why, in one line>"` (D14). Read every candidate
  first: a word is skipped when none shows it in the sense `meaning` gives, or none a Flemish colleague would say. The
  word then waits; task 13 lists it for the maintainer.
- A row you doubt carries `"unsure": "<why, in one line>"`: the reader reads it first.
- Check refuses, naming the sentence (`sentence 1`, `sentence 2`): a `src` that is not one of the row's candidates
  (`src 999 is not one of the row's candidates`); an `enSrc` or `frSrc` that is not one of that candidate's
  (`frSrc 15570 is not a translation Tatoeba links to 448475`); a side with a space at either end, or an empty written
  side (`nl, gap, en and fr are each a string on one line with no space at either end`); `skip` beside a sentence
  (`skip is for a row with no sentence`); a third sentence (`sentences is a list of 0 to 2 sentences`); a changed `nl`
  (`nl is not Tatoeba's sentence 448475, « We hebben een ambulance nodig. »: a sentence is taken as Tatoeba writes it`); a written side Tatoeba links (`frSrc is null, but
  Tatoeba links 4082 to 448475: take one`); both sides written (`enSrc and frSrc are both null: a sentence keeps at
  least one translation Tatoeba links`); a changed translation with no `edited` (`fr « J’avais besoin d’aide. » is not
  Tatoeba's 2497408, « Il me fallut de l'aide. »: take it as written, or say why in edited, on one line with no space at
  either end`); `edited` with nothing changed (`edited is for a translation that is not Tatoeba's, and the linked one
  is` / `and both are`); a gap that is not the word (`gap « nodig » is not the word, one tile as nl writes it, that the
  cloze can hide`); 4 to 8 tiles; a form borrowed from a later unit or never taught (`borrows from a later unit: …`,
  `uses forms the course never teaches: …`); a form OpenTaal and `test/data/flemish.tsv` do not know; « hoe lang »
  (#128); an article before the noun that contradicts the word's (`« de ongeval » contradicts the article « het » of the
  word`); a plural or inflection a prose already writes bare in French and in English (`… would become Dutch of the
  course, and … writes it bare in French and in English (test/lang.js 6d.4)`); a default name or a `{…}` token
  (`names no one by default and holds no {…} token`; a token also prints the digits line); digits that differ (`en and
  fr do not hold the same digits`); a register tag in `en` (`en carries a register tag, which is for an item's meaning,
  not for a sentence (test/content.js)`); two sentences that are one (`the two sentences are one sentence`); and a row
  with no sentence and no `skip` (`a row with no sentence says why in skip, on one line with no space at either end`).
  Every candidate's Dutch already keeps the rules `rank` holds it to (4 to 8 tiles, nothing borrowed from a later unit
  or never taught, forms OpenTaal knows, no default name); « hoe lang », the article and a bare plural are Check's
  alone, so a candidate can still be refused for its Dutch: take another. What else is left to you is the `gap`, the
  translations and the digits.
- A verdict carries `id` and `verdict`, and no other field. No row goes to the maintainer by rule: a written or edited
  translation reaches their reading list through `readWhole`, not through a verdict.

## Reader focus

- **A written translation, read whole against the Dutch.** Where `enSrc` or `frSrc` is `null`, read the written side
  as the maintainer will: does it say exactly what `nl` says? Dispute a tense, a negation, a number, a « tu » for a
  `u` or a « vous » for a `je`, a word added or dropped, a name (Check refuses only the default ones), French that is
  not Belgian, a straight apostrophe. Read these
  rows first, with the `edited` ones.
- **The sense.** The word in the sentence has the sense `meaning` gives, not a homograph or another use: « de brand »
  the fire, not « branden » to burn; « de ploeg » the team, not « ploegen » to plough; « recht » as the meaning says.
  Dispute a sentence that shows the word's form in another sense.
- **Flanders.** Would a Flemish colleague read it and find it natural? Standard Dutch that Flanders also uses is right.
  Dispute what only the Netherlands says (« hartstikke », « doei », « pinnen », « een kopje koffie »). `je` and `jij`
  stay as Tatoeba wrote them; they are not a reason to dispute.
- **The content.** It suits an adult learning at work: no violence, no politics, no religion, nothing a colleague
  would find odd out of context.
- **The linked translations.** `en` and `fr` say what `nl` says, in its register. An `edited` reason is true, and the
  edit is the smallest that fixes it.
- **The gap.** Hiding it leaves a sentence the learner can complete from the meaning: it is the word, not a neighbour.
- **One sentence, one word.** Two rows of the batch do not share a `src` (the Format's `grep … uniq -d` prints
  nothing); dispute the row that could take another candidate.
- **Two sentences** are not near-copies of each other.
- **A `skip`.** Read the candidates: is there really none to take? A both-translation candidate that fits is not to be
  skipped for a written one, nor the reverse.
- `unsure` rows first, then rows with a `null` side or `edited`.

### Task 6: Merge examples
Class: mechanical
Ticket: #140
Merges: examples
Promises: none
Why: D14, D17 and D26. Task 5's drafters, its readers and the run controller have settled every row of the kind
`examples`, and this task carries the rows into `src/`: `tools/content/merge.js` runs task 2's kind, which writes each
taken row's sentences into `src/content/sourced.js` under the word's Dutch and rewrites `docs/attribution/tatoeba.tsv`
whole, one line per Tatoeba sentence, a written side as `-` in its two columns and its language in `adapted` (D17). A
row with no sentence (`skip`) writes nothing: the word waits (D14). A word that gains a sentence gains the sentence
exercises, so `test/content.js`'s `orthographe`, `exercices`, `séquence` and `sourcées` lines move, and its check count
grows, and `test/dehet.js`'s `articles en phrase` line counts the articles the merged sentences write before their noun;
nothing else of the suite counts a sentence. **`AHEAD_BUDGET` stays 136** (D26): the 136 borrowing sentences are
hand-written in units 1–12 and borrow forms units 13–34 teach; a sourced sentence of units 13–34 cannot borrow forward
(Check refuses `borrows from a later unit`), so the count neither rises nor falls, and the budget pinned both ways
passes as it is. The comment above `AHEAD_BUDGET` that forecast « Le plan 4c, qui écrit leurs phrases, peut le baisser »
is corrected to say why it cannot (step 5). `TESTING.md`'s « Encore ouvert » line, « 613 mots sur 912 n'ont pas encore
de phrase d'exemple », is recounted (step 6). This task is scripted: Merge, the build, the named suites, the counts; no
design in it, and no step edits a row.

Files:
- Modify (Merge writes them): `src/content/sourced.js`, `docs/attribution/tatoeba.tsv`
- Modify (the build writes them): `index.html`, `artifact.html`
- Modify: `test/content.js` (the comment above `const AHEAD_BUDGET = 136;`), `TESTING.md` (the « 613 mots sur 912 » line
  under « Encore ouvert »)
- Create, outside the repository: `<WS>/tmp/none-6.js`
- Test: `node test/content.js .`, `node test/smoke.js .`, `node test/lang.js .`, `node test/dehet.js .`

Interfaces:
- Consumes: task 2's `tools/content/kinds/examples.js` (`merge`, `credit`, `stamp: ['meaning', 'art', hand]`) and the
  settled rows of `<WS>/drafts/examples` (task 5, 13 batches, 550 rows).
- Produces: in `sourced.js`, one entry per taken word with sentences, `'<Dutch>': [{ nl, fr, en, gap, src }, …]`, `src`
  the Tatoeba number; in `tatoeba.tsv`, the 118 rows of before kept and one row per merged sentence, `-\t-` for a
  written side and `en`, `fr` or `-` in `adapted`. `AHEAD_BUDGET` 136, unchanged.

Notes:
- **Merge runs once, and a second run is harmless.** The stamp covers the meaning, the article and the number of hand
  drills, not the sourced sentences; a second run finds every row fresh and writes the same two files byte for byte (the
  proof ran it twice: `cmp` said nothing). To start over: `git checkout -- src/content/sourced.js docs/attribution/tatoeba.tsv`.
- **A `fail` line means Merge wrote nothing.** `fail examples <id>: unsettled, …`: a batch is not `accepted` or `ruled`;
  `fail examples <id>: stale, …`: a task after task 5's Split changed a word's meaning, article or hand drills, and no
  task of this plan does. Stop and report the lines; do not edit a draft, a review or a ruling, and do not run Split again.
- **Nothing to lock in `test/content.js`.** Its sourced block demands zero never-taught forms, and Check refused them in
  the batch; `AHEAD_BUDGET` is pinned both ways and cannot move (Why). A `FAIL` there means the course moved after Split:
  stop and report the line.
- **Tasks 7 and 9 Split after this commit** (header: 7 waits 3 and 6, 9 waits 6): a sentence merged here leaves every
  unit's phrase candidates, and a word set here is not cut again by `examples-gen`. Task 10's Merge writes
  `sourced.js` only (`examples-gen` has no `write`): `tatoeba.tsv` keeps these rows untouched until a later `examples`
  Merge.
- Steps 5 and 6 are a comment and a documentation line: no behaviour changes, so no test fails on the old code; the
  suite staying green is their check.
- **The proof.** Fix copy `%USERPROFILE%\AppData\Local\Temp\claude\a7917b01ac072e1a\8bf7ef00-9f92-425a-8160-86aec667d00b\scratchpad\proofs\fixZ`
  (CRLF; base `e40965e` = worktree `7e90be1`, tasks 1–4 (fixed) `f002703`, `c426128`, `98999f7`, `4ab1b85`; this task
  `50f3dfa` (fixed), `parts/patches/task-6.fixed.patch`, 6 files, +22 −2). The rows were five hand rows, not the fan-out's
  (`proofs\fixZ-ws\Xc6\drafts\examples`: a named Split of `spoed:w1`, `w2`, `w6`, `w13` and `team:w3` → `afspraak-team
  1`, `spoed 4`; each batch passed Check, every row `keep`): 5 taken, one a `skip`, 4 set, 6 sentences, 3 written
  sides, 1 edited. Every line quoted below was printed there, the before figures at `4ab1b85`, the after ones on
  `50f3dfa`; content printed `8006` at `4ab1b85` on an LF clone too (`proofs\fixZ-lf-Xc`).

- [ ] **Step 1: Keep the numbers from before.** On the tree as it stands (task 5 done, nothing merged):
  ```
  mkdir -p "<WS>/tmp"
  sh build.sh | tail -n 1 > "<WS>/tmp/build-6-before.txt"
  node test/content.js . > "<WS>/tmp/content-6-before.txt"
  node test/smoke.js . > "<WS>/tmp/smoke-6-before.txt"
  node test/lang.js . > "<WS>/tmp/lang-6-before.txt"
  node test/dehet.js . > "<WS>/tmp/dehet-6-before.txt"
  ```
  Expected: build `built (local only) index.html (903486 bytes), artifact.html (902872 bytes)` (a replay's sizes,
  measured after tasks 1–4: a task before this one that changes `src/` moves them; take what prints); content ends `8006 contrôles, CONTENU
  CONFORME` (after tasks 1–4, on a CRLF and an LF checkout alike; one `ok` per line of each `src/content/*.js` is among
  them, so a line Merge adds counts) and prints `  séquence        136 / 557 phrases empruntent en avant (budget 136)` and
  `  sourcées        143 phrase(s) sur 99 mot(s), 118 de Tatoeba créditée(s)`; smoke ends `ALL CHECKS PASSED` and prints
  `  items           1048  (words 912, phrases 114, patterns 22)`; lang ends `25449 contrôles, LANGUE CONFORME` (220 s in
  the proof); dehet ends `DE/HET : TOUT EST CONFORME` and prints `  articles en phrase  106`. Then write
  `<WS>/tmp/none-6.js` with the Write tool:
  ```js
  /* Les mots du cours sans phrase d'exemple, par unité : pour la ligne « Encore ouvert » de TESTING.md (tâche 6). */
  const path = require('path');
  const ROOT = path.resolve(process.argv[2]);
  const browser = require(path.join(ROOT, 'test', 'lib', 'browser'));
  const NL = browser.open({ root: ROOT, seed: browser.SEED, skip: [browser.APP] }).NL;
  NL.state.open().then(() => {
    NL.content.refresh();
    const words = NL.content.allItems().filter(it => it.kind === 'word');
    const none = words.filter(w => !(w.drills || []).length);
    const by = new Map();
    none.forEach(w => by.set(w.unit, (by.get(w.unit) || 0) + 1));
    console.log([...by].map(([u, n]) => u + ' ' + n).join(', '));
    console.log(none.length + ' mots sur ' + words.length + ' sans phrase d’exemple');
  });
  ```
  and run `node "<WS>/tmp/none-6.js" .`. Expected, its last line: `613 mots sur 912 sans phrase d’exemple` (the
  `TESTING.md` figure of 1 November, counted again on the copy); the line before it starts `overleven 6, ikengij 1,
  weekend 1, vragen 30, kunnen 25, …` and ends `…, spoed 15`.

- [ ] **Step 2: Run Merge.**
  ```
  node tools/content/merge.js . "<WS>/drafts/examples"
  ```
  Expected: exit 0 and exactly three lines:
  ```
  ok examples <taken> taken, <dropped> dropped
  ok sourced.js <set> set, 0 removed
  ok tatoeba.tsv <n> rows
  ```
  `<taken>` + `<dropped>` is 550 (the 13 batches' rows); `<set>` counts the taken rows with at least one sentence (a
  `skip` row is taken and sets nothing); `<n>` is 118 plus the sentences they hold. In the proof: `ok examples 5 taken,
  0 dropped`, `ok sourced.js 4 set, 0 removed`, `ok tatoeba.tsv 124 rows`. `git diff --stat` then shows
  `docs/attribution/tatoeba.tsv` and `src/content/sourced.js` only, insertions only (6 and 4 lines in the proof). Run
  it a second time: the same three lines, and `git diff --stat` unchanged. A `fail` line: stop (Notes).

- [ ] **Step 3: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (<n> bytes), artifact.html (<m> bytes)`, both larger than in
  `build-6-before.txt` (904361 and 903747 in the proof, for 6 sentences).

- [ ] **Step 4: The content check.**
  ```
  node test/content.js .
  ```
  Expected: exit 0, `CONTENU CONFORME`, and these lines moved from step 1's (the proof's values for 6 sentences on 4
  words in brackets): `orthographe` more forms (5699 → 5727); `exercices` more built, still `0 échec(s)` (16481 →
  16489); `  séquence        136 / <557 + sentences> phrases empruntent en avant (budget 136)` (136 / 563: **the first
  figure is 136**, or stop and report the line, Why); `  sourcées        <143 + sentences> phrase(s) sur <99 + set>
  mot(s), <118 + Tatoeba sentences> de Tatoeba créditée(s)` (149 / 103 / 124); the check count grows (8006 → 8054).
  Every other line, `phrases` and `ids` included, is unchanged. Any `FAIL`: stop and report it.

- [ ] **Step 5: The comment above `AHEAD_BUDGET` (D26).** In `test/content.js`, replace the line
  `     employait un de leurs mots avant qu'il soit enseigné. Le plan 4c, qui écrit leurs phrases, peut le baisser. */`
  with these three lines:
  ```js
       employait un de leurs mots avant qu'il soit enseigné. Ces 136 phrases sont écrites à la main dans les unités
       1 à 12 ; les phrases sourcées des unités 13 à 34 (plan 4c) n'empruntent rien en avant, Check le refuse avant
       Merge, et ne changent donc pas ce compte : il reste à 136 tant que ces phrases-là ne sont pas corrigées (D26). */
  ```
  (the comment that follows, « Les règles de grammar.a1c.js l'ont fait monter de 129 à 136 … », and
  `const AHEAD_BUDGET = 136;` stay). Run `node test/content.js .` again: the same lines as step 4.

- [ ] **Step 6: `TESTING.md`'s count.** Run `node "<WS>/tmp/none-6.js" .` again. Expected, its last line:
  `<n> mots sur 912 sans phrase d’exemple`, where `<n>` is 613 minus step 2's `<set>` (609 in the proof); its first line
  names the units still holding words without a sentence. Under « Encore ouvert », replace the line beginning
  `- 613 mots sur 912 n'ont pas encore de phrase d'exemple (comptés le 1er novembre 2026)` with
  ```
  - <n> mots sur 912 n'ont pas encore de phrase d'exemple (comptés après Merge examples du plan 4c) : les 63 mots que Tatoeba ne sert pas et que D25 nomme pour une phrase écrite (tâche 10 du plan 4c), et ceux que le rédacteur a passés faute de candidate qui convienne, qui attendent (D14).
  ```
  with the script's `<n>`. When step 2's `<dropped>` is 1, end the line instead with `… qui attendent (D14), et le mot
  dont la ligne a été écartée à la relecture.`; when it is 2 or more, with `… qui attendent (D14), et les <dropped> mots
  dont la ligne a été écartée à la relecture.`. The line above it (« Le contenu reste le plafond … ») is task 8's and
  stays.

- [ ] **Step 7: Smoke, lang and dehet.**
  ```
  node test/smoke.js .
  node test/lang.js .
  node test/dehet.js .
  ```
  Expected: smoke ends `ALL CHECKS PASSED`, its output as in step 1 (a sentence is not an item); lang ends `LANGUE
  CONFORME`, in the proof its output as in step 1 (`25449 contrôles`); a `6d` FAIL: Check and the guard disagree, a fault of the kit:
  stop and report the line, and do not edit `QUOTE_OK` or `SHARED_OK` (`test/lib/quoted.js`). Dehet ends
  `DE/HET : TOUT EST CONFORME`, its `  articles en phrase  <n>` at least step 1's (107 in the proof: one of the six
  sentences writes an article before its noun); a `FAIL:` line there names a sentence whose article Check accepted:
  stop and report it, a fault of the kit as for 6d.

- [ ] **Step 8: Commit.**
  ```
  git add TESTING.md artifact.html docs/attribution/tatoeba.tsv index.html src/content/sourced.js test/content.js
  git commit -m "feat(content): Merge examples: one or two Tatoeba sentences for the words of units 13–34, the translation Tatoeba lacks written for the course; AHEAD_BUDGET stays 136 (D26) (#140)"
  ```
  `git diff --stat HEAD~1` shows these six files and nothing else.

Done when: Merge printed its three `ok` lines with `<taken>` + `<dropped>` = 550, and a second run changed nothing;
`node test/content.js .` ends `CONTENU CONFORME` with `séquence 136 / … (budget 136)` and a `sourcées` line that counts
the merged sentences; the comment above `AHEAD_BUDGET` no longer says plan 4c may lower it; `TESTING.md`'s « Encore
ouvert » line carries the script's count; `node test/smoke.js .` ends `ALL CHECKS PASSED`, `node test/lang.js .`
`LANGUE CONFORME` and `node test/dehet.js .` `DE/HET : TOUT EST CONFORME`; the commit holds the six files of step 8.

### Task 7: FAN phrases
Class: fan-out
Ticket: #141
Kind: phrases
Drafting after: 3, 6
Split: node tools/content/split.js . "<WS>/drafts/phrases"
Check: node tools/content/check.js "<WS>/drafts/phrases/<batch>"
Merged by: task 8
Reader model: sonnet
Why: the design sitting's answer of 28 October 2026 to « phrases for the new units? » (« Add them »), D15, D17 (a
Tatoeba sentence with one translation is kept, the drafter writes the other, and every written translation is read
whole), D27 (readers on Sonnet: the Dutch is Tatoeba's, and the written and edited sides reach the maintainer's
reading list anyway) and D28 (a row still disputed after its second reader is ruled by the run controller, in the
ledger's Rulings). Units 1–12 have 114 phrases between them; units 13–34 have none, so a learner there meets no
phrase exercise. Each new unit gets **five** phrases from Tatoeba, through task 3's `phrases` kind: one row per unit
(`id` the unit's id), 40 candidates a row, each candidate a Tatoeba sentence that writes a word of the unit, has 3 to
8 tiles, is not an item's or an example sentence's Dutch, and holds only forms taught at or before the unit (the
header's call 2: a phrase teaches nothing new, so `AHEAD_BUDGET` stays 136). Candidates come ranked by translation
class (both, English only, French only), then by the unit's words they write (most first), then without `je`, by a
native author, fewer tiles, id (the header's call 3). Split runs after task 6 (the header's call 4): a sentence task 6
took as a word's example has left the pools, and Check refuses a phrase that repeats a drill. Measured on the proof
copy after task 6's Merge, `node tools/content/split.js . "<WS>/drafts/phrases"` prints exactly, in about 4 s:
```
vragen-waar 6
landen-kalender 6
stad-afspraak 6
team-spoed 4
```
22 rows, 880 candidates (869 with both translations, 11 English only): every unit's 40 have both but team's (29).
These counts follow the sentences task 6 merged: a replay whose task 6 took nine other sentences printed the same
four lines and measured 868 with both, 12 English only, team's 28.
Task 6 takes one or two sentences for each of about 550 words; simulated on the examples Split, every unit still
offers 40 (team 90 to 102, 18 to 21 with both). A written side sends the whole row to the maintainer, so the Format
says to prefer a candidate with both translations. Between this Split
and task 8's Merge the code lane holds at 8 (the header's Run order). Only task 9's drafting runs beside it, outside
the worktree, so no unit's `n` or `name.en` (the stamp) changes and no phrase or drill is added. Task 10 merges after
task 8, so a generated sentence never makes a merged phrase « already an example sentence ». Split and Check read
`.cache/tatoeba/extract.tsv` (task 2's step 2). Without it, Split prints `fail phrases -: the kind's split threw:
.cache/tatoeba/extract.tsv is missing: run node tools/content/tatoeba.js .`, and Check prints `fail draft.json <id>:
.cache/tatoeba/extract.tsv is missing: run node tools/content/tatoeba.js .` for each row: run
`node tools/content/fetch.js . tatoeba --from "<TD>"`, then `node tools/content/tatoeba.js .`, then Split or Check again.

**The proof.** Fix copy `proofs\fixZ` (CRLF; base `e40965e`, tasks 1, 2, 3, 4, 6 (fixed) up to `50f3dfa`), `.cache/`
from `<TD>`, workspace `proofs\fixZ-ws\Xd7`: the Split above, the counts (`tmp\count7.js`) and the example row,
which passed Check beside a `spoed` row; the quoted `fail` lines are Split's and Check's there (`tmp\variants7b.txt`,
`tmp\noextract.txt`). Task 8 merged these two rows.

## Format

```json
{"id": "team", "stamp": "a919782b", "phrases": [{"src": 8663271, "nl": "Laten we samenwerken.", "en": "Let's work together.", "enSrc": 2007724, "fr": "Travaillons ensemble.", "frSrc": 8665539}, {"src": 8771988, "nl": "Wat een team!", "en": "What a team!", "enSrc": 2254536, "fr": "Quelle équipe !", "frSrc": 3642705}, {"src": 10224945, "nl": "Ik heb pauze.", "en": "I'm on a break.", "enSrc": 10224946, "fr": "Je suis en pause.", "frSrc": null}, {"src": 8544194, "nl": "Van wie is deze computer?", "en": "Whose computer is this?", "enSrc": 5506273, "fr": "À qui est cet ordinateur ?", "frSrc": 5685829}, {"src": 7971526, "nl": "Dit is niet uw bureau.", "en": "This isn't your desk. (formal)", "enSrc": 2645979, "fr": "Ce n'est pas votre bureau.", "frSrc": 6219244}], "edited": "phrase 5: en wrote « office » for « bureau », which the unit teaches as the desk, and « uw » glossed « your » carries « (formal) »"}
```

The row is the proof copy's: a sentence task 6 took as a word's example is not among your candidates.

- One row per input row, in its order. Copy `id` and `stamp` unchanged, then give `phrases`, and no other field
  except `edited` and `unsure`. There is no `skip`: every unit offers 40 candidates, and a row always holds five
  phrases.
- The input row is `{ id, stamp, copies, unit, n, name: { fr, en }, words, candidates }`: `words` the Dutch of the
  unit's words, in unit order; a candidate `{ id, nl, owner, en: [{ id, text, owner }], fr: [{ id, text, owner }],
  tiles, words }`, its `words` the unit's words it writes, and `en` or `fr` possibly `[]` (D17: Tatoeba links no
  translation in that language). Candidates come in rank order; read them all before choosing.
- `phrases` holds exactly five, each `{ src, nl, en, enSrc, fr, frSrc }`:
  - `src` is a candidate's `id` and `nl` that candidate's `nl`, character for character: a phrase is taken as Tatoeba
    writes it, `je` stays `je`, and no word is changed. A candidate that would need a change is not taken.
  - Five phrases a learner of **this** unit would say at work or in the street in Brabant, on five different words of
    the unit where the candidates allow it, the shorter of two that fit as well (the five in any order), a question
    or two among statements. No two that say nearly the same thing (« Het is gevaarlijk. » and « Is het
    gevaarlijk? »): Check refuses only the same Dutch twice.
  - `enSrc` is the `id` of one of the candidate's `en` and `en` its `text`; `frSrc` and `fr` the same from its `fr`.
    Where Tatoeba links several, take the one that says the Dutch in its register: `u` is « you » and « vous », `je`
    and `jij` are « tu »; a tense is kept; « Ce n'était pas un accident. » for « Dat was geen ongeval. », not « Ce ne
    fut pas ». Copy a linked text as input.json has it, straight apostrophes and the no-break space (U+202F, U+00A0)
    Tatoeba's French puts before « ? ! : ; » included (`\u202f` in draft.json): a plain space there is a change, and
    Check's two texts look alike (`fr « Qui a cassé ceci ? » is not Tatoeba's 863358, « Qui a cassé ceci ? »`).
- **A translation Tatoeba lacks is yours to write (D17).** When the candidate's `en` (or `fr`) is `[]`, give
  `"enSrc": null` (`"frSrc": null`) and write `en` (`fr`): what the Dutch says, no more and no less (its tense, its
  negation, its number, `u` as « vous »/« you », `je` as « tu »), in Belgian French (« septante », « le GSM », « la
  pause de midi ») or plain English, with the typographic apostrophe « ’ », the same digits as the other side, no name
  and no `{…}` token. A written side puts the whole row on the maintainer's reading list (D15, `readWhole`: `written
  translation`), so **prefer a candidate with both translations**, and take an English-only one only when none with
  both fits the unit.
- **Edit a linked translation only when it does not say the Dutch**, and say why in `edited`, one reason for the
  whole row on one line, naming each phrase changed (`phrase 5: …; phrase 2: …`). `enSrc` (`frSrc`) stays the id of
  the translation you changed, and the credit file marks it adapted. Reasons: a sense the unit does not teach
  (« office » where the unit's `het bureau` is the desk), a tense or a register that does not match the Dutch, a
  mistake, digits that `en` and `fr` do not share, French that Belgium does not say for the unit's word (« le GSM »,
  as the course glosses `de gsm`, not « le (téléphone) portable »; « septante »), and
  **the English rules of the course**: a Dutch `u` or `uw` glossed « you » or « your » carries « (formal) » at the
  end of `en`, after its last punctuation, as every item of the course writes it, or « (informal, Flemish u) » when
  `fr` says « tu » (Tatoeba's English never carries it, so a phrase with `u` is always an edit); and no phrase's `en`
  may equal the English of an item or of another phrase of the batch without a French sense in common (Check names
  it; another batch's meet yours at task 8's Merge): give the phrase a fuller English, as the Dutch says it. American
  spelling is not a reason. `edited` is not for a written side.
- A row you doubt carries `"unsure": "<why, in one line>"`: the reader reads it first.
- Check refuses, naming the phrase (`phrase 1` to `phrase 5`): a count other than five, another field, a text not on
  one line or with a blank at an end, a `src` that is not a candidate, a changed `nl`, a written side Tatoeba links,
  both sides written, a translation Tatoeba links elsewhere, a straight apostrophe in a written side, the same Dutch
  twice, a changed translation with no `edited` or an `edited` with nothing changed, the missing tag, an English an
  item or another phrase of the batch already has, digits that differ, a name or a token, and task 3's rules on the
  Dutch (tiles, a later unit's form, spelling, « hoe lang », an item's or a drill's Dutch), which every candidate
  passed at Split and Check repeats against the course as it stands. Its line says what to change.
- A verdict carries `id` and `verdict`, and no other field. No row goes to the maintainer by rule: a written or edited
  translation reaches their reading list through `readWhole`.

## Reader focus

- **Each translation against its Dutch.** Does each of `en` and `fr` say exactly what `nl` says? Dispute a tense, a
  negation, a number, a « tu » for a `u` or a « vous » for a `je`, a word added or dropped, a sense the unit does not
  teach, French that is not Belgian. A linked translation that drifts (« I've been to the dentist. » for « Ik was bij
  de tandarts. ») and was taken as written is disputed too: the drafter edits it.
- **A phrase a learner of that unit would say in Brabant.** Would a French speaker working in Flanders say it, at
  the sense the unit's word carries? Dispute what only the Netherlands says (« hartstikke », « doei », « pinnen »),
  what no one says out of a textbook (« Is Duitsland gevaarlijk? »), and what suits a child or a soldier better than
  a colleague. `je` and `jij` as Tatoeba wrote them are not a reason to dispute. Standard Dutch that Flanders also
  uses is right.
- **Five phrases, not one five times.** No two near-duplicates; five different words of the unit where the
  candidates allowed it.
- **The English rules.** The « (formal) » / « (informal, Flemish u) » tag matches `fr` and ends `en`, after its last
  punctuation (« This isn't your desk. (formal) »), as the course's items write it: Check accepts it anywhere; an
  `edited` reason is true and the edit the smallest that fixes it.
- `unsure` rows first, then rows with a `null` side or `edited`.

### Task 8: Merge phrases
Class: mechanical
Ticket: #141
Merges: phrases
Promises: none
Why: D17 and the header's calls 1 and 2. Task 7's drafters, its readers and the run controller have settled every
row of the kind `phrases`, and this task carries them into `src/`: `tools/content/merge.js` runs task 3's kind, whose
`write()` rewrites `src/content/phrases.a1c.js` whole (22 `U('<unit>', [...])` blocks of five `P(nl, { fr, en }, src)`),
appends the 110 ids `<unit>:p0`–`p4` to `test/data/ids.tsv`, and rewrites `docs/attribution/tatoeba-phrases.tsv`, one
credit line a phrase (D17). **`AHEAD_BUDGET` stays 136**: Check refused every phrase that borrows ahead. Two guards turn
red at this Merge, and steps 4–6 handle them: `NOTE_BUDGET` (D30: lowered to 0 by plan 4d's `explanations` Merge) and
the kit fixture's resets (the credit file, and the phrase ids, whose pins refuse the fixture's own `vragen` row).

Files:
- Modify (Merge writes them): `src/content/phrases.a1c.js`, `test/data/ids.tsv`, `docs/attribution/tatoeba-phrases.tsv`
- Modify (the build writes them): `index.html`, `artifact.html`
- Modify: `test/content.js` (the explanation block, after `/* L'explication d'un élément (NL.ex.explanation …`),
  `test/tools/fanout.js` (`const beforePhrases = dir =>`, after `beforeGrammar`), `TESTING.md` (the paragraph
  « Certains de ces contrôles portent un budget … », and the line « Le contenu reste le plafond : 1048 éléments … »)
- Test: `node test/content.js .`, `node test/tools/fanout.js .`, `node test/smoke.js .`, `node test/lang.js .`

Interfaces:
- Consumes: task 3's `tools/content/kinds/phrases.js` (`write`, `stamp: [u => u.n, u => u.name.en]`, `CREDITS`,
  `file`), `UNITS` from `tools/content/kinds/words.js`, and the settled rows of `<WS>/drafts/phrases` (task 7:
  4 batches, 22 rows).
- Produces: `phrases.a1c.js` with every unit of `UNITS` and its five phrases; `ids.tsv` 1044 → 1154 lines;
  `tatoeba-phrases.tsv` 110 rows under the header; `const NOTE_BUDGET = <count>;` (110 in the run), pinned both ways;
  `beforePhrases(dir)`, which also takes the `<unit>:p<n>` lines of the units of `UNITS` out of the copy's `ids.tsv`
  and resets its credit file, when it has one, to its `#` lines and `CREDITS`, each file keeping its line end.

Notes:
- **Merge runs once, and a second run is harmless.** The stamp covers the unit's `n` and `name.en`, which no task
  touches; a second run writes the same three files byte for byte and prints `ok ids.tsv 0 added`. To start over:
  `git checkout -- src/content/phrases.a1c.js test/data/ids.tsv docs/attribution/tatoeba-phrases.tsv`.
- **A `fail` line means Merge wrote nothing.** `fail phrases <unit>: unsettled, <why>` (a probe: `… vragen:
  unsettled, disputed, no retry`): the batch controller settles it. `fail phrases -: <a> and <b> both write « … »:
  one phrase, one unit`, or `fail phrases -: <u>:p<i> « … » and <v>:p<j> « … » share the English sense « … » with
  no French sense in common: give one of them another English`: Check passes both (a probe's `kleren and eten both
  write « Is melk wit? »` passed it in one batch; task 7's Split offers 3 sentences to two units, each pair in one
  batch), and the run controller has the later unit's row redrafted as plan 4b's task 5 did (`review.json` verdict
  `dispute: « … » is also <unit>'s: take another candidate`, or naming the other English, then the batch controller,
  then Merge again). `fail draft.json <unit>: phrase <n> « … » is already …`, then `fail review.json -: draft.json
  missing or failing` and `fail phrases -: batch <b> does not pass Check`: the course moved since Split (Merge runs
  Check again): stop and report the lines. Do not edit a draft, a review or a ruling, and do not run Split again.
- **`test/data/ids.tsv` is CRLF on this desktop** (`core.autocrlf=true`): Merge keeps each file's line end.
- **`test/lang.js`.** Task 3's Check mirrors 6d.4 through `examples.bareOf` at Check time; a `6d` FAIL here means
  Check and the guard disagree: stop and report the line rather than editing `QUOTE_OK` or `SHARED_OK`.
- Comments in `test/content.js`, `test/tools/fanout.js` and `TESTING.md` are French, as around them.
- **The proof.** Fix copy `proofs\fixZ` (CRLF) at `3995ee0` (`parts/patches/task-8.fixed.patch`), workspace
  `proofs\fixZ-ws\Xd8`, 22 rows Checked with `keep` (`checks/task-8.fixed.md` says how). Every expected line below
  printed there (a bare figure in parentheses is the fix copy's); Notes' `fail` lines and the dropped `vragen` on
  probe copies (`tmp\probes-8.txt`).

- [ ] **Step 1: Keep the numbers from before.** On the tree as it stands (task 7 done, nothing merged):
  ```
  mkdir -p "<WS>/tmp"
  sh build.sh | tail -n 1 > "<WS>/tmp/build-8-before.txt"
  node test/content.js . > "<WS>/tmp/content-8-before.txt"
  node test/smoke.js . > "<WS>/tmp/smoke-8-before.txt"
  node test/tools/fanout.js . > "<WS>/tmp/fanout-8-before.txt"
  node test/lang.js . > "<WS>/tmp/lang-8-before.txt"
  ```
  Expected (the fix copy's, whose task 6 merged 6 sentences: the run's task 6 moves the build, content and lang
  figures, so take what prints): build `built (local only) index.html (904361 bytes), artifact.html (903747 bytes)`;
  content `8054 contrôles, CONTENU CONFORME`, with `  explications    0 / 1048 élément(s) sans explication dans les
  deux langues (exigé : 0)`, `  phrases         0 phrase(s) de Tatoeba dans les unités, 0 créditée(s)` and
  `  ids             1044 / 1044 à leur place`; smoke `  items           1048  (words 912, phrases 114, patterns 22)`;
  fanout `  flemish        10 lots sur les 22 unités (605 lignes), 11 lignes nommées ; six règles ; Check, Merge et
  flemish.tsv` and `711 contrôles, KIT CONFORME`; lang `25449 contrôles, LANGUE CONFORME` (about 4 minutes).

- [ ] **Step 2: Run Merge.**
  ```
  node tools/content/merge.js . "<WS>/drafts/phrases"
  ```
  Expected: exit 0 and exactly four lines:
  ```
  ok phrases 22 taken, 0 dropped
  ok phrases.a1c.js 110 phrases in 22 units
  ok ids.tsv 110 added
  ok tatoeba-phrases.tsv 110 rows
  ```
  If a ruling dropped a unit, `<taken>` + `<dropped>` is 22 and each count is 5 × `<taken>` (that unit has no
  phrases, and task 13 lists it; a probe dropping `vragen`: `21 taken, 1 dropped`, then 105). `git diff --stat` shows
  the three files of Merge only, insertions only: 5, 8 and 5 lines a unit (110, 176 and 110). Run it a second time:
  the same lines but `ok ids.tsv 0 added`, and the three files unchanged. A `fail` line: Notes.

- [ ] **Step 3: Build.** `sh build.sh` prints `built (local only) index.html (<n> bytes), artifact.html (<m> bytes)`,
  both larger than in `build-8-before.txt` (917054 and 916440 on the fix copy).

- [ ] **Step 4: The two suites, red.** `node test/content.js .`: exit 1, the line
  `  FAIL: <count> élément(s) sans explication en français et en anglais : vragen:p0, vragen:p1, vragen:p2, vragen:p3, vragen:p4, kunnen:p0`
  (the first six phrase ids), then `  explications    <count> / <items> élément(s) sans explication dans les deux
  langues (exigé : 0)` and `<n> contrôles, 1 ÉCHEC(S)` (8562). **Write down `<count>`**: 5 × `<taken>`, 110 in the run;
  `<items>` is 1048 + `<count>`. Against `content-8-before.txt` these lines move and no others: `CONTENU — <items>
  éléments`, `orthographe` (more forms), `exercices` (more built), `explications`, `phrases <count> phrase(s) de
  Tatoeba dans les unités, <count> créditée(s)`, `une fiche <1035 + count> listages, <1026 + count> mots et phrases
  construits, <1026 + count> distincts`, `ids <1044 + count> / <1044 + count> à leur place`, `gardes <1026 + count>
  éléments glosés en anglais contrôlés`, and the count. `node test/tools/fanout.js .`: exit 1, and no count line: the
  fixture copies the repository's credit file and its pins of `vragen:p0`–`p4`, then merges a `vragen` row of its own.
  Its flemish line reads `11 lots sur les 22 unités (<605 + count> lignes)` (task 11's Split cuts these batches), then
  four FAILs and a CRASH, each named as task 3's tests name it (task 3 pins the checks, not their words; these are the
  fix copy's, and a replay's task 3 printed `le fichier des crédits ne tient que son en-tête`, `Merge écrit les cinq
  phrases, leurs ids et leurs crédits`, `phrases.a1c.js tient l'unité et ses phrases` and `(reading 'en')`):
  ```
    FAIL: docs/attribution/tatoeba-phrases.tsv : ses commentaires et son en-tête, aucune ligne avant la première fusion : [… the file's rows …], attendu ["unit\tnld\tnld_owner\teng\teng_owner\tfra\tfra_owner\tadapted"]
    FAIL: Merge refuse un id qu'ids.tsv épingle à une autre phrase : test/data/ids.tsv pins vragen:p0 to « <your vragen:p0> », and Merge writes « Wie is dat nu? » there
    FAIL: Merge écrit le fichier, ids.tsv et le crédit : {"code":1,…}, attendu {"code":0,…}
    FAIL: phrases.a1c.js tient l'unité et ses phrases, avec leur numéro
  CRASH TypeError: Cannot read properties of undefined (reading 'nl')
  ```
  If a ruling dropped `vragen`, the fixture's row meets no pin: the first line above, then `  FAIL: le crédit : une
  ligne par phrase, dans l'ordre du fichier, …` and `711 contrôles, 2 ÉCHEC(S)` (a probe on the fix copy, in its tests' words). Step 6 turns either green.

- [ ] **Step 5: `NOTE_BUDGET`, pinned both ways (D30).** In `test/content.js`, replace the five lines from
  `     et explanations écrivent celles des mots et des phrases dans src/content/notes.js. */` to
  `  console.log('  explications    ' + … + ' (exigé : 0)');` with these ten, `<count>` from step 4:
  ```js
       et explanations écrivent celles des mots et des phrases dans src/content/notes.js. Les phrases prises
       dans Tatoeba pour les unités 13 à 34 (plan 4c, src/content/phrases.a1c.js) attendent la leur du plan 4d :
       NOTE_BUDGET les compte, épinglé dans les deux sens comme AHEAD_BUDGET, et le Merge explanations du plan 4d,
       qui écrit leurs notes, le ramène à 0 dans le même commit (D30). */
    const NOTE_BUDGET = <count>;
    const bilingual = x => !!x && has(x.fr) && has(x.en);
    const unexplained = items.filter(x => !bilingual(NL.ex.explanation(x))).map(x => x.id);
    ok(unexplained.length <= NOTE_BUDGET, unexplained.length + ' élément(s) sans explication en français et en anglais, budget ' + NOTE_BUDGET + ' : ' + unexplained.slice(0, 6).join(', '));
    ok(unexplained.length >= NOTE_BUDGET, 'seulement ' + unexplained.length + ' élément(s) sans explication : baisser NOTE_BUDGET à ' + unexplained.length + ' pour verrouiller le gain');
    console.log('  explications    ' + unexplained.length + ' / ' + items.length + ' élément(s) sans explication dans les deux langues (budget ' + NOTE_BUDGET + ')');
  ```
  `node test/content.js .`: exit 0, `  explications    <count> / <items> élément(s) sans explication dans les deux
  langues (budget <count>)` (110 / 1158, budget 110), `séquence` as in step 1 (`136 / 563 … (budget 136)`), `<n + 1> contrôles, CONTENU CONFORME` (8563).

- [ ] **Step 6: The fixture resets the credit file and the phrase ids.** In `test/tools/fanout.js`, replace task 3's
  `const beforePhrases = dir => …` and the comment line above it (task 3 leaves the comment's words to its
  implementer; on the fix copy, the three lines from `/* Et phrases.a1c.js vidé par l'écrivain du genre phrases : ses
  phrases veulent leurs unités, de même. */` to
  `  require(path.join(dir, 'tools', 'content', 'kinds', 'phrases')).file([]).map(l => l + '\n').join(''));`) with:
  ```js
  /* Et phrases.a1c.js vidé par l'écrivain du genre phrases : ses phrases veulent leurs unités, de même ; les
     lignes <unité>:p<n> de ces unités ôtées de ids.tsv ; et son crédit (docs/attribution/tatoeba-phrases.tsv,
     quand la copie l'a) remis à ses lignes « # » et ses colonnes, comme Merge le récrit pour un fichier sans
     phrase. Chaque fichier garde ses fins de ligne : les nombres attendus ne bougent pas avec le cours. */
  const beforePhrases = dir => {
    const K = require(path.join(dir, 'tools', 'content', 'kinds', 'phrases'));
    const own = new Set(require(path.join(dir, 'tools', 'content', 'kinds', 'words')).UNITS.map(u => u.id));
    fs.writeFileSync(path.join(dir, 'src', 'content', 'phrases.a1c.js'), K.file([]).map(l => l + '\n').join(''));
    const rewrite = (f, keep, tail) => {
      if (!fs.existsSync(f)) return;
      const was = text(f), eol = /\r\n/.test(was) ? '\r\n' : '\n';
      fs.writeFileSync(f, was.split(/\r?\n/).filter(keep).concat(tail).join(eol) + eol);
    };
    rewrite(path.join(dir, 'test', 'data', 'ids.tsv'), l => !!l && !(/^[^:\t]+:p\d+\t/.test(l) && own.has(l.split(':')[0])), []);
    rewrite(path.join(dir, 'docs', 'attribution', 'tatoeba-phrases.tsv'), l => l[0] === '#', [K.CREDITS]);
  };
  ```
  `node test/tools/fanout.js .`: exit 0, `711 contrôles, KIT CONFORME` (about 30 s). `diff` against
  `fanout-8-before.txt` shows the `cours` line (`1026 sources` → `<1026 + count> sources`) and the flemish line
  (`10 lots … (605 lignes)` → `11 lots … (<605 + count> lignes)`), nothing else.

- [ ] **Step 7: `TESTING.md`.** In the paragraph that begins « Certains de ces contrôles portent un budget », replace
  the line `en anglais (la note d'un mot ou d'une phrase, la règle d'un motif), et` with these three:
  ```
  en anglais (la note d'un mot ou d'une phrase, la règle d'un motif) — sauf, jusqu'au
  plan 4d, les phrases des unités 13 à 34, que `NOTE_BUDGET` compte, épinglé dans les
  deux sens —, et
  ```
  Under « Encore ouvert », replace the line beginning `- Le contenu reste le plafond : 1048 éléments, tous de niveau
  A1 ;` with
  ```
  - Le contenu reste le plafond : <items> éléments, tous de niveau A1 ; les unités 13 à 34 ont leurs mots, treize règles de grammaire (neuf unités), quatre conversations et leurs phrases prises dans Tatoeba (cinq par unité, Merge phrases du plan 4c), dont les explications attendent le plan 4d (`NOTE_BUDGET` dans `test/content.js`).
  ```
  `<items>` as step 5's `explications` line prints it (1158). The line below it, « … mots sur 912 n'ont pas encore
  de phrase d'exemple », is task 6's and task 10's and stays.

- [ ] **Step 8: Smoke and lang.** `node test/smoke.js .` ends `ALL CHECKS PASSED` and prints
  `  items           <1048 + count>  (words 912, phrases <114 + count>, patterns 22)` (`1158  (words 912, phrases 224,
  patterns 22)`); `diff` against `smoke-8-before.txt` shows that line and the `éléments`, `QCM construits`, `course`
  and `counts` lines, nothing else. `node test/lang.js .` ends `<step 1's count + count> contrôles, LANGUE CONFORME`
  (25559; about 4 minutes), and `diff` shows that line alone; a `6d` FAIL: stop and report (Notes).

- [ ] **Step 9: Commit.**
  ```
  git add TESTING.md artifact.html docs/attribution/tatoeba-phrases.tsv index.html src/content/phrases.a1c.js test/content.js test/data/ids.tsv test/tools/fanout.js
  git commit -m "feat(content): Merge phrases: five Tatoeba phrases for each unit 13 to 34, credited in tatoeba-phrases.tsv; NOTE_BUDGET pinned both ways until plan 4d writes their notes; the kit's fixture resets the credit file and the phrase ids (#141)"
  ```
  `git diff --stat HEAD~1` shows these eight files and nothing else.

Done when: Merge printed its four `ok` lines (`<taken>` + `<dropped>` = 22) and a second run added nothing; the two
suites failed at step 4 as quoted and end `CONTENU CONFORME` and `KIT CONFORME` after steps 5 and 6; `TESTING.md` says
`NOTE_BUDGET` in both places; smoke and lang pass with step 8's lines; the commit holds the eight files of step 9.

### Task 9: FAN examples-gen
Class: fan-out
Ticket: #140
Kind: examples-gen
Drafting after: 6
Split: node tools/content/split.js . "<WS>/drafts/examples-gen"
Check: node tools/content/check.js "<WS>/drafts/examples-gen/<batch>"
Merged by: task 10
Why: D14 (source, then skip; generate only for the words the maintainer names), D25 (the 63 words with no Tatoeba
candidate on the files of 7 November get a sentence written for the course), D15 (every generated sentence is read
whole), D27 (readers on Opus, the kit's default: no `reader model` on the `Fan-out:` line, and no `Reader model:` line
here) and D28 (a row still disputed after its second reader is ruled by the run controller). The kind exists from
phase 3 (`tools/content/kinds/examples-gen.js`): Split reads `named.txt` in the kind's folder, one Dutch per line
as the word's first listing writes it, refuses a word that is not of the course, that already has sentences or that is
named twice, and cuts the named words in whole units, about 40 rows a batch (`examples.MAX`); Check holds a sentence to
the rules of a sourced one (`examples.RULES`, whose gap rule, since task 2, takes a word of one letter, « u »), to the
course's « you » (`ge`/`gij`, never `je`) and, since task 2, to one sentence and the French « ’ »; the reader writes
their own English and French of `nl` before reading the row's, and gives them in the verdict: the second, independent
translation. **In phase 3 gate 35's answer wrote `named.txt`; here D25 is the answer, so the set-up writes
`<WS>/drafts/examples-gen/named.txt` beside `format.md`, before this task's Split runs** (header, « Set-up decisions »).
Its 63 lines, verbatim (D25's words, 59 of units 13–34 and 4 of units 1–12):
```
goeiedag
dank u wel
u
amai
terwijl
zodat
de schoonmoeder
de ex
de nonkel
meerdere
regelmatig
Wallonië
Vlaanderen
Vlaams
de Belg
de ajuin
de worst
de cola
de komkommer
het dessert
het bestek
het terras
de drank
de reservatie
de zetel
de frigo
poetsen
het plafond
de plank
juni
september
Nieuwjaar
Pasen
Allerheiligen
het plein
het voetpad
het fietspad
de rotonde
de parking
het zebrapad
het kruispunt
de inwoner
de fuif
de uitstap
gamen
triestig
de opvang
de directeur
de kleuter
de speeltijd
de tekening
doorverbinden
de feedback
het loon
de opleiding
de refter
de werkplek
de werkgever
het overleg
reserveren
de tent
de haven
de spoed
```
None of the 63 is among the 550 rows task 5's Split cut (`rank` had no candidate for them), so task 6 cannot have
given one a sentence and Split accepts the file as it stands. Split prints, measured after task 6, in 0.07 s, the same
two lines and the same files on a second run and after task 8:
```
overleven-kalender 34
stad-spoed 29
```
(`overleven-kalender`: overleven 2, ikengij 1, weekend 1, vragen 2, mensen 3, hoeveel 2, landen 4, eten 4, cafe 5,
wonen 5, kalender 5; `stad-spoed`: stad 8, vrijetijd 3, gevoel 1, school 5, afspraak 1, team 7, reis 3, spoed 1.) If
Split prints `fail examples-gen -: the kind's split threw: named.txt: « <w> » already has sentences; …`, a word of the
list gained a sentence at task 6 after all: the run controller takes that line out of `named.txt`, says so in the
ledger's Rulings, and runs Split again; `named.txt is missing: …` means the set-up did not write the file. A row's
stamp is the word's meaning, article and count of hand drills; tasks 7 and 8 run beside the drafting and touch no
word, so no row goes stale before task 10. No `.cache/` is read: Split and Check need the course and
`test/data/nl-words.txt.gz` only.

**The proof.** The fix copy `<P>/fixZ` (CRLF; base `e40965e` = worktree `7e90be1`, then tasks 1, 2, 3, 4, 6 and 8
(fixed): `f002703`, `c426128`, `98999f7`, `4ab1b85`, `50f3dfa`, `3995ee0`), workspace `<P>/fixZ-ws/Xe9`. At `50f3dfa`
Split took the 63 lines into `drafts/examples-gen`; at `3995ee0` a Split into `tmp/split-t8` wrote the same files
(`diff -r`). The example row below is `spoed:w0` of a Split on a `named.txt` of seven words (`probe/…/overleven-spoed 7`:
goeiedag, dank u wel, u, de frigo, poetsen, de refter, de spoed), passed by Check with its siblings, « Dank u wel, tot
ziens! » and « Spreekt u ook Frans? » with gap « u » among them, and a `review.json` of seven `keep`: `ok input.json
7 rows`, `ok draft.json 7 rows`, `ok review.json 7 keep, 0 dispute`. Every `fail` line quoted below, and the gap forms,
were printed by Check at `50f3dfa` on a variant of those rows or of a second probe (`out/variants-*.txt`).

## Format

```json
{"id": "spoed:w0", "stamp": "e15b68da", "sentence": {"nl": "Ge moet nu naar de spoed.", "gap": "spoed", "en": "You have to go to the emergency room now.", "fr": "Tu dois aller aux urgences maintenant."}}
```

and the reader's verdict on it:

```json
{"id": "spoed:w0", "verdict": "keep", "en": "You need to go to the emergency room now.", "fr": "Tu dois aller aux urgences tout de suite."}
```

- One row per input row, in its order. Copy `id` and `stamp` unchanged, then give `sentence`, and no other field
  except `unsure`. There is no `skip`: the maintainer named these words because Tatoeba cannot serve them (D25), and
  every one gets a sentence. The input row is `{ id, stamp, copies, nl, unit, art, meaning: { fr, en } }`: no
  candidates; the sentence is yours.
- `sentence` is `{ "nl", "gap", "en", "fr" }`, exactly these four, each one line with no space at either end.
- `nl` is one sentence of plain spoken Dutch that a Flemish colleague would say as written: the word used in the sense
  `meaning` gives, in a scene of daily life or work. It has 4 to 8 tiles, its words as `NL.util.tiles` cuts them,
  punctuation left out. It reads like a person wrote it: not a sentence built only to hold the word.
- The course says you with `ge` or `gij` (« Hebt ge… », « Kunt ge… ») or with `u`. Never `je`, `jij`, `jou` or
  `jouw`.
- `gap` is the one tile the cloze hides: the word as `nl` writes it, with its capital at the start of the sentence
  (« Goeiedag »). It may take a form the cloze knows: a noun's plural (« tekeningen »), a verb's infinitive, stem or
  stem with -t (« poetsen », « poets », « poetst »), an adjective with -e (« triestige »); not a participle
  (« gepoetst »), not a past tense (« poetste »), and a separable verb is never split (« Kunt ge mij doorverbinden,
  alstublieft? », not « Ik verbind u door »). For a word with an article, it is the noun without it (« spoed » for
  « de spoed »). For a word of several tiles (« dank u wel »), it is one of them, « u » included.
- Write `nl` only from forms the course teaches up to the word's unit (#12, story 39), not even an inflection of a word
  it teaches (« oude » where it teaches « oud »). The four words of units 1–12 have little to draw on: overleven's
  26 words and 12 phrases for « goeiedag » and « dank u wel »; ikengij's for « u »; weekend's for « amai ». When Check
  refuses a form, write the sentence again with another word; do not change the word's own form.
- An article before the word's noun is the word's (« de frigo », never « het frigo »). The duration is « hoelang »
  (#128).
- `en` and `fr` say what `nl` says, no more and no less (its tense, its negation, its number), in its register: `u` is
  « vous » and « you »; `ge` and `gij` are « tu » or « vous » as the scene asks. Belgian French (« septante »,
  « le GSM »), plain English, the typographic apostrophe « ’ » in French, a number written the same way on both
  sides. `en` carries no register tag (no « (formal) », no « (informal, Flemish u) »): the tag belongs to an item's
  meaning, not to a sentence. No name and no `{naam}`, `{stad}` or `{bedrijf}` token, in any of the three.
- A row you doubt carries `"unsure": "<why, in one line>"`: the reader reads it first.
- Check refuses, naming the row: a field missing or added (`sentence has the fields nl, gap, en, fr`); a space at an
  end (`sentence: nl, gap, en and fr are each a string on one line with no space at either end`); `je` (`sentence: « je »
  is not how the course says you: ge or gij`); two sentences (`sentence: nl is one sentence, not two`); a straight quote
  in French (`sentence: fr writes the typographic apostrophe « ’ » and no straight quote`); a register tag (`sentence:
  en carries a register tag, which is for an item's meaning, not for a sentence (test/content.js)`); a gap that is not
  the word (`sentence: gap « moet » is not the word, one tile as nl writes it, that the cloze can hide`); a tile count
  outside 4 to 8 (`sentence has 3 tiles: 4 to 8`); a form of a later unit (`sentence borrows from a later unit: melk,
  frigo`); a form never taught (`sentence uses forms the course never teaches: oude`); a form OpenTaal does not know
  (`sentence: « nuu » not a form OpenTaal knows`, with the line before); the wrong article (`sentence: « het frigo »
  contradicts the article « de » of the word (test/dehet.js)`); « hoe lang » (`sentence writes « hoe lang »: the course
  writes the duration « hoelang » (#128)`); a form a prose writes bare in French and in English (`sentence: « teams »
  would become Dutch of the course, and sheets[4].title writes it bare in French and in English (test/lang.js 6d.4)`,
  with the line after); a name or a token (`sentence names no one by default and holds no {…} token`, and, when `en`
  and `fr` do not hold the same tokens, also `sentence: en and fr do not hold the same digits`); digits that differ
  (`sentence: en and fr do not hold the same digits`); a `skip` (`missing field sentence`, `unknown field skip`); a
  changed stamp (`stamp deadbeef, input has e15b68da`).
- A verdict is `{ id, verdict, en, fr }`: `keep` or `dispute: <reason>`, and **always** `en` and `fr`, your own
  translations of `nl`, written before you read the row's, each one line. Check refuses a verdict without them
  (`a verdict carries the reader's own en and fr of nl, each on one line with no space at either end`). No row goes to
  the maintainer by rule (no `for maintainer`): every generated sentence reaches their reading list whole through
  `readWhole` (D15).

## Reader focus

- **Translate `nl` before you read `en` and `fr`.** Read only `nl` and `meaning`, write your `en` and `fr`, put them
  in the verdict, then read the row's. If yours and the row's say different things, dispute, and say which reading is
  right. Wording that differs (« You have to go » / « You need to go ») is not a reason.
- **Every word is a claim.** Nothing here is Tatoeba's: read `nl` as a Flemish colleague in Brabant would hear it.
  Dispute what only the Netherlands says (« hartstikke », « doei », « pinnen », « een kopje koffie »), a dialect
  spelling the course does not teach, and Dutch that is correct but that no one says.
- **The sense.** The word is used as `meaning` says, not a homograph or another sense (« de plank » the shelf, not a
  board to stand on; « de parking » the car park; « Vlaams » the language or the adjective as the meaning gives it).
- **The gap.** With `gap` hidden, can a learner who knows the meaning complete the sentence? The word is the one that
  fits there, not one of many.
- **The register.** `u` with « vous »; `ge` or `gij` with the « tu » or « vous » the scene asks for. A shop, the
  doctor's, a stranger take `u`.
- **The translations.** `en` and `fr` say what `nl` says, no more and no less: a tense, a negation, a number, a word
  added for colour. French that is Belgian, with « ’ ».
- **The content.** It suits an adult learning at work: no violence, no politics, no religion, nothing a colleague
  would find odd out of context.
- **It reads like a person wrote it.** « De frigo is een frigo. » teaches nothing: dispute it.
- `unsure` rows first.

### Task 10: Merge examples-gen
Class: mechanical
Ticket: #140
Merges: examples-gen
Promises: none
Why: D14, D15 and D25. Task 9's drafters, its Opus readers and the run controller have settled every row of the kind
`examples-gen`, one sentence written for the course for each of the 63 words D25 names, and this task carries them into
`src/`: `tools/content/merge.js` runs the kind, which writes each taken row's sentence into `src/content/sourced.js`
under the word's Dutch as `{ nl, fr, en, gap, src: 'gen' }`. A generated sentence owes Tatoeba nothing: the kind has no
credit, Merge prints no `tatoeba.tsv` line and `docs/attribution/tatoeba.tsv` does not change (measured). Each word
gains the sentence exercises, so `test/content.js`'s figures move (step 4), its check count by 8 a sentence.
`test/dehet.js` counts the articles the sentences write before their noun, and `test/pace.js` and `test/journey.js`
replay a learner over the whole course, so their figures move with their checks passing; `test/lang.js` prints the
same. **`AHEAD_BUDGET` stays 136** (D26): Check refused `borrows from a later unit` in every batch, for units 13–34's
words and for the four of units 1–12 alike, so the first figure of `séquence` neither rises nor falls. `TESTING.md`'s
« Encore ouvert » line, written by task 6 with its count, is recounted with task 6's script (step 5). This task is
scripted: no design in it, and no step edits a row.

Files:
- Modify (Merge writes it): `src/content/sourced.js`
- Modify (the build writes them): `index.html`, `artifact.html`
- Modify: `TESTING.md` (the « <n> mots sur 912 n'ont pas encore de phrase d'exemple » line under « Encore ouvert »)
- Test: `node test/content.js .`, `node test/dehet.js .`, `node test/pace.js .`, `node test/journey.js .`,
  `node test/lang.js .`

Interfaces:
- Consumes: `tools/content/kinds/examples-gen.js` (`merge`, `stamp: examples.stamp`, `tables: ['sourced']`, `readWhole`
  `'generated sentence'`), the settled rows of `<WS>/drafts/examples-gen` (task 9: 2 batches, 63 rows), and task 6's
  `<WS>/tmp/none-6.js`.
- Produces: in `sourced.js`, one entry per taken word, `'<Dutch>': [{ nl, fr, en, gap, src: 'gen' }]`; `tatoeba.tsv`
  unchanged; `AHEAD_BUDGET` 136, unchanged; `TESTING.md`'s line with the new count.

Notes:
- **Merge runs once, and a second run is harmless.** The stamp covers the meaning, the article and the number of hand
  drills, not the sourced sentences; a second run writes the same file byte for byte (the proof ran it twice: `cmp` said
  nothing). To start over: `git checkout -- src/content/sourced.js`.
- **A `fail` line means Merge wrote nothing.** `fail examples-gen <id>: unsettled, …`: a batch is not `accepted` or
  `ruled`; `fail examples-gen <id>: stale, …`: a task after task 9's Split changed a word's meaning, article or hand
  drills, and no task of this plan does. Stop and report the lines; do not edit a draft, a review or a ruling, and do
  not run Split again.
- **`git diff --stat` after Merge names `src/content/sourced.js` and nothing else.** A second file there (the credit
  file, a lexicon) means a kind changed: stop and report.
- **Nothing to lock in `test/content.js`.** Its sourced block demands zero never-taught forms and `src` a Tatoeba number
  or `gen`, and its register guard a `u` line's `en` tag; Check held every row to both in its batch (it refuses any tag
  in `en`, task 2). A `FAIL` there means the course moved after Split: stop and report the line.
- **`test/lang.js` and `test/dehet.js`.** Check mirrors 6d.4 and dehet's article check, so no merged sentence should
  trip them. A `6d` or dehet `FAIL` means Check and the guard disagree, a fault of the kit: stop and report the line
  rather than editing `QUOTE_OK` or `SHARED_OK` (`test/lib/quoted.js`).
- **A dropped row** (ruled `drop`) leaves its word without a sentence; task 13 lists it with the words task 5 skipped.
  Step 5's line counts it, with task 6's dropped rows.
- **A merged sentence the gate or a reader later finds wrong** cannot be redrafted by Split: a named Split refuses its
  word (`named.txt: « <w> » already has sentences`), and a ruling cannot replace a row the first reader kept. The run
  controller writes the new sentence in a Rulings line that names the row (Check does not tie the reader's `keep` to
  the text it read), and has an implementer on `sonnet` put it in place in
  `<WS>/drafts/examples-gen/<batch>/draft.json` (the Edit tool), run Check on the batch, then Merge (step 2's two lines
  again; `git diff` shows the word's one line changed), `sh build.sh` and `node test/content.js .`, and commit the three
  files, verified and reviewed as gate 13's fix loop says (its step 3).
- The line in `TESTING.md` is French, as around it. Step 5 is a documentation line: no behaviour changes, so no test
  fails on the old code.
- **The proof.** The fix copy `<P>/fixZ` (CRLF; base `e40965e` = worktree `7e90be1`, then tasks 1, 2, 3, 4, 6 and 8
  (fixed): `f002703`, `c426128`, `98999f7`, `4ab1b85`, `50f3dfa`, `3995ee0`; this task `3093bf0`, exported to
  `parts/patches/task-10.fixed.patch`), workspace `<P>/fixZ-ws/Xe10`. The rows were eight hand rows, not the fan-out's:
  a `named.txt` of eight words (goeiedag, dank u wel, u, de frigo, poetsen, de zetel, de refter, de spoed; Split:
  `overleven-spoed 8`), eight sentences, seven `keep`, a dispute on
  `wonen:w6` (« De zetel is groot en nieuw. ») disputed again after its retry and ruled `drop`: `ok input.json 8 rows`,
  `ok draft.json 8 rows`, `ok review.json 7 keep, 1 dispute`, `ok retry.json 1 rows`, `ok retry-review.json 0 keep,
  1 dispute`, `ok disputes.md 1 rows`, `ok rulings.json 1 rows`. Every line quoted below was printed there
  (`<WS>/tmp/*-10-before.txt`, `*-10-after.txt`); the redraft of the Notes was run on the commit, then undone.

- [ ] **Step 1: Keep the numbers from before.** On the tree as it stands (task 9 done, nothing merged):
  ```
  mkdir -p "<WS>/tmp"
  sh build.sh | tail -n 1 > "<WS>/tmp/build-10-before.txt"
  node test/content.js . > "<WS>/tmp/content-10-before.txt"
  node test/dehet.js . > "<WS>/tmp/dehet-10-before.txt"
  node test/pace.js . > "<WS>/tmp/pace-10-before.txt"
  node test/journey.js . > "<WS>/tmp/journey-10-before.txt"
  node test/lang.js . > "<WS>/tmp/lang-10-before.txt"
  node "<WS>/tmp/none-6.js" . > "<WS>/tmp/none-10-before.txt"
  ```
  Expected (the proof's values in brackets; take what prints): build `built (local only) index.html (<n> bytes),
  artifact.html (<m> bytes)` (917054 and 916440); content ends `<n> contrôles, CONTENU CONFORME` (8563) and prints
  `  séquence        136 / <m> phrases empruntent en avant (budget 136)` and `  sourcées        <a> phrase(s) sur <b>
  mot(s), <c> de Tatoeba créditée(s)` (136 / 563 and 149 / 103 / 124); dehet ends `DE/HET : TOUT EST CONFORME` and
  prints `  articles en phrase  <r>` (107); pace ends `10 vérifications, AUCUN PROBLÈME` (166 s); journey ends
  `<j> checks, NO PROBLEMS` (2906); lang ends `<n> contrôles, LANGUE CONFORME` (25559; 298 s); `none-6.js`'s last line is
  `<k> mots sur 912 sans phrase d’exemple`, where `<k>` is the figure `TESTING.md`'s « Encore ouvert » line carries
  since task 6 (609). If `<WS>/tmp/none-6.js` is missing, write it again from task 6's step 1 (the Write tool, not a
  heredoc).

- [ ] **Step 2: Run Merge.**
  ```
  node tools/content/merge.js . "<WS>/drafts/examples-gen"
  ```
  Expected: exit 0 and exactly two lines:
  ```
  ok examples-gen <taken> taken, <dropped> dropped
  ok sourced.js <set> set, 0 removed
  ```
  `<taken>` + `<dropped>` is 63 (the two batches' rows) and `<set>` equals `<taken>` (every taken row holds one
  sentence: the kind has no `skip`). No third line. In the proof: `ok examples-gen 7 taken, 1 dropped`, `ok sourced.js
  7 set, 0 removed`. `git diff --stat` then shows `src/content/sourced.js` only, `<set>` insertions and no deletion.
  Run it a second time: the same two lines, and `git diff --stat` unchanged. A `fail` line: stop (Notes).

- [ ] **Step 3: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (<n> bytes), artifact.html (<m> bytes)`, both larger than in
  `build-10-before.txt` (918139 and 917525 in the proof, for 7 sentences).

- [ ] **Step 4: The content check.**
  ```
  node test/content.js .
  ```
  Expected: exit 0, `CONTENU CONFORME`, and these lines moved from step 1's (the proof's in brackets): `orthographe`
  more forms (6222 → 6257); `exercices` more built, still `0 échec(s)` (18359 → 18371);
  `  séquence        136 / <m + set> phrases empruntent en avant (budget 136)` (136 / 570: **the first figure is 136**,
  or stop and report the line, Why); `  sourcées        <a + set> phrase(s) sur <b + set> mot(s), <c> de Tatoeba
  créditée(s)` (156 / 110 / 124: the credited count does not move); the check count grows by 8 a sentence (8563 → 8619).
  Every other line, `phrases`, `explications` and `ids` included, is unchanged. Any `FAIL`: stop and report it.
  Then `node test/dehet.js .`, `node test/pace.js .` and `node test/journey.js .`. Expected: dehet ends `DE/HET : TOUT
  EST CONFORME` with `articles en phrase` at least step 1's `<r>` (107 → 110); pace ends `10 vérifications, AUCUN
  PROBLÈME`, its figures moved (`arriéré maximum` 650 → 688); journey ends `<j'> checks, NO PROBLEMS`, `<j'>` above
  or below `<j>` (2906 → 2908). Any other closing line, a `FAIL:` or a `PROBLÈME`/`PROBLEM` line: stop and report it.

- [ ] **Step 5: `TESTING.md`'s count.** Run `node "<WS>/tmp/none-6.js" .` again. Expected, its last line: `<n> mots sur
  912 sans phrase d’exemple`, where `<n>` is step 1's `<k>` minus step 2's `<set>` (609 − 7 = 602 in the proof); its
  first line names the units still holding words without a sentence. Under « Encore ouvert », replace task 6's line
  beginning `- <k> mots sur 912 n'ont pas encore de phrase d'exemple (comptés après Merge examples du plan 4c)` with
  ```
  - <n> mots sur 912 n'ont pas encore de phrase d'exemple (comptés après Merge examples-gen du plan 4c) : ceux dont Tatoeba avait des candidates mais que le rédacteur a passés faute d'une qui convienne, qui attendent (D14).
  ```
  with the script's `<n>`. `<d>` is task 6's dropped rows, read at the end of the line replaced (« et le mot dont la
  ligne … » is 1, « et les <x> mots dont … » is `<x>`, neither is 0), plus step 2's `<dropped>`. When `<d>` is 1, end the
  line instead with `… qui attendent (D14), et le mot dont la ligne a été écartée à la relecture.`; when it is 2 or
  more, with `… qui attendent (D14), et les <d> mots dont la ligne a été écartée à la relecture.` (In the proof `<d>` is
  0 + 1.) Edit with the Edit tool: it keeps the file's `\r\n` (315 in 315 lines in the proof).

- [ ] **Step 6: Lang.**
  ```
  node test/lang.js .
  ```
  Expected: `LANGUE CONFORME`, and the same check count as in step 1 (25559 before and after in the proof, the output
  identical; 260 s: a sentence adds no field lang.js counts, unless a 6d guard trips). A `6d` FAIL: stop and report
  (Notes).

- [ ] **Step 7: Commit.**
  ```
  git add TESTING.md artifact.html index.html src/content/sourced.js
  git commit -m "feat(content): Merge examples-gen: one sentence written for the course for each of the 63 words D25 names, read whole and merged into sourced.js with src gen; TESTING.md recounts the words without a sentence (#140)"
  ```
  `git diff --stat HEAD~1` shows these four files and nothing else.

Done when: Merge printed its two `ok` lines with `<taken>` + `<dropped>` = 63 and `<set>` = `<taken>`, no `tatoeba.tsv`
line, and a second run changed nothing; `node test/content.js .` ends `CONTENU CONFORME` with `séquence 136 / …
(budget 136)` and a `sourcées` line whose first two figures grew by `<set>` and whose third did not move;
`node test/dehet.js .` ends `DE/HET : TOUT EST CONFORME`, `node test/pace.js .` `10 vérifications, AUCUN PROBLÈME`
and `node test/journey.js .` `<j'> checks, NO PROBLEMS`; `TESTING.md`'s « Encore ouvert » line carries the script's
count after Merge examples-gen, with its drop clause; `node test/lang.js .` ends `LANGUE CONFORME`; the commit holds
the four files of step 7.

### Task 11: FAN flemish
Class: fan-out
Ticket: #142
Kind: flemish
Drafting after: 4, 8
Split: node tools/content/split.js . "<WS>/drafts/flemish"
Check: node tools/content/check.js "<WS>/drafts/flemish/<batch>"
Merged by: task 12
Reader model: sonnet
Why: the phase 4 design sitting's split (« 4c — … Flemish forms »), D15 (every new Flemish form is read whole), D27
(readers on Sonnet: a form's evidence is a rule's text, which Check matches character for character, or a pinned
Wiktionary lemma, whose presence in `be` Check verifies and whose sense only the reader judges; every new form reaches
the maintainer's reading list anyway), D28 (a row `for maintainer` or still disputed after its second reader is ruled
by the run controller, in the ledger's Rulings) and the header's calls 5 and 6. Units 1–12's words and phrases were
read in phase 3 (plan `2026-10-22`, task 9: 360 rows, 89 forms in `src/content/be.js` today); the 605 words and 110
phrases of units 13–34 have none, so a learner there is never asked « Comment le dit-on ici ? » and never sees « Ici
on dit ». Task 4 held the `flemish` kind's Split to the 22 units of `UNITS`, in whole-unit batches of at most 80 rows;
this task has their rows written, on phase 3's format: a form a Flemish colleague from Brabant says for `nl`, or
`null`, each form with its evidence. Split runs after task 8 (the phrases must exist to be cut); the stamp covers `be`
and the meaning, and tasks 9 and 10, which run between this Split and task 12, write `sourced.js` only. A `null` is
not stored, so after task 12 an unnamed `flemish` Split cuts every `null` row of units 13–34 again, as call 5 avoids
for units 1–12; no step of this run runs one, and the plan that next does stores them or narrows `OWN` first.
**Before the drafters start**, the header's set-up (« External data ») fills `.cache/kaikki/` from the main checkout's
git-ignored `.superpowers/sdd/phase-4-design/kaikki-2026-11-01/` (`nl.jsonl`, 257 235 436 bytes): the drafters look
lemmas up in `belgian.tsv`, and Check verifies `wiktionary:` evidence against it; Split does not read it.
`node tools/content/fetch.js . kaikki --from "<that folder>"` prints `ok kaikki/nl.jsonl 257235436 bytes, sha256
42aaed451d99…` the first time and `ok kaikki/nl.jsonl (cached)` after; `node tools/content/kaikki.js .` then prints
`ok .cache/kaikki/belgian.tsv 953 senses, 849 lemmas` and `ok .cache/kaikki/senses.tsv 146771 entries`. Without it,
Check refuses every `wiktionary:` row: `fail draft.json spoed:w3: .cache/kaikki/belgian.tsv is missing: run node
tools/content/kaikki.js .`.

Real data (D19), on the fix copy after task 10 (task 8's 110 phrases, drafted by a stand-in, so 715 rows: 605 words,
110 phrases), `node tools/content/split.js . "<WS>/drafts/flemish"` printed in 1.9 s, exactly:
```
vragen-kunnen 65
doen-mensen 70
hoeveel-waar 60
landen-eten 70
cafe-kleren 60
wonen-kalender 75
stad-vrijetijd 70
gevoel-beschrijven 70
school-afspraak 60
team-reis 65
natuur-spoed 50
```
**The run measures its own lines** (its phrases are task 7's) and the ledger's Measures take them. On the copy: 2
words and 30 phrases offered a rule (`rule:t` 18, `rule:da` 11, `rule:nie` 6, `rule:da+nie` 2, and `rule:nie+t`,
`rule:is`, `rule:da+is`, `rule:ge`, `rule:ge+da` once each); 67 rows list siblings; no row's `nl` holds a `{…}`
token. A named Split lands a row in the full Split's batch: task 12's proof, `split.js . <folder> team:w6 … wonen:w12`
(13 ids), printed `landen-eten 1`, `wonen-kalender 2`, `team-reis 4`, `natuur-spoed 6`.

**The proof.** Copy `%USERPROFILE%\AppData\Local\Temp\claude\a7917b01ac072e1a\8bf7ef00-9f92-425a-8160-86aec667d00b\scratchpad\proofs\fixZ`
(base `e40965e` = worktree `7e90be1`; tasks 1, 2, 3, 4, 6, 8, 10 fixed, HEAD `3093bf0`), `.cache/` filled from `<TD>`
and `kaikki-2026-11-01`; workspace `proofs\fixZ-ws\Xf11`. With `.cache/kaikki/` moved aside, Split printed the same
lines and the same `input.json`s. `natuur-spoed` drafted as this Format says (`spoed:w3` and `spoed:w1` as below,
`spoed:w7` « de huisdokter » `none`, `spoed:p0` `rule:t`, `spoed:p3` `rule:da`, the rest `null`), reviewed, its `none`
row ruled `keep`: `ok draft.json 50 rows`, `ok review.json 49 keep, 0 dispute, 1 for maintainer`, `ok disputes.md 1
rows`, `ok rulings.json 1 rows`. Every `fail` line under « Check refuses » was printed by Check on a variant of that
batch (`variants-11.txt`: 29 drafts, 3 reviews); « het bureel » for « de boom » with `wiktionary:bureel` passed.

## Format

```json
{"id": "spoed:w3", "stamp": "4ede5413", "be": "het accident, het ongeval", "evidence": "wiktionary:accident"}
{"id": "spoed:w1", "stamp": "8e88ade2", "be": null, "evidence": null}
```

- One row per input row, in its order. Copy `id` and `stamp` unchanged, then give `be` and `evidence`, and no other
  field except `unsure`. The input row is `{ id, stamp, copies, nl, kind, unit, meaning: { fr, en }, siblings,
  rules }`: `siblings` the items with the same sense (`{ nl, be }`), `rules` the forms the six rules of spoken Flemish
  give for this `nl`, under their key (`"rule:da": "Wa een team!"`), empty when none applies.
- `be` is what a Flemish colleague from Brabant says for `nl` at work, written as they say it. It is one line, with no
  space at either end.
- `be` is `null` when they say `nl` as it stands, and `evidence` is then `null` too. Most rows are `null`: there is
  no quota, and a standard word is not made Flemish for the sake of it.
- `be` is `null` when `nl` is already the Flemish word (« de refter », « de frigo », « de zetel », « de nonkel »,
  « de gsm », « de fuif », « poetsen »: units 13–34 were written with Brabant's words where they differ).
- `be` is `null` for a word whose only change would be its article, `het` to `’t`: everyone says that, in Flanders and
  in the Netherlands, so it teaches nothing Flemish, and Check refuses it. In a phrase, `’t` stays a rule like the
  others: « Is ’t gevaarlijk? ».
- `"evidence": "rule:<rules>"` means that `be` is, character for character, the text the row's `rules` holds under
  that key. Cite only a key that `rules` lists; each key there already passes Check. A rule changes every occurrence
  of its words: a form that changes only some of them is not that rule's form, cite `none`.
- `"evidence": "wiktionary:<lemma>"` names a lemma of `.cache/kaikki/belgian.tsv` (one sense per line: its lemma, part
  of speech, Belgian or Flemish labels and gloss; a lemma can have several lines, and one of them must carry the row's
  meaning) that `be` uses: « het accident, het ongeval » with `wiktionary:accident`, « de velo, de fiets » with
  `wiktionary:velo`. The lemma's gloss must be the row's meaning (Check does not compare them; the reader does):
  « bureel » is Belgian for the office, not for `het bureau` the desk.
- `"evidence": "none"` means that no rule and no lemma give the form. The row goes « for maintainer » by the kit's
  rule, with no retry; its reader gives `for maintainer: <reason>`, whatever they find, saying who says it and where.
  In this run the run controller rules it (D28), and the row stays on the maintainer's reading list (D15).
- A word may give several forms, separated by commas, with the Flemish form first: « Comment le dit-on ici ? » asks
  for the first. The standard form, with or without its article, may follow it, but never comes first: « huisarts,
  de huisdokter » for « de huisarts » puts it first.
- A phrase's `be` keeps at least 3 tiles, or all of `nl`'s if `nl` has fewer. `be` keeps `nl`'s `{naam}`, `{stad}`
  and `{bedrijf}` tokens as they are (no row of units 13–34 holds one).
- Write the typographic apostrophe, as `rules` does: « da’s », « ’t ».
- Every word of `be` is either spelled the way OpenTaal spells it, or accounted for by its evidence: the rule's form,
  the lemma, or, for `none`, the maintainer's keeping. Check names any word it cannot account for, and Merge adds each
  accounted form to `test/data/flemish.tsv` with its reason.
- `be` is never a written wrong option of another item (`src/content/decoys.js`): the course would then accept it,
  and Check refuses it.
- `siblings` lists the items with the same sense, with their `be` when they have one. Your form agrees with theirs.
- A row you doubt carries `"unsure": "<why, in one line>"`. Check still checks it, and the reader reads it first.
- A verdict carries `id` and `verdict`, and no other field.
- Check refuses, naming the row: the Dutch itself, with or without its article (`be is the Dutch itself: with nothing
  Flemish to teach, be is null`); the article alone (`only the article changes, « ’t » for « het »: everyone says that,
  so be is null`); a rule that changes nothing (`rule nie changes nothing here`); rules out of order or twice (`rules
  are cited once each, in the order kunde, ge, da, nie, t, is`); a form the rule does not give (`rule:da gives « Da was
  geen ongeval. », not be`); a form a rule gives, cited none (`rule:t gives be: cite rule:t, not none`); a lemma the
  extract lacks (`« huisdokter » has no Belgian or Flemish sense in the pinned Wiktionary extract`); a form the lemma
  does not give (`be does not use the lemma « accident »`); the standard form first, with or without its article (`a
  word's first form is the Flemish one, and here it is the Dutch itself`); a form twice or empty (`a word's forms are
  separated by commas, none empty, none twice`); a space at either end or a line break (`be is a form on one line with
  no space at either end, or null`); a straight apostrophe (`be writes the typographic apostrophe « ’ », as rules does:
  « ’t », « da’s »`); a phrase too short (`be has 2 tiles: a phrase's be has at least 3`); `null` with evidence
  (`evidence is null when be is null`); evidence misspelt (`evidence is rule:<rule>[+<rule>…], wiktionary:<lemma> or
  none`); a word no evidence accounts for (`« accidentje » is not a form OpenTaal knows, and rule:da does not account
  for it: correct it, or cite evidence none`); a decoy (`« de vélo » is a written wrong option of « de fiets »
  (src/content/decoys.js): the course would then accept it`); and on a review, `keep` on a `none` row (`the format
  sends this row to the maintainer (evidence none): its verdict is « for maintainer: <reason> »`) or `for maintainer`
  on any other (`« for maintainer » on a row the format does not send to the maintainer`).

## Reader focus

- Would a Flemish colleague from Brabant say it at work? Dispute a form that only one dialect says (West Flemish,
  Limburg), Dutch of the Netherlands passed off as Flemish, and a standard word made Flemish for the sake of it: a
  `null` is right far more often than a form.
- Does `be` mean what `meaning` says, in the same register? A meaning marked « (formal) » addresses someone with
  `u`; a `ge` there must suit the scene (a shop, a doctor's surgery, the boss).
- `ge` replaces only the subject. The mechanical `rule:ge` also turns an object `u` into `ge`, and that form is
  wrong (« Ik stuur u een mail. », « en bij u? » after a preposition). After an inverted verb, `ge` takes the verb's
  `-t`: « doet ge », run together « doede »; « Wat doe ge » and « Heeft ge » are wrong; for « heeft u », `kunde` gives
  « hebde ».
- `wat` that means « a bit »: is « wa » what is said there?
- A Wiktionary lemma can be dated, local to one city, or carry another sense than the row's. Is it current at work
  today, and is it this meaning?
- Siblings agree: the same sense gets the same Flemish form (« het team » and « de ploeg » are each other's siblings).
- `unsure` rows first, then `none` rows: on a `none` row, your reason says what you found, who says it and where,
  for the ruling.

### Task 12: Merge flemish
Class: mechanical
Ticket: #142
Merges: flemish
Promises: none
Why: D15 and D29. Task 11's drafters, its readers and the run controller have settled every row of the kind `flemish`,
and this task carries them into `src/`: `tools/content/merge.js` runs the kind (task 4's Split, phase 3's Check and
`write`), which sets each taken row's `be` in `src/content/be.js` under its source's Dutch (a `null` row writes nothing)
and adds to `test/data/flemish.tsv`, with the reason its evidence gives, each new form OpenTaal does not know. The
new forms reach the learner through « Comment le dit-on ici ? » (`vlaams`, at word rung 1 and in the phrase rungs) and
« Ici on dit ». One guard turns red at this Merge, and this task pins it (**D29**): `test/content.js` demands two
written wrong options for every item `NL.srs.supports(x, 'vlaams')` holds for (`undecoyed.length === 0`), and the new
forms' decoys are plan 4d's (`explanations-be`), so `DECOY_BUDGET` is pinned both ways, as `AHEAD_BUDGET` and task
8's `NOTE_BUDGET` are, at the count the FAIL line prints; plan 4d's `explanations-be` Merge lowers it to 0 in the same
commit. 4c does not ship, so no learner meets the random options in between. Units 1–12 gain no undecoyed item (their
forms are not cut again, task 4). `TESTING.md`'s two lines on the guard are recounted (step 7). The rest is scripted:
Merge, the build, the named suites, the counts; no step edits a row.

Files:
- Modify (Merge writes them): `src/content/be.js`, `test/data/flemish.tsv` (only when a new form is unknown to OpenTaal)
- Modify (the build writes them): `index.html`, `artifact.html`
- Modify: `test/content.js` (the « sans leurres » block, after `/* Un élément de « Comment le dit-on ici ? » sans
  leurres écrits …`), `TESTING.md` (the paragraph « Certains de ces contrôles portent un budget » and the line « Le
  contenu reste le plafond » under « Encore ouvert »)
- Modify, only if step 8 says so: `test/lib/quoted.js` (`QUOTE_OK`, `SHARED_OK`)
- Test: `node test/content.js .`, `node test/typed.js .`, `node test/tools/fanout.js .`, `node test/smoke.js .`,
  `node test/engine.js .`, `node test/pace.js .`, `node test/journey.js .`, `node test/lang.js .`

Interfaces:
- Consumes: `tools/content/kinds/flemish.js` (`stamp: ['meaning', 'be']`, `tables: ['be']`, `write`) and the settled
  rows of `<WS>/drafts/flemish` (task 11: 11 batches, 715 rows in the run).
- Produces: in `be.js`, one entry per taken row with a form, `'<Dutch>': '<be>'`, sorted; in `flemish.tsv`, one line per
  accounted form, `<form>\t<reason>`; `const DECOY_BUDGET = <count>;` in `test/content.js`, its two `ok` both ways and
  the line `  sans leurres    <count> élément(s) de « Comment le dit-on ici ? » (budget <count>)`.

Notes:
- **Merge runs once.** The stamp covers `be`, which Merge writes, so a second run prints
  `fail flemish <id>: stale, stamped <a> at Split, the source now stamps <b>`, one line per form set, exits 1 and
  writes nothing: that is expected. To start over: `git checkout -- src/content/be.js test/data/flemish.tsv`, and Merge
  runs as the first time.
- **A `fail` line on the first run means Merge wrote nothing.** `fail flemish <id>: unsettled, …`: a batch is not
  `accepted` or `ruled`; `stale` on the first run: a task after task 11's Split changed a source's meaning or `be`, and
  none of this plan does (tasks 9 and 10 write `sourced.js`); `fail flemish -: batch <b> does not pass Check`: Check
  needs `.cache/kaikki/belgian.tsv` (the header's set-up, « External data ») for every `wiktionary:` row. Stop and
  report the lines; do not edit a draft, a review or a ruling, and do not run Split again.
- **`test/content.js`'s check count** grows by one per form set, one per form `flemish.tsv` gains (its « est dans
  test/data/flemish.tsv » check) and one for the pin's second `ok`: on the copy after task 10, 8619 → 8630 at step 4
  → 8631.
- `fanout.js`'s `flemish` line does not move at this Merge: its fixture removes the `be` of every `UNITS` item before
  its Split.
- `test/typed.js` plays « Comment le dit-on ici ? » for an item with no written decoys deliberately (its `hallo` trial
  removes them): the new forms add to its « cours entier » line and its count, and nothing fails.
- Comments in `test/content.js` and the `TESTING.md` lines are French, as around them.
- **The proof.** Copy `%USERPROFILE%\AppData\Local\Temp\claude\a7917b01ac072e1a\8bf7ef00-9f92-425a-8160-86aec667d00b\scratchpad\proofs\fixZ`
  (CRLF; tasks 1, 2, 3, 4, 6, 8, 10 fixed, `3093bf0`); this task `2dad1cd`, exported to
  `parts/patches/task-12.fixed.patch` (6 files, +41 −7). Thirteen hand rows in four batches of a named Split (task 11):
  three `null`, five rule forms, two Wiktionary forms (« het accident, het ongeval », « de karoot, de wortel »), two
  `none` ruled `keep` (« de huisdokter, de huisarts », « de wasmachien, de wasmachine ») and one ruled `drop`; so 12
  taken, 9 set, 2 added. Before and after figures, step 4's red and step 5's both ways (the constant at 8 and at 10) in
  `proofs\fixZ-ws\Xf12\tmp`.

- [ ] **Step 1: Keep the numbers from before.** On the tree as it stands (task 11 done, nothing merged), about 15
  minutes:
  ```
  mkdir -p "<WS>/tmp"
  sh build.sh | tail -n 1 > "<WS>/tmp/build-12-before.txt"
  for t in content typed tools/fanout smoke engine pace journey lang; do
    node test/$t.js . > "<WS>/tmp/$(basename $t)-12-before.txt"
  done
  ```
  Expected (the copy's figures; take what prints): build `built (local only) index.html (918139 bytes), artifact.html
  (917525 bytes)`; content `8619 contrôles, CONTENU CONFORME` with `  sans leurres    0 élément(s) de « Comment le
  dit-on ici ? » (exigé : 0)`, `  leurres         66 élément(s) avec leurs leurres, 0 faute(s)` and a `tables` line
  starting `be 89`; typed `42518 contrôles, 0 en échec`; fanout `711 contrôles, KIT CONFORME` with
  `  flemish        11 lots sur les 22 unités (715 lignes), 11 lignes nommées ; six règles ; Check, Merge et flemish.tsv`;
  smoke `ALL CHECKS PASSED` with `  flemish variants 89`; engine `362 checks, ENGINE OK` with `18 mots le portent`;
  pace `10 vérifications, AUCUN PROBLÈME`; journey `2908 checks, NO PROBLEMS`; lang `25559 contrôles, LANGUE
  CONFORME` (about 5 minutes).

- [ ] **Step 2: Run Merge.**
  ```
  node tools/content/merge.js . "<WS>/drafts/flemish"
  ```
  Expected: exit 0 and exactly three lines:
  ```
  ok flemish <taken> taken, <dropped> dropped
  ok be.js <set> set, 0 removed
  ok flemish.tsv <n> added: <the forms, comma-separated>
  ```
  `<taken>` + `<dropped>` is 715; `<set>` counts the taken rows whose `be` is not `null`; with no new form unknown to
  OpenTaal the last line is `ok flemish.tsv 0 added`. The proof: `ok flemish 12 taken, 1 dropped`, `ok be.js 9 set, 0
  removed`, `ok flemish.tsv 2 added: karoot, wasmachien`. `git diff --stat` shows `src/content/be.js` (insertions only,
  `<set>` lines) and, when `<n>` > 0, `test/data/flemish.tsv` (`<n>` lines), nothing else. Write down `<set>`. A second
  run prints the `stale` lines (Notes) and changes nothing. A `fail` line on the first run: stop (Notes).

- [ ] **Step 3: Build.** `sh build.sh` prints `built (local only) index.html (<n> bytes), artifact.html (<m> bytes)`,
  both larger than in `build-12-before.txt` (918577 and 917963 in the proof, for 9 forms).

- [ ] **Step 4: The suite, red.** `node test/content.js .`: exit 1, the line
  `  FAIL: <count> élément(s) de « Comment le dit-on ici ? » sans leurres écrits : <the first six ids>`
  (the proof: `9 élément(s) … : eten:w16, wonen:w15, team:p1, team:p4, reis:p1, spoed:w3`), then
  `  sans leurres    <count> élément(s) de « Comment le dit-on ici ? » (exigé : 0)` and `… contrôles, 1 ÉCHEC(S)`.
  **Write down `<count>`** (9 in the proof; `<set>` in practice: pin what the FAIL line prints). The `tables` line reads
  `be <89 + set>` (`be 98` in the proof); no other FAIL. Any other FAIL: stop and report it, and do not pin
  `DECOY_BUDGET` until it is ruled.

- [ ] **Step 5: `DECOY_BUDGET`, pinned both ways (D29).** In `test/content.js`, replace the four lines from
  `     bonne se devine. Chacun a les siens, que le genre explanations-be écrit dans src/content/decoys.js. */` to
  `  console.log('  sans leurres    ' + undecoyed.length + ' élément(s) de « Comment le dit-on ici ? » (exigé : 0)');`
  with these nine, `<count>` from step 4:
  ```js
       bonne se devine. Chacun a les siens, que le genre explanations-be écrit dans src/content/decoys.js.
       Les formes flamandes des unités 13 à 34 (Merge flemish du plan 4c) attendent les leurs du plan 4d :
       DECOY_BUDGET les compte, épinglé dans les deux sens comme AHEAD_BUDGET, et le Merge explanations-be
       du plan 4d, qui écrit leurs leurres, le ramène à 0 dans le même commit (D29). */
    const DECOY_BUDGET = <count>;
    const undecoyed = items.filter(x => NL.srs.supports(x, 'vlaams') && !x.decoys).map(x => x.id);
    ok(undecoyed.length <= DECOY_BUDGET, undecoyed.length + ' élément(s) de « Comment le dit-on ici ? » sans leurres écrits, budget ' + DECOY_BUDGET + ' : ' + undecoyed.slice(0, 6).join(', '));
    ok(undecoyed.length >= DECOY_BUDGET, 'seulement ' + undecoyed.length + ' élément(s) sans leurres écrits : baisser DECOY_BUDGET à ' + undecoyed.length + ' pour verrouiller le gain');
    console.log('  sans leurres    ' + undecoyed.length + ' élément(s) de « Comment le dit-on ici ? » (budget ' + DECOY_BUDGET + ')');
  ```
  `node test/content.js .`: exit 0, `CONTENU CONFORME`, `  sans leurres    <count> élément(s) de « Comment le dit-on
  ici ? » (budget <count>)` (the proof: `9 … (budget 9)`, `8631 contrôles`). `diff "<WS>/tmp/content-12-before.txt"` of
  its output shows the `orthographe`, `tables`, `exercices` and `sans leurres` lines and the count, nothing else. Both
  ways was measured on the proof; nothing to do for it.

- [ ] **Step 6: The other suites.** Each against its `-12-before.txt`:
  - `node test/typed.js .` ends `<n> contrôles, 0 en échec`, `<n>` above the before figure (42518 → 42544 in the
    proof), and its `cours entier` line counts more `formes du panneau` (169 → 182).
  - `node test/tools/fanout.js .` prints the before output, `711 contrôles, KIT CONFORME`.
  - `node test/smoke.js .` ends `ALL CHECKS PASSED` with `  flemish variants <89 + set>` (98 in the proof). A
    `standaard/Vlaams` FAIL: stop and report it.
  - `node test/engine.js .` ends `362 checks, ENGINE OK`; its `<n> mots le portent` grows (18 → 22); nothing pins it.
  - `node test/pace.js .` ends `10 vérifications, AUCUN PROBLÈME`. Its printed figures move (the day table, `revenus le
    lendemain`, `arriéré maximum` 688 → 662, the exercise mix); no threshold does, and `TESTING.md` quotes none of them.
  - `node test/journey.js .` prints the before output.

- [ ] **Step 7: `TESTING.md`.** In the paragraph that begins « Certains de ces contrôles portent un budget », replace
  `guillemets n'en ont plus :` with `guillemets n'en ont plus, à deux exceptions près :`, and the two lines
  ```
  plan 4d, les phrases des unités 13 à 34, que `NOTE_BUDGET` compte, épinglé dans les
  deux sens —, et
  ```
  with
  ```
  plan 4d, les formes flamandes et les phrases des unités 13 à 34, que `DECOY_BUDGET`
  et `NOTE_BUDGET` comptent, épinglés dans les deux sens —, et
  ```
  Under « Encore ouvert », in the line « Le contenu reste le plafond », replace
  ``dont les explications attendent le plan 4d (`NOTE_BUDGET` dans `test/content.js`).`` with
  ``dont les explications attendent le plan 4d (`NOTE_BUDGET` dans `test/content.js`), et leurs formes flamandes (Merge flemish du plan 4c), dont les leurres écrits attendent le plan 4d (`DECOY_BUDGET`).``
  Each text occurs once.

- [ ] **Step 8: Lang.** `node test/lang.js .` ends `<n> contrôles, LANGUE CONFORME` (about 5 minutes; the proof:
  `25559` before and after, the same output). The new forms grow the course's Dutch (`dutchWords` in
  `test/lib/dutch.js`, which reads `be`), and two `6d` guards can trip; each one's fix is in `test/lib/quoted.js`,
  which `test/lang.js` imports, and nowhere else. `6d : « <w> » est du néerlandais du cours, son exception est de trop`
  (with `6d : « <w> » n’est plus cité nulle part, son exception est de trop` for the same word): delete `<w>`'s line
  from `QUOTE_OK`. `6d : <where> [<w>] : du néerlandais du cours, écrit pareil en français et en anglais hors de nl-BE
  — …`: when `<w>` is the same word in French and in English there, add `<w>: '<ce qu’il est>, le même en français et
  en anglais, dans <where, in French>'` as the last entry of `SHARED_OK`, in the form of its other entries, with a comma
  after the entry before it; when it is Dutch left bare, stop and report the line. Any other FAIL (among them
  `6d : la page de / het montre nu, …`): stop and report it.

- [ ] **Step 9: Commit.**
  ```
  git add TESTING.md artifact.html index.html src/content/be.js test/content.js
  git commit -m "feat(content): Merge flemish: the Flemish form of every word and phrase of units 13 to 34 that has one, each new form with its evidence, in be.js and flemish.tsv; DECOY_BUDGET pinned both ways until plan 4d writes their decoys (#142)"
  ```
  Add `test/data/flemish.tsv` to the `git add` when step 2 added to it, and `test/lib/quoted.js` when step 8 changed
  it. `git diff --stat HEAD~1` shows these files and nothing else (six in the proof).

Done when: Merge printed its three `ok` lines with `<taken>` + `<dropped>` = 715; `node test/content.js .` failed at
step 4 with the line quoted there and ends `CONTENU CONFORME` after step 5 with `sans leurres <count> … (budget
<count>)` and `tables … be <89 + set>`; the suites of steps 6 and 8 end as those steps say; `TESTING.md` carries the
three edits of step 7; the commit holds the files of step 9. The return gives Merge's three lines, `<count>`, the build's sizes before and after, and the counts
of `content.js`, `typed.js` and `lang.js` before and after.

### Task 13: GATE: the learner pass in Edge, and the reading page
Class: gate
Ticket: none
After: 6, 8, 10, 12
Show: export LEARNER_PASS_CHANNEL=msedge; echo "## build"; sh build.sh 2>&1; git status --short index.html artifact.html 2>&1; echo "## days"; node tools/learner-pass/days.js . 2>&1; echo "## corners"; node tools/learner-pass/corners.js . 2>&1; echo "## sweep"; node tools/learner-pass/sweep.js . 2>&1; echo "## rules"; node tools/learner-pass/rules.js . 2>&1; echo "## reading"; node tools/content/reading.js . "<WS>" 2>&1; echo "## unsentenced"; node tools/content/reading.js . "<WS>" --unsentenced 2>&1; echo "## budgets"; node test/content.js . 2>&1 | grep -E "^  (sans leurres|explications|séquence|sourcées|phrases|ids) |contrôles|FAIL|CRASH"
Ask: « Does `## build` of <WS>/tmp/gate-13.md hold one `built …` line and nothing under it? Is there a `PROBLEM:` line in `## days`, `## corners`, `## sweep` or `## rules`, or a line starting `fail ` under `## reading` or `## unsentenced`? Does `## days` end with `THE STUDY DAYS PLAY THROUGH`, `## corners` with `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`, `## sweep` with `EVERY TAP DOES SOMETHING` and `## rules` with `EVERY RULE SHEET OPENS`? Does `## corners` hold 10 `CONVERSATION <id>` blocks, each ending `finished after`, and does `## rules` open with `RULES 22 (`? Under `## reading`, are four kinds listed (`## examples`, `## examples-gen`, `## flemish`, `## phrases`), and does each kind's count line, `<n> rows: <t> taken, <d> dropped.`, match that kind's rows in the ledger's Batches table: `<n>` the sum of their `Rows`, `<t>` the sum of their `Kept`, `<d>` = `<n>` − `<t>`? Does `## budgets` end with a line `<n> contrôles, CONTENU CONFORME`? » The run controller answers it, on the maintainer's behalf (D28), as task 13's « Then » in the plan says.
Answer to: Rulings
Why: on 25 October 2026 the maintainer asked for a hands-on learner pass in a real browser before every learner's
check; plans 4a and 4b each ended with one (gates 10 and 9), answered by the run controller for them (D19, D23), and
D28 says the same here. Phase 4 ends with one release and the learner's check after plan 4d (D9), so this plan ends in
a draft pull request from `phase-4c` into `phase-4`, and the pass plays the branch's last commit. The four merges put
about 550 Tatoeba sentences, 63 written ones, 110 phrases and up to 715 Flemish forms into `src/content/`, and `<WS>`
holds the rows they came from; this gate shows three things at once, each from the run's own files:

- **The built page still plays, with the larger course.** `## build` rebuilds the page first: task 12's commit rebuilt
  both outputs, so a file `git status` lists there means a task left them stale, and the pass must play the page that
  ships (« Then »). `tools/learner-pass/` (its `README.md` says what each script plays) drives the committed
  `index.html` in a headless browser dressed as Safari on iPhone (390×844, touch, `fr-BE`), with a fake recogniser;
  `LEARNER_PASS_CHANNEL=msedge` picks Edge, which this desktop has. Each script exits 1 with one `PROBLEM:` line per
  fault and prints its closing line last (the Ask names the four): `days.js` one `DAY <d>` line a day played, days 0
  to 20 until spoken cards come up; `corners.js` one `CONVERSATION <id>` block per conversation of
  `NL.content.scenarios`, 10 since plan 4b; `sweep.js` a `TAPPABLE PER SCREEN (<n>) {…}` line over 16 screens;
  `rules.js` one `RULE <id> « <title> » rows <k> width 390 ok` line per rule. The pass plays the first study days, so it meets units 1–12's
  content, not the new sentences and phrases of units 13–34: those are built, every exercise of every item, by
  `test/content.js` (`exercices <n> construits, 0 échec(s)`) in the suite the verifier ran on each merge's commit. What
  only a browser sees is the shell carrying the larger page and 110 more items: load, every screen, every tap, every
  sheet at 390 px, every conversation, every rule sheet. Show writes nothing tracked: screenshots go to
  `tools/learner-pass/shots/`, which git ignores.
- **The maintainer's reading list exists and is readable (D15).** `node tools/content/reading.js . "<WS>"` reads every
  kind cut under `<WS>/drafts/` (the four of this plan) against HEAD's tables: for each kind, one count line, `<n> rows:
  <t> taken, <d> dropped. Listed: <r> ruled, <w> read whole, <s> sampled of <o> others.`, then one block per row listed
  (every `written translation`, `edited translation`, `generated sentence` and `new be`, every ruled row, and 1 in 10 of
  the others, at least 10), each with what `sourced.js`, `be.js` or the row holds for it. It runs each batch through
  its kind's Check again, so it needs `.cache/tatoeba/extract.tsv` (examples, phrases) and `.cache/kaikki/belgian.tsv`
  (flemish), both from the set-up. A merged phrase of a unit passes Check again (`phrases.js`'s `self`), and nothing
  after a kind's Merge writes its tables, so a kind that prints a `fail` line was changed after it was merged. The
  count lines against the Batches table are the Ask's third question: the run controller wrote each batch's `Rows`
  from Split's line and its `Kept` from the batch's return (« the rows the merge will take », `batch-controller.md`),
  and the list the maintainer reads at phase 4's check must be the rows that reached `src/`. `--unsentenced` lists
  every word still without an example sentence, with its examples row (`no row`, a `skip`, or a dropped row): the
  words that wait (D14, the header's « Left out »), and the number `TESTING.md`'s « Encore ouvert » line carries since
  task 10.
- **The three budgets, where the ledger can copy them.** `test/content.js` prints `séquence … (budget 136)` (D26),
  `sans leurres … (budget <DECOY_BUDGET>)` (D29) and `explications … (budget <NOTE_BUDGET>)` (D30), with its `sourcées`,
  `phrases` and `ids` counts and its closing line; the `grep` keeps those seven lines, every `FAIL:` line and a `CRASH`
  line (none on a green suite), so a red or crashed `test/content.js` shows its reason in the gate file. Plan 4d
  lowers the two new budgets to 0.

`tools/learner-pass/node_modules` exists (the set-up's `npm ci --ignore-scripts` in `tools/learner-pass/`); if Show
cannot start (no `node_modules`, no Edge for the channel: Playwright's error names it), the run stops there: the run
controller tells the maintainer the error lines, with a push notification, as for any run that stops, and the gate
stays `in progress`. `<WS>` in Show is the absolute path `run.md` gives, as in every command of this kit.

**The proof.** On the fix copy `…\scratchpad\proofs\fixZ` (CRLF; base `e40965e`, then tasks 1, 2, 3, 4, 6, 8, 10 and 12
fixed, `f002703` … `2dad1cd`; both caches filled as the set-up does; `npm ci --ignore-scripts`: `added 1 package`),
`<WS>` = `…\proofs\fixZ-ws\Xg13` with the four kinds the fixers of tasks 6, 8, 10 and 12 merged there, Show as written
ran in Edge, 535 s, into `<WS>\tmp\gate-13.md` (1685 lines); `git status --short` was empty after it. No `PROBLEM:`
or `fail ` line; the four closing lines; days 0, 1, 2, 3, 5, 7 (15, 26, 25, 28, 30, 31 waiting); 10 `CONVERSATION`
blocks with 23 `finished after` (10 of 3 turns, 13 of 4); `TAPPABLE PER SCREEN (299)`; `RULES 22 (27 chips on the
leerpad; the course lists 22 rules on 27 unit cards)` and 22 `RULE` lines, `rows 3 width 390 ok`; and:
```
built (local only) index.html (918577 bytes), artifact.html (917963 bytes)
5 rows: 5 taken, 0 dropped. Listed: 0 ruled, 4 read whole, 1 sampled of 1 others.
8 rows: 7 taken, 1 dropped. Listed: 1 ruled, 7 read whole, 0 sampled of 0 others.
13 rows: 12 taken, 1 dropped. Listed: 3 ruled, 7 read whole, 3 sampled of 3 others.
22 rows: 22 taken, 0 dropped. Listed: 0 ruled, 2 read whole, 10 sampled of 20 others.
602 words have no example sentence. Under each, its row in drafts/examples.
  sans leurres    9 élément(s) de « Comment le dit-on ici ? » (budget 9)
  explications    110 / 1158 élément(s) sans explication dans les deux langues (budget 110)
  séquence        136 / 570 phrases empruntent en avant (budget 136)
  sourcées        156 phrase(s) sur 110 mot(s), 124 de Tatoeba créditée(s)
  phrases         110 phrase(s) de Tatoeba dans les unités, 110 créditée(s)
  ids             1154 / 1154 à leur place
8631 contrôles, CONTENU CONFORME
```
The count lines (examples, examples-gen, flemish, phrases) equal the batches as the Batches table holds them: `Rows`
from `split.txt` (5, 8, 13, 22), `Kept` counted from `review.json`, `retry-review.json` and `rulings.json` as
`batch-controller.md` does (5, 7, 12, 22). 602 is task 10's `TESTING.md` figure on this copy (601 `examples: no row`,
one `skip`). In the real run the count lines read about `550`, `63`, `715` and `22 rows` (the Batches rows say what
they must equal), and the `DAY` lines and times vary (G's runs stopped at day 5); the closing lines, `RULES 22 (`, the
10 blocks and the four kinds do not. Probes on the copy, each restored: a cache moved aside gave its
`fail draft.json …: … is missing: run node tools/content/<tatoeba|kaikki>.js .` line; `DECOY_BUDGET = 10` gave
`FAIL: seulement 9 … : baisser DECOY_BUDGET à 9 …`; Merge flemish ran again only after the `2dad1cd~1` checkout
(`ok flemish 12 taken, 1 dropped`; after `git checkout --`, 9 `stale` lines). The other probes are in the design
folder's `checks/task-13.fixed.md`.

Then: a Rulings line for the gate (its question, the answer, and « (on the maintainer's behalf) »), and the gate `done`:
- **`## build` holds its one `built …` line, no `PROBLEM:` or `fail ` line, each script ends with its closing line,
  `## corners` holds 10 `CONVERSATION` blocks each ending `finished after`, `## rules` opens with `RULES 22 (`, four
  kinds are listed and each count line matches its kind's Batches rows, and `## budgets` ends `CONTENU CONFORME`.** The
  answer is « nothing ». The Rulings line copies the four count lines, the line `<n> words have no example sentence. …`
  of `## unsentenced` and the three budget lines, and says that the rows read whole (every written or edited
  translation, every generated sentence, every new Flemish form) stay on the maintainer's reading list (D15):
  `<WS>/tmp/gate-13.md`'s `## reading` is that list, and the final report and the draft pull request name its path. A
  clean gate does not stand for their reading: no script says whether a French translation says what its Dutch says or
  a form is Flemish.
- **`## build` lists a file.** A task left the committed page stale. The run controller dispatches one task controller
  (`sonnet`, description `task 13`) to commit the two rebuilt files alone (`git add index.html artifact.html`), with no
  red test (the build is the check), verified as the fix loop's step 3; the Rulings line names it; then Show again into
  `<WS>/tmp/gate-13-closing.md`.
- **A script with no closing line, or a missing block.** A script that crashes prints no `PROBLEM:` line, only its
  error (Show carries stderr into the file with `2>&1`). A missing closing line, a `## corners` with fewer than 10
  conversation blocks or a block without `finished after`, and a `## rules` that does not open with `RULES 22 (`, are
  each a fault to confirm, answered as a `PROBLEM:` line is, and reported with the script's last lines.
- **A `fail ` line under `## reading` or `## unsentenced`, or a count line that does not match its kind's Batches
  rows.** `… .cache/tatoeba/extract.tsv is missing …` or `… .cache/kaikki/belgian.tsv is missing …`: the set-up's
  cache, not a fault: fill it as the header's set-up does (for `extract.tsv`, `node tools/content/fetch.js . tatoeba
  --from <TD>` then `node tools/content/tatoeba.js .`; for `belgian.tsv`, `node tools/content/fetch.js . kaikki --from
  <the main checkout's .superpowers/sdd/phase-4-design/kaikki-2026-11-01>` then `node tools/content/kaikki.js .`) and
  run Show again into the same file. Any other `fail` (`batch <b> does not pass Check` for another reason, `unsettled`,
  `no longer an item`), or a count line that does not match: a kind's workspace changed after its Merge, so the tables
  hold rows the list does not show. The run controller names the kind, the batch and the line in the Rulings line and
  has it fixed by the fix loop below (step 2's row route, then steps 3 and 4): an implementer on `sonnet` runs, in the
  run's worktree, `node tools/content/merge.js . "<WS>/drafts/<kind>"` (for flemish, first `git checkout <task 12's
  commit in the Status table>~1 -- src/content/be.js test/data/flemish.tsv`: task 12's Notes' `git checkout --`
  restores the merged tables, and Merge then refuses every row it set as `stale`), then `node test/content.js .`,
  `node test/typed.js .`, `node test/lang.js .` and `node test/tools/fanout.js .`, each alone, then `sh build.sh`, and
  commits what Merge changed and both outputs, verified and reviewed as step 3 says; then Show again into
  `<WS>/tmp/gate-13-closing.md`, answered the same way. If that Merge leaves `git diff --stat HEAD` empty, the tables
  already hold the workspace's rows and the Batches row is the one wrong: nothing is committed (for flemish, `git
  checkout HEAD -- src/content/be.js test/data/flemish.tsv` drops the staged checkout), and the Rulings line says so
  with Merge's `ok <kind> <t> taken, <d> dropped` line.
- **A `## budgets` that ends `<n> contrôles, <k> ÉCHEC(S)`, or holds no `contrôles` line.** The verifier saw
  `test/content.js` green on task 12's commit, so a red one at the gate means the tree moved after it; its `FAIL:`
  line(s), kept by Show's `grep`, name the guard. A budget line (`… budget <N> : <ids>` or `seulement <n> … : baisser
  <BUDGET> à <n>`) or a table check: handled as a `fail` line above (the kind's Merge again by the fix loop, then Show
  into `<WS>/tmp/gate-13-closing.md`), the kind being `DECOY_BUDGET` → task 12 (flemish); `NOTE_BUDGET` and the
  `phrases` credit or `ids` checks → task 8; `AHEAD_BUDGET` or the `sourcées` credit check → task 6, or task 10 when
  the ids the FAIL names are examples-gen's words (D25's list). Any other guard: a fault to confirm, answered as a
  `PROBLEM:` line is, with the `FAIL:` line quoted. A `## budgets` with no `contrôles` line (its `CRASH` line kept by
  the `grep`): a fault to confirm, answered as a `PROBLEM:` line is, with the `CRASH` line quoted.
- **`PROBLEM:` lines and faults, answered by the run controller (D28).** The run controller dispatches one background
  subagent on `sonnet`, description `task 13`, to confirm each by hand as `tools/learner-pass/README.md` (« Reading a
  fault ») says, returning at most 10 lines, one per fault: `harness` or `app` and why. A `harness` line (a trap the
  README lists, or another the subagent shows) goes in the Rulings line with its reason; nothing is fixed. An `app`
  line is **fixed in this run**, one at a time, by the fix loop of plan 4b's gate 9:
  1. A test that fails on the old code, first (`CLAUDE.md`): the failing line is quoted. A fault only a browser sees
     (a tap, a scroll, a height) is pinned in `test/tools/learner-pass.js` when it is a judge, or by the one script
     re-run, when the test would have to be a browser, whose `PROBLEM:` line on the old code is then the red: say which.
  2. The fix, by the owner of the file. A row is fixed in place in `<WS>/drafts/<kind>/<batch>/draft.json` (the batch
     the `fail` line or the reading list names: a named Split refuses one row of a batch already cut), never in the
     generated file (`CLAUDE.md`): a generated sentence as task 10's Notes say; a changed translation carries
     `"edited": "<why>"`, in its sentence for examples, in its row for phrases (Check refuses it otherwise: `… is not
     Tatoeba's <id>, « … »: take it as written, or say why in edited …`), so that it stays on the reading list. A
     phrase's Dutch is not replaced: `test/data/ids.tsv` pins `<unit>:p<n>` to it and Merge refuses (`test/data/ids.tsv
     pins team:p2 to « Ik heb pauze. », and Merge writes « … » there`), so a wrong one is a decision no document holds
     (below). Then `node tools/content/check.js "<WS>/drafts/<kind>/<batch>"` and the kind's Merge again (for flemish
     after the checkout above). Check does not check the reader's `keep` against the edited row, so the Rulings line
     names the row and its edit. `src/` code or `tools/learner-pass/` by an implementer on `sonnet`. `src/core/` does
     not change in this plan: a fault that needs it is a decision no document holds (below).
  3. `sh build.sh`, what Merge changed and both outputs committed; the test files the fix touches or names, each
     alone, green, not the full suite; the one script that printed the fault, run again alone: its closing line and no
     `PROBLEM:`. The fix is verified and reviewed as any task's is (`task-controller.md`) before it is committed.
  4. A `src/` change after the gate's Show: Show runs again whole into `<WS>/tmp/gate-13-closing.md` (« The run file's
     lines », `Learner pass:`), then `gate-13-closing-2.md`, and so on, each answered the same way. The loop ends when
     a Show prints no `PROBLEM:` or `fail ` line and every closing line. A fault that survives its second fix is
     treated as needing a decision no document holds.
  The Rulings line lists each fault, its verdict, and the commit that fixed it. A fault that needs a decision no
  document holds (a translation whose sense is in doubt, a Flemish form the evidence does not settle, a merged phrase
  whose Dutch is wrong, a change to `src/core/`) is not guessed: the run controller writes the question in the Rulings line, tells the maintainer with a
  push notification, and carries on: the gate is `done`, with the fault named in the Rulings line, in the final report
  and in the draft pull request.
- **The words under `## unsentenced` are not a fault.** They wait (D14): the words a drafter skipped although Tatoeba
  had candidates, and any row of task 5 or task 9 dropped by its reader or a ruling. The Rulings line carries their
  count; the final report and the draft pull request name the section as the list the header's « Left out » promises.
  A generated sentence the gate or a reader finds wrong is not a missing one: it is fixed by step 2 above.
