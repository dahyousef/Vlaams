/* Les sources externes du kit, lues depuis le cache épinglé (tools/content/lib/cache.js) :
   l'extrait des sens belges du Wiktionnaire (tools/content/kaikki.js), et les phrases de
   Tatoeba traduites en anglais et en français (tools/content/tatoeba.js).
     node test/tools/sources.js .
   Tout se joue sur un fichier écrit ici, dans un dossier temporaire, avec son épingle :
   rien n'est téléchargé et le dépôt n'est jamais écrit.

   Ce que ce contrôle ne voit pas : le vrai fichier. Il vit dans .cache/, que la CI n'a pas ;
   ce que ses sens disent, on le lit dans l'extrait, au moment de s'en servir. */
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const kaikki = require(path.join(ROOT, 'tools', 'content', 'kaikki'));
const tatoeba = require(path.join(ROOT, 'tools', 'content', 'tatoeba'));
const browser = require(path.join(ROOT, 'test', 'lib', 'browser'));
const sequence = require(path.join(ROOT, 'test', 'lib', 'sequence'));
const spelling = require(path.join(ROOT, 'test', 'lib', 'spelling'));

let checks = 0, fails = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };
const same = (got, want, m) => ok(JSON.stringify(got) === JSON.stringify(want), m + ' : ' + JSON.stringify(got) + ', attendu ' + JSON.stringify(want));
const rejects = async (p, re, m) => {
  let e = null;
  try { await p(); } catch (x) { e = x; }
  ok(e && re.test(e.message), m + ' : ' + (e ? e.message : 'rien n\'est levé'));
};
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'vlaams-sources-'));
const EMPTY = fs.mkdtempSync(path.join(os.tmpdir(), 'vlaams-sources-'));
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
/* Les épingles de fichiers écrits ici : { clé: contenu } → { clé: épingle }. */
const pinsOf = files => Object.fromEntries(Object.keys(files).map(k =>
  [k, { url: 'http://127.0.0.1/', date: '2026-10-22', bytes: Buffer.byteLength(files[k]), sha256: sha(files[k]) }]));
const pinOf = s => pinsOf({ 'kaikki/nl.jsonl': s });
const DUMP = path.join(TMP, '.cache', 'kaikki', 'nl.jsonl');
const EXTRACT = path.join(TMP, '.cache', 'kaikki', 'belgian.tsv');
/* Un outil, lancé comme un agent le lance : ses lignes et son code de sortie. */
const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'content', script)].concat(args), { encoding: 'utf8' });
  return { code: r.status, lines: (r.stdout || '').split(/\r?\n/).filter(Boolean) };
};

