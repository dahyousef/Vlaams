/* Headless smoke test: loads every module into a stubbed browser and exercises
   the content model, the scheduler and all ten exercise types. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[2];

/* Même graine que les autres suites : une mesure statistique qui échoue une fois
   sur dix ne dit rien. SEED=... pour rejouer une autre distribution. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SafeMath = Object.create(Math);
SafeMath.random = rng(Number(process.env.SEED || 20260917));

const store = {};
const ctx = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  Math: SafeMath, Date, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error,
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
src/content/lexicon.a1.js src/content/lexicon.a1b.js src/content/grammar.js src/content/open.js src/content/reference.js
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
  NL.srs.seed(w, 4);
  NL.srs.grade(w, false);
  const r = NL.state.rec(w.id);
  ok(r.stage === 2, 'a lapse must drop two rungs (got ' + r.stage + ')');
  /* PIÈGE 2 : une rechute rentre dans l'échelle. Repartir de deux minutes puis
     multiplier fait osciller l'élément sous son plafond sans fin. */
  ok(r.interval === NL.srs.STEP[2], 'lapse must re-enter the step ladder, not restart at 2 min');
  NL.srs.grade(w, true);
  ok(NL.state.rec(w.id).stage === 3, 'pass did not advance');
  console.log('  rechute         -2 échelons, intervalle ' + Math.round(r.interval / 60000) + ' min, puis remonte');

  /* PIÈGE 1 : au sommet de son palier, l'intervalle doit continuer de croître,
     sinon l'élément revient tous les jours à vie. */
  const cap = items.find(i => i.kind === 'word' && i.id !== w.id);
  cap.tier = 'recognise';
  NL.srs.seed(cap, 2);
  let last = 0, grew = 0;
  for (let k = 0; k < 12; k++) {
    NL.srs.grade(cap, true);
    const rr = NL.state.rec(cap.id);
    if (rr.interval > last) grew++;
    last = rr.interval;
  }
  ok(grew >= 5 && last >= 200 * 86400000,
    'an item at its tier ceiling never grew its interval — it would return daily forever');
  ok(NL.state.rec(cap.id).retired, 'a consolidated item never left the daily deck');
  console.log('  plafond         intervalle ×' + grew + ', sorti du paquet à ' +
    Math.round(last / 86400000) + ' jours');
  delete cap.tier;

  /* Le mot transparent saute les présentations. */
  const cog = items.find(i => i.cognate);
  if (cog) {
    NL.state.setRec({ id: cog.id, kind: 'word', stage: 0, due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0, last: 0, said: false, retired: false, lastEx: null });
    NL.srs.grade(cog, true);
    ok(NL.srs.stageOf(cog) >= 3, 'un mot transparent devrait sauter les premiers échelons');
    console.log('  transparent     « ' + cog.nl + ' » démarre à l’échelon ' + NL.srs.stageOf(cog));
  }

  /* La frontière est contiguë : impossible d'ouvrir une unité par-dessus un trou. */
  NL.content.units.forEach(u => NL.content.itemsOf(u.id).forEach(it => NL.srs.seed(it, 5)));
  const gapUnit = NL.content.units[3];
  NL.content.itemsOf(gapUnit.id).forEach(it => NL.srs.seed(it, 0));
  const opened = NL.content.units.map(u => NL.content.unitOpen(u.id));
  const firstShut = opened.indexOf(false);
  ok(firstShut < 0 || opened.slice(firstShut).every(o => !o),
    'the open range is not contiguous — a unit is open beyond a locked one');
  console.log('  frontière       ' + (firstShut < 0 ? 'tout ouvert' : firstShut + ' unités ouvertes, puis fermé') + ' — contigu');

  console.log('\nQUALITÉ DES LEURRES');
  /* Un QCM ne vaut que par ses mauvaises réponses. Deux tricheries se mesurent
     sans juger le sens : la bonne réponse qui est toujours la plus longue, et
     le seul mot du bon genre. */
  {
    const UU = NL.util, all = NL.content.allItems();
    const artOf = {};
    all.forEach(x => { if (x.kind === 'word' && x.art) artOf[UU.bare(x.nl)] = x.art; });
    const words = all.filter(i => i.kind === 'word' && i.art);
    let n = 0, longest = 0, sameArt = 0, dup = 0;
    words.forEach(it => {
      const t = NL.ex.get('pick').build(it);
      const right = UU.bare(it.nl);
      const wrong = t.opts.filter(o => !o.ok).map(o => o.label);
      if (wrong.length < 2) return;
      n++;
      if (wrong.every(l => l.length < right.length)) longest++;
      if (wrong.some(l => artOf[l] === it.art)) sameArt++;
      if (wrong.some(l => UU.norm(l) === UU.norm(right)) || wrong[0] === wrong[1]) dup++;
    });
    const pct = x => (x / n * 100).toFixed(1) + '%';
    console.log('  ' + n + ' mots à article : bonne réponse la plus longue ' + pct(longest) +
      ', un leurre du même genre ' + pct(sameArt));
    ok(n > 50, 'not enough article words to measure: ' + n);
    ok(dup === 0, 'an option was repeated or equalled the answer, ' + dup + ' times');
    ok(sameArt / n >= 0.8, 'distractors give the gender away too often: only ' + pct(sameArt) + ' share it');
    ok(longest / n <= 0.25, 'the answer is the longest option too often: ' + pct(longest));
  }

  /* Un leurre qui est une AUTRE bonne réponse : « bonjour » avec « hallo » ET
     « goeiedag » à l'écran, l'un des deux est compté faux. */
  {
    const UU = NL.util, all = NL.content.allItems().filter(i => i.kind === 'word' || i.kind === 'phrase');
    const senses = s => String(s || '').split(/\s*\/\s*/).map(UU.norm).filter(Boolean);
    const overlap = (a, b) => senses(a).some(x => senses(b).indexOf(x) >= 0);
    const byNl = {};
    all.forEach(x => { (byNl[UU.norm(UU.bare(x.nl))] = byNl[UU.norm(UU.bare(x.nl))] || []).push(x); });
    let built = 0, second = 0, example = '';
    /* Les mots qui ont un jumeau de sens sont rares : on les tire bien plus
       souvent, sinon le hasard ne les met presque jamais face à face. */
    const hasTwin = it => all.some(x => x !== it && x.kind === it.kind && overlap(UU.bareFr(x.fr), UU.bareFr(it.fr)));
    all.forEach(it => {
      const reps = hasTwin(it) ? 60 : 3;
      for (let k = 0; k < reps; k++) {
        const p = NL.ex.get('pick').build(it), r = NL.ex.get('recall').build(it);
        built += 2;
        p.opts.filter(o => !o.ok).forEach(o => {
          if ((byNl[UU.norm(o.label)] || []).some(x => overlap(UU.bareFr(x.fr), UU.bareFr(it.fr)))) {
            second++; example = example || UU.bareFr(it.fr) + ' → ' + o.label;
          }
        });
        r.opts.filter(o => !o.ok).forEach(o => {
          if (overlap(o.label, UU.bareFr(it.fr))) { second++; example = example || it.nl + ' → ' + o.label; }
        });
      }
    });
    console.log('  ' + built + ' QCM construits, deuxième bonne réponse parmi les leurres : ' + second);
    ok(second === 0, 'a distractor was another correct answer, ' + second + ' times (e.g. ' + example + ')');
  }

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
  const mL = blank(); mL.matchGone = ['l0', 'r0', 'l1', 'r1', 'l2', 'r2', 'l3', 'r3', 'l4'];
  ok(!NL.ex.registry.match.ready(mt, mL), 'match completed with a card still on the board');
  mL.matchGone.push('r4');
  ok(NL.ex.registry.match.ready(mt, mL), 'match never completes');
  ok(NL.ex.registry.match.view(mt, mL).length > 50, 'match rendered nothing');
  console.log('  match (5 pairs)     ok');

  /* Deux mots, une même traduction : à l'écran les deux cartes « bonjour » sont
     identiques, donc l'une ou l'autre doit être acceptée. */
  {
    const hallo = items.find(i => U.bare(i.nl) === 'hallo'), goeiedag = items.find(i => U.bare(i.nl) === 'goeiedag');
    const dag = items.find(i => U.bare(i.nl) === 'dag');
    ok(hallo && goeiedag && U.norm(U.bareFr(hallo.fr)) === U.norm(U.bareFr(goeiedag.fr)),
      'the fixture for twin translations is gone (hallo/goeiedag no longer share one)');
    if (hallo && goeiedag && dag) {
      const tw = NL.ex.registry.match.build([hallo, goeiedag, dag]);
      ok(NL.ex.registry.match.fits(tw, 0, 1) && NL.ex.registry.match.fits(tw, 1, 0),
        'two cards with the same text are not interchangeable');
      ok(!NL.ex.registry.match.fits(tw, 0, 2), 'match accepted a genuinely wrong pair');
      console.log('  match (twin « ' + U.bareFr(hallo.fr) + ' »)   either card accepted');
    }
  }

  /* Micro refusé : le message promet l'auto-évaluation, les boutons doivent suivre. */
  {
    /* Ce faux navigateur n'a pas de reconnaissance : on fait comme s'il en avait
       une, pour passer par le chemin où le refus arrive. */
    const realBlocked = NL.speech.listenBlocked;
    NL.speech.listenBlocked = () => null;
    const sp = NL.ex.get('speak'), st = sp.build(p), sL = blank();
    ok(sp.view(st, sL, 'ask').indexOf('data-self=') < 0, 'self-rating offered before the microphone was even tried');
    sL.speech.error = 'denied';
    ok(sp.view(st, sL, 'ask').indexOf('data-self="1"') >= 0, 'a refused microphone leaves no way to rate yourself');
    sL.speech.selfRated = true;
    ok(sp.ready(st, sL) && sp.judge(st, sL).ok, 'rating yourself after a refusal does not count');
    NL.speech.listenBlocked = realBlocked;
    console.log('  speak (mic refused) self-rating offered');
  }

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
