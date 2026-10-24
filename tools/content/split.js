/* Split : coupe la source d'un genre en lots, une fois.
     node tools/content/split.js <dépôt> <dossier du genre>
   Le genre est le nom du dossier (…/drafts/flemish → tools/content/kinds/flemish.js).
   Imprime « <lot> <lignes> » par lot ; sur un dossier déjà coupé, n'écrit rien et imprime
   ses lignes. */
const path = require('path');
const kit = require('./lib/kit');

const [repo, kindDir] = process.argv.slice(2);
if (!repo || !kindDir) { console.log('usage: node tools/content/split.js <repo> <kind folder>'); process.exit(1); }
try {
  const r = kit.split(repo, path.resolve(kindDir));
  r.lines.forEach(l => console.log(l));
  process.exit(r.ok ? 0 : 1);
} catch (e) { console.log('fail ' + path.basename(kindDir) + ' -: ' + e.message); process.exit(1); }
