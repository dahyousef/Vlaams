/* Le cours tel que les outils de contenu le lisent : les mots et les phrases tels qu'ils
   sont écrits, jetons ({naam}, {stad}, {bedrijf}) non remplis, un par élément.

     const { course } = require('./course');
     const C = course(repo);
     C.NL          l'application chargée sans l'app ni l'état (NL.util, NL.gloss, NL.content)
     C.RAW         les collections du cours telles qu'elles sont écrites (test/lib/prose.js, raw())
     C.sources     un élément par mot ou phrase, dans l'ordre du cours : sa première inscription,
                   avec id, kind, unit et copies (les ids de ses autres inscriptions)
     C.byId(id)    la source d'un id ; undefined pour une copie ou un id inconnu

   Les éléments se forment comme build() les forme (src/content/index.js) : le genre et le
   néerlandais écrit, par NL.util.norm. Les modèles (patterns) n'en sont pas : leur
   néerlandais peut être celui d'une phrase, et une table indexée par le néerlandais ne
   les distinguerait pas. */
const path = require('path');

function course(repo) {
  const root = path.resolve(repo);
  const browser = require(path.join(root, 'test', 'lib', 'browser'));
  const { raw } = require(path.join(root, 'test', 'lib', 'prose'));
  const NL = browser.open({ root, seed: browser.SEED, skip: [browser.APP] }).NL;
  const RAW = raw(NL.content);
  const sources = [], byKey = new Map(), byNl = new Map();
  RAW.units.forEach(u => ['word', 'phrase'].forEach(kind => (u[kind + 's'] || []).forEach((x, i) => {
    const id = u.id + ':' + kind[0] + i;
    const key = kind + '|' + NL.util.norm(x.nl);
    const first = byKey.get(key);
    if (first) { first.copies.push(id); return; }
    if (byNl.has(x.nl)) throw new Error(id + ' and ' + byNl.get(x.nl) + ' share the Dutch « ' + x.nl + ' »: a table keyed by it could not tell them apart');
    const src = Object.assign({}, x, { id, kind, unit: u.id, copies: [] });
    byKey.set(key, src);
    byNl.set(x.nl, id);
    sources.push(src);
  })));
  const byId = new Map(sources.map(s => [s.id, s]));
  return { NL, RAW, sources, byId: id => byId.get(id) };
}

module.exports = { course };
