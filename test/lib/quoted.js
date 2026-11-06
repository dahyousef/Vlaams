/* Les citations et le néerlandais nu d'une prose du cours, écrits une fois : test/lang.js (6d.3, 6d.4)
   les lit sur tout le cours, et les genres grammar et scenarios (tools/content/kinds/) les appellent
   sur une ligne avant qu'elle soit fondue, pour que Check refuse ce que 6d refuserait à Merge. Ce
   module ne lit pas les champs de prose (test/lib/prose.js) ni les citations d'une note de mot
   (quotes, test/lib/text.js) : il dit si ce qu'une prose cite est du néerlandais du cours, et si elle
   en laisse nu.

     const { QUOTE_OK, SHARED_OK, QUOTED_FIELDS, HTML_FIELDS, names, quotedSegments, foreignQuotes, bareDutch, htmlTokens }
       = require('./lib/quoted');
     QUOTE_OK        les mots cités hors du néerlandais du cours qui sont pourtant du néerlandais, avec la raison
     SHARED_OK       les mots que le français et l'anglais écrivent tous deux et que le cours a aussi, avec la raison
     QUOTED_FIELDS   les champs de texte simple qui citent : NL.gloss.quoted les montre
     HTML_FIELDS     les champs écrits en HTML : NL.gloss.prose les montre
     names(NL)       un Set des mots des noms que {naam}, {stad} et {bedrijf} prennent par défaut
     quotedSegments(NL, text)
                     les passages que NL.gloss.quoted marque nl-BE dans `text` (un texte sans balises), dans
                     l'ordre, avec les caractères que l'écran échappe rendus
     foreignQuotes(NL, text, dutch, excuse)
                     { foreign, excused, paired } : foreign, les passages cités de `text` dont un mot n'est ni
                     dans `dutch` (un Set de mots en minuscules, dutchWords de test/lib/dutch plus ce que
                     l'appelant tient pour du néerlandais), ni un chiffre, ni un affixe cité avec son tiret,
                     ni dans QUOTE_OK ; excused, les mots de QUOTE_OK que ces passages ont employés ; paired,
                     vrai quand chaque guillemet ouvert est fermé et que NL.gloss.quoted marque autant de
                     passages. excuse(passage), s'il est donné, rend vrai pour un passage que l'appelant
                     accepte (la citation d'une note que l'autre langue cite aussi)
     bareDutch(NL, dutch, named, field, fr, en)
                     { bare, shared } : les mots du néerlandais du cours (`dutch`) que les côtés fr et en
                     d'un même champ écrivent tous deux hors de tout passage nl-BE, sans les mots de `named` :
                     bare, ceux qu'aucune exception de SHARED_OK n'excuse ; shared, ceux qu'elle excuse.
                     `field` dit comment l'écran montre le texte (HTML_FIELDS : NL.gloss.prose ; sinon
                     NL.gloss.quoted) ; fr et en sont les textes écrits, jetons déjà remplis (NL.content.fill)
     htmlTokens(field, text)
                     les {jetons} de `text` quand `field` est dans HTML_FIELDS : le texte de l'apprenant ({naam},
                     {stad}, {bedrijf}) y serait lu comme du balisage, sans échappement (test/lang.js 6d.7) ;
                     [] pour un autre champ, que l'écran échappe */
const { words } = require('./dutch');
const { runs } = require('./langs');

/* Les champs de prose qui citent (NL.gloss.quoted les marque), et ceux qui sont du HTML (NL.gloss.prose).
   g est la tête d'une ligne de la table des sons. */
const QUOTED_FIELDS = ['note', 'blurb', 'rule', 'ask', 'what', 'outro', 'hint', 'trap'];
const HTML_FIELDS = ['explain', 'say', 'title', 'h', 'g'];
/* Les mots cités hors du néerlandais du cours qui sont pourtant du néerlandais, avec la raison. Une note
   de mot ou de phrase n'en a pas besoin pour un mot que l'orthographe connaît et qu'elle cite dans ses
   deux langues (6d.3). Cette table, SHARED_OK et SOUND_OK (test/lang.js) n'ont pas de prototype : un mot lu
   « constructor » ou « toString » n'y est pas listé. */
