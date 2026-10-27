/* Ce que le kit de contenu (tools/content/) et test/content.js lisent d'un texte, écrit une
   fois : une forme sur une ligne, ses chiffres et ses {jetons}, ses citations.

     const { QUOTES, oneLine, sig, untoken, quotes, strayQuotes } = require('./lib/text');
     QUOTES          les guillemets de chaque langue : fr « », en “ ”
     oneLine(s)      vrai pour une chaîne non vide, sans blanc autour, sans \r ni \n
     sig(s)          les chiffres et les {jetons} d'un texte, triés : deux textes qui disent la
                     même chose, en fr et en en, ont la même
     untoken(s)      le texte, chaque {jeton} remplacé par un blanc
     quotes(s, l)    les citations d'un texte de langue l : { quoted, outside, why }, voir plus bas
     strayQuotes(s, l, banned)
                     la raison qu'un texte de langue l écrit les guillemets de l'autre langue,
                     ou l'un des signes de banned ; '' sinon. Elle ne nomme pas le texte : qui
                     l'appelle la fait précéder du nom de son champ (fr, note.fr) */

const QUOTES = { en: ['“', '”'], fr: ['«', '»'] };
const oneLine = s => typeof s === 'string' && s !== '' && s === s.trim() && !/[\r\n]/.test(s);
const sig = s => (String(s).match(/\d+|\{[a-z]+\}/g) || []).sort().join('|');
const untoken = s => String(s).replace(/\{[a-z]+\}/g, ' ');

/* Un texte et ses citations entre les guillemets de sa langue. quoted : les passages cités,
   rognés. outside : le texte hors citations, chacune remplacée par « # », pour que la
   ponctuation qu'elle porte ne compte pas. why : '' quand chaque guillemet a sa paire, sinon la
   première faute dans l'ordre du texte, en anglais comme les raisons du kit. Les guillemets de
   l'autre langue ne comptent pas ici : strayQuotes les lit. */
function quotes(s, l) {
  const [open, close] = QUOTES[l], quoted = [];
  let depth = 0, cur = '', outside = '', why = '';
  const fail = r => { why = why || r; };
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === open) {
      if (depth) fail(s.indexOf(close, i) >= 0 ? 'a quote inside a quote' : 'a ' + open + ' never closed');
      depth = 1; cur = '';
    } else if (ch === close) {
      if (!depth) fail('a ' + close + ' with no ' + open + ' before it');
      else if (!cur.trim()) fail('an empty quote');
      else { quoted.push(cur.trim()); outside += '#'; }
      depth = 0;
    } else if (depth) cur += ch;
    else outside += ch;
  }
  if (depth) fail('a ' + open + ' never closed');
  return { quoted, outside, why };
}

/* Chaque langue ne cite qu'avec ses guillemets : la raison, en anglais comme celles du kit,
   qu'un texte de langue l écrit ceux de l'autre langue ou l'un des signes de banned, '' sinon.
   Elle ne nomme pas le texte : qui l'appelle la fait précéder du nom de son champ. open.js
   passe le guillemet droit dans banned ; explain.js le refuse d'une autre raison. */
const strayQuotes = (s, l, banned) => (QUOTES[l === 'fr' ? 'en' : 'fr'].concat(banned || []).some(m => s.indexOf(m) >= 0) ?
  'quotes with ' + QUOTES[l].join(' ') + ' only' : '');

module.exports = { QUOTES, oneLine, sig, untoken, quotes, strayQuotes };
