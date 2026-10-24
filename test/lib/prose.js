/* Le cours tel que les suites le lisent : ses champs de prose, et l'anglais qu'ils doivent.

     const { PROSE, COLLECTIONS, has, raw, owed, at } = require('./lib/prose');
     PROSE        les champs de texte libre du cours, ceux qui deviennent { fr, en }
     COLLECTIONS  les collections du cours, où ils vivent
     has(x)       un anglais lu : une chaîne non vide, pas un trou
     raw(content) une copie du cours tel qu'il est écrit, prise avant NL.state.open()
     owed(v, where, key, out)  l'anglais qui reste dû : un { where, ok } par endroit
     at(root, where)  ce qu'un `where` d'owed() désigne dans `root`
     proseTables(C)   les tables rangées par le néerlandais (C.TABLES) dont le champ est dans PROSE
     tablePath(table, nl)  le chemin d'une valeur de table : byDutch.notes["hallo"]
     owedTables(C, out)    owed() sur chaque valeur de ces tables : un { where, ok, nl } par endroit */

/* Les champs de texte libre du cours — ceux qui deviennent { fr, en } — et les
   collections où ils vivent. Une seule liste, pour toutes les suites. */
const PROSE = ['name', 'blurb', 'note', 'title', 'rule', 'explain', 'ask', 'what', 'h', 'place', 'outro', 'hint'];
const COLLECTIONS = ['units', 'patterns', 'openTasks', 'register', 'hetRules', 'deRules', 'sheets', 'scenarios'];

/* Un anglais lu : une chaîne non vide, pas un trou. */
const has = x => typeof x === 'string' && x.trim() !== '';

/* Les tables rangées par le néerlandais (src/content/<table>.js, NL.content.TABLES) dont le champ
   est de la prose : la note d'un mot y vit hors du lexique, et doit son anglais comme lui. */
const proseTables = C => (C.TABLES || []).filter(t => PROSE.indexOf(t.field) >= 0);
/* Le chemin d'une valeur de table, sa clé écrite en JSON : byDutch.notes["Ik werk bij {bedrijf}."]. */
const tablePath = (table, nl) => 'byDutch.' + table + '[' + JSON.stringify(nl) + ']';

/* Le cours tel qu'il est écrit : une copie des collections et des tables de prose, prise avant la
   première construction (avant NL.state.open()), quand {naam}, {stad} et {bedrijf} y sont encore.
   Les tables y gardent leur forme : RAW.TABLES, et RAW.byDutch sous leur nom. */
function raw(content) {
  const out = Object.fromEntries(COLLECTIONS.map(k => [k, JSON.parse(JSON.stringify(content[k] || []))]));
  out.TABLES = proseTables(content).map(t => Object.assign({}, t));
  out.byDutch = Object.fromEntries(out.TABLES.map(t => [t.table, JSON.parse(JSON.stringify((content.byDutch || {})[t.table] || {}))]));
  return out;
}

/* L'anglais qui reste dû : un { where, ok } par endroit qui doit porter un `en`. */
function owed(v, where, key, out) {
  if (Array.isArray(v)) { v.forEach((x, i) => owed(x, where + '[' + i + ']', key, out)); return out; }
  if (v && typeof v === 'object') {
    if (PROSE.indexOf(key) >= 0 && 'fr' in v) { out.push({ where, ok: has(v.en) || (key === 'note' && v.en === null) }); return out; }
    if (typeof v.fr === 'string') out.push({ where: where + '.fr', ok: has(v.en) });
    Object.keys(v).forEach(k => { if (k !== 'fr' && k !== 'en') owed(v[k], where + '.' + k, k, out); });
    return out;
  }
  if (typeof v === 'string' && PROSE.indexOf(key) >= 0) out.push({ where, ok: false });
  return out;
}

/* Ce qu'un `where` d'owed() désigne dans `root`. Un chemin qui ne désigne rien est une erreur,
   pas une valeur vide : la séance de contrôle lirait une ligne blanche sans le savoir. */
function at(root, where) {
  const re = /\[(\d+)\]|\[("(?:[^"\\]|\\.)*")\]|\.?([^.\[\]]+)/g;
  let v = root, m;
  while ((m = re.exec(where))) {
    const k = m[1] !== undefined ? +m[1] : m[2] !== undefined ? JSON.parse(m[2]) : m[3];
    v = (v === undefined || v === null) ? undefined : v[k];
    if (v === undefined) throw new Error('« ' + where + ' » ne désigne rien');
  }
  return v;
}

/* L'anglais qui reste dû dans les tables de prose : owed() sur chaque valeur, son chemin pour
   where, son champ pour clé, et le néerlandais sous lequel elle est rangée. */
function owedTables(C, out) {
  proseTables(C).forEach(t => {
    const tb = (C.byDutch || {})[t.table] || {};
    Object.keys(tb).forEach(nl => owed(tb[nl], tablePath(t.table, nl), t.field, []).forEach(r => out.push(Object.assign(r, { nl }))));
  });
  return out;
}

module.exports = { PROSE, COLLECTIONS, has, raw, owed, at, proseTables, tablePath, owedTables };
