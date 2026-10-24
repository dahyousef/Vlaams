/* La langue d'affichage. Le cours se charge tel quel, ou « apparié » : chaque sens et
   chaque texte reçoit un anglais factice (EN0, EN1…). L'écran montre alors ce qu'il
   montrerait une fois le contenu traduit, sans attendre la traduction. */
const fs = require('fs'), path = require('path');
const browser = require('./lib/browser');
const { PROSE } = require('./lib/prose');
const tree = require('./lib/tree');
const { text, runs, count, argsOf } = require('./lib/langs');
const { fakeSupabase } = require('./lib/supabase');
const { dueReviews } = require('./lib/seed');
const ROOT = process.argv[2] || path.join(__dirname, '..');
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

function pairUp(C) {
  let n = 0;
  tree.rewriteCourse(C, (s, key) => typeof s === 'string' && PROSE.indexOf(key) >= 0 ? { fr: s, en: 'EN' + (n++) } : s);
  tree.visitCourse(C, v => { if (v && typeof v === 'object' && typeof v.fr === 'string' && v.en === undefined) v.en = 'EN' + (n++); });
  return n;
}
const T0 = Date.parse('2026-10-05T08:00:00Z');
/* prepare : ce que l'essai change dans l'app chargée, avant que src/app.js la démarre.
   store : le stockage d'un appareil, pour le recharger.
   account : un serveur neuf, et l'appareil déjà connecté.
   timers : 'held' pour des minuteurs qui attendent B.tick() ; absent, ils partent aussitôt. */
function boot({ prepare, store, account, timers } = {}) {
  const dev = { store: store || {} };
  if (account) dev.store['sb-session'] = JSON.stringify({ user: { id: 'uid-lang', email: 'lang@example.com' } });
  return browser.open({ root: ROOT, seed: browser.SEED, now: T0, store: dev.store, byId: 'stub', media: true, prepare, timers,
    config: account ? { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'anon' } : undefined,
    supabase: account ? fakeSupabase().fakeLib(dev) : undefined,
    voices: [{ name: 'Microsoft Bart - Dutch (Belgium)', lang: 'nl-BE', localService: true }] });
}
/* Le texte lu, étiquettes comprises : text() de test/lib/langs.js, avec aria-label, placeholder, title et alt gardés. */
const textAndLabels = html => text(String(html).replace(/\s(aria-label|placeholder|title|alt)="([^"]*)"/g, ' > $2 <'));

/* Chaque état d'écran que la personne peut voir, dans un ordre fixe. `visit(nom, html)`
   reçoit le HTML de l'écran. Deux navigateurs partis de la même graine visitent les
   mêmes états : la différence entre leurs textes est une vraie différence. */
const { SCREENS } = require('./lib/screens');
function views(B, visit) {
  const NL = B.NL, S = NL.screens.sessie, answer = require('./lib/answer')(B);
  const html = () => B.app.innerHTML;
  /* Des échéances fixes et toutes différentes : l'ordre d'une séance ne doit rien à l'horloge. */
  let seq = 0;
  const put = (it, rung) => { NL.srs.seed(it, rung); const r = NL.state.rec(it.id); r.due = T0 - 1000 * (++seq); NL.state.setRec(r); };
  const fresh = () => { NL.state.clearAll(); NL.content.refresh(); };
  const builtIn = () => NL.content.allItems().filter(it => it.unit !== 'eigen');

  /* 1. Les écrans, sur un compte entamé où quelques éléments sont ratés. */
  fresh();
  builtIn().forEach((it, i) => put(it, i % 7));
  builtIn().slice(0, 8).forEach((it, i) => NL.state.logReview({ id: it.id, t: B.clock.now() - 1000 * (i + 1), ok: false, stage: 1, kind: it.kind, ex: 'type' }));
  SCREENS.concat(['compte']).forEach(n => { NL.ui.go(n); visit(n, html()); });

  /* 2. Chaque fiche. */
  NL.content.sheets.forEach(sh => { NL.ui.go('spiek', sh.id); visit('spiek/' + sh.id, html()); });

  /* 3. Les panneaux, et les cartes d'export et d'import. */
  ['instellingen', 'reset-confirm'].forEach(s => { NL.ui.go('vandaag'); NL.ui.openSheet(s); visit('panneau ' + s, html()); });
  NL.ui.go('vandaag'); NL.ui.openSheet('instellingen');
  B.tap({ act: 'copy-show' }); visit('export', html());
  NL.ui.go('vandaag'); NL.ui.openSheet('instellingen');
  B.tap({ act: 'paste-show' }); visit('import', html());
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

/* 3. Toute l'interface vit dans la table de texte. Deux contrôles :
   3a. des marqueurs — chaque feuille de NL.t devient ⟦clé⟧, chaque texte du cours ⟪n⟫ ;
       ce qui reste à l'écran est du néerlandais, un chiffre, ou un nom propre de ALLOW ;
   3b. un balayage de src/ — aucun littéral français hors de fr.js, en.js et du cours. */
const FR = /[éèêàâçùûôîœ’]|\b(le|la|les|un|une|des|du|de|et|pas|ou|ton|ta|tes|tu|te|toi|ici|dans|avec|sur|pour|qui|que|ne|nord)\b/i;

/* Les mots qui peuvent rester à l'écran sans passer par la table, avec la raison. */
const ALLOW = {
  /* le nom des voix et des navigateurs : ce que le système en dit */
  microsoft: 'nom de voix', bart: 'nom de voix', dutch: 'nom de voix', belgium: 'nom de voix',
  opera: 'nom de navigateur', chrome: 'nom de navigateur', edge: 'nom de navigateur',
  safari: 'nom de navigateur', firefox: 'nom de navigateur', brave: 'nom de navigateur',
  /* les moteurs de stockage, tels que le navigateur les nomme */
  indexeddb: 'moteur de stockage', localstorage: 'moteur de stockage',
  /* le nom de l'app, et l'article néerlandais présenté tel quel */
  vlaams: 'nom de l’app', de: 'de / het, présenté tel quel', het: 'de / het, présenté tel quel',
  /* la phrase du test de voix : du néerlandais */
  goeiemorgen: 'phrase de test en néerlandais', alles: 'phrase de test en néerlandais',
  goed: 'phrase de test en néerlandais', met: 'phrase de test en néerlandais', u: 'phrase de test en néerlandais',
  /* les codes de langue des voix, tels que le navigateur les donne (nl-BE) */
  nl: 'code de langue', be: 'code de langue',
  /* la touche « ij » du clavier de lettres spéciales : un digraphe néerlandais */
  ij: 'digraphe néerlandais'
};
/* Les littéraux de src/ qui passent le balayage, exacts, avec la raison. */
const ALLOW_LITERALS = {
  'de / het': 'l’article néerlandais, présenté tel quel',
  'Goeiemorgen, alles goed met u?': 'la phrase du test de voix : du néerlandais'
};

function marked(NL) {
  pairUp(NL.content);
  let n = 0;
  const mk = () => '⟪' + (n++) + '⟫';
  tree.rewriteCourse(NL.content, (s, key) => typeof s === 'string' && (key === 'fr' || key === 'en' || PROSE.indexOf(key) >= 0) ? mk() : s);
  /* Les trois pages françaises : tout ce qui n'est pas du néerlandais. */
  ['sounds', 'loans', 'faux'].forEach(k => {
    NL.content[k].forEach(r => Object.keys(r).forEach(f => { if (f !== 'nl' && typeof r[f] === 'string') r[f] = mk(); }));
  });
  const T = NL.t;
  Object.keys(T).forEach(k => { T[k] = markLeaves(T[k], k, k === 'nav'); });
  if (NL.tables) Object.keys(NL.tables).forEach(l => {
    const tb = NL.tables[l];
    if (tb !== T) Object.keys(tb).forEach(k => { tb[k] = markLeaves(tb[k], l + '.' + k, k === 'nav'); });
  });
}

/* Les mots néerlandais du cours : nl, be, les phrases, les colonnes du registre
   (std), les exemples des règles (ex), les modèles de réponse (model) et les
   identifiants d'unité, qui sont des mots néerlandais. */
const DUTCH_KEYS = ['nl', 'be', 'std', 'ex', 'model', 'id', 'nlName'];
function dutchWords(NL) {
  const set = new Set();
  const add = s => String(s).toLowerCase().split(/[^\p{L}\p{N}]+/u).forEach(w => { if (w) set.add(w); });
  tree.visit(NL.content, (v, key) => { if (DUTCH_KEYS.indexOf(key) >= 0 && typeof v === 'string') add(v); });
  NL.t.nav.forEach(n => add(n.nl));
  Object.keys(NL.content.DEFAULTS).forEach(k => add(NL.content.DEFAULTS[k]));
  return set;
}

function srcFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((acc, e) => {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'content' ? acc : acc.concat(srcFiles(f));
    return /\.js$/.test(e.name) && e.name !== 'fr.js' && e.name !== 'en.js' ? acc.concat(f) : acc;
  }, []);
}

