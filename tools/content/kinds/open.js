/* Le genre open : une réponse libre par phrase choisie, trois par unité, écrite dans
   src/content/open.phrases.js sous le néerlandais de la phrase. La phrase est servie en
   réponse libre à son échelon 6 (src/content/index.js, TABLES).

   Une ligne d'entrée porte la phrase (nl), son unité, son sens, et les mots que le cours a
   enseignés jusqu'à son unité comprise (vocab). Une ligne écrite porte ask, need et model, de
   la forme des tâches des motifs (src/content/open.js), à une différence : en JSON, un rx
   s'écrit par sa source, une chaîne, et Merge l'écrit en expression régulière, drapeau i.
   Un verdict « keep » porte right : deux bonnes réponses du relecteur, écrites autrement.

   Check note l'exemple, chaque réponse manquée et les bonnes réponses par le barème de la
   séance, NL.ex.rubric, jamais par une copie. Les raisons sont en anglais : le kit les
   imprime, et les agents du kit les lisent. */
const sequence = require('../../../test/lib/sequence');
const spelling = require('../../../test/lib/spelling');

/* Les phrases, trois par unité, dont le cadre se généralise (« Mag ik… », « Hoeveel… »,
   « Ik moet naar… »). Une phrase à jeton ({naam}…) n'en est pas : une tâche est la même pour
   chaque apprenant. Les ids sont épinglés à leur néerlandais (test/data/ids.tsv). */
const PHRASES = [
  'overleven:p1', 'overleven:p2', 'overleven:p7',
  'ikengij:p3', 'ikengij:p7', 'ikengij:p8',
  'tijd:p4', 'tijd:p7', 'tijd:p8',
  'bakker:p1', 'bakker:p5', 'bakker:p9',
  'thuis:p1', 'thuis:p2', 'thuis:p3',
  'familie:p0', 'familie:p3', 'familie:p7',
  'onderweg:p0', 'onderweg:p4', 'onderweg:p8',
  'werkbasis:p2', 'werkbasis:p3', 'werkbasis:p4',
  'dedag:p1', 'dedag:p5', 'dedag:p8',
  'winkel:p0', 'winkel:p1', 'winkel:p5',
  'dokter:p2', 'dokter:p4', 'dokter:p5',
  'weekend:p2', 'weekend:p4', 'weekend:p7'
];
/* Deux lots : les unités 1 à 6, puis 7 à 12 (index 0 à 5, puis 6 à 11). */
const batchOf = ui => (ui < 6 ? 'units-1-6' : 'units-7-12');
const KEYS = ['what', 'rx', 'any', 'min', 'miss'];
const MIN = [3, 12];

/* Les mots d'un texte comme test/lang.js les lit (6d) : lettres et chiffres, en minuscules,
   jetons ôtés. */
const words = s => String(s).replace(/\{[a-z]+\}/g, ' ').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const pair = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).sort().join() === 'en,fr' &&
  ['fr', 'en'].every(l => typeof v[l] === 'string' && v[l].trim() !== '' && !/\n/.test(v[l]));
const text = v => typeof v === 'string' && v.trim() !== '' && !/\n/.test(v);

/* Ce que Check lit du cours, une fois par cours : l'index de chaque unité, les mots enseignés
   jusqu'à chacune, la première unité de chaque forme (test/lib/sequence.js), l'orthographe
   (test/lib/spelling.js), les noms par défaut, et le néerlandais de tout le cours. */
const memo = new WeakMap();
function facts(C, repo) {
  if (memo.has(C)) return memo.get(C);
  const units = C.RAW.units, taught = [], seen = new Set(), dutch = new Set();
  units.forEach(u => {
    (u.words || []).concat(u.phrases || []).forEach(x => words(x.nl).forEach(w => { seen.add(w); dutch.add(w); }));
    taught.push([...seen].sort());
  });
  const D = C.NL.content.DEFAULTS;
  const f = {
    index: new Map(units.map((u, ui) => [u.id, ui])), taught, dutch,
    first: sequence.firstUnits(units), S: spelling.open(repo, C.NL),
    names: new Set([].concat(...Object.keys(D).map(k => words(D[k]))))
  };
  memo.set(C, f);
  return f;
}

