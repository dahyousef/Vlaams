/* Les deux genres d'explications : explanations-be, chaque mot et chaque phrase dont la forme
   flamande n'est pas le néerlandais, et explanations, tous les autres. Leurs modules
   (tools/content/kinds/) ne font que choisir leur part ; ce qu'ils ont en commun est ici.

     const X = require('../lib/explain');
     X.kind('be')        le genre explanations-be : un lot be-words et un lot be-phrases, coupés par
                         unités entières au-delà de MAX lignes
     X.kind('rest')      le genre explanations : un lot par unité, dans l'ordre du cours
     X.flemish(src, NL)  vrai quand l'élément est du genre explanations-be
     X.chunks(name, rows)  des lignes en lots de MAX au plus, sans couper une unité

   Une ligne d'entrée porte, en plus de ce que le kit écrit (stamp, copies) :
     nl, kind, unit      la source
     be                  sa forme flamande, ou null
     meaning             son sens, langue par langue (NL.gloss.meaning)
     note                sa note telle que notes.js la tient, ou null
     also                ses « on dit aussi », [] s'il n'en a pas
     siblings            les éléments du même sens : { nl, be }
     vlaams              vrai quand « Comment le dit-on ici ? » la pose
     right               la bonne réponse de cet exercice, quand vlaams ; null sinon
     labelled            les sens belges que le Wiktionnaire anglais donne au néerlandais lui-même
                         (« pos (étiquettes): sens »), ou null
   Une ligne écrite porte :
      note                une paire { fr, en }, que checkNote lit
      also                ses « on dit aussi », [] pour aucun, que checkAlso lit
      decoys              explanations-be seulement, quand vlaams : deux mauvaises réponses à
                          « Comment le dit-on ici ? », que checkDecoys lit
    Merge les écrit dans notes.js, also.js et decoys.js ; une liste vide, ou une ligne sans
    leurres, ôte la clé. Les raisons sont en anglais : ce sont les agents du kit qui les lisent. */
const path = require('path');
const kaikki = require('../kaikki');
const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
const { dutchWords, words } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));

/* Ce que l'empreinte couvre : ce que le rédacteur lit et ce que Merge écrit. Merge écrit la
   note, donc la relancer après un succès refuse comme périmée chaque ligne dont elle a changé
   la note : une tâche de fusion ne la lance qu'une fois. */
const STAMP = ['be', 'meaning', 'note', 'also'];
const MAX = 40;
const NOTE_MAX = 160;
const LANGS = ['fr', 'en'];
/* Les guillemets de chaque langue. */
const QUOTES = { en: ['“', '”'], fr: ['«', '»'] };
/* Les mots-outils d'une langue qui n'ont rien à faire dans l'autre, hors des guillemets. « but »
   n'y est pas : « le but » est français. */
const FR_IN_EN = 'le la les un une des du et est sont avec dans sur qui que pas ne il elle nous vous ce cette ces au aux mais ou où se sa ses leur très quand comme'.split(' ');
const EN_IN_FR = 'the and of is are to with for you it this that not was were have has your what when which who from by if into do does'.split(' ');

const flemish = (src, NL) => typeof src.be === 'string' && NL.util.norm(src.be) !== NL.util.norm(src.nl);
/* « Comment le dit-on ici ? » pose l'élément : un barreau de son genre l'offre, et l'élément s'y prête. */
const vlaams = (src, NL) => NL.srs.RUNGS[src.kind].some(set => set.indexOf('vlaams') >= 0) && NL.srs.supports(src, 'vlaams');
/* La bonne réponse de « Comment le dit-on ici ? », telle que l'exercice la juge. */
function right(src, NL) {
  const ex = NL.ex.get('vlaams'), a = ex.answer(ex.build(src));
  if (typeof a !== 'string' || !a) throw new Error(src.id + ': the vlaams exercise gives no answer');
  return a;
}
/* Les sens belges du néerlandais lui-même : un mot sans son article, une phrase sans sa
   ponctuation finale. */
function labelled(src, belgian, U) {
  const lemma = (src.kind === 'word' ? U.bare(src.nl) : src.nl.replace(/[.!?…]+$/, '')).toLowerCase();
  const senses = belgian.get(lemma);
  return senses ? senses.map(s => s.pos + ' (' + s.labels.join(', ') + '): ' + s.gloss) : null;
}

function rowOf(s, C, belgian) {
  const NL = C.NL, G = NL.gloss, v = vlaams(s, NL);
  return {
    id: s.id,
    nl: s.nl,
    kind: s.kind,
    unit: s.unit,
    be: typeof s.be === 'string' ? s.be : null,
    meaning: G.meaning(s),
    note: s.note || null,
    also: (s.also || []).slice(),
    siblings: C.sources.filter(o => o !== s && G.sameSense(s, o)).map(o => ({ nl: o.nl, be: typeof o.be === 'string' ? o.be : null })),
    vlaams: v,
    right: v ? right(s, NL) : null,
    labelled: labelled(s, belgian, NL.util)
  };
}

