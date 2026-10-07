/* De ou het ? L'erreur la plus courante du matériel néerlandais, et celle que
   les six autres suites ne pouvaient pas voir : elles vérifient que le cours est
   COHÉRENT avec lui-même, pas qu'il a raison. Un passage manuel complet dans un
   vrai navigateur a laissé passer « het pistolet » pendant des semaines.

   Ici chaque nom du cours est confronté au Wiktionnaire néerlandais, via la
   table de faits `test/data/dehet.tsv` (voir test/tools/build-dehet.js).

   Un nom que la table ne connaît pas fait ÉCHOUER le test. C'est voulu : un
   ajout silencieusement non vérifié est exactement le trou qu'on vient de
   boucher. Soit on régénère la table, soit on inscrit le nom ci-dessous avec sa
   raison. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[2] || path.join(__dirname, '..');

/* Noms absents du Wiktionnaire, vérifiés à la main. La raison est obligatoire :
   sans elle, cette liste redevient l'endroit où l'on enterre les erreurs. */
const VERIFIED = {
  'nederlands':     ['het', 'nom de langue — toujours het : het Nederlands, het Frans'],
  'frans':          ['het', 'nom de langue — toujours het'],
  'koffiekoek':     ['de',  'belgicisme absent du Wiktionnaire ; de koffiekoek (Van Dale)'],
  'containerpark':  ['het', 'belgicisme ; composé de het park, qui impose le genre'],
  'match':          ['de',  'belgicisme pour wedstrijd ; de match']
};

/* ---------- la table de faits ---------- */
const TSV = path.join(__dirname, 'data', 'dehet.tsv');
if (!fs.existsSync(TSV)) {
  console.log('FAIL: ' + TSV + ' est absent. Régénérer : node test/tools/build-dehet.js <kaikki-dutch.jsonl>');
  process.exit(1);
}
const table = new Map();
fs.readFileSync(TSV, 'utf8').split('\n').forEach(l => {
  if (!l || l[0] === '#') return;
  const [w, g] = l.split('\t');
  if (w && g) table.set(w, g.trim());
});

/* ---------- le cours ---------- */
const ctx = { NL: { util: {}, state: {} }, console, JSON, Math, Date, Object, Array, String, Number, RegExp, Map, Set };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
['src/content/lexicon.a1.js', 'src/content/lexicon.a1b.js', 'src/content/grammar.js', 'src/content/examples.js']
  .forEach(f => {
    try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); }
    catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); process.exit(1); }
  });
const units = (ctx.NL.content && ctx.NL.content.units) || [];
if (!units.length) { console.log('FAIL: aucun contenu chargé'); process.exit(1); }

let fails = 0;
const fail = msg => { console.log('  FAIL: ' + msg); fails++; };
const bare = s => String(s || '').replace(/^(de|het|een)\s+/i, '').trim().toLowerCase();

console.log('DE / HET   (' + table.size + ' noms dans la table de référence)');

/* ---------- 1. l'article déclaré par chaque mot ---------- */
let checked = 0, both = 0, hand = 0;
units.forEach(u => (u.words || []).forEach((w, i) => {
  if (!w.art) return;
  const noun = bare(w.nl);
  const where = u.id + ':w' + i;
  if (!noun || noun.indexOf(' ') >= 0) return;        // un groupe nominal porte le genre sur sa tête
  const art = w.art.toLowerCase();
  checked++;

  const known = table.get(noun);
  if (known) {
    if (known === 'both') { both++; return; }         // les deux genres attestés : le cours tranche
    if (known !== art) fail('« ' + art + ' ' + noun +' » — le Wiktionnaire dit « ' + known + ' »   [' + where + ']');
    return;
  }
  const v = VERIFIED[noun];
  if (!v) {
    fail('« ' + noun + ' » est inconnu de la table. Régénérer la table, ou l\'inscrire dans VERIFIED avec sa raison.   [' + where + ']');
    return;
  }
  hand++;
  if (v[0] !== art) fail('« ' + art + ' ' + noun + ' » — vérifié à la main comme « ' + v[0] + ' » (' + v[1] + ')   [' + where + ']');
}));

/* ---------- 2. l'article à l'intérieur des phrases d'exemple ---------- */
/* Un mot peut déclarer « de » et son exemple dire « het » : c'est la phrase que
   la personne lit et retient, donc elle compte autant que la fiche.

   On ne contrôle QUE l'article du mot drillé, pas tous les articles de la
   phrase. Un balayage large est irréalisable sans analyse grammaticale : « het »
   est aussi le pronom impersonnel (« is het druk », « kost het zes euro ») et
   un infinitif substantivé est neutre quand son pluriel est en « de » (« van
   het werken »). Les trois seuls signalements d'un tel balayage étaient trois
   faux positifs. Ici le nom ET son genre sont connus, donc le verdict est sûr. */
let inSentence = 0;
units.forEach(u => (u.words || []).forEach((w, i) => {
  if (!w.art) return;
  const noun = bare(w.nl);
  if (!noun || noun.indexOf(' ') >= 0) return;
  const art = w.art.toLowerCase();
  (w.drills || []).forEach((d, j) => {
    const toks = String(d.nl || '').toLowerCase().split(/[^a-zà-ÿ'’-]+/);
    toks.forEach((tok, k) => {
      if ((tok !== 'de' && tok !== 'het') || toks[k + 1] !== noun) return;
      inSentence++;
      if (tok !== art) {
        fail('phrase : « ' + tok + ' ' + noun + ' » contredit l\'article « ' + art + ' » de la fiche   [' +
          u.id + ':w' + i + ' ex' + j + '] ' + d.nl);
      }
    });
  });
}));

/* ---------- 3. la liste manuelle ne doit pas pourrir ---------- */
/* Un nom entré à la main puis retiré du cours, ou entre-temps arrivé dans la
   table, laisse une exception qui ne protège plus rien. */
const usedByCourse = new Set();
units.forEach(u => (u.words || []).forEach(w => { if (w.art) usedByCourse.add(bare(w.nl)); }));
Object.keys(VERIFIED).forEach(n => {
  if (!usedByCourse.has(n)) console.log('  (note) VERIFIED contient « ' + n +' », absent des mots du cours');
  else if (table.has(n)) fail('« ' + n + ' » est maintenant dans la table : retirer son exception de VERIFIED');
});

console.log('  articles vérifiés   ' + checked + '  (dont ' + both + ' à double genre, ' + hand + ' vérifiés à la main)');
console.log('  articles en phrase  ' + inSentence);
console.log('\n' + (fails === 0 ? 'DE/HET : TOUT EST CONFORME' : fails + ' ERREUR(S) D\'ARTICLE'));
process.exit(fails ? 1 : 0);
