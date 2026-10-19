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
  .replace(/: 1[0-9]{12}(?![0-9])/g, ": 0")
  .replace(/\s(aria-label|placeholder|title|alt)="([^"]*)"/g, ' > $2 <')
  .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

/* Chaque état d'écran que la personne peut voir, dans un ordre fixe. `visit(nom, html)`
   reçoit le HTML de l'écran. Deux navigateurs partis de la même graine visitent les
   mêmes états : la différence entre leurs textes est une vraie différence. */
const SCREENS = ['vandaag', 'leerpad', 'praten', 'luisteren', 'meer', 'woorden', 'spiek', 'register', 'klanken', 'dehet', 'doctor', 'fouten'];
function views(B, visit) {
  const NL = B.NL, S = NL.screens.sessie, answer = require('./lib/answer')(B);
  const html = () => B.app.innerHTML;
  /* Des échéances fixes et toutes différentes : l'ordre d'une séance ne doit rien à l'horloge. */
  let seq = 0;
  const put = (it, rung) => { NL.srs.seed(it, rung); const r = NL.state.rec(it.id); r.due = 1700000000000 - 1000 * (++seq); NL.state.setRec(r); };
  const fresh = () => { NL.state.clearAll(); NL.content.refresh(); };
  const tap = d => B.listeners.click.forEach(f => f({ target: { closest: () => ({ dataset: d }) } }));
  const builtIn = () => NL.content.allItems().filter(it => it.unit !== 'eigen');

  /* 1. Les écrans, sur un compte entamé où quelques éléments sont ratés. */
  fresh();
  builtIn().forEach((it, i) => put(it, i % 7));
  builtIn().slice(0, 8).forEach((it, i) => NL.state.logReview({ id: it.id, t: Date.now() - 1000 * (i + 1), ok: false, stage: 1, kind: it.kind, ex: 'type' }));
  SCREENS.concat(['compte']).forEach(n => { NL.ui.go(n); visit(n, html()); });

  /* 2. Chaque fiche. */
  NL.content.sheets.forEach(sh => { NL.ui.go('spiek', sh.id); visit('spiek/' + sh.id, html()); });

  /* 3. Les panneaux, et les cartes d'export et d'import. */
  ['instellingen', 'reset-confirm'].forEach(s => { NL.ui.go('vandaag'); NL.ui.openSheet(s); visit('panneau ' + s, html()); });
  NL.ui.go('vandaag'); NL.ui.openSheet('instellingen');
  tap({ act: 'copy-show' }); visit('export', html());
  NL.ui.go('vandaag'); NL.ui.openSheet('instellingen');
  tap({ act: 'paste-show' }); visit('import', html());
  NL.ui.closeSheet();

  /* 4. Chaque carte de grammaire. */
  NL.ui.go('leerpad');
  NL.content.patterns.forEach(g => { NL.screens.leerpad.click({ dataset: { id: g.id } }, { act: 'gram' }); visit('gram/' + g.id, html()); NL.ui.closeSheet(); });

  /* 5. Le formulaire d'ajout. */
  NL.ui.go('woorden');
  NL.screens.woorden.click({ dataset: {} }, { act: 'addform' }); visit('addform', html());
  NL.screens.woorden.click({ dataset: {} }, { act: 'addcancel' });

  /* 6. Un mot à soi, dans le dictionnaire. */
  const mine = NL.state.addCustom({ id: 'x-lang-1', nl: 'de vergaderzaal', fr: 'la salle de réunion', be: null, kind: 'word' });
  NL.content.refresh(); NL.ui.go('woorden'); visit('woorden/à soi', html());
  NL.state.delCustom(mine.id); NL.content.refresh();

  /* 7. Chaque conversation, jusqu'au bout. */
  NL.content.scenarios.forEach(s => {
    NL.ui.go('scenario', s.id);
    let guard = 0;
    visit('scenario/' + s.id + '/0', html());
    while (html().indexOf('scn-done') < 0 && guard++ < 60) {
      ['next', 'choice', 'self', 'accept'].forEach(k => {
        const c = k === 'next' ? { step: 'next' } : k === 'choice' ? { choice: '0' } : k === 'self' ? { self: '1' } : { act: 'accept' };
        NL.screens.scenario.click({ dataset: {} }, c);
        visit('scenario/' + s.id + '/' + guard + k, html());
      });
    }
    ok(html().indexOf('scn-done') >= 0, 'la conversation ' + s.id + ' ne finit pas');
  });

  /* 8. L'écoute : comprendre jusqu'au bilan, puis répéter. */
  NL.ui.go('luisteren');
  NL.screens.luisteren.click({ dataset: {} }, { act: 'begrijpen' });
  let guard = 0;
  while (html().indexOf('done-stage') < 0 && guard++ < 20) {
    visit('luisteren/' + guard, html());
    NL.screens.luisteren.click({ dataset: {} }, { opt: '0' });
    visit('luisteren/' + guard + '/réponse', html());
    NL.screens.luisteren.click({ dataset: {} }, { act: 'next' });
  }
  visit('luisteren/bilan', html());
  NL.screens.luisteren.click({ dataset: {} }, { act: 'menu' });
  NL.screens.luisteren.click({ dataset: {} }, { act: 'nazeggen' });
  visit('nazeggen', html());

  /* 9. Les séances, à chaque échelon. */
  for (let r = 0; r <= 6; r++) {
    fresh();
    const all = builtIn();
    all.forEach(it => put(it, r));
    const shown = new Set();
    let sessions = 0;
    while (shown.size < all.length && sessions++ < 80) {
      if (!S.begin('vandaag')) break;
      NL.ui.go('sessie');
      let quit = false, turns = 0;
      while (S.peek() && turns++ < 120) {
        const c = S.peek(), wasMatch = c.ex === 'match';
        (c.items || [c.task.item]).forEach(it => { if (it && it.id) shown.add(it.id); });
        visit('sessie/' + r + '/' + c.ex, html());
        if (!quit) { quit = true; NL.ui.go('vandaag'); visit('quit-session', html()); NL.ui.closeSheet(); }
        answer.right();
        if (!wasMatch) visit('sessie/' + r + '/' + c.ex + '/verdict', html());
        answer.next(wasMatch);
        if (html().indexOf('done-stage') >= 0) { visit('sessie/' + r + '/bilan', html()); break; }
      }
      S.abandon();
    }
  }
}

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

  /* 2c. Des mots à soi dans l'autre langue : lus dans la leur, jamais proposés en
     faux aux autres, jamais une option vide. */
  const own = boot(NL => pairUp(NL.content));
  const lib = boot(NL => {
    const u = NL.content.units[0];
    u.words[1].fr = u.words[0].fr + 'x';
    pairUp(NL.content);
    u.words[0].en = 'shared'; u.words[1].en = 'shared';
  });
  return Promise.all([own.NL.state.open(), lib.NL.state.open()]).then(() => {
    const NL = own.NL, G = NL.gloss;
    const items = [
      { id: 'x-own-1', nl: 'de vergaderzaal', en: 'meeting room', kind: 'word' },
      { id: 'x-own-2', nl: 'ik ben te laat', en: "I'm late", kind: 'phrase' }
    ].map(w => { NL.state.addCustom(w); NL.content.refresh(); const it = NL.content.byId(w.id); NL.srs.seed(it, 2); return it; });
    NL.content.refresh();
    items.forEach(w => {
      const it = NL.content.byId(w.id);
      for (let i = 0; i < 50; i++) {
        const p = NL.ex.get('pick').build(it), r = NL.ex.get('recall').build(it);
        ok(p.prompt === it.en, 'pick demande « ' + p.prompt + ' » au lieu de « ' + it.en + ' »');
        const right = r.opts.find(o => o.ok);
        ok(right && right.label === it.en, 'recall : la bonne option est « ' + (right && right.label) + ' »');
        p.opts.concat(r.opts).forEach(o => ok(o.label !== '' && o.label !== 'undefined', 'option vide ou indéfinie pour ' + it.nl));
      }
    });
    NL.content.itemsOf(NL.content.units[0].id).forEach(it => {
      for (let i = 0; i < 50; i++) {
        NL.ex.get('recall').build(it).opts.forEach(o => ok(o.label !== 'meeting room' && o.label !== "I'm late",
          'un mot à soi en anglais est offert en faux : ' + o.label));
      }
    });

    /* 2d. Pas de deuxième bonne réponse dans la langue lue. */
    const L = lib.NL, LG = L.gloss;
    LG.use('en');
    const u0 = L.content.units[0].id;
    const i0 = L.content.byId(u0 + ':w0'), i1 = L.content.byId(u0 + ':w1');
    let twice = 0;
    for (let i = 0; i < 100; i++) {
      const labels = L.ex.get('recall').build(i0).opts.map(o => o.label);
      if (labels.filter(l => l === 'shared').length !== 1) twice++;
    }
    ok(twice === 0, 'recall : « shared » n\'apparaît pas une seule fois dans ' + twice + ' tirages sur 100');
    const words = L.content.allItems().filter(it => it.kind === 'word' && it.id !== i0.id && it.id !== i1.id);
    let clash = 0;
    for (let i = 0; i < 100; i++) {
      const t = L.ex.get('match').build([i0, i1].concat(L.util.sample(words, 3)));
      for (let x = 0; x < t.pairs.length; x++) for (let y = x + 1; y < t.pairs.length; y++) {
        if (L.util.norm(t.pairs[x].gloss) === L.util.norm(t.pairs[y].gloss) && !L.ex.get('match').fits(t, x, y)) clash++;
      }
    }
    ok(clash === 0, 'match : ' + clash + ' paires de cartes identiques que fits ne joint pas');
    const read = () => (lib.app.innerHTML.match(/<span class="opt-key">\d<\/span><span>[^<]*<\/span>/g) || [])
      .map(s => s.replace(/<[^>]*>/g, '').replace(/^\d/, ''));
    let dup = 0, screens = 0;
    for (let k = 0; k < 7; k++) {
      L.ui.go('luisteren');
      L.screens.luisteren.click({ dataset: {} }, { act: 'begrijpen' });
      for (let c = 0; c < 8; c++) {
        const o = read().map(L.util.norm);
        screens++;
        if (o.length !== 3 || new Set(o).size !== 3) dup++;
        L.screens.luisteren.click({ dataset: {} }, { act: 'next' });
      }
    }
    ok(screens >= 50 && dup === 0, 'écoute : ' + dup + ' écrans sur ' + screens + ' n\'ont pas trois options différentes');
    ok(G.current() === 'fr', 'la langue lue par défaut n\'est pas le français');

    console.log('\n' + checks + ' contrôles, ' + (fails === 0 ? 'LANGUE CONFORME' : fails + ' ÉCHEC(S)'));
    process.exit(fails ? 1 : 0);
  });
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
