# Moteur, écrans et garde-fous — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make new vocabulary appear every day, replace the mastery numbers with honest counts, surface the mistakes the app already records, and lock the content quality in CI.

**Architecture:** Sub-day repeats stop being stored due dates and become re-queues inside the running session, so the daily budget only ever counts real next-day-or-later reviews. A single `NL.srs.compose()` becomes the one place that decides a session's contents, and it reserves a share of every session for unseen words. The unused `tier` system is populated by rule at content-load time. The placement test is deleted. Four content guards join the existing suite.

**Tech Stack:** Plain ES5-ish browser JavaScript hanging off the `NL.*` namespace, concatenated by `build.sh` — no bundler, no runtime dependencies. Tests are Node scripts driving the app inside a `vm` context with a stubbed browser. Supabase (auth + sync) behind a fake client in tests.

**Spec:** `docs/superpowers/specs/2026-10-08-moteur-et-contenu-design.md`

## Global Constraints

- **No runtime dependencies and no bundler.** Every source file is a plain script that hangs off `NL.*`; the only thing that matters is the order in `SRC` in `build.sh`. A new source file must be added to that list.
- **After any change under `src/`, run `sh build.sh` and commit the regenerated `index.html` and `artifact.html`** — they are tracked build outputs.
- **All user-facing text lives in `src/core/fr.js`.** `test/smoke.js` fails the build if an English interface string survives. Never inline French in a screen.
- **Match the surrounding style.** `const`/arrow functions are used throughout; optional chaining (`?.`), nullish coalescing (`??`) and `Array.includes` on hot paths are not. Comments are French in `src/core` and `src/content`, mixed in `src/ui` — follow the file you are in.
- **Storage keys keep their spelling.** `DB = 'vlaams-onderweg'`, `LS = 'vlaams/fallback'`, `QKEY = 'vlaams/outbox'`, `OWNER = 'vlaams/owner'`. Renaming one orphans every database and every backup file already written.
- **`sh test/run-all.sh` is the single test list**, and it is exactly what CI runs. A new test file must be added to it.
- **Every fix leaves a test that fails on the old code.** Verify the failure before writing the implementation.
- **No personal data in tracked files.** Content personalisation only through `{naam}`, `{stad}`, `{bedrijf}`.
- **Target browsers include iOS Safari and Edge**; `test/journey.js` runs 8 configurations and must stay green.

## Review Focus

Five conditions the spec implies that no task's happy path exercises. Each one has its test added to the task that owns the code.

1. **A signed-in device whose server rows still hold the old progress.** Clearing the device must not be undone by the next `pull()`, which reinstalls any record missing locally (`src/core/sync.js:181`). → Task 1.
2. **A day with no unseen items left** (content exhausted). The reserved new-word share must collapse to zero and let reviews fill the session, not produce an empty session or a negative slice. → Task 3.
3. **An item at the top of a short tier** (`recognise` caps at rung 2). With a day-based `STEP`, its interval must keep growing and let it retire, not pin it to a daily return forever. → Task 4.
4. **A unit with fewer items than the gate's rounding, and the last unit.** The 75 %-met gate must not divide by zero, and "opens in N words" must not be shown for a unit with nothing after it. → Task 5.
5. **A review log holding entries for items that no longer exist** (deleted custom words, ids changed by a content edit). The mistakes screen must skip them rather than throw. → Task 8.

---

## File Structure

**Modified**

- `src/core/srs.js` — gains `compose()` as the single session composer, loses the sub-day `STEP` entries.
- `src/core/state.js` — gains `clearProgress()`; `migrate()` bumps to `dataVersion: 3`.
- `src/core/sync.js` — gains `wipeProgress()`, called from `doAdopt()` before `pull()`.
- `src/content/index.js` — assigns `it.tier` by rule; `GATE` and `unitComplete` move to met-based 75 %.
- `src/ui/session.js` — uses `compose()`, re-queues new items inside the session, loses `stagePips`.
- `src/ui/home.js` — counts instead of percentages, first-run card without the placement test, mistakes tile.
- `src/ui/library.js` — the "fragiles" filter keys off real lapses.
- `src/core/fr.js` — strings added and removed.
- `build.sh` — `SRC` loses `src/ui/placement.js`, gains `src/ui/misses.js`.
- `test/pace.js` — the clock advances **within** a simulated day.
- `test/sync.js` — the fake Supabase learns `delete()`.
- `test/smoke.js`, `test/sim.js`, `test/firstrun.js`, `test/journey.js` — placement references removed.
- `test/run-all.sh`, `.github/workflows/test.yml`.

**Created**

- `src/ui/misses.js` — the mistakes screen. One responsibility: turn the review log into a ranked list of items worth redoing.
- `test/content.js` — the four content guards (spelling, buildability, forward borrowing, duplicates) in one file, because they all walk the same content and share its loader.
- `test/data/nl-words.txt.gz` — Dutch word forms for the spelling guard.
- `test/tools/build-wordlist.js` — regenerates the above.
- `test/tools/tier-report.js` — prints what the tier rules did, for review.

**Deleted**

- `src/ui/placement.js`.

---

## Task 1: A reset the server cannot undo

The account holds ~430 records seeded at rung 3. `pull()` reinstalls any record that is missing locally, so clearing the device alone recreates the saturated deck on the next load. This is the spec's first risk and it blocks everything else.

**Files:**
- Modify: `test/sync.js:46-49` (fake query builder), and a new test block before `process.exit`
- Modify: `src/core/state.js:28-34` (`migrate`), `:93-99` (`clearAll`), `:198` (exports)
- Modify: `src/core/sync.js:117-128` (`doAdopt`), `:322` (exports)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `NL.state.clearProgress() -> Promise<void>` (clears `srs` and `log`, keeps `meta` and `custom`); `NL.sync.wipeProgress() -> Promise<void>`; meta flag `wipeServer: boolean`.

- [ ] **Step 1: Teach the fake Supabase to delete**

In `test/sync.js`, inside `query(table)`, add `del` to the builder state and two methods. Replace:

```js
        const q = { filters: [], from: 0, to: Infinity };
```

with:

```js
        const q = { filters: [], from: 0, to: Infinity, del: false };
```

In `run()`, after the RLS check and the filter loop, handle deletion. Replace:

```js
          let rows = rowsFor(table, uid());
          q.filters.forEach(f => { rows = rows.filter(f); });
          return Promise.resolve({ data: clone(rows.slice(q.from, q.to + 1)), error: null });
```

with:

```js
          let rows = rowsFor(table, uid());
          q.filters.forEach(f => { rows = rows.filter(f); });
          if (q.del) {
            rows.forEach(r => server.tables[table].delete(keyOf(table, r)));
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: clone(rows.slice(q.from, q.to + 1)), error: null });
```

And add the two builder methods next to `gte`:

```js
          delete() { q.del = true; return b; },
          not(col, op, v) {
            if (op === 'is' && v === null) q.filters.push(r => r[col] !== null && r[col] !== undefined);
            return b;
          },
```

- [ ] **Step 2: Write the failing test**

Append this block to `test/sync.js`, immediately before the final `console.log` and `process.exit(fails ? 1 : 0)`:

```js
  console.log('\nREMISE À ZÉRO — le serveur ne doit pas la défaire');
  {
    const R = device('R', true);
    await R.boot();
    const its = items(R.NL);
    its.slice(0, 20).forEach(it => R.NL.srs.grade(it, true, { ex: 'type' }));
    R.NL.state.setMeta({ xp: 500 });
    const word = R.NL.state.addCustom({ nl: 'de goesting', fr: 'l’envie' });
    await R.signIn('reset@example.com');
    const ruid = R.NL.sync.user.id;
    ok(rowsFor('srs_records', ruid).length === 20, 'setup: 20 rows expected on the server');

    await R.NL.sync.wipeProgress();
    await wait(5);
    ok(R.NL.state.seenCount() === 0, 'local progress survived the wipe: ' + R.NL.state.seenCount());
    ok(rowsFor('srs_records', ruid).length === 0,
      'server still holds ' + rowsFor('srs_records', ruid).length + ' record(s)');
    ok(rowsFor('review_log', ruid).length === 0, 'server still holds review log rows');
    ok(R.NL.state.meta().xp === 500, 'the wipe must not touch settings or XP');
    ok(R.NL.state.customs().length === 1, 'the wipe must keep "Mes mots"');

    /* Review Focus 1: a fresh device on the same account must not resurrect it. */
    const R2 = device('R2', true);
    await R2.boot();
    await R2.signIn('reset@example.com');
    ok(R2.NL.state.seenCount() === 0,
      'a second device pulled back ' + R2.NL.state.seenCount() + ' deleted record(s)');
    ok(R2.NL.state.customs().length === 1, 'the second device should still get "Mes mots"');
    console.log('  effacée des deux côtés, réglages et mots personnels intacts');
  }
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node test/sync.js "$(pwd)"`
Expected: FAIL — `R.NL.sync.wipeProgress is not a function` (the run crashes with `CRASH TypeError`).

- [ ] **Step 4: Add `clearProgress` to the state layer**

In `src/core/state.js`, add after `clearAll` (line 99):

```js
  /* Efface la PROGRESSION seulement : les fiches et le journal. Les réglages,
     l'XP et les mots personnels restent — on repart de zéro dans le cours, pas
     dans l'application. */
  function clearProgress() {
    mem.srs.clear(); mem.log = [];
    if (!useIDB) { saveLS(); return Promise.resolve(); }
    return Promise.all(['srs', 'log'].map(s => new Promise(res => {
      const r = db.transaction(s, 'readwrite').objectStore(s).clear(); r.onsuccess = res; r.onerror = res;
    })));
  }
```

Add `clearProgress` to the returned object on line 198, after `clearAll`.

- [ ] **Step 5: Add `wipeProgress` to the sync layer**

In `src/core/sync.js`, add before the `/* ---------------- tirer ---------------- */` banner:

```js
  /* Repartir de zéro pour de vrai. `pull()` réinstalle toute fiche absente en
     local, donc vider l'appareil ne suffit pas : les lignes du serveur doivent
     disparaître d'abord, sinon le prochain chargement les rapporte. */
  async function wipeProgress() {
    box.recs = {}; box.logs = []; persist();
    if (enabled && user) {
      const del = async table => {
        const { error } = await client.from(table).delete().not('user_id', 'is', null);
        if (error) throw new Error(error.message);
      };
      await del('srs_records');
      await del('review_log');
    }
    await NL.state.clearProgress();
    NL.state.setMeta({ wipeServer: false });
  }
```

Add `wipeProgress` to the exports on line 322.

- [ ] **Step 6: Run the test to verify it passes**

Run: `node test/sync.js "$(pwd)"`
Expected: PASS — the new block prints `effacée des deux côtés, réglages et mots personnels intacts`.

- [ ] **Step 7: Make the one-time migration use it**

