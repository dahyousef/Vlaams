/* Le genre scenarios : les conversations que le cours n'a pas encore (CONVERSATIONS, les 4 de la
   phase 4b). La tâche « FAN conversations » du plan en écrit les lignes ; ce module les coupe, les
   vérifie et les fond (tools/content/lib/kit.js). Sa source n'est pas un élément du cours mais une
   conversation à venir (sourceOf) : une ligne est un scénario entier, que le rédacteur écrit d'après
   la situation de CONVERSATIONS. Dans le code c'est un scénario ; l'apprenant et le glossaire disent
   « conversation ».
   Une ligne écrite porte six champs :
     icon    un ou deux caractères hors ASCII (un pictogramme)
     title, place, blurb, outro   chacun { fr, en }
     steps   les étapes, dans l'ordre. Une étape est { them: { nl, fr, en, be } } (l'autre parle, en
             audio) ou { you: { ask: { fr, en }, choices: [...], hint: null | { fr, en } } } ; un
             choix est { nl, fr, en, reply: null | { nl, fr, en, be }, note: null | { fr, en } }
   Le scénario n'a ni unité ni filtre (D22) : unit et n de CONVERSATIONS disent au rédacteur dans
   quel vocabulaire puiser, et rien ne le vérifie. Merge n'écrit aucune table : son write récrit
   src/content/scenarios.a1c.js entier, depuis CONVERSATIONS et les lignes prises. L'empreinte ne
   couvre rien que Merge écrive : relancée, elle récrit le même fichier. Les lignes imprimées sont
   en anglais, comme celles du kit. */
const fs = require('fs'), path = require('path');
const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));
const { literal: lit } = require('../lib/table');
const { oneLine, sig, quotes, strayQuotes } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'text'));
const { dutchWords, courseWords } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'dutch'));
const { names, foreignQuotes, bareDutch, htmlTokens } = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'quoted'));

/* Les 4 conversations (phase 4b, approuvées le 28 octobre 2026), dans l'ordre où le fichier les écrit.
   Leurs ids se rangent dans scenariosDone de chaque apprenant : ils ne changent plus. s-afspraak est
   rangée sous leven (D21) : praten ne liste que leven et werk, et son unité est beide. place est la
   consigne en anglais du rédacteur (la ligne la reçoit sous setting : son propre place est le lieu
   de l'écran). */
const CONVERSATIONS = [
  { id: 's-cafe', unit: 'cafe', n: 21, track: 'leven', place: 'a Flemish café, a table on the terrace on a Saturday afternoon',
    situation: 'The waiter (de ober) and the learner, who is with a friend. The learner must get a drink and something to eat, ask what the waiter recommends or whether a dish is vegetarian, and pay: say that the bill is wanted, pay by card or in cash, and decide about the tip (de fooi). Cover, in order: the waiter comes for the order; the learner orders; the waiter checks or offers something; the learner asks for the bill and pays. Use the café words of unit 21 and the Flemish forms a waiter really says.' },
  { id: 's-afspraak', unit: 'afspraak', n: 30, track: 'leven', place: 'on the phone with a doctor’s or hairdresser’s reception, a weekday morning',
    situation: 'A receptionist and the learner, on the phone. The learner must move an appointment: give their name ({naam}), say that the appointment of the day does not suit, ask for another day, accept a new time, and have it confirmed. There is no face to read, so each turn is short and clear. Cover, in order: the receptionist answers; the learner says why they call; the receptionist offers a slot; the learner accepts or asks for another and closes. Use the phone and appointment words of unit 30 (bellen, verplaatsen, afzeggen, de agenda, beschikbaar).' },
  { id: 's-school', unit: 'school', n: 29, track: 'leven', place: 'the school gate, the end of a school day, with the child’s teacher (de juf)',
    situation: 'The juf (the child’s teacher) and the learner, a parent, at the gate when the children come out. The learner must greet the juf, ask how the child did today, and say one practical thing: the child is ill tomorrow, or someone else will fetch the child, or a note about homework. Cover, in order: the juf greets the parent; the parent asks how it went; the juf answers with one concrete thing about the day; the parent says the practical thing and the juf acknowledges it. Use the school words of unit 29 (de juf, de klas, het huiswerk, de opvang).' },
  { id: 's-gemeente', unit: 'stad', n: 25, track: 'leven', place: 'the town hall counter in {stad}, a weekday morning',
    situation: 'A clerk at the counter of the town hall (het gemeentehuis) of {stad} and the learner. The learner must get one administrative thing done, for example ask for a document and be told what to bring, or hand in a form and hear when it will be ready. Cover, in order: the clerk asks what the learner needs; the learner says it; the clerk asks for a paper or an extra detail; the learner answers and asks when it will be ready. Use the town words of unit 25 (de post, de bank, het plein) and polite counter Dutch with u.' }
];

