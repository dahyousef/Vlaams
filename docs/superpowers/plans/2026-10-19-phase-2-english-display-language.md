# Phase 2 — English as the Display Language — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/`. A run controller
> (`run-controller.md`) hands one task at a time to a task controller; do not use a skill's controller loop.
> Implementers read `docs/agents/plan-runs/run-notes.md` before their brief; where the notes and a command
> here differ, the notes win. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** English becomes the display language by default and French a switch in the settings. Every screen
is in one language, every meaning is glossed in English, and grading stays as it is.

**Architecture:**
- A gloss module (`src/core/gloss.js`) is the one place a meaning or a prose field is read, in the language
  the learner reads. Exercises, screens and the cognate flag all go through it.
- A language module (`src/core/lang.js`) owns the `displayLang` setting. It replaces the contents of `NL.t`
  with `NL.tables.fr` or `NL.tables.en` and points the gloss module at the language. It applies a change only
  outside a session or a scenario.
- Content carries `en` beside every `fr`. A check in `test/content.js` counts what is still owed, against
  budgets that only go down.
- A separate sitting checks the English against sources, and against readers that did not write it.

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`).
- `gh` for tickets and the pull request.

**Spec:**
- GitHub issue #12, « New vocabulary every day, English by default, and content to B1 »: stories 22–35 and 50,
  and its lines on glosses from one place (104), reference pages (124), language declaration and metadata
  (126), and the content guards (152–161).
- `GLOSSARY.md`.
- ADRs 0003 (English display; the native language is a fact), 0004 (cognates), 0008 (grading ignores the
  display language) and 0009 (the switch is live, never mid-session).
- Every decision a task needs is written in the task or in Global Constraints.

## How far to trust this plan

- No scratch run was made. Line numbers are measured on `71b6698`. If a line has moved, match on its content.
- English owed at `71b6698`: 1,422 places in all.
  - Lexicon A1 (units 1–6): 282. Lexicon A1b (units 7 and on): 263.
  - Example sentences: 414. Grammar and open tasks: 110.
  - Reference sheets: 218. Scenarios: 135.
- The Task 2 fixture (`pairUp`) is proven on `71b6698`: it pairs 1,408 places, and today six screens then
  print `[object Object]`.
- There are 21 listening clips. No clip shares its Dutch with another clip that has a different French.
- `test/pace.js` may move in Tasks 7 and 8. English glosses change which words are cognates, and a cognate
  skips the meaning drill. If it fails there, report its numbers. Never change its thresholds.

## Set-up decisions

- The run works in a clone at `%USERPROFILE%\dev\vlaams-phase-2`. That folder is outside OneDrive and has no
  spaces in its path. Inside it, the run uses the worktree `.claude\worktrees\phase-2`, on branch
  `phase-2-english`. `/.claude/worktrees/` goes in the clone's `.git/info/exclude`.
- Task A gets the clone ready. Task B lets sittings start themselves. Both merge into `phase-2-english`
  before Task 1 is dispatched.
- Out of phase 2:
  - Sandcastle: its open Windows issues, and every task rebuilds the two build outputs. Look again in phase 3.
  - Playwright: screens are tested in the `vm` sandbox, as today.
  - graphify: it cannot run on this machine, which has no `uv` and no Python.
- Fallback sittings run through OmniRoute (`omniroute launch --profile <name>`). The maintainer sets it up
  before the run.

## Global Constraints

Code:
- `const`, or `let` where it changes; never `var`; no optional chaining. Arrows for short helpers and
  callbacks, `function` declarations for longer named functions. Existing code is not converted.
- Comments and test messages match the file being edited (mostly French).

Interface text and stored data:
- Interface text lives in `src/core/fr.js` (`NL.tables.fr`) and `src/core/en.js` (`NL.tables.en`), with the
  same keys. No interface text lives anywhere else.
- Storage keys and the field names inside stored records keep their spelling.
- `displayLang` is a new key of the stored meta:
  - its values are `'en'` and `'fr'`;
  - when it is absent, the display is English;
  - it is never put in `defaults()`;
  - it syncs like the other meta keys.
- An own word keeps its gloss in the language it was typed in, under `en` or `fr`.

Behaviour:
- Grading ignores the display language (ADR 0008): `accepted()`, `siblings()` and `sameSense()` keep today's
  rule.
- A wrong option never shares a meaning with the right answer in either language.
- A change of display language never applies inside `sessie` or `scenario` (ADR 0009).
- Progress is reported as counts, never percentages.

Writing the English:
- The English is written from the Dutch, then checked against the French. Where the French seems wrong for
  the Dutch, write the English for the Dutch and list the item in your report under « Disagreements ». Never
  change a `nl`, a `be` or a `fr`.
- British spelling: colour, centre, realise, travelling.
- Verbs are glossed « to … » (« to speak »).
- Nouns are glossed without an article (« bread », « meeting room »).
- Senses are separated by « / », as in French (« please / here you are »).
- Where the course teaches both `u`/`uw` and `jij`/`je`, an English « you » or « your » gloss carries
  « (formal) » or « (informal) ».
- Digits and `{naam}`, `{stad}`, `{bedrijf}` appear in the English exactly as in the French.
- Two items may share an English sense only if they share a French sense or their bare Dutch. Otherwise tell
  them apart in the gloss: « to know (a person) ».
- Notes and other prose are rewritten for an English reader:
  - a point that only makes sense to a French speaker is left out of the English and listed in your report
    under « French-only points »;
  - a note with nothing left for an English reader gets `en: null`;
  - never add a note that has no French.

Shape of the content:
- Translation slots carry `fr` and `en` side by side on the record. Helpers whose gloss argument is a pair
  (`W`, `P`, `S`, `D`, `T`, `C`) take `{ fr, en }` there, or a plain French string while the English is
  missing.
- Prose fields (`name`, `blurb`, `note`, `title`, `rule`, `explain`, `ask`, `what`, `h`, `place`, `outro`,
  `hint`) become `{ fr: '…', en: '…' }`. They are read only through `NL.gloss.of()`.
- The three French pages (`NL.content.sounds`, `loans`, `faux`) stay plain French strings.

Budgets and the build:
- Budgets in `test/content.js` only go down.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with
  the change.

Public repository:
- The repo is public. No personal data goes in a tracked file; the person is « the maintainer ».

## Review Focus

1. **A never-chose device must not undo a choice.**
   - Condition: a device that never chose a language syncs with one where the learner chose French.
   - Expected: the merged meta keeps `displayLang: 'fr'`, and a fresh meta has no `displayLang` key.
   - Test: Task 5, step 1, test 5a.
2. **A switch must wait for the end of a session or scenario.**
   - Condition: a synced change of language arrives mid-session or mid-scenario.
   - Expected: nothing on screen changes until the first screen drawn after it.
   - Test: Task 5, step 1, test 5b.
3. **An own word in the other language stays readable and never gets in the way.**
   - Condition: the learner has own words typed in the other language.
   - Expected: each is asked in its own language, is never offered as a wrong option to other items, and no
     option is ever blank.
   - Tests: Task 2, step 1, test 2c; and Task 5, step 1, test 5c.
4. **The language choice survives a restore, a reset and an account change.**
   - Condition: a backup made before phase 2 is restored, progress is reset, or `clearAll()` runs on a change
     of account.
   - Expected: `displayLang` is kept.
   - Test: Task 5, step 1, test 5d.
5. **The language read never shows two right answers.**
   - Condition: a listening exercise or a match exercise is drawn.
   - Expected: no two cards or options read the same in the language read.
   - Test: Task 2, step 1, test 2d.

---

## Before the run

Tasks A and B are tickets of their own, done before the run.
- They are not dispatched by the run controller.
- Each is done in a session opened in a worktree of the clone, on its own branch.
- Each lands as a pull request into `phase-2-english`, which the maintainer merges.

### Task A: Prepare the clone for phase 2

**Class:** mechanical · before the run

**Files:**
- Create: `.gitattributes`
- Modify: `docs/agents/plan-runs/run-notes.md:8-9`, `:19-20`, `:43-44`
- Modify: `docs/agents/plan-runs/closing-review.md:15`, `:33-34`

- [ ] **Step 1: Create the clone and the run's worktree.** Run these as plain PowerShell commands:

```powershell
git clone https://github.com/dahyousef/Vlaams.git "$env:USERPROFILE\dev\vlaams-phase-2"
git -C "$env:USERPROFILE\dev\vlaams-phase-2" worktree add .claude/worktrees/phase-2 phase-2-english
git -C "$env:USERPROFILE\dev\vlaams-phase-2" worktree add -b phase-2/prepare-clone .claude/worktrees/prepare origin/phase-2-english
Add-Content "$env:USERPROFILE\dev\vlaams-phase-2\.git\info\exclude" "/.claude/worktrees/"
```

  Expected: `git -C "$env:USERPROFILE\dev\vlaams-phase-2" status --short` prints nothing.

- [ ] **Step 2: Watch the build outputs come out modified.** In `.claude/worktrees/prepare`:
  - run `sh build.sh`;
  - then run `git status --short -- index.html artifact.html`.

  Expected: one or both files listed. `core.autocrlf=true` checks them out with CRLF, and the build writes LF.
  Restore them with `git checkout -- index.html artifact.html`.

- [ ] **Step 3: Write `.gitattributes`.** It holds one line and a comment:

```
# Build outputs: build.sh writes LF; checking them out as CRLF made every build look like a change.
index.html artifact.html text eol=lf
```

  Then delete the two working files (`Remove-Item index.html, artifact.html`) and run
  `git checkout -- index.html artifact.html`, so they are checked out again, as LF.

- [ ] **Step 4: Check the build outputs stay clean.**
  - Run `sh build.sh`, then `git status --short -- index.html artifact.html`. Expected: nothing.
  - Run `git add .gitattributes`, then `git add --renormalize index.html artifact.html`, then
    `git status --short`. Expected: only `A  .gitattributes`. No committed byte of the two outputs changed.

- [ ] **Step 5: Reword the five kit lines.** Replace each with the text below.
  - `run-notes.md:8-9`, « Its parent folders hold another checkout: never read, write or run anything there. »
    becomes « It lies inside the clone at `%USERPROFILE%\dev\vlaams-phase-2`, whose own checkout stays on
    `main`: never read, write or run anything outside the run's worktree. »
  - `run-notes.md:19-20`: delete « The worktree path contains spaces: quote it. ». Keep the sentence that
    follows it.
  - `run-notes.md:43-44`, « User-facing text is French and lives in `src/core/fr.js`. » becomes
    « User-facing text lives in `src/core/fr.js` and `src/core/en.js`, under the same keys; one is never
    changed without the other. »
  - `closing-review.md:15`: the screens area becomes `src/ui/`, `src/core/fr.js`, `src/core/en.js`,
    `src/core/gloss.js`, `src/core/lang.js`.
  - `closing-review.md:33-34`: the item becomes « Both interface tables have the same keys, and every text
    with a French version has an English one: `test/lang.js` checks it; confirm it ran in the verifier lines
    of the log. »

- [ ] **Step 6: Commit, push, open the pull request.** The commit subject is
  `chore: build outputs keep LF, and the kit names phase 2's clone and tables`. Then:
  - push the branch;
  - open a pull request into `phase-2-english` with `gh pr create --base phase-2-english`, closing the
    ticket.