In `src/core/state.js`, replace `migrate` (lines 28-34) with:

```js
  /* Deux remises à zéro, une par version.
     v2 : la progression fabriquée par l'ancien test de placement.
     v3 : le paquet saturé par ce même test, maintenant supprimé. On repart de
     zéro, et `wipeServer` demande à la synchro d'effacer aussi le serveur au
     prochain rattachement — sans quoi `pull()` rapporterait tout. */
  function migrate() {
    const from = meta.dataVersion || 1;
    if (from >= 3) return false;
    mem.srs.clear(); mem.log = [];
    if (useIDB) {
      ['srs', 'log'].forEach(s => {
        try { db.transaction(s, 'readwrite').objectStore(s).clear(); } catch (e) {}
      });
    }
    setMeta({ dataVersion: 3, placed: false, exDay: null, exToday: 0, reached: 0, wipeServer: true });
    return true;
  }
```

Add `wipeServer: false` to `defaults()` on line 21, after `reached: 0`:

```js
    reached: 0,                // index of the furthest unit ever opened; never goes back
    wipeServer: false          // v3 : la synchro doit effacer le serveur une fois
```

- [ ] **Step 8: Honour the flag during adoption, before pulling**

In `src/core/sync.js`, in `doAdopt`, insert the wipe between `setOwner` and `pull`. Replace:

```js
    setOwner(user.id);
    await pull();
    await flush();
```

with:

```js
    setOwner(user.id);
    /* L'ordre compte : effacer APRÈS un pull ne servirait à rien, puisque le
       pull aurait déjà réinstallé ce qu'on veut supprimer. */
    if (NL.state.meta().wipeServer) await wipeProgress();
    await pull();
    await flush();
```

- [ ] **Step 9: Write the migration test**

Append to the same block in `test/sync.js`, before its closing `}`:

```js
    /* La migration v3 : un appareil qui portait l'ancienne progression la perd,
       et le serveur avec, au rattachement suivant. */
    const OLD = device('OLD', true);
    await OLD.boot();
    items(OLD.NL).slice(0, 15).forEach(it => OLD.NL.srs.grade(it, true, { ex: 'type' }));
    await OLD.signIn('migrate@example.com');
    const ouid = OLD.NL.sync.user.id;
    ok(rowsFor('srs_records', ouid).length === 15, 'setup: 15 rows for the migration case');

    const MIG = device('MIG', true, JSON.parse(JSON.stringify(OLD.store)));
    await MIG.boot();
    MIG.NL.state.setMeta({ dataVersion: 2 });
    ok(MIG.NL.state.migrate() === true, 'migrate() should report it ran');
    await MIG.signIn('migrate@example.com');
    await wait(5);
    ok(rowsFor('srs_records', ouid).length === 0,
      'migration left ' + rowsFor('srs_records', ouid).length + ' row(s) on the server');
    ok(MIG.NL.state.seenCount() === 0, 'migration left local records behind');
    console.log('  migration v3 : paquet effacé localement et sur le serveur');
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `node test/sync.js "$(pwd)"`
Expected: PASS, both new lines printed.

- [ ] **Step 11: Run the whole suite and build**

Run: `sh test/run-all.sh`
Expected: `TOUTE LA SUITE EST PASSÉE`

- [ ] **Step 12: Commit**

```bash
sh build.sh
git add src/core/state.js src/core/sync.js test/sync.js index.html artifact.html
git commit -m "fix: a reset the server cannot undo

pull() reinstalls any record missing locally, so clearing the device recreated
the deck the placement test had saturated. The server rows go first now, and the
v3 migration asks for that wipe at the next adoption. Settings, XP and Mes mots
survive. The fake Supabase learned delete() so the test could exist.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: New vocabulary every day

`r.interval = STEP[r.stage]` makes the first two rungs due again in 2 and 12 minutes. Those are stored due dates, so they compete for the daily budget all day, and after day one they own every slot. `test/pace.js` cannot see this because it freezes the clock inside a simulated day — so the clock fix and the engine fix land together, with the assertion written first.

**Files:**
- Modify: `test/pace.js:85-118` (the day loop)
- Modify: `src/core/srs.js:74` (`STEP`), `:126-138` (`grade`)
- Modify: `src/ui/session.js:122-156` (`check`)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `NL.srs.STEP` with day-based values only; `NL.srs.SOON_RUNG = 2` (the rung below which an item is also re-queued inside the session).

- [ ] **Step 1: Make the simulated clock advance within a day, and assert new words keep coming**

In `test/pace.js`, replace the day-loop header (lines 85-90):

```js
  for (let day = 1; day <= DAYS; day++) {
    NOW = Date.parse('2026-01-05T08:00:00Z') + (day - 1) * 86400000;
    NL.state.touchDay();
    maxBacklog = Math.max(maxBacklog, NL.srs.dueItems().length);

    let dayTasks = 0, daySecs = 0, guard = 0;
```

with:

```js
  const DAY0 = Date.parse('2026-01-05T08:00:00Z');
  for (let day = 1; day <= DAYS; day++) {
    NOW = DAY0 + (day - 1) * 86400000;
    NL.state.touchDay();
    maxBacklog = Math.max(maxBacklog, NL.srs.dueItems().length);

    let dayTasks = 0, daySecs = 0, guard = 0;
    const freshSeenToday = new Set();
```

Inside the exercise loop, record first encounters. After the existing `seenOnDay` block, add:

```js
        c.items.forEach(it => { if (wasAt < 0) freshSeenToday.add(it.id); });
```

Make the clock move. Replace the line that spends the exercise:

```js
        NL.srs.spend(1);
```

with:

```js
        NL.srs.spend(1);
        /* L'horloge AVANCE dans la journée. Figée, une révision à douze minutes
           n'échoit jamais avant le lendemain : c'est exactement ce qui rendait
           la panne de vocabulaire neuf invisible pendant 200 jours simulés. */
        NOW += (SECS[c.ex] || 15) * 1000;
```

Show the new count in the table, so a dry day is visible and not only asserted. Replace lines 130-134:

```js
  console.log('  jour   exercices   minutes   rencontrés   maîtrisés');
  [1, 7, 30, 90, 180, 300, DAYS].filter(d => d <= DAYS).forEach(d => {
    const r = perDay[d - 1];
    console.log('  ' + String(r.day).padStart(4) + String(r.tasks).padStart(12) +
      String(r.mins).padStart(10) + String(r.met).padStart(13) + String(r.mastered).padStart(12));
  });
```

with:

```js
  console.log('  jour   exercices   minutes   neufs   rencontrés   maîtrisés');
  [1, 7, 30, 90, 180, 300, DAYS].filter(d => d <= DAYS).forEach(d => {
    const r = perDay[d - 1];
    console.log('  ' + String(r.day).padStart(4) + String(r.tasks).padStart(12) +
      String(r.mins).padStart(10) + String(r.fresh).padStart(8) +
      String(r.met).padStart(13) + String(r.mastered).padStart(12));
  });
```

And after `S.abandon();` closes the session loop, record the day's result. Replace:

```js
    const met = NL.srs.counts().seen;
    if (!exhausted && met >= total) exhausted = day;
    perDay.push({ day, tasks: dayTasks, mins: Math.round(daySecs / 60), met,
      mastered: NL.content.courseProgress().mastered });
```

with:

```js
    const met = NL.srs.counts().seen;
    if (!exhausted && met >= total) exhausted = day;
    perDay.push({ day, tasks: dayTasks, mins: Math.round(daySecs / 60), met,
      fresh: freshSeenToday.size, mastered: NL.content.courseProgress().mastered });
```

Then add the assertion. Find the `CE QUE LA SIMULATION VÉRIFIE` block and add, before it prints its verdict:

```js
  /* Le défaut clé : tant qu'il reste du vocabulaire jamais vu, chaque journée
     doit en présenter. Une seule journée sèche avant l'épuisement du catalogue
     est la panne qu'on répare ici. */
  const dryDays = perDay.filter(d => d.fresh === 0 && d.met < total);
  ok(dryDays.length === 0,
    dryDays.length + ' journée(s) sans un seul mot neuf alors que le catalogue ' +
    'n’est pas épuisé — la première est le jour ' + (dryDays[0] && dryDays[0].day));
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node test/pace.js "$(pwd)" 30`
Expected: FAIL — `N journée(s) sans un seul mot neuf…`, with the first dry day at day 2 or 3.

- [ ] **Step 3: Make `STEP` day-based**

In `src/core/srs.js`, replace line 73-74:

```js
  /* Sous la journée, l'élément reste dans la même séance ; au-dessus, SM-2 prend le relais. */
  const STEP = [2 * MIN, 12 * MIN, 1 * DAY, 3 * DAY, 8 * DAY, 21 * DAY];
```

with:

```js
  /* Tous les intervalles valent au moins un jour. Les deux premiers sont à 1 j
     exprès : un mot neuf réussi revient le lendemain, et un élément retombé au
     barreau 0 aussi.

     Le renforcement court — « redemande-le-moi dans un instant » — existe
     toujours, mais il vit DANS la séance (voir SOON_RUNG et src/ui/session.js).
     Stocké comme une échéance de 2 ou 12 minutes, il redevenait dû toute la
     journée et occupait les 22 places en permanence. */
  const STEP = [1 * DAY, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY, 60 * DAY];

  /* En dessous de ce barreau, l'élément est aussi reproposé dans la séance. */
  const SOON_RUNG = 2;
```

Remove `MIN` from the destructuring on line 7 if it becomes unused — check with `grep -n "MIN" src/core/srs.js` first; keep it if anything else uses it.

Add `SOON_RUNG` to the exports on line 239, after `STEP`.

- [ ] **Step 4: Re-queue young items inside the session**

In `src/ui/session.js`, in `check()`, replace the success branch:

```js
    if (v.ok) {
      L.right++;
      L.xp += c.ex === 'speak' ? 4 : L.source === 'defi' ? 3 : 2;
      L.xp += comboUp();
      if (c.ex === 'speak') L.spoken++;
      NL.audio.ok();
    } else {
```

with:

```js
    if (v.ok) {
      L.right++;
      L.xp += c.ex === 'speak' ? 4 : L.source === 'defi' ? 3 : 2;
      L.xp += comboUp();
      if (c.ex === 'speak') L.spoken++;
      NL.audio.ok();
      /* Le renforcement court, à sa place : un élément encore jeune repasse plus
         loin dans CETTE séance. Il n'est plus enregistré comme dû dans douze
         minutes, donc il ne mange plus les places du reste de la journée. */
      if (L.source !== 'defi' && !c.retry &&
          NL.srs.stageOf(c.items[0]) < NL.srs.SOON_RUNG &&
          L.queue.length < MAX_TASKS + 6) {
        L.queue.push(retryOf(c));
      }
    } else {
```

- [ ] **Step 5: Run the simulation to verify it passes**