function interfaceCheck() {
  const m = boot({ prepare: marked });
  return m.NL.state.open().then(() => {
    const dutch = dutchWords(m.NL), seen = new Map();
    views(m, (n, h) => {
      /* Le texte d'une sauvegarde exportée est une donnée, pas l'interface ; les entités
         (&middot;) sont de la ponctuation ; un mot d'une lettre ou un chiffre n'est pas un mot.
         Deux autres données ne sont pas l'interface non plus : les faux amis des anglophones, écrits en anglais
         dans les deux affichages (les cellules reg-cell std de register), et les mots qu'une personne a tapés
         elle-même (leur ligne du dictionnaire, repérée par data-del). */
      textAndLabels(String(h).replace(/<textarea[\s\S]*?<\/textarea>/g, ' ').replace(/<span class="reg-cell std" lang="en-GB">[\s\S]*?<\/span>/g, ' ').replace(/<div class="vrow">[\s\S]*?<\/div>/g, row => (row.indexOf('data-del=') >= 0 ? ' ' : row)).replace(/&[a-z]+;/g, ' ')).replace(/⟦[^⟧]*⟧|⟪[^⟫]*⟫/g, ' ').split(/[^\p{L}\p{N}]+/u).forEach(w => {
        w = w.toLowerCase();
        if (w.length > 1 && !/\p{N}/u.test(w) && !dutch.has(w) && !Object.prototype.hasOwnProperty.call(ALLOW, w) && !seen.has(w)) seen.set(w, n);
      });
    });
    seen.forEach((n, w) => ok(false, 'mot hors table à l’écran : « ' + w + ' » (vue ' + n + ')'));
    ok(m.NL.t.nav.every(x => x.id && x.nl && x.label && x.fr === undefined), 'nav : chaque entrée est { id, label, nl }');
  }).then(() => {
    srcFiles(path.join(ROOT, 'src')).forEach(f => {
      const code = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1');
      const lit = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
      let x;
      while ((x = lit.exec(code))) {
        const s = x[1] !== undefined ? x[1] : x[2] !== undefined ? x[2] : x[3];
        if ((s.match(/\p{L}/gu) || []).length < 3) continue;
        if (FR.test(s) && !Object.prototype.hasOwnProperty.call(ALLOW_LITERALS, s)) {
          ok(false, 'littéral français hors de fr.js : ' + path.relative(ROOT, f) + ' « ' + s.slice(0, 60) + ' »');
        }
      }
    });
  });
}

/* 4. Les deux tables d'interface : mêmes clés, même forme, mêmes chiffres et mêmes {…}. */
/* Les clés dont l'anglais s'écrit comme le français, exactes, avec la raison. */
const SAME = {
  brandSub: 'deux espaces réservés et un point : aucun mot à traduire',
  stop: 'le même mot dans les deux langues',
  tallyXp: 'sigle identique',
  tallyScore: 'le même mot dans les deux langues (score)',
  tallyRecord: 'le même mot dans les deux langues (record)',
  paceNormal: 'le même mot dans les deux langues (normal)',
  sessionOf: 'deux chiffres et une barre : aucun mot à traduire',
  talkEyebrow: 'conversations : le même mot dans les deux langues',
  wordsPhNl: 'exemple en néerlandais : la même chose dans les deux langues'
};
function tableCheck(NL) {
  const fr = NL.tables && NL.tables.fr, en = NL.tables && NL.tables.en;
  ok(fr && en, 'NL.tables.fr et NL.tables.en existent');
  if (!(fr && en)) return;
  const kind = v => Array.isArray(v) ? 'array' : typeof v;
  const holes = s => (String(s).match(/[0-9]+|\{[^}]*\}/g) || []).sort().join('|');
  const flat = v => Array.isArray(v) ? v.join(' ') : String(v);
  Object.keys(fr).forEach(k => {
    ok(Object.prototype.hasOwnProperty.call(en, k), 'en : la clé « ' + k + ' » manque');
    if (!Object.prototype.hasOwnProperty.call(en, k)) return;
    const f = fr[k], e = en[k];
    ok(kind(f) === kind(e), 'en.' + k + ' : type ' + kind(e) + ' au lieu de ' + kind(f));
    if (kind(f) !== kind(e)) return;
    if (typeof f === 'function') {
      ok(f.length === e.length, 'en.' + k + ' : ' + e.length + ' argument(s) au lieu de ' + f.length);
      [[3, 7, 12], Array(f.length).fill(1)].forEach(n => {
        const args = argsOf(k, f, n);
        const rf = f.apply(null, args), re = e.apply(null, args);
        ok(typeof rf === 'string' && typeof re === 'string', k + ' : une fonction doit rendre une chaîne');
        if (typeof rf === 'string' && typeof re === 'string') {
          ok(holes(rf) === holes(re), 'en.' + k + ' : chiffres ou {…} différents (« ' + rf + ' » / « ' + re + ' »)');
          ok(rf !== re || SAME[k], 'en.' + k + ' : identique au français');
        }
      });
    } else if (Array.isArray(f)) {
      ok(f.length === e.length, 'en.' + k + ' : ' + e.length + ' entrées au lieu de ' + f.length);
      if (k === 'nav') {
        f.forEach((x, i) => ok(e[i] && e[i].id === x.id && e[i].nl === x.nl, 'en.nav[' + i + '] : id et nl changés'));
      } else {
        ok(holes(flat(f)) === holes(flat(e)), 'en.' + k + ' : chiffres ou {…} différents');
        f.forEach((x, i) => ok(x !== e[i] || SAME[k], 'en.' + k + '[' + i + '] : identique au français'));
      }
    } else {
      ok(holes(f) === holes(e), 'en.' + k + ' : chiffres ou {…} différents (« ' + f + ' » / « ' + e + ' »)');
      ok(f !== e || SAME[k], 'en.' + k + ' : identique au français');
    }
  });
  Object.keys(en).forEach(k => ok(Object.prototype.hasOwnProperty.call(fr, k), 'en : la clé « ' + k + ' » n\'est pas dans fr'));
  Object.keys(SAME).forEach(k => ok(Object.prototype.hasOwnProperty.call(fr, k), 'SAME : « ' + k + ' » n\'est pas une clé'));
}

