/* Le genre open : une réponse libre par phrase choisie, trois par unité, écrite dans
   src/content/open.phrases.js sous le néerlandais de la phrase. La phrase est servie en
   réponse libre à son échelon 6 (src/content/index.js, TABLES). Les 13 règles de grammar.a1c.js
   (RULES) ont la leur, écrite dans src/content/open.js sous l'id de la règle, comme les neuf des
   unités 1 à 12 : une ligne de règle porte son unité, son titre, sa règle, son exemple, son
   explication, ses exercices et vocab, et Check refuse un modèle qui est l'exemple de la règle
   ou l'un de ses exercices.

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
/* Le néerlandais d'un texte se lit mot à mot comme test/lang.js le lit (6d), jetons ôtés :
   tokenFreeWords(s), accents gardés. Ce n'est pas NL.util.words (fondé sur norm, qui ôte les
   accents) : celui-ci sert à compter les mots d'une réponse, celui-là à lire le néerlandais cité. */
const { tokenFreeWords, courseWords } = require('../../../test/lib/dutch');
const { oneLine, quotes, strayQuotes } = require('../../../test/lib/text');
const { QUOTE_OK, SHARED_OK } = require('../../../test/lib/quoted');
const { bareOf } = require('./examples');
const fs = require('fs'), path = require('path');

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
  'weekend:p2', 'weekend:p4', 'weekend:p7',
  'vragen:p2', 'vragen:p3', 'vragen:p4',
  'kunnen:p0', 'kunnen:p1', 'kunnen:p4',
  'doen:p0', 'doen:p3', 'doen:p4',
  'mensen:p0', 'mensen:p1', 'mensen:p2',
  'hoeveel:p0', 'hoeveel:p3', 'hoeveel:p4',
  'waar:p0', 'waar:p3', 'waar:p4',
  'landen:p0', 'landen:p1', 'landen:p4',
  'eten:p0', 'eten:p1', 'eten:p2',
  'cafe:p1', 'cafe:p3', 'cafe:p4',
  'kleren:p0', 'kleren:p1', 'kleren:p2',
  'wonen:p0', 'wonen:p2', 'wonen:p3',
  'kalender:p0', 'kalender:p1', 'kalender:p2',
  'stad:p0', 'stad:p2', 'stad:p3',
  'vrijetijd:p0', 'vrijetijd:p1', 'vrijetijd:p3',
  'gevoel:p0', 'gevoel:p1', 'gevoel:p3',
  'beschrijven:p0', 'beschrijven:p1', 'beschrijven:p4',
  'school:p0', 'school:p1', 'school:p3',
  'afspraak:p1', 'afspraak:p2', 'afspraak:p4',
  'team:p0', 'team:p3', 'team:p4',
  'reis:p1', 'reis:p3', 'reis:p4',
  'natuur:p0', 'natuur:p1', 'natuur:p3',
  'spoed:p2', 'spoed:p3', 'spoed:p4'
];
/* Les règles de grammar.a1c.js, dans l'ordre du cours : leur tâche s'écrit dans src/content/open.js, sous leur id. */
const RULES = ['g-niet-geen', 'g-bijzin', 'g-vraag', 'g-twee-werkwoorden', 'g-perfect-zijn', 'g-was-had', 'g-deelwoord',
  'g-hem-haar', 'g-er-is', 'g-meervoud', 'g-gebiedend', 'g-verkleinwoord', 'g-om-op-in'];
/* La source d'une ligne : un élément du cours, ou une règle, dont nl est l'id et dont fr et en sont le titre. */
function sourceOf(C, id) {
  if (RULES.indexOf(id) < 0) return C.byId(id);
  const p = (C.RAW.patterns || []).find(x => x.id === id);
  if (!p) return undefined;
  return {
    id, nl: id, fr: p.title.fr, en: p.title.en, unit: p.unit, title: p.title, rule: p.rule,
    example: { nl: p.nl, fr: p.fr, en: p.en }, explain: p.explain,
    drills: p.drills.map(d => ({ nl: d.nl, fr: d.fr, en: d.en })), copies: []
  };
}
/* Six unités entières par lot, le dernier s'arrêtant à la dernière unité du cours (units-31-34). */
const batchOf = (ui, n) => { const lo = 6 * Math.floor(ui / 6); return 'units-' + (lo + 1) + '-' + Math.min(lo + 6, n); };
const KEYS = ['what', 'rx', 'any', 'min', 'miss'];
const MIN = [3, 12];

const pair = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).sort().join() === 'en,fr' &&
  ['fr', 'en'].every(l => oneLine(v[l]));

/* Ce que Check lit du cours, une fois par cours : l'index de chaque unité, les mots enseignés
   jusqu'à chacune, la première unité de chaque forme (test/lib/sequence.js), l'orthographe
   (test/lib/spelling.js), les noms par défaut, et le néerlandais de tout le cours (bareOf). */
