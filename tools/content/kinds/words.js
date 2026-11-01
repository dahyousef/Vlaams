/* Le genre words : les mots des unités que le cours n'a pas encore (UNITS, les 22 unités de la
   phase 4). La tâche « FAN words » du plan en écrit les lignes ; ce module les coupe, les vérifie et
   les fond (tools/content/lib/kit.js). Sa source n'est pas un élément du cours mais une unité à
   venir (sourceOf) : une ligne est une place, « <unité>:s<k> », que le rédacteur remplit d'un mot.
   Une ligne écrite porte six champs :
     nl        le mot tel que le cours l'écrit : un nom avec son article (« de tafel »), un verbe à
               l'infinitif, le reste nu
     fr        son sens en français de Belgique ; en, son sens en anglais courant
     art       'de' ou 'het' pour un nom, null pour tout autre mot
     pos       noun, name (un nom sans article : België, Pasen, januari), verb, adj, adv, pron, prep,
               conj, num ou other
     evidence  wiktionary:<lemme>  un lemme de .cache/kaikki/senses.tsv dont la nature s'accorde et que
                                   nl emploie (D12)
               course              une forme que l'extrait n'a pas et qu'un collègue flamand dit : la
                                   ligne va au mainteneur
   Merge n'écrit aucune table : son write récrit src/content/lexicon.a1c.js entier, depuis UNITS et
   les lignes prises dans l'ordre des places (les places écartées ne laissent pas de trou), et ajoute
   à test/data/ids.tsv une ligne par mot. L'empreinte ne couvre rien que Merge écrive : relancée, elle
   récrit le même fichier. Les lignes imprimées sont en anglais, comme celles du kit. */
const fs = require('fs'), path = require('path');
const kaikki = require('../kaikki');
const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
const { oneLine, sig } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));

/* Les 22 unités (phase 4, D10, approuvées les 28 et 31 octobre 2026), dans l'ordre du cours. target
   est le nombre de places, pas un compte ; samples, les mots du mainteneur, qui prennent les
   premières places. */
