/* Le genre examples-gen (décision 5c) : une phrase écrite pour le cours, pour chaque mot que le
   mainteneur a nommé à la porte des phrases, parce que Tatoeba n'en donne pas de bonne. Les
   mots nommés sont dans named.txt, à côté des lots : le néerlandais du mot tel que son premier
   listage l'écrit, un par ligne ; une ligne vide ou qui commence par « # » ne compte pas. Un
   fichier sans mot coupe zéro ligne, et Merge n'écrit rien.

   Une ligne écrite : { id, stamp, sentence: { nl, gap, en, fr } }. Check tient les règles des
   phrases sourcées (tools/content/kinds/examples.js, RULES), et le tutoiement du cours : ge ou
   gij, jamais je, jij, jou ni jouw. Le lecteur écrit sa propre traduction anglaise et française
   de nl avant de lire celles de la ligne, et les donne dans son verdict (en, fr) : c'est la
   seconde traduction, indépendante, que la décision demande. Chaque phrase écrite est lue en
   entier par le mainteneur (readWhole). Merge l'écrit dans src/content/sourced.js avec
   src 'gen' ; aucun crédit à Tatoeba, puisqu'elle n'en vient pas. */
const fs = require('fs'), path = require('path');
const examples = require('./examples');
const { JE } = require('../tatoeba');
const { tokens } = require('../../../test/lib/spelling');
const { oneLine } = require('../../../test/lib/text');

const FIELDS = ['nl', 'gap', 'en', 'fr'];

/* Split : les mots nommés, chacun un mot du cours encore sans phrase, une fois. */
function split(C, ctx) {
  const file = path.join(ctx.kindDir, 'named.txt');
  if (!fs.existsSync(file)) throw new Error('named.txt is missing: it holds the words the maintainer named, one per line, or none');
  const named = fs.readFileSync(file, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && l[0] !== '#');
  const words = C.sources.filter(s => s.kind === 'word'), bad = [];
  named.forEach((nl, k) => {
    const s = words.find(w => w.nl === nl);
    if (named.indexOf(nl) < k) bad.push('« ' + nl + ' » twice');
    else if (!s) bad.push('« ' + nl + ' » is not a word of the course');
    else if (s.drills && s.drills.length) bad.push('« ' + nl + ' » already has sentences');
  });
  if (bad.length) throw new Error('named.txt: ' + bad.join('; '));
  const groups = [];
  words.filter(s => named.indexOf(s.nl) >= 0).forEach(s => {
    if (!groups.length || groups[groups.length - 1].unit !== s.unit) groups.push({ unit: s.unit, rows: [] });
    groups[groups.length - 1].rows.push({ id: s.id, nl: s.nl, unit: s.unit, art: s.art || null, meaning: C.NL.gloss.meaning(s) });
  });
  return examples.cut(groups, examples.MAX);
}

/* Check : la phrase, ses quatre champs, les règles, et ge ou gij. */
function check(row, input, ctx) {
  const d = row.sentence;
  if (!d || typeof d !== 'object' || Array.isArray(d) || Object.keys(d).sort().join() !== FIELDS.slice().sort().join()) {
    return ['sentence has the fields ' + FIELDS.join(', ')];
  }
  if (!FIELDS.every(k => oneLine(d[k]))) return ['sentence: nl, gap, en and fr are each a string on one line with no space at either end'];
  const C = ctx.course(), out = examples.RULES(d, 'sentence', C.byId(input.id), C, ctx.repo);
  const je = tokens(d.nl).filter(t => JE.indexOf(t) >= 0);
  if (je.length) out.push('sentence: ' + je.map(t => '« ' + t + ' »').join(', ') + ' is not how the course says you: ge or gij');
  return out;
}

/* Le verdict : la traduction du lecteur, écrite de nl avant de lire celles de la ligne. */
const checkVerdict = v => (oneLine(v.en) && oneLine(v.fr) ? [] : ['a verdict carries the reader\'s own en and fr of nl, each on one line with no space at either end']);

module.exports = {
  stamp: examples.stamp,
  fields: ['sentence'],
  verdictFields: ['en', 'fr'],
  tables: ['sourced'],
  split,
  check,
  checkVerdict,
  merge: row => ({ sourced: [{ nl: row.sentence.nl, fr: row.sentence.fr, en: row.sentence.en, gap: row.sentence.gap, src: 'gen' }] }),
  readWhole: () => 'generated sentence'
};
