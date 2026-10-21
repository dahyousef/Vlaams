/* Headless smoke test: loads every module into a stubbed browser and exercises
   the content model, the scheduler and all ten exercise types. */
const path = require('path'), fs = require('fs');
const browser = require('./lib/browser');
const langs = require('./lib/langs');
const ROOT = process.argv[2];
/* A file of the repository, read as it is. */
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

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

/* Une source relue sans ses chaînes, ses commentaires, ses regex ni le texte de ses
   gabarits : { code, found }. Dans code, chacun de leurs caractères devient une espace,
   les sauts de ligne restent, et les numéros de ligne avec eux. Une chaîne ou une regex
   encore ouverte en fin de ligne, ou quoi que ce soit d'ouvert en fin de fichier, est
   dans found à sa ligne : la relecture a perdu le fil, elle ne passe pas en silence. */
function codeOnly(src) {
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
  return { code: out.join(''), found };
}

/* Les `var` et les `?.` d'une source, chacun avec sa ligne, lus dans ce que codeOnly() en
   laisse, avec ce que la relecture y a perdu. */
function syntaxFindings(src) {
  const { code, found } = codeOnly(src);
  const lineAt = k => code.slice(0, k).split('\n').length;
  [[/(?<![\w$.])var(?=\s+[\w$[{])/g, 'var'], [/\?\.(?!\d)/g, '?.']].forEach(([rx, what]) =>
    Array.from(code.matchAll(rx)).forEach(m => found.push({ line: lineAt(m.index), what })));
  return found.sort((a, b) => a.line - b.line);
}

/* Les blocs d'une source qui s'ouvrent sur une ligne où `head` se trouve : { line, m, text }.
   Un bloc va jusqu'à la ligne qui revient au retrait de sa tête, l'accolade ou le crochet
   qui le ferme compris. Il suit le retrait, pas la syntaxe : il sert aux gardes, sur du code
   tenu. */
function blocks(src, head) {
  const lines = src.split('\n'), out = [];
  const indent = l => l.match(/^\s*/)[0].length;
  lines.forEach((l, i) => {
    const m = head.exec(l);
    if (!m) return;
    let j = i + 1;
    while (j < lines.length && (lines[j].trim() === '' || indent(lines[j]) > indent(l))) j++;
    if (j < lines.length && indent(lines[j]) === indent(l) && /^\s*[}\])]/.test(lines[j])) j++;
    out.push({ line: i + 1, m, text: lines.slice(i, j).join('\n') });
  });
  return out;
}
/* La source sans les blocs qui s'ouvrent sur `head`. */
const outside = (src, head) => blocks(src, head).reduce((s, b) => s.replace(b.text, ''), src);

/* Les fonctions d'une source qui parcourent un arbre à la main : une fonction qui s'appelle
   elle-même, ou se passe elle-même (forEach(walk)), en allant de clé en clé (Object.keys,
   values, entries, ou for … in). Ni son nom ni son argument ne comptent, ni `async`. Une
   fonction nommée (`function walk`, `const walk = …`) s'appelle par son nom seul. Une méthode
   d'objet (`walk(v) {`, `walk: function`) ou un `x.walk = …` s'appelle par `this.walk` ou
   `x.walk` : pour elle, c'est le nom qualifié qui compte, hors Object.keys et ses sœurs, que
   la méthode `keys` d'un objet ne prend pas pour elle-même. */
