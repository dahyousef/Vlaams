/* Les données externes épinglées, dans .cache/ (tools/content/lib/cache.js, PINS).
     node tools/content/fetch.js <dépôt> [<nom>…] [--from <dossier>]
   Sans nom, tous les fichiers épinglés ; un nom est une clé (« kaikki/nl.jsonl ») ou son
   préfixe (« tatoeba »). --from copie les fichiers d'un dossier où ils sont déjà, au lieu de
   les télécharger ; chacun est vérifié de la même façon. */
const cache = require('./lib/cache');

const args = process.argv.slice(2);
const at = args.indexOf('--from');
const from = at >= 0 ? args[at + 1] : null;
const rest = at >= 0 ? args.slice(0, at).concat(args.slice(at + 2)) : args;
if (!rest.length || (at >= 0 && !from)) { console.log('usage: node tools/content/fetch.js <repo> [<name>...] [--from <folder>]'); process.exit(1); }
cache.fetch(rest[0], rest.slice(1), { from }).then(r => {
  r.lines.forEach(l => console.log(l));
  process.exit(r.ok ? 0 : 1);
}, e => { console.log('fail - : ' + e.message); process.exit(1); });
