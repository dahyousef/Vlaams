/* Synchronisation : deux appareils, un faux Supabase partagé.
   Ce qui est vérifié : l'adoption d'une progression anonyme, le passage d'un
   appareil à l'autre, la révision la plus récente qui gagne, la fusion des
   réglages, la boîte d'envoi qui survit à une panne réseau, l'effacement quand un
   autre compte se connecte, et l'inertie totale sans configuration. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[2];

const FILES = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8')
  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean)
  .filter(f => f !== 'src/app.js');

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- faux serveur ---------------- */
const KEYS = {
  srs_records: ['user_id', 'item_id'], user_meta: ['user_id'],
  custom_words: ['user_id', 'id'], review_log: ['user_id', 't', 'item_id']
};
const server = { tables: {}, users: {}, down: false, requests: 0 };
Object.keys(KEYS).forEach(t => { server.tables[t] = new Map(); });
const keyOf = (t, row) => KEYS[t].map(k => row[k]).join('|');
const clone = v => JSON.parse(JSON.stringify(v));
const rowsFor = (t, uid) => [...server.tables[t].values()].filter(r => r.user_id === uid);

function fakeLib(device) {
  return {
    createClient(url, key, opts) {
      const handlers = [];
      const fire = (ev, s) => handlers.forEach(h => h(ev, s));
      const session = () => { const raw = device.store['sb-session']; return raw ? JSON.parse(raw) : null; };
      const uid = () => (session() ? session().user.id : null);

      function query(table) {
        const q = { filters: [], from: 0, to: Infinity };
        const run = () => {
          server.requests++;
          if (server.down) return Promise.resolve({ data: null, error: { message: 'network down' } });
          if (!uid()) return Promise.resolve({ data: [], error: null });     // RLS : rien sans session
          let rows = rowsFor(table, uid());
          q.filters.forEach(f => { rows = rows.filter(f); });
          return Promise.resolve({ data: clone(rows.slice(q.from, q.to + 1)), error: null });
        };
        const b = {
          select() { return b; },
          gte(col, v) { q.filters.push(r => r[col] >= v); return b; },
          range(a, z) { q.from = a; q.to = z; return b; },
          then(res, rej) { return run().then(res, rej); },
          upsert(rows, o) {
            server.requests++;
            if (server.down) return Promise.resolve({ error: { message: 'network down' } });
            rows = Array.isArray(rows) ? rows : [rows];
            for (const r of rows) {
              if (r.user_id !== uid()) return Promise.resolve({ error: { message: 'RLS violation' } });
            }
            rows.forEach(r => {
              const k = keyOf(table, r);
              const old = server.tables[table].get(k);
              if (o && o.ignoreDuplicates && old) return;
              if (old && r.updated_at != null && r.updated_at < old.updated_at) return;   // déclencheur keep_newer
              server.tables[table].set(k, clone(r));
            });
            return Promise.resolve({ error: null });
          }
        };
        return b;
      }

      return {
        from: query,
        auth: {
          onAuthStateChange(fn) { handlers.push(fn); return { data: { subscription: { unsubscribe() {} } } }; },
          getSession: () => Promise.resolve({ data: { session: session() } }),
          signInWithOtp({ email, options }) {
            device.sentTo = email; device.redirect = options && options.emailRedirectTo;
            return Promise.resolve({ error: null });
          },
          verifyOtp({ email, token, type }) {
            if (type !== 'email' || token !== '123456') return Promise.resolve({ data: {}, error: { message: 'Token has expired or is invalid' } });
            const user = server.users[email] || (server.users[email] = { id: 'uid-' + Object.keys(server.users).length, email });
            const s = { user };
            device.store['sb-session'] = JSON.stringify(s);
            fire('SIGNED_IN', s);
            return Promise.resolve({ data: { user, session: s }, error: null });
          },
          signOut() { delete device.store['sb-session']; fire('SIGNED_OUT', null); return Promise.resolve({ error: null }); }
        }
      };
    }
  };
}

/* ---------------- un appareil ---------------- */
function device(name, withConfig, store) {
  const dev = { name, store: store || {}, winHandlers: {} };
  const ctx = {
    console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
    Math, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
    localStorage: {
      getItem: k => (k in dev.store ? dev.store[k] : null),
      setItem: (k, v) => { dev.store[k] = String(v); },
      removeItem: k => { delete dev.store[k]; }
    },
    navigator: { onLine: true, userAgent: 'Mozilla/5.0 Chrome/120' },
    location: { hash: '', protocol: 'https:', origin: 'https://vlaams.example', pathname: '/' },
    document: {
      readyState: 'complete', visibilityState: 'visible',
      documentElement: { setAttribute() {}, removeAttribute() {} },
      getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
      addEventListener() {}, activeElement: { tagName: 'BODY' }
    },
    addEventListener: (ev, fn) => { (dev.winHandlers[ev] = dev.winHandlers[ev] || []).push(fn); },
    removeEventListener() {}
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  if (withConfig) {
    ctx.NL_CONFIG = { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon' };
    ctx.supabase = fakeLib(dev);
  }
  vm.createContext(ctx);
  for (const f of FILES) {
    try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
    catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
  }
  dev.ctx = ctx; dev.NL = ctx.NL;
  const root = {
    innerHTML: "", dataset: {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
    classList: { add() {}, remove() {}, contains: () => false }
  };
  dev.root = root;
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
  dev.offline = v => { ctx.navigator.onLine = !v; (dev.winHandlers[v ? 'offline' : 'online'] || []).forEach(f => f()); };
  return dev;
}

const items = NL => NL.content.allItems();

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
  const m1 = M({ xp: 10, streak: 3, best: 3, lastDay: '2026-09-16', theme: 'dark', updatedAt: 5, scenariosDone: ['a'], doneDay: '2026-09-17', doneToday: 4, placed: true },
               { xp: 40, streak: 1, best: 2, lastDay: '2026-09-17', theme: 'light', updatedAt: 9, scenariosDone: ['b'], doneDay: '2026-09-17', doneToday: 7, placed: false });
  ok(m1.xp === 40, 'xp should take the max');
  ok(m1.streak === 1 && m1.lastDay === '2026-09-17', 'streak should follow the latest day');
  ok(m1.best === 3, 'best should never drop');
  ok(m1.theme === 'light', 'newer setting should win');
  ok(m1.scenariosDone.length === 2, 'done lists should union');
  ok(m1.doneToday === 7, 'same-day counter should take the max');
  ok(m1.placed === true, 'placement should never be undone');
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

  console.log('\nÉCRAN COMPTE');
  {
    const t = A.NL.t;
    ['accTitle', 'accSend', 'accSkip', 'accCheckMail', 'accVerify', 'accSignOut', 'syncNow', 'syncLocalOnly'].forEach(k =>
      ok(typeof t[k] === 'string' && t[k].length > 0, 'missing string ' + k));
    ok(t.syncAgo(3 * 3600000) === 'il y a 3 h', 'French time units: ' + t.syncAgo(3 * 3600000));
    const html = A.NL.screens.compte.render();
    ok(html.includes('learner@example.com'), 'signed-in screen should show the address');
    ok(html.includes(t.accSignOut), 'signed-in screen should offer sign-out');
    const html2 = C.NL.screens.compte.render();
    ok(html2.includes(t.accTitle) || html2.includes(t.accSignedIn), 'account screen did not render');
  }

  console.log('\n' + checks + ' checks, ' + (fails ? fails + ' FAILED' : 'SYNC OK'));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