### Task B: Sittings start themselves

**Class:** mechanical · before the run · blocked by Task A

**Files:**
- Modify: `docs/agents/plan-runs/run-controller.md` (the loop, « Sittings », « For the maintainer »)
- Modify: `docs/agents/plan-runs/design-sitting.md` (its end)
- Modify: `docs/agents/plan-runs/ledger-template.md` (the classes a Status row may carry)

The launch command. Run it from the run's worktree, so the new session starts inside a worktree:

```powershell
& "$env:USERPROFILE\.local\bin\claude.exe" --bg --remote-control "<name>" -n "<name>" --model opus --settings '{"env":{"CLAUDE_CODE_AUTO_COMPACT_WINDOW":"200000"}}' -- "<prompt>"
```

- `<name>` takes the form `Vlaams phase 2 — <what it is> <n>`.
- `<prompt>` is the run's start prompt, a design sitting's prompt, or « Read `<WS>/briefs/task-<N>.md` and
  follow it. Run file: `<WS>/run.md`. ».

- [ ] **Step 1: Branch.** Open a branch from `phase-2-english` after Task A has merged:

  `git -C "$env:USERPROFILE\dev\vlaams-phase-2" worktree add -b phase-2/sittings .claude/worktrees/sittings origin/phase-2-english`

- [ ] **Step 2: Change `run-controller.md`.**
  - « Sittings »: at a sitting's end, the run controller launches the next sitting with the command above and
    the start prompt. It then tells the maintainer the new session's name and stops. It no longer asks the
    maintainer to paste anything.
  - The loop, `needs design`: launch a design sitting with the command and `design-sitting.md`'s prompt, then
    stop.
  - The loop, a new step 1b. A task whose class is `sitting` is not dispatched to a task controller. The run
    controller:
    1. sets its row to `in progress`;
    2. launches a session with the brief prompt above;
    3. stops the run.

    Model: `opus`.
  - « For the maintainer »: after a cut-off, wait six minutes (unchanged). Then whichever Claude session the
    maintainer is talking to launches the next sitting with the command. The maintainer never starts one by
    hand.
  - Add one line under « Sittings »: a launched session starts in the run's worktree, so the background-session
    guard does not move it.

- [ ] **Step 3: Change `design-sitting.md`.** A design sitting ends in three steps:
  1. it writes its hand-back to `<WS>/tmp/design-<task>.md`;
  2. it launches the next run sitting with the command and the start prompt;
  3. it stops.

- [ ] **Step 4: Change `ledger-template.md`.** A Status row's class may be `engine`, `mechanical` or
  `sitting`.

- [ ] **Step 5: Check that a launch really starts.** From `.claude/worktrees/sittings`:
  - launch a throwaway session with the command, `--model haiku` in place of `opus`, and the prompt « Write the
    word ok to `.superpowers/launch-check.txt`, then stop. »;
  - wait for it to end;
  - check that the file holds `ok`;
  - delete the file.

  Expected: the file exists, and the session's transcript shows no call to EnterWorktree.

- [ ] **Step 6: Commit, push, open the pull request.** The commit subject is
  `docs(plan-runs): sittings launch the next sitting themselves`. Open the pull request into
  `phase-2-english`, closing the ticket.

---

## The run

Tasks 1–17, in order. A task's blocking edges are listed after Task 17.

### Task 1: Pin every item id to its Dutch

**Class:** mechanical

Ids are positional: `<unit>:w<i>` and `<unit>:p<i>` (`src/content/index.js:44-49`). Inserting, removing or
reordering a word silently gives every later id another word's history. Phase 2 rewrites every content line,
so the ids are pinned first.

**Files:**
- Create: `test/data/ids.tsv`
- Modify: `test/content.js` (a fifth check, before the final line; the header says « Cinq contrôles »)
- Modify: `src/content/index.js:1-2` (header comment)

**Interfaces:**
- Produces: `test/data/ids.tsv`, one line per built-in item (`unit !== 'eigen'`), in `allItems()` order:
  `<id>\t<nl>`, with `nl` as the item holds it after load.

- [ ] **Step 1: Write the failing check.** Add it to `test/content.js`:

