# Phase 2 Cleanup — Implementation Plan

> **For agentic workers:** this plan runs with `docs/agents/plan-runs/`. A run controller
> (`run-controller.md`) hands one task at a time to a task controller; do not use a skill's controller loop.
> Implementers read `docs/agents/plan-runs/run-notes.md` before their brief; where the notes and a command
> here differ, the notes win. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The « language changed on another device » notice reaches the learner however a sign-in ends (#73).
#71's small smells are gone (#74): each thing is called by the name it already has, each duplicate is one
helper, each name says what it holds, and the test suites copy and walk the course through `test/lib`. Apart
from the notice that #73 brings back, nothing the learner sees changes.

**Architecture:**
- No new module in the app. One new test helper, `test/lib/tree.js`, and one new function in
  `test/lib/prose.js`, `raw()`.
- Six tasks from two tickets that hang off #12, on `main` at `66ce665`.
- Task 1 (#73) changes when `src/core/lang.js` counts the notice as seen, and adds a sign-in on the compte
  screen to `test/sync.js`. Tasks 2–6 (#74) rename and deduplicate. Each leaves a static guard in
  `test/smoke.js`, as `6218095`'s guards do.
- Task 3 is the one `engine` task: it touches `clearAll` and the restore in `src/core/state.js`. It runs alone,
  and an Opus reviewer reads it.

**Tech Stack:**
- Plain browser JavaScript, concatenated by `build.sh`.
- Node test suites in a `vm` sandbox (`test/lib/browser.js`).
- `gh` for tickets and the pull request.

**Spec:**
- GitHub issue #12, and the two tickets this plan implements:
  - #73 (Task 1);
  - #74 (Task 2: items 1, 2, 4 and 5; Task 3: item 3; Task 4: items 6 and 8; Task 5: item 7; Task 6: items 9
    and 10).
- Each task carries its ticket's decisions; the ticket is not needed to do it.
- #74's out-of-scope items (#71 items 1, 3a and 4) go to the phase 3 design sitting.
- `GLOSSARY.md`, and ADRs 0006 (a reset is a timestamp), 0008 (grading ignores the display language) and
  0009 (the switch is live, never mid-session).

## How far to trust this plan

- Every task's draft was applied in plan order to a scratch copy of `66ce665`, `main` after PR #72. Each task was
  first run red, with its checks on the previous task's code, then green. Each red and green line in a step was
  seen there.
- Line numbers are those of `66ce665`. An earlier task moves a later task's lines, so match on content.
- With all six tasks applied and `sh build.sh` run, `sh test/run-all.sh` ended `TOUTE LA SUITE EST PASSÉE`.
- Task 4's guard on the variable `en` (`src/ui/library.js:89`) was added after the full run, and its regex lost
  a needless group. Both were then run with `node test/smoke.js .` only: red on Task 3's code, green on Task 4's
  and on all six tasks.
- Not run:
  - CI on GitHub.
  - A real browser. Both sign-in paths in Task 1 run against `test/lib/supabase.js`'s fake, not supabase-js.
    That supabase-js relays `SIGNED_IN` between tabs is the ticket's finding, not something seen here.
  - `node test/tools/check-files.js . <dir>` with an output folder. Task 6 ran it without one, as `run-all.sh`
    does.
  - The journeys other than `nl-BE EDG` ran only in the full run, not after each task.

## Set-up decisions

- The run works in the worktree `.claude\worktrees\cleanup` of the clone at `%USERPROFILE%\dev\vlaams-phase-2`,
  on the branch `phase-2-cleanup`, made from `main` at `66ce665` (the merge of PR #72). The plan's commit sits on
  top. The pull request into `main` is opened as a draft when the run starts.
- If `main` moves before the run ends, nothing is merged in: the closing review and the maintainer's
  `/code-review main` see the branch as it is.

## Global Constraints

Code:
- `const`, or `let` where it changes; never `var`; no optional chaining. Arrows for short helpers and
  callbacks, `function` declarations for longer named functions. Existing code is not converted.
- Comments match the file being edited: French in `src/` and in most suites. Check messages match their suite:
  English in `test/smoke.js` and `test/sync.js`, French in `test/lang.js` and `test/content.js`.
- The working tree is CRLF (`core.autocrlf=true`). A multi-line match needs `\r\n`, or an editor that keeps
  line endings. A new file may be written LF; git normalises it on add.

Interface text and stored data:
- Interface text lives in `src/core/fr.js` (`NL.tables.fr`) and `src/core/en.js` (`NL.tables.en`), with the
  same keys. No interface text lives anywhere else.
- Meanings and prose are read through `NL.gloss`; the display language through `NL.lang`.
- The renames in this plan are code names only: `wordsFr`, `wordsPhFr`, the field id `add-en`, the variable
  `en` in `library.js`, the internal `notice` of `lang.js`, and `voiceInfo().note`. No storage key changes, and
  no field inside a stored record. `displayLang` keeps its spelling.
- Nothing in this plan changes `resetAt`, `base` or `ENGINE_EPOCH`. Task 3 touches `clearAll` and the restore,
  and both keep what they store and when.

Behaviour:
- Grading ignores the display language (ADR 0008): `accepted()`, `siblings()` and `sameSense()` keep their rule.
- A change of display language never applies inside `sessie` or `scenario` (ADR 0009).
- Progress is reported as counts, never percentages.
- The HTML of every screen is unchanged, in both languages, except the notice that Task 1 keeps on screen.

Tests:
- Every fix leaves a check that fails on the old code. Write it, run it and watch it fail, then fix. The red
  output goes in the implementer's report.
- For a rename or a removed duplicate, a static guard in `test/smoke.js` is enough. A guard never matches its
  own source text. `test/smoke.js` is itself one of the `suites` it reads.
- No check is weakened to pass. If a check finds a real fault the task does not own, stop and report
  `NEEDS_RULING` with the failing output.
- Suites load the app through `test/lib/browser.js` and answer as a learner would, through `test/lib/answer.js`.
  A suite may call `NL.*` to set up or read state. What two suites share lives in `test/lib`.

Budgets and the build:
- Budgets in `test/content.js` only go down.
- After changing anything under `src/`, run `sh build.sh` and commit `index.html` and `artifact.html` with the
  change.

Public repository:
- The repo is public. No personal data goes in a tracked file; the person is « the maintainer ». Test e-mail
  addresses are `@example.com`.

## Review Focus

1. **A notice drawn and replaced in the same tick.**
   - Condition: a sign-in finishes while compte is open, and `SIGNED_IN` arrives from another tab. `app.js`
     redraws compte, which applies the account's language and draws the notice. Then `onAuth()` goes to
     vandaag, whose `seen()` runs in the same tick.
   - Expected: vandaag shows `langSynced` then `langNotice`, once.
   - Test: Task 1, step 1, the block `CONNEXION FINIE SUR L’ÉCRAN COMPTE` (« another tab »), and the 69.3
     same-tick check.
2. **The notice still goes away.**
   - Condition: the notice is drawn, a tick passes, and the learner opens another screen.
   - Expected: the second screen shows no notice. The tick mark must not keep a notice that was read.
   - Test: Task 1, step 1, the 69.3 check « after a go() in a later tick », and the rest of the 69.3 block.
3. **A rebuilt meta keeps the device's language.**
   - Condition: on a device reading French, the learner signs out (`clearAll`), or restores a backup whose meta has
     no `displayLang`. A backup that has one is also restored.
   - Expected: French stays in the first two cases, and `clearAll` still writes it back to the device silently.
     A backup's own `displayLang` wins.
   - Test: Task 3, step 4: `test/lang.js` 5d and 5d bis, `test/sync.js`, and `test/engine.js`.
4. **`NL.ui.ifText` writes the same HTML as the six fragments it replaces.**
   - Condition: a note whose English is `null`, a note absent, and `it` undefined in `session.js`.
   - Expected: no empty `<em>` or `<p>`, the same tag and class as before, and no throw on `it && it.note`.
     `NL.gloss.of` returns `''` for `null` and `undefined`.
   - Test: Task 2, step 4: `test/screens.js`, `test/lang.js` and the journey.
5. **One walker, the same visits.**
   - Condition: `tree.visit` passes an array's key to its elements and calls `fn` on the root. The hand-written
     walkers it replaces did not all do either.
   - Expected: the sets `langAttrFind` and `dutchWords` build, and the pairs `pairUp` makes, are the same as
     before. `test/content.js` still counts 262 checks.
   - Test: Task 6, step 4. The equivalence was measured on the scratch copy (see Decisions).
6. **The sync mark after `apply` is split.**
   - Condition: two opposite syncs arrive during a session, then a backup is restored (the 69.3 block).
   - Expected: `apply()` consumes the mark at boot as `apply(true)` did, and `applyAndTell()` reads it before
     `apply()` clears it. No stale mark survives.
   - Test: Task 5, step 4, `test/sync.js`.

---

## The run

Tasks 1–6, in order. A task's blocking edges are listed after Task 6.

### Task 1: The synced-language notice survives a screen that replaces it in the same tick

**Class:** mechanical
**Ticket:** #73
**Promises:** none

When a sign-in finishes while the compte screen is open, the display language changes to the account's, and the
« Langue changée sur un autre appareil » notice can be lost. Take a `SIGNED_IN` that arrives from another tab of
the same browser:
1. `src/core/sync.js` adopts the account's settings and marks the change as synced.
2. `app.js` redraws compte, which applies the language and draws the notice.
3. `NL.ui.onAuth()` goes to vandaag in the same tick, and `go()` calls `NL.lang.seen()`.
4. `seen()` clears a notice nobody could read.

The six-digit code path keeps the notice only because `verifyOtp` fires `SIGNED_IN` before it resolves.

When this task is done, a notice counts as seen only once the tick it rose in is over. `apply()` sets
`shown = false` and schedules `shown = true` with `setTimeout(…, 0)`, and `seen()` clears the notice only when
`shown` is true. A screen drawn in a later tick still clears it.

Notes: the test drives the whole page, `app.js` included, because `app.js` redraws compte when the session
arrives. `test/sync.js`'s `device()` skips `app.js`, so the block builds its own page. The other tab is the fake
client's `auth.verifyOtp(…)`, called directly: it writes the session and fires `SIGNED_IN`, as supabase-js
relays it. For that, `test/lib/supabase.js` keeps the client it made on `device.client`. `test/sync.js`'s
messages are English and its comments French.

**Files:** (lines at 66ce665; match on content)
- `src/core/lang.js`: header comment :1-6, the state :9-10, `apply` :25, `seen` :44.
- `test/lib/supabase.js`: header comment :8-10, `return {` :87, and the end of that object :106-107.
- `test/sync.js`: the 69.3 block :983-985, and a new block before `console.log('\nÉCRAN COMPTE');` (:1017).
- `index.html`, `artifact.html`.

**Interfaces:**
- Produces:
  - `NL.lang.seen()` clears the notice only if the tick it rose in has ended.
  - In the fake from `test/lib/supabase.js`, `device.client` is the client the app created. A suite signs in
    « from another tab » with `dev.client.auth.verifyOtp({ email, token: '123456', type: 'email' })`.
- Consumes:
  - `NL.lang.fromAccount()`, `NL.lang.notice()` and `NL.lang.seen()`, as PR #72 left them.
  - `browser.open()`'s `timers: 'real'`, `store`, `ua`, `config` and `supabase` options, and `B.tap`.
  - `count` from `test/lib/langs.js`, and `wait` and `fakeLib` from `test/sync.js`.

- [ ] **Step 1: write the checks.**

In `test/lib/supabase.js`, end the header comment (:8-10) this way:

```js
   Chaque appel à fakeSupabase() est un serveur neuf. dev.store est le localStorage de
   l'appareil : sa session y vit sous 'sb-session', et la poser avant open() ouvre l'appareil
   déjà connecté. dev.client est le client que l'app a créé : un autre onglet du même
   navigateur qui se connecte, c'est dev.client.auth.verifyOtp(…), qui écrit la session et
   lance SIGNED_IN, comme supabase-js le relaie d'un onglet à l'autre. */
```

In `createClient`, `return {` (:87) becomes `device.client = {`. After the object's closing `};` (:107), before
the `}` that closes `createClient`, add:

```js
        return device.client;
```

In `test/sync.js`, the 69.3 block's three lines (:983-985):

```js
    T2.NL.ui.go('leerpad');
    ok(shown(T2).indexOf(fr.langNotice) < 0, '69.3: the notice is still there after the next go()');
    T2.NL.ui.go('doctor'); T2.NL.state.setMeta({ theme: 'dark' });   // un réglage d'ici : l'envoi fusionne avant d'écrire
```

become:

```js
    /* #73. Dessiné puis remplacé dans le même tour, l'avis n'a pas été vu : il suit. */
    T2.NL.ui.go('leerpad');
    ok(count(shown(T2), fr.langSynced + ' ' + fr.langNotice) === 1, '73: a notice drawn and replaced in the same tick counts as seen');
    await wait(1);
    T2.NL.ui.go('doctor');
    ok(shown(T2).indexOf(fr.langNotice) < 0, '69.3: the notice is still there after a go() in a later tick');
    T2.NL.state.setMeta({ theme: 'dark' });   // un réglage d'ici : l'envoi fusionne avant d'écrire
```

Add this block just before `console.log('\nÉCRAN COMPTE');` (:1017), after the blank line that ends the 69.3
block:

```js
  console.log('\nCONNEXION FINIE SUR L’ÉCRAN COMPTE');
  {
    /* #73. Le compte est en français ; un appareil en anglais, sans session, attend sur
       l'écran compte. Que la connexion finisse par le code à six chiffres ou arrive d'un
       autre onglet (supabase-js y relaie SIGNED_IN), l'accueil où elle mène dit que la
       langue vient d'un autre appareil. app.js tourne ici : c'est lui qui redessine
       l'écran compte quand la session arrive, dans le tour où onAuth() en part. */
    const U = device('U', true);
    await U.boot(); await U.signIn('onglet@example.com');
    U.NL.lang.set('fr'); await U.NL.sync.flush();
    const fr = U.NL.tables.fr;
    /* La page entière, app.js compris ; les champs de l'écran compte se lisent dans vals. */
    const page = name => {
      const dev = { name, store: {} }, vals = {};
      const B = browser.open({
        root: ROOT, timers: 'real', store: dev.store, ua: 'Mozilla/5.0 Chrome/120',
        config: { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon' }, supabase: fakeLib(dev)
      });
      B.ctx.document.getElementById = id => (id === 'app' ? B.app : { value: vals[id] || '' });
      return Object.assign(dev, { NL: B.NL, root: B.app, tap: B.tap, vals });
    };
    const landed = (dev, how) => {
      const shown = dev.root.innerHTML.replace(/<[^>]*>/g, ' ');
      ok(dev.NL.ui.route === 'vandaag' && dev.NL.lang.current() === 'fr',
        '73 (' + how + '): the sign-in landed on ' + dev.NL.ui.route + ' in ' + dev.NL.lang.current() + ', expected vandaag in French');
      ok(count(shown, fr.langSynced + ' ' + fr.langNotice) === 1, '73 (' + how + '): vandaag does not say the language came from another device');
    };
    const V = page('V');
    await wait(5);
    ok(V.NL.ui.route === 'compte' && V.NL.lang.current() === 'en', '73: a device without a session does not open on compte in English');
    V.vals['acc-email'] = 'onglet@example.com'; V.tap({ act: 'send' }); await wait(5);
    V.vals['acc-code'] = '123456'; V.tap({ act: 'verify' }); await wait(20);
    landed(V, 'six-digit code');
    const W = page('W');
    await wait(5);
    W.client.auth.verifyOtp({ email: 'onglet@example.com', token: '123456', type: 'email' });
    await wait(20);
    landed(W, 'another tab');
    console.log('  connexion finie sur l’écran compte, par le code ou par un autre onglet : l’accueil dit d’où vient la langue');
  }

```

`device('U')`, `page('V')`, `page('W')` and `onglet@example.com` are not used elsewhere in the file.

- [ ] **Step 2: run red.** `node test/sync.js .` prints exactly two failures, and the run ends
`233 checks, 2 FAILED`:

```
  FAIL: 73: a notice drawn and replaced in the same tick counts as seen
  FAIL: 73 (another tab): vandaag does not say the language came from another device
```

The six-digit code's two checks pass on the old code, as the ticket's table says. They guard the path that
works. If « a device without a session does not open on compte » fails, the page harness is wrong, not the
app: stop and report.

- [ ] **Step 3: implement.** In `src/core/lang.js`:

- The header comment (:1-6) becomes:
  ```js
  /* La langue d'affichage : un seul endroit la décide, un seul endroit l'applique.
     Absente des réglages, c'est l'anglais. Un changement ne s'applique jamais en
     pleine séance ni en pleine conversation : le shell n'appelle `apply` qu'en
     dehors d'elles, au premier écran dessiné ensuite. Le bandeau d'avis n'est pas
     enregistré : il se dit une fois, puis `seen` l'efface, jamais dans le tour où il
     s'est levé. Un changement venu d'un autre appareil le dit (`fromAccount`) ; la
     marque, comme l'avis, n'est pas enregistrée. */
  ```
- The state (:9-10) becomes:
  ```js
    /* notice : les clés de NL.t que l'avis dit, dans l'ordre ; vide, il n'y a pas d'avis.
       shown : le tour où l'avis s'est levé est fini, l'avis a donc pu être vu. */
    let applied = null, notice = [], shown = false, fromSync = false;
  ```
- In `apply`, `if (!quiet) notice = bySync ? ['langSynced', 'langNotice'] : ['langNotice'];` (:25) becomes:
  ```js
      if (!quiet) {
        notice = bySync ? ['langSynced', 'langNotice'] : ['langNotice'];
        /* render() dessine l'avis dans le tour où il se lève. Un avis dessiné puis
           remplacé dans ce même tour n'a pas été vu : seen() ne l'efface qu'au tour d'après. */
        shown = false;
        setTimeout(() => { shown = true; }, 0);
      }
  ```
- `seen` (:44) becomes `const seen = () => { if (shown) notice = []; };`

- [ ] **Step 4: run green.**
- `node test/sync.js .`: `233 checks, SYNC OK`
- `node test/lang.js .`: `21279 contrôles, LANGUE CONFORME` (about 75 s)

- [ ] **Step 5: build and commit.**
1. Run `sh build.sh`, then `node test/smoke.js .`: `ALL CHECKS PASSED`.
2. Commit `src/core/lang.js`, `test/lib/supabase.js`, `test/sync.js`, `index.html` and `artifact.html`. The
   subject is `fix(lang): a notice drawn and replaced in the same tick is not seen`, and the body is `Refs #73`.

### Task 2: What already has a name is called by it: `NL.gloss.other`, `NL.gloss.sameSense`, a tier's texts and `NL.ui.ifText`

**Class:** mechanical
**Ticket:** #74 (items 1, 2, 4 and 5)
**Promises:** none

Four smells from #71 write out again something that already has a name:
- `src/ui/shell.js:124` works out the other language by hand, beside `NL.gloss.other`.
- `NL.ex` re-exports `NL.gloss.sameSense` under its own name.
- The doctor repeats one getter pair six times.
- Six sites repeat « the text, if there is any, in a tag ».

When this task is done, each is called by one name. The HTML every screen produces is unchanged.

Notes: the doctor's helper is named `tierText`, not the ticket's `tier`. `render()` declares
`const tier = NL.speech.tier()` (`src/ui/doctor.js:41`), and a closure-level `tier` would be shadowed there.
`ifText` reads its text through `NL.gloss.of`, which returns `''` for `null` and `undefined`, so `session.js`
can pass `it && it.note`. Comments are French in `src/`, and `test/smoke.js`'s are English.

**Files:** (lines at 66ce665; match on content)
- `src/ui/shell.js`: :124 (the other language); after `unitLabel` (:101-105) add `ifText`; the export :393.
- `src/ex/index.js`: the comment :62-63, the alias :64, `siblings` :77, the export :608.
- `src/ui/doctor.js`: `TIERS` :10-17.
- `src/ui/library.js` :116, :146, :157; `src/ui/scenario.js` :101, :111; `src/ui/session.js` :442.
- `test/smoke.js`: after the `lang`/`en-GB` block (:197-205).
- `index.html`, `artifact.html`.

**Interfaces:**
- Produces: `NL.ui.ifText(x, tag, cls)`. It returns `'<tag class="cls">' + esc(NL.gloss.of(x)) + '</tag>'`
  (no `class` attribute without `cls`), or `''` when `NL.gloss.of(x)` is empty.
- Removes: `NL.ex.sameSense`. Nothing in `src/` or `test/` calls it: `git grep -n "ex.sameSense"` at 66ce665
  prints only the comment at `src/ex/index.js:63`, which this task rewrites.
- Consumes: `NL.gloss.other`, `NL.gloss.sameSense`, `NL.gloss.of`, and `esc` in `shell.js`'s closure.

- [ ] **Step 1: write the guard.** In `test/smoke.js`, after the `sources.filter(f => f !== 'src/core/gloss.js')…`
block that ends at :205, and before the blank line and `/* The suites share their helpers…`, add:

```js

  /* #74. What already has a name is not written out again: the other language is
     NL.gloss.other, the comparison of senses is read from NL.gloss alone, a tier's two
     texts are one getter pair, and « the text, if there is any » is NL.ui.ifText. */
  const byHand = /NL\.gloss\.of\(([\w.]+)\) \? '<\w+[^']*>' \+ esc\(NL\.gloss\.of\(\1\)\)/g;
  sources.forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (f !== 'src/core/gloss.js') ok(!/=== '(en|fr)' \? '(?!\1)(?:en|fr)' : '\1'/.test(src), f + ': works out the other language by hand; use NL.gloss.other');
    (src.match(byHand) || []).forEach(m => ok(false, f + ': ' + m + '… writes « the text, if there is any » by hand; use NL.ui.ifText'));
  });
  ok(!('sameSense' in NL.ex), 'NL.ex re-exports sameSense; read it from NL.gloss');
  const doctor = fs.readFileSync(path.join(ROOT, 'src/ui/doctor.js'), 'utf8');
  ok((doctor.match(/get label\(\)/g) || []).length === 1, 'src/ui/doctor.js writes a tier\'s getter pair more than once; use tierText');
```

- [ ] **Step 2: run red.** `node test/smoke.js .` prints these nine failures and ends `9 CHECK(S) FAILED`:

```
  FAIL: src/ui/shell.js: works out the other language by hand; use NL.gloss.other
  FAIL: src/ui/session.js: NL.gloss.of(it.note) ? '<p class="v-note">' + esc(NL.gloss.of(it.note))… writes « the text, if there is any » by hand; use NL.ui.ifText
  FAIL: src/ui/scenario.js: NL.gloss.of(step.you.hint) ? '<p class="ask-hint">' + esc(NL.gloss.of(step.you.hint))… writes « the text, if there is any » by hand; use NL.ui.ifText
  FAIL: src/ui/scenario.js: NL.gloss.of(c.note) ? '<p class="say-note">' + esc(NL.gloss.of(c.note))… writes « the text, if there is any » by hand; use NL.ui.ifText
  FAIL: src/ui/library.js: NL.gloss.of(r.note) ? '<em>' + esc(NL.gloss.of(r.note))… writes « the text, if there is any » by hand; use NL.ui.ifText
  FAIL: src/ui/library.js: NL.gloss.of(r.note) ? '<em>' + esc(NL.gloss.of(r.note))… writes « the text, if there is any » by hand; use NL.ui.ifText
  FAIL: src/ui/library.js: NL.gloss.of(r.note) ? '<em>' + esc(NL.gloss.of(r.note))… writes « the text, if there is any » by hand; use NL.ui.ifText
  FAIL: NL.ex re-exports sameSense; read it from NL.gloss
  FAIL: src/ui/doctor.js writes a tier's getter pair more than once; use tierText
```

- [ ] **Step 3: implement.**

- `src/ui/shell.js:124`: `(NL.lang.current() === 'en' ? 'fr' : 'en')` becomes
  `NL.gloss.other(NL.lang.current())`, without the parentheses around it:
  ```js
          '<button class="btn wide" data-display-lang="' + NL.gloss.other(NL.lang.current()) + '">' + t.langOther + '</button></div>' +
  ```
- `src/ui/shell.js`, after `unitLabel`'s closing `}` (:105) and a blank line:
  ```js
    /* Le texte `x` (lu par NL.gloss) dans une balise, s'il y en a un ; sinon rien. */
    function ifText(x, tag, cls) {
      const s = NL.gloss.of(x);
      return s ? '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + esc(s) + '</' + tag + '>' : '';
    }
  ```
  The export (:393) becomes `bind, render, go, toast, openSheet, closeSheet, I, card, unitLabel, ifText, onAuth,`.
- `src/ex/index.js`:
  - The comment's last two lines (:62-63) become one, with no sentence about the re-export:
    `     appartient à la phrase et ne sépare rien. La comparaison vit dans NL.gloss. */`
  - Delete `const sameSense = NL.gloss.sameSense;` (:64).
  - In `siblings` (:77), `sameSense(x, item)` becomes `NL.gloss.sameSense(x, item)`.
  - The export (:608) drops `sameSense, `:
    `return { registry: R, get: id => R[id] || R.pick, ICON, speakerRow, flemish, recordPanel, selfRate, wordScore, hereLine };`
- `src/ui/doctor.js`, `TIERS` (:10-17) becomes:
  ```js
    /* Le titre et la note d'un palier, lus dans NL.t à chaque dessin : la langue a pu changer. */
    const tierText = (label, note) => ({ get label() { return t[label]; }, get note() { return t[note]; } });
    const TIERS = {
      full: tierText('tierFull', 'tierFullNote'),
      scored: tierText('tierScored', 'tierScoredNote'),
      novoice: tierText('tierNoVoice', 'tierNoVoiceNote'),
      refused: tierText('tierRefused', 'tierRefusedNote'),
      compare: tierText('tierCompare', 'tierCompareNote'),
      self: tierText('tierSelf', 'tierSelfNote')
    };
  ```
- The six fragments. Each replaces the whole parenthesised `(… ? … : '')`, and the `+` around it stays:

  | Site | Before | After |
  | --- | --- | --- |
  | `library.js:116`, `:146`, `:157` | `(NL.gloss.of(r.note) ? '<em>' + esc(NL.gloss.of(r.note)) + '</em>' : '')` | `NL.ui.ifText(r.note, 'em')` |
  | `scenario.js:101` | `(NL.gloss.of(step.you.hint) ? '<p class="ask-hint">' + esc(NL.gloss.of(step.you.hint)) + '</p>' : '')` | `NL.ui.ifText(step.you.hint, 'p', 'ask-hint')` |
  | `scenario.js:111` | `(NL.gloss.of(c.note) ? '<p class="say-note">' + esc(NL.gloss.of(c.note)) + '</p>' : '')` | `NL.ui.ifText(c.note, 'p', 'say-note')` |
  | `session.js:442` | `(it && NL.gloss.of(it.note) ? '<p class="v-note">' + esc(NL.gloss.of(it.note)) + '</p>' : '')` | `NL.ui.ifText(it && it.note, 'p', 'v-note')` |

  `scenario.js:111` ends its statement: it keeps its `;`.

- [ ] **Step 4: run green.**
- `node test/smoke.js .`: `ALL CHECKS PASSED`
- `node test/screens.js .`: `617 checks, SCREENS OK`
- `node test/lang.js .`: `21279 contrôles, LANGUE CONFORME`

- [ ] **Step 5: build and commit.**
1. Run `sh build.sh`, then `node test/smoke.js .`.
2. Commit `src/`, `test/smoke.js`, `index.html` and `artifact.html`. The subject is
   `refactor(ui): what already has a name is called by it`, and the body is `Refs #74`.

### Task 3: A rebuilt meta keeps the device's language in one place, `withDeviceLang`

**Class:** engine
**Ticket:** #74 (item 3)
**Promises:** none

The display language is the device's choice, not progress. Two places rebuild the meta and carry the device's
language across, each in its own way: `clearAll` (`src/core/state.js:189-200`) and the restore (`:306`, three
statements on one line). When this task is done, one function, `withDeviceLang(next)`, gives a rebuilt meta the
device's language when the new meta has none, and both places call it. `clearAll` still writes the language
back to the device silently, as it does now. A backup's own `displayLang` still wins.

Notes: this is the `engine` task because it touches `clearAll` and the restore. Nothing here changes
`resetAt`, `base`, `ENGINE_EPOCH` or a stored field name (ADR 0006). `withDeviceLang` reads `meta`, the meta
being replaced, before the assignment. `meta = withDeviceLang(…)` evaluates the right side first. Comments are
French.

**Files:** (lines at 66ce665; match on content)
- `src/core/state.js`: before `clearAll` (:189) add `withDeviceLang`; `clearAll` :189-194; the restore :306.
- `test/smoke.js`: after Task 2's guard (the `src/ui/doctor.js … use tierText` line).
- `index.html`, `artifact.html`.

**Interfaces:**
- Produces: `withDeviceLang(next)`, private to `NL.state`'s closure. It sets `next.displayLang` from the current
  meta when `next` has none and the device has one, then returns `next`.
- Consumes: `defaults()` (which has no `displayLang`), `meta`, `setMeta(…, true)`.

- [ ] **Step 1: write the guard.** In `test/smoke.js`, after
`ok((doctor.match(/get label\(\)/g) || []).length === 1, …);` (Task 2), add:

```js
  /* Rebuilt settings keep the device's language in one place, withDeviceLang. */
  const state = fs.readFileSync(path.join(ROOT, 'src/core/state.js'), 'utf8');
  ok((state.match(/\.displayLang\s*=[^=]/g) || []).length === 1, 'src/core/state.js gives rebuilt settings the device\'s language in more than one place; use withDeviceLang');
```

The old code assigns `.displayLang` at `:193` and in `:306`, so the count is 2. It stays 2 until both sites call
the one function.

- [ ] **Step 2: run red.** `node test/smoke.js .` prints one failure and ends `1 CHECK(S) FAILED`:

```
  FAIL: src/core/state.js gives rebuilt settings the device's language in more than one place; use withDeviceLang
```

- [ ] **Step 3: implement.** In `src/core/state.js`, `clearAll`'s first six lines (:189-194):

```js
  function clearAll() {
    /* La langue d'affichage est un choix de l'appareil, pas de la progression : elle reste. */
    const lang = meta.displayLang;
    mem.srs.clear(); mem.custom.clear(); mem.log = []; meta = defaults();
    if (lang) meta.displayLang = lang;
    /* Elle reste aussi sur l'appareil, pour le rechargement qui suit une déconnexion. Écrite
```

become:

```js
  /* La langue d'affichage est un choix de l'appareil, pas de la progression : des réglages
     reconstruits sans langue gardent celle de l'appareil. */
  function withDeviceLang(next) {
    if (!next.displayLang && meta.displayLang) next.displayLang = meta.displayLang;
    return next;
  }
  function clearAll() {
    mem.srs.clear(); mem.custom.clear(); mem.log = [];
    meta = withDeviceLang(defaults());
    const lang = meta.displayLang;
    /* La langue reste aussi sur l'appareil, pour le rechargement qui suit une déconnexion. Écrite
```

The rest of `clearAll` (`… en silence : sans emit ni updatedAt …`, `keep`, and the two returns) is unchanged.
`lang` now reads the rebuilt meta, which holds the device's language or none, as before.

In the restore, :306:

```js
    if (data.meta) { const lang = meta.displayLang; meta = Object.assign(defaults(), data.meta); if (!data.meta.displayLang && lang) meta.displayLang = lang; }
```

becomes:

```js
    if (data.meta) meta = withDeviceLang(Object.assign(defaults(), data.meta));
```

Its comment on :305 stays.

- [ ] **Step 4: run green.**
- `node test/smoke.js .`: `ALL CHECKS PASSED`
- `node test/lang.js .`: `21279 contrôles, LANGUE CONFORME`. 5d (sign-out) and 5d bis (restore) pass.
- `node test/sync.js .`: `233 checks, SYNC OK`
- `node test/engine.js .`: `288 checks, ENGINE OK`

- [ ] **Step 5: build and commit.**
1. Run `sh build.sh`, then `node test/smoke.js .`.
2. Commit `src/core/state.js`, `test/smoke.js`, `index.html` and `artifact.html`. The subject is
   `refactor(state): a rebuilt meta keeps the device's language in one place`, and the body is `Refs #74`.

### Task 4: Names say what they hold, and the faux amis say why they read `r.en`

**Class:** mechanical
**Ticket:** #74 (items 6 and 8)
**Promises:** none

Several names say less than they hold, or the wrong thing:
- « Mes mots »'s meaning field is named after French (`wordsFr`, `wordsPhFr`, `add-en`, `en`), but it holds a
  meaning in either language.
- `lang.js`'s `notice` is a list of keys of `NL.t`, not a notice.
- The backup's copy borrows the error log's two texts.
- `voiceInfo().note` is a key of `NL.t`, not a note.

When this task is done:
- the meaning field is `wordsMeaning`, `wordsPhMeaning`, `add-meaning` and `meaning`;
- the list is `noticeKeys`;
- the backup has `backupCopied` and `backupCopyByHand`, with today's texts;
- the voice report's field is `noteKey`.

Item 8 is a comment. `src/ui/library.js` reads `r.en` for the English faux amis on purpose:
`NL.content.fauxEn` is in English in both displays (`src/content/reference.js:81-82`). The comment says so. It
has no red, and neither does the voice comment in `fr.js` and `en.js`.

Notes: these are code names. No storage key and no stored field changes. The export of `NL.lang` keeps its
name, `notice: text`. The error log keeps `errCopied` and `errCopyByHand` (`src/ui/doctor.js:116`), and
`doctor.js:53`'s `info.note` is a tier, not a `voiceInfo`, so it stays. `test/firstrun.js:27` reads
`voiceInfo().note` too, which the ticket does not list. `test/lang.js` check 4 compares the two tables, so the
renamed and new keys must be in both.

**Files:** (lines at 66ce665; match on content)
- `src/core/fr.js`: :201 and :207 (`wordsFr`, `wordsPhFr`); the comment :341; after `errCopied…` :352 add a line.
- `src/core/en.js`: :200 and :206; the comment :340; after :351 add a line.
- `src/core/lang.js`: the state comment and `let` (:9-10 at 66ce665, as Task 1 leaves them), the raise in
  `apply` (Task 1's block), and `text` and `seen` (:43-44).
- `src/core/speech.js:51`; `src/ui/home.js:36`; `src/ui/shell.js:150` and `:330`.
- `src/ui/library.js`: :47, :89-92, and a comment before `NL.content.fauxEn.map(r =>` (:174).
- `test/firstrun.js:27`, `test/journey.js:202`, `test/lang.js:410` and `:591`.
- `test/smoke.js`: after `console.log('  suites          ' + …);` (:218).
- `index.html`, `artifact.html`.

**Interfaces:**
- Produces:
  - Table keys `wordsMeaning`, `wordsPhMeaning`, `backupCopied` and `backupCopyByHand`, in both tables.
    `wordsFr` and `wordsPhFr` are gone.
  - The field id `add-meaning` on « Mes mots »'s add form.
  - `NL.speech.voiceInfo().noteKey`, a key of `NL.t` (`voiceNoteBe`, `voiceNoteNl` or `voiceNoteNone`).
- Consumes: Task 1's `lang.js` (`shown` beside the list).

- [ ] **Step 1: write the guard.** In `test/smoke.js`, after
`console.log('  suites          ' + suites.length + ' files: …');` (:218) and before the blank line and
`items.filter(i => i.art)`, add:

```js

  /* #74. A name says what it holds. The meaning typed into « Mes mots » is in either
     language; the notice's list holds keys of NL.t; the backup's copy has its own two
     texts; and voiceInfo() hands back a key of NL.t, read as t[v.noteKey]. */
  sources.concat(suites).forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    ok(!/\bwords(Ph)?Fr\b|\badd-en\b/.test(src), f + ': names the meaning of « Mes mots » after one language; it is wordsMeaning, wordsPhMeaning and add-meaning');
    ok(!/\bv\.note\b|voiceInfo\(\)\.note\b/.test(src), f + ': reads the voice report\'s key under its old name; it is noteKey');
  });
  ok(!/\bconst en\b/.test(fs.readFileSync(path.join(ROOT, 'src/ui/library.js'), 'utf8')), 'src/ui/library.js: the meaning typed into « Mes mots » is held in en; it is meaning');
  ok(!/\bnotice\s*=[^=]/.test(fs.readFileSync(path.join(ROOT, 'src/core/lang.js'), 'utf8')), 'src/core/lang.js: the notice\'s list of keys is named notice; it is noticeKeys');
  ok(fs.readFileSync(path.join(ROOT, 'src/ui/shell.js'), 'utf8').indexOf('errCop') < 0, 'src/ui/shell.js: the backup copy reads the error log\'s texts; use backupCopied and backupCopyByHand');
  ok(typeof NL.tables.fr.backupCopied === 'string' && typeof NL.tables.fr.backupCopyByHand === 'string', 'fr.js has no backupCopied or backupCopyByHand');
  ok(typeof NL.t[NL.speech.voiceInfo().noteKey] === 'string', 'voiceInfo() has no noteKey naming a key of NL.t');
```

The guard does not match its own text. `\badd-en\b` is preceded by the `b` of its own `\b`, so the source has
no word boundary before `add`. `v\.note` has a backslash between `v` and `.`.

- [ ] **Step 2: run red.** `node test/smoke.js .` prints these thirteen failures and ends `13 CHECK(S) FAILED`:

```
  FAIL: src/core/fr.js: names the meaning of « Mes mots » after one language; it is wordsMeaning, wordsPhMeaning and add-meaning
  FAIL: src/core/en.js: names the meaning of « Mes mots » after one language; it is wordsMeaning, wordsPhMeaning and add-meaning
  FAIL: src/ui/shell.js: reads the voice report's key under its old name; it is noteKey
  FAIL: src/ui/home.js: reads the voice report's key under its old name; it is noteKey
  FAIL: src/ui/library.js: names the meaning of « Mes mots » after one language; it is wordsMeaning, wordsPhMeaning and add-meaning
  FAIL: test/firstrun.js: reads the voice report's key under its old name; it is noteKey
  FAIL: test/journey.js: names the meaning of « Mes mots » after one language; it is wordsMeaning, wordsPhMeaning and add-meaning
  FAIL: test/lang.js: names the meaning of « Mes mots » after one language; it is wordsMeaning, wordsPhMeaning and add-meaning
  FAIL: src/ui/library.js: the meaning typed into « Mes mots » is held in en; it is meaning
  FAIL: src/core/lang.js: the notice's list of keys is named notice; it is noticeKeys
  FAIL: src/ui/shell.js: the backup copy reads the error log's texts; use backupCopied and backupCopyByHand
  FAIL: fr.js has no backupCopied or backupCopyByHand
  FAIL: voiceInfo() has no noteKey naming a key of NL.t
```

- [ ] **Step 3: implement.**

- `src/core/fr.js`:
  - :201 becomes `  wordsNl: 'Néerlandais', wordsMeaning: 'Français', wordsBe: 'Comme on dit ici',`
  - :207 becomes `  wordsPhMeaning: 'la salle de réunion',`
  - :341 becomes `  /* le rapport de voix : speech.voiceInfo().noteKey rend la clé, l'écran la lit au dessin */`
  - after :352 (`errCopied: 'Copié.', errCopyByHand: …`) add
    `  backupCopied: 'Copié.', backupCopyByHand: 'Sélectionne le texte et copie-le à la main.',`
- `src/core/en.js`:
  - :200 becomes `  wordsNl: 'Dutch', wordsMeaning: 'English', wordsBe: 'As they say here',`
  - :206 becomes `  wordsPhMeaning: 'the meeting room',`
  - :340 becomes `  /* le rapport de voix : speech.voiceInfo().noteKey rend la clé, l'écran la lit au dessin */`
  - after :351 add `  backupCopied: 'Copied.', backupCopyByHand: 'Select the text and copy it by hand.',`
- `src/core/lang.js`, the internal list only:
  ```js
    /* noticeKeys : les clés de NL.t que l'avis dit, dans l'ordre ; vide, il n'y a pas d'avis.
       shown : le tour où l'avis s'est levé est fini, l'avis a donc pu être vu. */
    let applied = null, noticeKeys = [], shown = false, fromSync = false;
  ```
  In `apply`, `notice = bySync ? …` becomes `noticeKeys = bySync ? ['langSynced', 'langNotice'] : ['langNotice'];`.
  At the end:
  ```js
    const text = () => noticeKeys.map(k => NL.t[k]).join(' ');
    const seen = () => { if (shown) noticeKeys = []; };
  ```
  The return keeps `notice: text`.
- `src/core/speech.js:51`: `note: quality === 'be' ? 'voiceNoteBe'` becomes `noteKey: quality === 'be' ? 'voiceNoteBe'`;
  the two lines after it are unchanged.
- `src/ui/home.js:36` and `src/ui/shell.js:150`: `esc(t[v.note])` becomes `esc(t[v.noteKey])`.
- `src/ui/shell.js:330`: `toast(good ? t.errCopied : t.errCopyByHand)` becomes
  `toast(good ? t.backupCopied : t.backupCopyByHand)`.
- `src/ui/library.js`:
  - :47 becomes
    `          '<label>' + NL.t.wordsMeaning + '<input class="textin" id="add-meaning" placeholder="' + NL.t.wordsPhMeaning + '"></label>' +`
  - :89-92 become:
    ```js
            const meaning = (document.getElementById('add-meaning') || {}).value || '';
            const be = (document.getElementById('add-be') || {}).value || '';
            if (!nl.trim() || !meaning.trim()) { NL.ui.toast(NL.t.wordsNeedBoth); return; }
            NL.state.addCustom({ nl: nl.trim(), [NL.lang.current()]: meaning.trim(), be: be.trim() || null, kind: nl.trim().split(/\s+/).length > 2 ? 'phrase' : 'word' });
    ```
  - Before `        NL.content.fauxEn.map(r =>` (:174), add:
    ```js
            /* r.en, et non NL.gloss.of(r) : les faux amis d'un anglophone sont en anglais dans les
               deux affichages (src/content/reference.js). */
    ```
- `test/firstrun.js:27`: `voiceInfo().note]` becomes `voiceInfo().noteKey]`.
- `test/journey.js:202`: `if (id === 'add-en')` becomes `if (id === 'add-meaning')`.
- `test/lang.js:410`: `vals['add-en'] = gl;` becomes `vals['add-meaning'] = gl;`.
- `test/lang.js:591`: `id="add-en"/` becomes `id="add-meaning"/`.

- [ ] **Step 4: run green.**
- `node test/smoke.js .`: `ALL CHECKS PASSED`
- `node test/firstrun.js .`: `FIRST RUN IS CLEAN`
- `node test/screens.js .`: `617 checks, SCREENS OK`
- `node test/journey.js . nl-BE EDG`: `742 checks, NO PROBLEMS`
- `node test/lang.js .`: `21289 contrôles, LANGUE CONFORME`. Ten more than before: check 4 counts the two new
  keys.

- [ ] **Step 5: build and commit.**
1. Run `sh build.sh`, then `node test/smoke.js .`.
2. Commit `src/`, `test/firstrun.js`, `test/journey.js`, `test/lang.js`, `test/smoke.js`, `index.html` and
   `artifact.html`. The subject is `refactor: names say what they hold`, and the body is `Refs #74`.

### Task 5: `NL.lang.apply` takes no flag: `apply()` is silent, `applyAndTell()` raises the notice

**Class:** mechanical
**Ticket:** #74 (item 7)
**Promises:** none

`NL.lang.apply(quiet)` does two jobs, chosen by a flag. When this task is done, there are two functions:
- `apply()` takes no argument and applies the language silently. It returns `true` when the screen's language
  changed. The boot (`src/app.js:9`) and the tests use it.
- `applyAndTell()` applies the language and, if it changed, raises the notice. `render()` in `src/ui/shell.js`
  uses it.

The sync mark keeps its rule. `apply()` consumes it on every call, whether the language changes or not.
`applyAndTell()` reads it before calling `apply()`. The notice raise moves whole into `applyAndTell()`,
including Task 1's tick mark.

Notes: this task comes after Task 1 (#73) because it moves the raise Task 1 wrote, and after Task 4 because
the raise uses `noticeKeys`. Comments are French.

**Files:** (lines at 66ce665; match on content)
- `src/core/lang.js`: the header comment (as Task 1 leaves it), `apply`, a new `applyAndTell` after it, the
  return.
- `src/app.js:9`; `src/ui/shell.js:81`.
- `test/lang.js:327-328`, `test/smoke.js:513`, `test/sync.js:975`.
- `test/smoke.js`: after Task 4's last guard (`… 'voiceInfo() has no noteKey naming a key of NL.t');`).
- `index.html`, `artifact.html`.

**Interfaces:**
- Produces: `NL.lang.apply()`, with no argument (`NL.lang.apply.length === 0`), and `NL.lang.applyAndTell()`.
- Consumes: Task 1's `shown` and tick mark, Task 4's `noticeKeys`.

- [ ] **Step 1: write the guard.** In `test/smoke.js`, after Task 4's
`ok(typeof NL.t[NL.speech.voiceInfo().noteKey] === 'string', …);`, add:

```js
  /* Applying the language and telling it are two calls, not one call and a flag. */
  ok(NL.lang.apply.length === 0 && typeof NL.lang.applyAndTell === 'function', 'NL.lang.apply takes a flag; apply() is silent, applyAndTell() raises the notice');
  sources.concat(suites).forEach(f => ok(!/lang\.apply\((true|false)\)/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')),
    f + ': passes a flag to NL.lang.apply; call apply() or applyAndTell()'));
```

- [ ] **Step 2: run red.** `node test/smoke.js .` prints these six failures and ends `6 CHECK(S) FAILED`:

```
  FAIL: NL.lang.apply takes a flag; apply() is silent, applyAndTell() raises the notice
  FAIL: src/ui/shell.js: passes a flag to NL.lang.apply; call apply() or applyAndTell()
  FAIL: src/app.js: passes a flag to NL.lang.apply; call apply() or applyAndTell()
  FAIL: test/lang.js: passes a flag to NL.lang.apply; call apply() or applyAndTell()
  FAIL: test/smoke.js: passes a flag to NL.lang.apply; call apply() or applyAndTell()
  FAIL: test/sync.js: passes a flag to NL.lang.apply; call apply() or applyAndTell()
```

- [ ] **Step 3: implement.**

- `src/core/lang.js`, the header comment becomes:
  ```js
  /* La langue d'affichage : un seul endroit la décide, un seul endroit l'applique.
     Absente des réglages, c'est l'anglais. `apply` l'applique sans rien dire : le
     démarrage l'appelle. `applyAndTell` l'applique et lève l'avis : le shell l'appelle,
     jamais en pleine séance ni en pleine conversation, au premier écran dessiné ensuite.
     Le bandeau d'avis n'est pas enregistré : il se dit une fois, puis `seen` l'efface,
     jamais dans le tour où il s'est levé. Un changement venu d'un autre appareil le dit
     (`fromAccount`) ; la marque, comme l'avis, n'est pas enregistrée. */
  ```
- `apply` becomes, with `applyAndTell` after it:
  ```js
    /* Rend vrai si la langue de l'écran a changé. La marque de synchro vaut pour
       l'appel suivant, qu'il change la langue ou non. */
    function apply() {
      fromSync = false;
      const l = current();
      if (l === applied) return false;
      Object.keys(NL.t).forEach(k => { delete NL.t[k]; });
      Object.assign(NL.t, NL.tables[l]);
      NL.gloss.use(l);
      NL.content.refresh();
      document.documentElement.setAttribute('lang', NL.gloss.tag(l));
      applied = l;
      return true;
    }

    function applyAndTell() {
      const bySync = fromSync;
      if (!apply()) return;
      noticeKeys = bySync ? ['langSynced', 'langNotice'] : ['langNotice'];
      /* render() dessine l'avis dans le tour où il se lève. Un avis dessiné puis
         remplacé dans ce même tour n'a pas été vu : seen() ne l'efface qu'au tour d'après. */
      shown = false;
      setTimeout(() => { shown = true; }, 0);
    }
  ```
  The six lines from `Object.keys(NL.t)` to `applied = l;` are today's, unchanged.
- The return becomes `return { current, apply, applyAndTell, set, fromAccount, notice: text, seen };`
- `src/app.js:9`: `NL.lang.apply(true);` becomes `NL.lang.apply();`.
- `src/ui/shell.js:81`: `if (!LANG_WAITS[route]) NL.lang.apply(false);` becomes
  `if (!LANG_WAITS[route]) NL.lang.applyAndTell();`.
- `test/lang.js:327-328`, `test/smoke.js:513` and `test/sync.js:975`: `lang.apply(true)` becomes `lang.apply()`.

- [ ] **Step 4: run green.**
- `node test/smoke.js .`: `ALL CHECKS PASSED`
- `node test/sync.js .`: `233 checks, SYNC OK`. Task 1's checks and the 69.3 block pass.
- `node test/lang.js .`: `21289 contrôles, LANGUE CONFORME`
- `node test/screens.js .`: `617 checks, SCREENS OK`
- `node test/journey.js . nl-BE EDG`: `742 checks, NO PROBLEMS`
- `node test/firstrun.js .`: `FIRST RUN IS CLEAN`

- [ ] **Step 5: build and commit.**
1. Run `sh build.sh`, then `node test/smoke.js .`.
2. Commit `src/`, `test/lang.js`, `test/smoke.js`, `test/sync.js`, `index.html` and `artifact.html`. The subject
   is `refactor(lang): apply() is silent, applyAndTell() raises the notice`, and the body is `Refs #74`.

### Task 6: One copy of the course as written and one tree walker, in `test/lib`

**Class:** mechanical
**Ticket:** #74 (items 9 and 10)
**Promises:** none

Two suites copy the course before its first build, each by hand: `test/content.js:20-21` and
`test/tools/check-files.js:22-23`. Twelve hand-written functions walk a tree:
- `test/lang.js`: `pairUp`'s `walk` (:16), `marked`'s `walk` (:181) and `leaf` (:192), `dutchWords`'s `walk`
  (:217), `markLeaves` (:336), `markedBoth`'s `walk` (:350), `langAttrFind`'s `walk` (:539), `gl` (:552) and
  `glWalk` (:557), `frOnly` (:636) and 69.1's `walk` (:674);
- `test/content.js`: `walk6` (:195), whose `pairs6` is read twice (:206 and :248).

When this task is done:
- `raw(content)` in `test/lib/prose.js` takes the copy.
- `test/lib/tree.js` holds the walker in two forms. `visit(v, fn, key, where)` calls `fn(node, key, path)` on
  every node. `rewrite(v, fn, key, where)` replaces every leaf with `fn(leaf, key, path)`.
- Every site above uses one of them, and `walk6` and `pairs6` are gone.
- `owed()` keeps its own walk. It stops at a pair and skips `fr` and `en`, which `visit` cannot do. The commit
  body says so.

Nothing under `src/` changes, so this task needs no build.

Notes:
- `test/lang.js` calls the module `tree`, not `{ visit }`: `views(B, visit)` has a parameter named `visit`.
- An array's elements keep the array's key, as `pairUp`'s walker did, and a path is written as `owed()` writes
  it (`units[3].words[0].fr`), so `at()` reads it back.
- `markLeaves`' array paths become `[i]` instead of `.i`. No check reads them: they only have to be unique.
- `markLeaves`' `keep` now spares a leaf named `id` or `nl`, where it spared the whole value under that key. The
  two differ only if an `id` or `nl` holds an object, and none in the tables does: the output was the same on
  the scratch copy.
- The guard is a heuristic. It flags a function that a suite calls on a child (`v[k]`) and also on an array's
  element (`x`, or through `forEach`).
- `test/lib/tree.js` may be written LF.
- Comments are French in the suites and in `test/lib`, English in `test/smoke.js`.

**Files:** (lines at 66ce665; match on content)
- Create: `test/lib/tree.js`.
- Modify: `test/lib/prose.js`: after `has` (:7) add `raw`; the export :34.
- Modify: `test/content.js`: the import :10, the copy :20-21, `walk6` and its first reader :193-210, and its second
  reader :248-253.
- Modify: `test/tools/check-files.js`: the import :14, the copy :22-23.
- Modify: `test/lang.js` at :6 (import), and at :14-27, :177-206, :214-226, :336-345, :347-355, :537-562,
  :636-639 and :674-678.
- Modify: `test/smoke.js`: after Task 5's guard.
- Modify: `TESTING.md:14`, the `smoke.js` row.

**Interfaces:**
- Produces:
  - `test/lib/tree.js` exports `{ visit, rewrite }`.
  - `test/lib/prose.js` exports `raw` beside `PROSE`, `COLLECTIONS`, `has`, `owed` and `at`. `raw(content)`
    returns `{ [collection]: deep copy }` for each of `COLLECTIONS`.
- Consumes: `COLLECTIONS` and `PROSE` from `test/lib/prose.js`; `suites` in `test/smoke.js`.

- [ ] **Step 1: write the guard.** In `test/smoke.js`, after Task 5's
`f + ': passes a flag to NL.lang.apply; call apply() or applyAndTell()'));`, add:

```js
  /* #74. The course as it is written is copied by raw() in test/lib/prose.js, and a tree is
     walked by test/lib/tree.js. A function a suite calls on a child (v[k]) and on an array's
     element, x or through forEach, is a walker written by hand. */
  suites.forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    ok(!/JSON\.parse\(JSON\.stringify\(NL\.content/.test(src), f + ': copies the course by hand; use raw() from test/lib/prose.js');
    src.split('\n').forEach((line, i) => (line.match(/\b\w+(?=\((?:\w+, )?v\[k\])/g) || [])
      .filter(name => new RegExp('\\.forEach\\(' + name + '\\)|\\b' + name + '\\((?:\\w+, )?x\\b').test(src))
      .forEach(name => ok(false, f + ':' + (i + 1) + ': ' + name + '() walks a tree by hand; use test/lib/tree.js')));
  });
```

`suites` holds `test/*.js` and `test/tools/*.js`, never `test/lib`, which is where both now live.

- [ ] **Step 2: run red.** `node test/smoke.js .` prints these fourteen failures and ends `14 CHECK(S) FAILED`:

```
  FAIL: test/content.js: copies the course by hand; use raw() from test/lib/prose.js
  FAIL: test/content.js:199: walk6() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:20: walk() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:183: walk() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:197: leaf() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:220: walk() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:341: markLeaves() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:352: walk() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:542: walk() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:555: gl() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:559: glWalk() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:638: frOnly() walks a tree by hand; use test/lib/tree.js
  FAIL: test/lang.js:676: walk() walks a tree by hand; use test/lib/tree.js
  FAIL: test/tools/check-files.js: copies the course by hand; use raw() from test/lib/prose.js
```

Line numbers are those of the file as Task 5 leaves it.

- [ ] **Step 3: implement.**

Create `test/lib/tree.js`:

```js
/* Le parcours d'un arbre : le cours, ou une table de l'interface. Écrit une fois, pour
   toutes les suites. Un élément de tableau garde la clé de son tableau, et un chemin
   s'écrit comme ceux d'owed() (units[3].words[0].fr) : at() le relit. owed() garde son
   propre parcours : il s'arrête à une paire et saute fr et en, ce que visit ne sait pas faire. */

/* Chaque nœud, avant ses enfants : fn(nœud, clé, chemin). fn peut changer le nœud. */
function visit(v, fn, key, where) {
  fn(v, key, where);
  if (Array.isArray(v)) v.forEach((x, i) => visit(x, fn, key, where + '[' + i + ']'));
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => visit(v[k], fn, k, where + '.' + k));
}

/* Chaque feuille (ni tableau ni objet : une chaîne, une fonction…) remplacée par
   fn(feuille, clé, chemin). Un objet est changé en place, un tableau refait : on garde
   ce que rewrite rend. */
function rewrite(v, fn, key, where) {
  if (Array.isArray(v)) return v.map((x, i) => rewrite(x, fn, key, where + '[' + i + ']'));
  if (v && typeof v === 'object') { Object.keys(v).forEach(k => { v[k] = rewrite(v[k], fn, k, where + '.' + k); }); return v; }
  return fn(v, key, where);
}

module.exports = { visit, rewrite };
```

In `test/lib/prose.js`, after `has` (:7) and a blank line, add:

```js
/* Le cours tel qu'il est écrit : une copie des collections, prise avant la première
   construction (avant NL.state.open()), quand {naam}, {stad} et {bedrijf} y sont encore. */
const raw = content => {
  const out = {};
  COLLECTIONS.forEach(k => { out[k] = JSON.parse(JSON.stringify(content[k] || [])); });
  return out;
};
```

The export (:34) becomes `module.exports = { PROSE, COLLECTIONS, has, raw, owed, at };`. `owed` is unchanged.

`test/tools/check-files.js`:
- :14 becomes `const { COLLECTIONS, raw, owed, at } = require('../lib/prose');`
- :22-23 (`const RAW = {};` and the `COLLECTIONS.forEach(…)` line) become `const RAW = raw(NL.content);`. The
  comment above stays.

`test/content.js`:
- :10 becomes two lines:
  ```js
  const { COLLECTIONS, raw, owed, at } = require('./lib/prose');
  const tree = require('./lib/tree');
  ```
- :20-21 become `const RAW = raw(NL.content);`. The comment above (:18-19) stays.
- The comment and `pairs6`/`walk6` (:193-201) go, and the first reader (:206-211) becomes the walk itself:
  ```js
    /* Parcours de RAW : tout objet qui porte un `en` porte un `fr`, et les mêmes chiffres et {jetons}. */
    let lonely = 0, drift = 0;
    const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).sort().join('|');
    ok(sig('{naam} arrive à 3 h') === sig('Arrives at 3, {naam}'), 'sig : un jeton et un chiffre dans un autre ordre ne sont pas une dérive');
    ok(sig('3 h') !== sig('4 h'), 'sig : un chiffre qui change reste une dérive');
    COLLECTIONS.forEach(k => tree.visit(RAW[k], (v, key, where) => {
      if (!v || typeof v !== 'object') return;
      if (typeof v.en === 'string' && typeof v.fr !== 'string') { lonely++; ok(false, 'un `en` sans `fr` : ' + where); }
      if (typeof v.en === 'string' && typeof v.fr === 'string' && sig(v.fr) !== sig(v.en)) {
        drift++; ok(false, 'les chiffres ou les {jetons} diffèrent entre fr et en : ' + where + '  « ' + v.fr + ' » / « ' + v.en + ' »');
      }
    }, k, k));
  ```
  The three lines from `let lonely` to the second `sig` check are today's, unchanged. The two `if`s are
  today's.
- The second reader (:248-253) becomes:
  ```js
    COLLECTIONS.forEach(k => tree.visit(RAW[k], (v, key, where) => {
      if (!v || typeof v.nl !== 'string' || typeof v.fr !== 'string' || typeof v.en !== 'string' || !hasU(v.nl)) return;
      if (!/\((formal|informal)/.test(v.en)) return;
      const t = uTag(v.fr);
      ok(v.en.indexOf(t) >= 0, where + ' « ' + v.nl + ' » : « ' + v.en + ' » doit porter « ' + t + ' »');
    }, k, k));
  ```
  `pairs6` held only objects that carry `fr` or `en`, and this test needs all three of `nl`, `fr` and `en`, so
  every node is safe to test once `!v` is ruled out.

`test/lang.js`:
- After `const { PROSE, COLLECTIONS } = require('./lib/prose');` (:6), add `const tree = require('./lib/tree');`.
- `pairUp` (:14-27) becomes:
  ```js
  function pairUp(C) {
    let n = 0;
    COLLECTIONS.forEach(k => {
      C[k] = tree.rewrite(C[k], (s, key) => typeof s === 'string' && PROSE.indexOf(key) >= 0 ? { fr: s, en: 'EN' + (n++) } : s, k);
      tree.visit(C[k], v => { if (v && typeof v === 'object' && typeof v.fr === 'string' && v.en === undefined) v.en = 'EN' + (n++); });
    });
    return n;
  }
  ```
  On the shipped course and on one stripped of its English, it pairs the same number of texts as the old walk
  (1408 each on the scratch copy).
- In `marked` (:177-206), the `walk` and its call (:181-187) become:
  ```js
    COLLECTIONS.forEach(k => {
      NL.content[k] = tree.rewrite(NL.content[k], (s, key) => typeof s === 'string' && (key === 'fr' || key === 'en' || PROSE.indexOf(key) >= 0) ? mk() : s, k);
    });
  ```
  `leaf` (:192-201), a copy of `markLeaves`, goes. Its two callers call `markLeaves`:
  ```js
    const T = NL.t;
    Object.keys(T).forEach(k => { T[k] = markLeaves(T[k], k, k === 'nav'); });
    if (NL.tables) Object.keys(NL.tables).forEach(l => {
      const tb = NL.tables[l];
      if (tb !== T) Object.keys(tb).forEach(k => { tb[k] = markLeaves(tb[k], l + '.' + k, k === 'nav'); });
    });
  ```
- In `dutchWords` (:214-226), the `walk` and its call (:217-223) become:
  ```js
    tree.visit(NL.content, (v, key) => { if (DUTCH_KEYS.indexOf(key) >= 0 && typeof v === 'string') add(v); });
  ```
- `markLeaves` (:336-345) becomes:
  ```js
  function markLeaves(v, p, keep) {
    return tree.rewrite(v, (x, key, where) => {
      if (keep && (key === 'id' || key === 'nl')) return x;
      if (typeof x === 'string') return '⟦' + where + '⟧';
      return typeof x === 'function' ? () => '⟦' + where + '⟧' : x;
    }, '', p);
  }
  ```
  Its comment (:335) stays.
- In `markedBoth` (:347-355), the `walk` and its call (:350-355) become:
  ```js
    COLLECTIONS.forEach(k => { NL.content[k] = tree.rewrite(NL.content[k], (s, key) => typeof s === 'string' && key === 'fr' ? '⟪' + (n++) + '⟫' : s, k); });
  ```
- In `langAttrFind` (:537-562):
  - The `walk` and its call (:539-545) become:
    ```js
      tree.visit(NL.content, (v, key) => { if ((key === 'nl' || key === 'be') && typeof v === 'string') dutch.add(U.norm(v)); });
    ```
  - After `const gloss = { fr: new Set(), en: new Set() };`, `gl`, `glWalk` and their two calls (:552-562)
    become:
    ```js
      tree.visit(NL.content, (v, key) => { if ((key === 'fr' || key === 'en') && typeof v === 'string') gloss[key].add(U.norm(v)); });
      ['fr', 'en'].forEach(l => tree.visit(NL.tables[l], v => { if (typeof v === 'string') gloss[l].add(U.norm(v)); }));
    ```
- `frOnly` (:636-639) becomes one line:
  ```js
      const frOnly = v => tree.visit(v, x => { if (x && typeof x === 'object' && typeof x.fr === 'string') delete x.en; });
  ```
- 69.1's `walk` and its call (:674-678) become:
  ```js
      [brood, phrase, rule].forEach(x => tree.visit(x, v => { if (v && typeof v === 'object' && typeof v.fr === 'string') french.add(flat(v.fr)); }));
  ```

`TESTING.md:14`, the `smoke.js` row: after « une échéance tirée d'une date écrite en dur (`test/lib/seed.js`) »
and before the closing ` |`, add: `, une copie du cours tel qu'il est écrit (`raw()`, `test/lib/prose.js`), un arbre parcouru à la main (`test/lib/tree.js`)`

- [ ] **Step 4: run green.**
- `node test/smoke.js .`: `ALL CHECKS PASSED`
- `node test/content.js .`: `262 contrôles, CONTENU CONFORME`, the count it had before
- `node test/tools/check-files.js .`: exit code 0
- `node test/lang.js .`: `21289 contrôles, LANGUE CONFORME`, the count it had before

- [ ] **Step 5: commit.** No build: nothing under `src/` changed (`git status --short src` prints nothing).
Commit `test/lib/tree.js`, `test/lib/prose.js`, `test/content.js`, `test/tools/check-files.js`,
`test/lang.js`, `test/smoke.js` and `TESTING.md`. The subject is
`refactor(test): one copy of the course as written and one tree walker, in test/lib`. The body is:

```
owed() keeps its own walk: it stops at a pair and skips fr and en, which visit cannot do.

Refs #74
```

### Blocking edges

- 4 ← 1: both change `lang.js`'s notice state. Task 4 renames the list that Task 1 puts `shown` beside.
- 5 ← 1 and 5 ← 4: Task 5 moves the raise that Task 1 wrote and Task 4 renamed. #73 comes before #74's `apply`
  split.
- 3 ← 2, 4 ← 3, 5 ← 4 and 6 ← 5: each guard in `test/smoke.js` goes after the previous task's.
- 4 ← 2: both change `src/ui/library.js` and `src/ui/shell.js`.
- Task 3 is `engine` and runs alone. The run takes the tasks in order, 1 to 6.

## After the run

1. The run controller dispatches the closing review (`closing-review.md`).
2. The maintainer runs `/code-review main` on the branch.
3. The pull request's body says `Closes #73`, `Closes #74` and `Refs #12`. The maintainer merges
   `phase-2-cleanup` into `main`, which deploys.
4. #71 items 1, 3a and 4 wait for the phase 3 design sitting. They are not part of this plan.

## Decisions taken while writing this plan

For the maintainer's review. None changes the spec.

Task 1 (#73):
- **The fix is a tick mark.** `apply()` sets `shown = false` and schedules `shown = true` with
  `setTimeout(…, 0)`. `seen()` clears the notice only once `shown` is true, so a notice drawn and replaced in
  the tick it rose in stays for the next screen.
- **Rejected alternatives.** Making `onAuth()` skip `seen()`, or making the adoption wait for `verify()`, would
  each fix one path. The ticket's third acceptance line asks for the rule on ticks.
- **The test lives in `test/sync.js`.** That is where the devices and the fake Supabase are. It drives a whole
  page, `app.js` included, because `app.js` redraws compte when the session arrives.
- **How the other tab signs in.** It is the fake client's `auth.verifyOtp(…)`, now kept on `device.client` by
  `test/lib/supabase.js`.
- **69.3 now waits a tick** (`await wait(1)`) before its « still there » check, and gains the same-tick check
  that the acceptance asks for.
- **Task 1 is `mechanical`.** It changes `lang.js`, which holds nothing stored and is not `sync.js`.

Task 2 (#74, items 1, 2, 4 and 5):
- The doctor's helper is `tierText`, not the ticket's `tier`. `render()` has `const tier` (`doctor.js:41`).
- `ifText` sits after `unitLabel` and is exported with it.

Task 3 (#74, item 3):
- It is `engine` and has its own task, because it touches `clearAll` and the restore.
- Its red is one count, which stays red until both sites call `withDeviceLang`. The behaviour is guarded by the
  existing 5d and 5d bis in `test/lang.js`.

Task 4 (#74, items 6 and 8):
- A guard on the variable `en` in `library.js` was added, beyond the ticket's list, so the rename has a red.
- Item 8 and the voice comment in `fr.js`/`en.js` are comments, with no red.

Task 6 (#74, items 9 and 10):
- **How `tree.visit` walks.** It passes an array's key to its elements and calls `fn` on the root.
- **It reaches what the old walkers reached.** On the scratch copy, the six sets `langAttrFind` and
  `dutchWords` build were identical before and after, on the course loaded as is and paired:
  - `dutchWords`: 1204 words;
  - `nl`/`be`: 1111;
  - `fr`: 1344;
  - `en`: 1353;
  - the French table: 353;
  - the English table: 352.
- **`markLeaves` gives the same output** up to the path notation: `[i]` where it wrote `.i`.
- **`owed()` stays as it is**, as the ticket allows. The commit says why.

Corrections to the tickets, found while drafting:
- #73: the six-digit code path is green on the old code, as the ticket's own table says. The reds are the other
  tab and the same-tick check.
- #74 item 6: `test/firstrun.js:27` also reads `voiceInfo().note`.
- #74 item 10 lists six sites in `test/lang.js` and `walk6` in `test/content.js`. Five more walkers exist:
  - `leaf` in `marked()` (:192), a copy of `markLeaves`;
  - `markLeaves` (:336);
  - `gl` and `glWalk` (:552, :557);
  - `frOnly` (:636);
  - plus a second reader of `pairs6` (`test/content.js:248`), which the ticket does not mention.
- #74 item 9: the snapshot check the ticket places at `test/content.js:171` is at `:170` at 66ce665.