function handWalkers(src) {
  const named = /^\s*(?:(?:async\s+)?function\s+(\w+)\s*\(|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*=>|\w+\s*=>))/;
  const owned = /^\s*(?:(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{|(?:(\w+)\s*:|[\w$.]+\.(\w+)\s*=)\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*=>|\w+\s*=>))/;
  const callsItself = f => new RegExp('(?<![\\w$.])' + f.by + f.name + '\\s*\\(|[(,]\\s*' + f.by + f.name + '\\s*[),]').test(f.body);
  return blocks(src, named).map(b => ({ line: b.line, name: b.m[1] || b.m[2], body: b.text.slice(b.m[0].length), by: '' }))
    .concat(blocks(src, owned).map(b => ({ line: b.line, name: b.m[1] || b.m[2] || b.m[3], body: b.text.slice(b.m[0].length), by: '(?!Object\\.)[\\w$.]+\\.' })))
    .filter(f => callsItself(f) && /Object\.(keys|values|entries)\(|for\s*\(\s*(const|let)\s+\w+\s+in\b/.test(f.body))
    .sort((a, b) => a.line - b.line);
}

/* Les actes d'une source et les textes du journal d'erreurs : combien de blocs s'ouvrent sur
   l'acte errcopy, et chaque autre acte dont le bloc montre errCopied ou errCopyByHand. Tous
   les actes de la condition qui ouvre le bloc comptent, pas le premier seul : avec
   `act === 'save' || act === 'errcopy'`, les deux actes partagent le bloc. Une condition dont
   la ligne finit sur || ou && continue sur la suivante, et l'acte d'une ligne qui continue
   une condition est lu avec elle, pas comme un bloc à lui. */
function errTextActs(src) {
  const out = { errcopy: 0, wrong: [] }, lines = src.split('\n');
  const goesOn = k => k >= 0 && /(\|\||&&)\s*$/.test(lines[k]);
  blocks(src, /\bact === '[\w-]+'/).filter(b => !goesOn(b.line - 2)).forEach(b => {
    let k = b.line - 1;
    while (goesOn(k) && k + 1 < lines.length) k++;
    const acts = Array.from(lines.slice(b.line - 1, k + 1).join('\n').matchAll(/\bact === '([\w-]+)'/g), m => m[1]);
    if (acts.indexOf('errcopy') >= 0) out.errcopy++;
    if (/\berrCop(ied|yByHand)\b/.test(b.text)) acts.filter(a => a !== 'errcopy').forEach(a => out.wrong.push({ line: b.line, act: a }));
  });
  return out;
}

/* Une relecture du code s'éprouve sur des cas écrits à la main : chaque cas est
   [source, ce que `f` doit y trouver], et un cas raté dit ce que la relecture `name` y a
   trouvé. */
function selfTest(name, f, cases) {
  cases.forEach(([src, want]) => ok(JSON.stringify(f(src)) === JSON.stringify(want),
    name + ' check on ' + JSON.stringify(src) + ' found ' + JSON.stringify(f(src)) + ', wanted ' + JSON.stringify(want)));
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
  selfTest('syntax', found, [
    ['var x = 1;', ['1 var']],
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
  ]);
  const sources = browser.sources(ROOT);
  /* sw.js n'est pas dans SRC : build.sh le copie à côté de la page (cp … dist/), et
     chaque appareil qui ouvre l'app l'installe. Les .js des lignes cp sont donc relus
     aussi. vendor/supabase.js, du code tiers, entre dans la page par cat : il n'est
     sur aucune des deux listes, et la relecture ne le lit pas. */
  const copied = (read('build.sh').match(/^cp .* dist\/\s*$/gm) || [])
    .flatMap(l => l.trim().split(/\s+/).slice(1, -1)).filter(f => /\.js$/.test(f));
  const why = { 'var': 'a var declaration, use const, or let where it changes', '?.': 'optional chaining (?.)' };
  let seen = 0;
  ok(sources.length > 0, 'the syntax check read no source file from build.sh');
  ok(copied.length > 0, 'the syntax check read no .js file from a cp … dist/ line of build.sh');
  sources.concat(copied).forEach(f => syntaxFindings(read(f)).forEach(x => {
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
    const src = read(f);
    ok(!/[^\w-]lang="'\s*\+/.test(src), f + ': a lang attribute is built by hand; use NL.gloss.langAttr');
    ok(src.indexOf('en-GB') < 0, f + ': en-GB is written outside gloss.js; use NL.gloss.tag');
  });

  /* #74. What already has a name is not written out again: the other language is
     NL.gloss.other, the comparison of senses is read from NL.gloss alone, and « the text,
     if there is any » is NL.ui.ifText. */
  const byHand = /NL\.gloss\.of\(([\w.]+)\) \? '<\w+[^']*>' \+ esc\(NL\.gloss\.of\(\1\)\)/g;
  sources.forEach(f => {
    const src = read(f);
    if (f !== 'src/core/gloss.js') ok(!/=== '(en|fr)' \? '(?!\1)(?:en|fr)' : '\1'/.test(src), f + ': works out the other language by hand; use NL.gloss.other');
    (src.match(byHand) || []).forEach(m => ok(false, f + ': ' + m + '… writes « the text, if there is any » by hand; use NL.ui.ifText'));
  });
  ok(!('sameSense' in NL.ex), 'NL.ex re-exports sameSense; read it from NL.gloss');

  /* #74. What the device can do with speech is told in two keys of NL.t, read at draw time
     as home.js and shell.js read t[v.noteKey]: in doctor.js's TIERS, each tier that
     NL.speech.tier() can name holds { labelKey, noteKey }, two keys of NL.t, and no getter
     stands in for them. */
  const doctor = read('src/ui/doctor.js');
  const tierKeys = {};
  ((doctor.match(/const TIERS = \{([\s\S]*?)\r?\n  \};/) || [])[1] || '').split(/\r?\n/).forEach(l => {
    const m = /^\s*(\w+): \{ labelKey: '(\w+)', noteKey: '(\w+)' \},?$/.exec(l);
    if (m) tierKeys[m[1]] = [m[2], m[3]];
  });
  const tierIds = (read('src/core/speech.js').match(/\{ id: '\w+'/g) || []).map(s => s.slice(7, -1));
  ok(tierIds.length > 0, 'src/core/speech.js: tier() names no tier this check can read; the check on TIERS reads nothing');
  tierIds.forEach(id => ok(!!tierKeys[id] && tierKeys[id].every(k => typeof NL.t[k] === 'string'),
    'src/ui/doctor.js: TIERS.' + id + ' does not hold { labelKey, noteKey }, two keys of NL.t read at draw time'));
  ok(!/\bget (label|note)\(\)/.test(doctor), 'src/ui/doctor.js reads a speech text through a getter; TIERS hold keys, read as t[info.labelKey] and t[info.noteKey]');

  /* Rebuilt settings keep the device's language in one place: outside withDeviceLang,
     nothing sets their displayLang. */
  const state = read('src/core/state.js');
  ok(!/\.displayLang\s*=[^=]/.test(outside(state, /^\s*function withDeviceLang\(/)), 'src/core/state.js gives rebuilt settings the device\'s language by hand; use withDeviceLang');

  /* The suites share their helpers through test/lib, and a copy drifts from the original.
     A click goes through B.tap, there is one fake Supabase, a due date comes from the
     suite's clock, never from an epoch written out by hand, timers that wait for the end
     of the tick are the fake browser's timers ('held', ended by B.tick()), so are the
     fields a screen reads (byId: 'stub', filled through B.fields), and the text a page
     shows, without its tags, is text() from test/lib/langs.js, or joined() where what a tag
     splits reads as one, a bold word and the punctuation beside it. A source runs in a page
     only through browser.open; what comes before src/app.js starts goes in its prepare. */
  const suites = ['test', 'test/tools'].reduce((all, d) => all.concat(fs.readdirSync(path.join(ROOT, d))
    .filter(f => /\.js$/.test(f)).map(f => d + '/' + f)), []);
  suites.forEach(f => {
    const src = read(f);
    ok(!/target:\s*\{\s*closest:\s*\(\)\s*=>\s*\(\{\s*dataset/.test(src), f + ': builds a click by hand; use B.tap from test/lib/browser.js');
    ok(!/createClient\s*(:|\([^)]*\)\s*\{)/.test(src), f + ': defines a second fake Supabase; use test/lib/supabase.js');
    ok(!/\.due\s*=\s*\d{10,}/.test(src), f + ': writes a due date from a bare epoch; use the suite clock, as test/lib/seed.js does');
    ok(!/\.setTimeout\s*=[^=]/.test(src), f + ': replaces setTimeout by hand; use timers: \'held\' and B.tick() from test/lib/browser.js');
    ok(!/\.getElementById\s*=[^=]/.test(src), f + ': fakes the page\'s fields by hand; use byId: \'stub\' and B.fields from test/lib/browser.js');
    ok(!/\.replace\(\/<\[\^>\]\*>\/g/.test(src), f + ': strips a page\'s tags by hand; use text() or joined() from test/lib/langs.js');
    ok(!/runInContext\([^;]*\.ctx\b/.test(src), f + ': runs a source in a page by hand; load it through browser.open, with what comes before src/app.js in prepare');
  });
  ok(typeof langs.joined === 'function' && langs.joined('<b>al</b>, <i>zo</i>') === 'al, zo' && langs.text('<b>al</b>, <i>zo</i>') === 'al , zo',
    'test/lib/langs.js: joined() does not take each tag out with nothing in its place, beside text(), which puts a blank there');
  console.log('  suites          ' + suites.length + ' files: no hand-built click, no second fake Supabase, no due date from a bare epoch, no timer, page field, tag-stripper or hand-run source of their own');

  /* The fake browser's 'held' timers keep a real tick's rules, which lang.js's 5b counts on:
     nothing runs before B.tick(), then every timer runs in the order it was set; clearTimeout
     takes one out, before the tick or during it; a timer set during the tick waits for the
     next. B.waiting() counts the timers that wait. An unknown mode fails and names itself.
     These pages load no source, only timers. */
  {
    const H = browser.open({ root: ROOT, files: [], timers: 'held' });
    const ran = [];
    H.ctx.setTimeout(() => { ran.push('a'); H.ctx.setTimeout(() => ran.push('next'), 0); }, 0);
    const b = H.ctx.setTimeout(() => ran.push('b'), 0);
    H.ctx.setTimeout(() => { ran.push('c'); H.ctx.clearTimeout(d); }, 0);
    const d = H.ctx.setTimeout(() => ran.push('d'), 0);
    H.ctx.clearTimeout(b);
    const before = ran.join(' '), waitedBefore = H.waiting();
    H.tick();
    const first = ran.join(' '), waitedFirst = H.waiting();
    H.tick();
    ok(before === '' && first === 'a c' && ran.join(' ') === 'a c next', 'test/lib/browser.js: held timers ran « ' + before + ' » before B.tick(), « ' + first + ' » at the first tick and « ' + ran.join(' ') + ' » by the second; wanted « », « a c » and « a c next »');
    ok(waitedBefore === 3 && waitedFirst === 1 && H.waiting() === 0, 'test/lib/browser.js: B.waiting() counted ' + waitedBefore + ', ' + waitedFirst + ' and ' + H.waiting() + ' held timers; wanted 3 before the first tick, 1 after it and 0 after the second');
    let unknown = '';
    try { browser.open({ root: ROOT, files: [], timers: 'hold' }); } catch (e) { unknown = e.message; }
    ok(unknown.indexOf('hold') >= 0, 'test/lib/browser.js: an unknown timers mode fails without naming itself: « ' + unknown + ' »');
    /* An error in a held timer comes out of B.tick(), the suite's own call, once the tick's other
       timers have run; onTimerError, when given, receives it instead. */
    const E = browser.open({ root: ROOT, files: [], timers: 'held' });
    const after = [];
    E.ctx.setTimeout(() => { throw new Error('boom'); }, 0);
    E.ctx.setTimeout(() => after.push('next'), 0);
    let thrown = '';
    try { E.tick(); } catch (e) { thrown = e.message; }
    ok(thrown === 'boom' && after.join(' ') === 'next', 'test/lib/browser.js: an error in a held timer came out of B.tick() as « ' + thrown + ' » and the timer after it ran « ' + after.join(' ') + ' »; wanted « boom » and « next »');
    const caught = [];
    const C = browser.open({ root: ROOT, files: [], timers: 'held', onTimerError: e => caught.push(e.message) });
    C.ctx.setTimeout(() => { throw new Error('boom'); }, 0);
    let out = '';
    try { C.tick(); } catch (e) { out = e.message; }
    ok(out === '' && caught.join(' ') === 'boom', 'test/lib/browser.js: with onTimerError, a held timer\'s error came out of B.tick() as « ' + out + ' » and reached the handler as « ' + caught.join(' ') + ' »; wanted « » and « boom »');
  }
  console.log('  fake browser    held timers wait for B.tick(), run in order, can be cleared and are counted, and their errors come out of B.tick(); an unknown mode names itself');

  /* prepare(NL) runs once every other source is loaded, just before src/app.js starts the
     app: test/lang.js changes its course there. A page that does not load src/app.js has no
     such moment, and asking for one fails. */
  {
    const ran = [];
    browser.open({ root: ROOT, seed: browser.SEED, byId: 'stub', prepare: N => {
      ran.push(N.ui && N.content ? 'prepare' : 'prepare before the sources');
      const watch = N.errlog.watch;
      N.errlog.watch = () => { ran.push('app.js'); watch(); };
    } });
    ok(ran.join(' ') === 'prepare app.js', 'test/lib/browser.js: prepare ran « ' + ran.join(' ') + ' »; wanted « prepare app.js », once the other sources were loaded and just before src/app.js');
    let without = '';
    try { browser.open({ root: ROOT, files: [], prepare: () => {} }); } catch (e) { without = e.message; }
    ok(without.indexOf('src/app.js') >= 0, 'test/lib/browser.js: prepare on a page without src/app.js fails without saying so: « ' + without + ' »');
  }
  console.log('  fake browser    prepare runs just before src/app.js, and fails on a page that does not load it');

  /* #74. A name says what it holds. What is typed into « Mes mots » beside the Dutch is a
     gloss (GLOSSARY.md), in either language; the notice's list holds keys of NL.t; only the
     error log's own copy (errcopy) shows its two texts, and the backup's copy has its own;
     and voiceInfo() hands back a key of NL.t, read as t[v.noteKey]. The old names kept out
     are the ones main had: a name that lived only on a branch has nowhere to come back from. */
  sources.concat(suites).forEach(f => {
    const src = read(f);
    ok(!/\bwords(Ph)?Fr\b|\badd-en\b/.test(src), f + ': names the gloss typed into « Mes mots » by an old name; it is wordsGloss, wordsPhGloss and add-gloss');
    ok(!/\bv\.note\b|voiceInfo\(\)\.note\b/.test(src), f + ': reads the voice report\'s key under its old name; it is noteKey');
  });
  ok(!/\bconst en\b/.test(read('src/ui/library.js')), 'src/ui/library.js: the gloss typed into « Mes mots » is held under an old name; it is gloss');
  ok(!/\bnotice\s*=[^=]/.test(read('src/core/lang.js')), 'src/core/lang.js: the notice\'s list of keys is named notice; it is noticeKeys');
  selfTest('error-text', errTextActs, [
    ["if (d.act === 'errcopy') copy(t.errCopied, t.errCopyByHand);", { errcopy: 1, wrong: [] }],
    ["if (d.act === 'errcopy' || d.act === 'save') copy(t.errCopied, t.errCopyByHand);", { errcopy: 1, wrong: [{ line: 1, act: 'save' }] }],
    ["if (d.act === 'save') {\n  copy(t.errCopied);\n}", { errcopy: 0, wrong: [{ line: 1, act: 'save' }] }],
    ["if (d.act === 'save' || d.act === 'errcopy') {\n  copy(t.errCopyByHand);\n}", { errcopy: 1, wrong: [{ line: 1, act: 'save' }] }],
    ["if (d.act === 'errcopy' ||\n    d.act === 'save') {\n  copy(t.errCopyByHand);\n}", { errcopy: 1, wrong: [{ line: 1, act: 'save' }] }],
    ["if (d.act === 'save' ||\n    d.act === 'errcopy') {\n  copy(t.errCopyByHand);\n}", { errcopy: 1, wrong: [{ line: 1, act: 'save' }] }]
  ]);
  const errActs = sources.map(f => Object.assign({ f }, errTextActs(read(f))));
  errActs.forEach(a => a.wrong.forEach(w => ok(false, a.f + ':' + w.line + ': the ' + w.act + ' act shows the error log\'s texts; only errcopy does, and the backup has backupCopied and backupCopyByHand')));
  ok(errActs.some(a => a.errcopy > 0), 'no source opens a block on the errcopy act: the error log\'s copy was moved or renamed, and the check above reads nothing');
  ok(typeof NL.tables.fr.backupCopied === 'string' && typeof NL.tables.fr.backupCopyByHand === 'string', 'fr.js has no backupCopied or backupCopyByHand');
  ok(typeof NL.t[NL.speech.voiceInfo().noteKey] === 'string', 'voiceInfo() has no noteKey naming a key of NL.t');
  /* Applying the language and telling it are two calls, not one call and a flag. */
  ok(NL.lang.apply.length === 0 && typeof NL.lang.applyAndTell === 'function', 'NL.lang.apply takes a flag; apply() is silent, applyAndTell() raises the notice');
  sources.concat(suites).forEach(f => ok(!/lang\.apply\((true|false)\)/.test(read(f)),
    f + ': passes a flag to NL.lang.apply; call apply() or applyAndTell()'));

  /* #74. The course as it is written is copied by raw() in test/lib/prose.js, and a tree is
     walked by test/lib/tree.js, the whole course by its visitCourse() and rewriteCourse().
     A walker written by hand is what handWalkers() finds. These guards read the suites
     only: test/lib holds the walkers, and src/content/index.js copies the course on purpose
     when it builds it (build(), about line 37). */
  const walks = src => handWalkers(src).map(w => w.line + ' ' + w.name);
  selfTest('walker', walks, [
    ['function walk(v) { if (v && typeof v === \'object\') Object.keys(v).forEach(k => walk(v[k])); }', ['1 walk']],
    ['const flat = (o, out) => {\n  for (const k in o) flat(o[k], out);\n  return out;\n};', ['1 flat']],
    ['const each = v => { if (v && typeof v === \'object\') Object.values(v).forEach(each); };', ['1 each']],
    ['  const strip = function (v) {\n    Object.entries(v).forEach(([k, x]) => { if (x && typeof x === \'object\') strip(x); });\n  };', ['1 strip']],
    ['function size(o) {\n  return Object.keys(o).length;\n}\nfunction walk(t) {\n  if (Array.isArray(t)) t.forEach(walk);\n  else Object.keys(t).forEach(k => walk(t[k]));\n}', ['4 walk']],
    ['async function walk(v) {\n  for (const k in v) await walk(v[k]);\n}', ['1 walk']],
    ['const each = async (v) => { Object.values(v).forEach(each); };', ['1 each']],
    ['function files(d) {\n  return fs.readdirSync(d).flatMap(f => /\\./.test(f) ? [f] : files(d + \'/\' + f));\n}', []],
    ['const visit = C => Object.keys(C).forEach(k => tree.visit(C[k], f));', []],
    ['const T = {\n  walk(v) {\n    Object.keys(v).forEach(k => this.walk(v[k]));\n  }\n};', ['2 walk']],
    ['const T = {\n  walk: function (v) {\n    for (const k in v) T.walk(v[k]);\n  }\n};', ['2 walk']],
    ['T.each = v => { if (v && typeof v === \'object\') Object.values(v).forEach(T.each); };', ['1 each']],
    ['NL.x.walk = async function (v) {\n  for (const k in v) await NL.x.walk(v[k]);\n};', ['1 walk']],
    ['const T = {\n  async walk(v) {\n    for (const k in v) await this.walk(v[k]);\n  }\n};', ['2 walk']],
    ['const T = {\n  walk: v => {\n    Object.keys(v).forEach(k => T.walk(v[k]));\n  }\n};', ['2 walk']],
    ['const T = {\n  walk(v) {\n    Object.keys(v).forEach(k => walk(v[k]));\n  }\n};', []],
    ['const o = {\n  keys(o) { return Object.keys(o).length; }\n};', []]
  ]);
  /* A loop over COLLECTIONS that calls visit() or rewrite() walks the course one collection
     at a time, whatever its argument is written as and whatever comes before the call: the
     lines such loops open on. The suite is read as codeOnly() leaves it, so a loop written in
     a string or a comment, as in this table, does not count; a suite codeOnly() loses the
     thread of is named, since what it lost would go unread. */
  const perCollection = src => blocks(codeOnly(src).code, /(?<![\w$])COLLECTIONS\.forEach\(/)
    .filter(b => /\b(visit|rewrite)\(/.test(b.text)).map(b => b.line);
  selfTest('collection', perCollection, [
    ['COLLECTIONS.forEach(k => tree.visit(C[k], f, k, k));', [1]],
    ['COLLECTIONS.forEach((k) => { C[k] = tree.rewrite(C[k], f, k, k); });', [1]],
    ['const n = 0;\nCOLLECTIONS.forEach(k => {\n  const x = C[k];\n  tree.visit(x, f, k, k);\n});', [2]],
    ['COLLECTIONS.forEach(k => owed(C[k], k, \'\', out));', []],
    ['// COLLECTIONS.forEach(k => tree.visit(C[k], f));', []],
    ['/*\n  COLLECTIONS.forEach(k => tree.visit(C[k], f));\n*/', []],
    ['const s = "a COLLECTIONS.forEach(k => tree.visit(C[k], f))";', []]
  ]);
  suites.forEach(f => {
    const src = read(f);
    ok(!/JSON\.parse\(JSON\.stringify\(NL\.content/.test(src), f + ': copies the course by hand; use raw() from test/lib/prose.js');
    handWalkers(src).forEach(w => ok(false, f + ':' + w.line + ': ' + w.name + '() walks a tree by hand; use test/lib/tree.js'));
    perCollection(src).forEach(line => ok(false, f + ':' + line +
      ': walks the course one collection at a time; use visitCourse() or rewriteCourse() from test/lib/tree.js'));
    codeOnly(src).found.forEach(x => ok(false, f + ':' + x.line + ': ' + x.what + ' as the collection check reads it, which may hide a loop'));
  });

  /* A file of the repository is read through read(), not spelt out again at each check:
     outside read() itself, no line of this suite reads a path under ROOT. */
  read('test/smoke.js').split('\n').forEach((l, i) => {
    if (/readFileSync\(path\.join\(ROOT,/.test(l) && !/^const read = /.test(l)) ok(false, 'test/smoke.js:' + (i + 1) + ': reads a file of the repository by hand; use read()');
  });

  /* A check that reads code proves itself on cases written out by hand, through selfTest():
     outside it, no table of cases is run through ok() by hand. */
  ok(!/\.forEach\(\(\[src, want\]\)/.test(outside(read('test/smoke.js'), /^function selfTest\(/)), 'test/smoke.js checks a table of cases by hand; use selfTest()');

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
    NL.state.setMeta({ displayLang: 'fr' }); NL.lang.apply();
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