```js
  /* ====================================== 5. chaque id garde son néerlandais */
  /* Les ids sont des positions (« overleven:w3 ») : insérer, retirer ou déplacer un
     mot donne son historique à un autre. Ajouter en fin d'unité passe ; une
     correction du néerlandais met à jour test/data/ids.tsv dans le même commit. */
  const IDS = path.join(__dirname, 'data', 'ids.tsv');
  const pinned = fs.existsSync(IDS) ? fs.readFileSync(IDS, 'utf8').split('\n').filter(Boolean).map(l => l.split('\t')) : [];
  ok(pinned.length > 0, 'test/data/ids.tsv absent ou vide');
  let moved = 0;
  pinned.forEach(([id, nl]) => {
    const it = NL.content.byId(id);
    if (!it || it.nl !== nl) { moved++; ok(false, id + ' devait être « ' + nl + ' », est ' + (it ? '« ' + it.nl + ' »' : 'absent')); }
  });
  console.log('  ids             ' + (pinned.length - moved) + ' / ' + pinned.length + ' à leur place');
```

- [ ] **Step 2: Run it.** `node test/content.js .` — Expected: FAIL `test/data/ids.tsv absent ou vide`.

- [ ] **Step 3: Write the list.** Generate it with a one-off script in `<WS>/tmp/ids.js`, run as
  `node "<WS>/tmp/ids.js" .`:

```js
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]);
const B = require(path.join(ROOT, 'test/lib/browser')).open({ root: ROOT, seed: 1, skip: ['src/app.js'] });
B.NL.state.open().then(() => {
  B.NL.content.refresh();
  const rows = B.NL.content.allItems().filter(it => it.unit !== 'eigen').map(it => it.id + '\t' + it.nl);
  fs.writeFileSync(path.join(ROOT, 'test/data/ids.tsv'), rows.join('\n') + '\n');
  console.log(rows.length + ' ids');
});
```

  Expected: `439 ids`.

- [ ] **Step 4: Run the check again.** `node test/content.js .` — Expected: `ids 439 / 439 à leur place` and
  `CONTENU CONFORME`.

- [ ] **Step 5: Watch it catch an insertion, then undo it.**
  - Insert `W('test', 'test'),` as the first word of unit 1 in `src/content/lexicon.a1.js`.
  - Run `node test/content.js .`. Expected: FAIL from `overleven:w0` on.
  - Remove the line. Run `git diff --stat src/` — Expected: nothing.

- [ ] **Step 6: Correct the header of `src/content/index.js`.** Lines 1–2 now read: « Flattens the curriculum
  into addressable items and answers questions about progress. An item's id is its unit and its position in
  it (`overleven:w3`): words and phrases are only ever appended, and `test/content.js` pins every id to its
  Dutch. »

- [ ] **Step 7: Build and commit.**
  - Run `sh build.sh`.
  - Commit `test/data/ids.tsv`, `test/content.js`, `src/content/index.js`, `index.html` and `artifact.html`
    with the subject `test: pin every item id to its Dutch`.

### Task 2: One place reads a meaning: the gloss module

**Class:** engine

After this task, every meaning and every prose field is read through `NL.gloss`. The display stays French
(`current()` is `'fr'` until Task 5), so nothing on screen changes. The new suite proves it on a course whose
every meaning also carries a dummy English.

**Files:**
- Create: `src/core/gloss.js`
- Modify: `build.sh` (`SRC`: `src/core/gloss.js` right after `src/core/util.js`)
- Modify: `src/ex/index.js`:
  - `:66-71` (`senses`, `sameSense` move into the gloss module; `NL.ex.sameSense` stays and re-exports it);
  - `:90-132` (`wordClass`, `others`);
  - the gloss reads at `:166`, `:179-180`, `:189`, `:199`, `:210`, `:214`, `:224`, `:228`, `:239`, `:264`,
    `:297`, `:325`, `:477`, `:508`, `:549-580`.
- Modify: `src/content/index.js:62-64` (the cognate flag) and `:139-147` (`listenClips`: add `en`, read `from`
  through the gloss)
- Modify: `src/ui/listen.js:20-21`, `:55-60` (`build`), `:85`
- Modify: the prose reads that print a gloss or a prose field:
  - `src/ui/home.js:51, 54, 109, 112, 118, 130-133`;
  - `src/ui/library.js:27, 59, 68, 105-110, 122, 140, 150-151, 161, 173`;
  - `src/ui/mistakes.js:24`;
  - `src/ui/scenario.js:28-30, 54, 89, 92, 100-103, 108, 111, 114, 124, 168, 171`;
  - `src/ui/session.js:439`;
  - `src/ui/shell.js:97`.

  The voice notes (`home.js:36`, `shell.js:140`) are interface text, moved in Task 3.
- Create: `test/lib/prose.js`, `test/lang.js`
- Modify: `test/run-all.sh` (add `node test/lang.js "$ROOT"` after `test/screens.js`)
- Modify: `test/firstrun.js:70` (`pairs[a].fr` → `pairs[a].gloss`)

**Interfaces:**
- Produces `NL.gloss`. Each entry, with its signature and its rule:
  - `use(lang: 'en'|'fr')` sets the language read. `current(): 'en'|'fr'`, `'fr'` until Task 5 calls `use`.
    `other(lang): 'en'|'fr'`.
  - `has(x, lang): boolean` — `x[lang]` is a non-blank string.
  - `langOf(x): 'en'|'fr'`:
    - a plain string → `'fr'`;
    - otherwise `current()` if `has(x, current())`, else `other(current())`.
  - `of(x, lang?): string`, the text to show:
    - a plain string → itself;
    - `null` or `undefined` → `''`;
    - `x[lang]` is `null` → `''` (a note with nothing for that reader);
    - otherwise `x[langOf(x)]`.

    It takes a prose pair or an item alike.
  - `pair(g): { fr, en }` — `typeof g === 'string' ? { fr: g } : { fr: g.fr, en: g.en }`. Content helpers
    spread it onto the record (Task 7 changes them to do so).
  - `bare(item, lang?): string`, the gloss in `lang` (default `langOf(item)`) without its article:
    - `'fr'` → `U.bareFr`;
    - `'en'` → a leading « the », « a » or « an » stripped, unless the text is a sentence (the rule
      `U.bareFr` uses).
  - `senses(item, lang): string[]` — `bare(item, lang)` split on « / », each normalised. `[]` when
    `!has(item, lang)`.
  - `sameSense(a, b): boolean` is today's rule, for grading and siblings: a shared French sense, or the same
    `U.norm(U.bare(nl))`.
  - `sameMeaning(a, b): boolean`, for wrong options: `sameSense(a, b)`, or a shared English sense.
  - `wordClass(item, lang?): 'noun'|'verb'|'other'|<kind>`:
    - French is today's rule;
    - in English, `'verb'` when the first sense matches `/^to\s+\S/` and the bare Dutch ends in `en`.
  - `cognate(item): boolean` — `item.kind === 'word'`, and `U.ratio(U.bare(item.nl), g) > 0.62`, where `g` is:
    - `bare(item, 'fr')` in French;
    - in English, `bare(item, 'en')` without a leading « to ».

    It is computed in `langOf(item)`.
- Produces a match pair `{ id, nl, gloss, lang, item }`:
  - the card's tag is `lang.toUpperCase()` (« EN » or « FR »);
  - `fits(t, lk, rk)` compares `gloss` and `nl` as shown.
- Produces `test/lib/prose.js`, which exports
  `{ PROSE: ['name','blurb','note','title','rule','explain','ask','what','h','place','outro','hint'],
  COLLECTIONS: ['units','patterns','openTasks','register','hetRules','deRules','sheets','scenarios'] }`.
- Produces `test/lang.js` with `boot(prepare)`, `pairUp(C)`, `text(html)` and `views(B, visit)`. Later tasks
  add their checks to this file.

- [ ] **Step 1: Write the failing suite `test/lang.js`.**

  The header and the helpers. `boot` and `pairUp` are the proven prototype's, word for word, with
  `COLLECTIONS` now imported. `text` also keeps the attributes a screen reader reads:

