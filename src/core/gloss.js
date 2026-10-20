/* Le sens et les textes : UN seul endroit les lit.
   Un élément porte son sens en deux langues côte à côte (`fr`, `en`) ; un texte
   (nom, note, règle…) est soit une chaîne française, soit une paire { fr, en }.
   Les écrans ne lisent jamais `x.fr` : ils passent par ici, et la langue lue
   est choisie en un point (`use`). Tant que personne n'appelle `use`, on lit le
   français : l'écran est celui d'avant. */
NL.gloss = (function () {
  'use strict';
  const U = NL.util;
  let lang = 'fr';

  const use = l => { lang = l === 'en' ? 'en' : 'fr'; };
  const current = () => lang;
  const other = l => l === 'en' ? 'fr' : 'en';

  /* Ce qui est lu dans `l` : une chaîne non vide, pas un trou. */
  const has = (x, l) => !!x && typeof x === 'object' && typeof x[l] === 'string' && x[l].trim() !== '';

  /* La langue dans laquelle `x` se lit : une chaîne simple est du français ;
     sinon la langue courante, ou l'autre si `x` n'a rien dans la courante. */
  function langOf(x) {
    if (typeof x === 'string') return 'fr';
    return has(x, lang) ? lang : other(lang);
  }

  /* Le texte à montrer. Une paire de texte ou un élément, indifféremment. Une
     note qui vaut `null` dans la langue lue n'a rien à dire à ce lecteur. */
  function of(x, l) {
    if (typeof x === 'string') return x;
    if (x == null) return '';
    const want = l || lang;
    if (x[want] === null) return '';
    const v = has(x, want) ? x[want] : x[other(want)];
    return typeof v === 'string' ? v : '';
  }

  const pair = g => typeof g === 'string' ? { fr: g } : { fr: g.fr, en: g.en };

  /* Le sens sans son article : « le pain » → « pain », « the bread » → « bread ».
     Une phrase garde son premier mot, comme U.bareFr. */
  function bare(item, l) {
    const w = l || langOf(item);
    const s = typeof item === 'string' ? item : (item && typeof item[w] === 'string' ? item[w] : '');
    if (w === 'fr') return U.bareFr(s);
    if (/[.!?…]\s*$/.test(s)) return s;
    return s.replace(/^(?:the|an|a)\s+(?=\S)/i, '');
  }

  /* Les sens, séparés par « / », chacun normalisé. */
  const senses = (item, l) => has(item, l)
    ? bare(item, l).split(/\s*\/\s*/).map(U.norm).filter(Boolean) : [];

  /* Même sens pour la note et les frères : un sens français commun, ou le même
     néerlandais sans article. C'est la règle d'avant, et le français seul y décide. */
  function sameSense(a, b) {
    const fa = senses(a, 'fr'), fb = senses(b, 'fr');
    if (fa.some(x => fb.indexOf(x) >= 0)) return true;
    return U.norm(U.bare(a.nl)) === U.norm(U.bare(b.nl));
  }
  /* Pour les mauvaises options : le même sens dans l'une ou l'autre langue. */
  function sameMeaning(a, b) {
    if (sameSense(a, b)) return true;
    const ea = senses(a, 'en'), eb = senses(b, 'en');
    return ea.some(x => eb.indexOf(x) >= 0);
  }

  /* Des mots français qui finissent comme un infinitif sans en être un. */
  const NOT_VERBS = ['hier', 'entre', 'contre', 'propre'];

  /* La nature du mot, grossièrement : « oui » face à « sorry / spreken / ja » se
     résout sans connaître le mot, parce qu'un verbe ne répond pas à « oui ». */
  function wordClass(x, l) {
    if (x.kind !== 'word') return x.kind;
    if (x.art) return 'noun';
    const w = l || langOf(x);
    const first = bare(x, w).split(/\s*\/\s*/)[0];
    if (w === 'en') {
      if (/^to\s+\S/.test(first) && /en$/.test(U.bare(x.nl))) return 'verb';
      return 'other';
    }
    if (/^\S+(er|ir|re|oir)$/.test(first) && first.indexOf('-') < 0 && NOT_VERBS.indexOf(first) < 0 && /en$/.test(U.bare(x.nl))) return 'verb';
    return 'other';
  }

  /* Un mot transparent : son néerlandais ressemble à son sens, dans la langue lue. */
  function cognate(item) {
    if (item.kind !== 'word') return false;
    const w = langOf(item);
    const g = w === 'en' ? bare(item, 'en').replace(/^to\s+(?=\S)/i, '') : bare(item, 'fr');
    return U.ratio(U.bare(item.nl), g) > 0.62;
  }

  return { use, current, other, has, langOf, of, pair, bare, senses, sameSense, sameMeaning, wordClass, cognate };
})();
