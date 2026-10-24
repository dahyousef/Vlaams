/* Les sens que le Wiktionnaire anglais marque belges ou flamands, tirés du fichier épinglé
   kaikki/nl.jsonl (kaikki.org, tools/content/lib/cache.js). La preuve « wiktionary:<lemme> »
   d'une forme flamande se vérifie ici : le lemme cité a un sens ainsi marqué. L'extrait vit
   dans .cache/kaikki/belgian.tsv, jamais dans un fichier versionné : rien du Wiktionnaire
   n'entre au dépôt, sauf le lemme qu'une preuve cite (ATTRIBUTION.md).

     node tools/content/kaikki.js <repo>    écrit l'extrait, depuis .cache/kaikki/nl.jsonl
     const kaikki = require('./tools/content/kaikki');
     await kaikki.extract(repo, { pins })   { senses, lemmas } : écrit l'extrait
     kaikki.belgian(repo, { pins })         Map lemme → [{ pos, labels, gloss }], dans l'ordre de
                                            l'extrait ; une erreur qui dit la commande à lancer si
                                            l'extrait manque, ou s'il vient d'une autre épingle
     kaikki.marks(sense)                    les marques d'un sens du fichier, [] s'il n'en a pas

   Un sens est retenu quand un de ses tags est Belgium, Flanders ou Flemish, ou qu'un de ses
   raw_tags nomme la Belgique, la Flandre ou le flamand (« in Belgium »). Brabant n'en est pas :
   le Brabant est aussi aux Pays-Bas. L'extrait est une ligne d'en-tête, « # kaikki/nl.jsonl
   sha256 <épingle> », puis une ligne par sens, triée par unités de code, une fois chacune :
   le lemme, sa nature (pos), ses marques séparées par « , », sa première glose, séparés par
   des tabulations. Le fichier épinglé est lu ligne à ligne, en JSON : rien ne s'en exécute. */
const fs = require('fs'), path = require('path'), readline = require('readline');
const cache = require('./lib/cache');

const KEY = 'kaikki/nl.jsonl';
const OUT = 'kaikki/belgian.tsv';
const TAGS = ['Belgium', 'Flanders', 'Flemish'];
const RAW_TAG = /belgi|flanders|flemish/i;
const head = pins => '# ' + KEY + ' sha256 ' + (pins || cache.PINS)[KEY].sha256;
const cell = s => String(s == null ? '' : s).replace(/[\t\r\n]+/g, ' ').trim();

const marks = sense => (sense.tags || []).filter(t => TAGS.indexOf(t) >= 0)
  .concat((sense.raw_tags || []).filter(t => RAW_TAG.test(t)));

async function extract(repo, opts) {
  const pins = (opts && opts.pins) || cache.PINS;
  const file = cache.get(repo, KEY, pins);
  const rows = new Set();
  let n = 0;
  const lines = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
  for await (const line of lines) {
    n++;
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch (e) { throw new Error(KEY + ':' + n + ': not JSON'); }
    (entry.senses || []).forEach(s => {
      const m = marks(s);
      if (m.length) rows.add([cell(entry.word), cell(entry.pos), m.map(cell).join(', '), cell((s.glosses || [])[0])].join('\t'));
    });
  }
  const sorted = [...rows].sort();
  const out = path.join(path.resolve(repo), '.cache', OUT);
  fs.writeFileSync(out + '.part', [head(pins)].concat(sorted).join('\n') + '\n');
  fs.renameSync(out + '.part', out);
  return { senses: sorted.length, lemmas: new Set(sorted.map(r => r.split('\t')[0])).size };
}

function belgian(repo, opts) {
  const pins = (opts && opts.pins) || cache.PINS;
  const file = path.join(path.resolve(repo), '.cache', OUT);
  if (!fs.existsSync(file)) throw new Error('.cache/' + OUT + ' is missing: run node tools/content/kaikki.js .');
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  if (lines[0] !== head(pins)) throw new Error('.cache/' + OUT + ' comes from another pin of ' + KEY + ': run node tools/content/kaikki.js .');
  const map = new Map();
  lines.slice(1).forEach(l => {
    const [word, pos, labels, gloss] = l.split('\t');
    if (!map.has(word)) map.set(word, []);
    map.get(word).push({ pos, labels: labels.split(', '), gloss });
  });
  return map;
}

module.exports = { extract, belgian, marks };

if (require.main === module) {
  const repo = process.argv[2];
  if (!repo) { console.log('usage: node tools/content/kaikki.js <repo>'); process.exit(1); }
  extract(repo).then(r => {
    console.log('ok .cache/' + OUT + ' ' + r.senses + ' senses, ' + r.lemmas + ' lemmas');
  }, e => { console.log('fail ' + e.message); process.exit(1); });
}
