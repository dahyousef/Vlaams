/* Le genre phrases : les cinq phrases de chacune des unités 13 à 34 (UNITS du genre words), prises
   dans Tatoeba. La tâche « FAN phrases » du plan 4c en écrit les lignes ; ce module les coupe, les
   vérifie et les fond (tools/content/lib/kit.js). Sa source n'est pas un élément du cours mais une
   unité (sourceOf, comme words) : une ligne est l'unité entière, et son id est celui de l'unité.
   Split range pour chaque unité sans phrase jusqu'à MAX candidates de l'extrait de Tatoeba
   (tools/content/tatoeba.js), chacune avec ses traductions liées ; le rédacteur en prend cinq, telles
   que Tatoeba les écrit, avec leur anglais et leur français liés, ou, quand Tatoeba n'en lie qu'un
   (D17), l'autre écrit par le rédacteur. Une ligne écrite :
     phrases   5 × { src, nl, en, enSrc, fr, frSrc } : src le numéro de la phrase néerlandaise, nl son
               texte tel quel, enSrc (frSrc) le numéro de la traduction liée, ou null quand Tatoeba
               n'en lie aucune dans cette langue et que en (fr) est écrit pour le cours
     edited    facultatif, la raison sur une ligne, quand un en ou un fr n'est pas le texte lié
   La règle stricte : chaque forme d'une phrase est enseignée à son unité ou avant (les mots-outils de
   test/lib/sequence.js exceptés) ; une phrase n'enseigne donc rien de neuf, et AHEAD_BUDGET
   (test/content.js) ne bouge pas. Une candidate a de 3 à 8 tuiles (moins de 3, et test/content.js
   compte un échelon sans exercice), écrit un mot de l'unité, n'est ni le néerlandais d'un élément ni
   celui d'une phrase d'exemple, et ne tombe sous aucune garde de la suite (rules). Le classement :
   traduite dans les deux langues, en anglais seul, en français seul (D17) ; puis les mots de l'unité
   qu'elle écrit, le plus d'abord ; puis sans je, jij, jou, jouw ; puis d'un auteur de langue
   maternelle ; moins de tuiles ; l'id.
   Merge n'écrit aucune table : son write récrit src/content/phrases.a1c.js entier (chaque unité y range
   ses phrases au chargement, et une unité absente lève une erreur qui la nomme), ajoute à
   test/data/ids.tsv une ligne par phrase (<unité>:p<i>) et récrit docs/attribution/tatoeba-phrases.tsv
   entier, une ligne par phrase. L'empreinte (n, name.en) ne couvre rien que Merge écrive : relancée,
   elle récrit les mêmes fichiers. Les lignes imprimées sont en anglais, comme celles du kit. */
const fs = require('fs'), path = require('path');
const tatoeba = require('../tatoeba');
const examples = require('./examples');
const { UNITS } = require('./words');
const { literal: lit } = require('../lib/table');
const sequence = require('../../../test/lib/sequence');
const spelling = require('../../../test/lib/spelling');
const { tokens } = spelling;
const { oneLine, sig, hasU, uTag } = require('../../../test/lib/text');
const { courseWords } = require('../../../test/lib/dutch');

const MAX = 40, PER_BATCH = 6, PHRASES = 5;
/* Moins de 3 tuiles, et bank, cloze et corrige ne se construisent pas (NL.srs.supports) : test/content.js
   compterait un échelon de secours de plus (HOLLOW_BUDGET). 8 : la plus longue phrase du cours (grammar.TILES). */
const TILES = { min: 3, max: 8 };
const FIELDS = ['src', 'nl', 'en', 'enSrc', 'fr', 'frSrc'];
const FILE = path.join('src', 'content', 'phrases.a1c.js');
const IDS = path.join('test', 'data', 'ids.tsv');
const CREDIT = path.join('docs', 'attribution', 'tatoeba-phrases.tsv');
const CREDITS = 'unit	nld	nld_owner	eng	eng_owner	fra	fra_owner	adapted';

