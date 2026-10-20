/* Six contrôles mécaniques sur le contenu. Le cours va être multiplié par dix
   et il n'y a pas de relecteur néerlandophone : tout ce qu'une machine peut
   vérifier, elle le vérifie, à chaque changement.

   Ce que ces contrôles NE voient PAS : l'idiome, le registre, l'ordre des mots,
   si une phrase vaut la peine d'être apprise, et l'article devant un autre nom
   que le mot drillé. Voir TESTING.md. */
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const browser = require('./lib/browser');
const { COLLECTIONS, owed } = require('./lib/prose');
const ROOT = process.argv[2] || path.join(__dirname, '..');

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const B = browser.open({ root: ROOT, seed: browser.SEED, skip: ['src/app.js'] });
const NL = B.NL, U = NL.util;
/* Le cours tel qu'il est écrit, avant la première construction : {naam}, {stad} et
   {bedrijf} y sont encore, et le contrôle 6 compare les jetons. */
const RAW = {};
COLLECTIONS.forEach(k => { RAW[k] = JSON.parse(JSON.stringify(NL.content[k] || [])); });
const tokens = s => String(s || '').toLowerCase().replace(/\{[a-z]+\}/g, ' ').split(/[^a-zà-ÿ'’-]+/)
  .map(t => t.replace(/^[-'’]+|[-'’]+$/g, '')).filter(t => t.length > 1);

NL.state.open().then(() => {
  NL.content.refresh();
  const units = NL.content.units, items = NL.content.allItems();
  console.log('CONTENU — ' + items.length + ' éléments');

  /* ======================================================== 1. orthographe */
  /* Les formes flamandes voulues, une par une, chacune avec sa raison. Sans la
     raison, cette liste devient l'endroit où l'on enterre les fautes. */
  const FLEMISH = {
    asteblieft:    'contraction parlée de « alstublieft »',
    bancontact:    'le système de paiement belge : un nom propre',
    da:            'flamand parlé pour « dat », dans « da’s »',
    hey:           'salutation flamande, pour bonjour comme pour au revoir',
    jaja:          'redoublement parlé de « ja »',
    neenee:        'redoublement parlé de « nee »',
    nie:           'flamand parlé pour « niet »',
    recyclagepark: 'belgicisme ; le nord dit « milieupark »',
    spreekte:      'forme dialectale de « spreekt ge », assumée dans la variante flamande'
  };
  const TSV = path.join(__dirname, 'data', 'nl-words.txt.gz');
  if (!fs.existsSync(TSV)) { console.log('FAIL: ' + TSV + ' est absent. Régénérer : node test/tools/build-wordlist.js'); process.exit(1); }
  const forms = new Set(zlib.gunzipSync(fs.readFileSync(TSV)).toString('utf8').split('\n'));

  const texts = [];
  units.forEach(u => {
    (u.words || []).forEach((w, i) => {
      texts.push([w.nl, u.id + ':w' + i]);
      if (w.be) texts.push([w.be, u.id + ':w' + i + ' (variante)']);
      (w.also || []).forEach(a => texts.push([a, u.id + ':w' + i + ' (on dit aussi)']));
      (w.drills || []).forEach((d, j) => texts.push([d.nl, u.id + ':w' + i + ' phrase ' + (j + 1)]));
    });
    (u.phrases || []).forEach((p, i) => {
      texts.push([p.nl, u.id + ':p' + i]);
      if (p.be) texts.push([p.be, u.id + ':p' + i + ' (variante)']);
      (p.also || []).forEach(a => texts.push([a, u.id + ':p' + i + ' (on dit aussi)']));
    });
  });
  (NL.content.patterns || []).forEach(g => (g.drills || []).forEach((d, j) => texts.push([d.nl, g.id + ' phrase ' + (j + 1)])));

  /* Le prénom, la commune et l'employeur par défaut ne sont pas du néerlandais. */
  const NAMES = new Set(Object.keys(NL.content.DEFAULTS).map(k => NL.content.DEFAULTS[k].toLowerCase()));
  const stem = t => t.replace(/[’']s$/, '');                                // collega’s, auto’s, da’s
  const known = t => forms.has(t) || NAMES.has(t) || forms.has(stem(t)) || !!FLEMISH[stem(t)] ||
    (t.indexOf('-') >= 0 && t.split('-').every(p => p.length < 2 || forms.has(p)));   // java-ontwikkelaar
  const unknown = new Map(), used = new Set();
  let count = 0;
  texts.forEach(([text, where]) => tokens(text).forEach(t => {
    count++;
    if (FLEMISH[stem(t)]) used.add(stem(t));
    if (!known(t) && !unknown.has(t)) unknown.set(t, where);
  }));
  unknown.forEach((where, t) => ok(false, '« ' + t + ' » n’est pas une forme néerlandaise connue   [' + where +
    '] — corriger, ou l’inscrire dans FLEMISH avec sa raison'));
  /* Une exception qui ne sert plus ne protège plus rien. */
  Object.keys(FLEMISH).forEach(t => ok(used.has(t), '« ' + t + ' » est dans FLEMISH mais plus dans le cours : retirer l’exception'));
  ok(count > 3000, 'only ' + count + ' tokens were checked: the content did not load');
  ok(NL.content.alsoReport && NL.content.alsoReport.missing.length === 0, 'src/content/also.js : ' + ((NL.content.alsoReport || { missing: ['(table non chargée)'] }).missing.join(', ')) + ' ne correspond à aucun élément du lexique');
  console.log('  orthographe     ' + count + ' formes vérifiées contre ' + forms.size + ', ' + unknown.size + ' inconnue(s), ' +
    Object.keys(FLEMISH).length + ' flamandes assumées');

  /* ============================== 2. tout exercice promis se construit */
  /* La séance saute en silence un élément dont l'exercice échoue : un mot peut
     donc n'être jamais drillé sans que rien ne le dise. */
  const blank = () => ({ sel: null, picked: [], input: '', matchSel: null, matchGone: [], matchBad: null, speech: { phase: 'idle', tries: 0, selfRated: null } });
  let pairs = 0, broken = 0, hollow = 0;
  items.forEach(it => {
    (NL.srs.RUNGS[it.kind] || NL.srs.RUNGS.word).forEach((rung, r) => {
      const claimed = rung.filter(n => NL.srs.supports(it, n));
      if (!claimed.length) hollow++;
      claimed.forEach(name => {
        pairs++;
        try {
          const ex = NL.ex.get(name), task = ex.build(it);
          if (!task) throw new Error('build n’a rien rendu');
          if (typeof ex.view(task, blank(), 'ask') !== 'string') throw new Error('view n’a rien rendu');
          if (!ex.answer(task)) throw new Error('aucune réponse attendue');
        } catch (e) {
          broken++;
          ok(false, 'l’échelon ' + r + ' promet « ' + name + ' » pour ' + it.id + ' « ' + it.nl + ' » et ne le construit pas : ' + e.message);
        }
      });
    });
  });
  /* Un échelon où rien n'est possible retombe sur un exercice de secours : toléré,
     mais compté, et le compte ne peut que baisser. */
  const HOLLOW_BUDGET = 4;
  ok(hollow <= HOLLOW_BUDGET, hollow + ' échelons sans aucun exercice possible, budget ' + HOLLOW_BUDGET + ' — baisser le budget, jamais le lever');
  ok(hollow >= HOLLOW_BUDGET, 'seulement ' + hollow + ' échelons de secours : baisser HOLLOW_BUDGET à ' + hollow + ' pour verrouiller le gain');
  ok(pairs > 5000, 'only ' + pairs + ' exercises were built: the content did not load');
  console.log('  exercices       ' + pairs + ' construits, ' + broken + ' échec(s), ' + hollow + ' échelon(s) de secours');

  /* ================= 3. une phrase d'exemple n'emprunte pas en avant */
  /* src/content/examples.js s'impose « du vocabulaire déjà rencontré ». Non
     vérifiée, la règle était tenue six fois sur sept. Les mots-outils ne
     comptent pas : on ne peut pas écrire une phrase sans eux. */
  const GRAMMAR = new Set(('ik ge gij je jij u hij ze zij we wij het de een is ben bent zijn was heb hebt ' +
    'heeft had kan kunt kun wil wilt moet mag ga gaat gaan doe doet niet nie geen en of maar want dat dit ' +
    'die deze er hier daar ook nog al wel te in op van met voor aan bij naar uit om over door tot me mijn ' +
    'uw zo heel veel wat wie waar hoe nu dan als zich eens even graag ja nee').split(' '));
  const firstUnit = new Map();
  units.forEach((u, ui) => (u.words || []).concat(u.phrases || []).forEach(it =>
    tokens(it.nl).forEach(t => { if (!firstUnit.has(t)) firstUnit.set(t, ui); })));
  let ahead = 0, sentences = 0;
  units.forEach((u, ui) => (u.words || []).forEach(w => (w.drills || []).forEach(d => {
    sentences++;
    if (tokens(d.nl).some(t => !GRAMMAR.has(t) && firstUnit.has(t) && firstUnit.get(t) > ui)) ahead++;
  })));
  const AHEAD_BUDGET = 62;
  ok(ahead <= AHEAD_BUDGET, ahead + ' phrases d’exemple empruntent du vocabulaire à une unité ultérieure, budget ' + AHEAD_BUDGET +
    ' — baisser le budget quand on en corrige, jamais le lever');
  ok(ahead >= AHEAD_BUDGET, 'seulement ' + ahead + ' phrases empruntent en avant : baisser AHEAD_BUDGET à ' + ahead + ' pour verrouiller le gain');
  console.log('  séquence        ' + ahead + ' / ' + sentences + ' phrases empruntent en avant (budget ' + AHEAD_BUDGET + ')');

  /* ======================================================= 4. doublons */
  /* Un élément enseigné dans deux unités est drillé deux fois en parallèle, et
     compte deux fois pour le seuil qui ouvre l'unité suivante. La phase 3 en
     fera des alias ; d'ici là, leur nombre ne peut que baisser. On compare le
     néerlandais sans casse ni ponctuation, dans un même genre d'élément —
     jamais l'identifiant, qui change dès qu'on insère un mot. */
  const seen = new Map();
  let dupes = 0;
  items.filter(it => it.unit !== 'eigen' && it.kind !== 'pattern').forEach(it => {
    const key = it.kind + '|' + U.norm(it.nl);
    if (seen.has(key)) dupes++; else seen.set(key, it.id);
  });
  const DUPE_BUDGET = 9;
  ok(dupes <= DUPE_BUDGET, dupes + ' éléments enseignés deux fois, budget ' + DUPE_BUDGET + ' — baisser le budget quand on en retire, jamais le lever');
  ok(dupes >= DUPE_BUDGET, 'seulement ' + dupes + ' doublons : baisser DUPE_BUDGET à ' + dupes + ' pour verrouiller le gain');
  console.log('  doublons        ' + dupes + ' (budget ' + DUPE_BUDGET + ')');

  /* ====================================== 5. chaque id garde son néerlandais */
  /* Les ids sont des positions (« overleven:w3 ») : insérer, retirer ou déplacer un
     mot donne son historique à un autre. Ajouter en fin d'unité passe ; une
     correction du néerlandais met à jour test/data/ids.tsv dans le même commit. */
  const IDS = path.join(__dirname, 'data', 'ids.tsv');
  const pinned = fs.existsSync(IDS) ? fs.readFileSync(IDS, 'utf8').split(/\r?\n/).filter(Boolean).map(l => l.split('\t')) : [];
  ok(pinned.length > 0, 'test/data/ids.tsv absent ou vide');
  let moved = 0;
  pinned.forEach(([id, nl]) => {
    const it = NL.content.byId(id);
    if (!it || it.nl !== nl) { moved++; ok(false, id + ' devait être « ' + nl + ' », est ' + (it ? '« ' + it.nl + ' »' : 'absent')); }
  });
  console.log('  ids             ' + (pinned.length - moved) + ' / ' + pinned.length + ' à leur place');

  /* ============================================ 6. l'anglais qui reste dû */
  /* Chaque sens et chaque texte du cours doit finir par porter un `en`. Le reste
     à écrire se compte par lot, et le compte ne peut que baisser. */
  ok(JSON.stringify(RAW).indexOf('{naam}') >= 0, 'RAW n’a pas été pris avant la première construction : {naam} a disparu');
  const BUDGET = { lexiqueA1: 0, lexiqueA1b: 0, exemples: 0, grammaire: 110, references: 218, scenarios: 135 };
  const batches = { lexiqueA1: [], lexiqueA1b: [], exemples: [], grammaire: [], references: [], scenarios: [] };
  RAW.units.forEach((u, i) => owed(u, 'units[' + i + ']', '', []).forEach(r => {
    if (/\.drills\[/.test(r.where)) batches.exemples.push(r);
    else batches[u.n <= 6 ? 'lexiqueA1' : 'lexiqueA1b'].push(r);
  }));
  ['patterns', 'openTasks'].forEach(k => owed(RAW[k], k, '', []).forEach(r => batches.grammaire.push(r)));
  ['register', 'hetRules', 'deRules', 'sheets'].forEach(k => owed(RAW[k], k, '', []).forEach(r => batches.references.push(r)));
  owed(RAW.scenarios, 'scenarios', '', []).forEach(r => batches.scenarios.push(r));
  Object.keys(BUDGET).forEach(b => {
    const left = batches[b].filter(r => !r.ok), n = left.length;
    ok(n <= BUDGET[b], b + ' ' + n + ' anglais dus, budget ' + BUDGET[b] + ' — baisser le budget quand on écrit, jamais le lever   [' +
      left.slice(0, 3).map(r => r.where).join(', ') + ']');
    ok(n >= BUDGET[b], b + ' : seulement ' + n + ' anglais dus : baisser le budget à ' + n + ' pour verrouiller le gain');
    console.log('  ' + (b + '            ').slice(0, 13) + n + ' / ' + batches[b].length + ' (budget ' + BUDGET[b] + ')');
  });

  /* Parcours de RAW : tout objet qui porte `fr` ou `en`. */
  const pairs6 = [];
  const walk6 = (v, where) => {
    if (Array.isArray(v)) { v.forEach((x, i) => walk6(x, where + '[' + i + ']')); return; }
    if (!v || typeof v !== 'object') return;
    if ('fr' in v || 'en' in v) pairs6.push([v, where]);
    Object.keys(v).forEach(k => walk6(v[k], where + '.' + k));
  };
  COLLECTIONS.forEach(k => walk6(RAW[k], k));
  let lonely = 0, drift = 0;
  const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).join('|');
  pairs6.forEach(([v, where]) => {
    if (typeof v.en === 'string' && typeof v.fr !== 'string') { lonely++; ok(false, 'un `en` sans `fr` : ' + where); }
    if (typeof v.en === 'string' && typeof v.fr === 'string' && sig(v.fr) !== sig(v.en)) {
      drift++; ok(false, 'les chiffres ou les {jetons} diffèrent entre fr et en : ' + where + '  « ' + v.fr + ' » / « ' + v.en + ' »');
    }
  });
  console.log('  anglais        ' + lonely + ' sans fr, ' + drift + ' chiffre(s) ou jeton(s) qui diffèrent');

  /* Les gardes sur l'anglais écrit. */
  const G = NL.gloss, glossed = items.filter(it => it.unit !== 'eigen' && it.kind !== 'pattern' && G.has(it, 'en'));
  const bySense = new Map();
  glossed.forEach(it => G.senses(it, 'en').forEach(s => { if (!bySense.has(s)) bySense.set(s, []); bySense.get(s).push(it); }));
  bySense.forEach((its, s) => { for (let i = 1; i < its.length; i++) {
    ok(G.sameSense(its[0], its[i]), 'même anglais « ' + s + ' » pour deux éléments sans sens français ni néerlandais commun : ' +
      its[0].id + ' « ' + its[0].nl + ' » et ' + its[i].id + ' « ' + its[i].nl + ' »');
  } });
  glossed.forEach(it => {
    if (G.wordClass(it, 'fr') === 'verb') ok(/^to\s+\S/i.test(it.en), it.id + ' « ' + it.nl + ' » est un verbe en français, et son anglais « ' + it.en + ' » ne commence pas par « to »');
    if (/(^|[^a-zà-ÿ])uw?(?![a-zà-ÿ])/i.test(it.nl) && /\byou(r)?\b/i.test(it.en)) ok(/\(formal\)/.test(it.en), it.id + ' « ' + it.nl + ' » : « ' + it.en + ' » doit porter « (formal) »');
    if (it.art) ok(!/^(the|an|a)\s/i.test(it.en), it.id + ' « ' + it.nl + ' » est un nom : « ' + it.en + ' » ne prend pas d’article');
  });
  console.log('  gardes         ' + glossed.length + ' éléments glosés en anglais contrôlés');

  console.log('\n' + checks + ' contrôles, ' + (fails === 0 ? 'CONTENU CONFORME' : fails + ' ÉCHEC(S)'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
