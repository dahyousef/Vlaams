/* 400 jours d'utilisation quotidienne contre le VRAI moteur.
   C'est la suite qui aurait attrapé chacun des défauts trouvés jusqu'ici :
   la dette de révisions, l'oscillation sous plafond, la monotonie des types,
   et le contenu épuisé au jour 27. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[2];
const DAYS = Number(process.argv[3] || 400);

let NOW = Date.parse('2026-01-05T08:00:00Z');
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('   ✗ ' + m); fails++; } };
const P = (l, v) => console.log('  ' + String(l).padEnd(38) + v);

const store = {};
const mk = () => ({
  tagName: 'DIV', innerHTML: '', value: '', dataset: {}, files: [],
  classList: { contains: () => false, add() {}, remove() {} },
  addEventListener() {}, setSelectionRange() {}, focus() {}, click() {}, select() {},
  querySelector: () => null, querySelectorAll: () => [], closest: () => null,
  matches: () => false, remove() {}, appendChild() {}, setAttribute() {}, removeAttribute() {},
  getBoundingClientRect: () => ({ width: 400, height: 600, top: 0, left: 0 })
});
const app = mk();
class FakeDate extends Date {
  constructor(...a) { if (!a.length) super(NOW); else super(...a); }
  static now() { return NOW; }
}
const ctx = {
  console, setTimeout: f => { try { f(); } catch (e) {} return 0; },
  clearTimeout() {}, setInterval() {}, clearInterval() {}, requestAnimationFrame: f => f(),
  Math, Date: FakeDate, JSON, Map, Set, RegExp, Array, Object, String, Number, Promise, Error, Boolean,
  URL: { createObjectURL: () => 'b', revokeObjectURL() {} },
  Blob: function () {}, Audio: function () { return { play: () => Promise.resolve() }; },
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }
  },
  navigator: { onLine: true, userAgent: 'Chrome/120 OPR/106' },
  location: { hash: '', protocol: 'https:' },
  speechSynthesis: { getVoices: () => [{ name: 'Bart', lang: 'nl-BE' }], speak(u) { if (u.onend) u.onend(); }, cancel() {}, addEventListener() {} },
  SpeechSynthesisUtterance: function (t) { this.text = t; },
  document: {
    readyState: 'complete', documentElement: { setAttribute() {}, removeAttribute() {} },
    getElementById: id => (id === 'app' ? app : mk()),
    querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
    activeElement: { tagName: 'BODY' }, createElement: mk, body: { appendChild() {} }
  }
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx; ctx.top = ctx; ctx.addEventListener = () => {};
vm.createContext(ctx);
fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8').match(/SRC="([\s\S]*?)"/)[1]
  .split('\n').map(s => s.trim()).filter(Boolean)
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }));
const NL = ctx.NL, U = NL.util;

/* Combien de secondes coûte chaque type — pour traduire la charge en minutes. */
const SECS = { match: 22, pick: 7, recall: 7, intrus: 9, article: 6, vlaams: 9,
  cloze: 12, bank: 16, order: 16, corrige: 14, dictation: 20, type: 20, speak: 26, open: 55 };

