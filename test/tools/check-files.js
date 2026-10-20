/* Écrit les fichiers que la séance de contrôle de l'anglais lit.
     node test/tools/check-files.js . <dossier-de-sortie>
   glosses.tsv   id kind unit nl be fr en     (un élément intégré par ligne)
   blind.tsv     les mêmes lignes sans `en`, pour la passe à l'aveugle
   sentences.tsv where nl fr en              (phrases d'exemple et répliques de scénario)
   prose.tsv     where fr en                 (toute autre paire de texte)
   interface.tsv key fr en                   (chaque clé des deux tables ; une fonction est essayée à (3, 7))
   Chaque `where` est le chemin que donne owed() dans test/lib/prose.js. */
const fs = require('fs'), path = require('path');
const browser = require('../lib/browser');
const { COLLECTIONS, owed } = require('../lib/prose');
const ROOT = process.argv[2] || path.join(__dirname, '..', '..');
const OUT = process.argv[3];
if (!OUT) { console.log('usage: node test/tools/check-files.js <racine> <dossier-de-sortie>'); process.exit(1); }

const B = browser.open({ root: ROOT, seed: browser.SEED, skip: ['src/app.js'] });
const NL = B.NL;
/* Le cours tel qu'il est écrit, avant la première construction. */
const RAW = {};
COLLECTIONS.forEach(k => { RAW[k] = JSON.parse(JSON.stringify(NL.content[k] || [])); });

/* Une cellule tient sur une ligne : ni tabulation ni saut de ligne. */
const cell = x => (x === null || x === undefined ? '' : String(x)).replace(/[\t\r\n]+/g, ' ');
const line = cols => cols.map(cell).join('\t');

/* Retrouve dans RAW l'objet qu'un `where` désigne. */
function at(where) {
  const re = /\[(\d+)\]|\.?([^.\[\]]+)/g;
  let v = RAW, m;
  while ((m = re.exec(where)) && v !== undefined && v !== null) v = m[1] !== undefined ? v[+m[1]] : v[m[2]];
  return v;
}
/* Le texte français ou anglais d'une valeur : une paire, ou une chaîne (français seul). */
const side = (v, l) => (v && typeof v === 'object') ? v[l] : (l === 'fr' ? v : '');

const GLOSS = /^(units\[\d+\]\.(words|phrases)\[\d+\]|patterns\[\d+\])\.fr$/;
const SENTENCE = /(\.drills\[\d+\]|scenarios\[\d+\]\.steps\[\d+\]\.(them|you\.choices\[\d+\](\.reply)?))\.fr$/;

NL.state.open().then(() => {
  NL.content.refresh();
  const places = [];
  COLLECTIONS.forEach(k => owed(RAW[k], k, '', places));

  const files = { 'glosses.tsv': [], 'blind.tsv': [], 'sentences.tsv': [], 'prose.tsv': [], 'interface.tsv': [] };

  NL.content.allItems().filter(it => it.unit !== 'eigen').forEach(it => {
    files['glosses.tsv'].push(line([it.id, it.kind, it.unit, it.nl, it.be, it.fr, it.en]));
    files['blind.tsv'].push(line([it.id, it.kind, it.unit, it.nl, it.be, it.fr]));
  });

  let glossPlaces = 0;
  places.forEach(r => {
    if (GLOSS.test(r.where)) { glossPlaces++; return; }
    if (SENTENCE.test(r.where)) {
      const o = at(r.where.replace(/\.fr$/, ''));
      files['sentences.tsv'].push(line([r.where, o && o.nl, o && o.fr, o && o.en]));
      return;
    }
    const v = at(r.where);
    files['prose.tsv'].push(line([r.where, side(v, 'fr'), side(v, 'en')]));
  });

  const T = NL.tables;
  const show = (t, k) => {
    const v = t[k];
    if (typeof v === 'function') return v(3, 7);
    if (typeof v === 'string') return v;
    return JSON.stringify(v);
  };
  Object.keys(T.fr).forEach(k => files['interface.tsv'].push(line([k, show(T.fr, k), show(T.en, k)])));

  fs.mkdirSync(OUT, { recursive: true });
  Object.keys(files).forEach(f => {
    fs.writeFileSync(path.join(OUT, f), files[f].join('\n') + '\n', 'utf8');
    console.log(f + '  ' + files[f].length + ' lignes');
  });
  const sum = files['glosses.tsv'].length + files['sentences.tsv'].length + files['prose.tsv'].length;
  console.log('glosses + sentences + prose = ' + sum + ' ; owed() liste ' + places.length + ' endroits (' + glossPlaces + ' de gloses)');
  process.exit(sum === places.length ? 0 : 1);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