const SCENARIOS = path.join('src', 'content', 'scenarios.a1c.js');
const TOKENS = ['naam', 'stad', 'bedrijf'];

/* La source d'une ligne : sa conversation, dont nl est l'id (l'empreinte la lit), et fr et en la consigne
   de lieu (l'outil de lecture les montre ; l'empreinte ne les lit pas). La conversation n'est pas encore
   dans le cours quand Split coupe ; elle y est après Merge, et l'empreinte ne change pas. */
const sourceOf = (C, id) => {
  const c = CONVERSATIONS.find(x => x.id === id);
  return c ? { id: c.id, nl: c.id, fr: c.place, en: c.place, unit: c.unit, n: c.n, track: c.track, setting: c.place, situation: c.situation } : undefined;
};

/* Les ids que scenarios.a1c.js écrit : ceux de ce genre. Un id du cours qui n'y est pas est écrit à la
   main (les six), et CONVERSATIONS ne peut pas le reprendre. */
const own = repo => {
  const f = path.join(repo, SCENARIOS);
  return new Set(fs.existsSync(f) ? (fs.readFileSync(f, 'utf8').match(/^ {4}id: '[^']+'/gm) || []).map(l => l.slice(l.indexOf('\'') + 1, -1)) : []);
};
function refuseRepeats(C, repo) {
  const mine = own(repo), seen = new Set();
  CONVERSATIONS.forEach(c => {
    const had = C.RAW.scenarios.find(s => s.id === c.id);
    if (had && !mine.has(c.id)) {
      throw new Error('CONVERSATIONS id « ' + c.id + ' » is the id of the course\'s scenario « ' + c.id + ' » (' + had.title.en + '): a conversation never repeats an existing scenario\'s id');
    }
    if (seen.has(c.id)) throw new Error('CONVERSATIONS names « ' + c.id + ' » twice');
    seen.add(c.id);
  });
}

/* Split : un lot par conversation de CONVERSATIONS que le cours n'a pas encore, une ligne par lot (le
   lot porte l'id de la conversation). Après Merge, les conversations fondues sont dans le cours : un
   second Split ne coupe rien pour elles, même nommé. Ce genre ignore ctx.ids, et le kit refuse un id
   qu'il ne coupe pas. */
function split(C, ctx) {
  refuseRepeats(C, ctx.repo);
  const have = new Set(C.RAW.scenarios.map(s => s.id));
  return CONVERSATIONS.filter(c => !have.has(c.id)).map(c => ({
    batch: c.id,
    rows: [{ id: c.id, unit: c.unit, n: c.n, track: c.track, setting: c.place, situation: c.situation }]
  }));
}

/* Le cours, son orthographe, son néerlandais et les noms par défaut (pour les citations et le néerlandais nu,
   test/lib/quoted.js), lus une fois par lecture d'un lot. */
const memo = new WeakMap();
function tools(ctx) {
  if (!memo.has(ctx)) {
    const NL = ctx.course().NL;
    memo.set(ctx, { NL, S: spelling.open(ctx.repo, NL), dutch: dutchWords(NL), named: names(NL) });
  }
  return memo.get(ctx);
}

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const keysOf = (v, want) => isObj(v) && Object.keys(v).sort().join() === want.slice().sort().join();
/* Les bornes des six conversations du cours, mesurées : 2 à 4 étapes « them », 3 ou 4 « you », 2 ou
   3 choix par étape « you ». */
const THEM = [2, 4], YOU = [3, 4], CHOICES = [2, 3], LANGS = ['fr', 'en'];
const within = (n, r) => n >= r[0] && n <= r[1];