/* Le cours lu pour les lignes, une fois par chargement : l'ordre des unités, la première unité de chaque
   forme, l'orthographe, le néerlandais déjà pris (les éléments, leurs phrases d'exemple, les règles et
   leurs exercices), ce que test/lang.js 6d.4 refuserait (examples.bareOf), l'extrait quand on le
   demande, et les phrases des lignes que Check a déjà vues dans ce passage (drafted, par id de ligne :
   kit.js fait un ctx par lot, et une reprise ou un change remplace la ligne qu'il reprend). */
const memo = new WeakMap();
function tools(ctx) {
  if (!memo.has(ctx)) {
    const C = ctx.course(), NL = C.NL, U = NL.util, taken = new Map();
    /* self : l'unité dont la phrase est déjà une phrase fondue (phrases.a1c.js) : sa propre ligne, relue ou
       refondue, la récrit sans la redire. */
    const take = (nl, what, self) => { const k = U.norm(nl); if (!taken.has(k)) taken.set(k, { what, self: self || null }); };
    C.sources.forEach(s => {
      take(s.nl, 'the Dutch of ' + s.id, s.kind === 'phrase' && UNITS.some(u => u.id === s.unit) ? s.unit : null);
      (s.drills || []).forEach(d => take(d.nl, 'an example sentence of ' + s.id));
    });
    (C.RAW.patterns || []).forEach(p => { take(p.nl, 'the example of the rule ' + p.id); (p.drills || []).forEach(d => take(d.nl, 'a drill of the rule ' + p.id)); });
    let T = null;
    memo.set(ctx, {
      C, NL, order: C.units.map(u => u.id), first: sequence.firstUnits(C.RAW), S: spelling.open(ctx.repo, NL), taken,
      bare: examples.bareOf(C, ctx.repo), drafted: new Map(),
      extract: () => T || (T = tatoeba.load(ctx.repo))
    });
  }
  return memo.get(ctx);
}

/* La source d'une ligne : son unité, telle que UNITS l'écrit, dont nl est l'id, et fr et en le nom de l'unité
   (l'outil de lecture les montre ; l'empreinte lit n et name.en). */
const unitOf = (C, id) => C.units.find(u => u.id === id);
function sourceOf(C, id) {
  const u = UNITS.find(x => x.id === id);
  if (!u) return undefined;
  const cu = unitOf(C, id), name = cu ? cu.name : u.name;
  return Object.assign({}, u, { nl: u.id, fr: name.fr, en: name.en });
}

/* Ce que le cours dit contre une unité : il ne l'a pas (lexicon.a1c.js se charge avant phrases.a1c.js). */
const against = (C, units) => units.filter(u => !unitOf(C, u.id)).map(u => 'unit « ' + u.id + ' » of UNITS is not a unit of the course');

/* Les règles d'une phrase, à l'unité ui : ce que la suite tiendrait à Merge, dit dans son lot. Split les
   tient sur chaque candidate ; Check les redit sur chaque phrase prise, le cours ayant pu bouger. Une phrase
   déjà fondue pour l'unité T.order[ui] n'est pas « déjà prise » : c'est la ligne même, relue ou refondue. */
function rules(nl, ui, T, at) {
  const U = T.NL.util, out = [], list = ws => ws.map(w => '« ' + w + ' »').join(', ');
  const n = U.tiles(nl).length;
  if (n < TILES.min || n > TILES.max) out.push(at + ' has ' + n + ' tiles: ' + TILES.min + ' to ' + TILES.max);
  const ahead = sequence.ahead(nl, ui, T.first);
  if (ahead.length) out.push(at + ' borrows from a later unit: ' + ahead.map(t => t + ' (' + T.order[T.first.get(t)] + ')').join(', '));
  const never = sequence.unmet(nl, ui, T.first, new Set()).filter(t => ahead.indexOf(t) < 0);
  if (never.length) out.push(at + ' uses forms no unit up to « ' + T.order[ui] + ' » teaches: ' + never.join(', '));
  const unknown = U.uniq(tokens(nl).filter(t => !T.S.known(t)));
  if (unknown.length) out.push(at + ': ' + list(unknown) + ' not a form OpenTaal or flemish.tsv knows');
  if (spelling.named(nl, T.NL)) out.push(at + ' names no one by default and holds no {…} token');
  if (/\bhoe\s+lang\b/i.test(nl)) out.push(at + ' writes « hoe lang »: the course writes the duration « hoelang » (#128)');
  const had = T.taken.get(U.norm(nl));
  if (had && had.self !== T.order[ui]) out.push(at + ' « ' + nl + ' » is already ' + had.what);
  courseWords(nl).filter(w => !T.bare.dutch.has(w) && T.bare.bare.has(w)).forEach(w =>
    out.push(at + ': « ' + w + ' » would become Dutch of the course, and ' + T.bare.bare.get(w) + ' writes it bare in French and in English (test/lang.js 6d.4)'));
  return out;
}