async function main() {
  console.log('SOURCES EXTERNES');

  /* ==================================================== 1. kaikki : les sens belges */
  const entries = [
    { word: 'goesting', pos: 'noun', senses: [{ tags: ['Belgium'], glosses: ['desire, appetite'] }, { glosses: ['taste'] }] },
    { word: 'fiets', pos: 'noun', senses: [{ glosses: ['bicycle'] }] },
    { word: 'amai', pos: 'intj', senses: [{ tags: ['Belgium', 'colloquial'], glosses: ['wow'] }, { tags: ['Flanders'], glosses: ['oh dear'] }] },
    { word: 'kot', pos: 'noun', senses: [{ raw_tags: ['in Belgium'], glosses: ['student room'] }] },
    { word: 'schoon', pos: 'adj', senses: [{ tags: ['Brabant'], raw_tags: ['Brabant'], glosses: ['beautiful'] }] },
    { word: 'gij', pos: 'pron', senses: [{ tags: ['Flemish', 'dialectal'], glosses: ['you'] }] },
    { word: 'tab', pos: 'noun', senses: [{ tags: ['Belgium'], glosses: ['a\tb\nc'] }, { tags: ['Belgium'], glosses: ['a\tb\nc'] }] },
    { word: 'leeg', pos: 'adj' },
    { word: 'stoel', pos: 'noun', senses: [{ tags: ['Belgium'] }] }
  ];
  const dump = entries.map(e => JSON.stringify(e)).join('\n') + '\n\n';
  fs.mkdirSync(path.dirname(DUMP), { recursive: true });
  fs.writeFileSync(DUMP, dump);
  const pins = pinOf(dump);
  same(await kaikki.extract(TMP, { pins }), { senses: 7, lemmas: 6 }, 'extract compte les sens marqués, une fois chacun, et leurs lemmes');
  same(fs.readFileSync(EXTRACT, 'utf8'), [
    '# kaikki/nl.jsonl sha256 ' + sha(dump),
    'amai\tintj\tBelgium\twow',
    'amai\tintj\tFlanders\toh dear',
    'gij\tpron\tFlemish\tyou',
    'goesting\tnoun\tBelgium\tdesire, appetite',
    'kot\tnoun\tin Belgium\tstudent room',
    'stoel\tnoun\tBelgium\t',
    'tab\tnoun\tBelgium\ta b c'
  ].join('\n') + '\n', 'l\'extrait : son épingle, puis un sens par ligne, trié, sans tabulation ni saut de ligne dans une case');
  ok(!fs.existsSync(EXTRACT + '.part'), 'aucun fichier partiel ne reste');
  const B = kaikki.belgian(TMP, { pins });
  same(B.get('amai'), [{ pos: 'intj', labels: ['Belgium'], gloss: 'wow' }, { pos: 'intj', labels: ['Flanders'], gloss: 'oh dear' }],
    'belgian rend les sens d\'un lemme, dans l\'ordre de l\'extrait');
  same(['fiets', 'schoon', 'leeg'].filter(w => B.has(w)), [], 'un sens sans marque, ou marqué Brabant seulement, n\'est pas belge');
  same([kaikki.marks({ tags: ['Belgium', 'Brabant'], raw_tags: ['in the Netherlands and Belgium', 'Brabant'] }), kaikki.marks({})],
    [['Belgium', 'in the Netherlands and Belgium'], []], 'marks garde Belgium, Flanders, Flemish, et un raw_tag qui nomme la Belgique');
  await rejects(() => kaikki.belgian(TMP, { pins: pinOf(dump + ' ') }),
    /^\.cache\/kaikki\/belgian\.tsv comes from another pin of kaikki\/nl\.jsonl: run node tools\/content\/kaikki\.js \.$/,
    'un extrait d\'une autre épingle est refusé');

  const bad = dump.replace('\n', '\n{"word": \n');
  fs.writeFileSync(DUMP, bad);
  const before = fs.readFileSync(EXTRACT, 'utf8');
  await rejects(() => kaikki.extract(TMP, { pins: pinOf(bad) }), /^kaikki\/nl\.jsonl:2: not JSON$/, 'une ligne qui n\'est pas du JSON est refusée, avec son numéro');
  same(fs.readFileSync(EXTRACT, 'utf8'), before, 'un extract refusé n\'écrit rien');
  await rejects(() => kaikki.extract(TMP, { pins }),
    /^\.cache\/kaikki\/nl\.jsonl is missing: run node tools\/content\/fetch\.js \. kaikki\/nl\.jsonl$/, 'un fichier qui n\'a pas la taille de son épingle n\'est pas lu');
  fs.unlinkSync(EXTRACT);
  await rejects(() => kaikki.belgian(TMP, { pins }), /^\.cache\/kaikki\/belgian\.tsv is missing: run node tools\/content\/kaikki\.js \.$/,
    'sans extrait, belgian dit la commande à lancer');
  same(run('kaikki.js', [EMPTY]), { code: 1, lines: ['fail .cache/kaikki/nl.jsonl is missing: run node tools/content/fetch.js . kaikki/nl.jsonl'] },
    'kaikki.js sans le fichier épinglé dit la commande à lancer');
  same(run('kaikki.js', []), { code: 1, lines: ['usage: node tools/content/kaikki.js <repo>'] }, 'kaikki.js sans dépôt dit son usage');
  console.log('  kaikki         7 sens belges sur 9 entrées, Brabant écarté, extrait daté par son épingle');

  /* ============================================ 2. tatoeba : les phrases d'un mot */
  /* [id, texte, auteur, traductions anglaises, traductions françaises]. Une traduction null est
     un lien vers une phrase effacée : le lien est écrit, la phrase ne l'est pas. */
  const SENT = [
    [10, 'De bakker is heel oud.', 'ann', ['The baker is very old.'], ['Le boulanger est très vieux.']],
    [11, 'Jij bent een bakker.', 'ann', ['You are a baker.'], ['Tu es boulanger.']],
    [12, 'De bakkers zijn er nog niet.', 'bob', ['The bakers are not there yet.', 'The bakers haven\'t come yet.'], ['Les boulangers ne sont pas encore là.']],
    [13, 'De bakker neemt de trein.', 'ann', ['The baker takes the train.'], ['Le boulanger prend le train.']],
    [14, 'Is de bakker nu in Gent?', 'ann', ['Is the baker in Ghent now?'], ['Le boulanger est-il à Gand maintenant ?']],
    [15, 'De bakker is er.', 'ann', ['The baker is here.'], []],
    [16, 'De bakker is er nog niet, ook niet hier.', 'ann', ['The baker isn\'t there yet, not here either.'], ['Le boulanger n\'est pas encore là, pas ici non plus.']],
    [17, 'De bakker is heel vriendelijk.', 'ann', ['The baker is very friendly.'], ['Le boulanger est très aimable.']],
    [18, 'Waar is de bakker nu?', '\\N', ['Where is the baker now?'], ['Où est le boulanger maintenant ?']],
    [19, 'De oude bakker is er nog.', 'ann', ['The old baker is still here.'], ['Le vieux boulanger est encore là.']],
    [20, 'Hij bakt het nu.', 'bob', ['He is baking it now.'], ['Il le fait cuire maintenant.']],
    [21, 'Ik ga nu, tot straks.', 'bob', ['I\'m going now, see you later.'], ['Je m\'en vais, à tout à l\'heure.']],
    [22, 'Straks ga ik tot de bakker.', 'bob', ['Later I\'ll go as far as the baker.'], ['Tout à l\'heure j\'irai jusqu\'au boulanger.']],
    [23, 'De bakker is weg.', 'ann', ['The baker is gone.'], [null]]
  ];
  for (let n = 1; n <= 10; n++) SENT.push([100 + n, 'Het brood is van dag ' + n + '.', 'bob', ['The bread is from day ' + n + '.'], ['Le pain est du jour ' + n + '.']]);
  const row = cells => cells.join('\t') + '\n';
  const files = { 'tatoeba/nld-eng_links.tsv': '', 'tatoeba/nld-fra_links.tsv': '', 'tatoeba/eng_sentences_detailed.tsv': '', 'tatoeba/fra_sentences_detailed.tsv': '' };
  files['tatoeba/nld_sentences_detailed.tsv'] = SENT.map(s => row([s[0], 'nld', s[1], s[2], '\\N', '2020-01-01 00:00:00'])).join('');
  files['tatoeba/user_languages.csv'] = ['nld\t5\tann\t', 'nld\t4\tbob\t', 'eng\t5\tbob\t', '\t0\tcarl\t'].join('\n') + '\n';
  SENT.forEach(s => [['eng', 3, 1], ['fra', 4, 6]].forEach(([lang, at, from]) => s[at].forEach((text, k) => {
    files['tatoeba/nld-' + lang + '_links.tsv'] += row([s[0], s[0] * 10 + from + k]);
    if (text !== null) files['tatoeba/' + lang + '_sentences_detailed.tsv'] += row([s[0] * 10 + from + k, lang, text, 'cy', '\\N', '\\N']);
  })));
  Object.keys(files).forEach(k => {
    fs.mkdirSync(path.join(TMP, '.cache', path.dirname(k)), { recursive: true });
    fs.writeFileSync(path.join(TMP, '.cache', k), files[k]);
  });
  const tPins = pinsOf(files);
  const OUT = path.join(TMP, '.cache', 'tatoeba', 'extract.tsv');
  same(await tatoeba.extract(TMP, { pins: tPins }), { nld: 22, eng: 23, fra: 22 },
    'extract garde les phrases traduites en anglais et en français, et leurs traductions');
  const lines = fs.readFileSync(OUT, 'utf8').split('\n');
  same(lines[0], '# ' + tatoeba.KEYS.map(k => k + ' ' + tPins[k].sha256).join(' '), 'l\'en-tête nomme les épingles lues');
  same(lines.filter(l => /^nld\t(10|12|18)\t/.test(l)), [
    'nld\t10\tann\t1\tDe bakker is heel oud.\t101\t106',
    'nld\t12\tbob\t0\tDe bakkers zijn er nog niet.\t121,122\t126',
    'nld\t18\t\t0\tWaar is de bakker nu?\t181\t186'
  ], 'une phrase : son auteur (vide pour \\N), langue maternelle ou non, ses traductions');
  same(lines.filter(l => /^(nld\t(15|23)|eng\t231)\t/.test(l)), [], 'sans traduction française, ou avec un lien vers une phrase effacée, une phrase n\'est pas gardée');
  same(lines.filter(l => /^eng\t12[12]\t/.test(l)), ['eng\t121\tcy\tThe bakers are not there yet.', 'eng\t122\tcy\tThe bakers haven\'t come yet.'],
    'une traduction : son id, son auteur, son texte');
  ok(!fs.existsSync(OUT + '.part'), 'aucun fichier partiel ne reste');

  const T = tatoeba.load(TMP, { pins: tPins });
  same([T.nld.size, T.nld.get(12).eng, T.fra.get(126).text, T.nld.get(10).native, T.nld.get(18).owner],
    [22, [121, 122], 'Les boulangers ne sont pas encore là.', true, ''], 'load rend les phrases de l\'extrait, par id');
  const NL = browser.open({ root: ROOT, seed: browser.SEED, skip: [browser.APP] }).NL;
  ok(spelling.named('Dag {naam}.', NL) && !spelling.named('De bakker is er.', NL), 'named écarte une phrase qui garde un jeton {naam}, et garde celle qui n’en a pas');
  /* Gent est vu à la première unité, comme le cours écrit la commune par défaut : seul named l'écarte. */
  const units = [{ words: [{ nl: 'de bakker' }, { nl: 'het brood' }, { nl: 'oud' }, { nl: 'tot straks' }, { nl: 'bakken' }, { nl: 'de dag' }],
    phrases: [{ nl: 'in Gent' }] }, { words: [{ nl: 'de trein' }] }];
  const seq = { NL, first: sequence.firstUnits(units), ui: 0 };
  const word = (nl, art, en) => ({ kind: 'word', nl, art, fr: '-', en });
  const ids = (nl, art, en) => tatoeba.rank(T, word(nl, art, en), seq).map(c => c.id);
  same(tatoeba.rank(T, word('de bakker', 'de', 'the baker'), seq)[0], {
    id: 10, nl: 'De bakker is heel oud.', owner: 'ann', en: [{ id: 101, text: 'The baker is very old.', owner: 'cy' }],
    fr: [{ id: 106, text: 'Le boulanger est très vieux.', owner: 'cy' }], tiles: 5
  }, 'une candidate : son id, son texte, son auteur, ses traductions et leurs auteurs, ses tuiles');
  same(ids('de bakker', 'de', 'the baker'), [10, 18, 12, 22, 11],
    'le classement : sans je ni jij, d\'un auteur de langue maternelle, moins de tuiles ; ni plus de 8 tuiles, ni la trein d\'une unité ultérieure, ni Gent');
  same([17, 19].filter(id => ids('de bakker', 'de', 'the baker').indexOf(id) >= 0), [],
    'aucune forme que le cours n\'a pas enseignée, pas même une : ni vriendelijk, ni oude, fléchi d\'un mot vu (#12, récit 39)');
  same(tatoeba.rank(T, word('de bakker', 'de', 'the baker'), Object.assign({ known: t => t !== 'oud' }, seq)).map(c => c.id), [18, 12, 22, 11],
    'avec seq.known, une phrase dont une forme ne s\'écrit pas ainsi n\'est pas candidate');
  same(ids('het brood', 'het', 'the bread'), [101, 102, 103, 104, 105, 106, 107, 108], 'huit candidates au plus, par id à rang égal');
  same(ids('tot straks', null, 'see you later'), [21], 'un mot de plusieurs formes s\'y lit à la suite');
  same(ids('bakken', null, 'to bake'), [20], 'un verbe se trouve par son radical en -t');
  await rejects(() => tatoeba.load(TMP, { pins: pinsOf(Object.assign({}, files, { 'tatoeba/nld-fra_links.tsv': files['tatoeba/nld-fra_links.tsv'] + '\n' })) }),
    /^\.cache\/tatoeba\/extract\.tsv comes from other pins of tatoeba: run node tools\/content\/tatoeba\.js \.$/, 'un extrait d\'autres épingles est refusé');
  fs.unlinkSync(OUT);
  await rejects(() => tatoeba.load(TMP, { pins: tPins }), /^\.cache\/tatoeba\/extract\.tsv is missing: run node tools\/content\/tatoeba\.js \.$/,
    'sans extrait, load dit la commande à lancer');
  same(run('tatoeba.js', [EMPTY]), { code: 1, lines: ['fail .cache/tatoeba/nld_sentences_detailed.tsv is missing: run node tools/content/fetch.js . tatoeba/nld_sentences_detailed.tsv'] },
    'tatoeba.js sans les fichiers épinglés dit la commande à lancer');
  same(run('tatoeba.js', []), { code: 1, lines: ['usage: node tools/content/tatoeba.js <repo>'] }, 'tatoeba.js sans dépôt dit son usage');
  console.log('  tatoeba        22 phrases sur 24 gardées, auteurs et langue maternelle lus, classement sur 4 mots');

  console.log('\n' + checks + ' contrôles, ' + (fails === 0 ? 'SOURCES CONFORMES' : fails + ' ÉCHEC(S)'));
}

const clean = () => [TMP, EMPTY].forEach(d => fs.rmSync(d, { recursive: true, force: true }));
main().then(() => {
  clean();
  process.exit(fails ? 1 : 0);
}, e => {
  clean();
  console.log('CRASH ' + (e && e.stack || e));
  process.exit(1);
});