const memo = new WeakMap();
function facts(C, repo) {
  if (memo.has(C)) return memo.get(C);
  const units = C.RAW.units, taught = [], seen = new Set();
  units.forEach(u => {
    (u.words || []).concat(u.phrases || []).forEach(x => tokenFreeWords(x.nl).forEach(w => seen.add(w)));
    taught.push([...seen].sort());
  });
  const D = C.NL.content.DEFAULTS;
  const f = {
    index: new Map(units.map((u, ui) => [u.id, ui])), taught, B: bareOf(C, repo),
    first: sequence.firstUnits(C.RAW), S: spelling.open(repo, C.NL),
    names: new Set([].concat(...Object.keys(D).map(k => tokenFreeWords(D[k]))))
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

/* La règle des guillemets (test/lang.js, 6d) sur une paire { fr, en } : fr cite entre « », en
   entre “ ”, chaque guillemet fermé, aucune citation vide ni imbriquée ; chaque côté cite la
   même chose, dans le même ordre ; ce qui est cité est un mot que le cours a enseigné jusqu'à
   l'unité de la phrase, ou un nombre ; les deux côtés ont les mêmes nombres ; et un mot
   néerlandais du cours qu'ils écrivent tous deux hors citation se cite. « a » est l'avoir
   français et l'article anglais (lang.js l'excuse aussi). */
function quoteRule(v, where, taught, dutch, names) {
  /* dutch : Map mot → propriétaire ; '' pour le néerlandais du cours, l'id d'une autre ligne dont l'exemple le dira. */
  const q = { fr: quotes(v.fr, 'fr'), en: quotes(v.en, 'en') };
  const bad = ['fr', 'en'].map(l => {
    const stray = strayQuotes(v[l], l, ['"']);
    return stray ? l + ' ' + stray : q[l].why;
  }).filter(Boolean).map(r => where + ': ' + r);
  if (bad.length) return bad;
  const out = [], fr = q.fr.quoted, en = q.en.quoted;
  if (fr.join('|') !== en.join('|')) out.push(where + ': fr quotes ' + JSON.stringify(fr) + ', en quotes ' + JSON.stringify(en) + ': both sides quote the same Dutch, in the same order');
  fr.forEach(s => tokenFreeWords(s).filter(w => !taught.has(w) && !/^\d+$/.test(w)).forEach(w =>
    out.push(where + ': « ' + w + ' » is quoted, and the course has not taught it by this unit: a quote holds taught Dutch, and a translation goes in parentheses')));
  const digits = s => (s.match(/\d+/g) || []).sort().join(' ');
  if (digits(v.fr) !== digits(v.en)) out.push(where + ': fr has the numbers [' + digits(v.fr) + '], en [' + digits(v.en) + ']');
  const bare = l => new Set(tokenFreeWords(q[l].outside));
  const enBare = bare('en');
  [...bare('fr')].filter(w => enBare.has(w) && dutch.has(w) && !names.has(w) && !SHARED_OK[w]).forEach(w =>
    out.push(dutch.get(w) ? where + ': « ' + w + ' » is in the model of ' + dutch.get(w) + ', which Merge makes Dutch of the course: written bare in fr and in en, quote it, or reword'
      : where + ': « ' + w + ' » is Dutch the course has, written bare in fr and in en: quote it, or reword'));
  return out;
}

/* Les exemples des autres lignes écrites du genre : le draft.json, puis le retry.json, de chaque dossier de
   kindDir, la ligne elle-même exceptée ; un retry remplace le draft de la même ligne, comme Merge le prend. */
function otherModels(kindDir, self) {
  const models = new Map();
  if (!kindDir) return models;
  const read = f => { try { const v = JSON.parse(fs.readFileSync(f, 'utf8')); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  let dirs = [];
  try { dirs = fs.readdirSync(kindDir, { withFileTypes: true }).filter(e => e.isDirectory()); } catch (e) { return models; }
  dirs.forEach(e => ['draft.json', 'retry.json'].forEach(n =>
    read(path.join(kindDir, e.name, n)).forEach(r => { if (r && r.id && r.id !== self && typeof r.model === 'string') models.set(r.id, r.model); })));
  return models;
}

/* Une ligne écrite : sa forme, puis l'exemple et les réponses manquées notés par le barème. */
function check(row, input, ctx) {
  const C = ctx.course(), F = facts(C, ctx.repo), U = C.NL.util;
  const ui = F.index.get(input.unit);
  const out = [];
  if (!pair(row.ask)) out.push('ask is { "fr": …, "en": … }, each one line with no space at either end');
  if (!oneLine(row.model)) out.push('model is one line of Dutch with no space at either end');
  if (!Array.isArray(row.need) || row.need.length < 2 || row.need.length > 4) out.push('need is a list of 2 to 4 needs');
  if (out.length) return out;
  row.need.forEach((n, i) => {
    const at = 'need ' + (i + 1);
    if (!n || typeof n !== 'object' || Array.isArray(n)) { out.push(at + ' is an object'); return; }
    Object.keys(n).filter(k => KEYS.indexOf(k) < 0).forEach(k => out.push(at + ': unknown field ' + k));
    if (!pair(n.what)) out.push(at + ': what is { "fr": …, "en": … }, each one line with no space at either end');
    if (!oneLine(n.miss)) out.push(at + ': miss is one line of Dutch with no space at either end');
    const how = ['rx', 'any', 'min'].filter(k => n[k] !== undefined);
    if (how.length !== 1) { out.push(at + ': exactly one of rx, any and min'); return; }
    if (n.rx !== undefined && (typeof n.rx !== 'string' || !n.rx)) out.push(at + ': rx is the source of a regular expression, a string');
    else if (typeof n.rx === 'string' && typeof regex(n.rx) === 'string') out.push(at + ': rx « ' + n.rx + ' » does not compile: ' + regex(n.rx));
    if (n.any !== undefined && (!Array.isArray(n.any) || !n.any.length || !n.any.every(oneLine))) out.push(at + ': any is a list of words or runs of words, each with no space at either end');
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
  if (!input.drills && U.norm(row.model) === U.norm(input.nl)) out.push('the model is the phrase itself: a task asks for an answer of the learner\'s own');
  if (input.drills) {
    if (U.norm(row.model) === U.norm(input.example.nl)) out.push('the model is the rule\'s example: a task asks for an answer of the learner\'s own');
    input.drills.filter(d => U.norm(row.model) === U.norm(d.nl)).forEach(d =>
      out.push('the model is one of the rule\'s drills, « ' + d.nl + ' »: a task asks for an answer of the learner\'s own'));
  }
  const byModel = rubric(task, row.model);
  task.need.forEach((n, i) => { if (byModel.indexOf(n.what) < 0) out.push('the model « ' + row.model + ' » does not meet ' + label(n, i)); });
  task.need.forEach((n, i) => {
    const met = rubric(task, n.miss);
    if (met.indexOf(n.what) >= 0) out.push(label(n, i) + ': its miss « ' + n.miss + ' » meets it');
    task.need.forEach((m, j) => { if (j !== i && met.indexOf(m.what) < 0) out.push(label(n, i) + ': its miss « ' + n.miss + ' » also fails ' + label(m, j) + ': a miss fails its own need alone'); });
  });

  /* Le modèle se dit avec ce que le cours a déjà enseigné, et s'épelle. */
  const thing = input.drills ? 'rule' : 'phrase';
  sequence.ahead(row.model, ui, F.first).forEach(w => {
    const later = C.RAW.units[F.first.get(w)];
    out.push('the model uses « ' + w + ' », which unit ' + (F.first.get(w) + 1) + ' (' + later.id + ') teaches, after this ' + thing + '\'s unit ' + (ui + 1));
  });
  spelling.tokens(row.model).filter(t => !F.S.known(t)).forEach(t => out.push('the model writes « ' + t + ' », which is not a known Dutch form'));

  /* Aucun jeton, aucun nom par défaut : une tâche est la même pour chaque apprenant, et le dépôt
     est public. */
  const strings = [row.ask.fr, row.ask.en, row.model].concat(...row.need.map(n => [n.what.fr, n.what.en, n.miss].concat(n.any || [])));
  if (strings.some(s => /[{}]/.test(s))) out.push('a task holds no { } token');
  strings.forEach(s => tokenFreeWords(s).filter(w => F.names.has(w)).forEach(w => out.push('« ' + w + ' » is a default name: a task holds no name of a learner, a town or a company')));

  /* « hoe lang » : le cours écrit la durée « hoelang » (#128), et test/content.js refuse deux mots. */
  const HOE = /\bhoe\s+lang\b/i;
  const fields = [['ask', [row.ask.fr, row.ask.en]], ['model', [row.model]]].concat(row.need.map((n, i) =>
    ['need ' + (i + 1), [n.what.fr, n.what.en, n.miss, n.rx || ''].concat(n.any || [])]));
  fields.forEach(([at, ss]) => { if (ss.some(s => HOE.test(s))) out.push(at + ' writes « hoe lang »: the course writes the duration « hoelang » (#128), and test/content.js refuses it'); });
  /* Ce que le modèle ajoute au cours : Merge le rend néerlandais du cours, que test/lang.js lit en 6d. */
  U.uniq(courseWords(row.model)).filter(w => !F.B.dutch.has(w)).forEach(w => {
    if (QUOTE_OK[w]) out.push('the model: « ' + w + ' » would become Dutch of the course, and test/lang.js 6d.3 then refuses its QUOTE_OK exception (test/lib/quoted.js)');
    else if (F.B.bare.has(w)) out.push('the model: « ' + w + ' » would become Dutch of the course, and ' + F.B.bare.get(w) + ' writes it bare in French and in English (test/lang.js 6d.4)');
  });

  /* Les guillemets. */
  const taught = new Set(F.taught[ui]), dutch = new Map([...F.B.dutch].map(w => [w, '']));
  courseWords(row.model).forEach(w => dutch.set(w, ''));
  otherModels(ctx.kindDir, row.id).forEach((m, id) => courseWords(m).forEach(w => { if (!dutch.has(w)) dutch.set(w, id); }));
  quoteRule(row.ask, 'ask', taught, dutch, F.names).forEach(r => out.push(r));
  row.need.forEach((n, i) => quoteRule(n.what, 'need ' + (i + 1) + ' what', taught, dutch, F.names).forEach(r => out.push(r)));
  return out;
}

/* Un verdict « keep » porte right : deux bonnes réponses du relecteur, écrites autrement que
   l'exemple et l'une que l'autre, que le barème accepte. Un autre verdict n'en porte pas. */
function checkVerdict(v, row, input, ctx) {
  if (v.verdict !== 'keep') return v.right === undefined ? [] : ['only a keep carries right'];
  const r = v.right;
  if (!Array.isArray(r) || r.length !== 2 || !r.every(oneLine)) return ['a keep carries right: two right answers of the reader\'s own, each one line of Dutch with no space at either end'];
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
function merge(row, input) {
  const task = {
    ask: { fr: row.ask.fr, en: row.ask.en },
    need: row.need.map(n => {
      const how = n.rx !== undefined ? { rx: new RegExp(n.rx, 'i') } : n.any !== undefined ? { any: n.any.slice() } : { min: n.min };
      return Object.assign({ what: { fr: n.what.fr, en: n.what.en } }, how, { miss: n.miss });
    }),
    model: row.model
  };
  return RULES.indexOf(row.id) >= 0 ? { open: task } : { 'open.phrases': task };
}

/* Split : les phrases de PHRASES sans tâche, plus les ids nommés (ctx.ids), chacune dans le lot de six
   unités entières de son unité, dans l'ordre du cours. Un jeton et un id perdu se refusent sur toutes les
   phrases de PHRASES, tâche ou non : une phrase fondue dont le néerlandais change se voit encore. */
function split(C, ctx) {
  const F = facts(C, ctx.repo), batches = {}, named = new Set((ctx && ctx.ids) || []);
  const mine = C.sources.filter(s => PHRASES.indexOf(s.id) >= 0);
  mine.forEach(s => { if (/[{}]/.test(s.nl)) throw new Error(s.id + ' « ' + s.nl + ' » holds a token: a task is the same for every learner'); });
  mine.filter(s => !s.open || named.has(s.id)).forEach(s => {
    const ui = F.index.get(s.unit), b = batchOf(ui, C.RAW.units.length);
    (batches[b] = batches[b] || []).push({
      id: s.id, nl: s.nl, unit: s.unit,
      meaning: { fr: C.NL.gloss.of(s, 'fr'), en: C.NL.gloss.of(s, 'en') },
      vocab: F.taught[ui]
    });
  });
  const found = mine.map(s => s.id);
  const lost = PHRASES.filter(id => found.indexOf(id) < 0);
  if (lost.length) throw new Error(lost.join(', ') + ' is no phrase of the course');
  const have = C.NL.content.byDutch.open || {};
  const owed = RULES.filter(id => !have[id] || named.has(id)), rules = [];
  const missing = owed.filter(id => !sourceOf(C, id));
  if (missing.length) throw new Error(missing.join(', ') + ' is no rule of the course');
  owed.forEach(id => {
    const s = sourceOf(C, id);
    rules.push({
      id, unit: s.unit, title: s.title, rule: s.rule, example: s.example, explain: s.explain, drills: s.drills,
      vocab: F.taught[F.index.get(s.unit)]
    });
  });
  const out = Object.keys(batches).map(b => ({ batch: b, rows: batches[b] }));
  if (rules.length) out.push({ batch: 'rules', rows: rules });
  return out;
}

/* Le relecteur lit entière la tâche d'une règle (en-têtes d'appel 3, 4 et 7 du kit). */
const readWhole = (row, input) => (input && input.drills ? 'rule task' : '');

module.exports = {
  stamp: ['meaning', src => (src.drills ? { rule: src.rule, example: src.example, drills: src.drills.map(d => d.nl) } : null)],
  fields: ['ask', 'need', 'model'],
  verdictFields: ['right'],
  tables: ['open.phrases', 'open'],
  split, check, checkVerdict, merge, sourceOf, readWhole,
  PHRASES, RULES
};