/* Les candidates d'une unité, classées, sans limite : chaque phrase de l'extrait qui écrit un mot de l'unité
   (une de ses formes, ou ses formes à la suite pour un mot de plusieurs) et passe les règles. */
function rank(T, u, ui, tl) {
  const NL = tl.NL, U = NL.util, pool = new Map();
  const run = (s, word) => (' ' + tokens(s).join(' ') + ' ').indexOf(' ' + word.join(' ') + ' ') >= 0;
  (u.words || []).forEach(w => {
    const own = sequence.forms(w, NL), word = tokens(U.bare(w.nl));
    const hit = s => { if (!pool.has(s.id)) pool.set(s.id, { s, used: new Set() }); pool.get(s.id).used.add(w.nl); };
    if (word.length === 1) own.forEach(f => (T.byForm.get(f) || []).forEach(hit));
    else (T.byForm.get(word[0]) || []).forEach(s => { if (run(s.text, word)) hit(s); });
  });
  const je = c => (tokens(c.nl).some(t => tatoeba.JE.indexOf(t) >= 0) ? 1 : 0);
  const cls = c => (c.en.length && c.fr.length ? 0 : c.en.length ? 1 : 2);
  const order = (u.words || []).map(w => w.nl);
  return [...pool.values()].filter(x => !rules(x.s.text, ui, tl, 's').length)
    .map(x => ({
      id: x.s.id, nl: x.s.text, owner: x.s.owner, native: x.s.native,
      en: x.s.eng.map(id => ({ id, text: T.eng.get(id).text, owner: T.eng.get(id).owner })),
      fr: x.s.fra.map(id => ({ id, text: T.fra.get(id).text, owner: T.fra.get(id).owner })),
      tiles: U.tiles(x.s.text).length, words: order.filter(w => x.used.has(w))
    }))
    .sort((a, b) => cls(a) - cls(b) || b.words.length - a.words.length || je(a) - je(b) || (b.native ? 1 : 0) - (a.native ? 1 : 0) || a.tiles - b.tiles || a.id - b.id)
    .map(c => ({ id: c.id, nl: c.nl, owner: c.owner, en: c.en, fr: c.fr, tiles: c.tiles, words: c.words }));
}

/* Split : une ligne par unité de UNITS sans phrase, ses MAX premières candidates, en lots d'unités entières de
   PER_BATCH au plus (examples.cut). Une unité fondue a ses phrases : un second Split ne la coupe pas. */
function split(C, ctx) {
  const tl = tools(ctx), problems = against(C, UNITS);
  if (problems.length) throw new Error(problems.join('; '));
  const T = tl.extract();
  const groups = UNITS.map(u => unitOf(C, u.id)).filter(u => !(u.phrases || []).length).map(u => ({
    unit: u.id,
    rows: [{ id: u.id, unit: u.id, n: u.n, name: u.name, words: (u.words || []).map(w => w.nl), candidates: rank(T, u, tl.order.indexOf(u.id), tl).slice(0, MAX) }]
  }));
  return examples.cut(groups, PER_BATCH);
}

/* Check : cinq phrases, chacune une candidate de la ligne, telle que l'extrait l'écrit, ses traductions liées
   (D17 : null pour une langue que Tatoeba ne lie pas, écrite alors pour le cours), les règles à HEAD, et ce que
   test/content.js tient des sens d'un élément : les mêmes chiffres en fr et en en, ni jeton ni nom par défaut,
   l'étiquette d'un u glosé you, un anglais qu'aucun autre élément ne dit sans un sens français commun (ni du
   cours, ni de la ligne, ni d'une autre ligne vue dans ce passage), et l'apostrophe « ’ » d'un côté écrit. */
