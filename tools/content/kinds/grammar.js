/* Le genre grammar : les règles de grammaire des unités 13 à 34 que le cours n'a pas encore (RULES,
   les 13 règles du plan 4b). La tâche « FAN grammar » du plan en écrit les lignes ; ce module les
   coupe, les vérifie et les fond (tools/content/lib/kit.js). Sa source n'est pas un élément du cours
   mais une règle à venir (sourceOf) : une ligne est un pattern entier, « g-… », moins ce que
   l'entrée fixe (son id, son unité, son niveau). Une ligne écrite porte sept champs :
     title, rule  { fr, en } : le titre et la règle en une phrase (rule : 70 signes au plus)
     nl, fr, en   l'exemple de la règle, en néerlandais puis en français et en anglais
     explain      { fr, en } : l'explication, en HTML de quatre balises (<b>, <i>, <i class="nl">,
                  <span class="ex">), 876 signes au plus par langue ; le néerlandais y est dans
                  <i class="nl"> ou <span class="ex">
     drills       5 phrases { nl, fr, en, gap } : gap est une tuile de nl, une seule fois
   Merge n'écrit aucune table : son write récrit src/content/grammar.a1c.js entier, depuis RULES et
   les lignes prises dans l'ordre de RULES : les patterns, puis une boucle qui range chaque id dans la
   liste grammar de son unité au chargement (les unités de lexicon.a1c.js gardent grammar: [] dans
   leur fichier). L'empreinte ne couvre rien que Merge écrive : relancée, elle récrit le même
   fichier. Les lignes imprimées sont en anglais, comme celles du kit. */
const fs = require('fs'), path = require('path');
const sequence = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'sequence'));
const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
const { literal: lit } = require('../lib/table');
const { oneLine, sig, untoken, strayQuotes } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));
const { dutchWords, courseWords } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));
const { joined } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'langs'));
const { names, foreignQuotes, bareDutch, htmlTokens } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'quoted'));
const { tokens } = spelling;

/* Les 13 règles, dans l'ordre du plan : à l'intérieur d'une unité, la liste grammar se lit dans cet
   ordre. Les ids sont fixés : une fois livrés, ils sont dans les enregistrements des apprenants.
   n est le numéro de l'unité (Split le confronte au cours) ; teach est la consigne du rédacteur,
   en anglais : ce que la règle enseigne, et ce à quoi elle s'oppose. */
