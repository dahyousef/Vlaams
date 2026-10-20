/* Headless smoke test: loads every module into a stubbed browser and exercises
   the content model, the scheduler and all ten exercise types. */
const path = require('path'), fs = require('fs');
const browser = require('./lib/browser');
const ROOT = process.argv[2];

/* Le contenu, le planificateur et les exercices : ni interface, ni synchro, ni
   phrases d'exemple. */
const B = browser.open({
  root: ROOT, seed: browser.SEED, timers: 'real', location: { protocol: 'file:' },
  files: ['src/core/util.js', 'src/core/gloss.js', 'src/core/fr.js', 'src/core/state.js', 'src/core/srs.js', 'src/core/speech.js',
    'src/core/audio.js', 'src/content/lexicon.a1.js', 'src/content/lexicon.a1b.js', 'src/content/grammar.js',
    'src/content/open.js', 'src/content/reference.js', 'src/content/scenarios.js', 'src/content/index.js',
    'src/core/lang.js', 'src/ex/index.js']
});
const NL = B.NL;
let fails = 0;
const ok = (cond, msg) => { if (!cond) { console.log('  FAIL: ' + msg); fails++; } };

/* Les `var` et les `?.` d'une source, chacun avec sa ligne. La source est d'abord
   relue sans ses chaînes, ses commentaires, ses regex ni le texte de ses gabarits :
   chacun de leurs caractères devient une espace, les sauts de ligne restent, et les
   numéros de ligne avec eux. Une chaîne ou une regex encore ouverte en fin de ligne,
   ou quoi que ce soit d'ouvert en fin de fichier, est signalé à sa ligne : la
   relecture a perdu le fil, elle ne passe pas en silence. */
