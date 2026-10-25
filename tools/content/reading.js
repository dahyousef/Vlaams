/* L'outil de lecture : ce que le mainteneur lit, en Markdown, avec ce que les tables du cours
   tiennent à HEAD.
     node tools/content/reading.js <dépôt> <espace de travail>                  la liste du contrôle du contenu
     node tools/content/reading.js <dépôt> <espace de travail> --kind <genre>   chaque ligne d'un genre
     node tools/content/reading.js <dépôt> <espace de travail> --unsentenced    les mots sans phrase d'exemple
   N'écrit rien. Sort avec 1, et ses lignes « fail », quand un genre n'est pas lisible. */
const reading = require('./lib/reading');

const USAGE = 'usage: node tools/content/reading.js <repo> <WS> [--kind <kind> | --unsentenced]';
const [repo, ws, mode, name, more] = process.argv.slice(2);
const known = mode === undefined || mode === '--kind' || mode === '--unsentenced';
if (!repo || !ws || !known || (mode === '--kind') !== (name !== undefined) || more !== undefined) { console.log(USAGE); process.exit(1); }
try {
  const r = mode === '--kind' ? reading.every(repo, ws, name) : mode === '--unsentenced' ? reading.unsentenced(repo, ws) : reading.list(repo, ws);
  r.lines.forEach(l => console.log(l));
  process.exit(r.ok ? 0 : 1);
} catch (e) { console.log('fail reading -: ' + e.message); process.exit(1); }