const UNITS = [
  { id: 'vragen', n: 13, nlName: 'Vragen', name: { fr: 'Questions et petits mots', en: 'Questions and small words' }, track: 'beide', icon: '❓', target: 30,
    blurb: { fr: 'Les mots qui posent une question, et ceux qui lient deux idées : parce que, mais, quand.', en: 'The words that ask a question, and those that join two ideas: because, but, when.' },
    samples: ['wie', 'waarom', 'wanneer', 'welke', 'maar', 'want', 'omdat', 'als', 'toen', 'nu'] },
  { id: 'kunnen', n: 14, nlName: 'Kunnen, moeten, willen', name: { fr: 'Pouvoir, devoir, vouloir', en: 'Can, must, want' }, track: 'beide', icon: '🗝️', target: 25,
    blurb: { fr: 'Pouvoir, devoir, vouloir : les verbes qui changent le sens de tous les autres.', en: 'Can, must, want: the verbs that change the meaning of every other verb.' },
    samples: ['kunnen', 'moeten', 'willen', 'mogen', 'zullen', 'laten', 'weten', 'kennen', 'denken', 'hopen', 'geloven'] },
  { id: 'doen', n: 15, nlName: 'Doen en maken', name: { fr: 'Les verbes de tous les jours', en: 'Everyday verbs' }, track: 'beide', icon: '🔧', target: 30,
    blurb: { fr: 'Faire, prendre, donner, attendre : les verbes de chaque journée, au présent.', en: 'Doing, taking, giving, waiting: the verbs of every single day, in the present tense.' },
    samples: ['doen', 'maken', 'nemen', 'geven', 'krijgen', 'brengen', 'halen', 'zitten', 'staan', 'liggen', 'lopen', 'wachten', 'beginnen', 'stoppen', 'vragen', 'antwoorden', 'schrijven', 'gebruiken'] },
  { id: 'mensen', n: 16, nlName: 'Mensen', name: { fr: 'Les gens et les pronoms', en: 'People and pronouns' }, track: 'leven', icon: '👥', target: 30,
    blurb: { fr: 'Lui, elle, quelqu’un, personne, et la famille au-delà des parents.', en: 'Him, her, someone, no one, and the family beyond your parents.' },
    samples: ['hem', 'haar', 'zich', 'iemand', 'iets', 'niets', 'elkaar', 'zelf', 'de vader', 'de moeder', 'de jongen', 'het meisje', 'de oom', 'de tante'] },
  { id: 'hoeveel', n: 17, nlName: 'Hoeveel en hoe vaak', name: { fr: 'Combien, à quelle fréquence', en: 'How much, how often' }, track: 'beide', icon: '📊', target: 30,
    blurb: { fr: 'Plus, souvent, presque, trop : doser ce que tu dis.', en: 'More, often, almost, too much: how to measure what you say.' },
    samples: ['meer', 'erg', 'echt', 'vaak', 'ooit', 'steeds', 'bijna', 'toch', 'dus', 'weinig', 'alle'] },
  { id: 'waar', n: 18, nlName: 'Waar en waarmee', name: { fr: 'Où et avec quoi', en: 'Where and with what' }, track: 'beide', icon: '📍', target: 20,
    blurb: { fr: 'Les petits mots de lieu et de moyen : dans, sur, avec, sans, entre.', en: 'The small words of place and means: in, on, with, without, between.' },
    samples: ['in', 'op', 'met', 'van', 'uit', 'over', 'door', 'zonder', 'onder', 'achter', 'tussen', 'naast', 'voor', 'na'] },
  { id: 'landen', n: 19, nlName: 'Landen en talen', name: { fr: 'Pays et langues', en: 'Countries and languages' }, track: 'leven', icon: '🌍', target: 25,
    blurb: { fr: 'Les pays voisins, les langues qu’on y parle, et les mots pour parler des mots.', en: 'The neighbouring countries, the languages spoken there, and the words for talking about words.' },
    samples: ['het land', 'de taal', 'België', 'Nederland', 'Frankrijk', 'Duitsland', 'het woord', 'de zin', 'de vraag', 'het antwoord', 'het woordenboek'] },
  { id: 'eten', n: 20, nlName: 'Eten en drinken', name: { fr: 'Manger et boire', en: 'Food and drink' }, track: 'leven', icon: '🥗', target: 35,
    blurb: { fr: 'Ce qu’il y a dans ton frigo et sur ta table, du petit-déjeuner au souper.', en: 'What is in your fridge and on your table, from breakfast to supper.' },
    samples: ['de groenten', 'het fruit', 'het vlees', 'de vis', 'de melk', 'de eieren', 'de appel', 'de thee', 'de wijn', 'het bier', 'de suiker', 'het zout', 'de soep', 'de rijst'] },
  { id: 'cafe', n: 21, nlName: 'Op café', name: { fr: 'Au café et au restaurant', en: 'At the café and restaurant' }, track: 'leven', icon: '☕', target: 20,
    blurb: { fr: 'Commander, demander l’addition et laisser un pourboire, en terrasse comme à table.', en: 'Ordering, asking for the bill and leaving a tip, on the terrace and at the table.' },
    samples: ['de ober', 'bestellen', 'de rekening', 'het dessert', 'vegetarisch', 'het menu', 'de fooi'] },
  { id: 'kleren', n: 22, nlName: 'Kleren en kleuren', name: { fr: 'Vêtements et couleurs', en: 'Clothes and colours' }, track: 'leven', icon: '👕', target: 30,
    blurb: { fr: 'Ce que tu portes, de quelle couleur, et ce que tu cherches dans le magasin.', en: 'What you wear, in which colour, and what you are looking for in the shop.' },
    samples: ['de schoenen', 'de broek', 'de jas', 'de trui', 'het hemd', 'rood', 'blauw', 'groen', 'zwart', 'geel', 'dragen'] },
  { id: 'wonen', n: 23, nlName: 'Het huis inrichten', name: { fr: 'Aménager la maison', en: 'Furnishing the house' }, track: 'leven', icon: '🛋️', target: 30,
    blurb: { fr: 'La table, le lit, l’armoire, le fauteuil, et le ménage du samedi.', en: 'The table, the bed, the wardrobe, the sofa, and the Saturday cleaning.' },
    samples: ['de tafel', 'de stoel', 'het bed', 'de kast', 'het raam', 'de lamp', 'de zetel', 'de frigo', 'poetsen', 'opruimen'] },
  { id: 'kalender', n: 24, nlName: 'De kalender', name: { fr: 'Le calendrier', en: 'The calendar' }, track: 'beide', icon: '📅', target: 35,
    blurb: { fr: 'Les mois, les saisons, les fêtes, et la date de ton anniversaire.', en: 'The months, the seasons, the holidays, and the date of your birthday.' },
    samples: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december', 'de zomer', 'de winter', 'de lente', 'de herfst', 'de verjaardag', 'Kerstmis', 'Nieuwjaar', 'Pasen', 'eerste', 'tweede'] },
  { id: 'stad', n: 25, nlName: 'De stad en haar diensten', name: { fr: 'La ville et ses services', en: 'The town and its services' }, track: 'leven', icon: '🏛️', target: 30,
    blurb: { fr: 'La poste, la banque, la bibliothèque, la police : où aller en ville, et comment y arriver.', en: 'The post office, the bank, the library, the police: where to go in town, and how to get there.' },
    samples: ['de post', 'de bank', 'de bibliotheek', 'de politie', 'het plein', 'de markt', 'het museum', 'oversteken', 'de hoek'] },
  { id: 'vrijetijd', n: 26, nlName: 'Vrije tijd', name: { fr: 'Les loisirs', en: 'Free time' }, track: 'leven', icon: '🎵', target: 30,
    blurb: { fr: 'Ce que tu fais le soir et le week-end : lire, nager, danser, écouter de la musique.', en: 'What you do in the evening and at the weekend: reading, swimming, dancing, listening to music.' },
    samples: ['de muziek', 'de film', 'het boek', 'lezen', 'zwemmen', 'spelen', 'dansen', 'zingen', 'de sport', 'de hobby', 'het concert'] },
  { id: 'gevoel', n: 27, nlName: 'Gevoelens en meningen', name: { fr: 'Sentiments et avis', en: 'Feelings and opinions' }, track: 'beide', icon: '💬', target: 30,
    blurb: { fr: 'Content, fâché, inquiet, fier, et dire ce que tu trouves beau, difficile ou important.', en: 'Happy, angry, worried, proud, and saying what you find beautiful, difficult or important.' },
    samples: ['blij', 'boos', 'bang', 'trots', 'gelukkig', 'triestig', 'leuk', 'mooi', 'interessant', 'moeilijk', 'gemakkelijk', 'belangrijk'] },
  { id: 'beschrijven', n: 28, nlName: 'Beschrijven', name: { fr: 'Décrire', en: 'Describing things' }, track: 'beide', icon: '🔍', target: 30,
    blurb: { fr: 'Grand, petit, lourd, vide, propre : décrire une chose en un mot.', en: 'Big, small, heavy, empty, clean: describing a thing in one word.' },
    samples: ['groot', 'klein', 'kort', 'snel', 'langzaam', 'zwaar', 'licht', 'vol', 'leeg', 'sterk', 'proper'] },
  { id: 'school', n: 29, nlName: 'School en kinderen', name: { fr: 'L’école et les enfants', en: 'School and children' }, track: 'leven', icon: '🎒', target: 25,
    blurb: { fr: 'L’école de tes enfants : la classe, l’instit, les devoirs, la garderie.', en: 'Your children’s school: the class, the teacher, the homework, the after-school care.' },
    samples: ['de juf', 'de meester', 'de klas', 'de les', 'het huiswerk', 'de opvang', 'de crèche', 'studeren'] },
  { id: 'afspraak', n: 30, nlName: 'Afspraken en de telefoon', name: { fr: 'Rendez-vous et téléphone', en: 'Appointments and the phone' }, track: 'beide', icon: '📱', target: 25,
    blurb: { fr: 'Appeler, envoyer un message, annuler ou déplacer un rendez-vous.', en: 'Calling, sending a message, cancelling or moving an appointment.' },
    samples: ['bellen', 'de gsm', 'het bericht', 'afzeggen', 'verplaatsen', 'de agenda', 'beschikbaar'] },
  { id: 'team', n: 31, nlName: 'Op het werk: het team', name: { fr: 'Au travail : l’équipe', en: 'At work: the team' }, track: 'werk', icon: '🤝', target: 25,
    blurb: { fr: 'Tes collègues chez {bedrijf} : la pause, le contrat, la formation, et ce qu’on te dit de ton travail.', en: 'Your colleagues at {bedrijf}: the break, the contract, the training, and what people tell you about your work.' },
    samples: ['het team', 'de feedback', 'de pauze', 'het contract', 'het loon', 'de opleiding'] },
  { id: 'reis', n: 32, nlName: 'Op reis', name: { fr: 'En voyage', en: 'Travel' }, track: 'leven', icon: '✈️', target: 30,
    blurb: { fr: 'La valise, l’aéroport, l’hôtel, et la mer du Nord à une heure de train.', en: 'The suitcase, the airport, the hotel, and the North Sea an hour away by train.' },
    samples: ['de reis', 'het hotel', 'de koffer', 'het vliegtuig', 'de luchthaven', 'het paspoort', 'de zee', 'de kust', 'reserveren'] },
  { id: 'natuur', n: 33, nlName: 'Natuur en dieren', name: { fr: 'La nature et les animaux', en: 'Nature and animals' }, track: 'leven', icon: '🌳', target: 25,
    blurb: { fr: 'Le chien, le chat, les oiseaux, les arbres et la forêt où tu te promènes.', en: 'The dog, the cat, the birds, the trees and the forest where you go walking.' },
    samples: ['de hond', 'de kat', 'het paard', 'de vogel', 'de boom', 'de bloem', 'het bos', 'de rivier'] },
  { id: 'spoed', n: 34, nlName: 'Gezondheid en noodgevallen', name: { fr: 'Santé et urgences', en: 'Health and emergencies' }, track: 'leven', icon: '🚑', target: 15,
    blurb: { fr: 'Les mots qu’on espère ne jamais dire, aux urgences ou au téléphone avec le 112.', en: 'The words you hope never to say, at the emergency room or on the phone with 112.' },
    samples: ['de spoed', 'de ambulance', 'de brandweer', 'het ongeval', 'gebroken', 'de verpleger'] }
];
const OWN = new Set(UNITS.map(u => u.id));
const POS = ['noun', 'name', 'verb', 'adj', 'adv', 'pron', 'prep', 'conj', 'num', 'other'];
const EVIDENCE = /^(wiktionary:\S(.*\S)?|course)$/;
const LEXICON = path.join('src', 'content', 'lexicon.a1c.js');
const IDS = path.join('test', 'data', 'ids.tsv');

/* La source d'une place : son unité, telle que UNITS l'écrit, dont nl est l'id, et fr et en ses noms
   (l'outil de lecture les montre ; l'empreinte ne les lit pas). L'unité n'est pas encore dans le cours
   quand Split coupe ; elle y est après Merge, et l'empreinte ne change pas. */
const unitOf = id => UNITS.find(u => u.id === id.split(':')[0]);
const sourceOf = (C, id) => {
  const u = unitOf(id);
  return u ? Object.assign({}, u, { nl: u.id, fr: u.name.fr, en: u.name.en }) : undefined;
};

/* Split : un lot par unité de UNITS que le cours n'a pas encore, une ligne par place. Après Merge,
   les unités fondues sont dans le cours : un second Split ne coupe rien pour elles. */
function split(C) {
  const have = new Set(C.units.map(u => u.id));
  return UNITS.filter(u => !have.has(u.id)).map(u => ({
    batch: u.id,
    rows: Array.from({ length: u.target }, (x, k) => ({
      id: u.id + ':s' + String(k).padStart(2, '0'), unit: u.id, n: u.n, nlName: u.nlName, name: u.name, target: u.target, slot: k, sample: u.samples[k] || null
    }))
  }));
}

/* Le cours, son orthographe, la table de / het et l'extrait du Wiktionnaire, lus une fois par
   lecture d'un lot. Les éléments des unités de UNITS ne comptent pas comme « déjà dans le cours » :
   après Merge, ce sont les lignes elles-mêmes. */
const memo = new WeakMap();
function tools(ctx) {
  if (!memo.has(ctx)) {
    const C = ctx.course(), NL = C.NL, U = NL.util;
    const dehet = new Map();
    fs.readFileSync(path.join(ctx.repo, 'test', 'data', 'dehet.tsv'), 'utf8').split('\n').forEach(l => {
      if (!l || l[0] === '#') return;
      const [w, g] = l.split('\t');
      if (w && g) dehet.set(w, g.trim());
    });
    const others = C.sources.filter(s => !OWN.has(s.unit));
    const keyOf = s => (s.kind === 'word' ? U.norm(U.bare(s.nl)) : U.norm(s.nl));
    let senses = null;
    memo.set(ctx, {
      C, NL, dehet,
      S: spelling.open(ctx.repo, NL),
      /* L'élément du cours, hors des unités de UNITS, dont le néerlandais sans article est celui-là. */
      itemOf: nl => others.find(s => keyOf(s) === U.norm(U.bare(nl))) || null,
      senses: () => {
        if (!senses) {
          try { senses = { map: kaikki.senses(ctx.repo) }; } catch (e) { senses = { error: e.message }; }
        }
        return senses;
      }
    });
  }
  return memo.get(ctx);
}

const list = ws => ws.map(w => '« ' + w + ' »').join(', ');
/* Un nom et un nom propre se valent dans l'extrait (België est un « name », januari un « noun »). */
const agrees = (want, got) => want === 'other' || want === got || ((want === 'noun' || want === 'name') && (got === 'noun' || got === 'name'));

function check(row, input, ctx) {
  const why = [];
  ['nl', 'fr', 'en'].forEach(f => { if (!oneLine(row[f])) why.push(f + ' is a text on one line with no space at either end'); });
  if (row.art !== null && row.art !== 'de' && row.art !== 'het') why.push('art is de, het or null');
  if (POS.indexOf(row.pos) < 0) why.push('pos is one of ' + POS.join(', '));
  if (typeof row.evidence !== 'string' || !EVIDENCE.test(row.evidence)) why.push('evidence is wiktionary:<lemma> or course');
  if (why.length) return why;
  const T = tools(ctx), U = T.NL.util, G = T.NL.gloss;
  const bare = U.bare(row.nl), key = U.norm(bare);

  /* Le français et le néerlandais du cours écrivent l'apostrophe typographique, et aucun guillemet droit. */
  ['nl', 'fr'].forEach(f => { if (/['"]/.test(row[f])) why.push(f + ' writes the typographic apostrophe « ’ » and no straight quote'); });

  const bad = U.uniq(spelling.tokens(row.nl).filter(t => !T.S.known(t)));
  if (bad.length) why.push(list(bad) + ' is not Dutch that OpenTaal or flemish.tsv knows: pick another word, or say in unsure why the course needs this one');

  /* Un nom porte son article, que test/data/dehet.tsv confirme (both : le cours tranche) ; tout
     autre mot n'en porte pas. Un nom que la table ignore ferait échouer test/dehet.js après Merge. */
  const m = /^(de|het|een)\s+(\S.*)$/i.exec(row.nl);
  if (row.pos === 'noun') {
    if (row.art === null) why.push('a noun carries its article: art is de or het');
    else if (!m || m[1].toLowerCase() !== row.art) why.push('nl starts with its article « ' + row.art + ' »');
    else if (bare.indexOf(' ') < 0) {
      const g = T.dehet.get(bare.toLowerCase());
      if (g === undefined) why.push('« ' + bare + ' » is not in test/data/dehet.tsv, so test/dehet.js would refuse it after Merge: pick another word, or say in unsure why the course needs this one');
      else if (g !== 'both' && g !== row.art) why.push('« ' + row.art + ' ' + bare + ' »: test/data/dehet.tsv says « ' + g + ' »');
    }
  } else {
    if (row.art !== null) why.push('art is null for a word that is not a noun');
    if (m) why.push('a word that is not a noun carries no article: nl is « ' + m[2] + ' »');
  }

  /* Un mot nouveau ne redit pas le néerlandais d'un élément du cours (contrainte du plan), et une
     place qui a son mot-témoin l'écrit, sauf si le cours a déjà ce mot (le rédacteur le dit dans unsure). */
  const had = T.itemOf(row.nl);
  if (had) why.push('« ' + row.nl + ' » is already an item of the course, ' + had.id + ' « ' + had.nl + ' »: a new word never repeats an existing item\'s Dutch');
  if (input.sample && !T.itemOf(input.sample) && U.norm(U.bare(input.sample)) !== key) why.push('this slot writes the sample « ' + input.sample + ' », not « ' + row.nl + ' »');

  /* La preuve : un lemme de l'extrait, de la même nature, que nl emploie ; ou course. */
  if (row.evidence !== 'course') {
    const lemma = row.evidence.slice('wiktionary:'.length), E = T.senses();
    if (E.error) why.push(E.error);
    else if (!E.map.has(lemma)) why.push('« ' + lemma + ' » is not an entry of the pinned Wiktionary extract (.cache/kaikki/senses.tsv): cite the lemma as the extract spells it, or evidence course');
    else {
      const got = E.map.get(lemma).map(e => e.pos);
      if (!got.some(p => agrees(row.pos, p))) why.push('« ' + lemma + ' » is ' + list(U.uniq(got)) + ' in the extract, not ' + row.pos);
      if (!spelling.tokens(bare).some(t => t.indexOf(lemma.toLowerCase()) === 0)) why.push('nl does not use the lemma « ' + lemma + ' »');
    }
  }

  /* Les gardes de test/content.js sur l'anglais, dites ici plutôt qu'après Merge. */
  const item = { kind: 'word', nl: row.nl, fr: row.fr, en: row.en, art: row.art };
  if ((row.pos === 'verb' || G.wordClass(item, 'fr') === 'verb') && !/^to\s+\S/i.test(row.en)) why.push('a verb\'s en starts with « to »');
  if (row.art && /^(the|an|a)\s/i.test(row.en)) why.push('a noun\'s en takes no article');
  if (sig(row.fr) !== sig(row.en)) why.push('fr and en hold different digits or {…} tokens');
  T.C.sources.filter(s => s.id !== row.id && G.sameMeaning(item, s) && !G.sameSense(item, s)).forEach(s => {
    why.push('en shares a sense with ' + s.id + ' « ' + s.nl + ' » (' + s.en + '), which shares no French sense and no Dutch: give one of them another English, or the French they share');
  });
  return why;
}

/* Le texte du lexique : l'en-tête, puis chaque unité de UNITS qui a des mots pris, dans l'ordre, ses
   mots dans l'ordre des places. Les chaînes s'écrivent entre apostrophes droites, échappées ; l'icône
   en séquence \u{…}, comme les lexiques écrits à la main. */
const lit = s => '\'' + String(s).replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\'';
const pair = g => '{ fr: ' + lit(g.fr) + ', en: ' + lit(g.en) + ' }';
const icon = s => '\'' + Array.from(s).map(c => '\\u{' + c.codePointAt(0).toString(16).toUpperCase() + '}').join('') + '\'';
const HEADER = [
  '/* Lexique A1, unités 13 à 34. Même forme que lexicon.a1.js.',
  '   Écrit par la fusion du genre words (tools/content/kinds/words.js) depuis ses lignes prises : une',
  '   correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités n’ont que des mots ;',
  '   leurs phrases et leur grammaire viennent avec les plans 4b et 4c. */',
  'NL.content = NL.content || {};',
  'NL.content.units = NL.content.units || [];',
  '(function () {',
  '  \'use strict\';',
  '  const W = (nl, g, art) => ({ kind: \'word\', nl, ...NL.gloss.pair(g), art });',
  '  const U = o => NL.content.units.push(o);'
];
function lexicon(units) {
  const lines = HEADER.slice();
  units.forEach(({ u, rows }) => {
    lines.push('', '  U({',
      '    id: ' + lit(u.id) + ', n: ' + u.n + ', name: ' + pair(u.name) + ', nlName: ' + lit(u.nlName) + ', level: \'A1\', track: ' + lit(u.track) + ', icon: ' + icon(u.icon) + ',',
      '    blurb: ' + pair(u.blurb) + ',',
      '    grammar: [],',
      '    words: [');
    rows.forEach((r, k) => lines.push('      W(' + lit(r.nl) + ', ' + pair(r) + (r.art ? ', ' + lit(r.art) : '') + ')' + (k < rows.length - 1 ? ',' : '')));
    lines.push('    ],', '    phrases: []', '  });');
  });
  lines.push('})();');
  return lines;
}

/* Merge : refuse deux lignes prises qui écrivent le même mot (elle les nomme toutes : chaque lot n'a vu que
   les siennes), une qui redit un élément du cours (le cours a pu bouger depuis Split), et une qu'ids.tsv
   épingle à un autre mot, le tout avant d'écrire ;
   puis récrit le lexique entier, dans l'ordre des places, et ajoute à ids.tsv une ligne par mot
   nouveau. Le lexique peut déjà tenir ces unités (Merge relancée) : il est récrit à l'identique, et
   ids.tsv n'ajoute rien, ses lignes disant les mêmes mots. */
function write(taken, ctx) {
  const T = tools(ctx), U = T.NL.util;
  const seen = new Map(), by = new Map(), twice = [];
  taken.forEach(x => {
    const k = U.norm(U.bare(x.row.nl)), had = T.itemOf(x.row.nl);
    if (had) throw new Error(x.id + ' « ' + x.row.nl + ' » is already an item of the course, ' + had.id + ': the course moved since Split');
    if (seen.has(k)) twice.push(x.id + ' and ' + seen.get(k) + ' both write « ' + x.row.nl + ' »');
    else seen.set(k, x.id);
    if (!by.has(x.input.unit)) by.set(x.input.unit, []);
    by.get(x.input.unit).push(x);
  });
  if (twice.length) throw new Error(twice.join('; ') + ': one word, one slot');
  T.C.units.filter(u => OWN.has(u.id) && !by.has(u.id)).forEach(u => {
    throw new Error('lexicon.a1c.js holds the unit ' + u.id + ', and no taken row writes it: Merge rewrites the file whole');
  });
  const units = UNITS.filter(u => by.has(u.id)).map(u => ({ u, rows: by.get(u.id).sort((a, b) => a.input.slot - b.input.slot).map(x => x.row) }));
  const ids = path.join(ctx.repo, IDS), text = fs.readFileSync(ids, 'utf8'), ieol = /\r\n/.test(text) ? '\r\n' : '\n';
  const pinned = new Map(text.split(/\r?\n/).filter(Boolean).map(l => l.split('\t')));
  const added = [];
  units.forEach(({ u, rows }) => rows.forEach((r, i) => {
    const id = u.id + ':w' + i;
    if (!pinned.has(id)) { added.push(id + '\t' + r.nl); return; }
    if (pinned.get(id) !== r.nl) throw new Error('test/data/ids.tsv pins ' + id + ' to « ' + pinned.get(id) + ' », and Merge writes « ' + r.nl + ' » there');
  }));

  const lex = path.join(ctx.repo, LEXICON), old = fs.readFileSync(lex, 'utf8'), eol = /\r\n/.test(old) ? '\r\n' : '\n';
  fs.writeFileSync(lex, lexicon(units).map(l => l + eol).join(''));
  if (added.length) fs.writeFileSync(ids, text + (text && !/\r?\n$/.test(text) ? ieol : '') + added.map(l => l + ieol).join(''));
  const n = units.reduce((s, x) => s + x.rows.length, 0);
  return ['ok lexicon.a1c.js ' + n + ' words in ' + units.length + ' units', 'ok ids.tsv ' + added.length + ' added'];
}

module.exports = {
  stamp: [u => u.n, u => u.name.en, u => u.target],
  fields: ['nl', 'fr', 'en', 'art', 'pos', 'evidence'],
  tables: [],
  sourceOf,
  split,
  check,
  forMaintainer: row => (row.evidence === 'course' ? 'evidence course' : ''),
  merge: () => ({}),
  write,
  UNITS,
  lexicon
};