Run: `node test/pace.js "$(pwd)" 30`
Expected: PASS — no dry days, and the per-day table shows a non-zero `fresh` column every day until the catalogue runs out.

- [ ] **Step 6: Run the whole suite**

Run: `sh test/run-all.sh`
Expected: `TOUTE LA SUITE EST PASSÉE`. If `test/smoke.js` fails on `lapse must re-enter the step ladder, not restart at 2 min` (line 159), it is asserting `r.interval === NL.srs.STEP[2]` — that assertion still holds with the new ladder, since it reads `STEP` rather than a literal. If any test hard-codes `2 * 60000` or `12 * 60000`, update it to read from `NL.srs.STEP`.

- [ ] **Step 7: Commit**

```bash
sh build.sh
git add src/core/srs.js src/ui/session.js test/pace.js index.html artifact.html
git commit -m "fix: new vocabulary every day, and a simulation that can see it

A rung-1 item came due again in twelve minutes. That was stored as a real due
date, so it competed for the day's 22 slots forever and day two served nothing
new. Short reinforcement now happens inside the session, where it belonged, and
every stored interval is at least a day.

test/pace.js froze the clock inside each simulated day, which is why 200 days
looked healthy while real day two served zero new words. The clock advances with
each exercise now, and the simulation fails if any day before the catalogue runs
out presents no new word.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: One session composer, with a share reserved for new words

Task 2 fixes today's stall. At 400 items in rotation, genuine next-day reviews will fill all 22 slots by themselves and new material stops again. `plan()` and `session.start()` also compute the same thing twice, in two places that can disagree.

**Files:**
- Modify: `src/core/srs.js:212-236` (`freshItems`, `plan`), `:239-241` (exports)
- Modify: `src/ui/session.js:52-63` (`start`), `:75` (the cap)
- Modify: `test/smoke.js` (a new `COMPOSITION DE SÉANCE` block)

**Interfaces:**
- Consumes: `NL.srs.STEP`, `NL.srs.SOON_RUNG` from Task 2.
- Produces: `NL.srs.compose() -> { due: Item[], fresh: Item[], total: number, left: number, mins: number }`. `plan()` keeps its existing shape (`{ due, fresh, total, left, mins }` with `due`/`fresh` as **counts**) so `src/ui/home.js` needs no change; it is now a thin wrapper over `compose()`.

- [ ] **Step 1: Write the failing tests**

In `test/smoke.js`, add before the `PLACEMENT / PROGRESS` block:

```js
  console.log('\nCOMPOSITION DE SÉANCE');
  {
    const all = NL.content.allItems();

    /* Un paquet saturé SAUF quelques éléments jamais vus : c'est exactement la
       situation du jour 2 qui avait tout cassé. Le neuf doit passer quand même. */
    all.slice(10).forEach(it => NL.srs.seed(it, 2));
    NL.state.allRecs().forEach(r => { r.due = Date.now() - 1000; NL.state.setRec(r, true); });
    const c1 = NL.srs.compose();
    ok(c1.fresh.length >= 4,
      'a saturated deck must still reserve at least 4 new words, got ' + c1.fresh.length);
    ok(c1.due.length > 0, 'a saturated deck should still serve reviews');
    ok(c1.due.length + c1.fresh.length === c1.total, 'the parts of a session must add up');
    ok(c1.total <= NL.srs.MAX_TASKS, 'a session must not exceed MAX_TASKS, got ' + c1.total);

    /* Review Focus 2 : plus rien à découvrir. La réservation tombe à zéro et les
       révisions prennent toute la place, sans séance vide ni tranche négative. */
    all.forEach(it => { if (!NL.state.rec(it.id)) NL.srs.seed(it, 2); });
    NL.state.allRecs().forEach(r => { r.due = Date.now() - 1000; NL.state.setRec(r, true); });
    const c2 = NL.srs.compose();
    ok(c2.fresh.length === 0, 'nothing is unseen, yet ' + c2.fresh.length + ' new word(s) were reserved');
    ok(c2.total === Math.min(NL.srs.MAX_TASKS, c2.left),
      'reviews should fill the whole session once the catalogue is met, got ' + c2.total);
    console.log('  paquet saturé : ' + c1.fresh.length + ' neufs réservés ; catalogue épuisé : ' +
      c2.total + ' révisions');
  }
```

Review Focus 2 is covered by the `smoke.js` block above, which can set up an exhausted catalogue deterministically. `test/pace.js` needs no new assertion in this task — the dry-day check from Task 2 already fails if the reservation ever starves reviews, because a starved day would stop meeting new items.

- [ ] **Step 2: Run them to verify they fail**

Run: `node test/smoke.js "$(pwd)"`
Expected: FAIL — `NL.srs.compose is not a function`.

- [ ] **Step 3: Write `compose()` and make `plan()` wrap it**

In `src/core/srs.js`, replace `plan()` (lines 224-236) with:

```js
  /* La part de chaque séance réservée au vocabulaire neuf, tant qu'il en reste.
     Sans elle, 400 éléments en rotation remplissent les 22 places à eux seuls et
     le neuf s'arrête de nouveau — même symptôme qu'avant, autre cause. */
  const FRESH_SHARE = 0.3, FRESH_MIN = 4;

  /* LE seul endroit qui décide du contenu d'une séance. `plan()` (pour l'écran
     Aujourd'hui) et `start()` (pour la séance elle-même) en dépendent tous les
     deux : quand les deux calculaient séparément, ils pouvaient se contredire. */
  function compose() {
    const left = budgetLeft();
    const cap = Math.min(MAX_TASKS, left);
    if (cap <= 0) return { due: [], fresh: [], total: 0, left, mins: 1 };

    const unseen = freshItems(pace().fresh);
    const reserve = unseen.length ? Math.min(cap, Math.max(FRESH_MIN, Math.round(cap * FRESH_SHARE))) : 0;

    /* Les révisions prennent tout sauf la réservation ; le neuf prend la
       réservation PLUS la place que les révisions n'ont pas utilisée. */
    const due = dueItems().slice(0, Math.max(0, cap - reserve));
    const fresh = unseen.slice(0, Math.max(0, cap - due.length));
    const total = due.length + fresh.length;
    return { due, fresh, total, left, mins: Math.max(1, Math.round(total * 0.22)) };
  }

  /* L'écran Aujourd'hui veut des comptes, pas des listes. */
  function plan() {
    const c = compose();
    return { due: c.due.length, fresh: c.fresh.length, total: c.total, left: c.left, mins: c.mins };
  }
```

Add `compose` and `FRESH_SHARE` to the exports on line 239-241.

- [ ] **Step 4: Make the session use it**

In `src/ui/session.js`, replace lines 52-63:

```js
    const m = NL.state.meta();
    const due = NL.srs.dueItems();
    let fresh, pool;

    if (source && source !== 'vandaag') {
      const items = NL.content.itemsOf(source);
      pool = items.filter(it => NL.srs.stageOf(it) >= 0 && NL.state.rec(it.id).due <= Date.now());
      fresh = items.filter(it => NL.srs.stageOf(it) < 0).slice(0, NL.srs.pace().fresh);
    } else {
      const left = NL.srs.budgetLeft();
      pool = due.slice(0, left);
      fresh = NL.srs.freshItems(Math.min(Math.max(0, left - pool.length), NL.srs.pace().fresh));
    }
```

with:

```js
    let fresh, pool;

    if (source && source !== 'vandaag') {
      const items = NL.content.itemsOf(source);
      pool = items.filter(it => NL.srs.stageOf(it) >= 0 && NL.state.rec(it.id).due <= Date.now());
      fresh = items.filter(it => NL.srs.stageOf(it) < 0).slice(0, NL.srs.pace().fresh);
    } else {
      /* Un seul endroit décide : voir NL.srs.compose(). */
      const c = NL.srs.compose();
      pool = c.due;
      fresh = c.fresh;
    }
```

- [ ] **Step 5: Stop the queue cut from discarding the reserved new words**

Still in `src/ui/session.js`, the queue is truncated to `MAX_TASKS + 1` at line 114 after being shuffled, which can drop reserved new items at random. Replace line 75:

```js
    const others = pool.filter(it => pats.indexOf(it) < 0).slice(0, MAX_TASKS - pats.length);
```

with:

```js
    /* La réservation du neuf doit survivre au plafond : on rabote les révisions,
       pas les nouveautés, sinon la part réservée se fait couper au hasard. */
    const others = pool.filter(it => pats.indexOf(it) < 0)
      .slice(0, Math.max(0, MAX_TASKS - pats.length - fresh.length));
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node test/smoke.js "$(pwd)"` then `node test/pace.js "$(pwd)" 60`
Expected: both PASS.

- [ ] **Step 7: Run the whole suite**

Run: `sh test/run-all.sh`
Expected: `TOUTE LA SUITE EST PASSÉE`

- [ ] **Step 8: Commit**

```bash
sh build.sh
git add src/core/srs.js src/ui/session.js test/smoke.js test/pace.js index.html artifact.html
git commit -m "feat: one session composer, with a share reserved for new words

Taking sub-day repeats out of the budget fixed today's stall but not the one
waiting at four hundred items in rotation, where real reviews fill all 22 slots
by themselves. Thirty percent of every session, and at least four items, is now
reserved for words never seen — and the reservation survives the cap, because the
truncation trims reviews instead of new words.

plan() and session start computed the same thing twice and could disagree. Both
now call NL.srs.compose(), which is the only place a session's contents are
decided.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Tiers, so trivial words stop costing as much as hard ones

`TIER_MAX = { produce: 6, write: 4, recognise: 2 }` has no callers: no content item declares a tier, so all 439 climb to rung 6 and *zeventien* costs as much as *verstaan*.

**Files:**
- Modify: `src/content/index.js:60-66` (the post-flatten pass)
- Create: `test/tools/tier-report.js`
- Modify: `test/smoke.js`

**Interfaces:**
- Consumes: `NL.srs.STEP` from Task 2.
- Produces: every item carries `it.tier` ∈ `{'produce','write','recognise'}`; `NL.content.TIER_RULES` (array of `{ name: string, tier: string, test: (item) => boolean }`) and `NL.content.tierOf(item) -> string`, so the report and the test describe the same rules.

- [ ] **Step 1: Write the failing test**

In `test/smoke.js`, add after the `COMPOSITION DE SÉANCE` block:

