/* Les tables du contenu indexées par le néerlandais : src/content/<nom>.js, lues et récrites
   entières par Merge. Un fichier de table tient son en-tête (un commentaire : ce que la table
   tient, et quel genre l'écrit), puis ces lignes, et rien d'autre :

     NL.content.byDutch = NL.content.byDutch || {};
     NL.content.byDutch['be'] = {
       'goeiedag': 'goeiendag',
       'hallo': 'hey, salut',
     };

   Une entrée par ligne. La clé est le néerlandais tel qu'il est écrit, jetons non remplis ;
   les clés sont triées par unités de code. L'en-tête, tout ce qui précède la première ligne,
   est gardé tel quel, et les fins de ligne du fichier aussi (CRLF ou LF). Une valeur s'écrit
   en littéral : une chaîne entre apostrophes, un nombre, un booléen, null, une liste, un objet
   (ses clés dans leur ordre) ou une expression régulière. Récrire une table sans rien changer
   redonne les mêmes octets.

     const table = require('./table');
     table.load(file)              { head, eol, name, entries }
     table.serialize(t)            le texte du fichier
     table.update(file, changes)   { set, removed } : une valeur pose sa clé, null l'ôte
     table.literal(v)              le littéral d'une valeur

   Le nom d'une table est celui de son fichier : src/content/open.phrases.js tient
   NL.content.byDutch['open.phrases']. Le fichier est lu en l'exécutant à part, avec node:vm :
   c'est un fichier du dépôt, écrit par ce module ou relu en revue. */
const fs = require('fs'), path = require('path'), vm = require('vm');

const MARKER = 'NL.content.byDutch = NL.content.byDutch || {};';
const ESC = { '\\': '\\\\', '\'': '\\\'', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
/* Ce qui s'échappe dans une chaîne : la barre oblique inverse, l'apostrophe, les caractères de
   contrôle, et U+2028 et U+2029, qui finissent une ligne dans un littéral JavaScript. */
const UNSAFE = new RegExp('[\\\\\'\\u0000-\\u001f' + String.fromCharCode(0x2028, 0x2029) + ']', 'g');
const quote = s => '\'' + s.replace(UNSAFE, c => ESC[c] || '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4)) + '\'';
const key = k => /^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k);
const kindOf = v => Object.prototype.toString.call(v);

function literal(v) {
  if (v === null) return 'null';
  if (typeof v === 'string') return quote(v);
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number' && isFinite(v)) return String(v);
  if (kindOf(v) === '[object RegExp]') return String(v);
  if (Array.isArray(v)) return '[' + v.map(literal).join(', ') + ']';
  if (kindOf(v) === '[object Object]') {
    const ks = Object.keys(v);
    ks.forEach(k => { if (v[k] === undefined) throw new Error('a table value holds undefined at « ' + k + ' »: write null, or leave the key out'); });
    return ks.length ? '{ ' + ks.map(k => key(k) + ': ' + literal(v[k])).join(', ') + ' }' : '{}';
  }
  throw new Error('a table value holds ' + (typeof v === 'object' ? kindOf(v) : typeof v) + ': a table holds strings, numbers, booleans, null, lists, objects and regular expressions');
}

function load(file) {
  const text = fs.readFileSync(file, 'utf8');
  const at = text.indexOf(MARKER);
  if (at < 0) throw new Error(file + ': no « ' + MARKER + ' » line');
  const name = path.basename(file, '.js');
  const sandbox = { NL: { content: {} } };
  vm.runInNewContext(text, sandbox, { filename: file });
  const all = sandbox.NL.content.byDutch;
  if (Object.keys(all).join('|') !== name) throw new Error(file + ': sets ' + Object.keys(all).map(n => 'byDutch[\'' + n + '\']').join(', ') + ', and a table file sets byDutch[\'' + name + '\'] alone');
  return { head: text.slice(0, at), eol: /\r\n/.test(text) ? '\r\n' : '\n', name, entries: all[name] };
}

function serialize(t) {
  const lines = [MARKER, 'NL.content.byDutch[' + quote(t.name) + '] = {']
    .concat(Object.keys(t.entries).sort().map(k => '  ' + quote(k) + ': ' + literal(t.entries[k]) + ','), ['};']);
  return t.head + lines.map(l => l + t.eol).join('');
}

function update(file, changes) {
  const t = load(file);
  let set = 0, removed = 0;
  Object.keys(changes).forEach(k => {
    if (changes[k] === null) {
      if (Object.prototype.hasOwnProperty.call(t.entries, k)) { delete t.entries[k]; removed++; }
    } else { t.entries[k] = changes[k]; set++; }
  });
  const text = serialize(t);
  if (text !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, text);
  return { set, removed };
}

module.exports = { MARKER, literal, load, serialize, update };
