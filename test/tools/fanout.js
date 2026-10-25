/* Le kit de répartition, tools/content/ : le cours tel que les outils le lisent, l'empreinte
   d'une source, Split, Check et Merge, le rédacteur des tables, le cache des données
   épinglées et l'outil de lecture. Le contrat est celui de
   docs/agents/plan-runs/design-sitting.md (« The fan-out form ») et du tableau des fichiers de
   batch-controller.md.
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
  same([C.byId('overleven:w0').art, C.byId('overleven:w0').be], [null, 'hey, salut'], 'une source garde les champs de sa liste, et prend ceux de ses tables');
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
  kindFile('sans', 'module.exports = { stamp: [], fields: [\'mot\'], tables: [], check: () => [], merge: () => ({}), split: () => [{ rows: [{ id: \'overleven:w1\' }] }] };\n');
  same(run('split.js', [TMP, path.join(TMP, 'drafts', 'sans')]), { code: 1, lines: ['fail sans -: the kind\'s split returns a list of { batch, rows }, each row an object with its id'] },
    'un lot sans nom est refusé');
  ok(!fs.existsSync(path.join(TMP, 'drafts', 'sans')), 'un lot sans nom n\'écrit aucun dossier');
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
  /* La note de dag vit dans src/content/notes.js : la changer change l'empreinte de dag. Elle se
     change par la table, pas par son texte, que le Merge des explications récrit. */
  const NOTES = path.join(TMP, 'src', 'content', 'notes.js'), notes = text(NOTES), note = table.load(NOTES).entries.dag;
  ok(!!note, 'notes.js n\'a plus de note pour dag : l\'essai est à refaire');
  table.update(NOTES, { dag: Object.assign({}, note, { fr: (note ? note.fr : '') + ' Autrement dit.' }) });
  const now = st(course(TMP).byId('overleven:w2'));
  same(run('merge.js', [TMP, KIND]), { code: 1, lines: ['fail essai overleven:w2: stale, stamped ' + S('overleven:w2') + ' at Split, the source now stamps ' + now] },
    'Merge refuse une ligne dont la source a changé depuis Split');
  fs.writeFileSync(NOTES, notes);
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

  /* Une seconde table illisible : rien n'est écrit, pas même la première. */
  const DEUX = path.join(TMP, 'drafts', 'deux');
  fs.cpSync(KIND, DEUX, { recursive: true });
  kindFile('deux', text(path.join(KINDS, 'essai.js')).replace('tables: [\'essai\']', 'tables: [\'essai\', \'casse2\']').replace('merge: row => ({ essai: row.mot + \'|\' + (row.raison || \'\') })', 'merge: row => ({ essai: \'autre\', casse2: row.mot })'));
  fs.writeFileSync(path.join(TMP, 'src', 'content', 'casse2.js'), '/* casse2 */\nNL.content.byDutch = {};\n');
  const tableBefore = text(TABLE);
  const broken = run('merge.js', [TMP, DEUX]);
  ok(broken.code === 1 && broken.lines.length === 1 && /^fail deux -: .*casse2\.js/.test(broken.lines[0]), 'Merge refuse une table illisible : ' + JSON.stringify(broken));
  same(text(TABLE), tableBefore, 'une seconde table illisible : la première n\'est pas écrite');

  /* Une seconde table qui ne s'écrit pas (une valeur tient undefined) : rien n'est écrit, pas
     même la première. */
  const TROIS = path.join(TMP, 'drafts', 'trois');
  fs.cpSync(KIND, TROIS, { recursive: true });
  kindFile('trois', text(path.join(KINDS, 'essai.js')).replace('tables: [\'essai\']', 'tables: [\'essai\', \'casse3\']').replace('merge: row => ({ essai: row.mot + \'|\' + (row.raison || \'\') })', 'merge: row => ({ essai: \'autre\', casse3: { mot: undefined } })'));
  fs.writeFileSync(path.join(TMP, 'src', 'content', 'casse3.js'), '/* casse3 */\n' + table.MARKER + '\nNL.content.byDutch[\'casse3\'] = {\n};\n');
  const unwritable = run('merge.js', [TMP, TROIS]);
  same(unwritable, { code: 1, lines: ['fail trois -: a table value holds undefined at « mot »: write null, or leave the key out'] }, 'Merge refuse une valeur qu\'une table ne sait pas écrire');
  same(text(TABLE), tableBefore, 'une seconde table qui ne s\'écrit pas : la première n\'est pas écrite');

  kindFile('vide','module.exports = { stamp: [], fields: [\'mot\'], tables: [\'vide\'], split: () => [], check: () => [], merge: () => ({}) };\n');
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
  /* Les tables du cours sont écrites comme le rédacteur les écrit : un Merge qui en récrit une
     ne change que ses lignes. */
  C.NL.content.TABLES.forEach(t => {
    const f = path.join(ROOT, 'src', 'content', t.table + '.js');
    ok(table.serialize(table.load(f)) === text(f), 'src/content/' + t.table + '.js n\'est pas écrite comme tools/content/lib/table.js l\'écrit');
  });
  console.log('  tables         littéraux, tri, en-tête, fins de ligne ; ' + C.NL.content.TABLES.map(t => t.table).join(', ') + ' dans sa forme');

  /* ==================================================== 8. le cache épinglé */
  const keys = Object.keys(cache.PINS);
  same(keys.length, 7, 'sept fichiers épinglés');
  keys.forEach(k => {
    const p = cache.PINS[k];
    ok(/^https:\/\//.test(p.url) && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Number.isInteger(p.bytes) && /^[0-9a-f]{64}$/.test(p.sha256),
      k + ' : une épingle a son adresse https, sa date, sa taille et son sha256');
  });
  same(cache.select(['kaikki', 'x'], cache.PINS), { keys: ['kaikki/nl.jsonl'], unknown: ['x'] }, 'un nom est une clé ou son préfixe');
  same(cache.select(['tatoeba'], cache.PINS).keys.length, 6, 'tatoeba désigne ses six fichiers');

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
  fs.writeFileSync(path.join(SEED, 'd.txt'), 'pas pareil\n');
  const pinsD = { 't2/d.txt': PIN('https://example.invalid/d.txt', 'bonjour\n') };
  fs.mkdirSync(path.join(TMP, '.cache', 't2'), { recursive: true });
  fs.writeFileSync(path.join(TMP, '.cache', 't2', 'd.txt'), 'bonjour?\n');
  await cache.fetch(TMP, ['t2'], { from: SEED, pins: pinsD });
  ok(!fs.existsSync(path.join(TMP, '.cache', 't2', 'd.txt')), 'un fichier en cache de la bonne taille mais d\'un autre sha256 est effacé');

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

  /* ==================================================== le genre flemish */
  {
    /* tools/content/kinds/flemish.js dans un dépôt à lui, sous la copie : test/data en plus
       (OpenTaal et flemish.tsv), les sources de l'essai ôtées de be.js et deux formes ôtées de
       flemish.tsv, pour que l'essai ne dépende pas de ce que le cours tient déjà, et un extrait
       du Wiktionnaire fait ici, d'une ligne. check.js lit le dépôt qui le contient : les outils
       se lancent donc depuis celui-ci. */
    const spelling = require('../lib/spelling');
    const FR = path.join(TMP, 'flamand');
    ['build.sh', 'src', 'test/lib', 'test/data', 'tools'].forEach(p => fs.cpSync(path.join(ROOT, p), path.join(FR, p), { recursive: true }));
    const runFr = (script, args) => {
      const r = spawnSync(process.execPath, [path.join(FR, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
      return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
    };
    const PICK = {
      'overleven:p3': { be: 'Sorry, ik heb da nie verstaan.', evidence: 'rule:da+nie' },
      'dokter:p6': { be: 'Hebde een voorschrift nodig?', evidence: 'rule:kunde' },
      'onderweg:w0': { be: 'de velo, de fiets', evidence: 'wiktionary:velo' },
      'weekend:p1': { be: 'Allez, ’t regent weer.', evidence: 'none' }
    };
    const BE = path.join(FR, 'src', 'content', 'be.js'), TSV = path.join(FR, 'test', 'data', 'flemish.tsv');
    const off = {};
    Object.keys(PICK).concat(['overleven:w2', 'overleven:w12', 'overleven:p9', 'ikengij:p4']).forEach(id => { off[C.byId(id).nl] = null; });
    table.update(BE, off);
    fs.writeFileSync(TSV, text(TSV).replace(/^(allez|hebde)\t[^\n]*\n/gm, ''));
    const EXTRACT = path.join(FR, '.cache', 'kaikki', 'belgian.tsv');
    fs.mkdirSync(path.dirname(EXTRACT), { recursive: true });
    fs.writeFileSync(EXTRACT, '# kaikki/nl.jsonl sha256 ' + cache.PINS['kaikki/nl.jsonl'].sha256 + '\nvelo\tnoun\tBelgium\t(essai)\n');
    const K = require(path.join(FR, 'tools', 'content', 'kinds', 'flemish'));
    const CF = course(FR);

    /* Les règles : celles que be.js suit déjà, sur des mots entiers, majuscule gardée. */
    same(K.RULES.map(r => r.name), ['kunde', 'ge', 'da', 'nie', 't', 'is'], 'six règles, dans leur ordre');
    [['Dat is lekker.', 'rule:da'], ['Wat betekent dat?', 'rule:da'], ['Is dat alles?', 'rule:da'], ['Sorry, ik heb dat niet verstaan.', 'rule:da+nie'],
      ['Kunt u mij helpen?', 'rule:kunde'], ['Hoe laat is het?', 'rule:t'], ['Hoeveel is het?', 'rule:t'], ['nog eens', 'rule:is']].forEach(([nl, ev]) =>
      same(K.outputs(nl)[ev], C.NL.content.byDutch.be[nl], 'les règles écrivent ce que be.js tient déjà : « ' + nl + ' », ' + ev));
    same(K.compose('Wat is dat? Dat is het.', ['da', 't']), { text: 'Wa is da? Da’s ’t.', idle: [] }, '« dat is » se contracte, et une règle garde la majuscule');
    same(K.compose('Het regent. Kunt u het?', ['kunde', 't']).text, '’t Regent. Kunde ’t?', '« ’t » passe sa majuscule au mot suivant');
    same(K.compose('Water, niets en wattig.', ['da', 'nie']), { text: 'Water, niets en wattig.', idle: ['da', 'nie'] }, 'une règle ne touche que des mots entiers');
    const all = K.outputs('Kunt u dat niet eens?');
    same([Object.keys(all).length, all['rule:kunde+da+nie+is'], 'rule:kunde+ge' in all], [23, 'Kunde da nie is?', false],
      'outputs donne chaque combinaison où chaque règle change quelque chose');
    same(K.outputs('Goedemorgen.'), {}, 'sans règle qui s\'applique, rien');
    /* Les règles kunde et ge : dans une question, derrière un verbe inversé en tête ou derrière le mot qui
       la pose, « ge » et le verbe à sa forme en t, ou la forme contractée ; ailleurs, derrière un verbe qui
       n'a pas la forme de son sujet, devant ce qui peut suivre « ton », ou quand un « je », un « u » ou un
       « zich » reste, rien plutôt qu'une forme fausse (#92). */
    const FIRES = [['Wat doe je meestal?', 'ge'], ['Heeft u dat?', 'ge'], ['Hoe oud ben je?', 'ge'], ['Hoe zeg je dat in het Nederlands?', 'ge'],
      ['Kunt u mij helpen?', 'ge'], ['u', 'ge'], ['U', 'ge'], ['Sorry, kan je dat herhalen?', 'ge'], ['Om hoe laat kom je?', 'ge'],
      ['Met wie ga je?', 'ge'], ['Hoe heet je?', 'ge'], ['Kan je Engels?', 'ge'], ['Kunt u dat spellen, a.u.b.?', 'ge'], ['En waar woon je?', 'ge'],
      ['Heb je tijd?', 'kunde']];
    same(FIRES.map(([nl, rule]) => K.compose(nl, [rule]).text),
      ['Wat doet ge meestal?', 'Hebt ge dat?', 'Hoe oud zijt ge?', 'Hoe zegt ge dat in het Nederlands?', 'Kunt ge mij helpen?', 'ge', 'Ge',
        'Sorry, kunt ge dat herhalen?', 'Om hoe laat komt ge?', 'Met wie gaat ge?', 'Hoe heet ge?', 'Kunt ge Engels?', 'Kunt ge dat spellen, a.u.b.?',
        'En waar woont ge?', 'Hebde tijd?'],
      'dans une question, derrière un verbe inversé, la règle ge met le verbe à sa forme en t, et la règle kunde le contracte');
    const IDLE = [['Ik stuur u een mail.', 'ge'], ['Niks speciaals, en bij u?', 'ge'], ['dank u wel', 'ge'], ['Ik zie je morgen.', 'ge'],
      ['Fiets je naar het werk?', 'ge'], ['Dat doet je goed.', 'ge'], ['De dokter ziet je nu.', 'ge'], ['Morgen bent u vrij.', 'ge'],
      ['Doe je best!', 'ge'], ['Je moet je haasten.', 'ge'], ['Wie heeft je geholpen?', 'ge'], ['Wie heeft u geholpen?', 'ge'],
      ['Wat heeft je zo boos gemaakt?', 'ge'], ['Wat doet je vader?', 'ge'], ['Hoe heet je zus?', 'ge'], ['Heb je je fiets?', 'ge'],
      ['Weet u welke maat u hebt?', 'ge'], ['Ik heb je vriend ontmoet.', 'kunde'], ['Ik ben je broer.', 'kunde'], ['Daar ben je niet veilig.', 'kunde'],
      ['Heb je je zus gevonden?', 'kunde'], ['Kunt u zich even omdraaien?', 'kunde']];
    same(IDLE.map(([nl, rule]) => K.compose(nl, [rule]).text), IDLE.map(([nl]) => nl),
      'hors d\'une question, derrière « wie » ou un verbe qui n\'a pas la forme de son sujet, devant ce qui peut suivre « ton », ou quand un « je », un « u » ou un « zich » reste, les règles kunde et ge n\'écrivent rien');
    /* Chaque forme qu'une règle écrit a sa raison dans `why`, et `why` ne garde rien qu'elle n'écrive pas :
       sinon Merge lèverait, et Check refuserait une forme juste, le jour où flemish.tsv ne la tient plus.
       Les formes en t que la règle ge donne au verbe n'en ont pas : ce sont des formes qu'OpenTaal tient. */
    const SAMPLE = { kunde: 'Kunt u? Kun je? Hebt u? Heeft u? Heb je? Bent u? Ben je?', ge: 'Doe je dat? Heeft u dat? Ben je dat?', da: 'Dat is wat dat', nie: 'niet', t: 'het', is: 'eens' };
    const SP = spelling.open(FR, CF.NL);
    K.RULES.forEach(r => {
      const verbs = new Set(Object.values(r.verbs || {}));
      const before = new Set(spelling.tokens(SAMPLE[r.name]).map(spelling.stem));
      const written = spelling.tokens(r.apply(SAMPLE[r.name])).map(spelling.stem).filter(f => !before.has(f));
      same([...new Set(written)].filter(f => f !== 't' && !verbs.has(f)).sort(), Object.keys(r.why).sort(), 'la règle ' + r.name + ' donne une raison à chaque forme qu\'elle écrit');
      same([...verbs].filter(f => !SP.forms.has(f)), [], 'la règle ' + r.name + ' ne donne au verbe que des formes qu\'OpenTaal tient');
    });

    /* Split : un lot par unité, ses mots et ses phrases sans forme flamande. */
    const KD = path.join(FR, 'drafts', 'flemish');
    const want = CF.RAW.units.map(u => [u.id, CF.sources.filter(s => s.unit === u.id && !s.be).length]).filter(x => x[1]).map(x => x.join(' '));
    same(runFr('split.js', [FR, KD]), { code: 0, lines: want }, 'Split coupe un lot par unité, des mots et des phrases que be.js ne tient pas');
    const rowOf = id => JSON.parse(text(path.join(KD, CF.byId(id).unit, 'input.json'))).find(r => r.id === id);
    ok(!rowOf('overleven:w0'), 'un mot que be.js tient n\'est pas recoupé');
    const sorry = CF.byId('overleven:p3');
    same(rowOf('overleven:p3'), {
      id: 'overleven:p3', stamp: kit.stamp(kit.loadKind(FR, 'flemish'), sorry, CF.NL), copies: [],
      nl: 'Sorry, ik heb dat niet verstaan.', kind: 'phrase', unit: 'overleven', meaning: CF.NL.gloss.meaning(sorry), siblings: [],
      rules: { 'rule:da': 'Sorry, ik heb da niet verstaan.', 'rule:nie': 'Sorry, ik heb dat nie verstaan.', 'rule:da+nie': 'Sorry, ik heb da nie verstaan.' }
    }, 'une ligne d\'entrée : le néerlandais, son genre, son unité, son sens, ses frères de sens et ce que les règles en font');
    same(rowOf('overleven:w2').siblings.map(s => s.nl), ['de dag'], 'les frères de sens d\'une source sont dans sa ligne');

    /* Check : les raisons du genre, une par une. */
    const ctx = { repo: FR, course: () => CF };
    const why = (id, be, evidence, c) => K.check({ id, be, evidence }, rowOf(id), c || ctx);
    Object.keys(PICK).forEach(id => same(why(id, PICK[id].be, PICK[id].evidence), [], 'une ligne juste passe : ' + id + ', ' + PICK[id].evidence));
    same(why('overleven:w12', null, null), [], 'be null, sans preuve : le néerlandais suffit');
    same(why('overleven:w12', null, 'none'), ['evidence is null when be is null'], 'be null n\'a pas de preuve');
    same(why('overleven:w12', ' nie', 'rule:nie'), ['be is a form on one line, or null'], 'be est une forme sur une ligne');
    same(why('overleven:w12', 'nie', 'rule'), ['evidence is rule:<rule>[+<rule>…], wiktionary:<lemma> or none'], 'une preuve a sa forme');
    same(why('overleven:w12', 'Niet', 'none'), ['be is the Dutch itself: with nothing Flemish to teach, be is null'], 'be n\'est pas le néerlandais');
    same(why('onderweg:w0', 'de fiets, de velo', 'wiktionary:velo'), ['a word\'s first form is the Flemish one, and here it is the Dutch itself'],
      'la première forme d\'un mot est la flamande');
    same(why('onderweg:w0', 'de velo, , de fiets', 'wiktionary:velo'), ['a word\'s forms are separated by commas, none empty, none twice'], 'pas de forme vide');
    same(why('overleven:p9', 'Kunde?', 'none'), ['be has 1 tiles: a phrase\'s be has at least 3'], 'une phrase garde de quoi faire ses tuiles');
    same([why('werkbasis:p7', 'Da’s klaar.', 'rule:da'), rowOf('werkbasis:p7').rules], [['be has 2 tiles: a phrase\'s be has at least 3'], {}],
      'une sortie de règle qui laisse trop peu de tuiles est refusée, et Split ne l\'offre pas');
    same([why('dokter:w2', '’t hoofd', 'rule:t'), why('dokter:w2', '’t hoofd, het hoofd', 'none'), rowOf('dokter:w2').rules],
      [['only the article changes, « ’t » for « het »: everyone says that, so be is null'], ['only the article changes, « ’t » for « het »: everyone says that, so be is null'], {}],
      'un mot dont seul l\'article devient « ’t » n\'a rien de flamand à apprendre, et Split ne l\'offre pas');
    same(why('ikengij:p4', 'Ik werk bij de firma.', 'none'), ['be keeps the Dutch\'s {…} tokens: « {bedrijf} »'], 'be garde les jetons du néerlandais');
    same(why('overleven:p3', PICK['overleven:p3'].be, 'rule:da+zeg'), ['no rule « zeg »: the rules are kunde, ge, da, nie, t, is'], 'une règle inconnue est nommée');
    same(why('overleven:p3', PICK['overleven:p3'].be, 'rule:nie+da'), ['rules are cited once each, in the order kunde, ge, da, nie, t, is'], 'les règles se citent dans leur ordre');
    same(why('overleven:p3', PICK['overleven:p3'].be, 'rule:da+nie+t'), ['rule t changes nothing here'], 'une règle citée change quelque chose');
    same(why('overleven:p3', PICK['overleven:p3'].be, 'rule:da'), ['rule:da gives « Sorry, ik heb da niet verstaan. », not be'], 'les règles citées donnent be, exactement');
    same(why('onderweg:w0', 'de velo, de fiets', 'wiktionary:fietske'), ['« fietske » has no Belgian or Flemish sense in the pinned Wiktionary extract'],
      'le lemme est dans l\'extrait');
    same(why('onderweg:w0', 'het rijwiel, de fiets', 'wiktionary:velo'), ['be does not use the lemma « velo »'], 'be emploie le lemme');
    same(why('onderweg:w0', 'het velootje, de fiets', 'wiktionary:velo'), [], 'une forme tirée du lemme a sa raison, même inconnue d\'OpenTaal');
    same(why('onderweg:w0', 'de velo, het fietske', 'wiktionary:velo'),
      ['« fietske » is not a form OpenTaal knows, and wiktionary:velo does not account for it: correct it, or cite evidence none'], 'une forme inconnue sans raison est nommée');
    same(why('weekend:p1', PICK['weekend:p1'].be, 'rule:t'), [
      'rule:t gives « ’t Regent weer. », not be',
      '« allez » is not a form OpenTaal knows, and rule:t does not account for it: correct it, or cite evidence none'
    ], 'chaque raison est dite');
    fs.renameSync(EXTRACT, EXTRACT + '.old');
    same(why('onderweg:w0', PICK['onderweg:w0'].be, 'wiktionary:velo', { repo: FR, course: () => CF }), ['.cache/kaikki/belgian.tsv is missing: run node tools/content/kaikki.js .'],
      'sans extrait, une preuve du Wiktionnaire dit la commande qui manque');
    fs.renameSync(EXTRACT + '.old', EXTRACT);
    same([K.forMaintainer(PICK['weekend:p1']), K.forMaintainer(PICK['dokter:p6']), K.forMaintainer({ be: null, evidence: null })], ['evidence none', '', ''],
      'evidence none, et elle seule, va au mainteneur');
    same([K.readWhole(PICK['dokter:p6']), K.readWhole({ be: null, evidence: null })], ['new be', ''], 'le relecteur lit en entier chaque forme nouvelle');

    /* De bout en bout : chaque lot rédigé (be null, sauf les lignes de l'essai) et relu,
       check.js, puis Merge, et Merge relancée. */
    const batches = text(path.join(KD, 'split.txt')).split('\n').filter(Boolean).map(l => l.split(' ')[0]);
    let rows = 0;
    batches.forEach(b => {
      const dir = path.join(KD, b), inp = JSON.parse(text(path.join(dir, 'input.json')));
      rows += inp.length;
      put(dir, 'draft.json', inp.map(r => Object.assign({ id: r.id, stamp: r.stamp }, PICK[r.id] || { be: null, evidence: null })));
      put(dir, 'review.json', inp.map(r => ({ id: r.id, verdict: PICK[r.id] && PICK[r.id].evidence === 'none' ? 'for maintainer: evidence none' : 'keep' })));
    });
    const WEEKEND = path.join(KD, 'weekend'), DOKTER = path.join(KD, 'dokter');
    const review = text(path.join(WEEKEND, 'review.json'));
    put(WEEKEND, 'review.json', review.replace('"for maintainer: evidence none"', '"keep"'));
    same(runFr('check.js', [WEEKEND]).lines.filter(l => /^fail /.test(l)),
      ['fail review.json weekend:p1: the format sends this row to the maintainer (evidence none): its verdict is « for maintainer: <reason> »'],
      'une ligne sans preuve va au mainteneur, quoi qu\'en dise la relecture');
    put(WEEKEND, 'review.json', review);
    put(WEEKEND, 'disputes.md', '## weekend:p1\nSource: Het regent weer.\nRow: Allez, ’t regent weer. (none)\nFirst reader: for maintainer: evidence none\nYour ruling:\n');
    put(WEEKEND, 'rulings.json', [{ id: 'weekend:p1', ruling: 'keep', words: null, confirmed: true, date: '2026-10-22' }]);
    same(runFr('check.js', [WEEKEND]).code, 0, 'le lot, avec la décision du mainteneur, passe');
    const draft = text(path.join(DOKTER, 'draft.json'));
    put(DOKTER, 'draft.json', draft.replace('"rule:kunde"', '"rule:ge"'));
    same(runFr('check.js', [DOKTER]).lines.filter(l => /^fail /.test(l)), [
      'fail draft.json dokter:p6: rule:ge gives « Hebt ge een voorschrift nodig? », not be',
      'fail draft.json dokter:p6: « hebde » is not a form OpenTaal knows, and rule:ge does not account for it: correct it, or cite evidence none',
      'fail review.json -: draft.json missing or failing'
    ], 'check.js dit les raisons du genre, et ne lit pas la suite');
    put(DOKTER, 'draft.json', draft);

    const n0 = Object.keys(table.load(BE).entries).length, tsv0 = text(TSV);
    const MERGED_FR = ['ok flemish ' + rows + ' taken, 0 dropped', 'ok be.js 4 set, 0 removed', 'ok flemish.tsv 2 added: allez, hebde'];
    same(runFr('merge.js', [FR, KD]), { code: 0, lines: MERGED_FR },
      'Merge prend chaque ligne, n\'écrit rien pour be null, et inscrit dans flemish.tsv les formes qu\'OpenTaal ne connaît pas');
    const entries = table.load(BE).entries;
    same(Object.keys(PICK).map(id => entries[CF.byId(id).nl]), Object.keys(PICK).map(id => PICK[id].be), 'be.js tient chaque forme sous son néerlandais');
    same(Object.keys(entries).length, n0 + 4, 'et rien d\'autre');
    const forms = spelling.readFlemish(TSV), eol = /\r\n/.test(tsv0) ? '\r\n' : '\n';
    same([forms.get('allez'), forms.get('hebde')], ['forme flamande sans source écrite, gardée par le mainteneur', '« hebt ge » contracté, flamand parlé'],
      'chaque forme nouvelle a la raison que sa preuve donne');
    same(forms.size, tsv0.split(/\r?\n/).filter(l => l && l[0] !== '#').length + 2, 'flemish.tsv garde ses formes');
    ok(text(TSV).split(eol).every(l => !/[\r\n]/.test(l)) && text(TSV).indexOf(tsv0.split(/\r?\n/).filter(l => l[0] === '#').join(eol) + eol) === 0,
      'flemish.tsv garde ses commentaires en tête et ses fins de ligne');
    const beAfter = text(BE), tsvAfter = text(TSV);
    const again = runFr('merge.js', [FR, KD]);
    same([again.code, again.lines.map(l => l.replace(/: stale, stamped [0-9a-f]{8} at Split, the source now stamps [0-9a-f]{8}$/, ': stale'))],
      [1, ['overleven:p3', 'onderweg:w0', 'dokter:p6', 'weekend:p1'].map(id => 'fail flemish ' + id + ': stale')],
      'le tampon couvre be : relancée après un succès, Merge refuse comme périmée chaque ligne dont elle a écrit la forme');
    ok(text(BE) === beAfter && text(TSV) === tsvAfter, 'refusée, Merge n\'écrit rien');
    console.log('  flemish        ' + batches.length + ' lots, ' + rows + ' lignes ; six règles ; Check, Merge et flemish.tsv');
  }

  /* ==================================================== le genre examples */
  {
    /* tools/content/kinds/examples.js dans un dépôt à lui, sous la copie : test/data en plus
       (OpenTaal et flemish.tsv) et docs/attribution (le crédit des phrases), src/content/sourced.js
       vidé, pour que l'essai ne dépende pas des phrases que le cours tient déjà, et un extrait de
       Tatoeba fait ici, de cinq phrases, sous les vraies épingles. check.js lit le dépôt qui le
       contient : les outils se lancent donc depuis celui-ci. */
    const EX = path.join(TMP, 'exemples');
    ['build.sh', 'src', 'test/lib', 'test/data', 'tools', 'docs/attribution'].forEach(p => fs.cpSync(path.join(ROOT, p), path.join(EX, p), { recursive: true }));
    const runEx = (script, args) => {
      const r = spawnSync(process.execPath, [path.join(EX, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
      return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
    };
    const SOURCED = path.join(EX, 'src', 'content', 'sourced.js');
    const emptied = {};
    Object.keys(table.load(SOURCED).entries).forEach(nl => { emptied[nl] = null; });
    table.update(SOURCED, emptied);
    const tatoeba = require(path.join(EX, 'tools', 'content', 'tatoeba'));
    const EXTRACT = path.join(EX, '.cache', 'tatoeba', 'extract.tsv');
    fs.mkdirSync(path.dirname(EXTRACT), { recursive: true });
    fs.writeFileSync(EXTRACT, ['# ' + tatoeba.KEYS.map(k => k + ' ' + cache.PINS[k].sha256).join(' '),
      'nld\t101\tanna\t1\tSorry, spreekt u Engels?\t201\t301',
      'nld\t102\t\t0\tZe spreekt goed Engels.\t202,203\t302',
      'nld\t104\tanna\t1\tMisschien is het waar.\t204\t304',
      'nld\t105\tbob\t0\tHet is drie uur.\t205\t305',
      'nld\t106\t\t0\tze spreekt goed engels\t202\t302',
      'eng\t201\tbob\tSorry, do you speak English?',
      'eng\t202\tbob\tShe speaks good English.',
      'eng\t203\tcarl\tShe speaks English well.',
      'eng\t204\tbob\tMaybe it\'s true.',
      'eng\t205\tcarl\tIt\'s three o\'clock.',
      'fra\t301\t\tPardon, parlez-vous anglais ?',
      'fra\t302\tdora\tElle parle bien anglais.',
      'fra\t304\tdora\tC\'est peut-être vrai.',
      'fra\t305\tdora\tIl est trois heures.'].join('\n') + '\n');
    const K = require(path.join(EX, 'tools', 'content', 'kinds', 'examples'));
    const kind = kit.loadKind(EX, 'examples');
    const CE = course(EX);

    /* Les lots : des unités entières, dans l'ordre du cours, autant qu'il en faut pour 40 lignes
       par lot, le plus gros le plus petit possible. Les comptes sont ceux du cours mesuré. */
    const g = (unit, n) => ({ unit, rows: Array.from({ length: n }, (x, k) => unit + k) });
    const measured = [['overleven', 9], ['ikengij', 16], ['tijd', 24], ['bakker', 4], ['thuis', 7], ['familie', 7], ['onderweg', 1],
      ['dedag', 1], ['winkel', 2], ['dokter', 4], ['weekend', 1]].map(([u, n]) => g(u, n));
    const cut = K.cut(measured, 40);
    same(cut.map(b => b.batch + ' ' + b.rows.length), ['overleven-tijd 49', 'bakker-weekend 27'],
      'les 76 mots mesurés font deux lots d\'unités entières, nommés par leur première et leur dernière unité');
    same([cut[0].rows[0], cut[0].rows[9], cut[1].rows[26]], ['overleven0', 'ikengij0', 'weekend0'], 'un lot garde ses lignes dans l\'ordre du cours');
    same(K.cut([g('tijd', 50), g('bakker', 5)], 40).map(b => b.batch + ' ' + b.rows.length), ['tijd 50', 'bakker 5'], 'une unité n\'est jamais coupée');
    same(K.cut([], 40), [], 'rien à couper, aucun lot');

    /* Split : les mots sans phrase qui ont une candidate. « sorry » n'en a pas : la seule phrase
       qui l'écrit, 101, emprunte « engels » à ikengij. « het uur » a ses phrases écrites à la
       main, et 105 ne lui est pas proposée. */
    const KD = path.join(EX, 'drafts', 'examples');
    same(runEx('split.js', [EX, KD]), { code: 0, lines: ['overleven-tijd 3'] }, 'Split coupe un lot des mots qui ont une candidate');
    const BATCH = path.join(KD, 'overleven-tijd');
    const input = JSON.parse(text(path.join(BATCH, 'input.json')));
    same(input.map(r => r.id), ['overleven:w9', 'ikengij:w24', 'tijd:w3'], 'misschien, het Engels et drie ; ni sorry ni het uur');
    const engels = input[1];
    same(Object.keys(engels), ['id', 'stamp', 'copies', 'nl', 'unit', 'art', 'meaning', 'candidates'], 'une ligne d\'entrée');
    same([engels.nl, engels.unit, engels.art, engels.meaning, input[0].art], ['het Engels', 'ikengij', 'het', { fr: 'l’anglais', en: 'English' }, null],
      'le néerlandais, l\'unité, l\'article (null sans article) et le sens');
    same(engels.candidates.map(c => c.id), [101, 102, 106], 'l\'auteur de langue maternelle d\'abord');
    same(engels.candidates[1], { id: 102, nl: 'Ze spreekt goed Engels.', owner: '',
      en: [{ id: 202, text: 'She speaks good English.', owner: 'bob' }, { id: 203, text: 'She speaks English well.', owner: 'carl' }],
      fr: [{ id: 302, text: 'Elle parle bien anglais.', owner: 'dora' }], tiles: 4 },
    'une candidate, avec ses traductions et leurs auteurs');

    /* L'empreinte : le sens, l'article, et les phrases écrites à la main seules. */
    const src = CE.byId('ikengij:w24');
    const st = s => kit.stamp(kind, s, CE.NL);
    same(engels.stamp, st(src), 'Split pose l\'empreinte de la source');
    same(st(Object.assign({}, src, { drills: [{ nl: 'Ze spreekt goed Engels.', src: 102 }] })), st(src),
      'une phrase sourcée ne la change pas : une seconde Merge ne trouve pas ses propres lignes périmées');
    ok(st(Object.assign({}, src, { drills: [{ nl: 'Ze spreekt goed Engels.' }] })) !== st(src), 'une phrase écrite à la main la change');
    ok(st(Object.assign({}, src, { art: 'de' })) !== st(src), 'l\'article la change');

    /* Check, raison par raison, sur la ligne de « het Engels ». */
    const ctx = { repo: EX, course: () => CE };
    const good = { src: 102, nl: 'Ze spreekt goed Engels.', gap: 'Engels', en: 'She speaks English well.', enSrc: 203, fr: 'Elle parle bien anglais.', frSrc: 302 };
    const other = { src: 101, nl: 'Sorry, spreekt u Engels?', gap: 'Engels', en: 'Sorry, do you speak English?', enSrc: 201, fr: 'Pardon, parlez-vous anglais ?', frSrc: 301 };
    const as = more => Object.assign({}, good, more);
    const without = k => { const d = Object.assign({}, good); delete d[k]; return d; };
    const why = (sentences, more) => K.check(Object.assign({ id: engels.id, stamp: engels.stamp, sentences }, more), engels, ctx);
    same(why([good]), [], 'une phrase prise telle que Tatoeba l\'écrit passe');
    same(why([good, other]), [], 'deux phrases passent');
    same(why([good, as({ enSrc: 202, en: 'She speaks good English.' })]), ['the two sentences are one sentence'], 'deux fois la même phrase, non');
    same(why([good, other, good]), ['sentences is a list of 0 to 2 sentences'], 'trois phrases, non');
    same(why([]), ['a row with no sentence says why in skip, on one line'], 'aucune phrase : skip dit pourquoi');
    same(why([], { skip: 'neither candidate is how a Fleming says it' }), [], 'aucune phrase, et skip');
    same(why([good], { skip: 'no' }), ['skip is for a row with no sentence'], 'skip avec une phrase, non');
    same(why([without('frSrc')]), ['sentence 1 has the fields src, nl, gap, en, enSrc, fr, frSrc (and edited when a translation is not Tatoeba\'s), not src, nl, gap, en, enSrc, fr'],
      'les champs d\'une phrase');
    same(why([as({ src: 104 })]), ['sentence 1: src 104 is not one of the row\'s candidates'], 'une phrase de l\'extrait qui n\'est pas une candidate de la ligne, non');
    same(why([as({ nl: 'Ze spreekt heel goed Engels.' })]), ['sentence 1: nl is not Tatoeba\'s sentence 102, « Ze spreekt goed Engels. »: a sentence is taken as Tatoeba writes it'],
      'la phrase telle que Tatoeba l\'écrit');
    same(why([as({ enSrc: 201 })]), ['sentence 1: enSrc 201 is not a translation Tatoeba links to 102'], 'une traduction que Tatoeba lie à la phrase');
    same(why([as({ en: 'She speaks English very well.' })]),
      ['sentence 1: en « She speaks English very well. » is not Tatoeba\'s 203, « She speaks English well. »: take it as written, or say why in edited'],
      'une traduction changée sans raison, non');
    same(why([as({ en: 'She speaks English very well.', edited: 'the learner hears the adverb' })]), [], 'une traduction changée, et sa raison');
    same(why([as({ edited: 'nothing' })]), ['sentence 1: edited is for a translation that is not Tatoeba\'s, and both are'], 'edited sans traduction changée, non');

    same(why([as({ en: 'two\nlines' })]), ['sentence 1: nl, gap, en and fr are each a string on one line'], 'une traduction sur plusieurs lignes, non');
    same(why([as({ gap: '' })]), ['sentence 1: nl, gap, en and fr are each a string on one line'], 'un trou vide, non');
    same(why([as({ frSrc: 301 })]), ['sentence 1: frSrc 301 is not a translation Tatoeba links to 102'], 'une traduction française que Tatoeba ne lie pas à la phrase');
    same(why([as({ fr: 'Elle parle très bien anglais.' })]),
      ['sentence 1: fr « Elle parle très bien anglais. » is not Tatoeba\'s 302, « Elle parle bien anglais. »: take it as written, or say why in edited'],
      'une traduction française changée sans raison, non');
    same(why([as({ fr: 'Elle parle très bien anglais.', edited: 'the learner hears the adverb' })]), [], 'une traduction française changée, et sa raison');
    same(why([good, as({ src: 106, nl: 'ze spreekt goed engels', gap: 'engels', enSrc: 202, en: 'She speaks good English.' })]), ['the two sentences are one sentence'],
      'deux sources différentes au même texte (casse et ponctuation près), non');
    same(K.readWhole({ sentences: [as({ edited: 'x' })] }), 'edited translation', 'la lecture entière : une traduction changée');
    same([K.readWhole({ sentences: [good] }), K.readWhole({ sentences: [] })], ['', ''], 'la lecture entière : rien à relire sans traduction changée');

    /* Les règles d'une phrase, à l'unité du mot : ce que test/content.js tient, et le classement. */
    const rules = (d, id) => K.RULES(Object.assign({ en: 'English.', fr: 'Anglais.' }, d), 's', CE.byId(id || 'ikengij:w24'), CE, EX);
    same(rules({ nl: 'Ze spreekt goed Engels.', gap: 'Engels' }), [], 'une phrase qui suit les règles');
    same(rules({ nl: 'Ik spreek Engels.', gap: 'Engels' }), ['s has 3 tiles: 4 to 8'], 'de 4 à 8 tuiles');
    ['engels', 'spreekt', 'goed Engels'].forEach(gap => same(rules({ nl: 'Ze spreekt goed Engels.', gap }),
      ['s: gap « ' + gap + ' » is not the word, one tile as nl writes it, that the cloze can hide'], 'le trou « ' + gap + ' », non'));
    same(rules({ nl: 'Misschien spreekt ze Engels.', gap: 'Misschien' }, 'overleven:w9'), ['s borrows from a later unit: spreekt, engels'], 'rien d\'une unité ultérieure');
    same(rules({ nl: 'Ze leest vloeiend Engels.', gap: 'Engels' }), ['s uses forms the course never teaches: leest, vloeiend'], 'aucune forme que le cours n\'enseigne jamais');
    same(rules({ nl: 'Ze spreekt vloeiend Engels.', gap: 'Engels' }), ['s uses forms the course never teaches: vloeiend'], 'pas même une (#12, récit 39)');
    same(rules({ nl: 'Hij leert al twee jaar Engels.', gap: 'Engels' }), ['s uses forms the course never teaches: leert'],
      'pas même une forme fléchie d\'un mot vu : leert, de leren (test/lib/sequence.js dit pourquoi)');
    same(rules({ nl: 'Ze spreekt goedd Engels.', gap: 'Engels' }), ['s uses forms the course never teaches: goedd', 's: « goedd » not a form OpenTaal knows'],
      'l\'orthographe, et une forme mal écrite que le cours n\'enseigne donc pas');
    same(rules({ nl: 'Ze spreekt goed Engels met {naam}.', gap: 'Engels' }), ['s names no one by default and holds no {…} token'], 'ni nom ni jeton');
    same(rules({ nl: 'Ze spreekt goed Engels.', gap: 'Engels', en: 'She speaks 2 languages.' }), ['s: en and fr do not hold the same digits'], 'les mêmes chiffres');

    /* Check sur le lot, comme un agent le lance. */
    const row = (id, more) => Object.assign({ id, stamp: input.find(r => r.id === id).stamp }, more);
    const draft = [
      row('overleven:w9', { sentences: [{ src: 104, nl: 'Misschien is het waar.', gap: 'Misschien', en: 'Maybe it\'s true.', enSrc: 204, fr: 'C\'est peut-être vrai.', frSrc: 304 }] }),
      row('ikengij:w24', { sentences: [good, other] }),
      row('tijd:w3', { sentences: [], skip: 'the one candidate teaches the clock, not the number' })
    ];
    put(BATCH, 'draft.json', draft);
    same(runEx('check.js', [BATCH]), { code: 0, lines: ['ok input.json 3 rows', 'ok draft.json 3 rows'] }, 'le lot passe Check');
    draft[0].sentences[0].gap = 'misschien';
    put(BATCH, 'draft.json', draft);
    same(runEx('check.js', [BATCH]), { code: 1, lines: ['ok input.json 3 rows',
      'fail draft.json overleven:w9: sentence 1: gap « misschien » is not the word, one tile as nl writes it, that the cloze can hide'] }, 'Check nomme la ligne et sa raison');

    /* Sans l'extrait : Check et Split disent la commande à lancer. */
    fs.renameSync(EXTRACT, EXTRACT + '.ôté');
    const missing = '.cache/tatoeba/extract.tsv is missing: run node tools/content/tatoeba.js .';
    same(K.check(row('ikengij:w24', { sentences: [good] }), engels, { repo: EX, course: () => course(EX) }), [missing], 'Check sans l\'extrait');
    same(runEx('split.js', [EX, path.join(EX, 'sans-extrait', 'examples')]), { code: 1, lines: ['fail examples -: the kind\'s split threw: ' + missing] }, 'Split sans l\'extrait');
    fs.renameSync(EXTRACT + '.ôté', EXTRACT);

    /* Merge : les phrases sous le néerlandais du mot dans sourced.js, et le crédit récrit. Avant,
       sourced.js tient une phrase de « sorry », créditée, et le crédit une ligne de trop. */
    draft[0].sentences[0].gap = 'Misschien';
    /* Les trois valeurs de adapted : fr seul (102), en seul (104), les deux (101). */
    draft[0].sentences[0] = Object.assign({}, draft[0].sentences[0], { en: 'Maybe it is true.', edited: 'the learner hears the plain verb' });
    draft[1].sentences[0] = Object.assign({}, good, { fr: 'Elle parle bien l\'anglais.', edited: 'the learner hears the article' });
    draft[1].sentences[1] = Object.assign({}, other, { en: 'Excuse me, do you speak English?', fr: 'Pardon, vous parlez anglais ?', edited: 'the learner hears a plain question' });
    put(BATCH, 'draft.json', draft);
    put(BATCH, 'review.json', draft.map(r => ({ id: r.id, verdict: 'keep' })));
    const sorry = [{ nl: 'Sorry, ik ben te laat.', fr: 'Pardon, je suis en retard.', en: 'Sorry, I am late.', gap: 'Sorry', src: 900 }];
    table.update(SOURCED, { sorry });
    /* Le crédit de la copie réduit à ses commentaires et à son en-tête, comme sourced.js est vidé. */
    const CREDITS = path.join(EX, 'docs', 'attribution', 'tatoeba.tsv'), was = text(CREDITS);
    const eol = /\r\n/.test(was) ? '\r\n' : '\n';
    const credits = was.split(/\r?\n/).filter(l => l[0] === '#').concat([K.CREDITS]).join(eol) + eol;
    fs.writeFileSync(CREDITS, credits + ['sorry\t900\tanna\t901\tbob\t902\tdora\t-', 'drie\t777\tanna\t778\tbob\t779\tdora\t-'].join(eol) + eol);
    const MERGED = ['ok examples 3 taken, 0 dropped', 'ok sourced.js 2 set, 0 removed', 'ok tatoeba.tsv 4 rows'];
    same(runEx('merge.js', [EX, KD]), { code: 0, lines: MERGED }, 'Merge écrit les phrases prises, rien pour une ligne sans phrase, et récrit le crédit');
    const held = table.load(SOURCED).entries;
    same([held['het Engels'], held.misschien, held.sorry, 'drie' in held], [[
      { nl: 'Ze spreekt goed Engels.', fr: 'Elle parle bien l\'anglais.', en: 'She speaks English well.', gap: 'Engels', src: 102 },
      { nl: 'Sorry, spreekt u Engels?', fr: 'Pardon, vous parlez anglais ?', en: 'Excuse me, do you speak English?', gap: 'Engels', src: 101 }
    ], [{ nl: 'Misschien is het waar.', fr: 'C\'est peut-être vrai.', en: 'Maybe it is true.', gap: 'Misschien', src: 104 }], sorry, false],
    'sourced.js : { nl, fr, en, gap, src } dans l\'ordre de la ligne, la phrase d\'avant gardée');
    same(text(CREDITS), credits + ['het Engels\t101\tanna\t201\tbob\t301\t-\ten fr', 'het Engels\t102\t-\t203\tcarl\t302\tdora\tfr',
      'misschien\t104\tanna\t204\tbob\t304\tdora\ten', 'sorry\t900\tanna\t901\tbob\t902\tdora\t-'].join(eol) + eol,
    'le crédit : une ligne par phrase de Tatoeba que sourced.js tient, triée, l\'auteur absent écrit « - », adapted : fr, en ou en fr, selon la traduction changée');
    same(course(EX).byId('ikengij:w24').drills, held['het Engels'], 'le mot a ses phrases');
    const after = text(SOURCED);
    same(runEx('merge.js', [EX, KD]), { code: 0, lines: MERGED }, 'une seconde Merge ne trouve pas ses lignes périmées');
    same(text(SOURCED), after, 'et ne change rien');
    same(runEx('split.js', [EX, path.join(EX, 'encore', 'examples')]), { code: 0, lines: ['tijd 1'] }, 'Split ne propose plus un mot qui a ses phrases');

    /* examples-gen : les mots nommés dans named.txt, une phrase écrite pour chacun, lue deux fois. */
    const G = require(path.join(EX, 'tools', 'content', 'kinds', 'examples-gen'));
    const genDir = parent => path.join(EX, parent, 'examples-gen');
    const named = (parent, body) => { fs.mkdirSync(genDir(parent), { recursive: true }); fs.writeFileSync(path.join(genDir(parent), 'named.txt'), body); };
    same(runEx('split.js', [EX, genDir('sans-liste')]), { code: 1, lines: ['fail examples-gen -: the kind\'s split threw: named.txt is missing: it holds the words the maintainer named, one per line, or none'] },
      'Split refuse sans named.txt');
    named('mauvaise', 'drie\nhet Engels\nzzz\ndrie\n');
    same(runEx('split.js', [EX, genDir('mauvaise')]), { code: 1, lines: ['fail examples-gen -: the kind\'s split threw: named.txt: « het Engels » already has sentences; « zzz » is not a word of the course; « drie » twice'] },
      'un mot nommé est un mot du cours encore sans phrase, une fois');
    named('aucun', '# the maintainer named none\n\n');
    same(runEx('split.js', [EX, genDir('aucun')]), { code: 0, lines: [] }, 'aucun mot nommé : zéro ligne');
    same(runEx('merge.js', [EX, genDir('aucun')]), { code: 0, lines: ['ok examples-gen 0 taken, 0 dropped'] }, 'et Merge n\'écrit rien');
    same(text(SOURCED), after, 'sourced.js n\'a pas changé');
    const GD = genDir('drafts');
    named('drafts', '# gate 35\nde dorst\r\ndrie\n');
    same(runEx('split.js', [EX, GD]), { code: 0, lines: ['tijd-bakker 2'] }, 'Split coupe les mots nommés, dans l\'ordre du cours');
    const GB = path.join(GD, 'tijd-bakker'), gin = JSON.parse(text(path.join(GB, 'input.json')));
    same(gin.map(r => [r.id, Object.keys(r).join(' ')]), [['tijd:w3', 'id stamp copies nl unit art meaning'], ['bakker:w19', 'id stamp copies nl unit art meaning']], 'une ligne d\'entrée');
    const gen = (id, sentence) => ({ id, stamp: gin.find(r => r.id === id).stamp, sentence });
    const gdraft = [gen('tijd:w3', { nl: 'Het is drie uur.', gap: 'drie', en: 'It is three o\'clock.', fr: 'Il est trois heures.' }),
      gen('bakker:w19', { nl: 'Ik heb dorst, gij ook?', gap: 'dorst', en: 'I am thirsty, are you?', fr: 'J’ai soif, et toi ?' })];
    const gctx = { repo: EX, course: () => course(EX) };
    const gwhy = sentence => G.check(gen('bakker:w19', sentence), gin[1], gctx);
    same(gwhy(gdraft[1].sentence), [], 'une phrase écrite qui suit les règles');
    same(gwhy({ nl: 'Heb jij ook dorst?', gap: 'dorst', en: 'Are you thirsty too?', fr: 'Tu as soif aussi ?' }), ['sentence: « jij » is not how the course says you: ge or gij'], 'ge ou gij, jamais jij');
    same(gwhy({ nl: 'Ik heb dorst.', gap: 'dorst', en: 'I am thirsty.', fr: 'J’ai soif.' }), ['sentence has 3 tiles: 4 to 8'], 'les règles des phrases sourcées');
    same(gwhy({ nl: 'Ik heb dorst, gij ook?', gap: 'dorst', en: 'I am thirsty, are you?' }), ['sentence has the fields nl, gap, en, fr'], 'ses quatre champs');
    put(GB, 'draft.json', gdraft);
    put(GB, 'review.json', gdraft.map(r => ({ id: r.id, verdict: 'keep' })));
    same(runEx('check.js', [GB]), { code: 1, lines: ['ok input.json 2 rows', 'ok draft.json 2 rows',
      'fail review.json tijd:w3: a verdict carries the reader\'s own en and fr of nl, each on one line',
      'fail review.json bakker:w19: a verdict carries the reader\'s own en and fr of nl, each on one line'] }, 'le verdict porte la traduction du lecteur');
    put(GB, 'review.json', [{ id: 'tijd:w3', verdict: 'keep', en: 'It\'s three o\'clock.', fr: 'Il est trois heures.' },
      { id: 'bakker:w19', verdict: 'keep', en: 'I\'m thirsty, and you?', fr: 'J’ai soif, et vous ?' }]);
    same(runEx('check.js', [GB]), { code: 0, lines: ['ok input.json 2 rows', 'ok draft.json 2 rows', 'ok review.json 2 keep, 0 dispute'] }, 'le lot passe Check');
    same(G.readWhole(gdraft[0]), 'generated sentence', 'le mainteneur lit chaque phrase écrite');
    same(runEx('merge.js', [EX, GD]), { code: 0, lines: ['ok examples-gen 2 taken, 0 dropped', 'ok sourced.js 2 set, 0 removed'] }, 'Merge écrit les phrases, sans crédit');
    same(table.load(SOURCED).entries.drie, [{ nl: 'Het is drie uur.', fr: 'Il est trois heures.', en: 'It is three o\'clock.', gap: 'drie', src: 'gen' }], 'src « gen »');
    same(text(CREDITS).split(eol).length, credits.split(eol).length + 4, 'le crédit n\'a pas changé');
    console.log('  examples       ' + cut.length + ' lots sur le cours mesuré ; Split, Check, ses règles, Merge et le crédit sur un extrait de 5 phrases ; examples-gen sur 2 mots nommés');
  }

  /* ==================================================== le genre open */
  {
    /* tools/content/kinds/open.js dans un dépôt à lui, sous la copie, avec test/data (Check
       épelle l'exemple par test/lib/spelling.js) : check.js lit le dépôt qui le contient, les
       outils se lancent donc depuis celui-ci. Les lignes écrites ici sont faites à la main. */
    const OP = path.join(TMP, 'open');
    ['build.sh', 'src', 'test/lib', 'test/data', 'tools'].forEach(p => fs.cpSync(path.join(ROOT, p), path.join(OP, p), { recursive: true }));
    const runOp = (script, args) => {
      const r = spawnSync(process.execPath, [path.join(OP, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
      return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
    };
    const K = kit.loadKind(OP, 'open'), CO = course(OP), U = CO.NL.util;
    const ctx = { repo: OP, course: () => CO };
    const KD = path.join(OP, 'drafts', 'open'), LOTS = ['units-1-6', 'units-7-12'];

    /* Split : 36 phrases, trois par unité, en deux lots de six unités. */
    same(runOp('split.js', [OP, KD]), { code: 0, lines: ['units-1-6 18', 'units-7-12 18'] }, 'Split coupe les 36 phrases en deux lots de six unités');
    const inputs = LOTS.map(b => JSON.parse(text(path.join(KD, b, 'input.json'))));
    const all = [].concat(...inputs);
    const rowOf = id => all.find(r => r.id === id);
    same(all.map(r => r.id), K.PHRASES, 'chaque phrase de PHRASES une fois, dans l\'ordre du cours');
    const units = CO.RAW.units.map(u => u.id);
    same(inputs.map((rows, i) => rows.every(r => (units.indexOf(r.unit) < 6) === (i === 0))), [true, true], 'les unités 1 à 6 dans le premier lot, 7 à 12 dans le second');
    const pain = CO.byId('bakker:p1');
    same(Object.assign({}, rowOf('bakker:p1'), { vocab: null }), {
      id: 'bakker:p1', stamp: kit.stamp(K, pain, CO.NL), copies: [], nl: 'Mag ik twee pistolets?', unit: 'bakker',
      meaning: { fr: CO.NL.gloss.of(pain, 'fr'), en: CO.NL.gloss.of(pain, 'en') }, vocab: null
    }, 'une ligne d\'entrée : la phrase, son unité, son sens, et vocab');
    const vocab = id => rowOf(id).vocab;
    ok(all.every(r => U.words(r.nl).every(w => r.vocab.indexOf(w.toLowerCase()) >= 0)), 'vocab tient les mots de la phrase');
    ok(vocab('bakker:p1').every(w => vocab('weekend:p7').indexOf(w) >= 0) && vocab('weekend:p7').indexOf('goesting') >= 0 &&
      vocab('bakker:p1').indexOf('goesting') < 0, 'vocab est ce que le cours a enseigné jusqu\'à l\'unité de la phrase, pas après');

    /* Check : la ligne de la boulangerie passe, puis chaque raison du genre, une par une. */
    const BAKKER = {
      id: 'bakker:p1', stamp: rowOf('bakker:p1').stamp,
      ask: { fr: 'À la boulangerie, demande ce que tu veux, et combien. Commence par « Mag ik ».', en: 'At the bakery, ask for what you want, and how many. Start with “Mag ik”.' },
      need: [
        { what: { fr: 'commence par « mag ik »', en: 'starts with “mag ik”' }, rx: '^\\s*mag\\s+ik\\b', miss: 'Ik wil twee pistolets, alstublieft.' },
        { what: { fr: 'dit combien', en: 'says how many' }, any: ['een', 'twee', 'drie', 'vier', 'vijf', 'zes'], miss: 'Mag ik pistolets, alstublieft?' },
        { what: { fr: 'au moins 4 mots', en: 'at least 4 words' }, min: 4, miss: 'Mag ik twee?' }
      ],
      model: 'Mag ik drie pistolets, alstublieft?'
    };
    const why = (patch, id) => {
      const r = JSON.parse(JSON.stringify(BAKKER));
      if (patch) patch(r);
      return K.check(r, rowOf(id || 'bakker:p1'), ctx);
    };
    same(why(), [], 'la ligne de la boulangerie passe');
    const N1 = 'need 1 « starts with “mag ik” »', N2 = 'need 2 « says how many »', N3 = 'need 3 « at least 4 words »';
    const name = U.words(CO.NL.content.DEFAULTS.naam)[0].toLowerCase();
    [
      [r => { r.need = [r.need[0]]; }, ['need is a list of 2 to 4 needs'], 'deux à quatre besoins'],
      [r => { r.need[0].flags = 'i'; }, ['need 1: unknown field flags'], 'un besoin n\'a pas de champ inconnu'],
      [r => { r.need[0].min = 4; }, ['need 1: exactly one of rx, any and min'], 'un besoin se note d\'une seule façon'],
      [r => { r.need[0].miss = ''; }, ['need 1: miss is one line of Dutch'], 'chaque besoin a sa réponse manquée'],
      [r => { r.need[2].min = 2; r.need[2].what = { fr: 'au moins 2 mots', en: 'at least 2 words' }; }, ['need 3: min is a whole number from 3 to 12'], 'min va de 3 à 12'],
      [r => { r.need[2].what.en = 'at least four words'; }, ['need 3: its what names its number, 4, in fr and in en'], 'le what d\'un min dit son nombre'],
      [r => { r.need.pop(); }, ['one need is a min, and only one: 0 are'], 'un besoin est un min'],
      [r => { r.model = 'Ja, twee pistolets, alstublieft.'; }, ['the model « Ja, twee pistolets, alstublieft. » does not meet ' + N1], 'l\'exemple remplit chaque besoin, par le barème de la séance'],
      [r => { r.model = 'Mag ik twee pistolets?'; }, ['the model is the phrase itself: a task asks for an answer of the learner\'s own'], 'l\'exemple n\'est pas la phrase'],
      [r => { r.need[1].miss = 'Mag ik twee pistolets?'; }, [N2 + ': its miss « Mag ik twee pistolets? » meets it'], 'une réponse manquée manque son besoin'],
      [r => { r.need[2].miss = 'Mag ik?'; }, [N3 + ': its miss « Mag ik? » also fails ' + N2 + ': a miss fails its own need alone'], 'et lui seul'],
      [r => { r.model = 'Mag ik drie pistolets? Ik heb goesting.'; }, ['the model uses « goesting », which unit 12 (weekend) teaches, after this phrase\'s unit 4'], 'l\'exemple n\'emploie rien que le cours enseigne plus tard'],
      [r => { r.model = 'Mag ik drie pistolets, zqx?'; }, ['the model writes « zqx », which is not a known Dutch form'], 'l\'exemple s\'épelle'],
      [r => { r.ask.fr = 'À {stad}, demande. Commence par « Mag ik ».'; }, ['a task holds no { } token'], 'aucun jeton'],
      [r => { r.ask.fr = name + ' demande. Commence par « Mag ik ».'; r.ask.en = name + ' asks. Start with “Mag ik”.'; },
        ['fr', 'en'].map(() => '« ' + name + ' » is a default name: a task holds no name of a learner, a town or a company'), 'aucun nom par défaut'],
      [r => { r.ask.en = 'At the bakery, ask for what you want, and how many.'; }, ['ask: fr quotes ["Mag ik"], en quotes []: both sides quote the same Dutch, in the same order'], 'fr et en citent le même néerlandais'],
      [r => { r.ask.en = 'Start with "Mag ik".'; }, ['ask: en quotes with “ ” only'], 'en cite entre “ ”'],
      [r => { r.ask.fr = 'Commence par « Mag « ik ».'; }, ['ask: a quote inside a quote'], 'une citation se ferme'],
      [r => { r.ask.fr = 'Commence par « Mag ik », jamais par « goesting ».'; r.ask.en = 'Start with “Mag ik”, never with “goesting”.'; },
        ['ask: « goesting » is quoted, and the course has not taught it by this unit: a quote holds taught Dutch, and a translation goes in parentheses'], 'une citation tient du néerlandais déjà enseigné'],
      [r => { r.ask.fr = 'Demande 2 ou 3 pistolets. Commence par « Mag ik ».'; r.ask.en = 'Ask for some. Start with “Mag ik”.'; }, ['ask: fr has the numbers [2 3], en []'], 'fr et en ont les mêmes nombres'],
      [r => { r.ask.fr = 'Commence par « Mag ik », et demande des pistolets.'; r.ask.en = 'Start with “Mag ik”, and ask for pistolets.'; },
        ['ask: « pistolets » is Dutch the course has, written bare in fr and in en: quote it, or reword'], 'un mot du cours écrit des deux côtés se cite']
    ].forEach(([patch, want, m]) => same(why(patch), want, 'Check : ' + m));
    /* Les règles que d'autres raisons recouvrent : la phrase est cherchée parmi les raisons. */
    const has = (patch, line, m) => ok(why(patch).indexOf(line) >= 0, 'Check : ' + m + ' : ' + JSON.stringify(why(patch)));
    const SAME = r => { r.need[1].what = JSON.parse(JSON.stringify(r.need[0].what)); };
    has(r => { r.model = 'Mag ik.'; }, 'the model has fewer than 3 words: the session judges no shorter answer', 'l\'exemple a au moins 3 mots');
    has(SAME, 'need 2: its fr what is another need\'s', 'deux besoins n\'ont pas le même what (fr)');
    has(SAME, 'need 2: its en what is another need\'s', 'deux besoins n\'ont pas le même what (en)');
    [
      [r => { r.ask = 'Mag ik'; }, 'ask is { "fr": …, "en": … }, each one line', 'ask est une paire'],
      [r => { r.model = ['Mag ik']; }, 'model is one line of Dutch', 'l\'exemple est une ligne'],
      [r => { r.need[0] = 4; }, 'need 1 is an object', 'un besoin est un objet'],
      [r => { r.need[0].rx = 4; }, 'need 1: rx is the source of a regular expression, a string', 'un rx est une chaîne'],
      [r => { r.need[1].any = []; }, 'need 2: any is a list of words or runs of words', 'any est une liste de mots'],
      [r => { r.ask.fr = 'Commence par » Mag ik.'; }, 'ask: a » with no « before it', 'un » sans «'],
      [r => { r.ask.fr = 'Commence par « Mag ik.'; }, 'ask: a « never closed', 'un « se ferme'],
      [r => { r.ask.fr = 'Commence par « » Mag ik.'; }, 'ask: an empty quote', 'une citation n\'est pas vide']
    ].forEach(([patch, line, m]) => has(patch, line, m));
    ok(/^need 1: rx « \(mag » does not compile: /.test(why(r => { r.need[0].rx = '(mag'; }).join('|')), 'Check : un rx se compile');
    same(why(null, 'overleven:p1'), ['the model uses « drie », which unit 3 (tijd) teaches, after this phrase\'s unit 1',
      'the model uses « pistolets », which unit 4 (bakker) teaches, after this phrase\'s unit 1'], 'Check : l\'unité est celle de la ligne d\'entrée');

    /* Le verdict : un keep porte deux bonnes réponses du relecteur, que la tâche accepte. */
    const RIGHT = ['Mag ik een koffiekoek en twee pistolets?', 'Mag ik vier pistolets hebben?'];
    const verdict = (v, right) => K.checkVerdict(Object.assign({ id: 'bakker:p1', verdict: v }, right ? { right } : {}), BAKKER, rowOf('bakker:p1'), ctx);
    const TWO = 'a keep carries right: two right answers of the reader\'s own, each one line of Dutch';
    same([verdict('keep', RIGHT), verdict('dispute: trop vague')], [[], []], 'un keep porte right, une contestation non');
    same([verdict('keep'), verdict('keep', RIGHT.slice(1)), verdict('dispute: trop vague', RIGHT)], [[TWO], [TWO], ['only a keep carries right']],
      'un keep sans ses deux réponses est refusé, une contestation qui en porte aussi');
    same(verdict('keep', [BAKKER.model, RIGHT[1]]), ['right answer 1 « Mag ik drie pistolets, alstublieft? » is the model: write one of your own'], 'une bonne réponse n\'est pas l\'exemple');
    same(verdict('keep', [RIGHT[1], 'mag ik vier pistolets hebben']), ['the two right answers are the same answer'], 'les deux réponses diffèrent');
    ok(verdict('keep', [RIGHT[1], 'Ja ja']).indexOf('right answer 2 « Ja ja » has fewer than 3 words: the session judges no shorter answer') >= 0, 'une bonne réponse a au moins 3 mots');
    same(verdict('keep', [RIGHT[1], 'Ik wil vier pistolets, alstublieft.']),
      ['right answer 2 « Ik wil vier pistolets, alstublieft. » does not meet ' + N1 + ': the task would reject a right answer'], 'une bonne réponse que la tâche refuse est nommée');

    /* Split refuse une phrase à jeton et un id qui n'est plus une phrase du cours. */
    const withSources = f => Object.assign({}, CO, { sources: f(CO.sources.map(x => Object.assign({}, x))) });
    throws(() => K.split(withSources(a => { a.find(x => x.id === 'bakker:p1').nl = 'Mag ik {naam}?'; return a; }), ctx),
      /^bakker:p1 « Mag ik \{naam\}\? » holds a token: a task is the same for every learner$/, 'Split refuse une phrase à jeton');
    throws(() => K.split(withSources(a => a.filter(x => x.id !== 'bakker:p1')), ctx),
      /^bakker:p1 is no phrase of the course$/, 'Split refuse un id qui n\'est plus une phrase');

    /* Par les outils : une ligne fautive, puis deux lots écrits et relus, puis Merge. Chaque
       ligne faite à la main dit « ja » puis la phrase ; la boulangerie est la vraie. */
    const made = r => {
      if (r.id === 'bakker:p1') return BAKKER;
      const w = U.words(r.nl), n = w.length + 1;
      return {
        id: r.id, stamp: r.stamp,
        ask: { fr: 'Réponds « ja », puis redis la phrase.', en: 'Answer “ja”, then say the phrase again.' },
        need: [
          { what: { fr: 'commence par « ja »', en: 'starts with “ja”' }, rx: '^\\s*ja\\b', miss: r.nl + ' Ja.' },
          { what: { fr: 'au moins ' + n + ' mots', en: 'at least ' + n + ' words' }, min: n, miss: 'Ja, ' + w.slice(0, -1).join(' ') }
        ],
        model: 'Ja, ' + r.nl
      };
    };
    const right = r => (r.id === 'bakker:p1' ? RIGHT : ['Ja ja, ' + r.nl, 'Ja, ' + r.nl + ' Ja.']);
    LOTS.forEach((b, i) => put(path.join(KD, b), 'draft.json', inputs[i].map(made)));
    const EEN = path.join(KD, 'units-1-6');
    put(EEN, 'draft.json', inputs[0].map(r => (r.id === 'bakker:p1' ? Object.assign({}, BAKKER, { model: 'Ja, twee pistolets, alstublieft.' }) : made(r))));
    same(runOp('check.js', [EEN]), { code: 1, lines: ['ok input.json 18 rows', 'fail draft.json bakker:p1: the model « Ja, twee pistolets, alstublieft. » does not meet ' + N1] },
      'check.js nomme la ligne fautive et sa raison');
    put(EEN, 'draft.json', inputs[0].map(made));
    LOTS.forEach((b, i) => put(path.join(KD, b), 'review.json', inputs[i].map(r => ({ id: r.id, verdict: 'keep', right: right(r) }))));
    put(EEN, 'review.json', inputs[0].map(r => ({ id: r.id, verdict: 'keep', right: r.id === 'bakker:p1' ? [RIGHT[0], 'Ik wil vier pistolets, alstublieft.'] : right(r) })));
    same(runOp('check.js', [EEN]).lines.slice(-1), ['fail review.json bakker:p1: right answer 2 « Ik wil vier pistolets, alstublieft. » does not meet ' + N1 + ': the task would reject a right answer'],
      'check.js relit les bonnes réponses du relecteur par le barème');
    put(EEN, 'review.json', inputs[0].map(r => ({ id: r.id, verdict: 'keep', right: right(r) })));
    LOTS.forEach(b => same(runOp('check.js', [path.join(KD, b)]), { code: 0, lines: ['ok input.json 18 rows', 'ok draft.json 18 rows', 'ok review.json 18 keep, 0 dispute'] },
      'les lignes faites à la main passent Check : ' + b));

    /* Merge écrit chaque tâche sous le néerlandais de sa phrase, son rx en expression régulière. */
    const OPEN = path.join(OP, 'src', 'content', 'open.phrases.js');
    const MERGED = { code: 0, lines: ['ok open 36 taken, 0 dropped', 'ok open.phrases.js 36 set, 0 removed'] };
    same(runOp('merge.js', [OP, KD]), MERGED, 'Merge prend les 36 lignes');
    const written = text(OPEN);
    ok(written.indexOf('\'Mag ik twee pistolets?\': { ask: { fr: \'À la boulangerie, demande ce que tu veux, et combien. Commence par « Mag ik ».\', ' +
      'en: \'At the bakery, ask for what you want, and how many. Start with “Mag ik”.\' }, need: [{ what: { fr: \'commence par « mag ik »\', en: \'starts with “mag ik”\' }, ' +
      'rx: /^\\s*mag\\s+ik\\b/i, miss: \'Ik wil twee pistolets, alstublieft.\' }') >= 0, 'un rx s\'écrit en expression régulière, drapeau i');
    const back = table.load(OPEN).entries;
    same(Object.keys(back), all.map(r => CO.byId(r.id).nl).sort(), 'une clé par phrase, sous son néerlandais, triées');
    same(runOp('merge.js', [OP, KD]), MERGED, 'Merge se relance');
    same(text(OPEN), written, 'relancé, Merge redonne les mêmes octets');

    /* L'app pose la tâche sur la phrase, son rx gardé, et la séance accepte l'exemple. */
    const CM = course(OP), item = CM.NL.content.allItems().find(it => it.id === 'bakker:p1');
    ok(Object.prototype.toString.call(item.open.need[0].rx) === '[object RegExp]', 'le rx de la phrase est une expression régulière une fois posé');
    same(CM.NL.ex.rubric(item.open, item.open.model).length, 3, 'la séance accepte l\'exemple');
    same(CM.NL.ex.rubric(item.open, RIGHT[1]).length, 3, 'et une bonne réponse du relecteur');
    console.log('  genre open     36 phrases en 2 lots, ' + Object.keys(back).length + ' tâches écrites, rx en expression régulière');
  }

  /* ==================================================== les genres d'explications */
  {
    /* tools/content/kinds/explanations-be.js et explanations.js, dans un dépôt à eux sous la
       copie, avec test/data (l'orthographe) et un extrait du Wiktionnaire d'une ligne. Trois
       sources de l'essai y sont fixées, quoi que le cours leur donne plus tard : « Ik ben
       Nederlands aan het leren. » et hallo gardent leur forme flamande, et « het gemeentehuis »
       n'en a pas. */
    const EX = path.join(TMP, 'explications');
    ['build.sh', 'src', 'test/lib', 'test/data', 'tools'].forEach(p => fs.cpSync(path.join(ROOT, p), path.join(EX, p), { recursive: true }));
    const X = require(path.join(EX, 'tools', 'content', 'lib', 'explain'));
    const runEx = (script, args) => {
      const r = spawnSync(process.execPath, [path.join(EX, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
      return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
    };
    const LEREN = C.byId('overleven:p0').nl, HALLO = C.byId('overleven:w0').nl, HUIS = C.byId('thuis:w12').nl;
    const BE = path.join(EX, 'src', 'content', 'be.js'), fixed = {};
    fixed[LEREN] = 'Ik ben Nederlands aan het leren, hè.';
    fixed[HALLO] = 'hey, salut';
    fixed[HUIS] = null;
    table.update(BE, fixed);
    const EXTRACT = path.join(EX, '.cache', 'kaikki', 'belgian.tsv');
    fs.mkdirSync(path.dirname(EXTRACT), { recursive: true });
    fs.writeFileSync(EXTRACT, '# kaikki/nl.jsonl sha256 ' + cache.PINS['kaikki/nl.jsonl'].sha256 + '\ngemeentehuis\tnoun\tBelgium\t(essai)\n');
    const CE = course(EX), NLE = CE.NL;

    /* Les lots : les mots, puis les phrases, de explanations-be, par unités entières ; un lot par
       unité pour explanations. */
    const mk = (u, n) => Array.from({ length: n }, (x, i) => ({ id: u + i, unit: u }));
    const sizes = r => r.map(b => b.batch + ' ' + b.rows.length);
    same([sizes(X.chunks('be-words', mk('a', 30).concat(mk('b', 15)))), sizes(X.chunks('be-words', mk('a', 20).concat(mk('b', 20), mk('c', 5)))),
      sizes(X.chunks('be-words', mk('a', 50).concat(mk('b', 3)))), sizes(X.chunks('be-phrases', mk('a', 3)))],
    [['be-words-1 30', 'be-words-2 15'], ['be-words-1 40', 'be-words-2 5'], ['be-words-1 50', 'be-words-2 3'], ['be-phrases 3']],
    'un lot tient 40 lignes au plus, sans couper une unité');
    const BED = path.join(EX, 'drafts', 'explanations-be'), RD = path.join(EX, 'drafts', 'explanations');
    const be = CE.sources.filter(s => X.flemish(s, NLE)), rest = CE.sources.filter(s => !X.flemish(s, NLE));
    same([be.length + rest.length, be.every(s => s.be && NLE.util.norm(s.be) !== NLE.util.norm(s.nl))], [CE.sources.length, true],
      'chaque source est d\'un genre, et explanations-be a celles dont la forme flamande n\'est pas le néerlandais');
    const beSplit = runEx('split.js', [EX, BED]);
    const perKind = k => beSplit.lines.filter(l => l.indexOf('be-' + k + 's') === 0);
    const total = ls => ls.reduce((n, l) => n + Number(l.split(' ')[1]), 0);
    ok(beSplit.code === 0 && beSplit.lines.every(l => /^be-(words|phrases)(-\d+)? \d+$/.test(l)) && perKind('word').length + perKind('phrase').length === beSplit.lines.length,
      'Split de explanations-be coupe des lots be-words et be-phrases : ' + JSON.stringify(beSplit));
    same([total(perKind('word')), total(perKind('phrase'))], [be.filter(s => s.kind === 'word').length, be.filter(s => s.kind === 'phrase').length],
      'les mots et les phrases de explanations-be, chacun une fois');
    const want = CE.RAW.units.map(u => [u.id, rest.filter(s => s.unit === u.id).length]).filter(x => x[1]).map(x => x.join(' '));
    same(runEx('split.js', [EX, RD]), { code: 0, lines: want }, 'Split de explanations coupe un lot par unité');
    const rowIn = (dir, id) => {
      const b = text(path.join(dir, 'split.txt')).split('\n').filter(Boolean).map(l => l.split(' ')[0])
        .find(x => JSON.parse(text(path.join(dir, x, 'input.json'))).some(r => r.id === id));
      return JSON.parse(text(path.join(dir, b, 'input.json'))).find(r => r.id === id);
    };
    const leren = CE.byId('overleven:p0'), huis = CE.byId('thuis:w12');
    same(rowIn(BED, 'overleven:p0'), {
      id: 'overleven:p0', stamp: kit.stamp(kit.loadKind(EX, 'explanations-be'), leren, NLE), copies: [],
      nl: LEREN, kind: 'phrase', unit: 'overleven', be: 'Ik ben Nederlands aan het leren, hè.', meaning: NLE.gloss.meaning(leren),
      note: leren.note || null, also: [], siblings: [], vlaams: true, right: 'Ik ben Nederlands aan het leren, hè.', labelled: null
    }, 'une ligne de explanations-be : la source, son sens, sa note, ses « on dit aussi », et la réponse de « Comment le dit-on ici ? »');
    same(rowIn(RD, 'thuis:w12'), {
      id: 'thuis:w12', stamp: kit.stamp(kit.loadKind(EX, 'explanations'), huis, NLE), copies: [],
      nl: HUIS, kind: 'word', unit: 'thuis', be: null, meaning: NLE.gloss.meaning(huis),
      note: huis.note || null, also: [], siblings: [], vlaams: false, right: null, labelled: ['noun (Belgium): (essai)']
    }, 'une ligne de explanations : sans forme flamande ni exercice, et les sens belges que l\'extrait donne au mot');
    same(rowIn(RD, 'overleven:w2').siblings.map(s => s.nl), ['de dag'], 'les frères de sens d\'une source sont dans sa ligne');

    /* Check : la note, ses langues et ses citations. */
    const KB = require(path.join(EX, 'tools', 'content', 'kinds', 'explanations-be'));
    const KR = require(path.join(EX, 'tools', 'content', 'kinds', 'explanations'));
    const ctxB = { repo: EX, course: () => CE }, ctxR = { repo: EX, course: () => CE };
    /* Une ligne écrite : sa note, aucun « on dit aussi », et deux leurres quand « Comment le dit-on
       ici ? » pose la source. Les leurres sont des fautes d'apprenant, proches du néerlandais. */
    const DECOYS = { 'overleven:w0': ['hai', 'helo'], 'overleven:p0': ['Ik zijn Nederlands aan het leren, hè.', 'Ik ben Nederlands an het leren, hè.'] };
    const line = (id, note) => Object.assign({ id, note, also: [] }, DECOYS[id] ? { decoys: DECOYS[id] } : {});
    const why = (fr, en) => KB.check(line('overleven:p0', { fr, en }), rowIn(BED, 'overleven:p0'), ctxB);
    const GOOD = ['Le « hè » final cherche ton accord, comme « toch ».', 'The final “hè” asks you to agree, like “toch”.'];
    same(why(GOOD[0], GOOD[1]), [], 'une note juste passe');
    same(KR.check(line('thuis:w12', { fr: 'Où tu vas pour tout ce qui est administratif à {stad}.', en: 'Where you go for anything administrative in {stad}.' }),
      rowIn(RD, 'thuis:w12'), ctxR), [], 'un jeton {stad} n\'est pas du néerlandais nu');
    const shape = ['note is { "fr": …, "en": … }, each a text with no space at either end'];
    same([KB.check(line('overleven:p0', { fr: GOOD[0] }), rowIn(BED, 'overleven:p0'), ctxB), why(GOOD[0], null), why(' ' + GOOD[0], GOOD[1]),
      KB.check(line('overleven:p0', GOOD[0]), rowIn(BED, 'overleven:p0'), ctxB)], [shape, shape, shape, shape],
    'une note est une paire fr, en, deux textes sans blanc autour');
    const LONG = GOOD[0] + ' ' + 'x'.repeat(120);
    same(why(LONG, GOOD[1]), ['note.fr is ' + Array.from(LONG).length + ' characters: at most 160'], '160 caractères au plus');
    same(why('Le <b>final</b>.', 'The "final".'), ['note.fr holds <, a newline or a straight quote "', 'note.en holds <, a newline or a straight quote "'],
      'ni balise, ni retour à la ligne, ni guillemet droit');
    same(why(GOOD[0], 'The final « hè » asks you to agree, like “toch”.'), ['note.en quotes with “ ” only'], 'chaque langue a ses guillemets');
    same(why('Le « hè final cherche ton accord.', GOOD[1]), ['note.fr has a quote mark without its pair, a quote inside a quote, or an empty quote'],
      'un guillemet a sa paire');
    same(why('Un. Deux. Trois.', 'One. Two. Three.'), ['note.fr has 3 sentences: at most 2', 'note.en has 3 sentences: at most 2'], 'deux phrases au plus');
    same(why('Comme « hè. Toch. Ja. ».', 'Like “hè. Toch. Ja.”.'), [], 'la ponctuation d\'une citation ne fait pas de phrase');
    const NAAM = NLE.content.DEFAULTS.naam;
    same(why('Dis-le à ' + NAAM + '.', 'Say it to ' + NAAM + '.'), ['fr', 'en'].map(l => 'note.' + l + ' names « ' + NAAM + ' »: write {naam}'),
      'un nom par défaut s\'écrit en jeton');
    same(why(NLE.gloss.meaning(leren).fr, NLE.gloss.meaning(leren).en), ['note.fr only repeats the meaning', 'note.en only repeats the meaning'], 'une note ne redit pas le sens');
    same(why(GOOD[0], 'The final “hè” asks avec you to agree, like “toch”.'), ['note.en uses French words outside quotes: « avec »'], 'pas de français dans l\'anglais');
    same(why('Le « hè » final cherche ton accord, with « toch ».', GOOD[1]), ['note.fr uses English words outside quotes: « with »'], 'pas d\'anglais dans le français');
    same(why('Le « hè » final, 2 fois.', 'The final “hè”, three times.'), ['note.fr and note.en hold different digits or {…} tokens'], 'les mêmes chiffres et les mêmes jetons');
    same(why('Le « hè » final cherche ton accord.', 'The final “toch” asks you to agree.'),
      ['note.fr and note.en quote different Dutch: only en « toch »; only fr « hè »'], 'les deux langues citent le même néerlandais');
    same(why('Le « hè » final, comme « voilà ».', 'The final “hè”, like “voilà”.'),
      ['« voilà » is quoted, but « voilà » is not Dutch that OpenTaal, flemish.tsv or this row knows: quotes hold Dutch only, a translation goes in parentheses'],
      'une citation ne tient que du néerlandais');
    same(why('Ajoute hè à la fin.', 'Add hè at the end.'), ['« hè » is Dutch of the course, outside quotes in fr and in en: quote it, or say it another way'],
      'le néerlandais du cours se cite');
    same(why('Ajoute « hè » à la fin, comme hè.', 'Add “hè” at the end.'), [], 'un mot nu dans une seule langue passe : 6d.4 ne le voit pas');

    /* Check : les « on dit aussi » de chaque ligne, et les leurres d'une ligne que « Comment le
       dit-on ici ? » pose. hallo tient déjà dag, qui n'est pas de son sens : une forme que la source
       tient déjà reste. ja a une forme flamande, mais la première est le néerlandais : l'exercice
       ne le pose pas. */
    const HALLO_IN = rowIn(BED, 'overleven:w0'), JA_IN = rowIn(BED, 'overleven:w7');
    same([HALLO_IN.vlaams, HALLO_IN.right, HALLO_IN.also, JA_IN.vlaams], [true, 'hey', ['dag'], false],
      'hallo a l\'exercice, sa réponse hey, et un « on dit aussi » ; ja n\'a pas l\'exercice');
    const rule = (id, extra) => {
      const r = id === 'thuis:w12';
      return (r ? KR : KB).check(Object.assign(line(id, { fr: GOOD[0], en: GOOD[1] }), extra), rowIn(r ? RD : BED, id), r ? ctxR : ctxB);
    };
    same(['overleven:w0', 'overleven:p0', 'overleven:w7', 'thuis:w12'].map(id => rule(id, {})), [[], [], [], []],
      'une ligne juste passe : sa note, ses « on dit aussi », et deux leurres quand l\'exercice la pose');
    const listOf = ['also is a list of Dutch forms, [] for none, each a text on one line with no space at either end'];
    same([rule('thuis:w12', { also: 'het stadhuis' }), rule('thuis:w12', { also: [' het stadhuis'] }), rule('thuis:w12', { also: [''] }), rule('thuis:w12', { also: [3] })],
      [listOf, listOf, listOf, listOf], 'also est une liste de formes');
    same(rule('overleven:w7', { also: ['ja', 'jaja', 'jawel, jazeker', 'oké / goed', 'oké; goed'] }), [
      'also « ja » is the Dutch itself',
      'also « jaja » is a Flemish form in be.js',
      'also « jawel, jazeker » holds more than one form: one form per entry',
      'also « oké / goed » holds more than one form: one form per entry',
      'also « oké; goed » holds more than one form: one form per entry'
    ], 'ni le néerlandais, ni une forme flamande, et une forme par entrée');
    same(rule('thuis:w12', { also: ['het stadhuis', 'het Stadhuis', 'raadhuis', 'het stadhuus'] }), [
      'also lists « het Stadhuis » twice',
      'also « raadhuis » drops the article of « het gemeentehuis »',
      'also « het stadhuus »: « stadhuus » is not Dutch that OpenTaal or flemish.tsv knows: leave it out, and say why in unsure if it is Flemish'
    ], 'une forme une fois, un nom garde son article, et l\'orthographe de test/content.js');
    same(rule('overleven:p0', { also: ['Ik leer Nederlands, hè.'] }).filter(r => /more than one form/.test(r)), [], 'une virgule est permise dans une phrase');
    const stad = { fr: 'Dit « stadhuus » is een vorm.', en: 'Say “stadhuus” here.' };
    const quoted = r => r.filter(x => /is quoted/.test(x));
    same([quoted(rule('thuis:w12', { also: ['het stadhuus'], note: stad })), quoted(rule('thuis:w12', { note: stad })).length],
      [[], 1], 'une note peut citer une forme que seul le « on dit aussi » de la ligne porte');
    same([rule('overleven:w0', { also: ['dag', 'goeiedag'] }), rule('overleven:w7', { also: ['dag'] })],
      [[], ['also « dag » is the Dutch of overleven:w2, which is not of the same sense: an answer to one is not right for the other']],
      'le néerlandais d\'un autre élément, seulement s\'il est du même sens ou si la source le tient déjà');
    const pair = ['decoys is two wrong answers to « Comment le dit-on ici ? », each a text on one line with no space at either end'];
    same([rule('overleven:w0', { decoys: undefined }), rule('overleven:w0', { decoys: ['hai'] }), rule('overleven:w0', { decoys: ['hai', 'helo', 'hoi'] }),
      rule('overleven:w0', { decoys: ['hai', ' helo'] })], [pair, pair, pair, pair], 'deux leurres quand l\'exercice pose la source');
    same(rule('overleven:w7', { decoys: ['jo', 'jaa'] }), ['decoys are for a row that « Comment le dit-on ici ? » asks (vlaams), and this one is not'],
      'pas de leurres sans l\'exercice');
    same(rule('overleven:w0', { decoys: ['hai', 'Hai'] }), ['decoys « hai » and « Hai » are one answer'], 'deux leurres distincts');
    same([rule('overleven:w0', { also: ['dag', 'hoi'], decoys: ['ja', 'hoi'] }), rule('overleven:p0', { decoys: [LEREN, 'Ik ben Nederlands an het leren, hè.'] })], [[
      'decoy « ja » is an answer the course accepts, for overleven:w7',
      'decoy « hoi » is an answer the course accepts, for overleven:w0'
    ], ['decoy « Ik ben Nederlands aan het leren. » is an answer the course accepts, for overleven:p0']],
    'un leurre n\'est une réponse juste pour aucun élément, ni pour sa source avec les « on dit aussi » que la ligne lui donne');
    same(rule('overleven:p0', { decoys: ['Ik zijn Nederlands aan het leren, hè', 'Nederlands ben ik aan het leren, hè.'] }), [
      'decoy « Ik zijn Nederlands aan het leren, hè » ends with no punctuation, and the answer with « . »',
      'decoy « Nederlands ben ik aan het leren, hè. » is further from the Dutch than the answer: 0.50, at least 0.76'
    ], 'un leurre finit comme la réponse, et reste une faute proche du néerlandais');
    same(rule('overleven:w0', { decoys: ['h', 'hallootje'] }), [
      'decoy « h » is 1 character: 2 to 4, the length of the answer « hey » give or take 40%',
      'decoy « hallootje » is 9 characters: 2 to 4, the length of the answer « hey » give or take 40%'
    ], 'un leurre a la longueur de la réponse, à 40 % près');
    const N = { fr: GOOD[0], en: GOOD[1] };
    same([KB.readWhole(line('overleven:w0', N), HALLO_IN), KB.readWhole(Object.assign(line('overleven:w0', N), { also: ['dag'] }), HALLO_IN),
      KB.readWhole(Object.assign(line('overleven:w0', N), { also: ['dag', 'hoi'] }), HALLO_IN)], ['', '', 'new also'],
    'le relecteur lit en entier la ligne qui ajoute un « on dit aussi »');
    same(['explanations-be', 'explanations'].map(k => { const K = kit.loadKind(EX, k); return [K.fields, K.optional, K.tables]; }),
      [[['note', 'also'], ['decoys'], ['notes', 'also', 'decoys']], [['note', 'also'], [], ['notes', 'also']]],
      'chaque ligne porte sa note et ses « on dit aussi », et une ligne de explanations-be ses leurres');
    same([KB.merge(line('overleven:w7', N)), KB.merge(line('overleven:w0', N)), KR.merge(Object.assign(line('thuis:w12', N), { also: ['het stadhuis'] }))],
      [{ notes: N, also: null, decoys: null }, { notes: N, also: null, decoys: DECOYS['overleven:w0'] }, { notes: N, also: ['het stadhuis'] }],
      'Merge écrit la note, les « on dit aussi » et les leurres ; une liste vide ou pas de leurres ôtent la clé');

    /* De bout en bout, sur deux sources : be.js ne garde que les deux formes flamandes fixées,
       puis Split, chaque lot rédigé et relu, check.js, Merge, et Merge relancée. */
    const gone = {};
    Object.keys(table.load(BE).entries).forEach(k => { if (k !== LEREN && k !== HALLO) gone[k] = null; });
    table.update(BE, gone);
    const E2E = path.join(EX, 'bout-en-bout', 'explanations-be');
    same(runEx('split.js', [EX, E2E]), { code: 0, lines: ['be-words 1', 'be-phrases 1'] }, 'Split de explanations-be ne coupe que les deux sources gardées');
    const NOTE = { fr: 'Une note d’essai sur cette source.', en: 'A trial note on this source.' };
    const batches = ['be-words', 'be-phrases'];
    batches.forEach(b => {
      const dir = path.join(E2E, b), inp = JSON.parse(text(path.join(dir, 'input.json')));
      put(dir, 'draft.json', inp.map(r => Object.assign(line(r.id, r.id === 'overleven:p0' ? { fr: GOOD[0], en: GOOD[1] } : NOTE), { stamp: r.stamp, also: r.also })));
      put(dir, 'review.json', inp.map(r => ({ id: r.id, verdict: 'keep' })));
    });
    const PHR = path.join(E2E, 'be-phrases');
    const draft = text(path.join(PHR, 'draft.json'));
    put(PHR, 'draft.json', draft.replace('“toch”', '“hein”'));
    same(runEx('check.js', [PHR]).lines.filter(l => /^fail /.test(l)), [
      'fail draft.json overleven:p0: note.fr and note.en quote different Dutch: only en « hein »; only fr « toch »',
      'fail review.json -: draft.json missing or failing'
    ], 'check.js dit les raisons du genre');
    put(PHR, 'draft.json', draft);
    same(runEx('check.js', [PHR]).code, 0, 'le lot rédigé et relu passe');
    const NOTES = path.join(EX, 'src', 'content', 'notes.js');
    /* Les tables tiennent déjà ce que les genres ont fusionné avant : Merge n'en change que les clés
       de ses deux sources. */
    const keys = f => Object.keys(table.load(path.join(EX, 'src', 'content', f)).entries).sort();
    const was = { also: keys('also.js'), decoys: keys('decoys.js') };
    same(runEx('merge.js', [EX, E2E]), { code: 0, lines: ['ok explanations-be 2 taken, 0 dropped', 'ok notes.js 2 set, 0 removed',
      'ok also.js 1 set, ' + (was.also.indexOf(LEREN) >= 0 ? 1 : 0) + ' removed', 'ok decoys.js 2 set, 0 removed'] },
    'Merge écrit chaque note dans notes.js, les « on dit aussi » dans also.js et les leurres dans decoys.js');
    const notes = table.load(NOTES).entries, also = table.load(path.join(EX, 'src', 'content', 'also.js')).entries;
    const decoys = table.load(path.join(EX, 'src', 'content', 'decoys.js')).entries;
    same([notes[LEREN], notes[HALLO]], [{ fr: GOOD[0], en: GOOD[1] }, NOTE], 'notes.js tient chaque note sous le néerlandais de sa source');
    same([also[HALLO], also[LEREN], keys('also.js')], [['dag'], undefined, Array.from(new Set(was.also.concat(HALLO))).filter(k => k !== LEREN).sort()],
      'also.js tient les « on dit aussi » de hallo, rien pour une liste vide, et ses autres clés');
    same([decoys[LEREN], decoys[HALLO], keys('decoys.js')], [DECOYS['overleven:p0'], DECOYS['overleven:w0'], Array.from(new Set(was.decoys.concat(LEREN, HALLO))).sort()],
      'decoys.js tient les deux leurres de chaque source, et ses autres clés');
    const notesAfter = text(NOTES), again = runEx('merge.js', [EX, E2E]), CA = course(EX);
    same(again, { code: 1, lines: ['overleven:w0', 'overleven:p0'].map(id => 'fail explanations-be ' + id + ': stale, stamped ' + rowIn(E2E, id).stamp +
      ' at Split, the source now stamps ' + kit.stamp(kit.loadKind(EX, 'explanations-be'), CA.byId(id), CA.NL)) },
    'le tampon couvre la note : relancée après un succès, Merge refuse comme périmée chaque ligne dont elle a écrit la note');
    ok(text(NOTES) === notesAfter, 'refusée, Merge n\'écrit rien');
    /* Les leurres et les « on dit aussi » s'écrivent à l'écran en néerlandais, sans passer par la table
       de texte : test/lang.js (3a) les lit comme le néerlandais du cours, que dutchWords donne. */
    const { dutchWords } = require(path.join(EX, 'test', 'lib', 'dutch'));
    CA.NL.content.byDutch.also[HALLO] = ['dag', 'hoezee'];
    same(['hai', 'helo', 'an', 'hoezee'].filter(w => !dutchWords(CA.NL).has(w)), [], 'les mots des leurres et des « on dit aussi » sont du néerlandais du cours');
    console.log('  explanations   ' + beSplit.lines.length + ' + ' + want.length + ' lots, ' + be.length + ' + ' + rest.length + ' lignes ; la note et ses citations, les « on dit aussi », les leurres ; Merge');
  }

  /* ==================================================== 9. l'outil de lecture
     Un bloc : ses noms ne croisent pas ceux des sections que d'autres tâches ajoutent. */
  {
    const reading = require(path.join(LIB, 'reading'));
    const G = C.NL.gloss, WS = path.join(TMP, 'lecture-ws');
    const head = id => '- `' + C.byId(id).nl + '` (' + id + ') — ' + G.LANGS.map(l => G.of(C.byId(id), l)).join(' · ');
    const part = (lines, name) => {
      const a = lines.indexOf('## ' + name);
      let b = a + 1;
      while (b < lines.length && !/^## /.test(lines[b])) b++;
      return lines.slice(a, b);
    };

    /* L'espace de travail : le genre d'essai tel que la section 6 l'a fondu, le genre vide, et
       deux genres écrits ici. « lecture » prend les 25 premiers mots en deux lots, tous gardés,
       et un mot de plus d'un mot s'y lit en entier ; « exemples » donne des phrases, ou une
       raison de n'en pas donner (« skip »), et « skip: ask » va au mainteneur. */
    fs.cpSync(KIND, path.join(WS, 'drafts', 'essai'), { recursive: true });
    same(run('split.js', [TMP, path.join(WS, 'drafts', 'vide')]), { code: 0, lines: [] }, 'le genre vide se coupe dans l\'espace de lecture');
    kindFile('lecture', `module.exports = {
  stamp: ['meaning'],
  fields: ['mot'],
  tables: ['lecture'],
  split: C => {
    const ids = C.sources.filter(s => s.kind === 'word').slice(0, 25).map(s => s.id);
    const rows = list => list.map(id => ({ id, nl: C.byId(id).nl }));
    return [{ batch: 'a', rows: rows(ids.slice(0, 12)) }, { batch: 'b', rows: rows(ids.slice(12)) }];
  },
  check: (row, input) => row.mot === input.nl.toUpperCase() ? [] : ['mot is not ' + input.nl.toUpperCase()],
  readWhole: row => row.mot.indexOf(' ') >= 0 ? 'two words' : '',
  merge: row => ({ lecture: row.mot })
};
`);
    const LDIR = path.join(WS, 'drafts', 'lecture');
    same(run('split.js', [TMP, LDIR]), { code: 0, lines: ['a 12', 'b 13'] }, 'le genre « lecture » se coupe');
    ['a', 'b'].forEach(b => {
      const input = JSON.parse(text(path.join(LDIR, b, 'input.json')));
      put(path.join(LDIR, b), 'draft.json', input.map(r => Object.assign({ id: r.id, stamp: r.stamp, mot: r.nl.toUpperCase() },
        r.nl === 'tot ziens' ? { unsure: 'tot ziens, or tot straks?' } : {})));
      put(path.join(LDIR, b), 'review.json', input.map(r => ({ id: r.id, verdict: 'keep' })));
    });
    const LT = path.join(TMP, 'src', 'content', 'lecture.js');
    fs.writeFileSync(LT, '/* La table de lecture de test/tools/fanout.js. */\n' + table.MARKER + '\nNL.content.byDutch[\'lecture\'] = {\n};\n');
    same(run('merge.js', [TMP, LDIR]), { code: 0, lines: ['ok lecture 25 taken, 0 dropped', 'ok lecture.js 25 set, 0 removed'] }, 'le genre « lecture » se fond');
    /* Les mots sans phrase à HEAD, et un mot qui a la sienne, lus dans le cours et pas écrits ici :
       le Merge des phrases (tâches 34 et 41) en donne à des mots qui n'en avaient pas. */
    const bare = C.sources.filter(s => s.kind === 'word' && !(s.drills && s.drills.length)).map(s => s.id);
    const sentenced = C.sources.find(s => s.kind === 'word' && s.drills && s.drills.length).id;
    kindFile('exemples', `module.exports = {
  stamp: ['meaning'],
  fields: ['phrases'],
  optional: ['skip'],
  tables: [],
  split: () => [{ batch: 'een', rows: [{ id: '${bare[0]}' }, { id: '${bare[2]}' }, { id: '${sentenced}' }] }],
  check: () => [],
  forMaintainer: row => row.skip === 'ask' ? 'skip is ask' : '',
  merge: () => ({})
};
`);
    const XDIR = path.join(WS, 'drafts', 'exemples'), XEEN = path.join(XDIR, 'een');
    same(run('split.js', [TMP, XDIR]), { code: 0, lines: ['een 3'] }, 'le genre « exemples » se coupe');
    const xs = JSON.parse(text(path.join(XEEN, 'input.json')));
    put(XEEN, 'draft.json', [
      { id: bare[0], stamp: xs[0].stamp, phrases: [], skip: 'no candidate fits' },
      { id: bare[2], stamp: xs[1].stamp, phrases: [], skip: 'ask' },
      { id: sentenced, stamp: xs[2].stamp, phrases: ['Ik versta u.'] }
    ]);
    put(XEEN, 'review.json', [{ id: bare[0], verdict: 'keep' }, { id: bare[2], verdict: 'for maintainer: skip is ask' }, { id: sentenced, verdict: 'keep' }]);
    put(XEEN, 'disputes.md', '## ' + bare[2] + '\nSource: ' + C.byId(bare[2]).nl + '\nRow: skip ask\nFirst reader: for maintainer: skip is ask\n');
    put(XEEN, 'rulings.json', [{ id: bare[2], ruling: 'drop', words: 'leave it', confirmed: true, date: '2026-10-22' }]);
    ok(kit.check(TMP, XEEN).ok, 'le lot « exemples » passe Check');

    /* Ce que le kit donne à l'outil : readKind, et readWhole dans le module d'un genre. */
    const rk = kit.readKind(TMP, KIND);
    same(rk.name, 'essai', 'readKind nomme le genre par son dossier');
    same(rk.lines, GOOD_EEN.concat(check(TWEE)), 'readKind dit les lignes de Check de chaque lot');
    same(rk.rows.map(x => [x.input.id, x.batch, x.from || (x.drop ? 'drop' : x.why), x.ruling ? x.ruling.ruling : null]), [
      ['overleven:w1', 'een', 'draft', null],
      ['overleven:w2', 'een', 'retry', null],
      ['bakker:w22', 'een', 'change', 'change'],
      ['thuis:w24', 'twee', 'drop', 'drop'],
      ['thuis:w1', 'twee', 'retry', 'keep']
    ], 'readKind rend chaque ligne d\'entrée, son lot, ce que Merge en prend et la décision du mainteneur');
    same(kit.loadKind(TMP, 'essai').readWhole(), '', 'un genre qui ne dit rien ne fait rien lire en entier');
    kindFile('entier', 'module.exports = { stamp: [], fields: [\'mot\'], tables: [], split: () => [], check: () => [], merge: () => ({}), readWhole: \'oui\' };\n');
    throws(() => kit.loadKind(TMP, 'entier'), /^kind entier: readWhole is not a function$/, 'readWhole est une fonction');

    /* L'échantillon : 1 sur 10, au moins 10, et le même à chaque lecture. */
    same([0, 5, 10, 11, 100, 101, 360].map(reading.size), [0, 5, 10, 10, 10, 11, 36], 'la taille de l\'échantillon : 1 sur 10, au moins 10, au plus tout');
    const words = C.sources.filter(s => s.kind === 'word').slice(0, 25).map(s => s.id);
    const whole = words.filter(id => C.byId(id).nl.indexOf(' ') >= 0), others = words.filter(id => whole.indexOf(id) < 0);
    const sha1 = s => crypto.createHash('sha1').update(s).digest('hex');
    const ranked = others.slice().sort((a, b) => sha1('lecture ' + a) < sha1('lecture ' + b) ? -1 : 1).slice(0, 10);
    const sample = others.filter(id => ranked.indexOf(id) >= 0);
    same(reading.pick('lecture', others), sample, 'l\'échantillon : les plus petits sha1 de « <genre> <id> », dans l\'ordre de l\'entrée');

    /* La liste du contrôle du contenu. */
    const L = reading.list(TMP, WS);
    ok(L.ok, 'la liste se lit : ' + L.lines.filter(l => /^fail /.test(l)).join(' | '));
    same(L.lines.slice(0, 3), ['# Reading list', '', 'Read for the content check, at HEAD: every row its kind marks to read whole (a new Flemish form, a generated sentence), every row the maintainer ruled, and a sample of the other taken rows, 1 in 10 and at least 10 per kind, the same on every run. Under each row, what each of its kind\'s tables holds for it.'],
      'la liste dit ce qu\'elle tient');
    same(L.lines.filter(l => /^## /.test(l)), ['## essai', '## exemples', '## lecture', '## vide'], 'un titre par genre coupé, dans l\'ordre des noms');
    const ESSAI = [
      head('overleven:w1'), '  - kept by the first reader; sampled', '  - essai.js: \'GOEIEDAG|\'',
      head('overleven:w2'), '  - kept by the second reader; sampled', '  - essai.js: \'DAG|reprise\'',
      head('bakker:w22'), '  - ruled change on 2026-10-22: keep it, and say why', '  - essai.js: \'MEENEMEN|changé\'',
      head('thuis:w24'), '  - ruled drop on 2026-10-22', '  - essai.js: \'avant\'',
      head('thuis:w1'), '  - ruled keep on 2026-10-22: the retry is right', '  - essai.js: \'DE STRAAT|reprise\''
    ];
    same(part(L.lines, 'essai'), ['## essai', '', '5 rows: 4 taken, 1 dropped. Listed: 3 ruled, 0 read whole, 2 sampled of 2 others.', ''].concat(ESSAI, ['']),
      'un genre : ses comptes, puis chaque ligne listée, sa source, pourquoi elle est là, et ce que ses tables tiennent à HEAD');
    same(part(L.lines, 'exemples').slice(0, 3), ['## exemples', '', '3 rows: 2 taken, 1 dropped. Listed: 1 ruled, 0 read whole, 2 sampled of 2 others.'], 'une ligne écartée par le mainteneur est listée');
    const lecture = part(L.lines, 'lecture');
    same(lecture.slice(0, 3), ['## lecture', '', '25 rows: 25 taken, 0 dropped. Listed: 0 ruled, 4 read whole, 10 sampled of 21 others.'], 'un genre de 21 autres lignes en lit 10');
    same(lecture.filter(l => /^- /.test(l)), words.filter(id => whole.indexOf(id) >= 0 || sample.indexOf(id) >= 0).map(head),
      'les lignes à lire en entier et l\'échantillon, dans l\'ordre de l\'entrée');
    const w3 = lecture.indexOf(head('overleven:w3'));
    same(lecture.slice(w3 + 1, w3 + 4), ['  - two words; kept by the first reader', '  - lecture.js: \'TOT ZIENS\'', '  - unsure: tot ziens, or tot straks?'],
      'une ligne lue en entier dit la raison de son genre, et son doute');
    same(part(L.lines, 'vide'), ['## vide', '', '0 rows: 0 taken, 0 dropped. Listed: 0 ruled, 0 read whole, 0 sampled of 0 others.'], 'un genre sans ligne n\'a que ses comptes');
    same(reading.list(TMP, WS), L, 'la liste est la même à chaque lecture');
    same(run('reading.js', [TMP, WS]), { code: 0, lines: L.lines.filter(Boolean) }, 'reading.js imprime la liste');

    /* --kind : chaque ligne d'un genre. */
    const EVERY = ['# essai: every row', '', '5 rows: 4 taken, 1 dropped.', ''].concat(ESSAI.map(l => l.replace('; sampled', '')));
    same(reading.every(TMP, WS, 'essai'), { ok: true, lines: EVERY }, '--kind liste chaque ligne du genre, sans échantillon');
    same(run('reading.js', [TMP, WS, '--kind', 'essai']), { code: 0, lines: EVERY.filter(Boolean) }, 'reading.js --kind imprime chaque ligne');
    same(run('reading.js', [TMP, WS, '--kind', 'inconnu']), { code: 1, lines: ['fail inconnu -: never split: run Split first'] }, '--kind refuse un genre jamais coupé');

    /* --unsentenced : les mots sans phrase à HEAD, et la ligne de chacun dans le genre des exemples. */
    const U = reading.unsentenced(TMP, WS, { sentences: 'exemples' });
    ok(U.ok, '--unsentenced se lit : ' + U.lines.filter(l => /^fail /.test(l)).join(' | '));
    same(U.lines.slice(0, 10), ['# Words without a sentence', '', bare.length + ' words have no example sentence. Under each, its row in drafts/exemples.', '',
      head(bare[0]), '  - exemples: {"phrases":[],"skip":"no candidate fits"}; kept by the first reader',
      head(bare[1]), '  - exemples: no row',
      head(bare[2]), '  - exemples: ruled drop on 2026-10-22: leave it'
    ], 'chaque mot sans phrase : sa ligne gardée et sa raison, pas de ligne, ou la décision qui l\'écarte');
    same(U.lines.filter(l => /^- /.test(l)), bare.map(head), 'les mots sans phrase, dans l\'ordre du cours, et eux seuls (' + C.byId(sentenced).nl + ' a la sienne)');
    same(run('reading.js', [TMP, WS, '--unsentenced']), { code: 1, lines: ['fail examples -: never split: run Split first'] }, 'reading.js --unsentenced lit le genre examples');

    /* Les refus. */
    same(reading.list(TMP, path.join(TMP, 'nulle')), { ok: false, lines: ['fail reading -: no split kind in ' + path.join(TMP, 'nulle', 'drafts')] }, 'un espace sans genre coupé est refusé');
    const LA = path.join(LDIR, 'a'), lrev = text(path.join(LA, 'review.json'));
    put(LA, 'review.json', lrev.replace('"keep"', '"kept"'));
    const bad = reading.every(TMP, WS, 'lecture');
    ok(!bad.ok && bad.lines[bad.lines.length - 1] === 'fail lecture -: batch a does not pass Check', 'un lot qui ne passe pas Check est refusé : ' + JSON.stringify(bad.lines.slice(-1)));
    put(LA, 'review.json', lrev);
    fs.renameSync(path.join(LDIR, 'b', 'review.json'), path.join(LDIR, 'b', 'review.json.old'));
    const open = reading.list(TMP, WS);
    same([open.ok, open.lines.length, open.lines[0]], [false, 13, 'fail lecture ' + words[12] + ': unsettled, no review'], 'une ligne non réglée est refusée, et la liste avec');
    fs.renameSync(path.join(LDIR, 'b', 'review.json.old'), path.join(LDIR, 'b', 'review.json'));
    fs.renameSync(LT, LT + '.old');
    same(reading.every(TMP, WS, 'lecture'), { ok: false, lines: ['fail lecture -: no table file src/content/lecture.js'] }, 'une table sans fichier est refusée');
    fs.renameSync(LT + '.old', LT);
    edit('W(\'goeiedag\'', 'W(\'hallo\'');
    same(reading.every(TMP, WS, 'essai'), { ok: false, lines: ['fail essai overleven:w1: no longer an item'] }, 'une ligne dont l\'élément n\'est plus est refusée');
    fs.writeFileSync(LEX, lexicon);
    const USAGE = ['usage: node tools/content/reading.js <repo> <WS> [--kind <kind> | --unsentenced]'];
    [[TMP], [TMP, WS, '--kind'], [TMP, WS, '--unsentenced', 'essai'], [TMP, WS, '--tout']].forEach(a =>
      same(run('reading.js', a), { code: 1, lines: USAGE }, 'reading.js ' + a.slice(1).join(' ') + ' dit son usage'));
    console.log('  lecture        liste, --kind, --unsentenced, échantillon ' + sample.length + ' sur ' + others.length + ', refus');
  }

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
