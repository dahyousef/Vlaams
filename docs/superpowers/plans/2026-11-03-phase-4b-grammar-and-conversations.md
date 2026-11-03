# Phase 4b — Grammar and conversations — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/run-controller.md`, Mode: one session
> (`one-session.md`). A run controller hands one code-lane task at a time to a task controller, runs the drafting
> lane's fan-out tasks beside it, and runs gate 9; do not use a skill's controller loop. Implementers read
> `docs/agents/plan-runs/run-notes.md` before their brief; where the notes and a command here differ, the notes win.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** the second of phase 4's four plans. The 13 grammar rules the phase 4 design sitting chose on 28 October
2026, each a pattern like the 9 the course has, listed on 9 of the 22 new units (13–34); and 4 conversations like the
6 the course has: the café, moving an appointment by phone, the school gate with the juf, the town hall counter. All
of it course-written: drafted in the kit's drafting lane, read whole by readers that did not write it, and put on the
maintainer's reading list for phase 4's check (D15). The suite is green at the plan's end, and a learner pass plays
every conversation and opens every rule's sheet in Edge. No open tasks for the new rules, no full simple past, no
sentences for the new units: plans 4c and 4d. One release and the learner's check close the phase after plan 4d (D9).

**Architecture:** the drafting lane runs only through kinds, and no kind writes patterns or scenarios, so the kit
gains two. The `grammar` kind (task 1) cuts one batch per unit from its `RULES`, checks each drafted pattern (shape,
5 drills, gaps, spelling, the Dutch in its explanation, what the course has taught by its unit), and its Merge writes
`src/content/grammar.a1c.js` whole: the patterns, pushed onto `NL.content.patterns`, and a loop that lists each on
its unit's `grammar`. `lexicon.a1c.js` is not rewritten: it has no re-Merge path. The `scenarios` kind (task 2) does
the same from its `CONVERSATIONS` into `src/content/scenarios.a1c.js`, pushed onto `NL.content.scenarios`. Both files
load before `src/content/index.js`, so build() takes them like the rest. The learner pass plays every conversation,
not only s-bakker, and a new script opens every rule sheet at 390 px (task 3), on today's content first. Then the two
fan-outs and their merges (tasks 4–7), the docs (task 8), and gate 9 in Edge. Nothing in `src/core/` changes:
`NL.srs.compose()` meets a new pattern as it meets the nine, in unit order, and keeps its two review places for due
patterns.

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`; no bundler, no runtime dependency.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`), the tools' suites in `test/tools/`.
- The content kit, `tools/content/`: Split, Check, Merge over one module per kind.
- The learner pass, `tools/learner-pass/`, a headless browser through `playwright-core`, in Edge on this desktop
  (`LEARNER_PASS_CHANNEL=msedge`).
- `gh` for tickets.

**Spec:**
- GitHub issue #12, « New vocabulary every day, English by default, and content to B1 »: « Content strategy », « The
  content factory is run, never deployed », and « Checking » (a claim no mechanical check can verify is read by a
  reader that did not write it).
- The phase 4 design sitting's decisions of 28 October 2026 (`handoff.md`, « Grammar » and « Conversations »): the 13
  rules, the 4 conversations, « course-written, read whole », « Full simple past later ».
- The maintainer's decisions D9–D23, stated below. The unit list approved on 28 and 31 October 2026 (plan 4a's task
  4, `UNITS`).
- `GLOSSARY.md`; ADR 0005 (amended).
- The tickets, sub-issues of #12: `{T-grammar}` (tasks 1, 4, 5), `{T-conversations}` (tasks 2, 6, 7) and
  `{T-learner-pass}` (task 3). Tasks 8 and 9 carry none.

## The maintainer's decisions

D9–D20 were taken at the phase 4 design sitting and for plan 4a (25–31 October 2026); D21–D23 for this plan, on
3 November 2026, each « As recommended ».

| D | Answer | Task |
|---|---|---|
| D9 | One tranche finishing A1; one deployment and the learner's check close phase 4, after plan 4d. | — |
| D10 | Themed units after the current 12; the unit list approved at a gate (22 units, n 13–34). | 1, 2 |
| D11 | The Node content kit stays the factory (ADR 0005 amended). | 1, 2, 4–7 |
| D15 | Read whole: new Flemish forms, course-written sentences, ruled rows; the rest 1 in 20, at least 10 per kind. Every row of this plan is course-written. | 1, 2, 4, 6 |
| D16 | Phase 4 is several small plans, each one session with its drafting lane; content plans one after another. | set-up |
| D19 | Plan 4a's run controller ruled on the maintainer's behalf and answered its gate. D23 repeats it for this plan. What can be tested before drafting is tested first. | 3 |
| D20 | Plan 4a's FAN explanations' readers ran on Sonnet. This plan's readers are the kit's default, Opus (call 4). | — |
| D21 | `s-afspraak`, the phone conversation, is listed under `leven`: praten lists only `leven` and `werk`, and its unit, afspraak, is `beide`. | 2 |
| D22 | The new conversations are open from the start, like the six: no `unit` field on a scenario, no filter in praten, the home suggestion, `listenClips()` or `test/journey.js`. | 2, 6 |
| D23 | This plan's run controller rules on the maintainer's behalf (a row still disputed after its second reader) and answers gate 9; every fault the gate confirms is fixed in the run, except one needing a decision no document holds; the 17 rows stay on the maintainer's reading list (D15). Mode: one session. | 4, 6, 9 |

## How far to trust this plan

Every code-lane task was written and proved on a throwaway copy, and each of the nine briefs was then read by a checker
against the code as it will stand, on a copy with every task applied. The checkers found 11 blocking faults and 36
minor ones; each was fixed in this text and its step proved again, task after task in run order, on a CRLF clone. The
whole plan was then replayed once, from this text, in run order, on a fresh CRLF clone of `4d10aa1`: 9 tasks of 9. The
suite ended `TOUTE LA SUITE EST PASSÉE` on the commit of each code-lane task: 1 (about 34 min), 2 (33 min), 3 (about 33),
5 (about 34), 7 (about 34) and 8 (about 42). Gate 9's Show ran word for word in Edge: about 8 min 36 s, no `PROBLEM:`
line, its four closing lines, 10 `CONVERSATION` blocks with 22 `finished after`, `RULES 22 (27 chips …)` with 22 sheets
at 390 px, 299 taps on 16 screens. The replay fixed two places in this text (task 8's red count, gate 9's day lines),
neither changing a decision.

What the checks found that the writers' own proofs had not, all fixed in this text:
- **Check did not see guard 6d.** A row with a quote or a bare Dutch word in its prose passed Check and turned
  `test/lang.js` red after Merge. Task 1 moves the guard into `test/lib/quoted.js`, and both kinds' Check call it.
- **The learner pass never played some choices.** Choosing `i % n` never taps the third choice of `s-koffie`. Task 3
  plays each conversation once per choice position, so every choice of every step is tapped.
- **Two tasks matched line ends with a bare `\n`**, which fails on a CRLF clone; and Split's folder must be named after
  its kind, which the kit reads from the folder's name.
- **Two rules could write one sentence**, caught only at Merge. Check now refuses it, across batches.

What is still not proved:
- **The 17 real rows.** No drafter, reader or batch controller ran: the fan-outs and merges ran on 17 hand rows. The
  counts that depend on the rows (`AHEAD_BUDGET` 130, `test/lang.js`'s totals, the sizes) are read in the run, as tasks
  5 and 7 say; a real explanation longer than the hand ones is judged at 390 px by gate 9, not before.
- **The readers on Opus** (call 4): the kit's default, not exercised here.
- **Each learner-pass script's own time** in `tools/learner-pass/README.md`: the replay measured only Show's total.
- **One fault outside this plan**, found by the replay: `test/hooks.js` fails (« le pid de verify.sh reste celui de la
  suite ») on any clone with `core.autocrlf=true`, already at `4d10aa1`, because it copies `verifier.md`'s lines, CRs
  included, into a shell script. This desktop's clone checks out LF (`core.autocrlf=input`), so the run is not touched;
  the replay's suites ran with `verifier.md` stripped of CRs in their clones only.

## Set-up decisions

- **Branches.** Phase 4 integrates on `phase-4`. This plan's own commit is on `phase-4b-plan`, cut from
  `origin/phase-4` at `4d10aa1`; the set-up creates the run's branch `phase-4b` from `phase-4b-plan`'s tip, so that
  `Base:` is the plan's commit. The run works in the worktree `.claude\worktrees\phase-4b` of the clone at
  `%USERPROFILE%\Desktop\Projects\Vlaams` (`run-notes.md`), pushes with `git push origin HEAD:phase-4b`, and ends in a
  draft pull request from `phase-4b` into `phase-4`, never into `main`.
- **Mode: one session** (D16, D23): 9 tasks, two of them fan-out, one gate.
- **Who rules, and gate 9:** the run controller, on the maintainer's behalf (D23).
- **Tickets.** Three sub-issues of #12, filed on the maintainer's word after the plan is approved: `{T-grammar}`,
  `{T-conversations}`, `{T-learner-pass}`; the placeholders are replaced in the plan and the briefs at set-up.
- **No external data.** Neither kind reads `.cache/`: no fetch at set-up.
- **The learner pass** needs its package (`npm ci --ignore-scripts` in `tools/learner-pass/`) and Edge, which this
  desktop has.
- **The set-up writes D21–D23 as the ledger's first Rulings lines.**

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
- Interface text lives in `src/core/fr.js` and `src/core/en.js`, under the same keys. This plan adds none unless a
  task says so.
- Storage keys and the field names inside stored records keep their spelling. The 13 pattern ids and the 4 scenario
  ids are fixed in tasks 1 and 2: once shipped, a pattern's id is in learners' records and a scenario's in their
  `scenariosDone`.

Content and its tables:
- From this plan on, `src/content/grammar.a1c.js` is written by the `grammar` kind's Merge and
  `src/content/scenarios.a1c.js` by the `scenarios` kind's: no hand edit, as for the six tables and `lexicon.a1c.js`.
- The 9 patterns and the 6 scenarios the course has are not touched.
- Every pattern and every line of a conversation carries its meaning in `fr` and `en`; every Dutch token is a form
  OpenTaal knows or `test/data/flemish.tsv` lists with a reason; Dutch inside an explanation is marked
  `<i class="nl">` or `<span class="ex">`.

Behaviour:
- `NL.srs.compose()` alone decides what a session contains; no task touches it.
- Progress is reported as counts, never percentages.

Budgets and the build:
- `test/content.js`'s pinned budgets move only as a task says, with the measured number and the cause in a comment:
  `AHEAD_BUDGET` in task 5 (call 6). `HOLLOW_BUDGET` stays 3: a pattern without an open task is not hollow.
- `test/engine.js`'s arrears threshold (990 in the proof; task 5 writes the measured figure) and the two comment lines of `test/pace.js` on the grown course move
  only in task 5, with the measured figures (`node test/pace.js . 200 one groot` quotes them).
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with it.

Public repository:
- No personal data in a tracked file; the person is « the maintainer ». Content personalises through `{naam}`,
  `{stad}` and `{bedrijf}`.

## Review Focus

1. **A rule's sheet on a phone.**
   - Condition: a new pattern whose explanation runs long, or whose first three drills are the longest the course has,
     opened from its unit card on the leerpad at 390 px.
   - Expected: the sheet shows the title, the rule, the explanation and three drill rows, with no horizontal scroll.
   - Test: task 3 (`tools/learner-pass/rules.js`, tested by `judgeSheet` in `test/tools/learner-pass.js`); played in gate 9.
2. **A gap at the start of its sentence, or written twice.**
   - Condition: a drafted drill « Geen idee. » with gap `geen`; a drill whose gap occurs twice in it.
   - Expected: Check accepts the first (the gap matches its tiles without case) and refuses the second, naming the
     drill.
   - Test: task 1, the kind's Check test in `test/tools/fanout.js`.
3. **A rule listed on a unit that is not loaded.**
   - Condition: a `RULES` entry, or a row, whose unit is not a unit of the course; `grammar.a1c.js` loaded before
     `lexicon.a1c.js`.
   - Expected: Split or Merge refuses the unknown unit, naming it; the file's loop throws at load, naming the id, and
     `test/smoke.js` fails, rather than a rule never built and nothing said.
   - Test: task 1.
4. **An id the course already has.**
   - Condition: a `RULES` id equal to an existing pattern's or item's id; a `CONVERSATIONS` id equal to an existing
     scenario's.
   - Expected: the kind's Split refuses it, naming both.
   - Tests: tasks 1 and 2.
5. **A conversation that only plays on its first choice.**
   - Condition: a new conversation with a step of three choices, or a reply only on its second choice.
   - Expected: the learner pass plays each conversation once per choice position (pass q taps choice `q % n` at every
     you step, q from 0 to the conversation's largest n minus 1), so every choice of every step is played, and each
     pass finishes.
   - Test: task 3 (`corners.js` and its test); played on all 10 in gate 9.

## Run order

```
1. The grammar kind, and an empty grammar.a1c.js — mechanical — {T-grammar} — waits none
2. The scenarios kind, and an empty scenarios.a1c.js — mechanical — {T-conversations} — waits none
3. The learner pass plays every conversation and opens every rule sheet — mechanical — {T-learner-pass} — waits none
4. FAN grammar — fan-out — {T-grammar} — waits 1
5. Merge grammar — mechanical — {T-grammar} — waits 4
6. FAN conversations — fan-out — {T-conversations} — waits 2
7. Merge conversations — mechanical — {T-conversations} — waits 6
8. Docs: the two kinds, the learner pass, the a1c header — mechanical — none — waits 5, 7
9. GATE: the learner pass in Edge — gate — none — waits 3, 5, 7, 8
```

Tasks 1 and 2 touch the kit and `build.sh` in turn; task 3 touches only `tools/learner-pass/` and its test, and runs
on today's 6 conversations and 9 rules before any row is drafted. FAN grammar starts once task 1 is done and FAN
conversations once task 2 is, beside the code lane. The code lane holds at task 5 until FAN grammar is `done`, and at
task 7 until FAN conversations is `done`.

## The run file's lines

```
Mode: one session
Fan-out: task 4 — kind grammar — after 1 — Split: node tools/content/split.js . "<WS>/drafts/grammar" — Check: node tools/content/check.js "<WS>/drafts/grammar/<batch>" — merged by task 5
Fan-out: task 6 — kind scenarios — after 2 — Split: node tools/content/split.js . "<WS>/drafts/scenarios" — Check: node tools/content/check.js "<WS>/drafts/scenarios/<batch>" — merged by task 7
Gate: task 9 — after 3, 5, 7, 8 — show: export LEARNER_PASS_CHANNEL=msedge; echo "## days"; node tools/learner-pass/days.js . 2>&1; echo "## corners"; node tools/learner-pass/corners.js . 2>&1; echo "## sweep"; node tools/learner-pass/sweep.js . 2>&1; echo "## rules"; node tools/learner-pass/rules.js . 2>&1 — ask: « Is there a `PROBLEM:` line in `## days`, `## corners`, `## sweep` or `## rules` of <WS>/tmp/gate-9.md? Does `## corners` hold 10 `CONVERSATION <id>` blocks, each ending `finished after`, and does `## rules` open with `RULES 22 (`? » The run controller answers it, as task 9's Ask says (D23). — answer to: Rulings
Learner pass: gate 9 plays the branch's last commit. If a closing task or a gate fix changes src/ after the gate's show, run that show again into <WS>/tmp/gate-9-closing.md before the final report, answer it as the gate's ask says, and give the maintainer both paths.
```

## Calls made while writing, for the maintainer

1. **Two new kinds, not hand-written tables (tasks 1, 2).** The drafting lane runs only through kinds, and a
   hand-written table would leave no row behind it for D15's reading.
2. **The rules reach their units from `grammar.a1c.js` (task 1).** A loop at load appends each id to its unit's
   `grammar`. Rewriting `lexicon.a1c.js` instead would need a re-Merge path it does not have, and a second writer of a
   file the `words` kind writes whole. The units keep `grammar: []` in their file; its header says where their rules
   are (task 8).
3. **The ids are fixed in the plan (tasks 1, 2).** `g-niet-geen`, `g-bijzin`, `g-vraag`, `g-twee-werkwoorden`,
   `g-perfect-zijn`, `g-was-had`, `g-deelwoord`, `g-hem-haar`, `g-er-is`, `g-meervoud`, `g-gebiedend`,
   `g-verkleinwoord`, `g-om-op-in`; `s-cafe`, `s-afspraak`, `s-school`, `s-gemeente`. Within a unit the rules keep the
   handoff's order (vragen: rules 1, 2, 7; doen: 4, 12, 13).
4. **Readers on Opus (tasks 4, 6).** The kit's default: every one of the 17 rows is a claim no script can check (a
   rule's statement, an explanation, a natural Flemish exchange), and 17 rows cost little.
5. **Five drills per new rule (task 1).** The 9 patterns have 3 to 5 (37 in all); the sheet shows 3, and the rungs
   order, corrige, cloze and type all draw from them.
6. **`AHEAD_BUDGET` follows the merged rules (task 5).** A gap a rule teaches at its unit can be a form an earlier
   unit's example sentence already used: that sentence then borrows ahead, a borrowing that was there uncounted, as
   plan 4a's call 5 found for words. Task 5 sets the budget to the measured count, with the cause in its comment, and
   lists the sentences in its return.
7. **The learner pass plays every conversation (task 3).** `corners.js` played s-bakker only; it now plays each one in
   `NL.content.scenarios`, once per choice position of its largest step, so every choice of every step is tapped. A new
   `rules.js` opens every gram chip's sheet on the leerpad. Both run on today's content before any row exists
   (« what can be tested before drafting is tested first », D19).

Left out of this plan, for the maintainer:
- **Open tasks for the 13 new rules**: plan 4d, whose share lists them. A pattern without one is not hollow: the
  speaking rungs support it.
- **The full simple past** (handoff.md, « Full simple past later »).
- **The new units' phrases and sentences**: plan 4c.
- **Tickets' labels**: all three carry `needs-triage`.

## The run

### Task 1: The grammar kind, and an empty grammar.a1c.js
Class: mechanical
Ticket: {T-grammar}
Promises: none
Why: D10 and D11 (13 grammar rules, each a pattern like the 9 the course has, listed on 9 of the 22 new units) and D15
(every course-written row is read). The drafting lane runs only through kinds, and a hand-written table would leave no
row behind it for the reader (the header's call 1). This task writes the kind that carries the rules,
`tools/content/kinds/grammar.js`, against the kit of phase 3 and plan 4a (`tools/content/lib/kit.js`). Its source is not
an item but a rule to come (`RULES`, `sourceOf`): a row is one rule, named by its id, that a drafter writes whole, as a
pattern of `src/content/grammar.js`. Split cuts one batch per unit that holds a rule, named by the unit's id, and not yet
in the file, so a second Split after Merge cuts only what `grammar.a1c.js` lacks. Check holds a row to what the course
can verify: its shape, the spelling (OpenTaal and `flemish.tsv`), the typographic apostrophe, the four tags of an
explanation and the Dutch in them marked, what `test/lang.js` guard 6d would refuse at Merge (a quoted passage that is
not Dutch of the course, a Dutch word of the course written bare in both languages: one module, `test/lib/quoted.js`,
which this task creates and `test/lang.js` and task 2's Check share), `rule` on one line (70 signs), the example's `fr`
and `en` holding the digits and `{…}` tokens of `nl`, the rule's own example and five drills in the course's order (the
example's participles and plurals must be a drill's gap), the drills of 3 to 8 tiles, each with a gap that is one tile of
the sentence, written once, and no sentence that a rule earlier in `RULES` (in another batch) or a pattern of the course
already writes. Merge writes no table: its `write` rewrites `src/content/grammar.a1c.js` whole from `RULES` and the taken
rows, in `RULES` order, and it refuses two rules that write one sentence (the backstop for rows drafted in parallel,
which Check cannot see together). The stamp (`unit`, `n`, `teach`) covers nothing Merge writes, so a second Merge rewrites
the same file. Every row is course-written, so every row is on the maintainer's reading list (`readWhole`). The file is
created empty (a header and a loop, no rule), listed in `build.sh`'s `SRC` and in `test/smoke.js`'s file list right after
`grammar.js`, so the page loads it before Merge writes it; the units of `lexicon.a1c.js` keep `grammar: []`, and the
file's loop appends each rule's id to its unit's list at load, throwing, with the rule's id, when the unit is missing.
No number the suites print moves in this task except the count of `test/tools/fanout.js`.

Files:
- Create: `tools/content/kinds/grammar.js`
- Create: `test/lib/quoted.js`
- Create: `src/content/grammar.a1c.js`
- Modify: `test/lang.js` (6d.3 and 6d.4 call the module; a refactor)
- Modify: `build.sh` (`SRC`)
- Modify: `test/smoke.js` (the `files` list)
- Modify: `CLAUDE.md` (the paragraph on the six tables and the `words` kind's file)
- Modify (the build writes them): `index.html`, `artifact.html`
- Test: `test/tools/fanout.js` (a new block before « 9. l'outil de lecture »)

Interfaces:
- Consumes: the kit's `kit.js` (a kind exports `stamp`, `fields`, `tables`, `sourceOf`, `split`, `check`,
  `forMaintainer`, `readWhole`, `merge` and `write`; `kit.merge` calls `kind.write(taken, ctx)`; the kit names the kind
  after the basename of the folder Split writes to, and Check's `ctx` is `{ repo, kind, kindDir, batchDir, course }`),
  `tools/content/lib/course` (`course(repo)`: `RAW.patterns`, `units`), `test/lib/sequence` (`firstUnits`, `ahead`,
  `unmet`), `test/lib/spelling`, `test/lib/text` (`oneLine`, `sig`, `untoken`, `strayQuotes`), `test/lib/dutch`
  (`dutchWords`, `words`), `test/lib/langs` (`joined`, `runs`) and `NL.util.tiles`.
- Produces: `test/lib/quoted.js`, the 6d guard's two checks written once (the code moved from `test/lang.js`, whose
  6d.3 and 6d.4 now call it; task 2's Check calls it too), exporting exactly:
  `QUOTE_OK`, `SHARED_OK` (the two exception tables, with their reasons, no prototype), `QUOTED_FIELDS` (`['note', 'blurb',
  'rule', 'ask', 'what', 'outro', 'hint', 'trap']`), `HTML_FIELDS` (`['explain', 'say', 'title', 'h', 'g']`),
  `names(NL)` (a `Set` of the words of the default names), `quotedSegments(NL, text)` (the passages `NL.gloss.quoted`
  marks nl-BE in a text without tags),
  `foreignQuotes(NL, text, dutch, excuse)` returning `{ foreign, excused, paired }` (`text` has no tags; `dutch` is a `Set`
  of lower-case words; `excuse(passage)` is optional and true for a passage the caller accepts; `foreign` the passages
  holding a word that is not in `dutch`, not a number, not an affix quoted with its hyphen and not in `QUOTE_OK`;
  `excused` the `QUOTE_OK` words used; `paired` true when every opened quote is closed and `NL.gloss.quoted` marks as
  many passages as quotes) and
  `bareDutch(NL, dutch, named, field, fr, en)` returning `{ bare, shared }` (the words of `dutch`, outside `named`, that
  `fr` and `en` both write outside a nl-BE passage; `field` says how the screen shows the text, `HTML_FIELDS` through
  `NL.gloss.prose` and any other through `NL.gloss.quoted`; `fr` and `en` are filled with `NL.content.fill`; `bare` the
  words no `SHARED_OK` exception excuses, `shared` the ones it excuses);
  `tools/content/kinds/grammar.js` exporting `stamp: [unit, n, teach]`, `fields`, `tables: []`, `sourceOf`,
  `split`, `check`, `forMaintainer: () => ''`, `readWhole: () => 'course-written'`, `merge: () => ({})`, `write`, and
  `RULES` (13 `{ id, unit, n, teach }`, in this order: `g-niet-geen`, `g-bijzin`, `g-vraag` on `vragen` (13);
  `g-twee-werkwoorden` on `kunnen` (14); `g-perfect-zijn`, `g-was-had`, `g-deelwoord` on `doen` (15); `g-hem-haar` on
  `mensen` (16); `g-er-is` on `waar` (18); `g-meervoud` on `eten` (20); `g-gebiedend` on `cafe` (21); `g-verkleinwoord` on
  `wonen` (23); `g-om-op-in` on `kalender` (24)), `TILES` (`{ min: 3, max: 8 }`) and `patterns(rules)` (the lines of
  `grammar.a1c.js` for `[{ rule, row, level }]`, `[]` giving the empty file); `src/content/grammar.a1c.js`.

Notes:
- **Comments in French** in `grammar.js`, `quoted.js`, `grammar.a1c.js` and the test block; Check's reasons and Merge's
  lines in English, as the kit's. `build.sh` is English, `CLAUDE.md` English.
- **Departures from what one would guess, each measured.** (1) A gap is one tile: the cloze hides `gapWord`, which matches
  one tile (`src/ex/`), so a two-word gap would never be answerable; Check refuses it. (2) The tiles run from 3 to 8: the
  longest drill of the 9 hand patterns has 8 (`g-scheidbaar`, « Ik sta elke dag om zes uur op. »); the words' examples
  reach 9, but a pattern's drill is also a reorder exercise. (3) `explain` is at most 876 signs per language (the longest
  of the 9 hand patterns) and `rule` at most 70, so the sheet reads on a phone (Review Focus 1). (4) The hand patterns'
  explanations use `<b class="nl">` and `<span class="nl">`; the new rows use only `<b>`, `<i>`, `<i class="nl">` and
  `<span class="ex">`, the tags `src/ui/` styles for a rule's sheet, and a title may use `<span class="nl">`.
- **The shared module, and why it is here.** `test/lang.js` 6d refuses, on the merged course, a quoted passage that is not
  Dutch of the course (6d.3: a translation goes in parentheses, with no quotes) and a Dutch word of the course written bare
  in both languages (6d.4). With Check blind to both, a row passed the readers and failed only at task 5's Merge. The code
  of those two checks moves, verbatim, to `test/lib/quoted.js`; `test/lang.js` keeps what is its own (the note exception
  of 6d.3, which stays there as the `excuse` it passes, the reference tables, the plants, the counts) and calls the module,
  so that one copy of `QUOTE_OK` and `SHARED_OK` serves the course and the rows. That is a refactor: no test can fail on
  the old code, and `node test/lang.js .` staying green is its check. `test/lang.js` is slow, so it runs once, at step 8.
  In Check the word list of the row is the course's (`dutchWords`) plus the words of the row's own `nl` and its drills'
  `nl` (the sentences reach the course only at Merge, as `explain.js` does for a note's own sentences).
- **Where Check stops.** It checks the course order (a non-gap token of the rule's example and of a drill must be taught
  by the rule's unit, participles and plurals counting as unmet unless they are a gap of the row), the spelling, the 6d
  guard on `rule`, `explain` and `title` as above, and a sentence another rule already writes. It cannot see a rule that is
  drafted in parallel, in a batch that has no `draft.json` yet, so Merge's refusal of two rules that write one sentence
  stays: it is the backstop, tested here. The Dutch that only one language writes bare is the readers' (task 4's Reader focus).
  Measured: the bare « en » in `explain.fr` of task 4's Format example is not refused, by Check or by 6d.4 (task 4's
  proof: `node test/lang.js .` with that row merged ends `25093 contrôles, LANGUE CONFORME`).
- **Why `readWhole` and not a table.** Every row is a claim no script can check, so every row goes to the maintainer's
  list (D15), and none by rule (`forMaintainer` is empty).
- **The wiring lists.** `build.sh`'s `SRC` is what the page and most suites load, and `test/smoke.js` keeps its own
  `files` list. With the file empty, leaving it out of either stays green, so the block's first two checks read both
  lists: that is their red. The `CLAUDE.md` sentence is the repository's rule that a hand edit of a written table is
  overwritten; the new file is one.
- **The split's folder is named after the kind.** The kit reads the kind from the target folder's basename, so Split on
  `<WS>/tmp/grammar-1` fails with `no kind module tools/content/kinds/grammar-1.js`; step 7 uses `<WS>/tmp/grammar`.
- **Edits are placed by text, and stay true whichever of tasks 1 and 2 lands first.** Task 2 adds
  `src/content/scenarios.a1c.js` to the same `SRC` and the same smoke list, and a sentence to the same `CLAUDE.md`
  paragraph. Put each of this task's lines after `src/content/grammar.js` (`'src/content/grammar.js',` in smoke), and the
  `CLAUDE.md` sentence directly after the sentence that ends `(`docs/agents/plan-runs/design-sitting.md`).`, or after
  task 2's sentence if one is already there. In the test file the block goes before the comment that begins
  `/* ==================================================== 9. l'outil de lecture`; if task 2's block is there already,
  put this one directly before the same comment, after it.
- **The proof.** On the copy `/c/Users/youss/.claude/jobs/5b75527c/tmp/fixZ` (a CRLF clone, branch `fix`, from `ee7f7cf`; this task is its
  commit `b69fc14`, `task 1 (fixed)`). The red steps ran on the same tree with the files of the step missing (step 1, step 3),
  and the block was run against the first version of the kind (`.../fixG-scratch/oldkind`), which fails 11 of its assertions.
  Every line quoted below was printed there; the full-suite file `test/run-all.sh` was not run.

- [ ] **Step 1: Write the test, and see it red.** In `test/tools/fanout.js`, insert this block directly before the
  comment that begins `/* ==================================================== 9. l'outil de lecture`:
  ```js
    /* ==================================================== le genre grammar */
    {
      /* tools/content/kinds/grammar.js dans un dépôt à lui sous la copie, avec test/data (l'orthographe) : le
         cours y est celui d'avant la fusion, grammar.a1c.js vidé par l'écrivain du genre. Sa source est une
         règle de RULES, nommée par son id ; Split coupe les 13 en 9 lots, un par unité. */
      const GR = path.join(TMP, 'regles');
      const PIECES = ['build.sh', 'src', 'test/lib', 'test/data', 'tools'];
      PIECES.forEach(p => fs.cpSync(path.join(ROOT, p), path.join(GR, p), { recursive: true }));
      /* Le cours d'une copie tel qu'il était avant la fusion du genre grammar : le fichier vidé. */
      const beforeGrammar = dir => fs.writeFileSync(path.join(dir, 'src', 'content', 'grammar.a1c.js'),
        require(path.join(dir, 'tools', 'content', 'kinds', 'grammar')).patterns([]).map(l => l + '\n').join(''));
      beforeGrammar(GR);
      const runIn = (dir, script, args) => {
        const r = spawnSync(process.execPath, [path.join(dir, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
        return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
      };
      const runGr = (script, args) => runIn(GR, script, args);
      const copyGr = name => {
        const d = path.join(TMP, name);
        PIECES.forEach(p => fs.cpSync(path.join(GR, p), path.join(d, p), { recursive: true }));
        return d;
      };
      const K = require(path.join(GR, 'tools', 'content', 'kinds', 'grammar'));
      const CG = course(GR), ctxG = { repo: GR, course: () => CG };

      /* Le câblage : la page charge grammar.a1c.js après lexicon.a1c.js (dont les unités gardent grammar: [])
         et grammar.js, avant index.js ; test/smoke.js a sa propre liste. Un fichier absent de l'une d'elles
         ne charge rien, et rien ne le dit. */
      const src = text(path.join(ROOT, 'build.sh')).split(/\r?\n/).map(l => l.trim()), pos = f => src.indexOf('src/content/' + f);
      ok(pos('lexicon.a1c.js') >= 0 && pos('grammar.js') >= 0 && pos('grammar.a1c.js') > pos('lexicon.a1c.js') && pos('grammar.a1c.js') > pos('grammar.js') && pos('grammar.a1c.js') < pos('index.js'),
        'le SRC de build.sh charge grammar.a1c.js après lexicon.a1c.js et grammar.js, avant index.js');
      const smk = text(path.join(ROOT, 'test', 'smoke.js')), sp = f => smk.indexOf('\'src/content/' + f + '\'');
      ok(sp('lexicon.a1c.js') >= 0 && sp('grammar.js') >= 0 && sp('grammar.a1c.js') > sp('lexicon.a1c.js') && sp('grammar.a1c.js') > sp('grammar.js') && sp('grammar.a1c.js') < sp('index.js'),
        'la liste de test/smoke.js nomme grammar.a1c.js au même endroit');

      /* Les 13 règles : leurs ids, leurs unités, leurs numéros, et une instruction en anglais chacune. */
      same(K.RULES.map(r => r.id + '@' + r.unit), ['g-niet-geen@vragen', 'g-bijzin@vragen', 'g-vraag@vragen', 'g-twee-werkwoorden@kunnen', 'g-perfect-zijn@doen', 'g-was-had@doen',
        'g-deelwoord@doen', 'g-hem-haar@mensen', 'g-er-is@waar', 'g-meervoud@eten', 'g-gebiedend@cafe', 'g-verkleinwoord@wonen', 'g-om-op-in@kalender'], 'les 13 règles, leurs ids et leurs unités');
      ok(K.RULES.every(r => CG.units.find(u => u.id === r.unit).n === r.n && require('../lib/text').oneLine(r.teach) && r.teach.length > 100), 'chaque règle a le numéro de son unité et une instruction sur une ligne');
      same(K.TILES, { min: 3, max: 8 }, 'une phrase de gap compte de 3 à 8 tuiles (la plus longue de grammar.js en a 8)');
      same(K.readWhole(), 'course-written', 'toutes les lignes vont sur la liste du mainteneur');
      same([CG.RAW.patterns.length, CG.units.filter(u => u.n >= 13).every(u => (u.grammar || []).length === 0)], [9, true], 'le fichier vide ne change rien au cours : 9 règles, aucune unité 13 à 34 n\'en liste');

      /* Split : un lot par unité de RULES, une ligne par règle. */
      const DG = path.join(GR, 'drafts', 'grammar');
      same(runGr('split.js', [GR, DG]), { code: 0, lines: ['vragen 3', 'kunnen 1', 'doen 3', 'mensen 1', 'waar 1', 'eten 1', 'cafe 1', 'wonen 1', 'kalender 1'] }, 'Split coupe 9 lots et 13 lignes');
      const inputOf = (dir, id) => JSON.parse(text(path.join(dir, 'drafts', 'grammar', K.RULES.find(r => r.id === id).unit, 'input.json'))).find(r => r.id === id);
      const IN = inputOf(GR, 'g-niet-geen');
      same([IN.unit, IN.n, IN.name.en, IN.teach === K.RULES[0].teach, IN.words.length > 0], ['vragen', 13, 'Questions and small words', true, true], 'une ligne porte sa règle, son unité et les mots de l\'unité');

      /* Check : une ligne juste passe ; chaque règle refuse ce qu'elle doit. */
      const D = (nl, fr, en, gap) => ({ nl, fr, en, gap });
      const GOOD = {
        id: 'g-niet-geen',
        title: { fr: '<span class="nl">niet</span> ou <span class="nl">geen</span>', en: '<span class="nl">niet</span> or <span class="nl">geen</span>' },
        rule: { fr: '« geen » devant un nom sans article, « niet » ailleurs.', en: '“geen” before a noun with no article, “niet” elsewhere.' },
        nl: 'Ik heb geen tijd.', fr: 'Je n’ai pas de temps.', en: 'I have no time.',
        explain: {
          fr: 'Pour nier un nom sans article, on met <i class="nl">geen</i> devant : <span class="ex">Ik heb geen tijd</span>. Pour tout le reste, on met <i class="nl">niet</i> : <span class="ex">Ik werk niet</span>.',
          en: 'To negate a noun with no article, put <i class="nl">geen</i> in front: <span class="ex">Ik heb geen tijd</span>. For everything else, use <i class="nl">niet</i>: <span class="ex">Ik werk niet</span>.'
        },
        drills: [D('Ik heb geen tijd.', 'Je n’ai pas de temps.', 'I have no time.', 'geen'), D('Ik werk niet vandaag.', 'Je ne travaille pas aujourd’hui.', 'I am not working today.', 'niet'),
          D('Geen probleem voor mij.', 'Pas de problème pour moi.', 'No problem for me.', 'Geen'), D('Hij is niet thuis.', 'Il n’est pas à la maison.', 'He is not at home.', 'niet'),
          D('Wij hebben geen auto.', 'Nous n’avons pas de voiture.', 'We have no car.', 'geen')]
      };
      const chk = more => K.check(Object.assign({}, GOOD, more), IN, ctxG);
      const drillsWith = (k, d) => GOOD.drills.map((x, i) => i === k ? Object.assign({}, x, d) : x);
      same(chk({}), [], 'une ligne juste passe');
      /* Review Focus 2 : un trou en tête de phrase passe (le 3e exercice de GOOD) ; un trou écrit deux fois est refusé, avec l'exercice. */
      same(chk({ drills: drillsWith(2, { gap: 'Geen' }) }), [], 'un trou en tête de phrase est accepté');
      same(chk({ drills: drillsWith(0, { nl: 'Ik heb geen tijd en geen geld.', fr: 'Je n’ai pas de temps ni d’argent.', en: 'I have no time and no money.' }) }),
        ['drill 1 « Ik heb geen tijd en geen geld. »: gap « geen » occurs 2 times in the drill: the cloze hides the first, and the learner cannot tell which'], 'un trou écrit deux fois est refusé, en nommant l\'exercice');
      same(chk({ drills: drillsWith(0, { gap: 'heb geen' }) }), ['drill 1 « Ik heb geen tijd. »: gap « heb geen » is not one tile: the cloze hides one word'], 'un trou de deux tuiles est refusé');
      same(chk({ drills: drillsWith(0, { nl: 'Geen tijd.', fr: 'Pas de temps.', en: 'No time.', gap: 'Geen' }) }),
        ['drill 1 « Geen tijd. » has 2 tiles: 3 to 8 (the longest the course has is 8)'], 'une phrase de deux tuiles est refusée');
      same(chk({ drills: drillsWith(0, { nl: 'Ik heb vandaag echt geen tijd voor jou nu.', fr: 'Je n’ai vraiment pas de temps pour toi maintenant.', en: 'I really have no time for you today now.' }) }), [
        'drill 1 « Ik heb vandaag echt geen tijd voor jou nu. » has 9 tiles: 3 to 8 (the longest the course has is 8)',
        'drill 1 « Ik heb vandaag echt geen tijd voor jou nu. » borrows from a later unit: echt',
        'drill 1 « Ik heb vandaag echt geen tijd voor jou nu. » uses forms the course never teaches: jou'], 'neuf tuiles, un mot d\'une unité à venir, une forme que le cours n\'enseigne jamais');
      same(chk({ drills: drillsWith(1, GOOD.drills[0]) }), ['drill 2 « Ik heb geen tijd. » repeats drill 1'], 'deux exercices identiques sont refusés');
      same(chk({ drills: GOOD.drills.slice(0, 4) }), ['drills is a list of 5 sentences, not 4'], 'cinq exercices exactement');
      same(chk({ drills: drillsWith(1, { nl: 'Ik werk niet vandaagx.' }) }), [
        'drill 2: « vandaagx » is not Dutch that OpenTaal or flemish.tsv knows: pick another word',
        'drill 2 « Ik werk niet vandaagx. » uses forms the course never teaches: vandaagx'], 'une forme que l\'orthographe ne connaît pas est refusée');
      same(chk({ nl: 'Ik heb "geen" tijd.' }), ['nl: nl writes the typographic apostrophe « ’ » and no straight quote'], 'aucun guillemet droit');
      same(chk({ fr: 'Je n’ai pas de {temps}.' }), ['nl: fr and en hold different digits or {…} tokens', 'nl: nl and fr hold different {…} tokens', 'nl: {temps} is not a token of the course ({naam}, {stad}, {bedrijf})'], 'un jeton {…} hors du cours est refusé');
      same(chk({ explain: { fr: 'Pour nier un nom.', en: 'To negate a noun.' } }), ['explain.fr shows no Dutch: an example goes in <span class="ex"> or <i class="nl">', 'explain.en shows no Dutch: an example goes in <span class="ex"> or <i class="nl">'],
        'une explication montre du néerlandais balisé');
      /* Un mot néerlandais qui est aussi un mot du français (« en ») n'est pas du néerlandais laissé nu : seul un mot du
         cours que le français et l'anglais écrivent tous deux l'est. */
      same(chk({ explain: { fr: GOOD.explain.fr + ' Rien ne se passe en double.', en: GOOD.explain.en }, drills: drillsWith(1, { nl: 'Ik werk en jij werkt.', fr: 'Je travaille et tu travailles.', en: 'I work and you work.', gap: 'werkt' }) }), [], 'un mot néerlandais qui est aussi français passe dans la prose');
      /* Ce que test/lang.js 6d refuserait à Merge (test/lib/quoted.js) : une traduction citée, un mot du cours nu des deux côtés. */
      same(chk({ rule: { fr: '« voilà » devant un nom sans article.', en: '“here you are” before a noun.' } }), [
        'rule.fr quotes « voilà », which is not Dutch of the course: a translation goes in parentheses, with no quotes',
        'rule.en quotes « here you are », which is not Dutch of the course: a translation goes in parentheses, with no quotes'], 'une citation qui n\'est pas du néerlandais du cours est refusée dans rule');
      same(chk({ explain: { fr: GOOD.explain.fr + ' Cela veut dire « pas de ».', en: GOOD.explain.en + ' It means “no”.' } }), [
        'explain.fr quotes « pas de », which is not Dutch of the course: a translation goes in parentheses, with no quotes',
        'explain.en quotes « no », which is not Dutch of the course: a translation goes in parentheses, with no quotes'], 'une citation qui n\'est pas du néerlandais du cours est refusée dans explain');
      same(chk({ explain: { fr: GOOD.explain.fr + ' Le mot tijd est courant.', en: GOOD.explain.en + ' The word tijd is common.' } }),
        ['explain: « tijd » is Dutch of the course, written bare in fr and in en: put it in <i class="nl"> or <span class="ex">'], 'un mot du cours écrit nu des deux côtés est refusé dans explain');
      same(chk({ rule: { fr: 'Werk devant un nom.', en: 'Werk before a noun.' } }),
        ['rule: « werk » is Dutch of the course, written bare in fr and in en: quote it « … »'], 'un mot du cours écrit nu des deux côtés est refusé dans rule');
      same(chk({ rule: { fr: '« geen » devant un nom sans article.', en: '“geen” before a noun.' } }), [], 'un mot du cours cité passe dans rule');
      same(chk({ rule: { fr: '« geen devant un nom.', en: '“geen” before a noun.' } }), ['rule.fr has a quote mark with no partner, or an empty quote'], 'un guillemet sans son pendant est refusé');
      /* L'exemple de la règle suit l'ordre du cours, comme un exercice. */
      same(chk({ nl: 'Ik zie jou.', fr: 'Je te vois.', en: 'I see you.' }), ['nl « Ik zie jou. » uses forms the course never teaches: zie, jou'], 'l\'exemple d\'une forme que le cours n\'enseigne pas est refusé');
      same(chk({ nl: 'Ik heb vandaag echt geen tijd voor jou nu.', fr: 'Je n’ai vraiment pas de temps pour toi maintenant.', en: 'I really have no time for you today now.' }), [
        'nl « Ik heb vandaag echt geen tijd voor jou nu. » borrows from a later unit: echt',
        'nl « Ik heb vandaag echt geen tijd voor jou nu. » uses forms the course never teaches: jou'], 'l\'exemple d\'une unité à venir est refusé');
      /* Une phrase qu'une autre règle écrit déjà : un lot frère (retry.json au lieu de draft.json), un pattern du cours. */
      const XB = path.join(TMP, 'regles-lots', 'grammar');
      const asRule = (id, more) => Object.assign({}, GOOD, { id }, more);
      ['vragen', 'kunnen'].forEach(b => fs.mkdirSync(path.join(XB, b), { recursive: true }));
      put(path.join(XB, 'vragen'), 'draft.json', [asRule('g-bijzin', {})]);
      put(path.join(XB, 'kunnen'), 'draft.json', [asRule('g-twee-werkwoorden', {})]);
      const ctxX = { repo: GR, course: () => CG, kindDir: XB, batchDir: path.join(XB, 'vragen') };
      const clash = (id, row) => K.check(Object.assign({}, GOOD, { id }, row || {}), inputOf(GR, id), ctxX).filter(w => /is also written by/.test(w));
      same(clash('g-vraag'), [
        'nl « Ik heb geen tijd. » is also written by g-bijzin', 'drill 1 « Ik heb geen tijd. » is also written by g-bijzin', 'drill 2 « Ik werk niet vandaag. » is also written by g-bijzin',
        'drill 3 « Geen probleem voor mij. » is also written by g-bijzin', 'drill 4 « Hij is niet thuis. » is also written by g-bijzin', 'drill 5 « Wij hebben geen auto. » is also written by g-bijzin'],
        'une phrase qu\'une règle plus haut dans RULES écrit déjà, dans le lot ou dans un autre, est refusée, avec la règle');
      same(clash('g-niet-geen'), [], 'la règle la plus haute n\'est refusée par aucune règle plus bas');
      put(path.join(XB, 'vragen'), 'retry.json', [asRule('g-bijzin', { nl: 'Ik werk niet.', fr: 'Je ne travaille pas.', en: 'I do not work.', drills: GOOD.drills.map((d, i) => i === 4 ? d : Object.assign({}, d, { nl: 'Zij werkt ' + ['hier', 'niet', 'veel', 'thuis'][i] + '.' })) })]);
      same(clash('g-vraag'), ['drill 5 « Wij hebben geen auto. » is also written by g-bijzin'], 'retry.json remplace la ligne du même id : seules les phrases de la reprise sont lues');
      const handP = CG.RAW.patterns[0], hd = handP.drills[0];
      same(chk({ drills: drillsWith(0, { nl: hd.nl, fr: hd.fr, en: hd.en, gap: hd.gap }) }).filter(w => /is also written by/.test(w)),
        ['drill 1 « ' + hd.nl + ' » is also written by ' + handP.id], 'une phrase d\'exercice d\'un pattern du cours est refusée, avec le pattern');
      same(chk({ rule: { fr: 'x'.repeat(71), en: 'ok' } }), ['rule.fr is 71 signs, 70 at most: the sheet shows it on one line'], 'la règle tient sur une ligne');

      /* Review Focus 3 et 4 : une unité que le cours n'a pas, un id que le cours a déjà. Chaque cas est une copie dont on change le genre ou le cours. */
      const rewrite = (dir, file, from, to) => {
        const f = path.join(dir, file), t = text(f);
        ok(t.indexOf(from) >= 0, 'le texte à changer est dans ' + file + ' : ' + from);
        fs.writeFileSync(f, t.replace(from, to));
      };
      const KIND = path.join('tools', 'content', 'kinds', 'grammar.js');
      const U1 = copyGr('regles-unite');
      rewrite(U1, KIND, "id: 'g-niet-geen', unit: 'vragen'", "id: 'g-niet-geen', unit: 'zzz'");
      same(runIn(U1, 'split.js', [U1, path.join(U1, 'drafts', 'grammar')]),
        { code: 1, lines: ['fail grammar -: the kind\'s split threw: rule g-niet-geen is listed on the unit « zzz », which is not a unit of the course'] }, 'Split refuse une unité que le cours n\'a pas, en la nommant');
      const H1 = copyGr('regles-main');
      rewrite(H1, path.join('src', 'content', 'grammar.js'), "id: 'g-v2', unit: 'overleven'", "id: 'g-niet-geen', unit: 'overleven'");
      same(runIn(H1, 'split.js', [H1, path.join(H1, 'drafts', 'grammar')]),
        { code: 1, lines: ['fail grammar -: the kind\'s split threw: rule g-niet-geen is already the id of a pattern of src/content/grammar.js: an id is fixed once shipped'] }, 'Split refuse un id que grammar.js a déjà');
      const I1 = copyGr('regles-item');
      rewrite(I1, KIND, "id: 'g-niet-geen', unit: 'vragen'", "id: 'overleven:w1', unit: 'vragen'");
      const itemLine = runIn(I1, 'split.js', [I1, path.join(I1, 'drafts', 'grammar')]);
      same([itemLine.code, itemLine.lines.length, /^fail grammar -: the kind's split threw: rule overleven:w1 is already the id of the item overleven:w1 « .+ » of the course$/.test(itemLine.lines[0] || '')], [1, 1, true], 'Split refuse un id d\'élément du cours, en nommant les deux');

      /* Review Focus 3, côté Merge : write refuse la même unité inconnue et le même numéro faux, et deux règles qui écrivent une phrase
         (Check ne voit que les lots déjà écrits). Ces gardes n'ont pas de « vieux code » : le genre n'existait pas. */
      const takeOf = id => ({ id, row: GOOD });
      const r0 = K.RULES[0];
      try {
        r0.unit = 'zzz';
        throws(() => K.write([takeOf('g-niet-geen')], ctxG), /rule g-niet-geen is listed on the unit « zzz », which is not a unit of the course/, 'Merge refuse une unité que le cours n\'a pas, en la nommant');
        r0.unit = 'vragen'; r0.n = 99;
        throws(() => K.write([takeOf('g-niet-geen')], ctxG), /rule g-niet-geen is listed on the unit « vragen » as n 99, and the course numbers it 13/, 'Merge refuse un numéro d\'unité faux');
      } finally { r0.unit = 'vragen'; r0.n = 13; }
      throws(() => K.write([takeOf('g-niet-geen'), takeOf('g-bijzin')], ctxG), /g-bijzin and g-niet-geen both write « Ik heb geen tijd\. ».*: one sentence, one rule/, 'Merge refuse deux règles qui écrivent la même phrase');

      /* La boucle de chargement : la règle dans une unité absente lève une erreur qui nomme la règle et l'unité, et
         test/smoke.js échoue sur elle ; avec l'unité, la règle est rangée dans la liste de son unité. */
      const withRule = unit => K.patterns([{ rule: { id: 'g-niet-geen', unit }, row: GOOD, level: 'A1' }]).map(l => l + '\n').join('');
      const load = (code, units) => {
        const NLs = { content: { units, patterns: [] }, gloss: { pair: g => ({ fr: g.fr, en: g.en }) } };
        new Function('NL', code)(NLs);
        return NLs.content;
      };
      throws(() => load(withRule('zzz'), [{ id: 'vragen' }]), /g-niet-geen.*zzz/, 'le chargement lève une erreur qui nomme la règle et l\'unité');
      const loaded = load(withRule('vragen'), [{ id: 'vragen', grammar: [] }]);
      same([loaded.patterns.length, loaded.patterns[0].id, loaded.units[0].grammar, loaded.patterns[0].drills.length], [1, 'g-niet-geen', ['g-niet-geen'], 5], 'avec son unité, la règle est ajoutée aux patterns et rangée dans la liste de l\'unité');
      const S1 = copyGr('regles-smoke');
      fs.mkdirSync(path.join(S1, 'test'), { recursive: true });
      fs.copyFileSync(path.join(ROOT, 'test', 'smoke.js'), path.join(S1, 'test', 'smoke.js'));
      fs.writeFileSync(path.join(S1, 'src', 'content', 'grammar.a1c.js'), withRule('zzz'));
      const sm = spawnSync(process.execPath, [path.join(S1, 'test', 'smoke.js'), S1], { encoding: 'utf8' });
      ok(sm.status !== 0 && /g-niet-geen/.test((sm.stdout || '') + (sm.stderr || '')), 'test/smoke.js échoue quand une règle de grammar.a1c.js veut une unité absente, et nomme la règle');

      /* De bout en bout, une règle : rédigée et relue, check.js, Merge, le fichier récrit et chargé, Merge relancée, un second Split. */
      const E2E = path.join(GR, 'bout-en-bout', 'grammar');
      same(runGr('split.js', [GR, E2E, 'g-niet-geen']), { code: 0, lines: ['vragen 1'] }, 'Split nommé coupe une règle');
      const dir = path.join(E2E, 'vragen'), inp = JSON.parse(text(path.join(dir, 'input.json')));
      put(dir, 'draft.json', inp.map(r => Object.assign({}, GOOD, { id: r.id, stamp: r.stamp })));
      put(dir, 'review.json', inp.map(r => ({ id: r.id, verdict: 'keep' })));
      same(runGr('check.js', [dir]).code, 0, 'le lot vragen, rédigé et relu, passe check.js');
      const GFILE = path.join(GR, 'src', 'content', 'grammar.a1c.js'), empty = text(GFILE);
      same(runGr('merge.js', [GR, E2E]), { code: 0, lines: ['ok grammar 1 taken, 0 dropped', 'ok grammar.a1c.js 1 rules in 1 units'] }, 'Merge écrit la règle');
      const merged = text(GFILE);
      ok(merged !== empty && merged.indexOf('id: \'g-niet-geen\', unit: \'vragen\', level: \'A1\'') > 0 && merged.indexOf('[\'g-niet-geen\', \'vragen\']') > 0, 'grammar.a1c.js tient la règle et la liste de son unité');
      const CM = course(GR);
      same([CM.RAW.patterns.length, CM.units.find(u => u.id === 'vragen').grammar, CM.RAW.patterns[9].drills.map(d => d.gap)], [10, ['g-niet-geen'], ['geen', 'niet', 'Geen', 'niet', 'geen']], 'la page chargée a la règle, rangée dans son unité, ses cinq trous');
      same(runGr('merge.js', [GR, E2E]), { code: 0, lines: ['ok grammar 1 taken, 0 dropped', 'ok grammar.a1c.js 1 rules in 1 units'] }, 'Merge relancée écrit la même chose');
      ok(text(GFILE) === merged, 'Merge relancée laisse le fichier à l\'identique');
      same(runGr('split.js', [GR, path.join(GR, 'apres', 'grammar')]), { code: 0, lines: ['vragen 2', 'kunnen 1', 'doen 3', 'mensen 1', 'waar 1', 'eten 1', 'cafe 1', 'wonen 1', 'kalender 1'] }, 'un second Split ne coupe plus la règle fondue');
      fs.writeFileSync(GFILE, empty);
      console.log('  grammar        ' + K.RULES.length + ' règles, ' + new Set(K.RULES.map(r => r.unit)).size + ' unités ; chaque garde, la boucle de chargement, Merge de bout en bout, relancée, second Split');
    }
  ```
  Then
  ```
  node test/tools/fanout.js .
  ```
  Expected: exit 1 and, among the first lines, the line `CRASH Error: Cannot find module '…\regles\tools\content\kinds\grammar'`
  (the temporary folder's name differs; it is line 14 of the 26 lines the run prints, the twelve lines of the blocks before it
  and a header, then the stack trace). The suite stops there.

- [ ] **Step 2: Create the shared module, and make `test/lang.js` call it.** Write `test/lib/quoted.js` with the Write tool:
  ```js
  /* Les citations et le néerlandais nu d'une prose du cours, écrits une fois : test/lang.js (6d.3, 6d.4)
     les lit sur tout le cours, et les genres grammar et scenarios (tools/content/kinds/) les appellent
     sur une ligne avant qu'elle soit fondue, pour que Check refuse ce que 6d refuserait à Merge. Ce
     module ne lit pas les champs de prose (test/lib/prose.js) ni les citations d'une note de mot
     (quotes, test/lib/text.js) : il dit si ce qu'une prose cite est du néerlandais du cours, et si elle
     en laisse nu.

       const { QUOTE_OK, SHARED_OK, QUOTED_FIELDS, HTML_FIELDS, names, quotedSegments, foreignQuotes, bareDutch }
         = require('./lib/quoted');
       QUOTE_OK        les mots cités hors du néerlandais du cours qui sont pourtant du néerlandais, avec la raison
       SHARED_OK       les mots que le français et l'anglais écrivent tous deux et que le cours a aussi, avec la raison
       QUOTED_FIELDS   les champs de texte simple qui citent : NL.gloss.quoted les montre
       HTML_FIELDS     les champs écrits en HTML : NL.gloss.prose les montre
       names(NL)       un Set des mots des noms que {naam}, {stad} et {bedrijf} prennent par défaut
       quotedSegments(NL, text)
                       les passages que NL.gloss.quoted marque nl-BE dans `text` (un texte sans balises), dans
                       l'ordre, avec les caractères que l'écran échappe rendus
       foreignQuotes(NL, text, dutch, excuse)
                       { foreign, excused, paired } : foreign, les passages cités de `text` dont un mot n'est ni
                       dans `dutch` (un Set de mots en minuscules, dutchWords de test/lib/dutch plus ce que
                       l'appelant tient pour du néerlandais), ni un chiffre, ni un affixe cité avec son tiret,
                       ni dans QUOTE_OK ; excused, les mots de QUOTE_OK que ces passages ont employés ; paired,
                       vrai quand chaque guillemet ouvert est fermé et que NL.gloss.quoted marque autant de
                       passages. excuse(passage), s'il est donné, rend vrai pour un passage que l'appelant
                       accepte (la citation d'une note que l'autre langue cite aussi)
       bareDutch(NL, dutch, named, field, fr, en)
                       { bare, shared } : les mots du néerlandais du cours (`dutch`) que les côtés fr et en
                       d'un même champ écrivent tous deux hors de tout passage nl-BE, sans les mots de `named` :
                       bare, ceux qu'aucune exception de SHARED_OK n'excuse ; shared, ceux qu'elle excuse.
                       `field` dit comment l'écran montre le texte (HTML_FIELDS : NL.gloss.prose ; sinon
                       NL.gloss.quoted) ; fr et en sont les textes écrits, jetons déjà remplis (NL.content.fill) */
  const { words } = require('./dutch');
  const { runs } = require('./langs');

  /* Les champs de prose qui citent (NL.gloss.quoted les marque), et ceux qui sont du HTML (NL.gloss.prose).
     g est la tête d'une ligne de la table des sons. */
  const QUOTED_FIELDS = ['note', 'blurb', 'rule', 'ask', 'what', 'outro', 'hint', 'trap'];
  const HTML_FIELDS = ['explain', 'say', 'title', 'h', 'g'];
  /* Les mots cités hors du néerlandais du cours qui sont pourtant du néerlandais, avec la raison. Une note
     de mot ou de phrase n'en a pas besoin pour un mot que l'orthographe connaît et qu'elle cite dans ses
     deux langues (6d.3). Cette table, SHARED_OK et SOUND_OK (test/lang.js) n'ont pas de prototype : un mot lu
     « constructor » ou « toString » n'y est pas listé. */
  const QUOTE_OK = Object.assign(Object.create(null), {
    pardon: 'le nord pour excuseer, dans la note d’un choix de la conversation du train',
    jam: 'le nord pour de confituur, dans sa note d’emprunt',
    vrachtwagen: 'l’écrit pour de camion, dans sa note d’emprunt',
    bijgevoegd: 'le nord pour « in bijlage », dans une note de la fiche des mails',
    werke: 'werken tel qu’il se dit, n final tombé, dans la table des sons',
    lope: 'lopen tel qu’il se dit, n final tombé, dans la table des sons',
    uiteindelijk: 'ce que veut dire eventually, dans le piège de eventueel',
    slank: 'ce que veut dire slim (svelte), dans le piège de slim',
    zeldzaam: 'ce que veut dire rare, dans le piège de raar',
    merk: '« het merk », ce que veut dire brand (une marque), dans le piège de de brand',
    plattegrond: '« de plattegrond », ce que veut dire map (un plan), dans le piège de de map'
  });
  /* Les mots que le français et l'anglais écrivent tous deux et que le cours a aussi en néerlandais :
     l'anglais du bureau, une marque, un article. 6d.4 ne les prend pas pour du néerlandais laissé nu. */
  const SHARED_OK = Object.assign(Object.create(null), {
    a: 'le verbe avoir et l’article anglais ; le cours ne l’a que comme lettre, « de a »',
    ticket: 'l’anglais du bureau, le même en français et en anglais, dans la présentation de l’unité du travail',
    build: 'l’anglais du bureau, le même en français et en anglais, dans deux présentations',
    code: 'l’anglais du bureau, le même en français et en anglais, dans la présentation d’une fiche',
    bancontact: 'la carte de paiement belge, une marque, dans la présentation de l’unité des courses',
    stand: '« stand-up », la réunion du matin, en français comme en anglais',
    up: '« stand-up », la réunion du matin, en français comme en anglais',
    contact: '« premier contact », “first contact”, dans une note de la fiche des mails',
    direct: '« Être direct », “Being direct”, dans une note de la conversation sur les délais',
    t: 'la lettre t, nommée de même en français et en anglais, dans les notes de « Dat was plezant. », « Wat betekent dat? », « acht » et « komen »',
    s: 'la lettre s, nommée de même en français et en anglais, dans la note de « Niks speciaals, en bij u? »',
    o: 'la lettre o, nommée de même en français et en anglais, dans la note de « goedkoop »',
    film: 'un film se regarde, en français comme en anglais, dans la note de « kijken »'
  });

  /* Les mots des noms que {naam}, {stad} et {bedrijf} prennent par défaut, que l'en-tête montre. */
  const names = NL => new Set([].concat(...Object.keys(NL.content.DEFAULTS).map(k => words(String(NL.content.DEFAULTS[k])))));

  const unescape = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const quotedSegments = (NL, text) => Array.from(NL.gloss.quoted(text).matchAll(/<span lang="nl-BE">([^<]*)<\/span>/g), m => unescape(m[1]));

  function foreignQuotes(NL, text, dutch, excuse) {
    const opened = text.split(/[«“]/).length - 1, closed = text.split(/[»”]/).length - 1;
    const segs = quotedSegments(NL, text), foreign = [], excused = new Set();
    segs.forEach(q => {
      if (excuse && excuse(q)) return;
      const affixes = q.split(/[\s,\/…]+|\.{2,}/).filter(t => /^-\p{L}+$|^\p{L}+-$/u.test(t)).map(t => t.replace('-', '').toLowerCase());
      const miss = words(q).filter(w => !dutch.has(w) && affixes.indexOf(w) < 0 && !/^\d+$/.test(w));
      miss.forEach(w => { if (QUOTE_OK[w]) excused.add(w); });
      if (miss.some(w => !QUOTE_OK[w])) foreign.push(q);
    });
    return { foreign, excused: Array.from(excused), paired: segs.length === opened && opened === closed };
  }

  function bareDutch(NL, dutch, named, field, fr, en) {
    const bare = (s, l) => new Set([].concat(...runs(HTML_FIELDS.indexOf(field) >= 0 ? NL.gloss.prose(s) : NL.gloss.quoted(s), l)
      .filter(r => r.lang !== 'nl-BE').map(r => words(r.text))));
    const other = bare(en, 'en');
    const both = Array.from(bare(fr, 'fr')).filter(w => other.has(w) && dutch.has(w) && !named.has(w));
    return { bare: both.filter(w => !SHARED_OK[w]), shared: both.filter(w => SHARED_OK[w]) };
  }

  module.exports = { QUOTE_OK, SHARED_OK, QUOTED_FIELDS, HTML_FIELDS, names, quotedSegments, foreignQuotes, bareDutch };
  ```
  Then edit `test/lang.js` by this diff (the module's code is the code it removes, moved; nothing else in the file
  changes). The names it no longer defines (`QUOTED_FIELDS`, `HTML_FIELDS`, `QUOTE_OK`, `SHARED_OK`, `names`, `unescape`)
  come from the `require`; the reference tables, `SOUND_OK`, the plants and the counts stay:
  ```diff
  --- a/test/lang.js
  +++ b/test/lang.js
  @@ -6,6 +6,7 @@ const browser = require('./lib/browser');
   const { PROSE } = require('./lib/prose');
   const tree = require('./lib/tree');
   const { dutchWords, words } = require('./lib/dutch');
  +const { SHARED_OK, QUOTED_FIELDS, HTML_FIELDS, names, quotedSegments, foreignQuotes, bareDutch, QUOTE_OK } = require('./lib/quoted');
   const spelling = require('./lib/spelling');
   const { text, joined, runs, count, argsOf } = require('./lib/langs');
   const { fakeSupabase } = require('./lib/supabase');
  @@ -911,46 +912,9 @@ function displayChecks() {
      {bedrijf}), reste du texte échappé (6d.7). Les tables de référence, écrites dans une
      seule langue (NL.content.anchors), se lisent de même : say, la prose des sons, comme explain ;
      trap, le piège d'un faux ami, comme une note. */
  -const QUOTED_FIELDS = ['note', 'blurb', 'rule', 'ask', 'what', 'outro', 'hint', 'trap'];
  -/* Les champs écrits en HTML, montrés par NL.gloss.prose : g est la tête d'une ligne de la table des sons. */
  -const HTML_FIELDS = ['explain', 'say', 'title', 'h', 'g'];
   /* Les tables de référence (src/content/reference.js) lues avec le cours : les emprunts, les sons et les
      deux tables de faux amis. C.TABLES, lui, donne les tables par le néerlandais (byDutch). */
   const REFERENCE_TABLES = ['loans', 'sounds', 'faux', 'fauxEn'];
  -/* Les mots cités hors du néerlandais du cours qui sont pourtant du néerlandais, avec la raison. Une note
  -   de mot ou de phrase n'en a pas besoin pour un mot que l'orthographe connaît et qu'elle cite dans ses
  -   deux langues (6d.3). Cette table, SHARED_OK et SOUND_OK n'ont pas de prototype : un mot lu
  -   « constructor » ou « toString » n'y est pas listé. */
  -const QUOTE_OK = Object.assign(Object.create(null), {
  -  pardon: 'le nord pour excuseer, dans la note d’un choix de la conversation du train',
  -  jam: 'le nord pour de confituur, dans sa note d’emprunt',
  -  vrachtwagen: 'l’écrit pour de camion, dans sa note d’emprunt',
  -  bijgevoegd: 'le nord pour « in bijlage », dans une note de la fiche des mails',
  -  werke: 'werken tel qu’il se dit, n final tombé, dans la table des sons',
  -  lope: 'lopen tel qu’il se dit, n final tombé, dans la table des sons',
  -  uiteindelijk: 'ce que veut dire eventually, dans le piège de eventueel',
  -  slank: 'ce que veut dire slim (svelte), dans le piège de slim',
  -  zeldzaam: 'ce que veut dire rare, dans le piège de raar',
  -  merk: '« het merk », ce que veut dire brand (une marque), dans le piège de de brand',
  -  plattegrond: '« de plattegrond », ce que veut dire map (un plan), dans le piège de de map'
  -});
  -/* Les mots que le français et l'anglais écrivent tous deux et que le cours a aussi en néerlandais :
  -   l'anglais du bureau, une marque, un article. 6d.4 ne les prend pas pour du néerlandais laissé nu. */
  -const SHARED_OK = Object.assign(Object.create(null), {
  -  a: 'le verbe avoir et l’article anglais ; le cours ne l’a que comme lettre, « de a »',
  -  ticket: 'l’anglais du bureau, le même en français et en anglais, dans la présentation de l’unité du travail',
  -  build: 'l’anglais du bureau, le même en français et en anglais, dans deux présentations',
  -  code: 'l’anglais du bureau, le même en français et en anglais, dans la présentation d’une fiche',
  -  bancontact: 'la carte de paiement belge, une marque, dans la présentation de l’unité des courses',
  -  stand: '« stand-up », la réunion du matin, en français comme en anglais',
  -  up: '« stand-up », la réunion du matin, en français comme en anglais',
  -  contact: '« premier contact », “first contact”, dans une note de la fiche des mails',
  -  direct: '« Être direct », “Being direct”, dans une note de la conversation sur les délais',
  -  t: 'la lettre t, nommée de même en français et en anglais, dans les notes de « Dat was plezant. », « Wat betekent dat? », « acht » et « komen »',
  -  s: 'la lettre s, nommée de même en français et en anglais, dans la note de « Niks speciaals, en bij u? »',
  -  o: 'la lettre o, nommée de même en français et en anglais, dans la note de « goedkoop »',
  -  film: 'un film se regarde, en français comme en anglais, dans la note de « kijken »'
  -});
   /* Ce que la table des sons met en gras sans le déclarer néerlandais : la lettre ou le mot auquel elle
      compare un son, français (une fois, le w anglais), avec la raison (D5). Le reste de son gras est
      du néerlandais déclaré nl-BE : l'orthographe du son enseigné, ou la syllabe accentuée d'un
  @@ -984,8 +948,6 @@ function eachText(C, fn) {
     REFERENCE_TABLES.forEach(k => tree.visit(C[k], read, k, k));
   }
   function quoteChecks() {
  -  /* Les mots des noms que {naam}, {stad} et {bedrijf} prennent par défaut, que l'en-tête montre. */
  -  const names = NL => new Set([].concat(...Object.keys(NL.content.DEFAULTS).map(k => words(String(NL.content.DEFAULTS[k])))));
     /* 6d.1. La note de trager cite « trager » et « langzamer » : dans le pied d'une réponse fausse,
        chacun est déclaré nl-BE, guillemets dehors, en français comme en anglais. */
     const footNote = (l, to, want) => {
  @@ -1062,7 +1024,6 @@ function quoteChecks() {
       return B.NL.state.open().then(() => {
         const NL = B.NL, Q = NL.gloss.quoted, dutch = dutchWords(NL), S = spelling.open(ROOT, NL);
         if (typeof Q !== 'function') { ok(false, '6d : NL.gloss.quoted manque'); return; }
  -      const unescape = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
         const foreign = [], excused = new Set();
         /* Deux notes plantées, sous des clés qu'aucun élément n'a : l'une cite en français et en anglais un
            mot que l'orthographe connaît et que le cours n'enseigne pas, l'autre en français seulement. Le
  @@ -1076,18 +1037,13 @@ function quoteChecks() {
           const t = HTML_FIELDS.indexOf(f) >= 0 ? joined(s) : s;
           const opened = t.split(/[«“]/).length - 1, closed = t.split(/[»”]/).length - 1;
           if (QUOTED_FIELDS.indexOf(f) < 0 && f !== 'explain' && f !== 'say') { ok(opened + closed === 0, '6d : ' + where + ' cite, mais ' + f + ' ne passe pas par NL.gloss.quoted : « ' + s + ' »'); return; }
  -        const segs = Array.from(Q(t).matchAll(/<span lang="nl-BE">([^<]*)<\/span>/g), m => unescape(m[1]));
  -        ok(segs.length === opened && opened === closed, '6d : ' + where + ' a un guillemet sans son pendant, ou une citation vide : « ' + s + ' »');
           const note = /^byDutch\.notes(\[.*\])\.(fr|en)$/.exec(where);
           const side = note && (notes[JSON.parse(note[1])[0]] || {})[note[2] === 'fr' ? 'en' : 'fr'];
  -        const other = typeof side === 'string' ? Array.from(Q(side).matchAll(/<span lang="nl-BE">([^<]*)<\/span>/g), m => NL.util.norm(unescape(m[1]))) : [];
  -        segs.forEach(q => {
  -          if (other.indexOf(NL.util.norm(q)) >= 0 && spelling.tokens(q).every(w => S.known(w) || dutch.has(w))) return;
  -          const affixes = q.split(/[\s,\/…]+|\.{2,}/).filter(t => /^-\p{L}+$|^\p{L}+-$/u.test(t)).map(t => t.replace('-', '').toLowerCase());
  -          const miss = words(q).filter(w => !dutch.has(w) && affixes.indexOf(w) < 0 && !/^\d+$/.test(w));
  -          miss.forEach(w => { if (QUOTE_OK[w]) excused.add(w); });
  -          if (miss.some(w => !QUOTE_OK[w])) foreign.push(where + ' « ' + q + ' »');
  -        });
  +        const other = typeof side === 'string' ? quotedSegments(NL, side).map(q => NL.util.norm(q)) : [];
  +        const r = foreignQuotes(NL, t, dutch, q => other.indexOf(NL.util.norm(q)) >= 0 && spelling.tokens(q).every(w => S.known(w) || dutch.has(w)));
  +        ok(r.paired, '6d : ' + where + ' a un guillemet sans son pendant, ou une citation vide : « ' + s + ' »');
  +        r.excused.forEach(w => excused.add(w));
  +        r.foreign.forEach(q => foreign.push(where + ' « ' + q + ' »'));
         });
         const plants = foreign.filter(x => /^byDutch\.notes\["zq\d"\]/.test(x));
         ok(plants.join(' ; ') === 'byDutch.notes["zq2"].fr « ' + plant + ' »', '6d : une note cite « ' + plant + ' », que l’orthographe connaît, ' +
  @@ -1113,17 +1069,14 @@ function quoteChecks() {
       const B = boot();
       return B.NL.state.open().then(() => {
         const NL = B.NL, dutch = dutchWords(NL), named = names(NL), shared = new Set(), nu = [];
  -      const bare = (f, s, l) => new Set([].concat(...runs(HTML_FIELDS.indexOf(f) >= 0 ? NL.gloss.prose(s) : NL.gloss.quoted(s), l)
  -        .filter(r => r.lang !== 'nl-BE').map(r => words(r.text))));
         let fields = 0;
         tree.visitCourse(NL.content, (v, key, where) => {
           if (!v || typeof v !== 'object' || typeof v.fr !== 'string' || typeof v.en !== 'string') return;
           if (QUOTED_FIELDS.indexOf(key) < 0 && HTML_FIELDS.indexOf(key) < 0) return;
           fields++;
  -        const en = bare(key, NL.content.fill(v.en), 'en');
  -        const both = Array.from(bare(key, NL.content.fill(v.fr), 'fr')).filter(w => en.has(w) && dutch.has(w) && !named.has(w));
  -        both.forEach(w => { if (SHARED_OK[w]) shared.add(w); });
  -        if (both.some(w => !SHARED_OK[w])) nu.push(where + ' [' + both.filter(w => !SHARED_OK[w]).join(', ') + ']');
  +        const r = bareDutch(NL, dutch, named, key, NL.content.fill(v.fr), NL.content.fill(v.en));
  +        r.shared.forEach(w => shared.add(w));
  +        if (r.bare.length) nu.push(where + ' [' + r.bare.join(', ') + ']');
         });
         nu.forEach(n => ok(false, '6d : ' + n + ' : du néerlandais du cours, écrit pareil en français et en anglais hors de nl-BE — le citer, ou dans un champ HTML (' + HTML_FIELDS.join(', ') + ') lui donner class="nl"'));
         Object.keys(SHARED_OK).forEach(w => ok(shared.has(w), '6d : « ' + w + ' » n’est plus écrit pareil dans les deux langues, ou plus du néerlandais du cours : son exception est de trop'));
  ```
  No red here: it is a refactor, so no test can fail on the old code. Check that the file still parses:
  `node --check test/lang.js`. `node test/lang.js .` is its check, and it runs once, at step 8.

- [ ] **Step 3: Create the kind.** Write `tools/content/kinds/grammar.js` with the Write tool:
  ```js
  /* Le genre grammar : les règles de grammaire des unités 13 à 34 que le cours n'a pas encore (RULES,
     les 13 règles du plan 4b). La tâche « FAN grammar » du plan en écrit les lignes ; ce module les
     coupe, les vérifie et les fond (tools/content/lib/kit.js). Sa source n'est pas un élément du cours
     mais une règle à venir (sourceOf) : une ligne est un pattern entier, « g-… », moins ce que
     l'entrée fixe (son id, son unité, son niveau). Une ligne écrite porte sept champs :
       title, rule  { fr, en } : le titre et la règle en une phrase (rule : 70 signes au plus)
       nl, fr, en   l'exemple de la règle, en néerlandais puis en français et en anglais
       explain      { fr, en } : l'explication, en HTML de quatre balises (<b>, <i>, <i class="nl">,
                    <span class="ex">), 876 signes au plus par langue ; le néerlandais y est dans
                    <i class="nl"> ou <span class="ex">
       drills       5 phrases { nl, fr, en, gap } : gap est une tuile de nl, une seule fois
     Merge n'écrit aucune table : son write récrit src/content/grammar.a1c.js entier, depuis RULES et
     les lignes prises dans l'ordre de RULES : les patterns, puis une boucle qui range chaque id dans la
     liste grammar de son unité au chargement (les unités de lexicon.a1c.js gardent grammar: [] dans
     leur fichier). L'empreinte ne couvre rien que Merge écrive : relancée, elle récrit le même
     fichier. Les lignes imprimées sont en anglais, comme celles du kit. */
  const fs = require('fs'), path = require('path');
  const sequence = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'sequence'));
  const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
  const { literal: lit } = require('../lib/table');
  const { oneLine, sig, untoken, strayQuotes } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));
  const { dutchWords, words } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));
  const { joined } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'langs'));
  const { names, foreignQuotes, bareDutch } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'quoted'));
  const { tokens } = spelling;

  /* Les 13 règles, dans l'ordre du plan : à l'intérieur d'une unité, la liste grammar se lit dans cet
     ordre. Les ids sont fixés : une fois livrés, ils sont dans les enregistrements des apprenants.
     n est le numéro de l'unité (Split le confronte au cours) ; teach est la consigne du rédacteur,
     en anglais : ce que la règle enseigne, et ce à quoi elle s'oppose. */
  const RULES = [
    { id: 'g-niet-geen', unit: 'vragen', n: 13,
      teach: 'Negation with niet and geen. geen replaces een + noun and stands before a noun with no article (Ik heb geen tijd, Ik heb geen kinderen); niet negates everything else: a verb, an adjective, a place, a noun with de or het (Ik ken de man niet, Het is niet groot). niet sits late in the sentence, before a second verb, a place or an adjective (Ik kan niet komen), not right after the verb. Contrast with French ne ... pas, which does not tell the two apart.' },
    { id: 'g-bijzin', unit: 'vragen', n: 13,
      teach: 'After omdat, als and dat the conjugated verb goes to the very end of its clause (Ik blijf thuis omdat ik ziek ben; Als het regent, blijf ik thuis; Ik denk dat hij werkt). Contrast with want and maar, which keep the normal order (Ik blijf thuis want ik ben ziek), and with the main clause, where the verb is second. When the clause with als comes first, the main clause that follows starts with its verb.' },
    { id: 'g-vraag', unit: 'vragen', n: 13,
      teach: 'Questions. A yes/no question puts the verb first (Werk je vandaag?); a question with a question word puts the verb straight after it (Waar woon je? Wanneer kom je?). When je or jij follows the verb, the verb drops its -t (Werk je? Kom je? not Werkt je?), whereas Flemish ge keeps it (Werkt ge? Hebt ge?). Contrast with the French est-ce que and with inversion.' },
    { id: 'g-twee-werkwoorden', unit: 'kunnen', n: 14,
      teach: 'Two verbs in one clause. The conjugated verb (kunnen, moeten, willen, mogen, zullen, or gaan for the near future) stays second and the other verb goes to the end of the clause as an infinitive (Ik kan morgen komen; Ik moet vandaag werken; Ik ga morgen werken). Contrast with French, where the two verbs stay side by side (je peux venir demain).' },
    { id: 'g-perfect-zijn', unit: 'doen', n: 15,
      teach: 'The perfect with zijn. Verbs of movement and of change of state take zijn + participle (Ik ben naar huis gegaan; Hij is gisteren gekomen; Wij zijn lang gebleven), where most verbs take hebben (the earlier pattern g-perfect-intro). Contrast with the French list of verbs that take être, which is close but not identical.' },
    { id: 'g-was-had', unit: 'doen', n: 15,
      teach: 'Five verbs whose simple past is spoken all the time, not the whole simple past: zijn (was, waren), hebben (had, hadden), kunnen (kon, konden), moeten (moest, moesten) and willen (wou in Flemish speech, wilde in the standard language). They say how things were or what one could, had to or wanted (Ik was ziek; We hadden geen tijd; Hij kon niet komen). Contrast with the perfect, which the course already teaches for actions.' },
    { id: 'g-deelwoord', unit: 'doen', n: 15,
      teach: 'Irregular participles of everyday verbs, beside the regular ge- + stem + -t/-d (gewerkt, gemaakt): doen gedaan, nemen genomen, geven gegeven, krijgen gekregen, brengen gebracht, schrijven geschreven, zitten gezeten, staan gestaan. The participle goes to the end of the clause (Ik heb het boek genomen). Contrast with the French participles, which end in -é, -i or -u.' },
    { id: 'g-hem-haar', unit: 'mensen', n: 16,
      teach: 'Pronouns that are not the subject: hem (him) and haar (her) after a verb or a preposition (Ik zie hem; Ik bel haar; Met hem), and zich for hij, zij and ze doing something to themselves (Hij wast zich; Ze vergist zich), where ik says me and jij says je. Contrast with the French le, la, lui, elle and se.' },
    { id: 'g-er-is', unit: 'waar', n: 18,
      teach: 'Er is and er zijn say that something exists or is somewhere. The verb agrees with the thing, not with er: er is + one thing (Er is een bank in de straat), er zijn + several (Er zijn twee banken). Contrast with the French il y a, which never changes.' },
    { id: 'g-meervoud', unit: 'eten', n: 20,
      teach: 'Plurals. Nouns ending in unstressed -el, -er, -em, -en and the diminutive -je take -s (de appel, de appels; de kamer, de kamers); most others take -en, with a doubled consonant after a short vowel and one vowel less after a long one (de man, de mannen; de maaltijd, de maaltijden; het ei, de eieren); words from other languages in a vowel take an apostrophe + s (de auto, de auto\'s). Contrast with French, which mostly adds a silent -s.' },
    { id: 'g-gebiedend', unit: 'cafe', n: 21,
      teach: 'The imperative. For jij and je it is the bare stem (Kom binnen! Neem een biertje!); with u it is the stem + t and u follows (Neemt u plaats! Komt u binnen!). In a Flemish café the order is softened with maar, eens or even (Zeg het maar; Wacht even). Contrast with the French -ez / -e.' },
    { id: 'g-verkleinwoord', unit: 'wonen', n: 23,
      teach: 'A word in -je is always het. The diminutive is the noun + -je (het huis, het huisje), + -tje after l, n, r, m or a vowel (de lamp, het lampje; de stoel, het stoeltje), + -etje after a short vowel and l, n, r, m or ng (de man, het mannetje), with the plural in -s (de huisjes). Flemish uses it far more than Dutch, even for a koffie or a biertje. Contrast with French, where a diminutive never changes the gender.' },
    { id: 'g-om-op-in', unit: 'kalender', n: 24,
      teach: 'Three prepositions for time. om + a clock time (om acht uur), op + a day or a date (op maandag, op 5 mei), in + a month, a season or a year (in mei, in de zomer, in 2026). Contrast with French, which uses à for the hour, nothing for the day and en or au for the month.' }
  ];
  const UNIT_ORDER = [];
  RULES.forEach(r => { if (UNIT_ORDER.indexOf(r.unit) < 0) UNIT_ORDER.push(r.unit); });

  const FILE = path.join('src', 'content', 'grammar.a1c.js');
  const HAND = path.join('src', 'content', 'grammar.js');
  const FIELDS = ['title', 'rule', 'nl', 'fr', 'en', 'explain', 'drills'];
  const DRILL_FIELDS = ['nl', 'fr', 'en', 'gap'];
  const LANGS = ['fr', 'en'];
  const DRILLS = 5;
  /* Les tuiles d'une phrase d'exercice : le minimum d'un exercice qui se remet en ordre, et le maximum
     que le cours a (mesuré avec NL.util.tiles : g-scheidbaar, « Ik sta elke dag om zes uur op. »,
     8 tuiles ; une phrase d'exemple d'un mot en a jusqu'à 9). */
  const TILES = { min: 3, max: 8 };
  /* La longueur de ce que la feuille d'une règle affiche : la plus longue explication du cours
     (g-dehet, 876 signes avec ses balises) et une règle de 70 signes (g-v2). */
  const EXPLAIN_MAX = 876, RULE_MAX = 70;
  const OK_TOKENS = ['{naam}', '{stad}', '{bedrijf}'];
  const TITLE_TAGS = ['<span class="nl">', '</span>'];
  const EXPLAIN_TAGS = ['<b>', '</b>', '<i>', '<i class="nl">', '</i>', '<span class="ex">', '</span>'];

  /* Le cours lu pour les lignes, une fois par chargement : l'ordre des unités, la première unité de
     chaque forme (les règles déjà fondues comptent à leur unité), l'orthographe, le néerlandais du cours
     et les noms par défaut (pour les citations et le néerlandais nu, test/lib/quoted.js), et les ids que
     src/content/grammar.js écrit à la main. */
  const memo = new WeakMap();
  function tools(ctx) {
    if (!memo.has(ctx)) {
      const C = ctx.course();
      memo.set(ctx, {
        C, NL: C.NL,
        order: C.units.map(u => u.id),
        first: sequence.firstUnits(C.RAW),
        S: spelling.open(ctx.repo, C.NL),
        dutch: dutchWords(C.NL), named: names(C.NL),
        hand: new Set(Array.from(fs.readFileSync(path.join(ctx.repo, HAND), 'utf8').matchAll(/\bid:\s*'([^']+)'/g), m => m[1]))
      });
    }
    return memo.get(ctx);
  }

  const unitOf = (C, id) => C.units.find(u => u.id === id);
  /* La source d'une ligne : sa règle, dont nl est l'id, et fr et en le nom de son unité (l'outil de
     lecture les montre ; l'empreinte ne les lit pas). Une unité inconnue ne la rend pas introuvable :
     Split et Merge la refusent, en la nommant. */
  function sourceOf(C, id) {
    const r = RULES.find(x => x.id === id);
    if (!r) return undefined;
    const u = unitOf(C, r.unit), name = u ? u.name : { fr: r.unit, en: r.unit };
    return Object.assign({}, r, { nl: r.id, fr: name.fr, en: name.en });
  }

  /* Ce que le cours dit contre une règle : une unité qu'il n'a pas, ou qui n'a pas le numéro de RULES, un
     id que le cours a déjà (un pattern de src/content/grammar.js, ou un élément). Un id que seul
     grammar.a1c.js tient est une règle déjà fondue : Split la saute, elle n'est pas fautive. */
  function against(T, rules) {
    const out = [];
    rules.forEach(r => {
      const u = unitOf(T.C, r.unit);
      if (!u) out.push('rule ' + r.id + ' is listed on the unit « ' + r.unit + ' », which is not a unit of the course');
      else if (u.n !== r.n) out.push('rule ' + r.id + ' is listed on the unit « ' + r.unit + ' » as n ' + r.n + ', and the course numbers it ' + u.n);
      if (T.hand.has(r.id)) out.push('rule ' + r.id + ' is already the id of a pattern of src/content/grammar.js: an id is fixed once shipped');
      const it = T.C.byId(r.id);
      if (it) out.push('rule ' + r.id + ' is already the id of the item ' + it.id + ' « ' + it.nl + ' » of the course');
    });
    return out;
  }

  /* Split : un lot par unité de RULES, ses règles que le cours n'a pas encore, une ligne par règle. Une
     règle déjà fondue est dans le cours : un second Split ne la coupe pas, même nommée (le kit refuse
     alors l'id, comme pour words). L'entrée porte les mots de l'unité, que le rédacteur peut employer. */
  function split(C, ctx) {
    const T = tools(ctx), problems = against(T, RULES);
    if (problems.length) throw new Error(problems.join('; '));
    const have = new Set((C.RAW.patterns || []).map(p => p.id));
    return UNIT_ORDER.map(unit => ({
      batch: unit,
      rows: RULES.filter(r => r.unit === unit && !have.has(r.id)).map(r => {
        const u = unitOf(C, unit);
        return { id: r.id, unit, n: r.n, name: u.name, teach: r.teach, words: (u.words || []).map(w => w.nl) };
      })
    })).filter(b => b.rows.length);
  }

  const gloss = (v, f, why) => {
    if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).sort().join() !== 'en,fr') { why.push(f + ' is { fr, en }'); return false; }
    return LANGS.every(l => oneLine(v[l]) || (why.push(f + '.' + l + ' is a text on one line with no space at either end'), false));
  };

  /* Un passage en HTML : ses balises contre la liste permise, leur emboîtement, et le texte qu'elles
     marquent comme néerlandais (<i class="nl">, <span class="ex">) et celui qu'elles ne marquent pas. */
  function markup(s, allowed) {
    const why = [], stack = [], marked = [], plain = [], re = /<[^>]*>|[<>]/g;
    let last = 0, m;
    const put = text => { if (text) (stack.some(t => t.mark) ? marked : plain).push(text); };
    while ((m = re.exec(s))) {
      put(s.slice(last, m.index));
      last = re.lastIndex;
      const tag = m[0];
      if (allowed.indexOf(tag) < 0) { why.push(tag + ' is not a tag the sheet allows (' + allowed.join(' ') + ')'); continue; }
      if (tag[1] === '/') {
        const top = stack.pop();
        if (!top || top.name !== tag.slice(2, -1)) why.push(tag + ' closes nothing that is open');
      } else stack.push({ name: /^<(\w+)/.exec(tag)[1], mark: tag === '<i class="nl">' || tag === '<span class="ex">' });
    }
    put(s.slice(last));
    stack.forEach(t => why.push('<' + t.name + '> is never closed'));
    return { why, marked: marked.join(' '), plain: plain.join(' '), spans: (s.match(/<span class="ex">|<i class="nl">/g) || []).length };
  }
  const iTags = s => Array.from(String(s).matchAll(/<i(?:\s[^>]*)?>([^<]*)<\/i>/g), m => ({ tag: m[0], text: m[1] }));
  const braces = s => (String(s).match(/\{[^}]*\}/g) || []).sort().join('|');

  function check(row, input, ctx) {
    const why = [];
    if (!FIELDS.every(f => f in row)) return ['a row has the fields ' + FIELDS.join(', ')];
    ['title', 'rule', 'explain'].forEach(f => gloss(row[f], f, why));
    ['nl', 'fr', 'en'].forEach(f => { if (!oneLine(row[f])) why.push(f + ' is a text on one line with no space at either end'); });
    if (!Array.isArray(row.drills) || row.drills.length !== DRILLS) why.push('drills is a list of ' + DRILLS + ' sentences, not ' + (Array.isArray(row.drills) ? row.drills.length : typeof row.drills));
    else row.drills.forEach((d, j) => {
      if (!d || typeof d !== 'object' || Array.isArray(d) || Object.keys(d).sort().join() !== DRILL_FIELDS.slice().sort().join()) why.push('drill ' + (j + 1) + ' has the fields ' + DRILL_FIELDS.join(', '));
      else DRILL_FIELDS.forEach(f => { if (!oneLine(d[f])) why.push('drill ' + (j + 1) + ': ' + f + ' is a text on one line with no space at either end'); });
    });
    if (why.length) return why;

    const T = tools(ctx), U = T.NL.util, ui = T.order.indexOf(input.unit);
    const list = ws => ws.map(w => '« ' + w + ' »').join(', ');
    const unitProblems = against(T, RULES.filter(r => r.id === input.id));
    const sentences = [['nl', row.nl, row.fr, row.en]].concat(row.drills.map((d, j) => ['drill ' + (j + 1), d.nl, d.fr, d.en]));

    /* Les mots de la ligne : typographie, jetons, orthographe, noms par défaut. */
    sentences.forEach(([at, nl, fr, en]) => {
      ['nl', 'fr', 'en'].forEach((l, k) => { if (/['"]/.test([nl, fr, en][k])) why.push(at + ': ' + l + ' writes the typographic apostrophe « ’ » and no straight quote'); });
      LANGS.forEach((l, k) => { const q = strayQuotes([fr, en][k], l, []); if (q) why.push(at + ': ' + l + ' ' + q); });
      if (sig(fr) !== sig(en)) why.push(at + ': fr and en hold different digits or {…} tokens');
      if (braces(nl) !== braces(fr)) why.push(at + ': nl and fr hold different {…} tokens');
      [nl, fr, en].forEach(s => braces(s).split('|').filter(Boolean).forEach(t => { if (OK_TOKENS.indexOf(t) < 0) why.push(at + ': ' + t + ' is not a token of the course (' + OK_TOKENS.join(', ') + ')'); }));
      const bad = U.uniq(tokens(nl).filter(t => !T.S.known(t)));
      if (bad.length) why.push(at + ': ' + list(bad) + ' is not Dutch that OpenTaal or flemish.tsv knows: pick another word');
      if ([nl, fr, en].some(s => spelling.named(untoken(s), T.NL))) why.push(at + ' names no one by default');
    });
    LANGS.forEach(l => { if (/["]/.test(row.rule[l])) why.push('rule.' + l + ' writes no straight quote'); const q = strayQuotes(row.rule[l], l, []); if (q) why.push('rule.' + l + ' ' + q); });
    LANGS.forEach(l => { if (row.rule[l].length > RULE_MAX) why.push('rule.' + l + ' is ' + row.rule[l].length + ' signs, ' + RULE_MAX + ' at most: the sheet shows it on one line'); });
    ['title', 'rule', 'explain'].forEach(f => LANGS.forEach(l => { if (/'/.test(row[f][l])) why.push(f + '.' + l + ' writes the typographic apostrophe « ’ » and no straight quote'); }));

    /* L'explication : quatre balises, le néerlandais marqué (et connu), aucun néerlandais hors des marques. */
    LANGS.forEach(l => {
      const t = markup(row.title[l], TITLE_TAGS);
      t.why.forEach(w => why.push('title.' + l + ': ' + w));
      const e = markup(row.explain[l], EXPLAIN_TAGS);
      e.why.forEach(w => why.push('explain.' + l + ': ' + w));
      if (row.explain[l].length > EXPLAIN_MAX) why.push('explain.' + l + ' is ' + row.explain[l].length + ' characters, ' + EXPLAIN_MAX + ' at most (the longest the course has, g-dehet): the sheet must stay readable on a phone');
      if (e.why.length) return;
      if (!e.spans) why.push('explain.' + l + ' shows no Dutch: an example goes in <span class="ex"> or <i class="nl">');
      const bad = U.uniq(tokens(e.marked).filter(x => !T.S.known(x)));
      if (bad.length) why.push('explain.' + l + ': ' + list(bad) + ' is not Dutch that OpenTaal or flemish.tsv knows');
    });
    /* Ce que test/lang.js 6d refuserait à Merge : une citation qui n'est pas du néerlandais du cours (une
       traduction va entre parenthèses, sans guillemets), et un mot du néerlandais du cours que le français
       et l'anglais écrivent nu. Le néerlandais du cours, ici, compte les phrases de la ligne : elles ne
       rejoignent le cours qu'à Merge. */
    const dutch = new Set(T.dutch);
    sentences.forEach(s => words(s[1]).forEach(w => dutch.add(w)));
    const fill = s => T.NL.content.fill(s);
    ['rule', 'explain'].forEach(f => LANGS.forEach(l => {
      const r = foreignQuotes(T.NL, joined(fill(row[f][l])), dutch);
      if (!r.paired) why.push(f + '.' + l + ' has a quote mark with no partner, or an empty quote');
      r.foreign.forEach(q => why.push(f + '.' + l + ' quotes « ' + q + ' », which is not Dutch of the course: a translation goes in parentheses, with no quotes'));
    }));
    ['rule', 'explain', 'title'].forEach(f => {
      const r = bareDutch(T.NL, dutch, T.named, f, fill(row[f].fr), fill(row[f].en));
      if (r.bare.length) why.push(f + ': ' + list(r.bare) + ' is Dutch of the course, written bare in fr and in en: ' +
        (f === 'rule' ? 'quote it « … »' : 'put it in <i class="nl"> or <span class="ex">'));
    });
    const other = iTags(row.explain.en).map(i => i.text);
    iTags(row.explain.fr).forEach(i => {
      if (other.indexOf(i.text) >= 0 && !/^<i\s[^>]*class="nl"/.test(i.tag)) why.push('explain.fr: « ' + i.text + ' » is Dutch in <i>: give it class="nl"');
    });

    /* L'exemple de la règle, que l'apprenant lit en premier : l'ordre du cours, comme un exercice ; les trous
       des exercices sont ce que la règle enseigne. */
    const taught = new Set([].concat(...row.drills.map(d => tokens(d.gap))));
    const exAhead = sequence.ahead(row.nl, ui, T.first).filter(t => !taught.has(t));
    if (exAhead.length) why.push('nl « ' + row.nl + ' » borrows from a later unit: ' + exAhead.join(', '));
    const exNever = sequence.unmet(row.nl, ui, T.first, taught).filter(t => exAhead.indexOf(t) < 0);
    if (exNever.length) why.push('nl « ' + row.nl + ' » uses forms the course never teaches: ' + exNever.join(', '));

    /* Les phrases d'exercice : tuiles, trou, ordre du cours. */
    const seen = new Map();
    row.drills.forEach((d, j) => {
      const at = 'drill ' + (j + 1) + ' « ' + d.nl + ' »', ts = U.tiles(d.nl), gt = U.tiles(d.gap);
      if (ts.length < TILES.min || ts.length > TILES.max) why.push(at + ' has ' + ts.length + ' tiles: ' + TILES.min + ' to ' + TILES.max + ' (the longest the course has is ' + TILES.max + ')');
      const key = U.norm(d.nl);
      if (seen.has(key)) why.push(at + ' repeats drill ' + seen.get(key));
      else seen.set(key, j + 1);
      if (gt.length !== 1) { why.push(at + ': gap « ' + d.gap + ' » is not one tile: the cloze hides one word'); return; }
      const hits = ts.filter(t => U.norm(t) === U.norm(gt[0]));
      if (!hits.length) { why.push(at + ': gap « ' + d.gap + ' » is not a tile of the drill'); return; }
      if (hits.length > 1) { why.push(at + ': gap « ' + d.gap + ' » occurs ' + hits.length + ' times in the drill: the cloze hides the first, and the learner cannot tell which'); return; }
      if (d.gap.toLowerCase() !== gt[0].toLowerCase()) why.push(at + ': gap « ' + d.gap + ' » carries punctuation the tile does not');
      const cloze = T.NL.ex.get('cloze').build({ unit: input.unit, drills: [d] });
      if (U.norm(cloze.gap) !== U.norm(d.gap) || cloze.shown === d.nl) why.push(at + ': the cloze cannot hide the gap « ' + d.gap + ' »');
      /* Rien que le cours n'enseigne pas à l'unité de la règle ; le trou, lui, est ce que la règle enseigne. */
      const gap = new Set(tokens(d.gap));
      const ahead = sequence.ahead(d.nl, ui, T.first).filter(t => !gap.has(t));
      if (ahead.length) why.push(at + ' borrows from a later unit: ' + ahead.join(', '));
      const never = sequence.unmet(d.nl, ui, T.first, gap).filter(t => ahead.indexOf(t) < 0);
      if (never.length) why.push(at + ' uses forms the course never teaches: ' + never.join(', '));
    });
    /* Une phrase qu'une autre règle écrit déjà : une règle plus haut dans RULES, dans un autre lot (son
       draft.json, retry.json au lieu de la ligne du même id), ou un pattern du cours (les 9 de grammar.js
       et les règles fondues). Des lots rédigés en parallèle ne se voient pas : write refuse alors au Merge. */
    const taken = new Map();
    T.C.RAW.patterns.filter(p => p.id !== input.id).forEach(p => [p.nl].concat((p.drills || []).map(d => d.nl)).forEach(s => { if (!taken.has(U.norm(s))) taken.set(U.norm(s), p.id); }));
    if (ctx.kindDir) otherRows(ctx.kindDir, input.id).sort((a, b) => RULES.findIndex(r => r.id === a.id) - RULES.findIndex(r => r.id === b.id)).forEach(o => {
      if (RULES.findIndex(r => r.id === o.id) < RULES.findIndex(r => r.id === input.id)) [o.nl].concat(o.drills.map(d => d.nl)).forEach(s => { if (!taken.has(U.norm(s))) taken.set(U.norm(s), o.id); });
    });
    sentences.forEach(([at, nl]) => { const o = taken.get(U.norm(nl)); if (o) why.push(at + ' « ' + nl + ' » is also written by ' + o); });
    unitProblems.forEach(w => why.push(w));
    return why;
  }

  /* Les lignes écrites des autres lots du genre : draft.json de chaque dossier frère, retry.json au lieu
     de la ligne du même id. Un fichier absent ou illisible n'en donne aucune : le kit le refuse à son tour. */
  function otherRows(kindDir, self) {
    const rows = new Map(), read = f => { try { const v = JSON.parse(fs.readFileSync(f, 'utf8')); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
    fs.readdirSync(kindDir, { withFileTypes: true }).filter(e => e.isDirectory()).forEach(e => ['draft.json', 'retry.json'].forEach(n =>
      read(path.join(kindDir, e.name, n)).forEach(r => { if (r && r.id && r.id !== self && Array.isArray(r.drills) && r.drills.every(d => d && typeof d.nl === 'string') && typeof r.nl === 'string') rows.set(r.id, r); })));
    return Array.from(rows.values());
  }

  /* Le texte du fichier : l'en-tête, les patterns dans l'ordre de RULES, puis la boucle qui range chaque
     règle dans l'unité qui la liste. Une unité absente la fait échouer au chargement, avec l'id de la
     règle : sinon un pattern qu'aucune unité ne liste n'est jamais construit, et rien ne le dit. */
  const pair = g => '{ fr: ' + lit(g.fr) + ', en: ' + lit(g.en) + ' }';
  const HEADER = [
    '/* Règles de grammaire des unités 13 à 34. Même forme que grammar.js.',
    '   Écrit par la fusion du genre grammar (tools/content/kinds/grammar.js) depuis ses lignes prises :',
    '   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités de',
    '   lexicon.a1c.js gardent grammar: [] dans leur fichier ; la boucle en bas range chaque règle dans la',
    '   liste de son unité au chargement, et lève une erreur, avec l’id de la règle, quand l’unité manque. */',
    'NL.content = NL.content || {};',
    'NL.content.patterns = NL.content.patterns || [];',
    '(function () {',
    '  \'use strict\';',
    '  const D = (nl, g, gap) => ({ nl, ...NL.gloss.pair(g), gap });',
    '  const P = p => NL.content.patterns.push(p);'
  ];
  function patterns(rules) {
    const lines = HEADER.slice();
    rules.forEach(({ rule, row, level }) => {
      lines.push('', '  P({',
        '    id: ' + lit(rule.id) + ', unit: ' + lit(rule.unit) + ', level: ' + lit(level) + ',',
        '    title: ' + pair(row.title) + ',',
        '    rule: ' + pair(row.rule) + ',',
        '    nl: ' + lit(row.nl) + ', fr: ' + lit(row.fr) + ', en: ' + lit(row.en) + ',',
        '    explain: {', '      fr: ' + lit(row.explain.fr) + ',', '      en: ' + lit(row.explain.en), '    },',
        '    drills: [');
      row.drills.forEach((d, k) => lines.push('      D(' + lit(d.nl) + ', ' + pair(d) + ', ' + lit(d.gap) + ')' + (k < row.drills.length - 1 ? ',' : '')));
      lines.push('    ]', '  });');
    });
    lines.push('', '  [' + rules.map(x => '[' + lit(x.rule.id) + ', ' + lit(x.rule.unit) + ']').join(', ') + '].forEach(r => {',
      '    const u = NL.content.units.find(x => x.id === r[1]);',
      '    if (!u) throw new Error(\'grammar.a1c.js : la règle \' + r[0] + \' veut l’unité « \' + r[1] + \' », que le cours n’a pas (lexicon.a1c.js se charge avant)\');',
      '    (u.grammar = u.grammar || []).push(r[0]);',
      '  });',
      '})();');
    return lines;
  }

  /* Merge : refuse, avant d'écrire, une règle sur une unité que le cours n'a pas (elle est nommée), deux
     règles qui écrivent la même phrase, et une règle déjà dans grammar.a1c.js que nulle ligne prise
     n'écrit (le fichier se récrit entier) ; puis récrit le fichier, les règles dans l'ordre de RULES.
     Relancée avec les mêmes lignes, elle le récrit à l'identique. */
  function write(taken, ctx) {
    const T = tools(ctx), U = T.NL.util;
    const rules = RULES.filter(r => taken.some(x => x.id === r.id));
    const problems = against(T, rules);
    if (problems.length) throw new Error(problems.join('; '));
    const mine = new Map(), twice = [];
    taken.forEach(x => [x.row.nl].concat(x.row.drills.map(d => d.nl)).forEach(s => {
      const k = U.norm(s);
      if (mine.has(k) && mine.get(k) !== x.id) twice.push(x.id + ' and ' + mine.get(k) + ' both write « ' + s + ' »');
      else mine.set(k, x.id);
    }));
    if (twice.length) throw new Error(twice.join('; ') + ': one sentence, one rule');
    T.C.RAW.patterns.filter(p => RULES.some(r => r.id === p.id) && !T.hand.has(p.id) && !taken.some(x => x.id === p.id)).forEach(p => {
      throw new Error('grammar.a1c.js holds the rule ' + p.id + ', and no taken row writes it: Merge rewrites the file whole');
    });
    const file = path.join(ctx.repo, FILE), old = fs.readFileSync(file, 'utf8'), eol = /\r\n/.test(old) ? '\r\n' : '\n';
    const out = rules.map(r => ({ rule: r, row: taken.find(x => x.id === r.id).row, level: unitOf(T.C, r.unit).level }));
    fs.writeFileSync(file, patterns(out).map(l => l + eol).join(''));
    return ['ok grammar.a1c.js ' + out.length + ' rules in ' + new Set(out.map(x => x.rule.unit)).size + ' units'];
  }

  module.exports = {
    stamp: [s => s.unit, s => s.n, s => s.teach],
    fields: FIELDS,
    tables: [],
    sourceOf,
    split,
    check,
    forMaintainer: () => '',
    readWhole: () => 'course-written',
    merge: () => ({}),
    write,
    RULES,
    TILES,
    patterns
  };
  ```
  Then `node test/tools/fanout.js .` again. Expected: exit 1, and these four lines (the wiring is not done):
  ```
    FAIL: le SRC de build.sh charge grammar.a1c.js après lexicon.a1c.js et grammar.js, avant index.js
    FAIL: la liste de test/smoke.js nomme grammar.a1c.js au même endroit
    FAIL: test/smoke.js échoue quand une règle de grammar.a1c.js veut une unité absente, et nomme la règle
  CRASH TypeError: Cannot read properties of undefined (reading 'drills')
  ```

- [ ] **Step 4: Create the empty file, and wire it.** Write `src/content/grammar.a1c.js` with the Write tool; it is exactly
  what `patterns([])` returns (a French header, an IIFE with `D` and `P`, and the loop, with an empty list):
  ```js
  /* Règles de grammaire des unités 13 à 34. Même forme que grammar.js.
     Écrit par la fusion du genre grammar (tools/content/kinds/grammar.js) depuis ses lignes prises :
     une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités de
     lexicon.a1c.js gardent grammar: [] dans leur fichier ; la boucle en bas range chaque règle dans la
     liste de son unité au chargement, et lève une erreur, avec l’id de la règle, quand l’unité manque. */
  NL.content = NL.content || {};
  NL.content.patterns = NL.content.patterns || [];
  (function () {
    'use strict';
    const D = (nl, g, gap) => ({ nl, ...NL.gloss.pair(g), gap });
    const P = p => NL.content.patterns.push(p);

    [].forEach(r => {
      const u = NL.content.units.find(x => x.id === r[1]);
      if (!u) throw new Error('grammar.a1c.js : la règle ' + r[0] + ' veut l’unité « ' + r[1] + ' », que le cours n’a pas (lexicon.a1c.js se charge avant)');
      (u.grammar = u.grammar || []).push(r[0]);
    });
  })();
  ```
  In `build.sh`, after the line `src/content/grammar.js` of `SRC`, add the line
  ```
  src/content/grammar.a1c.js
  ```
  In `test/smoke.js`, in the `files` list, after `'src/content/grammar.js',` add `'src/content/grammar.a1c.js',` (on the
  same line as the neighbours it has, in the proof `'src/content/decoys.js', 'src/content/grammar.js', 'src/content/grammar.a1c.js',`).
  In `CLAUDE.md`, directly after the sentence that ends `(`docs/agents/plan-runs/design-sitting.md`).` add, with the same
  two-space indent as the lines above it:
  ```
    The `grammar` kind's Merge (`tools/content/kinds/grammar.js`) also writes a file whole,
    `src/content/grammar.a1c.js`: the 13 rules that `grammar.js` lacks, from its `RULES` and the
    accepted rows; the page lists each on its unit at load. A rule changes through its row, and its id
    never changes.
  ```

- [ ] **Step 5: See the test green.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exit 0, the line `  grammar        13 règles, 9 unités ; chaque garde, la boucle de chargement, Merge de bout en bout, relancée, second Split`,
  and the last line `573 contrôles, KIT CONFORME`. The new assertions fail on the kind without this task's Check
  (measured on the first version of the kind with this block: eleven `FAIL` lines, for the `vandaagx` reason, the two foreign
  quotes, the two bare words, the unpaired quote, the two cases of the example, the two sentences already written and the
  one a `retry.json` holds), and each maps to a
  Review Focus: a gap at the start of its sentence is accepted (`un trou en tête de phrase est accepté`) and a gap written
  twice is refused with its drill (`un trou écrit deux fois est refusé, en nommant l'exercice`) — Review Focus 2; a unit
  the course lacks is refused by Split (`Split refuse une unité que le cours n'a pas, en la nommant`), by Merge (`Merge
  refuse une unité que le cours n'a pas, en la nommant` and `Merge refuse un numéro d'unité faux`), the load loop throws
  naming the rule and `test/smoke.js` fails on it — Review Focus 3 (the Merge guards and the two-rules-one-sentence
  refusal have no old code to fail on: the kind did not exist, so they pin the guards); an id that a hand pattern or an
  item already has is refused by Split, naming both — Review Focus 4. The longest drill, to ground the tile bound: in a
  scratch script, count `NL.util.tiles`'s way over `C.RAW.patterns` (`course(repo)` of `tools/content/lib/course`); it
  prints `8 tiles: g-scheidbaar « Ik sta elke dag om zes uur op. »`.

- [ ] **Step 6: The page, the build and the suites that read it.**
  ```
  sh build.sh
  node test/smoke.js .
  node test/content.js .
  ```
  Expected: `built (local only) index.html (854145 bytes), artifact.html (853531 bytes)` (853124 and 852510 before the task:
  the file's header and loop); smoke ends `ALL CHECKS PASSED` and prints `items           1035  (words 912, phrases 114,
  patterns 9)`; content ends `7422 contrôles, CONTENU CONFORME` and prints `séquence        129 / 557 phrases empruntent en avant
  (budget 129)`. No number moves: the file holds no rule.

- [ ] **Step 7: The kind from the command line.** In a scratch workspace
  ```
  node tools/content/split.js . "<WS>/tmp/grammar"
  ```
  The folder must be named `grammar`: Split reads the kind from its name (`grammar-1` fails with `fail grammar-1 -: no
  kind module tools/content/kinds/grammar-1.js`). Expected: exit 0 and nine lines, one batch per unit that holds a rule:
  ```
  vragen 3
  kunnen 1
  doen 3
  mensen 1
  waar 1
  eten 1
  cafe 1
  wonen 1
  kalender 1
  ```
  Run it a second time on the same folder: the same nine lines, and nothing rewritten. Do not keep the folder: task 4
  cuts the real batches.

- [ ] **Step 8: The language suite, once.** `test/lang.js` is the check of step 2's refactor, and it is slow:
  ```
  node test/lang.js .
  ```
  Expected: exit 0 and the last line `25084 contrôles, LANGUE CONFORME` (measured on the copy at this commit: 427 seconds).

- [ ] **Step 9: Commit.**
  ```
  git add tools/content/kinds/grammar.js test/lib/quoted.js test/lang.js src/content/grammar.a1c.js build.sh test/smoke.js CLAUDE.md test/tools/fanout.js index.html artifact.html
  git commit -m "feat(content): the grammar kind and an empty grammar.a1c.js ({T-grammar})"
  ```

Done when:
- `node test/tools/fanout.js .` prints `573 contrôles, KIT CONFORME` (the count is as measured on the copy at this
  commit; a block of task 2 adds its own), and the new assertions of the block failed before the Check of step 3 and the
  files of step 4 existed.
- `node test/lang.js .` ends `LANGUE CONFORME` with `test/lib/quoted.js` in place.
- `build.sh`'s `SRC` lists `src/content/grammar.a1c.js` after `src/content/grammar.js` and `test/smoke.js`'s `files`
  list names it in the same place; `node test/smoke.js .` prints `ALL CHECKS PASSED`; `node test/content.js .` prints `CONTENU CONFORME` with
  the figures of step 6.
- `node tools/content/split.js . "<WS>/tmp/grammar"` prints the nine lines of step 7.

### Task 2: The scenarios kind, and an empty scenarios.a1c.js
Class: mechanical
Ticket: {T-conversations}
Promises: none
Why: D22 (the four new conversations are open from the start, like the six: a scenario has no `unit` field) and D21
(`s-afspraak` is listed under `leven`), with D11 (the Node kit stays the factory) and D15 (every row is read whole).
No kind writes a conversation, and the drafting lane runs only through kinds, so this task writes
`tools/content/kinds/scenarios.js` against the kit. Its source is not an item of the course but a conversation to
come (`CONVERSATIONS`, `sourceOf`), as the `words` kind's source is a unit to come: a row is one whole scenario,
whose `id` is the conversation's. `CONVERSATIONS` holds the four of the plan, in the order the file writes them:
`s-cafe` (unit `cafe`, 21), `s-afspraak` (`afspraak`, 30, track `leven`, D21), `s-school` (`school`, 29) and
`s-gemeente` (`stad`, 25), each with its track, an English `place` (where it happens) and an English `situation`
(who speaks, what the learner must get done, the turns to cover). The unit and its number tell the drafter which
vocabulary to draw from and nothing else: the scenario has no `unit` and no filter (D22), and no script reads the
vocabulary, the reader does. Split cuts one batch per conversation the course lacks, named by its id, one row each:
four batches, four rows. Check holds a row to what a script can verify: the shape, the counts the six conversations
measure, the two meanings, the `{tokens}`, the quotation marks, and the spelling of every Dutch line against
OpenTaal and `test/data/flemish.tsv`. Merge writes no table: its `write` rewrites `src/content/scenarios.a1c.js` whole
from `CONVERSATIONS` and the taken rows. The task also creates that file empty (the header and the IIFE, no
conversation), listed in `build.sh`'s `SRC` after `scenarios.js` and in `test/smoke.js`'s file list, so the page loads
it before Merge writes it. Review Focus 4, the scenarios half: a `CONVERSATIONS` id equal to an existing scenario's
is refused by Split, naming both. The task adds **Conversation** to `GLOSSARY.md` and one sentence to `CLAUDE.md`'s
list of Merge-written files.

Files:
- Create: `tools/content/kinds/scenarios.js`
- Create: `src/content/scenarios.a1c.js`
- Modify: `build.sh` (`SRC`, after the line `src/content/scenarios.js`, line 40 as task 1 leaves it)
- Modify: `test/smoke.js` (the `files` list, wrapped over lines 14 to 17; `'src/content/scenarios.js', ` is on line 16, after `'src/content/reference.js', `)
- Modify: `GLOSSARY.md` (« The course », after **Slot**, before « Who the learner is »)
- Modify: `CLAUDE.md` (the paragraph on the six tables Merge writes, at its end)
- Modify (the build writes them): `index.html`, `artifact.html`
- Test: `test/tools/fanout.js` (a new block right above the heading comment `  /* ==================================================== 9. l'outil de lecture`, line 1859 as task 1 leaves it)

Interfaces:
- Consumes: the kit's `loadKind` contract (`tools/content/lib/kit.js`: a module exports `stamp`, `fields`, `tables`,
  `sourceOf`, `split`, `check`, `forMaintainer`, `readWhole`, `merge`, `write`); `test/lib/spelling.js` (`open`,
  `tokens`, `known`); `test/lib/text.js` (`oneLine`, `sig`, `quotes`, `strayQuotes`); `test/lib/dutch.js` (`dutchWords`, `words`);
  `test/lib/quoted.js`, which task 1 creates (`names`, `foreignQuotes`, `bareDutch`); `tools/content/lib/table.js`
  (`literal`).
- Produces: `tools/content/kinds/scenarios.js` exporting `{ stamp, fields, tables: [], sourceOf, split, check,
  forMaintainer, readWhole, merge, write, CONVERSATIONS, scenarios }`. Its input row is `{ id, stamp, copies, unit,
  n, track, setting, situation }` (`setting` is `CONVERSATIONS`' `place`, renamed so that it is not mistaken for the
  drafted `place`, which is the text of the screen). Its draft row is `{ id, stamp, icon, title, place, blurb,
  steps, outro }`, `title`, `place`, `blurb` and `outro` each `{ fr, en }`; a step is `{ them: { nl, fr, en, be } }`
  or `{ you: { ask: { fr, en }, choices: [{ nl, fr, en, reply, note }], hint } }` with `reply` null or `{ nl, fr, en,
  be }`, `note` and `hint` null or `{ fr, en }`. `scenarios(list)` renders the file as an array of lines. `src/content/scenarios.a1c.js`,
  loaded between `scenarios.js` and `content/index.js`, pushes onto `NL.content.scenarios`. Task 6 drafts against
  the row above; task 7 merges it.

Lines are as task 1 leaves the files; place each edit by its text.

Notes:
- **Comments in French** in `scenarios.js`, `scenarios.a1c.js`, `test/tools/fanout.js` and its messages; Check's
  reasons and Merge's lines in English, as the kit's. `GLOSSARY.md` and `CLAUDE.md` are English.
- **Beside task 1.** Task 1 adds `src/content/grammar.a1c.js` right after `src/content/grammar.js` in `build.sh`'s
  `SRC` and in `test/smoke.js`'s list, a sentence to the same `CLAUDE.md` paragraph, and `test/lib/quoted.js`, which
  this task's Check calls. Nothing else here depends on its lines: the edits are placed by the text
  `src/content/scenarios.js`, which stays true after task 1's. In `test/smoke.js` the list is wrapped
  (`... 'src/content/reference.js', 'src/content/scenarios.js', 'src/content/index.js', ...` stands on line 16);
  keep the order `scenarios.js`, `scenarios.a1c.js`, `index.js`. In `CLAUDE.md`, task 1's sentence (on the `grammar`
  kind) is already at the end of the paragraph, after the design-sitting sentence; this task's sentence goes on new
  lines below it, with the same two-space indent, so the two stand one after the other.
- **The quotation marks and the bare Dutch.** Check runs the same rule as `test/lang.js` 6d, through
  `test/lib/quoted.js`, on the fields that rule reads: `blurb`, `outro`, `ask`, `hint`, `note` (in `fr` and in `en`),
  and `title` for bare Dutch. `title` and `place` carry no quotation mark at all. The row's own `nl` and `be` lines
  count as its own forms. The lines of `them` and the choices and replies are not read: the screen does not set them
  through `NL.gloss.quoted`, and in the six real conversations they carry course Dutch bare (12 hits, counted). A
  drafter therefore writes a word of the course bare in no title, blurb, outro, ask, hint or note, and quotes it
  with « » in `fr` and “ ” in `en`.
- **The id check reads the file.** Once Merge has written a conversation, its id is in the course and in
  `CONVERSATIONS`, and that is not a collision. `refuseRepeats` tells the two apart by the ids written in
  `scenarios.a1c.js` (the lines `    id: '…'` at four spaces): an id of the course that the file does not hold is a
  scenario written by hand (the six), and `CONVERSATIONS` may not take it. The refusal names both: the
  `CONVERSATIONS` entry and the course's scenario, with its English title.
- **No unit, no last-step rule.** The kind pins no vocabulary check against the unit (the outline names none), and
  no « the last step is yours » rule: `s-status` ends with a step of theirs. What it pins, measured on the six: the
  first step is theirs, two of theirs never follow each other, 2 to 4 steps of theirs, 3 or
  4 of yours, 2 or 3 choices per step of yours, a `be` on every step of theirs and on every reply. Every `reply`
  carries a `be` in the six.
- **The six fail the spelling rule, and that is allowed.** Run through `check`, `s-bakker` and `s-trein` give `[]`;
  the others fail only on spelling (`pakske`, `veur`, `goeiemorgen`, `goe`, `allez`, `blijfde`: colloquial Flemish
  the spelling lists do not know). The rule binds the drafted rows, not the hand-written ones.
- **Merge is reproducible.** The stamp covers the track, the setting and the situation, nothing Merge writes, so a
  second Merge rewrites the same file byte for byte and keeps its line endings.
- **Where the test runs.** In its own copy under `TMP` (`build.sh`, `src`, `test/lib`, `test/data`, `tools`) with
  `scenarios.a1c.js` written empty, so the block holds after task 7 has merged the real conversations. It never
  touches the repository.
- **TESTING.md is task 8's.** The row for `tools/fanout.js` gains the scenarios kind there, with the grammar kind.
- **The proof.** Applied from this text on `/c/Users/youss/.claude/jobs/5b75527c/tmp/fixZ` (CRLF clone, branch `fix`):
  `ee7f7cf` (`base`), `b69fc14` (task 1, fixed), then `f61e4b5` (this task, fixed). Before the task, with the file at
  `b69fc14`, `node test/tools/fanout.js .` ends `573 contrôles, KIT CONFORME` (25.2 s); after it, `613 contrôles, KIT
  CONFORME` (27.7 s) and prints `  scenarios      4 conversations ; chaque règle, Merge de bout en bout, relancée,
  second Split`. Red: with the block added and neither the kind, the empty file nor the two lists present, the run
  printed the three lines quoted in step 2 (the `-40` as measured). `sh build.sh`: the outputs committed at `b69fc14`
  are `index.html` 854145 bytes and `artifact.html` 853531; after the task `built (local only) index.html (854948
  bytes), artifact.html (854334 bytes)`. `node test/smoke.js .` ends `ALL CHECKS PASSED` with `  scenarios       6,
  steps 43` and `  listen clips    21`. `node tools/content/split.js . <folder>/scenarios` printed the four lines of
  step 7. The kind's CLIs ran in the block: `check.js` and `merge.js` printed the lines the block pins. The commit
  holds the nine files listed in step 7. The fixture's title and outro carry no bare word of the course (`café` is
  one), since Check now refuses it.

- [ ] **Step 1: Write the test.** In `test/tools/fanout.js`, insert the block below on the line right above
  `  /* ==================================================== 9. l'outil de lecture`, with a blank line between. It
  declares its names inside its own braces, so it crosses none of the sections other tasks add. It uses the file's
  `ok`, `same`, `throws`, `text`, `put`, `course`, `kit`, `TMP`, `ROOT`, `spawnSync`, `fs` and `path`.
  ```js
    /* ==================================================== le genre scenarios */
    {
      /* tools/content/kinds/scenarios.js dans une copie à lui sous la copie, avec test/data (l'orthographe).
         Sa source est une conversation à venir : le cours de la copie n'en a aucune des quatre. Le fichier
         src/content/scenarios.a1c.js de la copie est remis vide : le cours de la fixture reste celui des six
         conversations écrites à la main, quoi que la fusion du dépôt y ait écrit. */
      const { oneLine } = require('../lib/text');
      /* Le fichier est chargé par la page (SRC de build.sh) et par test/smoke.js, qui a sa propre liste, juste après
         scenarios.js : oublié de l'une d'elles, il reste vert tant qu'il est vide. */
      same(/'src\/content\/scenarios\.js',\s*'src\/content\/scenarios\.a1c\.js',\s*'src\/content\/index\.js'/.test(text(path.join(ROOT, 'test', 'smoke.js'))), true,
        'la liste de test/smoke.js nomme scenarios.a1c.js entre scenarios.js et index.js');
      const srcLines = text(path.join(ROOT, 'build.sh')).split(/\r?\n/);
      same(srcLines.indexOf('src/content/scenarios.a1c.js') - srcLines.indexOf('src/content/scenarios.js'), 1, 'le SRC de build.sh nomme scenarios.a1c.js juste après scenarios.js');
      const SD = path.join(TMP, 'conversations');
      ['build.sh', 'src', 'test/lib', 'test/data', 'tools'].forEach(p => fs.cpSync(path.join(ROOT, p), path.join(SD, p), { recursive: true }));
      const runSd = (script, args) => {
        const r = spawnSync(process.execPath, [path.join(SD, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
        return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
      };
      const KS = require(path.join(SD, 'tools', 'content', 'kinds', 'scenarios')), KWS = require(path.join(SD, 'tools', 'content', 'kinds', 'words'));
      const A1C = path.join(SD, 'src', 'content', 'scenarios.a1c.js'), emptyFile = KS.scenarios([]).map(l => l + '\n').join('');
      fs.writeFileSync(A1C, emptyFile);
      const CS = course(SD), NLS = CS.NL;

      /* Les 4 conversations : leurs ids (rangés dans scenariosDone), leur unité, leur voie (s-afspraak sous leven, D21). */
      same(KS.CONVERSATIONS.map(c => [c.id, c.unit, c.n, c.track].join(' ')), ['s-cafe cafe 21 leven', 's-afspraak afspraak 30 leven', 's-school school 29 leven', 's-gemeente stad 25 leven'],
        'quatre conversations, leurs ids, leurs unités et leur voie');
      ok(KS.CONVERSATIONS.every(c => oneLine(c.place) && c.situation.length > 200 && oneLine(c.situation) && KWS.UNITS.some(u => u.id === c.unit && u.n === c.n)),
        'chaque conversation a son lieu, une situation, et une unité de UNITS avec son numéro');
      same(CS.RAW.scenarios.map(s => s.id), ['s-bakker', 's-buur', 's-trein', 's-standup', 's-koffie', 's-status'], 'le fichier vide ne pousse rien : le cours de la copie a ses six conversations');
      same(KS.sourceOf(CS, 's-school'), { id: 's-school', nl: 's-school', fr: KS.CONVERSATIONS[2].place, en: KS.CONVERSATIONS[2].place, unit: 'school', n: 29, track: 'leven', setting: KS.CONVERSATIONS[2].place, situation: KS.CONVERSATIONS[2].situation },
        'la source d\'une ligne est sa conversation, dont nl est l\'id');
      ok(KS.sourceOf(CS, 's-bakker') === undefined, 'une conversation écrite à la main n\'a pas de source');

      /* Split : un lot par conversation, une ligne par lot. */
      const KSD = path.join(SD, 'drafts', 'scenarios');
      same(runSd('split.js', [SD, KSD]), { code: 0, lines: ['s-cafe 1', 's-afspraak 1', 's-school 1', 's-gemeente 1'] }, 'Split coupe un lot par conversation, une ligne par lot');
      const rowS = (dir, id) => JSON.parse(text(path.join(dir, id, 'input.json'))).find(r => r.id === id);
      same(rowS(KSD, 's-afspraak'), { id: 's-afspraak', stamp: kit.stamp(KS, KS.sourceOf(CS, 's-afspraak'), NLS), copies: [], unit: 'afspraak', n: 30, track: 'leven', setting: KS.CONVERSATIONS[1].place, situation: KS.CONVERSATIONS[1].situation },
        'une ligne d\'entrée : son unité, sa voie, son lieu et sa situation');

      /* Check : une ligne juste, puis chaque règle. */
      const ctxS = { repo: SD, course: () => CS };
      const p = (fr, en) => ({ fr, en });
      const CAFE = {
        icon: '\u{1F37A}', title: p('Sur la terrasse', 'On the terrace'), place: p('{stad}, terrasse, samedi après-midi', '{stad}, terrace, Saturday afternoon'),
        blurb: p('Commander et payer, du début à la fin. Six échanges.', 'Ordering and paying, start to finish. Six exchanges.'),
        steps: [
          { them: { nl: 'Goeiemiddag! Wat mag het zijn?', fr: 'Bonjour ! Qu’est-ce que ce sera ?', en: 'Good afternoon! What will it be?', be: 'Goeiemiddag! Wat mag het zijn?' } },
          { you: { ask: p('Commande un café et demande ce qu’on conseille à manger.', 'Order a coffee and ask what they recommend to eat.'), choices: [
            { nl: 'Een koffie alstublieft. Wat raadt u aan om te eten?', fr: 'Un café s’il vous plaît. Que me conseillez-vous à manger ?', en: 'A coffee, please. What do you recommend to eat?',
              reply: { nl: 'De dagschotel is lekker vandaag.', fr: 'Le plat du jour est bon aujourd’hui.', en: 'The dish of the day is good today.', be: 'De dagschotel is lekker vandaag.' }, note: null },
            { nl: 'Een koffie alstublieft. Is er iets vegetarisch?', fr: 'Un café s’il vous plaît. Y a-t-il quelque chose de végétarien ?', en: 'A coffee, please. Is there anything vegetarian?', reply: null,
              note: p('« Alstublieft » ouvre toute commande.', '“Alstublieft” opens any order.') }
          ], hint: p('Un seul mot de politesse suffit : « alstublieft ».', 'One polite word is enough: “alstublieft”.') } },
          { them: { nl: 'Komt in orde. Wilt u nog iets anders?', fr: 'C’est noté. Vous voulez autre chose ?', en: 'Coming up. Would you like anything else?', be: 'Komt in orde. Wilt ge nog iets anders?' } },
          { you: { ask: p('Dis que ça suffit.', 'Say that is all.'), choices: [
            { nl: 'Nee, dat is alles, dank u wel.', fr: 'Non, c’est tout, merci beaucoup.', en: 'No, that is all, thank you.', reply: null, note: null },
            { nl: 'Ja, ook een glas water alstublieft.', fr: 'Oui, et aussi un verre d’eau s’il vous plaît.', en: 'Yes, and a glass of water as well, please.', reply: null, note: null }
          ], hint: null } },
          { them: { nl: 'Zo, alstublieft. Zegt het maar als u wilt betalen.', fr: 'Voilà. Dites-le quand vous voulez payer.', en: 'There you are. Just say when you want to pay.', be: 'Zo, alstublieft. Zegt het maar als ge wilt betalen.' } },
          { you: { ask: p('Demande l’addition.', 'Ask for the bill.'), choices: [
            { nl: 'De rekening alstublieft. Kan ik met bancontact betalen?', fr: 'L’addition s’il vous plaît. Je peux payer par Bancontact ?', en: 'The bill, please. Can I pay by Bancontact?', reply: null, note: null },
            { nl: 'De rekening alstublieft. Ik betaal contant.', fr: 'L’addition s’il vous plaît. Je paie en liquide.', en: 'The bill, please. I will pay cash.', reply: null, note: null }
          ], hint: null } }
        ],
        outro: p('Tu as commandé et payé. Sur une terrasse, la politesse tient en un mot.', 'You ordered and paid. On a terrace, politeness fits in one word.')
      };
      const clone = o => JSON.parse(JSON.stringify(o));
      const atS = (row, id) => KS.check(Object.assign({ id: id || 's-cafe' }, row), rowS(KSD, id || 's-cafe'), ctxS);
      const wrongS = f => { const r = clone(CAFE); f(r); return atS(r); };
      same(atS(CAFE), [], 'une conversation juste passe');
      same(KS.forMaintainer(CAFE) + '|' + KS.readWhole(CAFE), '|course-written', 'aucune ligne ne va au mainteneur par une règle, et chacune est lue entière');
      same([wrongS(r => { r.icon = 'cafe'; }), wrongS(r => { r.icon = '\u{1F37A}\u{1F37A}\u{1F37A}'; })],
        [['icon: is one or two non-ASCII characters, a pictogram'], ['icon: is one or two non-ASCII characters, a pictogram']], 'l\'icône : un ou deux caractères hors ASCII');
      same([wrongS(r => { r.title.en = ' On the terrace'; }), wrongS(r => { r.blurb = { fr: 'Six échanges.' }; }), wrongS(r => { r.outro.en = 'You ordered and paid in 1 go.'; })],
        [['title.en: is a text on one line with no space at either end'], ['blurb: is { fr, en } and nothing else'], ['outro: fr and en hold different digits or {…} tokens']],
        'un sens manque ou est mal écrit, dans une langue ou l\'autre, et mêmes chiffres des deux côtés');
      same([wrongS(r => { r.steps.pop(); r.steps.pop(); }), wrongS(r => { r.steps.splice(1, 0, clone(r.steps[0])); }), wrongS(r => { r.steps.shift(); })],
        [['steps: holds 3 to 4 steps of yours (you), like the six conversations of the course: 2 here'],
          ['steps[1]: two steps of theirs in a row: the learner answers in between'], ['steps[0]: the first step is theirs (them): the other speaks first']],
        'les bornes des six : étapes de l\'autre, étapes à toi, la première est à l\'autre, jamais deux à la suite');
      same([wrongS(r => { delete r.steps[0].them.be; }), wrongS(r => { r.steps[0].them.be = ''; }), wrongS(r => { r.steps[0].them.en = ''; })],
        [['steps[0].them: is { nl, fr, en, be } and nothing else'], ['steps[0].them.be: is a text on one line with no space at either end'], ['steps[0].them.en: is a text on one line with no space at either end']],
        'une réplique de l\'autre porte son be et ses deux sens');
      same([wrongS(r => { r.steps[1].you.choices.pop(); }), wrongS(r => { r.steps[1].you.choices.push(clone(r.steps[1].you.choices[0]), clone(r.steps[1].you.choices[0])); r.steps[1].you.choices[2].nl = 'Een thee alstublieft.'; r.steps[1].you.choices[3].nl = 'Een bier alstublieft.'; }),
        wrongS(r => { r.steps[1].you.choices[1].nl = r.steps[1].you.choices[0].nl; }), wrongS(r => { delete r.steps[1].you.choices[0].reply; }), wrongS(r => { r.steps[1].you.choices[0].reply.be = ''; }),
        wrongS(r => { r.steps[1].you.hint = { fr: 'Un mot.' }; })],
        [['steps[1].you.choices: holds 2 or 3 choices, like the six conversations of the course'], ['steps[1].you.choices: holds 2 or 3 choices, like the six conversations of the course'],
          ['steps[1].you.choices[1]: says what another choice of the step says'], ['steps[1].you.choices[0]: is { nl, fr, en, reply, note } and nothing else: reply and note are null when absent'],
          ['steps[1].you.choices[0].reply.be: is a text on one line with no space at either end'], ['steps[1].you.hint: is { fr, en } and nothing else']],
        'un choix : deux ou trois par étape, des néerlandais distincts, reply et note null quand ils manquent, la réponse porte son be');
      same([wrongS(r => { r.steps[0].them.nl = 'Goeiemiddag! Wat mag het zijn, zqzqx?'; }), wrongS(r => { r.steps[2].them.be = 'Komt in orde. Wilt ge nog iets anders, zqzqx?'; }),
        wrongS(r => { r.steps[1].you.choices[0].reply.nl = 'De dagschotel is zqzqy.'; })],
        [['« zqzqx » is not Dutch that OpenTaal or flemish.tsv knows: pick another word'],
          ['« zqzqx » is not Dutch that OpenTaal or flemish.tsv knows: pick another word'],
          ['« zqzqy » is not Dutch that OpenTaal or flemish.tsv knows: pick another word']],
        'un néerlandais que l\'orthographe ne connaît pas est refusé, dans nl, dans be et dans une réponse');
      same([wrongS(r => { r.steps[0].them.fr = 'Bonjour {prénom} !'; r.steps[0].them.en = 'Hello {prénom}!'; }), wrongS(r => { r.place.fr = '{stad}, terrasse'; r.place.en = 'terrace'; }),
        wrongS(r => { r.steps[0].them.nl = 'Goeiemiddag, {naam}! Wat mag het zijn?'; }), wrongS(r => { r.steps[0].them.fr = 'Qu\'est-ce que ce sera ?'; }), wrongS(r => { r.steps[0].them.fr = 'Bonjour "madame" !'; }),
        wrongS(r => { r.steps[0].them.en = 'Good afternoon! "What" will it be?'; }), wrongS(r => { r.steps[1].you.ask.en = 'Order a “coffee'; })],
        [['steps[0].them.fr: the token {prénom} is not one of {naam}, {stad}, {bedrijf}', 'steps[0].them.en: the token {prénom} is not one of {naam}, {stad}, {bedrijf}'],
          ['place: fr and en hold different digits or {…} tokens'], [],
          ['steps[0].them.fr: writes the typographic apostrophe « ’ » and no straight quote'], ['steps[0].them.fr: quotes with « » only'], ['steps[0].them.en: quotes with “ ” only'],
          ['steps[1].you.ask.en: a “ never closed']],
        'les {jetons} du cours seuls, l\'apostrophe typographique, les guillemets de chaque langue');
      /* Ce que test/lang.js 6d refuserait à Merge, refusé dès Check (test/lib/quoted.js) : une citation qui n'est pas du
         néerlandais du cours, une citation dans title ou place, un mot du cours laissé nu en français et en anglais. Le
         néerlandais de la ligne compte comme celui du cours : ses phrases n'y entrent qu'à Merge. */
      const WAS = 'wasknijper', ownNl = r => { r.steps[1].you.choices[1].nl = 'Een koffie alstublieft. Hebt u een ' + WAS + '?'; };
      ok(!require(path.join(SD, 'test', 'lib', 'dutch')).dutchWords(NLS).has(WAS), 'le cours de la copie n\'enseigne pas « ' + WAS + ' » : la ligne qui le cite apporte seule ce néerlandais');
      const NOT_DUTCH = (where, q) => where + ': quotes « ' + q + ' », which is not Dutch of the course: a translation goes in parentheses, with no quotes';
      same([wrongS(r => { r.blurb.fr = 'Commander et payer, du début à la fin. « Voilà » (six échanges).'; }),
        wrongS(r => { r.steps[1].you.hint.en = 'One polite word is enough: “here you are”.'; }),
        wrongS(r => { r.steps[1].you.choices[1].note = p('« Wasknijper » est le mot du nord.', '“Wasknijper” is the northern word.'); }),
        wrongS(r => { ownNl(r); r.steps[1].you.choices[1].note = p('« Wasknijper » est le mot du nord.', '“Wasknijper” is the northern word.'); })],
        [[NOT_DUTCH('blurb.fr', 'Voilà')], [NOT_DUTCH('steps[1].you.hint.en', 'here you are')],
          [NOT_DUTCH('steps[1].you.choices[1].note.fr', 'Wasknijper'), NOT_DUTCH('steps[1].you.choices[1].note.en', 'Wasknijper')], []],
        '6d : une citation hors du néerlandais du cours est refusée (une traduction va entre parenthèses) ; celle du néerlandais de la ligne passe');
      const NO_QUOTE = where => where + ': carries no quotation marks: the screen cites nothing there';
      same([wrongS(r => { r.title.fr = 'Sur la « terrasse »'; r.title.en = 'On the “terrace”'; }), wrongS(r => { r.place.fr = '{stad}, « terrasse »'; r.place.en = '{stad}, “terrace”'; })],
        [[NO_QUOTE('title.fr'), NO_QUOTE('title.en')], [NO_QUOTE('place.fr'), NO_QUOTE('place.en')]], '6d : title et place ne portent aucun guillemet');
      const BARE = (where, w) => where + ': « ' + w + ' » is Dutch of the course, written bare in fr and in en: quote it, or use the French or English word';
      same([wrongS(r => { r.blurb = p('Un koffie, du début à la fin. Six échanges.', 'A koffie, start to finish. Six exchanges.'); }),
        wrongS(r => { r.title = p('Le koffie', 'The koffie'); }),
        wrongS(r => { r.steps[1].you.hint = p('Un seul mot de politesse suffit : alstublieft.', 'One polite word is enough: alstublieft.'); }),
        wrongS(r => { ownNl(r); r.outro = p('Une ' + WAS + ' ou rien.', 'A ' + WAS + ' or nothing.'); })],
        [[BARE('blurb', 'koffie')], [BARE('title', 'koffie')], [BARE('steps[1].you.hint', 'alstublieft')], [BARE('outro', WAS)]],
        '6d : un mot du néerlandais du cours (ou de la ligne) écrit nu en français et en anglais est refusé');
      same([wrongS(r => { r.steps[0].me = 1; }).length, wrongS(r => { r.steps.push({ them: r.steps[0].them, you: r.steps[1].you }); }).length], [1, 1], 'une clé en trop dans une étape est refusée');

      /* Un id que le cours a déjà : refusé par Split, qui nomme l'entrée de CONVERSATIONS et le scénario du cours. */
      KS.CONVERSATIONS.push({ id: 's-bakker', unit: 'cafe', n: 21, track: 'leven', place: 'x', situation: 'y' });
      try {
        throws(() => KS.split(CS, ctxS), /^CONVERSATIONS id « s-bakker » is the id of the course's scenario « s-bakker » \(At the baker’s\): a conversation never repeats an existing scenario's id$/, 'Split refuse un id que le cours a déjà');
      } finally { KS.CONVERSATIONS.pop(); }
      KS.CONVERSATIONS.push(Object.assign({}, KS.CONVERSATIONS[0]));
      try {
        throws(() => KS.split(CS, ctxS), /^CONVERSATIONS names « s-cafe » twice$/, 'Split refuse deux entrées de même id');
      } finally { KS.CONVERSATIONS.pop(); }
      /* Et par l'outil : la ligne fail du kit, sans que rien ne soit coupé. */
      const kfile = path.join(SD, 'tools', 'content', 'kinds', 'scenarios.js'), kold = text(kfile);
      fs.writeFileSync(kfile, kold.replace(/const CONVERSATIONS = \[\r?\n/, 'const CONVERSATIONS = [\n  { id: \'s-trein\', unit: \'cafe\', n: 21, track: \'leven\', place: \'x\', situation: \'y\' },\n'));
      const refused = runSd('split.js', [SD, path.join(SD, 'refus', 'scenarios')]);
      fs.writeFileSync(kfile, kold);
      same(refused, { code: 1, lines: ['fail scenarios -: the kind\'s split threw: CONVERSATIONS id « s-trein » is the id of the course\'s scenario « s-trein » (The train to Brussels): a conversation never repeats an existing scenario\'s id'] },
        'Split, lancée par l\'outil, dit la faute et ne coupe rien');
      ok(!fs.existsSync(path.join(SD, 'refus', 'scenarios')), 'refusée, Split n\'a rien écrit');

      /* De bout en bout : une ligne nommée à Split, rédigée et relue, check.js, Merge, le fichier récrit, Merge
         relancée à l'identique, les fins de ligne gardées, et un second Split qui ne coupe plus cette conversation. */
      const E2SS = path.join(SD, 'bout-en-bout'), E2S = path.join(E2SS, 'drafts', 'scenarios');
      same(runSd('split.js', [SD, E2S, 's-cafe']), { code: 0, lines: ['s-cafe 1'] }, 'Split nommé coupe une conversation');
      const dirS = path.join(E2S, 's-cafe'), inpS = JSON.parse(text(path.join(dirS, 'input.json')));
      put(dirS, 'draft.json', inpS.map(r => Object.assign({ id: r.id, stamp: r.stamp }, CAFE)));
      put(dirS, 'review.json', inpS.map(r => ({ id: r.id, verdict: 'keep' })));
      same(runSd('check.js', [dirS]).code, 0, 'le lot, rédigé et relu, passe');
      const merged = runSd('merge.js', [SD, E2S]);
      same(merged, { code: 0, lines: ['ok scenarios 1 taken, 0 dropped', 'ok scenarios.a1c.js 1 scenarios'] }, 'Merge écrit le fichier, et le dit');
      const after = text(A1C);
      ok(after.indexOf('  S({\n    id: \'s-cafe\', track: \'leven\', level: \'A1\', icon: \'\\u{1F37A}\',') > 0 && after.indexOf('      T(\'Goeiemiddag! Wat mag het zijn?\', { fr: ') > 0 &&
        after.indexOf('        C(\'Een koffie alstublieft. Is er iets vegetarisch?\', { fr: ') > 0 && after.indexOf('\n    outro: { fr: ') > 0 && !/\bunit\s*:/.test(after), 'le fichier écrit la conversation comme scenarios.js, sans clé unit (D22)');
      const CM = course(SD), got = CM.RAW.scenarios.find(s => s.id === 's-cafe');
      const norm = o => JSON.parse(JSON.stringify(o, (k, v) => (v === null ? undefined : v)));
      same([CM.RAW.scenarios.length, CM.RAW.scenarios[6].id, got.track, got.level, 'unit' in got, norm(got.steps)], [7, 's-cafe', 'leven', 'A1', false, norm(CAFE.steps)], 'le cours relu a sept conversations, la nouvelle en dernier, ses étapes telles qu\'écrites, sans unité');
      same(runSd('merge.js', [SD, E2S]), merged, 'relancée, Merge dit la même chose');
      same(text(A1C), after, 'le fichier est le même octet pour octet');
      const crlf = after.replace(/\n/g, '\r\n');
      fs.writeFileSync(A1C, crlf);
      runSd('merge.js', [SD, E2S]);
      same(text(A1C), crlf, 'le fichier garde ses fins de ligne \\r\\n, sans mélange');
      fs.writeFileSync(A1C, after);
      /* Ce que Merge refuse avant d'écrire : un id de CONVERSATIONS que le cours a écrit à la main (le cours a pu bouger
         depuis Split), et une conversation du fichier que plus aucune ligne prise n'écrit (il est récrit entier). */
      KS.CONVERSATIONS.push({ id: 's-bakker', unit: 'cafe', n: 21, track: 'leven', place: 'x', situation: 'y' });
      try {
        throws(() => KS.write([], { repo: SD, course: () => CM }), /^CONVERSATIONS id « s-bakker » is the id of the course's scenario « s-bakker » \(At the baker’s\): a conversation never repeats an existing scenario's id$/,
          'Merge refuse un id de CONVERSATIONS que le cours a écrit à la main');
      } finally { KS.CONVERSATIONS.pop(); }
      throws(() => KS.write([], { repo: SD, course: () => CM }), /^scenarios\.a1c\.js holds the conversation s-cafe, and no taken row writes it: Merge rewrites the file whole$/,
        'Merge refuse de récrire un fichier dont une conversation n\'a plus de ligne prise');
      same(runSd('split.js', [SD, path.join(SD, 'apres', 'scenarios')]), { code: 0, lines: ['s-afspraak 1', 's-school 1', 's-gemeente 1'] }, 'un second Split ne coupe plus la conversation fondue');
      /* Ce que le mainteneur lit d'une ligne : sa conversation, et la conversation écrite (comme le genre words : un genre sans table). */
      const readingS = require(path.join(SD, 'tools', 'content', 'lib', 'reading'));
      const everyS = readingS.every(SD, E2SS, 'scenarios').lines;
      same(everyS.slice(2, 6), ['1 rows: 1 taken, 0 dropped.', '', '- `s-cafe` (s-cafe) — ' + KS.CONVERSATIONS[0].place + ' · ' + KS.CONVERSATIONS[0].place, '  - course-written; kept by the first reader'],
        'l\'outil de lecture montre la conversation d\'une ligne');
      same(readingS.list(SD, E2SS).lines.filter(l => /^ {2}- row: /.test(l)).length, 1, 'la liste du contrôle du contenu la montre entière : chaque conversation est lue entière');
      console.log('  scenarios      ' + KS.CONVERSATIONS.length + ' conversations ; chaque règle, Merge de bout en bout, relancée, second Split');
    }
  ```

- [ ] **Step 2: Run it red.** In a copy where `tools/content/kinds/scenarios.js` and `src/content/scenarios.a1c.js` do
  not exist and the two lists are untouched, `node test/tools/fanout.js .` must print, among its lines, exactly:
  ```
    FAIL: la liste de test/smoke.js nomme scenarios.a1c.js entre scenarios.js et index.js : false, attendu true
    FAIL: le SRC de build.sh nomme scenarios.a1c.js juste après scenarios.js : -40, attendu 1
  CRASH Error: Cannot find module '…\conversations\tools\content\kinds\scenarios'
  ```
  (the `-40` is the index of a line that is absent, `-1`, minus the index of `src/content/scenarios.js`, 39). The
  crash is the result: nothing after it in the block ran. If the run ends with `KIT CONFORME`, the block is not
  in the file.

- [ ] **Step 3: Write the kind.** Create `tools/content/kinds/scenarios.js` with exactly this text. The pinned values
  are `CONVERSATIONS`' four entries, the three ranges (`THEM = [2, 4]`, `YOU = [3, 4]`, `CHOICES = [2, 3]`), the
  stamp fields and every printed reason: the block of step 1 quotes each reason.
  ```js
  /* Le genre scenarios : les conversations que le cours n'a pas encore (CONVERSATIONS, les 4 de la
     phase 4b). La tâche « FAN conversations » du plan en écrit les lignes ; ce module les coupe, les
     vérifie et les fond (tools/content/lib/kit.js). Sa source n'est pas un élément du cours mais une
     conversation à venir (sourceOf) : une ligne est un scénario entier, que le rédacteur écrit d'après
     la situation de CONVERSATIONS. Dans le code c'est un scénario ; l'apprenant et le glossaire disent
     « conversation ».
     Une ligne écrite porte six champs :
       icon    un ou deux caractères hors ASCII (un pictogramme)
       title, place, blurb, outro   chacun { fr, en }
       steps   les étapes, dans l'ordre. Une étape est { them: { nl, fr, en, be } } (l'autre parle, en
               audio) ou { you: { ask: { fr, en }, choices: [...], hint: null | { fr, en } } } ; un
               choix est { nl, fr, en, reply: null | { nl, fr, en, be }, note: null | { fr, en } }
     Le scénario n'a ni unité ni filtre (D22) : unit et n de CONVERSATIONS disent au rédacteur dans
     quel vocabulaire puiser, et rien ne le vérifie. Merge n'écrit aucune table : son write récrit
     src/content/scenarios.a1c.js entier, depuis CONVERSATIONS et les lignes prises. L'empreinte ne
     couvre rien que Merge écrive : relancée, elle récrit le même fichier. Les lignes imprimées sont
     en anglais, comme celles du kit. */
  const fs = require('fs'), path = require('path');
  const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
  const { literal: lit } = require('../lib/table');
  const { oneLine, sig, quotes, strayQuotes } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));
  const { dutchWords, words } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));
  const { names, foreignQuotes, bareDutch } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'quoted'));

  /* Les 4 conversations (phase 4b, approuvées le 28 octobre 2026), dans l'ordre où le fichier les écrit.
     Leurs ids se rangent dans scenariosDone de chaque apprenant : ils ne changent plus. s-afspraak est
     rangée sous leven (D21) : praten ne liste que leven et werk, et son unité est beide. place est la
     consigne en anglais du rédacteur (la ligne la reçoit sous setting : son propre place est le lieu
     de l'écran). */
  const CONVERSATIONS = [
    { id: 's-cafe', unit: 'cafe', n: 21, track: 'leven', place: 'a Flemish café, a table on the terrace on a Saturday afternoon',
      situation: 'The waiter (de ober) and the learner, who is with a friend. The learner must get a drink and something to eat, ask what the waiter recommends or whether a dish is vegetarian, and pay: say that the bill is wanted, pay by card or in cash, and decide about the tip (de fooi). Cover, in order: the waiter comes for the order; the learner orders; the waiter checks or offers something; the learner asks for the bill and pays. Use the café words of unit 21 and the Flemish forms a waiter really says.' },
    { id: 's-afspraak', unit: 'afspraak', n: 30, track: 'leven', place: 'on the phone with a doctor’s or hairdresser’s reception, a weekday morning',
      situation: 'A receptionist and the learner, on the phone. The learner must move an appointment: give their name ({naam}), say that the appointment of the day does not suit, ask for another day, accept a new time, and have it confirmed. There is no face to read, so each turn is short and clear. Cover, in order: the receptionist answers; the learner says why they call; the receptionist offers a slot; the learner accepts or asks for another and closes. Use the phone and appointment words of unit 30 (bellen, verplaatsen, afzeggen, de agenda, beschikbaar).' },
    { id: 's-school', unit: 'school', n: 29, track: 'leven', place: 'the school gate, the end of a school day, with the child’s teacher (de juf)',
      situation: 'The juf (the child’s teacher) and the learner, a parent, at the gate when the children come out. The learner must greet the juf, ask how the child did today, and say one practical thing: the child is ill tomorrow, or someone else will fetch the child, or a note about homework. Cover, in order: the juf greets the parent; the parent asks how it went; the juf answers with one concrete thing about the day; the parent says the practical thing and the juf acknowledges it. Use the school words of unit 29 (de juf, de klas, het huiswerk, de opvang).' },
    { id: 's-gemeente', unit: 'stad', n: 25, track: 'leven', place: 'the town hall counter in {stad}, a weekday morning',
      situation: 'A clerk at the counter of the town hall (het gemeentehuis) of {stad} and the learner. The learner must get one administrative thing done, for example ask for a document and be told what to bring, or hand in a form and hear when it will be ready. Cover, in order: the clerk asks what the learner needs; the learner says it; the clerk asks for a paper or an extra detail; the learner answers and asks when it will be ready. Use the town words of unit 25 (de post, de bank, het plein) and polite counter Dutch with u.' }
  ];

  const SCENARIOS = path.join('src', 'content', 'scenarios.a1c.js');
  const TOKENS = ['naam', 'stad', 'bedrijf'];

  /* La source d'une ligne : sa conversation, dont nl est l'id (l'empreinte la lit), et fr et en la consigne
     de lieu (l'outil de lecture les montre ; l'empreinte ne les lit pas). La conversation n'est pas encore
     dans le cours quand Split coupe ; elle y est après Merge, et l'empreinte ne change pas. */
  const sourceOf = (C, id) => {
    const c = CONVERSATIONS.find(x => x.id === id);
    return c ? { id: c.id, nl: c.id, fr: c.place, en: c.place, unit: c.unit, n: c.n, track: c.track, setting: c.place, situation: c.situation } : undefined;
  };

  /* Les ids que scenarios.a1c.js écrit : ceux de ce genre. Un id du cours qui n'y est pas est écrit à la
     main (les six), et CONVERSATIONS ne peut pas le reprendre. */
  const own = repo => {
    const f = path.join(repo, SCENARIOS);
    return new Set(fs.existsSync(f) ? (fs.readFileSync(f, 'utf8').match(/^ {4}id: '[^']+'/gm) || []).map(l => l.slice(l.indexOf('\'') + 1, -1)) : []);
  };
  function refuseRepeats(C, repo) {
    const mine = own(repo), seen = new Set();
    CONVERSATIONS.forEach(c => {
      const had = C.RAW.scenarios.find(s => s.id === c.id);
      if (had && !mine.has(c.id)) {
        throw new Error('CONVERSATIONS id « ' + c.id + ' » is the id of the course\'s scenario « ' + c.id + ' » (' + had.title.en + '): a conversation never repeats an existing scenario\'s id');
      }
      if (seen.has(c.id)) throw new Error('CONVERSATIONS names « ' + c.id + ' » twice');
      seen.add(c.id);
    });
  }

  /* Split : un lot par conversation de CONVERSATIONS que le cours n'a pas encore, une ligne par lot (le
     lot porte l'id de la conversation). Après Merge, les conversations fondues sont dans le cours : un
     second Split ne coupe rien pour elles, même nommé. Ce genre ignore ctx.ids, et le kit refuse un id
     qu'il ne coupe pas. */
  function split(C, ctx) {
    refuseRepeats(C, ctx.repo);
    const have = new Set(C.RAW.scenarios.map(s => s.id));
    return CONVERSATIONS.filter(c => !have.has(c.id)).map(c => ({
      batch: c.id,
      rows: [{ id: c.id, unit: c.unit, n: c.n, track: c.track, setting: c.place, situation: c.situation }]
    }));
  }

  /* Le cours, son orthographe, son néerlandais et les noms par défaut (pour les citations et le néerlandais nu,
     test/lib/quoted.js), lus une fois par lecture d'un lot. */
  const memo = new WeakMap();
  function tools(ctx) {
    if (!memo.has(ctx)) {
      const NL = ctx.course().NL;
      memo.set(ctx, { NL, S: spelling.open(ctx.repo, NL), dutch: dutchWords(NL), named: names(NL) });
    }
    return memo.get(ctx);
  }

  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const keysOf = (v, want) => isObj(v) && Object.keys(v).sort().join() === want.slice().sort().join();
  /* Les bornes des six conversations du cours, mesurées : 2 à 4 étapes « them », 3 ou 4 « you », 2 ou
     3 choix par étape « you ». */
  const THEM = [2, 4], YOU = [3, 4], CHOICES = [2, 3], LANGS = ['fr', 'en'];
  const within = (n, r) => n >= r[0] && n <= r[1];

  function check(row, input, ctx) {
    const why = [], T = tools(ctx), S = T.S;
    const say = (where, m) => why.push(where + ': ' + m);
    /* bad : les mots néerlandais que l'orthographe ne connaît pas. mine : le néerlandais de la ligne (nl et be),
       qui n'est pas encore dans le cours. prose : les textes { fr, en } que l'écran cite ou montre, lus plus bas. */
    const bad = new Set(), mine = new Set(), prose = [];
    /* Un texte d'une langue : sur une ligne, sans guillemet droit, guillemets de sa langue seulement et appariés,
       et pas d'autre {jeton} que ceux du cours. */
    const text = (where, s, l) => {
      if (!oneLine(s)) return say(where, 'is a text on one line with no space at either end'), false;
      const stray = l === 'nl' ? '' : strayQuotes(s, l, ['"']);
      if (stray) say(where, stray);
      else if (l !== 'nl') { const q = quotes(s, l); if (q.why) say(where, q.why); }
      if (l === 'nl' && /["«»“”]/.test(s)) say(where, 'writes no quotation mark');
      if ((l === 'nl' || l === 'fr') && /'/.test(s)) say(where, 'writes the typographic apostrophe « ’ » and no straight quote');
      (s.match(/\{[^}]*\}/g) || []).forEach(t => { if (TOKENS.indexOf(t.slice(1, -1)) < 0) say(where, 'the token ' + t + ' is not one of {naam}, {stad}, {bedrijf}'); });
      if (l === 'nl') { spelling.tokens(s).filter(t => !S.known(t)).forEach(t => bad.add(t)); words(s).forEach(w => mine.add(w)); }
      return true;
    };
    /* { fr, en } : les deux sens, avec les mêmes chiffres et les mêmes {jetons}. f est le champ, que 6d lit. */
    const pair = (where, v, f) => {
      if (!keysOf(v, ['fr', 'en'])) return say(where, 'is { fr, en } and nothing else');
      const a = text(where + '.fr', v.fr, 'fr'), b = text(where + '.en', v.en, 'en');
      if (a && b && sig(v.fr) !== sig(v.en)) say(where, 'fr and en hold different digits or {…} tokens');
      if (a && b) prose.push({ where, f, v });
    };
    /* { nl, fr, en } (+ be) : une réplique de l'autre, ou un choix. */
    const line = (where, v, extra) => {
      const keys = ['nl', 'fr', 'en'].concat(extra);
      if (!keysOf(v, keys)) return say(where, 'is { ' + keys.join(', ') + ' } and nothing else');
      const a = text(where + '.nl', v.nl, 'nl'), b = text(where + '.fr', v.fr, 'fr'), c = text(where + '.en', v.en, 'en');
      if (extra.indexOf('be') >= 0) text(where + '.be', v.be, 'nl');
      if (b && c && sig(v.fr) !== sig(v.en)) say(where, 'fr and en hold different digits or {…} tokens');
      return a;
    };

    if (typeof row.icon !== 'string' || !/^[^\x00-\x7f]+$/.test(row.icon) || Array.from(row.icon).length > 2) say('icon', 'is one or two non-ASCII characters, a pictogram');
    ['title', 'place', 'blurb', 'outro'].forEach(f => pair(f, row[f], f));
    if (!Array.isArray(row.steps)) say('steps', 'is a list');
    else {
      const them = row.steps.filter(s => isObj(s) && 'them' in s).length, you = row.steps.filter(s => isObj(s) && 'you' in s).length;
      if (row.steps.length <= 2) say('steps', 'holds more than 2 steps');
      if (!within(them, THEM)) say('steps', 'holds ' + THEM[0] + ' to ' + THEM[1] + ' steps of theirs (them), like the six conversations of the course: ' + them + ' here');
      if (!within(you, YOU)) say('steps', 'holds ' + YOU[0] + ' to ' + YOU[1] + ' steps of yours (you), like the six conversations of the course: ' + you + ' here');
      row.steps.forEach((st, i) => {
        const at = 'steps[' + i + ']';
        if (!isObj(st) || Object.keys(st).length !== 1 || (!('them' in st) && !('you' in st))) return say(at, 'is { them: … } or { you: … } and nothing else');
        if (i === 0 && !st.them) say(at, 'the first step is theirs (them): the other speaks first');
        if (i > 0 && st.them && row.steps[i - 1] && row.steps[i - 1].them) say(at, 'two steps of theirs in a row: the learner answers in between');
        if (st.them) return line(at + '.them', st.them, ['be']);
        const y = st.you, w = at + '.you';
        if (!keysOf(y, ['ask', 'choices', 'hint'])) return say(w, 'is { ask, choices, hint } and nothing else');
        pair(w + '.ask', y.ask, 'ask');
        if (y.hint !== null) pair(w + '.hint', y.hint, 'hint');
        if (!Array.isArray(y.choices) || !within(y.choices.length, CHOICES)) return say(w + '.choices', 'holds ' + CHOICES[0] + ' or ' + CHOICES[1] + ' choices, like the six conversations of the course');
        const dutch = new Set();
        y.choices.forEach((c, k) => {
          const cw = w + '.choices[' + k + ']';
          if (!keysOf(c, ['nl', 'fr', 'en', 'reply', 'note'])) return say(cw, 'is { nl, fr, en, reply, note } and nothing else: reply and note are null when absent');
          line(cw, { nl: c.nl, fr: c.fr, en: c.en }, []);
          if (oneLine(c.nl) && dutch.has(c.nl)) say(cw, 'says what another choice of the step says');
          dutch.add(c.nl);
          if (c.reply !== null) line(cw + '.reply', c.reply, ['be']);
          if (c.note !== null) pair(cw + '.note', c.note, 'note');
        });
      });
    }
    /* Ce que test/lang.js 6d refuserait à Merge (lu champ par champ comme lui : ni les répliques, ni les choix, ni
       les réponses, que l'écran ne cite pas). title et place ne citent rien. Ailleurs, ce qu'une prose cite est du
       néerlandais du cours (ou de la ligne), et une traduction va entre parenthèses ; et un mot du néerlandais du
       cours que le français et l'anglais écrivent tous deux nu se cite. place ne montre pas de mot nu : {stad} y
       entre. */
    const dutch = new Set(T.dutch);
    mine.forEach(w => dutch.add(w));
    const fill = s => T.NL.content.fill(s), list = a => a.map(t => '« ' + t + ' »').join(', ');
    prose.forEach(({ where, f, v }) => {
      LANGS.forEach(l => {
        if (f === 'title' || f === 'place') { if (/[«»“”]/.test(v[l])) say(where + '.' + l, 'carries no quotation marks: the screen cites nothing there'); return; }
        const r = foreignQuotes(T.NL, fill(v[l]), dutch);
        if (!r.paired && !why.some(w => w.indexOf(where + '.' + l + ': ') === 0)) say(where + '.' + l, 'has a quote mark with no partner, or an empty quote');
        r.foreign.forEach(q => say(where + '.' + l, 'quotes « ' + q + ' », which is not Dutch of the course: a translation goes in parentheses, with no quotes'));
      });
      if (f === 'place') return;
      const r = bareDutch(T.NL, dutch, T.named, f, fill(v.fr), fill(v.en));
      if (r.bare.length) say(where, list(r.bare) + ' is Dutch of the course, written bare in fr and in en: quote it, or use the French or English word');
    });
    if (bad.size) {
      why.push(list(Array.from(bad)) + ' is not Dutch that OpenTaal or flemish.tsv knows: pick another word');
    }
    return why;
  }

  /* Le texte du fichier : l'en-tête, puis chaque conversation de CONVERSATIONS qui a une ligne prise, dans
     l'ordre. Les chaînes s'écrivent entre apostrophes droites, échappées ; l'icône en séquence \u{…}, comme
     le fichier écrit à la main. */
  const pairLit = g => '{ fr: ' + lit(g.fr) + ', en: ' + lit(g.en) + ' }';
  const icon = s => '\'' + Array.from(s).map(c => '\\u{' + c.codePointAt(0).toString(16).toUpperCase() + '}').join('') + '\'';
  const HEADER = [
    '/* Conversations de la phase 4b. Même forme que scenarios.js, dont les aides T, Y et C sont reprises.',
    '   Écrit par la fusion du genre scenarios (tools/content/kinds/scenarios.js) depuis ses lignes prises :',
    '   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Elles s’ajoutent à celles de',
    '   scenarios.js ; le fichier se charge après lui et avant content/index.js. */',
    'NL.content = NL.content || {};',
    'NL.content.scenarios = NL.content.scenarios || [];',
    '(function () {',
    '  \'use strict\';',
    '  const T = (nl, g, be) => ({ them: { nl, ...NL.gloss.pair(g), be } });',
    '  const Y = (ask, choices, hint) => ({ you: { ask, choices, hint } });',
    '  const C = (nl, g, reply, note) => ({ nl, ...NL.gloss.pair(g), reply, note });',
    '  const S = o => NL.content.scenarios.push(o);'
  ];
  function scenarios(list) {
    const lines = HEADER.slice();
    list.forEach(({ c, row }) => {
      lines.push('', '  S({',
        '    id: ' + lit(c.id) + ', track: ' + lit(c.track) + ', level: \'A1\', icon: ' + icon(row.icon) + ',',
        '    title: ' + pairLit(row.title) + ', place: ' + pairLit(row.place) + ',',
        '    blurb: ' + pairLit(row.blurb) + ',',
        '    steps: [');
      row.steps.forEach((st, i) => {
        const comma = i < row.steps.length - 1 ? ',' : '';
        if (st.them) {
          lines.push('      T(' + lit(st.them.nl) + ', ' + pairLit(st.them) + ', ' + lit(st.them.be) + ')' + comma);
          return;
        }
        const y = st.you;
        lines.push('      Y(' + pairLit(y.ask) + ', [');
        y.choices.forEach((ch, k) => {
          const args = [lit(ch.nl), pairLit(ch)];
          if (ch.reply !== null || ch.note !== null) args.push(ch.reply === null ? 'null' : '{ nl: ' + lit(ch.reply.nl) + ', fr: ' + lit(ch.reply.fr) + ', en: ' + lit(ch.reply.en) + ', be: ' + lit(ch.reply.be) + ' }');
          if (ch.note !== null) args.push(pairLit(ch.note));
          lines.push('        C(' + args.join(', ') + ')' + (k < y.choices.length - 1 ? ',' : ''));
        });
        lines.push('      ]' + (y.hint !== null ? ', ' + pairLit(y.hint) : '') + ')' + comma);
      });
      lines.push('    ],', '    outro: ' + pairLit(row.outro), '  });');
    });
    lines.push('})();');
    return lines;
  }

  /* Merge : refuse un id de CONVERSATIONS que le cours a écrit à la main (le cours a pu bouger depuis
     Split), avant d'écrire ; puis récrit le fichier entier, dans l'ordre de CONVERSATIONS. Le fichier peut
     déjà tenir ces conversations (Merge relancée) : il est récrit à l'identique. Une conversation qu'il tient
     et qu'aucune ligne prise n'écrit serait perdue : Merge la refuse. */
  function write(taken, ctx) {
    const C = ctx.course();
    refuseRepeats(C, ctx.repo);
    const by = new Map(taken.map(x => [x.id, x]));
    own(ctx.repo).forEach(id => {
      if (!by.has(id)) throw new Error('scenarios.a1c.js holds the conversation ' + id + ', and no taken row writes it: Merge rewrites the file whole');
    });
    const list = CONVERSATIONS.filter(c => by.has(c.id)).map(c => ({ c, row: by.get(c.id).row }));
    const file = path.join(ctx.repo, SCENARIOS), old = fs.readFileSync(file, 'utf8'), eol = /\r\n/.test(old) ? '\r\n' : '\n';
    fs.writeFileSync(file, scenarios(list).map(l => l + eol).join(''));
    return ['ok scenarios.a1c.js ' + list.length + ' scenarios'];
  }

  module.exports = {
    stamp: [c => c.track, c => c.setting, c => c.situation],
    fields: ['icon', 'title', 'place', 'blurb', 'steps', 'outro'],
    tables: [],
    sourceOf,
    split,
    check,
    forMaintainer: () => '',
    readWhole: () => 'course-written',
    merge: () => ({}),
    write,
    CONVERSATIONS,
    scenarios
  };
  ```

- [ ] **Step 4: Create the empty file.** The kind renders it, so the file and the renderer cannot differ:
  ```
  node -e "const K=require('./tools/content/kinds/scenarios');require('fs').writeFileSync('src/content/scenarios.a1c.js',K.scenarios([]).map(l=>l+'\n').join(''))"
  ```
  Expected: the file is 13 lines, ends `})();`, and holds no `S({`
  (`grep -c "S({" src/content/scenarios.a1c.js` prints `0`).

- [ ] **Step 5: List it, in the build and in smoke.** In `build.sh`, after the line `src/content/scenarios.js`, add
  the line `src/content/scenarios.a1c.js`. In `test/smoke.js`, in the `files` list, after
  `'src/content/scenarios.js', ` add `'src/content/scenarios.a1c.js', `. The order matters: the file loads after
  `scenarios.js` and before `src/content/index.js`, which copies `NL.content.scenarios` at the first `build()`.

- [ ] **Step 6: Write the glossary entry and the CLAUDE.md sentence.** In `GLOSSARY.md`, in « The course », after the
  entry **Slot** and before `### Who the learner is`, add:
  ```
  **Conversation**:
  A scripted exchange the learner plays through, one step at a time, in a setting of daily life: the other speaker's lines alternate with the learner's choices. It belongs to a track and to no unit, and the kit's `scenarios` kind drafts it. The code calls it a scenario.
  _Avoid_: dialogue, role-play, scene
  ```
  In `CLAUDE.md`, at the end of the paragraph that ends `it has no path yet (`docs/agents/plan-runs/design-sitting.md`).`
  (after anything task 1 has added there), add on new lines, indented like the paragraph:
  ```
    The `scenarios` kind's Merge (`tools/content/kinds/scenarios.js`) likewise writes
    `src/content/scenarios.a1c.js` whole, from its `CONVERSATIONS` and the accepted rows: a conversation
    changes through its rows, never by hand.
  ```

- [ ] **Step 7: Run it green, build, smoke.**
  ```
  node test/tools/fanout.js .
  sh build.sh
  node test/smoke.js .
  ```
  Expected: the first prints `  scenarios      4 conversations ; chaque règle, Merge de bout en bout, relancée, second Split`
  and ends `613 contrôles, KIT CONFORME` (the count is 573 + this block's 40 on task 1's commit); the second ends
  `built (local only) index.html (854948 bytes), artifact.html (854334 bytes)` (the sizes move with task 1); the third ends `ALL CHECKS PASSED` and prints `  scenarios       6, steps 43` and
  `  listen clips    21`. Then run Split by hand on the repository, into a folder outside it:
  `node tools/content/split.js . "<WS>/tmp/proof-2/scenarios"`. Expected, exactly:
  ```
  s-cafe 1
  s-afspraak 1
  s-school 1
  s-gemeente 1
  ```
  Commit the nine files together:
  ```
  git add build.sh index.html artifact.html CLAUDE.md GLOSSARY.md src/content/scenarios.a1c.js test/smoke.js test/tools/fanout.js tools/content/kinds/scenarios.js
  git commit -m "feat(content): the scenarios kind and an empty scenarios.a1c.js ({T-conversations})"
  ```

Done when: `node test/tools/fanout.js .` ends `KIT CONFORME` and prints the `scenarios` line; `node test/smoke.js .`
ends `ALL CHECKS PASSED` with the counts unchanged (`scenarios 6, steps 43`, `listen clips 21`); the empty
file is the renderer's own output; Split prints the four lines above and, on a `CONVERSATIONS` id the course already
has, refuses with the line the block pins; and the commit holds the nine files above.

### Task 3: The learner pass plays every conversation and opens every rule sheet
Class: mechanical
Ticket: {T-learner-pass}
Promises: none
Why: gate 9 (Review Focus 1 and 5) must see the 4 new conversations, all 13 new rules and every position of every choice step. The old `corners.js` played s-bakker only, always on choice 0; nothing opened a rule sheet. The task runs on today's 6 and 9 before any row exists (D19), so the gate meets tools already proven. What it leaves for later tasks: `corners.js` plays every scenario of `NL.content.scenarios` (6 today), one `CONVERSATION <id>` block each, once per choice position (pass q taps choice `q % n` at every "you" step, q from 0 to the conversation's largest n minus 1), so every choice of every step is played, and prints a `PROBLEM:` line for one that does not finish; a new `rules.js` taps every `data-act="gram"` chip on the leerpad (14 chips, 9 rules today) and checks each sheet at 390 px. Both are tested without a browser, and both run clean in Edge on today's content.

Files:
- Modify: `tools/learner-pass/session.js` (add `playConversation`, export it; the header comment names it).
- Modify: `tools/learner-pass/corners.js` (section 3, « Une conversation » up to « 4. Le défi »; the `require` of `./session`).
- Create: `tools/learner-pass/rules.js`.
- Test: `test/tools/learner-pass.js` (extended; no new file, so `test/run-all.sh` is untouched).

Interfaces:
- Consumes: `common.js` (`open`, `verdict`, `sleep`, `SHOTS`, unchanged); the page's `NL.content.scenarios`, `NL.content.units[].grammar`, `NL.content.patterns`; the praten card `[data-scn="<id>"]`; the sheet `src/ui/home.js` builds on a chip tap (`.sheet-card`, `h3`, `.rule`, `.explain`, `.ex-row`, `[data-close="1"]`).
- Produces:
  - `playConversation(page, id, opts) -> Promise<{ turns, finished, picks, lines, problems }>` in `session.js`. `opts.pass` (default 0) is the choice position: at every you step of n choices the pass taps choice `opts.pass % n`. `opts.firstShots` takes the two screenshots only the first pass of the first conversation took. `picks[i]` is the choice tapped at the i-th you step; `lines` are the printed lines; `problems` the `PROBLEM:` texts.
  - `rules.js` exports `{ measureSheet, judgeSheet }` and runs `main()` only as the entry script (`require.main === module`). `judgeSheet(id, measured, { rows }) -> string[]` is pure.

Notes:
- **One pass per choice position, per conversation.** A conversation is played `max n` times, `max n` being the largest choice count of its you steps (`Math.max.apply` over `NL.content.scenarios[i].steps`). Pass q (q from 0) taps choice `q % n` at every you step of n choices, so every choice of every step is tapped, wherever a 3-choice step sits (the header's Review Focus 5). `youSteps` starts at 0 in each call and only numbers the printed `you step` line. Measured on today's 6: s-bakker, s-buur, s-trein, s-status 2 passes (picks 0,0,0,0 then 1,1,1,1; s-trein 0,0,0 then 1,1,1); s-standup 3 passes, its 3-choice step (you step 2) tapped with 0, 1, 2; s-koffie 3 passes, its 3-choice step (you step 1) tapped with 0, 1, 2. 14 passes in all, so 14 `finished after` lines for 6 `CONVERSATION` blocks. Nothing is asked of task 6's writer: a 3-choice step may sit anywhere.
- **Same form as before.** One line per spoken turn (`turn N said "…" -> mic-panel good`), a closing `finished after N spoken turn(s)` or `NOT FINISHED`, `PROBLEM:` lines through `verdict()`. The new lines are `CONVERSATION <id>` (blank line before it), `  pass K of N` (one per pass, inside the block) and `  you step I: choice K of N`. The loop cap went from 40 to 60 iterations (a conversation needs about 3 per you-step).
- **A conversation is reached from the praten list**, by tapping its `[data-scn]` card, not by `NL.ui.go('scenario', id)`: a scenario missing from praten (a `track` that praten does not list) is then a failed tap, not a silent pass. `[data-step="back"]` leaves it between conversations.
- **Rules: one line per rule, not per chip.** 9 rules sit on 14 unit cards today (`g-dehet` on 3; `g-v2`, `g-present`, `g-getallen` on 2). The sheet depends on the id only, so `rules.js` opens the first chip of each distinct id. The expected figures come from the content: `RULES <distinct> (<chips> chips on the leerpad; the course lists <rules> rules on <cards> unit cards)`. A chip count different from the content's, or a listed rule with no chip, is a `PROBLEM:`. No rule is named: units 13+ and task 5's 13 listings change no line here.
- **What a sheet must show:** a title, the rule, the explanation, as many drill rows as the rule has up to the 3 the sheet shows; page `scrollWidth` <= 391; the sheet card not scrolling sideways (`scrollWidth - clientWidth` <= 1); no element inside it with `right > innerWidth + 1`.
- Comments and block titles are French (match the files); the `ok()` messages of `test/tools/learner-pass.js` are English, like its existing ones (step 1); printed lines English, as the pass already prints.
- Backslashes: when copying the patches below, check `\b`, `\d`, `\n` survive. A tool that eats backslashes put a backspace character in `/\bgood\b/` on the proof copy and every conversation reported a problem; `grep -c $'\x08' tools/learner-pass/*.js test/tools/learner-pass.js` must print 0 for each file.

**The proof.** Copy `C:\Users\youss\.claude\jobs\5b75527c\tmp\fixX`, a CRLF clone (`core.autocrlf=true`) of chain Y on branch `fix` at `7c738d0` (tasks 1 and 2 as first written; task 3 touches only the learner-pass tools and their test); the part applied from this text only (the three patches with `git apply` as pasted, `rules.js` pasted whole), committed as `task 3 (fixed)`. Ran `npm ci --ignore-scripts` in `tools/learner-pass/` (`added 1 package, and audited 2 packages`, `found 0 vulnerabilities`), `sh build.sh` (`built (local only) index.html (854948 bytes), artifact.html (854334 bytes)`, tree unchanged), `export LEARNER_PASS_CHANNEL=msedge`; `grep -c $'\x08'` printed 0 on every file; then `node test/tools/learner-pass.js .` (21 checks, `LEARNER PASS TOOLS OK`), `node tools/learner-pass/corners.js .` (exit 0, 118 s and 120 s in two runs, 169 lines of output, 14 `finished after` lines, 0 `PROBLEM:`), `node tools/learner-pass/rules.js .` (exit 0, 7 s), `node tools/learner-pass/sweep.js .` (exit 0, 245 s, `TAPPABLE PER SCREEN (282)`). Red: the patch of step 1 alone: `Error: Cannot find module '…\tools\learner-pass\rules.js'`; with rules.js added: `FAIL: TypeError: playConversation is not a function`; with step 3 applied and not step 4: `FAIL: corners.js must play every scenario of NL.content.scenarios, print one CONVERSATION <id> line each, and name none` and `FAIL: corners.js must play one pass per choice position, q from 0 to the largest choice count of a you step` (`21 checks, 2 FAILED`). Every expected line is quoted from those runs. The pass runs on today's 6 conversations and 9 rules because tasks 5 and 7 are not on this copy; on chain Y's head with this fix the checker measured 10 `CONVERSATION` blocks, 22 `finished after` lines, `RULES 22 (27 chips on the leerpad; the course lists 22 rules on 27 unit cards)`, and 0 `PROBLEM:`: those figures belong to tasks 5 and 7, and the replay re-measures them.

- [ ] **Step 1: Write the tests (red).** In `test/tools/learner-pass.js`: widen the `common.js` stub to `exports: { sleep, SHOTS, open, verdict }`, require `playConversation` and `rules.js`, add `fakeConversation(spec, stuck)` before `(async () => {`, and add the `UNE CONVERSATION, PUIS CHACUNE` and `LES FICHES DE RÈGLE` blocks before `const sweep = fs.readFileSync(`. The patch carries its `---`/`+++` header: `git apply` takes it as pasted (checked on a CRLF checkout), or apply by hand. The test messages are all English, like the file's existing ones. The exact patch:

```diff
--- a/test/tools/learner-pass.js
+++ b/test/tools/learner-pass.js
@@ -10,8 +10,9 @@ const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++;
 
 /* common.js charge Playwright et ouvre un navigateur : session.js n'en veut que ces deux noms. */
 const common = path.join(ROOT, 'tools', 'learner-pass', 'common.js');
-require.cache[common] = { id: common, filename: common, loaded: true, exports: { sleep: () => Promise.resolve(), SHOTS: os.tmpdir() } };
-const { playSession, STUCK } = require(path.join(ROOT, 'tools', 'learner-pass', 'session.js'));
+require.cache[common] = { id: common, filename: common, loaded: true, exports: { sleep: () => Promise.resolve(), SHOTS: os.tmpdir(), open: () => Promise.reject(new Error('pas de navigateur')), verdict: () => {} } };
+const { playSession, playConversation, STUCK } = require(path.join(ROOT, 'tools', 'learner-pass', 'session.js'));
+const rules = require(path.join(ROOT, 'tools', 'learner-pass', 'rules.js'));
 
 /* Une séance de `cards` cartes à un seul bouton ; sans limite, elle ne finit jamais. */
 function fakeSession(cards) {
@@ -35,6 +36,35 @@ function fakeSession(cards) {
   };
 }
 
+/* Une conversation à l'écran : `spec` donne, dans l'ordre, 'them' ou le nombre de choix d'un tour « vous ».
+   Avec `stuck`, toucher un choix ne fait rien : la conversation ne finit jamais. */
+function fakeConversation(spec, stuck) {
+  const picks = [];
+  let at = 0, phase = '';
+  const settle = () => { phase = at >= spec.length ? 'done' : spec[at] === 'them' ? 'them' : 'choose'; };
+  settle();
+  global.window = {};
+  global.document = {
+    querySelectorAll: () => new Array(spec[at]),
+    querySelector: () => ({ dataset: { say: 'hallo' } })
+  };
+  const el = { click: () => Promise.resolve() };
+  const when = { '[data-step="again"]': 'done', '[data-step="next"]': 'them', '[data-choice]': 'choose', '[data-act="accept"]': 'scored', '[data-mic="start"]': 'speak' };
+  return {
+    picks,
+    screenshot: () => Promise.resolve(),
+    evaluate: (f, a) => Promise.resolve(f(a)),
+    $: sel => Promise.resolve(when[sel] === phase ? el : null),
+    click: sel => {
+      if (sel === '[data-step="next"]' || sel === '[data-act="accept"]') { at++; settle(); }
+      else if (/^\[data-choice="\d+"\]$/.test(sel)) { picks.push(+sel.match(/\d+/)[0]); if (!stuck) phase = 'speak'; }
+      else if (sel === '[data-mic="stop"]') phase = 'scored';
+      return Promise.resolve();
+    },
+    waitForSelector: () => Promise.resolve({ getAttribute: () => Promise.resolve('mic-panel good') })
+  };
+}
+
 (async () => {
   console.log('UNE PASSE QUI S\'ARRÊTE EN ROUTE');
   const never = await playSession(fakeSession(Infinity), 'cap', {});
@@ -46,6 +76,40 @@ function fakeSession(cards) {
   ok(!exact.log.some(e => STUCK.test(e.result)), 'a session that ends on its 120th card was reported as not ending');
   console.log('  jamais finie : ' + never.log.length + ' lignes, dont ' + said.length + ' qui le dit ; finie : ' + ended.log.length + ' cartes');
 
+  console.log('\nUNE CONVERSATION, PUIS CHACUNE');
+  const three = fakeConversation(['them', 3, 'them', 2, 'them', 3, 2]);
+  const r1 = await playConversation(three, 's-test', {});
+  ok(r1.finished && r1.problems.length === 0, 'a conversation that ends: finished=' + r1.finished + ', problems ' + JSON.stringify(r1.problems));
+  ok(JSON.stringify(r1.picks) === '[0,0,0,0]', 'at pass 0, choice 0 at every you step: expected [0,0,0,0], tapped ' + JSON.stringify(r1.picks));
+  ok(r1.turns === 4, 'four spoken turns, played ' + r1.turns);
+  const r2 = await playConversation(fakeConversation(['them', 3, 'them', 2, 'them', 3, 2]), 's-test', { pass: 1 });
+  const r3 = await playConversation(fakeConversation(['them', 3, 'them', 2, 'them', 3, 2]), 's-test', { pass: 2 });
+  ok(JSON.stringify([r2.picks, r3.picks]) === '[[1,1,1,1],[2,0,2,0]]', 'pass 1: choice 1 everywhere; pass 2: choice 2 on the 3-choice steps, 0 on the 2-choice ones: expected [[1,1,1,1],[2,0,2,0]], tapped ' + JSON.stringify([r2.picks, r3.picks]));
+  ok([0, 1, 2].every(k => [r1, r2, r3].some(r => r.picks[0] === k)), 'the three passes together tap all three choices of the 3-choice step');
+  ok(r3.lines.indexOf('  you step 0: choice 2 of 3') >= 0, 'pass 2 prints "you step 0: choice 2 of 3"');
+  const stuck = await playConversation(fakeConversation(['them', 2, 'them'], true), 's-bloquee', {});
+  ok(!stuck.finished && stuck.problems.some(x => /^conversation s-bloquee did not reach its end$/.test(x)), 'a conversation that never ends must be reported, got ' + JSON.stringify(stuck.problems));
+  ok(stuck.lines.indexOf('  NOT FINISHED') >= 0, 'a conversation that never ends prints NOT FINISHED');
+  console.log('  touches : ' + JSON.stringify([r1.picks, r2.picks, r3.picks]) + ' ; bloquée : ' + stuck.problems.length + ' problème(s)');
+
+  const corners = fs.readFileSync(path.join(ROOT, 'tools', 'learner-pass', 'corners.js'), 'utf8');
+  ok(/NL\.content\.scenarios\.map/.test(corners) && /'\\nCONVERSATION ' \+ ids\[c\]/.test(corners) && !/s-bakker/.test(corners),
+    'corners.js must play every scenario of NL.content.scenarios, print one CONVERSATION <id> line each, and name none');
+  ok(/pass: q/.test(corners) && /Math.max.apply/.test(corners), 'corners.js must play one pass per choice position, q from 0 to the largest choice count of a you step');
+
+  console.log('\nLES FICHES DE RÈGLE');
+  const good = { title: 'Titre', rule: 'La règle', explain: 'Pourquoi', rows: 3, sw: 390, cardOver: 0, wide: [] };
+  ok(rules.judgeSheet('g-x', good, { rows: 3 }).length === 0, 'a sheet with title, rule, explanation, 3 rows and no overflow has no fault');
+  ok(rules.judgeSheet('g-x', null, { rows: 3 }).join() === 'g-x: no sheet opened', 'a tap that opens no sheet is a fault');
+  const lack = rules.judgeSheet('g-x', Object.assign({}, good, { title: '', rule: '', explain: '', rows: 1 }), { rows: 3 });
+  ok(lack.length === 4, 'no title, rule or explanation and 1 row of 3 should be 4 faults, got ' + JSON.stringify(lack));
+  ok(rules.judgeSheet('g-x', Object.assign({}, good, { sw: 420 }), { rows: 3 }).length === 1, 'a page wider than 390 px is a fault');
+  ok(rules.judgeSheet('g-x', Object.assign({}, good, { cardOver: 30 }), { rows: 3 }).length === 1, 'a sheet that scrolls sideways is a fault');
+  ok(rules.judgeSheet('g-x', Object.assign({}, good, { wide: ['B.nl long'] }), { rows: 3 }).length === 1, 'an element sticking out of the sheet is a fault');
+  const src = fs.readFileSync(path.join(ROOT, 'tools', 'learner-pass', 'rules.js'), 'utf8');
+  ok(/querySelectorAll\('\[data-act="gram"\]'\)/.test(src) && /NL\.content\.units\.forEach/.test(src) && !/g-v2|g-present|g-dehet/.test(src),
+    'rules.js reads the chips from the page and the expected count from the content, and names no rule');
+
   const sweep = fs.readFileSync(path.join(ROOT, 'tools', 'learner-pass', 'sweep.js'), 'utf8');
   ok(/const n = await p\.evaluate\([^\n]*\.length, \[CAND, SKIP\]\);/.test(sweep) && /for \(let i = 0; i < n; i\+\+\)/.test(sweep) && !/Math\.(min|max)\(/.test(sweep),
     'sweep.js must walk every tappable thing: the count is the whole list, the loop runs to it, and no Math.min caps it');
```

The assertions, in words: a fake of seven steps `['them', 3, 'them', 2, 'them', 3, 2]` finishes with no problem, picks `[0,0,0,0]` at pass 0, `[1,1,1,1]` at pass 1 and `[2,0,2,0]` at pass 2 (so the three passes together tap all three choices of the 3-choice step, and pass 2 prints `  you step 0: choice 2 of 3`), and 4 spoken turns; a fake that ignores choices reports `conversation s-bloquee did not reach its end` and prints `  NOT FINISHED`; `corners.js` contains `NL.content.scenarios.map` and `'\nCONVERSATION ' + ids[c]`, `pass: q` and `Math.max.apply`, and no `s-bakker`; `judgeSheet` gives 0 faults for a whole sheet, `g-x: no sheet opened` for none, 4 for an empty title, rule and explanation plus 1 row of 3, and 1 each for `sw: 420`, `cardOver: 30` and a `wide` entry; `rules.js` reads `querySelectorAll('[data-act="gram"]')` and `NL.content.units.forEach` and names none of `g-v2`, `g-present`, `g-dehet`.
- [ ] **Step 2: Run it and see it fail.** `node test/tools/learner-pass.js .` -> `Error: Cannot find module '…/tools/learner-pass/rules.js'` (rules.js does not exist yet): a crash on require, which is the red.
- [ ] **Step 3: `playConversation` in `session.js`.** Apply:

```diff
--- a/tools/learner-pass/session.js
+++ b/tools/learner-pass/session.js
@@ -1,5 +1,5 @@
 /* Une séance jouée comme un apprenant la joue : de vrais touchers, de vraies frappes.
-   playSession() est utilisé par days.js, corners.js et sweep.js. */
+   playSession() est utilisé par days.js, corners.js et sweep.js ; playConversation() par corners.js. */
 const path = require('path');
 const { sleep, SHOTS } = require('./common');
 const shot = (p, name, full) => p.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: !!full });
@@ -122,6 +122,50 @@ async function playSession(page, label, opts) {
   return { log, endText };
 }
 
+/* Une conversation, jouée jusqu'à son écran de fin : chaque réplique à dire est dite telle qu'elle
+   s'affiche. À chaque tour « vous » de n choix, on touche le choix `opts.pass % n` (passe 0 par défaut) :
+   en jouant les passes 0 à (plus grand n) - 1, chaque choix de chaque tour est touché. Rend { turns, finished, picks, lines, problems }. */
+async function playConversation(p, id, opts) {
+  const o = opts || {}, lines = [], problems = [], picks = [];
+  let turns = 0, finished = false, youSteps = 0;
+  for (let k = 0; k < 60; k++) {
+    await sleep(300);
+    if (await p.$('[data-step="again"]')) { finished = true; await shot(p, 'conversation-' + id + '-end', true); break; }
+    if (await p.$('[data-step="next"]')) { await p.click('[data-step="next"]'); continue; }
+    if (await p.$('[data-choice]')) {
+      const n = await p.evaluate(() => document.querySelectorAll('[data-choice]').length);
+      const pick = (o.pass || 0) % n;
+      picks.push(pick); youSteps++;
+      lines.push('  you step ' + (youSteps - 1) + ': choice ' + pick + ' of ' + n);
+      await p.click('[data-choice="' + pick + '"]');
+      continue;
+    }
+    if (await p.$('[data-act="accept"]')) { await p.click('[data-act="accept"]'); continue; }
+    const mic = await p.$('[data-mic="start"]');
+    if (!mic) {
+      const buttons = await p.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => JSON.stringify(b.dataset)).join(' '));
+      problems.push('conversation ' + id + ': no known button at step ' + k + ': ' + buttons);
+      await shot(p, 'conversation-' + id + '-unknown-' + k);
+      break;
+    }
+    const target = await p.evaluate(() => { const s = document.querySelector('[data-say][data-slow]'); return s ? s.dataset.say : ''; });
+    await p.evaluate(s => { window.__say = s; }, target);
+    await mic.click();
+    await sleep(450);
+    if (turns === 0 && o.firstShots) await shot(p, 'conversation-listening');
+    await p.click('[data-mic="stop"]', { force: true, timeout: 3000 });
+    const panel = await p.waitForSelector('.mic-panel.good, .mic-panel.bad', { timeout: 4000 }).then(e => e.getAttribute('class'), () => 'NEVER SCORED');
+    lines.push('  turn ' + turns + ' said ' + JSON.stringify(target) + ' -> ' + panel);
+    if (!/\bgood\b/.test(panel)) problems.push('conversation ' + id + ' turn ' + turns + ': « ' + target + ' » -> ' + panel);
+    if (turns === 0 && o.firstShots) await shot(p, 'conversation-scored');
+    turns++;
+    if (panel === 'NEVER SCORED') break;
+  }
+  lines.push('  ' + (finished ? 'finished after ' + turns + ' spoken turn(s)' : 'NOT FINISHED'));
+  if (!finished) problems.push('conversation ' + id + ' did not reach its end');
+  return { turns, finished, picks, lines, problems };
+}
+
 /* Une carte parlée : toucher le micro, « dire » la réponse (ou autre chose), toucher pour finir. */
 async function speak(p, label, opts, entry, answer) {
   const how = (opts.speakModes || [])[opts.speakCount.n] || 'mic-right';
@@ -163,4 +207,4 @@ function speakProblem(e) {
   return good(e) ? null : 'said right (' + e.speakMode + '), not marked right: ' + JSON.stringify({ panel: e.panel, heard: e.heard });
 }
 
-module.exports = { playSession, speakProblem, STUCK, shot };
+module.exports = { playSession, playConversation, speakProblem, STUCK, shot };
```
- [ ] **Step 4: `corners.js` loops over the scenarios.** Replace section 3 (from the comment `/* 3. Une conversation` up to the line before `/* 4. Le défi`), add `playConversation` to the `require`, and drop the back click that opened section 4 (each pass leaves by its own back click). The patch carries its `---`/`+++` header; `git apply` takes it as pasted (checked on a CRLF checkout), or apply by hand:

```diff
--- a/tools/learner-pass/corners.js
+++ b/tools/learner-pass/corners.js
@@ -1,8 +1,8 @@
 /* Ce qu'une séance ne montre pas : l'écoute (Comprendre, Répéter), une conversation
-   (chez le boulanger) et le défi, joués en touchant l'écran.
+   (chacune du cours) et le défi, joués en touchant l'écran.
      node tools/learner-pass/corners.js [dossier] */
 const { open, verdict, sleep } = require('./common');
-const { playSession, shot, STUCK } = require('./session');
+const { playSession, playConversation, shot, STUCK } = require('./session');
 
 (async () => {
   const A = await open();
@@ -54,44 +54,27 @@ const { playSession, shot, STUCK } = require('./session');
   await sleep(250);
   console.log('  end: ' + await screenText());
 
-  /* 3. Une conversation : chaque réplique à dire est dite telle qu'elle s'affiche. */
-  console.log('\nCONVERSATION s-bakker');
-  await p.evaluate(() => NL.ui.go('vandaag'));
-  await sleep(150);
-  await p.click('[data-scn="s-bakker"]');
-  let turns = 0, finished = false;
-  for (let k = 0; k < 40; k++) {
-    await sleep(300);
-    if (await p.$('[data-step="again"]')) { finished = true; await shot(p, 'conversation-end', true); break; }
-    if (await p.$('[data-step="next"]')) { await p.click('[data-step="next"]'); continue; }
-    if (await p.$('[data-choice]')) { await p.click('[data-choice="0"]'); continue; }
-    if (await p.$('[data-act="accept"]')) { await p.click('[data-act="accept"]'); continue; }
-    const mic = await p.$('[data-mic="start"]');
-    if (!mic) {
-      const buttons = await p.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => JSON.stringify(b.dataset)).join(' '));
-      problems.push('conversation: no known button at step ' + k + ': ' + buttons);
-      await shot(p, 'conversation-unknown-' + k);
-      break;
+  /* 3. Chaque conversation du cours : chaque réplique à dire est dite telle qu'elle s'affiche ;
+     une passe par rang de choix : à la passe q, le choix q % n à chaque tour « vous » (playConversation),
+     de 0 au plus grand nombre de choix d'un tour, moins un. */
+  const ids = await p.evaluate(() => NL.content.scenarios.map(s => s.id));
+  const passes = await p.evaluate(() => NL.content.scenarios.map(s => Math.max.apply(null, s.steps.filter(x => x.you).map(x => x.you.choices.length))));
+  for (let c = 0; c < ids.length; c++) {
+    console.log('\nCONVERSATION ' + ids[c]);
+    for (let q = 0; q < passes[c]; q++) {
+      console.log('  pass ' + (q + 1) + ' of ' + passes[c]);
+      await p.evaluate(() => NL.ui.go('praten'));
+      await sleep(150);
+      await p.click('[data-scn="' + ids[c] + '"]');
+      const r = await playConversation(p, ids[c], { pass: q, firstShots: c === 0 && q === 0 });
+      r.lines.forEach(l => console.log(l));
+      r.problems.forEach(x => problems.push(x));
+      await p.click('[data-step="back"]').catch(() => {});
     }
-    const target = await p.evaluate(() => { const s = document.querySelector('[data-say][data-slow]'); return s ? s.dataset.say : ''; });
-    await p.evaluate(s => { window.__say = s; }, target);
-    await mic.click();
-    await sleep(450);
-    if (turns === 0) await shot(p, 'conversation-listening');
-    await p.click('[data-mic="stop"]', { force: true, timeout: 3000 });
-    const panel = await p.waitForSelector('.mic-panel.good, .mic-panel.bad', { timeout: 4000 }).then(e => e.getAttribute('class'), () => 'NEVER SCORED');
-    console.log('  turn ' + turns + ' said ' + JSON.stringify(target) + ' -> ' + panel);
-    if (!/\bgood\b/.test(panel)) problems.push('conversation turn ' + turns + ': « ' + target + ' » -> ' + panel);
-    if (turns === 0) await shot(p, 'conversation-scored');
-    turns++;
-    if (panel === 'NEVER SCORED') break;
   }
-  console.log('  ' + (finished ? 'finished after ' + turns + ' spoken turn(s)' : 'NOT FINISHED'));
-  if (!finished) problems.push('the conversation did not reach its end');
 
   /* 4. Le défi : d'abord une séance, pour rencontrer des éléments, puis le défi, une faute toutes les trois cartes. */
   console.log('\nDÉFI');
-  await p.click('[data-step="back"]').catch(() => {});
   await p.evaluate(() => NL.ui.go('vandaag'));
   await playSession(p, 'defi-day', { wrongEvery: 0 });
   await p.evaluate(() => NL.ui.go('vandaag'));
```
- [ ] **Step 5: Create `tools/learner-pass/rules.js`** with this exact content:

```js
/* Les fiches de règle : le parcours, puis chaque pastille de règle (data-act="gram") touchée, et la
   feuille qui s'ouvre vérifiée à 390 px : le titre, la règle, l'explication et ses exemples sont
   là, et rien ne déborde. Les pastilles sont lues sur la page et le compte attendu vient du
   contenu : une règle de plus ne change rien ici.
     node tools/learner-pass/rules.js [dossier] */
const { open, verdict, sleep } = require('./common');

/* Ce que la page montre de la feuille ouverte. Tourne dans la page. */
function measureSheet() {
  const card = document.querySelector('.sheet-card');
  if (!card) return null;
  const text = sel => { const e = card.querySelector(sel); return e && e.getClientRects().length ? (e.textContent || '').trim() : ''; };
  const wide = Array.from(card.querySelectorAll('*')).filter(e => {
    const r = e.getBoundingClientRect();
    return r.width && r.right > window.innerWidth + 1;
  }).slice(0, 5).map(e => e.tagName + '.' + e.className + ' ' + (e.textContent || '').trim().slice(0, 30));
  return {
    title: text('h3'), rule: text('.rule'), explain: text('.explain'),
    rows: Array.from(card.querySelectorAll('.ex-row')).filter(e => e.getClientRects().length && (e.textContent || '').trim()).length,
    sw: document.documentElement.scrollWidth, cardOver: card.scrollWidth - card.clientWidth, wide
  };
}

/* Ce qui manque à la feuille d'une règle ; `want.rows` : ses exemples, trois au plus (la feuille n'en montre pas plus). */
function judgeSheet(id, m, want) {
  if (!m) return [id + ': no sheet opened'];
  const out = [];
  if (!m.title) out.push(id + ': the sheet has no title');
  if (!m.rule) out.push(id + ': the sheet shows no rule');
  if (!m.explain) out.push(id + ': the sheet shows no explanation');
  if (m.rows < want.rows) out.push(id + ': the sheet shows ' + m.rows + ' drill row(s), the rule has ' + want.rows);
  if (m.sw > 391 || m.cardOver > 1 || m.wide.length) out.push(id + ': wider than 390 px (' + m.sw + ', sheet over by ' + m.cardOver + ') ' + JSON.stringify(m.wide));
  return out;
}

async function main() {
  const A = await open();
  const p = A.page, problems = A.errors.map(e => 'console, before the rules: ' + e);
  /* Les règles que le cours liste sur ses unités : le compte attendu, avec leurs exemples. */
  const want = await p.evaluate(() => {
    const rules = {};
    let chips = 0;
    NL.content.units.forEach(u => (u.grammar || []).forEach(id => {
      const g = (NL.content.patterns || []).find(x => x.id === id);
      if (g) { rules[id] = Math.min(3, g.drills.length); chips++; }
    }));
    return { rules, chips };
  });
  await p.evaluate(() => NL.ui.go('leerpad'));
  await sleep(250);
  const chips = await p.evaluate(() => Array.from(document.querySelectorAll('[data-act="gram"]')).map(e => e.dataset.id));
  /* Une règle listée sur plusieurs unités a une pastille par unité et une seule feuille : une ligne par règle. */
  const ids = chips.filter((id, i) => chips.indexOf(id) === i);
  const rules = Object.keys(want.rules);
  console.log('RULES ' + ids.length + ' (' + chips.length + ' chips on the leerpad; the course lists ' + rules.length + ' rules on ' + want.chips + ' unit cards)');
  if (chips.length !== want.chips) problems.push('the leerpad shows ' + chips.length + ' rule chips, the course lists ' + want.chips);
  rules.filter(id => ids.indexOf(id) < 0).forEach(id => problems.push(id + ': listed by the course, no chip on the leerpad'));
  for (const id of ids) {
    const errsBefore = A.errors.length;
    await p.evaluate(i => { const e = document.querySelector('[data-act="gram"][data-id="' + i + '"]'); if (e) e.scrollIntoView({ block: 'center' }); }, id);
    await p.click('[data-act="gram"][data-id="' + id + '"]', { timeout: 3000 }).catch(e => { problems.push(id + ': tap failed: ' + e.message.split('\n')[0]); });
    await sleep(300);
    const m = await p.evaluate(measureSheet);
    const found = judgeSheet(id, m, { rows: want.rules[id] === undefined ? 1 : want.rules[id] });
    console.log('  RULE ' + id + ' « ' + (m ? m.title : '') + ' » rows ' + (m ? m.rows : 0) + ' width ' + (m ? m.sw : 0) + (found.length ? ' -> ' + found.length + ' fault(s)' : ' ok'));
    found.forEach(f => problems.push(f));
    A.errors.slice(errsBefore).forEach(e => problems.push(id + ': console ' + e));
    await p.click('[data-close="1"]', { timeout: 2000 }).catch(() => { problems.push(id + ': the sheet has no close button that works'); });
    await sleep(200);
  }
  await A.close();
  verdict(problems, 'EVERY RULE SHEET OPENS');
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { measureSheet, judgeSheet };
```
- [ ] **Step 6: Run the test, green.** `node test/tools/learner-pass.js .` ends exactly:

```
UNE CONVERSATION, PUIS CHACUNE
  touches : [[0,0,0,0],[1,1,1,1],[2,0,2,0]] ; bloquée : 1 problème(s)

LES FICHES DE RÈGLE

21 checks, LEARNER PASS TOOLS OK
```
- [ ] **Step 7: Install and run the pass in Edge on today's content.** In `tools/learner-pass/`: `npm ci --ignore-scripts` (ends `added 1 package, and audited 2 packages in …`, `found 0 vulnerabilities`). In the repo root: `sh build.sh`, `export LEARNER_PASS_CHANNEL=msedge`. Then `node tools/learner-pass/corners.js .`: exit 0, six blocks `CONVERSATION s-bakker`, `s-buur`, `s-trein`, `s-standup`, `s-koffie`, `s-status` in that order, each holding `  pass 1 of N` … `  pass N of N` (N = 2, 2, 2, 3, 3, 2) and each pass ending `  finished after K spoken turn(s)` (K = 4, 4, 3, 3, 4, 4 as before; 14 such lines in all, 169 lines of output in all), no `PROBLEM:` line (it took 118 s and 120 s in two runs; `rules.js` below, 7 s), the output ending:

```
LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH
```
  The block with a 3-choice step, as measured (s-koffie; its step 1 is the one of 3 choices):
```
CONVERSATION s-koffie
  pass 1 of 3
  you step 0: choice 0 of 2
  turn 0 said "’t Gaat wel, een beetje moe. En bij u?" -> mic-panel good
  you step 1: choice 0 of 3
  turn 1 said "Niks speciaals, en bij u?" -> mic-panel good
  you step 2: choice 0 of 2
  turn 2 said "Ah, ik heb de match ook gezien!" -> mic-panel good
  you step 3: choice 0 of 2
  turn 3 said "Tot straks!" -> mic-panel good
  finished after 4 spoken turn(s)
  pass 2 of 3
  you step 0: choice 1 of 2
  turn 0 said "Ja, redelijk druk. En bij u?" -> mic-panel good
  you step 1: choice 1 of 3
  turn 1 said "We hebben gewandeld met de kinderen." -> mic-panel good
  you step 2: choice 1 of 2
  turn 2 said "Ik volg het voetbal niet zo, eerlijk gezegd." -> mic-panel good
  you step 3: choice 1 of 2
  turn 3 said "Ja, tot later. Nog een goede dag!" -> mic-panel good
  finished after 4 spoken turn(s)
  pass 3 of 3
  you step 0: choice 0 of 2
  turn 0 said "’t Gaat wel, een beetje moe. En bij u?" -> mic-panel good
  you step 1: choice 2 of 3
  turn 1 said "Rustig gebleven, gelukkig." -> mic-panel good
  you step 2: choice 0 of 2
  turn 2 said "Ah, ik heb de match ook gezien!" -> mic-panel good
  you step 3: choice 0 of 2
  turn 3 said "Tot straks!" -> mic-panel good
  finished after 4 spoken turn(s)
```
  Then `node tools/learner-pass/rules.js .`: exit 0, exactly:
```
RULES 9 (14 chips on the leerpad; the course lists 9 rules on 14 unit cards)
  RULE g-v2 « The verb in second position » rows 3 width 390 ok
  RULE g-present « The present tense: stem, stem+t, stem+en » rows 3 width 390 ok
  RULE g-gegij « Ge and gij: what you really hear » rows 3 width 390 ok
  RULE g-getallen « Units before tens » rows 3 width 390 ok
  RULE g-halfuur « Half drie means 2:30 » rows 3 width 390 ok
  RULE g-dehet « De or het, and the extra -e » rows 3 width 390 ok
  RULE g-bezit « Mijn, uw, ons and onze » rows 3 width 390 ok
  RULE g-scheidbaar « Verbs that break in two » rows 3 width 390 ok
  RULE g-perfect-intro « The perfect tense with hebben » rows 3 width 390 ok

EVERY RULE SHEET OPENS
```
  A hang or a different count is a fault to report, not a reason to edit the expected lines. If Edge cannot launch (`Executable doesn't exist`), the step is blocked: say so in the ledger.
- [ ] **Step 8: Commit** the three scripts and the test (nothing under `src/`, so no build outputs): `test(learner-pass): play every conversation, open every rule sheet ({T-learner-pass})`.

Done when: `node test/tools/learner-pass.js .` ends `21 checks, LEARNER PASS TOOLS OK` and failed before the change; `corners.js` and `rules.js` print the lines above in Edge and exit 0; `git diff --stat` shows only `tools/learner-pass/{session,corners,rules}.js` and `test/tools/learner-pass.js`.

### Task 4: FAN grammar
Class: fan-out
Ticket: {T-grammar}
Kind: grammar
Drafting after: 1
Split: node tools/content/split.js . "<WS>/drafts/grammar"
Check: node tools/content/check.js "<WS>/drafts/grammar/<batch>"
Merged by: task 5
Why: The phase 4 design sitting of 28 October 2026 chose 13 grammar rules, each a pattern like the 9 the course has, listed
on 9 of the 22 new units (D10, D11, D15). Task 1's `RULES` fixes their ids and units; this task has them written. Split
cuts one batch per unit that holds a rule, named by the unit's id, one row per rule: `vragen 3`, `kunnen 1`, `doen 3`,
`mensen 1`, `waar 1`, `eten 1`, `cafe 1`, `wonen 1`, `kalender 1` (9 batches, 13 rows). A row's input says its rule
(`id`, the unit's id, number and names), `teach`, which says what the rule teaches and what it contrasts with (written for
the drafter, and not to be copied), and `words`, the Dutch of the unit's own words. The drafter writes the whole pattern: a
title, a one-line rule, an example sentence, an explanation and five drills (call 5). Check (task 1) holds each row to what
the course can verify: its shape, the spelling, the typographic apostrophe, the four tags, the Dutch of an explanation marked
and known, what `test/lang.js` guard 6d would refuse at Merge (a quoted passage that is not Dutch of the course, a Dutch word
of the course written bare in both languages), the rule's example and five drills of 3 to 8 tiles with a gap that is one tile
written once, nothing a learner has not been taught by the rule's unit, and no sentence that an earlier rule or one of the 9
hand patterns already writes. What no script can check is under Reader focus. Every row is course-written, so every row is on the
maintainer's reading list (D15) and none goes to the maintainer by rule; the readers are Opus, the kit's default (call 4).
Check reads the course, the spelling data, `src/content/grammar.js` and the other batches' `draft.json`: no download and no
`.cache/` are needed. No task
between this one and task 5 edits `RULES`, which the stamp covers (a rule's unit, number and `teach`), nor the words of
the 9 units, which the drafter reads. A row still disputed after its second reader is ruled by the run controller, on
the maintainer's behalf, in the ledger's Rulings (D23).

**A sentence written in two rules.** Check refuses a sentence that a rule earlier in `RULES` already writes in another
batch (`draft.json`, or `retry.json` in its place) or that one of the course's patterns writes: `drill 3 « … » is also
written by g-x`. Two batches drafted at the same time cannot see each other, so the same sentence can still be kept in
both, and it surfaces at Merge: task 5's Merge names every such pair in one line, `fail grammar -: <id> and <id> both
write « <sentence> »: one sentence, one rule`, and writes nothing. The same sentence in two rules would ask a learner one
question twice. For each pair the later rule is redrafted: the run controller changes that row's verdict in its batch's
`review.json` from `keep` to `dispute: « <sentence> » is also <other id>: write another sentence` and dispatches the
batch's controller (`batch-controller.md`, steps 4 and 5). If the batch already holds a `retry.json`, the redraft answers
every disputed row of the batch, not only this one, and the second reader reads them all (the redraft overwrites
`retry.json`, and a `retry-review.json` verdict for a row it no longer holds is refused by Check). Then task 5 runs Merge
again.

Notes:
- **Where this runs.** In the run's workspace, `<WS>/drafts/grammar`, after task 1 is done. Nothing is written to the
  worktree until task 5.
- **What Split cuts, and when it cuts nothing.** On a workspace that already holds batches it writes nothing and prints their
  lines. After task 5's Merge a second Split on a new folder cuts only the rules `grammar.a1c.js` lacks (see task 1).
- **No `.cache/` and no download.** Unlike plan 4a's words, nothing here reads the Wiktionary extract.
- **The input row.** `{id, stamp, copies, unit, n, name: {fr, en}, teach, words}`, where `words` is the Dutch of the unit's
  own words (`C.units[…].words`), 20 to 35 of them. The stamp is `2c728e89` for `g-twee-werkwoorden` (task 1's
  `stamp: [unit, n, teach]`).

**The proof.** On the copy `/c/Users/youss/.claude/jobs/5b75527c/tmp/fixZ` (branch `fix`; task 1 is its commit `b69fc14`,
`task 1 (fixed)`, on `ee7f7cf`). This task writes no file, so its changed lines were proved by running task 1's fixed Check
(`node tools/content/check.js "<ws4>/drafts/grammar/kunnen"`) on hand rows in `.../tmp/fixG-scratch/ws4`. Split into that
workspace printed the nine lines of the Why, exit 0, and the same nine again the second time. The example row of the Format below
as `draft.json` of the batch `kunnen`: `ok input.json 1 rows`, `ok draft.json 1 rows`, exit 0. Variants of it, each exit 1 with
the line quoted: gap « kome » (`gap « kome » is not a tile of the drill`); `rule` quoting « voilà » / “here you are”
(`rule.fr quotes « voilà », which is not Dutch of the course: a translation goes in parentheses, with no quotes`, and the same
for `rule.en`); `explain` quoting « pas de » / “no” (the same reason); `tijd` bare in both explanations (`explain: « tijd » is
Dutch of the course, written bare in fr and in en: put it in <i class="nl"> or <span class="ex">`); `werk` bare in `rule` and
in `title`; a `rule.fr` quote with no partner; `nl` « Ik heb gewerkt. » (`uses forms the course never teaches: gewerkt`); a drill
« Morgen ga ik naar Brussel. » (`is also written by g-v2`); the six sentences of the row written by `g-niet-geen` in the batch
`vragen` (`nl « Ik kan morgen komen. » is also written by g-niet-geen`, then the five drills the same way); and an unknown form with
`unsure` present, still refused. Not refused, as the Format says: `ik` bare in `explain.fr` only, and « kunnen » quoted in
`rule`. The example row is also accepted by `test/lang.js`: with it merged into a scratch copy's `grammar.a1c.js`,
`node test/lang.js .` ended `25093 contrôles, LANGUE CONFORME` (408 seconds). The example in the Format is the very row I checked.
The full Check rules are task 1's block in `test/tools/fanout.js`.

#### Format

```json
{"id":"g-twee-werkwoorden","stamp":"2c728e89","title":{"fr":"Deux verbes : le second part à la fin","en":"Two verbs: the second goes to the end"},"rule":{"fr":"Le verbe conjugué reste deuxième, l’infinitif file à la fin.","en":"The conjugated verb stays second, the infinitive goes last."},"nl":"Ik kan morgen komen.","fr":"Je peux venir demain.","en":"I can come tomorrow.","explain":{"fr":"Avec <i class=\"nl\">kunnen</i>, <i class=\"nl\">moeten</i>, <i class=\"nl\">willen</i> ou <i class=\"nl\">mogen</i>, le verbe conjugué reste en <b>deuxième</b> position et l’autre verbe part à la <b>fin</b>, à l’infinitif : <span class=\"ex\">Ik kan morgen komen</span>. En français les deux verbes restent côte à côte (je peux venir demain) ; en néerlandais, tout le reste de la phrase se glisse entre eux.","en":"With <i class=\"nl\">kunnen</i>, <i class=\"nl\">moeten</i>, <i class=\"nl\">willen</i> or <i class=\"nl\">mogen</i>, the conjugated verb stays in <b>second</b> position and the other verb goes to the <b>end</b>, as an infinitive: <span class=\"ex\">Ik kan morgen komen</span>. French keeps the two verbs side by side; Dutch puts the rest of the sentence between them."},"drills":[{"nl":"Ik moet vandaag werken.","fr":"Je dois travailler aujourd’hui.","en":"I have to work today.","gap":"werken"},{"nl":"Wij willen morgen komen.","fr":"Nous voulons venir demain.","en":"We want to come tomorrow.","gap":"komen"},{"nl":"Kun je morgen komen?","fr":"Peux-tu venir demain ?","en":"Can you come tomorrow?","gap":"komen"},{"nl":"Hij wil thuis blijven.","fr":"Il veut rester à la maison.","en":"He wants to stay home.","gap":"blijven"},{"nl":"Zij mogen hier niet werken.","fr":"Ils n’ont pas le droit de travailler ici.","en":"They may not work here.","gap":"werken"}]}
```

- One row per input row, in its order. Copy `id` and `stamp` unchanged, then give `title`, `rule`, `nl`, `fr`, `en`,
  `explain` and `drills`, and no other field except `unsure`.
- A row is the pattern of one rule, the same shape as the 9 of `src/content/grammar.js`, which are your model for the
  voice and the length: read three of them first (`g-v2`, `g-scheidbaar`, `g-perfect-intro`). Their explanations use
  tags Check refuses (`<b class="nl">`, and `<span class="nl">` outside a title): write only the tags below.
- The input row's `teach` says what the rule teaches, and what it contrasts with. It is your brief, not your text: say it in
  your own words, for a learner who speaks French and works in Flanders. `words` lists the Dutch of the unit's own words;
  use them where they fit, they are the newest the learner has.
- `title` is `{ "fr": …, "en": … }`: the rule's name, short, as a heading. It may mark Dutch with
  `<span class="nl">…</span>` and uses no other tag.
- `rule` is `{ "fr": …, "en": … }`: the rule in one sentence, 70 signs at most in each language (the sheet shows it on one
  line), no tag. It may quote a Dutch word between « » in French and “ ” in English; Dutch of the course written without
  quotes in both languages is refused (`rule: « werk » is Dutch of the course, written bare in fr and in en`).
- `nl`, `fr`, `en` are the rule's example sentence, the one the sheet opens with: one line, the Dutch and its two
  meanings. Use `{naam}`, `{stad}` and `{bedrijf}` for a person, a town and an employer, and write no other name. The
  example is held to the course's order like a drill: a participle or a plural that it carries must be the gap of one of
  the five drills, or Check refuses it (`nl « … » uses forms the course never teaches`, or `borrows from a later unit`).
- `explain` is `{ "fr": …, "en": … }`, HTML of four tags only: `<b>…</b>`, `<i>…</i>`, `<i class="nl">…</i>` and
  `<span class="ex">…</span>`, properly nested, on one line, 876 characters at most in each language (the longest the
  course has). Every Dutch word is inside `<i class="nl">` and every Dutch sentence inside `<span class="ex">`, and at
  least one of them appears. Write no bare Dutch outside them: not `ik`, `jij`, `niet`, `geen`, `het`, `dat`, `omdat`,
  `want`, `maar` or any other word only Dutch writes. Check refuses a Dutch word of the course that `explain.fr` and
  `explain.en` both write bare (`explain: « tijd » is Dutch of the course, written bare in fr and in en`); one that only a
  side writes is for the reader to find. A bare `<i>` is for French or English emphasis: a word that
  `explain.fr` and `explain.en` both put in `<i>` is Dutch, and Check asks for `class="nl"`. `explain.fr` quotes no English
  and `explain.en` no French sentence. Say the contrast with French in words (« French keeps the two verbs side by side »).
  `rule` and `explain` put between « » (French) or “ ” (English) only Dutch of the course (and the Dutch of the row's
  own sentences); a French or English word goes bare or in parentheses, with no quotes (`Le français a ses propres petits
  mots (le, la, lui, se)`). Check refuses a quoted passage that is not Dutch of the course (`explain.fr quotes « pas de »,
  which is not Dutch of the course: a translation goes in parentheses, with no quotes`), a quote mark with no partner, and
  a Dutch word of the course written bare in both languages in `rule`, `explain` or `title`: the same test as `test/lang.js`
  guard 6d (task 1's `test/lib/quoted.js`), so the row is not refused at Merge for it.
- `explain.fr` and `explain.en` say the same thing, in the same order, with the same Dutch examples. Write the rule, then
  one or two examples, then the contrast with French and the trap. A phone shows it in a sheet: short sentences, no table.
- `drills` is a list of exactly 5 `{ "nl", "fr", "en", "gap" }`, five different sentences, each of 3 to 8 tiles (a tile is a
  word as the learner moves it: `NL.util.tiles` splits on spaces and drops `. , ! ? ; : " ( )`; the longest drill the course
  has is 8). A drill is a reorder, a cloze and a typing exercise at once, so write what a Flemish colleague says at work,
  whole and natural, and no fragment.
- `gap` is the word the cloze hides: exactly one tile of `nl`, written as `nl` writes it up to the case and without the
  punctuation (« geen » for « Geen idee. »), and that word occurs once in the sentence (Check refuses « komen » in
  « Wij willen komen en komen. »; the cloze hides the first, so the second could never be answered). It is the form the rule
  teaches, not an easy word: the learner who fills it has understood the rule.
- Write nothing the learner has not been taught by the rule's unit: the words of the unit, of the units before it, and the
  gap. Check names the forms it finds ahead (« borrows from a later unit ») or that the course never teaches (« uses forms
  the course never teaches »): pick other words from `words` or from the early units. A form that OpenTaal and
  `test/data/flemish.tsv` do not know is refused (`is not Dutch that OpenTaal or flemish.tsv knows: pick another word`):
  `unsure` does not lift it.
- Spell Dutch as OpenTaal or `test/data/flemish.tsv` spells it. Write the typographic apostrophe, « ’ », and no straight
  `'` or `"`, in every field. `fr` is Belgian French (« septante », « le GSM »), `en` plain English; in one sentence `fr` and
  `en` hold the same digits and the same `{…}` tokens as `nl`.
- Write Flemish as a colleague speaks it today: `je` and `jij` in the drills, `ge` and `gij` only where `teach` says the
  rule is about them. The northern word is not wrong, but it is not this course's first word.
- Within a batch and across batches, write each sentence once: two rules that each write « Ik kan morgen komen. » are one
  sentence too many. Check refuses a sentence that an earlier rule's batch or one of the 9 hand patterns already holds, but
  not a batch being drafted at the same time as yours; before you finish, read what the others have drafted so far
  (`grep -ho '"nl": *"[^"]*"' "<batch>"/../*/draft.json`) and the hand patterns' (`grep -hoE "(nl: |D\()'[^']*'"
  src/content/grammar.js`).
- A row you doubt carries `"unsure": "<why, in one line>"`. Check still checks it, and the reader reads it first.
- A verdict carries `id` and `verdict`, and no other field. No row goes to the maintainer by rule.

#### Reader focus

- Is the rule true, and as large as the row says? Dispute an overstated rule (« always », « never ») where Dutch has an
  exception a learner will meet, and a rule the input's `teach` does not ask for. Quote the case that breaks it.
- Is the contrast with French right, and is it the one that trips a French speaker? Dispute an explanation that teaches
  what French already does, or states the French wrongly.
- Is the Dutch natural, at work, in Flanders? Dispute a sentence no one says, a northern word where Flanders says another,
  `u` beside `je` in one set of drills, and a drill that is a fragment.
- Is the gap the form the rule teaches? Dispute a gap on an easy word (« ik »), and a cloze with two answers: if another
  word fits the gap as well as the gap does, the learner who writes it is marked wrong for being right.
- Does each drill work as a reorder? Dispute a sentence with two correct word orders (a time phrase that can come first or
  after), because the tiles will mark the second as a mistake.
- Do the five drills test the rule, differently? Dispute five sentences of one shape, and a drill that tests a word of
  vocabulary and not the rule.
- Do `fr` and `en` mean what `nl` says, and is each natural, the French Belgian? Dispute a word-for-word gloss and an `en`
  that follows the Dutch order.
- Do `explain.fr` and `explain.en` say the same thing? Dispute a difference of content, an example in one that the other
  lacks, and a length that will not read on a phone.
- Is the title short, and the rule one line that says what the explanation says?
- Is every Dutch passage of an explanation marked, and every marked passage Dutch? Dispute a French word in `<i class="nl">`.
- Does a sentence repeat another rule's, or an example of one of the 9 hand patterns?
- `unsure` rows first.

### Task 5: Merge grammar
Class: mechanical
Ticket: {T-grammar}
Merges: grammar
Promises: none
Why: D10, D11 and D15. Task 4's drafters, its readers and the run controller have settled every row of the kind
`grammar`, and this task carries the 13 rules into `src/`: `tools/content/merge.js` runs task 1's kind, whose `write`
rewrites `src/content/grammar.a1c.js` whole from `RULES` and the taken rows, in `RULES` order, and the page lists each
rule on its unit at load. The kind writes no table, and its stamp covers nothing Merge writes, so a second run of Merge
rewrites the same file byte for byte: running it twice is harmless. The 13 rules are 13 new items of the course (a
pattern is one item), so everything that counts the course moves, and this task reports the numbers. Five things change
in the tests, each named here. **`AHEAD_BUDGET`** (`test/content.js`): a rule's gap is a form its unit now teaches, and
an example sentence of an earlier or the same unit that already used that form becomes « ahead » the moment the rule
lands (« Ik neem twee broodjes mee. » of `dedag` and `bakker` uses « broodjes », which `g-meervoud` teaches at `eten`). The
rule borrowed nothing; a word is taught later than sentences that have it. The task sets `AHEAD_BUDGET` to the measured
count, with the cause in its comment, and lists the sentences in its return; plan 4c, which writes the new units'
sentences, may lower it (the header's call 6). `HOLLOW_BUDGET` stays 3. **`test/tools/fanout.js`**: its older blocks
empty `lexicon.a1c.js` (`beforeWords`) so the kit tests on its own examples; once `grammar.a1c.js` holds rules, those
copies load rules whose units are gone and the whole suite stops at load. The fix moves `beforeGrammar` up beside
`beforeWords` and has `beforeWords` call it first. **`test/engine.js`**: its « la séance suit l'arriéré » block gives the
session an arrears of 1,000 due items; the course now holds 1,048 items, and the 1,000th falls 8 words before the end of a
unit, which leaves fewer than the reserve of 9 meetings. A smaller arrears (990) keeps the block's intent. **`test/pace.js`**: two comment lines quote
the size of the grown course the fifth run learns (1,172 counted items after the merge, not 1,192) and of the real course
(1,048, not 1,035); the run itself passes unchanged. **`test/lang.js`** reads every field of the 13 rows, with guard 6d,
which Check mirrors since task 1 (`test/lib/quoted.js`): a row that passed Check has no quote or bare Dutch word for it
to refuse (see step 7).

Files:
- Modify (Merge writes it): `src/content/grammar.a1c.js`
- Modify (the build writes them): `index.html`, `artifact.html`
- Modify: `test/content.js` (`AHEAD_BUDGET`, the line `const AHEAD_BUDGET = ` and the message under it)
- Modify: `test/tools/fanout.js` (`beforeGrammar` moves up; `beforeWords` calls it)
- Modify, only if step 6 says so: `test/engine.js` (the arrears list of « la séance suit l'arriéré »)
- Modify (comment only): `test/pace.js` (the two lines on the grown course, step 7)
- Create, outside the repository: `<WS>/tmp/ahead.js`
- Test: `node test/content.js .`, `node test/tools/fanout.js .`, `node test/engine.js .`, `node test/lang.js .`,
  `node test/pace.js . 200 one groot`, then the whole suite, `sh test/run-all.sh`

Interfaces:
- Consumes: task 1's `tools/content/kinds/grammar.js` (`RULES`, `patterns`, `write`) and the 13 settled rows of
  `<WS>/drafts/grammar` (task 4).
- Produces: `src/content/grammar.a1c.js` with 13 `P({…})` and the load loop listing 13 ids; 13 rules on 9 units
  (`vragen` 3, `kunnen` 1, `doen` 3, `mensen` 1, `waar` 1, `eten` 1, `cafe` 1, `wonen` 1, `kalender` 1).

Notes:
- Comments and messages in `test/content.js`, `test/engine.js` and `test/tools/fanout.js` are French, as around them.
- **Run Merge as often as you like.** A second run prints the same two lines and the file is identical (`cmp`).
  To start over: `git checkout -- src/content/grammar.a1c.js`.
- **No row may be left unsettled.** Merge refuses, listing them, rows with no verdict chain, and writes nothing. The 13
  rules are the plan's: a row ruled `drop` would leave a rule out, which is a design change, not this task's. Stop and
  report it.
- **Two rules that write one sentence.** Check reads a row at a time; Merge sees all 13. If two rows (or a row's example
  and another's drill) write the same sentence, Merge prints one line, `fail grammar -: <id> and <id> both write
  « <sentence> »: one sentence, one rule`, exits 1 and writes nothing. Do not edit a draft. Stop and report the line; the
  run controller redrafts the later rule as task 4's Why says, and this task runs again from step 2.
- **A `fail grammar -: … is not a unit of the course` or `… already the id of …`** cannot happen unless `RULES` or the
  course moved after task 1. Stop and report it.
- **The sentences of the 13 rows were ruled by the drafters, not by this task.** Nothing in this task edits a row.
  Check refuses a quoted passage that is not Dutch of the course and a Dutch word of the course written bare in both
  languages (task 1's `test/lib/quoted.js`, the code of guard 6d), so `test/lang.js` finds nothing of that kind in a row
  that passed Check; if it does (step 7), Check and the guard disagree, which is a fault of the kit.
- **What the counts depend on.** Every number below marked `the measured count` depends on the drafted rows. The proof's
  figures are in brackets; they are one real set of 13 rows' worth, not the run's.
- **The proof.** On the copy `/c/Users/youss/.claude/jobs/5b75527c/tmp/fixZ` (a CRLF clone, branch `fix`, from `ee7f7cf`;
  tasks 1, 2 and 3 are its commits `b69fc14`, `f61e4b5` and `fb406a4`; this task is its commit `410da6a`, `task 5 (fixed)`).
  The rows are the 13 that I wrote by hand, one per rule, in a workspace
  (`/c/Users/youss/.claude/jobs/5b75527c/tmp/fixG-scratch/ws5`) cut by `node tools/content/split.js` (9 batches), each with a
  `draft.json` row passing task 1's fixed `node tools/content/check.js "<ws>/drafts/grammar/<batch>"` and a `review.json`
  of `keep` for every row; their gaps, in order, are `geen niet Geen niet geen` (g-niet-geen), `ben komt heb
  heb woont` (g-bijzin), `Werk woon kom Heb doe` (g-vraag), `werken komen komen blijven werken` (g-twee-werkwoorden),
  `gegaan gekomen gebleven gekomen geweest` (g-perfect-zijn), `hadden kon moest waren wou` (g-was-had), `gedaan genomen
  geschreven gegeven gezeten` (g-deelwoord), `hem haar zich hem haar` (g-hem-haar), `zijn is zijn er is` (g-er-is),
  `broodjes tafels kaartjes mannen auto’s` (g-meervoud), `Neem maar Zeg Komt Kijk` (g-gebiedend), `huisje lampje tuintje
  koffietje huisje` (g-verkleinwoord), `Op in om op In` (g-om-op-in). Every figure below was counted on that copy; the
  `before` figures on a copy of `fb406a4` before the merge (`.../fixG-scratch/t5b`), the `after` figures on the commit
  itself. The red of step 4 (`LOAD FAIL`), of step 5 (the one `FAIL` of the budget) and of step 6 (the one `FAIL` of the
  arrears) were run on `fb406a4` with the merged `grammar.a1c.js` and the old test files.

- [ ] **Step 1: Keep the numbers from before.** On the tree as it stands (task 4 done, nothing merged):
  ```
  mkdir -p "<WS>/tmp"
  sh build.sh | tail -n 1 > "<WS>/tmp/build-5-before.txt"
  node test/content.js . > "<WS>/tmp/content-5-before.txt"
  node test/lang.js . > "<WS>/tmp/lang-5-before.txt"
  node test/engine.js . > "<WS>/tmp/engine-5-before.txt"
  node test/pace.js . > "<WS>/tmp/pace-5-before.txt"
  node test/journey.js . nl-BE OPR > "<WS>/tmp/journey-5-before.txt"
  node test/smoke.js . > "<WS>/tmp/smoke-5-before.txt"
  ```
  Expected: content ends `<c> contrôles, CONTENU CONFORME` and prints `  séquence        129 / 557 phrases empruntent
  en avant (budget 129)` (a task of plan 4a set it; if it prints another figure, use that one as `<b>` below) and
  `exercices       <n> construits, 0 échec(s), 3 échelon(s) de secours`; lang ends `LANGUE CONFORME`; engine ends
  `361 checks, ENGINE OK`; pace ends `10 vérifications, AUCUN PROBLÈME`; journey ends `<n> checks, NO PROBLEMS`; smoke
  ends `ALL CHECKS PASSED` and prints `items           <i>  (words <w>, phrases <p>, patterns 9)`. In the proof, with
  the course at `fb406a4` (tasks 1, 2 and 3): build 854948 / 854334 bytes, content `CONTENU — 1035 éléments`, `7436 contrôles`,
  `5392 formes vérifiées`, `16364 construits`; lang `25084 contrôles`, `néerlandais nu  1420 champs lus en deux
  langues, 13 exceptions`; smoke `items 1035 (words 912, phrases 114, patterns 9)`; journey `2871 checks, NO PROBLEMS`.
  The build sizes and the counts of `test/content.js` and `test/tools/fanout.js` are those of this chain: each earlier task
  that adds a file or a check moves them, so re-measure them at the replay. Then write `<WS>/tmp/ahead.js`, with the
  Write tool:
  ```js
  /* Les phrases d'exemple qui empruntent en avant, et à quelle unité : pour le retour de la tâche 5. */
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
  and run `node "<WS>/tmp/ahead.js" . > "<WS>/tmp/ahead-5-before.txt"`. Expected: its last line is
  `<b> phrases empruntent en avant` (129 in the proof), the same `<b>` as content's `séquence` line.

- [ ] **Step 2: Run Merge.**
  ```
  node tools/content/merge.js . "<WS>/drafts/grammar"
  ```
  Expected: exit 0, and exactly these two lines:
  ```
  ok grammar 13 taken, 0 dropped
  ok grammar.a1c.js 13 rules in 9 units
  ```
  `git diff --stat` then shows `src/content/grammar.a1c.js` only. Run it a second time: the same two lines, and
  `git diff` is unchanged (in the proof `cmp` of the file before and after said nothing). If a line starts with `fail`,
  Merge wrote nothing: stop and report the lines (Notes).

- [ ] **Step 3: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (<n> bytes), artifact.html (<m> bytes)`, both larger than in
  `build-5-before.txt` (879115 and 878501 in the proof).

- [ ] **Step 4: `test/tools/fanout.js`: `beforeGrammar` moves up.** First see it red, on the tree as it stands (the file
  not yet edited):
  ```
  node test/tools/fanout.js .
  ```
  Expected: exit 1 and, as its last line,
  ```
  LOAD FAIL src/content/grammar.a1c.js: grammar.a1c.js : la règle g-niet-geen veut l’unité « vragen », que le cours n’a pas (lexicon.a1c.js se charge avant)
  ```
  (seen on the copy). Now in `test/tools/fanout.js`, take out these
  three lines from the block `/* … le genre grammar */` (the line `const GR = path.join(TMP, 'regles');` is above them, the
  line `beforeGrammar(GR);` stays below them):
  ```js
      /* Le cours d'une copie tel qu'il était avant la fusion du genre grammar : le fichier vidé. */
      const beforeGrammar = dir => fs.writeFileSync(path.join(dir, 'src', 'content', 'grammar.a1c.js'),
        require(path.join(dir, 'tools', 'content', 'kinds', 'grammar')).patterns([]).map(l => l + '\n').join(''));
  ```
  and put these three lines above the comment that begins `/* Le cours d'une copie de fixture tel qu'il était avant la
  tranche des unités 13 à 34`, at the file's top level (after the line that begins `const put = (dir, file, v) =>`):
  ```js
  /* Et grammar.a1c.js vidé par l'écrivain du genre grammar : ses règles veulent des unités du lexique, que le lexique vidé n'a plus. */
  const beforeGrammar = dir => fs.writeFileSync(path.join(dir, 'src', 'content', 'grammar.a1c.js'),
    require(path.join(dir, 'tools', 'content', 'kinds', 'grammar')).patterns([]).map(l => l + '\n').join(''));
  ```
  and make `beforeWords` call it first: after the line `const beforeWords = dir => {` insert the line
  `  beforeGrammar(dir);`. Then
  ```
  node test/tools/fanout.js .
  ```
  Expected: exit 0 and `613 contrôles, KIT CONFORME` (the same count as before this task, on the chain of tasks 1 and 2:
  nothing was added or removed, a definition moved), with the line `  grammar        13 règles, 9 unités ; chaque garde, la boucle de chargement, Merge de bout en bout, relancée, second Split`.

- [ ] **Step 5: `test/content.js`, and the suites that read the course.** Run
  ```
  node test/content.js .
  ```
  Read the `séquence` line:
  - if it still says `<b> / <s> phrases empruntent en avant (budget <b>)`, there is nothing to do here: exit 0,
    `<c'> contrôles, CONTENU CONFORME`;
  - if there is one `FAIL` line (the proof's, seen on the old test file),
    ```
    FAIL: 130 phrases d’exemple empruntent du vocabulaire à une unité ultérieure, budget 129 — baisser le budget quand on en corrige, jamais le lever (sa seule hausse, de 61 à 129, comptait des emprunts qui existaient déjà : les unités 13–34 les ont révélés)
    ```
    the count rose to `<a>`: then in `test/content.js` replace the one line
    ```js
      const AHEAD_BUDGET = 129;
    ```
    with these (the comment the line already has stays where it is; put the three new comment lines directly above the
    `const`, below it, and write `<a>`; name in the comment the form or forms the diff further down shows)
    ```js
      /* Les règles de grammar.a1c.js l'ont fait monter de 129 à <a> : le trou d'une règle enseigne sa forme à l'unité
         qui la liste, et « <forme> » (<règle>, à <unité>) fait emprunter en avant « <phrase> » (<unité>), qui l'écrivait
         déjà. La règle n'a rien emprunté : un mot de plus est enseigné, plus tard que des phrases qui l'ont. */
      const AHEAD_BUDGET = <a>;
    ```
    and, in the message of the next `ok(` (the one that ends `jamais le lever (sa seule hausse, de 61 à 129, comptait des
    emprunts qui existaient déjà : les unités 13–34 les ont révélés)`), replace `sa seule hausse, de 61 à 129,` by
    `ses seules hausses, de 61 à 129 puis à <a>,` and `les unités 13–34 les ont révélés` by `les unités 13–34 et les règles
    de grammar.a1c.js les ont révélés`; and `comptait` by `comptaient`, which the plural now asks. The proof: `<a>` is 130, the form « broodjes » (`g-meervoud`, `eten`), the sentence
    « Ik neem twee broodjes mee. » (`dedag`). The comment's second line in the proof names `g-meervoud`.
    Run `node test/content.js .` again: `séquence        <a> / 557 phrases empruntent en avant (budget <a>)`, exit 0,
    `<c'> contrôles, CONTENU CONFORME`. With the budget one too high (`<a> + 1`) the run prints one `FAIL`,
    `seulement <a> phrases empruntent en avant : baisser AHEAD_BUDGET à <a> pour verrouiller le gain` (both ways);
  - if the `FAIL` is that line, `seulement <a> phrases empruntent en avant : baisser AHEAD_BUDGET à <a> …`, the count
    fell (a merged rule can move a word's first unit earlier, as `blijven` goes from `doen` to `kunnen` below): set
    `AHEAD_BUDGET` to `<a>`, say in the comment above it which rule moved which form to an earlier unit (the diff of
    `ahead.js` below shows it), and change the two messages as for a rise (`ses seules hausses, de 61 à 129 puis à <a>`
    becomes the right words for a fall: `puis à <a>` stays); the messages of the `ok(` lines keep their text otherwise.
  Any other `FAIL` line: stop and report it; it is not this task's. The line `exercices` must still end `3 échelon(s) de
  secours`: `HOLLOW_BUDGET` does not move (in the proof, `16364 construits` became `16481`).
  Then list the sentences for the return:
  ```
  node "<WS>/tmp/ahead.js" . > "<WS>/tmp/ahead-5-after.txt"
  diff "<WS>/tmp/ahead-5-before.txt" "<WS>/tmp/ahead-5-after.txt"
  ```
  Expected: the lines that changed are the sentences whose set of forms ahead grew, and the count line. In the proof:
  ```
  49c49
  < bakker:w22  Ik neem twee broodjes mee.  → neem (onderweg)
  ---
  > bakker:w22  Ik neem twee broodjes mee.  → neem (onderweg), broodjes (eten)
  66c66
  < thuis:w24  Een rustige straat, zonder veel auto’s.  → zonder (waar)
  ---
  > thuis:w24  Een rustige straat, zonder veel auto’s.  → zonder (waar), auto’s (eten)
  100a101
  > dedag:w4  Ik neem twee broodjes mee.  → broodjes (eten)
  124c125
  < weekend:w7  Dit weekend blijven wij thuis.  → blijven (doen)
  ---
  > weekend:w7  Dit weekend blijven wij thuis.  → blijven (kunnen)
  126c127
  < weekend:w16  Een rustige straat, zonder veel auto’s.  → zonder (waar)
  ---
  > weekend:w16  Een rustige straat, zonder veel auto’s.  → zonder (waar), auto’s (eten)
  130c131
  < 129 phrases empruntent en avant
  ---
  > 130 phrases empruntent en avant
  ```
  The count rises by the sentences that gain their first form ahead (one here); a sentence that already borrowed and
  borrows one more form does not count twice. Report all the changed lines.

- [ ] **Step 6: `test/engine.js`: the arrears fixture.** Run
  ```
  node test/engine.js .
  ```
  Expected, in the proof, on the old file and the merged course: one `FAIL`,
  ```
  FAIL: 1000 items due: 8 new, not the reserve of 9 computed on the 30 base places
  ```
  and `361 checks, 1 FAILED`. The block gives the session `n` due items (the oldest first) and expects the session to hold
  the reserve of 9 fresh items (`engine.js`, « la séance suit l'arriéré »). The fresh items come from the unit where the due ones
  stop, so the figure depends on where item `n` lands, and 13 new items moved it. If the run is green, there is nothing to
  do. If a line like the one above fails, find the largest arrears that leaves at least 9 meetings in its stopping unit,
  trying `n` = 990, 980, … (the three other pairs of the list stay as they are) and replace, in the line
  `[[39, 30], [40, 31], [440, 41], [1000, 41]].forEach(([n, places]) => {`, the pair `[1000, 41]` by `[<n>, 41]`, with
  these three lines above the line (French):
  ```js
      /* Les rencontres viennent de l'unité où s'arrêtent les dus : le dernier arriéré doit en laisser au moins neuf (la
         réserve) dans cette unité. 1 000 dus s'arrêtaient à huit mots de la fin de « reis » quand les 13 règles de
         grammar.a1c.js ont décalé les éléments ; 990 en laisse dix-huit. */
  ```
  (write the figures you find: `<n>`, the stopping unit, how many meetings it leaves). In the proof `<n>` is 990, which
  leaves 18; the block's other three pairs hold. Then `node test/engine.js .`. Expected: `361 checks, ENGINE OK`, with the
  line `   990 dus : 32 révisions + 9 rencontres = 41 places`. Never change another threshold of the file.

- [ ] **Step 7: `test/lang.js`, and the suites that read the course.**
  ```
  node test/lang.js .
  ```
  Expected: exit 0 and `LANGUE CONFORME`; in the proof `25084 contrôles` became `25201`, and `néerlandais nu  1420 champs lus en deux langues` became `1459` (the 13 rows' fields; the
  exceptions stay 13), `guillemets      0 citations hors du néerlandais du cours (exigé : 0), 11 exceptions` unchanged. The row
  texts are read by guard 6d, which Check refuses the same cases of since task 1 (one module, `test/lib/quoted.js`). The
  three shapes the guard refuses, and so Check does, are the advice to the drafters of task 4:
  - a French word between « » or “ ”: « Le français a ses « le », « la », « lui » et « se » » (text between quotes must be
    Dutch of the course; a translation goes in parentheses, with no quotes: `Le français a ses propres petits mots (le, la,
    lui, se)`);
  - a Dutch word of the course bare in both languages of a rule, an explanation or a title, outside `<i class="nl">` and
    `<span class="ex">`;
  - a foreign quote inside `rule` (`« -en »` where `-en` is not a word of the course).
  A `FAIL` here for one of these shapes means Check and the guard disagree: stop and report it as a fault of the kit, not as
  a row to dispute. Any other `FAIL` names a row's field: do not add a word to `QUOTE_OK` or `SHARED_OK` for a row; stop
  and report each `FAIL` line with its row `id`: the run controller changes that row's verdict in its batch's
  `review.json` from `keep` to `dispute: <the FAIL line>` and dispatches the batch's controller (task 4's Why), then this
  task runs again from step 2. Then:
  ```
  node test/dehet.js .
  node test/smoke.js . > "<WS>/tmp/smoke-5-after.txt"
  node test/pace.js . > "<WS>/tmp/pace-5-after.txt"
  node test/journey.js . nl-BE OPR > "<WS>/tmp/journey-5-after.txt"
  node test/pace.js . 200 one groot
  ```
  Expected: `DE/HET : TOUT EST CONFORME`; smoke ends `ALL CHECKS PASSED` and prints `items           1048  (words 912,
  phrases 114, patterns 22)` in the proof, that is `<i> + 13` and `patterns 22`; pace ends `10 vérifications, AUCUN PROBLÈME`;
  journey ends `<n> checks, NO PROBLEMS` (2871 before and 2870 after in the proof: the count follows the exercises drawn);
  `pace.js . 200 one groot` (the suite's fifth pace run) ends `12 vérifications, AUCUN PROBLÈME` and prints
  `arriéré maximum                       722` and `éléments au catalogue                 1172` (755 and 1192 before the merge).
  Never change a threshold of `test/pace.js` or `test/journey.js`. The grown course shrinks, since `test/lib/grow.js`
  grows it to at least 1,160 items from the real course's units: in `test/pace.js`, in the comment before the fifth run,
  replace `(1 192 comptés)` by `(1 172 comptés)` and `Le vrai cours en compte 1 035` by `Le vrai cours en compte <i>`
  (`1 048` in the proof, the `items` figure of smoke), and no other line (the dated measure further down, « 650 sur 1 035 »,
  stays: task 8 leaves it).

- [ ] **Step 8: The whole suite.**
  ```
  sh test/run-all.sh
  ```
  Expected: every suite passes and the last line is `TOUTE LA SUITE EST PASSÉE`. Any failure: stop and report it.

- [ ] **Step 9: Report what moved.**
  ```
  diff "<WS>/tmp/content-5-before.txt" <(node test/content.js .)
  diff "<WS>/tmp/engine-5-before.txt" <(node test/engine.js .)
  diff "<WS>/tmp/pace-5-before.txt" "<WS>/tmp/pace-5-after.txt"
  diff "<WS>/tmp/journey-5-before.txt" "<WS>/tmp/journey-5-after.txt"
  diff "<WS>/tmp/smoke-5-before.txt" "<WS>/tmp/smoke-5-after.txt"
  ```
  (or diff the saved before-files with files you re-save after the merge.) In the return, give Merge's two lines, the
  build's sizes before and after, `test/content.js`'s count and its `séquence` line before and after (and
  `AHEAD_BUDGET`'s new value with the sentences of the `diff` of step 5), the engine pair that moved, `test/lang.js`'s
  lines, and the lines that moved in pace, journey and smoke. What the proof measured (the real run's are
  `the measured count`). The sizes and the counts of `test/content.js` and `test/tools/fanout.js` are those of the chain of
  tasks 1, 2 and 3; re-measure them at the replay:

  | file | before (`fb406a4`) | after (`task 5 (fixed)`) |
  |---|---|---|
  | build, `index.html` / `artifact.html` | 854948 / 854334 bytes | 879115 / 878501 bytes |
  | `test/content.js` | `CONTENU — 1035 éléments`, `7436 contrôles`, `5392 formes vérifiées`, `16364 construits`, séquence `129 / 557 (budget 129)` | `1048 éléments`, `7732 contrôles`, `5687 formes vérifiées`, `16481 construits`, séquence `130 / 557 (budget 130)` |
  | `test/tools/fanout.js` | `613 contrôles, KIT CONFORME` | `613 contrôles, KIT CONFORME` |
  | `test/engine.js` | `361 checks, ENGINE OK`, `1000 dus : 32 révisions + 9 rencontres = 41 places`; `22 dus, 1013 à rencontrer`; the line « budget de cinq, deux en file » ends `aucune : 5 reprises, 23 pour 28` | `361 checks, ENGINE OK`, `990 dus : 32 révisions + 9 rencontres = 41 places`; `22 dus, 1026 à rencontrer`; the same line ends `six fausses avant le bouton : 0 reprises, 16 exercices pour 16 restants ; aucune : 5 reprises, 18 pour 23` |
  | `test/lang.js` | `25084 contrôles`, `néerlandais nu 1420 champs` | `25201 contrôles`, `néerlandais nu 1459 champs` |
  | `test/smoke.js` | `items 1035 (words 912, phrases 114, patterns 9)` | `items 1048 (words 912, phrases 114, patterns 22)` |
  | `test/journey.js . nl-BE OPR` | `2871 checks, NO PROBLEMS` | `2870 checks, NO PROBLEMS` |
  | `test/pace.js` | `10 vérifications, AUCUN PROBLÈME`; au catalogue `1035` | `10 vérifications, AUCUN PROBLÈME`; au catalogue `1048` |
  | `test/pace.js . 200 one groot` | `12 vérifications, AUCUN PROBLÈME`; arriéré maximum 755; au catalogue `1192` | `12 vérifications, AUCUN PROBLÈME`; arriéré maximum 722; au catalogue `1172` |

  The pace table moved in several cells (the 13 items change the day-90 row from `37 15 1035 1023` to `64 27 1048 1038`
  and the largest arrears from 582 to 632); no threshold moved.

- [ ] **Step 10: Commit.**
  ```
  git add src/content/grammar.a1c.js index.html artifact.html test/content.js test/tools/fanout.js test/pace.js
  git commit -m "feat(content): the 13 grammar rules, merged by the grammar kind into grammar.a1c.js, the ahead budget and two fixtures moved ({T-grammar})"
  ```
  Add `test/engine.js` to the `git add` if step 6 changed it (it did in the proof).

Done when:
- `src/content/grammar.a1c.js` holds what one successful run of Merge wrote, the run that printed
  `ok grammar 13 taken, 0 dropped` and `ok grammar.a1c.js 13 rules in 9 units`; a second run changes nothing.
- `node test/content.js .` prints `CONTENU CONFORME` with `AHEAD_BUDGET` equal to its `séquence` line's count and its cause
  in the comment above it, and `HOLLOW_BUDGET` still 3; `node test/tools/fanout.js .` prints `KIT CONFORME`; `node
  test/engine.js .` prints `ENGINE OK`; `node test/lang.js .` prints `LANGUE CONFORME`; `node test/pace.js . 200 one groot` prints
  `AUCUN PROBLÈME`; `sh test/run-all.sh` prints `TOUTE LA SUITE EST PASSÉE`, with no threshold of `test/pace.js` or `test/journey.js` changed.
- The return gives the sentences that borrow ahead, the engine pair that moved, and the table of step 9.

### Task 6: FAN conversations
Class: fan-out
Ticket: {T-conversations}
Kind: scenarios
Drafting after: 2
Split: node tools/content/split.js . "<WS>/drafts/scenarios"
Check: node tools/content/check.js "<WS>/drafts/scenarios/<batch>"
Merged by: task 7
Why: D21 and D22. The course has six scenarios and the learner plays each once; the plan adds four more of daily
life (a café, an appointment, the school, the town hall), all open from the start, none tied to a unit. One
conversation is one batch, named by its id (`s-cafe`, `s-afspraak`, `s-school`, `s-gemeente`), and one row: a whole
scenario of 5 to 8 steps cannot be cut finer without losing its thread. Task 2 wrote the kind; this task is
only the drafting, which the run controller dispatches. It has no code diff. D15: every row is read whole by the
maintainer, so the kind's `readWhole` says `course-written`. A row still disputed after its second reader is ruled by the
run controller, on the maintainer's behalf, in the ledger's Rulings (D23).

Proof (the fix copy `/c/Users/youss/.claude/jobs/5b75527c/tmp/fixZ` at `f61e4b5`, task 2 fixed, whose kind is the one
this part runs against; a workspace `ws6` outside it): Split printed exactly
```
s-cafe 1
s-afspraak 1
s-school 1
s-gemeente 1
```
and exit 0. For a hand row of `s-cafe` (the Format's example completed to 3 steps of theirs and 3 of yours, the one the
file of task 7 starts from), `node tools/content/check.js "$WS/drafts/scenarios/<batch>"` printed
`ok input.json 1 rows`, `ok draft.json 1 rows`, `ok review.json 1 keep, 0 dispute` (exit 0). For `s-school` with the
letters `zqzqx` in the first them-step's `be`, it printed
```
ok input.json 1 rows
fail draft.json s-school: « zqzqx » is not Dutch that OpenTaal or flemish.tsv knows: pick another word
fail review.json -: draft.json missing or failing
```
and exit 1 (the second line is the check that refuses the row; the third follows from it). Variants of the `s-cafe`
hand row, one change each, run through the same Check (exit 1 unless said):
- `note.en` quoted with « »: `steps[1].you.choices[1].note.en: quotes with “ ” only`; `note.fr` with “ ”: `…note.fr: quotes with « » only`.
- `blurb.fr` holding « Voilà »: `blurb.fr: quotes « Voilà », which is not Dutch of the course: a translation goes in parentheses, with no quotes`.
- a quote in `title` or in `place`: `title.fr: carries no quotation marks: the screen cites nothing there` (also `title.en`, `place.en`).
- the bare word `koffie` in `blurb`, `café` in `title`, `alstublieft` in a `hint`: `blurb: « koffie » is Dutch of the course, written bare in fr and in en: quote it, or use the French or English word` (and `title`, `steps[1].you.hint`); the hint written « alstublieft » / “alstublieft” passes (exit 0); `café` in a step of theirs, in `fr` and `en`, passes (exit 0).
- verdict `for maintainer: x`: `review.json s-cafe: « for maintainer » on a row the format does not send to the maintainer`; verdict `dispute: x`: `ok review.json 0 keep, 1 dispute` (exit 0).
- 4 steps of theirs and 4 of yours (8 steps): exit 0; 5 and 5: `steps: holds 2 to 4 steps of theirs (them) …: 5 here` and the same for yours; a 3-choice step at index 1 passes (exit 0).

#### Format
Each batch folder holds `input.json`, the one row to draft, and you write `draft.json`, an array of one row. The
`id` and the `stamp` are copied from the input; you add `icon`, `title`, `place`, `blurb`, `steps` and `outro`, and
nothing else except `unsure`. One row is one whole conversation, as the six already in the course. Example, cut
short (the real one has 5 to 8 steps):

```json
{
  "id": "s-cafe",
  "stamp": "copied from input.json",
  "icon": "🍺",
  "title": { "fr": "À la terrasse", "en": "On the terrace" },
  "place": { "fr": "{stad}, terrasse, samedi après-midi", "en": "{stad}, a terrace, Saturday afternoon" },
  "blurb": { "fr": "Vous commandez à boire et vous demandez l’addition.", "en": "You order drinks and ask for the bill." },
  "steps": [
    { "them": { "nl": "Dag! Wat mag het zijn?", "fr": "Bonjour ! Qu’est-ce que ce sera ?", "en": "Hello! What can I get you?", "be": "Dag! Wat mag het zijn?" } },
    { "you": {
        "ask": { "fr": "Commandez une bière.", "en": "Order a beer." },
        "choices": [
          { "nl": "Een pintje, alstublieft.", "fr": "Une pinte, s’il vous plaît.", "en": "A pint, please.",
            "reply": { "nl": "Komt eraan!", "fr": "Ça arrive !", "en": "Coming up!", "be": "Komt eraan!" }, "note": null },
          { "nl": "Ik wil graag een biertje.", "fr": "Je voudrais une bière.", "en": "I would like a beer.", "reply": null,
            "note": { "fr": "« Een pintje » (une pinte) se dit plus souvent.", "en": "“Een pintje” (a pint) is the more usual way." } }
        ],
        "hint": null } }
  ],
  "outro": { "fr": "Vous avez commandé et payé sans un mot de français.", "en": "You ordered and paid without a word of French." }
}
```

The rules, one per line:
- A step is `{ "them": { nl, fr, en, be } }` or `{ "you": { ask, choices, hint } }`; `ask` is `{ fr, en }`; a choice is `{ nl, fr, en, reply, note }`; `reply` is `null` or `{ nl, fr, en, be }`; `note` and `hint` are `null` or `{ fr, en }`. No other key anywhere.
- `title`, `place`, `blurb` and `outro` are each `{ fr, en }`. `place` is the place as the screen prints it (« {stad}, la terrasse »), not the input's `setting`, which is a brief for you.
- The input's `setting` and `situation` say where it happens, who speaks and what the learner must get done: cover those turns in that order, no more. `unit` and `n` say which unit's vocabulary and grammar to draw from; use only what a learner at that point has met, plus the words the situation itself demands. No script checks this: the reader does.
- The conversation begins with a step of theirs; two steps of theirs never follow each other; it has 2 to 4 steps of theirs and 3 to 4 of yours, and more than 2 steps in all.
- A step of yours has 2 or 3 choices; every choice is something a learner may acceptably say, and none is the only right one. The `nl` of a choice is what the learner says aloud, so keep it short, and keep the choices of a step distinct from each other.
- Every step of theirs and every `reply` carries a `be`: the Flemish way of saying the line (`ge` and `gij` for `u`, `allee` and `da’s`, `tof`, `plezant`), the same as `nl` where nothing differs. Never the Netherlands' way.
- `ask` is an imperative telling the learner what to get done. A `reply` answers only its own choice. A `note` or a `hint` says one short true thing about the Dutch; leave `null` rather than pad.
- Pick one register for the whole conversation, `u` or `je`, as the setting would have it, and keep it.
- French is Belgian French; English is plain English. `fr` and `en` of a line say the same thing, with the same digits; the only `{…}` allowed in any text are `{naam}`, `{stad}` and `{bedrijf}`.
- Dutch lines use the typographic apostrophe `’` and no straight `'` or `"`; `fr` and `en` use `’` too; `fr` quotes with « » only and `en` with “ ” only, and Check refuses the other language’s marks. No quotation marks inside an `nl`.
- Every Dutch word is spelled as OpenTaal or `test/data/flemish.tsv` knows it, and Check refuses the row otherwise. Spoken forms that fail: `goeiemorgen`, `goeiesmorgens`, `allez`. Forms that pass: `goeiedag`, `goeiemiddag`, `dag`, `allee`, `da’s`, `tof`, `plezant`, `ge`, `gij`. If a word the situation needs fails, take the nearest word that passes. Naming the problem in `unsure` does not let the row through: Check still refuses it.
- Check holds `blurb`, `outro`, `ask`, `hint`, `note` and `title` to the language test that Merge would otherwise fail it on (`test/lang.js`, 6d), in `fr` and in `en`: what you put in « » (`fr`) or “ ” (`en`) must be Dutch of the course or of your own lines; a translation goes in parentheses without quotes (`« Best » (il vaut mieux)`); and a Dutch word of the course written the same in French or English, such as `alstublieft`, `juf` or `café`, is never left bare in those fields: quote it, or use the French or English word (`la maîtresse`, `the teacher`). The Dutch of your own `nl` and `be` lines counts as Dutch of the course for the quotes. `title` and `place` carry no quotation marks at all, and `title` leaves no Dutch word of the course bare (`place` has no such check). The lines of `them` and the `fr`/`en` of choices and replies are not read by that test.
- `icon` is one pictogram: no ASCII, at most two code points.
- Mark a row you doubt with `"unsure": "why"`, one line.

A verdict carries `id` and `verdict` (`keep`, or `dispute: <reason>` on one line), and no other field. No row goes to the maintainer by rule.

#### Reader focus
You read each conversation whole, as the learner would play it, and as a speaker from Flanders would hear it.
1. Flanders, not the Netherlands: the `be` lines say it the Flemish way; the places and habits (bancontact, the bill, the tip, the school gate, the town hall's counter) are Belgian.
2. One register throughout; `u` and `je` do not drift inside a turn.
3. The conversation covers the situation's turns in order, and the learner gets the thing done by the last step.
4. Vocabulary and grammar fit the unit's `n` (A1): a word or tense the learner has not met is a Major unless the situation demands it and a note carries it.
5. The choices of a step are distinct, each sayable aloud and each acceptable; each `reply` answers only its own choice; the `ask` and its choices agree.
6. No invented fact about Belgium (forms, prices, opening hours, rules); the learner may be asked to act on it.
7. Every `note` and `hint` is true, short and about the Dutch; none repeats the line it sits on.
8. `fr` and `en` are natural and say the same; the `{naam}`, `{stad}` and `{bedrijf}` tokens still make sense once filled in.
9. Read the rows marked `unsure` first.
Every row is read by the maintainer whole (D15): say in the verdict’s reason, or in `unsure`, anything you would want them to look at.

Done when: Split has printed the four lines above, each batch folder holds `draft.json` and `review.json`, and `node tools/content/check.js "<WS>/drafts/scenarios/<batch>"` ends `ok review.json … keep` with exit 0 for all four. The batches are then merged by task 7.

### Task 7: Merge conversations
Class: mechanical
Ticket: {T-conversations}
Merges: scenarios
Promises: none
Why: D21, D22 and D15. The drafted rows of task 6 become `src/content/scenarios.a1c.js`: four scenarios appended to
the course's six, each with its id, its track `leven` and no unit. Merge of the `scenarios` kind writes that file
whole from `CONVERSATIONS` and the accepted rows, in `CONVERSATIONS` order. Nothing else changes in the source;
the build and the tests that count scenarios follow. A conversation is played by the learner once and ticked in
`scenariosDone`, so the four ids join the six in the stored list: they are new ids, and no stored record is renamed.

Files:
- Modify: `src/content/scenarios.a1c.js` (written by Merge)
- Modify (the build writes them): `index.html`, `artifact.html`
- Test: `test/smoke.js`, `test/content.js`, `test/tools/check-files.js`, `test/lang.js`, `test/journey.js` (run, not edited)

Interfaces:
- Consumes: task 6's `<WS>/drafts/scenarios/<batch>/` folders, four, each with a `draft.json` and a `review.json` that
  Check passes; task 2's kind.
- Produces: `NL.content.scenarios` of ten, the four last: `s-cafe`, `s-afspraak`, `s-school`, `s-gemeente`, in that
  order. `test/smoke.js` counts them and their steps; the learner pass of task 3 plays them.

Notes:
- **Run Merge on the real rows, never by hand** (CLAUDE.md): `node tools/content/merge.js . "<WS>/drafts/scenarios"`.
  Expected, exactly:
  ```
  ok scenarios 4 taken, 0 dropped
  ok scenarios.a1c.js 4 scenarios
  ```
  A second run prints the same two lines and changes nothing (`git status` shows the file unchanged). A row that is
  disputed or for the maintainer is refused by Merge, which lists it; settle it through `rulings.json` first.
- **The language test binds the new text, and Check now refuses most of what it refuses.** `test/lang.js` check 6d holds
  `fr` and `en` to this: what « … » or “…” quotes is Dutch of the course; a translation goes in parentheses without
  quotes (`« Best » (il vaut mieux)`); a Dutch word of the course written the same in French and English, such as
  `alstublieft`, `juf`, `café`, is quoted or replaced. Task 2's Check runs the same rule (`test/lib/quoted.js`) on
  `blurb`, `outro`, `ask`, `hint`, `note` and `title` before Merge (and a quote at all in `title` or `place`), so a
  row that breaks it never reaches `ok review.json`. What Check does not read is what 6d does not read either: the
  lines of `them` and the choices and replies. If `lang.js` still fails, never edit the file: stop and report each `FAIL`
  line with its row `id`; the run controller changes that row's verdict in its batch's `review.json` from `keep` to
  `dispute: <the FAIL line>` and dispatches the batch's controller (as task 5, step 7), then this task runs again from
  step 1.
- **The counts below are the proof's, with hand-made rows** (printed at the end of this task, so the proof can be
  reproduced). The real counts depend on the rows the drafters write: in the ticket write « the measured count »
  and measure with `node test/smoke.js . | grep -E "scenarios  |listen clips"`.
- **Baselines moved.** `test/content.js`, `test/lang.js`, `test/tools/check-files.js` and `test/journey.js` count
  more once the four are in; none needs an edit. `check-files.js` reads the new scenarios' sentences with its
  `SENTENCE` pattern unchanged, and `journey.js` taps the first choice of every scenario it reaches.
- **TESTING.md** names the scenarios and the new counts in task 8, not here.
- **The proof.** Run on `/c/Users/youss/.claude/jobs/5b75527c/tmp/fixZ` at `410da6a` (tasks 1 to 5 fixed, CRLF clone), with a
  workspace `ws7` outside it: `split.js` printed the four lines of task 6; with the four hand rows below as `draft.json`
  and a `keep` for each in `review.json` (the recipe at the end), `check.js` ended each batch with
  `ok review.json 1 keep, 0 dispute` (the scenarios Check of task 2, 6d included); `merge.js` printed the two lines
  above, twice, the file byte-identical after the second. Then `sh build.sh`: `index.html (893804 bytes), artifact.html
  (893190 bytes)` (from `879115` and `878501`). Before and after, with the hand rows, at this place in the run (the
  counts of another position differ; measure again with the real rows):

  | command | before (410da6a) | after (task 7) |
  |---|---|---|
  | `node test/smoke.js .` | `ALL CHECKS PASSED`, `scenarios       6, steps 43`, `listen clips    21` | `ALL CHECKS PASSED`, `scenarios       10, steps 68`, `listen clips    34` |
  | `node test/content.js .` | `7732 contrôles, CONTENU CONFORME` | `7829 contrôles, CONTENU CONFORME` |
  | `node test/lang.js .` (about 8 minutes) | `25201 contrôles, LANGUE CONFORME` | `25431 contrôles, LANGUE CONFORME` |
  | `node test/tools/check-files.js .` | `glosses + sentences + prose = 3401 ; owed() liste 3410 endroits` | `3486 ; owed() liste 3495`, exit 0 |
  | `node test/journey.js .` (about 75 to 80 s) | `2870 checks, NO PROBLEMS` | `2902 checks, NO PROBLEMS` |
  | `node test/tools/fanout.js .` | `613 contrôles, KIT CONFORME` | `613 contrôles, KIT CONFORME` |

  In `lang.js`, `néerlandais nu 1459` rose to `1492` with 13 exceptions, and `guillemets 0 … 11 exceptions` stayed as it was; the run took 7m52s (alone, after the other suites). The run time of `journey.js` did not move (1m17.4s before, 1m18.7s after, run alone, one after the other).
  `test/sim.js:79` takes `scenarios[3]`, and the four are appended after the six, so its index is unchanged; it was
  not run.

- [ ] **Step 1: Check task 6's batches.** For each of `s-cafe`, `s-afspraak`, `s-school`, `s-gemeente`:
  `node tools/content/check.js "<WS>/drafts/scenarios/<batch>"`. Expected, each: `ok input.json 1 rows`,
  `ok draft.json 1 rows`, `ok review.json 1 keep, 0 dispute` (exit 0).

- [ ] **Step 2: Merge.** `node tools/content/merge.js . "<WS>/drafts/scenarios"`. Expected the two lines in the notes.
  Run it a second time and confirm that `git diff --stat` has not changed.

- [ ] **Step 3: Build.** `sh build.sh`. Expected: `built (local only) index.html (… bytes), artifact.html (… bytes)`; the sizes move with the rows.

- [ ] **Step 4: Run the tests that count scenarios.**
  ```
  node test/smoke.js .
  node test/content.js .
  node test/tools/check-files.js .
  node test/lang.js .
  node test/journey.js .
  ```
  Each must end as the table says, with « the measured count » where the rows differ. `lang.js` is the one that
  can fail on text (check 6d): stop and report it, as the notes say. Record the counts in the ticket. Commit
  `src/content/scenarios.a1c.js`, `index.html` and `artifact.html` with
  `git commit -m "feat(content): Merge conversations, 4 scenarios ({T-conversations})"`.

Done when: Merge printed the two lines and a second run changed nothing; the build is current; the five commands
above end `ALL CHECKS PASSED`, `CONTENU CONFORME`, exit 0, `LANGUE CONFORME` and `NO PROBLEMS`; `smoke.js` counts
ten scenarios; and the commit holds the three files.

The proof's hand rows (`rows.js`: one conversation each; the id and the stamp come from the batch's `input.json`; the kind writes the track, from `CONVERSATIONS`, and the level, and no unit, D22). They let
the numbers above be reproduced; they are not content to ship. To turn them into batches, after Split, for each key `id`
of `rows.js` write `draft.json` = `[Object.assign({ id, stamp }, rows[id])]` (`stamp` read from the batch's
`input.json`) and `review.json` = `[{ id, verdict: "keep" }]` in `<WS>/drafts/scenarios/<id>/`. The code block is indented
by two spaces in this file: strip them.
  ```js
  /* Hand-made rows for the proof of plan 4b's tasks 6 and 7: one whole conversation each, minus id, track, level. */
  const p = (fr, en) => ({ fr, en });
  const T = (nl, fr, en, be) => ({ them: { nl, fr, en, be: be || nl } });
  const Y = (ask, choices, hint) => ({ you: { ask, choices, hint: hint || null } });
  const Ch = (nl, fr, en, reply, note) => ({ nl, fr, en, reply: reply || null, note: note || null });
  const R = (nl, fr, en, be) => ({ nl, fr, en, be: be || nl });
  module.exports = {
    's-cafe': {
      icon: '\u{1F37A}', title: p('À la terrasse', 'On the terrace'), place: p('{stad}, terrasse, samedi après-midi', '{stad}, terrace, Saturday afternoon'),
      blurb: p('Commander, demander ce qu’on conseille et payer, du début à la fin. Six échanges.', 'Ordering, asking what they recommend and paying, start to finish. Six exchanges.'),
      steps: [
        T('Goeiemiddag! Wat mag het zijn?', 'Bonjour ! Qu’est-ce que ce sera ?', 'Good afternoon! What will it be?'),
        Y(p('Commande un café et demande ce que le serveur conseille à manger.', 'Order a coffee and ask what the waiter recommends to eat.'), [
          Ch('Een koffie alstublieft. Wat raadt u aan om te eten?', 'Un café s’il vous plaît. Que me conseillez-vous à manger ?', 'A coffee, please. What do you recommend to eat?',
            R('De dagschotel is lekker vandaag.', 'Le plat du jour est bon aujourd’hui.', 'The dish of the day is good today.')),
          Ch('Een koffie alstublieft. Is er iets vegetarisch?', 'Un café s’il vous plaît. Y a-t-il quelque chose de végétarien ?', 'A coffee, please. Is there anything vegetarian?', null,
            p('« Alstublieft » ouvre toute commande : c’est le mot qui rend la phrase polie.', '“Alstublieft” opens any order: it is the word that makes the sentence polite.'))
        ], p('Un seul mot de politesse suffit : « alstublieft ».', 'One polite word is enough: “alstublieft”.')),
        T('Komt in orde. Wilt u nog iets anders?', 'C’est noté. Vous voulez autre chose ?', 'Coming up. Would you like anything else?', 'Komt in orde. Wilt ge nog iets anders?'),
        Y(p('Dis que ça suffit, ou demande un verre d’eau.', 'Say that is all, or ask for a glass of water.'), [
          Ch('Nee, dat is alles, dank u wel.', 'Non, c’est tout, merci beaucoup.', 'No, that is all, thank you.'),
          Ch('Ja, ook een glas water alstublieft.', 'Oui, et aussi un verre d’eau s’il vous plaît.', 'Yes, and a glass of water as well, please.',
            R('Een glas water erbij, komt eraan.', 'Un verre d’eau en plus, ça arrive.', 'A glass of water as well, coming right up.'))
        ]),
        T('Zo, alstublieft. Zegt het maar als u wilt betalen.', 'Voilà. Dites-le quand vous voulez payer.', 'There you are. Just say when you want to pay.', 'Zo, alstublieft. Zegt het maar als ge wilt betalen.'),
        Y(p('Demande l’addition et dis comment tu paies.', 'Ask for the bill and say how you pay.'), [
          Ch('De rekening alstublieft. Kan ik met bancontact betalen?', 'L’addition s’il vous plaît. Je peux payer par Bancontact ?', 'The bill, please. Can I pay by Bancontact?',
            R('Ja hoor, geen probleem.', 'Oui bien sûr, pas de souci.', 'Yes of course, no problem.'),
            p('Ici la carte, c’est « bancontact », pas « pinnen ».', 'Here a card payment is “bancontact”, not “pinnen”.')),
          Ch('De rekening alstublieft. Ik betaal contant.', 'L’addition s’il vous plaît. Je paie en liquide.', 'The bill, please. I will pay cash.')
        ]),
        T('Dank u wel. Een prettige dag nog!', 'Merci. Bonne journée !', 'Thank you. Have a nice day!', 'Merci. Nog een prettige dag!')
      ],
      outro: p('Tu as commandé, demandé un conseil et payé. À la terrasse, la politesse tient en un mot : « alstublieft ».', 'You ordered, asked for advice and paid. On the terrace, politeness fits in one word: “alstublieft”.')
    },
    's-afspraak': {
      icon: '\u{1F4DE}', title: p('Un rendez-vous à déplacer', 'Moving an appointment'), place: p('Au téléphone, mardi matin', 'On the phone, Tuesday morning'),
      blurb: p('Un coup de fil à la réception : tu déplaces ton rendez-vous sans visage pour t’aider. Six échanges.', 'A call to the reception: you move your appointment with no face to help you. Six exchanges.'),
      steps: [
        T('Goeiedag, met de praktijk. Waarmee kan ik u helpen?', 'Bonjour, ici le cabinet. En quoi puis-je vous aider ?', 'Hello, this is the practice. How can I help you?'),
        Y(p('Dis qui tu es et que tu dois déplacer ton rendez-vous de jeudi.', 'Say who you are and that you have to move your Thursday appointment.'), [
          Ch('Goeiedag, met {naam}. Ik moet mijn afspraak van donderdag verplaatsen.', 'Bonjour, ici {naam}. Je dois déplacer mon rendez-vous de jeudi.', 'Hello, this is {naam}. I have to move my Thursday appointment.',
            R('Dat is geen probleem.', 'Ce n’est pas un problème.', 'That is no problem.')),
          Ch('Goeiedag, met {naam}. Ik kan donderdag niet komen.', 'Bonjour, ici {naam}. Je ne peux pas venir jeudi.', 'Hello, this is {naam}. I cannot come on Thursday.')
        ], p('Commence par ton nom : au téléphone, on se présente d’abord.', 'Start with your name: on the phone you introduce yourself first.')),
        T('Wat dacht u van volgende week dinsdag om tien uur?', 'Que diriez-vous de mardi prochain à dix heures ?', 'What about next Tuesday at ten o’clock?'),
        Y(p('Accepte, ou demande un horaire l’après-midi.', 'Accept, or ask for an afternoon time.'), [
          Ch('Dinsdag om tien uur past goed.', 'Mardi à dix heures me convient bien.', 'Tuesday at ten suits me well.'),
          Ch('Kan het ook in de namiddag?', 'Est-ce possible aussi l’après-midi ?', 'Is the afternoon possible too?',
            R('In de namiddag kan het om twee uur.', 'L’après-midi c’est possible à deux heures.', 'In the afternoon it can be at two o’clock.'),
            p('« Past het ? » veut dire (est-ce que ça vous convient ?) : c’est la question qu’on entend le plus.', '“Past het?” means (does that suit you?): it is the question you will hear most.'))
        ]),
        T('Oké, dan zet ik dat in de agenda. Ik stuur u straks een bericht ter bevestiging.', 'D’accord, je le note dans l’agenda. Je vous envoie un message de confirmation tout à l’heure.', 'OK, I will put that in the diary. I will send you a confirmation message shortly.'),
        Y(p('Remercie et termine la conversation.', 'Say thank you and end the call.'), [
          Ch('Dank u wel, tot dinsdag!', 'Merci beaucoup, à mardi !', 'Thank you, see you on Tuesday!'),
          Ch('Perfect, merci. Tot ziens!', 'Parfait, merci. Au revoir !', 'Perfect, thanks. Goodbye!')
        ])
      ],
      outro: p('Tu as déplacé un rendez-vous au téléphone, sans un mot de français. Présente-toi, dis ce qui ne va pas, accepte ou propose.', 'You moved an appointment by phone without a word of French. Introduce yourself, say what does not work, accept or propose.')
    },
    's-school': {
      icon: '\u{1F392}', title: p('À la porte de l’école', 'At the school gate'), place: p('{stad}, fin d’après-midi', '{stad}, end of the afternoon'),
      blurb: p('La maîtresse sort avec les enfants : tu prends des nouvelles et tu préviens pour demain. Six échanges.', 'The teacher comes out with the children: you ask how it went and give notice about tomorrow. Six exchanges.'),
      steps: [
        T('Dag! Daar komt uw zoon al.', 'Bonjour ! Voilà votre fils.', 'Hello! Here comes your son.'),
        Y(p('Salue la maîtresse et demande comment la journée s’est passée.', 'Greet the teacher and ask how the day went.'), [
          Ch('Dag juf! Hoe was de dag?', 'Bonjour madame ! Comment s’est passée la journée ?', 'Hello juf! How was the day?'),
          Ch('Dag juf! Is alles goed gegaan?', 'Bonjour madame ! Tout s’est bien passé ?', 'Hello juf! Did everything go well?',
            R('Ja hoor, hij heeft goed gewerkt.', 'Oui oui, il a bien travaillé.', 'Yes, he worked well.'))
        ], p('« Juf » est ce qu’on dit à l’institutrice, même adulte.', '“Juf” is what you call the teacher, even as an adult.')),
        T('Het ging goed. Maar vergeet u zijn huiswerk niet?', 'Ça s’est bien passé. Mais vous n’oubliez pas ses devoirs ?', 'It went well. But you will not forget his homework, will you?', 'Het ging goed. Maar vergeet ge zijn huiswerk niet?'),
        Y(p('Dis que ton fils est malade demain.', 'Say that your son is ill tomorrow.'), [
          Ch('Morgen is hij ziek, hij blijft thuis.', 'Demain il est malade, il reste à la maison.', 'Tomorrow he is ill, he is staying at home.'),
          Ch('Morgen komt hij niet, hij is ziek.', 'Demain il ne vient pas, il est malade.', 'Tomorrow he is not coming, he is ill.',
            R('Oei, wel beterschap hoor.', 'Oh là là, bon rétablissement.', 'Oh dear, get well soon.'),
            p('« Oei » se dit pour une petite mauvaise nouvelle, et « beterschap » pour souhaiter bon rétablissement.', '“Oei” is for a small piece of bad news, and “beterschap” wishes someone a quick recovery.'))
        ]),
        T('Oei, dat is spijtig. Zegt u het ook aan de opvang?', 'Oh, c’est dommage. Vous le dites aussi à la garderie ?', 'Oh, that is a pity. Will you tell the after-school care too?'),
        Y(p('Réponds, et dis au revoir.', 'Answer, and say goodbye.'), [
          Ch('Ja, ik bel de opvang straks. Dag juf!', 'Oui, j’appelle la garderie tout à l’heure. Au revoir madame !', 'Yes, I will call the after-school care later. Goodbye juf!'),
          Ch('Nee, wilt u het zeggen? Dank u wel, dag juf!', 'Non, voulez-vous le dire ? Merci beaucoup, au revoir madame !', 'No, would you tell them? Thank you, goodbye juf!',
            R('Ik zeg het door. Tot overmorgen!', 'Je le transmets. À après-demain !', 'I will pass it on. See you the day after tomorrow!'))
        ])
      ],
      outro: p('Tu as pris des nouvelles de la journée et prévenu pour demain. Avec la maîtresse, on dit « u » et on reste court.', 'You asked about the day and gave notice for tomorrow. With the teacher you say “u” and keep it short.')
    },
    's-gemeente': {
      icon: '\u{1F3DB}', title: p('Au guichet de la commune', 'At the town hall counter'), place: p('{stad}, guichet, mardi matin', '{stad}, counter, Tuesday morning'),
      blurb: p('Tu t’inscris dans ta nouvelle commune : ce qu’on demande, ce que tu as, ce qui manque. Six échanges.', 'You register in your new town: what they ask for, what you have, what is missing. Six exchanges.'),
      steps: [
        T('Goeiedag. Waarmee kan ik u helpen?', 'Bonjour. En quoi puis-je vous aider ?', 'Hello. How can I help you?'),
        Y(p('Dis que tu veux t’inscrire dans la commune.', 'Say that you want to register in the town.'), [
          Ch('Goeiedag. Ik wil mij inschrijven in {stad}.', 'Bonjour. Je veux m’inscrire à {stad}.', 'Hello. I want to register in {stad}.'),
          Ch('Goeiedag. Ik ben verhuisd naar {stad}.', 'Bonjour. J’ai déménagé à {stad}.', 'Hello. I have moved to {stad}.',
            R('Dan moet u zich inschrijven.', 'Alors vous devez vous inscrire.', 'Then you have to register.'))
        ]),
        T('Hebt u uw identiteitskaart bij u, en uw huurcontract?', 'Avez-vous votre carte d’identité sur vous, et votre contrat de bail ?', 'Do you have your identity card with you, and your rental contract?', 'Hebt ge uw identiteitskaart bij, en uw huurcontract?'),
        Y(p('Dis que tu as la carte mais pas le contrat.', 'Say you have the card but not the contract.'), [
          Ch('Ik heb mijn identiteitskaart, maar mijn huurcontract niet.', 'J’ai ma carte d’identité, mais pas mon contrat de bail.', 'I have my identity card, but not my rental contract.',
            R('Dan komt u best terug met dat papier.', 'Alors revenez plutôt avec ce papier.', 'Then you had better come back with that paper.')),
          Ch('Mijn identiteitskaart heb ik hier. Het contract zit nog thuis.', 'Ma carte d’identité, je l’ai ici. Le contrat est encore à la maison.', 'I have my identity card here. The contract is still at home.')
        ], p('« Best » devant un verbe veut dire (il vaut mieux).', '“Best” before a verb means (it is better to).')),
        T('Dan kan ik u vandaag niet inschrijven. Komt u morgen terug.', 'Alors je ne peux pas vous inscrire aujourd’hui. Revenez demain.', 'Then I cannot register you today. Come back tomorrow.'),
        Y(p('Demande à partir de quelle heure le guichet ouvre demain.', 'Ask from what time the counter opens tomorrow.'), [
          Ch('Tot hoe laat is het loket open?', 'Jusqu’à quelle heure le guichet est-il ouvert ?', 'Until what time is the counter open?'),
          Ch('Kan ik morgen om negen uur komen?', 'Puis-je venir demain à neuf heures ?', 'Can I come tomorrow at nine o’clock?',
            R('Ja, het loket is open vanaf negen uur.', 'Oui, le guichet ouvre à partir de neuf heures.', 'Yes, the counter is open from nine o’clock.'),
            p('« Loket » est le guichet, « vanaf » veut dire (à partir de).', '“Loket” is the counter, “vanaf” means (from).'))
        ])
      ],
      outro: p('Tu as dit ce que tu voulais, ce que tu avais et ce qui manquait. Au guichet, « u » et une phrase courte suffisent.', 'You said what you wanted, what you had and what was missing. At the counter, “u” and a short sentence are enough.')
    }
  };
  ```

### Task 8: Docs: the two kinds, the learner pass, the a1c header
Class: mechanical
Ticket: none
Promises: none
Why: D21 and D22 and Calls 2 and 7. After tasks 1 to 7 the course has 22 rules and 10 conversations, the kit has two
more kinds, and the learner pass plays every conversation and opens every rule sheet; the docs still say otherwise
(`TESTING.md`'s rows and passage on the learner pass, `tools/learner-pass/README.md`, `README.md`'s « État »). The
header comment of `src/content/lexicon.a1c.js` says « leurs phrases et leur grammaire viennent avec les plans 4b et
4c »: after this plan the units carry `grammar: []` in that file and their rules come from `grammar.a1c.js`, and only
their phrases are left for plan 4c (Call 2 of the header). That comment is a copy of the `HEADER` constant in
`tools/content/kinds/words.js`, and the kind's Merge writes the file whole from `HEADER`, reading nothing of the old
one: a comment changed in the file only is overwritten by the next Merge, and one changed in `HEADER` only is
written over the file's by it. In today's tree nothing pins the two together (measured: `test/tools/fanout.js` calls
`K.lexicon([])` only to build fixtures). The task writes that pin, for the three files a Merge writes whole, sees it
fail, and changes both sides. The rest is prose, measured from the tree as tasks 1 to 7 left it. Nothing in `src/`
changes but a comment, so the build changes only the two outputs.

Files:
- Modify: `test/tools/fanout.js` (the words block: after the line `const CW = course(WD), NLW = CW.NL;`)
- Modify: `tools/content/kinds/words.js` (the `HEADER` constant, its third and fourth lines)
- Modify: `src/content/lexicon.a1c.js` (the header comment, lines 3 and 4)
- Modify: `TESTING.md` (the `tools/fanout.js` row; the `tools/learner-pass.js` row; the passage on the learner pass; the
  paragraph on what the kit's checks cannot see; the paragraph on `test/lib/` (`test/lib/quoted.js`); the grown course
  of `pace.js` (`node test/pace.js . 200 one groot`); « Encore ouvert »)
- Modify: `tools/learner-pass/README.md` (the `corners.js` row, a `rules.js` row, the timing sentence)
- Modify: `README.md` (« État », two places)
- Modify (the build writes them): `index.html`, `artifact.html`
- Test: `test/tools/fanout.js` (the pin, new)
- Not changed, on purpose: `GLOSSARY.md`. « Listening set » (« A run of lines from the scenarios, read aloud one after
  another … ») and « Conversation » state no count and no list, and stay true with ten conversations. `CLAUDE.md` is
  edited by tasks 1 and 2.

Interfaces:
- Consumes: tasks 1 and 2 (the kinds `grammar` and `scenarios`, whose empty files carry a `HEADER` each), task 3
  (`corners.js` plays every conversation; `rules.js`), tasks 5 and 7 (the merged files).
- Produces: one new group of checks in `test/tools/fanout.js`, three `ok(...)` calls, named
  `l'en-tête de src/content/<file> est celui que son genre écrit (HEADER)` for `<file>` in `lexicon.a1c.js`,
  `grammar.a1c.js`, `scenarios.a1c.js`.

Notes:
- **Languages.** `README.md` and `TESTING.md` are French; `tools/learner-pass/README.md` is English; the comment in
  `lexicon.a1c.js` and `HEADER` is French.
- **Line endings.** On this machine the working tree is CRLF (`core.autocrlf=true`) except `*.sh`, `index.html` and
  `artifact.html`. A literal `\n` in an anchor does not match a CRLF file: the script of step 5 reads each file's
  line ending and adapts both the anchor and the replacement. `git diff` is the judge. The sources of the kit and of
  `src/` are LF-tolerant in the pin because it removes `\r` from the file it reads.
- **The pin reads the first block of each file.** `headOf(lines)` is the lines up to the first empty one, or up to the
  last (the files' last line is empty after the final newline), joined and ended by a newline. Each kind's empty run
  (`K.lexicon([])`, `patterns([])`, `scenarios([])`) returns the file text as an array of lines; the real file must
  start with that block. A header is whatever precedes the first blank line, so a kind whose `HEADER` ever holds a
  blank line would need the pin changed.
- **Red first, for the pin.** There is nothing to fail until a header differs: step 3 changes `HEADER` only, for each of
  the three kinds, and sees the pin name the file; step 4 changes the lexicon file and sees green. If step 3 stays
  green, stop: the pin reads the wrong side.
- **GLOSSARY.** No entry changes. The task records that it looked.
- **The counts below are the proof's** (13 hand rules and 4 hand conversations stand for the rows): `items 1048`,
  `scenarios 10`, `patterns 22` are fixed by the design (1035 + 13), so `README.md` carries them as digits; nothing
  else in the docs is a count that depends on the drafted rows, but the grown course of `pace.js` (1 172 = 1 048 + 124
  copies, from `test/lib/grow.js`, counted by `node test/pace.js . 200 one groot`, about 2m30). The `fanout.js` count
  (616 here) moves with every earlier block: re-measure it, and use the printed one. `AHEAD_BUDGET` (task 5) is in `test/content.js`, not in
  the docs.
- **What this task leaves alone, and why.** `TESTING.md`'s paragraphs on `pace.js` (« sur ses 1 035 éléments … ») are
  a record of a simulation measured on 29 October; `test/pace.js`'s comments say « Le vrai cours en compte 1 035 ».
  Task 5 notes that `pace.js` moved (the catalogue and a few cells); the figures there are the simulation's, with a
  date, and are not rewritten here. The one exception is the grown course's own size (« ses 1 192 éléments sont les
  1 035 du cours, et 157 repris »), which the course's growth changes (1 172 = 1 048 + 124), and which task 5 already
  states in `test/pace.js`'s comments.
- **The proof.** Fixer Y replayed the part's text (steps 2 to 5 extracted from this file and run as written) on the
  fix copy `/c/Users/youss/.claude/jobs/5b75527c/tmp/fixZ`, a CRLF clone (`core.autocrlf=true`), over `babf28b` (tasks 1,
  2, 3, 5 and 7, all fixed): commit `task 8 (fixed)`. A second CRLF clone at `babf28b`, `tmp/fixY-chk8`, took the part's
  steps 2 to 5 from the text alone and ended byte-identical to fixZ in the eight files. Measured there: step 1's four
  lines as quoted; step 2 `616 contrôles, KIT CONFORME`; step 3 `FAIL: l'en-tête de src/content/lexicon.a1c.js est celui
  que son genre écrit (HEADER)` and `616 contrôles, 1 ÉCHEC(S)`, and the same line with `grammar.a1c.js`, then with
  `scenarios.a1c.js`, each with `616 contrôles, 1 ÉCHEC(S)`, when the first `HEADER` line of that kind alone is changed
  on a tree where `words.js` is not (replayed in the order of the steps, `words.js` already changed, each prints the
  `lexicon.a1c.js` line too and `2 ÉCHEC(S)`);
  step 4 `616 contrôles, KIT CONFORME`; step 6 `built (local only) index.html (893863 bytes), artifact.html (893249
  bytes)`, `21 checks, LEARNER PASS TOOLS OK`, `ALL CHECKS PASSED`, `node test/lang.js .` `25431 contrôles, LANGUE
  CONFORME` (435 s), and the stat of `8 files changed, 49 insertions(+), 23 deletions(-)`. The timing sentence is from
  `days.js` 93 s, `corners.js` 165 s (241 lines, 22 `finished after`), `sweep.js` 261 s, `rules.js` 15 s, run one after
  the other in Edge on fixZ at that commit's parent with the hand rows (no `PROBLEM:` line); `node test/pace.js . 200
  one groot` printed `éléments au catalogue 1172` (2m31). The counts move with the real rows and with earlier blocks:
  use the ones printed.

- [ ] **Step 1: Measure.** From the tree as task 7 left it:
  ```
  node test/smoke.js . | grep -E "items |scenarios  |listen clips|ALL CHECKS"
  node test/content.js . | grep explications
  ```
  Expected, as measured on the copy (a line that differs means a task before this one changed the design: stop and
  tell the run controller):
  ```
    items           1048  (words 912, phrases 114, patterns 22)
    scenarios       10, steps 68
    listen clips    34
  ALL CHECKS PASSED
    explications    0 / 1048 élément(s) sans explication dans les deux langues (exigé : 0)
  ```
  The `steps` and `listen clips` figures depend on the drafted conversations: use the printed ones wherever
  this task names them (it names none in a doc below).

- [ ] **Step 2: The pin, green.** In `test/tools/fanout.js`, in the `words` block, after the line
  `    const CW = course(WD), NLW = CW.NL;` and its blank line, insert (the file's own indentation; the names `K`, `WD`,
  `ROOT`, `path`, `text` and `ok` are already in scope there, as the block's other checks use them):
  ```js
      /* L'en-tête de chaque fichier que Merge écrit entier : celui du dépôt est celui que le genre écrirait. Merge
         récrit le fichier depuis HEADER, sans lire l'ancien : un en-tête changé d'un seul côté serait écrasé, ou
         écraserait l'autre, à la prochaine fusion, et aucune autre vérification ne le voit. */
      const headOf = lines => lines.slice(0, lines.indexOf('') >= 0 ? lines.indexOf('') : lines.length - 1).join('\n') + '\n';
      [['lexicon.a1c.js', K.lexicon([])], ['grammar.a1c.js', require(path.join(WD, 'tools', 'content', 'kinds', 'grammar')).patterns([])],
        ['scenarios.a1c.js', require(path.join(WD, 'tools', 'content', 'kinds', 'scenarios')).scenarios([])]].forEach(([file, empty]) => {
        const real = text(path.join(ROOT, 'src', 'content', file)).replace(/\r\n/g, '\n');
        ok(real.startsWith(headOf(empty)), 'l\'en-tête de src/content/' + file + ' est celui que son genre écrit (HEADER)');
      });
  ```
  (The file is CRLF here: make the edit with the Edit tool on the one-line anchor, or with a script that reads the
  file's line ending. `git` normalises a mixed ending on commit.) Run `node test/tools/fanout.js . 2>&1 | grep -E "FAIL|ÉCHEC|contrôles"`.
  Expected: `616 contrôles, KIT CONFORME`, no `FAIL`. If `K.lexicon`, `patterns` or `scenarios` is not the name the
  kit's file exports, read the block's other uses (`grep -n "K.lexicon\|\.patterns(\|\.scenarios(" test/tools/fanout.js`)
  and use the same call; the three names are those of tasks 1 and 2.

- [ ] **Step 3: Red.** Change `HEADER` only. In `tools/content/kinds/words.js`, replace its third and fourth lines
  ```
    '   correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités n’ont que des mots ;',
    '   leurs phrases et leur grammaire viennent avec les plans 4b et 4c. */',
  ```
  with
  ```
    '   correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités gardent grammar: [] ici ;',
    '   leurs règles viennent de grammar.a1c.js (une boucle au chargement les range dans leur unité), leurs phrases du plan 4c. */',
  ```
  Run the same command. Expected, exactly:
  ```
    FAIL: l'en-tête de src/content/lexicon.a1c.js est celui que son genre écrit (HEADER)
  616 contrôles, 1 ÉCHEC(S)
  ```
  Then, for each of `tools/content/kinds/grammar.js` and `tools/content/kinds/scenarios.js`, change the first `HEADER`
  line alone (insert `X ` after its `/* `: `'/* Règles de grammaire …` becomes `'/* X Règles de grammaire …`), run the same command, expect
  `FAIL: l'en-tête de src/content/<file> est celui que son genre écrit (HEADER)` for `grammar.a1c.js`, then for
  `scenarios.a1c.js`, each after the `lexicon.a1c.js` line (still red, `words.js` being changed) and each with
  `616 contrôles, 2 ÉCHEC(S)`, and put the line back (`git checkout <that file>`;
  `git diff --stat` then shows the `words.js` change only).

- [ ] **Step 4: Green.** In `src/content/lexicon.a1c.js`, replace its lines 3 and 4
  ```
     correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités n’ont que des mots ;
     leurs phrases et leur grammaire viennent avec les plans 4b et 4c. */
  ```
  with
  ```
     correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités gardent grammar: [] ici ;
     leurs règles viennent de grammar.a1c.js (une boucle au chargement les range dans leur unité), leurs phrases du plan 4c. */
  ```
  (the same two lines, three spaces of indent; the apostrophe of `n’ont` is gone). Run the same command. Expected:
  `616 contrôles, KIT CONFORME`.

- [ ] **Step 5: The prose.** Write the script below to `<WS>/tmp/docs8.js` and run `node <WS>/tmp/docs8.js .` from the
  repository root. It prints nothing; it throws `anchor found N times` when a text is not found exactly once
  (so a second run on the same tree throws). It reads each file's line ending and adapts both sides. Edits:
  `TESTING.md` (seven places, then « Encore ouvert »), `tools/learner-pass/README.md` (the `corners.js` row, a new
  `rules.js` row, the timing sentence), `README.md` (« État »). The timing sentence carries the figures measured on
  fixZ in Edge, each script run alone, one after the other, on the hand rows (`days.js` 93 s, `corners.js` 165 s,
  `sweep.js` 261 s, `rules.js` 15 s); gate 9 plays the real rows and may print other times: its fix loop corrects
  the sentence.
  ```js
  const fs = require('fs');
  const R = process.argv[2];
  function edit(R, file, pairs) {
    let t = fs.readFileSync(R + '/' + file, 'utf8');
    const E = /\r\n/.test(t) ? '\r\n' : '\n';
    const fit = s => s.replace(/\r?\n/g, E);
    pairs.forEach(([x, y]) => {
      const n = t.split(fit(x)).length - 1;
      if (n !== 1) throw new Error(file + ': anchor found ' + n + ' times: ' + x.slice(0, 60));
      t = t.replace(fit(x), () => fit(y));
    });
    fs.writeFileSync(R + '/' + file, t);
  }

  edit(R, 'TESTING.md', [
    // 1. la ligne de tools/fanout.js : les deux genres, et l'en-tête de chaque fichier que Merge écrit entier
    ["et un second Split qui ne recoupe pas une unité fondue) |",
     "et un second Split qui ne recoupe pas une unité fondue ; `grammar`, dont la source est une règle à venir : ses 13 règles et leurs 9 unités, chaque garde de Check (cinq exercices, un trou d'une seule tuile qui n'est pas écrit deux fois, de 3 à 8 tuiles par exercice, rien que l'unité de la règle n'ait enseigné, l'orthographe, le néerlandais de l'explication dans `<i class=\"nl\">` ou `<span class=\"ex\">`, les citations et le néerlandais nu que 6d de `lang.js` refuserait), la boucle de `src/content/grammar.a1c.js` qui range chaque règle dans la liste de son unité au chargement et lève une erreur nommant la règle quand l'unité manque, et son Merge de bout en bout ; `scenarios`, dont la source est une conversation à venir : ses 4 conversations, la forme d'un scénario et les bornes des six du cours, une réplique de l'autre sans `be`, un sens manquant, un `{jeton}` hors `{naam}` `{stad}` `{bedrijf}`, les mêmes citations et le même néerlandais nu, et son Merge qui récrit `src/content/scenarios.a1c.js` ; et, pour les trois fichiers qu'un Merge écrit entiers (`lexicon.a1c.js`, `grammar.a1c.js`, `scenarios.a1c.js`), que son en-tête est celui que son genre écrit (`HEADER`), puisque Merge ne lit pas l'ancien) |"],
    // 2. la ligne de tools/learner-pass.js
    ["une séance qui ne finit pas est dite, et `sweep.js` ne s'arrête pas à un nombre fixe de touchers. |",
     "une séance qui ne finit pas est dite, une conversation est jouée une fois par position de choix et dite bloquée quand elle l'est, `sweep.js` ne s'arrête pas à un nombre fixe de touchers, et la feuille d'une règle est jugée (`judgeSheet` : titre, règle, explication, exemples, rien qui déborde de 390 px). |"],
    // 3. la passe d'apprenant
    ["des jours d'étude jusqu'aux cartes parlées et chaque façon de s'en servir, l'écoute,\nune conversation, le défi, puis chaque bouton de seize écrans. Elle a besoin de\nChrome et d'un `npm install` :",
     "des jours d'étude jusqu'aux cartes parlées et chaque façon de s'en servir, l'écoute,\nchaque conversation du cours (`corners.js` les prend dans `NL.content.scenarios`, une\nligne `CONVERSATION <id>` chacune, jouée une fois par position de choix : chaque choix\nde chaque étape est touché), le défi, la feuille de chaque règle de grammaire\nouverte depuis sa pastille sur le parcours, à 390 px (`rules.js` : une règle listée sur\nplusieurs unités a plusieurs pastilles et une seule feuille ; une fin\n`EVERY RULE SHEET OPENS`), puis chaque bouton de seize écrans. Elle a besoin de\nChrome, ou d'Edge (`LEARNER_PASS_CHANNEL=msedge`), et d'un `npm install` :"],
    // 4. ce que les contrôles du kit ne voient pas
    ["`test/tools/fanout.js` essaie chaque règle sur des lignes écrites pour lui, pas sur\n",
     "Check de `grammar` et de `scenarios` relit la garde 6d de `test/lang.js` par\n`test/lib/quoted.js` (des guillemets seulement autour du néerlandais du cours, aucun mot\ndu cours nu dans la prose) : il ne lit pas ce que 6d ne lit pas, soit, dans un scénario,\nles répliques, les choix et leurs réponses.\n`test/tools/fanout.js` essaie chaque règle sur des lignes écrites pour lui, pas sur\n"],
    ["phrase vaut la peine d'être apprise. Les scénarios et les antisèches ne passent\npas par le contrôle d'orthographe.",
     "phrase vaut la peine d'être apprise. Les six scénarios écrits à la main et les\nantisèches ne passent pas par le contrôle d'orthographe ; les quatre conversations du\ngenre `scenarios` y passent, par son Check. Et aucun contrôle ne dit si la règle\nd'une fiche est vraie ni si une conversation sonne flamand : ce sont les 17 lignes\ndu genre `grammar` et du genre `scenarios` que le mainteneur lit entières."],
    // 5. test/lib/quoted.js
    ["pour un bloc le fait par `inZone()` de `test/lib/zone.js`, qui le remet ensuite.",
     "pour un bloc le fait par `inZone()` de `test/lib/zone.js`, qui le remet ensuite.\n`test/lib/quoted.js` dit ce qu'une prose du cours cite et ce qu'elle laisse nu : `test/lang.js`\n(6d.3 et 6d.4) le lit sur tout le cours, le Check des genres `grammar` et `scenarios` sur une\nligne avant Merge."],
    // 6. le grand cours de pace.js, recompté
    ["ses 1 192 éléments sont les 1 035 du cours, et\n157 repris avec un suffixe (`test/lib/grow.js`)",
     "ses 1 172 éléments (comptés le 3 novembre 2026 par `node test/pace.js . 200 one groot`) sont\nles 1 048 du cours, et 124 repris avec un suffixe (`test/lib/grow.js`)"]
  ]);

  edit(R, 'tools/learner-pass/README.md', [
    ["| `node tools/learner-pass/corners.js` | listening (Comprendre, Répéter), the baker conversation, the challenge | `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH` |",
     "| `node tools/learner-pass/corners.js` | listening (Comprendre, Répéter), every conversation in `NL.content.scenarios` (one `CONVERSATION <id>` block each, played once per choice position, so every choice of every step is tapped), the challenge | `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH` |"],
    ["| `EVERY TAP DOES SOMETHING` |\n",
     "| `EVERY TAP DOES SOMETHING` |\n| `node tools/learner-pass/rules.js` | the leerpad, then every grammar rule's chip (`data-act=\"gram\"`) tapped and its sheet checked at 390 px: title, rule, explanation, up to three drill rows, nothing wider than the screen, a close button that works. One line `RULE <id>` per rule; the first line, `RULES <n> (<c> chips …)`, compares the chips on the page with the rules the course lists on its units (a rule listed on several units has one chip each and one sheet) | `EVERY RULE SHEET OPENS` |\n"]
  ]);

  edit(R, 'README.md', [
    ['(34 unités, 1035', '(34 unités, 1048'],
    ['éléments, 6 scénarios, 8 antisèches, 9 règles) ; docteur audio et', 'éléments, 10 scénarios, 8 antisèches, 22 règles) ; docteur audio et'],
    ["**À venir** : les unités 13 à 34 n'ont encore que leurs mots. La suite, dans", "**À venir** : les unités 13 à 34 ont leurs mots, leurs règles de grammaire et leurs conversations, mais pas encore leurs phrases. La suite, dans"],
    ["l'ordre : leurs règles de grammaire et leurs conversations, leurs phrases et", "l'ordre : leurs phrases et"]
  ]);
  edit(R, 'TESTING.md', [
    ["- Le contenu reste le plafond : 1035 éléments, tous de niveau A1 ; les unités 13 à 34 n'ont encore que leurs mots.",
     "- Le contenu reste le plafond : 1048 éléments, tous de niveau A1 ; les unités 13 à 34 ont leurs mots, treize règles de grammaire (neuf unités) et quatre conversations, et pas encore leurs phrases."]
  ]);

  edit(R, 'tools/learner-pass/README.md', [
    ["`days.js` takes about two minutes, `corners.js` half a minute, `sweep.js` about four.",
     "`days.js` takes about a minute and a half, `corners.js` under three minutes (it plays every conversation once per choice position), `rules.js` about fifteen seconds, `sweep.js` a little over four minutes."]
  ]);
  ```
  Then `git diff --stat` lists `README.md`, `TESTING.md` and `tools/learner-pass/README.md` over the files of steps 2
  to 4 (the copy: `31 insertions(+), 15 deletions(-)` over the three, on a CRLF clone). `GLOSSARY.md` is not in the script: it was read
  for « Listening set » and « Conversation », neither of which names a count.

- [ ] **Step 6: Build and verify.** `sh build.sh`, then
  ```
  node test/tools/fanout.js . 2>&1 | grep -E "FAIL|ÉCHEC|contrôles"
  node test/smoke.js . | grep -E "items |scenarios  |ALL CHECKS"
  node test/tools/learner-pass.js . | tail -1
  node test/lang.js . | tail -3
  git diff --stat
  ```
  Expected: `built (local only) index.html (893863 bytes), artifact.html (893249 bytes)` on the copy (the sizes depend on
  the rows; the two comment lines are in the build); `616 contrôles, KIT CONFORME` (613 after tasks 1, 2, 3 and 5, plus the three
  of this task; it moves with every earlier block); the smoke lines of Step 1 and `ALL CHECKS PASSED`;
  `21 checks, LEARNER PASS TOOLS OK`; `LANGUE CONFORME` (about 8 minutes: run it once, here, at the end); the stat lists exactly `README.md`, `TESTING.md`, `artifact.html`, `index.html`,
  `src/content/lexicon.a1c.js`, `test/tools/fanout.js`, `tools/content/kinds/words.js` and
  `tools/learner-pass/README.md`, and no other file (the copy: `8 files changed, 49 insertions(+), 23 deletions(-)`
  against the commit before this task).

- [ ] **Step 7: Commit.** `docs: the two kinds, the learner pass, the a1c header; pin each written header to its kind`
  (no ticket, so no placeholder in the subject), with the stat's eight files.

Done when: `node test/tools/fanout.js .` ends `KIT CONFORME` with the three header checks present; the pin was seen
red with `HEADER` changed alone; `src/content/lexicon.a1c.js` and `HEADER` say the same; `sh build.sh` leaves
`index.html` and `artifact.html` rebuilt and committed; `TESTING.md`, `tools/learner-pass/README.md` and `README.md`
carry the two kinds, the conversations (played once per choice position), `rules.js`, `test/lib/quoted.js` and the counts
10 and 22 and 1048; `GLOSSARY.md` is untouched;
nothing else changed.

### Task 9: GATE: the learner pass in Edge
Class: gate
Ticket: none
After: 3, 5, 7, 8
Show: export LEARNER_PASS_CHANNEL=msedge; echo "## days"; node tools/learner-pass/days.js . 2>&1; echo "## corners"; node tools/learner-pass/corners.js . 2>&1; echo "## sweep"; node tools/learner-pass/sweep.js . 2>&1; echo "## rules"; node tools/learner-pass/rules.js . 2>&1
Ask: « Is there a `PROBLEM:` line in `## days`, `## corners`, `## sweep` or `## rules` of <WS>/tmp/gate-9.md? Does `## corners` hold 10 `CONVERSATION <id>` blocks, each ending `finished after`, and does `## rules` open with `RULES 22 (`? » The run controller answers, on the maintainer's behalf (D23): see « Then ».
Answer to: Rulings
Why: on 25 October 2026 the maintainer asked for a hands-on learner pass in a real browser before every learner's
check; plan 4a's gate 10 ran one, answered by the run controller for them. Phase 4 ends with one release and the
learner's check after plan 4d (D9), so this plan ends in a draft pull request from `phase-4b` into `phase-4`, and the
pass plays the branch's last commit. Three things in this plan change what a learner meets, and only a browser
checks a tap, a real scroll and a screen's height:
- Task 5 puts 13 rules on 9 units of « Parcours »: a rule listed on several units has a chip on each, so the leerpad
  has 27 `data-act="gram"` chips for 22 rules. Each chip opens a sheet with a title, a rule, an explanation and up to
  three drills; the explanations are the longest prose the app shows in a sheet (up to 876 signs a language), opened
  by nothing before this plan, and `rules.js` (task 3) judges each at 390 px.
- Task 7 puts four conversations beside the six: `s-cafe`, `s-afspraak`, `s-school`, `s-gemeente`. `corners.js`
  (task 3) plays all ten, each once per choice position (pass q taps choice `q % n` at every step of the learner's), so
  every choice of every step is tapped; it fails on a conversation that blocks or never ends.
- Task 1's loop in `grammar.a1c.js` puts the rules on their units at load; `sweep.js` taps every chip, and its sheet
  must not jump, overflow or be unreachable.

The suite checks the content (`test/content.js`, `test/lang.js`), the kinds (`test/tools/fanout.js`) and the pass's
own judges (`test/tools/learner-pass.js`). The pass itself is not in the suite: it needs a real browser. `tools/learner-pass/`
(its `README.md` says what each script plays) plays the committed `index.html` in a headless browser dressed as
Safari on iPhone (390×844, touch, `fr-BE`), with a fake recogniser. `LEARNER_PASS_CHANNEL` names the Playwright
channel, `chrome` by default; this desktop has Edge, so Show sets `msedge`. Show writes nothing tracked: its
screenshots go to `tools/learner-pass/shots/`, which git ignores. Each script exits 1 with one `PROBLEM:` line per
fault, and prints, last:
- `days.js`: sessions on study days 0 to 20, until spoken cards come up, each microphone path once. One `DAY <d>` line
  per day played. A clean run ends `THE STUDY DAYS PLAY THROUGH`.
- `corners.js`: listening (Comprendre, Répéter), every conversation of `NL.content.scenarios` (a `CONVERSATION <id>`
  block each, holding one pass per choice position, every pass ending `finished after <n> spoken turn(s)`), the challenge. A clean run ends
  `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`.
- `sweep.js`: every tappable thing on 16 screens, the leerpad's chips among them. A clean run ends
  `EVERY TAP DOES SOMETHING`.
- `rules.js`, run last: the leerpad, then each distinct rule's chip tapped and its sheet judged. It opens with
  `RULES <n> (<c> chips on the leerpad; the course lists <n> rules on <c> unit cards)`, prints one `RULE <id> « <title> »
  rows <k> width 390 ok` line per rule, and a clean run ends `EVERY RULE SHEET OPENS`.

The proof. Show ran, word for word, on the fix copy of tasks 1, 2, 3, 5, 7 and 8 (all fixed),
`/c/Users/youss/.claude/jobs/5b75527c/tmp/fixZ` at commit `ababcb5` (after `sh build.sh`, which left `git status` empty),
in Edge, after `npm ci --ignore-scripts` in `tools/learner-pass/`. The copy has hand-made stand-ins for the 17 rows, so
the run proves the commands and the shape of the output, not the real rows. Its file is
`/c/Users/youss/.claude/jobs/5b75527c/tmp/gate-9-fixY.md`: 311 lines of Show, and one more, written by the harness that
timed it (`TOTAL 534s`; Show itself prints no total). It printed no `PROBLEM:` line (`grep -c "PROBLEM:"` printed
`0`), `grep -c "finished after"` printed `22` on the ten conversations, and `grep -c "^  RULE "` printed `22`, none
other than `rows 3 width 390 ok`. These lines, quoted:
```
## days
DAY 0 15 items are waiting for you / 0 to review, 15 new · about 7 minutes. | cards 33 {"match":1,"pick":7,"recall":8,"dictation":11,"vlaams":5,"type":1}
…
THE STUDY DAYS PLAY THROUGH
## corners
…
CONVERSATION s-bakker … CONVERSATION s-buur … CONVERSATION s-trein … CONVERSATION s-standup … CONVERSATION s-koffie …
CONVERSATION s-status … CONVERSATION s-cafe … CONVERSATION s-afspraak … CONVERSATION s-school … CONVERSATION s-gemeente
  (ten blocks; 22 lines `  finished after <n> spoken turn(s)` in all, 13 with 3 and 9 with 4: one per choice position)
LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH
## sweep
TAPPABLE PER SCREEN (299) {"vandaag":12,"leerpad":34,"meer":14,"praten":16,"luisteren":8,"woorden":26,"spiek":14,"register":82,"dehet":22,"klanken":6,"fouten":14,"doctor":7,"compte":2,"scenario":4,"sheet-instellingen":16,"spiek-redden":22}
EVERY TAP DOES SOMETHING
## rules
RULES 22 (27 chips on the leerpad; the course lists 22 rules on 27 unit cards)
  RULE g-v2 « The verb in second position » rows 3 width 390 ok
  … (22 `RULE` lines, each ending `rows 3 width 390 ok`)
EVERY RULE SHEET OPENS
```
(`DAY` lines for days 0, 1, 2, 3, 5 and 7: 15, 26, 26, 27, 30 and 31 items waiting; replayed on the CRLF clone, the run stopped at day 5, where the spoken cards came up: days 0, 1, 2, 3 and 5, with 15, 26, 25, 27 and 30 items waiting, no day 7. The last day and the counts vary from run to run, only the closing line is fixed. `corners.js` plays each conversation
once per choice position, so its mix of 3 and 4 turns is the conversations' branching, not a count to match.) In the real
run these lines will differ: the 17 stand-in rows are not the course's. The `RULE <id> « <title> »` lines for the 13 new
ids (and only those) carry the real titles; each conversation's `said "…"` lines and its `finished after <n> spoken
turn(s)` carry the real conversations' words and number of turns, and their count (22 here) follows the choices the real
conversations offer; the `DAY` lines' card counts and mixes vary from run to run, and move again with the real sentences
the rules' drills borrow; the sweep's `TAPPABLE PER SCREEN` total and `leerpad` count move only if the real rows list a
rule on another number of units than the stand-ins (the 27 chips are the design's, and the Ask pins `RULES 22 (`); the
times follow the content. The closing lines, the `RULES 22 (` opening and the 10 conversation blocks must be the same.

If Show cannot start (no `node_modules` in `tools/learner-pass/`, no Edge for the channel: Playwright's error names
it), the run stops there: the run controller tells the maintainer the error lines, with a push notification, as for any
run that stops. The gate stays `in progress`. The set-up installs the package (`npm ci --ignore-scripts` in
`tools/learner-pass/`) and checks `LEARNER_PASS_CHANNEL=msedge`.

Before Show: `sh build.sh`, then `git status --short index.html artifact.html` prints nothing (task 8's commit rebuilt
them: the pass plays the committed page, so a build that changes them means a task left them stale: commit them in the
fix below, never play a different page than the one that ships).

Then: a Rulings line for the gate (its question, the answer, and « (on the maintainer's behalf) »), and the gate `done`:
- **No `PROBLEM:` line, each script ends with its closing line, `## corners` holds 10 `CONVERSATION` blocks each
  ending `finished after`, and `## rules` opens with `RULES 22 (`.** The answer is « nothing ».
- **A script with no closing line, or a missing block.** A script that crashes prints no `PROBLEM:` line, only its
  error (Show carries stderr into the file with `2>&1`). A script with no closing line (`THE STUDY DAYS PLAY THROUGH`,
  `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`, `EVERY TAP DOES SOMETHING`, `EVERY RULE SHEET OPENS`), a
  `## corners` with fewer than 10 conversation blocks or a block without `finished after`, and a `## rules` that does not
  open with `RULES 22 (`, are each a fault to confirm, answered as a `PROBLEM:` line is, and reported with the script's
  last lines.
- **`PROBLEM:` lines and faults, answered by the run controller (D23).** The run controller dispatches one background
  subagent on `sonnet`, description `task 9`, to confirm each by hand as `tools/learner-pass/README.md` (« Reading a
  fault ») says, returning at most 10 lines, one per fault: `harness` or `app` and why. A `harness` line (a trap the
  README lists, or another the subagent shows) goes in the Rulings line with its reason; nothing is fixed. An `app`
  line is **fixed in this run**, one at a time, by the fix loop of plan 4a's task 10, extended here (D23):
  1. A test that fails on the old code, first (`CLAUDE.md`): the failing line is quoted. A fault only a browser sees
     (a tap, a scroll, a height) is pinned in `test/tools/learner-pass.js` when it is a judge (`judgeSheet`'s limits,
     the conversation walker), or by the one script re-run, when the test would have to be a browser, whose `PROBLEM:`
     line on the old code is then quoted as the red: say which.
  2. The fix, by the owner of the file: the run controller dispatches the implementer. A row (the text of a rule, an
     explanation, a conversation) is fixed through its row, and the kind's Merge again from the workspace, never in the
     generated file (`CLAUDE.md`); `src/` code by an implementer on `sonnet`; `tools/learner-pass/` by the same.
  3. `sh build.sh`, both outputs committed; the test files the fix touches or names, each alone
     (`node test/<file>.js .`), green, not the full suite; the one script that printed the fault, run again alone: its
     closing line and no `PROBLEM:`. The implementer does not verify its own fix: it is verified and reviewed as any
     task's is (`task-controller.md`: the verifier on `haiku`, the reviewer by the fix's class, `sonnet` for
     `mechanical`, `opus` for `engine`, and a fix in `src/core/` is `engine`) before it is committed.
  4. The fix is a `src/` change after the gate's Show: Show runs again whole into `<WS>/tmp/gate-9-closing.md`
     (« The run file's lines », `Learner pass:`), and is answered the same way; a further Show writes
     `gate-9-closing-2.md`, then `gate-9-closing-3.md`, and so on. The loop ends when a Show prints no `PROBLEM:` line
     and every closing line. A fault that survives its second fix is treated as needing a decision no document holds:
     see the paragraph below.
  The Rulings line lists each fault, its verdict, and the commit that fixed it. A fault that needs a decision no
  document holds (a rule whose statement is in doubt, a conversation that has to be redesigned, a limit the design does
  not give) is not guessed: the run controller writes the question in the Rulings line, tells the maintainer with a
  push notification, and carries on: the gate is `done`, with the fault named in the Rulings line, in the final report
  and in the draft pull request.
- **The 17 rows stay on the maintainer's reading list (D15).** A clean gate does not stand for their reading: neither
  `rules.js` nor `corners.js` says whether a rule is true or a conversation sounds Flemish. The Rulings line says so.
- **A `closing` task changes `src/` after the gate.** The run file's `Learner pass:` line says it: Show runs again into
  `<WS>/tmp/gate-9-closing.md` before the final report, and is answered the same way. The maintainer gets both paths,
  and the draft pull request's description carries both results.

