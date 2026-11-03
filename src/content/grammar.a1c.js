/* Règles de grammaire des unités 13 à 34. Même forme que grammar.js.
   Écrit par la fusion du genre grammar (tools/content/kinds/grammar.js) depuis ses lignes prises :
   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités de
   lexicon.a1c.js gardent grammar: [] dans leur fichier ; la boucle en bas range chaque règle dans la
   liste de son unité au chargement, et lève une erreur, avec l’id de la règle, quand l’unité manque. */
NL.content = NL.content || {};
NL.content.patterns = NL.content.patterns || [];
(function () {
  'use strict';
  const D = (nl, g, gap) => ({ nl, ...NL.gloss.pair(g), gap });
  const P = p => NL.content.patterns.push(p);

  [].forEach(r => {
    const u = NL.content.units.find(x => x.id === r[1]);
    if (!u) throw new Error('grammar.a1c.js : la règle ' + r[0] + ' veut l’unité « ' + r[1] + ' », que le cours n’a pas (lexicon.a1c.js se charge avant)');
    (u.grammar = u.grammar || []).push(r[0]);
  });
})();
