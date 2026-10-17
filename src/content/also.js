/* D'autres façons de dire la même chose.

   La table donne, pour un élément, ce que la réponse tapée accepte en plus de
   la cible et de la variante flamande, et ce que le panneau liste après coup
   (« On dit aussi : … »). Du néerlandais seulement, jamais stocké : l'élément
   du contenu la porte, pas l'enregistrement de la personne.

   Les éléments s'accrochent par leur forme exacte, article compris : si un mot
   est renommé dans le lexique, sa ligne ne suit pas en silence. */
(function () {
  'use strict';
  const ALSO = {
    'goeiedag': ['dag'],
    'hallo': ['dag'],
    'dag': ['hallo'],
    'dank u wel': ['dank u', 'bedankt']
  };

  const missing = [];
  const hit = new Set();
  NL.content.units.forEach(u => (u.words || []).concat(u.phrases || []).forEach(it => {
    if (ALSO[it.nl]) { it.also = ALSO[it.nl]; hit.add(it.nl); }
  }));
  Object.keys(ALSO).forEach(nl => { if (!hit.has(nl)) missing.push(nl); });
  NL.content.alsoReport = { attached: hit.size, missing };
})();