/* Des lignes dans l'ordre du cours, en lots de MAX au plus, sans couper une unité (une unité de
   plus de MAX lignes fait un lot à elle seule) : name, ou name-1, name-2… quand il en faut plusieurs. */
function chunks(name, rows) {
  const out = [];
  let unit = null, these = [];
  const close = () => {
    const last = out[out.length - 1];
    if (last && last.length + these.length <= MAX) out[out.length - 1] = last.concat(these);
    else if (these.length) out.push(these);
  };
  rows.forEach(r => {
    if (r.unit !== unit) { close(); unit = r.unit; these = []; }
    these.push(r);
  });
  close();
  return out.length === 1 ? [{ batch: name, rows: out[0] }] : out.map((rows, k) => ({ batch: name + '-' + (k + 1), rows }));
}

function split(part) {
  return (C, ctx) => {
    const belgian = kaikki.belgian(ctx.repo);
    const mine = C.sources.filter(s => flemish(s, C.NL) === (part === 'be'));
    if (part === 'be') {
      return ['word', 'phrase'].reduce((acc, k) =>
        acc.concat(chunks('be-' + k + 's', mine.filter(s => s.kind === k).map(s => rowOf(s, C, belgian)))), []);
    }
    return C.RAW.units.map(u => ({ batch: u.id, rows: mine.filter(s => s.unit === u.id).map(s => rowOf(s, C, belgian)) }));
  };
}

/* Le cours, son orthographe, son néerlandais, et les réponses qu'il accepte (une forme comme
   NL.ex.accepted l'écrit, et les sources qui l'acceptent), lus une fois par lecture d'un lot. */
const memo = new WeakMap();
function tools(ctx) {
  if (!memo.has(ctx)) {
    const C = ctx.course(), NL = C.NL, owners = new Map();
    C.sources.forEach(s => NL.ex.accepted(s).forEach(f => owners.set(f, (owners.get(f) || []).concat(s.id))));
    memo.set(ctx, { C, NL, S: spelling.open(ctx.repo, NL), dutch: dutchWords(NL), owners });
  }
  return memo.get(ctx);
}

/* Un texte et ses citations : { quoted, outside, ok }. outside remplace chaque citation par
   « # », pour que la ponctuation qu'elle porte ne compte pas. ok est faux quand un guillemet
   est seul, imbriqué, ou qu'une citation est vide. */
function quotes(s, L) {
  const [open, close] = QUOTES[L], quoted = [];
  let depth = 0, cur = '', outside = '', ok = true;
  Array.from(s).forEach(ch => {
    if (ch === open) { if (depth) ok = false; depth = 1; cur = ''; }
    else if (ch === close) {
      if (!depth || !cur.trim()) ok = false;
      else { quoted.push(cur.trim()); outside += '#'; }
      depth = 0;
    } else if (depth) cur += ch;
    else outside += ch;
  });
  if (depth) ok = false;
  return { quoted, outside, ok };
}
const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).sort().join('|');
/* Les phrases d'un texte : chaque fin (. ! ? …) suivie d'un blanc ou de la fin, et une de plus
   quand le texte ne finit pas sur l'une d'elles. */
const sentences = s => (s.match(/[.!?…]+(?=\s|$)/g) || []).length + (/[.!?…]$/.test(s.trim()) ? 0 : 1);
const list = ws => ws.map(w => '« ' + w + ' »').join(', ');

/* Ce que la ligne rend citable, même hors des listes d'orthographe : son néerlandais, sa forme
   flamande, ses « on dit aussi », ceux qu'elle tient et ceux qu'elle écrit. */
const ownForms = (row, input) => [input.nl, input.be || ''].concat(input.also, Array.isArray(row.also) ? row.also : []);
/* Un texte d'une ligne, sans blanc autour. */
const oneLine = f => typeof f === 'string' && f.trim() !== '' && f === f.trim() && !/[\r\n]/.test(f);

