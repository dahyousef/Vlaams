/* Le kit de répartition, tools/content/ : le cours tel que les outils le lisent, l'empreinte
   d'une source, Split, Check et Merge, le rédacteur des tables et le cache des données
   épinglées. Le contrat est celui de docs/agents/plan-runs/design-sitting.md (« The fan-out
   form ») et du tableau des fichiers de batch-controller.md.
     node test/tools/fanout.js .
   Tout se joue dans une copie du dépôt (build.sh, src/, test/lib/, tools/), dans un dossier
   temporaire, avec un genre d'essai écrit ici : le dépôt n'est jamais écrit, et rien n'est
   téléchargé (le cache s'essaie sur un dossier et sur un serveur local).

   Ce que ce contrôle ne voit pas : si un vrai genre découpe bien son travail, et si ses
   règles sont les bonnes. Chaque genre a ses contrôles, dans sa propre suite. */
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), crypto = require('crypto');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const LIB = path.join(ROOT, 'tools', 'content', 'lib');
const kit = require(path.join(LIB, 'kit'));
const table = require(path.join(LIB, 'table'));
const cache = require(path.join(LIB, 'cache'));
const { course } = require(path.join(LIB, 'course'));
const browser = require('../lib/browser');

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };
const same = (got, want, m) => ok(JSON.stringify(got) === JSON.stringify(want), m + ' : ' + JSON.stringify(got) + ', attendu ' + JSON.stringify(want));
const throws = (f, re, m) => {
  let e = null;
  try { f(); } catch (x) { e = x; }
  ok(e && re.test(e.message), m + ' : ' + (e ? e.message : 'rien n\'est levé'));
};

/* La copie du dépôt. */
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'vlaams-fanout-'));
['build.sh', 'src', 'test/lib', 'tools'].forEach(p => fs.cpSync(path.join(ROOT, p), path.join(TMP, p), { recursive: true }));
const KINDS = path.join(TMP, 'tools', 'content', 'kinds');
fs.mkdirSync(KINDS, { recursive: true });
const kindFile = (name, text) => fs.writeFileSync(path.join(KINDS, name + '.js'), text);
const text = f => fs.readFileSync(f, 'utf8');
const put = (dir, file, v) => fs.writeFileSync(path.join(dir, file), typeof v === 'string' ? v : JSON.stringify(v, null, 2) + '\n');
/* Un outil du kit, lancé comme un agent le lance : ses lignes et son code de sortie. */
const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(TMP, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
  return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
};

/* Le genre d'essai : « mot » est le néerlandais de la source en capitales, « raison » est
   facultative, et une ligne dont la raison est « maître » va au mainteneur. Un verdict
   « keep » recopie le mot dans « echo ». Merge écrit « mot|raison » dans la table essai. */
kindFile('essai', `/* Le genre d'essai de test/tools/fanout.js. */
module.exports = {
  stamp: ['meaning', 'note'],
  fields: ['mot'],
  optional: ['raison'],
  verdictFields: ['echo'],
  tables: ['essai'],
  split: C => [
    { batch: 'een', rows: ['overleven:w1', 'overleven:w2', 'bakker:w22'].map(id => ({ id, nl: C.byId(id).nl })) },
    { batch: 'twee', rows: ['thuis:w24', 'thuis:w1'].map(id => ({ id, nl: C.byId(id).nl })) },
    { batch: 'leeg', rows: [] }
  ],
  check: (row, input) => row.mot === input.nl.toUpperCase() ? [] : ['mot is not ' + input.nl.toUpperCase()],
  forMaintainer: row => row.raison === 'maître' ? 'raison is maître' : '',
  checkVerdict: (v, row) => v.verdict === 'keep' && v.echo !== row.mot ? ['a keep echoes mot'] : [],
  merge: row => ({ essai: row.mot + '|' + (row.raison || '') }),
  write: taken => ['ok essai.txt ' + taken.length + ' rows']
};
`);

