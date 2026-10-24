/* L'orthographe du cours, écrite une fois : test/content.js la vérifie, et un genre du kit
   (tools/content/kinds/) épelle comme elle. Une forme néerlandaise est connue quand OpenTaal la
   connaît (test/data/nl-words.txt.gz), qu'elle est un des noms par défaut ({naam}, {stad},
   {bedrijf}), ou qu'elle est une forme flamande voulue de test/data/flemish.tsv, avec sa raison.
   « collega’s » se lit « collega », et un mot à trait d'union est connu quand chacune de ses
   parties l'est.

     const spelling = require('./lib/spelling');
     spelling.tokens(s)          les formes d'un texte, en minuscules, jetons {…} ôtés
     spelling.stem(t)            la forme sans son « ’s »
     spelling.readFlemish(file)  les formes de flemish.tsv : une Map forme → raison
     const S = spelling.open(root, NL)   NL : l'application chargée (NL.content.DEFAULTS)
     S.forms                     les formes d'OpenTaal (un Set)
     S.flemish                   les formes flamandes voulues (une Map forme → raison)
     S.known(t)                  vrai si la forme t est connue
     S.flemishOf(t)              la forme de flemish.tsv que t emploie, ou null

   flemish.tsv : des lignes de commentaire (« # … »), puis une ligne par forme, triée par unités de
   code, une fois chacune : la forme, une tabulation, la raison. readFlemish refuse le reste. */
const fs = require('fs'), path = require('path'), zlib = require('zlib');

const tokens = s => String(s || '').toLowerCase().replace(/\{[a-z]+\}/g, ' ').split(/[^a-zà-ÿ'’-]+/)
  .map(t => t.replace(/^[-'’]+|[-'’]+$/g, '')).filter(t => t.length > 1);
const stem = t => t.replace(/[’']s$/, '');                                // collega’s, auto’s, da’s

function readFlemish(file) {
  const out = new Map();
  let last = null;
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((l, i) => {
    if (!l || l[0] === '#') return;
    const cells = l.split('\t'), at = file + ':' + (i + 1) + ': ';
    if (cells.length !== 2 || !cells[0] || !cells[1].trim()) throw new Error(at + 'une ligne est une forme, une tabulation et sa raison');
    if (last !== null && !(last < cells[0])) throw new Error(at + '« ' + cells[0] + ' » est hors de l’ordre, ou deux fois : les formes sont triées, une fois chacune');
    out.set(cells[0], cells[1]);
    last = cells[0];
  });
  return out;
}

function open(root, NL) {
  const words = path.join(root, 'test', 'data', 'nl-words.txt.gz');
  if (!fs.existsSync(words)) throw new Error(words + ' est absent. Régénérer : node test/tools/build-wordlist.js');
  const forms = new Set(zlib.gunzipSync(fs.readFileSync(words)).toString('utf8').split('\n'));
  const flemish = readFlemish(path.join(root, 'test', 'data', 'flemish.tsv'));
  /* Le prénom, la commune et l'employeur par défaut ne sont pas du néerlandais. */
  const names = new Set(Object.keys(NL.content.DEFAULTS).map(k => NL.content.DEFAULTS[k].toLowerCase()));
  const flemishOf = t => (flemish.has(stem(t)) ? stem(t) : null);
  const known = t => forms.has(t) || names.has(t) || forms.has(stem(t)) || flemish.has(stem(t)) ||
    (t.indexOf('-') >= 0 && t.split('-').every(p => p.length < 2 || forms.has(p)));   // java-ontwikkelaar
  return { forms, flemish, known, flemishOf };
}

module.exports = { tokens, stem, readFlemish, open };
