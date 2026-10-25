# Phase 3 follow-ups — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/run-controller.md`, Mode: one session
> (`one-session.md`). A run controller hands one code-lane task at a time to a task controller, starts task
> 4's batches in a drafting lane beside it, and puts gate 13 to the maintainer; do not use a skill's controller
> loop. Implementers read
> `docs/agents/plan-runs/run-notes.md` before their brief; where the notes and a command here differ, the notes
> win. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** close what phase 3's run found and left open (#92 to #97) and « zijt » (#99), before phase 4 is
designed. Rule « ge » offers the drafter only forms Flanders says. Check leaves a short answer its plausible
mistakes, and « jij »'s two non-word decoys are redrafted through the kind's rows and merged. Split cuts named
rows, so a merged row can be redrafted without a hand edit, and the three notes phase 3's gate 39 edited by
hand get rows of their own. The kit's text helpers are written once. A grammar pattern teaches its drills'
gaps from the first unit that lists it, so Check stops refusing « Zijt gij ». The microphone panel is written
once for the three screens that make the learner speak, and the nazeggen's microphone gets a name. The sounds
table declares the Dutch it puts in bold and leaves its comparisons bare, and the sounds screen declares only
the Dutch of its row heads. Phase 3's plan gets a note under its task 22. Before the maintainer's own check, a
learner pass plays the branch in a real browser (gate 13).

