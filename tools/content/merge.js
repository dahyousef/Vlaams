/* Merge : écrit les lignes réglées d'un genre dans ses tables (src/content/<table>.js).
     node tools/content/merge.js <dépôt> <dossier du genre>
   Refuse sans rien écrire un genre jamais coupé, un lot qui ne passe pas Check, une ligne
   non réglée, une ligne dont la source a changé depuis Split et une valeur qu'une table ne
   sait pas écrire. */
const path = require('path');
const kit = require('./lib/kit');

const [repo, kindDir] = process.argv.slice(2);
if (!repo || !kindDir) { console.log('usage: node tools/content/merge.js <repo> <kind folder>'); process.exit(1); }
try {
  const r = kit.merge(repo, path.resolve(kindDir));
  r.lines.forEach(l => console.log(l));
  process.exit(r.ok ? 0 : 1);
} catch (e) { console.log('fail ' + path.basename(kindDir) + ' -: ' + e.message); process.exit(1); }
