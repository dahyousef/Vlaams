/* Les phrases de Tatoeba (tatoeba.org, CC BY 2.0 FR) traduites en anglais ET en français, avec
   leurs auteurs, tirées des fichiers épinglés tatoeba/… (tools/content/lib/cache.js). L'extrait
   vit dans .cache/tatoeba/extract.tsv, jamais dans un fichier versionné : seules les phrases
   choisies entrent au dépôt, chacune créditée dans docs/attribution/tatoeba.tsv (ATTRIBUTION.md).

     node tools/content/tatoeba.js <repo>   écrit l'extrait, depuis .cache/tatoeba/
     const tatoeba = require('./tools/content/tatoeba');
     await tatoeba.extract(repo, { pins })  { nld, eng, fra } : écrit l'extrait, rend ses comptes
     tatoeba.load(repo, { pins })           { nld, eng, fra, byForm } : les phrases de l'extrait,
                                            par id ; une erreur qui dit la commande à lancer si
                                            l'extrait manque, ou s'il vient d'autres épingles
     tatoeba.rank(T, item, seq)             les candidates d'un mot du cours, 8 au plus, classées
     tatoeba.JE                             je, jij, jou, jouw : le tutoiement que le cours
                                            n'enseigne pas (il enseigne ge et gij)

   Une phrase néerlandaise : { id, text, owner, native, eng: [id…], fra: [id…] } ; une
   traduction : { id, text, owner }. Un id est un nombre ; owner vaut '' quand Tatoeba n'en
   nomme pas ; native est vrai quand l'auteur se dit de langue maternelle néerlandaise
   (user_languages.csv, niveau 5). byForm : Map forme → les phrases néerlandaises qui l'écrivent.
   seq : { NL, first, ui } (test/lib/sequence.js), et known, facultatif : une fonction qui dit
   si une forme s'écrit ainsi (test/lib/spelling.js, S.known). Une candidate :
   { id, nl, owner, en: [{ id, text, owner }], fr: [{ id, text, owner }], tiles }.

   Une candidate écrit le mot (une de ses formes ; les formes d'un mot de plusieurs formes, à la
   suite), a de 4 à 8 tuiles, n'emprunte rien à une unité ultérieure, n'emploie hors des formes du
   mot que ce que le cours a enseigné jusqu'à l'unité du mot (#12, récit 39 : pas une forme jamais
   enseignée, pas même fléchie d'un mot vu ; test/lib/sequence.js dit pourquoi), ne nomme ni le
   prénom, ni la commune, ni l'employeur par défaut, et, quand seq.known est donné, n'a que des
   formes qu'il connaît. Le classement : sans je, jij, jou ni jouw d'abord (le cours enseigne ge
   et gij), puis d'un auteur de langue maternelle, puis moins de tuiles, et l'id.

   L'extrait est une ligne d'en-tête qui nomme les épingles lues, puis une ligne par phrase, par
   langue et par id : « nld », id, auteur, 1 ou 0, texte, ids anglais et ids français séparés
   par « , » ; « eng » ou « fra », id, auteur, texte. Une phrase néerlandaise n'y est que si une
   traduction anglaise ET une française existent. Les fichiers épinglés se lisent ligne à ligne,
   comme du texte : rien ne s'en exécute. */
const fs = require('fs'), path = require('path'), readline = require('readline');
const cache = require('./lib/cache');
const { tokens, named } = require('../../test/lib/spelling');
const sequence = require('../../test/lib/sequence');

const KEYS = ['tatoeba/nld_sentences_detailed.tsv', 'tatoeba/eng_sentences_detailed.tsv', 'tatoeba/fra_sentences_detailed.tsv',
  'tatoeba/nld-eng_links.tsv', 'tatoeba/nld-fra_links.tsv', 'tatoeba/user_languages.csv'];
const OUT = 'tatoeba/extract.tsv';
const JE = ['je', 'jij', 'jou', 'jouw'];
const head = pins => '# ' + KEYS.map(k => k + ' ' + (pins || cache.PINS)[k].sha256).join(' ');
const cell = s => String(s == null ? '' : s).replace(/[\t\r\n]+/g, ' ').trim();
const owner = s => (s === '\\N' ? '' : cell(s));

async function each(file, fn) {
  const lines = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
  for await (const line of lines) if (line) fn(line.split('\t'));
}

