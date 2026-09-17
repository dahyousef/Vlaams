/* Cold start: empty database, first screen, first session answered CORRECTLY
   (not skipped), and the credit that should follow. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[2];

const store = {};
const mkEl = () => ({
  innerHTML: '', value: '', disabled: false, scrollTop: 0, tagName: 'DIV', dataset: {},
  classList: { contains: () => false, add() {}, remove() {} },
  addEventListener() {}, setSelectionRange() {}, focus() {}, click() {}, select() {},
  querySelector: () => null, querySelectorAll: () => [], closest: () => null,
  insertAdjacentHTML() {}, matches: () => false, remove() {},
  getBoundingClientRect: () => ({ width: 400, height: 400, top: 0, left: 0 })
});
const app = mkEl();
const ctx = {
  console, setTimeout: f => { try { f(); } catch (e) {} }, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: f => f(),
  Math, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean, Blob: function () {},
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  navigator: { onLine: true, userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120 OPR/106' },
  location: { hash: '', protocol: 'https:', origin: 'https://claude.ai' },
  document: {
    readyState: 'complete', documentElement: { setAttribute() {}, removeAttribute() {} },
    getElementById: id => (id === 'app' ? app : null),
    querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
    activeElement: { tagName: 'BODY' }, createElement: mkEl, body: { appendChild() {} }
  }
};
ctx.addEventListener = () => {}; ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx; ctx.top = {};
vm.createContext(ctx);

const FILES = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8')
  .match(/SRC="([\s\S]*?)"/)[1].split('\n').map(s => s.trim()).filter(Boolean);
for (const f of FILES) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
}
const NL = ctx.NL, U = NL.util;
let fails = 0;
const ok = (c, m) => { if (!c) { console.log('  FAIL: ' + m); fails++; } };

NL.state.open().then(() => {
  NL.content.refresh();
  NL.ui.bind(app);

  console.log('COLD START (Opera, artifact-like)');
  NL.ui.go('vandaag');
  const home = app.innerHTML;
  ok(home.includes('test de niveau') || home.includes('Test de niveau'), 'no placement offer on a blank account');
  ok(home.includes('Démarrer la session'), 'no session button on a blank account');
  ok(!/[^a-z]the [a-z]/.test(home), 'English leaked onto the home screen');
  console.log('  home screen     ' + home.length + ' chars, placement offered, session offered');
  console.log('  voice report    ' + NL.speech.voiceInfo().note.slice(0, 60) + '…');
  console.log('  mic verdict     listenBlocked=' + NL.speech.listenBlocked() + ', tier=' + NL.speech.tier().id);
  ok(NL.speech.listenBlocked() === 'browser', 'Opera should report no recogniser');
  ok(NL.speech.tier().id === 'self' || NL.speech.tier().id === 'compare', 'Opera tier should be compare or self');

  console.log('\nFIRST SESSION — answering correctly');
  NL.screens.sessie.begin('vandaag');
  NL.ui.go('sessie');

  const S = NL.screens.sessie;
  let turns = 0, kickers = {};
  while (app.innerHTML.indexOf('done-stage') < 0 && turns++ < 60) {
    const html = app.innerHTML;
    const k = (html.match(/class="kicker"><span class="sub">[^<]*<\/span>([^<]*)/) || [])[1] || '(match)';
    kickers[k.trim()] = (kickers[k.trim()] || 0) + 1;

    /* Answer correctly: pick the option marked ok, place every tile, type the target. */
    if (html.includes('data-match=')) {
      for (let k2 = 0; k2 < 5; k2++) {
        S.click({ dataset: {} }, { match: 'l' + k2, k: String(k2), side: 'l' });
        S.click({ dataset: {} }, { match: 'r' + k2, k: String(k2), side: 'r' });
      }
      continue;
    }
    /* Answer it properly, using the live task. */
    const c = S.peek();
    const task = c && c.task, ex = NL.ex.get(c ? c.ex : 'pick');
    if (task) {
      if (task.opts) {
        const i = task.opts.findIndex(o => o.ok);
        S.click({ dataset: {} }, { opt: String(i < 0 ? 0 : i) });
      }
      if (task.bank) {
        const want = U.tiles(ex.answer(task)), used = new Set();
        want.forEach(w => {
          const i = task.bank.findIndex((b, k) => !used.has(k) && U.norm(b) === U.norm(w));
          if (i >= 0) { used.add(i); S.click({ dataset: {} }, { pick: String(i) }); }
        });
      }
      if (c.ex === 'corrige') tap('sessie', { opt: String(task.faulty) });
      if (c.ex === 'open') S.input({ classList: { contains: n => n === 'textin' }, value: task.task.model });
      if (c.ex === 'type' || (c.ex === 'dictation' && !task.bank)) {
        S.input({ classList: { contains: n => n === 'textin' }, value: ex.answer(task) });
      }
      if (c.ex === 'speak') S.click({ dataset: {} }, { self: '1' });
    }
    S.click({ dataset: {} }, { check: '1' });
    S.click({ dataset: {} }, { next: '1' });
  }
  console.log('  turns           ' + turns);
  Object.keys(kickers).forEach(k => console.log('    ' + (k || '(match)').padEnd(32) + kickers[k]));
  ok(app.innerHTML.indexOf('done-stage') >= 0, 'session never reached the summary');

  const m = NL.state.meta();
  console.log('\nAFTER THE SESSION');
  console.log('  xp              ' + m.xp);
  console.log('  streak          ' + m.streak + ' (lastDay ' + m.lastDay + ')');
  console.log('  items seen      ' + NL.srs.counts().seen);
  ok(m.xp > 0, 'no XP credited');
  ok(m.streak === 1, 'streak not started');
  ok(NL.srs.counts().seen > 0, 'nothing recorded in the scheduler');

  console.log('\nBACKUP ROUND TRIP');
  const dump = JSON.stringify(NL.state.exportAll());
  const before = NL.srs.counts().seen;
  NL.state.clearAll();
  ok(NL.srs.counts().seen === 0, 'wipe did not clear');
  ok(NL.state.importAll(JSON.parse(dump)), 'import rejected its own export');
  console.log('  ' + before + ' items exported, wiped, restored → ' + NL.srs.counts().seen);
  ok(NL.srs.counts().seen === before, 'restore lost items');

  console.log('\n' + (fails === 0 ? 'FIRST RUN IS CLEAN' : fails + ' PROBLEM(S)'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