const RULES = [
  { id: 'g-niet-geen', unit: 'vragen', n: 13,
    teach: 'Negation with niet and geen. geen replaces een + noun and stands before a noun with no article (Ik heb geen tijd, Ik heb geen kinderen); niet negates everything else: a verb, an adjective, a place, a noun with de or het (Ik ken de man niet, Het is niet groot). niet sits late in the sentence, before a second verb, a place or an adjective (Ik kan niet komen), not right after the verb. Contrast with French ne ... pas, which does not tell the two apart.' },
  { id: 'g-bijzin', unit: 'vragen', n: 13,
    teach: 'After omdat, als and dat the conjugated verb goes to the very end of its clause (Ik blijf thuis omdat ik ziek ben; Als het regent, blijf ik thuis; Ik denk dat hij werkt). Contrast with want and maar, which keep the normal order (Ik blijf thuis want ik ben ziek), and with the main clause, where the verb is second. When the clause with als comes first, the main clause that follows starts with its verb.' },
  { id: 'g-vraag', unit: 'vragen', n: 13,
    teach: 'Questions. A yes/no question puts the verb first (Werk je vandaag?); a question with a question word puts the verb straight after it (Waar woon je? Wanneer kom je?). When je or jij follows the verb, the verb drops its -t (Werk je? Kom je? not Werkt je?), whereas Flemish ge keeps it (Werkt ge? Hebt ge?). Contrast with the French est-ce que and with inversion.' },
  { id: 'g-twee-werkwoorden', unit: 'kunnen', n: 14,
    teach: 'Two verbs in one clause. The conjugated verb (kunnen, moeten, willen, mogen, zullen, or gaan for the near future) stays second and the other verb goes to the end of the clause as an infinitive (Ik kan morgen komen; Ik moet vandaag werken; Ik ga morgen werken). Contrast with French, where the two verbs stay side by side (je peux venir demain).' },
  { id: 'g-perfect-zijn', unit: 'doen', n: 15,
    teach: 'The perfect with zijn. Verbs of movement and of change of state take zijn + participle (Ik ben naar huis gegaan; Hij is gisteren gekomen; Wij zijn lang gebleven), where most verbs take hebben (the earlier pattern g-perfect-intro). Contrast with the French list of verbs that take être, which is close but not identical.' },
  { id: 'g-was-had', unit: 'doen', n: 15,
    teach: 'Five verbs whose simple past is spoken all the time, not the whole simple past: zijn (was, waren), hebben (had, hadden), kunnen (kon, konden), moeten (moest, moesten) and willen (wou in Flemish speech, wilde in the standard language). They say how things were or what one could, had to or wanted (Ik was ziek; We hadden geen tijd; Hij kon niet komen). Contrast with the perfect, which the course already teaches for actions.' },
  { id: 'g-deelwoord', unit: 'doen', n: 15,
    teach: 'Irregular participles of everyday verbs, beside the regular ge- + stem + -t/-d (gewerkt, gemaakt): doen gedaan, nemen genomen, geven gegeven, krijgen gekregen, brengen gebracht, schrijven geschreven, zitten gezeten, staan gestaan. The participle goes to the end of the clause (Ik heb het boek genomen). Contrast with the French participles, which end in -é, -i or -u.' },
  { id: 'g-hem-haar', unit: 'mensen', n: 16,
    teach: 'Pronouns that are not the subject: hem (him) and haar (her) after a verb or a preposition (Ik zie hem; Ik bel haar; Met hem), and zich for hij, zij and ze doing something to themselves (Hij wast zich; Ze vergist zich), where ik says me and jij says je. Contrast with the French le, la, lui, elle and se.' },
  { id: 'g-er-is', unit: 'waar', n: 18,
    teach: 'Er is and er zijn say that something exists or is somewhere. The verb agrees with the thing, not with er: er is + one thing (Er is een bank in de straat), er zijn + several (Er zijn twee banken). Contrast with the French il y a, which never changes.' },
  { id: 'g-meervoud', unit: 'eten', n: 20,
    teach: 'Plurals. Nouns ending in unstressed -el, -er, -em, -en and the diminutive -je take -s (de appel, de appels; de kamer, de kamers); most others take -en, with a doubled consonant after a short vowel and one vowel less after a long one (de man, de mannen; de maaltijd, de maaltijden; het ei, de eieren); words from other languages in a vowel take an apostrophe + s (de auto, de auto\'s). Contrast with French, which mostly adds a silent -s.' },
  { id: 'g-gebiedend', unit: 'cafe', n: 21,
    teach: 'The imperative. For jij and je it is the bare stem (Kom binnen! Neem een biertje!); with u it is the stem + t and u follows (Neemt u plaats! Komt u binnen!). In a Flemish café the order is softened with maar, eens or even (Zeg het maar; Wacht even). Contrast with the French -ez / -e.' },
  { id: 'g-verkleinwoord', unit: 'wonen', n: 23,
    teach: 'A word in -je is always het. The diminutive is the noun + -je (het huis, het huisje), + -tje after l, n, r, m or a vowel (de lamp, het lampje; de stoel, het stoeltje), + -etje after a short vowel and l, n, r, m or ng (de man, het mannetje), with the plural in -s (de huisjes). Flemish uses it far more than Dutch, even for a koffie or a biertje. Contrast with French, where a diminutive never changes the gender.' },
  { id: 'g-om-op-in', unit: 'kalender', n: 24,
    teach: 'Three prepositions for time. om + a clock time (om acht uur), op + a day or a date (op maandag, op 5 mei), in + a month, a season or a year (in mei, in de zomer, in 2026). Contrast with French, which uses à for the hour, nothing for the day and en or au for the month.' }
];
const UNIT_ORDER = [];
RULES.forEach(r => { if (UNIT_ORDER.indexOf(r.unit) < 0) UNIT_ORDER.push(r.unit); });