/* 5. La langue d'affichage : le réglage, le changement qui attend la fin de la
   séance, l'avis, les mots à soi, ce que la restauration et la remise à zéro gardent. */
const French = B => { B.NL.state.setMeta({ displayLang: 'fr' }); B.NL.lang.apply(); };
const English = B => { B.NL.state.setMeta({ displayLang: 'en' }); B.NL.lang.apply(); };
const pageLang = B => B.ctx.document.documentElement.attrs.lang;
/* La session arrive juste après open() : on l'attend, 5 ms de temps réel. */
const signedIn = B => new Promise(res => setTimeout(res, 5)).then(() => {
  ok(B.NL.sync.user && B.NL.sync.user.id === 'uid-lang', '5d : le faux compte n\'est pas ouvert');
});

/* Les feuilles d'une table deviennent ⟦préfixe:clé⟧ ; `keep` garde id et nl (la navigation). */
function markLeaves(v, p, keep) {
  return tree.rewrite(v, (x, key, where) => {
    if (keep && (key === 'id' || key === 'nl')) return x;
    if (typeof x === 'string') return '⟦' + where + '⟧';
    return typeof x === 'function' ? () => '⟦' + where + '⟧' : x;
  }, '', p);
}
/* 5f : le cours apparié, puis le français du cours en ⟪n⟫ et les deux tables en ⟦fr:clé⟧ et ⟦en:clé⟧. */
function markedBoth(NL) {
  pairUp(NL.content);
  let n = 0;
  tree.rewriteCourse(NL.content, (s, key) => typeof s === 'string' && key === 'fr' ? '⟪' + (n++) + '⟫' : s);
  ['fr', 'en'].forEach(l => {
    const tb = NL.tables[l];
    Object.keys(tb).forEach(k => { tb[k] = markLeaves(tb[k], l + ':' + k, k === 'nav'); });
  });
  Object.keys(NL.t).forEach(k => { NL.t[k] = markLeaves(NL.t[k], 'fr:' + k, k === 'nav'); });
  /* Les trois pages françaises : le français du texte en ⟪n⟫ aussi (elles sont des chaînes simples). */
  const mark = (rows, keys) => rows.forEach(r => keys.forEach(k => { if (typeof r[k] === 'string') r[k] = '⟪' + (n++) + '⟫'; }));
  mark(NL.content.sounds, ['say']); mark(NL.content.loans, ['fr', 'note']); mark(NL.content.faux, ['fr', 'trap']);
}

