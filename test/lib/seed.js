/* Des révisions dues, pour qu'une séance ait de quoi commencer : les `n` premiers
   éléments du cours, au rang 1, échus avant `now` à une seconde d'écart, le premier le
   moins en retard. Des échéances fixes et toutes différentes : l'ordre de la séance ne
   doit rien à l'horloge. `now` est l'horloge de la suite, jamais une date écrite en dur. */
/* L'ordre où les révisions deviennent dues : les éléments du cours, sans l'unité « eigen ». */
const dueOrder = N => N.content.allItems().filter(it => it.unit !== 'eigen');

const dueReviews = (N, n, now) => dueOrder(N).slice(0, n).forEach((it, i) => {
  N.srs.seed(it, 1); const r = N.state.rec(it.id); r.due = now - 1000 * (i + 1); N.state.setRec(r);
});

/* Un jour neuf pour le budget : rien de dépensé, quoi que la suite vienne de jouer. */
const budgetAnew = N => N.state.setMeta({ exDay: null, exToday: 0 });

module.exports = { dueOrder, dueReviews, budgetAnew };