async function extract(repo, opts) {
  const pins = (opts && opts.pins) || cache.PINS;
  const file = KEYS.map(k => cache.get(repo, k, pins));
  const links = { eng: new Map(), fra: new Map() };
  for (const [lang, f] of [['eng', file[3]], ['fra', file[4]]]) {
    await each(f, c => {
      const from = Number(c[0]), to = Number(c[1]);
      if (!links[lang].has(from)) links[lang].set(from, []);
      links[lang].get(from).push(to);
    });
  }
  const native = new Set();
  await each(file[5], c => { if (c[0] === 'nld' && c[1] === '5' && c[2]) native.add(c[2]); });
  const nld = new Map();
  await each(file[0], c => {
    const id = Number(c[0]);
    if (c[1] === 'nld' && links.eng.has(id) && links.fra.has(id)) nld.set(id, { id, owner: owner(c[3]), text: cell(c[2]) });
  });
  const tr = { eng: new Map(), fra: new Map() };
  for (const [lang, f] of [['eng', file[1]], ['fra', file[2]]]) {
    const want = new Set();
    nld.forEach(s => links[lang].get(s.id).forEach(id => want.add(id)));
    await each(f, c => {
      const id = Number(c[0]);
      if (c[1] === lang && want.has(id)) tr[lang].set(id, { id, owner: owner(c[3]), text: cell(c[2]) });
    });
  }
  /* Une traduction effacée depuis le lien n'est pas dans son fichier : le lien tombe, et la
     phrase avec lui si c'était sa seule traduction dans cette langue. */
  const kept = [...nld.values()].map(s => Object.assign(s, {
    native: native.has(s.owner),
    eng: links.eng.get(s.id).filter(id => tr.eng.has(id)).sort((a, b) => a - b),
    fra: links.fra.get(s.id).filter(id => tr.fra.has(id)).sort((a, b) => a - b)
  })).filter(s => s.eng.length && s.fra.length).sort((a, b) => a.id - b.id);
  const used = { eng: new Set(), fra: new Set() };
  kept.forEach(s => ['eng', 'fra'].forEach(l => s[l].forEach(id => used[l].add(id))));
  const lines = [head(pins)].concat(kept.map(s => ['nld', s.id, s.owner, s.native ? 1 : 0, s.text, s.eng.join(','), s.fra.join(',')].join('\t')));
  ['eng', 'fra'].forEach(l => [...used[l]].sort((a, b) => a - b).forEach(id => {
    const t = tr[l].get(id);
    lines.push([l, id, t.owner, t.text].join('\t'));
  }));
  const out = path.join(path.resolve(repo), '.cache', OUT);
  fs.writeFileSync(out + '.part', lines.join('\n') + '\n');
  fs.renameSync(out + '.part', out);
  return { nld: kept.length, eng: used.eng.size, fra: used.fra.size };
}

function load(repo, opts) {
  const pins = (opts && opts.pins) || cache.PINS;
  const file = path.join(path.resolve(repo), '.cache', OUT);
  if (!fs.existsSync(file)) throw new Error('.cache/' + OUT + ' is missing: run node tools/content/tatoeba.js .');
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  if (lines[0] !== head(pins)) throw new Error('.cache/' + OUT + ' comes from other pins of tatoeba: run node tools/content/tatoeba.js .');
  const T = { nld: new Map(), eng: new Map(), fra: new Map(), byForm: new Map() };
  const ids = s => s.split(',').map(Number);
  lines.slice(1).forEach(l => {
    const c = l.split('\t');
    if (c[0] === 'nld') T.nld.set(Number(c[1]), { id: Number(c[1]), text: c[4], owner: c[2], native: c[3] === '1', eng: ids(c[5]), fra: ids(c[6]) });
    else T[c[0]].set(Number(c[1]), { id: Number(c[1]), text: c[3], owner: c[2] });
  });
  T.nld.forEach(s => new Set(tokens(s.text)).forEach(t => {
    if (!T.byForm.has(t)) T.byForm.set(t, []);
    T.byForm.get(t).push(s);
  }));
  return T;
}

function rank(T, item, seq) {
  const NL = seq.NL, U = NL.util;
  const own = sequence.forms(item, NL), word = tokens(U.bare(item.nl));
  const run = s => (' ' + tokens(s).join(' ') + ' ').indexOf(' ' + word.join(' ') + ' ') >= 0;
  const pool = new Set();
  if (word.length === 1) own.forEach(f => (T.byForm.get(f) || []).forEach(s => pool.add(s)));
  else (T.byForm.get(word[0]) || []).forEach(s => { if (run(s.text)) pool.add(s); });
  const je = c => (tokens(c.nl).some(t => JE.indexOf(t) >= 0) ? 1 : 0);
  return [...pool].map(s => ({ s, tiles: U.tiles(s.text).length }))
    .filter(x => x.tiles >= 4 && x.tiles <= 8 && !sequence.unmet(x.s.text, seq.ui, seq.first, own).length &&
      !sequence.ahead(x.s.text, seq.ui, seq.first).length && !named(x.s.text, NL) && (!seq.known || tokens(x.s.text).every(seq.known)))
    .map(x => ({
      id: x.s.id, nl: x.s.text, owner: x.s.owner, native: x.s.native,
      en: x.s.eng.map(id => ({ id, text: T.eng.get(id).text, owner: T.eng.get(id).owner })),
      fr: x.s.fra.map(id => ({ id, text: T.fra.get(id).text, owner: T.fra.get(id).owner })),
      tiles: x.tiles
    }))
    .sort((a, b) => je(a) - je(b) || (b.native ? 1 : 0) - (a.native ? 1 : 0) || a.tiles - b.tiles || a.id - b.id)
    .slice(0, 8)
    .map(c => ({ id: c.id, nl: c.nl, owner: c.owner, en: c.en, fr: c.fr, tiles: c.tiles }));
}

module.exports = { extract, load, rank, KEYS, JE };

if (require.main === module) {
  const repo = process.argv[2];
  if (!repo) { console.log('usage: node tools/content/tatoeba.js <repo>'); process.exit(1); }
  extract(repo).then(r => {
    console.log('ok .cache/' + OUT + ' ' + r.nld + ' Dutch sentences, ' + r.eng + ' English, ' + r.fra + ' French');
  }, e => { console.log('fail ' + e.message); process.exit(1); });
}
