/* L'ordre du cours, écrit une fois : test/content.js tient les phrases d'exemple à ce que le
   cours a déjà enseigné, et les outils de contenu (tools/content/) classent et vérifient les
   phrases d'une source de la même façon.

     const sequence = require('./lib/sequence');
     sequence.GRAMMAR                 les mots-outils (un Set) : on n'écrit pas une phrase sans
                                      eux, ils ne comptent jamais
     sequence.firstUnits(units)       Map forme → index de la première unité dont un mot ou une
                                      phrase écrit cette forme (spelling.tokens)
     sequence.forms(item, NL)         les formes d'un mot qu'une phrase peut employer (un Set) :
                                      ses formes, et pour un mot d'une forme, un pluriel (nom),
                                      un radical et sa forme en -t (verbe), une forme en -e (autre)
     sequence.ahead(text, ui, first)  les formes du texte qu'une unité après ui enseigne
     sequence.unmet(text, ui, first, own)   les formes du texte qu'aucune unité jusqu'à ui
                                      n'enseigne et que le Set own ne contient pas

   ui est l'index d'une unité dans l'ordre du cours, first ce que firstUnits() rend. Une forme
   n'est comptée qu'une fois par texte. Ce que ces formes NE voient PAS : une forme fléchie
   qu'elles ne savent pas former (un participe, un pluriel irrégulier) compte comme jamais
   enseignée ; un homographe compte comme le mot du cours. Une forme fléchie d'un AUTRE mot du
   cours (« oude » quand le cours a enseigné « oud ») compte aussi comme jamais enseignée :
   forms() devine par la terminaison, sans lexique, et prendrait « Engelsen » pour le pluriel de
   « het Engels » ; il ne sert qu'aux formes du mot lui-même. */
const { tokens } = require('./spelling');

const GRAMMAR = new Set(('ik ge gij je jij u hij ze zij we wij het de een is ben bent zijn was heb hebt ' +
  'heeft had kan kunt kun wil wilt moet mag ga gaat gaan doe doet niet nie geen en of maar want dat dit ' +
  'die deze er hier daar ook nog al wel te in op van met voor aan bij naar uit om over door tot me mijn ' +
  'uw zo heel veel wat wie waar hoe nu dan als zich eens even graag ja nee').split(' '));

function firstUnits(units) {
  const first = new Map();
  units.forEach((u, ui) => (u.words || []).concat(u.phrases || []).forEach(it =>
    tokens(it.nl).forEach(t => { if (!first.has(t)) first.set(t, ui); })));
  return first;
}

function forms(item, NL) {
  const b = NL.util.bare(item.nl).toLowerCase(), own = tokens(b), f = new Set(own);
  if (own.length !== 1) return f;
  const cls = NL.gloss.wordClass(item, 'en');
  if (cls === 'noun') ['en', 's', 'n', '\'s', '’s'].forEach(e => f.add(b + e));
  else if (cls === 'verb') {
    const st = b.slice(0, -2), stems = [st];
    if (/([^aeiou])\1$/.test(st)) stems.push(st.slice(0, -1));                  // zitten → zit
    const m = st.match(/^(.*[^aeiou])([aeiou])([^aeiou])$/);                     // maken → maak
    if (m) stems.push(m[1] + m[2] + m[2] + m[3]);
    stems.forEach(s => {
      const end = s.replace(/v$/, 'f').replace(/z$/, 's');                       // leven → leef, lezen → lees
      [s, end, end + 't'].forEach(x => f.add(x));
    });
  } else f.add(b + 'e');
  return f;
}

const uniq = text => [...new Set(tokens(text))];
const ahead = (text, ui, first) => uniq(text).filter(t => !GRAMMAR.has(t) && first.has(t) && first.get(t) > ui);
const unmet = (text, ui, first, own) => uniq(text).filter(t =>
  !GRAMMAR.has(t) && !(first.has(t) && first.get(t) <= ui) && !own.has(t));

module.exports = { GRAMMAR, firstUnits, forms, ahead, unmet };
