/* Le genre examples (décision 5a) : une ou deux phrases de Tatoeba pour chaque mot du cours qui
   n'a pas de phrase d'exemple. Split range les candidates de chacun (tools/content/tatoeba.js) et
   coupe les mots qui en ont en lots d'unités entières ; le rédacteur en prend une ou deux, telles
   que Tatoeba les écrit (5b), chacune avec une traduction anglaise et une française que Tatoeba
   lui lie ; Check refait à HEAD les règles du classement ; Merge écrit les phrases dans
   src/content/sourced.js, sous le néerlandais du mot, et récrit docs/attribution/tatoeba.tsv.

   Une ligne écrite : { id, stamp, sentences: [phrase…] }, de 0 à 2 phrases, et skip, la raison
   sur une ligne, quand il n'y en a aucune. Une phrase : { src, nl, gap, en, enSrc, fr, frSrc },
   et edited, la raison sur une ligne, quand en ou fr n'est pas le texte de Tatoeba.

   L'empreinte : le sens, l'article et le nombre de phrases écrites à la main
   (src/content/examples.js). Les phrases sourcées n'y sont pas : Merge les écrit, et une
   seconde Merge ne doit pas trouver ses propres lignes périmées.

   Le genre examples-gen (tools/content/kinds/examples-gen.js) reprend d'ici RULES, cut, MAX et
   stamp. Ce que Check imprime est en anglais, comme le reste du kit. */
const fs = require('fs'), path = require('path');
const tatoeba = require('../tatoeba');
const table = require('../lib/table');
const sequence = require('../../../test/lib/sequence');
const spelling = require('../../../test/lib/spelling');
const { tokens } = spelling;
const { oneLine, sig } = require('../../../test/lib/text');

const MAX = 40;
const FIELDS = ['src', 'nl', 'gap', 'en', 'enSrc', 'fr', 'frSrc'];
const CREDITS = 'word	nld	nld_owner	eng	eng_owner	fra	fra_owner	adapted';

const hand = s => (s.drills || []).filter(d => !('src' in d)).length;

/* Ce que le cours donne aux règles, une fois par chargement : l'ordre des unités, la première
   unité de chaque forme, l'orthographe, et l'extrait de Tatoeba quand on le demande. */
const memo = new WeakMap();
function seen(C, repo) {
  if (!memo.has(C)) memo.set(C, { order: C.RAW.units.map(u => u.id), first: sequence.firstUnits(C.RAW), S: spelling.open(repo, C.NL), T: null });
  return memo.get(C);
}
const extractOf = (C, repo) => {
  const v = seen(C, repo);
  return v.T || (v.T = tatoeba.load(repo));
};

/* Les règles d'une phrase pour un mot, à l'unité du mot : ce que test/content.js tient des
   phrases sourcées, et ce que le classement de Tatoeba demande. « at » nomme la phrase. */
function RULES(d, at, src, C, repo) {
  const U = C.NL.util, v = seen(C, repo), out = [];
  const ui = v.order.indexOf(src.unit), own = sequence.forms(src, C.NL);
  const ts = U.tiles(d.nl), gap = tokens(d.gap);
  if (ts.length < 4 || ts.length > 8) out.push(at + ' has ' + ts.length + ' tiles: 4 to 8');
  const cloze = C.NL.ex.get('cloze').build(Object.assign({}, src, { drills: [d] }));
  if (cloze.gap !== d.gap || cloze.shown === d.nl || gap.length !== 1 || !own.has(gap[0])) {
    out.push(at + ': gap « ' + d.gap + ' » is not the word, one tile as nl writes it, that the cloze can hide');
  }
  const ahead = sequence.ahead(d.nl, ui, v.first);
  if (ahead.length) out.push(at + ' borrows from a later unit: ' + ahead.join(', '));
  /* #12, récit 39 : rien que le cours n'enseigne jamais, pas même une forme fléchie d'un mot vu. */
  const never = sequence.unmet(d.nl, ui, v.first, new Set([...own, ...gap])).filter(t => ahead.indexOf(t) < 0);
  if (never.length) out.push(at + ' uses forms the course never teaches: ' + never.join(', '));
  const unknown = tokens(d.nl).filter(t => !v.S.known(t));
  if (unknown.length) out.push(at + ': ' + unknown.map(t => '« ' + t + ' »').join(', ') + ' not a form OpenTaal knows');
  if ([d.nl, d.en, d.fr].some(s => spelling.named(s, C.NL))) out.push(at + ' names no one by default and holds no {…} token');
  if (sig(d.en) !== sig(d.fr)) out.push(at + ': en and fr do not hold the same digits');
  return out;
}

