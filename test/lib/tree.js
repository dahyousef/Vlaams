/* Le parcours d'un arbre : le cours, ou une table de l'interface. Écrit une fois, pour
   toutes les suites. Un élément de tableau garde la clé de son tableau, et un chemin
   s'écrit comme ceux d'owed() (units[3].words[0].fr) : at() le relit. owed() garde son
   propre parcours : il s'arrête à une paire et saute fr et en, ce que visit ne sait pas faire. */

/* Chaque nœud, avant ses enfants : fn(nœud, clé, chemin). fn peut changer le nœud. */
function visit(v, fn, key, where) {
  fn(v, key, where);
  if (Array.isArray(v)) v.forEach((x, i) => visit(x, fn, key, where + '[' + i + ']'));
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => visit(v[k], fn, k, where + '.' + k));
}

/* Chaque feuille (ni tableau ni objet : une chaîne, une fonction…) remplacée par
   fn(feuille, clé, chemin). Un objet est changé en place, un tableau refait : on garde
   ce que rewrite rend. */
function rewrite(v, fn, key, where) {
  if (Array.isArray(v)) return v.map((x, i) => rewrite(x, fn, key, where + '[' + i + ']'));
  if (v && typeof v === 'object') { Object.keys(v).forEach(k => { v[k] = rewrite(v[k], fn, k, where + '.' + k); }); return v; }
  return fn(v, key, where);
}

module.exports = { visit, rewrite };