```js
/* La langue d'affichage. Le cours se charge tel quel, ou « apparié » : chaque sens et
   chaque texte reçoit un anglais factice (EN0, EN1…). L'écran montre alors ce qu'il
   montrerait une fois le contenu traduit, sans attendre la traduction. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const browser = require('./lib/browser');
const { PROSE, COLLECTIONS } = require('./lib/prose');
const ROOT = process.argv[2] || path.join(__dirname, '..');
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

function pairUp(C) {
  let n = 0;
  const walk = (v, key) => {
    if (Array.isArray(v)) return v.map(x => walk(x, key));
    if (v && typeof v === 'object') {
      if (typeof v.fr === 'string' && v.en === undefined) v.en = 'EN' + (n++);
      Object.keys(v).forEach(k => { v[k] = walk(v[k], k); });
      return v;
    }
    if (typeof v === 'string' && PROSE.indexOf(key) >= 0) return { fr: v, en: 'EN' + (n++) };
    return v;
  };
  COLLECTIONS.forEach(k => { C[k] = walk(C[k], k); });
  return n;
}
function boot(prepare) {
  const B = browser.open({ root: ROOT, seed: browser.SEED, byId: 'stub', media: true, skip: ['src/app.js'],
    voices: [{ name: 'Microsoft Bart - Dutch (Belgium)', lang: 'nl-BE', localService: true }] });
  if (prepare) prepare(B.NL);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8'), B.ctx);
  return B;
}
/* Le texte lu : balises retirées, mais aria-label, placeholder, title et alt gardés. */
const text = html => String(html)
  .replace(/\s(aria-label|placeholder|title|alt)="([^"]*)"/g, ' > $2 <')
  .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
```

  Then `views(B, visit)`. Its body is the implementer's; the contract is fixed:
  - it calls `visit(name, html)` with `B.app.innerHTML` for every state below, in this order;
  - it seeds records with `put`/`fresh`, copied from `test/screens.js`.

  The states, in order:
  1. The 12 screens of `test/screens.js`'s `SCREENS`, then `compte`, through `NL.ui.go`.
  2. Every sheet, `NL.ui.go('spiek', id)`.
  3. The `instellingen` and `reset-confirm` panels, and the export and import cards.
  4. Every grammar card, through `NL.screens.leerpad.click({ dataset: { id } }, { act: 'gram' })`.
  5. The library's add form, `{ act: 'addform' }`.
  6. With one own word added, the `woorden` screen.
  7. Every scenario, walked to its end with `test/sim.js`'s click loop (`step: 'next'`, `choice: '0'`,
     `self: '1'`, `act: 'accept'`, until `scn-done`).
  8. Listening: `begrijpen`, walked to its done screen, then `nazeggen`.
  9. For each rung `r` from 0 to 6:
     - every built-in record is put at rung `r` and due;
     - sessions run (`S.begin('vandaag'); NL.ui.go('sessie')`), answered with `test/lib/answer.js`'s `right()`
       and `next()`;
     - each session's `quit-session` sheet is visited once;
     - sessions repeat until every built-in item has been shown at that rung or `compose()` offers nothing.

  The checks:

```js
const plain = boot(null), paired = boot(NL => pairUp(NL.content));
Promise.all([plain.NL.state.open(), paired.NL.state.open()]).then(() => {
  /* 2a. Apparié, en français, l'écran est celui d'aujourd'hui. Les deux démarrent
     avec la même graine : une différence est une vraie différence. */
  const a = [], b = [];
  views(plain, (n, h) => a.push(n + ' | ' + text(h)));
  views(paired, (n, h) => b.push(n + ' | ' + text(h)));
  ok(a.length === b.length, 'pas le même nombre de vues : ' + a.length + ' / ' + b.length);
  a.forEach((s, i) => ok(s === b[i], 'vue appariée différente : ' + s.slice(0, 120)));
  b.forEach(s => ok(!/\[object|undefined|\bEN\d/.test(s), 'trou ou anglais en vue française : ' + s.slice(0, 120)));
  /* 2b. Le jeu de mots transparents est celui d'aujourd'hui. */
  const U = plain.NL.util, was = it => it.kind === 'word' && U.ratio(U.bare(it.nl), U.bareFr(it.fr)) > 0.62;
  plain.NL.content.allItems().forEach(it => ok(it.cognate === was(it), 'transparence changée : ' + it.id));
  // 2c and 2d follow, then the summary line.
});
```

  2c, own words in the other language (Review Focus 3). Set-up:
  - boot paired, display French;
  - add own word `{ nl: 'de vergaderzaal', en: 'meeting room', kind: 'word' }` and own phrase
    `{ nl: 'ik ben te laat', en: "I'm late", kind: 'phrase' }`, both seen at rung 2.

  For each own item, over 50 calls each of `NL.ex.get('pick').build(it)` and `NL.ex.get('recall').build(it)`:
  - pick's `prompt` is its English, and recall's right option (`ok: true`) has its English as `label`;
  - no option's `label` is `''` or `'undefined'`.

  Over 50 recall builds of every built-in item of unit 1:
  - no option is `'meeting room'` or `"I'm late"`.

  2d, no second right answer in the language read (Review Focus 5). Set-up:
  - boot with a `prepare` that sets unit 1's `words[1].fr = words[0].fr + 'x'`, then runs `pairUp`;
  - give both words `en = 'shared'`, then call `NL.gloss.use('en')`.

  Assertions:
  - Over 100 recall builds of `words[0]`'s item, `'shared'` appears once among the options.
  - Over 100 match builds that include both items, no two right cards have equal `U.norm(gloss)` unless
    `fits` joins them.
  - Over 50 builds of the listening screen, the three options are pairwise different after `U.norm`.

  The suite ends with
  `console.log('\n' + checks + ' contrôles, ' + (fails === 0 ? 'LANGUE CONFORME' : fails + ' ÉCHEC(S)'))`
  and `process.exit(fails ? 1 : 0)`.

- [ ] **Step 2: Run it.** `node test/lang.js .` — Expected:
  - FAIL in 2a, with `[object Object]` on six screens;
  - FAIL in 2c and 2d (`NL.gloss` undefined).