const FILE = path.join('src', 'content', 'grammar.a1c.js');
const HAND = path.join('src', 'content', 'grammar.js');
const FIELDS = ['title', 'rule', 'nl', 'fr', 'en', 'explain', 'drills'];
const DRILL_FIELDS = ['nl', 'fr', 'en', 'gap'];
const LANGS = ['fr', 'en'];
const DRILLS = 5;
/* Les tuiles d'une phrase d'exercice : le minimum d'un exercice qui se remet en ordre, et le maximum
   que le cours a (mesuré avec NL.util.tiles : g-scheidbaar, « Ik sta elke dag om zes uur op. »,
   8 tuiles ; une phrase d'exemple d'un mot en a jusqu'à 9). */
const TILES = { min: 3, max: 8 };
/* La longueur de ce que la feuille d'une règle affiche : la plus longue explication du cours
   (g-dehet, 876 signes avec ses balises) et une règle de 70 signes (g-v2). */
const EXPLAIN_MAX = 876, RULE_MAX = 70;
const OK_TOKENS = ['{naam}', '{stad}', '{bedrijf}'];
const TITLE_TAGS = ['<span class="nl">', '</span>'];
const EXPLAIN_TAGS = ['<b>', '</b>', '<i>', '<i class="nl">', '</i>', '<span class="ex">', '</span>'];

/* Le cours lu pour les lignes, une fois par chargement : l'ordre des unités, la première unité de
   chaque forme (les règles déjà fondues comptent à leur unité), l'orthographe, le néerlandais du cours
   et les noms par défaut (pour les citations et le néerlandais nu, test/lib/quoted.js), et les ids que
   src/content/grammar.js écrit à la main. */
const memo = new WeakMap();
function tools(ctx) {
  if (!memo.has(ctx)) {
    const C = ctx.course();
    memo.set(ctx, {
      C, NL: C.NL,
      order: C.units.map(u => u.id),
      first: sequence.firstUnits(C.RAW),
      S: spelling.open(ctx.repo, C.NL),
      dutch: dutchWords(C.NL), named: names(C.NL),
      hand: new Set(Array.from(fs.readFileSync(path.join(ctx.repo, HAND), 'utf8').matchAll(/\bid:\s*'([^']+)'/g), m => m[1]))
    });
  }
  return memo.get(ctx);
}

const unitOf = (C, id) => C.units.find(u => u.id === id);
/* La source d'une ligne : sa règle, dont nl est l'id, et fr et en le nom de son unité (l'outil de
   lecture les montre ; l'empreinte ne les lit pas). Une unité inconnue ne la rend pas introuvable :
   Split et Merge la refusent, en la nommant. */
function sourceOf(C, id) {
  const r = RULES.find(x => x.id === id);
  if (!r) return undefined;
  const u = unitOf(C, r.unit), name = u ? u.name : { fr: r.unit, en: r.unit };
  return Object.assign({}, r, { nl: r.id, fr: name.fr, en: name.en });
}

/* Ce que le cours dit contre une règle : une unité qu'il n'a pas, ou qui n'a pas le numéro de RULES, un
   id que le cours a déjà (un pattern de src/content/grammar.js, ou un élément). Un id que seul
   grammar.a1c.js tient est une règle déjà fondue : Split la saute, elle n'est pas fautive. */
function against(T, rules) {
  const out = [];
  rules.forEach(r => {
    const u = unitOf(T.C, r.unit);
    if (!u) out.push('rule ' + r.id + ' is listed on the unit « ' + r.unit + ' », which is not a unit of the course');
    else if (u.n !== r.n) out.push('rule ' + r.id + ' is listed on the unit « ' + r.unit + ' » as n ' + r.n + ', and the course numbers it ' + u.n);
    if (T.hand.has(r.id)) out.push('rule ' + r.id + ' is already the id of a pattern of src/content/grammar.js: an id is fixed once shipped');
    const it = T.C.byId(r.id);
    if (it) out.push('rule ' + r.id + ' is already the id of the item ' + it.id + ' « ' + it.nl + ' » of the course');
  });
  return out;
}

/* Split : un lot par unité de RULES, ses règles que le cours n'a pas encore, une ligne par règle. Une
   règle déjà fondue est dans le cours : un second Split ne la coupe pas, même nommée (le kit refuse
   alors l'id, comme pour words). L'entrée porte les mots de l'unité, que le rédacteur peut employer. */
function split(C, ctx) {
  const T = tools(ctx), problems = against(T, RULES);
  if (problems.length) throw new Error(problems.join('; '));
  const have = new Set((C.RAW.patterns || []).map(p => p.id));
  return UNIT_ORDER.map(unit => ({
    batch: unit,
    rows: RULES.filter(r => r.unit === unit && !have.has(r.id)).map(r => {
      const u = unitOf(C, unit);
      return { id: r.id, unit, n: r.n, name: u.name, teach: r.teach, words: (u.words || []).map(w => w.nl) };
    })
  })).filter(b => b.rows.length);
}

const gloss = (v, f, why) => {
  if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).sort().join() !== 'en,fr') { why.push(f + ' is { fr, en }'); return false; }
  return LANGS.every(l => oneLine(v[l]) || (why.push(f + '.' + l + ' is a text on one line with no space at either end'), false));
};

