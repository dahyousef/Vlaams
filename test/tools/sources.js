/* Les sources externes du kit, lues depuis le cache épinglé (tools/content/lib/cache.js) :
   l'extrait des sens belges du Wiktionnaire (tools/content/kaikki.js).
     node test/tools/sources.js .
   Tout se joue sur un fichier écrit ici, dans un dossier temporaire, avec son épingle :
   rien n'est téléchargé et le dépôt n'est jamais écrit.

   Ce que ce contrôle ne voit pas : le vrai fichier. Il vit dans .cache/, que la CI n'a pas ;
   ce que ses sens disent, on le lit dans l'extrait, au moment de s'en servir. */
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const kaikki = require(path.join(ROOT, 'tools', 'content', 'kaikki'));

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
const pinOf = s => ({ 'kaikki/nl.jsonl': { url: 'http://127.0.0.1/', date: '2026-10-22', bytes: Buffer.byteLength(s), sha256: sha(s) } });
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