function check(row, input, ctx) {
  const out = [], list = row.phrases;
  if (!Array.isArray(list) || list.length !== PHRASES || list.some(d => !d || typeof d !== 'object' || Array.isArray(d))) {
    return ['phrases is a list of ' + PHRASES + ' phrases, not ' + (Array.isArray(list) ? list.length : typeof list)];
  }
  if ('edited' in row && !oneLine(row.edited)) out.push('edited is a reason on one line with no space at either end');
  const tl = tools(ctx), C = tl.C, U = tl.NL.util, G = tl.NL.gloss, ui = tl.order.indexOf(input.unit);
  let T;
  try { T = tl.extract(); } catch (e) { return out.concat([e.message]); }
  const changed = [], seen = new Map(), mine = [];
  const others = [].concat(...[...tl.drafted].filter(([id]) => id !== row.id).map(([, items]) => items));
  list.forEach((d, j) => {
    const at = 'phrase ' + (j + 1);
    if (Object.keys(d).slice().sort().join() !== FIELDS.slice().sort().join()) { out.push(at + ' has the fields ' + FIELDS.join(', ') + ', not ' + Object.keys(d).join(', ')); return; }
    if (![d.nl, d.en, d.fr].every(oneLine)) { out.push(at + ': nl, en and fr are each a string on one line with no space at either end'); return; }
    const s = T.nld.get(d.src);
    if (!(input.candidates || []).some(c => c.id === d.src) || !s) { out.push(at + ': src ' + d.src + ' is not one of the row\'s candidates'); return; }
    if (d.nl !== s.text) out.push(at + ': nl is not Tatoeba\'s sentence ' + d.src + ', « ' + s.text + ' »: a phrase is taken as Tatoeba writes it');
    const sides = [['en', 'eng'], ['fr', 'fra']], written = sides.filter(([l]) => d[l + 'Src'] === null);
    if (written.length === 2) { out.push(at + ': enSrc and frSrc are both null: a phrase keeps at least one translation Tatoeba links'); return; }
    written.forEach(([l]) => { if (/'/.test(d[l])) out.push(at + ': a written ' + l + ' takes the apostrophe « ’ », not « \' »'); });
    sides.forEach(([l, k]) => {
      const id = d[l + 'Src'];
      if (id === null) { if (s[k].length) out.push(at + ': ' + l + 'Src is null, but Tatoeba links ' + s[k].join(', ') + ' to ' + d.src + ': take one'); return; }
      const t = T[k].get(id);
      if (s[k].indexOf(id) < 0 || !t) { out.push(at + ': ' + l + 'Src ' + id + ' is not a translation Tatoeba links to ' + d.src); return; }
      if (d[l] !== t.text) changed.push(at + ': ' + l + ' « ' + d[l] + ' » is not Tatoeba\'s ' + id + ', « ' + t.text + ' »');
    });
    const key = U.norm(d.nl);
    if (seen.has(key)) out.push(at + ' « ' + d.nl + ' » repeats phrase ' + seen.get(key));
    else seen.set(key, j + 1);
    rules(d.nl, ui, tl, at).forEach(r => out.push(r));
    if (sig(d.en) !== sig(d.fr)) out.push(at + ': en and fr do not hold the same digits');
    if ([d.en, d.fr].some(x => spelling.named(x, tl.NL))) out.push(at + ': en and fr name no one by default and hold no {…} token');
    if (hasU(d.nl) && /\byou(r)?\b/i.test(d.en) && d.en.indexOf(uTag(d.fr)) < 0) {
      out.push(at + ': nl says « u » and en « you »: en carries « ' + uTag(d.fr) + ' » (« (informal, Flemish u) » when fr says tu, « (formal) » otherwise), as test/content.js asks');
    }
    const item = { id: input.unit + ':p' + j, kind: 'phrase', nl: d.nl, fr: d.fr, en: d.en };
    C.sources.concat(others, mine).filter(x => G.sameMeaning(item, x) && !G.sameSense(item, x)).forEach(x =>
      out.push(at + ': en « ' + d.en + ' » shares a sense with ' + x.id + ' « ' + x.nl + ' » (' + x.en + '), which shares no French sense and no Dutch: give one of them another English, or the French they share'));
    mine.push(item);
  });
  tl.drafted.set(row.id, mine);
  if (changed.length && !oneLine(row.edited)) changed.forEach(c => out.push(c + ': take it as written, or say why in edited, on one line with no space at either end'));
  if (!changed.length && 'edited' in row && oneLine(row.edited)) out.push('edited is for a translation that is not Tatoeba\'s, and every linked one is taken as written');
  return out;
}