/* Un passage en HTML : ses balises contre la liste permise, leur emboîtement, et le texte qu'elles
   marquent comme néerlandais (<i class="nl">, <span class="ex">) et celui qu'elles ne marquent pas. */
function markup(s, allowed) {
  const why = [], stack = [], marked = [], plain = [], re = /<[^>]*>|[<>]/g;
  let last = 0, m;
  const put = text => { if (text) (stack.some(t => t.mark) ? marked : plain).push(text); };
  while ((m = re.exec(s))) {
    put(s.slice(last, m.index));
    last = re.lastIndex;
    const tag = m[0];
    if (allowed.indexOf(tag) < 0) { why.push(tag + ' is not a tag the sheet allows (' + allowed.join(' ') + ')'); continue; }
    if (tag[1] === '/') {
      const top = stack.pop();
      if (!top || top.name !== tag.slice(2, -1)) why.push(tag + ' closes nothing that is open');
    } else stack.push({ name: /^<(\w+)/.exec(tag)[1], mark: tag === '<i class="nl">' || tag === '<span class="ex">' });
  }
  put(s.slice(last));
  stack.forEach(t => why.push('<' + t.name + '> is never closed'));
  return { why, marked: marked.join(' '), plain: plain.join(' '), spans: (s.match(/<span class="ex">|<i class="nl">/g) || []).length };
}
const iTags = s => Array.from(String(s).matchAll(/<i(?:\s[^>]*)?>([^<]*)<\/i>/g), m => ({ tag: m[0], text: m[1] }));
const braces = s => (String(s).match(/\{[^}]*\}/g) || []).sort().join('|');

