/* Les mots néerlandais du cours, écrits une fois : test/lang.js y cherche le néerlandais qu'une
   prose laisse nu (6d.4), et les genres d'explications (tools/content/lib/explain.js) refusent
   une note qui en laisse comme lui.

     const { dutchWords, words, tokenFreeWords, courseWords } = require('./lib/dutch');
     words(s)          les mots d'un texte, en minuscules, séparés par tout ce qui n'est ni lettre ni chiffre
     tokenFreeWords(s) les mots d'un texte, ses {jetons} ôtés : comme le kit lit le néerlandais
                       d'un texte
     courseWords(s)    les mots d'un texte sans ses nombres (25) : un nombre s'écrit le même en néerlandais,
                       en français et en anglais, et les deux sens d'un texte portent les mêmes chiffres. Un mot
                       qui porte un chiffre (v2) reste. Les genres grammar et scenarios y lisent les phrases
                       d'une ligne
     dutchWords(NL)    un Set des mots (courseWords), en minuscules : nl, be, les phrases, les colonnes du
                       registre (std), les exemples des règles (ex), les modèles de réponse (model),
                       les identifiants d'unité, qui sont des mots néerlandais, ceux des tables
                       rangées par le néerlandais, dont les « on dit aussi » (also) et les leurres
                       (decoys) que l'écran montre, la navigation et les noms par défaut
     DUTCH_KEYS        les clés qu'il lit */
const tree = require('./tree');
const { untoken } = require('./text');

const DUTCH_KEYS = ['nl', 'be', 'std', 'ex', 'model', 'id', 'nlName', 'also', 'decoys'];
/* Les mots d'un texte, en minuscules : le découpage que dutchWords, lang.js et explain.js partagent. */
const words = s => String(s).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const tokenFreeWords = s => words(untoken(s));
/* Les mots du cours d'un texte : un nombre n'en est pas un (6d.4 le prendrait sinon pour du néerlandais laissé nu
   dans toute prose qui porte le même chiffre en français et en anglais). */
const courseWords = s => words(s).filter(w => !/^\p{N}+$/u.test(w));
function dutchWords(NL) {
  const set = new Set();
  const add = s => courseWords(s).forEach(w => set.add(w));
  const dutchKey = (v, key) => { if (DUTCH_KEYS.indexOf(key) >= 0 && typeof v === 'string') add(v); };
  tree.visit(NL.content, dutchKey);
  tree.visitTables(NL.content, dutchKey);
  NL.t.nav.forEach(n => add(n.nl));
  Object.keys(NL.content.DEFAULTS).forEach(k => add(NL.content.DEFAULTS[k]));
  return set;
}

module.exports = { DUTCH_KEYS, dutchWords, words, tokenFreeWords, courseWords };
