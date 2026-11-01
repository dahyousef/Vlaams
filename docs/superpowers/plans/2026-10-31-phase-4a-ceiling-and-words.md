# Phase 4a — The ceiling and the words — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/run-controller.md`, Mode: one session
> (`one-session.md`). A run controller hands one code-lane task at a time to a task controller, runs the drafting
> lane's fan-out tasks beside it, and runs gate 10; do not use a skill's controller loop. Implementers read
> `docs/agents/plan-runs/run-notes.md` before their brief; where the notes and a command here differ, the notes win.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** the first of phase 4's four plans. A session follows the backlog: 30 places, and one more review place for
every 40 items due, up to 41, with the reserved share for new items computed on the 30 (D18), so that a course of
about 1,160 items drains instead of piling up (ADR 0007's second option, « the budget follows the backlog »). Then
the 22 new A1 units' words, about 605 of them, drafted in the kit's drafting lane from the unit list the maintainer
approved (D10), their meanings from the Wiktionary extract (D12), read by readers like every kind, merged into a
third lexicon file, each with its explanation in both languages, so that the suite is green at the plan's end. No
phrases, no grammar rules, no example sentences, no Flemish forms: plans 4b and 4c. One release and the learner's
check close the phase after plan 4d (D9).

**Architecture:** `NL.srs.compose()` computes the day's due list before the places, and adds the extra places to the
reviews only (task 1); `test/pace.js` gains a fifth learner on a course of 1,160 items, where the backlog's peak is
asserted (task 1b). The kit (`tools/content/`) gains what it lacked to create items: a kind may say where a row's
source lives (`sourceOf`, a unit here) and a kind's Split sees the ids it was given (task 3); `kaikki.js` writes a
second extract, every lemma's part of speech, gender and glosses (task 2). The `words` kind cuts one batch of slots
per new unit, checks each drafted word against OpenTaal, the gender table, the course and the extract, and its Merge
writes `src/content/lexicon.a1c.js` whole and pins the new ids in `test/data/ids.tsv` (tasks 4–6). The existing
`explanations` kind then drafts the new words' notes, its Split cutting only the sources without one (tasks 7–8).
Docs follow the course's new size (task 9), and a learner pass plays the branch before the draft pull request
(gate 10).

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`; no bundler, no runtime dependency.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`), the tools' suites in `test/tools/`.
- The content kit, `tools/content/`: Split, Check, Merge over one module per kind; pinned external files in
  `.cache/` (`lib/cache.js`): the kaikki.org Wiktionary extract, Tatoeba.
- The learner pass, `tools/learner-pass/`, headless browser through `playwright-core`.
- `gh` for tickets.

**Spec:**
- GitHub issue #12, « New vocabulary every day, English by default, and content to B1 »: story 43 (« I want the
  course to keep going past its current end »), « Content strategy », « The content factory is run, never deployed ».
- The maintainer's decisions D9–D18, taken at the phase 4 design sitting (25–31 October 2026), stated below.
- The unit list approved at the gate on 28 and 31 October 2026, in task 4's `UNITS`.
- ADR 0005 (amended), ADR 0007, ADR 0009; `GLOSSARY.md`.
- The tickets, sub-issues of #12: `#122` (tasks 1, 1b) and `#123` (tasks 2–8). Each task names its own.

## The maintainer's decisions (25–31 October 2026)