/* Un rx tel que Merge l'écrit, ou la raison pour laquelle il ne se compile pas. */
const regex = src => { try { return new RegExp(src, 'i'); } catch (e) { return e.message; } };
/* La tâche telle que la séance la lit : chaque rx compilé, chaque what un seul objet, que le
   barème rend par identité. */
const taskOf = row => ({
  ask: row.ask, model: row.model,
  need: row.need.map(n => Object.assign({}, n, n.rx === undefined ? {} : { rx: regex(n.rx) }))
});
const label = (n, i) => 'need ' + (i + 1) + ' « ' + n.what.en + ' »';

/* Les guillemets d'un côté : fr cite entre « », en entre “ ”, chaque guillemet fermé, aucune
   citation vide ni imbriquée. Rend les passages cités, ou une raison. */
function quotes(s, l) {
  const [open, close] = l === 'fr' ? ['«', '»'] : ['“', '”'];
  const other = l === 'fr' ? /[“”"]/ : /[«»"]/;
  if (other.test(s)) return l + ' quotes with ' + open + ' ' + close + ' only';
  const out = [];
  let at = 0;
  for (;;) {
    const a = s.indexOf(open, at), b = s.indexOf(close, at);
    if (a < 0 && b < 0) return out;
    if (a < 0 || b < a) return 'a ' + close + ' with no ' + open + ' before it';
    const c = s.indexOf(close, a + 1), d = s.indexOf(open, a + 1);
    if (c < 0) return 'a ' + open + ' never closed';
    if (d >= 0 && d < c) return 'a quote inside a quote';
    const q = s.slice(a + 1, c).trim();
    if (!q) return 'an empty quote';
    out.push(q);
    at = c + 1;
  }
}

/* La règle des guillemets (test/lang.js, 6d) sur une paire { fr, en } : chaque côté cite la
   même chose, dans le même ordre ; ce qui est cité est un mot que le cours a enseigné jusqu'à
   l'unité de la phrase, ou un nombre ; les deux côtés ont les mêmes nombres ; et un mot
   néerlandais du cours qu'ils écrivent tous deux hors citation se cite. « a » est l'avoir
   français et l'article anglais (lang.js l'excuse aussi). */
function quoteRule(v, where, taught, dutch, names) {
  const q = { fr: quotes(v.fr, 'fr'), en: quotes(v.en, 'en') };
  const bad = ['fr', 'en'].filter(l => typeof q[l] === 'string').map(l => where + ': ' + q[l]);
  if (bad.length) return bad;
  const out = [];
  if (q.fr.join('|') !== q.en.join('|')) out.push(where + ': fr quotes ' + JSON.stringify(q.fr) + ', en quotes ' + JSON.stringify(q.en) + ': both sides quote the same Dutch, in the same order');
  q.fr.forEach(s => words(s).filter(w => !taught.has(w) && !/^\d+$/.test(w)).forEach(w =>
    out.push(where + ': « ' + w + ' » is quoted, and the course has not taught it by this unit: a quote holds taught Dutch, and a translation goes in parentheses')));
  const digits = s => (s.match(/\d+/g) || []).sort().join(' ');
  if (digits(v.fr) !== digits(v.en)) out.push(where + ': fr has the numbers [' + digits(v.fr) + '], en [' + digits(v.en) + ']');
  const bare = s => new Set(words(s.replace(/[«“][^»”]*[»”]/g, ' ')));
  const en = bare(v.en);
  [...bare(v.fr)].filter(w => en.has(w) && dutch.has(w) && !names.has(w) && w !== 'a').forEach(w =>
    out.push(where + ': « ' + w + ' » is Dutch the course has, written bare in fr and in en: quote it, or reword'));
  return out;
}