function langChecks() {
  /* 5a. Un appareil qui n'a jamais choisi ne défait pas un choix. */
  const A = boot();
  return A.NL.state.open().then(() => {
    const NL = A.NL;
    ok(NL.sync.mergeMeta({ displayLang: 'fr', updatedAt: 1 }, { updatedAt: 2 }).displayLang === 'fr', '5a : la fusion perd displayLang: fr');
    ok(!Object.prototype.hasOwnProperty.call(NL.state.meta(), 'displayLang'), '5a : un appareil neuf porte déjà displayLang');
    ok(NL.lang.current() === 'en', '5a : sans choix, la langue n\'est pas l\'anglais');
    ok(pageLang(A) === 'en-GB', '5a : <html lang> vaut « ' + pageLang(A) + ' » au lieu de en-GB');
    ok(NL.t.nav[1].label === NL.tables.en.nav[1].label, '5a : NL.t n\'est pas la table anglaise');

    /* 5b. Un changement qui arrive en pleine séance ou conversation attend le premier écran d'après.
       Les minuteurs de B attendent B.tick(). Partis aussitôt, ils finiraient le tour où
       l'avis se lève avant l'écran suivant : seen() l'effacerait sans que rien ne le voie. */
    const B = boot({ timers: 'held' });
    return B.NL.state.open().then(() => {
      const N = B.NL, S = N.screens.sessie, html = () => B.app.innerHTML;
      const fr = N.tables.fr, en = N.tables.en;
      dueReviews(N, 12, T0);
      /* Le tour du démarrage est fini avant le premier geste de la personne. Chaque essai part
         d'un tour fini et finit le sien. */
      B.tick();
      const waits = (what, enter) => {
        ok(B.waiting() === 0, '5b ' + what + ' : ' + B.waiting() + ' minuteur(s) d\'avant attendent encore B.tick()');
        enter();
        const before = textAndLabels(html());
        N.state.setMeta({ displayLang: 'fr' }, true);   // ce que fait une synchro
        N.ui.render();                                  // sans le garde de app.js : render() se garde seul
        ok(textAndLabels(html()) === before, '5b ' + what + ' : l\'écran a changé en pleine séance');
        ok(pageLang(B) === 'en-GB', '5b ' + what + ' : <html lang> a changé en pleine séance (' + pageLang(B) + ')');
        if (what === 'séance') B.tap({ quitYes: '1' }); else N.ui.go('vandaag');
        const t = textAndLabels(html());
        ok(t.indexOf(fr.nav[1].label) >= 0 && t.indexOf(en.nav[1].label) < 0, '5b ' + what + ' : l\'écran d\'après n\'est pas en français');
        ok(pageLang(B) === 'fr', '5b ' + what + ' : <html lang> vaut « ' + pageLang(B) + ' » après la sortie');
        ok(count(t, fr.langNotice) === 1, '5b ' + what + ' : l\'avis s\'affiche ' + count(t, fr.langNotice) + ' fois au lieu d\'une');
        N.ui.go('leerpad');
        ok(count(textAndLabels(html()), fr.langNotice) === 1, '5b ' + what + ' : l\'avis remplacé dans le tour où il s\'est levé est perdu');
        B.tick();
        N.ui.go('vandaag');
        ok(count(textAndLabels(html()), fr.langNotice) === 0, '5b ' + what + ' : l\'avis revient à l\'écran d\'après, un tour plus tard');
        English(B); N.ui.go('vandaag');
        B.tick();
      };
      waits('séance', () => { ok(S.begin('vandaag'), '5b : aucune séance à démarrer'); N.ui.go('sessie'); });
      waits('conversation', () => N.ui.go('scenario', N.content.scenarios[0].id));
      /* Deux avis levés dans un même tour attendent un seul minuteur, et le tour d'après les efface. */
      N.state.setMeta({ displayLang: 'fr' }, true); N.lang.applyAndTell();
      N.state.setMeta({ displayLang: 'en' }, true);
      const waited = B.waiting();
      N.lang.applyAndTell();
      ok(B.waiting() === waited, '5b : un second avis dans le même tour pose un second minuteur (' + waited + ' puis ' + B.waiting() + ' en attente)');
      B.tick(); N.lang.seen();
      ok(N.lang.notice() === '', '5b : l\'avis levé deux fois dans un tour est encore là au tour d\'après');

      /* 5c. Un mot à soi garde la langue où il a été tapé, et se lit dans cette langue. */
      const C = boot();
      return C.NL.state.open().then(() => {
        const NL = C.NL;
        French(C);
        const add = (nl, gl) => {
          C.clock.advance(1); /* un identifiant par milliseconde */
          C.fields['add-nl'] = nl; C.fields['add-gloss'] = gl;
          NL.ui.go('woorden');
          NL.screens.woorden.click({ dataset: {} }, { act: 'addform' });
          NL.screens.woorden.click({ dataset: {} }, { act: 'addsave' });
        };
        add('de vergaderzaal', 'salle de réunion');
        NL.lang.set('en'); NL.ui.render();
        add('ik ben te laat', "I'm late");
        const mine = NL.state.customs();
        const wf = mine.find(w => w.nl === 'de vergaderzaal'), we = mine.find(w => w.nl === 'ik ben te laat');
        ok(mine.length === 2 && wf && we, '5c : les deux mots à soi ne sont pas enregistrés');
        if (!(wf && we)) return;
        ok(wf.fr === 'salle de réunion' && wf.en === undefined, '5c : en français, le mot est enregistré { nl, fr }');
        ok(we.en === "I'm late" && we.fr === undefined, '5c : en anglais, le mot est enregistré { nl, en }');
        mine.forEach(w => { NL.content.refresh(); NL.srs.seed(NL.content.byId(w.id), 2); });
        const glosses = [wf.fr, we.en];
        ['en', 'fr'].forEach(l => {
          if (l === 'fr') { NL.lang.set('fr'); NL.ui.render(); }
          NL.content.refresh();
          mine.forEach(w => {
            const it = NL.content.byId(w.id), want = w.fr || w.en;
            for (let i = 0; i < 30; i++) {
              const p = NL.ex.get('pick').build(it), r = NL.ex.get('recall').build(it);
              ok(p.prompt === want, '5c (' + l + ') : pick demande « ' + p.prompt + ' » au lieu de « ' + want + ' »');
              const right = r.opts.find(o => o.ok);
              ok(right && right.label === want, '5c (' + l + ') : recall : la bonne option est « ' + (right && right.label) + ' »');
              p.opts.concat(r.opts).forEach(o => ok(o.label !== '' && o.label !== 'undefined', '5c (' + l + ') : option vide pour ' + it.nl));
            }
          });
          NL.content.itemsOf(NL.content.units[0].id).forEach(it => {
            for (let i = 0; i < 20; i++) NL.ex.get('recall').build(it).opts.forEach(o =>
              ok(glosses.indexOf(o.label) < 0, '5c (' + l + ') : un mot à soi est offert en faux : ' + o.label));
          });
        });
      }).then(() => {
        /* 5d. Une restauration d'avant la phase 2, une remise à zéro et une déconnexion gardent le choix. */
        const D = boot({ account: true });
        return D.NL.state.open().then(() => signedIn(D)).then(() => {
          const NL = D.NL;
          French(D);
          NL.state.importAll({ app: 'vlaams-onderweg', v: 1, at: Date.now(), meta: { xp: 5 }, srs: [], custom: [], log: [] });
          ok(NL.state.meta().displayLang === 'fr', '5d : importAll d\'une sauvegarde sans displayLang l\'efface');
          NL.state.resetProgress();
          ok(NL.state.meta().displayLang === 'fr', '5d : resetProgress efface displayLang');
          NL.srs.seed(NL.content.allItems()[0], 2);
          ok(NL.state.seenCount() === 1, '5d : le jeu d\'essai n\'a pas un élément vu avant la déconnexion');
          return NL.sync.signOut().then(() => {
            ok(NL.sync.user === null, '5d : la déconnexion n\'a pas eu lieu');
            ok(NL.state.seenCount() === 0, '5d : la déconnexion n\'efface plus l\'appareil');
            ok(NL.state.meta().displayLang === 'fr', '5d : la déconnexion efface displayLang');
          });
        });
      }).then(() => {
        /* 5d bis. Après une déconnexion et un rechargement sur le même stockage, l'affichage reste en français. */
        const D = boot({ account: true });
        return D.NL.state.open().then(() => signedIn(D)).then(() => {
          French(D);
          return D.NL.sync.signOut();
        }).then(() => {
          const R = boot({ store: D.store });
          return R.NL.state.open().then(() => {
            ok(R.NL.state.meta().displayLang === 'fr', '5d : après déconnexion et rechargement, meta().displayLang vaut « ' + R.NL.state.meta().displayLang + ' »');
            ok(R.NL.lang.current() === 'fr', '5d : après rechargement, NL.lang.current() vaut « ' + R.NL.lang.current() + ' »');
            R.NL.ui.go('vandaag'); R.NL.ui.openSheet('instellingen');
            ok(textAndLabels(R.app.innerHTML).indexOf(R.NL.tables.fr.setLang) >= 0 && pageLang(R) === 'fr', '5d : après rechargement, la page n\'est pas dessinée en français');
          });
        });
      }).then(() => {
        /* 5e. ADR 0004 : un mot est transparent dans la langue lue ; le changement le recalcule. */
        const E = boot({ prepare: NL => NL.content.units.forEach(u => u.words.forEach(w => { if (w.nl === 'hallo') w.en = 'hello'; })) });
        return E.NL.state.open().then(() => {
          const NL = E.NL, hallo = () => NL.content.allItems().find(it => it.nl === 'hallo');
          ok(hallo() && hallo().en === 'hello', '5e : le mot de l\'essai n\'a pas d\'anglais');
          ok(hallo().cognate === true, '5e : hallo n\'est pas transparent en anglais');
          NL.lang.set('fr'); NL.ui.render();
          ok(hallo().cognate === false, '5e : hallo est transparent en français');
          NL.lang.set('en'); NL.ui.render();
          ok(hallo().cognate === true, '5e : hallo n\'est plus transparent au retour en anglais');
        });
      }).then(() => {
        /* 5f. Dans chaque langue, aucun texte de l'autre à l'écran. */
        const OTHER = { fr: /\bEN\d+|⟦en:/, en: /⟪|⟦fr:/ };
        const key = l => (/^fr/i.test(l) ? 'fr' : /^en/i.test(l) ? 'en' : null);
        const foreign = (h, page) => runs(h, page)
          .map(r => r.text.match(OTHER[key(r.lang) || key(page)])).filter(Boolean).map(m => m[0]);
        const planted = foreign('<p lang="fr">EN12</p><p lang="en">⟪3⟫</p>', 'en-GB');
        ok(planted.join(' ') === 'EN12 ⟪', '5f : sur la vue plantée, le juge ne trouve que « ' + planted.join(' ') + ' »');
        const pass = l => {
          const F = boot({ prepare: markedBoth });
          return F.NL.state.open().then(() => {
            if (l === 'fr') French(F);
            const hits = new Map();
            views(F, (n, h) => {
              if (n === 'klanken' || n === 'register') {
                /* Un passage sous lang="fr" ou lang="en" est jugé dans cette langue ; les autres, dans la langue lue. */
                foreign(h, pageLang(F)).forEach(w => { if (!hits.has(w)) hits.set(w, n); });
                return;
              }
              const m = textAndLabels(h).match(OTHER[l]);
              if (m && !hits.has(m[0])) hits.set(m[0], n);
            });
            hits.forEach((n, w) => ok(false, '5f (' + l + ') : « ' + w + ' » à l\'écran (vue ' + n + ')'));
          });
        };
        /* Un navigateur par langue : l'écran d'écoute garde l'état de sa dernière visite. */
        return pass('en').then(() => pass('fr'));
      }).then(() => {
        /* 5g. Le réglage nomme l'autre langue, et un clic change sans recharger. */
        const G = boot();
        return G.NL.state.open().then(() => {
          const NL = G.NL, label = () => (G.app.innerHTML.match(/data-display-lang="[a-z]+"[^>]*>([^<]*)</) || [])[1];
          NL.ui.go('vandaag'); NL.ui.openSheet('instellingen');
          ok(label() === NL.tables.en.langOther, '5g : en anglais, le réglage dit « ' + label() + ' »');
          ok(G.app.innerHTML.indexOf('data-display-lang="fr"') >= 0, '5g : le bouton ne vise pas le français');
          G.tap({ displayLang: 'fr' });
          ok(NL.lang.current() === 'fr' && pageLang(G) === 'fr', '5g : le clic ne change pas la langue');
          ok(label() === NL.tables.fr.langOther, '5g : en français, le réglage dit « ' + label() + ' »');
          ok(G.app.innerHTML.indexOf('data-display-lang="en"') >= 0, '5g : le bouton ne vise pas l\'anglais');
          ok(textAndLabels(G.app.innerHTML).indexOf(NL.tables.fr.setLang) >= 0, '5g : le titre du bloc n\'est pas en français');
        });
      });
    });
  });
}