| D | Answer | Task |
|---|---|---|
| D9 | One tranche finishing A1, about 400–600 new words in new units; then one deployment and the learner's check. | 4–8 |
| D10 | Themed units after the current 12, which keep their order; frequency (Tatoeba's sentences) as a second opinion; the unit list approved at a gate before any drafting (« I approve », 28 Oct; three units and one more added 31 Oct, 22 units, about 605 words). | 4 |
| D11 | The Node content kit stays the factory (ADR 0005 amended, PR #121). | 2–8 |
| D12 | Meanings from kaikki.org's Wiktionary extract, read by readers like every kind. | 2, 4, 5 |
| D13 | Audio is a phase of its own. | — |
| D14 | Source, then skip; generate only for words the maintainer names (plan 4c). | — |
| D15 | Read whole: new Flemish forms, course-written sentences, ruled rows; the rest 1 in 20, at least 10 per kind. The words kind's rows are sampled. | 5, 7 |
| D16 | Phase 4 is several small plans, each one session with its drafting lane; content plans one after another. | set-up |
| D17 | A Tatoeba sentence with one translation is kept; the drafter writes the other (plan 4c). | — |
| D18 | The session follows the backlog: 30 places, one review place more per 40 items due, up to 41; the reserved share on the 30. « Go with 30 seats », 31 Oct, after the measurements below. Reopens the 18 Oct « 7 new a session » call on the maintainer's own word. | 1, 1b |
| D19 | The run controller rules on the maintainer's behalf and answers gate 10. Every fault the gate confirms is fixed in the run, not only filed. What can be tested before drafting is tested first. « Yes, test everything fix everything », « Both », 1 Nov. | set-up, 10 |

Measured for D18 (throwaway copy of `test/pace.js`, one session a day, 600 days, backlog = items due at dawn):

| items | right | 22 places (today) | 30 fixed | 22 → 33 | 30 → 41 |
|---|---|---|---|---|---|
| 1,160 | 85 % | peak 959, day 600: 3 | 948 / 0 | 750 / 0 | 769 / 3 |
| 1,160 | 75 % | 1,042 / 218 | 1,023 / 18 | 898 / 16 | 903 / 10 |
| 2,500 | 85 % | 2,214 / 1,729 | 2,096 / 893 | 1,847 / 603 | 1,770 / 13 |

The simulation answers right at a fixed rate, so it cannot see forgetting from late reviews: the real gain of a lower
peak is larger than the table shows. Longest day with 30 → 41: 22–23 minutes; the day's budget (120) was never near.

## How far to trust this plan

Every code-lane task was written and proved on a throwaway copy, and each brief was read by a checker against the code
as it will stand. The whole plan was then replayed once, in run order, on a fresh copy of `2a86861`: 11 tasks of 11, the
suite ended `TOUTE LA SUITE EST PASSÉE` after tasks 1b (327 s), 6 (335 s), 8 (334 s) and 9. Gate 10's Show ran word for
word in Edge: 5 min 40 s, no `PROBLEM:` line, all three closing lines, 282 taps on 16 screens. The replay fixed seven
places in this text, none of them changing a decision.

Then the parts of the drafting lane that could be tested without drafters were (D19), on a copy with the real Wiktionary
file and all 240 sample words, with stand-in meanings. That found what hand rows could not, all fixed in this text:
- **The pin was stale.** The set-up's fetch would have failed on its first line (task 2 now re-pins; 239 of the 240
  samples are in the real extract, all 240 pass the real Check, and « triestig » goes to a ruling, `evidence: course`).
- **`test/lang.js` turned red at task 6.** Its walk of the sessions stops at the day's budget and starts from the course's
  end, so the new words crowded out the open tasks: `byDutch.ask, byDutch.what jamais montré(s)` (task 6, step 6).
- **A test's example of a wrong answer became a course word**, « kat » (same step).
- **The suite outgrew the verifier's limit.** Measured with 605 stand-in words it takes about 14 and a half minutes, past
  the ten a foreground command may run. The kit's commit before this plan's run moves the verifier to the background.

The whole suite then passed on that copy with 239 words merged (8 min 32 s), `AHEAD_BUDGET` at 109.

What is still not proved:
- **The other 366 words and the real meanings.** No drafter, reader or batch controller ran. `AHEAD_BUDGET` will rise
  past 109, and `test/lang.js`'s exceptions may move: both are read in task 6.
- **One guard with some margin.** `test/smoke.js` asks that 75 % of word questions offer two wrong options of the same
  kind; the course stands at 76 % today. With the 239 words it stood at 81 %. Task 6 stops and reports if it fails.
- **The session on a real backlog.** D18's numbers are simulations at a fixed rate of right answers; the learner's check
  after plan 4d is what judges it.

## Set-up decisions

- **Branches.** Phase 4 integrates on `phase-4`, cut from `main` at the set-up. This plan's own commit is on
  `phase-4a-plan`; the set-up creates `phase-4` from `main` and the run's branch `phase-4a` from `phase-4a-plan`'s
  tip, so that `Base:` is the plan's commit. The run works in the worktree `.claude\worktrees\phase-4a` of the clone at
  `%USERPROFILE%\Desktop\Projects\Vlaams` (`run-notes.md`), pushes with `git push origin HEAD:phase-4a`, and ends in
  a draft pull request from `phase-4a` into `phase-4`, never into `main`. Plan 4b's branch is cut from `phase-4` once
  that pull request is merged by the maintainer.
- **Mode: one session** (D16): 11 tasks, two of them fan-out, one gate.
- **Who rules.** The run controller, on the maintainer's behalf, logging each ruling in the ledger's Rulings (D19; as
  the follow-ups-2 run's D4). So the plan runs as one session, with its drafting lane. Wherever a brief or the
  kit says the maintainer rules a row or answers a gate, the run controller does (`one-session.md`'s « on their word »
  included). The reading list stays the maintainer's to read after the run (D15).
- **Gate 10.** Answered by the run controller, and every confirmed fault is fixed in the run (D19; task 10, `Then:`).
- **Tickets.** Two sub-issues of #12, filed on the maintainer's word on 1 November 2026: #122 and #123.
- **The kaikki extract.** kaikki.org rewrites its file without notice: on 1 November 2026 the 22 October pin no longer
  matched (the file changed on 25 October), and no copy of the old bytes survives. So task 2 re-pins to the file
  downloaded on 1 November (257 MB), kept in the clone's git-ignored `.superpowers/sdd/phase-4-design/kaikki-2026-11-01/`.
  Once task 2 is committed and before task 5's first Check (task 7's Split reads the same run's `belgian.tsv`), the
  run controller runs, once, in the run's worktree: `node tools/content/fetch.js . kaikki/nl.jsonl --from ../../../.superpowers/sdd/phase-4-design/kaikki-2026-11-01`
  then `node tools/content/kaikki.js .` (`.cache/` is git-ignored). Tatoeba is not needed by this plan.
- **The learner pass** needs its package (`npm ci --ignore-scripts` in `tools/learner-pass/`) and a browser. This
  desktop has Edge, not Chrome: task 9 makes the channel an environment variable, and gate 10's Show sets it.
- **A word written in two batches.** With 605 slots drafted in 22 batches it will probably happen, and only task 6's
  Merge sees it. The set-up writes a Rulings line allowing the run controller, for this one reason, to change one
  verdict in a `review.json` (or `retry-review.json`) to `dispute` and dispatch the batch controller again (task 5, its
  Why). A maintainer's `drop` cannot settle a row a reader kept.
- **The set-up writes the rulings above and the maintainer's push notifications as the ledger's first Rulings
  lines**, as the follow-ups-2 run did.

## Global Constraints

Code:
- `const`, or `let` where it changes; never `var`; no optional chaining (`test/smoke.js`). Arrows for short helpers
  and callbacks, `function` declarations for longer named functions. Existing code is not converted.
- Comments and test messages match the file: French in `src/` and `test/`; English in `tools/content/`'s printed
  lines and in `docs/agents/`.
- Every fix leaves a test that fails on the old code. A refactor's check is the suite staying green; a task says
  which of its steps are refactors.

Interface text and stored data:
- Interface text lives in `src/core/fr.js` and `src/core/en.js`, under the same keys.
- Storage keys and the field names inside stored records keep their spelling. This plan changes none; `reached`
  (the frontier's index) is read as it is: appending units never moves it back.

Content and its tables:
- The six tables under `src/content/` are written by their kinds' Merge, and from this plan on
  `src/content/lexicon.a1c.js` and the new lines of `test/data/ids.tsv` by the `words` kind's Merge. No hand edit.
- The 12 existing units keep their order and their items. A new word never repeats an existing item's Dutch (it
  would fold into it as an alias and teach nothing).
- Content comes from openly licensed sources only. External data stays in the git-ignored `.cache/`, pinned by date
  and sha256; nothing from the Wiktionary extract enters a tracked file except the lemma a row cites.
- Every new word carries `fr` and `en`; a noun carries its article, checked against `test/data/dehet.tsv`; every
  token is a form OpenTaal knows or `test/data/flemish.tsv` lists with a reason.

Behaviour:
- `NL.srs.compose()` alone decides what a session contains (task 1 changes it; no other task touches it). The
  reserved share never yields (ADR 0007).
- Grading ignores the display language (ADR 0008). A language change never enters a running session (ADR 0009).
- Progress is reported as counts, never percentages.

Budgets and the build:
- `test/content.js`'s pinned budgets move only as a task says, with the measured number and the cause in a comment:
  `AHEAD_BUDGET` in task 6 (revealed borrowings), `UNEXPLAINED_BUDGET` set in task 6 and back to 0 in task 8.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with it.
- From task 6 on, `sh test/run-all.sh` takes about 15 minutes, past the ten a foreground command may run: run it in the
  background, into a file, and wait for it to finish.

Public repository:
- No personal data in a tracked file; the person is « the maintainer ». Content personalises through `{naam}`,
  `{stad}` and `{bedrijf}`.

## Review Focus

1. **The announcement equals the session when the places grow.**
   - Condition: 440 items due and nothing unmet; 100 due and 50 unmet; 40 due, of which 25 can only be said, in a
     session where the learner cannot speak (`quiet`).
   - Expected: `plan()` announces what `compose()` serves, places 41, then 32 with 9 new, then 30 computed on the 15
     due that remain (the extra places follow the list the session draws from).
   - Test: task 1, step 1 (`test/engine.js`, « LA SÉANCE SUIT L'ARRIÉRÉ »).
2. **A unit session follows its own backlog.**
   - Condition: a unit with 50 items due, the course with 500.
   - Expected: 31 places, not 41.
   - Test: task 1, step 1.
3. **A new word that is already in the course, or twice in the drafts.**
   - Condition: a drafted `nl` whose bare form norm-matches an existing word or phrase; two slots of different
     units drafting the same word; a sample word the course already has.
   - Expected: Check refuses the first (naming the item); Merge refuses the second before writing anything, naming
     both ids; the drafter drops the third and says so in `unsure`.
   - Tests: task 4, step 1 (`test/tools/fanout.js`).
4. **A noun the gender table does not know.**
   - Condition: a drafted noun absent from `test/data/dehet.tsv`, with or without a gender in the extract.
   - Expected: Check refuses it, whatever gender the extract gives, since `test/dehet.js` would refuse the noun
     after Merge; `test/dehet.js`'s `VERIFIED` map is not touched by any task.
   - Test: task 4, step 1.
5. **The frontier reaches the new units.**
   - Condition: a learner who has met three quarters of each of the 12 units' items, unit 12's among them, on the day
     the 22 units land; a stored `reached` of 11.
   - Expected: with every earlier unit at its gate, unit 13 open and announced as current, units 14–34 locked (« S’ouvre
     quand l’unité <n> aura été vue en grande partie. »), no item's record changed, `reached` moved to 12 by the
     frontier's ordinary ratchet. With only unit 12's items met, the frontier stays on unit 12, because it walks from
     unit 1.
   - Tests: `test/engine.js`, « LE SEUIL » (unchanged; lines 297–317 of `2a86861`, 328–348 once task 1 has landed) and task 6, step 5 (the report on a seeded state through
     `NL.content.courseProgress()`).

## Run order

```
1. The session follows the backlog (D18) — engine — #122 — waits none
1b. Pace's fifth learner, groot: a course of 1,160 items — mechanical — #122 — waits 1
2. The kaikki senses extract — mechanical — #123 — waits none
3. The kit: a kind's rows may come from a unit, and a kind's split sees its ids — mechanical — #123 — waits 2
4. The words kind, and an empty lexicon.a1c.js — mechanical — #123 — waits 3
5. FAN words — fan-out — #123 — waits 2, 3, 4
6. Merge words — mechanical — #123 — waits 5
7. FAN explanations, the new words — fan-out — #123 — waits 3, 6
8. Merge explanations — mechanical — #123 — waits 7
9. Docs: the course's new size, the lexicon the kit writes, the learner pass's browser — mechanical — none — waits 8
10. GATE: a learner pass in a real browser — gate — none — waits 1, 1b, 6, 8, 9
```

Tasks 1 and 1b touch `src/core/srs.js` and `test/pace.js`, nothing the kit tasks touch, so they run first while
the kit tasks wait; task 1b builds over task 1's `index.html`. Tasks 2 to 4 touch the kit in turn. The code lane
holds at task 6 until FAN words is `done`, and at task 8 until FAN explanations is `done`; FAN explanations starts
only after task 6's commit, since its Split reads the merged lexicon at HEAD.

## The run file's lines

```
Mode: one session
Fan-out: task 5 — kind words — after 2, 3, 4 — Split: node tools/content/split.js . "<WS>/drafts/words" — Check: node tools/content/check.js "<WS>/drafts/words/<batch>" — merged by task 6
Fan-out: task 7 — kind explanations — after 3, 6 — Split: node tools/content/split.js . "<WS>/drafts/explanations" — Check: node tools/content/check.js "<WS>/drafts/explanations/<batch>" — merged by task 8
Gate: task 10 — after 1, 1b, 6, 8, 9 — show: export LEARNER_PASS_CHANNEL=msedge; echo "## days"; node tools/learner-pass/days.js . 2>&1; echo "## corners"; node tools/learner-pass/corners.js . 2>&1; echo "## sweep"; node tools/learner-pass/sweep.js . 2>&1 — ask: « Did the learner pass print a `PROBLEM:` line in <WS>/tmp/gate-10.md? » The run controller answers it, as task 10's Ask says (D19). — answer to: Rulings
Learner pass: gate 10 plays the branch's last commit. If a closing task or a gate fix changes src/ after the gate's show, run that show again into <WS>/tmp/gate-10-closing.md before the final report, answer it as the gate's ask says, and give the maintainer both paths.
```

The Show is an `sh` line: the run controller runs it from a `.sh` file, as `run-notes.md` says for anything beyond a
plain command.

## Calls made while writing, for the maintainer

1. **How the extra places are counted (task 1).** `extra = Math.min(11, Math.floor(due.length / 40))` on the due
   list the session will draw from: after the unit filter (a unit session) and after the « cannot speak » filter.
   Eleven extra places means 440 due; above that the session stays at 41. The share is computed on
   `Math.min(30, budget left)`.
2. **Fifteen new items on a blank account (task 1).** `NEW_MAX = MAX_TASKS / 2` stays written as it is, so it becomes
   15: a learner with nothing due and everything unmet gets 15 new items (30 exercises) where they got 11 (22). The
   measured first day was 33–37 exercises, 7–8 minutes. On an ordinary day the reserve, 9, is what arrives.
3. **Slots, not words, at Split (task 4).** The maintainer approved units and sample words, not a word list. Split
   cuts one row per slot of a unit (its target); the drafter fills each slot, the sample words first. Check judges a
   word; Merge judges the set (no word twice across batches).
4. **Where a meaning's evidence comes from (task 4).** `evidence: wiktionary:<lemma>` names the extract's lemma;
   `course` is for a Flemish word the extract lacks (« frigo », « gsm », « plezant » are in it, « triestig », a sample, is not), and
   goes to a ruling.
5. **`AHEAD_BUDGET` rises (task 6).** A word an earlier unit's example sentence already used becomes « ahead » the
   moment a later unit teaches it: the borrowing was there, uncounted. Task 6 sets the budget to the measured count
   with the cause in its comment and lists the sentences in its return; plan 4c, which writes sentences, may lower it.
6. **The suite stays green between the two merges (tasks 6 and 8).** The « explications » check requires a note for
   every item, and the notes are drafted from the merged words. Task 6 adds `UNEXPLAINED_BUDGET`, pinned both ways to
   the number of words merged, in the idiom of `AHEAD_BUDGET`; task 8 sets it back to 0. A verifier runs the whole
   suite on every task's commit, so no task may leave it red.
7. **The explanations kind's Split cuts only what lacks a note (task 3).** Flemish skips the rows that have a `be`,
   examples the words that have drills; explanations cut every row. From task 3 it cuts the sources without a note,
   and ids given on the command line still name any row (#106), so an old note is still redrafted by id.
8. **Unit ids, names, icons, tracks and targets (task 4).** From the sitting: Dutch ids as the existing units have
   (`vragen`, `kunnen`, …), `n` 13 to 34, `level: 'A1'`, `track` by theme (`werk` for the team unit, `beide` for the
   small words, the calendar, feelings, describing, appointments; `leven` otherwise). Targets, not counts.
9. **The learner pass runs in Edge here (task 9).** `tools/learner-pass/common.js` launches `channel: 'chrome'`; this
   desktop has Edge. The channel becomes `LEARNER_PASS_CHANNEL` (default `chrome`), a refactor; gate 10's Show sets
   `msedge`.

10. **The reading sample is 1 in 10, not D15's 1 in 20 (tasks 5, 7).** `tools/content/lib/reading.js` samples 1 in 10,
    at least 10 per kind, so 61 rows of 605 per kind. No task changes the tool: the sample is twice what D15 asked,
    the safer error. Lowering it is one line, on the maintainer's word.

11. **The Wiktionary pin moves (task 2).** The old file's bytes are gone, so the 22 October pin cannot be honoured. The new
    extract differs from the old on 10 lines of `belgian.tsv`'s 953 senses, none lost (9 added, one label changed from
    Flanders to Belgium). The file stays beside the design notes because kaikki.org may rewrite it again before the run.
12. **`test/lang.js`'s walk starts from the course's beginning (task 6).** It served the last units first; it now serves
    the first, so what it shows no longer depends on what later units add. Resetting the day's budget instead would show
    every item, but would multiply the suite's slowest file by about eight.
13. **The suite gets slow (task 9).** About 14 and a half minutes at 1,035 items, measured: `test/journey.js`, run eight
    times, went from about 10 s to 41 s each, `test/lang.js` from about 40 s to 2 and a half minutes. Nothing is trimmed in
    this plan; the verifier runs it in the background, and plan 4d may look at the journeys.

Left out of this plan, for the maintainer:
- **ADR 0007's amendment**, saying which of its two options D18 took and why (the measurements above).
- **The 18 October ruling « 7 new a session »**, which D18 replaces: the #12 comment that records it gets a line.
- **Tickets' labels**: both carry `needs-triage`.
- **Phrases, grammar, sentences, Flemish forms, explanations of Flemish forms** for the new units: plans 4b–4d.
- **Tatoeba's pins** are stale too (its files changed on 31 October): plan 4c re-pins them, as task 2 does here.

## The run

### Task 1: The session follows the backlog (D18)
Class: engine
Ticket: #122
Promises: none
Why: decision D18 (2026-10-31, « Go with 30 seats »), ADR 0007's second option: the reserved share never
yields, and the budget follows the backlog. Today `compose()` has 22 places whatever the backlog, so with the
1,160 items of phase 4 the backlog peaks at 959 items and does not drain (handoff.md). After this task a
session has **30 base places**, and reviews get **one more place per 40 items due, eleven at most** (41
places). The reserved share is computed on the base places alone: `max(4, ceil(30 × 0.3))` = 9 new on a full
day, however many items are due, and the places the backlog adds go to reviews only (`nNew` equals the
reserve by arithmetic when `nDue = places − reserve`). `due` is therefore computed before `places`, with its
unit filter and its quiet/`without` filter, so a unit session (left = Infinity) follows the same rule on its
own due list. `freshItems(MAX_TASKS, uid)`, `NEW_MAX = MAX_TASKS / 2` (now 15), the daily caps (`PACE`) and
everything stored are unchanged. Two readers of `NL.srs.MAX_TASKS` follow the base without an edit: the
session on « Ce qui résiste » (`src/ui/session.js:141`, `src/ui/mistakes.js:16`) now takes up to 30 of the
most-missed items, and `test/firstrun.js:43` (`total <= MAX_TASKS`) still holds, a blank account having nothing
due. The check at 440 and 1,000 items due needs a course larger than the 430
items the course has: `test/lib/grow.js`, created here, pushes copies of the twelve units onto
`NL.content.units` in a page's `prepare`, and task 1b's fifth learner (`groot`) uses it too. One suite
follows the session's size: `test/journey.js`'s fourth section, which walked every exercise type in one
day's budget, gets a day per round (Notes). ADR 0007's amendment is the maintainer's (plan, « Left out »).

Files:
- Modify: `src/core/srs.js` (`MAX_TASKS`, line 9; the comment on `NEW_SHARE`, lines 12–16, and the two constants added after it; `compose()`'s
  comment and its first lines, 409–431)
- Modify: `test/engine.js` (the requires, line 9; `RESERVED` and its comment, lines 13–15; the `then`, line 57;
  « LA RÉSERVE », lines 237 and 255–260)
- Create: `test/lib/grow.js`
- Modify: `test/journey.js` (section 4, the line before `if (!S.begin('vandaag')) continue;`, 114–115)
- Modify: `GLOSSARY.md` (« Place », line 109; « Reserved share », line 114)
- Modify: `README.md` (« Le budget quotidien », lines 100–103)
- Modify: `TESTING.md` (the `engine.js` row, line 19)
- Test: `test/engine.js`

Lines are as of `2a86861` (the plan's base).

Notes:
- **Comments in French** in `src/core/srs.js`, `test/engine.js` and `test/lib/grow.js`; test messages in
  English, as the file's are. `GLOSSARY.md` is in English, `README.md` and `TESTING.md` in French.
- **Line endings.** The files are stored with LF; a Windows checkout may show CRLF (`core.autocrlf`). Match on
  content; `git diff` is the judge.
- **The two constants.** `BACKLOG_STEP = 40` and `EXTRA_MAX = 11` sit beside `NEW_SHARE` and are not exported:
  the engine test states the numbers (30, 31, 41) on its own, as it states `RESERVED`.
- **The second page.** `test/engine.js` opens its page once, at the top, and `src/content/index.js` fixes the
  units at the first `build()`: the block added here opens a second page, `G`, whose `prepare` grows the
  course to 1,000 items (1,017: whole units are pushed), and reads `compose()` there. It needs `await`, so
  the suite's `then(() => {` becomes `then(async () => {`; the `.catch` after it still catches. The first 430
  items of the grown course are the course's own, in order, so the 39- and 40-due checks read the same items a
  single page would.
- **Due items come from `test/lib/seed.js`** (`dueReviews`): the block seeds no record by hand.
- **`grow()` counts as `build()` counts** (one item per kind and Dutch, one pattern per id), so what it
  returns is `NL.content.allItems().length` on that page: 1,017 for a target of 1,000, 1,190 for 1,160.
- **Red.** On the old code 40 items due give 22 places and 7 new (step 2 below).
- **`test/journey.js`'s fourth section follows the session's size.** « Every exercise type, driven to a
  correct answer » plays fourteen rounds, each with every item set to one rung and everything due, in one
  day: the day's budget (120 exercises) was the only thing ending it. With 22 places, five rounds ran (rungs
  0 to 4, so `speak` appeared); with everything due a session now has 40 places (430 due → ten extra), three
  rounds spend the 120, and the walk stopped at rung 2: `✗ exercise type never appeared: speak`, `843 checks,
  1 PROBLEM(S)`. Step 3 gives each round its own day with the file's own idiom (`NL.state.setMeta({ exDay:
  null, exToday: 0 })`, as section 8 does at :247), so all fourteen rounds run — which the section's comment
  (« so later rungs actually appear ») always meant. Its red is that `843 checks, 1 PROBLEM(S)` on this
  task's `compose()` without the line.
- **The proof.** These steps ran on a copy of `2a86861`. Step 2 printed 20 `FAIL` lines and
  `315 checks, 20 FAILED`; step 4 printed `315 checks, ENGINE OK` (307 before the task); `node test/firstrun.js .`
  still ends `FIRST RUN IS CLEAN` (a blank account has 0 due: `0 à revoir + 15 nouveaux = 15`, under the 30 of
  `test/firstrun.js:43`); `node test/smoke.js .` ends `ALL CHECKS PASSED`; `node test/journey.js . nl-BE OPR`
  ends `2854 checks, NO PROBLEMS` (`speak 136` in its fourth section).

- [ ] **Step 1: Write the failing test.** Create `test/lib/grow.js`:
  ```js
  /* Un cours plus grand que le vrai, pour ce qui ne se voit qu'à l'échelle : la séance qui
     suit l'arriéré (ADR 0007), un arriéré de mille éléments. Des copies des unités du cours,
     mots et phrases avec un suffixe qui les garde uniques (« hallo zz1q0 » : groupe 1, unité 0),
     sans grammaire ni scénario, poussées sur NL.content.units jusqu'à ce que le cours compte au
     moins `target` éléments, comptés comme build() les compte (un mot ou une phrase par genre
     et néerlandais, un motif par identifiant). À appeler dans le `prepare` de browser.open :
     src/content/index.js fige les unités au premier build(). Rend le nombre d'éléments.

       const grow = require('./lib/grow');
       browser.open({ ..., prepare: NL => grow(NL, 1160) }) */
  function grow(NL, target) {
    const units = NL.content.units, real = units.slice();
    const count = () => {
      const keys = new Set();
      units.forEach(u => {
        (u.words || []).forEach(w => keys.add('word|' + NL.util.norm(w.nl)));
        (u.phrases || []).forEach(p => keys.add('phrase|' + NL.util.norm(p.nl)));
        (u.grammar || []).forEach(g => keys.add('pattern|' + g));
      });
      return keys.size;
    };
    for (let g = 1; count() < target; g++) {
      for (let k = 0; k < real.length && count() < target; k++) {
        const u = real[k], tag = ' zz' + g + 'q' + k;
        const copy = x => Object.assign({}, x, { nl: x.nl + tag });
        units.push(Object.assign({}, u, { id: u.id + '-x' + g, n: 100 * g + k, grammar: [],
          words: (u.words || []).map(copy), phrases: (u.phrases || []).map(copy) }));
      }
    }
    return count();
  }

  module.exports = grow;
  ```
  In `test/engine.js`, replace
  ```js
  const { inZone, offsets } = require('./lib/zone');
  ```
  with
  ```js
  const { inZone, offsets } = require('./lib/zone');
  const { dueReviews } = require('./lib/seed');
  const grow = require('./lib/grow');
  ```
  then replace
  ```js
  /* Ce que la spécification promet, écrit ici plutôt que relu dans le code : au
     moins 30 % des 22 places d'une séance, et jamais moins de quatre, vont au neuf. */
  const FEW = 4, RESERVED = Math.max(FEW, Math.ceil(22 * 0.3));
  ```
  with
  ```js
  /* Ce que la spécification promet, écrit ici plutôt que relu dans le code : au
     moins 30 % des 30 places de base d'une séance, et jamais moins de quatre, vont au
     neuf ; les places que l'arriéré ajoute n'en donnent pas (ADR 0007). */
  const FEW = 4, RESERVED = Math.max(FEW, Math.ceil(30 * 0.3));
  ```
  then replace the one line
  ```js
  NL.state.open().then(() => {
  ```
  with
  ```js
  NL.state.open().then(async () => {
  ```
  then, in « LA RÉSERVE », replace
  ```js
      ok(reviews + news <= NL.srs.MAX_TASKS, 'the session holds ' + (reviews + news) + ' items, more than its ' + NL.srs.MAX_TASKS + ' places');
  ```
  with
  ```js
      ok(reviews + news === 35, 'with 200 items due, the session holds ' + (reviews + news) + ' items, not 35: the 30 base places and one more per 40 due');
  ```
  then replace
  ```js
      /* Plus rien à rencontrer : la réserve disparaît, les révisions prennent tout. */
      fresh();
      all.forEach((it, i) => put(it, 3, i < 60 ? T0 - DAY : T0 + 30 * DAY));
      const full = NL.srs.compose('vandaag');
      ok(full.fresh.length === 0 && full.due.length === NL.srs.MAX_TASKS,
  ```
  with
  ```js
      /* Plus rien à rencontrer : la réserve disparaît, les révisions prennent tout —
         les trente places, et celle que soixante éléments dus ajoutent. */
      fresh();
      all.forEach((it, i) => put(it, 3, i < 60 ? T0 - DAY : T0 + 30 * DAY));
      const full = NL.srs.compose('vandaag');
      ok(full.fresh.length === 0 && full.due.length === 31,
  ```
  then find the two lines that close that block,
  ```js
      console.log('  plus rien à rencontrer : ' + full.due.length + ' révisions, ' + full.fresh.length + ' rencontre');
    }
  ```
  and insert right after them (a blank line first):
  ```js

    /* ------------------------------------------------------------------ */
    console.log('\nLA SÉANCE SUIT L’ARRIÉRÉ — une place de révision de plus par quarante éléments dus');
    /* ADR 0007, sa seconde option : la part réservée ne cède pas, c'est la séance qui grandit
       avec l'arriéré. Trente places de base ; dès quarante éléments dus, une de plus par
       quarante, onze au plus (41 places). La réserve se calcule sur les trente : neuf
       nouveaux, quel que soit l'arriéré. Une unité travaillée à part suit la même règle sur
       ses seuls dus. Le cours n'a que 430 éléments : la règle se lit sur une page à part, dont
       le cours est grossi à mille éléments (test/lib/grow.js) et où rien d'autre ne change. */
    {
      const G = browser.open({ root: ROOT, seed: browser.SEED, now: T0, ua: browser.UA.OPR, byId: 'stub', prepare: X => grow(X, 1000) });
      await G.NL.state.open();
      const X = G.NL, grown = X.content.allItems().length;
      ok(grown >= 1000, 'the grown course holds ' + grown + ' items, fewer than 1,000');
      /* n éléments dus, et ce que compose() en fait. */
      const backlog = (n, src) => { X.state.clearAll(); dueReviews(X, n, T0); return X.srs.compose(src || 'vandaag'); };
      [[39, 30], [40, 31], [440, 41], [1000, 41]].forEach(([n, places]) => {
        const c = backlog(n), held = c.due.length + c.fresh.length;
        console.log('  ' + String(n).padStart(4) + ' dus : ' + c.due.length + ' révisions + ' + c.fresh.length + ' rencontres = ' + held + ' places');
        ok(held === places, n + ' items due: the session holds ' + held + ' items, not ' + places + ' (30 base places, one more per 40 due, 11 at most)');
        if (n === 40 || n === 440) ok(c.fresh.length === RESERVED, n + ' items due: ' + c.fresh.length + ' new, not the reserve of ' + RESERVED + ' computed on the 30 base places');
      });
      /* Une unité travaillée à part : ses dus seuls comptent. Tout le cours dû, « tijd » a 52. */
      const u = backlog(430, 'tijd');
      console.log('  unité tijd, 52 dus : ' + u.due.length + ' révisions + ' + u.fresh.length + ' rencontres');
      ok(u.due.length + u.fresh.length === 31, 'a unit session with 52 items due holds ' + (u.due.length + u.fresh.length) + ' items, not 31');
    }
  ```
  The next lines of the file are the separator and `console.log('\nL’ANNONCE ET LA SÉANCE DISENT LA MÊME CHOSE');`.

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/engine.js .
  ```
  Expected: 20 `FAIL` lines and the last line `315 checks, 20 FAILED`. Among them, under « L’ARITHMÉTIQUE », five
  pairs `<n> items due, <k> unmet: the home screen announces 7 new` / `the session met 7 new item(s)` (the
  reserve is 9 now); under « LA RÉSERVE », `with 200 items due, a session met only 7 new item(s)`, `with 200
  items due, the session holds 22 items, not 35: …` and `with nothing left to meet, the session holds 22 reviews
  and 0 new`; and under the new title:
  ```
      39 dus : 15 révisions + 7 rencontres = 22 places
    FAIL: 39 items due: the session holds 22 items, not 30 (30 base places, one more per 40 due, 11 at most)
      40 dus : 15 révisions + 7 rencontres = 22 places
    FAIL: 40 items due: the session holds 22 items, not 31 (30 base places, one more per 40 due, 11 at most)
    FAIL: 40 items due: 7 new, not the reserve of 9 computed on the 30 base places
     440 dus : 15 révisions + 7 rencontres = 22 places
    FAIL: 440 items due: the session holds 22 items, not 41 (30 base places, one more per 40 due, 11 at most)
    FAIL: 440 items due: 7 new, not the reserve of 9 computed on the 30 base places
    1000 dus : 15 révisions + 7 rencontres = 22 places
    FAIL: 1000 items due: the session holds 22 items, not 41 (30 base places, one more per 40 due, 11 at most)
    unité tijd, 52 dus : 22 révisions + 0 rencontres
    FAIL: a unit session with 52 items due holds 22 items, not 31
  ```

- [ ] **Step 3: Implement.** In `src/core/srs.js`, replace
  ```js
    const MAX_TASKS = 22;             // les places d'une séance : un élément par place
  ```
  with
  ```js
    const MAX_TASKS = 30;             // les places de base d'une séance : un élément par place
  ```
  then replace
  ```js
    /* La part de chaque séance réservée à ce qui n'a jamais été rencontré. Sans
       elle, les révisions finissent par occuper toutes les places et plus rien de
       neuf n'arrive. Elle se calcule sur la SÉANCE, jamais sur le budget du jour :
       le budget vaut plusieurs séances, et en réserver 30 % dépasserait la séance. */
    const NEW_SHARE = 0.3, NEW_MIN = 4;
  ```
  with
  ```js
    /* La part de chaque séance réservée à ce qui n'a jamais été rencontré. Sans
       elle, les révisions finissent par occuper toutes les places et plus rien de
       neuf n'arrive. Elle se calcule sur la SÉANCE, jamais sur le budget du jour :
       le budget vaut plusieurs séances, et en réserver 30 % dépasserait la séance.
       Et sur les places de BASE, jamais sur celles que l'arriéré ajoute (compose()) :
       la part ne cède pas devant l'arriéré, et ne gonfle pas avec lui (ADR 0007). */
    const NEW_SHARE = 0.3, NEW_MIN = 4;
    /* Ce que l'arriéré ajoute aux places de base : une place de révision de plus par
       BACKLOG_STEP éléments dus, EXTRA_MAX au plus (30 + 11 = 41 places). */
    const BACKLOG_STEP = 40, EXTRA_MAX = 11;
  ```
  then replace
  ```js
         → { due, fresh, left }   deux listes d'éléments, et le budget restant */
    function compose(source, now, opts) {
      const uid = source && source !== 'vandaag' ? source : null;
      /* Travailler une unité précise est un choix : le budget du jour ne la bride pas. */
      const left = uid ? Infinity : budgetLeft();
      const places = Math.min(MAX_TASKS, left);
      if (places <= 0) return { due: [], fresh: [], left };

      let due = dueItems(now);
      if (uid) due = due.filter(it => it.unit === uid);
      if (opts && opts.quiet) due = due.filter(it => !needsVoice(it) && !(opts.without && opts.without.has(it.id)));
      const unmet = freshItems(MAX_TASKS, uid);

      /* La réserve sort AVANT que les révisions remplissent le reste, et elle
         disparaît d'elle-même quand il ne reste rien à rencontrer. */
      const reserve = Math.min(unmet.length, places, Math.max(NEW_MIN, Math.ceil(places * NEW_SHARE)));
  ```
  with
  ```js
         → { due, fresh, left }   deux listes d'éléments, et le budget restant
       La séance suit l'arriéré (ADR 0007, sa seconde option : la part réservée ne
       cède pas, c'est le budget qui suit). Trente places de base ; une place de
       révision de plus par quarante éléments dus, onze au plus (41 places). La
       réserve se calcule sur les places de base : neuf nouveaux, quel que soit
       l'arriéré. Une unité travaillée à part suit la même règle sur ses dus. */
    function compose(source, now, opts) {
      const uid = source && source !== 'vandaag' ? source : null;
      /* Travailler une unité précise est un choix : le budget du jour ne la bride pas. */
      const left = uid ? Infinity : budgetLeft();
      const base = Math.min(MAX_TASKS, left);
      if (base <= 0) return { due: [], fresh: [], left };

      let due = dueItems(now);
      if (uid) due = due.filter(it => it.unit === uid);
      if (opts && opts.quiet) due = due.filter(it => !needsVoice(it) && !(opts.without && opts.without.has(it.id)));
      const extra = Math.min(EXTRA_MAX, Math.floor(due.length / BACKLOG_STEP));
      const places = Math.min(MAX_TASKS + extra, left);
      const unmet = freshItems(MAX_TASKS, uid);

      /* La réserve sort AVANT que les révisions remplissent le reste, et elle
         disparaît d'elle-même quand il ne reste rien à rencontrer. */
      const reserve = Math.min(unmet.length, base, Math.max(NEW_MIN, Math.ceil(base * NEW_SHARE)));
  ```
  The lines after it (`nDue`, `nNew`, `pick`, the two trimming loops and the give-back loop) are unchanged:
  they read `places`.

  In `test/journey.js`, section 4, replace
  ```js
      NL.state.allRecs().forEach(r => { r.due = 0; NL.state.setRec(r); });
      if (!S.begin('vandaag')) continue;
  ```
  with
  ```js
      NL.state.allRecs().forEach(r => { r.due = 0; NL.state.setRec(r); });
      /* Each round is a day of its own: the day's budget starts again. With everything due, a
         session has forty places, and three of them spent the 120 of one day before the rungs
         that speak were reached. */
      NL.state.setMeta({ exDay: null, exToday: 0 });
      if (!S.begin('vandaag')) continue;
  ```

  In `GLOSSARY.md`, replace
  ```
  **Place**:
  One of the positions a session has to fill, taken by one item however many exercises that
  item leads to.
  ```
  with
  ```
  **Place**:
  One of the positions a session has to fill, taken by one item however many exercises that
  item leads to. A session has thirty base places; the backlog adds review places to them, one
  per forty items due, eleven at most.
  ```
  and replace
  ```
  **Reserved share**:
  The places of a session kept for items never met, set aside before due items fill the rest.
  ```
  with
  ```
  **Reserved share**:
  The places of a session kept for items never met: thirty per cent of the base places, never
  fewer than four, set aside before due items fill the rest. The places the backlog adds give
  it nothing.
  ```
  In `README.md`, under « Le budget quotidien », replace
  ```
  Une part de chaque séance est réservée aux éléments jamais rencontrés : trente
  pour cent des places, et jamais moins de quatre. Elle est prélevée avant que les
  révisions ne remplissent le reste, et ne rétrécit pas, tant qu'il reste du
  nouveau à rencontrer.
  ```
  with
  ```
  Une séance a trente places de base, et l'arriéré lui en ajoute : une place de
  révision de plus par quarante éléments dus, onze au plus. Une part de chaque
  séance est réservée aux éléments jamais rencontrés : trente pour cent des places
  de base, et jamais moins de quatre. Elle est prélevée avant que les révisions ne
  remplissent le reste, et ne rétrécit pas, tant qu'il reste du nouveau à
  rencontrer.
  ```
  (the sentence that follows, « Une seule fonction décide … », stays.) In `TESTING.md`, in the `engine.js`
  row, replace
  ```
  le renforcement dans la séance, la réserve de nouveautés, le seuil des unités,
  ```
  with
  ```
  le renforcement dans la séance, la réserve de nouveautés, la séance qui suit l'arriéré (trente places de base, une de plus par quarante éléments dus, onze au plus, la réserve calculée sur les trente, lue sur une page dont le cours est grossi à mille éléments par `test/lib/grow.js`), le seuil des unités,
  ```
  Then build:
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (684690 bytes), artifact.html (684076 bytes)` (measured; `2a86861`
  built as is gives 683770 and 683156, so the two files must grow by 920 bytes).

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/engine.js .
  ```
  Expected: no `FAIL` line, these lines under the new title, and the last line `315 checks, ENGINE OK`:
  ```
      39 dus : 21 révisions + 9 rencontres = 30 places
      40 dus : 22 révisions + 9 rencontres = 31 places
     440 dus : 32 révisions + 9 rencontres = 41 places
    1000 dus : 32 révisions + 9 rencontres = 41 places
    unité tijd, 52 dus : 31 révisions + 0 rencontres
  ```
  and, under « LA RÉSERVE », `200 éléments dus : 26 révisions, 9 rencontres` and `plus rien à rencontrer : 31
  révisions, 0 rencontre`. Then
  ```
  node test/firstrun.js .
  ```
  Expected: `base vide        0 à revoir + 15 nouveaux = 15` and the last line `FIRST RUN IS CLEAN`. Then
  ```
  node test/journey.js . nl-BE OPR
  ```
  Expected: under « 4. Every exercise type, driven to a correct answer », thirteen types with their counts,
  `speak       136` among them, no `✗` line, and the last line `2854 checks, NO PROBLEMS` (on `2a86861`,
  `818 checks, NO PROBLEMS`: five rounds ran; without the line step 3 adds to `test/journey.js`, `✗ exercise
  type never appeared: speak` and `843 checks, 1 PROBLEM(S)`).

- [ ] **Step 5: Commit.**
  ```
  git add src/core/srs.js index.html artifact.html test/engine.js test/lib/grow.js test/journey.js GLOSSARY.md README.md TESTING.md
  git commit -m "feat(engine): a session has 30 base places and one more review place per 40 items due, eleven at most; the reserved share stays on the base (#122)"
  ```

Done when:
- `node test/engine.js .` prints `315 checks, ENGINE OK`, with 40 items due giving 31 places and 9 new, 440 and
  1,000 giving 41 and 9; on the old `compose()` the same file printed `315 checks, 20 FAILED` (40 due → 22
  places, 7 new).
- `node test/firstrun.js .` prints `FIRST RUN IS CLEAN`; `node test/smoke.js .` prints `ALL CHECKS PASSED`;
  `node test/journey.js . nl-BE OPR` prints `2854 checks, NO PROBLEMS`, `speak` among the types of its fourth
  section (without the day per round, `843 checks, 1 PROBLEM(S)`).
- `GLOSSARY.md` « Place » and « Reserved share », `README.md` « Le budget quotidien » and `TESTING.md`'s
  `engine.js` row say the rule: thirty base places, one review place more per forty due, eleven at most, the
  share on the base.
- `index.html` and `artifact.html` are rebuilt and committed.

### Task 1b: Pace's fifth learner, groot: a course of 1,160 items
Class: mechanical
Ticket: #122
Promises: none
Why: decision D18 asks for « a 1,160-item check in `test/pace.js` » beside the engine change: the backlog
that task 1 drains only exists at phase 4's size, and no suite saw it (handoff.md measured it with throwaway
copies). After this task `test/pace.js` has a fifth MODE word, `groot`: one session a day, on a course grown
to 1,160 items by `test/lib/grow.js` (task 1's helper, called in `browser.open`'s `prepare`, because
`src/content/index.js` fixes the units at the first `build()`), and one more assertion, in that mode only:
the backlog's peak stays under three quarters of the course, « l’arriéré monte à <n> éléments sur <total> :
la séance ne suit pas l’arriéré (ADR 0007) ». `grow()` counts as `build()` counts, so the course holds 1,190
items (whole units are pushed). Measured over 200 days at 85 % right: on the plan base's `compose()` (22 fixed
places) the backlog peaks at 999 of 1,190 and the line prints; after task 1 it peaks at 763, under the 892
the check allows. `test/run-all.sh` runs the fifth learner after `one drift`, on the same `PACE_DAYS`: under
D18 the peak falls before day 200. The per-session guard `n++ < 80` stays: measured on the grown course, a
41-place session served 67 exercises at most. `TESTING.md` names the fifth learner in the `pace.js` row and
says, in its two learner paragraphs, what he sees (the backlog, 999 against 763) and what he cannot (copies
of the course's items, not new words). Nothing under `src/` changes: no build.

Files:
- Modify: `test/pace.js` (the requires, line 6; after the `DRIFT` lines, 17–18; `browser.open`, lines 32–35;
  after `P('arriéré maximum', …)`, line 258)
- Modify: `test/run-all.sh` (the comment « Quatre apprenants », lines 44–49; after the `one drift` line, 53)
- Modify: `TESTING.md` (the `pace.js` row, line 29; after the drifting learner's paragraph, line 63; the
  « ne voient pas » paragraph on the simulated learners, line 216)
- Test: `test/pace.js`, in `groot` mode

Lines are as of `2a86861` (the plan's base); task 1 changes none of them (its `TESTING.md` edit is one line for one, at :19).

Notes:
- **Comments in French** in `test/pace.js` and `test/run-all.sh`, test messages in French as the file's are
  (typographic apostrophe « ’ » in the messages, as the file writes them); `TESTING.md` is in French.
- **Line endings.** `test/pace.js`, `TESTING.md` and `test/run-all.sh` are stored with LF; a Windows checkout
  may show CRLF (`core.autocrlf`). Match on content; `git diff` is the judge.
- **`grow()` is task 1's** (`test/lib/grow.js`): it pushes copies of the twelve units, words and phrases
  with a suffix, no grammar, no scenario, until the course counts `target` items as `build()` counts them.
  Asked for 1,160 it returns 1,190: a whole unit is pushed at a time. `total` in `pace.js` reads
  `NL.content.allItems().length`, so the message and the threshold use 1,190.
- **The red is on the code before task 1, step 2b.** This task adds a check to a scale task 1 already fixed,
  so step 2 passes as written: the test cannot fail on the code it lands on. Step 2b puts the code before
  task 1 back for one run: `src/core/srs.js` as it was in the parent of task 1's commit (the last commit to
  touch that file, so long as no task between the two does), with this task's `test/pace.js`. It prints
  `arriéré maximum 999`, then `   ✗ l’arriéré monte à 999 éléments sur 1190 : la séance ne suit pas l’arriéré
  (ADR 0007)` and `11 vérifications, 1 PROBLÈME(S)` (48 s). The step restores the file with `git checkout`
  and its last command shows nothing but this task's three files modified. That is the red `TESTING.md`'s new
  paragraph records.
- **The guard stays at 80.** A probe copy of `pace.js` with the guard at 200 counted the exercises each
  session served on the grown course over 200 days: 67 at most, no session over 80.
- **Time.** The `groot` run takes about 1 min 30 s on this machine (the other learners 30–50 s each): the
  whole suite grows by that much. `CLAUDE.md:24` says « three to six
  minutes » (the verifier's line already says fifteen, from the kit's commit): true after this task (6 min 13 s with other work beside it); task 9 changes `CLAUDE.md`'s, once the course has grown.
- **The proof.** These steps ran on a copy of `2a86861` with task 1 committed. Step 2 printed `arriéré maximum
  763`, `éléments au catalogue 1190` and `11 vérifications, AUCUN PROBLÈME` (1 min 28 s); step 2b printed
  the ✗ line above and `11 vérifications, 1 PROBLÈME(S)`; the last command of step 2b printed the three
  modified files; the full suite ended `TOUTE LA SUITE EST PASSÉE`.

- [ ] **Step 1: Write the test.** In `test/pace.js`, replace
  ```js
  const { offsets } = require('./lib/zone');
  ```
  with
  ```js
  const { offsets } = require('./lib/zone');
  const grow = require('./lib/grow');
  ```
  then replace
  ```js
  const DRIFT = MODE.indexOf('drift') >= 0;
  if (DRIFT) process.env.TZ = 'Europe/Brussels';
  ```
  with
  ```js
  const DRIFT = MODE.indexOf('drift') >= 0;
  if (DRIFT) process.env.TZ = 'Europe/Brussels';
  /* Le cinquième, une seule séance par jour aussi, apprend un cours de 1 160 éléments : les
     unités du cours recopiées (test/lib/grow.js), poussées avant le premier build(). La séance
     doit suivre l'arriéré (ADR 0007) : il reste sous les trois quarts du cours. */
  const GROOT = MODE.indexOf('groot') >= 0, GROOT_ITEMS = 1160;
  ```
  then replace
  ```js
  const B = browser.open({
    root: ROOT, seed: browser.SEED, now: T0, ua: 'Chrome/120 OPR/106', blobs: true, byId: 'stub',
    voices: [{ name: 'Bart', lang: 'nl-BE' }]
  });
  ```
  with
  ```js
  const B = browser.open(Object.assign({
    root: ROOT, seed: browser.SEED, now: T0, ua: 'Chrome/120 OPR/106', blobs: true, byId: 'stub',
    voices: [{ name: 'Bart', lang: 'nl-BE' }]
  }, GROOT ? { prepare: NL => grow(NL, GROOT_ITEMS) } : {}));
  ```
  then replace
  ```js
    P('arriéré maximum', maxBacklog);
  ```
  with
  ```js
    P('arriéré maximum', maxBacklog);
    /* Le cours grossi : la séance suit l'arriéré, qui reste sous les trois quarts du cours.
       Mesuré ici sur 200 jours, une séance par jour, 85 % de bonnes réponses, 1 190 éléments :
       999 quand la séance avait 22 places fixes, 763 depuis qu'elle suit l'arriéré. */
    if (GROOT) ok(maxBacklog <= Math.floor(total * 0.75), 'l’arriéré monte à ' + maxBacklog + ' éléments sur ' + total + ' : la séance ne suit pas l’arriéré (ADR 0007)');
  ```
  The next lines of the file are the blank line and `console.log('\nMÉLANGE DES TYPES');`.

  In `test/run-all.sh`, replace
  ```sh
  # Quatre apprenants : celui qui épuise le budget du jour, celui qui ne fait
  # qu'une séance, celui qui, une séance sur cinq, ne peut pas parler, et celui
  # dont la séance commence chaque jour vingt minutes plus tôt, de 21 h à 7 h,
  # puis remonte. Le défaut d'octobre ne se voyait que chez le deuxième. Le
  # quatrième voit ce qu'aucun autre ne voit : un lendemain qui dépendrait de
  # l'heure à laquelle on commence (#32).
  ```
  with
  ```sh
  # Cinq apprenants : celui qui épuise le budget du jour, celui qui ne fait
  # qu'une séance, celui qui, une séance sur cinq, ne peut pas parler, celui
  # dont la séance commence chaque jour vingt minutes plus tôt, de 21 h à 7 h,
  # puis remonte, et celui qui, une séance par jour, apprend un cours de 1 160
  # éléments. Le défaut d'octobre ne se voyait que chez le deuxième. Le
  # quatrième voit ce qu'aucun autre ne voit : un lendemain qui dépendrait de
  # l'heure à laquelle on commence (#32). Le cinquième voit l'arriéré que la
  # séance doit suivre (ADR 0007) : son pic tombe avant le jour 200.
  ```
  then find the one line
  ```sh
  node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one drift
  ```
  and insert right after it
  ```sh
  node test/pace.js "$ROOT" "${PACE_DAYS:-200}" one groot
  ```
  (the next lines are the comment « Un seul jour, comme les tâches d'un plan la lancent » and
  `node test/pace.js "$ROOT" 1`).

  In `TESTING.md`, in the `pace.js` row, replace
  ```
  | `pace.js` | 200 jours simulés, pour quatre apprenants (budget épuisé chaque jour ; une seule séance par jour ; une seule séance, dont une sur cinq là où l’on ne peut pas parler ; une seule séance, commencée à 21 h puis vingt minutes plus tôt chaque jour jusqu’à 7 h, et qui remonte, à l’heure de Bruxelles) : charge quotidienne, variété, exigence — aucune journée sans élément nouveau tant qu’il en reste,
  ```
  with
  ```
  | `pace.js` | 200 jours simulés, pour cinq apprenants (budget épuisé chaque jour ; une seule séance par jour ; une seule séance, dont une sur cinq là où l’on ne peut pas parler ; une seule séance, commencée à 21 h puis vingt minutes plus tôt chaque jour jusqu’à 7 h, et qui remonte, à l’heure de Bruxelles ; une seule séance, sur un cours grossi à 1 160 éléments par `test/lib/grow.js`, où l’arriéré doit rester sous les trois quarts du cours : la séance suit l’arriéré, ADR 0007) : charge quotidienne, variété, exigence — aucune journée sans élément nouveau tant qu’il en reste,
  ```
  (the rest of the row is unchanged). Then find the two lines that close the drifting learner's paragraph,
  ```
  global seul n'aurait rien vu. Ce qu'il garde, c'est un lendemain qui ne dépend
  pas de l'heure à laquelle on commence.
  ```
  and insert right after them (a blank line first):
  ```

  L'apprenant du grand cours (`groot`) voit ce que 430 éléments ne montrent pas :
  l'arriéré d'un cours de phase 4. Sur 1 190 éléments et 200 jours, une séance de
  22 places fixes le laissait monter à 999 ; la séance qui suit l'arriéré (ADR 0007)
  le tient à 763, sous les trois quarts du cours qu'il exige.
  ```
  (the next lines are the blank line and « Chaque bug corrigé laisse un test qui échoue sur l'ancien
  code »). Then, under « Ce que les tests ne voient pas », replace
  ```
  `engine.js` qui le vérifie. Et comme tous les apprenants simulés, il n'oublie
  rien : il répond juste 85 fois sur 100, quoi qu'il arrive.
  ```
  with
  ```
  `engine.js` qui le vérifie. Et comme tous les apprenants simulés, il n'oublie
  rien : il répond juste 85 fois sur 100, quoi qu'il arrive. L'apprenant du grand
  cours apprend des copies : ses 1 190 éléments sont les 430 du cours, repris avec
  un suffixe (`test/lib/grow.js`), de même difficulté et des mêmes types d'exercice.
  Il voit l'arriéré que la séance doit suivre, pas ce que des mots nouveaux feraient
  au mélange des types ni à la charge d'une journée.
  ```

- [ ] **Step 2: Run the fifth learner.**
  ```
  node test/pace.js . 200 one groot
  ```
  Expected (about 1 min 30 s): no `✗` line; under « CHARGE SUR 200 JOURS »
  ```
    jour   exercices   minutes   rencontrés   produits
       1          33         7           15          0
       7          55        16           78         21
      30          55        16          285        158
      90          66        20          825        496
     180          48        16         1190       1072
     200          42        15         1190       1134
  ```
  then `arriéré maximum                       763`, under « PLAFOND DE CONTENU » `éléments au catalogue
  1190` and `tout rencontré le jour                131`, and the last line `11 vérifications, AUCUN
  PROBLÈME`. This is the run that must hold: the check cannot fail on task 1's `compose()`. Step 2b shows it failing
  on the code before. Then check the other learners still run as before:
  ```
  node test/pace.js . 200 one
  ```
  Expected: the last line `10 vérifications, AUCUN PROBLÈME`, `éléments au catalogue                 430`.

- [ ] **Step 2b: Watch it fail on the code before task 1.** Put the file back as it was before task 1 for
  one run, then restore it:
  ```
  git show "$(git log -n 1 --format=%H -- src/core/srs.js)~1:src/core/srs.js" > src/core/srs.js
  node test/pace.js . 200 one groot
  git checkout -- src/core/srs.js
  git status --short
  ```
  Expected (about 50 s): `arriéré maximum                       999`, then
  ```
     ✗ l’arriéré monte à 999 éléments sur 1190 : la séance ne suit pas l’arriéré (ADR 0007)
  ```
  and the last line `11 vérifications, 1 PROBLÈME(S)`. `git status --short` prints exactly these three lines,
  and none for `src/core/srs.js`:
  ```
   M TESTING.md
   M test/pace.js
   M test/run-all.sh
  ```

- [ ] **Step 3: Commit.**
  ```
  git add test/pace.js test/run-all.sh TESTING.md
  git commit -m "test(pace): a fifth learner, groot, learns a course of 1,160 items and its backlog stays under three quarters of the course (#122)"
  ```

Done when:
- `node test/pace.js . 200 one groot` prints `arriéré maximum                       763`, `éléments au
  catalogue                 1190` and `11 vérifications, AUCUN PROBLÈME`; with the file as it was before task 1
  (step 2b) the same test printed the ✗ line (999 of 1,190) and `11 vérifications, 1 PROBLÈME(S)`.
- `node test/pace.js . 200 one` still prints `10 vérifications, AUCUN PROBLÈME` on 430 items.
- `test/run-all.sh` runs `one groot` after `one drift`; `TESTING.md`'s `pace.js` row says five learners and
  names the fifth, and its two learner paragraphs say what he sees and what he cannot.
- Nothing under `src/` changed: `index.html` and `artifact.html` are as task 1 left them.

### Task 2: The kaikki senses extract
Class: mechanical
Ticket: #123
Promises: none
Why: D12 (2026-10-25): the new words' meanings come from kaikki.org's Wiktionary extract, already pinned in
the kit (`tools/content/lib/cache.js`, `kaikki/nl.jsonl`, 257 MB, sha256-pinned), and are read by two readers
like every kind. Today `tools/content/kaikki.js` writes one extract of that file, `.cache/kaikki/belgian.tsv`:
the senses Wiktionary labels Belgian or Flemish, which the `flemish` kind's Check reads to verify a
`wiktionary:<lemma>` evidence. The `words` kind (task 4) needs the same for any word: that a lemma exists, with
which part of speech, which gender and which glosses. After this task `kaikki.js` writes a second extract from
the same read of the pinned file, `.cache/kaikki/senses.tsv`: one line per entry, sorted, each once, under the
same header `# kaikki/nl.jsonl sha256 <pin>`: the lemma, its `pos`, its gender (`de`, `het`, `both` or empty,
read from `head_templates[].args["1"]` as `test/tools/build-dehet.js` reads it: `n` → het; `m`, `f`, `mf`, `c` →
de; else from a sense's `tags`, neuter/masculine/feminine/common-gender), and the first gloss of each sense
joined by ` | ` (tabs and newlines scrubbed to a space, a `|` inside a gloss written `/`). `kaikki.senses(repo,
{ pins })` returns `Map lemma → [{ pos, gender, glosses }]`, with the same two errors as `belgian()` (missing:
`.cache/kaikki/senses.tsv is missing: run node tools/content/kaikki.js .`; another pin: `… comes from another
pin of kaikki/nl.jsonl: …`). `kaikki.extract()` returns `{ senses, lemmas, entries }`, and the CLI prints both
`ok` lines through a new `kaikki.report(r)`. Nothing from Wiktionary enters a tracked file: both extracts live
in `.cache/`, git-ignored, and a row cites a lemma only (ATTRIBUTION.md). The gender column is written for
the record and read by nobody in this plan: task 4's Check holds a noun's article to `test/data/dehet.tsv`,
which `test/dehet.js` enforces after Merge. `fromCode` and `fromTag` are the two lines of
`test/tools/build-dehet.js:32-34`, kept apart because that tool regenerates a tracked table and this one a cache,
and the reading differs on purpose: `build-dehet.js` adds a sense's tags to what `head_templates` says, whereas
`gender()` reads the tags only when `head_templates` gives no gender.

Files:
- Modify: `tools/content/lib/cache.js` (the pin of `kaikki/nl.jsonl`, line 22)
- Modify: `tools/content/kaikki.js` (whole file: the header comment, `extract()`, `belgian()`, and the new
  `gender()`, `write()`, `read()`, `senses()`, `report()`)
- Modify: `test/tools/sources.js` (the constants after `EXTRACT`, line 35; section « 1. kaikki », lines 45–96)
- Modify: `ATTRIBUTION.md` (« Wiktionnaire — sens marqués belges », lines 23–30)
- Modify: `TESTING.md` (the `tools/sources.js` row, line 27)
- Test: `test/tools/sources.js`

Lines are as of `2a86861`.

Notes:
- **Comments in French** in `tools/content/kaikki.js` and `test/tools/sources.js`; the lines the CLI prints and
  the error messages are English, as the kit's are. `ATTRIBUTION.md` and `TESTING.md` are French.
- **Line endings.** Match on content. These files are LF in the index and in a `git archive` of it; a checkout
  may differ by its `core.autocrlf`. `git diff` is the judge.
- **The dump the test writes** gains `head_templates` on four entries (fiets `f`, kot `n`, stoel `m`, tab `f,n`),
  a `feminine` tag on goesting's second sense (the fallback), and a `|` in tab's second gloss, so the 9 entries
  cover every gender rule and the scrubbing. That second gloss also makes a second Belgian sense of tab, so
  `belgian.tsv` now has 8 senses, not 7.
- **No network, no 257 MB file.** The suite writes its own 9-entry dump under a pin it computes; nothing is
  downloaded. The real `.cache/kaikki/nl.jsonl` is fetched in the run's worktree at set-up (header, « The kaikki
  extract »).
- **The command's success path is not run by the suite, so it has no red.** `node tools/content/kaikki.js <repo>`
  reads the real pin (`cache.PINS`), and that file is 257 MB: the test runs its two failures (`run('kaikki.js', …)`)
  and checks the lines it prints through `kaikki.report()`, and `kaikki.extract()` with the test's own pin. The
  set-up's run on the real file is the first time the whole command runs.
- **The proof.** These steps ran on a copy of `2a86861`. Before the task `node test/tools/sources.js .` ended
  `33 contrôles, SOURCES CONFORMES`. Step 2 printed one `FAIL` line, then `CRASH Error: ENOENT: no such file or
  directory, open '…\.cache\kaikki\senses.tsv'` (the test reads the second extract, which the old code does not
  write) and exited 1. Step 4 ended `38 contrôles, SOURCES CONFORMES`.

- [ ] **Step 1: Write the failing test.** In `test/tools/sources.js`, find the one line
  ```js
  const EXTRACT = path.join(TMP, '.cache', 'kaikki', 'belgian.tsv');
  ```
  and insert right after it:
  ```js
  const SENSES = path.join(TMP, '.cache', 'kaikki', 'senses.tsv');
  ```
  Then replace the whole of section 1, from the line
  ```js
    /* ==================================================== 1. kaikki : les sens belges */
  ```
  down to and including the line
  ```js
    console.log('  kaikki         7 sens belges sur 9 entrées, Brabant écarté, extrait daté par son épingle');
  ```
  with:
  ```js
    /* ==================================================== 1. kaikki : les sens belges */
    /* Le genre d'un nom se lit dans head_templates (fiets f, kot n, stoel m, tab f,n), sinon dans les
       tags d'un sens (goesting feminine) ; leeg n'a pas de sens, stoel en a un sans glose. */
    const entries = [
      { word: 'goesting', pos: 'noun', senses: [{ tags: ['Belgium'], glosses: ['desire, appetite'] }, { tags: ['feminine'], glosses: ['taste'] }] },
      { word: 'fiets', pos: 'noun', head_templates: [{ args: { '1': 'f', '2': '-en' } }], senses: [{ glosses: ['bicycle'] }] },
      { word: 'amai', pos: 'intj', senses: [{ tags: ['Belgium', 'colloquial'], glosses: ['wow'] }, { tags: ['Flanders'], glosses: ['oh dear'] }] },
      { word: 'kot', pos: 'noun', head_templates: [{ args: { '1': 'n' } }], senses: [{ raw_tags: ['in Belgium'], glosses: ['student room'] }] },
      { word: 'schoon', pos: 'adj', head_templates: [{ args: { '1': 'schoner' } }], senses: [{ tags: ['Brabant'], raw_tags: ['Brabant'], glosses: ['beautiful'] }] },
      { word: 'gij', pos: 'pron', senses: [{ tags: ['Flemish', 'dialectal'], glosses: ['you'] }] },
      { word: 'tab', pos: 'noun', head_templates: [{ args: { '1': 'f,n' } }], senses: [{ tags: ['Belgium'], glosses: ['a\tb\nc'] }, { tags: ['Belgium'], glosses: ['a\tb\nc | d'] }] },
      { word: 'leeg', pos: 'adj' },
      { word: 'stoel', pos: 'noun', head_templates: [{ args: { '1': 'm' } }], senses: [{ tags: ['Belgium'] }] }
    ];
    const dump = entries.map(e => JSON.stringify(e)).join('\n') + '\n\n';
    fs.mkdirSync(path.dirname(DUMP), { recursive: true });
    fs.writeFileSync(DUMP, dump);
    const pins = pinOf(dump);
    same(await kaikki.extract(TMP, { pins }), { senses: 8, lemmas: 6, entries: 9 }, 'extract compte les sens marqués, une fois chacun, leurs lemmes, et les entrées');
    same(fs.readFileSync(EXTRACT, 'utf8'), [
      '# kaikki/nl.jsonl sha256 ' + sha(dump),
      'amai\tintj\tBelgium\twow',
      'amai\tintj\tFlanders\toh dear',
      'gij\tpron\tFlemish\tyou',
      'goesting\tnoun\tBelgium\tdesire, appetite',
      'kot\tnoun\tin Belgium\tstudent room',
      'stoel\tnoun\tBelgium\t',
      'tab\tnoun\tBelgium\ta b c',
      'tab\tnoun\tBelgium\ta b c | d'
    ].join('\n') + '\n', 'l\'extrait : son épingle, puis un sens par ligne, trié, sans tabulation ni saut de ligne dans une case');
    same(fs.readFileSync(SENSES, 'utf8'), [
      '# kaikki/nl.jsonl sha256 ' + sha(dump),
      'amai\tintj\t\twow | oh dear',
      'fiets\tnoun\tde\tbicycle',
      'gij\tpron\t\tyou',
      'goesting\tnoun\tde\tdesire, appetite | taste',
      'kot\tnoun\thet\tstudent room',
      'leeg\tadj\t\t',
      'schoon\tadj\t\tbeautiful',
      'stoel\tnoun\tde\t',
      'tab\tnoun\tboth\ta b c | a b c / d'
    ].join('\n') + '\n', 'l\'extrait des sens : son épingle, puis une entrée par ligne, triée : le lemme, sa nature, son genre, la première glose de chaque sens');
    ok(!fs.existsSync(EXTRACT + '.part') && !fs.existsSync(SENSES + '.part'), 'aucun fichier partiel ne reste');
    const S = kaikki.senses(TMP, { pins });
    same([S.size, S.get('tab'), S.get('leeg'), S.get('goesting')[0].gender, S.has('fiets')],
      [9, [{ pos: 'noun', gender: 'both', glosses: ['a b c', 'a b c / d'] }], [{ pos: 'adj', gender: '', glosses: [] }], 'de', true],
      'senses rend chaque entrée, marquée ou non : sa nature, son genre, ses gloses');
    same(kaikki.report({ senses: 8, lemmas: 6, entries: 9 }), ['ok .cache/kaikki/belgian.tsv 8 senses, 6 lemmas', 'ok .cache/kaikki/senses.tsv 9 entries'],
      'kaikki.js dit les deux extraits qu\'il écrit');
    const B = kaikki.belgian(TMP, { pins });
    same(B.get('amai'), [{ pos: 'intj', labels: ['Belgium'], gloss: 'wow' }, { pos: 'intj', labels: ['Flanders'], gloss: 'oh dear' }],
      'belgian rend les sens d\'un lemme, dans l\'ordre de l\'extrait');
    same(['fiets', 'schoon', 'leeg'].filter(w => B.has(w)), [], 'un sens sans marque, ou marqué Brabant seulement, n\'est pas belge');
    same([kaikki.marks({ tags: ['Belgium', 'Brabant'], raw_tags: ['in the Netherlands and Belgium', 'Brabant'] }), kaikki.marks({})],
      [['Belgium', 'in the Netherlands and Belgium'], []], 'marks garde Belgium, Flanders, Flemish, et un raw_tag qui nomme la Belgique');
    await rejects(() => kaikki.belgian(TMP, { pins: pinOf(dump + ' ') }),
      /^\.cache\/kaikki\/belgian\.tsv comes from another pin of kaikki\/nl\.jsonl: run node tools\/content\/kaikki\.js \.$/,
      'un extrait d\'une autre épingle est refusé');
    await rejects(() => kaikki.senses(TMP, { pins: pinOf(dump + ' ') }),
      /^\.cache\/kaikki\/senses\.tsv comes from another pin of kaikki\/nl\.jsonl: run node tools\/content\/kaikki\.js \.$/,
      'un extrait des sens d\'une autre épingle est refusé');

    const bad = dump.replace('\n', '\n{"word": \n');
    fs.writeFileSync(DUMP, bad);
    const before = fs.readFileSync(EXTRACT, 'utf8'), sensesBefore = fs.readFileSync(SENSES, 'utf8');
    await rejects(() => kaikki.extract(TMP, { pins: pinOf(bad) }), /^kaikki\/nl\.jsonl:2: not JSON$/, 'une ligne qui n\'est pas du JSON est refusée, avec son numéro');
    same([fs.readFileSync(EXTRACT, 'utf8'), fs.readFileSync(SENSES, 'utf8')], [before, sensesBefore], 'un extract refusé n\'écrit rien');
    await rejects(() => kaikki.extract(TMP, { pins }),
      /^\.cache\/kaikki\/nl\.jsonl is missing: run node tools\/content\/fetch\.js \. kaikki\/nl\.jsonl$/, 'un fichier qui n\'a pas la taille de son épingle n\'est pas lu');
    fs.unlinkSync(EXTRACT);
    fs.unlinkSync(SENSES);
    await rejects(() => kaikki.belgian(TMP, { pins }), /^\.cache\/kaikki\/belgian\.tsv is missing: run node tools\/content\/kaikki\.js \.$/,
      'sans extrait, belgian dit la commande à lancer');
    await rejects(() => kaikki.senses(TMP, { pins }), /^\.cache\/kaikki\/senses\.tsv is missing: run node tools\/content\/kaikki\.js \.$/,
      'sans extrait des sens, senses dit la commande à lancer');
    same(run('kaikki.js', [EMPTY]), { code: 1, lines: ['fail .cache/kaikki/nl.jsonl is missing: run node tools/content/fetch.js . kaikki/nl.jsonl'] },
      'kaikki.js sans le fichier épinglé dit la commande à lancer');
    same(run('kaikki.js', []), { code: 1, lines: ['usage: node tools/content/kaikki.js <repo>'] }, 'kaikki.js sans dépôt dit son usage');
    console.log('  kaikki         8 sens belges sur 9 entrées, Brabant écarté, et les 9 entrées avec leur genre ; deux extraits datés par leur épingle');
  ```
  The line after it is still the blank line before `/* ====…===== 2. tatoeba : les phrases d'un mot */`.

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/tools/sources.js .
  ```
  Expected: exit 1. The first line after `SOURCES EXTERNES` is
  ```
    FAIL: extract compte les sens marqués, une fois chacun, leurs lemmes, et les entrées : {"senses":8,"lemmas":6}, attendu {"senses":8,"lemmas":6,"entries":9}
  ```
  followed by `CRASH Error: ENOENT: no such file or directory, open '<tmp>\.cache\kaikki\senses.tsv'` and a
  stack: the old `extract()` writes no second extract, and the test reads it.

- [ ] **Step 3: Implement.** Replace the whole of `tools/content/kaikki.js` with:
  ```js
  /* Ce que le Wiktionnaire anglais dit du néerlandais, tiré du fichier épinglé kaikki/nl.jsonl
     (kaikki.org, tools/content/lib/cache.js), en deux extraits qui vivent dans .cache/, jamais
     dans un fichier versionné : rien du Wiktionnaire n'entre au dépôt, sauf le lemme qu'une
     preuve cite (ATTRIBUTION.md).
       .cache/kaikki/belgian.tsv  les sens marqués belges ou flamands : la preuve
                                  « wiktionary:<lemme> » d'une forme flamande se vérifie ici
       .cache/kaikki/senses.tsv   chaque entrée du fichier, avec son genre et ses gloses : la preuve
                                  « wiktionary:<lemme> » d'un mot nouveau, dont la nature (pos)
                                  s'accorde, se vérifie ici

       node tools/content/kaikki.js <repo>    écrit les deux extraits, depuis .cache/kaikki/nl.jsonl
       const kaikki = require('./tools/content/kaikki');
       await kaikki.extract(repo, { pins })   { senses, lemmas, entries } : écrit les deux extraits
       kaikki.belgian(repo, { pins })         Map lemme → [{ pos, labels, gloss }], dans l'ordre de
                                              l'extrait ; une erreur qui dit la commande à lancer si
                                              l'extrait manque, ou s'il vient d'une autre épingle
       kaikki.senses(repo, { pins })          Map lemme → [{ pos, gender, glosses }], chaque entrée,
                                              marquée ou non ; les deux mêmes erreurs
       kaikki.marks(sense)                    les marques d'un sens du fichier, [] s'il n'en a pas
       kaikki.report(r)                       les deux lignes « ok » que la commande imprime

     Un sens est retenu dans belgian.tsv quand un de ses tags est Belgium, Flanders ou Flemish, ou
     qu'un de ses raw_tags nomme la Belgique, la Flandre ou le flamand (« in Belgium »). Brabant
     n'en est pas : le Brabant est aussi aux Pays-Bas. Chaque extrait est une ligne d'en-tête,
     « # kaikki/nl.jsonl sha256 <épingle> », puis des lignes triées par unités de code, une fois
     chacune, à cases séparées par des tabulations : belgian.tsv un sens par ligne (le lemme, sa
     nature (pos), ses marques séparées par « , », sa première glose) ; senses.tsv une entrée par
     ligne (le lemme, sa nature, son genre — de, het, both ou rien, lu dans head_templates comme
     test/tools/build-dehet.js le lit, à défaut dans les tags d'un sens —, la première glose de
     chaque sens, jointes par « | »). Le fichier épinglé est lu ligne à ligne, en JSON : rien ne
     s'en exécute. */
  const fs = require('fs'), path = require('path'), readline = require('readline');
  const cache = require('./lib/cache');

  const KEY = 'kaikki/nl.jsonl';
  const OUT = 'kaikki/belgian.tsv';
  const SENSES = 'kaikki/senses.tsv';
  const TAGS = ['Belgium', 'Flanders', 'Flemish'];
  const RAW_TAG = /belgi|flanders|flemish/i;
  const head = pins => '# ' + KEY + ' sha256 ' + (pins || cache.PINS)[KEY].sha256;
  const cell = s => String(s == null ? '' : s).replace(/[\t\r\n]+/g, ' ').trim();

  const marks = sense => (sense.tags || []).filter(t => TAGS.indexOf(t) >= 0)
    .concat((sense.raw_tags || []).filter(t => RAW_TAG.test(t)));

  /* Le genre d'une entrée : « n » → het ; « m », « f », « mf », « c » → de, lus dans l'argument 1 de
     ses head_templates ; à défaut, les tags d'un sens (neuter, masculine, feminine, common-gender).
     Les deux → both ; rien → ''. */
  const fromCode = c => (c === 'n' ? 'het' : (c === 'm' || c === 'f' || c === 'mf' || c === 'c') ? 'de' : null);
  const fromTag = t => (t === 'neuter' ? 'het' : (t === 'masculine' || t === 'feminine' || t === 'common-gender') ? 'de' : null);
  function gender(entry) {
    const gs = new Set();
    (entry.head_templates || []).forEach(h => {
      const a = h && h.args && h.args['1'];
      if (a) String(a).split(/[^a-z]+/).forEach(tok => { const g = fromCode(tok); if (g) gs.add(g); });
    });
    if (!gs.size) (entry.senses || []).forEach(s => (s.tags || []).forEach(t => { const g = fromTag(t); if (g) gs.add(g); }));
    return gs.size > 1 ? 'both' : gs.size ? [...gs][0] : '';
  }

  /* Un extrait écrit entier, sous son en-tête, par un fichier partiel renommé. */
  function write(repo, name, pins, lines) {
    const out = path.join(path.resolve(repo), '.cache', name);
    fs.writeFileSync(out + '.part', [head(pins)].concat(lines).join('\n') + '\n');
    fs.renameSync(out + '.part', out);
  }

  async function extract(repo, opts) {
    const pins = (opts && opts.pins) || cache.PINS;
    const file = cache.get(repo, KEY, pins);
    const rows = new Set(), entries = new Set();
    let n = 0;
    const lines = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
    for await (const line of lines) {
      n++;
      if (!line.trim()) continue;
      let entry;
      try { entry = JSON.parse(line); } catch (e) { throw new Error(KEY + ':' + n + ': not JSON'); }
      const senses = entry.senses || [];
      senses.forEach(s => {
        const m = marks(s);
        if (m.length) rows.add([cell(entry.word), cell(entry.pos), m.map(cell).join(', '), cell((s.glosses || [])[0])].join('\t'));
      });
      const glosses = senses.map(s => cell((s.glosses || [])[0]).replace(/\|/g, '/')).filter(Boolean);
      entries.add([cell(entry.word), cell(entry.pos), gender(entry), glosses.join(' | ')].join('\t'));
    }
    const sorted = [...rows].sort(), all = [...entries].sort();
    write(repo, OUT, pins, sorted);
    write(repo, SENSES, pins, all);
    return { senses: sorted.length, lemmas: new Set(sorted.map(r => r.split('\t')[0])).size, entries: all.length };
  }

  /* Les lignes d'un extrait, son en-tête vérifié. */
  function read(repo, name, pins) {
    const file = path.join(path.resolve(repo), '.cache', name);
    if (!fs.existsSync(file)) throw new Error('.cache/' + name + ' is missing: run node tools/content/kaikki.js .');
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
    if (lines[0] !== head(pins)) throw new Error('.cache/' + name + ' comes from another pin of ' + KEY + ': run node tools/content/kaikki.js .');
    return lines.slice(1);
  }

  function belgian(repo, opts) {
    const map = new Map();
    read(repo, OUT, (opts && opts.pins) || cache.PINS).forEach(l => {
      const [word, pos, labels, gloss] = l.split('\t');
      if (!map.has(word)) map.set(word, []);
      map.get(word).push({ pos, labels: labels.split(', '), gloss });
    });
    return map;
  }

  function senses(repo, opts) {
    const map = new Map();
    read(repo, SENSES, (opts && opts.pins) || cache.PINS).forEach(l => {
      const [word, pos, g, glosses] = l.split('\t');
      if (!map.has(word)) map.set(word, []);
      map.get(word).push({ pos, gender: g, glosses: glosses ? glosses.split(' | ') : [] });
    });
    return map;
  }

  const report = r => ['ok .cache/' + OUT + ' ' + r.senses + ' senses, ' + r.lemmas + ' lemmas', 'ok .cache/' + SENSES + ' ' + r.entries + ' entries'];

  module.exports = { extract, belgian, senses, marks, report };

  if (require.main === module) {
    const repo = process.argv[2];
    if (!repo) { console.log('usage: node tools/content/kaikki.js <repo>'); process.exit(1); }
    extract(repo).then(r => {
      report(r).forEach(l => console.log(l));
    }, e => { console.log('fail ' + e.message); process.exit(1); });
  }
  ```
  In `ATTRIBUTION.md`, replace the section title and paragraph
  ```
  ## Wiktionnaire — sens marqués belges

  `tools/content/kaikki.js` tire du même fichier de kaikki.org, épinglé dans
  `tools/content/lib/cache.js` (adresse, date, taille, sha256), les sens que le
  Wiktionnaire marque belges ou flamands. L'extrait reste dans `.cache/`, ignoré
  par git, et ne sert qu'à vérifier la preuve `wiktionary:<lemme>` d'une forme
  flamande proposée pour `src/content/be.js`. Rien n'en entre dans un fichier
  versionné, sauf le lemme qu'une preuve cite : un **fait**, ce mot est marqué
  belge. Aucune glose, aucun exemple.
  ```
  with
  ```text
  ## Wiktionnaire — sens marqués belges, et les entrées avec leur genre

  `tools/content/kaikki.js` tire du même fichier de kaikki.org, épinglé dans
  `tools/content/lib/cache.js` (adresse, date, taille, sha256), deux extraits :
  les sens que le Wiktionnaire marque belges ou flamands (`belgian.tsv`), et
  chaque entrée avec sa nature, son genre et la première glose de chacun de ses
  sens (`senses.tsv`). Les deux restent dans `.cache/`, ignoré par git. Le premier
  ne sert qu'à vérifier la preuve `wiktionary:<lemme>` d'une forme flamande
  proposée pour `src/content/be.js` ; le second, la preuve `wiktionary:<lemme>`
  d'un mot nouveau proposé pour un lexique, dont la nature (`pos`) s'accorde.
  Rien n'en entre dans un fichier versionné, sauf le lemme qu'une preuve cite :
  un **fait**, ce mot existe, ou est marqué belge. Aucune glose, aucun exemple : le
  sens d'un mot du cours est écrit pour le cours, le lemme cité dit seulement d'où
  il vient.
  ```
  (the « Régénérer : » lines that follow stay.) In `TESTING.md`, in the `tools/sources.js` row, replace
  ```
  l'extrait des sens belges du Wiktionnaire (`tools/content/kaikki.js`) et le classement
  ```
  with
  ```
  les deux extraits du Wiktionnaire (`tools/content/kaikki.js` : les sens belges, et chaque entrée avec sa nature, son genre et ses gloses) et le classement
  ```

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/sources.js .
  ```
  Expected: exit 0, these lines and no `FAIL`:
  ```
  SOURCES EXTERNES
    kaikki         8 sens belges sur 9 entrées, Brabant écarté, et les 9 entrées avec leur genre ; deux extraits datés par leur épingle
    tatoeba        22 phrases sur 24 gardées, auteurs et langue maternelle lus, classement sur 4 mots

  38 contrôles, SOURCES CONFORMES
  ```

- [ ] **Step 5: The new pin.** kaikki.org rewrote its file on 25 October, so the pin no longer matches anything that can be
  fetched (call 11). The new file is kept outside the tree. Run, from the run's worktree:
  ```
  node tools/content/fetch.js . kaikki/nl.jsonl --from ../../../.superpowers/sdd/phase-4-design/kaikki-2026-11-01
  ```
  Expected: exit 1 and `fail kaikki/nl.jsonl: sha256 42aaed451d99…, pinned 00c8ee4a9516… on 2026-10-22: the source changed, and the pin is to redo in a task`.
  In `tools/content/lib/cache.js`, replace
  ```
  date: '2026-10-22', bytes: 256173778, sha256: '00c8ee4a95169bb1ec0ac9b495d43dc7746a1e59e9a44914bae8909f9f167121'
  ```
  with
  ```
  date: '2026-11-01', bytes: 257235436, sha256: '42aaed451d9997e358290e68b0ff723235e2cc2a683edd1d273759d70cef9776'
  ```
  Run the same command again, then `node tools/content/kaikki.js .` and `node test/tools/sources.js .`. Expected:
  ```
  ok kaikki/nl.jsonl 257235436 bytes, sha256 42aaed451d99…
  ok .cache/kaikki/belgian.tsv 953 senses, 849 lemmas
  ok .cache/kaikki/senses.tsv 146771 entries
  38 contrôles, SOURCES CONFORMES
  ```
  If the folder holds no `nl.jsonl`, stop and report it: the pin cannot be proved without the file.

- [ ] **Step 6: Commit.**
  ```
  git add tools/content/lib/cache.js tools/content/kaikki.js test/tools/sources.js ATTRIBUTION.md TESTING.md
  git commit -m "feat(tools): kaikki.js writes a second extract, senses.tsv, one line per entry with its gender and glosses, and kaikki.senses() reads it (#123)"
  ```

Done when:
- `node test/tools/sources.js .` prints `38 contrôles, SOURCES CONFORMES`; on the old `kaikki.js` the same file
  printed the `FAIL: extract compte …` line and crashed on the missing `senses.tsv`.
- `tools/content/fetch.js` accepts the kept file under the new pin, and `node tools/content/kaikki.js .` prints
  `ok .cache/kaikki/belgian.tsv 953 senses, 849 lemmas` then `ok .cache/kaikki/senses.tsv 146771 entries`.
- `ATTRIBUTION.md` names both extracts and says what each one verifies; `TESTING.md`'s `tools/sources.js` row
  names the second.

### Task 3: The kit: a kind's rows may come from a unit, and a kind's split sees its ids
Class: mechanical
Ticket: #123
Promises: none
Why: D9 and D12: the 22 new units' words enter the course through the kit (`tools/content/`), as every
content row of phase 3 did, and the kit today refuses a row whose id is not an item: Split looks each row's
source up with `C.byId` (`kit.js:103-104`) and Merge the same (`kit.js:384-385`), the reading tool too
(`lib/reading.js:49-50`). The new words do not exist yet. After this task a kind may export
`sourceOf(C, id)`, the source of one of its rows, by default `C.byId(id)`; Split, Merge and the reading tool read
a row's source through it (Check works from `input.json`), `stamp()` reads `src.nl` as before (a unit source
carries `nl: u.id`), and Split writes `copies: []` for a source that has none. `lib/course.js` gains `C.units` (the RAW units, in
order) and `C.byUnit(id)`. `kind.split(C, ctx)` receives `ctx.ids`, the ids Split was given, or null. And
`lib/explain.js`'s `split('rest')` cuts only the sources without a `note`, unless `ctx.ids` names a row: that
is how task 7's FAN explanations drafts the new words' notes (task 6 merges them without one) without
redrafting the 421 notes the 12 first units already have, and how an old note is still redrafted by id (#106).
Task 4's `words` kind uses `sourceOf` (its source is a unit to come) and `C.units` (a second Split cuts nothing
for a unit already merged); task 7's Split relies on the `!note` rule. The reading tool's heading shows the
row's id, which is the source's for an item and the slot's for a unit source. And the reading tool prints a
row's own fields, `row: {…}`, under a row of a kind that has no table: such a kind has nothing at HEAD to show
under its row, so without this the maintainer's sample and ruled rows of the `words` kind would say nothing of
the drafted word. A row ruled `drop` keeps its last written fields for this (`settle` gives them as `dropped`;
Merge reads only `row`). This is the kit's rule rather than a hook in the `words` kind, and it lands here rather
than in task 4, because it is true of any kind without a table, `unite` below already is one (so its red is in
this task), and every edit of `reading.js` then stays in one task.

Files:
- Modify: `tools/content/lib/kit.js` (`loadKind`, lines 27–47; `split`, lines 81–125; `settle`, line 336; `merge`,
  lines 384–385)
- Modify: `tools/content/lib/course.js` (the header comment, line 12; the return, line 44)
- Modify: `tools/content/lib/explain.js` (the header comment, line 8; `split()`, line 109)
- Modify: `tools/content/lib/reading.js` (`read()`, lines 47–51; `heading`, lines 67–68; `block()`, lines 70–78;
  `unsentenced`, lines 132–135)
- Modify: `docs/agents/plan-runs/design-sitting.md` (« The scripts' contract », the Split bullet, line 96)
- Test: `test/tools/fanout.js` (the `settle` checks, line 367; the explanations section, lines 1179–1180,
  1204–1205 and 1222; a new block before « le genre flemish », line 549)

Lines are as of `2a86861`.

Notes:
- **Comments in French** in `tools/content/lib/*.js` and `test/tools/fanout.js`; the kit's printed lines stay
  English. `design-sitting.md` is English.
- **Line endings.** Match on content. These files are LF in the index and in a `git archive` of it; a checkout
  may differ by its `core.autocrlf`. `git diff` is the judge.
- **The trial kind `unite`** lives in the test, like `essai`: its source is a table of one unit, `x`, with
  `fr`/`en` so the reading tool's heading can be read, and its `split` copies `ctx.ids` into each row (`asked`)
  so the test sees what the kit passed. Its `tables` are empty: Merge then prints its `ok <kind> …` line and
  what `write` returns, and nothing else, and the reading tool prints each row's fields. A row whose `mot` is
  `doute` goes to the maintainer (`forMaintainer`), which is how the test gets a row ruled `drop`.
- **`C.units` is read without a count.** The check compares it with `C.RAW.units`, because the test's copy holds
  12 units today and 34 after task 6, and it guards each read (`C.byUnit && …`), so the old kit prints a `FAIL`
  line and not a `CRASH`.
- **The explanations tests after this task.** The kind `explanations` now cuts only the sources without a
  note. In the test's copy every source has one (the course's, or a trial note the test writes for any source
  the real course leaves without, as it does between task 6's merge and task 8's), except « het
  gemeentehuis », whose note the test removes: Split cuts `thuis 1`. The row of « dag », which the siblings test
  reads, is cut by naming it, in a second folder (`nommes/explanations`). The `want` list and the summary
  line follow.
- **Messages the kit already prints are unchanged**: `not an item (a copy, a pattern or an unknown id)` and
  `no longer an item` keep their words, so the tests of task 6 of the phase 3 plan hold.
- **The proof.** These steps ran on a copy of `2a86861` with task 2 applied. Step 2 printed 10 `FAIL` lines and
  `469 contrôles, 10 ÉCHEC(S)`; step 4 printed `469 contrôles, KIT CONFORME`.

- [ ] **Step 1: Write the failing test.** In `test/tools/fanout.js`, in the explanations section, find the two
  lines
  ```js
      table.update(BE, fixed);
      const EXTRACT = path.join(EX, '.cache', 'kaikki', 'belgian.tsv');
  ```
  and insert between them:
  ```js
      /* Le genre explanations ne coupe que les sources sans note : dans la copie, chaque source en a une
         (une note d'essai pour celles que le vrai cours laisse sans, les mots neufs d'une fusion récente),
         sauf « het gemeentehuis », dont la note est ôtée. */
      const notesFixed = {};
      C.sources.filter(s => !s.note).forEach(s => { notesFixed[s.nl] = { fr: 'Une note d’essai.', en: 'A trial note.' }; });
      notesFixed[HUIS] = null;
      table.update(path.join(EX, 'src', 'content', 'notes.js'), notesFixed);
  ```
  Then replace the two lines
  ```js
      const want = CE.RAW.units.map(u => [u.id, rest.filter(s => s.unit === u.id).length]).filter(x => x[1]).map(x => x.join(' '));
      same(runEx('split.js', [EX, RD]), { code: 0, lines: want }, 'Split de explanations coupe un lot par unité');
  ```
  with
  ```js
      /* Le genre explanations ne coupe que les sources sans note (une ici), et celles que Split nomme. */
      const unnoted = rest.filter(s => !s.note);
      same(unnoted.map(s => s.id), ['thuis:w12'], 'une seule source de explanations est sans note');
      const want = CE.RAW.units.map(u => [u.id, unnoted.filter(s => s.unit === u.id).length]).filter(x => x[1]).map(x => x.join(' '));
      same(runEx('split.js', [EX, RD]), { code: 0, lines: want }, 'Split de explanations coupe un lot par unité, des seules sources sans note');
      same(want, ['thuis 1'], 'un seul lot, d\'une ligne : les sources qui ont leur note ne sont pas recoupées');
      const RD2 = path.join(EX, 'nommes', 'explanations');
      same(runEx('split.js', [EX, RD2, 'overleven:w2', 'thuis:w12']), { code: 0, lines: ['overleven 1', 'thuis 1'] },
        'nommée, une source qui a sa note est coupée aussi (#106)');
  ```
  then replace the one line
  ```js
      same(rowIn(RD, 'overleven:w2').siblings.map(s => s.nl), ['de dag'], 'les frères de sens d\'une source sont dans sa ligne');
  ```
  with
  ```js
      same(rowIn(RD2, 'overleven:w2').siblings.map(s => s.nl), ['de dag'], 'les frères de sens d\'une source sont dans sa ligne');
  ```
  Then, where the test reads `kit.settle`, replace the one line
  ```js
    same(kit.settle('x', Object.assign({ 'rulings.json': ruled('drop', true) }, sent)), { drop: true }, 'drop : rien');
  ```
  with
  ```js
    same(kit.settle('x', Object.assign({ 'rulings.json': ruled('drop', true) }, sent)), { drop: true, dropped: D }, 'drop : rien à prendre, et la ligne reste à lire');
  ```
  Then find the one line
  ```js
    /* ==================================================== le genre flemish */
  ```
  and insert right above it this block, followed by one empty line:
  ```js
    /* ==================================================== une source hors du cours, et les ids nommés */
    {
      /* Un genre peut donner lui-même la source de ses lignes (sourceOf) : ici une table, sans copies ;
         le genre words donne une unité à venir. Le kit lit la source par lui, et le split du genre
         reçoit les ids nommés (ctx.ids), ou null. */
      kindFile('unite', `/* Le genre d'essai de test/tools/fanout.js dont la source n'est pas un élément du cours. */
  const UNITS = { x: { nl: 'x', fr: 'l’unité x', en: 'unit x', n: 1 } };
  module.exports = {
    stamp: [s => s.n],
    fields: ['mot'],
    tables: [],
    sourceOf: (C, id) => UNITS[id.split(':')[0]],
    split: (C, ctx) => [{ batch: 'x', rows: ['x:s00', 'x:s01'].map(id => ({ id, asked: ctx.ids })) }],
    check: row => (row.mot === 'ok' || row.mot === 'doute' ? [] : ['mot is not ok']),
    forMaintainer: row => (row.mot === 'doute' ? 'à voir' : ''),
    merge: () => ({}),
    write: taken => ['ok unite.txt ' + taken.map(x => x.id).join(' ')]
  };
  `);
      const UX = path.join(TMP, 'drafts', 'unite'), XB = path.join(UX, 'x');
      same(run('split.js', [TMP, UX]), { code: 0, lines: ['x 2'] }, 'Split coupe les lignes d\'une source hors du cours');
      const xin = f => (fs.existsSync(f) ? JSON.parse(text(f)) : null);
      const xrows = xin(path.join(XB, 'input.json')) || [];
      same(xrows, [{ id: 'x:s00', stamp: kit.stamp(kit.loadKind(TMP, 'unite'), { nl: 'x', n: 1 }, C.NL), copies: [], asked: null }, { id: 'x:s01', stamp: (xrows[0] || {}).stamp, copies: [], asked: null }],
        'une ligne d\'entrée : l\'empreinte de la source que le genre donne, aucune copie, et le split a reçu ids null');
      const UN = path.join(TMP, 'nommes', 'unite');
      same([run('split.js', [TMP, UN, 'x:s01']), (xin(path.join(UN, 'x', 'input.json')) || []).map(r => [r.id, r.asked])],
        [{ code: 0, lines: ['x 1'] }, [['x:s01', ['x:s01']]]], 'le split d\'un genre reçoit les ids nommés');
      fs.mkdirSync(XB, { recursive: true });
      put(XB, 'draft.json', xrows.map(r => ({ id: r.id, stamp: r.stamp, mot: 'ok' })));
      put(XB, 'review.json', xrows.map(r => ({ id: r.id, verdict: 'keep' })));
      same(run('check.js', [XB]), { code: 0, lines: ['ok input.json 2 rows', 'ok draft.json 2 rows', 'ok review.json 2 keep, 0 dispute'] }, 'Check lit un lot dont la source est hors du cours');
      same(run('merge.js', [TMP, UX]), { code: 0, lines: ['ok unite 2 taken, 0 dropped', 'ok unite.txt x:s00 x:s01'] }, 'Merge lit la source par le genre et, sans table, n\'écrit que ce que write écrit');
      const readingU = require(path.join(LIB, 'reading'));
      same(readingU.every(TMP, TMP, 'unite').lines.slice(0, 7), ['# unite: every row', '', '2 rows: 2 taken, 0 dropped.', '', '- `x` (x:s00) — l’unité x · unit x', '  - kept by the first reader', '  - row: {"mot":"ok"}'],
        'l\'outil de lecture lit la source par le genre, et sous une ligne d\'un genre sans table, ce qu\'elle écrit');
      /* Une ligne écartée par le mainteneur montre aussi ce qu'elle écrivait. */
      const UDW = path.join(TMP, 'ecartee'), UD = path.join(UDW, 'drafts', 'unite'), UDX = path.join(UD, 'x');
      run('split.js', [TMP, UD, 'x:s01']);
      fs.mkdirSync(UDX, { recursive: true });
      const udRows = xin(path.join(UDX, 'input.json')) || [];
      put(UDX, 'draft.json', udRows.map(r => ({ id: r.id, stamp: r.stamp, mot: 'doute' })));
      put(UDX, 'review.json', udRows.map(r => ({ id: r.id, verdict: 'for maintainer: à voir' })));
      put(UDX, 'disputes.md', '## x:s01\nSource: x\nRow: doute\nFirst reader: for maintainer: à voir\n');
      put(UDX, 'rulings.json', [{ id: 'x:s01', ruling: 'drop', words: 'pas celui-là', confirmed: true, date: '2026-10-22' }]);
      same(readingU.every(TMP, UDW, 'unite').lines.slice(2), ['1 rows: 0 taken, 1 dropped.', '', '- `x` (x:s01) — l’unité x · unit x', '  - ruled drop on 2026-10-22: pas celui-là', '  - row: {"mot":"doute"}'],
        'une ligne écartée d\'un genre sans table montre ce qu\'elle écrivait');
      /* course() donne les unités du cours, et une par son id. */
      same([C.units && C.units.map(u => u.id).join(' '), C.byUnit && C.byUnit('overleven').n, C.byUnit && C.byUnit('x')], [C.RAW.units.map(u => u.id).join(' '), 1, undefined],
        'C.units : les unités du cours dans l\'ordre ; C.byUnit en lit une, et rien pour une unité qu\'il n\'a pas');
      console.log('  source du genre sourceOf, ctx.ids : Split, Check, Merge, lecture');
    }
  ```

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exit 1, ten `FAIL` lines and the last line `469 contrôles, 10 ÉCHEC(S)`. The first is
  `drop : rien à prendre, et la ligne reste à lire : {"drop":true}, attendu {"drop":true,"dropped":{"id":"x","mot":"D"}}`.
  The next eight are the new block's, beginning
  ```
    FAIL: Split coupe les lignes d'une source hors du cours : {"code":1,"lines":["fail unite x:s00: not an item (a copy, a pattern or an unknown id)","fail unite x:s01: not an item (a copy, a pattern or an unknown id)"]}, attendu {"code":0,"lines":["x 2"]}
  ```
  and ending with `C.units : les unités du cours dans l'ordre ; C.byUnit en lit une, et rien pour une unité qu'il n'a pas : [null,null,null], attendu […]`;
  the tenth is `Split de explanations coupe un lot par unité, des seules sources sans note : {"code":0,"lines":["overleven 15","ikengij 29",…]}, attendu {"code":0,"lines":["thuis 1"]}`:
  the old kind cuts every source.

- [ ] **Step 3: Implement.** In `tools/content/lib/kit.js`, replace
  ```js
  /* Le module d'un genre, vérifié : ce qu'il doit déclarer et ce qu'il peut déclarer sont
     ci-dessous. Le genre essai de test/tools/fanout.js en est un exemple. */
  ```
  with
  ```js
  /* Le module d'un genre, vérifié : ce qu'il doit déclarer et ce qu'il peut déclarer sont
     ci-dessous. Le genre essai de test/tools/fanout.js en est un exemple. Un genre peut déclarer
     sourceOf(C, id), la source d'une de ses lignes : par défaut C.byId(id), un élément du cours ;
     le genre words donne une unité à venir, dont nl est l'id. Split, Merge et l'outil de lecture
     lisent la source par lui, et stamp() lit src.nl comme toujours. */
  ```
  then replace
  ```js
    const kind = Object.assign({ optional: [], verdictFields: [], forMaintainer: () => '', checkVerdict: () => [], readWhole: () => '' }, require(file));
  ```
  with
  ```js
    const kind = Object.assign({ optional: [], verdictFields: [], forMaintainer: () => '', checkVerdict: () => [], readWhole: () => '', sourceOf: (C, id) => C.byId(id) }, require(file));
  ```
  then replace
  ```js
    const fns = ['split', 'check', 'merge', 'forMaintainer', 'checkVerdict', 'readWhole'];
  ```
  with
  ```js
    const fns = ['split', 'check', 'merge', 'forMaintainer', 'checkVerdict', 'readWhole', 'sourceOf'];
  ```
  then, in the comment above `split()`, replace
  ```js
     genre les met : c'est ainsi que quelques lignes déjà fusionnées se récrivent. Un id que le
     genre ne coupe pas est refusé. */
  ```
  with
  ```js
     genre les met : c'est ainsi que quelques lignes déjà fusionnées se récrivent. Un id que le
     genre ne coupe pas est refusé. Le split du genre reçoit les ids nommés dans ctx.ids (null
     sans ids) : un genre qui ne coupe que ses lignes neuves coupe aussi celles qu'on lui nomme. */
  ```
  then replace
  ```js
    try { batches = kind.split(C, { repo: path.resolve(repo), kind, kindDir, course: () => C }); }
  ```
  with
  ```js
    try { batches = kind.split(C, { repo: path.resolve(repo), kind, kindDir, course: () => C, ids: keep ? ids.slice() : null }); }
  ```
  then replace
  ```js
        const src = C.byId(r.id);
        if (!src) lines.push('fail ' + name + ' ' + r.id + ': not an item (a copy, a pattern or an unknown id)');
  ```
  with
  ```js
        const src = kind.sourceOf(C, r.id);
        if (!src) lines.push('fail ' + name + ' ' + r.id + ': not an item (a copy, a pattern or an unknown id)');
  ```
  then replace
  ```js
        const src = C.byId(r.id), rest = Object.assign({}, r);
        delete rest.id;
        return Object.assign({ id: r.id, stamp: stamp(kind, src, C.NL), copies: src.copies.slice() }, rest);
  ```
  with
  ```js
        const src = kind.sourceOf(C, r.id), rest = Object.assign({}, r);
        delete rest.id;
        return Object.assign({ id: r.id, stamp: stamp(kind, src, C.NL), copies: (src.copies || []).slice() }, rest);
  ```
  then, in `settle()`, replace
  ```js
    if (ruling && ruling.ruling === 'drop') return { drop: true };
  ```
  with
  ```js
    /* Écartée, une ligne n'est pas prise ; l'outil de lecture montre encore ce qu'elle écrivait (dropped). */
    if (ruling && ruling.ruling === 'drop') return { drop: true, dropped: retry || draft };
  ```
  then, in `merge()`, replace
  ```js
      const src = C.byId(r.input.id);
      if (!src) { lines.push('fail ' + name + ' ' + r.input.id + ': no longer an item'); return; }
  ```
  with
  ```js
      const src = kind.sourceOf(C, r.input.id);
      if (!src) { lines.push('fail ' + name + ' ' + r.input.id + ': no longer an item'); return; }
  ```
  In `tools/content/lib/course.js`, replace
  ```js
       C.byId(id)    la source d'un id ; undefined pour une copie ou un id inconnu
  ```
  with
  ```js
       C.byId(id)    la source d'un id ; undefined pour une copie ou un id inconnu
       C.units       les unités telles qu'elles sont écrites (RAW.units), dans l'ordre du cours
       C.byUnit(id)  une unité par son id ; undefined pour une unité que le cours n'a pas encore
  ```
  then replace
  ```js
    return { NL, RAW, sources, byId: id => byId.get(id) };
  ```
  with
  ```js
    return { NL, RAW, sources, byId: id => byId.get(id), units: RAW.units, byUnit: id => RAW.units.find(u => u.id === id) };
  ```
  In `tools/content/lib/explain.js`, replace
  ```js
       X.kind('rest')      le genre explanations : un lot par unité, dans l'ordre du cours
  ```
  with
  ```js
       X.kind('rest')      le genre explanations : un lot par unité, dans l'ordre du cours, des seules
                           sources sans note (les mots neufs), et de celles que Split nomme (ctx.ids)
  ```
  then, in `split()`, replace
  ```js
      return C.RAW.units.map(u => ({ batch: u.id, rows: mine.filter(s => s.unit === u.id).map(s => rowOf(s, C, belgian)) }));
  ```
  with
  ```js
      /* Les seules sources sans note : les mots que le genre words vient de fondre. Une source qui a
         sa note ne se récrit qu'en la nommant (#106). */
      const named = new Set(ctx.ids || []);
      const cut = mine.filter(s => !s.note || named.has(s.id));
      return C.RAW.units.map(u => ({ batch: u.id, rows: cut.filter(s => s.unit === u.id).map(s => rowOf(s, C, belgian)) }));
  ```
  In `tools/content/lib/reading.js`, replace
  ```js
    r.rows.forEach(x => {
      if (x.why) lines.push('fail ' + name + ' ' + x.input.id + ': unsettled, ' + x.why);
      else if (!C.byId(x.input.id)) lines.push('fail ' + name + ' ' + x.input.id + ': no longer an item');
      else x.src = C.byId(x.input.id);
    });
  ```
  with
  ```js
    r.rows.forEach(x => {
      const src = r.kind.sourceOf(C, x.input.id);
      if (x.why) lines.push('fail ' + name + ' ' + x.input.id + ': unsettled, ' + x.why);
      else if (!src) lines.push('fail ' + name + ' ' + x.input.id + ': no longer an item');
      else x.src = src;
    });
  ```
  then replace
  ```js
  /* Une ligne lue : sa source, pourquoi elle est là, puis ce que chaque table du genre tient
     sous son néerlandais, et le doute du rédacteur s'il en a dit un. */
  ```
  with
  ```js
  /* Une ligne lue : sa source, pourquoi elle est là, puis ce que chaque table du genre tient
     sous son néerlandais, ou ce que la ligne écrit quand le genre n'a pas de table (le mot d'une
     place du genre words, même écartée), et le doute du rédacteur s'il en a dit un. */
  ```
  then replace
  ```js
  /* La ligne d'une source : son néerlandais, son id et son sens, langue par langue. */
  const heading = (src, G) => '- `' + src.nl + '` (' + src.id + ') — ' + G.LANGS.map(l => G.of(src, l)).join(' · ');
  ```
  with
  ```js
  /* La ligne d'une source : son néerlandais, l'id de la ligne (celui de la source, sauf quand le genre
     donne la source lui-même) et son sens, langue par langue. */
  const heading = (src, G, id) => '- `' + src.nl + '` (' + (id || src.id) + ') — ' + G.LANGS.map(l => G.of(src, l)).join(' · ');

  /* Les champs d'une ligne écrite, sans son id ni son empreinte. */
  const fieldsOf = row => {
    const rest = Object.assign({}, row);
    delete rest.id;
    delete rest.stamp;
    return rest;
  };
  ```
  then, in `block()`, replace
  ```js
    const out = [heading(x.src, G), '  - ' + why.join('; ')];
    k.tables.forEach(t => out.push('  - ' + t + '.js: ' + (has(k.entries[t], x.src.nl) ? table.literal(k.entries[t][x.src.nl]) : 'no entry')));
  ```
  with
  ```js
    const out = [heading(x.src, G, x.input.id), '  - ' + why.join('; ')];
    k.tables.forEach(t => out.push('  - ' + t + '.js: ' + (has(k.entries[t], x.src.nl) ? table.literal(k.entries[t][x.src.nl]) : 'no entry')));
    const written = x.row || x.dropped;
    if (!k.tables.length && written) {
      const shown = fieldsOf(written);
      delete shown.unsure;
      out.push('  - row: ' + JSON.stringify(shown));
    }
  ```
  then, in `unsentenced()`, replace
  ```js
      const rest = Object.assign({}, x.row);
      delete rest.id;
      delete rest.stamp;
      lines.push('  - ' + name + ': ' + JSON.stringify(rest) + '; ' + settled(x));
  ```
  with
  ```js
      lines.push('  - ' + name + ': ' + JSON.stringify(fieldsOf(x.row)) + '; ' + settled(x));
  ```
  In `docs/agents/plan-runs/design-sitting.md`, under « The scripts' contract », in the Split bullet, replace
  the line
  ```
    named) and exits 1.
  ```
  with
  ```
    named) and exits 1. A kind's `split(C, ctx)` receives the named ids as `ctx.ids` (null when none), so a
    kind that cuts only its new rows (`explanations` cuts the sources without a note) still cuts a named row. A
    kind may give its rows' source itself, `sourceOf(C, id)` (by default `C.byId(id)`, an item of the course):
    the `words` kind gives a unit to come, so its rows exist before their words do.
  ```

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exit 0, no `FAIL`, among its lines
  ```
    source du genre sourceOf, ctx.ids : Split, Check, Merge, lecture
    explanations   3 + 1 lots, 88 + 333 lignes ; la note et ses citations, les « on dit aussi », les leurres ; Merge
  ```
  and the last line `469 contrôles, KIT CONFORME`.

- [ ] **Step 5: Commit.**
  ```
  git add tools/content/lib/kit.js tools/content/lib/course.js tools/content/lib/explain.js tools/content/lib/reading.js docs/agents/plan-runs/design-sitting.md test/tools/fanout.js
  git commit -m "feat(tools): a kind may give its rows' source (sourceOf), its split sees the ids Split was given, and explanations cuts only the sources without a note (#123)"
  ```

Done when:
- `node test/tools/fanout.js .` prints `469 contrôles, KIT CONFORME`; on the old kit the same file printed
  `469 contrôles, 10 ÉCHEC(S)`.
- `kit.loadKind` gives every kind a `sourceOf`; Split, Merge and `reading.js` read a row's source through it;
  `kind.split` receives `ctx.ids`; `course()` returns `units` and `byUnit`; `explain.js`'s `split('rest')` cuts
  the sources without a note and the named ones; `reading.js` prints a row's fields under a row of a kind
  without a table, a dropped row's too.
- `design-sitting.md` « The scripts' contract » says what `sourceOf` and `ctx.ids` are.

### Task 4: The words kind, and an empty lexicon.a1c.js
Class: mechanical
Ticket: #123
Promises: none
Why: D9 (one tranche finishing A1: about 400–600 new words in new units) and D12 (meanings from the pinned
Wiktionary extract, read by two readers like every kind). The 22 units were approved on 2026-10-28 and 31
(this task's `UNITS`): their ids, numbers 13 to 34, names in Dutch, French and English,
tracks, icons and targets, 605 slots in all, and the maintainer's sample words, which take a unit's first
slots. This task writes the kind that carries them, `tools/content/kinds/words.js`, against task 3's kit. Its
source is not an item but a unit to come (`UNITS`, `sourceOf`): a row is a **slot**, `<unit>:s<k>`, that a
drafter fills with one word. Split cuts one batch per unit of `UNITS` not yet in `C.units`, so a second Split
after Merge cuts nothing. Check holds a row to what the course can verify: six fields (`nl`, `fr`, `en`, `art`,
`pos`, `evidence`), OpenTaal spelling, a noun's article against `test/data/dehet.tsv` (what `test/dehet.js`
enforces after Merge; a noun the table lacks is refused, since the suite would refuse it), no article on
anything else, no Dutch the course already has (the plan's constraint), the sample word on its slot, an
evidence that is a lemma of task 2's `senses.tsv` whose part of speech agrees and that `nl` uses, or `course`
(a Flemish colleague's word the extract lacks: to the maintainer by rule), and the English guards of
`test/content.js:398-428` as reasons. Merge writes no table: its `write` rewrites
`src/content/lexicon.a1c.js` whole from `UNITS` and the taken rows, in slot order, and appends one
`<unit>:w<i>\t<nl>` line per word to `test/data/ids.tsv`; it refuses two taken rows that write the same word
and a taken row that repeats an item of the course (the course may have moved since Split). The stamp covers
nothing Merge writes, so a second Merge rewrites the same file byte for byte and adds nothing to `ids.tsv`. The
task also creates `src/content/lexicon.a1c.js` empty (the header and the IIFE, no unit), listed in `build.sh`'s
`SRC` after `lexicon.a1b.js` and in `test/smoke.js`'s file list, so the page loads it before Merge writes it;
`test/content.js`'s check 6 names a third batch, `lexiqueA1c`. The 22
blurbs are course-written text, one sentence each in the voice of `lexicon.a1.js`'s: the maintainer reads
them in the plan. They quote no Dutch and write no word that is the same in French and in English and could
become course Dutch, so `test/lang.js`'s 6d guards stay quiet when task 6 merges them.

Files:
- Create: `tools/content/kinds/words.js`
- Create: `src/content/lexicon.a1c.js`
- Modify: `build.sh` (`SRC`, line 27)
- Modify: `test/smoke.js` (the `files` list, line 14)
- Modify: `test/content.js` (check 6's batches, lines 350, 353 and 363)
- Modify: `TESTING.md` (the `tools/fanout.js` row, line 26)
- Test: `test/tools/fanout.js` (a new block before « 9. l'outil de lecture », line 1388 as of `2a86861`, moved
  down by task 3's blocks)

Lines are as of `2a86861`, except where « after task 3 » is said.

Notes:
- **Comments in French** in `words.js`, `lexicon.a1c.js`, `test/tools/fanout.js` and `test/content.js`; Check's
  reasons and Merge's lines in English, as the kit's. `TESTING.md` is French, `build.sh` English.
- **Line endings.** Match on content. These files are LF in the index and in a `git archive` of it; a checkout
  may differ by its `core.autocrlf`. `write()` keeps the line endings of the file it rewrites, and `ids.tsv`'s.
  `git diff` is the judge.
- **Where the test runs.** Its own copy under `TMP` (`build.sh`, `src`, `test/lib`, `test/data`, `tools`), as the
  flemish block does, with a hand `senses.tsv` of 9 entries under the real pin, so no `.cache/` is needed. In
  that copy the test empties `lexicon.a1c.js` and takes the new units' lines out of `ids.tsv`, so the block holds
  after task 6 has merged the real words.
- **Named Split in the test.** A draft has one row per input row, so a hand test fills whole batches only by
  naming slots: the end-to-end part splits four slots of two units (`vragen:s00`, `vragen:s10`, `wonen:s00`,
  `wonen:s10`). Task 6's proof did the same.
- **The reading list.** `readWhole` is the kit's default, `''`: the maintainer reads `reading.js`'s sample and the
  rows ruled, each with `row: {…}` under it by task 3's rule for a kind without a table. `sourceOf` gives the
  unit's names as `fr` and `en`, which are not in the stamp, so the heading of a slot reads « `wonen` (wonen:s00) —
  Aménager la maison · Furnishing the house ». `reading.js` samples 1 in 10, at least 10 per kind; D15 says 1 in
  20, and no task of this plan changes the tool (call 10). `verdictFields` are none: a
  verdict carries `id` and `verdict`.
- **The lists that load a lexicon.** `build.sh`'s `SRC` is what the page and most suites load, and `test/smoke.js`
  keeps its own `files` list. While the new lexicon is empty, leaving it out of either stays green, so the block's
  first two checks read both lists and name every `src/content/lexicon.*.js`, plus `lexicon.a1c.js`, which does
  not exist before this task: that is their red.
- **`test/content.js`, check 6: `lexique(n)` is naming only.** `lexiqueA1c` is the name of a batch that check 6
  reports what is owed under; it changes no check and has no red of its own.
- **`build.sh`'s word count is left alone.** Line 120 sets `$words` and nothing reads it (nor did before this
  plan), so adding the new file there would change nothing that can be seen or tested.
- **Check leaves out one guard of `test/content.js`, the `u`/`uw` register (lines 416–418 and 425–426).** `u` and
  `uw` are items of the course (`ikengij:w2`, `ikengij:w22`), so Check already refuses them as words; only a
  several-word row could reach the guard, and `test/content.js` still holds it at task 6. Copying its three
  helpers here would be a second copy of what that file owns.
- **`write()` looks before it writes.** It finds a mismatch with `ids.tsv` before its first `writeFileSync`, so a
  refused Merge leaves the lexicon as it was. And it names every word written twice in one line, so task 6's
  first Merge lists them all: each batch's Check saw only its own rows (task 5's Why says what happens next).
- **`pos: name`.** A noun that takes no article (België, Pasen, januari, Kerstmis) is `name`, `art: null`, `nl`
  bare; the extract calls België a `name` and januari a `noun`, and Check takes either for either.
- **Red.** The two lists' checks print a `FAIL` each. Then, without `words.js`, the block's `require` throws: step 2
  ends in a `CRASH`, the suite's own way of saying a required module is missing; `FAIL` lines follow once the
  module exists but is wrong.
- **The proof.** These steps ran on a copy of `2a86861` with tasks 2 and 3 applied, and tasks 1 and 1b not (they
  add to `src/core/srs.js`, so the build's sizes differ in the run, not its growth). Step 2 printed the two `FAIL`
  lines and `CRASH Error: Cannot find module '…\mots\tools\content\kinds\words'`; step 4 printed
  `506 contrôles, KIT CONFORME`; `sh build.sh` printed `built (local only) index.html (684364 bytes), artifact.html
  (683750 bytes)` (683770 and 683156 before: both grow by 594 bytes, the empty lexicon's `<script>`);
  `node test/smoke.js .` ended `ALL CHECKS PASSED`; `node test/content.js .` ended `2077 contrôles, CONTENU CONFORME`.

- [ ] **Step 1: Write the failing test.** In `test/tools/fanout.js`, find the two lines
  ```js
    /* ==================================================== 9. l'outil de lecture
       Un bloc : ses noms ne croisent pas ceux des sections que d'autres tâches ajoutent. */
  ```
  and insert right above them this block, followed by one empty line:
  ```js
    /* ==================================================== le genre words */
    {
      /* tools/content/kinds/words.js dans un dépôt à lui sous la copie, avec test/data (l'orthographe et
         de / het) et un extrait des sens du Wiktionnaire fait ici, de quelques lignes, sous la vraie
         épingle. Sa source est une unité à venir : le cours de la copie n'en a aucune, et Split coupe
         les 22. check.js lit le dépôt qui le contient : les outils se lancent depuis celui-ci. */
      const { oneLine } = require('../lib/text');
      /* Chaque lexique est chargé par la page (SRC de build.sh) et par test/smoke.js, qui a sa propre liste : un
         lexique oublié de l'une d'elles reste vert tant qu'il est vide. */
      const lexica = [...new Set(fs.readdirSync(path.join(ROOT, 'src', 'content')).filter(f => /^lexicon\..*\.js$/.test(f)).concat('lexicon.a1c.js'))];
      same(lexica.filter(f => text(path.join(ROOT, 'test', 'smoke.js')).indexOf('\'src/content/' + f + '\'') < 0), [], 'la liste de test/smoke.js nomme chaque lexique de src/content');
      same(lexica.filter(f => text(path.join(ROOT, 'build.sh')).split(/\r?\n/).indexOf('src/content/' + f) < 0), [], 'le SRC de build.sh nomme chaque lexique de src/content');
      const WD = path.join(TMP, 'mots');
      ['build.sh', 'src', 'test/lib', 'test/data', 'tools'].forEach(p => fs.cpSync(path.join(ROOT, p), path.join(WD, p), { recursive: true }));
      const runWd = (script, args) => {
        const r = spawnSync(process.execPath, [path.join(WD, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
        return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
      };
      const SENSES = path.join(WD, '.cache', 'kaikki', 'senses.tsv');
      fs.mkdirSync(path.dirname(SENSES), { recursive: true });
      fs.writeFileSync(SENSES, '# kaikki/nl.jsonl sha256 ' + cache.PINS['kaikki/nl.jsonl'].sha256 + '\n' + [
        'België\tname\thet\tBelgium', 'douche\tnoun\tde\tshower', 'januari\tnoun\t\tJanuary', 'kunnen\tverb\t\tto be able', 'stoel\tnoun\tde\tchair',
        'tafel\tnoun\tde\ttable', 'toch\tadv\t\tstill | anyway', 'waarom\tadv\t\twhy', 'wie\tpron\t\twho'
      ].join('\n') + '\n');
      const K = require(path.join(WD, 'tools', 'content', 'kinds', 'words'));
      /* Le cours de la copie sans les unités de UNITS, quoi que le vrai cours en tienne déjà (une fusion du
         genre) : le lexique vidé, et leurs lignes ôtées de ids.tsv. */
      const LEX = path.join(WD, 'src', 'content', 'lexicon.a1c.js'), IDS = path.join(WD, 'test', 'data', 'ids.tsv');
      const own = new Set(K.UNITS.map(u => u.id));
      fs.writeFileSync(LEX, K.lexicon([]).map(l => l + '\n').join(''));
      fs.writeFileSync(IDS, text(IDS).split(/\r?\n/).filter(l => l && !own.has(l.split(':')[0])).map(l => l + '\n').join(''));
      const CW = course(WD), NLW = CW.NL;

      /* Les 22 unités : leurs ids, leurs numéros, leurs cibles, chacune ses deux noms et ses deux présentations. */
      same([K.UNITS.length, K.UNITS.map(u => u.n).join(' '), K.UNITS.reduce((s, u) => s + u.target, 0), new Set(K.UNITS.map(u => u.id)).size],
        [22, Array.from({ length: 22 }, (x, k) => 13 + k).join(' '), 605, 22], '22 unités, numérotées de 13 à 34, 605 places, chacune son id');
      ok(K.UNITS.every(u => ['fr', 'en'].every(l => oneLine(u.name[l]) && oneLine(u.blurb[l])) && oneLine(u.nlName) && u.icon && ['beide', 'leven', 'werk'].indexOf(u.track) >= 0 &&
        u.samples.length <= u.target && !CW.units.some(x => x.id === u.id)), 'chaque unité a ses noms, ses présentations, son icône, sa voie, au plus autant de témoins que de places, et n\'est pas encore dans le cours');
      same(K.sourceOf(CW, 'wonen:s03'), Object.assign({}, K.UNITS[10], { nl: 'wonen', fr: 'Aménager la maison', en: 'Furnishing the house' }), 'la source d\'une place est son unité, dont nl est l\'id, fr et en ses noms');
      ok(K.sourceOf(CW, 'zzz:s00') === undefined, 'une place d\'une unité inconnue n\'a pas de source');

      /* Split : un lot par unité, autant de lignes que de places ; une ligne porte sa place et son témoin. */
      const KW = path.join(WD, 'drafts', 'words');
      same(runWd('split.js', [WD, KW]), { code: 0, lines: K.UNITS.map(u => u.id + ' ' + u.target) }, 'Split coupe un lot par unité, une ligne par place');
      const rowW = (dir, id) => JSON.parse(text(path.join(dir, id.split(':')[0], 'input.json'))).find(r => r.id === id);
      same(rowW(KW, 'wonen:s00'), { id: 'wonen:s00', stamp: kit.stamp(K, K.sourceOf(CW, 'wonen:s00'), NLW), copies: [], unit: 'wonen', n: 23, nlName: 'Het huis inrichten',
        name: { fr: 'Aménager la maison', en: 'Furnishing the house' }, target: 30, slot: 0, sample: 'de tafel' }, 'une ligne d\'entrée : sa place, son unité et le mot du mainteneur');
      same([rowW(KW, 'wonen:s29').sample, rowW(KW, 'wonen:s29').slot, rowW(KW, 'vragen:s09').sample], [null, 29, 'nu'], 'une place sans témoin en a null');

      /* Check : chaque règle, sur une ligne juste et une ligne fausse. */
      const ctxW = { repo: WD, course: () => CW };
      const TAFEL = { nl: 'de tafel', fr: 'la table', en: 'table', art: 'de', pos: 'noun', evidence: 'wiktionary:tafel' };
      const WIE = { nl: 'wie', fr: 'qui', en: 'who', art: null, pos: 'pron', evidence: 'wiktionary:wie' };
      const at = (id, row) => K.check(Object.assign({ id }, row), rowW(KW, id), ctxW);
      const wrong = (id, base, more) => at(id, Object.assign({}, base, more));
      same([at('wonen:s00', TAFEL), at('vragen:s00', WIE), at('wonen:s10', { nl: 'de douche', fr: 'la douche', en: 'shower', art: 'de', pos: 'noun', evidence: 'course' }),
        at('kalender:s00', { nl: 'januari', fr: 'janvier', en: 'January', art: null, pos: 'name', evidence: 'wiktionary:januari' })],
      [[], [], [], []], 'une ligne juste passe : un nom avec son article, un pronom, une preuve course, un nom sans article (name)');
      same(K.forMaintainer({ evidence: 'course' }) + '|' + K.forMaintainer(TAFEL), 'evidence course|', 'une preuve course va au mainteneur');
      same([wrong('wonen:s00', TAFEL, { nl: ' de tafel' }), wrong('wonen:s00', TAFEL, { fr: '' }), wrong('wonen:s00', TAFEL, { art: 'een' }), wrong('wonen:s00', TAFEL, { pos: 'nom' }),
        wrong('wonen:s00', TAFEL, { evidence: 'wiktionary' })], [
        ['nl is a text on one line with no space at either end'], ['fr is a text on one line with no space at either end'], ['art is de, het or null'],
        ['pos is one of noun, name, verb, adj, adv, pron, prep, conj, num, other'], ['evidence is wiktionary:<lemma> or course']
      ], 'la forme des six champs');
      same(wrong('wonen:s00', TAFEL, { nl: 'de taffel' }), ['« taffel » is not Dutch that OpenTaal or flemish.tsv knows: pick another word, or say in unsure why the course needs this one',
        '« taffel » is not in test/data/dehet.tsv, so test/dehet.js would refuse it after Merge: pick another word, or say in unsure why the course needs this one',
        'this slot writes the sample « de tafel », not « de taffel »', 'nl does not use the lemma « tafel »'], 'l\'orthographe, de / het, le témoin de la place, et le lemme que nl emploie');
      same([wrong('wonen:s00', TAFEL, { art: null }), wrong('wonen:s00', TAFEL, { nl: 'tafel' }), wrong('wonen:s00', TAFEL, { nl: 'het tafel', art: 'het' }),
        wrong('wonen:s10', { nl: 'de zqzq', fr: 'le zq', en: 'zq', art: 'de', pos: 'noun', evidence: 'course' }, {}).slice(1)], [
        ['a noun carries its article: art is de or het'], ['nl starts with its article « de »'], ['« het tafel »: test/data/dehet.tsv says « de »'],
        ['« zqzq » is not in test/data/dehet.tsv, so test/dehet.js would refuse it after Merge: pick another word, or say in unsure why the course needs this one']
      ], 'un nom porte son article, celui de dehet.tsv, et un nom que la table ignore est refusé');
      same([wrong('vragen:s00', WIE, { art: 'de' }), wrong('vragen:s00', WIE, { nl: 'de wie' })],
        [['art is null for a word that is not a noun'], ['a word that is not a noun carries no article: nl is « wie »']],
        'un mot qui n\'est pas un nom n\'a pas d\'article');
      const DAG = CW.byId('overleven:w2');
      same(wrong('vragen:s10', WIE, { nl: DAG.nl, fr: DAG.fr, en: DAG.en, pos: 'other', evidence: 'course' }),
        ['« ' + DAG.nl + ' » is already an item of the course, overleven:w2 « ' + DAG.nl + ' »: a new word never repeats an existing item\'s Dutch'], 'un mot que le cours a déjà est refusé');
      same([wrong('wonen:s00', TAFEL, { evidence: 'wiktionary:tafels' }), wrong('wonen:s00', TAFEL, { evidence: 'wiktionary:toch' }), wrong('vragen:s00', WIE, { pos: 'adv' })], [
        ['« tafels » is not an entry of the pinned Wiktionary extract (.cache/kaikki/senses.tsv): cite the lemma as the extract spells it, or evidence course'],
        ['« toch » is « adv » in the extract, not noun', 'nl does not use the lemma « toch »'], ['« wie » is « pron » in the extract, not adv']
      ], 'la preuve : un lemme de l\'extrait, de la même nature, que nl emploie');
      same([wrong('kunnen:s00', { nl: 'kunnen', fr: 'pouvoir', en: 'can', art: null, pos: 'verb', evidence: 'wiktionary:kunnen' }, {}),
        wrong('wonen:s00', TAFEL, { en: 'the table' }), wrong('wonen:s00', TAFEL, { fr: '2 tables' }), wrong('vragen:s10', WIE, { nl: 'hoezo', fr: 'bonjour', en: 'hi', evidence: 'course' })], [
        ['a verb\'s en starts with « to »'], ['a noun\'s en takes no article'], ['fr and en hold different digits or {…} tokens'],
        ['en shares a sense with overleven:w2 « dag » (hi / bye), which shares no French sense and no Dutch: give one of them another English, or the French they share']
      ], 'les gardes de test/content.js sur l\'anglais : « to », pas d\'article, mêmes chiffres, pas de sens anglais partagé sans le français');
      same([wrong('wonen:s00', TAFEL, { fr: 'l\'table' }), wrong('wonen:s00', TAFEL, { fr: 'la "table"' }), wrong('wonen:s00', TAFEL, { nl: 'de tafel"' }).filter(w => /^nl writes/.test(w)),
        at('wonen:s10', { nl: 'de douche', fr: 'l’eau de la douche', en: 'shower', art: 'de', pos: 'noun', evidence: 'course' })], [
        ['fr writes the typographic apostrophe « ’ » and no straight quote'], ['fr writes the typographic apostrophe « ’ » and no straight quote'],
        ['nl writes the typographic apostrophe « ’ » and no straight quote'], []
      ], 'le français et le néerlandais écrivent l\'apostrophe typographique, et aucun guillemet droit');
      fs.renameSync(SENSES, SENSES + '.old');
      same(K.check(Object.assign({ id: 'wonen:s00' }, TAFEL), rowW(KW, 'wonen:s00'), { repo: WD, course: () => CW }), ['.cache/kaikki/senses.tsv is missing: run node tools/content/kaikki.js .'],
        'sans extrait, Check dit la commande à lancer');
      fs.renameSync(SENSES + '.old', SENSES);

      /* De bout en bout : quatre places de deux unités, nommées à Split, rédigées et relues, check.js,
         Merge (refusée tant que deux places écrivent le même mot), le lexique et ids.tsv récrits, Merge
         relancée à l'identique, et un second Split qui ne coupe plus ces unités. */
      const E2WS = path.join(WD, 'bout-en-bout'), E2W = path.join(E2WS, 'drafts', 'words');
      same(runWd('split.js', [WD, E2W, 'vragen:s00', 'vragen:s10', 'wonen:s00', 'wonen:s10']), { code: 0, lines: ['vragen 2', 'wonen 2'] }, 'Split nommé coupe quatre places');
      const ROWS = {
        'vragen:s00': WIE,
        'vragen:s10': { nl: 'toch', fr: 'quand même', en: 'anyway', art: null, pos: 'adv', evidence: 'wiktionary:toch' },
        'wonen:s00': TAFEL,
        'wonen:s10': { nl: 'toch', fr: 'pourtant', en: 'still', art: null, pos: 'adv', evidence: 'wiktionary:toch' }
      };
      ['vragen', 'wonen'].forEach(b => {
        const dir = path.join(E2W, b), inp = JSON.parse(text(path.join(dir, 'input.json')));
        put(dir, 'draft.json', inp.map(r => Object.assign({ id: r.id, stamp: r.stamp }, ROWS[r.id])));
        put(dir, 'review.json', inp.map(r => ({ id: r.id, verdict: 'keep' })));
        same(runWd('check.js', [dir]).code, 0, 'le lot ' + b + ', rédigé et relu, passe');
      });
      const lexBefore = text(LEX), idsBefore = text(IDS);
      same(runWd('merge.js', [WD, E2W]), { code: 1, lines: ['fail words -: wonen:s10 and vragen:s10 both write « toch »: one word, one slot'] }, 'Merge refuse deux places qui écrivent le même mot');
      same([text(LEX), text(IDS)], [lexBefore, idsBefore], 'refusée, Merge n\'écrit rien');
      const slotOf = (id, nl, unit) => ({ id, row: { nl }, input: { unit } });
      throws(() => K.write([slotOf('vragen:s10', 'toch', 'vragen'), slotOf('vragen:s11', 'de douche', 'vragen'), slotOf('wonen:s10', 'toch', 'wonen'), slotOf('wonen:s11', 'de douche', 'wonen')], ctxW),
        /^wonen:s10 and vragen:s10 both write « toch »; wonen:s11 and vragen:s11 both write « de douche »: one word, one slot$/, 'Merge nomme chaque mot écrit deux fois, d\'un coup');
      const WONEN = path.join(E2W, 'wonen');
      put(WONEN, 'draft.json', JSON.parse(text(path.join(WONEN, 'draft.json'))).map(r => (r.id === 'wonen:s10' ? Object.assign(r, { nl: 'de douche', fr: 'la douche', en: 'shower', art: 'de', pos: 'noun', evidence: 'wiktionary:douche' }) : r)));
      same(runWd('merge.js', [WD, E2W]), { code: 0, lines: ['ok words 4 taken, 0 dropped', 'ok lexicon.a1c.js 4 words in 2 units', 'ok ids.tsv 4 added'] },
        'Merge écrit le lexique et ids.tsv, et le dit');
      const lexAfter = text(LEX), idsAfter = text(IDS);
      ok(lexAfter.indexOf('W(\'de tafel\', { fr: \'la table\', en: \'table\' }, \'de\')') > 0 && lexAfter.indexOf('W(\'wie\', { fr: \'qui\', en: \'who\' })') > 0 &&
        lexAfter.indexOf('id: \'vragen\', n: 13,') < lexAfter.indexOf('id: \'wonen\', n: 23,'), 'le lexique écrit chaque mot comme lexicon.a1b.js, les unités dans l\'ordre');
      same(text(IDS).slice(idsBefore.length).split(/\r?\n/).filter(Boolean), ['vragen:w0\twie', 'vragen:w1\ttoch', 'wonen:w0\tde tafel', 'wonen:w1\tde douche'],
        'ids.tsv gagne une ligne par mot, numérotés sans trou dans l\'ordre des places');
      const CM = course(WD);
      same([CM.units.length, CM.byUnit('wonen').words.map(w => w.nl), CM.byUnit('vragen').n, CM.byUnit('wonen').phrases, CM.byUnit('wonen').grammar],
        [14, ['de tafel', 'de douche'], 13, [], []], 'le cours relu a ses deux unités nouvelles, leurs mots, sans phrase ni grammaire');
      same(runWd('merge.js', [WD, E2W]), { code: 0, lines: ['ok words 4 taken, 0 dropped', 'ok lexicon.a1c.js 4 words in 2 units', 'ok ids.tsv 0 added'] },
        'relancée, Merge récrit le même lexique et n\'ajoute rien à ids.tsv');
      same([text(LEX), text(IDS)], [lexAfter, idsAfter], 'le lexique et ids.tsv sont les mêmes octet pour octet');
      /* Un autre mot sous un id déjà épinglé : refusé avant toute écriture. */
      const wonenDraft = text(path.join(WONEN, 'draft.json'));
      put(WONEN, 'draft.json', JSON.parse(wonenDraft).map(r => (r.id === 'wonen:s10' ? Object.assign(r, { nl: 'de stoel', fr: 'la chaise', en: 'chair', evidence: 'wiktionary:stoel' }) : r)));
      same(runWd('merge.js', [WD, E2W]), { code: 1, lines: ['fail words -: test/data/ids.tsv pins wonen:w1 to « de douche », and Merge writes « de stoel » there'] }, 'Merge refuse un autre mot sous un id épinglé');
      same([text(LEX), text(IDS)], [lexAfter, idsAfter], 'refusée pour un id épinglé, Merge n\'a rien écrit');
      put(WONEN, 'draft.json', wonenDraft);
      /* Ce que le mainteneur lit d'une place : son unité, et le mot écrit (task 3 : un genre sans table). */
      const readingW = require(path.join(WD, 'tools', 'content', 'lib', 'reading'));
      same(readingW.every(WD, E2WS, 'words').lines.slice(2, 7), ['4 rows: 4 taken, 0 dropped.', '', '- `vragen` (vragen:s00) — Questions et petits mots · Questions and small words', '  - kept by the first reader',
        '  - row: {"nl":"wie","fr":"qui","en":"who","art":null,"pos":"pron","evidence":"wiktionary:wie"}'], 'l\'outil de lecture montre le mot d\'une place, et son unité');
      same(readingW.list(WD, E2WS).lines.filter(l => /^ {2}- row: /.test(l)).length, 4, 'la liste du contrôle du contenu aussi');
      same(runWd('split.js', [WD, path.join(WD, 'apres', 'words')]), { code: 0, lines: K.UNITS.filter(u => u.id !== 'vragen' && u.id !== 'wonen').map(u => u.id + ' ' + u.target) },
        'un second Split ne coupe plus les unités fondues');
      console.log('  words          ' + K.UNITS.length + ' unités, ' + K.UNITS.reduce((s, u) => s + u.target, 0) + ' places ; chaque règle, Merge de bout en bout, relancée, second Split');
    }
  ```

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exit 1, and after the summary lines of the sections before it,
  ```
    FAIL: la liste de test/smoke.js nomme chaque lexique de src/content : ["lexicon.a1c.js"], attendu []
    FAIL: le SRC de build.sh nomme chaque lexique de src/content : ["lexicon.a1c.js"], attendu []
  CRASH Error: Cannot find module '<tmp>\mots\tools\content\kinds\words'
  ```

- [ ] **Step 3: Implement.** Create `tools/content/kinds/words.js`:
  ```js
  /* Le genre words : les mots des unités que le cours n'a pas encore (UNITS, les 22 unités de la
     phase 4). La tâche « FAN words » du plan en écrit les lignes ; ce module les coupe, les vérifie et
     les fond (tools/content/lib/kit.js). Sa source n'est pas un élément du cours mais une unité à
     venir (sourceOf) : une ligne est une place, « <unité>:s<k> », que le rédacteur remplit d'un mot.
     Une ligne écrite porte six champs :
       nl        le mot tel que le cours l'écrit : un nom avec son article (« de tafel »), un verbe à
                 l'infinitif, le reste nu
       fr        son sens en français de Belgique ; en, son sens en anglais courant
       art       'de' ou 'het' pour un nom, null pour tout autre mot
       pos       noun, name (un nom sans article : België, Pasen, januari), verb, adj, adv, pron, prep,
                 conj, num ou other
       evidence  wiktionary:<lemme>  un lemme de .cache/kaikki/senses.tsv dont la nature s'accorde et que
                                     nl emploie (D12)
                 course              une forme que l'extrait n'a pas et qu'un collègue flamand dit : la
                                     ligne va au mainteneur
     Merge n'écrit aucune table : son write récrit src/content/lexicon.a1c.js entier, depuis UNITS et
     les lignes prises dans l'ordre des places (les places écartées ne laissent pas de trou), et ajoute
     à test/data/ids.tsv une ligne par mot. L'empreinte ne couvre rien que Merge écrive : relancée, elle
     récrit le même fichier. Les lignes imprimées sont en anglais, comme celles du kit. */
  const fs = require('fs'), path = require('path');
  const kaikki = require('../kaikki');
  const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
  const { oneLine, sig } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));

  /* Les 22 unités (phase 4, D10, approuvées les 28 et 31 octobre 2026), dans l'ordre du cours. target
     est le nombre de places, pas un compte ; samples, les mots du mainteneur, qui prennent les
     premières places. */
  const UNITS = [
    { id: 'vragen', n: 13, nlName: 'Vragen', name: { fr: 'Questions et petits mots', en: 'Questions and small words' }, track: 'beide', icon: '❓', target: 30,
      blurb: { fr: 'Les mots qui posent une question, et ceux qui lient deux idées : parce que, mais, quand.', en: 'The words that ask a question, and those that join two ideas: because, but, when.' },
      samples: ['wie', 'waarom', 'wanneer', 'welke', 'maar', 'want', 'omdat', 'als', 'toen', 'nu'] },
    { id: 'kunnen', n: 14, nlName: 'Kunnen, moeten, willen', name: { fr: 'Pouvoir, devoir, vouloir', en: 'Can, must, want' }, track: 'beide', icon: '🗝️', target: 25,
      blurb: { fr: 'Pouvoir, devoir, vouloir : les verbes qui changent le sens de tous les autres.', en: 'Can, must, want: the verbs that change the meaning of every other verb.' },
      samples: ['kunnen', 'moeten', 'willen', 'mogen', 'zullen', 'laten', 'weten', 'kennen', 'denken', 'hopen', 'geloven'] },
    { id: 'doen', n: 15, nlName: 'Doen en maken', name: { fr: 'Les verbes de tous les jours', en: 'Everyday verbs' }, track: 'beide', icon: '🔧', target: 30,
      blurb: { fr: 'Faire, prendre, donner, attendre : les verbes de chaque journée, au présent.', en: 'Doing, taking, giving, waiting: the verbs of every single day, in the present tense.' },
      samples: ['doen', 'maken', 'nemen', 'geven', 'krijgen', 'brengen', 'halen', 'zitten', 'staan', 'liggen', 'lopen', 'wachten', 'beginnen', 'stoppen', 'vragen', 'antwoorden', 'schrijven', 'gebruiken'] },
    { id: 'mensen', n: 16, nlName: 'Mensen', name: { fr: 'Les gens et les pronoms', en: 'People and pronouns' }, track: 'leven', icon: '👥', target: 30,
      blurb: { fr: 'Lui, elle, quelqu’un, personne, et la famille au-delà des parents.', en: 'Him, her, someone, no one, and the family beyond your parents.' },
      samples: ['hem', 'haar', 'zich', 'iemand', 'iets', 'niets', 'elkaar', 'zelf', 'de vader', 'de moeder', 'de jongen', 'het meisje', 'de oom', 'de tante'] },
    { id: 'hoeveel', n: 17, nlName: 'Hoeveel en hoe vaak', name: { fr: 'Combien, à quelle fréquence', en: 'How much, how often' }, track: 'beide', icon: '📊', target: 30,
      blurb: { fr: 'Plus, souvent, presque, trop : doser ce que tu dis.', en: 'More, often, almost, too much: how to measure what you say.' },
      samples: ['meer', 'erg', 'echt', 'vaak', 'ooit', 'steeds', 'bijna', 'toch', 'dus', 'weinig', 'alle'] },
    { id: 'waar', n: 18, nlName: 'Waar en waarmee', name: { fr: 'Où et avec quoi', en: 'Where and with what' }, track: 'beide', icon: '📍', target: 20,
      blurb: { fr: 'Les petits mots de lieu et de moyen : dans, sur, avec, sans, entre.', en: 'The small words of place and means: in, on, with, without, between.' },
      samples: ['in', 'op', 'met', 'van', 'uit', 'over', 'door', 'zonder', 'onder', 'achter', 'tussen', 'naast', 'voor', 'na'] },
    { id: 'landen', n: 19, nlName: 'Landen en talen', name: { fr: 'Pays et langues', en: 'Countries and languages' }, track: 'leven', icon: '🌍', target: 25,
      blurb: { fr: 'Les pays voisins, les langues qu’on y parle, et les mots pour parler des mots.', en: 'The neighbouring countries, the languages spoken there, and the words for talking about words.' },
      samples: ['het land', 'de taal', 'België', 'Nederland', 'Frankrijk', 'Duitsland', 'het woord', 'de zin', 'de vraag', 'het antwoord', 'het woordenboek'] },
    { id: 'eten', n: 20, nlName: 'Eten en drinken', name: { fr: 'Manger et boire', en: 'Food and drink' }, track: 'leven', icon: '🥗', target: 35,
      blurb: { fr: 'Ce qu’il y a dans ton frigo et sur ta table, du petit-déjeuner au souper.', en: 'What is in your fridge and on your table, from breakfast to supper.' },
      samples: ['de groenten', 'het fruit', 'het vlees', 'de vis', 'de melk', 'de eieren', 'de appel', 'de thee', 'de wijn', 'het bier', 'de suiker', 'het zout', 'de soep', 'de rijst'] },
    { id: 'cafe', n: 21, nlName: 'Op café', name: { fr: 'Au café et au restaurant', en: 'At the café and restaurant' }, track: 'leven', icon: '☕', target: 20,
      blurb: { fr: 'Commander, demander l’addition et laisser un pourboire, en terrasse comme à table.', en: 'Ordering, asking for the bill and leaving a tip, on the terrace and at the table.' },
      samples: ['de ober', 'bestellen', 'de rekening', 'het dessert', 'vegetarisch', 'het menu', 'de fooi'] },
    { id: 'kleren', n: 22, nlName: 'Kleren en kleuren', name: { fr: 'Vêtements et couleurs', en: 'Clothes and colours' }, track: 'leven', icon: '👕', target: 30,
      blurb: { fr: 'Ce que tu portes, de quelle couleur, et ce que tu cherches dans le magasin.', en: 'What you wear, in which colour, and what you are looking for in the shop.' },
      samples: ['de schoenen', 'de broek', 'de jas', 'de trui', 'het hemd', 'rood', 'blauw', 'groen', 'zwart', 'geel', 'dragen'] },
    { id: 'wonen', n: 23, nlName: 'Het huis inrichten', name: { fr: 'Aménager la maison', en: 'Furnishing the house' }, track: 'leven', icon: '🛋️', target: 30,
      blurb: { fr: 'La table, le lit, l’armoire, le fauteuil, et le ménage du samedi.', en: 'The table, the bed, the wardrobe, the sofa, and the Saturday cleaning.' },
      samples: ['de tafel', 'de stoel', 'het bed', 'de kast', 'het raam', 'de lamp', 'de zetel', 'de frigo', 'poetsen', 'opruimen'] },
    { id: 'kalender', n: 24, nlName: 'De kalender', name: { fr: 'Le calendrier', en: 'The calendar' }, track: 'beide', icon: '📅', target: 35,
      blurb: { fr: 'Les mois, les saisons, les fêtes, et la date de ton anniversaire.', en: 'The months, the seasons, the holidays, and the date of your birthday.' },
      samples: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december', 'de zomer', 'de winter', 'de lente', 'de herfst', 'de verjaardag', 'Kerstmis', 'Nieuwjaar', 'Pasen', 'eerste', 'tweede'] },
    { id: 'stad', n: 25, nlName: 'De stad en haar diensten', name: { fr: 'La ville et ses services', en: 'The town and its services' }, track: 'leven', icon: '🏛️', target: 30,
      blurb: { fr: 'La poste, la banque, la bibliothèque, la police : où aller en ville, et comment y arriver.', en: 'The post office, the bank, the library, the police: where to go in town, and how to get there.' },
      samples: ['de post', 'de bank', 'de bibliotheek', 'de politie', 'het plein', 'de markt', 'het museum', 'oversteken', 'de hoek'] },
    { id: 'vrijetijd', n: 26, nlName: 'Vrije tijd', name: { fr: 'Les loisirs', en: 'Free time' }, track: 'leven', icon: '🎵', target: 30,
      blurb: { fr: 'Ce que tu fais le soir et le week-end : lire, nager, danser, écouter de la musique.', en: 'What you do in the evening and at the weekend: reading, swimming, dancing, listening to music.' },
      samples: ['de muziek', 'de film', 'het boek', 'lezen', 'zwemmen', 'spelen', 'dansen', 'zingen', 'de sport', 'de hobby', 'het concert'] },
    { id: 'gevoel', n: 27, nlName: 'Gevoelens en meningen', name: { fr: 'Sentiments et avis', en: 'Feelings and opinions' }, track: 'beide', icon: '💬', target: 30,
      blurb: { fr: 'Content, fâché, inquiet, fier, et dire ce que tu trouves beau, difficile ou important.', en: 'Happy, angry, worried, proud, and saying what you find beautiful, difficult or important.' },
      samples: ['blij', 'boos', 'bang', 'trots', 'gelukkig', 'triestig', 'leuk', 'mooi', 'interessant', 'moeilijk', 'gemakkelijk', 'belangrijk'] },
    { id: 'beschrijven', n: 28, nlName: 'Beschrijven', name: { fr: 'Décrire', en: 'Describing things' }, track: 'beide', icon: '🔍', target: 30,
      blurb: { fr: 'Grand, petit, lourd, vide, propre : décrire une chose en un mot.', en: 'Big, small, heavy, empty, clean: describing a thing in one word.' },
      samples: ['groot', 'klein', 'kort', 'snel', 'langzaam', 'zwaar', 'licht', 'vol', 'leeg', 'sterk', 'proper'] },
    { id: 'school', n: 29, nlName: 'School en kinderen', name: { fr: 'L’école et les enfants', en: 'School and children' }, track: 'leven', icon: '🎒', target: 25,
      blurb: { fr: 'L’école de tes enfants : la classe, l’instit, les devoirs, la garderie.', en: 'Your children’s school: the class, the teacher, the homework, the after-school care.' },
      samples: ['de juf', 'de meester', 'de klas', 'de les', 'het huiswerk', 'de opvang', 'de crèche', 'studeren'] },
    { id: 'afspraak', n: 30, nlName: 'Afspraken en de telefoon', name: { fr: 'Rendez-vous et téléphone', en: 'Appointments and the phone' }, track: 'beide', icon: '📱', target: 25,
      blurb: { fr: 'Appeler, envoyer un message, annuler ou déplacer un rendez-vous.', en: 'Calling, sending a message, cancelling or moving an appointment.' },
      samples: ['bellen', 'de gsm', 'het bericht', 'afzeggen', 'verplaatsen', 'de agenda', 'beschikbaar'] },
    { id: 'team', n: 31, nlName: 'Op het werk: het team', name: { fr: 'Au travail : l’équipe', en: 'At work: the team' }, track: 'werk', icon: '🤝', target: 25,
      blurb: { fr: 'Tes collègues chez {bedrijf} : la pause, le contrat, la formation, et ce qu’on te dit de ton travail.', en: 'Your colleagues at {bedrijf}: the break, the contract, the training, and what people tell you about your work.' },
      samples: ['het team', 'de feedback', 'de pauze', 'het contract', 'het loon', 'de opleiding'] },
    { id: 'reis', n: 32, nlName: 'Op reis', name: { fr: 'En voyage', en: 'Travel' }, track: 'leven', icon: '✈️', target: 30,
      blurb: { fr: 'La valise, l’aéroport, l’hôtel, et la mer du Nord à une heure de train.', en: 'The suitcase, the airport, the hotel, and the North Sea an hour away by train.' },
      samples: ['de reis', 'het hotel', 'de koffer', 'het vliegtuig', 'de luchthaven', 'het paspoort', 'de zee', 'de kust', 'reserveren'] },
    { id: 'natuur', n: 33, nlName: 'Natuur en dieren', name: { fr: 'La nature et les animaux', en: 'Nature and animals' }, track: 'leven', icon: '🌳', target: 25,
      blurb: { fr: 'Le chien, le chat, les oiseaux, les arbres et la forêt où tu te promènes.', en: 'The dog, the cat, the birds, the trees and the forest where you go walking.' },
      samples: ['de hond', 'de kat', 'het paard', 'de vogel', 'de boom', 'de bloem', 'het bos', 'de rivier'] },
    { id: 'spoed', n: 34, nlName: 'Gezondheid en noodgevallen', name: { fr: 'Santé et urgences', en: 'Health and emergencies' }, track: 'leven', icon: '🚑', target: 15,
      blurb: { fr: 'Les mots qu’on espère ne jamais dire, aux urgences ou au téléphone avec le 112.', en: 'The words you hope never to say, at the emergency room or on the phone with 112.' },
      samples: ['de spoed', 'de ambulance', 'de brandweer', 'het ongeval', 'gebroken', 'de verpleger'] }
  ];
  const OWN = new Set(UNITS.map(u => u.id));
  const POS = ['noun', 'name', 'verb', 'adj', 'adv', 'pron', 'prep', 'conj', 'num', 'other'];
  const EVIDENCE = /^(wiktionary:\S(.*\S)?|course)$/;
  const LEXICON = path.join('src', 'content', 'lexicon.a1c.js');
  const IDS = path.join('test', 'data', 'ids.tsv');

  /* La source d'une place : son unité, telle que UNITS l'écrit, dont nl est l'id, et fr et en ses noms
     (l'outil de lecture les montre ; l'empreinte ne les lit pas). L'unité n'est pas encore dans le cours
     quand Split coupe ; elle y est après Merge, et l'empreinte ne change pas. */
  const unitOf = id => UNITS.find(u => u.id === id.split(':')[0]);
  const sourceOf = (C, id) => {
    const u = unitOf(id);
    return u ? Object.assign({}, u, { nl: u.id, fr: u.name.fr, en: u.name.en }) : undefined;
  };

  /* Split : un lot par unité de UNITS que le cours n'a pas encore, une ligne par place. Après Merge,
     les unités fondues sont dans le cours : un second Split ne coupe rien pour elles. */
  function split(C) {
    const have = new Set(C.units.map(u => u.id));
    return UNITS.filter(u => !have.has(u.id)).map(u => ({
      batch: u.id,
      rows: Array.from({ length: u.target }, (x, k) => ({
        id: u.id + ':s' + String(k).padStart(2, '0'), unit: u.id, n: u.n, nlName: u.nlName, name: u.name, target: u.target, slot: k, sample: u.samples[k] || null
      }))
    }));
  }

  /* Le cours, son orthographe, la table de / het et l'extrait du Wiktionnaire, lus une fois par
     lecture d'un lot. Les éléments des unités de UNITS ne comptent pas comme « déjà dans le cours » :
     après Merge, ce sont les lignes elles-mêmes. */
  const memo = new WeakMap();
  function tools(ctx) {
    if (!memo.has(ctx)) {
      const C = ctx.course(), NL = C.NL, U = NL.util;
      const dehet = new Map();
      fs.readFileSync(path.join(ctx.repo, 'test', 'data', 'dehet.tsv'), 'utf8').split('\n').forEach(l => {
        if (!l || l[0] === '#') return;
        const [w, g] = l.split('\t');
        if (w && g) dehet.set(w, g.trim());
      });
      const others = C.sources.filter(s => !OWN.has(s.unit));
      const keyOf = s => (s.kind === 'word' ? U.norm(U.bare(s.nl)) : U.norm(s.nl));
      let senses = null;
      memo.set(ctx, {
        C, NL, dehet,
        S: spelling.open(ctx.repo, NL),
        /* L'élément du cours, hors des unités de UNITS, dont le néerlandais sans article est celui-là. */
        itemOf: nl => others.find(s => keyOf(s) === U.norm(U.bare(nl))) || null,
        senses: () => {
          if (!senses) {
            try { senses = { map: kaikki.senses(ctx.repo) }; } catch (e) { senses = { error: e.message }; }
          }
          return senses;
        }
      });
    }
    return memo.get(ctx);
  }

  const list = ws => ws.map(w => '« ' + w + ' »').join(', ');
  /* Un nom et un nom propre se valent dans l'extrait (België est un « name », januari un « noun »). */
  const agrees = (want, got) => want === 'other' || want === got || ((want === 'noun' || want === 'name') && (got === 'noun' || got === 'name'));

  function check(row, input, ctx) {
    const why = [];
    ['nl', 'fr', 'en'].forEach(f => { if (!oneLine(row[f])) why.push(f + ' is a text on one line with no space at either end'); });
    if (row.art !== null && row.art !== 'de' && row.art !== 'het') why.push('art is de, het or null');
    if (POS.indexOf(row.pos) < 0) why.push('pos is one of ' + POS.join(', '));
    if (typeof row.evidence !== 'string' || !EVIDENCE.test(row.evidence)) why.push('evidence is wiktionary:<lemma> or course');
    if (why.length) return why;
    const T = tools(ctx), U = T.NL.util, G = T.NL.gloss;
    const bare = U.bare(row.nl), key = U.norm(bare);

    /* Le français et le néerlandais du cours écrivent l'apostrophe typographique, et aucun guillemet droit. */
    ['nl', 'fr'].forEach(f => { if (/['"]/.test(row[f])) why.push(f + ' writes the typographic apostrophe « ’ » and no straight quote'); });

    const bad = U.uniq(spelling.tokens(row.nl).filter(t => !T.S.known(t)));
    if (bad.length) why.push(list(bad) + ' is not Dutch that OpenTaal or flemish.tsv knows: pick another word, or say in unsure why the course needs this one');

    /* Un nom porte son article, que test/data/dehet.tsv confirme (both : le cours tranche) ; tout
       autre mot n'en porte pas. Un nom que la table ignore ferait échouer test/dehet.js après Merge. */
    const m = /^(de|het|een)\s+(\S.*)$/i.exec(row.nl);
    if (row.pos === 'noun') {
      if (row.art === null) why.push('a noun carries its article: art is de or het');
      else if (!m || m[1].toLowerCase() !== row.art) why.push('nl starts with its article « ' + row.art + ' »');
      else if (bare.indexOf(' ') < 0) {
        const g = T.dehet.get(bare.toLowerCase());
        if (g === undefined) why.push('« ' + bare + ' » is not in test/data/dehet.tsv, so test/dehet.js would refuse it after Merge: pick another word, or say in unsure why the course needs this one');
        else if (g !== 'both' && g !== row.art) why.push('« ' + row.art + ' ' + bare + ' »: test/data/dehet.tsv says « ' + g + ' »');
      }
    } else {
      if (row.art !== null) why.push('art is null for a word that is not a noun');
      if (m) why.push('a word that is not a noun carries no article: nl is « ' + m[2] + ' »');
    }

    /* Un mot nouveau ne redit pas le néerlandais d'un élément du cours (contrainte du plan), et une
       place qui a son mot-témoin l'écrit, sauf si le cours a déjà ce mot (le rédacteur le dit dans unsure). */
    const had = T.itemOf(row.nl);
    if (had) why.push('« ' + row.nl + ' » is already an item of the course, ' + had.id + ' « ' + had.nl + ' »: a new word never repeats an existing item\'s Dutch');
    if (input.sample && !T.itemOf(input.sample) && U.norm(U.bare(input.sample)) !== key) why.push('this slot writes the sample « ' + input.sample + ' », not « ' + row.nl + ' »');

    /* La preuve : un lemme de l'extrait, de la même nature, que nl emploie ; ou course. */
    if (row.evidence !== 'course') {
      const lemma = row.evidence.slice('wiktionary:'.length), E = T.senses();
      if (E.error) why.push(E.error);
      else if (!E.map.has(lemma)) why.push('« ' + lemma + ' » is not an entry of the pinned Wiktionary extract (.cache/kaikki/senses.tsv): cite the lemma as the extract spells it, or evidence course');
      else {
        const got = E.map.get(lemma).map(e => e.pos);
        if (!got.some(p => agrees(row.pos, p))) why.push('« ' + lemma + ' » is ' + list(U.uniq(got)) + ' in the extract, not ' + row.pos);
        if (!spelling.tokens(bare).some(t => t.indexOf(lemma.toLowerCase()) === 0)) why.push('nl does not use the lemma « ' + lemma + ' »');
      }
    }

    /* Les gardes de test/content.js sur l'anglais, dites ici plutôt qu'après Merge. */
    const item = { kind: 'word', nl: row.nl, fr: row.fr, en: row.en, art: row.art };
    if ((row.pos === 'verb' || G.wordClass(item, 'fr') === 'verb') && !/^to\s+\S/i.test(row.en)) why.push('a verb\'s en starts with « to »');
    if (row.art && /^(the|an|a)\s/i.test(row.en)) why.push('a noun\'s en takes no article');
    if (sig(row.fr) !== sig(row.en)) why.push('fr and en hold different digits or {…} tokens');
    T.C.sources.filter(s => s.id !== row.id && G.sameMeaning(item, s) && !G.sameSense(item, s)).forEach(s => {
      why.push('en shares a sense with ' + s.id + ' « ' + s.nl + ' » (' + s.en + '), which shares no French sense and no Dutch: give one of them another English, or the French they share');
    });
    return why;
  }

  /* Le texte du lexique : l'en-tête, puis chaque unité de UNITS qui a des mots pris, dans l'ordre, ses
     mots dans l'ordre des places. Les chaînes s'écrivent entre apostrophes droites, échappées ; l'icône
     en séquence \u{…}, comme les lexiques écrits à la main. */
  const lit = s => '\'' + String(s).replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\'';
  const pair = g => '{ fr: ' + lit(g.fr) + ', en: ' + lit(g.en) + ' }';
  const icon = s => '\'' + Array.from(s).map(c => '\\u{' + c.codePointAt(0).toString(16).toUpperCase() + '}').join('') + '\'';
  const HEADER = [
    '/* Lexique A1, unités 13 à 34. Même forme que lexicon.a1.js.',
    '   Écrit par la fusion du genre words (tools/content/kinds/words.js) depuis ses lignes prises : une',
    '   correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités n’ont que des mots ;',
    '   leurs phrases et leur grammaire viennent avec les plans 4b et 4c. */',
    'NL.content = NL.content || {};',
    'NL.content.units = NL.content.units || [];',
    '(function () {',
    '  \'use strict\';',
    '  const W = (nl, g, art) => ({ kind: \'word\', nl, ...NL.gloss.pair(g), art });',
    '  const U = o => NL.content.units.push(o);'
  ];
  function lexicon(units) {
    const lines = HEADER.slice();
    units.forEach(({ u, rows }) => {
      lines.push('', '  U({',
        '    id: ' + lit(u.id) + ', n: ' + u.n + ', name: ' + pair(u.name) + ', nlName: ' + lit(u.nlName) + ', level: \'A1\', track: ' + lit(u.track) + ', icon: ' + icon(u.icon) + ',',
        '    blurb: ' + pair(u.blurb) + ',',
        '    grammar: [],',
        '    words: [');
      rows.forEach((r, k) => lines.push('      W(' + lit(r.nl) + ', ' + pair(r) + (r.art ? ', ' + lit(r.art) : '') + ')' + (k < rows.length - 1 ? ',' : '')));
      lines.push('    ],', '    phrases: []', '  });');
    });
    lines.push('})();');
    return lines;
  }

  /* Merge : refuse deux lignes prises qui écrivent le même mot (elle les nomme toutes : chaque lot n'a vu que
     les siennes), une qui redit un élément du cours (le cours a pu bouger depuis Split), et une qu'ids.tsv
     épingle à un autre mot, le tout avant d'écrire ;
     puis récrit le lexique entier, dans l'ordre des places, et ajoute à ids.tsv une ligne par mot
     nouveau. Le lexique peut déjà tenir ces unités (Merge relancée) : il est récrit à l'identique, et
     ids.tsv n'ajoute rien, ses lignes disant les mêmes mots. */
  function write(taken, ctx) {
    const T = tools(ctx), U = T.NL.util;
    const seen = new Map(), by = new Map(), twice = [];
    taken.forEach(x => {
      const k = U.norm(U.bare(x.row.nl)), had = T.itemOf(x.row.nl);
      if (had) throw new Error(x.id + ' « ' + x.row.nl + ' » is already an item of the course, ' + had.id + ': the course moved since Split');
      if (seen.has(k)) twice.push(x.id + ' and ' + seen.get(k) + ' both write « ' + x.row.nl + ' »');
      else seen.set(k, x.id);
      if (!by.has(x.input.unit)) by.set(x.input.unit, []);
      by.get(x.input.unit).push(x);
    });
    if (twice.length) throw new Error(twice.join('; ') + ': one word, one slot');
    T.C.units.filter(u => OWN.has(u.id) && !by.has(u.id)).forEach(u => {
      throw new Error('lexicon.a1c.js holds the unit ' + u.id + ', and no taken row writes it: Merge rewrites the file whole');
    });
    const units = UNITS.filter(u => by.has(u.id)).map(u => ({ u, rows: by.get(u.id).sort((a, b) => a.input.slot - b.input.slot).map(x => x.row) }));
    const ids = path.join(ctx.repo, IDS), text = fs.readFileSync(ids, 'utf8'), ieol = /\r\n/.test(text) ? '\r\n' : '\n';
    const pinned = new Map(text.split(/\r?\n/).filter(Boolean).map(l => l.split('\t')));
    const added = [];
    units.forEach(({ u, rows }) => rows.forEach((r, i) => {
      const id = u.id + ':w' + i;
      if (!pinned.has(id)) { added.push(id + '\t' + r.nl); return; }
      if (pinned.get(id) !== r.nl) throw new Error('test/data/ids.tsv pins ' + id + ' to « ' + pinned.get(id) + ' », and Merge writes « ' + r.nl + ' » there');
    }));

    const lex = path.join(ctx.repo, LEXICON), old = fs.readFileSync(lex, 'utf8'), eol = /\r\n/.test(old) ? '\r\n' : '\n';
    fs.writeFileSync(lex, lexicon(units).map(l => l + eol).join(''));
    if (added.length) fs.writeFileSync(ids, text + (text && !/\r?\n$/.test(text) ? ieol : '') + added.map(l => l + ieol).join(''));
    const n = units.reduce((s, x) => s + x.rows.length, 0);
    return ['ok lexicon.a1c.js ' + n + ' words in ' + units.length + ' units', 'ok ids.tsv ' + added.length + ' added'];
  }

  module.exports = {
    stamp: [u => u.n, u => u.name.en, u => u.target],
    fields: ['nl', 'fr', 'en', 'art', 'pos', 'evidence'],
    tables: [],
    sourceOf,
    split,
    check,
    forMaintainer: row => (row.evidence === 'course' ? 'evidence course' : ''),
    merge: () => ({}),
    write,
    UNITS,
    lexicon
  };
  ```
  Create `src/content/lexicon.a1c.js` with exactly these lines (what `write()` produces for no unit):
  ```js
  /* Lexique A1, unités 13 à 34. Même forme que lexicon.a1.js.
     Écrit par la fusion du genre words (tools/content/kinds/words.js) depuis ses lignes prises : une
     correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités n’ont que des mots ;
     leurs phrases et leur grammaire viennent avec les plans 4b et 4c. */
  NL.content = NL.content || {};
  NL.content.units = NL.content.units || [];
  (function () {
    'use strict';
    const W = (nl, g, art) => ({ kind: 'word', nl, ...NL.gloss.pair(g), art });
    const U = o => NL.content.units.push(o);
  })();
  ```
  In `build.sh`, replace
  ```
  src/content/lexicon.a1b.js
  src/content/be.js
  ```
  with
  ```
  src/content/lexicon.a1b.js
  src/content/lexicon.a1c.js
  src/content/be.js
  ```
  In `test/smoke.js`, replace
  ```js
      'src/core/audio.js', 'src/content/lexicon.a1.js', 'src/content/lexicon.a1b.js', 'src/content/be.js', 'src/content/notes.js',
  ```
  with
  ```js
      'src/core/audio.js', 'src/content/lexicon.a1.js', 'src/content/lexicon.a1b.js', 'src/content/lexicon.a1c.js', 'src/content/be.js', 'src/content/notes.js',
  ```
  In `test/content.js`, replace
  ```js
    const batches = { lexiqueA1: [], lexiqueA1b: [], exemples: [], grammaire: [], references: [], scenarios: [] };
  ```
  with
  ```js
    const batches = { lexiqueA1: [], lexiqueA1b: [], lexiqueA1c: [], exemples: [], grammaire: [], references: [], scenarios: [] };
    const lexique = n => (n <= 6 ? 'lexiqueA1' : n <= 12 ? 'lexiqueA1b' : 'lexiqueA1c');
  ```
  then replace
  ```js
      else batches[u.n <= 6 ? 'lexiqueA1' : 'lexiqueA1b'].push(r);
  ```
  with
  ```js
      else batches[lexique(u.n)].push(r);
  ```
  then replace
  ```js
    tabled.forEach(r => batches[unitOf.get(r.nl) <= 6 ? 'lexiqueA1' : 'lexiqueA1b'].push(r));
  ```
  with
  ```js
    tabled.forEach(r => batches[lexique(unitOf.get(r.nl))].push(r));
  ```
  In `TESTING.md`, in the `tools/fanout.js` row, replace
  ```
  et un Merge de bout en bout (`flemish`, `examples` et `examples-gen`, `open`, les deux genres d'explications) |
  ```
  with
  ```
  et un Merge de bout en bout (`flemish`, `examples` et `examples-gen`, `open`, les deux genres d'explications, et `words`, dont la source est une unité à venir : ses 22 unités et leurs places, ses règles, son Merge qui récrit `src/content/lexicon.a1c.js` et ajoute à `test/data/ids.tsv`, relancée à l'identique, et un second Split qui ne recoupe pas une unité fondue) |
  ```
  Then build:
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (<n> bytes), artifact.html (<m> bytes)`, both 594 bytes larger than
  before this step: the empty lexicon's `<script>`. The proof, without task 1's change to `src/core/srs.js`,
  printed 684364 and 683750; with tasks 1 to 3 applied (the whole chain) it printed 685284 and 684670.

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exit 0, no `FAIL`, among its lines
  ```
    words          22 unités, 605 places ; chaque règle, Merge de bout en bout, relancée, second Split
  ```
  and the last line `506 contrôles, KIT CONFORME`. Then
  ```
  node test/smoke.js .
  node test/content.js .
  ```
  Expected: `ALL CHECKS PASSED` and `2077 contrôles, CONTENU CONFORME` (the course is unchanged: the lexicon is
  empty).

- [ ] **Step 5: Commit.**
  ```
  git add tools/content/kinds/words.js src/content/lexicon.a1c.js build.sh index.html artifact.html test/smoke.js test/content.js TESTING.md test/tools/fanout.js
  git commit -m "feat(tools): the words kind cuts the 22 new units into slots, checks each word and writes lexicon.a1c.js and ids.tsv; an empty lexicon.a1c.js is built (#123)"
  ```

Done when:
- `node test/tools/fanout.js .` prints `506 contrôles, KIT CONFORME`; without `words.js` and the two lists' lines
  the same file printed the two lists' `FAIL` lines and crashed on the missing module.
- `node tools/content/split.js . "<WS>/drafts/words"` (not run here) would print 22 lines, `vragen 30` to
  `spoed 15`, 605 rows in all.
- `src/content/lexicon.a1c.js` exists, empty of units, is in `build.sh`'s `SRC` and `test/smoke.js`'s list, and
  `index.html` and `artifact.html` are rebuilt and committed; `node test/smoke.js .` and `node test/content.js .`
  are green.
- `TESTING.md`'s `tools/fanout.js` row names the kind.

### Task 5: FAN words
Class: fan-out
Ticket: #123
Kind: words
Drafting after: 2, 3, 4
Split: node tools/content/split.js . "<WS>/drafts/words"
Check: node tools/content/check.js "<WS>/drafts/words/<batch>"
Merged by: task 6
Why: D9 (one tranche finishing A1, about 400–600 new words in new units) and D12 (meanings from the pinned
Wiktionary extract, read by two readers). The course has 12 units and 430 items; the 22 units approved on
2026-10-28 and 31 (task 4's `UNITS`) hold 605 slots, targets not counts. Split cuts one batch per unit, named
by the unit's id, one row per slot: `vragen 30`, `kunnen 25`, `doen 30`, `mensen 30`, `hoeveel 30`, `waar 20`,
`landen 25`, `eten 35`, `cafe 20`, `kleren 30`, `wonen 30`, `kalender 35`, `stad 30`, `vrijetijd 30`, `gevoel 30`,
`beschrijven 30`, `school 25`, `afspraak 25`, `team 25`, `reis 30`, `natuur 25`, `spoed 15`. A slot's row says
its unit (id, number, Dutch name, French and English names, target), its slot number and its `sample`: the
maintainer's word for that slot, or null. The drafter fills every slot with one word. Check (task 4) verifies
spelling, articles, the sample, the evidence and the English guards; what no script can check is under Reader
focus. Before the first Check, the run has copied the pinned file and written both extracts in the worktree
(« Set-up decisions », « The kaikki extract »): without
`.cache/kaikki/senses.tsv`, Check prints `.cache/kaikki/senses.tsv is missing: run node tools/content/kaikki.js .`
on every row whose evidence is `wiktionary:…` (a row with `evidence: course` never reads the extract). All 240 samples passed Check against the real extract with
stand-in meanings; « triestig » alone is not in it, so its row is `evidence: course` and goes to a ruling. Tasks 1 and
1b run beside the drafting and touch no content; no task between this one and task 6 changes `UNITS`, which the
stamp covers (a unit's number, English name and target).

**A word written in two batches.** Check reads one row at a time, so two batches can each keep the same word, and
it surfaces only at Merge: task 6's Merge names every such pair in one line, `fail words -: <id> and <id> both write
« <word> »; …: one word, one slot`, and writes nothing. A maintainer's `drop` in `rulings.json` cannot settle a row
a reader kept: `rulings.json` holds only rows of `disputes.md`, Check refuses a section for such a row (`fail
disputes.md <id>: a section for a row that is not for the maintainer`), and `settle` takes a reader's `keep` first.
So the row goes back through its batch's own steps. For each pair, the later slot is redrafted (the later unit's,
unless it holds a `sample` and the earlier does not: the samples are all different, so both cannot): the run
controller changes that row's verdict in its batch's `review.json` from `keep` to `dispute: « <word> » is also
<other id>: write another word of the theme` and dispatches the batch's controller, which walks on from the retry
and the second reader (`batch-controller.md`, steps 4 and 5). A row already kept by a second reader is disputed in
`retry-review.json` instead, and so goes to the maintainer (step 6), whose ruling settles it. A row the maintainer
ruled `keep` has its ruling replaced by a `drop`: the latest ruling holds. Then task 6 runs Merge again.

#### Format

```json
{"id": "wonen:s00", "stamp": "8803d93e", "nl": "de tafel", "fr": "la table", "en": "table", "art": "de", "pos": "noun", "evidence": "wiktionary:tafel"}
```

- One row per input row, in its order. Copy `id` and `stamp` unchanged, then give `nl`, `fr`, `en`, `art`,
  `pos` and `evidence`, and no other field except `unsure`.
- Every slot gets a word. A slot with a `sample` gets that word: it is the maintainer's. If the course already
  has the sample (Check says `already an item of the course`), write another word of the theme there and say so
  in `unsure`. The other slots are yours: the words of the unit's theme (its `name`) that a French speaker needs
  first in Flanders, at A1, worth thirty reviews each.
- `nl` is the word as the course writes it: a noun with its article (« de tafel », « het bed »), a verb in the
  infinitive (« poetsen »), an adjective or adverb bare (« proper »), a plural noun when the plural is what is
  said (« de groenten »).
- `nl` is the word a Flemish colleague uses at work today: « de frigo », not « de koelkast »; « de gsm »;
  « plezant »; « proper » for clean; « de zetel » for the sofa. The northern word is not wrong, but it is not
  this course's first word.
- `nl` is spelled as OpenTaal or `test/data/flemish.tsv` spells it. Check refuses a form neither knows: pick
  another word, or say in `unsure` why the course needs this one (the maintainer can keep it only through the
  flemish kind, later).
- `nl` never repeats an item the course already has, with or without its article, in any of the 12 first units
  or in another slot. Check refuses the first; Merge refuses the second: a word in two slots of one unit or of
  two units is one word too many. Within your batch, write each word once. Check does not see other batches, so
  before you finish, read what they have drafted so far and write none of it:
  `grep -ho '"nl": *"[^"]*"' "<batch>"/../*/draft.json`.
- `art` is `"de"` or `"het"` for a noun, exactly the article `nl` starts with, and `null` for every other word.
  Check holds it to `test/data/dehet.tsv`; where the table says both, the article you write is the course's.
  A noun the table does not know is refused: pick another word.
- `pos` is one of `noun`, `name`, `verb`, `adj`, `adv`, `pron`, `prep`, `conj`, `num`, `other`. `name` is a
  noun that takes no article (« België », « Pasen », « januari », « Kerstmis »): `art` null, `nl` bare.
- `fr` is the meaning in Belgian French (septante, nonante, le GSM, la farde), one line, with the French article
  for a noun (« la table »). `en` is plain English, one line, without an article for a noun (« table ») and
  with « to » for a verb (« to clean »). Several senses are separated by « / », in both languages, the common
  sense first. `fr` and `en` hold the same digits.
- `en` never repeats a sense an item of the course already has unless that item also shares a French sense or
  the same Dutch (Check names the item): two different words with one English gloss would be one answer to the
  same question. Give the sense the course has not got, or add the French it shares.
- `evidence` is `wiktionary:<lemma>`: a lemma of `.cache/kaikki/senses.tsv`, spelled as the extract spells it
  (one entry per line: the lemma, its part of speech, its gender, its glosses; look one up with
  `grep -P '^<lemma>\t' .cache/kaikki/senses.tsv`), whose part of speech is `pos` (`noun` and `name` count as one;
  `pos: other` accepts any part of speech in the extract), and such that some word of `nl` begins with the lemma
  (« de groenten » cites `groente`; « de schoenen », `schoen`). The lemma is where the meaning comes from (D12);
  the gloss you write is the course's, not the extract's.
- `evidence` is `course` for a word the extract has not got and a Flemish colleague says. The row goes to the
  maintainer by rule, with no retry: its reader gives `for maintainer: <reason>`, whatever they find.
- Write the typographic apostrophe, « ’ », in `fr` and in `nl` (« ’s avonds »), and no straight double quote: Check
  refuses `'` and `"` in both.
- A row you doubt carries `"unsure": "<why, in one line>"`. Check still checks it, and the reader reads it first.
- A verdict carries `id` and `verdict`, and no other field.

#### Reader focus

- Is `nl` the word a Flemish colleague uses, at work, today? Dispute the northern word where Flanders says
  another (« koelkast » for « frigo », « mobieltje » for « gsm »), and a dialect word of one region passed off as
  Flemish. Do not dispute a word both regions say (« leuk » beside « plezant »).
- Is the gloss the common sense of the word, the one a learner meets first? A rare sense, or a sense that is
  only right in one phrase, is disputed.
- Does the gloss match a sense of the lemma the row cites? Read the extract's line,
  `grep -P '^<lemma>\t' .cache/kaikki/senses.tsv`, and quote it in a dispute. Check tests only that the lemma exists,
  has the part of speech and starts a word of `nl`.
- Is the article right where `test/data/dehet.tsv` says both? The table lets either pass; you decide what
  Flanders says.
- Is it really A1, and worth thirty reviews? Dispute a word a learner at A1 will not meet (a technical term, a
  literary word) and a word that is a form of another word of the course (its plural, its diminutive) rather
  than a word.
- Register: a word of the `u` register in a slot where the theme speaks `je`, or a word that is only polite or
  only rude; a verb glossed in one register and used in another.
- Is the English natural (« to be allowed to » for « mogen », not « may »), and the French Belgian (« septante »,
  « la farde », « le GSM »)? Dispute a word-for-word gloss.
- Does the slot's word fit the theme? A good word in the wrong unit is a dispute: the unit's name says what it
  teaches.
- `evidence: course` rows go to the maintainer: your reason says what you found, who says the word and where.
- `unsure` rows first.

### Task 6: Merge words
Class: mechanical
Ticket: #123
Merges: words
Promises: none
Why: D9 (one tranche finishing A1). Task 5's drafters, its readers and the maintainer have settled every row of
the kind `words`, and this task carries the rows into `src/`: `tools/content/merge.js` runs task 4's kind,
whose `write` rewrites `src/content/lexicon.a1c.js` whole from `UNITS` and the taken rows, one unit per
batch with at least one taken row, its words in slot order (a dropped slot leaves no gap), and appends one
`<unit>:w<i>\t<nl>` line per word to `test/data/ids.tsv`. The kind writes no table. Its stamp covers nothing
Merge writes, so a second run of Merge rewrites the same file byte for byte and prints `ok ids.tsv 0 added`:
unlike the other kinds, running it twice is harmless. The merged units reach the learner as new items (words
only: plans 4b and 4c bring their phrases, grammar and conversations), so `test/pace.js` and `test/journey.js`
move; this task reports their numbers and changes no threshold. The frontier reaches the new units too: step 5
reports it on a seeded state (Review Focus 5). Two things change in the tests, each named here. **The
explanations check.** `test/content.js` demands since phase 3's task 43 that every item has its explanation in
both languages; the new words have none until task 7 drafts them and task 8 merges them. A verifier runs the
whole suite on every task's commit, so no task may leave it red (call 6): this task pins the count of unexplained
items to the number of words merged, `UNEXPLAINED_BUDGET`, both ways in the idiom of `AHEAD_BUDGET`, and task 8
sets the demand back to 0. **The budget of sentences that borrow ahead** (`AHEAD_BUDGET`, `test/content.js:201`,
pinned at 61 both ways): an example sentence of an earlier unit that already used one of the new words becomes
« ahead » the moment the word is taught (« Wanneer komt de trein aan? », `onderweg:w14`, borrows « wanneer » from
`vragen` the moment `vragen` teaches it). **Call for the maintainer, written in the plan:** the task sets
`AHEAD_BUDGET` to the measured count, with a comment naming the cause, and lists the sentences in its return;
plan 4c, which writes the new units' sentences, may lower it. `test/lang.js`'s three guards (`QUOTE_OK`,
`SHARED_OK`, `QUOTE_BUDGET`) may move as task 30 of the phase 3 plan says, since the new words and the 22 blurbs
enter `dutchWords`; each fix is in `test/lang.js` and nowhere else.

Files:
- Modify (Merge writes them): `src/content/lexicon.a1c.js`, `test/data/ids.tsv`
- Modify (the build writes them): `index.html`, `artifact.html`
- Modify: `test/content.js` (the « explications » block, lines 151–157)
- Modify, only if step 4 says so: `test/content.js` (`AHEAD_BUDGET`, line 201)
- Modify: `test/lang.js` (the walk of the sessions, line 118; only if step 6 says so, `QUOTE_OK`, line 906; `SHARED_OK`,
  line 925; `QUOTE_BUDGET`)
- Modify: `test/tools/fanout.js` (« une réponse de trois lettres », lines 1390–1391)
- Create, outside the repository: `<WS>/tmp/ahead.js`, `<WS>/tmp/frontier.js`
- Test: `node test/content.js .`, then the whole suite, `sh test/run-all.sh`

Lines are as of `2a86861`; tasks 1 and 4 move none of these lines.

Notes:
- Comments and messages in `test/content.js` and `test/lang.js` are French, as around them.
- **Run Merge as often as you like.** The stamp hashes the unit's number, English name and target (`UNITS`),
  which Merge does not write. A second run prints the same first two lines and `ok ids.tsv 0 added`, and the
  lexicon is unchanged byte for byte (the proof checked with `cmp`). To start over anyway, run
  `git checkout -- src/content/lexicon.a1c.js test/data/ids.tsv`.
- **No row may be left unsettled.** Merge refuses, listing them, rows with no verdict chain and writes nothing.
  A row the maintainer ruled `drop` leaves its slot empty: the unit has one word fewer, and the words after it
  take its number (`<unit>:w<i>` counts taken slots, not slots).
- **The counts at this point in the run.** Split cut 605 rows in 22 batches (task 5's list). Taken and dropped
  rows add up to 605; the words merged are the taken rows, and `ok lexicon.a1c.js <n> words in <u> units` says
  how many, `<u>` 22 unless a whole unit was dropped.
- **`UNEXPLAINED_BUDGET` is `<taken>`**, the number Merge's second line prints. Task 8's step 1 expects
  `(budget <taken>)` on the `explications` line and its step 2 replaces the whole block, from its first line to its
  last, so keep those two lines as written here.
- **The budget of sentences will rise in the run.** The proof's four words do not move it, but a scan of the
  maintainer's sample words found 32 of them already used by earlier sentences, so expect step 4's second case.
- **The frontier report is a scratch script, not a suite.** It prints what `NL.content.courseProgress()` and the
  « Parcours » cards say on a seeded state; `test/engine.js`, « LE SEUIL » (lines 297–317 of `2a86861`), holds the rule itself and is not touched. The
  first state's `reached` moves from 11 to 12: that is `frontier()`'s ratchet (`src/content/index.js:149-151`),
  the same as at any gate crossed, written by the first read; no item's record moves and no key is added. A locked
  card shows `S’ouvre quand l’unité <n> aura été vue…`; the countdown `Encore <k> éléments…` is on an open card only
  (`src/ui/home.js:118`). The second state says what the frontier needs: every unit before it at its gate, so a
  stored `reached` of 11 with only unit 12's items met stays on unit 12, and writes nothing.
- **The proof.** These steps ran on a copy of `2a86861` with tasks 2, 3 and 4 applied (tasks 1 and 1b not: they
  change no number below but the build's sizes and pace's sessions) and 4 hand rows merged, drafted and kept in two
  batches cut by naming their slots (`vragen:s00` « wie », `vragen:s10` « toch », `wonen:s00` « de tafel »,
  `wonen:s10` « de douche »), under a hand `senses.tsv` of four entries. The real rows come from the fan-out, so
  your numbers differ. What moved:
  - Merge: `ok words 4 taken, 0 dropped`, `ok lexicon.a1c.js 4 words in 2 units`, `ok ids.tsv 4 added`; run
    again: the same two lines and `ok ids.tsv 0 added`, the lexicon identical;
  - the build: 684364 → 685423 bytes for `index.html`, 683750 → 684809 for `artifact.html`;
  - `test/content.js`: `CONTENU — 430 éléments` → `434`; `2077 contrôles` → `2084 contrôles, CONTENU CONFORME`;
    `explications    4 / 434 élément(s) sans explication dans les deux langues (budget 4)`;
    `ids 439 / 439 à leur place` → `443 / 443`; `séquence 61 / 557 phrases empruntent en avant (budget 61)`
    unchanged. With the budget at 3, one `FAIL` line, `4 élément(s) sans explication en français et en anglais,
    budget 3 : vragen:w0, …`; at 5, one, `seulement 4 élément(s) sans explication : baisser UNEXPLAINED_BUDGET à 4
    pour verrouiller le gain`;
  - in a second copy, three rows with « wanneer » in `vragen:s02`: one `FAIL` line, `62 phrases d’exemple empruntent
    du vocabulaire à une unité ultérieure, budget 61 — baisser le budget quand on en corrige, jamais le lever`; with
    `AHEAD_BUDGET` at 62, `62 / 557 … (budget 62)` and `CONTENU CONFORME`; `ahead.js`'s diff added
    `onderweg:w14  Wanneer komt de trein aan?  → wanneer (vragen)`;
  - the frontier report, on the 14 units of the copy:
    ```
    1. Les trois quarts de chacune des 12 premières unités rencontrés, reached 11
      avant : reached 11, 326 enregistrements, 14 unités
      courseProgress : current vragen (unité 13), 326 rencontrés sur 434
      unité 12 weekend : ouverte, 24/32 ; (aucune phrase)
      unité 13 vragen : ouverte, actuelle, 0/2 ; Encore 2 éléments à rencontrer avant l’unité suivante.
      unité 23 wonen : fermée, 0/2 ; S’ouvre quand l’unité 22 aura été vue en grande partie.
      après : reached 12 ; enregistrements identiques ; méta changées : reached 11 → 12, progress {"reached":11,"scenariosDone":[],"listenDone":[]} → {"reached":12,"scenariosDone":[],"listenDone":[]}
    2. Les trois quarts de la seule unité 12 rencontrés, reached 11
      avant : reached 11, 24 enregistrements, 14 unités
      courseProgress : current weekend (unité 12), 24 rencontrés sur 434
      unité 12 weekend : ouverte, actuelle, 24/32 ; (aucune phrase)
      unité 13 vragen : fermée, 0/2 ; S’ouvre quand l’unité 12 aura été vue en grande partie.
      unité 23 wonen : fermée, 0/2 ; S’ouvre quand l’unité 22 aura été vue en grande partie.
      après : reached 11 ; enregistrements identiques ; méta changées : aucune
    FRONTIÈRE CONFORME
    ```
  - `test/lang.js`: `néerlandais nu 793` → `795 champs lus en deux langues, 12 exceptions`; `guillemets 0 … 15
    exceptions` both times; `23173` → `23185 contrôles, LANGUE CONFORME`; no guard moved;
  - `test/dehet.js`: `DE/HET : TOUT EST CONFORME`; `test/smoke.js`: `items 430` → `434 (words 311, phrases 114,
    patterns 9)`, `ALL CHECKS PASSED`;
  - `test/pace.js . 1`: `5 vérifications, AUCUN PROBLÈME ; 5 non jugée(s)` both times; `rencontrés` on day 1
    57 → 56, `dont premières rencontres` 49 % → 48 %, `production` 2 % → 3 %;
  - `test/journey.js . nl-BE OPR`: `818 checks, NO PROBLEMS` both times;
  - `sh test/run-all.sh` ended `TOUTE LA SUITE EST PASSÉE`.

- [ ] **Step 1: Keep the numbers from before.** On the tree as it stands:
  ```
  mkdir -p "<WS>/tmp"
  node test/content.js . > "<WS>/tmp/content-6-before.txt"
  node test/lang.js . > "<WS>/tmp/lang-6-before.txt"
  node test/pace.js . 1 > "<WS>/tmp/pace-6-before.txt"
  node test/journey.js . nl-BE OPR > "<WS>/tmp/journey-6-before.txt"
  ```
  Expected: content ends `<c> contrôles, CONTENU CONFORME` (2077 in the proof) and prints
  `  séquence        61 / <s> phrases empruntent en avant (budget 61)`; lang ends `LANGUE CONFORME`; pace ends
  `5 vérifications, AUCUN PROBLÈME ; 5 non jugée(s) : il faut au moins 30 jours`; journey ends
  `<n> checks, NO PROBLEMS`. Then write `<WS>/tmp/ahead.js`, with the Write tool:
  ```js
  /* Les phrases d'exemple qui empruntent en avant, et à quelle unité : pour le retour de la tâche 6. */
  const path = require('path');
  const ROOT = path.resolve(process.argv[2]);
  const browser = require(path.join(ROOT, 'test', 'lib', 'browser'));
  const sequence = require(path.join(ROOT, 'test', 'lib', 'sequence'));
  const NL = browser.open({ root: ROOT, seed: browser.SEED, skip: [browser.APP] }).NL;
  NL.state.open().then(() => {
    NL.content.refresh();
    const units = NL.content.units, first = sequence.firstUnits(NL.content);
    let n = 0;
    units.forEach((u, ui) => (u.words || []).forEach((w, i) => (w.drills || []).forEach(d => {
      const forms = sequence.ahead(d.nl, ui, first);
      if (!forms.length) return;
      n++;
      console.log(u.id + ':w' + i + '  ' + d.nl + '  → ' + forms.map(f => f + ' (' + units[first.get(f)].id + ')').join(', '));
    })));
    console.log(n + ' phrases empruntent en avant');
  });
  ```
  Run `node "<WS>/tmp/ahead.js" . > "<WS>/tmp/ahead-6-before.txt"`. Expected: its last line is
  `61 phrases empruntent en avant`.

- [ ] **Step 2: Run Merge.**
  ```
  node tools/content/merge.js . "<WS>/drafts/words"
  ```
  Expected: exit 0, and exactly these three lines:
  ```
  ok words <taken> taken, <dropped> dropped
  ok lexicon.a1c.js <taken> words in <u> units
  ok ids.tsv <taken> added
  ```
  `<taken>` + `<dropped>` is 605. `git diff --stat` then shows only `src/content/lexicon.a1c.js` and
  `test/data/ids.tsv`, with insertions only (the lexicon's ten first lines and its last are the same as before).

  If a line starts with `fail`, Merge wrote nothing. Stop and report the lines. Do not edit a draft, a
  review or a ruling, and do not run Split again. `fail words -: <id> and <id> both write « <word> »; …` means
  slots were filled with one word and both kept: the run controller settles it as task 5's Why says (« A word
  written in two batches »), and this task then runs again from this step. `fail words <id>: stale` cannot
  happen unless `UNITS` was edited after Split.

- [ ] **Step 3: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (<n> bytes), artifact.html (<m> bytes)`, both larger than before.

- [ ] **Step 4: `test/content.js`: pin the explanations, and the budget of sentences that borrow ahead.** In
  `test/content.js`, replace the seven lines
  ```js
    /* L'explication d'un élément (NL.ex.explanation : la note d'un mot ou d'une phrase, la règle d'un
       motif) se lit dans les deux langues d'affichage. Chacun a la sienne : les genres explanations-be
       et explanations écrivent celles des mots et des phrases dans src/content/notes.js. */
    const bilingual = x => !!x && has(x.fr) && has(x.en);
    const unexplained = items.filter(x => !bilingual(NL.ex.explanation(x))).map(x => x.id);
    ok(unexplained.length === 0, unexplained.length + ' élément(s) sans explication en français et en anglais : ' + unexplained.slice(0, 6).join(', '));
    console.log('  explications    ' + unexplained.length + ' / ' + items.length + ' élément(s) sans explication dans les deux langues (exigé : 0)');
  ```
  with these ten, `<taken>` being the number in Merge's second line:
  ```js
    /* L'explication d'un élément (NL.ex.explanation : la note d'un mot ou d'une phrase, la règle d'un
       motif) se lit dans les deux langues d'affichage. Chacun a la sienne : les genres explanations-be
       et explanations écrivent celles des mots et des phrases dans src/content/notes.js. Les mots de la
       tâche 6 attendent leurs explications : leur compte est épinglé, et la tâche 8 remet 0. */
    const bilingual = x => !!x && has(x.fr) && has(x.en);
    const unexplained = items.filter(x => !bilingual(NL.ex.explanation(x))).map(x => x.id);
    const UNEXPLAINED_BUDGET = <taken>;
    ok(unexplained.length <= UNEXPLAINED_BUDGET, unexplained.length + ' élément(s) sans explication en français et en anglais, budget ' + UNEXPLAINED_BUDGET + ' : ' + unexplained.slice(0, 6).join(', '));
    ok(unexplained.length >= UNEXPLAINED_BUDGET, 'seulement ' + unexplained.length + ' élément(s) sans explication : baisser UNEXPLAINED_BUDGET à ' + unexplained.length + ' pour verrouiller le gain');
    console.log('  explications    ' + unexplained.length + ' / ' + items.length + ' élément(s) sans explication dans les deux langues (budget ' + UNEXPLAINED_BUDGET + ')');
  ```
  Then
  ```
  node test/content.js .
  ```
  Expected: `CONTENU — <430 + taken> éléments`, and among its lines
  ```
    explications    <taken> / <items> élément(s) sans explication dans les deux langues (budget <taken>)
    ids             <439 + taken> / <439 + taken> à leur place
  ```
  Read the `séquence` line:
  - if it still says `61 / <s> phrases empruntent en avant (budget 61)`, there is nothing to do here: exit 0,
    `<c'> contrôles, CONTENU CONFORME`;
  - if there is one `FAIL` line, `<a> phrases d’exemple empruntent du vocabulaire à une unité ultérieure, budget
    61 — baisser le budget quand on en corrige, jamais le lever` (the count rose), then in `test/content.js` replace
    the one line
    ```js
      const AHEAD_BUDGET = 61;
    ```
    with
    ```js
      /* Révélé par les unités 13–34, qui ont fait monter ce compte de 61 à <a> : chaque phrase comptée en plus
         employait un de leurs mots avant qu'il soit enseigné. Le plan 4c, qui écrit leurs phrases, peut le baisser. */
      const AHEAD_BUDGET = <a>;
    ```
    `<a>` being the count the `FAIL` line names, and run `node test/content.js .` again: the `séquence` line
    reads `<a> / <s> phrases empruntent en avant (budget <a>)`, exit 0, `<c'> contrôles, CONTENU CONFORME`.
  Any other `FAIL` line: stop and report it; it is not this task's.
  Then list the sentences for the return:
  ```
  node "<WS>/tmp/ahead.js" . > "<WS>/tmp/ahead-6-after.txt"
  diff "<WS>/tmp/ahead-6-before.txt" "<WS>/tmp/ahead-6-after.txt"
  ```
  Expected: the lines added are the sentences that now borrow ahead, each with the form and the new unit that
  teaches it, and the count line. No line added, and `diff` says nothing, when the count did not move.

- [ ] **Step 5: The frontier on a seeded state.** Write `<WS>/tmp/frontier.js`, with the Write tool:
  ```js
  /* La frontière le jour où les unités arrivent : un état semé, lu par NL.content.courseProgress(), et
     ce que « Parcours » en montre. Pour le retour de la tâche 6 (revue, point 5). N'écrit aucun fichier. */
  const path = require('path');
  const ROOT = path.resolve(process.argv[2]);
  const browser = require(path.join(ROOT, 'test', 'lib', 'browser'));
  const T0 = Date.parse('2026-10-05T08:00:00Z'), DAY = 86400000;
  const NL = browser.open({ root: ROOT, seed: browser.SEED, now: T0, skip: [browser.APP] }).NL;
  let bad = 0;
  const ok = (c, m) => { if (!c) { bad++; console.log('PROBLÈME : ' + m); } };
  const meet = it => { NL.srs.seed(it, 0); const r = NL.state.rec(it.id); r.due = T0 + DAY; NL.state.setRec(r); };
  const old = u => u.n <= 12;
  /* Ce qui est conservé : chaque enregistrement, et le reste des méta sauf la date d'écriture. */
  const stored = () => ({ recs: JSON.stringify(NL.state.allRecs()), meta: JSON.parse(JSON.stringify(NL.state.meta())) });
  const metaDiff = (a, b) => Object.keys(Object.assign({}, a, b)).filter(k => k !== 'updatedAt' && JSON.stringify(a[k]) !== JSON.stringify(b[k]))
    .map(k => k + ' ' + JSON.stringify(a[k]) + ' → ' + JSON.stringify(b[k]));
  /* Une carte de « Parcours » : ouverte ou fermée, actuelle ou non, son compte à rebours ou sa phrase. */
  const cards = () => NL.screens.leerpad.render().split('<section class="unit-card').slice(1).map(c => ({
    locked: c.split('"')[0].indexOf('locked') >= 0,
    now: c.split('"')[0].indexOf('now') >= 0,
    gate: (/<p class="uc-gate">([^<]*)</.exec(c) || [])[1] || '',
    lock: (/<p class="uc-lock">([^<]*)</.exec(c) || [])[1] || ''
  }));

  function report(name, seed, wantCurrent) {
    NL.state.clearAll(); NL.content.refresh();
    const units = NL.content.units;
    seed(units);
    NL.state.setMeta({ reached: 11 });
    const before = stored();
    console.log(name);
    console.log('  avant : reached ' + before.meta.reached + ', ' + NL.state.allRecs().length + ' enregistrements, ' + units.length + ' unités');
    const cp = NL.content.courseProgress(), shown = cards();
    console.log('  courseProgress : current ' + cp.current.id + ' (unité ' + cp.current.n + '), ' + cp.met + ' rencontrés sur ' + cp.total);
    units.forEach((u, i) => {
      const c = shown[i], p = NL.content.unitProgress(u.id);
      if (u.n >= 12) console.log('  unité ' + u.n + ' ' + u.id + ' : ' + (NL.content.unitOpen(u.id) ? 'ouverte' : 'fermée') + (c.now ? ', actuelle' : '') + ', ' + p.met + '/' + p.total + ' ; ' + (c.gate || c.lock || '(aucune phrase)'));
    });
    const after = stored();
    console.log('  après : reached ' + after.meta.reached + ' ; enregistrements ' + (after.recs === before.recs ? 'identiques' : 'CHANGÉS') + ' ; méta changées : ' + (metaDiff(before.meta, after.meta).join(', ') || 'aucune'));
    ok(cp.current.n === wantCurrent, name + ' : l\'unité actuelle est la ' + cp.current.n + ', attendue ' + wantCurrent);
    ok(units.every((u, i) => NL.content.unitOpen(u.id) === (u.n <= wantCurrent) && shown[i].locked === (u.n > wantCurrent)), name + ' : ouvertes jusqu\'à la ' + wantCurrent + ', fermées après');
    ok(after.recs === before.recs, name + ' : un enregistrement a changé');
  }

  NL.state.open().then(() => {
    NL.content.refresh();
    const threeQuarters = u => { const its = NL.content.itemsOf(u.id); its.slice(0, Math.ceil(its.length * 0.75)).forEach(meet); };
    report('1. Les trois quarts de chacune des 12 premières unités rencontrés, reached 11', us => us.filter(old).forEach(threeQuarters), 13);
    report('2. Les trois quarts de la seule unité 12 rencontrés, reached 11', us => threeQuarters(us.find(u => u.n === 12)), 12);
    console.log(bad ? bad + ' PROBLÈME(S)' : 'FRONTIÈRE CONFORME');
    process.exit(bad ? 1 : 0);
  });
  ```
  Then
  ```
  node "<WS>/tmp/frontier.js" . > "<WS>/tmp/frontier-6.txt"
  ```
  Expected: exit 0, and in `<WS>/tmp/frontier-6.txt`, with `<u>` the units merged, `<w>` and `<g>` a unit's words
  and three quarters of them:
  ```
  1. Les trois quarts de chacune des 12 premières unités rencontrés, reached 11
    avant : reached 11, <m> enregistrements, <12 + u> unités
    courseProgress : current vragen (unité 13), <m> rencontrés sur <items>
    unité 12 weekend : ouverte, 24/32 ; (aucune phrase)
    unité 13 vragen : ouverte, actuelle, 0/<w> ; Encore <g> éléments à rencontrer avant l’unité suivante.
    unité 14 kunnen : fermée, 0/<w> ; S’ouvre quand l’unité 13 aura été vue en grande partie.
    … the same line for each unit up to 34 …
    après : reached 12 ; enregistrements identiques ; méta changées : reached 11 → 12, progress {"reached":11,"scenariosDone":[],"listenDone":[]} → {"reached":12,"scenariosDone":[],"listenDone":[]}
  2. Les trois quarts de la seule unité 12 rencontrés, reached 11
    avant : reached 11, 24 enregistrements, <12 + u> unités
    courseProgress : current weekend (unité 12), 24 rencontrés sur <items>
    unité 12 weekend : ouverte, actuelle, 24/32 ; (aucune phrase)
    unité 13 vragen : fermée, 0/<w> ; S’ouvre quand l’unité 12 aura été vue en grande partie.
    … the same line for each unit up to 34 …
    après : reached 11 ; enregistrements identiques ; méta changées : aucune
  FRONTIÈRE CONFORME
  ```
  A `PROBLÈME` line and exit 1: stop and report it.

- [ ] **Step 6: `test/lang.js`, its three guards, and the suites that read the course.** First two edits that do not
  depend on what Merge wrote. `test/lang.js`'s walk stops at the day's budget and serves the oldest due first, the last
  units until now, so the new words would crowd out the open tasks (with 239 words merged, measured:
  `6d : byDutch.ask, byDutch.what jamais montré(s), le contrôle est creux`). In `test/lang.js`, replace
  ```
      all.forEach(it => put(it, r));
  ```
  with
  ```
      /* Le budget du jour coupe cette boucle, et le plus ancien est servi d'abord : le cours se lit depuis
         son début, pour que ce qu'elle montre ne dépende pas de ce que les dernières unités ajoutent. */
      all.slice().reverse().forEach(it => put(it, r));
  ```
  And in `test/tools/fanout.js` « kat », the example of an unrelated decoy, is now a course word (`natuur`'s sample): replace
  ```
      same([rule('ikengij:w1', { decoys: ['je', 'jou'] }), rule('ikengij:w1', { decoys: ['je', 'kat'] })],
        [[], ['decoy « kat » is further from the Dutch than the answer: 0.00, at least 0.33']],
  ```
  with
  ```
      same([rule('ikengij:w1', { decoys: ['je', 'jou'] }), rule('ikengij:w1', { decoys: ['je', 'zqz'] })],
        [[], ['decoy « zqz » is further from the Dutch than the answer: 0.00, at least 0.33']],
  ```
  Any other `fanout.js` failure `decoy « <w> » is an answer the course accepts` from a test's own word is the same: give
  the test a word no course can hold, `zq…`. Then:
  ```
  node test/tools/fanout.js .
  node test/lang.js .
  ```
  Expected: `506 contrôles, KIT CONFORME`, then exit 0 and `LANGUE CONFORME`, with `néerlandais nu <793 + u> champs lus en deux langues` (each new
  unit adds its blurb). The new words and blurbs grow the course's Dutch, which `test/lang.js` reads through
  `dutchWords`. That can trip three guards. Each one's fix is in `test/lang.js` and nowhere else:
  - `6d : « <w> » est du néerlandais du cours, son exception est de trop`, often beside
    `6d : « <w> » n’est plus cité nulle part, son exception est de trop`: a new word is one `QUOTE_OK` excused as
    Dutch quoted outside the course. Delete that word's line from `QUOTE_OK`, and the comma that ends the line
    before it if the deleted line was the last.
  - `6d : seulement <n> citations hors du néerlandais du cours : baisser QUOTE_BUDGET à <n> pour verrouiller le
    gain`: a quoted word is now course Dutch. Set `const QUOTE_BUDGET = <n>;` to the `<n>` the line names.
  - `6d : <where> : du néerlandais du cours, écrit pareil en français et en anglais hors de nl-BE … [<w>]`: a
    text's French and English sides both write a word that is now course Dutch (a new word such as « team »,
    « hobby », « menu », « agenda », « post », « film », « sport », « hotel », « contract »). If `<w>` is the same
    word in French and in English there (an office word, a brand, a loanword), add it to `SHARED_OK` as its last
    entry, `  <w>: '<why both languages write it>, <where>'`, with a comma after the entry before it. If it is
    Dutch left bare in a blurb or a note, stop and report the line: the text needs its quote, which is a content
    change, not this task's.
  Then run `node test/lang.js .` until it prints `LANGUE CONFORME`, and
  ```
  node test/dehet.js .
  node test/smoke.js .
  node test/pace.js . 1 > "<WS>/tmp/pace-6-after.txt"
  node test/journey.js . nl-BE OPR > "<WS>/tmp/journey-6-after.txt"
  ```
  Expected: `DE/HET : TOUT EST CONFORME` (every new noun's article was held to `dehet.tsv` by Check);
  `ALL CHECKS PASSED` with `items <430 + taken>`; pace ends `5 vérifications, AUCUN PROBLÈME ; 5 non jugée(s)`;
  journey ends `<n> checks, NO PROBLEMS`. A `dehet.js` failure names a noun: stop and report it, since Check
  should have refused the row. A `smoke.js` failure `distractors are too often a different kind of word: only
  <p>% of questions have two of the same kind` (`test/smoke.js:677`, at least 75 %) is not a row's fault to fix
  here: the guard reads the pick exercise's wrong options over every word without an article, the course's own 169
  stand at 76 % with the suite's seed and between 74 % and 78 % with `SEED=1` to `4` (measured on `2a86861`), and
  new words move it either way (measured on hand rows: 77 % with three nouns and three small words, 74 % when
  two verbs, « kunnen » and « moeten », were added). Stop and report the line to the run controller; the threshold
  is not lowered in this task.

- [ ] **Step 7: The whole suite.** In the background, into a file (about 15 minutes):
  ```
  sh test/run-all.sh
  ```
  Expected: every suite passes and the last line is `TOUTE LA SUITE EST PASSÉE`. Any failure: stop and report it. Never change a
  threshold of `test/pace.js` or `test/journey.js`.

- [ ] **Step 8: Report what moved.**
  ```
  diff "<WS>/tmp/pace-6-before.txt" "<WS>/tmp/pace-6-after.txt"
  diff "<WS>/tmp/journey-6-before.txt" "<WS>/tmp/journey-6-after.txt"
  ```
  In the return, give Merge's three lines, the build's sizes before and after, `test/content.js`'s count and
  its `explications` and `séquence` lines before and after (and `AHEAD_BUDGET`'s new value, if step 4 set one, with
  the sentences of `ahead-6-after.txt` that `ahead-6-before.txt` lacks), `<WS>/tmp/frontier-6.txt`'s `current`,
  `après` and closing lines, `test/lang.js`'s guard lines if any moved, and the lines that moved in pace and
  journey.

- [ ] **Step 9: Commit.**
  ```
  git add src/content/lexicon.a1c.js test/data/ids.tsv index.html artifact.html test/content.js test/lang.js test/tools/fanout.js
  git commit -m "feat(content): the 22 new units' words, merged by the words kind into lexicon.a1c.js and ids.tsv, their missing explanations pinned (#123)"
  ```

Done when:
- `src/content/lexicon.a1c.js` and `test/data/ids.tsv` hold what one successful run of Merge wrote, the run
  that printed `ok words <taken> taken, <dropped> dropped` with `<taken>` + `<dropped>` = 605, and a second run
  prints `ok ids.tsv 0 added` and changes nothing.
- `node test/content.js .` prints `CONTENU CONFORME`, with `UNEXPLAINED_BUDGET` at `<taken>` and its `séquence`
  line's count equal to `AHEAD_BUDGET`; `node test/lang.js .` prints `LANGUE CONFORME`; `sh test/run-all.sh`
  prints `TOUTE LA SUITE EST PASSÉE`, with no threshold of `test/pace.js` or `test/journey.js` changed.
- `<WS>/tmp/frontier-6.txt` ends `FRONTIÈRE CONFORME`.
- The return gives the sentences that borrow ahead, if the budget moved, the frontier's report, and pace's and
  journey's numbers before and after.

### Task 7: FAN explanations: the new words' notes
Class: fan-out
Ticket: #123
Kind: explanations
Drafting after: 3, 6
Split: node tools/content/split.js . "<WS>/drafts/explanations"
Check: node tools/content/check.js "<WS>/drafts/explanations/<batch>"
Merged by: task 8
Why: D9 (one tranche finishing A1), and the phase 3 decisions 8a and 8b that every word and phrase explains
itself in French and in English. Task 6 merged the 22 new units' words (about 605; the count is what its
Merge printed), none with a note; it pinned `test/content.js`'s count of unexplained items to their number
(`UNEXPLAINED_BUDGET`, both ways, as `AHEAD_BUDGET` is: call 6), so the suite is green while this kind drafts,
and task 8 sets the demand back to zero once the notes are merged. This kind writes their notes and their « on dit aussi » forms, in the same format as the
421 items of the 12 first units. Task 3's rule does the cutting: `split('rest')` cuts only the sources without
a `note`, unless Split is given their ids, so Split cuts one batch per new unit, named by the unit's id
(`vragen` … `spoed`, in the course's order), its rows that unit's words (its target, give or take what task 6 merged) and nothing else; the 12 old units'
items all have a note and are not cut, and a batch left empty is not written. No new word has a Flemish form
yet (plan 4b's flemish fan-out gives them one), so every one of them is of this kind and none of
`explanations-be`: a row writes no decoys, and `labelled` (the senses English Wiktionary marks Belgian for the
word itself) is its only lead on Flanders. Split reads the course as it stands at HEAD, after task 6's commit. It reads `.cache/kaikki/belgian.tsv`, which task 2's
`node tools/content/kaikki.js .` wrote in the run's worktree; without it Split prints
`fail explanations -: the kind's split threw: .cache/kaikki/belgian.tsv is missing: run node tools/content/kaikki.js .`
and exits 1. In the proof, on 2 hand-made units of 3 words, Split printed `vragen 3` and `wonen 3`; in the run,
expect 22 lines, one per unit of task 4's `UNITS`, each count the words task 6 merged for that unit. Tasks 1
and 1b run beside the drafting and touch no content; no task between this one and task 8 changes a word's
`be`, meaning, note or `also`, which the stamp covers.

#### Format

```json
{"id": "wonen:w2", "stamp": "19ac4b07", "note": {"fr": "Le mot de Flandre : « de frigo ». « De koelkast » est la forme du Nord, qu’on comprend aussi.", "en": "The Flemish word: “de frigo”. “De koelkast” is the northern form, understood too."}, "also": []}
```

The example is the note of a row whose `nl` is « de frigo » and whose `labelled` lists its Belgian sense (« refrigerator »): the Flemish word is the row's own, and « de koelkast » is Dutch OpenTaal knows. Check passed it on the proof.

- One row per input row, in its order. Copy `id` and `stamp` unchanged, then give `note` and `also`. No other
  field except `unsure`.
- `note` says what `meaning` does not: an article a French speaker would guess wrong, a separable verb, the
  word order, a plural, the register (« u » or « je »), a false friend, how Flanders says it, only when labelled or the row's own forms back it (no `be` form is invented).
  Check refuses a note that only repeats the meaning.
- `note` is `{"fr": …, "en": …}`, the same note in French and in English. Each side is one line of at most 160
  characters and 2 sentences, with no `<` and no straight double quote. Write the typographic apostrophe, `’`.
- Quotes hold Dutch only (decision 8b): « … » in `fr`, “…” in `en`, no quote inside a quote, and both sides
  quote the same Dutch. A translation goes in parentheses, unquoted:
  `« Ik heb er geen goesting in » (je n’ai pas envie)`.
- Every quoted word is Dutch that OpenTaal or `flemish.tsv` knows, or a word of the row's own forms (`nl`, `be`,
  `also`). A French or an English word is never quoted:
  `Vient tout droit du français embêtant.`
- A word of the course that both sides leave bare is refused: quote it. `Diminutif en -je, donc het.` leaves
  `het` and `-je` bare in both languages; `Un diminutif en « -je », donc « het » : « het zakje ».` quotes them.
- Each side is written in its own language. Outside quotes, Check refuses French function words in `en` (le,
  la, et, est, avec…) and English ones in `fr` (the, and, of, is, with…).
- Both sides hold the same digits and the same `{naam}`, `{stad}` and `{bedrijf}` tokens. Write a default name
  as its token, never the name itself.
- `note` in the input is `null` on every row of this fan-out: these words were merged without one (task 6).
  Write it. `also` in the input is `[]` for the same reason.
- « Kunde » is « kunt ge » run together, not « kunt u »: a note that quotes « kunde » beside a « u » also quotes
  « kunt ge ». `test/content.js` refuses it after Merge, where Check cannot.
- `also` lists the other Dutch forms that the typed exercise should accept for this item, in this sense, `[]`
  for none. One form per entry (no `/`, no `;`, and for a word no comma), a noun with its article, each word
  spelled as OpenTaal or `flemish.tsv` knows it. Check refuses `nl` itself, the same form twice, and the Dutch
  of another item unless that item is a sibling. A form you add becomes a right answer, so the reader reads the
  row whole.
- `siblings` lists the items with the same sense, old units included. Your note and your `also` agree with
  theirs.
- `labelled` lists the senses that English Wiktionary labels Belgian for `nl` itself, or is `null`. It is a
  lead for the note, not a text to copy: its senses are English, and a quote holds Dutch only.
- A row you doubt carries `"unsure": "<why, in one line>"`. Check still checks it, and the reader reads it first.
- A verdict carries `id` and `verdict`, and no other field.

#### Reader focus

- Does the note teach what `meaning` does not? A note that says the meaning again in other words passes Check:
  dispute it.
- Is the grammar right? A wrong article, plural or verb form in a note teaches the error to every learner. The
  article the note gives is the one `nl` carries (task 4's Check held it to `dehet.tsv`).
- Does the quoted Dutch hold up? An example in a note is grammatical, and uses the item as the note says.
- When a note says how Flanders says it, is that true at work today, and not one dialect's? These items have
  no Flemish form in `be.js` yet, so a note does not invent one: plan 4b's flemish fan-out will offer it, with
  its evidence.
- Are `fr` and `en` the same note, each natural in its own language? Dispute a side that reads as a
  word-for-word translation.
- `also`. Is each form right for this item, in this sense? It becomes an answer that the typed exercise
  accepts, and the row goes on to the content check (`readWhole` gives `new also`).
- Siblings agree: the same sense gets the same note and the same `also`, across old and new units.
- `unsure` rows first.

### Task 8: Merge explanations: the new words' notes
Class: mechanical
Ticket: #123
Merges: explanations
Promises: none
Why: D9, and the phase 3 decisions 8a and 8b. Task 7's drafters, its readers and the maintainer have settled
every row of the kind `explanations` that task 7's Split cut: the words task 6 merged into the 22 new units,
none of which had a note. This task carries the rows into `src/`: `tools/content/merge.js` runs the kind,
which writes each row's note into `src/content/notes.js` and its « on dit aussi » forms into
`src/content/also.js`. `test/content.js` has demanded since phase 3's task 43 that every item has its
explanation in both languages; task 6 could not meet it for words whose notes are drafted from the merged
words, so it pinned the count of unexplained items to the number of words it merged (`UNEXPLAINED_BUDGET`,
both ways, in the idiom of `AHEAD_BUDGET`: call 6), and the suite stayed green. This task sets the demand
back: the budget goes, the check reads `exigé : 0` again as at `1525c90`, fails on exactly the new words
(step 3, the red), and is green once Merge has written their notes (step 6). `test/lang.js` reads the new
notes with the rest of the course's prose: a note that quotes a word no longer quoted elsewhere, or that
writes a brand or an office word bare in both languages, moves its two guards (`QUOTE_OK`, `SHARED_OK`), each
fixed in `test/lang.js` and nowhere else, as step 7 says. Then the reading tool writes the list the maintainer
reads at the phase's content check (D15), from every kind the run's workspace holds a Split of.

Files (lines are as of `1525c90`; task 6 rewrote the « explications » block of `test/content.js`, and may add
or delete `QUOTE_OK` and `SHARED_OK` lines in `test/lang.js`, which moves what is below them: find each place
by its text):
- Modify: `test/content.js` (the « explications » block, `test/content.js:151-157` at `1525c90`, as task 6
  left it around `UNEXPLAINED_BUDGET`)
- Modify, only if task 6 named `UNEXPLAINED_BUDGET` there: `TESTING.md` (step 2)
- Modify (Merge writes them): `src/content/notes.js`, `src/content/also.js`
- Modify (the build writes them): `index.html`, `artifact.html`
- Modify, only as step 7 says: `test/lang.js` (`QUOTE_OK`, `test/lang.js:906`; `SHARED_OK`, `test/lang.js:925`)
- Create, outside the repository: `<WS>/reading-list.md`
- Test: `node test/content.js .`, `node test/lang.js .`, then the full suite, `sh test/run-all.sh`

Notes:
- Comments and messages in `test/content.js` and `test/lang.js` are French, as around them.
- **Line endings.** The working tree is CRLF; match on content. `git diff` is the judge.
- **The red is the state task 6 hid.** Step 2 writes no new check: it puts back the `1525c90` lines, which
  demand zero. Their red (step 3) names the new words; after Merge they pass (step 6). Both are quoted below.
- **Run Merge once.** The kind stamps `be`, the meaning, the note and `also`, and Merge writes the note. So once
  a Merge has succeeded, a second run prints
  `fail explanations <id>: stale, stamped <a> at Split, the source now stamps <b>` for every row it wrote,
  exits 1 and writes nothing (six such lines in the proof). This is not a bug. To start over, run
  `git checkout -- src/content/notes.js src/content/also.js`, and Merge then runs as the first time.
- **No row may be dropped.** A row is dropped only when the maintainer ruled `drop`. Its word would stay without
  a note, and `test/content.js` would stay red: step 4 stops on it.
- **The counts at this point in the run.** Task 7's Split cut one row per word task 6 merged, in 22 batches
  named by the unit ids (605 targets; task 6's `ok lexicon.a1c.js <n> words in <u> units` line holds the
  count, and so does its `UNEXPLAINED_BUDGET`). Taken rows add up to that count, and every word and phrase of
  the course then has a note.
- **The reading list.** `tools/content/reading.js` writes nothing itself and reads the tables as the tree holds
  them, so step 10 runs it once the commit is made. It lists every kind that `<WS>/drafts` holds a Split of,
  `words` (task 5) as well as `explanations`.
- **The proof.** These steps ran on a copy of `1525c90` with task 3's Split rule (`split('rest')` cuts only the
  sources without a note), a hand-made `src/content/lexicon.a1c.js` of two units (`vragen` 13 and `wonen` 23) of
  three words each listed in `build.sh`'s `SRC` after `lexicon.a1b.js`, their six lines in `test/data/ids.tsv`,
  `AHEAD_BUDGET` at 62 and `UNEXPLAINED_BUDGET` at 6 pinned both ways, as tasks 4 and 6 leave the tree, and six
  hand rows drafted and kept, all of which pass Check. The real rows come from the fan-out, so your numbers
  differ. What moved:
  - step 1: `explications    6 / 436 élément(s) sans explication dans les deux langues (budget 6)` and
    `2087 contrôles, CONTENU CONFORME`;
  - step 3: `FAIL: 6 élément(s) sans explication en français et en anglais : vragen:w0, vragen:w1, vragen:w2,
    wonen:w0, wonen:w1, wonen:w2`, `explications    6 / 436 … (exigé : 0)`, `2086 contrôles, 1 ÉCHEC(S)`;
  - Merge: `ok explanations 6 taken, 0 dropped`, `ok notes.js 6 set, 0 removed`, `ok also.js 0 set, 0 removed`;
  - `test/content.js` after Merge: `notes 421` → `notes 427` in its tables line; `explications 0 / 436`;
    `2086 contrôles, CONTENU CONFORME`;
  - `test/lang.js`: `néerlandais nu` 795 → 801 fields read in two languages; `guillemets` 0 and 15 exceptions
    both times; no `QUOTE_OK` or `SHARED_OK` line moved; 23187 → 23199 contrôles;
  - the build: 685431 → 686827 bytes for `index.html`, 684817 → 686213 for `artifact.html`;
  - the full suite: `TOUTE LA SUITE EST PASSÉE`;
  - the reading list: 32 lines, with its `## explanations` section; the proof's workspace held no other kind.

- [ ] **Step 1: Keep the numbers from before.** On the tree as it stands:
  ```
  mkdir -p "<WS>/tmp"
  node test/content.js . > "<WS>/tmp/content-8-before.txt"
  node test/lang.js . > "<WS>/tmp/lang-8-before.txt"
  ```
  Expected: the first exits 0, ends `<c> contrôles, CONTENU CONFORME` and prints, among its lines,
  ```
    tables          be <b>, open.phrases <o>, notes 421, decoys <d>, also <a> ; be, note, also hors du lexique
    explications    <n> / <items> élément(s) sans explication dans les deux langues (budget <n>)
  ```
  (`6 / 436`, `2087 contrôles` in the proof). `<n>` is the number of words task 6 merged, and its
  `UNEXPLAINED_BUDGET`. Any `FAIL` line: stop and report it; it is not this task's. The second exits 0, ends
  `LANGUE CONFORME` and prints
  `  guillemets      0 citations hors du néerlandais du cours (exigé : 0), <x> exceptions` (15 in the proof).

- [ ] **Step 2: Write the failing test: the demand comes back.** In `test/content.js`, replace the whole
  « explications » block task 6 wrote — from the line that begins
  ```js
    /* L'explication d'un élément (NL.ex.explanation : la note d'un mot ou d'une phrase, la règle d'un
  ```
  through the line that begins
  ```js
    console.log('  explications    '
  ```
  (both unique in the file; the block holds `const UNEXPLAINED_BUDGET = <n>;` and its two `ok(` lines) — with
  these seven lines, the block as it stood at `1525c90`:
  ```js
    /* L'explication d'un élément (NL.ex.explanation : la note d'un mot ou d'une phrase, la règle d'un
       motif) se lit dans les deux langues d'affichage. Chacun a la sienne : les genres explanations-be
       et explanations écrivent celles des mots et des phrases dans src/content/notes.js. */
    const bilingual = x => !!x && has(x.fr) && has(x.en);
    const unexplained = items.filter(x => !bilingual(NL.ex.explanation(x))).map(x => x.id);
    ok(unexplained.length === 0, unexplained.length + ' élément(s) sans explication en français et en anglais : ' + unexplained.slice(0, 6).join(', '));
    console.log('  explications    ' + unexplained.length + ' / ' + items.length + ' élément(s) sans explication dans les deux langues (exigé : 0)');
  ```
  `git diff -- test/content.js` then shows `UNEXPLAINED_BUDGET` on deleted lines only, and nothing else of the
  file changed. If task 6 named `UNEXPLAINED_BUDGET` in `TESTING.md` (its `content.js` row or its budget
  paragraph, « Un budget ne peut que baisser »), delete that mention so the paragraph reads as it did at
  `1525c90`: the explanations have no budget again, `content.js` demands them.

- [ ] **Step 3: Run it and watch it fail.**
  ```
  node test/content.js .
  ```
  Expected: exit 1, and among its lines
  ```
    FAIL: <n> élément(s) sans explication en français et en anglais : <the first six new word ids>
    explications    <n> / <items> élément(s) sans explication dans les deux langues (exigé : 0)
  ```
  ending `<c − 1> contrôles, 1 ÉCHEC(S)` (`6 élément(s)`, `vragen:w0, vragen:w1, vragen:w2, wonen:w0, wonen:w1,
  wonen:w2`, `2086 contrôles, 1 ÉCHEC(S)` in the proof: one `ok(` where task 6 had two). Any other `FAIL` line:
  stop and report it.

- [ ] **Step 4: Run Merge.**
  ```
  node tools/content/merge.js . "<WS>/drafts/explanations"
  ```
  Expected: exit 0, and exactly these three lines:
  ```
  ok explanations <taken> taken, 0 dropped
  ok notes.js <taken> set, 0 removed
  ok also.js <a> set, 0 removed
  ```
  `<taken>` is `<n>` of step 1. `<a>` counts the rows that give « on dit aussi » forms; nothing is removed,
  since no new word had any. `git diff --stat` then shows `test/content.js`, `src/content/notes.js`, and
  `src/content/also.js` if `<a>` is not 0.

  If a line starts with `fail`, Merge wrote nothing. Stop and report the lines. Do not edit a draft, a review
  or a ruling, and do not run Split again. A `stale` row on this first run means that a task after task 7's
  Split changed a word's `be`, meaning, note or `also`, and no task of this plan does that.

  If the first line names a `<dropped>` that is not 0, run
  `git checkout -- src/content/notes.js src/content/also.js`, then stop and report the ids of the dropped
  rows. `node tools/content/reading.js . "<WS>" --kind explanations` prints each row with how it was settled:
  those rows read `ruled drop on <date>`.

- [ ] **Step 5: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (<n> bytes), artifact.html (<m> bytes)`, both larger than before
  (685431 → 686827 and 684817 → 686213 in the proof).

- [ ] **Step 6: Run it and watch it pass.**
  ```
  node test/content.js .
  ```
  Expected: exit 0, and among its lines
  ```
    tables          be <b>, open.phrases <o>, notes <421 + taken>, decoys <d>, also <a'> ; be, note, also hors du lexique
    explications    0 / <items> élément(s) sans explication dans les deux langues (exigé : 0)
  ```
  ending `<c − 1> contrôles, CONTENU CONFORME`, the count of step 3 (`notes 427`, `0 / 436`, `2086 contrôles`
  in the proof). If it fails, stop and report the failure: a word the `FAIL` line names has no note in both
  languages after Merge, or a note trips the « kunde » guard.

- [ ] **Step 7: `test/lang.js`, and its two guards.**
  ```
  node test/lang.js .
  ```
  Expected: exit 0, and among its lines
  ```
    guillemets      0 citations hors du néerlandais du cours (exigé : 0), <x> exceptions
    néerlandais nu  <f> champs lus en deux langues, <y> exceptions
  ```
  ending `<k> contrôles, LANGUE CONFORME` (`15 exceptions`, `801 champs`, `12 exceptions`, `23199 contrôles` in
  the proof, where no guard moved). The new notes' quotes and their bare Dutch can trip two guards, each fixed
  in `test/lang.js` and nowhere else, then run again:
  - `6d : « <w> » n’est plus cité nulle part, son exception est de trop`, or
    `6d : « <w> » est du néerlandais du cours, son exception est de trop`: delete that word's line from
    `QUOTE_OK` (the table that starts `const QUOTE_OK = Object.assign(Object.create(null), {`), and the comma
    that ends the line before it if the deleted line was the last.
  - `6d : <where> : du néerlandais du cours, écrit pareil en français et en anglais hors de nl-BE … [<w>]`:
    if `<w>` is the same word in French and in English there (an office word, a brand, a name), add it to
    `SHARED_OK` (the table that starts `const SHARED_OK = Object.assign(Object.create(null), {`) as its last
    entry, `  <w>: '<why both languages write it>, <where>'`, with a comma after the entry before it. If it is
    Dutch left bare, stop and report the line.

  A `citations hors du néerlandais du cours` failure, or any other failure: stop and report it.

- [ ] **Step 8: The full suite.** In the background, into a file (about 15 minutes):
  ```
  sh test/run-all.sh
  ```
  Expected: it ends with
  ```
  (note) index.html ou artifact.html diffère du dernier commit : à versionner avec ce changement.

  TOUTE LA SUITE EST PASSÉE
  ```
  Any failure: stop and report it.

- [ ] **Step 9: Commit.**
  ```
  git add test/content.js src/content/notes.js src/content/also.js index.html artifact.html
  git commit -m "feat(content): every new word's note and « on dit aussi » forms merged; every item must have its explanation in both languages again (#123)"
  ```
  If step 2 changed `TESTING.md`, or step 7 changed `test/lang.js`, add them to the `git add` line.

- [ ] **Step 10: Write the reading list.** From the worktree, with the commit made:
  ```
  node tools/content/reading.js . "<WS>" > "<WS>/reading-list.md"
  ```
  Expected: exit 0. The file starts with `# Reading list` and holds one `## <kind>` section per kind that
  `<WS>/drafts` holds a Split of, `## explanations` among them (`## words` too, in the run); under each, a line
  `<rows> rows: <taken> taken, <dropped> dropped. Listed: …` (`6 rows: 6 taken, 0 dropped. Listed: 0 ruled,
  0 read whole, 6 sampled of 6 others.` in the proof, 32 lines in all). If it exits 1, the file holds its
  `fail` lines instead: stop and report them.

- [ ] **Step 11: Report.** In the return, give step 3's `FAIL` line, Merge's three lines, the build's sizes
  before and after, `test/content.js`'s `explications` and `tables` lines and `test/lang.js`'s `guillemets`
  line, before (step 1) and after, and the reading list's path and line count. Name any `QUOTE_OK` line
  step 7 deleted and any `SHARED_OK` line it added.

Done when:
- `test/content.js`'s « explications » block reads as at `1525c90`: `ok(unexplained.length === 0, …)` and
  `(exigé : 0)`, and no `UNEXPLAINED_BUDGET` left in the tests or their doc
  (`git grep UNEXPLAINED_BUDGET -- test TESTING.md` prints nothing; the plan's own text still names it). It
  failed before Merge, naming the new words (step 3).
- `src/content/notes.js` and `src/content/also.js` hold what one successful run of Merge wrote, the run that
  printed `ok explanations <taken> taken, 0 dropped` with `<taken>` the number of words task 6 merged.
- `node test/content.js .` prints
  `explications    0 / <items> élément(s) sans explication dans les deux langues (exigé : 0)` and
  `CONTENU CONFORME`.
- `node test/lang.js .` prints `guillemets      0 citations hors du néerlandais du cours (exigé : 0)` and
  `LANGUE CONFORME`.
- `sh test/run-all.sh` prints `TOUTE LA SUITE EST PASSÉE`.
- `<WS>/reading-list.md` starts with `# Reading list` and holds a `## explanations` section.
- `git status --short` is clean after the commit.

### Task 9: Docs: the course's new size, the lexicon the kit writes, the learner pass's browser
Class: mechanical
Ticket: none
Promises: none
Why: D9 and D10. After task 8 the course has 34 units and every item has its explanation; the docs still say
twelve units and 430 items (`README.md`, « Les écrans » and « État »; `TESTING.md`, « Encore ouvert »), and
`CLAUDE.md`'s paragraph on the tables a kind's Merge writes does not know the seventh file the `words` kind
writes whole, `src/content/lexicon.a1c.js`, nor the lines it appends to `test/data/ids.tsv` (task 4), nor
this plan among the places where the thinking is written down. `GLOSSARY.md` gains « Slot », the word the
`words` kind's rows and batches use (`slot: k`, ids `<unit>:s<k>`, call 3): a place for one word in a new
unit, which is not a session's « Place » (whose entry already says to avoid « slot » for it). And the learner
pass (`tools/learner-pass/`) launches Chrome by name (`channel: 'chrome'`, `common.js:66`); this desktop has
Edge, so the channel becomes the environment variable `LEARNER_PASS_CHANNEL`, `chrome` by default, which gate
10's Show sets to `msedge` (call 9). That change is a refactor: the pass is not in the suite, its default is
unchanged, and `node --check` is its check here (gate 10 runs it). No test is written: the edits are prose,
and the counts they carry are measured in step 1 from the tree as task 8 left it. Nothing under `src/`
changes, so there is no build.

Files:
- Modify: `README.md` (« Parcours », line 91; « Fichiers », line 257; « État », lines 315–316 and 326–329)
- Modify: `TESTING.md` (« Le passage complet du 30 septembre 2026 », line 242; « Encore ouvert », lines 270–271)
- Modify: `CLAUDE.md` (the « Six tables » bullet, lines 82–89; « Where the thinking is written down », after
  lines 106–107)
- Modify: `GLOSSARY.md` (« The course », after « Sibling », lines 166–170)
- Modify: `tools/learner-pass/common.js` (the header comment, line 4; `chromium.launch`, line 66)
- Modify: `tools/learner-pass/README.md` (« Setup », lines 16–17)
- Test: none (docs); `node --check tools/learner-pass/common.js` for the refactor

Lines are as of `2a86861` (`GLOSSARY.md`: « Place » 109, « Sibling » 166, « Who the learner is » 172); task 1 edits `README.md:100-103` and `GLOSSARY.md:109`, task 1b and task 4 edit
`TESTING.md:29` and `:26`, which do not move the lines below them by more than their own insertions: find
each place by its text.

Notes:
- **Languages.** `README.md` and `TESTING.md` are French; `CLAUDE.md`, `GLOSSARY.md` and the learner pass's
  `README.md` are English; `common.js`'s comments are French.
- **Line endings.** The working tree is CRLF; match on content. `git diff` is the judge.
- **The counts.** `<i>` is the course's items, read from `node test/content.js .`'s line
  `explications    0 / <i> élément(s) …`. `<n>` is the new words, `grep -c "W('" src/content/lexicon.a1c.js`
  (one `W(` line per word, as `build.sh` counts them; task 6's Merge printed the same number in
  `ok lexicon.a1c.js <n> words in <u> units`). `TESTING.md:271`'s « 8 mots sur 307 » was counted on 28 October
  2026 through the kit's course (`C.sources`, kind `word`, with and without `drills`): the new words have no
  example sentence, so the line becomes `<8 + n>` of `<307 + n>`. `<date>` is the day of the run, written as
  « 28 octobre 2026 » is.
- **`TESTING.md:242` is a record.** The section describes the pass of 30 September 2026, when the course had
  12 units: the count stays, and « d'alors » says so.
- **The commit has no ticket.** Its subject ends without a placeholder.
- **The proof.** These steps ran on a copy of `1525c90` with tasks 3, 4, 6 and 8 stood in (two hand-made units
  of three words each, their notes merged): `<i>` 436, `<n>` 6, so « 34 unités, 436 éléments », « 14 mots sur
  313 ». The anchors and the diff stat were run again on a copy of `2a86861`, `<i>` and `<n>` given by hand: every
  anchor below was found once; `node --check` printed nothing and exited 0; `git diff --stat`
  listed the six files, `CLAUDE.md | 7 ++++++-`, `GLOSSARY.md | 5 +++++`, `README.md | 15 ++++++++-------`,
  `TESTING.md | 6 +++---`, `tools/learner-pass/README.md | 3 ++-`, `tools/learner-pass/common.js | 6 ++++--`,
  `28 insertions(+), 14 deletions(-)`; `node test/content.js .` still ended `2086 contrôles, CONTENU CONFORME`.

- [ ] **Step 1: Measure.** Write to `<WS>/tmp/task-9.sh` and run with `sh`:
  ```
  node test/content.js . | grep explications
  grep -c "W('" src/content/lexicon.a1c.js
  ```
  Expected: `  explications    0 / <i> élément(s) sans explication dans les deux langues (exigé : 0)` and a
  number, `<n>` (436 and 6 in the proof). The plan expects `<i>` = 430 + `<n>`, at most 1,035, and `<n>` at most
  605 and equal to the sum of the taken slots (task 6's `ok lexicon.a1c.js <n> words in <u> units` prints it):
  if either differs, stop and tell the run controller; the docs must not carry a count that is not the tree's.
  Below, write `<i>` and `<n>` as digits, and `<8 + n>` and
  `<307 + n>` as their sums.

- [ ] **Step 2: `README.md`.** Replace
  ```
  | **Parcours** | Douze unités A1 avec les explications de grammaire. Chaque carte d'unité dit combien d'éléments il reste à rencontrer avant que la suivante s'ouvre. Alimente le planificateur. |
  ```
  with
  ```
  | **Parcours** | Trente-quatre unités A1 : les douze premières avec leurs explications de grammaire, les vingt-deux suivantes avec leurs mots d'abord. Chaque carte d'unité dit combien d'éléments il reste à rencontrer avant que la suivante s'ouvre. Alimente le planificateur. |
  ```
  then replace
  ```
  src/content/  lexicon.a1  lexicon.a1b  grammar  reference  scenarios  index
  ```
  with
  ```
  src/content/  lexicon.a1  lexicon.a1b  lexicon.a1c (écrit par le kit)  grammar  reference  scenarios  index
  ```
  then replace
  ```
  **Livré** : interface et contenu en français de Belgique (12 unités, 430
  éléments, 6 scénarios, 8 antisèches, 9 règles) ; docteur audio et
  ```
  with
  ```
  **Livré** : interface et contenu en français de Belgique (34 unités, <i>
  éléments, 6 scénarios, 8 antisèches, 9 règles) ; docteur audio et
  ```
  then replace
  ```
  **À venir** : le contenu est encore le plafond. 430 éléments s'épuisent vers le
  jour 40. La suite, dans l'ordre : noyau de 1 200 mots par fréquence avec les
  situations intégrées, 400 expressions figées, écrans *Lezen* et *Missions*,
  textes gradués et écoute longue, puis A2 → B2.
  ```
  with
  ```
  **À venir** : les unités 13 à 34 n'ont encore que leurs mots. La suite, dans
  l'ordre : leurs règles de grammaire et leurs conversations, leurs phrases et
  leurs exemples, leurs formes flamandes (les autres plans de la phase 4), les
  écrans *Lezen* et *Missions*, les textes gradués et l'écoute longue, puis
  A2 → B2.
  ```

- [ ] **Step 3: `TESTING.md`.** Replace
  ```
  placement (48 questions, les 12 unités), environ 540 exercices couvrant les 12
  ```
  with
  ```
  placement (48 questions, les 12 unités d'alors), environ 540 exercices couvrant les 12
  ```
  then replace
  ```
  - Le contenu reste le plafond : 430 éléments, tous de niveau A1.
  - 8 mots sur 307 n'ont pas encore de phrase d'exemple (comptés le 28 octobre 2026).
  ```
  with
  ```
  - Le contenu reste le plafond : <i> éléments, tous de niveau A1 ; les unités 13 à 34 n'ont encore que leurs mots.
  - <8 + n> mots sur <307 + n> n'ont pas encore de phrase d'exemple (comptés le <date>) : les 8 d'octobre, et les <n> mots des unités 13 à 34, dont les phrases viennent avec un plan suivant de la phase 4.
  ```

- [ ] **Step 4: `CLAUDE.md`.** Replace
  ```
    (`explanations-be`). Each is keyed by an item's Dutch as its first listing writes it,
    tokens unfilled. Change an entry through its kind's rows, not by hand: a hand edit leaves
    no row behind it, and the next Merge of that item writes over it.
  ```
  with
  ```
    (`explanations-be`). Each is keyed by an item's Dutch as its first listing writes it,
    tokens unfilled. Change an entry through its kind's rows, not by hand: a hand edit leaves
    no row behind it, and the next Merge of that item writes over it. The `words` kind's Merge
    (`tools/content/kinds/words.js`) writes a seventh file whole, `src/content/lexicon.a1c.js`:
    the units 13 to 34 and their words, from its `UNITS` and the accepted rows; and it appends
    the new words' lines to `test/data/ids.tsv`. The same rule: a word changes through its rows.
  ```
  then, under « Where the thinking is written down », find the two lines
  ```
  - `docs/superpowers/plans/2026-10-22-phase-3-content-to-b1.md` — the phase 3 plan: the
    content kit (`tools/content/`) and the kinds that took the course to B1
  ```
  and insert right after them
  ```
  - `docs/superpowers/plans/2026-10-31-phase-4a-ceiling-and-words.md` — the phase 4a plan: the
    session follows the backlog (D18), and the 22 new units' words through the kit's `words` kind
  ```
  and replace
  ```
  The suite takes three to six minutes. While working, run the one file you are changing, for
  ```
  with
  ```
  The suite takes about fifteen minutes. While working, run the one file you are changing, for
  ```

- [ ] **Step 5: `GLOSSARY.md`.** Under « The course », find the end of « Sibling »,
  ```
  a meaning the two share in the learner's native language. Unlike an alias, each sibling
  keeps its own progress.
  _Avoid_: synonym, equivalent, variant
  ```
  and insert right after it, before `### Who the learner is`, one blank line then
  ```
  **Slot**:
  A place for one word in a new unit, cut by the kit's `words` kind before the word exists and
  filled by a drafter; a unit's target is its number of slots. Not a session's place.
  _Avoid_: place, gap, vacancy
  ```
  so that one blank line separates it from « Sibling » above and from the heading below.

- [ ] **Step 6: The learner pass's browser.** In `tools/learner-pass/common.js`, replace
  ```js
       node tools/learner-pass/<script>.js [dossier qui contient index.html]     (le dépôt par défaut) */
  ```
  with
  ```js
       node tools/learner-pass/<script>.js [dossier qui contient index.html]     (le dépôt par défaut)
     Le navigateur est le Chrome installé ; LEARNER_PASS_CHANNEL=msedge prend Edge (un canal de
     Playwright). */
  ```
  then replace
  ```js
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
  ```
  with
  ```js
    const browser = await chromium.launch({ channel: process.env.LEARNER_PASS_CHANNEL || 'chrome', headless: true });
  ```
  In `tools/learner-pass/README.md`, replace
  ```
  Once: `npm install` in this folder. It installs `playwright-core` only, which drives the
  Chrome already installed on the machine (`channel: 'chrome'`); it downloads no browser.
  ```
  with
  ```
  Once: `npm install` in this folder. It installs `playwright-core` only, which drives the
  Chrome already installed on the machine (`channel: 'chrome'`), or Edge when
  `LEARNER_PASS_CHANNEL=msedge` is set (any Playwright channel name works); it downloads no browser.
  ```

- [ ] **Step 7: Check.**
  ```
  node --check tools/learner-pass/common.js
  grep -c "channel: process.env.LEARNER_PASS_CHANNEL || 'chrome'" tools/learner-pass/common.js
  git diff --stat
  sh test/run-all.sh
  ```
  Expected: the first prints nothing and exits 0. The second prints `1`. The third lists exactly `README.md`, `TESTING.md`,
  `CLAUDE.md`, `GLOSSARY.md`, `tools/learner-pass/common.js` and `tools/learner-pass/README.md`. The suite stays
  green (the refactor and the prose touch nothing it reads): the fourth, run in the background into a file, ends
  `TOUTE LA SUITE EST PASSÉE`. Then,
  in a `.sh` file, `grep -n "430\|Douze\|12 unités" README.md TESTING.md` prints three lines, all in `TESTING.md`
  (measured with tasks 1 to 8 applied): the two paragraphs task 1b wrote on the `groot` learner, whose « 430
  éléments » and « les 430 du cours » are the real course that learner's 1 190 items copy (they stay), at lines 65
  and 222, and « les 12 unités d'alors », the record of the 30 September pass, at line 251 (242 plus task 1b's nine
  lines).

- [ ] **Step 8: Commit.**
  ```
  git add README.md TESTING.md CLAUDE.md GLOSSARY.md tools/learner-pass/common.js tools/learner-pass/README.md
  git commit -m "docs(course): thirty-four units and the lexicon the kit writes; the learner pass takes its browser from LEARNER_PASS_CHANNEL"
  ```
  No build: nothing under `src/` changed.

Done when:
- `README.md` says « Trente-quatre unités A1 » and « 34 unités, <i> éléments », lists `lexicon.a1c`, and its
  « À venir » names what the units 13 to 34 still lack and keeps *Lezen*, *Missions*, graded texts and long listening; `TESTING.md`'s « Encore ouvert » gives `<i>` items and
  `<8 + n>` words of `<307 + n>` without a sentence; neither file says « 430 » or « Douze » any more, except
  `TESTING.md`'s « les 12 unités d'alors » (the record of the 30 September pass) and the two « 430 » of task 1b's
  paragraphs on the `groot` learner (the real course his 1 190 items copy).
- `CLAUDE.md` names `src/content/lexicon.a1c.js` and `test/data/ids.tsv` as the `words` kind's Merge writes
  them, and lists `docs/superpowers/plans/2026-10-31-phase-4a-ceiling-and-words.md`.
- `GLOSSARY.md` has « Slot » under « The course », and « Place » still says to avoid « slot ».
- `tools/learner-pass/common.js` launches `process.env.LEARNER_PASS_CHANNEL || 'chrome'`, and its `README.md`
  says so; `node --check tools/learner-pass/common.js` exits 0.
- `git status --short` is clean after the commit.

### Task 10: GATE: a learner pass in a real browser
Class: gate
Ticket: none
After: 1, 1b, 6, 8, 9
Show: export LEARNER_PASS_CHANNEL=msedge; echo "## days"; node tools/learner-pass/days.js . 2>&1; echo "## corners"; node tools/learner-pass/corners.js . 2>&1; echo "## sweep"; node tools/learner-pass/sweep.js . 2>&1
Ask: « Did the learner pass print a `PROBLEM:` line in <WS>/tmp/gate-10.md? » The run controller answers it, on the maintainer's behalf (D19): no `PROBLEM:` line and every script's closing line: the answer is « nothing »; otherwise, dispatch one background subagent on `sonnet`, description `task 10`, to confirm each line by hand as `tools/learner-pass/README.md` (« Reading a fault ») says, returning at most 10 lines, one per line, `harness` or `app` and why; the answer is each line's verdict and what became of it (`Then:`).
Answer to: Rulings
Why: on 25 October 2026 the maintainer asked for a hands-on learner pass in a real browser before every
learner's check, and the follow-ups-2 run's gate 8 ran one, answered by the run controller for them (its D8).
Phase 4 ends with one release and the learner's check after plan 4d (D9), so this plan ends in a draft pull
request from `phase-4a` into `phase-4`, and the pass plays the branch's last commit before it. Three tasks
here change what a learner meets:
- Task 1 gives a session 30 base places, and one review place more per 40 items due, up to 41 (D18). A blank
  account's first day has 15 new items (33 to 37 exercises, 7 to 8 minutes, measured for call 2) where it had 11.
  `tools/learner-pass/session.js` plays a session in at most 120 steps (`for (let step = 0; step < 120; …)`):
  a 30-place day fits, and the pass is where a longer session is seen played through, tap by tap.
- Task 6 lands 22 units on « Parcours »: 34 unit cards where there were 12, and the
  first 12 unchanged in order and items (the frontier reaches unit 13 only when unit 12's gate is met, Review
  Focus 5). The sweep taps every card and reports overflow at 390 px, which no vm suite sees.
- Task 8 gives every new word its note, read in the panel after an answer. The pass does not reach the new
  words in 20 study days (unit 13 opens after unit 12), so their notes are the suite's to check
  (`test/content.js`, `test/typed.js`, `test/lang.js`); the pass checks the engine's change and the shell.

The suite checks the session's arithmetic (`test/engine.js`, « LA SÉANCE SUIT L'ARRIÉRÉ ») and the course's
every item, typed (`test/typed.js`). Only a browser checks a tap, a real scroll and a screen's height. The
learner pass, `tools/learner-pass/` (its `README.md` says what each script plays), plays the committed
`index.html` in a headless browser dressed as Safari on iPhone (390×844, touch, `fr-BE`), with a fake
recogniser that behaves like Safari's. Task 9 made the browser a choice: `LEARNER_PASS_CHANNEL` names the
Playwright channel, `chrome` by default; this desktop has Edge, so Show sets `msedge`. Show writes nothing
tracked: its screenshots go to `tools/learner-pass/shots/`, which git ignores. Each script exits 1 with one
`PROBLEM:` line per fault, and prints, last:
- `days.js`: sessions on study days 0 to 20, the clock moved forward, until spoken cards come up; each
  microphone path once: right, wrong then right, ending by itself, and « Je ne peux pas parler ». It prints one
  `DAY <d>` line per day played, with the number of cards. A clean run ends `THE STUDY DAYS PLAY THROUGH`.
- `corners.js`: listening (Comprendre, Répéter), the baker conversation, the challenge. A clean run ends
  `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`.
- `sweep.js`: every tappable thing on 16 screens, « Parcours » and the settings sheet among them. It reports a
  tap that changes nothing, a button a finger cannot reach, a sheet that jumps from where it was scrolled,
  overflow at 390 px, and console errors. A clean run ends `EVERY TAP DOES SOMETHING`.

The pass runs in the machine's own zone, at the clock its scripts set. Its `DAY` lines are read for the
session's size: day 0 now holds 15 new items (33 cards with their reinforcement and the match, measured on the replay: `DAY 0 15
items are waiting for you / 0 to review, 15 new · about 7 minutes. | cards 33`), and a later day with a backlog may hold
31 places or more (measured: days 1, 2, 3 and 5 held 26, 25, 28 and 30 items, 44, 40, 45 and 55 cards).

The proof. The writer did not run Show: the learner pass's package is not installed on this desktop
(`npm ci --ignore-scripts` in `tools/learner-pass/`, a download, and the set-up's step), and its browser
channel is task 9's. The last clean run on record is the follow-ups-2 plan's replay (gate 8, a copy of
`8d6cf5f` with its seven tasks applied): about seven minutes, no `PROBLEM:` line, `days.js` playing study days
0, 1, 2, 3, 5 and 7 (one spoken card on day 3, 14 on day 7), `corners.js` eight Comprendre and eight Répéter
lines, the baker conversation and a nine-card challenge, `sweep.js` 274 taps on 16 screens. On this branch
the `DAY 0` line's card count is higher (15 new items), and the sweep's tap count grows by the 22 new unit
cards. The plan's replay ran Show word for word: « How far to trust this plan » records what it printed. It ran
on Edge, on a copy with tasks 1 to 9 applied and 6 hand-made words in two units (14 units in all): 5 min 40 s, no
`PROBLEM:` line, `DAY` lines for study days 0, 1, 2, 3 and 5 (33, 44, 40, 45 and 55 cards; day 5, with 11 spoken
cards, ends the walk, where gate 8's walk went on to day 7), the three closing lines (`THE STUDY DAYS PLAY
THROUGH`, `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`, `EVERY TAP DOES SOMETHING`), and 282 taps on the
sweep's 16 screens (`leerpad` 21), so the real run, with 34 units, prints a higher count.

If Show cannot start (no `node_modules` in `tools/learner-pass/`, no browser for the channel: Playwright's
error names it, `msedge` here), the run stops there: tell the maintainer its error lines, with a push
notification, as for any run that stops. The gate stays `in progress`. The set-up installs the package
(« Set-up decisions », « The learner pass »): if it did not, that is what the maintainer does.
Then: a Rulings line for the gate (its question, the answer, and « (on the maintainer's behalf) » when the
run controller answered), and the gate `done`:
- **No `PROBLEM:` line, and each script ends with its closing line.** The answer is « nothing ».
- **A script with no closing line.** A script that crashes prints no `PROBLEM:` line, only its error (Show
  carries stderr into the file with `2>&1`; on the proof, with the package absent, the file held three
  `Cannot find module 'playwright-core'` errors and no `PROBLEM:` line). A script with no closing line
  (`THE STUDY DAYS PLAY THROUGH`, `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`,
  `EVERY TAP DOES SOMETHING`) is a fault to confirm: answered as a `PROBLEM:` line is, by the same subagent,
  and reported with the script's last lines.
- **`PROBLEM:` lines: every confirmed fault is fixed in this run (D19).** The subagent the ask names confirms each by
  hand. A `harness` line that is a trap the README lists, or another the subagent shows, goes in the Rulings line with its
  reason. A fault in the app, or in the pass itself, is filed by the run controller with `gh issue create --parent 12
  --label needs-triage` (`docs/agents/issue-tracker.md`), titled for what a learner meets, its body the `PROBLEM:` line,
  the subagent's reason and the screenshot's path. Then a background subagent on `opus`, description `task 10`, writes
  `<WS>/briefs/task-10-fix-<k>.md` in the kit's brief form (`design-sitting.md`), its ticket that issue, its `Class:`
  `engine` if it touches `src/core/srs.js` and `mechanical` otherwise, its first step a test that fails on the old code. The
  run controller adds a Status row `10-fix-<k>` and runs it through the loop like any task. Once the last row is `done`,
  Show runs again into `<WS>/tmp/gate-10-fix-<k>.md` and is answered the same way; the gate stays `in progress` until
  a Show is clean. Each issue closes with its fix's commit.
- **A fault whose fix needs a decision this plan, #12 or an ADR does not hold** (what a screen should say or do, a change
  to scheduling or grading, anything stored) is not fixed by the run: its issue stays open, the run controller tells the
  maintainer the line with a push notification, and the final report names it. After three rounds of Show without a
  clean one, the run stops and tells the maintainer the same way.
- **A `closing` task or a gate fix changes `src/` after the gate.** The run file's `Learner pass:` line says it: Show runs
  again into `<WS>/tmp/gate-10-closing.md` before the final report, and is answered the same way. The
  maintainer gets both paths, and the draft pull request's description carries both results.