/* Le texte du fichier : l'en-tête, puis chaque unité et ses cinq phrases, dans l'ordre de UNITS. U range les
   phrases dans l'unité au chargement et lève une erreur, avec l'id de l'unité, quand elle manque : sinon des
   phrases qu'aucune unité ne liste ne sont jamais construites, et rien ne le dit. */
const pair = g => '{ fr: ' + lit(g.fr) + ', en: ' + lit(g.en) + ' }';
const HEADER = [
  '/* Phrases des unités 13 à 34, prises dans Tatoeba (docs/attribution/tatoeba-phrases.tsv les crédite).',
  '   Même forme que les phrases de lexicon.a1.js, plus src, le numéro de la phrase de Tatoeba.',
  '   Écrit par la fusion du genre phrases (tools/content/kinds/phrases.js) depuis ses lignes prises :',
  '   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités de',
  '   lexicon.a1c.js gardent phrases: [] dans leur fichier ; U range les phrases de chaque unité dans sa',
  '   liste au chargement, et lève une erreur, avec l’id de l’unité, quand l’unité manque. */',
  'NL.content = NL.content || {};',
  'NL.content.units = NL.content.units || [];',
  '(function () {',
  '  \'use strict\';',
  '  const P = (nl, g, src) => ({ kind: \'phrase\', nl, ...NL.gloss.pair(g), src });',
  '  const U = (id, phrases) => {',
  '    const u = NL.content.units.find(x => x.id === id);',
  '    if (!u) throw new Error(\'phrases.a1c.js : les phrases de l’unité « \' + id + \' » n’ont pas leur unité dans le cours (lexicon.a1c.js se charge avant)\');',
  '    (u.phrases = u.phrases || []).push(...phrases);',
  '  };'
];
function file(units) {
  const lines = HEADER.slice();
  units.forEach(({ unit, phrases }) => {
    lines.push('', '  U(' + lit(unit) + ', [');
    phrases.forEach((d, k) => lines.push('    P(' + lit(d.nl) + ', ' + pair(d) + ', ' + d.src + ')' + (k < phrases.length - 1 ? ',' : '')));
    lines.push('  ]);');
  });
  lines.push('})();');
  return lines;
}

/* Merge : refuse, avant d'écrire, une unité que le cours n'a pas, deux lignes prises qui écrivent la même phrase,
   une phrase qui redit un néerlandais du cours (il a pu bouger depuis Split), une unité que phrases.a1c.js tient
   et que nulle ligne prise n'écrit (le fichier se récrit entier), et un id qu'ids.tsv épingle à une autre phrase ;
   puis récrit le fichier, ajoute à ids.tsv et récrit le crédit, ses lignes « # » gardées. Relancée avec les
   mêmes lignes, elle récrit la même chose et n'ajoute rien à ids.tsv. */
