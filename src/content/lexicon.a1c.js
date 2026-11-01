/* Lexique A1, unités 13 à 34. Même forme que lexicon.a1.js.
   Écrit par la fusion du genre words (tools/content/kinds/words.js) depuis ses lignes prises : une
   correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités n’ont que des mots ;
   leurs phrases et leur grammaire viennent avec les plans 4b et 4c. */
NL.content = NL.content || {};
NL.content.units = NL.content.units || [];
(function () {
  'use strict';
  const W = (nl, g, art) => ({ kind: 'word', nl, ...NL.gloss.pair(g), art });
  const U = o => NL.content.units.push(o);
})();