- [ ] **Step 3: Write `src/core/gloss.js` to the Interfaces above, then add it to `SRC`.** Its comments are in
  French. Then make these changes:
  - `src/content/index.js`:
    - `it.cognate = NL.gloss.cognate(it)`;
    - `listenClips` gains `en: st.them.en` and reads `from` through `NL.gloss.of`.
  - `src/ex/index.js`:
    - every read of `item.fr`, `x.fr`, `t.drill.fr` and `t.item.fr` goes through `NL.gloss.of` or
      `NL.gloss.bare`;
    - the drill fallback becomes `{ nl: item.nl, fr: item.fr, en: item.en }`.
  - `others(item, n, field)` takes `'nl'` or `'gloss'`. It keeps its weights, and judges in the language read,
    `lang = NL.gloss.langOf(item)` (#12 line 104):
    - the pool keeps only items with `NL.gloss.has(x, lang)`;
    - a `'gloss'` label is `NL.gloss.bare(x, lang)`;
    - word class is `NL.gloss.wordClass(x, lang)`, for the item and for each candidate;
    - it filters with `NL.gloss.sameMeaning` where it used `sameSense`.
  - Match uses the pair shape above.
  - Listening (`build()`):
    - the pool keeps clips with `NL.gloss.has(x, NL.gloss.langOf(c))`;
    - it drops a clip whose label equals the right one after `U.norm`;
    - its labels come through `NL.gloss.of(x)`.
  - The screens, at the lines listed under Files: every prose field and gloss printed goes through
    `NL.gloss.of(x)`, and a guard on a field's presence (`if (it.note)`) tests `NL.gloss.of(it.note)` instead.

- [ ] **Step 4: Run the suites.**
  - `node test/lang.js .` — Expected: `LANGUE CONFORME`.
  - Then `node test/screens.js .`, `node test/typed.js .`, `node test/firstrun.js .`, `node test/smoke.js .`
    and `node test/engine.js .` — Expected: each passes as before.

- [ ] **Step 5: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat: one gloss module reads every meaning and every prose field`.

### Task 3: Every French string of the interface lives in `fr.js`

**Class:** mechanical

**Files:**
- Modify: `src/core/fr.js` (new keys for every string moved)
- Modify, the strings found on `71b6698`:
  - `src/ex/index.js:431, 456, 499`; the 14 `kicker: NL.t.ex…` become getters,
    `get kicker() { return NL.t.exPick; }`;
  - `src/ui/doctor.js:10-17` (`TIERS`: its `label` and `note` are read when drawn), `:24, 54, 60, 61, 72, 94,
    95, 107, 127, 133-136`;
  - `src/ui/home.js:35-36` (voice notes, read when drawn), `:108`;
  - `src/ui/library.js:41` (placeholder), `:59` (« Mes mots »), `:146`, `:157`;
  - `src/ui/scenario.js:79`;
  - `src/ui/shell.js:146, 149, 150, 193, 246, 254, 319`; nav's `fr` becomes `label` in `fr.js` and at
    `shell.js:71`;
  - `src/core/speech.js:51` (the note is a key read when drawn);
  - `src/ui/listen.js` (« Écouter » and any other literal the checks below find).
- Modify: `test/lang.js` (check 3)

**Interfaces:**
- Consumes `boot`, `views` and `text` from `test/lang.js` (Task 2).
- Produces: `NL.t` holds every interface string. `nav[i]` is `{ id, label, nl }`.

- [ ] **Step 1: Add check 3 to `test/lang.js`: markers, then a source scan.**

  The marker check:
  - boot with a `prepare` that replaces every leaf of `NL.t`, and of each table in `NL.tables` once Task 4 has
    made them, with `⟦key⟧`. A function becomes a function returning `⟦key⟧`; `nav`'s `id` and `nl` are kept;
  - the same `prepare` replaces every string under a `fr` or `en` key of the content, and every prose string,
    with `⟪n⟫`, the three French pages included;
  - over `views`, after removing every `⟦…⟧` and `⟪…⟫`, each remaining word must be one of these:
    - a token of a Dutch content string (`nl`, `be`, sentence `nl`);
    - a digit;
    - in `ALLOW`, an exact list that starts with the voices' and browsers' names, the storage engines, `Vlaams`
      and `de / het`, each with a comment saying why.

  The scan: every quoted literal of 3 or more letters in `src/` matches `FR` below, except in:
  - `src/core/fr.js` and `src/core/en.js`;
  - `src/content/`;
  - comments (strip `/\/\*[\s\S]*?\*\//g` and `//…` first).

  A match fails unless it is in `ALLOW`.

```js
const FR = /[éèêàâçùûôîœ’]|\b(le|la|les|un|une|des|du|de|et|pas|ou|ton|ta|tes|tu|te|toi|ici|dans|avec|sur|pour|qui|que|ne|nord)\b/i;
```

- [ ] **Step 2: Run it.** `node test/lang.js .` — Expected: FAIL. The failures include « Mes mots »,
  « Écouter », the doctor's tiers, « Copier le texte » and « Copié. ».

- [ ] **Step 3: Move every string the check names into `fr.js`.**
  - Each string gets a key named in the style of its neighbours, and the code reads `NL.t.<key>` when it draws.
  - A proper name goes in `ALLOW` with its comment. Any French word goes to `fr.js`; it never goes in
    `ALLOW`.

- [ ] **Step 4: Run the suites.** `node test/lang.js .`, `node test/screens.js .`, `node test/smoke.js .`,
  `node test/journey.js . nl-BE OPR` — Expected: each passes.

- [ ] **Step 5: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `refactor: every French interface string lives in fr.js, read when drawn`.

### Task 4: The English interface table

**Class:** mechanical

**Files:**
- Modify: `src/core/fr.js:4`. `NL.t = {` becomes `NL.tables = NL.tables || {}; NL.tables.fr = {`. After the
  table: `NL.t = Object.assign({}, NL.tables.fr);`. Update the header comment: two tables, the same keys.
- Create: `src/core/en.js` (`NL.tables.en = { … }`, every key of `fr.js`, in the same order)
- Modify: `build.sh` (`SRC`: `src/core/en.js` right after `src/core/fr.js`)
- Modify: `test/smoke.js:146-148` (drop `'Everything you have met'` from the build sweep)
- Modify: `test/lang.js` (check 4)

**Interfaces:**
- Produces `NL.tables.fr` and `NL.tables.en`. `NL.t` stays French until Task 5.

- [ ] **Step 1: Add check 4 to `test/lang.js`.** For every key of `NL.tables.fr`:
  - `NL.tables.en` has it, and of the same type: a string, a function with the same `length`, or an array of
    the same length;
  - a function returns a string, in both tables, for the sample arguments `(3, 7)`;
  - `nav` keeps each entry's `id` and `nl`;
  - every run of digits and every `{…}` in the French appears in the English, and back;
  - no English value is equal to its French one, unless the key is in `SAME`, an exact list with a comment
    each;
  - `NL.tables.en` has no key that `fr` lacks.

- [ ] **Step 2: Run it.** `node test/lang.js .` — Expected: FAIL `NL.tables` undefined.

- [ ] **Step 3: Make the change.** Do the `fr.js` change, then write `en.js` to the Global Constraints. The
  tone is the French one's: short, second person, plain.

- [ ] **Step 4: Run the suites.** `node test/lang.js .`, `node test/smoke.js .` — Expected: each passes.

- [ ] **Step 5: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat: the English interface table, the same keys as the French`.

### Task 5: The display language: setting, switch and notice

**Class:** engine

**Files:**
- Create: `src/core/lang.js`
- Modify: `build.sh` (`SRC`: `src/core/lang.js` after `src/content/index.js`, before `src/ex/index.js`)
- Modify: `src/core/state.js`:
  - `:190` (`clearAll` keeps `displayLang`);
  - `:299` (`importAll`: a meta without `displayLang` keeps the device's).
- Modify: `src/ui/shell.js`:
  - `render()` (`:75-84`): before drawing, outside `sessie` and `scenario`, call `NL.lang.apply(false)`.
    While `NL.lang.notice()` is not empty, draw it at the top of `<main class="screen">`, with the existing
    `.notice` style.
  - `go()` (`:28`): call `NL.lang.seen()` after the quit-session guard, before `route = to`.
  - The settings sheet: a « Language » block.
  - The click handler (`:289`): `[data-display-lang]` and
    `if (d.displayLang) { NL.lang.set(d.displayLang); render(); return; }`.
- Modify: `src/ui/library.js:83-86`. The own word's gloss is stored under `NL.lang.current()`, not under `fr`.
- Modify: `src/app.js`. After `NL.state.migrate()`: `NL.lang.apply(true)`.
- Modify: `src/core/fr.js` and `src/core/en.js`. The keys and their text:
  - `setLang`: « Language » / « Langue »;
  - `langOther`: « French » / « Anglais »;
  - `langNotice`, in English: « Reading in English. The reference sheets are under More; each says which
    language it helps with. »;
  - `langNotice`, in French: « Lecture en français. Les fiches de référence sont dans Plus ; chacune dit pour
    quelle langue elle est faite. ».
- Modify: `test/lib/browser.js:174`. `documentElement` records its attributes in `B.ctx.document.documentElement.attrs`.
- Modify, the tests that assert a French literal: they now read `NL.t.<key>`.
  - `test/journey.js:268, 269, 279, 339, 343`;
  - `test/screens.js:31` (`/ma[iî]tris/` also matches `master`), `:145`, `:302`;
  - `test/typed.js:260`.
- Modify: `test/smoke.js`:
  - `:380-412`: the second-answer check reads through `NL.gloss`, and runs in both languages;
  - `:472-486`: the twin match is pinned to French with `NL.state.setMeta({ displayLang: 'fr' }); NL.lang.apply(true)`.
- Modify: `test/lang.js` (check 5)

**Interfaces:**
- Consumes: `NL.gloss.use`, `NL.tables.fr` and `NL.tables.en`, and `NL.content.refresh`.
- Produces `NL.lang`:
  - `current(): 'en'|'fr'` — `meta().displayLang === 'fr' ? 'fr' : 'en'`.
  - `apply(quiet: boolean): boolean`. When `current()` differs from the language last applied (none at load,
    so the first call always applies), it:
    1. empties `NL.t` and assigns `NL.tables[current()]` into it, keeping the same object;
    2. calls `NL.gloss.use`, then `NL.content.refresh()`, which recomputes cognates;
    3. sets `<html lang>` to `en-GB` or `fr`;
    4. unless `quiet`, sets the notice.

    It returns `true` when it switched.
  - `set(lang)` — `setMeta({ displayLang: lang })`, then `apply(false)`.
  - `notice(): string` — `NL.t.langNotice` while it is set, `''` otherwise. `seen()` clears it. Nothing is
    stored.

- [ ] **Step 1: Write check 5 in `test/lang.js`.**
  - **5a** (Review Focus 1):
    - `NL.sync.mergeMeta({ displayLang: 'fr', updatedAt: 1 }, { updatedAt: 2 }).displayLang === 'fr'`;
    - a fresh boot's `NL.state.meta()` has no `displayLang` key;
    - `NL.lang.current() === 'en'`.
  - **5b** (Review Focus 2). Start a session in English and keep `text(app)`. Then do what a sync pull does,
    `NL.state.setMeta({ displayLang: 'fr' }, true)`, and redraw with `NL.ui.render()`. Calling `render()`
    directly, without `app.js`'s route guard, proves `render()` guards itself.
    - The session's text is unchanged, and `<html lang>` is still `en-GB`.
    - Quitting to `vandaag` draws French, `<html lang>` is `fr`, and the notice shows once.
    - The next `go()` no longer shows it.
    - The same holds for a scenario.
  - **5c** (Review Focus 3):
    - in French display, the add form stores `{ nl, fr }`;
    - after `NL.lang.set('en')`, it stores `{ nl, en }`;
    - each own word is asked in the language it was typed in.
  - **5d** (Review Focus 4). Set `displayLang: 'fr'`. Then each of these keeps it: `importAll` of a backup
    whose meta has no `displayLang`, `resetProgress()`, and `clearAll()`.
  - **5e**, ADR 0004: `hallo` (with `en: 'hello'` in the fixture) is a cognate in English and not in French.
    It is recomputed at the switch.
  - **5f**, story 25. Boot with a `prepare` that:
    1. runs `pairUp`;
    2. then replaces every string under a `fr` key of the content, and every French prose string, with `⟪n⟫`;
    3. replaces each leaf of `NL.tables.fr` and of `NL.t` with `⟦fr:key⟧`, and each leaf of `NL.tables.en`
       with `⟦en:key⟧`.

    Then:
    - in English display, `views` show no `⟪` and no `⟦fr:`;
    - in French display, they show no `EN<n>` and no `⟦en:`;
    - `klanken` and `register` are skipped here until Task 13.
  - **2a and 2b now describe the French display.** After `state.open()`, both boots run
    `NL.state.setMeta({ displayLang: 'fr' }); NL.lang.apply(true)` before they read.
  - **5g**, the switch:
    - the settings sheet names the other language: « French » in English, « Anglais » in French;
    - a click on it switches without a reload.

- [ ] **Step 2: Run it.** `node test/lang.js .` — Expected: FAIL `NL.lang` undefined.

- [ ] **Step 3: Implement `src/core/lang.js` and the changes under Files.**

- [ ] **Step 4: Run the suites.** `node test/lang.js .`, `node test/smoke.js .`, `node test/screens.js .`,
  `node test/typed.js .`, `node test/sim.js .`, `node test/firstrun.js .`, `node test/journey.js . nl-BE OPR`,
  `node test/sync.js .` — Expected: each passes.

- [ ] **Step 5: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat: English by default, French a live switch that waits for the session's end`.

### Task 6: Every Dutch element declares Dutch

**Class:** mechanical

**Files:**
- Create: `test/lib/langs.js`
- Modify: `src/ex/index.js`, `src/ui/*.js` — every element whose text is Dutch content gets `lang="nl-BE"`.
- Modify: `test/lang.js` (check 6)

**Interfaces:**
- Produces `runs(html: string, rootLang: string): Array<{ text, lang }>`. A text run is the text between two
  tags. Its `lang` comes from the nearest enclosing `lang` attribute; otherwise it is `rootLang`.

- [ ] **Step 1: Write check 6.** In both display languages, over `views` of the plain course, every run whose
  `U.norm(text)` equals the `U.norm` of a Dutch content string has a `lang` starting with `nl`. The Dutch
  content strings are `nl`, `be`, and a sentence's `nl`.

- [ ] **Step 2: Run it.** `node test/lang.js .` — Expected: FAIL, listing runs of `vandaag`, `woorden` and the
  session.

- [ ] **Step 3: Add `lang="nl-BE"` where the check points.** Put it on the element that holds the Dutch,
  never on a wrapper that also holds English or French.

- [ ] **Step 4: Run the suites.** `node test/lang.js .`, `node test/screens.js .` — Expected: each passes.

- [ ] **Step 5: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat: every element holding Dutch declares it`.

### Task 7: What English is still owed, and lexicon A1

**Class:** engine

**Files:**
- Modify: `test/lib/prose.js` (add `has` and `owed`)
- Modify: `test/content.js` (check 6; the header says « Six contrôles »)
- Modify: `test/smoke.js:139-142`. Delete `ok(i.en === undefined, 'English gloss survived on ' + i.id)`. The
  comment becomes « every built-in item has a French gloss ».
- Modify: `test/screens.js:68, 70` (`units[0].name` read through `NL.gloss.of`)
- Modify: the helpers `W`, `P` (`lexicon.a1.js:10-11`, `lexicon.a1b.js`), `S` (`examples.js:19`), `D`
  (`grammar.js:8`), `T`, `C` (`scenarios.js:7, 9`) and `S` (`reference.js:103`). Each spreads `NL.gloss.pair(g)`
  onto the record, in place of `fr`.
- Modify: `src/content/lexicon.a1.js`, units 1–6: every `fr` gets its `en`, and every prose field becomes a
  pair.

**Interfaces:**
- Produces `owed(v, where, key, out): Array<{ where, ok }>`, in `test/lib/prose.js`. It is the measured rule.
  `ok` is `has(v.en)`, or `key === 'note' && v.en === null`:

```js
function owed(v, where, key, out) {
  if (Array.isArray(v)) { v.forEach((x, i) => owed(x, where + '[' + i + ']', key, out)); return out; }
  if (v && typeof v === 'object') {
    if (PROSE.indexOf(key) >= 0 && 'fr' in v) { out.push({ where, ok: has(v.en) || (key === 'note' && v.en === null) }); return out; }
    if (typeof v.fr === 'string') out.push({ where: where + '.fr', ok: has(v.en) });
    Object.keys(v).forEach(k => { if (k !== 'fr' && k !== 'en') owed(v[k], where + '.' + k, k, out); });
    return out;
  }
  if (typeof v === 'string' && PROSE.indexOf(key) >= 0) out.push({ where, ok: false });
  return out;
}
```

- Produces the batches (paths as `owed` writes them):

| batch | what | budget at the start |
|---|---|---|
| `lexiqueA1` | units with `n <= 6`, excluding `/\.drills\[/` | 282 |
| `lexiqueA1b` | units with `n > 6`, excluding `/\.drills\[/` | 263 |
| `exemples` | all unit drills | 414 |
| `grammaire` | `patterns` and `openTasks` | 110 |
| `references` | `register`, `hetRules`, `deRules`, `sheets` | 218 |
| `scenarios` | `scenarios` | 135 |

- [ ] **Step 1: Write check 6 in `test/content.js`.** Snapshot first: right after `browser.open`, before
  `NL.state.open()`, take `RAW = JSON.parse(JSON.stringify(...))` of the `COLLECTIONS`. Assert that it contains
  `{naam}`, which proves it was taken before the first build fills the names. Check 6 reads `RAW`. Then:
  - Per batch, the owed count goes in a `BUDGET` table, with the two-sided pattern of checks 2–4: over the
    budget fails, and under it fails with « lower the budget to … ».
  - `lexiqueA1` starts at `0`.
  - No `en` without a `fr` anywhere: 0.
  - Wherever both exist, the runs of digits and the `{…}` tokens are the same in `fr` and `en`.
  - The English clash guard: two items with an equal English sense share a French sense or their bare Dutch.
  - An item whose French is a verb (`wordClass` `'verb'` in French) has an English gloss starting with « to ».
  - An item whose Dutch contains `u` or `uw` as a word, and whose English contains `you` or `your`, carries
    « (formal) ».
  - A noun (`art` set) has no English gloss starting with « the », « a » or « an ».
  - Print one line per batch: `<batch> <owed> / <places> (budget <n>)`.

- [ ] **Step 2: Run it.** `node test/content.js .` — Expected: FAIL `lexiqueA1 282 … budget 0`.

- [ ] **Step 3: Change the helpers, then write lexicon A1's English.**
  - Write it to the Global Constraints.
  - Make the smoke and screens changes under Files.
  - If the clash guard fails, tell the two items apart in the English.

- [ ] **Step 4: Run the suites.** `node test/content.js .`, `node test/lang.js .`, `node test/smoke.js .`,
  `node test/screens.js .`, `node test/pace.js . 1` — Expected:
  - `lexiqueA1 0`, and the other five batches at their starting budget;
  - each suite passes.

  If `pace.js` fails, report its numbers. Do not change its thresholds.

- [ ] **Step 5: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat(content): the English owed is counted, and lexicon A1 is in English`.
  - Report « Disagreements » and « French-only points ».

### Task 8: Lexicon A1b in English

**Class:** mechanical

**Files:**
- Modify: `src/content/lexicon.a1b.js`, every unit
- Modify: `test/content.js` (`BUDGET.lexiqueA1b` → `0`)

- [ ] **Step 1: Set `BUDGET.lexiqueA1b` to `0`.** Run `node test/content.js .` — Expected: FAIL
  `lexiqueA1b 263`.
- [ ] **Step 2: Write the English to the Global Constraints.**
- [ ] **Step 3: Run the suites.** `node test/content.js .`, `node test/lang.js .`, `node test/pace.js . 1` —
  Expected: `lexiqueA1b 0`, and each passes. If `pace.js` fails, report its numbers; do not change its
  thresholds.
- [ ] **Step 4: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat(content): lexicon A1b in English`.
  - Report « Disagreements » and « French-only points ».

### Task 9: The example sentences in English

**Class:** mechanical

**Files:**
- Modify: `src/content/examples.js`
- Modify: `test/content.js` (`BUDGET.exemples` → `0`)

- [ ] **Step 1: Set `BUDGET.exemples` to `0`.** Run `node test/content.js .` — Expected: FAIL `exemples 414`.
- [ ] **Step 2: Write the English to the Global Constraints.** A sentence's English says what its Dutch says,
  in the register of its Dutch.
- [ ] **Step 3: Run the suites.** `node test/content.js .`, `node test/lang.js .` — Expected: `exemples 0`,
  and each passes.
- [ ] **Step 4: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat(content): example sentences in English`.

### Task 10: Grammar and open tasks in English

**Class:** mechanical

**Files:**
- Modify: `src/content/grammar.js`, `src/content/open.js`
- Modify: `test/content.js` (`BUDGET.grammaire` → `0`)

- [ ] **Step 1: Set `BUDGET.grammaire` to `0`.** Run `node test/content.js .` — Expected: FAIL `grammaire 110`.
- [ ] **Step 2: Write the English to the Global Constraints.** An explanation that leans on French grammar
  (« comme en français ») is rewritten for an English reader, or the point is left out and listed.
- [ ] **Step 3: Run the suites.** `node test/content.js .`, `node test/lang.js .` — Expected: `grammaire 0`,
  and each passes.
- [ ] **Step 4: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat(content): grammar and open tasks in English`.
  - Report « French-only points ».

### Task 11: Scenarios in English

**Class:** mechanical

**Files:**
- Modify: `src/content/scenarios.js`
- Modify: `test/content.js` (`BUDGET.scenarios` → `0`)
- Modify: `test/sim.js:87` (`s.title` through `NL.gloss.of`)

- [ ] **Step 1: Set `BUDGET.scenarios` to `0`.** Run `node test/content.js .` — Expected: FAIL
  `scenarios 135`.
- [ ] **Step 2: Write the English to the Global Constraints, and change `sim.js:87`.**
- [ ] **Step 3: Run the suites.** `node test/content.js .`, `node test/lang.js .`, `node test/sim.js .` —
  Expected: `scenarios 0`, and each passes.
- [ ] **Step 4: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat(content): scenarios in English`.

### Task 12: Reference pages: translated or anchored, and the English false friends

**Class:** mechanical

**Files:**
- Modify: `src/content/reference.js`:
  - `register`, `hetRules`, `deRules` and `sheets` in English;
  - the anchors, as `NL.content.anchors = { sounds: 'fr', loans: 'fr', faux: 'fr', fauxEn: 'en',
    register: 'all', hetRules: 'all', deRules: 'all', sheets: 'all' }`.
- Create, in `src/content/reference.js`: `NL.content.fauxEn = [{ nl, en, trap }]`, wholly English, in both
  displays. Its entries: `eventueel`, `actueel`, `slim`, `raar`, `de brand`, `door`, `bellen` and `de map`.
  - `en` is what the Dutch means.
  - `trap` names the English word it looks like and what that one means.
- Modify: `src/ui/library.js` (`register`: a « fauxEn » section after `faux`; each section and each sheet
  shows its anchor label) and the `klanken` screen (its anchor label).
- Modify: `src/core/fr.js` and `src/core/en.js`. The keys and their text:
  - `anchorFr`: « For French speakers » / « Pour les francophones »;
  - `anchorEn`: « For English speakers » / « Pour les anglophones »;
  - `anchorAll`: « For every reader » / « Pour tous »;
  - `fauxEnTitle` and `fauxEnBody`, in the style of `fauxTitle` and `fauxBody`.
- Modify: `test/content.js`. `BUDGET.references` goes to `0`. Every budget is then `0`, so the `BUDGET` table
  is replaced by a single check, « nothing is owed ».
- Modify: `test/lang.js`. Check 6b: every reference section shows exactly one anchor label.

- [ ] **Step 1: Write the failing checks.** Set `BUDGET.references` to `0` and add check 6b. Run
  `node test/content.js .` and `node test/lang.js .` — Expected: FAIL `references 218`, and FAIL in 6b.
- [ ] **Step 2: Write the English pages, `fauxEn`, the anchors and their labels.** Then replace the budget
  table.
- [ ] **Step 3: Run the suites.** `node test/content.js .`, `node test/lang.js .`, `node test/screens.js .` —
  Expected: each passes.
- [ ] **Step 4: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat(content): reference pages in English or anchored, and the English false friends`.

### Task 13: Anchored pages and the page's metadata declare their language

**Class:** mechanical

**Files:**
- Modify: `src/ui/library.js`, the `klanken` screen. The rows of `sounds`, `loans` and `faux` sit in
  `lang="fr"` elements, and those of `fauxEn` in `lang="en"` ones.
- Modify: `build.sh:61-63` and the head of `artifact.html`:
  - `<html lang="en-GB">`;
  - the English meta description: « Learn Flemish Dutch: spaced repetition, speaking aloud, and the language
    as it is really spoken in Flanders. »
- Modify: `manifest.webmanifest`. The description becomes the same English sentence, and `"lang": "en"`.
- Modify: `test/smoke.js:143-151`:
  - the block is renamed « build sweep »;
  - it checks `<html lang="en-GB">` and the English description in `index.html`.
- Modify: `test/lang.js`. Check 5f covers `klanken` and `register` again. A run inside a `lang="fr"` or
  `lang="en"` element is judged in that language.

- [ ] **Step 1: Write the failing checks.** In `smoke.js` and `lang.js`, as above. Run `node test/smoke.js .`
  and `node test/lang.js .` — Expected: FAIL on `lang="nl-BE"` and on `klanken`.
- [ ] **Step 2: Make the changes under Files.**
- [ ] **Step 3: Run the suites.** `node test/smoke.js .`, `node test/lang.js .` — Expected: each passes.
- [ ] **Step 4: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `feat: anchored pages and the page's metadata declare their language`.

### Task 14: The files the check sitting reads

**Class:** mechanical

**Files:**
- Create: `test/tools/check-files.js`

**Interfaces:**
- `node test/tools/check-files.js . "<out>"` writes, in `<out>`:
  - `glosses.tsv`: `id kind unit nl be fr en`, one line per built-in item.
  - `blind.tsv`: the same lines without `en`, for the blind pass.
  - `sentences.tsv`: `where nl fr en`, for every drill sentence and scenario line.
  - `prose.tsv`: `where fr en`, for every prose pair.
  - `interface.tsv`: `key fr en`, for every string key of the two tables. A function is sampled at `(3, 7)`.
- Each row's `where` is the path `owed()` gives. The tool prints each file's row count.

- [ ] **Step 1: Write the tool.**
- [ ] **Step 2: Run it.** `node test/tools/check-files.js . "<WS>/tmp/check"` — Expected:
  - five files;
  - `glosses.tsv` has 439 rows;
  - the rows of `glosses.tsv`, `sentences.tsv` and `prose.tsv` add up to the number of places `owed()` lists.
- [ ] **Step 3: Commit.** The subject is `test: the files a check of the English reads`.

### Task 15: The check sitting

**Class:** sitting

The run controller launches this task as a session of its own, on Opus. The session runs in the run's
worktree and does the steps below. It changes no tracked file.

- [ ] **Step 1: Write the files.** Run `node test/tools/check-files.js . "<WS>/tmp/check"`.

- [ ] **Step 2: The blind pass.**
  - A subagent on `opus` (the writers were `sonnet`) writes its own English for `blind.tsv`. It sees the
    Dutch, the French and the unit, never `en`.
  - Compare the senses after `U.norm`. A gloss that shares no sense with the blind one is flagged.

- [ ] **Step 3: The Wiktionary comparison.**
  - Download the Dutch extract of English Wiktionary from kaikki.org into its own empty folder,
    `<WS>/tmp/check/kaikki/`.
  - For each word, flag it when none of its English senses appears among the glosses of its headword.
  - Report « N of M words agree ».
  - The download stays there: nothing from it enters a tracked file (CC BY-SA). It flags; it never supplies
    English.

- [ ] **Step 4: The sentence reader.**
  - A subagent that wrote none of the English reads `sentences.tsv` and `prose.tsv`, Dutch against English.
  - It flags meaning errors only, with a one-line reason each.

- [ ] **Step 5: Tatoeba.**
  - Download Tatoeba's Dutch and English sentence exports and its links into `<WS>/tmp/check/tatoeba/`.
  - For each sentence whose Dutch equals a Tatoeba Dutch sentence after `U.norm`, compare the English with the
    linked English sentences.
  - Report « N of M sentences found; K agree ». Disagreements go to the sentence reader's list for a verdict.

- [ ] **Step 6: Write `<WS>/tmp/check/flagged.md`.** One line per flag:
  `where | nl | fr | en | flagged by | proposed English | verdict`. The verdict is `fix` or `keep`, with a
  reason.

- [ ] **Step 7: Draw the random 50.** Take a random 50 (seed 12) of the unflagged rows, spread over glosses,
  sentences, prose and interface in proportion to their counts.

- [ ] **Step 8: Post the comment.** Post `flagged.md` and the 50, as `nl | fr | en`, as one comment on the
  phase 2 pull request: `gh pr comment <n> --body-file "<WS>/tmp/check/comment.md"`. Open it with the counts of
  steps 2–5.

- [ ] **Step 9: Hand back.**
  - Write `<WS>/tmp/check/handback.md`: the counts, the comment's URL, and the number of `fix` lines.
  - Set Task 15's Status row to `done`.
  - Launch the next run sitting with Task B's command.

### Task 16: Apply the check's fixes

**Class:** mechanical

**Files:**
- Modify: the content files and `src/core/en.js`, at the rows `flagged.md` marks `fix`
- Read: `<WS>/tmp/check/flagged.md`

- [ ] **Step 1: Apply each `fix` row's proposed English.** Apply it exactly. If a row cannot be applied as
  written, the status is `NEEDS_RULING`, with the row.
- [ ] **Step 2: Run the suites.** `node test/content.js .`, `node test/lang.js .` — Expected: each passes.
- [ ] **Step 3: Check every fix landed.**
  - Run `node test/tools/check-files.js . "<WS>/tmp/check-after"`.
  - Every `fix` row's proposed English is in the new files. List any that is not.
- [ ] **Step 4: Build and commit.**
  - Run `sh build.sh`.
  - Commit with the subject `fix(content): the English the check flagged`.

### Task 17: The docs say what phase 2 changed

**Class:** mechanical

**Files:**
- Modify: `CLAUDE.md`:
  - « User-facing text lives in `src/core/fr.js`. `test/smoke.js` fails the build if an English interface
    string reaches `index.html`. » becomes « User-facing text lives in `src/core/fr.js` and `src/core/en.js`,
    under the same keys; `test/lang.js` fails the build if one lacks a key or a screen mixes languages. »
  - Under « Conventions », add a line: meanings and prose are read through `NL.gloss`; the display language
    through `NL.lang`.
- Modify: `TESTING.md`:
  - `test/lang.js`: what it covers (checks 2–6), and what it cannot see — whether the English is natural,
    which is the check sitting's and the maintainer's job.
  - `test/content.js`: checks 5 and 6.

- [ ] **Step 1: Make the changes.**
- [ ] **Step 2: Check.** `grep -n "English interface string" CLAUDE.md TESTING.md` — Expected: nothing.
- [ ] **Step 3: Commit.** The subject is `docs: phase 2's two tables, the gloss module and test/lang.js`.

### Blocking edges

- Before the run: B ← A; Task 1 ← B.
- The interface: 2 ← 1; 3 ← 2; 4 ← 3; 5 ← 2, 4; 6 ← 5.
- The content: 7 ← 5; 8, 9, 10 and 11 ← 7 each; 12 ← 7, 8, 9, 10, 11.
- The end: 13 ← 6, 12; 14 ← 12; 15 ← 14; 16 ← 15; 17 ← 16.

## After the run

1. The run controller dispatches the closing review (`closing-review.md`).
2. The maintainer reads the check's comment on the pull request. An error found in the random 50 widens that
   kind's check before the merge.
3. The maintainer reviews the branch and merges `phase-2-english` into `main`, which deploys.
4. A checkpoint session (#12 line 161) judges whether the English reads naturally, on the deployed app.

## Decisions taken while writing this plan

For the maintainer's review. None changes the spec.

- `clearAll()` keeps `displayLang`, like a reset. An account change does not change the language read.
- The anchor labels are « For every reader » / « Pour tous » for pages translated for everyone.
- The notice's copy is as in Task 5. It stays on screen until the learner goes to another screen.
- The English false friends are `eventueel`, `actueel`, `slim`, `raar`, `de brand`, `door`, `bellen` and
  `de map`.
- The switch's button carries `data-display-lang`.
- The sentence reader also reads prose (notes, explanations), not only sentences.
- Tasks A and B merge into `phase-2-english`, not `main`: their wording is true only once phase 2 lands.
- Task 3 adds a scan of the sources beside the marker check. It catches toasts and errors no view draws.
- A note with nothing for an English reader is `en: null` and is not drawn in English. The count accepts
  `null` for notes only.
- English nouns are glossed without an article.
- `render()` itself never applies a switch inside `sessie` or `scenario`. Today only `app.js`'s sync handler
  skips those routes; any other redraw would otherwise switch mid-session.
