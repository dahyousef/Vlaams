/* Phrases des unités 13 à 34, prises dans Tatoeba (docs/attribution/tatoeba-phrases.tsv les crédite).
   Même forme que les phrases de lexicon.a1.js, plus src, le numéro de la phrase de Tatoeba.
   Écrit par la fusion du genre phrases (tools/content/kinds/phrases.js) depuis ses lignes prises :
   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités de
   lexicon.a1c.js gardent phrases: [] dans leur fichier ; U range les phrases de chaque unité dans sa
   liste au chargement, et lève une erreur, avec l’id de l’unité, quand l’unité manque. */
NL.content = NL.content || {};
NL.content.units = NL.content.units || [];
(function () {
  'use strict';
  const P = (nl, g, src) => ({ kind: 'phrase', nl, ...NL.gloss.pair(g), src });
  const U = (id, phrases) => {
    const u = NL.content.units.find(x => x.id === id);
    if (!u) throw new Error('phrases.a1c.js : les phrases de l’unité « ' + id + ' » n’ont pas leur unité dans le cours (lexicon.a1c.js se charge avant)');
    (u.phrases = u.phrases || []).push(...phrases);
  };
})();