/* Les raisons qu'une note ne passe pas. */
function checkNote(row, input, ctx) {
  const n = row.note;
  if (!n || typeof n !== 'object' || Array.isArray(n) || Object.keys(n).sort().join() !== 'en,fr' ||
    LANGS.some(l => typeof n[l] !== 'string' || !n[l].trim() || n[l] !== n[l].trim())) {
    return ['note is { "fr": …, "en": … }, each a text with no space at either end'];
  }
  const T = tools(ctx), U = T.NL.util, G = T.NL.gloss, why = [];
  const q = {}, unread = [];
  LANGS.forEach(l => {
    const s = n[l];
    if (Array.from(s).length > NOTE_MAX) why.push('note.' + l + ' is ' + Array.from(s).length + ' characters: at most ' + NOTE_MAX);
    if (/[<\n\r"]/.test(s)) why.push('note.' + l + ' holds <, a newline or a straight quote "');
    const other = QUOTES[l === 'en' ? 'fr' : 'en'];
    if (s.indexOf(other[0]) >= 0 || s.indexOf(other[1]) >= 0) { why.push('note.' + l + ' quotes with ' + QUOTES[l].join(' ') + ' only'); unread.push(l); }
    q[l] = quotes(s, l);
    if (!q[l].ok) { why.push('note.' + l + ' has a quote mark without its pair, a quote inside a quote, or an empty quote'); unread.push(l); }
    const k = sentences(q[l].outside);
    if (k > 2) why.push('note.' + l + ' has ' + k + ' sentences: at most 2');
    Object.keys(T.NL.content.DEFAULTS).forEach(key => {
      const name = T.NL.content.DEFAULTS[key];
      if (new RegExp('(^|[^\\p{L}])' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\p{L}])', 'iu').test(s)) why.push('note.' + l + ' names « ' + name + ' »: write {' + key + '}');
    });
    if (U.norm(s) === U.norm(G.of(input.meaning, l))) why.push('note.' + l + ' only repeats the meaning');
    const foreign = l === 'en' ? FR_IN_EN : EN_IN_FR;
    const hit = U.uniq(words(q[l].outside).filter(w => foreign.indexOf(w) >= 0));
    if (hit.length) why.push('note.' + l + ' uses ' + (l === 'en' ? 'French' : 'English') + ' words outside quotes: ' + list(hit));
  });
  if (sig(n.fr) !== sig(n.en)) why.push('note.fr and note.en hold different digits or {…} tokens');
  /* La suite lit les citations : il faut qu'elles se lisent, avec les guillemets de leur langue. */
  if (unread.length) return why;

  const set = l => U.uniq(q[l].quoted.map(U.norm)).sort();
  const fr = set('fr'), en = set('en');
  if (fr.join('|') !== en.join('|')) {
    why.push('note.fr and note.en quote different Dutch: only en ' + list(en.filter(x => fr.indexOf(x) < 0)) + '; only fr ' + list(fr.filter(x => en.indexOf(x) < 0)));
  }
  const own = new Set([].concat(...ownForms(row, input).map(f => spelling.tokens(f))));
  U.uniq(q.en.quoted.concat(q.fr.quoted)).forEach(seg => {
    const bad = U.uniq(spelling.tokens(seg).filter(t => !T.S.known(t) && !own.has(t)));
    if (bad.length) why.push('« ' + seg + ' » is quoted, but ' + list(bad) + ' is not Dutch that OpenTaal, flemish.tsv or this row knows: quotes hold Dutch only, a translation goes in parentheses');
  });
  const names = new Set([].concat(...Object.keys(T.NL.content.DEFAULTS).map(k => words(T.NL.content.DEFAULTS[k]))));
  const bareIn = l => new Set(words(q[l].outside.replace(/\{[a-z]+\}/g, ' ')).filter(w => w.length > 1 && T.dutch.has(w) && !names.has(w)));
  const enBare = bareIn('en'), both = Array.from(bareIn('fr')).filter(w => enBare.has(w));
  if (both.length) why.push(list(both) + ' is Dutch of the course, outside quotes in fr and in en: quote it, or say it another way');
  return why;
}

/* Les raisons que les « on dit aussi » ne passent pas. Chacun devient une réponse que la saisie
   accepte (NL.ex.accepted) : une seule forme néerlandaise, ni la source, ni sa forme flamande, un
   nom avec son article, l'orthographe que test/content.js exige, et pas le néerlandais d'un autre
   élément d'un autre sens. Une forme que la source tient déjà, ou celle d'un frère de sens, reste. */
function checkAlso(row, input, ctx) {
  const also = row.also;
  if (!Array.isArray(also) || !also.every(oneLine)) return ['also is a list of Dutch forms, [] for none, each a text on one line with no space at either end'];
  const T = tools(ctx), U = T.NL.util, word = input.kind === 'word', why = [];
  const key = f => U.norm(word ? U.bare(f) : f);
  const art = (T.C.byId(input.id) || {}).art;
  const flemishForms = T.NL.content.beVariants(input).map(key);
  const near = new Set(input.siblings.map(s => key(s.nl)).concat(input.also.map(key)));
  const seen = new Set();
  also.forEach(f => {
    const k = key(f), say = s => why.push('also « ' + f + ' » ' + s);
    if (/[/;]/.test(f) || (word && f.indexOf(',') >= 0)) return say('holds more than one form: one form per entry');
    if (seen.has(k)) return why.push('also lists « ' + f + ' » twice');
    seen.add(k);
    if (k === key(input.nl)) return say('is the Dutch itself');
    if (flemishForms.indexOf(k) >= 0) return say('is a Flemish form in be.js');
    if (art && !/^(de|het) \S/i.test(f)) say('drops the article of « ' + input.nl + ' »');
    const bad = U.uniq(spelling.tokens(f).filter(t => !T.S.known(t)));
    if (bad.length) why.push('also « ' + f + ' »: ' + list(bad) + ' is not Dutch that OpenTaal or flemish.tsv knows: leave it out, and say why in unsure if it is Flemish');
    if (near.has(k)) return;
    const other = T.C.sources.find(s => s.id !== input.id && key(s.nl) === k);
    if (other) say('is the Dutch of ' + other.id + ', which is not of the same sense: an answer to one is not right for the other');
  });
  return why;
}

const PAIR = 'decoys is two wrong answers to « Comment le dit-on ici ? », each a text on one line with no space at either end';
/* Les raisons que les leurres ne passent pas : deux mauvaises réponses à « Comment le dit-on
   ici ? », qu'aucun élément n'accepte, qui finissent comme la réponse, en ont la longueur à 40 %
   près, et ne s'éloignent pas du néerlandais plus que la réponse (0,15 de rapport au plus). Les
   « on dit aussi » de la ligne comptent pour sa source ; ceux qu'une autre ligne du lot écrit ne
   comptent qu'après Merge, où test/content.js les voit. */
function checkDecoys(row, input, ctx) {
  const d = row.decoys;
  if (!input.vlaams) return d === undefined ? [] : ['decoys are for a row that « Comment le dit-on ici ? » asks (vlaams), and this one is not'];
  if (!Array.isArray(d) || d.length !== 2 || !d.every(oneLine)) return [PAIR];
  const T = tools(ctx), NL = T.NL, U = NL.util;
  if (U.norm(d[0]) === U.norm(d[1])) return ['decoys « ' + d[0] + ' » and « ' + d[1] + ' » are one answer'];
  const mine = NL.ex.accepted(Object.assign({}, input, { also: Array.isArray(row.also) ? row.also : input.also }));
  const end = s => (s.match(/[.!?…]+$/) || [''])[0];
  const shown = e => e ? '« ' + e + ' »' : 'no punctuation';
  const n = Array.from(input.right).length, lo = Math.ceil(n * 0.6), hi = Math.floor(n * 1.4);
  const least = U.ratio(input.right, input.nl) - 0.15, why = [];
  d.forEach(x => {
    const keys = U.uniq([U.norm(x), U.norm(U.bare(x))]), say = s => why.push('decoy « ' + x + ' » ' + s);
    const who = U.uniq((keys.some(k => mine.indexOf(k) >= 0) ? [input.id] : [])
      .concat(...keys.map(k => (T.owners.get(k) || []).filter(id => id !== input.id))));
    if (who.length) say('is an answer the course accepts, for ' + who.join(', '));
    if (end(x) !== end(input.right)) say('ends with ' + shown(end(x)) + ', and the answer with ' + shown(end(input.right)));
    const len = Array.from(x).length;
    if (len < lo || len > hi) say('is ' + len + (len === 1 ? ' character: ' : ' characters: ') + lo + ' to ' + hi + ', the length of the answer « ' + input.right + ' » give or take 40%');
    const r = U.ratio(x, input.nl);
    if (r < least) say('is further from the Dutch than the answer: ' + r.toFixed(2) + ', at least ' + least.toFixed(2));
  });
  return why;
}

function kind(part) {
  const be = part === 'be';
  return {
    stamp: STAMP,
    fields: ['note', 'also'],
    optional: be ? ['decoys'] : [],
    tables: be ? ['notes', 'also', 'decoys'] : ['notes', 'also'],
    split: split(part),
    check: (row, input, ctx) => checkNote(row, input, ctx).concat(checkAlso(row, input, ctx), be ? checkDecoys(row, input, ctx) : []),
    /* Le relecteur lit en entier la ligne qui ajoute un « on dit aussi » : une réponse de plus
       que la saisie accepte. */
    readWhole: (row, input) => Array.isArray(row.also) && row.also.some(f => input.also.indexOf(f) < 0) ? 'new also' : '',
    /* Une liste vide, ou une ligne sans leurres, ôte la clé. */
    merge: row => Object.assign({ notes: row.note, also: row.also.length ? row.also : null }, be ? { decoys: row.decoys || null } : {})
  };
}

module.exports = { kind, flemish, chunks };