function check(row, input, ctx) {
  const why = [], T = tools(ctx), S = T.S;
  const say = (where, m) => why.push(where + ': ' + m);
  /* bad : les mots néerlandais que l'orthographe ne connaît pas. mine : le néerlandais de la ligne (nl et be),
     qui n'est pas encore dans le cours. prose : les textes { fr, en } que l'écran cite ou montre, lus plus bas. */
  const bad = new Set(), mine = new Set(), prose = [];
  /* Un texte d'une langue : sur une ligne, sans guillemet droit, guillemets de sa langue seulement et appariés,
     et pas d'autre {jeton} que ceux du cours. */
  const text = (where, s, l) => {
    if (!oneLine(s)) return say(where, 'is a text on one line with no space at either end'), false;
    const stray = l === 'nl' ? '' : strayQuotes(s, l, ['"']);
    if (stray) say(where, stray);
    else if (l !== 'nl') { const q = quotes(s, l); if (q.why) say(where, q.why); }
    if (l === 'nl' && /["«»“”]/.test(s)) say(where, 'writes no quotation mark');
    if ((l === 'nl' || l === 'fr') && /'/.test(s)) say(where, 'writes the typographic apostrophe « ’ » and no straight quote');
    (s.match(/\{[^}]*\}/g) || []).forEach(t => { if (TOKENS.indexOf(t.slice(1, -1)) < 0) say(where, 'the token ' + t + ' is not one of {naam}, {stad}, {bedrijf}'); });
    if (l === 'nl') { spelling.tokens(s).filter(t => !S.known(t)).forEach(t => bad.add(t)); courseWords(s).forEach(w => mine.add(w)); }
    return true;
  };
  /* { fr, en } : les deux sens, avec les mêmes chiffres et les mêmes {jetons}. f est le champ, que 6d lit. */
  const pair = (where, v, f) => {
    if (!keysOf(v, ['fr', 'en'])) return say(where, 'is { fr, en } and nothing else');
    const a = text(where + '.fr', v.fr, 'fr'), b = text(where + '.en', v.en, 'en');
    if (a && b && sig(v.fr) !== sig(v.en)) say(where, 'fr and en hold different digits or {…} tokens');
    if (a && b) prose.push({ where, f, v });
  };
  /* { nl, fr, en } (+ be) : une réplique de l'autre, ou un choix. */
  const line = (where, v, extra) => {
    const keys = ['nl', 'fr', 'en'].concat(extra);
    if (!keysOf(v, keys)) return say(where, 'is { ' + keys.join(', ') + ' } and nothing else');
    const a = text(where + '.nl', v.nl, 'nl'), b = text(where + '.fr', v.fr, 'fr'), c = text(where + '.en', v.en, 'en');
    if (extra.indexOf('be') >= 0) text(where + '.be', v.be, 'nl');
    if (b && c && sig(v.fr) !== sig(v.en)) say(where, 'fr and en hold different digits or {…} tokens');
    return a;
  };

  if (typeof row.icon !== 'string' || !/^[^\x00-\x7f]+$/.test(row.icon) || Array.from(row.icon).length > 2) say('icon', 'is one or two non-ASCII characters, a pictogram');
  ['title', 'place', 'blurb', 'outro'].forEach(f => pair(f, row[f], f));
  if (!Array.isArray(row.steps)) say('steps', 'is a list');
  else {
    const them = row.steps.filter(s => isObj(s) && 'them' in s).length, you = row.steps.filter(s => isObj(s) && 'you' in s).length;
    if (row.steps.length <= 2) say('steps', 'holds more than 2 steps');
    if (!within(them, THEM)) say('steps', 'holds ' + THEM[0] + ' to ' + THEM[1] + ' steps of theirs (them), like the six conversations of the course: ' + them + ' here');
    if (!within(you, YOU)) say('steps', 'holds ' + YOU[0] + ' to ' + YOU[1] + ' steps of yours (you), like the six conversations of the course: ' + you + ' here');
    row.steps.forEach((st, i) => {
      const at = 'steps[' + i + ']';
      if (!isObj(st) || Object.keys(st).length !== 1 || (!('them' in st) && !('you' in st))) return say(at, 'is { them: … } or { you: … } and nothing else');
      if (i === 0 && !st.them) say(at, 'the first step is theirs (them): the other speaks first');
      if (i > 0 && st.them && row.steps[i - 1] && row.steps[i - 1].them) say(at, 'two steps of theirs in a row: the learner answers in between');
      if (st.them) return line(at + '.them', st.them, ['be']);
      const y = st.you, w = at + '.you';
      if (!keysOf(y, ['ask', 'choices', 'hint'])) return say(w, 'is { ask, choices, hint } and nothing else');
      pair(w + '.ask', y.ask, 'ask');
      if (y.hint !== null) pair(w + '.hint', y.hint, 'hint');
      if (!Array.isArray(y.choices) || !within(y.choices.length, CHOICES)) return say(w + '.choices', 'holds ' + CHOICES[0] + ' or ' + CHOICES[1] + ' choices, like the six conversations of the course');
      const dutch = new Set();
      y.choices.forEach((c, k) => {
        const cw = w + '.choices[' + k + ']';
        if (!keysOf(c, ['nl', 'fr', 'en', 'reply', 'note'])) return say(cw, 'is { nl, fr, en, reply, note } and nothing else: reply and note are null when absent');
        line(cw, { nl: c.nl, fr: c.fr, en: c.en }, []);
        if (oneLine(c.nl) && dutch.has(c.nl)) say(cw, 'says what another choice of the step says');
        dutch.add(c.nl);
        if (c.reply !== null) line(cw + '.reply', c.reply, ['be']);
        if (c.note !== null) pair(cw + '.note', c.note, 'note');
      });
    });
  }
  /* Ce que test/lang.js 6d refuserait à Merge (lu champ par champ comme lui : ni les répliques, ni les choix, ni
     les réponses, que l'écran ne cite pas). title et place ne citent rien. Ailleurs, ce qu'une prose cite est du
     néerlandais du cours (ou de la ligne), et une traduction va entre parenthèses ; et un mot du néerlandais du
     cours que le français et l'anglais écrivent tous deux nu se cite. place ne montre pas de mot nu : {stad} y
     entre. Le texte de l'apprenant n'entre pas dans title, que l'écran montre en HTML (6d.7) : place, échappé, le
     garde. */
  const dutch = new Set(T.dutch);
  mine.forEach(w => dutch.add(w));
  const fill = s => T.NL.content.fill(s), list = a => a.map(t => '« ' + t + ' »').join(', ');
  prose.forEach(({ where, f, v }) => {
    LANGS.forEach(l => {
      htmlTokens(f, v[l]).forEach(t => say(where + '.' + l, t + ' is the learner\'s text, and ' + f + ' is shown as HTML: write no token there'));
      if (f === 'title' || f === 'place') { if (/[«»“”]/.test(v[l])) say(where + '.' + l, 'carries no quotation marks: the screen cites nothing there'); return; }
      const r = foreignQuotes(T.NL, fill(v[l]), dutch);
      if (!r.paired && !why.some(w => w.indexOf(where + '.' + l + ': ') === 0)) say(where + '.' + l, 'has a quote mark with no partner, or an empty quote');
      r.foreign.forEach(q => say(where + '.' + l, 'quotes « ' + q + ' », which is not Dutch of the course: a translation goes in parentheses, with no quotes'));
    });
    if (f === 'place') return;
    const r = bareDutch(T.NL, dutch, T.named, f, fill(v.fr), fill(v.en));
    if (r.bare.length) say(where, list(r.bare) + ' is Dutch of the course, written bare in fr and in en: quote it, or use the French or English word');
  });
  if (bad.size) {
    why.push(list(Array.from(bad)) + ' is not Dutch that OpenTaal or flemish.tsv knows: pick another word');
  }
  return why;
}

/* Le texte du fichier : l'en-tête, puis chaque conversation de CONVERSATIONS qui a une ligne prise, dans
   l'ordre. Les chaînes s'écrivent entre apostrophes droites, échappées ; l'icône en séquence \u{…}, comme
   le fichier écrit à la main. */
const pairLit = g => '{ fr: ' + lit(g.fr) + ', en: ' + lit(g.en) + ' }';
const icon = s => '\'' + Array.from(s).map(c => '\\u{' + c.codePointAt(0).toString(16).toUpperCase() + '}').join('') + '\'';
const HEADER = [
  '/* Conversations de la phase 4b. Même forme que scenarios.js, dont les aides T, Y et C sont reprises.',
  '   Écrit par la fusion du genre scenarios (tools/content/kinds/scenarios.js) depuis ses lignes prises :',
  '   une correction passe par ses lignes, jamais par ce fichier (CLAUDE.md). Elles s’ajoutent à celles de',
  '   scenarios.js ; le fichier se charge après lui et avant content/index.js. */',
  'NL.content = NL.content || {};',
  'NL.content.scenarios = NL.content.scenarios || [];',
  '(function () {',
  '  \'use strict\';',
  '  const T = (nl, g, be) => ({ them: { nl, ...NL.gloss.pair(g), be } });',
  '  const Y = (ask, choices, hint) => ({ you: { ask, choices, hint } });',
  '  const C = (nl, g, reply, note) => ({ nl, ...NL.gloss.pair(g), reply, note });',
  '  const S = o => NL.content.scenarios.push(o);'
];
function scenarios(list) {
  const lines = HEADER.slice();
  list.forEach(({ c, row }) => {
    lines.push('', '  S({',
      '    id: ' + lit(c.id) + ', track: ' + lit(c.track) + ', level: \'A1\', icon: ' + icon(row.icon) + ',',
      '    title: ' + pairLit(row.title) + ', place: ' + pairLit(row.place) + ',',
      '    blurb: ' + pairLit(row.blurb) + ',',
      '    steps: [');
    row.steps.forEach((st, i) => {
      const comma = i < row.steps.length - 1 ? ',' : '';
      if (st.them) {
        lines.push('      T(' + lit(st.them.nl) + ', ' + pairLit(st.them) + ', ' + lit(st.them.be) + ')' + comma);
        return;
      }
      const y = st.you;
      lines.push('      Y(' + pairLit(y.ask) + ', [');
      y.choices.forEach((ch, k) => {
        const args = [lit(ch.nl), pairLit(ch)];
        if (ch.reply !== null || ch.note !== null) args.push(ch.reply === null ? 'null' : '{ nl: ' + lit(ch.reply.nl) + ', fr: ' + lit(ch.reply.fr) + ', en: ' + lit(ch.reply.en) + ', be: ' + lit(ch.reply.be) + ' }');
        if (ch.note !== null) args.push(pairLit(ch.note));
        lines.push('        C(' + args.join(', ') + ')' + (k < y.choices.length - 1 ? ',' : ''));
      });
      lines.push('      ]' + (y.hint !== null ? ', ' + pairLit(y.hint) : '') + ')' + comma);
    });
    lines.push('    ],', '    outro: ' + pairLit(row.outro), '  });');
  });
  lines.push('})();');
  return lines;
}

/* Merge : refuse un id de CONVERSATIONS que le cours a écrit à la main (le cours a pu bouger depuis
   Split), avant d'écrire ; puis récrit le fichier entier, dans l'ordre de CONVERSATIONS. Le fichier peut
   déjà tenir ces conversations (Merge relancée) : il est récrit à l'identique. Une conversation qu'il tient
   et qu'aucune ligne prise n'écrit serait perdue : Merge la refuse. */
function write(taken, ctx) {
  const C = ctx.course();
  refuseRepeats(C, ctx.repo);
  const by = new Map(taken.map(x => [x.id, x]));
  own(ctx.repo).forEach(id => {
    if (!by.has(id)) throw new Error('scenarios.a1c.js holds the conversation ' + id + ', and no taken row writes it: Merge rewrites the file whole');
  });
  const list = CONVERSATIONS.filter(c => by.has(c.id)).map(c => ({ c, row: by.get(c.id).row }));
  const file = path.join(ctx.repo, SCENARIOS), old = fs.readFileSync(file, 'utf8'), eol = /\r\n/.test(old) ? '\r\n' : '\n';
  fs.writeFileSync(file, scenarios(list).map(l => l + eol).join(''));
  return ['ok scenarios.a1c.js ' + list.length + ' scenarios'];
}

module.exports = {
  stamp: [c => c.track, c => c.setting, c => c.situation],
  fields: ['icon', 'title', 'place', 'blurb', 'steps', 'outro'],
  tables: [],
  sourceOf,
  split,
  check,
  forMaintainer: () => '',
  readWhole: () => 'course-written',
  merge: () => ({}),
  write,
  CONVERSATIONS,
  scenarios
};