/* 6. Chaque passage qui est du néerlandais du cours déclare le néerlandais : un
   lecteur d'écran ne lit pas « vandaag » à l'anglaise. Vues du cours simple, dans les deux langues. */
function langAttrFind(B, each) {
  const NL = B.NL, U = NL.util, dutch = new Set();
  tree.visit(NL.content, (v, key) => { if ((key === 'nl' || key === 'be') && typeof v === 'string') dutch.add(U.norm(v)); });
  NL.t.nav.forEach(n => dutch.add(U.norm(n.nl)));
  dutch.delete('');
  /* Un mot néerlandais qui s'écrit aussi en français ou en anglais (merci, hier, open, direct) reste cherché :
     on ne l'écarte que dans un passage qui se déclare français (ou anglais) ET dont le texte est un texte français
     (ou anglais) du cours. Un élément néerlandais qui montre « merci » sans lang="nl-BE" est une faute. */
  const gloss = { fr: new Set(), en: new Set() };
  tree.visit(NL.content, (v, key) => { if ((key === 'fr' || key === 'en') && typeof v === 'string') gloss[key].add(U.norm(v)); });
  ['fr', 'en'].forEach(l => tree.visit(NL.tables[l], v => { if (typeof v === 'string') gloss[l].add(U.norm(v)); }));
  ok(dutch.size > 100, '6 : trop peu de mots néerlandais à chercher (' + dutch.size + ')');
  const bad = new Map();
  ['fr', 'en'].forEach(l => {
    (l === 'fr' ? French : English)(B);
    each(B, (n, h) => runs(h, pageLang(B)).forEach(r => {
      const t = U.norm(r.text), own = /^fr/i.test(r.lang) ? 'fr' : /^en/i.test(r.lang) ? 'en' : null;
      if (dutch.has(t) && !/^nl/i.test(r.lang) && !(own && gloss[own].has(t))) { const key = l + ' « ' + r.text + ' » (' + (r.lang || 'sans lang') + ')'; if (!bad.has(key)) bad.set(key, n); }
    }));
  });
  return bad;
}
function langAttrCheck(B) {
  langAttrFind(B, views).forEach((n, k) => ok(false, '6 : néerlandais sans lang="nl" : ' + k + ' (vue ' + n + ')'));
  /* #75.2. Une balise vient de la table de gloss.js : fr, en-GB, nl-BE. Un « en » écrit à côté
     déclare une autre langue que la page (<html lang="en-GB">). */
  const TAGS = ['fr', 'en-GB', 'nl-BE'], stray = new Map();
  views(B, (n, h) => (String(h).match(/ lang="[^"]*"/g) || []).forEach(a => {
    if (TAGS.indexOf(a.slice(7, -1)) < 0 && !stray.has(a)) stray.set(a, n);
  }));
  stray.forEach((n, a) => ok(false, '6 : balise hors de la table :' + a + ' (vue ' + n + ')'));
  /* Le contrôle voit un mot néerlandais qui s'écrit aussi en français ou en anglais : sur des vues plantées, il le dit. */
  const planted = (b, visit) => { visit('plant', '<p>hier</p><p>merci</p><p lang="nl-BE">hier</p>'); };
  const found = langAttrFind(B, planted);
  ok(found.has('en « hier » (en-GB)') && found.has('en « merci » (en-GB)'), '6 : « hier » et « merci » sans lang="nl-BE" dans la vue anglaise ne sont pas signalés');
  const frFound = Array.from(found.keys()).filter(k => /^fr « (hier|merci) »/.test(k));
  ok(frFound.length === 0, '6 : « hier » dans un passage français est du français, pas signalé : ' + frFound.join(', '));
}

