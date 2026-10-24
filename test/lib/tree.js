/* Le parcours d'un arbre : le cours, ou une table de l'interface. Écrit une fois, pour
   toutes les suites. Un élément de tableau garde la clé de son tableau, et un chemin
   s'écrit comme ceux d'owed() (units[3].words[0].fr) : at() le relit. owed() garde son
   propre parcours : il s'arrête à une paire et saute fr et en, ce que visit ne sait pas faire.

     const tree = require('./lib/tree');
     tree.visit(v, fn, key, where)    chaque nœud, avant ses enfants : fn(nœud, clé, chemin)
     tree.rewrite(v, fn, key, where)  chaque feuille remplacée par fn(feuille, clé, chemin) ; garder ce qu'il rend
     tree.visitCourse(C, fn)          visit sur chaque collection du cours
     tree.rewriteCourse(C, fn)        rewrite sur chaque collection, remise à sa place
     tree.visitTables(C, fn)          visit sur chaque valeur des tables rangées par le néerlandais */
const { COLLECTIONS } = require('./prose');

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

/* Le cours entier : visit ou rewrite sur chaque collection, sa clé pour clé et pour début
   de chemin (units[3].words[0].fr). rewriteCourse remet chaque collection à sa place. */
const visitCourse = (C, fn) => COLLECTIONS.forEach(k => visit(C[k], fn, k, k));
const rewriteCourse = (C, fn) => COLLECTIONS.forEach(k => { C[k] = rewrite(C[k], fn, k, k); });

/* Les tables rangées par le néerlandais (src/content/<table>.js, NL.content.TABLES) : visit sur
   chaque valeur, le champ que la table pose sur l'élément pour clé (be, note…) et
   byDutch.be["hallo"] pour chemin. visit sur NL.content passe aussi par ces valeurs, mais sous
   le néerlandais de l'élément pour clé : une suite qui cherche un champ par son nom appelle
   visitTables. */
const visitTables = (C, fn) => (C.TABLES || []).forEach(t => {
  const tb = (C.byDutch || {})[t.table] || {};
  Object.keys(tb).forEach(k => visit(tb[k], fn, t.field, 'byDutch.' + t.table + '[' + JSON.stringify(k) + ']'));
});

module.exports = { visit, rewrite, visitCourse, rewriteCourse, visitTables };