function write(taken, ctx) {
  const tl = tools(ctx), C = tl.C, U = tl.NL.util;
  const units = UNITS.filter(u => taken.some(x => x.id === u.id));
  const problems = against(C, units);
  if (problems.length) throw new Error(problems.join('; '));
  const mine = new Map(), twice = [];
  taken.forEach(x => x.row.phrases.forEach(d => {
    const k = U.norm(d.nl), had = tl.taken.get(k);
    if (had && had.self !== x.id) throw new Error(x.id + ' « ' + d.nl + ' » is already ' + had.what + ': the course moved since Split');
    if (mine.has(k) && mine.get(k) !== x.id) twice.push(x.id + ' and ' + mine.get(k) + ' both write « ' + d.nl + ' »');
    else mine.set(k, x.id);
  }));
  if (twice.length) throw new Error(twice.join('; ') + ': one phrase, one unit');
  /* Le même anglais dans deux unités sans sens français commun : bySense (test/content.js) le refuserait après
     Merge ; Check ne le voit que dans son lot. */
  const G = tl.NL.gloss, said = [].concat(...taken.map(x => x.row.phrases.map((d, i) => ({ id: x.id + ':p' + i, unit: x.id, kind: 'phrase', nl: d.nl, fr: d.fr, en: d.en }))));
  const clash = [].concat(...said.map((a, i) => said.slice(i + 1).filter(b => b.unit !== a.unit && G.sameMeaning(a, b) && !G.sameSense(a, b))
    .map(b => a.id + ' « ' + a.nl + ' » and ' + b.id + ' « ' + b.nl + ' » share the English sense « ' + a.en + ' » with no French sense in common')));
  if (clash.length) throw new Error(clash.join('; ') + ': give one of them another English');
  C.units.filter(u => UNITS.some(x => x.id === u.id) && (u.phrases || []).length && !taken.some(x => x.id === u.id)).forEach(u => {
    throw new Error('phrases.a1c.js holds the phrases of the unit ' + u.id + ', and no taken row writes them: Merge rewrites the file whole');
  });
  const out = units.map(u => ({ unit: u.id, phrases: taken.find(x => x.id === u.id).row.phrases, input: taken.find(x => x.id === u.id).input }));

  const ids = path.join(ctx.repo, IDS), text = fs.readFileSync(ids, 'utf8'), ieol = /\r\n/.test(text) ? '\r\n' : '\n';
  const pinned = new Map(text.split(/\r?\n/).filter(Boolean).map(l => l.split('\t')));
  const added = [];
  out.forEach(({ unit, phrases }) => phrases.forEach((d, i) => {
    const id = unit + ':p' + i;
    if (!pinned.has(id)) { added.push(id + '\t' + d.nl); return; }
    if (pinned.get(id) !== d.nl) throw new Error('test/data/ids.tsv pins ' + id + ' to « ' + pinned.get(id) + ' », and Merge writes « ' + d.nl + ' » there');
  }));

  const f = path.join(ctx.repo, FILE), old = fs.readFileSync(f, 'utf8'), eol = /\r\n/.test(old) ? '\r\n' : '\n';
  fs.writeFileSync(f, file(out).map(l => l + eol).join(''));
  if (added.length) fs.writeFileSync(ids, text + (text && !/\r?\n$/.test(text) ? ieol : '') + added.map(l => l + ieol).join(''));

  /* Le crédit : une ligne par phrase, dans l'ordre du fichier ; une traduction écrite pour le cours (D17) :
     « - » dans ses deux colonnes, sa langue dans adapted, comme une traduction changée (examples.credit). */
  const cf = path.join(ctx.repo, CREDIT), was = fs.existsSync(cf) ? fs.readFileSync(cf, 'utf8') : '', ceol = /\r\n/.test(was) ? '\r\n' : '\n';
  const head = was.split(/\r?\n/).filter(l => l[0] === '#');
  const owner = o => o || '-', side = (id, t) => (t ? [id, owner(t.owner)] : ['-', '-']);
  const rows = [];
  out.forEach(({ unit, phrases, input }) => phrases.forEach(d => {
    const c = input.candidates.find(x => x.id === d.src);
    const en = c.en.find(x => x.id === d.enSrc), fr = c.fr.find(x => x.id === d.frSrc);
    const adapted = [!en || d.en !== en.text ? 'en' : '', !fr || d.fr !== fr.text ? 'fr' : ''].filter(Boolean).join(' ') || '-';
    rows.push([unit, d.src, owner(c.owner)].concat(side(d.enSrc, en), side(d.frSrc, fr), [adapted]).join('\t'));
  }));
  fs.writeFileSync(cf, head.concat([CREDITS], rows).join(ceol) + ceol);
  return ['ok phrases.a1c.js ' + rows.length + ' phrases in ' + out.length + ' units', 'ok ids.tsv ' + added.length + ' added', 'ok tatoeba-phrases.tsv ' + rows.length + ' rows'];
}

module.exports = {
  stamp: [u => u.n, u => u.name.en],
  fields: ['phrases'],
  optional: ['edited'],
  tables: [],
  sourceOf,
  split,
  check,
  merge: () => ({}),
  write,
  readWhole: row => ((row.phrases || []).some(d => d.enSrc === null || d.frSrc === null) ? 'written translation'
    : 'edited' in row ? 'edited translation' : ''),
  tools, rules, rank, file,
  MAX, PER_BATCH, PHRASES, TILES, CREDITS, HEADER
};