NL.state.open().then(() => {
  NL.content.refresh();
  const S = NL.screens.sessie;
  const total = NL.content.allItems().length;

  const perDay = [], mix = {}, seenOnDay = {};
  let backToBack = 0, prevEx = null, exhausted = null, maxBacklog = 0, tasks = 0;

  for (let day = 1; day <= DAYS; day++) {
    NOW = Date.parse('2026-01-05T08:00:00Z') + (day - 1) * 86400000;
    NL.state.touchDay();
    maxBacklog = Math.max(maxBacklog, NL.srs.dueItems().length);

    let dayTasks = 0, daySecs = 0, guard = 0;
    /* Autant de séances que le budget du jour l'autorise. */
    while (NL.srs.budgetLeft() > 0 && guard++ < 12 && S.begin('vandaag')) {
      let n = 0;
      while (n++ < 40) {
        const c = S.peek(); if (!c) break;
        tasks++; dayTasks++;
        daySecs += SECS[c.ex] || 15;
        mix[c.ex] = (mix[c.ex] || 0) + 1;
        if (c.ex === prevEx && c.ex !== 'match') backToBack++;
        prevEx = c.ex;
        c.items.forEach(it => {
          seenOnDay[it.id] = seenOnDay[it.id] || new Set();
          seenOnDay[it.id].add(day);
        });
        const right = Math.random() < 0.85;
        c.items.forEach(it => NL.srs.grade(it, right, { spoken: c.ex === 'speak' && right, ex: c.ex }));
        NL.srs.spend(1);
        const before = S.peek();
        try { S.click({ dataset: {} }, { next: '1' }); } catch (e) { break; }
        if (S.peek() === before) break;
      }
      S.abandon();
    }
    const met = NL.srs.counts().seen;
    if (!exhausted && met >= total) exhausted = day;
    perDay.push({ day, tasks: dayTasks, mins: Math.round(daySecs / 60), met,
      mastered: NL.content.courseProgress().mastered });
  }

  const cap = NL.srs.pace().cap;
  const over = perDay.filter(d => d.tasks > cap + 2);
  const peak = Math.max(...perDay.map(d => d.mins));
  const busiest = Math.max(...perDay.map(d => d.tasks));

  console.log('\nCHARGE SUR ' + DAYS + ' JOURS   (rythme ' + (NL.state.meta().pace || 'normal') +
    ', plafond ' + cap + ' exercices)');
  console.log('='.repeat(70));
  console.log('  jour   exercices   minutes   rencontrés   maîtrisés');
  [1, 7, 30, 90, 180, 300, DAYS].filter(d => d <= DAYS).forEach(d => {
    const r = perDay[d - 1];
    console.log('  ' + String(r.day).padStart(4) + String(r.tasks).padStart(12) +
      String(r.mins).padStart(10) + String(r.met).padStart(13) + String(r.mastered).padStart(12));
  });

  console.log('\nCE QUE LA SIMULATION VÉRIFIE');
  console.log('='.repeat(70));
  ok(over.length === 0, over.length + ' jours dépassent le plafond quotidien — la dette explose');
  P('plafond quotidien respecté', over.length === 0 ? 'oui, ' + busiest + ' au maximum' : 'NON');
  P('pic de charge', peak + ' min');
  ok(peak <= 60, 'le pic dépasse une heure par jour : ce n’est plus compact');

  /* Aucun élément ne doit revenir tous les jours — le piège du plafond. */
  let worst = 0, worstId = '';
  Object.keys(seenOnDay).forEach(id => {
    const f = seenOnDay[id].size / DAYS;
    if (f > worst) { worst = f; worstId = id; }
  });
  ok(worst <= 0.4, 'un élément revient ' + Math.round(worst * 100) + '% des jours (' + worstId + ') — il oscille sous son plafond');
  P('élément le plus fréquent', Math.round(worst * 100) + '% des jours');

  const pc = k => Math.round((mix[k] || 0) / tasks * 100);
  const recog = pc('pick') + pc('recall') + pc('match');
  /* Le vrai seuil n'est pas un chiffre rond : avec une distribution donnée, un
     ordre aléatoire produit déjà Σp² de répétitions dos à dos. On exige donc que
     l'étalement fasse NETTEMENT mieux que le hasard, pas qu'il descende sous un
     plancher mathématiquement inatteignable. */
  const floor = Object.keys(mix).reduce((a2, k) => a2 + Math.pow(mix[k] / tasks, 2), 0);
  const actual = backToBack / tasks;
  ok(actual < floor * 0.85,
    "l etalement n apporte rien : " + Math.round(actual * 100) + "% contre " +
    Math.round(floor * 100) + '% au hasard');
  P('répétitions dos à dos', Math.round(actual * 100) + '%  (hasard : ' + Math.round(floor * 100) + '%)');
  ok(recog < 20, 'trop de pure reconnaissance : ' + recog + '%');
  P('pure reconnaissance', recog + '%');
  P('production (parler, écrire, ouvert)', (pc('speak') + pc('type') + pc('open')) + '%');
  P('arriéré maximum', maxBacklog);

  console.log('\nMÉLANGE DES TYPES');
  console.log('='.repeat(70));
  Object.keys(mix).sort((a, b) => mix[b] - mix[a]).forEach(k =>
    console.log('  ' + k.padEnd(12) + String(mix[k]).padStart(7) + '  ' + pc(k) + '%  ' + '█'.repeat(pc(k))));

  console.log('\nPLAFOND DE CONTENU');
  console.log('='.repeat(70));
  P('éléments au catalogue', total);
  P('tout rencontré le jour', exhausted || 'pas encore');
  P('maîtrisé au jour ' + DAYS, perDay[DAYS - 1].mastered + ' / ' + total);
  if (exhausted && exhausted < 200) {
    console.log('  → le contenu s’épuise : c’est la phase 2 qui le règle, pas le moteur.');
  }

  console.log('\n' + checks + ' vérifications, ' + (fails === 0 ? 'AUCUN PROBLÈME' : fails + ' PROBLÈME(S)'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
