/* Un cours plus grand que le vrai, pour ce qui ne se voit qu'à l'échelle : la séance qui
   suit l'arriéré (ADR 0007). Des copies des unités du cours,
   mots et phrases avec un suffixe qui les garde uniques (« hallo zz1q0 » : groupe 1, unité 0),
   sans grammaire ni scénario, poussées sur NL.content.units jusqu'à ce que le cours compte au
   moins `target` éléments, comptés comme build() les compte (un mot ou une phrase par genre
   et néerlandais, un motif par identifiant). À appeler dans le `prepare` de browser.open :
   src/content/index.js fige les unités au premier build(). Rend le nombre d'éléments.

     const grow = require('./lib/grow');
     browser.open({ ..., prepare: NL => grow(NL, 1160) }) */
function grow(NL, target) {
  const units = NL.content.units, real = units.slice();
  const count = () => {
    const keys = new Set();
    units.forEach(u => {
      (u.words || []).forEach(w => keys.add('word|' + NL.util.norm(w.nl)));
      (u.phrases || []).forEach(p => keys.add('phrase|' + NL.util.norm(p.nl)));
      (u.grammar || []).forEach(g => keys.add('pattern|' + g));
    });
    return keys.size;
  };
  for (let g = 1; count() < target; g++) {
    for (let k = 0; k < real.length && count() < target; k++) {
      const u = real[k], tag = ' zz' + g + 'q' + k;
      const copy = x => Object.assign({}, x, { nl: x.nl + tag });
      units.push(Object.assign({}, u, { id: u.id + '-x' + g, n: 100 * g + k, grammar: [],
        words: (u.words || []).map(copy), phrases: (u.phrases || []).map(copy) }));
    }
  }
  return count();
}

module.exports = grow;