**Architecture:** no new mechanism. `test/lib/text.js` holds the kit's text helpers (task 5);
`sequence.firstUnits` takes the course, `{ units, patterns }` (task 6); `kit.split` takes the ids to cut (task
3). `NL.ex.micPanel` draws the microphone panel of the three screens (task 7). Each run that
`test/lib/langs.js` reads carries its tags, so `test/lang.js` reads the sounds table's bold (task 8). Four rows
of `explanations-be` go through the kit as phase 3's rows did: Split, a drafter, two readers, Check, Merge
(tasks 4 and 12).

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`), and the tools' suites in `test/tools/`.
- The content kit, `tools/content/`, with phase 3's pinned data in the git-ignored `.cache/`.
- The learner pass, `tools/learner-pass/`: headless Chrome dressed as Safari on iPhone, through
  `playwright-core`.
- `gh` for tickets.

**Spec:**
- GitHub issue #12, « New vocabulary every day, English by default, and content to B1 ».
- The tickets, sub-issues of #12: #92, #93, #94, #95, #96, #97 and #99. Each task names its own. Tasks 10 and
  11 have none: the design sitting's learner pass found them, and the maintainer added them to this run.
- The maintainer's decisions of 25 October 2026, D2 to D8, below. They were given in conversation and written
  in phase 3's git-ignored workspace, so this plan restates them.
- `GLOSSARY.md`; ADR 0006 is not touched by any task.

## The maintainer's decisions (25 October 2026)

| D | Ticket | Answer | Task |
|---|---|---|---|
| D2 | #92 | A closed list of verbs and their t-forms (doen → doet, hebben → hebt, zijn → zijt, gaan → gaat, komen → komt, …). A verb not on the list gets no form. | 1 |
| D3 | #93 | The ticket's floors: the length window allows at least two letters either way, and the distance floor lets one short form of the same pronoun be a decoy of another. An unrelated word is still refused. `jij` is redrafted through `explanations-be` rows. | 2, 3, 4, 12 |
| D4 | #95 | One one-line check, the trimmed `oneLine`. The two `quotes()` merge only if their callers want the same thing; otherwise each gets a name that says what it returns. | 5 |
| D5 | #97 | Dutch spellings of the sound taught are `class="nl"`; French comparisons stay bare. « Le u de tu » is the French « u »: bare, with a named exception in `test/lang.js` check 6d. | 8 |
| D6 | #94 | A note under task 22 in the phase 3 plan; the example stays as decided. | 9 |
| D7 | — | File the « zijt » ticket (`met` widened to the forms the grammar cards teach). Class `engine`; it joins the follow-up run. Filed as #99. | 6 |
| D8 | — | Its own small plan: a short design sitting, then the tasks, before phase 4 is designed. | this plan |

#96 had no decision to take: its ticket names the fix.

The maintainer approved this plan's calls on 25 October 2026 (the calls below), and gave three more answers:
the three notes edited by hand join task 4 and its merge, task 12; the two faults the learner pass found join
the run as tasks 10 and 11, each with a test that fails on the old code; and the Settings sheet's jump is
ticket #103, not a task here.

## How far to trust this plan

- Tasks 1 to 9 were proved by their writer on a copy of `effe93a`, and tasks 10 to 12 on a copy of
  `origin/main` at `a64a8fe`, each with the earlier tasks it needs applied: the red step failed as written,
  the green step passed, and the suite stayed green.
- `main` moved after `effe93a`: PRs #100 (the microphone and « Je ne peux pas parler »), #101 (the learner
  pass moved into the repo, and the challenge's fix), #102 and #104 (the toast) are merged, at `a64a8fe`.
  They change none of the files tasks 1 to 6 and 9 touch, nor any content table.
- The assembler then replayed the whole plan in its order on a copy of `a64a8fe`: tasks 1, 2, 3 and 5 to 11
  from their briefs, task 4's Split with four hand-made rows in place of the fan-out's, then task 12. It
  restated in each brief the counts and sizes that `main` or an earlier task moves, checked at Split and after
  task 11 that the four rows keep their stamps, and ran `sh test/run-all.sh` at the end: it printed
  `TOUTE LA SUITE EST PASSÉE`, with `content` 2076, `lang` 23173, `typed` 853, `screens` 819, `engine` 307 and
  the eight journeys. Where a line number still differs in your tree, find the place by its text; where a
  count differs, the `FAIL` lines and the verdict words are what count.
- Task 12 merges task 4's rows. `jij`'s numbers come from a hand-made row, so the build's sizes and its note
  may differ: the verdict words, and the three copies' lines not moving, are what count.
- Gate 13's Show was run by the assembler on the replay, with `index.html` built after task 12: `days.js`,
  `corners.js` and `sweep.js` each exited 0 with no `PROBLEM:` line (task 13's proof says what each played).
  At the gate, a `PROBLEM:` line is a fault to confirm by hand, as `tools/learner-pass/README.md` says, before
  it goes to the maintainer.
- Expected size: task 4's Split cuts four rows in two batches, `be-words` (`ikengij:w1`, `onderweg:w0`) and
  `be-phrases-1` (`overleven:p2`, `overleven:p9`).

## Set-up decisions

- The run works in the worktree `.claude\worktrees\phase-3-follow-ups` of the clone at
  `%USERPROFILE%\dev\vlaams-phase-2`, on branch `phase-3-follow-ups`, cut from `effe93a` (`main` after PR #98).
  Before task 1 the set-up merges `main` into it, `git merge --no-edit origin/main` (a merge commit, no force),
  and `Base:` is that merge. It pushes with `git push origin HEAD:phase-3-follow-ups`. Nothing goes to `main`.
- `Mode: one session`, as phase 3 ran and as the maintainer chose for phase 4 (D16): task 4 is a fan-out, and
  only that mode's drafting lane runs one.
- Tickets, all filed, all sub-issues of #12: #92 (task 1), #93 (tasks 2, 3, 4 and 12), #95 (task 5), #99 (task
  6, filed at this design sitting on 25 October 2026), #96 (task 7), #97 (task 8), #94 (task 9). They carry
  `needs-triage`; their labels are the maintainer's. Tasks 10 and 11 have no ticket.
- `.cache/` was filled at set-up from the phase 3 worktree, each file checked against its pin, then both
  extracts written:
  ```
  node tools/content/fetch.js . kaikki --from ../phase-3/.cache/kaikki
  node tools/content/fetch.js . tatoeba --from ../phase-3/.cache/tatoeba
  node tools/content/kaikki.js .
  node tools/content/tatoeba.js .
  ```
  Task 4's Split reads `.cache/kaikki/belgian.tsv`; task 5's probe reads both extracts. If the phase 3
  worktree is gone, `fetch.js` without `--from` downloads the same files (about 300 MB), and the pins check
  them.
- Gate 13 runs the learner pass in the repo, `tools/learner-pass/`, after the merge of `main` brings it. It
  needs one package, pinned in its `package-lock.json`, and the installed Chrome. The set-up installs it with
  no install script: `npm ci --ignore-scripts`, run in `tools/learner-pass/`. Its `node_modules/` and
  `shots/` are ignored by git.
- The maintainer's approval for phase 3 ended with phase 3. In this run the maintainer answers every ruling,
  dispute and question that is theirs, and merges nothing on the run's word: the run ends with the branch
  pushed.

## Global Constraints

Code:
- `const`, or `let` where it changes; never `var`; no optional chaining. Arrows for short helpers and
  callbacks, `function` declarations for longer named functions. Existing code is not converted.
- Comments and test messages match the file being edited.
- Every fix leaves a test that fails on the old code: write it, watch it fail, then fix it. A refactor's check
  is the suite staying green. A new test file goes in `test/run-all.sh`. Task 9 (a note in a plan) and task 12
  (a merge) have no new test, and each says why.

Interface text and stored data:
- Interface text lives in `src/core/fr.js` and `src/core/en.js`, under the same keys.
- Storage keys and the field names inside stored records keep their spelling. This plan adds none.
- Meanings and prose are read through `NL.gloss`.

Content and its tables:
- The six tables a kind's Merge writes (`be.js`, `sourced.js`, `open.phrases.js`, `notes.js`, `also.js`,
  `decoys.js`) change only through their kind's Merge. In this plan that is task 12 alone, for `jij` and the
  three copies. No task hand-edits one.
- A merge task runs Merge once. If `jij`'s merged row changes its note or `also`, a second run finds that row
  stale, writes nothing and exits 1.
- From task 4's Split to task 12, no task changes the four rows' `be`, meaning, note or `also`: their stamps,
  `10a3e231`, `2b6c1733`, `fb68d9a8` and `74052a73`, held at Split and after task 11 in the replay.
- External data stays in the git-ignored `.cache/`, pinned by date and sha256. A `fail <key>: sha256` line
  stops the run. Nothing from the Wiktionary extract enters a tracked file.

Behaviour:
- `NL.srs.compose()` alone decides what a session contains; no task touches it.
- Grading ignores the display language (ADR 0008).
- Progress is reported as counts, never percentages.

Budgets and the build:
- A budget that counts work still owed only falls, and is two-sided: at each commit it equals the count.
  `AHEAD_BUDGET` (`test/content.js`): 62 → 61 at task 6.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with
  the change.

Public repository:
- The repo is public. No personal data goes in a tracked file; the person is « the maintainer ». Content
  personalises through `{naam}`, `{stad}` and `{bedrijf}`.

## Review Focus

1. **Rule « ge » offers only what Flanders says.**
   - Condition: a « u » or « je » after an inverted verb on the list, after one not on it, after a preposition,
     as an object, after a verb that follows its subject, or standing alone.
   - Expected: the verb's t-form and « ge »; nothing; nothing; nothing; nothing; « ge ».
   - Test: task 1, step 1 (`test/tools/fanout.js`).
2. **The decoys' Check widens for a short answer, and only there.**
   - Condition: « jij », whose answer is « gij », with « je », « jou », « kat », « ja »; a sentence's decoys;
     every shipped decoy.
   - Expected: « je » and « jou » pass; « kat » is too far; « ja » is refused as an answer the course accepts;
     a sentence's floors read as before; no decoy that passed before fails.
   - Test: task 2, step 1 (`test/tools/fanout.js`).
3. **Split cuts the ids it is given, and nothing else.**
   - Condition: ids in two batches; an id the kind does not cut; no ids; a folder already cut.
   - Expected: only those rows, each in its batch, no empty batch; a refusal that writes nothing; the cut as
     before; the folder's lines printed again, nothing recut.
   - Test: task 3, step 1 (`test/tools/fanout.js`).
4. **One one-line check, and no accepted row moves.**
   - Condition: a text with a blank at either end or an inner `\r`, in every field the kit reads as one line;
     every accepted row of phase 3's six kinds.
   - Expected: refused everywhere; every accepted row still passes Check, and every table Merge would write is
     the same bytes.
   - Tests: task 5, step 1, and its probe.
5. **A pattern's gap is taught at the first unit that lists the pattern, and nothing more.**
   - Condition: « Zijt gij al zeventig? » at `ikengij`; a form no unit and no pattern teaches; a form a drill
     writes around its gap; the course's own sentences.
   - Expected: accepted; refused; still untaught; `AHEAD_BUDGET` falls to 61 and never rises on the way.
   - Tests: task 6, step 1 (`test/tools/fanout.js`, `test/tools/sources.js`, `test/content.js`).
6. **One microphone panel, and its markup does not move.**
   - Condition: every state of the panel on the speak exercise, a conversation's turn and the nazeggen, 178
     in all; a copy of the panel left in a screen.
   - Expected: the same markup, byte for byte, before and after; no copy and no outside caller of
     `recordPanel` or `selfRate` left.
   - Tests: task 7, steps 1 and 6 (a snapshot the run does not commit), and `test/screens.js` and
     `test/lang.js`, unchanged.
7. **The sounds table's bold says which language it is.**
   - Condition: each of the 20 bold passages of `NL.content.sounds[].say`; « le u de tu »; a bare « u »
     anywhere else; an exception in `SOUND_OK` that names no bold comparison.
   - Expected: a Dutch spelling is declared `nl-BE`; a comparison is bare and named in `SOUND_OK` with its
     reason; « le u de tu » is bare and not flagged; a bare « u » elsewhere is still flagged; the unused
     exception fails.
   - Test: task 8, step 1 (`test/lang.js`, 6d.8 and check 6).
8. **Every button has a name.**
   - Condition: every page `test/screens.js` reads, the settings switches inside their `<label>`, and the
     nazeggen with a recogniser, its microphone closed and open.
   - Expected: no button with neither text nor `aria-label`; the nazeggen's two buttons named « Parler » and
     « Stop » in the display language, as the speak exercise's are; a switch named by its label passes.
   - Test: task 10, step 1 (`test/screens.js`).
9. **The sounds screen's heads declare only their Dutch.**
   - Condition: the twelve row heads, as rendered; « accent tonique », « -en final », « suppression du t »;
     `g / ch` and `ij / ei`.
   - Expected: a head's word is declared `nl-BE` exactly when its row's Dutch examples write it; the French
     words are read in the table's language; each slash pair is one Dutch span; nothing the learner sees
     changes.
   - Test: task 11, step 1 (`test/lang.js`, 6d.8 and `HTML_FIELDS`).
10. **Merge writes the four rows, and only `jij`'s lines move.**
    - Condition: the settled rows of task 4: `jij`, redrafted, and the three copies of the notes edited by
      hand.
    - Expected: `jij`'s entries change in `decoys.js` (and in `notes.js` and `also.js` only if its row changes
      them); the three copies' lines and every other entry are the same bytes; « gjij » and « jgij » are
      gone.
    - Test: task 12, steps 3 and 5.

## Run order

One line per task: `<id>. <name> — <class> — <ticket> — waits <ids>`. The fan-out task waits for its
`Drafting after:`, the gate for its `After:`.

```
1. Rule « ge » gives the inverted verb its t-form — mechanical — #92 — waits none
2. The decoys' Check leaves a short answer its plausible mistakes — mechanical — #93 — waits none
3. Split cuts only the ids it is given — mechanical — #93 — waits none
4. FAN explanations-be « jij », and rows for three notes edited by hand — fan-out — #93 — waits 2, 3
5. One module holds the kit's text helpers — mechanical — #95 — waits none
6. A grammar pattern teaches its drills' gaps, at the first unit that lists it — engine — #99 — waits none
7. One microphone panel for the three screens that make the learner speak — mechanical — #96 — waits none
8. The sounds table declares its Dutch, and leaves its French comparisons bare — mechanical — #97 — waits none
9. A note under phase 3's task 22 on its example's count need — mechanical — #94 — waits none
10. The nazeggen's microphone has a name — mechanical — none — waits 7
11. The sounds screen declares only the Dutch of its row heads — mechanical — none — waits 8
12. Merge explanations-be « jij », and the rows of three notes edited by hand — mechanical — #93 — waits 4
13. GATE: a learner pass in a real browser, before the maintainer's check — gate — none — waits 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12
```

## The run file's lines

The set-up copies these lines into `<WS>/run.md` word for word. A gate's `show` writes to the screen; the run
controller puts its output in `<WS>/tmp/gate-<id>.md`.

```
Mode: one session
Fan-out: task 4 — kind explanations-be — after 2, 3 — Split: node tools/content/split.js . "<WS>/drafts/explanations-be" ikengij:w1 onderweg:w0 overleven:p2 overleven:p9 — Check: node tools/content/check.js "<WS>/drafts/explanations-be/<batch>" — merged by task 12
Gate: task 13 — after 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12 — show: echo "## days"; node tools/learner-pass/days.js .; echo "## corners"; node tools/learner-pass/corners.js .; echo "## sweep"; node tools/learner-pass/sweep.js . — ask: « The learner pass played the branch's last commit as a learner on an iPhone would: <WS>/tmp/gate-13.md, its screenshots in `tools/learner-pass/shots/`. Check it yourself on the branch's preview: what did you find? (nothing is an answer) » — answer to: Rulings
Learner pass: gate 13 plays the branch's last commit. If a `closing` task changes src/ after the gate's show, run that show again into <WS>/tmp/gate-13-closing.md before the final report, and give the maintainer both paths.
```

## Calls made while writing, for the maintainer

Each is the design sitting's call, made inside the maintainer's decisions. The maintainer approved them on 25
October 2026; calls 1, 11 and 12 as they answered them. The task that carries each follows the call.

1. **One session, with a drafting lane (set-up).** `one-session.md` says the mode was chosen for phase 3 alone, as
   a trial. This plan uses it because task 4 is a fan-out, and only that mode runs one; D16 already chose it for
   phase 4. The other choice was sittings without task 4, with « jij »'s row drafted somewhere else.
2. **The verb list (task 1, D2).** It holds 20 verbs: doen, hebben, zijn, gaan, komen, kunnen, willen,
   zullen, moeten, weten, zeggen, spreken, heten, zien, wonen, werken, vinden, nemen, drinken, eten. Their
   t-forms are all forms OpenTaal knows, and step 1's test fails on one it does not. A verb not on the list
   gets nothing (« Fiets je »).
3. **D3's figures (task 2).**
   - The length window is 40 % or two letters, whichever is wider, and never under one letter.
   - The distance floor is the answer's ratio less 0.15 or one letter of the longer form, whichever is more.
   - Both are compared in hundredths. Compared raw, a float would still refuse « je ».
   - A sentence's floor is unchanged.
   - What this costs: « ja » now passes the floors for « jij ». Only the rule against an answer the course
     accepts refuses it. Telling a plausible decoy from an unrelated one is left to the reader.
4. **Split cuts named rows (task 3).** D3 says « jij » is redrafted through the kind's rows. Split cut
   `explanations-be` whole, 88 merged rows in 3 batches, to redraft one. Task 3 lets it take ids, and changes
   the Split contract in `docs/agents/plan-runs/design-sitting.md` to match: a kit change, which phase 4 will
   use too.
5. **The two `quotes()` merge, in `test/lib/text.js` (task 5, D4).** Both callers want the same three things:
   - the passages quoted between their own language's marks;
   - the text outside them;
   - whether each mark has its pair.

   What each does with the other language's marks stays with the caller. The module sits in `test/lib/` beside
   `spelling.js` and `sequence.js`, which the kit already imports.

   One behaviour changes: a blank at either end, or an inner `\r`, is now refused in every one-line field. The
   probe shows that every accepted row of phase 3 still passes, and every table comes out at the same bytes.
6. **The gaps reading, and `AHEAD_BUDGET` 61 (task 6, D7).** D7's « the forms the grammar cards teach » is read
   as each drill's `gap`.
   - 14 forms move. Five forms that drills write around their gaps stay untaught: begint, staat, naast, elke
     and belt.
   - With the new map alone, the budget would rise from 62 to 63, because two hand-written drills borrow
     « geweest » and « ons », which are now taught later. Task 6 rewrites both so that it falls to 61:
     - `tijd`: « Het is een lange dag geweest. » becomes « Het is een lange dag. »
     - `thuis`: « Ons huis staat in een rustige straat. » becomes « Mijn huis staat in een rustige straat. »
   - Two other choices:
     - every form a drill writes counts: 39 forms move, among them « trein », « brussel » and « thuis » to
       `overleven`, and the budget falls to 58;
     - keep both drills and let the budget rise to 63, against `TESTING.md` and #99.
7. **Tasks 9 and 12 add no test.** Task 9 is a note in a plan. Task 12 is the merge of four rows. The test for
   #93 that fails on the old code is task 2's. No rule a script can apply tells « gjij » from a learner's slip:
   it passes even task 2's Check. So Check and two readers guard the row, as they guard every merged row. The
   three copies change no byte, so no test can fail on the old code for them.
8. **The shared panel is a new `NL.ex.micPanel` (task 7).** #96 names `NL.ex.recordPanel`, but that is the
   record-yourself panel shown when no recogniser can listen. It stays, and the shared panel calls it in that
   case. The nazeggen's microphone buttons still have no `aria-label` after task 7: adding one changes
   behaviour, so it is not in that refactor. Task 10 adds it, with its own test.
9. **Which bold is Dutch (task 8, D5).** The table's 20 bold passages were read one by one: 6 are Dutch and
   14 are comparisons, which stay bare. #97 reads three of them differently:
   - it calls « oe », « w » and the whole of « g doux » Dutch;
   - it lists a bold « ij » the text does not have;
   - it leaves « i » out.

   By D5, bold that names what the learner already knows stays bare: the French oe, the English w, the
   French word « doux ». Only the « g » of « g doux » is declared Dutch.
10. **Check 6 also skips the named comparisons (task 8, D5).** D5 puts the exception in check 6d, and
    `SOUND_OK` lives there. Check 6 is what flags a bare « u » (course Dutch, the polite you), so it skips
    a bold run on the sounds screen that `SOUND_OK` names, and nothing else.
11. **A learner pass before the maintainer's check (gate 13).** On 25 October 2026 the maintainer asked,
    through phase 3's run 2, for a hands-on learner pass in a real browser before every learner's check. This
    run's only learner's check is the maintainer's own, at its end, so the plan has one pass, after the last
    code-lane task. It is a gate and not a task: it commits nothing, and a task controller ends every task with
    a commit, a review and a push. The harness is the repo's own, `tools/learner-pass/` (PR #101), which the
    merge of `main` at set-up brings. The set-up installs its one package, pinned and with no install script.
    If the closing review adds a task that changes `src/`, the pass runs again (the run file's
    `Learner pass:` line).
12. **`main` merged at set-up.** PRs #100, #101, #102 and #104 are in `main` (`a64a8fe`): the speak code
    tasks 7 and 10 sit beside, the learner pass gate 13 runs, and the toast. The set-up merges `main` into the
    branch before task 1, so that the tasks build on it and gate 13 plays it. The replay of the whole plan ran
    on `a64a8fe`, with no conflict.

Left out of this plan, for the maintainer:
- **The Settings sheet's jump, #103.** In Settings, a tap that redraws the sheet throws it back to its top
  (`render()` in `src/ui/shell.js` rebuilds the sheet and keeps no scroll). The design sitting's learner pass
  saw it for « Show the Flemish variant », « Play audio automatically » and « Little sounds », and for the
  export's toast. #104 fixed the toast's part: the toast no longer redraws the page. The switches' part is
  #103, filed for the maintainer's triage, and no task here.
- **The tickets' labels.** All seven carry `needs-triage`, and the run does not relabel them.
- **The end of the run.** The run ends with `phase-3-follow-ups` pushed. It opens no pull request unless the
  maintainer asks for a draft into `main`, and it merges nothing.

## The run

### Task 1: rule « ge » gives the inverted verb its t-form
Class: mechanical
Ticket: #92
Promises: `RULES` in `tools/content/kinds/flemish.js` keeps its six names in their order; the rule named `ge`
gains a `verbs` field, the map from each inverted form it knows to its t-form.
Why: decision D2. Rule `ge` swapped every « u » and « je » for « ge » and left the verb as it was: « Wat doe
je » became « Wat doe ge », where Flanders says « Wat doet ge ». Split offers what each rule writes to the
drafter, and Check accepts a row citing `rule:ge` that copies it. After this task the rule swaps « u » or
« je » only after an inverted verb from a closed list, and puts that verb in its t-form (« doe je » → « doet
ge », « heeft u » → « hebt ge », « ben je » → « zijt ge »). After any other word it writes nothing, rather
than a wrong form: « bij u », « dank u wel », « Ik stuur u een mail » (an object), and a verb the list does
not hold (« Fiets je »). The drafter writes those rows. A verb preceded by its subject is not inverted
(« Ik zie je morgen »), and the rule leaves it too. « u » or « je » standing alone still becomes « ge ».
No shipped row changes: `src/content/be.js` holds no rule output with the wrong verb (#92's scan), and this
task does not touch it. Measured on the course at `effe93a`, the rule's offers become: « Hoe zegt ge dat in
het Nederlands? » (was « zeg ge »), « Hoe oud zijt ge? » (was « ben ge »), « Wat doet ge meestal in het
weekend? », « Hebt ge dat in een andere maat? », « Hebt ge een voorschrift nodig? »; « Kunt ge … »,
« Spreekt ge Frans? », « Hoe heet ge? » and the word « u » → « ge » unchanged; and no offer any more for
« dank u wel », « Ik stuur u een mail. » and « Niks speciaals, en bij u? », whose « ge » was wrong.

Files:
- Modify: `tools/content/kinds/flemish.js` (rule `ge`, lines 35–42 at `effe93a`)
- Test: `test/tools/fanout.js` (the flemish section, lines 543–554 and 634 at `effe93a`)

Notes:
- **The list is closed (D2).** Each t-form is what the verb takes with « ge »; every one is a form OpenTaal
  knows, so none needs a reason in `why` or a line in `test/data/flemish.tsv`. Step 1's test checks that
  last point, so a t-form added later that OpenTaal lacks fails it.
- **`kunde` runs first and is unchanged.** It already contracts « kunt u », « hebt u », « bent u » and their
  « je » forms. `outputs('Kunt u dat niet eens?')` still has 23 entries and no `rule:kunde+ge`.
- **The proof.** These steps ran on a copy of `effe93a`. Step 2 printed the three `FAIL` lines below and
  `427 contrôles, 3 ÉCHEC(S)`; step 4 printed `427 contrôles, KIT CONFORME` (419 before the task).

- [ ] **Step 1: Write the failing test.** In `test/tools/fanout.js`, flemish section, replace
  ```js
      same(K.outputs('Goedemorgen.'), {}, 'sans règle qui s\'applique, rien');
      /* Chaque forme qu'une règle écrit a sa raison dans `why`, et `why` ne garde rien qu'elle n'écrive pas :
         sinon Merge lèverait, et Check refuserait une forme juste, le jour où flemish.tsv ne la tient plus. */
      const SAMPLE = { kunde: 'Kunt u, kun je, hebt u, heeft u, heb je, bent u, ben je', ge: 'u je', da: 'Dat is wat dat', nie: 'niet', t: 'het', is: 'eens' };
      K.RULES.forEach(r => {
        const before = new Set(spelling.tokens(SAMPLE[r.name]).map(spelling.stem));
        const written = spelling.tokens(r.apply(SAMPLE[r.name])).map(spelling.stem).filter(f => !before.has(f));
        same([...new Set(written)].filter(f => f !== 't').sort(), Object.keys(r.why).sort(), 'la règle ' + r.name + ' donne une raison à chaque forme qu\'elle écrit');
      });
  ```
  with
  ```js
      same(K.outputs('Goedemorgen.'), {}, 'sans règle qui s\'applique, rien');
      /* La règle ge : derrière un verbe inversé de sa liste, « ge » et le verbe à sa forme en t ; derrière
         un autre mot, ou un verbe que son sujet précède, rien plutôt qu'une forme fausse (#92). */
      same(['Wat doe je meestal?', 'Heeft u dat?', 'Hoe oud ben je?', 'Hoe zeg je dat in het Nederlands?', 'Kunt u mij helpen?', 'u'].map(nl => K.compose(nl, ['ge']).text),
        ['Wat doet ge meestal?', 'Hebt ge dat?', 'Hoe oud zijt ge?', 'Hoe zegt ge dat in het Nederlands?', 'Kunt ge mij helpen?', 'ge'],
        'derrière un verbe inversé, la règle ge met le verbe à sa forme en t');
      same(['Ik stuur u een mail.', 'Niks speciaals, en bij u?', 'dank u wel', 'Ik zie je morgen.', 'Fiets je naar het werk?'].map(nl => K.compose(nl, ['ge']).idle),
        [['ge'], ['ge'], ['ge'], ['ge'], ['ge']], 'derrière un mot que sa liste ne tient pas, ou un verbe précédé de son sujet, la règle ge n\'écrit rien');
      /* Chaque forme qu'une règle écrit a sa raison dans `why`, et `why` ne garde rien qu'elle n'écrive pas :
         sinon Merge lèverait, et Check refuserait une forme juste, le jour où flemish.tsv ne la tient plus.
         Les formes en t que la règle ge donne au verbe n'en ont pas : ce sont des formes qu'OpenTaal tient. */
      const SAMPLE = { kunde: 'Kunt u, kun je, hebt u, heeft u, heb je, bent u, ben je', ge: 'Doe je, heeft u, ben je', da: 'Dat is wat dat', nie: 'niet', t: 'het', is: 'eens' };
      const SP = spelling.open(FR, CF.NL);
      K.RULES.forEach(r => {
        const verbs = new Set(Object.values(r.verbs || {}));
        const before = new Set(spelling.tokens(SAMPLE[r.name]).map(spelling.stem));
        const written = spelling.tokens(r.apply(SAMPLE[r.name])).map(spelling.stem).filter(f => !before.has(f));
        same([...new Set(written)].filter(f => f !== 't' && !verbs.has(f)).sort(), Object.keys(r.why).sort(), 'la règle ' + r.name + ' donne une raison à chaque forme qu\'elle écrit');
        same([...verbs].filter(f => !SP.forms.has(f)), [], 'la règle ' + r.name + ' ne donne au verbe que des formes qu\'OpenTaal tient');
      });
  ```
  Then, further down in the same section, change the first expected line of the `dokter:p6` check:
  ```js
        'fail draft.json dokter:p6: rule:ge gives « Heeft ge een voorschrift nodig? », not be',
  ```
  becomes
  ```js
        'fail draft.json dokter:p6: rule:ge gives « Hebt ge een voorschrift nodig? », not be',
  ```

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exactly three `FAIL` lines, and the last line `427 contrôles, 3 ÉCHEC(S)`:
  ```
    FAIL: derrière un verbe inversé, la règle ge met le verbe à sa forme en t : ["Wat doe ge meestal?","Heeft ge dat?","Hoe oud ben ge?","Hoe zeg ge dat in het Nederlands?","Kunt ge mij helpen?","ge"], attendu […]
    FAIL: derrière un mot que sa liste ne tient pas, ou un verbe précédé de son sujet, la règle ge n'écrit rien : [[],[],[],[],[]], attendu [["ge"],["ge"],["ge"],["ge"],["ge"]]
    FAIL: check.js dit les raisons du genre, et ne lit pas la suite : ["fail draft.json dokter:p6: rule:ge gives « Heeft ge een voorschrift nodig? », not be", …]
  ```

- [ ] **Step 3: Implement.** In `tools/content/kinds/flemish.js`, replace
  ```js
  /* Les six règles du flamand parlé, dans l'ordre où elles s'appliquent : « kunde » avant « ge »,
     puisque « kunt u » est un tout. `why` donne, pour chaque forme qu'une règle écrit, la raison
     que flemish.tsv inscrit quand OpenTaal ne la connaît pas. */
  ```
  with
  ```js
  /* La règle « ge » : « u » et « je » derrière un verbe inversé deviennent « ge », et le verbe prend
     la forme en t qu'il a avec lui (« doe je » → « doet ge », « heeft u » → « hebt ge », « ben je »
     → « zijt ge »). La liste des verbes est fermée : derrière un mot qu'elle ne tient pas (« bij u »,
     « fiets je »), ou un verbe que son sujet précède (« ik zie je »), la règle n'écrit rien plutôt
     qu'une forme fausse, et le rédacteur écrit la ligne. « u » ou « je » seul devient « ge ». */
  const T_FORM = {};
  [['doet', 'doe doet'], ['hebt', 'heb hebt heeft'], ['zijt', 'ben bent'], ['gaat', 'ga gaat'], ['komt', 'kom komt'],
    ['kunt', 'kan kun kunt'], ['wilt', 'wil wilt'], ['zult', 'zal zult'], ['moet', 'moet'], ['weet', 'weet'],
    ['zegt', 'zeg zegt'], ['spreekt', 'spreek spreekt'], ['heet', 'heet'], ['ziet', 'zie ziet'], ['woont', 'woon woont'],
    ['werkt', 'werk werkt'], ['vindt', 'vind vindt'], ['neemt', 'neem neemt'], ['drinkt', 'drink drinkt'], ['eet', 'eet']]
    .forEach(([t, forms]) => forms.split(' ').forEach(f => { T_FORM[f] = t; }));
  const INVERTED = new RegExp('(?<![' + EDGE + '])(' + Object.keys(T_FORM).join('|') + ')\\s+(?:u|je)(?![' + EDGE + '])', 'gi');
  const SUBJECT = new RegExp('(?<![' + EDGE + '])(?:ik|hij|zij|ze|we|wij|jullie|men)\\s+$', 'i');
  function ge(s) {
    if (/^(u|je)$/i.test(s)) return s[0] === s[0].toLowerCase() ? 'ge' : 'Ge';
    return s.replace(INVERTED, (m, verb, at) => {
      if (SUBJECT.test(s.slice(0, at))) return m;
      const t = T_FORM[verb.toLowerCase()];
      return (verb[0] === verb[0].toLowerCase() ? t : t[0].toUpperCase() + t.slice(1)) + ' ge';
    });
  }

  /* Les six règles du flamand parlé, dans l'ordre où elles s'appliquent : « kunde » avant « ge »,
     puisque « kunt u » est un tout. `why` donne, pour chaque forme qu'une règle écrit, la raison
     que flemish.tsv inscrit quand OpenTaal ne la connaît pas ; `verbs`, les formes en t que la
     règle ge donne aux verbes, du néerlandais qu'OpenTaal tient. */
  ```
  and in `RULES`, replace
  ```js
    { name: 'ge', apply: swapper([['u', 'ge'], ['je', 'ge']]), why: { ge: 'flamand parlé pour « u » et « je »' } },
  ```
  with
  ```js
    { name: 'ge', apply: ge, verbs: T_FORM, why: { ge: 'flamand parlé pour « u » et « je »' } },
  ```

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: no `FAIL` line, and the last line `427 contrôles, KIT CONFORME`.

- [ ] **Step 5: Commit.**
  ```
  git add tools/content/kinds/flemish.js test/tools/fanout.js
  git commit -m "fix(content): the flemish rule « ge » gives an inverted verb its t-form from a closed list, « Wat doet ge », and writes nothing after a word it does not know (#92)"
  ```
  No build: nothing under `src/` changed.

Done when:
- `K.compose('Wat doe je meestal?', ['ge']).text` is `Wat doet ge meestal?` and `K.compose('Heeft u dat?',
  ['ge']).text` is `Hebt ge dat?`; both cases failed before step 3 (#92's acceptance).
- `node test/tools/fanout.js .` prints `427 contrôles, KIT CONFORME`.
- `git diff effe93a --stat -- src/` is empty: `src/content/be.js` is unchanged.

### Task 2: the decoys' Check leaves a short answer its plausible mistakes
Class: mechanical
Ticket: #93
Promises: `checkDecoys` in `tools/content/lib/explain.js` refuses a decoy outside the length window of 40 % or
two letters, whichever is wider, or further from the Dutch than the answer by more than 0.15 of ratio or one
letter, whichever is more, both ratios compared in hundredths. Task 4's `format.md` states the same limits.
Why: decision D3. For a three-letter answer the window was 2 to 4 letters and the distance floor left little
but anagrams of the answer: `ikengij:w1` (« jij », answer « gij ») shipped « gjij » and « jgij ». After this
task:
- The window allows at least two letters either way, never under one: 1 to 5 for « gij ». It only widens,
  and only for an answer under five characters.
- The floor is the answer's own ratio to the Dutch, less 0.15 or one letter of the longer of the two
  (`1 / longest`), whichever is more. For « jij » that is 0.67 − 0.33 = 0.33. « je » (the short form of
  « jij »), « jou » and « jei » reach it (0.33); « kat » and « gei » (0.00) do not. One letter is more than
  0.15 only when the longer of the answer and the Dutch has six letters or fewer, so a sentence's floor is
  unchanged: the existing « 0.50, at least 0.76 » case still reads the same.
- Both ratios are compared in hundredths, the figures the reason prints. Compared raw, the floor for « jij »
  is 0.3333333333333334 and « je »'s ratio 0.33333333333333337, so « je » would still be refused by a float.
  Rounding is monotone, so a decoy that passed before still passes: no limit gets stricter, and no shipped
  decoy can start failing. `test/content.js` checks only that a shipped decoy is no right answer, so it
  sees no change.
« jij »'s decoys are redrafted in task 4 and merged in task 12. This task changes Check only.

Files:
- Modify: `tools/content/lib/explain.js` (`checkDecoys` and the comment above it, lines 236–264 at `effe93a`)
- Test: `test/tools/fanout.js` (the explanations section, lines 1216–1219 at `effe93a`)

Notes:
- **What still guards an unrelated word.** At three letters, one letter of slack lets in any word two edits
  from the Dutch: « ja » passes the floor for « jij », and only the « answer the course accepts » rule
  refuses it (it is `overleven:w7`). The reader of task 4's batch judges whether a decoy is plausible; Check
  keeps the decoy near the answer.
- **The « hey » case changes.** The window for « hey » becomes 1 to 5, so « h » is no longer refused; the
  case keeps « hallootje » (9) and adds a sentence decoy that is too short, so both edges of the window stay
  tested.
- **The proof.** These steps ran on a copy of `effe93a` with task 1 applied. Step 2 printed the two `FAIL`
  lines below and `428 contrôles, 2 ÉCHEC(S)`; step 4 printed `428 contrôles, KIT CONFORME` (427 after task 1).

- [ ] **Step 1: Write the failing test.** In `test/tools/fanout.js`, explanations section, replace
  ```js
      same(rule('overleven:w0', { decoys: ['h', 'hallootje'] }), [
        'decoy « h » is 1 character: 2 to 4, the length of the answer « hey » give or take 40%',
        'decoy « hallootje » is 9 characters: 2 to 4, the length of the answer « hey » give or take 40%'
      ], 'un leurre a la longueur de la réponse, à 40 % près');
  ```
  with
  ```js
      same([rule('overleven:w0', { decoys: ['h', 'hallootje'] }), rule('overleven:p0', { decoys: [DECOYS['overleven:p0'][0], 'Ik leer het, hè.'] })], [[
        'decoy « hallootje » is 9 characters: 1 to 5, the length of the answer « hey » give or take 40% or two letters, whichever is more'
      ], [
        'decoy « Ik leer het, hè. » is 16 characters: 22 to 50, the length of the answer « Ik ben Nederlands aan het leren, hè. » give or take 40% or two letters, whichever is more',
        'decoy « Ik leer het, hè. » is further from the Dutch than the answer: 0.35, at least 0.76'
      ]], 'un leurre a la longueur de la réponse, à 40 % ou à deux lettres près');
      same([rule('ikengij:w1', { decoys: ['je', 'jou'] }), rule('ikengij:w1', { decoys: ['je', 'kat'] })],
        [[], ['decoy « kat » is further from the Dutch than the answer: 0.00, at least 0.33']],
        'une réponse de trois lettres a ses fautes : une forme courte du même pronom passe, un mot sans rapport non');
  ```

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exactly two `FAIL` lines, and the last line `428 contrôles, 2 ÉCHEC(S)`:
  ```
    FAIL: un leurre a la longueur de la réponse, à 40 % ou à deux lettres près : [["decoy « h » is 1 character: 2 to 4, the length of the answer « hey » give or take 40%", …
    FAIL: une réponse de trois lettres a ses fautes : une forme courte du même pronom passe, un mot sans rapport non : [["decoy « je » is further from the Dutch than the answer: 0.33, at least 0.52", …
  ```

- [ ] **Step 3: Implement.** In `tools/content/lib/explain.js`, replace
  ```js
     ici ? », qu'aucun élément n'accepte, qui finissent comme la réponse, en ont la longueur à 40 %
     près, et ne s'éloignent pas du néerlandais plus que la réponse (0,15 de rapport au plus). Les
     « on dit aussi » de la ligne comptent pour sa source ; ceux qu'une autre ligne du lot écrit ne
     comptent qu'après Merge, où test/content.js les voit. */
  ```
  with
  ```js
     ici ? », qu'aucun élément n'accepte, qui finissent comme la réponse, en ont la longueur à 40 %
     près ou à deux lettres près si c'est plus, et ne s'éloignent pas du néerlandais plus que la
     réponse, à 0,15 de rapport près ou à une lettre du plus long des deux si c'est plus (six lettres
     au plus) : pour « jij », dont la réponse est « gij », « je » passe et « kat » non. Les rapports
     se comparent au centième, celui que la raison affiche. Les « on dit aussi » de la ligne comptent
     pour sa source ; ceux qu'une autre ligne du lot écrit ne comptent qu'après Merge, où
     test/content.js les voit. */
  ```
  then replace
  ```js
    const n = Array.from(input.right).length, lo = Math.ceil(n * 0.6), hi = Math.floor(n * 1.4);
    const least = U.ratio(input.right, input.nl) - 0.15, why = [];
  ```
  with
  ```js
    const n = Array.from(input.right).length;
    const lo = Math.max(1, Math.min(Math.ceil(n * 0.6), n - 2)), hi = Math.max(Math.floor(n * 1.4), n + 2);
    const cents = v => Math.round(v * 100), longest = Math.max(U.norm(input.right).length, U.norm(input.nl).length);
    const least = cents(U.ratio(input.right, input.nl) - Math.max(0.15, 1 / longest)), why = [];
  ```
  and replace
  ```js
      if (len < lo || len > hi) say('is ' + len + (len === 1 ? ' character: ' : ' characters: ') + lo + ' to ' + hi + ', the length of the answer « ' + input.right + ' » give or take 40%');
      const r = U.ratio(x, input.nl);
      if (r < least) say('is further from the Dutch than the answer: ' + r.toFixed(2) + ', at least ' + least.toFixed(2));
  ```
  with
  ```js
      if (len < lo || len > hi) say('is ' + len + (len === 1 ? ' character: ' : ' characters: ') + lo + ' to ' + hi + ', the length of the answer « ' + input.right + ' » give or take 40% or two letters, whichever is more');
      const r = cents(U.ratio(x, input.nl));
      if (r < least) say('is further from the Dutch than the answer: ' + (r / 100).toFixed(2) + ', at least ' + (least / 100).toFixed(2));
  ```

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: no `FAIL` line, and the last line `428 contrôles, KIT CONFORME`.

- [ ] **Step 5: Commit.**
  ```
  git add tools/content/lib/explain.js test/tools/fanout.js
  git commit -m "fix(content): the decoys' Check leaves a short answer two letters of length and one letter of distance, so « je » can be a decoy of « gij » for « jij » and « kat » cannot (#93)"
  ```
  No build: nothing under `src/` changed.

Done when:
- `rule('ikengij:w1', { decoys: ['je', 'jou'] })` returns no reason, and « kat » is still refused as too far;
  both failed before step 3 (#93's first acceptance line; the other two close with tasks 4 and 10).
- `node test/tools/fanout.js .` prints `428 contrôles, KIT CONFORME`.
- `git diff HEAD~1 --stat` lists only `tools/content/lib/explain.js` and `test/tools/fanout.js`.

### Task 3: Split cuts only the ids it is given
Class: mechanical
Ticket: #93
Promises: `node tools/content/split.js <repo> <kind folder> [<id>…]` and `kit.split(repo, kindDir, ids)`. Given
ids, Split writes only those rows, each in the batch the kind's split puts it in, writes no batch left empty,
and refuses, writing nothing, an id the kind's split does not cut (`fail <kind> <id>: not a row the kind's split
cuts`). Without ids it cuts as before. Task 4's `Split:` line names `ikengij:w1`.
Why: #93 asks for « jij »'s decoys to be redrafted through the kind's rows, not by hand (`CLAUDE.md`). Split
cuts a kind whole: for `explanations-be` that is every Flemish item, 88 rows in 3 batches, all already merged,
for one row to redraft. Merge already writes by key (`changes[t][src.nl]`) and leaves every other entry as it is, so a
Split that cuts named rows is all a redraft of a few merged rows lacks. Phase 4 needs the same thing whenever
a review finds one shipped row wrong.

Files:
- Modify: `tools/content/lib/kit.js` (`split`, lines 73–112 at `effe93a`, and the summary at line 9)
- Modify: `tools/content/split.js`
- Modify: `docs/agents/plan-runs/design-sitting.md` (the Split contract, « The fan-out form », lines 86–90)
- Test: `test/tools/fanout.js` (section 3, Split, after line 134 at `effe93a`)

Notes:
- **What an already-cut folder does.** As today, a kind folder that has `split.txt` is not cut again, whatever
  ids are given: Split prints its lines. The folder is the record of what was cut.
- **An id the kind does not cut** is either not an item or an item outside the kind (`overleven:w0` is not in
  the test kind `essai`). Both get the same line; Split checks the ids before it writes anything.
- **The proof.** These steps ran on a copy of `effe93a` with tasks 1 and 2 applied. Step 2 printed the three
  `FAIL` lines below and `431 contrôles, 3 ÉCHEC(S)`; step 4 printed `431 contrôles, KIT CONFORME` (428 after
  task 2). On the same copy, with `.cache/kaikki/belgian.tsv` in place, `node tools/content/split.js .
  <dir>/explanations-be ikengij:w1` printed `be-words 1` and wrote that one row.

- [ ] **Step 1: Write the failing test.** In `test/tools/fanout.js`, section 3, after
  ```js
    same(text(path.join(EEN, 'input.json')), kept + ' ', 'un genre déjà coupé n\'est pas recoupé');
    put(EEN, 'input.json', kept);
  ```
  add
  ```js
    /* Des ids nommés : leurs seules lignes, dans le lot où le genre les met ; un lot qui n'en garde
       aucune n'est pas écrit, et un id que le genre ne coupe pas est refusé, sans rien écrire. */
    const SEUL = path.join(TMP, 'seul', 'essai'), UN = path.join(TMP, 'un', 'essai'), REFUS = path.join(TMP, 'refus', 'essai');
    same([run('split.js', [TMP, SEUL, 'thuis:w1', 'bakker:w22']), ['een', 'twee'].map(b => JSON.parse(text(path.join(SEUL, b, 'input.json'))).map(r => r.id))],
      [{ code: 0, lines: ['een 1', 'twee 1'] }, [['bakker:w22'], ['thuis:w1']]], 'Split d\'ids nommés ne coupe que leurs lignes, dans le lot où le genre les met');
    same([run('split.js', [TMP, UN, 'thuis:w1']), fs.existsSync(path.join(UN, 'een'))], [{ code: 0, lines: ['twee 1'] }, false],
      'un lot qui ne garde aucune ligne nommée n\'est pas écrit');
    same([run('split.js', [TMP, REFUS, 'thuis:w1', 'overleven:w0', 'zzz:w9']), fs.existsSync(REFUS)], [{ code: 1, lines: [
      'fail essai overleven:w0: not a row the kind\'s split cuts',
      'fail essai zzz:w9: not a row the kind\'s split cuts'
    ] }, false], 'Split refuse un id que le genre ne coupe pas, et n\'écrit rien');
  ```

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exactly three `FAIL` lines, and the last line `431 contrôles, 3 ÉCHEC(S)`:
  ```
    FAIL: Split d'ids nommés ne coupe que leurs lignes, dans le lot où le genre les met : [{"code":0,"lines":["een 3","twee 2"]}, …
    FAIL: un lot qui ne garde aucune ligne nommée n'est pas écrit : [{"code":0,"lines":["een 3","twee 2"]},true], …
    FAIL: Split refuse un id que le genre ne coupe pas, et n'écrit rien : [{"code":0,"lines":["een 3","twee 2"]},true], …
  ```

- [ ] **Step 3: Implement.** In `tools/content/lib/kit.js`, replace
  ```js
       kit.split(repo, kindDir)       { ok, lines } — écrit <lot>/input.json et split.txt
  ```
  with
  ```js
       kit.split(repo, kindDir, ids)  { ok, lines } — écrit <lot>/input.json et split.txt ; ids,
                                      facultatif, n'en garde que ces lignes
  ```
  then replace
  ```js
     split.txt, écrit en dernier, ne liste que les lots écrits. */
  function split(repo, kindDir) {
  ```
  with
  ```js
     split.txt, écrit en dernier, ne liste que les lots écrits. Des ids nommés ne gardent que
     leurs lignes, dans le lot où le genre les met : c'est ainsi que quelques lignes déjà
     fusionnées se récrivent. Un id que le genre ne coupe pas est refusé. */
  function split(repo, kindDir, ids) {
  ```
  then replace
  ```js
    if (failed(lines)) return { ok: false, lines };
    batches.filter(b => b.rows.length).forEach(b => {
  ```
  with
  ```js
    const keep = ids && ids.length ? new Set(ids) : null;
    if (keep) keep.forEach(id => { if (!seen.has(id)) lines.push('fail ' + name + ' ' + id + ': not a row the kind\'s split cuts'); });
    if (failed(lines)) return { ok: false, lines };
    batches.map(b => keep ? { batch: b.batch, rows: b.rows.filter(r => keep.has(r.id)) } : b).filter(b => b.rows.length).forEach(b => {
  ```
  In `tools/content/split.js`, replace
  ```js
       node tools/content/split.js <dépôt> <dossier du genre>
     Le genre est le nom du dossier (…/drafts/flemish → tools/content/kinds/flemish.js).
     Imprime « <lot> <lignes> » par lot ; sur un dossier déjà coupé, n'écrit rien et imprime
     ses lignes. */
  ```
  with
  ```js
       node tools/content/split.js <dépôt> <dossier du genre> [<id>…]
     Le genre est le nom du dossier (…/drafts/flemish → tools/content/kinds/flemish.js).
     Des ids nommés ne coupent que leurs lignes. Imprime « <lot> <lignes> » par lot ; sur un
     dossier déjà coupé, n'écrit rien et imprime ses lignes. */
  ```
  then replace
  ```js
  const [repo, kindDir] = process.argv.slice(2);
  if (!repo || !kindDir) { console.log('usage: node tools/content/split.js <repo> <kind folder>'); process.exit(1); }
  try {
    const r = kit.split(repo, path.resolve(kindDir));
  ```
  with
  ```js
  const [repo, kindDir, ...ids] = process.argv.slice(2);
  if (!repo || !kindDir) { console.log('usage: node tools/content/split.js <repo> <kind folder> [<id>…]'); process.exit(1); }
  try {
    const r = kit.split(repo, path.resolve(kindDir), ids);
  ```
  In `docs/agents/plan-runs/design-sitting.md`, replace
  ```
  - **Split** `<repo> <kind folder>` cuts the source into batches, `<kind folder>/<batch>/input.json`, each one
    unit of the source (a lesson, a theme) or about 40 rows. Every row is self-contained, carrying what a
    drafter needs to write it, with an `id` stable from run to run and a `stamp` of the source it was cut from.
    It prints one line per batch, `<batch> <rows>`. On a kind folder that already has batches, it writes nothing
    and prints their lines.
  ```
  with
  ```
  - **Split** `<repo> <kind folder> [<id>…]` cuts the source into batches, `<kind folder>/<batch>/input.json`,
    each one unit of the source (a lesson, a theme) or about 40 rows. Every row is self-contained, carrying what a
    drafter needs to write it, with an `id` stable from run to run and a `stamp` of the source it was cut from.
    It prints one line per batch, `<batch> <rows>`. On a kind folder that already has batches, it writes nothing
    and prints their lines. Given ids, it cuts only those rows, each in the batch the kind puts it in, writes no
    batch left empty, and refuses an id the kind does not cut: that is how a few rows already merged are
    redrafted, by a fan-out task whose Split names them.
  ```

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: no `FAIL` line, and the last line `431 contrôles, KIT CONFORME`.

- [ ] **Step 5: Commit.**
  ```
  git add tools/content/lib/kit.js tools/content/split.js docs/agents/plan-runs/design-sitting.md test/tools/fanout.js
  git commit -m "feat(content): Split cuts only the ids it is given, so a fan-out can redraft a few rows already merged (#93)"
  ```
  No build: nothing under `src/` changed.

Done when:
- `node tools/content/split.js . <dir>/essai thuis:w1` writes one batch of one row; an id the kind does not
  cut is refused and nothing is written. All three cases failed before step 3.
- `node test/tools/fanout.js .` prints `431 contrôles, KIT CONFORME`.

### Task 4: FAN explanations-be « jij », and rows for three notes edited by hand
Class: fan-out
Ticket: #93
Kind: explanations-be
Drafting after: 2, 3
Split: node tools/content/split.js . "<WS>/drafts/explanations-be" ikengij:w1 onderweg:w0 overleven:p2 overleven:p9
Check: node tools/content/check.js "<WS>/drafts/explanations-be/<batch>"
Merged by: task 12
Why: #93, second point: « jij »'s decoys are redrafted through the kind's rows, not by hand (`CLAUDE.md`), as
two mistakes a learner would make, and merged. `src/content/decoys.js` ships `'jij': ['gjij', 'jgij']`, two
non-words a learner rejects without knowing anything, because the old Check refused every natural mistake for a
three-letter answer. Task 2 widened Check as the maintainer decided (D3): a decoy's length may be two letters
off either way, and its distance from the Dutch may fall one letter of the longer form below the answer's,
compared in hundredths. The row is the kind's row as phase 3 cut it, so the drafter rewrites `note` and `also`
too; both stay as they are unless one is wrong.

The three other rows give a row to three notes edited by hand. Commit `999fe4f` edited the notes of
`onderweg:w0` (« de fiets »), `overleven:p2` (« Kunt u wat trager spreken, alstublieft? ») and `overleven:p9`
(« Kunt u mij helpen? ») in `src/content/notes.js`, as phase 3's gate 39 ruled. No row holds those edits, so
merging phase 3's batches again would write the old notes back. The maintainer chose on 25 October 2026 to
cut them here: the drafter copies each row as shipped, and task 12 merges it, which writes the same bytes.
Their wording is the maintainer's ruling, not the drafter's or the readers' to change.

Task 3 lets Split cut these four rows: it prints `be-words 2` (`ikengij:w1`, `onderweg:w0`) and
`be-phrases-1 2` (`overleven:p2`, `overleven:p9`). Tasks 5 to 11 run beside the drafting, and none of them
changes a row's `be`, meaning, note or `also`, which the stamp covers: `10a3e231`, `2b6c1733`, `fb68d9a8` and
`74052a73`, in that order: the replay printed them at Split, on `a64a8fe` with tasks 1 to 3, and again after
task 11.

Before the drafting:
- `.cache/kaikki/belgian.tsv` must be in the run worktree, or the kind's Split fails. The set-up put it there
  (the plan's Set-up decisions). Check with `ls .cache/kaikki/belgian.tsv`; if it is missing, report `failed`
  and do not cut.
- `<WS>/drafts/explanations-be/format.md` is this brief's Format and Reader focus, word for word.

What is known of the candidates, measured on a copy with tasks 1 to 3: « je », « jou » and « jei » pass Check
(0.33 from « jij », floor 0.33). « ja » and « zij » pass the floors and are refused as answers the course
accepts (`overleven:w7`, `ikengij:w4`). « kat » and « gei » are refused as too far (0.00), « jullie » as too
long (6 letters, at most 5). Which of the passing ones a learner would type is the drafter's and the reader's
call, not Check's.

#### Format

```json
{"id": "bakker:p9", "stamp": "423427dc", "note": {"fr": "« Da’s » contracte « dat is » : on l’entend partout en Flandre, et on écrit « dat is ».", "en": "“Da’s” runs “dat is” together: you hear it all over Flanders, and write “dat is”."}, "also": [], "decoys": ["Dat’s lekker.", "Da’s lekkere."]}
```

- One row per input row, in its order. Copy `id` and `stamp` unchanged, then give `note`, `also` and, on a row
  whose `vlaams` is true, `decoys`. No other field except `unsure`.
- `note` says what `meaning` does not: where the Flemish form comes from, when and to whom it is said, what
  is said in the Netherlands instead, a trap for a French speaker. Check refuses a note that only repeats the
  meaning.
- `note` is `{"fr": …, "en": …}`, the same note in French and in English. Each side is one line of at most 160
  characters and 2 sentences, with no `<` and no straight double quote. Write the typographic apostrophe, `’`.
- Quotes hold Dutch only (decision 8b): « … » in `fr`, “…” in `en`, no quote inside a quote, and both sides
  quote the same Dutch. A translation goes in parentheses, unquoted:
  `« Ik heb er geen goesting in » (je n’ai pas envie)`.
- Every quoted word is Dutch that OpenTaal or `flemish.tsv` knows, or a word of the row's own forms (`nl`, `be`,
  `also`). A French or an English word is never quoted:
  `Vient tout droit du français embêtant.`
- A word of the course that both sides leave bare is refused: quote it, « het », not het.
- Each side is written in its own language. Outside quotes, Check refuses French function words in `en` (le,
  la, et, est, avec…) and English ones in `fr` (the, and, of, is, with…).
- Both sides hold the same digits and the same `{naam}`, `{stad}` and `{bedrijf}` tokens. Write a default name
  as its token, never the name itself.
- `note` in the input is today's note, or `null`. Keep it word for word when it meets this format and says
  something true and worth saying; otherwise rewrite it, keeping what it says that is right (decision 8a).
- Three rows are copies, not drafts: `onderweg:w0`, `overleven:p2` and `overleven:p9`. Their notes were
  ruled by the maintainer. Copy `note` and `also` from the input word for word, and give these decoys, word
  for word:
  - `onderweg:w0`: `["de veelo", "de vélo"]`
  - `overleven:p2`: `["Kunt de wat trager spreken?", "Kunde wat trager sprekt?"]`
  - `overleven:p9`: `["Kunt de mij helpen?", "Kunde mij helpt?"]`

  They pass Check as they are. If Check refuses one, do not change it: report the line.
- `also` lists the other Dutch forms that the typed exercise should accept for this item, in this sense, `[]`
  for none. One form per entry (no `/`, no `;`, and for a word no comma), a noun with its article, each word spelled
  as OpenTaal or `flemish.tsv` knows it. Check refuses `nl` itself, a form that `be` gives, the same form twice,
  and the Dutch of another item unless that item is a sibling or the input's `also` already holds it. Keep the
  input's forms unless one is wrong. A form you add becomes a right answer, so the reader reads the row whole.
- `decoys`, on a `vlaams` row only: two wrong answers to « Comment le dit-on ici ? », whose right answer is
  `right`. Each one is a slip a learner could make and that no Fleming says (decision 8d): the Dutch spelling
  half kept, a wrong ending, a contraction in the wrong place, for a short answer the other form of the same
  word. Check refuses:
  - two decoys that are one answer;
  - a decoy that the course accepts for any item, the row's `also` included. Punctuation does not count: for
    `bakker:p9` above, whose `right` is « Da’s lekker. », the decoy « Da’s lekker! » is the right answer;
  - a decoy that does not end with `right`'s final punctuation;
  - a decoy whose length is more than 40 % off `right`'s, or more than two letters off if that is more;
  - a decoy further from `nl` than `right` is, by more than 0.15 of `U.ratio` or by one letter of the longer
    of `right` and `nl` if that is more, as it is when the longer has six letters or fewer; the two ratios
    are compared in hundredths.
    For « jij », whose `right` is « gij », « je » passes and « kat » does not.
- `siblings` lists the items with the same sense. Your note and your `also` agree with theirs.
- `labelled` lists the senses that English Wiktionary labels Belgian for `nl` itself, or is `null`. It is a
  lead for the note, not a text to copy: its senses are English, and a quote holds Dutch only.
- A row you doubt carries `"unsure": "<why, in one line>"`. Check still checks it, and the reader reads it first.
- A verdict carries `id` and `verdict`, and no other field.

#### Reader focus

- The three copies (`onderweg:w0`, `overleven:p2`, `overleven:p9`): keep each one whose `note` and `also` are
  its input's and whose decoys are the Format's, word for word, and dispute one that differs. Their wording
  was ruled at phase 3's gate 39, and this run does not reread it.
- Is the note true of Flanders today, at work? Dispute a form of one dialect (West Flemish, Limburg) passed off
  as Flemish, Dutch of the Netherlands passed off as Flemish, and a claim about a word's origin that nobody can
  check.
- Does the note teach what `meaning` does not? A note that says the meaning again in other words passes Check:
  dispute it.
- Are `fr` and `en` the same note, each natural in its own language? Dispute a side that reads as a
  word-for-word translation.
- The decoys. Would a learner plausibly give it? Dispute a decoy that some Fleming does say: it marks a right
  answer wrong. Dispute one that no learner would ever type, a non-word made of the answer's letters above
  all: it teaches nothing, and it is what this redraft replaces.
- The note and the decoys agree. A note that tells the learner to say a form, and a decoy that marks the same
  form wrong as what is said here, must not leave the learner unsure which is right: dispute the pair if they
  do.
- `also`. Is each form right for this item, in this sense, at work? It becomes an answer that the typed
  exercise accepts, and the row goes on to the content check (`readWhole` gives `new also`).
- An old note kept word for word: is it still true, and still worth saying?
- Siblings agree: the same sense gets the same note and the same `also`.
- A note that contradicts `labelled`: who is right?
- `unsure` rows first.

### Task 5: one module holds the kit's text helpers
Class: mechanical
Ticket: #95
Promises: a new `test/lib/text.js` exports `QUOTES`, `oneLine`, `sig`, `untoken` and `quotes`, and no other
file under `tools/` or `test/` defines them. `oneLine` keeps its name in `tools/content/lib/explain.js`, which now
imports it, so task 2's `checkDecoys` calls it unchanged. `quotes(s, l)` returns `{ quoted, outside, why }`. `why`
is `''` when every mark has its pair; otherwise it is the first fault, in the kit's English. `examples.js` no
longer exports `line`.
Why: decision D4 asks for one one-line check, the trimmed `oneLine`. It says the two `quotes()` merge only if
their callers want the same thing.
At `effe93a`:
- `sig` is written three times: `explain.js:144`, `examples.js:32` and `test/content.js:381`.
- The kit has three one-line checks:
  - `oneLine` (explain) and flemish's inline test, both trimmed;
  - `line`, written twice (examples, `test/content.js`), which accepts a blank at either end;
  - open's `text`/`pair` and kit's `unsure` test, which accept a blank around and also an inner `\r`.
- `open.js` has its own string-taking `dutchWords`.

This task folds each into one definition. Every check that a text sits on one line becomes `oneLine`. That is
the only change in behaviour: a blank at either end and an inner `\r` are now refused everywhere. Every
accepted row of the six kinds passes Check as before (step 4's probe), and no table's bytes move.
**`quotes()` merges.** Both callers want the same three things: the passages quoted between their own
language's marks, the text outside them, and whether each mark has its pair. What differs is what each does
with the other language's marks, and that stays with the caller.

Files:
- Create: `test/lib/text.js`
- Modify, with line numbers at `effe93a`:
  - `tools/content/lib/explain.js`: lines 33, 42–43, 126–144, 153–154, 172 and 199.
  - `tools/content/kinds/open.js`: lines 15, 39–45, 55, 62, 78–120, 128, 136, 141, 176, 179 and 190.
  - `tools/content/kinds/examples.js`: lines 16–17, 23, 29–32, 108, 121, 131 and 175.
  - `tools/content/kinds/examples-gen.js`: lines 17–20, 49 and 57.
  - `tools/content/lib/kit.js`: lines 19 and 147.
  - `tools/content/kinds/flemish.js`: lines 18 and 158.
  - `test/content.js`: lines 13, 214, 230–231 and 381.
- Test: `test/tools/fanout.js`, after lines 197, 767, 874, 946 and 994, and replacing line 576.

Notes:
- **Where the module lives.** It goes in `test/lib/text.js`, not the ticket's « e.g. `tools/content/lib/text.js` ».
  `test/content.js` needs `sig` and `oneLine`, and it takes shared code only from `test/lib/`, whose purpose
  that is (`TESTING.md`, « Ce que plusieurs suites font vit une fois dans `test/lib/` »). The kit already
  takes `spelling`, `sequence` and `dutch` from there. A module under `tools/` would make `test/content.js` the
  first suite to reach into the kit for a helper.
- **The `quotes()` merge was checked against both old versions.** It ran on 400,000 random texts made of
  « », “ ”, `"`, letters, digits, `{naam}` and an emoji. For each text it compared explain's `{ quoted,
  outside, ok }` (where `ok` ≡ `!why`), open's list or reason, and open's bare words. There were 0
  differences.
  - Explain still reports the other language's marks and `"` under its own messages, and prints its one
    message when `why` is set.
  - Open refuses them first through `strays`, then reads `quotes()`. Its reasons are now `why`, worded as
    before.
  - Open's bare words used to come from a regex that cut `[«“][^»”]*[»”]`. They now come from `quotes().outside`.
    The two agree on every text that gets that far.
- **Not a one-line check, and it stays.** The note-shape test at `explain.js:158–161` (`n[l] !== n[l].trim()`)
  says a note has no blank at either end. A newline in a note has its own message at line 166 (« holds <, a
  newline or a straight quote "»). `oneLine` there would swap that message for the shape one.
- **Open's `digits` stays.** It holds numbers only, not `{tokens}`, and its message prints them; `sig` is a
  different rule. Open's `pair` keeps its name: it checks the `{ fr, en }` shape, and calls `oneLine` on each
  side.
- **Open's `dutchWords` was exactly `words(untoken(s))`.** `words` is `test/lib/dutch.js`'s word splitter.
  Its comment moves onto the `words` import. Explain's `dutchWords` is the other one, which takes `NL`, and it
  stays.
- **The Merge probe.** It answers « every kind's Merge, rerun on its accepted rows, rewrites the same bytes ».
  The accepted rows sit outside the repo, untracked, in
  `../phase-3/.superpowers/sdd/2026-10-22-phase-3-content-to-b1/drafts/<kind>` (relative to this
  worktree).
  - A real Merge of `flemish`, `explanations` and `explanations-be` refuses its rows as stale, because their
    sources changed after their Merge. That is right, so the probe prepares each table without the stamp
    check and writes nothing.
  - It reads `.cache/tatoeba/extract.tsv` and `.cache/kaikki/belgian.tsv`, which the set-up put in this
    worktree. Without them every `examples` row prints `fail … extract.tsv is missing`, before and after
    alike, and the diff proves nothing: step 2 checks the cache first.
  - Save it outside the repo, as `<WS>/tmp/probe-t5.js`:
    ```js
    /* Sonde de la tâche 5 : pour chaque genre de phase 3, les lignes de Check de chaque lot, puis ce
       que Merge écrirait dans chaque table, sans le contrôle d'empreinte, haché. N'écrit rien.
         node probe-t5.js <repo> <drafts> */
    const fs = require('fs'), path = require('path'), crypto = require('crypto');
    const repo = path.resolve(process.argv[2]), drafts = path.resolve(process.argv[3]);
    const kit = require(path.join(repo, 'tools', 'content', 'lib', 'kit'));
    const table = require(path.join(repo, 'tools', 'content', 'lib', 'table'));
    const { course } = require(path.join(repo, 'tools', 'content', 'lib', 'course'));
    const C = course(repo);
    fs.readdirSync(drafts).sort().forEach(name => {
      const kindDir = path.join(drafts, name);
      const r = kit.readKind(repo, kindDir);
      r.lines.forEach(l => console.log(name + ' ' + l));
      if (r.lines.some(l => /^fail /.test(l))) return;
      r.rows.filter(x => x.why).forEach(x => console.log(name + ' unsettled ' + x.input.id + ': ' + x.why));
      const ctx = { repo, kind: r.kind, kindDir, course: () => C }, changes = {};
      r.kind.tables.forEach(t => { changes[t] = {}; });
      r.rows.filter(x => x.row).forEach(x => {
        const src = C.byId(x.input.id), values = r.kind.merge(x.row, x.input, src, ctx);
        Object.keys(values).forEach(t => { if (values[t] !== undefined) changes[t][src.nl] = values[t]; });
      });
      r.kind.tables.forEach(t => {
        const p = table.prepare(path.join(repo, 'src', 'content', t + '.js'), changes[t]);
        console.log(name + ' merge ' + t + '.js ' + p.set + ' set, ' + p.removed + ' removed, ' + (p.same ? 'same bytes' : 'other bytes') + ' ' + crypto.createHash('sha1').update(p.text).digest('hex').slice(0, 12));
      });
    });
    ```
  - At `effe93a` it prints 201 lines: every Check line of every batch, then one `merge` line per table.
    Every table says `same bytes` except `explanations-be merge notes.js 88 set, 0 removed, other bytes
    ebf0439cfc9f`.
  - That exception predates this task. Commit `999fe4f` hand-edited three notes as gate 39 ruled
    (`onderweg:w0`, `overleven:p2`, `overleven:p9`), with no rows behind them. It is the maintainer's to settle;
    do not chase it here.
  - What this task must show is that the probe's output after step 3 equals its output before.
- **The proof.** These steps ran on a copy of `effe93a`:
  - Step 2 printed the twelve `FAIL` lines below and `430 contrôles, 12 ÉCHEC(S)`.
  - Step 4 printed `430 contrôles, KIT CONFORME`. The suite had 419 checks before this task: this task adds 11,
    and its flemish case replaces one.
  - The real Merges of `examples`, `examples-gen` and `open` were rerun on that copy after step 3. They left
    `src/`, `docs/` and `test/data/` byte for byte as they were.

  They ran again in the replay of the whole plan, on `effe93a` with tasks 1, 2 and 3 applied first, as on the
  branch:
  - `fanout.js` held 431 checks before this task. Step 2 printed the same twelve `FAIL` lines and
    `442 contrôles, 12 ÉCHEC(S)`; step 4 printed `442 contrôles, KIT CONFORME`.
  - The probe printed 201 lines before step 3 and the same 201 after, equal to its output at `effe93a`.

- [ ] **Step 1: Write the failing test.** Make these changes in `test/tools/fanout.js`.

  **Kit section.** Replace
  ```js
    ], 'une ligne : son empreinte, ses champs, « unsure » sur une ligne, puis les règles du genre');
  ```
  with
  ```js
    ], 'une ligne : son empreinte, ses champs, « unsure » sur une ligne, puis les règles du genre');
    put(EEN, 'draft.json', [draftEen[0], Object.assign({}, draftEen[1], { unsure: 'dag,\ror de dag?' }), Object.assign({}, draftEen[2], { unsure: 'maître ' })]);
    same(only(EEN, 'draft.json'), ['fail draft.json overleven:w2: unsure is a reason on one line', 'fail draft.json bakker:w22: unsure is a reason on one line'],
      '« unsure » tient sur une ligne comme tout texte du kit : ni \\r, ni blanc autour');
  ```

  **Flemish section.** Replace
  ```js
      same(why('overleven:w12', ' nie', 'rule:nie'), ['be is a form on one line, or null'], 'be est une forme sur une ligne');
  ```
  with
  ```js
      same([why('overleven:w12', ' nie', 'rule:nie'), why('overleven:w12', 'ni\re', 'rule:nie')], [['be is a form on one line, or null'], ['be is a form on one line, or null']],
        'be est une forme sur une ligne : ni blanc autour, ni \\r');
  ```

  **Examples section.** Replace
  ```js
      same(why([as({ gap: '' })]), ['sentence 1: nl, gap, en and fr are each a string on one line'], 'un trou vide, non');
  ```
  with
  ```js
      same(why([as({ gap: '' })]), ['sentence 1: nl, gap, en and fr are each a string on one line'], 'un trou vide, non');
      same(why([as({ en: 'She speaks English well. ', edited: 'the learner hears the space' })]), ['sentence 1: nl, gap, en and fr are each a string on one line'],
        'une traduction avec un blanc autour, non, même avec sa raison');
      same(why([], { skip: ' no candidate fits' }), ['a row with no sentence says why in skip, on one line'], 'skip sans blanc autour');
      same(why([as({ en: 'She speaks English very well.', edited: 'the learner hears the adverb ' })]),
        ['sentence 1: en « She speaks English very well. » is not Tatoeba\'s 203, « She speaks English well. »: take it as written, or say why in edited'],
        'edited sans blanc autour');
  ```

  **Examples-gen section.** Replace
  ```js
      same(gwhy({ nl: 'Ik heb dorst, gij ook?', gap: 'dorst', en: 'I am thirsty, are you?' }), ['sentence has the fields nl, gap, en, fr'], 'ses quatre champs');
  ```
  with
  ```js
      same(gwhy({ nl: 'Ik heb dorst, gij ook?', gap: 'dorst', en: 'I am thirsty, are you?' }), ['sentence has the fields nl, gap, en, fr'], 'ses quatre champs');
      same(gwhy(Object.assign({}, gdraft[1].sentence, { fr: 'J’ai soif, et toi ? ' })), ['sentence: nl, gap, en and fr are each a string on one line'], 'chaque champ sans blanc autour');
      same(G.checkVerdict({ id: 'tijd:w3', verdict: 'keep', en: ' It is three o\'clock.', fr: 'Il est trois heures.' }),
        ['a verdict carries the reader\'s own en and fr of nl, each on one line'], 'la traduction du lecteur sans blanc autour');
  ```

  **Open section, the list of patched rows.** Replace
  ```js
        [r => { r.need[0].miss = ''; }, ['need 1: miss is one line of Dutch'], 'chaque besoin a sa réponse manquée'],
  ```
  with
  ```js
        [r => { r.need[0].miss = ''; }, ['need 1: miss is one line of Dutch'], 'chaque besoin a sa réponse manquée'],
        [r => { r.ask.en = 'At the bakery,\rask for what you want, and how many. Start with “Mag ik”.'; }, ['ask is { "fr": …, "en": … }, each one line'], 'une paire tient sur une ligne : pas de \\r'],
        [r => { r.model = 'Mag ik drie\rpistolets, alstublieft?'; }, ['model is one line of Dutch'], 'l\'exemple tient sur une ligne : pas de \\r'],
        [r => { r.need[0].miss = ' Ik wil twee pistolets, alstublieft.'; }, ['need 1: miss is one line of Dutch'], 'une réponse manquée sans blanc autour'],
        [r => { r.need[1].any[1] = 'twee '; }, ['need 2: any is a list of words or runs of words'], 'un mot de any sans blanc autour'],
  ```

  **Open section, the verdicts.** Replace
  ```js
        'un keep sans ses deux réponses est refusé, une contestation qui en porte aussi');
  ```
  with
  ```js
        'un keep sans ses deux réponses est refusé, une contestation qui en porte aussi');
      same(verdict('keep', [RIGHT[0], RIGHT[1] + ' ']), [TWO], 'une bonne réponse sans blanc autour');
  ```
  An inner `\r` is the red case for the checks that already trimmed (open, kit). `trim()` takes a `\r` at
  either end with it.

- [ ] **Step 2: Run it and watch it fail.** First save the probe's output on the code as it stands:
  ```
  ls .cache/tatoeba/extract.tsv .cache/kaikki/belgian.tsv
  node <WS>/tmp/probe-t5.js . ../phase-3/.superpowers/sdd/2026-10-22-phase-3-content-to-b1/drafts > <WS>/tmp/t5-before.txt
  node test/tools/fanout.js .
  ```
  `ls` lists both files; if one is missing, stop and report `failed`, since the set-up did not run. The probe
  writes 201 lines, none of them `fail`. Expected from `fanout.js`: exactly these twelve `FAIL` lines, and the
  last line `442 contrôles, 12 ÉCHEC(S)` (the count before this task plus 11; 430 at `effe93a`):
  ```
    FAIL: « unsure » tient sur une ligne comme tout texte du kit : ni \r, ni blanc autour : ["ok draft.json 3 rows"], attendu ["fail draft.json overleven:w2: unsure is a reason on one line","fail draft.json bakker:w22: unsure is a reason on one line"]
    FAIL: be est une forme sur une ligne : ni blanc autour, ni \r : [["be is a form on one line, or null"],["rule:nie gives « nie », not be","« ni » is not a form OpenTaal knows, and rule:nie does not account for it: correct it, or cite evidence none"]], attendu [["be is a form on one line, or null"],["be is a form on one line, or null"]]
    FAIL: une traduction avec un blanc autour, non, même avec sa raison : [], attendu ["sentence 1: nl, gap, en and fr are each a string on one line"]
    FAIL: skip sans blanc autour : [], attendu ["a row with no sentence says why in skip, on one line"]
    FAIL: edited sans blanc autour : [], attendu ["sentence 1: en « She speaks English very well. » is not Tatoeba's 203, « She speaks English well. »: take it as written, or say why in edited"]
    FAIL: chaque champ sans blanc autour : [], attendu ["sentence: nl, gap, en and fr are each a string on one line"]
    FAIL: la traduction du lecteur sans blanc autour : [], attendu ["a verdict carries the reader's own en and fr of nl, each on one line"]
    FAIL: Check : une paire tient sur une ligne : pas de \r : [], attendu ["ask is { \"fr\": …, \"en\": … }, each one line"]
    FAIL: Check : l'exemple tient sur une ligne : pas de \r : [], attendu ["model is one line of Dutch"]
    FAIL: Check : une réponse manquée sans blanc autour : [], attendu ["need 1: miss is one line of Dutch"]
    FAIL: Check : un mot de any sans blanc autour : [], attendu ["need 2: any is a list of words or runs of words"]
    FAIL: une bonne réponse sans blanc autour : [], attendu ["a keep carries right: two right answers of the reader's own, each one line of Dutch"]
  ```

- [ ] **Step 3: Implement.**

  **Create `test/lib/text.js`:**
  ```js
  /* Ce que le kit de contenu (tools/content/) et test/content.js lisent d'un texte, écrit une
     fois : une forme sur une ligne, ses chiffres et ses {jetons}, ses citations.

       const { QUOTES, oneLine, sig, untoken, quotes } = require('./lib/text');
       QUOTES          les guillemets de chaque langue : fr « », en “ ”
       oneLine(s)      vrai pour une chaîne non vide, sans blanc autour, sans \r ni \n
       sig(s)          les chiffres et les {jetons} d'un texte, triés : deux textes qui disent la
                       même chose, en fr et en en, ont la même
       untoken(s)      le texte, chaque {jeton} remplacé par un blanc
       quotes(s, l)    les citations d'un texte de langue l : { quoted, outside, why }, voir plus bas */

  const QUOTES = { en: ['“', '”'], fr: ['«', '»'] };
  const oneLine = s => typeof s === 'string' && s !== '' && s === s.trim() && !/[\r\n]/.test(s);
  const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).sort().join('|');
  const untoken = s => String(s).replace(/\{[a-z]+\}/g, ' ');

  /* Un texte et ses citations entre les guillemets de sa langue. quoted : les passages cités,
     rognés. outside : le texte hors citations, chacune remplacée par « # », pour que la
     ponctuation qu'elle porte ne compte pas. why : '' quand chaque guillemet a sa paire, sinon la
     première faute dans l'ordre du texte, en anglais comme les raisons du kit. Les guillemets de
     l'autre langue ne comptent pas ici : chaque appelant dit lui-même ce qu'il en fait. */
  function quotes(s, l) {
    const [open, close] = QUOTES[l], quoted = [];
    let depth = 0, cur = '', outside = '', why = '';
    const fail = r => { why = why || r; };
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === open) {
        if (depth) fail(s.indexOf(close, i) >= 0 ? 'a quote inside a quote' : 'a ' + open + ' never closed');
        depth = 1; cur = '';
      } else if (ch === close) {
        if (!depth) fail('a ' + close + ' with no ' + open + ' before it');
        else if (!cur.trim()) fail('an empty quote');
        else { quoted.push(cur.trim()); outside += '#'; }
        depth = 0;
      } else if (depth) cur += ch;
      else outside += ch;
    }
    if (depth) fail('a ' + open + ' never closed');
    return { quoted, outside, why };
  }

  module.exports = { QUOTES, oneLine, sig, untoken, quotes };
  ```

  **`tools/content/lib/explain.js`.**
  - Replace
    ```js
    const { dutchWords, words } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));
    ```
    with
    ```js
    const { dutchWords, words } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));
    const { QUOTES, oneLine, sig, untoken, quotes } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));
    ```
  - Replace
    ```js
    const LANGS = ['fr', 'en'];
    /* Les guillemets de chaque langue. */
    const QUOTES = { en: ['“', '”'], fr: ['«', '»'] };
    ```
    with
    ```js
    const LANGS = ['fr', 'en'];
    ```
  - Delete these twenty lines, so that the comment « Les phrases d'un texte » follows the closing `}`
    above them:
    ```js
    /* Un texte et ses citations : { quoted, outside, ok }. outside remplace chaque citation par
       « # », pour que la ponctuation qu'elle porte ne compte pas. ok est faux quand un guillemet
       est seul, imbriqué, ou qu'une citation est vide. */
    function quotes(s, L) {
      const [open, close] = QUOTES[L], quoted = [];
      let depth = 0, cur = '', outside = '', ok = true;
      Array.from(s).forEach(ch => {
        if (ch === open) { if (depth) ok = false; depth = 1; cur = ''; }
        else if (ch === close) {
          if (!depth || !cur.trim()) ok = false;
          else { quoted.push(cur.trim()); outside += '#'; }
          depth = 0;
        } else if (depth) cur += ch;
        else outside += ch;
      });
      if (depth) ok = false;
      return { quoted, outside, ok };
    }
    const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).sort().join('|');
    ```
  - Replace
    ```js
    const ownForms = (row, input) => [input.nl, input.be || ''].concat(input.also, Array.isArray(row.also) ? row.also : []);
    /* Un texte d'une ligne, sans blanc autour. */
    const oneLine = f => typeof f === 'string' && f.trim() !== '' && f === f.trim() && !/[\r\n]/.test(f);
    ```
    with
    ```js
    const ownForms = (row, input) => [input.nl, input.be || ''].concat(input.also, Array.isArray(row.also) ? row.also : []);
    ```
  - Replace `if (!q[l].ok) { why.push(` with `if (q[l].why) { why.push(`. The rest of that line stays.
  - Replace
    ```js
      const bareIn = l => new Set(words(q[l].outside.replace(/\{[a-z]+\}/g, ' ')).filter(w => w.length > 1 && T.dutch.has(w) && !names.has(w)));
    ```
    with
    ```js
      const bareIn = l => new Set(words(untoken(q[l].outside)).filter(w => w.length > 1 && T.dutch.has(w) && !names.has(w)));
    ```

  **`tools/content/kinds/open.js`.**
  - Replace
    ```js
    const spelling = require('../../../test/lib/spelling');
    ```
    with
    ```js
    const spelling = require('../../../test/lib/spelling');
    /* Le néerlandais d'un texte se lit mot à mot comme test/lang.js le lit (6d), jetons ôtés :
       words(untoken(s)), accents gardés. Ce n'est pas NL.util.words (fondé sur norm, qui ôte les
       accents) : celui-ci sert à compter les mots d'une réponse, celui-là à lire le néerlandais cité. */
    const { words } = require('../../../test/lib/dutch');
    const { QUOTES, oneLine, untoken, quotes } = require('../../../test/lib/text');
    ```
  - Replace
    ```js
    /* Les mots d'un texte comme test/lang.js les lit (6d) : lettres et chiffres, en minuscules,
       jetons ôtés, accents gardés. Ce n'est pas NL.util.words (fondé sur norm, qui ôte les accents) :
       celui-ci sert à compter les mots d'une réponse, celui-là à lire le néerlandais cité. */
    const dutchWords = s => String(s).replace(/\{[a-z]+\}/g, ' ').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const pair = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).sort().join() === 'en,fr' &&
      ['fr', 'en'].every(l => typeof v[l] === 'string' && v[l].trim() !== '' && !/\n/.test(v[l]));
    const text = v => typeof v === 'string' && v.trim() !== '' && !/\n/.test(v);
    ```
    with
    ```js
    const pair = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).sort().join() === 'en,fr' &&
      ['fr', 'en'].every(l => oneLine(v[l]));
    /* Un côté qui écrit les guillemets de l'autre langue, ou le guillemet droit. */
    const strays = (s, l) => QUOTES[l === 'fr' ? 'en' : 'fr'].concat('"').some(m => s.indexOf(m) >= 0);
    ```
  - In the memoised course reading, replace `dutchWords(x.nl)` with `words(untoken(x.nl))`, and
    `dutchWords(D[k])` with `words(untoken(D[k]))`.
    - Task 6 changes the `first:` line between those two.
    - Match by text, not by line.
  - Replace the whole block from `/* Les guillemets d'un côté` to the end of `quoteRule`, at lines 78–120:
    ```js
    /* Les guillemets d'un côté : fr cite entre « », en entre “ ”, chaque guillemet fermé, aucune
       citation vide ni imbriquée. Rend les passages cités, ou une raison. */
    function quotes(s, l) {
      const [open, close] = l === 'fr' ? ['«', '»'] : ['“', '”'];
      const other = l === 'fr' ? /[“”"]/ : /[«»"]/;
      if (other.test(s)) return l + ' quotes with ' + open + ' ' + close + ' only';
      const out = [];
      let at = 0;
      for (;;) {
        const a = s.indexOf(open, at), b = s.indexOf(close, at);
        if (a < 0 && b < 0) return out;
        if (a < 0 || (b >= 0 && b < a)) return 'a ' + close + ' with no ' + open + ' before it';
        const c = s.indexOf(close, a + 1), d = s.indexOf(open, a + 1);
        if (c < 0) return 'a ' + open + ' never closed';
        if (d >= 0 && d < c) return 'a quote inside a quote';
        const q = s.slice(a + 1, c).trim();
        if (!q) return 'an empty quote';
        out.push(q);
        at = c + 1;
      }
    }

    /* La règle des guillemets (test/lang.js, 6d) sur une paire { fr, en } : chaque côté cite la
       même chose, dans le même ordre ; ce qui est cité est un mot que le cours a enseigné jusqu'à
       l'unité de la phrase, ou un nombre ; les deux côtés ont les mêmes nombres ; et un mot
       néerlandais du cours qu'ils écrivent tous deux hors citation se cite. « a » est l'avoir
       français et l'article anglais (lang.js l'excuse aussi). */
    function quoteRule(v, where, taught, dutch, names) {
      const q = { fr: quotes(v.fr, 'fr'), en: quotes(v.en, 'en') };
      const bad = ['fr', 'en'].filter(l => typeof q[l] === 'string').map(l => where + ': ' + q[l]);
      if (bad.length) return bad;
      const out = [];
      if (q.fr.join('|') !== q.en.join('|')) out.push(where + ': fr quotes ' + JSON.stringify(q.fr) + ', en quotes ' + JSON.stringify(q.en) + ': both sides quote the same Dutch, in the same order');
      q.fr.forEach(s => dutchWords(s).filter(w => !taught.has(w) && !/^\d+$/.test(w)).forEach(w =>
        out.push(where + ': « ' + w + ' » is quoted, and the course has not taught it by this unit: a quote holds taught Dutch, and a translation goes in parentheses')));
      const digits = s => (s.match(/\d+/g) || []).sort().join(' ');
      if (digits(v.fr) !== digits(v.en)) out.push(where + ': fr has the numbers [' + digits(v.fr) + '], en [' + digits(v.en) + ']');
      const bare = s => new Set(dutchWords(s.replace(/[«“][^»”]*[»”]/g, ' ')));
      const en = bare(v.en);
      [...bare(v.fr)].filter(w => en.has(w) && dutch.has(w) && !names.has(w) && w !== 'a').forEach(w =>
        out.push(where + ': « ' + w + ' » is Dutch the course has, written bare in fr and in en: quote it, or reword'));
      return out;
    }
    ```
    with
    ```js
    /* La règle des guillemets (test/lang.js, 6d) sur une paire { fr, en } : fr cite entre « », en
       entre “ ”, chaque guillemet fermé, aucune citation vide ni imbriquée ; chaque côté cite la
       même chose, dans le même ordre ; ce qui est cité est un mot que le cours a enseigné jusqu'à
       l'unité de la phrase, ou un nombre ; les deux côtés ont les mêmes nombres ; et un mot
       néerlandais du cours qu'ils écrivent tous deux hors citation se cite. « a » est l'avoir
       français et l'article anglais (lang.js l'excuse aussi). */
    function quoteRule(v, where, taught, dutch, names) {
      const q = { fr: quotes(v.fr, 'fr'), en: quotes(v.en, 'en') };
      const why = l => (strays(v[l], l) ? l + ' quotes with ' + QUOTES[l].join(' ') + ' only' : q[l].why);
      const bad = ['fr', 'en'].filter(why).map(l => where + ': ' + why(l));
      if (bad.length) return bad;
      const out = [], fr = q.fr.quoted, en = q.en.quoted;
      if (fr.join('|') !== en.join('|')) out.push(where + ': fr quotes ' + JSON.stringify(fr) + ', en quotes ' + JSON.stringify(en) + ': both sides quote the same Dutch, in the same order');
      fr.forEach(s => words(untoken(s)).filter(w => !taught.has(w) && !/^\d+$/.test(w)).forEach(w =>
        out.push(where + ': « ' + w + ' » is quoted, and the course has not taught it by this unit: a quote holds taught Dutch, and a translation goes in parentheses')));
      const digits = s => (s.match(/\d+/g) || []).sort().join(' ');
      if (digits(v.fr) !== digits(v.en)) out.push(where + ': fr has the numbers [' + digits(v.fr) + '], en [' + digits(v.en) + ']');
      const bare = l => new Set(words(untoken(q[l].outside)));
      const enBare = bare('en');
      [...bare('fr')].filter(w => enBare.has(w) && dutch.has(w) && !names.has(w) && w !== 'a').forEach(w =>
        out.push(where + ': « ' + w + ' » is Dutch the course has, written bare in fr and in en: quote it, or reword'));
      return out;
    }
    ```
  - In `check`, make these replacements, leaving the rest of each line as it is:
    - `if (!text(row.model))` becomes `if (!oneLine(row.model))`.
    - `if (!text(n.miss))` becomes `if (!oneLine(n.miss))`.
    - `n.any.some(a => !text(a))` becomes `!n.any.every(oneLine)`.
    - `strings.forEach(s => dutchWords(s)` becomes `strings.forEach(s => words(untoken(s))`.
    - `concat(dutchWords(row.model))` becomes `concat(words(untoken(row.model)))`.
  - In `checkVerdict`, replace `!r.every(text)` with `!r.every(oneLine)`.

  **`tools/content/kinds/examples.js`.**
  - Replace
    ```js
       Le genre examples-gen (tools/content/kinds/examples-gen.js) reprend d'ici RULES, cut, line, MAX
       et stamp. Ce que Check imprime est en anglais, comme le reste du kit. */
    ```
    with
    ```js
       Le genre examples-gen (tools/content/kinds/examples-gen.js) reprend d'ici RULES, cut, MAX et
       stamp. Ce que Check imprime est en anglais, comme le reste du kit. */
    ```
  - Replace
    ```js
    const { tokens } = spelling;
    ```
    with
    ```js
    const { tokens } = spelling;
    const { oneLine, sig } = require('../../../test/lib/text');
    ```
  - Replace
    ```js
    const line = s => typeof s === 'string' && s.trim() !== '' && !/[\r\n]/.test(s);
    /* Les chiffres et les {jetons} d'un texte, triés : test/content.js tient le fr et l'en de chaque
       paire du cours à la même signature, avec la même fonction. */
    const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).sort().join('|');
    const hand = s => (s.drills || []).filter(d => !('src' in d)).length;
    ```
    with
    ```js
    const hand = s => (s.drills || []).filter(d => !('src' in d)).length;
    ```
  - In `check`, replace `!line(row.skip)` with `!oneLine(row.skip)`, `.every(line)` with `.every(oneLine)`,
    and `!line(d.edited)` with `!oneLine(d.edited)`.
  - In the exports, replace `MAX, CREDITS, RULES, cut, line` with `MAX, CREDITS, RULES, cut`.

  **`tools/content/kinds/examples-gen.js`.** Replace
  ```js
  const { tokens } = require('../../../test/lib/spelling');

  const FIELDS = ['nl', 'gap', 'en', 'fr'];
  const { line } = examples;
  ```
  with
  ```js
  const { tokens } = require('../../../test/lib/spelling');
  const { oneLine } = require('../../../test/lib/text');

  const FIELDS = ['nl', 'gap', 'en', 'fr'];
  ```
  Then:
  - replace `FIELDS.every(k => line(d[k]))` with `FIELDS.every(k => oneLine(d[k]))`;
  - replace `(line(v.en) && line(v.fr) ?` with `(oneLine(v.en) && oneLine(v.fr) ?`.

  **`tools/content/lib/kit.js`.**
  - Replace
    ```js
    const table = require('./table');
    ```
    with
    ```js
    const table = require('./table');
    const { oneLine } = require('../../../test/lib/text');
    ```
  - Replace
    ```js
      if ('unsure' in row && (typeof row.unsure !== 'string' || !row.unsure.trim() || /\n/.test(row.unsure))) out.push('fail ' + file + ' ' + row.id + ': unsure is a reason on one line');
    ```
    with
    ```js
      if ('unsure' in row && !oneLine(row.unsure)) out.push('fail ' + file + ' ' + row.id + ': unsure is a reason on one line');
    ```

  **`tools/content/kinds/flemish.js`.**
  - Replace
    ```js
    const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
    ```
    with
    ```js
    const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
    const { oneLine } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));
    ```
  - Replace
    ```js
      if (typeof be !== 'string' || !be.trim() || be !== be.trim() || /\n/.test(be)) return ['be is a form on one line, or null'];
    ```
    with
    ```js
      if (!oneLine(be)) return ['be is a form on one line, or null'];
    ```

  **`test/content.js`.**
  - Replace
    ```js
    const tree = require('./lib/tree');
    ```
    with
    ```js
    const tree = require('./lib/tree');
    const { oneLine, sig } = require('./lib/text');
    ```
  - Delete the line
    ```js
      const line = s => typeof s === 'string' && s.trim() !== '' && !/[\r\n]/.test(s);
    ```
  - Replace
    ```js
          ok(['nl', 'fr', 'en', 'gap'].every(k => line(d[k])), at + ' : nl, fr, en et gap tiennent chacun sur une ligne, non vide');
          if (!line(d.nl) || !line(d.gap)) return;
    ```
    with
    ```js
          ok(['nl', 'fr', 'en', 'gap'].every(k => oneLine(d[k])), at + ' : nl, fr, en et gap tiennent chacun sur une ligne, non vide, sans blanc autour');
          if (!oneLine(d.nl) || !oneLine(d.gap)) return;
    ```
  - Delete the line
    ```js
      const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).sort().join('|');
    ```
    The two `ok(sig(…))` self-checks under it stay.

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: no `FAIL` line, and the last line `442 contrôles, KIT CONFORME` (the count before this task plus 11;
  430 at `effe93a`). Then:
  ```
  node test/content.js .
  node test/tools/sources.js .
  node test/smoke.js .
  node <WS>/tmp/probe-t5.js . ../phase-3/.superpowers/sdd/2026-10-22-phase-3-content-to-b1/drafts > <WS>/tmp/t5-after.txt
  diff <WS>/tmp/t5-before.txt <WS>/tmp/t5-after.txt
  grep -rnw "const sig" tools test
  grep -rnF -e "trim() !== ''" -e ".trim() ||" -e "/\n/.test" tools/content test/content.js
  grep -rn "dutchWords" tools/content
  ```
  Expected, with the `effe93a` timings:

  | Command | Expected output | Time |
  |---|---|---|
  | `content.js` | the same count as before step 3, then `CONTENU CONFORME` (`2076 contrôles` at `effe93a`) | about 7 s |
  | `test/tools/sources.js` | `32 contrôles, SOURCES CONFORMES` | about 2 s |
  | `smoke.js` | `ALL CHECKS PASSED` | about 33 s |
  | `fanout.js` | (above) | about 47 s |
  | `diff` of the two probe outputs | nothing | |
  | `grep -rnw "const sig"` | only `test/lib/text.js` | |
  | `grep -rnF` | only `explain.js`'s note-shape line (`!n[l].trim() \|\|`), which stays (Notes) | |
  | `grep -rn "dutchWords"` | only `explain.js`'s import and its `dutchWords(NL)` call, the `NL`-taking one from `test/lib/dutch.js` | |

  About `-w`: without it, `grep -rn "const sig"`, the ticket's command, also finds `const signedIn` in
  `test/lang.js`.

  Finish with `sh test/run-all.sh`, which must pass.

- [ ] **Step 5: Commit.**
  ```
  git add test/lib/text.js tools/content/lib/explain.js tools/content/lib/kit.js tools/content/kinds/open.js tools/content/kinds/examples.js tools/content/kinds/examples-gen.js tools/content/kinds/flemish.js test/content.js test/tools/fanout.js
  git commit -m "refactor(content): test/lib/text.js holds the kit's sig, its one-line check and its quotes(), written once; every one-line check now refuses a blank at either end and a \r, and open reads its Dutch with test/lib/dutch's words (#95)"
  ```
  No build: nothing under `src/` changed.

Done when:
- `grep -rnw "const sig" tools test` finds one definition, in `test/lib/text.js`.
- The kit has one one-line check, `oneLine`. No `line`, `text` or inline trim test is left in `tools/content/` or
  `test/content.js`; the note-shape rule is the one exception, and Notes says why it stays.
- The fanout cases « une paire tient sur une ligne : pas de \r » and « l'exemple tient sur une ligne : pas de
  \r » refuse an open row with an inner `\r`. Both failed before step 3, as did the other ten new cases.
- `tools/content/` has no string-taking `dutchWords`.
- The probe prints the same lines after step 3 as before. Every table it prepares is `same bytes`, except
  `explanations-be` `notes.js`, which is unchanged by this task and is the maintainer's (Notes).
- `node test/tools/fanout.js .` prints the count before this task plus 11 (`442 contrôles`), then
  `KIT CONFORME`.
- `sh test/run-all.sh` passes.

### Task 6: a grammar pattern teaches its drills' gaps, at the first unit that lists it
Class: engine
Ticket: #99
Promises: `sequence.firstUnits(course)` in `test/lib/sequence.js` takes the course, `{ units, patterns }`
(`NL.content`, the kit's `C.RAW`, or a fixture), where it took the units. It returns the same Map, form → index
of the first unit that teaches it, and a unit now also teaches the `gap` of each drill of each pattern its
`grammar` lists. `patterns` is required. Every caller passes the course: `test/content.js`,
`tools/content/kinds/examples.js` (Check of `examples` and `examples-gen`, and `tatoeba.rank` through
`seq.first`), `tools/content/kinds/open.js`, `test/tools/sources.js`.
Why: decision D7, the gaps reading. `firstUnits` mapped each form to the first unit whose words or phrases
write it and read no grammar pattern, so a form the course teaches only as a pattern's gap counted as never
taught. That is why Check refused « Zijt gij al zeventig? » at every unit, though `g-gegij` drills « Zijt » at
`ikengij`. After this task, a unit also teaches the gap of each drill of each pattern its `grammar` lists. The
pattern counts at the first unit that lists it, which is how `src/content/index.js:86-95` ranks it in the app.
A drill's other words are scaffolding and teach nothing. Measured on the course at `effe93a`, #99's 14 forms
move (unit indexes from 0; Check's messages count from 1):
- « werk » and « wonen » go from 1 to 0 (`overleven`).
- These are met for the first time:
  - « vertrekt » at 0.
  - « woont », « komt » and « zijt » at 1 (`ikengij`).
  - « eenentwintig », « tweeënveertig » and « vijfenzestig » at 2 (`tijd`).
  - « grote », « groot » and « lekkere » at 3 (`bakker`).
  - « ons » at 5 (`familie`).
  - « geweest » at 11 (`weekend`).

`AHEAD_BUDGET` goes from 62 to 61:
- Down one: « Ik leer Nederlands voor mijn werk. » (`overleven`) no longer borrows « werk » ahead.
- Two hand-written drills would have gone up. « geweest » and « ons » were never taught, so the old measure
  never counted them. They are now taught at `weekend` and `familie`, which come after the two drills that use
  them. This task rewrites both drills without them, so that the budget falls, as a budget only does:
  - « Het is een lange dag geweest. » (« de dag », `tijd`, `src/content/examples.js:75`) becomes « Het is een
    lange dag. »
  - « Ons huis staat in een rustige straat. » (« het huis », `thuis`, `src/content/examples.js:128`) becomes
    « Mijn huis staat in een rustige straat. » (« mijn » is taught at `ikengij`).

Nothing else that reads the map changes:
- `tools/content/tatoeba.js` is untouched. Its extract and load don't read `sequence`. Its `rank` reads
  `seq.first`, which `examples.js` builds. On `effe93a`'s course:
  - `rank`'s lists change for 28 of 307 words, all of which already have their sentences.
  - It offers 1017 candidates where it offered 996.
  - No candidate it drops is one the new map refuses.
  - Split of `examples` offers 0 words, before and after.
- `test/tools/sources.js`'s existing `rank` checks are unchanged, since their fixture passes `patterns: []`.

Files:
- Modify: `test/lib/sequence.js` (header lines 8–9 and 18, `firstUnits` lines 31–36 at `effe93a`)
- Modify: `tools/content/kinds/examples.js` (line 39), `tools/content/kinds/open.js` (line 61)
- Modify: `src/content/examples.js` (lines 75 and 128), a hand-written table that no Merge writes
- Modify (the build writes them): `index.html`, `artifact.html`
- Modify: `TESTING.md` (line 27, line 160)
- Test: `test/content.js` (lines 189 and 195), `test/tools/sources.js` (line 154), `test/tools/fanout.js` (the
  examples section after line 871, the open section after line 986)

Notes:
- **The gaps reading (D7).** Only `d.gap` is read, never `d.nl`. Five forms that drills write around their gap
  stay untaught, because no unit writes them:
  - « begint » (`g-halfuur`)
  - « staat » (`g-dehet`, `g-bezit`)
  - « naast » (`g-bezit`)
  - « elke » and « belt » (`g-scheidbaar`)

  Step 1 pins « begint ».
- **One rule in two places.** `firstUnits` restates `index.js`'s rule (a pattern belongs to the first unit
  whose `grammar` lists it) instead of reading `build()`'s list, for two reasons:
  - The kit and the fixtures pass raw collections, which have no build.
  - That list also holds the learner's own words (`NL.state.customs()`), which no sentence of the course may
    count on.

  `sequence.js`'s header names `index.js`.
- **`patterns` is required.** A caller left on the old call (`firstUnits(units)`) crashes. It does not quietly
  read the narrow map. A fixture with no patterns passes `patterns: []`.
- **`content.js` reads the map in two checks.** One is the budget. The other is section 3's check on sourced
  sentences (`sequence.unmet`, `test/content.js:235`), which reads the same `first`. Both stay green.
- **Not this task: `open.js`'s `taught` and `dutch`.** They hold the vocabulary Split gives the drafter and the
  quote rule. They still read words and phrases only (`dutchWords`), not the map.
- **Why two drills change in this task.** #99 says the budget « never rises », and `TESTING.md` says a budget
  only falls. That holds for forms that move earlier. It does not hold for forms met for the first time: with
  the new map alone the count is 63. The two drills that borrow them are rewritten here, in the same commit,
  so that the count never stands above 62. Each new sentence keeps its gap and its sense, and borrows nothing
  (measured: `sequence.ahead` gives `[]` for both at their units). No stored record names a drill: items are
  keyed by their id (`test/data/ids.tsv`), and « Ons huis staat naast onze tuin. » there is `g-bezit`'s own
  sentence, which stays.
- **The other reading.** If every form a drill writes counted (`d.nl` for `d.gap`), 39 forms would move at
  `effe93a` (#99 counted 41), among them « trein », « brussel » and « thuis », to `overleven`. AHEAD would fall
  to 58, with no rise.
- **Neighbours.** No other task touches these lines:
  - Task 5 edits `examples.js:29-32`, `open.js:42-45` and `quotes()`, and `test/content.js` near :214 and :381.
  - Tasks 1 and 5 add checks to other sections of `fanout.js`.

  Every insertion point below is quoted by its text, so it still holds if those tasks land first. On the
  branch, after tasks 1, 2, 3 and 5, `fanout.js` holds 442 checks when this task starts and 446 after it, and
  `sources.js` 32 then 33. At `effe93a` alone, `fanout.js` went from 419 to 423.
- **The proof.** These steps ran on a copy of `effe93a`.
  - Step 2 printed:
    - `fanout.js`: the three `FAIL` lines below, then `423 contrôles, 3 ÉCHEC(S)` (419 before), in 54 s.
    - `sources.js`: its `CRASH`, in 1.2 s.
    - `content.js`: its one `FAIL`, then `2076 contrôles, 1 ÉCHEC(S)`, in 5.8 s.
  - Step 4 printed:
    - `fanout.js`: `423 contrôles, KIT CONFORME`, in 48.5 s.
    - `sources.js`: `33 contrôles, SOURCES CONFORMES` (32 before), in 1.7 s.
    - `content.js`: `2076 contrôles, CONTENU CONFORME` and `séquence 61 / 557`, in 5.9 s.
    - `smoke.js`: `ALL CHECKS PASSED`, in 36 s.
    - `engine.js`: `307 checks, ENGINE OK`, in 14.7 s.
    - `lang.js`: `23129 contrôles, LANGUE CONFORME`; `dehet.js`: `DE/HET : TOUT EST CONFORME`.
  - They ran again in the replay of the whole plan, on `effe93a` with tasks 1, 2, 3 and 5 applied first, as on
    the branch. Step 2 printed the same three `FAIL` lines and `446 contrôles, 3 ÉCHEC(S)`, the same `CRASH`
    and the same `content.js` `FAIL`. Step 4 printed `446 contrôles, KIT CONFORME`, `33 contrôles, SOURCES
    CONFORMES`, `2076 contrôles, CONTENU CONFORME` and `séquence 61 / 557`.
  - `sh test/run-all.sh` ran in the replay of the whole plan.

- [ ] **Step 1: Write the failing tests.** In `test/tools/fanout.js`, examples section (examples-gen), replace
  ```js
      same(gwhy(gdraft[1].sentence), [], 'une phrase écrite qui suit les règles');
  ```
  with
  ```js
      same(gwhy(gdraft[1].sentence), [], 'une phrase écrite qui suit les règles');
      /* #99 : une règle de grammaire enseigne le trou de ses phrases, à la première unité qui la
         liste. « Zijt », le trou de g-gegij, est vu à ikengij ; « begint », que g-halfuur écrit
         autour de son trou, n'est enseigné nulle part. */
      const gwhyDrie = sentence => G.check(gen('tijd:w3', sentence), gin[0], gctx);
      same(gwhyDrie({ nl: 'Zijt gij hier al drie jaar?', gap: 'drie', en: 'Have you been here for three years?', fr: 'Tu es ici depuis trois ans ?' }), [],
        'une forme qu\'une règle de grammaire enseigne compte comme vue à l\'unité qui liste la règle (#99)');
      same(gwhyDrie({ nl: 'Zijt gij om drie uur vrij?', gap: 'drie', en: 'Are you free at three?', fr: 'Tu es libre à trois heures ?' }),
        ['sentence uses forms the course never teaches: vrij'], 'une forme qu\'aucune unité ni aucune règle n\'enseigne reste refusée');
      same(gwhyDrie({ nl: 'Het begint om drie uur.', gap: 'drie', en: 'It starts at three.', fr: 'Ça commence à trois heures.' }),
        ['sentence uses forms the course never teaches: begint'], 'une règle enseigne le trou de ses phrases, pas les mots qui l\'entourent');
  ```
  In the same file, open section, replace
  ```js
      same(why(null, 'overleven:p1'), ['the model uses « drie », which unit 3 (tijd) teaches, after this phrase\'s unit 1',
        'the model uses « pistolets », which unit 4 (bakker) teaches, after this phrase\'s unit 1'], 'Check : l\'unité est celle de la ligne d\'entrée');
  ```
  with
  ```js
      same(why(null, 'overleven:p1'), ['the model uses « drie », which unit 3 (tijd) teaches, after this phrase\'s unit 1',
        'the model uses « pistolets », which unit 4 (bakker) teaches, after this phrase\'s unit 1'], 'Check : l\'unité est celle de la ligne d\'entrée');
      same(why(r => { r.model = 'Mag ik drie pistolets voor ons?'; }), ['the model uses « ons », which unit 6 (familie) teaches, after this phrase\'s unit 4'],
        'Check : « ons », le trou de g-bezit, est enseigné à familie, la première unité qui liste la règle (#99)');
  ```
  In `test/tools/sources.js`, replace
  ```js
    const seq = { NL, first: sequence.firstUnits(units), ui: 0 };
  ```
  with
  ```js
    const seq = { NL, first: sequence.firstUnits({ units, patterns: [] }), ui: 0 };
    /* #99, ce que firstUnits rend et que rank lit : une règle de grammaire enseigne le trou de
       chacune de ses phrases, à la première unité qui la liste, comme src/content/index.js range
       la règle ; les autres mots de la phrase l'entourent, elle ne les enseigne pas. */
    const taught = sequence.firstUnits({
      units: [{ words: [{ nl: 'de trein' }], grammar: ['g-b'] }, { words: [{ nl: 'werken' }, { nl: 'klaar' }], grammar: ['g-a', 'g-b'] }],
      patterns: [{ id: 'g-a', drills: [{ nl: 'Zijt ge klaar?', gap: 'Zijt' }, { nl: 'Neemt ge de trein?', gap: 'trein' }] },
        { id: 'g-b', drills: [{ nl: 'Ik werk thuis.', gap: 'werk' }] }]
    });
    same(['zijt', 'trein', 'werk', 'klaar', 'neemt', 'thuis'].map(t => taught.has(t) ? taught.get(t) : null), [1, 0, 0, 1, null, null],
      'firstUnits : le trou d\'une phrase compte à la première unité qui liste sa règle, ses autres mots jamais');
  ```
  In `test/content.js`, section 3, replace
  ```js
    const AHEAD_BUDGET = 62;
  ```
  with
  ```js
    const AHEAD_BUDGET = 61;
  ```

- [ ] **Step 2: Run them and watch them fail.**
  ```
  node test/tools/fanout.js .
  node test/tools/sources.js .
  node test/content.js .
  ```
  Expected:
  - `fanout.js`: exactly three `FAIL` lines, then `446 contrôles, 3 ÉCHEC(S)` (four more than the 442 the file
    held before step 1; 423 at `effe93a`):
    ```
      FAIL: une forme qu'une règle de grammaire enseigne compte comme vue à l'unité qui liste la règle (#99) : ["sentence uses forms the course never teaches: zijt"], attendu []
      FAIL: une forme qu'aucune unité ni aucune règle n'enseigne reste refusée : ["sentence uses forms the course never teaches: zijt, vrij"], attendu ["sentence uses forms the course never teaches: vrij"]
      FAIL: Check : « ons », le trou de g-bezit, est enseigné à familie, la première unité qui liste la règle (#99) : [], attendu ["the model uses « ons », which unit 6 (familie) teaches, after this phrase's unit 4"]
    ```
  - `sources.js`: a crash, since the old `firstUnits` takes an array:
    ```
    CRASH TypeError: units.forEach is not a function
        at Object.firstUnits (…/test/lib/sequence.js:33:9)
        at main (…/test/tools/sources.js:154:37)
    ```
  - `content.js`: one `FAIL`, then `2076 contrôles, 1 ÉCHEC(S)`:
    ```
      FAIL: 62 phrases d’exemple empruntent du vocabulaire à une unité ultérieure, budget 61 — baisser le budget quand on en corrige, jamais le lever
    ```

  Each change step 3 makes has its own red:
  - `sequence.js` → `sources.js`
  - `examples.js:39` → the first two `FAIL` lines
  - `open.js:61` → the third
  - `content.js:189` and the two drills of `src/content/examples.js` → the budget: the new map alone counts
    63, the drills alone 62, both 61

- [ ] **Step 3: Implement.** In `test/lib/sequence.js`'s header, replace
  ```
       sequence.firstUnits(units)       Map forme → index de la première unité dont un mot ou une
                                        phrase écrit cette forme (spelling.tokens)
  ```
  with
  ```
       sequence.firstUnits(course)      Map forme → index de la première unité qui l'enseigne
                                        (spelling.tokens) : un de ses mots ou une de ses phrases
                                        l'écrit, ou c'est le trou d'une phrase d'une règle de
                                        grammaire qu'elle liste ; course est { units, patterns },
                                        NL.content ou le RAW des outils
  ```
  and replace
  ```
     n'est comptée qu'une fois par texte. Ce que ces formes NE voient PAS : une forme fléchie
  ```
  with
  ```
     n'est comptée qu'une fois par texte. Une règle de grammaire enseigne le trou de chacune de ses
     phrases, à la première unité qui la liste, comme src/content/index.js la range ; les autres
     mots d'une phrase l'entourent et ne comptent pas : « begint », que g-halfuur écrit, n'est
     enseigné nulle part (#99). Ce que ces formes NE voient PAS : une forme fléchie
  ```
  then replace
  ```js
  function firstUnits(units) {
    const first = new Map();
    units.forEach((u, ui) => (u.words || []).concat(u.phrases || []).forEach(it =>
      tokens(it.nl).forEach(t => { if (!first.has(t)) first.set(t, ui); })));
    return first;
  }
  ```
  with
  ```js
  function firstUnits(course) {
    const first = new Map();
    course.units.forEach((u, ui) => {
      const listed = course.patterns.filter(p => (u.grammar || []).indexOf(p.id) >= 0);
      (u.words || []).concat(u.phrases || []).map(it => it.nl)
        .concat(...listed.map(p => (p.drills || []).map(d => d.gap)))
        .forEach(s => tokens(s).forEach(t => { if (!first.has(t)) first.set(t, ui); }));
    });
    return first;
  }
  ```
  In `tools/content/kinds/examples.js`, `seen()`, replace
  ```js
    if (!memo.has(C)) memo.set(C, { order: C.RAW.units.map(u => u.id), first: sequence.firstUnits(C.RAW.units), S: spelling.open(repo, C.NL), T: null });
  ```
  with
  ```js
    if (!memo.has(C)) memo.set(C, { order: C.RAW.units.map(u => u.id), first: sequence.firstUnits(C.RAW), S: spelling.open(repo, C.NL), T: null });
  ```
  In `tools/content/kinds/open.js`, `facts()`, replace
  ```js
      first: sequence.firstUnits(units), S: spelling.open(repo, C.NL),
  ```
  with
  ```js
      first: sequence.firstUnits(C.RAW), S: spelling.open(repo, C.NL),
  ```
  (`units` is still `C.RAW.units`, and `index` and `taught` still read it.) In `test/content.js`, section 3,
  replace
  ```js
    const first = sequence.firstUnits(units);
  ```
  with
  ```js
    const first = sequence.firstUnits(NL.content);
  ```
  In `src/content/examples.js`, « de dag », replace
  ```js
        S('Het is een lange dag geweest.', { fr: 'Ça a été une longue journée.', en: 'It has been a long day.' }, 'dag')],
  ```
  with
  ```js
        S('Het is een lange dag.', { fr: 'C’est une longue journée.', en: 'It’s a long day.' }, 'dag')],
  ```
  and, « het huis », replace
  ```js
      'het huis': [S('Ons huis staat in een rustige straat.', { fr: 'Notre maison est dans une rue calme.', en: 'Our house is in a quiet street.' }, 'huis'),
  ```
  with
  ```js
      'het huis': [S('Mijn huis staat in een rustige straat.', { fr: 'Ma maison est dans une rue calme.', en: 'My house is in a quiet street.' }, 'huis'),
  ```
  In `TESTING.md`, the `tools/sources.js` row, replace
  ```
  et le classement des phrases de Tatoeba (`tools/content/tatoeba.js`) ; rien n'est téléchargé |
  ```
  with
  ```
  et le classement des phrases de Tatoeba (`tools/content/tatoeba.js`), avec l'ordre du cours qu'il lit (`sequence.firstUnits`) ; rien n'est téléchargé |
  ```
  and replace
  ```
  que le contenu actuel enfreint déjà la règle : 62 phrases d'exemple empruntent du
  ```
  with
  ```
  que le contenu actuel enfreint déjà la règle : 61 phrases d'exemple empruntent du
  ```

- [ ] **Step 4: Run them and watch them pass.**
  ```
  node test/tools/fanout.js .
  node test/tools/sources.js .
  node test/content.js .
  ```
  Expected: no `FAIL` line, and these lines:
  - `fanout.js`: `446 contrôles, KIT CONFORME`
  - `sources.js`: `33 contrôles, SOURCES CONFORMES`
  - `content.js`: `  séquence        61 / 557 phrases empruntent en avant (budget 61)`, then
    `2076 contrôles, CONTENU CONFORME`

  Then `sh build.sh`, and `sh test/run-all.sh` passes.

- [ ] **Step 5: Commit.**
  ```
  git add test/lib/sequence.js tools/content/kinds/examples.js tools/content/kinds/open.js src/content/examples.js TESTING.md test/content.js test/tools/sources.js test/tools/fanout.js index.html artifact.html
  git commit -m "fix(content): a grammar pattern teaches its drills' gaps at the first unit that lists it, so Check accepts « Zijt gij » from ikengij on; two drills that would now borrow « geweest » and « ons » ahead are rewritten, AHEAD_BUDGET 61 (#99)"
  ```

Done when:
- Check of `examples-gen` accepts « Zijt gij hier al drie jaar? » for `tijd:w3`, which failed before step 3. It
  still refuses « vrij », which no unit and no pattern teaches (#99's acceptance).
- `node test/tools/fanout.js .` prints `KIT CONFORME`, with 4 more checks than before the task (446 on the
  branch; 423 at `effe93a`).
- `node test/tools/sources.js .` prints `33 contrôles, SOURCES CONFORMES`.
- `node test/content.js .` prints `séquence 61 / 557` and `CONTENU CONFORME`.
- `sh build.sh` ran, and `index.html` and `artifact.html` are committed.
- `sh test/run-all.sh` passes.
- `git diff HEAD~1 --stat -- src/ tools/content/tatoeba.js` lists `src/content/examples.js` only.

### Task 7: one microphone panel for the three screens that make the learner speak
Class: mechanical
Ticket: #96
Promises: `NL.ex.micPanel(sp, target, opts)` returns the microphone panel of the speak exercise, of a
conversation's speaking turn and of the nazeggen; `opts` carries what differs from one screen to another
(`icon`, `startAttrs`, `stopAttrs`, `after`, `graded`), and what a caller omits is what the speak exercise
does. `NL.ex` no longer exports `recordPanel` or `selfRate`, whose only outside callers were the copies this
task removes. The markup of every panel state on the three screens is what it was, byte for byte.
Why: #96. The panel is written three times: the speak exercise's view (`src/ex/index.js:340–365`),
`micPanel` in `src/ui/scenario.js:216–242` and `shadowPanel` in `src/ui/listen.js:113–132`. Each copy writes
the listening, done and idle states by hand, and a change to one (the refusal message `listen.js` shows,
« Un refus s'affiche ») has to be made three times or the screens drift apart. The copies differ in four
things only: the microphone's size (34 in the exercise, 32 elsewhere); the start and stop buttons'
attributes (`data-mic` with an `aria-label` in the exercise and the turn, `data-act="mic"` and
`data-act="micstop"` in the nazeggen); what follows the score (the exercise: retry until the third refusal,
then rate yourself; the turn: retry until the third try, beside a button that always accepts the turn; the
nazeggen: « replay » only); and whether the screen grades (the nazeggen shows no « heard » line, offers no
self-rating after an error, and shows a plain notice where the others show `recordPanel`). After this task
the panel is written once, in `src/ex/index.js` beside `recordPanel`, and each caller passes those four
things. A refactor: no behaviour changes, so no test can fail on the old code (CLAUDE.md). Its check is the
suite staying green, and a snapshot of 178 panel states taken before step 2 and after step 5, which must be
identical.

Files:
- Modify: `src/ex/index.js` (the speak exercise's `view`, lines 340–365 at `effe93a` and `a64a8fe`; a new `micPanel`
  before the comment at line 389; the `return` at line 697)
- Modify: `src/ui/scenario.js` (line 110; lines 216–242 at `effe93a` and `a64a8fe`)
- Modify: `src/ui/listen.js` (line 94; lines 113–132 at `effe93a` and `a64a8fe`)
- Build: `index.html`, `artifact.html`
- Test: none changes. `test/screens.js` and `test/lang.js` pass unchanged.

Notes:
- **The name.** #96 says the callers call `NL.ex.recordPanel`. `recordPanel` is the record-yourself panel
  shown when no recogniser can listen (`src/ex/index.js:389` onward): it stays as it is, and the shared panel
  is a new `NL.ex.micPanel`, which calls it in that case. The comment above `micPanel` says what a caller
  passes.
- **Kept as it was, not fixed.** The nazeggen's microphone buttons carry no `aria-label`, and its error
  states offer no self-rating (it grades nothing). The shared panel keeps both: `SHADOW.startAttrs` and
  `stopAttrs` hold no label. Giving them one is a change of behaviour: task 10 does it, with its own test.
- **`micError`** (`src/ex/index.js`, unchanged) already says what `scenario.js`'s `errText` and
  `shadowPanel`'s inline chain said, word for word; both copies go.
- **Order of definitions.** `retryThenRate`, `TURN` and `SHADOW` are `const`s written below the functions
  that read them. Each is read only when a screen renders, after its file has run, as `selfRate` already is.
- **The snapshot.** Step 1's script renders every state of the panel: the exercise's `view` for 19 states
  of `L.speech` × 4 devices (a recogniser; a microphone only; neither; offline) × 2 phases, and the turn and
  the nazeggen driven by taps (idle, listening with a partial transcript, stopped, three refusals, nothing
  heard, the target said, the microphone denied, and the three devices without a recogniser). It writes
  nothing to the repository and is not committed.
- **The proof.** These steps ran on a copy of `effe93a`. Step 1 and step 6 printed `178 states, 178 with a
  mic panel, 349002 bytes`, and `cmp` printed nothing. To check that the snapshot sees each screen, the icon
  size passed by each caller was changed by one (34 → 33 in `micPanel`'s default, 32 → 33 in `TURN` and in
  `SHADOW`): 28 exercise states, 4 turn states and 4 nazeggen states then differed. Step 5 printed
  `built (local only) index.html (677227 bytes), artifact.html (676613 bytes)`; step 7 printed
  `677 checks, SCREENS OK` (3 s) and `23129 contrôles, LANGUE CONFORME` (1 min 44 s), the counts of
  `effe93a`. `test/smoke.js` printed `ALL CHECKS PASSED`.
- **The replay.** The plan's assembler ran these steps again in the plan's order, on a copy of `origin/main`
  at `a64a8fe` with tasks 1 to 6 applied as their briefs write them (task 4 its Split only). Step 1 and step
  6 printed `178 states, 178 with a mic panel, 349247 bytes`, and `cmp` printed nothing. The 245 bytes over
  `effe93a` are PR #100's: it changes what seven states show (a stopped microphone now scores what it heard,
  and the nazeggen grades the Flemish line), and the refactor holds over it. Step 5 printed `built (local
  only) index.html (679068 bytes), artifact.html (678454 bytes)`. Step 7 printed `682 checks, SCREENS OK`
  and `23134 contrôles, LANGUE CONFORME`, the counts before step 2, and `test/smoke.js` `ALL CHECKS PASSED`.

- [ ] **Step 1: Snapshot the panels as they are.** Save this script as `<WS>/tmp/panels.js`, outside the
  repository:
  ```js
  /* Task 7's markup proof: every state of the microphone panel on its three screens, printed as
     HTML. Run it on the tree before and after the refactor and compare the two outputs.
       node panels.js <root> > out.txt */
  const path = require('path');
  const root = path.resolve(process.argv[2]);
  const browser = require(path.join(root, 'test', 'lib', 'browser'));
  const T0 = Date.parse('2026-10-05T08:00:00Z');
  const out = [];
  const snap = (name, html) => out.push('### ' + name + '\n' + html);
  const boot = o => browser.open(Object.assign({ root, seed: browser.SEED, now: T0, byId: 'stub',
    voices: [{ name: 'Microsoft Bart - Dutch (Belgium)', lang: 'nl-BE', localService: true }] }, o));

  /* 1. The speak exercise: its view, for each state a session can put in L.speech. */
  const parts = ok => [{ word: 'nog', ok: ok }, { word: 'eens', ok: true, close: true }];
  const STATES = {
    idle: { phase: 'idle', tries: 0, selfRated: null },
    'idle denied': { phase: 'idle', tries: 1, error: 'denied', selfRated: null },
    'idle silence': { phase: 'idle', tries: 1, error: 'silence', selfRated: null },
    'idle network': { phase: 'idle', tries: 1, error: 'network', selfRated: null },
    'idle other': { phase: 'idle', tries: 1, error: 'aborted', selfRated: null },
    'idle error rated': { phase: 'idle', tries: 1, error: 'network', selfRated: true },
    listening: { phase: 'listening', tries: 0, partial: '', selfRated: null },
    'listening partial': { phase: 'listening', tries: 0, partial: 'nog <i>is</i>', selfRated: null },
    'done ok': { phase: 'done', tries: 1, ok: true, pct: 100, parts: parts(true), heard: 'nog eens', selfRated: null },
    'done bad 1': { phase: 'done', tries: 1, ok: false, pct: 50, parts: parts(false), heard: 'iets <b>anders</b>', selfRated: null },
    'done bad 1 unheard': { phase: 'done', tries: 1, ok: false, pct: 50, parts: parts(false), heard: '', selfRated: null },
    'done bad 3': { phase: 'done', tries: 3, ok: false, pct: 50, parts: parts(false), heard: 'iets', selfRated: null },
    'done bad 3 rated': { phase: 'done', tries: 3, ok: false, pct: 50, parts: parts(false), heard: 'iets', selfRated: false },
    'rec idle': { phase: 'idle', tries: 0, selfRated: null, recState: 'idle' },
    'rec rec': { phase: 'idle', tries: 0, selfRated: null, recState: 'rec' },
    'rec done': { phase: 'idle', tries: 0, selfRated: null, recState: 'done' },
    'rec done rated': { phase: 'idle', tries: 0, selfRated: true, recState: 'done' },
    'rec denied': { phase: 'idle', tries: 0, selfRated: null, recErr: 'denied' },
    'rec framed rated': { phase: 'idle', tries: 0, selfRated: false, recErr: 'framed' }
  };
  const WHERE = [['hears', { recogniser: true, media: true }], ['no recogniser', { media: true }], ['no microphone', {}],
    ['offline', { recogniser: true, media: true, offline: true }]];

  /* 2. The conversation's speaking turn and 3. the nazeggen, driven by taps as a learner drives them. */
  const html = B => B.app.innerHTML;
  const toTurn = B => {
    B.NL.ui.go('scenario', 's-bakker');
    for (let g = 0; html(B).indexOf('mic-panel') < 0 && g < 20; g++) {
      B.NL.screens.scenario.click({ dataset: {} }, { step: 'next' }); B.NL.screens.scenario.click({ dataset: {} }, { choice: '0' });
    }
  };
  const target = B => (/<p class="say-target"[^>]*>([^<]*)<\/p>/.exec(html(B)) || [])[1];
  const toShadow = B => { B.NL.ui.go('luisteren'); B.NL.screens.luisteren.click({ dataset: {} }, { act: 'nazeggen' }); };
  const clipNl = B => (/<p class="rev-nl"[^>]*>([^<]*)<\/p>/.exec(html(B)) || [])[1];
  const SCREENS = [
    ['scenario', toTurn, { mic: 'start' }, { mic: 'stop' }, target],
    ['nazeggen', toShadow, { act: 'mic' }, { act: 'micstop' }, clipNl]
  ];
  const fresh = async (o, open) => {
    const B = boot(o);
    if (o.offline) B.ctx.navigator.onLine = false;
    await B.NL.state.open();
    open(B);
    return B;
  };
  const unescape = s => String(s || '').replace(/&#39;/g, '\'').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

  (async () => {
    for (const [where, o] of WHERE) {
      const B = await fresh(o, () => {});
      const NL = B.NL, R = NL.ex.get('speak');
      const t = R.build(NL.content.allItems().find(x => x.nl === 'nog eens'));
      Object.keys(STATES).forEach(k => ['ask', 'shown'].forEach(phase =>
        snap('speak / ' + where + ' / ' + k + ' / ' + phase, R.view(t, { speech: Object.assign({}, STATES[k]) }, phase))));
    }
    for (const [name, open, start, stop, said] of SCREENS) {
      let B = await fresh({ recogniser: true, media: true }, open);
      snap(name + ' / idle', html(B));
      B.ctx.__partialNext = 'nog <i>is</i>'; B.tap(start); snap(name + ' / listening partial', html(B));
      B.tap(stop); snap(name + ' / stopped', html(B));
      for (let k = 1; k <= 3; k++) { B.ctx.__saidNext = 'iets <b>heel</b> anders'; B.tap(start); snap(name + ' / done bad ' + k, html(B)); }
      B = await fresh({ recogniser: true, media: true }, open);
      B.ctx.__saidNext = ''; B.tap(start); snap(name + ' / done unheard', html(B));
      B = await fresh({ recogniser: true, media: true }, open);
      B.ctx.__saidNext = unescape(said(B)); B.tap(start); snap(name + ' / done said', html(B));
      B = await fresh({ recogniser: true, media: true }, open);
      B.ctx.__denyNext = true; B.tap(start); snap(name + ' / denied', html(B));
      B = await fresh({ media: true }, open); snap(name + ' / no recogniser', html(B));
      B.tap({ rec: 'start' }); await new Promise(r => setImmediate(r)); snap(name + ' / no recogniser, record refused', html(B));
      B = await fresh({}, open); snap(name + ' / no microphone', html(B));
      B = await fresh({ recogniser: true, media: true, offline: true }, open); snap(name + ' / offline', html(B));
    }
    process.stdout.write(out.join('\n\n') + '\n');
    const panels = out.filter(s => s.indexOf('mic-panel') >= 0).length;
    console.error(out.length + ' states, ' + panels + ' with a mic panel, ' + out.reduce((n, s) => n + s.length, 0) + ' bytes');
  })();
  ```
  Then, from the repository's root, before changing anything:
  ```
  node <WS>/tmp/panels.js . > <WS>/tmp/panels-before.txt
  ```
  Expected on the terminal: `178 states, 178 with a mic panel, 349247 bytes` (349002 at `effe93a`, before PR
  #100). The byte count is the one at `a64a8fe`; only the equality of the two snapshots matters, so an
  earlier task that changes a text these screens show may change it.

- [ ] **Step 2: Write the panel once, in `src/ex/index.js`.**
  1. In the speak exercise's `view`, keep `      const sp = L.speech;` and replace the 26 lines after it
     ```js
           const blocked = NL.speech.listenBlocked();
           let panel;

           if (blocked) {
             panel = recordPanel(sp, t.target, blocked);
           } else if (sp.phase === 'listening') {
             panel = '<div class="mic-panel live"><button class="mic big listening" data-mic="stop" aria-label="' + NL.t.stop + '">' + ICON.mic(34) + '</button>' +
               '<p class="mic-why">' + NL.t.micListening + '</p>' +
               NL.ui.ifText(sp.partial, 'p', 'heard', 'nl') + '</div>';
           } else if (sp.phase === 'done') {
             panel = '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
               '<div class="score-row"><span class="score">' + wordScore(sp.parts) + '</span>' +
               '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
               '<p class="word-diff"' + NL.gloss.attr('nl') + '>' + sp.parts.map(p =>
                 '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
               (sp.heard ? '<p class="heard">' + NL.t.micHeard + ' &ldquo;<span' + NL.gloss.attr('nl') + '>' + esc(sp.heard) + '</span>&rdquo;</p>' : '') +
               (!sp.ok && sp.tries < 3 ? '<div class="mic-actions"><button class="btn btn-blue" data-mic="start">' + NL.t.micRetry(3 - sp.tries) + '</button></div>' : '') +
               /* Trois refus : le micro n'entend peut-être simplement pas ce mot-là.
                  Sans cette issue, l'élément serait redemandé chaque jour sans jamais monter. */
               (!sp.ok && sp.tries >= 3 ? selfRate(sp) : '') +
               '</div>';
           } else {
             panel = '<div class="mic-panel"><button class="mic big" data-mic="start" aria-label="' + NL.t.speak + '">' + ICON.mic(34) + '</button>' +
               '<p class="mic-why">' + (sp.error ? esc(micError(sp.error)) : NL.t.micTap) + '</p>' +
               (sp.error ? selfRate(sp) : '') + '</div>';
           }
     ```
     with
     ```js
           const panel = micPanel(sp, t.target);
     ```
     The blank line and the comment « Je ne peux pas parler » that follow stay.
  2. Replace the first line of the comment above `recordPanel`
     ```js
       /* No recogniser available. Record yourself instead and compare against the
     ```
     with
     ```js
       /* Le panneau du micro, le même sur les trois écrans qui font parler : cet exercice, le tour de
          parole d'une conversation (scenario.js) et le nazeggen (listen.js). Il écoute, puis montre le
          score, le mot à mot et ce que le micro a entendu ; quand le micro ne peut pas écouter, c'est
          recordPanel. Un appelant passe dans `opts` ce qui diffère d'un écran à l'autre ; ce qu'il omet
          est ce que fait cet exercice :
            icon                   la taille du micro (34) ;
            startAttrs, stopAttrs  les attributs des boutons qui lancent et arrêtent l'écoute
                                   (data-mic="start" et data-mic="stop", avec leur aria-label) ;
            after(sp)              ce qui suit le score : l'action qui accepte et la règle qui fait
                                   réessayer (ici, réessayer jusqu'au troisième refus, puis s'évaluer) ;
            graded                 false pour un écran qui ne note rien, le nazeggen : ni ligne
                                   « entendu », ni auto-évaluation, et un simple avis à la place de
                                   recordPanel. */
       function micPanel(sp, target, opts) {
         const o = Object.assign({
           icon: 34, graded: true, after: retryThenRate,
           startAttrs: ' data-mic="start" aria-label="' + NL.t.speak + '"',
           stopAttrs: ' data-mic="stop" aria-label="' + NL.t.stop + '"'
         }, opts);
         const blocked = NL.speech.listenBlocked();
         if (blocked) {
           return o.graded ? recordPanel(sp, target, blocked) : '<div class="mic-panel offline"><p class="mic-why">' + NL.t.micNoBrowser + '</p></div>';
         }
         if (sp.phase === 'listening') {
           return '<div class="mic-panel live"><button class="mic big listening"' + o.stopAttrs + '>' + ICON.mic(o.icon) + '</button>' +
             '<p class="mic-why">' + NL.t.micListening + '</p>' +
             NL.ui.ifText(sp.partial, 'p', 'heard', 'nl') + '</div>';
         }
         if (sp.phase === 'done') {
           return '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
             '<div class="score-row"><span class="score">' + wordScore(sp.parts) + '</span>' +
             '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
             '<p class="word-diff"' + NL.gloss.attr('nl') + '>' + sp.parts.map(p =>
               '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
             (o.graded && sp.heard ? '<p class="heard">' + NL.t.micHeard + ' &ldquo;<span' + NL.gloss.attr('nl') + '>' + esc(sp.heard) + '</span>&rdquo;</p>' : '') +
             o.after(sp) + '</div>';
         }
         /* Un refus s'affiche : sans ça, toucher le micro ne faisait rien, en silence. */
         return '<div class="mic-panel"><button class="mic big"' + o.startAttrs + '>' + ICON.mic(o.icon) + '</button>' +
           '<p class="mic-why">' + (sp.error ? esc(micError(sp.error)) : NL.t.micTap) + '</p>' +
           (o.graded && sp.error ? selfRate(sp) : '') + '</div>';
       }

       /* Ce qui suit le score dans l'exercice : réessayer, puis s'évaluer. Trois refus : le micro
          n'entend peut-être simplement pas ce mot-là. Sans cette issue, l'élément serait redemandé
          chaque jour sans jamais monter. */
       const retryThenRate = sp =>
         (!sp.ok && sp.tries < 3 ? '<div class="mic-actions"><button class="btn btn-blue" data-mic="start">' + NL.t.micRetry(3 - sp.tries) + '</button></div>' : '') +
         (!sp.ok && sp.tries >= 3 ? selfRate(sp) : '');

       /* No recogniser available. Record yourself instead and compare against the
     ```
  3. In the module's last `return`, replace
     ```js
     flemish, recordPanel, selfRate, wordScore,
     ```
     with
     ```js
     flemish, micPanel, wordScore,
     ```

- [ ] **Step 3: The conversation's turn passes what differs.** In `src/ui/scenario.js`:
  1. Replace
     ```js
               micPanel(P.speech, c.nl) +
     ```
     with
     ```js
               NL.ex.micPanel(P.speech, c.nl, TURN) +
     ```
  2. Replace the copy, from its comment to `errText`, just above the file's last line `})();`:
     ```js
       /* Shared look with the speak exercise, so the microphone always behaves the same. */
       function micPanel(sp, target) {
         const blocked = NL.speech.listenBlocked();
         if (blocked) return NL.ex.recordPanel(sp, target, blocked);
         if (sp.phase === 'listening') {
           return '<div class="mic-panel live"><button class="mic big listening" data-mic="stop" aria-label="' + NL.t.stop + '">' + ICON.mic(32) + '</button>' +
             '<p class="mic-why">' + NL.t.micListening + '</p>' + NL.ui.ifText(sp.partial, 'p', 'heard', 'nl') + '</div>';
         }
         if (sp.phase === 'done') {
           return '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
             '<div class="score-row"><span class="score">' + NL.ex.wordScore(sp.parts) + '</span>' +
             '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
             '<p class="word-diff"' + NL.gloss.attr('nl') + '>' + sp.parts.map(p =>
               '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
             (sp.heard ? '<p class="heard">' + NL.t.micHeard + ' &ldquo;<span' + NL.gloss.attr('nl') + '>' + esc(sp.heard) + '</span>&rdquo;</p>' : '') +
             '<div class="mic-actions">' +
             (!sp.ok && sp.tries < 3 ? '<button class="btn btn-blue" data-mic="start">' + NL.t.replay + '</button>' : '') +
             '<button class="btn ' + (sp.ok ? 'btn-good' : 'btn-ghost') + '" data-act="accept">' + (sp.ok ? NL.t.next : NL.t.micAnyway) + '</button>' +
             '</div></div>';
         }
         return '<div class="mic-panel"><button class="mic big" data-mic="start" aria-label="' + NL.t.speak + '">' + ICON.mic(32) + '</button>' +
           '<p class="mic-why">' + (sp.error ? esc(errText(sp.error)) : NL.t.micTap) + '</p>' +
           (sp.error ? NL.ex.selfRate(sp) : '') + '</div>';
       }
       const errText = k => k === 'denied' ? NL.t.micDenied
         : k === 'silence' ? NL.t.micSilence
           : k === 'network' ? NL.t.micNetwork : NL.t.micFail;
     ```
     with
     ```js
       /* The speak exercise's microphone panel (NL.ex.micPanel), so the microphone always behaves the
          same. A turn differs by what follows the score: a retry until the third try, and a button that
          always accepts the turn and moves on. */
       const TURN = {
         icon: 32,
         after: sp => '<div class="mic-actions">' +
           (!sp.ok && sp.tries < 3 ? '<button class="btn btn-blue" data-mic="start">' + NL.t.replay + '</button>' : '') +
           '<button class="btn ' + (sp.ok ? 'btn-good' : 'btn-ghost') + '" data-act="accept">' + (sp.ok ? NL.t.next : NL.t.micAnyway) + '</button>' +
           '</div>'
       };
     ```

- [ ] **Step 4: The nazeggen passes what differs.** In `src/ui/listen.js`:
  1. Replace
     ```js
             '</div>' + shadowPanel(sp);
     ```
     with
     ```js
             '</div>' + NL.ex.micPanel(sp, c.nl, SHADOW);
     ```
  2. Replace the whole of `shadowPanel`, just above `  function menu() {`:
     ```js
       function shadowPanel(sp) {
         if (NL.speech.listenBlocked()) {
           return '<div class="mic-panel offline"><p class="mic-why">' + NL.t.micNoBrowser + '</p></div>';
         }
         if (sp.phase === 'listening') {
           return '<div class="mic-panel live"><button class="mic big listening" data-act="micstop">' + ICON.mic(32) + '</button>' +
             '<p class="mic-why">' + NL.t.micListening + '</p>' + NL.ui.ifText(sp.partial, 'p', 'heard', 'nl') + '</div>';
         }
         if (sp.phase === 'done') {
           return '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
             '<div class="score-row"><span class="score">' + NL.ex.wordScore(sp.parts) + '</span>' +
             '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
             '<p class="word-diff"' + NL.gloss.attr('nl') + '>' + sp.parts.map(p => '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
             '<div class="mic-actions"><button class="btn btn-blue" data-act="mic">' + NL.t.replay + '</button></div></div>';
         }
         /* Un refus s'affiche : sans ça, toucher le micro ne faisait rien, en silence. */
         return '<div class="mic-panel"><button class="mic big" data-act="mic">' + ICON.mic(32) + '</button>' +
           '<p class="mic-why">' + (sp.error ? esc(sp.error === 'denied' ? NL.t.micDenied : sp.error === 'silence' ? NL.t.micSilence
             : sp.error === 'network' ? NL.t.micNetwork : NL.t.micFail) : NL.t.micTap) + '</p></div>';
       }
     ```
     with
     ```js
       /* Le panneau du micro de l'exercice « dire » (NL.ex.micPanel). Le nazeggen ne note rien : son
          micro passe par data-act, et après le score il n'offre que de recommencer. */
       const SHADOW = {
         icon: 32, graded: false, startAttrs: ' data-act="mic"', stopAttrs: ' data-act="micstop"',
         after: () => '<div class="mic-actions"><button class="btn btn-blue" data-act="mic">' + NL.t.replay + '</button></div>'
       };
     ```
  3. Check that no copy and no caller of the removed exports is left:
     ```
     grep -rnw "shadowPanel\|errText\|NL.ex.recordPanel\|NL.ex.selfRate" src test
     grep -n "NL.ex.micPanel(" src/ui/scenario.js src/ui/listen.js
     ```
     Expected: the first prints nothing (`-w` matches whole words, so `test/smoke.js`'s `errTextActs` is not
     found); the second prints one line in each file, the call.

- [ ] **Step 5: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (…) index.html (<n> bytes), artifact.html (<m> bytes)`. On `a64a8fe` after tasks 1 to 6,
  with no Supabase variables, it printed `built (local only) index.html (679068 bytes), artifact.html (678454
  bytes)` (677227 and 676613 on `effe93a` with this task alone).

- [ ] **Step 6: Snapshot the panels again and compare.**
  ```
  node <WS>/tmp/panels.js . > <WS>/tmp/panels-after.txt
  cmp <WS>/tmp/panels-before.txt <WS>/tmp/panels-after.txt
  ```
  Expected: the first prints the same line as step 1 (`178 states, 178 with a mic panel, 349247 bytes` at
  `a64a8fe`); `cmp` prints nothing and exits 0. If `cmp` reports a difference, the panel's markup changed:
  find the first differing state (its `### ` line in `panels-after.txt`) and fix the step that wrote it.

- [ ] **Step 7: Run the two suites that read the panel.**
  ```
  node test/screens.js .
  node test/lang.js .
  ```
  Expected: `682 checks, SCREENS OK`, and `23134 contrôles, LANGUE CONFORME` (the counts at `a64a8fe` with
  tasks 1 to 6; 677 and 23129 at `effe93a`; the task adds and removes no check, so each is what the same
  suite printed before step 2).

- [ ] **Step 8: Commit.**
  ```
  git add src/ex/index.js src/ui/scenario.js src/ui/listen.js index.html artifact.html
  git commit -m "refactor(ui): the speak exercise, a conversation's turn and the nazeggen draw one microphone panel, NL.ex.micPanel, each passing what differs; the two copies go (#96)"
  ```

Done when:
- `cmp` of the two snapshots printed nothing: 178 panel states, the same markup before and after.
- `grep -rnw "shadowPanel\|errText\|NL.ex.recordPanel\|NL.ex.selfRate" src test` prints nothing, and
  `src/ui/scenario.js` and `src/ui/listen.js` each call `NL.ex.micPanel` once.
- `node test/screens.js .` prints `SCREENS OK` and `node test/lang.js .` prints `LANGUE CONFORME`, with the
  check counts they printed before step 2.
- `sh build.sh` ran, and `index.html` and `artifact.html` are committed.
- `sh test/run-all.sh` passes.

### Task 8: the sounds table declares its Dutch, and leaves its French comparisons bare
Class: mechanical
Ticket: #97
Promises: every bold passage of the sounds table's text (`NL.content.sounds[].say`) is either Dutch,
declared `nl-BE` on the sounds screen (`klanken`), or a letter or word the table compares the sound to,
left bare and named in `SOUND_OK` in `test/lang.js` with its reason. « Le u de tu » is the French « u »:
bare, and check 6 does not take it for undeclared Dutch. One comment above `NL.content.sounds` says this
reading. `test/lang.js` fails on a bold Dutch spelling left bare, on a named comparison declared `nl-BE`,
and on an exception that no longer names a bold comparison. Nothing the learner sees changes: no style reads
`.nl` or `:lang(nl)`, so only the declared language moves.
Why: #97 and the maintainer's decision D5 (decisions of 2026-10-25): « Dutch spellings of the sound taught
are `class="nl"`; French comparisons stay bare. « Le u de tu » is the French « u »: bare, with a named
exception in `test/lang.js` check 6d. » At `effe93a` the table says it the other way round in two places:
`<b class="nl">u</b>` in « Le u de tu » declares the French letter Dutch, and `<b>h</b>`, `<b>n</b>` and the
`g` of `<b>g doux</b>` are Dutch spellings left bare. The table's text holds 20 bold passages
(`src/content/reference.js:9–20`), read one by one for this task:
- **Dutch, declared `nl-BE` (6):** `h` (the h that Dutch pronounces), `n` (the final n that falls),
  the `g` of « g doux » (the soft g of Flanders), and `va`, `wer`, `bak`, the stressed syllables of
  « vader », « werken », « bakker », already declared through the `class="ex"` around them.
- **Comparisons, bare (14, and « doux »):** `eu` twice (« le eu de peu », « le eu de peur »), `ou` twice
  (« le ou français », « entre le v et le ou »), `oe` (« un oe français », the reading oe must not have),
  `u` (« le u de tu »), `r` (« ton r français »), `i` twice (where ui and ij / ei glide to), `è` (« le è de
  père »), `v` (« le v »), `w` (« le w anglais », the one English comparison), `dernière` and `première`
  (the syllable French and Dutch stress, said in French); and `doux`, the French half of « g doux ».
The ticket's own list differs: it calls `oe`, `w` and the whole of « g doux » Dutch, lists a bold `ij` the
text does not have (`ij / ei` is the row's head, outside the text), and leaves `i` out. In each of the three,
the bold names what the learner already knows (the French oe, the English w, the French word « doux »), so
by D5 it stays bare; only the `g` is Dutch.

Files:
- Modify: `test/lib/langs.js` (lines 6, 18–19 and 28 at `effe93a`: each run carries its tags)
- Modify: `test/lang.js` (after line 517 and line 523 in `langAttrFind`; after `SHARED_OK`, lines 933–934; a
  new `q8` and the chain at line 1147)
- Modify: `src/content/reference.js` (the comment at lines 6–7; lines 11, 12, 15 and 19)
- Modify: `TESTING.md` (line 16, the `lang.js` row)
- Build: `index.html`, `artifact.html`

Notes:
- **Check 6 and 6d.** D5 puts the exception in check 6d, and it lives there: `SOUND_OK` and `q8` (6d.8)
  check the table's bold. But check 6 (`langAttrFind`) is what flags a bare course-Dutch word, and « u » is
  one (« u », the polite you). So check 6 skips a bold run on the sounds screen whose text `SOUND_OK` names
  (`compared`), and nothing else: a bare « u » anywhere else is still found.
- **The red check of each site step 3 changes:** « u » (two FAIL lines: declared nl-BE, and its exception
  unused), « g doux » (« g doux » bare, and the exception `doux` unused), « h » and « n » (one FAIL line each).
  The comment is not behaviour.
- **What the test reads.** `q8` reads the sounds screen as rendered, the text of each row only (the `<p>`
  after the row's head): the head is the sound's name, which the screen declares `nl-BE` itself, and the
  app's header has a bold of its own, « Vlaams ».
- **Left as they are, not fixed.** Dutch letters the text names without bold (« Écris le n, ne le dis pas »,
  « s suivi du g doux ») stay unchecked: D5 speaks of the bold. And the screen declares every row's head
  `nl-BE` (`src/ui/library.js:210`), though three heads are French: « accent tonique », « suppression du t »
  and the « final » of « -en final ». Task 11 fixes that, with its own test.
- **Counts after this task.** `node test/lang.js .` prints 23148 checks after it on `a64a8fe`, not 23134
  (23143 and 23129 at `effe93a`); a later brief that quotes 23134 means the count before this task.
- **The proof.** These steps ran on a copy of `effe93a` with task 7 applied. Step 2 printed the six FAIL
  lines below and `23147 contrôles, 6 ÉCHEC(S)`, exit 1 (1 min 45 s); step 4 printed `23143 contrôles,
  LANGUE CONFORME` (1 min 42 s). Step 6 printed `built (local only) index.html (677641 bytes), artifact.html
  (677027 bytes)`. Then `test/screens.js` printed `677 checks, SCREENS OK` (2 s), `test/smoke.js` `ALL CHECKS
  PASSED` (34 s), `test/typed.js` `853 contrôles, 0 en échec` (13 s), and `node test/journey.js . nl-BE OPR`
  `818 checks, NO PROBLEMS` (20 s).
- **The replay.** The plan's assembler ran these steps again in the plan's order, on a copy of `origin/main`
  at `a64a8fe` with tasks 1 to 7 applied as their briefs write them (task 4 its Split only). Step 2 printed
  the same six FAIL lines and `23152 contrôles, 6 ÉCHEC(S)`; step 4 printed `23148 contrôles, LANGUE
  CONFORME`. Step 6 printed `built (local only) index.html (679482 bytes), artifact.html (678868 bytes)`.
  `test/screens.js` printed `682 checks, SCREENS OK`, `test/smoke.js` `ALL CHECKS PASSED`, `test/typed.js`
  `853 contrôles, 0 en échec`, and `node test/journey.js . nl-BE OPR` `818 checks, NO PROBLEMS`.

- [ ] **Step 1: Write the test.**
  1. In `test/lib/langs.js`, each run names the tags around it. Replace
     ```js
          runs(html, lang)    ses passages de texte, chacun avec la langue qu'il déclare
     ```
     with
     ```js
          runs(html, lang)    ses passages de texte, chacun avec la langue qu'il déclare et ses balises
     ```
     replace
     ```js
        lang le plus proche qui l'enveloppe, sinon celle de la racine. */
     ```
     with
     ```js
        lang le plus proche qui l'enveloppe, sinon celle de la racine. tags nomme les balises qui
        l'enveloppent, de la plus lointaine à la plus proche : un passage en gras y a b. */
     ```
     and replace
     ```js
         if (t) out.push({ text: t, lang: cur() });
     ```
     with
     ```js
         if (t) out.push({ text: t, lang: cur(), tags: stack.map(s => s.name) });
     ```
     Only `test/lang.js` calls `runs`.
  2. In `test/lang.js`, in `langAttrFind`, after
     ```js
       ok(dutch.size > 100, '6 : trop peu de mots néerlandais à chercher (' + dutch.size + ')');
     ```
     insert
     ```js
       /* La table des sons compare un son à une lettre française, en gras et nue (6d.8) : « le u de tu »
          est le u français. Ce que SOUND_OK nomme, en gras sur l'écran des sons, n'est pas cherché. */
       const compared = (n, r) => n === 'klanken' && r.tags.indexOf('b') >= 0 && SOUND_OK[r.text];
     ```
     and, a few lines below, in
     ```js
           if (dutch.has(t) && !/^nl/i.test(r.lang) && !(own && gloss[own].has(t))) { const key = l + ' « ' + r.text + ' » (' + (r.lang || 'sans lang') + ')'; if (!bad.has(key)) bad.set(key, n); }
     ```
     replace `!(own && gloss[own].has(t))) {` with `!(own && gloss[own].has(t)) && !compared(n, r)) {`.
  3. After the end of `SHARED_OK`
     ```js
       o: 'la lettre o, nommée de même en français et en anglais, dans la note de « goedkoop »'
     };
     ```
     insert
     ```js
     /* Ce que la table des sons met en gras sans le déclarer néerlandais : la lettre ou le mot auquel elle
        compare un son, français (une fois, le w anglais), avec la raison (D5). Le reste de son gras est
        du néerlandais déclaré nl-BE : l'orthographe du son enseigné, ou la syllabe accentuée d'un
        exemple (6d.8). */
     const SOUND_OK = {
       eu: 'le eu français de « peu » et de « peur », d’où partent eu et ui',
       ou: 'le ou français : le son de oe, et un côté du w',
       oe: '« un oe français », la lecture que oe ne doit pas avoir',
       u: 'le u de « tu » : la lettre française, que le néerlandais prononce pareil',
       r: 'le r français, plus près du g doux que le raclement du nord',
       i: 'le i français, vers lequel glissent ui et ij / ei',
       'è': 'le è de « père », d’où part ij / ei',
       v: 'le v français, l’autre côté du w',
       w: '« le w anglais », la lecture que w ne doit pas avoir',
       'dernière': 'la syllabe que le français accentue',
       'première': 'la syllabe que le néerlandais accentue, dite en français',
       doux: '« g doux », le nom français du son, dont le g est néerlandais'
     };
     ```
  4. Before the last line of 6d,
     ```js
       return [q1, q2, q3, q4, q5, q6, q7].reduce((p, c) => p.then(c), Promise.resolve());
     ```
     insert
     ```js
       /* 6d.8. Le gras de la table des sons, lu sur son écran (D5) : du néerlandais, que l'écran déclare
          nl-BE (l'orthographe du son enseigné, qui porte class="nl", ou la syllabe accentuée d'un
          exemple), ou la lettre ou le mot auquel la table compare le son, nu, que SOUND_OK nomme avec sa
          raison. Un gras nu hors de SOUND_OK est du néerlandais non déclaré ; une comparaison déclarée
          nl-BE, du français pris pour du néerlandais. */
       const q8 = () => {
         const B = boot();
         return B.NL.state.open().then(() => {
           B.NL.ui.go('klanken');
           /* Le texte de chaque son seul : ni la tête de sa ligne, le nom du son, que l'écran déclare
              nl-BE lui-même, ni l'en-tête de l'app, qui a son gras à lui, « Vlaams ». */
           const says = (B.app.innerHTML.match(/<div class="snd-row[\s\S]*?<\/p><\/div>/g) || []).map(row => row.replace(/^[\s\S]*?<\/div>|<\/div>$/g, ''));
           ok(says.length === B.NL.content.sounds.length, '6d : l’écran des sons ne montre pas une ligne par son, le contrôle lit mal sa table');
           const bold = runs(says.join(''), pageLang(B)).filter(r => r.tags.indexOf('b') >= 0);
           const dutch = bold.filter(r => r.lang === 'nl-BE'), bare = bold.filter(r => r.lang !== 'nl-BE');
           bare.filter(r => !SOUND_OK[r.text]).forEach(r => ok(false, '6d : « ' + r.text + ' » en gras dans la table des sons, hors de nl-BE — une orthographe néerlandaise porte class="nl", une comparaison va dans SOUND_OK avec sa raison'));
           dutch.filter(r => SOUND_OK[r.text]).forEach(r => ok(false, '6d : « ' + r.text + ' » déclaré nl-BE dans la table des sons, quand SOUND_OK en fait une comparaison, nue'));
           Object.keys(SOUND_OK).forEach(w => ok(bare.some(r => r.text === w), '6d : « ' + w + ' » n’est plus une comparaison en gras de la table des sons : son exception est de trop'));
           ok(dutch.length > 0, '6d : aucun gras déclaré nl-BE dans le texte des sons, le contrôle est creux');
           console.log('  sons en gras    ' + dutch.length + ' déclarés nl-BE, ' + bare.length + ' comparaisons, ' + Object.keys(SOUND_OK).length + ' exceptions');
         });
       };

     ```
     and in that last line replace `[q1, q2, q3, q4, q5, q6, q7]` with `[q1, q2, q3, q4, q5, q6, q7, q8]`.

- [ ] **Step 2: Watch it fail.**
  ```
  node test/lang.js .
  ```
  Expected, exit 1:
  ```
    FAIL: 6d : « g doux » en gras dans la table des sons, hors de nl-BE — une orthographe néerlandaise porte class="nl", une comparaison va dans SOUND_OK avec sa raison
    FAIL: 6d : « h » en gras dans la table des sons, hors de nl-BE — une orthographe néerlandaise porte class="nl", une comparaison va dans SOUND_OK avec sa raison
    FAIL: 6d : « n » en gras dans la table des sons, hors de nl-BE — une orthographe néerlandaise porte class="nl", une comparaison va dans SOUND_OK avec sa raison
    FAIL: 6d : « u » déclaré nl-BE dans la table des sons, quand SOUND_OK en fait une comparaison, nue
    FAIL: 6d : « u » n’est plus une comparaison en gras de la table des sons : son exception est de trop
    FAIL: 6d : « doux » n’est plus une comparaison en gras de la table des sons : son exception est de trop
    sons en gras    4 déclarés nl-BE, 16 comparaisons, 12 exceptions

  23152 contrôles, 6 ÉCHEC(S)
  ```
  No other FAIL line. A FAIL from check 6 means `compared` is missing or misplaced. The count is the one on
  `a64a8fe` after task 7 (23147 at `effe93a`).

- [ ] **Step 3: The table declares its Dutch.** In `src/content/reference.js`:
  1. Replace the comment's last line
     ```js
        néerlandaises existent déjà en français, ce qui est un avantage réel. */
     ```
     with
     ```js
        néerlandaises existent déjà en français, ce qui est un avantage réel.
        Le gras dit deux choses. Le néerlandais, l'orthographe du son enseigné (class="nl") ou la
        syllabe accentuée d'un exemple (dans son class="ex"), est déclaré nl-BE par NL.gloss.prose.
        La lettre ou le mot auquel on compare le son, français (une fois, le w anglais), reste nu :
        le u de tu est la lettre française. SOUND_OK, dans test/lang.js (6d.8), nomme chacun. */
     ```
  2. Four replacements, each found by its text (the apostrophes are typographic, ’):
     - `'Le <b class="nl">u</b> de <i>tu</i>, exactement.` → `'Le <b>u</b> de <i>tu</i>, exactement.`
     - `c’est le <b>g doux</b> : un souffle` → `c’est le <b><span class="nl">g</span> doux</b> : un souffle`
     - `en néerlandais le <b>h</b> se prononce vraiment` → `en néerlandais le <b class="nl">h</b> se prononce vraiment`
     - `'Le <b>n</b> tombe presque toujours` → `'Le <b class="nl">n</b> tombe presque toujours`

- [ ] **Step 4: Watch it pass.**
  ```
  node test/lang.js .
  ```
  Expected, exit 0, ending with:
  ```
    sons en gras    6 déclarés nl-BE, 15 comparaisons, 12 exceptions

  23148 contrôles, LANGUE CONFORME
  ```
  (23143 at `effe93a`).

- [ ] **Step 5: Say it in `TESTING.md`.** In the `lang.js` row (line 16), replace
  ```
  les exceptions de `SHARED_OK` chacune avec sa raison ; elle ne voit pas le néerlandais nu qu'un seul côté écrit, ni celui d'une table écrite dans une seule langue (les sons, les faux amis), ni
  ```
  with
  ```
  les exceptions de `SHARED_OK` chacune avec sa raison, et le gras de la table des sons, lu sur son écran : le néerlandais (l'orthographe du son enseigné, la syllabe accentuée d'un exemple) déclaré `nl-BE`, la lettre ou le mot auquel on compare le son (français, une fois le w anglais) laissé nu et nommé dans `SOUND_OK` avec sa raison (« le u de tu » est le u français, que le contrôle 6 ne prend pas pour du néerlandais) ; elle ne voit pas le néerlandais nu qu'un seul côté écrit, ni celui d'une table écrite dans une seule langue (le texte des sons hors de son gras, les faux amis), ni
  ```

- [ ] **Step 6: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (…) index.html (<n> bytes), artifact.html (<m> bytes)`. On `a64a8fe` after tasks 1 to 8,
  with no Supabase variables, it printed `built (local only) index.html (679482 bytes), artifact.html (678868
  bytes)` (677641 and 677027 on `effe93a` with tasks 7 and 8 alone).

- [ ] **Step 7: The suites that read the screen and the sources.**
  ```
  node test/screens.js .
  node test/smoke.js .
  ```
  Expected: `682 checks, SCREENS OK` (677 at `effe93a`) and `ALL CHECKS PASSED`.

- [ ] **Step 8: Commit.**
  ```
  git add src/content/reference.js test/lang.js test/lib/langs.js TESTING.md index.html artifact.html
  git commit -m "fix(content): the sounds table declares the Dutch it puts in bold (h, n, the g of « g doux ») and leaves its comparisons bare, « le u de tu » the French u among them; test/lang.js names each comparison with its reason (#97)"
  ```

Done when:
- Step 2 printed the six FAIL lines above, and step 4 `sons en gras    6 déclarés nl-BE, 15 comparaisons,
  12 exceptions` and `LANGUE CONFORME`.
- `src/content/reference.js` has no `<b class="nl">u</b>`, and its comment above `NL.content.sounds` says the
  reading of the bold.
- `sh build.sh` ran, and `index.html` and `artifact.html` are committed.
- `sh test/run-all.sh` passes.

### Task 9: a note under phase 3's task 22 on its example's count need
Class: mechanical
Ticket: #94
Promises: none
Why: #94, as the maintainer decided (D6): the phase 3 plan keeps task 22's example row as it was decided on
22 October, and a note under the task says that the example's « dit combien » need stopped at six, and how
the run widened it. A Format example is what drafters copy into the shape of their rows, and the task's own
Reader focus disputes a need that rejects a right answer: the next plan that copies this Format should start
from the need that shipped. What ships is right already, so nothing under `src/` or `test/` changes.

Files:
- Modify: `docs/superpowers/plans/2026-10-22-phase-3-content-to-b1.md` (the end of « Task 22: FAN open »,
  line 8962 at `effe93a`)

Notes:
- **No test.** The change is a note in a plan, and no behaviour moves: there is nothing a test can fail on
  (`CLAUDE.md`). Steps 2 and 4 check the text instead: the note is absent, then present once, and the
  example row is unchanged.
- **The proof.** These steps ran on a copy of `effe93a` with tasks 1 to 3 applied. Step 2 printed `0` and `1`;
  step 4 printed `1` and `1`.

- [ ] **Step 1: Nothing to write.** The check is step 2's command.

- [ ] **Step 2: Run it and see the note absent.**
  ```
  grep -c "Note, 25 October 2026 (#94)" docs/superpowers/plans/2026-10-22-phase-3-content-to-b1.md
  grep -c '"any": \["een", "één", "twee", "drie", "vier", "vijf", "zes"' docs/superpowers/plans/2026-10-22-phase-3-content-to-b1.md
  ```
  Expected: `0`, then `1` (the example row, which stays).

- [ ] **Step 3: Implement.** In `docs/superpowers/plans/2026-10-22-phase-3-content-to-b1.md`, replace
  ```
  - **Do fr and en ask the same thing**, and does each `what` mean the same on both sides?
  - `unsure` rows first.
  ```
  with
  ```
  - **Do fr and en ask the same thing**, and does each `what` mean the same on both sides?
  - `unsure` rows first.

  **Note, 25 October 2026 (#94).** The example row's « dit combien » need stops at six: a learner who asks
  for « zeven pistolets », « tien » or « 12 » is told they did not say how many, and the Reader focus above
  disputes a need that rejects a right answer. Both readers of `units-1-6` disputed it, and the retry widened
  the need to every number: `src/content/open.phrases.js` ships
  `rx: /\d|\b(een|één|half|elf|twaalf|honderd|\S*(twee|drie|vier|vijf|zes|zeven|acht|negen|tien|tig))\b/i`.
  The example stays as it was decided on 22 October; a Format copied from it takes the need that shipped.
  ```

- [ ] **Step 4: Run it and see the note once, the example unchanged.**
  ```
  grep -c "Note, 25 October 2026 (#94)" docs/superpowers/plans/2026-10-22-phase-3-content-to-b1.md
  grep -c '"any": \["een", "één", "twee", "drie", "vier", "vijf", "zes"' docs/superpowers/plans/2026-10-22-phase-3-content-to-b1.md
  ```
  Expected: `1`, then `1`.

- [ ] **Step 5: Commit.**
  ```
  git add docs/superpowers/plans/2026-10-22-phase-3-content-to-b1.md
  git commit -m "docs(plan): a note under phase 3's task 22 says its example's count need stopped at six and how the run widened it (#94)"
  ```
  No build: nothing under `src/` changed.

Done when:
- The note follows task 22's Reader focus, once, and the example row is unchanged.
- `git diff HEAD~1 --stat` lists the plan only.

### Task 10: the nazeggen's microphone has a name
Class: mechanical
Ticket: none
Why: found by the learner pass of the design sitting (25 October 2026) and added to this run on the
maintainer's word. The microphone is an icon alone, and a button with no text is named by its `aria-label`, or a
screen reader says only « button ». The speak exercise's microphone has one, « Parler » while closed and « Stop »
while open (`NL.t.speak`, `NL.t.stop`), and the conversation's turn takes the same buttons. The nazeggen passes
its own (`data-act="mic"` and `data-act="micstop"`, task 7's `SHADOW`), with no name. After this task its two
buttons carry the same names, read in the display language when the panel is drawn: `SHADOW` becomes a function,
`shadow()`, because a label written into an object at load time stays in the language the page loaded in.
Of every button on every screen and on both mic screens, closed and open, these two are the only ones with
neither text nor `aria-label` (measured on a copy with tasks 1 to 9).

Files:
- Modify: `src/ui/listen.js` (`SHADOW` and its call, lines 94 and 113–118 after task 7)
- Test: `test/screens.js` (`read()`, lines 26–37, and a new section after « À VOIX HAUTE »)
- Modify: `TESTING.md` (the `screens.js` row)
- Build: `index.html`, `artifact.html`

Notes:
- **Waits for task 7**, which wrote `SHADOW` and the call this task changes.
- **`read()` asks every page it reads**: the four states of every screen, the sheets, the panels, every exercise
  of the session. They all pass today; the new check fails only on the nazeggen.
- **This file's page has no recogniser**, so its screens show the recorder or a notice where the microphone
  goes. The new section opens a second page that has one, as `test/lang.js`'s check 6e does.
- **The proof.** These steps ran on `origin/main` (`a64a8fe`) with tasks 1 to 9 applied. Step 2
  printed the three `FAIL` lines below and `819 checks, 3 FAILED`; step 4 printed `819 checks, SCREENS OK`
  (682 before the task: `read()` gains a check per page it reads, and the new section adds its own). Step 5
  printed `built (local only) index.html (679671 bytes), artifact.html (679057 bytes)`.

- [ ] **Step 1: Write the failing test.** In `test/screens.js`, in `read()`, after
  ```js
    ok(!/test de niveau/i.test(txt) && html.indexOf('placement') < 0, where + ' still offers the placement test');
  ```
  insert
  ```js
    /* Un bouton sans texte, une icône seule, se nomme par son aria-label : sans lui, un lecteur
       d'écran ne dit que « bouton ». Un bouton dans un <label> qui a du texte porte ce texte pour
       nom : les interrupteurs des réglages. */
    const unlabelled = html.replace(/<label\b[^>]*>[\s\S]*?<\/label>/g, l => text(l).trim() ? '' : l);
    const unnamed = (unlabelled.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) || [])
      .map(b => [b.match(/^<button\b[^>]*>/)[0], text(b).trim()])
      .filter(([open, said]) => !said && !/\saria-label="[^"]+"/.test(open)).map(([open]) => open);
    ok(unnamed.length === 0, where + ' has a button with neither text nor aria-label: ' + unnamed.join(' '));
  ```
  and after the end of the « À VOIX HAUTE » section,
  ```js
      console.log('  présent sur l’exercice parlé, absent des ' + asked + ' autres, retiré une fois la réponse donnée ; appuyé : plus rien à voix haute');
    }
  ```
  insert
  ```js

    /* ------------------------------------------------------------------ */
    console.log('\nLE MICRO A UN NOM — fermé et ouvert');
    {
      /* Le micro n'est qu'une icône, et read() demande un nom à tout bouton sans texte. Mais la page
         de ce fichier n'a pas de reconnaissance vocale : ses écrans montrent l'enregistreur ou un avis
         à la place du micro. Une page qui en a une le montre, fermé puis ouvert : au tour de parole
         d'une conversation, qui prend les boutons de l'exercice parlé, et au nazeggen, qui passe les
         siens. Le nom se lit dans la langue du moment : en anglais aussi. */
      const R = browser.open({ root: ROOT, seed: browser.SEED, now: T0, ua: browser.UA.EDG, byId: 'stub', media: true, recogniser: true,
        voices: [{ name: 'Microsoft Bart - Dutch (Belgium)', lang: 'nl-BE', localService: true }] });
      await R.NL.state.open();
      const page = () => R.app.innerHTML;
      /* Un résultat provisoire garde l'écoute ouverte (test/lib/browser.js) : sans lui, le faux
         micro entend un silence et se ferme aussitôt. */
      const named = (where, start, stop, closed) => {
        ok(page().indexOf(closed) >= 0, where + ': the microphone is not on screen, the check is hollow');
        read(where, page(), 'micro fermé');
        R.ctx.__partialNext = 'nog'; start();
        ok(page().indexOf('mic big listening') >= 0, where + ': the microphone did not open, the check is hollow');
        read(where, page(), 'micro ouvert');
        stop();
      };
      const shadowing = () => { R.NL.ui.go('luisteren'); R.NL.screens.luisteren.click({ dataset: {} }, { act: 'nazeggen' }); };
      R.NL.ui.go('scenario', 's-bakker');
      for (let g = 0; page().indexOf('data-mic="start"') < 0 && g < 20; g++) {
        R.NL.screens.scenario.click({ dataset: {} }, { step: 'next' }); R.NL.screens.scenario.click({ dataset: {} }, { choice: '0' });
      }
      named('scenario', () => R.tap({ mic: 'start' }), () => R.tap({ mic: 'stop' }), 'data-mic="start"');
      shadowing();
      named('nazeggen', () => R.tap({ act: 'mic' }), () => R.tap({ act: 'micstop' }), 'data-act="mic"');
      /* En anglais, le micro fermé du nazeggen dit « Speak » : un nom écrit au chargement resterait
         dans la langue où la page s'est ouverte. */
      R.NL.state.setMeta({ displayLang: 'en' }); R.NL.lang.apply();
      shadowing();
      const mic = (page().match(/<button class="mic big"[^>]*>/) || [''])[0];
      ok(mic.indexOf('aria-label="' + R.NL.tables.en.speak + '"') >= 0, 'in English, the nazeggen microphone is not named « ' + R.NL.tables.en.speak + ' »: ' + (mic || 'no microphone'));
      console.log('  au tour de parole et au nazeggen, le micro fermé et ouvert a un nom ; en anglais, « ' + R.NL.tables.en.speak + ' »');
    }
  ```

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/screens.js .
  ```
  Expected: exactly three `FAIL` lines, and the last line `819 checks, 3 FAILED`:
  ```
    FAIL: nazeggen (micro fermé) has a button with neither text nor aria-label: <button class="mic big" data-act="mic">
    FAIL: nazeggen (micro ouvert) has a button with neither text nor aria-label: <button class="mic big listening" data-act="micstop">
    FAIL: in English, the nazeggen microphone is not named « Speak »: <button class="mic big" data-act="mic">
  ```

- [ ] **Step 3: Implement.** In `src/ui/listen.js`, replace
  ```js
          '</div>' + NL.ex.micPanel(sp, c.nl, SHADOW);
  ```
  with
  ```js
          '</div>' + NL.ex.micPanel(sp, c.nl, shadow());
  ```
  and replace
  ```js
    /* Le panneau du micro de l'exercice « dire » (NL.ex.micPanel). Le nazeggen ne note rien : son
       micro passe par data-act, et après le score il n'offre que de recommencer. */
    const SHADOW = {
      icon: 32, graded: false, startAttrs: ' data-act="mic"', stopAttrs: ' data-act="micstop"',
      after: () => '<div class="mic-actions"><button class="btn btn-blue" data-act="mic">' + NL.t.replay + '</button></div>'
    };
  ```
  with
  ```js
    /* Le panneau du micro de l'exercice « dire » (NL.ex.micPanel). Le nazeggen ne note rien : son
       micro passe par data-act, et après le score il n'offre que de recommencer. Ses boutons portent
       les noms de ceux de l'exercice, lus dans la langue du moment : d'où une fonction. */
    const shadow = () => ({
      icon: 32, graded: false,
      startAttrs: ' data-act="mic" aria-label="' + NL.t.speak + '"',
      stopAttrs: ' data-act="micstop" aria-label="' + NL.t.stop + '"',
      after: () => '<div class="mic-actions"><button class="btn btn-blue" data-act="mic">' + NL.t.replay + '</button></div>'
    });
  ```
  In `TESTING.md`, in the `screens.js` row, replace `le bouton « je ne peux pas parler », le journal d'erreurs ;`
  with `le bouton « je ne peux pas parler », un nom (aria-label) à tout bouton sans texte, le micro compris, fermé
  et ouvert, au tour de parole et au nazeggen, en anglais aussi ; le journal d'erreurs ;`.

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/screens.js .
  node test/lang.js .
  ```
  Expected: `819 checks, SCREENS OK`, and `lang.js`'s last line `23148 contrôles, LANGUE CONFORME` (it reads
  `aria-label`s on every screen it visits: the new names are in the page's language).

- [ ] **Step 5: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (679671 bytes), artifact.html (679057 bytes)`.

- [ ] **Step 6: Commit.**
  ```
  git add src/ui/listen.js test/screens.js TESTING.md index.html artifact.html
  git commit -m "fix(listen): the nazeggen's microphone is named « Parler » and « Stop », in the display language, as the speak exercise's is"
  ```

Done when:
- On the nazeggen, the closed microphone's button carries `aria-label="Parler"` in French and `"Speak"` in
  English, and the open one `aria-label="Stop"`; before step 3 neither had one.
- `node test/screens.js .` prints `819 checks, SCREENS OK`.
- `grep -n "SHADOW" src/ui/listen.js` prints nothing.

### Task 11: the sounds screen declares only the Dutch of its row heads
Class: mechanical
Ticket: none
Why: found by the learner pass of the design sitting (25 October 2026) and added to this run on the
maintainer's word; task 8's notes leave it to another ticket, and this is that work. The sounds screen
(`klanken`) declares each row's head `nl-BE` whole (`src/ui/library.js:210`, `<b lang="nl-BE">`). Nine heads
are Dutch spellings (`eu`, `oe`, `u`, `g / ch`, `ui`, `ij / ei`, `h`, `sch`, `w`), but « accent tonique » is
French, and so are the « final » of « -en final » and the « suppression du » of « suppression du t »: a screen
reader says them with a Dutch voice. After this task the head is prose, as the row's text is: its Dutch
spelling carries `class="nl"`, which `NL.gloss.prose` declares `nl-BE`, and the rest is read in the table's
language, French (`NL.gloss.langAttr`, as the row's `<p>` is). Nothing the learner sees changes: `.snd-head b`
styles the head, and no style reads `.nl` or `:lang(nl)` (`class="ex"`, which has a background, is not used).

Files:
- Modify: `src/ui/library.js` (line 210, the row's head)
- Modify: `src/content/reference.js` (the comment above `NL.content.sounds`, line 11 after task 8, and the
  twelve heads, lines 13–24)
- Test: `test/lang.js` (`HTML_FIELDS`, line 897; `q8`, check 6d.8, lines 1173–1189 after task 8)
- Modify: `TESTING.md` (line 16, the `lang.js` row)
- Build: `index.html`, `artifact.html`

Notes:
- **Waits for task 8**, which wrote `q8`, the comment above `NL.content.sounds` and the `TESTING.md` sentence
  this task extends.
- **What is Dutch in a head is what its row's Dutch examples write**: « eu » in deur, « -en » in werken, « t »
  in niet. `q8` reads each head as rendered: a word of it declared `nl-BE` that no Dutch example of its row
  writes is French taken for Dutch; a word left bare that one writes is Dutch left undeclared.
- **`g / ch` and `ij / ei` are one span each**: the slash stands between two Dutch spellings.
- **`HTML_FIELDS` gains `g`.** The comment above it says the list is the fields shown by `NL.gloss.prose`,
  which the head now is; check 6d.3 (`q3`) then also reads the heads, which cite nothing (one check each).
- **The proof.** These steps ran on `origin/main` (`a64a8fe`) with tasks 1 to 10 applied. Step 2 printed the
  three `FAIL` lines below and `23173 contrôles, 3 ÉCHEC(S)`, exit 1; step 4 printed `23173 contrôles, LANGUE
  CONFORME` (23148 before the task: `q8` gains a check per row and one more, `q3` one per head). Step 6
  printed `built (local only) index.html (680150 bytes), artifact.html (679536 bytes)`.

- [ ] **Step 1: Write the failing test.** In `test/lang.js`, replace
  ```js
  /* Les champs écrits en HTML, montrés par NL.gloss.prose. */
  const HTML_FIELDS = ['explain', 'say', 'title', 'h'];
  ```
  with
  ```js
  /* Les champs écrits en HTML, montrés par NL.gloss.prose : g est la tête d'une ligne de la table des sons. */
  const HTML_FIELDS = ['explain', 'say', 'title', 'h', 'g'];
  ```
  In `q8`, replace
  ```js
        /* Le texte de chaque son seul : ni la tête de sa ligne, le nom du son, que l'écran déclare
           nl-BE lui-même, ni l'en-tête de l'app, qui a son gras à lui, « Vlaams ». */
        const says = (B.app.innerHTML.match(/<div class="snd-row[\s\S]*?<\/p><\/div>/g) || []).map(row => row.replace(/^[\s\S]*?<\/div>|<\/div>$/g, ''));
  ```
  with
  ```js
        /* Le texte de chaque son seul : ni la tête de sa ligne, le nom du son, lue plus bas, ni l'en-tête
           de l'app, qui a son gras à lui, « Vlaams ». */
        const rows = B.app.innerHTML.match(/<div class="snd-row[\s\S]*?<\/p><\/div>/g) || [];
        const says = rows.map(row => row.replace(/^[\s\S]*?<\/div>|<\/div>$/g, ''));
  ```
  and after
  ```js
        console.log('  sons en gras    ' + dutch.length + ' déclarés nl-BE, ' + bare.length + ' comparaisons, ' + Object.keys(SOUND_OK).length + ' exceptions');
  ```
  insert
  ```js
        /* La tête de chaque ligne, le nom du son : l'orthographe néerlandaise qu'il enseigne, déclarée
           nl-BE, et ce qui la nomme en français (« accent tonique », « final », « suppression du »), nu.
           Un mot de la tête est du néerlandais quand un exemple néerlandais de sa ligne l'écrit : eu dans
           deur, t dans niet. Déclaré nl-BE, il doit y être ; nu, il ne doit pas. */
        let named = 0;
        rows.forEach((row, i) => {
          const head = runs((/<div class="snd-head">(<b\b[\s\S]*?<\/b>)/.exec(row) || ['', ''])[1], pageLang(B));
          const said = runs(says[i], pageLang(B)).filter(r => r.lang === 'nl-BE').map(r => r.text.toLowerCase()).join(' ');
          const wrong = [].concat(...head.map(r => (r.text.toLowerCase().match(/\p{L}+/gu) || [])
            .filter(w => (r.lang === 'nl-BE') !== (said.indexOf(w) >= 0)).map(w => w + ' (' + r.lang + ')')));
          named += head.filter(r => r.lang === 'nl-BE').length;
          ok(head.length > 0 && wrong.length === 0, head.length
            ? '6d : la tête « ' + head.map(r => r.text).join(' ') + ' » de la table des sons déclare mal ' + wrong.join(', ') + ' — nl-BE, ce qu’un exemple de sa ligne écrit ; nu, le français qui le nomme'
            : '6d : la ligne ' + (i + 1) + ' de la table des sons n’a pas de tête en gras, le contrôle lit mal l’écran');
        });
        ok(named > 0, '6d : aucune tête de la table des sons ne déclare nl-BE, le contrôle est creux');
        console.log('  têtes des sons  ' + rows.length + ' têtes, ' + named + ' passages déclarés nl-BE');
  ```

- [ ] **Step 2: Watch it fail.**
  ```
  node test/lang.js .
  ```
  Expected, exit 1, these three `FAIL` lines and the last line `23173 contrôles, 3 ÉCHEC(S)`:
  ```
    FAIL: 6d : la tête « accent tonique » de la table des sons déclare mal accent (nl-BE), tonique (nl-BE) — nl-BE, ce qu’un exemple de sa ligne écrit ; nu, le français qui le nomme
    FAIL: 6d : la tête « -en final » de la table des sons déclare mal final (nl-BE) — nl-BE, ce qu’un exemple de sa ligne écrit ; nu, le français qui le nomme
    FAIL: 6d : la tête « suppression du t » de la table des sons déclare mal suppression (nl-BE), du (nl-BE) — nl-BE, ce qu’un exemple de sa ligne écrit ; nu, le français qui le nomme
  ```

- [ ] **Step 3: The head declares only its Dutch.** In `src/ui/library.js`, replace
  ```js
            '<div class="snd-row' + (s.good ? ' good' : s.warn ? ' warn' : '') + '"><div class="snd-head"><b' + NL.gloss.attr('nl') + '>' + esc(s.g) + '</b><code>' + esc(s.ipa) + '</code>' +
  ```
  with
  ```js
            '<div class="snd-row' + (s.good ? ' good' : s.warn ? ' warn' : '') + '"><div class="snd-head"><b' + NL.gloss.langAttr(s.g) + '>' + NL.gloss.prose(s.g) + '</b><code>' + esc(s.ipa) + '</code>' +
  ```
  In `src/content/reference.js`, replace
  ```js
     le u de tu est la lettre française. SOUND_OK, dans test/lang.js (6d.8), nomme chacun. */
  ```
  with
  ```js
     le u de tu est la lettre française. SOUND_OK, dans test/lang.js (6d.8), nomme chacun.
     La tête d'une ligne (g), le nom du son, est une prose elle aussi : l'orthographe enseignée y porte
     class="nl", et ce qui la nomme en français (accent tonique, final, suppression du) reste nu. */
  ```
  and replace each head, in order:
  ```js
    { g: 'eu',
  ```
  with
  ```js
    { g: '<span class="nl">eu</span>',
  ```
  ```js
    { g: 'oe',
  ```
  with
  ```js
    { g: '<span class="nl">oe</span>',
  ```
  ```js
    { g: 'u',
  ```
  with
  ```js
    { g: '<span class="nl">u</span>',
  ```
  ```js
    { g: 'g / ch',
  ```
  with
  ```js
    { g: '<span class="nl">g / ch</span>',
  ```
  ```js
    { g: 'ui',
  ```
  with
  ```js
    { g: '<span class="nl">ui</span>',
  ```
  ```js
    { g: 'ij / ei',
  ```
  with
  ```js
    { g: '<span class="nl">ij / ei</span>',
  ```
  ```js
    { g: 'h',
  ```
  with
  ```js
    { g: '<span class="nl">h</span>',
  ```
  ```js
    { g: 'sch',
  ```
  with
  ```js
    { g: '<span class="nl">sch</span>',
  ```
  ```js
    { g: 'w',
  ```
  with
  ```js
    { g: '<span class="nl">w</span>',
  ```
  ```js
    { g: '-en final',
  ```
  with
  ```js
    { g: '<span class="nl">-en</span> final',
  ```
  ```js
    { g: 'suppression du t',
  ```
  with
  ```js
    { g: 'suppression du <span class="nl">t</span>',
  ```
  « accent tonique » stays as it is: it is French whole.

- [ ] **Step 4: Watch it pass.**
  ```
  node test/lang.js .
  ```
  Expected, exit 0, ending with:
  ```
    sons en gras    6 déclarés nl-BE, 15 comparaisons, 12 exceptions
    têtes des sons  12 têtes, 11 passages déclarés nl-BE

  23173 contrôles, LANGUE CONFORME
  ```

- [ ] **Step 5: Say it in `TESTING.md`.** In the `lang.js` row (line 16), replace
  ```
  que le contrôle 6 ne prend pas pour du néerlandais) ;
  ```
  with
  ```
  que le contrôle 6 ne prend pas pour du néerlandais), et la tête de chaque ligne, le nom du son, dont seule l'orthographe néerlandaise, celle qu'un exemple de la ligne écrit, est déclarée `nl-BE` (« accent tonique » et le « final » de « -en final » sont du français) ;
  ```

- [ ] **Step 6: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (680150 bytes), artifact.html (679536 bytes)`.

- [ ] **Step 7: Commit.**
  ```
  git add src/ui/library.js src/content/reference.js test/lang.js TESTING.md index.html artifact.html
  git commit -m "fix(library): a sound's head on the sounds screen declares nl-BE only its Dutch spelling, and « accent tonique », « final » and « suppression du » are read as the French they are"
  ```

Done when:
- On the sounds screen, the head « accent tonique » carries `lang="fr"` and no `nl-BE`, and « -en final »
  declares only `-en` `nl-BE`; before step 3 each head was `<b lang="nl-BE">` whole.
- `node test/lang.js .` prints `23173 contrôles, LANGUE CONFORME`.
- `sh build.sh` ran, and `index.html` and `artifact.html` are committed.

### Task 12: Merge explanations-be « jij », and the rows of three notes edited by hand
Class: mechanical
Ticket: #93
Merges: explanations-be
Promises: none
Why: #93, second point and its last two acceptance lines. Task 4's drafter, its readers and, if they disagreed,
the maintainer have settled four rows, and this task carries them into `src/`. Merge writes by key: it sets
each row's entry in `src/content/notes.js`, in `src/content/also.js` (or removes it, for `also` `[]`) and in
`src/content/decoys.js`, and leaves every other entry as it is.
- `ikengij:w1`: the shipped `'jij': ['gjij', 'jgij']` is then gone, written over by the accepted row's two
  decoys.
- `onderweg:w0`, `overleven:p2`, `overleven:p9`: their rows copy what ships, the notes `999fe4f` edited by
  hand as gate 39 ruled. Merge writes them at the same bytes, and from then on a row holds them, so a later
  Merge of phase 3's batches no longer writes the old notes back over them.

Files:
- Modify (Merge writes them): `src/content/decoys.js`, and `src/content/notes.js` and `src/content/also.js`
  when `jij`'s row changes them
- Modify (the build writes them): `index.html`, `artifact.html`
- Test: `node test/content.js .`, `node test/lang.js .`, `node test/typed.js .`, then the full suite,
  `sh test/run-all.sh`

Notes:
- **No new test.** The test that fails on the old code for #93 is task 2's case in `test/tools/fanout.js`.
  What this task fixes is two shipped decoys, and no rule a script can apply tells « gjij » from a decoy a
  learner makes: it passes even task 2's Check (0.75 from « jij », floor 0.33). Check and two readers are the
  guard, as for every merged row. The three copies change no byte, so no test can fail on the old code for
  them: step 5 shows their lines unchanged. Step 1 shows the old decoys, and step 5 shows them gone.
- **The stamps.** Split stamped each row with its `be`, meaning, note and `also` (`10a3e231`, `2b6c1733`,
  `fb68d9a8` and `74052a73` at `a64a8fe`). No task between 4 and this one changes them, so Merge finds them
  fresh. If `jij`'s merged note or `also` differs from today's, a second run of Merge prints
  `fail explanations-be ikengij:w1: stale, stamped 10a3e231 at Split, the source now stamps <b>`, exits 1 and
  writes nothing: the first run already wrote it. This is not a bug. To start over, run
  `git checkout -- src/content/notes.js src/content/also.js src/content/decoys.js`.
- **No row may be dropped.** If the maintainer ruled `drop` for `jij`, it keeps « gjij » and « jgij », which
  this task exists to remove; if for a copy, that note keeps no row. Step 3 stops on either.
- **The proof.** These steps ran on a copy of `origin/main` (`a64a8fe`) with tasks 1 to 3 and 5 to 11 applied,
  and four hand-made rows merged, which pass Check: `jij`'s note kept, `also` `[]`, decoys « je » and « jou »;
  the three copies as task 4's Format gives them. `jij`'s real row comes from the fan-out, so its decoys, and
  Merge's `notes.js` and `also.js` lines, may differ. What moved:
  - Merge: `ok explanations-be 4 taken, 0 dropped`, `ok notes.js 4 set, 0 removed`,
    `ok also.js 0 set, 0 removed`, `ok decoys.js 4 set, 0 removed`;
  - `src/content/decoys.js`, line 68: `'jij': ['gjij', 'jgij'],` → `'jij': ['je', 'jou'],`, and no other line;
    `notes.js` and `also.js` the same bytes, `jij`'s note being kept word for word;
  - the build: 680150 → 680147 bytes for `index.html`, 679536 → 679533 for `artifact.html`;
  - `test/content.js` (2076 contrôles), `test/lang.js` (23173) and `test/typed.js` (853): the same counts, all
    passing, before and after;
  - `sh test/run-all.sh` after it: `TOUTE LA SUITE EST PASSÉE`.

- [ ] **Step 1: See the old decoys.**
  ```
  grep -n "'jij'\|'de fiets'\|'Kunt u mij helpen?'\|'Kunt u wat trager" src/content/decoys.js
  ```
  Expected:
  ```
  44:  'Kunt u mij helpen?': ['Kunt de mij helpen?', 'Kunde mij helpt?'],
  45:  'Kunt u wat trager spreken, alstublieft?': ['Kunt de wat trager spreken?', 'Kunde wat trager sprekt?'],
  59:  'de fiets': ['de veelo', 'de vélo'],
  68:  'jij': ['gjij', 'jgij'],
  ```

- [ ] **Step 2: Check the settled batches.**
  ```
  node tools/content/check.js "<WS>/drafts/explanations-be/be-words"
  node tools/content/check.js "<WS>/drafts/explanations-be/be-phrases-1"
  ```
  Expected, for each: exit 0, `ok input.json 2 rows`, `ok draft.json 2 rows`, and the review's line; then a
  line for each retry, change or ruling file the batch holds. Any `fail` line: stop and report it.

- [ ] **Step 3: Run Merge.**
  ```
  node tools/content/merge.js . "<WS>/drafts/explanations-be"
  ```
  Expected: exit 0, and exactly these four lines:
  ```
  ok explanations-be 4 taken, 0 dropped
  ok notes.js 4 set, 0 removed
  ok also.js <a> set, <r> removed
  ok decoys.js 4 set, 0 removed
  ```
  `<a>` is 1 if `jij`'s row gives it « on dit aussi » forms, else 0; `<r>` is 0 (none of the four has any
  today).

  If a line starts with `fail`, Merge wrote nothing. Stop and report the lines. Do not edit a draft, a review
  or a ruling, and do not run Split again.

  If the first line reads `<n> dropped` with `<n>` above 0, run
  `git checkout -- src/content/notes.js src/content/also.js src/content/decoys.js`, then stop and report it.

- [ ] **Step 4: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (…) index.html (<n> bytes), artifact.html (<m> bytes)`.

- [ ] **Step 5: Run them and see them pass.**
  1. ```
     grep -n "'jij'" src/content/decoys.js
     grep -c "gjij\|jgij" src/content/decoys.js
     git diff -U0 src/content/ | grep "^[-+] "
     ```
     Expected: line 68 holds `jij`'s two decoys, the count is `0`, and every line the diff prints is `jij`'s
     entry, `-  'jij': …` or `+  'jij': …`, in `decoys.js` (and in `notes.js` or `also.js` if the row changed
     them): the three copies' lines did not move.
  2. `node test/content.js .` ends `CONTENU CONFORME`, `node test/lang.js .` ends `LANGUE CONFORME`, and
     `node test/typed.js .` ends `0 en échec`. Any failure: stop and report it. A merged decoy is course Dutch (`test/lib/dutch.js` lists the
     decoys), so a failure in `test/lang.js` 6d is the likeliest; it is not fixed in this task.
  3. `sh test/run-all.sh`. Expected: it ends with
     ```
     (note) index.html ou artifact.html diffère du dernier commit : à versionner avec ce changement.

     TOUTE LA SUITE EST PASSÉE
     ```
     Any failure: stop and report it.

- [ ] **Step 6: Report.** In the return, give Merge's four lines, the build's sizes before and after, `jij`'s
  lines in `decoys.js`, `notes.js` and `also.js` after, and the diff's lines from step 5.

- [ ] **Step 7: Commit.**
  ```
  git add src/content/notes.js src/content/also.js src/content/decoys.js index.html artifact.html
  git commit -m "feat(content): « jij »'s decoys redrafted through the kind's rows and merged, two mistakes a learner makes in place of « gjij » and « jgij »; the three notes edited by hand at gate 39 now have their rows (#93)"
  ```

Done when:
- `src/content/decoys.js` holds no `gjij` or `jgij`, and `jij`'s entry is what one successful run of Merge
  wrote, the run that printed `ok explanations-be 4 taken, 0 dropped`.
- The notes, `also` and decoys of « de fiets », « Kunt u wat trager spreken, alstublieft? » and « Kunt u mij
  helpen? » are the same bytes as before the task.
- `sh build.sh` ran, and `index.html` and `artifact.html` are committed.
- `sh test/run-all.sh` prints `TOUTE LA SUITE EST PASSÉE`.
- `git status --short` is clean after the commit.

### Task 13: GATE: a learner pass in a real browser, before the maintainer's check
Class: gate
Ticket: none
After: 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12
Show: echo "## days"; node tools/learner-pass/days.js .; echo "## corners"; node tools/learner-pass/corners.js .; echo "## sweep"; node tools/learner-pass/sweep.js .
Ask: « The learner pass played the branch's last commit as a learner on an iPhone would: <WS>/tmp/gate-13.md, its screenshots in `tools/learner-pass/shots/`. Check it yourself on the branch's preview: what did you find? (nothing is an answer) »
Answer to: Rulings
Why: on 25 October 2026 the maintainer asked, through phase 3's run 2, for a hands-on learner pass in a real
browser before every learner's check. Run 2's pass on production found three faults no suite saw (PR #100):
« Je ne peux pas parler » did nothing, Safari on iPhone's microphone never scored, and Répéter graded the
Flemish line against the standard form. Tasks 7, 8, 10, 11 and 12 change what a learner sees: the microphone
panel of three screens and its name on the nazeggen, the sounds screen, and « jij »'s decoys. The suite checks
their markup; only a browser checks a tap. The learner pass, `tools/learner-pass/` (its `README.md` says what
each script plays), plays the committed `index.html` in headless Chrome dressed as Safari on iPhone (390×844,
touch, `fr-BE`), with a fake recogniser that behaves like Safari's. Show writes nothing tracked: its
screenshots go to `tools/learner-pass/shots/`, which git ignores. Each script exits 1 with one `PROBLEM:` line
per fault, and prints, last:
- `days.js`: sessions on study days 0 to 20, the clock moved forward, until spoken cards come up; each
  microphone path once: right, wrong then right, ending by itself, and « Je ne peux pas parler ». A clean run
  ends `THE STUDY DAYS PLAY THROUGH`.
- `corners.js`: listening (Comprendre, Répéter), the baker conversation, the challenge. A clean run ends
  `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`.
- `sweep.js`: every tappable thing on 16 screens: one that changes nothing, one a finger cannot reach,
  overflow at 390 px, console errors. A clean run ends `EVERY TAP DOES SOMETHING`.

The proof. The assembler ran this Show, word for word, on the plan's replay: a copy of `a64a8fe` with tasks 1
to 12 applied and `index.html` built, after `npm ci --ignore-scripts` in `tools/learner-pass/`. It took about
six minutes, printed no `PROBLEM:` line, and each script exited 0:
- `days.js` played study days 0, 1, 2, 3, 5 and 7. Spoken cards came up on day 3 (one, `mic-panel good`).
  On day 5 « Je ne peux pas parler » left no spoken card in the session, which ended « 5 spoken exercises
  kept for the next session ». Day 7 held 14 spoken cards: wrong then right (`mic-panel bad`, then `good`),
  ending by itself, and right. It ended `THE STUDY DAYS PLAY THROUGH`.
- `corners.js` played eight Comprendre lines, eight Répéter lines (each `mic-panel good`, every word of the
  line), the baker conversation (four spoken turns) and a nine-card challenge. It ended `LISTENING,
  CONVERSATION AND CHALLENGE PLAY THROUGH`.
- `sweep.js` tapped 274 things on 16 screens. It ended `EVERY TAP DOES SOMETHING`.

The assembler looked at three of the 46 screenshots: the sounds screen, Répéter's scored panel and the
nazeggen's wrong-answer panel. The sounds screen's English heads sit over French bodies, as its label « For
French speakers » says: it is one of the three French pages (`NL.content.anchors.sounds` is `'fr'`), and
`test/lang.js` judges it so. That is not a fault.

Known before the run, and not for this gate: in Settings, a switch that redraws the sheet throws it back to its
top (#103, the plan's « Left out »). `sweep.js` does not report it.

If Show cannot start (no `node_modules` in `tools/learner-pass/`, no Chrome), tell the maintainer its error
lines in place of the question. Until the maintainer answers, the gate stays `in progress`.
Then:
- **Nothing.** The Rulings line holds the question and « nothing ». The gate is `done`.
- **A fault.** The maintainer says, for each, whether it is fixed in this run or ticketed. A fix in this run
  is one proposed `mechanical` task after the gate, with a test that fails on the old code, and the gate's
  Show runs again once it is `done`. A ticket is filed by the run controller on the maintainer's word, with
  `gh issue create --parent 12 --label needs-triage` (`docs/agents/issue-tracker.md`), and its number goes in
  the Rulings line.
- **A `closing` task changes `src/` after the gate.** The run file's `Learner pass:` line says it: Show runs
  again before the final report, and the maintainer gets both paths.
