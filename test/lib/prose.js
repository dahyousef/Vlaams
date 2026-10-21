/* Les champs de texte libre du cours — ceux qui deviennent { fr, en } — et les
   collections où ils vivent. Une seule liste, pour toutes les suites. */
const PROSE = ['name', 'blurb', 'note', 'title', 'rule', 'explain', 'ask', 'what', 'h', 'place', 'outro', 'hint'];
const COLLECTIONS = ['units', 'patterns', 'openTasks', 'register', 'hetRules', 'deRules', 'sheets', 'scenarios'];

/* Un anglais lu : une chaîne non vide, pas un trou. */
const has = x => typeof x === 'string' && x.trim() !== '';

/* Le cours tel qu'il est écrit : une copie des collections, prise avant la première
   construction (avant NL.state.open()), quand {naam}, {stad} et {bedrijf} y sont encore. */
function raw(content) {
  const out = {};
  COLLECTIONS.forEach(k => { out[k] = JSON.parse(JSON.stringify(content[k] || [])); });
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
  const re = /\[(\d+)\]|\.?([^.\[\]]+)/g;
  let v = root, m;
  while ((m = re.exec(where))) {
    v = (v === undefined || v === null) ? undefined : (m[1] !== undefined ? v[+m[1]] : v[m[2]]);
    if (v === undefined) throw new Error('« ' + where + ' » ne désigne rien');
  }
  return v;
}

module.exports = { PROSE, COLLECTIONS, has, raw, owed, at };
