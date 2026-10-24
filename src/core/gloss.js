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

  /* Les langues lues, dans un ordre fixe. Un sens se copie langue par langue d'ici,
     et une troisième langue est une ligne de plus. */
  const LANGS = ['fr', 'en'];

  /* Le sens de `x`, dans chaque langue lue qu'il porte : un objet neuf. Un `null`
     reste (« rien à dire », voir `of`) ; une langue absente ne devient pas une clé. */
  function meaning(x) {
    const m = {};
    LANGS.forEach(l => { if (x && x[l] !== undefined) m[l] = x[l]; });
    return m;
  }

  const pair = g => typeof g === 'string' ? { fr: g } : meaning(g);

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

  /* Une prose du cours qui porte des exemples en néerlandais : <span class="ex"> est du néerlandais,
     et le dit à un lecteur d'écran. C'est ici, et nulle part ailleurs, que cette règle s'applique. */
  const prose = html => String(html == null ? '' : html).replace(/<span class="ex">/g, '<span class="ex"' + attr('nl') + '>');

  /* La balise de chaque langue, pour un lecteur d'écran : les langues lues et le néerlandais
     du cours. C'est la seule table : aucun autre fichier n'écrit lang="…". */
  const TAGS = { fr: 'fr', en: 'en-GB', nl: 'nl-BE' };
  /* La balise d'une langue : celle de la page (NL.lang), d'un sens, d'un passage néerlandais. */
  const tag = l => TAGS[l];
  /* L'attribut lang d'une langue, espace compris : attr('nl') pour du néerlandais. */
  const attr = l => ' lang="' + tag(l) + '"';
  /* L'attribut lang d'un sens ou d'un texte montré : la langue où il se lit. */
  const langAttr = x => attr(langOf(x));

  return { LANGS, TAGS, prose, use, current, other, has, langOf, tag, attr, langAttr, of, meaning, pair, bare, senses, sameSense, sameMeaning, wordClass, cognate };
})();
