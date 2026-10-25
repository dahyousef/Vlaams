/* Le genre flemish : la forme flamande des mots et des phrases qui n'en ont pas encore. La tâche
   « FAN flemish » du plan en écrit les lignes ; ce module les coupe, les vérifie et les fond
   (tools/content/lib/kit.js). Une ligne porte deux champs :
     be        la forme flamande, ou null quand un collègue flamand dit la forme standard. Un mot
               peut en donner plusieurs, séparées par « , », la flamande d'abord : c'est elle que
               « Comment le dit-on ici ? » demande.
     evidence  ce qui l'atteste, null quand be l'est :
                 rule:<règle>[+<règle>…]   les règles de RULES, dans leur ordre, une fois chacune :
                                           be est exactement ce qu'elles font du néerlandais
                 wiktionary:<lemme>        un lemme que le Wiktionnaire anglais marque belge ou
                                           flamand (tools/content/kaikki.js), et que be emploie
                 none                      rien de cela : la ligne va au mainteneur
   Merge pose be dans src/content/be.js, sous le néerlandais, et inscrit dans
   test/data/flemish.tsv chaque forme de be qu'OpenTaal ne connaît pas, avec la raison que sa
   preuve donne. Les lignes imprimées sont en anglais, comme celles du kit. */
const fs = require('fs'), path = require('path');
const kaikki = require('../kaikki');
const spelling = require(path.join(__dirname, '..', '..', '..', 'test', 'lib', 'spelling'));

/* Un mot entier : ni lettre, ni apostrophe, ni trait d'union de part et d'autre. Les formes
   remplacent les mots dans l'ordre donné, et gardent la majuscule du premier ; une forme qui
   commence par une apostrophe (’t) la passe au mot suivant : « ’t Regent weer. ». */
const EDGE = 'A-Za-zÀ-ÿ’\'-';
const CAP = '\u0001';
function swapper(swaps) {
  const steps = swaps.map(([from, to]) => {
    const re = new RegExp('(?<![' + EDGE + '])' + from.split(' ').join('\\s+') + '(?![' + EDGE + '])', 'gi');
    const upper = /^[a-z]/.test(to) ? to[0].toUpperCase() + to.slice(1) : to + CAP;
    return s => s.replace(re, m => (m[0] === m[0].toLowerCase() ? to : upper));
  });
  return s => steps.reduce((t, step) => step(t), s)
    .replace(new RegExp(CAP + '(\\s*)(\\S)', 'g'), (m, sp, c) => sp + c.toUpperCase()).split(CAP).join('');
}

/* Les règles « kunde » et « ge » : un verbe inversé et son sujet, « u » ou « je ». Elles n'écrivent
   que là où l'inversion est sûre, dans une question (la phrase finit par « ? ») dont le verbe vient
   en tête, ou derrière le mot qui la pose, tout de suite ou plus loin (« Hoe zeg je dat? », « Welke
   maat heeft u? »), au besoin après « en », « maar » ou une préposition (« Om hoe laat kom je? ») ;
   « wie » ne compte que derrière une préposition (« Met wie ga je? »). Ailleurs, « je » peut être le
   complément (« Dat doet je goed », « Wie heeft je geholpen? ») : elles n'écrivent rien plutôt qu'une
   forme fausse, et le rédacteur écrit la ligne. De même quand un « je », un « u » ou un « zich »
   reste (« Weet u welke maat u hebt? », « Kunt u zich omdraaien? ») : « ge » ne va ni avec « je » ni
   avec « zich », et elles ne savent pas écrire l'autre « u ». */
