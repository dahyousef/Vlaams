/* Check : vérifie chaque fichier d'un lot, sans rien écrire.
     node tools/content/check.js <dossier du lot>
   Le dépôt est celui qui contient ce script ; le genre est le nom du dossier parent du lot.
   Imprime « ok <fichier> … » ou « fail <fichier> <id>: <pourquoi> » par fichier, et sort
   avec 1 s'il y a un « fail ». */
const path = require('path');
const kit = require('./lib/kit');

const batchDir = process.argv[2];
if (!batchDir) { console.log('usage: node tools/content/check.js <batch folder>'); process.exit(1); }
try {
  const r = kit.check(path.resolve(__dirname, '..', '..'), path.resolve(batchDir));
  r.lines.forEach(l => console.log(l));
  process.exit(r.ok ? 0 : 1);
} catch (e) { console.log('fail ' + path.basename(batchDir) + ' -: ' + e.message); process.exit(1); }
