/* Six contrôles mécaniques sur le contenu. Le cours va être multiplié par dix
   et il n'y a pas de relecteur néerlandophone : tout ce qu'une machine peut
   vérifier, elle le vérifie, à chaque changement.

   Ce que ces contrôles NE voient PAS : l'idiome, le registre, l'ordre des mots,
   si une phrase vaut la peine d'être apprise, et l'article devant un autre nom
   que le mot drillé. Voir TESTING.md. */
const fs = require('fs'), path = require('path');
const browser = require('./lib/browser');
const spelling = require('./lib/spelling');
const sequence = require('./lib/sequence');
const { raw, owed, at } = require('./lib/prose');
const tree = require('./lib/tree');
const ROOT = process.argv[2] || path.join(__dirname, '..');

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { console.log('  FAIL: ' + m); fails++; } };

const B = browser.open({ root: ROOT, seed: browser.SEED, skip: [browser.APP] });
const NL = B.NL, U = NL.util;
/* Le cours tel qu'il est écrit, avant la première construction : {naam}, {stad} et
   {bedrijf} y sont encore, et le contrôle 6 compare les jetons. */
const RAW = raw(NL.content);
const tokens = spelling.tokens;

NL.state.open().then(() => {
  NL.content.refresh();
  const units = NL.content.units, items = NL.content.allItems();
  console.log('CONTENU — ' + items.length + ' éléments');

  /* ======================================================== 1. orthographe */
  /* Les formes flamandes voulues sont dans test/data/flemish.tsv, une par une, chacune avec
     sa raison. Sans la raison, cette liste devient l'endroit où l'on enterre les fautes.
     test/lib/spelling.js lit OpenTaal, les noms par défaut et cette liste. */
  const S = spelling.open(ROOT, NL);

  /* La variante flamande vient de src/content/be.js et se lit sur l'élément, que seul le
     premier listage forme. */
  const beOf = id => { const it = NL.content.byId(id); return it && it.id === id ? it.be : null; };
  const texts = [];
  units.forEach(u => {
    (u.words || []).forEach((w, i) => {
      texts.push([w.nl, u.id + ':w' + i]);
      if (beOf(u.id + ':w' + i)) texts.push([beOf(u.id + ':w' + i), u.id + ':w' + i + ' (variante)']);
      (w.also || []).forEach(a => texts.push([a, u.id + ':w' + i + ' (on dit aussi)']));
      (w.drills || []).forEach((d, j) => texts.push([d.nl, u.id + ':w' + i + ' phrase ' + (j + 1)]));
    });
    (u.phrases || []).forEach((p, i) => {
      texts.push([p.nl, u.id + ':p' + i]);
      if (beOf(u.id + ':p' + i)) texts.push([beOf(u.id + ':p' + i), u.id + ':p' + i + ' (variante)']);
      (p.also || []).forEach(a => texts.push([a, u.id + ':p' + i + ' (on dit aussi)']));
    });
  });
  (NL.content.patterns || []).forEach(g => (g.drills || []).forEach((d, j) => texts.push([d.nl, g.id + ' phrase ' + (j + 1)])));

  const unknown = new Map(), used = new Set();
  let count = 0;
  texts.forEach(([text, where]) => tokens(text).forEach(t => {
    count++;
    if (S.flemishOf(t)) used.add(S.flemishOf(t));
    if (!S.known(t) && !unknown.has(t)) unknown.set(t, where);
  }));
  unknown.forEach((where, t) => ok(false, '« ' + t + ' » n’est pas une forme néerlandaise connue   [' + where +
    '] — corriger, ou l’inscrire dans test/data/flemish.tsv avec sa raison'));
  /* Une exception qui ne sert plus ne protège plus rien. */
  S.flemish.forEach((why, t) => ok(used.has(t), '« ' + t + ' » est dans test/data/flemish.tsv mais plus dans le cours : retirer l’exception'));
  ok(count > 3000, 'only ' + count + ' tokens were checked: the content did not load');
  ok(NL.content.alsoReport && NL.content.alsoReport.missing.length === 0, 'src/content/also.js : ' + ((NL.content.alsoReport || { missing: ['(table non chargée)'] }).missing.join(', ')) + ' ne correspond à aucun élément du lexique');
  console.log('  orthographe     ' + count + ' formes vérifiées contre ' + S.forms.size + ', ' + unknown.size + ' inconnue(s), ' +
    S.flemish.size + ' flamandes assumées');

  /* Les tables indexées par le néerlandais (TABLES, src/content/index.js) : chacune est chargée,
     et chacune de ses clés est le néerlandais d'un mot ou d'une phrase du cours, tel que son
     premier listage l'écrit. Sinon la valeur ne se pose sur rien, et rien ne le dit. */
  const report = NL.content.tableReport || {};
  (NL.content.TABLES || []).forEach(t => {
    const r = report[t.table];
    ok(!!r, 'src/content/' + t.table + '.js n’est pas chargé : l’inscrire dans SRC (build.sh), après les lexiques');
    ok(!r || r.missing.length === 0, 'src/content/' + t.table + '.js : ' + (r ? r.missing.join(', ') : '') + ' ne correspond à aucun mot ni aucune phrase du cours');
  });
  ok((NL.content.TABLES || []).length > 0, 'NL.content.TABLES est vide ou absent : aucune table n’est contrôlée');
  /* Ce qu'une table pose, le lexique ne l'écrit plus : écrit aux deux endroits, la table
     masquerait le lexique sans rien dire. */
  const MOVED = ['be'];
  const written = [];
  RAW.units.forEach(u => ['word', 'phrase'].forEach(kind => (u[kind + 's'] || []).forEach((x, i) =>
    MOVED.forEach(f => { if (x[f] !== undefined && x[f] !== null) written.push(u.id + ':' + kind[0] + i + ' ' + f); }))));
  ok(written.length === 0, written.length + ' champ(s) écrit(s) au lexique (' + written.slice(0, 4).join(', ') + (written.length > 4 ? ', …' : '') +
    ') : leur place est la table de src/content qui pose ce champ');
  console.log('  tables          ' + (NL.content.TABLES || []).map(t => t.table + ' ' + (report[t.table] ? report[t.table].attached : 'absente')).join(', ') +
    ' ; ' + MOVED.join(', ') + ' hors du lexique');

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
  const HOLLOW_BUDGET = 3;
  ok(hollow <= HOLLOW_BUDGET, hollow + ' échelons sans aucun exercice possible, budget ' + HOLLOW_BUDGET + ' — baisser le budget, jamais le lever');
  ok(hollow >= HOLLOW_BUDGET, 'seulement ' + hollow + ' échelons de secours : baisser HOLLOW_BUDGET à ' + hollow + ' pour verrouiller le gain');
  ok(pairs > 5000, 'only ' + pairs + ' exercises were built: the content did not load');
  console.log('  exercices       ' + pairs + ' construits, ' + broken + ' échec(s), ' + hollow + ' échelon(s) de secours');

  /* ================= 3. une phrase d'exemple n'emprunte pas en avant */
  /* src/content/examples.js s'impose « du vocabulaire déjà rencontré ». Non
     vérifiée, la règle était tenue six fois sur sept. Les mots-outils ne
     comptent pas : on ne peut pas écrire une phrase sans eux. L'ordre du cours
     et les mots-outils sont dans test/lib/sequence.js, que les outils de contenu
     lisent aussi. */
  const first = sequence.firstUnits(units);
  let ahead = 0, sentences = 0;
  units.forEach((u, ui) => (u.words || []).forEach(w => (w.drills || []).forEach(d => {
    sentences++;
    if (sequence.ahead(d.nl, ui, first).length) ahead++;
  })));
  const AHEAD_BUDGET = 62;
  ok(ahead <= AHEAD_BUDGET, ahead + ' phrases d’exemple empruntent du vocabulaire à une unité ultérieure, budget ' + AHEAD_BUDGET +
    ' — baisser le budget quand on en corrige, jamais le lever');
  ok(ahead >= AHEAD_BUDGET, 'seulement ' + ahead + ' phrases empruntent en avant : baisser AHEAD_BUDGET à ' + ahead + ' pour verrouiller le gain');
  console.log('  séquence        ' + ahead + ' / ' + sentences + ' phrases empruntent en avant (budget ' + AHEAD_BUDGET + ')');

  /* Les phrases sourcées, src/content/sourced.js : tirées de Tatoeba (src, le numéro de la
     phrase) ou écrites pour le cours (src 'gen'), rangées sous le néerlandais du mot tel que son
     premier listage l'écrit. src/content/examples.js, chargé juste après, les pose sur le mot
     comme les siennes : les contrôles 1, 3 et 6 et test/dehet.js les lisent donc comme les
     autres. Ici : chaque clé est un mot du cours qui n'a pas aussi des phrases écrites à la
     main ; chaque phrase a ses cinq champs, un trou que le texte à trous sait cacher, et aucun
     des noms par défaut ; chaque phrase de Tatoeba est créditée dans
     docs/attribution/tatoeba.tsv, et le fichier ne crédite qu'elles ; aucune n'emploie une forme
     que le cours n'a pas encore enseignée. */
  const sourced = (NL.content.byDutch || {}).sourced, sr = NL.content.sourcedReport;
  ok(!!sourced && !!sr, 'src/content/sourced.js n’est pas chargé : l’inscrire dans SRC (build.sh), juste avant src/content/examples.js');
  ok(!sr || sr.missing.length === 0, 'src/content/sourced.js : ' + (sr ? sr.missing.join(', ') : '') + ' ne correspond à aucun mot du cours');
  const FIELDS = ['en', 'fr', 'gap', 'nl', 'src'];
  const line = s => typeof s === 'string' && s.trim() !== '' && !/[\r\n]/.test(s);
  const credited = [], keys = new Set(), neverTaught = [];
  let fromSource = 0;
  RAW.units.forEach((u, ui) => (u.words || []).forEach((w, i) => {
    if (!sourced || !Object.prototype.hasOwnProperty.call(sourced, w.nl) || keys.has(w.nl)) return;
    keys.add(w.nl);
    const where = u.id + ':w' + i + ' « ' + w.nl + ' »';
    ok(Array.isArray(sourced[w.nl]) && sourced[w.nl].length >= 1 && sourced[w.nl].length <= 2, where + ' : une ou deux phrases dans src/content/sourced.js, pas ' + JSON.stringify(sourced[w.nl]));
    if (!Array.isArray(sourced[w.nl])) return;
    ok(JSON.stringify(w.drills || []) === JSON.stringify(sourced[w.nl]), where + ' a des phrases dans src/content/examples.js et dans src/content/sourced.js : les garder à un seul endroit');
    const own = sequence.forms(w, NL);
    sourced[w.nl].forEach((d, j) => {
      fromSource++;
      const at = where + ' phrase ' + (j + 1);
      ok(Object.keys(d).sort().join() === FIELDS.join(), at + ' : ses champs sont ' + Object.keys(d).sort().join(', ') + ', pas ' + FIELDS.join(', '));
      ok((Number.isInteger(d.src) && d.src > 0) || d.src === 'gen', at + ' : src vaut le numéro d’une phrase de Tatoeba ou « gen », pas ' + JSON.stringify(d.src));
      ok(['nl', 'fr', 'en', 'gap'].every(k => line(d[k])), at + ' : nl, fr, en et gap tiennent chacun sur une ligne, non vide');
      if (!line(d.nl) || !line(d.gap)) return;
      const cloze = NL.ex.get('cloze').build(Object.assign({}, NL.content.byId(u.id + ':w' + i), { drills: [d] }));
      ok(cloze.gap === d.gap && cloze.shown !== d.nl, at + ' : le texte à trous ne sait pas cacher « ' + d.gap + ' » dans « ' + d.nl + ' »');
      ok(![d.nl, d.fr, d.en].some(s => spelling.named(s, NL)), at + ' : une phrase sourcée n’a ni jeton ni nom par défaut (NL.content.DEFAULTS)');
      const never = sequence.unmet(d.nl, ui, first, new Set([...own, ...tokens(d.gap)]));
      if (never.length) neverTaught.push(at + ' : ' + never.join(', '));
      if (Number.isInteger(d.src)) credited.push(w.nl + '\t' + d.src);
    });
  }));
  const CREDITS = 'word\tnld\tnld_owner\teng\teng_owner\tfra\tfra_owner\tadapted';
  const creditFile = path.join(ROOT, 'docs', 'attribution', 'tatoeba.tsv');
  const rows = fs.existsSync(creditFile) ? fs.readFileSync(creditFile, 'utf8').split(/\r?\n/).filter(l => l && l[0] !== '#') : [];
  ok(rows[0] === CREDITS, 'docs/attribution/tatoeba.tsv manque, ou sa première ligne n’est pas « ' + CREDITS.replace(/\t/g, ' ') + ' »');
  const cells = rows.slice(1).map(l => l.split('\t'));
  cells.forEach(c => ok(c.length === 8 && c.every(x => x !== ''), 'docs/attribution/tatoeba.tsv : « ' + c.join(' ') + ' » n’a pas ses huit colonnes remplies'));
  const inFile = cells.map(c => c[0] + '\t' + c[1]);
  credited.filter(p => inFile.indexOf(p) < 0).forEach(p => ok(false, 'la phrase Tatoeba ' + p.split('\t')[1] + ' de « ' + p.split('\t')[0] +
    ' » n’est pas créditée dans docs/attribution/tatoeba.tsv : relancer Merge'));
  inFile.filter(p => credited.indexOf(p) < 0).forEach(p => ok(false, 'docs/attribution/tatoeba.tsv crédite la phrase ' + p.split('\t')[1] + ' de « ' +
    p.split('\t')[0] + ' », qui n’est pas dans src/content/sourced.js : relancer Merge'));
  /* Une phrase sourcée n'emploie, hors des formes de son mot et de son trou, que ce que le cours
     a enseigné jusqu'à l'unité du mot (#12, récit 39) : pas une forme jamais enseignée, pas même
     fléchie d'un mot vu (test/lib/sequence.js dit pourquoi). Check le tient phrase par phrase ;
     ce contrôle le tient ensuite, quand le cours change autour d'elles. Zéro, pas un budget. */
  ok(neverTaught.length === 0, neverTaught.length + ' phrase(s) sourcée(s) emploient ce que le cours n’a pas encore enseigné à l’unité de leur mot : ' +
    neverTaught.join(' ; ') + ' — enseigner la forme plus tôt, ou retirer la phrase');
  /* Une phrase posée dans sourced.js donne au mot les exercices de phrase : une page chargée avec,
     à la place de sourced.js dans SRC, une table d'une seule phrase pour un mot qui n'en a pas
     d'écrite à la main, le montre. */
  const lone = items.find(it => it.kind === 'word' && it.art && it.nl.indexOf('{') < 0 && U.tiles(it.nl).length < 3 && (it.drills || []).every(d => 'src' in d));
  const seeded = { [lone.nl]: [{ nl: 'Waar is ' + lone.nl + ' nu?', fr: '-', en: '-', gap: U.bare(lone.nl), src: 1 }] };
  fs.mkdirSync(path.join(ROOT, '.cache'), { recursive: true });
  const TMP = fs.mkdtempSync(path.join(ROOT, '.cache', 'sourced-'));
  fs.writeFileSync(path.join(TMP, 'sourced.js'), 'NL.content.byDutch = NL.content.byDutch || {};\nNL.content.byDutch[\'sourced\'] = ' + JSON.stringify(seeded) + ';\n');
  const seededAt = path.relative(ROOT, path.join(TMP, 'sourced.js')).split(path.sep).join('/');
  const P = browser.open({ root: ROOT, seed: browser.SEED, skip: [browser.APP],
    files: browser.sources(ROOT).map(f => (f === 'src/content/sourced.js' ? seededAt : f)) }).NL;
  const pit = P.content.byId(lone.id);
  ok(JSON.stringify(pit.drills) === JSON.stringify(seeded[lone.nl]) && P.srs.supports(pit, 'cloze') && P.ex.get('cloze').build(pit).gap === U.bare(lone.nl),
    'une phrase de src/content/sourced.js ne donne pas à ' + lone.id + ' « ' + lone.nl + ' » son texte à trous');
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('  sourcées        ' + fromSource + ' phrase(s) sur ' + keys.size + ' mot(s), ' + credited.length + ' de Tatoeba créditée(s)');

  /* ========================================================== 4. alias */
  /* Un mot ou une phrase listé dans deux unités est un seul élément : build() garde le
     premier listage, dans l'ordre du cours, et fait des suivants ses alias. Sinon il serait
     drillé deux fois en parallèle, et compterait deux fois pour le seuil qui ouvre l'unité
     suivante. On compare le néerlandais, jamais l'identifiant, qui change dès qu'on insère
     un mot. */

  /* Les listages d'un même mot ou d'une même phrase disent la même chose : les mêmes sens
     dans chaque langue, le même article ; et une remarque, s'il y en a une, n'est que sur le
     premier. Une fois les suivants devenus des alias, seul le premier se montre : ce qu'un
     alias dirait seul serait perdu sans bruit. Un groupe, c'est le genre d'élément et le
     néerlandais tel qu'il est écrit, jetons compris, sans casse ni ponctuation. La variante
     flamande n'est plus au lexique : src/content/be.js en tient une par élément. */
  const listings = new Map();
  RAW.units.forEach(u => ['word', 'phrase'].forEach(kind => (u[kind + 's'] || []).forEach((x, i) => {
    const key = kind + '|' + U.norm(x.nl);
    if (!listings.has(key)) listings.set(key, []);
    listings.get(key).push(Object.assign({}, x, { id: u.id + ':' + kind[0] + i }));
  })));
  const senseSet = (x, l) => [...new Set(NL.gloss.senses(x, l))].sort().join(' / ');
  const orNull = v => (v === undefined ? null : v);
  let twice = 0, disagree = 0;
  listings.forEach(group => {
    if (group.length < 2) return;
    twice++;
    const first = group[0];
    group.slice(1).forEach(x => {
      const differ = NL.gloss.LANGS.filter(l => senseSet(x, l) !== senseSet(first, l))
        .map(l => l + ' « ' + NL.gloss.of(x, l) + ' » / « ' + NL.gloss.of(first, l) + ' »')
        .concat(['art'].filter(k => orNull(x[k]) !== orNull(first[k])))
        .concat(x.note ? ['une remarque, que seul le premier listage porte'] : []);
      if (differ.length) disagree++;
      ok(!differ.length, x.id + ' « ' + x.nl + ' » est un alias de ' + first.id + ' et ne dit pas la même chose : ' + differ.join(', '));
    });
  });
  ok(twice > 0, 'aucun élément listé deux fois : le contrôle des alias ne compare rien');
  console.log('  alias           ' + twice + ' élément(s) listé(s) deux fois, ' + disagree + ' en désaccord');

  /* Une seule fiche par groupe : le premier listage est l'élément et porte les ids des
     suivants dans `aliases` ; l'id d'un alias trouve l'élément, pour que ses fiches et ses
     réponses déjà écrites se lisent comme les siennes. Seul le premier est construit : il
     n'est servi, compté et ouvert qu'une fois, dans l'unité qui l'enseigne d'abord. */
  let listed = 0;
  listings.forEach(group => {
    listed += group.length;
    const first = group[0], it = NL.content.byId(first.id), others = group.slice(1).map(x => x.id);
    ok(!!it && JSON.stringify(it.aliases || []) === JSON.stringify(others),
      first.id + ' « ' + first.nl + ' » a pour alias ' + JSON.stringify(it && it.aliases) + ', pas ' + JSON.stringify(others));
    others.forEach(id => ok(NL.content.byId(id) === it,
      id + ' se lit comme ' + (NL.content.byId(id) || {}).id + ', pas comme son premier listage ' + first.id));
  });
  const built = items.filter(it => it.unit !== 'eigen' && it.kind !== 'pattern').length;
  ok(built === listings.size, built + ' mots et phrases construits pour ' + listings.size + ' distincts : un alias est construit à part');
  console.log('  une fiche       ' + listed + ' listages, ' + built + ' mots et phrases construits, ' + listings.size + ' distincts');

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
  /* Chaque sens et chaque texte du cours doit porter un `en`. Il ne reste rien à écrire. */
  ok(JSON.stringify(RAW).indexOf('{naam}') >= 0, 'RAW n’a pas été pris avant la première construction : {naam} a disparu');
  const batches = { lexiqueA1: [], lexiqueA1b: [], exemples: [], grammaire: [], references: [], scenarios: [] };
  RAW.units.forEach((u, i) => owed(u, 'units[' + i + ']', '', []).forEach(r => {
    if (/\.drills\[/.test(r.where)) batches.exemples.push(r);
    else batches[u.n <= 6 ? 'lexiqueA1' : 'lexiqueA1b'].push(r);
  }));
  ['patterns', 'openTasks'].forEach(k => owed(RAW[k], k, '', []).forEach(r => batches.grammaire.push(r)));
  ['register', 'hetRules', 'deRules', 'sheets'].forEach(k => owed(RAW[k], k, '', []).forEach(r => batches.references.push(r)));
  owed(RAW.scenarios, 'scenarios', '', []).forEach(r => batches.scenarios.push(r));
  const left = [];
  Object.keys(batches).forEach(b => batches[b].filter(r => !r.ok).forEach(r => left.push(b + ' ' + r.where)));
  ok(left.length === 0, 'rien n’est dû : ' + left.length + ' anglais manquent   [' + left.slice(0, 3).join(', ') + ']');
  console.log('  anglais dû     ' + left.length + ' (rien n’est dû)');
  /* La séance de contrôle relit chaque endroit par son `where` (test/tools/check-files.js) : chacun
     désigne quelque chose, et un chemin qui ne désigne rien s'arrête au lieu de donner une ligne vide. */
  const lost = [];
  Object.keys(batches).forEach(b => batches[b].forEach(r => { try { at(RAW, r.where); } catch (e) { lost.push(r.where); } }));
  ok(lost.length === 0, 'where : ' + lost.length + ' chemins de owed() ne désignent rien   [' + lost.slice(0, 3).join(', ') + ']');
  let refused = '';
  try { at(RAW, 'units[0].nowhere[3]'); } catch (e) { refused = e.message; }
  ok(refused.indexOf('units[0].nowhere[3]') >= 0, 'where : at() rend une valeur pour un chemin qui ne désigne rien');

  /* Parcours de RAW : tout objet qui porte un `en` porte un `fr`, et les mêmes chiffres et {jetons}. */
  let lonely = 0, drift = 0;
  const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).sort().join('|');
  ok(sig('{naam} arrive à 3 h') === sig('Arrives at 3, {naam}'), 'sig : un jeton et un chiffre dans un autre ordre ne sont pas une dérive');
  ok(sig('3 h') !== sig('4 h'), 'sig : un chiffre qui change reste une dérive');
  tree.visitCourse(RAW, (v, key, where) => {
    if (!v || typeof v !== 'object') return;
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
  /* Les paires d'éléments qui partagent un sens anglais sans partager de sens français ni néerlandais. */
  const clashes = its => {
    const out = [];
    for (let i = 0; i < its.length; i++) for (let j = i + 1; j < its.length; j++) if (!G.sameSense(its[i], its[j])) out.push([its[i], its[j]]);
    return out;
  };
  { const A = { id: 'A', nl: 'aa', fr: 'x / y', en: 'e' }, Bb = { id: 'B', nl: 'bb', fr: 'x', en: 'e' }, C = { id: 'C', nl: 'cc', fr: 'y', en: 'e' };
    const found = clashes([A, Bb, C]);
    ok(found.length === 1 && found[0][0].id === 'B' && found[0][1].id === 'C',
      'clashes : B et C partagent un sens anglais sans sens français commun, la garde doit le dire'); }
  bySense.forEach((its, s) => clashes(its).forEach(p => {
    ok(false, 'même anglais « ' + s + ' » pour deux éléments sans sens français ni néerlandais commun : ' +
      p[0].id + ' « ' + p[0].nl + ' » et ' + p[1].id + ' « ' + p[1].nl + ' »');
  }));
  /* Le néerlandais u/uw glosé « you » : en Flandre, u est aussi le tutoiement, et c'est le français qui le dit. */
  const hasU = nl => /(^|[^a-zà-ÿ])uw?(?![a-zà-ÿ])/i.test(nl);
  const frTu = fr => /(^|[^a-zà-ÿ])((tu|te|toi|ton|ta|tes)(?![a-zà-ÿ])|t['’])/i.test(fr);
  const uTag = fr => frTu(fr) ? '(informal, Flemish u)' : '(formal)';
  ok(uTag('C’était comment, ton week-end ?') === '(informal, Flemish u)', 'uTag : « ton » est un tutoiement');
  ok(uTag('Et vous ?') === '(formal)', 'uTag : « vous » est formel');
  ok(uTag('Je t’appelle demain.') === '(informal, Flemish u)', 'uTag : « t’ » est un tutoiement');
  ok(uTag('Il a mis la table') === '(formal)', 'uTag : « ta » ne se lit pas au milieu d’un mot');
  glossed.forEach(it => {
    if (G.wordClass(it, 'fr') === 'verb') ok(/^to\s+\S/i.test(it.en), it.id + ' « ' + it.nl + ' » est un verbe en français, et son anglais « ' + it.en + ' » ne commence pas par « to »');
    if (hasU(it.nl) && /\byou(r)?\b/i.test(it.en)) { const t = uTag(it.fr);
      ok(it.en.indexOf(t) >= 0, it.id + ' « ' + it.nl + ' » : « ' + it.en + ' » doit porter « ' + t + ' » (« (informal, Flemish u) » si le français tutoie, « (formal) » sinon)'); }
    if (it.art) ok(!/^(the|an|a)\s/i.test(it.en), it.id + ' « ' + it.nl + ' » est un nom : « ' + it.en + ' » ne prend pas d’article');
  });
  /* Toute autre ligne du cours (référence, scénarios, phrases d'exemple…) dont l'anglais porte déjà une étiquette
     de registre : si son néerlandais a u/uw, l'étiquette doit être la bonne. Une ligne sans étiquette n'est pas tenue d'en prendre une. */
  tree.visitCourse(RAW, (v, key, where) => {
    if (!v || typeof v.nl !== 'string' || typeof v.fr !== 'string' || typeof v.en !== 'string' || !hasU(v.nl)) return;
    if (!/\((formal|informal)/.test(v.en)) return;
    const t = uTag(v.fr);
    ok(v.en.indexOf(t) >= 0, where + ' « ' + v.nl + ' » : « ' + v.en + ' » doit porter « ' + t + ' »');
  });
  /* Dans l'explication d'un point de grammaire, un <i> dont le texte est le même en français et en anglais est du
     néerlandais (<i>Morgen ik ga</i>) ; <i>element</i> / <i>élément</i> diffèrent, c'est de la prose. Il porte lang="nl-BE". */
  { let seenI = 0;
    /* Chaque <i> sans balise dedans : la balise entière, et son texte, lu dans la balise même. */
    const iTags = s => Array.from(String(s).matchAll(/<i(?:\s[^>]*)?>([^<]*)<\/i>/g), m => ({ tag: m[0], text: m[1] }));
    (RAW.patterns || []).forEach(g => {
      const ex = g.explain;
      if (!ex || typeof ex.fr !== 'string' || typeof ex.en !== 'string') return;
      const en = iTags(ex.en).map(i => i.text);
      iTags(ex.fr).forEach(i => {
        seenI++;
        if (en.indexOf(i.text) >= 0) ok(/^<i\s[^>]*lang="nl-BE"/.test(i.tag), g.id + ' : « ' + i.text + ' » est du néerlandais dans <i> : lui donner lang="nl-BE"');
      });
    });
    ok(seenI > 0, 'aucun <i> dans les explications de grammaire : le contrôle est creux'); }
  console.log('  gardes         ' + glossed.length + ' éléments glosés en anglais contrôlés');

  console.log('\n' + checks + ' contrôles, ' + (fails === 0 ? 'CONTENU CONFORME' : fails + ' ÉCHEC(S)'));
  process.exit(fails ? 1 : 0);
}).catch(e => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