const OPEN = '(?:^|[.?!;:,]\\s+|[„“"«(–—]\\s*)';
const ASKS = 'hoe hoelang hoeveel hoever hoezo waar waarom waarheen waarmee waarover waarvan waarvoor vanwaar wanneer wat welk welke';
const PREPS = 'aan achter bij door in met na naar naast om onder op over sinds tegen tot tussen uit van vanaf voor zonder';
const oneOf = words => '(?:' + words.split(' ').join('|') + ')';
const HEAD = new RegExp(OPEN + '$');
const ASKED = new RegExp(OPEN + '(?:(?:en|maar)\\s+)?(?:(?:' + oneOf(PREPS) + '\\s+)?' + oneOf(ASKS) + '|' + oneOf(PREPS) + '\\s+wie)(?![' + EDGE + '])[^.?!]*$', 'i');
const LEFTOVER = new RegExp('(?<![' + EDGE + '])' + oneOf('je jij jou jouw jouwe jezelf u uzelf zich') + '(?![' + EDGE + '])', 'i');
function inverted(s, at) {
  const end = /[?!]|\.(?=\s|$)/.exec(s.slice(at));
  return Boolean(end) && end[0] === '?' && (HEAD.test(s.slice(0, at)) || ASKED.test(s.slice(0, at)));
}

/* Le verbe doit avoir la forme que son sujet lui donne : « doe je », « doet u », jamais « doet je »,
   où « je » est le complément. La liste est fermée : derrière un verbe qu'elle ne tient pas
   (« fiets je »), la règle ge n'écrit rien. Chaque verbe : sa forme en t avec « ge », ses formes
   avec « je » inversé, ses formes avec « u ». */
const T_FORM = {}, TAKES = { je: {}, u: {} };
[['doet', 'doe', 'doet'], ['hebt', 'heb', 'hebt heeft'], ['zijt', 'ben', 'bent'], ['gaat', 'ga', 'gaat'],
  ['komt', 'kom', 'komt'], ['kunt', 'kun kan', 'kunt kan'], ['wilt', 'wil', 'wilt wil'], ['zult', 'zul zal', 'zult zal'],
  ['moet', 'moet', 'moet'], ['weet', 'weet', 'weet'], ['zegt', 'zeg', 'zegt'], ['spreekt', 'spreek', 'spreekt'],
  ['heet', 'heet', 'heet'], ['ziet', 'zie', 'ziet'], ['woont', 'woon', 'woont'], ['werkt', 'werk', 'werkt'],
  ['vindt', 'vind', 'vindt'], ['neemt', 'neem', 'neemt'], ['drinkt', 'drink', 'drinkt'], ['eet', 'eet', 'eet']]
  .forEach(([t, je, u]) => [['je', je], ['u', u]].forEach(([p, forms]) => forms.split(' ').forEach(f => { TAKES[p][f] = t; T_FORM[f] = t; })));
const PAIR = new RegExp('(?<![' + EDGE + '])(' + Object.keys(T_FORM).join('|') + ')\\s+(u|je)(?![' + EDGE + '])', 'gi');
const sameCase = (like, w) => (like[0] === like[0].toLowerCase() ? w : w[0].toUpperCase() + w.slice(1));

/* Une règle qui écrit, pour chaque verbe inversé et son sujet, ce que `write` en fait : write(verbe,
   sujet, la suite du texte), null pour n'y rien changer. Le « u » de « a.u.b. » ne compte pas. */
function inversions(write) {
  return s => {
    const out = s.replace(PAIR, (m, verb, pron, at) => {
      const w = inverted(s, at) ? write(verb.toLowerCase(), pron.toLowerCase(), s.slice(at + m.length)) : null;
      return w ? sameCase(verb, w) : m;
    });
    return LEFTOVER.test(out.replace(/a\.u\.b\./gi, '')) ? s : out;
  };
}
const CONTRACT = { 'kunt u': 'kunde', 'kun je': 'kunde', 'hebt u': 'hebde', 'heeft u': 'hebde', 'heb je': 'hebde', 'bent u': 'zijde', 'ben je': 'zijde' };
const kunde = inversions((verb, pron) => CONTRACT[verb + ' ' + pron]);

/* Derrière une forme que « je » partage avec « u », et donc avec « hij » (« kan », « weet »,
   « heet »…), « je » peut aussi être « ton » : « Hoe heet je zus? ». La règle ge ne l'y change
   que si le mot suivant ne peut pas suivre « ton » : la fin de la phrase, une majuscule, ou un
   mot de FREE. « u » seul ou « je » seul devient « ge ». */