/* 6c. Le formulaire d'ajout : l'étiquette du champ enregistré sous « en » nomme l'anglais, celle du champ « fr » le français. */
function addFormCheck(B) {
  const NL = B.NL;
  [['en', English, /english/i], ['fr', French, /fran[cç]ais/i]].forEach(([l, set, name]) => {
    set(B);
    NL.ui.go('woorden');
    B.tap({ act: 'addform' });
    const m = /<label>([^<]*)<input class="textin" id="add-gloss"/.exec(B.app.innerHTML);
    ok(m && name.test(m[1]), '6c : en ' + l + ', le champ enregistré sous « ' + NL.lang.current() + ' » est étiqueté « ' + (m && m[1]) + ' »');
    B.tap({ act: 'addcancel' });
  });
}

/* 6b. Chaque section de référence montre exactement une étiquette d'ancrage, la bonne, dans la langue lue. */
function anchorCheck(B) {
  const NL = B.NL, A = NL.content.anchors, key = { fr: 'anchorFr', en: 'anchorEn', all: 'anchorAll' };
  ok(A && A.sounds === 'fr' && A.loans === 'fr' && A.faux === 'fr' && A.fauxEn === 'en' && A.register === 'all' &&
    A.hetRules === 'all' && A.deRules === 'all' && A.sheets === 'all', '6b : NL.content.anchors n\'a pas la forme attendue');
  /* L'étiquette se lit comme une note sous le titre, pas comme une deuxième ligne du titre en capitales grasses. */
  const css = (/(^|[}\s])\.anchor\s*\{([^}]*)\}/.exec(fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')) || [])[2] || '';
  ok(/text-transform:\s*none/.test(css) && /font-weight:\s*400/.test(css), '6b : styles.css ne donne pas à .anchor son propre style (ni capitales ni gras)');
  ['fr', 'en'].forEach(l => {
    (l === 'fr' ? French : English)(B);
    const shown = (screen, id) => {
      NL.ui.go(screen, id);
      const out = [], re = /<span class="muted anchor" data-anchor="(fr|en|all)">([^<]*)<\/span>/g;
      let m; while ((m = re.exec(B.app.innerHTML))) out.push(m);
      return out;
    };
    const expect = (what, got, names) => {
      ok(got.length === names.length, '6b (' + l + ') : ' + what + ' montre ' + got.length + ' étiquette(s), il en faut ' + names.length);
      got.forEach((m, i) => { if (names[i]) ok(m[1] === A[names[i]] && m[2] === NL.t[key[A[names[i]]]], '6b (' + l + ') : ' + what + ', étiquette ' + i + ' « ' + m[2] + ' » (' + m[1] + ')'); });
    };
    expect('register', shown('register'), ['register', 'loans', 'faux', 'fauxEn']);
    expect('klanken', shown('klanken'), ['sounds']);
    expect('dehet', shown('dehet'), ['hetRules', 'deRules']);
    NL.content.sheets.forEach(sh => expect('fiche ' + sh.id, shown('spiek', sh.id), ['sheets']));
  });
  ['eventueel', 'actueel', 'slim', 'raar', 'de brand', 'door', 'bellen', 'de map'].forEach(w =>
    ok(NL.content.fauxEn.some(r => r.nl === w && typeof r.en === 'string' && typeof r.trap === 'string' && !('fr' in r)), '6b : fauxEn n\'a pas « ' + w + ' » en anglais seul'));
  ok(NL.content.fauxEn.length === 8, '6b : fauxEn a ' + NL.content.fauxEn.length + ' entrées, il en faut 8');
}