function syntaxFindings(src) {
  const out = src.split(''), found = [], frames = [];   // frames : un par ${ ouvert
  const lineAt = k => src.slice(0, k).split('\n').length;
  const lost = (what, k) => found.push({ line: lineAt(k), what: 'unclosed ' + what });
  const blank = (a, b) => { for (let k = a; k < Math.min(b, src.length); k++) if (out[k] !== '\n') out[k] = ' '; };
  /* Une barre ouvre une regex, sauf après ce qui finit une valeur : un nom (hors
     return, typeof…), un nombre, une chaîne, ) ou ]. */
  const regexAt = k => {
    let j = k - 1;
    while (j >= 0 && /\s/.test(out[j])) j--;
    if (j < 0 || !/[\w$)\]'"`]/.test(out[j])) return true;
    if (!/[\w$]/.test(out[j])) return false;
    let w = j;
    while (w >= 0 && /[\w$]/.test(out[w])) w--;
    return out[w] !== '.' && /^(return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/
      .test(out.slice(w + 1, j + 1).join(''));
  };
  /* Le texte d'un gabarit, de k jusqu'au ` qui le ferme ou au ${ qui rouvre du code. */
  const templateText = k => {
    const a = k;
    while (k < src.length && src[k] !== '`' && !(src[k] === '$' && src[k + 1] === '{')) k += src[k] === '\\' ? 2 : 1;
    blank(a, k);
    if (k >= src.length) { lost('template', a - 1); return src.length; }
    if (src[k] === '`') return k + 1;
    frames.push({ depth: 0, at: k });
    return k + 2;
  };
  let i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1], top = frames[frames.length - 1];
    if (c === '/' && d === '/') {
      const e = src.indexOf('\n', i);
      blank(i, e < 0 ? src.length : e);
      i = e < 0 ? src.length : e;
    } else if (c === '/' && d === '*') {
      const e = src.indexOf('*/', i + 2);
      if (e < 0) lost('comment', i);
      blank(i, e < 0 ? src.length : e + 2);
      i = e < 0 ? src.length : e + 2;
    } else if (c === '"' || c === "'") {
      let k = i + 1;
      while (k < src.length && src[k] !== c && src[k] !== '\n') k += src[k] === '\\' ? 2 : 1;
      blank(i + 1, k);
      if (src[k] === c) i = k + 1; else { lost('string', i); i = k; }
    } else if (c === '/' && regexAt(i)) {
      let k = i + 1, cls = false;
      while (k < src.length && src[k] !== '\n' && (cls || src[k] !== '/')) {
        if (src[k] === '\\') k++;
        else if (src[k] === '[') cls = true;
        else if (src[k] === ']') cls = false;
        k++;
      }
      blank(i + 1, k);
      if (src[k] === '/') i = k + 1; else { lost('regex', i); i = k; }
    } else if (c === '`') {
      i = templateText(i + 1);
    } else if (c === '}' && top && top.depth === 0) {
      frames.pop();
      i = templateText(i + 1);
    } else {
      if (top && c === '{') top.depth++;
      if (top && c === '}') top.depth--;
      i++;
    }
  }
  frames.forEach(f => lost('template', f.at));
  const code = out.join('');
  [[/(?<![\w$.])var(?=\s+[\w$[{])/g, 'var'], [/\?\.(?!\d)/g, '?.']].forEach(([rx, what]) =>
    Array.from(code.matchAll(rx)).forEach(m => found.push({ line: lineAt(m.index), what })));
  return found.sort((a, b) => a.line - b.line);
}

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

  /* Build sweep: every built-in item has a French gloss, and the page declares English. */
  items.forEach(i => {
    ok(i.fr, 'no French gloss on ' + i.id);
  });
  const built = path.join(ROOT, 'index.html');
  if (fs.existsSync(built)) {
    const html = fs.readFileSync(built, 'utf8');
    ['>Overslaan<', '>Nakijken<', '>Start de sessie<', '>Terug naar Vandaag<',
     'Welke is het?', 'Tik de woorden hieronder'].forEach(s =>
      ok(html.indexOf(s) < 0, 'untranslated interface string in build: ' + s));
    ok(html.indexOf('<html lang="en-GB">') >= 0, 'index.html must declare <html lang="en-GB">');
    ok(html.indexOf('<meta name="description" content="Learn Flemish Dutch: spaced repetition, speaking aloud, and the language as it is really spoken in Flanders.">') >= 0, 'index.html must carry the English meta description');
    console.log('  build sweep     build is clean of known EN/NL interface strings, and declares en-GB');
  }

  /* Les deux sorties du build sont en LF, quelle que soit la fin de ligne des sources dans la copie de
     travail (core.autocrlf=true les y met en CRLF) : sinon git les montre modifiées après chaque build. */
  ['index.html', 'artifact.html'].forEach(f => {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) ok(fs.readFileSync(p, 'utf8').indexOf('\r') < 0, f + ' contient un retour chariot : build.sh doit écrire du LF');
  });

  /* Ni `var` ni chaînage optionnel (`?.`) dans les sources. Les listes sont celles de
     build.sh : un fichier ajouté plus tard est relu lui aussi. Les sources actuelles
     n'en ont aucun ; les cas ci-dessous prouvent que la relecture voit encore quelque
     chose, et qu'elle ne compte ni les chaînes ni les commentaires. */
  const found = src => syntaxFindings(src).map(f => f.line + ' ' + f.what);
  [['var x = 1;', ['1 var']],
   ['const a = 1;\nconst b = a?.c;', ['2 ?.']],
   ['f?.(); a?.[0];', ['1 ?.', '1 ?.']],
   ['const s = "Quoi ?. var x";', []],
   ['// a?.b var y\n/* var z;\n a?.b */ const n = 1;', []],
   ['const r = /["?.]/g; var q;', ['1 var']],
   ["if (n) return /'/.test(s) ? 1 : 2;", []],
   ['const d = a / b; const s = "?.";', []],
   ['const n = c?.5:1; o.var = 2; const variable = 3;', []],
   ['const t = `a ?. var ${x?.y} b`;', ['1 ?.']],
   ['const s = "abc\nvar x;', ['1 unclosed string', '2 var']]
  ].forEach(([src, want]) => ok(JSON.stringify(found(src)) === JSON.stringify(want),
    'syntax check on ' + JSON.stringify(src) + ' found ' + JSON.stringify(found(src)) + ', wanted ' + JSON.stringify(want)));
  const sources = browser.sources(ROOT);
  /* sw.js n'est pas dans SRC : build.sh le copie à côté de la page (cp … dist/), et
     chaque appareil qui ouvre l'app l'installe. Les .js des lignes cp sont donc relus
     aussi. vendor/supabase.js, du code tiers, entre dans la page par cat : il n'est
     sur aucune des deux listes, et la relecture ne le lit pas. */
  const copied = (fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8').match(/^cp .* dist\/\s*$/gm) || [])
    .flatMap(l => l.trim().split(/\s+/).slice(1, -1)).filter(f => /\.js$/.test(f));
  const why = { 'var': 'a var declaration, use const, or let where it changes', '?.': 'optional chaining (?.)' };
  let seen = 0;
  ok(sources.length > 0, 'the syntax check read no source file from build.sh');
  ok(copied.length > 0, 'the syntax check read no .js file from a cp … dist/ line of build.sh');
  sources.concat(copied).forEach(f => syntaxFindings(fs.readFileSync(path.join(ROOT, f), 'utf8')).forEach(x => {
    ok(false, f + ':' + x.line + ': ' + (why[x.what] || x.what + ', as the syntax check reads it'));
    seen++;
  }));
  console.log('  syntax          ' + sources.length + ' sources in SRC and ' + copied.length + ' copied to dist/ (' +
    copied.join(', ') + ') from build.sh: ' + (seen ? seen + ' finding(s)' : 'no var, no ?.'));

  /* The language of a shown meaning has one source: NL.gloss.tag names the tag of a reading
     language, and NL.gloss.langAttr writes the attribute. A `lang="' + …` built by hand, or an
     en-GB written outside gloss.js, is a second source, and the two drift apart. */
  ok(sources.indexOf('src/core/gloss.js') >= 0, 'the lang check looks for src/core/gloss.js, which build.sh no longer lists');
  sources.filter(f => f !== 'src/core/gloss.js').forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    ok(!/[^\w-]lang="'\s*\+/.test(src), f + ': a lang attribute is built by hand; use NL.gloss.langAttr');
    ok(src.indexOf('en-GB') < 0, f + ': en-GB is written outside gloss.js; use NL.gloss.tag');
  });

  /* The suites share their helpers through test/lib, and a copy drifts from the original.
     A click goes through B.tap, there is one fake Supabase, and a due date comes from the
     suite's clock, never from an epoch written out by hand. */
  const suites = ['test', 'test/tools'].reduce((all, d) => all.concat(fs.readdirSync(path.join(ROOT, d))
    .filter(f => /\.js$/.test(f)).map(f => d + '/' + f)), []);
  suites.forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    ok(!/target:\s*\{\s*closest:\s*\(\)\s*=>\s*\(\{\s*dataset/.test(src), f + ': builds a click by hand; use B.tap from test/lib/browser.js');
    ok(!/createClient\s*(:|\([^)]*\)\s*\{)/.test(src), f + ': defines a second fake Supabase; use test/lib/supabase.js');
    ok(!/\.due\s*=\s*\d{10,}/.test(src), f + ': writes a due date from a bare epoch; use the suite clock, as test/lib/seed.js does');
  });
  console.log('  suites          ' + suites.length + ' files: no hand-built click, no second fake Supabase, no due date from a bare epoch');

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

  /* Un échec fait perdre deux échelons. */
  NL.srs.seed(w, 5);
  NL.srs.grade(w, false);
  const r = NL.state.rec(w.id);
  ok(r.stage === 3, 'a lapse must drop two rungs (got ' + r.stage + ')');
  /* PIÈGE 2 : une rechute rentre dans l'échelle. Repartir du bas (un jour) puis
     multiplier fait osciller l'élément sous son plafond sans fin. L'échelon 3
     (trois jours) se distingue du bas : les trois premiers pas valent un jour. */
  ok(r.interval === NL.srs.STEP[3], 'lapse must re-enter the step ladder at its rung, not restart at the bottom (got ' + Math.round(r.interval / 86400000) + ' days)');
  NL.srs.grade(w, true);
  ok(NL.state.rec(w.id).stage === 4, 'pass did not advance');
  console.log('  rechute         -2 échelons, intervalle ' + Math.round(r.interval / 86400000) + ' jours, puis remonte');

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
    ok(NL.srs.stageOf(cog) === 2, 'a cognate skips one rung, the meaning drill, and no more — it sits on rung ' + NL.srs.stageOf(cog));
    console.log('  transparent     « ' + cog.nl + ' » saute le sens, et rien d’autre : échelon ' + NL.srs.stageOf(cog));
  }

  /* La frontière est contiguë : impossible d'ouvrir une unité par-dessus un trou.
     Le trou, c'est une unité dont rien n'a été RENCONTRÉ. */
  NL.state.clearAll();
  const gapUnit = NL.content.units[3];
  NL.content.units.forEach(u => { if (u !== gapUnit) NL.content.itemsOf(u.id).forEach(it => NL.srs.seed(it, 5)); });
  const opened = NL.content.units.map(u => NL.content.unitOpen(u.id));
  const firstShut = opened.indexOf(false);
  ok(firstShut < 0 || opened.slice(firstShut).every(o => !o),
    'the open range is not contiguous — a unit is open beyond a locked one');
  console.log('  frontière       ' + (firstShut < 0 ? 'tout ouvert' : firstShut + ' unités ouvertes, puis fermé') + ' — contigu');

  /* Une unité ouverte ne se referme pas : la frontière est gardée en mémoire,
     et des rechutes dans l'unité 1 ne referment rien. */
  {
    NL.state.clearAll();
    NL.content.units.forEach(u => NL.content.itemsOf(u.id).forEach(it => NL.srs.seed(it, 5)));
    ok(NL.content.units.every(u => NL.content.unitOpen(u.id)), 'a fully met course is not fully open');
    NL.content.itemsOf(NL.content.units[0].id).forEach(it => NL.srs.grade(it, false));
    const stillOpen = NL.content.units.filter(u => NL.content.unitOpen(u.id)).length;
    ok(stillOpen === NL.content.units.length, 'lapses in unit 1 closed ' + (NL.content.units.length - stillOpen) + ' unit(s) that were already open');
    console.log('  frontière       une unité ouverte le reste, même après des rechutes');
  }

  console.log('\nARTICLES');
  /* bare() et bareFr() retirent l'article d'un MOT pour l'afficher nu. Ils
     tronquaient aussi les phrases (« Het regent weer. » → « regent weer. ») et
     coupaient des mots en deux (« leur » → « ur », « un » → rien). */
  {
    const UU = NL.util;
    [['de fiets', 'fiets'], ['het huis', 'huis'], ['een', 'een'], ['Het regent weer.', 'Het regent weer.'],
     ['Een goed weekend nog!', 'Een goed weekend nog!'], ['De vergaderzaal', 'vergaderzaal']].forEach(([a, b]) =>
      ok(UU.bare(a) === b, 'bare("' + a + '") gave "' + UU.bare(a) + '", wanted "' + b + '"'));
    [['le jambon', 'jambon'], ['l’eau', 'eau'], ['une tasse', 'tasse'], ['un', 'un'], ['leur', 'leur'], ['durer', 'durer'],
     ['Une bière, s’il vous plaît.', 'Une bière, s’il vous plaît.'], ['La réunion commence.', 'La réunion commence.']].forEach(([a, b]) =>
      ok(UU.bareFr(a) === b, 'bareFr("' + a + '") gave "' + UU.bareFr(a) + '", wanted "' + b + '"'));
    const all = NL.content.allItems();
    const cutNl = all.filter(i => i.kind !== 'word' && UU.bare(i.nl) !== i.nl);
    const cutFr = all.filter(i => i.kind !== 'word' && UU.bareFr(i.fr) !== i.fr);
    const midWord = all.filter(i => { const b = UU.bareFr(i.fr); return b !== i.fr && !/(\s|’|')$/.test(i.fr.slice(0, i.fr.length - b.length)); });
    const empty = all.filter(i => !UU.bare(i.nl).trim() || !UU.bareFr(i.fr).trim());
    ok(cutNl.length === 0, cutNl.length + ' sentence(s) lose their first word, e.g. ' + (cutNl[0] || {}).nl);
    ok(cutFr.length === 0, cutFr.length + ' French sentence(s) lose their first word, e.g. ' + (cutFr[0] || {}).fr);
    ok(midWord.length === 0, midWord.length + ' gloss(es) cut mid-word, e.g. ' + (midWord[0] || {}).fr);
    ok(empty.length === 0, empty.length + ' item(s) would show an empty label');
    console.log('  ' + all.length + ' éléments : aucune phrase tronquée, aucun mot coupé, aucune étiquette vide');
  }

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
      if (wrong.some(l => UU.norm(l) === UU.norm(right)) || new Set(wrong.map(UU.norm)).size !== wrong.length) dup++;
    });
    const pct = x => (x / n * 100).toFixed(1) + '%';
    console.log('  ' + n + ' mots à article : bonne réponse la plus longue ' + pct(longest) +
      ', un leurre du même genre ' + pct(sameArt));
    ok(n > 50, 'not enough article words to measure: ' + n);
    ok(dup === 0, 'an option was repeated or equalled the answer, ' + dup + ' times');
    ok(sameArt / n >= 0.8, 'distractors give the gender away too often: only ' + pct(sameArt) + ' share it');
    ok(longest / n <= 0.25, 'the answer is the longest option too often: ' + pct(longest));
  }

  /* Un cran plus dur : quatre options, et des leurres de même nature. « oui »
     face à un verbe et deux noms se devinait sans connaître le mot. */
  {
    const UU = NL.util, all = NL.content.allItems();
    const words = all.filter(i => i.kind === 'word' && !i.art);
    const verbish = w => /en$/.test(UU.bare(w.nl)) && /^\S+(er|ir|re|oir)$/.test(UU.bareFr(w.fr).split(/\s*\/\s*/)[0]) && UU.bareFr(w.fr).indexOf('-') < 0;
    let n = 0, four = 0, sameKind = 0;
    words.forEach(it => {
      const t = NL.ex.get('pick').build(it); n++;
      if (t.opts.length === 4) four++;
      const wrong = t.opts.filter(o => !o.ok).map(o => all.find(x => x.kind === 'word' && UU.bare(x.nl) === o.label)).filter(Boolean);
      if (wrong.filter(x => verbish(x) === verbish(it) && !x.art).length >= 2) sameKind++;
    });
    ok(four === n, 'a word question offered fewer than four options (' + (n - four) + ' of ' + n + ')');
    ok(sameKind / n >= 0.75, 'distractors are too often a different kind of word: only ' + Math.round(sameKind / n * 100) + '% of questions have two of the same kind');
    console.log('  ' + n + ' mots sans article : 4 options partout, deux leurres de même nature dans ' + Math.round(sameKind / n * 100) + '% des cas');
  }

  console.log('\nORTHOGRAPHE');
  /* Une faute pardonnée sur un mot de trois lettres, c'est un tiers du mot. */
  {
    const UU = NL.util, typeEx = NL.ex.get('type');
    const shortW = NL.content.allItems().find(i => i.kind === 'word' && UU.bare(i.nl) === 'dag');
    const longW = NL.content.allItems().find(i => i.kind === 'word' && UU.bare(i.nl).length >= 8 && UU.tiles(UU.bare(i.nl)).length === 1);
    const judge = (it, input) => { const t = typeEx.build(it); return typeEx.judge(t, { input }); };
    ok(!judge(shortW, 'dat').ok, 'a one-letter slip on a short word ("dag" typed "dat") was accepted');
    ok(judge(shortW, 'dat').close, 'a one-letter slip on a short word is not flagged as close');
    ok(judge(shortW, 'dag').ok, 'the exact short word was refused');
    const noun = NL.content.allItems().find(i => i.kind === 'word' && i.art && UU.bare(i.nl) === 'fiets');
    if (noun) ok(judge(noun, 'de fiets').ok, 'typing the article with the noun ("de fiets") was refused');
    ok(!judge(shortW, 'de dat').ok, 'an article must not excuse a misspelt word');
    const lw = UU.bare(longW.nl), slip = lw.slice(0, -1) + (lw.slice(-1) === 'x' ? 'y' : 'x');
    ok(judge(longW, slip).ok, 'one slip on a long word ("' + slip + '") was refused');
    console.log('  « dag » exact obligatoire, « ' + lw + ' » tolère une lettre, le quasi-juste est signalé');
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
    /* Le sens se lit par NL.gloss, dans chaque langue lue. */
    const was = NL.gloss.current();
    ['fr', 'en'].forEach(l => {
      NL.gloss.use(l);
      /* Les mots qui ont un jumeau de sens sont rares : on les tire bien plus
         souvent, sinon le hasard ne les met presque jamais face à face. */
      const hasTwin = it => all.some(x => x !== it && x.kind === it.kind && overlap(NL.gloss.bare(x), NL.gloss.bare(it)));
      all.forEach(it => {
        const reps = hasTwin(it) ? 60 : 3;
        for (let k = 0; k < reps; k++) {
          const p = NL.ex.get('pick').build(it), r = NL.ex.get('recall').build(it);
          built += 2;
          p.opts.filter(o => !o.ok).forEach(o => {
            if ((byNl[UU.norm(o.label)] || []).some(x => overlap(NL.gloss.bare(x), NL.gloss.bare(it)))) {
              second++; example = example || NL.gloss.bare(it) + ' → ' + o.label;
            }
          });
          r.opts.filter(o => !o.ok).forEach(o => {
            if (overlap(o.label, NL.gloss.bare(it))) { second++; example = example || it.nl + ' → ' + o.label; }
          });
        }
      });
    });
    NL.gloss.use(was);

    /* « Comment le dit-on ici ? » : une phrase face à deux mots isolés se devine. */
    let mixed = 0, vl = 0;
    all.filter(i => i.kind === 'phrase' && i.be && UU.norm(i.be) !== UU.norm(i.nl)).forEach(it => {
      const t = NL.ex.get('vlaams').build(it); vl++;
      const kinds = t.opts.filter(o => !o.ok).map(o => (all.find(x => x.be === o.label) || {}).kind);
      if (kinds.some(k => k !== 'phrase')) mixed++;
    });
    ok(mixed === 0, 'standaard/Vlaams paired a sentence with single-word distractors ' + mixed + ' of ' + vl + ' times');
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
    NL.state.setMeta({ displayLang: 'fr' }); NL.lang.apply(true);
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

  console.log('\nPROGRESS');
  const before = NL.content.unitProgress('overleven');
  NL.content.itemsOf('tijd').forEach(i => { if (i.kind !== 'pattern') NL.srs.seed(i, 2); });
  console.log('  unit progress   overleven ' + before.met + '/' + before.total + ' met, tijd ' + NL.content.unitProgress('tijd').met + '/' + NL.content.unitProgress('tijd').total);
  console.log('  course          ' + NL.content.courseProgress().met + ' met, ' + NL.content.courseProgress().produce + ' produced');
  console.log('  unit 2 open?    ' + NL.content.unitOpen('ikengij'));
  console.log('  counts          ' + JSON.stringify(NL.srs.counts()));
  console.log('  storage         ' + NL.state.storage);

  console.log('\n' + (fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('BOOT FAIL: ' + e.stack); process.exit(1); });