const FREE = new Set([ASKS, PREPS, 'wie via me mij hem ze ons hen hun het \'t ’t dat dit die deze of iets niets niks ' +
  'iemand niemand alles er daar hier nog niet echt ook al wel toch eens even graag zeker misschien eigenlijk nu dan ' +
  'zo heel erg meer liever beter goed altijd nooit ooit soms vaak morgen vandaag vanavond straks later eerst weer ' +
  'nou anders precies toevallig alsjeblieft ergens veel een de geen zo\'n zo’n mijn zijn onze mee weg terug thuis ' +
  'samen alleen zelf'].join(' ').split(' '));
function free(rest) {
  const next = /^\s*([^\s?!.,;:"»)]*)/.exec(rest)[1];
  return !next || /^[A-ZÀ-Ý]/.test(next) || FREE.has(next.toLowerCase());
}
const geInversions = inversions((verb, pron, rest) => {
  const t = TAKES[pron][verb];
  if (!t) return null;
  return pron === 'je' && TAKES.u[verb] && !free(rest) ? null : t + ' ge';
});
const ge = s => (/^(u|je)$/i.test(s) ? sameCase(s, 'ge') : geInversions(s));

/* Les six règles du flamand parlé, dans l'ordre où elles s'appliquent : « kunde » avant « ge »,
   puisque « kunt u » est un tout. `why` donne, pour chaque forme qu'une règle écrit, la raison
   que flemish.tsv inscrit quand OpenTaal ne la connaît pas ; `verbs`, les formes en t que la
   règle ge donne aux verbes, du néerlandais qu'OpenTaal tient. */
const RULES = [
  { name: 'kunde', apply: kunde,
    why: { kunde: '« kunt ge » contracté, flamand parlé', hebde: '« hebt ge » contracté, flamand parlé', zijde: '« zijt ge » contracté, flamand parlé' } },
  { name: 'ge', apply: ge, verbs: T_FORM, why: { ge: 'flamand parlé pour « u » et « je »' } },
  { name: 'da', apply: swapper([['dat is', 'da’s'], ['dat', 'da'], ['wat', 'wa']]), why: { da: 'flamand parlé pour « dat »', wa: 'flamand parlé pour « wat »' } },
  { name: 'nie', apply: swapper([['niet', 'nie']]), why: { nie: 'flamand parlé pour « niet »' } },
  { name: 't', apply: swapper([['het', '’t']]), why: {} },
  { name: 'is', apply: swapper([['eens', 'is']]), why: { is: 'flamand parlé pour « eens »' } }
];
const NONE_WHY = 'forme flamande sans source écrite, gardée par le mainteneur';
const rank = name => RULES.findIndex(r => r.name === name);

/* Le néerlandais où les règles nommées s'appliquent, dans l'ordre de RULES : { text, idle },
   idle les règles qui n'y changent rien. */
function compose(nl, names) {
  const idle = [];
  const text = RULES.filter(r => names.indexOf(r.name) >= 0).reduce((s, r) => {
    const out = r.apply(s);
    if (out === s) idle.push(r.name);
    return out;
  }, nl);
  return { text, idle };
}

/* Ce que les règles font d'un néerlandais : une entrée par combinaison où chaque règle change
   quelque chose, sous la preuve qui la cite, les plus courtes d'abord. */
function outputs(nl) {
  const live = RULES.filter(r => r.apply(nl) !== nl).map(r => r.name);
  const sets = [];
  for (let mask = 1; mask < (1 << live.length); mask++) sets.push(live.filter((n, k) => mask & (1 << k)));
  const out = {};
  sets.sort((a, b) => a.length - b.length).forEach(names => {
    const c = compose(nl, names);
    if (!c.idle.length) out['rule:' + names.join('+')] = c.text;
  });
  return out;
}

/* Ce qu'une forme laisse de trop peu à apprendre, en anglais comme Check le dit ; '' sinon. Une
   phrase garde trois tuiles, ou toutes celles du néerlandais s'il en a moins. Un mot dont seul
   l'article change (« ’t hoofd ») n'apprend rien de flamand : tout le monde le dit ainsi. */
function thin(form, src, U) {
  if (src.kind === 'phrase') {
    const want = Math.min(3, U.tiles(src.nl).length), n = U.tiles(form).length;
    return n < want ? 'be has ' + n + ' tiles: a phrase\'s be has at least ' + want : '';
  }
  const t = RULES[rank('t')].apply(src.nl);
  return t !== src.nl && U.norm(form.split(',')[0].trim()) === U.norm(t)
    ? 'only the article changes, « ’t » for « het »: everyone says that, so be is null' : '';
}

/* Les sorties des règles que Split offre pour une source : celles que thin laisse passer
   (« Dat is klaar. » n'offre pas « Da’s klaar. », « het hoofd » n'offre pas « ’t hoofd »). */
function offered(s, U) {
  const out = outputs(s.nl);
  Object.keys(out).forEach(e => { if (thin(out[e], s, U)) delete out[e]; });
  return out;
}

/* La raison qu'une forme de be prend dans flemish.tsv, selon la preuve ; null quand la preuve
   n'en rend pas compte. */
function reasonOf(token, evidence) {
  const form = spelling.stem(token);
  if (evidence === 'none') return NONE_WHY;
  if (/^rule:/.test(evidence)) {
    const r = evidence.slice(5).split('+').map(n => RULES[rank(n)]).find(x => x && x.why[form]);
    return r ? r.why[form] : null;
  }
  const lemma = evidence.slice('wiktionary:'.length);
  return spelling.tokens(lemma).some(l => form.indexOf(l) === 0)
    ? 'belgicisme : le Wiktionnaire anglais marque « ' + lemma + ' » belge' : null;
}

/* L'orthographe et l'extrait du Wiktionnaire, lus une fois par lecture d'un lot. */
const memo = new WeakMap();
function tools(ctx) {
  if (!memo.has(ctx)) {
    const NL = ctx.course().NL;
    let belgian = null;
    memo.set(ctx, {
      NL,
      S: spelling.open(ctx.repo, NL),
      belgian: () => {
        if (!belgian) {
          try { belgian = { map: kaikki.belgian(ctx.repo) }; } catch (e) { belgian = { error: e.message }; }
        }
        return belgian;
      }
    });
  }
  return memo.get(ctx);
}

const EVIDENCE = /^(rule:[a-z]+(\+[a-z]+)*|wiktionary:\S(.*\S)?|none)$/;
const slots = s => (s.match(/\{[a-z]+\}/g) || []).sort().join(' ');

/* Split : un lot par unité, dans l'ordre du cours ; une ligne par mot ou phrase que be.js ne
   tient pas (le null que le lexique garde devant une note n'est pas une forme). */
function split(C) {
  const G = C.NL.gloss, U = C.NL.util;
  const batches = [];
  C.RAW.units.forEach(u => {
    const rows = C.sources.filter(s => s.unit === u.id && !s.be).map(s => ({
      id: s.id,
      nl: s.nl,
      kind: s.kind,
      unit: s.unit,
      meaning: G.meaning(s),
      siblings: C.sources.filter(o => o !== s && G.sameSense(s, o)).map(o => ({ nl: o.nl, be: o.be || null })),
      rules: offered(s, U)
    }));
    batches.push({ batch: u.id, rows });
  });
  return batches;
}

function check(row, input, ctx) {
  const be = row.be, evidence = row.evidence;
  if (be === null) return evidence === null ? [] : ['evidence is null when be is null'];
  if (typeof be !== 'string' || !be.trim() || be !== be.trim() || /\n/.test(be)) return ['be is a form on one line, or null'];
  if (typeof evidence !== 'string' || !EVIDENCE.test(evidence)) return ['evidence is rule:<rule>[+<rule>…], wiktionary:<lemma> or none'];
  const T = tools(ctx), U = T.NL.util, why = [];

  if (U.norm(be) === U.norm(input.nl)) why.push('be is the Dutch itself: with nothing Flemish to teach, be is null');
  if (input.kind === 'word') {
    const forms = be.split(',').map(f => f.trim());
    if (forms.some(f => !f) || new Set(forms.map(U.norm)).size < forms.length) why.push('a word\'s forms are separated by commas, none empty, none twice');
    else if (forms.length > 1 && U.norm(forms[0]) === U.norm(input.nl)) why.push('a word\'s first form is the Flemish one, and here it is the Dutch itself');
  }
  const little = thin(be, input, U);
  if (little) why.push(little);
  if (slots(be) !== slots(input.nl)) why.push('be keeps the Dutch\'s {…} tokens: « ' + slots(input.nl) + ' »');

  if (/^rule:/.test(evidence)) {
    const names = evidence.slice(5).split('+');
    const unknown = names.filter(n => rank(n) < 0);
    if (unknown.length) why.push('no rule « ' + unknown.join(', ') + ' »: the rules are ' + RULES.map(r => r.name).join(', '));
    else if (names.some((n, k) => k && rank(n) <= rank(names[k - 1]))) why.push('rules are cited once each, in the order ' + RULES.map(r => r.name).join(', '));
    else {
      const c = compose(input.nl, names);
      if (c.idle.length) why.push('rule ' + c.idle.join(', ') + ' changes nothing here');
      else if (c.text !== be) why.push(evidence + ' gives « ' + c.text + ' », not be');
    }
  } else if (/^wiktionary:/.test(evidence)) {
    const lemma = evidence.slice('wiktionary:'.length), B = T.belgian();
    if (B.error) why.push(B.error);
    else if (!B.map.has(lemma)) why.push('« ' + lemma + ' » has no Belgian or Flemish sense in the pinned Wiktionary extract');
    else if (!spelling.tokens(lemma).every(l => spelling.tokens(be).some(t => t.indexOf(l) === 0))) why.push('be does not use the lemma « ' + lemma + ' »');
  }

  const seen = new Set();
  spelling.tokens(be).forEach(t => {
    if (seen.has(t)) return;
    seen.add(t);
    if (!T.S.known(t) && reasonOf(t, evidence) === null) {
      why.push('« ' + t + ' » is not a form OpenTaal knows, and ' + evidence + ' does not account for it: correct it, or cite evidence none');
    }
  });
  return why;
}

/* flemish.tsv récrit : ses commentaires d'abord, puis ses formes et les nouvelles, triées par
   unités de code ; ses fins de ligne gardées. */
function write(taken, ctx) {
  const file = path.join(ctx.repo, 'test', 'data', 'flemish.tsv');
  const S = tools(ctx).S;
  const added = new Map();
  taken.filter(x => x.row.be !== null).forEach(x => spelling.tokens(x.row.be).forEach(t => {
    const form = spelling.stem(t);
    if (S.known(t) || added.has(form)) return;
    const why = reasonOf(t, x.row.evidence);
    if (why === null) throw new Error(x.id + ': « ' + t + ' » has no reason from ' + x.row.evidence + ': run Check');
    added.set(form, why);
  }));
  const names = [...added.keys()].sort();
  if (names.length) {
    const text = fs.readFileSync(file, 'utf8'), eol = /\r\n/.test(text) ? '\r\n' : '\n';
    const lines = text.split(/\r?\n/).filter(Boolean);
    const forms = lines.filter(l => l[0] !== '#').concat(names.map(n => n + '\t' + added.get(n)));
    fs.writeFileSync(file, lines.filter(l => l[0] === '#').concat(forms.sort()).map(l => l + eol).join(''));
  }
  return ['ok flemish.tsv ' + names.length + ' added' + (names.length ? ': ' + names.join(', ') : '')];
}

/* Le tampon couvre be : une forme qu'une autre tâche donnerait à une source entre Split et Merge
   rend sa ligne périmée. Merge écrit be lui-même, donc le relancer après un succès le refuse aussi :
   une tâche de fusion ne le lance qu'une fois. */
module.exports = {
  stamp: ['meaning', 'be'],
  fields: ['be', 'evidence'],
  tables: ['be'],
  split,
  check,
  forMaintainer: row => (row.evidence === 'none' ? 'evidence none' : ''),
  merge: row => ({ be: row.be === null ? undefined : row.be }),
  write,
  readWhole: row => (row.be === null ? '' : 'new be'),
  RULES,
  compose,
  outputs
};
