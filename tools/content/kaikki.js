/* Ce que le Wiktionnaire anglais dit du néerlandais, tiré du fichier épinglé kaikki/nl.jsonl
   (kaikki.org, tools/content/lib/cache.js), en deux extraits qui vivent dans .cache/, jamais
   dans un fichier versionné : rien du Wiktionnaire n'entre au dépôt, sauf le lemme qu'une
   preuve cite (ATTRIBUTION.md).
     .cache/kaikki/belgian.tsv  les sens marqués belges ou flamands : la preuve
                                « wiktionary:<lemme> » d'une forme flamande se vérifie ici
     .cache/kaikki/senses.tsv   chaque entrée du fichier, avec son genre et ses gloses : la preuve
                                « wiktionary:<lemme> » d'un mot nouveau, dont la nature (pos)
                                s'accorde, se vérifie ici

     node tools/content/kaikki.js <repo>    écrit les deux extraits, depuis .cache/kaikki/nl.jsonl
     const kaikki = require('./tools/content/kaikki');
     await kaikki.extract(repo, { pins })   { senses, lemmas, entries } : écrit les deux extraits
     kaikki.belgian(repo, { pins })         Map lemme → [{ pos, labels, gloss }], dans l'ordre de
                                            l'extrait ; une erreur qui dit la commande à lancer si
                                            l'extrait manque, ou s'il vient d'une autre épingle
     kaikki.senses(repo, { pins })          Map lemme → [{ pos, gender, glosses }], chaque entrée,
                                            marquée ou non ; les deux mêmes erreurs
     kaikki.marks(sense)                    les marques d'un sens du fichier, [] s'il n'en a pas
     kaikki.report(r)                       les deux lignes « ok » que la commande imprime

   Un sens est retenu dans belgian.tsv quand un de ses tags est Belgium, Flanders ou Flemish, ou
   qu'un de ses raw_tags nomme la Belgique, la Flandre ou le flamand (« in Belgium »). Brabant
   n'en est pas : le Brabant est aussi aux Pays-Bas. Chaque extrait est une ligne d'en-tête,
   « # kaikki/nl.jsonl sha256 <épingle> », puis des lignes triées par unités de code, une fois
   chacune, à cases séparées par des tabulations : belgian.tsv un sens par ligne (le lemme, sa
   nature (pos), ses marques séparées par « , », sa première glose) ; senses.tsv une entrée par
   ligne (le lemme, sa nature, son genre — de, het, both ou rien, lu dans head_templates comme
   test/tools/build-dehet.js le lit, à défaut dans les tags d'un sens —, la première glose de
   chaque sens, jointes par « | »). Le fichier épinglé est lu ligne à ligne, en JSON : rien ne
   s'en exécute. */
const fs = require('fs'), path = require('path'), readline = require('readline');
const cache = require('./lib/cache');

const KEY = 'kaikki/nl.jsonl';
const OUT = 'kaikki/belgian.tsv';
const SENSES = 'kaikki/senses.tsv';
const TAGS = ['Belgium', 'Flanders', 'Flemish'];
const RAW_TAG = /belgi|flanders|flemish/i;
const head = pins => '# ' + KEY + ' sha256 ' + (pins || cache.PINS)[KEY].sha256;
const cell = s => String(s == null ? '' : s).replace(/[\t\r\n]+/g, ' ').trim();

const marks = sense => (sense.tags || []).filter(t => TAGS.indexOf(t) >= 0)
  .concat((sense.raw_tags || []).filter(t => RAW_TAG.test(t)));

/* Le genre d'une entrée : « n » → het ; « m », « f », « mf », « c » → de, lus dans l'argument 1 de
   ses head_templates ; à défaut, les tags d'un sens (neuter, masculine, feminine, common-gender).
   Les deux → both ; rien → ''. */