```js
  console.log('\nPALIERS');
  {
    const all = NL.content.allItems();
    ok(all.every(it => ['produce', 'write', 'recognise'].indexOf(it.tier) >= 0),
      'every item needs a valid tier');
    const short = all.filter(it => it.tier !== 'produce');
    ok(short.length > 0, 'no item got a shorter tier — the rules are not firing');

    /* Un mot transparent ne doit pas exiger le barreau « à voix haute ». */
    const cog = all.find(it => it.cognate && it.kind === 'word');
    if (cog) ok(NL.srs.maxRung(cog) < NL.srs.GRADUATED,
      'a cognate should cap below the spoken rung, caps at ' + NL.srs.maxRung(cog));

    /* Review Focus 3 : au sommet d'un palier court, l'intervalle doit CROÎTRE
       et l'élément finir par sortir du paquet, pas revenir chaque jour à vie. */
    const low = all.find(it => NL.srs.maxRung(it) <= 4) || all[0];
    const top = NL.srs.maxRung(low);
    NL.srs.seed(low, top);
    let prev = 0, grew = 0;
    for (let i = 0; i < 12; i++) {
      const r = NL.srs.grade(low, true, { ex: 'type' });
      if (r.interval > prev) grew++;
      prev = r.interval;
    }
    ok(grew >= 8, 'an item at the top of a short tier stopped growing after ' + grew + ' step(s)');
    ok(NL.state.rec(low.id).retired, 'an item at the top of a short tier never retired');
    console.log('  ' + short.length + ' éléments sur ' + all.length + ' ont un palier court');
  }
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node test/smoke.js "$(pwd)"`
Expected: FAIL — `no item got a shorter tier — the rules are not firing`.

- [ ] **Step 3: Apply the tier rules at content-load time**

In `src/content/index.js`, replace lines 60-66:

```js
    /* Palier par défaut, et détection des mots transparents : « de tram »,
       « de garage », « direct » sont offerts à un francophone. */
    flat.forEach(it => {
      it.tier = it.tier || 'produce';
      it.cognate = it.kind === 'word' &&
        NL.util.ratio(NL.util.bare(it.nl), NL.util.bareFr(it.fr)) > 0.62;
    });
```

with:

```js
    /* Détection des mots transparents : « de tram », « de garage », « direct »
       sont offerts à un francophone. */
    flat.forEach(it => {
      it.cognate = it.kind === 'word' &&
        NL.util.ratio(NL.util.bare(it.nl), NL.util.bareFr(it.fr)) > 0.62;
    });
    /* Puis le palier, PAR RÈGLE et jamais à la main : 439 jugements au cas par
       cas ne seraient ni reproductibles ni relisibles. Un élément qui déclare
       déjà son palier dans le contenu garde le sien. */
    flat.forEach(it => { it.tier = it.tier || tierOf(it); });
```

Add, before `build()`:

```js
  /* Les règles de palier, exposées pour que le test et le rapport parlent de la
     même chose. Ordre significatif : la première qui accroche gagne.

     `recognise` reste disponible mais sans règle pour l'instant : on ne sait pas
     encore quel vocabulaire mérite d'être seulement compris, et inventer la
     règle maintenant serait un jugement déguisé en code. */
  const NUMBER_FR = /^(z[ée]ro|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|mille)\b/i;
  const TIER_RULES = [
    { name: 'write · transparent', tier: 'write', test: it => !!it.cognate },
    { name: 'write · nombre', tier: 'write',
      test: it => it.kind === 'word' && NUMBER_FR.test(NL.util.bareFr(it.fr || '')) }
  ];
  function tierOf(it) {
    for (let i = 0; i < TIER_RULES.length; i++) {
      if (TIER_RULES[i].test(it)) return TIER_RULES[i].tier;
    }
    return 'produce';
  }
```

Add `TIER_RULES` and `tierOf` to the `Object.assign(NL.content, {...})` call on line 162.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node test/smoke.js "$(pwd)"`
Expected: PASS, with the count of short-tier items printed.

- [ ] **Step 5: Write the review report**

Create `test/tools/tier-report.js`:

```js
/* Ce que les règles de palier ont décidé, pour relecture humaine. Ce n'est pas
   un test : c'est ce qu'on lit avant de croire aux règles.
     node test/tools/tier-report.js */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');

const ctx = { console, JSON, Math, Date, Object, Array, String, Number, RegExp, Map, Set,
  NL: { util: {}, state: { customs: () => [], meta: () => ({}) } } };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