/* Une ligne écrite : sa forme, puis l'exemple et les réponses manquées notés par le barème. */
function check(row, input, ctx) {
  const C = ctx.course(), F = facts(C, ctx.repo), U = C.NL.util;
  const ui = F.index.get(input.unit);
  const out = [];
  if (!pair(row.ask)) out.push('ask is { "fr": …, "en": … }, each one line');
  if (!text(row.model)) out.push('model is one line of Dutch');
  if (!Array.isArray(row.need) || row.need.length < 2 || row.need.length > 4) out.push('need is a list of 2 to 4 needs');
  if (out.length) return out;
  row.need.forEach((n, i) => {
    const at = 'need ' + (i + 1);
    if (!n || typeof n !== 'object' || Array.isArray(n)) { out.push(at + ' is an object'); return; }
    Object.keys(n).filter(k => KEYS.indexOf(k) < 0).forEach(k => out.push(at + ': unknown field ' + k));
    if (!pair(n.what)) out.push(at + ': what is { "fr": …, "en": … }, each one line');
    if (!text(n.miss)) out.push(at + ': miss is one line of Dutch');
    const how = ['rx', 'any', 'min'].filter(k => n[k] !== undefined);
    if (how.length !== 1) { out.push(at + ': exactly one of rx, any and min'); return; }
    if (n.rx !== undefined && (typeof n.rx !== 'string' || !n.rx)) out.push(at + ': rx is the source of a regular expression, a string');
    else if (typeof n.rx === 'string' && typeof regex(n.rx) === 'string') out.push(at + ': rx « ' + n.rx + ' » does not compile: ' + regex(n.rx));
    if (n.any !== undefined && (!Array.isArray(n.any) || !n.any.length || n.any.some(a => !text(a)))) out.push(at + ': any is a list of words or runs of words');
    if (n.min !== undefined && !(Number.isInteger(n.min) && n.min >= MIN[0] && n.min <= MIN[1])) out.push(at + ': min is a whole number from ' + MIN[0] + ' to ' + MIN[1]);
    if (n.min !== undefined && pair(n.what) && ['fr', 'en'].some(l => (n.what[l].match(/\d+/g) || []).indexOf(String(n.min)) < 0)) out.push(at + ': its what names its number, ' + n.min + ', in fr and in en');
  });
  if (out.length) return out;
  const mins = row.need.filter(n => n.min !== undefined).length;
  if (mins !== 1) out.push('one need is a min, and only one: ' + mins + ' are');
  ['fr', 'en'].forEach(l => {
    const seen = new Set();
    row.need.forEach((n, i) => { if (seen.has(U.norm(n.what[l]))) out.push('need ' + (i + 1) + ': its ' + l + ' what is another need\'s'); seen.add(U.norm(n.what[l])); });
  });

  /* Le barème, celui de la séance. */
  const task = taskOf(row), rubric = C.NL.ex.rubric;
  if (U.words(row.model).length < 3) out.push('the model has fewer than 3 words: the session judges no shorter answer');
  if (U.norm(row.model) === U.norm(input.nl)) out.push('the model is the phrase itself: a task asks for an answer of the learner\'s own');
  const byModel = rubric(task, row.model);
  task.need.forEach((n, i) => { if (byModel.indexOf(n.what) < 0) out.push('the model « ' + row.model + ' » does not meet ' + label(n, i)); });
  task.need.forEach((n, i) => {
    const met = rubric(task, n.miss);
    if (met.indexOf(n.what) >= 0) out.push(label(n, i) + ': its miss « ' + n.miss + ' » meets it');
    task.need.forEach((m, j) => { if (j !== i && met.indexOf(m.what) < 0) out.push(label(n, i) + ': its miss « ' + n.miss + ' » also fails ' + label(m, j) + ': a miss fails its own need alone'); });
  });

  /* Le modèle se dit avec ce que le cours a déjà enseigné, et s'épelle. */
  sequence.ahead(row.model, ui, F.first).forEach(w => {
    const later = C.RAW.units[F.first.get(w)];
    out.push('the model uses « ' + w + ' », which unit ' + (F.first.get(w) + 1) + ' (' + later.id + ') teaches, after this phrase\'s unit ' + (ui + 1));
  });
  spelling.tokens(row.model).filter(t => !F.S.known(t)).forEach(t => out.push('the model writes « ' + t + ' », which is not a known Dutch form'));

  /* Aucun jeton, aucun nom par défaut : une tâche est la même pour chaque apprenant, et le dépôt
     est public. */
  const strings = [row.ask.fr, row.ask.en, row.model].concat(...row.need.map(n => [n.what.fr, n.what.en, n.miss].concat(n.any || [])));
  if (strings.some(s => /[{}]/.test(s))) out.push('a task holds no { } token');
  strings.forEach(s => words(s).filter(w => F.names.has(w)).forEach(w => out.push('« ' + w + ' » is a default name: a task holds no name of a learner, a town or a company')));

  /* Les guillemets. */
  const taught = new Set(F.taught[ui]), dutch = new Set([...F.dutch].concat(words(row.model)));
  quoteRule(row.ask, 'ask', taught, dutch, F.names).forEach(r => out.push(r));
  row.need.forEach((n, i) => quoteRule(n.what, 'need ' + (i + 1) + ' what', taught, dutch, F.names).forEach(r => out.push(r)));
  return out;
}

