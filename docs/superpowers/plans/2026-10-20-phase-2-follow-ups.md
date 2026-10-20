# Phase 2 Follow-ups — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/`. A run controller
> (`run-controller.md`) hands one task at a time to a task controller; do not use a skill's controller loop.
> Implementers read `docs/agents/plan-runs/run-notes.md` before their brief; where the notes and a command
> here differ, the notes win. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** What phase 2's reviews left open is closed before phase 3 adds content. The checks that guard the
two languages fail when they should. The check tool shows both sides of every place. A meaning shown in the
other language is marked as that language. The language notice shows on every screen, and says when another
device made the change.

**Architecture:**
- No new module. Five tasks, each from a ticket that hangs off #12, on the code as phase 2 left it.
- Tasks 1 and 2 change tests and the check tool only. Task 3 changes a comment and a line of `CLAUDE.md`.
  Tasks 4 and 5 change the app, each fix with a check that fails on the old code.
- Task 5 is the one `engine` task: it touches `src/core/sync.js`, so an Opus reviewer reads it.

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`).
- `gh` for tickets and the pull request.

**Spec:**
- GitHub issue #12, and the four tickets this plan implements: #67 (Task 1), #68 (Task 2), #70 (Task 3),
  #69 (Tasks 4 and 5). Each task carries its ticket's decisions; the ticket is not needed to do it.
- `GLOSSARY.md`, and ADRs 0006 (a reset is a timestamp), 0008 (grading ignores the display language) and
  0009 (the switch is live, never mid-session).
- The ledger's ruling « after the run » in phase 2's run (2026-10-20): #67 and #68 first, #69 after #67,
  sonnet implements, haiku verifies, and #69's sync item is reviewed on opus. The code review of PR #44 added
  #69 items 9–11 and #70.

## How far to trust this plan

- Every task's draft was tried on a scratch copy of `a7d5e76`, the head of `phase-2-english`, whose tree is
  `main`'s after PR #44 (`6adfd27`): each red and green count in a step was seen there. Line numbers are
  measured on that tree. If a line has moved, match on its content.
- Task 4's checks were tried before Task 1 put `test/lang.js` on a fixed clock, and the checks the Review
  Focus added after the drafts (69.1's session prompts, 69.1 bis, the end of the 69.3 block, Task 2's
  breakage) were not run. Where one fails for a reason the plan does not give, the implementer adapts the
  check, not the app, and says so in the report.
- Task 1 changes `test/lang.js` before Task 4 adds checks to it: Task 4 names its places by content, not by
  line.

## Set-up decisions

- The run works in the worktree `.claude\worktrees\follow-ups` of the clone at `%USERPROFILE%\dev\vlaams-phase-2`,
  on the branch `phase-2-follow-ups`, made from `main` at `6adfd27` (the merge of PR #44). Its pull request
  into `main` is opened as a draft when the run starts.
- If `main` moves before the run ends, nothing is merged in: the closing review and the maintainer's
  `/code-review main` see the branch as it is.

## Global Constraints

Code:
- `const`, or `let` where it changes; never `var`; no optional chaining. Arrows for short helpers and
  callbacks, `function` declarations for longer named functions. Existing code is not converted.
- Comments and test messages match the file being edited (mostly French).

Interface text and stored data:
- Interface text lives in `src/core/fr.js` (`NL.tables.fr`) and `src/core/en.js` (`NL.tables.en`), with the
  same keys. No interface text lives anywhere else.
- Meanings and prose are read through `NL.gloss`; the display language through `NL.lang`.
- Storage keys and the field names inside stored records keep their spelling, `displayLang` in the stored meta
  included. Nothing in this plan changes `resetAt`, `base` or `ENGINE_EPOCH`.

Behaviour:
- Grading ignores the display language (ADR 0008): `accepted()`, `siblings()` and `sameSense()` keep their rule.
- A change of display language never applies inside `sessie` or `scenario` (ADR 0009).
- Progress is reported as counts, never percentages.

Tests:
- Every fix leaves a check that fails on the old code. Write it, run it and watch it fail, then fix. The red
  output goes in the implementer's report.
- A check that strengthens an existing one is shown failing on a deliberate breakage, which is reverted and never
  committed. The report says what was broken and what failed.
- No check is weakened to pass. If a strengthened check finds a real fault in the app, stop and report
  `NEEDS_RULING` with the failing output; do not fix the app in a task that does not own it.
- Suites load the app through `test/lib/browser.js` and answer as a learner would, through `test/lib/answer.js`.
  A suite may call `NL.*` to set up or read state.

Budgets and the build:
- Budgets in `test/content.js` only go down.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with the
  change.

Public repository:
- The repo is public. No personal data goes in a tracked file; the person is « the maintainer ».

## Review Focus

1. **An own word written in English is read in French.**
   - Condition: since PR #44 an own word's meaning is stored in the display language (`src/ui/library.js:92`), so
     the words the maintainer adds in English have no French; then the maintainer switches to French.
   - Expected: on the French page, that word's English meaning carries `lang="en-GB"`.
   - Test: Task 4, step 1, check 69.1 bis.
2. **An own word's meaning is shown inside a session.**
   - Condition: a session asks an own word whose meaning exists only in the other language.
   - Expected: the exercise's prompt carries that language's `lang`, as the word list does.
   - Test: Task 4, step 1, check 69.1 (the `pick` and `type` prompts).
3. **Two opposite syncs arrive during one session.**
   - Condition: the language goes to English on another device, then back to French, while this device is in a
     session.
   - Expected: after the session nothing changed, so no notice shows.
   - Test: Task 5, step 1, the 69.3 block.
4. **A backup in the other language is restored while signed in.**
   - Condition: a stale sync mark could survive the two opposite syncs above, and the restore is then sent.
   - Expected: the restore shows `langNotice` alone, and so does the screen after it is sent: a restore is the
     learner's own action.
   - Test: Task 5, step 1, the 69.3 block.
5. **A key exists in only one table.**
   - Condition: phase 3 adds a key to `en.js` and forgets `fr.js`.
   - Expected: `interface.tsv` lists it with an empty French side, and the check tool stops on it.
   - Test: Task 2, step 4, the deliberate breakage.

---

## The run

Tasks 1–5, in order. A task's blocking edges are listed after Task 5.

### Task 1: The language and screen checks fail when what they guard breaks

**Class:** mechanical
**Ticket:** #67

Phase 3 adds content and screens, and `test/lang.js` and `test/screens.js` are what will catch its mistakes. At
a7d5e76, several of their checks cannot fail:
- two look for words neither table holds;
- the table functions are never compared in the singular;
- 5d never signs out;
- the `badFr` fix has no red test;
- French words are « known » on every screen;
- 2d never reaches the English-sense branch;
- 2a runs on the real clock;
- `SCREENS` exists twice.

`test/engine.js` matches a prefix, `test/firstrun.js` prints a key, and `test/smoke.js` has a mis-indented block.
This task touches tests only. Done means two things. First, each strengthened check (items 1–9) has been shown
red on a deliberate breakage that was reverted and is recorded in the report. Second, the five changed suites
pass and nothing under `src/` changed.

**Files:** (lines at a7d5e76; match on content if a line moved)
- Create: `test/lib/screens.js`.
- Modify: `test/lang.js` in these places:
  - `boot` (:26-31) and the timestamp mask (:35);
  - `SCREENS` (:42);
  - `Date.now()` in `views` (:56);
  - `interfaceCheck`'s known set and mask (:234-241);
  - `tableCheck`'s call (:293-297);
  - after `count` (:322);
  - 5c's busy-wait (:400);
  - 5d (:436-446) and 5d bis (:448-452);
  - 5f (:475-498);
  - the 2c/2d boots (:629-635) and 2d's `twice` check (:670).
- Modify: `test/screens.js:23` (`SCREENS`) and `:306-307` (the « solides » checks).
- Modify: `test/engine.js:736`, `test/firstrun.js:27`, and `test/smoke.js:400-418` (whitespace only).
- Breakages only, always reverted: `src/ui/home.js:42` and `:176`, `src/core/en.js:194`, `src/core/sync.js:208`,
  `src/core/gloss.js:64`, and `src/ui/session.js:465`. Sources load from `src/` in the tests, so a breakage needs
  no build. Never run `sh build.sh` while one is applied.

**Interfaces:**
- Produces:
  - `test/lib/screens.js` exports `{ SCREENS }`: the 12 route names, in the order both suites visit them. A suite
    reads it with `const { SCREENS } = require('./lib/screens');`. A screen phase 3 adds goes there, once.
  - In `test/lang.js`, for Task 4's checks:
    - `boot(prepare, store, account)`. Every boot runs on the fixed clock `T0`. With `account` true, it boots
      signed in to `fakeSupabase()`, and `signedIn(B)` waits for that session.
    - `text()` no longer masks timestamps.
    - 5f's `OTHER` and `foreign(html, pageLang)`.
- Consumes:
  - `browser.open()`'s `now`, `config` and `supabase` options, and `B.clock.now()` and `B.clock.advance()`.
  - `require('./lib/langs').runs`.
  - `NL.sync.signOut()`, `NL.sync.user` and `NL.state.seenCount()`.
  - `NL.gloss.sameMeaning`, `NL.gloss.sameSense` and `NL.gloss.of`.

**Rules for every step.** A red comes from a deliberate breakage. Apply it, run the suite, copy the FAIL lines
into the report, and revert it. Then `git status --short` must list no `src/` file. If a strengthened check fails
with no breakage applied, the app has a real fault. Stop with `NEEDS_RULING` and the failing output. Never weaken
the check, and never fix the app here. If a step seems to need a `src/` change or a build, stop with
`NEEDS_RULING` and say why. Comments and messages stay French in `lang.js` and English in `screens.js`.
`node test/lang.js .` takes about 70 s.

- [ ] **Step 1: One `SCREENS` (item 8).** Create `test/lib/screens.js`. It holds a French comment (« chaque écran
  de navigation, dans l'ordre où test/lang.js et test/screens.js les visitent ; un écran ajouté à l'app
  s'ajoute ici, une seule fois ») and `module.exports = { SCREENS: [...] }`, with the 12 names copied from
  `test/screens.js:23`. Replace `lang.js:42` and `screens.js:23` with
  `const { SCREENS } = require('./lib/screens');`.
  - Check: `git grep -n -F "const SCREENS = [" -- test` prints nothing.
  - Red: in `test/lib/screens.js`, write `'doktor'` for `'doctor'`, then run `node test/screens.js .`. It prints
    `FAIL: doktor (compte neuf) threw: Cannot read properties of undefined (reading 'render')`, and the same for
    the other states. `lang.js` falls back to `vandaag` on an unknown route and stays green.

- [ ] **Step 2: The Plus strip shows exactly its cells (item 1).** Replace `screens.js:306-307` with two checks:
  - The strip's labels, in order, are exactly the ones below. Read them with `/<b>[0-9]+<\/b> [^<]*/g` from
    `strip`, strip the number, and compare joined with `' | '`. The message is
    `'the Plus strip shows « ' + got + ' » instead of « ' + want + ' »'`.
    ```js
    const want = [t.statMet, t.statProduced, t.statMine, t.statSpoken, t.statBest, t.statCombo, t.statDefi, t.tallyXp];
    ```
  - `:307`'s render of every `SCREENS` entry, keeping only `ok(!err, n + ' throws: ' + (err && err.message))`.
  - Red: in `src/ui/home.js`, after `:176` (the `t.statProduced` cell), insert
    `'<span><b>0</b> solid</span>' +`. The suite prints
    `FAIL: the Plus strip shows « met | produced | solid | yours | said out loud | longest streak | best streak of answers | challenge record | XP » instead of « met | produced | yours | … »`.
    The old `:306-307` pass on that breakage.
  - Green: `617 checks, SCREENS OK`.

- [ ] **Step 3: 2a on a fixed clock (item 7).** First, delete the mask at `lang.js:35` (`.replace(/: 1[0-9]{12}…`)
  alone and run. It prints `FAIL: vue appariée différente : export | …` (1 ÉCHEC): this is the red. Then make
  three changes:
  - add `const T0 = Date.parse('2026-10-05T08:00:00Z');` before `boot` (the date `screens.js` uses), and pass
    `now: T0` in `boot`;
  - at `:56`, change `Date.now()` to `B.clock.now()`;
  - replace 5c's busy-wait at `:400` with `C.clock.advance(1);`, keeping its comment.

  The fixed clock freezes ids at the millisecond, and without the advance it prints `FAIL: 5c : les deux mots à
  soi ne sont pas enregistrés`. Green: `LANGUE CONFORME`.

- [ ] **Step 4: The table functions in the singular too (item 2).** Replace `:293-297` with a loop over two calls.
  `paceNote` takes the object `src/ui/shell.js:127` passes it.
  ```js
  [[3, 7, 12], Array(f.length).fill(1)].forEach(n => {
    const args = k === 'paceNote' ? [{ mins: n[0], cap: n[n.length - 1] }] : n;
    const rf = f.apply(null, args), re = e.apply(null, args);
    /* …the three existing ok() calls, unchanged… */
  });
  ```
  - Red: at `src/core/en.js:194`, change `'One item is resisting you'` to `'1 item is resisting you'`. It prints
    `FAIL: en.missTitle : chiffres ou {…} différents (« Un élément te résiste » / « 1 item is resisting you »)`.
    The old call at (3, 7) passes on that breakage.

- [ ] **Step 5: 5d and 5d bis sign out (item 3).**
  - Give `boot` a third parameter, `account`. When it is true, pass
    `config: { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon' }` and
    `supabase: fakeSupabase()`. Define `fakeSupabase` above `boot`, exactly as follows:
    ```js
    const fakeSupabase = () => ({
      createClient: () => {
        let open = true;
        const q = { then: (res, rej) => Promise.resolve({ data: [], error: null }).then(res, rej), upsert: () => Promise.resolve({ error: null }) };
        ['select', 'eq', 'gte', 'lt', 'delete', 'range'].forEach(k => { q[k] = () => q; });
        return { from: () => q, auth: {
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          getSession: () => Promise.resolve({ data: { session: open ? { user: { id: 'uid-lang', email: 'lang@example.com' } } : null } }),
          signOut: () => { open = false; return Promise.resolve({ error: null }); } } };
      }
    });
    ```
  - After `count` (`:322`), add `signedIn(B)`. The session lands just after `open()`, so it waits 5 ms of real
    time (`setTimeout`), then checks `ok(B.NL.sync.user && B.NL.sync.user.id === 'uid-lang', '5d : le faux compte n\'est pas ouvert')`.
  - 5d boots with `boot(null, null, true)` and calls `.then(() => signedIn(D))` after `open()`. It keeps the
    importAll and resetProgress checks. Instead of `clearAll()`, it does the following:
    - `NL.srs.seed(NL.content.allItems()[0], 2)`, with the fixture check `seenCount() === 1`;
    - `NL.sync.signOut()`, then checks that `NL.sync.user === null`
      (`'5d : la déconnexion n\'a pas eu lieu'`);
    - checks that `seenCount() === 0` (`'5d : la déconnexion n\'efface plus l\'appareil'`) and that
      `displayLang === 'fr'` (`'5d : la déconnexion efface displayLang'`).

    Its comment says « une déconnexion » for « un changement de compte ».
  - 5d bis boots and waits the same way. It replaces `D.NL.state.clearAll()` with `D.NL.sync.signOut()`, and
    « (clearAll) » leaves its comment. The reload is unchanged.
  - Red: comment out `await NL.state.clearAll();` in `signOut()` (`src/core/sync.js:208`). It prints
    `FAIL: 5d : la déconnexion n'efface plus l'appareil`.

- [ ] **Step 6: 5f's judge has a red test (item 4).** At the top of 5f, define the judge once:
  ```js
  const OTHER = { fr: /\bEN\d+|⟦en:/, en: /⟪|⟦fr:/ };
  const key = l => (/^fr/i.test(l) ? 'fr' : /^en/i.test(l) ? 'en' : null);
  const foreign = (h, page) => require('./lib/langs').runs(h, page)
    .map(r => r.text.match(OTHER[key(r.lang) || key(page)])).filter(Boolean).map(m => m[0]);
  const planted = foreign('<p lang="fr">EN12</p><p lang="en">⟪3⟫</p>', 'en-GB');
  ok(planted.join(' ') === 'EN12 ⟪', '5f : sur la vue plantée, le juge ne trouve que « ' + planted.join(' ') + ' »');
  ```
  - `pass(l)` drops its `bad` parameter. Klanken and register run
    `foreign(h, htmlLang(F)).forEach(w => { if (!hits.has(w)) hits.set(w, n); })`, and the other views match
    `OTHER[l]`. `:498` becomes `return pass('en').then(() => pass('fr'));`.
  - Red: in `OTHER.fr`, put back the old `/ENd+|⟦en:/` (before f9dc5cb). It prints
    `FAIL: 5f : sur la vue plantée, le juge ne trouve que « ⟪ »`.

- [ ] **Step 7: French words are no longer known on every screen (item 5).**
  - Delete `:234-237`: the two comments and the two lines that add the `fauxEn` words and « de vergaderzaal /
    la salle de réunion » to `dutch`.
  - At `:241`, after the textarea mask, add two masks:
    `.replace(/<span class="reg-cell std" lang="en">[\s\S]*?<\/span>/g, ' ')`, the English false-friend cells on
    `register`;
    `.replace(/<div class="vrow">[\s\S]*?<\/div>/g, row => (row.indexOf('data-del=') >= 0 ? ' ' : row))`, an own
    word's row in the dictionary.
  - Fold the two reasons into the comment at `:239-240`.
  - Red: in `src/ui/home.js`, before `:42` (`html += '<div class="tri">' +`), insert
    `html += '<p>salle through</p>';`. It prints
    `FAIL: mot hors table à l’écran : « salle » (vue vandaag)` and the same for « through ». The old code flags
    neither.

- [ ] **Step 8: 2d reaches the English-sense branch (item 6).**
  - Keep `lib` and its identical `'shared'` twins: 2d's match check needs identical cards.
  - Add a third boot, `twins`, built like `lib` but ending
    `u.words[0].en = 'shared / one'; u.words[1].en = 'shared / two';`, and add it to the `Promise.all` at `:635`.
  - After `:670`, in English (`W.gloss.use('en')`), take `t0` and `t1`, the units[0] `:w0`/`:w1` items:
    - assert the fixture `sameMeaning(t0, t1) && !sameSense(t0, t1)`
      (`'recall : les jumeaux ne sont pas joints par leur seul sens anglais'`);
    - over 100 recall builds of each twin, assert that the other's `gloss.of()` label is never an option
      (`'recall : le jumeau au même sens anglais est offert en faux dans ' + offered + ' tirages sur 200'`).
  - Red: at `src/core/gloss.js:64`, write `return false && ea.some(`. It prints both FAIL lines, the second with
    77 of 200.

- [ ] **Step 9: The whole spoken sentence (item 9).** At `test/engine.js:736`, compare
  `mixed.includes(NL.t.doneSpoken(1))`.
  - Red: at `src/ui/session.js:465`, write `NL.t.doneSpoken(L.spoken).slice(0, 11) +`. It prints
    `FAIL: the mixed summary does not say what was said: « done-sub">You said 1  2 spoken exercises kept for the next session. »`.
    The old check passes on that breakage.
  - Green: `288 checks, ENGINE OK`.

- [ ] **Step 10: Two leftovers (items 10, 11).**
  - `test/firstrun.js:27` prints `NL.t[NL.speech.voiceInfo().note].slice(0, 60)`, and the line reads
    `voice report    No Dutch voice found. The audio falls back on the browser’s …`.
  - In `test/smoke.js`, indent `:400-418` by two more spaces: from `NL.gloss.use(l);` through the `});` that
    closes `all.forEach`. `:419` stays.
  - Check: `git diff -w test/smoke.js` prints nothing. Green: `FIRST RUN IS CLEAN` and `ALL CHECKS PASSED`.

- [ ] **Step 11: Run the five suites.** Run `node test/lang.js .`, `node test/screens.js .`,
  `node test/engine.js .`, `node test/firstrun.js .` and `node test/smoke.js .`. Each must end:
  - `21234 contrôles, LANGUE CONFORME`;
  - `617 checks, SCREENS OK`;
  - `288 checks, ENGINE OK`;
  - `FIRST RUN IS CLEAN`;
  - `ALL CHECKS PASSED`.

  Then `git status --short` lists exactly the five suites and `?? test/lib/screens.js`.

- [ ] **Step 12: Commit.** Run `git add` on the six files. Commit with a message file whose subject is
  `fix(test): the language and screen checks can fail when what they guard breaks`.

### Task 2: The check tool writes both sides of every place and every key, stops on a hole, and TESTING.md names it

**Class:** mechanical
**Ticket:** #68

The next check sitting reads the files `test/tools/check-files.js` writes, and today they hide English. At
a7d5e76, `prose.tsv` shows 122 rows with an empty English. Of these, 119 are the reference-sheet rows
(`sheets[…].groups[…].rows[…].fr`): `at()` resolves the French string there, not the row that carries
both sides. The other 3 are the notes whose `en` is `null` on purpose. `interface.tsv` reads only the French
table's keys, and four of its rows read « undefined ». The tool is not part of `run-all.sh`, so it proves
its own fix. It learns to exit 1 on a row with a side the content leaves empty by mistake, or with
« undefined », and fails that way on the old code before the fix. Done means: the tool exits 0, `prose.tsv`
has exactly the 3 deliberate empty English cells, no `interface.tsv` row reads « undefined », and
`TESTING.md` names the tool.

**Files:**
- Modify: `test/tools/check-files.js` (lines at a7d5e76; match on content if a line moved):
  - the header comment, lines 7-8;
  - after line 37 (`const files = { … };`): the list of holes;
  - lines 52-53, the prose branch of `places.forEach`: the place it resolves, and the check;
  - lines 57-63, `show` and the `interface.tsv` loop;
  - lines 74-75: the report and the exit code.
- Modify: `TESTING.md`: one new paragraph after line 30 (« …`SEED=...` en rejoue une autre. »).
- Not touched: `test/lib/prose.js`. `at()` and `owed()` need no change.
- Breakage only, reverted in Step 4: `src/core/en.js`.

- [ ] **Step 1: Make the tool stop on a hole (still on the old resolution).** In `test/tools/check-files.js`:
  - After line 37, insert:
    ```js
      /* Les lignes dont un côté est vide sans que le contenu le veuille, ou qui lisent « undefined ». */
      const holes = [];
    ```
  - After line 53 (`files['prose.tsv'].push(…)`), inside the `places.forEach` callback, insert:
    ```js
        /* Un anglais vide n'est voulu que là où le contenu le met à `null` (une note sans rien pour un lecteur anglais). */
        if (!cell(side(v, 'fr')) || (!cell(side(v, 'en')) && !(v && v.en === null))) holes.push('prose.tsv ' + r.where);
    ```
  - Replace line 63 (`Object.keys(T.fr).forEach(k => files['interface.tsv'].push(…));`) with:
    ```js
      Object.keys(T.fr).forEach(k => {
        const fr = cell(show(T.fr, k)), en = cell(show(T.en, k));
        files['interface.tsv'].push(line([k, fr, en]));
        if (!fr || !en || /undefined/.test(fr + en)) holes.push('interface.tsv ' + k);
      });
    ```
  - Before line 75, insert `  holes.forEach(h => console.log('TROU : ' + h));`, and make line 75
    `  process.exit(glosses === glossPlaces && !holes.length ? 0 : 1);`.

- [ ] **Step 2: Watch it fail on the old code.** Write these lines to `<WS>/tmp/check-68-red.sh` and run
  `sh "<WS>/tmp/check-68-red.sh"`:
  ```sh
  node test/tools/check-files.js . "<WS>/tmp/check-68-red" > "<WS>/tmp/check-68-red.txt"; echo "exit $?"
  grep -c '^TROU' "<WS>/tmp/check-68-red.txt"
  grep -c '^TROU : prose.tsv sheets\[[0-9]*\]\.groups\[[0-9]*\]\.rows\[[0-9]*\]\.fr$' "<WS>/tmp/check-68-red.txt"
  grep '^TROU : interface' "<WS>/tmp/check-68-red.txt"
  ```
  Expected, exactly:
  ```
  exit 1
  123
  119
  TROU : interface.tsv todaySplit
  TROU : interface.tsv courseCounts
  TROU : interface.tsv unitCounts
  TROU : interface.tsv paceNote
  ```
  The 3 deliberate `null` notes are not among the holes. Put this output in your report.

- [ ] **Step 3: Fix the tool.** In `test/tools/check-files.js`:
  - In the prose branch, replace `    const v = at(RAW, r.where);` with:
    ```js
        /* Un `where` en `.fr` désigne le français d'un objet qui porte aussi l'anglais : on lit l'objet. */
        const v = at(RAW, r.where.replace(/\.fr$/, ''));
    ```
  - Replace `show` and the first line of the `interface.tsv` loop (from `  const show = (t, k) => {` to
    `  Object.keys(T.fr).forEach(k => {`, both included) with the lines below. The loop's body stays as
    Step 1 wrote it. `paceNote` takes one object `{ mins, cap }`, and `src/ui/shell.js` passes it
    `NL.srs.pace()`:
    ```js
      /* Une fonction reçoit autant de nombres qu'elle prend d'arguments ; paceNote, ce que l'écran lui passe. */
      const NUMS = [3, 7, 12];
      const ARGS = { paceNote: [NL.srs.pace()] };
      const show = (t, k) => {
        const v = t[k];
        if (typeof v === 'function') return v.apply(null, ARGS[k] || NUMS.slice(0, v.length));
        if (typeof v === 'string') return v;
        return JSON.stringify(v);
      };
      const own = (t, k) => Object.prototype.hasOwnProperty.call(t, k);
      Object.keys(T.fr).concat(Object.keys(T.en).filter(k => !own(T.fr, k))).forEach(k => {
    ```
  - In the header comment, replace lines 7-8 (`   interface.tsv key fr en …` and `   Chaque \`where\` … */`)
    with:
    ```
       interface.tsv key fr en                   (chaque clé de l'une ou l'autre table)
       Chaque `where` est le chemin que donne owed() dans test/lib/prose.js. Sort avec 1 si
       glosses.tsv et owed() ne comptent pas les mêmes gloses, ou si une ligne de prose.tsv ou
       d'interface.tsv a un côté vide que le contenu n'explique pas, ou lit « undefined ». */
    ```

- [ ] **Step 4: Watch it pass.** Write these lines to `<WS>/tmp/check-68.sh` and run `sh "<WS>/tmp/check-68.sh"`:
  ```sh
  node test/tools/check-files.js . "<WS>/tmp/check-68" > "<WS>/tmp/check-68.txt"; echo "exit $?"
  grep -c '^TROU' "<WS>/tmp/check-68.txt"
  awk -F'\t' '$3 == "" { print $1 }' "<WS>/tmp/check-68/prose.tsv"
  grep -c undefined "<WS>/tmp/check-68/interface.tsv"
  grep -c '' "<WS>/tmp/check-68/interface.tsv"
  ```
  Expected, exactly:
  ```
  exit 0
  0
  units[2].words[17].note
  units[2].words[18].note
  units[8].words[1].note
  0
  391
  ```
  Then read `<WS>/tmp/check-68.txt` with the Read tool. Expected: the counts are the same as before the
  change (`glosses.tsv 439`, `blind.tsv 439`, `sentences.tsv 527`, `prose.tsv 456`, `interface.tsv 391`, and
  `glosses + sentences + prose = 1422 ; owed() liste 1422 endroits (439 de gloses)`). In
  `<WS>/tmp/check-68/interface.tsv`, the `paceNote` row reads `25 min par jour · 120 exercices maximum` and
  `25 min a day · 120 exercises at most`.
  - Red for a key in one table only (Review Focus 5): in `src/core/en.js`, after `NL.tables.en = {`, insert
    `  zz68: 'only in English',`. Run `node test/tools/check-files.js . "<WS>/tmp/check-68-key"; echo "exit $?"`.
    Expected: a line `TROU : interface.tsv zz68`, and `exit 1`. Revert it; `git status --short` lists no `src/`
    file.

- [ ] **Step 5: Name the tool in `TESTING.md`.** After line 30 (« …déterministes : la graine est fixe,
  `SEED=...` en rejoue une autre. »), insert a blank line and this paragraph:
  ```
  `test/tools/check-files.js` n'est pas un test, et `run-all.sh` ne le lance pas.
  `node test/tools/check-files.js . <dossier>` écrit les fichiers que lit une
  séance de contrôle de l'anglais : `glosses.tsv` (chaque élément, son français et
  son anglais), `blind.tsv` (les mêmes sans l'anglais), `sentences.tsv` (phrases
  d'exemple et répliques de scénario), `prose.tsv` (toute autre paire de texte du
  cours) et `interface.tsv` (chaque clé des deux tables). Il sort avec 1 si
  `glosses.tsv` et `owed()` ne comptent pas les mêmes gloses, ou si une ligne a un
  côté vide que le contenu n'explique pas (seule une note dont l'anglais est
  `null` exprès en laisse un), ou lit « undefined ».
  ```
  Check: `git status --short` lists exactly `test/tools/check-files.js` and `TESTING.md`.

- [ ] **Step 6: Commit.** `git add test/tools/check-files.js TESTING.md`, then
  `git commit -m "fix(test): check-files writes both sides of every place, and TESTING.md names it"`.

### Task 3: build.sh's comments are all English, and CLAUDE.md names `displayLang` among the stored names that keep their spelling

**Class:** mechanical
**Ticket:** #70

These are two doc fixes from the review of PR #44, and neither changes behaviour. `build.sh:63-64` is the
file's only French comment. Since phase 2, the stored and synced meta carries `displayLang`
(`src/core/state.js:191-196`, `:306`). A missing value means English (`src/core/lang.js:10`), so renaming it
would quietly put every learner back in English. Yet CLAUDE.md's rule on stored names (lines 51-54) does not
name it. No test is owed. The proof is that `sh build.sh` leaves `index.html` and `artifact.html`
byte-identical: after the build, `git status --short` lists only the two edited files.

**Files:**
- Modify: `build.sh` lines 63-64 (lines at a7d5e76; match on content if a line moved): the comment that starts
  `# Les sources sont en CRLF`.
- Modify: `CLAUDE.md` lines 51-54: the bullet that starts `- The same goes for **field names inside a stored record**`.

- [ ] **Step 1: The comment in English.** In `build.sh`, replace lines 63-64 with these two lines. They are
  the ticket's sentence, wrapped where the French one was:
  ```
  # The sources are CRLF in a working copy (core.autocrlf=true): the « tr » keeps both
  # outputs in LF, as .gitattributes wants them, or git shows them modified after every build.
  ```
  Check: `grep -n "Les sources" build.sh` prints nothing.

- [ ] **Step 2: `displayLang` in CLAUDE.md.** Replace lines 51-54 with:
  ```
  - The same goes for **field names inside a stored record** — `stage`, `due`, `interval`,
    `ease`, `reps`, `lapses`, `said`, `retired`, `base`, and `displayLang` in the stored meta.
    Records are stored and synced whole, so a rename orphans them exactly as a key rename would
    (a missing `displayLang` means English: renaming it puts every learner back in English
    without a word). `GLOSSARY.md` says to call a stage a **rung** in prose and in new names;
    it is not an instruction to rename the stored field.
  ```
  Check: `grep -n "displayLang" CLAUDE.md` prints lines 52 and 54.

- [ ] **Step 3: Build, and see that the outputs did not change.** Run `sh build.sh`. Expected: a line starting
  `built (local only) index.html (`. Then run `git status --short`. Expected, exactly two lines:
  ` M CLAUDE.md` and ` M build.sh`. If `index.html` or `artifact.html` is listed, stop: status `BLOCKED`.

- [ ] **Step 4: Commit.** `git add build.sh CLAUDE.md`, then
  `git commit -m "docs: build.sh's last French comment in English, and displayLang keeps its spelling"`.

### Task 4: A meaning shown in the other language carries its `lang`, the notice shows on every screen that applies a change, `NL.lang.set()` only stores, and the other fixes of #69 are in

**Class:** mechanical
**Ticket:** #69 (items 1, 2 and 4–11)

On an English page, a French fallback meaning is unmarked. The language notice is never drawn on
doctor or compte. `NL.lang.set()` applies the language straight away, without going through the
guard in `render()`. Besides those three, the ticket lists seven smaller faults: listening drops a gloss that reads « constructor »; the
error-log tag is French; `dehetBody` speaks to French readers only; three comments are stale; the
word search ignores the other language's meaning; « cheat sheets » goes against the glossary; and the doctor's mic verdict
keeps the old language. When this task is done, each behaviour fix has a `69.n` check in
`test/lang.js` that failed first. Task 5 builds on two things from this task: `set()` only stores,
and `render()` draws the notice on doctor and compte.

Notes for both tasks: the working tree is CRLF, so multi-line matches need `\r\n`. Comments are in
French where the file's are. Use `const`, or `let` where the value changes, and no `?.`. Task 1 (#67) runs first and
rewrites parts of `test/lang.js`, so find every `test/` location below by its content, not its line number. If Task 1
moved a helper (`boot`, `text`, `French`, `English`, `tapOn`, `htmlLang`, `count`) into `test/lib/`,
use it from there and do not define it again. Task 1 also puts every `boot` on the fixed clock `T0`: read
the time with `B.clock.now()`, never `Date.now()`. The edits below were tried on a scratch copy of a7d5e76,
before Task 1: each check failed as listed in Step 2, and the copy then passed every suite in Step 4. Two
were added after that run and not tried: 69.1's session prompts and 69.1 bis. If a check fails only because
of the clock or of a Task 1 helper, adapt the check, not the app, and say so in the report.

**Files** (lines at a7d5e76; match on content if a line moved):

- `src/core/gloss.js:97`: the return object gains `htmlLang`.
- `src/ex/index.js:160` (`pick`), `:190` (`article`), `:291` (`type`), `:354` (`speak`), `:468` (`corrige`),
  `:499` (`vlaams`): the element that shows the item's meaning.
- `src/ui/library.js:33` (search), `:74` (`.v-en`).
- `src/ui/mistakes.js:24` (`.v-en`).
- `src/ui/listen.js:20`, `:26` (dedupe), `:92` (`.rev-en`).
- `src/ui/scenario.js:89`, `:92` (`.bub-en`, the same text twice).
- `src/ui/shell.js:82-85` (`render()`).
- `src/core/lang.js:25-28` (`set`).
- `src/ui/session.js:62`.
- `src/ui/doctor.js:8`, `:82`, `:121`, `:127`, `:132-136`.
- `src/core/en.js:210`, `:213`, `:235`. `src/core/fr.js:245`.
- `src/ex/index.js:57-67`, `:85-87`, `:110` (comments only).
- `src/core/sync.js:200-202` (comment only).
- `test/lang.js`: a new `displayChecks()`, its place in the chain, and 5c/5e (`NL.lang.set(` at :407, :418, :469, :471).
- `TESTING.md:15` (the `lang.js` row).
- `index.html`, `artifact.html` (build outputs).

Exact copy:

- `en.js:210`: `sheetsEyebrow: 'Reference sheets',`
- `en.js:213`: `sheetsAll: 'All the reference sheets',`
- `en.js:235`: `dehetBody: 'About seven het words in ten follow a rule. Learn the families instead of the 425 articles one by one — and never guess from another language: het huis is neuter.',`
- `fr.js:245`: `langNotice: 'Lecture en français. Les antisèches sont dans Plus ; chacune dit pour quelle langue elle est faite.',`
- Unchanged: `en.js:244` `langNotice`, `fr.js:211` `sheetsEyebrow: 'Antisèches'`, `fr.js:214`, and `fr.js` `dehetBody`.

**Interfaces**

- Produces:
  - `NL.lang.set(lang)` writes `{ displayLang: lang }` through `NL.state.setMeta` and returns nothing. It never applies the language: only `render()` does, through `NL.lang.apply(false)`, and never on `sessie` or `scenario`.
  - `render()` draws `NL.lang.notice()` as `<div class="notice"><p>…</p></div>`. It does so at the top of `main.screen`, and at the top of the full screen on `doctor` and `compte`. Whatever string `notice()` returns is what shows. Task 5 changes only that string.
  - `NL.gloss.htmlLang(x)` returns `'en-GB'` when `NL.gloss.langOf(x) === 'en'`, otherwise `'fr'`.
  - `displayChecks()` in `test/lang.js` is the last step of the main chain.
- Consumes: the `test/lang.js` helpers as Task 1 leaves them (`boot(prepare)`, `text`, `French`, `English`, `tapOn`, `htmlLang`, `count`, `ok`, `fs`, `path`, `ROOT`).

- [ ] **Step 1: write the checks.** In `test/lang.js`, add this function after the last check function,
before the main chain. Then append `.then(displayChecks)` to the chain step that ends
`….then(addFormCheck(L6)).then(interfaceCheck)` (at a7d5e76), so that it runs just before the line
that prints `contrôles`. Every check boots its own device.

```js
/* #69. Un appareil neuf par contrôle ; l'étiquette 69.n est le point du ticket. */
function displayChecks() {
  const open = prepare => { const B = boot(prepare); return B.NL.state.open().then(() => B); };
  const due12 = N => N.content.allItems().filter(it => it.unit !== 'eigen').slice(0, 12).forEach((it, i) => {
    N.srs.seed(it, 1); const r = N.state.rec(it.id); r.due = 1700000000000 - 1000 * (i + 1); N.state.setRec(r);
  });

  /* 69.1. Un sens montré dans l'autre langue porte cette langue. */
  const c1 = () => open(NL => {
    NL.content.units.forEach(u => u.words.forEach(w => { if (w.nl === 'het brood') delete w.en; }));
    delete NL.content.scenarios.find(s => s.id === 's-bakker').steps.filter(st => st.them)[3].them.en;
  }).then(B => {
    const NL = B.NL, html = () => B.app.innerHTML, pages = {};
    English(B);
    const brood = NL.content.allItems().find(it => it.nl === 'het brood');
    NL.srs.seed(brood, 2);
    NL.state.logReview({ id: brood.id, t: B.clock.now() - 1000, ok: false, stage: 1, kind: brood.kind, ex: 'type' });
    NL.ui.go('woorden'); NL.screens.woorden.input({ id: 'wsearch', value: 'brood' }); pages.woorden = html();
    NL.screens.woorden.input({ id: 'wsearch', value: '' });
    NL.ui.go('fouten'); pages.fouten = html();
    NL.ui.go('scenario', 's-bakker'); pages.scenario = html();
    for (let g = 0; html().indexOf('scn-done') < 0 && g < 60; g++) {
      [{ step: 'next' }, { choice: '0' }, { self: '1' }, { act: 'accept' }].forEach(c => {
        NL.screens.scenario.click({ dataset: {} }, c); pages.scenario += html();
      });
    }
    NL.ui.go('luisteren'); NL.screens.luisteren.click({ dataset: {} }, { act: 'nazeggen' }); pages.nazeggen = html();
    const tags = Object.keys(pages).map(k => pages[k]).join('').match(/<[a-z]+ class="(v-en|bub-en|rev-en)"[^>]*>/g) || [];
    const bare = '<span class="v-en" lang="fr">' + NL.util.esc(NL.gloss.bare(brood)) + '</span>';
    ok(['v-en', 'bub-en', 'rev-en'].every(c => tags.some(t => t.indexOf('"' + c + '"') >= 0)), '69.1 : les trois sortes de sens ne sont pas toutes à l’écran, le contrôle est creux');
    const bad = tags.filter(t => !/ lang="(fr|en-GB)"/.test(t));
    ok(bad.length === 0, '69.1 : ' + bad.length + ' sens sans lang="fr" ni lang="en-GB", dont ' + bad[0]);
    ok(pages.woorden.indexOf(bare) >= 0 && pages.fouten.indexOf(bare) >= 0, '69.1 : en anglais, le sens français de het brood n’est pas marqué lang="fr" (woorden, fouten)');
    ok(/class="bub-en" lang="fr"/.test(pages.scenario), '69.1 : la réplique sans anglais n’est pas marquée lang="fr"');
    ok(tags.some(t => t.indexOf(' lang="en-GB"') >= 0), '69.1 : aucun sens anglais marqué lang="en-GB"');
    /* L'exercice montre le même sens : il porte la même langue. */
    const shownIn = id => { const E = NL.ex.get(id), t = E.build(brood); return E.view(t, { sel: null, input: '' }, 'ask'); };
    ['pick', 'type'].forEach(id => ok(shownIn(id).indexOf('lang="fr">' + NL.util.esc(NL.gloss.bare(brood))) >= 0,
      '69.1 : l’exercice ' + id + ' montre le sens français de het brood sans lang="fr"'));
  });

  /* 69.1 bis. Un mot à soi écrit en anglais, relu en français, garde lang="en-GB". */
  const c1b = () => open(null).then(B => {
    const NL = B.NL;
    French(B);
    NL.state.addCustom({ nl: 'de testkast', en: 'the test cupboard', be: null, kind: 'word' }); NL.content.refresh();
    NL.ui.go('woorden'); NL.screens.woorden.input({ id: 'wsearch', value: 'testkast' });
    const item = NL.content.allItems().find(it => it.nl === 'de testkast');
    const want = '<span class="v-en" lang="en-GB">' + NL.util.esc(NL.gloss.bare(item)) + '</span>';
    ok(B.app.innerHTML.indexOf(want) >= 0, '69.1 bis : en français, le sens anglais d’un mot à soi n’est pas marqué lang="en-GB"');
  });

  /* 69.2. Un changement appliqué sur doctor ou compte s'y annonce. */
  const c2 = () => open(null).then(B => {
    const NL = B.NL, fr = NL.tables.fr;
    ['doctor', 'compte'].forEach(r => {
      English(B); NL.ui.go(r);
      NL.state.setMeta({ displayLang: 'fr' }, true);   // ce que fait une synchro
      NL.ui.render();
      const n = count(text(B.app.innerHTML), fr.langNotice);
      ok(n === 1, '69.2 ' + r + ' : l’avis s’affiche ' + n + ' fois au lieu d’une');
    });
  });

  /* 69.4. set() en pleine séance enregistre le choix, et rien d'autre. */
  const c4 = () => open(null).then(B => {
    const NL = B.NL, en = NL.tables.en, fr = NL.tables.fr;
    English(B); due12(NL);
    ok(NL.screens.sessie.begin('vandaag'), '69.4 : aucune séance à démarrer');
    NL.ui.go('sessie');
    NL.lang.set('fr');
    ok(NL.state.meta().displayLang === 'fr', '69.4 : set() n’a pas enregistré le choix');
    ok(NL.t.nav[1].label === en.nav[1].label, '69.4 : set() a changé NL.t en pleine séance');
    ok(htmlLang(B) === 'en-GB', '69.4 : set() a changé <html lang> en pleine séance (' + htmlLang(B) + ')');
    tapOn(B, { quitYes: '1' });
    ok(NL.t.nav[1].label === fr.nav[1].label && htmlLang(B) === 'fr', '69.4 : après la séance, l’écran n’est pas en français');
  });

  /* 69.5. Un sens qui vaut « constructor » peut être proposé. */
  const c5 = () => open(NL => {
    const s = NL.content.scenarios.find(x => x.id === 's-bakker');
    NL.content.scenarios.splice(0, NL.content.scenarios.length, s);
    const them = s.steps.filter(st => st.them).map(st => st.them);
    them[0].en = 'constructor'; delete them[3].en;
  }).then(B => {
    const NL = B.NL, html = () => B.app.innerHTML;
    English(B);
    NL.ui.go('luisteren');
    NL.screens.luisteren.click({ dataset: {} }, { act: 'begrijpen' });
    let offered = 0;
    for (let g = 0; html().indexOf('done-stage') < 0 && g < 20; g++) {
      if (html().indexOf('<span>constructor</span></button>') >= 0) offered++;
      NL.screens.luisteren.click({ dataset: {} }, { opt: '0' });
      NL.screens.luisteren.click({ dataset: {} }, { act: 'next' });
    }
    ok(offered >= 2, '69.5 : « constructor » proposé sur ' + offered + ' écran(s) d’écoute, au moins 2 attendus');
  });

  /* 69.6. L'étiquette du journal d'erreurs est anglaise. */
  const c6 = () => open(null).then(B => {
    const NL = B.NL, real = NL.ex.get;
    let thrown = 0;
    English(B); due12(NL);
    NL.ex.get = n => thrown ? real(n) : Object.assign(Object.create(real(n)), { build() { thrown++; throw new Error('essai 69.6'); } });
    NL.screens.sessie.begin('vandaag');
    NL.ex.get = real;
    NL.ui.go('doctor');
    const h = B.app.innerHTML;
    ok(thrown === 1 && h.indexOf('essai 69.6') >= 0, '69.6 : l’erreur d’essai n’est pas au journal');
    ok(h.indexOf(' · exercise ') >= 0 && h.indexOf('exercice') < 0, '69.6 : l’étiquette du journal n’est pas « exercise »');
  });

  /* 69.9. La recherche trouve un mot par l'un ou l'autre sens, dans chaque langue. */
  const c9 = () => open(null).then(B => {
    const NL = B.NL;
    [['en', English], ['fr', French]].forEach(([l, to]) => {
      to(B); NL.ui.go('woorden');
      ['pain', 'bread'].forEach(q => {
        NL.screens.woorden.input({ id: 'wsearch', value: q });
        ok(/\bhet brood\b/.test(text(B.app.innerHTML)), '69.9 (' + l + ') : chercher « ' + q + ' » ne trouve pas het brood');
      });
      NL.screens.woorden.input({ id: 'wsearch', value: '' });
    });
  });

  /* 69.10. Chaque avis nomme les fiches comme l'écran. */
  const c10 = () => open(null).then(B => {
    const T = B.NL.tables;
    ['fr', 'en'].forEach(l => ok(T[l].langNotice.toLowerCase().indexOf(T[l].sheetsEyebrow.toLowerCase()) >= 0,
      '69.10 (' + l + ') : langNotice ne nomme pas les fiches « ' + T[l].sheetsEyebrow + ' »'));
    ok(!/cheat/i.test(fs.readFileSync(path.join(ROOT, 'src/core/en.js'), 'utf8')), '69.10 : en.js dit encore « cheat »');
  });

  /* 69.11. Le verdict du micro se relit dans la langue d'après le changement. */
  const c11 = () => open(null).then(B => {
    const NL = B.NL, en = NL.tables.en, fr = NL.tables.fr;
    English(B); NL.ui.go('doctor');
    tapOn(B, { act: 'rec' });
    return new Promise(r => setImmediate(r)).then(() => {
      ok(text(B.app.innerHTML).indexOf(en.docRecDenied) >= 0, '69.11 : le refus du micro n’est pas affiché, le contrôle est creux');
      NL.ui.go('vandaag'); NL.ui.openSheet('instellingen'); tapOn(B, { displayLang: 'fr' });
      NL.ui.go('doctor');
      const t = text(B.app.innerHTML);
      ok(t.indexOf(fr.docRecDenied) >= 0 && t.indexOf(en.docRecDenied) < 0, '69.11 : après le passage au français, le verdict du micro reste en anglais');
    });
  });

  return [c1, c1b, c2, c4, c5, c6, c9, c10, c11].reduce((p, c) => p.then(c), Promise.resolve());
}
```

What each check pins. The labels are new: no `69.` label exists in `test/` at a7d5e76.

| Label | Behaviour |
|---|---|
| 69.1 | In English, every `.v-en`, `.bub-en` and `.rev-en` carries `lang="fr"` or `lang="en-GB"`. A French-only word shows `<span class="v-en" lang="fr">pain</span>` in woorden and fouten, and `lang="fr">pain` in the `pick` and `type` prompts. A French-only line shows `class="bub-en" lang="fr"`. |
| 69.1 bis | In French, an own word added with only its English shows `<span class="v-en" lang="en-GB">…</span>` in woorden. |
| 69.2 | A change applied while on doctor, then on compte, shows `fr.langNotice` once. |
| 69.4 | `set('fr')` during a session stores `displayLang`, leaves `NL.t` and `<html lang>` English, and the screen after the session is French. |
| 69.5 | A clip glossed « constructor » is offered as a wrong answer, so it shows on 2 or more listening screens. The fixed code shows it on 3; the old code only on its own clip's screen. |
| 69.6 | A failing build logs `[vandaag · exercise <name> · <id>]`, and the doctor shows no « exercice ». |
| 69.9 | In both languages, searching « pain » and searching « bread » each find *het brood*. |
| 69.10 | In each table `langNotice` contains `sheetsEyebrow` (case-insensitive), and `en.js` has no « cheat ». |
| 69.11 | After a refused mic test on doctor, then a switch to French, doctor shows `fr.docRecDenied`, not the English one. |

Items 7 and 8 get no check; the ticket asks for none.

- [ ] **Step 2: run red.** `node test/lang.js .` These 19 checks fail; the first 16 were seen at a7d5e76:

- 69.1, six failures:
  - « 84 sens sans lang="fr" ni lang="en-GB", dont <span class="v-en"> »
  - het brood not marked `lang="fr"`
  - the French-only line not marked
  - no `lang="en-GB"`
  - « l’exercice pick … » and « l’exercice type … » (not tried)
- 69.1 bis: the own word's English not marked (not tried).
- 69.2 doctor and 69.2 compte: « l’avis s’affiche 0 fois ».
- 69.4: `NL.t` changed in the session, and `<html lang>` reads `fr`.
- 69.5: « proposé sur 1 écran(s) ».
- 69.6: the tag is not « exercise ». The log reads `[vandaag · exercice recall · …]`.
- 69.9: (en) « pain », and (fr) « bread ».
- 69.10: (fr), (en), and « en.js dit encore « cheat » ».
- 69.11: the verdict stays English.

These guards pass on the old code:

- 69.1: all three kinds of meaning are on screen.
- 69.4: a session starts, the choice is stored, and the screen after the session is French.
- 69.6: the error is in the log.
- 69.9: (en) « bread » and (fr) « pain ».
- 69.11: the refusal shows.

If any check fails for a different reason, stop and report.

- [ ] **Step 3: implement.**

1. **`lang` on meanings.**
   - In `gloss.js`, just above the `return` at :97, add:
     ```js
     /* L'attribut lang d'un sens montré : celui de la langue où il se lit. */
     const htmlLang = x => langOf(x) === 'en' ? 'en-GB' : 'fr';
     ```
     Then add `htmlLang` to the returned object, after `langOf`.
   - At the five sites, insert `lang="…"` after the class:
     - `library.js:74` and `mistakes.js:24`: `'<span class="v-en" lang="' + NL.gloss.htmlLang(it) + '">' + esc(NL.gloss.bare(it))…`
     - `listen.js:92`: `'<p class="rev-en" lang="' + NL.gloss.htmlLang(c) + '">'…`
     - `scenario.js:89` and `:92`: `'<p class="bub-en" lang="' + NL.gloss.htmlLang(b) + '">'…`
   - In `src/ex/index.js`, the element that shows the item's meaning takes `lang="' + NL.gloss.htmlLang(t.item) + '"'`
     after its class, at the six sites in Files: `pick`'s `<p class="sentence prompt">`, `article`'s
     `<span class="gloss">`, `type`'s `<div class="sentence prompt">`, and the `<div class="gloss-line">` of
     `speak`, `corrige` and `vlaams`. The prompts that show a drill's or a task's meaning (`:205`, `:219`, `:255`,
     `:522`) and `recall`'s options stay as they are.
2. **The notice on doctor and compte.** In `shell.js` `render()`, build the box once and use it in both branches:
   ```js
   const box = note ? '<div class="notice"><p>' + esc(note) + '</p></div>' : '';
   const html = full
     ? '<div class="screen full">' + (route === 'doctor' || route === 'compte' ? box : '') + S.render(arg) + '</div>'
     : topbar() + '<main class="screen">' + box + S.render(arg) + '</main>' + nav();
   ```
3. Item 3 is Task 5.
4. **`set()` only stores.** In `lang.js`, delete `return apply(false);` (:27), and above `function set` add `/* Enregistre le choix ; render() l'applique au premier écran hors séance. */`. `shell.js:314` already calls `render()` afterwards. In `test/lang.js`, add `NL.ui.render();` after each `NL.lang.set(…)` in 5c and 5e: `NL.lang.set('en');` at :407, `if (l === 'fr') { NL.lang.set('fr'); NL.ui.render(); }` at :418, and `:469` and `:471`. Without the render, 5e fails (« hallo est transparent en français »), and 5c's French pass silently runs in English.
5. **`listen.js` dedupe.** Change `const seen = {};` to `const seen = new Set();`, and change `if (!seen[k]) { seen[k] = true; pool.push(l); }` to `if (!seen.has(k)) { seen.add(k); pool.push(l); }`.
6. **The tag.** In `session.js:62`, `'exercice '` becomes `'exercise '`. The comment above it stays French.
7. **`dehetBody`.** `en.js:235` takes the exact copy above.
8. **Comments.**
   - `ex/index.js`:
     - Move the « Les mauvaises réponses… » block (:57-61) down to just above `function others(` (:88), and merge it with the comment at :85-87 into one comment: the first paragraph, an empty comment line, then the « "field" : … » paragraph.
     - Then end the « Un leurre… » block (:62-66) with the sentence now on :67 (« La comparaison vit dans NL.gloss ; NL.ex.sameSense la re-exporte. »), so that one comment stands above `const sameSense`.
     - In `score`, shorten the spaces before `//` on :110 so it starts in column 68, like :109, :112 and :114.
   - `sync.js:200-202`: the `signOut` comment becomes:
     ```js
     /* Déconnexion : on envoie ce qui reste, puis on efface l'appareil. La personne
        suivante ne voit rien de la progression ; seule la langue d'affichage reste
        (clearAll la garde), et le compte suivant en hérite : il l'envoie si ses
        propres réglages n'en ont pas. Pas encore rattaché, ce qui a été fait ici
        n'est pas encore au compte : on le rattache d'abord. */
     ```
9. **Search by both meanings.** `library.js:33` becomes:
   ```js
   if (q) list = all.filter(it => [it.nl, it.be, NL.gloss.of(it, 'fr'), NL.gloss.of(it, 'en')].some(s => !!s && U.norm(s).indexOf(q) >= 0));
   ```
10. **Sheet names.** Apply the exact copy to `en.js:210`, `:213` and `fr.js:245`.
11. **Mic verdict by key.** In `doctor.js`, the state stores a key name and the render reads it from `NL.t`:
    - `:8`: `micMsg: ''` becomes `micKey: ''`.
    - `:82`: `S.micMsg ?` becomes `S.micKey ?`, and `esc(S.micMsg)` becomes `esc(t[S.micKey])`.
    - `:121`: `S.micKey = 'docSpeakNow';`
    - `:127`: `S.micKey = url ? 'docRecOk' : 'docRecNone';`
    - `:132-136`: the same ternary, yielding `'docRecFramed'`, `'docRecDenied'`, `'docRecNoMic'` and `'docRecOther'`.

    `t` is `NL.t`, whose contents a switch replaces, so the next draw reads the new language.

Finally, in `TESTING.md:15` (the `lang.js` row), just before « ; elle ne voit pas », add: `, le sens montré dans l'autre langue marqué comme tel, l'avis sur doctor et compte, et la recherche par l'un ou l'autre sens`.

- [ ] **Step 4: run green.** Run each of these. Run smoke last: it reads the built `index.html`, so run it after `sh build.sh` in Step 5.

- `node test/lang.js .`: `N contrôles, LANGUE CONFORME`
- `node test/screens.js .`: `N checks, SCREENS OK`
- `node test/content.js .`: `N contrôles, CONTENU CONFORME`
- `node test/typed.js .`: `N contrôles, 0 en échec`
- `node test/sim.js .`: `ALL FLOWS OK`
- `node test/firstrun.js .`: `FIRST RUN IS CLEAN`
- `node test/journey.js . nl-BE OPR`: `N checks, NO PROBLEMS`
- `node test/sync.js .`: `N checks, SYNC OK`
- `node test/smoke.js .`, after the build: `ALL CHECKS PASSED`

- [ ] **Step 5: build and commit.**

1. Run `sh build.sh`, then `node test/smoke.js .`.
2. Commit `src/`, `test/lang.js`, `TESTING.md`, `index.html` and `artifact.html`. Take the message from a file whose subject is `fix(lang): a meaning in the other language is marked, and the notice shows on every screen`, with the body `Refs #69`.

### Task 5: When the display language changes on another device, the notice says so, and a switch made on this device does not

**Class:** engine
**Ticket:** #69 (item 3)

A change that arrives through sync now shows the same notice as one made on this device. The
learner can't tell why the language changed, and that is worse when the change waited out a
session. When this task is done, the two `sync.js` sites that merge settings mark a merge that
changes the display language. The next screen that applies that change shows `langSynced` before
`langNotice`. The switch on this device and a restored backup still show `langNotice` alone.
Nothing about the mark is stored (ADR 0009), and nothing here touches `resetAt`, `base` or a
stored field name (ADR 0006).

**Files** (lines at a7d5e76, as Task 4 leaves them; match on content):

- `src/core/lang.js`:
  - header comment :1-5
  - state :8
  - `apply` :12-23
  - `set` :25-28, which after Task 4 is 3 lines
  - `text` and `seen` :30-31
  - return :33
- `src/core/sync.js`: after `readMeta` (:263-267) add `takeMeta`, then use it at :301 and :362.
- `src/core/fr.js`: after `langNotice` (:245) add `langSynced: 'Langue changée sur un autre appareil.',`
- `src/core/en.js`: after `langNotice` (:244) add `langSynced: 'Language changed on another device.',`
- `test/sync.js`:
  - In `device()` (:113-139), add `dev.tap`.
  - Add a new block before `console.log('\nÉCRAN COMPTE');` (:1062).
- `TESTING.md:23` (the `sync.js` row).
- `index.html`, `artifact.html`.

**Interfaces**

- Consumes, from Task 4:
  - `NL.lang.set()` only stores.
  - `render()` draws `NL.lang.notice()` on main screens, on doctor and on compte.
- Produces:
  - `NL.lang.synced()`: marks the next `apply()` that changes the language as coming from sync.
  - `NL.lang.notice()`, which returns:
    - `NL.t.langSynced + ' ' + NL.t.langNotice` after a synced change;
    - `NL.t.langNotice` after a change made on this device;
    - `''` once `seen()` has run.
  - The key `langSynced` in both tables.
  - In `test/sync.js`, `dev.tap(dataset)`, which clicks the way `tapOn` does in `test/lang.js`.

- [ ] **Step 1: write the check.** In `device()`, after `dev.offline = …`, add:

```js
  dev.tap = d => (B.listeners.click || []).forEach(f => f({ target: { closest: () => ({ dataset: d }) } }));
```

Add this block just before `console.log('\nÉCRAN COMPTE');`:

```js
  console.log('\nLANGUE CHANGÉE AILLEURS');
  {
    /* #69, 3. Le choix fait ici donne l'avis seul ; celui qui arrive d'un autre appareil,
       par une lecture ou par un envoi, dit d'où il vient, même après une séance. */
    const T1 = device('T1', true), T2 = device('T2', true);
    for (const d of [T1, T2]) { await d.boot(); await d.signIn('langue@example.com'); d.NL.lang.apply(true); d.NL.ui.go('vandaag'); }
    const fr = T1.NL.tables.fr, en = T1.NL.tables.en;
    const shown = d => d.root.innerHTML.replace(/<[^>]*>/g, ' ');
    const count = (s, sub) => s.split(sub).length - 1;
    T1.NL.lang.set('fr'); T1.NL.ui.render();
    ok(count(shown(T1), fr.langNotice) === 1 && shown(T1).indexOf(fr.langSynced) < 0, '69.3: the switch made on this device does not show the notice alone');
    await T1.NL.sync.flush();
    await T2.NL.sync.pull(); T2.NL.ui.render();
    ok(count(shown(T2), fr.langSynced + ' ' + fr.langNotice) === 1, '69.3: after a pull that brought French, the notice does not say the change came from another device');
    T2.NL.ui.go('leerpad');
    ok(shown(T2).indexOf(fr.langNotice) < 0, '69.3: the notice is still there after the next go()');
    T2.NL.ui.go('doctor'); T2.NL.state.setMeta({ theme: 'dark' });   // un réglage d'ici : l'envoi fusionne avant d'écrire
    await wait(3);
    T1.NL.lang.set('en'); T1.NL.ui.render(); await T1.NL.sync.flush();
    await T2.NL.sync.flush(); T2.NL.ui.render();
    ok(count(shown(T2), en.langSynced + ' ' + en.langNotice) === 1, '69.3: after a flush that brought English, doctor does not say the change came from another device');
    T2.NL.ui.go('vandaag');
    T2.NL.content.allItems().filter(it => it.unit !== 'eigen').slice(0, 12).forEach((it, i) => {
      T2.NL.srs.seed(it, 1); const r = T2.NL.state.rec(it.id); r.due = Date.now() - 1000 * (i + 1); T2.NL.state.setRec(r);
    });
    ok(T2.NL.screens.sessie.begin('vandaag'), '69.3: no session to start'); T2.NL.ui.go('sessie');
    T1.NL.lang.set('fr'); T1.NL.ui.render(); await T1.NL.sync.flush();
    await T2.NL.sync.pull(); T2.NL.ui.render();
    ok(T2.NL.t.nav[1].label === en.nav[1].label, '69.3: a synced change applied in the middle of a session');
    T2.tap({ quitYes: '1' });
    ok(count(shown(T2), fr.langSynced + ' ' + fr.langNotice) === 1, '69.3: after the session, the notice does not say the change came from another device');
    /* Deux synchros contraires pendant une séance : rien n'a changé, rien ne s'annonce, et
       aucune marque ne reste pour la sauvegarde rendue ensuite. */
    T2.NL.ui.go('vandaag');
    ok(T2.NL.screens.sessie.begin('vandaag'), '69.3: no second session to start'); T2.NL.ui.go('sessie');
    T1.NL.lang.set('en'); T1.NL.ui.render(); await T1.NL.sync.flush(); await T2.NL.sync.pull();
    await wait(3);
    T1.NL.lang.set('fr'); T1.NL.ui.render(); await T1.NL.sync.flush(); await T2.NL.sync.pull();
    T2.tap({ quitYes: '1' });
    ok(shown(T2).indexOf(fr.langNotice) < 0, '69.3: two opposite syncs during a session leave a notice');
    const backup = T2.NL.state.exportAll();
    backup.meta = Object.assign({}, backup.meta, { displayLang: 'en' });
    T2.NL.state.importAll(backup); T2.NL.content.refresh(); T2.NL.ui.render();   // comme restore() dans shell.js
    ok(count(shown(T2), en.langNotice) === 1 && shown(T2).indexOf(en.langSynced) < 0, '69.3: a restored backup says the language came from another device');
    T2.NL.sync.queueAll(); await T2.NL.sync.flush(); T2.NL.ui.render();
    ok(T2.NL.lang.current() === 'en' && shown(T2).indexOf(en.langSynced) < 0, '69.3: once sent, the restored backup says the language came from another device');
    console.log('  choisie ici : l’avis seul ; venue d’ailleurs, par lecture, par envoi ou après une séance : l’avis le dit');
  }
```

`device('T1')`, `device('T2')` and `langue@example.com` are not used elsewhere in the file. The
block exercises both sites. The pull exercises :301. T2's own theme change makes its flush merge
before it writes, which exercises :362. The session part pins that the mark survives the `seen()`
inside `go()`.

- [ ] **Step 2: run red.** `node test/sync.js .` On Task 4's code, three checks fail: the pull, the flush
on doctor, and after the session. Each shows the notice without the cause, and the run ends
`N checks, 3 FAILED`. The other checks pass already: the first check (a switch made on this device),
the notice gone after `go()`, the mid-session check, and the five checks of the second session and the
restore (Review Focus 3 and 4). Those five guard the mark: they fail if `apply()` keeps it when nothing
changes. They were added after the scratch run and not tried; if one fails on Task 4's code, stop and
report. If the flush check fails because doctor
shows no notice at all, Task 4's item 2 is missing: stop and report.

- [ ] **Step 3: implement.**

- `lang.js`:
  ```js
  let applied = null, notice = '', fromSync = false;
  …
  function apply(quiet) {
    /* La marque de synchro vaut pour l'appel suivant, qu'il change la langue ou non. */
    const bySync = fromSync; fromSync = false;
    const l = current();
    if (l === applied) return false;
    … (unchanged) …
    if (!quiet) notice = bySync ? 'sync' : 'own';
    return true;
  }

  /* Enregistre le choix ; render() l'applique au premier écran hors séance. */
  function set(lang) {
    fromSync = false;
    NL.state.setMeta({ displayLang: lang });
  }

  /* sync.js : la fusion vient de changer la langue, l'avis dira qu'elle vient d'ailleurs. */
  const synced = () => { fromSync = true; };

  const text = () => notice === 'sync' ? NL.t.langSynced + ' ' + NL.t.langNotice : notice ? NL.t.langNotice : '';
  const seen = () => { notice = ''; };

  return { current, apply, set, synced, notice: text, seen };
  ```
  Consume the mark before the early return. Otherwise two opposite syncs during a session leave a
  stale mark, and a later restore of a backup would be reported as a synced change. Add to the
  header comment: « Un changement venu d'un autre appareil le dit (`synced`) ; la marque, comme
  l'avis, n'est pas enregistrée. »
- `sync.js`, right after `readMeta`:
  ```js
  /* Les réglages fusionnés prennent la place de ceux d'ici. Une langue d'affichage
     qui change ainsi vient d'un autre appareil : NL.lang le dira dans l'avis. */
  function takeMeta(merged) {
    const before = NL.lang.current();
    NL.state.setMeta(merged, true);
    if (NL.lang.current() !== before) NL.lang.synced();
  }
  ```
  At :301, `NL.state.setMeta(merged, true);` becomes `takeMeta(merged);`, and `merged` stays for
  the comparison at :302. At :362, the line becomes
  `if (remoteMeta) takeMeta(mergeMeta(NL.state.meta(), remoteMeta));`.
  `setMeta(…, true)` emits nothing, so the mark is set before the render that `notify()` brings.
- Add the two keys from the Files list.
- In `TESTING.md:23` (the `sync.js` row), append before the closing ` |`: `, et une langue d'affichage changée sur un autre appareil, que l'avis nomme`.

- [ ] **Step 4: run green.** Run each of these, smoke after the build:

- `node test/sync.js .`: `N checks, SYNC OK`
- `node test/lang.js .`: `N contrôles, LANGUE CONFORME`. Both tables have `langSynced`, and the 69.x checks still pass.
- `node test/screens.js .`: `SCREENS OK`
- `node test/firstrun.js .`: `FIRST RUN IS CLEAN`
- `node test/journey.js . nl-BE OPR`: `NO PROBLEMS`
- `node test/smoke.js .`: `ALL CHECKS PASSED`

- [ ] **Step 5: build and commit.**

1. Run `sh build.sh`, then `node test/smoke.js .`.
2. Commit `src/`, `test/sync.js`, `TESTING.md`, `index.html` and `artifact.html`. The subject is `feat(lang): the notice says when the language changed on another device`, and the body is `Refs #69`.

### Blocking edges

- 4 ← 1: both change `test/lang.js`, and Task 4's checks use the helpers Task 1 leaves there.
- 5 ← 4: Task 5 consumes `set()` that only stores, and the notice drawn on doctor and compte.
- Tasks 2 and 3 block nothing and wait for nothing. The run takes the tasks in order, 1 to 5.

## After the run

1. The run controller dispatches the closing review (`closing-review.md`).
2. The maintainer runs `/code-review main` on the branch.
3. The pull request's body says `Closes #67`, `Closes #68`, `Closes #69`, `Closes #70` and `Refs #12`. The
   maintainer merges `phase-2-follow-ups` into `main`, which deploys.
4. #71 (the code smells from PR #44's review) waits for triage. It is not part of this plan.

## Decisions taken while writing this plan

For the maintainer's review. None changes the spec.

Order and classes:
- #69 is split in two. Task 4 holds items 1, 2 and 4–11 (mechanical). Task 5 holds item 3, the one that touches
  `src/core/sync.js`, so it runs as `engine` and an Opus reviewer reads it, as phase 2's ruling « after the run »
  asked.
- Tasks 2 and 3 could run before Task 1; they keep their ticket order because nothing is gained by moving them.

Task 1 (#67):
- The Plus strip gets a positive check on its exact labels instead of losing its two dead checks, so a
  counter that comes back is caught. The check that every screen renders without throwing is kept.
- The table functions are called with (3, 7, 12) and in the singular with 1s; `paceNote` gets `{ mins, cap }`,
  as `src/ui/shell.js:127` passes it.
- 5d and 5d bis sign out through `NL.sync.signOut()` against a minimal fake Supabase in `test/lang.js`.
  `test/sync.js`'s fake is not shared.
- 5f has one `OTHER` table and one `foreign()` judge, shown red on a planted view.
- French words stop being « known » everywhere: two markup masks replace the word lists.
- 2d keeps its identical twins and adds a third boot whose twins share only their English sense.
- Every boot runs on a fixed clock, `T0` (`test/screens.js`'s date). 5c moves the clock instead of
  busy-waiting.
- The one `SCREENS` list is `test/lib/screens.js`.

Task 2 (#68):
- The tool proves its own fix: it exits 1 and prints `TROU : <file> <where|key>` on a hole, and is shown red on
  the old code (123 holes). It stays out of `run-all.sh`.
- Only `prose.tsv` and `interface.tsv` are checked, the two files the ticket faults.
- The fix stays in `check-files.js`; `test/lib/prose.js` is untouched.

Task 3 (#70):
- The ticket's one-line comment is wrapped over two lines. The `CLAUDE.md` bullet adds the ticket's reason in
  parentheses.

Task 4 (#69, items 1, 2, 4–11):
- The labels are `69.n`, n being the ticket's item. The checks sit in a new `displayChecks()` at the end of
  `test/lang.js`'s chain; each boots its own device.
- `NL.gloss.htmlLang(x)` is the one helper for every `lang` on a meaning.
- Besides the five sites the ticket names, the exercise prompts that show an item's meaning take `lang` too
  (Review Focus 2). The options of `recall` (`src/ex/index.js:170`) and the scenario's choices, `say-en` and
  listening options stay unmarked: shipped content owes no English (`test/content.js`), so only own words can
  show the other language, and those sites never show an own word's meaning except `recall`'s options. They
  are left for phase 3.
- The notice is drawn at the top of the full screen for doctor and compte only, never for sessie or scenario.
- `set()` returns nothing. 5c and 5e in `test/lang.js` call `NL.ui.render()` after `NL.lang.set()`.
- 69.5 asserts « at least 2 screens », so it does not depend on how many lines s-bakker has.

Task 5 (#69, item 3):
- « Synced » means `NL.lang.current()` differs before and after the merge. An absent `displayLang` and `'en'`
  count as the same.
- The mark lives in memory only. `apply()` consumes it even when nothing changes, and `set()` clears it.
- The French notice keeps « Antisèches » (PR #44's review).

A gap this plan does not close:
- **Sign-in through the account screen loses the notice.** When a new device signs in to an account that reads
  the other language, `pull` changes the language and `app.js`'s `onChange` redraws compte, which applies it and
  draws the notice. `verify()` (`src/ui/account.js:82-91`) then calls `go('vandaag')`, whose `seen()` clears
  it, so the learner reads the account's language without a word. No suite signs in through the compte screen
  with `app.js` loaded, so a red test needs a new harness. Fixing it is the maintainer's call, as a ticket after
  this run.

Corrections to the tickets, found while drafting:
- #67 item 5: « la » and « de » are never flagged anyway. The real victims are about 37 English `fauxEn` words,
  whose rows are on the `register` screen.
- #67 item 3: 5d bis (`test/lang.js:452`) calls `clearAll()` too, and `signOut()` needs configured sync and a
  signed-in user.
- #67 items 4, 6, 7: the old regex is also at `:498`; 2d's match check needs identical twins; a fixed clock
  breaks 5c's millisecond ids.
- #67 item 1: `test/screens.js:307` also checks that every screen renders without throwing.
- #68 item 2: four `interface.tsv` rows read « undefined », not only `courseCounts`: `todaySplit`,
  `courseCounts`, `unitCounts` and `paceNote`.
- #69 item 1: `listen.js:92` and `scenario.js:89`/`:92` are `<p>`, not spans.
- #69 item 4: `set()`'s `apply(false)` is on `lang.js:27`. Making `set()` only store breaks 5e and weakens 5c
  in `test/lang.js`, which the ticket does not say.
- #69 item 8: three comments stack over `sameSense` (`src/ex/index.js:57-67`), the first describing `others()`.
  Only `:110` of `score`'s trailing comments is misaligned.
- #69 item 11: `doctor.js:8` (the state) and `:82` (the draw) change too.