const fromCode = c => (c === 'n' ? 'het' : (c === 'm' || c === 'f' || c === 'mf' || c === 'c') ? 'de' : null);
const fromTag = t => (t === 'neuter' ? 'het' : (t === 'masculine' || t === 'feminine' || t === 'common-gender') ? 'de' : null);
function gender(entry) {
  const gs = new Set();
  (entry.head_templates || []).forEach(h => {
    const a = h && h.args && h.args['1'];
    if (a) String(a).split(/[^a-z]+/).forEach(tok => { const g = fromCode(tok); if (g) gs.add(g); });
  });
  if (!gs.size) (entry.senses || []).forEach(s => (s.tags || []).forEach(t => { const g = fromTag(t); if (g) gs.add(g); }));
  return gs.size > 1 ? 'both' : gs.size ? [...gs][0] : '';
}

/* Un extrait écrit entier, sous son en-tête, par un fichier partiel renommé. */
function write(repo, name, pins, lines) {
  const out = path.join(path.resolve(repo), '.cache', name);
  fs.writeFileSync(out + '.part', [head(pins)].concat(lines).join('\n') + '\n');
  fs.renameSync(out + '.part', out);
}

async function extract(repo, opts) {
  const pins = (opts && opts.pins) || cache.PINS;
  const file = cache.get(repo, KEY, pins);
  const rows = new Set(), entries = new Set();
  let n = 0;
  const lines = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
  for await (const line of lines) {
    n++;
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch (e) { throw new Error(KEY + ':' + n + ': not JSON'); }
    const senses = entry.senses || [];
    senses.forEach(s => {
      const m = marks(s);
      if (m.length) rows.add([cell(entry.word), cell(entry.pos), m.map(cell).join(', '), cell((s.glosses || [])[0])].join('\t'));
    });
    const glosses = senses.map(s => cell((s.glosses || [])[0]).replace(/\|/g, '/')).filter(Boolean);
    entries.add([cell(entry.word), cell(entry.pos), gender(entry), glosses.join(' | ')].join('\t'));
  }
  const sorted = [...rows].sort(), all = [...entries].sort();
  write(repo, OUT, pins, sorted);
  write(repo, SENSES, pins, all);
  return { senses: sorted.length, lemmas: new Set(sorted.map(r => r.split('\t')[0])).size, entries: all.length };
}

/* Les lignes d'un extrait, son en-tête vérifié. */
function read(repo, name, pins) {
  const file = path.join(path.resolve(repo), '.cache', name);
  if (!fs.existsSync(file)) throw new Error('.cache/' + name + ' is missing: run node tools/content/kaikki.js .');
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  if (lines[0] !== head(pins)) throw new Error('.cache/' + name + ' comes from another pin of ' + KEY + ': run node tools/content/kaikki.js .');
  return lines.slice(1);
}

function belgian(repo, opts) {
  const map = new Map();
  read(repo, OUT, (opts && opts.pins) || cache.PINS).forEach(l => {
    const [word, pos, labels, gloss] = l.split('\t');
    if (!map.has(word)) map.set(word, []);
    map.get(word).push({ pos, labels: labels.split(', '), gloss });
  });
  return map;
}

function senses(repo, opts) {
  const map = new Map();
  read(repo, SENSES, (opts && opts.pins) || cache.PINS).forEach(l => {
    const [word, pos, g, glosses] = l.split('\t');
    if (!map.has(word)) map.set(word, []);
    map.get(word).push({ pos, gender: g, glosses: glosses ? glosses.split(' | ') : [] });
  });
  return map;
}

const report = r => ['ok .cache/' + OUT + ' ' + r.senses + ' senses, ' + r.lemmas + ' lemmas', 'ok .cache/' + SENSES + ' ' + r.entries + ' entries'];

module.exports = { extract, belgian, senses, marks, report };

if (require.main === module) {
  const repo = process.argv[2];
  if (!repo) { console.log('usage: node tools/content/kaikki.js <repo>'); process.exit(1); }
  extract(repo).then(r => {
    report(r).forEach(l => console.log(l));
  }, e => { console.log('fail ' + e.message); process.exit(1); });
}
