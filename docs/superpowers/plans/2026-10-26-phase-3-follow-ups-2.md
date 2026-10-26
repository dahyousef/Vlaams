# Phase 3 follow-ups 2 — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/run-controller.md`, Mode: one session
> (`one-session.md`). A run controller hands one code-lane task at a time to a task controller, and puts gate 7
> to the maintainer; do not use a skill's controller loop. Implementers read `docs/agents/plan-runs/run-notes.md`
> before their brief; where the notes and a command here differ, the notes win. Steps use checkbox (`- [ ]`)
> syntax for tracking.

**Goal:** close the five Minors the phase 3 follow-ups run left open (#105 to #108, and #110), before phase 4
is designed. Split, given ids in a folder it has already cut, prints the old batches only when they hold
exactly the named rows, and refuses otherwise. Every one-line reason in the kit says that a blank at either end
is refused. The kit's other-language quotes check and its `words(untoken(…))` are written once, and two names
say what they hold. The home screen's week chart counts its days back on the local calendar and names each one
there, so it shows seven days in a row around a clock change and west of UTC; §12 of `test/journey.js` counts
the same way. The microphone panel's button attributes travel as one shape, its retry rule's 3 has one name,
and `micPanel` reads `graded` once. The follow-ups plan gets a note under its Review Focus 5. Before the
maintainer's own check, a learner pass plays the branch in a real browser (gate 7).

**Architecture:** no new mechanism. `kit.split` compares the ids it is given with the batches of a folder it
has already cut (task 1). `test/lib/text.js` gains `strayQuotes` and `test/lib/dutch.js` gains
`tokenFreeWords`, each written once for the kit's two callers (task 3). `NL.util.daysBack(n)` gives the same
hour n dates back on the local calendar, and `test/lib/zone.js` holds the zone handling three suites share
(task 4). `NL.ex.retryButton` writes the retry rule once, and `NL.ex.micPanel` takes its two buttons' taps as
one shape, `taps` (task 5).

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`), and the tools' suites in `test/tools/`.
- The content kit, `tools/content/`.
- The learner pass, `tools/learner-pass/`: headless Chrome dressed as Safari on iPhone, through
  `playwright-core`.
- `gh` for tickets.

**Spec:**
- GitHub issue #12, « New vocabulary every day, English by default, and content to B1 ».
- The tickets, sub-issues of #12: #105, #106, #107, #108 and #110. Each task names its own.
- The maintainer's decisions of 26 October 2026, below. They were given in conversation at this plan's
  design sitting, so this plan states them.
- `GLOSSARY.md`; ADR 0006 is not touched by any task.

## The maintainer's decisions (26 October 2026)

| D | Ticket | Answer | Task |
|---|---|---|---|
| D1 | #106 | **Compare.** Split, given ids in a folder it has already cut, prints the folder's lines when its batches hold exactly the named rows, and refuses otherwise: a `fail` line, exit 1, nothing written. | 1 |
| D2 | #105 | The week chart's day **labels** are fixed in the same task: west of UTC, each bar was named after the day before it. | 4 |
| D3 | #108 | A **note** under Review Focus 5 of the 2026-10-25 plan; its condition stays as decided. | 6 |
| D4 | — | **The run controller rules** on the maintainer's behalf, and logs each ruling in the ledger's Rulings. So `Mode: one session` (`CLAUDE.md`, « Running a plan »). Gate 7 stays the maintainer's. | set-up |
| D5 | — | **The end:** a draft pull request into `main`, pushed. It is never marked ready and never merged. | set-up |
| D6 | — | **Every task proved** before the plan is committed, by three writers on copies of `f7376ac`, then the whole plan replayed in its order. | this plan |

#107 and #110 had no decision to take: each ticket names its fix.

## How far to trust this plan

- Each task was proved by its writer on a copy of `f7376ac` (D6). Tasks 1 to 3 were proved by one writer, each
  with the tasks before it applied; task 4 alone, task 5 alone, and task 6 by the assembler. The red step failed
  as written, the green step passed, and `sh test/run-all.sh` printed `TOUTE LA SUITE EST PASSÉE` after task
  3, after task 4 and after task 5.
- The assembler then had the whole plan replayed in its order, tasks 1 to 6 from the briefs as they stand
  here, by an implementer that had not written them, on a copy of `f7376ac` with the learner pass installed as
  the set-up installs it. Every old text was found once, and every red and green step printed its Expected
  lines. The replay's code is the writers' own, line for line. The counts task 4 moves are restated in task 5:
  `828` checks in `test/screens.js`, and the build's sizes.
- `sh test/run-all.sh` on the replay printed `TOUTE LA SUITE EST PASSÉE`, with `content` 2077, `lang` 23173,
  `typed` 853, `screens` 828, `engine` 307, `sync` 244, `tools/fanout.js` 454, `tools/sources.js` 33, and the
  journeys with no problem. Where a line number still differs in your tree, find the place by its text; where a
  count differs, the `FAIL` lines and the verdict words are what count.
- Gate 7's Show was run on the replay after task 6: `days.js`, `corners.js` and `sweep.js` each exited 0 with
  no `PROBLEM:` line. At the gate, a `PROBLEM:` line is a fault to confirm by hand, as
  `tools/learner-pass/README.md` says, before it goes to the maintainer.

## Set-up decisions

- The run works in the worktree `.claude\worktrees\phase-3-follow-ups-2` of the clone at
  `%USERPROFILE%\dev\vlaams-phase-2`, on branch `phase-3-follow-ups-2`, cut from `f7376ac` (`main` after PR
  #109). The plan's own commit is on it; `Base:` is that commit. It pushes with
  `git push origin HEAD:phase-3-follow-ups-2`. Nothing goes to `main`.
- `Mode: one session` (D4). The plan has seven tasks and no `fan-out` task, so its drafting lane stays idle;
  gate 7 is why the mode matters beyond D4, since a gate runs only in it.
- Tickets, all filed, all sub-issues of #12: #106 (task 1), #107 (task 2), #110 (tasks 3 and 5), #105 (task
  4), #108 (task 6). They carry `needs-triage`; their labels are the maintainer's.
- The set-up writes D4, D5 and the maintainer's push notifications as the ledger's first Rulings lines, as
  the follow-ups run did, so that the run controller, which reads Rulings, holds them:
  - **Who rules.** A task's `needs ruling` and a fix the closing review proposes are decided by the run
    controller on the maintainer's behalf, each written as its own Rulings line ending « (on the
    maintainer's behalf) ». Gate 7 stays the maintainer's and waits for their word. Never `main`, never a
    merge.
  - **The end.** After the final report's push, a draft pull request from `phase-3-follow-ups-2` into
    `main`, its body naming the tickets of the closing review's `TICKETS` line. Never marked ready, never
    merged.
  - **Reaching the maintainer.** A push notification (the `PushNotification` tool) beside the one-line
    message, for each thing that waits on them: gate 7, a run that stops, and the final report with the pull
    request's link.
- Gate 7 runs the learner pass in the repo, `tools/learner-pass/`. It needs one package, pinned in its
  `package-lock.json`, and the installed Chrome. The set-up installs it with no install script:
  `npm ci --ignore-scripts`, run in `tools/learner-pass/`. Its `node_modules/` and `shots/` are ignored by
  git.

## Global Constraints

Code:
- `const`, or `let` where it changes; never `var`; no optional chaining. Arrows for short helpers and
  callbacks, `function` declarations for longer named functions. Existing code is not converted.
- Comments and test messages match the file being edited.
- Every fix leaves a test that fails on the old code: write it, watch it fail, then fix it. A refactor's check
  is the suite staying green. Tasks 3 and 5 are refactors (#110); task 6 (a note in a plan) has no test, and
  says why.

Interface text and stored data:
- Interface text lives in `src/core/fr.js` and `src/core/en.js`, under the same keys.
- Storage keys and the field names inside stored records keep their spelling. This plan adds none.
- Meanings and prose are read through `NL.gloss`.

Content and its tables:
- The six tables a kind's Merge writes (`be.js`, `sourced.js`, `open.phrases.js`, `notes.js`, `also.js`,
  `decoys.js`) do not change in this plan: no task runs a Merge or edits one.
- External data stays in the git-ignored `.cache/`, pinned by date and sha256. Nothing from the Wiktionary
  extract enters a tracked file.

Behaviour:
- `NL.srs.compose()` alone decides what a session contains; no task touches it.
- Grading ignores the display language (ADR 0008).
- Progress is reported as counts, never percentages.
- A day is counted on the local calendar, never as 24 hours (task 4, #105).

Budgets and the build:
- `AHEAD_BUDGET` (`test/content.js`) stays 61: no task changes the course.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with
  the change.

Public repository:
- The repo is public. No personal data goes in a tracked file; the person is « the maintainer ». Content
  personalises through `{naam}`, `{stad}` and `{bedrijf}`.

## Review Focus

1. **Split, given ids in a folder it has already cut, compares.**
   - Condition: a folder cut for two ids, given the same ids in another order; other ids; one id more; one id
     fewer; no ids.
   - Expected: the folder's lines, exit 0; one `fail` line naming both differences; one naming the id its
     batches lack; one naming the row not named; the folder's lines; and in every case nothing rewritten.
   - Test: task 1, step 1 (`test/tools/fanout.js`).
2. **Every one-line reason says a blank at either end is refused.**
   - Condition: a text with a blank before or after it in each of the thirteen fields whose failed `oneLine`
     gives a reason: `unsure`, `be`, `skip`, `edited`, a sentence's four fields in `examples` and in
     `examples-gen`, a verdict's `en` and `fr`, `ask`, `model`, a need's `what`, `miss` and `any`, a keep's
     `right`.
   - Expected: refused, with a reason that says « with no space at either end ».
   - Test: task 2, step 1 (`test/tools/fanout.js`).
3. **The kit's checks written once read as they did.**
   - Condition: a pair or a note that writes the other language's quotes, or a straight quote; an item's
     Dutch with its `{tokens}`; « je » after a verb that takes « u », before a word that can follow « ton »
     and before one that cannot.
   - Expected: the same reasons, word for word; the same words; the same forms of rule « ge ».
   - Tests: task 3, step 4 (`test/tools/fanout.js`, `test/lang.js`, `test/content.js`, unchanged).
4. **The week chart shows seven days in a row, each named on the local calendar.**
   - Condition: Brussels at 23:30 on 25 and 27 October 2026 and at 00:30 on 30 March 2026; Montréal at 18:30
     on 25 October 2026.
   - Expected: seven different days ending today, each under its own weekday; one and three days back, as
     §12 of `test/journey.js` counts them, on the calendar too.
   - Test: task 4, step 1 (`test/screens.js`, « LA SEMAINE DE PLUS »).
5. **The microphone panel's markup does not move.**
   - Condition: every state of the panel on the speak exercise, a conversation's turn and the nazeggen, 178
     in all, the third missed try among them; the nazeggen in English on a page loaded in French.
   - Expected: the same markup, byte for byte, before and after; its buttons named in the display language.
   - Tests: task 5, steps 1 and 6 (a snapshot the run does not commit), and `test/screens.js`,
     `test/lang.js` and `test/smoke.js`, unchanged.

## Run order

One line per task: `<id>. <name> — <class> — <ticket> — waits <ids>`. The gate waits for its `After:`.

```
1. Split, given ids in a folder already cut, compares — mechanical — #106 — waits none
2. The kit's one-line reasons say a blank at either end is refused — mechanical — #107 — waits 1
3. The kit's half of #110: one quotes check, one helper for an item's Dutch words, two names — mechanical — #110 — waits 2
4. The week chart counts its days on the local calendar, and names them there — mechanical — #105 — waits none
5. The retry rule's three tries named once, the mic panel's buttons as one shape, `graded` read once, `micPanel`'s options named — mechanical — #110 — waits 4
6. A note under the follow-ups plan's Review Focus 5 on its « Zijt gij » example — mechanical — #108 — waits none
7. GATE: a learner pass in a real browser, before the maintainer's check — gate — none — waits 1, 2, 3, 4, 5, 6
```

Tasks 1 to 3 touch the same kit files and `test/tools/fanout.js`, so each waits for the one before it. Task 5
builds over task 4's `index.html`, and its Expected lines count task 4's checks, so it waits for task 4.

## The run file's lines

The set-up copies these lines into `<WS>/run.md` word for word. A gate's `show` writes to the screen; the run
controller puts its output in `<WS>/tmp/gate-<id>.md`.

```
Mode: one session
Gate: task 7 — after 1, 2, 3, 4, 5, 6 — show: echo "## days"; node tools/learner-pass/days.js .; echo "## corners"; node tools/learner-pass/corners.js .; echo "## sweep"; node tools/learner-pass/sweep.js . — ask: « The learner pass played the branch's last commit as a learner on an iPhone would: <WS>/tmp/gate-7.md, its screenshots in `tools/learner-pass/shots/` (the week chart is on `meer.png`). Check it yourself on the branch's preview: what did you find? (nothing is an answer) » — answer to: Rulings
Learner pass: gate 7 plays the branch's last commit. If a `closing` task changes src/ after the gate's show, run that show again into <WS>/tmp/gate-7-closing.md before the final report, and give the maintainer both paths.
```

## Calls made while writing, for the maintainer

Each is the design sitting's call, made inside the maintainer's decisions. The task that carries each follows
the call.

1. **One session (set-up, D4).** The maintainer leaves the rulings to the run controller, and the plan has
   seven tasks, so `CLAUDE.md` puts it in one session. No task is a fan-out, so the drafting lane stays idle;
   gate 7 runs only in this mode.
2. **What « exactly the named rows » reads (task 1, D1).** The ids are compared with the `id`s in the
   batches' `input.json`, in any order. Split loads neither the kind nor the course for a folder it has
   already cut, so an id the kind does not cut is reported there as « named but not in its batches ». Without
   ids, such a folder prints its lines as before: a fan-out task that runs its own `Split:` line again still
   gets its batches, and `one-session.md` stays unchanged.
3. **Thirteen sites, not eleven (task 2).** #107 lists eleven reasons. Two more are given for a failed
   `oneLine`, of `edited` (`examples.js:128`) and of a word of `any` (`open.js:122`), so they change too. The
   wording is `explain.js`'s, « with no space at either end ». Three fields, `ask`, `model` and a need's
   `what`, had no check with a padded text; task 2 adds one each, so every site has a check that fails on the
   old code.
4. **The names of #110's kit half (task 3).** `strayQuotes(s, l, also)` in `test/lib/text.js`, and
   `tokenFreeWords(s)` in `test/lib/dutch.js`.
   - #110 says `FREE` holds words that can follow « ton ». It holds the opposite, so the names follow the
     code: `NEVER_AFTER_YOUR`, and `mayBeYour`, `free`'s negation.
   - The straight quote keeps its two reasons. `open.js` refuses it in a pair with the quotes reason;
     `explain.js` refuses it in a note with its own. Folding them would change what a drafter reads.
   - `gwhyDrie` becomes `gwhyThree`.
5. **One helper for the day n days back, and the zone written once (task 4, D2).**
   - `NL.util.daysBack(n)` returns a `Date`, not a key, so the chart takes the key and the weekday from the
     same local day. The chart's day objects carry `weekday`; they are built at each render and never stored.
   - §12 of `test/journey.js` runs on the real clock and cannot be held at an instant. Its fix is proved
     through the helper, which the new section checks at the four instants.
   - The new section sets a zone as `test/engine.js` does, and `test/pace.js` holds a third copy of the
     offsets. `TESTING.md` puts what several suites do in `test/lib/`, so task 4 writes `test/lib/zone.js`
     and folds the two copies: a refactor inside a fix's task, whose check is those suites staying green.
6. **The self-rating after the third try (task 5).** `retryThenRate` showed it when `!sp.ok && sp.tries >= 3`;
   it now shows it when `!sp.ok` and no retry button is left. The two are the same because `sp.tries` is a
   number in every speech state. The nazeggen's options become a constant again, `SHADOW`, since `micPanel`
   now writes the `aria-label`s when it renders, in the display language. `micPanel`'s `o` becomes `screen`.
7. **#108's note gives one sentence (task 6, D3).** #108 also names sentences with « Belg » and « leraar ».
   Whether `ikengij` accepts those depends on the item Check reads them for, since Check accepts an item's own
   words. The note gives « Zijt gij hier? », which has nothing ahead and nothing unmet at `ikengij` on the real
   course, whatever the item.
8. **A learner pass before the maintainer's check (gate 7).** On 25 October 2026 the maintainer asked for a
   hands-on learner pass in a real browser before every learner's check; the follow-ups run's gate 13 ran
   one. Tasks 4 and 5 change what a learner meets, so this plan has one pass, after the last code-lane task.
   If the closing review adds a task that changes `src/`, the pass runs again (the run file's
   `Learner pass:` line).

Left out of this plan, for the maintainer:
- **The Settings sheet's jump, #103.** Still open, and no task here.
- **The tickets' labels.** All five carry `needs-triage`, and the run does not relabel them.

## The run

### Task 1: Split, given ids in a folder already cut, compares
Class: mechanical
Ticket: #106
Promises: none
Why: decision D1. Split never rewrites a kind folder it has already cut, and given ids it cuts only those
rows (#93). When both rules meet, `kit.split` returns the folder's `split.txt` lines before it looks at the
ids, with `ok: true` (`tools/content/lib/kit.js:82`): a second fan-out of the same kind, or a redraft started
in the first one's folder, gets the earlier batches as if they held the named rows, and the named rows are
never cut. After this task, Split given ids on a folder that already has `split.txt` reads the ids its
batches hold. When they are exactly the named ids, in any order, it prints the folder's lines and exits 0, as
before. Otherwise it prints one line, `fail <kind> -: already split with other rows`, followed by `; named but
not in its batches: <ids>` and/or `; in its batches but not named: <ids>`, exits 1 and writes nothing. Without
ids, an already-cut folder prints its lines as before. `design-sitting.md`'s Split contract says so (#106's
acceptance). No later task uses `alreadySplit` or `listed`; tasks 2 and 3 edit `kit.js` and
`test/tools/fanout.js` below the lines this task adds, and quote them by their text.

Files:
- Modify: `tools/content/lib/kit.js` (after `writeJson`, line 73; `split`'s comment and its first lines,
  75–82; the `keep` line, 103; a new function after `split`, which ends at line 119; `readKind`, line 330)
- Modify: `tools/content/split.js` (its header comment, lines 4–5)
- Modify: `docs/agents/plan-runs/design-sitting.md` (the Split contract, « The fan-out form », lines 87–93)
- Modify: `TESTING.md` (the `tools/fanout.js` row, line 26)
- Test: `test/tools/fanout.js` (section 3, Split, after line 145)

Lines are as of `f7376ac`.

Notes:
- **Compare reads the batches, not the source.** The ids are compared with the `id`s of each listed batch's
  `input.json`, so Split loads neither the kind nor the course for a folder already cut. An id the kind does
  not cut is therefore reported, on such a folder, as « named but not in its batches », not as « not a row the
  kind's split cuts ». A batch whose `input.json` is missing or not JSON throws, and `split.js` already turns a
  throw into `fail <kind> -: <message>` and exit 1.
- **`one-session.md` stays true.** Its « Starting a fan-out task », step 2, says that on a kind that already has
  batches Split « writes nothing and prints them again ». A fan-out task runs the same `Split:` line each time,
  so its own folder holds exactly its ids, and Split still prints them again. Only a Split naming other ids now
  fails, which the drafting lane reports like any `fail` line. That file is unchanged.
- **`listed`** reads `split.txt` for both `alreadySplit` and `readKind`, which read it the same way before.
- **The two passing checks.** Step 1 adds five checks. The same ids in another order, and « nothing is
  rewritten », already pass on the old code: they hold the behaviour this task keeps. The other three fail.
- **The proof.** These steps ran on a copy of `f7376ac`. Step 2 printed the three `FAIL` lines below and
  `451 contrôles, 3 ÉCHEC(S)`; step 4 printed `451 contrôles, KIT CONFORME` (446 before the task).

- [ ] **Step 1: Write the failing test.** In `test/tools/fanout.js`, section 3, after
  ```js
    same([run('split.js', [TMP, REFUS, 'thuis:w1', 'overleven:w0', 'zzz:w9']), fs.existsSync(REFUS)], [{ code: 1, lines: [
      'fail essai overleven:w0: not a row the kind\'s split cuts',
      'fail essai zzz:w9: not a row the kind\'s split cuts'
    ] }, false], 'Split refuse un id que le genre ne coupe pas, et n\'écrit rien');
  ```
  add
  ```js
    /* Des ids nommés sur un dossier déjà coupé : ses lots doivent tenir exactement ces lignes, dans
       n'importe quel ordre. Alors Split redit ses lots ; sinon il nomme la différence, sans rien écrire. */
    const seul = () => ['split.txt', 'een/input.json', 'twee/input.json'].map(f => text(path.join(SEUL, f)));
    const seulAvant = seul();
    same(run('split.js', [TMP, SEUL, 'bakker:w22', 'thuis:w1']), { code: 0, lines: ['een 1', 'twee 1'] },
      'un dossier déjà coupé pour les mêmes ids, dans un autre ordre, redit ses lots');
    same(run('split.js', [TMP, SEUL, 'thuis:w1', 'thuis:w24']), { code: 1, lines: [
      'fail essai -: already split with other rows; named but not in its batches: thuis:w24; in its batches but not named: bakker:w22'
    ] }, 'un dossier déjà coupé pour d\'autres ids nomme la différence');
    same(run('split.js', [TMP, SEUL, 'thuis:w1', 'bakker:w22', 'thuis:w24']), { code: 1, lines: [
      'fail essai -: already split with other rows; named but not in its batches: thuis:w24'
    ] }, 'un id nommé que ses lots ne tiennent pas est refusé');
    same(run('split.js', [TMP, SEUL, 'thuis:w1']), { code: 1, lines: [
      'fail essai -: already split with other rows; in its batches but not named: bakker:w22'
    ] }, 'une ligne de ses lots qui n\'est pas nommée est refusée');
    same(seul(), seulAvant, 'un dossier déjà coupé n\'est pas récrit');
  ```
  `SEUL` is the folder the check before it cut with `thuis:w1` and `bakker:w22`: `een` holds `bakker:w22`,
  `twee` holds `thuis:w1`.

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exactly three `FAIL` lines, and the last line `451 contrôles, 3 ÉCHEC(S)`:
  ```
    FAIL: un dossier déjà coupé pour d'autres ids nomme la différence : {"code":0,"lines":["een 1","twee 1"]}, attendu {"code":1,"lines":["fail essai -: already split with other rows; named but not in its batches: thuis:w24; in its batches but not named: bakker:w22"]}
    FAIL: un id nommé que ses lots ne tiennent pas est refusé : {"code":0,"lines":["een 1","twee 1"]}, attendu {"code":1,"lines":[…thuis:w24"]}
    FAIL: une ligne de ses lots qui n'est pas nommée est refusée : {"code":0,"lines":["een 1","twee 1"]}, attendu {"code":1,"lines":[…bakker:w22"]}
  ```

- [ ] **Step 3: Implement.** In `tools/content/lib/kit.js`, replace
  ```js
  const writeJson = (file, v) => fs.writeFileSync(file, JSON.stringify(v, null, 2) + '\n');

  /* Split : la source coupée en lots, une fois. Un dossier déjà coupé (split.txt) n'est pas
     récrit : ses lignes sont imprimées telles quelles. Un lot vide n'est pas écrit, et
     split.txt, écrit en dernier, ne liste que les lots écrits. Des ids nommés ne gardent que
     leurs lignes, dans le lot où le genre les met : c'est ainsi que quelques lignes déjà
     fusionnées se récrivent. Un id que le genre ne coupe pas est refusé. */
  function split(repo, kindDir, ids) {
    const name = path.basename(kindDir), list = path.join(kindDir, 'split.txt');
    if (fs.existsSync(list)) return { ok: true, lines: fs.readFileSync(list, 'utf8').split('\n').filter(Boolean) };
  ```
  with
  ```js
  const writeJson = (file, v) => fs.writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
  /* Les lignes de split.txt, « <lot> <lignes> » chacune. */
  const listed = list => fs.readFileSync(list, 'utf8').split('\n').filter(Boolean);

  /* Split : la source coupée en lots, une fois. Un dossier déjà coupé (split.txt) n'est pas
     récrit (alreadySplit). Un lot vide n'est pas écrit, et split.txt, écrit en dernier, ne
     liste que les lots écrits. Des ids nommés ne gardent que leurs lignes, dans le lot où le
     genre les met : c'est ainsi que quelques lignes déjà fusionnées se récrivent. Un id que le
     genre ne coupe pas est refusé. */
  function split(repo, kindDir, ids) {
    const name = path.basename(kindDir), list = path.join(kindDir, 'split.txt');
    const keep = ids && ids.length ? new Set(ids) : null;
    if (fs.existsSync(list)) return alreadySplit(kindDir, keep);
  ```
  then replace
  ```js
    const keep = ids && ids.length ? new Set(ids) : null;
    if (keep) keep.forEach(id => { if (!seen.has(id)) lines.push('fail ' + name + ' ' + id + ': not a row the kind\'s split cuts'); });
  ```
  with
  ```js
    if (keep) keep.forEach(id => { if (!seen.has(id)) lines.push('fail ' + name + ' ' + id + ': not a row the kind\'s split cuts'); });
  ```
  then replace
  ```js
    fs.writeFileSync(list, lines.map(l => l + '\n').join(''));
    return { ok: true, lines };
  }

  /* Un fichier JSON du lot : un tableau, ou une ligne `fail`. */
  ```
  with
  ```js
    fs.writeFileSync(list, lines.map(l => l + '\n').join(''));
    return { ok: true, lines };
  }

  /* Un dossier déjà coupé : rien n'est écrit, et ses lignes sont redites. Des ids nommés doivent
     être exactement les lignes de ses lots, dans n'importe quel ordre ; sinon une ligne fail dit
     la différence. */
  function alreadySplit(kindDir, keep) {
    const name = path.basename(kindDir), lines = listed(path.join(kindDir, 'split.txt'));
    if (!keep) return { ok: true, lines };
    const held = [];
    lines.forEach(l => JSON.parse(fs.readFileSync(path.join(kindDir, l.split(' ')[0], 'input.json'), 'utf8')).forEach(r => held.push(r.id)));
    const missing = Array.from(keep).filter(id => held.indexOf(id) < 0), unnamed = held.filter(id => !keep.has(id));
    if (!missing.length && !unnamed.length) return { ok: true, lines };
    return { ok: false, lines: ['fail ' + name + ' -: already split with other rows' +
      (missing.length ? '; named but not in its batches: ' + missing.join(' ') : '') +
      (unnamed.length ? '; in its batches but not named: ' + unnamed.join(' ') : '')] };
  }

  /* Un fichier JSON du lot : un tableau, ou une ligne `fail`. */
  ```
  then, in `readKind`, replace
  ```js
    const batches = fs.readFileSync(list, 'utf8').split('\n').filter(Boolean).map(l => l.split(' ')[0]);
  ```
  with
  ```js
    const batches = listed(list).map(l => l.split(' ')[0]);
  ```
  In `tools/content/split.js`, replace
  ```js
     Des ids nommés ne coupent que leurs lignes. Imprime « <lot> <lignes> » par lot ; sur un
     dossier déjà coupé, n'écrit rien et imprime ses lignes. */
  ```
  with
  ```js
     Des ids nommés ne coupent que leurs lignes. Imprime « <lot> <lignes> » par lot ; sur un
     dossier déjà coupé, n'écrit rien et imprime ses lignes, ou, si des ids nommés ne sont pas
     exactement ceux de ses lots, une ligne fail qui dit la différence. */
  ```
  In `docs/agents/plan-runs/design-sitting.md`, replace
  ```
    batch left empty, and refuses an id the kind does not cut: that is how a few rows already merged are
    redrafted, by a fan-out task whose Split names them.
  ```
  with
  ```
    batch left empty, and refuses an id the kind does not cut: that is how a few rows already merged are
    redrafted, by a fan-out task whose Split names them. Given ids on a kind folder that already has batches,
    it prints their lines only when those batches hold exactly the named rows, in any order; otherwise it
    prints one `fail` line naming the difference (named rows its batches lack, rows they hold that were not
    named) and exits 1.
  ```
  In `TESTING.md`, in the `tools/fanout.js` row, replace
  ```
  et refuse, sans rien écrire, un id que le genre ne coupe pas)
  ```
  with
  ```
  et refuse, sans rien écrire, un id que le genre ne coupe pas ou, sur un dossier déjà coupé, des ids autres que les lignes de ses lots)
  ```

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: no `FAIL` line, and the last line `451 contrôles, KIT CONFORME`.

- [ ] **Step 5: Commit.**
  ```
  git add tools/content/lib/kit.js tools/content/split.js docs/agents/plan-runs/design-sitting.md TESTING.md test/tools/fanout.js
  git commit -m "fix(content): Split, given ids in a folder it has already cut, prints its batches only when they hold exactly those rows, and names the difference otherwise (#106)"
  ```
  No build: nothing under `src/` changed.

Done when:
- `node tools/content/split.js . <dir>/essai thuis:w1 thuis:w24`, on a folder cut for `thuis:w1` and
  `bakker:w22`, prints the `fail` line naming both differences, exits 1 and rewrites nothing; the same ids in
  another order print the folder's lines. The three refusals failed before step 3 (#106's acceptance).
- `design-sitting.md`'s Split contract says what Split does with ids in a folder it has already cut.
- `node test/tools/fanout.js .` prints `451 contrôles, KIT CONFORME`.

### Task 2: the kit's one-line reasons say a blank at either end is refused
Class: mechanical
Ticket: #107
Promises: none
Why: #107. Task 5 of the follow-ups plan (#95) gave the kit one one-line test, `oneLine` in `test/lib/text.js`,
which also refuses a text with a blank at either end. Three reasons in `tools/content/lib/explain.js` say so
(lines 139, 189 and 213 at `f7376ac`, « with no space at either end »); the others still say only « on one
line ». A drafter whose `en` ends with a space reads « nl, gap, en and fr are each a string on one line »,
looks at a text that is on one line, and cannot see what is wrong; a batch controller passes the reason on to
the retry as it is. After this task every reason in `tools/content/` given for a failed `oneLine` says, in
`explain.js`'s words, that a blank at either end is refused. The test is unchanged; only the wording changes.
No later task reads these strings. Task 3 edits `open.js` and `flemish.js` away from the lines this task
changes.

Files:
- Modify: `tools/content/lib/kit.js` (line 153, `unsure`)
- Modify: `tools/content/kinds/examples-gen.js` (lines 49 and 57)
- Modify: `tools/content/kinds/examples.js` (lines 105, 118 and 128)
- Modify: `tools/content/kinds/flemish.js` (line 228)
- Modify: `tools/content/kinds/open.js` (lines 108, 109, 116, 117, 122 and 171)
- Test: `test/tools/fanout.js` (lines 206, 210, 616, 792, 802, 807–809, 811, 813, 817, 932, 934, 938–939,
  1006–1010, 1039–1040, 1043 and 1057, and three checks added after line 1010)

Lines are as of `f7376ac`; after task 1, `kit.js:153` is at 170 and each `fanout.js` line is 16 further down.

Notes:
- **Thirteen sites, two more than #107 lists.** The ticket names eleven. `examples.js:128` (« take it as
  written, or say why in edited ») and `open.js:122` (« any is a list of words or runs of words ») are also
  given for a failed `oneLine`, of `edited` and of a word of `any`, so they change too. `explain.js:139`, `:189` and
  `:213` (the reason `:225` gives) already name the rule, and are unchanged.
  `kit.js:165`, which matches `oneLine` in a `grep`, is the verdict's regex, not a reason.
- **A padded text for every site.** Ten sites already had a check that gives a text with a blank before or
  after it: `unsure` (fanout.js:209), `be` (:615), the sentence fields and `skip` and `edited` of `examples`
  (:809, :811, :812), `examples-gen`'s sentence and verdict (:932, :933), `miss` and `any` of `open`
  (:1009, :1010), and `right` (« une bonne réponse sans blanc autour »). Their expected reason changes, so each
  fails on the old code. `open`'s `ask`, `model` and a need's `what` had none: step 1 adds one for each. The
  ticket's « closing review » `be` case was added before `f7376ac`; it is line 615.
- **Step 1 uses `sed`.** The 24 changed lines carry nine reasons, each changed the same way everywhere in the
  file, so nine substitutions do it. The command was run on the copy and gives exactly the diff of the proof.
- **The proof.** These steps ran on a copy of `f7376ac` with task 1 applied. Step 2 printed the twenty-seven
  `FAIL` lines below and `454 contrôles, 27 ÉCHEC(S)`; step 4 printed `454 contrôles, KIT CONFORME` (451 after
  task 1).

- [ ] **Step 1: Write the failing test.** In `test/tools/fanout.js`, change each old reason to its new wording:
  ```
  sed -i -e "s/unsure is a reason on one line'/unsure is a reason on one line with no space at either end'/g" \
    -e "s/be is a form on one line, or null'/be is a form on one line with no space at either end, or null'/g" \
    -e "s/says why in skip, on one line'/says why in skip, on one line with no space at either end'/g" \
    -e "s/or say why in edited'/or say why in edited, on one line with no space at either end'/g" \
    -e "s/each a string on one line'/each a string on one line with no space at either end'/g" \
    -e "s/en and fr of nl, each on one line'/en and fr of nl, each on one line with no space at either end'/g" \
    -e "s/each one line'/each one line with no space at either end'/g" \
    -e "s/one line of Dutch'/one line of Dutch with no space at either end'/g" \
    -e "s/runs of words'/runs of words, each with no space at either end'/g" \
    test/tools/fanout.js
  ```
  `git diff --stat test/tools/fanout.js` then shows `24 insertions(+), 24 deletions(-)`. Then, in the `open`
  section, after
  ```js
        [r => { r.need[1].any[1] = 'twee '; }, ['need 2: any is a list of words or runs of words, each with no space at either end'], 'un mot de any sans blanc autour'],
  ```
  add
  ```js
        [r => { r.ask.fr += ' '; }, ['ask is { "fr": …, "en": … }, each one line with no space at either end'], 'une paire sans blanc autour'],
        [r => { r.model = ' ' + r.model; }, ['model is one line of Dutch with no space at either end'], 'l\'exemple sans blanc autour'],
        [r => { r.need[1].what.en += ' '; }, ['need 2: what is { "fr": …, "en": … }, each one line with no space at either end'], 'le what d\'un besoin sans blanc autour'],
  ```

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: exactly twenty-seven `FAIL` lines, and the last line `454 contrôles, 27 ÉCHEC(S)`:
  ```
    FAIL: une ligne : son empreinte, ses champs, « unsure » sur une ligne, puis les règles du genre : ["fail draft.json overleven:w1: stamp 00000000, …", …]
    FAIL: « unsure » tient sur une ligne comme tout texte du kit : ni \r, ni blanc autour : ["fail draft.json overleven:w2: unsure is a reason on one line", …]
    FAIL: be est une forme sur une ligne : ni blanc devant ou derrière, ni \r : [["be is a form on one line, or null"], …]
    FAIL: aucune phrase : skip dit pourquoi : ["a row with no sentence says why in skip, on one line"], attendu […]
    FAIL: une traduction changée sans raison, non : ["sentence 1: en « She speaks English very well. » … or say why in edited"], attendu […]
    FAIL: une traduction sur plusieurs lignes, non : ["sentence 1: nl, gap, en and fr are each a string on one line"], attendu […]
    FAIL: un trou vide, non : ["sentence 1: nl, gap, en and fr are each a string on one line"], attendu […]
    FAIL: une traduction avec un blanc autour, non, même avec sa raison : ["sentence 1: nl, gap, en and fr are each a string on one line"], attendu […]
    FAIL: skip sans blanc autour : ["a row with no sentence says why in skip, on one line"], attendu […]
    FAIL: edited sans blanc autour : ["sentence 1: en « She speaks English very well. » … or say why in edited"], attendu […]
    FAIL: une traduction française changée sans raison, non : ["sentence 1: fr « Elle parle très bien anglais. » … or say why in edited"], attendu […]
    FAIL: chaque champ sans blanc autour : ["sentence: nl, gap, en and fr are each a string on one line"], attendu […]
    FAIL: la traduction du lecteur sans blanc autour : ["a verdict carries the reader's own en and fr of nl, each on one line"], attendu […]
    FAIL: le verdict porte la traduction du lecteur : {"code":1,"lines":["ok input.json 2 rows","ok draft.json 2 rows","fail review.json tijd:w3: … each on one line", …]}, …
    FAIL: Check : chaque besoin a sa réponse manquée : ["need 1: miss is one line of Dutch"], attendu […]
    FAIL: Check : une paire tient sur une ligne : pas de \r : ["ask is { \"fr\": …, \"en\": … }, each one line"], attendu […]
    FAIL: Check : l'exemple tient sur une ligne : pas de \r : ["model is one line of Dutch"], attendu […]
    FAIL: Check : une réponse manquée sans blanc autour : ["need 1: miss is one line of Dutch"], attendu […]
    FAIL: Check : un mot de any sans blanc autour : ["need 2: any is a list of words or runs of words"], attendu […]
    FAIL: Check : une paire sans blanc autour : ["ask is { \"fr\": …, \"en\": … }, each one line"], attendu […]
    FAIL: Check : l'exemple sans blanc autour : ["model is one line of Dutch"], attendu […]
    FAIL: Check : le what d'un besoin sans blanc autour : ["need 2: what is { \"fr\": …, \"en\": … }, each one line"], attendu […]
    FAIL: Check : ask est une paire : ["ask is { \"fr\": …, \"en\": … }, each one line"]
    FAIL: Check : l'exemple est une ligne : ["model is one line of Dutch"]
    FAIL: Check : any est une liste de mots : ["need 2: any is a list of words or runs of words"]
    FAIL: un keep sans ses deux réponses est refusé, une contestation qui en porte aussi : [["a keep carries right: two right answers of the reader's own, each one line of Dutch"], …]
    FAIL: une bonne réponse sans blanc autour : ["a keep carries right: two right answers of the reader's own, each one line of Dutch"], attendu […]
  ```

- [ ] **Step 3: Implement.** In `tools/content/lib/kit.js`, replace
  ```js
    if ('unsure' in row && !oneLine(row.unsure)) out.push('fail ' + file + ' ' + row.id + ': unsure is a reason on one line');
  ```
  with
  ```js
    if ('unsure' in row && !oneLine(row.unsure)) out.push('fail ' + file + ' ' + row.id + ': unsure is a reason on one line with no space at either end');
  ```
  In `tools/content/kinds/examples-gen.js`, replace
  ```js
    if (!FIELDS.every(k => oneLine(d[k]))) return ['sentence: nl, gap, en and fr are each a string on one line'];
  ```
  with
  ```js
    if (!FIELDS.every(k => oneLine(d[k]))) return ['sentence: nl, gap, en and fr are each a string on one line with no space at either end'];
  ```
  then replace
  ```js
  const checkVerdict = v => (oneLine(v.en) && oneLine(v.fr) ? [] : ['a verdict carries the reader\'s own en and fr of nl, each on one line']);
  ```
  with
  ```js
  const checkVerdict = v => (oneLine(v.en) && oneLine(v.fr) ? [] : ['a verdict carries the reader\'s own en and fr of nl, each on one line with no space at either end']);
  ```
  In `tools/content/kinds/examples.js`, replace
  ```js
    if (!list.length && !oneLine(row.skip)) out.push('a row with no sentence says why in skip, on one line');
  ```
  with
  ```js
    if (!list.length && !oneLine(row.skip)) out.push('a row with no sentence says why in skip, on one line with no space at either end');
  ```
  then replace
  ```js
      if (![d.nl, d.gap, d.en, d.fr].every(oneLine)) { out.push(at + ': nl, gap, en and fr are each a string on one line'); return; }
  ```
  with
  ```js
      if (![d.nl, d.gap, d.en, d.fr].every(oneLine)) { out.push(at + ': nl, gap, en and fr are each a string on one line with no space at either end'); return; }
  ```
  then replace
  ```js
      if (changed.length && !oneLine(d.edited)) changed.forEach(c => out.push(at + ': ' + c + ': take it as written, or say why in edited'));
  ```
  with
  ```js
      if (changed.length && !oneLine(d.edited)) changed.forEach(c => out.push(at + ': ' + c + ': take it as written, or say why in edited, on one line with no space at either end'));
  ```
  In `tools/content/kinds/flemish.js`, replace
  ```js
    if (!oneLine(be)) return ['be is a form on one line, or null'];
  ```
  with
  ```js
    if (!oneLine(be)) return ['be is a form on one line with no space at either end, or null'];
  ```
  In `tools/content/kinds/open.js`, replace
  ```js
    if (!pair(row.ask)) out.push('ask is { "fr": …, "en": … }, each one line');
    if (!oneLine(row.model)) out.push('model is one line of Dutch');
  ```
  with
  ```js
    if (!pair(row.ask)) out.push('ask is { "fr": …, "en": … }, each one line with no space at either end');
    if (!oneLine(row.model)) out.push('model is one line of Dutch with no space at either end');
  ```
  then replace
  ```js
      if (!pair(n.what)) out.push(at + ': what is { "fr": …, "en": … }, each one line');
      if (!oneLine(n.miss)) out.push(at + ': miss is one line of Dutch');
  ```
  with
  ```js
      if (!pair(n.what)) out.push(at + ': what is { "fr": …, "en": … }, each one line with no space at either end');
      if (!oneLine(n.miss)) out.push(at + ': miss is one line of Dutch with no space at either end');
  ```
  then replace
  ```js
      if (n.any !== undefined && (!Array.isArray(n.any) || !n.any.length || !n.any.every(oneLine))) out.push(at + ': any is a list of words or runs of words');
  ```
  with
  ```js
      if (n.any !== undefined && (!Array.isArray(n.any) || !n.any.length || !n.any.every(oneLine))) out.push(at + ': any is a list of words or runs of words, each with no space at either end');
  ```
  then replace
  ```js
    if (!Array.isArray(r) || r.length !== 2 || !r.every(oneLine)) return ['a keep carries right: two right answers of the reader\'s own, each one line of Dutch'];
  ```
  with
  ```js
    if (!Array.isArray(r) || r.length !== 2 || !r.every(oneLine)) return ['a keep carries right: two right answers of the reader\'s own, each one line of Dutch with no space at either end'];
  ```

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/tools/fanout.js .
  ```
  Expected: no `FAIL` line, and the last line `454 contrôles, KIT CONFORME`.

- [ ] **Step 5: Commit.**
  ```
  git add tools/content/lib/kit.js tools/content/kinds/examples-gen.js tools/content/kinds/examples.js tools/content/kinds/flemish.js tools/content/kinds/open.js test/tools/fanout.js
  git commit -m "fix(content): every one-line reason in the kit says that a blank at either end is refused, as the explanations' reasons already did (#107)"
  ```
  No build: nothing under `src/` changed.

Done when:
- `git grep -n "oneLine" -- tools/content` shows no reason given for a failed `oneLine` that says « on one
  line » or « one line » without « with no space at either end » (#107's acceptance).
- Each of the thirteen reasons is expected, in `test/tools/fanout.js`, for a text with a blank at either end;
  those checks failed before step 3.
- `node test/tools/fanout.js .` prints `454 contrôles, KIT CONFORME`.

### Task 3: the kit's half of #110: one quotes check, one helper for an item's Dutch words, two names
Class: mechanical
Ticket: #110
Promises: none
Why: #110's four kit items, from the branch review of PR #109. (a) The other-language quotes check is written
twice: `strays` in `tools/content/kinds/open.js:46–47`, with « quotes with … only » built at `:88`, and
`checkNote` in `tools/content/lib/explain.js:147–148`. #95 meant the kit's text helpers to be written once, in
`test/lib/text.js`. (b) `words(untoken(x))`, an item's Dutch read word by word with its `{tokens}` out, is
written six times in `open.js` (lines 57, 64, 92, 96, 157 and 160; its comment at line 17 makes the ticket's
seven) and once in `explain.js:177`. (c) `FREE` and `free(rest)` (`tools/content/kinds/flemish.js:88–101`) do
not say what they hold. (d) `gwhyDrie` (`test/tools/fanout.js:922`) mixes Dutch into an English name. After
this task `test/lib/text.js` exports `strayQuotes(s, l, also)`, the reason a text of language `l` writes the
other language's quotes or one of the signs `also`, '' otherwise, and `test/lib/dutch.js` exports
`tokenFreeWords(s)`; both callers use them. `FREE` is `NEVER_AFTER_YOUR`, `free` is `mayBeYour`, its negation,
and `gwhyDrie` is `gwhyThree`. This is a refactor: no reason, no output and no check changes, so the suite
staying green is its check, and there is no red step. #110's other items (the retry rule, the microphone
panel's attributes, `graded`, `micPanel`'s `o`) are the app's and are task 5's. No later task uses
`strayQuotes` or `tokenFreeWords`.

Files:
- Modify: `test/lib/text.js` (its header, lines 4 and 10; `quotes`' comment, line 21; the export, line 43)
- Modify: `test/lib/dutch.js` (its header, lines 5–6; the requires, line 13; `words`, line 17; the export,
  line 29)
- Modify: `tools/content/kinds/open.js` (lines 17, 19–20, 46–47, 57, 64, 88, 92, 96, 157 and 160)
- Modify: `tools/content/lib/explain.js` (lines 33–34, 147–148 and 177)
- Modify: `tools/content/kinds/flemish.js` (lines 88–101)
- Modify: `test/tools/fanout.js` (lines 922–927)

Lines are as of `f7376ac`. Task 2 changes `open.js:108–171` and `flemish.js:228`, away from these; in
`fanout.js` this task's lines are 16 further down after task 1.

Notes:
- **The straight quote stays where each caller had it.** `open.js` refuses `"` in a pair with the same
  « quotes with … only » reason, so it passes `'"'` as `also`. `explain.js` refuses it in a note with a reason of
  its own (« holds <, a newline or a straight quote " », line 146), so it passes nothing. Folding the two
  reasons into one would change what a drafter reads; this task changes no reason.
- **`QUOTES` stays exported.** After this task no file outside `test/lib/text.js` reads it, but it is the
  header's documented table of each language's quotes; `untoken` stays exported for `test/lib/dutch.js`.
- **`dutch.js` now requires `text.js`.** `text.js` requires nothing, so there is no cycle. `test/lang.js` reads
  `dutch.js` and `test/content.js` reads `text.js`, hence step 4 runs them too.
- **`NEVER_AFTER_YOUR`, not the ticket's description.** #110 says `FREE` holds « a word that can follow
  « ton » ». It holds the opposite: after one of its words « je » cannot be « ton », so the rule may write
  « ge ». The names follow the code. `mayBeYour(rest)` is `!free(rest)` by De Morgan, so its one caller drops
  its `!`.
- **Step 2 uses `sed`** for the seven `words(untoken(…))`, whose inner argument never holds a parenthesis.
- **The proof.** These steps ran on a copy of `f7376ac` with tasks 1 and 2 applied. Step 4 printed
  `454 contrôles, KIT CONFORME`, `23173 contrôles, LANGUE CONFORME` and `2077 contrôles, CONTENU CONFORME`,
  the same three counts as before the task.

- [ ] **Step 1: Write each helper once, in `test/lib/`.** In `test/lib/text.js`, replace
  ```js
       const { QUOTES, oneLine, sig, untoken, quotes } = require('./lib/text');
  ```
  with
  ```js
       const { QUOTES, oneLine, sig, untoken, quotes, strayQuotes } = require('./lib/text');
  ```
  then replace
  ```js
       quotes(s, l)    les citations d'un texte de langue l : { quoted, outside, why }, voir plus bas */
  ```
  with
  ```js
       quotes(s, l)    les citations d'un texte de langue l : { quoted, outside, why }, voir plus bas
       strayQuotes(s, l, also)
                       la raison qu'un texte de langue l écrit les guillemets de l'autre langue,
                       ou l'un des signes also ; '' sinon */
  ```
  then replace
  ```js
     l'autre langue ne comptent pas ici : chaque appelant dit lui-même ce qu'il en fait. */
  ```
  with
  ```js
     l'autre langue ne comptent pas ici : strayQuotes les lit. */
  ```
  then replace
  ```js
  module.exports = { QUOTES, oneLine, sig, untoken, quotes };
  ```
  with
  ```js
  /* Chaque langue ne cite qu'avec ses guillemets : la raison, en anglais comme celles du kit,
     qu'un texte de langue l écrit ceux de l'autre langue ou l'un des signes also, '' sinon.
     open.js passe le guillemet droit dans also ; explain.js le refuse d'une autre raison. */
  const strayQuotes = (s, l, also) => (QUOTES[l === 'fr' ? 'en' : 'fr'].concat(also || []).some(m => s.indexOf(m) >= 0) ?
    l + ' quotes with ' + QUOTES[l].join(' ') + ' only' : '');

  module.exports = { QUOTES, oneLine, sig, untoken, quotes, strayQuotes };
  ```
  In `test/lib/dutch.js`, replace
  ```js
       const { dutchWords, words } = require('./lib/dutch');
       words(s)          les mots d'un texte, en minuscules, séparés par tout ce qui n'est ni lettre ni chiffre
  ```
  with
  ```js
       const { dutchWords, words, tokenFreeWords } = require('./lib/dutch');
       words(s)          les mots d'un texte, en minuscules, séparés par tout ce qui n'est ni lettre ni chiffre
       tokenFreeWords(s) les mots d'un texte, ses {jetons} ôtés : comme le kit lit le néerlandais
                         d'un texte
  ```
  then replace
  ```js
  const tree = require('./tree');
  ```
  with
  ```js
  const tree = require('./tree');
  const { untoken } = require('./text');
  ```
  then replace
  ```js
  const words = s => String(s).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  ```
  with
  ```js
  const words = s => String(s).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const tokenFreeWords = s => words(untoken(s));
  ```
  then replace
  ```js
  module.exports = { DUTCH_KEYS, dutchWords, words };
  ```
  with
  ```js
  module.exports = { DUTCH_KEYS, dutchWords, words, tokenFreeWords };
  ```

- [ ] **Step 2: The kit calls them.** Fold the seven `words(untoken(…))`, and `open.js`'s comment that names
  it:
  ```
  sed -i 's/words(untoken(\([^()]*\)))/tokenFreeWords(\1)/g' tools/content/kinds/open.js tools/content/lib/explain.js
  ```
  `git diff --stat tools/` then shows `open.js | 14` and `explain.js | 2`: seven lines and one. Then, in
  `tools/content/kinds/open.js`, replace
  ```js
  const { words } = require('../../../test/lib/dutch');
  const { QUOTES, oneLine, untoken, quotes } = require('../../../test/lib/text');
  ```
  with
  ```js
  const { tokenFreeWords } = require('../../../test/lib/dutch');
  const { oneLine, quotes, strayQuotes } = require('../../../test/lib/text');
  ```
  then replace
  ```js
    ['fr', 'en'].every(l => oneLine(v[l]));
  /* Un côté qui écrit les guillemets de l'autre langue, ou le guillemet droit. */
  const strays = (s, l) => QUOTES[l === 'fr' ? 'en' : 'fr'].concat('"').some(m => s.indexOf(m) >= 0);
  ```
  with
  ```js
    ['fr', 'en'].every(l => oneLine(v[l]));
  ```
  then replace
  ```js
    const bad = ['fr', 'en'].map(l => [l, strays(v[l], l) ? l + ' quotes with ' + QUOTES[l].join(' ') + ' only' : q[l].why]).filter(x => x[1]).map(x => where + ': ' + x[1]);
  ```
  with
  ```js
    const bad = ['fr', 'en'].map(l => strayQuotes(v[l], l, '"') || q[l].why).filter(Boolean).map(r => where + ': ' + r);
  ```
  In `tools/content/lib/explain.js`, replace
  ```js
  const { dutchWords, words } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));
  const { QUOTES, oneLine, sig, untoken, quotes } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));
  ```
  with
  ```js
  const { dutchWords, words, tokenFreeWords } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));
  const { oneLine, sig, quotes, strayQuotes } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));
  ```
  then replace
  ```js
      const other = QUOTES[l === 'en' ? 'fr' : 'en'];
      if (s.indexOf(other[0]) >= 0 || s.indexOf(other[1]) >= 0) { why.push('note.' + l + ' quotes with ' + QUOTES[l].join(' ') + ' only'); unread.push(l); }
  ```
  with
  ```js
      const stray = strayQuotes(s, l);
      if (stray) { why.push('note.' + stray); unread.push(l); }
  ```
  `words` stays in `explain.js`'s require: lines 159 and 176 read it.

- [ ] **Step 3: Two names say what they hold.** In `tools/content/kinds/flemish.js`, replace
  ```js
     mot de FREE. « u » seul ou « je » seul devient « ge ». */
  const FREE = new Set([ASKS, PREPS, 'wie via me mij hem ze ons hen hun het \'t ’t dat dit die deze of iets niets niks ' +
  ```
  with
  ```js
     mot de NEVER_AFTER_YOUR. « u » seul ou « je » seul devient « ge ». */
  const NEVER_AFTER_YOUR = new Set([ASKS, PREPS, 'wie via me mij hem ze ons hen hun het \'t ’t dat dit die deze of iets niets niks ' +
  ```
  then replace
  ```js
  function free(rest) {
    const next = /^\s*([^\s?!.,;:"»)]*)/.exec(rest)[1];
    return !next || /^[A-ZÀ-Ý]/.test(next) || FREE.has(next.toLowerCase());
  }
  ```
  with
  ```js
  /* Vrai quand le mot qui suit « je » peut suivre « ton » : « je » peut alors être « ton ». */
  function mayBeYour(rest) {
    const next = /^\s*([^\s?!.,;:"»)]*)/.exec(rest)[1];
    return !!next && !/^[A-ZÀ-Ý]/.test(next) && !NEVER_AFTER_YOUR.has(next.toLowerCase());
  }
  ```
  then replace
  ```js
    return pron === 'je' && TAKES.u[verb] && !free(rest) ? null : t + ' ge';
  ```
  with
  ```js
    return pron === 'je' && TAKES.u[verb] && mayBeYour(rest) ? null : t + ' ge';
  ```
  In `test/tools/fanout.js`:
  ```
  sed -i 's/gwhyDrie/gwhyThree/g' test/tools/fanout.js
  ```
  It changes four lines, the helper and its three calls.

- [ ] **Step 4: Run the suites that read these files, and watch them stay green.**
  ```
  node test/tools/fanout.js .
  node test/lang.js .
  node test/content.js .
  ```
  Expected: no `FAIL` line, and the last lines `454 contrôles, KIT CONFORME`, `23173 contrôles, LANGUE
  CONFORME` and `2077 contrôles, CONTENU CONFORME`, the counts each printed before step 1. Then
  ```
  grep -rn --exclude-dir=node_modules "strays\|FREE\b\|free(\|gwhyDrie\|words(untoken" tools test --include=*.js
  ```
  prints only `test/lib/dutch.js`'s `const tokenFreeWords = s => words(untoken(s));`. (`node_modules` is the
  learner pass's, installed at set-up.)

- [ ] **Step 5: Commit.**
  ```
  git add test/lib/text.js test/lib/dutch.js tools/content/kinds/open.js tools/content/lib/explain.js tools/content/kinds/flemish.js test/tools/fanout.js
  git commit -m "refactor(content): the other-language quotes check is written once, in test/lib/text.js, and a text's words with its tokens out once, in test/lib/dutch.js; FREE, free and gwhyDrie are named for what they hold (#110)"
  ```
  No build: nothing under `src/` changed.

Done when:
- `strays`, `FREE`, `free(` and `gwhyDrie` appear nowhere, and `words(untoken(` only inside `tokenFreeWords`
  (#110's kit items, each folded or renamed).
- `node test/tools/fanout.js .`, `node test/lang.js .` and `node test/content.js .` print the counts they
  printed before the task, with no `FAIL` line.

### Task 4: the week chart counts its days on the local calendar, and names them there
Class: mechanical
Ticket: #105
Promises: none
Why: #105, raised by the closing review of the phase 3 follow-ups run, with D2. The week chart on `meer` (« More »)
(`NL.screens.meer`, `src/ui/home.js:153–156`) finds the day « i days ago » by taking i × 24 hours from now, and
§12 of `test/journey.js` finds its `day(d)` the same way (line 300). A local day lasts 25 hours on the last
Sunday of October and 23 on the last Sunday of March. From 23:00 to midnight on the six evenings from 25 to 30
October, the chart shows 25 October twice and drops the first day of its week. From midnight to 01:00 on the
six nights from 30 March to 4 April, it skips 29 March, and that day's sessions are not drawn. §12 fails in two
of those hours. The label has its own fault (D2): `t.days[new Date(x.d).getDay()]` reads the key `2026-10-25`
as midnight UTC and names it in the local zone, so west of UTC every bar carries the name of the day before.
The app's streak is not affected: `NL.state.creditDay` compares calendar keys. After this task one helper,
`NL.util.daysBack(n)`, gives the same hour n dates back on the local calendar, as a `Date`. It returns a
`Date`, not a key, because the chart needs two things of the same day: its key, through `dayKey()`, and its
name, through `getDay()`. §12 takes its key. `NL.util` gains that one export. `test/lib/` gains `zone.js`, with
`inZone(name, fn)` and `offsets()`, shared by the new check, `test/engine.js` and `test/pace.js` (Notes). The
chart's day objects carry `weekday`. No later task uses any of these.

Files:
- Create: `test/lib/zone.js`
- Modify: `src/core/util.js` (`dayDiff`, line 97, and the export, line 110)
- Modify: `src/ui/home.js` (`NL.screens.meer.render`: the loop, lines 153–156, and the label, line 175)
- Modify: `test/journey.js` (§12's `day(d)`, line 300)
- Test: `test/screens.js` (its requires, line 23, and a new section after « PLUS COMPTE COMME L'ACCUEIL »,
  which ends at line 368)
- Modify: `test/engine.js` (line 8, and « L'HEURE DE LA RÉPONSE », lines 177–186 and 201)
- Modify: `test/pace.js` (line 5, and lines 193–194)
- Modify: `TESTING.md` (the `screens.js` row, line 20, and the rule on dates, lines 70–71)
- Build: `index.html`, `artifact.html`

Lines are as of `f7376ac`. Task 1 changes another row of `TESTING.md` (line 26), away from this task's; tasks 1
to 3 touch none of the other files.

Notes:
- **Waits for no task.** Task 5 changes `src/ex/index.js`, `src/ui/scenario.js` and `src/ui/listen.js`, none of
  them here, and builds over this task's `index.html` and `artifact.html`.
- **The clock and the zone.** `test/lib/browser.js` holds the clock (`now`, `B.clock`). The page's `Date`
  extends Node's, so it follows `process.env.TZ`, which Node reads again each time it is set. The new section
  sets the zone for each instant through `inZone()`. CI runs in UTC, where no day is 25 hours long, and it sees
  the same nights.
- **The expectation cannot share the fault.** The section counts the days it expects on UTC dates (`back()`),
  and reads their names from the date in UTC (`named()`). Neither the local zone nor the clock enters them.
- **§12 is proved through the helper.** `test/journey.js` opens its page without `now`, so it runs on the real
  clock and cannot be held at an instant. Its `day(d)` becomes `U.dayKey(U.daysBack(d))`. At each instant, the
  new section checks `U.dayKey(U.daysBack(1))` and `U.dayKey(U.daysBack(3))`, the two days §12 asks for. The
  proof below also replays §12's own lines at those instants.
- **`test/lib/zone.js` comes from the reading of the brief.** The new section sets a zone and restores it as
  `test/engine.js`'s Brussels block does, and it reads the same offsets. `test/pace.js` holds a third copy of
  `offsets`. `TESTING.md` says « Ce que plusieurs suites font vit une fois dans `test/lib/` », so the zone
  handling lives once, in `inZone()` and `offsets()`, and engine.js and pace.js take it from there (step 5).
  - Step 5 is a refactor. No behaviour changes, so no test can fail on the old code; its check is
    `engine.js` and `pace.js` staying green.
  - `pace.js`'s `if (DRIFT) process.env.TZ = 'Europe/Brussels';` (line 16) stays. It sets the zone for the
    whole run, not for a block.
- **`weekday` is not stored.** The chart's day objects are built at each render. The field names `CLAUDE.md`
  protects belong to stored records.
- **`smoke.js` and `lang.js`.** The new code uses `const`, arrows for the short helpers and a `function`
  declaration for `inZone`, and no optional chaining. The labels still come from `t.days`, in the display
  language.
- **The proof.** These steps ran on a copy of `f7376ac` with this task alone.
  - Step 2 printed the eight `FAIL` lines below and `828 checks, 8 FAILED`.
  - Step 4 printed `828 checks, SCREENS OK` (819 before the task: the new section adds nine checks),
    `816 checks, NO PROBLEMS` and `23173 contrôles, LANGUE CONFORME`.
  - Step 5 printed `307 checks, ENGINE OK` and `12 vérifications, AUCUN PROBLÈME`.
  - Step 6 printed `built (local only) index.html (680650 bytes), artifact.html (680036 bytes)`.
  - `sh test/run-all.sh` printed `TOUTE LA SUITE EST PASSÉE`.

  Each site of step 3 was then put back alone, under the new section:
  - The loop in 24-hour steps (`const at = new Date(Date.now() - i * U.DAY)`) printed `828 checks, 3 FAILED`:
    the three Brussels chart lines of step 2.
  - The label read from the key (`t.days[new Date(x.d).getDay()]`) printed `828 checks, 1 FAILED`: the
    Montréal chart line.
  - The helper in 24-hour steps (`n => new Date(Date.now() - n * 86400000)`, §12's old `day`) printed
    `828 checks, 6 FAILED`. Those were the three Brussels chart lines, and these three:
    ```
      FAIL: at 25 October 2026, 23:30 in Europe/Brussels, one and three days back, as §12 of test/journey.js counts them, are 2026-10-25 and 2026-10-23, not 2026-10-24 and 2026-10-22
      FAIL: at 27 October 2026, 23:30 in Europe/Brussels, one and three days back, as §12 of test/journey.js counts them, are 2026-10-26 and 2026-10-25, not 2026-10-26 and 2026-10-24
      FAIL: at 30 March 2026, 00:30 in Europe/Brussels, one and three days back, as §12 of test/journey.js counts them, are 2026-03-28 and 2026-03-26, not 2026-03-29 and 2026-03-27
    ```

  §12's streak lines, replayed on a page with the clock held at each instant and the zone set:
  - With the old `day(d)`, a consecutive day left the streak at 3 at 23:30 on 25 October, and reset it to 1 at
    00:30 on 30 March. It passed at 23:30 on 27 October and at Montréal.
  - With the new `day(d)`, it reached 4 at all four instants. A three-day gap reset the streak to 1 at every
    instant, both ways.

- [ ] **Step 1: Write the failing test.** Create `test/lib/zone.js`:
  ```js
  /* Un bloc de suite dans un fuseau horaire, écrit une fois.

       const { inZone, offsets } = require('./lib/zone');
       inZone(nom, fn)  lance fn() avec process.env.TZ = nom, puis remet le fuseau de départ par
                        son nom, même si fn() lève : effacer TZ ne le rendrait pas, Node garde le
                        dernier. fn() est synchrone ; inZone rend ce qu'elle rend.
       offsets()        les décalages UTC de janvier et de juillet, « -60 / -120 » à Bruxelles :
                        relevés avant et après un bloc, ils disent que le reste de la suite tourne
                        là où il a commencé.

     Le Date de la page (test/lib/browser.js) hérite de celui de Node : il suit le même fuseau. */
  const offsets = () => [Date.UTC(2026, 0, 15), Date.UTC(2026, 6, 15)].map(t => new Date(t).getTimezoneOffset()).join(' / ');

  function inZone(name, fn) {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    process.env.TZ = name;
    try { return fn(); } finally { process.env.TZ = zone; }
  }

  module.exports = { inZone, offsets };
  ```
  In `test/screens.js`, after
  ```js
  const { SCREENS } = require('./lib/screens');
  ```
  insert
  ```js
  const { inZone, offsets } = require('./lib/zone');
  ```
  and after the end of the « PLUS COMPTE COMME L'ACCUEIL » section,
  ```js
      console.log('  tuile et bandeau de Plus = ' + cp.met + ' rencontrés, ' + cp.produce + ' produits, 3 à toi ; filtre « produits » : ' + rows + ' lignes');
    }
  ```
  insert
  ```js

    /* ------------------------------------------------------------------ */
    console.log('\nLA SEMAINE DE PLUS — sept jours du calendrier, chacun sous son nom');
    /* Un jour se compte sur le calendrier local, jamais en 24 heures : à Bruxelles, le
       dernier dimanche d'octobre dure 25 heures, le dernier dimanche de mars 23 (#105).
       Les instants sont écrits en UTC ; les jours attendus, relevés sur le calendrier
       du fuseau, et leur nom tiré de la date seule, hors de tout fuseau. À Montréal,
       une date lue comme minuit UTC tombe la veille : chaque barre y portait le nom du
       jour d'avant. Chaque instant tourne dans son fuseau le temps de ses contrôles
       (test/lib/zone.js). */
    {
      const before = offsets();
      const U = NL.util;
      const back = (key, n) => new Date(Date.parse(key + 'T00:00:00Z') - n * DAY).toISOString().slice(0, 10);
      const named = key => key + ' ' + t.days[new Date(key + 'T00:00:00Z').getUTCDay()];
      const bars = () => [...NL.screens.meer.render().matchAll(/class="spark-col" title="(\d{4}-\d\d-\d\d) : \d+">[\s\S]*?<span>([^<]*)<\/span>/g)]
        .map(m => m[1] + ' ' + m[2]).join(', ');
      fresh();
      [
        ['Europe/Brussels', '25 October 2026, 23:30', '2026-10-25T22:30:00Z', '2026-10-25'],   // le jour de 25 heures
        ['Europe/Brussels', '27 October 2026, 23:30', '2026-10-27T22:30:00Z', '2026-10-27'],   // il est dans la semaine
        ['Europe/Brussels', '30 March 2026, 00:30', '2026-03-29T22:30:00Z', '2026-03-30'],     // le lendemain du jour de 23 heures
        ['America/Montreal', '25 October 2026, 18:30', '2026-10-25T22:30:00Z', '2026-10-25']   // à l'ouest de UTC
      ].forEach(([tz, when, at, today]) => inZone(tz, () => {
        B.clock.set(Date.parse(at));
        const want = [6, 5, 4, 3, 2, 1, 0].map(n => named(back(today, n))).join(', '), got = bars();
        ok(got === want, 'at ' + when + ' in ' + tz + ', the week chart reads « ' + got + ' », not « ' + want + ' »');
        /* §12 de test/journey.js compte la série sur les jours que l'aide lui donne. */
        const said = typeof U.daysBack === 'function' ? [1, 3].map(n => U.dayKey(U.daysBack(n))).join(' and ') : 'no NL.util.daysBack';
        const meant = [1, 3].map(n => back(today, n)).join(' and ');
        ok(said === meant, 'at ' + when + ' in ' + tz + ', one and three days back, as §12 of test/journey.js counts them, are ' + said + ', not ' + meant);
      }));
      ok(offsets() === before, 'after the week chart block the rest of the suite runs at UTC offsets ' + offsets() + ' (January / July), not ' + before + ' as before it');
      console.log('  Bruxelles, autour des deux changements d’heure : sept jours de suite ; Montréal : chaque barre sous le nom de son jour ; un et trois jours plus tôt, comme les compte la série');
    }
  ```

- [ ] **Step 2: Run it and watch it fail.**
  ```
  node test/screens.js .
  ```
  Expected: exactly eight `FAIL` lines, and the last line `828 checks, 8 FAILED`:
  ```
    FAIL: at 25 October 2026, 23:30 in Europe/Brussels, the week chart reads « 2026-10-20 Tue, 2026-10-21 Wed, 2026-10-22 Thu, 2026-10-23 Fri, 2026-10-24 Sat, 2026-10-25 Sun, 2026-10-25 Sun », not « 2026-10-19 Mon, 2026-10-20 Tue, 2026-10-21 Wed, 2026-10-22 Thu, 2026-10-23 Fri, 2026-10-24 Sat, 2026-10-25 Sun »
    FAIL: at 25 October 2026, 23:30 in Europe/Brussels, one and three days back, as §12 of test/journey.js counts them, are no NL.util.daysBack, not 2026-10-24 and 2026-10-22
    FAIL: at 27 October 2026, 23:30 in Europe/Brussels, the week chart reads « 2026-10-22 Thu, 2026-10-23 Fri, 2026-10-24 Sat, 2026-10-25 Sun, 2026-10-25 Sun, 2026-10-26 Mon, 2026-10-27 Tue », not « 2026-10-21 Wed, 2026-10-22 Thu, 2026-10-23 Fri, 2026-10-24 Sat, 2026-10-25 Sun, 2026-10-26 Mon, 2026-10-27 Tue »
    FAIL: at 27 October 2026, 23:30 in Europe/Brussels, one and three days back, as §12 of test/journey.js counts them, are no NL.util.daysBack, not 2026-10-26 and 2026-10-24
    FAIL: at 30 March 2026, 00:30 in Europe/Brussels, the week chart reads « 2026-03-23 Mon, 2026-03-24 Tue, 2026-03-25 Wed, 2026-03-26 Thu, 2026-03-27 Fri, 2026-03-28 Sat, 2026-03-30 Mon », not « 2026-03-24 Tue, 2026-03-25 Wed, 2026-03-26 Thu, 2026-03-27 Fri, 2026-03-28 Sat, 2026-03-29 Sun, 2026-03-30 Mon »
    FAIL: at 30 March 2026, 00:30 in Europe/Brussels, one and three days back, as §12 of test/journey.js counts them, are no NL.util.daysBack, not 2026-03-29 and 2026-03-27
    FAIL: at 25 October 2026, 18:30 in America/Montreal, the week chart reads « 2026-10-19 Sun, 2026-10-20 Mon, 2026-10-21 Tue, 2026-10-22 Wed, 2026-10-23 Thu, 2026-10-24 Fri, 2026-10-25 Sat », not « 2026-10-19 Mon, 2026-10-20 Tue, 2026-10-21 Wed, 2026-10-22 Thu, 2026-10-23 Fri, 2026-10-24 Sat, 2026-10-25 Sun »
    FAIL: at 25 October 2026, 18:30 in America/Montreal, one and three days back, as §12 of test/journey.js counts them, are no NL.util.daysBack, not 2026-10-24 and 2026-10-22
  ```

- [ ] **Step 3: Implement.** In `src/core/util.js`, replace
  ```js
    const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  ```
  with
  ```js
    const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
    /* Le jour local n jours plus tôt, compté sur le calendrier et jamais en 24 heures :
       à Bruxelles, le dernier dimanche d'octobre dure 25 heures, celui de mars 23 (#105).
       La même heure, n dates plus tôt ; dayKey() en tire la clé, getDay() le nom du jour. */
    const daysBack = n => { const x = new Date(); x.setDate(x.getDate() - n); return x; };
  ```
  and replace
  ```js
    return { esc, shuffle, sample, one, clamp, uniq, norm, words, tiles, bare, bareFr, lev, near, tolFor, typedOk, ratio, diffWords, dayKey, dayDiff, ago, debounce, MIN, HOUR, DAY };
  ```
  with
  ```js
    return { esc, shuffle, sample, one, clamp, uniq, norm, words, tiles, bare, bareFr, lev, near, tolFor, typedOk, ratio, diffWords, dayKey, dayDiff, daysBack, ago, debounce, MIN, HOUR, DAY };
  ```
  In `src/ui/home.js`, replace
  ```js
          const d = U.dayKey(Date.now() - i * U.DAY);
          days.push({ d, n: byDay[d] || 0 });
  ```
  with
  ```js
          const at = U.daysBack(i), d = U.dayKey(at);
          days.push({ d, n: byDay[d] || 0, weekday: at.getDay() });
  ```
  and replace
  ```js
            '<span>' + t.days[new Date(x.d).getDay()] + '</span></div>').join('') +
  ```
  with
  ```js
            '<span>' + t.days[x.weekday] + '</span></div>').join('') +
  ```
  In `test/journey.js`, replace
  ```js
    const day = d => U.dayKey(Date.now() - d * U.DAY);
  ```
  with
  ```js
    const day = d => U.dayKey(U.daysBack(d));
  ```

- [ ] **Step 4: Run it and watch it pass.**
  ```
  node test/screens.js .
  node test/journey.js .
  node test/lang.js .
  ```
  Expected: `828 checks, SCREENS OK`, then `816 checks, NO PROBLEMS`, then `23173 contrôles, LANGUE CONFORME`.

- [ ] **Step 5: `engine.js` and `pace.js` take the zone from `test/lib/zone.js`, and `TESTING.md` says
  so.** In `test/engine.js`, after
  ```js
  const browser = require('./lib/browser');
  ```
  insert
  ```js
  const { inZone, offsets } = require('./lib/zone');
  ```
  replace
  ```js
       Le fuseau est fixé pour ce bloc seul : la CI, qui tourne en UTC, voit ainsi
       les mêmes nuits de changement d'heure. Effacer TZ ne rend pas le fuseau de
       départ, Node garde le dernier : on remet donc son nom, et le reste de la
       suite tourne là où il a commencé. */
  ```
  with
  ```js
       Le fuseau est fixé pour ce bloc seul (test/lib/zone.js) : la CI, qui tourne
       en UTC, voit ainsi les mêmes nuits de changement d'heure, et le reste de la
       suite tourne là où il a commencé. */
  ```
  replace
  ```js
      const offsets = () => [Date.UTC(2026, 0, 15), Date.UTC(2026, 6, 15)].map(t => new Date(t).getTimezoneOffset()).join(' / ');
      const before = offsets();
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      process.env.TZ = 'Europe/Brussels';
      try {
        fresh();
  ```
  with
  ```js
      const before = offsets();
      inZone('Europe/Brussels', () => {
        fresh();
  ```
  and replace
  ```js
      } finally { process.env.TZ = zone; }
  ```
  with
  ```js
      });
  ```
  In `test/pace.js`, after
  ```js
  const browser = require('./lib/browser');
  ```
  insert
  ```js
  const { offsets } = require('./lib/zone');
  ```
  and replace
  ```js
      const offsets = [Date.UTC(2026, 0, 15), Date.UTC(2026, 6, 15)].map(t => new Date(t).getTimezoneOffset()).join(' / ');
      ok(offsets === '-60 / -120', 'l’apprenant qui dérive tourne aux décalages ' + offsets + ' (janvier / juillet), pas à ceux de Bruxelles (-60 / -120) : son lendemain ne se compte pas à l’heure locale');
  ```
  with
  ```js
      const seen = offsets();
      ok(seen === '-60 / -120', 'l’apprenant qui dérive tourne aux décalages ' + seen + ' (janvier / juillet), pas à ceux de Bruxelles (-60 / -120) : son lendemain ne se compte pas à l’heure locale');
  ```
  In `TESTING.md`, replace
  ```
  dates partent de l'horloge de la suite (`T0`), chacune différente : deux
  écritures dans la même milliseconde ne testent rien.
  ```
  with
  ```
  dates partent de l'horloge de la suite (`T0`), chacune différente : deux
  écritures dans la même milliseconde ne testent rien. Un jour se compte sur le
  calendrier local, jamais en 24 heures : à Bruxelles, le dernier dimanche
  d'octobre en dure 25 et celui de mars 23, et un jour compté en arrière par pas
  de 24 heures tombe ces semaines-là sur la mauvaise date (#105).
  `NL.util.daysBack(n)` le compte sur le calendrier. Une suite qui fixe le fuseau
  pour un bloc le fait par `inZone()` de `test/lib/zone.js`, qui le remet ensuite.
  ```
  and at the end of the `screens.js` row, replace
  ```
  un mot listé dans deux unités, compté une fois : les comptes, les totaux des unités, ce qui résiste, la bibliothèque |
  ```
  with
  ```
  un mot listé dans deux unités, compté une fois : les comptes, les totaux des unités, ce qui résiste, la bibliothèque ; la semaine de Plus, sept jours de suite sur le calendrier local, chacun sous le nom de son jour, à Bruxelles autour des deux changements d'heure et à Montréal, à l'ouest de UTC, et les jours en arrière que la série de `journey.js` (§12) compte à ces instants |
  ```
  Then:
  ```
  node test/engine.js .
  node test/pace.js . 200 one drift
  ```
  Expected: `307 checks, ENGINE OK`, then `12 vérifications, AUCUN PROBLÈME`.

- [ ] **Step 6: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (local only) index.html (680650 bytes), artifact.html (680036 bytes)`.

- [ ] **Step 7: Commit.**
  ```
  git add test/lib/zone.js src/core/util.js src/ui/home.js test/journey.js test/screens.js test/engine.js test/pace.js TESTING.md index.html artifact.html
  git commit -m "fix(home): the week chart counts its seven days on the local calendar, never as 24 hours, and names each bar after its own date; §12 of journey.js counts its days the same way (#105)" -m "NL.util.daysBack(n) gives the local day n dates back, at the same hour. Around a clock change the chart showed 25 October twice or skipped 29 March, and west of UTC every bar carried the name of the day before. screens.js checks the chart at 23:30 on 25 and 27 October and 00:30 on 30 March in Brussels, and at Montréal, with the clock held and the zone set. inZone() and offsets() in test/lib/zone.js set a suite's zone for one block and read its offsets: engine.js and pace.js, which each had their own copy, use them too." -m "Refs #105"
  ```

Done when:
- At 23:30 on 25 and 27 October and at 00:30 on 30 March 2026, Brussels time, the week chart on `meer`
  shows seven consecutive dates. At Montréal, each bar carries the name of its own date. Before step 3, none
  of the four did.
- `node test/screens.js .` prints `828 checks, SCREENS OK`, and `node test/engine.js .` prints
  `307 checks, ENGINE OK`.
- `grep -n "U\.DAY" src/ui/home.js test/journey.js` prints nothing.
- `grep -rln "getTimezoneOffset\|process.env.TZ = zone" test` prints only `test/lib/zone.js`.

### Task 5: the retry rule's three tries named once, the mic panel's buttons as one shape, `graded` read once, `micPanel`'s options named
Class: mechanical
Ticket: #110
Promises: none
Why: #110's four app items, from the branch review of PR #109. (a) The retry-until-the-third-try rule,
`!sp.ok && sp.tries < 3`, and its retry button are written twice: in `retryThenRate`
(`src/ex/index.js:410–412`) and in a conversation's turn (`src/ui/scenario.js:222`). After this task the 3 is
`TRIES`, and the rule and its button are written once, `NL.ex.retryButton(sp, label)`, which both call; each
keeps its own label (the exercise counts the tries left, the turn says `NL.t.replay`). (b) `micPanel`'s
`startAttrs` and `stopAttrs` (`src/ex/index.js:380–381`) are raw attribute strings that always travel
together, and the nazeggen's options (`src/ui/listen.js:116–121`) rebuild the same `aria-label` markup only to
turn `data-mic` into `data-act`. After this task a caller passes one shape, `taps: { start: {…}, stop: {…} }`,
each the `dataset` its screen's click reads, and `micPanel` adds the `aria-label` itself; the nazeggen's
options need no `NL.t` any more, so they are a constant again, `SHADOW`, as `TURN` is. (c) `graded` is tested
three times in `micPanel` (lines 385, 398, 404): the panel when the microphone cannot listen, the « heard »
line and the self-rating under an error. After this task it is read once, to choose `GRADED` or `UNGRADED`,
which hold those three pieces. (d) `micPanel`'s merged options are named `o`; after this task they are
`screen`, what differs from one screen to another. A refactor: no behaviour changes, so no test can fail on
the old code (`CLAUDE.md`). Its check is the suite staying green, and the 178-state snapshot of the
2026-10-25 plan's task 7 (#96) taken before step 2 and after step 5, which must be identical. `NL.ex` gains
one export, `retryButton`; `micPanel`'s signature is unchanged, and its options `startAttrs` and `stopAttrs`
become `taps`.

Files:
- Modify: `src/ex/index.js` (`micPanel`'s comment, `micPanel` and `retryThenRate`, lines 369–412 at
  `f7376ac`; the `return` at line 722)
- Modify: `src/ui/scenario.js` (`TURN`, lines 216–222 at `f7376ac`)
- Modify: `src/ui/listen.js` (line 94; `shadow`, lines 113–121 at `f7376ac`)
- Build: `index.html`, `artifact.html`
- Test: none changes. `test/screens.js`, `test/lang.js` and `test/smoke.js` pass unchanged.

Notes:
- **The names.** `GLOSSARY.md` names none of them, and none is on an _Avoid_ line. `TRIES` is the number of
  tries a missed answer gets; `retryButton(sp, label)` writes the retry button while one is left, `label(left)`
  giving its text; `taps` is what a tap on each microphone button carries, in the shape the screen's click
  reads (`{ mic: 'start' }`, `{ act: 'micstop' }`), the shape `test/lib/browser.js`'s `B.tap` takes;
  `micAttrs(tap, label)` writes a button's `data-*` and `aria-label`; `GRADED` and `UNGRADED` hold what the
  panel adds on a screen that grades (`blocked`, `heard`, `afterError`) and the nazeggen's plain stand-ins;
  `screen` is a screen's options merged with the defaults.
- **One label each.** The exercise's retry button counts the tries left (`NL.t.micRetry`, « Try again (2) »),
  the turn's is `NL.t.replay` (« Again »), and the nazeggen's replays without a limit (`data-act="mic"`):
  `retryButton` takes the label, and the nazeggen does not call it.
- **The self-rating after the third try.** `retryThenRate` showed `selfRate` when `!sp.ok && sp.tries >= 3`.
  It now shows it when there is no retry button and `!sp.ok`: the same thing, since `sp.tries` is a number in
  every speech state (`src/ui/session.js:11`, `src/ui/scenario.js:47`, `src/ui/listen.js:10, 46, 156`).
- **Order of definitions.** `micAttrs`, `GRADED`, `UNGRADED`, `TRIES` and `retryButton` are `const`s written
  below `micPanel`, which reads them only when a screen renders, after the file has run, as it already reads
  `retryThenRate` and `selfRate`. `GRADED.blocked` is `recordPanel`, a function declaration, so it is defined
  when `GRADED` is.
- **`SHADOW` is a constant again.** The 2026-10-25 plan's task 10 made the nazeggen's options a function,
  `shadow()`, because a label written into an object at load time stays in the language the page loaded in.
  `micPanel` now writes the `aria-label`s when it renders, so the options hold no text but `after`'s, which is
  a function already.
- **No other task touches these files.** Tasks 1 to 3 are the kit and its tests, task 4 the week chart, task 6
  a plan's note. Task 4 rebuilds `index.html` and `artifact.html` too: step 5 rebuilds them over it, so when
  task 4 has run the build's byte counts, and the counts of a suite it adds checks to, differ from the ones
  below.
- **The proof.** These steps ran on a copy of `f7376ac`. Step 1 and step 6 printed `178 states, 178 with a mic
  panel, 349303 bytes`, and `cmp` printed nothing. To check that the snapshot sees each new piece, each was
  changed in turn and the states that differed counted: `TRIES` 3 → 2, 4 exercise states and 1 turn state;
  `micAttrs`'s label, 28, 3 and 3 (exercise, turn, nazeggen); `GRADED.heard`, 8 and 5; `GRADED.afterError`,
  10 and 1; `UNGRADED.blocked`, 4 nazeggen states. Step 4.3's greps printed what they expect. Step 5 printed
  `built (local only) index.html (681096 bytes), artifact.html (680482 bytes)`. Step 7 printed
  `819 checks, SCREENS OK` (3 s), `23173 contrôles, LANGUE CONFORME` (2 min 50 s), `ALL CHECKS PASSED`, and
  for the three journeys `865 checks, NO PROBLEMS`, `816 checks, NO PROBLEMS` and `812 checks, NO PROBLEMS`:
  the counts the same suites printed on `f7376ac` unchanged. `sh test/run-all.sh` then printed
  `TOUTE LA SUITE EST PASSÉE` and exited 0 (15 min 42 s, beside two other runs on the same machine).

- [ ] **Step 1: Snapshot the panels as they are.** The script is the 2026-10-25 plan's task 7 step 1, written
  there in full; the `awk` takes it by its text, since task 6 adds lines above it. From the repository's root,
  before changing anything:
  ```
  awk '/Task 7.s markup proof/{f=1} f&&/^  ```$/{exit} f' docs/superpowers/plans/2026-10-25-phase-3-follow-ups.md | sed 's/^  //' > <WS>/tmp/panels.js
  head -1 <WS>/tmp/panels.js
  node <WS>/tmp/panels.js . > <WS>/tmp/panels-before.txt
  ```
  Expected: `head` prints
  `/* Task 7's markup proof: every state of the microphone panel on its three screens, printed as`, and the
  snapshot prints `178 states, 178 with a mic panel, 349303 bytes` on the terminal. Only the equality
  of the two snapshots matters: an earlier task that changes a text these screens show may change the byte
  count.

- [ ] **Step 2: Write the rule, the buttons and the grading once, in `src/ex/index.js`.**
  1. Replace, from the line under `     est ce que fait cet exercice :` in the comment above `micPanel` to the
     end of `retryThenRate`, these 44 lines
     ```js
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
     ```
     with
     ```js
            icon       la taille du micro (34) ;
            taps       ce que portent les boutons qui lancent et arrêtent l'écoute, tel que le clic de
                       l'écran le lit ({ start: { mic: 'start' }, stop: { mic: 'stop' } }) ; le panneau
                       leur ajoute leur aria-label ;
            after(sp)  ce qui suit le score : l'action qui accepte et la règle qui fait réessayer (ici,
                       réessayer jusqu'au troisième refus, puis s'évaluer) ;
            graded     false pour un écran qui ne note rien, le nazeggen : UNGRADED au lieu de GRADED. */
       function micPanel(sp, target, opts) {
         const screen = Object.assign({
           icon: 34, graded: true, after: retryThenRate,
           taps: { start: { mic: 'start' }, stop: { mic: 'stop' } }
         }, opts);
         const grading = screen.graded ? GRADED : UNGRADED;
         const blocked = NL.speech.listenBlocked();
         if (blocked) return grading.blocked(sp, target, blocked);
         if (sp.phase === 'listening') {
           return '<div class="mic-panel live"><button class="mic big listening"' + micAttrs(screen.taps.stop, NL.t.stop) + '>' + ICON.mic(screen.icon) + '</button>' +
             '<p class="mic-why">' + NL.t.micListening + '</p>' +
             NL.ui.ifText(sp.partial, 'p', 'heard', 'nl') + '</div>';
         }
         if (sp.phase === 'done') {
           return '<div class="mic-panel ' + (sp.ok ? 'good' : 'bad') + '">' +
             '<div class="score-row"><span class="score">' + wordScore(sp.parts) + '</span>' +
             '<span class="score-bar"><span style="width:' + sp.pct + '%"></span></span></div>' +
             '<p class="word-diff"' + NL.gloss.attr('nl') + '>' + sp.parts.map(p =>
               '<span class="' + (p.ok ? (p.close ? 'w-close' : 'w-ok') : 'w-no') + '">' + esc(p.word) + '</span>').join(' ') + '</p>' +
             grading.heard(sp) + screen.after(sp) + '</div>';
         }
         /* Un refus s'affiche : sans ça, toucher le micro ne faisait rien, en silence. */
         return '<div class="mic-panel"><button class="mic big"' + micAttrs(screen.taps.start, NL.t.speak) + '>' + ICON.mic(screen.icon) + '</button>' +
           '<p class="mic-why">' + (sp.error ? esc(micError(sp.error)) : NL.t.micTap) + '</p>' +
           grading.afterError(sp) + '</div>';
       }

       /* Les attributs d'un bouton du micro : le data-* que lit le clic de l'écran, et son nom pour un
          lecteur d'écran. */
       const micAttrs = (tap, label) => Object.keys(tap).map(k => ' data-' + k + '="' + tap[k] + '"').join('') + ' aria-label="' + label + '"';

       /* Ce que le panneau ajoute sur un écran qui note : recordPanel quand le micro ne peut pas écouter,
          la ligne « entendu » sous le score, et l'auto-évaluation sous une erreur. Le nazeggen ne note
          rien : un simple avis à la place de recordPanel, et rien d'autre. */
       const GRADED = {
         blocked: recordPanel,
         heard: sp => sp.heard ? '<p class="heard">' + NL.t.micHeard + ' &ldquo;<span' + NL.gloss.attr('nl') + '>' + esc(sp.heard) + '</span>&rdquo;</p>' : '',
         afterError: sp => sp.error ? selfRate(sp) : ''
       };
       const UNGRADED = {
         blocked: () => '<div class="mic-panel offline"><p class="mic-why">' + NL.t.micNoBrowser + '</p></div>',
         heard: () => '',
         afterError: () => ''
       };

       /* Réessayer après un essai manqué, tant qu'il en reste : l'exercice et le tour de parole d'une
          conversation (scenario.js) suivent la même règle. `label(left)` donne le texte du bouton,
          `left` étant le nombre d'essais qui restent. */
       const TRIES = 3;
       const retryButton = (sp, label) => !sp.ok && sp.tries < TRIES
         ? '<button class="btn btn-blue" data-mic="start">' + label(TRIES - sp.tries) + '</button>' : '';

       /* Ce qui suit le score dans l'exercice : réessayer, puis s'évaluer. Trois refus (TRIES) : le
          micro n'entend peut-être simplement pas ce mot-là. Sans cette issue, l'élément serait redemandé
          chaque jour sans jamais monter. */
       const retryThenRate = sp => {
         const retry = retryButton(sp, NL.t.micRetry);
         return retry ? '<div class="mic-actions">' + retry + '</div>' : sp.ok ? '' : selfRate(sp);
       };
     ```
  2. Replace the `return` at the end of the file
     ```js
       return { registry: R, get: id => R[id] || R.pick, ICON, speakerRow, flemish, micPanel, wordScore, hereLine, rubric, explanation, accepted };
     ```
     with
     ```js
       return { registry: R, get: id => R[id] || R.pick, ICON, speakerRow, flemish, micPanel, retryButton, wordScore, hereLine, rubric, explanation, accepted };
     ```

- [ ] **Step 3: A conversation's turn calls the rule.** In `src/ui/scenario.js`, replace
  ```js
    /* The speak exercise's microphone panel (NL.ex.micPanel), so the microphone always behaves the
       same. A turn differs by what follows the score: a retry until the third try, and a button that
       always accepts the turn and moves on. */
    const TURN = {
      icon: 32,
      after: sp => '<div class="mic-actions">' +
        (!sp.ok && sp.tries < 3 ? '<button class="btn btn-blue" data-mic="start">' + NL.t.replay + '</button>' : '') +
  ```
  with
  ```js
    /* The speak exercise's microphone panel (NL.ex.micPanel), so the microphone always behaves the
       same. A turn differs by what follows the score: a retry until the third try, the exercise's rule
       (NL.ex.retryButton), and a button that always accepts the turn and moves on. */
    const TURN = {
      icon: 32,
      after: sp => '<div class="mic-actions">' + NL.ex.retryButton(sp, () => NL.t.replay) +
  ```

- [ ] **Step 4: The nazeggen passes its taps.** In `src/ui/listen.js`:
  1. Replace
     ```js
             '</div>' + NL.ex.micPanel(sp, c.nl, shadow());
     ```
     with
     ```js
             '</div>' + NL.ex.micPanel(sp, c.nl, SHADOW);
     ```
  2. Replace
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
     with
     ```js
       /* Le panneau du micro de l'exercice « dire » (NL.ex.micPanel). Le nazeggen ne note rien : son
          micro passe par data-act, et après le score il n'offre que de recommencer. */
       const SHADOW = {
         icon: 32, graded: false, taps: { start: { act: 'mic' }, stop: { act: 'micstop' } },
         after: () => '<div class="mic-actions"><button class="btn btn-blue" data-act="mic">' + NL.t.replay + '</button></div>'
       };
     ```
  3. Check that the old names and the bare 3 are gone, and that the rule is written once:
     ```
     grep -rn "startAttrs\|stopAttrs\|shadow()\|tries < 3\|tries >= 3" src test
     grep -rn "TRIES\|retryButton" src
     ```
     Expected: the first prints nothing; the second prints 6 lines in `src/ex/index.js` (`TRIES`'s
     definition, the two lines of `retryButton`, the comment above `retryThenRate`, its call, the `return`)
     and 2 in `src/ui/scenario.js` (`TURN`'s comment and its call).

- [ ] **Step 5: Build.**
  ```
  sh build.sh
  ```
  Expected: `built (…) index.html (<n> bytes), artifact.html (<m> bytes)`. With no Supabase variables, in the
  run's order (after task 4), the replay printed `built (local only) index.html (681478 bytes), artifact.html
  (680864 bytes)`; on `f7376ac` with this task alone, `681096` and `680482`.

- [ ] **Step 6: Snapshot the panels again and compare.**
  ```
  node <WS>/tmp/panels.js . > <WS>/tmp/panels-after.txt
  cmp <WS>/tmp/panels-before.txt <WS>/tmp/panels-after.txt
  ```
  Expected: the first prints the same line as step 1 (`178 states, 178 with a mic panel, 349303 bytes` on
  `f7376ac`); `cmp` prints nothing and exits 0. If `cmp` reports a difference, the panel's markup changed:
  find the first differing state (its `### ` line in `panels-after.txt`) and fix the step that wrote it.

- [ ] **Step 7: Run the suites that draw the three screens.**
  ```
  node test/screens.js .
  node test/lang.js .
  node test/smoke.js .
  node test/journey.js . nl-BE SAF
  node test/journey.js . nl-BE IOS
  node test/journey.js . none OPR
  ```
  Expected: `828 checks, SCREENS OK`, `23173 contrôles, LANGUE CONFORME`, `ALL CHECKS PASSED`, then
  `865 checks, NO PROBLEMS`, `816 checks, NO PROBLEMS` and `812 checks, NO PROBLEMS`: the counts after task 4,
  which adds nine checks to `test/screens.js` (819 on `f7376ac`). The task adds and removes no check.

- [ ] **Step 8: Commit.**
  ```
  git add src/ex/index.js src/ui/scenario.js src/ui/listen.js index.html artifact.html
  git commit -m "refactor(ui): the retry rule's three tries have one name and one button, NL.ex.retryButton; the mic panel's buttons travel as one shape, taps, and get their aria-label from the panel; graded is read once, to choose GRADED or UNGRADED; micPanel's options are named screen (#110)"
  ```

Done when:
- `cmp` of the two snapshots printed nothing: 178 panel states, the same markup before and after.
- `grep -rn "startAttrs\|stopAttrs\|shadow()\|tries < 3\|tries >= 3" src test` prints nothing, and `TRIES` is
  defined once, in `src/ex/index.js`.
- `node test/screens.js .`, `node test/lang.js .`, `node test/smoke.js .` and the three journeys print
  `SCREENS OK`, `LANGUE CONFORME`, `ALL CHECKS PASSED` and `NO PROBLEMS`, with the counts step 7 names.
- `sh build.sh` ran, and `index.html` and `artifact.html` are committed.
- `sh test/run-all.sh` passes.

### Task 6: a note under the follow-ups plan's Review Focus 5 on its « Zijt gij » example
Class: mechanical
Ticket: #108
Promises: none
Why: #108, as the maintainer decided on 26 October 2026: the 2026-10-25 plan keeps Review Focus 5 as it was
decided, and a note under it says that its example, « Zijt gij al zeventig? », is accepted from `tijd`, not at
`ikengij`, and gives a sentence `ikengij` does accept. That is the form D6 gave #94 under phase 3's task 22.
The plan records what was decided on 25 October; a later reader who checks Review Focus 5 against the course
should find the slip named beside it. What ships is right already, so nothing under `src/` or `test/` changes.

Files:
- Modify: `docs/superpowers/plans/2026-10-25-phase-3-follow-ups.md` (Review Focus 5, lines 182–186 at
  `f7376ac`)

Notes:
- **No test.** The change is a note in a plan, and no behaviour moves: there is nothing a test can fail on
  (`CLAUDE.md`). Steps 2 and 4 check the text instead: the note is absent, then present once, and the
  condition is unchanged.
- **What the note says was measured** at `f7376ac` with `test/lib/sequence.js` on the real course:
  `sequence.ahead('Zijt gij al zeventig?', 1, first)` is `["zeventig"]` at `ikengij` (index 1), and
  « zeventig »'s first unit is `tijd` (index 2); « Zijt gij hier? » has nothing ahead and nothing unmet at
  `ikengij`.
- **The proof.** These steps ran on a copy of `f7376ac`. Step 2 printed `0` and `1`; step 4 printed `1` and
  `1`.

- [ ] **Step 1: Nothing to write.** The check is step 2's command.

- [ ] **Step 2: Run it and see the note absent.**
  ```
  grep -c "Note, 26 October 2026 (#108)" docs/superpowers/plans/2026-10-25-phase-3-follow-ups.md
  grep -c "Condition: « Zijt gij al zeventig? » at \`ikengij\`" docs/superpowers/plans/2026-10-25-phase-3-follow-ups.md
  ```
  Expected: `0`, then `1` (the condition, which stays).

- [ ] **Step 3: Implement.** In `docs/superpowers/plans/2026-10-25-phase-3-follow-ups.md`, replace
  ```
     - Expected: accepted; refused; still untaught; `AHEAD_BUDGET` falls to 61 and never rises on the way.
     - Tests: task 6, step 1 (`test/tools/fanout.js`, `test/tools/sources.js`, `test/content.js`).
  ```
  with
  ```
     - Expected: accepted; refused; still untaught; `AHEAD_BUDGET` falls to 61 and never rises on the way.
     - Tests: task 6, step 1 (`test/tools/fanout.js`, `test/tools/sources.js`, `test/content.js`).
     - **Note, 26 October 2026 (#108).** « Zijt gij al zeventig? » is accepted from `tijd`, not at `ikengij`.
       Task 6 teaches « zijt » at `ikengij`, the first unit that lists `g-gegij`, but « zeventig » is first
       taught at `tijd`, the next unit, so at `ikengij` Check finds it ahead. Task 6's Why quotes the sentence
       as the one Check refused at every unit before the task, and this condition took it as the example for
       `ikengij`: that was the slip, and what ships is right. A sentence `ikengij` accepts is « Zijt gij
       hier? »; `test/content.js` pins « zijt » at `ikengij` on the real course. The condition stays as it was
       decided on 25 October.
  ```

- [ ] **Step 4: Run it and see the note once, the condition unchanged.**
  ```
  grep -c "Note, 26 October 2026 (#108)" docs/superpowers/plans/2026-10-25-phase-3-follow-ups.md
  grep -c "Condition: « Zijt gij al zeventig? » at \`ikengij\`" docs/superpowers/plans/2026-10-25-phase-3-follow-ups.md
  ```
  Expected: `1`, then `1`.

- [ ] **Step 5: Commit.**
  ```
  git add docs/superpowers/plans/2026-10-25-phase-3-follow-ups.md
  git commit -m "docs(plan): a note under the follow-ups plan's Review Focus 5 says « Zijt gij al zeventig? » is accepted from tijd, not at ikengij, and gives « Zijt gij hier? » (#108)"
  ```
  No build: nothing under `src/` changed.

Done when:
- The note follows Review Focus 5's Tests line, once, and its condition is unchanged (#108's first acceptance
  line).
- `git diff HEAD~1 --stat` lists the 2026-10-25 plan only (#108's second: no change under `src/` or `test/`).

### Task 7: GATE: a learner pass in a real browser, before the maintainer's check
Class: gate
Ticket: none
After: 1, 2, 3, 4, 5, 6
Show: echo "## days"; node tools/learner-pass/days.js .; echo "## corners"; node tools/learner-pass/corners.js .; echo "## sweep"; node tools/learner-pass/sweep.js .
Ask: « The learner pass played the branch's last commit as a learner on an iPhone would: <WS>/tmp/gate-7.md, its screenshots in `tools/learner-pass/shots/` (the week chart is on `meer.png`). Check it yourself on the branch's preview: what did you find? (nothing is an answer) »
Answer to: Rulings
Why: on 25 October 2026 the maintainer asked for a hands-on learner pass in a real browser before every
learner's check, and the follow-ups plan's gate 13 ran one. Two tasks here change code a learner meets. Task 4
changes how the week chart on `meer` (« More ») counts and names its days. Task 5 reshapes the microphone
panel of the speak exercise, a conversation's turn and the nazeggen, and the retry rule of the first two. The
suite checks
their markup, and task 5's snapshot checks the panel's, byte for byte. Only a browser checks a tap. The
learner pass, `tools/learner-pass/` (its `README.md` says what each script plays), plays the committed
`index.html` in headless Chrome dressed as Safari on iPhone (390×844, touch, `fr-BE`), with a fake recogniser
that behaves like Safari's. Show writes nothing tracked: its screenshots go to `tools/learner-pass/shots/`,
which git ignores. Each script exits 1 with one `PROBLEM:` line per fault, and prints, last:
- `days.js`: sessions on study days 0 to 20, the clock moved forward, until spoken cards come up; each
  microphone path once: right, wrong then right, ending by itself, and « Je ne peux pas parler ». A clean run
  ends `THE STUDY DAYS PLAY THROUGH`.
- `corners.js`: listening (Comprendre, Répéter), the baker conversation, the challenge. A clean run ends
  `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH`.
- `sweep.js`: every tappable thing on 16 screens, `meer` among them: one that changes nothing, one
  a finger cannot reach, overflow at 390 px, console errors. A clean run ends `EVERY TAP DOES SOMETHING`.

The pass runs in the machine's own zone, at the clock its scripts set: the week chart's hour around a clock
change is task 4's test, not this gate's.

The proof. The assembler ran this Show on the replay of tasks 1 to 6 (« How far to trust this plan »), with
`index.html` built after task 5: each script exited 0, ending `THE STUDY DAYS PLAY THROUGH`, `LISTENING,
CONVERSATION AND CHALLENGE PLAY THROUGH` and `EVERY TAP DOES SOMETHING`, with no `PROBLEM:` line.

Known before the run, and not for this gate: in Settings, a switch that redraws the sheet throws it back to its
top (#103, open). `sweep.js` does not report it.

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