['src/core/util.js', 'src/content/lexicon.a1.js', 'src/content/lexicon.a1b.js',
 'src/content/grammar.js', 'src/content/examples.js', 'src/content/open.js',
 'src/content/reference.js', 'src/content/scenarios.js', 'src/content/index.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }));

const items = ctx.NL.content.allItems();
const by = {};
items.forEach(it => { (by[it.tier] = by[it.tier] || []).push(it); });

console.log('PALIERS — ' + items.length + ' éléments');
Object.keys(by).sort().forEach(t => console.log('  ' + t.padEnd(10) + by[t].length));
console.log('\nCe qui n’ira pas jusqu’au barreau « à voix haute » :');
items.filter(it => it.tier !== 'produce').forEach(it =>
  console.log('  ' + it.tier.padEnd(10) + it.unit.padEnd(12) + it.nl + '   (' + it.fr + ')'));
```

- [ ] **Step 6: Run the report and read it**

Run: `node test/tools/tier-report.js`
Expected: a distribution and a list. **Read the list.** If a word that genuinely needs to be spoken appears there, the rule is wrong — narrow it and re-run before committing.

- [ ] **Step 7: Run the whole suite**

Run: `sh test/run-all.sh`
Expected: `TOUTE LA SUITE EST PASSÉE`. `test/pace.js` should now show a lower daily load, since short-tier items retire instead of circulating.

- [ ] **Step 8: Commit**

```bash
sh build.sh
git add src/content/index.js test/smoke.js test/tools/tier-report.js index.html artifact.html
git commit -m "feat: tiers, so trivial words stop costing as much as hard ones

TIER_MAX has existed since September with no callers: nothing declared a tier, so
all 439 items climbed to rung six and de tram cost as much as verstaan. Tiers are
now assigned by rule at content-load time — cognates and numbers cap below the
spoken rung — with a report to read before trusting the rules.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: The gate opens on what you have met

`unitComplete` wants 80 % of a unit at rung 3. That is a mastery threshold in disguise, it cannot outrun the interval ladder, and it is what produced "tu es à 3 %" after two days of perfect work.

**Files:**
- Modify: `src/content/index.js:76-85` (`READY`, `GATE`, `unitComplete`), `:118-130` (`unitProgress`)
- Modify: `src/core/fr.js:251` (`unitGate`)
- Modify: `src/ui/home.js:123-124`
- Modify: `test/smoke.js`

**Interfaces:**
- Consumes: `it.tier` from Task 4.
- Produces: `NL.content.GATE = 0.75`; `unitProgress()` gains `opensIn: number|null` (words still to meet before the next unit opens; `null` when there is no next unit).

- [ ] **Step 1: Write the failing test**

In `test/smoke.js`, add after the `PALIERS` block:

```js
  console.log('\nSEUIL D’OUVERTURE');
  {
    NL.content.allItems().forEach(it => { const r = NL.state.rec(it.id); if (r) NL.state.setRec(r, true); });
    const u1 = NL.content.units[0].id;
    const its = NL.content.itemsOf(u1).filter(it => it.kind !== 'pattern');

    /* Rencontrer 75 % suffit : plus besoin de les avoir travaillés. */
    its.forEach((it, i) => { if (i < Math.ceil(its.length * 0.75)) NL.srs.seed(it, 0); });
    ok(NL.content.GATE === 0.75, 'the gate should be 0.75, is ' + NL.content.GATE);
    ok(NL.content.unitComplete(u1), '75% met should open the next unit');

    const p = NL.content.unitProgress(u1);
    ok(p.opensIn === 0, 'opensIn should be 0 once the gate is passed, is ' + p.opensIn);

    /* Review Focus 4 : la dernière unité n'ouvre rien, et un compte ne doit
       jamais être négatif ni diviser par zéro. */
    const last = NL.content.units[NL.content.units.length - 1].id;
    ok(NL.content.unitProgress(last).opensIn === null,
      'the last unit must not promise an opening');
    NL.content.units.forEach(u => {
      const q = NL.content.unitProgress(u.id);
      ok(q.opensIn === null || q.opensIn >= 0, 'opensIn went negative on ' + u.id);
      ok(q.gate >= 0 && q.gate <= 100, 'gate percentage out of range on ' + u.id);
    });
    console.log('  75 % rencontrés ouvrent la suite ; la dernière unité n’ouvre rien');
  }
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node test/smoke.js "$(pwd)"`
Expected: FAIL — `the gate should be 0.75, is 0.8` and `75% met should open the next unit`.

- [ ] **Step 3: Move the gate to met-75 %**

In `src/content/index.js`, replace lines 76-85:

```js
  /* Deux seuils, tenant compte du palier de chaque élément : un mot du palier
     « reconnaître » plafonne à l'échelon 2 et ne peut pas atteindre l'échelon 5. */
  const READY = it => NL.srs.stageOf(it) >= Math.min(3, NL.srs.maxRung(it));
  const MASTERED = it => NL.srs.stageOf(it) >= Math.min(NL.srs.GRADUATED, NL.srs.maxRung(it));
  const GATE = 0.8;

  const unitComplete = uid => {
    const items = itemsOf(uid);
    return !items.length || items.filter(READY).length / items.length >= GATE;
  };
```

with:

```js
  /* MET = rencontré au moins une fois. C'est le seul critère du seuil
     d'ouverture : il empêche de déverser 439 éléments le premier jour, et c'est
     son unique rôle. L'ancien seuil exigeait 80 % au barreau 3, donc plusieurs
     jours de travail parfait par unité, et affichait « tu es à 3 % » — un chiffre
     exact et sans valeur. */
  const MET = it => NL.srs.stageOf(it) >= 0;
  /* READY et MASTERED servent encore aux comptes affichés, plus au seuil. */
  const READY = it => NL.srs.stageOf(it) >= Math.min(3, NL.srs.maxRung(it));
  const MASTERED = it => NL.srs.stageOf(it) >= Math.min(NL.srs.GRADUATED, NL.srs.maxRung(it));
  const GATE = 0.75;

  const unitComplete = uid => {
    const items = itemsOf(uid);
    return !items.length || items.filter(MET).length / items.length >= GATE;
  };
```

In `frontier()` (line 102), the backfill for older profiles already counts `stageOf(it) >= 0` against `GATE` — it now agrees with `unitComplete` by construction. Leave it.

- [ ] **Step 4: Report how far the gate is**

Still in `src/content/index.js`, replace `unitProgress` (lines 118-130):

```js
  function unitProgress(uid) {
    const items = itemsOf(uid);
    if (!items.length) return { pct: 0, met: 0, ready: 0, mastered: 0, total: 0, gate: 0, level: 0 };
    const met = items.filter(it => NL.srs.stageOf(it) >= 0).length;
    const ready = items.filter(READY).length;
    const mastered = items.filter(MASTERED).length;
    const pct = Math.round(mastered / items.length * 100);
    return {
      pct, met, ready, mastered, total: items.length,
      gate: Math.round(ready / items.length * 100),
      level: Math.min(5, Math.floor(pct / 20))
    };
  }
```

with:

```js
  /* Des comptes, pas des pourcentages : `met` et `ready` sont ce que les écrans
     affichent, et `opensIn` dit combien de mots restent avant que l'unité
     suivante s'ouvre — null quand il n'y a pas de suivante. */
  function unitProgress(uid) {
    const items = itemsOf(uid);
    const i = NL.content.units.findIndex(u => u.id === uid);
    const hasNext = i >= 0 && i < NL.content.units.length - 1;
    if (!items.length) {
      return { met: 0, ready: 0, mastered: 0, total: 0, gate: 0, opensIn: hasNext ? 0 : null };
    }
    const met = items.filter(MET).length;
    const ready = items.filter(READY).length;
    const mastered = items.filter(MASTERED).length;
    const need = Math.ceil(items.length * GATE);
    return {
      met, ready, mastered, total: items.length,
      gate: Math.round(met / items.length * 100),
      opensIn: hasNext ? Math.max(0, need - met) : null
    };
  }
```

`pct` and `level` are gone. Step 5 removes their last readers; `grep -rn "\.pct\|unitLevel" src/` must come back clean for `unitProgress` before you commit (`courseProgress().pct` is a different call and Task 7 handles it).

- [ ] **Step 5: Update the two screens that read them**

In `src/core/fr.js`, replace line 251:

```js
  unitGate: (a, b) => 'L’unité suivante s’ouvre à ' + b + '% travaillés — tu es à ' + a + '%.',
```

with:

```js
  unitOpensIn: n => (n === 1 ? 'L’unité suivante s’ouvre dans 1 mot.' : 'L’unité suivante s’ouvre dans ' + n + ' mots.'),
```

In `src/ui/home.js`, replace lines 119 and 122-124. The `uc-pct` span and the `prog-line` become counts, and the gate line uses the new string:

```js
          '<span class="uc-pct" title="' + t.unitLevel(p.level) + '">' + p.pct + '%</span>' +
```

becomes:

```js
          '<span class="uc-count">' + p.met + '/' + p.total + '</span>' +
```

and:

```js
          '<div class="prog-line">' + bar(p.pct) + '<span class="muted small">' + t.metOf(p.met, p.total) + '</span></div>' +
          (open && !NL.content.unitComplete(u.id)
            ? '<p class="uc-gate">' + t.unitGate(p.gate, 80) + '</p>' : '') +
```

becomes:

```js
          '<div class="prog-line">' + bar(p.gate) + '<span class="muted small">' + t.metOf(p.met, p.total) + '</span></div>' +
          (open && p.opensIn ? '<p class="uc-gate">' + t.unitOpensIn(p.opensIn) + '</p>' : '') +
```

In `src/core/fr.js`, delete `unitLevel` (line 252) — nothing reads it after this change. Confirm with `grep -rn "unitLevel" src/ test/`.

Add `.uc-count` to `styles.css` next to the existing `.uc-pct` rule, copying its font and colour so the card keeps its shape:

```css
.uc-count { font: 600 14px/1 var(--mono); color: var(--ink-3); white-space: nowrap; }
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node test/smoke.js "$(pwd)"` then `node test/sim.js "$(pwd)"`
Expected: both PASS. `sim.js` renders every screen, so it catches a missed `p.pct` reader.

- [ ] **Step 7: Run the whole suite and commit**

```bash
sh test/run-all.sh
sh build.sh
git add src/content/index.js src/core/fr.js src/ui/home.js styles.css test/smoke.js index.html artifact.html
git commit -m "feat: the gate opens on what you have met, not what you have mastered

Eighty percent of a unit at rung three is a mastery threshold in disguise: it
cannot outrun the interval ladder, so it showed three percent after two days of
perfect work. Seventy-five percent MET opens the next unit, which is the gate's
only real job — not dumping 439 items on day one.

Unit cards now say how many words are left before the next unit opens, instead of
a percentage that stood still.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Delete the placement test

It credited ~430 items at rung 3 on 48 questions, and it created more confusion than it saved time. Starting from zero is the decision; this removes the machinery.

**Files:**
- Delete: `src/ui/placement.js`
- Modify: `build.sh` (`SRC`), `src/ui/home.js:22-30` and `:171`, `src/ui/shell.js:26`, `src/app.js:21`, `src/core/fr.js`
- Modify: `test/smoke.js`, `test/sim.js`, `test/firstrun.js`, `test/journey.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `NL.screens.placement` no longer exists. `meta.placed` stays in `defaults()` for backward compatibility with existing backups but is never read.

- [ ] **Step 1: Confirm the reference list**

Run: `grep -rn "placement\|placed" src/ test/ build.sh styles.css`

The hits to change are, exactly:

| File | What |
| --- | --- |
| `src/ui/placement.js` | the whole file — deleted |
| `build.sh` | the `src/ui/placement.js` line in `SRC` |
| `src/ui/shell.js:26` | `placement: 1` in `FULLSCREEN` |
| `src/app.js:21` | `r === 'placement'` in the guard |
| `src/ui/home.js:22-30` | the first-run card; `:68` the `skip-place` handler; `:171` the tile |
| `src/core/fr.js:38-41` | `firstTitle`, `firstBody`, `firstDoTest`, `firstSkip`; and every `place*` string |
| `test/firstrun.js:67,70` | asserts the home screen *offers* the test |
| `test/journey.js:189-230` | the whole `3. placement` leg, plus `:207` asserting `meta().placed` |
| `test/sim.js:74-79` | drives the placement screen |

`NL.srs.seed` stays: the tests use it to put an item at a chosen rung and nothing else can.

- [ ] **Step 2: Write the failing test**

In `test/firstrun.js`, find the assertions about the first-run screen and add:

```js
  ok(!NL.screens.placement, 'the placement screen must be gone');
  const first = NL.screens.vandaag.render();
  ok(first.indexOf('data-go="placement"') < 0, 'the first-run card still offers the placement test');
  ok(first.indexOf('data-act="skip-place"') < 0, 'the first-run card still has the skip button');
  ok(NL.screens.meer.render().indexOf('data-go="placement"') < 0, 'Plus still links to the placement test');
```

- [ ] **Step 3: Run it to verify it fails**

Run: `node test/firstrun.js "$(pwd)"`
Expected: FAIL — `the placement screen must be gone`.

- [ ] **Step 4: Remove the screen and its route**

```bash
git rm src/ui/placement.js
```

In `build.sh`, delete the `src/ui/placement.js` line from `SRC`.

In `src/ui/shell.js` line 26, remove `placement: 1`:

```js
  const FULLSCREEN = { sessie: 1, scenario: 1, doctor: 1, compte: 1 };
```

In `src/app.js` line 21, remove `placement`:

```js
        if (r === 'sessie' || r === 'scenario') return;
```

- [ ] **Step 5: Replace the first-run card**

In `src/ui/home.js`, replace lines 22-30:

```js
      if (!m.placed && c.seen === 0) {
        html += '<section class="card lead">' +
          '<h1>' + t.firstTitle + '</h1>' +
          '<p>' + t.firstBody + '</p>' +
          '<div class="lead-actions">' +
          '<button class="btn btn-primary" data-go="placement">' + t.firstDoTest + '</button>' +
          '<button class="btn btn-ghost" data-act="skip-place">' + t.firstSkip + '</button>' +
          '</div></section>';
      }
```

with:

```js
      if (c.seen === 0) {
        html += '<section class="card lead">' +
          '<h1>' + t.firstTitle + '</h1>' +
          '<p>' + t.firstBody + '</p>' +
          '</section>';
      }
```

and delete the `skip-place` handler from `click` (line 68).

Replace the placement tile on line 171:

```js
        tile('\u{1F4CF}', 'Test de niveau', m.placed ? 'Le refaire' : 'Pas encore fait', 'go', 'placement') +
```

with nothing — Task 8 adds the mistakes tile in its place.

- [ ] **Step 6: Rewrite the strings**

In `src/core/fr.js`, replace lines 38-41:

```js
  firstTitle: 'Ce que tu entends déjà compte.',
  firstBody: 'Tu entends du néerlandais depuis des années. Commencer à « de man eet brood » gaspillerait des semaines. Un test de cinq minutes te place là où tu es vraiment.',
  firstDoTest: 'Faire le test de niveau',
  firstSkip: 'Commencer de zéro',
```

with:

```js
  firstTitle: 'On commence par le début, et ça va vite.',
  firstBody: 'Les mots que tu connais déjà se reconnaissent tout seuls : tu les passeras en quelques secondes, et ils sortiront du paquet au lieu de revenir. Ceux que tu ne connais pas, tu les reverras demain.',
```

Then delete every `place*` string. Run `grep -n "place" src/core/fr.js` and remove each entry that only `placement.js` used (`placeEyebrow`, `placeQ`, `placeTypeQ`, `placeRule`, `placeSubmit`, `placeStops`, `placeAll`, `placeLow`, `placeMid`, `placeHigh`, `placeNone`, `placeSeeded`, `placeUnits`, `placeAdvanced`, `placeAsked`, `placeFirst`, `placeLater`). Keep anything another screen still reads — verify each with `grep -rn "<name>" src/`.

- [ ] **Step 7: Update the other tests**

`test/firstrun.js` — replace the assertion at line 67 and the log line at 70:

```js
  ok(home.includes('test de niveau') || home.includes('Test de niveau'), 'no placement offer on a blank account');
```

```js
  ok(home.indexOf('data-act="start"') >= 0, 'a blank account must still be offered a session');
```

and in the line 70 log, replace `placement offered, session offered` with `session offered`.

`test/sim.js` — delete lines 74-79 (the block that does `NL.ui.go('placement')` and clicks through it). The screens list that follows is unaffected.

`test/journey.js` — delete the whole `3. placement` leg, lines 189-230. The journey then goes from whatever precedes it straight to the first `vandaag` session on an empty deck, which is now the real first-run path. Renumber the comment banners that follow if they are numbered.

`test/smoke.js` — the `PLACEMENT / PROGRESS` heading at the tail: rename it to `PROGRESSION`. Its `NL.srs.seed` calls stay; they are setup, not placement.

- [ ] **Step 8: Run the tests to verify they pass**

Run: `node test/firstrun.js "$(pwd)"`
Expected: PASS.

- [ ] **Step 9: Run the whole suite, including all 8 journey configurations**

Run: `sh test/run-all.sh`
Expected: `TOUTE LA SUITE EST PASSÉE`

- [ ] **Step 10: Commit**

```bash
sh build.sh
git add -A src/ test/ build.sh index.html artifact.html
git commit -m "refactor: delete the placement test

Four questions credited a 33-item unit, so 48 questions credited 430 items at
rung three and the deck was saturated before the first session. Combined with the
budget bug that meant no new vocabulary, ever. It created more confusion than it
saved time; we start from zero, and tiers plus the cognate jump make known words
cheap to pass.

meta.placed stays in defaults so old backups still load, and is read nowhere.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: Screens that count instead of estimating

Findings B2, B3 and B5: three unlabelled percentages on one card, and rung pills under the session progress bar that read as a permanently broken progress bar.

**Files:**
- Modify: `src/ui/home.js:52` (`statCourse`), `:98-106` (`leerpad` header)
- Modify: `src/ui/session.js:238-241` (kicker), `:247-254` (`stagePips`)
- Modify: `src/content/index.js:132-142` (`courseProgress`)
- Modify: `src/core/fr.js`
- Modify: `test/sim.js`

**Interfaces:**
- Consumes: `unitProgress()` from Task 5.
- Produces: `courseProgress()` returns `{ met, ready, mastered, total, unitsDone, current }` — no `pct`. `NL.t.statMet`, `NL.t.statCanSay`, `NL.t.sessionUnits`.

- [ ] **Step 1: Write the failing test**

In `test/sim.js`, after the screens render, add:

```js
  /* Les pourcentages de maîtrise ne doivent plus apparaître nulle part. */
  const path = NL.screens.leerpad.render();
  ok(path.indexOf('uc-pct') < 0, 'a unit card still shows a percentage');
  ok(NL.content.courseProgress().pct === undefined, 'courseProgress still exposes pct');

  /* Et la séance ne doit plus afficher les plaquettes d'échelon. */
  NL.screens.sessie.begin('vandaag');
  const lesson = NL.screens.sessie.render();
  ok(lesson.indexOf('class="pips"') < 0, 'the session still renders rung pips');
  ok(lesson.indexOf('data-unit-label') >= 0, 'the session card should name its unit');
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node test/sim.js "$(pwd)"`
Expected: FAIL — `courseProgress still exposes pct` and `the session still renders rung pips`.

- [ ] **Step 3: Drop the percentage from `courseProgress`**

In `src/content/index.js`, replace lines 132-142:

```js
  function courseProgress() {
    const items = allItems().filter(it => it.unit !== 'eigen');
    const mastered = items.filter(MASTERED).length;
    const ready = items.filter(READY).length;
    return {
      pct: Math.round(mastered / items.length * 100),
      mastered, ready, total: items.length,
      unitsDone: NL.content.units.filter(u => unitComplete(u.id)).length,
      current: NL.content.units[frontier()] || null
    };
  }
```

with:

```js
  /* Des comptes. Un pourcentage de maîtrise affichait 0 % pendant deux semaines
     par construction, et ne répondait pas à la question qu'on se pose
     vraiment : est-ce que j'apprends plus de néerlandais qu'hier ? */
  function courseProgress() {
    const items = allItems().filter(it => it.unit !== 'eigen');
    return {
      met: items.filter(MET).length,
      ready: items.filter(READY).length,
      mastered: items.filter(MASTERED).length,
      total: items.length,
      unitsDone: NL.content.units.filter(u => unitComplete(u.id)).length,
      current: NL.content.units[frontier()] || null
    };
  }
```

- [ ] **Step 4: Rewrite the two home screens**

In `src/core/fr.js`, replace `statCourse` (line 34) and add two strings next to it:

```js
  statCourse: 'du cours',
```

becomes:

```js
  statMet: 'mots rencontrés',
  statCanSay: 'mots que tu peux produire',
```

Delete `masteredOf` (line 253) once nothing reads it.

In `src/ui/home.js` line 49-53, replace the stat strip:

```js
      html += '<div class="tri">' +
        stat(m.streak, t.statStreak(m.streak)) +
        stat(c.said, t.statSaid) +
        stat(cp.pct + '%', t.statCourse) +
        '</div>';
```

with:

```js
      html += '<div class="tri">' +
        stat(m.streak, t.statStreak(m.streak)) +
        stat(cp.met, t.statMet) +
        stat(cp.ready, t.statCanSay) +
        '</div>';
```

And the `leerpad` header, lines 103-105:

```js
        '<div class="prog-line">' + bar(cp.pct) + '<b>' + cp.pct + '%</b></div>' +
        '<p class="muted small">' + t.masteredOf(cp.mastered, cp.total) + '</p>' +
```

with:

```js
        '<div class="prog-line">' + bar(cp.met / cp.total * 100) +
        '<b>' + cp.met + '/' + cp.total + '</b></div>' +
        '<p class="muted small">' + t.statMet + ' · ' + cp.ready + ' ' + t.statCanSay + '</p>' +
```

- [ ] **Step 5: Delete the rung pips and name the unit**

In `src/ui/session.js`, delete the `stagePips` function (lines 247-254) and the `const stage = NL.srs.stageOf(it);` line that feeds it (line 225). Replace the kicker (lines 238-241):

```js
      '<div class="kicker"><span class="sub">' +
      esc(unit ? unit.name : 'Mes mots') +
      (c.retry ? ' · ' + NL.t.again2 : '') +
      '</span>' + esc(ex.kicker) + stagePips(stage, it) + '</div>' +
```

with:

```js
      /* La carte nomme son unité : une séance peut couvrir deux unités quand la
         frontière est à cheval, et un compte seul ne disait pas où on était. */
      '<div class="kicker"><span class="sub" data-unit-label>' +
      esc(sessionUnits()) +
      (c.retry ? ' · ' + NL.t.again2 : '') +
      '</span>' + esc(ex.kicker) + '</div>' +
```

Add, next to `cur()`:

```js
  /* « Unité 5 », ou « Unités 4–5 » quand la séance en couvre deux. */
  function sessionUnits() {
    if (!L) return '';
    const ns = [];
    L.queue.forEach(c => c.items.forEach(it => {
      const u = NL.content.unit(it.unit);
      if (u && ns.indexOf(u.n) < 0) ns.push(u.n);
    }));
    if (!ns.length) return 'Mes mots';
    ns.sort((a, b) => a - b);
    return ns.length === 1 ? NL.t.sessionUnit(ns[0]) : NL.t.sessionUnits(ns[0], ns[ns.length - 1]);
  }
```

In `src/core/fr.js`, add next to the other session strings:

```js
  sessionUnit: n => 'Unité ' + n,
  sessionUnits: (a, b) => 'Unités ' + a + '–' + b,
```

Remove the now-unused `rungs` array from `src/core/fr.js` line 108 **only if** nothing else reads it — check `grep -rn "t.rungs\|NL.t.rungs" src/`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node test/sim.js "$(pwd)"` then `node test/smoke.js "$(pwd)"`
Expected: both PASS. `smoke.js` will fail on `courseProgress().pct` if its own output line still prints it — update that line to print `met` instead.

- [ ] **Step 7: Run the whole suite and commit**

```bash
sh test/run-all.sh
sh build.sh
git add src/ test/ index.html artifact.html
git commit -m "feat: screens that count instead of estimating

One unit card showed 0% (mastered), 34 of 34 (met) and 'tu es à 3%' (rung 3+),
with nothing saying which was which. Counts replace all three: words met, words
you can produce. A count moves every day and cannot be exactly right and
useless at the same time.

The rung pills are gone. They showed an item's rung directly under the session's
own progress bar, never moved during a session because they cannot, and so read
as a broken progress bar. The session card names its unit instead.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 8: The mistakes screen

`logReview` has recorded every answer since September and `state.logs()` exposes it. No screen reads it. Meanwhile the "fragiles" filter calls an item weak when its rung is low, which is not the same thing as getting it wrong.

**Files:**
- Create: `src/ui/misses.js`
- Modify: `build.sh` (`SRC`), `src/ui/home.js` (tile), `src/ui/library.js:21`, `src/core/fr.js`
- Modify: `test/sim.js`, `test/smoke.js`

**Interfaces:**
- Consumes: `NL.state.logs()`, `NL.srs.recOf`, `NL.content.byId`.
- Produces: `NL.screens.misses` with `render()` and `click(el, d)`; `NL.screens.misses.worst(n) -> [{ item, misses, tries }]`, used by the test and by the tile's subtitle.

- [ ] **Step 1: Write the failing test**

In `test/smoke.js`, add a block:

```js
  console.log('\nCE QUE TU RATES');
  {
    const its = NL.content.allItems();
    const hard = its[3], easy = its[4];
    for (let i = 0; i < 5; i++) NL.srs.grade(hard, false, { ex: 'type' });
    for (let i = 0; i < 5; i++) NL.srs.grade(easy, true, { ex: 'type' });

    const worst = NL.screens.misses.worst(10);
    ok(worst.length > 0, 'the mistakes screen found nothing to show');
    ok(worst[0].item.id === hard.id,
      'the most-missed item should come first, got ' + worst[0].item.id);
    ok(!worst.some(w => w.item.id === easy.id), 'an item answered right every time is not a miss');

    /* Review Focus 5 : le journal peut citer des éléments qui n'existent plus —
       un mot personnel supprimé, un identifiant changé par une édition. */
    NL.state.logReview({ id: 'ghost:w99', t: Date.now(), ok: false, stage: 0, kind: 'word', ex: 'type' });
    let threw = null;
    try { NL.screens.misses.worst(10); NL.screens.misses.render(); }
    catch (e) { threw = e; }
    ok(!threw, 'a log entry for a missing item broke the screen: ' + (threw && threw.message));
    console.log('  classement par rechutes réelles, journal orphelin ignoré');
  }
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node test/smoke.js "$(pwd)"`
Expected: FAIL — `Cannot read properties of undefined (reading 'worst')`.

- [ ] **Step 3: Write the screen**

Create `src/ui/misses.js`:

```js
/* Ce que tu rates. Le journal des réponses existait depuis le premier jour et
   aucun écran ne le lisait : l'app savait exactement quels mots te résistent et
   affichait à la place un barreau, qui n'est pas la même chose. */
NL.screens.misses = (function () {
  'use strict';
  const U = NL.util, esc = U.esc, t = NL.t;
  const WINDOW_DAYS = 60, SHOW = 25;

  /* Classement par nombre de ratés, puis par taux de raté : trois échecs sur
     trois comptent plus que trois sur vingt. Un élément absent du contenu est
     ignoré — le journal survit aux mots personnels supprimés. */
  function worst(n) {
    const since = Date.now() - WINDOW_DAYS * U.DAY;
    const by = {};
    NL.state.logs().forEach(l => {
      if (!l || !l.id || l.t < since) return;
      const e = by[l.id] || (by[l.id] = { tries: 0, misses: 0 });
      e.tries++;
      if (!l.ok) e.misses++;
    });
    const out = [];
    Object.keys(by).forEach(id => {
      const item = NL.content.byId(id);
      if (!item || !by[id].misses) return;
      out.push({ item: item, misses: by[id].misses, tries: by[id].tries });
    });
    out.sort((a, b) => (b.misses - a.misses) || (b.misses / b.tries - a.misses / a.tries));
    return out.slice(0, n || SHOW);
  }

  function render() {
    const list = worst(SHOW);
    let html = '<div class="wrap">' +
      '<section class="card lead slim">' +
      '<span class="eyebrow">' + t.missesEyebrow + '</span>' +
      '<h1>' + t.missesTitle(list.length) + '</h1>' +
      '<p>' + t.missesBody + '</p>' +
      (list.length ? '<button class="btn btn-primary" data-act="drill">' + t.missesDrill + '</button>' : '') +
      '</section>';

    if (!list.length) return html + '<p class="empty">' + t.missesNone + '</p></div>';

    list.forEach(w => {
      html += '<div class="vrow">' +
        '<button class="speaker tiny" data-say="' + esc(U.bare(w.item.nl)) + '" aria-label="' + t.listen + '">' +
        NL.ex.ICON.speaker(17) + '</button>' +
        '<div class="vtext"><b>' + esc(w.item.nl) + '</b><i>' + esc(w.item.fr) + '</i></div>' +
        '<span class="vmiss">' + t.missesCount(w.misses, w.tries) + '</span>' +
        '</div>';
    });
    return html + '</div>';
  }

  return {
    render, worst,
    click(el, d) {
      if (d.act === 'drill') {
        const ids = worst(SHOW).map(w => w.item.id);
        if (!ids.length) return;
        NL.screens.sessie.begin('misses', ids);
        NL.ui.go('sessie');
      }
    }
  };
})();
```

- [ ] **Step 4: Let a session be built from a list of ids**

In `src/ui/session.js`, `start(source)` becomes `start(source, ids)`. Replace the branch added in Task 3:

```js
    if (source && source !== 'vandaag') {
      const items = NL.content.itemsOf(source);
      pool = items.filter(it => NL.srs.stageOf(it) >= 0 && NL.state.rec(it.id).due <= Date.now());
      fresh = items.filter(it => NL.srs.stageOf(it) < 0).slice(0, NL.srs.pace().fresh);
    } else {
```

with:

```js
    if (source === 'misses') {
      /* Une séance de rattrapage : exactement ce qu'on rate, sans attendre
         l'échéance. Rien de neuf, on vient réparer. */
      pool = (ids || []).map(id => NL.content.byId(id)).filter(Boolean).slice(0, MAX_TASKS);
      fresh = [];
    } else if (source && source !== 'vandaag') {
      const items = NL.content.itemsOf(source);
      pool = items.filter(it => NL.srs.stageOf(it) >= 0 && NL.state.rec(it.id).due <= Date.now());
      fresh = items.filter(it => NL.srs.stageOf(it) < 0).slice(0, NL.srs.pace().fresh);
    } else {
```

Widen `begin` in the module's return object, at `src/ui/session.js:502`. Replace:

```js
    begin(source) { L = null; if (start(source)) { setTimeout(autoplay, 60); return true; } return false; }
```

with:

```js
    begin(source, ids) { L = null; if (start(source, ids)) { setTimeout(autoplay, 60); return true; } return false; }
```

and change the function signature on line 51 from `function start(source) {` to `function start(source, ids) {`.

- [ ] **Step 5: Add the strings, the tile and the route**

In `src/core/fr.js`, add next to the other screen strings:

```js
  missesEyebrow: 'Ce que tu rates',
  missesTitle: n => (n === 0 ? 'Rien ne te résiste' : n === 1 ? '1 mot te résiste' : n + ' mots te résistent'),
  missesBody: 'Classés par nombre de fois où tu t’es trompé, sur les deux derniers mois. C’est ce que l’app enregistre depuis le début.',
  missesDrill: 'Reprendre ceux-là',
  missesNone: 'Pas encore assez de réponses pour dire ce qui te résiste.',
  missesCount: (m, n) => m + ' ratés sur ' + n,
```

In `build.sh`, add `src/ui/misses.js` to `SRC`, after `src/ui/library.js`.

In `src/ui/home.js`, in `NL.screens.meer.render()`, add the tile where the placement tile was removed in Task 6:

```js
        tile('\u{1F3AF}', t.missesEyebrow, missesSub(), 'go', 'misses') +
```

and add the helper next to `defiTile`:

```js
  function missesSub() {
    const n = NL.screens.misses.worst(25).length;
    return n ? t.missesTitle(n) : t.missesNone;
  }
```

- [ ] **Step 6: Make the library's "fragiles" filter mean what it says**

In `src/ui/library.js`, replace line 21:

```js
        : filter === 'zwak' ? seen.filter(it => NL.srs.stageOf(it) < 3)
```

with:

```js
        /* « Fragiles » = ce que tu rates vraiment, pas ce qui a un barreau bas.
           Un mot rencontré hier a un barreau bas et n'est pas fragile. */
        : filter === 'zwak' ? seen.filter(it => { const r = NL.state.rec(it.id); return r && r.lapses > 0; })
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `node test/smoke.js "$(pwd)"`
Expected: PASS.

Add the screen to `test/sim.js`'s list of rendered screens, then run `node test/sim.js "$(pwd)"`.
Expected: PASS.

- [ ] **Step 8: Run the whole suite and commit**

```bash
sh test/run-all.sh
sh build.sh
git add src/ test/ build.sh index.html artifact.html
git commit -m "feat: show what you actually keep getting wrong

logReview has recorded every answer since September and state.logs exposed it;
no screen read it. Meanwhile the 'fragiles' filter called an item weak when its
rung was low, which is not the same thing — a word met yesterday has a low rung
and is not weak.

The new screen ranks items by real lapses over the last sixty days and can start
a session on exactly those. The filter now keys off lapses. A log entry naming an
item that no longer exists is skipped rather than throwing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 9: The content guards

The content is about to grow tenfold with no native reviewer. Everything a machine can check, a machine checks. The de/het guard already shipped; these are the other four from the spec's table.

**Files:**
- Create: `test/content.js`, `test/data/nl-words.txt.gz`, `test/tools/build-wordlist.js`
- Modify: `test/run-all.sh`, `TESTING.md`, `ATTRIBUTION.md`

**Interfaces:**
- Consumes: `NL.content.allItems()`, `NL.srs.RUNGS`, `NL.srs.supports`, `NL.ex.get`, `NL.ex.registry`.
- Produces: nothing other code depends on.

- [ ] **Step 1: Build the word list**

Create `test/tools/build-wordlist.js`:

```js
/* La liste de formes néerlandaises que `test/content.js` consulte pour
   l'orthographe. Des FAITS — un mot existe ou non — donc aucune licence ne
   retombe sur le dépôt. Voir ATTRIBUTION.md.

     node test/tools/build-wordlist.js
   Télécharge, fusionne, compresse. ~1,2 Mo versionné au lieu de 4,5. */
const fs = require('fs'), path = require('path'), zlib = require('zlib'), https = require('https');
const OUT = path.join(__dirname, '..', 'data', 'nl-words.txt.gz');
const SOURCES = [
  'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/wordlist.txt',
  'https://raw.githubusercontent.com/LibreOffice/dictionaries/master/nl_NL/nl_NL.dic'
];

const fetch = url => new Promise((res, rej) => {
  https.get(url, r => {
    if (r.statusCode !== 200) return rej(new Error(url + ' -> ' + r.statusCode));
    const chunks = [];
    r.on('data', c => chunks.push(c)).on('end', () => res(Buffer.concat(chunks).toString('latin1')));
  }).on('error', rej);
});

Promise.all(SOURCES.map(fetch)).then(([opentaal, hunspell]) => {
  const words = new Set();
  opentaal.split('\n').forEach(w => { w = w.trim().toLowerCase(); if (w) words.add(w); });
  hunspell.split('\n').slice(1).forEach(l => {
    const w = l.split('/')[0].trim().toLowerCase();
    if (w) words.add(w);
  });
  const sorted = [...words].sort();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, zlib.gzipSync(Buffer.from(sorted.join('\n'), 'utf8'), { level: 9 }));
  console.log('formes : ' + sorted.length);
  console.log('écrit  : ' + OUT + '  (' + Math.round(fs.statSync(OUT).size / 1024) + ' Ko)');
});
```

Run: `node test/tools/build-wordlist.js`
Expected: around 440,000 forms, roughly 1.2 MB written.

- [ ] **Step 2: Write the failing guards**

Create `test/content.js`:

```js
/* Quatre contrôles mécaniques sur le contenu. Le contenu va être multiplié par
   dix et il n'y a pas de relecteur néerlandophone : tout ce qu'une machine peut
   vérifier, elle le vérifie.

   Ce que ces contrôles NE voient pas : l'idiome, le registre, l'ordre des mots,
   et l'article devant un AUTRE nom que le mot drillé. Voir TESTING.md. */
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');
const ROOT = process.argv[2] || path.join(__dirname, '..');

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

/* ---- le cours, chargé comme l'application le charge ---- */
const store = {};
const ctx = {
  console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
  Math, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  },
  navigator: { onLine: true }, location: { hash: '', protocol: 'file:' },
  document: {
    readyState: 'complete', documentElement: { setAttribute() {}, removeAttribute() {} },
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, activeElement: { tagName: 'BODY' }
  }
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
ctx.addEventListener = () => {};
vm.createContext(ctx);
fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8').match(/SRC="([\s\S]*?)"/)[1]
  .split('\n').map(s => s.trim()).filter(Boolean)
  .forEach(f => {
    try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
    catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
  });
const NL = ctx.NL;

NL.state.open().then(() => {
  NL.content.refresh();
  const units = NL.content.units;
  const items = NL.content.allItems();
  console.log('CONTENU — ' + items.length + ' éléments');

  /* ======== 1. orthographe ======== */
  /* Exceptions flamandes voulues. La raison est obligatoire. */
  const FLEMISH = {
    hey: 'salutation flamande', allez: 'interjection empruntée au français',
    jaja: 'redoublement parlé', neenee: 'redoublement parlé', nie: 'flamand pour « niet »',
    asteblieft: 'contraction parlée de « alstublieft »',
    bancontact: 'le système de paiement belge, nom propre',
    recyclagepark: 'belgicisme (le nord dit « milieupark »)',
    spreekte: 'forme dialectale, assumée dans le champ `be`'
  };
  const words = new Set(
    zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'data', 'nl-words.txt.gz')))
      .toString('utf8').split('\n')
  );
  const strings = [];
  units.forEach(u => {
    (u.words || []).forEach((w, i) => {
      strings.push([w.nl, u.id + ':w' + i]);
      if (w.be) strings.push([w.be, u.id + ':w' + i + ' (be)']);
      (w.drills || []).forEach((d, j) => strings.push([d.nl, u.id + ':w' + i + ' ex' + j]));
    });
    (u.phrases || []).forEach((p, i) => {
      strings.push([p.nl, u.id + ':p' + i]);
      if (p.be) strings.push([p.be, u.id + ':p' + i + ' (be)']);
    });
  });
  const unknown = new Map();
  let tokens = 0;
  strings.forEach(([text, where]) => {
    if (typeof text !== 'string') return;
    text.toLowerCase().replace(/[{}]/g, ' ').split(/[^a-zà-ÿ'’-]+/).forEach(tok => {
      tok = tok.replace(/^[-'’]+|[-'’]+$/g, '');
      if (tok.length < 2) return;
      tokens++;
      if (words.has(tok) || FLEMISH[tok]) return;
      if (words.has(tok.replace(/[’']s$/, ''))) return;
      if (tok.indexOf('-') >= 0 && tok.split('-').every(p => p.length < 2 || words.has(p))) return;
      if (!unknown.has(tok)) unknown.set(tok, where);
    });
  });
  unknown.forEach((where, tok) => ok(false,
    'mot inconnu du néerlandais : « ' + tok +' »  [' + where + '] — ' +
    'corriger, ou l’inscrire dans FLEMISH avec sa raison'));
  console.log('  orthographe     ' + tokens + ' jetons, ' + unknown.size + ' inconnu(s)');

  /* ======== 2. tout exercice promis doit se construire ======== */
  /* src/ui/session.js saute en silence un élément dont l'exercice échoue : un
     mot peut donc n'être jamais drillé sans que rien ne le dise. */
  let pairs = 0, broken = 0;
  items.forEach(it => {
    const types = new Set();
    (NL.srs.RUNGS[it.kind] || NL.srs.RUNGS.word).forEach(rung => rung.forEach(n => types.add(n)));
    let any = false;
    types.forEach(name => {
      if (!NL.srs.supports(it, name)) return;
      const ex = NL.ex.get(name);
      if (!ex || !ex.build) return;
      pairs++;
      try {
        if (!ex.build(it)) throw new Error('build n’a rien rendu');
        any = true;
      } catch (e) {
        broken++;
        ok(false, 'supports() promet « ' + name + ' » mais build() échoue sur ' + it.id +
          ' « ' + it.nl + ' » : ' + e.message);
      }
    });
    ok(any, 'aucun exercice ne peut être construit pour ' + it.id + ' « ' + it.nl + ' »');
  });
  console.log('  exercices       ' + pairs + ' paires, ' + broken + ' échec(s)');

  /* ======== 3. une phrase d'exemple n'emprunte pas en avant ======== */
  /* src/content/examples.js s'impose déjà « du vocabulaire déjà rencontré ».
     Non vérifié, la règle n'était respectée que 85 % du temps. */
  const GRAMMAR = new Set(('ik ge gij je jij u hij ze zij we wij het de een is ben bent zijn was heb hebt ' +
    'heeft had kan kunt kun wil wilt moet mag ga gaat gaan doe doet niet nie geen en of maar want dat dit ' +
    'die deze er hier daar ook nog al wel te in op van met voor aan bij naar uit om over door tot me mijn ' +
    'uw zo heel veel wat wie waar hoe nu dan als zich eens even graag ja nee').split(' '));
  const firstUnit = new Map();
  units.forEach((u, ui) => ['words', 'phrases'].forEach(k => (u[k] || []).forEach(it => {
    String(it.nl || '').toLowerCase().split(/[^a-zà-ÿ'’-]+/).forEach(tok => {
      if (tok.length > 1 && (!firstUnit.has(tok) || firstUnit.get(tok) > ui)) firstUnit.set(tok, ui);
    });
  })));
  let ahead = 0, sentences = 0;
  units.forEach((u, ui) => (u.words || []).forEach((w, i) => (w.drills || []).forEach((d, j) => {
    sentences++;
    const borrowed = String(d.nl || '').toLowerCase().split(/[^a-zà-ÿ'’-]+/).filter(tok =>
      tok.length > 1 && !GRAMMAR.has(tok) && firstUnit.has(tok) && firstUnit.get(tok) > ui);
    if (borrowed.length) {
      ahead++;
      console.log('  (à revoir) ' + u.id + ':w' + i + ' ex' + j + ' emprunte « ' +
        borrowed.join(', ') + ' » : ' + d.nl);
    }
  })));
  /* Le contenu existant en compte 62 : le seuil descend à mesure que la phase 0
     les réécrit, et ne doit jamais remonter. */
  const AHEAD_BUDGET = 62;
  ok(ahead <= AHEAD_BUDGET, ahead + ' phrases empruntent en avant, budget ' + AHEAD_BUDGET +
    ' — baisser le budget quand on en corrige, jamais le lever');
  console.log('  séquence        ' + ahead + ' / ' + sentences + ' phrases empruntent en avant');

  /* ======== 4. doublons ======== */
  /* Un mot enseigné deux fois est drillé deux fois, et compte deux fois pour le
     seuil de 75 %. */
  const seen = new Map();
  let dupes = 0;
  units.forEach(u => ['words', 'phrases'].forEach(k => (u[k] || []).forEach((it, i) => {
    const key = String(it.nl || '').toLowerCase().trim();
    if (seen.has(key)) {
      dupes++;
      console.log('  (à revoir) doublon « ' + it.nl + ' » : ' + seen.get(key) + ' et ' + u.id + ':' + k[0] + i);
    } else seen.set(key, u.id + ':' + k[0] + i);
  })));
  const DUPE_BUDGET = 8;
  ok(dupes <= DUPE_BUDGET, dupes + ' doublons, budget ' + DUPE_BUDGET +
    ' — baisser le budget quand on en supprime, jamais le lever');
  console.log('  doublons        ' + dupes);

  console.log('\n' + (fails === 0 ? checks + ' CONTRÔLES PASSÉS' : fails + ' CONTRÔLE(S) ÉCHOUÉ(S)'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
```

- [ ] **Step 3: Run it and confirm each guard reports what the probes found**

Run: `node test/content.js "$(pwd)"`
Expected: PASS, with `orthographe … 0 inconnu(s)`, `exercices … 0 échec(s)`, `séquence 62 / 414`, `doublons 8`. If spelling reports an unknown word not in `FLEMISH`, that is a real find — fix the content or add the entry with its reason.

- [ ] **Step 4: Prove each guard fails on bad content**

For each of the four, make a temporary edit, run, confirm the failure, then revert:

```bash
# spelling: invent a word
sed -i "s/'de pistolet'/'de pistolat'/" src/content/lexicon.a1.js
node test/content.js "$(pwd)"   # expect: mot inconnu du néerlandais : « pistolat »
git checkout src/content/lexicon.a1.js

# duplicates: lower the budget below the real count
sed -i 's/const DUPE_BUDGET = 8;/const DUPE_BUDGET = 7;/' test/content.js
node test/content.js "$(pwd)"   # expect: 8 doublons, budget 7
sed -i 's/const DUPE_BUDGET = 7;/const DUPE_BUDGET = 8;/' test/content.js
```

- [ ] **Step 5: Wire it into the suite and document it**

In `test/run-all.sh`, add after the `dehet.js` line:

```sh
node test/content.js  "$ROOT"
```

In `TESTING.md`, add to the table:

```
| `content.js` | L'orthographe contre une liste de formes néerlandaises, que chaque exercice promis se construise vraiment, qu'une phrase d'exemple n'emprunte pas de vocabulaire à une unité ultérieure, et les doublons |
```

In `ATTRIBUTION.md`, add below the existing Wiktionary section:

```markdown
## OpenTaal et le dictionnaire hunspell néerlandais — formes de mots

`test/data/nl-words.txt.gz` est l'union de deux listes de formes néerlandaises :

- [OpenTaal](https://github.com/OpenTaal/opentaal-wordlist) — `wordlist.txt`, flexions comprises
- le dictionnaire néerlandais de [LibreOffice](https://github.com/LibreOffice/dictionaries) — `nl_NL/nl_NL.dic`

Elle ne contient que des **faits** : un mot existe, ou il n'existe pas. Aucune
définition, aucun exemple. Elle sert au contrôle d'orthographe de
`test/content.js` et ne part jamais dans le navigateur.

Régénérer : `node test/tools/build-wordlist.js`
```

- [ ] **Step 6: Run the whole suite and commit**

```bash
sh test/run-all.sh
git add test/content.js test/tools/build-wordlist.js test/data/nl-words.txt.gz test/run-all.sh TESTING.md ATTRIBUTION.md
git commit -m "test: four content guards, because the content is about to grow tenfold

There is no native reviewer, so everything a machine can check, a machine checks:
spelling against 440,000 Dutch word forms, that every exercise supports() promises
really builds, that an example sentence does not borrow vocabulary from a later
unit, and duplicates.

The last two carry budgets rather than demanding zero: the content has 62
forward-borrowing sentences and 8 duplicated words today. The budget comes down as
phase 0 fixes them and must never go up.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 10: CI checks the committed build matches the sources

`index.html` and `artifact.html` are tracked build outputs. Vercel rebuilds, so the live app is always right, but the repo's `index.html` — which the README tells people to open directly — can silently drift.

**Files:**
- Modify: `.github/workflows/test.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Prove the gap exists**

```bash
sed -i "s/'de pistolet'/'de pistolet '/" src/content/lexicon.a1.js
sh test/run-all.sh
```
Expected: the suite PASSES while `index.html` no longer matches `src/`. That is the gap.

```bash
git checkout src/content/lexicon.a1.js
```

- [ ] **Step 2: Add the check**

In `.github/workflows/test.yml`, add a step after `Build and test`:

```yaml
      # index.html et artifact.html sont versionnés : le README invite à ouvrir
      # index.html directement, donc il doit correspondre aux sources. Vercel
      # reconstruit de son côté, mais le fichier du dépôt peut dériver en silence.
      - name: Committed build matches the sources
        run: |
          sh build.sh
          git diff --exit-code -- index.html artifact.html \
            || { echo "index.html / artifact.html sont périmés : lancer sh build.sh et committer."; exit 1; }
```

- [ ] **Step 3: Verify it would catch a stale build**

```bash
sed -i "s/'de pistolet'/'de pistolet '/" src/content/lexicon.a1.js
git stash -- index.html artifact.html 2>/dev/null || true
sh build.sh
git diff --exit-code -- index.html artifact.html; echo "exit=$?"
```
Expected: `exit=1`.

```bash
git checkout src/content/lexicon.a1.js && sh build.sh && git checkout index.html artifact.html
```

- [ ] **Step 4: Run the whole suite and commit**

```bash
sh test/run-all.sh
git add .github/workflows/test.yml
git commit -m "ci: fail when the committed build is stale

index.html and artifact.html are tracked build outputs and the README tells people
to open index.html directly. Vercel rebuilds from source so the live app was never
wrong, but the file in the repo could drift from src/ with nothing noticing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Done when

- `sh test/run-all.sh` is green, with `dehet.js` and `content.js` in the list.
- `node test/pace.js "$(pwd)" 200` shows a non-zero new-word count every day until the catalogue is exhausted.
- Three days of real study on the device, with new words appearing each day. That is the only measure that counts, and no simulation substitutes for it.
