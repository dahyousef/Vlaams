/* Synchronisation : deux appareils, un faux Supabase partagé.
   Ce qui est vérifié : l'adoption d'une progression anonyme, le passage d'un
   appareil à l'autre, la révision la plus récente qui gagne, la fusion des
   réglages, la boîte d'envoi qui survit à une panne réseau, l'effacement quand un
   autre compte se connecte, et l'inertie totale sans configuration. */
const browser = require('./lib/browser');
const { text, count } = require('./lib/langs');
const { dueReviews } = require('./lib/seed');
const ROOT = process.argv[2];

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- faux serveur ---------------- */
const { fakeSupabase, KEYS, keyOf, clone } = require('./lib/supabase');
const { server, fakeLib, rowsFor } = fakeSupabase();

/* ---------------- un appareil ---------------- */
function device(name, withConfig, store, idb, whole) {
  const dev = { name, store: store || {} };
  /* Des minuteurs réels : la boîte d'envoi se vide après un délai, et c'est ce
     délai que le test attend. app.js est laissé de côté, et boot() démarre ; sur la page
     entière (whole), app.js tourne et démarre seul, et les champs que lit l'écran se
     remplissent dans dev.fields.
     idb : true pour un IndexedDB neuf, ou le `idb` d'un appareil pour le recharger. */
  const B = browser.open({
    root: ROOT, timers: 'real', skip: whole ? [] : [browser.APP], byId: whole ? 'stub' : null,
    store: dev.store, idb: idb || null, ua: 'Mozilla/5.0 Chrome/120',
    config: withConfig ? { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon' } : null,
    supabase: withConfig ? fakeLib(dev) : null
  });
  const ctx = B.ctx, root = B.app;
  dev.ctx = ctx; dev.NL = B.NL; dev.root = root; dev.idb = B.idb; dev.fields = B.fields;
  dev.boot = async () => {
    await dev.NL.state.open(); dev.NL.content.refresh();
    dev.NL.ui.bind(root);
    return dev.NL.sync.init();
  };
  dev.signIn = async email => {
    await dev.NL.sync.signIn(email);
    const r = await dev.NL.sync.verifyCode(email, '123456');
    await wait(5);
    return r;
  };
  dev.offline = v => { ctx.navigator.onLine = !v; (B.listeners[v ? 'offline' : 'online'] || []).forEach(f => f()); };
  dev.tap = B.tap;
  dev.fire = type => (B.listeners[type] || []).forEach(f => f());
  return dev;
}

/* La page entière : un appareil configuré où app.js tourne et le démarre seul, sans boot().
   Les champs que l'écran compte lit se remplissent dans dev.fields. */
const page = name => device(name, true, null, null, true);

const items = NL => NL.content.allItems();
/* Le texte qu'un appareil montre, balises retirées. */
const shown = dev => text(dev.root.innerHTML);

(async () => {
  console.log('SANS CONFIGURATION');
  {
    const d = device('local', false);
    const user = await d.boot();
    ok(d.NL.sync.enabled === false, 'sync should be off without config');
    ok(user === null, 'init should resolve null without config');
    d.NL.srs.grade(items(d.NL)[0], true, { ex: 'pick' });
    await wait(10);
    ok(!d.store['vlaams/outbox'], 'an outbox was written with sync off');
    ok(d.NL.sync.status().state === 'off', 'status should read off');
    const r = await d.NL.sync.signIn('a@b.c');
    ok(r.error === 'off', 'signIn should refuse when off');
    console.log('  inerte : aucun envoi, aucune boîte');
  }

  console.log('\nAPPAREIL A — progression anonyme puis connexion');
  const A = device('A', true);
  ok(await A.boot() === null, 'A should start signed out');
  const its = items(A.NL);
  its.slice(0, 12).forEach((it, i) => A.NL.srs.grade(it, i % 3 !== 0, { ex: 'type' }));
  A.NL.state.setMeta({ xp: 120, theme: 'dark' });
  const word = A.NL.state.addCustom({ nl: 'de goesting', fr: 'l’envie' });
  ok(A.NL.sync.status().pending > 0, 'writes before sign-in should still be queued');
  ok(server.requests === 0, 'nothing should reach the server while signed out');

  const res = await A.signIn('learner@example.com');
  ok(!res.error, 'code sign-in failed: ' + res.error);
  const uid = A.NL.sync.user && A.NL.sync.user.id;
  ok(!!uid, 'A has no user after verifyCode');
  ok(A.store['vlaams/owner'] === uid, 'owner not recorded');
  ok(A.redirect === 'https://vlaams.example/', 'magic link should come back to the app: ' + A.redirect);
  ok(rowsFor('srs_records', uid).length === 12, 'expected 12 records on the server, got ' + rowsFor('srs_records', uid).length);
  ok(rowsFor('custom_words', uid).length === 1, 'custom word not pushed');
  ok(rowsFor('review_log', uid).length === 12, 'review log not pushed: ' + rowsFor('review_log', uid).length);
  const sm = rowsFor('user_meta', uid)[0];
  ok(sm && sm.data.xp === 120 && sm.data.theme === 'dark', 'meta not pushed');
  ok(A.NL.sync.status().pending === 0, 'outbox should be empty after adoption');
  ok(A.NL.sync.status().state === 'idle', 'state should be idle, is ' + A.NL.sync.status().state);
  console.log('  adoptée : 12 fiches, 1 mot, 12 lignes de journal, réglages');

  const bad = await A.NL.sync.verifyCode('learner@example.com', '000000');
  ok(!!bad.error, 'a wrong code must fail');

  console.log('\nAPPAREIL B — même compte, appareil vierge');
  const B = device('B', true);
  await B.boot();
  await B.signIn('learner@example.com');
  ok(B.NL.sync.user.id === uid, 'B signed into another account');
  ok(B.NL.state.seenCount() === 12, 'B should have pulled 12 records, has ' + B.NL.state.seenCount());
  ok(B.NL.state.meta().xp === 120, 'B xp not pulled');
  ok(B.NL.state.customs().some(c => c.nl === 'de goesting'), 'B custom word not pulled');
  ok(B.NL.state.logs().length === 12, 'B log not pulled: ' + B.NL.state.logs().length);
  const recA = A.NL.state.rec(its[1].id), recB = B.NL.state.rec(its[1].id);
  ok(recB && recA.stage === recB.stage && recA.due === recB.due, 'record content differs between devices');
  console.log('  B voit tout : ' + B.NL.state.seenCount() + ' fiches, xp ' + B.NL.state.meta().xp);

  console.log('\nLA PLUS RÉCENTE GAGNE');
  await wait(3);
  B.NL.srs.grade(its[1], true, { ex: 'cloze' });
  await B.NL.sync.flush();
  const bStage = B.NL.state.rec(its[1].id).stage;
  A.NL.state.setMeta({ xp: 130 });           // A écrit ses réglages, pas cette fiche
  await A.NL.sync.pull();
  ok(A.NL.state.rec(its[1].id).stage === bStage, 'A did not take the newer record from B');
  ok(A.NL.state.meta().xp === 130, 'A lost its own newer xp in the merge');

  /* Conflit : les deux modifient la même fiche hors ligne ; la plus tardive gagne partout. */
  A.offline(true); B.offline(true);
  A.NL.srs.grade(its[2], false, { ex: 'type' });
  await wait(5);
  B.NL.srs.grade(its[2], true, { ex: 'type' });
  const winner = B.NL.state.rec(its[2].id).stage;
  ok(A.NL.sync.status().state === 'offline', 'A should report offline');
  B.offline(false); await B.NL.sync.flush();
  A.offline(false); await A.NL.sync.flush(); await A.NL.sync.pull();
  await B.NL.sync.pull();
  ok(server.tables.srs_records.get(uid + '|' + its[2].id).data.stage === winner, 'server kept the older edit');
  ok(A.NL.state.rec(its[2].id).stage === winner, 'A kept its older edit after pull');
  ok(B.NL.state.rec(its[2].id).stage === winner, 'B lost its newer edit');
  console.log('  conflit hors ligne résolu pour la révision la plus tardive');

  /* Réglages : A, hors ligne, gagne de l'XP pendant que B change le thème. */
  A.offline(true);
  A.NL.state.setMeta({ xp: A.NL.state.meta().xp + 5 });
  await wait(3);
  B.NL.state.setMeta({ xp: 500, theme: 'light' });
  await B.NL.sync.flush();
  A.offline(false); await A.NL.sync.flush();
  const srvMeta = rowsFor('user_meta', uid)[0].data;
  ok(srvMeta.xp === 500 && srvMeta.theme === 'light', 'offline meta push clobbered newer settings: ' + srvMeta.xp + ' ' + srvMeta.theme);
  ok(A.NL.state.meta().theme === 'light', 'A did not take the newer theme when pushing');

  console.log('\nFUSION DES RÉGLAGES');
  const M = A.NL.sync.mergeMeta;
  const m1 = M({ xp: 10, streak: 3, best: 3, lastDay: '2026-09-16', theme: 'dark', updatedAt: 5, scenariosDone: ['a'], progress: { reached: 0, scenariosDone: ['a'], listenDone: [] }, doneDay: '2026-09-17', doneToday: 4, placed: true },
               { xp: 40, streak: 1, best: 2, lastDay: '2026-09-17', theme: 'light', updatedAt: 9, scenariosDone: ['b'], progress: { reached: 0, scenariosDone: ['b'], listenDone: [] }, doneDay: '2026-09-17', doneToday: 7, placed: false });
  ok(m1.xp === 40, 'xp should take the max');
  ok(m1.streak === 1 && m1.lastDay === '2026-09-17', 'streak should follow the latest day');
  ok(m1.best === 3, 'best should never drop');
  ok(m1.theme === 'light', 'newer setting should win');
  ok(m1.scenariosDone.length === 2, 'done lists should union');
  ok(m1.doneToday === 7, 'same-day counter should take the max');
  ok(m1.placed === true, 'placement should never be undone');
  /* Remise à zéro : ce qui relève de la progression suit le côté qui la porte,
     même si l'autre appareil a été modifié plus tard. */
  const m4 = M({ resetAt: 500, reached: 0, scenariosDone: [], progress: { reached: 0, scenariosDone: [], listenDone: [] }, xp: 9, updatedAt: 500 },
               { resetAt: 0, reached: 3, scenariosDone: ['a', 'b'], progress: { reached: 3, scenariosDone: ['a', 'b'], listenDone: [] }, xp: 4, updatedAt: 900 });
  ok(m4.reached === 0 && m4.scenariosDone.length === 0, 'a stale device gave back what the reset erased: ' + JSON.stringify([m4.reached, m4.scenariosDone]));
  ok(m4.resetAt === 500 && m4.xp === 9, 'the reset stamp or the score was lost in the merge');
  /* Le robot de sauvegarde écrit lastBackup sans toucher à updated_at : la
     fusion doit le garder même quand l'autre côté est « plus récent ». */
  const m3 = M({ xp: 5, updatedAt: 50 }, { xp: 4, lastBackup: 4242, updatedAt: 10 });
  ok(m3.lastBackup === 4242, 'merge dropped the backup stamp written by the robot');
  /* …et quand l'appareil porte déjà une date à lui : le robot ne touche pas à
     updatedAt, les deux côtés sont à égalité et c'est la date qui doit trancher. */
  const m5 = M({ xp: 5, lastBackup: 1000, updatedAt: 50 }, { xp: 5, lastBackup: 4242, updatedAt: 50 });
  ok(m5.lastBackup === 4242, 'a device kept its older backup date over the robot\'s: ' + m5.lastBackup);

  /* Ce que fait le robot chaque matin, puis une séance sur un appareil qui a déjà
     vu une sauvegarde : l'écran Réglages doit montrer la dernière, et l'envoi ne
     doit pas rendre au serveur la date d'avant. */
  {
    const robot = when => {
      const row = rowsFor('user_meta', uid)[0];
      row.data = Object.assign({}, row.data, { lastBackup: when });
    };
    const first = Date.now() - 2 * 86400000, second = Date.now() - 3600000;
    robot(first);
    await A.NL.sync.pull();
    ok(A.NL.state.meta().lastBackup === first, 'the fixture is wrong: A did not take its first backup date');
    robot(second);
    await A.NL.sync.pull();
    ok(A.NL.state.meta().lastBackup === second, 'A shows the backup before last: ' + new Date(A.NL.state.meta().lastBackup).toISOString());
    A.NL.state.setMeta({ xp: A.NL.state.meta().xp + 1 });
    await A.NL.sync.flush();
    const back = rowsFor('user_meta', uid)[0].data.lastBackup;
    ok(back === second, 'A gave the server back an older backup date: ' + new Date(back).toISOString());
  }

  const m2 = M({ doneDay: '2026-09-18', doneToday: 2, updatedAt: 1 }, { doneDay: '2026-09-17', doneToday: 50, updatedAt: 9 });
  ok(m2.doneDay === '2026-09-18' && m2.doneToday === 2, 'a later day should reset the counter');

  console.log('\nPANNE RÉSEAU — la boîte survit');
  server.down = true;
  its.slice(20, 25).forEach(it => A.NL.srs.grade(it, true, { ex: 'pick' }));
  await A.NL.sync.flush();
  ok(A.NL.sync.status().state === 'error', 'failed flush should show error');
  ok(A.NL.sync.status().pending >= 10, 'outbox lost writes on failure: ' + A.NL.sync.status().pending);
  const persisted = JSON.parse(A.store['vlaams/outbox']);
  ok(Object.keys(persisted.recs).length === 5, 'outbox not persisted to storage');
  /* Un rechargement de page pendant la panne : la boîte doit se relire. */
  const A2 = device('A2', true, JSON.parse(JSON.stringify(A.store)));
  ok(A2.NL.sync.status().pending === A.NL.sync.status().pending, 'outbox not reloaded after a page reload: ' + A2.NL.sync.status().pending);
  server.down = false;
  await A.NL.sync.flush();
  ok(A.NL.sync.status().pending === 0, 'outbox not drained after recovery');
  ok(rowsFor('srs_records', uid).length === 17, 'expected 17 records after recovery, got ' + rowsFor('srs_records', uid).length);
  console.log('  5 fiches gardées pendant la panne, envoyées au retour');

  console.log('\nMOT SUPPRIMÉ');
  A.NL.state.delCustom(word.id);
  await A.NL.sync.flush();
  await B.NL.sync.pull();
  ok(!B.NL.state.customs().some(c => c.id === word.id), 'deletion did not reach B');

  console.log('\nDÉCONNEXION ET AUTRE COMPTE');
  await B.NL.sync.signOut();
  ok(B.NL.state.seenCount() === 0, 'sign-out should wipe the device');
  ok(!B.store['vlaams/owner'], 'owner should be cleared');
  ok(B.NL.sync.user === null, 'user should be null after sign-out');
  await B.signIn('other@example.com');
  ok(B.NL.state.seenCount() === 0, 'second account saw the first account\'s records');
  ok(rowsFor('srs_records', B.NL.sync.user.id).length === 0, 'second account inherited rows');

  /* Appareil déjà rattaché à un compte, puis un autre se connecte sans passer par la déconnexion. */
  const C = device('C', true);
  await C.boot();
  await C.signIn('learner@example.com');
  ok(C.NL.state.seenCount() === 17, 'C should have 17 records');
  await wait(450);                            // la sauvegarde locale est différée
  delete C.store['sb-session'];
  const C2 = device('C2', true, C.store);
  await C2.boot();
  ok(C2.NL.state.seenCount() === 17, 'C2 should reload local data');
  await C2.signIn('third@example.com');
  ok(C2.NL.state.seenCount() === 0, 'switching account must wipe the previous learner');
  ok(rowsFor('srs_records', C2.NL.sync.user.id).length === 0, 'previous learner leaked into the third account');
  ok(rowsFor('srs_records', uid).length === 17, 'first account lost rows');
  console.log('  aucun mélange entre comptes');

  console.log('\nREMISE À ZÉRO');
  {
    /* Deux appareils connectés au même compte, tous deux avec de la progression. */
    const R1 = device('R1', true), R2 = device('R2', true);
    await R1.boot(); await R1.signIn('reset@example.com');
    const rid = R1.NL.sync.user.id, ri = items(R1.NL);
    ri.slice(0, 10).forEach(it => R1.NL.srs.grade(it, true, { ex: 'type' }));
    R1.NL.state.setMeta({ xp: 77, theme: 'dark', reached: 2, scenariosDone: ['bakker', 'dokter'] });
    R1.NL.state.addCustom({ nl: 'de koffiekoek', fr: 'la viennoiserie' });
    await R1.NL.sync.flush();
    await R2.boot(); await R2.signIn('reset@example.com');
    ok(R2.NL.state.seenCount() === 10 && rowsFor('srs_records', rid).length === 10, 'the fixture is wrong: both devices should hold 10 records');

    /* R2, hors ligne, répond encore à un élément : la réponse attend dans sa boîte. */
    R2.offline(true);
    R2.NL.srs.grade(ri[0], true, { ex: 'type' });
    await wait(5);

    R1.NL.state.resetProgress();
    await R1.NL.sync.flush();
    ok(R1.NL.state.seenCount() === 0 && R1.NL.state.logs().length === 0, 'the reset left progress on the device that asked for it');
    ok(rowsFor('srs_records', rid).length === 0, 'the reset left ' + rowsFor('srs_records', rid).length + ' records on the server');
    ok(rowsFor('review_log', rid).length === 0, 'the reset left the answer history on the server');
    ok(R1.NL.state.meta().xp === 77 && R1.NL.state.meta().theme === 'dark', 'the reset took the score or the settings with it');
    ok(R1.NL.state.customs().length === 1 && rowsFor('custom_words', rid).length === 1, 'the reset took the learner’s own words with it');
    ok(R1.NL.state.meta().reached === 0, 'the frontier survived the reset');
    ok(R1.NL.state.meta().scenariosDone.length === 0, 'after the reset the device still claims ' + R1.NL.state.meta().scenariosDone.length + ' conversations done');
    ok(rowsFor('user_meta', rid)[0].data.scenariosDone.length === 0, 'after the reset the server still lists conversations as done');

    /* La synchro suivante ne doit rien rendre. */
    await R1.NL.sync.pull();
    ok(R1.NL.state.seenCount() === 0, 'the next synchronisation restored ' + R1.NL.state.seenCount() + ' deleted records');

    /* R2 revient en ligne avec sa copie périmée et une réponse en attente. */
    R2.offline(false);
    await R2.NL.sync.flush();
    ok(rowsFor('srs_records', rid).length === 0, 'a stale device pushed ' + rowsFor('srs_records', rid).length + ' deleted record(s) back to the server');
    await R2.NL.sync.pull();
    ok(R2.NL.state.seenCount() === 0, 'the second device still shows ' + R2.NL.state.seenCount() + ' records after the reset');
    ok(R2.NL.state.meta().reached === 0, 'the second device kept its frontier');
    ok(R2.NL.state.meta().scenariosDone.length === 0, 'the second device still claims ' + R2.NL.state.meta().scenariosDone.length + ' conversations done');
    ok(R2.NL.state.meta().xp === 77 && R2.NL.state.customs().length === 1, 'the second device lost the score or the own words');

    /* Ce qui est appris APRÈS la remise à zéro circule normalement. */
    await wait(3);
    R2.NL.srs.grade(ri[3], true, { ex: 'type' });
    await R2.NL.sync.flush();
    await R1.NL.sync.pull();
    ok(R1.NL.state.seenCount() === 1 && rowsFor('srs_records', rid).length === 1, 'progress made after the reset did not travel');
    R2.NL.state.setMeta({ scenariosDone: ['bakker'] });
    await R2.NL.sync.flush();
    await R1.NL.sync.pull();
    ok(R1.NL.state.meta().scenariosDone.join() === 'bakker', 'a conversation done after the reset did not travel: ' + JSON.stringify(R1.NL.state.meta().scenariosDone));

    /* Un appareil neuf qui se connecte ne voit que l'après. */
    const R3 = device('R3', true);
    await R3.boot(); await R3.signIn('reset@example.com');
    ok(R3.NL.state.seenCount() === 1, 'a new device sees ' + R3.NL.state.seenCount() + ' records, expected the single one made since the reset');
    console.log('  effacé ici, sur le serveur et sur le second appareil ; réglages, score et mots gardés');

    /* Hors ligne au moment de la remise à zéro, puis page rechargée : le serveur
       est effacé AVANT d'être relu. */
    await wait(3);
    R1.offline(true);
    R1.NL.state.resetProgress();
    await wait(450);
    const R1b = device('R1b', true, JSON.parse(JSON.stringify(R1.store)));
    await R1b.boot();
    await wait(20);
    ok(rowsFor('srs_records', rid).length === 0, 'a reset made offline never reached the server');
    ok(R1b.NL.state.seenCount() === 0, 'after an offline reset and a reload, the server gave the progress back');
    console.log('  remise à zéro hors ligne : envoyée au rechargement, avant toute lecture');

    /* Restaurer une sauvegarde après coup reste possible, et se propage. */
    const dump = JSON.parse(JSON.stringify(R3.NL.state.exportAll()));
    ok(R3.NL.state.importAll(dump), 'import refused');
    R3.NL.sync.queueAll(); await R3.NL.sync.flush();
    ok(rowsFor('srs_records', rid).length === 1, 'a backup restored after a reset did not reach the server');
    await R2.NL.sync.pull();
    ok(R2.NL.state.seenCount() === 1, 'a backup restored after a reset did not reach the other device');
    console.log('  une sauvegarde restaurée ensuite se propage');
  }

  console.log('\nMIGRATION — l’ancien moteur');
  {
    const M1 = device('M1', true);
    await M1.boot(); await M1.signIn('old@example.com');
    const mid = M1.NL.sync.user.id, mi = items(M1.NL), EPOCH = M1.NL.state.ENGINE_EPOCH;
    /* De la progression datée d'avant le nouveau moteur, sur l'appareil et le serveur. */
    mi.slice(0, 6).forEach(it => M1.NL.state.setRec({ id: it.id, kind: it.kind, stage: 3, due: EPOCH, interval: 0, ease: 2.5, reps: 1, lapses: 0, last: 0, said: false, retired: false, lastEx: null, updatedAt: EPOCH - 5000 }, true));
    M1.NL.sync.queueAll(); await M1.NL.sync.flush();
    M1.NL.state.setMeta({ dataVersion: 2, xp: 40 });
    await M1.NL.sync.flush();
    ok(rowsFor('srs_records', mid).length === 6, 'the fixture is wrong: 6 old records should be on the server');
    await wait(450);
    const M2 = device('M2', true, JSON.parse(JSON.stringify(M1.store)));
    await M2.NL.state.open();
    ok(M2.NL.state.seenCount() === 6, 'the fixture is wrong: the reloaded device should hold 6 old records');
    ok(M2.NL.state.migrate() === true, 'a device carrying old progress did not migrate');
    ok(M2.NL.state.seenCount() === 0, 'the migration left old progress on the device');
    ok(M2.NL.state.meta().xp === 40, 'the migration took the score');
    ok(M2.NL.state.migrate() === false, 'the migration ran twice');
    M2.NL.content.refresh(); M2.NL.ui.bind(M2.root);
    await M2.NL.sync.init(); await wait(20);
    ok(rowsFor('srs_records', mid).length === 0, 'the migration left ' + rowsFor('srs_records', mid).length + ' old records on the server');
    ok(M2.NL.state.seenCount() === 0, 'the synchronisation gave the old progress back');
    /* Un second appareil qui migre plus tard n'efface pas ce qui a été appris depuis. */
    M2.NL.srs.grade(mi[0], true, { ex: 'type' });
    await M2.NL.sync.flush();
    const M3 = device('M3', true);
    await M3.NL.state.open();
    M3.NL.state.setMeta({ dataVersion: 2 });
    M3.NL.state.migrate(); M3.NL.content.refresh(); M3.NL.ui.bind(M3.root);
    await M3.NL.sync.init(); await M3.signIn('old@example.com');
    ok(rowsFor('srs_records', mid).length === 1, 'a second device migrating later deleted what had been learned since');
    ok(M3.NL.state.seenCount() === 1, 'the second device did not receive the new progress');
    console.log('  ancienne progression effacée partout, une seule fois ; la nouvelle survit à la migration d’un second appareil');
  }

  /* Ce que la version précédente laisse derrière elle est un ÉTAT : des fiches et
     des lignes de journal sans `base`, des réglages qui disent dataVersion 3 et
     resetAt = ENGINE_EPOCH qu'elle a recopiés du serveur, une frontière et des
     listes qui ne sont plus celles de `progress`, qu'elle ne connaît pas. On
     l'écrit tel quel, sans ancienne version. */
  const DAY = 86400000, EPOCH = A.NL.state.ENGINE_EPOCH, oi = items(A.NL);
  const account = email => server.users[email] || (server.users[email] = { id: 'uid-' + Object.keys(server.users).length, email });
  const putRow = (t, row) => server.tables[t].set(keyOf(t, row), clone(row));
  const oldRec = (it, at) => ({ id: it.id, kind: it.kind, stage: 4, due: at + DAY, interval: DAY, ease: 2.5, reps: 5, lapses: 0, last: at, said: false, retired: false, lastEx: 'type', updatedAt: at });
  const oldLog = (it, at) => ({ id: it.id, t: at, ok: false, stage: 1, kind: it.kind, ex: 'type' });
  const zero = () => ({ reached: 0, scenariosDone: [], listenDone: [] });

  console.log('\nUN APPAREIL RESTÉ SUR L’ANCIENNE VERSION');
  {
    /* 1. Un autre appareil a migré ; un onglet de l'ancienne version a ensuite
       recopié les réglages du serveur sans rien effacer. */
    const after = EPOCH + 3600000;
    const touched = progress => ({ 'vlaams/fallback': JSON.stringify({
      srs: oi.slice(0, 4).map(it => oldRec(it, after)).concat([Object.assign(oldRec(oi[4], after), { base: EPOCH })]),
      custom: [],
      meta: Object.assign({ dataVersion: 3, resetAt: EPOCH, xp: 40, reached: 5, scenariosDone: ['bakker', 'dokter', 'markt'], listenDone: ['les1'], updatedAt: after },
        progress ? { progress } : {})
    }) });
    const V1 = device('V1', true, touched({ reached: 1, scenariosDone: ['bakker'], listenDone: [] }));
    await V1.NL.state.open();
    oi.slice(0, 2).forEach(it => V1.NL.state.logReview(oldLog(it, after), true));
    V1.NL.state.logReview(Object.assign(oldLog(oi[4], after), { base: EPOCH }), true);
    ok(V1.NL.state.seenCount() === 5 && V1.NL.state.logs().length === 3, 'the fixture is wrong: the touched device should hold 5 records and 3 log lines');
    ok(V1.NL.state.migrate() === true, 'a device touched by the previous build did not migrate: its dataVersion 3 disarmed it');
    ok(V1.NL.state.seenCount() === 1 && !!V1.NL.state.rec(oi[4].id), 'the migration kept ' + V1.NL.state.seenCount() + ' record(s), expected only the one written by this build');
    ok(V1.NL.state.logs().length === 1, 'the migration kept ' + V1.NL.state.logs().length + ' log line(s), expected only the one written by this build');
    const vm = V1.NL.state.meta();
    ok(vm.reached === 1 && vm.scenariosDone.join() === 'bakker' && vm.listenDone.length === 0,
      'the migration kept the frontier and lists the previous build wrote: ' + JSON.stringify([vm.reached, vm.scenariosDone, vm.listenDone]));
    ok(vm.xp === 40, 'the migration took the score');
    ok(V1.NL.state.migrate() === false, 'the migration ran twice on the touched device');
    /* Des réglages que seule la version précédente a jamais écrits : aucune copie de confiance. */
    const V2 = device('V2', true, touched(null));
    await V2.NL.state.open();
    ok(V2.NL.state.migrate() === true, 'a device whose settings only the previous build wrote did not migrate');
    const v2 = V2.NL.state.meta();
    ok(v2.reached === 0 && v2.scenariosDone.length === 0 && v2.listenDone.length === 0,
      'with no trusted copy the frontier and lists should be zero: ' + JSON.stringify([v2.reached, v2.scenariosDone, v2.listenDone]));
    ok(V2.NL.state.migrate() === false, 'the migration ran twice on a device with no trusted copy');
    console.log('  migration malgré dataVersion 3 : fiches sans base effacées, frontière et listes reprises de progress');
  }

  console.log('\nLE SERVEUR ÉCRIT PAR L’ANCIENNE VERSION APRÈS LA MIGRATION');
  {
    /* 2. Les réglages et les lignes qu'un onglet de l'ancienne version a renvoyés. */
    const after = Date.now() - 3600000;
    ok(after > EPOCH, 'the fixture is wrong: the clock reads before ENGINE_EPOCH');
    const sid = account('stale-tab@example.com').id;
    putRow('user_meta', { user_id: sid, updated_at: after, data: {
      dataVersion: 3, resetAt: EPOCH, xp: 30, reached: 5, scenariosDone: ['bakker', 'dokter', 'markt'], listenDone: [],
      progress: zero(), updatedAt: after } });
    oi.slice(0, 4).forEach(it => {
      putRow('srs_records', { user_id: sid, item_id: it.id, data: oldRec(it, after), updated_at: after });
      putRow('review_log', { user_id: sid, t: after, item_id: it.id, data: oldLog(it, after) });
    });
    const S1 = device('S1', true);
    await S1.boot(); await S1.signIn('stale-tab@example.com');
    ok(S1.NL.state.seenCount() === 0, 'a device on this build imported ' + S1.NL.state.seenCount() + ' record(s) the previous build wrote');
    ok(S1.NL.state.meta().reached === 0, 'a device on this build took the frontier the previous build wrote: ' + S1.NL.state.meta().reached);
    ok(S1.NL.state.meta().scenariosDone.length === 0, 'a device on this build took ' + S1.NL.state.meta().scenariosDone.length + ' conversation(s) the previous build wrote');
    ok(S1.NL.state.logs().length === 0 && S1.NL.srs.mistakes().length === 0,
      '« Ce qui résiste » shows ' + S1.NL.srs.mistakes().length + ' miss(es) the previous build wrote');
    console.log('  rien de ce que l’ancienne version a renvoyé n’est importé');
  }

  console.log('\nUN COMPTE QUE PERSONNE N’A MIGRÉ');
  {
    /* 3. Un appareil neuf — une origine Preview — se connecte à un compte resté
       tel que l'ancien moteur l'a laissé. */
    const before = EPOCH - DAY;
    const lid = account('legacy@example.com').id;
    putRow('user_meta', { user_id: lid, updated_at: before, data: {
      dataVersion: 2, xp: 55, reached: 3, scenariosDone: ['bakker', 'dokter'], listenDone: ['les1'], updatedAt: before } });
    oi.slice(0, 5).forEach(it => {
      putRow('srs_records', { user_id: lid, item_id: it.id, data: oldRec(it, before), updated_at: before });
      putRow('review_log', { user_id: lid, t: before, item_id: it.id, data: oldLog(it, before) });
    });
    const L1 = device('L1', true);
    await L1.boot(); await L1.signIn('legacy@example.com');
    const lm = L1.NL.state.meta();
    ok(L1.NL.state.seenCount() === 0, 'a fresh device took ' + L1.NL.state.seenCount() + ' old-engine record(s) at its first sync');
    ok(lm.reached === 0 && lm.scenariosDone.length === 0 && lm.listenDone.length === 0,
      'a fresh device took the old frontier and lists: ' + JSON.stringify([lm.reached, lm.scenariosDone, lm.listenDone]));
    ok(lm.dataVersion === 3, 'a fresh device took dataVersion ' + lm.dataVersion + ' from the server');
    ok(lm.xp === 55, 'the score did not travel');
    ok(rowsFor('srs_records', lid).length === 0 && rowsFor('review_log', lid).length === 0,
      'the server still holds ' + rowsFor('srs_records', lid).length + ' record(s) and ' + rowsFor('review_log', lid).length + ' log line(s) older than the epoch');
    console.log('  première synchro : rien de l’ancien moteur, et le serveur nettoyé');
  }

  console.log('\nPROGRESSION ANONYME ET COMPTE QUI PORTE UNE REMISE À ZÉRO');
  {
    /* 4a. Le compte a été migré : il porte resetAt = ENGINE_EPOCH. */
    const after = Date.now() - 3600000;
    account('joined@example.com');
    putRow('user_meta', { user_id: account('joined@example.com').id, updated_at: after, data: Object.assign(
      { dataVersion: 3, resetAt: EPOCH, xp: 10, progress: zero(), updatedAt: after }, zero()) });
    const J1 = device('J1', true), J2 = device('J2', true);
    await J1.boot(); await J1.signIn('joined@example.com');
    const jid = J1.NL.sync.user.id;
    await J2.boot();
    oi.slice(0, 5).forEach(it => J2.NL.srs.grade(it, true, { ex: 'type' }));
    await J2.signIn('joined@example.com');
    const onServer = id => rowsFor('srs_records', jid).some(r => r.item_id === id);
    ok(oi.slice(0, 5).every(it => onServer(it.id)), 'anonymous progress was not uploaded to a migrated account: ' + rowsFor('srs_records', jid).length + ' record(s) on the server');
    ok(J2.NL.sync.status().pending === 0, 'something is still pending after sign-in: ' + J2.NL.sync.status().pending);
    await J1.NL.sync.pull();
    ok(oi.slice(0, 5).every(it => !!J1.NL.state.rec(it.id)), 'the account’s other device did not receive the anonymous progress');

    /* 4b. Le compte porte une vraie remise à zéro, postérieure à l'époque ; la
       page est rechargée entre les réponses et la connexion. */
    const resetAt = Date.now() - 2 * 3600000;
    const kid = account('joined-reset@example.com').id;
    putRow('user_meta', { user_id: kid, updated_at: after, data: Object.assign(
      { dataVersion: 3, resetAt, xp: 10, progress: zero(), updatedAt: after }, zero()) });
    oi.slice(10, 12).forEach(it => putRow('srs_records', { user_id: kid, item_id: it.id, updated_at: after,
      data: Object.assign(oldRec(it, after), { stage: 1, reps: 1, base: resetAt }) }));
    const K1 = device('K1', true), K2 = device('K2', true);
    await K1.boot(); await K1.signIn('joined-reset@example.com');
    ok(K1.NL.state.seenCount() === 2, 'the fixture is wrong: the other device should hold the 2 records made since the reset');
    await K2.boot();
    oi.slice(0, 5).forEach(it => K2.NL.srs.grade(it, true, { ex: 'type' }));
    await wait(450);
    const K2b = device('K2b', true, JSON.parse(JSON.stringify(K2.store)));
    await K2b.boot(); await K2b.signIn('joined-reset@example.com');
    const onK = id => rowsFor('srs_records', kid).some(r => r.item_id === id);
    ok(oi.slice(0, 5).every(it => onK(it.id)), 'anonymous progress was not uploaded to an account reset after the epoch: ' + rowsFor('srs_records', kid).length + ' record(s) on the server');
    ok(K2b.NL.sync.status().pending === 0, 'something is still pending after sign-in to a reset account: ' + K2b.NL.sync.status().pending);
    await K1.NL.sync.pull();
    ok(oi.slice(0, 5).every(it => !!K1.NL.state.rec(it.id)) && K1.NL.state.seenCount() === 7,
      'the other device holds ' + K1.NL.state.seenCount() + ' record(s), expected its 2 and the 5 adopted');
    const kLogs = new Set(K1.NL.state.logs().map(l => l.id));
    ok(oi.slice(0, 5).every(it => kLogs.has(it.id)), 'the anonymous answers did not reach the other device’s log');
    console.log('  la progression anonyme rejoint le compte telle quelle, migré ou remis à zéro');
  }

  console.log('\nUN APPAREIL PÉRIMÉ RÉPOND APRÈS LA REMISE À ZÉRO');
  {
    /* 5. Hors ligne, il n'a pas entendu la remise à zéro et répond sur des échelons effacés. */
    const F1 = device('F1', true), F2 = device('F2', true);
    await F1.boot(); await F1.signIn('stale-answer@example.com');
    const fid = F1.NL.sync.user.id;
    oi.slice(0, 6).forEach(it => F1.NL.srs.grade(it, true, { ex: 'type' }));
    await F1.NL.sync.flush();
    await F2.boot(); await F2.signIn('stale-answer@example.com');
    ok(F2.NL.state.seenCount() === 6, 'the fixture is wrong: the second device should hold 6 records');
    F2.offline(true);
    await wait(3);
    F1.NL.state.resetProgress();
    await F1.NL.sync.flush();
    await wait(3);
    const late = [oi[0], oi[1]];
    late.forEach(it => F2.NL.srs.grade(it, true, { ex: 'type' }));
    F2.offline(false);
    await F2.NL.sync.flush(); await F2.NL.sync.pull();
    ok(late.every(it => !F2.NL.state.rec(it.id)), 'the stale device kept ' + late.filter(it => !!F2.NL.state.rec(it.id)).length + ' record(s) built on erased rungs');
    ok(rowsFor('srs_records', fid).length === 0 && rowsFor('review_log', fid).length === 0,
      'the stale device sent ' + rowsFor('srs_records', fid).length + ' record(s) and ' + rowsFor('review_log', fid).length + ' log line(s) built on erased progress');
    await F1.NL.sync.pull();
    ok(F1.NL.state.seenCount() === 0 && F1.NL.state.logs().length === 0,
      'the device that reset received ' + F1.NL.state.seenCount() + ' record(s) and ' + F1.NL.state.logs().length + ' log line(s) from the stale one');
    console.log('  ce qui est bâti sur une progression effacée ne voyage pas');
  }

  console.log('\nL’ANCIENNE VERSION RENVOIE DES RÉGLAGES D’AVANT LA REMISE À ZÉRO');
  {
    /* 5b. La limite 3 de l'ADR 0006 : un onglet de l'ancienne version recopie les
       réglages entiers, et s'ils sont plus récents, renvoie le resetAt et le
       progress d'avant. Il passe par l'upsert du faux serveur, celui qui reflète
       les déclencheurs : keep_newer, puis keep_reset. */
    const P1 = device('P1', true);
    await P1.boot(); await P1.signIn('stale-settings@example.com');
    const pid = P1.NL.sync.user.id;
    P1.NL.state.setMeta({ reached: 2, scenariosDone: ['bakker'] });
    await P1.NL.sync.flush();
    const before = clone(rowsFor('user_meta', pid)[0].data);
    ok(before.progress && before.progress.reached === 2, 'the fixture is wrong: the account should hold a frontier of 2 before the reset: ' + JSON.stringify(before.progress));
    await wait(3);
    P1.NL.state.resetProgress();
    await P1.NL.sync.flush();
    const cut = rowsFor('user_meta', pid)[0].data.resetAt;
    ok(cut > before.resetAt && rowsFor('user_meta', pid)[0].data.progress.reached === 0, 'the fixture is wrong: the reset did not reach the server');
    /* Ce que mergeMeta de l'ancienne version envoie : ses réglages, plus récents,
       avec le resetAt et le progress qu'elle a vus en dernier. */
    const stale = Object.assign(clone(before), { theme: 'dark', updatedAt: Date.now() + 1000 });
    const { error } = await fakeLib(P1).createClient().from('user_meta').upsert(
      { user_id: pid, data: stale, updated_at: stale.updatedAt }, { onConflict: 'user_id' });
    ok(!error, 'the previous build’s settings write was refused: ' + (error && error.message));
    const row = rowsFor('user_meta', pid)[0].data;
    ok(row.resetAt === cut, 'the server took the older resetAt: ' + row.resetAt + ', expected ' + cut);
    ok(row.progress.reached === 0 && row.progress.scenariosDone.length === 0,
      'the server took the older progress: ' + JSON.stringify(row.progress));
    ok(row.theme === 'dark', 'the rest of the write did not land: theme ' + row.theme);
    await P1.NL.sync.pull();
    const pm = P1.NL.state.meta();
    ok(pm.resetAt === cut && pm.reached === 0 && pm.progress.reached === 0,
      'the device that reset took the older reset or frontier at its next pull: ' + JSON.stringify([pm.resetAt, pm.reached, pm.progress]));
    console.log('  le serveur garde la remise à zéro et sa progression ; le reste de l’écriture passe');
  }

  console.log('\nREMISE À ZÉRO SANS COMPTE');
  {
    /* 6a. Un appareil que personne ne possède répond, remet à zéro, puis se connecte. */
    const E1 = device('E1', true), E2 = device('E2', true);
    await E1.boot(); await E1.signIn('eight@example.com');
    const eid = E1.NL.sync.user.id;
    oi.slice(0, 8).forEach(it => E1.NL.srs.grade(it, true, { ex: 'type' }));
    await E1.NL.sync.flush();
    ok(rowsFor('srs_records', eid).length === 8, 'the fixture is wrong: the account should hold 8 records');
    await E2.boot();
    oi.slice(20, 22).forEach(it => E2.NL.srs.grade(it, true, { ex: 'type' }));
    await wait(3);
    E2.NL.state.resetProgress();
    await E2.signIn('eight@example.com');
    ok(rowsFor('srs_records', eid).length === 8, 'a reset made signed out erased the account: ' + rowsFor('srs_records', eid).length + ' record(s) left on the server');
    await E1.NL.sync.pull();
    ok(E1.NL.state.seenCount() === 8, 'a reset made signed out reached the account’s other device: it holds ' + E1.NL.state.seenCount() + ' record(s)');

    /* 6b. Connexion, déconnexion, remise à zéro, connexion. */
    const G1 = device('G1', true), G2 = device('G2', true);
    await G1.boot(); await G1.signIn('eight-again@example.com');
    const gid = G1.NL.sync.user.id;
    oi.slice(0, 8).forEach(it => G1.NL.srs.grade(it, true, { ex: 'type' }));
    await G1.NL.sync.flush();
    await G2.boot(); await G2.signIn('eight-again@example.com');
    ok(G2.NL.state.seenCount() === 8, 'the fixture is wrong: the second device should hold 8 records');
    await G2.NL.sync.signOut();
    await wait(3);
    G2.NL.state.resetProgress();
    await G2.signIn('eight-again@example.com');
    ok(rowsFor('srs_records', gid).length === 8, 'a reset made between sign-out and sign-in erased the account: ' + rowsFor('srs_records', gid).length + ' record(s) left');
    await G1.NL.sync.pull();
    ok(G1.NL.state.seenCount() === 8, 'a reset made between sign-out and sign-in reached the other device: it holds ' + G1.NL.state.seenCount() + ' record(s)');
    console.log('  une remise à zéro faite sans compte reste sur l’appareil');
  }

  console.log('\nEFFACEMENTS ET LECTURES BORNÉS AU COMPTE');
  {
    /* 7. Sur des tables à part : sans la politique, un effacement non borné
       viderait aussi les autres comptes, et le reste du test en dépend. Y passe
       d'abord : ses réglages sont la première ligne qu'une lecture non bornée
       rendrait. */
    const kept = server.tables;
    server.tables = {}; Object.keys(KEYS).forEach(t => { server.tables[t] = new Map(); });
    const X = device('X', true), Y = device('Y', true);
    await Y.boot(); await Y.signIn('y@example.com');
    const yid = Y.NL.sync.user.id;
    oi.slice(10, 14).forEach(it => Y.NL.srs.grade(it, true, { ex: 'type' }));
    Y.NL.state.setMeta({ xp: 999 });
    await Y.NL.sync.flush();
    await X.boot(); await X.signIn('x@example.com');
    const xid = X.NL.sync.user.id;
    oi.slice(0, 3).forEach(it => X.NL.srs.grade(it, true, { ex: 'type' }));
    await X.NL.sync.flush();
    ok(rowsFor('srs_records', yid).length === 4 && rowsFor('review_log', yid).length === 4, 'the fixture is wrong: the other account should hold 4 records and 4 log lines');
    server.rls = false;
    await X.NL.sync.pull();
    ok(X.NL.state.seenCount() === 3 && X.NL.state.logs().length === 3,
      'without row-level security a device read another account’s rows: it holds ' + X.NL.state.seenCount() + ' record(s) and ' + X.NL.state.logs().length + ' log line(s)');
    ok(X.NL.state.meta().xp !== 999, 'without row-level security a device read another account’s settings');
    await wait(3);
    X.NL.state.resetProgress();
    await X.NL.sync.flush();
    server.rls = true;
    ok(rowsFor('srs_records', xid).length === 0, 'the reset did not erase its own account');
    ok(rowsFor('srs_records', yid).length === 4 && rowsFor('review_log', yid).length === 4,
      'without row-level security a reset erased another account: ' + rowsFor('srs_records', yid).length + ' record(s) and ' + rowsFor('review_log', yid).length + ' log line(s) left');
    server.tables = kept;
    console.log('  sans la politique, un appareil ne lit et n’efface que son compte');
  }

  console.log('\nRATTACHEMENT RETENTÉ APRÈS UNE PANNE');
  {
    /* 8. La lecture des réglages du compte échoue à la connexion : l'appareil
       est connecté mais pas rattaché, et rien ne part. La prochaine occasion de
       synchroniser — le réseau qui revient, l'onglet qui revient au premier
       plan — doit retenter, sans attendre un rechargement. */
    const H1 = device('H1', true);
    await H1.boot();
    oi.slice(0, 3).forEach(it => H1.NL.srs.grade(it, true, { ex: 'type' }));
    server.failNext = 'user_meta';
    await H1.signIn('retry-online@example.com');
    const h1 = H1.NL.sync.user.id;
    ok(!H1.store['vlaams/owner'] && rowsFor('srs_records', h1).length === 0,
      'the fixture is wrong: a failed adoption should leave the device unattached with nothing sent');
    H1.offline(false);
    await wait(50);
    ok(H1.store['vlaams/owner'] === h1 && rowsFor('srs_records', h1).length === 3 && H1.NL.sync.status().pending === 0,
      'the network came back and the device stayed unattached: ' + rowsFor('srs_records', h1).length + ' record(s) on the server, ' + H1.NL.sync.status().pending + ' pending');

    const H2 = device('H2', true);
    await H2.boot();
    oi.slice(3, 5).forEach(it => H2.NL.srs.grade(it, true, { ex: 'type' }));
    server.failNext = 'user_meta';
    await H2.signIn('retry-tab@example.com');
    const h2 = H2.NL.sync.user.id;
    ok(!H2.store['vlaams/owner'], 'the fixture is wrong: the second failed adoption attached the device');
    H2.fire('visibilitychange');
    await wait(50);
    ok(H2.store['vlaams/owner'] === h2 && rowsFor('srs_records', h2).length === 2,
      'the tab came back to the front and the device stayed unattached: ' + rowsFor('srs_records', h2).length + ' record(s) on the server');
    console.log('  une adoption échouée est retentée au retour du réseau et de l’onglet');
  }

  console.log('\nCONNECTÉ, PAS ENCORE RATTACHÉ');
  {
    /* 9. Entre une connexion et un rattachement réussi : « synchroniser
       maintenant », la déconnexion et la remise à zéro doivent encore servir le
       compte, et rien de ce qui a été fait ici ne doit se perdre. */
    const N1 = device('N1', true);
    await N1.boot();
    oi.slice(0, 2).forEach(it => N1.NL.srs.grade(it, true, { ex: 'type' }));
    server.failNext = 'user_meta';
    await N1.signIn('unattached-sync@example.com');
    const n1 = N1.NL.sync.user.id;
    await N1.NL.sync.pull(); await N1.NL.sync.flush();      // ce que fait « synchroniser maintenant »
    ok(N1.store['vlaams/owner'] === n1 && rowsFor('srs_records', n1).length === 2,
      '« sync now » after a failed adoption left the device unattached: ' + rowsFor('srs_records', n1).length + ' record(s) on the server');

    const N2 = device('N2', true);
    await N2.boot();
    oi.slice(0, 3).forEach(it => N2.NL.srs.grade(it, true, { ex: 'type' }));
    server.failNext = 'user_meta';
    await N2.signIn('unattached-signout@example.com');
    const n2 = N2.NL.sync.user.id;
    ok(rowsFor('srs_records', n2).length === 0, 'the fixture is wrong: the failed adoption sent something');
    await N2.NL.sync.signOut();
    ok(rowsFor('srs_records', n2).length === 3, 'signing out after a failed adoption lost the anonymous progress: ' + rowsFor('srs_records', n2).length + ' record(s) on the server');

    /* Une remise à zéro pressée dans cet intervalle appartient au compte. */
    const N3 = device('N3', true), N4 = device('N4', true);
    await N3.boot(); await N3.signIn('unattached-reset@example.com');
    const n3 = N3.NL.sync.user.id;
    oi.slice(0, 4).forEach(it => N3.NL.srs.grade(it, true, { ex: 'type' }));
    await N3.NL.sync.flush();
    await N4.boot();
    server.failNext = 'user_meta';
    await N4.signIn('unattached-reset@example.com');
    await wait(3);
    N4.NL.state.resetProgress();
    N4.offline(false);
    await wait(50);
    ok(N4.store['vlaams/owner'] === n3, 'the fixture is wrong: the device did not attach when the network came back');
    ok(rowsFor('srs_records', n3).length === 0, 'a reset pressed while signed in but not attached did not reach the server: ' + rowsFor('srs_records', n3).length + ' record(s) left');
    await N3.NL.sync.pull();
    ok(N3.NL.state.seenCount() === 0, 'a reset pressed while signed in but not attached was undone at attachment: the other device holds ' + N3.NL.state.seenCount() + ' record(s)');

    /* L'appareil n'a pas pu écrire qui le possède : il est rattaché pour cette page quand même. */
    const N5 = device('N5', true);
    await N5.boot();
    const write = N5.ctx.localStorage.setItem;
    N5.ctx.localStorage.setItem = (k, v) => { if (k === 'vlaams/owner') throw new Error('QuotaExceededError'); write(k, v); };
    await N5.signIn('owner-unwritable@example.com');
    const n5 = N5.NL.sync.user.id;
    N5.NL.srs.grade(oi[0], true, { ex: 'type' });
    await N5.NL.sync.flush();
    ok(rowsFor('srs_records', n5).length === 1, 'when the owner could not be stored, the signed-in device stopped synchronising');
    console.log('  synchroniser, se déconnecter, remettre à zéro : tout sert le compte, même avant le rattachement');
  }

  console.log('\nINDEXEDDB');
  {
    /* 10. Ce que fait un vrai navigateur : les fiches et le journal vivent dans
       IndexedDB et sont relus au chargement suivant. */
    const D1 = device('D1', true, null, true);
    await D1.NL.state.open();
    ok(D1.NL.state.storage === 'IndexedDB', 'the fixture is wrong: the fake IndexedDB was not used');
    oi.slice(0, 5).forEach(it => D1.NL.srs.grade(it, true, { ex: 'type' }));
    await wait(10);
    const dump = clone(D1.NL.state.exportAll());
    oi.slice(5, 8).forEach(it => D1.NL.srs.grade(it, true, { ex: 'type' }));
    await wait(10);
    ok(D1.NL.state.importAll(clone(dump)), 'import refused');
    await wait(10);
    const D1b = device('D1b', true, clone(D1.store), D1.idb);
    await D1b.NL.state.open();
    const restoredWiped = D1b.NL.state.migrate();
    ok(!restoredWiped, 'after a restore and a reload the migration fired and showed « le moteur a changé »');
    ok(D1b.NL.state.seenCount() === 5 && D1b.NL.state.logs().length === 5,
      'after a restore and a reload the device holds ' + D1b.NL.state.seenCount() + ' record(s) and ' + D1b.NL.state.logs().length + ' log line(s), expected the 5 and 5 restored');

    /* Ce que la version précédente laisse dans IndexedDB, écrit tel quel. */
    const P1 = device('P1', true, null, true);
    await P1.NL.state.open();
    const idbPut = (dev, store, value) => new Promise(res => {
      const r = dev.ctx.indexedDB.open('vlaams-onderweg', 1);
      r.onsuccess = e => { const q = e.target.result.transaction(store, 'readwrite').objectStore(store).put(value); q.onsuccess = res; };
    });
    for (const it of oi.slice(0, 4)) {
      await idbPut(P1, 'srs', oldRec(it, EPOCH + 3600000));
      await idbPut(P1, 'log', oldLog(it, EPOCH + 3600000));
    }
    await idbPut(P1, 'meta', { k: 'meta', v: { dataVersion: 2, xp: 40, reached: 3, scenariosDone: ['bakker'], listenDone: [], updatedAt: EPOCH + 3600000 } });
    const P2 = device('P2', true, clone(P1.store), P1.idb);
    await P2.NL.state.open();
    ok(P2.NL.state.seenCount() === 4 && P2.NL.state.logs().length === 4, 'the fixture is wrong: the previous build’s IndexedDB should hold 4 records and 4 log lines');
    ok(P2.NL.state.migrate() === true, 'a device of the previous build using IndexedDB did not migrate');
    await wait(10);
    const P3 = device('P3', true, clone(P2.store), P2.idb);
    await P3.NL.state.open();
    const again = P3.NL.state.migrate();
    ok(!again && P3.NL.state.seenCount() === 0 && P3.NL.state.logs().length === 0 && P3.NL.state.meta().reached === 0,
      'the migration did not empty IndexedDB: after a reload migrate() is ' + again + ', with ' + P3.NL.state.seenCount() + ' record(s) and ' + P3.NL.state.logs().length + ' log line(s)');

    /* Une progression anonyme, avec sa propre remise à zéro, adoptée par un
       compte remis à zéro après l'époque, puis rechargée. */
    const resetAt = Date.now() - 2 * 3600000;
    const aid = account('idb-adopt@example.com').id;
    putRow('user_meta', { user_id: aid, updated_at: resetAt, data: Object.assign(
      { dataVersion: 3, resetAt, xp: 5, progress: zero(), updatedAt: resetAt }, zero()) });
    const I1 = device('I1', true, null, true);
    await I1.boot();
    oi.slice(0, 3).forEach(it => I1.NL.srs.grade(it, true, { ex: 'type' }));
    await wait(3);
    I1.NL.state.resetProgress();
    oi.slice(3, 6).forEach(it => I1.NL.srs.grade(it, true, { ex: 'type' }));
    await I1.signIn('idb-adopt@example.com');
    await wait(20);
    ok(oi.slice(3, 6).every(it => rowsFor('srs_records', aid).some(r => r.item_id === it.id)), 'the fixture is wrong: the anonymous progress was not adopted');
    const I2 = device('I2', true, clone(I1.store), I1.idb);
    await I2.NL.state.open();
    ok(I2.NL.state.migrate() === false && I2.NL.state.seenCount() === 3 && I2.NL.state.logs().length === 3,
      'progress adopted and rebased did not survive a reload in IndexedDB: ' + I2.NL.state.seenCount() + ' record(s), ' + I2.NL.state.logs().length + ' log line(s)');
    ok(I2.NL.state.meta().resetAt === resetAt, 'after a reload the device does not carry the account’s reset');
    console.log('  restauration, migration et adoption survivent à un rechargement dans IndexedDB');
  }

  console.log('\nLA COUPE DE LA MIGRATION SUR LE SERVEUR');
  {
    /* 11a. Un appareil possédé, qui porte encore l'ancien moteur, migre pendant
       que le serveur tient une fiche qu'un autre appareil de cette version a
       écrite après l'époque : elle reste. */
    const Q1 = device('Q1', true), Q2 = device('Q2', true);
    await Q1.boot(); await Q1.signIn('cut-migrate@example.com');
    const qid = Q1.NL.sync.user.id;
    await Q2.boot(); await Q2.signIn('cut-migrate@example.com');
    oi.slice(0, 3).forEach(it => {
      Q2.NL.state.setRec(oldRec(it, EPOCH - DAY), true);
      putRow('srs_records', { user_id: qid, item_id: it.id, data: oldRec(it, EPOCH - DAY), updated_at: EPOCH - DAY });
    });
    Q1.NL.srs.grade(oi[30], true, { ex: 'type' });
    await Q1.NL.sync.flush();
    await wait(450);
    const Q2b = device('Q2b', true, clone(Q2.store));
    await Q2b.NL.state.open();
    ok(Q2b.NL.state.migrate() === true, 'the fixture is wrong: the owned device holding old-engine records did not migrate');
    Q2b.NL.content.refresh(); Q2b.NL.ui.bind(Q2b.root);
    await Q2b.NL.sync.init(); await wait(30);
    ok(oi.slice(0, 3).every(it => !rowsFor('srs_records', qid).some(r => r.item_id === it.id)), 'the migration left old-engine rows on the server');
    ok(rowsFor('srs_records', qid).some(r => r.item_id === oi[30].id),
      'the migration of an owned device erased a record another device of this build wrote after the epoch');

    /* 11b. Des réglages de l'ancien moteur, et une fiche de cette version écrite
       après l'époque : le nettoyage du serveur la laisse. */
    const after = Date.now() - 3600000;
    const cid = account('cut-clean@example.com').id;
    putRow('user_meta', { user_id: cid, updated_at: after, data: {
      dataVersion: 2, xp: 12, reached: 2, scenariosDone: ['bakker'], listenDone: [], updatedAt: after } });
    oi.slice(0, 2).forEach(it => putRow('srs_records', { user_id: cid, item_id: it.id, data: oldRec(it, EPOCH - DAY), updated_at: EPOCH - DAY }));
    putRow('srs_records', { user_id: cid, item_id: oi[31].id, updated_at: after,
      data: Object.assign(oldRec(oi[31], after), { stage: 1, reps: 1, base: EPOCH }) });
    const C1 = device('Cc', true);
    await C1.boot(); await C1.signIn('cut-clean@example.com');
    ok(oi.slice(0, 2).every(it => !rowsFor('srs_records', cid).some(r => r.item_id === it.id)), 'the server clean-up left old-engine rows');
    ok(rowsFor('srs_records', cid).some(r => r.item_id === oi[31].id) && !!C1.NL.state.rec(oi[31].id),
      'the server clean-up erased a record this build wrote after the epoch');
    console.log('  le serveur ne perd que ce qui précède l’époque');
  }

  console.log('\nUNE REMISE À ZÉRO GARDE L’EFFORT DU JOUR');
  {
    /* 10. Remettre la progression à zéro n'efface pas ce qui a été dépensé aujourd'hui,
       ni ici, ni sur le serveur, ni après la synchro suivante. */
    const U1 = device('U1', true), U2 = device('U2', true);
    await U1.boot(); await U1.signIn('keep-day@example.com');
    await U2.boot(); await U2.signIn('keep-day@example.com');
    U1.NL.srs.spend(7);
    await U1.NL.sync.flush();
    await U2.NL.sync.pull();
    const day = U1.NL.state.meta().exDay, uid1 = U1.NL.sync.user.id;
    ok(U2.NL.state.meta().exToday === 7, 'the fixture is wrong: the second device should know the 7 exercises of the day');
    await wait(3);
    const left = U1.NL.srs.budgetLeft();
    U1.NL.state.resetProgress();
    ok(U1.NL.state.meta().exToday === 7 && U1.NL.state.meta().exDay === day &&U1.NL.srs.budgetLeft() === left,
      'right after the reset, before any synchronisation, today’s counter is ' + U1.NL.state.meta().exToday + ' on ' + U1.NL.state.meta().exDay + ', expected 7 on ' + day + ' (budget left ' + U1.NL.srs.budgetLeft() + ')');
    await U1.NL.sync.flush();
    ok(U1.NL.state.meta().exToday === 7 &&U1.NL.state.meta().exDay === day,
      'the reset changed today’s counter: ' + U1.NL.state.meta().exToday + ' on ' + U1.NL.state.meta().exDay + ', expected 7 on ' + day);
    ok(rowsFor('user_meta', uid1)[0].data.exToday === 7, 'the reset sent a different counter to the server: ' + rowsFor('user_meta', uid1)[0].data.exToday);
    await U1.NL.sync.pull();
    ok(U1.NL.state.meta().exToday === 7, 'the synchronisation after the reset brought back a counter of ' + U1.NL.state.meta().exToday);
    await U2.NL.sync.pull();
    ok(U2.NL.state.meta().exToday === 7 && U2.NL.srs.budgetLeft() === U1.NL.srs.budgetLeft(),
      'the other device holds a counter of ' + U2.NL.state.meta().exToday + ' after the reset');
    console.log('  le compteur du jour survit à la remise à zéro, ici, sur le serveur et sur l’autre appareil');
  }

  console.log('\nUNE SAUVEGARDE DE L’ANCIEN MOTEUR');
  {
    /* 11. Une sauvegarde faite avant ENGINE_EPOCH rend ce qu'une remise à zéro garde —
       réglages sans la progression, score, mots personnels — et aucune fiche ni ligne. */
    const own = { id: 'x-old', kind: 'word', unit: 'eigen', level: 'eigen', nl: 'de goesting', fr: 'l’envie', updatedAt: 5 };
    const old = { app: 'vlaams-onderweg', v: 1, at: EPOCH - 1000,
      meta: { xp: 300, theme: 'dark', pace: 'fast', reached: 4, scenariosDone: ['bakker'], listenDone: ['les1'], dataVersion: 2, resetAt: 0, updatedAt: 9 },
      srs: oi.slice(0, 3).map(it => oldRec(it, EPOCH - DAY)), custom: [own], log: oi.slice(0, 3).map(it => oldLog(it, EPOCH - DAY)) };
    const O1 = device('O1', false);
    await O1.NL.state.open();
    oi.slice(10, 12).forEach(it => O1.NL.srs.grade(it, false, { ex: 'type' }));
    O1.NL.state.addCustom({ id: 'x-here', nl: 'de kop', fr: 'la tasse' });
    ok(O1.NL.state.seenCount() === 2 && O1.NL.state.logs().length === 2, 'the fixture is wrong: the device should hold 2 records and 2 log lines');
    ok(O1.NL.state.isOldBackup(old) === true, 'a backup made before the epoch was not recognised as made on the old engine');
    ok(O1.NL.state.importAll(clone(old)), 'import refused an old-engine backup');
    const om = O1.NL.state.meta();
    ok(O1.NL.state.seenCount() === 0 && O1.NL.state.logs().length === 0,
      'an old-engine backup brought back ' + O1.NL.state.seenCount() + ' record(s) and ' + O1.NL.state.logs().length + ' log line(s)');
    ok(om.xp === 300 && om.theme === 'dark' && om.pace === 'fast', 'an old-engine backup did not restore the score or the settings: ' + JSON.stringify([om.xp, om.theme, om.pace]));
    ok(O1.NL.state.customs().map(c => c.id).join() === 'x-old', 'an old-engine backup did not restore the own words: ' + O1.NL.state.customs().map(c => c.id));
    ok(om.reached === 0 && om.scenariosDone.length === 0 && om.listenDone.length === 0,
      'an old-engine backup set the progress fields: ' + JSON.stringify([om.reached, om.scenariosDone, om.listenDone]));
    ok(om.dataVersion === 3 && om.resetAt > EPOCH, 'an old-engine backup left the data version or the reset stamp of the old engine');
    /* Rechargé : la migration n'a plus rien à effacer, et l'écran n'annonce rien. */
    await wait(450);
    const O2 = device('O2', false, clone(O1.store));
    await O2.NL.state.open();
    ok(O2.NL.state.migrate() === false && O2.NL.state.seenCount() === 0 && O2.NL.state.meta().xp === 300 && O2.NL.state.customs().length === 1,
      'after reloading an old-engine restore the device holds ' + O2.NL.state.seenCount() + ' record(s), xp ' + O2.NL.state.meta().xp);

    /* Une sauvegarde faite depuis l'époque se restaure comme avant. */
    const fresh = clone(O1.NL.state.exportAll());
    ok(O1.NL.state.isOldBackup(fresh) === false, 'a backup made since the epoch was taken for an old-engine one');
    const O3 = device('O3', false);
    await O3.NL.state.open();
    oi.slice(0, 4).forEach(it => O3.NL.srs.grade(it, true, { ex: 'type' }));
    O3.NL.state.setMeta({ reached: 2, scenariosDone: ['bakker'] });
    const mine = clone(O3.NL.state.exportAll());
    O1.NL.state.importAll(mine);
    ok(O1.NL.state.seenCount() === 4 && O1.NL.state.logs().length === 4 && O1.NL.state.meta().reached === 2 && O1.NL.state.meta().scenariosDone.join() === 'bakker',
      'a backup made since the epoch no longer restores its records, log and progress: ' + O1.NL.state.seenCount() + ' / ' + O1.NL.state.logs().length);
    ok(typeof O1.NL.t.importedOld === 'string' && O1.NL.t.importedOld.length > 0, 'missing string importedOld');
    console.log('  ancienne : réglages, score, mots ; ni fiches ni journal. Récente : tout, comme avant');
  }

  console.log('\nUNE RESTAURATION VIDE LES MOTS PERSONNELS');
  {
    /* 11b. Un mot ajouté après la sauvegarde ne revient pas au chargement suivant. */
    const W1 = device('W1', false, null, true);
    await W1.NL.state.open();
    W1.NL.state.addCustom({ id: 'x-keep', nl: 'de kop', fr: 'la tasse' });
    await wait(10);
    const dump = clone(W1.NL.state.exportAll());
    W1.NL.state.addCustom({ id: 'x-later', nl: 'het glas', fr: 'le verre' });
    await wait(10);
    ok(W1.NL.state.importAll(clone(dump)), 'import refused');
    await wait(10);
    ok(W1.NL.state.customs().map(c => c.id).join() === 'x-keep', 'the restore kept the word added after the backup in memory');
    const W2 = device('W2', false, clone(W1.store), W1.idb);
    await W2.NL.state.open();
    ok(W2.NL.state.customs().map(c => c.id).join() === 'x-keep',
      'after a restore and a reload the words are ' + W2.NL.state.customs().map(c => c.id) + ', expected only x-keep');
    console.log('  le mot ajouté après la sauvegarde ne revient pas');
  }

  console.log('\nLE JOURNAL SUR LE REPLI localStorage ET DANS LA SAUVEGARDE');
  {
    /* 13. Sur le repli, le journal survit à un rechargement : « Ce qui résiste » les relit. */
    const F = device('Flog', false);
    await F.NL.state.open();
    oi.slice(0, 5).forEach(it => F.NL.srs.grade(it, false, { ex: 'type' }));
    await wait(450);
    const F2 = device('Flog2', false, clone(F.store));
    await F2.NL.state.open();
    ok(F2.NL.state.storage === 'localStorage', 'the fixture is wrong: the fallback was not used');
    F2.NL.content.refresh();
    ok(F2.NL.state.logs().length === 5 && F2.NL.srs.mistakes().length === 5,
      'after a reload on the fallback « Ce qui résiste » lists ' + F2.NL.srs.mistakes().length + ' item(s), expected the 5 missed');
    /* Au plus 3 000 lignes dans localStorage, les dernières. */
    const big = device('Fbig', false);
    await big.NL.state.open();
    for (let i = 0; i < 3200; i++) big.NL.state.logReview({ id: oi[i % 50].id, t: 1e12 + i, ok: false, stage: 1, kind: 'word', ex: 'type' });
    await wait(450);
    const big2 = device('Fbig2', false, clone(big.store));
    await big2.NL.state.open();
    const bl = big2.NL.state.logs();
    ok(bl.length === 3000 && bl[bl.length - 1].t === 1e12 + 3199 && bl[0].t === 1e12 + 200,
      'the fallback kept ' + bl.length + ' log line(s), expected the last 3000');

    /* 14. La sauvegarde garde tout le journal, pas ses 2 000 dernières lignes. */
    const L1 = device('L1', false, null, true);
    await L1.NL.state.open();
    for (let i = 0; i < 2500; i++) L1.NL.state.logReview({ id: oi[i % 50].id, t: Date.now() - 2500 + i, ok: i % 2 === 0, stage: 1, kind: 'word', ex: 'type' });
    const full = clone(L1.NL.state.exportAll());
    ok(full.log.length === 2500, 'the backup holds ' + full.log.length + ' log line(s), expected 2500');
    const L2 = device('L2', false, null, true);
    await L2.NL.state.open();
    ok(L2.NL.state.importAll(clone(full)), 'import refused');
    ok(L2.NL.state.logs().length === 2500, 'the restore brought back ' + L2.NL.state.logs().length + ' log line(s), expected 2500');
    await wait(20);
    const L3 = device('L3', false, clone(L2.store), L2.idb);
    await L3.NL.state.open();
    ok(L3.NL.state.logs().length === 2500, 'after a restore and a reload the log holds ' + L3.NL.state.logs().length + ' line(s), expected 2500');
    console.log('  journal relu sur le repli, 3 000 lignes au plus ; sauvegarde complète : 2 500 lignes aller-retour');
  }

  console.log('\nLANGUE CHANGÉE AILLEURS');
  {
    /* #69, 3. Le choix fait ici donne l'avis seul ; celui qui arrive d'un autre appareil,
       par une lecture ou par un envoi, dit d'où il vient, même après une séance. */
    const T1 = device('T1', true), T2 = device('T2', true);
    for (const d of [T1, T2]) { await d.boot(); await d.signIn('langue@example.com'); d.NL.lang.apply(); d.NL.ui.go('vandaag'); }
    const fr = T1.NL.tables.fr, en = T1.NL.tables.en;
    T1.NL.lang.set('fr'); T1.NL.ui.render();
    ok(count(shown(T1), fr.langNotice) === 1 && shown(T1).indexOf(fr.langSynced) < 0, '69.3: the switch made on this device does not show the notice alone');
    await T1.NL.sync.flush();
    await T2.NL.sync.pull(); T2.NL.ui.render();
    ok(count(shown(T2), fr.langSynced + ' ' + fr.langNotice) === 1, '69.3: after a pull that brought French, the notice does not say the change came from another device');
    /* #73. Dessiné puis remplacé dans le même tour, l'avis n'a pas été vu : il suit. */
    T2.NL.ui.go('leerpad');
    ok(count(shown(T2), fr.langSynced + ' ' + fr.langNotice) === 1, '73: a notice drawn and replaced in the same tick counts as seen');
    await wait(1);
    T2.NL.ui.go('doctor');
    ok(shown(T2).indexOf(fr.langNotice) < 0, '69.3: the notice is still there after a go() in a later tick');
    T2.NL.state.setMeta({ theme: 'dark' });   // un réglage d'ici : l'envoi fusionne avant d'écrire
    await wait(3);
    T1.NL.lang.set('en'); T1.NL.ui.render(); await T1.NL.sync.flush();
    await T2.NL.sync.flush(); T2.NL.ui.render();
    ok(count(shown(T2), en.langSynced + ' ' + en.langNotice) === 1, '69.3: after a flush that brought English, doctor does not say the change came from another device');
    T2.NL.ui.go('vandaag');
    dueReviews(T2.NL, 12, Date.now());
    ok(T2.NL.screens.sessie.begin('vandaag'), '69.3: no session to start'); T2.NL.ui.go('sessie'); await wait(3);
    T1.NL.lang.set('fr'); T1.NL.ui.render(); await T1.NL.sync.flush();
    await T2.NL.sync.pull(); T2.NL.ui.render();
    ok(T2.NL.t.nav[1].label === en.nav[1].label, '69.3: a synced change applied in the middle of a session');
    T2.tap({ quitYes: '1' });
    ok(count(shown(T2), fr.langSynced + ' ' + fr.langNotice) === 1, '69.3: after the session, the notice does not say the change came from another device');
    /* Deux synchros contraires pendant une séance : rien n'a changé, rien ne s'annonce, et
       aucune marque ne reste pour la sauvegarde rendue ensuite. */
    T2.NL.ui.go('vandaag');
    ok(T2.NL.screens.sessie.begin('vandaag'), '69.3: no second session to start'); T2.NL.ui.go('sessie'); await wait(3);
    T1.NL.lang.set('en'); T1.NL.ui.render(); await T1.NL.sync.flush(); await T2.NL.sync.pull();
    ok(T2.NL.lang.current() === 'en', '69.3: the first opposite sync did not arrive during the session');
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
    const landed = (dev, how) => {
      ok(dev.NL.ui.route === 'vandaag' && dev.NL.lang.current() === 'fr',
        '73 (' + how + '): the sign-in landed on ' + dev.NL.ui.route + ' in ' + dev.NL.lang.current() + ', expected vandaag in French');
      ok(count(shown(dev), fr.langSynced + ' ' + fr.langNotice) === 1, '73 (' + how + '): vandaag does not say the language came from another device');
    };
    /* Sans session, la page s'ouvre sur l'écran compte, en anglais : la connexion y finit. */
    const onCompte = dev => ok(dev.NL.ui.route === 'compte' && dev.NL.lang.current() === 'en',
      '73 (' + dev.name + '): a device without a session does not open on compte in English');
    const V = page('V');
    await wait(5);
    onCompte(V);
    V.fields['acc-email'] = 'onglet@example.com'; V.tap({ act: 'send' }); await wait(5);
    V.fields['acc-code'] = '123456'; V.tap({ act: 'verify' }); await wait(20);
    landed(V, 'six-digit code');
    const W = page('W');
    await wait(5);
    onCompte(W);
    W.client.auth.verifyOtp({ email: 'onglet@example.com', token: '123456', type: 'email' });
    await wait(20);
    landed(W, 'another tab');
    console.log('  connexion finie sur l’écran compte, par le code ou par un autre onglet : l’accueil dit d’où vient la langue');
  }

  console.log('\nÉCRAN COMPTE');
  {
    const t = A.NL.t;
    ['accTitle', 'accSend', 'accSkip', 'accCheckMail', 'accVerify', 'accSignOut', 'syncNow', 'syncLocalOnly'].forEach(k =>
      ok(typeof t[k] === 'string' && t[k].length > 0, 'missing string ' + k));
    /* Un texte fixe, pas un second calcul : la langue lue ici est celle de l'appareil d'essai. */
    const AGO = { fr: 'il y a 3 h', en: '3 h ago' };
    ok(t.syncAgo(3 * 3600000) === AGO[A.NL.lang.current()], 'time units (' + A.NL.lang.current() + '): ' + t.syncAgo(3 * 3600000));
    ok(A.NL.tables.fr.syncAgo(3 * 3600000) === AGO.fr && A.NL.tables.en.syncAgo(3 * 3600000) === AGO.en, 'time units of the tables: ' + A.NL.tables.fr.syncAgo(3 * 3600000) + ' / ' + A.NL.tables.en.syncAgo(3 * 3600000));
    const html = A.NL.screens.compte.render();
    ok(html.includes('learner@example.com'), 'signed-in screen should show the address');
    ok(html.includes(t.accSignOut), 'signed-in screen should offer sign-out');
    const html2 = C.NL.screens.compte.render();
    ok(html2.includes(t.accTitle) || html2.includes(t.accSignedIn), 'account screen did not render');
  }

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'SYNC OK'));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