async function main() {
  console.log('KIT DE RÉPARTITION');

  /* ==================================================== 1. le cours des outils */
  const C = course(TMP);
  const B = browser.open({ root: TMP, seed: browser.SEED, skip: [browser.APP] });
  await B.NL.state.open();
  B.NL.content.refresh();
  const items = B.NL.content.allItems().filter(it => it.kind === 'word' || it.kind === 'phrase');
  same(C.sources.map(s => s.id), items.map(it => it.id), 'les sources sont les mots et les phrases que build() forme, dans son ordre');
  same(C.sources.map(s => s.copies), items.map(it => it.aliases || []), 'les copies d\'une source sont les alias de son élément');
  same(C.byId('bakker:w22').copies, ['dedag:w4'], 'meenemen, listé deux fois, a une copie');
  ok(C.byId('dedag:w4') === undefined, 'une copie n\'est pas une source');
  same(C.byId('ikengij:p4').nl, 'Ik werk bij {bedrijf}.', 'le néerlandais d\'une source garde ses jetons');
  ok(C.sources.every(s => s.kind === 'word' || s.kind === 'phrase'), 'un modèle n\'est pas une source');
  same(C.byId('overleven:w0').be, 'hey, salut', 'une source garde les champs de sa liste');
  const LEX = path.join(TMP, 'src', 'content', 'lexicon.a1.js'), lexicon = text(LEX);
  const edit = (from, to) => {
    ok(lexicon.indexOf(from) >= 0, 'lexicon.a1.js n\'a plus « ' + from + ' » : l\'essai est à refaire');
    fs.writeFileSync(LEX, lexicon.replace(from, to));
  };
  edit('P(\'Kunt u wat trager spreken, alstublieft?\'', 'P(\'dag\'');
  throws(() => course(TMP), /^overleven:p2 and overleven:w2 share the Dutch « dag »: a table keyed by it could not tell them apart$/,
    'un mot et une phrase au même néerlandais sont refusés');
  fs.writeFileSync(LEX, lexicon);
  console.log('  cours          ' + C.sources.length + ' sources, ' + C.sources.filter(s => s.copies.length).length + ' avec des copies');

  /* ==================================================== 2. l'empreinte */
  const essai = kit.loadKind(TMP, 'essai');
  const dag = C.byId('overleven:w2');
  const st = src => kit.stamp(essai, src, C.NL);
  const as = more => Object.assign({}, dag, more);
  same(st({ nl: 'dag', fr: 'salut', en: 'hi / bye', note: { fr: 'Une note.', en: 'A note.' } }), 'd713a3d0',
    'l\'empreinte ne change pas de calcul (sha1 du JSON de [nl, chaque champ lu], 8 hex) : un autre calcul rendrait périmé chaque lot déjà coupé');
  same(st(as({})), st(dag), 'la même source, la même empreinte');
  ok(st(as({ nl: 'Dag' })) !== st(dag), 'le néerlandais est toujours dans l\'empreinte');
  ok(st(as({ note: { fr: 'autre', en: dag.note.en } })) !== st(dag), 'un champ que le genre nomme la change');
  ok(st(as({ fr: 'bonjour' })) !== st(dag), '« meaning » lit le sens');
  same(st(as({ art: 'de', be: 'dag' })), st(dag), 'un champ que le genre ne nomme pas ne la change pas');
  same(st(as({ note: { fr: 'pareil', en: 'pareil' } })), st(as({ note: 'pareil' })), 'une note écrite en paire, lue pareil, garde son empreinte');
  same(st(as({ note: undefined })), st(as({ note: null })), 'une note absente se lit null');
  const byUnit = Object.assign({}, essai, { stamp: [s => s.unit] });
  ok(kit.stamp(byUnit, dag, C.NL) !== kit.stamp(byUnit, as({ unit: 'thuis' }), C.NL), 'un champ d\'empreinte peut être une fonction de la source');

  kindFile('casse', 'module.exports = { stamp: [], fields: [\'id\'], tables: [], split: () => [], check: () => [], merge: () => ({}) };\n');
  throws(() => kit.loadKind(TMP, 'casse'), /^kind casse: id is the kit's own field$/, 'un genre ne prend pas un champ du kit');
  kindFile('nu', 'module.exports = { stamp: [], fields: [\'mot\'], tables: [], split: () => [], check: () => [] };\n');
  throws(() => kit.loadKind(TMP, 'nu'), /^kind nu: merge is not a function$/, 'un genre déclare merge');
  throws(() => kit.loadKind(TMP, 'inconnu'), /^no kind module tools\/content\/kinds\/inconnu\.js$/, 'un genre sans module est refusé');

  /* ==================================================== 3. Split */
  const KIND = path.join(TMP, 'drafts', 'essai'), EEN = path.join(KIND, 'een'), TWEE = path.join(KIND, 'twee');
  same(run('split.js', [TMP, KIND]), { code: 0, lines: ['een 3', 'twee 2'] }, 'Split coupe en lots et dit leur taille ; un lot vide n\'est pas écrit');
  same(text(path.join(KIND, 'split.txt')), 'een 3\ntwee 2\n', 'split.txt liste les lots écrits');
  ok(!fs.existsSync(path.join(KIND, 'leeg')), 'le lot vide n\'a pas de dossier');
  const inputEen = JSON.parse(text(path.join(EEN, 'input.json'))), inputTwee = JSON.parse(text(path.join(TWEE, 'input.json')));
  same(inputEen[0], { id: 'overleven:w1', stamp: st(C.byId('overleven:w1')), copies: [], nl: 'goeiedag' },
    'une ligne d\'entrée : id, empreinte et copies, puis ce que le genre y met');
  same(inputEen[2].copies, ['dedag:w4'], 'une ligne d\'entrée porte les copies de sa source');
  same(inputTwee.map(r => r.id), ['thuis:w24', 'thuis:w1'], 'les lignes d\'un lot suivent l\'ordre que le genre donne');
  const S = id => inputEen.concat(inputTwee).find(r => r.id === id).stamp;
  const kept = text(path.join(EEN, 'input.json'));
  put(EEN, 'input.json', kept + ' ');
  same(run('split.js', [TMP, KIND]), { code: 0, lines: ['een 3', 'twee 2'] }, 'un genre déjà coupé redit ses lots');
  same(text(path.join(EEN, 'input.json')), kept + ' ', 'un genre déjà coupé n\'est pas recoupé');
  put(EEN, 'input.json', kept);

  kindFile('mauvais', `module.exports = {
  stamp: [], fields: ['mot'], tables: [], check: () => [], merge: () => ({}),
  split: () => [
    { batch: 'Un', rows: [{ id: 'dedag:w4' }, { id: 'overleven:w1' }] },
    { batch: 'deux', rows: [{ id: 'overleven:w1' }, { id: 'werkbasis:p0', stamp: 'x' }, { id: 'g-present' }] }
  ]
};
`);
  const MAUVAIS = path.join(TMP, 'drafts', 'mauvais');
  same(run('split.js', [TMP, MAUVAIS]), { code: 1, lines: [
    'fail mauvais -: batch name « Un » is not a fresh name in lowercase letters, digits and dashes',
    'fail mauvais dedag:w4: not an item (a copy, a pattern or an unknown id)',
    'fail mauvais overleven:w1: in batch Un and in batch deux',
    'fail mauvais werkbasis:p0: not an item (a copy, a pattern or an unknown id)',
    'fail mauvais werkbasis:p0: stamp and copies are the kit\'s to write',
    'fail mauvais g-present: not an item (a copy, a pattern or an unknown id)'
  ] }, 'Split refuse un nom de lot, une copie, un id deux fois, une empreinte écrite par le genre et un modèle');
  ok(!fs.existsSync(MAUVAIS), 'un Split refusé n\'écrit rien');
  kindFile('jette', 'module.exports = { stamp: [], fields: [\'mot\'], tables: [], check: () => [], merge: () => ({}), split: () => { throw new Error(\'boum\'); } };\n');
  same(run('split.js', [TMP, path.join(TMP, 'drafts', 'jette')]), { code: 1, lines: ['fail jette -: the kind\'s split threw: boum'] }, 'un genre qui lève est nommé');
  kindFile('jette', 'module.exports = { stamp: [], fields: [\'mot\'], tables: [], check: () => [], merge: () => ({}), split: () => [{ batch: \'een\', rows: [\'dag\'] }] };\n');
  same(run('split.js', [TMP, path.join(TMP, 'drafts', 'jette')]), { code: 1, lines: ['fail jette -: the kind\'s split returns a list of { batch, rows }, each row an object with its id'] },
    'un genre qui rend autre chose que des lots est nommé');
  same(run('split.js', [TMP, path.join(TMP, 'drafts', 'inconnu')]), { code: 1, lines: ['fail inconnu -: no kind module tools/content/kinds/inconnu.js'] },
    'un dossier sans genre est nommé');
  console.log('  Split          ' + inputEen.length + ' + ' + inputTwee.length + ' lignes, refus et reprise');

  /* ==================================================== 4. Check */
  const check = dir => kit.check(TMP, dir).lines;
  const only = (dir, file) => check(dir).filter(l => l.indexOf(' ' + file + ' ') >= 0);
  same(check(EEN), ['ok input.json 3 rows'], 'un lot qui n\'a que son entrée passe');

  const draftEen = [
    { id: 'overleven:w1', stamp: S('overleven:w1'), mot: 'GOEIEDAG' },
    { id: 'overleven:w2', stamp: S('overleven:w2'), mot: 'DAG', unsure: 'dag, or de dag?' },
    { id: 'bakker:w22', stamp: S('bakker:w22'), mot: 'MEENEMEN', raison: 'maître' }
  ];
  put(EEN, 'draft.json', [draftEen[1], draftEen[0], draftEen[2]]);
  same(only(EEN, 'draft.json'), ['fail draft.json -: entries are not in the input\'s order'], 'les lignes suivent l\'ordre de l\'entrée');
  put(EEN, 'draft.json', [draftEen[0], draftEen[0], { id: 'thuis:w1', stamp: S('thuis:w1'), mot: 'DE STRAAT' }]);
  same(only(EEN, 'draft.json'), [
    'fail draft.json overleven:w1: twice',
    'fail draft.json thuis:w1: not an entry this file holds',
    'fail draft.json overleven:w2: missing',
    'fail draft.json bakker:w22: missing'
  ], 'une ligne en double, une ligne d\'un autre lot et des lignes manquantes sont nommées');
  put(EEN, 'draft.json', [
    Object.assign({}, draftEen[0], { stamp: '00000000' }),
    { id: 'overleven:w2', stamp: S('overleven:w2'), unsure: 'two\nlines', autre: 1 },
    Object.assign({}, draftEen[2], { mot: 'MEE' })
  ]);
  same(only(EEN, 'draft.json'), [
    'fail draft.json overleven:w1: stamp 00000000, input has ' + S('overleven:w1'),
    'fail draft.json overleven:w2: missing field mot',
    'fail draft.json overleven:w2: unknown field autre',
    'fail draft.json overleven:w2: unsure is a reason on one line',
    'fail draft.json bakker:w22: mot is not MEENEMEN'
  ], 'une ligne : son empreinte, ses champs, « unsure » sur une ligne, puis les règles du genre');
  put(EEN, 'draft.json', '[{');
  ok(/^fail draft\.json -: not JSON \(/.test(only(EEN, 'draft.json')[0]), 'un fichier qui n\'est pas du JSON est nommé');
  put(EEN, 'draft.json', {});
  same(only(EEN, 'draft.json'), ['fail draft.json -: not a JSON array'], 'un fichier est un tableau');
  put(EEN, 'draft.json', draftEen);

  put(EEN, 'review.json', [
    { id: 'overleven:w1', verdict: 'keep' },
    { id: 'overleven:w2', verdict: 'for maintainer: why not' },
    { id: 'bakker:w22', verdict: 'keep', echo: 'MEENEMEN', note: 'x' }
  ]);
  same(only(EEN, 'review.json'), [
    'fail review.json overleven:w1: a keep echoes mot',
    'fail review.json overleven:w2: « for maintainer » on a row the format does not send to the maintainer',
    'fail review.json bakker:w22: unknown field note',
    'fail review.json bakker:w22: the format sends this row to the maintainer (raison is maître): its verdict is « for maintainer: <reason> »'
  ], 'un verdict : ses champs, « for maintainer » sur exactement les lignes du format, et les règles du genre');
  put(EEN, 'review.json', [
    { id: 'overleven:w1', verdict: 'ok' },
    { id: 'overleven:w2', verdict: 'dispute: ' },
    { id: 'bakker:w22', verdict: 'for maintainer: two\nlines' }
  ]);
  same(only(EEN, 'review.json'), ['overleven:w1', 'overleven:w2', 'bakker:w22'].map(id =>
    'fail review.json ' + id + ': verdict is « keep », « dispute: <reason> » or « for maintainer: <reason> », on one line'),
  'un verdict est keep, ou une dispute ou un renvoi avec sa raison, sur une ligne');
  put(EEN, 'review.json', [
    { id: 'overleven:w1', verdict: 'keep', echo: 'GOEIEDAG' },
    { id: 'overleven:w2', verdict: 'dispute: « dag » is also the day' },
    { id: 'bakker:w22', verdict: 'for maintainer: raison is maître' }
  ]);

  put(EEN, 'retry.json', [{ id: 'overleven:w1', stamp: S('overleven:w1'), mot: 'GOEIEDAG' }]);
  same(only(EEN, 'retry.json'), ['fail retry.json overleven:w1: not an entry this file holds', 'fail retry.json overleven:w2: missing'],
    'une reprise tient les lignes disputées, et elles seules');
  put(EEN, 'retry.json', [{ id: 'overleven:w2', stamp: S('overleven:w2'), mot: 'DAG', raison: 'reprise' }]);
  put(EEN, 'retry-review.json', [{ id: 'overleven:w2', verdict: 'keep', echo: 'DAG' }]);

  const DISPUTES = '## bakker:w22\nSource: meenemen\nRow: MEENEMEN, raison maître\nFirst reader: for maintainer: raison is maître\nSecond reader: -\nYour ruling:\n';
  put(EEN, 'disputes.md', '# een\n');
  same(only(EEN, 'disputes.md'), ['fail disputes.md bakker:w22: no section, and the row is for the maintainer'], 'chaque ligne pour le mainteneur a sa section');
  put(EEN, 'disputes.md', DISPUTES.replace('Row: ', 'Rij: ') + '## overleven:w1\nSource: goeiedag\nRow: GOEIEDAG\nFirst reader: keep\n');
  same(only(EEN, 'disputes.md'), [
    'fail disputes.md bakker:w22: no « Row: » line',
    'fail disputes.md overleven:w1: a section for a row that is not for the maintainer'
  ], 'une section a ses lignes, et seules les lignes pour le mainteneur ont une section');
  put(EEN, 'disputes.md', DISPUTES);

  const change = { id: 'bakker:w22', ruling: 'change', words: 'keep it, and say why', confirmed: true, date: '2026-10-22' };
  put(EEN, 'rulings.json', []);
  same(only(EEN, 'rulings.json'), ['fail rulings.json bakker:w22: no ruling'], 'chaque section a sa décision');
  put(EEN, 'rulings.json', [{ id: 'bakker:w22', ruling: 'keep', words: null, confirmed: false, date: '22/10/2026', extra: 1 }]);
  same(only(EEN, 'rulings.json'), [
    'fail rulings.json bakker:w22: unknown field extra',
    'fail rulings.json bakker:w22: a keep ruling is confirmed: true',
    'fail rulings.json bakker:w22: date is YYYY-MM-DD'
  ], 'une décision : ses champs, sa confirmation et sa date');
  put(EEN, 'rulings.json', [Object.assign({}, change, { words: ' ', confirmed: false }), { id: 'overleven:w1', ruling: 'drop', words: null, confirmed: true, date: '2026-10-22' }]);
  same(only(EEN, 'rulings.json'), [
    'fail rulings.json bakker:w22: a change carries the maintainer\'s words',
    'fail rulings.json overleven:w1: no section in disputes.md'
  ], 'un changement porte les mots du mainteneur, et une décision a sa section');
  put(EEN, 'rulings.json', [change]);
  put(EEN, 'change.json', [{ id: 'bakker:w22', stamp: S('bakker:w22'), mot: 'MEENEMEN', raison: 'changé' }]);

  const GOOD_EEN = [
    'ok input.json 3 rows',
    'ok draft.json 3 rows',
    'ok review.json 1 keep, 1 dispute, 1 for maintainer',
    'ok retry.json 1 rows',
    'ok retry-review.json 1 keep, 0 dispute',
    'ok disputes.md 1 rows',
    'ok rulings.json 1 rows',
    'ok change.json 1 rows'
  ];
  same(run('check.js', [EEN]), { code: 0, lines: GOOD_EEN }, 'un lot complet passe, fichier par fichier');
  fs.renameSync(path.join(EEN, 'review.json'), path.join(EEN, 'review.json.old'));
  same(run('check.js', [EEN]), { code: 1, lines: [
    'ok input.json 3 rows',
    'ok draft.json 3 rows',
    'fail retry.json -: review.json missing or failing',
    'fail retry-review.json -: retry.json missing or failing',
    'fail disputes.md -: review.json missing or failing',
    'fail rulings.json -: disputes.md missing or failing',
    'fail change.json -: rulings.json missing or failing'
  ] }, 'un fichier dont le précédent manque ou échoue n\'est pas lu');
  fs.renameSync(path.join(EEN, 'review.json.old'), path.join(EEN, 'review.json'));
  fs.renameSync(path.join(EEN, 'input.json'), path.join(EEN, 'input.json.old'));
  same(run('check.js', [EEN]), { code: 1, lines: ['fail input.json -: missing'] }, 'un lot sans entrée est refusé');
  fs.renameSync(path.join(EEN, 'input.json.old'), path.join(EEN, 'input.json'));

  put(TWEE, 'draft.json', [
    { id: 'thuis:w24', stamp: S('thuis:w24'), mot: 'RUSTIG', raison: 'maître' },
    { id: 'thuis:w1', stamp: S('thuis:w1'), mot: 'DE STRAAT' }
  ]);
  put(TWEE, 'review.json', [{ id: 'thuis:w24', verdict: 'for maintainer: raison is maître' }, { id: 'thuis:w1', verdict: 'dispute: the article' }]);
  put(TWEE, 'retry.json', [{ id: 'thuis:w1', stamp: S('thuis:w1'), mot: 'DE STRAAT', raison: 'reprise' }]);
  put(TWEE, 'retry-review.json', [{ id: 'thuis:w1', verdict: 'dispute: still the article' }]);
  put(TWEE, 'disputes.md', ['thuis:w24', 'thuis:w1'].map(id => '## ' + id + '\nSource: -\nRow: -\nFirst reader: -\nSecond reader: -\nYour ruling:\n').join('\n'));
  put(TWEE, 'rulings.json', [
    { id: 'thuis:w24', ruling: 'drop', words: null, confirmed: true, date: '2026-10-22' },
    { id: 'thuis:w1', ruling: 'keep', words: 'the retry is right', confirmed: true, date: '2026-10-22' }
  ]);
  same(check(TWEE), [
    'ok input.json 2 rows',
    'ok draft.json 2 rows',
    'ok review.json 0 keep, 1 dispute, 1 for maintainer',
    'ok retry.json 1 rows',
    'ok retry-review.json 0 keep, 1 dispute',
    'ok disputes.md 2 rows',
    'ok rulings.json 2 rows'
  ], 'une seconde dispute va au mainteneur, comme un renvoi');
  console.log('  Check          ' + GOOD_EEN.length + ' fichiers, chacun avec ses refus');

  /* ==================================================== 5. ce que Merge prend */
  const D = { id: 'x', mot: 'D' }, R = { id: 'x', mot: 'R' }, K = { id: 'x', mot: 'K' };
  const v = verdict => [{ id: 'x', verdict }];
  const ruled = (ruling, confirmed) => [{ id: 'x', ruling, words: 'w', confirmed, date: '2026-10-22' }];
  const disputed = { 'draft.json': [D], 'review.json': v('dispute: a'), 'retry.json': [R] };
  const sent = { 'draft.json': [D], 'review.json': v('for maintainer: a') };
  same(kit.settle('x', { 'draft.json': [D], 'review.json': v('keep') }), { row: D, from: 'draft' }, 'le brouillon que la relecture garde');
  same(kit.settle('x', Object.assign({ 'retry-review.json': v('keep') }, disputed)), { row: R, from: 'retry' }, 'la reprise que la seconde relecture garde');
  same(kit.settle('x', Object.assign({ 'retry-review.json': v('dispute: b'), 'rulings.json': ruled('keep', true) }, disputed)), { row: R, from: 'retry' },
    'keep du mainteneur : la reprise, s\'il y en a une');
  same(kit.settle('x', Object.assign({ 'rulings.json': ruled('keep', true) }, sent)), { row: D, from: 'draft' }, 'keep du mainteneur : sinon le brouillon');
  same(kit.settle('x', Object.assign({ 'rulings.json': ruled('drop', true) }, sent)), { drop: true }, 'drop : rien');
  same(kit.settle('x', Object.assign({ 'rulings.json': ruled('change', true), 'change.json': [K] }, sent)), { row: K, from: 'change' }, 'change confirmé : la ligne de change.json');
  same(kit.settle('x', Object.assign({ 'rulings.json': ruled('change', false), 'change.json': [K] }, sent)), { why: 'change not confirmed' }, 'un changement non confirmé n\'est pas pris');
  same(kit.settle('x', Object.assign({ 'rulings.json': ruled('change', true) }, sent)), { why: 'change.json has no row' }, 'un changement sans ligne n\'est pas pris');
  same(kit.settle('x', {}), { why: 'no draft' }, 'sans brouillon');
  same(kit.settle('x', { 'draft.json': [D] }), { why: 'no review' }, 'sans relecture');
  same(kit.settle('x', { 'draft.json': [D], 'review.json': v('dispute: a') }), { why: 'disputed, no retry' }, 'disputé, sans reprise');
  same(kit.settle('x', disputed), { why: 'no second review' }, 'une reprise sans seconde relecture');
  same(kit.settle('x', sent), { why: 'no ruling' }, 'pour le mainteneur, sans décision');

  /* ==================================================== 6. Merge */
  const TABLE = path.join(TMP, 'src', 'content', 'essai.js');
  same(run('merge.js', [TMP, path.join(TMP, 'ailleurs', 'essai')]), { code: 1, lines: ['fail essai -: never split: run Split first'] }, 'Merge refuse un genre jamais coupé');
  fs.renameSync(path.join(TWEE, 'rulings.json'), path.join(TWEE, 'rulings.json.old'));
  same(run('merge.js', [TMP, KIND]), { code: 1, lines: ['fail essai thuis:w24: unsettled, no ruling', 'fail essai thuis:w1: unsettled, no ruling'] },
    'Merge refuse une ligne non réglée');
  fs.renameSync(path.join(TWEE, 'rulings.json.old'), path.join(TWEE, 'rulings.json'));
  const review = text(path.join(EEN, 'review.json'));
  put(EEN, 'review.json', review.replace('"verdict": "keep"', '"verdict": "kept"'));
  const refused = run('merge.js', [TMP, KIND]);
  ok(refused.code === 1 && refused.lines[0] === 'fail review.json overleven:w1: verdict is « keep », « dispute: <reason> » or « for maintainer: <reason> », on one line' &&
    refused.lines[refused.lines.length - 1] === 'fail essai -: batch een does not pass Check', 'Merge refuse un lot qui ne passe pas Check : ' + JSON.stringify(refused));
  put(EEN, 'review.json', review);
  same(run('merge.js', [TMP, KIND]), { code: 1, lines: ['fail essai -: no table file src/content/essai.js'] }, 'Merge refuse une table sans fichier');

  const HEAD = '/* La table d\'essai de test/tools/fanout.js. */\r\n';
  const before = HEAD + table.MARKER + '\r\nNL.content.byDutch[\'essai\'] = {\r\n  \'hallo\': \'avant\',\r\n  \'rustig\': \'avant\',\r\n};\r\n';
  fs.writeFileSync(TABLE, before);
  edit('À l’entrée comme à la sortie.', 'À l’entrée et à la sortie.');
  const now = st(course(TMP).byId('overleven:w2'));
  same(run('merge.js', [TMP, KIND]), { code: 1, lines: ['fail essai overleven:w2: stale, stamped ' + S('overleven:w2') + ' at Split, the source now stamps ' + now] },
    'Merge refuse une ligne dont la source a changé depuis Split');
  fs.writeFileSync(LEX, lexicon);
  same(text(TABLE), before, 'un Merge refusé n\'écrit rien');

  const MERGED = ['ok essai 4 taken, 1 dropped', 'ok essai.js 4 set, 0 removed', 'ok essai.txt 4 rows'];
  same(run('merge.js', [TMP, KIND]), { code: 0, lines: MERGED }, 'Merge dit ce qu\'il prend, ce qu\'il écrit, et ce que le genre écrit de plus');
  const after = HEAD + table.MARKER + '\r\nNL.content.byDutch[\'essai\'] = {\r\n' + [
    '  \'dag\': \'DAG|reprise\',',
    '  \'de straat\': \'DE STRAAT|reprise\',',
    '  \'goeiedag\': \'GOEIEDAG|\',',
    '  \'hallo\': \'avant\',',
    '  \'meenemen\': \'MEENEMEN|changé\',',
    '  \'rustig\': \'avant\','
  ].join('\r\n') + '\r\n};\r\n';
  same(text(TABLE), after, 'chaque ligne réglée est écrite sous le néerlandais de sa source ; une ligne écartée et une clé d\'ailleurs restent');
  same(run('merge.js', [TMP, KIND]), { code: 0, lines: MERGED }, 'Merge se relance');
  same(text(TABLE), after, 'relancé, Merge redonne les mêmes octets');

  kindFile('vide', 'module.exports = { stamp: [], fields: [\'mot\'], tables: [\'vide\'], split: () => [], check: () => [], merge: () => ({}) };\n');
  same(run('split.js', [TMP, path.join(TMP, 'drafts', 'vide')]), { code: 0, lines: [] }, 'un genre sans travail se coupe en rien');
  same(run('merge.js', [TMP, path.join(TMP, 'drafts', 'vide')]), { code: 0, lines: ['ok vide 0 taken, 0 dropped'] }, 'un genre sans travail se fond sans table');
  console.log('  Merge          4 prises, 1 écartée, refus et relance');

  /* ==================================================== 7. le rédacteur des tables */
  const LS = String.fromCharCode(0x2028), BS = '\\';
  same(table.literal('l\'eau\n\t\\\u0001' + LS), String.raw`'l\'eau\n\t\\\u0001` + BS + 'u2028\'', 'une chaîne s\'écrit entre apostrophes, échappée, U+2028 compris');
  same(table.literal({ fr: 'a', 'en-GB': null, n: 2, b: false, l: [1, 'x'], re: /a\/b/i, o: {} }),
    String.raw`{ fr: 'a', 'en-GB': null, n: 2, b: false, l: [1, 'x'], re: /a\/b/i, o: {} }`, 'un objet garde l\'ordre de ses clés');
  throws(() => table.literal(undefined), /^a table value holds undefined:/, 'undefined n\'est pas une valeur');
  throws(() => table.literal({ a: undefined }), /^a table value holds undefined at « a »:/, 'ni dans un objet');
  throws(() => table.literal(new Date(0)), /^a table value holds \[object Date\]:/, 'une date n\'est pas une valeur');
  throws(() => table.literal(NaN), /^a table value holds number:/, 'NaN n\'est pas une valeur');

  const ROND = path.join(TMP, 'src', 'content', 'rond.js');
  fs.writeFileSync(ROND, '/* rond */\n' + table.MARKER + '\nNL.content.byDutch[\'rond\'] = {\n};\n');
  const odd = { 'z': 'l\'eau\n\u0001' + LS, 'a b': { fr: 'x', en: null }, 'É': [1, true, /x+/g] };
  same(table.update(ROND, odd), { set: 3, removed: 0 }, 'update dit ce qu\'il pose');
  const back = table.load(ROND);
  same(Object.keys(back.entries), ['a b', 'z', 'É'], 'les clés sont triées par unités de code');
  same([back.entries.z, back.entries['a b'], String(back.entries['É'][2])], [odd.z, odd['a b'], '/x+/g'], 'une valeur écrite se relit telle quelle');
  same([back.head, back.eol, back.name], ['/* rond */\n', '\n', 'rond'], 'l\'en-tête et les fins de ligne LF sont gardés');
  same(table.update(ROND, { z: null, absent: null }), { set: 0, removed: 1 }, 'null ôte une clé, et une clé absente ne compte pas');
  same(table.serialize(table.load(TABLE)), text(TABLE), 'une table récrite sans changement redonne ses octets, en CRLF');
  fs.writeFileSync(ROND, '/* rond */\nNL.content.byDutch = {};\n');
  throws(() => table.load(ROND), /: no « NL\.content\.byDutch = NL\.content\.byDutch \|\| \{\}; » line$/, 'un fichier sans la ligne de table est refusé');
  fs.writeFileSync(ROND, table.MARKER + '\nNL.content.byDutch[\'rond\'] = {};\nNL.content.byDutch[\'autre\'] = {};\n');
  throws(() => table.load(ROND), /: sets byDutch\['rond'\], byDutch\['autre'\], and a table file sets byDutch\['rond'\] alone$/, 'un fichier tient une table');
  console.log('  tables         littéraux, tri, en-tête, fins de ligne');

  /* ==================================================== 8. le cache épinglé */
  const keys = Object.keys(cache.PINS);
  same(keys.length, 8, 'huit fichiers épinglés');
  keys.forEach(k => {
    const p = cache.PINS[k];
    ok(/^https:\/\//.test(p.url) && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Number.isInteger(p.bytes) && /^[0-9a-f]{64}$/.test(p.sha256),
      k + ' : une épingle a son adresse https, sa date, sa taille et son sha256');
  });
  same(cache.select(['kaikki', 'x'], cache.PINS), { keys: ['kaikki/nl.jsonl'], unknown: ['x'] }, 'un nom est une clé ou son préfixe');
  same(cache.select(['tatoeba'], cache.PINS).keys.length, 7, 'tatoeba désigne ses sept fichiers');

  const sha = s => crypto.createHash('sha256').update(s).digest('hex');
  const PIN = (url, body, more) => Object.assign({ url, date: '2026-10-22', bytes: Buffer.byteLength(body), sha256: sha(body) }, more);
  const SEED = path.join(TMP, 'seed');
  fs.mkdirSync(SEED);
  fs.writeFileSync(path.join(SEED, 'a.txt'), 'bonjour\n');
  fs.writeFileSync(path.join(SEED, 'b.txt'), 'pas pareil\n');
  const pins = { 't/a.txt': PIN('https://example.invalid/a.txt', 'bonjour\n'), 't/b.txt': PIN('https://example.invalid/b.txt', 'autre\n'), 't/c.txt': PIN('https://example.invalid/c.txt', 'c') };
  same(await cache.fetch(TMP, ['t'], { from: SEED, pins }), { ok: false, lines: [
    'ok t/a.txt 8 bytes, sha256 ' + sha('bonjour\n').slice(0, 12) + '…',
    'fail t/b.txt: sha256 ' + sha('pas pareil\n').slice(0, 12) + '…, pinned ' + sha('autre\n').slice(0, 12) + '… on 2026-10-22: the source changed, and the pin is to redo in a task',
    'fail t/c.txt: no c.txt in ' + SEED
  ] }, 'un fichier copié est vérifié contre son épingle');
  same(fs.readdirSync(path.join(TMP, '.cache', 't')), ['a.txt'], 'un fichier qui ne correspond pas est effacé');
  same(await cache.fetch(TMP, ['t/a.txt', 'zz'], { from: SEED, pins }), { ok: false, lines: ['fail zz: no such pin', 'ok t/a.txt (cached)'] },
    'un fichier déjà vérifié n\'est pas recopié, et un nom inconnu est nommé');
  same(cache.get(TMP, 't/a.txt', pins), path.join(TMP, '.cache', 't', 'a.txt'), 'get rend le chemin d\'un fichier en cache');
  throws(() => cache.get(TMP, 't/b.txt', pins), /^\.cache\/t\/b\.txt is missing: run node tools\/content\/fetch\.js \. t\/b\.txt$/, 'get dit la commande qui manque');

  /* Un serveur local : une redirection, un .bz2, un .tar.bz2 dont on prend un membre, et
     une adresse absente. Les archives sont faites ici, avec bzip2 et tar. */
  const WORK = path.join(TMP, 'archives');
  fs.mkdirSync(WORK);
  fs.writeFileSync(path.join(WORK, 'h.txt'), 'hallo\n');
  fs.writeFileSync(path.join(WORK, 'user.csv'), '1\tnld\n');
  [['bzip2', ['-k', 'h.txt']], ['tar', ['-cf', 'u.tar', 'user.csv']], ['bzip2', ['u.tar']]].forEach(c => {
    const r = spawnSync(c[0], c[1], { cwd: WORK, encoding: 'utf8' });
    ok(r.status === 0, c[0] + ' ' + c[1].join(' ') + ' : ' + (r.error ? r.error.code : r.stderr));
  });
  const server = http.createServer((req, res) => {
    if (req.url === '/r/h.txt.bz2') { res.writeHead(302, { location: '/f/h.txt.bz2' }); res.end(); return; }
    const m = /^\/f\/([\w.]+)$/.exec(req.url);
    if (m && fs.existsSync(path.join(WORK, m[1]))) { res.writeHead(200); res.end(fs.readFileSync(path.join(WORK, m[1]))); return; }
    res.writeHead(404);
    res.end();
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const base = 'http://127.0.0.1:' + server.address().port;
  const served = {
    'h/h.txt': PIN(base + '/r/h.txt.bz2', 'hallo\n'),
    'h/user.csv': PIN(base + '/f/u.tar.bz2', '1\tnld\n', { member: 'user.csv' }),
    'h/x.txt': PIN(base + '/f/x.txt.bz2', 'x')
  };
  const fetched = await cache.fetch(TMP, ['h'], { pins: served });
  server.close();
  same(fetched, { ok: false, lines: [
    'ok h/h.txt 6 bytes, sha256 ' + sha('hallo\n').slice(0, 12) + '…',
    'ok h/user.csv 6 bytes, sha256 ' + sha('1\tnld\n').slice(0, 12) + '…',
    'fail h/x.txt: HTTP 404'
  ] }, 'un téléchargement suit une redirection, se décompresse, et prend son membre dans un tar');
  same(fs.readdirSync(path.join(TMP, '.cache', 'h')).sort(), ['h.txt', 'user.csv'], 'aucun fichier partiel ne reste');
  same(run('fetch.js', [TMP, 'zz']), { code: 1, lines: ['fail zz: no such pin'] }, 'fetch.js nomme un fichier qui n\'est pas épinglé');
  same(run('fetch.js', []).code, 1, 'fetch.js sans dépôt dit son usage');
  ok(text(path.join(ROOT, '.gitignore')).split(/\r?\n/).indexOf('.cache/') >= 0, '.gitignore n\'ignore pas .cache/ : les données téléchargées entreraient dans le dépôt');
  console.log('  cache          dossier, serveur local, redirection, bzip2, tar');

  console.log('\n' + checks + ' contrôles, ' + (fails === 0 ? 'KIT CONFORME' : fails + ' ÉCHEC(S)'));
}

main().then(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  process.exit(fails ? 1 : 0);
}, e => {
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('CRASH ' + (e && e.stack || e));
  process.exit(1);
});
