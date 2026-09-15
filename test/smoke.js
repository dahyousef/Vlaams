/* Headless smoke test: loads every module into a stubbed browser and exercises
   the content model, the scheduler and all ten exercise types. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[2];

const store = {};
const ctx = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  Math, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error,
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  },
  navigator: { onLine: true },
  location: { hash: '', protocol: 'file:' },
  document: {
    readyState: 'complete',
    documentElement: { setAttribute() {}, removeAttribute() {} },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    activeElement: { tagName: 'BODY' }
  }
};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

const FILES = `src/core/util.js src/core/fr.js src/core/state.js src/core/srs.js src/core/speech.js src/core/audio.js
src/content/lexicon.a1.js src/content/lexicon.a1b.js src/content/grammar.js src/content/reference.js
src/content/scenarios.js src/content/index.js src/ex/index.js`.split(/\s+/).filter(Boolean);

for (const f of FILES) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
}

const NL = ctx.NL;
let fails = 0;
const ok = (cond, msg) => { if (!cond) { console.log('  FAIL: ' + msg); fails++; } };

NL.state.open().then(() => {
  NL.content.refresh();
  const items = NL.content.allItems();

  console.log('CONTENT');
  console.log('  units           ' + NL.content.units.length);
  console.log('  items           ' + items.length +
    '  (words ' + items.filter(i => i.kind === 'word').length +
    ', phrases ' + items.filter(i => i.kind === 'phrase').length +
    ', patterns ' + items.filter(i => i.kind === 'pattern').length + ')');
  console.log('  scenarios       ' + NL.content.scenarios.length +
    ', steps ' + NL.content.scenarios.reduce((n, s) => n + s.steps.length, 0));
  console.log('  listen clips    ' + NL.content.listenClips().length);
  console.log('  cheat sheets    ' + NL.content.sheets.length +
    ', rows ' + NL.content.sheets.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.rows.length, 0), 0));
  console.log('  register pairs  ' + NL.content.register.length);
  console.log('  flemish variants ' + items.filter(i => i.be).length);

  const ids = new Set();
  items.forEach(i => {
    ok(!ids.has(i.id), 'duplicate id ' + i.id); ids.add(i.id);
    ok(i.nl && i.fr, 'missing nl/en on ' + i.id);
    ok(['word', 'phrase', 'pattern'].includes(i.kind), 'bad kind on ' + i.id);
  });
  /* No placeholder may survive into what the learner reads. */
  ['units', 'patterns', 'scenarios', 'sheets'].forEach(k =>
    ok(JSON.stringify(NL.content[k]).indexOf('{naam}') < 0
      && JSON.stringify(NL.content[k]).indexOf('{stad}') < 0
      && JSON.stringify(NL.content[k]).indexOf('{bedrijf}') < 0,
      'an unsubstituted placeholder survived in ' + k));
  NL.state.setMeta({ learnerName: 'Testnaam', town: 'Testdorp', company: 'Testbedrijf' });
  NL.content.refresh();
  const mine = JSON.stringify(NL.content.allItems());
  ok(mine.indexOf('Ik woon in Testdorp') >= 0, 'the town setting did not reach the sentences');
  ok(mine.indexOf('Ik werk bij Testbedrijf') >= 0, 'the employer setting did not reach the sentences');
  ok(mine.indexOf('Ik heet Testnaam') >= 0, 'the name setting did not reach the sentences');
  NL.state.setMeta({ learnerName: '', town: '', company: '' });
  NL.content.refresh();
  ok(JSON.stringify(NL.content.allItems()).indexOf('Testdorp') < 0, 'clearing the settings left personal data behind');
  console.log('  personalisation  placeholders fill and clear cleanly');

  /* French sweep: every gloss is French, none is English. */
  items.forEach(i => {
    ok(i.fr, 'no French gloss on ' + i.id);
    ok(i.en === undefined, 'English gloss survived on ' + i.id);
  });
  const built = path.join(ROOT, 'index.html');
  if (fs.existsSync(built)) {
    const html = fs.readFileSync(built, 'utf8');
    ['>Overslaan<', '>Nakijken<', '>Start de sessie<', '>Terug naar Vandaag<',
     'Everything you have met', 'Welke is het?', 'Tik de woorden hieronder'].forEach(s =>
      ok(html.indexOf(s) < 0, 'untranslated interface string in build: ' + s));
    console.log('  french sweep    build is clean of known EN/NL interface strings');
  }

  items.filter(i => i.art).forEach(i =>
    ok(i.nl.startsWith(i.art + ' '), 'article mismatch: ' + i.nl + ' / ' + i.art));

  /* Every unit's grammar ids must resolve. */
  NL.content.units.forEach(u => (u.grammar || []).forEach(g =>
    ok(NL.content.patterns.some(p => p.id === g), 'unknown pattern ' + g + ' in ' + u.id)));

  /* Scenario shape. */
  NL.content.scenarios.forEach(s => {
    ok(s.steps.length > 2, s.id + ' too short');
    ok(s.outro, s.id + ' has no outro');
    s.steps.forEach((st, i) => {
      ok(st.them || st.you, s.id + ' step ' + i + ' is neither');
      if (st.you) {
        ok(st.you.choices && st.you.choices.length >= 2, s.id + ' step ' + i + ' needs 2+ choices');
        st.you.choices.forEach(c => ok(c.nl && c.fr, s.id + ' choice missing text'));
      }
    });
  });

  console.log('\nSCHEDULER');
  const w = items.find(i => i.kind === 'word' && i.art);
  const p = items.find(i => i.kind === 'phrase');
  const g = items.find(i => i.kind === 'pattern');

  const ladder = [];
  for (let s = 0; s <= NL.srs.MAX_STAGE; s++) {
    NL.srs.seed(w, s);
    ladder.push(NL.srs.exerciseFor(w));
  }
  console.log('  word ladder     ' + ladder.join(' -> '));
  ok(ladder.includes('speak'), 'word ladder never reaches speak');

  const pl = [];
  for (let s = 0; s <= NL.srs.MAX_STAGE; s++) { NL.srs.seed(p, s); pl.push(NL.srs.exerciseFor(p)); }
  console.log('  phrase ladder   ' + pl.join(' -> '));
  ok(pl.includes('speak'), 'phrase ladder never reaches speak');

  /* Failing must drop a stage and become due inside the session. */
  NL.srs.seed(w, 3);
  NL.srs.grade(w, false);
  const r = NL.state.rec(w.id);
  ok(r.stage === 2, 'fail did not drop a stage (got ' + r.stage + ')');
  ok(r.due - Date.now() < 5 * 60000, 'failed item not due within the session');
  NL.srs.grade(w, true);
  ok(NL.state.rec(w.id).stage === 3, 'pass did not advance');
  console.log('  fail/pass       stage drops then advances, requeued in ' +
    Math.round((r.due - Date.now()) / 60000) + ' min');

  console.log('\nEXERCISES');
  const blank = () => ({ sel: null, picked: [], input: '', matchSel: null, matchGone: [], matchBad: null, speech: { phase: 'idle', tries: 0, selfRated: null } });
  const U = NL.util;

  const cases = [
    ['pick', w], ['recall', w], ['article', w],
    ['bank', p], ['cloze', p], ['dictation', p], ['type', p], ['speak', p],
    ['order', g], ['cloze', g], ['type', g], ['speak', g],
    ['dictation', w], ['type', w]
  ];

  cases.forEach(([name, item]) => {
    const ex = NL.ex.get(name);
    let task, L = blank();
    try { task = ex.build(item); } catch (e) { console.log('  FAIL build ' + name + ': ' + e.message); fails++; return; }

    /* Feed it the correct answer. */
    if (task.opts) { const i = task.opts.findIndex(o => o.ok); L.sel = { i }; }
    if (task.bank) {
      const want = U.tiles(ex.answer(task));
      const used = new Set();
      want.forEach(t => {
        const i = task.bank.findIndex((b, k) => !used.has(k) && U.norm(b) === U.norm(t));
        if (i >= 0) { used.add(i); L.picked.push(i); }
      });
    }
    if (name === 'type' || (name === 'dictation' && !task.bank)) L.input = ex.answer(task);
    if (name === 'speak') L.speech.selfRated = true;

    let html, ready, verdict;
    try {
      html = ex.view(task, L, 'ask');
      ready = ex.ready(task, L);
      verdict = ex.judge(task, L);
      ex.view(task, L, 'ok');
    } catch (e) { console.log('  FAIL run ' + name + ': ' + e.message); fails++; return; }

    ok(typeof html === 'string' && html.length > 20, name + ' rendered nothing');
    ok(ready, name + ' not ready after a correct answer');
    ok(verdict.ok, name + ' rejected the correct answer (' + ex.answer(task) + ')');
    console.log('  ' + (name + ' (' + item.kind + ')').padEnd(20) + (verdict.ok && ready ? 'ok' : 'BROKEN'));
  });

  /* match takes an array */
  const mItems = items.filter(i => i.kind === 'word').slice(0, 5);
  const mt = NL.ex.registry.match.build(mItems);
  const mL = blank(); mL.matchGone = [0, 1, 2, 3, 4];
  ok(NL.ex.registry.match.ready(mt, mL), 'match never completes');
  ok(NL.ex.registry.match.view(mt, mL).length > 50, 'match rendered nothing');
  console.log('  match (5 pairs)     ok');

  console.log('\nSPEECH SCORING');
  const t = 'Ik ben Nederlands aan het leren';
  [[t, true, 'exact'], ['ik ben nederlands aan het leren', true, 'lowercase'],
   ['ik ben nederlands aan het leeren', true, 'one typo'],
   ['ik ben frans aan het leren', false, 'wrong word'],
   ['goeiedag meneer', false, 'unrelated']].forEach(([said, want, label]) => {
    const r = NL.speech.score([said], t);
    ok(r.pass === want, 'scoring "' + label + '" gave ' + r.pct + '% pass=' + r.pass + ', wanted ' + want);
    console.log('  ' + label.padEnd(14) + r.pct + '%  ' + (r.pass ? 'pass' : 'fail'));
  });

  console.log('\nPLACEMENT / PROGRESS');
  const before = NL.content.unitProgress('overleven');
  NL.content.itemsOf('tijd').forEach(i => { if (i.kind !== 'pattern') NL.srs.seed(i, 2); });
  console.log('  unit progress   overleven ' + before.pct + '%, tijd ' + NL.content.unitProgress('tijd').pct + '%');
  console.log('  course          ' + NL.content.courseProgress().pct + '%');
  console.log('  unit 2 open?    ' + NL.content.unitOpen('ikengij'));
  console.log('  counts          ' + JSON.stringify(NL.srs.counts()));
  console.log('  storage         ' + NL.state.storage);

  console.log('\n' + (fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