/* Les lots : des unités entières, dans l'ordre du cours, autant de lots qu'il en faut pour que
   chacun tienne à peu près MAX lignes, et le plus gros le plus petit possible. Un lot porte le
   nom de sa première unité, et de sa dernière quand il en a plusieurs. */
function cut(groups, max) {
  const total = groups.reduce((n, g) => n + g.rows.length, 0);
  if (!total) return [];
  const want = Math.ceil(total / max);
  const pack = cap => groups.reduce((out, g) => {
    const last = out[out.length - 1];
    if (last && last.n + g.rows.length <= cap) { last.units.push(g); last.n += g.rows.length; } else out.push({ units: [g], n: g.rows.length });
    return out;
  }, []);
  let cap = Math.max.apply(null, [Math.ceil(total / want)].concat(groups.map(g => g.rows.length)));
  while (pack(cap).length > want) cap++;
  return pack(cap).map(p => ({
    batch: p.units[0].unit + (p.units.length > 1 ? '-' + p.units[p.units.length - 1].unit : ''),
    rows: [].concat.apply([], p.units.map(g => g.rows))
  }));
}

/* Split : chaque mot sans phrase qui a au moins une candidate, avec ses candidates. */
function split(C, ctx) {
  const T = extractOf(C, ctx.repo), v = seen(C, ctx.repo), groups = [];
  C.sources.forEach(s => {
    if (s.kind !== 'word' || (s.drills && s.drills.length)) return;
    const candidates = tatoeba.rank(T, s, { NL: C.NL, first: v.first, ui: v.order.indexOf(s.unit), known: v.S.known });
    if (!candidates.length) return;
    if (!groups.length || groups[groups.length - 1].unit !== s.unit) groups.push({ unit: s.unit, rows: [] });
    groups[groups.length - 1].rows.push({ id: s.id, nl: s.nl, unit: s.unit, art: s.art || null, meaning: C.NL.gloss.meaning(s), candidates });
  });
  return cut(groups, MAX);
}

/* Check : les phrases prises parmi les candidates de la ligne, telles que l'extrait épinglé les
   écrit, leurs traductions liées, et les règles. */
function check(row, input, ctx) {
  const out = [], list = row.sentences;
  if (!Array.isArray(list) || list.length > 2 || list.some(d => !d || typeof d !== 'object' || Array.isArray(d))) return ['sentences is a list of 0 to 2 sentences'];
  if (!list.length && !oneLine(row.skip)) out.push('a row with no sentence says why in skip, on one line');
  if (list.length && 'skip' in row) out.push('skip is for a row with no sentence');
  if (!list.length) return out;
  const C = ctx.course(), src = C.byId(input.id);
  let T;
  try { T = extractOf(C, ctx.repo); } catch (e) { return out.concat([e.message]); }
  list.forEach((d, j) => {
    const at = 'sentence ' + (j + 1);
    const keys = Object.keys(d).filter(k => k !== 'edited');
    if (keys.slice().sort().join() !== FIELDS.slice().sort().join()) {
      out.push(at + ' has the fields ' + FIELDS.join(', ') + ' (and edited when a translation is not Tatoeba\'s), not ' + Object.keys(d).join(', '));
      return;
    }
    if (![d.nl, d.gap, d.en, d.fr].every(oneLine)) { out.push(at + ': nl, gap, en and fr are each a string on one line'); return; }
    const s = T.nld.get(d.src);
    if (!(input.candidates || []).some(c => c.id === d.src) || !s) { out.push(at + ': src ' + d.src + ' is not one of the row\'s candidates'); return; }
    if (d.nl !== s.text) out.push(at + ': nl is not Tatoeba\'s sentence ' + d.src + ', « ' + s.text + ' »: a sentence is taken as Tatoeba writes it');
    const changed = [];
    [['en', 'eng'], ['fr', 'fra']].forEach(([l, k]) => {
      const id = d[l + 'Src'], t = T[k].get(id);
      if (s[k].indexOf(id) < 0 || !t) { out.push(at + ': ' + l + 'Src ' + id + ' is not a translation Tatoeba links to ' + d.src); return; }
      if (d[l] !== t.text) changed.push(l + ' « ' + d[l] + ' » is not Tatoeba\'s ' + id + ', « ' + t.text + ' »');
    });
    if (changed.length && !oneLine(d.edited)) changed.forEach(c => out.push(at + ': ' + c + ': take it as written, or say why in edited'));
    if (!changed.length && 'edited' in d) out.push(at + ': edited is for a translation that is not Tatoeba\'s, and both are');
    RULES(d, at, src, C, ctx.repo).forEach(r => out.push(r));
  });
  if (list.length === 2 && (list[0].src === list[1].src || C.NL.util.norm(list[0].nl) === C.NL.util.norm(list[1].nl))) out.push('the two sentences are one sentence');
  return out;
}