const QUOTE_OK = Object.assign(Object.create(null), {
  pardon: 'le nord pour excuseer, dans la note d’un choix de la conversation du train',
  jam: 'le nord pour de confituur, dans sa note d’emprunt',
  vrachtwagen: 'l’écrit pour de camion, dans sa note d’emprunt',
  bijgevoegd: 'le nord pour « in bijlage », dans une note de la fiche des mails',
  werke: 'werken tel qu’il se dit, n final tombé, dans la table des sons',
  lope: 'lopen tel qu’il se dit, n final tombé, dans la table des sons',
  uiteindelijk: 'ce que veut dire eventually, dans le piège de eventueel',
  slank: 'ce que veut dire slim (svelte), dans le piège de slim',
  zeldzaam: 'ce que veut dire rare, dans le piège de raar',
  merk: '« het merk », ce que veut dire brand (une marque), dans le piège de de brand',
  plattegrond: '« de plattegrond », ce que veut dire map (un plan), dans le piège de de map'
});
/* Les mots que le français et l'anglais écrivent tous deux et que le cours a aussi en néerlandais :
   l'anglais du bureau, une marque, un article. 6d.4 ne les prend pas pour du néerlandais laissé nu. */
const SHARED_OK = Object.assign(Object.create(null), {
  a: 'le verbe avoir et l’article anglais ; le cours ne l’a que comme lettre, « de a »',
  ticket: 'l’anglais du bureau, le même en français et en anglais, dans la présentation de l’unité du travail',
  build: 'l’anglais du bureau, le même en français et en anglais, dans deux présentations',
  code: 'l’anglais du bureau, le même en français et en anglais, dans la présentation d’une fiche',
  bancontact: 'la carte de paiement belge, une marque, dans la présentation de l’unité des courses',
  stand: '« stand-up », la réunion du matin, en français comme en anglais',
  up: '« stand-up », la réunion du matin, en français comme en anglais',
  contact: '« premier contact », “first contact”, dans une note de la fiche des mails',
  direct: '« Être direct », “Being direct”, dans une note de la conversation sur les délais',
  t: 'la lettre t, nommée de même en français et en anglais, dans les notes de « Dat was plezant. », « Wat betekent dat? », « acht » et « komen »',
  s: 'la lettre s, nommée de même en français et en anglais, dans la note de « Niks speciaals, en bij u? »',
  o: 'la lettre o, nommée de même en français et en anglais, dans la note de « goedkoop »',
  film: 'un film se regarde, en français comme en anglais, dans la note de « kijken »'
});

/* Les mots des noms que {naam}, {stad} et {bedrijf} prennent par défaut, que l'en-tête montre. */
const names = NL => new Set([].concat(...Object.keys(NL.content.DEFAULTS).map(k => words(String(NL.content.DEFAULTS[k])))));

const unescape = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const quotedSegments = (NL, text) => Array.from(NL.gloss.quoted(text).matchAll(/<span lang="nl-BE">([^<]*)<\/span>/g), m => unescape(m[1]));

function foreignQuotes(NL, text, dutch, excuse) {
  const opened = text.split(/[«“]/).length - 1, closed = text.split(/[»”]/).length - 1;
  const segs = quotedSegments(NL, text), foreign = [], excused = new Set();
  segs.forEach(q => {
    if (excuse && excuse(q)) return;
    const affixes = q.split(/[\s,\/…]+|\.{2,}/).filter(t => /^-\p{L}+$|^\p{L}+-$/u.test(t)).map(t => t.replace('-', '').toLowerCase());
    const miss = words(q).filter(w => !dutch.has(w) && affixes.indexOf(w) < 0 && !/^\d+$/.test(w));
    miss.forEach(w => { if (QUOTE_OK[w]) excused.add(w); });
    if (miss.some(w => !QUOTE_OK[w])) foreign.push(q);
  });
  return { foreign, excused: Array.from(excused), paired: segs.length === opened && opened === closed };
}

function bareDutch(NL, dutch, named, field, fr, en) {
  const bare = (s, l) => new Set([].concat(...runs(HTML_FIELDS.indexOf(field) >= 0 ? NL.gloss.prose(s) : NL.gloss.quoted(s), l)
    .filter(r => r.lang !== 'nl-BE').map(r => words(r.text))));
  const other = bare(en, 'en');
  const both = Array.from(bare(fr, 'fr')).filter(w => other.has(w) && dutch.has(w) && !named.has(w));
  return { bare: both.filter(w => !SHARED_OK[w]), shared: both.filter(w => SHARED_OK[w]) };
}

/* Les {jetons} d'un texte écrit dans un champ que l'écran montre en HTML : ce que la page y substitue, elle ne
   l'échappe pas. */
const htmlTokens = (field, s) => HTML_FIELDS.indexOf(field) >= 0 ? (String(s).match(/\{[^}]*\}/g) || []) : [];

module.exports = { QUOTE_OK, SHARED_OK, QUOTED_FIELDS, HTML_FIELDS, names, quotedSegments, foreignQuotes, bareDutch, htmlTokens };