/* #69. Un appareil neuf par contrôle ; l'étiquette 69.n est le point du ticket. */
function displayChecks() {
  const open = prepare => { const B = boot({ prepare }); return B.NL.state.open().then(() => B); };

  /* 69.1. Un sens montré dans l'autre langue porte cette langue. */
  const c1 = () => open(NL => {
    NL.content.units.forEach(u => u.words.forEach(w => { if (w.nl === 'het brood') delete w.en; }));
    delete NL.content.scenarios.find(s => s.id === 's-bakker').steps.filter(st => st.them)[3].them.en;
    /* Les choix de la première réplique sans anglais : leur sens se montre sur le bouton, puis sous la phrase à dire. */
    NL.content.scenarios.find(s => s.id === 's-bakker').steps.find(st => st.you).you.choices.forEach(c => { delete c.en; });
    /* Une phrase et une règle sans anglais non plus : certains exercices ne montrent qu'elles. */
    const frOnly = v => tree.visit(v, x => { if (x && typeof x === 'object' && typeof x.fr === 'string') delete x.en; });
    frOnly(NL.content.units.find(u => u.id === 'overleven').phrases[0]);
    frOnly(NL.content.patterns.find(g => g.id === 'g-v2'));
    frOnly(NL.content.openTasks['g-v2']);
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
    const tags = Object.keys(pages).map(k => pages[k]).join('').match(/<[a-z]+ class="(v-en|bub-en|rev-en|say-en)"[^>]*>/g) || [];
    const bare = '<span class="v-en" lang="fr">' + NL.util.esc(NL.gloss.bare(brood)) + '</span>';
    ok(['v-en', 'bub-en', 'rev-en', 'say-en'].every(c => tags.some(t => t.indexOf('"' + c + '"') >= 0)), '69.1 : les quatre sortes de sens ne sont pas toutes à l’écran, le contrôle est creux');
    const bad = tags.filter(t => !/ lang="(fr|en-GB)"/.test(t));
    ok(bad.length === 0, '69.1 : ' + bad.length + ' sens sans lang="fr" ni lang="en-GB", dont ' + bad[0]);
    ok(pages.woorden.indexOf(bare) >= 0 && pages.fouten.indexOf(bare) >= 0, '69.1 : en anglais, le sens français de het brood n’est pas marqué lang="fr" (woorden, fouten)');
    ok(/class="bub-en" lang="fr"/.test(pages.scenario), '69.1 : la réplique sans anglais n’est pas marquée lang="fr"');
    const choice = NL.content.scenarios.find(s => s.id === 's-bakker').steps.find(st => st.you).you.choices[0];
    ok(pages.scenario.indexOf('<i lang="fr">' + NL.util.esc(NL.gloss.of(choice)) + '</i>') >= 0, '69.1 : le sens d’un choix sans anglais n’est pas marqué lang="fr" sur son bouton');
    ok(tags.some(t => t.indexOf(' lang="en-GB"') >= 0), '69.1 : aucun sens anglais marqué lang="en-GB"');
    /* L'exercice montre le même sens : il porte la même langue. Chaque exercice du registre, sur le mot,
       la phrase et la règle sans anglais, posé puis corrigé : un exercice ajouté est contrôlé d'office.
       Seuls la dictée et l'intrus ne montrent aucun sens ; un autre qui n'en montre pas rend le contrôle creux. */
    const NO_MEANING = ['dictation', 'intrus'];
    const items = NL.content.allItems(), phrase = items.find(it => it.id === 'overleven:p0'), rule = items.find(it => it.id === 'g-v2');
    const flat = s => NL.util.esc(s).replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
    const french = new Set([flat(NL.gloss.bare(brood))]);
    [brood, phrase, rule].forEach(x => tree.visit(x, v => { if (v && typeof v === 'object' && typeof v.fr === 'string') french.add(flat(v.fr)); }));
    const words = items.filter(it => it.kind === 'word' && it.id !== brood.id && NL.gloss.has(it, 'en')).slice(0, 4);
    const fresh = () => ({ sel: null, picked: [], input: '', close: false, other: false, matchSel: null, matchGone: [], matchBad: null,
      speech: { phase: 'idle', tries: 0, selfRated: null } });
    const showed = new Set(), unmarked = [];
    Object.keys(NL.ex.registry).forEach(id => {
      const E = NL.ex.registry[id];
      (id === 'match' ? [[brood].concat(words)] : [brood, phrase, rule]).forEach(x => {
        let t; try { t = E.build(x); } catch (e) { return; }
        ['ask', 'no'].forEach(phase => {
          let shown; try { shown = E.view(t, fresh(), phase); } catch (e) { return; }
          runs(shown, 'en-GB').filter(r => french.has(r.text)).forEach(r => {
            showed.add(id);
            if (r.lang !== 'fr') unmarked.push(id + ' « ' + r.text + ' » (' + r.lang + ')');
          });
        });
      });
    });
    const silent = Object.keys(NL.ex.registry).filter(id => NO_MEANING.indexOf(id) < 0 && !showed.has(id));
    ok(silent.length === 0, '69.1 : ' + silent.join(', ') + ' ne montre(nt) aucun sens sans anglais, le contrôle est creux');
    ok(unmarked.length === 0, '69.1 : ' + unmarked.length + ' sens français sans lang="fr" dans les exercices, dont ' + unmarked.slice(0, 8).join(' ; '));
    /* Le pied d'un « recall » passé redit ce sens : même langue. */
    const S = NL.screens.sessie, answer = require('./lib/answer')(B);
    NL.srs.seed(brood, 0);
    const r = NL.state.rec(brood.id); r.due = B.clock.now() - 3600 * 1000; r.lastEx = 'pick'; NL.state.setRec(r);
    let asked = false;
    for (let k = 0; k < 40 && !asked; k++) {
      S.abandon(); NL.screens.fouten.click({ dataset: {} }, { act: 'start' });
      const c = S.peek(); asked = !!c && c.ex === 'recall' && c.items[0].id === brood.id;
    }
    ok(asked, '69.1 : het brood n’est jamais posé en recall, le contrôle du pied est creux');
    if (asked) {
      answer.wrong();
      ok(html().indexOf('<b lang="fr">' + NL.util.esc(NL.gloss.bare(brood)) + '</b>') >= 0, '69.1 : le pied d’un recall passé montre le sens français sans lang="fr"');
    }
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

  /* 69.2. Un changement appliqué sur n'importe quel écran s'y annonce, une fois ;
     la séance et la conversation, où il attend, sont le contrôle 5b. */
  const c2 = () => open(null).then(B => {
    const NL = B.NL, fr = NL.tables.fr;
    Object.keys(NL.screens).filter(r => r !== 'sessie' && r !== 'scenario').forEach(r => {
      English(B); NL.ui.go(r);
      NL.state.setMeta({ displayLang: 'fr' }, true);   // ce que fait une synchro
      NL.ui.render();
      const n = count(textAndLabels(B.app.innerHTML), fr.langNotice);
      ok(n === 1, '69.2 ' + r + ' : l’avis s’affiche ' + n + ' fois au lieu d’une');
    });
  });

  /* 69.4. set() en pleine séance enregistre le choix, et rien d'autre. */
  const c4 = () => open(null).then(B => {
    const NL = B.NL, en = NL.tables.en, fr = NL.tables.fr;
    English(B); dueReviews(NL, 12, T0);
    ok(NL.screens.sessie.begin('vandaag'), '69.4 : aucune séance à démarrer');
    NL.ui.go('sessie');
    NL.lang.set('fr');
    ok(NL.state.meta().displayLang === 'fr', '69.4 : set() n’a pas enregistré le choix');
    ok(NL.t.nav[1].label === en.nav[1].label, '69.4 : set() a changé NL.t en pleine séance');
    ok(pageLang(B) === 'en-GB', '69.4 : set() a changé <html lang> en pleine séance (' + pageLang(B) + ')');
    B.tap({ quitYes: '1' });
    ok(NL.t.nav[1].label === fr.nav[1].label && pageLang(B) === 'fr', '69.4 : après la séance, l’écran n’est pas en français');
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
    English(B); dueReviews(NL, 12, T0);
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
        ok(/\bhet brood\b/.test(textAndLabels(B.app.innerHTML)), '69.9 (' + l + ') : chercher « ' + q + ' » ne trouve pas het brood');
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
    B.tap({ act: 'rec' });
    return new Promise(r => setImmediate(r)).then(() => {
      ok(textAndLabels(B.app.innerHTML).indexOf(en.docRecDenied) >= 0, '69.11 : le refus du micro n’est pas affiché, le contrôle est creux');
      NL.ui.go('vandaag'); NL.ui.openSheet('instellingen'); B.tap({ displayLang: 'fr' });
      NL.ui.go('doctor');
      const t = textAndLabels(B.app.innerHTML);
      ok(t.indexOf(fr.docRecDenied) >= 0 && t.indexOf(en.docRecDenied) < 0, '69.11 : après le passage au français, le verdict du micro reste en anglais');
    });
  });

  return [c1, c1b, c2, c4, c5, c6, c9, c10, c11].reduce((p, c) => p.then(c), Promise.resolve());
}

const plain = boot(), paired = boot({ prepare: NL => pairUp(NL.content) });
Promise.all([plain.NL.state.open(), paired.NL.state.open()]).then(() => {
  French(plain); French(paired);
  /* 2a. Apparié, en français, l'écran est celui d'aujourd'hui. Les deux démarrent
     avec la même graine : une différence est une vraie différence. */
  const a = [], b = [];
  views(plain, (n, h) => a.push(n + ' | ' + textAndLabels(h)));
  views(paired, (n, h) => b.push(n + ' | ' + textAndLabels(h)));
  ok(a.length === b.length, 'pas le même nombre de vues : ' + a.length + ' / ' + b.length);
  a.forEach((s, i) => ok(s === b[i], 'vue appariée différente : ' + s.slice(0, 120)));
  b.forEach(s => ok(!/\[object|undefined|\bEN\d/.test(s), 'trou ou anglais en vue française : ' + s.slice(0, 120)));
  /* 2b. Le jeu de mots transparents est celui d'aujourd'hui. */
  const U = plain.NL.util, was = it => it.kind === 'word' && U.ratio(U.bare(it.nl), U.bareFr(it.fr)) > 0.62;
  plain.NL.content.allItems().forEach(it => ok(it.cognate === was(it), 'transparence changée : ' + it.id));

  /* 2c. Des mots à soi dans l'autre langue : lus dans la leur, jamais proposés en
     faux aux autres, jamais une option vide. */
  const own = boot({ prepare: NL => pairUp(NL.content) });
  const lib = boot({ prepare: NL => {
    const u = NL.content.units[0];
    u.words[1].fr = u.words[0].fr + 'x';
    pairUp(NL.content);
    u.words[0].en = 'shared'; u.words[1].en = 'shared';
  } });
  const twins = boot({ prepare: NL => {
    const u = NL.content.units[0];
    u.words[1].fr = u.words[0].fr + 'x';
    pairUp(NL.content);
    u.words[0].en = 'shared / one'; u.words[1].en = 'shared / two';
  } });
  return Promise.all([own.NL.state.open(), lib.NL.state.open(), twins.NL.state.open()]).then(() => {
    French(own);
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
    /* Deux mots au même sens anglais seulement : le sens anglais suffit à ne pas offrir l'autre en faux. */
    const T = twins.NL, TG = T.gloss;
    TG.use('en');
    const tu = T.content.units[0].id;
    const t0 = T.content.byId(tu + ':w0'), t1 = T.content.byId(tu + ':w1');
    ok(TG.sameMeaning(t0, t1) && !TG.sameSense(t0, t1), 'recall : les jumeaux ne sont pas joints par leur seul sens anglais');
    let offered = 0;
    [[t0, t1], [t1, t0]].forEach(p => {
      for (let i = 0; i < 100; i++) {
        if (T.ex.get('recall').build(p[0]).opts.some(o => o.label === TG.of(p[1]))) offered++;
      }
    });
    ok(offered === 0, 'recall : le jumeau au même sens anglais est offert en faux dans ' + offered + ' tirages sur 200');
    const words = L.content.allItems().filter(it => it.kind === 'word' && it.id !== i0.id && it.id !== i1.id);
    let clash = 0;
    for (let i = 0; i < 100; i++) {
      const t = L.ex.get('match').build([i0, i1].concat(L.util.sample(words, 3)));
      for (let x = 0; x < t.pairs.length; x++) for (let y = x + 1; y < t.pairs.length; y++) {
        if (L.util.norm(t.pairs[x].gloss) === L.util.norm(t.pairs[y].gloss) && !L.ex.get('match').fits(t, x, y)) clash++;
      }
    }
    ok(clash === 0, 'match : ' + clash + ' paires de cartes identiques que fits ne joint pas');
    const read = () => Array.from(lib.app.innerHTML.matchAll(/<span class="opt-key">\d<\/span><span>([^<]*)<\/span>/g), m => m[1]);
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

    /* 2e. Une note sans anglais (en: null) ne laisse pas de <em></em> vide. */
    const nn = boot({ prepare: NL => {
      pairUp(NL.content);
      NL.content.sheets.forEach(s => s.groups.forEach(g => g.rows.forEach(r => { if (r.note) r.note.en = null; })));
      NL.content.register.forEach(r => { if (r.note) r.note.en = null; });
    } });
    return nn.NL.state.open().then(() => {
      const N = nn.NL;
      N.gloss.use('en');
      let seenNote = 0;
      N.content.sheets.forEach(s => {
        N.ui.go('spiek', s.id);
        ok(nn.app.innerHTML.indexOf('<em></em>') < 0, 'fiche ' + s.id + ' : un <em></em> vide');
        s.groups.forEach(g => g.rows.forEach(r => { if (r.note) seenNote++; }));
      });
      N.ui.go('register');
      ok(nn.app.innerHTML.indexOf('<em></em>') < 0, 'registre : un <em></em> vide');
      ok(seenNote > 0 && N.content.register.some(r => r.note), 'aucune note à tester : le contrôle est creux');

      return langChecks();
    }).then(() => {
      tableCheck(plain.NL);
      { const WC = plain.NL.gloss.wordClass;
        ok(WC({ kind: 'word', nl: 'gisteren', fr: 'hier' }, 'fr') === 'other', 'wordClass : « hier » (gisteren) n’est pas un verbe');
        ok(WC({ kind: 'word', nl: 'werken', fr: 'travailler' }, 'fr') === 'verb', 'wordClass : « travailler » (werken) reste un verbe');
        ok(plain.NL.gloss.prose('a <span class="ex">hier</span>') === 'a <span class="ex" lang="nl-BE">hier</span>', 'gloss.prose : span.ex doit porter lang="nl-BE"');
        [['tussen', 'entre'], ['tegen', 'contre'], ['eigen', 'propre']].forEach(([nl, fr]) =>
          ok(WC({ kind: 'word', nl: nl, fr: fr }, 'fr') === 'other', 'wordClass : « ' + fr + ' » (' + nl + ') n’est pas un verbe')); }
      const L6 = boot();
      return L6.NL.state.open().then(() => langAttrCheck(L6)).then(() => anchorCheck(L6)).then(() => addFormCheck(L6)).then(interfaceCheck).then(displayChecks);
    }).then(() => {
      console.log('\n' + checks + ' contrôles, ' + (fails === 0 ? 'LANGUE CONFORME' : fails + ' ÉCHEC(S)'));
      process.exit(fails ? 1 : 0);
    });
  });
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