/* Un verdict « keep » porte right : deux bonnes réponses du relecteur, écrites autrement que
   l'exemple et l'une que l'autre, que le barème accepte. Un autre verdict n'en porte pas. */
function checkVerdict(v, row, input, ctx) {
  if (v.verdict !== 'keep') return v.right === undefined ? [] : ['only a keep carries right'];
  const r = v.right;
  if (!Array.isArray(r) || r.length !== 2 || !r.every(text)) return ['a keep carries right: two right answers of the reader\'s own, each one line of Dutch'];
  const C = ctx.course(), U = C.NL.util, task = taskOf(row), out = [];
  if (U.norm(r[0]) === U.norm(r[1])) out.push('the two right answers are the same answer');
  r.forEach((a, k) => {
    const at = 'right answer ' + (k + 1) + ' « ' + a + ' »';
    if (U.norm(a) === U.norm(row.model)) out.push(at + ' is the model: write one of your own');
    if (U.words(a).length < 3) out.push(at + ' has fewer than 3 words: the session judges no shorter answer');
    const met = C.NL.ex.rubric(task, a);
    task.need.forEach((n, i) => { if (met.indexOf(n.what) < 0) out.push(at + ' does not meet ' + label(n, i) + ': the task would reject a right answer'); });
  });
  return out;
}

/* Ce que Merge écrit : la tâche, son rx en expression régulière. */
function merge(row) {
  return {
    'open.phrases': {
      ask: { fr: row.ask.fr, en: row.ask.en },
      need: row.need.map(n => {
        const how = n.rx !== undefined ? { rx: new RegExp(n.rx, 'i') } : n.any !== undefined ? { any: n.any.slice() } : { min: n.min };
        return Object.assign({ what: { fr: n.what.fr, en: n.what.en } }, how, { miss: n.miss });
      }),
      model: row.model
    }
  };
}

/* Split : les phrases de PHRASES, chacune dans le lot de son unité, dans l'ordre du cours. */
function split(C, ctx) {
  const F = facts(C, ctx.repo), batches = {};
  C.sources.filter(s => PHRASES.indexOf(s.id) >= 0).forEach(s => {
    if (/[{}]/.test(s.nl)) throw new Error(s.id + ' « ' + s.nl + ' » holds a token: a task is the same for every learner');
    const ui = F.index.get(s.unit), b = batchOf(ui);
    (batches[b] = batches[b] || []).push({
      id: s.id, nl: s.nl, unit: s.unit,
      meaning: { fr: C.NL.gloss.of(s, 'fr'), en: C.NL.gloss.of(s, 'en') },
      vocab: F.taught[ui]
    });
  });
  const found = [].concat(...Object.keys(batches).map(b => batches[b])).map(r => r.id);
  const lost = PHRASES.filter(id => found.indexOf(id) < 0);
  if (lost.length) throw new Error(lost.join(', ') + ' is no phrase of the course');
  return ['units-1-6', 'units-7-12'].map(b => ({ batch: b, rows: batches[b] || [] }));
}

module.exports = {
  stamp: ['meaning'],
  fields: ['ask', 'need', 'model'],
  verdictFields: ['right'],
  tables: ['open.phrases'],
  split, check, checkVerdict, merge,
  PHRASES
};
