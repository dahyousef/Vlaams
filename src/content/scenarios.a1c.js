/* Conversations de la phase 4b. Même forme que scenarios.js, dont les aides T, Y et C sont reprises.
   Écrit par la fusion du genre scenarios (tools/content/kinds/scenarios.js) depuis ses lignes prises :
   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Elles s’ajoutent à celles de
   scenarios.js ; le fichier se charge après lui et avant content/index.js. */
NL.content = NL.content || {};
NL.content.scenarios = NL.content.scenarios || [];
(function () {
  'use strict';
  const T = (nl, g, be) => ({ them: { nl, ...NL.gloss.pair(g), be } });
  const Y = (ask, choices, hint) => ({ you: { ask, choices, hint } });
  const C = (nl, g, reply, note) => ({ nl, ...NL.gloss.pair(g), reply, note });
  const S = o => NL.content.scenarios.push(o);
})();
