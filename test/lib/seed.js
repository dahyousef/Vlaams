/* Des révisions dues, pour qu'une séance ait de quoi commencer : les `n` premiers
   éléments du cours, au rang 1, échus avant `now` à une seconde d'écart, le premier le
   moins en retard. Des échéances fixes et toutes différentes : l'ordre de la séance ne
   doit rien à l'horloge. `now` est l'horloge de la suite, jamais une date écrite en dur. */
const dueReviews = (N, n, now) => N.content.allItems().filter(it => it.unit !== 'eigen').slice(0, n).forEach((it, i) => {
  N.srs.seed(it, 1); const r = N.state.rec(it.id); r.due = now - 1000 * (i + 1); N.state.setRec(r);
});

module.exports = { dueReviews };
