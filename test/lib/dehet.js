/* La table de faits de / het, lue une fois pour toutes : test/data/dehet.tsv.
   Utilisée par test/dehet.js et par le genre words du kit de contenu.

     load(root)   la Map mot (en minuscules) -> 'de' | 'het' | 'both' ; le fichier doit exister */
const fs = require('fs'), path = require('path');

function load(root) {
  const table = new Map();
  fs.readFileSync(path.join(root, 'test', 'data', 'dehet.tsv'), 'utf8').split('\n').forEach(l => {
    if (!l || l[0] === '#') return;
    const [w, g] = l.split('\t');
    if (w && g) table.set(w, g.trim());
  });
  return table;
}

module.exports = { load };