/* Le crédit : docs/attribution/tatoeba.tsv récrit en entier, ses commentaires et ses fins de
   ligne gardés. Une ligne par phrase de Tatoeba que src/content/sourced.js tient : celles de
   cette Merge, prises dans leur ligne d'entrée, et celles d'avant, gardées telles qu'elles
   étaient. Triées par mot, puis par numéro. */
function credit(taken, ctx) {
  const file = path.join(ctx.repo, 'docs', 'attribution', 'tatoeba.tsv');
  const was = fs.readFileSync(file, 'utf8'), eol = /\r\n/.test(was) ? '\r\n' : '\n';
  const all = was.split(/\r?\n/), head = all.filter(l => l[0] === '#');
  const old = all.filter(l => l && l[0] !== '#' && l !== CREDITS).map(l => l.split('\t'));
  const sourced = table.load(path.join(ctx.repo, 'src', 'content', 'sourced.js')).entries;
  const held = new Set();
  Object.keys(sourced).forEach(nl => sourced[nl].forEach(d => { if (Number.isInteger(d.src)) held.add(nl + '\t' + d.src); }));
  const rows = new Map();
  old.forEach(c => { if (held.has(c[0] + '\t' + c[1])) rows.set(c[0] + '\t' + c[1], c); });
  const owner = o => o || '-';
  taken.forEach(t => (t.row.sentences || []).forEach(d => {
    const c = t.input.candidates.find(x => x.id === d.src);
    const en = c.en.find(x => x.id === d.enSrc), fr = c.fr.find(x => x.id === d.frSrc);
    const adapted = [d.en !== en.text ? 'en' : '', d.fr !== fr.text ? 'fr' : ''].filter(Boolean).join(' ') || '-';
    rows.set(t.src.nl + '\t' + d.src, [t.src.nl, d.src, owner(c.owner), d.enSrc, owner(en.owner), d.frSrc, owner(fr.owner), adapted]);
  }));
  const sorted = [...rows.values()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : Number(a[1]) - Number(b[1])));
  fs.writeFileSync(file, head.concat([CREDITS], sorted.map(c => c.join('\t'))).join(eol) + eol);
  return ['ok tatoeba.tsv ' + sorted.length + ' rows'];
}

module.exports = {
  stamp: ['meaning', 'art', hand],
  fields: ['sentences'],
  optional: ['skip'],
  tables: ['sourced'],
  split,
  check,
  merge: row => ({ sourced: row.sentences.length ? row.sentences.map(d => ({ nl: d.nl, fr: d.fr, en: d.en, gap: d.gap, src: d.src })) : undefined }),
  write: credit,
  readWhole: row => (row.sentences || []).some(d => 'edited' in d) ? 'edited translation' : '',
  MAX, CREDITS, RULES, cut
};
