/* Construit la table de genres que `test/dehet.js` consulte.

   On n'extrait que des FAITS — « brief est masculin », « kinderen est un
   pluriel » — et jamais une définition ni une phrase. Un fait n'est pas
   couvert par le droit d'auteur, donc la table n'impose aucune licence au
   dépôt. (Voir ATTRIBUTION.md.)

   Source : l'extraction lisible par machine du Wiktionnaire néerlandais.
     curl -o nl.jsonl https://kaikki.org/dictionary/Dutch/kaikki.org-dictionary-Dutch.jsonl
     node test/tools/build-dehet.js nl.jsonl

   Le fichier source fait 256 Mo et n'est PAS dans le dépôt : seule la table
   dérivée l'est, et elle ne se régénère que si on ajoute du vocabulaire que
   le test ne connaît pas encore. */
const fs = require('fs'), path = require('path'), readline = require('readline');

const src = process.argv[2];
if (!src) { console.log('usage: node test/tools/build-dehet.js <kaikki-dutch.jsonl>'); process.exit(1); }
const out = path.join(__dirname, '..', 'data', 'dehet.tsv');

/* noun -> Set('de' | 'het') ; un nom attesté dans les deux genres garde les deux. */
const gender = new Map();
const add = (w, g) => {
  if (!w || /[^a-zà-ÿ'’-]/i.test(w)) return;          // pas d'espaces, pas de chiffres
  const k = w.toLowerCase();
  const s = gender.get(k) || new Set();
  s.add(g);
  gender.set(k, s);
};

/* « n » = neutre (het) ; « m », « f », « mf », « c » = commun (de). */
const fromCode = c => (c === 'n' ? 'het' : (c === 'm' || c === 'f' || c === 'mf' || c === 'c') ? 'de' : null);
const fromTag = t => (t === 'neuter' ? 'het'
  : (t === 'masculine' || t === 'feminine' || t === 'common-gender') ? 'de' : null);

const rl = readline.createInterface({ input: fs.createReadStream(src), crlfDelay: Infinity });
let lines = 0;

rl.on('line', line => {
  if (!line) return;
  lines++;
  let o;
  try { o = JSON.parse(line); } catch (e) { return; }
  if (o.pos !== 'noun' || !o.word) return;

  const gs = new Set();
  (o.head_templates || []).forEach(h => {
    const a = h && h.args && h.args['1'];
    if (!a) return;
    String(a).split(/[^a-z]+/).forEach(tok => { const g = fromCode(tok); if (g) gs.add(g); });
  });
  (o.senses || []).forEach(s => (s.tags || []).forEach(t => { const g = fromTag(t); if (g) gs.add(g); }));
  if (!gs.size) return;

  gs.forEach(g => add(o.word, g));

  /* Un pluriel prend toujours « de », quel que soit le genre du singulier :
     het kind mais DE kinderen. Sans cette ligne le test crie au loup sur
     chaque pluriel du cours. */
  (o.forms || []).forEach(f => {
    if (f && f.tags && f.tags.includes('plural')) add(f.form, 'de');
    /* Un diminutif est toujours neutre : het broodje, het pintje. */
    if (f && f.tags && f.tags.includes('diminutive')) add(f.form, 'het');
  });
});

rl.on('close', () => {
  const rows = [...gender.entries()]
    .map(([w, s]) => [w, s.size > 1 ? 'both' : [...s][0]])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out,
    '# nom\tgenre — dérivé du Wiktionnaire néerlandais, faits seulement.\n' +
    '# Régénérer : node test/tools/build-dehet.js <kaikki-dutch.jsonl>\n' +
    rows.map(r => r[0] + '\t' + r[1]).join('\n') + '\n', 'utf8');
  const tally = rows.reduce((a, r) => { a[r[1]] = (a[r[1]] || 0) + 1; return a; }, {});
  console.log('lignes lues       ' + lines);
  console.log('noms dans la table ' + rows.length + '  ' + JSON.stringify(tally));
  console.log('écrit             ' + out);
});