function check(row, input, ctx) {
  const why = [];
  if (!FIELDS.every(f => f in row)) return ['a row has the fields ' + FIELDS.join(', ')];
  ['title', 'rule', 'explain'].forEach(f => gloss(row[f], f, why));
  ['nl', 'fr', 'en'].forEach(f => { if (!oneLine(row[f])) why.push(f + ' is a text on one line with no space at either end'); });
  if (!Array.isArray(row.drills) || row.drills.length !== DRILLS) why.push('drills is a list of ' + DRILLS + ' sentences, not ' + (Array.isArray(row.drills) ? row.drills.length : typeof row.drills));
  else row.drills.forEach((d, j) => {
    if (!d || typeof d !== 'object' || Array.isArray(d) || Object.keys(d).sort().join() !== DRILL_FIELDS.slice().sort().join()) why.push('drill ' + (j + 1) + ' has the fields ' + DRILL_FIELDS.join(', '));
    else DRILL_FIELDS.forEach(f => { if (!oneLine(d[f])) why.push('drill ' + (j + 1) + ': ' + f + ' is a text on one line with no space at either end'); });
  });
  if (why.length) return why;

  const T = tools(ctx), U = T.NL.util, ui = T.order.indexOf(input.unit);
  const list = ws => ws.map(w => '« ' + w + ' »').join(', ');
  const unitProblems = against(T, RULES.filter(r => r.id === input.id));
  const sentences = [['nl', row.nl, row.fr, row.en]].concat(row.drills.map((d, j) => ['drill ' + (j + 1), d.nl, d.fr, d.en]));

  /* Les mots de la ligne : typographie, jetons, orthographe, noms par défaut. */
  sentences.forEach(([at, nl, fr, en]) => {
    ['nl', 'fr', 'en'].forEach((l, k) => { if (/['"]/.test([nl, fr, en][k])) why.push(at + ': ' + l + ' writes the typographic apostrophe « ’ » and no straight quote'); });
    LANGS.forEach((l, k) => { const q = strayQuotes([fr, en][k], l, []); if (q) why.push(at + ': ' + l + ' ' + q); });
    if (sig(fr) !== sig(en)) why.push(at + ': fr and en hold different digits or {…} tokens');
    if (braces(nl) !== braces(fr)) why.push(at + ': nl and fr hold different {…} tokens');
    [nl, fr, en].forEach(s => braces(s).split('|').filter(Boolean).forEach(t => { if (OK_TOKENS.indexOf(t) < 0) why.push(at + ': ' + t + ' is not a token of the course (' + OK_TOKENS.join(', ') + ')'); }));
    const bad = U.uniq(tokens(nl).filter(t => !T.S.known(t)));
    if (bad.length) why.push(at + ': ' + list(bad) + ' is not Dutch that OpenTaal or flemish.tsv knows: pick another word');
    if ([nl, fr, en].some(s => spelling.named(untoken(s), T.NL))) why.push(at + ' names no one by default');
  });
  LANGS.forEach(l => { if (/["]/.test(row.rule[l])) why.push('rule.' + l + ' writes no straight quote'); const q = strayQuotes(row.rule[l], l, []); if (q) why.push('rule.' + l + ' ' + q); });
  LANGS.forEach(l => { if (row.rule[l].length > RULE_MAX) why.push('rule.' + l + ' is ' + row.rule[l].length + ' signs, ' + RULE_MAX + ' at most: the sheet shows it on one line'); });
  ['title', 'rule', 'explain'].forEach(f => LANGS.forEach(l => { if (/'/.test(row[f][l])) why.push(f + '.' + l + ' writes the typographic apostrophe « ’ » and no straight quote'); }));
  /* Le texte de l'apprenant n'entre pas dans un champ que la feuille montre en HTML (title, explain) : il y serait lu
     comme du balisage (test/lang.js 6d.7). HTML_FIELDS en décide : rule, que la feuille cite, et les phrases, qu'elle
     échappe, gardent leurs jetons. */
  ['title', 'rule', 'explain'].forEach(f => LANGS.forEach(l => htmlTokens(f, row[f][l]).forEach(t =>
    why.push(f + '.' + l + ': ' + t + ' is the learner\'s text, and ' + f + ' is shown as HTML: write no token there'))));

  /* L'explication : quatre balises, le néerlandais marqué (et connu), aucun néerlandais hors des marques. */
  LANGS.forEach(l => {
    const t = markup(row.title[l], TITLE_TAGS);
    t.why.forEach(w => why.push('title.' + l + ': ' + w));
    const e = markup(row.explain[l], EXPLAIN_TAGS);
    e.why.forEach(w => why.push('explain.' + l + ': ' + w));
    if (row.explain[l].length > EXPLAIN_MAX) why.push('explain.' + l + ' is ' + row.explain[l].length + ' characters, ' + EXPLAIN_MAX + ' at most (the longest the course has, g-dehet): the sheet must stay readable on a phone');
    if (e.why.length) return;
    if (!e.spans) why.push('explain.' + l + ' shows no Dutch: an example goes in <span class="ex"> or <i class="nl">');
    const bad = U.uniq(tokens(e.marked).filter(x => !T.S.known(x)));
    if (bad.length) why.push('explain.' + l + ': ' + list(bad) + ' is not Dutch that OpenTaal or flemish.tsv knows');
  });
  /* Ce que test/lang.js 6d refuserait à Merge : une citation qui n'est pas du néerlandais du cours (une
     traduction va entre parenthèses, sans guillemets), et un mot du néerlandais du cours que le français
     et l'anglais écrivent nu. Le néerlandais du cours, ici, compte les phrases de la ligne : elles ne
     rejoignent le cours qu'à Merge. */
  const dutch = new Set(T.dutch);
  sentences.forEach(s => courseWords(s[1]).forEach(w => dutch.add(w)));
  const fill = s => T.NL.content.fill(s);
  ['rule', 'explain'].forEach(f => LANGS.forEach(l => {
    const r = foreignQuotes(T.NL, joined(fill(row[f][l])), dutch);
    if (!r.paired) why.push(f + '.' + l + ' has a quote mark with no partner, or an empty quote');
    r.foreign.forEach(q => why.push(f + '.' + l + ' quotes « ' + q + ' », which is not Dutch of the course: a translation goes in parentheses, with no quotes'));
  }));
  ['rule', 'explain', 'title'].forEach(f => {
    const r = bareDutch(T.NL, dutch, T.named, f, fill(row[f].fr), fill(row[f].en));
    if (r.bare.length) why.push(f + ': ' + list(r.bare) + ' is Dutch of the course, written bare in fr and in en: ' +
      (f === 'rule' ? 'quote it « … »' : 'put it in <i class="nl"> or <span class="ex">'));
  });
  const other = iTags(row.explain.en).map(i => i.text);
  iTags(row.explain.fr).forEach(i => {
    if (other.indexOf(i.text) >= 0 && !/^<i\s[^>]*class="nl"/.test(i.tag)) why.push('explain.fr: « ' + i.text + ' » is Dutch in <i>: give it class="nl"');
  });

  /* L'exemple de la règle, que l'apprenant lit en premier : l'ordre du cours, comme un exercice ; les trous
     des exercices sont ce que la règle enseigne. */
  const taught = new Set([].concat(...row.drills.map(d => tokens(d.gap))));
  const exAhead = sequence.ahead(row.nl, ui, T.first).filter(t => !taught.has(t));
  if (exAhead.length) why.push('nl « ' + row.nl + ' » borrows from a later unit: ' + exAhead.join(', '));
  const exNever = sequence.unmet(row.nl, ui, T.first, taught).filter(t => exAhead.indexOf(t) < 0);
  if (exNever.length) why.push('nl « ' + row.nl + ' » uses forms the course never teaches: ' + exNever.join(', '));

  /* Les phrases d'exercice : tuiles, trou, ordre du cours. */
  const seen = new Map();
  row.drills.forEach((d, j) => {
    const at = 'drill ' + (j + 1) + ' « ' + d.nl + ' »', ts = U.tiles(d.nl), gt = U.tiles(d.gap);
    if (ts.length < TILES.min || ts.length > TILES.max) why.push(at + ' has ' + ts.length + ' tiles: ' + TILES.min + ' to ' + TILES.max + ' (the longest the course has is ' + TILES.max + ')');
    const key = U.norm(d.nl);
    if (seen.has(key)) why.push(at + ' repeats drill ' + seen.get(key));
    else seen.set(key, j + 1);
    if (gt.length !== 1) { why.push(at + ': gap « ' + d.gap + ' » is not one tile: the cloze hides one word'); return; }
    const hits = ts.filter(t => U.norm(t) === U.norm(gt[0]));
    if (!hits.length) { why.push(at + ': gap « ' + d.gap + ' » is not a tile of the drill'); return; }
    if (hits.length > 1) { why.push(at + ': gap « ' + d.gap + ' » occurs ' + hits.length + ' times in the drill: the cloze hides the first, and the learner cannot tell which'); return; }
    if (d.gap.toLowerCase() !== gt[0].toLowerCase()) why.push(at + ': gap « ' + d.gap + ' » carries punctuation the tile does not');
    const cloze = T.NL.ex.get('cloze').build({ unit: input.unit, drills: [d] });
    if (U.norm(cloze.gap) !== U.norm(d.gap) || cloze.shown === d.nl) why.push(at + ': the cloze cannot hide the gap « ' + d.gap + ' »');
    /* Rien que le cours n'enseigne pas à l'unité de la règle ; le trou, lui, est ce que la règle enseigne. */
    const gap = new Set(tokens(d.gap));
    const ahead = sequence.ahead(d.nl, ui, T.first).filter(t => !gap.has(t));
    if (ahead.length) why.push(at + ' borrows from a later unit: ' + ahead.join(', '));
    const never = sequence.unmet(d.nl, ui, T.first, gap).filter(t => ahead.indexOf(t) < 0);
    if (never.length) why.push(at + ' uses forms the course never teaches: ' + never.join(', '));
  });
  /* Une phrase qu'une autre règle écrit déjà : une règle plus haut dans RULES, dans un autre lot (son
     draft.json, retry.json au lieu de la ligne du même id), ou un pattern du cours (les 9 de grammar.js
     et les règles fondues). Des lots rédigés en parallèle ne se voient pas : write refuse alors au Merge. */
  const taken = new Map();
  T.C.RAW.patterns.filter(p => p.id !== input.id).forEach(p => [p.nl].concat((p.drills || []).map(d => d.nl)).forEach(s => { if (!taken.has(U.norm(s))) taken.set(U.norm(s), p.id); }));
  if (ctx.kindDir) otherRows(ctx.kindDir, input.id).sort((a, b) => RULES.findIndex(r => r.id === a.id) - RULES.findIndex(r => r.id === b.id)).forEach(o => {
    if (RULES.findIndex(r => r.id === o.id) < RULES.findIndex(r => r.id === input.id)) [o.nl].concat(o.drills.map(d => d.nl)).forEach(s => { if (!taken.has(U.norm(s))) taken.set(U.norm(s), o.id); });
  });
  sentences.forEach(([at, nl]) => { const o = taken.get(U.norm(nl)); if (o) why.push(at + ' « ' + nl + ' » is also written by ' + o); });
  unitProblems.forEach(w => why.push(w));
  return why;
}

/* Les lignes écrites des autres lots du genre : draft.json de chaque dossier frère, retry.json au lieu
   de la ligne du même id. Un fichier absent ou illisible n'en donne aucune : le kit le refuse à son tour. */
function otherRows(kindDir, self) {
  const rows = new Map(), read = f => { try { const v = JSON.parse(fs.readFileSync(f, 'utf8')); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  fs.readdirSync(kindDir, { withFileTypes: true }).filter(e => e.isDirectory()).forEach(e => ['draft.json', 'retry.json'].forEach(n =>
    read(path.join(kindDir, e.name, n)).forEach(r => { if (r && r.id && r.id !== self && Array.isArray(r.drills) && r.drills.every(d => d && typeof d.nl === 'string') && typeof r.nl === 'string') rows.set(r.id, r); })));
  return Array.from(rows.values());
}

/* Le texte du fichier : l'en-tête, les patterns dans l'ordre de RULES, puis la boucle qui range chaque
   règle dans l'unité qui la liste. Une unité absente la fait échouer au chargement, avec l'id de la
   règle : sinon un pattern qu'aucune unité ne liste n'est jamais construit, et rien ne le dit. */
const pair = g => '{ fr: ' + lit(g.fr) + ', en: ' + lit(g.en) + ' }';
const HEADER = [
  '/* Règles de grammaire des unités 13 à 34. Même forme que grammar.js.',
  '   Écrit par la fusion du genre grammar (tools/content/kinds/grammar.js) depuis ses lignes prises :',
  '   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Les unités de',
  '   lexicon.a1c.js gardent grammar: [] dans leur fichier ; la boucle en bas range chaque règle dans la',
  '   liste de son unité au chargement, et lève une erreur, avec l’id de la règle, quand l’unité manque. */',
  'NL.content = NL.content || {};',
  'NL.content.patterns = NL.content.patterns || [];',
  '(function () {',
  '  \'use strict\';',
  '  const D = (nl, g, gap) => ({ nl, ...NL.gloss.pair(g), gap });',
  '  const P = p => NL.content.patterns.push(p);'
];
function patterns(rules) {
  const lines = HEADER.slice();
  rules.forEach(({ rule, row, level }) => {
    lines.push('', '  P({',
      '    id: ' + lit(rule.id) + ', unit: ' + lit(rule.unit) + ', level: ' + lit(level) + ',',
      '    title: ' + pair(row.title) + ',',
      '    rule: ' + pair(row.rule) + ',',
      '    nl: ' + lit(row.nl) + ', fr: ' + lit(row.fr) + ', en: ' + lit(row.en) + ',',
      '    explain: {', '      fr: ' + lit(row.explain.fr) + ',', '      en: ' + lit(row.explain.en), '    },',
      '    drills: [');
    row.drills.forEach((d, k) => lines.push('      D(' + lit(d.nl) + ', ' + pair(d) + ', ' + lit(d.gap) + ')' + (k < row.drills.length - 1 ? ',' : '')));
    lines.push('    ]', '  });');
  });
  lines.push('', '  [' + rules.map(x => '[' + lit(x.rule.id) + ', ' + lit(x.rule.unit) + ']').join(', ') + '].forEach(r => {',
    '    const u = NL.content.units.find(x => x.id === r[1]);',
    '    if (!u) throw new Error(\'grammar.a1c.js : la règle \' + r[0] + \' veut l’unité « \' + r[1] + \' », que le cours n’a pas (lexicon.a1c.js se charge avant)\');',
    '    (u.grammar = u.grammar || []).push(r[0]);',
    '  });',
    '})();');
  return lines;
}

/* Merge : refuse, avant d'écrire, une règle sur une unité que le cours n'a pas (elle est nommée), deux
   règles qui écrivent la même phrase, et une règle déjà dans grammar.a1c.js que nulle ligne prise
   n'écrit (le fichier se récrit entier) ; puis récrit le fichier, les règles dans l'ordre de RULES.
   Relancée avec les mêmes lignes, elle le récrit à l'identique. */
function write(taken, ctx) {
  const T = tools(ctx), U = T.NL.util;
  const rules = RULES.filter(r => taken.some(x => x.id === r.id));
  const problems = against(T, rules);
  if (problems.length) throw new Error(problems.join('; '));
  const mine = new Map(), twice = [];
  taken.forEach(x => [x.row.nl].concat(x.row.drills.map(d => d.nl)).forEach(s => {
    const k = U.norm(s);
    if (mine.has(k) && mine.get(k) !== x.id) twice.push(x.id + ' and ' + mine.get(k) + ' both write « ' + s + ' »');
    else mine.set(k, x.id);
  }));
  if (twice.length) throw new Error(twice.join('; ') + ': one sentence, one rule');
  T.C.RAW.patterns.filter(p => RULES.some(r => r.id === p.id) && !T.hand.has(p.id) && !taken.some(x => x.id === p.id)).forEach(p => {
    throw new Error('grammar.a1c.js holds the rule ' + p.id + ', and no taken row writes it: Merge rewrites the file whole');
  });
  const file = path.join(ctx.repo, FILE), old = fs.readFileSync(file, 'utf8'), eol = /\r\n/.test(old) ? '\r\n' : '\n';
  const out = rules.map(r => ({ rule: r, row: taken.find(x => x.id === r.id).row, level: unitOf(T.C, r.unit).level }));
  fs.writeFileSync(file, patterns(out).map(l => l + eol).join(''));
  return ['ok grammar.a1c.js ' + out.length + ' rules in ' + new Set(out.map(x => x.rule.unit)).size + ' units'];
}

module.exports = {
  stamp: [s => s.unit, s => s.n, s => s.teach],
  fields: FIELDS,
  tables: [],
  sourceOf,
  split,
  check,
  forMaintainer: () => '',
  readWhole: () => 'course-written',
  merge: () => ({}),
  write,
  RULES,
  TILES,
  patterns
};
